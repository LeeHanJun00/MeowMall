<template>
  <div @submit.prevent="onSubmitWrite" class="form-container">
      <form class="write-form">
          <div class="ALL">
              <label class="top" style="font-size: 40px; font-style: bold;">질문작성</label>
              <div class="form-group">
                  <label for="qna_title" class="form-label">제목</label>
                  <input type="text" v-model="qna_title" class="form-input" placeholder="제목">
              </div>

              <div class="form-group2">
                  <label for="qna_content" class="form-label">내용</label>
                  <textarea v-model="qna_content" class="form" placeholder="내용을 입력해 주세요!"></textarea>
              </div>
              <div class="form-group">
                  <label for="is_secret" class="secret">비밀글</label>
                  <input type="checkbox" v-model="is_secret" class="checkbox" id="is_secret">
              </div>

              <button type="submit" class="submit-button">제출</button>
          </div>
      </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
      return {
          qna_title: '',
          qna_content: '',
          is_secret: false, // 비밀글 옵션 추가



      }
  },
  computed: {
      user() {
          return this.$store.state.user; // 로그인 확인
      }
  },
  mounted() {
      if (this.user.user_id == '') {
          // 일단은 로그인 상태 체크 
          this.$swal("관리자 외 접근제한 페이지입니다.");
          this.$router.push({ path: '/login' });
      }
  },
  methods: {
      onSubmitWrite() {
          axios.post("http://localhost:3000/qna/write", {
              user_no: this.user.user_no,
              qna_title: this.qna_title,
              qna_content: this.qna_content,
              is_secret: this.is_secret,
          })
              .then(response => {
                  console.log(response.data);
                  this.$swal("작성완료");
                  
              })
              .catch(error => {
                  console.log(error);
                  // 오류 처리
              });
              this.$router.push('/qnamain?page=1');
      }
  }
}
</script>

<style scoped>
@font-face {
  font-family: 'GmarketSansMedium';
  src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansMedium.woff') format('woff');
  font-weight: normal;
  font-style: normal;
}

input {
  font-family: 'GmarketSansMedium';
  border: 2px solid rgb(175, 175, 175);
  position: relative;
  top: -16px;
  left: -1px;
}

div {
  font-family: 'GmarketSansMedium';
}

.form-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 600px;

}

.write-form {
  width: 300px;
  padding: 20px;
  background-color: white;
  border-radius: 4px;

}

.form-group {
  margin-bottom: 20px;
  position: relative;
  top: -35px;
  right: -3px;


}

.form-group2 {
  position: relative;
  top: -50px;
  right: -3px;

}

.form-label {
  display: block;
  margin-bottom: 20px;
  font-weight: bold;
}

.form-input {
  width: 100%;
  padding: 10px;
  border-radius: 4px;
}

.form {
  width: 800px;
  height: 200px;
  resize: none;
}

.submit-button {
  display: block;
  width: 30%;
  padding: 10px;
  background-color: skyblue;
  color: black;
  border: black;
  border-radius: 4px;
  cursor: pointer;
  position: relative;
  left: 715px;
  top: -105px;
  font-family: 'GmarketSansMedium';
}

.submit-button:hover {
  background-color: rgb(75, 191, 236);
}

.ALL {
  position: relative;
  left: -250px;
  top: 30px;

}

.top {
  position: relative;
  top: -50px;
}

textarea {
  font-size: 15px;
  font-family: 'GmarketSansMedium';
  border: 2px solid rgb(175, 175, 175);
  border-radius: 4px;
  position: relative;
  top: -16px;
  left: -1px;
}

.secret {
  position: relative;
  top: -26px;
  left: -1px;
}

.checkbox {
  position: relative;
  top: -24px;
  left: -1px;
}
</style>