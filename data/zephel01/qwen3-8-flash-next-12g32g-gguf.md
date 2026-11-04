# zephel01/Qwen3.8-Flash-Next-12G32G-GGUF

## Resumen

Qwen3.8-Flash-Next-12G32G-GGUF es una cuantización GGUF del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario zephel01 bajo el nombre de su motor de inferencia Abyss. No se trata de un modelo entrenado desde cero, sino de una recompresión agresiva pensada para ejecutarse en un PC con una única GPU de 12 GB de VRAM y 32 GB de RAM. El modelo base es un transformer de tipo mixture-of-experts (MoE) con 161.836.540.800 parámetros totales, según los safetensors del repositorio original.

La innovación de esta ficha es la técnica de cuantización: cada experto se recuantiza con LDLQ (Lattice-based Distributed Lloyd Quantization) a partir de los pesos en formato NVFP4, manteniendo la disposición de tensores de la cuantización UD-IQ1_S de unsloth. Además, se poda el número de expertos por capa de 512 a 448, lo que reduce el tamaño del repositorio a 67,5 GB frente a los 72,5 GB de la referencia UD-IQ1_S.

El resultado declarado por el autor es un modelo un 30 % más rápido (56,0 frente a 43,0 tok/s en tareas de código) que la referencia en el mismo hardware emulado, con una divergencia KL (0,339) prácticamente idéntica a la de UD-IQ1_S (0,331) y mejor KL en japonés. La ficha se publica como BETA y las mediciones provienen de un único PC, por lo que la reproducibilidad en otros equipos está por confirmar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts), según tags del repo (`moe`) |
| Parámetros totales | 161.836.540.800 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF con mezcla IQ1_S / IQ2_XXS / IQ4_NL por tensor; expertos recuantizados con LDLQ |
| Idiomas soportados | no disponible oficialmente; la calibración y los tests cubren japonés, chino, inglés y código |
| Licencia | qwen-community-1.0 (etiquetada como `other` en HuggingFace) |
| Formato de pesos | GGUF (3 shards, `L448/Qwen3.8-Flash-Next-12G32G-L448-0000N-of-00003.gguf`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer de tipo mixture-of-experts. Esta ficha no entrena el modelo: parte de los pesos NVFP4 publicados por magnitudedev y los recuantiza. El proceso, documentado en la model card, consta de cuatro pasos ejecutados con las herramientas `trench-gguf` (`hessian_dump.cpp`, `requant_experts.py`, `merge_experts.py`, `prune_experts.py`) y el contador de routing de Abyss (`STRATA_GLM_USAGE`).

Primero se calculan matrices de Hessian sobre 1,26 millones de tokens compuestos por los propios turnos de chat del modelo (181 prompts: 44 en japonés, 20 en chino, 20 en inglés, 37 de código, 35 de matemáticas y 25 de tool calls) seguidos de texto mixto en los mismos idiomas y dominios. Después, cada experto se recuantiza con LDLQ desde los pesos NVFP4, con las escalas por experto plegadas, en la disposición de UD-IQ1_S: gate/up en IQ1_S (o IQ2_XXS en 14 capas) y down en IQ4_NL. Finalmente se seleccionan los 448 expertos más usados por capa mediante conteos de routing ponderados por dominio (código con doble peso) y se podan las filas del router correspondientes. Las rutas retenidas sobre texto held-out son: japonés 98,6 %, chino 98,1 %, inglés 98,3 %, código 96,9 %, matemáticas 98,2 % y herramientas 99,1 %.

Los tensores no pertenecientes a expertos (atención, router, experto compartido, embeddings y tabla PLE) se conservan sin modificar a partir de los bytes de UD-IQ1_S. El desglose de tamaño es: 34,9 GB de expertos, 28,8 GB de tabla de embeddings por capa y 3,9 GB para el resto.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte de modo pensamiento (`thinking`) y cierre explícito mediante `</think>`.
- Razonamiento y resolución de problemas aritméticos y de conocimiento factual; el autor reporta respuestas correctas en 5 prompts japoneses de correo comercial, explicación, resumen, dato literario y aritmética.
- Generación de código: las pruebas del autor incluyen tareas de programación con tests ocultos (3/5 y 3/5 en dos semillas), incluida una conversión de hiragana a katakana.
- Tool calling / function calling: la calibración incluye 25 prompts de llamadas a herramientas y la retención de rutas en ese dominio es del 99,1 %.
- Capacidad multilingüe verificada en la práctica para japonés, chino e inglés, aunque los idiomas oficiales del modelo base no están declarados en esta ficha.
- Recuperación de información en contexto largo: el autor reporta prueba de "needle in a haystack" correcta con un prompt de 8K tokens.

## Casos de uso

- Asistente conversacional en japonés sobre hardware de gama media: el modelo responde correctamente a prompts de correo comercial, resumen y explicación en japonés con 48-51 tok/s de decodificación, lo que permite usarlo como chatbot local en una GPU de 12 GB.
- Generación de código en local para desarrolladores con PC de consumo: las tareas de programación con tests ocultos se resuelven en 3 de 5 casos, suficiente para autocompletado, generación de tests y refactorizaciones pequeñas en un flujo de trabajo individual.
- Automatización de agentes con tool calling: la retención de rutas del 99,1 % en el dominio de herramientas y la inclusión de 25 prompts de tool calls en la calibración lo hacen viable para pipelines de agentes que invocan APIs, aunque el autor advierte de que el modelo tiende al sobrepensamiento en algunas tareas.
- Procesamiento de documentos largos con recuperación: la ventana de contexto del modelo base no está confirmada en esta ficha, pero el autor valida la recuperación de un dato en un prompt de 8K tokens, lo que permite usarlo para extracción de información de contratos, informes o documentación técnica.
- Despliegue en entornos con restricciones de VRAM: al caber en 12 GB de VRAM más 32 GB de RAM, es adecuado para estaciones de trabajo modestas, portátiles con GPU dedicada o servidores de un solo usuario donde no se puede alojar la versión completa del modelo.
- Traducción y generación multilingüe japonés-inglés-chino: la calibración incluye estos tres idiomas y el autor reporta un KL en japonés de 0,553, ligeramente mejor que la referencia UD-IQ1_S (0,568), lo que lo hace útil para tareas de traducción asistida y localización.
- Experimentación e investigación en cuantización: el repositorio documenta todo el pipeline (Hessians, LDLQ, poda de expertos) y publica `SHA256SUMS`, lo que permite reproducir y auditar el proceso de compresión para investigación en técnicas de cuantización de MoE.

## Benchmarks y rendimiento

Los datos disponibles provienen exclusivamente de la model card del autor y se midieron en un PC emulado sobre una RTX 5090 con VRAM limitada a 12 GB, RAM de 20 GB en un cgroup de 28 GB, 8 hilos de CPU y SSD NVMe.

| Métrica | L448 (esta ficha) | unsloth UD-IQ1_S | llama.cpp con UD-IQ1_S (`--n-cpu-moe 41`) |
|---|---|---|---|
| Tamaño del repositorio | 67,5 GB | 72,5 GB | — |
| KL (10 secuencias) | 0,339 | 0,331 | — |
| Mismo token top | 78,5 % | 78,4 % | — |
| KL en japonés | 0,553 | 0,568 | — |
| Decodificación, 3 tareas de código (17K tokens) | 56,0 tok/s | 43,0 tok/s | 27,6 tok/s |
| Procesamiento de prompt (8K) | 1.822 tok/s | 1.368 tok/s | — |
| Decodificación en japonés | 48-51 tok/s | 39-46 tok/s | — |
| Tareas de código con tests ocultos (semilla 1 / semilla 2) | 3/5, 3/5 | 5/5, 3/5 | — |
| Prompts japoneses (5) | 10/10 correctos | 10/10 correctos | — |
| "Japan's three great essays" (tokens de pensamiento) | 196 / 165 | 454 / 384 | — |
| Needle in a haystack (8K) | OK / OK | OK / OK | — |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 12 GB de VRAM dedicada, con el resto de los pesos en RAM del sistema (20 GB en el tier configurado por el autor).
- RAM del sistema: 32 GB recomendados; el autor probó con 20 GB asignados en un cgroup de 28 GB.
- GPU recomendadas: el autor solo ha medido en una RTX 5090 con VRAM limitada a 12 GB; no hay datos de otras GPU. Cualquier GPU con al menos 12 GB de VRAM (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, A100, H100) podría ejecutarlo, pero el rendimiento no está verificado.
- Almacenamiento: SSD NVMe, ya que la tabla de embeddings por capa (28,8 GB) puede leerse desde disco en lugar de residir en RAM.
- Opciones de despliegue: motor Abyss v1.3.106 o superior (recomendado por el autor, con `tools/iq_pack.py --fast` para empaquetar) y llama.cpp. No se mencionan vLLM, Ollama ni TGI en la información disponible.
- Latencia y throughput: 56,0 tok/s de decodificación en tareas de código y 1.822 tok/s de procesamiento de prompt de 8K en el hardware emulado descrito; no hay mediciones en otros equipos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tamaño | Licencia | Rendimiento |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-12G32G-L448 (esta ficha) | 161,8 B totales | no disponible | 67,5 GB | qwen-community-1.0 | 56,0 tok/s; KL 0,339; 3/5 en código |
| unsloth UD-IQ1_S de Qwen3.8-Flash-Next | 161,8 B totales | no disponible | 72,5 GB | qwen-community-1.0 | 43,0 tok/s; KL 0,331; 5/5 y 3/5 en código |
| llama.cpp con UD-IQ1_S (`--n-cpu-moe 41`) | 161,8 B totales | no disponible | 72,5 GB | qwen-community-1.0 | 27,6 tok/s |
| Qwen3.8-Flash-Next en NVFP4 (magnitudedev) | 161,8 B totales | no disponible | no disponible | qwen-community-1.0 | referencia de calidad para el cálculo de KL |

No se dispone de datos de otros modelos comparables de la misma categoría (MoE de más de 100 B parámetros cuantizados para GPU de 12 GB) en la información proporcionada.

## Limitaciones y advertencias

- Estado BETA: las mediciones provienen de un único PC emulado y el propio autor solicita reportes de otros equipos; el rendimiento en GPU distintas no está verificado.
- Calidad ligeramente inferior a la referencia UD-IQ1_S en KL global (0,339 frente a 0,331) y en tareas de código (3/5 frente a 5/5 en una de las semillas), aunque mejor en japonés.
- Tendencia al sobrepensamiento: una tarea de conversión hiragana/katakana hace que el modelo piense hasta el límite de tokens en la mayoría de ejecuciones; requiere ajustar `max_tokens` o reducir el modo pensamiento.
- Riesgo de respuestas vacías: la primera versión de esta cuantización terminaba el turno tras el pensamiento sin responder; el autor indica que la calibración con turnos de chat y la guarda `STRATA_GLM_END_GUARD` de Abyss v1.3.106 lo mitigan, pero el riesgo persiste en otros motores.
- Idiomas oficiales del modelo base no declarados: la cobertura multilingüe verificada se limita a japonés, chino e inglés en la calibración y los tests.
- Licencia qwen-community-1.0: es necesario revisar los términos del modelo base para uso comercial, ya que la licencia se etiqueta como `other` en HuggingFace y no se detallan restricciones en esta ficha.
- Sesgos conocidos: no se documentan en la información disponible; al ser una cuantización del modelo base, hereda los sesgos de este, que no se detallan.
- Riesgo de alucinación: no cuantificado en la información disponible; el autor solo reporta corrección factual en 5 prompts japoneses.
- Dependencia del motor Abyss: el rendimiento declarado se midió con Abyss y no se garantiza en llama.cpp u otros motores; el autor reporta 27,6 tok/s con llama.cpp en la referencia.

## Enlaces

- HuggingFace: https://huggingface.co/zephel01/Qwen3.8-Flash-Next-12G32G-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Pesos NVFP4 de referencia: https://huggingface.co/magnitudedev/Qwen3.8-Flash-Next-NVFP4-GGUF
- Motor Abyss: https://github.com/zephel01/Abyss
- Herramientas de cuantización trench-gguf: https://github.com/zephel01/trench-gguf
- Formulario de reporte de benchmarks: https://github.com/zephel01/Abyss/issues/new?template=bench.md&title=Bench:+Qwen3.8-Flash-Next+12G32G-L448+on+YOUR_GPU
- Issues de Abyss: https://github.com/zephel01/Abyss/issues
