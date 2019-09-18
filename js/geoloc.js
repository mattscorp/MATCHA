 console.log('<%= info.geo_consent %>');
 if('<%= info.geo_consent %>' == 'Oui')
        {
            var options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
            };

            function success(pos) {
              var crd = pos.coords;
              $.post('geo_nav', crd, function(crd) {
                    });
            }

            function error(err) {
              console.warn(`ERREUR (${err.code}): ${err.message}`);
            }

            navigator.geolocation.getCurrentPosition(success, error, options);
        }
        setInterval('load_geo()', 3000);
            function load_geo() {
                $.getJSON('http://www.geoplugin.net/json.gp?jsoncallback=?', function(data) {
                    $.post('geo', data, function(data) {
                    });
                });
            }
       