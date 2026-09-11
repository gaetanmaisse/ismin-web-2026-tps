# TP1 — Introduction to TypeScript

*Web Development — ISMIN 3A, session 1.*

## 🎯 Goal

Discover TypeScript and its ecosystem by implementing **ModelZoo**, a catalogue of AI models — the thread you will keep growing over the next four weeks, until you deploy it to production.

By the end of this lab you will be able to declare types, implement a class, and make a test suite pass.

## 🔀 Step 1 — Git

You work on **your own fork** of the course repository.

```sh
# 1. Fork this repository from the GitHub interface ("Fork" button, top right)

# 2. Clone YOUR fork (replace YOUR-USERNAME)
git clone https://github.com/YOUR-USERNAME/ismin-web-2026-tps.git
cd ismin-web-2026-tps

# 3. Check
git remote -v
```

> 💡 From session 2 on, you will add a second remote pointing at the course
> repository, to pull each new lab. We will set that up together when you need it.

Then create a branch for your work, and publish it on your fork right away:

```sh
git switch -c tp01-modelzoo
git push -u origin tp01-modelzoo
```

Pushing works even before your first commit: it creates the branch on your fork, so your work has somewhere to go at the end of the lab. Later, on the final project, you will work in pairs and propose your changes through **pull requests** — that is when code review starts to mean something.

## 🚀 Step 2 — Get started

```sh
cd tp01
npm install

# Run the tests once
npm run test

# Re-run the tests on every save — keep this terminal open
npm run test:watch
```

The test run does not even *start*: `src/model-zoo.test.ts` imports two files
that do not exist yet.

```
Failed to load url ./model-zoo.js — does the file exist?
```

That is the whole assignment. `npm run typecheck` shows both files at once:

```
error TS2307: Cannot find module './model.js'
error TS2307: Cannot find module './model-zoo.js'
```

## 📝 Step 3 — Write the types

`src/` contains **one file**: the tests. They are the specification, and they are
detailed enough to tell you everything the code must look like. Read them first,
end to end, before writing a line.

Create `src/model.ts` and declare two types in it:

- **`Task`** — what a model is able to do. Exactly four possibilities, no more:
  `text-generation`, `translation`, `image-classification`, `speech-to-text`.
  Not an `enum`, not a `string`: a **union of string literals**. Once it is
  written, typing `"text-gen"` somewhere must be a *compile* error, caught before
  any test runs.

- **`Model`** — a model in the catalogue. The test file builds three of them at
  the top: every field you need is there, and their values tell you the types.
  Read all three: they do not carry exactly the same fields, and the type must
  accept every one of them. `id` is a URL-safe slug, unique in the catalogue.

> 💡 Use `interface` for `Model` and `type` for `Task`. Both keywords work for
> both; the course rule is `interface` for the shape of an object, `type` for
> everything else (unions, aliases).

Both types must be `export`ed: the test imports them with
`import type { Model } from "./model.js"`. Yes, `.js`, even though your file is
`model.ts`: the import names the file that will exist *after* compilation.

Once `npm run typecheck` only complains about `./model-zoo.js`, commit:

```sh
git add src/model.ts
git commit -m "feat(tp01): add Model and Task types"
```

## 📝 Step 4 — Implement the class

Create `src/model-zoo.ts` and export a `ModelZoo` class fulfilling this contract:

```ts
class ModelZoo {
  addModel(model: Model): void;
  getModel(id: string): Model | undefined;
  getModelsOf(org: string): Model[];
  getAllModels(): Model[];
  getTotalNumberOfModels(): number;
  getModelsByTask(task: Task): Model[];
}
```

Your first real decision: **how do you store the models inside the class?**
An array? A `Map` keyed by `id`? Both make the tests pass, but one makes
`getModel` a direct lookup and the other a scan. Choose deliberately — you
will be asked to justify it. Whatever you pick, declare it `private readonly`:
nobody outside the class has any business touching it.

Work **test by test, top to bottom**. The first block, "an empty catalogue",
needs three trivial methods; after that, each `describe` block maps to one
method. Make a block pass, then move on. Do not try to write the whole class at
once.

> 💡 The compiler is your first reviewer. Run `npm run typecheck` regularly — it
> catches things the tests do not.

When the eleven tests are green, commit again:

```sh
git add src/model-zoo.ts
git commit -m "feat(tp01): implement ModelZoo"
```

## 🤖 Using AI during this lab

You may use an AI assistant, [Le Chat](https://chat.mistral.ai) or any other — and you are encouraged to, in order to **understand**, not to produce.

Today's exercise: when the TypeScript compiler returns an error you do not understand, ask it to explain, **then verify its answer** against the [official documentation](https://www.typescriptlang.org/docs/). You will be surprised how often a plausible explanation turns out to be wrong.

> ⚠️ **Golden rule**: during the labs I walk around and ask you to explain your code. Any part you cannot explain, I delete.

## 🛰 Going further

If you finish early. Write the test before the implementation, in a new file
(`src/extras.test.ts`, for instance): the given test file stays untouched.

**Warm-up** — three more methods, each with a constraint:

- `getTotalDownloads()` — the sum of every model's downloads. A single `reduce`, no loop.
- `getModelNamesByTask(task)` — the *names* of the models able to perform a task. One chain, `filter` then `map`, no intermediate variable.
- `getOrganisations()` — every organisation present in the catalogue, **each one once**. No loop either.

**Then** — none of these has an obvious solution:

1. **The typed URL.** Write `huggingFaceUrl(model)`, returning the address of the model's page.
   Constraint: its **return type** must make it impossible to return `"https://example.com"`.
   The compiler should reject it, not a test.

2. **The tamper-proof catalogue.** Can a caller corrupt your catalogue **from the outside**,
   without going through `addModel`? Find how, write the test that proves it, then make it impossible.

3. **Grouping.** Add `groupByTask()`, returning the models arranged by task.
   Constraints: **a single pass** over the array, and **no `any`** in the signature.

4. **⭐ The generic catalogue.** Turn `ModelZoo` into a `Catalogue<T>` reusable for any entity,
   not just models. What must you **require** of `T` for `getModel` to still work?

## ✅ Wrapping up

```sh
git status                  # uncommitted work left? git diff, git add, git commit
git log --oneline           # at least two commits: the types, then the class
git push                    # the branch already exists on your fork since step 1
```

Reading your own diff before committing is a habit worth building.

---

**Next up:** in session 2, this `ModelZoo` becomes a real REST API with NestJS.
