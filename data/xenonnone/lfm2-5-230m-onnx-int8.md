# XENONNONE/LFM2.5-230M-ONNX-INT8

## Resumen

El modelo `XENONNONE/LFM2.5-230M-ONNX-INT8` es una exportación en formato ONNX del modelo LFM2.5-230M desarrollado por Liquid AI, una compañía especializada en arquitecturas eficientes para inferencia en el borde. La versión original de Liquid AI se ha convertido a ONNX para facilitar su despliegue multiplataforma, y este repositorio concreto añade una cuantización INT8 adicional, pensada para reducir aún más el tamaño y la latencia en entornos con recursos limitados.

LFM2.5 es un modelo de lenguaje de 230 millones de parámetros con una arquitectura híbrida que combina puertas multiplicativas y convoluciones cortas, optimizada para ejecutarse de forma rápida en CPU, GPU y NPU. Esta variante ONNX INT8 está orientada a aplicaciones en el borde, como asistentes conversacionales en dispositivos móviles, navegadores con WebGPU o sistemas embebidos. La licencia es `lfm1.0`, que permite uso comercial aunque con condiciones específicas no detalladas en la información disponible.

La relevancia de este modelo radica en su tamaño reducido y su formato interoperable, lo que lo convierte en una opción práctica para proyectos que necesitan inferencia local sin depender de servidores en la nube. La ventana de contexto no se ha publicado en la información proporcionada, lo que limita la evaluación de su capacidad para manejar conversaciones largas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2.5 (híbrida con puertas multiplicativas y convoluciones cortas) |
| Parametros totales | 230 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (según el nombre del repo); la model card del modelo base también lista Q4, Q4F32, FP16 y Q8 |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es, pt, it (10 idiomas) |
| Licencia | lfm1.0 (otra, no especificada en detalle) |
| Formato de pesos | ONNX (archivos `.onnx` y `.onnx_data`) |

## Arquitectura y entrenamiento

La arquitectura de LFM2.5 es híbrida, combinando capas con puertas multiplicativas (multiplicative gates) y convoluciones de corto alcance (short convolutions). Este diseño busca reducir el coste computacional frente a los transformers clásicos, manteniendo una capacidad de modelado adecuada para tareas de generación de texto. La card del modelo original indica que está optimizado para despliegue en el borde con inferencia rápida en CPU, GPU y NPU, aunque no se proporcionan detalles sobre el número de capas, la dimensión del modelo ni la configuración exacta de la arquitectura.

En cuanto al entrenamiento, no se ha publicado información sobre el número de tokens, la composición del dataset ni si se aplicaron técnicas de ajuste como RLHF o DPO. La card del modelo original no incluye estos datos. La exportación a ONNX y la cuantización INT8 no afectan al entrenamiento, sino que son pasos posteriores para optimizar la inferencia. La cuantización INT8 se aplica a los pesos, reduciendo su precisión de 32 bits a 8 bits, lo que disminuye el tamaño del modelo y la carga de memoria, aunque puede introducir una pequeña pérdida de calidad.

## Capacidades

- Generación de texto conversacional: el modelo está diseñado para tareas de text-generation, por lo que puede producir respuestas coherentes en conversaciones de varios turnos.
- Soporte multilingüe: cubre 10 idiomas (inglés, árabe, chino, francés, alemán, japonés, coreano, español, portugués e italiano).
- Inferencia eficiente en CPU, GPU y NPU gracias a la arquitectura híbrida y la cuantización INT8.
- Compatibilidad con WebGPU: la card indica que las variantes Q4 y FP16 son compatibles con WebGPU, lo que permite ejecutar el modelo en navegadores usando Transformers.js.
- No se menciona soporte para tool calling, function calling ni capacidades de agente.
- No se indica modo de razonamiento explícito (thinking mode) ni capacidades de visión o audio.

## Casos de uso

