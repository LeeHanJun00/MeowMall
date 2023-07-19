<template>
    <main class="container">
        <!-- <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"
            integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM" crossorigin="anonymous" /> -->
        <h3>장바구니</h3>
        <div class="container-wrapper">
            <div class="container">
                <h5><strong>주문정보</strong></h5>
                <hr>
                <!-- <hr class="border border-success border-2 opacity-10"> -->
                <div class="me-3 all">
                    <input type="checkbox" v-model="selectAll" @click="toggleSelectAll">
                    전체 선택/해제
                </div>

                <div class="d-flex mb-3 orderinfo" v-for="(cart, i) in cartList" :key="i">
                    <div class="me-3">
                        <input type="checkbox" v-model="cart.checked" @click="toggleCartItem(cart)">
                        <img :width="80"
                            :src="cart.BASKET_GOODS_IMG ? require(`../../../node-back/uploads/uploadGoods/${cart.BASKET_GOODS_IMG}`) : '/goodsempty.jpg'"
                            alt="상품 이미지" @click="toggleCartItem(cart)" />
                    </div>

                    <div class="goods goodsnm d-flex align-items-center">
                        <strong @click="toggleCartItem(cart)">{{ cart.BASKET_GOODS_NM }}</strong>
                    </div>

                    <div class="goods goodscoun d-flex align-items-center">
                        <div class="me-2">수량</div>
                        <button b-button-group size="sm" @click="decrementQuantity(cart)"
                            class="btn btn-outline-success btn-sm">-</button>
                        <div class="me-2">{{ cart.BASKET_GOODS_COUNT }}</div>
                        <button @click="incrementQuantity(cart)" class="btn btn-outline-success btn-sm">+</button>
                    </div>

                    <div class="goods goodspr d-flex align-items-center">
                        <strong>총</strong>
                        <strong>{{ formatPrice(cart.BASKET_GOODS_COUNT * cart.BASKET_GOODS_PRICE) }}</strong>
                    </div>
                    <div class="goods  goodsd d-flex align-items-center">
                        <button type="button" class="btnd btn-outline-danger btn-sm"
                            @click="confirmDelete(cart.BASKET_NO)">삭제</button>
                    </div>
                </div>

                <div v-if="cartList.length === 0"></div>
                <br><br>
                <hr>
                <!-- <hr class="border border-success border-2 opacity-10"> -->
                <div class="d-flex mb-3 orderinfo2">
                    <div class="price">
                        총 상품 금액<br>
                        <strong>{{ formatPrice(selectedTotalPrice) }}</strong>
                    </div>
                    <p>+</p>
                    <div class="price2">
                        배송비(3만원 이상 무료배송)<br>
                        <strong>{{ getDeliveryFee(selectedTotalPrice) }}</strong>
                    </div>
                    <p>=</p>
                    <div class="price3">
                        총 결제 금액<br>
                        <strong>{{ formatPrice(selectedTotalPrice + getDeliveryFee(totalPrice)) }}</strong>
                    </div>
                </div>
                <div class="btn-lg-ch d-flex justify-content-center">
                    <button type="button" class="btn btn-success btn-lg" @click="goToBuy()">선택 구매하기</button>
                    &nbsp;
                    <button type="button" class="btn btn-success btn-lg" @click="buyAll()">전체 구매하기</button>
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
            cartList: [],
        };
    },
    computed: {
        user() {
            return this.$store.state.user;
        },
        selectedTotalPrice() {
            const selectedCarts = this.selectedCartList();
            return selectedCarts.reduce((total, cart) => {
                return total + cart.BASKET_GOODS_COUNT * cart.BASKET_GOODS_PRICE;
            }, 0);
        },
    },
    mounted() {
        if (this.user.user_no === '') {
            this.$swal('로그인해주세요');
            this.$router.push({ path: '/login' });
        } else {
            this.cancelBasket();
        }
    },
    created() {
        this.getCart();
    },
    methods: {
        async getCart() {
            try {
                const response = await axios.get(`http://localhost:3000/goods/basketList/${this.user.user_no}`);
                this.cartList = response.data;
            } catch (error) {
                console.error(error);
            }
        },
        formatPrice(price) {
            if (price !== undefined) {
                const formattedPrice = price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                return `${formattedPrice} 원`;
            }
            return '';
        },
        incrementQuantity(cart) {
            cart.BASKET_GOODS_COUNT++;
        },
        decrementQuantity(cart) {
            if (cart.BASKET_GOODS_COUNT > 1) {
                cart.BASKET_GOODS_COUNT--;
            }
        },
        getDeliveryFee() {
            const selectedTotalPrice = this.selectedTotalPrice;
            if (selectedTotalPrice >= 30000) {
                this.deliveryFee = 0;
            } else {
                this.deliveryFee = 3000;
            }
            return this.deliveryFee;
        },
        selectedCartList() {
            return this.cartList.filter(cart => cart.checked);
        },
				confirmDelete(basketNo) {
            axios.post(`http://localhost:3000/goods/basketDelete/${basketNo}`)
                .then(res => {
                    if (res.data.message === 'complete') {
                        this.$swal({
                            title: '삭제되었습니다.',
                            icon: 'success',
                            timer: 1500,
                            showConfirmButton: false,
                        }).then(() => {
                            this.getCart();
                            window.location.reload();
                        });
                    }
                })
                .catch(error => {
                    console.error(error);
                    this.$swal('오류 발생');
                });
        },
        buyAll() {
            this.cartList.forEach(cart => {
                this.toggleCartItem(cart);
            });
            this.goToBuy();
        },
        goToBuy() {
            const selectedCarts = this.cartList.filter(cart => cart.checked);
            const basketNos = selectedCarts.map(cart => cart.BASKET_NO);
            const basketCount = selectedCarts.map(cart => cart.BASKET_GOODS_COUNT);

            if (basketNos.length === 0) {
                this.$swal('결제할 상품을 선택해주세요');
            } else {
                axios({
                    url: 'http://localhost:3000/goods/basketUpdate',
                    method: 'POST',
                    data: {
                        basket_no: basketNos,
                        basket_goods_count: basketCount,
                    },
                })
                    .then(res => {
                        if (res.data.message === 'update_complete') {
                            this.$router.push(`/orderpayment/1/${basketNos}/${basketCount}`);
                        } else {
                            this.$swal('결제 실패');
                        }
                    })
                    .catch(() => {
                        this.$swal('오류 발생');
                    });
            }
        },
        cancelBasket() {
            axios.get(`http://localhost:3000/goods/basketCancel/${this.user.user_no}`)
                .catch(error => {
                    console.error(error);
                });
        },
        toggleCartItem(cart) {
            cart.checked = !cart.checked;
        },
        toggleSelectAll() {
            const allChecked = this.cartList.every(cart => cart.checked);
            this.cartList.forEach(cart => {
                cart.checked = !allChecked;
            });
        },
    },
};
</script>

  
<style scoped>
h3{
    font-size: 1.4rem;
}
.container-wrapper {
    padding: 20px;
    border: 1px solid #ddd;
    background-color: #ffffff;
    border-radius: 4px;
    margin-bottom: 60px;
  }
  .container {
    max-width: 800px;
    width: 95%;
    margin: auto;
    padding-top: 30px;
    padding-bottom: 30px;
    font-family: GmarketSansMedium;
}
h5{
    font-size: 1rem;
    margin: 16px auto;
}
hr{
    border: 2px solid  #FFAF7D;
}

