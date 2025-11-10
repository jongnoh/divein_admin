class MusinsaCsDTO {
    constructor(data) {
        this.claim_number = data['clm_no']
        this.order_number = data['ord_no']
        this.order_status = data['cb'];
        this.product_name = data['goods_nm'];
        this.product_option = data['opt_val']
        this.reason = data['cd'];
        this.claim_status = data['ce'];
        this.user_id = data['user_id'];
        this.refund_status = data['ce'];
        this.pay_amount = data['pay_amt'];
        this.refund_amount = data['refund_amt'];
        this.request_date = data['req_date'];
        this.last_up_date = data['last_up_date'];
        this.ord_opt_number = data['ord_opt_no'];
        this.goods_no = data['goods_no'];
        this.closed_date = data['dlv_date'];
        this.memo = data['memo'];
    }
    exportObject() {
        return {
            claim_number: this.claim_number,
            order_number: this.order_number,
            product_name: this.product_name,
            product_option: this.product_option,
            reason: this.reason,
            claim_status: this.claim_status,
            user_id: this.user_id,
            refund_status: this.refund_status,
            pay_amount: this.pay_amount,
            refund_amount: this.refund_amount,
            request_date: this.request_date,
            last_up_date: this.last_up_date,
            ord_opt_number: this.ord_opt_number,
            goods_no: this.goods_no,
            order_status: this.order_status,
            closed_date: this.closed_date,
            memo: this.memo
        };
    }
}
module.exports = MusinsaCsDTO;