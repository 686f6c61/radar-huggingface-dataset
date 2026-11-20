# UGREENDEV/RK182X-VLM-SmolVLM2-500M-Video-Instruct

## Resumen

RK182X-VLM-SmolVLM2-500M-Video-Instruct es una conversión al formato RKNN del modelo SmolVLM2-500M-Video-Instruct de Hugging Face, publicada por UGREENDEV. Se trata de un modelo de visión-lenguaje (VLM) de tipo image-text-to-text, es decir, acepta imágenes (y potencialmente vídeo, dado el nombre del modelo base) junto con instrucciones en lenguaje natural y genera texto. El modelo original, desarrollado por Hugging Face, emplea una arquitectura transformer compacta de aproximadamente 500 millones de parámetros, pensada para ejecución en dispositivos con recursos limitados.

La relevancia de esta ficha radica en que el artefacto publicado no es un modelo entrenado desde cero, sino un derivado cuantizado y empaquetado para los aceleradores NPU Rockchip RK1820 y RK1828. Esto lo orienta a despliegues en hardware embebido y de borde (edge), no a servidores GPU convencionales. La versión disponible usa cuantización w4a16 tanto en la torre de visión como en el LLM, resolución de visión de 512x512, 8 núcleos NPU asignados a cada componente y una longitud de contexto de 8192 tokens para el LLM, con KVCache en fp16.

El repositorio tiene un tamaño de 0,4 GB, licencia Apache 2.0 y se distribuye bajo el runtime RKNN v1.1.0. No se han publicado datos de benchmarks ni información sobre idiomas soportados en la documentación disponible. La model card está redactada en inglés y chino, e incluye instrucciones de descarga desde Hugging Face y ModelScope, verificación de checksums SHA-256 y advertencias de compatibilidad con el runtime y driver de Rockchip.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (VLM: torre de visión + LLM), convertido a RKNN |
| Parámetros totales | 500M (según nombre del modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (LLM) |
| Tipos de cuantización | w4a16 (visión y LLM) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | RKNN (runtime v1.1.0); repo de 0,4 GB |
| Resolución de visión | 512x512 |
| Núcleos NPU | Visión: 8; LLM: 8 |
| KVCache | fp16 |
| Chips soportados | RK1820, RK1828 |
| Runtime | RKNN Runtime v1.1.0 |

## Arquitectura y entrenamiento

El modelo subyacente es SmolVLM2-500M-Video-Instruct, un VLM de Hugging Face que combina una torre de visión con un modelo de lenguaje compacto para tareas de image-text-to-text, incluyendo comprensión de vídeo según su denominación. La información proporcionada no detalla la composición exacta de la arquitectura interna (tipo de encoder visual, número de capas, mecanismo de atención), ni los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO). Estos datos deben consultarse en la model card del modelo base.

