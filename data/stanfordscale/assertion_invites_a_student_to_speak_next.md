# StanfordSCALE/assertion_invites_a_student_to_speak_next

## Resumen

`StanfordSCALE/assertion_invites_a_student_to_speak_next` es un clasificador binario de texto en ingles desarrollado por la Stanford SCALE Initiative dentro del programa *EduBehaviors: Assertion-based schemas for auditable dialogue coding*. Su funcion es determinar si una intervencion de un docente invita a un estudiante a hablar a continuacion. No es un modelo generativo, sino un clasificador de una sola etiqueta construido con SetFit sobre el encoder `sentence-transformers/paraphrase-mpnet-base-v2` (109.486.464 parametros) mas una cabecera de regresion logistica.

El modelo se entrena sobre un subconjunto anotado por LLM del corpus TalkMoves y forma parte de un conjunto de clasificadores de "aserciones" (esquemas de codificacion de discurso en aula). La relevancia practica esta en que convierte analisis de discurso educativo, tradicionalmente manual y costoso, en una tarea de inferencia automatica con metricas auditables: F1 de 0,8367, precision de 0,8283, recall de 0,8454 y ROC-AUC de 0,9631 sobre el split de test.

Al ser un encoder de 109,5 M de parametros con formato de pesos safetensors, se puede ejecutar en CPU o en cualquier GPU de consumo con un consumo de memoria inferior a 1 GB, lo que lo hace adecuado para desplegarse en herramientas de formacion docente, paneles de observacion de aula o pipelines de investigacion educativa. Su licencia no esta declarada en la model card, dato relevante antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (MPNet, `paraphrase-mpnet-base-v2`) + cabecera de regresion logistica (SetFit) |
| Parametros totales | 109.486.464 (109,5 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 384 tokens (longitud maxima estandar del modelo base; no declarada explicitamente en la model card) |
| Tipos de cuantizacion | No disponible (algunas herramientas como ONNX Runtime permiten int8, pero no esta documentado por el autor) |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Tarea | Clasificacion de texto binaria (text-classification) |
| Libreria | setfit |
| Etiqueta objetivo | `assertion_invites_a_student_to_speak_next` (conjunto de aserciones top-down `td`) |
| Dataset de entrenamiento | `StanfordSCALE/assertions_llm_annotated_talkmoves` |
| Tamano del repositorio | 0,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo sigue el esquema SetFit en dos fases. En la primera, el cuerpo (`paraphrase-mpnet-base-v2`, un encoder MPNet de 12 capas y 768 dimensiones de embedding) se ajusta de forma contrastiva con pares de frases generados a partir de las clases, usando un learning rate de 2e-05, batch de 16, 10 epocas y un maximo de 5000 pasos, con precision mixta activada en GPU. En la segunda fase se congelan los embeddings y se entrena una cabecera `LogisticRegression` con learning rate de 0,01 y batch de 32. La semilla empleada es 20260904 y la evaluacion se limita a 100 pasos maximos. MPNet emplea modelado de lenguaje permutado y codificacion de posicion relativa como rasgos arquitectonicos distintivos del encoder base.

Los datos proceden del subconjunto anotado por LLM del dataset TalkMoves: 13.184 ejemplos de entrenamiento (53,3%), 3.293 de desarrollo (13,3%) y 8.238 de test (33,3%), con una tasa base de etiqueta positiva del 23,1% global (23,5% en train, 23,7% en dev y 22,3% en test). La entrada es la intervencion del docente en crudo, sin plantilla adicional: `{utterance}`. Las etiquetas fueron generadas por anotadores LLM y la concordancia entre ellos medida con alfa de Krippendorff es de 0,820. No se documenta uso de RLHF ni de DPO, algo que no aplica a este tipo de clasificador.

## Capacidades

- Clasificacion binaria de intervenciones docentes: devuelve 1 si la asercion "la intervencion invita a un estudiante a hablar a continuacion" se cumple, y 0 en caso contrario.
- Salida de probabilidad calibrada mediante `predict_proba`, util para umbrales personalizados o para triaje por nivel de confianza.
- Procesamiento de una o varias intervenciones en lote (`model.predict(lista_de_textos)`) con embeddings de 768 dimensiones.
- Funciona como extractor de representaciones reutilizable, ya que el cuerpo puede emplearse como `SentenceTransformer` para similitud semantica en el dominio educativo.
- Integracion en el ecosistema `EduBehaviors-kit`, segun indica el autor, junto a otros clasificadores de aserciones del conjunto top-down.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, generacion de texto, vision ni audio.
- Soporte multilingue limitado al ingles: no se declaran otros idiomas ni evaluacion fuera del ingles.
- No dispone de modo de razonamiento explicito ni de salida de cadena de pensamiento; es un clasificador de una sola etiqueta.

## Casos de uso

- Analisis automatico de discurso en aula a escala: codificar miles de intervenciones docentes de transcripciones de clase para medir la frecuencia de invitaciones a participar, sustituyendo parte del trabajo de codificacion manual en estudios con corpus grandes.
- Formacion y coaching docente: generar informes por sesion que cuantifiquen cuantas intervenciones abren turno al alumnado, con el objetivo de fomentar practicas de discurso dialogico en programas de desarrollo profesional.
- Paneles de observacion en tiempo casi real: al ser un encoder de 109,5 M de parametros, puede ejecutarse en local o en una GPU de gama media y alimentar un panel que muestre indicadores de participacion mientras se transcribe la clase.
- Preanotacion para codificadores humanos: usar el modelo como primera pasada sobre transcripciones y reservar la revision humana para los casos con probabilidad cercana a 0,5, reduciendo el coste del etiquetado con alfa de Krippendorff de referencia de 0,820.
- Investigacion educativa replicable: el modelo, el dataset y la configuracion de hiperparametros estan publicados, lo que permite reproducir el experimento y comparar contra futuras variantes con la misma particion de test de 8.238 ejemplos.
- Modulo de senales en plataformas de aprendizaje o grabacion de clase: integrado como microservicio que recibe la transcripcion por turnos y devuelve la etiqueta y la probabilidad por intervencion del docente.
- Enriquecimiento de datasets de investigacion: anadir la variable "invita a hablar" a corpus de discurso educativo ya transcritos, para despues cruzar con otras aserciones de la misma coleccion y construir perfiless de practica docente.
- Deteccion de sesgos de interaccion a nivel agregado: analizar en que momentos, asignaturas o tipos de actividad se produce un mayor o menor porcentaje de invitaciones a participar, siempre que la unidad de analisis sean las intervenciones docentes y no los estudiantes.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index y en la model card (no verificados de forma independiente, `verified: false`):

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 3.293 | 23,7% | 0,841 | 0,840 | 0,840 | 0,962 | 0,888 |
| test | 8.238 | 22,3% | 0,828 | 0,845 | 0,837 | 0,963 | 0,892 |

Metricas del split de test tal como aparecen en el model-index: F1 (clase positiva) 0,8367; precision 0,8283; recall 0,8454; ROC-AUC 0,9631. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) porque no son aplicables a un clasificador binario de dominio especifico.

