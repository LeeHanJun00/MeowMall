<template>
  <div class="productdetail">
    <div class="product-image">
      <router-link :to="`/products/${product.id}`">
        <figure>
          <img src="../assets/사료1.png" alt="..." style="scale: 180%;">

        </figure>
      </router-link>
    </div>
    <div class="option">
      <p>{{ product.detail }}</p>
      <button @click="addToCart(product)">장바구니</button>
      <button @click="viewBuy(product.id)">구매하기</button>

    </div>
      <hr />
    <div class="detail">
      <img src="../assets/사료상품설명.jpg" alt="..." style="width:300%; height:auto;">
    </div>
    <div style="text-align: center;">
   <h3>리뷰</h3>
   <div class="review_button">
   <router-link to="/review">리뷰쓰기</router-link>
    </div>
  </div>
      <hr />
  </div>
</template>

<script>
export default {
  name: 'ProductDetail',
  data() {
    return {
      product: {},
    };
  },
  mounted() {
    this.fetchProductDetail();
  },
  methods: {
                  url: "http://localhost:3000/auth/product",//url이랑 메소드는 0623 15:08에
                  method: "POST",
    fetchProductDetail() {
      // 상세 정보를 가져오는 API를 호출합니다.
      // 예시로 직접 데이터를 생성하여 사용하였습니다. 실제로는 서버에서 데이터를 가져와야 합니다.
      this.product = {
        id: 1,
        name: '로얄캐닌',
        price: 25000,
        image: '/assets/logo.png',
        description: 'ㅇㄴㅁㅇ',
        
      };
    },

    addToCart(product) {
      // 장바구니에 상품을 추가하는 로직을 구현할 수 있습니다.
      console.log('장바구니에 추가:', product);

      // 여기서 Vue Router의 `this.$router.push()` 메소드를 사용하여 장바구니 페이지로 이동합니다.
      this.$router.push('/cart');
    },

    viewBuy(productId) {
      // productId를 기반으로 구매 페이지 경로를 생성하고 이동합니다.
      this.$router.push(`/buy/${productId}`);
    },
  },
};
</script>


<style scoped>
@font-face {
    font-family: 'GmarketSansMedium';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansMedium.woff') format('woff');
    font-weight: normal;
    font-style: normal;
}
img {
    width: 400px;
    height: 400px;
    object-fit: contain; /*이미지 비율*/
    
  }

.product-image{
      display: flex;
 

  font-weight: bold;
  margin: 200px;
  position: relative;
  left: 200px;
 

}
.product-info{
  font-weight: bold;
  margin: 200px
}
.detail{
  margin: auto;
    display: block;width: 20%;
    margin: auto;
    display: block;
    position: relative;
        left: -330px;
}

.review_button{
  border: none;
width:fit-content;
margin:auto;
width: 100px;
text-align: left;
height: 30px;

}

.option{
  position: relative;
  left: 5px;
        top: 10px;
margin:auto;
width: 100px;
padding: auto;

height: 30px;



}







</style>