# zabibutechnika/Fikra-Model-2-4B

## Resumen

Zabibu Fikra Model 2 - 4B (nombre interno `fikra-v2-e4`) es un modelo de lenguaje de 4.205.751.296 parámetros, ajustado por instrucciones, desarrollado por Zabibu Technika, con sede en Nairobi (Kenia). Se trata de un fine-tune especializado sobre `zabibutechnika/fikra-v2-e3`, que a su vez deriva del modelo base `Qwen/Qwen3.5-4B`. Su propósito es el despliegue privado, en dispositivo y con funcionamiento offline, con atención explícita al contexto panafricano y al uso de suajili e inglés con cambio de código.

El modelo se distribuye con licencia Apache 2.0, en formato safetensors (fp16, 8,43 GB) y también en GGUF (Q4_K_M y F16) a través de un repositorio separado. Está pensado para asistentes en el borde, entornos aislados (air-gapped) y aplicaciones que requieren privacidad sin llamadas a servicios externos durante la inferencia.

Su relevancia actual reside en que ofrece una alternativa de 4B parámetros con identidad y contexto africano verificados mediante una suite de evaluación propia de 115 casos, manteniendo las capacidades generales del modelo base Qwen. No obstante, no se han publicado resultados en benchmarks estándar amplios más allá de MMLU y HellaSwag con límites reducidos, y el propio autor advierte de que no reclama estar a la vanguardia ni ser el mejor modelo de África.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-4B; tag `qwen3_5_text`) |
| Parametros totales | 4.205.751.296 (4B) |
| Parametros activos | no disponible (no es MoE según la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (safetensors), GGUF Q4_K_M, GGUF F16 |
| Idiomas soportados | en, sw (inglés y suajili, con cambio de código) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer de 4B parámetros heredado de `Qwen/Qwen3.5-4B`, sobre el que se ha aplicado un ajuste fino por instrucciones en dos etapas: primero el checkpoint intermedio `fikra-v2-e3` y después `fikra-v2-e4`. El autor no detalla en la model card el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO; únicamente indica que el ajuste se realizó en Kenia con datos propios y una suite de evaluación de 115 casos que cubre identidad en suajili, datos de Kenia, revisión canary, cultura panafricana, gaming, fintech, salud y conocimiento local.

La innovación destacable no es arquitectónica sino de especialización: el modelo preserva la línea base de MMLU del Qwen original (según el autor, el fine-tune no degradó las capacidades generales) y añade comportamientos específicos medidos en su suite de lanzamiento. El autor reconoce explícitamente que la mayor parte de la mejora en MMLU frente a Fikra-Model-1-2B (+39,6 puntos) proviene del cambio de base (2B a 4B), no del entrenamiento Fikra, cuya contribución específica cifra en +2,6 puntos sobre el checkpoint e3.

## Capacidades

- Generación de texto conversacional en inglés y suajili, con soporte de cambio de código entre ambos idiomas.
- Identidad en suajili nativa: la suite interna reporta `identity_swahili` con 4/4 (100%) y `identity_direct` con 8/8 (100%).
- Protocolo UHI: 5/5 (100%) en la suite de evaluación del autor.
- Límites de seguridad (`safety_boundary`): 3/3 (100%) en la suite auto-verificada.
- Generación de formato largo (`longform`): 2/2 (100%).
- Tool calling / function calling: `tool_abi` 4/4 (100%) según la suite interna.
- Capacidad de razonamiento con etiquetas `<think>...</think>`, aunque el autor advierte de fugas ocasionales de estas etiquetas en la salida visible.
- Despliegue en dispositivo y offline: el prompt de sistema y el diseño de despliegue asumen ausencia de red durante la inferencia.
- No se documentan capacidades de visión, audio ni otros modos.

## Casos de uso

- Asistentes en dispositivo sin conexión: el modelo puede ejecutarse localmente con GGUF Q4_K_M en CPU o en GPUs de consumo, sin llamadas a servicios externos, lo que encaja en escenarios de privacidad estricta o redes aisladas.
- Atención al cliente en suajili e inglés con cambio de código: permite gestionar conversaciones multi-turno en ambos idiomas dentro de una misma sesión, útil para mercados de África Oriental donde el cambio de código es habitual.
- Personas y asistentes con identidad preservada: la suite `identity_direct` e `identity_swahili` al 100% lo hace adecuado para aplicaciones que requieren una persona coherente y culturalmente alineada.
- Automatización con tool calling: la puntuación `tool_abi` 4/4 permite integrarlo en flujos que invocan funciones externas (consultas a bases de datos locales, APIs internas) en entornos de borde.
- Procesamiento de conocimiento local y cultura panafricana: la suite de 115 casos cubre cultura, conocimiento local y datos de Kenia, por lo que puede emplearse en aplicaciones educativas o informativas de contexto regional.
- Aplicaciones de fintech y salud de ámbito local: la suite incluye categorías de fintech y salud, lo que respalda su uso en asistentes de orientación en estos dominios, siempre con revisión humana y sin sustituir sistemas de retrieval para datos especializados.
- Despliegue en air-gapped y borde: al no requerir red, puede integrarse en quioscos, dispositivos móviles o infraestructura industrial aislada con llama.cpp, Ollama o LM Studio.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| MMLU | 75,5% | lm-evaluation-harness 0.4.13, limit 10 muestras, fp16, 2×T4 (Kaggle) |
| HellaSwag | 68,0% | Mismas condiciones |
| Suite de lanzamiento Fikra (auto-verificada) | 105/115 (91,3%) | Suite propia de 115 casos |
| Parafrasis reservadas (held-out) | 9/10 (90,0%) | Sin señal de contaminación (p>0,05) |
| Checkpoint base e3 | 88,7% | Suite Fikra |

Comparativa declarada por el autor:

| Modelo | Parametros | MMLU | HellaSwag |
|---|---|---|---|
| fikra-v2-e4 | 4B | 75,5% | 68,0% |
| Qwen/Qwen3.5-4B | 4B | no ejecutado | no ejecutado |
| Qwen2.5-3B-Instruct | 3B | 68,8% | 40,0% |
| Fikra-Model-1-2B | 2B | 36,0% | 40,0% |
| Phi-3.5-mini-instruct | 3,8B | incompatible | incompatible |
| Llama-3.2-3B-Instruct | 3B | gated | gated |
| Gemma-2-2B-it | 2B | gated | gated |

Advertencia del autor: los resultados se obtuvieron con un límite de 10 muestras por tarea, por lo que no son directamente comparables con evaluaciones completas. El autor indica que no reclama estado del arte ni superioridad frente a otros modelos sin condiciones equivalentes.

## Requisitos de hardware

- VRAM estimada para fp16: aproximadamente 8,4 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 12-16 GB de VRAM para inferencia cómoda.
- GGUF Q4_K_M: reduce el peso a aproximadamente 2,5-3 GB, ejecutable en CPU y en GPUs de consumo con 4-6 GB de VRAM.
- GPU recomendadas: el autor reporta ejecuciones en 2×T4 (16 GB cada una) para benchmarks; para producción se puede usar una única GPU con 16 GB o más (RTX 4090, A100, H100) en fp16, o GPUs de consumo (RTX 3060 12 GB, RTX 4060 Ti 16 GB) con cuantización.
- Cabe en GPU de consumo: sí, especialmente con GGUF Q4_K_M; en fp16 requiere al menos 12 GB de VRAM.
- Opciones de despliegue: transformers (fp16), llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; no se mencionan vLLM ni TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zabibu Fikra Model 2 - 4B | 4B | no disponible | 75,5% (limit 10) | Apache 2.0 | Hugging Face (safetensors + GGUF) |
| Qwen/Qwen3.5-4B | 4B | no disponible | no ejecutado por el autor | ver licencia del base | Hugging Face |
| Qwen2.5-3B-Instruct | 3B | no disponible | 68,8% (limit 10) | Apache 2.0 | Hugging Face |
| Fikra-Model-1-2B | 2B | no disponible | 36,0% (limit 10) | no disponible | Hugging Face |
| Llama-3.2-3B-Instruct | 3B | no disponible | gated | Llama license | Hugging Face (gated) |
| Gemma-2-2B-it | 2B | no disponible | gated | Gemma license | Hugging Face (gated) |

La comparación con Phi-3.5-mini-instruct, Llama-3.2-3B-Instruct y Gemma-2-2B-it no está disponible porque el autor las marca como incompatibles o restringidas (gated). No se dispone de datos de contexto para ninguno de los modelos en la información proporcionada.

## Limitaciones y advertencias

- No existe un benchmark cruzado de suajili: el diferenciador principal del modelo no está medido por MMLU ni HellaSwag.
- Sin información en vivo: la actualidad del conocimiento está limitada a los datos de entrenamiento.
- Modelo de 4B: alucinará en dominios especializados; no sustituye a un sistema de retrieval.
- Fuga de etiquetas de razonamiento: puede emitir bloques `<think>...</think>` en la salida visible; es necesario eliminarlos en posprocesado.
- Sesgos heredados: los sesgos del modelo base Qwen/Qwen3.5-4B se mantienen y no han sido auditados por el autor.
- La cuantización Q4_K_M no fue reevaluada: se espera una pérdida de 1-3 puntos frente a fp16 en evaluaciones de formato corto; el GGUF F16 hereda exactamente las cifras de fp16.
- No ha sido sometido a red teaming externo.
- Los resultados de MMLU y HellaSwag usan un límite de 10 muestras por tarea, por lo que no son comparables con evaluaciones completas.
- El autor no reclama ser el primer modelo africano, ni haber construido el modelo base, ni ser el mejor de África, ni estado del arte.
- La licencia Apache 2.0 se aplica al fine-tune, pero la licencia del modelo base Qwen/Qwen3.5-4B debe verificarse por separado para uso comercial.

## Enlaces

- Modelo en Hugging Face (safetensors): https://huggingface.co/zabibutechnika/Fikra-Model-2-4B
- GGUF (Q4_K_M y F16): https://huggingface.co/zabibutechnika/Fikra-Model-2-4B-GGUF
- Checkpoint intermedio: https://huggingface.co/zabibutechnika/fikra-v2-e3 (referenciado como modelo base)
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-4B
