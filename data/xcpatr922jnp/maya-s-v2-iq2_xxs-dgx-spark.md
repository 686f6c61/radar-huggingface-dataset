# xcpatr922JNP/Maya-S-v2-IQ2_XXS-DGX-Spark

## Resumen

Este repositorio de Hugging Face no aloja un modelo con pesos propios: es el registro de una ejecución concreta y de sus mediciones. Documenta el comportamiento de la cuantización IQ2_XXS (2,0625 bits por peso) de GLM-5.3-Flash, un modelo MoE de 321B parámetros desarrollado por Z.ai, ejecutado en una única NVIDIA DGX Spark (GB10, 20 núcleos ARM, 120 GB de LPDDR5X compartidos entre CPU y GPU) con el motor Project Maya v1.1.26 y su port a aarch64.

El interés técnico está en el escenario: meter un MoE de 321B en una máquina de sobremesa con memoria unificada, manteniendo los 12.096 expertos en memoria (80,17 GB de los 120 GB) y una tasa de acierto de caché de expertos del 99,97%. El pack GGUF ocupa 89,83 GiB en tres shards y se distribuye desde el repositorio de peasantsmith, no desde este.

Las cifras publicadas son de decodificación a 21,2 tokens/s (16,8 sin el drafter DFlash2) y prefill de 732 tokens/s con prompts de 8K, con contexto configurado de 131.072 tokens sobre un modelo que soporta hasta 1M. El valor práctico del repositorio es doble: sirve como referencia de rendimiento reproducible en aarch64 y como comparativa directa contra llama.cpp upstream sobre los mismos pesos y la misma GPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (arquitectura `glm5-next`), con bloque MTP de borrador especulativo |
| Parámetros totales | 321B (GLM-5.3-Flash, según la descripción del proyecto en GitHub) |
| Parámetros activos | no disponible |
| Expertos enrutados | 12.096 (todos residentes en memoria en esta ejecución) |
| Longitud de contexto | 131.072 tokens configurados; el modelo base soporta 1M |
| Tipos de cuantización | IQ2_XXS en expertos gate/up (con redondeo por realimentación de error), IQ2_S e IQ3_XXS en proyecciones down, Q6_K en atención y bloque MTP, Q8_0 en expertos compartidos, capas densas, embeddings y salida; 2,0625 bpw |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | GGUF (3 shards, 89,83 GiB; 96,5 GB en las mediciones del proyecto) |
| Tamaño del pack | 89,83 GiB |
| Alojamiento de pesos | Externo: `peasantsmith/GLM-5.3-Flash-Maya-GGUF`, carpeta `Maya-S-v2-IQ2_XXS`, revisión `main` |

## Arquitectura y entrenamiento

El modelo subyacente es GLM-5.3-Flash de Z.ai, un transformer de mezcla de expertos con 321B parámetros totales, implementado en llama.cpp bajo la arquitectura `glm5-next`. La innovación relevante en esta ejecución es la conservación del bloque MTP (*multi-token prediction*) del modelo original, que actúa como borrador para decodificación especulativa: el motor lo usa con un drafter DFlash2 que adelanta tokens y eleva la decodificación de 16,8 a 21,2 tokens/s. El pack mantiene además todos los expertos enrutados residentes en el pool de memoria, dimensionado a partir de `MemAvailable` de `/proc/meminfo` con 16 GB de margen para el sistema y 1.024 MiB de reserva para el driver, y con niveles inferiores en RAM y en disco.

No hay información sobre el entrenamiento del modelo base en la documentación disponible: no se indican tokens de entrenamiento, composición del dataset, ni fases de RLHF, DPO o RL. Este repositorio tampoco entrena nada; solo documenta la cuantización (realizada por Project Maya a partir del release FP8 de Z.ai, usando estadísticas del propio modelo FP8) y las mediciones de inferencia. La cuantización aplica redondeo por realimentación de error en los expertos gate/up y sube un escalón las proyecciones down de las capas 3-6 y 41-44 a IQ3_XXS.

## Capacidades

- Generación de texto en inglés y chino, con el modo *thinking* del modelo disponible pero desactivado en todas las mediciones publicadas (respuestas greedy).
- Contexto largo: 131.072 tokens configurados en esta ejecución, sobre un modelo que soporta hasta 1M; el prefill se mantiene en 769 tokens/s con prompts de 16K.
- Decodificación especulativa mediante el bloque MTP del modelo y el drafter DFlash2 del motor, con ganancia medida del 26% en decodificación a contexto corto (16,8 a 21,2 tokens/s).
- Servido como API compatible con OpenAI en `http://127.0.0.1:8080/v1`, lo que permite integrarlo con clientes y frameworks que hablan el protocolo de OpenAI.
- Inferencia íntegramente local en aarch64 (DGX Spark, GB10, `sm_121`), sin dependencia de servicios en la nube.
- Soporte de *tool calling* / *function calling*: no documentado en la información disponible para esta ejecución.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible; el modo thinking existe pero no se evalúa.
- Visión: el script de instalación incluye un flag `--no-vision` que sugiere soporte en el motor, pero no hay confirmación ni evaluación de capacidad de visión para este modelo.

