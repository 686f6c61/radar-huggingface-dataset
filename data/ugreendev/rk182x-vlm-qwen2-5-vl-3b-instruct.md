# UGREENDEV/RK182X-VLM-Qwen2.5-VL-3B-Instruct

## Resumen

RK182X-VLM-Qwen2.5-VL-3B-Instruct es una conversión a formato RKNN del modelo multimodal Qwen2.5-VL-3B-Instruct, publicada por UGREENDEV para su ejecución sobre la NPU Rockchip RK1828. No se trata de un modelo entrenado desde cero, sino de una versión cuantizada y empaquetada del VLM de 3B parámetros de Alibaba Qwen, adaptada al runtime RKNN v1.1.0 y etiquetada con el chip RK182X. El repositorio incluye dos configuraciones de despliegue diferenciadas por resolución de visión, cuantización y longitud de contexto.

El modelo resuelve el problema de llevar inferencia visión-lenguaje a hardware embebido de bajo consumo basado en NPU Rockchip, algo que los pesos originales en safetensors no permiten directamente. La conversión aplica cuantización w4a16 tanto a la torre de visión como al LLM, con resolución de imagen fija de 392x392 y 8 núcleos NPU asignados a cada componente. La variante principal ofrece 15.360 tokens de contexto con KVCache en fp16, mientras que la variante de contexto extendido llega a 36.864 tokens con KVCache en int4.

Es relevante para desarrolladores que trabajan en dispositivos edge con aceleradores Rockchip, ya que proporciona artefactos listos para desplegar con verificación SHA-256 y descarga reproducible desde Hugging Face y ModelScope. El repo ocupa 3,1 GB y se distribuye bajo licencia Apache 2.0 heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (torre de visión + LLM), convertido a RKNN |
| Parámetros totales | 3B (heredados de Qwen2.5-VL-3B-Instruct) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 15.360 tokens (variante fp16 KV) / 36.864 tokens (variante int4 KV) |
| Tipos de cuantización | w4a16 en visión y LLM; KVCache fp16 o int4 según variante |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (modelo base); se aplican además los términos de RKNN Toolkit y RKNN Runtime |
| Formato de pesos | RKNN (runtime v1.1.0); no incluye safetensors ni GGUF del modelo original |
| Resolución de visión | 392x392 fija |
| Núcleos NPU | 8 para visión, 8 para LLM |
| Chips soportados | RK1828 (etiqueta RK182X) |
| Versión de runtime | RKNN Runtime v1.1.0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-VL-3B-Instruct: un transformer multimodal compuesto por un codificador de visión y un modelo de lenguaje, con capacidad de razonamiento sobre imágenes y texto. Sobre esa base, UGREENDEV no realiza entrenamiento adicional, sino una conversión y cuantización a RKNN para la NPU RK1828. La torre de visión se procesa a una resolución fija de 392x392 píxeles, y tanto visión como LLM se cuantizan a w4a16 (pesos en 4 bits, activaciones en 16 bits), lo que reduce la huella de memoria a costa de cierta pérdida de precisión frente a los pesos originales.

El repositorio ofrece dos configuraciones: una con KVCache en fp16 y contexto de 15.360 tokens, y otra con KVCache en int4 que extiende el contexto a 36.864 tokens. No se documentan en la información disponible detalles sobre el dataset de entrenamiento original, el número de tokens vistos ni si hubo RLHF o DPO; esos datos corresponden a la model card de Qwen2.5-VL-3B-Instruct y no se reproducen aquí. La innovación técnica destacable es el propio pipeline de conversión a RKNN con cuantización w4a16 y gestión de KVCache, junto con la verificación de integridad mediante SHA-256.

## Capacidades

- Generación de texto e inferencia imagen-texto (pipeline image-text-to-text).
- Comprensión de imágenes a resolución fija de 392x392, incluyendo descripción y respuesta a preguntas visuales.
- Conversación multi-turno (tag conversational), con contexto de hasta 15.360 o 36.864 tokens según variante.
- Razonamiento sobre contenido visual y textual combinado, heredado del modelo base Qwen2.5-VL.
- Capacidades multilingües: no disponibles en la información proporcionada (el modelo base Qwen2.5-VL soporta varios idiomas, pero la ficha no lo confirma para esta conversión).
- Tool calling y function calling: no disponible en la información proporcionada para esta conversión RKNN.
- Modo thinking, audio o vídeo: no disponible.

