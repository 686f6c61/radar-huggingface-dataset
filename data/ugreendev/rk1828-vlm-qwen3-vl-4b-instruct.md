# UGREENDEV/RK1828-VLM-Qwen3-VL-4B-Instruct

## Resumen

RK1828-VLM-Qwen3-VL-4B-Instruct es una conversión al formato RKNN del modelo Qwen/Qwen3-VL-4B-Instruct, publicada por UGREENDEV para su ejecución sobre la NPU Rockchip RK1828. No se trata de un modelo entrenado desde cero, sino de una cuantización y empaquetado del VLM de 4B parámetros de Qwen (familia Qwen3-VL, pipeline image-text-to-text) orientada a inferencia en hardware embebido. El repositorio incluye dos configuraciones precompiladas con cuantización w4a16 en visión y LLM, y distintas longitudes de contexto y precisión de KVCache.

La relevancia de esta ficha radica en que permite desplegar un modelo visión-lenguaje de 4B parámetros en un SoC con NPU dedicada, algo que hasta hace poco exigía GPU o aceleradores de mayor consumo. Las dos variantes cubren escenarios distintos: una con 14k tokens de contexto y KVCache en fp16, y otra con 34k tokens y KVCache en int4, lo que permite elegir entre mayor ventana de contexto o menor huella de memoria.

El modelo hereda las capacidades del Qwen3-VL-4B-Instruct original (comprensión de imagen y texto, generación conversacional, soporte multilingüe según el modelo base), pero las restricciones del runtime RKNN y del chip RK1828 condicionan resolución de imagen, cuantización y contexto. La licencia declarada es Apache 2.0, si bien se aplican además los términos del RKNN Toolkit y RKNN Runtime.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (VLM) derivado de Qwen3-VL-4B-Instruct; compilado a RKNN |
| Parametros totales | 4B (heredados del modelo base Qwen3-VL-4B-Instruct) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 14 336 tokens (variante con KVCache fp16) o 34 816 tokens (variante con KVCache int4) |
| Tipos de cuantizacion | w4a16 en visión y LLM; KVCache fp16 o int4 según variante |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (modelo base); se aplican además los términos de RKNN Toolkit y RKNN Runtime |
| Formato de pesos | RKNN (con config.json y SHA256SUMS por configuración); tags gguf y rknn en el repo |
| Chip soportado | RK1828 (único) |
| Versión de runtime RKNN | v1.1.0 |
| Resolución de visión | 384x384 |
| Núcleos NPU | 8 para visión y 8 para LLM |
| Tamaño del repositorio | 3.6 GB |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-VL-4B-Instruct, un transformer multimodal de la familia Qwen3-VL que procesa pares imagen-texto y genera respuestas conversacionales. Sobre esa base, UGREENDEV ha realizado una conversión a RKNN con cuantización w4a16 (pesos a 4 bits, activaciones a 16 bits) tanto en la torre de visión como en el LLM, y ha compilado dos configuraciones diferenciadas por la gestión de la KVCache: una en fp16 con 14 336 tokens de contexto y otra en int4 con 34 816 tokens.

No se dispone de información sobre el proceso de entrenamiento del modelo base en la documentación proporcionada (número de tokens, composición del dataset, uso de RLHF/DPO u otras técnicas). La innovación técnica de este repositorio es el propio pipeline de conversión y cuantización para NPU RK1828, que incluye resolución fija de visión a 384x384, reparto de 8 núcleos NPU para cada submodelo y verificación de integridad mediante SHA-256. El runtime requiere la versión v1.1.0 y drivers coincidentes, comprobables con `rknn-smi -v`.

## Capacidades

- Generación de texto conversacional multi-turno a partir de entradas de imagen y texto (pipeline image-text-to-text).
- Comprensión de imágenes: descripción, respuesta a preguntas visuales y razonamiento sobre contenido gráfico, con resolución de entrada fijada en 384x384.
- Razonamiento y respuesta en lenguaje natural heredados del Qwen3-VL-4B-Instruct original.
- Soporte multilingüe: no confirmado en la información disponible para esta conversión; depende de lo que conserve el modelo base tras la cuantización.
- Tool calling / function calling: no disponible en la documentación de esta conversión.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la documentación de esta conversión.
- Ejecución en NPU RK1828 con cuantización w4a16 y dos perfiles de contexto/KVCache.

## Casos de uso

