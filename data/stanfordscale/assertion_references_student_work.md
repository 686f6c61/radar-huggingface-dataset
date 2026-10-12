# StanfordSCALE/assertion_references_student_work

## Resumen

`StanfordSCALE/assertion_references_student_work` es un clasificador binario de texto desarrollado por la Stanford SCALE Initiative dentro del proyecto EduBehaviors, un conjunto de esquemas de anotacion basados en aserciones para el codigo auditable de dialogos en el aula. El modelo resuelve una tarea muy concreta: determinar si una intervencion docente (utterance) hace referencia al trabajo realizado por el alumnado, etiqueta identificada internamente como `bu5__references_student_work`. No es un modelo generativo, sino un clasificador de una sola etiqueta entrenado con la libreria SetFit.

Tecnicamente se apoya en el encoder `sentence-transformers/paraphrase-mpnet-base-v2` (arquitectura MPNet, 109.486.464 parametros) como cuerpo congelado/ajustado y una cabeza de regresion logistica sobre los embeddings resultantes. El entrenamiento se realizo sobre una anotacion de subconjunto del TalkMoves Dataset generada por anotadores LLM, con 13.183 ejemplos de entrenamiento, 3.294 de desarrollo y 8.238 de test, y una tasa base de la clase positiva de solo el 8,1 %.

Su relevancia es acotada pero clara para el nicho de analitica educativa: forma parte de un kit (`EduBehaviors-kit`) orientado a auditar el discurso en el aula de manera reproducible. Los resultados publicados por el autor muestran un F1 de 0,5891 en la clase positiva y un ROC-AUC de 0,8862 en test, con una precision notablemente superior al recall (0,69 frente a 0,51), un perfil tipico de tareas muy desbalanceadas donde se prima evitar falsos positivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer MPNet (cuerpo) + cabeza de regresion logistica (SetFit) |
| Parametros totales | 109.486.464 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repositorio en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue el paradigma SetFit: en lugar de anadir una cabeza de clasificacion a un transformer y entrenar end-to-end, se emplea un encoder de frases (`paraphrase-mpnet-base-v2`) seguido de un clasificador lineal simple (`LogisticRegression`). El cuerpo pasa por una fase contrastiva con learning rate de 2e-05, batch size 16, hasta 5.000 pasos y 10 epocas, mientras que la cabeza se entrena con learning rate 0,01 y batch size 32. Se activo precision mixta en GPU y se fijo la semilla 20260904. La entrada es la utterance del docente tal cual, sin plantilla envolvente.

Los datos proceden del dataset `StanfordSCALE/assertions_llm_annotated_talkmoves`, un subconjunto del TalkMoves Dataset (SumnerLab) anotado por LLM. Las etiquetas no son humanas y la concordancia entre anotadores medida con alfa de Krippendorff es de 0,665, un valor moderado que conviene tener en cuenta. La clase positiva esta muy desbalanceada (8,1 % global; 8,1 % en train, 8,1 % en dev y 8,2 % en test). Las columnas del modelo son `assertion_references_student_work` y `split_references_student_work`. No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa, ya que no aplican a un clasificador.

## Capacidades

- Clasificacion binaria de texto: devuelve 0/1 para la asercion "references student work" y probabilidades con `predict_proba`.
- Deteccion de una conducta discursiva docente concreta dentro de interacciones de aula transcritas.
- Integracion directa con la libreria `setfit` y con el paquete `EduBehaviors-kit`.
- Salida probabilistica apta para umbralizado ajustable (util por el fuerte desbalanceo de clases).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es multilingue: solo ingles.
- No dispone de modo "thinking", vision ni audio. Es exclusivamente texto de entrada, etiqueta de salida.

## Casos de uso

