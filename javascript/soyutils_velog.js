/*
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview
 * Utility functions and classes for supporting visual element logging in the
 * client side.
 *
 * <p>
 * This file contains utilities that should only be called by Soy-generated
 * JS code. Please do not use these functions directly from your hand-written
 * code. Their names all start with '$$'.
 */

goog.module('soy.velog');
goog.module.declareLegacyNamespace();

const Message = goog.require('jspb.Message');
const xid = goog.require('xid');
const {assert} = goog.require('goog.asserts');
const {getFirstElementChild, getNextElementSibling} = goog.require('goog.dom');
const {startsWith} = goog.require('goog.string');

/** @final */
class ElementMetadata {
  /**
   * @param {number} id
   * @param {?Message} data
   * @param {boolean} logOnly
   */
  constructor(id, data, logOnly) {
    /**
     * The identifier for the logging element
     * @const {number}
     */
    this.id = id;

    /**
     * The optional payload from the `data` attribute. This is guaranteed to
     * match the proto_type specified in the logging configuration.
     * @const {?Message}
     */
    this.data = data;

    /**
     * Whether or not this element is in logOnly mode. In logOnly mode the log
     * records are collected but the actual elements are not rendered.
     * @const {boolean}
     */
    this.logOnly = logOnly;
  }
}

/** @package @final */
class FunctionMetadata {
  /**
   * @param {string} name
   * @param {!Array<?>} args
   */
  constructor(name, args) {
    this.name = name;
    this.args = args;
  }
}

/** @package @final */
class Metadata {
  constructor() {
    /** @type {!Array<!ElementMetadata>} */
    this.elements = [];
    /** @type {!Array<!FunctionMetadata>} */
    this.functions = [];
  }
}

/** @type {?Metadata} */ let metadata;


// NOTE: we need to use toLowerCase in case the xid contains upper case
// characters, browsers normalize keys to their ascii lowercase versions when
// accessing attributes via the programmatic APIs (as we do below).
/** @package */ const ELEMENT_ATTR = 'data-' + xid('soylog').toLowerCase();

/** @package */ const FUNCTION_ATTR =
    'data-' + xid('soyloggingfunction').toLowerCase() + '-';

/** Sets up the global metadata object before rendering any templates. */
function setUpLogging() {
  assert(
      !$$hasMetadata(),
      'Logging metadata already exists. Please call ' +
          'soy.velog.tearDownLogging after rendering a template.');
  metadata = new Metadata();
}

/**
 * Clears the global metadata object after logging so that we won't leak any
 * information between templates.
 */
function tearDownLogging() {
  assert(
      $$hasMetadata(),
      'Logging metadata does not exist. ' +
          'Please call soy.velog.setUpLogging before rendering a template.');
  metadata = null;
}

/**
 * Checks if the global metadata object exists. This is only used by generated
 * code, to avoid directly access the object.
 *
 * @return {boolean}
 */
function $$hasMetadata() {
  return !!metadata;
}

/**
 * Testonly method that sets the fake meta data for testing.
 * @param {!Metadata} testdata
 * @package
 */
function setMetadataTestOnly(testdata) {
  metadata = testdata;
}

/**
 * Records the id and additional data into the global metadata structure.
 *
 * @param {!$$VisualElementData} veData The VE to log.
 * @param {boolean} logOnly Whether to enable counterfactual logging.
 *
 * @return {string} The HTML attribute that will be stored in the DOM.
 */
