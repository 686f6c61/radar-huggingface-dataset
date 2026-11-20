# UGREENDEV/RK182X-VLM-InternVL3-2B

## Resumen

RK182X-VLM-InternVL3-2B es una conversión al formato RKNN del modelo vision-language InternVL3-2B de OpenGVLab, publicada por UGREENDEV para su ejecución sobre NPUs Rockchip de la familia RK182X (chips RK1820 y RK1828). No se trata de un modelo entrenado desde cero, sino de un derivado cuantizado y compilado para el runtime RKNN v1.1.0, orientado a despliegue en dispositivos de borde (edge) con aceleración NPU en lugar de GPU.

El modelo base, InternVL3-2B, es un transformer multimodal de aproximadamente 2.000 millones de parámetros que combina un codificador visual con un LLM para tareas de image-text-to-text. Esta conversión emplea cuantización w4a16 (pesos a 4 bits, activaciones a 16 bits) tanto en la torre de visión como en el LLM, con una resolución de entrada visual de 448x448 píxeles y una longitud de contexto de 4096 tokens con KVCache en fp16.

Su relevancia actual reside en la posibilidad de ejecutar un VLM de 2B en hardware Rockchip integrado, algo poco habitual en el ecosistema open source, donde la mayoría de distribuciones de VLMs se orientan a CUDA o CPU. La licencia Apache 2.0 del modelo base facilita su uso comercial, aunque el despliegue está condicionado por los términos del RKNN Toolkit y el RKNN Runtime.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (VLM) basado en InternVL3-2B; conversión a formato RKNN |
| Parámetros totales | ~2B (heredados del modelo base InternVL3-2B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (4k) para el LLM |
| Tipos de cuantización | w4a16 en visión y LLM (pesos 4 bits, activaciones 16 bits); KVCache en fp16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (modelo base); aplican además los términos de RKNN Toolkit y RKNN Runtime |
| Formato de pesos | RKNN (runtime v1.1.0); repositorio de 1,7 GB; también etiquetado como GGUF en los tags |

## Arquitectura y entrenamiento

El modelo es una conversión del InternVL3-2B original: un VLM compuesto por un codificador visual que procesa imágenes a 448x448 píxeles y un LLM de ~2B parámetros que genera la respuesta textual. La conversión a RKNN implica cuantización w4a16 de ambos componentes y compilación para las NPUs RK1820 y RK1828, con 8 núcleos NPU asignados a visión y 8 al LLM según la configuración publicada. El KVCache se mantiene en fp16.

No se dispone de información sobre los datos de entrenamiento del modelo base en la documentación proporcionada, ni sobre procesos de RLHF/DPO o innovaciones de decodificación específicas de esta conversión. La model card se limita a describir el proceso de conversión, los ficheros, la verificación SHA-256 y los requisitos de compatibilidad con el runtime RKNN.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text), incluyendo descripción de imágenes y respuesta a preguntas visuales.
- Comprensión de imágenes a resolución 448x448 píxeles.
- Conversación multi-turno dentro de una ventana de contexto de 4096 tokens.
- Ejecución sobre NPU Rockchip RK1820 y RK1828 mediante RKNN Runtime v1.1.0.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (idiomas no especificados).
- Modo thinking, visión avanzada o audio: no disponible.

## Casos de uso