- Investigacion en analitica del discurso en el aula: codificar automaticamente transcripciones de clases y medir con que frecuencia el docente remite al trabajo del alumnado, reduciendo el coste de la anotacion manual.
- Sistemas de observacion docente a escala: procesar lotes de utterances de docentes para generar metricas agregadas por sesion o por profesor, dado que el modelo trabaja utterance a utterance de forma barata computacionalmente.
- Formacion del profesorado: ofrecer retroalimentacion sobre patrones de interaccion, senalando si el docente tiende a referenciar (o no) las aportaciones y productos del alumnado.
- Pipelines de investigacion educativa reproducibles: integrar el clasificador en flujos de analisis con `EduBehaviors-kit` para obtener codigos auditables y comparables entre estudios.
- Filtrado y triaje de transcripciones: priorizar automaticamente los fragmentos de aula que contienen este tipo de aserciones para una revision humana posterior, aprovechando el alto ROC-AUC (0,8862).
- Analisis comparativo entre cohortes o asignaturas: agregar la proporcion de utterances que referencian trabajo del alumnado y correlacionarla con otras variables pedagogicas.
- Etiquetado asistido para ampliar corpus: usar las predicciones como pre-anotacion en conjuntos grandes del dominio educativo (siempre con revision humana por el moderado F1 de la clase positiva).

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente). Metrica principal sobre `StanfordSCALE/assertions_llm_annotated_talkmoves`, split test.

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 3.294 | 8,1 % | 0,681 | 0,594 | 0,635 | 0,904 | 0,647 |
| test | 8.238 | 8,2 % | 0,690 | 0,514 | 0,589 | 0,886 | 0,628 |

Metricas de test declaradas en el model-index: F1 0,5891, precision 0,6899, recall 0,5141, ROC-AUC 0,8862 (todas marcadas como no verificadas).

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo ronda los 110 M de parametros (unos 0,4 GB en el repositorio). En fp32 el uso es de aproximadamente 0,44 GB solo en pesos; en fp16/BF16 baja a unos 0,22 GB, mas el overhead de activaciones.
- Cabe holgadamente en cualquier GPU de consumo: GTX 1650, RTX 3060, RTX 4090 e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna con al menos 1-2 GB de VRAM libre; para lotes grandes, A100/H100 no son necesarios pero permiten吞吐 alto.
- Despliegue: la via documentada es la libreria `setfit` en Python; el encoder subyacente es compatible con `sentence-transformers` y con `transformers`, y por tanto puede servirse con los runners habituales del ecosistema (por ejemplo ONNX Runtime o TorchScript si se exporta). No se documentan instrucciones especificas para vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por tamano y arquitectura se trata de inferencia ligera, apta para procesar grandes volumenes de utterances, pero no se aportan cifras concretas.

## Comparativa con modelos similares

No se proporcionan datos de benchmarks de modelos comparables en la informacion disponible, por lo que la comparacion cuantitativa directa no es posible. A nivel cualitativo:

| Aspecto | assertion_references_student_work | Clasificador BERT/RoBERTa fine-tuned equivalente | Modelo generativo LLM con prompt de clasificacion |
|---|---|---|---|
| Parametros | 109 M (MPNet + logistic head) | Tipicamente 110-355 M | Miles de millones |
| Contexto | no disponible | 512 tokens (habitual) | Segun modelo |
| Rendimiento | F1 0,589 / ROC-AUC 0,886 en test (declarado) | no disponible | no disponible |
| Licencia | no disponible | variable | variable |
| Coste de inferencia | bajo | bajo | alto |

La eleccion entre estas alternativas depende del requisito de latencia, coste y trazabilidad. Este modelo es el mas ligero del grupo, pero su rendimiento esta condicionado por el escaso tamano del corpus y el fuerte desbalanceo de clases.

## Limitaciones y advertencias

- Las etiquetas provienen de anotadores LLM, no de codificadores humanos; la concordancia entre anotadores es de 0,665 (alfa de Krippendorff), lo que introduce ruido inherente en el entrenamiento y en la evaluacion.
- El modelo se entreno solo con utterances de docentes. Su comportamiento con intervenciones de estudiantes no ha sido probado y no se recomienda extrapolarlo a ese caso.
- Fuerte desbalanceo de clase (tasa base en torno al 8 %): el recall es bajo (0,514 en test), por lo que tiende a omitir casos positivos. Ajustar el umbral de decision es imprescindible segun el coste relativo de falsos negativos y falsos positivos.
- Riesgo de alucinacion no aplica en sentido generativo, pero si existe riesgo de clasificaciones erroneas y de sobreajuste a la distribucion del TalkMoves Dataset.
- Idioma: unicamente ingles; no hay evidencia de funcionamiento en castellano ni en otros idiomas.
- Licencia no disponible: la model card no especifica condiciones, por lo que el uso comercial no puede asumirse sin consultar al autor.
- Contexto y limites de longitud de entrada no documentados: no se garantiza el comportamiento en utterances largas o conversaciones multiplo turno sin segmentar.
- Los resultados de benchmark estan marcados como no verificados, lo que limita su valor como referencia definitiva en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_references_student_work
- Dataset de anotacion: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset: https://github.com/SumnerLab/TalkMoves
- Libreria SetFit: https://github.com/huggingface/setfit
