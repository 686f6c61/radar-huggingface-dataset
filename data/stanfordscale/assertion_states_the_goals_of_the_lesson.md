# StanfordSCALE/assertion_states_the_goals_of_the_lesson

## Resumen

`StanfordSCALE/assertion_states_the_goals_of_the_lesson` es un clasificador binario de texto desarrollado por la Stanford SCALE Initiative dentro del proyecto EduBehaviors, un conjunto de esquemas basados en aserciones para la codificacion auditable de discurso en el aula. El modelo resuelve una tarea muy concreta: determinar si un enunciado de un docente afirma o declara los objetivos de la leccion. No es un modelo generativo, sino un clasificador de una unica etiqueta construido con la libreria SetFit.

Tecnicamente, se apoya en un cuerpo Sentence Transformer (`sentence-transformers/paraphrase-mpnet-base-v2`, basado en arquitectura MPNet) sobre el que se anade una cabeza de regresion logistica. El total de parametros asciende a 109.486.464 y el repositorio ocupa 0,4 GB en formato safetensors. Se entreno sobre un subconjunto anotado por anotadores LLM del TalkMoves Dataset, con 13.181 ejemplos de entrenamiento, 3.297 de desarrollo y 8.237 de test.

Su relevancia es acotada y de nicho: forma parte de una familia de clasificadores de aserciones orientados a la investigacion educativa y al analisis de discurso en el aula. El propio autor advierte que el rendimiento en test (F1 de 0,317) no es suficiente para usarlo de forma autonoma, por lo que debe contemplarse como un componente mas dentro de un pipeline de codificacion, no como una solucion final. La licencia no esta declarada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit: cuerpo Sentence Transformer MPNet (`paraphrase-mpnet-base-v2`) + cabeza LogisticRegression |
| Parametros totales | 109.486.464 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF ni cuantizadas) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea | text-classification (binaria) |
| Libreria | setfit |
| Modelo base | sentence-transformers/paraphrase-mpnet-base-v2 |
| Tamano del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

El modelo sigue el paradigma SetFit, que combina un ajuste fino contrastivo de un Sentence Transformer con un clasificador lineal ligero. El cuerpo es `sentence-transformers/paraphrase-mpnet-base-v2`, una red MPNet de proposito general orientada a similitud semantica. Sobre las representaciones generadas se entrena una cabeza `LogisticRegression`, lo que reduce la necesidad de datos etiquetados y acelera la inferencia respecto a un ajuste fino completo de clasificacion.

El entrenamiento se realizo sobre el dataset `StanfordSCALE/assertions_llm_annotated_talkmoves`, con 13.181 filas (53,3 %) de train, 3.297 (13,3 %) de dev y 8.237 (33,3 %) de test. Las etiquetas no provienen de codificadores humanos, sino de anotadores LLM, con un acuerdo entre anotadores medido por alfa de Krippendorff de 0,579. La tasa base de la clase positiva es muy baja: 1,7 % global (1,6 % en train, 1,9 % en dev, 1,6 % en test). Los hiperparametros incluyen learning rate de 2e-05 para el cuerpo y 0,01 para la cabeza, batch size de 16 en la fase contrastiva y 32 en la cabeza, 10 epocas, un maximo de 5.000 pasos (con 100 pasos maximos de evaluacion), semilla 20260904 y precision mixta habilitada en GPU. El texto de entrada se construye simplemente con el enunciado `{utterance}` sin plantilla adicional.

## Capacidades

- Clasificacion binaria de enunciados docentes: devuelve 1 cuando el enunciado declara los objetivos de la leccion y 0 en caso contrario.
- Salida de probabilidad calibrada mediante `predict_proba`, util para umbralizar de forma flexible.
- Integracion en el paquete Python `EduBehaviors-kit` para flujos de codificacion de discurso educativo.
- Uso como componente dentro de esquemas de aserciones top-down (identificador `td__the_utterance_states_the_goals_of_the_lesson`).
- No soporta generacion de texto, tool calling, agentes, vision, audio ni razonamiento multi-paso.
- Capacidad multilingue: no, unicamente ingles.

## Casos de uso

