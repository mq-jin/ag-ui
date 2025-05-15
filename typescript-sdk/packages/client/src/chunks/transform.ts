import { mergeMap, Observable } from "rxjs";
import {
  BaseEvent,
  TextMessageChunkEvent,
  TextMessageContentEvent,
  TextMessageEndEvent,
  TextMessageStartEvent,
  ToolCallArgsEvent,
  ToolCallChunkEvent,
  ToolCallEndEvent,
  ToolCallStartEvent,
} from "@ag-ui/core";
import { EventType } from "@ag-ui/core";

interface TextMessageFields {
  messageId: string;
}

interface ToolCallFields {
  toolCallId: string;
  toolCallName: string;
  parentMessageId?: string;
}

export const convertChunks = (events$: Observable<BaseEvent>): Observable<BaseEvent> => {
  let textMessageFields: TextMessageFields | undefined;
  let toolCallFields: ToolCallFields | undefined;
  let mode: "text" | "tool" | undefined;

  const closeTextMessage = () => {
    if (!textMessageFields || mode !== "text") {
      throw new Error("No text message to close");
    }
    const event = {
      type: EventType.TEXT_MESSAGE_END,
      messageId: textMessageFields.messageId,
    } as TextMessageEndEvent;
    mode = undefined;
    textMessageFields = undefined;
    return event;
  };

  const closeToolCall = () => {
    if (!toolCallFields || mode !== "tool") {
      throw new Error("No tool call to close");
    }
    const event = {
      type: EventType.TOOL_CALL_END,
      toolCallId: toolCallFields.toolCallId,
    } as ToolCallEndEvent;
    mode = undefined;
    toolCallFields = undefined;
    return event;
  };

  const closePendingEvent = () => {
    if (mode === "text") {
      return [closeTextMessage()];
    }
    if (mode === "tool") {
      return [closeToolCall()];
    }
    return [];
  };

  return events$.pipe(
    mergeMap((event) => {
      switch (event.type) {
        case EventType.TEXT_MESSAGE_START:
        case EventType.TEXT_MESSAGE_CONTENT:
        case EventType.TEXT_MESSAGE_END:
        case EventType.TOOL_CALL_START:
        case EventType.TOOL_CALL_ARGS:
        case EventType.TOOL_CALL_END:
        case EventType.STATE_SNAPSHOT:
        case EventType.STATE_DELTA:
        case EventType.MESSAGES_SNAPSHOT:
        case EventType.CUSTOM:
        case EventType.RUN_STARTED:
        case EventType.RUN_FINISHED:
        case EventType.RUN_ERROR:
        case EventType.STEP_STARTED:
        case EventType.STEP_FINISHED:
          return [...closePendingEvent(), event];
        case EventType.RAW:
          return [event];
        case EventType.TEXT_MESSAGE_CHUNK:
          const messageChunkEvent = event as TextMessageChunkEvent;
          const textMessageResult = [];
          if (
            // we are not in a text message
            mode !== "text" ||
            // or the message id is different
            (messageChunkEvent.messageId !== undefined &&
              messageChunkEvent.messageId !== textMessageFields?.messageId)
          ) {
            // close the current message if any
            textMessageResult.push(...closePendingEvent());
          }

          // we are not in a text message, start a new one
          if (mode !== "text") {
            if (messageChunkEvent.messageId === undefined) {
              throw new Error("First TEXT_MESSAGE_CHUNK must have a messageId");
            }

            textMessageFields = {
              messageId: messageChunkEvent.messageId,
            };
            mode = "text";

            textMessageResult.push({
              type: EventType.TEXT_MESSAGE_START,
              messageId: messageChunkEvent.messageId,
              role: "assistant",
            } as TextMessageStartEvent);
          }

          if (messageChunkEvent.delta !== undefined) {
            textMessageResult.push({
              type: EventType.TEXT_MESSAGE_CONTENT,
              messageId: textMessageFields!.messageId,
              delta: messageChunkEvent.delta,
            } as TextMessageContentEvent);
          }

          return textMessageResult;
        case EventType.TOOL_CALL_CHUNK:
          const toolCallChunkEvent = event as ToolCallChunkEvent;
          const toolMessageResult = [];
          if (
            // we are not in a text message
            mode !== "tool" ||
            // or the tool call id is different
            (toolCallChunkEvent.toolCallId !== undefined &&
              toolCallChunkEvent.toolCallId !== toolCallFields?.toolCallId)
          ) {
            // close the current message if any
            toolMessageResult.push(...closePendingEvent());
          }

          if (mode !== "tool") {
            if (toolCallChunkEvent.toolCallId === undefined) {
              throw new Error("First TOOL_CALL_CHUNK must have a toolCallId");
            }
            if (toolCallChunkEvent.toolCallName === undefined) {
              throw new Error("First TOOL_CALL_CHUNK must have a toolCallName");
            }
            toolCallFields = {
              toolCallId: toolCallChunkEvent.toolCallId,
              toolCallName: toolCallChunkEvent.toolCallName,
              parentMessageId: toolCallChunkEvent.parentMessageId,
            };
            mode = "tool";

            toolMessageResult.push({
              type: EventType.TOOL_CALL_START,
              toolCallId: toolCallChunkEvent.toolCallId,
              toolCallName: toolCallChunkEvent.toolCallName,
              parentMessageId: toolCallChunkEvent.parentMessageId,
            } as ToolCallStartEvent);
          }

          if (toolCallChunkEvent.delta !== undefined) {
            toolMessageResult.push({
              type: EventType.TOOL_CALL_ARGS,
              toolCallId: toolCallFields!.toolCallId,
              delta: toolCallChunkEvent.delta,
            } as ToolCallArgsEvent);
          }

          return toolMessageResult;
      }
      const _exhaustiveCheck: never = event.type;
    }),
  );
};
