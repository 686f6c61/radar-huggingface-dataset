# vyronllm/vyron-forge-20b

## Resumen

VYRON Forge 20B es un asistente de programación distribuido por el usuario `vyronllm` que se presenta como un modelo de 20B pensado para inferencia local. En realidad, se trata de una demo temprana que **no introduce pesos nuevos ni fine-tuning**: el repositorio contiene únicamente la model card, un system prompt propio de VYRON y un `Modelfile` de Ollama. El modelo que se ejecuta es el original `openai/gpt-oss-20b` de OpenAI, publicado bajo licencia Apache 2.0.

El wrapper envuelve un modelo de mezcla de expertos (MoE) de aproximadamente 21B parámetros, al que se le impone un comportamiento concreto: responder primero con código, con explicaciones de dos frases como máximo, y ceñirse a temáticas de programación. La configuración recomendada es temperatura `0.3`, esfuerzo de razonamiento `low` y una ventana de contexto de `8192` tokens.

Su relevancia es limitada desde el punto de vista de la investigación: no publica benchmarks, no documenta velocidades medidas y no aporta innovación arquitectónica. Es útil únicamente como ejemplo reproducible de cómo empaquetar un modelo abierto con un system prompt y un Modelfile para uso local con llama.cpp, Ollama, LM Studio o node-llama-cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) del modelo base `openai/gpt-oss-20b`; el wrapper no modifica la arquitectura |
| Parametros totales | ~21B (según la model card, corresponden al modelo base) |
| Parametros activos | no disponible en la ficha (modelo base MoE, número no especificado) |
| Longitud de contexto | 8192 tokens (valor recomendado en la ficha; límite nativo del modelo base no disponible) |
| Tipos de cuantizacion | MXFP4 (fichero `gpt-oss-20b-MXFP4.gguf`, ~12 GB); no se listan otras variantes propias |
| Idiomas soportados | en |
| Licencia | Apache 2.0 (idéntica al modelo base) |
| Formato de pesos | GGUF (a través de `ggml-org/gpt-oss-20b-GGUF`); el repo en sí no contiene pesos |

## Arquitectura y entrenamiento

No hay arquitectura propia: VYRON Forge 20B es una capa de configuración sobre `openai/gpt-oss-20b`, un transformer con mezcla de expertos de aproximadamente 21B parámetros totales. El repositorio no incluye pesos, no documenta el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, fases de RLHF/DPO) y no introduce ninguna innovación técnica. La única "capa VYRON" es un system prompt que fuerza respuestas code-first, tono breve y enfoque en programación, junto con parámetros de generación sugeridos (`temperature=0.3`, `reasoning effort=low`).

El `Modelfile` de Ollama y el resto de instrucciones de despliegue (llama.cpp, LM Studio, node-llama-cpp) simplemente cargan los pesos del modelo base. En la práctica, cualquier evaluación de calidad, sesgos o rendimiento del sistema equivale a evaluar `gpt-oss-20b` con un prompt distinto, no un modelo nuevo.

## Capacidades

- Generación de código en múltiples lenguajes, con preferencia por respuestas code-first y explicaciones cortas (por diseño del system prompt).
- Asistencia a programación en local, sin enviar prompts a servicios externos.
- Razonamiento de un solo paso con esfuerzo `low` por defecto (configurable a través del modelo base).
- Soporte de tool calling y function calling heredado del modelo base `gpt-oss-20b`.
- Ejecución en entornos de inferencia local: llama.cpp, Ollama, LM Studio y node-llama-cpp.
- API compatible con OpenAI Chat Completions cuando se sirve con `llama-server` en `http://localhost:8080`.
- Capacidades multilingües limitadas al inglés según la model card (el modelo base puede tener más, pero no se documenta aquí).
- Sin soporte declarado de visión, audio ni otras modalidades en esta ficha.

## Casos de uso

