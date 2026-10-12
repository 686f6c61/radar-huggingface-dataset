# StanfordSCALE/assertion_references_a_prior_lesson

## Resumen

`StanfordSCALE/assertion_references_a_prior_lesson` es un clasificador binario de texto desarrollado por la Stanford SCALE Initiative dentro del proyecto EduBehaviors, un marco de esquemas basados en aserciones para la codificacion auditable de dialogos. El modelo detecta si una intervencion docente concreta contiene una referencia explicita a una leccion previa (assertion id `bu5__references_a_prior_lesson`), una de las multiples aserciones del conjunto bottom-up `bu5`. No es un modelo generativo: se trata de un clasificador especializado entrenado para producir etiquetas y probabilidades sobre utterances individuales de profesor.

Tecnicamente se apoya en SetFit, una tecnica de fine-tuning eficiente en pocos ejemplos que combina un encoder de frases (el cuerpo) con una cabeza de clasificacion ligera. El cuerpo es `sentence-transformers/paraphrase-mpnet-base-v2`, un transformer MPNet de 109.486.464 parametros, sobre el que se anade una regresion logistica como cabeza. El modelo se entrena sobre un subconjunto anotado por LLM del TalkMoves Dataset y se distribuye a traves del paquete Python `EduBehaviors-kit`.

Su relevancia radica en el nicho: es una herramienta de investigacion educativa para analizar discurso de aula a escala, con un enfoque de anotacion auditable y reproducible. La tasa base de la clase positiva es extremadamente baja (en torno al 1 %), lo que condiciona por completo su comportamiento en produccion y explica las metricas obtenidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit: encoder transformer MPNet (`paraphrase-mpnet-base-v2`) + cabeza `LogisticRegression` |
| Parametros totales | 109.486.464 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea | clasificacion de texto binaria (`text-classification`) |
| Modelo base | sentence-transformers/paraphrase-mpnet-base-v2 |
| Libreria | setfit |
| Tamano del repo | 0,4 GB |

## Arquitectura y entrenamiento

El modelo sigue el paradigma SetFit en dos fases. En primer lugar, el encoder MPNet se ajusta con aprendizaje contrastivo (contrastive phase) con un learning rate de 2e-05, batch size 16, hasta un maximo de 5.000 pasos y 100 pasos maximos de evaluacion, durante 10 epocas. En segundo lugar, se entrena la cabeza de regresion logistica con un learning rate de 0,01 y batch size 32. Se habilito precision mixta en GPU y se uso una semilla fija (20260904). Este diseno permite obtener un clasificador solido con relativamente pocas etiquetas positivas.

Los datos de entrenamiento provienen del subconjunto `StanfordSCALE/assertions_llm_annotated_talkmoves`, con 13.185 ejemplos de entrenamiento (53,3 %), 3.294 de validacion (13,3 %) y 8.236 de test (33,3 %). Las etiquetas fueron generadas por anotadores LLM, no por codificadores humanos, con una concordancia entre anotadores medida por alfa de Krippendorff de 0,706 para esta asercion. La tasa base de la clase positiva es del 1,0 % global (0,9 % en train, 1,1 % en dev, 1,0 % en test). El texto de entrada se construye simplemente con el utterance tal cual, sin plantilla adicional.

## Capacidades

- Clasificacion binaria de utterances: devuelve 1 cuando la asercion "referencia a una leccion previa" se cumple y 0 en caso contrario.
- Prediccion probabilistica mediante `predict_proba`, que devuelve `[P(no), P(yes)]` para cada texto.
- Procesamiento de una unica frase o utterance de habla docente como unidad de entrada.
- Integracion directa con la libreria `setfit` mediante `SetFitModel.from_pretrained`.
- Uso dentro del ecosistema `EduBehaviors-kit` para codificacion de dialogo basada en aserciones.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, function calling ni capacidades de agente.
- Capacidad multilingue limitada al ingles (idioma declarado: en).
- No dispone de modo de pensamiento (thinking mode), audio ni otras modalidades.

## Casos de uso

