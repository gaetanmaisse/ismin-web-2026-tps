import { beforeEach, describe, expect, it } from "vitest";
import type { Model } from "./model.js";
import { ModelZoo } from "./model-zoo.js";

/**
 * These tests are the assignment: they describe the expected behaviour.
 * Do not modify them — make them pass.
 *
 * Run `npm run test:watch` and work through them one by one, top to bottom.
 */

const mistral: Model = {
  id: "mistral-7b-instruct-v0-3",
  name: "Mistral-7B-Instruct-v0.3",
  org: "mistralai",
  task: "text-generation",
  parameters: 7.2,        // in billions, as on the Hugging Face model card
  downloads: 1_420_000,   // over the last month
  license: "apache-2.0",
};

const devstral: Model = {
  id: "devstral-small",
  name: "Devstral-Small",
  org: "mistralai",
  task: "text-generation",
  parameters: 24,
  downloads: 310_000,
};

const whisper: Model = {
  id: "whisper-large-v3",
  name: "whisper-large-v3",
  org: "openai",
  task: "speech-to-text",
  parameters: 1.55,
  downloads: 4_100_000,
  license: "apache-2.0",
};

describe("ModelZoo", () => {
  let zoo: ModelZoo;

  beforeEach(() => {
    zoo = new ModelZoo();
  });

  describe("an empty catalogue", () => {
    it("holds no model", () => {
      expect(zoo.getTotalNumberOfModels()).toBe(0);
      expect(zoo.getAllModels()).toEqual([]);
    });

    it("finds no model by identifier", () => {
      expect(zoo.getModel("mistral-7b-instruct-v0-3")).toBeUndefined();
    });
  });

  describe("addModel", () => {
    it("adds a model to the catalogue", () => {
      zoo.addModel(mistral);

      expect(zoo.getTotalNumberOfModels()).toBe(1);
      expect(zoo.getAllModels()).toEqual([mistral]);
    });

    it("adds several models", () => {
      zoo.addModel(mistral);
      zoo.addModel(devstral);
      zoo.addModel(whisper);

      expect(zoo.getTotalNumberOfModels()).toBe(3);
    });

    it("replaces an existing model instead of duplicating it", () => {
      zoo.addModel(mistral);
      // "..." copies every field of mistral, then downloads overrides one of them
      zoo.addModel({ ...mistral, downloads: 9_999_999 });

      expect(zoo.getTotalNumberOfModels()).toBe(1);
      expect(zoo.getModel(mistral.id)?.downloads).toBe(9_999_999);
    });
  });

  describe("getModel", () => {
    beforeEach(() => {
      zoo.addModel(mistral);
      zoo.addModel(whisper);
    });

    it("returns the model matching the identifier", () => {
      expect(zoo.getModel("whisper-large-v3")).toEqual(whisper);
    });

    it("returns undefined for an unknown identifier", () => {
      expect(zoo.getModel("llama-4")).toBeUndefined();
    });
  });

  describe("getModelsOf", () => {
    beforeEach(() => {
      zoo.addModel(mistral);
      zoo.addModel(devstral);
      zoo.addModel(whisper);
    });

    it("returns every model of an organisation", () => {
      const models = zoo.getModelsOf("mistralai");

      expect(models).toHaveLength(2);
      // the same elements, in any order
      expect(models).toEqual(expect.arrayContaining([mistral, devstral]));
    });

    it("returns an empty array for an unknown organisation", () => {
      expect(zoo.getModelsOf("acme-corp")).toEqual([]);
    });
  });

  describe("getModelsByTask", () => {
    beforeEach(() => {
      zoo.addModel(mistral);
      zoo.addModel(devstral);
      zoo.addModel(whisper);
    });

    it("returns every model able to perform a task", () => {
      expect(zoo.getModelsByTask("text-generation")).toHaveLength(2);
      expect(zoo.getModelsByTask("speech-to-text")).toEqual([whisper]);
    });

    it("returns an empty array when no model performs the task", () => {
      expect(zoo.getModelsByTask("translation")).toEqual([]);
    });
  });
});