## Requisitos de hardware

- Pesos: aproximadamente 438 MB en fp32 y 219 MB en fp16 para 109,5 M de parametros; el repositorio completo ocupa 0,4 GB.
- VRAM estimada para inferencia: menos de 1 GB en fp16 incluyendo activaciones para lotes pequenos; en fp32 en torno a 0,5-0,8 GB. Cabe sobradamente en cualquier GPU de consumo.
- GPU recomendadas: no requiere GPU dedicada. Funciona en CPU para lotes moderados. Cualquier GPU consumer moderna (RTX 3060, RTX 4090, GTX 1650 o superior) es mas que suficiente; en entornos de servidor, T4, L4, A10, A100 o H100 quedan enormemente sobredimensionadas para un encoder de este tamano.
- Opciones de despliegue: libreria `setfit` (con `sentence-transformers` y PyTorch por debajo), exportacion a ONNX con las utilidades de `sentence-transformers`/`optimum`, o servir el encoder con FastAPI, TorchServe o similar. No aplican vLLM, llama.cpp, Ollama ni TGI, porque el modelo no es generativo autoregresivo.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia orientativa basada unicamente en el tamano del encoder, la inferencia por intervencion se situa en el orden de milisegundos en GPU y de decenas de milisegundos en CPU; el autor no publica mediciones.

