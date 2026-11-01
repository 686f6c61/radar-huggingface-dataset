# Vishva007/MiMo-V2.6-Distill-Qwen-9B-W4A16-LLM-Compressor

## Resumen

MiMo-V2.6-Distill-Qwen-9B-W4A16-LLM-Compressor es una versión cuantizada a 4 bits de pesos (W4A16) del modelo multimodal MiMo-V2.6-Distill-Qwen-9B, desarrollado originalmente por XiaomiMiMo y destilado a partir de la familia Qwen. Esta ficha concreta corresponde al repositorio publicado por el usuario Vishva007 en HuggingFace, que aplica la técnica AutoRound/SignRound para reducir drásticamente el uso de VRAM manteniendo las capacidades agénticas, de código, de tool calling y de decisión multimodal del modelo original.

El modelo está orientado a tareas agénticas y de razonamiento multi-paso, con soporte de visión (pipeline image-text-to-text) y de generación de código. La cuantización preserva en bfloat16 nativo los módulos visuales y las capas de Multi-Token Prediction (MTP), lo que permite mantener la fidelidad del razonamiento multimodal y habilitar decodificación especulativa en vLLM.

Es relevante porque ofrece un checkpoint listo para producción que reduce el coste de despliegue en GPU, con integración documentada para vLLM (incluyendo parsers de tool calling y de razonamiento de Qwen) y con licencia MIT, lo que facilita su adopción tanto en investigación como en entornos comerciales. El número de parámetros reales reportado en safetensors es de 3.572.326.112.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basada en Qwen3.5 (`qwen3_5`); incluye capas MTP (Multi-Token Prediction) y encoder visual |
| Parametros totales | 3.572.326.112 (según safetensors del repo cuantizado); el nombre del modelo base indica 9B |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens (configuración de ejemplo en vLLM con `--max-model-len 32768`) |
| Tipos de cuantizacion | W4A16 (pesos 4 bits, activaciones 16 bits) vía AutoRound/SignRound; módulos `mtp`, `mtp.fc` y `visual` en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de la familia Qwen (tag `qwen3_5`), destilado por XiaomiMiMo a partir de MiMo-V2.6 y orientado a razonamiento agéntico. Incluye un encoder visual para entrada de imágenes y capas de Multi-Token Prediction (MTP) que permiten decodificación especulativa, acelerando la inferencia en vLLM. El pipeline declarado es image-text-to-text.

Esta versión cuantizada aplica AutoRound/SignRound con `iters=1000`, `sym=True` y `group_size=32`, calibrada con 512 muestras de longitud de secuencia 2048 (`batch_size=2`, `gradient_accumulate_steps=4`). Los módulos visuales y MTP se mantienen en bfloat16 sin cuantizar para preservar la fidelidad del razonamiento multimodal y la ejecución especulativa. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO.

## Capacidades

- Generación de texto y razonamiento multi-paso (modo thinking configurable vía `enable_thinking`).
- Generación y comprensión de código (tag `code`).
- Tool calling / function calling, con parser `qwen3_coder` en vLLM.
- Capacidades agénticas y de resolución de problemas (tag `agentic`).
- Comprensión de imágenes (image-text-to-text) y decisión multimodal estructurada.
- Decodificación especulativa mediante MTP (`num_speculative_tokens=1`).
- Soporte de consultas estructuradas tipo "decision engine" con preguntas de elección y criterios (endpoint `/v1/systemone` en vLLM nightly).
- Capacidades multilingües: no disponible.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto de hasta 32.768 tokens y tool calling para consultar sistemas internos, integrándose en vLLM con prefix caching y chunked prefill.
- Generación de código en producción: soporta tool calling y parser `qwen3_coder`, lo que permite integrarlo en pipelines de CI/CD para revisión, generación y corrección de código.
- Agentes autónomos multi-paso: el modo agéntico y el razonamiento con thinking habilitado permiten planificar y ejecutar tareas encadenadas con llamadas a herramientas.
- Inspección visual automatizada: el encoder visual preservado en bfloat16 permite clasificar o validar imágenes (por ejemplo, verificar presencia de objetos) mediante consultas estructuradas.
- Moderación y decisión estructurada: el endpoint `/v1/systemone` permite formular preguntas de elección con criterios, útil para sistemas de decisión con salida controlada.
- Asistentes de documentación técnica: con contexto largo y capacidad de código, puede resumir y responder sobre repositorios y documentación extensa.
- Despliegue en GPU de gama media: la cuantización W4A16 reduce la VRAM necesaria, permitiendo servir el modelo en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 8,9 GB en disco; con cuantización W4A16 y KV cache en fp8, el despliegue en vLLM se configura con `--gpu-memory-utilization 0.90`. La VRAM exacta no está especificada en la información disponible.
- GPU recomendadas: no disponible de forma explícita; el ejemplo de vLLM usa `--dtype bfloat16` y decodificación especulativa MTP.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el tamaño del repo (8,9 GB) sugiere que podría caber en GPUs de consumo con suficiente VRAM, pero no se aporta confirmación.
- Opciones de despliegue: vLLM (con `--trust-remote-code`, `--enable-auto-tool-choice`, `--tool-call-parser qwen3_coder`, `--reasoning-parser qwen3`, `--speculative-config '{"method":"mtp","num_speculative_tokens":1}'`), transformers; otros motores (llama.cpp, Ollama, TGI) no están documentados.
- Latencia y throughput: no disponibles; se documenta el uso de decodificación especulativa MTP, prefix caching y chunked prefill para mejorar el rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiMo-V2.6-Distill-Qwen-9B-W4A16 (este) | 3.572.326.112 (safetensors) | 32.768 | MIT | safetensors (compressed-tensors) | Cuantizado W4A16, multimodal, MTP |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B (base) | 9B (según nombre) | no disponible | no disponible | safetensors | Modelo original sin cuantizar |
| Otros modelos de la familia Qwen | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: inherente a los modelos generativos; no se aportan evaluaciones específicas.
- Limitaciones de contexto: la configuración de ejemplo limita a 32.768 tokens; no se especifica la ventana nativa máxima del modelo base.
- Idiomas soportados: no disponibles; no se puede garantizar cobertura multilingüe.
- Restricciones de licencia: licencia MIT, que permite uso comercial, pero conviene verificar la licencia del modelo base original.
- Cuantización: la reducción a 4 bits puede degradar ligeramente la precisión frente al modelo en bfloat16, aunque los módulos visuales y MTP se preservan.
- Dependencia de vLLM reciente: algunas funcionalidades (endpoint `/v1/systemone`, parsers) requieren versiones nightly superiores a v0.32.0.
- El repositorio tiene pocas descargas (46) y ningún "like", lo que sugiere validación comunitaria limitada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Vishva007/MiMo-V2.6-Distill-Qwen-9B-W4A16-LLM-Compressor
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- RunPod (referido en la model card): https://runpod.io?ref=iabrlp7z
