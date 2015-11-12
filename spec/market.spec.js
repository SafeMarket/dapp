describe('market',function(){

var marketAlias = 'drinkmarket'+Math.floor(Math.random()*999999)

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
        element(by.css('.modal-content [ng-model="alias"]')).sendKeys(marketAlias)
        element(by.css('[ng-model="name"]')).sendKeys('The Drink Market')
        element(by.css('[ng-model="info"]')).sendKeys('The best drinks on the interweb')
        element(by.css('[ng-click="submit()"]')).click()
        browser.switchTo().alert().accept();
        browser.wait(function() {
            var deferred = protractor.promise.defer();
            element(by.css('.modal-body')).isPresent()
                .then(function (isDisplayed) {
                  deferred.fulfill(!isDisplayed);
            });
            return deferred.promise;
        });
        element(by.css('[ng-href*="#/markets/"]')).click()
        element(by.css('h1')).getText().then(function(text){
            expect(text.indexOf('The Drink Market')).toNotEqual(-1)
        })
        
    })

})

})