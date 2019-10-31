(function () {
    /**
     *  lazyLoad method is responsible of lazy loading :Images, MathJax, Sketchfab 3D models
     * @param selector
     * @param parentElement parent element to be used as a base element for selector
     * @param ioptions  IntersectionObserver options in JS object form i.e: {root: null, rootMargin: "10%", threshold: 0.3 }
     * @param datasetAttr dataset attribute name i.e: data-src -> src ,  data-formula-source -> formulaSource
     * @param callback in case callback is function and passed  - to support older implementation
     */
    window.lazyLoad = function (selector, parentElement, ioptions, datasetAttr, callback) {
      ioptions = ioptions || {
        root: null,
        //  Defaults to the browser viewport
        rootMargin: "10%",
        //Margin around the root.
        threshold: 0.3 // what percentage of the target's visibility the observer's callback should be executed

      };
      var datasetItem;

      if (!datasetAttr) {
        var regex = /data-(\w+[\-\w+]*)/g;
        var found = selector.match(regex)[0];
        datasetItem = found.substring(found.indexOf("data-") + 5) // dataset attribute without keyword "data-"
        .replace(/(-\S)*/g, function (t) {
          // Capitalize dataset attribute 2nd ,3rd .. word  e.g: [data-formula-source] ->formula-Source
          return t.toUpperCase();
        }).replace(/\-*/g, function (t) {
          // get rid of dashes "-"  e.g: formula-Source -> formulaSource    to match dataset key that has the data
          return t.replace("-", "");
        });
      } else {
        datasetItem = datasetAttr;
      }

      var baseElement;

      if (!parentElement) {
        baseElement = document;
      } else if (typeof parentElement == "object") {
        baseElement = parentElement;
      } else {
        baseElement = document.querySelector(parentElement);
      }

      var lazyImages = [].slice.call(baseElement.querySelectorAll(selector)); // If browser supports IntersectionObserver, use it .

      if ("IntersectionObserver" in window) {
        var lazyImageObserver = new IntersectionObserver(function (entries, observer) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              var lazyImage = entry.target;
              observer.unobserve(lazyImage);
              lazyLoadLogic(lazyImage, datasetItem);
            }
          });
        }, ioptions);
        lazyImages.forEach(function (lazyImage) {
          lazyImageObserver.observe(lazyImage);
        });
      } else {
        // if IntersectionObserver is not supported , use the most compatible way
        var active = false;

        var lazyLoad = function () {
          if (active === false) {
            active = true;
            setTimeout(function () {
              lazyImages.forEach(function (lazyImage) {
                if (lazyImage.getBoundingClientRect().top <= window.innerHeight + window.innerHeight * parseInt(ioptions["rootMargin"]) / 100 && lazyImage.getBoundingClientRect().bottom >= 0 && getComputedStyle(lazyImage).display !== "none") {
                  lazyLoadLogic(lazyImage, datasetItem);
                  lazyImages = lazyImages.filter(function (image) {
                    return image !== lazyImage;
                  });

                  if (lazyImages.length === 0) {
                    document.removeEventListener("scroll", lazyLoad);
                    window.removeEventListener("resize", lazyLoad);
                    window.removeEventListener("orientationchange", lazyLoad);
                  }
                }
              });
              active = false;
            }, 200);
          }
        };

        document.addEventListener("scroll", lazyLoad);
        window.addEventListener("resize", lazyLoad);
        window.addEventListener("orientationchange", lazyLoad);
      }
    }; // JS equivalent for Jquery closest


    function closestElement(el, sel) {
      // Polyfill for "matches"  to support most browsers.
      if (!Element.prototype.matches) {
        Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
      }

      if (!Element.prototype.closest) {
        Element.prototype.closest = function (s) {
          var el = this;

          do {
            if (el.matches(s)) return el;
            el = el.parentElement || el.parentNode;
          } while (el !== null && el.nodeType === 1);

          return null;
        };
      }

      if (el != null) return el.closest(sel);
    } // GUID generator, is a random global unique identifier which It is a 128-bit integer number used to identify
    // resources.


    function guidGenerator() {
      /**
       * @return {string}
       */
      var S4 = function () {
        return ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
      };

      return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
    } // where src attribute gets replaced with one of dataset attributes


    function lazyLoadLogic(lazyImage, dataAttrbiute) {
      var data = parseJson(lazyImage.dataset[dataAttrbiute]);

      switch (data.type) {
        case "image":
          if (data.src.length > 0) {
            lazyImage.src = data.src;
            lazyImage.removeAttribute("data-" + dataAttrbiute);
          }

          break;

        case "mathjax":
          // finding MathMML area.
          var sel = data.selector || '.NLM_disp-formula';
          var closest = closestElement(lazyImage, sel); // caching it in DOM

          if (closest.id === "") {
            // Mathjax requires an HTML element ID to specify the area of MathMML, WE will generate a random guid for each obtained MathMML area.
            var id = guidGenerator();
            closest.setAttribute('id', id);
          } // before initiating Formula, We need to remove the current element which this element generate an
          // extra/unnecessary white spaces in formula display.
          // Polyfill for IE support


          if (!('remove' in Element.prototype)) {
            Element.prototype.remove = function () {
              if (this.parentNode) {
                this.parentNode.removeChild(this);
              }
            };
          }

          lazyImage.remove(); // Initiate it in Mathjax

          MathJax.Hub.Queue(["Typeset", MathJax.Hub, closest.id]); // Do you need to do something after loading Math formula? Yes, define a function.

          if (typeof callback === 'function') callback.call(this);
          break;

        case "sketchfab":
          var url = lazyImage.dataset["url"];
          var image = lazyImage.querySelector('a.thumbnail');
          var request = new XMLHttpRequest();
          lazyImage.removeAttribute("data-url");
          request.open("GET", url, true);

          request.onload = function () {
            if (request.status != 200) return;
            responseAsJson = JSON.parse(request.responseText);
            replaceImageWith3DIframe(responseAsJson.html, image, lazyImage);
          };

          request.send();
          break;

        case "backgroundImage":
          var url = "url('" + data.src + "')";
          lazyImage.style.backgroundImage = url;
          break;

        case "addClass":
          lazyImage.classList.add(data.className);
          break;

        default:
      }
    }

    function insertAfterNode(newNode, referenceNode) {
      if (referenceNode.parentNode.getElementsByClassName("sketchfab-embed-wrapper").length === 0) referenceNode.insertAdjacentHTML('afterend', newNode);
    }

    function replaceImageWith3DIframe(data, image, current) {
      if (data) {
        var figureDownloadOption = current.querySelector(".figureDownloadOptions");
        figureDownloadOption.style.display = "none";
        image.style.display = "none";
        insertAfterNode(data, current.querySelector(".figureInfo"));
        var iframe = current.querySelector('iframe');
        var width = iframe.offsetWidth;
        iframe.style.height = width * 9 / 16;
      }
    }

    function parseJson(str) {
      var jsonObject;

      try {
        jsonObject = JSON.parse(str);
      } catch (e) {
        jsonObject = JSON.parse("{\"type\":\"image\" , \"src\":\"" + str + "\"}");
      }

      return jsonObject;
    }

    document.addEventListener('DOMContentLoaded', function () {
      lazyLoad('[data-src]');
    }, false);

}());

//# sourceMappingURL=build.lazyload.bundle.js.map
