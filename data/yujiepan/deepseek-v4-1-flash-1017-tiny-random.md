# yujiepan/deepseek-v4.1-flash-1017-tiny-random

## Resumen

`yujiepan/deepseek-v4.1-flash-1017-tiny-random` es un modelo de depuracion (debugging) construido por el usuario yujiepan a partir de la configuracion de `deepseek-ai/DeepSeek-V4.1-Flash-1017`. No es un modelo entrenado ni utilizable en produccion: sus pesos estan inicializados de forma aleatoria y su proposito es validar la topologia completa de la arquitectura DeepSeek-V4.1 (atencion dispersa con indexador, Hyper-Connections, Engram, decodificacion especulativa DSpark/MTP, torre de vision y cuantizacion FP4/FP8) con anchos y recuentos reducidos.

El modelo conserva la estructura multimodal vision + texto, el vocabulario de 129.280 tokens y los identificadores especiales del modelo original, pero reduce la columna vertebral de texto a 6 capas, un tamano oculto de 128 y 32 expertos enrutados con top-6. Con 67.984.458 parametros totales y un unico fichero `model.safetensors` de 96,7 MB, sirve como banco de pruebas ligero para validar stacks de inferencia (SGLang con backend DSV4, FlashInfer MXFP4, TP=2) antes de desplegar el checkpoint real de ~510,3 GB.

Su relevancia es practica para ingenieros de infraestructura: permite verificar el particionado tensorial, el ABI de cache de atencion (512 de dimension latente, 128 de indexador), el pipeline especulativo de tres etapas y la ruta de cuantizacion sin necesidad de GPUs de gran capacidad ni de descargar cientos de gigabytes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (texto + vision) con atencion dispersa, Hyper-Connections, Engram y DSpark/MTP |
| Parametros totales | 67.984.458 |
| Parametros activos | No disponible (MoE con top-6 sobre 32 expertos enrutados + 1 compartido) |
| Longitud de contexto | 1.048.576 tokens (`max_position_embeddings`), con RoPE YaRN factor 16 sobre base de 65.536 |
| Tipos de cuantizacion | Expertos enrutados FP4; resto de lineales FP8; escalas UE8M0; bloques 32x32 |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (`model.safetensors`, 96,7 MB) |

## Arquitectura y entrenamiento

La topologia replica la del DeepSeek-V4.1-Flash-1017 original con anchos y recuentos reducidos: 6 capas de texto (frente a 40), tamano oculto 128 (frente a 5.120), 4 cabezas de atencion con `head_dim` 512 y 1 cabeza KV, proyecciones Q/O de bajo rango (q=128, o=128, 2 grupos), 32 expertos enrutados y 1 compartido con top-6, tamano intermedio MoE de 256 y activacion SwiGLU con limite 10,0. La atencion dispersa se distribuye en 2 capas solo deslizantes, 2 con ratio 2 y 2 con ratio 1, con capas fuente de KV/index en 1 y 3 y capa candidata en 3. Mantiene 4 flujos residuales de Hyper-Connections y dos capas Engram (1 y 2) con 4 cabezas x 64 y 6.748/7.592 filas por tabla.

El modulo DSpark/MTP conserva 3 etapas con objetivos en las capas 3, 4 y 5, rango Markov 16 y 8 expertos con top-3. La torre de vision se reduce a 2 capas, anchura 64 y 4 cabezas, manteniendo patch 14 y downsample 3. La cuantizacion replica el esquema del original: expertos enrutados en FP4, la mayoria de lineales restantes en FP8 con escalas UE8M0 y bloques 32x32.

No hay entrenamiento: los pesos son aleatorios, generados en meta device a partir de la implementacion de inferencia del modelo fuente (revision `1bae0e1088993b9b82de08f59de5be5a34e42170`). El checkpoint resultante tiene 1.629 tensores frente a los 96.085 del original.

## Capacidades

- Generacion de texto autoregresiva con la topologia completa de DeepSeek-V4.1 (sin calidad linguistica real, al ser pesos aleatorios).
- Procesamiento multimodal vision + texto: acepta peticiones con imagenes y texto, con torre de vision integrada y `image_token_id` 129264.
- Decodificacion especulativa DSpark/MTP de tres etapas embebida, validada con `--speculative-algorithm DSPARK` y tamano de bloque 5.
- Soporte de atencion dispersa con indexador y backend DSV4 en SGLang.
- Compatibilidad con cuantizacion FP4 para expertos y FP8 para el resto, con escalas UE8M0.
- Particionado tensorial TP=2 verificado para texto e imagen+texto.
- No dispone de capacidades reales de razonamiento, codigo, matematicas ni tool calling, al carecer de entrenamiento.

