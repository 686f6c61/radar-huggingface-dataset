# Synth-NLP/laya-multilingual-massive-sint-v4-D1

## Resumen

Laya multilingual massive sint v4 D1 es un modelo de clasificación de intenciones (intent classification) para portugués de Brasil, desarrollado por Synth-NLP como fine-tuning del checkpoint `multilingual` del modelo Laya de Convai Innovations. Con 321.908.998 parámetros, el modelo se ha entrenado sobre una mezcla de datos reales y datos sintéticos generados por una pipeline agéntica, y forma parte de un experimento controlado que compara el rendimiento de datos sintéticos frente a datos reales en tareas de comprensión de intenciones.

El modelo resuelve una tarea concreta: dado un enunciado en portugués y un conjunto de opciones de intención, seleccionar la correcta. Se integra en el ecosistema Laya mediante la librería `laya`, que expone una interfaz de agente con preguntas de tipo `choice`. Su relevancia actual radica en que documenta de forma reproducible (semilla fija, dataset público, predicciones por frase) el impacto de los datos sintéticos en una tarea de clasificación multilingüe, un área con escasa evidencia empírica publicada.

El modelo está marcado explícitamente por el autor como "modelo de investigación, resultado en proceso" y el repositorio figura como privado en la model card, aunque la ficha de Hugging Face es accesible. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Laya de Convai Innovations; familia no detallada) |
| Parámetros totales | 321.908.998 |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | portugués (pt, pt-br) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repo: 2.0 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint `multilingual` de Laya (Convai Innovations). La model card no detalla la arquitectura interna del modelo base (transformer denso, MoE u otra), por lo que este dato figura como no disponible. El pipeline declarado es `text-classification`, con la etiqueta específica `intent-classification`, y la librería de carga es `laya`.

El entrenamiento se realizó sobre el fichero `train_laya_D1_v4.jsonl` del dataset `Synth-NLP/massive-pt-br-sintetico-v4` (carpeta `treino_laya/`), que combina datos reales con datos sintéticos de "30 vistas y 30 nuevas". La configuración sigue los valores por defecto de `laya.train.finetune` 0.4.14: 4 épocas, lote efectivo de 64, objetivo `rlcd` y `shuffle_options=("choice",)`, con semilla de entrenamiento 0. Los datos sintéticos se generaron con Gemma 4 12B y Qwen3.5-9B, e incluyen frases derivadas del corpus MASSIVE (Amazon, CC BY 4.0). La validación se realiza sobre `Synth-NLP/massive-pt-br-avaliacao` con 20 opciones muestreadas entre las intenciones del conjunto (nivel de azar = 0,050).

## Capacidades

- Clasificación de intenciones en portugués de Brasil: selección de la intención correcta entre un conjunto de opciones proporcionado en tiempo de inferencia.
- Formato de pregunta de tipo `choice` con instrucciones y criterios definidos por el usuario, según la interfaz de la librería `laya`.
- Evaluación en escenarios "vistos" (presentes en la generación de datos sintéticos) y "no vistos" (reservados y nunca usados en la generación), lo que permite medir generalización.
- Soporte de datos sintéticos y reales en el mismo pipeline de entrenamiento.
- No se documentan capacidades de generación de texto libre, razonamiento multi-paso, tool calling, visión, audio ni modo "thinking".

## Casos de uso

- Enrutamiento de intenciones en asistentes conversacionales en portugués: el modelo recibe el enunciado del usuario y un conjunto cerrado de intenciones candidatas, y devuelve la etiqueta seleccionada, lo que permite dirigir la conversación al flujo adecuado.
- Clasificación de peticiones en atención al cliente: con un catálogo de intenciones predefinido (consultar clima, consultar agenda, encender luz, etc.), el modelo asigna cada mensaje entrante a la cola o al agente correspondiente.
- Investigación sobre calidad de datos sintéticos: al compararse con el brazo real `Synth-NLP/laya-multilingual-massive-real`, sirve para cuantificar la brecha entre entrenamiento con datos sintéticos y con datos reales en una tarea controlada.
- Evaluación de robustez ante escenarios no vistos: el subconjunto `nao_vistas` permite medir la degradación del modelo cuando las intenciones no aparecieron en la generación sintética, útil para decidir si conviene ampliar la cobertura del generador.
- Prototipado rápido de clasificadores de intención en portugués: al estar basado en un checkpoint multilingüe y publicarse con licencia Apache 2.0, puede adaptarse a dominios concretos con un volumen reducido de ejemplos etiquetados.
- Reproducibilidad de experimentos: la semilla fija, el dataset público y las predicciones por frase en `results/` permiten replicar el entrenamiento y auditar los resultados en un entorno de investigación.

