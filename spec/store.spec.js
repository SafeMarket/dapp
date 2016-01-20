describe('store',function(){

var storeAlias = 'satoshis'+Math.floor(Math.random()*999999)

it('should bootstrap',function(){
    browser.get('http://127.0.0.1:8000');

    browser.wait(function() {
       return element(by.css('h1')).isDisplayed()
    }, 1000);
})

it('should open when the store modal button is clicked',function(){
    element(by.css('[ng-click="openStoreModal()"]')).click()
    var currentController = browser.executeScript("return angular.element(document.getElementById('app')).injector().get('modals').currentController")
    expect(currentController).toBe('StoreModalController')
})

it('should create Satoshis Lemonade Stand',function(){
    browser.waitForAngular()
    element(by.css('.modal-body [ng-model="alias"]')).sendKeys(storeAlias)
    element(by.css('[ng-model="name"]')).sendKeys('Satoshis Lemonade Stand')
    element(by.css('[ng-model="info"]')).sendKeys('The best lemonade on the interweb')
    element(by.css('[ng-click="addProduct()"]')).click(0)
    element.all(by.css('[ng-model="product.name"]')).get(0).sendKeys('Lemonade')
    element.all(by.css('[ng-model="product.price"]')).get(0).sendKeys('0.50')
    element.all(by.css('[ng-model="product.info"]')).get(0).sendKeys('A quenching treat!')
    element(by.css('[ng-click="addProduct()"]')).click(0)
    element.all(by.css('[ng-model="product.name"]')).get(1).sendKeys('Sugar Cookies')
    element.all(by.css('[ng-model="product.price"]')).get(1).sendKeys('1.50')
    element.all(by.css('[ng-model="product.info"]')).get(1).sendKeys('A tasty snack!')
    element(by.css('[ng-click="addTransport()"]')).click(0)
    element.all(by.css('[ng-model="transport.type"]')).get(0).sendKeys('Basic')
    element.all(by.css('[ng-model="transport.price"]')).get(0).sendKeys('1.00')
    element(by.css('[ng-click="submit()"]')).click()
    element(by.css('[ng-click="approve()"]')).click()
})

it('add the store to my stores',function(){
    element(by.css('[ng-href*="#/stores/"]')).getText().then(function(text){
        expect(text).toBe('@'+storeAlias)
    })
})

it('should be accessable via the aliasbar',function(){
    element(by.css('[ng-model="alias"]')).sendKeys(storeAlias)
    element(by.css('#aliasBar')).submit()
    element(by.css('h1')).getText().then(function(text){
        expect(text.indexOf('Satoshis Lemonade Stand')).toNotEqual(-1)
    })
})

it('should update to Satoshis Awesome Lemonade Stand Edited',function(){
    browser.waitForAngular()
    element(by.css('[ng-click="openStoreModal(store)"]')).click()
    var currentController = browser.executeScript("return angular.element(document.getElementById('app')).injector().get('modals').currentController")
    expect(currentController).toBe('StoreModalController')
    browser.waitForAngular()
    browser.wait(function() {
        var deferred = protractor.promise.defer();
        element(by.css('.modal-body')).isPresent()
            .then(function (isPresent) {
              deferred.fulfill(isPresent);
        });
        return deferred.promise;
    });

    element(by.css('[ng-model="name"]')).sendKeys(' Edited')
    element(by.css('[ng-click="submit()"]')).click()
    element(by.css('[ng-click="approve()"]')).click()
    element(by.css('h1')).getText().then(function(text){
        expect(text.indexOf('Satoshis Lemonade Stand Edited')).toNotEqual(-1)
    })
})

// it('should add Satoshis Lemonade Stand',function(){
//     element(by.css('[ng-click="openMarketModal(market)"]')).click()
//     var currentController = browser.executeScript("return angular.element(document.getElementById('app')).injector().get('modals').currentController")
//     expect(currentController).toBe('MarketModalController')
//     element(by.css('[ng-click="addStore()"]')).click()
//     var storeAddr = browser.executeScript("return angular.element(document.getElementById('app')).injector().get('user').data.stores[0]")
//     browser.waitForAngular()
//     browser.pause()
//     element(by.css('[ng-model="store.addr"]')).sendKeys(storeAddr)
//     element(by.css('[ng-click="submit()"]')).click()
//     browser.wait(function() {
//         return browser.switchTo().alert().then(
//             function() { return true; },
//             function() { return false; }
//         );
//     });
//     browser.switchTo().alert().accept();
//     browser.waitForAngular()
//     var storeText = element(by.css('[ng-repeat="store in market.stores"]')).getText().then(function(text){
//         expect(text.indexOf('Satoshis Lemonade Stand')).toNotEqual(-1)
//     })

// })


})