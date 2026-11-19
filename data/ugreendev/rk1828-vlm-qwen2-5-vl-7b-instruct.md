# UGREENDEV/RK1828-VLM-Qwen2.5-VL-7B-Instruct

## Resumen

RK1828-VLM-Qwen2.5-VL-7B-Instruct es una conversión al formato RKNN del modelo multimodal Qwen2.5-VL-7B-Instruct de Alibaba Qwen, publicada por el usuario UGREENDEV. Su propósito no es ofrecer un modelo nuevo, sino empaquetar los pesos del VLM original en un formato ejecutable sobre la NPU Rockchip RK1828, con cuantización w4a16 en visión y en el decodificador LLM. El repositorio incluye dos configuraciones diferenciadas por longitud de contexto y por el tipo de KVCache.

El modelo hereda las capacidades del Qwen2.5-VL-7B-Instruct original: comprensión de imágenes y texto, razonamiento visual, respuesta conversacional y soporte de instrucciones en múltiples idiomas. La conversión fija la resolución de entrada de visión en 392x392 píxeles y limita el contexto del LLM a 1536 o 4096 tokens según la configuración, muy por debajo de la ventana nativa del modelo base.

Es relevante para desarrolladores que despliegan inferencia en hardware de borde con NPU Rockchip, ya que permite ejecutar un VLM de 7B parámetros en un chip integrado con cuantización de 4 bits, a costa de sacrificar resolución de imagen, longitud de contexto y, presumiblemente, precisión respecto al modelo original en fp16.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (VLM) basado en Qwen2.5-VL-7B-Instruct, convertido a RKNN |
| Parámetros totales | 7B (heredados del modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1536 tokens (configuración `w4a16-8-1536`) o 4096 tokens (configuración `w4a16-8-4096-kv-int4`) |
| Tipos de cuantización | Visión: w4a16; LLM: w4a16; KVCache: fp16 o int4 según configuración |
| Idiomas soportados | no disponible (el modelo base Qwen2.5-VL es multilingüe, pero la model card no detalla idiomas) |
| Licencia | Apache 2.0 (modelo base); aplican además los términos de RKNN Toolkit y RKNN Runtime |
| Formato de pesos | RKNN (runtime v1.1.0); el repo también contiene GGUF según los tags, aunque la model card solo documenta RKNN |
| Resolución de visión | 392x392 píxeles |
| Núcleos NPU | 8 para visión y 8 para LLM |
| Chip soportado | Rockchip RK1828 |
| Versión de runtime | RKNN Runtime v1.1.0 |
| Tamaño del repositorio | 5.9 GB |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-VL-7B-Instruct, un transformer multimodal con un codificador visual y un decodificador de lenguaje de 7B parámetros. Esta publicación no entrena ni ajusta el modelo: aplica una conversión de formato y cuantización para el runtime RKNN de Rockchip. La cuantización es w4a16 (pesos en 4 bits, activaciones en 16 bits) tanto en la torre de visión como en el LLM, y el KVCache se guarda en fp16 en la configuración de 1536 tokens o en int4 en la de 4096 tokens.

No se documentan en la información disponible los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo RLHF o DPO; esos detalles corresponden al modelo base Qwen2.5-VL-7B-Instruct y no se reproducen aquí. La innovación técnica de esta ficha es exclusivamente de despliegue: empaquetado RKNN, cuantización de 4 bits y dos perfiles de contexto que equilibran memoria de KVCache y ventana de conversación en la NPU RK1828.

## Capacidades

- Generación de texto e inferencia conversacional multimodal (image-text-to-text).
- Comprensión de imágenes a resolución fija de 392x392 píxeles.
- Razonamiento visual y respuesta a preguntas sobre imágenes.
- Instrucciones en formato chat (modelo Instruct del base).
- Capacidades multilingües heredadas del modelo base (no detalladas en la model card).
- No se documenta soporte explícito de tool calling, function calling ni agentes multi-paso en la información disponible.
- No se documenta modo thinking, audio ni vídeo en la información disponible.

## Casos de uso

- Inspección visual en dispositivos de borde: clasificación y descripción de imágenes capturadas por cámaras en equipos con NPU RK1828, usando la configuración de 1536 tokens para respuestas cortas y baja latencia.
- Asistencia en kioscos o paneles interactivos: el modelo puede responder preguntas sobre una imagen o documento escaneado mostrado por el usuario, con contexto suficiente para turnos breves.
- Control de calidad industrial: análisis de imágenes de producto a 392x392 para detectar defectos o verificar etiquetas, ejecutándose localmente sin conexión a la nube.
- Accesibilidad: descripción de imágenes para usuarios con discapacidad visual en dispositivos empotrados, con la configuración de 4096 tokens cuando se requiere una descripción más extensa.
- Procesamiento de documentos en campo: lectura de formularios o tickets fotografiados y extracción de información en texto, en entornos sin conectividad.
- Prototipado de aplicaciones VLM en hardware Rockchip: validación de pipelines de visión-lenguaje antes de migrar a GPUs o servidores, gracias a la disponibilidad de dos perfiles de contexto y checksums SHA-256 para verificar la integridad de los ficheros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Chip obligatorio: Rockchip RK1828 con NPU; no es ejecutable en GPU convencional sin reconversión.
- Runtime: RKNN Runtime v1.1.0 y driver compatible; verificar con `rknn-smi -v` antes de ejecutar.
- Memoria: el repositorio ocupa 5.9 GB; la configuración de 1536 tokens usa KVCache fp16 y la de 4096 tokens usa KVCache int4, lo que reduce el consumo de memoria a costa de precisión.
- No cabe en GPU de consumo (RTX 4090, etc.) en formato RKNN; requiere el hardware Rockchip objetivo.
- Despliegue mediante RKNN Runtime; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Hardware |
|---|---|---|---|---|---|
| RK1828-VLM-Qwen2.5-VL-7B-Instruct | 7B | 1536 o 4096 tokens | RKNN | Apache 2.0 | NPU RK1828 |
| Qwen2.5-VL-7B-Instruct (original) | 7B | contexto nativo del base (no detallado aquí) | safetensors | Apache 2.0 | GPU |
| Otros VLM de 7B (p. ej. variantes Llama o InternVL) | ~7B | variable | safetensors, GGUF | variable | GPU/CPU |

La comparación directa con el modelo base no es posible en términos de rendimiento porque esta conversión no publica benchmarks ni métricas de degradación por cuantización. Frente a alternativas en formato GGUF para CPU, la ventaja aquí es la ejecución en NPU Rockchip; la desventaja es la ventana de contexto reducida y la resolución fija de visión.

## Limitaciones y advertencias

- Contexto muy limitado: 1536 o 4096 tokens, insuficiente para conversaciones largas o documentos extensos.
- Resolución de visión fija de 392x392, lo que degrada la lectura de texto pequeño o detalles finos en imágenes.
- Cuantización w4a16 en visión y LLM: previsible pérdida de precisión respecto al modelo base en fp16, no cuantificada en la model card.
- Solo funciona en RK1828; no es portable a otras NPU ni a GPU sin reconversión.
- Requiere runtime y driver RKNN v1.1.0 exactos; versiones distintas pueden fallar.
- Riesgo de alucinación inherente al modelo base, agravado por la cuantización y la baja resolución de entrada.
- Sesgos: no documentados en la información disponible; se heredan los del modelo base Qwen2.5-VL.
- Licencia Apache 2.0 para el modelo, pero los términos de RKNN Toolkit y RKNN Runtime también aplican y pueden imponer restricciones adicionales al uso comercial del binario.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/UGREENDEV/RK1828-VLM-Qwen2.5-VL-7B-Instruct
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Documentación de configuración 1536 tokens: `Qwen2.5-VL-7B-Instruct-392x392-w4a16-8-1536/README.md` dentro del repositorio
- Documentación de configuración 4096 tokens: `Qwen2.5-VL-7B-Instruct-392x392-w4a16-8-4096-kv-int4/README.md` dentro del repositorio
- Descarga vía ModelScope: `modelscope download --model UGREENDEV/RK1828-VLM-Qwen2.5-VL-7B-Instruct --revision master`
- Descarga vía Hugging Face CLI: `hf download UGREENDEV/RK1828-VLM-Qwen2.5-VL-7B-Instruct --revision v1.1.0`
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
