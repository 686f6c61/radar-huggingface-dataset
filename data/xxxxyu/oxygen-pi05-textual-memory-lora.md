# XXXXyu/oxygen-pi05-textual-memory-lora

## Resumen

OxyGen pi0.5 textual-memory LoRA es un adaptador de bajo rango (rank 16) desarrollado por Xiangyu Li (investigador en AIR, Tsinghua University) sobre el modelo base pi0.5 de openpi, un modelo de visión-lenguaje-acción (VLA) con arquitectura Mixture-of-Transformers. Su función es generar una "memoria textual" (textual memory) a partir de la observación actual, el estado del robot y la instrucción de la tarea, utilizando un sufijo autoregresivo con el seed privado `Memory: `. Esta memoria textual se incorpora al flujo de generación de acciones del modelo, permitiendo que el experto de acción lea el KV cache raíz sin modificaciones.

El adaptador se integra en el framework OxyGen, que optimiza la gestión unificada de KV cache para modelos VLA en escenarios de paralelismo multi-tarea, con compartición de KV entre tareas y batching continuo entre frames. El modelo está pensado para mejorar las capacidades de razonamiento y memoria de los agentes robóticos en entornos LIBERO, un benchmark estándar de manipulación robótica. Es un componente ligero (0.1 GB de tamaño de repositorio) que se añade a un checkpoint base congelado, lo que facilita su despliegue en sistemas de robótica real.

