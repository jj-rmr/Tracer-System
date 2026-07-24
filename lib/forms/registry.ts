import graduateTracerV1Json from "./definitions/graduate-tracer.v1.json";

import { FormDefinition, FormOption } from "@/types";

export const graduateTracerV1 = graduateTracerV1Json as FormDefinition;

const definitions = [graduateTracerV1] as const;

export function getFormDefinition(slug: string, version: number) {
  return definitions.find(
    (definition) =>
      definition.slug === slug && definition.version === version,
  );
}

export function getGraduateTracerOptions(optionSet: string): FormOption[] {
  const options = graduateTracerV1.optionSets[optionSet];

  if (!options) {
    throw new Error(`Unknown graduate tracer option set: ${optionSet}`);
  }

  return options;
}
