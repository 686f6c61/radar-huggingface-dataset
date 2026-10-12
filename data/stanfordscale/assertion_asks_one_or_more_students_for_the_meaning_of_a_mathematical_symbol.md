# StanfordSCALE/assertion_asks_one_or_more_students_for_the_meaning_of_a_mathematical_symbol

## Resumen

`StanfordSCALE/assertion_asks_one_or_more_students_for_the_meaning_of_a_mathematical_symbol` es un clasificador binario de texto desarrollado por la Stanford SCALE Initiative dentro del proyecto EduBehaviors (esquemas de aserciones para codificacion auditable de dialogo en el aula). No es un modelo generativo: es un detector de una asercion concreta, en este caso si una intervencion docente pide a uno o varios alumnos que expliquen el significado de un simbolo matematico. El modelo se integra en el paquete Python `EduBehaviors-kit` y se publica como un artefacto mas de una familia de clasificadores de "talk moves".

Tecnicamente es un modelo SetFit: el cuerpo es el sentence transformer `sentence-transformers/paraphrase-mpnet-base-v2` (arquitectura MPNet, 109.486.464 parametros totales) y la cabeza es una regresion logistica. Esto lo situa en la categoria de clasificadores de texto ligeros, con un repositorio de 0,4 GB, entrenables y desplegables sin GPU dedicada, muy lejos de los LLM generativos en coste de inferencia.

