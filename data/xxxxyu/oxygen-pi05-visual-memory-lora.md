# XXXXyu/oxygen-pi05-visual-memory-lora

## Resumen

OxyGen pi0.5 visual-memory suffix LoRA es un adaptador de bajo rango (rank-16) desarrollado por XXXXyu (Xiangyu Li, investigador del AIR de la Universidad de Tsinghua) sobre el modelo base pi0.5 de openpi, un modelo de visión-lenguaje-acción (VLA) de la familia π₀. Este adaptador se integra en el sistema OxyGen, un gestor unificado de caché KV para inferencia de VLAs, y añade una memoria visual explícita mediante un sufijo autoregresivo con la semilla `Memory: `.

El problema que resuelve es el de dotar a los modelos VLA de capacidad de memoria a largo plazo para tareas robóticas con dependencias temporales, sin modificar el modelo base congelado. El adaptador actúa solo sobre la parte lingüística del sufijo, dejando intacta la caché KV raíz, lo que permite un overhead mínimo (8,16 ms) y un forward compartido de prefijo de 47,66 ms. La relevancia actual reside en la necesidad de sistemas robóticos que puedan recordar observaciones previas para tareas de largo horizonte, manteniendo la eficiencia de inferencia en tiempo real.

La arquitectura se basa en el modelo base pi0.5, un VLA de flujo (flow-based) con tokenizador de acción FAST, que se usa congelado. El adaptador LoRA se entrena para predecir el sufijo `Memory: ` a partir de las representaciones de observación, estado del robot e instrucción, logrando una precisión de tokens fuera de conjunto de 98,15% y una coincidencia exacta greedy del 87,25% en el conjunto LIBERO.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo base pi0.5 (VLA de flujo) |
| Parametros totales | No disponible (LoRA rank 16, repo de 0.1 GB) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No especificada para el modelo base; sufijo de memoria de 28 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0-and-gemma-terms (Apache 2.0 para OxyGen/openpi, términos Gemma para componentes) |
| Formato de pesos | No disponible (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El adaptador se construye sobre el checkpoint `pi05_libero` de openpi, un modelo VLA basado en flujo (flow matching) con tokenizador de acción FAST. La observación visual, el estado del robot y la instrucción de tarea se codifican con el modelo base congelado. El LoRA, de rango 16, se habilita específicamente para la semilla `Memory: ` y el sufijo lingüístico autoregresivo. La arquitectura mantiene intacta la caché KV raíz; el adaptador solo interviene en la generación del sufijo de memoria, lo que garantiza que las acciones no se vean alteradas (diferencia máxima absoluta de 0 en la caché y las acciones).

El entrenamiento se ha realizado sobre el dataset LIBERO con anotaciones derivadas disponibles en un dataset público de Hugging Face. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO. El repositorio de OxyGen documenta el proceso de entrenamiento, evaluación, batching continuo y el baseline bloqueante de openpi.

## Capacidades

- Generación de sufijos de memoria visual a partir de observaciones y estado del robot, permitiendo que el modelo recuerde eventos anteriores en tareas de largo horizonte.
- Soporte de tareas robóticas de manipulación y navegación en el benchmark LIBERO (LIBERO Spatial, LIBERO Object, LIBERO Goal).
- Integración con el sistema OxyGen para gestión unificada de caché KV en inferencia multi-tarea, con batching continuo.
- Compatible con el modelo base pi0.5, que ofrece capacidades de visión-lenguaje-acción en general (manipulación, seguimiento de instrucciones).
- El adaptador no altera las acciones del modelo base, por lo que es seguro para uso en sistemas donde se requiera preservar el comportamiento original.
- Soporte de inferencia eficiente con overhead bajo (8.16 ms) y latencia de prefijo compartido de 47.66 ms.

## Casos de uso

- Manipulación robótica de largo plazo: en tareas donde el robot debe recordar la posición de objetos observados previamente, el sufijo `Memory: ` permite almacenar y recuperar esa información visual sin modificar el modelo base.
- Sistemas de control en tiempo real: con un overhead de 8.16 ms, puede integrarse en pipelines de control de robots con requisitos de latencia estrictos, como brazos colaborativos en línea de montaje.
- Aprendizaje por demostración: el adaptador puede usarse para añadir memoria a modelos de imitación, permitiendo que el robot recuerde secuencias de acciones previas.
- Investigación en VLA: como herramienta de evaluación para estudiar el efecto de la memoria visual en tareas de largo horizonte, utilizando el benchmark LIBERO.
- Despliegue en entornos con recursos limitados: al ser un adaptador ligero (0.1 GB), puede cargarse en GPUs de consumo o incluso en sistemas edge con suficiente VRAM para el modelo base.
- Integración en frameworks de robótica de código abierto: dado que es compatible con openpi y OxyGen, puede incorporarse a sistemas de investigación y prototipado sin necesidad de reentrenar el modelo base.

## Benchmarks y rendimiento

Los datos de rendimiento proporcionados por el autor se centran en la calidad del sufijo de memoria y la eficiencia del adaptador:

| Métrica | Valor |
|---|---|
| Precisión de tokens fuera de conjunto | 98,15 % |
| Coincidencia exacta (greedy) | 87,25 % |
| F1 de palabras (greedy) | 90,01 % |
| Diferencia máxima absoluta en caché/acción | 0 |
| Overhead del adaptador | 8,16 ms |
| Tiempo de prefijo compartido | 47,66 ms |

No se han publicado resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) porque el modelo está orientado a robótica y no a tareas de lenguaje general. No se dispone de comparaciones con otros adaptadores de memoria para VLA en la información proporcionada.

