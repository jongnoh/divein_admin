const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

class ExcelService {
    constructor() {

           // 다운로드 경로 설정
    const path = require('path');
    const fs = require('fs');
    const downloadPath = path.join(__dirname, '../downloads'); // 프로젝트 루트의 downloads 폴더
    const csListPath = path.join(__dirname, '../csList'); // CSV 저장 폴더
    
    // 다운로드 폴더가 없으면 생성
    if (!fs.existsSync(downloadPath)) {
      fs.mkdirSync(downloadPath, { recursive: true });
      console.log('다운로드 폴더 생성:', downloadPath);
    }
    
    // cslist 폴더가 없으면 생성
    if (!fs.existsSync(csListPath)) {
      fs.mkdirSync(csListPath, { recursive: true });
      console.log('cslist 폴더 생성:', csListPath);
    }
      
    this.downloadPath = downloadPath; // 나중에 사용할 수 있도록 저장
    this.csListPath = csListPath; // CSV 저장 경로
    
    }


    // CSV 값을 이스케이프 처리하는 헬퍼 메서드 (강화된 버전)
    escapeCsvValue = (value) => {
        if (!value) return '';
        
        let strValue = value.toString();
        
        // 백슬래시 이스케이프 처리
        strValue = strValue.replace(/\\/g, '\\\\');
        
        // 줄바꿈 문자를 공백으로 변환 (CSV 파싱 오류 방지)
        strValue = strValue.replace(/\r\n/g, ' ').replace(/\n/g, ' ').replace(/\r/g, ' ');
        
        // 연속된 공백을 하나로 변환
        strValue = strValue.replace(/\s+/g, ' ').trim();
        
        // 문제가 되는 쉼표들을 안전한 구분자로 변환
        // 내부 쉼표를 세미콜론으로 변환 (CSV 파싱 오류 방지)
        const hasProblematicCommas = strValue.includes(',,') || 
                                     (strValue.includes(',') && strValue.length > 50);
        
        if (hasProblematicCommas) {
            console.log(`문제 쉼표 처리: "${strValue.substring(0, 50)}..."`);
            // 연속된 쉼표를 세미콜론으로 변환
            strValue = strValue.replace(/,+/g, ';');
        }
        
        // 쉼표, 줄바꿈, 따옴표, 백슬래시가 포함된 경우 따옴표로 감싸기
        if (strValue.includes(',') || strValue.includes('\n') || strValue.includes('\r') || 
            strValue.includes('"') || strValue.includes('\\') || strValue.includes(';')) {
            // 내부 따옴표는 두 개로 변환
            const escapedValue = strValue.replace(/"/g, '""');
            return `"${escapedValue}"`;
        }
        
        return strValue;
    }

    

    // CSVDATA 필터링 메서드
    filterCsvDataForEzAdminReturn = (csvData) => {
        try {
            console.log('=== CSV 데이터 EzAdmin 반품 처리 시작 ===');
            if (!csvData || typeof csvData !== 'string') {
                throw new Error('CSV 데이터가 유효하지 않습니다.');
            }

            // BOM 제거 (있는 경우)
            const cleanCsvData = csvData.replace(/^\uFEFF/, '');
            
            // CSV를 라인별로 분리
            const lines = cleanCsvData.split('\n').filter(line => line.trim() !== '');
            
            if (lines.length === 0) {
                console.log('CSV 데이터가 비어있습니다.');
                return '';
            }
            
            // 첫 번째 라인은 헤더
            const originalHeaders = this.parseCsvLine(lines[0]);
            console.log(`원본 헤더 (${originalHeaders.length}개):`, originalHeaders);
            
            // 기본 헤더들 정의
            const baseHeaders = ['발주일', '관리번호', '판매처', '주문번호', '송장번호', '상품코드', 'C/S 개수', 'C/S 내역'];
            
            // 빈 헤더 인덱스들 찾기
            const emptyHeaderIndexes = [];
            originalHeaders.forEach((header, index) => {
                const cleanHeader = header ? header.toString().trim() : '';
                if (cleanHeader === '' || cleanHeader === '""') {
                    emptyHeaderIndexes.push(index);
                }
            });
            
            console.log('빈 헤더 인덱스들:', emptyHeaderIndexes);
            console.log('기본 헤더들:', baseHeaders);
            
            // 처리된 데이터 저장할 배열
            const processedRows = [];
            
            console.log(`총 데이터 행 수: ${lines.length - 1}개`);
            
            // 데이터 행 처리
            for (let i = 1; i < lines.length; i++) {
                const currentLine = lines[i].trim();
                if (!currentLine) {
                    console.log(`행 ${i}: 빈 행 건너뛰기`);
                    continue; // 빈 행 건너뛰기
                }
                
                const values = this.parseCsvLine(currentLine);
                console.log(`행 ${i} 원본 값들 (${values.length}개):`, values);
                
                const processedRow = {};
                
                // 기본 헤더들 매핑 (대소문자 구분 없이, 공백 제거)
                baseHeaders.forEach(header => {
                    // 헤더 이름을 정확히 찾기 위해 trim과 대소문자 비교
                    const headerIndex = originalHeaders.findIndex(h => 
                        h && h.toString().trim().toLowerCase() === header.toLowerCase()
                    );
                    
                    if (headerIndex !== -1) {
                        let value = values[headerIndex] || '';
                        // 따옴표 제거
                        if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) {
                            value = value.slice(1, -1);
                        }
                        processedRow[header] = value.toString().trim();
                        console.log(`  ${header} [${headerIndex}]: "${processedRow[header]}"`);
                    } else {
                        processedRow[header] = '';
                        console.log(`  ${header}: 헤더 없음, 빈 값 설정`);
                    }
                });
                
                // C/S 개수를 기반으로 추가 C/S 내역 헤더들 생성
                const csCount = parseInt(processedRow['C/S 개수']) || 0;
                console.log(`  C/S 개수: ${csCount}`);
                
                // 빈 헤더들을 C/S 내역2, C/S 내역3 등으로 매핑
                let csIndex = 2; // C/S 내역1은 기본 'C/S 내역'이므로 2부터 시작
                emptyHeaderIndexes.forEach(emptyIndex => {
                    if (csIndex <= csCount + 1) { // C/S 개수만큼 추가 헤더 생성
                        const csHeaderName = `C/S 내역${csIndex}`;
                        let value = values[emptyIndex] || '';
                        
                        // 따옴표 제거
                        if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) {
                            value = value.slice(1, -1);
                        }
                        
                        processedRow[csHeaderName] = value.toString().trim();
                        console.log(`  ${csHeaderName} [${emptyIndex}]: "${processedRow[csHeaderName]}"`);
                        csIndex++;
                    }
                });
                
                // '자동취소' 필터링: C/S 개수에 해당하는 마지막 C/S 내역에서 '자동취소' 포함 시 해당 행 삭제
                let shouldSkipRow = false;
                if (csCount > 1) {
                    const lastCsHeaderName = `C/S 내역${csCount}`;
                    const lastCsValue = processedRow[lastCsHeaderName] || '';
                    
                    if (lastCsValue.includes('자동취소')) {
                        console.log(`  행 ${i}: '${lastCsHeaderName}'에 '자동취소' 포함으로 인해 삭제 - "${lastCsValue}"`);
                        shouldSkipRow = true;
                    }
                    if (lastCsValue.includes('전체취소')) {
                        console.log(`  행 ${i}: '${lastCsHeaderName}'에 '전체취소' 포함으로 인해 삭제 - "${lastCsValue}"`);
                        shouldSkipRow = true;
                    }
                    if (lastCsValue.includes('개별취소')) {
                        console.log(`  행 ${i}: '${lastCsHeaderName}'에 '개별취소' 포함으로 인해 삭제 - "${lastCsValue}"`);
                        shouldSkipRow = true;
                    }
                } else if (csCount === 1) {
                    // C/S 개수가 1인 경우 기본 C/S 내역(C/S 내역1이 될 예정)을 확인
                    const csValue = processedRow['C/S 내역'] || '';
                    if (csValue.includes('자동취소')) {
                        console.log(`  행 ${i}: 'C/S 내역1'에 '자동취소' 포함으로 인해 삭제 - "${csValue}"`);
                        shouldSkipRow = true;
                    }
                                        if (csValue.includes('개별취소')) {
                        console.log(`  행 ${i}: 'C/S 내역1'에 '개별취소' 포함으로 인해 삭제 - "${csValue}"`);
                        shouldSkipRow = true;
                    }
                                        if (csValue.includes('전체취소')) {
                        console.log(`  행 ${i}: 'C/S 내역1'에 '전체취소' 포함으로 인해 삭제 - "${csValue}"`);
                        shouldSkipRow = true;
                    }
                    
                }
                
                if (shouldSkipRow) {
                    console.log(`행 ${i} 자동취소로 인해 건너뛰기`);
                    continue;
                }
                
                processedRows.push(processedRow);
                console.log(`행 ${i} 처리 완료:`, Object.keys(processedRow));
            }
            
            // 모든 행에서 사용된 C/S 내역 키들 수집
            const allCsKeys = new Set();
            processedRows.forEach(row => {
                Object.keys(row).forEach(key => {
                    if (key.startsWith('C/S 내역') && key !== 'C/S 내역') {
                        allCsKeys.add(key);
                    }
                });
            });
            
            // C/S 내역 키들을 숫자 순으로 정렬
            const sortedCsKeys = Array.from(allCsKeys).sort((a, b) => {
                const aNum = parseInt(a.replace('C/S 내역', '')) || 0;
                const bNum = parseInt(b.replace('C/S 내역', '')) || 0;
                return aNum - bNum;
            });
            
            // 최종 헤더 생성 (C/S 내역을 C/S 내역1로 변경)
            const finalHeaders = [];
            
            // 기본 헤더들 추가하되 'C/S 내역'은 'C/S 내역1'로 변경
            baseHeaders.forEach(header => {
                if (header === 'C/S 내역') {
                    finalHeaders.push('C/S 내역1');
                } else {
                    finalHeaders.push(header);
                }
            });
            
            // 추가 C/S 내역 헤더들 추가
            finalHeaders.push(...sortedCsKeys);
            
            console.log('최종 헤더:', finalHeaders);
            
            // CSV 형식으로 변환
            const csvLines = [];
            
            // 헤더 라인 추가
            csvLines.push(finalHeaders.map(header => this.escapeCsvValue(header)).join(','));
            
            // 데이터 라인들 추가
            processedRows.forEach(row => {
                const csvRow = finalHeaders.map(header => {
                    let value = '';
                    
                    // 'C/S 내역1'인 경우 원본 'C/S 내역' 값을 사용
                    if (header === 'C/S 내역1') {
                        value = row['C/S 내역'] || '';
                    } else {
                        value = row[header] || '';
                    }
                    
                    return this.escapeCsvValue(value);
                });
                csvLines.push(csvRow.join(','));
            });
            
            const resultCsv = csvLines.join('\n');
            
            console.log(`원본 데이터: ${lines.length - 1}개, 처리 후: ${processedRows.length}개`);
            return resultCsv;

        } catch (error) {
            console.error('CSV EzAdmin 반품 처리 오류:', error);
            throw error;
        }
    }

        convertCsvToJson(csvData) {
        if (!csvData || typeof csvData !== 'string') {
            console.log('CSV 데이터가 유효하지 않습니다.');
            return [];
        }

        try {
            // 줄바꿈 문자 정규화
            const normalizedData = csvData.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
            const lines = normalizedData.split('\n').filter(line => line.trim());

            if (lines.length < 2) {
                console.log('CSV 데이터에 충분한 행이 없습니다.');
                return [];
            }

            // 헤더 파싱
            const headers = this.parseCsvLine(lines[0]);
            const jsonData = [];

            // 데이터 행들을 처리
            for (let i = 1; i < lines.length; i++) {
                const values = this.parseCsvLine(lines[i]);
                const row = {};

                // 헤더 수만큼만 처리
                for (let j = 0; j < headers.length; j++) {
                    row[headers[j]] = values[j] || '';
                }

                if (Object.keys(row).length > 0) {
                    jsonData.push(row);
                }
            }

            console.log(`CSV to JSON 변환 완료: ${jsonData.length}개 행 처리`);
            return jsonData;

        } catch (error) {
            console.error('CSV to JSON 변환 중 오류 발생:', error);
            return [];
        }
    }
