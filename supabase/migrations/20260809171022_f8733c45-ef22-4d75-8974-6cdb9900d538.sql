-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  email text,
  district text,
  taluk text,
  village text,
  pin_code text,
  rating numeric(2,1) NOT NULL DEFAULT 5.0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_public_read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'phone', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- EQUIPMENT
CREATE TABLE public.equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL,
  name text NOT NULL,
  brand text,
  model text,
  manufacturing_year int,
  condition text NOT NULL DEFAULT 'GOOD',
  description text,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  state text NOT NULL DEFAULT 'Karnataka',
  district text NOT NULL DEFAULT '',
  taluk text,
  village text,
  pin_code text,
  price_per_hour numeric(10,2) NOT NULL DEFAULT 0,
  price_per_day numeric(10,2) NOT NULL DEFAULT 0,
  half_day_price numeric(10,2) NOT NULL DEFAULT 0,
  security_deposit numeric(10,2) NOT NULL DEFAULT 0,
  delivery_available boolean NOT NULL DEFAULT false,
  delivery_fee numeric(10,2) NOT NULL DEFAULT 0,
  operator_available boolean NOT NULL DEFAULT false,
  operator_fee numeric(10,2) NOT NULL DEFAULT 0,
  fuel_included boolean NOT NULL DEFAULT false,
  pickup_available boolean NOT NULL DEFAULT true,
  maintenance_included boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'ACTIVE',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT equipment_status_chk CHECK (status IN ('ACTIVE','PAUSED','ARCHIVED')),
  CONSTRAINT equipment_condition_chk CHECK (condition IN ('EXCELLENT','GOOD','AVERAGE','NEEDS_MAINTENANCE'))
);
CREATE INDEX equipment_owner_idx ON public.equipment(owner_id);
CREATE INDEX equipment_status_idx ON public.equipment(status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.equipment TO authenticated;
GRANT SELECT ON public.equipment TO anon;
GRANT ALL ON public.equipment TO service_role;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "equipment_public_read_active" ON public.equipment FOR SELECT USING (status <> 'ARCHIVED');
CREATE POLICY "equipment_owner_read" ON public.equipment FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "equipment_owner_insert" ON public.equipment FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "equipment_owner_update" ON public.equipment FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE TRIGGER equipment_updated_at BEFORE UPDATE ON public.equipment
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- EQUIPMENT IMAGES
CREATE TABLE public.equipment_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id uuid NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  url text NOT NULL,
  label text NOT NULL DEFAULT 'detail',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX equipment_images_eq_idx ON public.equipment_images(equipment_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.equipment_images TO authenticated;
GRANT SELECT ON public.equipment_images TO anon;
GRANT ALL ON public.equipment_images TO service_role;
ALTER TABLE public.equipment_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "equipment_images_public_read" ON public.equipment_images FOR SELECT USING (true);
CREATE POLICY "equipment_images_owner_write" ON public.equipment_images FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.equipment e WHERE e.id = equipment_id AND e.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.equipment e WHERE e.id = equipment_id AND e.owner_id = auth.uid()));

-- AVAILABILITY
CREATE TABLE public.equipment_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id uuid NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  status text NOT NULL DEFAULT 'AVAILABLE',
  booking_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT availability_status_chk CHECK (status IN ('AVAILABLE','BOOKED','PENDING','MAINTENANCE','OWNER_USE','UNAVAILABLE')),
  CONSTRAINT availability_time_chk CHECK (end_time > start_time)
);
CREATE INDEX availability_eq_date_idx ON public.equipment_availability(equipment_id, date);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.equipment_availability TO authenticated;
GRANT SELECT ON public.equipment_availability TO anon;
GRANT ALL ON public.equipment_availability TO service_role;
ALTER TABLE public.equipment_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "availability_public_read" ON public.equipment_availability FOR SELECT USING (true);
CREATE POLICY "availability_owner_write" ON public.equipment_availability FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.equipment e WHERE e.id = equipment_id AND e.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.equipment e WHERE e.id = equipment_id AND e.owner_id = auth.uid()));

