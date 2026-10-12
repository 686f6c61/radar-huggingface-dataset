# StanfordSCALE/assertion_invites_an_addition_to_a_prior_student_contribution

## Resumen

Este modelo es un clasificador de texto de tipo SetFit entrenado por la Stanford SCALE Initiative para detectar un comportamiento discursivo muy concreto en el aula: si una intervencion de un docente invita a un estudiante a anadir algo sobre una contribucion previa de otro estudiante. Forma parte de un conjunto de aserciones (*assertions*) denominado `td` (top-down) dentro del proyecto *EduBehaviors: Assertion-based schemas for auditable dialogue coding*, y se utiliza a traves del paquete Python `EduBehaviors-kit`.

Tecnicamente no es un modelo generativo, sino un clasificador binario construido sobre el sentence-transformer `sentence-transformers/paraphrase-mpnet-base-v2` (arquitectura MPNet) con una cabeza de regresion logistica. El cuerpo del modelo tiene 109.486.464 parametros y el repositorio ocupa 0,4 GB. Se entreno sobre un subconjunto anotado por LLM del TalkMoves Dataset, con 13.183 ejemplos de entrenamiento, 3.296 de desarrollo y 8.236 de test.

Su relevancia es fundamentalmente metodologica: ilustra un enfoque de etiquetado asistido por LLM para construir esquemas de codificacion de dialogo auditables, con metricas publicadas de forma transparente. Conviene senalar que su rendimiento en test es bajo (F1 de 0,3514 en la clase positiva), por lo que el propio autor advierte que no es util por si solo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit sobre sentence-transformer MPNet (cuerpo `paraphrase-mpnet-base-v2`) + cabeza LogisticRegression |
| Parametros totales | 109.486.464 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base `paraphrase-mpnet-base-v2` opera con una longitud maxima de secuencia de 128 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura sigue el paradigma SetFit: en una primera fase contrastiva se ajusta el cuerpo de un sentence-transformer (`sentence-transformers/paraphrase-mpnet-base-v2`, basado en MPNet) para generar embeddings de frase discriminativos; en una segunda fase se entrena una cabeza de clasificacion de tipo `LogisticRegression` sobre esos embeddings. El texto de entrada se construye directamente con la intervencion (`{utterance}`) sin plantilla adicional. Los hiperparametros declarados son: learning rate del cuerpo 2e-05, learning rate de la cabeza 0,01, batch size 16 en la fase contrastiva y 32 en la cabeza, 10 epochs, max steps 5000 (fase contrastiva), eval max steps 100, semilla 20260904 y precision mixta activada en GPU.

Los datos proceden del subconjunto anotado por LLM del TalkMoves Dataset, con 13.183 filas de entrenamiento (53,3%), 3.296 de desarrollo (13,3%) y 8.236 de test (33,3%). La tasa base de ejemplos positivos es del 3,6% global (3,7% en train, 4,0% en dev, 3,3% en test), lo que refleja un problema fuertemente desbalanceado. Las etiquetas fueron generadas por anotadores LLM, no por codificadores humanos, y el acuerdo entre anotadores medido con alfa de Krippendorff es de 0,430. El modelo se entreno exclusivamente con intervenciones de docentes.

## Capacidades

- Clasificacion binaria de texto: predice si una intervencion docente cumple la asercion "invita a anadir algo sobre una contribucion previa de un estudiante".
- Salida de probabilidad mediante `predict_proba`, que devuelve `[P(no), P(si)]`, util para umbralizar decisiones en pipelines.
- Integracion con la libreria `setfit` y exposicion de embeddings del cuerpo MPNet para tareas auxiliares de similitud semantica.
- Uso como componente dentro del paquete `EduBehaviors-kit` para codificacion de dialogo en el aula.
- Funciona sobre una unica intervencion de texto (`{utterance}`), sin requerir el contexto completo de la conversacion en el prompt.
- Idioma: unicamente ingles.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni capacidades de agente; es un clasificador puro.

## Casos de uso

