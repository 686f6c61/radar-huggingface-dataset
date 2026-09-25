# Tamkimd/tamev-medium-qwen3.5-0.8b

## Resumen

TAMEV-Medium-Qwen3.5-0.8B es un modelo de decision de tipo "System One" publicado por el usuario Tamkimd sobre HuggingFace. No es un modelo generativo al uso: se presenta como un motor de inteligencia de decision que, en lugar de producir texto libre, elige entre un conjunto de opciones categoricas y devuelve probabilidades calibradas. Se apoya en el backbone Qwen3.5-0.8B-Base y se comercializa como alternativa "typesafe" a otros enrutadores de decision como TypeSafe Jev, Kev, Laya o SemIf.

La propuesta central es resolver la seleccion de acciones en agentes y sistemas de enrutamiento (por ejemplo, decidir a que cola va un ticket o que herramienta invoca un agente) con latencia baja y sin los problemas de sesgo por recencia de los modelos autorregresivos. Para ello emplea una cabecera de puntuacion bilineal simetrica que se declara exactamente invariante a la permutacion de opciones, con deriva numerica de 0,00000000 y una tasa de cambio de decision del 0,00% al reordenar las alternativas.

El modelo se distribuye bajo licencia Apache 2.0, con etiquetas de exportacion a ONNX, CoreML y MLX, orientado a despliegue en edge y en Apple Silicon. Es un lanzamiento reciente (creado en septiembre de 2026) con cero descargas y cero likes en el momento de la consulta, y con una discrepancia notable entre el recuento real de parametros del repositorio y el declarado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de decision derivado del backbone Qwen/Qwen3.5-0.8B-Base; tipo declarado `incontext_causal` con cabecera bilineal simetrica y puntuacion de candidatos independiente de la posicion |
| Parametros totales | 524.800 parametros segun los pesos safetensors del repositorio; la model card declara 800,0M de parametros activos (discrepancia no aclarada) |
| Parametros activos | No es una arquitectura MoE; la model card indica 800,0M activos sobre un backbone de 0,8B |
| Longitud de contexto | No disponible para el modelo TAMEV; el backbone Qwen3.5-0.8B se cita con 262K en la receta de vLLM y en torno a 32K en otras fuentes |
| Tipos de cuantizacion | Artefacto INT8 de 762,9 MB y pesos FP32 de 3051,8 MB; exportaciones ONNX, CoreML y MLX |
| Idiomas soportados | Ingles y multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers), con exportaciones ONNX, CoreML y MLX |

## Arquitectura y entrenamiento

La model card describe el modelo como un `incontext_causal` construido sobre el backbone Qwen3.5-0.8B-Base. La innovacion tecnica declarada es una cabecera de puntero bilineal simetrica con codificacion dual desacoplada: la puntuacion de cada opcion se calcula como `Score(c, o_i) = (W_q c)^T (W_k o_i) / sqrt(d)`, lo que garantiza equivariancia exacta ante permutaciones del orden de las opciones. La puntuacion de candidatos es independiente de la posicion, lo que se presenta como solucion al sesgo por recencia que afecta a modelos autorregresivos como Kev, Jev o SemIf. El modelo tambien declara un presupuesto de tokens dedicado con escalado lineal O(K), lo que permite evaluar espacios de accion de cardinalidad alta (K = 77 o mas) sin truncado de secuencia ni explosion de atencion cuadratica.

No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases de RLHF o DPO. Las etiquetas de datasets apuntan a un entrenamiento o evaluacion sobre conjuntos de clasificacion y comprension: banking77, boolq, ag_news, multi_nli, sst5, yelp_review_full, trec, dbpedia_14, amazon_reviews_multi_en e imdb. Se declara una temperatura calibrada de 2,351, coherente con el enfoque en calibracion de probabilidades (ECE y Brier score) que domina el diseno del modelo.

## Capacidades

