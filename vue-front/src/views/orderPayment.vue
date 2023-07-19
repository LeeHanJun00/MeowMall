<template>
    <main class="container">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"
            integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM" crossorigin="anonymous">
        <h3>주문결제</h3>
        <div class="container-wrapper">
            <div class="container">
                <h5><strong>배송정보</strong></h5>
                <hr>
                <div class="mb-3">
                    <label for="userNick" class="form-label"><strong>받는사람</strong></label>
                    <input type="text" id="userNick" class="form-control" v-model="userInfo.user_nick"
                        @input="updateOrderInfo" />
                </div>
                <div class="mb-3">
                    <label for="userMobile" class="form-label"><strong>핸드폰</strong></label>
                    <input type="text" id="userMobile" class="form-control" v-model="userInfo.user_mobile"
                        @input="updateOrderInfo" />
                </div>
                <div class="mb-3">
                    <label class="form-label"><strong>주소</strong></label>
                    <div class="input-group">
                        <input type="text" class="form-control" v-model="userInfo.user_zipcode" placeholder="우편번호"
                            @input="updateOrderInfo" />
                        <button class="btn btn-outline-secondary" type="button" @click="zipload">우편번호 찾기</button>
                    </div>
                    <input type="text" class="form-control mt-2" v-model="userInfo.user_adr1" placeholder="기본 주소"
                        @input="updateOrderInfo" />
                    <input type="text" class="form-control mt-2" v-model="userInfo.user_adr2" placeholder="상세 주소"
                        @input="updateOrderInfo" />
                </div>
                <div class="mb-3">
                    <label for="userMemo" class="form-label"><strong>배송요청사항</strong></label>
                    <input type="text" id="userMemo" class="form-control" placeholder="10자 이내" v-model="order_memo" />
                </div>
                <br><br>

                <h5><strong>주문정보</strong></h5>
                <hr>
                <div v-if="this.$route.params.ordertp === '0'">
                    <div class="d-flex mb-3 orderinfo">
                        <div class="me-3">
                            <img :width="80"
                                :src="goods.goods_img ? require(`../../../node-back/uploads/uploadGoods/${goods.goods_img}`) : '/goodsempty.jpg'"
                                alt="상품 이미지">
                        </div>
                        <div class="me-3">
                            <strong>{{ goods.goods_nm }}</strong><br>
                            수량: {{ this.$route.params.quantity }}개
                        </div>
                        <div class="ms-auto">
                            <strong>총 {{ formatPrice(this.$route.params.quantity * goods.goods_price) }}</strong>
                        </div>
                    </div>
                </div>
                <div v-if="this.$route.params.ordertp === '1'">
                    <div class="d-flex mb-3 orderinfo" v-for="(cart, i) in cartList" :key="i">
                        <div class="me-3">
                            <img :width="80"
                                :src="cart.BASKET_GOODS_IMG ? require(`../../../node-back/uploads/uploadGoods/${cart.BASKET_GOODS_IMG}`) : '/goodsempty.jpg'"
                                alt="상품 이미지">
                        </div>
                        <div class="me-3">
                            <strong>{{ cart.BASKET_GOODS_NM }}</strong><br>
                            수량: {{ cart.BASKET_GOODS_COUNT }}개
                        </div>
                        <div class="ms-auto">
                            <strong>총 {{ formatPrice(cart.BASKET_GOODS_COUNT * cart.BASKET_GOODS_PRICE) }}</strong>
                        </div>
                    </div>
                </div>
                <br><br>
                <h5><strong>보유적립금</strong></h5>
                <hr>
                <div class="input-group">
                    <input type="text" class="form-control" v-model="pointInput" placeholder="5천원 이상 사용가능"
                        @input="handlePointInput" />
                    <button class="btn btn-outline-secondary" type="button" @click="pointUse">사용하기</button>
                </div>
                보유적립금 : {{ formatPrice(userInfo.user_point) }}
                <br><br><br>

                <h5><strong>최종 결제금액</strong></h5>
                <hr>
                <table class="table">
                    <tbody>
                        <tr>
                            <th scope="row" class="table-active">상품 금액</th>
                            <td colspan="2"><strong>총 {{ formatPrice(getOrderTotalPrice()) }}</strong></td>
                        </tr>
                        <tr>
                            <th scope="row" class="table-active">배송비</th>
                            <td colspan="2"><strong>{{ formatPrice(getDeliveryFee()) }}</strong></td>
                        </tr>
                        <tr>
                            <th scope="row" class="table-active">사용적립금</th>
                            <td colspan="2"><strong>{{ formatPrice(pointUsed) }}</strong></td>
                        </tr>
                        <tr>
                            <th scope="row" class="table-active">총결제금액</th>
                            <td colspan="2"><strong>{{ formatPrice(getTotalPrice()) }}</strong></td>
                        </tr>
                    </tbody>
                </table>
                <br>
                <button type="submit" class="btn btn-primary" @click="requestPay">결제하기</button>
            </div>
        </div>
    </main>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            cartList: [],
            goods: {
                goods_no: "",
                goods_nm: "",
                goods_img: "",
                goods_price: "",
            },
            userInfo: {
                user_nick: "",
                user_point: "",
                user_mobile: "",
                user_zipcode: "",
                user_adr1: "",
                user_adr2: "",
                user_no: "",
            },
            pointInput: '',
            pointUsed: 0,
            errorMessage: "",
            deliveryFee: 0,
        };
    },
    computed: {
        user() {
            return this.$store.state.user;
        },
        totalPrice() {
            return this.goods.goods_price * this.quantity;
        },
    },
    mounted() {
        if (this.user.user_no == '') {
            this.$swal("로그인 후 이용해주세요.");
            this.$router.push({ path: '/login' });
        }
    },
    created() {
        this.getGoods();
        this.getBaskets();
        this.getUser();
    },
    methods: {
        validationCheck() {
            if (this.userInfo.user_nick == "" || this.userInfo.user_nick == null) {
                this.$swal("이름을 입력하세요.");
                return false;
            }
            if (this.userInfo.user_mobile == "" || this.userInfo.user_mobile == null) {
                this.$swal("전화번호를 입력하세요.");
                return false;
            }
            if (this.userInfo.user_zipcode == "" || this.userInfo.user_zipcode == null) {
                this.$swal("우편번호를 입력하세요.");
                return false;
            }
            if (this.userInfo.user_adr1 == "" || this.userInfo.user_adr1 == null) {
                this.$swal("집주소를 입력하세요.");
                return false;
            }
            return true;
        },
        async getGoods() {
            try {
                const goodsno = this.$route.params.goodsno;
                const response = await axios.get(`http://localhost:3000/goods/goodsDetail/${goodsno}`);
                this.goods = response.data[0];
            } catch (error) {
                console.error(error);
            }
        },
        async getBaskets() {
            try {
                const response = await axios.get(`http://localhost:3000/goods/basketOrder/${this.user.user_no}`);
                this.cartList = response.data.map(cart => ({
                    ...cart,
                    totalPrice: cart.BASKET_GOODS_COUNT * cart.BASKET_GOODS_PRICE
                }));
                console.log(this.cartList);
            } catch (error) {
                console.error(error);
            }
        },
        async getUser() {
            try {
                const response = await axios.get(`http://localhost:3000/mypage/mypage/${this.user.user_no}`);
                this.userInfo = response.data[0];
            } catch (error) {
                console.error(error);
            }
        },
        updateOrderInfo() {
            this.userInfo.user_nick = this.userInfo.user_nick.trim(); // 받는사람 이름 앞뒤 공백 제거
            this.order_nm = this.userInfo.user_nick;
            this.order_mobile = this.userInfo.user_mobile;
            this.order_zipcode = this.userInfo.user_zipcode;
            this.order_adr1 = this.userInfo.user_adr1;
            this.order_adr2 = this.userInfo.user_adr2;
        },
        getDeliveryFee() {
            if (this.$route.params.ordertp === '0') {
                const totalPrice = this.$route.params.quantity * this.goods.goods_price;
                if (totalPrice >= 30000) {
                    this.deliveryFee = 0;
                } else {
                    this.deliveryFee = 3000;
                }
                return this.deliveryFee = 3000;
            } else if (this.$route.params.ordertp === '1') {
                const totalPrice = this.cartList.reduce((total, cart) => total + (cart.BASKET_GOODS_COUNT * cart.BASKET_GOODS_PRICE), 0);
                if (totalPrice >= 30000) {
                    this.deliveryFee = 0;
                } else {
                    this.deliveryFee = 3000;
                }
            }
            return this.deliveryFee;
        },
        handlePointInput() {
            this.pointInput = this.pointInput.replace(/[^0-9]/g, ''); // 숫자 이외의 값 제거
        },
        pointUse() {
            const inputPoint = parseInt(this.pointInput);
            let maxPoint;

            if (this.$route.params.ordertp === '0') {
                maxPoint = this.$route.params.quantity * this.goods.goods_price + this.deliveryFee;
            } else if (this.$route.params.ordertp === '1') {
                maxPoint = this.cartList.reduce((total, cart) => total + (cart.BASKET_GOODS_COUNT * cart.BASKET_GOODS_PRICE), 0) + this.deliveryFee;
            }

            if (this.userInfo.user_point >= 5000 && inputPoint <= this.userInfo.user_point && inputPoint <= maxPoint) {
                this.pointUsed = inputPoint;
                this.$swal("사용완료");
            } else if (this.userInfo.user_point < 5000) {
                this.$swal("사용할 수 있는 포인트가 부족합니다.");
            } else if (inputPoint > this.userInfo.user_point) {
                this.$swal("금액이 부족합니다.");
            } else if (inputPoint > maxPoint) {
                this.$swal("적립금 사용 가능한 금액을 초과합니다.");
            } else {
                this.$swal("금액을 정확히 입력해주세요");
            }

            this.pointInput = '';
            this.errorMessage = '';
        },
        getTotalPrice() {
            if (this.$route.params.ordertp === '0') {
                const totalPrice = this.$route.params.quantity * this.goods.goods_price;
                return totalPrice + this.deliveryFee - this.pointUsed;
            } else if (this.$route.params.ordertp === '1') {
                const totalPrice = this.cartList.reduce((total, cart) => total + (cart.BASKET_GOODS_COUNT * cart.BASKET_GOODS_PRICE), 0);
                return totalPrice + this.deliveryFee - this.pointUsed;
            } else {
                return 0;
            }
        },
        requestPay() {

            if (!this.validationCheck()) {
                return;
            }


            let amount;
            let order_detail;

            if (this.$route.params.ordertp === '0') {
                amount = this.$route.params.quantity * this.goods.goods_price;
                order_detail = {
                    goods_cnt: this.$route.params.quantity,
                    goods_no: this.$route.params.goodsno,
                    order_goods_nm: this.goods.goods_nm,
                    order_goods_img: this.goods.goods_img,
                    order_goods_price: this.goods.goods_price,
                    order_goods_cnt: this.$route.params.quantity,
                };
            } else if (this.$route.params.ordertp === '1') {
                amount = this.cartList.reduce((total, cart) => total + (cart.BASKET_GOODS_COUNT * cart.BASKET_GOODS_PRICE), 0);
                order_detail = this.cartList.map((cart) => ({
                    goods_no: cart.BASKET_GOODS_NO,
                    order_goods_nm: cart.BASKET_GOODS_NM,
                    order_goods_img: cart.BASKET_GOODS_IMG,
                    order_goods_price: cart.BASKET_GOODS_PRICE,
                    order_goods_cnt: cart.BASKET_GOODS_COUNT,
                }));
            }

            const total = amount + this.deliveryFee - this.pointUsed;

            let name;
            if (this.$route.params.ordertp === '0') {
                name = this.goods.goods_nm;
            } else if (this.$route.params.ordertp === '1' && this.cartList.length > 1) {
                name = this.cartList[0].BASKET_GOODS_NM + ' 외 ' + (this.cartList.length - 1) + '건'
            } else if (this.$route.params.ordertp === '1' && this.cartList.length == 1) {
                name = this.cartList[0].BASKET_GOODS_NM
            }

            const IMP = window.IMP;
            IMP.init("imp38753765");

            IMP.request_pay(
                {
                    pg: "html5_inicis",
                    pay_method: "card",
                    name: name,
                    amount: total,
                    buyer_addr: this.userInfo.user_adr1 + this.userInfo.user_adr2,
                    buyer_name: this.userInfo.user_nick,
                    buyer_postcode: this.userInfo.user_zipcode,
                    buyer_tel: this.userInfo.user_mobile,
                },
                (rsp) => {
                    // callback
                    if (rsp.success) {
                        axios({
                            url: "http://localhost:3000/goods/orderPayment/",
                            method: "POST",
                            data: {
                                order: {
                                    order_nm: this.userInfo.user_nick,
                                    order_adr1: this.userInfo.user_adr1,
                                    order_adr2: this.userInfo.user_adr2,
                                    order_zipcode: this.userInfo.user_zipcode,
                                    order_mobile: this.userInfo.user_mobile,
                                    order_memo: this.order_memo !== undefined ? this.order_memo.trim() : '없음',
                                    order_amt: amount,
                                    order_dc: this.pointUsed,
                                    order_delivery: this.deliveryFee,
                                    order_total: total,
                                    user_no: this.user.user_no,
                                    order_tp: parseInt(this.$route.params.ordertp),
                                },
                                order_detail: order_detail,
                            }
                        })
                            .then(() => {
                                this.$swal("구매가 완료되었습니다!");
                                axios.post(`http://localhost:3000/goods/basketSuccess/${this.user.user_no}`)
                                window.location.href = "http://localhost:8080/mypage/orderList";
                            })
                            .catch((error) => {
                                this.$swal("결제에 실패하였습니다.");
                                console.log(error);
                            });
                    } else {
                        console.log("결제실패" + rsp.error_msg);
                        alert("결제에 실패했습니다!!");
                    }
                }
            );
        },
        getOrderTotalPrice() {
            if (this.$route.params.ordertp === '0') {
                return this.$route.params.quantity * this.goods.goods_price;
            } else if (this.$route.params.ordertp === '1') {
                return this.cartList.reduce((total, cart) => total + cart.totalPrice, 0);
            } else {
                return 0;
            }
        },
        formatPrice(price) {
            if (price !== undefined) {
                const formattedPrice = price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                return `${formattedPrice} 원`;
            }
            return "";
        },
        zipload() {
            new window.daum.Postcode({
                oncomplete: (data) => {
                    // 각 주소의 노출 규칙에 따라 주소를 조합한다.
                    // 내려오는 변수가 값이 없는 경우엔 공백('')값을 가지므로, 이를 참고하여 분기 한다.
                    var addr = ''; // 주소 변수
                    var extraAddr = '';
                    //사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져온다.
                    if (data.userSelectedType === 'R') { // 사용자가 도로명 주소를 선택했을 경우
                        addr = data.roadAddress;
                    } else { // 사용자가 지번 주소를 선택했을 경우(J)
                        addr = data.jibunAddress;
                    }
                    // 사용자가 선택한 주소가 도로명 타입일때 참고항목을 조합한다.
                    if (data.userSelectedType === 'R') {
                        // 법정동명이 있을 경우 추가한다. (법정리는 제외)
                        // 법정동의 경우 마지막 문자가 "동/로/가"로 끝난다.
                        if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
                            // addr += ' ';
                            extraAddr += data.bname;
                        }
                        // 건물명이 있고, 공동주택일 경우 추가한다.
                        if (data.buildingName !== '' && data.apartment === 'Y') {
                            // addr += ' ';
                            extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
                        }
                    }
                    this.userInfo.user_zipcode = data.zonecode;
                    this.userInfo.user_adr1 = addr;
                    this.userInfo.user_adr2 = extraAddr;
                    this.zipinput = true;
                }
            }).open();
        },
    },
};
</script>

<style scoped>
hr {
    border: 2px solid #FFAF7D;
}

.container-wrapper {
    border: 1px solid #ddd;
    padding: 20px;
}

.container {
    max-width: 800px;
    width: 80%;
    margin: auto;
    padding-top: 30px;
    padding-bottom: 30px;
    font-family: GmarketSansMedium;
}

img {
    border-radius: 10%;
    background-color: #eeeeee;
}
</style>