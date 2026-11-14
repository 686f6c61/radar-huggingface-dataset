# ZhuYuhan/TimeLens2-35B-A3B-SFT

## Resumen

TimeLens2-35B-A3B-SFT es un modelo de lenguaje y vision especializado en *temporal grounding* de video: dado un vídeo y una consulta en lenguaje natural, devuelve los intervalos temporales (en segundos) en los que la consulta es relevante. Lo desarrolla ZhuYuhan (con coautoria del grupo MCG-NJU, segun la cita del paper) y se presenta como la variante SFT (supervised fine-tuning) de la familia TimeLens2, descrita en el articulo arXiv:2607.17423.

El modelo parte de Qwen/Qwen3.6-35B-A3B, un transformer con arquitectura MoE (mezcla de expertos) de 35.107.181.936 parametros totales, y se ajusta para la tarea de localizacion temporal en video. La relevancia actual reside en que unifica en un solo modelo tareas de *moment retrieval* y *highlight detection* sobre benchmarks heterogeneos (Charades-STA, ActivityNet Captions, QVHighlights, VUE-TR, MomentSeeker, Ego4D-NLQ-v2), con un mIoU medio de 50,06 % reportado por el autor.

La licencia es Apache 2.0, lo que facilita su uso comercial, y se distribuye en formato safetensors con un repositorio de 70,2 GB. La fecha de creacion del repositorio es el 14 de noviembre de 2026 y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), base Qwen3.6-35B-A3B; pipeline image-text-to-text / video-text-to-text |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; se puede cuantizar con herramientas externas, pero el autor no documenta variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado (SFT) sobre Qwen/Qwen3.6-35B-A3B, un transformer con mezcla de expertos (MoE) de 35.107 millones de parametros totales. La model card no detalla el numero de parametros activos por token, la composicion del dataset de entrenamiento, el numero de tokens vistos ni si se aplicaron etapas de RLHF o DPO. Tampoco se especifica la longitud de contexto nativa ni la estrategia de atencion (la inferencia de ejemplo usa `flash_attention_2`, lo que sugiere atencion estandar con FlashAttention-2, no attention linear ni SSM).

La innovacion tecnica documentada es la formulacion de la tarea: el modelo recibe un video muestreado a una tasa configurable (2.0 fps en el ejemplo), con limites de pixeles por frame (`min_pixels=32*32`, `max_pixels=480*480`), y se le pide devolver **todos** los intervalos relevantes como un array JSON de pares `[start, end]` en segundos. El procesamiento de vision se apoya en `qwen-vl-utils` con `image_patch_size=16` y metadatos de video, y el template de chat admite `enable_thinking=False`, lo que indica que el modelo base dispone de modo de razonamiento conmutable. No se documentan tecnicas de decodificacion especulativa ni variantes de atencion lineal.

## Capacidades

- Localizacion temporal de eventos en video (*temporal grounding*): devuelve intervalos `[inicio, fin]` en segundos para una consulta textual.
- *Moment retrieval*: recuperacion de momentos concretos descritos en lenguaje natural dentro de un video largo.
- *Highlight detection* implicita: al devolver multiples intervalos, cubre consultas con varias ocurrencias.
- Procesamiento conjunto de video y texto (pipeline `video-text-to-text` / `image-text-to-text`).
- Salida estructurada en JSON (array de pares `[start, end]`), adecuada para postprocesado automatico.
- Modo de razonamiento conmutable mediante `enable_thinking` en el template de chat (desactivado en el ejemplo de inferencia).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades de audio o vision mas alla del video: no disponible.

## Casos de uso

- **Indexado y busqueda semantica de videotecas**: dado un catalogo de videos largos, el modelo localiza los tramos relevantes para una consulta ("un hombre abre el frigorifico") y permite construir un indice de momentos con marcas temporales en segundos, listo para un motor de busqueda.
- **Generacion automatica de capitulos y clips**: a partir de una descripcion textual, se extraen intervalos que alimentan un pipeline de corte automatico (por ejemplo, para redes sociales o resumenes), usando la salida JSON directamente como entrada del editor.
- **Anotacion asistida de datasets de video**: el modelo preanota intervalos sobre footage nuevo y un revisor humano corrige, reduciendo el coste de crear datasets de *temporal grounding* o *moment retrieval*.
- **Analisis de video egocentrico**: con soporte para Ego4D-NLQ-v2 en los benchmarks, se puede aplicar a grabaciones en primera persona (gafas o camaras corporales) para localizar acciones como "cojo la taza" en grabaciones de horas.
- **Moderacion y compliance de contenido audiovisual**: localizar en un video los tramos que coinciden con una descripcion de politica (por ejemplo, "aparece un menor") para revision humana posterior, aprovechando la salida estructurada y la licencia Apache 2.0.
- **Resumenes con marcas temporales**: combinar la localizacion de intervalos con un LLM posterior para generar resumenes de video con enlaces a los momentos exactos, util en plataformas de formacion o documentacion tecnica.
- **Analisis deportivo y de vigilancia**: localizar jugadas o eventos descritos en lenguaje natural dentro de grabaciones largas, con la ventana de contexto suficiente para videos de varios minutos muestreados a 2 fps.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card (mIoU en %):

