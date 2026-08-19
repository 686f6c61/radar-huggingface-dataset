# t-firefly/qwen3-vl-4b-rknn3-rk1828

## Resumen

El modelo `t-firefly/qwen3-vl-4b-rknn3-rk1828` es una conversión del modelo vision-lenguaje Qwen3-VL-4B-Instruct, desarrollado originalmente por el equipo Qwen, adaptado por el equipo Firefly AI para su ejecución en el coprocesador de IA Rockchip RK1828. Esta adaptación permite desplegar un modelo multimodal de 4.000 millones de parámetros en dispositivos de borde (edge AI), aprovechando el SDK RKNN3 de Rockchip y la herramienta de despliegue LlamaPi.

El modelo conserva las capacidades del original: comprensión de texto e imágenes, razonamiento visual, OCR, comprensión espacial y análisis de documentos. Su relevancia actual radica en la creciente demanda de modelos de IA generativa que puedan ejecutarse localmente en hardware de bajo consumo, sin depender de la nube, manteniendo un equilibrio entre tamaño y rendimiento. El repositorio incluye los pesos en formato GGUF, con un tamaño de 3,6 GB, y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en productos.

Al estar orientado a una plataforma específica (RK1828), este modelo no es directamente ejecutable en GPUs convencionales, sino que requiere un sistema con el coprocesador RK1828 (o compatible según el SDK RKNN3). Esto lo convierte en una opción interesante para desarrolladores que trabajan con hardware embebido de Rockchip, como el módulo AIO-GS1N2-RK182X de Firefly.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje), basada en Qwen3-VL-4B-Instruct |
| Parametros totales | 4.000 millones (según el nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (no se especifican los niveles de cuantización exactos) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors no disponible en el repositorio) |

## Arquitectura y entrenamiento

El modelo es una conversión directa del Qwen3-VL-4B-Instruct, un modelo de lenguaje multimodal basado en arquitectura transformer con componentes de visión. El modelo original fue entrenado por el equipo Qwen con un enfoque de instrucción supervisada y ajuste fino, combinando datos de texto e imágenes. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se utilizaron técnicas como RLHF o DPO en la versión original.

La adaptación realizada por Firefly AI consiste en la conversión de los pesos del modelo original al formato RKNN3, optimizado para el coprocesador RK1828. Este proceso incluye la cuantización a GGUF (aunque no se especifica el nivel exacto) y la integración con el runtime de LlamaPi. No se han introducido modificaciones en la arquitectura ni en los pesos del modelo original; se trata de una transformación de formato y optimización para hardware específico.

## Capacidades

- Comprensión y generación de texto a partir de entradas visuales (imágenes) y textuales.
- Razonamiento visual: responde preguntas sobre el contenido de imágenes.
- Reconocimiento óptico de caracteres (OCR) en imágenes y documentos escaneados.
- Comprensión espacial: localización de objetos y relaciones espaciales en una imagen.
- Análisis de documentos: extracción de información de tablas, formularios y textos complejos.
- Capacidades generales de lenguaje: conversación, resumen, redacción, etc., heredadas del modelo base.
- No se confirma soporte explícito de tool calling o function calling en esta adaptación, aunque el modelo base Qwen3-VL-4B-Instruct sí lo incluye en su versión original.

## Casos de uso

- Visión artificial en robótica de borde: el modelo puede procesar en tiempo real las imágenes captadas por una cámara en un robot o dron, identificando objetos, obstáculos o leyendo etiquetas, gracias a su ejecución local en el RK1828 sin necesidad de conexión a la nube.
- Asistentes de accesibilidad para personas con discapacidad visual: un dispositivo portátil con RK1828 puede describir el entorno, leer textos de carteles o identificar productos mediante la cámara, usando el modelo con baja latencia y consumo energético reducido.
- Inspección de calidad en entornos industriales: integrado en una línea de producción, el modelo analiza imágenes de piezas para detectar defectos o leer códigos de serie, funcionando de forma autónoma y con privacidad de datos.
- Quioscos interactivos con reconocimiento de documentos: un quiosco físico puede escanear un documento de identidad o un formulario, extraer los campos relevantes mediante OCR y responder preguntas del usuario, todo en el dispositivo.
- Vigilancia inteligente con análisis de escenas: el modelo interpreta secuencias de imágenes de cámaras de seguridad para identificar eventos anómalos (presencia de personas, objetos dejados, etc.) y generar alertas descriptivas.
- Asistente educativo offline: un dispositivo educativo con cámara puede resolver problemas matemáticos mostrados en un papel, explicar diagramas o responder preguntas sobre imágenes de libros de texto, funcionando sin conexión a internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de rendimiento (como MMLU, HumanEval o GSM8K) ni comparaciones con otros modelos en la plataforma RK1828.