## Casos de uso

- Validacion de stacks de inferencia: permite comprobar que una build de SGLang con soporte DeepSeek-V4.1 arranca correctamente con `--attention-backend dsv4` y `--moe-runner-backend flashinfer_mxfp4` antes de desplegar el modelo real.
- Pruebas de particionado tensorial: al dividir limpiamente todas las anchuras, cabezas, expertos y filas de vocabulario por TP=2, sirve para verificar la logica de sharding en 2 GPUs.
- Depuracion del pipeline especulativo: el DSpark/MTP de tres etapas embebido permite validar la generacion de borradores y la aceptacion de tokens sin cargar el checkpoint completo.
- Verificacion del ABI de cache de atencion: con dimension latente 512 e indexador 128, valida la compatibilidad con el backend DSV4 de SGLang.
- Pruebas de cuantizacion FP4/FP8: permite ejercitar las rutas de dequantizacion y los kernels MXFP4 de FlashInfer con escalas UE8M0 y bloques 32x32.
- Integracion continua de infraestructura: su tamano de 96,7 MB y su arranque rapido lo hacen adecuado para tests de regresion en pipelines de CI que validen cambios en el servidor de inferencia.
- Validacion de la ruta multimodal: permite comprobar el flujo completo de peticiones imagen+texto con la torre de vision reducida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un modelo con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K) careceria de significado.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para los pesos (96,7 MB en safetensors, con cuantizacion FP4/FP8); el consumo real depende de la cache KV y del backend.
- GPU recomendadas: el autor valida TP=2 en dos NVIDIA H20; cualquier GPU con soporte para FlashInfer MXFP4 y el backend DSV4 de SGLang deberia servir.
- Cabe en GPU de consumo: si, por el tamano de pesos, aunque la compatibilidad de kernels depende del backend y de la build de SGLang.
- Opciones de despliegue: SGLang con soporte DeepSeek-V4.1 (preview/main), `--trust-remote-code`, `--tp-size 2`, `--ep-size 1`, `--attention-backend dsv4`, `--moe-runner-backend flashinfer_mxfp4`, `--speculative-algorithm DSPARK`, `--context-length 4096`, `--max-total-tokens 4096`, `--chunked-prefill-size 512`, `--mem-fraction-static 0.5`, `--disable-custom-all-reduce`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| yujiepan/deepseek-v4.1-flash-1017-tiny-random | 67,98 M | 1.048.576 | No disponible | Depuracion de topologia |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 | No disponible (~510,3 GB de checkpoint) | No disponible | No disponible | Modelo multimodal MoE de produccion |
| Otros tiny-random de la familia DeepSeek | No disponible | No disponible | No disponible | Depuracion |

No se dispone de datos de rendimiento comparables, ya que el modelo tiny no esta entrenado y el modelo fuente no aporta metricas en la informacion proporcionada.

## Limitaciones y advertencias

- Pesos inicializados aleatoriamente: no genera texto coherente ni responde a instrucciones; no debe usarse en produccion ni para evaluacion de calidad.
- Sin entrenamiento ni alineacion: no hay RLHF, DPO ni datos de preentrenamiento, por lo que no aplican consideraciones de sesgo de datos, pero tampoco existe utilidad linguistica.
- Licencia no disponible: no se puede confirmar el uso comercial; hay que consultar la licencia del modelo base `deepseek-ai/DeepSeek-V4.1-Flash-1017`.
- Idiomas no declarados: al no estar entrenado, el soporte multilingue es inexistente en la practica.
- Dependencia de builds especificas: requiere una version de SGLang con soporte DeepSeek-V4.1 y `--trust-remote-code`; otras librerias (transformers estandar, llama.cpp, Ollama) no estan validadas.
- El contexto maximo declarado (1.048.576) no implica que el modelo pueda aprovecharlo; el ejemplo de despliegue limita `--context-length` a 4.096.
- Riesgo de confusion: el nombre sugiere un modelo Flash de DeepSeek, pero es un artefacto de depuracion de un tercero, no un modelo oficial.

## Enlaces

- Hugging Face: https://huggingface.co/yujiepan/deepseek-v4.1-flash-1017-tiny-random
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Revision del modelo fuente usada: `1bae0e1088993b9b82de08f59de5be5a34e42170`
- SGLang (servidor de inferencia): no disponible en la informacion proporcionada
- FlashInfer (kernels MXFP4): no disponible en la informacion proporcionada