Su relevancia es de nicho pero clara: automatizar el etiquetado de discurso matematico en el aula con un criterio explicito y reproducible, sobre un subconjunto anotado por LLM del dataset TalkMoves. Es util para investigacion educativa y para herramientas de formacion docente, no para tareas generales de lenguaje. El rendimiento declarado es modesto y la clase positiva es extremadamente rara (0,3 % de tasa base global), lo que condiciona por completo su interpretacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit: encoder MPNet (`sentence-transformers/paraphrase-mpnet-base-v2`) + cabeza de regresion logistica |
| Parametros totales | 109.486.464 (109,5 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue el paradigma SetFit en dos fases. En la primera, el cuerpo `paraphrase-mpnet-base-v2` se ajusta con aprendizaje contrastivo (learning rate 2e-05, batch size 16, max steps 5000). En la segunda, se congela el cuerpo y se entrena una cabeza `LogisticRegression` (learning rate 0,01, batch size 32, 10 epocas, eval max steps 100) sobre los embeddings resultantes. Se uso precision mixta en GPU y semilla 20260904. La entrada es la intervencion en crudo, sin plantilla ni prefijo: `{utterance}` tal cual.

Los datos proceden de `StanfordSCALE/assertions_llm_annotated_talkmoves`, un subconjunto anotado por anotadores LLM de intervenciones docentes del TalkMoves Dataset. Los tamanos de split son 13.180 ejemplos de entrenamiento (53,3 %), 3.297 de desarrollo (13,3 %) y 8.238 de test (33,3 %). El etiquetado no es humano: la concordancia entre anotadores medida con alfa de Krippendorff es 0,650. La tasa base de la clase positiva es del 0,3 % global (0,3 % en train, 0,2 % en dev y 0,5 % en test), un desbalance severo que domina las decisiones de umbral y de metrica. El modelo solo se entreno con intervenciones de profesor; no hay evidencia de comportamiento sobre habla de estudiantes.

## Capacidades

- Clasificacion binaria de texto: devuelve 1 cuando la asercion "la intervencion pide a uno o varios estudiantes el significado de un simbolo matematico" se cumple, y 0 en caso contrario.
- Salida probabilistica mediante `predict_proba`, lo que permite ajustar el umbral segun el coste relativo de falsos positivos y falsos negativos.
- Deteccion de un talk move especifico en discurso de aula de matematicas, dentro de un esquema de aserciones "top-down" (`td`) mas amplio.
- Integracion programatica en pipelines de codificacion de dialogo a traves del paquete `EduBehaviors-kit` y de la libreria `setfit`.
- Capacidad multilingue: no. El modelo esta entrenado y evaluado unicamente en ingles.
- Tool calling, function calling, agentes, razonamiento multi-paso, vision, audio o modo "thinking": no aplica, no es un modelo generativo ni multimodal.

## Casos de uso

- Codificacion automatizada de transcripciones de aula: procesar transcripciones de clases de matematicas y marcar automaticamente las intervenciones docentes que piden aclarar el significado de un simbolo, reduciendo el trabajo manual de codificacion en estudios a gran escala.
- Investigacion en educacion matematica: obtener una variable cuantificable sobre la frecuencia y distribucion de este talk move en funcion del profesor, el nivel educativo o el tema, con criterio de anotacion documentado y auditable.
- Formacion y desarrollo profesional docente: analizar grabaciones de clase propias y devolver un informe con ejemplos concretos en los que el profesor solicito explicar un simbolo, como base para la reflexion guiada.
- Segunda pasada sobre datasets ya anotados: usar las probabilidades del modelo como senal de control de calidad para detectar discrepancias en anotaciones previas, dado que la clase positiva es muy poco frecuente y los errores de omision son faciles de pasar por alto.
- Analitica de materiales y plataformas educativas: evaluar guiones de clase o transcripciones de tutoria escrita y medir en que medida se fomenta la comprension notacional frente a la mera mecanizacion.
- Investigacion metodologica sobre anotacion con LLM: comparar el clasificador ligero frente a anotadores LLM en coste y concordancia, ya que los propios datos de entrenamiento provienen de anotacion automatica con alfa de Krippendorff de 0,650.
- Despliegue en entornos sin GPU: al ser un encoder de 109,5 M de parametros, la inferencia puede ejecutarse en CPU, lo que permite integrarlo en servicios modestos o en procesamiento por lotes nocturno.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index y en la model card. No estan verificados por un tercero (`verified: false`).

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 3.297 | 0,2 % | 0,375 | 0,750 | 0,500 | 0,967 | 0,473 |
| test | 8.238 | 0,5 % | 0,568 | 0,538 | 0,553 | 0,861 | 0,393 |

Datos de test tal como figuran en la model-index oficial: F1 (clase positiva) 0,5526; precision 0,5676; recall 0,5385; ROC-AUC 0,8612. La model card anade el average precision de test (0,393) y los resultados de dev, que no aparecen en la model-index.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,44 GB en fp32 y 0,22 GB en fp16 para los 109,5 M de parametros, mas el coste de activaciones del encoder, despreciable frente a modelos generativos.
- GPU recomendadas: no requiere GPU. Cualquier GPU con al menos 2 GB de memoria es suficiente, incluidas GTX 1650, RTX 3060, RTX 4090, A100 o H100. No hay ganancia funcional por usar aceleradores de gama alta.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo de los ultimos diez anos, e incluso en CPU. La inferencia se puede vectorizar por lotes.
- Opciones de despliegue: `setfit` y `sentence-transformers` en Python; exportacion a ONNX o TorchScript para servir con ONNX Runtime; envoltorio propio con FastAPI o similar; Hugging Face Inference Endpoints. vLLM, llama.cpp, Ollama y TGI no son aplicables, ya que no es un modelo autoregresivo generativo con pesos GGUF.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No se han publicado resultados de benchmarks comparativos en la informacion disponible. La tabla siguiente recoge la comparacion estructural con alternativas de la misma categoria; los valores no declarados se marcan como no disponibles.

| Modelo | Parametros | Tarea | Contexto | Licencia | Rendimiento en esta asercion |
|---|---|---|---|---|---|
| Este modelo (StanfordSCALE assertion classifier) | 109,5 M | Clasificacion binaria de un talk move concreto | no disponible | no disponible | F1 0,5526 / ROC-AUC 0,8612 en test |
| `sentence-transformers/paraphrase-mpnet-base-v2` (modelo base sin cabeza) | 109,5 M | Embeddings de frases | no disponible | no disponible | no aplica: no realiza clasificacion supervisada de esta etiqueta |
| Otros clasificadores de aserciones de la familia StanfordSCALE | 109,5 M (misma receta SetFit) | Clasificacion binaria de otras aserciones del esquema `td` | no disponible | no disponible | no disponible en la informacion proporcionada |
| Encoders genericos ajustados para clasificacion de texto (por ejemplo, BERT-base) | ~110 M | Clasificacion de texto generica | no disponible | segun variante | no disponible: no hay evaluacion publicada sobre `assertions_llm_annotated_talkmoves` |

## Limitaciones y advertencias

- Las etiquetas de entrenamiento y evaluacion provienen de anotadores LLM, no de codificadores humanos. La concordancia entre anotadores es de 0,650 (alfa de Krippendorff), lo que fija un techo realista al rendimiento reproducible del modelo.
- Desbalance extremo de clases: la clase positiva representa el 0,3 % global y el 0,5 % en test. Un ROC-AUC alto (0,8612) es compatible con un F1 y un average precision bajos (0,5526 y 0,393), por lo que el modelo no debe evaluarse ni desplegarse sin ajustar el umbral y fijar el coste de falsos positivos y falsos negativos.
- Rendimiento modesto: precision 0,568 y recall 0,538 en test implican que aproximadamente una de cada dos detecciones es incorrecta y que se omite cerca de la mitad de los casos positivos con el umbral por defecto.
- Entrenado solo con intervenciones de profesor. El comportamiento sobre habla de estudiantes no esta probado.
- Limitacion idiomatica: solo ingles. No hay evidencia de transferencia a castellano ni a otras lenguas.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos sobre intervenciones que mencionan simbolos matematicos sin pedir su significado.
- Licencia no disponible: antes de cualquier uso comercial o redistribucion debe aclararse con el autor, ya que la model card no especifica terminos.
- Caveat de reproducibilidad: los resultados de la model-index estan marcados como no verificados. El sesgo del corpus TalkMoves (contexto, nivel educativo, idioma, tipo de aula) condiciona la generalizacion.
- Advertencia de produccion: no usar como unico criterio de evaluacion docente ni en decisiones con consecuencias sobre personas sin revision humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_asks_one_or_more_students_for_the_meaning_of_a_mathematical_symbol
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- Dataset original TalkMoves: https://github.com/SumnerLab/TalkMoves
- Libreria SetFit: https://github.com/huggingface/setfit
- Paquete `EduBehaviors-kit`: mencionado en la model card, enlace no disponible en la informacion proporcionada
- Paper o publicacion asociada al proyecto EduBehaviors: no disponible en la informacion proporcionada
