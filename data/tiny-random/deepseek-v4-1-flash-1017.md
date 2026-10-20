# tiny-random/deepseek-v4.1-flash-1017

## Resumen

`tiny-random/deepseek-v4.1-flash-1017` es un checkpoint de depuración de 67.984.458 parámetros publicado por el usuario `tiny-random`, inicializado de forma aleatoria y sin entrenamiento alguno. Su configuración reproduce, a escala reducida, la topología de `deepseek-ai/DeepSeek-V4.1-Flash-1017`: un transformer de mezcla de expertos (MoE) multimodal (visión + texto) con atención dispersa comprimida, cuatro flujos residuales Hyper-Connections, tablas Engram de n-gramas y un módulo especulativo DSpark/MTP de tres etapas.

Su relevancia no es funcional, sino de infraestructura: permite validar stacks de inferencia (SGLang con backend DSV4, kernels FlashInfer MXFP4, decodificación especulativa DSpark) sin necesidad de descargar los 96.085 tensores y ~510,3 GB del checkpoint original. El repositorio ocupa 0,1 GB y contiene un único `model.safetensors` de 96,7 MB con 1.629 tensores.

Es, por tanto, un artefacto para ingeniería de sistemas y CI, no un modelo utilizable para generar contenido: sus pesos son ruido y no ha visto ningún token de entrenamiento. La licencia, los idiomas soportados y la longitud de contexto no están publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `DeepseekV41ForCausalLM` (`model_type: deepseek_v41`); MoE multimodal (visión + texto) con atención dispersa comprimida, 4 flujos residuales Hyper-Connections, n-gram Engram y DSpark/MTP de 3 etapas |
| Parametros totales | 67.984.458 |
| Parametros activos | no disponible (MoE con 32 expertos enrutados, top-6, y 1 experto compartido) |
| Longitud de contexto | no disponible en la configuración publicada; el ejemplo oficial de SGLang arranca con `--context-length 4096` y `--max-total-tokens 4096` |
| Tipos de cuantizacion | FP8 en la mayoría de lineales y FP4 en los expertos enrutados, con escalas UE8M0 en bloques de 32x32 (tag `fp8`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`, 96,7 MB, 1.629 tensores) |
| Vocabulario | 129.280 tokens (BOS 0, EOS 1, PAD 2, imagen 129.264) |
| Capas del backbone de texto | 6 |
| Hidden size | 128 |
| Cabezas de atención / dimensión | 4 cabezas / `head_dim` 512 (448 sin RoPE + 64 RoPE) |
| Proyecciones low-rank Q/O | q = 128, o = 128, 2 grupos de salida |
| Expertos | 32 enrutados + 1 compartido, top-6; `moe_intermediate_size` 256 (128 por rango TP) |
| Patrón de atención dispersa | Backbone: 2 sliding-only, 2 ratio-2, 2 ratio-1; MTP: 3 sliding-only |
| Torre de visión | 2 capas, ancho 64, 4 cabezas; patch 14, downsample 3 |
| Repositorio | 0,1 GB, creado el 2026-10-19, actualizado el 2026-10-19 |

## Arquitectura y entrenamiento

No hay entrenamiento. El modelo se genera instanciando la implementación de inferencia fijada del repositorio de origen (revisión `1bae0e1088993b9b82de08f59de5be5a34e42170`) sobre el meta device de PyTorch y convirtiendo su estado en tiempo de ejecución a la representación pública de checkpoint de Hugging Face. Todos los pesos son aleatorios; no hay datos de preentrenamiento, ajuste supervisado, RLHF ni DPO asociados a este repositorio.

La topología preservada incluye la atención dispersa comprimida con su indexador (capas KV/índice 1 y 3, `index head dim` 128), las Hyper-Connections de cuatro vías, la búsqueda n-gram Engram (capas 1 y 2, 4 cabezas x 64, 6.748 y 7.592 filas por tabla), el módulo DSpark/MTP de tres etapas (objetivos 3, 4 y 5, Markov rank 16, 8 expertos, top-3), el aligner de visión y el empaquetado FP4 de expertos con escalas de bloque FP8. Frente al original, se reducen anchos, cadencia de capas, número de expertos, tablas Engram y profundidad de visión: 40 capas / hidden 5.120 / 64 cabezas / 384 expertos / torre de visión de 32 capas en el checkpoint completo, frente a 6 capas / hidden 128 / 4 cabezas / 32 expertos / 2 capas de visión aquí.

El `head_dim` de 512 y el indexador de 128 se mantienen fijos porque los impone el ABI de caché y kernels DSV4 de SGLang; por eso el ejemplo oficial es un lanzamiento conservador con TP=2, que divide limpiamente todos los anchos shardeados y los bloques de cuantización de 32. El ejemplo validado usa Python 3.12.13, CUDA 13.0, torch 2.14.1, SGLang `0.5.23.dev384+g9ab74b851`, FlashInfer 0.7.2 y Transformers 5.19.0 sobre dos NVIDIA H20, con DSpark/MTP y CUDA Graph activados.

## Capacidades

- Ninguna capacidad aprendida: al estar inicializado aleatoriamente, la generación de texto produce tokens sin coherencia semántica.
- Soporte estructural de las rutas de inferencia del modelo original: enrutamiento MoE top-6, atención dispersa con indexador y decodificación especulativa DSpark/MTP de tres etapas.
- Soporte estructural multimodal (visión + texto): torre de visión de 2 capas, parcheo 14 y downsample 3, más aligner, suficiente para validar el cableado de entrada de imágenes.
- Tokenizador real del modelo base: vocabulario de 129.280 entradas e IDs especiales originales (BOS, EOS, PAD, imagen), apto para probar pipelines de tokenización.
- Compatibilidad declarada con `transformers` (`DeepseekV41ForCausalLM`, `trust_remote_code`) y con el tag `endpoints_compatible`.
- Tool calling / function calling: no disponible (no hay datos ni comportamiento entrenado que lo soporte).
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Smoke test de SGLang con el backend DSV4: arrancar `sglang serve` con `--attention-backend dsv4 --moe-runner-backend flashinfer_mxfp4 --tp-size 2` para verificar que una build preview de SGLang con soporte DeepSeek-V4.1 levanta sin descargar 510 GB.
- Validación de kernels de cuantización: comprobar el empaquetado FP4 de expertos y las escalas de bloque FP8 UE8M0 de 32x32 con FlashInfer MXFP4, usando un checkpoint de 96,7 MB que cabe en cualquier entorno de CI.
- Pruebas de decodificación especulativa: ejercitar el draft DSpark/MTP embebido de tres etapas con `--speculative-algorithm DSPARK --speculative-dspark-block-size 5` y comprobar la aceptación de tokens y la interacción con CUDA Graph.
- Integración continua de tokenizadores: verificar el manejo del vocabulario de 129.280 entradas y de los IDs especiales (incluido el token de imagen 129.264) en pipelines de preprocesado.
- Validación del camino multimodal: probar la torre de visión reducida, el aligner y el preprocesado de parches 14 / downsample 3 antes de escalar al modelo completo.
- Pruebas de sharding y paralelismo: verificar la división por TP=2 de anchos Q/O, número de cabezas y grupos, expertos y bloques de cuantización de 32 columnas, con `--ep-size 1`.
- Compatibilidad de ecosistema: comprobar la carga del checkpoint con Transformers 5.x y `trust_remote_code`, y la exposición como endpoint compatible en plataformas de serving.
- Referencia de formas tensoriales: usar los 1.629 tensores como fixture para tests unitarios de implementaciones propias (nombres, shapes y tipos de las 96.085 tensores del original, reducidos).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un checkpoint con pesos aleatorios y sin entrenamiento, cualquier métrica de calidad (MMLU, HumanEval, GSM8K, etc.) sería carente de significado y no es extrapolable al modelo original.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB incluyendo overhead de runtime; los pesos suman 96,7 MB.
- GPU validadas: 2 x NVIDIA H20 con TP=2, Python 3.12.13, CUDA 13.0, torch 2.14.1, SGLang `0.5.23.dev384+g9ab74b851`, FlashInfer 0.7.2, Transformers 5.19.0.
- Cabe en GPU consumer: sí, en cualquier GPU con suficiente memoria para el runtime (RTX 4090, etc.); el ejemplo oficial es TP=2 por requisito del ABI de DSV4, no por tamaño.
- Opciones de despliegue: SGLang (build preview/main con soporte DeepSeek-V4.1, `--trust-remote-code`) y Transformers. No hay GGUF publicado, por lo que llama.cpp y Ollama no están disponibles; vLLM y TGI no están confirmados en la información disponible.
- Ajustes de serving del ejemplo: `--context-length 4096`, `--max-total-tokens 4096`, `--chunked-prefill-size 512`, `--mem-fraction-static 0.5`, `--disable-custom-all-reduce`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Capas / hidden | Expertos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `tiny-random/deepseek-v4.1-flash-1017` | 67.984.458 | 6 / 128 | 32 + 1, top-6 | no disponible (ejemplo a 4.096) | no disponible | 1.629 tensores, 96,7 MB, 0 descargas |
| `deepseek-ai/DeepSeek-V4.1-Flash-1017` (modelo base) | no disponible | 40 / 5.120 | 384 + 1, top-6 | no disponible | no disponible | 96.085 tensores, ~510,3 GB |
| Otros checkpoints de depuración de la familia `tiny-random` | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es con el modelo base: misma topología (atención dispersa comprimida, Hyper-Connections, Engram, DSpark/MTP, torre de visión, cuantización FP4/FP8) pero con anchos, cadencia de capas, expertos y profundidad de visión reducidos para hacer viable un checkpoint de depuración.

## Limitaciones y advertencias

- Pesos aleatorios: la salida es incoherente por construcción; el riesgo de alucinación es del 100 % y no existe ninguna garantía de calidad.
- No es representativo del modelo original: ni el tamaño, ni las capacidades, ni hipotéticos benchmarks son extrapolables a `DeepSeek-V4.1-Flash-1017`.
- Licencia no disponible: no puede asumirse permiso de uso comercial; la del modelo base tampoco figura en la información proporcionada.
- Idiomas no declarados: no hay evidencia de soporte multilingüe.
- Sesgos: no documentados y no evaluables con pesos aleatorios; no hay evaluación de sesgo publicada.
- Contexto: no se publica `max_position_embeddings`; el único valor conocido es el `--context-length 4096` del ejemplo de SGLang.
- Dependencia de software inestable: requiere `--trust-remote-code` y una build preview/main de SGLang con soporte DSV4; los kernels FlashInfer MXFP4 y el ABI de caché (head 512, indexer 128) condicionan el despliegue.
- Sin validación comunitaria: 0 descargas y 0 likes; el repositorio se actualizó 7 minutos después de su creación.
- No apto para producción: cualquier uso en un servicio real introduciría salidas sin sentido; su único propósito declarado es la depuración.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tiny-random/deepseek-v4.1-flash-1017
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Revisión del código fuente citada en la model card: `1bae0e1088993b9b82de08f59de5be5a34e42170`
- Nota: las búsquedas web realizadas no devolvieron resultados relacionados con este modelo (únicamente páginas sobre TinyPNG, TinyTask, Tiny House y tiny11), por lo que no se añaden enlaces adicionales de papers, blogs, repositorios o demos.
