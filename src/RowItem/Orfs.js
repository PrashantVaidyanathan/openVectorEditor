import React from "react";
import Orf from "./Orf";
import StackedAnnotations from "./StackedAnnotations";

function getExtraInnerCompProps(annotationRange, props) {
  const { row } = props;
  let { annotation } = annotationRange;
  let { frame, internalStartCodonIndices = [] } = annotation;
  let normalizedInternalStartCodonIndices = internalStartCodonIndices
    .filter(function(position) {
      if (position >= row.start && position <= row.end) {
        return true;
      } else return false;
    })
    .map(function(position) {
      return position - row.start;
    });

  return { normalizedInternalStartCodonIndices, frame };
}

function Orfs(props) {
  return (
    <StackedAnnotations
      {...{ ...props, getExtraInnerCompProps, InnerComp: Orf }}
    />
  );
}

export default Orfs;