function $$getLoggingAttribute(veData, logOnly) {
  if ($$hasMetadata()) {
    const dataIdx =
        metadata.elements.push(
            new ElementMetadata(
                veData.getVe().getId(), veData.getData(), logOnly))
        - 1;
    // Insert a whitespace at the beginning. In VeLogInstrumentationVisitor,
    // we insert the return value of this method as a plain string instead of a
    // HTML attribute, therefore the desugaring pass does not know how to handle
    // whitespaces.
    // Trailing whitespace is not needed since we always add this at the end of
    // a HTML tag.
    return ' ' + ELEMENT_ATTR + '="' + dataIdx + '"';
  } else if (logOnly) {
    // If logonly is true but no longger has been configured, we throw an error
    // since this is clearly a misconfiguration.
    throw new Error(
        'Cannot set logonly="true" unless there is a logger configured');
  } else {
    // If logger has not been configured, return an empty string to avoid adding
    // unnecessary information in the DOM.
    return '';
  }
}

/**
 * Registers the logging function in the metadata.
 *
 * @param {string} name Obfuscated logging function name.
 * @param {!Array<?>} args List of arguments for the logging function.
 * @param {string} attr The original HTML attribute name.
 *
 * @return {string} The HTML attribute that will be stored in the DOM.
 */
function $$getLoggingFunctionAttribute(name, args, attr) {
  if ($$hasMetadata()) {
    const functionIdx =
        metadata.functions.push(new FunctionMetadata(name, args)) - 1;
    return ' ' + FUNCTION_ATTR + attr + '="' + functionIdx + '"';
  } else {
    return '';
  }
}

/**
 * For a given rendered HTML element, go through the DOM tree and emits logging
 * commands if necessary. This method also discards visual elements that are'
 * marked as log only (counterfactual).
 *
 * @param {!Element|!DocumentFragment} element The rendered HTML element.
 * @param {!Logger} logger The logger that actually does stuffs.
 */
function emitLoggingCommands(element, logger) {
  const keep = preOrderDomTraversal(element, logger);
  if (!keep) {
    element.parentElement.removeChild(element);
  }
}

/**
 * Helper method that traverses the DOM tree in pre-order and returns false
 * if the current element is log only.
 *
 * @param {!Element|!DocumentFragment} element The rendered HTML element.
 * @param {!Logger} logger The logger that actually does stuffs.
 * @return {boolean} indicating whether or not current should be removed.
 */
function preOrderDomTraversal(element, logger) {
  let logIndex = -1;
  if (element instanceof Element) {
    logIndex = getDataAttribute(element, ELEMENT_ATTR);
    assert(metadata.elements.length > logIndex, 'Invalid logging attribute.');
    if (logIndex != -1) {
      logger.enter(metadata.elements[logIndex]);
    }
    replaceFunctionAttributes(element, logger);
  }
  let current = getFirstElementChild(element);
  while (current) {
    // TODO(user): Maybe we should pass around logOnly so that children
    // of logOnly VEs do not need to manipulate the DOM.
    const keep = preOrderDomTraversal(current, logger);
    const next = getNextElementSibling(current);
    // Remove the current element after we obtain nextElementSibling.
    if (!keep) {
      // IE does not support ChildNode.remove().
      element.removeChild(current);
    }
    current = next;
  }
  if (element instanceof Element) {
    if (logIndex != -1) {
      logger.exit();
      // Remove logOnly elements from the DOM.
      if (metadata.elements[logIndex].logOnly) {
        return false;
      }
    }
    // Always remove the data attribute.
    element.removeAttribute(ELEMENT_ATTR);
  }
  return true;
}

/**
 * Evaluates and replaces the data attributes related to logging functions.
 *
 * @param {!Element} element
 * @param {!Logger} logger
 */
function replaceFunctionAttributes(element, logger) {
  const attributeMap = {};
  // Iterates from the end to the beginning, since we are removing attributes
  // in place.
  for (let i = element.attributes.length - 1; i >= 0; --i) {
    const attributeName = element.attributes[i].name;
    if (startsWith(attributeName, FUNCTION_ATTR)) {
      const funcIndex = parseInt(element.attributes[i].value, 10);
      assert(
          !Number.isNaN(funcIndex) && funcIndex < metadata.functions.length,
          'Invalid logging attribute.');
      const funcMetadata = metadata.functions[funcIndex];
      const attr = attributeName.substring(FUNCTION_ATTR.length);
      attributeMap[attr] =
          logger.evalLoggingFunction(funcMetadata.name, funcMetadata.args);
      element.removeAttribute(attributeName);
    }
  }
  for (const attributeName in attributeMap) {
    element.setAttribute(attributeName, attributeMap[attributeName]);
  }
}

