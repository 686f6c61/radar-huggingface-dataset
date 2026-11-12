# summerAIO/diffusion-lfm2.5-24b-a2b-blocktune

## Resumen

DLFM · BlockTune es un checkpoint experimental de investigación publicado por el usuario summerAIO en Hugging Face. Se trata de un derivado de difusión por bloques (block-diffusion) del modelo base `summerAIO/diffusion-lfm2.5-24b-a2b`, que a su vez deriva de la familia LFM2.5-24B-A2B de Liquid AI. El modelo incorpora una LoRA de atención de rango 8 (alpha 16) aplicada sobre las proyecciones q/k/v/out de las 10 capas de atención, fusionada en los pesos y empaquetada como checkpoint BF16 completo en 13 shards de Safetensors (aproximadamente 47,94 GB de pesos, 74,1 GB de repositorio).

La propuesta técnica es un sampler de difusión por bloques con prefijo causal y lienzo bidireccional: el modelo genera tokens en bloques de tamaño configurable (32, 1024, etc.) mediante un número fijo de pasos de denoising, en lugar de la decodificación autorregresiva token a token. Incluye selección best-of-N por lotes, controles de repetición y extracción opcional de prefijos de código. El backbone es un MoE híbrido convolución/atención derivado de LFM2.5-24B-A2B, con 23.971.585.280 parámetros totales.

