# suryatmodulus/pplx-decider-v1.1-27b

## Resumen

pplx-decider-v1.1-27b es un modelo de clasificación y decisión construido sobre el backbone Qwen3.8-27B (clase Qwen3_5Model) mediante fine-tuning. Su función no es la generación libre de texto, sino actuar como un "decider": recibe un estado y una pregunta con un conjunto cerrado de criterios o candidatos, y devuelve una distribución de probabilidad sobre esas opciones. Está desarrollado por el usuario suryatmodulus en Hugging Face, aunque su model card referencia el repositorio original de perplexity-ai, del que esta versión es una actualización.

La relevancia de esta versión radica en que eleva la puntuación global del Decision Index de 56.4 (versión 1) a 61.56, superando por más de 3.5 puntos al modelo Jev. La mayor parte de la mejora proviene de eliminar la máscara causal en las capas de atención completa (atención no causal) y de ampliar los datos de entrenamiento, incorporando el corpus tasksource. El checkpoint mantiene el mismo backbone de 26.085.330.160 parámetros (aproximadamente 26,1 mil millones), pero sustituye la cabeza de lenguaje por un cabezal de decisión BF16 de dimensiones [255, 5120].

El artefacto se distribuye con un diseño específico: un backbone más un fichero readout.safetensors, no un lm_head de vocabulario completo. Esto implica que su despliegue requiere el código de inferencia incluido (autojev) para reproducir el comportamiento evaluado, y que no es directamente compatible con servidores genéricos que esperan una cabeza de generación estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido basado en Qwen3.8-27B (clase Qwen3_5Model), con capas de atención completa y capas de atención lineal |
| Parametros totales | 26.085.330.160 (aproximadamente 26,1 B) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en BF16 segun la model card) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (backbone + readout.safetensors con cabezal BF16 [255, 5120]) |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen3.8-27B, cargado bajo la clase Qwen3_5Model. La arquitectura es híbrida: combina capas de atención completa con capas de atención lineal. La innovación clave de esta versión es que las capas de atención completa se ejecutan en modo no causal (noncausal), un cambio que, según la model card, explica buena parte de la mejora en el Decision Index. Las capas de atención lineal conservan su comportamiento nativo.

Sobre el backbone se monta un cabezal de decisión separado (readout.safetensors) de tipo BF16 con forma [255, 5120], en lugar de un lm_head de vocabulario completo. La inferencia pasa por una temperatura de calibración guardada que debe aplicarse exactamente una vez y normalizarse sobre los candidatos válidos de cada decisión. En cuanto a los datos, la model card indica que el entrenamiento amplió el volumen respecto a la versión 1 e incorporó datos de tasksource; no se especifica el número total de tokens ni si hubo RLHF o DPO. No se detalla la composición completa del dataset más allá de la mención a tasksource.

## Capacidades

- Clasificación de decisiones sobre un conjunto cerrado de candidatos: devuelve probabilidades normalizadas para cada opción definida en la pregunta.
- Soporte de preguntas de tipo "choice" con criterios explícitos (por ejemplo, enrutar una petición a facturación, soporte o ventas).
- Capacidad multimodal declarada en las etiquetas del repositorio (tag "multimodal"), aunque la model card no detalla modalidades concretas.
- Razonamiento de decisión evaluado en cinco categorías del Decision Index: conocimiento, lenguaje, recuperación, herramientas y artes.
- Atención no causal en las capas de atención completa, orientada a tareas de decisión con contexto global.
- Cabeza de decisión de 255 salidas, con temperatura de calibración propia.
- No se documenta soporte explícito de tool calling, function calling ni comportamiento de agente multi-paso.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una incidencia, el modelo reparte probabilidad entre categorías como billing, support o sales, tal como muestra el ejemplo oficial de la model card.
- Triaje de peticiones entrantes en atención al cliente: clasificar y derivar consultas a equipos especializados usando el cabezal de 255 salidas como espacio de decisión.
- Selección entre opciones cerradas en pipelines automáticos: cualquier tarea donde haya que elegir una acción o etiqueta de un conjunto finito y se quiera una distribución de probabilidad en lugar de una etiqueta dura.
- Sistemas de recomendación con candidatos predefinidos: puntuar y ordenar opciones discretas (por ejemplo, planes, productos o respuestas) según el estado de entrada.
- Filtrado y moderación de contenido con criterios configurables: definir criterios como etiquetas de decisión y obtener una probabilidad por cada uno.
- Investigación en evaluación de modelos de decisión: el modelo forma parte del ecosistema del Decision Index, por lo que sirve como referencia para comparar estrategias de decisión.
- Clasificación por lotes en pipelines de datos: al exponer una función predict sobre listas de filas, encaja en procesos de anotación o clasificación masiva.

