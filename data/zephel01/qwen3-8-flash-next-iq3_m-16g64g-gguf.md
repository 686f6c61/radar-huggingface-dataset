# zephel01/Qwen3.8-Flash-Next-IQ3_M-16G64G-GGUF

## Resumen

Qwen3.8-Flash-Next-IQ3_M-16G64G-GGUF es una cuantización GGUF del modelo Qwen3.8-Flash-Next, publicada por el usuario zephel01 bajo el paraguas del motor de inferencia Abyss. El objetivo declarado es hacer viable un modelo de arquitectura MoE de gran tamano (176.943.899.520 parametros totales, unos 177 mil millones) en un PC de consumo con una GPU de 16 GB de VRAM y 64 GB de RAM, manteniendo los 512 expertos del modelo original sin podar ninguno. Se distribuye en tres shards que suman 86,9 GB.

La receta de cuantización es mixta y no corresponde a un tipo estándar de llama.cpp: los tensores de expertos gate/up se cuantizan en IQ3_XXS (con la capa 2 en IQ3_S) y los down en IQ4_NL, lo que da una media de 3,55 bits por peso, aproximadamente equivalente a un IQ3_M. Los tensores no expertos (atención, router, experto compartido, embeddings y la tabla de embeddings por capa) se toman sin modificar de la cuantización UD-IQ3_XXS de unsloth. La tabla de embeddings por capa ocupa 28,8 GB en IQ4_NL y se lee desde SSD unas pocas filas por token.