Es relevante ahora porque explora una alternativa no autorregresiva a la generación de texto con un modelo de 24B, pero el propio autor lo etiqueta explícitamente como *research preview* y no como modelo de producción: la fusión BF16 no cumplió la tolerancia predeclarada de equivalencia de predicción, la configuración más rápida produce respuestas mayoritariamente incorrectas y ninguna configuración probada combinó la puerta de calidad con 1.000 tokens/s de retorno.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE híbrida convolución/atención derivada de LFM2.5-24B-A2B, con sampler de difusión por bloques (block-diffusion) |
| Parámetros totales | 23.971.585.280 |
| Parámetros activos | no disponible (el nombre "A2B" sugiere ~2B activos, pero no se confirma en la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 (pesos publicados); no se documentan otras cuantizaciones |
| Idiomas soportados | inglés (`en`) |
| Licencia | LFM Open License v1.0 (licencia de Liquid AI, Inc.; no es Apache-2.0 ni MIT) |
| Formato de pesos | Safetensors (13 shards, ~47,94 GB), BF16 con buffers FP32 heredados |
| Modelo base | summerAIO/diffusion-lfm2.5-24b-a2b (finetune) |
| Adaptación | LoRA rango 8, alpha 16, proyecciones q/k/v/out en las 10 capas de atención, fusionada |
| Dataset de ajuste | iamtarun/python_code_instructions_18k_alpaca |
| Hardware evaluado | H100 80GB (adaptación), A100 80GB (decodificación) |
| Temperatura evaluada | 0,9 |
| Estado | Experimental / research preview |

## Arquitectura y entrenamiento

El backbone es un transformer MoE híbrido que combina capas convolucionales y de atención, heredado directamente de LFM2.5-24B-A2B de Liquid AI. Sobre ese backbone, el autor aplica un paradigma de generación por difusión de bloques: en lugar de predecir el siguiente token de forma autorregresiva, el sampler mantiene un prefijo causal fijo y denoisa un lienzo bidireccional de tamaño de bloque configurable (por ejemplo, 32 o 1024 tokens) mediante un número fijo de pasos (16 en el preset `balanced`, 1 en el preset `throughput`). La adaptación se realizó con una LoRA de rango 8 y alpha 16 sobre las proyecciones q, k, v y out de las 10 capas de atención, posteriormente fusionada en los pesos BF16. El ajuste se hizo sobre el dataset `iamtarun/python_code_instructions_18k_alpaca`, orientado a instrucciones de código.

El release incluye el sampler de difusión, selección best-of-N por lotes, controles de repetición y configuración reproducible, además de resultados tanto positivos como negativos. La innovación principal es el propio esquema de decodificación por bloques con selección de candidatos basada en sintaxis, presencia del nombre de función solicitado en el prompt, verosimilitud del modelo y repetición (sin usar respuestas de referencia ni tests ocultos). Sin embargo, el autor documenta que la fusión BF16 no alcanzó la tolerancia de equivalencia de predicción predeclarada y que no se ha ejecutado una recarga end-to-end completa del checkpoint ensamblado; las comprobaciones de bytes y estructura se documentan por separado de las pruebas de carga del modelo.

## Capacidades

- Generación de texto mediante decodificación por difusión de bloques (no autorregresiva token a token).
- Generación de código: el ajuste se realizó sobre instrucciones de código en Python y el preset `balanced` incluye extracción opcional de prefijos de código.
- Selección best-of-N por lotes con criterios de sintaxis, coincidencia del nombre de función, verosimilitud y repetición.
- Controles de repetición y reparación (`repair=True`) en el runtime de selección.
- Sampler configurable: tamaño de bloque (32, 1024), número de pasos (1, 16), top-k (20, 50), best-of (4).
- Capacidad de generar ensayos largos (el preset `throughput` está pensado para prompts de 1.000+ palabras).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés declarado.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre decodificación no autorregresiva: el modelo sirve como banco de pruebas para estudiar difusión por bloques frente a generación autorregresiva en un backbone MoE de 24B, con sampler y métricas de throughput incluidas.
- Generación de fragmentos cortos de código Python en experimentos controlados: el preset `balanced` (block32 / 16 pasos / top-k20 / best-of4) está orientado a tareas pequeñas de código con selección de candidatos por sintaxis y nombre de función.
- Diagnóstico de throughput en GPUs de 80 GB: el preset `throughput` (block1024 / 1 paso / top-k50) permite medir tokens/s reales de un esquema de difusión por bloques, aunque el autor advierte que no es una recomendación de calidad.
- Estudio de fusión de LoRA en BF16: el checkpoint permite analizar la degradación introducida al fusionar una LoRA de rango 8 en un modelo de 24B, comparando contra el modelo base.
- Evaluación de estrategias best-of-N sin respuestas de referencia: el runtime `selection_runtime` implementa selección por sintaxis, verosimilitud y repetición, útil para investigar reranking en generación de código.
- Reproducción de resultados negativos: el release incluye configuraciones reproducibles y resultados tanto positivos como negativos, lo que lo hace útil para replicar y auditar las conclusiones del informe (`REPORT.md`).
- Prototipado de pipelines de generación de código con `transformers` y `uv`: el script `inference.py` y la API Python (`load_model`, `cfg`, `generate_selected`) permiten integrar el sampler en experimentos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor documenta métricas cualitativas y de throughput (por ejemplo, la afirmación de que ninguna configuración probada combinó la puerta de calidad con 1.000 tokens/s de retorno, y que la configuración más rápida produce respuestas mayoritariamente incorrectas), pero no se proporcionan cifras de MMLU, HumanEval, GSM8K ni similares en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: se requiere una GPU de clase 80 GB para el setup BF16 demostrado (pesos de ~47,94 GB en BF16 más buffers y overhead del sampler).
- GPU recomendadas: H100 80GB (usada para la adaptación) y A100 80GB (usada para la decodificación).
- ¿Cabe en GPU de consumo? No se documenta; con ~47,94 GB de pesos BF16 no cabe en GPUs de consumo de 24 GB o 48 GB sin cuantización, y no se publican cuantizaciones alternativas.
- Opciones de despliegue: script `inference.py` con `uv` (Python 3.11, entorno bloqueado), API Python vía `transformers` (`load_model`, `selection_runtime`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no se publican cifras concretas; el preset `throughput` imprime longitud de salida, tiempo transcurrido y throughput por stderr, pero los valores no se incluyen en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Paradigma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DLFM · BlockTune (este) | 23.971.585.280 | no disponible | Difusión por bloques, MoE híbrida | LFM Open License v1.0 | Hugging Face, research preview |
| summerAIO/diffusion-lfm2.5-24b-a2b (base) | no disponible | no disponible | Difusión sobre LFM2.5-24B-A2B | no disponible | Hugging Face |
| LFM2.5-24B-A2B (Liquid AI, upstream) | 24B (A2B) | no disponible | MoE híbrida autorregresiva | LFM Open License v1.0 | Hugging Face |

No se dispone de datos de rendimiento comparativos en la información proporcionada para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El propio autor lo etiqueta como *research preview* y advierte explícitamente que no es un modelo de código de calidad de producción.
- La fusión BF16 no cumplió la tolerancia predeclarada de equivalencia de predicción.
- La configuración de decodificación más rápida produce respuestas mayoritariamente incorrectas.
- Ninguna configuración probada combinó la puerta de calidad con 1.000 tokens/s de retorno.
- No se ha ejecutado una recarga end-to-end completa del checkpoint ensamblado; las comprobaciones de bytes y estructura se documentan por separado de las pruebas de carga.
- Solo se declara inglés; no hay soporte multilingüe documentado.
- Riesgo de alucinación: no cuantificado en la información disponible, pero el propio diseño best-of-N sin respuestas de referencia ni tests ocultos implica que la selección no garantiza corrección funcional.
- Licencia: LFM Open License v1.0, no Apache-2.0 ni MIT. Incluye un umbral de ingresos anuales de 10.000.000 USD para uso comercial (Sección 5) y una excepción para organizaciones sin ánimo de lucro cualificadas; la redistribución debe conservar la licencia, los avisos aplicables e identificar los archivos modificados.
- El modelo es un derivado de LFM2.5-24B-A2B de Liquid AI y sigue sujeto a los términos upstream del modelo y de los datos.
- Sin datos de benchmarks públicos ni de rendimiento cuantitativo, lo que impide evaluar su calidad frente a alternativas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; ecosistema de validación externa inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/summerAIO/diffusion-lfm2.5-24b-a2b-blocktune
- Modelo base: https://huggingface.co/summerAIO/diffusion-lfm2.5-24b-a2b
- Licencia (LFM Open License v1.0): https://huggingface.co/summerAIO/diffusion-lfm2.5-24b-a2b-blocktune/blob/main/LICENSE
- Aviso de modificaciones (NOTICE): https://huggingface.co/summerAIO/diffusion-lfm2.5-24b-a2b-blocktune/blob/main/NOTICE
- Dataset de ajuste: https://huggingface.co/datasets/iamtarun/python_code_instructions_18k_alpaca
- Informe de investigación: `REPORT.md` en el repositorio del modelo (no se dispone de URL directa en la información proporcionada)
