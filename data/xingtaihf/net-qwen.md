# XingtaiHF/NET-qwen

## Resumen

NET-qwen es un ajuste fino (fine-tuning) del modelo Qwen3-30B-A3B-Base, publicado por el usuario XingtaiHF en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo de lenguaje causal de tipo Mixture-of-Experts (MoE) con 30.532 millones de parámetros totales, de los cuales solo se activan aproximadamente 3.300 millones por token, lo que lo convierte en una opción eficiente en cómputo para su tamaño. La arquitectura subyacente es la de Qwen3, con 48 capas y atención GQA (32 cabezas para consultas y 4 para claves/valores).

El modelo hereda las capacidades del Qwen3 original: conmutación entre modo de razonamiento (thinking) y modo directo, soporte de más de 100 idiomas, tool calling y razonamiento multi-paso. Al estar basado en la variante Base (no Instruct), el ajuste fino de XingtaiHF parte de un modelo preentrenado, por lo que sus capacidades conversacionales dependen del proceso de post-entrenamiento aplicado por el autor, del cual no se dispone de documentación detallada en la información proporcionada.

La relevancia de este modelo radica en su relación entre tamaño total y parámetros activos: al activar solo 3.300 millones de parámetros, puede desplegarse con requisitos de cómputo inferiores a los de un modelo denso de 30B, manteniendo una ventana de contexto nativa de 32.768 tokens ampliable a 131.072 mediante YaRN. El repositorio ocupa 61,1 GB en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con Mixture-of-Experts (qwen3_moe) |
| Parametros totales | 30.532.122.624 (30,5B) |
| Parametros activos | 3,3B (8 de 128 expertos activados) |
| Longitud de contexto | 32.768 tokens nativos; 131.072 con YaRN |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en precisión original) |
| Idiomas soportados | más de 100 idiomas y dialectos (según la model card de Qwen3) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Capas | 48 |
| Cabezas de atención | 32 (Q) / 4 (KV), GQA |
| Expertos | 128 totales, 8 activados |
| Parametros sin embeddings | 29,9B |
| Modelo base | Qwen/Qwen3-30B-A3B-Base |
| Libreria | transformers (requiere >= 4.51.0) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer causal con capas MoE intercaladas, identificada en transformers como `qwen3_moe`. Cada capa MoE dispone de 128 expertos de los que se activan 8 por token, lo que reduce el coste computacional de inferencia a aproximadamente el de un modelo denso de 3,3B pese a contener 30,5B parámetros. La atención usa Grouped Query Attention con 32 cabezas de consulta y 4 de clave/valor, lo que reduce el tamaño de la caché KV. El modelo base Qwen3-30B-A3B-Base fue preentrenado por el equipo de Qwen (Alibaba) y posteriormente ajustado por XingtaiHF; no se dispone de información sobre el dataset, el número de tokens o las técnicas de alineación (RLHF/DPO) empleadas en este ajuste concreto.

La model card heredada de Qwen3 describe el soporte de conmutación entre modo thinking y non-thinking dentro del mismo modelo, con el bloque de razonamiento delimitado por las etiquetas ``. También documenta el uso de YaRN para extender el contexto hasta 131.072 tokens. No se especifican innovaciones adicionales propias de este fine-tuning (como decodificación especulativa o atención lineal) en la información disponible.

## Capacidades

- Generación de texto y diálogo conversacional multi-turno.
- Razonamiento lógico y matemático en modo thinking (bloque `<think>`).
- Generación de código y razonamiento sobre código.
- Conmutación entre modo thinking y non-thinking mediante el parámetro `enable_thinking` en `apply_chat_template`.
- Soporte de tool calling / function calling e integración con herramientas externas (capacidad heredada de Qwen3).
- Capacidades de agente y razonamiento multi-paso.
- Soporte multilingüe de más de 100 idiomas y dialectos, con instrucciones y traducción.
- Alineación orientada a preferencias humanas: escritura creativa, role-play e instrucciones complejas (según la model card de Qwen3).
- Contexto largo ampliable a 131.072 tokens con YaRN.

## Casos de uso

- **Atención al cliente automatizada**: el modelo puede gestionar conversaciones multi-turno con hasta 32.768 tokens de contexto nativo, suficiente para arrastrar historial de sesión e información de cuenta sin truncamientos agresivos; el modo non-thinking reduce latencia en respuestas rutinarias.
- **Generación de código en producción**: al soportar tool calling y razonamiento multi-paso, puede integrarse en pipelines que invocan linters, compiladores o APIs de CI/CD, usando el modo thinking para tareas de depuración compleja.
- **Asistente de razonamiento matemático**: el modo thinking permite resolver problemas de varios pasos mostrando la cadena de razonamiento en el bloque `<think>`, útil en herramientas educativas o de validación de cálculos.
- **Agentes autónomos con herramientas**: la combinación de MoE eficiente (3,3B activos) y soporte de function calling permite desplegar agentes que encadenan llamadas a APIs con un coste de inferencia contenido frente a modelos densos de 30B.
- **Procesamiento de documentos largos**: con la extensión YaRN a 131.072 tokens, puede resumir o extraer información de contratos, informes o expedientes extensos en una sola pasada.
- **Traducción y soporte multilingüe**: con más de 100 idiomas soportados, sirve para traducción automática y atención en idiomas minoritarios dentro de una misma infraestructura.
- **Generación de contenido creativo y role-play**: la alineación de preferencias del Qwen3 original favorece respuestas naturales en escritura creativa y personajes, aprovechable en motores de narrativa interactiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tablas de evaluación propias para este fine-tuning, y no se deben extrapolar los resultados del Qwen3-30B-A3B original sin verificación.

