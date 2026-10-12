# StanfordSCALE/assertion_references_classroom_materials

## Resumen

`StanfordSCALE/assertion_references_classroom_materials` es un clasificador binario de texto en ingles desarrollado por la Stanford SCALE Initiative dentro del proyecto *EduBehaviors: assertion-based schemas for auditable dialogue coding*. No es un modelo generativo: es un SetFit fine-tune sobre el encoder `sentence-transformers/paraphrase-mpnet-base-v2` (MPNet, ~109,5 millones de parametros) con una cabeza de regresion logistica que decide si una intervencion de un docente hace referencia a materiales de aula (assertion `bu5__references_classroom_materials`).

El problema que resuelve es la codificacion automatica y auditable del discurso de aula a escala: en lugar de anotar manualmente transcripciones de clase, el modelo marca que turnos de profesor remiten a materiales didacticos. Se entrena sobre un subconjunto anotado por LLM del TalkMoves Dataset (13.180 ejemplos de entrenamiento, 3.294 de desarrollo y 8.241 de test), con una tasa base de positivos muy baja (6,7 %), lo que lo convierte en un caso de clasificacion desbalanceada donde la precision importa mas que el recall.

Su relevancia actual es doble: por un lado forma parte de un esfuerzo por estandarizar esquemas de anotacion de comportamientos educativos reutilizables; por otro, es un ejemplo de destilacion de anotaciones generadas por LLM en clasificadores ligeros ejecutables en CPU, con la advertencia explicita de que las etiquetas no provienen de codificadores humanos (Krippendorff's alpha = 0,703).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit: encoder transformer MPNet (`sentence-transformers/paraphrase-mpnet-base-v2`) + cabeza de clasificacion `LogisticRegression` |
| Parametros totales | 109.486.464 (segun safetensors del repositorio) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base opera con un `max_seq_length` de 128 tokens y la entrada es una unica intervencion (`{utterance}`) |
| Tipos de cuantizacion | no disponible; no se publican pesos cuantizados (la cuantizacion solo podria aplicarse al encoder) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible (ni la model card ni la ficha de HuggingFace la declaran) |
| Formato de pesos | safetensors; tamano del repositorio 0,4 GB |

## Arquitectura y entrenamiento

SetFit combina dos fases. En la primera, el encoder `paraphrase-mpnet-base-v2` se ajusta con aprendizaje contrastivo sobre pares de frases generados a partir de las etiquetas (learning rate 2e-05, batch size 16, 10 epocas, max steps 5000, eval max steps 100, semilla 20260904, precision mixta activada en GPU). En la segunda, se entrena una cabeza `LogisticRegression` sobre los embeddings resultantes (learning rate 0,01, batch size 32). El texto de entrada se construye como `{utterance}` sin plantilla adicional, es decir, la intervencion del docente se pasa tal cual.

Los datos proceden de `StanfordSCALE/assertions_llm_annotated_talkmoves`: 13.180 filas de entrenamiento (53,3 %), 3.294 de desarrollo (13,3 %) y 8.241 de test (33,3 %), derivadas de un subconjunto del TalkMoves Dataset anotado por LLM. Las etiquetas cubren las columnas `assertion_references_classroom_materials` y `split_references_classroom_materials`, con una tasa base de positivos del 6,7 % global (6,8 % en train, 6,5 % en dev, 6,6 % en test). La concordancia entre anotadores medida con Krippendorff's alpha para esta assertion es 0,703. No se documenta uso de RLHF ni DPO, algo esperable en un clasificador de este tipo.

## Capacidades

- Clasificacion binaria de texto: devuelve `1` cuando la assertion se cumple y `0` en caso contrario (`model.predict`), ademas de probabilidades calibradas por clase (`model.predict_proba`).
- Deteccion de referencias a materiales de aula en intervenciones de docentes, dentro del esquema de assertions `bu5` del proyecto EduBehaviors.
- Integracion con la libreria `setfit` y uso mediante el paquete Python `EduBehaviors-kit` citado en la model card.
- Ejecucion en CPU: al ser un encoder de ~109 M de parametros, la inferencia no requiere GPU.
- Soporte de lotes: la API `predict`/`predict_proba` acepta listas de textos, lo que permite procesar transcripciones completas por lotes.
- Idiomas: unicamente ingles; no hay capacidades multilingues declaradas.
- No dispone de generacion de texto, razonamiento multi-paso, tool calling, capacidades de agente, vision ni audio. Es un clasificador de proposito especifico.

## Casos de uso

- Codificacion de discurso de aula a escala: procesar transcripciones completas de clases y etiquetar que turnos del docente remiten a materiales didacticos, sustituyendo la codificacion manual por un clasificador de ~109 M de parametros ejecutable en CPU.
- Triaje previo a la anotacion humana: con una precision de 0,820 en test, el modelo sirve para preseleccionar candidatos positivos y reducir el volumen de texto que revisan los codificadores humanos, asumiendo un recall de 0,687.
- Investigacion educativa cuantitativa: medir la frecuencia de referencias a materiales por sesion o por docente y correlacionarla con otras variables del corpus TalkMoves, usando las probabilidades de `predict_proba` como variable continua.
- Paneles de retroalimentacion docente: marcar automaticamente episodios en los que el profesor conecta la actividad con materiales concretos, para que formadores y coordinadores revisen esos fragmentos en sesiones de desarrollo profesional.
- Auditoria de materiales curriculares: analizar grabaciones o transcripciones de clases de matematicas y ciencias para verificar si los materiales previstos se referencian realmente en el aula.
- Comparacion entre aulas o programas: dado el gran volumen de test (8.241 filas) y la reproducibilidad del pipeline SetFit, permite comparar practicas docentes entre centros o ediciones de un programa con una metrica comun y auditable.
- Construccion de esquemas de anotacion compuestos: al ser una de las assertions `bu5`, sus salidas se pueden combinar con otros clasificadores del mismo conjunto para generar codificaciones de dialogo mas ricas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente). Tarea: clasificacion de texto; dataset: `StanfordSCALE/assertions_llm_annotated_talkmoves`.

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 3.294 | 6,5 % | 0,806 | 0,662 | 0,727 | 0,891 | 0,770 |
| test | 8.241 | 6,6 % | 0,820 | 0,687 | 0,747 | 0,926 | 0,809 |

