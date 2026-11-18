# Synth-NLP/laya-multilingual-massive-ablacao-AB1

## Resumen

Laya multilingual — braço AB1 es un modelo de clasificación de intenciones en portugués de Brasil, obtenido mediante fine-tuning del checkpoint `multilingual` de Laya (Convai Innovations) sobre un conjunto de datos sintético. Lo desarrolla Synth-NLP como parte de un experimento de ablación cuyo objetivo es aislar el efecto del volumen de entrenamiento frente al uso de datos sintéticos: el brazo AB1 repite cinco veces las 5.405 frases reales del conjunto D1 v4 hasta alcanzar 27.025 líneas, el mismo tamaño que el conjunto sintético, para comprobar si la mejora atribuida a los datos sintéticos se explica simplemente por entrenar con más ejemplos.

El modelo resuelve una tarea concreta: selección de intención entre un conjunto de opciones cerradas (formato de elección múltiple con criterios), evaluada sobre el dataset MASSIVE en portugués. Tiene 321.908.998 parámetros (dato real de los pesos en safetensors) y un repositorio de 0,7 GB. Es un modelo de investigación en estado "resultado en curso", marcado como privado por el autor, por lo que no está pensado para uso en producción.

Su relevancia es metodológica: sirve como control experimental dentro de una comparativa más amplia entre datos reales y datos sintéticos generados por una pipeline agéntica, con un grupo de comparación real publicado en `Synth-NLP/laya-multilingual-massive-real`. Los resultados de validación reportados (0,902 de accuracy en escenarios vistos y 0,728 en no vistos) sitúan este brazo por encima de la referencia real en el conjunto visto y en línea con ella en el no visto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tuning del checkpoint `multilingual` de Laya; la model card no detalla la arquitectura interna) |
| Parametros totales | 321.908.998 |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | portugués (pt, pt-br) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint `multilingual` de Laya, cargado a través de la librería `laya` (versión 0.4.14 de `laya.train.finetune`). La model card no especifica la arquitectura interna del modelo base (transformer denso, MoE u otra), por lo que este dato no está disponible. El entrenamiento se realizó con los valores por defecto de la librería: 4 épocas, tamaño de lote efectivo de 64 y objetivo `rlcd`, añadiendo la opción `shuffle_options=("choice",)` para barajar las opciones de respuesta. La semilla de entrenamiento fue 0.

El conjunto de entrenamiento es `train_laya_AB1_v5.jsonl`, dentro del dataset `Synth-NLP/massive-pt-br-sintetico-v4` (carpeta `treino_laya/`), con verificación sha256 registrada en `results/treino.json`. La particularidad del brazo AB1 es que no usa datos sintéticos: toma las 5.405 líneas reales del conjunto D1 v4 y las repite cinco veces hasta 27.025 líneas, igualando el tamaño del conjunto sintético. De este modo se controla la variable de volumen de datos. La evaluación se hizo sobre `Synth-NLP/massive-pt-br-avaliacao`, con 20 opciones sorteadas únicamente entre las intenciones del conjunto (nivel de azar 0,050) y promediando las semillas 0, 1 y 2. Los datos sintéticos del proyecto se generaron con Gemma 4 12B y Qwen3.5-9B, y algunos brazos D incluyen frases derivadas de MASSIVE (CC BY 4.0).

## Capacidades

- Clasificación de intenciones en portugués de Brasil mediante selección entre opciones cerradas (formato `choice` con instrucciones y criterios).
- Predicción estructurada: devuelve la respuesta dentro de un diccionario anidado (`answers.intent.choice`), lo que facilita su integración en pipelines.
- Manejo de instrucciones en lenguaje natural para definir la tarea y las opciones candidatas en tiempo de inferencia.
- Evaluación controlada de escenarios vistos y no vistos (`vistas` / `nao_vistas`), con capacidad de generalización medida sobre intenciones reservadas.
- No se documentan capacidades de generación de texto libre, razonamiento multi-paso, código, matemáticas, visión, audio, tool calling ni modo thinking.
- Multilingüismo limitado al portugués según la metadata del modelo.

## Casos de uso