El interés actual del artefacto es doble: por un lado demuestra que un MoE de este tamano puede ejecutarse en hardware de consumo con offload parcial de expertos a CPU y lectura de embeddings desde disco; por otro, la model card reporta una mejora sustancial de calidad frente a la referencia UD-IQ3_XXS (KL de 0,083 frente a 0,154, es decir, un 46 % menos) a costa de 4,9 GB adicionales de descarga. El estado es BETA y las mediciones provienen de un único equipo emulado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE tipo transformer (arquitectura llama.cpp `qwen4exp`), 512 expertos por capa |
| Parametros totales | 176.943.899.520 (~177 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 32.768 tokens en el ejemplo de llama-server (`-c 32768`); máximo del modelo base no disponible |
| Tipos de cuantizacion | mixta: expertos gate/up IQ3_XXS (capa 2 IQ3_S), expertos down IQ4_NL, media 3,55 bits/peso (~IQ3_M); tabla de embeddings por capa IQ4_NL (28,8 GB); tensores no expertos de UD-IQ3_XXS de unsloth |
| Idiomas soportados | inglés y japonés (según etiquetas de la model card); cobertura real multilingüe del modelo base no disponible |
| Licencia | qwen-community-1.0 (`license: other`) |
| Formato de pesos | GGUF, 3 shards (`-00001-of-00003.gguf` a `-00003-of-00003.gguf`), 86,9 GB; `SHA256SUMS` incluido |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer con mezcla de expertos (MoE) de 512 expertos por capa, según se deduce de la receta de cuantización descrita en la model card. La arquitectura de llama.cpp utilizada es `qwen4exp`, soportada en el upstream `ac8e1694d` del 29 de octubre de 2026. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base empleó RLHF o DPO; esos datos corresponden a la model card de Qwen y no están incluidos en la información proporcionada.

La innovación técnica de este artefacto es la receta de cuantización: cada experto se recuantiza con LDLQ (Lattice-based Diagonal Linear Quantization) a partir de los pesos en formato NVFP4 de NVIDIA, manteniendo el layout de UD-IQ3_XXS de unsloth con gate/up un paso por encima. La calibración se realizó con los propios turnos de chat del modelo (181 prompts, 44 en japonés) más texto mixto en los mismos idiomas, e incluye una matriz de importancia (imatrix). No se eliminó ningún experto. El resultado es un fichero que mezcla varios tipos de cuantización por tensor en lugar de aplicar un tipo uniforme.

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline declarado `text-generation` y compatibilidad con endpoints (`endpoints_compatible`).
- Razonamiento y código: la model card evalúa explícitamente tareas de código (KL sobre código de 0,108) y prompts de programación reales.
- Japonés: se reporta un KL específico para texto japonés de 0,176 y 5 de 5 respuestas correctas en prompts reales en japonés.
- Contexto largo: se verificó la recuperación de una aguja (needle) a 8K tokens dentro de una ventana configurada de 32K.
- Compatibilidad con llama.cpp y con el motor Abyss (v1.3.108 o superior), incluyendo servidor compatible con la API `/v1/chat/completions`.
- Modo de razonamiento (thinking) activable, según las pruebas de uso real descritas.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Visión o audio: no disponible; el pipeline es únicamente de texto.

## Casos de uso

- Asistente de código en local: el modelo puede integrarse en un servidor llama.cpp o Abyss expuesto por API compatible con OpenAI y usarse desde editores o CLIs de programación. La ventana de 32K permite incluir varios ficheros de contexto y la cuantización mixta preserva mejor el comportamiento en código (KL 0,108) que la referencia UD-IQ3_XXS.
- Atención al cliente en japonés e inglés: la model card reporta buen comportamiento en japonés (5/5 respuestas no vacías en prompts reales) y un KL específico de 0,176, lo que lo hace adecuado para despliegues bilingües en mercados japonés e inglés sobre hardware de consumo.
- Procesamiento de documentos largos: con 32K tokens de contexto y la aguja a 8K verificada, sirve para resumir contratos, informes técnicos o hilos de correo extensos en una sola pasada.
- Inferencia en estación de trabajo con GPU de 16 GB: el caso de uso central del artefacto es ejecutar un MoE de 177B en equipos con RTX 5090, RTX 4080/4090 con VRAM limitada o GPUs de 16 GB, descargando expertos a RAM y leyendo la tabla de embeddings desde SSD.
- Laboratorio de investigación en cuantización: sirve como referencia reproducible para comparar recetas LDLQ frente a cuantizaciones estándar (UD-IQ3_XXS, GSQ-RCO IQ3_S, UD-IQ4_XS) midiendo KL y coincidencia de top token.
- Prototipado de agentes conversacionales: el servidor Abyss expone `/v1/chat/completions`, lo que permite conectarlo a frameworks de orquestación existentes sin cambios de código, siempre que se acepte la latencia de decodificación de 29-34 tok/s.
- Evaluación de despliegues con offload CPU/GPU: útil para medir el impacto de `--n-cpu-moe` en latencia y calidad antes de invertir en hardware con más VRAM.

## Benchmarks y rendimiento

La model card reporta métricas de divergencia KL frente al modelo en NVFP4 (10 secuencias retenidas de 1.023 tokens cada una, con código, inglés, chino, japonés y otros idiomas), medidas con el motor Abyss:

| Modelo | Descarga | Residente (GPU + RAM) | KL (10 seqs) | Mismo top token | KL japonés | KL código |
|---|---:|---:|---:|---:|---:|---:|
| Este fichero (16G64G) | 86,9 GB | 57,6 GB | 0,083 | 89,3 % | 0,176 | 0,108 |
| unsloth UD-IQ3_XXS | 82,0 GB | 52,6 GB | 0,154 | 85,9 % | 0,317 | 0,176 |
| ISTA-DASLab GSQ-RCO IQ3_S | 83,6 GB | 54,8 GB | 0,117 | 87,3 % | 0,251 | 0,149 |
| unsloth UD-IQ4_XS (tier 24 GB) | 93,7 GB | 64,9 GB | 0,092 | 88,7 % | 0,195 | 0,116 |

Nota: la columna "residente" excluye la tabla de embeddings por capa de 28,8 GB, que se lee desde SSD.

Rendimiento de velocidad medido en un PC emulado (RTX 5090 limitada a 16 GB de VRAM, tier de RAM de 46 GB dentro de un cgroup de 58 GB):

| Motor / configuración | Velocidad en tareas de código |
|---|---:|
| Este fichero con Abyss | 70,7 tok/s |
| unsloth UD-IQ3_XXS con Abyss | 71,3 tok/s |

Con llama.cpp (`-ngl 99 --n-cpu-moe 39 -c 32768`) la decodificación medida fue de 29-34 tok/s, con 16,4 GB de VRAM consumidos. En prompts reales: japonés 5/5, código 3/5, aguja a 8K encontrada.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 16 GB es el objetivo de diseño; con llama.cpp y `--n-cpu-moe 39` se midieron 16,4 GB, por lo que en una tarjeta real de 16 GB conviene subir `--n-cpu-moe` a 40 o más.
- RAM: 64 GB en el equipo objetivo; el tier de RAM configurado en Abyss es `STRATA_GLM_RAM_GB=46` dentro de un cgroup de 58 GB.
- Almacenamiento: 86,9 GB de descarga más espacio para la caché del motor; se recomienda SSD por la lectura de la tabla de embeddings por capa (28,8 GB) unas pocas filas por token.
- GPU recomendadas: RTX 5090 (objetivo de las pruebas), cualquier GPU de 16 GB (RTX 4080, RTX 4060 Ti 16 GB, A4000); también funciona en DGX Spark (128 GB) con los mismos ficheros. Para el tier de 24 GB existe el repo IQ3_M-24G64G (93,7 GB); para 12 GB + 32 GB, el E448-IQ2_M (67,5 GB, 448 de 512 expertos).
- Cabe en GPU de consumo: sí, con offload parcial de expertos a CPU y lectura de embeddings desde disco.
- Opciones de despliegue: Abyss v1.3.108 o superior (recomendado, con `setup-deepseek.sh`/`.bat`), llama.cpp con arquitectura `qwen4exp` (upstream `ac8e1694d` del 2026-10-29). vLLM, TGI y Ollama no están documentados en la información disponible.
- Latencia y throughput: 70,7 tok/s en el PC emulado con Abyss; 29-34 tok/s con llama.cpp y `--n-cpu-moe 39`. Muestreo recomendado: temperature 1.0, top_p 0.95, top_k 20.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad (KL vs NVFP4) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este fichero (16G64G) | ~177B totales, 512 expertos | 32K en pruebas | 0,083 | qwen-community-1.0 | GGUF, 86,9 GB |
| unsloth UD-IQ3_XXS | mismo modelo base | no disponible | 0,154 | según modelo base | GGUF, 82,0 GB |
| ISTA-DASLab GSQ-RCO IQ3_S | mismo modelo base | no disponible | 0,117 | según modelo base | GGUF, 83,6 GB |
| unsloth UD-IQ4_XS (tier 24 GB) | mismo modelo base | no disponible | 0,092 | según modelo base | GGUF, 93,7 GB |

Las tres alternativas son cuantizaciones del mismo Qwen3.8-Flash-Next, por lo que la comparación relevante es de receta, tamano y calidad, no de arquitectura. Frente a UD-IQ3_XXS, este fichero mejora el KL un 46 % con 4,9 GB más de descarga y una velocidad prácticamente idéntica en Abyss. Frente a UD-IQ4_XS, ofrece un KL ligeramente mejor (0,083 frente a 0,092) con 6,8 GB menos de descarga y 7,3 GB menos de memoria residente, a cambio de requerir un tier de 16 GB + 64 GB en lugar de 24 GB. No se dispone de comparación con modelos de otros desarrolladores del mismo tamano en la información proporcionada.

## Limitaciones y advertencias

- Estado BETA: las mediciones provienen de un único PC emulado (RTX 5090 capada a 16 GB); el autor solicita reportes de GPUs reales de 16 GB y de otros tamanos de RAM.
- El nombre "IQ3_M" es aproximado: los ficheros mezclan IQ3_XXS, IQ4_NL e IQ3_S, por lo que no es una cuantización estándar de llama.cpp y las herramientas que asuman un tipo uniforme pueden dar resultados inesperados.
- La tabla de embeddings por capa (28,8 GB) se lee desde SSD en cada token; sin SSD rápido el rendimiento puede degradarse notablemente y el desgaste del disco es una consideración a largo plazo.
- El offload de expertos a CPU (`--n-cpu-moe`) es imprescindible en GPUs de 16 GB, lo que limita el throughput a 29-34 tok/s en llama.cpp, muy por debajo de lo que obtendría el modelo en VRAM completa.
- Cobertura idiomática declarada limitada a inglés y japonés; el rendimiento en castellano no está documentado y el KL se midió sobre todo en inglés, japonés y código.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad ni de sesgos en la información disponible; al ser una cuantización de 3,55 bits/peso, es esperable cierta degradación adicional frente al modelo en precisión completa, especialmente en razonamiento matemático y contextos muy largos.
- Licencia `qwen-community-1.0` (marcada como `other`): conviene revisar los términos del modelo base antes de uso comercial; la model card enlaza al LICENSE de Qwen.
- Compatibilidad: requiere Abyss v1.3.108+ o un llama.cpp con soporte de la arquitectura `qwen4exp` (upstream `ac8e1694d`); versiones anteriores no cargarán el modelo.
- La recuperación de contexto largo solo se verificó con una aguja a 8K dentro de una ventana de 32K; el comportamiento más allá de esa distancia no está documentado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zephel01/Qwen3.8-Flash-Next-IQ3_M-16G64G-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Motor Abyss: https://github.com/zephel01/Abyss
- Variante 12G32G (12 GB GPU + 32 GB RAM): https://huggingface.co/zephel01/Qwen3.8-Flash-Next-E448-IQ2_M-12G32G-GGUF
- Variante 24G64G (24 GB GPU + 64 GB RAM): https://huggingface.co/zephel01/Qwen3.8-Flash-Next-IQ3_M-24G64G-GGUF
- Variante DGX Spark: https://huggingface.co/zephel01/Qwen3.8-Flash-Next-DGX-Spark-GGUF
- Formulario para reportar resultados de benchmarks: https://github.com/zephel01/Abyss/issues/new?template=bench.md&title=Bench:+Qwen3.8-Flash-Next+16G64G+on+YOUR_GPU
