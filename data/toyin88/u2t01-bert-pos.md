# toyin88/u2t01-bert-pos

## Resumen

u2t01-bert-pos es un modelo de etiquetado de partes de la oracion (POS tagging) en ingles, desarrollado por el usuario toyin88 como parte del proyecto U2T01 "Adapting BERT for NLP tasks". Consiste en un encoder bert-base-uncased al que se le ha anadido una cabeza de clasificacion por token, ajustado para predecir las 17 etiquetas Universal POS (UPOS) del esquema Universal Dependencies. El modelo resuelve la tarea clasica de token classification sobre texto en ingles y sirve como referencia reproducible de una estrategia de adaptacion concreta: ajuste completo (full fine-tuning) del encoder.

Tecnicamente es un transformer encoder denso de 12 capas con 108.904.721 parametros totales, de los cuales 85.067.537 (el 78,11 %) son entrenables; la matriz de embeddings se mantiene congelada. La ventana de contexto usada durante el ajuste es de 128 tokens, coherente con las secuencias de UD English EWT, aunque el encoder hereda la capacidad posicional de 512 tokens de bert-base-uncased.

Su relevancia es principalmente metodologica y de investigacion: el repositorio documenta la comparacion entre tres estrategias de adaptacion (feature extraction, partial fine-tuning y full fine-tuning) sobre el mismo cuerpo, con semilla fija, dependencias ancladas y configuracion YAML por experimento. No esta pensado para decisiones de produccion sobre personas y solo cubre ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (BERT base), 12 capas, con cabeza de clasificacion por token |
| Parametros totales | 108.904.721 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Parametros entrenables | 85.067.537 (78,11 %) |
| Longitud de contexto | 128 tokens en el ajuste (max sequence length); el encoder soporta hasta 512 posiciones |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors en fp32; no hay GGUF, GPTQ, AWQ ni int8) |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tarea (pipeline) | token-classification (POS tagging, 17 etiquetas UPOS) |
| Modelo base | google-bert/bert-base-uncased |
| Tamano del repositorio | 0,4 GB |
| Dataset de entrenamiento | universal-dependencies/universal_dependencies (UD English EWT) |
| Metricas declaradas | accuracy, macro F1 |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder bidireccional identico a bert-base-uncased (12 capas, atencion multi-cabeza, embeddings de palabra, posicion y segmento), sobre el que se anade una cabeza lineal de clasificacion por token que proyecta la representacion de cada token a las 17 etiquetas UPOS. Se trata de un ajuste completo: se entrenaron las 12 capas del encoder y la cabeza, mientras que la matriz de embeddings (aproximadamente 23 M de los 110 M de parametros) se mantuvo congelada para ahorrar memoria del optimizador, sin efecto medible segun el autor a estos tamanos de dataset.

El entrenamiento uso 5.000 ejemplos de Universal Dependencies English EWT (ingles web: blogs, resenas, correos), con 3 epocas, batch de 32, longitud maxima de secuencia de 128 y semilla fija 42. Se aplicaron dos grupos de parametros en el optimizador con tasas de aprendizaje separadas: 0,001 para la cabeza recien inicializada y 3e-05 para las capas preentrenadas del encoder. El tiempo de entrenamiento declarado es de 1,2 minutos en una Tesla T4. No se documenta uso de RLHF, DPO ni decodificacion especulativa; es un ajuste supervisado estandar con funcion de perdida de entropia cruzada por token (el loss reportado, 11,66 en test, es elevado porque se agrega sobre todas las posiciones).

## Capacidades

- Etiquetado gramatical por token: asigna una de las 17 etiquetas Universal POS (UPOS) a cada token de una secuencia en ingles.
- Clasificacion de secuencias cortas: optimizado para entradas de hasta 128 tokens; admite hasta 512 posiciones por herencia del encoder base.
- Procesamiento de ingles web: entrenado sobre UD English EWT, por lo que rinde mejor en registros de blogs, resenas y correo electronico que en otros dominios.
- Inferencia por lotes: al ser un encoder de 110 M de parametros y secuencias cortas, permite procesar grandes volumenes de texto en GPU o CPU.
- Reproducibilidad experimental: semilla fija, dependencias ancladas y un fichero YAML por experimento determinan la ejecucion.
- No soporta tool calling ni function calling.
- No dispone de modo agente, razonamiento multi-paso, thinking mode, vision ni audio.
- No es multilingue: solo ingles.
- No genera texto: es un modelo exclusivamente discriminativo de etiquetado.

## Casos de uso

- Preprocesado en pipelines de PLN: servir como primer paso de un pipeline clasico (POS tagging antes de lematizacion, analisis de dependencias o reconocimiento de entidades) para anadir informacion gramatical por token en textos ingleses.
- Anotacion asistida de corpus academicos: pre-etiquetar corpus en ingles web (blogs, resenas, correos) con UPOS y revisar manualmente, reduciendo el coste de anotacion frente a etiquetado manual completo.
- Benchmarking de estrategias de adaptacion: usar este modelo como referencia de full fine-tuning frente a las variantes feature y partial del mismo proyecto, todas entrenadas con los mismos 5.000 ejemplos y la misma semilla.
- Experimentos docentes de ajuste fino: replicar el flujo completo (config YAML, semilla 42, dependencias ancladas) cuyo entrenamiento tarda 1,2 minutos en una T4, lo que lo hace apto para practicas de curso.
- Analisis estilometrico y extraccion de patrones gramaticales: identificar distribuciones de verbos, sustantivos o adjetivos para estudios de estilo o para construir reglas heuristicas de dominio.
- Filtrado y normalizacion en recuperacion de informacion: etiquetar consultas o documentos en ingles para filtrar por categoria gramatical antes de indexar o buscar.
- Generacion de caracteristicas para modelos posteriores: producir secuencias de etiquetas POS como entrada adicional de clasificadores de texto o sistemas de reglas en ingles.

