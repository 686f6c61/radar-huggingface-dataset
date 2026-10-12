# StanfordSCALE/assertion_repeats_a_student_answer

## Resumen

`StanfordSCALE/assertion_repeats_a_student_answer` es un clasificador binario de texto desarrollado por la Stanford SCALE Initiative dentro del proyecto EduBehaviors, un conjunto de esquemas de codificación de diálogo basados en aserciones y orientados a la auditabilidad. El modelo resuelve una tarea muy concreta: determinar si una intervención docente en el aula "repite la respuesta de un estudiante" (identificador de aserción `bu5__repeats_a_student_answer`). No es un modelo generativo ni un LLM conversacional, sino un clasificador de una sola etiqueta construido con la librería SetFit.

Técnicamente se apoya en un cuerpo encoder `sentence-transformers/paraphrase-mpnet-base-v2` (arquitectura MPNet) al que se le añade una cabeza de regresión logística. El conjunto completo suma 109.486.464 parámetros y el repositorio ocupa 0,4 GB, con pesos en formato safetensors. Se entrenó sobre un subconjunto anotado por LLM del corpus TalkMoves, con 13.181 ejemplos de entrenamiento, 3.294 de desarrollo y 8.240 de test.

Su relevancia es acotada pero clara: forma parte de una infraestructura de investigación educativa (el paquete `EduBehaviors-kit`) pensada para codificar discurso de aula de forma reproducible. Los propios autores advierten que su F1 en test es de 0,329 y que "no funciona lo suficientemente bien como para usarse por sí solo", por lo que debe entenderse como un componente de preanotación o apoyo a la codificación humana, no como un sistema de producción autónomo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SetFit: encoder MPNet (`paraphrase-mpnet-base-v2`) + cabeza `LogisticRegression` |
| Parámetros totales | 109.486.464 (≈109,5 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo se publican pesos safetensors sin versiones GGUF, GPTQ, AWQ ni ONNX cuantizadas) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `setfit`) |
| Tarea | clasificación de texto binaria (`text-classification`) |
| Etiquetas de salida | 1 = la aserción se cumple; 0 = no se cumple |
| Modelo base | sentence-transformers/paraphrase-mpnet-base-v2 |
| Dataset | StanfordSCALE/assertions_llm_annotated_talkmoves |
| Identificador de aserción | `bu5__repeats_a_student_answer` |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-12 |

## Arquitectura y entrenamiento

El modelo sigue el paradigma SetFit, un esquema de ajuste eficiente en datos para clasificación de texto. En una primera fase contrastiva se ajusta el cuerpo (el encoder de frases `paraphrase-mpnet-base-v2`, basado en MPNet) con un learning rate de 2e-05, batch size 16, 10 épocas y un máximo de 5.000 pasos. En una segunda fase se congela el encoder y se entrena una cabeza de regresión logística con learning rate 0,01 y batch size 32, con 100 pasos máximos de evaluación. La semilla empleada fue 20260904 y se activó precisión mixta en GPU. La entrada es la intervención del docente tal cual, sin plantilla adicional: `{utterance}`.

Los datos proceden de un subconjunto anotado por LLM del TalkMoves Dataset, restringido a intervenciones de profesorado. El reparto es de 13.181 filas de entrenamiento (53,3%), 3.294 de desarrollo (13,3%) y 8.240 de test (33,3%). La tasa base de la clase positiva es muy baja: 5,1% global (5,2% en train, 5,1% en dev, 4,8% en test), lo que convierte el problema en un caso claro de desbalanceo severo. La concordancia entre anotadores medida con alfa de Krippendorff es de 0,713. No se documenta uso de RLHF ni DPO, algo coherente con un clasificador discriminativo de este tipo. El modelo se distribuye como parte del ecosistema `EduBehaviors-kit` y expone tanto `predict` como `predict_proba`.

## Capacidades

- Clasificación binaria de una única intervención docente: predice si la aserción "repite la respuesta de un estudiante" se cumple o no.
- Salida probabilística mediante `predict_proba`, lo que permite fijar umbrales de decisión ajustados según el coste relativo de falsos positivos y falsos negativos.
- Entrada directa de texto sin preprocesado específico ni formato estructurado: la utterance se pasa tal cual.
- Integración con la librería `setfit` y, por extensión, con el ecosistema de `sentence-transformers`.
- Uso previsto dentro del paquete `EduBehaviors-kit` para construir esquemas de codificación de diálogo auditables.
- No soporta generación de texto, razonamiento multi-paso, tool calling, function calling, agentes, visión, audio ni modo de pensamiento.
- No es multilingüe: está entrenado y evaluado únicamente en inglés.
- No gestiona conversaciones multi-turno; cada predicción es independiente y se aplica a una sola utterance.

## Casos de uso

