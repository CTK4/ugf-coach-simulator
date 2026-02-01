import { AppState, InstallItem } from "./types";

export function seedInstallLibrary(state: AppState) {
  const items: InstallItem[] = [
    { id:"ins-concept-mesh", type:"CONCEPT", name:"Mesh", clu:3, family:"PASS" },
    { id:"ins-concept-flood", type:"CONCEPT", name:"Flood", clu:3, family:"PASS" },
    { id:"ins-concept-outsidezone", type:"CONCEPT", name:"Outside Zone", clu:3, family:"RUN" },
    { id:"ins-tag-motion", type:"TAG", name:"Jet Motion Tag", clu:1, family:"PASS" },
    { id:"ins-prot-slide", type:"PROTECTION", name:"Slide Protection", clu:4, family:"PASS" },
    { id:"ins-def-match3", type:"COVERAGE_RULE", name:"Match-3 Rule", clu:3, family:"ZONE" },
    { id:"ins-form-bunch", type:"FORMATION", name:"Bunch", clu:2, family:"PASS" },
    { id:"ins-st-fakepunt", type:"CONCEPT", name:"Fake Punt Package", clu:2, family:"ST" },
  ];
  for (const it of items) state.installs[it.id] = it;
}