/**
 * Excel XML 파일을 JSON 데이터로 변환
 * @param {string} filePath - Excel XML 파일 경로
 * @returns {Array} JSON 배열
 */
convertExcelXmlToJson(filePath) {
    try {
        const fs = require('fs');
        
        // 파일 읽기
        const xmlData = fs.readFileSync(filePath, 'utf8');
        
        // XML에서 데이터 추출
        const jsonData = this.parseExcelXml(xmlData);
        
        console.log(`Excel XML to JSON 변환 완료: ${jsonData.length}개 행 처리`);
        return jsonData;
        
    } catch (error) {
        console.error('Excel XML to JSON 변환 중 오류 발생:', error);
        return [];
    }
}

/**
 * Excel XML 데이터를 파싱하여 JSON으로 변환
 * @param {string} xmlData - XML 문자열
 * @returns {Array} JSON 배열
 */
parseExcelXml(xmlData) {
    try {
        // Row 태그들을 추출
        const rowMatches = xmlData.match(/<Row>(.*?)<\/Row>/gs);
        
        if (!rowMatches || rowMatches.length === 0) {
            console.log('XML에서 데이터 행을 찾을 수 없습니다.');
            return [];
        }
        
        const rows = [];
        
        // 각 Row를 처리
        rowMatches.forEach(rowMatch => {
            const cells = this.extractCellsFromRow(rowMatch);
            rows.push(cells);
        });
        
        if (rows.length === 0) {
            return [];
        }
        
        // 첫 번째 행을 헤더로 사용
        const headers = rows[0];
        const dataRows = rows.slice(1);
        
        // JSON 객체 배열로 변환
        const jsonData = dataRows.map(row => {
            const obj = {};
            headers.forEach((header, index) => {
                obj[header] = row[index] || '';
            });
            return obj;
        });
        
        return jsonData;
        
    } catch (error) {
        console.error('XML 파싱 중 오류 발생:', error);
        return [];
    }
}