- Asistentes conversacionales en dispositivos móviles: el tamaño reducido (230M) y la cuantización INT8 permiten ejecutar el modelo localmente en un smartphone con un consumo de memoria moderado, ofreciendo respuestas sin depender de una conexión a internet.
- Chatbots en el navegador: gracias a la compatibilidad con WebGPU y Transformers.js, se puede integrar en aplicaciones web para generar texto directamente en el cliente, evitando la latencia de un servidor externo.
- Generación de texto en tiempo real en aplicaciones de escritorio: la baja latencia de la arquitectura híbrida lo hace adecuado para herramientas de autocompletado, redacción asistida o sugerencias en editores de código.
- Traducción automática ligera: al soportar 10 idiomas, puede utilizarse en sistemas de traducción básica en entornos con recursos limitados, aunque no se especifica la calidad de la traducción.
- Prototipado rápido de aplicaciones de IA: al ser un modelo pequeño y en formato ONNX, es fácil de integrar en pipelines de desarrollo para pruebas y validación de conceptos.
- Sistemas de respuesta automática en atención al cliente: puede gestionar consultas simples en varios idiomas, reduciendo la carga sobre agentes humanos, siempre que el contexto no sea demasiado extenso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La card del modelo original no incluye métricas como MMLU, HumanEval o GSM8K, y no se han encontrado datos de rendimiento en el repositorio de esta variante INT8. Por tanto, no es posible comparar cuantitativamente este modelo con otros de su misma categoría.

## Requisitos de hardware

- Tamaño del modelo: los archivos ONNX de la card original varían entre ~200 MB (Q4) y ~470 MB (Q8). La variante INT8 de este repositorio tendrá un tamaño similar, probablemente en el rango de 200-300 MB, aunque no se ha especificado exactamente.
- VRAM estimada: con una cuantización INT8, el modelo puede ocupar menos de 1 GB en memoria. Es viable en GPUs con al menos 1 GB de VRAM, como GTX 1650, RTX 3050 o incluso integradas con memoria compartida.
- CPU: puede ejecutarse en CPU con ONNX Runtime, sin necesidad de GPU. La inferencia será más lenta que en GPU, pero es viable para aplicaciones no en tiempo real.
- Opciones de despliegue: ONNX Runtime (CPU y GPU), Transformers.js para WebGPU, y potencialmente otros motores ONNX.
- Latencia y throughput: no se proporcionan datos específicos. Al ser un modelo de 230M, se espera una latencia baja, pero no hay mediciones oficiales.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de la misma categoría (por ejemplo, TinyLlama-1.1B, Phi-2 o modelos de menor tamaño). No se han publicado comparaciones de rendimiento ni de características técnicas frente a alternativas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos, pero como modelo de lenguaje entrenado con datos no públicos, podría heredar sesgos presentes en el corpus de entrenamiento.
- Riesgo de alucinación: inherente a todos los modelos de lenguaje, puede generar información incorrecta o inventada, especialmente en contextos largos o ambiguos.
- Limitaciones de contexto: la longitud máxima de contexto no se ha publicado, lo que limita el uso en conversaciones extensas o documentos largos.
- Limitaciones de idioma: aunque soporta 10 idiomas, la calidad de generación en idiomas minoritarios o con menos datos puede ser inferior.
- Restricciones de licencia: la licencia `lfm1.0` no está detallada en la información disponible. Se recomienda revisar el archivo `LICENSE` del repositorio original antes de un uso comercial.
- Cuantización INT8: la conversión a INT8 puede degradar ligeramente la calidad de las respuestas en comparación con la versión FP16, aunque no se han cuantificado las diferencias.

## Enlaces

- Repositorio del modelo: https://huggingface.co/XENONNONE/LFM2.5-230M-ONNX-INT8
- Modelo base (LiquidAI/LFM2.5-230M): https://huggingface.co/LiquidAI/LFM2.5-230M
- Playground de Liquid AI: https://playground.liquid.ai/
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- LEAP (herramienta de Liquid AI): https://leap.liquid.ai/
- Discord de Liquid AI: https://discord.com/invite/liquid-ai
