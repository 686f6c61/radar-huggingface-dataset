# UGREENDEV/RK182X-VLM-Qwen3.5-2B

## Resumen

RK182X-VLM-Qwen3.5-2B es una conversión al formato RKNN del modelo vision-lenguaje Qwen/Qwen3.5-2B, publicada por UGREENDEV para su ejecución sobre la NPU Rockchip RK1828 (plataforma RK182X). No se trata de un modelo entrenado desde cero, sino de una cuantización y empaquetado del modelo base de Qwen con el objetivo de habilitar inferencia multimodal (image-text-to-text) en hardware de borde con aceleración NPU. El repositorio ocupa 2,6 GB e incluye dos configuraciones precompiladas con distintas ventanas de contexto y política de KVCache.

La relevancia de esta ficha radica en que ejemplifica el patrón de despliegue de VLMs pequeños en silicio especializado: el modelo se distribuye como artefactos RKNN con cuantización w4a16 (pesos a 4 bits, activaciones a 16 bits) para visión y LLM, junto con checksums SHA-256 y un runtime específico (v1.1.0). El contexto máximo declarado alcanza 132.608 tokens en la variante con KVCache int4, lo que resulta notable para un modelo de 2B parámetros ejecutándose en una NPU de gama embebida.

La información pública disponible es escasa: no se detallan datos de entrenamiento, benchmarks ni idiomas soportados, y el repositorio no registra descargas ni interacciones. Esta ficha se limita, por tanto, a lo que la model card y los metadatos de Hugging Face permiten afirmar, marcando explícitamente como "no disponible" todo aquello que no se puede verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (VLM) derivado de Qwen/Qwen3.5-2B; empaquetado como RKNN para NPU Rockchip |
| Parametros totales | 2B (según el nombre del modelo base; desglose visión/LLM no disponible) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 132.608 tokens (129,5k) en la variante KVCache int4; 64.000 tokens (62,5k) en la variante KVCache fp16 |
| Tipos de cuantizacion | Vision: w4a16; LLM: w4a16; KVCache: int4 o fp16 según configuración |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (modelo base); se aplican además los términos de RKNN Toolkit y RKNN Runtime |
| Formato de pesos | RKNN (artefactos para runtime v1.1.0), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.5-2B, un transformer multimodal de la familia Qwen3.5 orientado a tareas image-text-to-text. UGREENDEV no aporta detalles sobre la arquitectura interna del modelo base (número de capas, dimensión oculta, mecanismo de atención, encoder visual), ni sobre el proceso de entrenamiento (volumen de tokens, composición del dataset, uso de RLHF o DPO). Toda esa información debe consultarse en la model card del modelo original de Qwen, que no forma parte de la documentación proporcionada.

La contribución técnica del repositorio es la conversión a RKNN: se generan dos configuraciones con resolución de visión fija de 384x384, cuantización w4a16 en visión y LLM, y 8 núcleos NPU asignados tanto al encoder visual como al LLM. La diferencia entre ambas variantes es la gestión de la KVCache (int4 frente a fp16) y, en consecuencia, la ventana de contexto máxima. El repositorio incluye `config.json` con el manifiesto de ficheros y `SHA256SUMS` para verificación de integridad antes del despliegue.

## Capacidades

- Generación de texto e inferencia multimodal image-text-to-text, según el pipeline declarado (`image-text-to-text`).
- Procesamiento de imágenes a resolución fija de 384x384 por el encoder visual cuantizado.
- Conversación multi-turno (tag `conversational` en Hugging Face).
- Soporte de contexto largo: hasta 132.608 tokens en la variante con KVCache int4.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere integración en servicios de inferencia.
- Capacidades específicas del modelo base Qwen3.5-2B (razonamiento, código, matemáticas, tool calling, thinking mode): no verificadas en esta conversión; deben contrastarse con la documentación de Qwen.

## Casos de uso