## Casos de uso

- Agentes locales siempre encendidos: la DGX Spark está pensada para cargas de agente continuas y el motor mantiene los 12.096 expertos residentes, de modo que un asistente con herramientas puede responder sin recargar el modelo entre peticiones ni enviar datos a la nube.
- Procesamiento de documentos largos en inglés o chino: con 131.072 tokens de contexto y 769 tokens/s de lectura de prompt a 16K, es viable resumir contratos, informes o expedientes completos en una sola pasada, sin troceado en chunks.
- Asistencia de código en entorno controlado: el modelo se sirve por una API compatible con OpenAI, así que plugins de editor y CLIs que acepten `base_url` local pueden apuntar a `127.0.0.1:8080` para autocompletado y explicación de código sin salida de datos.
- Extracción y clasificación por lotes sobre corpus bilingües: el prefill de 732-754 tokens/s a 8K permite encolar prompts largos en procesos batch nocturnos; el cuello de botella real es la decodificación (21 tokens/s), por lo que conviene pedir salidas cortas y estructuradas.
- Sustitución de APIs comerciales con requisitos de soberanía de datos: al ejecutarse sobre MIT y sin tráfico saliente, encaja en entornos donde el texto no puede salir de la infraestructura propia, aceptando el coste de una máquina de 120 GB de memoria unificada.
- Investigación en cuantización extrema: el pack a 2,0625 bpw y las cifras del motor sirven de referencia para estudiar la degradación de calidad y el coste de rendimiento de IQ2_XXS en MoE grandes, comparando contra llama.cpp con los mismos pesos.
- Evaluación de portabilidad aarch64: los documentos `DGX_SPARK.md` y `DGX_SPARK_BUILD.md` permiten reproducir la compilación para `sm_121a` y validar kernels NEON de ggml-cpu en Cortex-X925.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las únicas cifras son de rendimiento de inferencia, medidas en una sola DGX Spark, con respuestas greedy de 256 tokens y thinking desactivado.

Ejecución principal (motor Project Maya):

| Métrica | Valor |
|---|---|
| Decodificación, respuestas de 256 tokens (con drafter DFlash2) | 21,2 tokens/s |
| Decodificación, respuestas de 256 tokens (sin drafter) | 16,8 tokens/s |
| Prefill, prompt de 8K | 732 tokens/s |
| Lectura de prompt a 16K | 769 tokens/s |
| Acierto de caché de expertos | 99,97% |
| Expertos residentes | 12.096 de 12.096 (80,17 GB) |
| Contexto configurado | 131.072 tokens |

Comparativa del mismo GGUF y la misma GPU contra llama.cpp upstream (`272aad8b9`, primera versión con `glm5-next`, compilada para `sm_121a`):

| Métrica | Maya | llama.cpp | Diferencia |
|---|---:|---:|---:|
| Prefill, prompt de 32K | 754 tok/s | 239 tok/s | 3,2x |
| Prefill, prompt de 8K | 744 tok/s | 277 tok/s | 2,7x |
| Prefill, prompt de 512 | 303 tok/s | 314 tok/s | empate |
| Decodificación, contexto corto | 22,9 tok/s | 17,5-17,8 tok/s | 1,29x |
| Decodificación, contexto 2K | 22,9 tok/s | 15,7 tok/s | 1,46x |
| Decodificación, contexto 8K | 21,1 tok/s | 15,6 tok/s | 1,35x |

Nota metodológica del propio autor: las filas de decodificación comparan Maya con drafter frente a llama.cpp sin drafter, porque el pack no incluye bloque MTP y esa compilación de llama.cpp no tiene DFlash2. Sin drafter, Maya empata en contexto corto (17,4 frente a 17,7) y gana un 3-7% en contexto largo (16,8 frente a 15,7 a 2K). Las cifras de prefill de 8K difieren ligeramente entre las dos tablas del repositorio (732 frente a 744 tokens/s).

## Requisitos de hardware

- VRAM estimada: no hay VRAM dedicada; se necesitan al menos 89,83 GiB para los pesos más el margen de contexto. En la ejecución de referencia, 80,17 GB de expertos residen en el pool y el resto se reparte entre capas no expertas y caché.
- Máquina de referencia: NVIDIA DGX Spark con GB10 (`sm_121`, compute capability 12.1), 20 núcleos ARM Cortex-X925, 120 GB de LPDDR5X compartidos entre CPU y GPU, Ubuntu 24.04 aarch64, driver 580.95.05, CUDA 13.0.
- GPU consumer: no cabe en ninguna GPU de consumo actual; 89,83 GiB excede con mucho los 24 GB de una RTX 4090 o los 32 GB de una RTX 5090. Solo es viable en sistemas con memoria unificada grande o en configuraciones multi-GPU con suficiente memoria agregada.
- Opciones de despliegue: Project Maya v1.1.26 con el port aarch64 (`./maya.sh --setup --yes --gpu 0 --context 131072 --no-vision --download-model` y `./serve-maya.sh start`), y llama.cpp con soporte `glm5-next` compilado para `sm_121a`. vLLM, TGI y Ollama no están documentados para este pack en la información disponible.
- Latencia y throughput: 21,2 tokens/s de decodificación con drafter y 732-769 tokens/s de prefill entre 8K y 16K. A 21 tokens/s, una respuesta de 500 tokens tarda unos 24 segundos, lo que descarta uso interactivo de baja latencia y favorece cargas batch o asíncronas.
- Almacenamiento: los tres shards GGUF suman 89,83 GiB y el motor contempla un nivel de disco por debajo del de RAM, por lo que conviene reservar espacio adicional para la caché.

