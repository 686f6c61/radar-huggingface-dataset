# thealper2/laya-multilingual-turkish-noul

## Resumen

laya-multilingual-turkish-noul es un modelo de clasificacion binaria para turco desarrollado por el usuario thealper2, consistente en un ajuste fino completo del modelo base convaiinnovations/laya-multilingual sobre el conjunto de datos ahmetege/turkish_jev_noul. Su tarea concreta es resolver preguntas de tipo "noul" (yes/no) en turco: dado un texto de estado y un par de criterios, el modelo emite un logit por cada opcion (`false` y `true`) y devuelve una probabilidad calibrada de que la respuesta sea verdadera. No es un modelo generativo: la clase `laya.common.DecisionModel` es no autoregresiva y resuelve cada decision en un unico forward pass.

Tecnicamente, el modelo combina un encoder mmBERT-base (familia ModernBERT, 22 capas, hidden 768, 12 cabezas de atencion y vocabulario de 256k tokens) con una cabeza de decision de 2 capas `nn.TransformerEncoderLayer`, un embedding de tipo de pregunta y un scorer de opciones. El conjunto suma 321.908.998 parametros (321,9 M), de los cuales 306,9 M corresponden al encoder —incluidos 196,6 M en embeddings de tokens— y 15,0 M a la cabeza de decision. La longitud de contexto es de 512 tokens para el texto y 256 para la cabeza de pregunta y opciones.