La relevancia actual radica en la creciente demanda de modelos VLA con capacidades de razonamiento contextual y memoria a largo plazo, necesarios para tareas de manipulación complejas que requieren recordar información de la escena o del historial de interacciones. Este LoRA ofrece una vía eficiente para dotar a pi0.5 de esta capacidad sin reentrenar el modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank 16) sobre modelo VLA pi0.5 (Mixture-of-Transformers) |
| Parametros totales | no disponible (el adaptador es de 0.1 GB, el base no se incluye) |
| Parametros activos | no disponible (el adaptador es un LoRA, el base se congela) |
| Longitud de contexto | no disponible (máximo de sufijo de memoria: 28 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0-and-gemma-terms (Apache 2.0 para código OxyGen, términos Gemma para componentes del modelo) |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 que se entrena sobre el checkpoint base `gs://openpi-assets/checkpoints/pi05_libero`. El modelo base es un VLA con arquitectura Mixture-of-Transformers (MoT), que combina un transformador de lenguaje (basado en Gemma) con un experto de acción especializado. El LoRA se añade al módulo de lenguaje para generar el sufijo de memoria textual, mientras que el experto de acción permanece sin cambios y lee el KV cache raíz intacto. Esto garantiza que la memoria generada no interfiera con la representación de acción original.

El entrenamiento se realiza con el framework OxyGen, que gestiona el KV cache de forma unificada. Los datos de entrenamiento no se detallan en la información disponible, pero se menciona que las anotaciones derivadas están publicadas en un dataset de HuggingFace (`xxxxyu/libero-textual-memory-annotations`). El sufijo de memoria tiene una longitud máxima de 28 tokens y se activa mediante el seed `Memory: `. No se especifica si se utilizó RLHF o DPO; probablemente sea un entrenamiento supervisado estándar sobre anotaciones textuales.

La innovación principal reside en la integración con OxyGen, que permite compartir el KV cache entre tareas y realizar batching continuo entre frames, reduciendo la latencia y el consumo de memoria en despliegues multi-tarea.

## Capacidades

- Generación de memoria textual basada en la observación actual, el estado del robot y la instrucción de la tarea, usando un sufijo autoregresivo con seed `Memory: `.
- Soporte para tareas de robótica del benchmark LIBERO, incluyendo manipulación y navegación con instrucciones en lenguaje natural.
- Integración con el pipeline de openpi para visión-lenguaje-acción, permitiendo que el experto de acción consuma la memoria generada sin modificar su funcionamiento.
- Compatibilidad con el framework OxyGen para gestión eficiente de KV cache en escenarios multi-tarea.
- Capacidad de generar memoria textual de hasta 28 tokens, suficiente para describir estados relevantes de la escena o instrucciones intermedias.
- No se reportan capacidades de tool calling, agentes multi-paso ni multimodales más allá de la entrada visual y textual del VLA base.

## Casos de uso

- Manipulación robótica con instrucciones contextuales: el modelo genera una memoria textual de la escena (por ejemplo, "el objeto rojo está a la izquierda del bloque azul") que guía al experto de acción para ejecutar la tarea correctamente en entornos LIBERO.
- Razonamiento multi-paso en robótica: al mantener un sufijo de memoria autoregresivo, el agente puede recordar estados intermedios durante la ejecución de tareas compuestas, mejorando la coherencia de las acciones.
- Despliegue en sistemas de bajo coste computacional: al ser un LoRA ligero (0.1 GB) sobre un modelo base congelado, puede ejecutarse en GPUs consumer con requisitos de VRAM moderados, especialmente con cuantización del base.
- Investigación en VLA: sirve como base para estudiar cómo la memoria textual explícita afecta al rendimiento de agentes robóticos, permitiendo comparar con variantes sin memoria.
- Integración en pipelines de robótica con openpi: al ser un adaptador compatible con openpi, puede combinarse con otros módulos del ecosistema (por ejemplo, planificadores de trayectorias) sin necesidad de modificar el modelo base.
- Evaluación de benchmarks de manipulación: el adaptador está diseñado específicamente para LIBERO, por lo que puede utilizarse en evaluaciones estandarizadas de VLA con memoria textual.

## Benchmarks y rendimiento

Los datos de rendimiento reportados en la model card se refieren a la calidad de la memoria textual generada, no a tareas de manipulación completas. No se proporcionan resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, ya que el modelo está orientado a robótica.

| Metrica | Valor |
|---|---|
| Held-out token accuracy | 98.15% |
| Greedy exact match | 87.25% |
| Greedy word F1 | 90.01% |
| Root-cache/action maximum absolute difference | 0 / 0 |
| Adapter overhead | 8.16 ms |
| Shared prefix forward | 47.66 ms |

La diferencia absoluta de 0 entre el KV cache raíz y la acción indica que el adaptador no altera la representación de acción original, lo que es un requisito de diseño.

## Requisitos de hardware

- No se especifican requisitos de VRAM en la información disponible. El adaptador es de solo 0.1 GB, por lo que la VRAM dominante será la del modelo base pi0.5 (no incluido en este repositorio).
- El modelo base pi0.5, al ser un VLA con Mixture-of-Transformers, suele requerir GPUs con al menos 24 GB de VRAM en fp16 (por ejemplo, RTX 3090/4090, A100). Con cuantización 4-bit podría caber en 12-16 GB, pero no se confirma.
- Para inferencia con openpi, se recomienda usar vLLM o TGI para el componente de lenguaje, y el pipeline de openpi para la parte VLA. El framework OxyGen proporciona herramientas de serving específicas.
- La latencia medida en la model card (overhead del adaptador 8.16 ms, forward del prefijo compartido 47.66 ms) sugiere que es adecuado para aplicaciones en tiempo real en robótica, siempre que el hardware pueda ejecutar el modelo base a esa velocidad.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (adaptadores LoRA para memoria textual en VLA). El modelo es una contribución específica dentro del ecosistema OxyGen/openpi, sin alternativas directas publicadas. Se puede mencionar que otros enfoques de memoria en VLA (como memorias episódicas o buffers de contexto) existen, pero no se han encontrado modelos equivalentes en la búsqueda web.

## Limitaciones y advertencias

- La licencia es mixta: el código OxyGen es Apache 2.0, pero los componentes Gemma del modelo base están sujetos a los términos de Gemma, que pueden restringir el uso comercial en ciertos casos. Es necesario revisar los términos de openpi y Gemma antes de usar en producción.
- El adaptador depende del checkpoint base `gs://openpi-assets/checkpoints/pi05_libero`, que no se incluye en este repositorio. Hay que descargarlo por separado y verificar su licencia.
- No se proporcionan datos sobre sesgos o alucinaciones del modelo. Al ser un generador de memoria textual, existe riesgo de que genere descripciones incorrectas de la escena, lo que podría llevar a acciones erróneas del robot.
- La longitud máxima de memoria es de 28 tokens, lo que limita la cantidad de información que puede almacenar. Para tareas con contextos muy largos, puede ser insuficiente.
- El modelo está especializado en el benchmark LIBERO; su rendimiento en otros entornos robóticos o tareas generales no está validado.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es una versión muy reciente o experimental. No hay evidencia de validación externa.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/XXXXyu/oxygen-pi05-textual-memory-lora
- Dataset de anotaciones: https://huggingface.co/datasets/xxxxyu/libero-textual-memory-annotations
- Repositorio GitHub de OxyGen: https://github.com/air-embodied-brain/OxyGen
- Perfil del autor: https://xxxxyu.github.io/
