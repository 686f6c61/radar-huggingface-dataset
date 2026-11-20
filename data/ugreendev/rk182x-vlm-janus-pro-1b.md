# UGREENDEV/RK182X-VLM-Janus-Pro-1B

## Resumen

RK182X-VLM-Janus-Pro-1B es una conversión al formato RKNN del modelo multimodal Janus-Pro-1B de DeepSeek, publicada por UGREENDEV para su ejecución sobre el acelerador NPU Rockchip RK1828. No se trata de un modelo nuevo ni de un reentrenamiento: es un artefacto derivado y cuantizado (w4a16) pensado para desplegar visión-lenguaje en hardware embebido de bajo consumo, no en GPUs convencionales. El paquete incluye únicamente los componentes de comprensión de imagen y generación de texto; los módulos de generación de imágenes del Janus-Pro original no están presentes.

El modelo hereda la arquitectura del Janus-Pro-1B de DeepSeek, un transformer multimodal de aproximadamente mil millones de parámetros que desacopla la codificación visual para comprensión y para generación mediante dos cabezas separadas. En esta conversión, la resolución de entrada de visión queda fijada en 384x384 y el contexto del LLM en 15 872 tokens, con KVCache en fp16 y cuantización w4a16 tanto en la torre de visión como en el LLM, ejecutándose sobre 8 núcleos NPU.

Su relevancia es acotada pero específica: cubre el nicho de VLM desplegables en placas Rockchip RK1828 con el runtime RKNN v1.1.0, un escenario típico de dispositivos de borde, cámaras inteligentes o equipos industriales donde no hay GPU disponible. Para cualquier otro entorno de inferencia (vLLM, llama.cpp, GPU de datacenter) este repositorio no es la vía adecuada y conviene acudir a los pesos originales de Janus-Pro-1B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (VLM), derivado de deepseek-ai/Janus-Pro-1B |
| Parámetros totales | ~1B (heredados del modelo base Janus-Pro-1B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 15 872 tokens (15.5k) para el LLM |
| Tipos de cuantización | w4a16 (visión y LLM); KVCache en fp16 |
| Idiomas soportados | no disponible |
| Licencia | DeepSeek Model License (etiquetada como "other") |
| Formato de pesos | RKNN (runtime v1.1.0); repositorio con GGUF y rknn entre las etiquetas |
| Resolución de visión | 384x384 |
| Núcleos NPU | 8 (visión) + 8 (LLM) |
| Chip soportado | Rockchip RK1828 |
| Versión de runtime | RKNN Runtime v1.1.0 |
| Tamaño del repositorio | 1.5 GB |

## Arquitectura y entrenamiento

El modelo base Janus-Pro-1B es un transformer multimodal de DeepSeek que separa la ruta de comprensión visual de la de generación de imágenes mediante codificadores y cabezas independientes, evitando el conflicto de representación que aparece cuando un único espacio visual sirve para ambas tareas. Esta conversión conserva esa estructura para la parte de comprensión y generación de texto, pero elimina los componentes de síntesis de imagen, según declara el autor en la sección de compatibilidad y limitaciones.

No se dispone de información sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) en la documentación proporcionada. La contribución de este repositorio es exclusivamente de conversión y cuantización: pesos transformados a w4a16 para la NPU RK1828, con manifiesto de ficheros, sumas SHA-256 para verificación de integridad y configuración empaquetada en el directorio `Janus-Pro-1B-384x384-w4a16-8-15872`. No se documentan innovaciones de decodificación ni técnicas de atención específicas más allá de las heredadas del modelo original.

## Capacidades

