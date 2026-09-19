# StanfordSCALE/assertion_sentence_repeats_or_revoices_prior_speech

## Resumen

El modelo `StanfordSCALE/assertion_sentence_repeats_or_revoices_prior_speech` es un clasificador binario de texto desarrollado por la Stanford SCALE Initiative dentro del proyecto EduBehaviors, un marco de esquemas basados en aserciones para la codificacion auditable de dialogo educativo. Su tarea concreta es determinar si un enunciado de un docente repite o reformula una intervencion previa en el aula. No es un modelo generativo: se trata de un clasificador SetFit compuesto por un cuerpo Sentence Transformer y una cabeza de regresion logistica.

Tecnicamente se apoya en `sentence-transformers/paraphrase-mpnet-base-v2` como modelo base, con 109.486.464 parametros totales y un repositorio de 0,4 GB en formato safetensors. La etiquetacion del corpus de entrenamiento se genero con anotadores LLM sobre un subconjunto de intervenciones de profesor del dataset TalkMoves, con un alpha de Krippendorff de 0,419 entre anotadores.

Su relevancia es acotada y muy especifica: sirve como componente dentro del paquete `EduBehaviors-kit` para investigacion sobre discurso en el aula, no como solucion autonoma. Los propios autores advierten que el F1 de 0,313 en test no es suficiente para usarlo en solitario, por lo que su valor practico esta en la preanotacion y el filtrado asistido por humano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit: cuerpo Sentence Transformer (paraphrase-mpnet-base-v2) + cabeza LogisticRegression |
| Parametros totales | 109.486.464 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (viene determinada por el modelo base MPNet) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea (pipeline) | text-classification (clasificacion binaria) |
| Modelo base | sentence-transformers/paraphrase-mpnet-base-v2 |
| Libreria | setfit |
| Tamano del repositorio | 0,4 GB |
| Dataset de entrenamiento | StanfordSCALE/assertions_llm_annotated_talkmoves |
| Columnas de salida | `assertion_sentence_repeats_or_revoices_prior_speech`, `split_sentence_repeats_or_revoices_prior_speech` |

## Arquitectura y entrenamiento

El modelo sigue el paradigma SetFit: en lugar de un transformer con cabeza de clasificacion entrenada de extremo a extremo sobre pares texto-etiqueta, se entrena primero el cuerpo mediante aprendizaje contrastivo con pocos ejemplos por clase y despues se ajusta una cabeza de regresion logistica sobre los embeddings resultantes. El cuerpo parte de `sentence-transformers/paraphrase-mpnet-base-v2`, un Sentence Transformer basado en MPNet orientado a similitud semantica de frases. La cabeza es una `LogisticRegression`, con learning rate de 0,01, mientras que el cuerpo usa un learning rate de 2e-05. El entrenamiento se ejecuto durante 10 epocas, con batch size de 16 en la fase contrastiva y 32 en la fase de cabeza, un maximo de 5000 pasos en la fase contrastiva, 100 pasos maximos de evaluacion, semilla 20260904 y precision mixta activada en GPU.

Los datos proceden de un subconjunto anotado por LLM de intervenciones de profesor del TalkMoves Dataset. El reparto es de 3430 filas de entrenamiento (53,3 %), 858 de desarrollo (13,3 %) y 2146 de test (33,4 %). La tasa base de la clase positiva (la asercion se cumple) es del 10,8 % global: 10,8 % en train, 10,0 % en dev y 11,1 % en test. La anotacion no es humana: las etiquetas las generaron anotadores LLM y el acuerdo entre ellos es de 0,419 segun el alpha de Krippendorff, un valor bajo que condiciona directamente el techo de rendimiento del clasificador. No se documenta en la informacion disponible el uso de RLHF ni de DPO, algo por otra parte ajeno a este tipo de clasificador.

## Capacidades

- Clasificacion binaria de enunciados docentes: dado un texto, devuelve 1 si la asercion "el enunciado repite o reformula una intervencion previa" se cumple, y 0 en caso contrario.
- Probabilidades calibradas por clase mediante `predict_proba`, lo que permite aplicar umbrales distintos segun el coste relativo de falsos positivos y falsos negativos.
- Procesamiento de enunciados individuales tal cual se reciben, sin plantilla de prompt ni formato especial de entrada.
- Integracion con el paquete Python `EduBehaviors-kit` para flujos de codificacion de dialogo educativo.
- No dispone de generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No esta disenado para agentes ni razonamiento multi-paso.
- Multilingue: no; unicamente ingles.
- Capacidades especiales (modo thinking, vision, audio): ninguna.

## Casos de uso

