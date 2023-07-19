<template>
  <div>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    <h1>QnA</h1>


    <table class="tbList">
      <colgroup>
        <col width="6%" />
        <col width="*" />
        <col width="10%" />
        <col width="15%" />
        <col width="5%" />
        <col width="6%" />
      </colgroup>
      <thead>
        <tr>
          <th>no</th>
          <th>제목</th>
          <th>작성자</th>
          <th>작성일</th>
          <th>비밀글</th>
          <th>답변상태</th>

        </tr>
      </thead>
      <tbody> <!--가져온 정보의 게시글 번호-->

        <tr v-for="item in contentlist" :key="item.QNA_NO"
          @click="item.is_secret === 0 ? movetocontent(item.QNA_NO) : movetoSecret(item)">
          <td>{{ item.QNA_NO }}</td> <!-- 글번호 -->
          <td>{{ item.QNA_TITLE }}</td>

          <td>{{ item.USER_NICK }}</td><!-- 닉네임 -->
          <td>{{ item.QNA_CREATE_DT.split('T')[0] }}</td>
          <td><i v-if="item.is_secret == 1" class="fa fa-lock"></i></td>
          <td v-if="item.QNA_ANSWER != null">답변 완료</td>
          <td v-else></td>
        </tr>

      </tbody>

    </table>


    <div class="btn">
      <div v-if="user.user_id == ''">
        <button class="write_btn" @click="login">작성</button>
      </div>

      <div v-else>
        <button class="write_btn" @click="write_qna">작성</button>

      </div>

    </div>
    <!--페이징-->

    <div class="btn-cover">
      <button @click="movetopreviouspage" class="page-btn">이전</button>
      <span class="page-count">{{ $route.query.page }}/{{ totalpage }} 페이지</span>
      <button @click="movetonextpage" class="page-btn">다음</button>
    </div>



  </div>
</template>


<script scope>
import axios from 'axios';

export default {
  data() {

    return {
      contentlist: [], //현재 게시판과 페이지에 맞는 글 리스트
      cnt: 0,
      pageSize: 10, //한페이지에 보여지는 정보 갯수
    }
  },
  computed: {
    user() {
      return this.$store.state.user; // 로그인 확인
    },

    totalpage() {
      if (this.cnt == 0) {   // 현재 게시판 글 갯수가 0개일때 총 페이지가 0이 되는거 방지
        return 1;
      } else {
        return Math.ceil(this.cnt / 10);    // (글 갯수/10)한 후 올림 연산을 통해 총 페이지 계산
      }
    }

  },
  mounted() {   // mounted는 페이지가 켜질때 실행됨, 페이지가 켜질때 글 리스트들을 db에서 불러옴
    axios({   // 게시글 작성자, 제목, 작성일 가져오기
      url: "http://localhost:3000/qna/qna_list",
      method: "POST",
      data: {
        page: this.$route.query.page,
        pagesize: this.pageSize
      },
    }).then(res => {
      this.contentlist = res.data;
      //역순정리 sort 매소드
      this.contentlist.sort(function (a, b) {
        return b.QNA_NO - a.QNA_NO;
      });
    }).catch(err => {
      alert(err);
    });
    //글개수 가져오기
    axios({
      url: "http://localhost:3000/qna/boardlistcnt",
      method: "POST",
      data: {

      },
    }).then(res => {
      this.cnt = res.data;
    }).catch(err => {
      alert(err);
    });


  },
  methods: {
    write_qna() {
      this.$router.push({ path: '/qnawrite' });
    },
    login() {
      this.$swal({

        title: '로그인 하신 후에 작성하실 수 있습니다.',
        showConfirmButton: true,
      })
        .then(() => {
          window.location.href = "http://localhost:8080/login";
        })
    },

    movetocontent(QNA_NO) {
      // if(this.item.is_secret == 0  ){
      window.location.href = window.location.pathname + '/qnacontent?QNA_NO=' + QNA_NO
      // } else {
      //   this.$swal("비밀글입니다")
      // }
    },
    movetoSecret(item) {
      if (this.user.user_tp == 1 || item.USER_NO == this.user.user_no) {
        window.location.href = window.location.pathname + '/qnacontent?QNA_NO=' + item.QNA_NO
      } else {
        this.$swal("비밀글입니다")
      }
    },
    //페이징
    movetopreviouspage() {
      if (this.$route.query.page == 1) {
        this.$swal('첫번째 페이지입니다!');
      } else {
        var pp = parseInt(this.$route.query.page) - 1;
        window.location.href = window.location.pathname + '?page=' + pp
      }
    },
    movetonextpage() {
      if (this.$route.query.page == Math.ceil(this.cnt / 10)) {
        this.$swal('마지막 페이지입니다!');
      } else {
        var pp = parseInt(this.$route.query.page) + 1;
        window.location.href = window.location.pathname + '?page=' + pp
      }
    },

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

p {
  height: 10px;
}

div {
  font-family: 'GmarketSansMedium';
  text-align: center;


}

table {
  margin: auto;
  width: 80%;


}

.tbList th {
  border-top: 1px solid #888;

}

.tbList th,
.tbList td {
  border-bottom: 1px solid #eee;
  padding: 5px 0;
}

.tbList td.txt_left {
  text-align: left;
}


td {
  text-align: center;
}

thead {
  background-color: #FFF6EC
}



.btn {
  display: block;
  height: 70px;
  position: relative;
  top: 10px;
  left: 85.5%;
  width: 50px;

}




.btn-cover {
  margin-bottom: 50px;
  position: relative;

}

.page-count {
  padding: 0 15px 0 20px;
  /* 위 오 아래 왼 간격 조절 */

}

.write_btn {
  height: 28px;
  width: 70px;
  border: none;
  border-radius: 4px;
  background-color: rgb(255, 223, 206);
  font-family: 'GmarketSansMedium';
  font-size: 14px;
  box-shadow: 0px 1px 9px 1px rgb(221, 221, 221);

}

button.write_btn:hover {
  cursor: pointer;
  background-color: rgb(253, 200, 172);
}

.page-btn {
  height: 25px;
  width: 50px;
  border: none;

  background-color: #fde8cc;
  font-family: 'GmarketSansMedium';
  font-size: 14px;
  box-shadow: 0px 1px 10px 0.1px rgb(240, 240, 240);

}

button.page-btn:hover {
  cursor: pointer;
  background-color: #f9d3a1;

}
</style>