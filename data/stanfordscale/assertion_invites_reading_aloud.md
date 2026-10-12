# StanfordSCALE/assertion_invites_reading_aloud

## Resumen

El modelo `StanfordSCALE/assertion_invites_reading_aloud` es un clasificador binario de texto desarrollado por la Stanford SCALE Initiative dentro del proyecto EduBehaviors, un conjunto de esquemas basados en aserciones para la codificacion auditable de discurso en el aula. Su tarea concreta es determinar si una intervencion docente invita a leer en voz alta un texto, un enunciado o un problema. Se construye sobre el codificador `sentence-transformers/paraphrase-mpnet-base-v2` y se entrena con la libreria SetFit, que combina una fase contrastiva de ajuste fino del cuerpo con una cabeza de clasificacion logistica.

Tecnicamente no es un modelo generativo ni un modelo de lenguaje: es un encoder MPNet de aproximadamente 109 millones de parametros con una regresion logistica acoplada como cabeza. Esto implica un coste de inferencia muy bajo, ejecucion viable en CPU y un formato de pesos safetensors de apenas 0,4 GB. El modelo esta entrenado exclusivamente sobre intervenciones de profesorado anotadas por anotadores LLM a partir del TalkMoves Dataset, y se distribuye para su uso a traves del paquete Python `EduBehaviors-kit`.

Su relevancia es acotada pero clara: forma parte de una infraestructura de investigacion educativa que busca sustituir codificacion manual costosa por clasificadores auditables y reproducibles, con metricas de acuerdo entre anotadores publicadas. La tasa base de la clase positiva es extremadamente baja (0,4 % en test), por lo que el modelo esta disenado para un regimen de fuerte desbalanceo de clases.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit sobre encoder MPNet (cuerpo `sentence-transformers/paraphrase-mpnet-base-v2`) con cabeza `LogisticRegression` |
| Parametros totales | 109.486.464 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card (el texto se pasa tal cual; no se especifica el limite de tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue el paradigma SetFit: en primer lugar se ajusta el cuerpo (el encoder `paraphrase-mpnet-base-v2`) mediante aprendizaje contrastivo, con un learning rate de 2e-05, batch size de 16 y un maximo de 5000 pasos. A continuacion se entrena una cabeza de regresion logistica con learning rate de 0.01 y batch size de 32, a lo largo de 10 epocas y con 100 pasos maximos de evaluacion. Se uso una semilla fija (20260904) y precision mixta en GPU. El modelo base MPNet es un transformer encoder con atencion completa y mecanismo de permutacion de atencion para modelar dependencias, del orden de 110 millones de parametros.

Los datos de entrenamiento proceden del subconjunto anotado por LLM de `StanfordSCALE/assertions_llm_annotated_talkmoves`, derivado del TalkMoves Dataset. Los tamanos de split son 13.182 ejemplos de entrenamiento (53,3 %), 3.295 de desarrollo (13,3 %) y 8.238 de test (33,3 %). Las etiquetas fueron generadas por anotadores LLM, con un alfa de Krippendorff de 0,839 para esta asercion. La tasa base de la clase positiva es muy baja: 0,3 % en train, 0,7 % en dev y 0,4 % en test. El texto de entrada se construye simplemente como `{utterance}`, sin plantilla adicional ni campos auxiliares. No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa, algo coherente con un clasificador discriminativo.

## Capacidades

- Clasificacion binaria de texto: devuelve si una intervencion docente invita a leer en voz alta (`predict`) y la probabilidad asociada (`predict_proba`).
- Deteccion de una unica asercion concreta (`td__the_utterance_invites_reading_aloud`) dentro del conjunto de aserciones top-down `td`.
- Integracion en flujos de codificacion de discurso en el aula a traves del paquete `EduBehaviors-kit`.
- Inferencia sobre texto en bruto en ingles, sin preprocesado declarado ni plantilla de prompt.
- Optimizado implicitamente para recuperacion en regimen de desbalanceo extremo, con clases positivas por debajo del 1 %.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni modo de pensamiento; es un clasificador de una sola etiqueta.
- Capacidad multilingue: no, solo ingles.

## Casos de uso

- Analisis de discurso en el aula a gran escala: aplicar el clasificador sobre transcripciones de clases para cuantificar con que frecuencia el profesorado pide al alumnado leer en voz alta, sustituyendo la codificacion manual de horas de grabacion.
- Investigacion educativa longitudinal: procesar cohortes completas de transcripciones del TalkMoves Dataset o de corpus propios para medir la evolucion de practicas de lectura guiada a lo largo de un curso.
- Formacion docente: generar informes automaticos que muestren al profesor la proporcion de intervenciones de invitacion a la lectura frente a otros movimientos pedagogicos, como insumo para sesiones de reflexion.
- Enrutado dentro de una pipeline de anotacion multi-etiqueta: usar la salida binaria como primer filtro, de modo que solo las intervenciones positivas se envien a anotadores humanos o a modelos mas costosos para su codificacion fina.
- Filtrado de datos para entrenamiento de tutores conversacionales educativos: identificar ejemplos de invitacion a la lectura en corpus docentes para construir conjuntos de entrenamiento especializados.
- Monitorizacion en tiempo real de sesiones hibridas: al ser un encoder de 109 millones de parametros, puede ejecutarse en CPU con latencia baja y desplegarse en un servidor modesto para procesar transcripciones a medida que se generan.
- Auditoria de sistemas de anotacion automatica: al ser un modelo pequeno con metricas publicadas y semilla fija, sirve como componente basico reproducible para validar pipelines de etiquetado mas complejos.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card. No estan verificados de forma independiente (`verified: false`).

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 3.295 | 0,7 % | 0,875 | 0,636 | 0,737 | 0,944 | 0,595 |
| test | 8.238 | 0,4 % | 0,852 | 0,719 | 0,780 | 0,921 | 0,703 |

No se han publicado resultados comparativos frente a otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (el repositorio completo pesa 0,4 GB con 109,5 millones de parametros).
- GPU recomendadas: no requiere GPU. Cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 3050 o superior) es mas que suficiente; tambien A100, H100 o T4 sin aprovechar su capacidad.
- Cabe holgadamente en GPU de consumo (RTX 3060, RTX 4060, RTX 4090) y en CPU convencional, dado el reducido numero de parametros.
- Opciones de despliegue: `setfit` mediante `SetFitModel.from_pretrained`, con la posibilidad de exportar a ONNX o TorchScript para servir en produccion. vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo (no hay pesos GGUF ni decodificacion autoregresiva).
- Latencia y throughput: no disponibles en la informacion proporcionada. El coste por ejemplo es el de un forward pass de un encoder MPNet sobre una unica intervencion, mas una regresion logistica.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados de otros clasificadores de aserciones del proyecto EduBehaviors ni de modelos comparables de codificacion de discurso en el aula. Como referencia interna, el propio modelo base `sentence-transformers/paraphrase-mpnet-base-v2` comparte arquitectura y numero de parametros, pero no esta ajustado para esta tarea concreta y no se publican sus resultados sobre `assertions_llm_annotated_talkmoves`.

