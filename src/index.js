// import cleanSequenceData from './utils/cleanSequenceData';
// import deepEqual from 'deep-equal';
import "./coreStyle.css";
import vectorEditorReducer, { actions } from "./redux";
import s from "./selectors";
import { connect } from "react-redux";
import React from "react";
import addMetaToActionCreators from "./redux/utils/addMetaToActionCreators";
import { bindActionCreators } from "redux";
import _withEditorInteractions from "./withEditorInteractions";
import HoverHelperComp from "./HoverHelper";
export { default as CircularView } from "./CircularView";
export { default as RowView } from "./RowView";
export { default as RowItem } from "./RowItem";
export { default as VeToolBar } from "./VeToolBar";
export { default as CutsiteFilter } from "./CutsiteFilter";
export { default as LinearView } from "./LinearView";
export { default as StatusBar } from "./StatusBar";
export { default as HoverHelper } from "./HoverHelper";
export {
  default as getRangeAnglesSpecial
} from "./CircularView/getRangeAnglesSpecial";
export {
  default as PositionAnnotationOnCircle
} from "./CircularView/PositionAnnotationOnCircle";

function createVectorEditor({
  namespace,
  actionOverrides = fakeActionOverrides
}) {
  let meta = { namespace };
  let HoverHelper = function(props) {
    return (
      <HoverHelperComp
        {...{
          ...props,
          meta
        }}
      />
    );
  };
  let metaActions = addMetaToActionCreators(actions, meta);
  let overrides = addMetaToActionCreators(actionOverrides(metaActions), meta);
  //rebind the actions with dispatch and meta
  metaActions = {
    ...metaActions,
    ...overrides
  };

  function mapDispatchToActions(dispatch, props) {
    let { actionOverrides = fakeActionOverrides } = props;
    //add meta to all action creators before passing them to the override function
    // var metaActions = addMetaToActionCreators(actions, meta)
    let metaOverrides = addMetaToActionCreators(
      actionOverrides(metaActions),
      meta
    );
    //rebind the actions with dispatch and meta
    let actionsToPass = {
      ...metaActions,
      ...metaOverrides
    };
    return { ...bindActionCreators(actionsToPass, dispatch), dispatch };
  }

  let withEditorProps = connect(function(state, props) {
    let { VectorEditor } = state;
    //then use the fake blankEditor data as a substitute
    let editorState = VectorEditor[meta.namespace];
    let cutsites = s.filteredCutsitesSelector(editorState).cutsitesArray;
    let filteredRestrictionEnzymes = s.filteredRestrictionEnzymesSelector(
      editorState
    );
    let orfs = s.orfsSelector(editorState);
    let selectedCutsites = s.selectedCutsitesSelector(editorState);
    let allCutsites = s.cutsitesSelector(editorState);
    let translations = s.translationsSelector(editorState);
    let sequenceLength = s.sequenceLengthSelector(editorState);
    return {
      ...editorState,
      selectedCutsites,
      sequenceLength,
      allCutsites,
      filteredRestrictionEnzymes,
      sequenceData: {
        ...editorState.sequenceData,
        cutsites,
        orfs,
        translations
      },
      HoverHelper,
      // HoverHelper: _HoverHelper,
      meta,
      ...props
    };
  }, mapDispatchToActions);

  const withEditorInteractions = function(Comp) {
    return withEditorProps(_withEditorInteractions(Comp));
  };
  return {
    veActions: metaActions,
    veSelectors: s,
    withEditorInteractions,
    withEditorProps,
    HoverHelper
  };
}

export { vectorEditorReducer };
export { createVectorEditor };

function fakeActionOverrides() {
  return {};
}
