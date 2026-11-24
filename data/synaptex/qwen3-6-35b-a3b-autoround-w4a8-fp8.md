# synaptex/Qwen3.6-35B-A3B-AutoRound-W4A8-FP8

## Resumen

Qwen3.6-35B-A3B-AutoRound-W4A8-FP8 es una cuantización de 4 bits del modelo mixto de expertos Qwen/Qwen3.6-35B-A3B, publicada por el usuario synaptex bajo el proyecto Santify. El modelo base, desarrollado por el equipo Qwen de Alibaba, emplea una arquitectura MoE con 35 mil millones de parámetros totales y 3 mil millones activos por token (256 expertos, 8 activos por token), e incorpora una torre de visión que lo habilita para tareas image-text-to-text. Esta versión cuantizada reduce el peso del repositorio a 21,5 GB y está pensada para servir el modelo en vLLM con activaciones en FP8.

El interés de esta ficha radica en que no es una cuantización genérica: el proceso de AutoRound se ha ajustado específicamente para el kernel W4A8-FP8 de vLLM, cuantizando la entrada de cada capa a fp8 (e4m3, escala por token) durante la calibración para que coincida con lo que ocurre en inferencia. Además, se preservan en mayor precisión las partes sensibles del modelo (cabeza en int8, routers y torre de visión en bf16, borrador MTP en int8) y se incluye decodificación especulativa MTP.