-- BOOKINGS
CREATE TABLE public.equipment_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id uuid NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL,
  farmer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  duration_hours numeric(5,2) NOT NULL,
  hourly_rate numeric(10,2) NOT NULL DEFAULT 0,
  rental_amount numeric(10,2) NOT NULL DEFAULT 0,
  delivery_fee numeric(10,2) NOT NULL DEFAULT 0,
  operator_fee numeric(10,2) NOT NULL DEFAULT 0,
  security_deposit numeric(10,2) NOT NULL DEFAULT 0,
  total_amount numeric(10,2) NOT NULL DEFAULT 0,
  need_delivery boolean NOT NULL DEFAULT false,
  need_operator boolean NOT NULL DEFAULT false,
  notes text,
  status text NOT NULL DEFAULT 'PENDING',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT booking_status_chk CHECK (status IN ('PENDING','CONFIRMED','REJECTED','CANCELLED','ACTIVE','COMPLETED')),
  CONSTRAINT booking_time_chk CHECK (end_time > start_time)
);
CREATE INDEX bookings_eq_idx ON public.equipment_bookings(equipment_id, booking_date);
CREATE INDEX bookings_farmer_idx ON public.equipment_bookings(farmer_id);
CREATE INDEX bookings_owner_idx ON public.equipment_bookings(owner_id);
GRANT SELECT, INSERT, UPDATE ON public.equipment_bookings TO authenticated;
GRANT ALL ON public.equipment_bookings TO service_role;
ALTER TABLE public.equipment_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bookings_participants_read" ON public.equipment_bookings FOR SELECT TO authenticated
  USING (auth.uid() = farmer_id OR auth.uid() = owner_id);
CREATE POLICY "bookings_farmer_insert" ON public.equipment_bookings FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = farmer_id AND status = 'PENDING');
CREATE POLICY "bookings_participants_update" ON public.equipment_bookings FOR UPDATE TO authenticated
  USING (auth.uid() = farmer_id OR auth.uid() = owner_id)
  WITH CHECK (auth.uid() = farmer_id OR auth.uid() = owner_id);
CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON public.equipment_bookings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- REVIEWS
CREATE TABLE public.equipment_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.equipment_bookings(id) ON DELETE CASCADE,
  equipment_id uuid NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewer_role text NOT NULL DEFAULT 'FARMER',
  equipment_rating int,
  owner_rating int,
  service_rating int,
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (booking_id, reviewer_id),
  CONSTRAINT review_role_chk CHECK (reviewer_role IN ('FARMER','OWNER'))
);
GRANT SELECT, INSERT ON public.equipment_reviews TO authenticated;
GRANT SELECT ON public.equipment_reviews TO anon;
GRANT ALL ON public.equipment_reviews TO service_role;
ALTER TABLE public.equipment_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_public_read" ON public.equipment_reviews FOR SELECT USING (true);
CREATE POLICY "reviews_verified_insert" ON public.equipment_reviews FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = reviewer_id
    AND EXISTS (
      SELECT 1 FROM public.equipment_bookings b
      WHERE b.id = booking_id
        AND b.status = 'COMPLETED'
        AND (b.farmer_id = auth.uid() OR b.owner_id = auth.uid())
    )
  );

-- NOTIFICATIONS
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title_en text NOT NULL,
  title_kn text NOT NULL,
  body_en text NOT NULL DEFAULT '',
  body_kn text NOT NULL DEFAULT '',
  booking_id uuid,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX notifications_user_idx ON public.notifications(user_id, read);
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_own_read" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "notifications_own_update" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- BOOKING GUARD: owner_id integrity + overlap prevention
CREATE OR REPLACE FUNCTION public.booking_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  eq public.equipment%ROWTYPE;
  conflicts int;
BEGIN
  SELECT * INTO eq FROM public.equipment WHERE id = NEW.equipment_id;
  IF eq.id IS NULL THEN
    RAISE EXCEPTION 'Equipment not found';
  END IF;
  NEW.owner_id := eq.owner_id;

  IF TG_OP = 'INSERT' THEN
    IF eq.status <> 'ACTIVE' THEN
      RAISE EXCEPTION 'EQUIPMENT_UNAVAILABLE';
    END IF;
    IF eq.owner_id = NEW.farmer_id THEN
      RAISE EXCEPTION 'OWN_EQUIPMENT';
    END IF;
  END IF;

  IF (TG_OP = 'INSERT' AND NEW.status = 'PENDING')
     OR (TG_OP = 'UPDATE' AND NEW.status IN ('CONFIRMED','ACTIVE') AND OLD.status <> NEW.status) THEN
    SELECT count(*) INTO conflicts
    FROM public.equipment_bookings b
    WHERE b.equipment_id = NEW.equipment_id
      AND b.id <> NEW.id
      AND b.booking_date = NEW.booking_date
      AND b.status IN ('CONFIRMED','ACTIVE')
      AND b.start_time < NEW.end_time
      AND b.end_time > NEW.start_time;
    IF conflicts > 0 THEN
      RAISE EXCEPTION 'SLOT_UNAVAILABLE';
    END IF;

    SELECT count(*) INTO conflicts
    FROM public.equipment_availability a
    WHERE a.equipment_id = NEW.equipment_id
      AND a.date = NEW.booking_date
      AND a.status IN ('BOOKED','MAINTENANCE','OWNER_USE','UNAVAILABLE')
      AND a.start_time < NEW.end_time
      AND a.end_time > NEW.start_time;
    IF conflicts > 0 THEN
      RAISE EXCEPTION 'SLOT_UNAVAILABLE';
    END IF;
  END IF;

  RETURN NEW;
