# StanfordSCALE/assertion_corrects_a_prior_student_contribution

## Resumen

`StanfordSCALE/assertion_corrects_a_prior_student_contribution` es un clasificador binario de texto en ingles desarrollado por la Stanford SCALE Initiative. No es un modelo generativo: se trata de un clasificador SetFit construido sobre el encoder `sentence-transformers/paraphrase-mpnet-base-v2` con una cabeza de regresion logistica. Su tarea es determinar si una intervencion de un docente ("utterance") corrige una contribucion previa de un estudiante, dentro del marco de esquemas de codificacion de discurso en aula denominado EduBehaviors.

El modelo forma parte de un conjunto de clasificadores de "asserions" (afirmaciones) de nivel superior (`td`, top-down) pensados para hacer auditable la codificacion de dialogo educativo. Se entrena sobre un subconjunto de intervenciones de profesor anotado por LLM, derivado del TalkMoves Dataset, con un total de 24.715 filas repartidas en train (13.182), dev (3.293) y test (8.240). La clase positiva es muy rara: apenas un 2,0 % de las filas en el conjunto completo.

Su relevancia es metodologica mas que de rendimiento: ejemplifica el enfoque de "anotacion con LLM + clasificador ligero" para escalar la investigacion sobre discurso en el aula, y publica metricas honestas que muestran que el modelo aun no es fiable de forma autonoma (F1 de 0,198 en test). Es un componente de un pipeline mas amplio, no un sistema listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit: encoder Sentence Transformer MPNet (`paraphrase-mpnet-base-v2`) con cabeza de clasificacion `LogisticRegression` |
| Parametros totales | 109.486.464 (~109,5 M) segun safetensors |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo consume una unica intervencion de texto, sin ventana multi-turno documentada) |
| Tipos de cuantizacion | no disponible (solo se declaran pesos safetensors en el repositorio) |
| Idiomas soportados | ingles (`en`) |
| Licencia | no disponible (la model card no especifica licencia) |
| Formato de pesos | safetensors (libreria `setfit`); tamano del repositorio 0,4 GB |
| Tarea (pipeline) | `text-classification` |
| Etiquetas de salida | binaria: 1 si la intervencion corrige una contribucion previa del estudiante, 0 en caso contrario |
| Modelo base | `sentence-transformers/paraphrase-mpnet-base-v2` |

## Arquitectura y entrenamiento

El modelo sigue el esquema SetFit: en una primera fase se ajusta el cuerpo (encoder MPNet) con aprendizaje contrastivo por pares de frases, con un learning rate de 2e-05, batch size 16, 10 epocas y un maximo de 5.000 pasos; en una segunda fase se entrena una cabeza de regresion logistica con learning rate 0,01 y batch size 32, con 100 pasos maximos de evaluacion. Se uso semilla 20260904 y precision mixta en GPU. La entrada es unicamente el texto de la intervencion, pasado tal cual, sin plantilla de prompt ni metadatos de contexto conversacional.

Los datos proceden del dataset `StanfordSCALE/assertions_llm_annotated_talkmoves`, subconjunto anotado por LLM de intervenciones de profesor del TalkMoves Dataset. La tasa base de la clase positiva es del 2,0 % global (2,0 % en train, 1,9 % en dev, 2,1 % en test), lo que convierte la tarea en un problema de clasificacion fuertemente desbalanceado. El acuerdo entre anotadores, medido con alfa de Krippendorff, es de 0,504, un valor moderado que acota el techo alcanzable por cualquier modelo entrenado sobre estas etiquetas. No se documenta uso de RLHF ni DPO, ya que no se trata de un modelo generativo.

## Capacidades

