const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const ExcelService = require('../services/excel.service.js');


class ExcelController {
    constructor() {
        // downloads 폴더 경로 설정
        this.excelService = new ExcelService();
    }

    // filename을 parameter로 받아서 downloads 폴더의 Excel 파일을 JSON으로 파싱
    parseExcelToJson = async (filename) => {
        
    }
    
}

module.exports = ExcelController;