END; $$;

CREATE TRIGGER equipment_bookings_guard
BEFORE INSERT OR UPDATE ON public.equipment_bookings
FOR EACH ROW EXECUTE FUNCTION public.booking_guard();

-- Sync availability + notifications from booking events
CREATE OR REPLACE FUNCTION public.booking_sync()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  eq_name text;
BEGIN
  SELECT name INTO eq_name FROM public.equipment WHERE id = NEW.equipment_id;

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.notifications (user_id, type, title_en, title_kn, body_en, body_kn, booking_id)
    VALUES (NEW.owner_id, 'BOOKING_REQUEST', 'New rental request received',
            'ನಿಮ್ಮ ಯಂತ್ರೋಪಕರಣಕ್ಕೆ ಹೊಸ ಬಾಡಿಗೆ ವಿನಂತಿ ಬಂದಿದೆ.',
            eq_name, eq_name, NEW.id);
    RETURN NEW;
  END IF;

  IF NEW.status <> OLD.status THEN
    IF NEW.status IN ('CONFIRMED','ACTIVE') THEN
      DELETE FROM public.equipment_availability WHERE booking_id = NEW.id;
      INSERT INTO public.equipment_availability (equipment_id, date, start_time, end_time, status, booking_id)
      VALUES (NEW.equipment_id, NEW.booking_date, NEW.start_time, NEW.end_time, 'BOOKED', NEW.id);
      INSERT INTO public.notifications (user_id, type, title_en, title_kn, body_en, body_kn, booking_id)
      VALUES (NEW.farmer_id, 'BOOKING_CONFIRMED', 'Your rental request has been confirmed',
              'ನಿಮ್ಮ ಬಾಡಿಗೆ ವಿನಂತಿ ದೃಢೀಕರಿಸಲಾಗಿದೆ.', eq_name, eq_name, NEW.id);
    ELSIF NEW.status IN ('REJECTED','CANCELLED') THEN
      DELETE FROM public.equipment_availability WHERE booking_id = NEW.id;
      INSERT INTO public.notifications (user_id, type, title_en, title_kn, body_en, body_kn, booking_id)
      VALUES (CASE WHEN NEW.status = 'REJECTED' THEN NEW.farmer_id ELSE NEW.owner_id END,
              'BOOKING_' || NEW.status,
              CASE WHEN NEW.status = 'REJECTED' THEN 'Your rental request was rejected' ELSE 'A booking was cancelled' END,
              CASE WHEN NEW.status = 'REJECTED' THEN 'ನಿಮ್ಮ ಬಾಡಿಗೆ ವಿನಂತಿ ತಿರಸ್ಕರಿಸಲಾಗಿದೆ.' ELSE 'ಬುಕಿಂಗ್ ರದ್ದಾಗಿದೆ.' END,
              eq_name, eq_name, NEW.id);
    ELSIF NEW.status = 'COMPLETED' THEN
      INSERT INTO public.notifications (user_id, type, title_en, title_kn, body_en, body_kn, booking_id)
      VALUES (NEW.farmer_id, 'BOOKING_COMPLETED', 'Rental completed — please leave a review',
              'ಬಾಡಿಗೆ ಪೂರ್ಣಗೊಂಡಿದೆ — ದಯವಿಟ್ಟು ವಿಮರ್ಶೆ ನೀಡಿ.', eq_name, eq_name, NEW.id);
    END IF;
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER equipment_bookings_sync
AFTER INSERT OR UPDATE ON public.equipment_bookings
FOR EACH ROW EXECUTE FUNCTION public.booking_sync();

ALTER PUBLICATION supabase_realtime ADD TABLE public.equipment;
ALTER PUBLICATION supabase_realtime ADD TABLE public.equipment_bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.equipment_availability;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;