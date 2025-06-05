"""
Agentic chat endpoint for the AG-UI protocol.
"""

import uuid
import asyncio
import json
from fastapi import Request
from fastapi.responses import StreamingResponse
from ag_ui.core import (
    RunAgentInput,
    EventType,
    RunStartedEvent,
    RunFinishedEvent,
    TextMessageStartEvent,
    TextMessageContentEvent,
    TextMessageEndEvent,
    TextMessageChunkEvent,
    ToolCallStartEvent,
    ToolCallArgsEvent,
    ToolCallEndEvent,
    ToolCallChunkEvent
)

from ag_ui.encoder import EventEncoder

async def agentic_chat_endpoint(input_data: RunAgentInput, request: Request):
    """Agentic chat endpoint"""
    # Get the accept header from the request
    accept_header = request.headers.get("accept")

    # Create an event encoder to properly format SSE events
    encoder = EventEncoder(accept=accept_header)

    async def event_generator():
        # Get the last message content for conditional logic
        last_message_role = None
        if input_data.messages and len(input_data.messages) > 0:
            last_message = input_data.messages[-1]
            last_message_content = last_message.content
            last_message_role = getattr(last_message, 'role', None)

        # Send run started event
        yield encoder.encode(
            RunStartedEvent(
                type=EventType.RUN_STARTED,
                thread_id=input_data.thread_id,
                run_id=input_data.run_id
            ),
        )

        # Conditional logic based on last message
        if last_message_role == "tool":
            async for event in send_tool_result_message_events():
                yield encoder.encode(event)
        else:
            async for event in send_event_sequence():
                yield encoder.encode(event)

        # Send run finished event
        yield encoder.encode(
            RunFinishedEvent(
                type=EventType.RUN_FINISHED,
                thread_id=input_data.thread_id,
                run_id=input_data.run_id
            ),
        )

    return StreamingResponse(
        event_generator(),
        media_type=encoder.get_content_type()
    )


async def send_event_sequence():
    """Send text message events with countdown"""

    yield TextMessageChunkEvent(
        type=EventType.TEXT_MESSAGE_CHUNK,
        message_id="887da36a-69d3-4750-af8a-771b36d76f90",
        role="assistant",
        delta="The"
    )

    yield TextMessageChunkEvent(
        type=EventType.TEXT_MESSAGE_CHUNK,
        message_id="887da36a-69d3-4750-af8a-771b36d76f90",
        role="assistant",
        delta="..."
    )

    yield ToolCallChunkEvent(
        type=EventType.TOOL_CALL_CHUNK,
        tool_call_id="call_dfO2loYD6iyxBhJl6zJ2M0pK",
        tool_call_name="change_background",
        parent_message_id="887da36a-69d3-4750-af8a-771b36d76f90",
        delta="{\"background\":\"linear-gradient(to right, blue, pink)\"}"
    )


async def send_tool_result_message_events():
    """Send message for tool result"""
    message_id = str(uuid.uuid4())

    # Start of message
    yield TextMessageStartEvent(
        type=EventType.TEXT_MESSAGE_START,
        message_id=message_id,
        role="assistant"
    )

    # Content
    yield TextMessageContentEvent(
        type=EventType.TEXT_MESSAGE_CONTENT,
        message_id=message_id,
        delta="background changed ✓"
    )

    # End of message
    yield TextMessageEndEvent(
        type=EventType.TEXT_MESSAGE_END,
        message_id=message_id
    )


async def send_tool_call_events():
    """Send tool call events"""
    tool_call_id = str(uuid.uuid4())
    tool_call_name = "change_background"
    tool_call_args = {
        "background": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    }

    # Tool call start
    yield ToolCallStartEvent(
        type=EventType.TOOL_CALL_START,
        tool_call_id=tool_call_id,
        tool_call_name=tool_call_name
    )

    # Tool call args
    yield ToolCallArgsEvent(
        type=EventType.TOOL_CALL_ARGS,
        tool_call_id=tool_call_id,
        delta=json.dumps(tool_call_args)
    )

    # Tool call end
    yield ToolCallEndEvent(
        type=EventType.TOOL_CALL_END,
        tool_call_id=tool_call_id
    )
