# UGREENDEV/RK182X-EMBEDDING-Qwen3-Embedding-4B

## Resumen

RK182X-EMBEDDING-Qwen3-Embedding-4B es una conversion al formato RKNN del modelo de embeddings Qwen3-Embedding-4B de Alibaba Qwen, publicada por el usuario UGREENDEV. El objetivo no es ofrecer un modelo de generacion de texto, sino un encoder de frases y documentos que produce vectores densos para tareas de recuperacion, similitud semantica, clustering y clasificacion. La conversion esta pensada especificamente para ejecutarse sobre las NPU Rockchip RK1820 y RK1828, lo que permite desplegar busqueda semantica en dispositivos de borde sin GPU dedicada.

El repositorio contiene una unica configuracion cuantizada en w4a16 con 8 nucleos NPU y una longitud maxima de 2048 tokens, empaquetada junto con los pesos en formato RKNN y los ficheros de configuracion necesarios para el runtime v1.1.0. El modelo base Qwen3-Embedding-4B es un transformer de aproximadamente 4.000 millones de parametros derivado de la familia Qwen3, orientado a representaciones de alta calidad multilingues.

La relevancia de esta ficha es doble: por un lado documenta una de las pocas conversiones publicas de un embedding de 4B a NPU Rockchip; por otro, advierte de las restricciones practicas (runtime concreto, version de driver, chips soportados) que condicionan su uso en produccion. No debe confundirse con el modelo original de Qwen, cuyas capacidades y benchmarks son los del modelo base, no los del artefacto RKNN aqui descrito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder derivado de Qwen3 (modelo base Qwen/Qwen3-Embedding-4B) |
| Parametros totales | Aproximadamente 4.000 millones (segun el modelo base; no confirmado en la model card del artefacto) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (configuracion w4a16-8-2048) |
| Tipos de cuantizacion | w4a16 (pesos 4 bits, activaciones 16 bits) |
| Idiomas soportados | No disponible en la model card del artefacto; depende del modelo base Qwen3-Embedding-4B |
| Licencia | Apache 2.0 (modelo base); se aplican tambien los terminos de licencia de RKNN Toolkit y RKNN Runtime |
| Formato de pesos | RKNN (runtime v1.1.0), con ficheros config.json y SHA256SUMS; el repositorio tambien incluye tag gguf |
| Chips soportados | RK1820, RK1828 |
| Nucleos NPU | 8 |
| Version de runtime | RKNN Runtime v1.1.0 |
| Tipo de modelo | EMBEDDING (feature-extraction) |
| Tamano del repositorio | 2,9 GB |

## Arquitectura y entrenamiento

El artefacto es una conversion, no un entrenamiento nuevo. El modelo base Qwen3-Embedding-4B pertenece a la familia Qwen3 y se usa como encoder para generar embeddings de frases, parrafos y documentos; su arquitectura subyacente es un transformer con atencion completa, adaptado para producir representaciones normalizadas. La model card del artefacto no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO; esos datos deben consultarse en la model card del modelo base Qwen/Qwen3-Embedding-4B, no en este repositorio.

La innovacion tecnica principal de esta publicacion es la compilacion a RKNN con cuantizacion w4a16 para 8 nucleos NPU, junto con la fijacion de una longitud maxima de 2048 tokens. El repositorio incluye sumas de verificacion SHA-256 para garantizar la integridad de los ficheros antes del despliegue, y exige emparejar runtime, driver y ficheros de la misma configuracion. No se documentan tecnicas como decodificacion especulativa, atencion lineal o modos de pensamiento, que no aplican a un modelo de embeddings.

## Capacidades

- Generacion de embeddings densos para frases, parrafos y documentos, orientada a feature-extraction.
- Busqueda semantica y recuperacion de informacion mediante similitud vectorial.
- Agrupamiento (clustering) y clasificacion de textos a partir de representaciones vectoriales.
- Deduplicacion y deteccion de near-duplicates en corpus documentales.
- Soporte multilingue heredado del modelo base Qwen3-Embedding-4B (no detallado en la model card del artefacto).
- Ejecucion sobre NPU Rockchip RK1820 y RK1828 mediante RKNN Runtime v1.1.0.
- No soporta generacion de texto, tool calling, function calling, agentes ni razonamiento multi-step: es exclusivamente un encoder.

## Casos de uso

