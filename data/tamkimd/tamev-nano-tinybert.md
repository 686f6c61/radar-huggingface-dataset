# Tamkimd/tamev-nano-tinybert

## Resumen

TAMEV-Nano-TinyBERT es un modelo de clasificacion de texto (encoder) desarrollado por el usuario Tamkimd, disenado como un "System One Decision Model": un motor de decision de baja latencia pensado para sustituir a los LLM generativos en tareas de seleccion categorica, enrutado y puntuacion. Se construye sobre el backbone TinyBERT_General_4L_312D de Huawei Noah's Ark Lab, un transformer encoder de 4 capas y 312 dimensiones ocultas, con 14.390.184 parametros (unos 14,39 M). El modelo no genera texto: emite probabilidades calibradas sobre un conjunto cerrado de opciones.

El problema que aborda es el coste y la latencia de usar LLM autorregresivos (500-2000 ms por llamada) para decisiones simples de enrutado, ademas de su sensibilidad al orden de las opciones (sesgo de recencia) y su tendencia a fallar la validacion de esquemas JSON. Frente a eso, este modelo ofrece inferencia de 4,54 ms de mediana (174,1 req/s en un hilo), invarianza exacta a la permutacion de opciones (deriva 0,00000000) y probabilidades calibradas con un ECE de 0,0559.

Su relevancia actual radica en el despliegue en el borde (edge AI): con un artefacto INT8 de 13,7 MB y 54,9 MB en FP32, esta pensado para microcontroladores, IoT, Raspberry Pi y CPU estandar, sin coste de API en la nube. La licencia es Apache 2.0 y los pesos se distribuyen en safetensors, con exportaciones a ONNX, CoreML y MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (backbone TinyBERT_General_4L_312D: 4 capas, 312 dimensiones ocultas) |
| Parametros totales | 14.390.184 (~14,39 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 (54,9 MB) e INT8 (13,7 MB); exportaciones a ONNX, CoreML y MLX |
| Idiomas soportados | en, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con exportaciones ONNX, CoreML y MLX) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer basado en TinyBERT, la tecnica de compresion de BERT mediante destilacion desarrollada por Huawei Noah's Ark Lab. Segun la documentacion publica del backbone, TinyBERT es 7,5 veces mas pequeno y 9,4 veces mas rapido en inferencia que BERT-base, aplicando una destilacion de transformer tanto en la fase de preentrenamiento como en la de aprendizaje especifico de tarea (transfiriendo conocimiento a nivel de atencion, estados ocultos y predicciones). La capa propietaria de TAMEV anade una cabeza de puntero bilineal simetrica sobre una codificacion dual desacoplada, de forma que la puntuacion de cada candidato se calcula como (W_q c)^T (W_k o_i) / sqrt(d). Esto garantiza equivarianza exacta a la permutacion y elimina el sesgo de recencia.

El modelo usa una temperatura calibrada de 1.05. La model card declara que se evalua sobre conjuntos de datos de diez dominios distintos (banking77, boolq, ag_news, multi_nli, sst5, yelp_review_full, trec, dbpedia_14, amazon_reviews_multi_en e imdb), aunque no se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF o DPO. La puntuacion de candidatos escala de forma lineal O(K), lo que permite evaluar espacios de acciones de cardinalidad alta (K=77 o superior) sin truncamiento de secuencia ni explosion cuadratica de la atencion.

## Capacidades

- Decision categorica (`choice`): seleccion entre opciones discretas dentro de un espacio de acciones cerrado.
- Confianza booleana probabilistica (`noul`) y escalado ordinal de rubrica (`score`), integrados en una unica llamada unificada segun el protocolo TypeSafe AI (Jev).
- Calibracion de probabilidades: las puntuaciones de confianza representan de forma fiable la certeza real del modelo (ECE 0,0559).
- Invarianza a la permutacion: el resultado no cambia si se reordenan las opciones (deriva numerica 0,00000000, tasa de inversion del 0,00 %).
- Enrutado de LLM y enrutado de agentes (tags `llm-router`, `agent-routing`).
- Clasificacion de texto multilingue (idiomas declarados: en y multilingual).
- Zero-shot mediante el protocolo de decision unificado.
- Despliegue en el borde: microcontroladores, IoT, Raspberry Pi y CPU estandar.
- Exportacion a formatos ONNX, CoreML y MLX para inferencia nativa en distintos entornos.
- Compatibilidad declarada como drop-in con TypeSafe Jev (100 % compatible).

## Casos de uso

- Enrutado de tickets de soporte: dado un texto de incidencia y un conjunto cerrado de colas de servicio (por ejemplo, verificar desbloqueo de viaje, abrir disputa por fraude), el modelo devuelve la cola correcta con una probabilidad calibrada. La invarianza a la permutacion garantiza que reordenar las colas no altera la decision.
- Pre-filtro de agentes LLM: como "System One" que decide si una consulta requiere invocar un LLM caro ("System Two") o puede resolverse con una accion predefinida, reduciendo el coste por token.
- Seleccion de herramienta en pipelines de agentes: con 77 opciones o mas, el escalado O(K) permite puntuar todas las herramientas candidatas en una sola pasada, sin truncar la lista.
- Moderacion y clasificacion de contenido en el borde: el artefacto INT8 de 13,7 MB permite ejecutar la clasificacion en Raspberry Pi o dispositivos IoT sin enviar datos a la nube, con latencia p50 de 4,54 ms.
- Puntuacion ordinal en formularios y encuestas: el modo `score` asigna puntuaciones calibradas sobre rubricas, util para evaluaciones automaticas donde se necesita una confianza interpretable.
- Enrutado sensible a la privacidad en entornos offline: al ser 100 % autoalojado y sin coste de API, es adecuado para aplicaciones que no pueden enviar datos a servicios externos.
- Control de calidad en tiempo real: con un p95 de 16,78 ms y 174,1 req/s por hilo, puede integrarse en servicios con SLA deterministicos que exigen respuestas por debajo de unas decenas de milisegundos.
- Clasificacion de intenciones en asistentes conversacionales: la cabeza de decision resuelve la intencion sobre un espacio de acciones predefinido en lugar de generar una respuesta abierta.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (marcados como no verificados). El conjunto de evaluacion es el "TAMEV Multi-Domain Benchmark Suite" propietario.

