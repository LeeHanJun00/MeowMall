<template>
	<div>
		<form>
			<div class="content" v-for="item in content" :key="item.QNA_NO">
				<div class="qna_content">
					<label class="t2">작성자</label>&nbsp;&nbsp;<label class="writer"
						style="font-size: 18px; font-style: bold;">{{ content[0].USER_NICK }}</label>

					<div class=t2>제목
					</div>
					<textarea class="text2" :disabled="editable === false" v-model="content[0].QNA_TITLE"
						style="font-size: 17px;"></textarea>

					<div class="t2">내용</div>
					<div></div>
					<textarea class="text1" :disabled="editable === false" v-model="content[0].QNA_CONTENT"
						style="font-size: 17px;"></textarea>

				</div>
				<div class="btn_area">
					<button type="button" class="main_btn" @click="QnaMain">목록으로</button>

					<div v-if="this.user.user_no == this.content[0].USER_NO" class="right_btn">
						<button type="button" class="btn" @click="editContent()" v-if="editable === false">수정</button>
						<button type="button" class="btn" @click="confirmEditContent()" v-else>수정완료</button>
						<button type="button" class="btn" @click="confirmDeleteContent(item.QNA_NO)">삭제</button>
					</div>
				</div>
				<hr style="margin: 20px">
				<form v-if="content[0].QNA_ANSWER != null" class="answer">
					<label class="head_answer" style="font-size: 17px; font-weight: bold;">답변</label>
					<div>
						<textarea class="text3" v-model="content[0].QNA_ANSWER" style="font-size: 17px;"
							readonly></textarea>
					</div>
				</form>
			</div>
		</form>
	</div>
</template>

<script>
import axios from 'axios';

export default {
	data() {
		return {
			content: [],
			editable: false,


		}
	},
	computed: {
		user() {
			return this.$store.state.user; // user 정보가 바뀔 때마다 자동으로 user() 갱신
		},
	},
	mounted() {
		axios({
			url: "http://localhost:3000/qna/qnacontent",
			method: "POST",
			data: {
				QNA_NO: this.$route.query.QNA_NO
			},
		}).then(res => {
			this.content = res.data;

		}).catch(err => {
			alert(err);
		});
	},
	methods: {
		confirmDeleteContent(QNA_NO) {
			if (this.user.user_no != this.content[0].USER_NO) {
				this.$swal("본인이 작성한 글만 삭제 가능합니다.")
			} else {
				this.$swal({
					title: `${QNA_NO}번 질문을 삭제하시겠습니까?`,
					icon: 'question',
					showCancelButton: true,
					confirmButtonText: '삭제',
					cancelButtonText: '취소',
					reverseButtons: true
				}).then(result => {
					if (result.value) {
						this.deleteContent(QNA_NO);
						this.$swal({
							position: 'top',
							icon: 'success',
							title: '삭제되었습니다',
							showConfirmButton: false,
							timer: 1500
						});
						this.$router.push('/qnamain?page=1');
					}
				});
			}

		},
		deleteContent(QNA_NO) {
			axios({
				url: "http://localhost:3000/qna/delete",
				method: "POST",
				data: {
					qnano: QNA_NO
				},
			}).then(res => {
				this.content = res.data;
				this.$router.push('/qnamain?page=1');
			}).catch(err => {
				alert(err);
			});

		},
		editContent() {
			if (this.user.user_no != this.content[0].USER_NO) {
				this.$swal("본인이 작성한 글만 수정 가능합니다.")
			} else {

				this.editable = true;
			}

		},
		navigateToQnaMain() {
			this.$router.push('/qnamain?page=1');
		},
		confirmEditContent() {
			axios.post("http://localhost:3000/qna/edit", {
				content: this.content[0].QNA_CONTENT,
				title: this.content[0].QNA_TITLE,
				qnano: this.content[0].QNA_NO,

			})
				.then(response => {
					console.log(response.data);
				})
				.catch(error => {
					console.log(error);

				});
			this.$swal("수정완료");
			this.editable = false;
			// this.$router.push('/qnamain?page=1');

		},
		QnaMain() {
			console.log("실행 확인")
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

* {
	margin: 0;
	padding: 0;
}

div {
	font-family: 'GmarketSansMedium';
}

.btn_area {
	align-items: center;
	display: flex;
	vertical-align: middle;
	height: 100px;
	margin: auto;
	padding: auto;
	justify-content: flex-start;
}

.content {
	margin: auto;
	padding: 30px;
	max-width: 900px;
}

.content textarea {
	width: 100%;
}

.text1 {
	resize: none;
	height: 100px;
	font-family: 'GmarketSansMedium';
}

.text2 {
	resize: none;
	height: 25px;
	font-family: 'GmarketSansMedium';
}

.text3 {
	resize: none;
	height: 100px;
	margin-bottom: 50px;
	font-family: 'GmarketSansMedium';
}

.main_btn {
	font-size: 16px;
	width: 80px;
	height: 50px;
	background-color: rgb(255, 225, 160);
	border: black;
	border-radius: 4px;
	cursor: pointer;
	font-family: 'GmarketSansMedium';
	vertical-align: middle;
}

.right_btn {
	margin-left: auto;
}

.btn {
	font-size: 16px;
	width: 80px;
	height: 50px;
	margin-left: auto;
	background-color: skyblue;
	border: none;
	border-radius: 4px;
	cursor: pointer;
	font-family: 'GmarketSansMedium';
	margin: 3px
}

.btn:hover {
	background-color: rgb(29, 170, 226);
}

.t2 {
	margin: 20px 0px 5px 0px;
	font-size: 17px;
	font-weight: bold;
}

.text3:focus {
	outline: none;
}
</style>