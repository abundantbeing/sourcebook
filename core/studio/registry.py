"""Extensible Studio generator registry (allows add-on plugins such as Audio Overview)."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Callable, Optional


@dataclass
class StudioGenerator:
    kind: str
    label: str
    description: str
    instructions: str
    schema_file: Optional[str] = None
    schema: Optional[dict[str, Any]] = None
    renderer_id: Optional[str] = None
    custom_runner: Optional[Callable[..., dict[str, Any]]] = None


_REGISTRY: dict[str, StudioGenerator] = {}


def register_generator(gen: StudioGenerator) -> None:
    _REGISTRY[gen.kind] = gen


def get_generator(kind: str) -> StudioGenerator:
    if kind not in _REGISTRY:
        raise KeyError(f"Unknown Studio generator kind: {kind!r}")
    return _REGISTRY[kind]


def list_generators() -> list[dict[str, Any]]:
    return [
        {
            "kind": g.kind,
            "label": g.label,
            "description": g.description,
            "renderer_id": g.renderer_id or g.kind,
        }
        for g in _REGISTRY.values()
    ]
