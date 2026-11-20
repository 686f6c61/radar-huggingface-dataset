# UGREENDEV/RK182X-EMBEDDING-Qwen3-Reranker-0.6B

## Resumen

RK182X-EMBEDDING-Qwen3-Reranker-0.6B es una conversión al formato RKNN del modelo Qwen3-Reranker-0.6B de Alibaba Qwen, publicada por UGREENDEV para su ejecución sobre las NPU Rockchip RK1820 y RK1828. No se trata de un modelo nuevo, sino de un artefacto derivado: los pesos originales se han cuantizado a w4a16 y compilado con RKNN Toolkit para que el reranker funcione en hardware de borde (edge) con aceleración NPU en lugar de GPU.

El modelo subyacente es un reranker de 0,6 mil millones de parámetros que asigna puntuaciones de relevancia a pares consulta-documento, pensado para la segunda fase de un pipeline de recuperación (RAG): tras un primer filtrado por similitud vectorial, el reranker reordena los candidatos por relevancia real. La conversión limita la longitud de contexto a 2048 tokens y emplea 8 núcleos NPU, con caché KV en fp16.

Su relevancia actual es práctica: permite desplegar un reranker de calidad en dispositivos con NPU Rockchip de bajo consumo, algo útil para sistemas RAG embebidos, asistentes locales o gateways de borde donde no hay GPU disponible. La licencia Apache 2.0 del modelo base facilita el uso comercial, aunque el artefacto depende del runtime y los drivers RKNN, que no se incluyen en el paquete.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-Reranker base), compilado a RKNN |
| Parametros totales | 0,6 mil millones (modelo base Qwen3-Reranker-0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (2k) |
| Tipos de cuantizacion | w4a16 (pesos 4 bits, activaciones 16 bits); KVCache en fp16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (modelo base); sujeto además a las licencias de RKNN Toolkit y RKNN Runtime |
| Formato de pesos | RKNN (runtime v1.1.0); repositorio de 0,6 GB |

## Arquitectura y entrenamiento

El modelo base Qwen3-Reranker-0.6B es un transformer encoder/decoder de la familia Qwen3 adaptado a la tarea de ranking de texto (pipeline `text-ranking`), que produce una puntuación de relevancia para un par consulta-documento. Esta publicación no entrena nada nuevo: toma los pesos originales y los convierte a RKNN mediante RKNN Toolkit, con cuantización w4a16 y una configuración de 8 núcleos NPU, contexto de 2048 tokens y caché KV en fp16.

Los detalles de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) no se documentan en la información disponible para esta ficha. La conversión tampoco aporta innovaciones algorítmicas: su valor técnico está en la compilación para NPU Rockchip y en la verificación de integridad mediante sumas SHA-256 incluidas en el repositorio.

## Capacidades

- Reranking de textos por relevancia: recibe pares consulta-documento y devuelve puntuaciones de relevancia.
- Integración en pipelines RAG como etapa de reordenación tras la recuperación vectorial.
- Ejecución en NPU Rockchip RK1820 y RK1828 con 8 núcleos.
- Compatible con endpoints (tag `endpoints_compatible`) según los metadatos del repositorio.
- Capacidades generativas, tool calling, agentes, visión, audio o modo thinking: no disponibles (el artefacto es exclusivamente un reranker).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- RAG en dispositivos de borde: reordenar los documentos recuperados por un índice vectorial local antes de pasarlos al LLM generador, aprovechando la NPU RK1820/RK1828 para no depender de GPU.
- Asistentes locales embebidos: integrar el reranker en un asistente que corre íntegramente en hardware Rockchip, mejorando la precisión de las respuestas sin salir del dispositivo.
- Búsqueda semántica en gateways o routers: filtrar y ordenar resultados de búsqueda en tiempo real en equipos de red con NPU, con contexto de 2048 tokens suficiente para fragmentos cortos.
- Sistemas de documentación técnica offline: indexar manuales y reordenar fragmentos relevantes en un dispositivo de bajo consumo para consulta sin conexión.
- Clasificación de relevancia en pipelines de datos: puntuar pares consulta-documento para curar o filtrar datasets antes de entrenar otros modelos.
- Despliegue de bajo consumo en producción: sustituir un reranker en GPU por esta versión RKNN cuando el objetivo sea reducir coste energético y latencia en el dispositivo, aceptando el límite de 2048 tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- NPU compatible: Rockchip RK1820 y RK1828 (obligatorio; no es un modelo para GPU convencional).
- Runtime: RKNN Runtime v1.1.0 con driver coincidente; verificar la versión en el dispositivo con `rknn-smi -v` antes de ejecutar.
- VRAM estimada para GPU: no aplica; el artefacto está compilado para NPU Rockchip.
- Cabe en GPU consumer: no disponible (el formato RKNN no está pensado para GPUs NVIDIA/AMD).
- Opciones de despliegue: RKNN Runtime sobre RK1820/RK1828; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.
- Tamaño del repositorio: 0,6 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| RK182X-EMBEDDING-Qwen3-Reranker-0.6B | 0,6 B | 2048 tokens | RKNN | Apache 2.0 | NPU Rockchip RK1820/RK1828 |
| Qwen3-Reranker-0.6B (original) | 0,6 B | no disponible en esta ficha | safetensors (formato original) | Apache 2.0 | GPU/CPU |
| Alternativas de reranking en formato GGUF | no disponible | no disponible | GGUF | no disponible | CPU/GPU |

La comparación directa con otros rerankers de tamaño similar no está disponible en la información proporcionada; la diferencia principal frente al modelo original es el formato y el hardware objetivo, no la arquitectura ni los pesos.

## Limitaciones y advertencias

- Solo funciona en NPU Rockchip RK1820 y RK1828; no es desplegable en GPU o CPU convencionales sin reconversión.
- Contexto limitado a 2048 tokens, lo que restringe el tamaño de los documentos que se pueden puntuar en una sola pasada.
- Requiere RKNN Runtime y driver coincidentes (v1.1.0); las librerías de runtime no se incluyen en el paquete.
- Los archivos de una configuración deben usarse conjuntamente; mezclar versiones puede romper la ejecución.
- Es un artefacto derivado, no los pesos originales: está sujeto a la licencia Apache 2.0 del modelo base y a las licencias de RKNN Toolkit y RKNN Runtime.
- Riesgo de alucinación y sesgos: no documentados en la información disponible para el modelo base ni para esta conversión.
- Idiomas soportados: no disponibles; conviene validar el rendimiento en castellano antes de usarlo en producción.
- Repositorio sin descargas ni likes en el momento de la consulta: madurez y soporte comunitario limitados.

## Enlaces

- Hugging Face: https://huggingface.co/UGREENDEV/RK182X-EMBEDDING-Qwen3-Reranker-0.6B
- Modelo base: https://huggingface.co/Qwen/Qwen3-Reranker-0.6B
- Descarga vía ModelScope: `modelscope download --model UGREENDEV/RK182X-EMBEDDING-Qwen3-Reranker-0.6B --revision master`
- Descarga vía Hugging Face: `hf download UGREENDEV/RK182X-EMBEDDING-Qwen3-Reranker-0.6B --revision v1.1.0`
- Documentación de configuración: subdirectorio `Qwen3-Reranker-0.6B-w4a16-8-2048/README.md` del repositorio
- Verificación de integridad: `SHA256SUMS` en el subdirectorio de configuración
