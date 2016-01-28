import { default as isomorphicFetch } from 'isomorphic-fetch';

import TaskManager from './TaskManager';

const API_URL = window.__env.API_URL;

const taskManager = new TaskManager();

export function fetch(urlPath, options) {
  const completeUrl = API_URL + urlPath;
  return isomorphicFetch(completeUrl, options);
}

export function httpRequest(method, urlPath, formData, completeEvent, uploadEvents) {
  const completeUrl = API_URL + urlPath;
  var request = new XMLHttpRequest();
  request.onload = completeEvent(request);

  uploadEvents.forEach((event) =>
    request.upload.addEventListener(event.type, event.function, false)
  );
  request.open(method, completeUrl, true);
  request.send(formData);
}

export function pollForChainTaskResult(taskIds, taskType, dispatcherParams, dispatcher, progressDispatcher, interval=400, limit=300, counter=0) {
  return dispatch => {
    return dispatch(pollForTasks(taskIds, taskType, dispatcherParams, dispatcher, progressDispatcher, interval, limit, counter));
  };
}

function revokeTasks(taskIds) {
  const completeUrl = API_URL + '/tasks/v1/revoke';

  var options = {
    headers: { 'Content-Type': 'application/json' },
    method: 'post',
    body: JSON.stringify({ 'task_ids': taskIds })
  };

  taskManager.removeTasks(taskIds);

  return isomorphicFetch(completeUrl, options).then(response => response.json());
}

function pollForTasks(taskIds, taskType, dispatcherParams, dispatcher, progressDispatcher, interval, limit, counter) {
  const otherTasks = taskManager.addTasks(taskIds, taskType);
  if (otherTasks.length) {
    revokeTasks(otherTasks);
  }

  const completeUrl = API_URL + '/tasks/v1/result';

  var options = {
    headers: { 'Content-Type': 'application/json' },
    method: 'post',
    body: JSON.stringify({ 'task_ids': taskIds })
  };

  return dispatch => {
    return isomorphicFetch(completeUrl, options)
      .then(response => response.json())
      .then(function(data) {
        if (data.state == 'SUCCESS') {
          taskManager.removeTasks(taskIds);
          dispatch(dispatcher(dispatcherParams, data.result));
        } else if (counter > limit) {
          revokeTasks(taskIds).then((revokeData) => {
            dispatch(dispatcher(dispatcherParams, { ...data.result, error: 'Took too long to get visualizations.' }));
          });
        } else {
          if (progressDispatcher) {
            dispatch(progressDispatcher(data));
          }
          if (taskManager.getTasks(taskIds).length > 0) {
            setTimeout(function() { dispatch(pollForTasks(taskIds, taskType, dispatcherParams, dispatcher, progressDispatcher, interval, limit, counter + 1)) }, interval);
          }
        }
      });
  };
}