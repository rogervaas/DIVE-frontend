import React, { Component, PropTypes } from 'react';
import styles from './Landing.sass';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import DocumentTitle from 'react-document-title';
import { createProject, fetchPreloadedProjects, fetchUserProjects, wipeProjectState } from '../../actions/ProjectActions';

import ProjectButton from '../Base/ProjectButton';
import RaisedButton from '../Base/RaisedButton';
import Loader from '../Base/Loader';
import Footer from './Footer';


export class PreloadedProjectListPage extends Component {
  componentWillMount() {
    const { projects, userId } = this.props;
    this.props.fetchPreloadedProjects(userId);
    this.props.fetchUserProjects(userId);
  }

  componentWillReceiveProps(nextProps) {
    const nextProjectId = nextProps.project.properties.id;
    const nextUserId = nextProps.userId;

    if (this.props.project.properties.id != nextProjectId) {
      this.props.wipeProjectState();
      this.props.push(`/project/${ nextProjectId }/dataset/upload`);
    }

    if (this.props.userId != nextUserId) {
      nextProps.fetchPreloadedProjects(nextUserId);
      if (nextUserId) {
        nextProps.fetchUserProjects(nextUserId);
      }
    }
  }

  _onUploadClick() {
    const userId = this.props.userId;
    const projectTitle = 'Project Title';
    const projectDescription = 'Project Description'
    this.props.createProject(userId, projectTitle, projectDescription);
  }

  render() {
    const { projects, userId, user } = this.props;
    const { userProjects, preloadedProjects, isFetchingPreloadedProjects } = projects;

    return (
      <DocumentTitle title='DIVE | Projects'>
        <div className={ styles.centeredFill }>
          <div className={ styles.ctaBox }>
            <div className={ styles.ctaContainer }>
              <RaisedButton
                label="Create Project"
                primary={ true }
                onClick={ this._onUploadClick.bind(this) }
                className={ styles.uploadButton } />
            </div>
          </div>
          { !isFetchingPreloadedProjects && preloadedProjects.length > 0 &&
            <div className={ styles.projectsContainer + ' ' + styles.myProjectsContainer }>
              <div className={ styles.projectListContainer }>
                { projects.isFetching &&
                  <div className={ styles.watermark }>Fetching projects...</div>
                }
                { preloadedProjects.reverse().map((project) =>
                  <ProjectButton project={ project } key={ `project-button-id-${ project.id }` }/>
                )}
              </div>
            </div>
          }
          { !isFetchingPreloadedProjects && preloadedProjects.length == 0 &&
            <div className={ styles.projectsContainer + ' ' + styles.myProjectsContainer }>
              <div className={ styles.watermark }>
                No preloaded projects exist &#x2639;
              </div>
            </div>
          }
          { isFetchingPreloadedProjects &&
            <div className={ styles.projectsContainer + ' ' + styles.myProjectsContainer }>
              <Loader text='Loading Preloaded projects' />
            </div>
          }
        </div>
      </DocumentTitle>
    );
  }
}


function mapStateToProps(state) {
  const { project, projects, user } = state;
  return { project, projects, user: user, userId: user.id };
}

export default connect(mapStateToProps, { fetchPreloadedProjects, fetchUserProjects, createProject, wipeProjectState, push })(PreloadedProjectListPage);