- Preanotación en investigación sobre discurso de aula: el clasificador puede etiquetar automáticamente transcripciones completas de clases y reducir el volumen de codificación manual, dejando a los codificadores humanos la revisión de los positivos y de una muestra de los negativos.
- Aprendizaje activo para anotación: dado que la precisión en test es de 0,540 frente a un recall de 0,236, el modelo es más fiable cuando dice "sí" que cuando dice "no"; usar sus predicciones positivas de alta probabilidad como cola prioritaria de revisión permite concentrar el esfuerzo humano donde más renta.
- Filtrado de bajo coste previo a un modelo mayor: al ser un encoder de 109 M de parámetros, puede ejecutarse en CPU y descartar de forma barata la gran mayoría de utterances, reservando un LLM anotador más caro para los casos dudosos.
- Análisis de patrones de repetición docente: en estudios sobre cómo el profesorado reformula o repite las respuestas del alumnado, el modelo permite cuantificar la frecuencia de esta conducta a lo largo de un corpus de transcripciones y correlacionarla con otras variables.
- Formación y desarrollo profesional docente: integrado en una herramienta de análisis de clases grabadas, puede señalar momentos en los que el docente repite la respuesta del estudiante, para su discusión posterior en sesiones de reflexión.
- Estudios de equidad educativa: como parte de una batería de clasificadores de conducta docente, permite comparar la distribución de esta conducta entre aulas, asignaturas o perfiles de alumnado.
- Construcción de esquemas de codificación auditables: dentro de `EduBehaviors-kit`, sirve como uno de los componentes de aserción que se combinan para producir etiquetas de conducta de nivel superior con trazabilidad completa.
- Investigación metodológica sobre anotación con LLM: el propio modelo y su dataset asociado permiten estudiar la fiabilidad de etiquetas generadas por LLM frente a codificación humana en contextos educativos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Split | n | Tasa base | Precisión | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 3.294 | 5,1% | 0,449 | 0,186 | 0,263 | 0,752 | 0,296 |
| test | 8.240 | 4,8% | 0,540 | 0,236 | 0,329 | 0,760 | 0,344 |

Desglose de las métricas de test tal como aparecen en el model-index: F1 = 0,3287, precisión = 0,5402, recall = 0,2362, ROC-AUC = 0,7602.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (≈438 MB solo de pesos) y en torno a 250-500 MB en FP16. El repositorio completo ocupa 0,4 GB.
- GPU recomendadas: cualquiera con al menos 2 GB de memoria. No requiere A100, H100 ni tarjetas de gama alta; una GTX 1650, RTX 3050 o RTX 4090 sirven igual de bien, y el cuello de botella no será la GPU.
- Inferencia en CPU: totalmente viable. Con 109,5 M de parámetros y entradas cortas, es apto para ejecución en CPU en portátiles y servidores sin acelerador.
- Cabe en cualquier GPU de consumo, incluida la gama de entrada, y también en entornos sin GPU.
- Opciones de despliegue: librería `setfit` (vía `SetFitModel.from_pretrained`), `sentence-transformers` para reutilizar el encoder, exportación a ONNX para servir con ONNX Runtime, y despliegue como endpoint de Hugging Face Inference Endpoints. No se documentan integraciones con vLLM, llama.cpp ni Ollama, ya que no es un modelo generativo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se han publicado comparativas frente a otros clasificadores de la misma tarea en la información disponible. Como referencia interna, la tabla incluye la línea base trivial derivada de la tasa base del conjunto de test.

| Modelo | Tarea | Parámetros | F1 (clase positiva, test) | ROC-AUC (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| StanfordSCALE/assertion_repeats_a_student_answer | Clasificación binaria de conducta docente | 109,5 M | 0,329 | 0,760 | no disponible | HuggingFace, 0 descargas |
| Clasificador trivial de clase mayoritaria | Clasificación binaria | 0 | 0,000 (derivado de la tasa base del 4,8%) | 0,500 | no aplica | no aplica |
| Otros clasificadores comparables | Clasificación de discurso educativo | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Las etiquetas de entrenamiento provienen de anotadores LLM, no de codificadores humanos. La concordancia entre anotadores es de 0,713 según alfa de Krippendorff, lo que implica un techo de rendimiento inherente a la calidad del etiquetado.
- El F1 de 0,329 en test es bajo. Los propios autores indican explícitamente que el modelo no funciona lo suficientemente bien como para usarse por sí solo.
- Recall muy bajo (0,236 en test): el modelo se pierde aproximadamente tres de cada cuatro casos positivos. Cualquier uso que dependa de no omitir instancias de esta conducta es inadecuado con el umbral por defecto.
- Precisión moderada (0,540 en test): incluso cuando predice positivo, se equivoca casi la mitad de las veces.
- La tasa base de la clase positiva es del 4,8% en test, un desbalanceo severo que hace que la exactitud (accuracy) sea una métrica engañosa y que los umbrales de decisión deban calibrarse por caso de uso.
- Existe una brecha clara entre desarrollo y test (F1 0,263 frente a 0,329; precisión 0,449 frente a 0,540), lo que sugiere sensibilidad a la composición del conjunto de evaluación.
- Entrenado únicamente con intervenciones de profesorado. El comportamiento sobre habla de estudiantes no ha sido probado.
- Solo inglés. No hay evidencia de funcionamiento en castellano ni en ningún otro idioma.
- La licencia no está disponible, lo que impide determinar si el uso comercial está permitido. Se debe contactar con el autor antes de cualquier despliegue comercial.
- El modelo no genera texto, por lo que el riesgo de alucinación en el sentido generativo no aplica; el riesgo equivalente son los falsos positivos y falsos negativos derivados del bajo rendimiento en la clase minoritaria.
- El repositorio registra 0 descargas y 0 likes, sin adopción comunitaria conocida ni validación externa de los resultados.
- No hay evidencia publicada sobre su robustez ante variaciones de dominio (otros niveles educativos, otras lenguas, transcripciones automáticas con errores, solapamiento de habla).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_repeats_a_student_answer
- Dataset de entrenamiento y evaluación: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset (SumnerLab): https://github.com/SumnerLab/TalkMoves
- Paquete `EduBehaviors-kit`: no disponible
- Artículo o paper asociado: no disponible
- Demostración en línea: no disponible
- Cita recomendada por los autores:

```bibtex
@misc{assertion_repeats_a_student_answer,
  author = {Stanford SCALE Initiative},
  title  = {Assertion classifier: repeats a student answer},
  year   = {2026},
  url    = {https://huggingface.co/StanfordSCALE/assertion_repeats_a_student_answer}
}
```