## Casos de uso

- Inspección visual en dispositivos edge: el modelo puede procesar imágenes de 392x392 capturadas por cámaras conectadas a un SoC con NPU RK1828 y generar descripciones o respuestas, sin necesidad de enviar datos a la nube.
- Asistencia en campo con hardware embebido: un técnico puede fotografiar un equipo o etiqueta y consultar al modelo en local, aprovechando los 15k tokens de contexto para mantener el historial de la conversación.
- Moderación o clasificación de imágenes en producción: integrado en un pipeline sobre RK1828, permite etiquetar o filtrar contenido visual con latencia local y sin dependencia de red.
- Documentación de productos con contexto largo: la variante de 36.864 tokens permite analizar varias imágenes y textos extensos en una sola sesión, útil para generar fichas o resúmenes a partir de capturas.
- Prototipado de asistentes multimodales en robótica de bajo consumo: el modelo cabe en la NPU del chip y puede gestionar interacciones conversacionales con entrada visual en tiempo real.
- Validación de despliegues en laboratorio: los checksums SHA-256 y el manifiesto config.json permiten verificar la integridad de los artefactos antes de flashear el dispositivo, adecuado para entornos de QA de firmware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- NPU: Rockchip RK1828 (etiqueta RK182X), único chip soportado según la model card.
- Runtime: RKNN Runtime v1.1.0 con driver correspondiente; verificar con `rknn-smi -v` antes de ejecutar.
- Núcleos NPU: 8 para la torre de visión y 8 para el LLM.
- Memoria: no se especifica VRAM/RAM estimada; el repo completo ocupa 3,1 GB, pero la huella en ejecución depende de la variante (KVCache fp16 vs int4) y no está documentada.
- GPU de escritorio (A100, H100, RTX 4090): no aplicable; el modelo está empaquetado para NPU Rockchip, no para CUDA.
- Despliegue: RKNN Runtime v1.1.0; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Hardware | Licencia |
|---|---|---|---|---|---|
| RK182X-VLM-Qwen2.5-VL-3B-Instruct (este) | 3B | 15k / 36k | RKNN | NPU RK1828 | Apache 2.0 |
| Qwen/Qwen2.5-VL-3B-Instruct (base) | 3B | no disponible en esta ficha | safetensors | GPU/CPU | Apache 2.0 |
| Otros VLM de ~3B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con alternativas de la misma categoría (VLM de 3B para edge) no está disponible en la información proporcionada. El único punto de referencia fiable es el modelo base Qwen2.5-VL-3B-Instruct, del que esta conversión hereda arquitectura y capacidades, pero no se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Solo funciona en chips RK1828; no es portable a GPU, CPU genérica ni otros aceleradores sin reconversión.
- Requiere RKNN Runtime v1.1.0 y driver compatible; una versión distinta puede provocar fallos de ejecución.
- Resolución de visión fija de 392x392, lo que limita la lectura de textos pequeños o detalles finos en imágenes.
- Cuantización w4a16 en visión y LLM: puede degradar la precisión respecto al modelo original en tareas sensibles.
- La variante de contexto extendido usa KVCache int4, con posible pérdida adicional de calidad en conversaciones largas.
- Idiomas soportados no documentados en esta conversión; no asumir el multilingüismo del modelo base sin verificación.
- Riesgo de alucinación inherente al modelo base; no se documentan mitigaciones específicas.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia Apache 2.0 para el modelo, pero se aplican además los términos de RKNN Toolkit y RKNN Runtime, que pueden restringir el uso comercial del artefacto empaquetado.
- Verificar siempre los checksums SHA-256 antes de desplegar; la model card lo indica explícitamente.

## Enlaces

- Hugging Face: https://huggingface.co/UGREENDEV/RK182X-VLM-Qwen2.5-VL-3B-Instruct
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Descarga vía ModelScope: `modelscope download --model UGREENDEV/RK182X-VLM-Qwen2.5-VL-3B-Instruct --revision master`
