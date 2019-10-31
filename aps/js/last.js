(function () {
    $(document).ready(function () {
        UX.controller.init();
        if ( $('[data-toggle="nav"]').length) {
            UX.menu.init();
        }
        if ( $(".datepicker").length) {
            UX.datepicker.init();
        }
        if ( $('.w-slide__btn').length) {
            UX.slide.init();
        }
        if ($('[data-db-target-for]').length){
            UX.dropBlock.init();
        }
        if ($('[data-toggle="modal"]').length){
            UX.modal.init();
        }
        if ($('table').length){
            UX.toggleTable.init();
        }
        if ($('.facet').length){
            UX.toggle.init();
        }
        UX.facetDate.init();
        if ($('.accordion').length){
            UX.accordion.init();
        }

        if($('.facetDateChart').length){
           UX.facetDateChart.init();
        }

        if ($('.coolBar').length){
            UX.coolbar.init();
        }
        if ($('article').length) {
            UX.loader.init();
        }
        if($('.back-to-top').length){
            UX.backToTop.init();
        }
        
        if ($('.refineSearch').length || $('.advanced-search').length ) {
            UX.refine.init();
        }
        if ($('.advanced-search').length) {
            UX.searchFieldsCtrl.init();
        }
        if($(".table-fn").length || $('.ref.fn').length || $(".scroll-to-target").length){
            UX.scrollo.init();
        }
        if ($('figure').length) {
            UX.figureViewer.init();
        }
        if ($('.tab').length) {
            UX.tab.init();
        }
        if ($('.owl-carousel').length) {
            UX.slider.init();
        }
        if ($('.loi__banner').length){
            UX.loi.init();
        }
        if ($('.quick-search').length){
            UX.quickSearch.init();
        }
        UX.fieldsCtrl.init();
        if ( $('[data-toggle="transplant"]').length) {
            UX.transplant.init();
        }
        if ( $(".js__toggleAdForm").length) {
            UX.adplaceholder.init();
        }
        if ( $(".trusted-proxy-form").length) {
            UX.trustedPoxy.init();
        }
        UX.alerts.init();
        if ( $("#institutionList").length) {
            UX.profileMain.init();
        }
        UX.dropblockUl.init();
        UX.searchResult.init();
        if ( $(".favoriteShortlist").length) {
            UX.favorites.init();
        }
        if ( $(".expandable-list").length) {
            UX.list.init();
        }
        if ( $(".basic-metadata").length) {
            UX.basicMetadata.init();
        }
        if ( $(".supplemental-links").length) {
            UX.supplementalLinks.init();
        }
        if ( $(".funders").length) {
            UX.funders.init();
        }
        if ( $(".uploader").length) {
            UX.fileUploader.init();
        }
        if ($('.author-index').length){
            UX.authorIndex.init();
        }

        if ( $(".sortable-table").length) {
            UX.sortableTableRow.init();
        }

        if ( $(".submission-authors").length) {
            UX.submissionAuthors.init();
        }
        if ( $("#institutionUsageReport").length) {
            UX.reports.init();
        }

        if($('.cookiePolicy-popup').length){
            UX.cookiePolicyPopupWidget.init();
        }

        if ( $(".supplemental-files").length) {
            UX.supplementalFiles.init();
        }
        if ( $(".js-editable").length) {
            UX.editInPlace.init();
        }
        if ( $(".submission-list").length) {
            UX.submissionList.init();
        }
        if ( $(".pd-action-bar").length) {
            UX.pdActionBar.init();
        }
        if ( $(".js-counter").length) {
            UX.charCounter.init();
        }
        if ( $("#draftForm").length) {
            UX.draftForm.init();
        }
        if ( $(".pairing-management").length) {
            UX.pairingManagment.init();
        }
        if ( $(".device-pairing").length) {
            UX.devicePairing.init();
        }
        if ( $(".categories-widget").length) {
            UX.pdSearchCategories.init();
        }

        if($('.client-pagination').length){
            UX.clientPagination.init();
        }
        if($('.remote-access-email-domains').length){
            UX.remoteAccessEmail.init();
        }
        if ($('.js__removeAdmins').length){
            UX.administrators.init();
        }

        if($('.responsive-menu-nav').length){
            UX.reponsiveMenu.init();
        }

        if ($('.js__removeAdmins').length){
            UX.administrators.init();
        }

        if ($('.multi-search').length){
            UX.multiSearch.init();
        }

        if($('.sections-block').length){
            UX.sidebarSections.init();
        }

	    if($('.truncate-text').length || $('.truncate-list').length){
		    UX.genericTruncate.init();
	    }

        if($('.auto-hide-primary-bar').length){
            UX.autoHideBar.init();
        }

        UX.stickyElements.init();
        UX.pageBody.init();
        UX.tocJs.init();
        if ( $(".progress-bar").length) {
            UX.progressBar.init();
        }

	    if ($(".js--truncate").length) {
		    UX.truncater.init();
        }
        
        UX.showRecommended.init();

        UX.enquireIt.init(); // important: keep it always last
    });
})();
