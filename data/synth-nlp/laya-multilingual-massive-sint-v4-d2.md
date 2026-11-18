# Synth-NLP/laya-multilingual-massive-sint-v4-D2

## Resumen

Laya multilingual massive sint v4 D2 es un ajuste fino del checkpoint `multilingual` del modelo Laya (Convai Innovations) especializado en clasificación de intenciones en portugués de Brasil. Forma parte de un experimento de investigación que compara el rendimiento de datos sintéticos generados mediante una pipeline agéntica frente a datos reales, siendo este el brazo "D2" de la pipeline sintética v4. El modelo resuelve una tarea concreta: dado un enunciado de usuario y un conjunto de opciones de intención, seleccionar la correcta mediante el formato de predicción por elección que implementa la librería `laya`.

Arquitectónicamente hereda la estructura del modelo base Laya, con 321.908.998 parámetros totales distribuidos en pesos en formato safetensors (2,0 GB de repositorio). No se dispone de información detallada sobre la arquitectura interna del transformer subyacente en la documentación proporcionada. El contexto, los tipos de cuantización y otros detalles técnicos del modelo base no se especifican en la model card.

Su relevancia es acotada y experimental: se trata de un modelo de investigación privado, con cero descargas y cero likes en el momento de la ficha, orientado a validar si el entrenamiento con datos sintéticos iguala al entrenamiento con datos reales en una tarea de clasificación de intenciones. Los resultados reportados (0,888 de accuracy en el conjunto `vistas` y 0,743 en `nao_vistas`) se acercan a la referencia real (0,889 y 0,728 respectivamente).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (hereda del modelo base Laya; transformer, detalles no especificados) |
| Parametros totales | 321.908.998 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Portugues (pt, pt-br) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `multilingual` de Laya, cargado mediante la librería `laya` (versión 0.4.14 de `laya.train.finetune`). El entrenamiento se realizó durante 4 épocas con un lote efectivo de 64, objetivo `rlcd` y la opción `shuffle_options=("choice",)`, con semilla de entrenamiento 0. Los datos provienen del fichero `train_laya_D2_v4.jsonl` del dataset `Synth-NLP/massive-pt-br-sintetico-v4`, que combina datos reales con datos sintéticos de 30 intenciones nuevas generadas por una pipeline agéntica (con Gemma 4 12B y Qwen3.5-9B como generadores). El brazo de comparación con datos exclusivamente reales es `Synth-NLP/laya-multilingual-massive-real`.

La innovación metodológica no está en la arquitectura sino en el protocolo experimental: se reservan escenarios (`nao_vistas`) que nunca se usan en la generación de datos sintéticos, de modo que la evaluación mide generalización a intenciones no vistas durante la síntesis. La tarea se formula como una elección entre opciones (formato `choice`), con 20 opciones sorteadas entre las intenciones del conjunto, lo que sitúa la línea base de azar en 0,050. Los datos sintéticos derivan parcialmente de MASSIVE (arXiv:2204.08582), © Amazon.com, Inc. o afiliadas, bajo CC BY 4.0.

## Capacidades

- Clasificación de intenciones en portugués de Brasil mediante selección entre un conjunto de opciones proporcionado en la consulta.
- Predicción estructurada con el formato de la librería `laya`: entrada `{"type": "choice", "instructions": ..., "criteria": {...}}` y salida en `["answers"]["intent"]["choice"]`.
- Manejo de instrucciones en lenguaje natural que describen la tarea de clasificación.
- Generalización a escenarios de intención no vistos durante la generación de datos sintéticos (evaluado en el conjunto `nao_vistas`).
- No se documentan capacidades de generación libre de texto, razonamiento multi-paso, código, matemáticas, visión, audio, tool calling ni function calling.
- No se documenta soporte de agentes ni modo de razonamiento explícito (thinking mode).
- Capacidad multilingüe limitada al portugués según la model card.

## Casos de uso