- Analisis de discurso en el aula a gran escala: procesar transcripciones de clases para cuantificar con que frecuencia los docentes explicitan los objetivos de la leccion en un corpus de investigacion educativa.
- Anotacion asistida para investigadores: usar las probabilidades del modelo como prefiltro y priorizar la revision humana de los casos con mayor puntuacion.
- Auditoria de practicas docentes: generar indicadores agregados sobre claridad instruccional en programas de formacion del profesorado.
- Investigacion en ciencias del aprendizaje: alimentar estudios sobre relaciones entre claridad de objetivos y resultados de aprendizaje.
- Componente de un pipeline multi-etiqueta: combinarlo con otros clasificadores de aserciones del proyecto EduBehaviors para reconstruir un perfil completo de la interaccion docente.
- Prototipado rapido en educacion: dado que el modelo es pequeno (110 millones de parametros) y corre en CPU, permite validar hipotesis de investigacion antes de invertir en anotacion humana.
- Enriquecimiento de sistemas de observacion docente: incorporar la senal de "objetivos explicitados" a dashboards de analisis de clase.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados). Tarea: text-classification binaria sobre el dataset `StanfordSCALE/assertions_llm_annotated_talkmoves`.

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 3.297 | 1,9 % | 0,488 | 0,328 | 0,392 | 0,739 | 0,288 |
| test | 8.237 | 1,6 % | 0,398 | 0,263 | 0,317 | 0,782 | 0,244 |

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,4-0,5 GB en fp32 y aproximadamente 0,25 GB en fp16 para los pesos del cuerpo MPNet; muy por debajo de cualquier GPU moderna.
- Cabe sin problema en GPU de consumo: GTX 1650, RTX 3060, RTX 4090 y similares, e incluso en CPU dedicada para lotes moderados.
- GPU de datacenter (A100, H100) no necesarias; solo tendrian sentido para procesar volumenes masivos en paralelo.
- Opciones de despliegue: libreria `setfit` (referencia de uso oficial), y potencialmente `sentence-transformers` o pipelines de clasificacion de `transformers` para exportar el cuerpo. No se publican variantes GGUF ni soporte declarado para vLLM, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Dentro de la familia de clasificadores de aserciones del proyecto EduBehaviors existen otros modelos con la misma arquitectura SetFit, aunque no se dispone de sus especificaciones en la informacion facilitada.

| Modelo | Arquitectura | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `StanfordSCALE/assertion_states_the_goals_of_the_lesson` | SetFit (MPNet + LogisticRegression) | 109.486.464 | no disponible | en | no disponible | HuggingFace |
| `sentence-transformers/paraphrase-mpnet-base-v2` (modelo base) | MPNet | ~109 millones | no disponible | en (principalmente) | Apache-2.0 (segun su propia card, no confirmado aqui) | HuggingFace |
| Otros clasificadores de aserciones de `StanfordSCALE` | SetFit | no disponible | no disponible | en | no disponible | HuggingFace |

No se dispone de datos de rendimiento de modelos alternativos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Las etiquetas proceden de anotadores LLM, no de codificadores humanos; el acuerdo entre anotadores (alfa de Krippendorff) es de 0,579, lo que limita la fiabilidad del ground truth.
- El modelo se entreno unicamente con enunciados de docentes; su comportamiento sobre intervenciones de estudiantes no ha sido evaluado.
- El F1 en test es de 0,317, y el propio autor indica explicitamente que no funciona lo suficiente bien para usarse de forma autonoma. Requiere supervision humana o combinacion con otras senales.
- El recall es bajo (0,263 en test), por lo que tiende a perder casos positivos en un escenario de clase muy desbalanceada (tasa base del 1,6 %).
- La licencia no esta declarada, lo que impide confirmar si se permite el uso comercial. Debe tratarse como restriccion critica antes de cualquier despliegue en produccion.
- Solo soporta ingles; su uso con transcripciones en otros idiomas no esta validado.
- No se han publicado especificaciones de longitud de contexto, cuantizacion ni latencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_states_the_goals_of_the_lesson
- Dataset de entrenamiento: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset: https://github.com/SumnerLab/TalkMoves
- Paquete `EduBehaviors-kit`: no disponible (mencionado en la model card sin enlace)