- Clasificacion binaria de una unica intervencion docente: indica si esa intervencion corrige o no una contribucion previa de un estudiante.
- Salida probabilistica mediante `predict_proba`, lo que permite umbralizar y priorizar candidatos en lugar de usar la decision binaria directa.
- Integracion con la libreria `setfit` y, segun la model card, uso a traves del paquete Python `EduBehaviors-kit` dentro del conjunto de aserciones top-down `td`.
- Procesamiento por lotes (`model.predict([...])`) para anotar volumenes grandes de intervenciones.
- Ejecucion ligera: 109,5 M de parametros permiten inferencia en CPU sin GPU dedicada.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto.
- Cobertura multilingue: solo ingles.
- No dispone de modo "thinking" ni de ninguna capacidad especial adicional.

## Casos de uso

- Preanotacion asistida en investigacion sobre discurso en el aula: el clasificador marca intervenciones candidatas a "correccion de una contribucion previa del estudiante" y un codificador humano revisa solo esas candidatas, reduciendo el coste de anotacion manual sobre corpus grandes.
- Filtrado de alto recall para anotacion activa: dado que la clase positiva es solo el 2 % del corpus, usar `predict_proba` con un umbral bajo permite seleccionar un subconjunto manejable para revision humana en lugar de leer todas las transcripciones.
- Analisis exploratorio de trayectorias de correccion en una leccion: aplicando el clasificador a una transcripcion completa, se pueden localizar los puntos donde el docente reconduce una idea erronea de un estudiante y estudiar la frecuencia y distribucion temporal de esas correcciones.
- Formacion del profesorado: generar informes agregados sobre la proporcion de intervenciones correctivas frente a intervenciones de otro tipo en grabaciones de clase, como material de reflexion para docentes en formacion.
- Investigacion comparativa entre asignaturas o niveles educativos: procesar varios subcorpus del TalkMoves Dataset para medir si el patron de correccion cambia entre matematicas, ciencias u otras areas.
- Componente auxiliar en un pipeline de analitica de dialogo educativo: combinado con otros clasificadores de aserciones del mismo conjunto (`td`) y con las etiquetas `split_*` del dataset, para construir representaciones estructuradas de cada turno de conversacion.
- Validacion metodologica de anotacion por LLM: el modelo sirve como referencia cuantitativa del acuerdo entre anotadores LLM y de la dificultad real de la etiqueta, util para decidir si merece la pena mantener la asercion en el esquema.
- No es adecuado para uso autonomo en evaluacion docente, calificacion de profesores ni sistemas de decision sin supervision humana, dado su F1 de 0,198 en test.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados externamente):

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 3.293 | 1,9 % | 0,444 | 0,125 | 0,195 | 0,675 | 0,178 |
| test | 8.240 | 2,1 % | 0,265 | 0,158 | 0,198 | 0,680 | 0,135 |

Resultados del `model-index` oficial para el split de test (clase positiva): F1 = 0,1978; precision = 0,2647; recall = 0,1579; ROC-AUC = 0,6805. Todos marcados como no verificados.