## Requisitos de hardware

- **VRAM estimada en precisión original (BF16/FP16)**: aproximadamente 61 GB solo para pesos, más caché KV y overhead; requiere GPUs de 80 GB (A100, H100) o múltiples GPUs de 24-48 GB.
- **Cuantización a 8 bits**: en torno a 30-32 GB, viable en una RTX 6000 Ada (48 GB) o A100 40 GB con margen ajustado.
- **Cuantización a 4 bits (GGUF/AWQ/GPTQ)**: aproximadamente 16-18 GB, cabe en una RTX 4090 (24 GB) o RTX 3090 (24 GB), aunque con contexto reducido por la caché KV.
- **GPU recomendadas**: A100 80 GB o H100 para BF16; RTX 4090/3090 para cuantización 4 bits; configuraciones multi-GPU para contexto largo con YaRN.
- **Despliegue**: vLLM >= 0.8.5 (`vllm serve ... --enable-reasoning --reasoning-parser deepseek_r1`), SGLang >= 0.4.6.post1 (`--reasoning-parser qwen3`), llama.cpp, Ollama, LMStudio, MLX-LM y KTransformers para uso local.
- **Latencia y throughput**: no disponibles para este fine-tuning concreto; el modelo base MoE con 3,3B activos ofrece un throughput sustancialmente mayor que un denso de 30B en las mismas GPUs, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| NET-qwen (este modelo) | 30,5B / 3,3B | 32.768 (131.072 con YaRN) | Apache 2.0 | Hugging Face, 203 descargas |
| Qwen3-30B-A3B (base e instruct) | 30,5B / 3,3B | 32.768 (131.072 con YaRN) | Apache 2.0 | Hugging Face, ampliamente desplegado |
| Qwen3-32B (denso) | 32,8B / 32,8B | 32.768 (131.072 con YaRN) | Apache 2.0 | Hugging Face |
| Mixtral 8x7B | 46,7B / 12,9B | 32.768 | Apache 2.0 | Hugging Face |

El principal competidor directo es el propio Qwen3-30B-A3B en sus variantes oficiales, que cuentan con model card completa y benchmarks publicados; NET-qwen se diferencia únicamente por el ajuste fino de XingtaiHF, del que no hay evaluación pública. Frente a un denso de tamaño similar como Qwen3-32B, la ventaja del MoE es el menor coste de inferencia (3,3B activos frente a 32,8B). Frente a Mixtral 8x7B, NET-qwen activa menos parámetros por token y ofrece contexto extendido con YaRN.

## Limitaciones y advertencias

- **Sin benchmarks publicados**: no hay evidencia de rendimiento específica para este fine-tuning; no se debe asumir que iguala al Qwen3-30B-A3B oficial.
- **Modelo base preentrenado**: al partir de la variante Base y no de la Instruct, el comportamiento conversacional y de alineación depende enteramente del ajuste del autor, sin documentación disponible.
- **Riesgo de alucinación**: inherente a los modelos de lenguaje; el modo thinking no elimina la posibilidad de generar contenido factualmente incorrecto.
- **Idiomas**: aunque Qwen3 declara más de 100 idiomas, el ajuste fino puede haber degradado el rendimiento en idiomas distintos del usado en su entrenamiento, que no se documenta.
- **Contexto**: los 131.072 tokens requieren configuración explícita de YaRN; sin ella, el límite real es de 32.768 tokens.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene verificar que los términos del modelo base Qwen3 se respetan en la redistribución.
- **Madurez del repositorio**: 203 descargas, 0 likes y ausencia de documentación propia; no se recomienda para producción sin una evaluación interna previa.
- **Cuantizaciones**: el repositorio solo ofrece safetensors en precisión original; las versiones GGUF/AWQ/GPTQ deberán generarse por el usuario.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/XingtaiHF/NET-qwen)
- [Modelo base Qwen3-30B-A3B-Base](https://huggingface.co/Qwen/Qwen3-30B-A3B-Base)
- [Blog de Qwen3](https://qwenlm.github.io/blog/qwen3/)
- [Repositorio GitHub de Qwen3](https://github.com/QwenLM/Qwen3)
- [Documentación de Qwen](https://qwen.readthedocs.io/en/latest/)
- [Qwen Chat](https://chat.qwen.ai/)
- [Licencia Apache 2.0 del modelo base](https://huggingface.co/Qwen/Qwen3-30B-A3B/blob/main/LICENSE)
- [Paper de referencia arXiv:2309.00071](https://arxiv.org/abs/2309.00071)
- [Paper de referencia arXiv:2505.09388](https://arxiv.org/abs/2505.09388)
