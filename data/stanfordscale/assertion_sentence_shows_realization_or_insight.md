# StanfordSCALE/assertion_sentence_shows_realization_or_insight

## Resumen

`StanfordSCALE/assertion_sentence_shows_realization_or_insight` es un clasificador binario de texto desarrollado por la Stanford SCALE Initiative dentro del proyecto EduBehaviors, un conjunto de esquemas basados en aserciones para la codificacion auditable de dialogo en el aula. El modelo no genera texto: recibe una unica intervencion (utterance) de un docente y devuelve una etiqueta que indica si esa frase muestra realizacion o insight, es decir, si el hablante articula un descubrimiento o una comprension nueva. Se entrenó sobre un subconjunto del corpus TalkMoves anotado automaticamente con anotadores LLM.

Tecnicamente es un modelo SetFit: un encoder de frases `sentence-transformers/paraphrase-mpnet-base-v2` (arquitectura MPNet, 109.486.464 parametros) afinado con aprendizaje contrastivo y coronado por una regresion logistica como cabeza de clasificacion. El repositorio ocupa 0,4 GB y solo soporta ingles. Su relevancia es metodologica mas que de rendimiento: forma parte de una familia de clasificadores que documentan de manera explicita la fiabilidad de las etiquetas generadas por LLM, y en este caso el propio autor advierte que el acuerdo entre anotadores es pobre (alfa de Krippendorff de 0,080) y que el modelo no debe usarse de forma autonoma.

