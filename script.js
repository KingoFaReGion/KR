document.addEventListener('DOMContentLoaded', () => {
    const membersContainer = document.getElementById('members-container');
    const profilePopup = document.getElementById('profile-popup');
    const culturePopup = document.getElementById('culture-popup');
    const profileDetails = document.getElementById('profile-details');
    
    // Nút đóng pop-up
    document.getElementById('close-profile').addEventListener('click', () => closePopup(profilePopup));
    document.getElementById('close-culture').addEventListener('click', () => closePopup(culturePopup));
    
    // Nút mở văn hoá nhóm
    document.getElementById('btn-culture').addEventListener('click', () => openPopup(culturePopup));


    // Click ra ngoài để đóng pop-up
    window.addEventListener('click', (e) => {
        if (e.target === profilePopup) closePopup(profilePopup);
        if (e.target === culturePopup) closePopup(culturePopup);
    });


    function openPopup(popup) {
        popup.classList.remove('hidden');
        // Thêm timeout nhỏ để trigger transition css
        setTimeout(() => popup.classList.add('active'), 10);
    }


    function closePopup(popup) {
        popup.classList.remove('active');
        setTimeout(() => popup.classList.add('hidden'), 400); // Đợi animation xong
    }


    // Hàm tô màu chữ sau mỗi dấu phẩy
    function colorizeText(text) {
        if (!text) return '';
        const parts = text.split(',');
        return parts.map((part, index) => {
            const colorClass = `text-color-${(index % 5) + 1}`;
            return `<span class="${colorClass}">${part.trim()}${index < parts.length - 1 ? ', ' : ''}</span>`;
        }).join('');
    }


    // Load dữ liệu thành viên từ thư mục members/
    async function loadMembers() {
        // Tạo mảng chứa tên file: leader, member1 -> member44
        const fileNames = ['leader'];
        for (let i = 1; i <= 44; i++) {
            fileNames.push(`member${i}`);
        }


        for (const fileName of fileNames) {
            try {
                const response = await fetch(`members/${fileName}.html`);
                if (response.ok) {
                    const htmlContent = await response.text();
                    
                    // Tạo một thẻ div bọc ngoài để lấy nội dung
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = htmlContent.trim();
                    const card = tempDiv.firstElementChild;
                    
                    if (card) {
                        membersContainer.appendChild(card);
                        
                        // Gán sự kiện click để mở Profile
                        card.addEventListener('click', () => {
                            // Lấy data từ các attribute data-* được cài sẵn trong thẻ
                            const data = card.dataset;
                            
                            profileDetails.innerHTML = `
                                <div class="profile-img-container">
                                    <a href="${data.zalo}" target="_blank">
                                        <img src="${data.pfimg}" alt="Trang cá nhân của ${data.name}">
                                    </a>
                                </div>
                                <h2 style="text-align: center; color: #fff; margin-bottom: 15px;">${data.name}</h2>
                                <p class="desc-text">${data.desc}</p>
                                
                                <h4 style="color: #94a3b8; margin-top: 10px;">Slogan:</h4>
                                <div class="marquee-container">
                                    <div class="marquee-text">${colorizeText(data.slogan)}</div>
                                </div>
                                
                                <h4 style="color: #94a3b8; margin-top: 10px;">Súng sở trường:</h4>
                                <div class="marquee-container" style="margin-bottom: 20px;">
                                    <div class="marquee-text">${colorizeText(data.guns)}</div>
                                </div>
                                
                                <a href="${data.storage}" target="_blank" class="btn-storage">Kho Lưu Trữ</a>
                            `;
                            openPopup(profilePopup);
                        });
                    }
                }
            } catch (error) {
                // Nếu không tìm thấy file, tự động bỏ qua (ẩn thành viên đó)
                continue;
            }
        }
    }


    // Khởi chạy load thành viên
    loadMembers();
});
