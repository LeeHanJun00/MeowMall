const express = require('express');
const router = express.Router();
const db = require('../db.js');
const sql = require('../sql.js');
const fs = require('fs');

const multer = require('multer');
const path = require("path");

// 메인 상품 리스트 
router.get('/maingoods', function (request, response, next) {
    db.query(sql.goods_main, function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '에러' });
        }
        response.json(results);
    });
});

// 상품 등록
router.post('/add_goods', function (request, response) {
    const goods = request.body;

    try {
        // 동일 상품 존재하는지 조회
        db.query(sql.goods_check, [goods.goods_nm], function (error, results, fields) {
            if (results.length <= 0) {

                // 이미지를 제외한 굿즈 정보 먼저 입력
                db.query(sql.goods_add, [goods.goods_nm, goods.goods_category, goods.goods_price, goods.goods_hashtag1, goods.goods_hashtag2, goods.goods_hashtag3, goods.goods_cnt], function (error, results, fields) {
                    if (error) {
                        return response.status(200).json({
                            message: 'fail'
                        })
                    }
                    try {
                        const pastDir0 = `${__dirname}` + `../../uploads/` + goods.goods_img
                        const pastDir1 = `${__dirname}` + `../../uploads/` + goods.goods_content

                        const newDir = `${__dirname}` + `../../uploads/uploadGoods/`;
                        if (!fs.existsSync(newDir)) fs.mkdirSync(newDir);

                        const extension = goods.goods_img.substring(goods.goods_img.lastIndexOf('.'))

                        // 등록 상품의 번호 불러오기
                        db.query(sql.get_goods_no, [goods.goods_nm], function (error, results, fields) {
                            const filename = results[0].goods_no

                            // 이미지 폴더 및 이름(상품번호-타입) 변경
                            // 타입 0: 메인 이미지 1: 상세 이미지
                            fs.rename(pastDir0, newDir + filename + '-0' + extension, (err) => {
                                if (err) {
                                    throw err;
                                }
                            });
                            fs.rename(pastDir1, newDir + filename + '-1' + extension, (err) => {
                                if (err) {
                                    throw err;
                                }
                            });

                            // 파일 변경 모두 성공했으면 바뀐 이름으로 DB에 입력 
                            db.query(sql.add_image, [filename + '-0' + extension, filename + '-1' + extension, filename], function (error, results, fields) {
                                if (error) {
                                    throw error;
                                }
                                else {
                                    return response.status(200).json({
                                        message: 'add_complete'
                                    })
                                }
                            })

                        })

                    }
                    catch (err) {
                        // 이미지 등록 실패
                        // -> DB에서 미리 등록한 상품도 다시 제거하기
                        db.query(sql.delete_goods, [goods.goods_nm], function (error, results, fields) {
                            return response.status(200).json({
                                message: 'fail'
                            })
                        })
                    }
                })

            }
            else {
                return response.status(200).json({
                    message: 'already_exist_goods'
                })
            }
        })

    } catch {
        return response.status(200).json({
            message: 'DB_error'
        })
    }
})

const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, cb) {
            cb(null, 'uploads/');
        },
        filename(req, file, cb) {
            cb(null, file.originalname);
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
});

// 이미지 등록 
router.post('/upload_img', upload.single('img'), (request, response) => {
    setTimeout(() => {
        return response.status(200).json({
            message: 'success'
        })
    }, 2000);
})

// 이미지 제거
router.post('/delete_img', (request, response) => {

    const pastname = request.body.pastname;
    try {
        if (pastname != "" && fs.existsSync(path.normalize(`${__dirname}../../uploads/${pastname}`))) {
            fs.unlinkSync(path.normalize(`${__dirname}../../uploads/${pastname}`))
        }
    }
    catch (error) {
        console.log(error)
    }
})

// 상품 정렬 방식 
function sortCaseReplace(sortCase) {
    let order = ` ORDER BY goods_no`; // 오래된 순
    if (sortCase == 1) { // 최근 순
        order = ` ORDER BY goods_no DESC`;
    }
    else if (sortCase == 2) { // 가격 낮은 순 
        order = ` ORDER BY goods_price`;
    }
    else if (sortCase == 3) { // 가격 높은 순 
        order = ` ORDER BY goods_price DESC`;
    }
    else if (sortCase == 4) {  // 이름
        order = ` ORDER BY goods_nm`;
    }
    return order;
}

