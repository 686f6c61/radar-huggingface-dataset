# UGREENDEV/RK182X-VLM-LFM2.5-VL-3B

## Resumen

RK182X-VLM-LFM2.5-VLM-3B es una conversión al formato RKNN del modelo visión-lenguaje LiquidAI/LFM2.5-VL-3B, publicada por UGREENDEV para su ejecución sobre las NPU Rockchip RK1820 y RK1828. No se trata de un modelo entrenado desde cero, sino de una cuantización y empaquetado específico para hardware embebido: el repositorio contiene los pesos ya convertidos (w4a16) junto con la configuración necesaria para desplegarlos con RKNN Runtime v1.1.0.

El modelo base es un VLM de 3.000 millones de parámetros de LiquidAI, orientado a tareas image-text-to-text. La conversión mantiene la torre de visión a resolución 512x512 y una longitud de contexto de 16.384 tokens para el LLM, con KVCache en fp16. Es relevante porque permite ejecutar un VLM multimodal en placas con NPU Rockchip de gama baja, un escenario habitual en dispositivos IoT, cámaras inteligentes y edge computing donde no hay GPU disponible.

La ficha se centra en lo que documenta el repositorio. Cualquier dato sobre el entrenamiento, los benchmarks o el rendimiento del modelo original no aparece en la información proporcionada y se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM (torre de visión + LLM); arquitectura interna del modelo base no disponible |
| Parametros totales | 3B (según nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 16.384 tokens (LLM) |
| Tipos de cuantizacion | w4a16 (visión y LLM) |
| Idiomas soportados | no disponible |
| Licencia | other (LFM Open License v1.0 del modelo base) |
| Formato de pesos | RKNN (runtime v1.1.0); también etiquetado gguf en los tags del repo |
| Resolución de visión | 512x512 |
| KVCache | fp16 |
| Núcleos NPU | 8 (visión) + 8 (LLM) |
| Chips soportados | RK1820, RK1828 |
| Tamaño del repo | 2,5 GB |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo base LiquidAI/LFM2.5-VL-3B más allá de su naturaleza multimodal image-text-to-text. Lo que sí se detalla es el proceso de conversión: los pesos se transforman a RKNN con cuantización w4a16 tanto en la torre de visión como en el LLM, se fija la resolución de entrada visual a 512x512 y se configura una ventana de contexto de 16.384 tokens con KVCache en fp16. El paquete se distribuye con checksums SHA-256 para verificar la integridad de los ficheros antes del despliegue.

No hay información en la model card sobre el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF/DPO ni sobre innovaciones técnicas del modelo original. Tampoco se documentan detalles del tokenizador ni de la estrategia de fusión de las representaciones visuales con el texto.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text): descripción de imágenes, respuesta a preguntas visuales y conversación multimodal.
- Conversaciones multi-turno con contexto de hasta 16.384 tokens.
- Procesamiento de imágenes a resolución 512x512.
- Ejecución en NPU Rockchip RK1820 y RK1828 mediante RKNN Runtime v1.1.0.
- Compatibilidad con endpoints (tag `endpoints_compatible` en el repositorio).
- Soporte de tool calling, agentes, matemáticas, código o audio: no disponible en la información proporcionada.

## Casos de uso

- Visión artificial en dispositivos IoT: el modelo puede procesar imágenes de cámara a 512x512 y generar descripciones o respuestas en lenguaje natural directamente en la NPU de una placa RK1820/RK1828, sin necesidad de enviar datos a la nube.
- Asistentes visuales embebidos: integrado en un dispositivo con pantalla y cámara, permite conversaciones multi-turno sobre lo que ve el usuario, aprovechando los 16k tokens de contexto para mantener el hilo de la conversación.
- Inspección visual automatizada en edge: clasificación y descripción de defectos o anomalías en líneas de producción mediante un VLM que corre localmente en hardware Rockchip.
- Accesibilidad: descripción de escenas o lectura de textos en imágenes para personas con discapacidad visual, ejecutándose en un dispositivo de bajo consumo.
- Documentación y digitalización: extracción de información de imágenes de documentos o etiquetas en entornos sin conectividad, con el modelo desplegado en el propio dispositivo.
- Prototipado en investigación de edge AI: banco de pruebas para evaluar VLMs de 3B parámetros en NPUs Rockchip, comparando latencia y calidad frente a ejecuciones en CPU o GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Chips soportados: Rockchip RK1820 y RK1828 (NPU).
- Runtime: RKNN Runtime v1.1.0 y driver correspondiente; verificar la versión en el dispositivo con `rknn-smi -v`.
- Núcleos NPU: 8 para visión y 8 para el LLM.
- VRAM/RAM: no disponible; depende de la placa y del runtime.
- Despliegue en GPU (A100, H100, RTX 4090) o en consumer GPU: no aplicable, el paquete es específico para NPU Rockchip.
- Opciones de despliegue: RKNN Runtime con los ficheros de la configuración `LFM2.5-VL-3B-512x512-w4a16-8-16384`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Observaciones |
|---|---|---|---|---|---|
| RK182X-VLM-LFM2.5-VL-3B (este) | 3B | 16.384 | RKNN w4a16 | other (LFM Open License v1.0) | Específico para NPU Rockchip RK1820/RK1828 |
| LiquidAI/LFM2.5-VL-3B | 3B | no disponible | safetensors (presumible) | LFM Open License v1.0 | Modelo base original, no orientado a NPU |
| Otros VLM de 3B en edge | no disponible | no disponible | no disponible | no disponible | No hay datos en la información proporcionada |

## Limitaciones y advertencias

- El paquete está atado al hardware: solo funciona en RK1820 y RK1828 con RKNN Runtime v1.1.0 y el driver correspondiente.
- La cuantización w4a16 puede degradar la calidad respecto al modelo base en fp16; no se documenta la magnitud de esa pérdida.
- La resolución de visión está fijada a 512x512, lo que limita la lectura de detalles finos en imágenes de alta resolución.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento multilingüe concreto.
- Licencia "other" sujeta a la LFM Open License v1.0 del modelo base; es imprescindible revisar `LICENSE` y `Notice` antes de un uso comercial.
- El uso también queda sujeto a las licencias de RKNN Toolkit y RKNN Runtime.
- Riesgo de alucinación y sesgos del modelo base: no documentados en la información disponible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; madurez y soporte de la comunidad no verificables.

## Enlaces

- Hugging Face: https://huggingface.co/UGREENDEV/RK182X-VLM-LFM2.5-VL-3B
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-3B
- Descarga vía ModelScope: `modelscope download --model UGREENDEV/RK182X-VLM-LFM2.5-VL-3B --revision master`
- Descarga vía Hugging Face CLI: `hf download UGREENDEV/RK182X-VLM-LFM2.5-VL-3B --revision v1.1.0`
- Configuración incluida: `LFM2.5-VL-3B-512x512-w4a16-8-16384/` (README.md, README_CN.md, config.json, SHA256SUMS)
- Papers, blogs, repos o demos adicionales: no disponible
