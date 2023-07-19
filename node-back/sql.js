module.exports = {

  // auth
  join: `INSERT INTO tb_user (user_id, user_nick, user_email, user_pw, user_mobile, user_zipcode, user_adr1, user_adr2) VALUES(?,?,?,?,?,?,?,?)`,

  id_check: `SELECT * FROM tb_user WHERE user_id = ?`,
  get_user_no: `SELECT user_no FROM tb_user WHERE user_id = ?`,
  login: `SELECT user_pw FROM tb_user WHERE user_id = ?`,
  //카카오 로그인
  kakaoJoin: `INSERT INTO tb_user (user_id, user_nick, user_email, user_social_tp) VALUES(?,?,?,1)`,
  kakao_check: `SELECT * FROM tb_user WHERE user_id = ?`,
  //네이버 로그인
  naverlogin: `INSERT INTO tb_user (user_email, user_id, user_nick, user_social_tp) VALUES (?, ?, ?, 2)`,
  naver_id_check: `SELECT * FROM tb_user WHERE user_id = ?`,

  // admin 기능 
  admin_check: `SELECT user_tp FROM tb_user WHERE user_no = ?`,
  userlist: `SELECT user_no, user_id, user_nick, user_email, user_point, user_social_tp, user_create_dt, user_cat
                  FROM tb_user
                  WHERE user_tp = 0`,
  deleteUser: `DELETE FROM tb_user WHERE user_no = ?`,

  goods_add: `INSERT INTO tb_goods (goods_nm, goods_category, goods_price, goods_hashtag1, goods_hashtag2, goods_hashtag3, goods_cnt) VALUES (?,?,?,?,?,?,?)`,
  add_image: `UPDATE tb_goods SET goods_img = ?, goods_content = ? WHERE goods_no = ?`,
  goods_check: `SELECT * FROM tb_goods WHERE goods_nm = ?`,
  get_goods_no: `SELECT goods_no FROM tb_goods WHERE goods_nm = ?`,
  delete_goods: `DELETE FROM tb_goods WHERE goods_nm = ?`,
  delete_goods_2: `DELETE FROM tb_goods WHERE goods_no = ?`,
  get_img_nm: `SELECT goods_img, goods_content FROM tb_goods WHERE goods_no = ?`,
  admin_orderlist: `SELECT * FROM tb_order o
                        JOIN tb_order_detail od ON o.ORDER_TRADE_NO = od.ORDER_TRADE_NO `,
  order_status_update: `UPDATE tb_order
                            SET ORDER_STATUS = ?
                            WHERE ORDER_TRADE_NO IN (?)`,

  // goods
  goods_list: `SELECT goods_no, goods_category, goods_nm, goods_img, goods_price, goods_hashtag1, goods_cnt
                  FROM tb_goods`,
  goods_catelist: `SELECT goods_category, goods_no, goods_nm, goods_img, goods_price, goods_hashtag1, goods_hashtag2, goods_hashtag3
                       FROM tb_goods
                       WHERE goods_category = ?`,
  goods_searchlist: `SELECT goods_category, goods_no, goods_nm, goods_img, goods_price, goods_hashtag1, goods_hashtag2, goods_hashtag3
                       FROM tb_goods
                       WHERE goods_nm LIKE ?`,
  get_goods_info: `SELECT goods_no, goods_category, goods_nm, goods_price, goods_img, goods_content, goods_hashtag1, goods_hashtag2, goods_hashtag3, goods_cnt
                       FROM tb_goods
                       WHERE goods_no = ?`,
  goods_detail: `SELECT goods_no, goods_nm, goods_img, goods_category, goods_content, goods_price, goods_hashtag1, goods_hashtag2, goods_hashtag3, goods_cnt
                       FROM tb_goods
                       WHERE goods_no = ?`,
  order_payment: `INSERT INTO tb_order
                     (order_nm, order_adr1, order_adr2, order_zipcode, order_mobile, order_memo, order_amt, order_dc, order_delivery, order_total, user_no, order_tp)
                     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
  order_payment_detail: `INSERT INTO tb_order_detail (ORDER_TRADE_NO, GOODS_NO, ORDER_GOODS_NM, ORDER_GOODS_PRICE, ORDER_GOODS_IMG, ORDER_GOODS_CNT)
                      VALUES (?, ?, ?, ?, ?, ?)`,
  order_goods_cnt: `UPDATE tb_goods SET goods_cnt = goods_cnt - ? WHERE goods_no = ?`,
  order_usepoint: `UPDATE tb_user SET user_point = user_point - ? WHERE user_no = ?`,
  orderlist: `SELECT od.*, o.ORDER_STATUS, o.ORDER_CREATE_DT, o.ORDER_TP
                  FROM tb_order_detail od
                  JOIN tb_order o ON od.ORDER_TRADE_NO = o.ORDER_TRADE_NO
                  WHERE o.user_no =?`,
  orderlist_o_detail: `SELECT * FROM tb_order WHERE ORDER_TRADE_NO = ?`,
  orderlist_d_detail: `SELECT * FROM tb_order_detail WHERE ORDER_TRADE_NO = ?`,
  confirm_point: `UPDATE TB_USER
                    SET user_point = user_point + (SELECT (ORDER_TOTAL * 0.03) FROM TB_ORDER WHERE ORDER_TRADE_NO = ?)
                    WHERE user_no = ?`,
  cancel_point: `UPDATE TB_USER SET user_point = user_point + ? where user_no = ?`,
  cancel_goods: `UPDATE tb_goods SET goods_cnt = goods_cnt + ? where goods_no = ?`,
  check_review: `UPDATE tb_order_detail
                  SET REVIEW_CHECK = 1
                  WHERE ORDER_TRADE_NO = ?`,
  goods_get_review: `SELECT * FROM tb_review rv 
                        JOIN tb_user us LEFT OUTER JOIN tb_cat ct ON (us.user_no = ct.user_no) 
                        WHERE rv.user_no = us.user_no AND rv.goods_no = ?`,
  goods_main: `SELECT g.*, t.total_orders
                FROM TB_GOODS g
                INNER JOIN (
                  SELECT od.GOODS_NO, COUNT(*) AS total_orders
                  FROM TB_ORDER_DETAIL od
                  INNER JOIN TB_GOODS g ON od.GOODS_NO = g.GOODS_NO
                  WHERE g.GOODS_CATEGORY IN (1, 2, 3, 4) 
                  GROUP BY od.GOODS_NO
                  ORDER BY total_orders DESC
                ) AS t ON g.GOODS_NO = t.GOODS_NO;`,
  basket_insert: `INSERT INTO tb_basket 
                  (user_no, basket_goods_price, basket_goods_count, basket_goods_nm, basket_goods_img, basket_goods_no)
                  VALUE (?,?,?,?,?,?)`,
  basket_delete: `DELETE FROM tb_basket WHERE basket_no = ?`,
  basket_check: `SELECT * FROM tb_basket WHERE user_no = ? AND basket_goods_no = ?`,
  basket_list: `SELECT * from tb_basket WHERE user_no = ? `,
  basket_update: `UPDATE tb_basket 
                    SET basket_goods_count = ?, basket_check = 1
                    WHERE basket_no = ?`,
  basket_tp: `SELECT * from tb_basket WHERE user_no = ? and basket_check = 1`,
  basket_cancel: `UPDATE tb_basket SET basket_check = 0 WHERE user_no = ?`,
  basket_success: `DELETE FROM tb_basket WHERE basket_check = 1 AND user_no = ?`,


  // 펫 정보
  cat_insert: `INSERT INTO tb_cat (user_no, cat_name, cat_breed, cat_birth, cat_sex) VALUES (?,?,?,?,?)`,
  cat_check: `SELECT user_cat FROM tb_user WHERE user_no = ?`,
  usercattp_update: `UPDATE tb_user SET user_cat=1 WHERE user_no = ?`,
  cat_info: `SELECT cat_name, cat_img, cat_breed, cat_birth, cat_sex
               FROM tb_cat 
               WHERE user_no = ?`,
  cat_update: `UPDATE tb_cat 
                 SET cat_name = ?, cat_breed = ?, cat_birth = ?, cat_sex =?, cat_img = ?
                 WHERE user_no = ?`,
  get_cat_id: `SELECT cat_id from tb_cat WHERE user_no = ?`,
  cat_img_insert: `UPDATE tb_cat
                 SET cat_img = ?
                 WHERE user_no = ?`,

  // 좋아요(찜) 기능
  like_insert: `INSERT INTO tb_like (user_no, goods_no) VALUES (?,?)`,
  like_delete: `DELETE FROM tb_like WHERE user_no = ? AND goods_no = ?`,
  like_check: `SELECT * FROM tb_like WHERE user_no = ? AND goods_no = ?`,
  like_count: `SELECT COUNT(*) FROM tb_like WHERE goods_no = ?`,
  like_list: `SELECT l.*, g.goods_nm, g.goods_price, g.goods_img
               FROM tb_like l
               JOIN tb_goods g ON l.goods_no = g.goods_no
               WHERE l.user_no = ?`,

  //mypage  0705 , cat_img
  get_user_info: `SELECT user_id, user_nick, user_email, user_mobile, user_zipcode, user_adr1, user_adr2, user_point, user_cat
    FROM tb_user
    WHERE user_no = ?`,
  get_cat_info: `SELECT cat_name, cat_img
    FROM tb_cat 
    WHERE user_no = ?`,
  get_delivery_count: `SELECT COUNT(*) AS cnt FROM tb_order 
              WHERE order_status = 1 AND user_no = ?`,

  //0704
  mypage_update: `UPDATE tb_user 
    SET user_id = ?, user_nick = ?, user_email = ?, user_mobile =?, user_zipcode =?, user_adr1 =?, user_adr2 =?
    WHERE user_no = ?`,
  user_info: `SELECT user_id, user_nick, user_email, user_mobile, user_zipcode, user_adr1, user_adr2
    FROM tb_user
    WHERE user_no = ?`,


  //pass //230709
  get_password: 'SELECT user_pw FROM tb_user WHERE user_no = ?',
  pass_update: 'UPDATE tb_user SET user_pw = ? WHERE user_no = ?',

  //qna게시판
  content: `SELECT * FROM tb_qna JOIN tb_user 
                WHERE tb_qna.user_no=tb_user.user_no AND qna_no = ?;`,
  write: `INSERT INTO tb_qna (user_no, qna_title, qna_content, is_secret) VALUES (?, ?, ?, ?)`,
  qna: `SELECT * FROM tb_qna JOIN tb_user 
                WHERE tb_qna.user_no=tb_user.user_no 
                ORDER BY QNA_NO DESC LIMIT ? OFFSET ?;`,//1  
  qnaAdmin: `SELECT * FROM tb_qna JOIN tb_user
          WHERE tb_qna.user_no=tb_user.user_no`, //1
  deleteContent: `DELETE FROM tb_qna WHERE qna_no = ?`,
  qnaEdit: `UPDATE tb_qna  SET qna_content = ?, qna_title = ? WHERE qna_no = ?;`,
  qnaCheck: `SELECT user_tp FROM tb_user WHERE user_no =?;`,
  qnaWrite: `UPDATE tb_qna  SET qna_answer = ?  WHERE qna_no = ?;`,
  qnacnt: `SELECT COUNT(*) FROM tb_qna;`,
  //문의내역확인
  myqna: `SELECT * FROM tb_qna JOIN tb_user 
        WHERE tb_qna.user_no=tb_user.user_no AND tb_qna.user_no = ?;`,

  // 리뷰 
  review_write: `INSERT INTO tb_review (review_con, user_no, goods_no, order_trade_no, order_status, review_score) VALUES (?, ?, ?, ?, ?, ?)`,
  get_review_no: `SELECT review_no FROM tb_review WHERE order_trade_no = ?`,
  review_img_insert: `UPDATE tb_review
                        SET review_img = ?
                        WHERE review_no = ? `,
  get_my_review: `SELECT * 
                    FROM tb_review 
                    JOIN tb_goods ON tb_review.goods_no = tb_goods.goods_no
                    WHERE user_no = ? `,

  // 아이디 비번 찾기 230711
  id_find: `SELECT user_id FROM tb_user WHERE user_email = ?`,
  user_check: `SELECT user_no FROM tb_user WHERE user_email = ? AND user_id = ?`,
  pass_update_tem: `UPDATE tb_user SET user_pw = ? WHERE user_id = ?`,

}