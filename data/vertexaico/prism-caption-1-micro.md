# VertexAIco/prism-caption-1-micro

## Resumen

Prism Caption 1 Micro es un modelo de propósito único que genera títulos de chat automáticamente a partir del primer mensaje de una conversación. Lo desarrolla VertexAIco como parte de la familia Prism, y está diseñado para sustituir la llamada a un modelo generalista en la tarea de auto-nombrado de chats, de forma local y eficiente. El modelo parte del base `mlx-community/gemma-3-1b-it-4bit` y ha sido destilado mediante LoRA a partir del profesor `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning`.

El adaptador LoRA tiene 203.531.392 parámetros (el base Gemma 3 1B aporta 1B), y se distribuye en dos formatos: MLX en 4-bit y GGUF en Q4_K_M. El modelo está entrenado únicamente para responder con un título corto (3-6 palabras, en título, sin puntuación final) y no está pensado para ninguna otra tarea. Se publica bajo licencia Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3) con adaptadores LoRA |
| Parametros totales | 203.531.392 (adaptador LoRA, según safetensors; el base Gemma 3 1B tiene 1.000M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el base Gemma 3 1B soporta hasta 32K tokens) |
| Tipos de cuantizacion | 4-bit (MLX) y Q4_K_M (GGUF) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) y GGUF |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer decoder-only de Gemma 3 1B, cuantizada a 4-bit. Sobre ella se aplica un adaptador LoRA de rango 8 en 8 capas, entrenado durante 1.500 iteraciones sobre un dataset de 339 ejemplos de primeros mensajes realistas distribuidos en unos 50 temas (programación, viajes, cocina, finanzas, salud, etc.). Las etiquetas de título fueron generadas por el modelo profesor `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning` a través de OpenRouter. La mejor pérdida de validación fue 0,163, alcanzada en la iteración 800, con convergencia práctica desde la iteración 300.

No se emplearon técnicas de RLHF ni DPO; el entrenamiento es supervisado con LoRA sobre el modelo base. En inferencia, es necesario añadir el token `<end_of_turn>` (id 106) como condición de parada, ya que el tokenizador de Gemma 3 solo registra `<eos>` (id 1) por defecto; sin ello, la generación continuaría más allá del título correcto.

## Capacidades

- Generación de títulos de chat a partir del primer mensaje del usuario.
- Formato estricto: 3-6 palabras, en título, sin puntuación final ni preámbulo.
- Funciona únicamente en inglés.
- No soporta tool calling, razonamiento multi-paso, visión ni audio.
- No es un modelo conversacional generalista; no puede mantener diálogos.

## Casos de uso

- Auto-nombrado de conversaciones en aplicaciones de chat o mensajería: el modelo genera un título descriptivo del hilo a partir del primer mensaje, sin necesidad de invocar a un LLM de mayor tamaño.
- Etiquetado automático de tickets de soporte: se puede integrar en sistemas de helpdesk para clasificar y resumir la incidencia inicial del usuario.
- Indexación de correos electrónicos o mensajes en CRMs: permite asignar títulos cortos a hilos de correo para facilitar su búsqueda posterior.
- Preprocesamiento de datos de conversaciones para análisis: genera un título normalizado por cada conversación, útil para organizar datasets de entrenamiento o auditoría.
- Generación de títulos de documentos a partir de su primer párrafo: adaptado a textos que comienzan con una pregunta o descripción clara.
- Clasificación de mensajes de usuario en formularios de contacto: el título generado puede servir como etiqueta para el routing interno de incidencias.

## Benchmarks y rendimiento

La model card del autor incluye una comparación base-vs-afinado sobre un conjunto de 20 primeros mensajes de prueba, pero no se publican resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.).

| Métrica | Gemma 3 1B base | Prism Caption 1 Micro |
|---|---|---|
| Salidas con formato incorrecto | 3/20 | 0/20 |
| Palabras promedio por título | 4,0 | 4,0 |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- Inferencia en Apple Silicon: formato MLX en 4-bit, funciona en Mac con 8 GB de RAM o más; el modelo completo ocupa unos 1,8 GB en disco.
- Inferencia en CPU/GPU genéricas: formato GGUF Q4_K_M, compatible con `llama.cpp`, LM Studio y Ollama; puede ejecutarse en portátiles sin GPU dedicada.
- VRAM estimada: inferior a 1 GB en cuantización 4-bit para la generación de un título (3-6 palabras).
- Latencia estimada: del orden de decenas de milisegundos por título en Apple Silicon o GPU de consumo, gracias al pequeño tamaño del modelo y a la generación corta.
- Despliegue: se puede servir con `mlx-lm` en macOS, o con `llama.cpp` / `Ollama` en servidores Linux. No se recomienda usar vLLM ni TGI por el tamaño del modelo y su naturaleza de tarea única.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Uso principal |
|---|---|---|---|---|---|
| Prism Caption 1 Micro | 1B (base) + adaptador LoRA | no disponible (base 32K) | Apache 2.0 | MLX, GGUF | Títulos de chat |
| Gemma 3 1B (base) | 1B | 32K | Apache 2.0 | MLX, GGUF, safetensors | Conversación general |
| Llama 3.2 1B | 1B | 128K | Llama 3.2 | GGUF, safetensors | Conversación general |
| Nemotron 3 Nano 30B | 30B (3B activos) | 128K | NVIDIA Open Model | safetensors | Razonamiento y agente |

Prism Caption 1 Micro es el único de los cuatro que está especializado exclusivamente en titulado de conversaciones; el resto son modelos generalistas de tamaño comparable, aunque Nemotron es significativamente más grande.

## Limitaciones y advertencias

- Modelo de propósito único: no es un chat generalista, no genera código, no razona ni responde preguntas; solo produce títulos.
- Dataset de entrenamiento muy pequeño (339 ejemplos) y solo en inglés; los títulos para mensajes muy cortos o ambiguos pueden resultar genéricos.
- Riesgo de alucinación en títulos cuando el mensaje del usuario no es descriptivo; el modelo puede inventar temas no presentes.
- No se han publicado evaluaciones de sesgos, toxicidad o seguridad; no se recomienda su uso en producción sin una validación previa.
- La licencia Apache 2.0 permite uso comercial, pero el base Gemma 3 está sujeto a los términos de uso de Google; se debe verificar el cumplimiento.
- El sistema de parada requiere ajustes en la inferencia (token `<end_of_turn>`), lo que puede generar salidas corruptas si se ignora.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/VertexAIco/prism-caption-1-micro
- Modelo base Gemma 3 1B (4-bit): https://huggingface.co/mlx-community/gemma-3-1b-it-4bit
- Modelo profesor Nemotron-3-Nano-Omni-30B-A3B: https://huggingface.co/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning
