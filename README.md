# Landmarks App

Bu uygulama, kullanıcıların harita üzerinde önemli yerleri (landmarks) işaretlemesine, notlar eklemesine, ziyaret geçmişini takip etmesine ve ziyaret planları oluşturmasına olanak tanıyan bir web uygulamasıdır.

## Özellikler

- Harita üzerinde işaretçi ekleme
- İşaretçilere isim, kategori, açıklama ve not ekleme
- İşaretçileri düzenleme ve silme
- Belirli işaretçilere özel notlar ekleme
- Ziyaret edilen işaretçileri kaydetme ve görüntüleme
- Çoklu işaretçiler için ziyaret planı oluşturma

## Teknolojiler

- **Frontend**: HTML, CSS, JavaScript, Leaflet.js (Harita)
- **Backend**: Node.js, Express.js
- **Veritabanı**: Notion API
- **Deployment**: Vercel

## Kurulum

### Notion API Kurulumu

1. [Notion Developers](https://developers.notion.com/) sayfasına gidin
2. "Create new integration" seçeneği ile yeni bir entegrasyon oluşturun
3. API anahtarınızı kopyalayın (Secret key)
4. Notion'da iki veritabanı oluşturun:
   - **Landmarks** veritabanı şu sütunlara sahip olmalı:
     - Name (title)
     - Latitude (number)
     - Longitude (number)
     - Description (text)
     - Category (select: historical, natural, cultural, other)
     - Notes (text)
     - ID (text)
   - **Visited** veritabanı şu sütunlara sahip olmalı:
     - Visitor Name (title)
     - Landmark ID (text)
     - Notes (text)
     - Visited Date (date)
     - ID (text)
5. Veritabanlarınızı entegrasyon ile paylaşın (veritabanı sayfalarında "Share" düğmesine tıklayın ve entegrasyonu seçin)
6. Veritabanı ID'lerini URL'den alın

### Lokal Geliştirme

1. Repo'yu klonlayın:
```
git clone https://github.com/kullaniciadi/LandmarksApp.git
cd LandmarksApp
```

2. `.env` dosyası oluşturun:
```
PORT=3000
NOTION_API_KEY=your_notion_api_key
LANDMARKS_DATABASE_ID=your_landmarks_database_id
VISITED_DATABASE_ID=your_visited_database_id
```

3. Bağımlılıkları yükleyin:
```
cd backend
npm install
```

4. Uygulamayı başlatın:
```
npm start
```

5. Tarayıcıda açın: `http://localhost:3000`

## Vercel ile Deployment

1. GitHub'a projeyi push edin
2. [Vercel](https://vercel.com) hesabı oluşturun
3. GitHub reponuzu Vercel'a bağlayın
4. Environment Variables bölümünde aşağıdaki değişkenleri ekleyin:
   - `NOTION_API_KEY`
   - `LANDMARKS_DATABASE_ID`
   - `VISITED_DATABASE_ID`
5. Deploy edin

## API Endpoints

### Landmarks API

- `GET /api/landmarks` - Tüm işaretçileri getir
- `GET /api/landmarks/:id` - Belirli bir işaretçiyi getir
- `POST /api/landmarks` - Yeni bir işaretçi ekle
- `PUT /api/landmarks/:id` - Bir işaretçiyi güncelle
- `DELETE /api/landmarks/:id` - Bir işaretçiyi sil

### Visited Landmarks API

- `GET /api/visited` - Tüm ziyaret edilen işaretçileri getir
- `GET /api/visited/:id` - Belirli bir işaretçinin ziyaret geçmişini getir
- `POST /api/visited` - Yeni bir ziyaret kaydı ekle
- `PUT /api/visited/:id` - Bir ziyaret kaydını güncelle
- `DELETE /api/visited/:id` - Bir ziyaret kaydını sil