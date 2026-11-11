# Soulfate24/LFM3-Omni-2B-Paretrix-GGUF

## Resumen

LFM3-Omni-2B-Paretrix-GGUF es una cuantización GGUF del modelo multimodal LiquidAI/LFM3-Omni-2B, publicada por el usuario Soulfate24 bajo el paraguas de su suite Paretrix. El modelo base es un transformer "any-to-any" de Liquid AI que procesa texto, audio e imagen, orientado a despliegue en el borde (edge) y a conversación speech-to-speech. Esta variante no altera la arquitectura: su valor está en el esquema de cuantización híbrida, que asigna tipos distintos a cada clase de tensor según mediciones empíricas de perplejidad y divergencia KL frente a los logits en BF16.

El modelo base declara 1.728.801.600 parámetros reales en safetensors y un pipeline `any-to-any` con soporte para 23 idiomas. La ficha del repositorio cuantizado no documenta la longitud de contexto ni los detalles del entrenamiento original, por lo que esos datos se marcan como no disponibles. El interés actual de esta publicación es práctico: ofrece doce "escalones" de cuantización con métricas de degradación publicadas, lo que permite elegir un compromiso tamaño/calidad con evidencia medida en lugar de estimaciones.

La relevancia para desarrolladores es doble. Por un lado, permite ejecutar un modelo omni de ~1,7B parámetros en hardware modesto mediante llama.cpp. Por otro, el enfoque Paretrix documenta explícitamente el coste de cada recorte (ΔPPL, KLD, RMS Δp, top-p), algo poco habitual en cuantizaciones comunitarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (texto, audio, vision); detalles internos no disponibles |
| Parametros totales | 1.728.801.600 (dato real en safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q8_0, Q6_K, Q5_K_M, IQ4_XS, IQ3_M y variantes híbridas Paretrix (Fidelity-48pc, Precision-42pc, Quality-36pc, Compact-33pc, Mini-30pc, Nano-27pc, Pico-24pc, Femto-21pc) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl, da, el, fi, he, nl, sv, tr (23 idiomas) |
| Licencia | lfm1.0 (license: other) |
| Formato de pesos | GGUF (repo de 9,6 GB); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base LFM3-Omni-2B es un transformer de Liquid AI con pipeline `any-to-any`, lo que implica entradas y salidas multimodales (texto, audio e imagen) y capacidades de speech-to-speech. La información disponible no detalla la composición del dataset, el número de tokens de entrenamiento ni si hubo fases de RLHF o DPO. Tampoco se especifica si emplea atención lineal u otras variantes propias de la familia LFM; el tag `custom_code` sugiere implementaciones no estándar en transformers.

La innovación de esta publicación concreta es el esquema Paretrix: una cuantización que, en lugar de aplicar un único bitwidth a toda la red, mueve cada clase de tensor de forma aislada a cada tipo disponible y mide el efecto frente a los logits en BF16. A partir de esas celdas, un problema de knapsack exacto planifica cada escalón, y un "duelo" en el régimen de veredicto (contexto 4096×8) decide si el plan sustituye al campeón previo. Se usan tres bases de referencia (Q8_0, Q6_K-imx e IQ4_XS-imx) y matrices de importancia (imatrix). Las mediciones se realizaron con llama.cpp build 12283.

## Capacidades

- Generación de texto y conversación multi-turno.
- Procesamiento de audio: entrada y salida de voz (speech-to-speech).
- Procesamiento de imagen (vision), según el pipeline `any-to-any` y los tags del modelo base.
- Capacidades multilingües en 23 idiomas, incluido el español.
- Orientación a despliegue en el borde (edge) por su tamaño de ~1,7B parámetros.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Modo "thinking", audio nativo adicional o cualquier capacidad especial: no disponible.

## Casos de uso

- Asistentes de voz en el dispositivo: el modelo puede gestionar speech-to-speech sin depender de la nube, lo que resulta adecuado para aplicaciones de asistente personal en móvil o hardware embebido con recursos limitados.
- Transcripción y respuesta hablada en atención al cliente: con entrada de audio y salida de voz, permite construir agentes telefónicos o de mostrador que responden en el idioma del usuario entre los 23 soportados.
- Descripción de imágenes para accesibilidad: el pipeline any-to-any con visión permite generar descripciones textuales de imágenes en aplicaciones de lectura asistida.
- Traducción multimodal: al combinar texto, audio e imagen y 23 idiomas, se puede usar para subtitulado o interpretación en escenarios con contenido mixto.
- Prototipado e investigación en multimodalidad: los doce escalones GGUF con métricas publicadas permiten estudiar el impacto de la cuantización en tareas omni sin entrenar desde cero.
- Despliegue en hardware de consumo: las variantes Compact-33pc (1120 MiB) y Mini-30pc (1021 MiB) caben en GPUs de gama media y en CPU con llama.cpp, lo que facilita demos y pruebas locales.
- Filtrado y moderación de contenido multimedia: la combinación de audio, imagen y texto permite clasificar contenido en pipelines de moderación, siempre que se valide el comportamiento en producción.

## Benchmarks y rendimiento

La model card publica métricas de cuantización (perplejidad, divergencia KL, RMS Δp y top-p) frente a BF16, no benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.).