/**
 * Gets and parses the data-soylog attribute for a given element. Returns -1 if
 * it does not contain related attributes.
 *
 * @param {!Element} element The current element.
 * @param {string} attr The name of the data attribute.
 * @return {number}
 */
function getDataAttribute(element, attr) {
  let logIndex = element.getAttribute(attr);
  if (logIndex) {
    logIndex = parseInt(logIndex, 10);
    assert(!Number.isNaN(logIndex), 'Invalid logging attribute.');
    return logIndex;
  }
  return -1;
}

/**
 * Logging interface for client side.
 * @interface
 */
class Logger {

  /**
   * Called when a `{velog}` statement is entered.
   * @param {!ElementMetadata} elementMetadata
   */
  enter(elementMetadata) {}

  /**
   * Called when a `{velog}` statement is exited.
   */
  exit() {}

  /**
   * Called when a logging function is evaluated.
   * @param {string} name function name, as obfuscated by the `xid` function.
   * @param {!Array<?>} args List of arguments needed for the function.
   * @return {string} The evaluated return value that will be shown in the DOM.
   */
  evalLoggingFunction(name, args) {}
}

/** The ID of the UndefinedVe. */
const UNDEFINED_VE_ID = -1;

/**
 * Soy's runtime representation of objects of the Soy `ve` type.
 *
 * <p>This is for use only in Soy internal code and Soy generated JS. DO NOT use
 * this from handwritten code.
 *
 * @final
 */
class $$VisualElement {
  /**
   * @param {number} id
   * @param {string=} name
   */
  constructor(id, name = undefined) {
    /** @private @const {number} */
    this.id_ = id;
    /** @private @const {string|undefined} */
    this.name_ = name;
  }

  /** @return {number} */
  getId() {
    return this.id_;
  }

  /** @package @return {string} */
  toDebugString() {
    return `ve(${this.name_})`;
  }

  /** @override */
  toString() {
    if (goog.DEBUG) {
      return `**FOR DEBUGGING ONLY ${this.toDebugString()}, id: ${this.id_}**`;
    } else {
      return 'zSoyVez';
    }
  }
}

/**
 * Soy's runtime representation of objects of the Soy `ve_data` type.
 *
 * <p>This is for use only in Soy internal code and Soy generated JS. DO NOT use
 * this from handwritten code.
 *
 * @final
 */
class $$VisualElementData {
  /**
   * @param {!$$VisualElement} ve
   * @param {?Message} data
   */
  constructor(ve, data) {
    /** @private @const {!$$VisualElement} */
    this.ve_ = ve;
    /** @private @const {?Message} */
    this.data_ = data;
  }

  /** @return {!$$VisualElement} */
  getVe() {
    return this.ve_;
  }

  /** @return {?Message} */
  getData() {
    return this.data_;
  }

  /** @override */
  toString() {
    if (goog.DEBUG) {
      return `**FOR DEBUGGING ONLY ve_data(${this.ve_.toDebugString()}, ${
          this.data_})**`;
    } else {
      return 'zSoyVeDz';
    }
  }
}

exports = {
  $$hasMetadata,
  $$getLoggingAttribute,
  $$getLoggingFunctionAttribute,
  ELEMENT_ATTR,
  FUNCTION_ATTR,
  ElementMetadata,
  FunctionMetadata,
  Logger,
  UNDEFINED_VE_ID,
  Metadata,
  $$VisualElement,
  $$VisualElementData,
  emitLoggingCommands,
  setMetadataTestOnly,
  setUpLogging,
  tearDownLogging,
};
