# wittjeff/unlimited-ocr-6bit-mlx

## Resumen

Unlimited-OCR es un modelo vision-language especializado en parsing de documentos desarrollado por Baidu. Combina dos codificadores visuales (SAM ViT-B y CLIP-L) con un decodificador basado en una arquitectura MoE de tipo DeepSeek-V2, sumando un total de 3.336 millones de parametros. Su proposito es extraer estructura y texto de imagenes de documentos, incluyendo grounding espacial (coordenadas de bloques de texto), lo que lo hace util para pipelines de digitalizacion y extraccion de informacion.

La ficha describe `wittjeff/unlimited-ocr-6bit-mlx`, una conversion a formato MLX cuantizada a 6 bits (afin, con las torres de vision en bf16) realizada con `mlx-vlm` 0.6.17 para su ejecucion en Apple Silicon. El autor la presenta como la unica conversion cuantizada del modelo en el Hub que conserva el tokenizer completo de origen, lo que reduce el uso de memoria (3,19 GB en disco frente a 6,67 GB en bf16) y practicamente duplica la velocidad de inferencia respecto a la version completa.

Es relevante ahora porque permite ejecutar un modelo OCR multimodal de 3.3B en equipos de consumo con 16 GB de memoria unificada, algo impracticable con las conversiones en precision completa. No obstante, el propio autor documenta una limitacion importante: bucles de repeticion en paginas densas y no inglesas que no se corrigen de forma fiable con los controles de decodificacion disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language con doble codificador visual (SAM ViT-B + CLIP-L) y decodificador MoE tipo DeepSeek-V2 |
| Parametros totales | 3.336.106.240 (3,34B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits afin en el stack de lenguaje; torres de vision en bf16 (7,646 bits/peso de media) |
| Idiomas soportados | no disponible (el autor evalua paginas en aleman, frances, italiano, serbio y yiddish, pero no se declara lista oficial) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria mlx-vlm) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura multimodal con dos codificadores visuales complementarios: SAM ViT-B, orientado a la segmentacion y localizacion de regiones, y CLIP-L, orientado a la representacion semantica de la imagen. La salida de ambos se alimenta a un decodificador de mezcla de expertos (MoE) basado en DeepSeek-V2, que genera texto y marcadores de grounding con coordenadas de los bloques detectados. Esta combinacion esta disenada especificamente para document parsing: no solo transcribe, sino que localiza espacialmente el contenido extraido.

Esta conversion concreta no reentrena el modelo: aplica cuantizacion afin de 6 bits al stack de lenguaje y mantiene las torres de vision en bf16, con un resultado de 7,646 bits por peso. Segun la verificacion del autor, la perdida de calidad frente a la conversion bf16 es minima (IoU de cajas de ~0,977 frente a ~0,93 del port CUDA, y CER de texto de 0,0003 en sintetico y 0,0073 en escaneado), mientras que el tiempo por pagina baja de 54,9 s a 28,2 s en un Apple M4 de 16 GB. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Extraccion de texto de imagenes de documentos (OCR) con salida estructurada.
- Grounding espacial: genera marcadores con coordenadas de bloques de texto, lo que permite reconstruir el layout del documento.
- Parsing de documentos: procesa paginas completas y devuelve contenido organizado por regiones.
- Procesamiento de documentos escaneados y degradados, incluidos escaneos de prensa historica.
- Capacidad multilingue observada en la evaluacion del autor (aleman con tipografia Fraktur, frances, italiano, serbio en cirilico y yiddish en hebreo), aunque con problemas de repeticion en estos casos.
- Soporte de prompts especificos: `<image>document parsing.` como prompt recomendado y `Free OCR.` como alternativa.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, vision adicional o audio: no disponible.

## Casos de uso

- Digitalizacion de archivos historicos: el modelo puede procesar escaneos de prensa y documentos antiguos, como demuestra la evaluacion sobre Chronicling America, extrayendo texto y coordenadas de bloques. Conviene validar la salida con un detector de bucles (ratio de compresion zlib) por la tasa de fallos en paginas degradadas.
- Extraccion de datos de facturas y formularios: el grounding espacial permite asociar cada campo de texto a su posicion en la pagina, lo que facilita mapear etiquetas y valores en documentos estructurados.
- Pipeline de ingestion documental en macOS: al ejecutarse con MLX sobre Apple Silicon con 3,19 GB en disco y unos 5,15 GB de memoria pico, puede integrarse en flujos locales de procesamiento por lotes sin GPU dedicada.
- Prototipado rapido en equipos de desarrollo: la cuantizacion a 6 bits y la velocidad de 28,2 s por pagina en un M4 de 16 GB permiten iterar sobre prompts y postprocesado sin infraestructura de servidor.
- Analisis de documentos multilingues con revision humana: para paginas en aleman, frances o cirilico, el modelo puede generar una primera transcripcion, pero debe revisarse manualmente por la alta probabilidad de bucles de repeticion en contenido denso no ingles.
- Archivado y busqueda full-text: la salida estructurada con bloques y coordenadas permite indexar el contenido de PDFs escaneados y recuperar fragmentos junto con su ubicacion en la pagina original.
- Investigacion sobre cuantizacion de modelos multimodales: el repositorio documenta de forma detallada las metricas de calidad y latencia de la conversion, lo que lo convierte en una referencia util para estudiar el impacto de la cuantizacion 6-bit en modelos vision-language.

