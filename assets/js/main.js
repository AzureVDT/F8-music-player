/*
 * 1. Render songs (done)
 * 2. Scroll top (done)
 * 3. Play / pause / seek (done)
 * 4. CD rotate (done)
 * 5. Next / prev (done)
 * 6. Random (done)
 * 7. Next / Repeat when ended (done)
 * 8. Active song
 * 9. Scroll active song into view
 * 10. Play song when click
 */
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "F8_PLAYER";

const player = $(".player");
const cd = $(".cd");
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const playBtn = $(".btn-toggle-play");
const progress = $("#progress");
const nextBtn = $(".btn-next");
const prevBtn = $(".btn-prev");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const playlist = $(".playlist");

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: "Ánh sao và bầu trời",
            singer: "T.R.I",
            path: "./assets/music/song1.mp3",
            image: "./assets/image/anh1.jpg",
        },
        {
            name: "Chiisana koi no uta",
            singer: "Koda Kumi",
            path: "./assets/music/song2.mp3",
            image: "./assets/image/anh2.jpg",
        },
        {
            name: "Cô gái này là của ai",
            singer: "Đoàn Quốc Vinh, Nhi Nhi",
            path: "./assets/music/song3.mp3",
            image: "./assets/image/anh3.jfif",
        },
        {
            name: "Yêu một người có ước mơ",
            singer: "Bùi Trường Linh",
            path: "./assets/music/song4.mp3",
            image: "./assets/image/anh4.jpg",
        },
        {
            name: "Đường tôi chở em về",
            singer: "Bùi Trường Linh",
            path: "./assets/music/song5.mp3",
            image: "./assets/image/anh5.jpg",
        },
        {
            name: "Hana no uta",
            singer: "Hanatan",
            path: "./assets/music/song6.mp3",
            image: "./assets/image/anh6.jpg",
        },
        {
            name: "Uchiage Hanabi",
            singer: "Daoko",
            path: "./assets/music/song7.mp3",
            image: "./assets/image/anh7.jpg",
        },
        {
            name: "Yume to hazakura",
            singer: "Hatsune Miku",
            path: "./assets/music/song8.mp3",
            image: "./assets/image/anh8.jpg",
        },
        {
            name: "Lemon",
            singer: "Kobasolo",
            path: "./assets/music/song9.mp3",
            image: "./assets/image/anh9.jpeg",
        },
        {
            name: "Như anh đã thấy em",
            singer: "Phúc XP",
            path: "./assets/music/song10.mp3",
            image: "./assets/image/anh10.jpg",
        },
    ],
    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${
                index === this.currentIndex ? "active" : ""
            }" data-index="${index}">
                <div
                    class="thumb"
                    style="
                        background-image: url('${song.image}');
                    "
                ></div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>`;
        });
        $(".playlist").innerHTML = htmls.join("\n");
    },
    defineProperties: function () {
        Object.defineProperty(this, "currentSong", {
            get: function () {
                return this.songs[this.currentIndex];
            },
        });
    },
    handleEvents: function () {
        const _this = this;
        const cdWidth = cd.offsetWidth;

        // Xử lý CD quay / dừng
        const cdThumbAnimate = cdThumb.animate(
            [{ transform: "rotate(360deg)" }],
            {
                duration: 10000, // 10second
                iterations: Infinity,
            }
        );
        cdThumbAnimate.pause();
        // Xử lý zoom in / zoom out CD
        document.onscroll = function () {
            const scrollTop =
                window.scrollY || document.documentElement.scrollTop; // lấy ra tọa độ của trục Y khi scroll
            // tính năng khi scroll phần cd sẽ nhỏ dần:
            // khi scroll thì width của cd sẽ được thay đổi thành
            // width mới và có giá trị bằng width cũ trừ đi tọa độ
            // theo trục Y khi scroll và kết quả là khi ta scroll
            // thì kích thước của cd sẽ thay đổi theo
            const newCdWidth = cdWidth - scrollTop;
            // Xét kích thước cho cd và khi newCdWidth < 0 thì sẽ xét bằng 0
            // điều này giải quyết cho việc khi scroll quá nhanh thì tọa độ
            // của Y có thể mang giá trị âm điều đó dẫn đến khi scroll quá
            // nhanh cd sẽ k mất hoàn toàn khi scroll xuống bên dưới.
            cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
            // Xét độ mờ khi scroll lên trên hoặc xuống dưới
            // độ mờ tỉ lệ thuận với newCdWidth
            cd.style.opacity = newCdWidth / cdWidth;
        };

        // Xử lý khi click play
        playBtn.onclick = function () {
            if (_this.isPlaying) audio.pause();
            else audio.play();
        };

        // Khi song được play
        audio.onplay = function () {
            _this.isPlaying = true;
            player.classList.add("playing");
            cdThumbAnimate.play();
        };
        // Khi song bị pause
        audio.onpause = function () {
            _this.isPlaying = false;
            player.classList.remove("playing");
            cdThumbAnimate.pause();
        };

        //Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const progressPercent = Math.floor(
                    (audio.currentTime / audio.duration) * 100
                );
                progress.value = progressPercent;
            }
        };
        // Xử lý khi tua song
        progress.onchange = function (e) {
            const seekTime = (e.target.value / 100) * audio.duration;
            audio.currentTime = seekTime;
        };

        // Xử lý khi click next song
        nextBtn.onclick = function () {
            if (_this.isRandom) _this.playRandomSong();
            else _this.nextSong();
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        };
        // Xử lý khi click prev song
        prevBtn.onclick = function () {
            if (_this.isRandom) _this.playRandomSong();
            else _this.prevSong();
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        };

        // Xử lý khi click random
        randomBtn.onclick = function () {
            _this.isRandom = !_this.isRandom;
            _this.setConfig("isRandom", _this.isRandom);
            randomBtn.classList.toggle("active", _this.isRandom);
        };

        // Xử lý repeat 1 song
        repeatBtn.onclick = function () {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig("isRepeat", _this.isRepeat);
            repeatBtn.classList.toggle("active", _this.isRepeat);
        };

        //Xử lý next song khi audio ended
        audio.onended = function () {
            if (_this.isRepeat) audio.play();
            else nextBtn.click();
        };

        // Lắng nghe hành vi click vào playlist
        playlist.onclick = function (e) {
            const songNode = e.target.closest(".song:not(.active)");
            // Xử lý khi click vào song
            if (songNode || e.target.closest(".option")) {
                // Xử lý khi click vào song
                if (e.target.closest(".song:not(.active)")) {
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    _this.render();
                    audio.play();
                }

                // Xử lý khi click vào option
            }
        };
    },
    scrollToActiveSong: function () {
        setTimeout(() => {
            $(".song.active").scrollIntoView({
                behavior: "smooth",
                block: "nearest",
            });
        }, 100);
    },
    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },
    loadConfig: function () {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },
    nextSong: function () {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) this.currentIndex = 0;
        this.loadCurrentSong();
    },
    prevSong: function () {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },
    playRandomSong: function () {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex);

        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    start: function () {
        // Gán cấu hình từ config vào app
        this.loadConfig();

        // Định nghĩa các thuộc tính cho object
        this.defineProperties();

        // Lắng nghe / xử lý các sự kiện
        this.handleEvents();

        // Tải thông tin bài hát đầu tiền vào UI khi chạy App
        this.loadCurrentSong();

        // Render playlist
        this.render();

        // Hiển thị trạng thái ban đầu của repeatBtn and randomBtn
        randomBtn.classList.toggle("active", this.isRandom);
        repeatBtn.classList.toggle("active", this.isRepeat);
    },
};

app.start();
