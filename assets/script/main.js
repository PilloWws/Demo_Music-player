const $ = document.querySelector.bind(document);
const $$ = document.querySelector.bind(document);

const PLAYER_STORAGE_KEY = 'KEY';

const cd = $('.cd');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const player = $('.player');
const progress = $('#progress');
const repeat = $('.btn-repeat');
const prev = $('.btn-prev');
const next = $('.btn-next');
const randomBtn = $('.btn-random');
const audioPlaylist = $('.playlist');

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    songs: [
        {
            name: 'Bài Ca Tình Yêu',
            singer: 'Đinh Mạnh Ninh',
            path: "./assets/musics/Bai Ca Tinh Yeu - Dinh Manh Ninh.mp3",
            image: "./assets/img/imgMusic.jpg"
        },
        {
            name: 'Phút Yêu Đầu',
            singer: 'Thu Minh',
            path: "./assets/musics/Phut Yeu Dau - Thu Minh.mp3",
            image: "./assets/img/imgMusic.jpg"
        },
        {
            name: 'Boom Shakalaka',
            singer: 'Vũ Phụng Tiên',
            path: "./assets/musics/Nevada x Boom Shakalaka - YTB VNK.mp3",
            image: "./assets/img/imgMusic.jpg"
        }
        , {
            name: 'Một Nhà',
            singer: 'Da LAB',
            path: "./assets/musics/Mot Nha - Da LAB.mp3",
            image: "./assets/img/imgMusic.jpg"
        },
        {
            name: 'Có Em Chờ',
            singer: 'Min',
            path: "./assets/musics/CoEmCho-MINMrA-4928094.mp3",
            image: "./assets/img/imgMusic.jpg"
        },
        {
            name: 'Hẹn Yêu',
            singer: 'Vũ Cát Tường',
            path: "./assets/musics/Hẹn Yêu - Vũ Cát Tường.mp3",
            image: "./assets/img/imgMusic.jpg"
        },
        {
            name: 'Nơi Này Có Anh',
            singer: 'Sơn Tùng M-TP',
            path: "./assets/musics/Noi Nay Co Anh - Son Tung M-TP.mp3",
            image: "./assets/img/imgMusic.jpg"
        },
        {
            name: 'Yêu Không Nghỉ Phép',
            singer: 'ISAAC, Only C',
            path: "./assets/musics/Yeu Khong Nghi Phep - Isaac.mp3",
            image: "./assets/img/imgMusic.jpg"
        },
        {
            name: 'Tớ Thích Cậu',
            singer: 'Han Sara',
            path: "/assets/musics/To Thich Cau - Han Sara.mp3",
            image: "/assets/img/imgMusic.jpg"
        }
    ],
    loadCurrentSong: function () {

        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url(${this.currentSong.image})`;
        audio.src = this.currentSong.path;
    },
    loadConfig: function () {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    }
    ,
    start: function () {
        // Load config
        this.loadConfig();
        // Định nghĩa các thuộc tính
        this.defineProperties();
        // Lắng nghe/ xử lí các sự kiện
        this.handleEvents();
        // Tải thông tin bài hát vào UI
        this.loadCurrentSong();
        // Render Playlist
        this.render();

        randomBtn.classList.toggle('active', this.isRandom);
        repeat.classList.toggle('active', this.isRepeat);
    },
    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex];
            }
        })
    }
    ,
    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index = "${index}">
             <div class="thumb" style="background-image: url('${song.image}')">
            </div>
            <div class="body">
              <h3 class="title">${song.name}</h3>
              <p class="author">${song.singer}</p>
            </div>
            <div class="option">
              <i class="fas fa-ellipsis-h"></i>
            </div>
             </div>
         `
        })
        audioPlaylist.innerHTML = htmls.join('');
    },
    handleEvents: function () {
        const _this = this;
        const cdWidth = cd.offsetWidth;
        // xử lí cd quay / dừng
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg' }
        ], {
            duration: 10000,
            iterations: Infinity
        })
        cdThumbAnimate.pause();
        // xử lí phóng to/ thu nhỏ CD
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        }
        // xử lí khi click play
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                _this.isPlaying = false;
                audio.pause();
            } else {
                _this.isPlaying = true;
                audio.play();
            }
        }
        // khi song được play
        audio.onplay = function () {
            player.classList.add('playing');
            cdThumbAnimate.play();
        }
        audio.onpause = function () {
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }

        // khi tiến độ thay đổi
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const progessPercent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progessPercent;
            }
        }
        // xử lí khi tua song
        progress.onchange = function (e) {
            const seekTime = e.target.value * audio.duration / 100;
            audio.currentTime = seekTime;
        }
        // khi prev song
        prev.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }
        // khi next song
        next.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.nextSong();
            }
            audio.play()
            _this.render();
            _this.scrollToActiveSong();
        }

        // khi random
        randomBtn.onclick = function (e) {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            randomBtn.classList.toggle('active', _this.isRandom);
        }

        // Xử lí next song khi audio ended
        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play();
            } else {
                next.click();
            }
        }

        // xử lí repeat một song
        repeat.onclick = function (e) {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            repeat.classList.toggle('active', _this.isRepeat);
        }

        // lắng nghe hành vi click vào playlist
        audioPlaylist.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)');
            if (songNode || e.target.closest('.option')) {
                // get được ra index của bài đó
                if (songNode) {
                    console.log(songNode.dataset.index);
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    _this.render();
                    audio.play();
                }
            }
        }
    },
    nextSong: function () {
        this.currentIndex++;
        if (this.currentIndex > this.songs.length - 1) {
            this.currentIndex = 0;
        }
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
            newIndex = Math.floor(Math.random() * (this.songs.length - 1))
        } while (this.currentIndex === newIndex);

        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    scrollToActiveSong: function () {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behaviour: 'smooth',
                block: 'center'
            });
        }, 300)
    }
}
app.start();