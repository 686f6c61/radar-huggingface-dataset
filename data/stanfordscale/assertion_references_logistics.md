# StanfordSCALE/assertion_references_logistics

## Resumen

StanfordSCALE/assertion_references_logistics es un clasificador binario de texto en ingles publicado por la Stanford SCALE Initiative. Forma parte del marco "EduBehaviors: Assertion-based schemas for auditable dialogue coding", cuyo objetivo es codificar de forma auditable el discurso de aula mediante aserciones verificables. En concreto, este modelo detecta la asercion `bu5__references_logistics`: si una intervencion del docente hace referencia a cuestiones logisticas del aula (por ejemplo, "Let me shut this off").

Tecnicamente es un modelo SetFit: el cuerpo es el encoder de frases `sentence-transformers/paraphrase-mpnet-base-v2` (arquitectura MPNet, ~109,5 millones de parametros en total), afinado con aprendizaje contrastivo, y sobre el que se anade una cabeza de clasificacion `LogisticRegression`. La salida es una probabilidad para la clase positiva junto con la etiqueta binaria.

Su relevancia es acotada y de nicho: no es un modelo generativo de proposito general, sino una pieza de instrumentacion para investigacion educativa que permite etiquetar grandes volumenes de transcripciones de clase de forma automatica y reproducible, sustituyendo codificacion manual costosa. Se distribuye bajo licencia no disponible y esta entrenado exclusivamente sobre intervenciones de docentes en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit sobre encoder MPNet (paraphrase-mpnet-base-v2) + cabeza LogisticRegression |
| Parametros totales | 109.486.464 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card; el encoder base admite por defecto secuencias cortas |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria setfit) |
| Tarea | text-classification (binaria) |
| Tamano del repositorio | 0,4 GB |
| Modelo base | sentence-transformers/paraphrase-mpnet-base-v2 |
| Dataset de entrenamiento | StanfordSCALE/assertions_llm_annotated_talkmoves |
| Etiqueta objetivo | `assertion_references_logistics` |

## Arquitectura y entrenamiento

El modelo sigue el paradigma SetFit en dos fases. En la primera, el cuerpo `paraphrase-mpnet-base-v2` se afina mediante aprendizaje contrastivo (contrastive phase) para producir representaciones de frase discriminativas a partir de pares de ejemplos etiquetados, con un learning rate de 2e-05, batch size 16, 10 epocas y un maximo de 5000 pasos. En la segunda fase se entrena una cabeza `LogisticRegression` sobre los embeddings congelados, con learning rate de 0,01 y batch size 32. Se uso semilla 20260904 y precision mixta en GPU.

Los datos proceden de un subconjunto del TalkMoves Dataset anotado por anotadores LLM (no por codificadores humanos). El reparto es de 13.180 ejemplos de entrenamiento (53,3 %), 3.294 de desarrollo (13,3 %) y 8.241 de test (33,3 %). La tasa base de la clase positiva es del 11,5 % global (11,0 % en train, 12,1 % en dev y 12,1 % en test), lo que confirma un problema claramente desbalanceado. La fiabilidad entre anotadores, medida con alfa de Krippendorff, es de 0,729. El texto de entrada se construye simplemente como `{utterance}`, sin plantilla adicional: la intervencion se pasa tal cual.

## Capacidades

- Clasificacion binaria de texto: determina si una intervencion de docente hace referencia a cuestiones logisticas del aula.
- Devuelve etiqueta (`predict`) y probabilidad por clase (`predict_proba`), lo que permite ajustar umbrales en produccion.
- Especializacion en discurso de aula en ingles y en el esquema de anotacion TalkMoves.
- Integrable mediante la libreria `setfit` y la herramienta `EduBehaviors-kit` del proyecto.
- No soporta generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No implementa agentes ni razonamiento multi-paso.
- Multilingue: no; entrenado exclusivamente en ingles.
- No dispone de modo "thinking", vision ni audio.

## Casos de uso

- Codificacion automatica de transcripciones de aula: aplicar el clasificador a miles de intervenciones docentes para etiquetar que fragmentos tratan rutinas de gestion (material, tiempo, turnos), reduciendo coste frente a la codificacion manual.
- Investigacion en ciencias del aprendizaje: generar variables derivadas sobre carga logistica de la sesion para correlacionarlas con medidas de interaccion o rendimiento.
- Anotacion asistida en pipelines cualitativos: preetiquetar el corpus y reservar el trabajo humano para la revision de los casos ambiguos o con probabilidad intermedia.
- Filtrado y segmentacion previa: aislar los tramos puramente logisticos antes de analizar movimientos discursivos mas ricos (preguntas, elicitacion, andamiaje) con otros clasificadores del mismo conjunto.
- Construccion de datos de entrenamiento: usar sus predicciones junto con revision humana para ampliar el corpus anotado de nuevas cohortes con coste reducido.
- Monitorizacion y feedback docente: en plataformas de formacion, detectar que proporcion de la sesion se dedica a logistica frente a instruccion academica.
- Reproducibilidad metodologica: incorporar el clasificador como componente fijo y versionado en analisis replicables de discurso de aula.
- Auditoria de esquemas de anotacion: comparar las etiquetas del clasificador con anotaciones humanas para medir la solidez del esquema `bu5`.

