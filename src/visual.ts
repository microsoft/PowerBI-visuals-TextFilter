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

const models: any = window["powerbi-models"];
module powerbi.extensibility.visual {
    "use strict";
    export class Visual implements IVisual {
        private target: HTMLElement;
        private searchBox: HTMLInputElement;
        private clearButton: HTMLButtonElement;
        private column: powerbi.DataViewMetadataColumn;
        private host: powerbi.extensibility.visual.IVisualHost;

        constructor(options: VisualConstructorOptions) {
            this.target = options.element;
            this.target.innerHTML = `<input style="padding:0;margin:0;height:20px;border:1.1px solid #ccc" type='text' placeholder='Search'><button style="height:22px">Clear</button>`;
            this.searchBox = this.target.childNodes[0] as HTMLInputElement;
            this.searchBox.addEventListener("change", (e) => this.performSearch(this.searchBox.value));

            this.clearButton = this.target.childNodes[1] as HTMLButtonElement;
            this.clearButton.addEventListener("click", () => this.performSearch(''));
            this.host = options.host;
            console.log(models);
        }

        performSearch(text) {
            if (this.column) {
                const target = {
                    table: this.column.queryName.substr(0, this.column.queryName.indexOf('.')),
                    column: this.column.displayName
                };


                const filter = new models.AdvancedFilter(
                    target,
                    "And",
                    {
                        operator: "Contains",
                        value: text
                    }
                );

                this.host.applyJsonFilter(filter, "general", "filter");
                this.searchBox.value = text;
            }
        }

        public update(options: VisualUpdateOptions) {
            const metadata = options.dataViews && options.dataViews[0] && options.dataViews[0].metadata;
            const newColumn = metadata && metadata.columns && metadata.columns[0];

            if (this.column && (!newColumn || this.column.queryName !== newColumn.queryName)) {
                this.performSearch("");
            }

            this.column = newColumn;
        }
    }
}