<template>
    <main class="mt-3">
        <div class="container">
            <div class="container-wrapper">
                <div>
                    <h2>주문 상세내역</h2>
                </div>
                <div class="my">
                    <div class="table">
                        <div class="datetime">주문일자 : {{ formatDateTime(order.ORDER_CREATE_DT) }} &nbsp; &nbsp; | &nbsp; &nbsp; 주문번호 : {{
                            order.ORDER_TRADE_NO }}</div>
                        <div class="info">
                            <hr><br>
                            <div class="detail">
                                <p>닉네임</p>
                                <div>
                                    <h4>{{ order.ORDER_NM }}</h4>
                                </div>
                            </div>
                            <div class="detail">
                                <p>전화번호</p>
                                <div>
                                    <h4>{{ order.ORDER_MOBILE }}</h4>
                                </div>
                            </div>
                            <div class="detail">
                                <p>배송 주소</p>
                                <div class="de">
                                    <h4>{{ order.ORDER_ADR1 }} {{ order.ORDER_ADR2 }}</h4>
                                </div>
                            </div>
                            <div class="detail">
                                <p>배송요청사항</p>
                                <div>
                                    <h4>{{ order.ORDER_MEMO }}</h4>
                                </div>
                            </div>
                            <!--선-->
                            <hr><br>
                            <div class="detail">
                                <p>상품 정보</p>
                                <div>
                                    <table class="orderinfo">
                                        <tbody>
                                            <tr v-for="(orderD, i) in orderDList" :key="i">
                                                <td class="image">
                                                    <img :width="80"
                                                        :src="orderD.ORDER_GOODS_IMG ? require(`../../../node-back/uploads/uploadGoods/${orderD.ORDER_GOODS_IMG}`) : '/goodsempty.jpg'"
                                                        alt="상품 이미지" />
                                                </td>
                                                <td>{{ orderD.ORDER_GOODS_NM }}</td>
                                                <td class="cnt">수량 : {{ orderD.ORDER_GOODS_CNT }}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <!--선-->
                            <br>
                            <hr><br>
                            <div class="detail">
                                <p>총 상품 금액</p>
                                <div>
                                    <h4>{{ formatPrice(order.ORDER_AMT) }}</h4>
                                </div>
                            </div>
                            <div class="detail">
                                <p>배송비</p>
                                <div>
                                    <h4>{{ formatPrice(order.ORDER_DELIVERY) }}</h4>
                                </div>
                            </div>
                            <div class="detail">
                                <p>사용 적립금</p>
                                <div>
                                    <h4>{{ formatPrice(order.ORDER_DC) }}</h4>
                                </div>
                            </div>
                            <div class="detail" style="color: #FFAF7D">
                                <p style="color: #FFAF7D">총 결제금액</p>
                                <div>
                                    <h4>{{ formatPrice(order.ORDER_TOTAL) }}</h4>
                                </div>
                            </div>
                            <div class="detail">
                                <p>적립 포인트</p>
                                <div>
                                    <h4>{{ formatPrice(order.ORDER_TOTAL * 0.05) }}</h4>
                                </div>
                            </div>

                            <div class="celbtn">
                                <button v-if="[0, 1, 2].includes(order.ORDER_STATUS)" type="button" class="catbtn"
                                    @click="cancel()">주문 취소</button>
                                <h2 v-if="order.ORDER_STATUS === 3" style="color: #FFAF7D;">구매 확정 완료</h2>
                                <h2 v-if="order.ORDER_STATUS === 9" style="color: #FFAF7D;">주문 취소 완료</h2>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
</template>

  
<script>
import axios from 'axios';

