# UGREENDEV/RK1828-LLM-Qwen2.5-7B-Instruct

## Resumen

RK1828-LLM-Qwen2.5-7B-Instruct es una conversión al formato RKNN del modelo Qwen2.5-7B-Instruct de Alibaba Qwen, publicada por UGREENDEV para su ejecución sobre la NPU del chip Rockchip RK1828. No se trata de un modelo nuevo ni de un fine-tuning: es un derivado cuantizado del checkpoint original, empaquetado con el runtime RKNN v1.1.0 y orientado a despliegue en dispositivos con aceleración NPU de Rockchip. El repositorio ocupa 5,4 GB e incluye una única configuración publicada.

La relevancia de esta ficha es acotada y muy específica: sirve a desarrolladores que quieran ejecutar un modelo de 7B en hardware embebido RK1828 sin pasar por el proceso de conversión y cuantización con RKNN Toolkit. El modelo hereda la arquitectura transformer decoder-only de Qwen2.5 y su licencia Apache 2.0, pero pierde parte de las capacidades del original por las limitaciones del runtime y del contexto reducido.

Conviene subrayar que el contexto declarado en esta conversión es de 5120 tokens, muy inferior a los 32768 tokens del Qwen2.5-7B-Instruct original, y que la cuantización aplicada es w4a16 (pesos en 4 bits, activaciones en 16 bits) distribuida sobre 8 núcleos NPU con KVCache en fp16. El modelo está pensado exclusivamente para inferencia en el chip RK1828.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-7B-Instruct), convertida a RKNN |
| Parámetros totales | 7B (modelo base Qwen2.5-7B-Instruct) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 5120 tokens en esta configuración RKNN |
| Tipos de cuantización | w4a16 (pesos 4 bits, activaciones 16 bits); KVCache en fp16 |
| Idiomas soportados | no disponible (heredados del modelo base, sin listado explícito en el repo) |
| Licencia | Apache 2.0 (modelo base); se aplican además los términos de licencia de RKNN Toolkit y RKNN Runtime |
| Formato de pesos | RKNN (runtime v1.1.0); no se publican safetensors ni GGUF en esta conversión |
| Núcleos NPU | 8 |
| Chip soportado | RK1828 |
| Versión de runtime | RKNN Runtime v1.1.0 |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-7B-Instruct, un transformer decoder-only denso de 7 mil millones de parámetros desarrollado por Alibaba Qwen. Esta publicación no aporta información sobre el entrenamiento original: no se detallan tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO. Toda esa información debe consultarse en la model card del modelo base.

La contribución de este repositorio es exclusivamente de despliegue: conversión del checkpoint a RKNN, cuantización w4a16 con reparto en 8 núcleos NPU y empaquetado con checksums SHA-256 para verificación de integridad. No se documentan innovaciones arquitectónicas propias ni cambios en el grafo más allá de los necesarios para la compilación con RKNN Toolkit. El repositorio incluye un directorio de configuración (`Qwen2.5-7B-Instruct-w4a16-8-5120`) con `config.json`, manifiesto de ficheros y `SHA256SUMS`.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones en formato chat (el checkpoint base es Instruct).
- Generación de código y matemáticas, en la medida en que el modelo base las soporta; no hay evaluación específica publicada para esta conversión.
- Soporte multilingüe heredado del modelo base; el repositorio no enumera idiomas.
- Tool calling y function calling: capacidad del modelo base, pero no verificada ni documentada en esta conversión RKNN.
- Modo thinking: no disponible.
- Visión y audio: no disponibles (el modelo base es solo texto).

## Casos de uso