- Preanotacion de corpus educativos: usar el clasificador para etiquetar automaticamente grandes volumenes de transcripciones de aula y reducir el trabajo de codificacion humana, revisando despues las predicciones con mayor probabilidad.
- Investigacion sobre discurso en el aula: integrarlo en estudios sobre patrones de interaccion docente-estudiante, combinando esta asercion con otras del conjunto `td` para construir perfiles de comportamiento.
- Extraccion de caracteristicas para analisis cuantitativo: emplear `predict_proba` como variable continua en modelos estadisticos que relacionen el discurso con resultados de aprendizaje.
- Filtrado en tiempo casi real de sesiones grabadas: marcar segmentos candidatos donde el docente invita a ampliar la intervencion de un estudiante para su posterior inspeccion cualitativa.
- Entrenamiento de docentes: generar informes sobre la frecuencia con que se fomenta la participacion ampliada de los estudiantes, como retroalimentacion formativa.
- Componente de un pipeline de codificacion auditable: al ser parte del esquema *EduBehaviors*, permite trazar que asercion se ha evaluado y con que modelo, facilitando la reproducibilidad del etiquetado.
- Anotacion asistida con humano en el bucle: dado el bajo F1, usarlo como sug eridor que el codificador humano acepta o corrige, nunca como etiquetador autonomo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 3.296 | 4,0% | 0,550 | 0,333 | 0,415 | 0,813 | 0,402 |
| test | 8.236 | 3,3% | 0,426 | 0,299 | 0,351 | 0,805 | 0,270 |

Metricas del `model-index` para el split de test: F1 0,3514, precision 0,4263, recall 0,2989 y ROC-AUC 0,805.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo tiene unos 109,5 millones de parametros, lo que equivale aproximadamente a 438 MB en FP32 y 219 MB en FP16. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre es suficiente; tambien es viable en CPU.
- Cabe en GPU consumer: si, en practicamente todas (desde una GTX 1050 en adelante, e incluso en CPU con latencias razonables para lotes pequenos).
- Opciones de despliegue: `setfit` (via `SetFitModel.from_pretrained`), `sentence-transformers` para el cuerpo, HuggingFace Transformers para el encoder subyacente y exportacion a ONNX para servir en CPU. vLLM, llama.cpp u Ollama no aplican, al no ser un modelo generativo ni publicarse pesos GGUF.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No se han encontrado en la informacion proporcionada clasificadores de aserciones comparables con metricas publicadas. La unica referencia concreta disponible es el modelo base sobre el que se construye.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| assertion_invites_an_addition_to_a_prior_student_contribution | 109.486.464 | no disponible (base: 128 tokens) | Clasificacion binaria de una asercion de discurso en aula | no disponible | HuggingFace (StanfordSCALE) |
| sentence-transformers/paraphrase-mpnet-base-v2 | 109 millones aprox. | 128 tokens (modelo base) | Embeddings de frase y similitud semantica | Apache 2.0 (segun el modelo base) | HuggingFace |

## Limitaciones y advertencias

- Las etiquetas proceden de anotadores LLM, no de codificadores humanos; el acuerdo entre anotadores es bajo (alfa de Krippendorff de 0,430), lo que limita el techo de rendimiento alcanzable.
- El F1 en test es de 0,351 y el propio autor indica explicitamente que el modelo no funciona lo suficientemente bien como para usarse de forma autonoma.
- El recall es muy bajo (0,299 en test): se pierden aproximadamente dos tercios de los casos positivos.
- Entrenado solo con intervenciones de docentes; su comportamiento sobre habla de estudiantes no se ha evaluado.
- Idioma limitado al ingles.
- No se especifica licencia, por lo que el uso comercial queda en un estado legal indeterminado y requiere consulta previa con el autor.
- Problema fuertemente desbalanceado (tasa base de positivos del 3,3-4,0%), lo que exige ajustar el umbral de decision segun el objetivo y usar `predict_proba` en lugar de la etiqueta binaria por defecto.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos y falsos negativos con precision y recall moderados.
- El modelo no debe desplegarse en produccion para decisiones sobre estudiantes sin supervision humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_invites_an_addition_to_a_prior_student_contribution
- Dataset: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset (GitHub): https://github.com/SumnerLab/TalkMoves
- Paquete Python mencionado: `EduBehaviors-kit` (sin URL disponible en la informacion proporcionada)