## Benchmarks y rendimiento

Los datos disponibles son mediciones de verificacion del propio autor, centradas en la calidad de la conversion y no en benchmarks academicos estandar. Se excluyeron las paginas degeneradas (n=15):

| Metrica | Port CUDA bf16 → MLX bf16 | Cuantizacion MLX bf16 → 6-bit |
|---|---|---|
| IoU de cajas | ~0,93 | ~0,977 |
| CER texto sintetico | 0,013 | 0,0003 |
| CER texto escaneado | 0,105 | 0,0073 |

| Metrica de ejecucion | Valor |
|---|---|
| Bloques de grounding generados (28 paginas) | 690 frente a 685 de bf16 (0,7% de diferencia) |
| Tiempo por pagina (Apple M4, 16 GB) | 28,2 s frente a 54,9 s de bf16 (1,94x mas rapido) |
| Memoria pico en Mac de 16 GB | 5,15 GB frente a 8,64 GB de bf16 |
| Paginas con bucles de repeticion (28 paginas) | 13 de 28 con la politica de decodificacion recomendada |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: unos 5,15 GB de pico en inferencia segun la medicion del autor en un Mac de 16 GB.
- Tamano en disco: 3,19 GB (6 bits) frente a 6,67 GB de las conversiones bf16.
- GPU recomendadas: Apple Silicon (verificado en Apple M4 con 16 GB); el modelo base se ha ejecutado en CUDA con una RTX 3060 como referencia, aunque esta conversion es especifica de MLX.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con 16 GB o mas de memoria unificada. No aplica a GPU NVIDIA para esta conversion concreta, que requiere MLX.
- Opciones de despliegue: `mlx-vlm` 0.6.17 con `mlx` 0.32.2 y `transformers` 5.16.1 (verificado); tambien carga bajo transformers 4.x gracias a que conserva el tokenizer completo. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en esta conversion.
- Latencia y throughput: 28,2 s por pagina en Apple M4 de 16 GB, aproximadamente 1,94x mas rapido que la conversion bf16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wittjeff/unlimited-ocr-6bit-mlx | 3,34B | no disponible | 6 bits (lenguaje), bf16 (vision) | MIT | Hugging Face, 77 descargas |
| pcuenq/Unlimited-OCR-bf16-mlx | 3,34B | no disponible | bf16 (precision completa) | MIT (heredada del base) | Hugging Face |
| baidu/Unlimited-OCR (base) | 3,34B | no disponible | bf16 | MIT | Hugging Face |

El autor indica que existen 35 conversiones MLX del modelo en el Hub; cinco incluyen el tokenizer completo de origen y, de esas, esta es la unica cuantizada. Frente a la version bf16, la cuantizada reduce el tamano de 6,67 GB a 3,19 GB y el tiempo por pagina de 54,9 s a 28,2 s con una perdida de calidad marginal segun las metricas del autor. No se dispone de comparaciones con otros modelos OCR de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Bucles de repeticion: en un corpus de 28 paginas, 13 degeneraron en repeticion, incluyendo todas las paginas escaneadas no inglesas evaluadas (aleman Fraktur, frances, italiano, serbio/cirilico, yiddish/hebreo). Ocurre con el prompt recomendado `<image>document parsing.`, no solo con `Free OCR.`.
- Los controles de decodificacion no resuelven el problema de forma fiable: `no_repeat_ngram_size=35` corrige 5 de 10 casos en CUDA pero deja 5; `repetition_penalty` (1,05/1,10) corrige 2 de 8 en MLX, deja 6 y rompe 1 pagina previamente limpia. mlx-vlm no expone `no_repeat_ngram_size`.
- Se recomienda presupuestar fallos en documentos densos no ingleses y usar un detector barato basado en el ratio de compresion zlib de la salida (paginas limpias entre 0,25 y 0,77; con bucles por debajo de 0,20).
- Diferencias frente a la implementacion de referencia CUDA: mlx-vlm usa atencion completa en lugar de la atencion de ventana deslizante (R-SWA) del modelo, y no dispone de filtro de n-gramas.
- El modo de resolucion dinamica Gundam (recorte a 640 px) no esta probado; la verificacion se hizo en modo base.
- La evaluacion de CER en escaneados se basa en solo 5 paginas en ingles; 11 de 16 paginas escaneadas se excluyeron por degeneracion, lo que limita la representatividad de la metrica.
- Sensibilidad al prompt: el modelo requiere mantener la redaccion exacta del prompt; cambios en el texto pueden alterar la salida.
- No se declaran idiomas soportados oficialmente ni sesgos conocidos en la informacion disponible; el riesgo de alucinacion en la transcripcion no esta cuantificado mas alla de las metricas de CER.
- Licencia MIT, que permite uso comercial, pero hereda las condiciones del modelo base `baidu/Unlimited-OCR`; conviene verificar la model card original antes de un despliegue en produccion.
- Esta conversion esta pensada para Apple Silicon con MLX; no es directamente desplegable en infraestructura NVIDIA sin recurrir al modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/wittjeff/unlimited-ocr-6bit-mlx
- Modelo base: https://huggingface.co/baidu/Unlimited-OCR
- Conversion bf16 de referencia: https://huggingface.co/pcuenq/Unlimited-OCR-bf16-mlx
- Correccion publicada en el issue de docling: https://github.com/docling-project/docling/issues/3943#issuecomment-5996736230