La relevancia actual es doble: por un lado, permite ejecutar un MoE multimodal de 35B con un coste de memoria sustancialmente menor que el modelo original; por otro, el sesgo ruso explícito de la calibración (textos rusos dominantes, OCR de documentos, llamadas a herramientas) lo convierte en una opción atractiva para despliegues en ruso e inglés, aunque con caveats claros para otros idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe) con torre de visión y decodificación especulativa MTP |
| Parametros totales | 19.143.149.424 (según safetensors del repo cuantizado); el modelo base se describe como 35B |
| Parametros activos | 3B por token (256 expertos, 8 activos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A8-FP8: cuerpo int4 simétrico grupo 128 con escalas bf16, activaciones fp8 e4m3; cabeza int8 por canal; borrador MTP int8 por grupos; routers y visión en bf16 |
| Idiomas soportados | Ruso (ru) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con compressed-tensors (expertos por capa: `experts.N.gate_proj/up_proj/down_proj`), compatible con vLLM 0.33 y kernels Marlin WNA16 |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 256 expertos y 8 activos por token, lo que da 3B parámetros activos sobre 35B totales. Esta versión añade una torre de visión (pipeline image-text-to-text) y un módulo MTP (multi-token prediction) que actúa como borrador para decodificación especulativa. La cuantización se realizó con AutoRound a través de llm-compressor 0.15 y auto-round 0.16.1: 200 pasos de ajuste con SignRoundV2, selección de paso sobre toda la muestra y ajuste capa por capa del decodificador, manteniendo el enrutamiento de expertos estándar durante la calibración.

La calibración usó 392 secuencias de 2048 tokens (802.816 tokens en total) con una composición deliberadamente sesgada: textos predominantemente rusos, web en inglés, imágenes de documentos con prompt OCR, llamadas a habilidades (tool calling) y respuestas conforme a esquema JSON. Tras el ensamblado se ejecutó una auditoría (`verify_moe.py`) que comprueba que todos los expertos están presentes y empaquetados, que no hay expertos vacíos, que routers y visión quedan sin empaquetar, que la cabeza es int8 y que se cubre el modelo original. No se especifica el número de tokens de entrenamiento del modelo base ni si hubo RLHF/DPO en esta información.

## Capacidades

- Generación de texto conversacional en ruso e inglés.
- Razonamiento y respuesta a preguntas, incluyendo tareas de conocimiento (ruMMLU, ruOpenBookQA, ruWorldTree, MMLU, ARC) según la lista de evaluación del autor.
- Matemáticas y razonamiento numérico (mgsm_ru, GSM8K en la batería de evaluación).
- Comprensión de imágenes y documentos: pipeline image-text-to-text, con calibración específica para OCR de documentos.
- Tool calling / function calling: la calibración incluye llamadas a habilidades y respuestas conforme a esquema JSON.
- Razonamiento agéntico multi-paso: el autor reporta 156 cadenas agénticas en ruso en su conjunto de evaluación.
- Decodificación especulativa MTP con hasta 3 tokens especulativos por paso (configurable en vLLM).
- Capacidades multilingües limitadas a ru y en según los metadatos; no se declaran otros idiomas.

## Casos de uso

- Procesamiento de documentos en ruso con OCR: el modelo puede recibir imágenes de documentos y devolver texto estructurado; la calibración con imágenes de documentos y prompt OCR lo hace especialmente adecuado para digitalización de archivos y extracción de campos.
- Atención al cliente en ruso: conversaciones multi-turno con respuestas en formato JSON y llamadas a herramientas para consultar sistemas internos, gracias a la calibración con tool calling y esquemas JSON.
- Asistentes agénticos multi-paso: cadenas de razonamiento con invocación de funciones, adecuadas para automatizar flujos de trabajo donde el modelo debe decidir qué herramienta usar en cada paso.
- Evaluación educativa automatizada: resolución de preguntas de opción múltiple y problemas matemáticos en ruso (ruMMLU, mgsm_ru), útil para plataformas de formación y test adaptativo.
- Generación de código y respuestas técnicas en inglés: aunque no es su foco principal, el modelo conserva capacidades de texto en inglés calibradas con web en inglés; puede usarse para asistencia de programación en pipelines internos.
- Despliegue en infraestructura con VRAM limitada: al ocupar 21,5 GB en disco y usar W4A8, permite servir un MoE multimodal de 35B en GPUs de 24-48 GB, algo inviable con el modelo en bf16.
- Investigación en cuantización: sirve como referencia reproducible del recetario AutoRound + llm-compressor para MoE multimodales, con scripts de construcción y comparación publicados en el proyecto Santify.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que la comparación "antes/después" sobre ~4.900 tareas con respuesta exacta (ruMMLU, ruOpenBookQA, ruWorldTree, mgsm_ru, GSM8K, ARC, MMLU), 39 tareas laborales, 156 cadenas agénticas en ruso y mediciones de velocidad "está en curso" y que los resultados se añadirán a la model card. No se deben inferir cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 21,5 GB; con caché KV en fp8 y overhead de vLLM, se puede estimar un consumo en torno a 24-32 GB para contextos moderados, aunque el dato exacto no está publicado.
- GPU recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB; en consumer, RTX 4090 24 GB y RTX 5090 32 GB son candidatas si el contexto y el tamaño de lote se mantienen contenidos.
- Cabe en GPU consumer: sí, previsiblemente en RTX 4090 (24 GB) y superiores, aunque con margen ajustado; no se garantiza en GPUs de 16 GB.
- Opciones de despliegue: vLLM 0.33 con `--trust-remote-code`, `--kv-cache-dtype fp8` y `--speculative-config '{"method": "mtp", "num_speculative_tokens": 3}'`. Requiere `VLLM_MARLIN_INPUT_DTYPE=fp8` en el entorno; el plugin Santify `ru_guard` (`_patch_marlin_input_dtype`) mantiene bf16 en cabeza y borrador MTP. Sin esa variable, la entrada va en bf16 y se pierde la ventaja del ajuste para fp8. No se mencionan llama.cpp, Ollama ni TGI como soportados.
- Latencia y throughput: no disponibles; el autor indica que las mediciones de velocidad están en curso.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| synaptex/Qwen3.6-35B-A3B-AutoRound-W4A8-FP8 | 19,1B (repo cuantizado); base 35B | 3B | no disponible | Apache 2.0 | safetensors compressed-tensors, vLLM 0.33 |
| Qwen/Qwen3.6-35B-A3B (base) | 35B | 3B | no disponible | Apache 2.0 | safetensors bf16, vLLM/TGI |
| synaptex/Qwen3.8-27B-AutoRound-W4A8-INT8 | no disponible | no disponible | no disponible | no disponible | safetensors, vLLM (receta de referencia del autor) |

La comparación directa con alternativas de la misma categoría (MoE multimodal de ~30B con licencia permisiva) no está disponible en la información proporcionada. El modelo base es la referencia natural; la versión W4A8-INT8 del propio autor sirve como referencia metodológica, no como alternativa funcional.

## Limitaciones y advertencias

- Idiomas: solo se declaran ru y en; el rendimiento en castellano u otros idiomas no está evaluado y probablemente sea inferior.
- Sesgo de calibración: la muestra está dominada por ruso; el comportamiento en inglés y en tareas no representadas puede degradarse respecto al modelo base.
- Riesgo de alucinación: inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad ni de tasas de alucinación.
- Dependencia de vLLM 0.33 y del plugin Santify: la configuración óptima requiere `VLLM_MARLIN_INPUT_DTYPE=fp8` y el parche `ru_guard`; sin ellos se pierde parte del beneficio de la cuantización.
- Compatibilidad limitada: no se documenta soporte para llama.cpp, Ollama, TGI ni otros runtimes; el formato compressed-tensors con expertos por capa está pensado para vLLM.
- Sin benchmarks publicados: no hay evidencia cuantitativa del impacto de la cuantización en calidad; el autor indica que la evaluación está en curso.
- Uso comercial: la licencia Apache 2.0 lo permite, pero conviene verificar las condiciones del modelo base Qwen3.6-35B-A3B, ya que la licencia del derivado no sustituye a la del original.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; es una publicación reciente (24 de noviembre de 2026) sin validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/synaptex/Qwen3.6-35B-A3B-AutoRound-W4A8-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Receta de referencia del autor (W4A8-INT8): https://huggingface.co/synaptex/Qwen3.8-27B-AutoRound-W4A8-INT8
- Proyecto Santify (scripts en `Docker/LLM/Qwen36-35B-A3B`): no disponible como URL en la información proporcionada
- llm-compressor: no disponible como URL en la información proporcionada
- auto-round: no disponible como URL en la información proporcionada
- vLLM: no disponible como URL en la información proporcionada
