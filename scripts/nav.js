window.onload = function(){
    window.onscroll = function() {sticky()};

    let nav = document.getElementsByTagName("nav")[0];
    let navTop = nav.offsetTop;

    function sticky() {
        if (window.pageYOffset >= navTop) {
            nav.classList.add("sticky")
        } else {
            nav.classList.remove("sticky");
        }
    }
};