## Comparativa con modelos similares

No se ha encontrado informacion publica de benchmarks de modelos directamente comparables (clasificadores de movimientos de discurso en aula con la misma tarea y particion). La tabla siguiente recoge lo que si se puede contrastar con los datos disponibles:

| Modelo | Tarea | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `StanfordSCALE/assertion_invites_a_student_to_speak_next` | Clasificacion binaria de invitacion a hablar | 109,5 M | 384 tokens (encoder base) | F1 test 0,837; ROC-AUC 0,963 | No disponible | HuggingFace, 0 descargas |
| `sentence-transformers/paraphrase-mpnet-base-v2` | Embeddings de frases (sin cabecera de clasificacion) | ~109 M | 384 tokens | No aplica metrica de clasificacion; es el modelo base | Apache-2.0 (segun el modelo base) | HuggingFace |
| Otros clasificadores de aserciones del programa EduBehaviors (misma coleccion `StanfordSCALE`) | Clasificacion binaria de aserciones de discurso | Del orden de 109 M, segun el mismo esquema SetFit | 384 tokens | No disponible en la informacion proporcionada | No disponible | HuggingFace |

## Limitaciones y advertencias

- Las etiquetas de entrenamiento proceden de anotadores LLM, no de codificadores humanos; la concordancia entre anotadores es de alfa de Krippendorff 0,820, lo que fija un techo practico de calidad en las etiquetas.
- El modelo se entreno unicamente con intervenciones de docentes. El comportamiento sobre habla de estudiantes no esta probado y no deberia asumirse.
- Desbalanceo de clases: la tasa base de la clase positiva es del 23,1% global. Precision y recall deben interpretarse en ese contexto, y la eleccion del umbral de decision afecta de forma directa al equilibrio entre falsos positivos y falsos negativos.
- Riesgo de falsos positivos en intervenciones que suenan interrogativas pero no buscan ceder el turno, y de falsos negativos ante formulaciones indirectas o ironicas. No es un modelo generativo, por lo que el riesgo de alucinacion se manifiesta como clasificacion incorrecta con alta confianza, no como texto inventado.
- Solo ingles: cualquier uso sobre transcripciones en castellano u otros idiomas queda fuera del alcance declarado y no ha sido evaluado.
- Validacion limitada al mismo dataset (`assertions_llm_annotated_talkmoves`): no hay evaluacion de generalizacion a otros contextos educativos, niveles, asignaturas o paises, por lo que el rendimiento puede degradarse fuera de la distribucion de TalkMoves.
- La licencia no esta declarada. Antes de cualquier uso comercial o de redistribucion es necesario aclarar los terminos con el autor; el modelo base `paraphrase-mpnet-base-v2` se distribuye bajo Apache-2.0, pero la model card de este clasificador no especifica licencia.
- Modelo sin adopcion registrada en HuggingFace (0 descargas, 0 likes) y creado en octubre de 2026, sin validacion independiente por terceros.
- No sustituye la codificacion humana en contextos de evaluacion docente con consecuencias laborales: se recomienda uso como apoyo o preanotacion, no como decision automatica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_invites_a_student_to_speak_next
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Corpus original TalkMoves: https://github.com/SumnerLab/TalkMoves
- Paquete `EduBehaviors-kit` (mencionado por el autor, sin URL publica en la informacion disponible): no disponible