- Inspección visual en dispositivos de borde: el modelo puede procesar imágenes de 448x448 y generar descripciones o respuestas sobre ellas directamente en la NPU RK1820/RK1828, sin necesidad de GPU ni conexión a la nube, lo que resulta adecuado para cámaras inteligentes o terminales industriales.
- Asistencia visual en kioscos o terminales de autoservicio: con 4096 tokens de contexto puede mantener conversaciones multi-turno sobre imágenes capturadas por el propio dispositivo, integrado en hardware Rockchip de bajo consumo.
- Clasificación y etiquetado semiautomático de imágenes en campo: el modelo puede generar descripciones textuales que se almacenen o reenvíen a un sistema central, aprovechando la cuantización w4a16 para reducir el tamaño del repositorio a 1,7 GB.
- Documentación de incidencias con soporte visual: un operario captura una imagen de un equipo y el modelo genera un texto explicativo que se adjunta al ticket, ejecutándose localmente en el dispositivo.
- Prototipado de aplicaciones VLM embebidas: sirve como referencia para desarrolladores que quieran validar flujos image-text-to-text sobre NPUs Rockchip antes de escalar a modelos mayores.
- Verificación de integridad en pipelines de despliegue: el repositorio incluye SHA256SUMS y un procedimiento de verificación, lo que permite integrar el modelo en un proceso de aprovisionamiento reproducible en dispositivos RK182X.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Chips soportados: RK1820 y RK1828 (NPU Rockchip).
- Runtime: RKNN Runtime v1.1.0 y driver correspondiente; verificar la versión del dispositivo con `rknn-smi -v` antes de ejecutar.
- VRAM estimada para inferencia: no aplica (ejecución en NPU, no en GPU); no disponible la memoria del sistema requerida.
- GPU recomendadas: no aplica; el modelo está compilado para NPU Rockchip, no para CUDA.
- Compatibilidad con GPU de consumo: no disponible; el artefacto RKNN no está pensado para GPUs convencionales.
- Opciones de despliegue: RKNN Runtime v1.1.0 sobre RK1820/RK1828; descarga vía Hugging Face (`hf download`) o ModelScope (`modelscope download`).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RK182X-VLM-InternVL3-2B | ~2B | 4096 tokens | RKNN para NPU RK1820/RK1828 | Apache 2.0 (+ términos RKNN) | Hugging Face, ModelScope |
| OpenGVLab/InternVL3-2B (modelo base) | ~2B | no disponible en esta ficha | safetensors, orientado a GPU/CPU | Apache 2.0 | Hugging Face |
| Alternativas de ~2B en formato GGUF para CPU/edge | no disponible | no disponible | GGUF, llama.cpp | variable | Hugging Face |

La comparación directa con otros VLMs de 2B en formato RKNN no está disponible en la información proporcionada; el principal punto diferencial frente al modelo base es el soporte de NPU Rockchip y la cuantización w4a16, a costa de una ventana de contexto limitada a 4096 tokens.

## Limitaciones y advertencias

- Modelo derivado y cuantizado: la cuantización w4a16 puede degradar la calidad respecto al InternVL3-2B original; no se han publicado evaluaciones que cuantifiquen esa pérdida.
- Contexto limitado a 4096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Dependencia estricta del runtime: requiere RKNN Runtime v1.1.0, driver compatible y los chips RK1820/RK1828; no es portable a GPU o CPU convencionales.
- Idiomas soportados no especificados; el comportamiento multilingüe no está documentado.
- Riesgo de alucinación inherente a los VLMs de ~2B, especialmente en tareas de razonamiento visual complejo o texto en imágenes.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia: Apache 2.0 para el modelo base, pero el uso está sujeto además a los términos de licencia del RKNN Toolkit y del RKNN Runtime, que deben revisarse para uso comercial.
- Debe desplegarse únicamente tras verificar los checksums SHA-256 y usando conjuntamente los ficheros de un mismo directorio de configuración.
- Repositorio sin descargas ni likes en el momento de la consulta; madurez y soporte comunitario limitados.

## Enlaces

- Hugging Face: https://huggingface.co/UGREENDEV/RK182X-VLM-InternVL3-2B
- Modelo base: https://huggingface.co/OpenGVLab/InternVL3-2B
- Descarga vía ModelScope: `modelscope download --model UGREENDEV/RK182X-VLM-InternVL3-2B --revision master`
- Documentación de configuración: `InternVL3-2B-448x448-w4a16-8-4096/README.md` (incluida en el repositorio)
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