## Comparativa con modelos similares

| Alternativa | Parámetros | Contexto | Rendimiento en la misma máquina | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este pack (IQ2_XXS + Project Maya) | 321B MoE | 131.072 configurados (1M del modelo) | 754 tok/s prefill 32K; 21,2 tok/s decode con drafter | MIT | GGUF en `peasantsmith/GLM-5.3-Flash-Maya-GGUF` |
| Mismo GGUF con llama.cpp upstream | 321B MoE | 131.072 | 239 tok/s prefill 32K; 17,5-17,8 tok/s decode sin drafter | MIT | llama.cpp `272aad8b9` o superior |
| GLM-5.3-Flash en FP8 (original de Z.ai) | 321B MoE | 1M | no disponible | MIT | `zai-org/GLM-5.3-Flash` |
| Maya-S v1 (IQ2_XXS en todas las proyecciones down) | 321B MoE | no disponible | no disponible | MIT | Repositorio de Project Maya |

No se dispone de datos de benchmarks de calidad ni de rendimiento de modelos alternativos de tamaño comparable en esta misma máquina, por lo que la comparación se limita a variantes del mismo modelo base.

## Limitaciones y advertencias

- Este repositorio no contiene pesos: es documentación y mediciones. Cualquier uso requiere descargar el GGUF desde `peasantsmith/GLM-5.3-Flash-Maya-GGUF`.
- Cuantización muy agresiva: 2,0625 bpw sobre un MoE de 321B implica una pérdida de calidad esperable, y no se han publicado evaluaciones de perplejidad ni de benchmarks académicos que la cuantifiquen. No recomendable para tareas de precisión sin validación propia.
- Todas las cifras provienen de una única máquina, con respuestas greedy y thinking desactivado. La varianza entre equipos, versiones de driver y compilaciones puede ser significativa; las dos tablas del propio repositorio ya discrepan en prefill de 8K (732 frente a 744 tok/s).
- Idiomas: solo inglés y chino declarados. El rendimiento en castellano no está evaluado y no debería asumirse.
- Decodificación sin drafter de 16,8 tokens/s: insuficiente para interfaces conversacionales con latencia estricta; incluso con drafter, 21,2 tokens/s limita el uso a flujos asíncronos.
- Memoria muy ajustada: 80,17 GB de expertos sobre 120 GB compartidos deja poco margen para contexto largo, sistema operativo y otros procesos; la compartición CPU/GPU implica contención y posibles caídas de throughput bajo carga concurrente.
- El modo thinking existe pero no está evaluado; las cifras publicadas no lo cubren.
- Licencia MIT tanto en el repositorio como en el pack y en los pesos originales según la model card, pero conviene verificar la licencia vigente en `zai-org/GLM-5.3-Flash` antes de un despliegue comercial, ya que este repositorio solo documenta.
- Dependencia de una compilación concreta de ggml/llama.cpp (`3cf03257`) y de un port aarch64 específico; la reproducibilidad exige fijar ambas versiones.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/xcpatr922JNP/Maya-S-v2-IQ2_XXS-DGX-Spark
- Pesos GGUF (cuantización): https://huggingface.co/peasantsmith/GLM-5.3-Flash-Maya-GGUF
- Modelo original: https://huggingface.co/zai-org/GLM-5.3-Flash
- Project Maya (motor): https://github.com/mw00/project-maya
- Port aarch64: https://github.com/mw00/project-maya/blob/main/docs/DGX_SPARK.md
- Guía de compilación aarch64: https://github.com/mw00/project-maya/blob/main/docs/DGX_SPARK_BUILD.md
- Metodología de benchmark: https://github.com/mw00/project-maya/blob/main/BENCHMARK.md
- Resultados de Maya-S v2: https://github.com/mw00/project-maya/blob/main/bench/results/MAYA-S-V2.md
- ggml / llama.cpp: https://github.com/ggml-org/llama.cpp
- Recetas para DGX Spark: https://mia-ai.net/models
- Página oficial de NVIDIA DGX Spark: https://www.nvidia.com/en-us/products/workstations/dgx-spark/
- Perfil del autor: https://github.com/xcpatr9231975