- Codificacion automatizada de discurso de aula: el clasificador etiqueta utterances de profesor para identificar cuando se hace referencia a una leccion anterior, reduciendo el coste de la codificacion manual en estudios educativos a gran escala.
- Investigacion en ciencias del aprendizaje: permite analizar corpus de transcripciones docentes y cuantificar la frecuencia de referencias a lecciones previas como indicador de cohesion instruccional.
- Auditoria de practicas docentes: al formar parte de un esquema de aserciones auditables, facilita la trazabilidad de las decisiones de etiquetado en evaluaciones de calidad educativa.
- Supervision y formacion docente: analizar grabaciones o transcripciones de clase para dar retroalimentacion objetiva sobre el uso de conexiones con contenidos previos.
- Construccion de datasets anotados: sirve como preanotador para acelerar el etiquetado humano de corpus de habla docente, que despues se revisan manualmente.
- Investigacion comparativa entre asignaturas o niveles: al aplicar el mismo clasificador a distintos corpus, permite comparar patrones discursivos de forma consistente.
- Preprocesado en pipelines de analitica educativa: integrar el modelo como componente de un sistema mayor que combine varias aserciones `bu5` para caracterizar sesiones completas de clase.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card para la asercion `assertion_references_a_prior_lesson` sobre el dataset `StanfordSCALE/assertions_llm_annotated_talkmoves`:

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 3.294 | 1,1 % | 0,565 | 0,371 | 0,448 | 0,771 | 0,397 |
| test | 8.236 | 1,0 % | 0,755 | 0,488 | 0,593 | 0,866 | 0,529 |

Metricas de test de la model-index oficial: F1 (clase positiva) 0,5926; precision 0,7547; recall 0,4878; ROC-AUC 0,866. Todos los valores estan marcados como no verificados (`verified: false`) en la model-index.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene unos 109,5 millones de parametros; en FP32 requiere aproximadamente 0,44 GB solo para pesos, y en FP16 alrededor de 0,22 GB, mas overhead de activaciones y runtime. Es perfectamente desplegable en GPU de gama baja o incluso en CPU.
- GPU recomendadas: cualquier GPU moderna sirve; se puede ejecutar comodamente en tarjetas consumer como RTX 3060, RTX 4090 o inferiores, asi como en GPUs de datacenter (A100, H100) si se comparte infraestructura.
- Compatibilidad con consumer GPU: si, cabe en practicamente cualquier GPU consumer e incluso en CPU para lotes pequenos.
- Opciones de despliegue: `setfit` como via principal; al ser un modelo basado en `sentence-transformers` con cabeza logistica, puede servirse tambien con infraestructura de sentence-transformers. El uso de vLLM, llama.cpp, Ollama o TGI no es aplicable directamente, ya que no es un modelo generativo autorregresivo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la informacion proporcionada. El modelo pertenece a una familia de clasificadores de aserciones `bu5` de la Stanford SCALE Initiative, cada uno entrenado sobre el mismo corpus y con la misma arquitectura SetFit, pero centrado en una asercion distinta. No se han facilitado metricas de esos otros clasificadores para establecer una comparacion cuantitativa.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| StanfordSCALE/assertion_references_a_prior_lesson | 109,5 M | no disponible | Clasificacion binaria de asercion `bu5` | no disponible | HuggingFace |
| Otros clasificadores de aserciones StanfordSCALE (`bu5`) | no disponible | no disponible | Clasificacion binaria de asercion | no disponible | HuggingFace |
| `sentence-transformers/paraphrase-mpnet-base-v2` (modelo base) | 109,5 M | no disponible | Embeddings de frases | Apache-2.0 (segun modelo base) | HuggingFace |

## Limitaciones y advertencias

- Las etiquetas proceden de anotadores LLM, no de codificadores humanos. La concordancia entre anotadores para esta asercion es de alfa de Krippendorff 0,706, lo que implica un nivel de ruido de etiquetado relevante.
- El modelo se entreno exclusivamente con utterances de profesor. Su comportamiento sobre habla de estudiantes no ha sido probado y no se debe asumir que generalice.
- La tasa base de la clase positiva es muy baja (alrededor del 1 %), por lo que el recall es limitado (0,488 en test); se pierden aproximadamente la mitad de los casos positivos.
- Precision moderada en test (0,755) con un F1 de 0,593: existe un numero apreciable de falsos positivos y de falsos negativos.
- El idioma soportado es unicamente el ingles; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- La licencia no esta declarada en la informacion disponible, por lo que no se puede confirmar la viabilidad de uso comercial. Antes de un despliegue en produccion conviene consultar los terminos con el autor.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si existe riesgo de clasificacion incorrecta que puede propagarse a estudios o decisiones posteriores si no se revisa manualmente.
- Es una herramienta de investigacion educativa, no un sistema de evaluacion docente que deba usarse para decisiones de alto impacto sin supervision humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_references_a_prior_lesson
- Dataset de anotacion: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset: https://github.com/SumnerLab/TalkMoves
- Paquete y documentacion adicional (EduBehaviors-kit): no disponible en la informacion proporcionada
- Paper o blog asociado: no disponible en la informacion proporcionada
