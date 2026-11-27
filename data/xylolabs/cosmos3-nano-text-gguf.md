# Xylolabs/Cosmos3-Nano-Text-GGUF

## Resumen

Cosmos3-Nano-Text-GGUF es una cuantización en formato GGUF del modelo nvidia/Cosmos3-Nano, publicada por Xylolabs para su uso con llama.cpp en CUDA, Metal o CPU. El modelo base es un modelo multimodal de NVIDIA del que Xylolabs ha extraído únicamente la torre de texto, la ha convertido a GGUF y la ha cuantizado en cinco variantes (Q8_0, Q6_K, Q5_K_M, IQ4_XS e IQ4_XS con importance matrix). El resultado es un modelo de generación de texto de 8.190.735.360 parámetros (aproximadamente 8,2 mil millones) que conserva el tokenizador y la plantilla de chat originales.

La relevancia de esta ficha radica en que permite ejecutar en hardware de consumo una parte del stack Cosmos 3 de NVIDIA sin necesidad de infraestructura de GPU de datacenter. Según la model card, el modelo base parte de Qwen3-VL-8B, lo que explica el tamaño de la torre de texto y el soporte de plantilla de chat conversacional. La ventana de contexto es amplia: la tabla de recomendación de hardware del autor menciona configuraciones de 64K, 128K y hasta 256K tokens según la memoria disponible.

El modelo está orientado a generación de texto conversacional y se distribuye bajo licencia OpenMDW-1.1, con la licencia Apache 2.0 de Qwen incluida en el repositorio por herencia del modelo base. Los idiomas declarados son inglés y coreano. El repositorio tiene 30,4 GB y acumula 1.564 descargas en Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (torre de texto extraída de nvidia/Cosmos3-Nano, que parte de Qwen3-VL-8B) |
| Parámetros totales | 8.190.735.360 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 256K tokens según hardware; 64K en GPU de 24 GB, 128K en 48 GB, 256K en 80 GB o más |
| Tipos de cuantización | Q8_0, Q6_K, Q5_K_M, IQ4_XS, IQ4_XS-imat |
| Idiomas soportados | inglés (en), coreano (ko) |
| Licencia | OpenMDW-1.1 (con Apache 2.0 de Qwen incluida en `APACHE_LICENSE`) |
| Formato de pesos | GGUF (un archivo por cuantización) |

Tamaños de archivo por cuantización:

| Cuantización | Tamaño | KL medio vs BF16 | Mismo top-1 vs BF16 |
|---|---|---|---|
| Q8_0 | 8,71 GB | 0,0013 | 97,84% |
| Q6_K | 6,73 GB | 0,0044 | 96,10% |
| Q5_K_M | 5,85 GB | 0,0090 | 94,79% |
| IQ4_XS | 4,59 GB | 0,0386 | 90,27% |
| IQ4_XS-imat | 4,56 GB | 0,0222 | 92,26% |

Las métricas KL y top-1 se calcularon sobre 16.272 posiciones de texto en inglés y coreano, tomando como referencia el paso en BF16 en transformers.

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de que es un transformer y de que la torre de texto procede de Qwen3-VL-8B. Xylolabs indica explícitamente que extrajo la torre de texto de nvidia/Cosmos3-Nano, la convirtió a GGUF y la cuantizó; no se describe ningún reentrenamiento ni fine-tuning adicional por parte del cuantizador. Por tanto, las características de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) corresponden al modelo original de NVIDIA y no se detallan en la información proporcionada.

La innovación técnica destacable de esta publicación es el proceso de cuantización con importance matrix (imatrix), que en la variante IQ4_XS-imat reduce el KL medio de 0,0386 a 0,0222 y eleva el acuerdo top-1 del 90,27% al 92,26% respecto a BF16, con un tamaño prácticamente idéntico (4,56 GB frente a 4,59 GB). La model card también documenta los tipos de tensor por archivo: por ejemplo, Q8_0 contiene 145 tensores F32 y 254 Q8_0, mientras que IQ4_XS-imat mezcla 145 F32, 217 IQ4_XS, 36 Q5_K y 1 Q6_K.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat incluida en cada archivo GGUF.
- Razonamiento y generación de texto general en inglés y coreano.
- Compatibilidad con `--jinja` en llama.cpp, lo que habilita el uso de la plantilla de chat nativa del modelo.
- Ejecución en CUDA, Metal y CPU mediante llama.cpp.
- Soporte de contexto largo, hasta 256K tokens en hardware con memoria suficiente.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags de Hugging Face).
- Capacidades de visión, audio o tool calling: no disponibles en esta extracción, ya que solo se distribuye la torre de texto.

## Casos de uso