// 관리자 상품 리스트 
router.get('/admin/goodslist/:sortCase/:keyword', function (request, response, next) {

    const sortCase = request.params.sortCase;
    const keyword = request.params.keyword;

    let search = '';

    if (keyword != 'none') {
        search = ' WHERE goods_nm Like "%' + keyword + '%" ';
    }

    const order = sortCaseReplace(sortCase);

    db.query(sql.goods_list + search + order, function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '회원리스트에러' });
        }
        response.json(results);
    });
});

// 상품 수정용 정보 가져오기
router.post('/admin/get_goods_info', function (request, response, next) {
    const goods_no = request.body.goodsno
    db.query(sql.get_goods_info, [goods_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'goods_info_error' })
        }
        response.json(results);
    })
})

// 상품 제거
router.post('/admin/delete_goods', function (request, response, next) {
    const goods_no = request.body.goods_no;

    // 이미지 이름 불러오기
    db.query(sql.get_img_nm, [goods_no], function (error, results, fields) {
        if (error) {
            return response.status(500).json({ error: 'goods_error' })
        }
        else {
            try {
                const goods_img = results[0].goods_img;
                const goods_content = results[0].goods_content;

                // 이미지 제거
                fs.unlinkSync(`${__dirname}../../uploads/uploadGoods/${goods_img}`);
                fs.unlinkSync(`${__dirname}../../uploads/uploadGoods/${goods_content}`);

                // 상품 제거
                db.query(sql.delete_goods_2, [goods_no], function (error, results, fields) {
                    if (error) {
                        return response.status(500).json({ error: 'goods_error' })
                    }
                    else {
                        return response.status(200).json({
                            message: 'delete_complete'
                        })
                    }
                })
            }
            catch (error) {
                console.log("에러");
            }
        }
    })
})

// Main_카테고리별 상품 리스트 
router.get('/goodsCate/:category/:sortCase', function (request, response, next) {
    const category = request.params.category;
    const sortCase = request.params.sortCase;

    const order = sortCaseReplace(sortCase);

    db.query(sql.goods_catelist + order, [category], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '상품카테고리리스트에러' });
        }
        response.json(results);
    });
});

// Main_상품 검색 리스트
router.get('/goodsSearch/:keyword/:sortCase', function (request, response, next) {
    const keyword = '%' + request.params.keyword + '%';
    const sortCase = request.params.sortCase;

    const order = sortCaseReplace(sortCase);

    db.query(sql.goods_searchlist + order, [keyword], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'search_error' });
        }
        response.json(results);
    });
});

// 상품 상세페이지 
router.get('/goodsDetail/:goodsno', function (request, response, next) {
    const goodsno = request.params.goodsno;

    db.query(sql.goods_detail, [goodsno], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '상품디테일에러' });
        }
        response.json(results);
    });
});

