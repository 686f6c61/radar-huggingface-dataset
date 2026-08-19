# StationPC/Qwen3.5-0.8B-RKLLM-RK2588

## Resumen

Este modelo es una conversión del Qwen3.5-0.8B de Alibaba al formato RKLLM, específicamente adaptado para ejecutarse en la NPU del SoC Rockchip RK2588. El autor, StationPC, ha publicado el archivo en HuggingFace con licencia Apache 2.0, aunque la model card está vacía y no se proporcionan detalles adicionales. El modelo base Qwen3.5-0.8B es el más pequeño de la familia Qwen3.5, que Alibaba describe como nativamente multimodal (texto, imagen y vídeo) y con una arquitectura híbrida que combina atención lineal con transformadores tradicionales. Según fuentes externas, este modelo de 0.8B parámetros tiene una ventana de contexto de 262K tokens y está pensado para despliegue en dispositivos con recursos limitados.

La relevancia de esta conversión radica en que permite ejecutar un LLM multimodal en hardware de borde con NPU de Rockchip, un ecosistema que está ganando tracción en aplicaciones de IoT, robótica y dispositivos embebidos. El formato RKLLM es el resultado del toolkit de Rockchip (rknn-llm), que convierte y cuantiza modelos para su ejecución eficiente en sus NPU. Al ser una conversión, las capacidades del modelo original se mantienen en teoría, pero la cuantización y las restricciones de la NPU pueden afectar al rendimiento y a la precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: atención lineal + transformadores (modelo base Qwen3.5) |
| Parametros totales | 0.8B (según el nombre del modelo) |
| Parametros activos | no disponible (no se indica si es MoE; el modelo base es denso) |
| Longitud de contexto | 262K tokens (según fuentes para el modelo Qwen3.5-0.8B original) |
| Tipos de cuantizacion | no disponible (RKLLM soporta cuantización, pero no se especifica el tipo aplicado) |
| Idiomas soportados | no disponible (el modelo base soporta múltiples idiomas, pero no se detalla) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (probablemente .rkllm, pero no se confirma en la información) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B, desarrollado por Alibaba, emplea una arquitectura híbrida que combina mecanismos de atención lineal con bloques transformadores tradicionales. Esta mezcla busca reducir el coste computacional del attention estándar, especialmente en ventanas de contexto largas (262K tokens), manteniendo a la vez la capacidad de modelado de dependencias complejas. Los detalles específicos del entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada.

La conversión a RKLLM, realizada por StationPC, utiliza el RKLLM-Toolkit de Rockchip, que permite transformar modelos entrenados en frameworks como PyTorch o TensorFlow al formato optimizado para NPU. Este proceso suele incluir cuantización (por ejemplo, INT8 o INT4) para reducir el uso de memoria y acelerar la inferencia en hardware de borde. No se especifica qué tipo de cuantización se aplicó ni si se realizaron ajustes adicionales en los pesos.

## Capacidades

- Generación de texto y razonamiento: el modelo base es capaz de mantener conversaciones coherentes y realizar tareas de razonamiento básico, aunque su tamaño reducido limita la complejidad de las tareas.
- Multimodalidad nativa: según el anuncio de Alibaba, el modelo Qwen3.5-0.8B acepta entradas de texto, imagen y vídeo. Sin embargo, la conversión RKLLM puede no conservar todas estas capacidades si la NPU no soporta los operadores necesarios para procesar visión.
- Tool calling / function calling: no se confirma en la información disponible, pero los modelos de la serie Qwen suelen incluir soporte para llamadas a herramientas.
- Capacidades multilingües: el modelo base está entrenado en múltiples idiomas, aunque no se detalla la lista exacta.
- Contexto largo: con 262K tokens de ventana, el modelo puede manejar documentos extensos o conversaciones de muchos turnos, siempre que la memoria de la NPU lo permita.

## Casos de uso

