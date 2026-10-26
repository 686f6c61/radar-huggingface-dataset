# tiny-random/muse-spark-open

## Resumen

`tiny-random/muse-spark-open` es un checkpoint de depuración publicado por el usuario `tiny-random`, inicializado con pesos aleatorios (semilla 42) a partir de la arquitectura de `meta-models/Muse-Spark-Open-816B-A42B`. No es un modelo entrenado: es una reproducción a escala minúscula (3.582.568 parámetros) del grafo y de las decisiones de diseño del modelo fuente, pensada para validar código de carga, preprocesado y despliegue sin necesidad de mover cientos de gigabytes de pesos.

Su interés no está en las capacidades (los pesos son aleatorios y la salida es ruido), sino en que conserva intactas las particularidades estructurales del original: MoE con enrutamiento sigmoide top-8, *expert pooling*, normas centradas, puertas residuales y de atención, atención híbrida con RoPE deslizante y NoPE completo, codificación visual NaViT y un codificador de audio de cuatro etapas. Además mantiene sin cambios la tabla de vocabulario (202.048 entradas, *untied*) y la precisión de origen: BF16 general con routers y sesgos de corrección en FP32.

Es relevante ahora como herramienta de ingeniería: permite ejecutar de extremo a extremo la ruta multimodal texto+imagen+vídeo+audio → texto con Transformers y SGLang en una sola GPU (o incluso en CPU) antes de escalar al modelo de 816B, y sirve para escribir tests de integración reproducibles en CI.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + imagen + vídeo + audio → texto) con MoE de enrutamiento sigmoide top-8, *expert pooling*, normas centradas, puertas residuales y de atención, atención híbrida (sliding RoPE / full NoPE), codificador visual NaViT y codificador de audio de cuatro etapas |
| Parámetros totales | 3.582.568 (3.580.264 en BF16 + 2.304 en FP32 según safetensors) |
| Parámetros activos | 8 de 32 expertos por token en el checkpoint tiny; cifra de parámetros activos del modelo fuente no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (checkpoint distribuido en BF16 con routers en FP32; no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16; pesos y sesgos del router en FP32), archivo único `model.safetensors` de 7,2 MB |
| Capas de texto | 8 en el tiny (62 en el modelo fuente), con patrón de atención sliding / full / sliding / sliding |
| Cabezas Q / KV / dimensión de cabeza | 8 / 1 / 32 en el tiny (128 / 16 / 64 en el fuente) |
| Expertos / expertos activados | 32 / 8 en el tiny (256 / 8 en el fuente) |
| Anchura residual / pool de expertos / intermedio de experto | 8 / 4 / 16 en el tiny (8192 / 4096 / 4096 en el fuente) |
| Visión | 8 capas, anchura 32, parche temporal 2, merge 2 en el tiny (50 / 1536 / 2 / 2 en el fuente) |
| Audio | 4 etapas, profundidades de bloque [2, 2, 2, 2], frecuencia de muestreo 24 kHz (idéntico al fuente) |
| Vocabulario | 202.048 entradas, sin atar (untied), idéntico al fuente |
| Modalidades | Texto + imagen + vídeo + audio → texto |

## Arquitectura y entrenamiento

El modelo fuente es un transformer multimodal con mezcla de expertos: 62 capas de texto con un ciclo de atención fijo (sliding, full, sliding, sliding), 256 expertos con enrutamiento sigmoide top-8, *expert pooling* y anchuras residuales de 8192, pool de expertos de 4096 e intermedio de experto de 4096. La atención combina RoPE deslizante en las capas locales y atención NoPE completa en la capa global; se añaden normas centradas y puertas independientes para la rama residual y para la atención. Las torres de entrada son un codificador visual NaViT de 50 capas y anchura 1536, con parche temporal 2 y merge 2, y un codificador de audio de cuatro etapas con profundidades [2, 2, 2, 2] sobre forma de onda a 24 kHz. Los pesos de router y los sesgos de corrección se mantienen en FP32 mientras el resto del checkpoint está en BF16.