## Requisitos de hardware

- El adaptador LoRA ocupa 0.1 GB en disco, por lo que el requisito de almacenamiento es mínimo.
- La VRAM necesaria depende del modelo base pi0.5, que no se incluye en el repositorio. No se ha especificado el tamaño de los parámetros del modelo base en la información disponible.
- El adaptador puede ejecutarse en cualquier GPU que soporte el modelo base; se recomienda una GPU con al menos 8 GB de VRAM para el modelo pi0.5 en cuantización FP16 (estimación basada en el tamaño típico de los modelos VLA de esta familia, no confirmada).
- El despliegue se realiza a través de OxyGen y openpi, que soportan inferencia con vLLM o TensorRT, aunque no se detallan configuraciones específicas.
- La latencia medida (47.66 ms para el prefijo) sugiere que es viable para control en tiempo real con una GPU moderna de gama media (RTX 3060 o superior), siempre que el modelo base quepa en memoria.

## Comparativa con modelos similares

No se dispone de información sobre otros adaptadores de memoria para VLA que puedan compararse directamente. Los modelos VLA base (pi0, pi0-FAST, pi0.5) son los que se comparan en la documentación de openpi, pero el adaptador es un complemento específico. Por tanto, la comparativa se limita a la alternativa de usar el modelo base sin memoria adicional:

| Modelo | Parámetros | Contexto | Memoria | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi0.5 base | No disponible | No disponible | Sin memoria | Apache 2.0 + Gemma terms | Hugging Face |
| pi0.5 + LoRA (este) | LoRA rank 16 | Sufijo de 28 tokens | Sí | Apache 2.0 + Gemma terms | Hugging Face |

La principal ventaja del adaptador es el bajo coste de integración y la preservación de las acciones originales, mientras que el modelo base no tiene capacidad de memoria explícita.

## Limitaciones y advertencias

- El adaptador está entrenado específicamente para el benchmark LIBERO y la semilla `Memory: `. Su generalización a otros dominios o tareas no está probada.
- La longitud máxima del sufijo de memoria es de 28 tokens, lo que limita la cantidad de información visual que puede almacenarse en cada paso.
- No se han evaluado sesgos o riesgos de alucinación en la generación de acciones; el modelo podría producir sufijos incorrectos que no se correspondan con la realidad observada.
- La licencia es mixta: el código de OxyGen/openpi es Apache 2.0, pero los componentes de Gemma (incluidos el modelo base) están sujetos a los términos de Gemma, que pueden imponer restricciones de uso comercial.
- El repositorio no incluye el modelo base, por lo que el adaptador solo funciona si se descarga previamente el checkpoint desde Google Cloud Storage.
- No se han documentado sesgos de los datos de entrenamiento, pero el dataset LIBERO está compuesto por simulaciones y puede no representar todas las condiciones reales.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/XXXXyu/oxygen-pi05-visual-memory-lora
- Dataset de anotaciones: https://huggingface.co/datasets/xxxxyu/libero-visual-memory-annotations
- Repositorio de openpi (incluye pi0.5): https://github.com/ldddddddl/pi05
- Página personal del autor: https://xxxxyu.github.io/
- GitHub del autor con OxyGen y Vec-LUT: https://github.com/xxxxyu/xxxxyu
