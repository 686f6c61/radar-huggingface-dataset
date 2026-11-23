# VoidOSS/Qwen-2.8-1.5B

## Resumen

Qwen 2.8 (1.5B) es un modelo de lenguaje de 1.500 millones de parámetros publicado por VoidOSS, un desarrollador independiente, como un ajuste fino (fine-tuning) del modelo base Qwen2.5-1.5B de Alibaba Cloud. Su particularidad es que integra de forma nativa un modo de razonamiento explícito mediante etiquetas `<think>...</think>`, destilado a partir de trazas de razonamiento del dataset AM-DeepSeek-R1-0528-Distilled, que a su vez proviene de DeepSeek-R1. El modelo está entrenado con SFT y QLoRA para ofrecer dos modos de operación conmutables a nivel de pesos: un modo "Thinking" que genera cadenas de razonamiento paso a paso y un modo "Fast" que las omite.

El modelo mantiene la arquitectura transformer decoder-only de Qwen2.5, con 1.777.088.000 parámetros totales según los pesos en safetensors, y se distribuye bajo licencia Apache 2.0. Está orientado exclusivamente al inglés y su tamaño reducido lo hace desplegable en GPUs de consumo. El interés actual radica en que demuestra que es posible inyectar capacidades de razonamiento tipo DeepSeek-R1 en modelos pequeños mediante destilación y un conmutador de modo a nivel de prompt, algo relevante para entornos con recursos limitados.

La propuesta de valor es la mejora sustancial en tareas matemáticas y de razonamiento lógico respecto al modelo base: según la model card, pasa del 12,0% al 58,0% en GSM8K y del 30,0% al 70,0% en trampas lógicas, manteniendo un tamaño que cabe en 8 GB de VRAM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parámetros totales | 1.777.088.000 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; compatible con cuantización estándar GGUF/AWQ vía herramientas externas, no confirmado por el autor) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B, un transformer decoder-only denso con atención causal estándar y 1.500 millones de parámetros. Sobre esta base, VoidOSS aplicó un ajuste fino supervisado (SFT) combinado con QLoRA, utilizando como datos de entrenamiento las trazas de razonamiento del dataset AM-DeepSeek-R1-0528-Distilled, derivado de DeepSeek-R1. El entrenamiento incluye una técnica de "replay mixing" mencionada en la model card pero no detallada, orientada presumiblemente a preservar capacidades del modelo base mientras se incorporan las cadenas de razonamiento.

La innovación principal es el entrenamiento dual para dos modos de generación conmutables a nivel de prompt: el modo Thinking se activa con el prefill estándar `<|im_start|>assistant\n` y produce razonamiento explícito entre etiquetas `<think>`, mientras que el modo Fast se activa prefijando `<|im_start|>assistant\n<think>\n</think>\n`, lo que fuerza al modelo a cerrar el bloque de razonamiento vacío y responder directamente. Según el autor, este bypass tiene un 100% de cumplimiento sin reapertura del bloque `<think>`.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento explícito paso a paso mediante bloques `<think>...</think>` en modo Thinking.
- Conmutación a modo Fast para respuestas directas sin razonamiento intermedio.
- Razonamiento matemático (aritmética y problemas de palabras tipo GSM8K).
- Generación y ejecución de código Python.
- Depuración de errores (bug-fix) en código.
- Razonamiento lógico y resolución de trampas cognitivas.
- Razonamiento multi-hop y satisfacción de restricciones múltiples.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de visión, audio u otras modalidades.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Tutoría matemática automatizada: el modelo puede resolver problemas de palabras paso a paso en modo Thinking, mostrando el razonamiento al estudiante, con una tasa de acierto del 58,0% en GSM8K según la model card, muy superior al 12,0% del base.
- Asistente de depuración de código en local: con un 66,7% de acierto en tareas de bug-fix y 87,5% en ejecución de código Python, es adecuado para entornos de desarrollo con GPU de consumo donde no se puede desplegar un modelo mayor.
- Generación de código en pipelines ligeros: su tamaño permite integrarlo en flujos de CI/CD o pre-commit hooks para sugerencias y correcciones rápidas en modo Fast, reduciendo latencia.
- Razonamiento lógico en asistentes conversacionales: el 70-80% de acierto en trampas lógicas lo hace viable para chatbots que deban detectar falacias o resolver acertijos sencillos.
- Prototipado de investigación sobre razonamiento en modelos pequeños: sirve como banco de pruebas para estudiar la destilación de cadenas de razonamiento y la conmutación de modos en modelos de 1,5B.
- Filtrado y clasificación con razonamiento justificado: en modo Thinking puede generar explicaciones auditables antes de una decisión, útil en tareas de moderación o verificación de restricciones (87,5% en constraint/multi-hop).
- Despliegue en dispositivos con recursos limitados: al caber en 8 GB de VRAM, permite inferencia local en estaciones de trabajo modestas o GPUs de consumo.

## Benchmarks y rendimiento

