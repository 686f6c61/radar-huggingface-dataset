# StanfordSCALE/assertion_reads_a_text_aloud

## Resumen

assertion_reads_a_text_aloud es un clasificador binario de texto desarrollado por la Stanford SCALE Initiative dentro del proyecto EduBehaviors, un conjunto de esquemas basados en aserciones para la codificacion auditable de dialogo educativo. Su funcion concreta es determinar si un enunciado de un docente implica que este lee un texto en voz alta (identificador de asercion `bu5__reads_a_text_aloud`, perteneciente al conjunto bottom-up `bu5`). No es un modelo generativo: es un encoder de frases con una cabeza de clasificacion entrenada con la tecnica SetFit.

El modelo parte de sentence-transformers/paraphrase-mpnet-base-v2 (109.486.464 parametros) y anade una regresion logistica como cabeza. Se entreno sobre un subconjunto de enunciados de profesor anotados por LLM a partir del TalkMoves Dataset, con 13.181 ejemplos de entrenamiento, 3.297 de validacion y 8.237 de test, y una tasa base de la clase positiva del 1,6%, lo que lo convierte en un problema claramente desbalanceado. Se integra mediante el paquete de Python EduBehaviors-kit y la libreria setfit.

Su relevancia es practica y de nicho: permite escalar el etiquetado de movimientos discursivos en aulas, una tarea que tradicionalmente se hace a mano y que resulta costosa en investigacion educativa. En el conjunto de test obtiene un F1 de 0,532 y un ROC-AUC de 0,830 para la clase positiva, con precision 0,594 y recall 0,481.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SetFit: encoder transformer mpnet (sentence-transformers/paraphrase-mpnet-base-v2) mas cabeza de regresion logistica |
| Parámetros totales | 109.486.464 (unos 109,5 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card |
| Tipos de cuantización | no disponible; el repositorio publica pesos en safetensors sin variantes cuantizadas documentadas |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria setfit) |
| Tarea | text-classification (clasificacion binaria) |
| Etiqueta de salida | assertion_reads_a_text_aloud (True/False) |
| Modelo base | sentence-transformers/paraphrase-mpnet-base-v2 |
| Dataset de entrenamiento | StanfordSCALE/assertions_llm_annotated_talkmoves |
| Tamaño del repositorio | 0,4 GB |
| Idiomas de la model card | en |

## Arquitectura y entrenamiento

La arquitectura sigue el paradigma SetFit: en una primera fase contrastiva se ajusta el cuerpo del encoder (sentence-transformers/paraphrase-mpnet-base-v2), y en una segunda fase se entrena una cabeza de regresion logistica sobre las representaciones generadas. Los hiperparámetros declarados son learning rate del cuerpo 2e-05, learning rate de la cabeza 0,01, batch size 16 en la fase contrastiva y 32 en la cabeza, 10 epochs, max steps 5000 en la fase contrastiva, eval max steps 100, semilla 20260904 y precision mixta activada en GPU. La entrada se compone simplemente del enunciado sin plantilla adicional (`{utterance}`), lo que simplifica el preprocesado en produccion.

Los datos proceden de un subconjunto anotado por LLM de enunciados de profesor del TalkMoves Dataset. El reparto es de 13.181 filas de entrenamiento (53,3%), 3.297 de validacion (13,3%) y 8.237 de test (33,3%), con una tasa base de la clase positiva del 1,6% global (1,6% en train, 1,5% en dev y 1,6% en test). La concordancia entre anotadores medida con alfa de Krippendorff es de 0,566, un valor moderado que refleja la dificultad intrínseca de la asercion. No se documenta uso de RLHF ni de DPO, ya que no se trata de un modelo generativo.

## Capacidades

- Clasificacion binaria de enunciados docentes: predice si el enunciado implica que el profesor lee un texto en voz alta.
- Salida probabilistica mediante `predict_proba`, lo que permite fijar umbrales distintos segun el coste relativo de falsos positivos y falsos negativos.
- Deteccion sobre texto plano en ingles, sin necesidad de metadatos adicionales ni de contexto multi-turno.
- Integracion con la libreria setfit (`SetFitModel.from_pretrained`) y con el paquete EduBehaviors-kit para el etiquetado de movimientos de dialogo educativo.
- Codificacion auditable dentro del esquema de aserciones EduBehaviors, con identificador de asercion estable (`bu5__reads_a_text_aloud`).
- No dispone de generacion de texto, razonamiento multi-paso, tool calling, capacidades de agente, vision ni audio.

## Casos de uso

