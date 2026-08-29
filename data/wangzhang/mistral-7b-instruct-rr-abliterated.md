# wangzhang/Mistral-7B-Instruct-RR-Abliterated

## Resumen

Mistral-7B-Instruct-RR-Abliterated es un modelo derivado de GraySwanAI/Mistral-7B-Instruct-RR, una versión de Mistral-7B-Instruct-v0.2 protegida con el mecanismo de defensa Circuit Breakers (Zou et al., NeurIPS 2024). El autor, Wangzhang Wu, ha eliminado por completo el circuito de seguridad mediante una intervención en el espacio de representaciones (abliteración) usando su herramienta abliterix, sin fine-tuning ni actualización de gradientes. El resultado es un modelo que conserva las capacidades lingüísticas del original pero con una tasa de rechazo de contenido dañino drásticamente reducida (del 69 % al 12 % en una evaluación de 100 prompts).

Este modelo es relevante para la comunidad de seguridad de IA porque demuestra que las defensas basadas en Representation Rerouting pueden ser neutralizadas con una técnica de bajo coste computacional, lo que permite estudiar la robustez de los mecanismos de seguridad y reproducir ataques de abliteración. Con 7.241.732.096 parámetros (7,24 B), arquitectura transformer decoder y licencia Apache-2.0, se publica como un reemplazo directo del checkpoint original de GraySwan, con una divergencia KL de solo 0,042 respecto al modelo base, lo que indica una degradación mínima de las capacidades generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Mistral 7B) |
| Parametros totales | 7.241.732.096 (7,24 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredada del modelo base Mistral-7B-Instruct-v0.2) |
| Tipos de cuantizacion | No disponible (el repositorio contiene pesos en safetensors, presumiblemente BF16) |
| Idiomas soportados | Ingles, chino (en, zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Mistral-7B-Instruct-v0.2, un transformer decoder denso con 7,24 B parámetros, atención de ventana deslizante y normalización RMSNorm. El checkpoint original de GraySwanAI incorporaba un mecanismo de Circuit Breakers entrenado con una pérdida de Representation Engineering que detecta estados ocultos dañinos y los redirige a un atractor de seguridad antes de la generación. Wu identificó que este mecanismo se implementaba como un delta LoRA de rango 16 sobre los pesos base.

El proceso de abliteración consta de dos etapas: primero se elimina por completo el delta LoRA (λ=0.0) mediante un script de diagnóstico SVD, y después se aplica una abliteración en modo directo de una sola dirección, con 60 ensayos y selección del mejor candidato (trial 39). Los parámetros óptimos fueron `vector_method=mean`, `n_directions=1`, `steering_mode=direct`, `decay_kernel=linear` y `strength_range=[1.5, 6.0]`. No se realizó ningún fine-tuning ni actualización de gradientes; la intervención es puramente en el espacio de representaciones. La versión v2 de este release reduce la divergencia KL de 0,98 a 0,042 respecto al modelo base, lo que minimiza la degradación de capacidades generales.

## Capacidades

- Generacion de texto y conversacion multilingue (ingles y chino) con el mismo comportamiento que Mistral-7B-Instruct-v0.2.
- Razonamiento y respuesta a instrucciones en formato chat, usando la plantilla de Mistral v0.2 (sin rol de sistema).
- Capacidad de generar contenido que el modelo original rechazaria, incluyendo instrucciones para actividades ilegales o peligrosas (por ejemplo, sintesis de metanfetamina, montaje de bombas, keyloggers, ataques WiFi, falsificacion de documentos).
- No se documentan capacidades de tool calling, agentes, vision ni audio.
- La abliteracion no anade nuevas capacidades; solo elimina el mecanismo de rechazo de seguridad.

## Casos de uso

- Investigacion en seguridad de IA: evaluar la robustez de defensas basadas en Circuit Breakers y Representation Rerouting frente a ataques de abliteracion.
- Reproducibilidad de ataques: verificar los resultados publicados sobre la eliminacion de mecanismos de seguridad en modelos open source.
- Estudio de representaciones internas: analizar como se codifican los conceptos de seguridad y peligro en los estados ocultos de un transformer.
- Red-teaming de modelos: generar prompts adversarios y medir la tasa de exito de ataques (ASR) en un entorno controlado.
- Comparacion de comportamiento: contrastar las respuestas de este modelo con las del checkpoint original para cuantificar el impacto de la defensa.
- Desarrollo de contramedidas: probar nuevas tecnicas de blindaje que resistan la abliteracion, usando este modelo como caso de estudio.

## Benchmarks y rendimiento

La model card no incluye benchmarks estandar (MMLU, HumanEval, GSM8K), pero si reporta metricas especificas de la evaluacion de seguridad:

| Metrica | Valor |
|---|---|
| Tasa de rechazo base (100 prompts dañinos, juez LLM) | 69 / 100 |
| Tasa de rechazo de este modelo | 12 / 100 |
| Attack Success Rate (ASR) | 88 % |
| Divergencia KL vs modelo base | 0,042 |
| Hardcore 15 (10 EN + 5 CN) | 15 / 15 compliant |
| Tiempo total de ataque | ~70 min en una RTX A6000 |

No se han publicado resultados de benchmarks de capacidad general en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: ~14,5 GB (7,24 B parametros × 2 bytes). Con cuantizacion a 8 bits (~7,3 GB) o 4 bits (~3,6 GB) cabria en GPUs de consumo como RTX 3060 o superiores, aunque no se proporcionan cuantizaciones oficiales.
- GPU recomendada: al menos 16 GB de VRAM para BF16 sin cuantizar (por ejemplo, RTX 4080, A100, RTX A6000). El ejemplo de uso emplea `device_map="auto"` con bfloat16.
- Opciones de despliegue: compatible con transformers, vLLM, Text Generation Inference (TGI) y llama.cpp (si se generan pesos GGUF). No se incluyen archivos GGUF en este repositorio, pero existen derivados de terceros.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Seguridad | Notas |
|---|---|---|---|---|---|
| wangzhang/Mistral-7B-Instruct-RR-Abliterated | 7,24 B | No disponible | Apache-2.0 | Rechazo eliminado (12/100) | Derivado de GraySwan con abliteracion |
| GraySwanAI/Mistral-7B-Instruct-RR | 7,24 B | No disponible | Apache-2.0 | Rechazo alto (69/100) | Incluye Circuit Breakers |
| mistralai/Mistral-7B-Instruct-v0.2 | 7,24 B | 32k (segun docs de Mistral) | Apache-2.0 | Rechazo moderado | Modelo base original |

La comparativa se limita a los modelos directamente relacionados; no se dispone de datos de otros modelos abliterados de la misma familia.

## Limitaciones y advertencias

- El modelo puede generar contenido peligroso, ilegal o eticamente cuestionable sin restricciones. El autor advierte explicitamente que el usuario es responsable de cualquier salida generada.
- La abliteracion puede degradar ligeramente las capacidades generales, aunque la KL de 0,042 sugiere un impacto minimo en tareas estandar.
- No se han evaluado sesgos ni alucinaciones especificos de este modelo; hereda los del Mistral-7B-Instruct-v0.2 subyacente.
- La plantilla de chat de Mistral v0.2 no soporta rol de sistema, lo que limita ciertos usos conversacionales.
- La licencia Apache-2.0 permite uso comercial, pero el autor declara que el modelo se publica exclusivamente para investigacion de seguridad y red-teaming.
- No se garantiza la calidad de las respuestas en tareas de proposito general; el modelo esta optimizado para el estudio de mecanismos de seguridad, no para produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/wangzhang/Mistral-7B-Instruct-RR-Abliterated
- Modelo base con defensa: https://huggingface.co/GraySwanAI/Mistral-7B-Instruct-RR
- Modelo base original: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Herramienta abliterix: https://github.com/wuwangzhang1216/abliterix
- Paper de Circuit Breakers: https://arxiv.org/abs/2406.04313
- Documentacion de Mistral 7B v0.2: https://docs.mistral.ai/models/mistral-7b-0-2
