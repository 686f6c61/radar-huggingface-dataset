# StanfordSCALE/assertion_sentence_has_counting_sequence

## Resumen

`StanfordSCALE/assertion_sentence_has_counting_sequence` es un clasificador binario de frases desarrollado por la Stanford SCALE Initiative dentro del proyecto EduBehaviors, un conjunto de esquemas de anotacion basados en aserciones para el codigo de dialogo auditable en contextos educativos. Su tarea concreta es determinar si un enunciado de un docente contiene una secuencia de conteo (por ejemplo, "cuenta del uno al cuatro"), una senal relevante en el analisis del discurso matematico en el aula.

Tecnicamente no es un modelo generativo ni un LLM: es un modelo SetFit que combina un encoder de frases `sentence-transformers/paraphrase-mpnet-base-v2` (109.486.464 parametros) afinado con aprendizaje contrastivo y una cabeza de clasificacion `LogisticRegression`. Se entrenó sobre un subconjunto del TalkMoves Dataset anotado automaticamente por LLM, con 3.432 ejemplos de entrenamiento, 858 de desarrollo y 2.144 de prueba.

Es relevante en el nicho de la investigacion educativa porque ofrece una via reproducible y ligera (0,4 GB de repositorio, ejecutable en CPU) para codificar automaticamente un comportamiento docente muy especifico y poco frecuente, integrándose mediante el paquete Python `EduBehaviors-kit`. Su limitacion estructural es la extremada rareza de la clase positiva (1,4 % global, 0,8 % en test), lo que condiciona la interpretacion de sus metricas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit: encoder de frases transformer MPNet (cuerpo) + cabeza `LogisticRegression` |
| Parametros totales | 109.486.464 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el encoder base MPNet admite hasta 512 posiciones; la model card no especifica el limite efectivo) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en safetensors sin variantes cuantizadas documentadas |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (tamano del repositorio: 0,4 GB) |
| Tarea (pipeline) | text-classification |
| Etiquetas de salida | binaria: `assertion_sentence_has_counting_sequence` (True/False) |
| Modelo base | sentence-transformers/paraphrase-mpnet-base-v2 |
| Libreria | setfit |
| Dataset de entrenamiento | StanfordSCALE/assertions_llm_annotated_talkmoves |
| Fecha de publicacion | 2026-09-18 |

## Arquitectura y entrenamiento

El modelo sigue el paradigma SetFit (Sentence Transformer Fine-tuning): en una primera fase se afina el cuerpo `paraphrase-mpnet-base-v2` con aprendizaje contrastivo sobre pares de frases generados a partir de los ejemplos etiquetados, con un learning rate de 2e-05, batch size 16, 10 epocas y un maximo de 5.000 pasos. En una segunda fase se entrena una cabeza de regresion logistica sobre los embeddings resultantes, con learning rate 0.01 y batch size 32. La semilla utilizada fue 20260904 y se activo precision mixta en GPU. Este esquema permite obtener un clasificador competitivo con muy pocos datos etiquetados, en lugar de ajustar todos los parametros del encoder para la tarea final.

Los datos proceden de un subconjunto del TalkMoves Dataset anotado por anotadores LLM, restringido a intervenciones de docentes. El reparto es de 3.432 filas de entrenamiento (53,3 %), 858 de desarrollo (13,3 %) y 2.144 de prueba (33,3 %). No se documenta el uso de RLHF ni DPO, algo que no aplica a un clasificador discriminativo de este tipo. La innovacion principal es metodologica: codificacion de comportamientos de aula mediante aserciones auditables, con un acuerdo entre anotadores de Krippendorff's alpha = 0.757 para esta asercion concreta.

## Capacidades

- Clasificacion binaria de enunciados: determina si una intervencion docente contiene una secuencia de conteo.
- Salida probabilistica mediante `predict_proba`, lo que permite fijar umbrales de decision ajustados al coste relativo de falsos positivos y falsos negativos.
- Procesamiento de una unica frase o de lotes de frases; la entrada se construye como `{utterance}` sin plantilla adicional.
- Funcionamiento sobre texto en ingles exclusivamente.
- Inferencia ligera: 109,5 M de parametros y 0,4 GB de repositorio, viable en CPU.
- Integracion con el ecosistema `EduBehaviors-kit` para pipelines de codificacion de dialogo en el aula.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, vision, audio ni modo de pensamiento. No genera texto.

## Casos de uso

- Codificacion a gran escala de discurso matematico en el aula: aplicar el clasificador a transcripciones completas de clases para cuantificar con que frecuencia los docentes piden secuencias de conteo, una senal de instruccion matematica temprana.
- Preanotacion para codificadores humanos: usar `predict_proba` para priorizar los enunciados candidatos y reducir el volumen de revision manual en estudios cualitativos, dado que la clase positiva es tan rara que una busqueda manual es poco eficiente.
- Investigacion educativa reproducible: forma parte de un esquema de aserciones auditables que permite replicar analisis sobre el TalkMoves Dataset con umbrales y metricas explicitos.
- Desarrollo profesional docente: generar informes agregados por sesion o por docente sobre el uso de estrategias de conteo, a partir de las probabilidades del modelo calibradas con un umbral adaptado al centro educativo.
- Construccion de datasets derivados: etiquetar corpus nuevos de habla docente en ingles para entrenar modelos posteriores o para estudios de mineria de datos educativos.
- Auditoria de calidad de anotaciones: comparar las predicciones del modelo con anotaciones humanas o de otros LLM para detectar discrepancias sistematicas en el codigo de dialogos.
- Filtrado en tiempo casi real: al ser un modelo de 109 M de parametros ejecutable en CPU, puede integrarse en servicios que procesen transcripciones en streaming por turnos, siempre que se acepte su precision limitada (0,625 en test).

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card y en el model-index (no verificados de forma independiente; `verified: false`). La metrica principal es la clase positiva, que representa el 0,8 % de las filas en test.

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 858 | 1,6 % | 0,857 | 0,857 | 0,857 | 0,966 | 0,897 |
| test | 2.144 | 0,8 % | 0,625 | 0,882 | 0,7317 | 0,8948 | 0,741 |

