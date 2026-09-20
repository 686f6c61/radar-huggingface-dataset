# thealper2/deberta-v3-base-formality

## Resumen

deberta-v3-base-formality es un modelo de clasificacion de texto en ingles desarrollado por el usuario thealper2 (publicado en Hugging Face) que distingue entre dos registros: `INFORMAL` (id 0) y `FORMAL` (id 1). Se trata de un ajuste fino (fine-tuning) del modelo preentrenado `microsoft/deberta-v3-base` sobre el corpus anotado `osyvokon/pavlick-formality-scores`, derivado de las anotaciones de formalidad de Pavlick y Tetreault (2016). El problema que resuelve es concreto: dada una frase suelta, asignarle una probabilidad de pertenecer al registro formal, algo util para filtrado de datos, control de estilo y auditoria de contenido.

Arquitectonicamente no es un modelo generativo, sino un encoder transformer de tipo DeBERTa-v3 con una unica cabeza lineal de clasificacion de 2 logits (`DebertaV2ForSequenceClassification`). Cuenta con 184.423.682 parametros (184,4 M) y una longitud maxima de secuencia de 128 tokens, con tokenizer SentencePiece de vocabulario 128.100. Su relevancia practica esta en que es pequeno (0,7 GB de repositorio), rapido de ejecutar incluso en CPU y publicado con licencia MIT, lo que lo hace apto para integraciones industriales sin friccion legal.

