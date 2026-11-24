# TassP0lar/Spark-X2.6-4B-Loop48-En1B-VL

## Resumen

Spark-X2.6-4B-Loop48-En1B-VL (Stage-10.5) es un modelo multimodal de razonamiento vision-lenguaje de tamano compacto publicado por el desarrollador independiente TassP0lar bajo licencia Apache-2.0. Combina un backbone de lenguaje de 4B parametros con 36 capas y contexto RoPE nativo de 1M tokens, extendido mediante 48 capas virtuales con bucle (loop transformer) y un modulo de memoria dispersa condicional tipo MoE-Engram denominado En1B que anade 1.002B parametros adicionales. La parte visual la aporta el super-encoder nvidia/C-RADIOv4-H (651.6M parametros, ViT-H/16), fusionado mediante un proyector SwiGLU DeepStack con pixel-shuffle 2x2.

El modelo esta orientado a tareas de grounding espacial 3D, con soporte nativo de primitivas espaciales (punto, caja, trazo, circulo) y un DSL de bloques SyncCraft para escultura 3D estilo Blockbench y propuesta de animacion biomecanica. El pipeline declarado es image-text-to-text y los idiomas soportados son ingles y chino. El repositorio ocupa 23.4 GB e incluye releases en FP8 E4M3 + INT4 (q4g128) y BF16, junto con el runtime de inferencia y los artefactos JSON de benchmarks.

Es relevante por su enfoque poco habitual: combina loop transformer, atencion hibrida con ventana deslizante y atencion global, y memoria condicional dispersa anclada a multiples profundidades del transformer, todo entrenado en un entorno de doble GPU de gama workstation (RTX PRO 4000 Blackwell SFF 24 GB + Intel Arc Pro B50 16 GB). No obstante, los resultados publicados en benchmarks estandar son bajos, lo que sugiere que se trata de una etapa de investigacion mas que de un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con loop transformer (48 capas virtuales), atencion deslizante (sliding_window=512 en 27/36 capas) + atencion global cada 4 capas, MoE-Engram disperso (En1B) y super-encoder visual C-RADIOv4-H |
| Parametros totales | 4B (backbone) + 1.002B (En1B) + 651.6M (encoder visual C-RADIOv4-H) |
| Parametros activos | 16 expertos en En1B con top_k=4 (parametros activos exactos no disponibles) |
| Longitud de contexto | 1M tokens RoPE nativo (sliding_window=512 en 27/36 capas) |
| Tipos de cuantizacion | FP8 E4M3 channelwise + INT4 (q4g128) con residuo sub-LSB; BF16 |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (releases fp8/ y bf16/) |

## Arquitectura y entrenamiento

El backbone Spark-X2.6-4B consta de 36 capas con atencion hibrida: 27 de las 36 capas usan ventana deslizante de 512 tokens y cada cuarta capa aplica atencion global completa, lo que reduce el coste computacional manteniendo acceso a contexto largo (hasta 1M tokens RoPE). Sobre este backbone se aplica una extension a 48 capas virtuales mediante bucle: las capas en el rango [12, 24) se ejecutan dos veces con Dual-mHC (multi-head communication) y gating residual. Adicionalmente, el modulo En1B introduce 16 expertos con top_k=4 anclados en 8 profundidades del transformer ([3, 7, 11, 15, 19, 23, 27, 31]), con buckets frios fijados en CPU (Tier-1B) y buckets calientes en GPU (Tier-1A), lo que permite memoria condicional dispersa sin cargar todo el estado en VRAM.

La vision se procesa con nvidia/C-RADIOv4-H, un ViT-H/16 de 32 capas y 651.6M parametros destilado de SigLIP2-g, DINOv3-7B y SAM3. Las caracteristicas de las capas 24 y 32 se fusionan mediante RMSNorm, pixel-shuffle 2x2 y un proyector SwiGLU DeepStack con salida RMSNorm aprendible (radio_output_rms_match=True). El presupuesto visual se limita a 400 tokens por imagen para que el 100% de los parches permanezcan visibles a traves de las 48 capas virtuales.

El entrenamiento se realizo en una estacion de doble GPU: NVIDIA RTX PRO 4000 Blackwell SFF de 24 GB ejecutando apollo_coat e Intel Arc Pro B50 de 16 GB ejecutando C-RADIOv4-H, con muon8bit de 8 bits sobre memoria compartida DualPinned de copia cero. Los corpus de entrenamiento son estrictamente permisivos para uso comercial (Apache-2.0, MIT, CC-BY-4.0, CC0-1.0) y el autor declara 0% de solapamiento con los 17 benchmarks de evaluacion. No se especifica el numero total de tokens de entrenamiento ni la composicion detallada del dataset, ni si hubo RLHF/DPO.

## Capacidades

