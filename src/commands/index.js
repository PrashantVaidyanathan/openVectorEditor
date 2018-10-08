import React from "react";
import { Tag } from "@blueprintjs/core";
import { oveCommandFactory } from "../utils/commandUtils";
import { upperFirst, startCase, get } from "lodash";
import showFileDialog from "../utils/showFileDialog";

const fileCommandDefs = {
  newSequence: {
    isDisabled: props => !props.onNew,
    handler: props => props.onNew()
  },

  renameSequence: {
    isDisabled: props => props.readOnly,
    handler: props => {
      props.showRenameSequenceDialog({
        initialValues: { newName: props.sequenceData.name },
        onSubmit: values => props.sequenceNameUpdate(values.newName)
      });
    }
  },

  saveSequence: {
    isDisabled: props => props.readOnly || props.hasBeenSaved,
    handler: props => props.handleSave(),
    hotkey: "mod+s"
  },

  deleteSequence: {
    isDisabled: props => props.readOnly || !props.onDelete,
    handler: props => props.onDelete(props.sequenceData)
  },

  duplicateSequence: {
    isDisabled: props => !props.onDuplicate,
    handler: props => props.onDuplicate(props.sequenceData),
    hotkey: "alt+shift+d"
  },

  toggleReadOnlyMode: {
    toggle: [],
    isActive: props => props.readOnly,
    handler: props => props.toggleReadOnlyMode()
  },

  importSequence: {
    isDisabled: props => props.readOnly,
    handler: props => {
      showFileDialog({
        multiple: false,
        onSelect: files => {
          props.importSequenceFromFile(files[0]);
        }
      });
    }
  },

  exportSequenceAsGenbank: {
    name: "As Genbank file",
    handler: props => props.exportSequenceToFile("genbank")
  },

  exportSequenceAsFasta: {
    name: "As FASTA file",
    handler: props => props.exportSequenceToFile("fasta")
  },

  viewProperties: {
    handler: props => props.propertiesViewOpen()
  },

  print: {
    handler: props => props.handlePrint(),
    hotkey: "mod+p"
  }
};

const toggleCopyOptionCommandDefs = {};
["features", "parts", "partialParts", "partialFeatures"].forEach(type => {
  const cmdId = `toggleCopy${upperFirst(type)}`;
  toggleCopyOptionCommandDefs[cmdId] = {
    name: `Include ${startCase(type)}`,
    handler: props => props.toggleCopyOption(type),
    isActive: props => props.copyOptions && props.copyOptions[type]
  };
});

const hasSelection = ({ selectionLayer = {} }) =>
  selectionLayer.start > -1 && selectionLayer.end > -1;

