# StanfordSCALE/assertion_references_an_activity_from_earlier_in_the_session

## Resumen

El modelo `StanfordSCALE/assertion_references_an_activity_from_earlier_in_the_session` es un clasificador binario de texto desarrollado por la Stanford SCALE Initiative dentro del proyecto *EduBehaviors: Assertion-based schemas for auditable dialogue coding*. Su tarea concreta es determinar si un enunciado de un docente hace referencia a una actividad que ya ha ocurrido antes en la misma sesion de clase. Pertenece a un conjunto de clasificadores de "assertions" (asericiones) que descomponen el analisis del discurso en el aula en unidades verificables y auditables, y se integra en el paquete Python `EduBehaviors-kit`.

Tecnicamente no es un modelo generativo: se trata de un modelo SetFit compuesto por un encoder de frases `sentence-transformers/paraphrase-mpnet-base-v2` (arquitectura MPNet, 109.486.464 parametros) afinado con aprendizaje contrastivo y una cabeza de regresion logistica. El repositorio ocupa 0,4 GB y los pesos se distribuyen en formato safetensors. Se entreno sobre un subconjunto anotado por LLM de intervenciones de profesorado del TalkMoves Dataset, con 13.181 ejemplos de entrenamiento, 3.296 de desarrollo y 8.238 de test.

