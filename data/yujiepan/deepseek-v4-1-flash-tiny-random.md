# yujiepan/deepseek-v4.1-flash-tiny-random

## Resumen

`yujiepan/deepseek-v4.1-flash-tiny-random` es un checkpoint de depuración de 67.984.458 parámetros (~68 M) construido por el usuario yujiepan a partir de la configuración de `deepseek-ai/DeepSeek-V4.1-Flash`. No es un modelo entrenado: sus pesos están inicializados de forma aleatoria y su propósito es reproducir la topología del modelo grande (MoE multimodal con atención dispersa comprimida, Hyper-Connections, Engram, decodificación especulativa DSpark/MTP y torre de visión) en un tamaño manejable de 96,7 MB.

Su relevancia es práctica: permite validar pilas de inferencia (SGLang con backend `dsv4`, FlashInfer, kernels MXFP4) y rutas de código de DeepSeek-V4.1 sin necesidad de reservar los ~510,3 GB del checkpoint público. La estructura se generó instanciando la implementación oficial de inferencia de V4.1 en `meta device` y convirtiendo el estado en tiempo de ejecución a la representación pública de Hugging Face, conservando nombres y topología de tensores.

El modelo mantiene las modalidades visión + texto, el vocabulario de 129.280 tokens y los IDs especiales originales, pero reduce capas (40 a 6), dimensión oculta (5.120 a 128), expertos (384 a 32) y profundidad de visión (32 a 2 capas). La licencia y los idiomas no están declarados en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (texto + visión) con atención dispersa comprimida e indexer, Hyper-Connections y DSpark/MTP; clase `DeepseekV41ForCausalLM`, tipo `deepseek_v41` |
| Parametros totales | 67.984.458 (~68 M) |
| Parametros activos | no disponible (MoE con 32 expertos enrutados + 1 compartido, top-6) |
| Longitud de contexto | no disponible (el ejemplo de SGLang configura `--context-length 4096`) |
| Tipos de cuantizacion | FP8 en la mayoría de lineales; FP4 en expertos enrutados; escalas UE8M0; bloques 32x32 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`, 96,7 MB; 1.629 tensores) |
| Vocabulario | 129.280 tokens (BOS 0, EOS 1, PAD 2, imagen 129264) |
| Capas del backbone de texto | 6 |
| Dimensión oculta | 128 |
| Cabezas de atención / dim de cabeza | 4 / 512 (ABI DSV4 de SGLang; `head_dim >= 32`) |
| Dtype declarado | bfloat16 |

## Arquitectura y entrenamiento

El checkpoint replica la arquitectura de DeepSeek-V4.1-Flash: un transformer MoE con atención dispersa comprimida y su indexer, cuatro flujos residuales Hyper-Connections, búsqueda n-gram Engram, tres etapas DSpark/MTP para decodificación especulativa, alineador de visión y empaquetado FP4 de expertos con escalas de bloque FP8. En esta versión reducida se conservan 6 capas de texto, 4 cabezas de atención con `head_dim` 512 (448 sin RoPE + 64 RoPE), proyecciones Q/O de bajo rango (q=128, o=128, 2 grupos), 32 expertos enrutados más 1 compartido con top-6, tamaño intermedio MoE de 256, ratios de atención dispersa de 2 capas solo deslizantes, 2 de ratio 2 y 2 de ratio 1, capas KV/index en 1 y 3, capa candidata 3, Engram en capas 1 y 2 (4 cabezas x 64; 6.748 y 7.592 filas) y DSpark de 3 etapas con objetivos 3, 4 y 5, rango 16, 8 expertos y top-3. La torre de visión queda en 2 capas, anchura 64 y 4 cabezas, manteniendo patch 14 y downsample 3.

No hay entrenamiento: los pesos son aleatorios (`randomly initialized`). La generación del repositorio parte de la implementación oficial de inferencia fijada por DeepSeek (revisiones `314113f8...` para el checkpoint fuente y `1bae0e10...` para la implementación 1017), que comparten `config.json` e índice de checkpoint byte a byte (96.085 nombres de tensor). El resultado son 1.629 tensores y 96,7 MB. La validación de despliegue se hizo con TP=2, DSpark/MTP y CUDA Graph sobre dos NVIDIA H20 con Python 3.12.13, CUDA 13.0, torch 2.14.1, SGLang `0.5.23.dev384+g9ab74b851`, FlashInfer 0.7.2 y Transformers 5.19.0.

## Capacidades

- Ejecución del forward multimodal (texto + visión) con la topología completa de V4.1, incluyendo el alineador de visión y `image_token_id` 129264.
- Enrutamiento MoE con 32 expertos enrutados y 1 compartido, top-6, y ruta de empaquetado FP4 con escalas de bloque FP8/UE8M0.
- Atención dispersa comprimida con indexer, capas KV/index en 1 y 3 y `head_dim` de índice 128.
- Decodificación especulativa DSpark/MTP de tres etapas con draft embebido (objetivos 3, 4 y 5; rango 16; 8 expertos; top-3).
- Hyper-Connections de cuatro flujos residuales y búsqueda n-gram Engram.
- Tokenizer y IDs especiales idénticos al modelo original (vocabulario de 129.280).
- Servicio en SGLang con backend `dsv4`, `flashinfer_mxfp4`, TP=2 y CUDA Graph.
- No soporta tool calling, agentes, razonamiento ni generación coherente: al ser pesos aleatorios, no hay capacidades funcionales aprendidas.

## Casos de uso

- Pruebas de integración de SGLang con DeepSeek-V4.1: lanzar el servidor con `--attention-backend dsv4`, `--moe-runner-backend flashinfer_mxfp4` y `--speculative-algorithm DSPARK` para verificar que la pila arranca sin el checkpoint de 510,3 GB.
- Validación de kernels de atención dispersa e indexer: las capas 1 y 3 ejercitan las rutas KV/index y la anchura fija de 128 del indexer, útil para probar FlashInfer 0.7.2 y el ABI de caché DSV4.
- Pruebas de enrutamiento MoE y empaquetado FP4 en CI: los 32 expertos con top-6 y bloques de cuantización de 32x32 permiten comprobar kernels MXFP4 y escalas UE8M0 sin grandes requisitos de memoria.
- Verificación de decodificación especulativa DSpark/MTP: el draft de tres etapas embebido permite probar la aceptación de tokens, el block size 5 y la integración con CUDA Graph.
- Pruebas de sharding TP=2/EP: todas las anchuras fragmentadas (256 de intermedio MoE, 128 por rango, vocabulario y bloques de 32) dividen por 2, lo que sirve para validar lógica de reparto y `--disable-custom-all-reduce`.
- Tests de paridad estructural: comparar los 1.629 tensores y el `config.json` anidado (`text_config` + `vision_config`) contra el índice de 96.085 nombres del release 1017 para detectar regresiones en herramientas de conversión.
- Desarrollo de tooling de checkpoints: validar scripts que instancian el modelo en `meta device` y reconvierten el estado a formato Hugging Face antes de aplicarlos al modelo completo.
- Pruebas de pipeline multimodal y tokenizer: comprobar el tratamiento de `image_token_id` 129264, BOS/EOS/PAD y las 129.280 filas de vocabulario en preprocesado y postprocesado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el fichero de pesos ocupa 96,7 MB y el modelo tiene 67.984.458 parámetros.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.), en CPU e incluso en iGPU; no requiere GPU de centro de datos.
- Configuración validada por el autor: 2 x NVIDIA H20 con TP=2, EP=1, DSpark/MTP y CUDA Graph (Python 3.12.13, CUDA 13.0, torch 2.14.1, SGLang 0.5.23.dev384+g9ab74b851, FlashInfer 0.7.2, Transformers 5.19.0).
- Despliegue: SGLang con `--attention-backend dsv4`, `--moe-runner-backend flashinfer_mxfp4`, `--speculative-algorithm DSPARK`, `--speculative-dspark-block-size 5`, `--context-length 4096`, `--max-total-tokens 4096`, `--chunked-prefill-size 512`, `--mem-fraction-static 0.5` y `--trust-remote-code`.
- Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible (no se menciona soporte para esta arquitectura).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Capas texto | Hidden size | Expertos enrutados/compartidos | Checkpoint | Licencia |
|---|---|---|---|---|---|---|
| deepseek-v4.1-flash-tiny-random (este) | 67.984.458 | 6 | 128 | 32 / 1, top-6 | 96,7 MB, 1.629 tensores | no disponible |
| deepseek-ai/DeepSeek-V4.1-Flash (base) | no disponible | 40 | 5.120 | 384 / 1, top-6 | ~510,3 GB, 96.085 tensores | no disponible |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 | no disponible | 40 | 5.120 | 384 / 1, top-6 | mismo índice que el base | no disponible |
| Otros checkpoints de depuración comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es estructural: este checkpoint reduce capas, anchura, expertos, tablas Engram y profundidad de visión, pero mantiene modalidades, vocabulario, ratios de atención dispersa, Hyper-Connections, DSpark/MTP, alineador de visión y el esquema de cuantización FP4/FP8.

## Limitaciones y advertencias

- Pesos inicializados aleatoriamente: no genera texto ni respuestas coherentes; cualquier salida es ruido y no debe evaluarse como calidad de modelo.
- No es apto para producción, investigación de capacidades ni evaluación de sesgos; no hay datos de entrenamiento que analizar.
- Sin benchmarks publicados, sin descargas y sin likes en el momento de la ficha: no existe validación externa de la comunidad.
- Licencia no declarada: no puede asumirse uso comercial; hay que consultar al autor y al modelo base antes de redistribuir.
- Idiomas soportados no disponibles; el tokenizer se hereda del modelo original, pero no hay comportamiento lingüístico real.
- Dependencia de una build preview/main de SGLang con soporte DeepSeek-V4.1 y de FlashInfer 0.7.2; el ejemplo está fijado a TP=2 porque las anchuras del indexer y de la atención están impuestas por el ABI de caché/kernels DSV4.
- El contexto del ejemplo es de 4096 tokens y no se declara la ventana nativa del modelo base.
- Riesgo de alucinación: no aplicable en el sentido habitual, pero las salidas son sintácticamente posibles y semánticamente vacías, lo que puede confundir en pruebas automatizadas que solo validen formato.
- El tamaño reducido (96,7 MB) impide usarlo como sustituto funcional del modelo base en pruebas de calidad; solo sirve para validar rutas de ejecución y estructura.

## Enlaces

- [HuggingFace: yujiepan/deepseek-v4.1-flash-tiny-random](https://huggingface.co/yujiepan/deepseek-v4.1-flash-tiny-random)
- [Modelo base: deepseek-ai/DeepSeek-V4.1-Flash](https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash)
- [Implementación de referencia: deepseek-ai/DeepSeek-V4.1-Flash-1017](https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017)
