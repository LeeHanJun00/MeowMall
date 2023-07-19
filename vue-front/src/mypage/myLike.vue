<template>
    <main class="mt-3">
        <div class="container">
            <div class="myinfo">
                <div>
                    <h2>좋아요 상품</h2>
                </div>
                <div class="my">
                    <div class="table-responsive">
                        <table class="table" style="width: 100%;">
                            <thead>
                                <tr>
                                    <th>번호</th>
                                    <th>상품이미지</th>
                                    <th>상품명</th>
                                    <th>상품금액</th>
                                    <th>좋아요일자</th>
                                    <th>장바구니</th>
                                    <th>삭제</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(like, i) in likeList" :key="i">
                                    <td>{{ i + 1 }}</td>
                                    <td>
                                        <img :width="100" style="border-radius: 10px;"
                                            :src="like.goods_img ? require(`../../../node-back/uploads/uploadGoods/${like.goods_img}`) : '/goodsempty.jpg'"
                                            alt="상품 이미지">
                                    </td>
                                    <td>{{ like.goods_nm }}</td>
                                    <td>{{ formatPrice(like.goods_price) }} </td>
                                    <td>{{ formatDateTime(like.LIKE_CREATE_DT) }}</td>
                                    <td><button class="catbtn" @click="addToCart(like)">장바구니</button></td>
                                    <td><button class="catbtn2" @click="likeDelete(like.GOODS_NO)">삭제</button></td>
                                </tr>
                                <tr v-if="likeList.length === 0">
                                    <td colspan="7" style=" padding: 150px 0px;">좋아요 내역이 없습니다.</td>
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
    // el: "#app",

    data() {
        return {
            likeList: [],
        };
    },
    computed: {
        user() {
            return this.$store.state.user;
        }
    },
    created() {
        this.getLikeList();
    },
    methods: { 
        async getLikeList() {
            try {
                const response = await axios.post(`http://localhost:3000/mypage/likeList/${this.user.user_no}`);
                this.likeList = response.data;
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
            const year = date.getFullYear().toString().slice(2); // 뒤의 두 자리만 가져오기
            const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 0으로 채워진 두 자리로 만들기
            const day = date.getDate().toString().padStart(2, '0'); // 0으로 채워진 두 자리로 만들기
            return `${year}년${month}월${day}일`;
        },   
        async addToCart(like) {
            this.likeL = like;
            axios({
                url: "http://localhost:3000/goods/basketInsert",
                method: "POST",
                data: {
                    user_no: this.user.user_no,
                    basket_goods_price: this.likeL.goods_price,
                    basket_goods_count: 1,
                    basket_goods_nm: this.likeL.goods_nm,
                    basket_goods_img: this.likeL.goods_img,
                    basket_goods_no: this.likeL.GOODS_NO,
                },
            })
                .then(res => {
                    if (res.data.message == 'check_error') {
                        this.$swal("이미 장바구니에 담긴 상품입니다")
                    }
                    else {
                        this.$swal({
                                title: '상품이 장바구니에 담겼습니다.',
                                showDenyButton: true,
                                confirmButtonText: '장바구니로 이동',
                                denyButtonText: `계속 쇼핑하기`,
                            }).then((result) => {
                                if (result.isConfirmed) {
                                    location.href="http://localhost:8080/basket"
                                } else if (result.isDenied) {
                                    location.reload();
                                }
                            })
                    }
                })
                .catch(err => {
                    console.log(err);
                })
        },
        likeDelete(goodsno) {
            axios({
                url: `http://localhost:3000/goods/likeDelete/${goodsno}/${this.user.user_no}`,
                method: 'POST'
            })
                .then(res => {
                    if (res.data.message === 'complete') {
                        this.$swal('상품이 삭제되었습니다.');
                        this.getLikeList(); // 삭제 후 목록 다시 불러오기
                    }
                })
                .catch(() => {
                    this.$swal('오류 발생');
                });
        },
    },
};
</script>


<style scoped>
a.imgSpace {
    color: inherit;
    text-decoration: none;
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
    text-align: center;
    padding-right: 40px;
}

.my .table th {
    text-align: center;
    padding: 20px 0;
    /* border: 1px solid red; */
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

    .TopBar {
        display: inline-block;
        align-items: center;
        height: 300px;
        width: 100%;
        padding: 0px;
        background-color: #ffffff;
        border: none;
    }

    /* ------------------------------------------------------barcat */


    .myinfo {
        position: relative;
        top: -60px;
    }

}

.cat .name .catbtn {
    margin-top: 8px;
}

.catbtn {
    width: 70px;
    padding: 4px;
    border-radius: 6px;
    color: #cc8c00;
    border: 1px solid #ffbc2b;
    background-color: #fff2c9;
    font-family: GmarketSansMedium;
    cursor: pointer;
}

.catbtn2 {
    width: 50px;
    padding: 4px;
    border-radius: 6px;
    color: #cc8c00;
    border: 1px solid #ffbc2b;
    background-color: #fff2c9;
    font-family: GmarketSansMedium;
    cursor: pointer;

}

.my .table {
    max-width: 1200px;
    text-align: center;
    background-color: #f9f9f9;
    border-radius: 10px;
}

img {
    border-radius: 10%;
    background-color: #eeeeee;
}
</style>