- Generacion de texto y razonamiento multimodal (image-text-to-text) con modo de pensamiento explicito (`<think>`).
- Grounding espacial 3D nativo con cuatro primitivas: `<point z="near|mid|far">`, `<box>`, `<dash>` y `<circle>`.
- Escultura 3D de cuboides estilo Blockbench (`Blockbench_sculpted_style`) y propuesta de animacion biomecanica mediante SyncCraft Block-DSL (Gate D).
- Comprension de imagenes con hasta 400 tokens visuales por imagen.
- Capacidades multilingues limitadas a ingles y chino.
- Soporte de contexto largo de hasta 1M tokens (con atencion deslizante en la mayoria de capas).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Analisis de escenas 3D en imagenes: el modelo puede describir la disposicion espacial de objetos usando las primitivas de grounding (puntos con profundidad near/mid/far, cajas, trazos y circulos), util para robótica o conduccion asistida donde se necesita localizacion espacial explicita.
- Modelado 3D asistido: generacion de propuestas de cuboides estilo Blockbench a partir de imagenes o descripciones, adecuado para pipelines de prototipado rapido de assets 3D.
- Animacion biomecanica: el proposito SyncCraft Gate D permite proponer animaciones de criaturas o personajes con estructura biomecanica a partir de una entrada visual, con una tasa de exito declarada del 100% en la tarea especifica del benchmark.
- Documentacion tecnica bilingue (en/zh): el soporte de ambos idiomas permite generar descripciones de imagenes tecnicas en ingles y chino, util para equipos con documentacion en ambos idiomas.
- Investigacion en arquitecturas eficientes: el modelo sirve como banco de pruebas para loop transformers, atencion hibrida y memoria condicional dispersa en un entorno de doble GPU de gama workstation.
- Evaluacion de tecnicas de cuantizacion: la release FP8+INT4 con residuo sub-LSB permite comparar el impacto de la cuantizacion frente a BF16 en tareas multimodales, ya que el autor reporta cero regresion de calidad.
- Prototipado de interfaces vision-lenguaje con contexto largo: los 1M tokens de contexto permiten procesar secuencias largas de imagenes o documentos extensos en tareas de exploracion.

## Benchmarks y rendimiento

Suite multimodal estandar de 8 benchmarks (scale=0.6, pines congelados):

| Benchmark | BF16 | FP8+q4g128 |
|---|---|---|
| AI2D (test) | 60.00% | 60.83% |
| RealWorldQA (test) | 44.17% | 45.00% |
| BLINK (6 subtareas espaciales) | 38.89% | 38.89% |
| MMBench-CN (dev) | 33.33% | 32.50% |
| MMMU (val) | — | — |
| MMStar | — | — |
| POPE (F1=0.193, yes=0.133) | 48.89% | 48.89% |
| OCRBench | 2.50% | 2.50% |

Suite de 9 pistas Frontier 2026, 3D espacial y SyncCraft (BF16, 0% solapamiento con entrenamiento):

| Benchmark | Puntuacion | Notas |
|---|---|---|
| Terminal-Bench 4.1 | — | n=21, `<think>` saludable=90.48% |
| HLE-Diamond (Frontier) | 7.50% | n=80, Texto=8.33%, `<think>` saludable=80.00% |
| GPQA-Diamond | 36.00% | n=100, Fisica=51.35% |
| MMMU-Pro (10 opciones) | 25.00% | n=100 |
| CV-Bench 3D | 40.00% | n=100, uso de 4 primitivas=100.00% |
| 3DSRBench | 37.00% | n=100, uso de 4 primitivas=100.00% |
| SimpleQA-Verified | 4.00% | n=100, abstenido=19 |
| AIME 2026 | 3.33% | n=30, max_new_tokens=1400 |
| SyncCraft Gate D Proposer | 100.00% | mean_solver_calls=1.0 |

Calibracion visual final (pre_105a): mean_real_loss=1.2420, media_advantage=-0.4497.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 10 GB para la release FP8+INT4 (model.safetensors de ~10 GB) y aproximadamente 12 GB para la release BF16 (model.safetensors de ~12 GB), sin contar overhead de runtime ni cache KV.
- GPU recomendadas: el autor entreno con NVIDIA RTX PRO 4000 Blackwell SFF de 24 GB e Intel Arc Pro B50 de 16 GB; para inferencia en BF16 se recomienda una GPU con al menos 16-24 GB.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas para FP8 y 24 GB o mas para BF16; en GPUs de 8-12 GB requeriria cuantizacion adicional no incluida en el repositorio.
- Opciones de despliegue: el repositorio incluye un runtime propio (`runtime/colab/final/` con funciones `load`, `generate`, `visual_media`) que se importa directamente desde la release descargada. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se han publicado en la informacion disponible comparativas directas con modelos de la misma categoria. Como referencia de categoria, este modelo compite en el segmento de modelos vision-lenguaje compactos (4B de backbone) con soporte de contexto largo y grounding espacial, pero no se dispone de datos de rendimiento de alternativas en la informacion proporcionada para establecer una comparacion cuantitativa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Spark-X2.6-4B-Loop48-En1B-VL | 4B + 1.002B En1B + 651.6M vision | 1M | Apache-2.0 | Hugging Face |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Rendimiento bajo en benchmarks estandar: OCRBench 2.50%, SimpleQA-Verified 4.00%, AIME 2026 3.33% y MMBench-CN 33.33%, lo que indica capacidad limitada en OCR, conocimiento factual y matematicas.
- POPE con F1=0.193 y yes=0.133 sugiere una fuerte tendencia a responder negativamente en tareas de presencia de objetos, con riesgo de sesgo sistematico.
- Riesgo de alucinacion elevado en conocimiento factual (SimpleQA-Verified 4.00%) y en tareas de razonamiento complejo (HLE-Diamond 7.50%).
- Contexto nativo de 1M tokens, pero la atencion deslizante de 512 tokens en 27 de 36 capas puede degradar el acceso a informacion distante en la practica.
- Soporte limitado a ingles y chino; no se declaran otros idiomas.
- El modelo esta en fase de investigacion (Stage-10.5) y no se documentan pruebas de produccion, latencia ni throughput.
- El repositorio tiene 0 descargas y 0 likes, sin validacion externa de la comunidad.
- Licencia Apache-2.0 permite uso comercial, pero los pesos y el runtime incluido deben verificarse antes de desplegar en produccion.
- El uso de primitivas espaciales y del DSL SyncCraft requiere seguir el formato exacto documentado; no se detallan garantias de robustez fuera de los benchmarks declarados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TassP0lar/Spark-X2.6-4B-Loop48-En1B-VL
- Encoder visual nvidia/C-RADIOv4-H: https://huggingface.co/nvidia/C-RADIOv4-H
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