El checkpoint tiny replica esa topología con dimensiones reducidas: 8 capas de texto (dos ciclos del patrón de atención del fuente), 8 cabezas Q con una sola KV de dimensión 32, 32 expertos de los que se activan 8, y una torre visual de 8 capas con anchura 32. El vocabulario se conserva íntegro (202.048 filas, sin atar), lo que con `hidden_size=8` implica unas 1,6 M de entradas por matriz de embedding y explica la mayor parte de los 3,58 M de parámetros totales. No hay entrenamiento: los pesos se generan con `set_seed(42)` y `_from_config`, y el autor documenta el script exacto de creación en la model card. No se dispone de información sobre dataset, número de tokens, RLHF/DPO ni proceso de alineamiento, ni del modelo fuente ni de este checkpoint.

## Capacidades

- El modelo no tiene capacidades funcionales: los pesos son aleatorios, por lo que la generación de texto, el razonamiento y las respuestas multimodales son ruido sin valor semántico.
- Reproduce la interfaz multimodal completa (texto, imagen, vídeo y audio de 24 kHz en una misma plantilla de chat), lo que permite validar el `AutoProcessor` y el formateo de mensajes.
- Soporta `apply_chat_template` con el parámetro `reasoning_effort`, lo que permite probar rutas de prompt con y sin modo de razonamiento a nivel de plantilla.
- Mantiene la firma de `MuseSparkForConditionalGeneration` y las opciones `attn_implementation="sdpa"` y `experts_implementation="batched_mm"`, útiles para verificar el cableado de kernels.
- Conserva el vocabulario de 202.048 entradas del modelo fuente, por lo que el tokenizador y los identificadores especiales son coherentes con el original.
- Sirve como objetivo de pruebas para decodificación de vídeo (requiere FFmpeg) y para el pipeline de `VideoMetadata` con índices de fotogramas y fps.
- Soporta ejecución multi-GPU mediante SGLang con `--tp-size` y `--ep-size`, lo que permite ensayar topologías de paralelismo de expertos.

## Casos de uso

- Tests de integración en CI: cargar el checkpoint con Transformers y ejecutar un `generate` de pocos tokens en cada *pull request* para detectar roturas en `MuseSparkForConditionalGeneration`, en el procesador o en la plantilla de chat sin coste de GPU.
- Validación de pipelines multimodales: comprobar que imágenes PIL, fotogramas de vídeo apilados en NumPy y formas de onda float32 a 24 kHz llegan con las formas y el `dtype` correctos antes de pasar al modelo real.
- Verificación de despliegues SGLang: ensayar la topología `--tp-size 4 --ep-size 4` exigida por los expertos BF16 (EP=TP) en un nodo con cuatro GPUs pequeñas, validando flags como `--attention-backend triton` o `--mem-fraction-static` sin reservar los cientos de GB del modelo de 816B.
- Pruebas de compatibilidad de kernels: al conservar atención híbrida, MoE y `batched_mm`, sirve para comparar salidas entre `sdpa` y otros backends y detectar discrepancias de implementación con formas reales.
- Desarrollo de *harnesses* de evaluación: construir el código de benchmarking (medición de latencia, throughput, memoria) y depurarlo contra un modelo de 7,2 MB antes de aplicarlo a un modelo de 1,6 TB de pesos.
- Docencia y demostración de arquitecturas MoE: inspeccionar el enrutamiento top-8, el *expert pooling* y las puertas residuales con `print(model)` y herramientas de visualización, ya que las dimensiones reducidas hacen legible el grafo completo.
- Pruebas de decodificación de vídeo y audio: escenarios con FFmpeg, `do_sample_frames=False` y metadatos de vídeo que requieren un modelo que acepte las cuatro modalidades a la vez.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Cualquier métrica de calidad (MMLU, HumanEval, GSM8K) sería además irrelevante en este checkpoint, ya que los pesos son aleatorios y no han pasado por entrenamiento. Tampoco se publican medidas de latencia o throughput para el modelo tiny ni para el modelo base.

## Requisitos de hardware