- Inferencia en dispositivos embebidos con NPU RK1828: el caso principal y prácticamente el único documentado. Permite ejecutar un 7B cuantizado en hardware Rockchip sin montar una GPU.
- Asistentes conversacionales locales en electrónica de consumo: el modelo cabe en 5,4 GB de repositorio y usa KVCache fp16, lo que lo hace viable en dispositivos con memoria limitada y contexto de hasta 5120 tokens.
- Procesamiento de lenguaje natural en el borde (edge): clasificación, resumen y extracción de información sobre textos de hasta 5k tokens sin salir del dispositivo.
- Prototipado de pipelines de generación de texto sobre RKNN Runtime: útil para validar latencia y throughput antes de comprometerse con hardware.
- Sustitución de modelos más pequeños en productos UGREEN/Rockchip que ya integren RK1828 y quieran subir de calidad manteniendo el mismo runtime.
- Verificación de integridad en despliegues: el repositorio incluye `SHA256SUMS` para validar los ficheros antes de desplegar en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni comparativas de latencia o throughput. Tampoco se documenta el impacto de la cuantización w4a16 en la calidad respecto al modelo base.

## Requisitos de hardware

- Chip: exclusivamente RK1828 (NPU de Rockchip). No hay soporte documentado para GPU, CPU genérica ni otros aceleradores.
- Runtime: RKNN Runtime v1.1.0 y driver correspondiente; verificar con `rknn-smi -v` en el dispositivo antes de ejecutar.
- VRAM: no aplica; el modelo se ejecuta sobre la NPU y la memoria del SoC. El repositorio ocupa 5,4 GB.
- GPU recomendadas: no aplica; este paquete no está pensado para A100, H100 ni RTX 4090.
- Consumer GPU: no; no es desplegable en GPUs de consumo con este formato.
- Opciones de despliegue: RKNN Runtime v1.1.0 sobre RK1828. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Hardware |
|---|---|---|---|---|---|
| RK1828-LLM-Qwen2.5-7B-Instruct (esta ficha) | 7B | 5120 | RKNN (w4a16) | Apache 2.0 | NPU RK1828 |
| Qwen/Qwen2.5-7B-Instruct | 7B | 32768 | safetensors | Apache 2.0 | GPU/CPU |
| Conversiones GGUF de Qwen2.5-7B-Instruct | 7B | 32768 (según quant) | GGUF | Apache 2.0 | CPU/GPU (llama.cpp) |

La comparación relevante es contra el modelo base: esta conversión reduce el contexto de 32768 a 5120 tokens y restringe el hardware a RK1828, a cambio de permitir inferencia en NPU embebida. Frente a conversiones GGUF, la diferencia es el backend: GGUF apunta a llama.cpp sobre CPU/GPU, mientras que este paquete solo funciona con RKNN Runtime.

## Limitaciones y advertencias

- Hardware cerrado: solo funciona en RK1828 con RKNN Runtime v1.1.0; no es portable a otras plataformas.
- Contexto reducido: 5120 tokens frente a los 32768 del modelo base, lo que limita casos de contexto largo.
- Calidad tras cuantización w4a16 no evaluada: no hay benchmarks que cuantifiquen la degradación respecto al modelo original.
- Idiomas no documentados en el repositorio; deben inferirse del modelo base.
- Riesgo de alucinación: inherente al modelo base, no mitigado ni evaluado en esta conversión.
- Licencia: Apache 2.0 en el modelo base, pero se aplican además los términos de RKNN Toolkit y RKNN Runtime, que pueden imponer restricciones adicionales al despliegue comercial.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.
- Requiere verificación SHA-256 antes del despliegue; el autor lo indica explícitamente.
- No se documentan capacidades de tool calling ni agentes verificadas en esta conversión.

## Enlaces

- Hugging Face: https://huggingface.co/UGREENDEV/RK1828-LLM-Qwen2.5-7B-Instruct
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Descarga vía ModelScope: `modelscope download --model UGREENDEV/RK1828-LLM-Qwen2.5-7B-Instruct --revision master`
- Descarga vía Hugging Face CLI: `hf download UGREENDEV/RK1828-LLM-Qwen2.5-7B-Instruct --revision v1.1.0`
