# UGREENDEV/RK182X-VLM-Qwen3.5-0.8B

## Resumen

RK182X-VLM-Qwen3.5-0.8B es una conversión al formato RKNN de un modelo de visión-lenguaje (VLM) derivado de Qwen/Qwen3.5-0.8B, publicada por UGREENDEV. No se trata de un modelo entrenado desde cero, sino de una cuantización y empaquetado específico para su ejecución sobre la NPU integrada en el chip Rockchip RK1828, con runtime RKNN v1.1.0. El objetivo es permitir inferencia multimodal (imagen-texto a texto) en hardware de borde de bajo consumo, fuera del ecosistema habitual de GPU.

El repositorio ofrece dos configuraciones precompiladas que difieren en la longitud de contexto y el formato del KVCache: una con 163.328 tokens (159,5k) y KVCache en int4, y otra con 78.848 tokens (77k) y KVCache en fp16. Ambas usan resolución de visión de 384x384 y cuantización w4a16 tanto para la torre de visión como para el LLM, distribuida sobre 8 núcleos NPU en cada caso. Los pesos se publican en formato RKNN junto con el manifiesto config.json y sumas de verificación SHA-256.

La relevancia de esta ficha radica en que documenta un caso poco habitual: un VLM de aproximadamente 0,8 mil millones de parámetros optimizado para NPU de borde, con licencia Apache 2.0 heredada del modelo base. Es útil para quienes despliegan IA multimodal en dispositivos Rockchip y necesitan conocer las restricciones reales de contexto, cuantización y compatibilidad de hardware.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (VLM) convertido a RKNN; arquitectura interna del modelo base no detallada en la información disponible |
| Parámetros totales | aproximadamente 0,8 mil millones (según nombre del modelo base Qwen3.5-0.8B; cifra exacta no disponible) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 163.328 tokens (configuración kv-int4) o 78.848 tokens (configuración fp16) |
| Tipos de cuantización | Visión: w4a16; LLM: w4a16; KVCache: int4 o fp16 según configuración |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (modelo base); aplican también los términos de RKNN Toolkit y RKNN Runtime |
| Formato de pesos | RKNN (runtime v1.1.0), con config.json y SHA256SUMS por configuración |

## Arquitectura y entrenamiento

El modelo es una conversión del VLM Qwen/Qwen3.5-0.8B al formato RKNN, orientada a la NPU del chip Rockchip RK1828. La información disponible no detalla la arquitectura interna del modelo base (tipo de atención, composición de la torre de visión, etc.), más allá de que se trata de un modelo de pipeline image-text-to-text. La conversión aplica cuantización w4a16 a la torre de visión y al LLM, y ofrece dos variantes de KVCache: int4 (que permite 163.328 tokens de contexto) y fp16 (limitada a 78.848 tokens).

No se proporcionan datos sobre el entrenamiento del modelo base: número de tokens, composición del dataset, uso de RLHF/DPO u otras técnicas de alineación. Tampoco se documentan innovaciones técnicas propias de esta conversión más allá del empaquetado RKNN, la distribución en 8 núcleos NPU y la verificación por SHA-256. La resolución de entrada de visión está fijada en 384x384.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text), según el pipeline declarado.
- Procesamiento multimodal de imágenes a resolución 384x384.
- Conversación multi-turno (tag `conversational`).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales (thinking mode, audio, etc.): no disponibles.

## Casos de uso

- Inspección visual en dispositivos de borde: desplegar el modelo en un equipo con RK1828 para describir o etiquetar imágenes capturadas por una cámara local, aprovechando la ejecución sobre NPU de bajo consumo.
- Asistencia en kioscos o paneles interactivos: conversaciones multi-turno con entrada de imagen y texto, con contexto de hasta 159,5k tokens en la configuración kv-int4 para mantener historiales largos.
- Procesamiento documental ligero: extracción de información de capturas o documentos escaneados a 384x384, integrado en un flujo local sin dependencia de la nube.
- Automatización industrial con verificación visual: clasificación o descripción de imágenes de sensores en entornos Rockchip, donde el formato RKNN y la NPU reducen el consumo energético.
- Prototipado de aplicaciones VLM en hardware embebido: usar el repositorio como base para validar pipelines image-text-to-text antes de escalar a modelos mayores.
- Despliegue con integridad verificable: el uso de SHA256SUMS permite validar los artefactos antes de instalarlos en producción, útil en entornos con requisitos de cadena de suministro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Chip soportado: Rockchip RK1828 (etiqueta RK182X).
- Runtime: RKNN Runtime v1.1.0, con driver correspondiente; verificar en dispositivo con `rknn-smi -v`.
- NPU: 8 núcleos para visión y 8 para LLM en ambas configuraciones.
- VRAM estimada para GPU: no aplica; el modelo está empaquetado para NPU RKNN, no para GPU convencional.
- GPU recomendadas (A100, H100, RTX 4090): no disponibles; el formato RKNN no está pensado para estas plataformas.
- Despliegue con vLLM, llama.cpp, Ollama o TGI: no disponible; el repositorio solo documenta ejecución mediante RKNN Runtime.
- Latencia y throughput: no disponibles.
- Tamaño del repositorio: 1,2 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RK182X-VLM-Qwen3.5-0.8B | ~0,8B | 163.328 / 78.848 tokens | RKNN | Apache 2.0 | Hugging Face, ModelScope |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | no disponible | safetensors (presumible) | Apache 2.0 | Hugging Face |
| Otros VLM de ~1B para borde | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con alternativas de la misma categoría (VLM de ~1B para NPU de borde) no está disponible en la información proporcionada. El único punto de referencia documentado es el modelo base Qwen3.5-0.8B, del que esta publicación es una cuantización.

## Limitaciones y advertencias

- Compatibilidad restringida al chip RK1828; no funciona en otras plataformas sin reconversión.
- Requiere RKNN Runtime v1.1.0 y el driver correspondiente; versiones distintas pueden fallar.
- Los archivos de una configuración deben usarse conjuntamente; mezclar configuraciones no está soportado.
- La resolución de visión está fijada en 384x384, lo que limita el detalle en imágenes grandes o texto pequeño.
- La configuración con KVCache int4 alcanza mayor contexto pero puede degradar la precisión frente a fp16.
- No se documentan idiomas soportados, sesgos ni tasas de alucinación del modelo base.
- Licencia Apache 2.0 para el modelo base, pero se aplican además los términos de RKNN Toolkit y RKNN Runtime, que deben revisarse para uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/UGREENDEV/RK182X-VLM-Qwen3.5-0.8B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- ModelScope (descarga alternativa): comando `modelscope download --model UGREENDEV/RK182X-VLM-Qwen3.5-0.8B`
- Documentación de configuración: subdirectorios `Qwen3.5-0.8B-384x384-w4a16-8-163328-kv-int4/README.md` y `Qwen3.5-0.8B-384x384-w4a16-8-78848/README.md` dentro del repositorio.