// 상품 결제 
router.post('/orderPayment', function (request, response, next) {
    const { order, order_detail } = request.body;
    console.log(order);
    console.log(order_detail);

    db.query(sql.order_payment, [order.order_nm, order.order_adr1, order.order_adr2, order.order_zipcode, order.order_mobile,
    order.order_memo, order.order_amt, order.order_dc, order.order_delivery, order.order_total, order.user_no, order.order_tp],
        function (error, results, fields) {
            if (error) {
                return response.status(500).json({
                    message: 'DB_error'
                });
            }
            // 삽입된 주문의 ORDER_TRADE_NO
            const orderTradeNo = results.insertId;

            if (Array.isArray(order_detail)) {
                const detailPromises = order_detail.map((detail) => {
                    return new Promise((resolve, reject) => {
                        db.query(sql.order_payment_detail, [orderTradeNo, detail.goods_no, detail.order_goods_nm, detail.order_goods_price,
                            detail.order_goods_img, detail.order_goods_cnt],
                            function (error, results, fields) {
                                if (error) {
                                    reject(error);
                                } else {
                                    resolve();
                                }
                            });
                    });
                });

                Promise.all(detailPromises)
                    .then(() => {
                        db.query(sql.order_goods_cnt, [order_detail.goods_cnt, order_detail.goods_no], function (error) {
                            if (error) {
                                return response.status(500).json({
                                    message: 'DB_error'
                                });
                            }

                            if (order.order_dc > 0) {
                                db.query(sql.order_usepoint, [order.order_dc, order.user_no], function (error) {
                                    if (error) {
                                        return response.status(500).json({
                                            message: 'DB_error'
                                        });
                                    }

                                    return response.status(200).json({
                                        message: '완료'
                                    });
                                });
                            } else {
                                return response.status(200).json({
                                    message: '완료'
                                });
                            }
                        });
                    })
                    .catch(() => {
                        return response.status(500).json({
                            message: 'DB_error'
                        });
                    });
            } else {
                // order_detail이 배열이 아닌 경우에는 해당 주문 상세 정보 하나만 처리
                db.query(sql.order_payment_detail, [orderTradeNo, order_detail.goods_no, order_detail.order_goods_nm, order_detail.order_goods_price,
                    order_detail.order_goods_img, order_detail.order_goods_cnt],
                    function (error, results, fields) {
                        if (error) {
                            return response.status(500).json({
                                message: 'DB_error'
                            });
                        }
                        db.query(sql.order_goods_cnt, [order_detail.goods_cnt, order_detail.goods_no], function (error) {
                            if (error) {
                                return response.status(500).json({
                                    message: 'DB_error'
                                });
                            }

                            if (order.order_dc > 0) {
                                db.query(sql.order_usepoint, [order.order_dc, order.user_no], function (error) {
                                    if (error) {
                                        return response.status(500).json({
                                            message: 'DB_error'
                                        });
                                    }

                                    return response.status(200).json({
                                        message: '완료'
                                    });
                                });
                            } else {
                                return response.status(200).json({
                                    message: '완료'
                                });
                            }
                        });
                    });
            }
        });
});

// 주문 리스트
router.get('/orderlist/:userno', function (request, response, next) {

    const userno = request.params.userno;
    db.query(sql.orderlist, [userno], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '결제리스트에러' });
        }
        response.json(results);
    });
});

// 주문 상세보기
router.get('/orderODetail/:orderno', function (request, response, next) {
    const orderno = request.params.orderno;
    db.query(sql.orderlist_o_detail, [orderno], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '결제리스트에러' });
        }
        response.json(results);
    });
});
router.get('/orderDDetail/:orderno', function (request, response, next) {
    const orderno = request.params.orderno;
    db.query(sql.orderlist_d_detail, [orderno], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '결제리스트에러' });
        }
        response.json(results);
    });
});

// 구매 확정 적립금
router.post('/orderPoint/:TRADE_NO/:user_no', function (request, response, next) {
    const user_no = request.params.user_no;
    const order_trade_no = request.params.TRADE_NO;
    db.query(sql.confirm_point, [order_trade_no, user_no], function (error) {
        if (error) {
            return response.status(500).json({
                message: 'DB_error'
            });
        }
        return response.status(200).json({
            message: '완료'
        });
    });
})

// 구매 취소 적립금 돌려주기
router.post('/orderPointRollback/:user_no/:order_dc', function (request, response, next) {
    const user_no = request.params.user_no;
    const order_dc = request.params.order_dc;

    db.query(sql.cancel_point, [order_dc, user_no], function (error) {
        if (error) {
            return response.status(500).json({
                message: 'DB_error'
            });
        }
        return response.status(200).json({
            message: '완료'
        });
    });
})

