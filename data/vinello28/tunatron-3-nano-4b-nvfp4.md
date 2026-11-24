# vinello28/Tunatron-3-Nano-4B-NVFP4

## Resumen

Tunatron-3-Nano-4B-NVFP4 es un ajuste fino (fine-tuning) del modelo `unsloth/NVIDIA-Nemotron-3-Nano-4B` de NVIDIA, publicado por el usuario vinello28 en Hugging Face, especializado en el triaje de hallazgos de análisis estático de seguridad (SAST). Dado un identificador de debilidad CWE, un sink candidato y la porción de código (backward slice) que llega hasta él, el modelo decide si el sink es realmente vulnerable y emite un hallazgo estructurado en JSON con los campos `vulnerable`, `vex_status`, `severity`, `reasoning` y `suggested_fix`.

El modelo base pertenece a la familia Nemotron 3 Nano de NVIDIA, con una arquitectura híbrida `nemotron_h` (Mamba + atención) y 3.973.556.832 parámetros totales según los pesos en safetensors. El checkpoint publicado aquí está cuantizado en NVFP4 mediante NVIDIA ModelOpt, lo que reduce el tamaño del repositorio a 7,2 GB y lo orienta a GPUs Blackwell. El ajuste fino se realizó con DoRA sobre el modelo base de Unsloth.

Su relevancia actual radica en la aplicación vertical: automatizar la fase de triaje de falsos positivos en pipelines de SAST, un cuello de botella habitual en equipos de AppSec. El modelo está entrenado para código en C, C++ y Python, con prompts de sistema en inglés, y se distribuye bajo la licencia NVIDIA Nemotron Open Model, con restricciones que deben revisarse antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `nemotron_h` (híbrida Mamba + atención, según el tag de transformers) |
| Parametros totales | 3.973.556.832 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8192 tokens (configurado en el ejemplo de servicio con vLLM) |
| Tipos de cuantizacion | NVFP4 (este checkpoint), FP8 y BF16 (checkpoints separados) |
| Idiomas soportados | en (inglés); la model card declara `it, en` en los metadatos |
| Licencia | NVIDIA Nemotron Open Model License |
| Formato de pesos | safetensors (con `custom_code` y `trust_remote_code`) |
| Libreria | transformers |
| Tarea | text-generation (triaje SAST) |
| Idiomas de codigo soportados | C, C++, Python |
| Tamano del repositorio | 7,2 GB |
| Descargas / likes | 354 / 1 |
| Fecha de creacion | 2026-11-06 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Nemotron 3 Nano 4B de NVIDIA, etiquetada como `nemotron_h` en transformers, que combina capas de espacio de estados (Mamba) con mecanismos de atención. Esta naturaleza híbrida explica el flag `--mamba_ssm_cache_dtype float32` que aparece en el comando de servicio con vLLM: el caché de estado de Mamba debe mantenerse en precisión float32 para un funcionamiento correcto. El checkpoint aquí publicado aplica cuantización NVFP4 con NVIDIA ModelOpt sobre los pesos del modelo base.

El ajuste fino se realizó con DoRA (Weight-Decomposed Low-Rank Adaptation) sobre el modelo base de Unsloth, con prompts en formato chat y con el modo de razonamiento (thinking) desactivado durante el entrenamiento. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. La especialización es de dominio: triaje de vulnerabilidades a partir de slices de código y reglas CWE.

## Capacidades

- Triaje de hallazgos SAST: evalúa si un sink candidato es realmente vulnerable a un CWE dado, analizando la traza de código hacia atrás.
- Salida estructurada en JSON con los campos `vulnerable`, `cwe_id`, `severity`, `sink_function`, `sink_file`, `sink_line`, `vex_status`, `reasoning` y `suggested_fix`.
- Clasificación de severidad en cinco niveles: NONE, LOW, MEDIUM, HIGH, CRITICAL.
- Estado VEX: `affected` o `not_affected`.
- Generación de una propuesta de corrección (`suggested_fix`) en inglés, citando ficheros y líneas.
- Soporte de decodificación guiada por JSON-schema (guided decoding) en vLLM.
- Análisis de código en C, C++ y Python.
- Razonamiento en inglés tanto en `reasoning` como en `suggested_fix`.
- No se documentan capacidades de tool calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Triaje automatizado de falsos positivos en pipelines SAST: el modelo recibe la regla CWE y el slice de código y decide si el hallazgo es real, reduciendo el volumen de alertas que llega al equipo de AppSec. Es adecuado porque su entrenamiento está centrado exactamente en esa tarea y su salida JSON se integra directamente en herramientas de gestión de vulnerabilidades.
- Priorización por severidad en paneles de vulnerabilidades: la clasificación en cinco niveles permite ordenar la cola de remediación y asignar recursos a los hallazgos CRITICAL y HIGH primero.
- Generación de informes VEX: el campo `vex_status` (`affected` / `not_affected`) permite alimentar flujos de explotabilidad de vulnerabilidades sin intervención manual.
- Sugerencia de parches en revisión de código: el campo `suggested_fix` con referencias a ficheros y líneas sirve como borrador para el desarrollador o como comentario automático en un pull request.
- Enriquecimiento de hallazgos en C/C++ y Python en pipelines de CI/CD: al soportar estos tres lenguajes, puede desplegarse como paso de análisis en repositorios con esa mezcla de código.
- Servicio interno de consulta de seguridad: desplegado con vLLM detrás de una API compatible con OpenAI, el equipo puede consultar casos concretos con el mismo prompt de sistema y esquema JSON del benchmark.
- Evaluación de reglas SAST personalizadas: dado que el modelo recibe la regla CWE como texto, puede probarse con reglas propias para medir su tasa de acierto antes de adoptarlo.

