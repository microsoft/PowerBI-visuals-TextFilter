/*
 *  Power BI Visual CLI
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

import { dataViewObjectsParser } from "powerbi-visuals-utils-dataviewutils";
import DataViewObjectsParser = dataViewObjectsParser.DataViewObjectsParser;

/**
 * @class VisualSettings
 * Manages all custom properties for the visual
 * 
 * @property { TextBoxSettings } textBox    - Properties for text box display
 */
export class VisualSettings extends DataViewObjectsParser {
    public textBox: TextBoxSettings = new TextBoxSettings();
}

/**
 * @class TextBoxSettings
 * Manages properties for the text box used for searching
 * 
 * @property {string}   fontFamily      - Font family for filter
 * @property {number}   fontSize        - Font size for filter
 * @property {string}   placeholderText - Placeholder text message in box
 * @property {boolean}  border          - Show box border
 * @property {string}   borderColor     - Border color (if shown)
 */
export class TextBoxSettings {
    public fontFamily = '"Segoe UI", wf_segoe-ui_normal, helvetica, arial, sans-serif';
    public fontSize = 11;
    public placeholderText = "Search";
    public border = true;
    public borderColor = "#000000";
}