## Benchmarks y rendimiento

Los datos disponibles corresponden al Decision Index, la suite de evaluación del propio ecosistema del modelo. La model card publica los siguientes resultados:

| Categoria del Decision Index | Jev | pplx-decider-v1-27b | pplx-decider-v1.1-27b |
|---|---:|---:|---:|
| Knowledge | 51.4 | 40.9 | 48.18 |
| Language | 62.0 | 63.5 | 69.45 |
| Retrieval | 55.4 | 54.9 | 61.26 |
| Tools | 75.1 | 79.3 | 78.88 |
| Arts | 37.7 | 39.4 | 44.66 |
| Overall Decision Index | 57.9 | 56.4 | 61.56 |

La puntuación global emplea la ponderación propia de la suite, no una media simple de las categorías. No se han publicado en la informacion disponible resultados de benchmarks estándar de lenguaje como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- La model card indica que se necesita una GPU CUDA con espacio para aproximadamente 49 GiB de pesos más memoria de trabajo. El repositorio completo ocupa 52,2 GB.
- Con pesos en BF16 y 26,1 B de parámetros, la inferencia en precisión completa requiere del orden de 49 a 52 GiB de VRAM solo para los pesos, más el espacio adicional para activaciones.
- No cabe en GPUs de consumo convencionales (RTX 4090 con 24 GiB, por ejemplo) sin cuantización, que no está documentada para este checkpoint.
- GPU recomendadas: no se especifican en la información disponible; por el volumen de memoria, el modelo apunta a aceleradores de clase A100 80 GiB, H100 o similares con al menos 80 GiB para operar con margen.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama o TGI. El uso previsto es mediante el código de inferencia incluido (autojev, DecisionModel.predict) con Python 3.12 o superior y acceso autenticado al repositorio.
- Para servir el modelo en sistemas que exigen Qwen3_5ForConditionalGeneration hace falta una exportación separada que mapee la fila i del readout a la fila de vocabulario indicada en decision_config.json["token_ids"][i], preservando además el comportamiento de atención.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Decision Index (Overall) | Licencia | Disponibilidad |
|---|---|---|---:|---|---|
| pplx-decider-v1.1-27b | 26,1 B | no disponible | 61.56 | apache-2.0 | Hugging Face (repositorio indicado como privado en la model card) |
| pplx-decider-v1-27b | mismo backbone Qwen3.8-27B | no disponible | 56.4 | no disponible | Hugging Face (perplexity-ai) |
| Jev | no disponible | no disponible | 57.9 | no disponible | evaluado en el Decision Index |

La comparación disponible se limita al ecosistema del Decision Index. No se dispone de datos de otros modelos de clasificación o decisión de tamaño comparable en la información proporcionada.

## Limitaciones y advertencias

- El modelo no es un generador de texto general: su salida es una distribución sobre un conjunto cerrado de candidatos, no texto libre.
- Al aplicar logits directamente debe aplicarse la temperatura de calibración una sola vez y normalizar sobre los candidatos válidos; hacerlo de forma incorrecta altera el comportamiento evaluado.
- La inferencia con máscara causal por defecto no reproduce el setup evaluado: es obligatorio usar el modo no causal guardado para las capas de atención completa.
- La model card indica acceso autenticado a un repositorio privado y requiere ejecutar el código incluido; el repositorio aparece vinculado al autor suryatmodulus, mientras que la model card referencia perplexity-ai, lo que conviene verificar antes de usarlo en producción.
- Existe un riesgo de alucinación y de calibración deficiente fuera de la distribución de los datos de entrenamiento (tasksource y los datos propios no detallados). La categoría Knowledge obtiene 48.18, por debajo de Jev (51.4), lo que sugiere menor fiabilidad en decisiones de conocimiento factual.
- No se documentan sesgos conocidos ni idiomas soportados, lo que limita las garantías de comportamiento multilingüe.
- La licencia es apache-2.0, lo que en principio permite uso comercial, pero las restricciones del backbone base y del repositorio deben confirmarse de forma independiente.
- No se documenta cuantización, por lo que el despliegue en hardware limitado no está soportado por la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/suryatmodulus/pplx-decider-v1.1-27b
- Modelo predecesor (perplexity-ai): https://huggingface.co/perplexity-ai/pplx-decider-v1-27b
- Espacio del Decision Index: https://huggingface.co/spaces/multimodalart/jev-decision-index
- Repositorio tasksource: https://github.com/sileod/tasksource
- Articulo de tasksource (LREC-COLING 2024): https://aclanthology.org/2024.lrec-main.1361/
