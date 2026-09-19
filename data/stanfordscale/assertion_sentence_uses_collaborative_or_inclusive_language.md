# StanfordSCALE/assertion_sentence_uses_collaborative_or_inclusive_language

## Resumen

El modelo `StanfordSCALE/assertion_sentence_uses_collaborative_or_inclusive_language` es un clasificador binario de texto desarrollado por la Stanford SCALE Initiative dentro del proyecto *EduBehaviors: Assertion-based schemas for auditable dialogue coding*. Su funcion es determinar si un enunciado docente emplea lenguaje colaborativo o inclusivo, entendido como una de las aserciones codificables del discurso de aula. No es un modelo generativo: se trata de un clasificador de frases construido con SetFit sobre el encoder `sentence-transformers/paraphrase-mpnet-base-v2` y una cabeza de regresion logistica, con 109.486.464 parametros totales y un peso en repositorio de 0,4 GB.

El modelo se entrena sobre un subconjunto de intervenciones docentes del TalkMoves Dataset anotado automaticamente por LLM, con 3.430 ejemplos de entrenamiento, 858 de validacion y 2.146 de test. En el split de test declara un F1 de 0,7655 para la clase positiva, una precision de 0,7514, un recall de 0,7801 y un ROC-AUC de 0,9527. La tasa base de la clase positiva es del 16,2 %, lo que convierte la tarea en un problema claramente desbalanceado.

Su relevancia actual es de nicho pero muy concreta: permite auditar discurso educativo a escala dentro del paquete `EduBehaviors-kit`, sustituyendo parte del trabajo de codificacion manual en investigacion sobre interacciones en el aula. El modelo solo esta entrenado en ingles, unicamente con enunciados de profesorado, y su licencia no esta declarada en la informacion disponible, lo que limita su adopcion comercial directa sin aclaracion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit: encoder transformer MPNet (`paraphrase-mpnet-base-v2`) + cabeza de regresion logistica |
| Parametros totales | 109.486.464 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (limite del encoder MPNet subyacente; no declarado explicitamente en la model card) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en safetensors (aproximadamente fp32, coherente con los 0,4 GB de repositorio para 109,5 M de parametros) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea | clasificacion de texto binaria (`text-classification`) |
| Etiqueta positiva | `assertion_sentence_uses_collaborative_or_inclusive_language` |
| Modelo base | sentence-transformers/paraphrase-mpnet-base-v2 |
| Libreria de inferencia | setfit |
| Dataset de entrenamiento | StanfordSCALE/assertions_llm_annotated_talkmoves |
| Tamano del repositorio | 0,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura sigue el patron SetFit: un encoder de frases MPNet preentrenado (`paraphrase-mpnet-base-v2`) que se afina con aprendizaje contrastivo sobre pares de oraciones, seguido de una cabeza de clasificacion lineal (`LogisticRegression`) entrenada sobre los embeddings resultantes. La model card no detalla la configuracion interna del encoder mas alla del identificador del modelo base. No hay decoder, ni atencion causal, ni generacion autoregresiva: la salida es una probabilidad de clase a traves de `predict_proba`.

El entrenamiento usa el dataset `StanfordSCALE/assertions_llm_annotated_talkmoves`, derivado del TalkMoves Dataset, con 3.430 filas de entrenamiento (53,3 %), 858 de validacion (13,3 %) y 2.146 de test (33,4 %). Los hiperparametros declarados son: learning rate del cuerpo de 2e-05, learning rate de la cabeza de 0,01, batch size de 16 en la fase contrastiva y 32 en la cabeza, 10 epocas, un maximo de 5.000 pasos en la fase contrastiva, 100 pasos maximos de evaluacion, semilla 20260904 y precision mixta activada en GPU. Las etiquetas no provienen de codificadores humanos, sino de anotadores LLM, con un alfa de Krippendorff de 0,559 para esta asercion concreta.

## Capacidades