## Benchmarks y rendimiento

La model card menciona una evaluación del checkpoint NVFP4 con vLLM 0.33.0 sobre una NVIDIA GeForce RTX 5070 Ti (16 GB), con decodificación guiada por JSON-schema a temperatura 0. Los datos cuantitativos disponibles son de validez del JSON, no de precisión de detección:

| Metrica | Resultado |
|---|---|
| Respuestas JSON no validas con campo booleano `vulnerable` (Juliet) | 6 de 600 |
| Respuestas JSON no validas con campo booleano `vulnerable` (pygoat) | 3 de 80 |
| GPU de evaluacion | NVIDIA GeForce RTX 5070 Ti (16 GB) |
| Version de vLLM | 0.33.0 |

No se han publicado en la información disponible resultados de precisión, recall, F1 ni comparaciones con otros modelos en detección de vulnerabilidades.

## Requisitos de hardware

- VRAM estimada: el checkpoint NVFP4 ocupa 7,2 GB en repositorio; en inferencia con vLLM y `--gpu-memory-utilization 0.80` se ha ejecutado en una GPU de 16 GB, por lo que 16 GB de VRAM es un mínimo práctico para esta cuantización.
- GPU recomendadas: NVFP4 está diseñado para GPUs Blackwell (la evaluación se hizo en una RTX 5070 Ti). No se probaron otras GPUs según la model card.
- Para los checkpoints BF16 y FP8 existen variantes separadas (`vinello28/Tunatron-3-Nano-4B-BF16` y `-FP8`); el BF16 de un modelo de ~4B parámetros requiere aproximadamente 8 GB solo para pesos, más caché KV y estado Mamba.
- Despliegue: vLLM 0.33.0 es el runtime documentado y probado, con `--trust-remote-code` y `--mamba_ssm_cache_dtype float32`. No se documentan despliegues con llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tunatron-3-Nano-4B-NVFP4 | 3.973.556.832 | 8192 | Triaje SAST (CWE, VEX, fix) | NVIDIA Nemotron Open Model | Hugging Face |
| unsloth/NVIDIA-Nemotron-3-Nano-4B (base) | ~4B | no disponible | Generacion de texto general | NVIDIA Nemotron Open Model | Hugging Face |
| Modelos SAST genericos de proposito general | no disponible | no disponible | Analisis de seguridad no especializado | variable | no disponible |

No se dispone en la información proporcionada de resultados comparativos de rendimiento frente a alternativas de triaje SAST.

## Limitaciones y advertencias

- Solo se ha evaluado el checkpoint NVFP4; los checkpoints BF16 y FP8 se distribuyen sin evaluación documentada.
- NVFP4 está pensado para GPUs Blackwell; no se probó en otras arquitecturas, por lo que el rendimiento en GPUs no Blackwell es incierto.
- Incluso con decodificación guiada por JSON-schema, se produjeron respuestas JSON inválidas (6 de 600 en Juliet y 3 de 80 en pygoat), en algunos casos por corte en el límite de tokens. En producción hay que validar el JSON y gestionar reintentos.
- El modelo está entrenado con thinking desactivado; activar el modo de razonamiento puede degradar la calidad de la salida.
- Cobertura limitada a C, C++ y Python; otros lenguajes no están soportados según la model card.
- El prompt de sistema, `reasoning` y `suggested_fix` están en inglés; el soporte multilingüe es limitado (metadatos declaran `it, en`).
- Riesgo de alucinación en la identificación de ficheros, líneas y correcciones sugeridas: el `suggested_fix` debe revisarse por una persona antes de aplicarse.
- Licencia NVIDIA Nemotron Open Model: es necesario revisar sus términos antes de cualquier uso comercial, ya que no es una licencia permisiva estándar.
- El modelo es un ajuste fino de un tercero (vinello28) sobre el modelo de NVIDIA y Unsloth; no cuenta con el respaldo ni la validación de NVIDIA.
- No se documentan sesgos específicos ni evaluaciones de robustez frente a código adversario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vinello28/Tunatron-3-Nano-4B-NVFP4
- Modelo base: https://huggingface.co/unsloth/NVIDIA-Nemotron-3-Nano-4B
- Checkpoint BF16: https://huggingface.co/vinello28/Tunatron-3-Nano-4B-BF16
- Checkpoint FP8: https://huggingface.co/vinello28/Tunatron-3-Nano-4B-FP8
- Licencia NVIDIA Nemotron Open Model: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- vLLM: https://github.com/vllm-project/vllm
- NVIDIA TensorRT Model Optimizer (ModelOpt): https://github.com/NVIDIA/TensorRT-Model-Optimizer
- Papers referenciados en los tags: arxiv:2403.18624, arxiv:2505.19828, arxiv:2509.04260