- Asistente de código en local para desarrolladores que trabajan con código propietario: al ejecutarse con llama.cpp u Ollama sobre los pesos de `gpt-oss-20b`, ningún prompt abandona la máquina del usuario.
- Generación de snippets y funciones pequeñas (por ejemplo, un debounce en TypeScript) con respuesta code-first y una explicación de dos frases, útil para autocompletado en editores o terminal.
- Revisión rápida de fragmentos de código en un pipeline de pre-commit: el modelo devuelve el bloque corregido y, opcionalmente, se puede integrar con `llama-server` para consumirlo desde scripts.
- Entorno de demostración reproducible para evaluar `gpt-oss-20b` con distintos system prompts: al no haber pesos nuevos, sirve como plantilla para comparar configuraciones de prompt y generación.
- Borradores de contratos inteligentes (con advertencia explícita de la model card de revisar y auditar antes de manejar fondos reales).
- Chat de soporte técnico de programación en un equipo pequeño, desplegado con Ollama en una estación de trabajo con ~16 GB de RAM/VRAM libres.
- Base para prototipos de agentes de código con tool calling, siempre que se acepten las limitaciones del modelo base (ventana de 8192 tokens recomendada en esta configuración).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye métricas de MMLU, HumanEval, GSM8K ni similares, y tampoco documenta velocidad medida (tokens/s). El propio autor indica explícitamente: "We haven't published measured speeds yet. Speed depends on your hardware."

## Requisitos de hardware

- VRAM/RAM estimada: unos 16 GB libres (RAM o VRAM) para el fichero MXFP4 de ~12 GB; 32 GB totales se consideran "cómodos" según la model card.
- GPU recomendadas: no especificadas en la ficha. Por tamaño del fichero (~12 GB en MXFP4), encaja en GPUs consumer de 16 GB o más (por ejemplo, RTX 4080/4090, RTX 4060 Ti 16 GB); no hay validación oficial.
- Cabe en GPU consumer: sí, según el tamaño del GGUF MXFP4; el autor no publica pruebas por modelo concreto.
- Opciones de despliegue documentadas: Ollama (vía `Modelfile`), llama.cpp (`llama-server -hf ggml-org/gpt-oss-20b-GGUF --jinja -c 8192`), LM Studio y node-llama-cpp.
- Latencia y throughput: no disponibles (no se han publicado mediciones).
- Contexto recomendado: 8192 tokens; valores superiores no están probados en esta configuración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| VYRON Forge 20B (este) | ~21B MoE (modelo base) | 8192 recomendado | Apache 2.0 | HuggingFace (`vyronllm/vyron-forge-20b`) | Wrapper: solo system prompt + Modelfile; sin pesos propios |
| openai/gpt-oss-20b | ~21B MoE | no disponible en esta ficha | Apache 2.0 | HuggingFace + GGUF en `ggml-org` | Modelo base real; VYRON no añade entrenamiento |
| gpt-oss-20b-GGUF (ggml-org) | ~21B MoE | no disponible en esta ficha | Apache 2.0 | HuggingFace | Conversión GGUF utilizada por VYRON; pesos idénticos |

No se dispone de datos de benchmarks para comparar rendimiento entre estos modelos en la información proporcionada. La comparación relevante es que VYRON Forge 20B y `openai/gpt-oss-20b` comparten exactamente los mismos pesos: la única diferencia es el prompt de sistema y los parámetros de generación.

## Limitaciones y advertencias

- **No es un modelo nuevo**: el repositorio no contiene pesos propios ni fine-tuning; toda la calidad corresponde a `gpt-oss-20b`.
- Riesgo de alucinación: la model card advierte que "puede equivocarse" y que las respuestas deben tratarse como un primer borrador a testear.
- Contratos inteligentes: el autor recomienda revisar, testear y auditar cualquier contrato generado antes de manejar fondos reales.
- Idiomas: solo se declara inglés (`en`); no se documenta soporte de castellano ni de otros idiomas.
- Contexto: la configuración recomendada es de 8192 tokens; no se garantiza rendimiento con ventanas mayores en esta puesta a punto.
- Licencia: Apache 2.0 permite uso comercial, pero al no haber contribución propia de VYRON, las obligaciones y garantías son las del modelo base.
- Ausencia de métricas: no hay benchmarks ni velocidades publicadas, lo que impide comparar objetivamente con alternativas.
- Sesgos: no documentados en la ficha; heredados del modelo base `gpt-oss-20b`.
- Fecha de creación del repositorio: `2026-10-21`, posterior a la fecha de la consulta; conviene verificar la vigencia del recurso.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/vyronllm/vyron-forge-20b
- Modelo base `openai/gpt-oss-20b`: https://huggingface.co/openai/gpt-oss-20b
- GGUF de referencia (`ggml-org/gpt-oss-20b-GGUF`): https://huggingface.co/ggml-org/gpt-oss-20b-GGUF
- `Modelfile` incluido en el repo: https://huggingface.co/vyronllm/vyron-forge-20b/blob/main/Modelfile
- Sitio web del autor: https://vyron.run
