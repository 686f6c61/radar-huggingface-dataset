# xbill9/gemma-4-26B-A4B-it-qat-q4_0-fp8-text

## Resumen

Este repositorio es una reconstruccion no oficial, publicada por el usuario independiente xbill9, de los pesos del modelo Gemma 4 26B-A4B-it entrenado con quantisation-aware training (QAT) por Google DeepMind. En concreto, toma el checkpoint `google/gemma-4-26B-A4B-it-qat-q4_0-unquantized` (revision `f1e06dc`) y lo reempaqueta en formato FP8 E4M3 con esquema W8A8, es decir, pesos de 8 bits con un factor de escala float32 por canal de salida y activaciones cuantizadas a FP8 por token en tiempo de ejecucion. El resultado es un checkpoint de 24,26 GiB (26,1 GB en el repositorio) pensado para servirse con vLLM.

El modelo subyacente es un transformer con arquitectura de mezcla de expertos (MoE) de 25.233.141.790 parametros totales, con 128 expertos por capa segun la model card, y la nomenclatura A4B indica un regimen de aproximadamente 4.000 millones de parametros activos por token. Al ser una variante `-it`, esta alineado para uso conversacional. La relevancia actual radica en que ofrece una ruta de despliegue en FP8 para hardware con soporte de esa precision (AMD MI300X, aceleradores Hopper o superiores), reduciendo el peso del checkpoint frente a alternativas de mayor precision.

