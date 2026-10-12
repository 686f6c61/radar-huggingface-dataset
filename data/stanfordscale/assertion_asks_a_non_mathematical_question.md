# StanfordSCALE/assertion_asks_a_non_mathematical_question

## Resumen

`StanfordSCALE/assertion_asks_a_non_mathematical_question` es un clasificador de texto binario desarrollado por la Stanford SCALE Initiative dentro del proyecto EduBehaviors, un conjunto de esquemas basados en aserciones para la codificacion auditable de dialogos educativos. No se trata de un modelo generativo, sino de un clasificador SetFit construido sobre el encoder `sentence-transformers/paraphrase-mpnet-base-v2` con una cabeza de regresion logistica. Su tarea concreta es determinar si una intervencion docente plantea una pregunta no matematica.

El modelo forma parte de una familia de clasificadores de "aserciones" que descomponen el analisis del discurso en el aula en comprobaciones verificables y auditables, en lugar de depender de categorias holisticas. Se entrena sobre un subconjunto anotado por LLM de intervenciones de profesorado procedentes del TalkMoves Dataset, con 13.183 ejemplos de entrenamiento, 3.293 de desarrollo y 8.239 de prueba. La tasa base de la clase positiva es muy baja (3,0 %), lo que condiciona fuertemente sus metricas.