Su relevancia practica reside en la calibracion: con escalado de temperatura (T = 1.1588, ajustado solo sobre validacion) alcanza un ECE de 0.0072 y un Brier de 0.1288 en el split de test, muy por encima del modelo base en zero-shot (ECE 0.1930). Esto lo hace util en pipelines donde la probabilidad, y no solo la etiqueta, se consume como senal de decision. La licencia es cc-by-sa-4.0 y el repositorio ocupa 0,7 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `laya.common.DecisionModel`: encoder mmBERT-base (ModernBERT, 22 capas, hidden 768, 12 cabezas, vocabulario 256k) con cabeza de decision de 2 × `nn.TransformerEncoderLayer` (d=768, 12 cabezas, FFN 3072, pre-norm) + embedding de tipo de pregunta + scorer de opciones (LayerNorm→Linear→GELU→Linear→1) |
| Parametros totales | 321.908.998 (encoder 306,9 M, de los cuales 196,6 M en embeddings de tokens; cabeza de decision 15,0 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (`max_len`); 256 tokens para la cabeza de pregunta y opciones (`head_max_len`) |
| Tipos de cuantizacion | no disponible (los pesos publicados estan en float16 safetensors) |
| Idiomas soportados | turco (`tr`); el modelo base es multilingue |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors en float16, con buffer de temperatura en fp32; tamano de repositorio 0,7 GB |

## Arquitectura y entrenamiento

El modelo no es un transformer autoregresivo sino un clasificador de decision de un solo paso. La secuencia de entrada se construye con `laya.common.build_sequence` segun el patron `[CLS] noul question: <instructions> [SEP] [MASK] false: <criteria.false> [MASK] true: <criteria.true> [SEP] <state JSON> [SEP]`. El encoder mmBERT-base procesa esa secuencia y la cabeza de decision produce un logit por cada marcador `[MASK]`. Las opciones de Noul estan fijas como `[false, true]` y la probabilidad final se obtiene como `P(true) = softmax(z / T)[1]`, con T = 1.1588 ajustado sobre el split de validacion y acotado al rango [0.5, 5.0]. Solo se usan como entradas del modelo los campos `state`, `instructions` y `criteria`.

El entrenamiento consistio en un ajuste fino completo, sin PEFT ni LoRA, con objetivo de entropia cruzada suave sobre los dos logits de los marcadores Noul (equivalente a entropia cruzada binaria sobre P(true)). Se uso AdamW con weight decay 0.01, learning rate de 2.5e-05 para el encoder y 1e-04 para la cabeza, scheduler coseno hasta 1e-06, sin warmup, batch efectivo de 32 (micro-batch 16 con acumulacion de gradientes 2), 4 epocas y 254 actualizaciones, seleccionando la epoca 1 por `log_loss_tscaled` de validacion. Se entreno en bf16 con pesos maestros en fp32, grad clipping de 1.0, longitud de secuencia 512 (0.23% de las secuencias de entrenamiento truncadas) y semilla 42, sobre una unica NVIDIA GeForce RTX 5060 Ti en 0,03 horas.

Los datos proceden de `ahmetege/turkish_jev_noul` en la revision `582dc7ad61d20498f985f62aa2a212acd3e86868`: tareas turcas de TrGLUE (RTE, QNLI, MRPC, QQP, CoLA, SST-2), Belebele y un conjunto turco de lenguaje toxico, reescritos como preguntas Noul con plantillas y etiquetas duras 0/1. El reparto es de 8.100 ejemplos de entrenamiento, 1.300 de validacion, 1.900 de test y 1.000 de `test_unseen_task` (MNLI, tarea y plantillas no vistas). Las filas de validacion y test cuyo estado o frase citada aparece tambien en un split anterior se excluyen de la evaluacion (29 filas de test).

## Capacidades

- Clasificacion binaria de decisiones de tipo si/no (Noul) en turco, con una unica pasada hacia delante y sin generacion de texto.
- Emision de probabilidades calibradas: `P(true)` con escalado de temperatura, pensada para consumo directo como score de confianza.
- Manejo de preguntas con instrucciones en lenguaje natural y criterios explicitos para las opciones `false` y `true`.
- Ingesta de un campo de estado (`state`) en formato JSON junto con la instruccion y los criterios.
- Cobertura de tareas derivadas de NLI, QA extractiva, parafrasis, similitud de frases, aceptabilidad gramatical, sentimiento y deteccion de toxicidad, al haber sido entrenado sobre reformulaciones de TrGLUE, Belebele y un conjunto de toxicidad.
- Capacidad de generalizacion a tareas no vistas: el split `test_unseen_task` procede de MNLI con plantillas distintas.
- No soporta tool calling ni function calling: no es un modelo generativo ni dispone de interfaz de herramientas.
- No soporta agentes ni razonamiento multi-paso: cada decision se resuelve en un forward pass independiente.
- Multilingue limitado: el checkpoint esta entrenado y evaluado unicamente en turco, aunque hereda el encoder multilingue del modelo base.
- Otros tipos de pregunta de la libreria Laya (`choice`, `score`) se heredan del modelo base y no fueron evaluados en este ajuste.

## Casos de uso

- Moderacion de contenido en turco: el modelo clasifica si un texto cumple un criterio de toxicidad con `P(true)` calibrada (accuracy 0.8997 en la fuente `toksik` del split de test), lo que permite fijar umbrales por politica sin recalibrar manualmente.
- Verificacion de fidelidad en pipelines RAG: dado un fragmento recuperado como `state` y una afirmacion como instruccion, el modelo decide si el texto respalda la afirmacion; su ECE de 0.0072 permite descartar respuestas de baja confianza antes de mostrarlas al usuario.
- Anotacion asistida de datos: preetiquetado de conjuntos turcos de NLI, parafrasis o QA con etiquetas duras y probabilidades, revisadas despues por anotadores humanos; reduce el coste en tareas de TrGLUE como RTE (0.9033 de accuracy) o QNLI (0.8700).
- Enrutado de decisiones en atencion al cliente: clasificar si una consulta cumple una condicion del flujo (`false`/`true`) antes de derivarla a un agente humano o a un bot, con la probabilidad como senal de escalado.
- Deduplicacion y deteccion de parafrasis en corpus turcos: usar el par de frases como criterios y la salida binaria para marcar pares equivalentes; el rendimiento en MRPC (0.6879 de accuracy) aconseja umbrales conservadores.
- Analisis de sentimiento operativo: reformular criticas o comentarios como pregunta si/no sobre polaridad y agregar las probabilidades calibradas por producto o periodo (accuracy 0.7533 en la fuente SST-2).
- Investigacion en calibracion de clasificadores: el checkpoint y sus variantes (zero-shot, RLCD, con y sin calibracion) permiten estudiar el efecto del escalado de temperatura sobre ECE, Brier y log loss en una tarea concreta.
- Filtrado previo en pipelines de anotacion masiva: descartar automaticamente los casos con probabilidad extrema y reservar la revision humana para la banda intermedia de `P(true)`.

## Benchmarks y rendimiento

Resultados declarados en el model-index de la model card (metrica `accuracy` 0.8097, `f1` 0.8011, `roc_auc` 0.9000, `brier_score` 0.1288, `log_loss` 0.4006, `ece` 0.0072 sobre el split de test del dataset `ahmetege/turkish_jev_noul`). Todos los valores estan marcados como `verified: false`, es decir, no han sido verificados de forma independiente.

Comparativa de variantes evaluadas en la model card sobre el split `test` (n = 1871):

| Modelo | T | n | Accuracy | F1 | ROC-AUC | Brier | LogLoss | ECE |
|---|---|---|---|---|---|---|---|---|
| Laya multilingual zero-shot | 1.000 | 1871 | 0.6558 | 0.6189 | 0.6840 | 0.2668 | 0.9439 | 0.1930 |
| Laya multilingual zero-shot + calibracion | 5.000 | 1871 | 0.6558 | 0.6189 | 0.6840 | 0.2265 | 0.6459 | 0.0541 |
| Laya multilingual ajuste supervisado (este checkpoint) | 1.000 | 1871 | 0.8097 | 0.8011 | 0.9000 | 0.1293 | 0.4038 | 0.0214 |
| Laya multilingual ajuste supervisado + calibracion (este checkpoint) | 1.159 | 1871 | 0.8097 | 0.8011 | 0.9000 | 0.1288 | 0.4006 | 0.0072 |
| Laya multilingual + RLCD | 1.000 | 1871 | 0.8071 | 0.8033 | 0.9014 | 0.1408 | 0.4921 | 0.1026 |
| Laya multilingual + RLCD + calibracion | 2.076 | 1871 | 0.8071 | 0.8033 | 0.9014 | 0.1280 | 0.4007 | 0.0338 |

Split `test_unseen_task` (MNLI, tarea no vista, n = 1000):

| Modelo | T | n | Accuracy | F1 | ROC-AUC | Brier | LogLoss | ECE |
|---|---|---|---|---|---|---|---|---|
| Laya multilingual zero-shot | 1.000 | 1000 | 0.6830 | 0.7302 | 0.7574 | 0.2323 | 0.8922 | 0.1515 |
| Laya multilingual zero-shot + calibracion | 5.000 | 1000 | 0.6830 | 0.7302 | 0.7574 | 0.2183 | 0.6389 | 0.0934 |
| Laya multilingual ajuste supervisado (este checkpoint) | 1.000 | 1000 | 0.8610 | 0.8647 | 0.9115 | 0.1112 | 0.3867 | 0.0422 |
| Laya multilingual ajuste supervisado + calibracion (este checkpoint) | 1.159 | 1000 | 0.8610 | 0.8647 | 0.9115 | 0.1114 | 0.3773 | 0.0444 |
| Laya multilingual + RLCD | 1.000 | 1000 | 0.8550 | 0.8596 | 0.9097 | 0.1228 | 0.5271 | 0.1002 |
| Laya multilingual + RLCD + calibracion | 2.076 | 1000 | 0.8550 | 0.8596 | 0.9097 | 0.1111 | 0.3693 | 0.0275 |

Accuracy por fuente en el split `test` (T = 1):

| Fuente | n | Accuracy | Brier |
|---|---|---|---|
| cola | 100 | 0.4500 | 0.2521 |
| mrpc | 282 | 0.6879 | 0.2110 |
| qnli | 300 | 0.8700 | 0.1036 |
| qqp | 290 | 0.8586 | 0.1139 |
| rte | 300 | 0.9033 | 0.0709 |
| sst2 | 300 | 0.7533 | 0.1621 |
| toksik | 299 | 0.8997 | 0.0776 |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en float16 ocupan aproximadamente 0,64 GB (321,9 M × 2 bytes); en fp32 serian unos 1,29 GB. Sumando activaciones a 512 tokens y batches pequenos, la inferencia cabe holgadamente en 2-3 GB de VRAM (estimacion derivada del numero de parametros, no publicada por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. Al ser un modelo de 321,9 M de parametros y pasada unica, modelos de consumo como la RTX 3060, RTX 4060, RTX 4090 o la propia RTX 5060 Ti empleada en el entrenamiento son suficientes. Las GPU de datacenter (A100, H100) solo aportan ventaja en escenarios de alto throughput por lote.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU discreta moderna con 4 GB o mas de VRAM, e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: la libreria Laya (`import laya; laya.load(...)`), que carga pesos safetensors. Soporte de vLLM, llama.cpp, Ollama o TGI: no disponible (no es un modelo generativo autoregresivo, por lo que estos motores de inferencia no aplican directamente).
- Latencia y throughput estimados: no disponible. El unico dato de computo publicado es que el ajuste fino completo requirio 0,03 horas en una RTX 5060 Ti sobre 8.100 ejemplos con 254 actualizaciones.

## Comparativa con modelos similares

No se dispone de datos publicados de otros modelos externos en la informacion proporcionada, por lo que la comparativa se limita a las variantes evaluadas en la propia model card.

| Modelo | Parametros | Contexto | Accuracy (test) | F1 | ROC-AUC | ECE | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|---|
| laya-multilingual-turkish-noul (este checkpoint) | 321,9 M | 512 tokens | 0.8097 | 0.8011 | 0.9000 | 0.0072 | cc-by-sa-4.0 | HuggingFace (`thealper2/laya-multilingual-turkish-noul`) |
| convaiinnovations/laya-multilingual (base, zero-shot) | no disponible | no disponible | 0.6558 | 0.6189 | 0.6840 | 0.1930 | no disponible | HuggingFace (`convaiinnovations/laya-multilingual`) |
| Variante RLCD descrita en la model card | no disponible | no disponible | 0.8071 | 0.8033 | 0.9014 | 0.1026 | no disponible | no disponible como checkpoint independiente |
| Modelos externos comparables (clasificadores turcos basados en XLM-R o mBERT) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Diferencias clave dentro de la familia: el ajuste supervisado mejora la accuracy del modelo base zero-shot en 15,39 puntos sobre `test` (0.8097 frente a 0.6558) y en 17,80 puntos sobre `test_unseen_task` (0.8610 frente a 0.6830). La variante RLCD obtiene un F1 ligeramente superior (0.8033 frente a 0.8011) y un ROC-AUC algo mejor (0.9014 frente a 0.9000) en `test`, pero una calibracion claramente peor sin escalado (ECE 0.1026 frente a 0.0214).

## Limitaciones y advertencias

- Las etiquetas del conjunto de datos son duras 0/1 y las probabilidades estan calibradas unicamente para la distribucion de ese dataset; el ECE de 0.0072 no es extrapolable sin recalibracion a otros dominios.
- Entrenado exclusivamente con preguntas de tipo `noul`; el comportamiento con los tipos `choice` y `score` se hereda del modelo base y no fue evaluado en este ajuste.
- Todos los resultados del model-index estan marcados como `verified: false`: son declaraciones del autor, no verificaciones independientes.
- Rendimiento desigual por tarea: la accuracy en la fuente `cola` cae a 0.4500 y en `mrpc` a 0.6879, por lo que no es adecuado como clasificador general de aceptabilidad gramatical o parafrasis sin umbrales ajustados.
- Contexto limitado a 512 tokens para el texto y 256 para la cabeza de pregunta y opciones; no admite documentos largos sin troceado previo.
- Idioma restringido al turco: no hay evidencia de rendimiento en otras lenguas, pese a que el encoder base sea multilingue.
- Licencia cc-by-sa-4.0: permite uso comercial, pero impone compartir las obras derivadas bajo la misma licencia y requiere atribucion; conviene revisar las obligaciones de copyleft en productos propietarios.
- El ajuste es un trabajo independiente y no esta afiliado a TypeSafe/Jev, segun indica el propio autor.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo no produce texto libre; el riesgo equivalente es una clasificacion incorrecta con alta confianza, mitigable con el ECE reportado y umbrales conservadores.
- La seccion de limitaciones de la model card original aparece truncada en la informacion disponible ("Inputs l"), por lo que podrian existir advertencias adicionales no recogidas aqui.
- Micro-batch 16 con acumulacion 2 y solo 254 actualizaciones de entrenamiento: el presupuesto de optimizacion es reducido, lo que puede limitar la robustez fuera de la distribucion de las plantillas de Noul.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thealper2/laya-multilingual-turkish-noul
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/ahmetege/turkish_jev_noul
- Resultados de busqueda web: no se han encontrado enlaces relevantes (los resultados devueltos corresponden a servicios de mapas de Google y no guardan relacion con el modelo).
