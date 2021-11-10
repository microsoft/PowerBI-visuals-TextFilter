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
"use strict";

import "core-js/stable";
import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import DataView = powerbi.DataView;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
import IVisualEventService = powerbi.extensibility.IVisualEventService;
import { dataViewObjects } from "powerbi-visuals-utils-dataviewutils";
import FilterAction = powerbi.FilterAction;
import { IAdvancedFilter, AdvancedFilter } from "powerbi-models";
import * as d3 from "d3";
import { TextBoxSettings, VisualSettings } from "./settings";

const pxToPt = 0.75,
      fontPxAdjSml = 20,
      fontPxAdjStd = 24,
      fontPxAdjLrg = 26;

export class Visual implements IVisual {

  private target: HTMLElement;
  private searchUi: d3.Selection<HTMLDivElement, any, any, any>;
  private searchBox: d3.Selection<HTMLInputElement, any, any, any>;
  private searchButton: d3.Selection<HTMLButtonElement, any, any, any>;
  private clearButton: d3.Selection<HTMLButtonElement, any, any, any>;
  private column: powerbi.DataViewMetadataColumn;
  private host: powerbi.extensibility.visual.IVisualHost;
  private settings: VisualSettings;
  private events: IVisualEventService;

  constructor(options: VisualConstructorOptions) {
    this.events = options.host.eventService;
    this.target = options.element;
    this.searchUi = d3.select(this.target)
      .append("div")
      .classed("text-filter-search", true);
    this.searchBox = this.searchUi
      .append("input")
      .attr("aria-label", "Enter your search")
      .attr("type", "text")
      .attr("name", "search-field");
    this.searchButton = this.searchUi
      .append("button")
      .classed("c-glyph search-button", true)
      .attr("name", "search-button");
    this.searchButton
      .append("span")
      .classed("x-screen-reader", true)
      .text("Search");
    this.clearButton = this.searchUi
      .append("button")
      .classed("c-glyph clear-button", true)
      .attr("name", "clear-button");
    this.clearButton
      .append("span")
      .classed("x-screen-reader", true)
      .text("Clear");
    this.updateUiSizing();
    this.searchBox.on("keydown", (e) => {
      if (d3.event.keyCode === 13) {
        this.performSearch(this.searchBox.property("value"));
      }
    });
    this.searchButton
      .on("click", () => this.performSearch(this.searchBox.property("value")));
    this.clearButton
      .on("click", () => this.performSearch(""));
    d3.select(this.target)
      .on("contextmenu", () => {
        const
          mouseEvent: MouseEvent = d3.event,
          selectionManager = options.host.createSelectionManager();
          selectionManager.showContextMenu({}, {
            x: mouseEvent.clientX,
            y: mouseEvent.clientY
        });
        mouseEvent.preventDefault();
      });
    this.host = options.host;
  }

  public update(options: VisualUpdateOptions) {
    this.events.renderingStarted(options);
    this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);
    const metadata = options.dataViews && options.dataViews[0] && options.dataViews[0].metadata;
    const newColumn = metadata && metadata.columns && metadata.columns[0];
    const objectCheck = metadata && metadata.objects;
    const properties = <any>dataViewObjects.getObject(objectCheck, "general") || {};
    let searchText = "";

    this.updateUiSizing();

    // We had a column, but now it is empty, or it has changed.
    if (options.dataViews && options.dataViews.length > 0 && this.column && (!newColumn || this.column.queryName !== newColumn.queryName)) {
      this.performSearch("");

      // Well, it hasn't changed, then lets try to load the existing search text.
    } else if (properties.filter) {
      if (options.jsonFilters && options.jsonFilters.length > 0) {
        searchText = `${(<IAdvancedFilter[]>options.jsonFilters).map((f) => f.conditions.map((c) => c.value)).join(" ")}`;
      }
    }

    this.searchBox.property("value", searchText);
    this.column = newColumn;

    this.events.renderingFinished(options);

  }

  /**
   * Ensures that the UI is sized according to the specified properties (or defaults, if not overridden).
   */
  private updateUiSizing() {
    const
      textBox: TextBoxSettings = this.settings?.textBox ?? VisualSettings.getDefault()["textBox"],
      fontSize = textBox.fontSize,
      fontScaleSml = (fontSize / pxToPt) + fontPxAdjSml,
      fontScaleStd = (fontSize / pxToPt) + fontPxAdjStd,
      fontScaleLrg = (fontSize / pxToPt) + fontPxAdjLrg;
    this.searchUi
      .style('height', `${fontScaleStd}px`)
      .style('font-size', `${fontSize}pt`)
      .style('font-family', textBox.fontFamily);
    this.searchBox
      .attr('placeholder', textBox.placeholderText)
      .style('width', `calc(100% - ${fontScaleStd}px)`)
      .style('padding-right', `${fontScaleStd}px`)
      .style('border-style', textBox.border && 'solid' || 'none')
      .style('border-color', textBox.borderColor);
    this.searchButton
      .style('right', `${fontScaleLrg}px`)
      .style('width', `${fontScaleSml}px`)
      .style('height', `${fontScaleSml}px`)
      .style('font-size', `${fontSize}pt`);
    this.clearButton
      .style('width', `${fontScaleStd}px`)
      .style('height', `${fontScaleStd}px`);
  }

  /** 
   * Perfom search/filtering in a column
   * @param {string} text - text to filter on
   */
  public performSearch(text: string) {
    if (this.column) {
      const isBlank = ((text || "") + "").match(/^\s*$/);
      const target = {
        table: this.column.queryName.substr(0, this.column.queryName.indexOf(".")),
        column: this.column.queryName.substr(this.column.queryName.indexOf(".") + 1)
      };

      let filter: any = null;
      let action = FilterAction.remove;
      if (!isBlank) {
        filter = new AdvancedFilter(
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
    this.searchBox.property("value", text);
  }

  private static parseSettings(dataView: DataView): VisualSettings {
    return <VisualSettings>VisualSettings.parse(dataView);
  }

  /**
   * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the
   * objects and properties you want to expose to the users in the property pane.
   *
   */
  public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
    let objects = <VisualObjectInstanceEnumerationObject>
                VisualSettings.enumerateObjectInstances(
                    this.settings || VisualSettings.getDefault(),
                    options
                );
    switch (options.objectName) {
      case 'textBox': {
          if (!this.settings.textBox.border) {
            delete objects.instances[0].properties.borderColor;
          }
          break;
      }
    }
    return objects;
  }
}