La contribución de este repositorio es la conversión y cuantización a RKNN para los chips Rockchip RK1820 y RK1828, con cuantización w4a16 en ambos componentes, resolución de visión fija de 512x512 y 8 núcleos NPU por componente. El paquete incluye checksums SHA-256 para verificar la integridad de los ficheros antes del despliegue. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) en la información disponible.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text), incluyendo descripción, respuesta a preguntas visuales y razonamiento sobre el contenido de la imagen.
- Procesamiento de vídeo, según la denominación del modelo base (Video-Instruct); no se detalla en la información disponible el número de frames ni la resolución temporal soportada.
- Conversación multi-turno (tag conversational en el repositorio).
- Compatibilidad con endpoints (tag endpoints_compatible).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Inspección visual en dispositivos de borde: el modelo puede desplegarse en placas con NPU RK1820/RK1828 para describir o responder preguntas sobre imágenes capturadas por una cámara, gracias a su tamaño de 500M y cuantización w4a16 que reducen los requisitos de memoria.
- Asistencia a personas con discapacidad visual en hardware embebido: un dispositivo portátil con NPU Rockchip podría usar el modelo para narrar el contenido de imágenes en tiempo real, con contexto de 8192 tokens para mantener una conversación.
- Automatización de documentación fotográfica: clasificación y descripción de imágenes en flujos de trabajo industriales o logísticos ejecutados localmente, sin depender de la nube.
- Análisis de vídeo de vigilancia en el borde: el modelo base está orientado a vídeo, por lo que puede emplearse para resumir o etiquetar secuencias cortas capturadas por cámaras IP conectadas a un SoC con RK1820/RK1828.
- Prototipado de asistentes multimodales de bajo consumo: útil para investigadores que quieran validar pipelines VLM en hardware Rockchip antes de escalar a modelos mayores.
- Verificación de integridad en despliegues: el repositorio incluye SHA256SUMS, lo que permite validar los ficheros antes de desplegar en producción y evitar artefactos corruptos en flotas de dispositivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Chips soportados: Rockchip RK1820 y RK1828 (NPU).
- Runtime requerido: RKNN Runtime v1.1.0 y driver correspondiente; verificar con `rknn-smi -v` en el dispositivo antes de ejecutar.
- VRAM/GPU convencional: no aplica; el modelo está empaquetado para NPU Rockchip, no para GPU NVIDIA/AMD.
- Cabe en GPU consumer: no disponible (no es el formato de destino).
- Opciones de despliegue: RKNN Runtime v1.1.0 sobre RK1820/RK1828; descarga vía Hugging Face (`hf download`) o ModelScope (`modelscope download`).
- Latencia y throughput: no disponibles en la información proporcionada.
- Tamaño del repositorio: 0,4 GB, lo que sugiere un paquete compacto apto para almacenamiento embebido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| RK182X-VLM-SmolVLM2-500M-Video-Instruct (este) | 500M | 8192 tokens | RKNN (w4a16) | Apache 2.0 | NPU RK1820/RK1828 |
| SmolVLM2-500M-Video-Instruct (base) | 500M | no disponible en esta ficha | safetensors (presumiblemente) | Apache 2.0 | GPU/CPU convencional |
| Otros VLM de ~500M | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa con alternativas de terceros no está disponible en la información proporcionada. La diferencia principal frente al modelo base es el formato (RKNN cuantizado w4a16 frente a pesos originales) y el hardware objetivo (NPU Rockchip frente a GPU/CPU).

## Limitaciones y advertencias

- Modelo derivado y cuantizado: la cuantización w4a16 puede degradar la calidad respecto al modelo base en tareas de razonamiento visual fino.
- Resolución de visión fija de 512x512: imágenes de mayor resolución deberán reescalarse, lo que puede perder detalle en textos pequeños o escenas complejas.
- Dependencia estricta de hardware: solo funciona en RK1820 y RK1828 con RKNN Runtime v1.1.0 y driver compatible; no es portable a GPU convencional sin reconversión.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento adecuado en castellano sin validación previa.
- Riesgo de alucinación inherente a los VLM de 500M: la capacidad limitada del modelo aumenta la probabilidad de descripciones incorrectas, especialmente en imágenes ambiguas.
- Sesgos: no documentados en la información disponible; deben evaluarse en el modelo base.
- Licencia Apache 2.0 permite uso comercial, pero se aplican también los términos de licencia del RKNN Toolkit y RKNN Runtime, que deben revisarse.
- Verificar los checksums SHA-256 antes del despliegue; la model card indica desplegar solo tras confirmar todas las entradas como `OK`.
- No se han publicado benchmarks ni métricas de latencia/throughput, por lo que el rendimiento en producción debe medirse empíricamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/UGREENDEV/RK182X-VLM-SmolVLM2-500M-Video-Instruct
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolVLM2-500M-Video-Instruct
- Descarga vía ModelScope: `modelscope download --model UGREENDEV/RK182X-VLM-SmolVLM2-500M-Video-Instruct --revision master`
