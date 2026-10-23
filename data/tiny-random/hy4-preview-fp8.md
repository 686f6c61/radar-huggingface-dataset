# tiny-random/hy4-preview-fp8

## Resumen

`tiny-random/hy4-preview-fp8` es un modelo de depuración publicado por la organización `tiny-random`. No es un modelo entrenado: sus pesos se inicializan de forma aleatoria a partir de una configuración adaptada de `tencent/Hy4-preview-FP8`, el checkpoint FP8 del modelo HYV4 de Tencent. Su propósito es reproducir la estructura del modelo original (arquitectura MoE con atención MLA, capas DSA, decodificación especulativa MTP y cuantización MXFP8) en un tamaño manejable de 54.592.165 parámetros y un checkpoint de 70.661.788 bytes, de modo que desarrolladores e investigadores puedan validar rutas de carga, kernels y configuraciones de despliegue sin mover el modelo completo.

La relevancia es puramente de ingeniería: permite verificar en CI que las versiones de Transformers, vLLM o SGLang cargan correctamente checkpoints MXFP8 con escalas E8M0, que los kernels Marlin funcionan con tensor-parallel de 4, que la atención indexada (DSA) se resuelve con la implementación `eager` y que la plantilla de chat y el tokenizador del modelo base se comportan como se espera. El modelo base es un transformer decoder-only con 78 capas, hidden size de 6.144 y 256 expertos enrutados; la versión tiny conserva el mismo esquema con 10 capas, hidden size de 64 y 32 expertos.

