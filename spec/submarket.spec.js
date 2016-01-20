describe('submarket',function(){

var submarketAlias = 'drinksubmarket'+Math.floor(Math.random()*999999)

it('should bootstrap',function(){
    browser.get('http://127.0.0.1:8000');

    browser.wait(function() {
       return element(by.css('h1')).isDisplayed()
    }, 1000);
})

it('should open when the submarket modal button is clicked',function(){
    element(by.css('[ng-click="openSubmarketModal()"]')).click()
    var currentController = browser.executeScript("return angular.element(document.getElementById('app')).injector().get('modals').currentController")
    expect(currentController).toBe('SubmarketModalController')
})

it('should create The Drink Submarket',function(){
    element(by.css('.modal-content [ng-model="alias"]')).sendKeys(submarketAlias)
    element(by.css('[ng-model="name"]')).sendKeys('The Drink Submarket')
    element(by.css('[ng-model="info"]')).sendKeys('The best drinks on the interweb')
    element(by.css('[ng-click="submit()"]')).click()
    element(by.css('[ng-click="approve()"]')).click()    
})

it('add the submarket to my submarket',function(){
    element(by.css('[ng-href*="#/submarkets/"]')).getText().then(function(text){
        expect(text).toBe('@'+submarketAlias)
    })
})

it('should be accessable via the aliasbar',function(){
    element(by.css('[ng-model="alias"]')).sendKeys(submarketAlias)
    element(by.css('#aliasBar')).submit()
    element(by.css('h1')).getText().then(function(text){
        expect(text.indexOf('The Drink Submarket')).toNotEqual(-1)
    })
})

})