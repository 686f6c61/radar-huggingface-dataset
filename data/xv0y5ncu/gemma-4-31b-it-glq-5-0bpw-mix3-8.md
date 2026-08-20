# xv0y5ncu/Gemma-4-31B-it-GLQ-5.0bpw-mix3-8

## Resumen

El modelo `xv0y5ncu/Gemma-4-31B-it-GLQ-5.0bpw-mix3-8` es una cuantización de precisión mixta del modelo base `google/gemma-4-31B-it`, desarrollada por el usuario xv0y5ncu mediante la herramienta GLQ (Generalized Lattice Quantization). La cuantización utiliza un esquema basado en el retículo E8 con 65536 entradas, transformada de Hadamard aleatorizada (RHT), descomposición LDLQ y cuantización residual en varias etapas, logrando un promedio de 5.0 bits por peso. El resultado es un archivo de aproximadamente 24 GB, unas 2,5 veces menor que el peso original en bf16 (≈62 GB), lo que permite ejecutar el modelo de 31B en una única GPU de 24–32 GB.

El modelo base, Gemma 4 31B, es un transformer denso multimodal desarrollado por Google DeepMind, con una ventana de contexto de hasta 256K tokens y soporte multilingüe en más de 140 idiomas. Esta cuantización se centra exclusivamente en el decodificador de texto; los módulos de visión, vídeo y audio no están cuantizados y deben desactivarse durante la inferencia. El trabajo es relevante porque reduce drásticamente los requisitos de VRAM sin una pérdida de calidad medible en las evaluaciones realizadas, facilitando el despliegue en hardware de consumo o de gama media.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Gemma 4 31B) |
| Parametros totales | 31B (modelo base); archivo safetensors: 12.027.607.404 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K tokens (modelo base) |
| Tipos de cuantizacion | GLQ 5.0 bpw (mixed-precision, rango 3–8 bpw) |
| Idiomas soportados | Multilingüe (modelo base, más de 140 idiomas); la model card indica solo "en" |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (con integración GLQ para transformers y vLLM) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 31B parámetros, entrenado por Google DeepMind con una ventana de contexto de 256K tokens y soporte multimodal (texto, imagen, vídeo y audio). El entrenamiento incluye fases de preentrenamiento y ajuste fino instructivo, con técnicas de alineación como RLHF. La cuantización GLQ emplea un esquema de cuantización por retícula E8: cada bloque de 8 dimensiones se codifica con un libro de códigos de 65536 entradas, se aplica una transformación de Hadamard aleatoria (RHT) para rotar los vectores de entrada y salida, y se utiliza LDLQ (descomposición LDL con feedback) durante la codificación. Para capas con ≥3 bpw se usa cuantización residual en N etapas. La asignación de precisión mixta se basa en un proxy de sensibilidad derivado de la traza de la Hessiana, priorizando capas tempranas de q/k/v y `per_layer_projection` en capas tardías. El resultado es una cuantización que, según las evaluaciones internas, no muestra diferencias de calidad estadísticamente significativas frente al modelo bf16.

## Capacidades

- Generación de texto: producción de texto coherente y contextualizado en múltiples dominios.
- Razonamiento y matemáticas: resolución de problemas aritméticos y de razonamiento complejo, especialmente con el modo de pensamiento (`enable_thinking`).
- Codificación: generación y depuración de código, aunque no se proporcionan benchmarks específicos.
- Multilingüismo: el modelo base soporta más de 140 idiomas, aunque esta cuantización no modifica esa capacidad.
- Modo de pensamiento (thinking): mediante la plantilla de chat con `enable_thinking=True`, el modelo genera un bloque de razonamiento previo a la respuesta final.
- No soporta visión, audio ni vídeo en esta cuantización: los módulos multimodales no están cuantizados y deben desactivarse (por ejemplo, `limit_mm_per_prompt={"image":0, "video":0, "audio":0}` en vLLM).

## Casos de uso

- Despliegue de un asistente conversacional en una sola GPU de 24 GB: gracias al tamaño reducido (≈16,5 GiB de pesos), el modelo puede ejecutarse en una RTX 4090 o similar, ofreciendo respuestas de alta calidad sin necesidad de clústeres.
- Razonamiento matemático en entornos educativos: el modo de pensamiento permite resolver problemas de álgebra, cálculo o lógica mostrando el proceso de razonamiento, útil para herramientas de tutoría.
- Generación de código en pipelines de integración continua: el modelo puede generar fragmentos de código y explicaciones, integrándose en flujos de revisión automática, aunque no se documenta soporte explícito de tool calling.
- Análisis de documentos largos: gracias a la ventana de 256K tokens, se pueden procesar informes, manuales o actas completas sin truncamiento, y resumir o extraer información relevante.
- Chat de atención al cliente con contexto prolongado: el modelo puede mantener conversaciones multiturno con historial extenso, gracias a la ventana de contexto y al tamaño reducido que permite ejecutarlo en servidores con VRAM moderada.
- Prototipado de agentes de razonamiento multi-paso: la capacidad de generar cadenas de pensamiento y el soporte para entornos de texto largo hacen adecuado el modelo para experimentos de agente con planificación y reflexión.