Resultados publicados por el autor, evaluados en una RTX 4060 Ti (8 GB) con decodificación greedy (`do_sample=False`, 1024 tokens máximos en las suites de código):

| Suite de benchmark | Qwen 2.5 (1.5B base) | Qwen-2.6-Thinking-1.5B | Qwen-2.8-1.5B |
|---|---|---|---|
| GSM8K (50 problemas de matemáticas) | 12,0% (6/50) | 58,0% (29/50) | 58,0% (29/50) |
| Lógica y trampas cognitivas (10) | 30,0% (3/10) | 70,0% (7/10) | 70,0% (7/10) |
| Ejecución de código Python (8) | 62,5% (5/8) | 87,5% (7/8) | 75,0% (6/8); 87,5% en Fast |
| Depuración bug-fix (6) | 66,7% (4/6) | 66,7% (4/6) | 66,7% (4/6) |
| Restricciones y multi-hop (8) | 12,5% (1/8) | 75,0% (6/8) | 87,5% (7/8) |
| Cumplimiento de `<think>` | 0,0% | 96,3% | 98,8% |

Comparativa entre modos del propio Qwen 2.8:

| Modo | Trampas lógicas (10) | Código Python (8) | Restricciones/multi-hop (8) | Tokens medios | Tiempo total | Bypass / tasa `<think>` |
|---|---|---|---|---|---|---|
| Fast Mode | 80,0% (8/10) | 87,5% (7/8) | 62,5% (5/8) | 536,9 | 37,8 s | 100,0% bypass |
| Thinking Mode | 80,0% (8/10) | 87,5% (7/8) | 87,5% (7/8) | 502,9 | 37,2 s | 92,3% `<think>` |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5 GB en FP16 (1,777 mil millones de parámetros × 2 bytes), alrededor de 1,8 GB en cuantización de 8 bits y cerca de 1 GB en 4 bits, más overhead de contexto y caché KV.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para FP16; el autor reporta evaluación en una RTX 4060 Ti de 8 GB.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4060 Ti, RTX 4070 y superiores; también en GPUs integradas con suficiente memoria compartida en cuantización 4 bits.
- Opciones de despliegue: transformers (formato safetensors nativo), llama.cpp y Ollama (requiere conversión a GGUF), vLLM y TGI (compatibles con arquitectura Qwen2, aunque no confirmado explícitamente por el autor).
- Latencia y throughput: el autor reporta tiempos totales de aproximadamente 37-38 segundos para baterías de 8-10 tareas con 1024 tokens máximos en una RTX 4060 Ti, con un promedio de 500-537 tokens por tarea; no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VoidOSS/Qwen-2.8-1.5B | 1,777 B | No disponible | 58,0% (50 problemas) | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-1.5B (base) | 1,5 B | 32.768 tokens (según el modelo base) | 12,0% (50 problemas) | Apache 2.0 | Hugging Face |
| VoidOSS/Qwen-2.6-Thinking-1.5B | 1,5 B | No disponible | 58,0% (50 problemas) | No disponible | Hugging Face |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,5 B | 32.768 tokens (según el modelo base) | No disponible en la información proporcionada | MIT (según el modelo oficial) | Hugging Face |

La comparación con DeepSeek-R1-Distill-Qwen-1.5B es pertinente por ser el referente de destilación de razonamiento sobre Qwen2.5-1.5B, pero no se dispone de sus resultados en las mismas suites para una comparación directa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al derivar de Qwen2.5 y de trazas de DeepSeek-R1, puede heredar sesgos de ambos.
- Riesgo de alucinación: presente como en cualquier modelo de 1,5B; las cadenas de razonamiento `<think>` no garantizan corrección y pueden contener pasos plausibles pero erróneos.
- Limitaciones de idioma: soporte exclusivo de inglés según la model card; el rendimiento en castellano no está evaluado y probablemente sea deficiente.
- Limitaciones de contexto: la longitud de contexto no se especifica en la model card; se desconoce si se preserva la ventana de 32.768 tokens del modelo base.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo deriva de datos destilados de DeepSeek-R1; conviene revisar las condiciones de la licencia del dataset AM-DeepSeek-R1-0528-Distilled antes de un uso comercial.
- Benchmarks con muestras pequeñas: las suites emplean entre 6 y 50 problemas, por lo que los porcentajes tienen alta varianza y no deben extrapolarse como métricas robustas.
- Sin soporte documentado de tool calling ni de agentes: no es adecuado para flujos que requieran function calling sin validación adicional.
- Modelo de nicho: 417 descargas y 0 likes en el momento de la consulta, sin revisión por pares ni evaluación independiente.
- El nombre "Qwen 2.8" no debe confundirse con una versión oficial de Qwen; es una denominación propia del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VoidOSS/Qwen-2.8-1.5B
- Modelo base Qwen2.5-1.5B: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Dataset de destilación: https://huggingface.co/datasets/a-m-team/AM-DeepSeek-R1-0528-Distilled
- Versión anterior del autor: https://huggingface.co/VoidOSS/Qwen-2.6-Thinking-1.5B