Las metricas publicadas confirman esa advertencia: en el split de test el F1 de la clase positiva es 0,2286, con una tasa base del 3,6 %. Es, por tanto, una herramienta de investigacion y de preanotacion asistida, no un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit: encoder de frases MPNet (paraphrase-mpnet-base-v2) + cabeza de regresion logistica |
| Parametros totales | 109.486.464 (dato real de safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; la entrada es una unica utterance por muestra |
| Tipos de cuantizacion | no disponible; no se publican variantes cuantizadas (GGUF, GPTQ, AWQ) |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea | text-classification (clasificacion binaria) |
| Modelo base | sentence-transformers/paraphrase-mpnet-base-v2 |
| Dataset de entrenamiento | StanfordSCALE/assertions_llm_annotated_talkmoves |
| Libreria | setfit |
| Autor | StanfordSCALE (Stanford SCALE Initiative) |
| Tamano del repositorio | 0,4 GB |
| Fecha de creacion | 2026-09-18 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo sigue el paradigma SetFit en dos fases. En la primera se afina el cuerpo (encoder MPNet preentrenado en pares de parafrasis) mediante aprendizaje contrastivo, con un learning rate de 2e-05, batch size de 16 y un maximo de 5000 pasos, usando precision mixta en GPU. En la segunda se congela el encoder y se entrena una cabeza de regresion logistica con learning rate de 0,01 y batch size de 32, durante 10 epocas en total y con semilla 20260904. La entrada se construye concatenando unicamente el texto de la intervencion, sin plantilla adicional.

Los datos proceden de un subconjunto del TalkMoves Dataset (intervenciones de docentes) anotado con anotadores LLM y distribuido en 3.434 filas de entrenamiento (53,4 %), 856 de desarrollo (13,3 %) y 2.144 de test (33,3 %). La clase positiva es extremadamente rara: la tasa base global es del 3,1 % (2,8 % en train, 3,5 % en dev, 3,6 % en test). No se documentan fases de RLHF ni DPO, algo coherente con un clasificador discriminativo. La innovacion relevante del proyecto no es arquitectonica sino de trazabilidad: cada asercion se publica junto a su metrica de acuerdo entre anotadores, de modo que el consumidor puede juzgar la calidad del etiquetado antes de usar el modelo.

## Capacidades

- Clasificacion binaria de una intervencion docente en ingles: predice si la frase muestra realizacion o insight (`predict`) y devuelve probabilidades por clase (`predict_proba`).
- Integracion en el paquete Python `EduBehaviors-kit` como parte de un esquema de codificacion de conductas educativas.
- Codificacion de discurso de aula (classroom discourse) y movimientos conversacionales, con etiquetas orientadas a auditar el dialogo pedagogico.
- Extraccion de representaciones de frase mediante el encoder MPNet subyacente, reutilizables para otras tareas de similitud semantica.
- No soporta generacion de texto, razonamiento multi-paso, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No soporta agentes ni planificacion; es un clasificador de una sola pasada.
- No dispone de modo de razonamiento explicito (thinking mode), audio ni multimodalidad.
- Capacidad multilingue nula: solo ingles.
- Especializacion muy estrecha: una unica asercion de un unico esquema, aplicable solo a intervenciones de docentes.

## Casos de uso

- Preanotacion de corpus de discurso de aula: el modelo etiqueta automaticamente grandes volumenes de transcripciones de clase para que un equipo humano revise solo los positivos, reduciendo el coste de codificacion manual. Es adecuado porque recibe texto plano sin preprocesado y devuelve probabilidades calibradas de forma aproximada, lo que permite fijar umbrales.
- Investigacion en ciencias del aprendizaje: analisis de la frecuencia con la que los docentes formulan realizaciones o insights a lo largo de una leccion y su correlacion con otras variables pedagogicas. El modelo permite procesar cohortes completas de transcripciones.
- Formacion y desarrollo profesional docente: generar informes exploratorios sobre el tipo de intervenciones que producen comprension en el aula, siempre con revision humana dado el bajo recall.
- Construccion de lineas base (baselines) en articulos sobre deteccion automatica de movimientos discursivos, comparando el rendimiento de un enfoque SetFit ligero frente a anotacion directa con LLM.
- Estudio de la fiabilidad de la anotacion automatica: el modelo y su dataset sirven como caso de analisis sobre que ocurre cuando se entrena un clasificador con etiquetas LLM de bajo acuerdo (alfa de Krippendorff de 0,080).
- Filtrado de candidatos en analisis cualitativo: seleccionar un subconjunto pequeno de intervenciones con alta probabilidad para inspeccion manual intensiva, dado que la precision de 0,4286 en test es superior a la tasa base.
- Componente auxiliar de un pipeline de codificacion auditable dentro de `EduBehaviors-kit`, combinado con otros clasificadores de aserciones para reconstruir el perfil completo de una intervencion.
- Prototipado rapido en investigacion educativa: el modelo cabe en CPU, se carga con la libreria `setfit` en pocas lineas y no requiere GPU para inferencia exploratoria.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index y en la model card (no verificados por terceros):

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 856 | 3,5 % | 0,357 | 0,167 | 0,227 | 0,775 | 0,237 |
| test | 2.144 | 3,6 % | 0,429 | 0,156 | 0,229 | 0,697 | 0,210 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones oficiales con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB. Los 109,5 M de parametros ocupan aproximadamente 438 MB en fp32 y 219 MB en fp16.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100, H100 ni similares. Una GTX 1650, RTX 3060 o superior ofrece margen de sobra.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo con 2 GB o mas de VRAM, e incluso en iGPU.
- Cabe en CPU: si, con latencia muy inferior al segundo por lote pequeno; el encoder MPNet es ligero.
- Opciones de despliegue: libreria `setfit` (`SetFitModel.from_pretrained`), `sentence-transformers` para el cuerpo, exportacion a ONNX o TorchScript, y servidores de inferencia compatibles con modelos de clasificacion (por ejemplo, TGI o vLLM en modo clasificador). No hay pesos GGUF, por lo que llama.cpp y Ollama no son aplicables sin conversion manual.
- Latencia y throughput estimados: no disponibles; no se publican mediciones en la model card.
- Almacenamiento: 0,4 GB de repositorio, trivial para cualquier entorno.

## Comparativa con modelos similares

No se dispone de resultados publicados de alternativas comparables en la informacion proporcionada. La tabla siguiente recoge la comparacion cualitativa posible, marcando como no disponible todo dato que no consta:

| Modelo | Tipo | Parametros | Contexto | F1 (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| assertion_sentence_shows_realization_or_insight | SetFit (MPNet + regresion logistica) | 109.486.464 | no disponible | 0,2286 | no disponible | HuggingFace |
| Otros clasificadores de aserciones de StanfordSCALE | SetFit | no disponible | no disponible | no disponible | no disponible | HuggingFace (familia EduBehaviors) |
| Anotador LLM usado para generar las etiquetas | LLM (modelo no identificado) | no disponible | no disponible | no disponible; su acuerdo con codificadores humanos es de alfa 0,080 | no disponible | no disponible |
| Clasificador supervisado clasico sobre embeddings MPNet congelados | encoder + sonda lineal | ~109 M (mismo encoder) | no disponible | no disponible | depende del encoder base | no disponible |

## Limitaciones y advertencias

- Fiabilidad del etiquetado muy baja: el alfa de Krippendorff de la asercion es 0,080, un valor que el propio autor califica de pobre. Las etiquetas proceden de anotadores LLM, no de codificadores humanos.
- Rendimiento insuficiente para uso autonomo: F1 de 0,2286 en test y recall de 0,1558 sobre una clase con tasa base del 3,6 %. La model card indica explicitamente que el modelo no funciona lo bastante bien como para usarse por si solo.
- Precision limitada: 0,4286 en test, de modo que mas de la mitad de las predicciones positivas seran falsos positivos.
- Desequilibrio de clases extremo: la clase positiva representa alrededor del 3 % de los datos, lo que favorece predicciones negativas y penaliza el recall.
- Dominio restringido: entrenado unicamente con intervenciones de docentes. El comportamiento sobre habla de estudiantes no se ha probado.
- Idioma unico: solo ingles; no hay soporte ni evaluacion en castellano u otras lenguas.
- Sin licencia declarada: la ausencia de licencia impide determinar si el uso comercial esta permitido. Debe tratarse como no autorizado hasta que el autor lo aclare.
- Riesgo de circularidad: si se usa para etiquetar datos que despues alimentan conclusiones sobre practicas docentes, se propagan los sesgos y errores del anotador LLM original.
- Sin variantes cuantizadas ni pesos GGUF publicados, lo que limita su despliegue en stacks de inferencia locales estandarizados.
- Sin garantias de calibracion de las probabilidades devueltas por `predict_proba`; cualquier umbral de decision debe validarse sobre datos propios.
- Advertencia general para produccion: debe emplearse exclusivamente en contextos de investigacion con supervision humana y con la incertidumbre documentada de forma visible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_sentence_shows_realization_or_insight
- Dataset de entrenamiento: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset (repositorio): https://github.com/SumnerLab/TalkMoves
- Cita del autor: Stanford SCALE Initiative, "Assertion classifier: sentence shows realization or insight", 2026.
- No se han encontrado otros enlaces relevantes en la busqueda web: el unico resultado devuelto no guarda relacion con este modelo.
