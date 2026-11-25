# yuhuanstudio/Yunmo-Next-1B-Instruct-bnb-4bit

## Resumen

Yunmo-Next-1B-Instruct-bnb-4bit es la versión cuantizada a 4 bits (NF4 con doble cuantización, vía bitsandbytes) de Yunmo-Next-1B-Instruct, un modelo de lenguaje de 1.008.058.216 parámetros desarrollado por YuhuanStudio y orientado prioritariamente al chino tradicional. El modelo base se entrenó desde cero sobre 19.760 millones de tokens y posteriormente recibió ajuste por instrucciones. Esta variante cuantizada reduce el peso en memoria de GPU de 2,02 GB (BF16) a 0,62 GB, a costa de un incremento de latencia de decodificación de 11,2 ms/token a 138,8 ms/token en una RTX 4070 Ti.

La relevancia técnica del modelo reside en su arquitectura híbrida, que combina Kimi Delta Attention con atención de consultas agrupadas (GQA), una combinación poco habitual en modelos de este tamaño. El repositorio se publica como checkpoint de investigación: el propio autor advierte que el modelo está a nivel de azar en preguntas de opción múltiple sobre conocimiento, comete errores factuales con frecuencia, puede repetirse hasta agotar el límite de tokens y no ha recibido ajuste de seguridad.

Esta ficha cubre exclusivamente los pesos cuantizados. Los detalles de entrenamiento, evaluación y limitaciones completas se documentan en el repositorio del modelo en precisión completa, Yunmo-Next-1B-Instruct. La licencia declarada es Apache-2.0, aunque las fuentes de ajuste fino imponen condiciones adicionales que restringen el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: Kimi Delta Attention + atención de consultas agrupadas (GQA) |
| Parametros totales | 1.008.058.216 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NF4 con doble cuantización y cómputo en BF16 (bitsandbytes); el modelo base ofrece además BF16, INT8, FP8 y NVFP4 |
| Idiomas soportados | chino (con etiqueta específica `traditional-chinese`) e inglés |
| Licencia | Apache-2.0 (con condiciones adicionales en las fuentes de ajuste fino) |
| Formato de pesos | safetensors, cuantización bitsandbytes 4-bit, requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer híbrida que integra Kimi Delta Attention junto con atención de consultas agrupadas. El entrenamiento se realizó desde cero (pretraining from scratch) sobre 19.760 millones de tokens, seguido de una fase de ajuste por instrucciones. La model card no detalla la composición exacta del corpus de preentrenamiento ni si se aplicaron técnicas de RLHF o DPO; únicamente menciona las fuentes del ajuste fino, entre las que figuran destilaciones de AM-Thinking-v1 y AM-DeepSeek-R1, el conjunto tw-instruct-500k, no_robots y subconjuntos de las trazas FABLE.5.

La cuantización afecta a 645 de 645 capas lineales. Se mantienen en BF16 la capa de embedding/output atada, las normalizaciones, las convoluciones y el router. El repositorio incluye el código del modelo, el tokenizador y la plantilla de chat del modelo en precisión completa, e incorpora un decodificador con grafos CUDA para los formatos que lo soportan (bitsandbytes ejecuta el bucle eager y no se beneficia de él). El token de parada de la plantilla de chat es `<|return|>`.

## Capacidades

- Generación de texto conversacional en chino tradicional e inglés, con plantilla de chat integrada.
- Ajuste por instrucciones para diálogo multi-turno.
- Razonamiento básico derivado de las destilaciones de AM-Thinking-v1 y AM-DeepSeek-R1 empleadas en el ajuste fino (sin garantía de calidad, según las advertencias del autor).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre arquitecturas híbridas de atención: el modelo permite experimentar con Kimi Delta Attention combinada con GQA en un tamaño de 1B parámetros y en un entorno de 0,62 GB de VRAM, lo que facilita reproducir experimentos en una única GPU de consumo.
- Evaluación de técnicas de cuantización: al existir versiones BF16, INT8, FP8, NVFP4 y bnb-4bit del mismo modelo con métricas de bits por byte publicadas, sirve como banco de pruebas controlado para medir la degradación de calidad por formato.
- Generación de texto en chino tradicional para prototipos: el modelo está orientado a este idioma y puede emplearse en pruebas de concepto de asistentes conversacionales en zh, siempre con revisión humana por su tasa de error factual.
- Despliegue en hardware muy limitado: con 0,62 GB de pesos en GPU, cabe en tarjetas de gama baja compatibles con bitsandbytes y flash-linear-attention, útil para entornos de demostración o docencia.
- Estudio de sesgos y comportamiento de modelos pequeños sin ajuste de seguridad: el checkpoint permite analizar modos de fallo como repetición hasta el límite de tokens o respuestas incorrectas en preguntas de conocimiento.
- Fines educativos sobre pipelines de transformers: el repositorio incluye código, tokenizador y plantilla de chat, lo que facilita ejemplos didácticos de carga con `trust_remote_code` y cuantización con bitsandbytes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de conocimiento o razonamiento (MMLU, HumanEval, GSM8K) en la información disponible. El autor indica que el modelo está a nivel de azar en preguntas de opción múltiple sobre conocimiento. Sí se publican métricas de calidad de cuantización y latencia:

| Pesos | Repositorio | Memoria en GPU | Bits por byte (menor es mejor) | Delta vs BF16 | ms/token |
|---|---|---:|---:|---:|---:|
| BF16 | Yunmo-Next-1B-Instruct | 2,02 GB | 0,9302 | — | 11,2 |
| INT8 | Yunmo-Next-1B-Instruct-INT8 | 1,08 GB | 0,9304 | +0,0002 | 13,6 |
| FP8 | Yunmo-Next-1B-Instruct-FP8 | 1,08 GB | 0,9313 | +0,0011 | 16,2 |
| NVFP4 | Yunmo-Next-1B-Instruct-NVFP4 | 0,67 GB | 0,9397 | +0,0095 | 107,8 |
| bnb-4bit | Yunmo-Next-1B-Instruct-bnb-4bit | 0,62 GB | 0,9390 | +0,0088 | 138,8 |

Las métricas de bits por byte se calcularon sobre 3.754 artículos de Wikipedia en chino creados después del 1 de octubre de 2026 (primeros 2.000 caracteres de cada uno), con independencia del tokenizador. La latencia se midió por token con 1.024 tokens de contexto, batch 1, en una RTX 4070 Ti; la cifra BF16 corresponde al modelo Base, de arquitectura y tamaño idénticos.

## Requisitos de hardware

- VRAM estimada para inferencia: 0,62 GB de pesos en GPU para esta variante bnb-4bit; 2,02 GB en BF16.
- GPU recomendadas: cualquier GPU NVIDIA soportada por bitsandbytes y flash-linear-attention; el autor validó en una RTX 4070 Ti.
- Cabe en GPU de consumo: sí, con 0,62 GB de pesos es viable en tarjetas de gama media y baja compatibles con bitsandbytes.
- Opciones de despliegue: transformers (>=5.14, <6) con `trust_remote_code=True`, bitsandbytes, accelerate y flash-linear-attention 0.5.2. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: 138,8 ms por token en RTX 4070 Ti con 1.024 tokens de contexto y batch 1; el autor advierte que en esa GPU todos los formatos cuantizados decodifican más lentamente que BF16, por lo que esta variante debe usarse para ahorrar memoria, no para ganar velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yunmo-Next-1B-Instruct-bnb-4bit | 1,008 B | no disponible | bnb-4bit (NF4) | Apache-2.0 con condiciones adicionales | Hugging Face |
| Yunmo-Next-1B-Instruct (BF16) | 1,008 B | no disponible | BF16 | Apache-2.0 con condiciones adicionales | Hugging Face |
| Yunmo-Next-1B-Instruct-INT8 | 1,008 B | no disponible | INT8 | Apache-2.0 con condiciones adicionales | Hugging Face |
| Yunmo-Next-1B-Instruct-FP8 | 1,008 B | no disponible | FP8 | Apache-2.0 con condiciones adicionales | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar el rendimiento con modelos de terceros de tamaño similar; la comparativa se limita a las variantes del mismo modelo publicadas por el autor.

## Limitaciones y advertencias

- Checkpoint de investigación: el autor lo describe explícitamente como tal y desaconseja su uso sin leer las limitaciones del modelo en precisión completa.
- Conocimiento factual: el modelo está a nivel de azar en preguntas de opción múltiple sobre conocimiento y comete errores factuales con frecuencia.
- Repetición degenerativa: puede repetir texto hasta alcanzar el límite de tokens.
- Sin ajuste de seguridad: no se aplicaron técnicas de alineación de seguridad, por lo que puede generar contenido inapropiado.
- Licencia: los pesos son Apache-2.0, pero algunas fuentes de ajuste fino imponen condiciones propias: las destilaciones de AM-Thinking-v1 y AM-DeepSeek-R1 son solo para investigación; tw-instruct-500k es CC BY-NC-SA 4.0; no_robots es CC BY-NC 4.0; y algunos subconjuntos de las trazas FABLE.5 son AGPL-3.0. Es necesario revisar las secciones Data y License del modelo base antes de cualquier uso comercial.
- Idiomas: cobertura limitada a chino (con foco en tradicional) e inglés; no se documenta soporte de otros idiomas.
- Longitud de contexto: no documentada en la información disponible.
- Rendimiento: la cuantización bnb-4bit multiplica por más de diez la latencia por token frente a BF16 en la GPU de referencia (138,8 frente a 11,2 ms/token).
- Ejecución: requiere `trust_remote_code=True` y versiones específicas de transformers y flash-linear-attention, lo que añade riesgo de incompatibilidad en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yuhuanstudio/Yunmo-Next-1B-Instruct-bnb-4bit
- Modelo base en precisión completa: https://huggingface.co/yuhuanstudio/Yunmo-Next-1B-Instruct
- Versión INT8: https://huggingface.co/yuhuanstudio/Yunmo-Next-1B-Instruct-INT8
- Versión FP8: https://huggingface.co/yuhuanstudio/Yunmo-Next-1B-Instruct-FP8
- Versión NVFP4: https://huggingface.co/yuhuanstudio/Yunmo-Next-1B-Instruct-NVFP4
- Informe de evaluación: https://github.com/YuhuanStudio/Yunmo-Next-1B/blob/main/reports/evaluation.md#6-quantized-weights
- Repositorio en GitHub: https://github.com/YuhuanStudio/Yunmo-Next-1B
