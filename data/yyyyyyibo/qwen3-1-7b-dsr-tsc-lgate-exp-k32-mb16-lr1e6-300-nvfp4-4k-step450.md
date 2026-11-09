# YYYYYYibo/qwen3-1.7b-dsr-tsc-lgate-exp-k32-mb16-lr1e6-300-nvfp4-4k-step450

## Resumen

qwen3-1.7b-dsr-tsc-lgate-exp-k32-mb16-lr1e6-300-nvfp4-4k-step450 es un ajuste fino por aprendizaje por refuerzo del modelo base Qwen3-1.7B-Base, publicado por el usuario YYYYYYibo en Hugging Face. El checkpoint corresponde al paso 450 de un entrenamiento realizado con verl sobre el conjunto de datos DeepScaleR, orientado a mejorar el razonamiento matemático. No se trata de un modelo nuevo desde cero, sino de una variante experimental del modelo Qwen3 de 1.700 millones de parámetros.

El nombre del repositorio codifica la configuración del experimento: TSC (probablemente alguna variante de entrenamiento con recompensa o destilación) con compuerta suave de desplazamiento de logits (logit-shift, lrms), forma exponencial, delta 0,125, k=32, micro-batch de 16, learning rate 1e-6, 300 pasos planificados y contexto de 4K. Las rollouts durante el entrenamiento se generaron con vLLM cuantizado en NVFP4, aunque los pesos exportados son los del actor sin cuantizar, en precisión completa.

El modelo es relevante para investigadores que estudien técnicas de RL aplicadas a modelos pequeños de razonamiento matemático y para quienes quieran reproducir o comparar experimentos con verl. No obstante, se trata de un artefacto de investigación con documentación mínima, sin licencia declarada ni idiomas especificados, y sin resultados de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-1.7B-Base) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (según el nombre del run; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (los pesos publicados son de precisión completa; durante el entrenamiento se usó NVFP4 en las rollouts con vLLM) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3-1.7B-Base, un transformer decoder-only con atención por grupos de consultas (GQA) y las innovaciones propias de la familia Qwen3, aunque la model card no detalla sus capas ni dimensiones internas. El checkpoint publicado es el actor exportado desde un entrenamiento FSDP con verl, sin estado del optimizador, en precisión completa.

El entrenamiento consistió en RL sobre el dataset DeepScaleR, un corpus de problemas matemáticos con soluciones verificables, con contexto de 4K. La configuración experimental incluye una compuerta suave de desplazamiento de logits (logit-shift lrms soft gate), forma exponencial y delta de 0,125, con k=32, micro-batch de 16 y learning rate de 1e-6 durante 300 pasos planificados; este checkpoint corresponde al paso 450, lo que sugiere que el entrenamiento se extendió más allá de los 300 pasos inicialmente previstos o que el nombre del run no refleja el total real. No se especifican en la información disponible los detalles del algoritmo de RL (por ejemplo, GRPO, PPO o DPO), la composición exacta del dataset ni si hubo fases adicionales de alineamiento.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen3-1.7B.
- Razonamiento matemático, presumiblemente reforzado por el ajuste con DeepScaleR, aunque no hay evaluaciones publicadas que lo confirmen.
- Razonamiento multi-paso, orientado a la resolución de problemas con cadenas de razonamiento.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas no están declarados.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Investigación en RL para razonamiento matemático: el checkpoint permite reproducir y comparar la configuración TSC con compuerta de logit-shift frente a otras variantes, ya que el nombre del run documenta todos los hiperparámetros relevantes.
- Evaluación de técnicas de cuantización en entrenamiento: sirve para estudiar el impacto de generar rollouts con vLLM en NVFP4 mientras se mantienen pesos maestros en precisión completa, un patrón habitual en pipelines de RL a gran escala.
- Fine-tuning posterior sobre dominios matemáticos específicos: al ser un modelo de 1.700 millones de parámetros con contexto de 4K, puede ajustarse en una sola GPU para tareas acotadas como álgebra, cálculo o problemas de competición.
- Generación de soluciones paso a paso en entornos educativos: el ajuste con DeepScaleR apunta a producir cadenas de razonamiento matemático, útil para prototipos de tutores automáticos, siempre que se validen las salidas.
- Base para experimentos de destilación: un modelo pequeño con razonamiento reforzado puede emplearse como estudiante en procesos de destilación desde modelos mayores.
- Pruebas de infraestructura con verl y FSDP: el formato de exportación (actor sin estado del optimizador) facilita integrarlo en pipelines de evaluación y despliegue con transformers o vLLM.
- Comparación de checkpoints intermedios: al estar etiquetado por paso, permite analizar la evolución del rendimiento durante el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,5 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB según la longitud de contexto.
- VRAM estimada en cuantización de 8 bits: alrededor de 2 GB para los pesos; en 4 bits, alrededor de 1,2 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 con contexto moderado; A100, H100 o L40S para despliegues con concurrencia.
- GPU de consumo: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090; en GPUs de 8 GB puede requerir cuantización.
- Opciones de despliegue: transformers (formato nativo), vLLM (compatible con la arquitectura Qwen3), llama.cpp u Ollama tras conversión a GGUF, y TGI.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qwen3-1.7b-dsr-tsc-lgate-exp-k32-mb16-lr1e6-300-nvfp4-4k-step450 | 1,72 B | 4K (según run) | no disponible | Hugging Face, 0 descargas | Checkpoint experimental de RL matemático |
| Qwen3-1.7B-Base | 1,72 B | 32K (según la familia Qwen3) | Apache 2.0 (según la familia Qwen3) | Hugging Face, ampliamente distribuido | Modelo base original, sin ajuste de RL |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,5 B | 32K (según el modelo original) | MIT (según el modelo original) | Hugging Face, muy descargado | Destilado de razonamiento matemático con licencia permisiva |

La comparación con Qwen3-1.7B-Base y DeepSeek-R1-Distill-Qwen-1.5B se ofrece como referencia de categoría; los datos de contexto y licencia de esos modelos no provienen de la información proporcionada para este checkpoint y deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- Documentación mínima: la model card no declara licencia, idiomas, composición del dataset ni detalles del algoritmo de RL, lo que dificulta evaluar su idoneidad para producción.
- Licencia no disponible: sin licencia explícita, no puede asumirse permiso para uso comercial; debe contactarse con el autor o tratarse como uso exclusivamente de investigación.
- Riesgo de alucinación: como todo modelo de lenguaje de 1,7 B, puede generar razonamientos matemáticos plausibles pero incorrectos, especialmente en problemas de varios pasos.
- Contexto limitado: el entrenamiento se realizó con 4K tokens, lo que restringe la longitud de las cadenas de razonamiento y de las conversaciones multi-turno.
- Sin benchmarks: no hay evidencia publicada de mejora frente al modelo base ni de su rendimiento en conjuntos estándar como GSM8K o MATH.
- Artefacto experimental: el nombre del run indica una configuración concreta de un experimento de investigación; no se garantiza estabilidad, soporte ni mantenimiento.
- Idiomas no declarados: no puede asumirse un rendimiento multilingüe más allá del que herede del modelo base.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validación externa del checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YYYYYYibo/qwen3-1.7b-dsr-tsc-lgate-exp-k32-mb16-lr1e6-300-nvfp4-4k-step450
- Repositorio verl: no disponible en la información proporcionada
- Paper de DeepScaleR: no disponible en la información proporcionada
- Modelo base Qwen3-1.7B-Base: no disponible en la información proporcionada
- Blog o demo del autor: no disponible en la información proporcionada
