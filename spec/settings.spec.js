var BigNumber = require('bignumber.js')
    ,account1 = '0x1049a6c61c46a7c1e12d919189701bf26a1a2011'
    ,account2 = '0x86b9c59ba660d09d3f528d80520e6d5017c44dd2'

describe('settings',function(){

it('should bootstrap',function(){
    browser.get('http://127.0.0.1:8000');

    browser.wait(function() {
       return element(by.css('h1')).isDisplayed()
    }, 1000);
})

describe('modal',function(){
    it('should open when the settings button is clicked',function(){
        element(by.css('[ng-click="openSettingsModal()"]')).click()
        var currentController = browser.executeScript("return angular.element(document.getElementById('app')).injector().get('modals').currentController")
        expect(currentController).toBe('SettingsModalController');
    })

    it('should be set to the 1st account',function(){
        expect(element(by.css('#account')).getText()).toBe(account1)
    })

    it('should be funded',function(){
        expect(element(by.css('#balance [currency="USD"]')).getText()).not.toBe('0.00 USD')
    })

    it('should have the seed hidden',function(){
        var isSeedVisible = element(by.css('#seed')).isDisplayed()
        expect(isSeedVisible).toBe(false);
    })

    it('should have the seed visible after toggle',function(){
        element(by.css('#seed-toggle-button')).click()
        var isSeedVisible = element(by.css('#seed')).isDisplayed()
        expect(isSeedVisible).toBe(true);
    })

    it('should have 20 accounts',function(){
        var accountCount = element.all(by.css('#account-select option')).count()
        expect(accountCount).toBe(20);
    })

    it('should show mulitple currencies',function(){
        var currencyCount = element.all(by.css('#currency-select option')).count()
        expect(currencyCount).toBeGreaterThan(1);
    })

    it('should create a keypair without setting it as the primary',function(){
        element(by.css('#add-keypair-button')).click()
        browser.wait(function() {
            return browser.switchTo().alert().then(
                function() { return true; }, 
                function() { return false; }
            );
        });
        browser.switchTo().alert().dismiss();
        var keypairsCount = browser.executeScript("return angular.element(document.getElementById('app')).injector().get('user').getKeypairs().length")
        expect(keypairsCount).toBe(1);
    })

    it('should create a keypair and set it as the primary',function(){
        element(by.css('#add-keypair-button')).click()
        browser.wait(function() {
            return browser.switchTo().alert().then(
                function() { return true; }, 
                function() { return false; }
            );
        });
        browser.switchTo().alert().accept();

        browser.waitForAngular()
        element(by.css('#approve-button')).click()


        browser.wait(function(){
            return browser.executeScript('return !!angular.element(document.getElementById(\'keypairs-table\')).scope().keypair')
        })

        var keypairsCount = browser.executeScript("return angular.element(document.getElementById('app')).injector().get('user').getKeypairs().length")
        expect(keypairsCount).toBe(2);

        var keypairMatches = browser.executeScript("var user = angular.element(document.getElementById('app')).injector().get('user'); return user.getKeypairs()[1].id === angular.element(document.getElementById('keypairs-table')).scope().keypair.id")
        expect(keypairMatches).toBe(true);
    })

    it('should transfer everything from account1 to account2',function(){
        element(by.css('#internalRecipient-select option:nth-child(2)')).click()
        element(by.css('#transfer-button')).click()
        element(by.css('#approve-button')).click()
       
        waitForTx()

        expect(element(by.css('#balance [currency="USD"]')).getText()).toBe('0.00 USD')
    })

    it('should transfer $5000 of account2 to account1',function(){
        element(by.css('#account-select option:nth-child(2)')).click()
        element(by.css('#internalRecipient-select option:nth-child(1)')).click()
        element(by.css('#amountType-select option:nth-child(2)')).click()
        element(by.model('transferAmountInUserCurrency')).clear().sendKeys('5000')
        element(by.css('#transfer-button')).click()
        element(by.css('#approve-button')).click()
        waitForTx()
        element(by.css('#account-select option:nth-child(1)')).click()
        expect(element(by.css('#account')).getText()).toBe(account1)
        expect(element(by.css('#balance [currency="USD"]')).getText()).toBe("5,000.00 USD")
    })

    it('should display a no keypairs warning for account2',function(){
        element(by.css('#account-select option:nth-child(2)')).click()
        expect(element(by.css('#no-keypairs-alert')).isDisplayed()).toBe(true)
    })

    it('should not display a no keypairs warning for account1',function(){
        element(by.css('#account-select option:nth-child(1)')).click()
        expect(element(by.css('#no-keypairs-alert')).isDisplayed()).toBe(false)
    })

    // it('should be deleted when clicked',function(){
    //     browser.waitForAngular()
    //     element(by.css('[ng-click="deleteKeypair($index)"]')).click()
    //     browser.switchTo().alert().accept();
    //     var keypairsCount = browser.executeScript("return angular.element(document.getElementById('app')).injector().get('user').keypairs.length")
    //     expect(keypairsCount).toBe(1);
    // })
})

})

function waitForTx(){
    browser.wait(function() {
        var deferred = protractor.promise.defer();
        element(by.css('#tx-monitor-modal-body')).isPresent()
            .then(function (isPreset) {
              deferred.fulfill(!isPreset);
        });
        return deferred.promise;
    });
}

function waitToAppear(selector){
    browser.wait(element(by.css(selector)).isPresent());
}