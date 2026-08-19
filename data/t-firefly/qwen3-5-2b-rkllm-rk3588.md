# t-firefly/qwen3.5-2b-rkllm-rk3588

## Resumen

El modelo `t-firefly/qwen3.5-2b-rkllm-rk3588` es una conversión del modelo multimodal Qwen3.5-2B, desarrollado por el equipo de Qwen, adaptada por Firefly AI Team para ejecutarse en el sistema en chip Rockchip RK3588 mediante el runtime RKLLM. Esta adaptación permite desplegar un modelo de lenguaje y visión de 2 mil millones de parámetros en hardware de bajo consumo orientado a aplicaciones de edge computing, como placas de desarrollo y dispositivos embebidos.

El modelo original Qwen3.5-2B unifica comprensión de texto e imagen en un único modelo, con capacidades de razonamiento, generación de código, uso de agentes y tareas visuales. La conversión realizada por Firefly AI Team empaqueta el modelo en el formato RKLLM, optimizado para la NPU del RK3588, y lo integra con la herramienta de despliegue LlamaPi, que simplifica la descarga, carga y ejecución del modelo en el dispositivo. Su licencia Apache 2.0 permite uso comercial y modificación sin restricciones significativas.

La relevancia de este modelo radica en la creciente demanda de IA generativa en dispositivos periféricos, donde la privacidad, la latencia y el consumo energético son críticos. Al estar específicamente adaptado para el RK3588, ofrece una vía práctica para ejecutar un asistente multimodal local sin depender de la nube, con un coste de hardware reducido en comparación con estaciones de trabajo con GPU.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) |
| Parametros totales | 2 mil millones (inferido del nombre, no confirmado oficialmente) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no especificado (presumiblemente cuantización RKLLM, formato propietario) |
| Idiomas soportados | 201 idiomas y dialectos (según el modelo original) |
| Licencia | Apache 2.0 |
| Formato de pesos | RKLLM (formato propietario de Rockchip para NPU) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-2B es un modelo multimodal compacto de la familia Qwen3.5 que combina un codificador visual con un decodificador de lenguaje, permitiendo procesar entradas de imagen y texto de forma conjunta. No se dispone de detalles específicos sobre la arquitectura interna (número de capas, dimensiones de atención, etc.) en la información proporcionada.

La conversión realizada por Firefly AI Team utiliza el RKLLM-Toolkit, un conjunto de herramientas que permite transformar modelos en formato Hugging Face al formato RKLLM, optimizado para la NPU del RK3588. Este proceso incluye cuantización (presumiblemente a 4 u 8 bits) para reducir el tamaño del modelo y adaptarlo a las limitaciones de memoria del hardware. No se han publicado detalles sobre el dataset de entrenamiento del modelo original ni sobre el proceso de alineación (RLHF, DPO, etc.).

## Capacidades

- Generación de texto y comprensión de lenguaje natural en 201 idiomas y dialectos.
- Razonamiento multi-step y resolución de problemas lógicos.
- Generación de código en diversos lenguajes de programación.
- Comprensión visual: el modelo acepta imágenes como entrada y puede responder preguntas sobre su contenido, describir escenas o extraer información.
- Capacidad de uso como agente, con soporte para tool calling y ejecución de acciones (según las capacidades del modelo original).
- Soporte de conversación multi-turno y mantenimiento de contexto.

## Casos de uso