/**
 * Row에서 Cell 데이터를 추출
 * @param {string} rowData - Row XML 문자열
 * @returns {Array} 셀 데이터 배열
 */
extractCellsFromRow(rowData) {
    const cells = [];
    
    // Cell 태그들을 추출
    const cellMatches = rowData.match(/<Cell[^>]*>(.*?)<\/Cell>/gs);
    
    if (cellMatches) {
        cellMatches.forEach(cellMatch => {
            // CDATA 섹션에서 데이터 추출
            const cdataMatch = cellMatch.match(/<!\[CDATA\[(.*?)\]\]>/s);
            if (cdataMatch) {
                let cellValue = cdataMatch[1];
                
                // &nbsp; 처리
                cellValue = cellValue.replace(/&nbsp;/g, ' ');
                
                // HTML 엔티티 디코딩
                cellValue = this.decodeHtmlEntities(cellValue);
                
                cells.push(cellValue.trim());
            } else {
                // CDATA가 없는 경우 Data 태그에서 추출
                const dataMatch = cellMatch.match(/<Data[^>]*>(.*?)<\/Data>/s);
                if (dataMatch) {
                    cells.push(dataMatch[1].trim());
                } else {
                    cells.push('');
                }
            }
        });
    }
    
    return cells;
}

/**
 * HTML 엔티티 디코딩
 * @param {string} str - 디코딩할 문자열
 * @returns {string} 디코딩된 문자열
 */