Se trata de un build estrictamente experimental: el propio autor indica que esta construido y verificado offline contra su fuente, pero que no se ha servido ni evaluado todavia, y que esta en cola para una prueba de servicio en una AMD Instinct MI300X. No esta afiliado ni respaldado por Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), 128 expertos por capa (segun model card) |
| Parametros totales | 25.233.141.790 (aprox. 25,2 mil millones) |
| Parametros activos | Aproximadamente 4.000 millones (segun nomenclatura A4B del modelo base; no confirmado de forma explicita en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 E4M3 W8A8 (pesos FP8 con escala float32 por canal de salida; activaciones FP8 por token); embeddings, normas y router en bf16 |
| Idiomas soportados | no disponible (la model card solo indica "text only") |
| Licencia | Apache 2.0 (license_link: https://ai.google.dev/gemma/docs/gemma_4_license) |
| Formato de pesos | safetensors con compressed-tensors (float-quantized); libreria vllm |
| Tamano del checkpoint | 24,26 GiB |
| Tamano del repositorio | 26,1 GB |
| Modelo base | google/gemma-4-26B-A4B-it-qat-q4_0-unquantized (revision f1e06dc) |
| Modulos lineales en FP8 | 11.725 |
| Valores cuantizados | 24.483.430.400 |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 26B-A4B-it, un transformer de tipo mezcla de expertos con 128 expertos por capa. El checkpoint original fue entrenado por Google con quantisation-aware training (QAT), es decir, los pesos se ajustaron sobre una rejilla de 4 bits con una escala por grupo de 32 valores. El router (`router.proj`) permanece en bf16 para no degradar la seleccion de expertos.

Este build concreto no entrena ni ajusta nada: solo recuantiza. Como FP8 con una escala por canal de salida no puede representar las escalas por grupo de 32 del QAT original, el autor vuelve a redondear los pesos ya cuantizados y ademas cuantiza las activaciones a FP8. Las medidas declaradas en `verify_report.json` son un error RMS relativo del 2,60 % y un error maximo, como fraccion del mayor valor de su fila, del 3,57 %. Los tensores no lineales (392 de 392) se copian byte a byte desde la fuente, y los embeddings, normas y demas tensores no lineales quedan en bf16. La estructura original fusionaba los 128 expertos de cada capa en dos bancos (`experts.gate_up_proj`, `experts.down_proj`); este build los separa en un modulo por experto (`experts.{i}.{gate,up,down}_proj`), siguiendo el mismo layout que el repack W4A16 del mismo autor. El proceso se genera con `fp8_text.py`, que importa utilidades de `repack_q4_0.py`, y no utiliza datos de calibracion.

El autor advierte de una contrapartida tecnica importante: para recuperar la rejilla QAT exacta hay que usar la variante `xbill9/gemma-4-26B-A4B-it-qat-q4_0-w4a16-ct-text`, ya que este build introduce una recuantizacion adicional.

## Capacidades

- Generacion de texto conversacional, dado que deriva de la variante instruct (`-it`) del modelo base.
- Razonamiento y generacion de codigo: capacidades heredadas del modelo base Gemma 4 26B-A4B-it; no verificadas especificamente en este build.
- Arquitectura MoE con 128 expertos por capa, lo que implica que solo una fraccion de los parametros se activa por token.
- Soporte de tool calling / function calling: no disponible de forma explicita en la informacion proporcionada (depende del modelo base).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita.
- Capacidades multilingues: no disponible; la model card solo indica que es un build "text only".
- Capacidades especiales (vision, audio, thinking mode): no disponibles. El repositorio es explicitamente text-only y deriva solo del componente de texto del modelo base.

## Casos de uso

- Servicio de inferencia en produccion con vLLM: el checkpoint esta empaquetado en safetensors con compressed-tensors y etiquetado para vLLM, de forma que puede cargarse directamente en un servidor OpenAI-compatible. Es el caso de uso principal que persigue el autor.
- Despliegue en aceleradores con soporte FP8 nativo: sobre AMD Instinct MI300X o GPUs Hopper (H100), donde el esquema W8A8 aprovecha las unidades de computo en FP8 y reduce el ancho de banda de memoria requerido frente a bf16.
- Reduccion de huella de memoria en nodos multi-modelo: con 24,26 GiB de checkpoint, permite alojar el modelo junto a otros servicios en GPUs de 48-80 GB sin las restricciones de un checkpoint bf16 de mayor tamano.
- Evaluacion comparativa de esquemas de cuantizacion: sirve como punto de referencia frente a los repacks W4A16 y w8a8-int8-emb4 del mismo autor para medir el impacto de FP8 frente a alternativas de 4 y 8 bits.
- Investigacion sobre recuantizacion de pesos QAT: el build documenta explicitamente como una rejilla QAT por grupo de 32 no se puede representar en FP8 con escala por canal, un caso de estudio util para quien disene pipelines de cuantizacion.
- Atencion al cliente automatizada y generacion de texto a gran escala: aplicable a cualquier tarea de generacion conversacional propia de Gemma 4 26B-A4B-it, siempre que se asuma que este build no ha sido evaluado y que el comportamiento puede diferir del original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que el modelo esta "built and checked offline against its source; not yet served or evaluated". Las unicas metricas publicadas son de fidelidad de la recuantizacion, no de calidad de tarea:

| Metrica de fidelidad (verify_report.json) | Valor |
|---|---:|
| Modulos lineales en FP8 | 11.725 |
| Valores cuantizados | 24.483.430.400 |
| Error RMS relativo | 2,60 % |
| Error maximo (fraccion del mayor valor de su fila) | 3,57 % |
| Otros tensores byte-identicos a la fuente | 392 de 392 |
| Tamano del checkpoint | 24,26 GiB |

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 24,26 GiB, por lo que se necesita una GPU con al menos 32 GB para cargar los pesos, y mas para el contexto y el KV cache. La informacion no incluye una cifra oficial de VRAM total en inferencia.
- GPU recomendadas: AMD Instinct MI300X (el autor la menciona como plataforma de la prueba de servicio en cola) y aceleradores con soporte FP8 como H100. Las GPUs Ada (L40S, RTX 6000 Ada) soportan FP8 en hardware, pero no hay datos confirmados para este build.
- Consumer GPU: no cabe con comodidad en GPUs de consumo de 24 GB (RTX 4090, RTX 3090) dado que el checkpoint solo ya son 24,26 GiB; requeriria cuantizaciones adicionales o offload.
- Opciones de despliegue: vLLM (libreria declarada del repositorio). El formato safetensors con compressed-tensors es tambien compatible con TensorRT-LLM y otros motores que soporten ese esquema, aunque no esta confirmado en la informacion.
- Latencia y throughput: no disponibles para este build. Como referencia externa, un articulo de la comunidad reporta para el modelo QAT 26B-A4B servido en una TPU v6e 17,43 GiB de HBM, 53.888 tokens de KV cache y 1.283 tokens de salida por segundo, pero esas cifras corresponden a otra configuracion de servicio y no deben atribuirse a este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamano | Licencia | Estado |
|---|---|---|---|---|---|
| xbill9/gemma-4-26B-A4B-it-qat-q4_0-fp8-text (este) | 25,2 B totales / ~4 B activos | FP8 E4M3 W8A8 | 24,26 GiB | Apache 2.0 | No servido ni evaluado |
| xbill9/gemma-4-26B-A4B-it-qat-q4_0-w4a16-ct-text | 25,2 B (mismo base) | W4A16 (rejilla QAT exacta) | no disponible | Apache 2.0 | Repack del mismo autor |
| xbill9/gemma-4-26B-A4B-it-qat-q4_0-w4a16-ct-text-emb4 | 25,2 B (mismo base) | W4A16 con embeddings de 4 bits | no disponible | Apache 2.0 | Repack del mismo autor |
| xbill9/gemma-4-26B-A4B-it-qat-w8a8-int8-emb4 | 25,2 B (mismo base) | W8A8 INT8 con embeddings de 4 bits | no disponible | Apache 2.0 | Repack del mismo autor |
| google/gemma-4-26B-A4B-it-qat-q4_0-unquantized | 25,2 B (mismo base) | QAT q4_0 sin cuantizar | no disponible | Apache 2.0 | Modelo base original de Google |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de tarea entre estas variantes.

## Limitaciones y advertencias

- Modelo exclusivamente de texto: no conserva ningun componente multimodal del Gemma 4 original.
- No ha sido servido ni evaluado. El autor lo indica expresamente; cualquier uso en produccion requiere una validacion propia previa.
- Build no oficial y no afiliado a Google. Los problemas deben reportarse al autor del repositorio, no a Google DeepMind.
- Perdida de fidelidad respecto al QAT original: FP8 con una escala por canal de salida no reproduce la rejilla QAT de 4 bits con escala por grupo de 32, por lo que los pesos se recuantizan una segunda vez (error RMS relativo del 2,60 %, error maximo del 3,57 %). Para la rejilla QAT exacta hay que usar la variante W4A16.
- Cuantizacion de activaciones en tiempo de ejecucion, que puede introducir degradacion adicional no medida en tareas reales.
- No utiliza datos de calibracion, lo que puede afectar a la calidad en dominios alejados de la distribucion de entrenamiento.
- Riesgo de alucinacion y sesgos: no evaluado ni documentado para este build; se heredan los del modelo base, pero sin verificacion.
- Longitud de contexto e idiomas soportados no documentados en la informacion disponible.
- Licencia Apache 2.0 con enlace a la licencia especifica de Gemma 4; conviene revisar los terminos de uso de Gemma antes de un despliegue comercial, ya que el repositorio los cita mediante `license_link`.
- Huella de 24,26 GiB que limita el despliegue en GPUs de consumo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/xbill9/gemma-4-26B-A4B-it-qat-q4_0-fp8-text
- Modelo base (Google): https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-unquantized
- Variante W4A16 con rejilla QAT exacta: https://huggingface.co/xbill9/gemma-4-26B-A4B-it-qat-q4_0-w4a16-ct-text
- Variante W4A16 con embeddings de 4 bits: https://huggingface.co/xbill9/gemma-4-26B-A4B-it-qat-q4_0-w4a16-ct-text-emb4
- Variante W8A8 INT8 con embeddings de 4 bits: https://huggingface.co/xbill9/gemma-4-26B-A4B-it-qat-w8a8-int8-emb4
- Variante exact GGUF de Gemma 4 31B: https://huggingface.co/xbill9/gemma-4-31B-it-qat-q4_0-exact-gguf
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Articulo de la comunidad sobre el QAT Gemma 4 26B-A4B en una TPU v6e: https://dev.to/gde/googles-qat-gemma-4-26b-a4b-on-one-tpu-v6e-156x-the-kv-cache-and-19x-the-throughput-of-fp8-36kl
- Articulo de la comunidad sobre embeddings de 4 bits en una L4: https://dev.to/aws-builders/gemma-4-on-amazon-sagemaker-4-bit-embeddings-decode-up-to-139x-faster-on-one-l4-36mf
