# t-firefly/qwen3.5-4b-rkllm-rk3588

## Resumen

Este repositorio contiene una conversión del modelo multimodal Qwen3.5-4B, desarrollado originalmente por el equipo Qwen, adaptada por el equipo Firefly AI para ejecutarse en el sistema en chip (SoC) Rockchip RK3588. El modelo se distribuye en formato RKLLM, el formato nativo del kit de herramientas de Rockchip para despliegue de modelos de lenguaje en sus NPU, y está pensado para su uso con la herramienta LlamaPi, que simplifica la descarga, carga y ejecución en la placa.

La relevancia de esta conversión radica en que permite ejecutar un modelo multimodal de 4.000 millones de parámetros en hardware de bajo consumo y bajo coste, típico de dispositivos de borde como placas de desarrollo, routers inteligentes o sistemas de visión integrados. El modelo original unifica comprensión de texto e imagen, soporta razonamiento, generación de código, tareas de agente y 201 idiomas y dialectos, lo que lo convierte en una opción atractiva para aplicaciones de IA en el borde sin depender de la nube.

El repositorio tiene un tamaño de 6,3 GB, lo que sugiere que los pesos están cuantizados para caber en la memoria del RK3588, aunque no se especifica el tipo de cuantización. La licencia es Apache 2.0, lo que permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal basado en Qwen3.5-4B) |
| Parametros totales | no disponible (se infiere 4.000 millones por el nombre, pero no se confirma) |
| Parametros activos | no aplicable (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el formato RKLLM suele usar cuantizacion INT4/INT8, pero no se especifica) |
| Idiomas soportados | 201 idiomas y dialectos (segun la model card del modelo original) |
| Licencia | Apache 2.0 |
| Formato de pesos | RKLLM (formato propietario de Rockchip, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

No se proporcionan detalles sobre la arquitectura interna del modelo en la informacion disponible. Se sabe que es una conversion del modelo Qwen3.5-4B, que segun la model card es un modelo multimodal de tipo image-text-to-text, lo que implica una arquitectura de transformer con un codificador visual y un decodificador de lenguaje. El equipo Firefly AI ha adaptado los pesos originales al formato RKLLM para su ejecucion en la NPU del RK3588.

No se dispone de informacion sobre el proceso de entrenamiento del modelo original, como el numero de tokens de entrenamiento, la composicion del dataset o si se aplicaron tecnicas de RLHF o DPO. Tampoco se detalla el proceso de conversion (cuantizacion, calibracion, etc.) realizado por Firefly AI. La unica innovacion tecnica destacable es la adaptacion al formato RKLLM, que permite aprovechar la NPU del RK3588 para acelerar la inferencia.

## Capacidades

- Comprension multimodal: procesa entradas de texto e imagen de forma unificada, lo que permite tareas de descripcion de imagenes, respuesta a preguntas visuales y razonamiento sobre contenido visual.
- Razonamiento y generacion de texto: soporta tareas de razonamiento logico, analisis y generacion de respuestas coherentes en lenguaje natural.
- Generacion de codigo: puede escribir, completar y depurar codigo en diversos lenguajes de programacion.
- Tareas de agente: segun la model card, soporta tareas de agente, lo que sugiere capacidad de planificacion y ejecucion de acciones en entornos simulados o reales.
- Multilingue: soporta 201 idiomas y dialectos, lo que lo hace util para aplicaciones internacionales.
- Despliegue en borde: optimizado para ejecutarse en el SoC RK3588 mediante la herramienta LlamaPi, lo que permite inferencia local sin conexion a internet.

## Casos de uso

- Asistente virtual local en un dispositivo de borde: el modelo puede ejecutarse en una placa RK3588 para proporcionar un asistente por voz o texto que funcione sin conexion, respondiendo preguntas, gestionando tareas y manteniendo conversaciones multi-turno. Su capacidad multilingue lo hace adecuado para entornos con multiples idiomas.
- Analisis de imagenes en sistemas de vigilancia: gracias a su capacidad multimodal, puede procesar frames de camaras para detectar objetos, describir escenas o responder a consultas sobre el contenido visual en tiempo real, sin enviar datos a la nube.
- Generacion de codigo en entornos de desarrollo integrados: un desarrollador puede usar el modelo en una placa RK3588 como asistente de programacion offline, generando fragmentos de codigo, explicando funciones o depurando errores en el propio dispositivo.
- Educacion y formacion: en entornos educativos con recursos limitados, el modelo puede actuar como tutor virtual que responde preguntas, explica conceptos y genera ejercicios personalizados, aprovechando su soporte multilingue.
- Automatizacion de tareas de oficina: el modelo puede resumir documentos, extraer informacion de imagenes escaneadas o transcribir notas manuscritas, funcionando en un dispositivo local para preservar la privacidad de los datos.
- Prototipado rapido de aplicaciones de IA en hardware embebido: los desarrolladores pueden utilizar LlamaPi para desplegar el modelo en una placa RK3588 y evaluar rapidamente su rendimiento en casos de uso especificos antes de escalar a hardware mas potente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas como MMLU, HumanEval, GSM8K o benchmarks especificos de tareas visuales para esta conversion. Tampoco se indican datos de latencia o throughput en la placa RK3588. Para obtener mediciones reales, seria necesario ejecutar el modelo en el hardware objetivo con la herramienta LlamaPi y medir el rendimiento en funcion del caso de uso.

## Requisitos de hardware

- El modelo esta disenado para el SoC Rockchip RK3588, que integra una CPU ARM de 8 nucleos, una GPU Mali-G610 y una NPU con hasta 6 TOPS de rendimiento.
- La memoria RAM del RK3588 suele ser de 8 GB o 16 GB en la mayoria de placas de desarrollo; el modelo, con un tamano de repo de 6,3 GB, probablemente requiere al menos 8 GB de RAM para cargar los pesos y el contexto de inferencia.
- No se requiere GPU externa; la inferencia se acelera mediante la NPU del SoC, aunque tambien puede ejecutarse en CPU si la NPU no esta disponible o no es compatible con el modelo.
- El despliegue se realiza mediante la herramienta LlamaPi, que gestiona la descarga, carga y ejecucion del modelo. Tambien se puede usar el kit RKLLM de Rockchip para conversion y despliegue manual.
- No se proporcionan datos de latencia o throughput. En general, un modelo de 4B cuantizado en una NPU de 6 TOPS puede alcanzar decenas de tokens por segundo, pero depende de la cuantizacion y de la optimizacion del runtime.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa rigurosa con otros modelos convertidos para RK3588. El modelo base Qwen3.5-4B se puede comparar con otros modelos de tamano similar como Llama 3.2 3B o Phi-3.5-mini, pero no se tienen datos de rendimiento de esta conversion especifica. Ademas, el formato RKLLM es exclusivo de Rockchip, por lo que la comparacion directa con modelos en otros formatos (safetensors, GGUF) no es significativa sin mediciones en el mismo hardware. Se recomienda consultar la documentacion de LlamaPi y el wiki de Firefly para ver ejemplos de despliegue de otros modelos en RK3588.

## Limitaciones y advertencias

- La conversion al formato RKLLM puede introducir perdidas de precision debido a la cuantizacion, lo que podria afectar a la calidad de las respuestas en tareas complejas de razonamiento o generacion de codigo.
- El modelo esta optimizado para el RK3588; ejecutarlo en otras plataformas requeriria una reconversion al formato adecuado, lo que no esta cubierto por este repositorio.
- No se proporcionan datos de rendimiento ni benchmarks, por lo que es necesario validar el modelo en el caso de uso concreto antes de desplegarlo en produccion.
- La model card del modelo original advierte de posibles sesgos en los datos de entrenamiento, aunque no se detallan en esta conversion. Se recomienda evaluar el comportamiento del modelo en escenarios sensibles.
- El modelo puede alucinar (generar informacion falsa o no verificada) especialmente en tareas de razonamiento o cuando se le piden datos especificos. Es recomendable implementar mecanismos de verificacion en aplicaciones criticas.
- La licencia Apache 2.0 permite uso comercial, pero los derechos de autor del modelo original pertenecen al equipo Qwen; se debe mantener la atribucion correspondiente.
- El tamaño del repositorio (6,3 GB) puede superar la memoria disponible en placas con 8 GB de RAM si se incluye el contexto de inferencia; es necesario comprobar los requisitos de memoria con LlamaPi antes del despliegue.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/t-firefly/qwen3.5-4b-rkllm-rk3588
- Modelo original Qwen3.5-4B en Hugging Face: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo original Qwen3.5-4B en ModelScope: https://modelscope.cn/models/Qwen/Qwen3.5-4B
- Documentacion de LlamaPi (Firefly Wiki): https://community.t-firefly.com/docs/ai/applications/LlamaPi/llamapi
- Wiki de Firefly sobre despliegue de LLM en RK3588: https://wiki.t-firefly.com/en/AIBOX-3588/usage_llm_rockchip.html
- Articulo de blog sobre despliegue de Qwen3.5 en RK3588 (en chino): https://blog.csdn.net/fox0329/article/details/160223777
- Repositorio oficial de la serie Qwen3.5 en GitHub: https://github.com/QwenLM/Qwen3.8
