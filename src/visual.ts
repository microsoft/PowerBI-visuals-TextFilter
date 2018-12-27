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

import DataViewObjects = powerbi.extensibility.utils.dataview.DataViewObjects;
import FilterAction = powerbi.FilterAction;
import FilterManager = powerbi.extensibility.utils.filter.FilterManager;

const models: any = window["powerbi-models"];
module powerbi.extensibility.visual {
    "use strict";
    export class Visual implements IVisual {
        private target: HTMLElement;
        private searchBox: HTMLInputElement;
        private searchButton: HTMLButtonElement;
        private clearButton: HTMLButtonElement;
        private column: powerbi.DataViewMetadataColumn;
        private host: powerbi.extensibility.visual.IVisualHost;
        private visualSettings: VisualSettings;

        constructor(options: VisualConstructorOptions) {
            this.target = options.element;
            this.target.innerHTML = `<div class="text-filter-search">
                                        <input aria-label="Enter your search" type="text" placeholder="Search" name="search-field">
                                        <button class="c-glyph search-button" name="search-button">
                                          <span class="x-screen-reader">Search</span>
                                        </button>
                                        <button class="c-glyph clear-button" name="clear-button">
                                          <span class="x-screen-reader">Clear</span>
                                        </button>
                                    </div>`;
            this.searchBox = this.target.childNodes[0].childNodes[1] as HTMLInputElement;
            this.searchBox.addEventListener("keydown", (e) => {
              if (e.keyCode == 13) {
                this.performSearch(this.searchBox.value);
              }
            });
            this.searchButton = this.target.childNodes[0].childNodes[3] as HTMLButtonElement;
            this.searchButton.addEventListener("click", () => this.performSearch(this.searchBox.value));
            this.clearButton = this.target.childNodes[0].childNodes[5] as HTMLButtonElement;
            this.clearButton.addEventListener("click", () => this.performSearch(''));
            
            this.host = options.host;
        }

        /** 
         * Perfom search/filtering in a column
         * @param {string} text - text to filter on
         */
        public performSearch(text: string) {
          if (this.column) {
            const isBlank = ((text || "") + "").match(/^\s*$/);
            const target = {
              table: this.column.queryName.substr(0, this.column.queryName.indexOf('.')),
              column: this.column.queryName.substr(this.column.queryName.indexOf('.') + 1)
            };

            let filter: any = null;
            let action = FilterAction.remove;
            if (!isBlank) {
              filter = new models.AdvancedFilter(
                target,
                "And",
                {
                  operator: "Contains",
                  value: text
                }
              );
              action = FilterAction.merge;
            }
            this.host.applyJsonFilter(filter, "general", "filter", action);
          }
          this.searchBox.value = text;
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
          const settings: VisualSettings = this.visualSettings ||
         VisualSettings.getDefault() as VisualSettings;
          return VisualSettings.enumerateObjectInstances(settings, options);
         }

        /**
         *Check for update and perform it
         */
        public update(options: VisualUpdateOptions) {
            const metadata = options.dataViews && options.dataViews[0] && options.dataViews[0].metadata;
            const newColumn = metadata && metadata.columns && metadata.columns[0];
            const objectCheck = metadata && metadata.objects;
            const properties = DataViewObjects.getObject(objectCheck, "general") as any || {}; 
            let searchText = "";
            let dataView: DataView = options.dataViews[0];

            this.visualSettings = VisualSettings.parse<VisualSettings>(dataView);
            this.visualSettings.search.height = Math.max(24, this.visualSettings.search.height);

            //search box input style
            this.searchBox.placeholder = this.visualSettings.search.placeholder;
            this.searchBox.style.fontSize = this.visualSettings.search.fontSize.toString()+'px';
            this.searchBox.style.height = this.visualSettings.search.height.toString()+'px';
            this.searchBox.style.paddingRight = (2*(this.visualSettings.search.height+3)).toString()+'px';
            this.searchBox.style.borderColor = this.visualSettings.search.outline;

            //clear button style
            this.clearButton.style.width = (this.visualSettings.search.height-4).toString()+'px';
            this.clearButton.style.height = (this.visualSettings.search.height-4).toString()+'px';

            //search button style
            this.searchButton.style.width = (this.visualSettings.search.height-4).toString()+'px';
            this.searchButton.style.height = (this.visualSettings.search.height-4).toString()+'px';
            this.searchButton.style.right = (this.visualSettings.search.height - 4 + 3 + 3).toString() + 'px';

            // We had a column, but now it is empty, or it has changed.
            if (options.dataViews && options.dataViews.length > 0 && this.column && (!newColumn || this.column.queryName !== newColumn.queryName)) {
              this.performSearch("");

            // Well, it hasn't changed, then lets try to load the existing search text.
            } else if (properties.filter) {
              const appliedFilter = FilterManager.restoreFilter(properties.filter) as IAdvancedFilter;
              if (appliedFilter && appliedFilter.conditions && appliedFilter.conditions.length === 1) {
                searchText = (appliedFilter.conditions[0].value || "") + "";
              }
            }

            this.searchBox.value = searchText;
            this.column = newColumn;
        }
    }
}