- Asistente conversacional local en estaciones de trabajo: con el archivo Q8_0 (8,71 GB) cabe en una RTX 4090 o RTX 3090 de 24 GB y permite conversaciones multi-turno con hasta 64K tokens de contexto, útil para atención al usuario con historiales largos.
- Procesamiento de documentos extensos en inglés y coreano: con 128K o 256K tokens de contexto en GPUs de 48 GB o más (RTX 6000 Ada, H100, H200), se pueden resumir o extraer información de contratos, informes o expedientes completos sin trocear.
- Despliegue en portátiles y equipos Apple Silicon: la variante IQ4_XS-imat (4,56 GB) permite ejecutar el modelo en Mac con Metal mediante llama.cpp, con una pérdida de calidad controlada (92,26% de acuerdo top-1 frente a BF16).
- Servicio de inferencia ligero con `llama-server`: el binario de llama.cpp expone una API compatible con endpoints, lo que permite montar un servicio interno de generación de texto sin depender de infraestructura de datacenter.
- Traducción y generación bilingüe inglés-coreano: el modelo declara soporte de ambos idiomas y las métricas de cuantización se validaron sobre texto en las dos lenguas, lo que respalda su uso en tareas de traducción o redacción bilingüe.
- Prototipado e investigación sobre el stack Cosmos 3: al ser una extracción de la torre de texto del modelo de NVIDIA, sirve para experimentar con la parte lingüística del modelo en hardware asequible antes de escalar al modelo completo.
- Evaluación comparativa de cuantizaciones: los datos de KL y top-1 publicados por el autor permiten elegir la variante adecuada según el equilibrio entre memoria y fidelidad, por ejemplo Q5_K_M (5,85 GB, KL 0,0090) para entornos con 8-12 GB de VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K u otros). La model card solo incluye métricas de fidelidad de cuantización (KL medio y acuerdo top-1 frente a BF16), recogidas en la tabla de especificaciones técnicas.

## Requisitos de hardware

- VRAM estimada para inferencia: 4,56 GB (IQ4_XS-imat), 4,59 GB (IQ4_XS), 5,85 GB (Q5_K_M), 6,73 GB (Q6_K) y 8,71 GB (Q8_0), sin contar el espacio adicional para el contexto KV.
- GPU recomendadas según el autor: RTX 4090 / RTX 3090 (24 GB) y RTX 5090 (32 GB) para 64K de contexto con Q8_0; RTX 6000 Ada o 2 x 24 GB (48 GB) para 128K; H100 (80 GB), RTX PRO 6000 Blackwell (96 GB), DGX Spark (128 GB unificada), Mac Studio M5 Max (128 GB unificada), H200 (141 GB), B200 (192 GB), Mac Studio M5 Ultra (256 GB y 512 GB unificada) y B300 (288 GB) para 256K.
- Cabe en GPU de consumo: sí, con Q8_0 en RTX 4090, RTX 3090 y RTX 5090; las variantes de 4-6 GB caben en GPUs con 8-12 GB de VRAM.
- Opciones de despliegue: llama.cpp (commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8` o posterior), con los binarios `llama-cli` y `llama-server`; compilación con `-DGGML_CUDA=ON` para NVIDIA y soporte Metal en macOS.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Cosmos3-Nano-Text-GGUF (esta ficha) | 8,19B | hasta 256K según hardware | en, ko | OpenMDW-1.1 | GGUF |
| nvidia/Cosmos3-Nano (modelo base) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Qwen3-VL-8B (origen de la torre de texto) | ~8B | no disponible | no disponible | Apache 2.0 | safetensors |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a parámetros, contexto, licencia y formato; los campos marcados como no disponibles no aparecen en la documentación consultada.

## Limitaciones y advertencias

- Solo se distribuye la torre de texto: las capacidades multimodales (visión) del modelo base Cosmos3-Nano no están presentes en esta extracción.
- Idiomas limitados a inglés y coreano; el rendimiento en castellano u otros idiomas no está documentado y no debería asumirse.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad factual en la información disponible.
- Sesgos conocidos: no documentados en la model card; al heredar el entrenamiento de Qwen3-VL-8B y Cosmos3-Nano, arrastra los sesgos de sus datasets originales, que no se detallan.
- Restricciones de licencia: OpenMDW-1.1 es la licencia del artefacto; el modelo base Qwen3-VL-8B se distribuye bajo Apache 2.0, incluida en el repositorio como `APACHE_LICENSE`. Es responsabilidad del usuario revisar ambas licencias antes de un uso comercial.
- Requiere una versión concreta de llama.cpp (commit `cd959bae` o posterior); versiones anteriores pueden no cargar correctamente los archivos.
- El contexto máximo efectivo depende de la memoria disponible: 64K en 24 GB, 128K en 48 GB y 256K en 80 GB o más; no se garantiza el contexto completo en hardware inferior.
- El repositorio tiene 0 likes y 1.564 descargas, lo que indica una adopción todavía limitada; conviene validar el comportamiento en el caso de uso concreto antes de llevarlo a producción.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/Xylolabs/Cosmos3-Nano-Text-GGUF
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Nano
- Licencia en el repositorio: https://huggingface.co/Xylolabs/Cosmos3-Nano-Text-GGUF/blob/main/LICENSE
- llama.cpp (commit de referencia): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio de Xylolabs citado en la model card: https://github.com/XylolabsInc/tensix-bfp-gptq
- Informe técnico de Cosmos 3: enlazado desde la model card de nvidia/Cosmos3-Nano (no se proporciona URL directa en la información disponible)