- Inspección visual en dispositivos embebidos: cámaras industriales o domóticas conectadas a un SoC RK1828 pueden enviar fotogramas a 384x384 y obtener descripciones o alertas en lenguaje natural sin depender de la nube, gracias a la ejecución local en NPU.
- Asistencia en kioscos y terminales de autoservicio: el modelo puede responder preguntas sobre productos mostrados en pantalla o documentos escaneados, con contexto de hasta 14k tokens para mantener una conversación coherente durante la sesión.
- Digitalización de documentos con contexto largo: la variante de 34 816 tokens con KVCache int4 permite procesar varias páginas o imágenes en una misma conversación, útil para extracción de datos de facturas o formularios en dispositivos de bajo consumo.
- Accesibilidad en dispositivos portátiles: descripción de escenas o lectura de textos para usuarios con discapacidad visual, ejecutándose en hardware de bajo consumo y sin conexión.
- Control de calidad visual en línea de producción: clasificación y explicación de defectos en imágenes capturadas por cámaras fijas, integrado en la propia máquina gracias al soporte NPU del RK1828.
- Prototipado de productos VLM en hardware Rockchip: el repositorio sirve como referencia para validar latencia y precisión de un VLM de 4B en RK1828 antes de diseñar un producto final, con dos configuraciones para comparar coste de memoria frente a contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Chip obligatorio: Rockchip RK1828; no se soportan otras plataformas según la documentación.
- Runtime: RKNN Runtime v1.1.0 con driver coincidente; verificar con `rknn-smi -v` antes de ejecutar.
- Núcleos NPU: 8 dedicados a visión y 8 al LLM.
- Memoria: el repositorio ocupa 3.6 GB; la variante con KVCache int4 reduce la huella frente a la de fp16, aunque no se especifica el consumo exacto de RAM/NPU en la documentación.
- GPU: no aplica; el modelo está compilado para NPU RK1828 y no se documenta despliegue en A100, H100 ni RTX 4090.
- Opciones de despliegue: runtime RKNN sobre RK1828; descarga vía Hugging Face (`hf download`) o ModelScope (`modelscope download`), con verificación SHA-256 antes del despliegue.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RK1828-VLM-Qwen3-VL-4B-Instruct | 4B | 14k o 34k tokens | RKNN, NPU RK1828 | Apache 2.0 | Hugging Face y ModelScope |
| Qwen/Qwen3-VL-4B-Instruct | 4B | no disponible en la información proporcionada | safetensors (modelo original) | Apache 2.0 | Hugging Face |
| Otros VLM de ~4B para edge | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con alternativas de la misma categoría (VLM de 4B para hardware embebido) no está disponible en la información proporcionada. El referente más claro es el modelo base Qwen3-VL-4B-Instruct, del que esta conversión hereda capacidades pero al que añade cuantización w4a16, contexto configurable y dependencia exclusiva del chip RK1828.

## Limitaciones y advertencias

- Dependencia total del hardware: solo funciona en RK1828 con RKNN Runtime v1.1.0 y driver compatible; no es desplegable en GPU ni en CPU convencional.
- Resolución de visión fija en 384x384, lo que limita la lectura de textos pequeños o detalles finos en imágenes.
- La cuantización w4a16 puede degradar la precisión respecto al modelo base original; no se han publicado evaluaciones que cuantifiquen esa pérdida.
- Idiomas soportados no confirmados para esta conversión; verificar el comportamiento multilingüe antes de usarla en producción.
- Riesgo de alucinación inherente a los VLM de 4B, especialmente en preguntas visuales ambiguas o imágenes de baja calidad.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia Apache 2.0 para el modelo base, pero se aplican además los términos del RKNN Toolkit y RKNN Runtime, que deben revisarse para uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria documentada.
- Es imprescindible verificar la integridad con `sha256sum -c SHA256SUMS` y usar conjuntamente los ficheros de una misma configuración.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/UGREENDEV/RK1828-VLM-Qwen3-VL-4B-Instruct
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Documentación de configuración (ingles): https://huggingface.co/UGREENDEV/RK1828-VLM-Qwen3-VL-4B-Instruct/blob/main/Qwen3-VL-4B-Instruct-384x384-w4a16-8-14336/README.md
- Documentación de configuración (chino): https://huggingface.co/UGREENDEV/RK1828-VLM-Qwen3-VL-4B-Instruct/blob/main/Qwen3-VL-4B-Instruct-384x384-w4a16-8-14336/README_CN.md
- Descarga en ModelScope: https://modelscope.cn/models/UGREENDEV/RK1828-VLM-Qwen3-VL-4B-Instruct