- Seleccion categorica entre opciones (`choice`): elige una alternativa entre un conjunto cerrado de candidatos, con una sola llamada unificada.
- Confianza booleana probabilistica (`noul`): devuelve una probabilidad calibrada para decisiones de si/no.
- Escalado ordinal con rubrica (`score`): puntua opciones en una escala ordinal definida por el usuario.
- Invariacion exacta a la permutacion de opciones: sin sesgo de orden ni de recencia (deriva declarada de 0,00000000 y 0,00% de cambio de decision).
- Probabilidades calibradas: ECE de 0,0830 y Brier score de 0,2159, pensados para umbrales de riesgo fiables en tool calling.
- Enrutamiento de LLM y de agentes: concebido como router de decisiones para pipelines de agentes y colas de servicios.
- Escalado lineal con la cardinalidad del espacio de acciones (O(K)): apto para espacios con mas de 77 candidatos.
- Soporte multilingue declarado (ingles y multilingue).
- Exportacion a ONNX, CoreML y MLX para despliegue en edge y Apple Silicon.

No se documentan capacidades de generacion de texto libre, razonamiento general, generacion de codigo, matematicas, vision ni tool calling en sentido clasico. Su salida es una decision estructurada, no texto.

## Casos de uso

- Enrutamiento de tickets de atencion al cliente: dado el texto de una consulta y una lista de colas de servicio (por ejemplo `verify_travel_unblock`, `file_fraud_claim`), el modelo selecciona la cola adecuada con una probabilidad calibrada, lo que permite automatizar el triaje con umbrales de confianza auditables.
- Seleccion de herramientas en agentes: como router LLM, decide que herramienta o accion invocar en un flujo de agente, aprovechando la invariancia a la permutacion para que el orden en que se listen las herramientas no altere la decision.
- Moderacion de contenidos con escala ordinal: usando la funcion `score`, aplica una rubrica de severidad sobre texto de usuario y devuelve un nivel con probabilidad asociada.
- Clasificacion de intenciones en asistentes conversacionales: mapea la intervencion del usuario a una intencion cerrada con confianza calibrada para decidir si se responde automaticamente o se escala a un humano.
- Triage de soporte tecnico interno: clasifica incidencias en categorias operativas (red, acceso, hardware) para asignarlas al equipo correcto.
- Analisis de sentimiento con filtrado de candidatos: clasificacion multietiqueta sobre resenas (dominios tipo yelp_review_full o imdb) usando la exactitud Top-3 del 98,33% para preseleccionar candidatos antes de un paso mas costoso.
- Enrutamiento de consultas en un sistema RAG: decide que indice o base de conocimiento debe consultar el pipeline ante una pregunta entrante.
- Toma de decisiones de bajo riesgo en edge: despliegue offline en dispositivos Apple Silicon o Qualcomm para clasificacion local sin coste de API ni envio de datos a la nube.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Valor | Nota del autor |
|---|---|---|
| Top-1 accuracy | 83,33% | Estado del arte declarado para routers System One de clase Medium |
| Top-3 accuracy | 98,33% | Filtrado fiable de candidatos |
| Expected Calibration Error (ECE) | 0,0830 | Umbrales de riesgo fiables para tool calling |
| Brier score | 0,2159 | Puntuacion de calibracion estrictamente propia |
| Deriva por permutacion | 0,00000000 | 0,00% de tasa de cambio de decision |
| Latencia mediana (p50) | 211,44 ms | Se afirma 100x-200x mas rapido que LLM en la nube |
| Latencia percentil 95 (p95) | 650,68 ms | Garantia de SLA determinista |
| Throughput (un solo hilo) | 3,9 req/s | Alta densidad de concurrencia |

Todos los resultados estan marcados como `verified: false` y se miden sobre la "TAMEV Multi-Domain Benchmark Suite", un conjunto de evaluacion propio del autor, no sobre benchmarks estandar como MMLU, HumanEval o GSM8K. No se dispone de resultados en benchmarks academicos independientes.

## Requisitos de hardware

