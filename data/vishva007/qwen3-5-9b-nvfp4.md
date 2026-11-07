# Vishva007/Qwen3.5-9B-NVFP4

## Resumen

Vishva007/Qwen3.5-9B-NVFP4 es una versión cuantizada a NVFP4 del modelo multimodal Qwen/Qwen3.5-9B, publicada por el usuario Vishva007. Se trata de una cuantización de pesos a 4 bits (FP4 con micro-escalado y tamaño de grupo 16) manteniendo las activaciones en 16 bits, es decir, un esquema W4A16. La cuantización se ha realizado con AutoRound, el método de descenso de gradiente con signo desarrollado por Intel, y se ha exportado en formato `compressed-tensors` (variante `llm_compressor`).

El modelo base Qwen3.5-9B es un transformer multimodal (texto e imagen) de la familia Qwen, con capacidades de razonamiento, conversación y tool calling. Esta versión cuantizada conserva la torre visual en BF16 y mantiene en bfloat16 nativo los módulos `lm_head`, `linear_attn`, `mtp` y `mtp.fc`, de modo que no se degrada la decodificación especulativa basada en Multi-Token Prediction (MTP) ni los mecanismos de atención.

Su relevancia práctica radica en que reduce el peso de los pesos a 4 bits, lo que facilita el despliegue en GPUs con soporte de FP4 (arquitecturas Blackwell y posteriores) manteniendo las activaciones en 16 bits para preservar la fidelidad numérica. El repositorio tiene 124 descargas y ningún "like" en el momento de la consulta, y el tamaño del repo es de 38,9 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + imagen) del modelo base Qwen3.5-9B; cuantización NVFP4 W4A16 |
| Parametros totales | 7.090.363.888 (según safetensors del repo cuantizado) |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible en la model card; el ejemplo de servicio vLLM usa `--max-model-len 32k` |
| Tipos de cuantizacion | NVFP4 W4A16 (pesos FP4, activaciones 16 bits), grupo 16, simétrico; torre visual en BF16; `lm_head`, `linear_attn`, `mtp` y `mtp.fc` en BF16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con `compressed-tensors` / `llm_compressor` |

## Arquitectura y entrenamiento

El modelo es una cuantización del Qwen3.5-9B, un transformer multimodal que procesa texto e imágenes (pipeline `image-text-to-text`). La cuantización se aplica exclusivamente a los pesos lineales, con un esquema NVFP4 de 4 bits y micro-escalado por grupos de 16 elementos, simétrico, generado con AutoRound durante 1200 iteraciones sobre 512 muestras de calibración, con batch size 8 y longitud de secuencia 4096. Las activaciones permanecen en 16 bits para evitar pérdida de precisión.