El modelo se evalua sobre el split oficial de test (2.000 frases) con una accuracy de 0,8190, un macro F1 de 0,8183 y un ROC-AUC de 0,9014. Es importante tener en cuenta que todas las metricas estan marcadas como no verificadas (`verified: false`) en el model-index y que el autor no reporta validacion independiente; ademas, el repositorio acumula 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder DeBERTa-v3 con cabeza de clasificacion lineal (`DebertaV2ForSequenceClassification`, 2 logits) |
| Parametros totales | 184.423.682 (184,4 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 128 tokens (longitud maxima de secuencia usada en entrenamiento) |
| Tipos de cuantizacion | no disponible: el repositorio solo publica pesos sin cuantizar; no hay versiones GGUF, ONNX, int8 o GPTQ publicadas |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (tamano del repositorio: 0,7 GB) |
| Tokenizer | `microsoft/deberta-v3-base` (SentencePiece, vocabulario 128.100) |
| Etiquetas de salida | 0 = `INFORMAL`, 1 = `FORMAL` |
| Pipeline | text-classification |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `microsoft/deberta-v3-base`, un transformer encoder con atencion desenredada (disentangled attention) y embeddings relativos de posicion, al que se le anade una unica capa lineal de clasificacion con dos logits. No hay decodificacion generativa, ni modo "thinking", ni ninguna innovacion de inferencia adicional: es un clasificador discriminativo puro de 184,4 M de parametros. El tokenizer es el del modelo base (SentencePiece, vocabulario 128.100) y la secuencia se trunca a 128 tokens.

El entrenamiento se realizo sobre `osyvokon/pavlick-formality-scores`, que contiene anotaciones continuas de formalidad en una escala Likert de 7 puntos, de -3 (muy informal) a +3 (muy formal), procedentes de cuatro dominios: `answers`, `blog`, `email` y `news`. Las etiquetas binarias son derivadas por el autor del modelo, no proporcionadas por los anotadores, con el umbral fijado a priori en 0.0 (`avg_score > 0.0` implica `FORMAL`; en caso contrario, `INFORMAL`). El preprocesado elimino textos vacios o sin puntuacion, duplicados exactos y filas de entrenamiento cuyo texto apareciese en el split de test. Los splits resultantes son 8.318 ejemplos de entrenamiento, 925 de validacion (10 % estratificado, semilla 42) y 2.000 de test, con clases practicamente equilibradas.

Los hiperparametros documentados son: optimizador AdamW, learning rate 2e-05, scheduler lineal con warmup ratio 0,1 (156 pasos), 3 epochs, batch de entrenamiento 16, batch de evaluacion 32, weight decay 0,01, max grad norm 1,0, padding dinamico (`DataCollatorWithPadding`), semilla 42, precision bf16 y seleccion del mejor modelo por macro F1 en validacion. El entrenamiento completo tardo 3 minutos y 22,5 segundos en una NVIDIA GeForce RTX 5060 Ti (15,9 GB). No se documenta RLHF, DPO ni ninguna fase de alineacion adicional, algo esperable en un clasificador.

## Capacidades

- Clasificacion binaria de formalidad de frases en ingles: devuelve `FORMAL` o `INFORMAL` con una probabilidad asociada.
- Puntuacion continua indirecta: al usar `P(FORMAL)` como score, el modelo correlaciona con la anotacion original (Pearson r = 0,7794; Spearman rho = 0,7959), lo que permite ordenar o filtrar textos por grado de formalidad aparente.
- Procesamiento por lotes: al ser un encoder pequeno, permite clasificar grandes volumenes de frases con throughput alto.
- Compatibilidad con el ecosistema transformers: funciona con `pipeline("text-classification")`, `AutoModelForSequenceClassification` y `AutoTokenizer`, y el repositorio lleva las etiquetas `text-embeddings-inference` y `endpoints_compatible`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto. No es un modelo de chat.

## Casos de uso

- Filtrado y curado de corpus de entrenamiento: dado un dataset masivo de frases web, el modelo permite separar automaticamente el material formal (documentacion, noticias, correo profesional) del informal (foros, redes sociales, chat) para construir mezclas de preentrenamiento o ajuste fino con control de registro.
- Moderacion y normalizacion de tono en plataformas: clasificar mensajes entrantes para decidir si requieren una respuesta institucional o una respuesta cercana; el umbral de decision puede ajustarse por encima o por debajo de 0,5 segun la politica del producto.
- Enrutamiento de tickets de soporte: etiquetar como formales los correos de corte corporativo o legal y derivarlos a un flujo distinto del de consultas coloquiales, usando el score `P(FORMAL)` como senal de prioridad.
- Analisis estilistico y sociolinguistico: estudiar la distribucion de formalidad por dominio (`answers`, `blog`, `email`, `news`) o por variedad de hablante en corpus anotados, aprovechando la correlacion con la escala continua original.
- Control de estilo en sistemas de generacion: actuar como clasificador de recompensa o de verificacion en un pipeline de reescritura, comprobando si una frase generada cumple el registro objetivo antes de publicarla.
- Monitorizacion de consistencia de marca: auditar automaticamente textos de atencion al cliente, respuestas legales o comunicados para detectar desviaciones hacia un registro excesivamente coloquial.
- Preetiquetado en anotacion humana: generar etiquetas automaticas de formalidad sobre miles de frases y reservar la revision humana para los casos con probabilidad cercana a 0,5, donde el propio autor advierte de ambiguedad intrinseca.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index y en la model card, sobre el split oficial de test de `osyvokon/pavlick-formality-scores` (2.000 frases). Todas las metricas estan marcadas como no verificadas (`verified: false`).

| Metrica | Valor |
|---|---|
| Accuracy | 0,8190 |
| Macro precision | 0,8220 |
| Macro recall | 0,8181 |
| Macro F1 | 0,8183 |
| ROC-AUC | 0,9014 |
| MCC | 0,6402 |

| Etiqueta | Precision | Recall | F1 | Soporte |
|---|---|---|---|---|
| INFORMAL | 0,8493 | 0,7681 | 0,8066 | 983 |
| FORMAL | 0,7948 | 0,8682 | 0,8299 | 1.017 |

Matriz de confusion (filas = verdadero, columnas = predicho):

| | pred INFORMAL | pred FORMAL |
|---|---|---|
| verdadero INFORMAL | 755 | 228 |
| verdadero FORMAL | 134 | 883 |

Concordancia con la anotacion continua original en el split de test (`avg_score` frente a `P(FORMAL)`): Pearson r = 0,7794; Spearman rho = 0,7959. No se han publicado en la informacion disponible resultados comparativos con otros clasificadores de formalidad.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones a partir del numero de parametros, no datos publicados por el autor): aproximadamente 0,74 GB solo para pesos en fp32, 0,37 GB en fp16/bf16 y 0,18 GB en int8. Con activaciones y lotes pequenos, el consumo total se mantiene por debajo de 1,5 GB en fp32.
- GPU recomendadas: no requiere GPU de centro de datos. Cualquier GPU con 2 GB o mas de VRAM es suficiente: RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema, aunque las dos ultimas estan sobredimensionadas para este modelo. El autor entreno el modelo en una RTX 5060 Ti de 15,9 GB.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada moderna e, incluso, en iGPU con memoria compartida suficiente. La inferencia en CPU es viable para volumenes moderados.
- Opciones de despliegue: `pipeline` de transformers (documentado en la model card), Text Embeddings Inference (el repositorio lleva la etiqueta `text-embeddings-inference`), Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`) y exportacion a ONNX Runtime si se necesita optimizacion (no se publican pesos ONNX en el repositorio). Para llama.cpp/Ollama no se documenta soporte de la cabeza de clasificacion.
- Latencia y throughput estimados: no disponibles. Como referencia indirecta, el entrenamiento completo de 3 epochs sobre 8.318 ejemplos tardo 3 minutos y 22,5 segundos en una RTX 5060 Ti.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Resultados |
|---|---|---|---|---|---|
| thealper2/deberta-v3-base-formality | 184,4 M | 128 tokens | Clasificacion binaria formal/informal | MIT | Accuracy 0,8190; macro F1 0,8183; ROC-AUC 0,9014 |
| microsoft/deberta-v3-base (modelo base) | 184,4 M | 512 tokens (configuracion del modelo base publicado por Microsoft) | Modelo preentrenado; requiere ajuste para clasificar | MIT | No aplica: no realiza clasificacion de formalidad sin ajuste |
| Otros clasificadores de formalidad en ingles | no disponible | no disponible | Clasificacion de formalidad | no disponible | No se han encontrado resultados comparables en la informacion proporcionada |

No se dispone de datos publicados que comparen este ajuste con alternativas equivalentes (por ejemplo, RoBERTa-base o XLM-RoBERTa-base entrenados sobre el mismo corpus) en la informacion proporcionada, por lo que la comparativa cuantitativa queda limitada al modelo base.

## Limitaciones y advertencias

- Etiquetas derivadas: la anotacion original es una puntuacion continua de -3 a +3 y el autor la binariza en 0.0. Esto descarta la intensidad de la formalidad y hace intrinsecamente ambiguas las frases cercanas al umbral; el propio autor advierte que las probabilidades proximas a 0,5 deben interpretarse como "poco claro" y no como una decision segura.
- Convencion en los empates: las frases con `avg_score` exactamente igual al umbral se asignan a `INFORMAL` por convencion, no por criterio linguistico.
- Cobertura de dominio limitada: el entrenamiento cubre Yahoo! Answers, blogs, correo electronico y noticias. El comportamiento en otros dominios (registros de chat, codigo, transcripciones, ingles no nativo o dialectal) no ha sido probado.
- Granularidad de frase: el modelo se entreno con frases individuales de unos 20,9 tokens de media. Las entradas largas de varios parrafos se truncan a 128 tokens, por lo que la clasificacion de un documento completo requiere trocearlo y agregar los resultados.
- Solo ingles: no soporta otros idiomas, ni siquiera de forma incidental documentada.
- Riesgo de alucinacion: no aplica en el sentido generativo (el modelo no produce texto libre), pero si existe riesgo de falsos positivos y falsos negativos sistematicos: 228 frases informales se clasificaron como formales y 134 formales como informales en el split de test.
- Sesgos potenciales: al derivarse del corpus de Pavlick y Tetreault (2016), puede heredar sesgos de genero, edad o variedad dialectal presentes en los dominios de origen, aunque no se documenta ninguna auditoria de sesgo.
- Validacion limitada: no hay evaluacion independiente, las metricas figuran como no verificadas en el model-index y el repositorio no tiene descargas ni likes registrados, por lo que conviene validar el modelo en el dominio objetivo antes de llevarlo a produccion.
- Licencia: MIT, permisiva y sin restricciones de uso comercial documentadas. No obstante, al ser un derivado del corpus Pavlick y Tetreault, conviene revisar las condiciones del dataset original para usos distintos de la investigacion.
- En produccion, se recomienda calibrar el umbral de decision con datos propios en lugar de usar 0,5 por defecto, dado el desequilibrio de errores observado (mayor recall en `FORMAL` que en `INFORMAL`).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thealper2/deberta-v3-base-formality
- Modelo base: https://huggingface.co/microsoft/deberta-v3-base
- Dataset de entrenamiento: https://huggingface.co/datasets/osyvokon/pavlick-formality-scores
- Referencia de las anotaciones originales: Pavlick y Tetreault (2016), "Learning to Recognize Formality in Online Communication" (no se proporciona URL en la informacion disponible)
- Repositorio, paper o demo adicionales: no disponible. La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo (unicamente manuales de motocicletas Vespa, sin relacion con el contenido de esta ficha).
