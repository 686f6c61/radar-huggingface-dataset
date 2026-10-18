# zack-r-s/LFM2.5-230M-hackring-v001

## Resumen

LFM2.5-230M-hackring-v001 es un checkpoint experimental publicado por zack-r-s a partir de LiquidAI/LFM2.5-230M. Se trata de una fusión de pesos completos tras un ajuste fino con LoRA sobre el dataset Hackring PyAT control v002, pensado para inferencia directa con la plantilla de chat y la sintaxis de herramientas de LFM2.5. El modelo tiene 229.693.184 parámetros y el repositorio ocupa 0,5 GB.

El modelo no es un asistente generalista: está orientado a un entorno simulado de control de un anillo PV de 24 elementos, con herramientas channel_read y channel_write. Su evaluación se limita a un conjunto congelado de 8 tareas PyAT, donde el modelo base pasó 1/8 y este checkpoint pasó 2/8. Las dos tareas de escritura exacta pasaron, pero las tareas de lectura/comparación fallaron y las cuatro correcciones de órbita aceptadas aumentaron el RMS objetivo medido.

Su relevancia es acotada y experimental: sirve para probar pipelines de tool calling, plantillas de chat y flujos de evaluación sobre datos simulados, no para control autónomo real. El autor advierte explícitamente que no debe confiarse en él para corregir una órbita de forma autónoma.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LFM2.5 (modelo base LiquidAI/LFM2.5-230M); no se detalla la arquitectura interna en la información disponible |
| Parámetros totales | 229.693.184 (≈229,7 M) |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | 3.072 tokens (máximo usado en el entrenamiento LoRA; ventana nativa del modelo base no disponible) |
| Tipos de cuantización | No disponible (solo se documenta checkpoint en safetensors; no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | lfm1.0 (LFM Open License v1.0; license other) |
| Formato de pesos | safetensors (transformers) |
| Modelo base | LiquidAI/LFM2.5-230M |
| Dataset de ajuste | zack-r-s/hackring-pyat-control (v002) |
| Tamaño del repositorio | 0,5 GB |
| Hash del checkpoint | SHA-256 f38487d028a61c079e871d2923b2729afac6eaedee35dce67b6199b5a54187d0 |

## Arquitectura y entrenamiento

La información proporcionada no detalla si el modelo base emplea una arquitectura transformer, MoE, SSM o híbrida. Se sabe que este repositorio contiene un checkpoint fusionado de pesos completos, obtenido tras un ajuste fino con LoRA sobre LiquidAI/LFM2.5-230M y preparado para inferencia directa con transformers y la plantilla de chat de LFM2.5.

El ajuste se realizó con Liquid Finetune en el commit d9cc23dae5a16498ab7dc11958b80ca803e0440a, sobre un Apple M4 Pro con MPS. Se entrenaron 2 épocas y 216 pasos de optimizador, con LoRA, longitud máxima de 3.072 tokens, learning rate de 1e-4 y pérdida calculada solo en los turnos del asistente. El split fue de 864 conversaciones de entrenamiento, 144 de validación y 144 de test. La pérdida de validación fue 0,0837 tras la primera época y 0,0806 tras la segunda. No se menciona RLHF ni DPO en la información disponible.

## Capacidades

- Generación de texto conversacional con la plantilla de chat de LFM2.5.
- Tool calling y function calling con la sintaxis de herramientas de LFM2.5.
- Uso de las herramientas channel_read y channel_write, que debe proporcionar y ejecutar el cliente de servicio.
- Generación de llamadas exact-write estructuradas: el smoke test mencionado con vLLM Metal produjo una llamada de herramienta correctamente estructurada.
- Capacidad de agente multi-step: no demostrada; las tareas de lectura/comparación fallaron en la evaluación congelada.
- Control de un anillo PV simulado: solo experimental y con advertencias explícitas; no se debe usar para corrección autónoma de órbitas.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión, audio o modo thinking: no documentados.

## Casos de uso

- Pruebas de integración de tool calling en un simulador PV: usar el checkpoint para validar el esquema channel_read/channel_write y el parser de llamadas antes de conectar un executor. Es adecuado porque genera llamadas exact-write estructuradas, pero no debe emplearse para corregir la órbita real.
- Banco de pruebas de la plantilla de chat LFM2.5: servir el modelo con transformers o vLLM y comprobar que el cliente aplica correctamente la plantilla y la sintaxis de herramientas. El repositorio está empaquetado para inferencia directa.
- Evaluación de pipelines de datos simulados: comparar este checkpoint con el modelo base en el conjunto de 8 tareas PyAT para medir el efecto del ajuste LoRA. Es útil en investigación sobre datasets sintéticos y evaluación de modelos pequeños.
- Reproducción de experimentos de ajuste fino eficiente: replicar la configuración LoRA documentada, con longitud máxima de 3.072, learning rate de 1e-4 y 2 épocas, en un Apple M4 Pro con MPS. El repositorio conserva training_job.yaml y training_results.json.
- Desarrollo local sin GPU dedicada: ejecutar un modelo de 229,7 M parámetros en un portátil para iterar en prompts y formatos de herramientas. El repositorio ocupa 0,5 GB y los pesos caben en CPU o en GPUs de consumo.
- Generación de casos de prueba para el executor del simulador: usar las llamadas exact-write aceptadas como ejemplos de formato para pruebas de regresión. No deben usarse las correcciones de órbita aceptadas como ground truth, porque aumentaron el RMS objetivo.
- Investigación sobre límites de modelos pequeños en control: estudiar por qué fallan las tareas de lectura/comparación y documentar la brecha entre escribir comandos exactos y razonar sobre el estado del simulador.

## Benchmarks y rendimiento

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible. La única evaluación documentada es la evaluación congelada de PyAT sobre 8 tareas.

| Evaluación | Modelo base | Este checkpoint | Observaciones |
|---|---:|---:|---|
| PyAT frozen, 8 tareas | 1/8 | 2/8 | Evaluación congelada sobre el anillo PV simulado |
| Tareas exact-write | No disponible | 2/2 | Ambas tareas de escritura exacta pasaron |
| Tareas de lectura/comparación | No disponible | Fallaron | No se especifica el número exacto |
| Correcciones de órbita aceptadas | No disponible | 4/4 aceptadas | Las cuatro aumentaron el RMS objetivo medido |
| MMLU, HumanEval, GSM8K | No disponible | No disponible | No hay datos en la información proporcionada |

## Requisitos de hardware

- VRAM estimada solo para pesos: aproximadamente 0,46 GB en fp16, 0,23 GB en int8 y 0,12 GB en int4. Son estimaciones teóricas; no se publican variantes cuantizadas oficiales.
- VRAM recomendada para inferencia en fp16: reservar 1-2 GB para pesos, overhead del runtime y caché KV con contexto de 3.072 tokens.
- GPU recomendadas: cualquier GPU de consumo con al menos 4 GB de VRAM, como RTX 3060 o RTX 4060. También es viable en CPU y en Apple Silicon con MPS; el entrenamiento documentado usó un Apple M4 Pro.
- No requiere A100 ni H100 para inferencia.
- Opciones de despliegue: transformers; vLLM, con un smoke test mencionado en Metal; llama.cpp u Ollama requerirían una conversión a GGUF no publicada; TGI no está confirmado en la información disponible.
- Latencia y throughput: no disponibles. No se han publicado mediciones de rendimiento en la información proporcionada.

## Comparativa con modelos similares

No se han identificado alternativas comparables en la información disponible. La comparación directa posible es con el modelo base del que deriva este checkpoint.

| Modelo | Parámetros | Contexto | Licencia | PyAT frozen | Disponibilidad |
|---|---:|---|---|---:|---|
| LFM2.5-230M-hackring-v001 | 229,7 M | 3.072 tokens (entrenamiento) | lfm1.0 | 2/8 | HuggingFace |
| LiquidAI/LFM2.5-230M | ≈230 M según denominación del modelo base | No disponible | lfm1.0 | 1/8 | HuggingFace |
| Otras alternativas pequeñas de tool calling | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Modelo experimental: el autor indica que no debe confiarse en él para corregir una órbita de forma autónoma.
- Las cuatro correcciones de órbita aceptadas aumentaron el RMS objetivo medido; no son un control válido para producción.
- Las tareas de lectura/comparación fallaron en la evaluación congelada. Solo pasó 2 de 8 tareas, frente a 1 de 8 del modelo base.
- Requiere la plantilla de chat y la sintaxis de herramientas de LFM2.5. El cliente debe proporcionar las definiciones de channel_read y channel_write y ejecutarlas contra el simulador.
- El checkpoint no incluye una planta viva ni un servidor de herramientas; descargar el modelo no proporciona un entorno operativo completo.
- No se documentan idiomas soportados, sesgos, evaluaciones de seguridad ni tasas de alucinación.
- La licencia es LFM Open License v1.0; el uso comercial y la redistribución quedan sujetos a sus términos, que deben consultarse en LICENSE.
- No se publican formatos cuantizados ni variantes GGUF. Cualquier conversión para llama.cpp u Ollama sería externa y no está validada por el autor.
- El ajuste se realizó sobre datos simulados y la pérdida de validación no demuestra rendimiento en un entorno real.
- El modelo tiene 229,7 M parámetros; su capacidad de razonamiento y de generalización es limitada en comparación con modelos de mayor tamaño.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/zack-r-s/LFM2.5-230M-hackring-v001)
- [Modelo base LiquidAI/LFM2.5-230M](https://huggingface.co/LiquidAI/LFM2.5-230M)
- [Dataset Hackring PyAT control v002](https://huggingface.co/datasets/zack-r-s/hackring-pyat-control/tree/v002)
- [Repositorio de entrenamiento en GitHub](https://github.com/zack-r-s/nvidia-redhat-small-models/tree/zrs-lfm-training)
- [Licencia LFM Open License v1.0](https://huggingface.co/zack-r-s/LFM2.5-230M-hackring-v001/blob/main/LICENSE)
- [Informe de evaluación PyAT](https://huggingface.co/zack-r-s/LFM2.5-230M-hackring-v001/blob/main/pyat_eval_report.json)

No se han encontrado papers, blogs o demos adicionales relevantes en la búsqueda web proporcionada.