| Modelo | MiB | PPL | ΔPPL | KLD | RMS Δp | top-p |
|---|---:|---:|---:|---:|---:|---:|
| Q8_0 (stock) | 1761 | 12,8832 | +0,0242 | 0,0011 | 0,85% | 98,2% |
| Fidelity-48pc | 1594 | 12,8958 | +0,0368 | 0,0016 | 1,02% | 98,0% |
| Precision-42pc = Q6_K-imx (stock) | 1362 | 12,8545 | −0,0045 | 0,0035 | 1,55% | 96,9% |
| Quality-36pc | 1220 | 12,9202 | +0,0612 | 0,0068 | 2,17% | 95,6% |
| Q5_K_M-imx (stock) | 1200 | 12,8725 | +0,0135 | 0,0086 | 2,40% | 95,1% |
| Compact-33pc | 1120 | 12,9212 | +0,0622 | 0,0133 | 3,05% | 94,0% |
| Mini-30pc | 1021 | 13,1022 | +0,2432 | 0,0224 | 4,04% | 92,1% |
| IQ4_XS-imx (stock) | 957 | 13,1991 | +0,3402 | 0,0413 | 5,46% | 90,1% |
| Nano-27pc | 927 | 13,1685 | +0,3096 | 0,0417 | 5,50% | 88,9% |
| Pico-24pc | 833 | 13,3307 | +0,4717 | 0,0704 | 7,10% | 86,7% |
| IQ3_M-imx (stock) | 829 | 13,2256 | +0,3667 | 0,1004 | 8,40% | 84,5% |
| Femto-21pc | 738 | 14,1806 | +1,3216 | 0,1432 | 10,30% | 81,4% |

No se han publicado resultados de benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM estimada: entre ~0,75 GB (Femto-21pc, 738 MiB) y ~1,8 GB (Q8_0, 1761 MiB) solo para los pesos; hay que sumar el espacio de contexto y el estado de KV.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM puede alojar las variantes pequeñas; para Q8_0 o Fidelity-48pc se recomienda 6-8 GB. En el extremo alto, A100/H100 no son necesarias por tamaño, pero sí útiles para servir muchas peticiones concurrentes.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti, RTX 4090 y similares; también en iGPU y CPU para las variantes Compact-33pc e inferiores.
- Opciones de despliegue: llama.cpp (build 12283 es la referencia de las mediciones) y cualquier runtime compatible con GGUF; el modelo base declara compatibilidad con transformers y `endpoints_compatible`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-Omni-2B-Paretrix-GGUF (esta ficha) | ~1,73B | no disponible | texto, audio, vision | lfm1.0 | GGUF |
| LiquidAI/LFM3-Omni-2B (base) | ~1,73B | no disponible | texto, audio, vision | lfm1.0 | safetensors |
| Alternativas omni de ~2B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos omni de tamaño similar en la información proporcionada, por lo que no se puede establecer una comparación de rendimiento fiable.

## Limitaciones y advertencias

- La licencia lfm1.0 (`license: other`) impone condiciones específicas; es obligatorio revisar el archivo LICENSE antes de cualquier uso comercial.
- La model card no documenta sesgos conocidos del modelo base; al ser un modelo multilingüe y multimodal, es esperable un rendimiento desigual entre los 23 idiomas declarados.
- Riesgo de alucinación: no cuantificado en la información disponible; como en todo modelo generativo, debe validarse en dominios sensibles.
- Las métricas publicadas (PPL, KLD) miden fidelidad respecto a BF16, no calidad en tareas; un ΔPPL bajo no garantiza buen rendimiento en audio o visión.
- Las variantes por debajo de ~1000 MiB (Nano-27pc, Pico-24pc, Femto-21pc) muestran degradaciones notables (ΔPPL de +0,31 a +1,32 y top-p del 88,9% al 81,4%), por lo que no se recomiendan para producción sin validación específica.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día; no hay evidencia de uso comunitario ni de validación independiente.
- El modelo base requiere `custom_code` en transformers; la integración con pipelines estándar puede necesitar pasos adicionales.
- No se documentan requisitos de memoria para audio o visión, que pueden superar la estimación basada solo en pesos de texto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Soulfate24/LFM3-Omni-2B-Paretrix-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Suite de cuantización Paretrix: https://huggingface.co/Soulfate24/Paretrix_Quantization_Suite
- llama.cpp: https://github.com/ggml-org/llama.cpp