// 구매 취소 재고 롤백
router.post('/goodsRollback', function (request, response, next) {
    const goods = request.body;

    if (Array.isArray(goods)) {
        const rollbackPromises = goods.map((detail) => {
            return new Promise((resolve, reject) => {
                db.query(sql.cancel_goods, [detail.goods_cnt, detail.goods_no], function (error, results, fields) {
                    if (error) {
                        console.error(error);
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            });
        });
        Promise.all(rollbackPromises)
            .then(() => {
                return response.status(200).json({
                    message: 'completed'
                });
            })
            .catch((error) => {
                console.error(error);
                return response.status(500).json({
                    message: 'DB_error'
                });
            });
    } else {
        return response.status(400).json({
            message: 'error'
        });
    }
});


// admi 주문관리 정렬방식 
function orderSort(sortCase) {
    let order = ` ORDER BY o.ORDER_TRADE_NO`; // 오래된 순

    if (sortCase == 0) { // 결제완료
        order = ` WHERE o.ORDER_STATUS = 0`;
    }
    else if (sortCase == 1) { // 배송중 
        order = ` WHERE o.ORDER_STATUS = 1`;
    }
    else if (sortCase == 2) { // 배송완료 
        order = ` WHERE o.ORDER_STATUS = 2`;
    }
    else if (sortCase == 3) { // 구매확정 
        order = ` WHERE o.ORDER_STATUS = 3`;
    }
    else if (sortCase == 9) {  // 취소
        order = ` WHERE o.ORDER_STATUS = 9`;
    }
    return order;
}

// admin 주문관리 내역
router.get('/admin/orderM/:sortCase', function (request, response, next) {
    const sortCase = request.params.sortCase;
    const order = orderSort(sortCase);

    db.query(sql.admin_orderlist + order, function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '주문관리리스트에러' });
        }
        response.json(results);
    });
});

// admin 주문상태 업데이트
router.post('/admin/updateStatus', function (request, response, next) {
    const orderTradeNos = request.body.orderTradeNos;
    const status = request.body.status;

    db.query(sql.order_status_update, [status, orderTradeNos], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '에러' });
        }
        return response.status(200).json({ message: 'complete' });
    });
});

// 찜 추가
router.post('/likeInsert/:goodsno/:user_no', function (request, response, next) {
    const user_no = request.params.user_no;
    const goods_no = request.params.goodsno;

    db.query(sql.like_check, [user_no, goods_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '에러' });
        }

        if (results.length > 0) {
            return response.status(200).json({ message: 'complete', isLiked: true });
        } else {
            db.query(sql.like_insert, [user_no, goods_no], function (error, results, fields) {
                if (error) {
                    console.error(error);
                    return response.status(500).json({ error: '에러' });
                }

                return response.status(200).json({ message: 'complete', isLiked: false });
            });
        }
    });
});

// 찜 체크
router.post('/likeCheck/:goodsno/:user_no', function (request, response, next) {
    const user_no = request.params.user_no;
    const goods_no = request.params.goodsno;

    if (user_no == 'null') {
        return response.status(200).json({ message: 'complete', isLiked: false });
    }

    db.query(sql.like_check, [user_no, goods_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '에러' });
        }

        if (results.length > 0) {
            return response.status(200).json({ message: 'complete', isLiked: true });
        } else {
            return response.status(200).json({ message: 'complete', isLiked: false });
        }
    });
});

// 찜 제거
router.post('/likeDelete/:goodsno/:user_no', function (request, response, next) {
    const user_no = request.params.user_no;
    const goods_no = request.params.goodsno;

    db.query(sql.like_delete, [user_no, goods_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '에러' });
        }
        return response.status(200).json({ message: 'complete' });
    });
});

// 찜 카운트
router.get('/likeCount/:goodsno', function (request, response, next) {
    const goods_no = request.params.goodsno;

    db.query(sql.like_count, [goods_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '에러' });
        }
        return response.status(200).json(results[0]['COUNT(*)']);
    });
});

// 리뷰 작성
router.post('/write_review', function (request, response, next) {

    const review = request.body;

    // 이미지를 제외한 리뷰 정보 먼저 입력
    db.query(sql.review_write, [review.content, review.user_no, review.goods_no, review.order_no, review.order_status, review.review_score], function (error, result) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'error' });
        }

        // 이미지 있을 경우
        if (review.review_img != '') {

            // 리뷰 번호 확인
            db.query(sql.get_review_no, [review.order_no], function (error, results, fields) {
                if (error) {
                    console.error(error);
                    return response.status(500).json({ error: 'error' });
                }
                const filename = results[0].review_no;

                const pastDir = `${__dirname}` + `../../uploads/` + review.review_img;
                const newDir = `${__dirname}` + `../../uploads/uploadReview/`;

                const extension = review.review_img.substring(review.review_img.lastIndexOf('.'))

                fs.rename(pastDir, newDir + filename + extension, (err) => {
                    if (err) {
                        return response.status(500).json();
                    }
                    else {
                        // 리뷰 이미지 삽입
                        db.query(sql.review_img_insert, [filename + extension, results[0].review_no], function (error, results, fields) {
                            if (error) {
                                return response.status(500).json();
                            }
                        })
                    }
                });
            })
        }

        // 주문 상세에서 리뷰 체크 속성 0 -> 1 변경
        db.query(sql.check_review, [review.order_no], function (error, results, fields) {
            if (error) {
                console.error(error);
                return response.status(500).json({ error: 'error' });
            }
        })

        return response.status(200).json({
            message: 'review_complete'
        });
    })
});

