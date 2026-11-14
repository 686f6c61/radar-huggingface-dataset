# ywsldxk1/E1-core100-merged-public

## Resumen

E1-core100-merged-public es un checkpoint de inferencia para robótica desarrollado por el usuario ywsldxk1, publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo de política visomotora construido sobre la arquitectura pi0.5 (pi05) de Physical Intelligence, fusionado en CPU con un adaptador entrenado durante 4000 pasos sobre el benchmark SO-101. El resultado es un checkpoint "merged" que integra los módulos de visión, proyector y acción ya ajustados, junto con sus propios procesadores guardados, listo para evaluación directa sin necesidad de cargar el adaptador por separado.

El modelo cuenta con 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) y un repositorio de 9,4 GB en formato safetensors. Está etiquetado con la librería lerobot, lo que indica que se integra en el ecosistema LeRobot para entrenamiento y despliegue de políticas robóticas. Su pipeline es "robotics", no generación de texto, por lo que sus capacidades se orientan al control de manipuladores robóticos y no al procesamiento de lenguaje natural.

La relevancia de esta publicación es acotada pero específica: proporciona a la comunidad un punto de partida reproducible para evaluar el rendimiento de pi0.5 ajustado sobre tareas del benchmark SO-101, con la salvedad explícita de que la partición Part3A contiene tareas de entrenamiento y su puntuación mide reproducción de tareas vistas, no generalización. Los resultados de evaluación se publican por separado según la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | pi0.5 (pi05), política visomotora para robótica sobre LeRobot |
| Parámetros totales | 4.143.404.816 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en pi0.5 (etiqueta pi05), la arquitectura de política visomotora de Physical Intelligence orientada a control robótico de propósito general. El checkpoint publicado es el resultado de una fusión en CPU ("full CPU-merged") entre el modelo base SO-101 Bench pi0.5 y un adaptador ajustado durante 4000 pasos. La fusión incorpora los módulos de visión, proyector y acción ya entrenados, además de los procesadores propios del adaptador, lo que permite la inferencia directa sin cargar componentes separados.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF o DPO, algo que en cualquier caso resulta poco habitual en políticas robóticas de este tipo. La model card remite a un archivo merge_provenance.json para los detalles de la fusión, pero no se incluyen en la información disponible los hiperparámetros, la composición del dataset SO-101 utilizado ni las innovaciones técnicas específicas del ajuste. La partición Part3A del benchmark contiene tareas de entrenamiento, por lo que las métricas sobre ella miden reproducción y no generalización.

## Capacidades

- Control robótico visomotor: el modelo genera acciones a partir de observaciones visuales para manipuladores del entorno SO-101.
- Integración con LeRobot: compatible con la librería lerobot para carga, evaluación y despliegue de políticas.
- Checkpoint autocontenido: incluye visión, proyector y acción fusionados, más procesadores propios, lo que simplifica la inferencia.
- Evaluación sobre benchmark SO-101: diseñado para medir rendimiento en tareas de manipulación de este benchmark.
- No se ha documentado soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües, modo thinking, audio ni visión general más allá del uso robótico.

## Casos de uso

- Evaluación reproducible de pi0.5 ajustado: sirve como checkpoint de referencia para comparar el efecto de 4000 pasos de ajuste sobre el modelo base SO-101 Bench, cargándolo con lerobot y ejecutando las tareas del benchmark.
- Reproducción de tareas de entrenamiento: la partición Part3A permite verificar que el pipeline de fusión y los procesadores funcionan correctamente, ya que sus tareas coinciden con las de entrenamiento.
- Punto de partida para ajuste adicional: al estar fusionado y con licencia Apache 2.0, puede emplearse como base para nuevos adaptadores sobre tareas SO-101 específicas.
- Integración en pipelines de investigación con LeRobot: útil para equipos que ya trabajan con el ecosistema LeRobot y necesitan un checkpoint listo para inferencia sin gestionar la fusión de adaptadores.
- Validación de infraestructura de despliegue robótico: permite probar la carga de un modelo de 4,14 mil millones de parámetros en safetensors (9,4 GB) y verificar latencias y requisitos de memoria antes de pasar a producción.
- Docencia y experimentación en robótica: como ejemplo práctico de fusión de adaptadores y evaluación de políticas visomotoras en un benchmark público.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica únicamente que los resultados de evaluación se publican por separado y advierte que Part3A contiene tareas de entrenamiento, por lo que su puntuación mide reproducción de tareas vistas.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan 9,4 GB, por lo que se requiere al menos ese espacio en FP32/BF16 según el formato de almacenamiento; no se dispone de datos sobre cuantizaciones alternativas.
- GPU recomendadas: no disponible. Por el tamaño (4,14 mil millones de parámetros), cabría esperar GPUs con 16 GB o más de VRAM, pero no se confirma en la información proporcionada.
- ¿Cabe en GPU de consumo? No confirmado. Un modelo de 4,14 mil millones de parámetros en BF16 requiere en torno a 8,3 GB solo para pesos, lo que en teoría cabría en GPUs de consumo con 12-16 GB, pero no hay datos oficiales de compatibilidad ni de memoria real de inferencia.
- Opciones de despliegue: lerobot (librería declarada). No se documentan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de robótica.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| E1-core100-merged-public | 4.143.404.816 | no disponible | Apache 2.0 | Hugging Face (34 descargas) | Checkpoint fusionado pi0.5 + adaptador 4000 pasos sobre SO-101 |
| pi0.5 base (Physical Intelligence) | no disponible en la información | no disponible | no disponible | no disponible | Modelo base sobre el que se construye este checkpoint |
| SO-101 Bench pi0.5 | no disponible en la información | no disponible | no disponible | no disponible | Modelo base del benchmark citado en la model card |

No se dispone de datos suficientes para comparar parámetros, contexto o rendimiento con alternativas de la misma categoría más allá de las referencias internas de la model card.

## Limitaciones y advertencias

- El checkpoint está orientado exclusivamente a robótica; no es un modelo de lenguaje y no debe evaluarse con métricas de NLP.
- La partición Part3A contiene tareas de entrenamiento: sus puntuaciones miden reproducción, no generalización, y no deben presentarse como rendimiento en tareas nuevas.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado sobre un benchmark específico (SO-101) puede sobreajustarse a las condiciones de ese entorno.
- Riesgo de alucinación no aplicable en el sentido de NLP; en robótica el riesgo equivalente es la generación de acciones incorrectas o inseguras fuera de la distribución de entrenamiento.
- No hay información sobre el dataset de entrenamiento, lo que dificulta evaluar la cobertura y los sesgos de la política.
- Licencia Apache 2.0 permite uso comercial, pero no se ofrece garantía ni soporte del autor.
- El repositorio tiene solo 34 descargas y 1 like, por lo que la validación comunitaria es mínima.
- No se documentan limitaciones de contexto ni de idioma porque el modelo no procesa lenguaje.
- Para producción, es imprescindible validar el modelo en el entorno físico real antes de desplegarlo, dado que la evaluación publicada está pendiente.

## Enlaces

- Hugging Face: https://huggingface.co/ywsldxk1/E1-core100-merged-public
- Archivo de procedencia de la fusión: merge_provenance.json (referenciado en la model card, dentro del repositorio)
- LeRobot (librería): https://github.com/huggingface/lerobot
- Physical Intelligence (pi0.5): no se proporciona enlace en la información disponible
