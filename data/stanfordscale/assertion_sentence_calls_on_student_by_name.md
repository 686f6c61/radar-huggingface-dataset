# StanfordSCALE/assertion_sentence_calls_on_student_by_name

## Resumen

`StanfordSCALE/assertion_sentence_calls_on_student_by_name` es un clasificador binario de texto desarrollado por la Stanford SCALE Initiative dentro del proyecto *EduBehaviors: Assertion-based schemas for auditable dialogue coding*. Su tarea es determinar si una intervencion docente contiene una asercion del tipo "llamar al alumno por su nombre" (por ejemplo, "Lets go Gavin"). No es un modelo generativo: es un componente de anotacion que etiqueta utterances de profesor con `True`/`False` y que se consume a traves del paquete Python `EduBehaviors-kit`.

Tecnicamente es un modelo SetFit: un encoder de frases `sentence-transformers/paraphrase-mpnet-base-v2` (109.486.464 parametros) seguido de una cabeza de regresion logistica. El entrenamiento combina una fase contrastiva sobre pares de frases y un ajuste posterior de la cabeza lineal, lo que permite obtener un clasificador de alta precision con muy pocos datos etiquetados. El corpus de entrenamiento son 3.432 ejemplos de entrenamiento, 858 de validacion y 2.144 de test procedentes del subconjunto anotado con LLM del TalkMoves Dataset, con una tasa base de la clase positiva del 5,4 %.

Su relevancia es acotada pero clara: los esquemas de "aserciones" permiten auditar y reproducir la codificacion del discurso de aula sin depender de un LLM en tiempo de inferencia, con un coste computacional minimo (el repositorio completo ocupa 0,4 GB) y una concordancia entre anotadores de Krippendorff's alpha de 0,918.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit: encoder de frases MPNet-base (transformer) + cabeza de regresion logistica |
| Parametros totales | 109.486.464 (encoder MPNet-base), mas la cabeza logistica |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea (pipeline) | text-classification |
| Etiquetas | binaria: asercion presente / ausente (`assertion_sentence_calls_on_student_by_name`) |
| Libreria | setfit |
| Modelo base | sentence-transformers/paraphrase-mpnet-base-v2 |
| Dataset de entrenamiento | StanfordSCALE/assertions_llm_annotated_talkmoves |
| Tamano del repositorio | 0,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo sigue el paradigma SetFit en dos fases. En la primera, el encoder `paraphrase-mpnet-base-v2` se ajusta con aprendizaje contrastivo (learning rate 2e-05, batch size 16, max steps 5.000) para separar representaciones de utterances con y sin la asercion. En la segunda, se congela el encoder y se entrena una cabeza `LogisticRegression` (learning rate 0,01, batch size 32) sobre los embeddings resultantes. El entrenamiento completo usa 10 epocas, semilla 20260904 y precision mixta activada en GPU. La entrada es la utterance en crudo, sin plantilla ni contexto adicional.

Los datos proceden del subconjunto anotado por LLM del TalkMoves Dataset, restringido a intervenciones de profesor: 3.432 filas de entrenamiento (53,3 %), 858 de validacion (13,3 %) y 2.144 de test (33,3 %). La etiqueta positiva es minoritaria: 5,9 % en train, 5,8 % en dev y 4,5 % en test, con una tasa base global del 5,4 %. Las etiquetas no son humanas sino generadas por anotadores LLM, con un Krippendorff's alpha de 0,918 entre anotadores. No se documenta uso de RLHF ni DPO, algo coherente con un clasificador discriminativo.

## Capacidades

- Clasificacion binaria de utterances de profesor para detectar la asercion "llamar al alumno por su nombre", devolviendo etiqueta y probabilidad (`predict` / `predict_proba`).
- Anotacion a escala de corpus de discurso de aula, con throughput muy alto al ser un encoder de 109 M de parametros.
- Integracion directa en el paquete `EduBehaviors-kit` como parte de un esquema de aserciones auditable.
- Funciona como componente de un pipeline mayor de codificacion de talk moves junto a otras aserciones del mismo proyecto.
- Inferencia reproducible: semilla y hiperparametros documentados, util para replicar experimentos.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni modo thinking.
- No tiene capacidades de vision, audio ni generacion de texto.
- Multilingue: unicamente ingles (`en`).

## Casos de uso

- Codificacion automatica de transcripciones de aula: el modelo etiqueta cada intervencion del docente y permite calcular la frecuencia con la que el profesor se dirige a un alumno por su nombre, una variable relevante en estudios de participacion equitativa en clase.
- Investigacion educativa a escala: sobre un corpus de miles de clases transcritas, el clasificador sustituye a la codificacion manual de esa asercion concreta, con un F1 de 0,889 en test y un coste de computo que cabe en CPU.
- Formacion y feedback docente: integrado en una herramienta de observacion, genera un informe automatico de cuantas intervenciones nominativas ha hecho el profesor por sesion, util en programas de desarrollo profesional.
- Filtrado previo en pipelines de anotacion humana: dado su ROC-AUC de 0,9804, se puede usar como primera pasada para priorizar las utterances candidatas antes de la revision de codificadores humanos.
- Monitorizacion en tiempo real de sesiones grabadas: al ser un encoder pequeno, se puede ejecutar sobre el flujo de transcripcion (ASR + clasificador) sin GPUs dedicadas.
- Construccion de datasets de investigacion: la salida puede emplearse para etiquetar grandes volumenes de dialogo educativo y despues ajustar otros modelos o analizar correlaciones con resultados de aprendizaje.
- Auditoria de reproducibilidad en esquemas de codificacion: al ser un modelo discriminativo con semilla fija, permite repetir exactamente la misma codificacion en distintos estudios, algo que no ocurre con un LLM anotador.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (campo `model-index` de la model card). Ninguno de ellos esta verificado por un tercero (`verified: false`). Dataset de evaluacion: `StanfordSCALE/assertions_llm_annotated_talkmoves`.

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 858 | 5,8 % | 0,786 | 0,880 | 0,830 | 0,995 | 0,913 |
| test | 2.144 | 4,5 % | 0,913 | 0,866 | 0,889 | 0,980 | 0,920 |

