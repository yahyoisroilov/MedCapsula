-- Seed data: Insert courses and lessons
-- Run this AFTER creating the tables via schema.sql

-- Create a test admin user first (password: admin123)
-- Go to Authentication > Users > Invite user or sign up manually

-- Then insert courses:
insert into courses (slug, title, subtitle, description, icon, level, category, instructor) values
  ('anatomiya', 'Anatomiya', 'Inson anatomiyasi asoslari', 'Inson tanasining tuzilishi, organlar sistemasi va ularning funksiyalari haqida to''liq ma''lumot.', 'fa-heart-pulse', 'beginner', 'asosiy', 'Prof. Aliyev B.');

insert into courses (slug, title, subtitle, description, icon, level, category, instructor) values
  ('fiziologiya', 'Fiziologiya', 'Organizm funksiyalari', 'Organizmda kechadigan fiziologik jarayonlar, organlar va sistemalarning funksional faoliyati haqida.', 'fa-brain', 'intermediate', 'asosiy', 'Prof. Karimova N.');

insert into courses (slug, title, subtitle, description, icon, level, category, instructor) values
  ('farmakologiya', 'Farmakologiya', 'Dorilar haqida fan', 'Dorilar va ularning organizmga ta''siri, farmakokinetika va farmakodinamika asoslari.', 'fa-capsules', 'advanced', 'klinik', 'Prof. Tursunov M.');

insert into courses (slug, title, subtitle, description, icon, level, category, instructor) values
  ('gistologiya', 'Gistologiya', 'To''qimalar haqida fan', 'Organizm to''qimalarining mikroskopik tuzilishini o''rganuvchi fan.', 'fa-microscope', 'beginner', 'asosiy', 'Prof. Aliyev B.');

insert into courses (slug, title, subtitle, description, icon, level, category, instructor) values
  ('patologiya', 'Patologiya', 'Kasalliklar mexanizmi', 'Kasalliklarning kelib chiqish mexanizmlari va patologik jarayonlar haqida.', 'fa-flask', 'intermediate', 'klinik', 'Prof. Karimova N.');

insert into courses (slug, title, subtitle, description, icon, level, category, instructor) values
  ('mikrobiologiya', 'Mikrobiologiya', 'Mikroorganizmlar haqida', 'Bakteriyalar, viruslar va boshqa mikroorganizmlarning tuzilishi va hayot faoliyati.', 'fa-virus', 'intermediate', 'asosiy', 'Prof. Tursunov M.');

-- Get course IDs
do $$
declare
  anat_id uuid;
  fiz_id uuid;
begin
  select id into anat_id from courses where slug = 'anatomiya';
  select id into fiz_id from courses where slug = 'fiziologiya';

  -- Anatomiya lessons
  insert into lessons (course_id, title, description, video_url, notes_content, quiz, duration, order_index) values
    (anat_id, 'Skelet sistemasi', 'Skelet haqida umumiy ma''lumot', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Skelet sistemasi inson tanasining asosiy tayanch sistemasidir. U 206 ta suyakdan iborat bo''lib, quyidagi vazifalarni bajaradi: tayanch, himoya, harakat va mineral moddalar almashinuvi.\n\nAsosiy bo''limlari: bosh skeleti, tana skeleti, qo''l va oyoq skeleti.', '[{"q":"Inson skeletida nechta suyak bor?","a":["150","180","206","250"],"correct":2},{"q":"Qaysi organ skeletni himoya qiladi?","a":["Yurak","Bosh miya","O''pka","Jigar"],"correct":1},{"q":"Skeletning qaysi vazifasi mineral moddalar bilan bog''liq?","a":["Tayanch","Himoya","Harakat","Mineral almashinuvi"],"correct":3}]', 25, 0);

  insert into lessons (course_id, title, description, video_url, notes_content, quiz, duration, order_index) values
    (anat_id, 'Mushak sistemasi', 'Mushaklar tuzilishi', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Mushak sistemasi: uch xil mushak mavjud - skelet (ko''ndalang-targ''il), silliq va yurak mushagi.\n\nSkelet mushaklari ixtiyoriy harakatlarni boshqaradi. Silliq mushaklar ichki organlarda joylashgan. Yurak mushagi faqat yurakda uchraydi.', '[{"q":"Necha xil mushak turi mavjud?","a":["1","2","3","4"],"correct":2},{"q":"Qaysi mushaklar ixtiyoriy harakat qiladi?","a":["Silliq","Skelet","Yurak","Hammasi"],"correct":1},{"q":"Yurak mushagi qayerda joylashgan?","a":["O''pkada","Jigarda","Yurakda","Miyda"],"correct":2}]', 20, 1);

  insert into lessons (course_id, title, description, video_url, notes_content, quiz, duration, order_index) values
    (anat_id, 'Nerv sistemasi', 'Nerv tizimi haqida', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Nerv sistemasi ikki asosiy qismga bo''linadi: markaziy (bosh miya va orqa miya) va periferik nerv sistemasi.\n\nNeyronlar nerv sistemasining asosiy hujayralari bo''lib, ular impuls uzatish vazifasini bajaradi.', '[{"q":"Markaziy nerv sistemasiga nimalar kiradi?","a":["Nervlar","Bosh va orqa miya","Gangliylar","Retseptorlar"],"correct":1}]', 30, 2);

  -- Fiziologiya lessons
  insert into lessons (course_id, title, description, video_url, notes_content, quiz, duration, order_index) values
    (fiz_id, 'Hujayra fiziologiyasi', 'Hujayra asoslari', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Hujayra - tirik organizmning eng kichik tuzilmaviy va funksional birligi. Hujayra membranasi, yadrosi, organellalari va sitoplazmasidan iborat.', '[{"q":"Hujayraning asosiy vazifasi?","a":["Energiya ishlab chiqarish","Modda almashinuvi","Bo''linish","Hammasi"],"correct":3}]', 35, 0);

  insert into lessons (course_id, title, description, video_url, notes_content, quiz, duration, order_index) values
    (fiz_id, 'Yurak-qon aylanish', 'Qon aylanish sistemasi', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Yurak-qon aylanish sistemasi yurak va qon tomirlaridan iborat. Katta va kichik qon aylanish doiralari mavjud.', '[]', 40, 1);
end $$;