- Tamano de pesos: artefacto INT8 de 762,9 MB y pesos FP32 de 3051,8 MB segun la model card; el repositorio en safetensors ocupa 0,0 GB y contiene 524.800 parametros, cifra incoherente con los 800,0M declarados.
- VRAM estimada para inferencia: del orden de 1 GB en INT8 si se confirman los 762,9 MB, y en torno a 3 GB en FP32; no disponible una cifra oficial fiable dada la discrepancia de parametros.
- GPU recomendadas: se citan Apple Silicon (MPS/MLX), CUDA y datacenter como objetivos, sin especificar modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: por tamano declarado (INT8 sub-1 GB) deberia caber en cualquier GPU consumer moderna e incluso en CPU, pero no hay una lista oficial de hardware validado.
- Opciones de despliegue: transformers con `trust_remote_code=True` (metodo de referencia en la model card), y exportaciones a ONNX, CoreML y MLX. No se documenta soporte explicito para vLLM, llama.cpp, Ollama o TGI para este modelo derivado.
- Latencia y throughput: 211,44 ms de mediana (p50), 650,68 ms en el percentil 95 y 3,9 req/s en un solo hilo, medidos en hardware no especificado ("commodity hardware").

## Comparativa con modelos similares

La model card cita como alternativas directas TypeSafe Jev, Kev (de Jared Palmer), Laya y SemIf, pero no aporta especificaciones detalladas de ninguno de ellos. La unica comparacion cuantitativa declarada es que TAMEV-Medium es "SOTA para la clase Medium de routers System One", sin cifras de los competidores.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TAMEV-Medium-Qwen3.5-0.8B | 524.800 (safetensors) / 800,0M declarados | no disponible | Top-1 83,33%; Top-3 98,33%; ECE 0,0830 | Apache 2.0 | HuggingFace |
| TypeSafe Jev | no disponible | no disponible | no disponible | no disponible | no disponible |
| Kev (Jared Palmer) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Laya / SemIf | no disponible | no disponible | no disponible | no disponible | no disponible |

Como referencia de backbone, Qwen3.5-0.8B es el modelo base sobre el que se construye; la receta de vLLM lo describe como el miembro mas pequeno de la familia Qwen3.5, con arquitectura de redes delta con compuertas hibridas y 262K de contexto, apto como modelo borrador para decodificacion especulativa. No es un competidor directo, sino el sustrato del modelo de decision.

## Limitaciones y advertencias

- Discrepancia de parametros: el recuento real de safetensors (524.800 parametros) no coincide con los 800,0M declarados en la model card. Hay que verificar que artefacto se esta cargando realmente antes de usarlo en produccion.
- Resultados no verificados: todas las metricas del `model-index` estan marcadas como `verified: false` y se miden sobre una suite propia del autor, sin validacion independiente ni benchmarks academicos estandar.
- Adopcion nula: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Tipo de modelo restringido: no es un modelo generativo; su salida se limita a seleccion categorica, confianza booleana y puntuacion ordinal. No sirve para tareas de generacion, resumen, traduccion libre ni razonamiento abierto.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si puede producir decisiones erroneas o mal calibradas fuera de la distribucion de los datasets de entrenamiento listados.
- Cobertura de idiomas: se declara multilingue ademas de ingles, pero no se detallan los idiomas concretos ni su rendimiento por idioma.
- Contexto: no se especifica la longitud de contexto del modelo TAMEV; las cifras del backbone son contradictorias entre fuentes (32K frente a 262K).
- Licencia: Apache 2.0 permite uso comercial, pero al apoyarse en un backbone Qwen3.5 conviene revisar tambien las condiciones de dicho backbone.
- Caveat de despliegue: requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del autor; hay que auditar ese codigo antes de desplegarlo en entornos sensibles.
- Uso en produccion: sin hardware de referencia especificado ni pruebas de latencia reproducibles, los SLA declarados (p50 211,44 ms, p95 650,68 ms) no deben asumirse como garantia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Tamkimd/tamev-medium-qwen3.5-0.8b
- Repositorio GitHub citado en la model card: https://github.com/tamkimd/tamev
- Backbone Qwen3.5-0.8B-Base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Receta de vLLM para Qwen3.5-0.8B: https://recipes.vllm.ai/Qwen/Qwen3.5-0.8B
- Qwen3.5:0.8B en Ollama: https://ollama.com/library/qwen3.5:0.8b
- Guia de Qwen3.5:0.8B en Medium: https://medium.com/@muhibuddin12/running-ai-on-your-laptop-a-step-by-step-guide-to-qwen3-5-0-8b-88d0bb56e368
- Qualcomm AI Hub Models (Qwen3.5-0.8B): https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/qwen3_5_0_8b/README.md
- Qwen3.5 0.8B en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-5-0-8b/