- Busqueda semantica en dispositivos de borde: indexar y consultar documentacion local en un dispositivo con NPU RK1820/RK1828, usando los embeddings de 2048 tokens para fragmentar textos en chunks y recuperar los pasajes mas similares sin conexion a la nube.
- RAG embebido en appliances: integrar el modelo como recuperador en un pipeline de generacion aumentada por recuperacion que corre integramente en hardware Rockchip, reduciendo la dependencia de infraestructura externa.
- Clasificacion y enrutado de tickets: calcular embeddings de incidencias de soporte y asignarlas a colas o categorias mediante un clasificador ligero entrenado sobre esos vectores.
- Deduplicacion de corpus: comparar embeddings de registros de bases de datos para detectar duplicados y near-duplicates antes de ingestar en un data lake.
- Moderacion y filtrado de contenido: usar la similitud vectorial contra un conjunto de referencia de textos prohibidos para marcar contenido candidato a revision humana.
- Agrupamiento de feedback de usuarios: agrupar resenas o comentarios por similitud semantica para identificar temas recurrentes en analitica de producto.
- Recomendacion basada en contenido: representar items y preferencias de usuario como vectores y calcular similitud para generar recomendaciones en el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del artefacto RKNN no incluye metricas de MTEB, MMLU, HumanEval ni de latencia/throughput sobre RK1820 o RK1828. Cualquier cifra de calidad debe referirse al modelo base Qwen/Qwen3-Embedding-4B y no a esta conversion cuantizada.

## Requisitos de hardware

- Hardware objetivo: NPU Rockchip RK1820 y RK1828 exclusivamente; no esta pensado para GPU convencional.
- Runtime: RKNN Runtime v1.1.0, con driver coincidente. Verificar la version en el dispositivo con `rknn-smi -v` antes de ejecutar.
- Memoria: el repositorio ocupa 2,9 GB; el consumo en NPU depende de la configuracion w4a16 y de los buffers de activacion, no cuantificado en la model card.
- Cabe en GPU de consumo: no aplica, al ser un artefacto RKNN para NPU Rockchip.
- Opciones de despliegue: RKNN Runtime v1.1.0 sobre RK1820/RK1828; descarga via ModelScope o Hugging Face (`hf download`).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RK182X-EMBEDDING-Qwen3-Embedding-4B (este) | ~4B (base) | 2048 tokens | RKNN, NPU RK1820/RK1828 | Apache 2.0 + terminos RKNN | Hugging Face / ModelScope |
| Qwen/Qwen3-Embedding-4B (modelo base) | ~4B | No disponible en esta ficha | Safetensors, GPU/CPU | Apache 2.0 | Hugging Face |
| Otros embeddings de ~4B | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparacion directa con alternativas de la misma categoria no esta documentada en la informacion disponible; la unica referencia fiable es el modelo base Qwen/Qwen3-Embedding-4B, del que este artefacto es una conversion cuantizada.

## Limitaciones y advertencias

- Exclusivo para NPU Rockchip RK1820 y RK1828: no funciona en GPU NVIDIA, CPU generica ni otros aceleradores.
- Requiere RKNN Runtime v1.1.0 y driver coincidente; versiones distintas pueden fallar o producir resultados incorrectos.
- Longitud maxima de 2048 tokens: textos mas largos deben fragmentarse, con riesgo de perder contexto entre chunks.
- La cuantizacion w4a16 puede degradar la calidad de los embeddings respecto al modelo base en fp16/bf16; no se han publicado evaluaciones de esa perdida.
- Es un encoder de embeddings: no genera texto, no soporta tool calling ni agentes.
- Idiomas soportados no documentados en la model card del artefacto; deben verificarse contra el modelo base antes de desplegar en produccion.
- Licencia Apache 2.0 del modelo base, pero se aplican adicionalmente los terminos de RKNN Toolkit y RKNN Runtime; revisar antes de uso comercial.
- Verificar integridad con `sha256sum -c SHA256SUMS` antes del despliegue; usar todos los ficheros de la misma configuracion.
- No se han publicado benchmarks ni metricas de latencia/throughput para este artefacto.
- Riesgo de sesgos y alucinacion semantica heredado del modelo base, no evaluado en esta conversion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/UGREENDEV/RK182X-EMBEDDING-Qwen3-Embedding-4B
- Modelo base Qwen3-Embedding-4B: https://huggingface.co/Qwen/Qwen3-Embedding-4B
- Configuracion w4a16-8-2048 (README): https://huggingface.co/UGREENDEV/RK182X-EMBEDDING-Qwen3-Embedding-4B/tree/main/Qwen3-Embedding-4B-w4a16-8-2048
- ModelScope (descarga): https://modelscope.cn/models/UGREENDEV/RK182X-EMBEDDING-Qwen3-Embedding-4B
- Documentacion de RKNN Toolkit y RKNN Runtime: no disponible en la informacion proporcionada.