## Limitaciones y advertencias

- Las etiquetas de entrenamiento provienen de anotadores LLM, no de codificadores humanos. El acuerdo entre anotadores es de 0,839 (alfa de Krippendorff), lo que implica un techo de rendimiento inherente al propio etiquetado.
- El modelo se entreno exclusivamente sobre intervenciones de profesorado. Su comportamiento sobre habla de estudiantes no ha sido evaluado.
- Tasa base de la clase positiva extremadamente baja (0,4 % en test): la exactitud (accuracy) es una metrica enganosa; deben usarse F1, precision, recall, ROC-AUC o average precision.
- El average precision en test es de 0,703, notablemente inferior al ROC-AUC de 0,921, lo que refleja la dificultad del regimen de desbalanceo y sugiere cautela al fijar umbrales de decision.
- Riesgo de falsos negativos: el recall en test es de 0,719, de modo que aproximadamente un 28 % de las invitaciones reales a leer en voz alta no se detectan.
- El modelo es especifico de una unica asercion y de un unico dominio (discurso en el aula en ingles). No es un clasificador general ni un modelo de lenguaje.
- Solo soporta ingles. No hay datos sobre su comportamiento en castellano ni en otros idiomas.
- La licencia no esta disponible en la informacion proporcionada, por lo que no puede confirmarse que el uso comercial este permitido. Debe verificarse con el autor antes de cualquier despliegue en produccion.
- Al ser un modelo de investigacion con 0 descargas y 0 likes en el momento de la consulta, no existe validacion independiente de los resultados declarados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_invites_reading_aloud
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset: https://github.com/SumnerLab/TalkMoves
- Paquete `EduBehaviors-kit`: no disponible (mencionado en la model card sin enlace)
- Paper o publicacion tecnica: no disponible
- Demo: no disponible