| Metrica | Resultado | Verificado |
|---|---|---|
| Top-1 accuracy | 56,25 % | No |
| Top-3 accuracy | 86,50 % | No |
| Brier score | 0,5131 | No |
| Expected Calibration Error (ECE) | 0,0559 | No |
| Deriva de permutacion | 0,00000000 | No |
| Latencia mediana (p50) | 4,54 ms | No |
| Latencia p95 | 16,78 ms | No |
| Throughput (un hilo) | 174,1 req/s | No |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU estandar: el modelo esta disenado para ejecutarse en CPU commodity; con 14,39 M de parametros, cabe holgadamente en memoria RAM convencional.
- Dispositivos de borde: microcontroladores, IoT y Raspberry Pi son los objetivos declarados. El artefacto INT8 ocupa 13,7 MB y el FP32 54,9 MB, por lo que cabe en GPUs de consumo muy basicas e incluso en SoC integrados.
- GPU de consumo: no se especifica compatibilidad con GPUs de gama alta (A100, H100, RTX 4090); el modelo esta pensado para CPU y dispositivos de borde, no para aceleradores de datacenter.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (carga directa desde Hugging Face Hub), y exportaciones a ONNX, CoreML y MLX para runtimes nativos.
- Latencia y throughput: 4,54 ms de mediana y 16,78 ms en p95, con 174,1 req/s en un solo hilo. No se especifica el hardware exacto sobre el que se midieron estos valores.
- No se documentan requisitos de VRAM concretos ni consumo energetico.

## Comparativa con modelos similares

La model card cita como alternativas de la misma categoria a TypeSafe Jev, Jared Palmer's Kev, Laya y SemIf, y afirma ser compatible al 100 % como drop-in con TypeSafe Jev. Sin embargo, no se proporcionan parametros, contexto, benchmarks ni licencias de esos modelos en la informacion disponible.

| Modelo | Parametros | Contexto | Licencia | Datos comparativos |
|---|---|---|---|---|
| TAMEV-Nano-TinyBERT | 14,39 M | no disponible | Apache 2.0 | Top-1 56,25 %, Top-3 86,50 %, ECE 0,0559, 4,54 ms p50 |
| TypeSafe Jev | no disponible | no disponible | no disponible | no disponible |
| Jared Palmer's Kev | no disponible | no disponible | no disponible | no disponible |
| Laya | no disponible | no disponible | no disponible | no disponible |
| SemIf | no disponible | no disponible | no disponible | no disponible |

Comparativa no disponible por ausencia de datos publicos de los modelos alternativos.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos. Al entrenarse sobre datasets de clasificacion en ingles (banking77, boolq, ag_news, multi_nli, sst5, yelp_review_full, trec, dbpedia_14, amazon_reviews_multi_en, imdb), puede heredar los sesgos de esos corpus.
- Riesgo de alucinacion: el modelo no genera lenguaje, por lo que no alucina texto; sin embargo, si se usa fuera de su espacio de acciones previsto, puede asignar probabilidades mal calibradas a opciones no vistas.
- Limitaciones de contexto o idioma: aunque declara soporte multilingue, los datasets de entrenamiento listados son en su mayoria en ingles; no se especifica la longitud de contexto soportada.
- Precision: la Top-1 accuracy declarada es del 56,25 %, relativamente baja; el modelo esta pensado como filtro de candidatos (Top-3 del 86,50 %) mas que como clasificador de alta precision en una sola pasada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo incorpora codigo personalizado (`custom_code`) y requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; conviene auditar ese codigo antes de usarlo en produccion.
- Benchmarks no verificados: todos los resultados de la model card estan marcados como `verified: false` y proceden de un benchmark propietario del autor ("TAMEV Multi-Domain Benchmark Suite"), no de suites estandar reproducibles.
- Adopcion limitada: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion independiente de la comunidad.
- Fechas de creacion y actualizacion: 2026-09-25 en ambos casos.

## Enlaces

- [Modelo en Hugging Face: Tamkimd/tamev-nano-tinybert](https://huggingface.co/Tamkimd/tamev-nano-tinybert)
- [Backbone: huawei-noah/TinyBERT_General_4L_312D](https://huggingface.co/huawei-noah/TinyBERT_General_4L_312D)
- [Repositorio GitHub de TAMEV](https://github.com/tamkimd/tamev)
- [Paper de TinyBERT: Distilling BERT for Natural Language Understanding (arXiv)](https://arxiv.org/abs/1909.10351)
- [Repositorio TinyBERT de yinmingjun](https://github.com/yinmingjun/TinyBERT)
- [Repositorio TinyBERT de jaewoongy](https://github.com/jaewoongy/TinyBert)
- [Documentacion TinyBERT en DeepWiki (huawei-noah/Pretrained-Language-Model)](https://deepwiki.com/huawei-noah/Pretrained-Language-Model/2.3-tinybert)
