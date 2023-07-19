<template>
    <head>
    <!-- 기타 스타일시트 등의 내용 -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" />
  </head>
    <div class="icon-container">
      <h1>
        <a href="/my-info" class="icon-link">
          <i class="fas fa-user"></i>
          <span>내정보</span>
        </a>
      </h1>
      <h1>
        <a href="/order-history" class="icon-link">
          <i class="fas fa-shopping-cart"></i>
          <span>주문내역</span>
        </a>
      </h1>
      <h1>
        <a href="/my-reviews" class="icon-link">
          <i class="fas fa-star"></i>
          <span>나의리뷰</span>
        </a>
      </h1>
      <h1>
        <a href="/inquiries" class="icon-link">
          <i class="fas fa-question-circle"></i>
          <span>문의내역</span>
        </a>
      </h1>
      <h1>
        <a href="/pet-info" class="icon-link">
          <i class="fas fa-paw"></i>
          <span>펫정보</span>
        </a>
      </h1>
    </div>
  </template>
  
  <style>
  .icon-container {
    display: flex;
    flex-direction: column;
  }
  
  .icon-link {
    display: flex;
    align-items: center;
    text-decoration: none;
    color: inherit;
    padding: 10px;
    transition: background-color 0.3s;
  }
  
  .icon-link:hover {
    background-color: #f5f5f5;
  }
  
  .icon-link i {
    font-size: 24px;
    margin-right: 10px;
  }
  
  .icon-link span {
    font-size: 18px;
  }
  
  .icon-link:hover i {
    color: #ff9800;
  }
  </style>