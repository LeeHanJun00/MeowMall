<template>
  <main class="mt-3">

    <div class="container">
      <div>
        <h2>마이 페이지</h2>
      </div>
      <div class="TopBar">
        <div class="cat" v-if="loginUser.user_cat === 0">
          <div><img src='../assets/imgempty.png'></div>
          <div class="name">
            <p>고양이 이름</p>
            <a href="http://localhost:8080/mypage/catAdd">
              <button class="catbtn">등록하러 가기</button></a>
          </div>
        </div>
        <div class="cat" v-else>
          <div class="img_box">
            <div class="img_preview" v-if="loginUser.user_cat !=0">
              <img v-if="cat.cat_img"
                :src="require(`../../../node-back/uploads/uploadCat/` + `${cat.cat_img}`)" alt="..."></div>
            <div v-else><img src='../assets/imgempty.png' alt="..."></div>
          </div>
          <div class="name">
            <p>{{ cat.cat_name }}</p>
            <a href="http://localhost:8080/mypage/catupdate">
              <button class="catbtn">고양이 정보 수정</button></a>
          </div>
        </div>
        <div class="cat2">
          <div class='v-line'></div>
          <div to="/mypage/?">
            <div class="point">
              <h3 class="pri">{{ formatPrice(loginUser.user_point) }}</h3>
              <p>적립금</p>
            </div>
          </div>

          <div class='v-line'></div>

          <div to="/mypage/?">
            <a @click="goToLike">
              <div class="like">
                <h3 class="coun">{{ likeCount }}</h3>
                <ul></ul>
                <p>좋아요</p>
              </div>
            </a>
          </div>
          <div class='v-line'></div>
          <div to="/mypage/?">
            <a @click="goToOrder">
              <div class="look">
                <h3 class="coun">{{ deliveryCount }}</h3>
                <ul></ul>
                <p>배송 중</p>
              </div>
            </a>
          </div>
        </div>
      </div>

      <div class="myinfo">

        <div>
          <h2>내 정보</h2>
        </div>

        <div class="my">

          <div class="detail">
            <p>아이디</p>
            <div>
              <h4>{{ loginUser.user_id }}</h4>
            </div>
          </div>

          <div class="detail">
            <p>닉네임</p>
            <div>
              <h4>{{ loginUser.user_nick }}</h4>
            </div>
          </div>

          <div class="detail">
            <p>이메일</p>
            <div>
              <h4>{{ loginUser.user_email }}</h4>
            </div>
          </div>

          <div class="detail">
            <p>전화번호</p>
            <div>
              <h4>{{ loginUser.user_mobile }}</h4>
            </div>
          </div>


          <div class="detail">
            <p>집주소</p>
            <div class="de">
              <h4>{{ loginUser.user_zipcode }}</h4>
              <h4>{{ loginUser.user_adr1 }}</h4>
              <h4>{{ loginUser.user_adr2 }}</h4>
            </div>
          </div>
        </div>

        <div class="btn">
          <a href="http://localhost:8080/mypage/update">
            <button class="modifybtn">수정하기</button>
          </a>

          <div>
            <button class="deletebtn">회원탈퇴</button>
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
      loginUser: {
      },
      cat: {
      },
      likeCount: 0,
      deliveryCount: 0,
    };
  },
  computed: {
    user() {
      return this.$store.state.user;
    }
  },
  mounted() {
    if (this.user.user_no == '') {
      alert('로그인해주세요');
      this.$router.push({ path: '/login' });
    }
  },
  created() {
    this.getUser();
    this.viewPetInfo();
    this.getLikeCount();
    this.getDeliveryCount();
  },
  methods: {
    goToOrder() {
      window.location.href = "http://localhost:8080/mypage/orderList"
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
    async getLikeCount() {
      try {
        const response = await axios.post(`http://localhost:3000/mypage/likeList/${this.user.user_no}`);
        const likeList = response.data;
        this.likeCount = likeList.length;
      } catch (error) {
        console.error(error);
      }
    },
    async getDeliveryCount() {
      try {
        console.log(this.user.user_no)
        const response = await axios.post(`http://localhost:3000/mypage/deliveryCount/${this.user.user_no}`);
        this.deliveryCount = response.data;
      } catch (error) {
        console.error(error);
      }
    },
    goToLike() {
      this.$router.push({ path: '/mypage/myLike' });
    },
    formatPrice(price) {
      if (price !== undefined) {
        const formattedPrice = price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return `${formattedPrice} 원`;
      }
      return "";
    },
    confirmDeleteUser(user) {
      this.$swal({
        title: `${user.user_nick} 회원을 삭제하시겠습니까?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: '삭제',
        cancelButtonText: '취소',
        reverseButtons: true
      }).then(result => {
        if (result.value) {
          this.deleteUser(user);
          this.$swal({
            position: 'top',
            icon: 'success',
            title: '삭제되었습니다',
            showConfirmButton: false,
            timer: 1500
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

.TopBar p {
  font-size: 1rem;
}

.TopBar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 140px;
  width: 94%;
  padding: 0 20px;
  position: relative;
  left: -1%;
  background-color: #f6f6f6;
  border-radius: 10px;
  border: 2px solid rgb(221, 221, 221);
  overflow: hidden;
}

/* ------------------------------------------------------barcat */

.img_box {
  width: 110px;
  height: 110px;
  border-radius: 70%;
  overflow: hidden;
  background-color: #e8e8e8;

}

.img_box .img_preview {
  width: 110px;
  height: 110px;
  /* background-color: #bc0c0c; */
}

.img_box .img_preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cat {
  display: flex;
  height: 110px;
  width: auto;
  margin-left: 20px;
  /* border: 1px solid rgb(132, 255, 0); */
}

.cat img {
  max-width: 110px;
}

.cat .name {
  margin: 30px 0px 30px 20px;
}

.cat .name .catbtn {
  margin-top: 8px;
}

.catbtn {
  width: 120px;
  padding: 4px;
  border-radius: 6px;
  color: #cc8c00;
  border: 1px solid #ffbc2b;
  background-color: #fff2c9;
  font-family: GmarketSansMedium;
  cursor: pointer;
}

.cat2 {
  display: flex;
  width: 100%;
  position: relative;
  justify-content: space-between;
  align-items: center;
  padding-right: 20px;
  /* border: 1px solid rgb(255, 0, 0); */
}

/* ---------------------------------------------point */

.point {
  width: 8vw;
  text-align: center;
}

.point .pri {
  padding-bottom: 4px;
}


/* ---------------------------------------------like */

.like {
  align-items: center;
  width: 8vw;
  text-align: center;
}

.like .coun {
  padding-bottom: 4px;
}

/* ------------------------------------- */

.look {
  align-items: center;
  width: 8vw;
  text-align: center;
  margin-right: 60px;
}

.look .coun {
  padding-bottom: 4px;
}

/* ------------------------------------- */
.v-line {
  border-radius: 30px;
  border-left: 2px solid rgb(221, 221, 221);
  height: 80px;
  margin: 0 4vw;
}

.v-line:nth-child(1) {
  margin-left: 30px;
}

/* -------------------------------------------------------------------myinfo */

.myinfo {
  margin-top: 30px;
  /* background-color: #fff2c9; */
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

.btn {
  display: flex;
  margin-top: 40px;
}

.modifybtn {
  width: 120px;
  padding: 6px;
  border-radius: 6px;
  color: #cc8c00;
  border: 1px solid #ffbc2b;
  background-color: #fff2c9;
  font-family: GmarketSansMedium;
  cursor: pointer;
  margin-right: 20px;
}

.detail .de h4 {
  margin-bottom: 10px;
}

.deletebtn {
  width: 120px;
  padding: 6px;
  border-radius: 6px;
  color: #888888;
  border: 1px solid #f0f0f0;
  font-family: GmarketSansMedium;
  cursor: pointer;
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

  .cat {
    display: flex;
    margin: 0;
    padding: 0;
  }

  .cat img {
    max-width: 80px;
  }

  .img_box {
    width: 80px;
    min-width: 80px;
    height: 80px;
    min-height: 80px;
  }

  .cat .name {
    margin: 6px 0px 40px 20px;
  }

  .cat2 {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  /* ---------------------------------------------point */

  .point {
    display: inline-block;
    width: 80%;
    min-width: 100px;
    padding: 10px;
    text-align: center;
  }

  /* ---------------------------------------------like */

  .like {
    display: inline-block;
    width: 80%;
    min-width: 100px;
    padding: 10px;
    text-align: center;
  }

  /* ------------------------------------- */

  .look {
    display: inline-block;
    width: 80%;
    min-width: 100px;
    padding: 10px;
  }

  .v-line {
    display: flex;
    height: 40px;
    margin: 2px;
    /* margin: 0 4%; */
    border-radius: 0;
  }

  .v-line:nth-child(1) {
    display: none;
  }

  .myinfo {
    position: relative;
    top: -60px;
  }

}
</style>