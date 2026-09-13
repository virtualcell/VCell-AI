# Explain Model (Brief)

## Purpose

Use this skill to write a polished, biologist-facing Markdown explanation of an existing VCell model. The reader is a biologist, curator, student, or domain scientist who wants to understand what the model *shows biologically*, not how VCML syntax works.

The output must be a readable explanatory article. It should explain the biological story, the major players, the key modeled events, what the model measures, and the expected behavior of this specific model in plots. It must avoid exposing the reader to implementation details unless those details are needed for website integration outside the prose.

## Required Inputs

Before writing, read the model files in this order:

1. The model `.vcml` file.
2. The publication data from publications.json file
3. Annotations inside the VCML file, especially title, description, reference, pathway notes, links to other databases, and BNGL elements.


## Core Writing Principle

Write what the model shows, not what the code says.

Good summary prose sounds like:

> This model shows how LPS is assembled with CD14 and MD2 before activating TLR4, how adaptor arms route the signal to TAK1 and IKK, and how A20 and IkB feedback restrain NF-kB-driven inflammatory output.

Bad summary prose sounds like:

> The local VCML file has species and reactions where `TLR4(TRAM)` binds `TRIF`.

Never make the biologist wade through raw VCML syntax, file logistics, implementation notes, or long rule lists.

## Strict Prohibitions for Markdown Summaries

Do **not** include any of the following in the Markdown prose:

- Raw VCML patterns.
- Code fences containing model code.
- Long lists of every reactions.
- Phrases such as “local model,” “local metadata,” “VCML file.”
- File paths, unless the user explicitly asks for file-path documentation inside the Markdown. 
- Generic filler such as “the model encodes molecular species, initial conditions, and reactions.”
- Unsupported biological claims, organisms, cell types, or experimental conclusions not implied by metadata, comments, molecule names, or local documentation.

The Markdown may use important molecule names, pathway names, protein names, ligand names, and biological state names. These names should be plain text, not raw syntax dumps.

## Required Markdown Structure

Use this structure exactly for each generated Markdown summary:

```markdown
# Model Explanation: <title>

## One-sentence summary

## What the model shows

## Biological story

## Main biological players

## Mechanism in plain English

## Key modeled events

## What the model measures

## Expected behavior in plots

## Caveats
```

### Section-by-section requirements

#### `# Model Explanation: <title>`

Use the clean model title from metadata when available. If metadata is sparse, use a readable title inferred from the directory or BNGL title comment.

#### `## One-sentence summary`

Write one specific sentence naming the biological process and the central modeled behavior. Avoid “uses BNGL,” “encodes,” or “contains.”

Good:

> Beta-catenin control by the Axin/APC/GSK3/CK1 destruction complex.

Bad:

> This model represents beta-catenin using BNGL rules.

#### `## What the model shows`

Write one paragraph explaining the model’s biological purpose. State the central mechanism and why the model is useful. This should be specific enough that a biologist can tell this model apart from another model in the same pathway.

#### `## Biological story`

Write a short conceptual paragraph that connects the model to a biological narrative: stimulus, assembly, modification, feedback, degradation, transport, gene expression, phenotype, or other response. Avoid implementation details.

#### `## Main biological players`

List the major molecules, complexes, variables, or pathway modules in readable biological language. Do not list every minor species. Do not include sites in BNGL syntax. It is acceptable to name important domains or residues in prose when biologically meaningful, such as SH2 domains, ITAMs, phosphorylation sites, or receptor arms.

#### `## Mechanism `

Explain the causal mechanism in one detailed paragraph. Use concrete verbs: binds, recruits, phosphorylates, dephosphorylates, activates, inhibits, releases, degrades, imports, exports, transcribes, translates, recycles, or dilutes.

This section should say what happens and why it matters. It must not be a raw reactions translation.

#### `## Key modeled events`

Include exactly three to five bullets. Each bullet should describe one important modeled event or event family in plain English.

Rules for these bullets:

- Select only the most biologically important events.
- Prefer event families over exhaustive lists.
- Mention direction and consequence when clear.
- Mention important molecules by name.
- Do not include raw syntax, arrows, rate constants, or parameter names unless the parameter name is biologically meaningful to the reader.

Good:

- Beta-catenin binds APC and Axin, placing it into the destruction-complex environment.
- CK1 and GSK3 phosphorylate beta-catenin in sequence, converting it into a form that is removed more rapidly.
- When beta-catenin is degraded, APC and Axin partners are released so the scaffold can participate in another cycle.

Bad:

- `bCat(ARM34) + AXIN(b) <-> bCat(ARM34!1).AXIN(b!1)`.

#### `## What the model measures`

Describe the plotted or tracked biological quantities. Use “readouts” or “measurements,” not “observables.” Explain what a biologist would see: active kinase, phosphorylated substrate, receptor complex, transcriptional output, degraded product, clustered polymer, pathway activity, and so on.

#### `## Expected behavior in plots`

Write model-specific plot guidance. Do not use reusable boilerplate about rising or falling curves. Say which particular readouts should rise, fall, peak, lag, oppose each other, or remain abstract for this model, and why. Avoid promising a specific trajectory unless the model comments or mechanism support it.

#### `## Caveats`

State limitations briefly. Examples:

- The summary explains the encoded mechanism; it does not validate experimental correctness.
- Some molecule names are abstract, so identities are not invented.
- The model is a compact demonstration rather than a complete pathway model.

Do not use this section to discuss local files or implementation logistics.


## Workflow

1. Read publications first and retrieve title and abstract from PubMed link.
2. Identify the main biological players from molecule and species declarations, comments, metadata tags. 
3. Identify the central mechanism: binding/assembly, activation, modification, feedback, degradation, transport, transcription, or other biological process.
4. Identify one to ten key modeled events. These should be selective and biologically meaningful, not exhaustive.
6. Identify the model readouts and translate them into biological measurements.
7. Write the Markdown in the required structure.
8. Review the Markdown and remove raw syntax, file-path prose, implementation jargon, and generic filler.



## Anti-Boilerplate Requirements

Every generated Markdown file must be specific from top to bottom. Never copy a generic paragraph across models. In particular:

- `## Biological story` must name the specific model or pathway and describe its unique narrative.
- `## Expected behavior in plots` must name the model-specific readouts or behaviors to compare.
- `## Caveats` must identify the specific scope limitation of that model.
- Repeated stock phrases are allowed only for headings, not for section bodies.
- If two summaries have identical section-body text outside headings, rewrite them.

## Quality Checklist

Before finalizing, verify all of the following:

- The summary is specific to this model, not reusable generic text.
- The reader can understand what the model shows without knowing BNGL.
- The mechanism section contains biological verbs and causal flow.
- The key modeled events include a few important modeled events without becoming a full rule dump.
- The readouts section explains what plotted quantities mean biologically.
- The biological story, expected plot behavior, and caveats are unique to the model and not copied boilerplate.
- The Markdown contains no raw BNGL syntax, arrows, bond labels, file paths, or local-file logistics.
- The Markdown avoids the words “observables,” “seed species,” and “reaction rules.”