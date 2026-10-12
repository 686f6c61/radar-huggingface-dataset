# StanfordSCALE/assertion_asks_one_or_more_students_for_an_explanation_of_how_a_method_works

## Resumen

Este modelo es un clasificador de texto binario entrenado con la libreria SetFit para detectar una conducta discursiva concreta en el aula: si una intervencion docente pide a uno o varios estudiantes que expliquen como funciona un metodo. No es un modelo generativo ni un LLM conversacional, sino un encoder de frases (sentence-transformers/paraphrase-mpnet-base-v2) acompanado de un cabezal de regresion logistica que devuelve una probabilidad por clase. Lo desarrolla la Stanford SCALE Initiative dentro del proyecto EduBehaviors, un conjunto de esquemas de anotacion basados en aserciones para el codigo de dialogo auditable, y se distribuye a traves del paquete Python EduBehaviors-kit.

El modelo tiene 109.486.464 parametros (unos 0,4 GB de repositorio) y se entrena sobre una anotacion automatica con LLM de un subconjunto de intervenciones de profesor del TalkMoves Dataset. El conjunto de datos StanfordSCALE/assertions_llm_annotated_talkmoves contiene 13.180 ejemplos de entrenamiento, 3.294 de desarrollo y 8.241 de test, con una tasa base de la clase positiva muy baja (2,0 % global). Es relevante porque ejemplifica un patron creciente: usar embeddings congelados y un cabezal lineal para convertir etiquetas generadas por LLM en clasificadores ligeros, auditables y desplegables en CPU para analitica educativa a escala.

