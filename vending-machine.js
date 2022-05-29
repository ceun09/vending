// IDB 데이터를 저장할 수 있도록 db object 인스턴스 생성
let db;

let newItem = [
  {
    prdName: "",
    prdPrice: 0,
    prdCount: 0
  }
];

// Variables
const DBName = 'Vending';
const prdList = document.getElementById('prd-list');

const prdAddForm = document.getElementById('prd-add-form');

const prdName = document.getElementById('prd-name');
const prdPrice = document.getElementById('prd-price');
const prdCount = document.getElementById('prd-count');

const submit = document.getElementById('submit');

const member = document.getElementById('member');
let memberNow;
let balanceNow;
let balance1 = balance2 = balance3 = balance4 = 10000;
let holdingMoney = 0;

window.onload = function() {

  function openDB() {
    window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
    window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
  
    // DB 불러오는 변수
    const request = window.indexedDB.open(DBName, 1);
  
    request.onerror = function(event) {
      alert('Error loading database');
    }
    request.onsuccess = function(event) {
      console.log('Database initialised.');
  
      // db 변수에 불러온 데이터베이스 결과를 저장
      db = request.result;
  
      displayData();
    };
  
    request.onupgradeneeded = function(event) {
      let db = event.target.result;
  
      db.onerror = function(event) {
        alert('Error loading database');
      };
  
      // 데이터베이스를 위한 objectStore 생성
      let objectStore = db.createObjectStore('product', { keyPath: 'id', autoIncrement: true });
  
      // objectStore에 포함될 데이터 정의
      objectStore.createIndex("prdName", "prdName", { unique: false });
      objectStore.createIndex("prdPrice", "prdPrice", { unique: false });
      objectStore.createIndex("prdCount", "prdCount", { unique: false });
  
      console.log('Object store created.');
    };
  }
  
  openDB()

  function displayData() {
    // prd list 안의 내용 전부 삭제
    while(prdList.firstChild) {
      prdList.removeChild(prdList.lastChild);
    }

    // object store를 불러오고 IDB 안에 든 모든 데이터의 cursor 리스트를 get
    let objectStore = db.transaction('product','readonly').objectStore('product');

    console.log(prdList.firstChild)

    objectStore.openCursor().onsuccess = function(event) {
      let cursor = event.currentTarget.result;

      console.log(prdList.firstChild)
      if(cursor) {
        // product list 생성
        const listText = document.createTextNode(`${cursor.value.prdName} | ${cursor.value.prdPrice}원 (재고: ${cursor.value.prdCount})`);
        const listItem = document.createElement('li');
        const listBtn = document.createElement('button');
        const listBtnText = document.createTextNode('구매');

        listItem.classList.add('list');
        listBtn.classList.add('buy-btn');
        listBtn.setAttribute('data-index', Number(cursor.value.id));

        listBtn.appendChild(listBtnText);
        listItem.append(listText, listBtn);
        
        // prd-list에 list item 생성
        prdList.appendChild(listItem);

        const buyBtn = document.querySelectorAll('.buy-btn');
        for(var i = 0; i < buyBtn.length; i++) {
          buyBtn[i].addEventListener('click', function(e) {
            var eventIdx = Number(this.getAttribute('data-index'));
            buyProduct(eventIdx);
          });
        }

        cursor.continue();
      } else {
        console.log('Entries all displayed.');
      }
    }
  }

  // submit 버튼이 눌리면 addData 함수 작동
  document.getElementById('submit').addEventListener('click', addData)

  // member-submit 버튼이 눌리면 memberChange 함수 작동
  document.getElementById('member-submit').addEventListener('click', memberChange);

  // Input 버튼이 눌리면 inputMoney 함수 작동
  const inputBtn = document.getElementById('input-btn');
  inputBtn.addEventListener('click', inputMoney);

  // Return 버튼이 눌리면 returnMoney 함수 작동
  const returnBtn = document.getElementById('return-btn');
  returnBtn.addEventListener('click', returnMoney);

  // restart 버튼 눌렸을 때 재시작
  document.getElementById('restart').addEventListener('click', function() {
    deleteItem();

    // 잔금 10000원씩 추가
    balance1 += 10000;
    balance2 += 10000;
    balance3 += 10000;
    balance4 += 10000;
    memberChange();

    alert('새로 시작합니다.')
  })

  function addData(e) {
    e.preventDefault();

    // 필수 값이 입력되지 않았을 경우 alert 표시
    if(prdName.value == '' || prdPrice.value == null || prdCount.value == null) {
      alert('상품 정보를 입력해 주세요.');
      return;
    } else {
      let newItem = [
        { prdName: prdName.value, prdPrice: prdPrice.value, prdCount: prdCount.value}
      ];

      let transaction = db.transaction(['product'], "readwrite");

      transaction.oncomplete = function() {
        console.log('Transaction completed: database modification finished.');

        displayData();
      };

      transaction.onerror = function() {
        console.log(`Transaction not opened due to error: ${transaction.error}`);
      };

      // database에 저장된 object store를 불러옴
      let objectStore = transaction.objectStore('product');

      // newItem을 object store에 추가하기 위한 request 생성
      let objectStoreRequest = objectStore.add(newItem[0]);
      objectStoreRequest.onsuccess = function(event) {
        console.log('Request successful.');

        // form 내용 초기화
        prdName.value = '';
        prdPrice.value = null;
        prdCount.value = null;
      };

      document.getElementById('prd-null-notice').style.display = 'none';
    };
  };

  function memberChange() {
    memberNow = member.value;
    switch(memberNow) {
      case '1':
        document.getElementById('member-balance').style.display = 'block';
        document.getElementById('member-balance').innerText = '남은 금액: ' + balance1;
        balanceNow = balance1;
        document.querySelector('.admin-box').classList.remove('admin');
        document.querySelector('.input-box').classList.remove('admin');
        break;
      case '2':
        document.getElementById('member-balance').style.display = 'block';
        document.getElementById('member-balance').innerText = '남은 금액: ' + balance2;
        balanceNow = balance2;
        document.querySelector('.admin-box').classList.remove('admin');
        document.querySelector('.input-box').classList.remove('admin');
        break;
      case '3':
        document.getElementById('member-balance').style.display = 'block';
        document.getElementById('member-balance').innerText = '남은 금액: ' + balance3;
        balanceNow = balance3;
        document.querySelector('.admin-box').classList.remove('admin');
        document.querySelector('.input-box').classList.remove('admin');
        break;
      case '4':
        document.getElementById('member-balance').style.display = 'block';
        document.getElementById('member-balance').innerText = '남은 금액: ' +  balance4;
        balanceNow = balance4;
        document.querySelector('.admin-box').classList.remove('admin');
        document.querySelector('.input-box').classList.remove('admin');
        break;
      case '5':
        document.getElementById('member-balance').style.display = 'none';
        balanceNow = null;
        document.querySelector('.admin-box').classList.add('admin');
        document.querySelector('.input-box').classList.add('admin');
        break;
    }
    return balanceNow;
  }

  function buyProduct(event) {
    const id = event;

    var request;
    let objectStore = db.transaction('product', 'readwrite').objectStore('product');

    request = objectStore.get(id);
    request.onsuccess = function(event) {
      const data = event.target.result;
      let price = data.prdPrice;
      let count = data.prdCount;

      if(!memberNow) {
        alert('이용자를 선택해 주세요.')
      } else if (holdingMoney < price) {
        alert('잔돈이 부족합니다.')
      } else {
        if(count > 1) {
          data.prdCount -= 1;
          holdingMoney -= price;
          document.getElementById('holding-money').innerText = '투입된 금액: ' + holdingMoney;
          alert('구매하였습니다.');
        } else if (count == 1) {
          data.prdCount = 'SOLDOUT';
          holdingMoney -= price;
          document.getElementById('holding-money').innerText = '투입된 금액: ' + holdingMoney;
          alert('구매하였습니다.');
        } else {
          alert('재고가 부족합니다.')
        }
      }

      var requestUpdate = objectStore.put(data);
      requestUpdate.onsuccess = function() {
        console.log('update')
      }
    }
    displayData();
    return holdingMoney;
  }

  function inputMoney() {
    memberChange();
    switch(memberNow) {
      case '1':
        if(balance1 > 0) {
          holdingMoney += 1000;
          balance1 -= 1000;
          balanceNow = balance1;
          document.getElementById('holding-money').innerText = '투입된 금액: ' + holdingMoney;
        } else {
          alert('잔액이 부족합니다.')
        }
        memberChange();
        break;
      case '2':
        if(balance2 > 0) {
          holdingMoney += 1000;
          balance2 -= 1000;
          balanceNow = balance2;
          document.getElementById('holding-money').innerText = '투입된 금액: ' + holdingMoney;
        } else {
          alert('잔액이 부족합니다.')
        }
        memberChange();
        break;
      case '3':
        if(balance3 > 0) {
          holdingMoney += 1000;
          balance3 -= 1000;
          balanceNow = balance3;
          document.getElementById('holding-money').innerText = '투입된 금액: ' + holdingMoney;
        } else {
          alert('잔액이 부족합니다.')
        }
        memberChange();
        break;
      case '4':
        if(balance4 > 0) {
          holdingMoney += 1000;
          balance4 -= 1000;
          balanceNow = balance4;
          document.getElementById('holding-money').innerText = '투입된 금액: ' + holdingMoney;
        } else {
          alert('잔액이 부족합니다.')
        }
        memberChange();
        break;
      case '5':
        break;
    }
    return holdingMoney;
  }

  function returnMoney() {
    memberChange();
    switch(memberNow) {
      case '1':
        balance1 += holdingMoney;
        balanceNow = balance1;
        holdingMoney = 0;
        document.getElementById('holding-money').innerText = '투입된 금액: ' + holdingMoney;
        memberChange();
        alert('잔금이 반환되었습니다.');
        break;
      case '2':
        balance2 += holdingMoney;
        balanceNow = balance2;
        holdingMoney = 0;
        document.getElementById('holding-money').innerText = '투입된 금액: ' + holdingMoney;
        memberChange();
        alert('잔금이 반환되었습니다.');
        break;
      case '3':
        balance3 += holdingMoney;
        balanceNow = balance3;
        holdingMoney = 0;
        document.getElementById('holding-money').innerText = '투입된 금액: ' + holdingMoney;
        memberChange();
        alert('잔금이 반환되었습니다.');
        break;
      case '4':
        balance4 += holdingMoney;
        balanceNow = balance4;
        holdingMoney = 0;
        document.getElementById('holding-money').innerText = '투입된 금액: ' + holdingMoney;
        memberChange();
        alert('잔금이 반환되었습니다.');
        break;
      case '5':
        break;
    }
    return holdingMoney;
  }

  // DB에 저장된 전체 항목 삭제
  function deleteItem() {
    let transaction = db.transaction(['product'], 'readwrite');
    let request = transaction.objectStore('product').clear();

    request.oncomplete = function() {
      while(prdList.firstChild) {
        prdList.removeChild(prdList.lastChild);
      }
    };
    displayData();
  }
}