Es relevante para investigadores en analitica del aprendizaje y procesamiento del lenguaje educativo porque ofrece una pieza concreta, reproducible y de bajo coste computacional dentro de un pipeline mayor de codificacion de discurso. El paquete `EduBehaviors-kit` permite integrarlo en flujos de investigacion sobre calidad del dialogo en el aula. Su licencia no esta declarada y solo soporta ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer MPNet (paraphrase-mpnet-base-v2) con cabeza de regresion logistica (SetFit) |
| Parametros totales | 109.486.464 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del encoder base, 512 tokens tipicamente en MPNet) |
| Tipos de cuantizacion | no disponible (pesos safetensors; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea | Clasificacion de texto binaria (text-classification) |
| Libreria | setfit |
| Modelo base | sentence-transformers/paraphrase-mpnet-base-v2 |
| Tamano del repo | 0,4 GB |
| Dataset de entrenamiento | StanfordSCALE/assertions_llm_annotated_talkmoves |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura sigue el paradigma SetFit: se parte de un sentence transformer preentrenado (`paraphrase-mpnet-base-v2`) y se realiza una fase contrastiva sobre pares de ejemplos con etiquetas coincidentes y no coincidentes, seguida del entrenamiento de una cabeza de clasificacion de regresion logistica sobre los embeddings resultantes. El objetivo es conseguir un clasificador few-shot eficiente en datos y computo. Los hiperparametros documentados incluyen un learning rate del cuerpo de 2e-05, learning rate de la cabeza de 0,01, batch size de 16 en la fase contrastiva y 32 en la cabeza, 10 epocas, un maximo de 5.000 pasos en la fase contrastiva, 100 pasos maximos de evaluacion, semilla 20260904 y precision mixta activada en GPU.

Los datos proceden de un subconjunto anotado por LLM de intervenciones docentes del TalkMoves Dataset, con 13.183 filas de entrenamiento (53,3 %), 3.293 de desarrollo (13,3 %) y 8.239 de prueba (33,3 %). La tasa base de la clase positiva es del 3,0 % global (3,1 % en train, 2,7 % en dev, 2,9 % en test). Las etiquetas fueron generadas por anotadores LLM, con un acuerdo entre anotadores medido por alfa de Krippendorff de 0,744. El modelo recibe como entrada unicamente el texto de la intervencion, sin prefijos ni plantillas adicionales (`{utterance}` tal cual).

## Capacidades

- Clasificacion binaria de una intervencion docente como "plantea una pregunta no matematica" (clase positiva) o no.
- Salida de probabilidad calibrada mediante `predict_proba`, que devuelve `[P(no), P(yes)]`.
- Etiquetado rapido de lotes de transcripciones de aula para codificacion de discurso educativo.
- Integracion con el paquete `EduBehaviors-kit` para pipelines de analisis de comportamiento en el aula.
- Inferencia eficiente en CPU y GPU por su tamano reducido (109 M de parametros).
- Funcionamiento exclusivo en ingles.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes ni capacidades multimodales.

## Casos de uso

- Codificacion de discurso en el aula: clasificar automaticamente intervenciones docentes en transcripciones del TalkMoves Dataset para medir la proporcion de preguntas no matematicas en una sesion, como parte de estudios sobre calidad del dialogo educativo.
- Investigacion en analitica del aprendizaje: integrar el clasificador en pipelines de investigacion que correlacionan patrones de discurso docente con resultados de aprendizaje, aprovechando su bajo coste computacional para procesar corpus completos.
- Auditoria de esquemas de anotacion: al estar basado en aserciones verificables, permite revisar y auditar codificaciones previas frente a un criterio explicito y reproducible.
- Construccion de etiquetas auxiliares para modelos mayores: generar caracteristicas discretas sobre transcripciones para alimentar modelos de analisis de dialogo de mayor tamano.
- Prototipado rapido de codificadores de discurso: servir como linea base SetFit para nuevas aserciones dentro del ecosistema EduBehaviors, dado su coste de entrenamiento bajo.
- Despliegue local en entornos educativos: su tamano de 0,4 GB y su ejecucion via `setfit` permiten correrlo en portatiles o servidores modestos sin GPU dedicada para pilotos de investigacion.
- Deteccion de patrones discursivos en formacion docente: marcar intervenciones donde el docente evita el contenido matematico, como insumo para sesiones de reflexion sobre practica docente.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre el split de test del dataset `assertions_llm_annotated_talkmoves`:

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 3.293 | 2,7 % | 0,615 | 0,449 | 0,519 | 0,863 | 0,475 |
| test | 8.239 | 2,9 % | 0,650 | 0,492 | 0,560 | 0,872 | 0,501 |

Metricas de test agregadas segun el model-index: F1 0,56, precision 0,6503, recall 0,4917, ROC-AUC 0,8721. No se han publicado resultados comparativos frente a otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; los pesos ocupan aproximadamente 0,4 GB, por lo que cabe en cualquier GPU consumer con 2 GB o mas, e incluso puede ejecutarse en CPU.
- GPU recomendadas: cualquier GPU moderna es suficiente; no requiere A100, H100 ni RTX 4090. Una GTX 1650, RTX 3050 o integrada discreta bastan para lotes de inferencia.
- Cabe en consumer GPU: si, en practicamente cualquier GPU de consumo y tambien en CPU.
- Opciones de despliegue: la libreria `setfit` (via `SetFitModel.from_pretrained`), y exportacion a formatos compatibles con `sentence-transformers`/transformers para servir con FastAPI o similares. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles. Al tratarse de un encoder de 109 M de parametros con cabeza logistica, la latencia por lote es del orden de milisegundos a decenas de milisegundos en GPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de otros clasificadores comparables de la misma familia EduBehaviors ni de modelos alternativos de clasificacion de discurso educativo con los que contrastar parametros, contexto o licencia. La comparativa se indica como no disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| assertion_asks_a_non_mathematical_question | 109.486.464 | no disponible | no disponible | HuggingFace (0 descargas) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Las etiquetas proceden de anotadores LLM, no de codificadores humanos; el acuerdo entre anotadores es de 0,744 segun alfa de Krippendorff, lo que implica un techo de rendimiento inherente.
- El modelo se entreno unicamente con intervenciones de profesorado; su comportamiento sobre habla de estudiantes no ha sido probado.
- Con una tasa base del 3,0 %, el recall de la clase positiva es bajo (0,492 en test): el modelo deja escapar aproximadamente la mitad de los casos positivos. La precision (0,650) tampoco es alta, por lo que genera falsos positivos frecuentes.
- El modelo solo soporta ingles; no hay evidencia de funcionamiento en otros idiomas.
- La licencia no esta declarada, lo que impide confirmar si se permite uso comercial. Se debe contactar con el autor antes de utilizarlo en produccion o en productos comerciales.
- Dominio muy especifico (discurso de aula, dataset TalkMoves): no se espera una buena transferencia a otros dominios sin reentrenamiento.
- El modelo no genera texto ni razona; cualquier expectativa de uso como asistente conversacional es inadecuada.
- Al ser una asercion concreta, cualquier uso fuera del contexto de la familia EduBehaviors debe validarse empiricamente.
- Riesgo de alucinacion no aplica en sentido generativo, pero si existe riesgo de clasificaciones erroneas en intervenciones ambiguas o fuera de distribucion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_asks_a_non_mathematical_question
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset (repositorio): https://github.com/SumnerLab/TalkMoves
