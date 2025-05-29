export interface Block {
  id: string;
  name: string;
}

export interface Room {
  id: string;
  block_id: string;
  name: string;
}

export interface Reservation {
  id: string;
  room_id: string;
  teacher_name: string;
  start_time: string;
  end_time: string;
  purpose: string;
}