- Preanotacion de corpus de discurso en el aula: el clasificador etiqueta de forma automatica miles de intervenciones docentes y los investigadores revisan despues unicamente los casos positivos y los de probabilidad intermedia, reduciendo el coste de codificacion manual.
- Investigacion en educacion matematica: analisis de como los docentes reformulan las contribuciones de los estudiantes para avanzar en la discusion, usando las probabilidades del modelo como variable cuantitativa en estudios longitudinales.
- Construccion de pipelines de codificacion auditable dentro de `EduBehaviors-kit`: la asercion se encadena con otras aserciones del mismo marco para reconstruir esquemas de comportamiento docente completos.
- Filtrado de candidatos para formacion docente: seleccionar fragmentos de transcripcion donde se produce reformulacion del discurso previo, para usarlos como material de reflexion en programas de desarrollo profesional.
- Analisis de calidad de la interaccion en plataformas de ensenanza online: con supervision humana y umbral conservador, detectar automaticamente si un instructor reformula lo dicho por el alumnado en clases grabadas o tutorias transcritas.
- Evaluacion comparativa de tecnicas de anotacion: al ser un modelo entrenado sobre etiquetas LLM, sirve como referencia para medir la brecha entre anotacion automatica y codificacion experta en tareas de discurso educativo.
- Extraccion de caracteristicas para estudios mixtos: usar la probabilidad de la clase positiva como variable continua en modelos estadisticos de segundo nivel sobre transcripciones de aula.

En todos los casos el modelo debe utilizarse como asistente de anotacion con revision humana, dado que los propios autores indican que no funciona lo bastante bien para usarse en solitario.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 858 | 10,0 % | 0,327 | 0,395 | 0,358 | 0,728 | 0,287 |
| test | 2146 | 11,1 % | 0,324 | 0,303 | 0,313 | 0,677 | 0,273 |

No se han publicado en la informacion disponible resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros), que por otra parte no aplican a un clasificador de este tipo.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,44 GB en fp32 y 0,22 GB en fp16 para los 109,5 M de parametros, mas el coste de activaciones y tokenizacion. Son estimaciones derivadas del numero de parametros.
- GPU recomendadas: no se requieren. Cualquier GPU con 1-2 GB de VRAM libre es suficiente; una GTX 1050, una T4 o incluso una GPU integrada moderna pueden ejecutar la inferencia.
- Cabe en GPU de consumo: si, sin ninguna dificultad, en cualquier tarjeta consumer actual e incluso en equipos sin GPU dedicada.
- Inferencia en CPU: totalmente viable para lotes moderados, dado el reducido tamano del modelo. No se dispone de cifras de latencia o throughput publicadas.
- Opciones de despliegue: inferencia directa con la libreria `setfit` (`SetFitModel.from_pretrained`). Al publicarse los pesos en safetensors, es posible desplegarlo con los mecanismos estandar del ecosistema de Sentence Transformers. La informacion disponible no documenta integraciones especificas con vLLM, llama.cpp, Ollama o TGI, que no son aplicables al no tratarse de un modelo generativo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de modelos comparables en la informacion proporcionada. La unica referencia directa es el modelo base del que deriva:

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| StanfordSCALE/assertion_sentence_repeats_or_revoices_prior_speech | 109,5 M | Clasificacion binaria de reformulacion del discurso docente | no disponible | no disponible | HuggingFace (0 descargas, 0 likes) |
| sentence-transformers/paraphrase-mpnet-base-v2 | 109,5 M (mismo orden) | Sentence embeddings para similitud semantica | no disponible | no disponible | HuggingFace |

No se han identificado en la busqueda web otros clasificadores equivalentes de aserciones de discurso en el aula con los que establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Las etiquetas proceden de anotadores LLM, no de codificadores humanos. El acuerdo entre anotadores es de 0,419 (alpha de Krippendorff), un valor bajo que limita el techo alcanzable por el modelo.
- El F1 en test es 0,313 y el ROC-AUC, 0,677. Los propios autores indican explicitamente que el modelo no funciona lo bastante bien para usarse por si solo.
- Entrenado unicamente con intervenciones de profesor; el comportamiento sobre habla de estudiantes no esta probado.
- La tasa base de la clase positiva es del 10,8 %, por lo que la metrica de exactitud (accuracy) seria enganosa; hay que evaluar con F1, precision, recall y average precision.
- Riesgo de falsos positivos y falsos negativos elevado: con precision 0,324 en test, aproximadamente dos de cada tres predicciones positivas serian incorrectas en ese split.
- Idiomas: solo ingles. No hay evidencia de funcionamiento en castellano ni en otros idiomas.
- Licencia no disponible: no se puede confirmar si se permite el uso comercial. Conviene contactar con el autor antes de cualquier despliegue productivo.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; sin validacion externa por parte de la comunidad.
- Uso responsable: cualquier aplicacion en evaluacion docente deberia tratar las salidas como indicios estadisticos y no como juicios sobre el desempeno del profesorado.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/StanfordSCALE/assertion_sentence_repeats_or_revoices_prior_speech)
- [Dataset StanfordSCALE/assertions_llm_annotated_talkmoves](https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves)
- [Modelo base sentence-transformers/paraphrase-mpnet-base-v2](https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2)
- [TalkMoves Dataset (SumnerLab)](https://github.com/SumnerLab/TalkMoves)
- Paquete Python `EduBehaviors-kit`: mencionado en la model card, sin URL publica en la informacion disponible
- Paper o publicacion tecnica de EduBehaviors: no disponible en la informacion proporcionada

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces recuperados correspondian a paginas corporativas sin relacion con el contenido de esta ficha.