| Benchmark | Consultas evaluadas | mIoU (%) |
|---|---:|---:|
| Charades-STA | 3363 | 58,08 |
| ActivityNet Captions | 4500 | 64,13 |
| QVHighlights | 1541 | 72,73 |
| VUE-TR | 532/562 | 51,49 |
| VUE-TR-v2 | 725/727 | 50,74 |
| MomentSeeker | 1000 | 29,94 |
| Ego4D-NLQ-v2 | 4552 | 23,26 |
| **Media (no ponderada)** | — | **50,06** |

Las fracciones en VUE-TR y VUE-TR-v2 indican la cobertura de video disponible. La media es la media no ponderada de los siete benchmarks. No se han publicado en la informacion disponible resultados comparativos con otros modelos ni metricas adicionales (R@1, R@5, etc.).

## Requisitos de hardware

- **VRAM estimada en BF16/FP16**: los 35,1 mil millones de parametros en precision de 16 bits ocupan aproximadamente 70 GB solo en pesos, por lo que se necesita al menos una GPU de 80 GB (A100 80GB, H100 80GB) o varias GPUs con `device_map="auto"`.
- **Cuantizacion**: el autor no publica variantes cuantizadas. Con cuantizacion de 8 bits (por ejemplo, bitsandbytes) el modelo rondaria los 35-40 GB y cabria en una RTX 6000 Ada (48 GB) o A6000 (48 GB); con 4 bits, en torno a 18-20 GB, podria caber en una RTX 4090 (24 GB), aunque no hay validacion oficial de esta ruta.
- **GPU recomendadas**: A100 80GB, H100 80GB o H200 para inferencia en precision completa; configuraciones multi-GPU para lotes mayores.
- **Consumer GPU**: en BF16 no cabe en ninguna GPU de consumo. Solo seria viable en RTX 4090/5090 mediante cuantizacion agresiva, sin garantia de calidad ni soporte documentado.
- **Despliegue**: la model card solo documenta `transformers` (version 5.14.1) con `accelerate`, `safetensors`, `qwen-vl-utils[decord]>=0.0.14` y `flash-attn`. No se mencionan vLLM, llama.cpp, Ollama ni TGI; la integracion con estos motores no esta verificada en la informacion disponible.
- **Latencia y throughput**: no disponibles. La inferencia de ejemplo usa `max_new_tokens=4096` y `do_sample=False`, lo que sugiere generaciones cortas y deterministas, pero no se aportan cifras.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de resultados de benchmarks de modelos comparables de la misma categoria (grounding temporal de video) ni de sus especificaciones, por lo que la comparativa cuantitativa no esta disponible. Como referencia estructural, el propio modelo se basa en Qwen/Qwen3.6-35B-A3B (35,1 mil millones de parametros, licencia del modelo base no indicada en esta ficha), y el autor cita la coleccion MCG-NJU/timelens2, que presumiblemente contiene otras variantes de la familia (no detalladas en la informacion disponible).

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| TimeLens2-35B-A3B-SFT | 35,1 B (MoE) | no disponible | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.6-35B-A3B (base) | 35,1 B (MoE) | no disponible | no disponible en esta ficha | Hugging Face |
| Otras variantes TimeLens2 | no disponible | no disponible | no disponible | Coleccion MCG-NJU/timelens2 |

## Limitaciones y advertencias

- **Rendimiento desigual entre dominios**: el mIoU cae a 23,26 % en Ego4D-NLQ-v2 y 29,94 % en MomentSeeker, frente al 72,73 % en QVHighlights. En video egocentrico y consultas complejas el modelo es claramente menos fiable.
- **Dependencia del muestreo de frames**: la calidad depende de `fps`, `min_pixels` y `max_pixels`. Un fps demasiado bajo puede perder eventos breves; uno demasiado alto incrementa el coste computacional sin garantia de mejora.
- **Sesgos**: no se documentan analisis de sesgo en la model card. Al derivar de un LLM general, puede heredar sesgos de genero, raza o cultura del modelo base, no cuantificados.
- **Alucinacion temporal**: el modelo puede devolver intervalos plausibles pero incorrectos, especialmente en videos largos o consultas ambiguas. En produccion conviene validar la salida JSON y aplicar umbrales de confianza.
- **Idiomas**: no se especifica que idiomas soporta; la unica consulta de ejemplo esta en ingles. El rendimiento en castellano no esta verificado.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.6-35B-A3B, ya que la ficha no detalla la licencia del base ni posibles restricciones adicionales.
- **Madurez**: repositorio con 0 descargas y 0 likes en el momento de la consulta; es un artefacto de investigacion reciente sin validacion comunitaria.
- **Formato de salida**: el modelo esta entrenado para emitir un array JSON de pares `[start, end]`; desviaciones del prompt puede degradar la estructura de la salida.
- **Requisitos de hardware**: 70 GB en BF16 hacen inviable el despliegue en infraestructura de consumo sin cuantizacion no documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ZhuYuhan/TimeLens2-35B-A3B-SFT
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Paper: https://arxiv.org/abs/2607.17423
- Codigo: https://github.com/MCG-NJU/TimeLens2
- Coleccion TimeLens2: https://huggingface.co/collections/MCG-NJU/timelens2
