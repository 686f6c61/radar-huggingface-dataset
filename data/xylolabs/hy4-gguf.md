# Xylolabs/Hy4-GGUF

## Resumen

Hy4 es un modelo multimodal de tipo image-text-to-text desarrollado por Tencent, distribuido en este repositorio por Xylolabs en formato GGUF para su uso con llama.cpp. Se trata de un modelo de arquitectura MoE (mixture of experts) con aproximadamente 770.000 millones de parámetros totales, lo que lo sitúa en la categoría de modelos de gran escala orientados a razonamiento, generación de texto y comprensión de imágenes. Su relevancia actual radica en que permite ejecutar un modelo de este tamaño en hardware de gama alta mediante cuantización agresiva (desde Q8_0 hasta IQ2_XXS) y offloading de expertos a RAM del sistema.

El repositorio ofrece cinco niveles de cuantización (Q8_0, Q6_K, Q4_K_M, IQ3_S e IQ2_XXS), cada uno dividido en 13 partes, además de proyectores de visión (mmproj) en BF16 y Q8_0 e importance matrices para cuantización IQ. El modelo base es tencent/Hy4 y los pesos están publicados bajo la Tencent Hy License, versión 1.0, con términos adicionales para operadores de Model-as-a-Service a gran escala.

La ficha se centra en la versión GGUF, que es la que distribuye Xylolabs, si bien muchos de los datos técnicos del modelo subyacente (arquitectura interna, datos de entrenamiento, benchmarks) no están disponibles en la información proporcionada y se indican como tales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) multimodal image-text-to-text, según tags del repositorio; detalles internos no disponibles |
| Parámetros totales | 769.907.408.797 (≈770 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | hasta 1M tokens según la tabla de hardware (configuración de 8×H200/B200 con Q8_0); contextos menores (32K, 64K, 256K) según memoria disponible |
| Tipos de cuantización | Q8_0, Q6_K, Q4_K_M, IQ3_S, IQ2_XXS; proyectores de visión en BF16 y Q8_0; importance matrices (imatrix e imatrix.ub12288) |
| Idiomas soportados | en, zh |
| Licencia | tencent-hy-license (Tencent Hy License, Version 1.0), con términos adicionales para operadores de Model-as-a-Service |
| Formato de pesos | GGUF (llama.cpp), dividido en 13 partes por cuantización; mmproj separado para visión |

## Arquitectura y entrenamiento

La información disponible confirma que Hy4 es un modelo MoE multimodal (tags `moe` y `multimodal`), con pipeline image-text-to-text y un proyector de visión independiente empaquetado como `mmproj-Hy4-BF16.gguf` (2,7 GB) o `mmproj-Hy4-Q8_0.gguf` (1,6 GB). El tamaño total de parámetros (≈770 B) y el hecho de que el repositorio incluya importance matrices para cuantización IQ sugieren un modelo de gran escala con expertos dispersos, aunque no se detallan en la información proporcionada el número de expertos, la proporción de parámetros activos ni la arquitectura exacta (transformer denso, MoE híbrido, atención lineal, etc.).

Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras. Los únicos datos técnicos verificables son los de cuantización: la model card reporta divergencia KL media y acuerdo top-1 frente al modelo BF16 medidos con llama.cpp sobre WikiText-2, chat y texto reservado, con una "attention-rounding floor" de KL ≈0,034 propia del soporte de Hy4 en llama.cpp. El soporte de Hy4 en llama.cpp está disponible a través del PR #32517 hasta su fusión.

## Capacidades

- Generación de texto conversacional multi-turno (tag `conversational`).
- Comprensión de imágenes y texto combinados (pipeline image-text-to-text), con proyector de visión dedicado.
- Razonamiento y generación de contenido en inglés y chino (únicos idiomas declarados).
- Arquitectura MoE que permite, en teoría, mayor capacidad efectiva con coste de cómputo reducido por token, aunque no se dispone de la cifra de parámetros activos.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Asistente multimodal de atención al cliente: el modelo puede procesar capturas de pantalla, facturas o imágenes de producto junto con texto en conversaciones multi-turno, gracias a su pipeline image-text-to-text y a ventanas de contexto que, en configuraciones de 8×H200 o 8×B200 con Q8_0, alcanzan 1M tokens.
- Análisis documental con imágenes: extracción y razonamiento sobre documentos escaneados, gráficos o diagramas en inglés o chino, usando el proyector de visión Q8_0 (1,6 GB) para reducir huella de memoria.
- Despliegue en clústeres de gama alta con offloading: con `--n-cpu-moe N` en llama.cpp es posible mantener los expertos en RAM del sistema y las capas restantes en GPU, lo que permite servir el modelo en configuraciones como 4×H200 (564 GB) con Q4_K_M y contexto de 256K.
- Investigación en cuantización extrema: el repositorio incluye cinco niveles de cuantización con métricas de divergencia KL y top-1 frente a BF16, lo que lo convierte en un banco de pruebas para estudiar el impacto de IQ2_XXS e IQ3_S en modelos MoE multimodales de gran escala.
- Generación de código y razonamiento técnico en inglés/chino: aunque no se publican benchmarks específicos, el tamaño del modelo y su naturaleza MoE lo orientan a tareas de razonamiento complejo; conviene validar con evaluaciones propias antes de producción.
- Procesamiento por lotes en estaciones de trabajo con memoria unificada: en Mac Studio M5 Ultra con 512 GB es posible ejecutar IQ3_S (328 GB) con contexto de 512K, adecuado para pipelines offline de análisis de imágenes y texto.
- Evaluación comparativa de cuantizaciones: las tablas de KL y top-1 permiten seleccionar el nivel de cuantización adecuado según el hardware y la tolerancia a degradación (por ejemplo, Q4_K_M mantiene 90,8% de top-1 en WikiText-2 frente a BF16).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente reporta métricas de fidelidad de cuantización frente al modelo BF16:

| Cuantización | Tamaño | WikiText-2 KL | top-1 | Chat KL | top-1 | Held-out KL | top-1 | Answers |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| BF16 (flash attention off, parte de WikiText-2) | 1541,7 GB | 0,0336 | 95,1% | — | — | — | — | — |
| Q8_0 | 818,5 GB | 0,0373 | 94,6% | 0,1187 | 93,3% | 0,0173 | 96,0% | 5/5 |
| Q6_K | 638,3 GB | 0,0431 | 93,8% | 0,1235 | 92,8% | 0,0188 | 95,5% | 5/5 |
| Q4_K_M | 464,1 GB | 0,0920 | 90,8% | 0,1590 | 91,3% | 0,0408 | 93,8% | 5/5 |
| AngelSlim Q4_K_M | 470,2 GB | 0,1464 | 88,3% | 0,2315 | 88,8% | 0,0713 | 91,9% | 5/5 |
| IQ3_S | 328,0 GB | 0,3237 | 82,8% | 0,2851 | 87,3% | 0,1535 | 88,1% | 5/5 |
| AngelSlim IQ2 | 332,4 GB | 0,5673 | 76,9% | 0,4303 | 83,5% | 0,2802 | 83,8% | 5/5 |
| IQ2_XXS | 219,4 GB | 0,8881 | 70,1% | 0,5610 | 80,7% | 0,4522 | 80,3% | 5/5 |

## Requisitos de hardware

- VRAM/RAM estimada según la tabla del autor: un archivo cabe cuando su tamaño más la caché KV en f16 a ese contexto más 2 GB de runtime queda por debajo del 90% de la memoria disponible.
- GPU consumer: RTX 4090 / RTX 3090 (24 GB) no admiten ningún archivo completo; RTX 5090 (32 GB) solo con offloading y contexto de 32K; RTX 6000 Ada o 2×24 GB (48 GB) con offloading y 32K.
- GPU profesional: una H100 (80 GB) o RTX PRO 6000 Blackwell (96 GB) con offloading y 32K; una H200 (141 GB) con offloading y 32K; una B200 (≈180 GB usables) con offloading y 32K; una B300 (288 GB) con IQ2_XXS y contexto de 256K.
- Configuraciones multi-GPU: 2×H200 (282 GB) con IQ2_XXS y 256K; 4×H200 (564 GB) con Q4_K_M y 256K; 8×H200 (1.128 GB) con Q8_0 y 1M; 4×B200 (≈720 GB usables) con Q6_K y 64K; 8×B200 (≈1.440 GB usables) con Q8_0 y 1M.
- Memoria unificada: DGX Spark (128 GB) y Mac Studio M5 Max (128 GB) no admiten ningún archivo completo; Mac Studio M5 Ultra con 256 GB ejecuta IQ2_XXS (219,4 GB) con 64K (requiere elevar el límite de memoria GPU de macOS); con 512 GB ejecuta IQ3_S (328 GB) con 512K.
- Opciones de despliegue: llama.cpp (PR #32517, aún no fusionado) con `llama-cli` y `llama-server`; compilación con `-DGGML_CUDA=ON` para NVIDIA. Mantener `--ubatch-size` en 8192 o menos, ya que valores superiores pueden producir salidas incorrectas en esta build.
- Offloading: usar `--n-cpu-moe N` para mantener los expertos de las primeras N capas en RAM del sistema; reducir N para ganar velocidad mientras el modelo siga cabiendo en GPU.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. La única comparación interna disponible es entre las propias cuantizaciones del repositorio y la variante "AngelSlim" (Q4_K_M e IQ2) incluida en la tabla de fidelidad, donde las cuantizaciones de Xylolabs muestran menor divergencia KL que las de AngelSlim a tamaños comparables (por ejemplo, Q4_K_M: 0,0920 frente a 0,1464 en WikiText-2). Para alternativas de la misma categoría (MoE multimodal de gran escala) no hay datos en la información disponible.

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; no se declara soporte de castellano ni de otros idiomas.
- No se han publicado benchmarks de capacidades (razonamiento, código, matemáticas, visión), por lo que el rendimiento real en tareas downstream es desconocido y debe validarse empíricamente.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran escala; no se documentan mitigaciones específicas.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia Tencent Hy License 1.0 con términos adicionales para operadores de Model-as-a-Service a gran escala; es necesario revisar `LICENSE` y `NOTICE` antes de un uso comercial, y Xylolabs declara no estar afiliado ni respaldado por Tencent.
- El soporte en llama.cpp depende del PR #32517, no fusionado; la estabilidad y el rendimiento pueden cambiar entre versiones.
- Restricción técnica: `--ubatch-size` debe mantenerse en 8192 o menos para evitar salidas incorrectas en esta build.
- Las cuantizaciones bajas (IQ3_S, IQ2_XXS) degradan notablemente la fidelidad: IQ2_XXS cae a 70,1% de top-1 en WikiText-2 y KL de 0,8881, lo que puede ser inaceptable para tareas sensibles.
- El tamaño del repositorio (2.477,3 GB) y de cada cuantización (13 partes) complica la descarga y el almacenamiento; se requiere planificación de infraestructura.
- En hardware consumer (RTX 4090/3090) no cabe ningún archivo completo, ni siquiera con offloading según la tabla del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Hy4-GGUF
- Modelo base: https://huggingface.co/tencent/Hy4
- Licencia: https://huggingface.co/Xylolabs/Hy4-GGUF/blob/main/LICENSE
- PR de llama.cpp con soporte Hy4: https://github.com/ggml-org/llama.cpp/pull/32517
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Paper arXiv 2512.02556: https://arxiv.org/abs/2512.02556
- Paper arXiv 2603.12201: https://arxiv.org/abs/2603.12201
