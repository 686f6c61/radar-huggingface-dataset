# tadiecool29/afrolm-stl-final-sentiment

## Resumen

afrolm-stl-final-sentiment es un modelo de analisis de sentimiento desarrollado por tadiecool29 (Tadesse), un estudiante de Data Science interesado en machine learning y deep learning. Se trata de un fine-tuning del modelo multilingue AfroLM (bonadossou/afrolm_active_learning) para la tarea especifica de clasificacion de sentimiento. El modelo cuenta con 263.673.603 parametros y se distribuye bajo licencia Creative Commons Attribution 4.0 (CC-BY-4.0).

El modelo esta orientado a clasificar texto segun su polaridad sentimental, aprovechando las capacidades multilingues del modelo base AfroLM, que fue preentrenado con estrategias de aprendizaje activo para lenguas africanas. Su relevancia radica en ofrecer una opcion de analisis de sentimiento para idiomas africanos, un area tradicionalmente infrarrepresentada en el ecosistema de procesamiento de lenguaje natural.

La model card fue generada automaticamente por HuggingFace Trainer y presenta carencias importantes: no incluye descripcion detallada, el dataset de entrenamiento aparece como "None" y los usos previstos estan marcados como "More information needed". Los resultados de evaluacion declarados por el autor muestran un F1 de 0,6501 y una accuracy de 0,6571 en el conjunto de validacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en AfroLM) |
| Parametros totales | 263.673.603 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo base AfroLM esta orientado a lenguas africanas) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de bonadossou/afrolm_active_learning, un modelo multilingue preentrenado con estrategias de aprendizaje activo para lenguas africanas. La arquitectura subyacente es un transformer, aunque la model card no especifica detalles concretos como numero de capas, cabezas de atencion o dimension de embedding.

El entrenamiento de fine-tuning se realizo con los siguientes hiperparametros: learning rate de 1e-05, batch size de entrenamiento de 16, batch size de evaluacion de 32, optimizador AdamW (variante torch fused) con betas (0,9; 0,999) y epsilon 1e-08, scheduler de learning rate coseno con 300 pasos de warmup, y 6 epocas. Se utilizo entrenamiento con precision mixta nativa (Native AMP). El dataset de entrenamiento aparece como "None" en la model card, lo que indica que el autor no lo especifico correctamente al generar la ficha.

## Capacidades

- Analisis de sentimiento: clasifica texto en categorias de sentimiento (positivo, negativo, neutro) con una accuracy declarada de 0,6571 y F1 de 0,6501.
- Clasificacion de texto: al ser un modelo basado en transformer, puede adaptarse a otras tareas de clasificacion mediante fine-tuning adicional.
- Capacidades multilingues: hereda las capacidades del modelo base AfroLM, orientado a lenguas africanas, aunque los idiomas concretos soportados no estan documentados en la model card.
- Compatible con HuggingFace Inference Endpoints: el tag "endpoints_compatible" indica que puede desplegarse directamente en la infraestructura de inferencia de HuggingFace.
- Integracion con transformers: al usar la libreria transformers, es compatible con el ecosistema estandar de HuggingFace (pipelines, Trainer, etc.).

## Casos de uso

- Analisis de sentimiento en redes sociales: el modelo puede utilizarse para monitorizar la opinion publica en plataformas como X (Twitter) o Facebook en lenguas africanas, ayudando a empresas y organizaciones a entender la percepcion de sus marcas o productos en mercados locales.
- Atencion al cliente automatizada: integrado en un pipeline de clasificacion, puede pre-clasificar mensajes de clientes segun su tono emocional para priorizar aquellos con sentimiento negativo que requieren atencion inmediata por parte de agentes humanos.
- Investigacion academica en PLN para lenguas africanas: sirve como punto de partida para investigadores que necesiten un modelo de analisis de sentimiento especifico para idiomas africanos, pudiendo fine-tunearlo con sus propios datasets etiquetados.
- Analisis de reviews de productos: puede aplicarse a la clasificacion de opiniones de productos o servicios en mercados africanos, donde los modelos multilingues generalistas suelen tener un rendimiento inferior por la escasez de datos de entrenamiento en esas lenguas.
- Monitorizacion de campanas politicas: permite analizar la reaccion del publico a discursos o eventos politicos en tiempo real, clasificando el sentimiento de las menciones en redes sociales y medios digitales.
- Deteccion de crisis de reputacion: al clasificar el sentimiento de las menciones a una marca, puede alertar de picos de sentimiento negativo que indiquen una crisis de reputacion inminente, permitiendo una respuesta proactiva.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el conjunto de evaluacion:

| Metrica | Valor |
|---|---|
| Loss | 0,8580 |
| Precision de sentimiento | 0,6515 |
| Recall de sentimiento | 0,6504 |
| F1 | 0,6501 |
| Accuracy de sentimiento | 0,6571 |

La evolucion del entrenamiento muestra una mejora progresiva del F1 desde 0,5459 (epoca 1) hasta 0,6501 (epoca 6), con la mejor accuracy tambien en la epoca 6 (0,6571). No se han publicado resultados comparativos con otros modelos en los mismos conjuntos de datos, ni benchmarks estandar como MMLU, HumanEval o GLUE.

## Requisitos de hardware

- Tamano del modelo: 263,7 millones de parametros, aproximadamente 1,1 GB en safetensors (
