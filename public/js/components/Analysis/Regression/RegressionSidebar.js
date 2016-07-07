import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { fetchFieldPropertiesIfNeeded } from '../../../actions/FieldPropertiesActions';
import { selectIndependentVariable, selectRegressionType, createInteractionTerm } from '../../../actions/RegressionActions';
import { createURL } from '../../../helpers/helpers.js';

import styles from '../Analysis.sass';

import Sidebar from '../../Base/Sidebar';
import SidebarGroup from '../../Base/SidebarGroup';
import ToggleButtonGroup from '../../Base/ToggleButtonGroup';
import DropDownMenu from '../../Base/DropDownMenu';
import RaisedButton from '../../Base/RaisedButton';

const regressionTypes = [
  { value: 'linear', label: 'Linear' },
  { value: 'logistic', label: 'Logistic' }
];

export class RegressionSidebar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      interactionVariables: [null, null]
    }
  }

  componentWillMount(props) {
    const { project, datasetSelector, fieldProperties, fetchFieldPropertiesIfNeeded } = this.props;

    if (project.properties.id && datasetSelector.datasetId && !fieldProperties.items.length && !fieldProperties.fetching) {
      fetchFieldPropertiesIfNeeded(project.properties.id, datasetSelector.datasetId)
    }
  }

  componentWillReceiveProps(nextProps) {
    const { project, datasetSelector, fieldProperties, fetchFieldPropertiesIfNeeded } = nextProps;
    const datasetIdChanged = datasetSelector.datasetId != this.props.datasetSelector.datasetId;

    if (project.properties.id && datasetSelector.datasetId && (datasetIdChanged || !fieldProperties.items.length) && !fieldProperties.fetching) {
      fetchFieldPropertiesIfNeeded(project.properties.id, datasetSelector.datasetId)
    }
  }

  onSelectDependentVariable(dependentVariable) {
    const { project, datasetSelector, fieldProperties, push } = this.props;

    const queryParams = { 'dependent-variable': dependentVariable };
    push(createURL(`/projects/${ project.properties.id }/datasets/${ datasetSelector.datasetId }/analyze/regression`, queryParams));
  }

  onSelectRegressionType(regressionType) {
    const { project, datasetSelector, regressionSelector, push } = this.props;
    
    const queryParams = { 'dependent-variable': regressionSelector.dependentVariableId, 'regression-type': regressionType };
    push(createURL(`/projects/${ project.properties.id }/datasets/${ datasetSelector.datasetId }/analyze/regression`, queryParams));
  }

  onSelectInteractionTerm(dropDownNumber, independentVariableId) {
    const interactionVariables = this.state.interactionVariables;
    interactionVariables[dropDownNumber] = independentVariableId;

    this.setState({ interactionVariables: interactionVariables });
  }

  onCreateInteractionTerm() {
    this.props.createInteractionTerm(this.state.interactionVariables);
    this.setState({ interactionVariables: [null, null] })
  }

  render() {
    const { fieldProperties, regressionSelector, selectIndependentVariable } = this.props;
    
    const interactionTermNames = regressionSelector.interactionTermIds.map((idTuple) => {
      return fieldProperties.items.filter((property) => property.id == idTuple[0] || property.id == idTuple[1]).map((item) => item.name)
    })
    
    var shownRegressionTypes = regressionTypes;

    if(fieldProperties.items.length > 0) {
      const dependentVariableType = fieldProperties.items.find((property) => property.id == regressionSelector.dependentVariableId);
      if(dependentVariableType == 'decimal') {
        shownRegressionTypes = regressionTypes.filter((type) => type.value != 'logistic')
      }
    }

    return (
      <Sidebar selectedTab="regression">
        { fieldProperties.items.length != 0 &&
          <SidebarGroup heading="Regression Type">
            <DropDownMenu
              value={ regressionSelector.regressionType }
              options={ shownRegressionTypes }
              onChange={ this.onSelectRegressionType.bind(this) } />
          </SidebarGroup>
        }
        { fieldProperties.items.length != 0 &&
          <SidebarGroup heading="Dependent Variable (Y)">
            <DropDownMenu
              value={ parseInt(regressionSelector.dependentVariableId) }
              options={ fieldProperties.items.filter((property) => !property.isUnique) }
              valueMember="id"
              displayTextMember="name"
              onChange={ this.onSelectDependentVariable.bind(this) }/>
          </SidebarGroup>
        }
        { fieldProperties.items.length != 0 &&
          <SidebarGroup heading="Explanatory Factors (X)">
            { fieldProperties.items.filter((property) => property.generalType == 'c').length > 0 &&
              <div className={ styles.fieldGroup }>
                <div className={ styles.fieldGroupLabel }>Categorical</div>
                <ToggleButtonGroup
                  toggleItems={ fieldProperties.items.filter((property) => property.generalType == 'c').map((item) =>
                    new Object({
                      id: item.id,
                      name: item.name,
                      disabled: (item.id == regressionSelector.dependentVariableId) || regressionSelector.dependentVariableId == null || ( item.generalType == 'c' && item.isUnique)
                    })
                  )}
                  displayTextMember="name"
                  valueMember="id"
                  externalSelectedItems={ regressionSelector.independentVariableIds }
                  separated={ true }
                  onChange={ selectIndependentVariable } />
              </div>
            }
            { fieldProperties.items.filter((property) => property.generalType == 't').length > 0 &&
              <div className={ styles.fieldGroup }>
                <div className={ styles.fieldGroupLabel }>Temporal</div>
                <ToggleButtonGroup
                  toggleItems={ fieldProperties.items.filter((property) => property.generalType == 't').map((item) =>
                    new Object({
                      id: item.id,
                      name: item.name,
                      disabled: (item.id == regressionSelector.dependentVariableId) || regressionSelector.dependentVariableId == null || ( item.generalType == 'c' && item.isUnique)
                    })
                  )}
                  valueMember="id"
                  displayTextMember="name"
                  externalSelectedItems={ regressionSelector.independentVariableIds }
                  separated={ true }
                  onChange={ selectIndependentVariable } />
              </div>
            }
            { fieldProperties.items.filter((property) => property.generalType == 'q').length > 0 &&
              <div className={ styles.fieldGroup }>
                <div className={ styles.fieldGroupLabel }>Quantitative</div>
                <ToggleButtonGroup
                  toggleItems={ fieldProperties.items.filter((property) => property.generalType == 'q').map((item) =>
                    new Object({
                      id: item.id,
                      name: item.name,
                      disabled: (item.id == regressionSelector.dependentVariableId) || regressionSelector.dependentVariableId == null || ( item.generalType == 'c' && item.isUnique)
                    })
                  )}
                  valueMember="id"
                  displayTextMember="name"
                  externalSelectedItems={ regressionSelector.independentVariableIds }
                  separated={ true }
                  onChange={ selectIndependentVariable } />
              </div>
            }
            { fieldProperties.items.filter((property) => property.generalType == 'q' || property.generalType == 'c').length > 0 &&
              <div className={ styles.fieldGroup }>
                <div className={ styles.fieldGroupLabel }>Interaction Terms</div>
                { regressionSelector.interactionTermIds.length > 0 ? 
                    <ToggleButtonGroup
                      toggleItems={ interactionTermNames.map((idTuple, key) =>
                        new Object({
                          id: key,
                          name:  idTuple[0] + "*" + idTuple[1]
                        }) 
                      )}
                      valueMember="id"
                      displayTextMember="name" />
                   : <div> None selected </div>
                }
              </div>
            }
          </SidebarGroup>
        }
          <SidebarGroup heading="Add Interaction Terms">
            <DropDownMenu
              value={ this.state.interactionVariables[0] }
              options={ fieldProperties.items.filter((item) => (item.generalType == 'q' || item.generalType == 'c') && item.id != this.state.interactionVariables[1]) }
              valueMember="id"
              displayTextMember="name"
              onChange={this.onSelectInteractionTerm.bind(this, 0)} />
            <DropDownMenu 
              value={ this.state.interactionVariables[1] }
              options={ fieldProperties.items.filter((item) => (item.generalType == 'q' || item.generalType == 'c') && item.id != this.state.interactionVariables[0]) }
              valueMember="id"
              displayTextMember="name"
              onChange={this.onSelectInteractionTerm.bind(this, 1)} />
            <RaisedButton altText="Add" label="Add" onClick={this.onCreateInteractionTerm.bind(this)}/>
          </SidebarGroup>
      </Sidebar>
    );
  }
}

RegressionSidebar.propTypes = {
  project: PropTypes.object.isRequired,
  datasetSelector: PropTypes.object.isRequired,
  fieldProperties: PropTypes.object.isRequired,
  regressionSelector: PropTypes.object.isRequired
};

function mapStateToProps(state) {
  const { project, datasetSelector, fieldProperties, regressionSelector } = state;
  return {
    project,
    datasetSelector,
    fieldProperties,
    regressionSelector
  };
}

export default connect(mapStateToProps, { fetchFieldPropertiesIfNeeded, selectRegressionType, selectIndependentVariable, createInteractionTerm, push })(RegressionSidebar);