No se han publicado en la informacion disponible comparaciones con otros modelos sobre el mismo conjunto de evaluacion.

## Requisitos de hardware

- VRAM estimada: aproximadamente 438 MB en fp32 y 219 MB en fp16, calculados a partir de los 109.486.464 parametros. En int8 serian unos 110 MB, aunque el autor no distribuye variantes cuantizadas.
- GPU recomendadas: no requiere GPU. Cualquier GPU con 1-2 GB de memoria libre es suficiente (por ejemplo, GTX 1650, RTX 3050, T4). No tiene sentido reservar A100 o H100 para este modelo.
- Cabe en cualquier GPU de consumo e incluso en CPU: es un modelo apto para portatiles y entornos sin acelerador.
- Opciones de despliegue: libreria `setfit` (via `SetFitModel.from_pretrained`), exportacion a ONNX para servir con ONNX Runtime, serializacion con joblib para la cabeza logistica, o encapsulado en un servicio propio. vLLM, llama.cpp, Ollama y TGI estan orientados a modelos generativos y no aplican a este clasificador.
- Latencia y throughput: no disponibles. Al tratarse de un encoder de 109 M de parametros, la inferencia por frase es del orden de milisegundos en GPU y de decenas de milisegundos en CPU, pero no hay cifras publicadas por el autor.
- Para entrenamiento o reajuste: se puede reproducir en una unica GPU de consumo con precision mixta y batch size 16/32, segun los hiperparametros documentados.

## Comparativa con modelos similares

No hay resultados publicados de modelos alternativos sobre el mismo split de `assertions_llm_annotated_talkmoves`, por lo que la comparacion numerica no esta disponible. La tabla recoge las diferencias estructurales conocidas.

| Alternativa | Parametros | Contexto | Rendimiento en esta tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (SetFit + mpnet-base) | 109.486.464 | no disponible | F1 0,7317 / ROC-AUC 0,8948 en test | no disponible | HuggingFace, libreria setfit |
| SetFit con encoder mas pequeno (por ejemplo, MiniLM-L6) | no disponible | no disponible | no disponible | no disponible | requiere reentrenamiento |
| Clasificador de encoder completo afinado (por ejemplo, RoBERTa-base) | no disponible | no disponible | no disponible | no disponible | requiere reentrenamiento |
| Clasificacion zero/few-shot con un LLM generativo | segun el LLM | segun el LLM | no disponible sobre este split | segun el LLM | API o pesos abiertos |

## Limitaciones y advertencias

- Las etiquetas de entrenamiento y evaluacion provienen de anotadores LLM, no de codificadores humanos. El acuerdo entre anotadores para esta asercion es de Krippendorff's alpha = 0.757, lo que implica un techo de rendimiento y ruido en las etiquetas de referencia.
- El split de test contiene solo 17 ejemplos positivos, por lo que las metricas de test (precision 0,625, recall 0,882, F1 0,732) tienen un margen de error muy amplio y no deben interpretarse como estimaciones estables.
- Desbalance extremo de clases: la tasa base de la clase positiva es del 1,4 % global y del 0,8 % en test. Un clasificador trivial que prediga siempre la clase negativa obtendria una exactitud superior al 99 %, por lo que la exactitud no es una metrica informativa aqui.
- Precision limitada en test: con 0,625, aproximadamente uno de cada tres positivos predichos es incorrecto. En aplicaciones de alto coste conviene elevar el umbral de decision.
- Entrenado exclusivamente con intervenciones de docentes. El comportamiento sobre habla de estudiantes no ha sido evaluado.
- Solo ingles. No hay soporte multilingue, lo que limita su uso en aulas en castellano sin reentrenamiento.
- Licencia no disponible: no puede confirmarse la autorizacion para uso comercial. Debe aclararse con el autor antes de cualquier despliegue productivo.
- Dominio muy restringido: es un detector de una unica asercion (secuencia de conteo) en discurso de aula; no es un modelo de proposito general y no debe presentarse como tal.
- Riesgo de sesgo de dominio: el TalkMoves Dataset procede de un contexto educativo concreto (aulas de Estados Unidos, en ingles); la generalizacion a otros paises, niveles educativos o idiomas es incierta.
- Uso sobre datos de menores y grabaciones de aula exige cumplimiento de normativa de proteccion de datos (RGPD y equivalentes), independientemente de la licencia del modelo.
- La model card no documenta limites efectivos de longitud de secuencia ni comportamiento ante entradas truncadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_sentence_has_counting_sequence
- Dataset de anotaciones: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset (repositorio GitHub): https://github.com/SumnerLab/TalkMoves
- Libreria SetFit: https://github.com/huggingface/setfit
- Los resultados de busqueda web proporcionados no contienen enlaces relevantes para este modelo; tratan sobre herramientas de ChatGPT y no se han utilizado.