.me-3{
    margin: 20px 0;
}
.all{
    height: 30px;
    /* border: 1px solid red; */
}

.all input[type="checkbox"]{
    width: 14px;
    height: 14px;
    line-height: 0;
    margin: 8px 0;
}
  .orderinfo input[type="checkbox"]{
    display: inline-block;
    vertical-align: middle;
    position: relative;
    width: 14px;
    height: 14px;
    top: -33px;
    margin-right: 20px;
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 4px;
    cursor: pointer;
  }
  .orderinfo {
    display: flex;
    /* justify-content: space-between; */
  }
  .orderinfo img {
    cursor: pointer;
    border-radius: 10%;
    background-color: #eeeeee;
  }

  .orderinfo .goods{
    display: flex;
    align-items: center;
  }

  .orderinfo .goodsnm{
    width: 20%;
    flex-grow: 1;
    cursor: pointer;
    margin-left: 20px;
    font-size: 0.9rem;
  }  
  .goodscoun, .goodspr, .goodsd {
  margin-left: 10px;
  align-items: center;
  line-height: 0;
  /* border: 1px solid green; */
}
  .goodscoun{
    width: 140px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    line-height: 0;
    text-align: end;
  }
   .orderinfo .goods .btn {
    width: 30px;
    height: 30px;
    padding: 4px 8px;
    align-items: center;
    text-align: center;
    border-radius: 4px;
    background: none;
    border: 1.5px solid #FFAF7D;
  }
  .goodspr{
    width: 120px;
    line-height: 0;
    justify-content: space-between;
    align-items: center;
  }


  .orderinfo .goodsd .btnd {
    width: 48px;
    height: 30px;
    border-radius: 4px;
    padding: 6px 8px;
    font-family: GmarketSansMedium;
    background: none;
    color: #ff5e00;
    border: 1.5px solid #ff5e00;
  }
  
/* 하단 */
  .orderinfo2 {
    display: flex;
    vertical-align: middle;
    justify-content: space-between;
    margin: 60px 0;
    text-align: center;
  }
p{
    font-size: 1rem;
}
  .price {
    margin-right: 10px;
  }

  .price2 {
    margin: 0 10px;
  }

  .price3 {
    margin-left: 10px;
  }

  .btn-lg-ch{
    justify-content: center;
    text-align: center;
  }
  .btn-lg {
    font-family: GmarketSansMedium;
    font-size: 1rem;
    padding: 10px 30px;
    margin: 0 10px;
    background-color: #f2f2f2;
    border: 2px solid #ccc;
    border-radius: 10px;
  }

  .btn-lg:hover {
  background-color: #e6e6e6;
  }
</style>