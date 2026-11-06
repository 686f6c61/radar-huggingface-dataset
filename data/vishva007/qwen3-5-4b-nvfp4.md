# Vishva007/Qwen3.5-4B-NVFP4

## Resumen

Vishva007/Qwen3.5-4B-NVFP4 es una versión cuantizada a NVFP4 (pesos de 4 bits, activaciones de 16 bits) del modelo multimodal Qwen/Qwen3.5-4B, publicada por el usuario Vishva007. La cuantización se ha realizado con AutoRound, el método de descenso de gradiente por signo desarrollado por Intel, y se ha exportado en formato `compressed-tensors` (variante `llm_compressor`). El resultado es un checkpoint de 4.539.265.536 parámetros totales (no es un modelo MoE) que conserva la torre visual y los módulos de atención lineal y MTP en bfloat16 nativo.

El modelo base Qwen3.5-4B es un transformer multimodal de la familia Qwen, orientado a generación de texto, razonamiento y comprensión de imagen y texto (pipeline `image-text-to-text`). Esta versión cuantizada mantiene la licencia Apache 2.0 del original y está pensada para despliegue en producción con vLLM, incluyendo tool calling, decodificación especulativa mediante Multi-Token Prediction (MTP) y procesamiento multimodal con hasta 50 imágenes por prompt.

Su relevancia actual radica en que reduce el coste de memoria y el ancho de banda de pesos de un modelo de 4B multimodal sin degradar los módulos críticos (visión, atención lineal y capas MTP) gracias a una política selectiva de capas en BF16. No obstante, la model card no documenta resultados de benchmarks ni la composición del dataset de calibración más allá de los parámetros del proceso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5), con atención lineal, torre visual y capas MTP; cuantización NVFP4 W4A16 |
| Parametros totales | 4.539.265.536 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card; el ejemplo de despliegue usa `--max-model-len 18000` y `max_length` 65536 en el procesador multimodal |
| Tipos de cuantizacion | NVFP4 (W4A16): pesos FP4 con group size 16 y simétrico; activaciones en 16 bits; torre visual y módulos `linear_attn`, `mtp`, `mtp.fc` en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con `compressed-tensors` / `llm_compressor`; tag de 8-bit en Hugging Face |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint Qwen/Qwen3.5-4B, un transformer multimodal con torre visual (`visual` / `quant_nontext_module`), mecanismos de atención lineal (`linear_attn`) y capas de Multi-Token Prediction (`mtp`, `mtp.fc`). La cuantización se aplica solo a los módulos de texto: los pesos se convierten a FP4 micro-escalado con group size 16 y esquema simétrico, mientras que las activaciones permanecen en 16 bits para preservar la fidelidad numérica. La torre visual se mantiene íntegra en BF16 para no degradar razonamiento visual ni OCR, y las capas `linear_attn`, `mtp` y `mtp.fc` se conservan en bfloat16 nativo para evitar regresiones en atención y decodificación especulativa.

El proceso de AutoRound se ejecutó con 1200 iteraciones, 512 muestras de calibración, batch size 8 y longitud de secuencia 2048, con `torch.compile` desactivado. No se documenta en la información disponible el volumen de tokens de preentrenamiento del modelo base, la composición del dataset, ni si hubo etapas de RLHF o DPO. La innovación técnica destacable es la preservación de los pesos nativos de MTP durante la cuantización, lo que permite usar decodificación especulativa con vLLM sin un modelo borrador separado.

## Capacidades