Se preservan en BF16 los módulos críticos: la torre visual (`visual` / `quant_nontext_module`), la cabeza de salida (`lm_head`), las capas de atención lineal (`linear_attn`) y las capas de Multi-Token Prediction (`mtp` y `mtp.fc`). Esta decisión busca evitar regresiones en razonamiento visual, OCR, decodificación especulativa y mecanismos de atención. No se dispone de información sobre el dataset de entrenamiento original del modelo base ni sobre si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generación de texto y conversación multi-turno.
- Razonamiento explícito (etiqueta `reasoning` en el repo; el chat template admite `enable_thinking`).
- Comprensión de imágenes y texto (pipeline `image-text-to-text`), con soporte de OCR y razonamiento visual gracias a la torre visual en BF16.
- Tool calling / function calling, con parser `qwen3_coder` en vLLM y `--enable-auto-tool-choice`.
- Decodificación especulativa mediante Multi-Token Prediction (MTP) con pesos draft nativos conservados.
- Procesamiento multimodal con hasta 50 imágenes por prompt en la configuración de ejemplo y `max_pixels` de 10.485.760.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional multimodal: el modelo puede mantener diálogos multi-turno combinando texto e imágenes, adecuado para interfaces de atención al cliente que reciben capturas o documentos escaneados.
- Extracción de datos de documentos (OCR + razonamiento): la torre visual en BF16 y el procesador con `max_pixels` alto permiten procesar imágenes de alta resolución y extraer información estructurada.
- Agentes con tool calling: la integración con vLLM mediante `--enable-auto-tool-choice` y el parser `qwen3_coder` permite construir agentes que invocan APIs y ejecutan flujos multi-paso.
- Generación de código asistida: el soporte de tool calling y el modo thinking permiten integrarlo en pipelines de CI/CD para revisión, generación y corrección de código.
- Despliegue de alto throughput en GPUs Blackwell: la cuantización NVFP4 reduce el peso de los pesos y, junto con MTP, permite servir muchas secuencias concurrentes (el ejemplo usa `--max-num-seqs 128`).
- Razonamiento con contexto largo: con `--max-model-len 32k` y `--enable-prefix-caching` puede emplearse en análisis de documentos largos o conversaciones extensas con caché compartida.
- Prototipado e investigación en cuantización: sirve como referencia para evaluar la retención de precisión de AutoRound NVFP4 frente al modelo base en tareas multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repo ocupa 38,9 GB, aunque parte de ese tamaño corresponde a pesos en BF16 preservados (torre visual, `lm_head`, `linear_attn`, `mtp`). El peso efectivo de los pesos cuantizados a 4 bits es aproximadamente la mitad que en BF16 para los módulos cuantizados.
- GPUs recomendadas: se requiere hardware con soporte de FP4 para aprovechar la cuantización, es decir, arquitecturas Blackwell (por ejemplo, B200) o posteriores. En GPUs sin soporte nativo de FP4 la ventaja de rendimiento se pierde.
- GPU de consumo: no disponible; la información no confirma compatibilidad con RTX 4090 u otras GPUs consumer.
- Despliegue: vLLM es el backend documentado por el autor, con flags para tool calling, MTP, caché KV en FP8, prefix caching y chunked prefill. No se documentan opciones para llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; el autor no publica cifras. La configuración de ejemplo sugiere servir con `--gpu-memory-utilization 0.90`, `--max-num-batched-tokens 18k` y `--max-num-seqs 128`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vishva007/Qwen3.5-9B-NVFP4 | 7.090.363.888 | no disponible (ejemplo vLLM: 32k) | NVFP4 W4A16 | apache-2.0 | Hugging Face (124 descargas) |
| Qwen/Qwen3.5-9B | no disponible | no disponible | BF16 (original) | apache-2.0 | Hugging Face (modelo base) |
| Vishva007/Qwen3.5-9B-W4A16-AutoRound-NVFP4 | no disponible | no disponible | W4A16 AutoRound NVFP4 | no disponible | Hugging Face (variante del mismo autor) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La cuantización NVFP4 requiere hardware con soporte de FP4; en GPUs sin esa capacidad el modelo puede no ser utilizable o perder sus ventajas de rendimiento.
- Al ser una cuantización de un modelo base, hereda los sesgos y riesgos de alucinación del Qwen3.5-9B original, no documentados en esta ficha.
- La model card no detalla los idiomas soportados ni la composición del dataset de entrenamiento del modelo base.
- El tamaño del repo (38,9 GB) es superior al esperado para pesos puramente a 4 bits, debido a los módulos conservados en BF16; conviene verificar el espacio en disco antes del despliegue.
- La licencia apache-2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base Qwen3.5-9B por si imponen condiciones adicionales.
- El autor incluye enlaces de afiliado a RunPod en la model card; no afectan al modelo pero conviene tenerlos en cuenta al seguir las instrucciones de despliegue.
- No hay benchmarks publicados que permitan verificar la retención de precisión frente al modelo base en tareas multimodales o de razonamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vishva007/Qwen3.5-9B-NVFP4
- Variante W4A16 AutoRound NVFP4 del mismo autor: https://huggingface.co/Vishva007/Qwen3.5-9B-W4A16-AutoRound-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- AutoRound (Intel): https://github.com/intel/auto-round
- RunPod (enlace de afiliado del autor): https://runpod.io?ref=iabrlp7z