- Comprensión de imágenes y generación de texto (image-text-to-text) a resolución fija de 384x384.
- Generación de texto condicionada por imagen dentro de una ventana de 15 872 tokens.
- Conversión cuantizada w4a16 optimizada para inferencia en NPU Rockchip RK1828 con RKNN Runtime v1.1.0.
- Verificación de integridad de pesos mediante SHA-256 incluida en el paquete.
- Soporte de descarga selectiva por configuración desde Hugging Face y ModelScope.
- No incluye generación de imágenes: los módulos de síntesis visual del Janus-Pro original están ausentes.
- Soporte de tool calling, function calling, agentes multi-paso, audio o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Visión artificial en dispositivos de borde: despliegue de descripción de imágenes y respuesta a preguntas visuales en placas con RK1828, donde el consumo y la ausencia de GPU hacen inviable un VLM convencional.
- Inspección industrial embebida: el modelo puede procesar capturas de 384x384 de cámaras fijas y generar informes textuales de defectos directamente en el equipo, sin enviar imágenes a la nube.
- Asistentes de accesibilidad en hardware dedicado: lectura y descripción de documentos o escenas capturadas por cámara, con contexto de hasta 15.5k tokens para mantener el hilo de una sesión.
- Kioscos y terminales de autoservicio: interpretación de imágenes aportadas por el usuario y generación de respuestas en lenguaje natural sobre un SoC Rockchip, reduciendo costes de infraestructura.
- Prototipado de producto con NPU Rockchip: validación temprana de la viabilidad de un caso de uso multimodal antes de invertir en un modelo mayor o en hardware con GPU.
- Procesamiento por lotes en el dispositivo: clasificación y anotación de imágenes almacenadas localmente en equipos sin conectividad, usando el contexto largo para agrupar varias consultas en una sola sesión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- NPU Rockchip RK1828 exclusivamente; el modelo no está pensado para GPU ni CPU convencionales.
- Runtime RKNN v1.1.0 y driver correspondiente; verificar la versión en el dispositivo con `rknn-smi -v` antes de ejecutar.
- 8 núcleos NPU para la torre de visión y 8 para el LLM.
- KVCache en fp16 para una ventana de 15 872 tokens.
- Tamaño del repositorio de 1.5 GB, lo que da una idea del espacio de almacenamiento necesario para los pesos cuantizados.
- No cabe en GPU de consumo (RTX 4090, etc.) porque el formato RKNN no es ejecutable en ellas.
- Opciones de despliegue: RKNN Runtime v1.1.0 sobre RK1828; descarga vía `hf download` o `modelscope download`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Hardware | Licencia |
|---|---|---|---|---|---|
| RK182X-VLM-Janus-Pro-1B | ~1B | 15 872 tokens | RKNN (w4a16) | NPU RK1828 | DeepSeek Model License |
| deepseek-ai/Janus-Pro-1B | ~1B | no disponible en esta ficha | safetensors (original) | GPU convencional | DeepSeek Model License |
| VLMs de ~1B para borde (p. ej. variantes Qwen2-VL-2B cuantizadas) | ~2B | no disponible en esta ficha | GGUF / RKNN según conversión | CPU, GPU o NPU según build | según modelo base |

La comparación directa solo es posible con el modelo base, del que este repositorio es una conversión. Frente a alternativas de tamaño similar, la diferencia clave no es de calidad sino de formato y destino de ejecución: este paquete solo corre en RK1828, mientras que los pesos originales y las conversiones GGUF requieren GPUs o CPUs. No se dispone de datos de rendimiento comparado.

## Limitaciones y advertencias

- Solo funciona en el chip RK1828 con RKNN Runtime v1.1.0; no es portable a GPU, CPU ni a otros aceleradores sin una nueva conversión.
- No incluye generación de imágenes: es un subconjunto del Janus-Pro-1B original.
- Resolución de visión fija en 384x384, lo que limita el detalle en imágenes de alta resolución o texto pequeño.
- Contexto máximo de 15 872 tokens; sesiones más largas requieren truncado o resumen.
- Los pesos son derivados convertidos y cuantizados, no los pesos upstream sin modificar; pueden existir diferencias de calidad respecto al original.
- Sujeto a la DeepSeek Model License, con restricciones de uso que deben revisarse en `LICENSE` y `NOTICE` antes de un despliegue comercial.
- Las licencias del RKNN Toolkit y del RKNN Runtime también aplican; las librerías de runtime no se incluyen en el paquete.
- Idiomas soportados no documentados; no se puede asumir un rendimiento multilingüe equivalente al del modelo base.
- Riesgo de alucinación y sesgos inherentes al modelo base, no evaluados en esta conversión.
- Repositorio sin descargas ni valoraciones en el momento de la consulta; madurez y soporte de la comunidad no verificables.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/UGREENDEV/RK182X-VLM-Janus-Pro-1B
- Modelo base Janus-Pro-1B: https://huggingface.co/deepseek-ai/Janus-Pro-1B
- Descarga vía ModelScope: `modelscope download --model UGREENDEV/RK182X-VLM-Janus-Pro-1B --revision master --local_dir ./RK182X-VLM-Janus-Pro-1B`
- Descarga vía Hugging Face: `hf download UGREENDEV/RK182X-VLM-Janus-Pro-1B --revision v1.1.0 --local-dir ./RK182X-VLM-Janus-Pro-1B`
- Documentación de configuración incluida en el repositorio: `Janus-Pro-1B-384x384-w4a16-8-15872/README.md` (inglés) y `README_CN.md` (chino)
