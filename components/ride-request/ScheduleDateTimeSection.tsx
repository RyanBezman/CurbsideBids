import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";

function formatScheduleDatetime(value: Date): string {
  const date = value.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const time = value.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${date} • ${time}`;
}

type Props = {
  scheduleDate: Date;
  onScheduleDateChange: (value: Date) => void;
};

export function ScheduleDateTimeSection({ scheduleDate, onScheduleDateChange }: Props) {
  const [showPicker, setShowPicker] = useState(false);

  const handlePickerChange = (
    event: { type: string },
    selectedDate: Date | undefined,
  ) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
    }

    if (event.type === "set" && selectedDate) {
      onScheduleDateChange(selectedDate);
    }
  };

  return (
    <>
      <Text className="text-neutral-400 text-sm mb-2 ml-1">Date & time</Text>
      <TouchableOpacity
        onPress={() => setShowPicker((prev) => !prev)}
        className="bg-neutral-900 rounded-2xl px-5 py-4 flex-row items-center border border-neutral-800 mb-5"
      >
        <View className="w-3 h-3 rounded-full bg-amber-500 mr-4" />
        <Text className="text-white text-base flex-1">{formatScheduleDatetime(scheduleDate)}</Text>
        <Text className="text-violet-400">⌄</Text>
      </TouchableOpacity>

      {showPicker ? (
        <DateTimePicker
          value={scheduleDate}
          mode="datetime"
          minimumDate={(() => {
            const value = new Date();
            value.setSeconds(0, 0);
            return value;
          })()}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handlePickerChange}
          textColor="#9ca3af"
          themeVariant="dark"
        />
      ) : null}

      {Platform.OS === "ios" && showPicker ? (
        <View className="flex-row justify-end gap-3 mb-4">
          <TouchableOpacity
            onPress={() => setShowPicker(false)}
            className="bg-neutral-800 rounded-xl px-4 py-2"
          >
            <Text className="text-neutral-300">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowPicker(false)}
            className="bg-violet-600 rounded-xl px-4 py-2"
          >
            <Text className="text-white font-semibold">Done</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </>
  );
}