export default {
    // el: "#app",

    data() {
        return {
            // num: 0,
            loginUser: {},
            order: {},
            orderDList: []
        };
    },
    computed: {
        user() {
            return this.$store.state.user;
        }
    },
    created() {
        this.getUser();
        this.getOrder();
        this.getOrderDetail();
    },
    methods: {
        async getUser() {
            try {
                console.log(this.user.user_no);
                const response = await axios.get(`http://localhost:3000/mypage/mypage/${this.user.user_no}`);
                this.loginUser = response.data[0];
            } catch (error) {
                console.error(error);
            }
        },
        async getOrder() {
            try {
                const orderno = this.$route.params.orderno;
                const response = await axios.get(`http://localhost:3000/goods/orderODetail/${orderno}`);
                this.order = response.data[0];
            } catch (error) {
                console.error(error);
            }
        },
        async getOrderDetail() {
            try {
                const orderno = this.$route.params.orderno;
                const response = await axios.get(`http://localhost:3000/goods/orderDDetail/${orderno}`);
                this.orderDList = response.data;
            } catch (error) {
                console.error(error);
            }
        },
        formatPrice(price) {
            if (price !== undefined) {
                const formattedPrice = price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                return `${formattedPrice} 원`;
            }
            return "";
        },
        formatDateTime(dateTime) {
            const date = new Date(dateTime);
            const options = {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                hour12: true,
            };
            const formattedDateTime = date.toLocaleString('ko-KR', options);
            return formattedDateTime;
        },
        cancel() {
            const ORDER_DC = this.order.ORDER_DC || 0;
            const goods = this.orderDList.map((orderD) => ({
                goods_cnt: orderD.ORDER_GOODS_CNT,
                goods_no: orderD.GOODS_NO,
            }));
            this.$swal({
                title: '구매취소하시겠습니까?',
                showDenyButton: true,
                confirmButtonText: '확인',
                denyButtonText: `취소`,
            }).then(result => {
                if (result.value) {
                    axios({
                        url: "http://localhost:3000/goods/admin/updateStatus",
                        method: "POST",
                        data: {
                            status: 9,
                            orderTradeNos: this.$route.params.orderno
                        },
                    }).then(() => {
                        this.$swal('취소되었습니다')
                            .then(() => {
                                axios.post(`http://localhost:3000/goods/orderPointRollback/${this.user.user_no}/${ORDER_DC}`)
                                    .then(() => {
                                        axios.post("http://localhost:3000/goods/goodsRollback", goods)
                                            .then(() => {
                                                location.href = "http://localhost:8080/mypage/orderList";
                                            })
                                            .catch(error => {
                                                console.error(error);
                                            });
                                    })
                                    .catch(error => {
                                        console.error(error);
                                    });
                            })
                            .catch(error => {
                                console.error(error);
                            });
                    });
                }
            });
        },
    },
};
</script>

  
<style scoped>
* {
    margin: 0;
    padding: 0;
}

ul,
li {
    list-style: none;
}

a {
    text-decoration: none;
}

@font-face {
    font-family: 'GmarketSansMedium';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansMedium.woff') format('woff');
    font-weight: normal;
    font-style: normal;
}


.container {
    margin: 40px 30px;
    font-family: GmarketSansMedium;
}

h2 {
    margin: 20px 0;
}

/* -------------------------------------------------------------------myinfo */

.my .table {
    max-width: 1150px;
    background-color: #f9f9f9;
    border-radius: 10px;
}
.datetime{
    width: 80%;
    text-align: center;
    margin: 0 auto;
    padding: 60px 0 20px 0;
    /* border: 1px solid red; */
}

.info {
    border-radius: 4px;
    margin-bottom: 60px;
    padding: 10px 8vw;
}

.my p {
    width: 100px;
    font-size: 1rem;
    display: inline-block;
    vertical-align: middle;
    padding: 2px;
    margin: 0px 60px 16px 0px;
}

.my .detail {
    display: flex;
}
.detail img {
    background-color: #eee;
    margin-right: 20px;
    border-radius: 10%;
}
.orderinfo .cnt{
    width:8vw;
    text-align: end;
}

.detail .de h4 {
    margin-bottom: 10px;
}

hr {
    border: 1.5px solid #FFAF7D;
    margin: 10px 0;
}

.celbtn{
    text-align: center;
    margin: 60px 0;
}

.celbtn .catbtn{
    height: 48px;
    width: 220px;
    font-size: 16px;
    display: inline;
    border: solid 2px rgb(255, 204, 122);
    border-radius: 8px;
    background-color: rgb(255, 210, 107);
    font-family: 'GmarketSansMedium';
}
/* --------------------------------------------------------------------------------------------------------------- */


@media screen and (max-width: 768px) {

.my .table {
    max-width: 1150px;
    background-color: #f9f9f9;
    border-radius: 10px;
    /* border: 1px solid red; */
}

.info {
    padding: 10px 60px;
}

.my p {
    min-width: 100px;
    margin: 0px 40px 16px 0px;
}

.celbtn{
    text-align: center;
    margin: 40px 0 40px 0;
}

}
</style>