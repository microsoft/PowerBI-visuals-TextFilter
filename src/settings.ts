module powerbi.extensibility.visual {
    "use strict";
    import DataViewObjectsParser = powerbi.extensibility.utils.dataview.DataViewObjectsParser;

    export class SearchSettings {
        public placeholder: string = "Search";
        public fontSize: number = 14;
        public height: number = 38;
        public outline: string = "rgba(0,0,0,.6)";
    }

    export class VisualSettings extends DataViewObjectsParser {
        public search: SearchSettings = new SearchSettings();
    }
}