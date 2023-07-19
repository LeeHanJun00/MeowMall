<template>
    <main class="mt-3">
        <div class="container">
            <div class="myinfo">
                <div>
                    <h2>내 주문내역</h2>
                </div>
                <div class="my">
                    <div class="table-responsive">
                        <table class="table" style="width: 100%;">
                            <thead>
                                <tr>
                                    <th>주문번호</th>
                                    <th>상품이미지</th>
                                    <th>상품명</th>
                                    <th>금액</th>
                                    <th>주문일자</th>
                                    <th>주문상태</th>
                                    <th> </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(order, i) in uniqueOrderList" :key="i">
                                    <td>{{ order.ORDER_TRADE_NO }}</td>
                                    <td>
                                        <img :width="70" style="border-radius: 10px;"
                                            :src="order.items[0].ORDER_GOODS_IMG ? require(`../../../node-back/uploads/uploadGoods/${order.items[0].ORDER_GOODS_IMG}`) : '/goodsempty.jpg'"
                                            alt="상품 이미지" />
                                    </td>
                                    <td>
                                        <router-link
                                            :to="{ name: 'goodsDetail', params: { goodsno: order.items[0].GOODS_NO } }"
                                            class="imgSpace">
                                            {{ order.items[0].ORDER_GOODS_NM }}
                                        </router-link>
                                        <span v-if="order.items.length > 1">
                                            외 {{ order.items.length - 1 }}건
                                        </span>
                                    </td>
                                    <td>{{ formatPrice(order.items[0].ORDER_GOODS_PRICE) }}</td>
                                    <td>{{ formatDateTime(order.items[0].ORDER_CREATE_DT) }}</td>
                                    <td>
                                        {{ getOrderStatusText(order.items[0].ORDER_STATUS) }} <br />
                                        <router-link
                                            :to="{ name: 'orderDetail', params: { orderno: order.items[0].ORDER_TRADE_NO } }"
                                            class="imgSpace" style="font-size: small; color: #b4876c">
                                            주문상세보기 &gt;
                                        </router-link>
                                    </td>
                                    <td v-if="order.items[0].ORDER_STATUS === 2">
                                        <button @click="orderConfirm(order.items[0].ORDER_TRADE_NO)" class="rebtn">구매
                                            확정</button>
                                    </td>
                                    <td v-if="order.items[0].REVIEW_CHECK === 0 && order.items[0].ORDER_STATUS === 3">
                                        <button @click="handleReview(order.items[0])" class="rebtn">리뷰 작성</button>
                                    </td>
                                    <!-- 모달 -->
                                    <div class="wrapper" v-if="showModal === true">
                                        <div class="review_container">
                                            <h3>리뷰 작성</h3>
                                            <div class="star-rating">
                                                <div class="star" v-for="index in 5" :key="index" @click="check(index)">
                                                    <span v-if="index < review_score + 1"><i class="fa fa-star"></i></span>
                                                    <span v-if="index >= review_score + 1"><i
                                                            class="fa fa-star-o"></i></span>
                                                </div>
                                                <span style="padding-left: 5px;">({{ review_score }})</span>
                                            </div>

                                            <div class="review_area">
                                                <div class="img_form">
                                                    <div class="img_box">
                                                        <label for="input-file" v-if="!review_img">
                                                            <img class="img_preview" src="../assets/imgEmptyInput.png"
                                                                alt="...">
                                                        </label>
                                                        <label for="input-file" v-if="review_img">
                                                            <img class="img_preview"
                                                                :src="require(`../../../node-back/uploads/${review_img}`)"
                                                                alt="...">
                                                        </label>
                                                    </div>
                                                    <input type="file" id="input-file" class="form-control"
                                                        accept="image/png,image/jpeg"
                                                        @change="uploadFile($event.target.files)" style="display: none;">
                                                </div>
                                                <textarea placeholder="내용을 작성하세요" v-model="review_con"
                                                    class="review_content"></textarea>
                                            </div>
                                            <div class="btn_area">
                                                <button class="rebtn" @click="submitReview">작성</button>
                                                <button @click="closeModal()" class="modal-exit-btn rebtn">닫기</button>
                                            </div>
                                        </div>
                                    </div>
                                </tr>
                                <tr v-if="orderList.length === 0">
                                    <td colspan="7" style=" padding: 150px 0px;">주문 내역이 없습니다.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </main>
