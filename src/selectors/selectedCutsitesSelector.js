import { createSelector } from "reselect";
import selectedAnnotationsSelector from "./selectedAnnotationsSelector";

export default createSelector(selectedAnnotationsSelector, function(
  selectedAnnotations
) {
  let { idStack, idMap } = selectedAnnotations;
  let cutsiteIdMap = {};
  let cutsiteIdStack = idStack.filter(function(id) {
    if (idMap[id].annotationType === "cutsite") {
      cutsiteIdMap[id] = idMap[id];
      return true;
    }
  });
  return {
    idStack: cutsiteIdStack,
    idMap: cutsiteIdMap
  };
});