- Clasificación de intenciones en asistentes conversacionales en portugués: el modelo recibe el enunciado del usuario junto con un conjunto cerrado de intenciones candidatas y devuelve la etiqueta seleccionada, integrándose en el enrutador de un bot de atención al cliente.
- Enrutamiento de consultas en sistemas de domótica o asistentes de voz: enunciados como "vai chover amanhã?" se mapean a intenciones como "consultar clima", "consultar agenda" o "ligar luz", tal como muestra el ejemplo de la model card.
- Investigación sobre datos sintéticos: el modelo sirve como brazo experimental para medir si el entrenamiento con datos generados por pipeline agéntica iguala al entrenamiento con datos reales, comparando contra `Synth-NLP/laya-multilingual-massive-real`.
- Evaluación de generalización a intenciones no vistas: útil para estudiar la robustez de clasificadores entrenados con síntesis frente a escenarios reservados (`nao_vistas`), con métricas reportadas de accuracy y macro-F1.
- Prototipado de clasificadores de intención de bajo coste: con 321,9 M de parámetros y pesos en safetensors de 2,0 GB, puede desplegarse en entornos de investigación sin infraestructura de gran escala.
- Reproducción de experimentos: la configuración de entrenamiento (4 épocas, lote efectivo 64, objetivo `rlcd`, semilla 0) y los ficheros de resultados permiten replicar el ajuste fino y verificar las cifras publicadas.
- Benchmarking interno de pipelines de datos sintéticos: comparar la calidad de distintas versiones de la pipeline (v4 frente a otras) usando la misma validación y el mismo protocolo de 20 opciones.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre la validación de `Synth-NLP/massive-pt-br-avaliacao`, con 20 opciones sorteadas entre las intenciones del conjunto y media de las semillas 0, 1 y 2 (azar = 0,050):

| Conjunto | Acurácia | Macro-F1 |
|---|---:|---:|
| `vistas` | 0.888 | 0.860 |
| `nao_vistas` | 0.743 | 0.701 |

Referencia del modelo entrenado con datos reales: 0,889 (`vistas`) y 0,728 (`nao_vistas`). No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación. Como referencia orientativa por tamaño (321,9 M de parámetros), en fp32 los pesos ocuparían aproximadamente 1,3 GB y en fp16 unos 0,65 GB, sin contar activaciones ni overhead del runtime; estas cifras son estimaciones de cálculo, no datos publicados por el autor.
- GPU recomendadas: no disponible. Por tamaño, el modelo es compatible con GPU de consumo, pero no se especifican modelos concretos.
- Cabe en GPU consumer: previsiblemente sí por el número de parámetros, aunque no se confirma en la información disponible.
- Opciones de despliegue: la model card solo documenta la carga mediante la librería `laya` (`laya.load(...)`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Resultado reportado |
|---|---|---|---|---|---|
| Synth-NLP/laya-multilingual-massive-sint-v4-D2 | 321.908.998 | No disponible | Clasificacion de intenciones (pt-br) | Apache 2.0 | 0,888 (`vistas`) / 0,743 (`nao_vistas`) |
| Synth-NLP/laya-multilingual-massive-real | No disponible | No disponible | Clasificacion de intenciones (pt-br) | No disponible | 0,889 (`vistas`) / 0,728 (`nao_vistas`) |
| convaiinnovations/laya (checkpoint multilingual) | No disponible | No disponible | Modelo base multimodal/agente | No disponible | No disponible |

La comparación principal es con el brazo de datos reales del mismo experimento: el modelo sintético queda 0,001 por debajo en `vistas` y 0,015 por encima en `nao_vistas`, diferencias dentro del mismo orden de magnitud. No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación en estado "resultado en andamento" y marcado como privado por el autor; no está pensado para uso en producción.
- Cero descargas y cero likes en el momento de la ficha: no hay evidencia de uso externo ni validación independiente.
- Idiomas limitados al portugués; no se garantiza comportamiento en otros idiomas pese a derivar del checkpoint `multilingual` de Laya.
- La tarea está restringida a elección entre opciones predefinidas; no es un modelo generativo de propósito general.
- Riesgo de sesgo y alucinación no evaluado en la documentación: los datos sintéticos pueden heredar sesgos de los generadores (Gemma 4 12B y Qwen3.5-9B) y de MASSIVE.
- La evaluación usa 20 opciones sorteadas entre las intenciones del conjunto; los resultados no son directamente comparables con evaluaciones de clasificación de vocabulario abierto.
- Licencia Apache 2.0 heredada del modelo base, que permite uso comercial, pero los datos derivados de MASSIVE están bajo CC BY 4.0 y requieren atribución a Amazon.com, Inc. o afiliadas.
- No se documentan longitudes de contexto, cuantizaciones soportadas ni requisitos de hardware, lo que dificulta planificar un despliegue.
- El formato de entrada depende de la librería `laya` 0.4.14 y del esquema `choice`; cambios de versión podrían romper la compatibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Synth-NLP/laya-multilingual-massive-sint-v4-D2
- Modelo base Laya: https://huggingface.co/convaiinnovations/laya
- Brazo de comparación con datos reales: https://huggingface.co/Synth-NLP/laya-multilingual-massive-real
- Dataset de entrenamiento sintético: https://huggingface.co/datasets/Synth-NLP/massive-pt-br-sintetico-v4
- Dataset de evaluación: https://huggingface.co/datasets/Synth-NLP/massive-pt-br-avaliacao
- Paper de MASSIVE: https://arxiv.org/abs/2204.08582