- Visión artificial en dispositivos de borde: ejecución de un VLM de 2B parámetros sobre NPU RK1828 para tareas de descripción de imágenes o respuesta a preguntas visuales en equipos embebidos, sin depender de la nube.
- Inspección industrial con cámaras: el encoder visual a 384x384 y la cuantización w4a16 permiten clasificar o describir imágenes de producto en una línea de fabricación con latencia controlada por la NPU.
- Asistentes de accesibilidad offline: descripción de escenas o lectura de documentos capturados por cámara en dispositivos portátiles, aprovechando el contexto largo para mantener historial de conversación.
- Procesamiento de documentos escaneados en kioscos o terminales de autoservicio: extracción de información de formularios e imágenes con un modelo que cabe en 2,6 GB de repositorio y se ejecuta en hardware de bajo consumo.
- Automatización de tickets de soporte con capturas de pantalla: el modelo puede recibir una imagen del error y el historial textual de la incidencia, con contexto de hasta 129,5k tokens en la variante int4.
- Prototipado de producto con Rockchip: validación de pipelines VLM en placas RK1828 antes de escalar a producción, usando las dos configuraciones disponibles para comparar precisión frente a consumo de memoria de KVCache.
- Verificación de integridad en despliegues: el flujo con `SHA256SUMS` y `rknn-smi -v` permite auditar versiones de runtime y ficheros en flotas de dispositivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión (MMLU, MMMU, DocVQA u otras), latencia ni throughput para las configuraciones RKNN.

## Requisitos de hardware

- Chip soportado: exclusivamente Rockchip RK1828 (plataforma RK182X). No hay soporte declarado para otras NPU ni para GPU.
- Runtime: RKNN Runtime v1.1.0, con driver correspondiente; verificar la versión en el dispositivo con `rknn-smi -v` antes de ejecutar.
- NPU: 8 núcleos asignados al encoder visual y 8 al LLM en ambas configuraciones.
- Memoria: el repositorio completo ocupa 2,6 GB; el consumo en dispositivo depende de la configuración elegida (KVCache int4 frente a fp16) y del contexto utilizado.
- No ejecutable en GPU consumer (RTX 4090, etc.) ni mediante vLLM, llama.cpp, Ollama o TGI: los artefactos son RKNN y requieren el runtime de Rockchip.
- Latencia y throughput: no disponibles.
- Despliegue: descarga vía `hf download` o `modelscope download`, verificación con `sha256sum -c SHA256SUMS` y ejecución con el runtime RKNN v1.1.0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Hardware objetivo | Licencia |
|---|---|---|---|---|---|
| RK182X-VLM-Qwen3.5-2B (este) | 2B | 132.608 (int4 KV) / 64.000 (fp16 KV) | RKNN | NPU Rockchip RK1828 | Apache 2.0 |
| Qwen/Qwen3.5-2B (base) | 2B | no disponible | safetensors (previsible) | GPU/CPU | Apache 2.0 |
| Otros VLM de ~2B (p. ej. familia Qwen2-VL-2B, InternVL2-2B) | ~2B | no disponible | safetensors, GGUF | GPU/CPU | variable |

No se dispone de datos de rendimiento comparado entre estas opciones en la información proporcionada; la comparación se limita a parámetros, contexto declarado, formato y licencia.

## Limitaciones y advertencias

- El modelo solo funciona en chips RK1828 con RKNN Runtime v1.1.0; no es portable a otros aceleradores sin reconversión.
- La cuantización w4a16 en visión y LLM puede degradar la precisión respecto al modelo base en fp16/bf16; no se publican métricas que cuantifiquen esa pérdida.
- La resolución de visión está fijada a 384x384, lo que limita la lectura de textos pequeños o detalles finos en imágenes.
- Idiomas soportados no declarados; no se puede garantizar cobertura multilingüe más allá de lo que indique la documentación de Qwen3.5-2B.
- Riesgo de alucinación inherente a los VLMs de 2B parámetros; no hay evaluaciones publicadas para esta conversión.
- Sesgos: no documentados en la información disponible.
- La licencia Apache 2.0 del modelo base no cubre por sí sola los términos del RKNN Toolkit y RKNN Runtime, que se aplican adicionalmente; revisar ambos antes de uso comercial.
- El repositorio no registra descargas ni likes y fue creado y actualizado el mismo día (2026-11-20), lo que indica ausencia de validación comunitaria.
- Es imprescindible usar conjuntamente los ficheros de una misma configuración y verificar los checksums SHA-256 antes del despliegue.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/UGREENDEV/RK182X-VLM-Qwen3.5-2B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Documentación de configuración int4 KV (ruta relativa en el repo): `Qwen3.5-2B-384x384-w4a16-8-132608-kv-int4/README.md`
- Documentación de configuración fp16 KV (ruta relativa en el repo): `Qwen3.5-2B-384x384-w4a16-8-64000/README.md`
- Papers, blogs, demos o repositorios adicionales: no disponibles en la información proporcionada.
