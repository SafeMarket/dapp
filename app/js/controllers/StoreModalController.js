(function() {

  angular.module('app').controller('StoreModalController',
  function($scope, $filter, utils, Store, ticker, growl, $modal, $modalInstance, store, user, helpers) {

    $scope.currencies = Object.keys(ticker.rates)
    $scope.user = user
    $scope.submarkets = []

    $scope.disputeSecondsOptions = [
      {value: '0'},
      {value: '86400'},
      {value: '172800'},
      {value: '259200'},
      {value: '604800'},
      {value: '1209600'},
      {value: '1814400'},
      {value: '2592000'},
    ]

    $scope.countries = [
      'Worldwide',
      'Afghanistan',
      'Åland Islands',
      'Albania',
      'Algeria',
      'American Samoa',
      'Andorra',
      'Angola',
      'Anguilla',
      'Antarctica',
      'Antigua and Barbuda',
      'Argentina',
      'Armenia',
      'Aruba',
      'Australia',
      'Austria',
      'Azerbaijan',
      'Bahamas',
      'Bahrain',
      'Bangladesh',
      'Barbados',
      'Belarus',
      'Belgium',
      'Belize',
      'Benin',
      'Bermuda',
      'Bhutan',
      'Bolivia',
      'Bosnia and Herzegovina',
      'Botswana',
      'Bouvet Island',
      'Brazil',
      'British Indian Ocean Territory',
      'Brunei Darussalam',
      'Bulgaria',
      'Burkina Faso',
      'Burundi',
      'Cambodia',
      'Cameroon',
      'Canada',
      'Cape Verde',
      'Cayman Islands',
      'Central African Republic',
      'Chad',
      'Chile',
      'China',
      'Christmas Island',
      'Cocos (Keeling) Islands',
      'Colombia',
      'Comoros',
      'Congo',
      'Congo, The Democratic Republic of The',
      'Cook Islands',
      'Costa Rica',
      'Cote D\',ivoire',
      'Croatia',
      'Cuba',
      'Cyprus',
      'Czech Republic',
      'Denmark',
      'Djibouti',
      'Dominica',
      'Dominican Republic',
      'Ecuador',
      'Egypt',
      'El Salvador',
      'Equatorial Guinea',
      'Eritrea',
      'Estonia',
      'Ethiopia',
      'Falkland Islands (Malvinas)',
      'Faroe Islands',
      'Fiji',
      'Finland',
      'France',
      'French Guiana',
      'French Polynesia',
      'French Southern Territories',
      'Gabon',
      'Gambia',
      'Georgia',
      'Germany',
      'Ghana',
      'Gibraltar',
      'Greece',
      'Greenland',
      'Grenada',
      'Guadeloupe',
      'Guam',
      'Guatemala',
      'Guernsey',
      'Guinea',
      'Guinea-bissau',
      'Guyana',
      'Haiti',
      'Heard Island and Mcdonald Islands',
      'Holy See (Vatican City State)',
      'Honduras',
      'Hong Kong',
      'Hungary',
      'Iceland',
      'India',
      'Indonesia',
      'Iran, Islamic Republic of',
      'Iraq',
      'Ireland',
      'Isle of Man',
      'Israel',
      'Italy',
      'Jamaica',
      'Japan',
      'Jersey',
      'Jordan',
      'Kazakhstan',
      'Kenya',
      'Kiribati',
      'Korea, Democratic People\',s Republic of',
      'Korea, Republic of',
      'Kuwait',
      'Kyrgyzstan',
      'Lao People\',s Democratic Republic',
      'Latvia',
      'Lebanon',
      'Lesotho',
      'Liberia',
      'Libyan Arab Jamahiriya',
      'Liechtenstein',
      'Lithuania',
      'Luxembourg',
      'Macao',
      'Macedonia, The Former Yugoslav Republic of',
      'Madagascar',
      'Malawi',
      'Malaysia',
      'Maldives',
      'Mali',
      'Malta',
      'Marshall Islands',
      'Martinique',
      'Mauritania',
      'Mauritius',
      'Mayotte',
      'Mexico',
      'Micronesia, Federated States of',
      'Moldova, Republic of',
      'Monaco',
      'Mongolia',
      'Montenegro',
      'Montserrat',
      'Morocco',
      'Mozambique',
      'Myanmar',
      'Namibia',
      'Nauru',
      'Nepal',
      'Netherlands',
      'Netherlands Antilles',
      'New Caledonia',
      'New Zealand',
      'Nicaragua',
      'Niger',
      'Nigeria',
      'Niue',
      'Norfolk Island',
      'Northern Mariana Islands',
      'Norway',
      'Oman',
      'Pakistan',
      'Palau',
      'Palestinian Territory, Occupied',
      'Panama',
      'Papua New Guinea',
      'Paraguay',
      'Peru',
      'Philippines',
      'Pitcairn',
      'Poland',
      'Portugal',
      'Puerto Rico',
      'Qatar',
      'Reunion',
      'Romania',
      'Russian Federation',
      'Rwanda',
      'Saint Helena',
      'Saint Kitts and Nevis',
      'Saint Lucia',
      'Saint Pierre and Miquelon',
      'Saint Vincent and The Grenadines',
      'Samoa',
      'San Marino',
      'Sao Tome and Principe',
      'Saudi Arabia',
      'Senegal',
      'Serbia',
      'Seychelles',
      'Sierra Leone',
      'Singapore',
      'Slovakia',
      'Slovenia',
      'Solomon Islands',
      'Somalia',
      'South Africa',
      'South Georgia and The South Sandwich Islands',
      'Spain',
      'Sri Lanka',
      'Sudan',
      'Suriname',
      'Svalbard and Jan Mayen',
      'Swaziland',
      'Sweden',
      'Switzerland',
      'Syrian Arab Republic',
      'Taiwan, Province of China',
      'Tajikistan',
      'Tanzania, United Republic of',
      'Thailand',
      'Timor-leste',
      'Togo',
      'Tokelau',
      'Tonga',
      'Trinidad and Tobago',
      'Tunisia',
      'Turkey',
      'Turkmenistan',
      'Turks and Caicos Islands',
      'Tuvalu',
      'Uganda',
      'Ukraine',
      'United Arab Emirates',
      'United Kingdom',
      'United States',
      'United States Minor Outlying Islands',
      'Uruguay',
      'Uzbekistan',
      'Vanuatu',
      'Venezuela',
      'Viet Nam',
      'Virgin Islands, British',
      'Virgin Islands, U.S.',
      'Wallis and Futuna',
      'Western Sahara',
      'Yemen',
      'Zambia',
      'Zimbabwe',
    ]

    $scope.disputeSecondsOptions.forEach(function(disputeSecondsOption) {
      disputeSecondsOption.label = $filter('disputeSeconds')(disputeSecondsOption.value)
    })

    if (store) {
      $scope.isEditing = true
      $scope.alias = store.alias
      $scope.name = store.meta.name
      $scope.currency = store.meta.currency
      $scope.percentAffiliateRaw = store.affiliatePercentage
      $scope.products = store.meta.products
      $scope.disputeSeconds = store.meta.disputeSeconds
      $scope.info = store.meta.info
      $scope.isOpen = store.meta.isOpen
      $scope.transports = store.meta.transports || []
      $scope.minTotal = store.meta.minTotal

      if (store.meta.submarketAddrs) {
        store.meta.submarketAddrs.forEach(function(submarketAddr) {
          $scope.submarkets.push({alias: utils.getAlias(submarketAddr)})
        })
      }

    }else {
      $scope.currency = user.data.currency
      $scope.percentAffiliateRaw = '.5'
      $scope.products = []
      $scope.disputeSeconds = '1209600'
      $scope.isOpen = true
      $scope.transports = []
      $scope.minTotal = '0'
    }

    var multipler = Math.pow(10,10)
    $scope.$watch('percentAffiliateRaw',function(percentAffiliateRaw){
      $scope.percentAffiliate = new BigNumber(parseInt(percentAffiliateRaw*multipler)).div(multipler)
      $scope.percentStoreOwner = $scope.percentAffiliate.minus(1).times(-1)
    })

    $scope.cancel = function(){
      $modalInstance.dismiss('cancel')
    }

    function addProduct(){
      $scope.products.push({
        id:BigNumber.random().times('100000000').round().toString()
      })
    }
    $scope.addProduct = addProduct

    function addTransport() {
      $scope.transports.push({
        id:BigNumber.random().times('100000000').round().toString(),
        shipsFrom:'Worldwide',
        shipsTo:'Worldwide'
      })
    }
    $scope.addTransport = addTransport

    $scope.submit = function() {
      var alias = $scope.alias.trim().replace(/(\r\n|\n|\r)/gm,''),
      affiliatePercentage = parseFloat($scope.percentAffiliateRaw),
      meta = {
        name: $scope.name,
        currency: $scope.currency,
        affiliatePercentage: $scope.percentAffiliateRaw,
        products: $scope.products,
        disputeSeconds: $scope.disputeSeconds,
        isOpen: !!$scope.isOpen,
        info: $scope.info,
        submarketAddrs: [],
        transports: $scope.transports,
        minTotal: $scope.minTotal,
      }

      $scope.submarkets.forEach(function(submarket){
        meta.submarketAddrs.push(AliasReg.getAddr(submarket.alias))
      })


      try {
        Store.check(alias,affiliatePercentage,meta)
      }catch(e) {
        growl.addErrorMessage(e)
        console.error(e)
        return
      }

      if(store) {

        store
        .setMeta(meta)
        .then(function(store){
          $modalInstance.close(store)
        },function(error){
          $scope.error = error
        }).catch(function(error){
          console.error(error)
        })
      }else {

        if(!utils.isAliasAvailable(alias)) {
          return growl.addErrorMessage('@'+alias+' is already taken')
        }

        Store.create($scope.alias,affiliatePercentage,meta)
        .then(function(store){
          user.data.storeAddrs.push(store.addr)
          user.save()
          $modalInstance.close()
        },function(error){
          $scope.error = error
        }).catch(function(error){
          console.error(error)
        })

      }



    }
  })

})();