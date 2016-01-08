describe('settings',function(){

describe('safemarket',function(){
    it('should exist on port 8000',function(){
        browser.get('http://127.0.0.1:8000');
    })
})

describe('settings modal',function(){
    it('should open when the settings button is clicked',function(){
        element(by.css('[ng-click="openSettingsModal()"]')).click()
        var currentController = browser.executeScript("return angular.element(document.body).injector().get('modals').currentController")
        expect(currentController).toBe('SettingsModalController');
    })
    /*
        it('should save an affiliate alias', function(){
          element(by.css('[name="affiliateAlias"]')).clear()
          element(by.css('[name="affiliateAlias"]')).sendKeys('cheese')
          element(by.css('[name="affiliateAlias"]')).getAttribute('value').then(function(text){
          })
          element(by.css('[ng-click="registerAffiliateAlias()"]')).click()
          browser.wait(function() {
            return browser.switchTo().alert().then(
              function() { return true; },
              function() { return false; }
            );
          });
          browser.switchTo().alert().accept();
          browser.waitForAngular()

          browser.refresh()

          element(by.css('[ng-click="openSettingsModal()"]')).click()
          browser.waitForAngular()
          var currentController = browser.executeScript("return angular.element(document.body).injector().get('modals').currentController")
          expect(currentController).toBe('SettingsModalController');

          element(by.css('[name="affiliateAlias"]')).getAttribute('value').then(function(text){
            expect(text).toBe("cheese");
          })
        })
    */
    it('should show mulitple currencies',function(){
        var currencyCount = element.all(by.css('[ng-model="user.data.currency"] option')).count()
        expect(currencyCount).toBeGreaterThan(1);
    })

    it('should create a keypair without setting it as the primary',function(){
        element(by.css('[ng-click="addKeypair()"]')).click()
        browser.wait(function() {
            return browser.switchTo().alert().then(
                function() { return true; },
                function() { return false; }
            );
        });
        browser.switchTo().alert().dismiss();
        var keypairsCount = browser.executeScript("return angular.element(document.body).injector().get('user').keypairs.length")
        expect(keypairsCount).toBe(1);
    })

    it('should create a keypair and set it as the primary',function(){
        element(by.css('[ng-click="addKeypair()"]')).click()
        browser.wait(function() {
            return browser.switchTo().alert().then(
                function() { return true; },
                function() { return false; }
            );
        });
        browser.switchTo().alert().accept();
        element(by.css('[ng-click="approve()"]')).click()
        var keypairsCount = browser.executeScript("return angular.element(document.body).injector().get('user').keypairs.length")
        expect(keypairsCount).toBe(2);

        browser.wait(function() {
            var deferred = protractor.promise.defer();
            element(by.css('[src="images/balls.gif"]')).isDisplayed()
                .then(function (isDisplayed) {
                  deferred.fulfill(!isDisplayed);
            });
            return deferred.promise;
        });
        browser.waitForAngular()
        var keypairMatches = browser.executeScript("var user = angular.element(document.body).injector().get('user'); return user.keypairs[1].id === user.keypair.id")
        expect(keypairMatches).toBe(true);
    })

    // it('should be deleted when clicked',function(){
    //     browser.waitForAngular()
    //     element(by.css('[ng-click="deleteKeypair($index)"]')).click()
    //     browser.switchTo().alert().accept();
    //     var keypairsCount = browser.executeScript("return angular.element(document.body).injector().get('user').keypairs.length")
    //     expect(keypairsCount).toBe(1);
    // })
})

})