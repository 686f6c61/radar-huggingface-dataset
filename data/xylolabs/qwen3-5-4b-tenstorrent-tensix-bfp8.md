# Xylolabs/Qwen3.5-4B-Tenstorrent-Tensix-BFP8

## Resumen

Qwen3.5-4B-Tenstorrent-Tensix-BFP8 es una exportación cuantizada del modelo multimodal Qwen/Qwen3.5-4B, publicada por Xylolabs y optimizada específicamente para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). No se trata de un modelo nuevo entrenado desde cero, sino de una conversión de precisión reducida: las capas lineales del modelo base se cuantizan con GPTQ sobre la rejilla de coma flotante por bloques `bfloat8_b` (BFP8) que TT-NN empaqueta de forma nativa sin alterar los valores almacenados.

El modelo conserva la arquitectura del Qwen3.5-4B original, un transformer híbrido con atención clásica y capas Gated DeltaNet, junto con un bloque MTP (multi-token prediction) y una torre visual, lo que le permite procesar entradas de imagen y texto. El checkpoint resultante ocupa unos 5,07 GB para los pesos del modelo de lenguaje, con una media de 9,63 bits por peso, y está pensado para desplegarse en hardware de inferencia de Tenstorrent más que en GPU convencionales.

Su relevancia es doble: por un lado, demuestra una ruta práctica de cuantización BFP8 con GPTQ preservando la fidelidad respecto al modelo BF16 (KL media de 0,00084 y top-1 del 98,62 %); por otro, amplía el ecosistema de modelos Qwen disponibles para aceleradores Tensix, un nicho en crecimiento para inferencia de bajo consumo. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención clásica + Gated DeltaNet) con bloque MTP y torre visual |
| Parametros totales | 5.295.564.288 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`) con GPTQ; pesos no lineales en bf16; algunos tensores en float32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers), empaquetado para TT-NN |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B emplea una arquitectura híbrida: 8 capas con atención clásica (proyecciones q, k, v, o) y 24 capas con Gated DeltaNet (proyecciones q, k, v, z, a, b y salida), más 32 capas MLP con proyecciones gate, up y down. Incluye además un bloque MTP y una torre visual que habilitan la modalidad image-text-to-text. Esta exportación no reentrena el modelo: aplica GPTQ sobre la rejilla BFP8 a todas las proyecciones lineales, manteniendo la cabeza LM (atada al embedding), las normas, el embedding, el bloque MTP y la parte visual en bf16, y preservando `A_log` y la norma de `linear_attn` en float32.

La calibración de GPTQ se realizó sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. El resultado son 9,63 bits por peso de media y 5,07 GB empaquetados. Solo se cuantizó y evaluó el modelo de lenguaje; la parte visual y el bloque MTP no fueron evaluados en esta exportación. La verificación de empaquetado se realizó con `ttnn` 0.81.1 sobre el simulador Blackhole (ttsim), comprobando que TT-NN lee los pesos sin modificar sus valores.

## Capacidades

- Generación de texto conversacional multirretorno, con plantilla de chat propia (`apply_chat_template`).
- Procesamiento de imagen y texto (pipeline `image-text-to-text`) gracias a la torre visual heredada del modelo base.
- Razonamiento y generación de código y matemáticas, heredados de las capacidades del Qwen3.5-4B original (no evaluadas específicamente en esta exportación).
- Decodificación multi-token mediante el bloque MTP, conservado en bf16.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada; la calibración incluyó coreano, lo que sugiere cobertura al menos parcial de ese idioma.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en NPU Tenstorrent Wormhole o Blackhole: el checkpoint está empaquetado en BFP8 para que TT-NN lo cargue directamente en DRAM del dispositivo (unos 5,07 GB más KV cache y buffers), lo que permite servir el modelo en aceleradores de bajo consumo sin GPU.
- Inferencia multimodal en el borde: al conservar la torre visual y el pipeline image-text-to-text, puede usarse para describir imágenes, responder preguntas sobre capturas o extraer información de documentos escaneados en entornos con hardware Tensix.
- Prototipado de asistentes conversacionales: la plantilla de chat y la compatibilidad con `transformers` permiten validar el comportamiento del modelo en CPU/GPU antes de portarlo al dispositivo.
- Evaluación de pipelines de cuantización: sirve como referencia para medir la pérdida de fidelidad de BFP8 frente a BF16 (KL 0,00084, top-1 98,62 %) y comparar con alternativas como Q4_K_M de llama.cpp.
- Investigación sobre arquitecturas híbridas: las capas Gated DeltaNet y el bloque MTP hacen de este checkpoint un banco de pruebas para estudiar el comportamiento de modelos híbridos bajo cuantización de bloque.
- Integración en flujos de verificación de empaquetado: los scripts `pack_tensix.py` y `verify_grid.py` permiten auditar que cada matriz se empaqueta sin cambios de valor, útil en pipelines de CI para exportaciones a Tensix.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamano (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen/Qwen3.5-4B) | 16 | 8,41 | 0 | 100 | 36 de 40 | - |
| Este modelo (BFP8) | 9,63 | 5,065 | 0,00084 | 98,62 | 35 de 40 | 0 |
| Q4_K_M (llama.cpp) | 5,13 | 2,783 | 0,03981 | 89,79 | 37 de 40 | 0 |

La evaluación de KL y top-1 cubre 16.312 posiciones de inglés y coreano. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: unos 5,07 GB solo para los pesos del modelo de lenguaje, más espacio para KV cache y buffers.
- Hardware objetivo: NPU Tenstorrent Tensix (Wormhole y Blackhole). Para dispositivos con menos memoria, el autor recomienda la versión BFP4.
- GPU convencionales: no se documenta soporte optimizado; el checkpoint puede cargarse con `transformers` en bf16 (requiere aproximadamente el doble de memoria que la versión empaquetada), pero no es el caso de uso previsto.
- Despliegue: TT-NN (`ttnn` 0.81.1 verificado en ttsim), demo de tt-metal para Qwen3.5/3.6 (v0.81.1), y `tt-forge`/`tt-xla` (no probado con este checkpoint).
- Limitación conocida del demo de tt-metal: empaqueta las proyecciones MLP gate y up en bfloat4_b, lo que recuantiza los valores bfloat8_b de esta exportación; para ese demo, la versión BFP4 encaja mejor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-Tenstorrent-Tensix-BFP8 | 5.295.564.288 | no disponible | safetensors BFP8 (TT-NN) | Apache 2.0 | Hugging Face |
| Qwen3.5-4B-Tenstorrent-Tensix-BFP4 | mismo base | no disponible | safetensors BFP4 (TT-NN) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (BF16) | mismo base | no disponible | safetensors bf16 | Apache 2.0 | Hugging Face |
| Q4_K_M de llama.cpp | mismo base | no disponible | GGUF | Apache 2.0 | llama.cpp |

La comparación relevante es de precisión y fidelidad: BFP8 conserva mejor el comportamiento del BF16 (KL 0,00084) que Q4_K_M (KL 0,03981), a costa de mayor tamaño (5,065 GB frente a 2,783 GB). La versión BFP4 reduce memoria pero no se han publicado sus métricas en la información disponible.

## Limitaciones y advertencias

- Solo se cuantizó y evaluó el modelo de lenguaje; la torre visual y el bloque MTP no fueron evaluados, por lo que su comportamiento en tareas multimodales no está validado.
- El demo oficial de tt-metal para Qwen3.5/3.6 no lista Qwen3.5-4B y recuantiza algunas proyecciones a bfloat4_b, lo que degrada la fidelidad de este checkpoint; para ese demo se recomienda la versión BFP4.
- `tt-forge`/`tt-xla` no se ha probado con este checkpoint; su opción `bfp_bf8` recuantiza los pesos en el layout `[out, in]` de PyTorch.
- `tt-transformers` no soporta esta arquitectura.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero heredados del modelo base Qwen3.5-4B.
- Idiomas soportados: no disponibles; la calibración incluyó inglés y coreano, sin garantía de cobertura en otros idiomas.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-4B y de las dependencias de TT-NN/tt-metal.
- La evaluación se limita a 16.312 posiciones y 40 preguntas, una muestra pequeña que no sustituye una validación en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3.5-4B-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Versión BFP4: https://huggingface.co/Xylolabs/Qwen3.5-4B-Tenstorrent-Tensix-BFP4
- Repositorio de código tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Demo tt-metal Qwen3.5/3.6 (v0.81.1): https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/blackhole/qwen36
- Documentación de Tenstorrent: https://docs.tenstorrent.com