- Clasificación de intenciones en asistentes de voz o chat en portugués: el modelo recibe una frase del usuario y un conjunto de intenciones candidatas, y devuelve la etiqueta seleccionada, lo que encaja en un enrutador de diálogo previo a la lógica de negocio.
- Control experimental en investigación sobre datos sintéticos: sirve como brazo de ablación para comparar el efecto del volumen de datos frente a la calidad de los datos sintéticos en tareas de clasificación.
- Evaluación de pipelines de generación de datos: al compartir configuración de entrenamiento con el modelo real de referencia, permite aislar la contribución de la pipeline agéntica de generación.
- Prototipado de sistemas de atención al cliente en portugués: con etiquetas de intención como "consultar clima" o "consultar agenda", puede alimentar un clasificador de primer nivel en un bot multi-turno, aunque su estado de investigación desaconseja producción.
- Benchmarking interno de modelos de clasificación: su formato de evaluación con 20 opciones y métricas de accuracy y macro-F1 permite comparar de forma reproducible contra otros clasificadores de intenciones.
- Docencia y reproducción de experimentos: el repositorio incluye configuración, semillas y predicciones por frase en `results/`, lo que facilita la replicación del estudio en cursos o artículos.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre `Synth-NLP/massive-pt-br-avaliacao`, con 20 opciones sorteadas (azar = 0,050), media de las semillas 0, 1 y 2:

| Conjunto | Acurácia | Macro-F1 |
|---|---:|---:|
| `vistas` | 0.902 | 0.902 |
| `nao_vistas` | 0.728 | 0.681 |

Referencia del grupo real (según la model card): 0,889 en `vistas` y 0,728 en `nao_vistas`. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 321,9 millones de parámetros, una estimación orientativa en fp16 sería de aproximadamente 0,65 GB solo para los pesos, y en torno a 0,35 GB en int8, aunque estas cifras no están confirmadas por el autor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por tamaño de parámetros sería viable en GPUs de consumo con suficiente VRAM, pero no hay datos oficiales.
- Opciones de despliegue: la model card solo documenta la carga mediante la librería `laya` (`laya.load(...)`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Synth-NLP/laya-multilingual-massive-ablacao-AB1 | 321.908.998 | no disponible | 0,902 (`vistas`) / 0,728 (`nao_vistas`) | Apache 2.0 | Hugging Face (marcado como privado por el autor) |
| Synth-NLP/laya-multilingual-massive-real | no disponible | no disponible | 0,889 (`vistas`) / 0,728 (`nao_vistas`) | no disponible | Hugging Face |
| convaiinnovations/laya (checkpoint `multilingual`) | no disponible | no disponible | no disponible | Apache 2.0 (heredada) | Hugging Face |

No se dispone de datos de otros clasificadores comparables (por ejemplo, basados en XLM-R o mBERT) en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación en estado "resultado en curso" y marcado como privado por el autor: no debe usarse en producción.
- Entrenado únicamente en portugués de Brasil; no se garantiza su comportamiento en otras variantes del portugués ni en otros idiomas.
- El conjunto de entrenamiento AB1 repite cinco veces las mismas 5.405 frases reales, lo que puede provocar sobreajuste a ese subconjunto y limitar la diversidad lingüística aprendida.
- Riesgo de alucinación no evaluado: al ser un clasificador de opciones cerradas, el riesgo se manifiesta como selección de una intención incorrecta cuando la frase queda fuera de la distribución de entrenamiento.
- Los resultados en escenarios no vistos (0,728 de accuracy, 0,681 de macro-F1) indican una degradación notable respecto a los vistos (0,902), relevante para cualquier uso real.
- La evaluación usa 20 opciones sorteadas entre las intenciones del conjunto; el rendimiento puede variar con otro número de opciones o con intenciones fuera del conjunto evaluado.
- Licencia Apache 2.0 heredada del modelo base, sin restricciones comerciales declaradas, pero los pesos derivan de Laya (Convai Innovations) y algunos datos de brazos D derivan de MASSIVE (© Amazon.com, Inc. o afiliadas, CC BY 4.0), lo que exige mantener la atribución correspondiente.
- No se documentan sesgos específicos ni evaluación de robustez frente a entradas adversarias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Synth-NLP/laya-multilingual-massive-ablacao-AB1
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Grupo de comparación real: https://huggingface.co/Synth-NLP/laya-multilingual-massive-real
- Dataset de entrenamiento: https://huggingface.co/datasets/Synth-NLP/massive-pt-br-sintetico-v4
- Dataset de evaluación: https://huggingface.co/datasets/Synth-NLP/massive-pt-br-avaliacao
- Paper de MASSIVE: https://arxiv.org/abs/2204.08582
