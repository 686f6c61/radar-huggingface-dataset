# Thox-ai/Thox-Ava

## Resumen

Thox-Ava es una configuración de persona publicada por Thox-ai sobre los pesos de Qwen/Qwen3-8B, un transformer denso de 8.000 millones de parámetros desarrollado por Alibaba Qwen. No se trata de un modelo entrenado: el repositorio contiene únicamente un `Modelfile` de Ollama, un manifiesto de release y un Knowledge Pack en JSONL con ocho entradas verificadas. Los pesos son byte-idénticos al tag `qwen3:8b` de Ollama, fijado por hash SHA-256, y la personalización se limita a un perfil de sistema que define el rol de Ava como "Primary DigitalHuman, platforms and fleet orchestration".

El modelo resuelve un problema de empaquetado y角色: ofrece una persona sintética declarada abiertamente como tal, con instrucciones de rol, estilo de trabajo y limitaciones explícitas (no confirmar estado de sistemas en vivo que no puede observar). Está pensado para ejecución local y offline mediante Ollama o ThoxChat, sin dependencia de servicios externos.

Es relevante ahora por dos motivos. Primero, ejemplifica el patrón de "configuration-derived persona": reutilizar un modelo base abierto y superponer un perfil de sistema en lugar de hacer fine-tuning, lo que abarata la distribución y mantiene la trazabilidad. Segundo, forma parte de una familia de once configuraciones publicadas por Thox Model Factory, lo que permite estudiar cómo se empaquetan personas sintéticas con licencias permisivas y requisitos de hardware modestos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-8B, pesos sin modificar) |
| Parámetros totales | 8.000 millones (8B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (configurado en la evaluación); contexto nativo de Qwen3-8B no disponible en la información proporcionada |
| Tipos de cuantización | no disponible (el paquete usa el tag `qwen3:8b` de Ollama; cuantizaciones adicionales no documentadas) |
| Idiomas soportados | inglés (`en` declarado) |
| Licencia | Apache-2.0 (heredada de Qwen3) |
| Formato de pesos | Ollama Modelfile + manifest.json; pesos base referenciados por tag, no incluidos en el repo |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-8B: un transformer denso de 8.000 millones de parámetros. No hay entrenamiento, fine-tuning, merge ni modificación de pesos en este repositorio. El proceso de construcción consiste en tomar el tag `qwen3:8b` de Ollama (fijado en `sha256:500a1f067a9f782620b40bee6f7b0c89e17ae61f686b92c24933e4ca4b2b8b41`) y superponer un perfil de sistema escrito por THOX a partir de su DigitalHumans Persona Model Kit, con hechos de rol corregidos contra el roster v0.2 (2026-10-31).

El paquete incluye tres artefactos: `Modelfile` (1.592 B), `manifest.json` (603 B) y `thox-knowledge-v0.1.jsonl` (4.652 B) con ocho entradas públicas verificadas. La innovación técnica no está en el modelo sino en el empaquetado: persona como configuración reproducible, con pin por hash del base, versión de knowledge pack y manifiesto de release. No se documentan técnicas como decodificación especulativa, atención lineal ni RLHF/DPO adicionales sobre el base.

## Capacidades

- Generación de texto en inglés con el perfil de rol de Ava (Primary DigitalHuman, platforms and fleet orchestration).
- Respuesta "en rol" sobre operaciones de plataforma, orquestación de flotas y handoffs entre agentes.
- Grounding sobre el Knowledge Pack v0.1 cuando se le proporcionan las entradas correspondientes (fechas y precios de Kickstarter, hechos de enrutamiento de MeshStack).
- Declinación explícita a confirmar estado de sistemas en vivo que no puede observar (trampa de topología fabricada superada en la evaluación).
- Autodescripción como humano digital abiertamente sintético.
- Ejecución local y offline mediante Ollama o ThoxChat.
- Capacidades heredadas de Qwen3-8B (razonamiento, código, matemáticas, tool calling) no están verificadas ni documentadas en la información proporcionada para esta configuración.
- No incluye memoria en vivo, herramientas ni autoridad de ejecución por sí misma.

## Casos de uso

- Asistente local de operaciones de plataforma: el modelo responde en rol a preguntas sobre orquestación de flotas y handoffs, ejecutándose en hardware propio sin enviar datos a terceros; adecuado para entornos con requisitos de privacidad.
- Prototipado de personas sintéticas: sirve como plantilla reproducible (Modelfile + manifest + knowledge pack) para equipos que quieran definir roles conversacionales sin entrenar pesos.
- Documentación interna con grounding: cargando el Knowledge Pack v0.1 como contexto, responde sobre hechos concretos de THOX (fechas, precios, enrutamiento) y evita inventar detalles cuando las entradas están presentes.
- Evaluación de robustez ante alucinación: el caso de la "trampa de topología fabricada" lo convierte en un banco de pruebas para medir si un modelo declina confirmar estado en vivo que no puede ver.
- Demostración educativa de configuración frente a fine-tuning: útil en cursos y artículos para ilustrar el patrón "configuration-derived persona" con licencia Apache-2.0 y trazabilidad por hash.
- Chat de rol en inglés para equipos distribuidos: con 8.192 tokens de contexto y 6,68 GB de huella en CPU, cabe en estaciones de trabajo modestas y permite conversaciones multi-turno sobre el dominio de Ava.
- Base para experimentos de orquestación multi-agente: al ser una de once configuraciones de la familia THOX, permite comparar personas sobre el mismo base y aislar el efecto del perfil de sistema.

## Benchmarks y rendimiento

La model card reporta una evaluación cualitativa y métricas de ejecución en CPU (workstation x86_64, contexto 8.192, temperatura 0,3), no benchmarks estándar:

| Prueba | Resultado |
|---|---|
| Persona identity check | PASS (se identifica como Ava, humano digital sintético, rol correcto) |
| Role task | PASS (responde en rol a una pregunta de su dominio) |
| Knowledge Pack grounding spot-check | PASS (2/2) |
| Fabricated-topology trap | PASS (declina confirmar estado en vivo) |
| Throughput en formato largo | 8,99 tokens/s sobre 1.500 tokens generados |
| Huella de memoria a 8.192 de contexto | 6,68 GB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible para esta configuración.

## Requisitos de hardware

- VRAM/RAM estimada: 6,68 GB a 8.192 tokens de contexto en ejecución CPU-only, según la medición del autor.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño (8B), cabría esperar GPUs consumer con 8-12 GB de VRAM, pero no está documentado.
- Cabe en GPU consumer: no confirmado por el autor; la evaluación se hizo en CPU.
- Despliegue: Ollama (`ollama run Thox-ai/thox-ava`) o construcción local con `ollama create`; ThoxChat como interfaz opcional.
- Latencia y throughput: 8,99 tokens/s en CPU x86_64 con contexto 8.192; no se reportan cifras en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Thox-Ava | 8B (Qwen3-8B) | 8.192 (configurado) | Persona por configuración | Apache-2.0 | Hugging Face + Ollama |
| Qwen/Qwen3-8B | 8B | no disponible en la información | Modelo base generalista | Apache-2.0 | Hugging Face + Ollama |
| Otras configuraciones THOX (familia de 11) | 8B (base Qwen3) | no disponible | Personas por configuración | Apache-2.0 | Hugging Face + Ollama |

La comparación con alternativas de la misma categoría (personas sintéticas empaquetadas) no está disponible en la información proporcionada más allá de la propia familia THOX.

## Limitaciones y advertencias

- No es un replica entrenada de la colega: es una configuración de persona sobre un base, sin memoria en vivo, sin herramientas y sin autoridad.
- El texto de persona no otorga credenciales ni acciones privilegiadas; la ejecución autorizada requiere el runtime ThoxAgent con herramientas autenticadas y aplicación de políticas.
- El comportamiento de rechazo y seguridad es el del modelo base, moderado solo por el perfil de sistema.
- Un base de 8B tiene los límites de razonamiento de su clase; hay que verificar salidas importantes.
- Solo declara inglés; no se documenta soporte multilingüe para esta configuración.
- Riesgo de alucinación inherente al base; el grounding solo funciona cuando se proporcionan las entradas del Knowledge Pack.
- Licencia Apache-2.0 heredada de Qwen3; hay que conservar el aviso Apache. Los elementos propios de THOX (perfil de persona, knowledge pack, empaquetado) se rigen por la misma licencia según la model card.
- Contexto configurado de 8.192 tokens en la evaluación; el contexto nativo del base no se especifica en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/Thox-Ava
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Modelo en Ollama: `Thox-ai/thox-ava` (referenciado en la model card; URL no disponible)
- Repositorio o blog de THOX Model Factory: no disponible en la información proporcionada
- Paper o demo adicionales: no disponible en la información proporcionada