- Asistentes de voz locales en dispositivos embebidos: el modelo puede ejecutarse en un RK3588 integrado en un altavoz inteligente o un quiosco interactivo, procesando consultas de voz (con un motor de reconocimiento de voz externo) y respondiendo sin conexión a internet.
- Análisis de imágenes en entornos industriales: una cámara conectada al RK3588 puede capturar imágenes de productos en una línea de montaje y el modelo puede detectar defectos o leer etiquetas, gracias a su capacidad multimodal.
- Asistente de documentación técnica: integrado en una placa de desarrollo, el modelo puede responder preguntas sobre manuales o guías de usuario, ayudando a técnicos en campo sin necesidad de acceso a la nube.
- Generación de código en entornos de desarrollo embebido: el modelo puede sugerir fragmentos de código para microcontroladores o placas, ejecutándose en el propio dispositivo de desarrollo.
- Traducción automática en tiempo real: con soporte para 201 idiomas, puede traducir conversaciones o textos en aplicaciones de viajes o atención al cliente en dispositivos portátiles.
- Prototipado de aplicaciones de IA en hardware de bajo coste: investigadores y desarrolladores pueden utilizar este modelo para validar conceptos de IA generativa en plataformas como el iCore-3588Q o el ROC-RK3576-PC, antes de escalar a hardware más potente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre rendimiento en tareas estándar como MMLU, HumanEval o GSM8K para esta conversión específica, ni comparaciones con otros modelos en el mismo hardware.

## Requisitos de hardware

- Plataforma objetivo: Rockchip RK3588, que integra una NPU de 6 TOPS de rendimiento.
- Memoria: el modelo ocupa aproximadamente 3.7 GB en disco; se recomienda una placa con al menos 8 GB de RAM para cargar el modelo y dejar espacio para el sistema operativo y otras aplicaciones.
- GPU: no aplica, la inferencia se ejecuta en la NPU del RK3588, no en una GPU.
- Despliegue: se utiliza la herramienta LlamaPi, que gestiona la descarga, carga y ejecución del modelo. También es posible usar el RKLLM Runtime directamente mediante interfaces C/C++.
- Latencia y throughput: no se han proporcionado cifras específicas para este modelo en el RK3588.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos convertidos al formato RKLLM para el RK3588 con características comparables. El modelo original Qwen3.5-2B puede compararse con otros modelos multimodales pequeños como LLaVA-1.5-7B o Phi-3-vision, pero no existen datos de rendimiento en esta conversión específica para establecer una comparación cuantitativa. Se recomienda consultar benchmarks del modelo original en Hugging Face para una referencia de capacidades.

## Limitaciones y advertencias

- La conversión a formato RKLLM puede introducir pérdida de precisión debido a la cuantización, lo que podría afectar a tareas que requieren alta exactitud, como matemáticas avanzadas o razonamiento complejo.
- No se han publicado evaluaciones de sesgos o alucinaciones específicas para esta conversión; el modelo original puede presentar sesgos inherentes a sus datos de entrenamiento.
- La longitud de contexto no está documentada; es posible que la ventana de contexto sea limitada en comparación con modelos más grandes, lo que restringe el manejo de conversaciones muy largas o documentos extensos.
- El formato RKLLM es propietario de Rockchip, por lo que el modelo solo puede ejecutarse en plataformas que soporten este runtime (RK3588 y otras NPU de Rockchip), limitando su portabilidad a otros hardware.
- Aunque la licencia Apache 2.0 permite uso comercial, es responsabilidad del usuario verificar el cumplimiento de la licencia del modelo original (Qwen3.5-2B) y de las herramientas de conversión utilizadas.

## Enlaces

- [Hugging Face - t-firefly/qwen3.5-2b-rkllm-rk3588](https://huggingface.co/t-firefly/qwen3.5-2b-rkllm-rk3588)
- [Modelo original - Qwen/Qwen3.5-2B](https://huggingface.co/Qwen/Qwen3.5-2B)
- [Firefly Wiki - Despliegue de LLM en RK3588](https://wiki.t-firefly.com/en/iCore-3588Q/usage_rkllm.html)
- [Firefly Wiki - RKLLM-Toolkit](https://wiki.t-firefly.com/en/ROC-RK3576-PC/usage_rkllm.html)
- [GitHub - airockchip/rknn-llm](https://github.com/airockchip/rknn-llm)
- [Documentación de LlamaPi](https://community.t-firefly.com/docs/ai/applications/LlamaPi/llamapi)
