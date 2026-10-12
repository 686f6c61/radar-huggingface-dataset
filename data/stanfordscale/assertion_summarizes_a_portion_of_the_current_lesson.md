# StanfordSCALE/assertion_summarizes_a_portion_of_the_current_lesson

## Resumen

`StanfordSCALE/assertion_summarizes_a_portion_of_the_current_lesson` es un clasificador binario de texto desarrollado por la Stanford SCALE Initiative dentro del proyecto *EduBehaviors: Assertion-based schemas for auditable dialogue coding*. No es un modelo generativo: detecta una única afirmación pedagógica, `bu5__summarizes_a_portion_of_the_current_lesson` (conjunto de aserciones bottom-up `bu5`), es decir, si una intervención de un docente resume una porción de la lección que se está impartiendo en ese momento.

El modelo se ha construido con SetFit sobre el encoder `sentence-transformers/paraphrase-mpnet-base-v2` (109.486.464 parámetros, pesos en safetensors), al que se añade una cabeza de regresión logística. Se entrenó sobre un subconjunto de intervenciones docentes del TalkMoves Dataset anotado automáticamente con LLM, con 13.183 filas de entrenamiento, 3.296 de desarrollo y 8.236 de test, y una tasa base de la clase positiva del 4,8 %, lo que lo convierte en un problema claramente desbalanceado.

Su relevancia es acotada y de nicho: sirve como componente de investigación en analítica del discurso en el aula, no como clasificador listo para producción. La propia model card advierte que el F1 en test es 0,355 y que el modelo "no funciona lo bastante bien como para usarse por sí solo".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit: encoder tipo transformer (MPNet, `paraphrase-mpnet-base-v2`) congelado o ajustado + cabeza de `LogisticRegression` |
| Parametros totales | 109.486.464 (aproximadamente 109,5 M) |
| Longitud de contexto | no disponible (la model card no declara longitud máxima de secuencia) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (tamaño del repositorio: 0,4 GB) |
| Tarea (pipeline) | text-classification (clasificación binaria por intervención) |
| Modelo base | sentence-transformers/paraphrase-mpnet-base-v2 |
| Biblioteca | setfit |
| Dataset de entrenamiento | StanfordSCALE/assertions_llm_annotated_talkmoves |
| Columna de etiqueta | assertion_summarizes_a_portion_of_the_current_lesson (y split_summarizes_a_portion_of_the_current_lesson) |
| Tasa base de la clase positiva | 4,8 % global (4,9 % train, 4,6 % dev, 4,8 % test) |

## Arquitectura y entrenamiento

Se trata de un clasificador SetFit: un esquema de ajuste eficiente en el que el cuerpo del modelo es un sentence transformer (`paraphrase-mpnet-base-v2`, arquitectura MPNet) y la decisión final la toma una cabeza de regresión logística sobre el embedding de la frase. El entrenamiento consta de una fase contrastiva sobre el cuerpo con `learning rate` 2e-05, batch size 16 y un máximo de 5.000 pasos, seguida de una fase de ajuste de la cabeza con `learning rate` 0.01 y batch size 32. En total, 10 épocas, `eval max steps` 100, semilla 20260904 y precisión mixta activada en GPU.

Los datos proceden de un subconjunto anotado por LLM del TalkMoves Dataset, compuesto exclusivamente por intervenciones de docentes. La entrada es la intervención en crudo (`{utterance}`), sin plantilla adicional. La etiqueta indica si esa intervención resume una porción de la lección en curso. No se documenta uso de RLHF ni DPO, algo esperable en un clasificador de este tipo. El acuerdo entre anotadores para esta aserción es bajo: Krippendorff's alpha de 0,419, con etiquetas generadas por anotadores LLM y no por codificadores humanos.

## Capacidades

- Clasificación binaria de una intervención docente aislada: predice si resume una porción de la lección actual (`model.predict`) y devuelve probabilidades por clase (`model.predict_proba`).
- Integración con el paquete `EduBehaviors-kit` para flujos de codificación de diálogo auditable basados en aserciones.
- Funciona sobre texto corto en inglés, sin necesidad de preprocesado declarado: la intervención se pasa tal cual.
- Inferencia muy ligera: 109,5 M de parámetros y 0,4 GB de repositorio, ejecutable en CPU.
- No dispone de generación de texto, razonamiento multi-paso, tool calling, agentes, visión, audio ni modo de pensamiento. Tampoco es multilingüe: solo inglés.
- No incluye etiquetado por turnos de conversación completa: la unidad de entrada es la intervención individual.

## Casos de uso