// 상품 상세 페이지 리뷰 리스트 불러오기
router.get('/getReview/:goodsno', function (request, response, next) {
    const goods_no = request.params.goodsno;

    db.query(sql.goods_get_review, [goods_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'DB 에러' });
        }
        return response.json(results);
    })
})

// 장바구니 추가 
router.post('/basketInsert', function (request, response, next) {
    const basket = request.body;

    db.query(sql.basket_check, [basket.user_no, basket.basket_goods_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'error' });
        }

        if (results.length > 0) {
            return response.status(200).json({ message: 'check_error' });
        } else {
            db.query(sql.basket_insert, [basket.user_no, basket.basket_goods_price, basket.basket_goods_count,
            basket.basket_goods_nm, basket.basket_goods_img, basket.basket_goods_no], function (error, data) {
                if (error) {
                    console.error(error);
                    return response.status(500).json({ error: 'error' });
                }

                return response.status(200).json({ message: 'complete' });
            });
        }
    });
});

// 장바구니 삭제 
router.post('/basketDelete/:basket_no', function (request, response, next) {
    const basket = request.params.basket_no;
    console.log(basket)

    db.query(sql.basket_delete, [basket], function (error, data) {
        if (error) {
            return response.status(500).json({
                message: 'DB_error'
            })
        }
        return response.status(200).json({
            message: 'complete'
        });
    })
});

// 장바구니 리스트
router.get('/basketList/:user_no', function (request, response, next) {
    const user_no = request.params.user_no;

    db.query(sql.basket_list, [user_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '에러' });
        }
        return response.status(200).json(results);
    });
});

// 장바구니 결제
router.post('/basketUpdate', function (request, response, next) {
    const basketNos = request.body.basket_no;
    const basketCounts = request.body.basket_goods_count;

    // 배열의 길이를 확인하여 모든 값에 대해 업데이트 수행
    if (basketNos.length !== basketCounts.length) {
        return response.status(400).json({ error: '장바구니 번호와 수량의 개수가 일치하지 않습니다.' });
    }

    for (let i = 0; i < basketNos.length; i++) {
        const basket_no = basketNos[i];
        const basket_goods_count = basketCounts[i];

        db.query(sql.basket_update, [basket_goods_count, basket_no], function (error, results, fields) {
            if (error) {
                console.error(error);
                return response.status(500).json({ error: '에러' });
            }
            // 모든 업데이트가 성공하면 마지막에 결과를 반환
            if (i === basketNos.length - 1) {
                return response.status(200).json({ message: 'update_complete' });
            }
        });
    }
});


// 장바구니 결제상품
router.get('/basketOrder/:user_no', function (request, response, next) {
    const user_no = request.params.user_no;

    db.query(sql.basket_tp, [user_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '에러' });
        }
        return response.status(200).json(results);
    });
});

// 장바구니 결제 이탈시 check 업데이트
router.get('/basketCancel/:user_no', function (request, response, next) {
    const user_no = request.params.user_no;

    db.query(sql.basket_cancel, [user_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '에러' });
        }
        return response.status(200).json(results);
    });
});

// 장바구니 결제 완료후 목록에서 삭제
router.post('/basketSuccess/:user_no', function (request, response, next) {
    const user_no = request.params.user_no;

    db.query(sql.basket_success, [user_no], function (error, data) {
        if (error) {
            return response.status(500).json({
                message: 'DB_error'
            })
        }
        return response.status(200).json({
            message: 'complete'
        });
    })
});

module.exports = router;