const editCommandDefs = {
  cut: {
    isDisabled: props => props.readOnly,
    handler: props => props.triggerClipboardCommand("cut"),
    hotkey: "mod+x"
  },

  copy: {
    handler: props => props.triggerClipboardCommand("copy"),
    hotkey: "mod+c"
  },

  paste: {
    isDisabled: props => props.readOnly,
    handler: props => props.triggerClipboardCommand("paste"),
    hotkey: "mod+v"
  },

  undo: {
    isDisabled: props =>
      props.readOnly ||
      !(
        props.sequenceDataHistory &&
        props.sequenceDataHistory.past &&
        props.sequenceDataHistory.past.length
      ),
    handler: props => props.undo(),
    hotkey: "mod+z"
  },

  redo: {
    isDisabled: props =>
      props.readOnly ||
      !(
        props.sequenceDataHistory &&
        props.sequenceDataHistory.future &&
        props.sequenceDataHistory.future.length
      ),
    handler: props => props.redo(),
    hotkey: "mod+shift+z"
  },

  find: {
    name: "Find...",
    handler: props => props.toggleFindTool(),
    hotkey: "mod+f",
    hotkeyProps: { preventDefault: true }
  },

  goTo: {
    name: "Go To...",
    handler: props => {
      props.showGoToDialog({
        initialValues: {
          sequencePosition: props.caretPosition >= 0 ? props.caretPosition : 0
        },
        onSubmit: values => props.caretPositionUpdate(values.sequencePosition)
      });
    },
    hotkey: "mod+g",
    hotkeyProps: { preventDefault: true }
  },

  select: {
    name: "Select...",
    handler: props => {
      const { start, end } = props.selectionLayer;
      props.showSelectDialog({
        initialValues: {
          from: start >= 0 ? start : 0,
          to: end >= 0 ? end : 0
        },
        onSubmit: values =>
          props.selectionLayerUpdate({
            start: values.from,
            end: values.to
          })
      });
    }
  },

  selectAll: {
    handler: props => props.selectAll(),
    hotkey: "mod+a",
    hotkeyProps: { preventDefault: true, stopPropagation: true }
  },

  selectInverse: {
    isDisabled: props => !hasSelection(props),
    handler: props => props.handleInverse(),
    hotkey: "mod+i"
  },

  complementSelection: {
    isDisabled: props => props.readOnly || !hasSelection(props),
    handler: props => props.handleComplementSelection()
  },

  complementEntireSequence: {
    isDisabled: props => props.readOnly,
    handler: props => props.handleComplementSequence()
  },
  toggleSequenceMapFontUpper: {
    isActive: props => props.uppercaseSequenceMapFont === "uppercase",
    handler: props => {
      props.uppercaseSequenceMapFont === "uppercase"
        ? props.updateSequenceCase("noPreference")
        : props.updateSequenceCase("uppercase");
    }
  },
  toggleSequenceMapFontLower: {
    isActive: props => props.uppercaseSequenceMapFont === "lowercase",
    handler: props => {
      props.uppercaseSequenceMapFont === "lowercase"
        ? props.updateSequenceCase("noPreference")
        : props.updateSequenceCase("lowercase");
    }
  },
  // toggleSequenceMapFontNoPreference: {
  //   isActive: props =>
  //     !props.uppercaseSequenceMapFont ||
  //     props.uppercaseSequenceMapFont === "noPreference",
  //   handler: props => {
  //     props.updateSequenceCase("noPreference");
  //   }
  // },
  reverseComplementSelection: {
    isDisabled: props => props.readOnly || !hasSelection(props),
    handler: props => props.handleReverseComplementSelection(),
    hotkey: "mod+e"
  },

  reverseComplementEntireSequence: {
    isDisabled: props => props.readOnly,
    handler: props => props.handleReverseComplementSequence()
  },

  sequenceAA_allFrames: {
    isActive: props =>
      props.frameTranslations["1"] &&
      props.frameTranslations["2"] &&
      props.frameTranslations["3"],
    handler: props => {
      if (
        props.frameTranslations["1"] &&
        props.frameTranslations["2"] &&
        props.frameTranslations["3"]
      ) {
        props.frameTranslationToggleOff("1");
        props.frameTranslationToggleOff("2");
        props.frameTranslationToggleOff("3");
      } else {
        props.frameTranslationToggleOn("1");
        props.frameTranslationToggleOn("2");
        props.frameTranslationToggleOn("3");
      }
    }
  },
  sequenceAAReverse_allFrames: {
    isActive: props =>
      props.frameTranslations["-1"] &&
      props.frameTranslations["-2"] &&
      props.frameTranslations["-3"],
    handler: props => {
      if (
        props.frameTranslations["-1"] &&
        props.frameTranslations["-2"] &&
        props.frameTranslations["-3"]
      ) {
        props.frameTranslationToggleOff("-1");
        props.frameTranslationToggleOff("-2");
        props.frameTranslationToggleOff("-3");
      } else {
        props.frameTranslationToggleOn("-1");
        props.frameTranslationToggleOn("-2");
        props.frameTranslationToggleOn("-3");
      }
    }
  },
  sequenceAA_frame1: {
    isActive: props => props.frameTranslations["1"],
    handler: props => props.frameTranslationToggle("1")
  },
  sequenceAA_frame2: {
    isActive: props => props.frameTranslations["2"],
    handler: props => props.frameTranslationToggle("2")
  },
  sequenceAA_frame3: {
    isActive: props => props.frameTranslations["3"],
    handler: props => props.frameTranslationToggle("3")
  },
  sequenceAAReverse_frame1: {
    isActive: props => props.frameTranslations["-1"],
    handler: props => props.frameTranslationToggle("-1")
  },
  sequenceAAReverse_frame2: {
    isActive: props => props.frameTranslations["-2"],
    handler: props => props.frameTranslationToggle("-2")
  },
  sequenceAAReverse_frame3: {
    isActive: props => props.frameTranslations["-3"],
    handler: props => props.frameTranslationToggle("-3")
  },

  //   sequenceAA_allFrames
  // sequenceAA_frame1
  // sequenceAA_frame2
  // sequenceAA_frame3
  // sequenceAAReverse_allFrames
  // sequenceAAReverse_frame1
  // sequenceAAReverse_frame2
  //         sequenceAAReverse_frame3

  // const FrameTranslationMenuItem = connect((state, { editorName, frame }) => {
  //   return {
  //     isActive: get(state, `VectorEditor[${editorName}].frameTranslations`, {})[
  //       frame
  //     ]
  //   };
  // })(({ isActive, ...rest }) => {
  //   return <MenuItem {...{ label: isActive ? "✓" : undefined, ...rest }} />;
  // });

  newFeature: {
    handler: (props, state, ctxInfo) => {
      console.warn("newFeature ctxInfo", ctxInfo);
      props.handleNewFeature();
    },
    isDisabled: props => props.readOnly,
    hotkey: "mod+k"
  },

  newPart: {
    handler: props => props.handleNewPart(),
    isDisabled: props => props.readOnly,
    hotkey: "mod+l",
    hotkeyProps: { preventDefault: true }
  },

  rotateToCaretPosition: {
    isDisabled: props => props.readOnly || props.caretPosition === -1,
    handler: props => props.handleRotateToCaretPosition(),
    hotkey: "mod+b"
  },

  editFeature: {
    isDisabled: props => props.readOnly,
    handler: (props, state, ctxInfo) => {
      console.warn("editFeature", ctxInfo);
      const annotation = get(ctxInfo, "context.annotation");
      props.showAddOrEditFeatureDialog(annotation);
    }
  },

  ...toggleCopyOptionCommandDefs
};

