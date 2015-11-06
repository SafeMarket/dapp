describe('safemarket',function(){
    it('should exist on port 8000',function(){
        browser.get('http://localhost:8000');
    })
})

describe('market modal',function(){
    it('should open when the market modal button is clicked',function(){
        element(by.css('[ng-click="openMarketModal()"]')).click()
        var currentController = browser.executeScript("return angular.element(document.body).injector().get('modals').currentController")
        expect(currentController).toBe('MarketModalController')
    })

    it('should create The Drink Market',function(){
        element(by.css('[ng-model="name"]')).sendKeys('The Drink Market')
        element(by.css('[ng-model="info"]')).sendKeys('The best drinks on the interweb')
        element(by.css('[ng-click="submit()"]')).click()
        browser.switchTo().alert().accept();
        browser.waitForAngular()
        element(by.css('[ng-href*="#/markets/"]')).click()
        element(by.css('h1')).getText().then(function(text){
            expect(text.indexOf('The Drink Market')).toNotEqual(-1)
        })
        
    })

    it('should add Satoshis Lemonade Stand',function(){
        element(by.css('[ng-click="openMarketModal(market)"]')).click()
        var currentModal = browser.executeScript("return angular.element(document.body).injector().get('modals').currentModal")
        expect(currentModal).toBe('MarketModalController')
        element(by.css('[ng-click="addStore()"]')).click()
        var storeAddr = browser.executeScript("return angular.element(document.body).injector().get('user').data.stores[0]")
        browser.waitForAngular()
        browser.pause()
        element(by.css('[ng-model="store.addr"]')).sendKeys(storeAddr)
        element(by.css('[ng-click="submit()"]')).click()
        browser.wait(function() {
            return browser.switchTo().alert().then(
                function() { return true; }, 
                function() { return false; }
            );
        });
        browser.switchTo().alert().accept();
        browser.waitForAngular()
        var storeText = element(by.css('[ng-repeat="store in market.stores"]')).getText().then(function(text){
            expect(text.indexOf('Satoshis Lemonade Stand')).toNotEqual(-1)
        })

    })

})