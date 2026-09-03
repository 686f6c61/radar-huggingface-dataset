# TrajectoryLabs/Nemotron-3.5-Lightning-Tau3-Harness-Matched-LoRA

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) desarrollado por TrajectoryLabs para el modelo base NVIDIA Nemotron 3.5 Lightning 30B-A3B, un modelo de lenguaje de arquitectura MoE (Mixture of Experts) con 30 mil millones de parámetros totales y 3 mil millones activos. El adaptador, denominado Tau3 Harness-Matched, está diseñado específicamente para mejorar el rendimiento en tareas de agentes con uso de herramientas (tool-use) multi-turno, siguiendo el protocolo de evaluación Tau3 desarrollado por AfterQuery. Se entrenó sobre datos privados de AfterQuery utilizando el mismo protocolo de interacción que la evaluación pública Tau3 Banking.

La relevancia de este adaptador radica en que permite ajustar un modelo base eficiente y abierto de NVIDIA para tareas de agente sin necesidad de reentrenar todos los parámetros, lo que reduce significativamente los costes de cómputo. El adaptador se distribuye bajo la licencia NVIDIA Open Model License, lo que permite su uso, modificación y distribución comercial sin permiso explícito de NVIDIA. Está pensado para investigación y evaluación de agentes multi-turno con tool-use, especialmente en el contexto del protocolo Tau3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre MoE (base: NVIDIA Nemotron 3.5 Lightning 30B-A3B) |
| Parametros totales | no disponible (adaptador LoRA rank 32, alpha 32, todas las capas lineales) |
| Parametros activos | 3B (del modelo base MoE) |
| Longitud de contexto | no disponible (depende del modelo base) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en BF16; el modelo base admite cuantizaciones de NVIDIA) |
| Idiomas soportados | no disponibles |
| Licencia | nvidia-open-model-license |
| Formato de pesos | safetensors (PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 y alpha 32 aplicado a todas las capas lineales del modelo base NVIDIA Nemotron 3.5 Lightning 30B-A3B. El modelo base es un transformer con arquitectura MoE, donde solo 3B de los 30B parámetros se activan por token, lo que permite una inferencia eficiente. El entrenamiento del adaptador se realizó sobre datos privados de AfterQuery, utilizando el mismo protocolo de interacción modelo-usuario que la evaluación pública Tau3 Banking. Se usó el checkpoint de entrenamiento paso 15 del experimento 1049939 de TrajectoryLabs. No se han publicado detalles sobre el dataset de entrenamiento ni sobre el proceso de optimización (RLHF, DPO, etc.). El adaptador no incluye los pesos del modelo base y debe cargarse sobre el modelo base en la revisión especificada.

## Capacidades

- Uso de herramientas (tool-use) multi-turno: el adaptador mejora el rendimiento en tareas que requieren interacciones secuenciales con herramientas, según el protocolo Tau3.
- Mejora de precisión en tareas de agente: en un holdout privado de 120 ejemplos, el adaptador aumentó la precisión exacta del 11.67% al 15.83% y la recompensa media de 51.36 a 60.10 bajo el protocolo privado de Tau3.
- Compatible con el runtime y chat-template del modelo base Nemotron 3.5 Lightning.
- Capacidad de evaluación reproducible: el adaptador está diseñado para compararse bajo protocolos idénticos, lo que facilita la investigación en agentes.

## Casos de uso

- Evaluación de agentes con tool-use: el adaptador se puede utilizar para medir el rendimiento de agentes en entornos como Tau3 Banking, donde se requiere interacción multi-turno con herramientas y un límite de pasos.
- Investigación en aprendizaje por refuerzo para agentes: los investigadores pueden usar este adaptador como punto de partida para estudiar cómo el fine-tuning con LoRA afecta el comportamiento de agentes en tareas de decisión secuencial.
- Prototipado rápido de agentes conversacionales: al ser un adaptador ligero (1.5 GB), se puede integrar en pipelines existentes con el modelo base para probar mejoras en tareas de tool-use sin reentrenar el modelo completo.
- Benchmarking de protocolos de evaluación: el adaptador sirve para validar la consistencia de diferentes harnesses y protocolos de evaluación, ya que su rendimiento es sensible a la configuración del entorno.
- Fine-tuning selectivo para dominios específicos: la arquitectura LoRA permite combinar este adaptador con otros adaptadores entrenados para dominios concretos, manteniendo los pesos base intactos.
- Despliegue en entornos con recursos limitados: al activar solo 3B parámetros, el modelo base con el adaptador puede ejecutarse en GPUs de consumo medio, aunque se requiere memoria suficiente para los pesos totales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks públicos comparativos. La model card reporta los siguientes resultados en un holdout privado de 120 ejemplos bajo el protocolo Tau3 privado, comparando el modelo base con el adaptador aplicado:

| Metrica | Modelo base | Con adaptador |
|---|---|---|
| Precision exacta | 11.67% | 15.83% |
| Recompensa media | 51.36 | 60.10 |

La evaluación completa con el protocolo Tau3 Banking público (97 tareas, cinco pruebas por tarea, límite de 200 pasos) estaba en curso en el momento de la publicación.

## Requisitos de hardware

- El adaptador LoRA pesa aproximadamente 1.5 GB en formato safetensors, pero requiere cargar el modelo base completo.
- El modelo base NVIDIA Nemotron 3.5 Lightning 30B-A3B en BF16 ocupa aproximadamente 60 GB de memoria (30B parámetros × 2 bytes). Sin embargo, al ser MoE con 3B activos, la memoria de activación es menor, pero los pesos totales deben estar en memoria o en disco con offloading.
- Para inferencia en GPU, se recomienda al menos una GPU con 48 GB de VRAM (como A6000 o A100 de 40/80 GB) para cargar el modelo completo en BF16. Con cuantizaciones de 8 bits o 4 bits, podría caber en GPUs de 24 GB (como RTX 3090/4090), pero no se han publicado configuraciones oficiales.
- Opciones de despliegue: el adaptador se carga con la librería PEFT sobre Transformers. El modelo base admite vLLM, TGI y llama.cpp, pero el adaptador requiere el soporte de PEFT en el runtime.
- Latencia y throughput: no disponibles. Dependen de la GPU, la cuantización y el número de tokens generados.

## Comparativa con modelos similares

No se dispone de comparativas públicas con otros adaptadores LoRA para tool-use. Como referencia, se puede comparar con el modelo base sin adaptador, que muestra un rendimiento inferior en las métricas Tau3. Otros modelos de tool-use como los de la serie Function Calling de Mistral o Qwen podrían ser comparables, pero no hay datos de evaluación bajo el mismo protocolo. La siguiente tabla resume la comparación con el modelo base:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Nemotron 3.5 Lightning 30B-A3B (base) | 30B totales, 3B activos | no disponible | NVIDIA Open Model | HuggingFace |
| Este adaptador LoRA | LoRA rank 32 | no disponible | NVIDIA Open Model | HuggingFace |
| Otros adaptadores LoRA para tool-use | no disponible | no disponible | variable | no disponible |

## Limitaciones y advertencias

- El rendimiento es sensible al harness de agente, las herramientas, el simulador de usuario, los parámetros de decodificación, el límite de turnos y la implementación de la evaluación. Los resultados solo son comparables bajo un protocolo idéntico.
- El adaptador se entrenó exclusivamente con datos privados de AfterQuery; no se han publicado detalles sobre la composición del dataset ni sobre posibles sesgos.
- No se han evaluado capacidades generales de generación de texto, razonamiento o código; el adaptador está especializado en tool-use y puede degradar el rendimiento en otras tareas si se aplica sin cuidado.
- La licencia NVIDIA Open Model License permite uso comercial, pero se debe revisar el texto completo de la licencia del modelo base, ya que puede imponer restricciones adicionales sobre atribución o redistribución.
- El adaptador no incluye los pesos del modelo base; es necesario descargar el modelo base por separado y cargar la revisión exacta especificada para garantizar la compatibilidad.
- No se ha verificado el comportamiento del adaptador en idiomas distintos del inglés; no se dispone de información sobre multilingüismo.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/TrajectoryLabs/Nemotron-3.5-Lightning-Tau3-Harness-Matched-LoRA
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Licencia del modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16/blob/main/LICENSE
- Artículo de CNBC sobre el lanzamiento de Nemotron 3.5 Lightning: https://www.cnbc.com/2026/08/11/nvidia-releases-nemotron-3point5-lightning-open-source-ai-model-.html
- Repositorio GitHub de NVIDIA Nemotron: https://github.com/NVIDIA-NeMo/Nemotron