- Triaje previo en codificación manual de discurso en el aula: el clasificador se usa como primer filtro sobre miles de intervenciones docentes para priorizar cuáles revisa un codificador humano, dado que el recall es 0,290 y el F1 0,355 solo tiene sentido como ayuda, no como sustituto.
- Investigación educativa sobre resumen de lecciones: permite medir de forma aproximada la frecuencia con la que los docentes sintetizan parcialmente la lección, partiendo de una tasa base observada del 4,8 % en el corpus TalkMoves anotado.
- Anotación débil para ampliar datasets: sus salidas sirven para preetiquetar grandes volúmenes de transcripciones del dominio educativo antes de una revisión humana, aprovechando que el modelo se distribuye vía SetFit y es barato de ejecutar.
- Aumento de paneles de analítica docente: combinado con otras aserciones del mismo conjunto `bu5`, permite construir métricas agregadas por sesión de clase sobre prácticas discursivas concretas.
- Validación de pipelines de anotación con LLM: al estar entrenado sobre etiquetas LLM con alpha 0,419, resulta útil como referencia para comparar la estabilidad de nuevos anotadores automáticos frente a un clasificador ligero y reproducible.
- Formación de profesorado y observación entre pares: marcar automáticamente intervenciones candidatas a resumen para usarlas como ejemplos en sesiones de reflexión sobre práctica docente.
- Experimentos de destilación o evaluación de encoders en NLP educativo: al ser un SetFit sobre MPNet con hiperparámetros documentados (semilla, pasos, learning rates), es reproducible como línea base frente a otros encoders en esta tarea concreta.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`). Tarea: text-classification sobre el split de test de `StanfordSCALE/assertions_llm_annotated_talkmoves`.

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 3.296 | 4,6 % | 0,441 | 0,294 | 0,353 | 0,722 | 0,273 |
| test | 8.236 | 4,8 % | 0,458 | 0,290 | 0,355 | 0,725 | 0,324 |

Métricas de test tal y como figuran en el model-index: F1 0,3551, precision 0,4578, recall 0,2901, ROC-AUC 0,7246.

## Requisitos de hardware

- Inferencia en FP32: aproximadamente 438 MB solo para pesos (109,5 M × 4 bytes); en FP16, unos 219 MB; en int8, alrededor de 110 MB.
- VRAM necesaria: por debajo de 1 GB, por lo que cabe sin problema en cualquier GPU de consumo, incluida una GTX 1650 o una iGPU moderna con memoria compartida.
- También se ejecuta en CPU con latencias suficientes para procesamiento por lotes; no se han publicado medidas de latencia ni de throughput.
- GPUs recomendadas: no se especifica ninguna en la documentación; para lotes grandes, cualquier GPU con al menos 2-4 GB de VRAM (RTX 3060, RTX 4090, T4, A100, H100) es más que suficiente.
- Opciones de despliegue: la vía documentada es la biblioteca `setfit` (`SetFitModel.from_pretrained`). Al ser un encoder sentence-transformers, también es compatible con el ecosistema `sentence-transformers` para generar embeddings y con exportaciones a ONNX. No hay instrucciones publicadas para vLLM, TGI, Ollama o llama.cpp, que además no aplican a un clasificador de este tipo.
- Se puede forzar CPU/GPU con las opciones estándar de SetFit; no hay datos publicados de consumo energético ni de escalado con batch.

## Comparativa con modelos similares

No se han publicado en la información disponible datos comparativos con otros modelos. Como alternativas conceptuales de la misma categoría se podrían considerar los demás clasificadores de aserciones del conjunto `bu5` de Stanford SCALE (mismo esquema SetFit y mismo dataset, con etiqueta distinta), pero no se dispone de sus métricas ni de sus fichas en la información proporcionada.

| Modelo | Parametros | Contexto | F1 (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| assertion_summarizes_a_portion_of_the_current_lesson | 109,5 M | no disponible | 0,355 | no disponible | HuggingFace (0 descargas) |
| Otros clasificadores de aserciones de Stanford SCALE | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas de terceros para la misma tarea | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Las etiquetas provienen de anotadores LLM, no de codificadores humanos; el acuerdo entre anotadores es bajo (Krippendorff's alpha 0,419), lo que acota el techo de aprendizaje del modelo.
- Desbalanceo severo de clases: la clase positiva representa solo el 4,8 % de las filas, lo que explica un recall de 0,290 y un average precision de 0,324 en test.
- F1 en test de 0,355: la propia model card indica que el modelo no es lo bastante bueno para usarse de forma autónoma. Cualquier uso en producción exige revisión humana en el bucle.
- Entrenado únicamente con intervenciones de docentes. El comportamiento sobre intervenciones de estudiantes no está probado.
- Solo inglés. No hay evidencia de funcionamiento en castellano ni en otros idiomas.
- Licencia no disponible: no se puede confirmar la viabilidad de uso comercial, redistribución o modificación. Conviene contactar con el autor antes de integrarlo en un producto.
- Es un clasificador, no un generador: no produce alucinaciones de texto, pero sí puede generar falsos positivos y falsos negativos con precision 0,458 y recall 0,290.
- Sensibilidad al dominio: el entrenamiento se limita a transcripciones de aula del corpus TalkMoves; el rendimiento fuera de ese registro (otros niveles educativos, otras materias, texto escrito) es desconocido.
- Sin datos publicados de longitud máxima de secuencia, por lo que no se puede garantizar un comportamiento correcto con intervenciones largas.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validación independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_summarizes_a_portion_of_the_current_lesson
- Dataset de anotaciones: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset (SumnerLab): https://github.com/SumnerLab/TalkMoves
- Biblioteca SetFit: https://github.com/huggingface/setfit
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los enlaces obtenidos no guardan relación con él y se omiten.
