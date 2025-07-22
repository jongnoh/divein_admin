class EzAdminCsDTO {
    constructor(data) {
        this.sent_date = data['발주일']
        this.management_number = data['관리번호']
        this.channel = data['판매처']
        this.order_number = data['주문번호']
        this.original_trace_number = data['송장번호'];
        this.return_trace_number = data['반품번호'];
        this.product_code = data['상품코드'];
        this.cs_count = data['C/S 개수'];
    }
}
module.exports = EzAdminCsDTO;