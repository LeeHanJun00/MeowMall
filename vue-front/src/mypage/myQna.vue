<template>
    <div>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
        <h1>내 문의 내역</h1>
        <table class="tbList">
            <colgroup>
                <col width="6%" />
                <col width="*" />
                <col width="10%" />
                <col width="12%" />
                <col width="5%" />
                <col width="8%" />
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
                    @click="movetocontent(item.QNA_NO) ">
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
    </div>
  </template>
  
  
  <script>
  import axios from 'axios';

  
  export default {
    data() {
  
        return {
            contentlist: [], //현재 게시판과 페이지에 맞는 글 리스트

        }
    },
    computed: {
        user() {
            return this.$store.state.user; // 로그인 확인
            
        },

    },
    mounted() {   // mounted는 페이지가 켜질때 실행됨, 페이지가 켜질때 글 리스트들을 db에서 불러옴
        axios({   // 게시글 작성자, 제목, 작성일 가져오기
            url: "http://localhost:3000/qna/myqna_list",
            method: "POST",
            data: {
                userno : this.user.user_no
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
            window.location.href = "http://localhost:8080/qnamain"+ '/qnacontent?QNA_NO=' + QNA_NO
            // } else {
            //   this.$swal("비밀글입니다")
            // }
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
    position: relative;
    left: -30px;
  
  
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
    background-color: #ffebca
  }
  
  
  
  .btn {
    display: block;
    height: 70px;
  }
  
  button {
    height: 30px;
    width: 80px;
    border: none;
    border-radius: 4px;
    background-color: #fed9c2;
    font-family: 'GmarketSansMedium';
    font-size: 14px;
    box-shadow: 0px 1px 10px 1px rgb(221, 221, 221);
    position: relative;
    top: 20px;
  
  
  
  }
  
  button:hover {
    cursor: pointer;
    background-color: #ffc6a3;
  
  }
  </style>