</template>
  
  
<script>
import axios from 'axios';

export default {

    data() {
        return {
            loginUser: {},
            cat: {},
            orderList: [],
            showModal: false,
            review_con: '',
            review_img: '',
            review_score: 5,
        };
    },
    computed: {
        user() {
            return this.$store.state.user;
        },
        uniqueOrderList() {
            const uniqueOrders = [];
            const tradeNos = [];

            for (const order of this.orderList) {
                if (!tradeNos.includes(order.ORDER_TRADE_NO)) {
                    uniqueOrders.push({
                        ORDER_TRADE_NO: order.ORDER_TRADE_NO,
                        items: [order],
                    });
                    tradeNos.push(order.ORDER_TRADE_NO);
                } else {
                    const index = uniqueOrders.findIndex((o) => o.ORDER_TRADE_NO === order.ORDER_TRADE_NO);
                    uniqueOrders[index].items.push(order);
                }
            }

            return uniqueOrders;
        },
    },
    created() {
        this.getUser();
        this.viewPetInfo();
        this.getOrderList();
    },
    methods: {
        check(index) {  // 리뷰 별점 체크
            this.review_score = index;
        },
        async uploadFile(file) {

            let name = "";
            let pastname = this.review_img;

            if (file) {
                name = file[0].name;
            }
            else {
                return;     // 파일 미선택 시 반환
            }

            const formData = new FormData();
            formData.append('img', file[0]);

            try {
                axios({
                    url: `http://localhost:3000/goods/upload_img`,
                    method: 'POST',
                    headers: { 'Content-Type': 'multipart/form-data' },
                    data: formData
                })
                    .then((res) => {
                        if (res.data.message == 'success') {
                            this.review_img = name;
                            axios({
                                url: `http://localhost:3000/goods/delete_img`,
                                method: 'POST',
                                data: {
                                    pastname: pastname
                                }
                            })
                        }
                        else {
                            this.$swal("DB 에러");
                        }
                    })
                    .catch(e => {
                        console.log(e);
                    })
                return true;

            } catch (err) {
                console.log(err);
                return false;
            }

        },
        async getUser() {
            try {
                const response = await axios.get(`http://localhost:3000/mypage/mypage/${this.user.user_no}`);
                this.loginUser = response.data[0];
            } catch (error) {
                console.error(error);
            }
        },
        async viewPetInfo() {
            try {
                const response = await axios.get(`http://localhost:3000/mypage/getCatData/${this.user.user_no}`);
                this.cat = response.data[0];
            } catch (error) {
                console.error('데이터 가져오기실패:', error);
            }
        },
        async getOrderList() {
            try {
                const response = await axios.get(`http://localhost:3000/goods/orderlist/${this.user.user_no}`);
                this.orderList = response.data;
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
                year: "numeric",
                month: "long",
                day: "numeric",
            };
            const formattedDateTime = date.toLocaleDateString("ko-KR", options);
            return formattedDateTime;
        },
        getOrderStatusText(status) {
            if (status === 0) {
                return '결제완료';
            } else if (status === 1) {
                return '배송중';
            } else if (status === 2) {
                return '배송완료';
            } else if (status === 3) {
                return '구매확정';
            } else if (status === 9) {
                return '취소완료';
            }
            return '';
        },
        handleReview(order) {
            if (!order.ORDER_STATUS === 3) {
                this.$swal("배송완료 후에 리뷰를 작성할 수 있습니다.");
            } else {
                this.showModal = true;
                this.orderT = order;
            }
        },
        orderConfirm(TRADE_NO) {
            this.$swal({
                title: `구매 확정시 주문취소가 불가능합니다`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: '확인',
                cancelButtonText: '취소',
                reverseButtons: true
            }).then(result => {
                if (result.value) {
                    axios({
                        url: `http://localhost:3000/goods/admin/updateStatus`,
                        method: "POST",
                        data: {
                            status: 3,
                            orderTradeNos: TRADE_NO
                        },
                    }).then(() => {
                        this.$swal('구매확정되었습니다');
                        axios.post(`http://localhost:3000/goods/orderPoint/${TRADE_NO}/${this.user.user_no}`)
                            .then(() => {
                                location.reload();
                            })
                            .catch(error => {
                                console.error(error);
                            });
                    })
                }
            });
        },
        closeModal() {
            this.showModal = false; // 모달 닫기
            axios({
                url: `http://localhost:3000/goods/delete_img`,
                method: 'POST',
                data: {
                    pastname: this.review_img
                }
            })
            this.review_con = '';
            this.review_img = '';
            this.review_score = 5;
        },
        submitReview() {
            axios.post("http://localhost:3000/goods/write_review", {
                content: this.review_con,
                user_no: this.user.user_no,
                goods_no: this.orderT.GOODS_NO,
                order_no: this.orderT.ORDER_TRADE_NO,
                order_status: this.orderT.ORDER_STATUS,
                review_img: this.review_img,
                review_score: this.review_score
            })
                .then((res) => {
                    if (res.data.message == 'review_complete')
                        this.$swal("리뷰 작성 완료.");
                })
                .catch(error => {
                    this.$swal("에러 발생: ", error);
                });
            this.showModal = false;
            window.location.href = `http://localhost:8080/mypage/orderList`;
        }
    },
};
</script>
  
