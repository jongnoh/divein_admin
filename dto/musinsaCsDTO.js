class MusinsaCsDTO {
    constructor(data) {
        this.requested_datetime = data['요청일시']
        this.order_number = data['주문번호']
        this.serial_number = data['일련번호']
        this.delivery_company = data['택배업체']
        this.return_trace_number = data['반품운송장'];
        this.original_trace_number = null
        this.claim_reason = data['클레임사유'];
        this.claim_content = data['클레임내용'];
        this.product_name = data['상품명'];
        this.product_option = data['옵션'];
        this.claim_number = null
        this.claim_status = data['클레임상태'];
    }
}
module.exports = MusinsaCsDTO;