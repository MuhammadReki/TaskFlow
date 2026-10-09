import { FlexWidget, TextWidget } from "react-native-android-widget";

type Props = {
  tasks: Array<{
    id: string;
    title: string;
    completed: boolean;
    priority: string;
  }>;
};

export function TaskWidget({ tasks }: Props) {
  const activeTasks = tasks.filter((t) => !t.completed).slice(0, 3);

  return (
    <FlexWidget
      style={{
        height: "match_parent",
        width: "match_parent",
        flexDirection: "column",
        justifyContent: "center",
        padding: 16,
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
      }}
      clickAction="OPEN_APP"
    >
      {/* Header */}
      <FlexWidget
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          width: "match_parent",
          marginBottom: 12,
        }}
      >
        <TextWidget
          text="TaskFlow"
          style={{
            fontSize: 16,
            fontWeight: "bold",
            color: "#1B6B3A",
          }}
        />
        <TextWidget
          text={`${activeTasks.length} tugas`}
          style={{
            fontSize: 12,
            color: "#6B7280",
          }}
        />
      </FlexWidget>

      {/* Task List */}
      {activeTasks.length === 0 ? (
        <TextWidget
          text="Belum ada tugas aktif"
          style={{
            fontSize: 13,
            color: "#9CA3AF",
          }}
        />
      ) : (
        activeTasks.map((task) => (
          <FlexWidget
            key={task.id}
            style={{
              flexDirection: "row",
              alignItems: "center",
              width: "match_parent",
              marginBottom: 6,
            }}
          >
            <FlexWidget
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor:
                  task.priority === "Tinggi"
                    ? "#D9534F"
                    : task.priority === "Sedang"
                      ? "#E8A83E"
                      : "#2E9E4F",
              }}
            />
            <TextWidget
              text={task.title}
              style={{
                fontSize: 13,
                color: "#1A1A1A",
                width: "match_parent",
                marginLeft: 8,
              }}
              maxLines={1}
            />
          </FlexWidget>
        ))
      )}
    </FlexWidget>
  );
}