- Clasificacion binaria de enunciados: devuelve 1 cuando el enunciado usa lenguaje colaborativo o inclusivo y 0 en caso contrario, con probabilidad asociada via `predict_proba`.
- Deteccion de una unica asercion del esquema EduBehaviors; no realiza clasificacion multietiqueta ni multitarea.
- Inferencia sobre frases sueltas: la entrada se construye como `{utterance}` sin plantilla adicional ni contexto conversacional.
- Integracion con el paquete Python `EduBehaviors-kit` para pipelines de codificacion de dialogo educativo auditable.
- Compatible con el ecosistema SetFit (`SetFitModel.from_pretrained`) y, por tanto, exportable a otros formatos de inferencia de la propia libreria.
- Capacidad multilingue: ninguna; el modelo esta entrenado y declarado unicamente para ingles.
- Sin soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento: no es un modelo generativo ni multimodal.

## Casos de uso

- Auditoria de discurso de aula a escala: procesar transcripciones completas de clases y marcar automaticamente las intervenciones del docente que usan lenguaje colaborativo o inclusivo, sustituyendo la codificacion manual en estudios con cientos de horas de grabacion.
- Formacion y coaching docente: generar informes por sesion que cuantifiquen la proporcion de enunciados inclusivos frente al total, usando la probabilidad de salida como indicador continuo y no solo como etiqueta binaria.
- Investigacion educativa replicable: reanalizar el TalkMoves Dataset u otros corpus de aula con una definicion operativa fija y auditable de "lenguaje colaborativo", evitando la variabilidad entre codificadores humanos.
- Preanotacion en pipelines de etiquetado humano: usar el clasificador como primera pasada para reducir el volumen de frases que un codificador humano debe revisar, dado el ROC-AUC de 0,9527 que permite ordenar por probabilidad y priorizar los casos dudosos.
- Filtrado previo en analisis de clases online: en plataformas de videoconferencia educativa, marcar en tiempo casi real los turnos de intervencion del profesorado que cumplen la asercion, siempre con la advertencia de que solo se ha validado sobre habla docente.
- Deteccion de sesgos de participacion: cruzar la etiqueta con metadatos de la sesion (asignatura, nivel, idioma del alumnado) para estudiar en que condiciones aparece menos lenguaje inclusivo y guiar intervenciones.
- Analisis de materiales curriculares escritos: aplicar el clasificador a guiones de clase, rúbricas o enunciados de actividades para comprobar si el lenguaje empleado es colaborativo, asumiendo riesgo de deriva de dominio al no haberse entrenado con ese tipo de texto.
- Enrutado barato dentro de un pipeline con LLM: usar este clasificador de 109 M de parametros como filtro previo para decidir que fragmentos merecen un analisis mas costoso con un modelo generativo grande.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index, sobre el split de test del dataset `StanfordSCALE/assertions_llm_annotated_talkmoves`. Ninguno de los resultados esta verificado de forma independiente (`verified: false`).

| Metrica | Split test | Split dev |
|---|---|---|
| n | 2.146 | 858 |
| Tasa base (clase positiva) | 15,9 % | 14,7 % |
| Precision (clase positiva) | 0,7514 | 0,792 |
| Recall (clase positiva) | 0,7801 | 0,754 |
| F1 (clase positiva) | 0,7655 | 0,772 |
| ROC-AUC | 0,9527 | 0,941 |
| Average precision | 0,833 | 0,834 |