Su relevancia es metodologica: ejemplifica la anotacion automatica de discurso educativo con etiquetas generadas por LLM y acuerdo interanotador medido (alpha de Krippendorff de 0,533), y ademas publica una evaluacion honesta con un F1 de clase positiva de 0,4021 en test. El rendimiento es bajo para uso autonomo, pero puede ser util como preanotador en flujos de codificacion asistida. Solo esta disponible en ingles y su licencia no esta declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit: encoder transformer MPNet (sentence-transformers/paraphrase-mpnet-base-v2) con pooling + cabeza de regresion logistica |
| Parametros totales | 109.486.464 (dato real del safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (maximo de secuencia del modelo base MPNet; no especificado explicitamente en la model card) |
| Tipos de cuantizacion | no disponible; el autor no publica variantes cuantizadas (solo safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `setfit`) |

## Arquitectura y entrenamiento

El modelo sigue el paradigma SetFit para clasificacion de texto con pocos ejemplos. La "cuerpo" del modelo es `sentence-transformers/paraphrase-mpnet-base-v2`, un encoder MPNet-base preentrenado con masked and permuted language modeling y afinado para similitud semantica. Sobre las representaciones pooled de ese encoder se anade una cabeza de regresion logistica. El entrenamiento tiene dos fases: una fase contrastiva sobre pares de frases (learning rate del cuerpo 2e-05, batch size 16, max steps 5000) y una fase de ajuste de la cabeza (learning rate 0,01, batch size 32). En total, 10 epochs, `eval_max_steps` 100, semilla 20260904 y precision mixta activada en GPU.

Los datos proceden de `StanfordSCALE/assertions_llm_annotated_talkmoves`, derivado del TalkMoves Dataset y compuesto por intervenciones de docentes. El reparto es de 13.181 filas de entrenamiento (53,3%), 3.296 de desarrollo (13,3%) y 8.238 de test (33,3%). La tasa base de ejemplos positivos es muy baja: 2,9% global, con 3,0% en train, 3,2% en dev y 2,8% en test, lo que convierte el problema en un caso claro de desbalanceo extremo de clases. Las etiquetas fueron generadas por anotadores LLM y no por codificadores humanos; el acuerdo interanotador de esta asercion concreta es de 0,533 en alpha de Krippendorff, un valor moderado que introduce ruido de etiqueta. El texto de entrada se construye simplemente con el enunciado (`{utterance}`), sin plantilla adicional, y el modelo expone dos columnas: `assertion_references_an_activity_from_earlier_in_the_session` y `split_references_an_activity_from_earlier_in_the_session`.

## Capacidades

- Clasificacion binaria de texto: predice si un enunciado docente hace referencia a una actividad anterior de la sesion (`model.predict` devuelve 1 cuando la asercion se cumple).
- Puntuacion de probabilidad: `model.predict_proba` devuelve `[[P(no), P(yes)]]`, lo que permite fijar umbrales de decision distintos de 0,5 y adaptar el equilibrio precision/recall.
- Codificacion de discurso en el aula: forma parte del esquema auditable de aserciones EduBehaviors, orientado a analisis de conversaciones educativas.
- Anotacion asistida por lotes: al ser un encoder de 109M de parametros, puede aplicarse sobre corpus completos de utterances con coste bajo.
- Procesamiento de enunciados cortos en ingles: el modelo opera sobre el utterance tal cual, sin contextos de multiples turnos.
- Integracion mediante libreria: se usa con el paquete `EduBehaviors-kit` y con la API estandar de `setfit.SetFitModel`.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio, generacion de texto ni modo de razonamiento explicito.

## Casos de uso

- Preanotacion de corpus de discurso educativo: aplicar el clasificador sobre transcripciones completas de clase para marcar candidatos a "referencia a una actividad anterior" y reducir el volumen de texto que un codificador humano debe revisar manualmente.
- Investigacion en didactica de las matematicas y ciencias: cuantificar con que frecuencia el profesorado ancla sus intervenciones en actividades previas dentro de la misma sesion, como variable de analisis en estudios sobre coherencia instruccional.
- Etiquetado dentro del pipeline EduBehaviors: usar el modelo como uno de los modulos de aserciones del kit, combinando su salida con las de otros clasificadores del conjunto `bu5` para reconstruir esquemas de comportamiento docente auditables.
- Auditoria de calidad de anotaciones: comparar las predicciones del modelo con las etiquetas asignadas a mano para detectar discrepancias sistematicas y estimar la dificultad de la asercion.
- Ayuda a la formacion docente: en herramientas de reflexion sobre la practica, generar indicadores de "conexion con lo ya trabajado" a partir de grabaciones transcritas, siempre con revision humana.
- Cribado rapido en anotacion activa: dado que los positivos son solo el 2,8% del test, emplear `predict_proba` como ranking para seleccionar los casos mas informativos que enviar a un anotador humano.
- Filtrado de conjuntos de datos de investigacion: descartar o marcar utterances con alta probabilidad de contener una referencia retrospectiva antes de construir subcorpus tematicos.
- Adaptacion a nuevos dominios educativos: reentrenar la cabeza logistica sobre un corpus etiquetado propio reutilizando el encoder MPNet afinado, ya que la cabeza de regresion logistica es barata de reajustar.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (metrica de clase positiva en dev y test, sobre `StanfordSCALE/assertions_llm_annotated_talkmoves`). Todos los valores figuran como no verificados (`verified: false`).

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 3.296 | 3,2% | 0,603 | 0,452 | 0,516 | 0,891 | 0,510 |
| test | 8.238 | 2,8% | 0,528 | 0,325 | 0,4021 | 0,7618 | 0,338 |

El salto de F1 entre dev (0,516) y test (0,402) y la caida de average precision (0,510 a 0,338) indican una generalizacion limitada y probable sobreajuste a las particularidades del split de desarrollo. No se han publicado comparaciones con otros modelos sobre este mismo conjunto en la informacion disponible.

## Requisitos de hardware

- Peso de los parametros: aproximadamente 438 MB en fp32 y 219 MB en fp16, segun los 109,5 millones de parametros declarados.
- VRAM estimada para inferencia: inferior a 1 GB en fp32 una vez cargado el modelo; menos de 512 MB en fp16. El repositorio completo ocupa 0,4 GB.
- GPU: funciona en cualquier GPU consumer (RTX 3060, RTX 4060, RTX 4090, GTX 1650 en adelante). A100 y H100 son sobredimensionadas para este tamano.
- Inferencia en CPU: viable y en la practica habitual para un encoder de 109M de parametros; no requiere acelerador para lotes moderados.
- Opciones de despliegue: libreria `setfit` (uso directo con `SetFitModel.from_pretrained`). Al ser un encoder transformer estandar, puede exportarse a ONNX o convertirse a formato compatible con `sentence-transformers`, `Optimum` o `Text Embeddings Inference` para servir embeddings y posterior clasificacion; no se publican artefactos GGUF, por lo que `llama.cpp` y `Ollama` no son una via directa. No se documenta soporte oficial para vLLM ni TGI, que estan orientados a modelos generativos.
- Latencia y throughput: no disponibles en la informacion proporcionada. No se han publicado mediciones de tokens por segundo ni de latencia por lote.

## Comparativa con modelos similares

No se dispone de resultados de este modelo comparados con alternativas sobre el mismo conjunto. La comparacion siguiente es estructural (no de rendimiento medido):

| Modelo | Parametros | Contexto maximo | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| assertion_references_an_activity_from_earlier_in_the_session (este modelo) | 109,5 M | 512 tokens | Clasificacion binaria de aserciones de discurso en aula | no disponible | HuggingFace, 0 descargas, 0 likes |
| sentence-transformers/paraphrase-mpnet-base-v2 (modelo base) | 109 M | 512 tokens | Sentence embeddings / similitud semantica | Apache-2.0 | HuggingFace, ampliamente usado |
| Otros clasificadores de aserciones del conjunto `bu5` de StanfordSCALE | 109,5 M (mismo cuerpo) | 512 tokens | Clasificacion binaria de otras aserciones | no disponible | HuggingFace, misma coleccion |
| Encoders alternativos para clasificacion (p. ej. roberta-base, deberta-v3-base) | 125 M / 184 M | 512 tokens | Clasificacion de texto generica | MIT / Apache-2.0 segun variante | HuggingFace |

No se dispone de datos para comparar F1, precision o ROC-AUC frente a estos modelos en la tarea concreta de la asercion.

## Limitaciones y advertencias

- Rendimiento bajo en test: F1 de 0,4021 y recall de 0,3247 para la clase positiva. Un 67,5% de los positivos reales no se detectan con el umbral por defecto; no debe usarse como decisor autonomo.
- Desbalanceo extremo: solo el 2,8% de las filas de test son positivas, lo que hace que la exactitud (accuracy) sea una metrica enganosa y que las probabilidades esten mal calibradas hacia la clase negativa.
- Ruido de etiqueta: las etiquetas proceden de anotadores LLM, no de codificadores humanos, con un alpha de Krippendorff de 0,533. Parte del error del modelo es irreducible porque refleja desacuerdo en la propia anotacion.
- Dominio restringido: entrenado unicamente con intervenciones de profesorado. El comportamiento sobre habla de estudiantes no ha sido evaluado y no esta respaldado por ningun resultado.
- Idioma: solo ingles. No hay evidencia de funcionamiento en castellano ni en otros idiomas.
- Dependencia de contexto externo: la asercion depende de lo ocurrido antes en la sesion, pero el modelo solo recibe el utterance aislado. La resolucion de referencias depende por completo de la forma linguistica superficial del enunciado, lo que explica en parte el recall bajo.
- Licencia no declarada: al no especificarse licencia, no hay autorizacion explicita para uso comercial. Conviene contactar con el autor antes de cualquier despliegue productivo.
- Sesgos: no se documentan analisis de sesgo demografico, linguistico o geografico. El corpus TalkMoves procede de un contexto educativo concreto y el modelo puede no transferir a otros sistemas educativos, niveles o asignaturas.
- Riesgo de alucinacion: no aplica en el sentido generativo (no produce texto libre), pero si existe riesgo de falsos positivos y falsos negativos sistematicos al interpretar la etiqueta como una afirmacion factual.
- Uso responsable: cualquier decision sobre docentes o estudiantes basada en estas predicciones debe pasar por revision humana; el modelo es una herramienta de anotacion, no un instrumento de evaluacion.
- Adopcion practicamente nula: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado el modelo en otros contextos.
- Advertencia sobre la busqueda web: los resultados devueltos por la busqueda no guardan ninguna relacion con el modelo ni con el proyecto EduBehaviors; no se han utilizado como fuente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_references_an_activity_from_earlier_in_the_session
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- TalkMoves Dataset (repositorio GitHub): https://github.com/SumnerLab/TalkMoves
- Paquete Python `EduBehaviors-kit`: mencionado en la model card sin URL publica; enlace no disponible
- Paper o blog del proyecto EduBehaviors: no disponible en la informacion proporcionada
- Demo o espacio de inferencia: no disponible