<style scoped>
/* ----------------------------------------------------모달창 ----------------------------------------------------------------------*/
.wrapper {
    background-color: rgba(96, 96, 96, 0.1);
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
}

.review_container {
    background: #fff;
    /* width: 40%;
    height: 50%; */
    border-radius: 5px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 20px;
    box-sizing: border-box;
}

.review_content {
    width: 100%;
    height: 100%;
    font-family: GmarketSansMedium;
    font-size: 16px;
    margin: 13px;
    background-color: #eeeeee;
    border: none;
}

.btn_area {
    display: flex;
}

.btn_area button {
    margin: 3px;
    padding: .5rem 1rem;
    font-size: 1rem;
    font-weight: 400;
    text-decoration: none;
    display: inline-block;
    width: auto;
    border: none;
    border-radius: 4px;
}

.star-rating {
    display: flex;
    padding-top: 9px;
    font-size: 30px;
    color: #FFAF7D;
}

.review_area {
    display: flex;
    margin: 15px 0px;
}

.review_area img {
    width: 280px;
    border-radius: 2%;
    margin: 0px 10px;
}

.review_area textarea {
    width: 280px;
    resize: none;
    margin: 0px 3px;
    height: 280px;
    border-radius: 2%;
}
 img {
    background-color: #eee;
 }

/* --------------------------------------------------------------------------------------------------------------------------*/
a.imgSpace {
    color: inherit;
    text-decoration: none;
}

.imgSpace:hover {
    color: #FFAF7D;
    cursor: pointer;
}

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

/* ------------------------------------------------------barcat */

.rebtn {
    width: 70px;
    padding: 4px;
    border-radius: 6px;
    color: #cc8c00;
    border: 1px solid #ffbc2b;
    background-color: #fff2c9;
    font-family: GmarketSansMedium;
    cursor: pointer;
}


/* -------------------------------------------------------------------myinfo */

.myinfo {
    margin-top: 30px;
    /* background-color: #fff2c9; */
}

.my .table {
    max-width: 1200px;
    text-align: center;
    background-color: #f9f9f9;
    border-radius: 10px;
}

.my .table th {
    text-align: center;
    padding: 20px 0;
}

.my p {
    width: 100px;
    font-size: 1rem;
    display: inline-block;
    vertical-align: middle;
    padding: 2px;
    margin: 0px 30px 16px 0px;
    /* border: 1px solid red; */
}

.my .detail {
    display: flex;
}


/* --------------------------------------------------------------------------------------------------------------- */


@media screen and (max-width: 768px) {

    /* ------------------------------------------------------barcat */
    .myinfo {
        position: relative;
    }

}
</style>