- Anotacion a escala de discurso de aula: clasificar transcripciones completas de clases para marcar los momentos en que el docente lee un texto en voz alta, sustituyendo parte del trabajo manual de codificacion.
- Investigacion educativa: cuantificar la frecuencia y la distribucion de esta practica en corpus amplios de TalkMoves u otros corpus de habla docente en ingles.
- Pre-anotacion para anotadores humanos: usar la salida del clasificador como primera pasada y reservar la revision humana para los casos con probabilidad intermedia, reduciendo coste y tiempo de etiquetado.
- Formacion y desarrollo profesional docente: generar informes de retroalimentacion sobre practicas de lectura en voz alta a partir de grabaciones transcritas de sesiones.
- Monitorizacion de fidelidad de implementacion curricular: comprobar en que medida los materiales que exigen lectura en voz alta se aplican realmente en el aula.
- Segmentacion e indexado de material educativo: localizar fragmentos de transcripciones en los que se lee un texto, para construir indices o permitir busquedas sobre el contenido.
- Filtrado previo en pipelines de analisis de discurso: descartar o etiquetar segmentos irrelevantes antes de aplicar analisis mas costosos (por ejemplo, un LLM grande) sobre el resto de movimientos de dialogo.
- Analisis longitudinal: comparar la incidencia de la lectura en voz alta entre distintos periodos, asignaturas o grupos de docentes dentro de un mismo corpus.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (metrica no verificada de forma independiente):

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 3.297 | 1,5% | 0,628 | 0,540 | 0,581 | 0,884 | 0,555 |
| test | 8.237 | 1,6% | 0,594 | 0,481 | 0,532 | 0,830 | 0,480 |

El ROC-AUC de 0,830 en test indica una capacidad de discriminacion razonable pese al fuerte desbalance de clases, mientras que el F1 de 0,532 y el average precision de 0,480 muestran que el rendimiento en la clase positiva es moderado. No se han publicado en la informacion disponible resultados comparativos con otros clasificadores para esta misma asercion.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 0,44 GB solo para los pesos (109,5 M de parametros x 4 bytes), mas el overhead del runtime; en la practica, menos de 1 GB.
- VRAM estimada en fp16: aproximadamente 0,22 GB para los pesos; en la practica, menos de 1 GB.
- Cabe con holgura en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPU integradas o en CPU.
- Inferencia en CPU perfectamente viable para lotes pequenos o medianos, dado el tamano del encoder.
- Despliegue: libreria setfit y sentence-transformers para uso directo; exportacion a ONNX mediante las herramientas habituales del ecosistema Hugging Face; Hugging Face Inference Endpoints para servicio gestionado.
- vLLM, llama.cpp, Ollama y TGI no son aplicables a este modelo: son soluciones orientadas a decoders generativos, y aqui se trata de un encoder con cabeza de clasificacion.
- Latencia y throughput concretos: no disponibles en la informacion proporcionada.
- Repositorio de 0,4 GB, lo que facilita el despliegue en contenedores y en entornos con almacenamiento limitado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | F1 test | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| StanfordSCALE/assertion_reads_a_text_aloud | 109,5 M | no disponible | Clasificacion binaria de la asercion bu5 | 0,532 | no disponible | Hugging Face |
| sentence-transformers/paraphrase-mpnet-base-v2 | 109,5 M | no disponible en la informacion disponible | Generacion de embeddings de frase | no aplica (no es clasificador) | Apache-2.0 segun su propia model card | Hugging Face |
| Otros clasificadores de aserciones EduBehaviors (misma familia) | no disponible | no disponible | Clasificacion binaria de otras aserciones | no disponible | no disponible | Hugging Face (StanfordSCALE) |

No se dispone de resultados publicados de alternativas directas (por ejemplo, clasificadores supervisados entrenados sobre el mismo subconjunto anotado, o enfoques zero-shot con LLM) en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Las etiquetas proceden de anotadores LLM, no de codificadores humanos; la concordancia entre anotadores es de solo 0,566 segun alfa de Krippendorff, lo que acota el techo de rendimiento alcanzable.
- El modelo se entreno exclusivamente con enunciados de profesor. Su comportamiento sobre intervenciones de estudiantes no se ha evaluado y no esta respaldado por datos.
- Fuerte desbalance de clases: la clase positiva representa el 1,6% de los ejemplos, lo que explica un recall de 0,481 y un F1 de 0,532 en test; conviene ajustar el umbral de decision segun el caso de uso.
- Solo soporta ingles; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- La licencia no esta disponible, por lo que el uso comercial queda en incertidumbre hasta que el autor la expliciten; conviene contactar con el equipo antes de integrarlo en un producto.
- Riesgo de alucinacion no aplica en sentido generativo, pero si existe riesgo de falsos positivos y falsos negativos derivado del rendimiento medido y de la ambiguedad de la propia asercion.
- La model card no especifica la longitud maxima de secuencia, de modo que el tratamiento de enunciados muy largos debe validarse empiricamente antes de desplegarlo.
- Modelo de nicho y sin descargas ni valoraciones registradas en el momento de redactar esta ficha, lo que limita la validacion por parte de terceros.
- Para produccion se recomienda congelar la version del modelo (revision concreta del repositorio), monitorizar la deriva de la distribucion de entrada y mantener una muestra auditada por humanos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StanfordSCALE/assertion_reads_a_text_aloud
- Dataset de anotaciones: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset (SumnerLab): https://github.com/SumnerLab/TalkMoves
- Paquete EduBehaviors-kit: mencionado en la model card, sin URL disponible en la informacion proporcionada
- Paper o publicacion asociada: no disponible en la informacion proporcionada