- VRAM para inferencia del checkpoint tiny: inferior a 1 GB. Los pesos ocupan 7,2 MB (BF16) y el vocabulario de 202.048 entradas domina el consumo, pero el conjunto cabe holgadamente en cualquier GPU.
- Cabe en GPU de consumo y en hardware integrado: funciona en CPU, en iGPU y en cualquier GPU dedicada; una RTX 4090 o una A100 están completamente sobredimensionadas para este checkpoint.
- GPU recomendadas para el modelo tiny: ninguna en particular; para el modelo base `Muse-Spark-Open-816B-A42B` no se dispone de requisitos publicados en la información proporcionada.
- Despliegue: Transformers (verificado por el autor, con `dtype=torch.bfloat16`, `attn_implementation="sdpa"`, `experts_implementation="batched_mm"` y `device_map="cuda"`) y SGLang (verificado, con `--tp-size 4 --ep-size 4 --attention-backend triton --context-length 4096 --max-running-requests 4 --max-total-tokens 4096 --mem-fraction-static 0.2 --disable-custom-all-reduce`). No se documentan opciones para vLLM, llama.cpp, Ollama ni TGI, y no hay pesos GGUF publicados.
- Requisito adicional: SGLang necesita las bibliotecas compartidas de FFmpeg instaladas para la decodificación de vídeo.
- Latencia y throughput: no disponibles. El único dato operativo es la configuración de SGLang del ejemplo, con `max_running_requests 4` y `max_total_tokens 4096`, pensada para un nodo de cuatro GPUs.

## Comparativa con modelos similares

No se dispone de información sobre otros checkpoints de depuración comparables. La comparación natural es con el modelo del que deriva, usando los datos de la model card:

| Modelo | Parámetros | Capas de texto | Expertos / activados | Cabezas Q/KV/dim | Contexto | Licencia | Formatos |
|---|---|---|---|---|---|---|---|
| `tiny-random/muse-spark-open` | 3.582.568 | 8 | 32 / 8 | 8 / 1 / 32 | no disponible | no disponible | safetensors (1 archivo, 7,2 MB) |
| `meta-models/Muse-Spark-Open-816B-A42B` | 821.906.490.368 elementos en BF16 + 130.039.296 en F32 | 62 | 256 / 8 | 128 / 16 / 64 | no disponible | no disponible | safetensors (65 archivos, 1.644.333.393.864 bytes) |

El identificador del modelo base sugiere 816B de parámetros totales y 42B activos, pero esa cifra no aparece confirmada en la información proporcionada. Tampoco hay datos de rendimiento que permitan comparar con alternativas de la misma categoría (modelos multimodales con audio y vídeo); la comparativa de benchmarks queda por tanto como no disponible.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no produce texto, respuestas ni razonamiento coherente. Cualquier uso generativo produce ruido y no debe llegarse a producción con él.
- Solo tiene sentido como herramienta de ingeniería (tests, validación de pipelines, docencia); no es un sustituto del modelo base ni sirve para evaluar calidad.
- Licencia no disponible: no puede asumirse permiso de uso comercial, ni para este checkpoint ni para el modelo base, cuya licencia tampoco figura en la información.
- Idiomas no disponibles: no hay declaración de cobertura lingüística, y en cualquier caso las capacidades multilingües no son evaluables con pesos aleatorios.
- Longitud de contexto no disponible: el valor `4096` del ejemplo de SGLang es un parámetro de lanzamiento, no una especificación del modelo.
- Riesgo de alucinación no aplicable en sentido estricto (no hay conocimiento que alucinar), pero sí riesgo de conclusiones erróneas si alguien interpreta sus salidas como señal de comportamiento del modelo real.
- El tamaño reducido altera propiedades emergentes: con `hidden_size=8`, una sola cabeza KV y 32 expertos, el checkpoint no reproduce comportamientos dependientes de escala del modelo de 816B, como la estabilidad del enrutamiento o la calidad de la fusión multimodal.
- Los pesos de router y sesgos en FP32 son parte deliberada del diseño; una conversión indiscriminada a BF16 de todo el checkpoint rompería la equivalencia con el modelo fuente.
- Requiere FFmpeg para las rutas de vídeo en SGLang, un detalle que puede bloquear despliegues si no se documenta en la imagen de contenedor.
- Fechas de creación y actualización del repositorio: 25 de octubre de 2026, según los metadatos de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tiny-random/muse-spark-open
- Modelo base: https://huggingface.co/meta-models/Muse-Spark-Open-816B-A42B
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la búsqueda web realizada; los resultados obtenidos correspondían a servicios y sitios sin relación con el modelo (tinytask.net, tinypng.com, latinyhouse.com, tinyurl.com, tinyhousefrance.org).