## Benchmarks y rendimiento

La model card incluye una evaluación pareada contra el modelo bf16 en vLLM 0.23.0 (GPU RTX PRO 6000), con modo de pensamiento activo. Los resultados son muestras únicas (pass@1) con n pequeño, por lo que son indicativos, no estimaciones ajustadas.

| Benchmark | n | bf16 | GLQ 5.0 bpw |
|---|---|---|---|
| MMLU-Pro (thinking, 16k) | 60 | 86,7% (52/60) | 90,0% (54/60) |
| AIME-2024 (thinking, 32k) | 30 | 86,7% (26/30) | 90,0% (27/30) |
| AIME-2026 (thinking, 64k) | 30 | 90,0% (27/30) | 83,3% (25/30) |

Las diferencias están dentro del ruido de una muestra única y van en ambas direcciones (GLQ por delante en MMLU-Pro y AIME-2024, bf16 en AIME-2026). No se observan truncamientos en ninguno de los tres casos. No se realizan afirmaciones de paridad exacta, solo se concluye que no hay diferencia medible en estas evaluaciones.

## Requisitos de hardware

- VRAM estimada: los pesos en GPU ocupan ≈16,5 GiB (GLQ 5.0 bpw) frente a ≈57,9 GiB (bf16). Con la memoria adicional para KV cache y activaciones, se recomienda al menos 24 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB), RTX PRO 6000 (24 GB), A100 40GB, o cualquier GPU con ≥24 GB de memoria.
- En consumer GPU: sí, cabe en una RTX 4090 de 24 GB. Para contexto largo (256K tokens) se necesitará más VRAM, pero se puede reducir la longitud de contexto o usar cuantización de KV cache.
- Opciones de despliegue: vLLM (0.23.0+), HuggingFace Transformers (con integración GLQ, `pip install glq`), y posiblemente otros frameworks que soporten GLQ (no documentado).
- Latencia y throughput: no se proporcionan datos de velocidad. Se indica que en GPU grandes donde bf16 también cabe, bf16 decodifica más rápido; la ventaja de GLQ es la reducción de huella, no la velocidad.
- Requisitos de software: CUDA 12.x, `torch>=2.0`, `transformers>=5.0` (pin por debajo de 5.15 por un problema con `config.head_dim`), y el paquete `glq` con JIT de kernel (≈30s de compilación).

## Comparativa con modelos similares

No se dispone de comparativas directas con otras cuantizaciones (como AWQ, GPTQ, GGUF) del mismo modelo. La comparación principal es con el modelo base bf16, que se muestra en la tabla de benchmarks. Respecto a otras alternativas de la misma familia:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| google/gemma-4-31B-it (bf16) | 31B | 256K | Apache 2.0 | HuggingFace |
| xv0y5ncu/Gemma-4-31B-it-GLQ-5.0bpw-mix3-8 | 31B (base) | 256K | Apache 2.0 | HuggingFace |
| Otras cuantizaciones (p.ej. GGUF) | 31B | 256K | Apache 2.0 | No disponibles en la búsqueda |

No se han encontrado datos de comparación con otros modelos de tamaño similar (por ejemplo, Llama 3.1 70B o Mistral Large) en la información proporcionada.

## Limitaciones y advertencias

- La cuantización solo cubre el decodificador de texto; los componentes de visión, vídeo y audio no están cuantizados y deben desactivarse explícitamente, limitando las capacidades multimodales del modelo base.
- La evaluación de rendimiento se basa en muestras pequeñas (n=30–60) y no constituye una garantía estadística de paridad con el modelo bf16.
- El modelo puede alucinar información, especialmente en tareas de razonamiento complejo o con contexto largo; se recomienda validar las respuestas críticas.
- La ventana de contexto de 256K tokens es la del modelo base; con la cuantización, la memoria disponible para KV cache puede limitar el contexto real según la GPU.
- La licencia Apache 2.0 permite uso comercial, pero es necesario revisar los términos específicos de Gemma 4 en el sitio oficial de Google para garantizar el cumplimiento.
- La integración con `transformers` requiere fijar la versión por debajo de 5.15; versiones posteriores rompen la carga del modelo.
- El modo de pensamiento requiere `max_new_tokens` suficiente (se recomienda 16384) para no truncar el razonamiento antes de la respuesta final.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xv0y5ncu/Gemma-4-31B-it-GLQ-5.0bpw-mix3-8
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Documentación de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Repositorio de GLQ: https://github.com/cnygaard/glq
- Página oficial de Gemma 4: https://deepmind.google/models/gemma/gemma-4/
- NVIDIA NIM para Gemma 4 31B: https://build.nvidia.com/google/gemma-4-31b-it/modelcard