## Benchmarks y rendimiento

Metricas de evaluacion declaradas por el autor:

| Metrica | Test | Validacion |
|---|---:|---:|
| loss | 11,66 | 12,69 |
| accuracy | 96,79 | 96,76 |
| macro_f1 | 90,36 | 90,61 |

Comparacion entre estrategias de adaptacion del mismo proyecto (accuracy en test, mismos datos):

| Ejecucion | Metodo | Parametros entrenables | Accuracy (test) |
|---|---|---:|---:|
| pos_feature_fast | feature extraction | 0 | 93,37 |
| pos_feature_mini | feature extraction | 0 | 91,90 |
| pos_full_fast (este modelo) | full fine-tuning | 85.067.537 | 96,79 |
| pos_full_mini | full fine-tuning | 85.067.537 | 94,24 |
| pos_partial_fast | partial fine-tuning | 14.188.817 | 93,79 |
| pos_partial_mini | partial fine-tuning | 14.188.817 | 83,74 |

No se han publicado resultados de benchmarks estandar (GLUE, MMLU, HumanEval u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-1 GB en fp32 para los pesos (108,9 M de parametros) mas activaciones; en la practica cabe en cualquier GPU con 2 GB o mas.
- GPU recomendadas: cualquier GPU moderna sirve; el entrenamiento se completo en 1,2 minutos en una Tesla T4. Para inferencia por lotes a gran escala son adecuadas A100, H100, L4 o T4; para uso individual, RTX 3060, RTX 4090 o equivalentes.
- GPU de consumo: si, cabe holgadamente en GPUs de consumo (GTX 1660, RTX 2060, RTX 3060, RTX 4090) e incluso en CPU para cargas moderadas.
- Opciones de despliegue: transformers (pipeline de token-classification), ONNX Runtime y TorchScript para inferencia optimizada. No se documenta despliegue con vLLM, Ollama o llama.cpp; no hay pesos GGUF publicados.
- Latencia y throughput: no se publican medidas de latencia ni de throughput. Dado el tamano (110 M de parametros) y secuencias de hasta 128 tokens, se estima inferencia del orden de milisegundos por lote pequeno en GPU moderna, pero es una estimacion no verificada con datos del repositorio.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto | Metricas | Licencia |
|---|---|---|---|---|---|
| toyin88/u2t01-bert-pos (este) | POS tagging (17 UPOS) | 108,9 M | 128 tokens en ajuste (512 posicionales) | accuracy test 96,79; macro F1 test 90,36 | apache-2.0 |
| toyin88/u2t01-bert-qa | Question answering (SQuAD) | mismo cuerpo bert-base-uncased | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | apache-2.0 |
| pos_partial_fast (mismo proyecto) | POS tagging | 108,9 M, 14,1 M entrenables | 128 tokens | accuracy test 93,79 | apache-2.0 |
| pos_feature_fast (mismo proyecto) | POS tagging | 108,9 M, 0 entrenables | 128 tokens | accuracy test 93,37 | apache-2.0 |

Comparativas externas (por ejemplo spaCy, Stanza u otros taggers POS basados en transformers sobre UD English EWT): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Solo ingles: el modelo no soporta otros idiomas y el texto de entrenamiento es de dominio estrecho (ingles web de UD EWT).
- Dominio limitado: al entrenarse con UD EWT (blogs, resenas, correos), puede degradarse en otros registros como lenguaje cientifico, tecnico o conversacional informal de otras variedades.
- Una unica ejecucion con una unica semilla: segun el propio autor, cambiar la semilla desplaza los resultados aproximadamente mas o menos 1-3 puntos, por lo que diferencias menores a ese margen no son significativas.
- Sesgo heredado: bert-base-uncased incorpora los sesgos de su corpus de preentrenamiento y este ajuste no aplica ninguna mitigacion.
- Datos submuestreados: se usaron solo 5.000 ejemplos, por lo que las cifras quedan por debajo de resultados publicados con el dataset completo. La comparacion entre metodos no se ve afectada porque todos vieron los mismos datos.
- Riesgo de error en tokens ambiguos: como cualquier tagger estadistico, puede fallar en palabras con categoria gramatical dependiente del contexto y no expone un mecanismo de abtencion.
- Uso previsto restringido: el autor indica que es para investigacion y docencia; no debe usarse para tomar decisiones de produccion sobre personas.
- Licencia apache-2.0: permite uso comercial, pero el modelo hereda las condiciones de bert-base-uncased; conviene revisar la documentacion del modelo base antes de explotarlo comercialmente.
- Sin soporte de generacion, tool calling ni agentes: no es adecuado para tareas conversacionales ni de razonamiento multi-paso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/toyin88/u2t01-bert-pos
- Modelo hermano del mismo proyecto (question answering): https://huggingface.co/toyin88/u2t01-bert-qa
- Dataset Universal Dependencies: https://huggingface.co/datasets/universal-dependencies/universal_dependencies
- Paper de BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805
- Documentacion de HuggingFace sobre ajuste fino: https://huggingface.co/docs/transformers/training
- Codigo y modelos preentrenados de BERT (Google Research): https://github.com/google-research/bert
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