No se han publicado en la informacion disponible otros benchmarks (MMLU, HumanEval, GSM8K, etc.), que por otra parte no aplican a un clasificador de este tipo.

## Requisitos de hardware

- VRAM estimada para inferencia: 437,9 MB en fp32 (109.486.464 parametros x 4 bytes), 218,97 MB en fp16 y 109,5 MB en int8. Con overhead del runtime, menos de 1 GB en todos los casos.
- GPU recomendadas: cualquiera con al menos 2 GB de VRAM. Una RTX 3060, RTX 4090, T4, L4 o incluso una GPU integrada son mas que suficientes; A100 y H100 estan sobredimensionadas para este modelo.
- Cabe holgadamente en cualquier GPU de consumo, y tambien en CPU: es viable ejecutar inferencia por lotes en un portatil.
- Opciones de despliegue: API de `setfit` (`SetFitModel.from_pretrained`), `sentence-transformers` para extraer embeddings y entrenar la cabeza por separado, exportacion a ONNX Runtime para servir a gran escala. vLLM y TGI no son aplicables porque no es un modelo generativo autorregresivo.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al tratarse de un encoder de 109 M de parametros con secuencias cortas, el coste por ejemplo es de milisegundos en GPU y de decenas de milisegundos en CPU, aunque no hay cifras publicadas por el autor.

## Comparativa con modelos similares

No se dispone de datos publicados de alternativas directamente comparables en la informacion proporcionada. La tabla siguiente recoge lo que si esta documentado.

| Modelo | Parametros | Tarea | F1 test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| assertion_sentence_calls_on_student_by_name (este modelo) | 109,5 M | Clasificacion binaria de la asercion "llamar al alumno por nombre" | 0,889 | no disponible | HuggingFace, 0 descargas |
| sentence-transformers/paraphrase-mpnet-base-v2 (modelo base) | 109,5 M | Embeddings de frases; no produce la etiqueta | no disponible (no es un clasificador de esta etiqueta) | no disponible | HuggingFace |
| Otras aserciones del proyecto EduBehaviors (StanfordSCALE) | no disponible | Clasificacion de otras aserciones de discurso de aula | no disponible | no disponible | no disponible en la informacion proporcionada |
| Anotacion con LLM zero-shot sobre TalkMoves | no disponible | Misma tarea | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Las etiquetas de entrenamiento provienen de anotadores LLM, no de codificadores humanos. El modelo aprende, por tanto, los sesgos del anotador automatico, aunque la concordancia reportada sea alta (Krippendorff's alpha 0,918).
- Entrenado exclusivamente con intervenciones de profesor. El comportamiento sobre habla de alumnos no ha sido evaluado y no deberia asumirse.
- Unicamente ingles. Cualquier uso sobre transcripciones en castellano u otros idiomas carece de validacion.
- Clase positiva muy minoritaria (4,5 % en test; 5,4 % global). Precision y recall dependen fuertemente del umbral de decision elegido; el F1 de 0,889 corresponde al umbral por defecto y a la clase positiva.
- Los resultados de benchmark estan declarados por el autor y marcados como no verificados (`verified: false`). No hay evaluacion independiente.
- Licencia no disponible: no se puede confirmar que el uso comercial este permitido. Conviene contactar con la Stanford SCALE Initiative antes de integrarlo en un producto.
- Sin informacion sobre sesgos demograficos, de genero, raza o acento en los datos de entrenamiento, un aspecto critico en un modelo que codifica interacciones profesor-alumno.
- Modelo muy especializado: no es util fuera de la tarea concreta de deteccion de esta asercion en discurso de aula en ingles.
- El repositorio no publica pesos cuantizados ni versiones ONNX listas para produccion; habria que generarlas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_sentence_calls_on_student_by_name
- Dataset de entrenamiento: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset (codigo): https://github.com/SumnerLab/TalkMoves
- Paquete Python `EduBehaviors-kit`: mencionado en la model card, sin URL publica disponible
- Citacion:
  ```bibtex
  @misc{assertion_sentence_calls_on_student_by_name,
    author = {Stanford SCALE Initiative},
    title  = {Assertion classifier: sentence calls on student by name},
    year   = {2026},
    url    = {https://huggingface.co/StanfordSCALE/assertion_sentence_calls_on_student_by_name}
  }
  ```
- Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los unicos enlaces recuperados correspondian a paginas no relacionadas (listados de glitches de videojuegos), por lo que no se incluyen.