const cirularityCommandDefs = {
  circular: {
    isDisabled: props => props.readOnly,
    handler: props => props.updateCircular(true),
    isActive: (props, editorState) =>
      editorState && editorState.sequenceData.circular
  },
  linear: {
    isDisabled: props => props.readOnly,
    handler: props => props.updateCircular(false),
    isActive: (props, editorState) =>
      editorState && !editorState.sequenceData.circular
  }
};

const labelToggleCommandDefs = {};
["feature", "part", "cutsite"].forEach(type => {
  const cmdId = `toggle${upperFirst(type)}Labels`;
  const plural = type + "s";
  labelToggleCommandDefs[cmdId] = {
    toggle: ["show", "hide"],
    handler: props => props.annotationLabelVisibilityToggle(plural),
    isActive: (props, editorState) =>
      editorState && editorState.annotationLabelVisibility[plural]
  };
});

const annotationToggleCommandDefs = {};
[
  "features",
  "parts",
  "cutsites",
  "axis",
  "orfs",
  "primers",
  "translations",
  "orfTranslations",
  "cdsFeatureTranslations",
  "axisNumbers",
  "reverseSequence",
  "dnaColors",
  "lineageLines"
].forEach(type => {
  const cmdId = `toggle${upperFirst(type)}`;
  annotationToggleCommandDefs[cmdId] = {
    toggle: ["show", "hide"],
    name: props => {
      const { sequenceData } = props;
      let count;
      let hasCount = false;
      if (sequenceData && sequenceData[type]) {
        hasCount = true;
        count = Object.keys(sequenceData[type]).length;
      }
      return (
        <span>
          {startCase(type)}
          &nbsp;
          {hasCount && (
            <Tag round style={{ marginLeft: 4 }}>
              {count}
            </Tag>
          )}
        </span>
      );
    },
    handler: props => props.annotationVisibilityToggle(type),
    isActive: props => {
      return (
        props && props.annotationVisibility && props.annotationVisibility[type]
      );
    },
    isHidden: props => {
      return props && props.typesToOmit && props.typesToOmit[type] === false;
    }
  };
});

const toolCommandDefs = {
  simulateDigestion: {
    handler: props => props.createNewDigest(),
    hotkey: "mod+shift+d"
  },
  // TODO: enzyme manager (?)
  restrictionEnzymesManager: {
    name: "Restriction Enzymes Manager...",
    handler: props => props.addYourOwnEnzymeOpen()
  }
};

const commandDefs = {
  ...fileCommandDefs,
  ...cirularityCommandDefs,
  ...annotationToggleCommandDefs,
  ...labelToggleCommandDefs,
  ...editCommandDefs,
  ...toolCommandDefs
};

export default instance => oveCommandFactory(instance, commandDefs);