- Asistentes de voz en dispositivos IoT: el modelo puede ejecutarse localmente en un dispositivo con NPU RK2588 para procesar comandos de voz y mantener diálogos sin depender de la nube, reduciendo latencia y preservando privacidad.
- Chatbots de atención al cliente en kioscos interactivos: su tamaño compacto y la capacidad de contexto largo permiten gestionar conversaciones multi-turno con historial amplio, adecuado para entornos con conectividad limitada.
- Análisis de documentos en el borde: gracias a la ventana de 262K tokens, puede resumir o extraer información de contratos, manuales o informes extensos directamente en el dispositivo, sin enviar datos a servidores externos.
- Generación de código en entornos embebidos: aunque el rendimiento en código es débil según las fuentes (el artículo de codersera indica "weak code accuracy"), puede servir para autocompletar fragmentos sencillos o generar scripts de configuración en herramientas de desarrollo integradas en hardware Rockchip.
- Educación y demostraciones: como modelo de bajo coste, es útil para proyectos educativos que enseñan despliegue de LLM en NPU, o para prototipos rápidos de aplicaciones de procesamiento de lenguaje natural en hardware de bajo consumo.
- Automatización de tareas de texto en robótica: un robot con NPU RK2588 puede utilizar el modelo para interpretar instrucciones en lenguaje natural y convertirlas en comandos de control, aprovechando la baja latencia de la inferencia local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta conversión RKLLM en la información disponible. El artículo de codersera menciona que el modelo Qwen3.5-0.8B original tiene "strong recall but weak code accuracy", pero no proporciona cifras concretas. No se dispone de comparativas numéricas con otros modelos en este contexto.

## Requisitos de hardware

- El modelo está diseñado para ejecutarse en la NPU del SoC Rockchip RK2588, un chip orientado a aplicaciones de borde con aceleración de IA.
- No se requiere GPU dedicada; la NPU integrada se encarga de la inferencia.
- La memoria necesaria depende de la cuantización aplicada. Con 0.8B parámetros, un modelo cuantizado a INT8 ocuparía aproximadamente 0.8 GB, mientras que INT4 reduciría el consumo a unos 0.4 GB. Estos valores son estimaciones orientativas, no datos confirmados.
- Para desarrollo y pruebas, el RKLLM-Toolkit se ejecuta en un PC con sistema operativo Linux, y la conversión puede requerir una GPU para acelerar el proceso de cuantización, aunque no es imprescindible.
- Opciones de despliegue: el modelo se integra mediante RKLLM Runtime, que ofrece API en C/C++ para aplicaciones embebidas. No es compatible directamente con vLLM, Ollama o llama.cpp, ya que estos están pensados para GPU o CPU, aunque el modelo original sí puede ejecutarse con esas herramientas.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa fiable con otros modelos convertidos a RKLLM o con modelos de tamaño similar en el mismo ecosistema. El modelo original Qwen3.5-0.8B podría compararse con otras variantes pequeñas como Qwen3-0.6B o Phi-3-mini, pero no hay datos de rendimiento para esta conversión específica.

## Limitaciones y advertencias

- La model card en HuggingFace está vacía; no hay documentación oficial del autor sobre el proceso de conversión, la cuantización aplicada ni las capacidades exactas conservadas.
- Al ser una conversión a formato RKLLM, es posible que algunas funcionalidades del modelo original (especialmente las multimodales) no estén disponibles si la NPU no soporta los operadores necesarios.
- La cuantización puede provocar una pérdida de precisión en tareas de razonamiento complejo o generación de código, como ya se observa en el modelo base (debilidad en código).
- El modelo está pensado exclusivamente para hardware Rockchip con NPU RK2588; no es portable a otras plataformas sin reconvertirlo.
- No hay garantías de soporte comercial ni mantenimiento por parte del autor, al ser una publicación independiente con 0 descargas y 0 likes.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar que el modelo base de Alibaba no tenga restricciones adicionales, aunque la familia Qwen3.5 se distribuye bajo esta misma licencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StationPC/Qwen3.5-0.8B-RKLLM-RK2588
- Repositorio RKLLM de Rockchip: https://github.com/airockchip/rknn-llm
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Artículo sobre Qwen3.5 0.8B: https://codersera.com/blog/run-and-benchmark-qwen35-08b/
- Repositorio de Qwen3 (serie anterior): https://github.com/QwenLM/Qwen3
