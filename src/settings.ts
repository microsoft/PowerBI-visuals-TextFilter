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


import powerbi from "powerbi-visuals-api";

import { Card, ColorPicker, FontControl, FontPicker, Model, NumUpDown, Slice, ToggleSwitch } from "powerbi-visuals-utils-formattingmodel/lib/FormattingSettingsComponents";

export class TextFilterSettingsModel extends Model {
    textBox = new TextBoxSettingsCard();
    cards: Card[] = [this.textBox];

    // we don't need color picker for border color if the border is disabled
    public removeBorderColor() {
        this.textBox.slices = [this.textBox.font, this.textBox.enableBorder]
    }
}



class TextBoxSettingsCard extends Card {

    name: string = "textBox";
    displayNameKey?: string = "Visual_Textbox_Settings";
    placeholderTextKey: string = "Visual_Input_Placeholder"


    private minFontSize: number = 8;
    private defaultFontSize: number = 11;

    enableBorder = new ToggleSwitch({
        name: "border",
        displayNameKey: "Visual_Enable_Border",
        value: true
    });

    borderColor = new ColorPicker({
        name: "borderColor",
        displayNameKey: "Visual_Border_color",
        value: { value: "#000000" }
    });

    font = new FontControl({
        name: "font",
        displayNameKey: "Visual_Font",
        fontFamily: new FontPicker({
            name: "fontFamily",
            displayNameKey: "Visual_Font_Family",
            value: "Segoe UI, wf_segoe-ui_normal, helvetica, arial, sans-serif"
        }),
        fontSize: new NumUpDown({
            name: "fontSize",
            displayNameKey: "Visual_Font_Size",
            value: this.defaultFontSize,
            options: {
                minValue: {
                    type: powerbi.visuals.ValidatorType.Min,
                    value: this.minFontSize,
                }
            }
        })
    });

    slices: Slice[] = [this.font, this.enableBorder, this.borderColor];
}