Al no haber sido entrenado, el modelo no produce texto coherente ni tiene capacidades lingüísticas reales. Cualquier evaluación de calidad, benchmark o uso en producción sobre este checkpoint carece de sentido; sirve exclusivamente como artefacto de prueba estructural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE (HYV4) y atención MLA; capas con atención indexada (DSA); decodificador MTP |
| Parametros totales | 54.592.165 (~54,6 M) |
| Parametros activos | no disponible (32 expertos enrutados, top-k 8, 1 experto compartido; no se publica el recuento de parámetros activos) |
| Longitud de contexto | no disponible (los ejemplos de despliegue fijan `max-model-len` y `context-length` en 4.096 tokens, pero no se declara la ventana nativa) |
| Tipos de cuantizacion | Pesos MXFP8 E4M3 con escalas E8M0 en contenedores uint8, grupos 1x32; embeddings, head y gates en BF16; iHC y attention sinks en FP32; en runtime Marlin usa activaciones BF16 (W8A16) |
| Idiomas soportados | no disponible (la model card menciona validación con prompts en inglés, chino y DSA largo, sin listado oficial de idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`, 70,7 MB) |

Otras especificaciones estructurales: vocabulario de 120.832 tokens con embeddings no atados (`tied embeddings: false`); 10 capas de backbone con hidden size 64; 1 capa densa seguida de capas MoE; tamaño intermedio denso 128 y de experto 512; 8 cabezas de atención Q con dimensiones no-RoPE / RoPE / V de 32 / 64 / 32; rangos LoRA de Q y KV de 64 y 512; indexer de 32 cabezas, dimensión 128 y 2.048 tokens seleccionados, presente en las capas 0, 1, 5 y 9 (el resto reutiliza el indexer anterior); 4 streams de Hyper-Connections con ramas pre/post con gating; MLA gating elementwise, attention sinks aprendidos y clamp SwiGLU de 10.

## Arquitectura y entrenamiento

El modelo replica la topología del checkpoint `tencent/Hy4-preview-FP8`: un decoder-only con mezcla de expertos en el que la primera capa MLP es densa y las siguientes enrutan cada token a 8 de los 32 expertos, con un experto compartido adicional. La atención es MLA (Multi-head Latent Attention) con rangos LoRA separados para Q y KV, gating elementwise y attention sinks aprendidos, e incorpora capas de atención indexada (DSA, expuestas en Transformers mediante el tag de configuración `indexed_attention`) que seleccionan hasta 2.048 tokens por consulta. Sobre el backbone se añade un decodificador MTP (Multi-Token Prediction) con embedding y head compartidos, pensado para decodificación especulativa, y cuatro streams de Hyper-Connections con ramas pre y post con gating, una variante de conexiones residuales múltiples.

No hay entrenamiento: los pesos se generan aleatoriamente con la configuración adaptada del modelo fuente. Lo que sí se hereda sin cambios es el tokenizador, la plantilla de chat y los assets de generación, copiados del checkpoint fijado de `tencent/Hy4-preview-FP8`. La precisión del checkpoint reproduce la configuración ModelOpt MXFP8 del origen: pesos E4M3, escalas E8M0 almacenadas en uint8, embeddings, head y gates en BF16, e iHC y sinks en FP32. Algunos ajustes son obligados por los kernels: el backend Marlin sobre H20 exige anchura 64, y el tensor-parallel de 4 con Marlin requiere una partición de experto de anchura 128, lo que fuerza un tamaño intermedio de experto de 512. Al no haber datos de entrenamiento, no existe información sobre número de tokens, composición del corpus ni fases de RLHF o DPO.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation`, pero al ser pesos aleatorios la salida no es lingüísticamente válida; la capacidad es estructural, no funcional.
- Conversacional: incluye la plantilla de chat del modelo fuente y acepta `apply_chat_template` con roles de usuario y asistente.
- Tool calling y function calling: no disponible; no se documenta soporte y, sin entrenamiento, no sería fiable.
- Agentes y razonamiento multi-paso: no disponible.
- Multilingüismo: no disponible; solo se menciona validación con prompts en inglés y chino.
- Decodificación especulativa MTP: soportada y verificada en vLLM con 3 tokens especulativos (`--speculative-config '{"method":"mtp","num_speculative_tokens":3}'`) y en SGLang con NEXTN.
- Atención indexada (DSA): ejercitable con prompts largos, útil para probar los kernels y la selección de 2.048 tokens.
- Compatibilidad de endpoints: el tag `endpoints_compatible` indica que puede servirse detrás de una API compatible con el esquema habitual.
- Tokenizador de 120.832 entradas idéntico al del modelo fuente, útil para pruebas de tokenización a escala real.

## Casos de uso

- Pruebas de integración de vLLM: el comando verificado con `--tensor-parallel-size 4`, backend Marlin para capas lineales y MoE, MTP de 3 tokens y CUDA Graph permite validar en CI que una actualización de vLLM no rompe la ruta MXFP8 sin necesidad de aprovisionar el modelo completo.
- Validación de la ruta de carga en Transformers: el ejemplo verificado manipula en memoria `quantization_config` con `FineGrainedFP8Config`, remapea `weight_scale` a `weight_scale_inv` y reinterpreta escalas uint8 como `float8_e8m0fnu`; es un caso de regresión ideal para las versiones 5.19.0 y posteriores.
- CI de decodificación especulativa: al incluir un decodificador MTP real (aunque con pesos aleatorios), sirve para comprobar que el borrador y la verificación de tokens funcionan de extremo a extremo en distintos backends.
- Pruebas de tokenizador y plantilla de chat: con un vocabulario de 120.832 entradas y la plantilla del modelo Hy4, permite detectar roturas en el formateo de conversaciones multi-turno antes de desplegar el modelo grande.
- Validación de despliegues multinodo: el ejemplo de SGLang con `--tp-size 4`, `--nnodes 4` y NEXTN permite ensayar la orquestación (rangos de nodo, dirección de init distribuido, puerto NCCL) con un artefacto de 0,1 GB.
- Pruebas de empaquetado y distribución: el repo cabe en cualquier caché local, lo que facilita tests de descarga, verificación de checksums y políticas de almacenamiento en pipelines internos.
- Banco de pruebas de kernels de atención: los prompts largos con DSA permiten medir el comportamiento del indexer de 2.048 tokens y de las attention sinks aprendidas bajo `attn_implementation="eager"`.
- Verificación de compatibilidad de endpoints: útil para comprobar el enrutado, los límites de longitud y el streaming en pasarelas API antes de conectar el modelo de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un modelo con pesos inicializados aleatoriamente, cualquier métrica de calidad (MMLU, HumanEval, GSM8K u otras) sería inválida y no reflejaría el rendimiento del modelo fuente `tencent/Hy4-preview-FP8`.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 70,7 MB y los pesos en MXFP8 rondan los 55 MB; las dos matrices de tokens BF16 no atadas suman 30.932.992 bytes. En la práctica, el modelo completo cabe en menos de 1 GB de VRAM incluyendo caché KV y buffers de ejecución.
- GPU validadas: NVIDIA H20 (SM90) con Transformers en una GPU y con vLLM en TP=4. El backend nativo MXFP8 de SGLang exige SM100 o superior, por lo que en H20 hay que usar la ruta Marlin de vLLM.
- GPU consumer: sí cabe en cualquier GPU consumer con al menos 1 GB libre, incluidas RTX 3090, 4090 o 5090; no se ha verificado en estas tarjetas, solo en H20.
- Opciones de despliegue: vLLM (verificado, con Marlin y MTP), SGLang (no verificado en la información disponible), Transformers con `attn_implementation="eager"` y `experts_implementation="eager"` (verificado).
- Configuración de referencia: vLLM con `--max-model-len 4096`, `--max-num-batched-tokens 512`, `--max-num-seqs 4`, `--gpu-memory-utilization 0.3` y captura de CUDA Graph para tamaños 1, 2, 4, 8 y 16.
- Latencia y throughput: no disponibles. Los parámetros anteriores corresponden a los ejemplos de la model card, no a mediciones publicadas.
- Entorno probado: vLLM 0.32.0, Torch 2.13.0+cu130, CUDA 13.0, Transformers 5.19.0 y FlashInfer 0.7.0.post1.

## Comparativa con modelos similares

| Modelo | Parametros | Capas / hidden | Expertos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `tiny-random/hy4-preview-fp8` | 54,6 M | 10 / 64 | 32 enrutados, top-8, 1 compartido | no disponible | no disponible | HuggingFace, pesos safetensors |
| `tencent/Hy4-preview-FP8` (fuente) | no disponible | 78 / 6.144 | 256 enrutados, top-8, 1 compartido | no disponible | no disponible | HuggingFace, pesos MXFP8 |
| Otros repositorios `tiny-random` de depuración | variable | variable | no disponible | no disponible | no disponible | HuggingFace |

La comparación relevante es con el modelo fuente: comparten tokenizador, plantilla de chat y esquema de cuantización, pero difieren en profundidad (10 frente a 78 capas), anchura (64 frente a 6.144) y número de expertos (32 frente a 256). No se dispone de datos de benchmarks ni de licencia para ninguno de los dos en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no ha sido entrenado. Genera texto sin sentido y no debe usarse para evaluación de calidad, demos ni producción.
- Riesgo de alucinación: total y por diseño; cualquier salida es arbitraria.
- Sesgos: no disponible; al no haber datos de entrenamiento no se pueden caracterizar sesgos, pero tampoco existe la garantía de ausencia de comportamientos degenerados.
- Licencia no declarada: la ausencia de licencia impide asumir permisos de uso comercial, modificación o redistribución; es un riesgo legal directo si se reutiliza el artefacto.
- Dependencia de versiones concretas: la ruta verificada depende de Transformers 5.19.0 con atención eager, de vLLM 0.32.0 con Marlin y de CUDA 13.0; otras combinaciones pueden fallar al cargar las escalas E8M0 o el tag `indexed_attention`.
- Restricciones de kernels: el backend Marlin necesita anchura 64 y una partición de experto de 128 con TP=4, lo que altera el tamaño intermedio respecto al modelo fuente.
- SGLang no verificado: su backend nativo MXFP8 requiere SM100 o superior, de modo que en GPUs SM90 como la H20 no es una alternativa validada.
- Longitud de contexto: los 4.096 tokens de los ejemplos son un límite de configuración, no una ventana nativa declarada; no debe asumirse esa cifra como capacidad del modelo fuente.
- Nombre potencialmente engañoso: el identificador incluye `hy4-preview-fp8` y el tag `base_model`, pero el contenido es una maqueta; no debe confundirse con el checkpoint de Tencent.
- Repo con 0 descargas y 0 likes: no hay evidencia de uso en la comunidad ni de mantenimiento más allá de la creación y actualización del 23 de octubre de 2026.

## Enlaces

- [tiny-random/hy4-preview-fp8 en HuggingFace](https://huggingface.co/tiny-random/hy4-preview-fp8)
- [tencent/Hy4-preview-FP8 (modelo base)](https://huggingface.co/tencent/Hy4-preview-FP8)
- No se han encontrado otros enlaces relevantes en la búsqueda web: los resultados devueltos (TinyTask, TinyPNG, La Tiny House, Tiny House France y TinyURL) no guardan relación con el modelo.