La relevancia practica esta en su coste: al ser un clasificador de 109 M de parametros con cabezal logistico, se puede ejecutar sobre transcripciones completas de clases sin infraestructura de GPU dedicada, algo inviable con un LLM generativo por cada turno de dialogo. Su limitacion principal es que las etiquetas proceden de anotadores LLM y no de codificadores humanos, con una fiabilidad entre anotadores de 0,728 medida con alfa de Krippendorff.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer de frases (MPNet) con cabezal de regresion logistica, entrenado con el procedimiento SetFit (fase contrastiva + ajuste del cabezal) |
| Parametros totales | 109.486.464 |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la informacion proporcionada; es un modelo de clasificacion de frases basado en encoder, no generativo |
| Tipos de cuantizacion | No disponible; el repositorio se distribuye en safetensors a precision completa (no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Tarea | Text-classification (clasificacion binaria de asercion) |
| Modelo base | sentence-transformers/paraphrase-mpnet-base-v2 |
| Cabezal | LogisticRegression |
| Dataset de entrenamiento | StanfordSCALE/assertions_llm_annotated_talkmoves |
| Tamano del repositorio | 0,4 GB |
| Fecha de creacion | 2026-10-12 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura combina un encoder MPNet preentrenado para similitud de frases (paraphrase-mpnet-base-v2) con un cabezal de regresion logistica, siguiendo el paradigma SetFit: primero se ajusta el cuerpo del encoder con aprendizaje contrastivo sobre pares de frases de la misma clase y de clases distintas, y despues se congela y se entrena unicamente el clasificador lineal. Los hiperparametros declarados son un learning rate de 2e-05 para el cuerpo y 0,01 para el cabezal, batch size de 16 en la fase contrastiva y 32 en el cabezal, 10 epocas, un maximo de 5.000 pasos en la fase contrastiva, 100 pasos maximos de evaluacion, semilla 20260904 y precision mixta activada en GPU. La entrada es la intervencion literal, sin plantilla ni prefijo: el texto se pasa tal cual.

Los datos proceden del TalkMoves Dataset, restringidos a intervenciones de profesor y anotados automaticamente por LLM para cada asercion del conjunto top-down `td`. El identificador interno de la asercion es `td__the_utterance_asks_one_or_more_students_for_an_explanation_of_how_a_method_works`. Los tamanos de split son 13.180 filas (53,3 %) en train, 3.294 (13,3 %) en dev y 8.241 (33,3 %) en test, con tasas base del 1,9 %, 1,9 % y 2,1 % respectivamente. No se documenta en la informacion disponible el uso de RLHF ni de DPO, algo esperable dado que no es un modelo generativo.

## Capacidades

- Clasificacion binaria de una unica asercion: determina si una intervencion pide explicacion de como funciona un metodo.
- Salida probabilistica mediante `predict_proba`, ademas de la etiqueta discreta con `predict`.
- Procesamiento de texto en ingles a nivel de intervencion individual, sin contexto multi-turno.
- Integracion con el ecosistema setfit y sentence-transformers (carga con `SetFitModel.from_pretrained`).
- Uso previsto a traves del paquete Python EduBehaviors-kit como parte de un conjunto de clasificadores de conductas educativas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento: es un clasificador discriminativo.
- Capacidad multilingue: no; el modelo declara unicamente ingles.

## Casos de uso

- Analitica de discurso en el aula a escala: procesar transcripciones completas de sesiones lectivas y cuantificar que proporcion de intervenciones docentes solicita explicaciones de procedimiento, usando el clasificador sobre cada turno de forma independiente.
- Formacion docente y retroalimentacion: generar informes por sesion que muestren la frecuencia de peticiones de explicacion, para que el profesorado revise patrones de indagacion en su practica.
- Investigacion educativa reproducible: incorporar el clasificador como etiquetador de bajo coste en estudios longitudinales sobre discurso matematico, aprovechando que el modelo se puede ejecutar en CPU y sobre lotes grandes.
- Preetiquetado para anotacion humana: usar `predict_proba` para priorizar las intervenciones con mayor probabilidad de contener la asercion, reduciendo el volumen de revision manual antes de la codificacion final.
- Construccion de taxonomias de conducta docente: combinarlo con los otros clasificadores de aserciones de la misma coleccion para perfilizar sesiones segun multiples dimensiones del dialogo.
- Auditoria de calidad del dialogo educativo: detectar sesiones con escasa demanda de explicacion al alumnado como senal para revision pedagogica.
- Filtrado en pipelines de datos: descartar o marcar automaticamente intervenciones irrelevantes en corpus de transcripciones antes de alimentar otros analisis.
- Despliegue en entornos con recursos limitados: al requerir menos de 1 GB de memoria, puede ejecutarse en portatiles o en el propio centro educativo sin GPU.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index y en la model card (no verificados de forma independiente):

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 3.294 | 1,9 % | 0,714 | 0,625 | 0,667 | 0,922 | 0,693 |
| test | 8.241 | 2,1 % | 0,675 | 0,591 | 0,630 | 0,939 | 0,635 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni son aplicables a un modelo discriminativo de este tipo.

## Requisitos de hardware

- Pesos en precision completa: aproximadamente 0,44 GB (109,5 M de parametros en fp32); en fp16, unos 0,22 GB.
- VRAM estimada para inferencia: por debajo de 1 GB incluyendo activaciones y el cabezal logistico; la mayor parte del consumo dependera del batch size.
- GPU recomendadas: cualquier GPU moderna sirve; no requiere A100 ni H100. Una T4, una RTX 3060 o incluso una GPU integrada son suficientes. El entrenamiento original, segun la model card, uso GPU con precision mixta.
- Cabe en GPU de consumo: si, con amplio margen; tambien funciona en CPU para inferencia por lotes pequenos o moderados.
- Opciones de despliegue: setfit y sentence-transformers en Python, exportacion a ONNX Runtime o TorchScript para servir sin dependencias de PyTorch, y endpoints de Hugging Face. vLLM, llama.cpp, Ollama y TGI no son aplicables: no hay pesos GGUF ni generacion autoregresiva.
- Latencia y throughput: no disponibles. Al tratarse de un encoder de 109 M de parametros, la latencia esperada por intervencion es del orden de milisegundos en GPU y decenas de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada. La comparacion se limita a caracteristicas estructurales verificables:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|
| StanfordSCALE/assertion_asks_one_or_more_students_for_an_explanation_of_how_a_method_works | 109.486.464 | No disponible | No disponible | Hugging Face, libreria setfit | F1 0,630 y ROC-AUC 0,939 en test (declarados por el autor) |
| sentence-transformers/paraphrase-mpnet-base-v2 (modelo base) | No disponible en la informacion proporcionada | No disponible | No disponible | Hugging Face | No disponible; es un modelo de embeddings, no un clasificador de la asercion |
| Otros clasificadores de aserciones de StanfordSCALE | No disponible | No disponible | No disponible | Hugging Face | No disponible en la informacion proporcionada |

## Limitaciones y advertencias

- Las etiquetas provienen de anotadores LLM, no de codificadores humanos; el acuerdo entre anotadores es de 0,728 segun alfa de Krippendorff, lo que fija un techo practico a la calidad del clasificador.
- Tasa base muy baja (2,0 % global): el modelo opera en un regimen fuertemente desbalanceado, con precision 0,675 y recall 0,591 en test. Ajustar el umbral de decision segun el coste relativo de falsos positivos y falsos negativos es imprescindible en produccion.
- Entrenado exclusivamente con intervenciones de profesor; el comportamiento sobre habla de estudiantes no esta probado.
- Solo ingles: cualquier uso sobre transcripciones en castellano u otros idiomas carece de validacion.
- Licencia no disponible: no se puede confirmar que el uso comercial este permitido. Conviene contactar con el autor antes de integrarlo en un producto.
- Benchmarks declarados por el autor y marcados como no verificados en el model-index.
- No es un modelo generativo: no puede resumir, redactar ni mantener conversaciones; solo emite una probabilidad binaria por intervencion.
- El repositorio registra 0 descargas y 0 likes, y las fechas de creacion y actualizacion son practicamente identicas (2026-10-12), lo que sugiere un artefacto recien publicado y sin validacion externa por parte de la comunidad.
- La estructura de la asercion es muy especifica; generalizar a formulaciones distintas de la misma conducta depende por completo de la distribucion del corpus de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StanfordSCALE/assertion_asks_one_or_more_students_for_an_explanation_of_how_a_method_works
- Dataset de anotaciones: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset (codigo y datos originales): https://github.com/SumnerLab/TalkMoves
- Paquete Python EduBehaviors-kit: mencionado en la model card, sin URL publica en la informacion disponible
- Paper o publicacion asociada al proyecto EduBehaviors: no disponible en la informacion proporcionada
- La busqueda web realizada no devolvio resultados relevantes para este modelo; los enlaces devueltos no guardaban relacion con el contenido de la ficha y se han descartado.