Los valores del `model-index` coinciden con la fila de test: F1 0,7475, precision 0,8198, recall 0,6869 y ROC-AUC 0,9261. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 109.486.464 parametros del encoder): ~438 MB en fp32, ~219 MB en fp16 y ~110 MB en int8, mas el espacio de activaciones, que es reducido al trabajar con secuencias de una sola intervencion.
- GPU recomendadas: cualquier GPU consumer es suficiente; una RTX 3060, RTX 4090 o incluso una GTX 1050 Ti de 4 GB cubren el modelo con holgura. Las A100 o H100 no aportan ventaja practica para este tamano.
- Cabe sin problema en GPU consumer y tambien en CPU: al no ser un modelo generativo, la inferencia en CPU es viable para lotes moderados.
- Opciones de despliegue: libreria `setfit` (via `SetFitModel.from_pretrained`), `sentence-transformers` para el encoder, exportacion a ONNX o TorchScript para servir sin dependencia de PyTorch completo. vLLM, TGI y Ollama no aplican porque no es un modelo autoregresivo, aunque el encoder podria servirse con un runtime compatible con transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada. No se publican mediciones de tiempo de inferencia ni de peticiones por segundo.

## Comparativa con modelos similares

No se dispone de resultados publicados de otros clasificadores de assertions del proyecto EduBehaviors ni de modelos comparables de la misma tarea, por lo que la comparacion cuantitativa no esta disponible. La unica referencia directa es el modelo base del que deriva el encoder.

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `StanfordSCALE/assertion_references_classroom_materials` | 109,5 M (encoder + cabeza logistica) | no disponible (modelo base: 128 tokens) | F1 0,747 / ROC-AUC 0,926 en test | no disponible | HuggingFace, libreria `setfit` |
| `sentence-transformers/paraphrase-mpnet-base-v2` (modelo base) | ~109 M | 128 tokens | no disponible: es un encoder de proposito general, no un clasificador de esta assertion | Apache-2.0 (segun su propia ficha, no confirmado en la informacion proporcionada) | HuggingFace |
| Otros clasificadores de assertions del proyecto EduBehaviors | no disponible | no disponible | no disponible | no disponible | no disponible |
| Clasificador zero-shot con LLM sobre la misma assertion | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Las etiquetas provienen de anotadores LLM, no de codificadores humanos. La concordancia entre anotadores es de Krippendorff's alpha 0,703, un valor moderado que acota el techo de calidad que el clasificador puede heredar.
- El modelo se entreno exclusivamente con intervenciones de docentes. Su comportamiento sobre habla de estudiantes no ha sido evaluado y no deberia asumirse.
- Clasificacion fuertemente desbalanceada: con una tasa base de positivos del 6,6 % en test, el recall de 0,687 implica que aproximadamente un tercio de los positivos reales no se detectan. Para usos sensibles conviene revisar el umbral de decision sobre `predict_proba` en lugar de confiar en `predict`.
- Riesgo de alucinacion en el sentido de falsos positivos: con precision 0,820, cerca de un 18 % de las predicciones positivas son incorrectas. La elevada ROC-AUC (0,926) indica buena separacion global, pero el rendimiento en el punto de operacion por defecto es mas modesto.
- Limitacion idiomatica: entrenado solo en ingles y sobre discurso de aula estadounidense. No se garantiza su comportamiento en otros idiomas, registros o sistemas educativos.
- Longitud de entrada restringida: el modelo trabaja con una unica intervencion y el encoder base tiene un limite de 128 tokens, por lo que no captura contexto conversacional multi-turno. Para codificar el dialogo completo hace falta orquestar el modelo turno a turno.
- Licencia no declarada, ni en la model card ni en la ficha de HuggingFace. Sin una licencia explicita no se puede verificar si el uso comercial esta permitido; conviene contactar con el autor antes de integrarlo en un producto.
- El repositorio tiene 0 descargas y 0 likes, y los resultados no estan verificados de forma independiente (`"verified": false` en el model-index). Es un artefacto de investigacion reciente y sin validacion externa.
- Dependencia de la libreria `setfit` para cargar el modelo, lo que anade una dependencia adicional y puede complicar el despliegue en entornos estrictamente controlados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_references_classroom_materials
- Dataset de anotaciones: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset (origen de las transcripciones): https://github.com/SumnerLab/TalkMoves
- Paquete `EduBehaviors-kit`: mencionado en la model card, sin enlace disponible
- Paper o publicacion asociada: no disponible en la informacion proporcionada
- Demo o espacio interactivo: no disponible
- Los resultados de la busqueda web realizada no contienen ningun enlace relevante sobre este modelo ni sobre el proyecto EduBehaviors; los dominios devueltos no guardan relacion con el contenido de la ficha y no se incluyen.