No se han publicado en la informacion disponible resultados de benchmarks comparables con otros modelos (MMLU, HumanEval, GSM8K u otros), ya que no se trata de un modelo generativo ni de proposito general.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones aritmeticas a partir de 109,5 M de parametros, no verificadas empiricamente): aproximadamente 0,44 GB en FP32, unos 0,22 GB en FP16/BF16 y unos 0,11 GB en INT8.
- Memoria total recomendada del proceso: del orden de 1 GB de RAM, incluyendo el runtime de PyTorch y el tokenizador.
- GPU: no requiere GPU. Cualquier GPU consumer con 4 GB o mas de VRAM (por ejemplo GTX 1650, RTX 3050, RTX 4090) es mas que suficiente; tambien es viable en A100 o H100 si se reutiliza infraestructura existente, aunque estaria infrautilizada.
- Cabe holgadamente en GPU de consumo: si, en cualquier tarjeta moderna con al menos 2-4 GB de VRAM.
- Despliegue: libreria `setfit` (PyTorch) como via oficial; exportacion a ONNX o TorchScript para servir con ONNX Runtime o TorchServe; `sentence-transformers` para la parte de embeddings. vLLM, llama.cpp, Ollama y TGI no aplican, porque no es un modelo generativo ni un transformer decoder con pesos GGUF.
- Latencia y throughput: no disponibles. Al ser un encoder de 109 M de parametros, cabe esperar latencias de decenas de milisegundos por lote en CPU moderna y de pocos milisegundos por lote en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | F1 (clase positiva) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `StanfordSCALE/assertion_corrects_a_prior_student_contribution` | SetFit sobre MPNet-base, clasificacion binaria de una asercion | 109,5 M | no disponible (una intervencion por inferencia) | 0,198 en test (declarado) | no disponible | HuggingFace, libreria `setfit` |
| Clasificador trivial de clase mayoritaria (predice siempre "no") | Linea base | no aplica | no aplica | 0,000 en F1 de clase positiva (derivado de la tasa base del 2,1 %) | no aplica | no aplica |
| Otros clasificadores de aserciones del conjunto `td` de StanfordSCALE | SetFit sobre el mismo encoder base | ~109,5 M (misma arquitectura) | no disponible | no disponible (varia por asercion) | no disponible | HuggingFace, mismo autor |
| Anotadores LLM usados para generar las etiquetas | LLM generativo utilizado como anotador | no disponible | no disponible | no disponible (alfa de Krippendorff 0,504) | no disponible | no disponible |

No se dispone de datos publicados que permitan comparar este clasificador con alternativas equivalentes de codificacion de discurso en aula (por ejemplo, modelos supervisados entrenados sobre el TalkMoves Dataset original con etiquetas humanas). Esa comparacion figura como no disponible.

## Limitaciones y advertencias

- Etiquetas generadas por anotadores LLM, no por codificadores humanos. El acuerdo entre anotadores es de alfa de Krippendorff 0,504, lo que limita el rendimiento maximo alcanzable y traslada el sesgo del anotador al clasificador.
- Rendimiento muy bajo en la clase positiva: F1 de 0,198, precision de 0,265 y recall de 0,158 en test. La propia model card indica explicitamente que el modelo no funciona lo bastante bien como para usarse por si solo.
- Desbalance extremo de clases (2,0 % de positivos): cualquier uso en produccion debe acompanarse de umbralizacion calibrada y revision humana; la metrica de exactitud seria enganosa (un clasificador trivial que prediga siempre "no" acertaria alrededor del 97,9 %).
- Entrenado unicamente con intervenciones de profesor. El comportamiento sobre habla de estudiantes no ha sido probado.
- Idioma: solo ingles. Cualquier uso sobre transcripciones en castellano u otros idiomas carece de validacion.
- Sin contexto conversacional: la entrada es una intervencion aislada, por lo que el modelo no puede resolver referencias a turnos anteriores que si estarian disponibles en la transcripcion completa.
- Licencia no especificada en la model card ni en los metadatos de HuggingFace: antes de cualquier uso comercial es necesario aclarar los terminos con el autor, y verificar ademas la licencia del modelo base `sentence-transformers/paraphrase-mpnet-base-v2`.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si de falsos positivos y falsos negativos con probabilidades mal calibradas en la cola alta de `predict_proba`.
- Modelo sin descargas ni "likes" en el momento de la consulta, creado y actualizado el 12 de octubre de 2026: no hay evidencia de uso en produccion ni validacion independiente.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces obtenidos eran contenido no relacionado y se han descartado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_corrects_a_prior_student_contribution
- Dataset de anotaciones: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset (repositorio original): https://github.com/SumnerLab/TalkMoves
- Libreria SetFit: no se ha proporcionado enlace directo en la informacion disponible
- Paquete `EduBehaviors-kit`: mencionado en la model card, sin URL en la informacion disponible
- Paper o publicacion asociada a EduBehaviors: no disponible
- Demo o espacio de inferencia: no disponible