## Benchmarks y rendimiento

Resultados declarados por el autor en la `model-index` y en la model card (no verificados):

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 3.294 | 12,1 % | 0,797 | 0,683 | 0,735 | 0,931 | 0,792 |
| test | 8.241 | 12,1 % | 0,779 | 0,689 | 0,731 | 0,947 | 0,793 |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: en FP32, los 109.486.464 parametros ocupan aproximadamente 0,44 GB, por lo que el modelo cabe sobradamente en cualquier GPU moderna; en la practica puede ejecutarse en CPU.
- GPU recomendadas: no requiere GPU dedicada. Funciona en cualquier GPU consumer (GTX 1050 Ti o superior, RTX serie 20/30/40) e incluso en CPU y en dispositivos de borde.
- Cabe en GPU de consumo: si, en practicamente todas; tambien en entornos sin GPU.
- Opciones de despliegue: `setfit` (referencia), conversion a ONNX para inferencia optimizada, y cualquier servidor de embeddings/clasificacion compatible. No hay soporte nativo declarado para vLLM, TGI u Ollama, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles en la informacion proporcionada. Se espera una latencia por lote muy baja dado el tamano del encoder, pero no se aportan cifras medidas.

## Comparativa con modelos similares

No se han publicado comparaciones directas con alternativas en la informacion disponible. Como referencia estructural:

| Alternativa | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| StanfordSCALE/assertion_references_logistics | 109,5 M | no disponible | Clasificacion binaria de aserciones logisticas | no disponible | HuggingFace |
| sentence-transformers/paraphrase-mpnet-base-v2 + cabeza propia | ~109 M | corto (encoder de frases) | Embeddings genericos; requiere entrenar la cabeza | Apache-2.0 (modelo base) | HuggingFace |
| Clasificador supervisado sobre DeBERTa-v3-base | ~184 M | 512 tokens | Clasificacion de texto generica | MIT (modelo base) | HuggingFace |
| Clasificacion zero-shot con LLM | variable | largo | Clasificacion sin entrenamiento especifico | variable | APIs o modelos abiertos |

Rendimiento comparado: no disponible. No se aportan resultados de estas alternativas sobre el mismo conjunto de datos.

## Limitaciones y advertencias

- Las etiquetas provienen de anotadores LLM, no de codificadores humanos; el acuerdo entre anotadores es de alfa de Krippendorff 0,729, lo que implica ruido de etiquetado no despreciable.
- El modelo se entreno unicamente con intervenciones de docentes. Su comportamiento sobre habla de estudiantes no ha sido probado y no deberia asumirse valido.
- Clase positiva muy minoritaria (11,5 % de tasa base): un umbral de decision mal calibrado degrada rapidamente el recall. Se recomienda trabajar con `predict_proba` y ajustar el umbral al coste relativo de falsos positivos y falsos negativos.
- Riesgo de alucinacion no aplica en el sentido generativo (no produce texto), pero si existe riesgo de falsos positivos en intervenciones ambiguas que mencionan objetos o materiales sin constituir una referencia logistica real.
- Sesgos conocidos: no documentados en la model card; al derivarse de un corpus concreto de aulas, puede heredar sesgos de ese contexto (nivel educativo, idioma, estilo docente).
- Limitacion idiomatica: solo ingles; cualquier uso en castellano u otras lenguas queda fuera de su dominio de entrenamiento.
- Restricciones de licencia: la licencia no esta declarada, por lo que no puede asumirse uso comercial libre. Conviene contactar con el autor antes de integrarlo en productos.
- No es un modelo generativo: no debe emplearse para resumir, responder ni razonar; su unica salida valida es una etiqueta y su probabilidad.
- Los resultados de la `model-index` estan marcados como no verificados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_references_logistics
- Dataset de anotaciones: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset (repositorio original): https://github.com/SumnerLab/TalkMoves
- Libreria SetFit: https://github.com/huggingface/setfit
- No se han encontrado otros enlaces relevantes (papers, blogs o demos) en la busqueda web realizada.