## Requisitos de hardware

- Plataforma objetivo: coprocesador Rockchip RK1828 (también compatible con RK1820 y RK3572 según el SDK RKNN3).
- El modelo se ejecuta como dispositivo de IA acelerado, conectado a un host (por ejemplo, un SoC RK3588) mediante PCIe.
- VRAM: no aplica directamente; el modelo se carga en la memoria del coprocesador (no se especifica la memoria requerida en la información disponible).
- GPU: no es compatible con GPUs convencionales; requiere el hardware RKNN3 específico.
- Despliegue: mediante la herramienta LlamaPi (`llamapi run qwen3-vl:4b`), que gestiona la descarga, carga y ejecución del modelo.
- Latencia y throughput: no disponibles en la documentación proporcionada.
- Alternativas de despliegue: el SDK RKNN3-Toolkit permite conversión y evaluación de modelos en PC, pero la inferencia final está pensada para el hardware embebido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Plataforma | Licencia |
|---|---|---|---|---|---|
| Qwen3-VL-4B-Instruct (original) | 4B | no disponible | safetensors | GPUs | Apache 2.0 |
| t-firefly/qwen3-vl-4b-rknn3-rk1828 | 4B | no disponible | GGUF | RK1828 (RKNN3) | Apache 2.0 |
| Qwen2.5-VL-3B-Instruct (similar en tamaño) | 3B | no disponible | safetensors | GPUs | Apache 2.0 |

La comparativa se limita al modelo original y a un modelo de tamaño similar de la misma familia. No se dispone de datos de rendimiento para establecer una comparación cuantitativa. La principal diferencia radica en la plataforma de ejecución: el modelo convertido está optimizado para hardware embebido de Rockchip, mientras que el original requiere GPUs.

## Limitaciones y advertencias

- El modelo es una conversión para hardware específico; no funcionará en GPUs convencionales ni en CPUs sin el runtime RKNN3 y el coprocesador adecuado.
- No se han publicado resultados de calidad o benchmarks en esta adaptación, por lo que el rendimiento real en tareas multimodales no está verificado.
- La cuantización a GGUF puede introducir pérdidas de precisión respecto al modelo original en punto flotante, aunque no se especifica el nivel de cuantización.
- El modelo hereda las limitaciones del Qwen3-VL-4B-Instruct original, incluyendo posibles sesgos en los datos de entrenamiento y riesgo de alucinaciones en respuestas visuales o textuales.
- La longitud de contexto no está documentada en esta conversión; se recomienda verificar el comportamiento con secuencias largas antes de usarlo en producción.
- La licencia Apache 2.0 permite uso comercial, pero los derechos de propiedad intelectual del modelo original pertenecen al equipo Qwen; la atribución debe mantenerse.
- No se dispone de información sobre el soporte de idiomas específicos; el modelo base es multilingüe, pero no se confirma en esta adaptación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/t-firefly/qwen3-vl-4b-rknn3-rk1828
- Modelo original en HuggingFace: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Modelo original en ModelScope: https://modelscope.cn/models/Qwen/Qwen3-VL-4B-Instruct
- SDK RKNN3 (GitHub): https://github.com/airockchip/rknn3-toolkit
- Wiki de Firefly para RK1820/RK1828: https://wiki.t-firefly.com/en/AIO-GS1N2-RK182X/ai_rk182x.html
- Documentación de LlamaPi: https://community.t-firefly.com/docs/ai/applications/LlamaPi/llamapi