- Generación de texto y razonamiento conversacional, con soporte de modo thinking controlable mediante `enable_thinking` en la plantilla de chat.
- Comprensión de imagen y texto (pipeline `image-text-to-text`), con torre visual en BF16 y soporte de OCR y razonamiento visual.
- Tool calling y function calling, con parser `qwen3_coder` en vLLM y `--enable-auto-tool-choice`.
- Razonamiento multi-paso y uso en agentes, apoyado por tool calling y contexto de hasta 18.000 tokens en la configuración de ejemplo.
- Decodificación especulativa mediante MTP, con 1 a 3 tokens especulativos configurables.
- Procesamiento multimodal por prompt con hasta 50 imágenes y `max_pixels` de 10.485.760.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Atención al cliente multimodal: el modelo puede gestionar conversaciones multi-turno con imágenes adjuntas (capturas, fotos de producto) y contexto de hasta 18.000 tokens en la configuración de vLLM, manteniendo la torre visual en BF16 para interpretar el contenido gráfico.
- Extracción de datos de documentos con OCR: al conservar la torre visual en BF16 y aceptar hasta 50 imágenes por prompt, es adecuado para digitalizar facturas, formularios o tickets en lotes dentro de una misma petición.
- Asistentes de código con tool calling: el parser `qwen3_coder` y `--enable-auto-tool-choice` permiten integrarlo en pipelines de CI/CD o IDE como agente que invoca herramientas de compilación, tests o búsqueda en repositorios.
- Despliegue económico en GPUs de gama media: la cuantización W4A16 reduce el peso de los pesos a 4 bits, lo que permite servir un modelo de 4B multimodal con menor VRAM que la versión BF16, usando `--kv-cache-dtype fp8` para recortar además la caché KV.
- Inferencia de baja latencia con decodificación especulativa: la preservación de las capas MTP permite activar `--speculative-config '{"num_speculative_tokens": 3, "method": "mtp"}'` y acelerar el throughput en cargas de generación larga.
- Procesamiento por lotes de imágenes y texto: con `--max-num-seqs 128`, `--enable-chunked-prefill` y `--enable-prefix-caching`, encaja en servicios de clasificación o descripción masiva de imágenes con prompts compartidos.
- Agentes de razonamiento con modo thinking: la plantilla permite activar o desactivar `enable_thinking` según el caso, útil para tareas de análisis que requieren cadena de razonamiento y para respuestas rápidas que no la necesitan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repo ocupa 21,4 GB, aunque el peso efectivo en FP4 con group size 16 es sustancialmente menor; el ejemplo de servicio de la model card usa `--gpu-memory-utilization 0.90` sin indicar GPU concreta.
- GPU recomendadas: no disponibles en la información proporcionada. El ejemplo de despliegue está pensado para vLLM con CUDA 12.6, 13.0 o 13.2 según las plantillas de RunPod del autor.
- GPU de consumo: no se confirma compatibilidad con GPUs consumer en la información disponible; la cuantización NVFP4 y el backend vLLM con `compressed-tensors` condicionan el hardware soportado.
- Opciones de despliegue: vLLM es el backend documentado, con `--trust-remote-code`, `--dtype bfloat16`, `--kv-cache-dtype fp8`, `--enable-prefix-caching`, `--enable-chunked-prefill`, `--max-num-batched-tokens 18000`, `--max-num-seqs 128`, `--limit-mm-per-prompt '{"image": 50}'`, `--mm-processor-cache-type shm` y decodificación especulativa MTP. No se documentan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card solo indica que MTP acelera el throughput y que `num_speculative_tokens` puede ajustarse entre 1 y 3 según contexto y hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vishva007/Qwen3.5-4B-NVFP4 | 4.539.265.536 | No disponible (ejemplo con 18.000 tokens) | NVFP4 W4A16, group size 16 | Apache 2.0 | Hugging Face, 122 descargas |
| Qwen/Qwen3.5-4B | No disponible en la información | No disponible | BF16 nativo | Apache 2.0 | Hugging Face (modelo base) |
| Vishva007/Qwen3.5-4B-W4A16-AutoRound-NVFP4 | No disponible | No disponible | W4A16 AutoRound NVFP4 | No disponible | Hugging Face (variante del mismo autor) |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks que cuantifiquen la pérdida de precisión frente al modelo base Qwen/Qwen3.5-4B.
- La cuantización NVFP4 requiere backends compatibles con `compressed-tensors`; no se documenta soporte en llama.cpp, Ollama o TGI.
- El modo thinking viene desactivado por defecto en el ejemplo de despliegue (`enable_thinking: false`); su activación cambia el perfil de latencia y tokens generados.
- Los idiomas soportados no están documentados, por lo que no se puede garantizar cobertura multilingüe más allá de la del modelo base.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan evaluaciones de fidelidad ni de sesgos.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del checkpoint cuantizado en producción.
- El repositorio incluye enlaces de afiliado a RunPod en la model card; conviene revisar su contenido antes de seguir las instrucciones de despliegue.
- El tag de Hugging Face indica "8-bit" pese a que la cuantización descrita es W4A16; conviene verificar la configuración real de `compressed-tensors` antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vishva007/Qwen3.5-4B-NVFP4
- Variante W4A16 AutoRound NVFP4 del mismo autor: https://huggingface.co/Vishva007/Qwen3.5-4B-W4A16-AutoRound-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- AutoRound (Intel): https://github.com/intel/auto-round
- RunPod (enlace de afiliado incluido en la model card): https://runpod.io?ref=iabrlp7z