decodeHtmlEntities(str) {
    const entities = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'",
        '&nbsp;': ' '
    };
    
    return str.replace(/&[#\w]+;/g, (entity) => {
        return entities[entity] || entity;
    });
}

    
    // CSV 라인을 파싱하는 헬퍼 메서드
    parseCsvLine = (line) => {
        const result = [];
        let current = '';
        let inQuotes = false;
        let i = 0;
        
        while (i < line.length) {
            const char = line[i];
            
            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    // 이스케이프된 따옴표
                    current += '"';
                    i += 2;
                } else {
                    // 따옴표 시작/끝
                    inQuotes = !inQuotes;
                    i++;
                }
            } else if (char === ',' && !inQuotes) {
                // 필드 구분자
                result.push(current);
                current = '';
                i++;
            } else {
                current += char;
                i++;
            }
        }
        
        // 마지막 필드 추가
        result.push(current);
        
        return result;
    }

    // 큰 숫자를 문자열로 보존 (주문번호, 송장번호 등)
    preserveLargeNumber = (value) => {
        if (!value || typeof value !== 'string') return value;
        
        // 숫자만으로 이루어져 있고 길이가 12자 이상인 경우 문자열로 보존
        const numericValue = value.replace(/[^\d]/g, '');
        if (numericValue.length >= 12 && numericValue === value) {
            return value; // 문자열로 그대로 반환
        }
        return value;
    }

    // HTML 파일을 파싱하여 CSV로 변환 (빈 헤더 포함, 큰 숫자 보존)
    parseHtmlToCsvForOrderList = (fileName) => {
        try {
            console.log(`HTML 파일 파싱 시작: ${fileName}`);
            
            const filePath = path.join(this.downloadPath, fileName);
            
            // 파일 존재 확인
            if (!fs.existsSync(filePath)) {
                throw new Error(`파일을 찾을 수 없습니다: ${filePath}`);
            }
            
            const htmlContent = fs.readFileSync(filePath, 'utf8');
            const $ = cheerio.load(htmlContent);
            
            console.log('HTML 콘텐츠 로드 완료');
            
            // 테이블 찾기
            const table = $('table').first();
            if (table.length === 0) {
                throw new Error('HTML 파일에서 테이블을 찾을 수 없습니다.');
            }
            
            console.log('테이블 발견');
            
            const csvRows = [];
            let maxColumns = 0;
            
            // 먼저 모든 행을 확인해서 최대 컬럼 수 찾기
            table.find('tr').each((rowIndex, row) => {
                const columnCount = $(row).find('td, th').length;
                if (columnCount > maxColumns) {
                    maxColumns = columnCount;
                }
            });
            
            console.log(`최대 컬럼 수: ${maxColumns}`);
            
            // 주문번호와 송장번호 컬럼 인덱스 찾기
            let orderNumberColIndex = -1;
            let trackingNumberColIndex = -1;
            
            // 각 행 처리
            table.find('tr').each((rowIndex, row) => {
                const rowData = [];
                const cells = $(row).find('td, th');
                
                // 첫 번째 행에서 주문번호와 송장번호 컬럼 찾기
                if (rowIndex === 0) {
                    cells.each((cellIndex, cell) => {
                        const cellText = $(cell).text().trim();
                        if (cellText.includes('주문번호')) {
                            orderNumberColIndex = cellIndex;
                            console.log(`주문번호 컬럼 발견: ${cellIndex}번째`);
                        }
                        if (cellText.includes('송장번호')) {
                            trackingNumberColIndex = cellIndex;
                            console.log(`송장번호 컬럼 발견: ${cellIndex}번째`);
                        }
                    });
                }
                
                // 각 컬럼 처리 (빈 컬럼도 포함)
                for (let colIndex = 0; colIndex < maxColumns; colIndex++) {
                    let cellValue = '';
                    
                    if (colIndex < cells.length) {
                        const cell = cells.eq(colIndex);
                        cellValue = cell.text().trim();
                        
                        // 특수 문자 및 이스케이프 문자 정리
                        cellValue = cellValue.replace(/\t/g, ' '); // 탭을 공백으로
                        cellValue = cellValue.replace(/\u00A0/g, ' '); // Non-breaking space를 공백으로
                        cellValue = cellValue.replace(/\u200B/g, ''); // Zero-width space 제거
                        
                        // 연속된 공백을 하나로 변환
                        cellValue = cellValue.replace(/\s+/g, ' ').trim();
                        
                        // 주문번호나 송장번호 컬럼인 경우 큰 숫자 보존 처리
                        if (colIndex === orderNumberColIndex || colIndex === trackingNumberColIndex) {
                            cellValue = this.preserveLargeNumber(cellValue);
                            if (rowIndex > 0 && cellValue) { // 헤더가 아니고 값이 있는 경우
                                console.log(`${colIndex === orderNumberColIndex ? '주문번호' : '송장번호'} [행${rowIndex}]: "${cellValue}"`);
                            }
                        } else {
                            // 다른 컬럼도 큰 숫자 보존 처리
                            cellValue = this.preserveLargeNumber(cellValue);
                        }
                        
                        // 문제가 되는 긴 데이터 로깅
                        if (cellValue.length > 100) {
                            console.log(`긴 데이터 발견 [행${rowIndex}, 열${colIndex}]: "${cellValue.substring(0, 100)}..."`);
                        }
                        
                        // 백슬래시나 특수 문자 포함 데이터 로깅
                        if (cellValue.includes('\\') || cellValue.includes('\n') || cellValue.includes('\r')) {
                            console.log(`특수 문자 포함 데이터 [행${rowIndex}, 열${colIndex}]: "${cellValue}"`);
                        }
                    }
                    
                    // 빈 값이어도 추가 (순서 유지를 위해)
                    rowData.push(cellValue);
                }
                
                csvRows.push(rowData);
                
                if (rowIndex === 0) {
                    console.log('헤더 행:', rowData.slice(0, 10)); // 처음 10개만 출력
                } else if (rowIndex <= 3) {
                    console.log(`데이터 행 ${rowIndex}:`, rowData.slice(0, 5)); // 처음 5개만 출력
                }
            });
            
            if (csvRows.length === 0) {
                throw new Error('파싱할 데이터가 없습니다.');
            }
            
            // CSV 형식으로 변환 (안전한 처리)
            const csvContent = csvRows.map((row, rowIndex) => {
                const escapedRow = row.map((cell, colIndex) => {
                    const escapedCell = this.escapeCsvValue(cell);
                    
                    // 첫 번째 행이나 긴 데이터인 경우 로깅
                    if (rowIndex === 0 || (cell && cell.length > 100)) {
                        console.log(`CSV 변환 [행${rowIndex}, 열${colIndex}]: "${cell}" → "${escapedCell}"`);
                    }
                    
                    return escapedCell;
                });
                
                return escapedRow.join(',');
            }).join('\n');
            
            // CSV 내용 검증
            const lines = csvContent.split('\n');
            let invalidLines = [];
            
            lines.forEach((line, index) => {
                // 쉼표 개수 검증 (헤더 행 기준)
                const expectedCommas = csvRows[0].length - 1;
                const actualCommas = (line.match(/,/g) || []).length;
                
                if (actualCommas !== expectedCommas) {
                    invalidLines.push({
                        line: index + 1,
                        expected: expectedCommas,
                        actual: actualCommas,
                        content: line.substring(0, 100) + (line.length > 100 ? '...' : '')
                    });
                }
            });
            
            if (invalidLines.length > 0) {
                console.warn('CSV 형식 불일치 발견:', invalidLines);
            }
            
            console.log(`HTML 파싱 완료: ${fileName}, ${csvRows.length}행, ${maxColumns}열, CSV 길이: ${csvContent.length}자`);
            console.log(`CSV 형식 검증: ${lines.length}행 중 ${invalidLines.length}행 불일치`);
            return csvContent;
            
        } catch (error) {
            console.error(`HTML 파일 파싱 오류 (${fileName}):`, error);
            throw error;
        }
    }

    getMusinsaCsListPath = async () => {
        try {
            return path.join(this.csListPath, 'musinsa.xls')
        } catch (error) {
            console.error('excel.controller.getMusinsaCsListPath 오류 발생:', error);
            throw error;
        }
    }
    getEzAdminCsListPath = async () => {
        try {
            return path.join(this.csListPath, 'ezAdmin.csv')
        } catch (error) {
            console.error('excel.controller.getEzAdminCsListPath 오류 발생:', error);
            throw error;
        }
    }
}
module.exports = ExcelService;