No se han publicado en la informacion disponible comparaciones con MMLU, HumanEval, GSM8K ni otros benchmarks generalistas, que por otra parte no aplican a un clasificador de frases de dominio especifico.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,44 GB de pesos en fp32, unos 0,22 GB en fp16 y unos 0,11 GB en int8, mas el espacio de activaciones (dependiente del batch y de la longitud de secuencia).
- GPU recomendadas: cualquier GPU con 2 GB o mas de memoria es suficiente. Una RTX 3060, RTX 4090 o T4 van sobradamente dimensionadas; no se necesita A100 ni H100 para inferencia.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna e incluso en iGPU con memoria compartida suficiente. Tambien es viable la inferencia exclusiva en CPU dado el tamano del modelo.
- Opciones de despliegue: libreria `setfit` (via `SetFitModel.from_pretrained`), `sentence-transformers` para el encoder, exportacion a ONNX con Optimum y ejecucion con ONNX Runtime, y servido mediante FastAPI, BentoML, TorchServe o Hugging Face Inference Endpoints. vLLM, TGI y llama.cpp no aplican: no es un modelo decoder ni se distribuye en GGUF.
- Latencia y throughput estimados: no disponible; la model card no publica mediciones de latencia ni de frases por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| assertion_sentence_uses_collaborative_or_inclusive_language | 109.486.464 | 512 tokens (encoder MPNet) | Clasificacion binaria de lenguaje colaborativo en discurso docente | no disponible | HuggingFace, via `EduBehaviors-kit` |
| sentence-transformers/paraphrase-mpnet-base-v2 (modelo base) | 109.486.464 (mismo encoder) | 512 tokens | Embeddings de frases; no clasifica por si solo | no disponible en la informacion proporcionada | HuggingFace |
| Otros clasificadores de aserciones de StanfordSCALE (familia EduBehaviors) | no disponible | no disponible | Clasificacion de otras aserciones del esquema | no disponible | referenciados por el autor, sin ficha detallada en la informacion proporcionada |
| Clasificadores zero-shot basados en NLI (por ejemplo, modelos tipo BART-MNLI) | no disponible | no disponible | Clasificacion zero-shot generica | no disponible | no disponible |

La informacion proporcionada no incluye datos comparativos verificados con alternativas de la misma categoria, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Las etiquetas proceden de anotadores LLM, no de codificadores humanos. El alfa de Krippendorff de la asercion es 0,559, un acuerdo solo moderado, por lo que el techo de rendimiento del clasificador esta acotado por la calidad de esas etiquetas.
- Los resultados del model-index estan marcados como no verificados (`verified: false`) y no han sido reproducidos de forma independiente.
- Entrenado exclusivamente con enunciados de profesorado. El comportamiento sobre habla de estudiantes no se ha probado y no deberia asumirse.
- Solo ingles. Cualquier uso en castellano u otros idiomas carece de validacion.
- Fuerte desbalance de clases: la clase positiva representa el 16,2 % del total. La precision y el recall deben interpretarse siempre en ese contexto de prevalencia; al aplicar el modelo a poblaciones con tasas base distintas el punto de corte optimo cambia.
- Al ser un clasificador discriminativo no genera texto y, por tanto, no alucina en el sentido usual, pero si produce falsos positivos y falsos negativos que pueden propagarse a metricas agregadas si se usan sin revision.
- La licencia no esta declarada, lo que impide confirmar si el uso comercial esta permitido. Se recomienda contactar con el autor antes de integrarlo en un producto.
- Deriva de dominio probable fuera del corpus de origen: el dataset de test proviene del TalkMoves Dataset y no se documentan pruebas de generalizacion a otras asignaturas, niveles educativos o paises.
- No dispone de historial de uso: 0 descargas y 0 likes en el momento de la consulta, por lo que no existe evidencia comunitaria de robustez en produccion.
- Los resultados de busqueda web asociados a esta consulta no contienen informacion relevante sobre el modelo (corresponden a foros de videojuegos de motocross), por lo que no aportan contexto adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_sentence_uses_collaborative_or_inclusive_language
- Dataset de entrenamiento: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- Repositorio del TalkMoves Dataset: https://github.com/SumnerLab/TalkMoves
- Cita sugerida por el autor: Stanford SCALE Initiative, *Assertion classifier: sentence uses collaborative or inclusive language*, 2026, https://huggingface.co/StanfordSCALE/assertion_sentence_uses_collaborative_or_inclusive_language
- Paper, blog o demo adicionales: no disponible en la informacion proporcionada.