## Benchmarks y rendimiento

Resultados de validación sobre `Synth-NLP/massive-pt-br-avaliacao`, con 20 opciones muestreadas entre las intenciones del conjunto (azar = 0,050) y media de las semillas 0, 1 y 2. La referencia real es 0,889 (`vistas`) y 0,728 (`nao_vistas`).

| Conjunto | Acurácia | Macro-F1 |
|---|---:|---:|
| `vistas` | 0.901 | 0.868 |
| `nao_vistas` | 0.758 | 0.719 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 321,9 M de parámetros en precisión completa (fp32) los pesos ocupan aproximadamente 1,3 GB; en fp16/bf16, unos 0,64 GB. Estas cifras son estimaciones a partir del número de parámetros, no datos publicados por el autor.
- GPU recomendadas: no disponible. Por tamaño, el modelo es apto para GPU de consumo con suficiente VRAM para el checkpoint en fp16, aunque no se documentan requisitos oficiales.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del checkpoint (2,0 GB de repo), si bien no hay confirmación del autor.
- Opciones de despliegue: la vía documentada es la librería `laya` (`laya.load(...)` y `agente.predict(...)`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Synth-NLP/laya-multilingual-massive-sint-v4-D1 | 321,9 M | no disponible | Clasificación de intenciones (pt-br) | Apache 2.0 | Hugging Face (repo marcado como privado en la model card) |
| Synth-NLP/laya-multilingual-massive-real | no disponible | no disponible | Clasificación de intenciones (pt-br), brazo de comparación real | no disponible | Hugging Face |
| convaiinnovations/laya (checkpoint `multilingual`) | no disponible | no disponible | Modelo base multilingüe | no disponible | Hugging Face |

El brazo real reporta 0,889 de accuracy en `vistas` y 0,728 en `nao_vistas`, frente a 0,901 y 0,758 del modelo sintético D1. No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: el autor lo declara explícitamente como "resultado en proceso" y el repositorio figura como privado en la model card, lo que puede afectar a la disponibilidad y estabilidad del artefacto.
- Cobertura lingüística limitada al portugués (pt, pt-br); no se documenta rendimiento en otras lenguas pese a partir de un checkpoint multilingüe.
- El conjunto de evaluación se limita a 20 opciones muestreadas entre las intenciones del conjunto; los resultados no son directamente comparables con benchmarks de clasificación estándar.
- Brecha de generalización: la accuracy cae de 0,901 en `vistas` a 0,758 en `nao_vistas`, lo que indica dependencia de la cobertura de la pipeline sintética.
- Riesgo de sesgo heredado de los datos sintéticos generados con Gemma 4 12B y Qwen3.5-9B, y de las frases derivadas de MASSIVE (Amazon, CC BY 4.0).
- No se documentan requisitos de hardware, latencia ni opciones de despliegue en producción.
- La licencia Apache 2.0 permite uso comercial, pero la atribución a Laya (Convai Innovations) y a MASSIVE (Amazon.com, Inc. o afiliadas) debe mantenerse según indica el autor.
- No se han publicado análisis de alucinación ni de calibración para esta tarea.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Synth-NLP/laya-multilingual-massive-sint-v4-D1
- Modelo base Laya: https://huggingface.co/convaiinnovations/laya
- Brazo de comparación real: https://huggingface.co/Synth-NLP/laya-multilingual-massive-real
- Dataset de entrenamiento: https://huggingface.co/datasets/Synth-NLP/massive-pt-br-sintetico-v4
- Dataset de evaluación: https://huggingface.co/datasets/Synth-NLP/massive-pt-br-avaliacao
- Paper de MASSIVE: https://arxiv.org/abs/2204.08582
