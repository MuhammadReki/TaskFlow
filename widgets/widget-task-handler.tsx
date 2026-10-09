import { TaskWidget } from "./TaskWidget";

export const widgetTaskHandler = async ({
  widgetInfo,
  widgetAction,
  renderWidget,
  props,
}: any) => {
  // Data tugas — buat sementara pake dummy
  // Nanti bisa sync dari AsyncStorage / Supabase
  const tasks = [
    {
      id: "1",
      title: "Belajar React Native",
      completed: false,
      priority: "Tinggi",
    },
    { id: "2", title: "Meeting jam 3", completed: false, priority: "Sedang" },
    { id: "3", title: "Belanja bulanan", completed: false, priority: "Rendah" },
  ];

  switch (widgetAction) {
    case "WIDGET_ADDED":
    case "WIDGET_UPDATE":
    case "WIDGET_RESIZED":
      renderWidget(<TaskWidget tasks={tasks} />);
      break;

    case "WIDGET_DELETED":
      break;

    case "WIDGET_CLICK":
      break;

    default:
      renderWidget(<TaskWidget tasks={tasks} />);
      break;
  }
};
