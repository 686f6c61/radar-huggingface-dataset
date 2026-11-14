# SZLHOLDINGS/receiptagent-v2-trained

## Resumen

receiptagent-v2-trained es un adaptador LoRA (QLoRA) publicado por SZLHOLDINGS sobre el modelo base Qwen/Qwen3.5-0.8B, un transformer denso de 0,8 mil millones de parametros. No se trata de un modelo independiente, sino de un ajuste fino ligero que debe cargarse junto con los pesos del modelo base para poder utilizarse. El repositorio tiene un tamano practicamente nulo (0,0 GB) porque solo contiene los pesos del adaptador en formato safetensors, no los pesos completos del modelo.

El adaptador se entrena con un curriculo propio de la organizacion (SZLHOLDINGS/szl-1-doctrine-sft) y forma parte de lo que el autor denomina "programa de honestidad" (honesty program): una iniciativa para medir como distintos tipos de entrenamiento afectan al "suelo de confabulacion" (confabulation floor) del modelo, es decir, su tendencia a inventar respuestas ante preguntas sin respuesta valida. La evaluacion publicada es una bateria de solo 6 sondas (3 respondibles y 3 no respondibles), con una puntuacion de 3/6.

Es relevante ahora unicamente como pieza de un experimento metodologico reproducible: el autor publica la cadena de "receipts" (registros de medicion) en un dataset publico. No es un modelo orientado a produccion ni a tareas generales, y su utilidad practica fuera del contexto experimental de SZLHOLDINGS es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (QLoRA) sobre transformer denso Qwen/Qwen3.5-0.8B |
| Parametros totales | 0,8 mil millones (modelo base); el adaptador LoRA anade un numero no especificado de parametros entrenables (r=16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-0.8B; no especificada en la informacion) |
| Tipos de cuantizacion | QLoRA (cuantizacion del base durante entrenamiento); no se detallan formatos de inferencia |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante QLoRA con rango r=16, alpha=32, dropout=0,05 y modulos objetivo q_proj, k_proj, v_proj y o_proj, es decir, las proyecciones de atencion del transformer base. El entrenamiento se realizo en una NVIDIA RTX A6000 (48 GB), con 200 pasos, batch size de 2, acumulacion de gradiente de 4, tasa de aprendizaje 2e-4 y precision bf16. El curriculo de datos es SZLHOLDINGS/szl-1-doctrine-sft, un dataset propio de la organizacion no descrito en detalle en la informacion disponible.

No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. El propio autor califica los 200 pasos como "un piloto, no una ejecucion de entrenamiento completa". La innovacion declarada no es arquitectonica sino metodologica: la medicion sistematica del "suelo de confabulacion" mediante una bateria fija de sondas y la publicacion de los resultados en una cadena de registros verificables.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen3.5-0.8B.
- Respuesta a preguntas potencialmente respondibles y gestion de preguntas sin respuesta valida (objetivo central del entrenamiento segun el autor).
- Ajuste especifico sobre el curriculo doctrinal de SZLHOLDINGS.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues especificas.
- No se documentan capacidades de vision, audio ni modo "thinking".

## Casos de uso

- Investigacion sobre calibracion y confabulacion: el adaptador sirve como punto de comparacion en experimentos que miden la tasa de respuestas inventadas ante preguntas sin respuesta, usando la bateria de 6 sondas del autor como referencia reproducible.
- Reproduccion de experimentos de QLoRA: al estar documentados hiperparametros, hardware y curriculo, permite replicar el ajuste sobre Qwen3.5-0.8B y contrastar resultados.
- Auditoria de metodologias de evaluacion: util para estudiar las limitaciones de evaluar con baterias pequenas y fijas (6 sondas) y discutir su validez estadistica.
- Prototipado de bajo coste en entornos con GPU consumer: al ser un adaptador sobre un modelo de 0,8B, puede cargarse en GPUs modestas para pruebas de concepto de generacion de texto.
- Docencia sobre PEFT y LoRA: ejemplo real y documentado de adaptador PEFT con configuracion completa (rango, alpha, modulos objetivo, dropout) para explicar el flujo de entrenamiento.
- Integracion en pipelines de evaluacion automatizada: el adaptador puede incorporarse como un "sujeto" mas en arneses de test que comparen modelos por su comportamiento ante preguntas sin respuesta.

## Benchmarks y rendimiento

| Evaluacion | Resultado | Detalle |
|---|---|---|
| Bateria de honesty (6 sondas) | 3/6 | 3 sondas respondibles + 3 no respondibles, decodificacion determinista, max 200 tokens |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato de rendimiento es la puntuacion de 3/6 en la bateria propia del autor, que el propio autor describe como "un punto de datos" y no una evaluacion exhaustiva.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; al tratarse de un modelo base de 0,8B en bf16, la huella aproximada seria de unos 1,6 GB para los pesos, mas overhead de activaciones y KV cache (estimacion, no dato del autor).
- GPU recomendadas: el entrenamiento se realizo en una NVIDIA RTX A6000 (48 GB), aunque para inferencia de un modelo de 0,8B no es necesario ese hardware.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU con 4 GB o mas de VRAM (estimacion no confirmada por el autor).
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base Qwen/Qwen3.5-0.8B con librerias compatibles con PEFT (transformers + peft). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Evaluacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| receiptagent-v2-trained (adaptador) | 0,8B (base) | no disponible | 3/6 en bateria propia de 6 sondas | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | no disponible | no disponible | no disponible en la informacion | Hugging Face |
| Otros adaptadores LoRA sobre modelos <1B | variable | variable | no disponible | variable | Hugging Face |

No se dispone de datos de benchmarks comparables con alternativas de la misma categoria en la informacion proporcionada. La comparativa con el modelo base resulta especialmente relevante: el autor no publica la puntuacion del base sin ajustar en la misma bateria, por lo que no puede determinarse si el ajuste mejora, empeora o mantiene el "suelo de confabulacion".

## Limitaciones y advertencias

- El modelo es un adaptador LoRA, no un modelo independiente: sin cargar Qwen/Qwen3.5-0.8B no es utilizable.
- La evaluacion se basa en 6 sondas fijas, insuficiente para extraer conclusiones estadisticas sobre capacidades generales.
- Solo 200 pasos de entrenamiento: el autor lo califica explicitamente de piloto, no de entrenamiento completo.
- No se documentan sesgos conocidos, pero al derivar de un modelo base de 0,8B es esperable una capacidad limitada y mayor propension a errores en tareas complejas.
- Riesgo de alucinacion: precisamente el fenomeno que el autor intenta medir; la puntuacion de 3/6 sugiere un comportamiento correcto en la mitad de las sondas, lo que implica fallos en la otra mitad.
- Idiomas soportados no documentados; no se garantiza un rendimiento adecuado en castellano.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero deben verificarse las condiciones del modelo base Qwen3.5-0.8B, no detalladas en la informacion.
- Cero descargas y cero "likes": no hay evidencia de uso o validacion por parte de la comunidad.
- No apto para produccion: sin benchmarks estandar, sin documentacion de contexto, sin soporte de despliegue verificado y con una evaluacion minima.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/receiptagent-v2-trained
- Cadena de receipts (dataset): https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs
- Explorador de la cadena: https://szlholdings-szl-receipts-chain.hf.space
- SDK szl en PyPI: https://pypi.org/project/szl/
- Sitio de la organizacion: https://a-11-oy.com
