import _ from 'underscore';

import {
  SELECT_COMPARISON_INDEPENDENT_VARIABLE,
  SELECT_COMPARISON_DEPENDENT_VARIABLE,
  WIPE_PROJECT_STATE,
  RECEIVE_NUMERICAL_COMPARISON,
  UPDATE_COMPARISON_INPUT,
  RECEIVE_ANOVA,
  RECEIVE_ANOVA_BOXPLOT_DATA,
  RECEIVE_PAIRWISE_COMPARISON_DATA,
  SELECT_DATASET,
  RECEIVE_FIELD_PROPERTIES,
  RECEIVE_SET_FIELD_IS_ID,
  RECEIVE_SET_FIELD_TYPE
} from '../constants/ActionTypes';

const baseState = {
  independentVariablesIds: [],
  dependentVariablesIds: [],
  numericalComparisonResult: {},
  anovaBoxplotData: [],
  pairwiseComparisonData: {},
  anovaResult: {},
}

export default function comparisonSelector(state = baseState, action) {
  switch (action.type) {

    case RECEIVE_FIELD_PROPERTIES:
      // Default selection
      var modifiedState = { ...state };

      var categoricalItemIds = action.fieldProperties.filter((item) => ((item.generalType == 'c') && (!item.isId))).map((item) => item.id);
      var quantitativeItemIds = action.fieldProperties.filter((item) => ((item.generalType == 'q') && (!item.isId))).map((item) => item.id);
      var n_c = categoricalItemIds.length;
      var n_q = quantitativeItemIds.length;

      console.log('In receive field properties', n_c, n_q);

      if ((n_c >= 2) && (n_q >= 1)) {
        modifiedState.independentVariablesIds = _.sample(categoricalItemIds, 1);
        modifiedState.dependentVariablesIds = _.sample(quantitativeItemIds, 1);
      } else {
        if (n_c == 0) {
          if (n_q >= 2) {
            modifiedState.independentVariablesIds = _.sample(quantitativeItemIds, 2);
          }
        } else if (n_c == 1) {
          if (n_q >= 1) {
            modifiedState.dependentVariablesIds = _.sample(quantitativeItemIds, 1);
            modifiedState.independentVariablesIds = _.sample(categoricalItemIds, 1);
          }
        }
      }

      return modifiedState;

    case SELECT_COMPARISON_INDEPENDENT_VARIABLE:
      var independentVariablesIds = state.independentVariablesIds.slice();
      const selectedIdIndependent = parseInt(action.independentVariableId);
      if (state.independentVariablesIds.find((independentVariablesId) => independentVariablesId == selectedIdIndependent)) {
        independentVariablesIds = independentVariablesIds.filter((independentVariablesId) => independentVariablesId != selectedIdIndependent);
      } else {
        independentVariablesIds.push(selectedIdIndependent);
      }
      return { ...state, independentVariablesIds: independentVariablesIds };

    case SELECT_COMPARISON_DEPENDENT_VARIABLE:
      var dependentVariablesIds = state.dependentVariablesIds.slice();
      const selectedIdDependent = parseInt(action.dependentVariableId);
      if (state.dependentVariablesIds.find((dependentVariablesId) => dependentVariablesId == selectedIdDependent)) {
        dependentVariablesIds = dependentVariablesIds.filter((dependentVariablesId) => dependentVariablesId != selectedIdDependent);
      } else {
        dependentVariablesIds.push(selectedIdDependent);
      }
      return { ...state, dependentVariablesIds: dependentVariablesIds };

    case RECEIVE_NUMERICAL_COMPARISON:
      return { ...state, numericalComparisonResult: action.data };

    case RECEIVE_ANOVA:
      return { ...state, anovaResult: action.data };

    case RECEIVE_ANOVA_BOXPLOT_DATA:
      return { ...state, anovaBoxplotData: action.data };

    case RECEIVE_PAIRWISE_COMPARISON_DATA:
      return { ...state, pairwiseComparisonData: action.data };

    case UPDATE_COMPARISON_INPUT:
      var inputDict = state.inputsDict;
      inputDict[action.test] = action.userInput;
      return { ...state, inputsDict: inputDict }

    case WIPE_PROJECT_STATE:
      return baseState;

    case SELECT_DATASET:
      return baseState;

    default:
      return state;
  }
}
