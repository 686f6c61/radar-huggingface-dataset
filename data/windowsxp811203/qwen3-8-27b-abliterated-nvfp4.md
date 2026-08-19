# windowsxp811203/Qwen3.8-27B-Abliterated-NVFP4

## Resumen

El modelo `windowsxp811203/Qwen3.8-27B-Abliterated-NVFP4` es una cuantización NVFP4 (4-bit float) del modelo `Qwen3.8-27B-Abliterated`, que a su vez es una versión "abliterated" (eliminación de la capa de rechazo) del modelo multimodal denso `Qwen/Qwen3.8-27B` desarrollado por Alibaba. El autor, windowsxp811203, ha aplicado una técnica de ortogonalización de tensores contra una dirección de rechazo para eliminar las respuestas de negativa ante instrucciones dañinas, manteniendo la torre de visión byte-idéntica. Esta versión cuantizada reduce el tamaño de 55.6 GB a 28.6 GB, lo que permite su ejecución en GPUs Blackwell (sm100+) con vLLM, conservando la cabeza MTP (multi-token prediction) para decodificación especulativa, algo inusual en derivados cuantizados de esta arquitectura.

El modelo está diseñado para investigación en seguridad y alineación, así como para aplicaciones que requieren generación de texto sin restricciones de rechazo. Incluye soporte multimodal (imagen-texto), razonamiento con modo de pensamiento activado por defecto, y una ventana de contexto nativa de 262,144 tokens, ampliable a 1M mediante configuración específica. Su licencia Apache-2.0 permite uso comercial, aunque el autor advierte que el usuario es responsable del cumplimiento legal. La cuantización NVFP4 mantiene la precisión (MMLU 77.75% frente al 78% de la referencia GGUF Q8) y la cabeza MTP verifica una tasa de aceptación de draft del 76-78%.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8 (transformer denso multimodal con atención híbrida: full attention en 16 capas y Gated DeltaNet/SSM en el resto) |
| Parametros totales | 19.135.892.976 (según safetensors; el nombre comercial indica 27B, la diferencia se debe al conteo del vision tower y componentes auxiliares) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262,144 tokens nativos; ampliable a 1,010,000 mediante `--hf-overrides` (verificado) |
| Tipos de cuantizacion | NVFP4 (4-bit float, group size 16, scales float8_e4m3); también disponible GGUF Q8_0 en repo separado |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con cuantización NVFP4 mediante compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-27B` es un transformer denso multimodal que combina atención completa en 16 de sus 64 capas y Gated DeltaNet (una arquitectura SSM lineal) en las restantes, junto con una torre de visión independiente. Sobre esta base, el autor aplicó un proceso de "abliteration": ortogonalizó 131 tensores que escriben en el residuo (incluyendo `embed_tokens`) contra una dirección de rechazo calculada a partir de respuestas negativas, con λ=1.5, dejando la torre de visión intacta. El resultado es un modelo que no produce rechazos ante instrucciones dañinas, manteniendo las capacidades generales.

La cuantización NVFP4 se realizó con llm-compressor 0.13.0 sobre el modelo abliterated en bf16. Se cuantizaron 256 lineales (MLP gate/up/down y atención q/k/v/o de las 16 capas con atención completa), mientras que la cabeza MTP, la torre de visión, las capas SSM, `lm_head` y los embeddings se mantuvieron en bf16. Un detalle técnico relevante es que la cabeza MTP se "injertó" de nuevo tras la cuantización y se listó en `quantization_config.ignore` para que vLLM no la tratara como objetivo de cuantización; sin esta doble operación, la decodificación especulativa fallaría con 0% de aceptación. No se dispone de información sobre el dataset de entrenamiento original ni sobre el número de tokens utilizados.

## Capacidades

- Generación de texto multimodal: procesa imágenes y texto, generando respuestas coherentes y contextualizadas.
- Razonamiento con modo de pensamiento (thinking) activado por defecto, desactivable por petición.
- Decodificación especulativa con cabeza MTP (multi-token prediction) para acelerar la inferencia (tasa de aceptación de draft verificada del 76-78%).
- Sin capa de rechazo (abliterated): no produce negativas ante instrucciones dañinas, lo que lo hace útil para investigación en seguridad.
- Soporte de tool calling y flujos agénticos (heredado de Qwen3.8, aunque no verificado en esta cuantización).
- Capacidades multilingües en inglés y chino (declarado), con posible extensión a otros idiomas no documentada.
- Extensión de contexto a 1M tokens verificada con needle-in-a-haystack (pasaje recuperado a 50% de profundidad).

## Casos de uso

- Investigación en seguridad y alineación: el modelo permite estudiar el comportamiento de sistemas sin rechazo, analizar jailbreaks y desarrollar técnicas de mitigación. Su tasa de rechazo de 0% en AdvBench lo hace idóneo para entornos controlados de laboratorio.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones o diálogos que requieran explorar temas controvertidos sin autocensura, siempre bajo supervisión humana y cumplimiento legal.
- Asistentes de código con baja latencia: gracias a la decodificación especulativa MTP, puede integrarse en pipelines de CI/CD o IDEs donde la velocidad de generación es crítica, manteniendo calidad en tareas de programación.
- Procesamiento de documentos largos: con la configuración de 1M de contexto, puede resumir o analizar libros técnicos, informes extensos o bases de conocimiento completas en una sola pasada, útil en entornos de investigación.
- Chatbots multilingües especializados: al no rechazar peticiones, puede atender consultas en inglés y chino sobre temas técnicos o científicos sin filtros, adecuado para plataformas de soporte interno.
- Evaluación de modelos de seguridad: comparar el comportamiento de este modelo frente al original Qwen3.8-27B permite medir el impacto del abliteration en métricas de utilidad y seguridad, sirviendo como referencia en publicaciones académicas.

## Benchmarks y rendimiento

El autor proporciona resultados medidos sobre este checkpoint exacto en una RTX PRO 6000 Blackwell:

| Benchmark | Resultado |
|---|---|
| MMLU (400 preguntas equidistantes, misma metodología) | 77.75 % (NVFP4) vs 78.00 % (GGUF Q8_0 de referencia) |
| AdvBench (80 prompts) | 0/80 (0.00 % de rechazo) |
| HarmBench safety categories (119 prompts) | 0/119 (0.0 % de rechazo) |
| HarmBench copyright (41 prompts) | 17/41 (41.5 %; el autor indica que son falsos positivos del clasificador, no rechazos) |
| MTP draft acceptance rate | 76.4 % – 78.3 % (mean acceptance length 1.76 – 1.78) |

No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, etc.) en la información disponible. El autor advierte que estos números no son comparables con el 82.35 % de MMLU reportado en la tarjeta del modelo padre, ya que esa cifra se obtuvo mediante comparación de logits (método más permisivo).

## Requisitos de hardware

- GPU obligatoria: arquitectura Blackwell (sm100+), por ejemplo RTX PRO 6000 Blackwell, B200, etc. No funciona en GPUs Ampere o anteriores.
- VRAM para inferencia: aproximadamente 26.6 GiB para los pesos cuantizados, más la caché KV. Para contexto de 256K cabe en una GPU de 96 GB; para 1M se necesitan 2× 96 GB (presupuesto de ~61 GiB de KV adicional).
- Opciones de despliegue: vLLM es el runtime recomendado y verificado. Configuración típica: `vllm serve windowsxp811203/Qwen3.8-27B-Abliterated-NVFP4 --max-model-len 8192 --speculative-config '{"method":"mtp","num_speculative_tokens":1}'`.
- Para 1M de contexto: `--tensor-parallel-size 2 --max-model-len 1010000 --hf-overrides '{"text_config": {"max_position_embeddings": 1010000}}'`.
- En caso de error de FlashInfer (problema de toolchain del host), se recomienda exportar `VLLM_USE_FLASHINFER_SAMPLER=0` y `VLLM_ATTENTION_BACKEND=TRITON_ATTN`.
- También existe una versión GGUF (Q8_0) para llama.cpp/Ollama, aunque la cuantización NVFP4 requiere vLLM.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU (misma metodología) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | ~27B (denso) | 262K (ampliable a 1M) | 82.35 % (logit comparison) | Apache-2.0 | HuggingFace |
| Qwen3.8-27B-Abliterated (bf16) | ~27B | 262K | No disponible | Apache-2.0 | HuggingFace |
| Qwen3.8-27B-Abliterated-NVFP4 (este) | 19.1B (según safetensors) | 262K (ampliable a 1M) | 77.75 % | Apache-2.0 | HuggingFace |
| Qwen3.8-27B-Abliterated-GGUF (Q8_0) | ~27B | 262K | 78.00 % | Apache-2.0 | HuggingFace |

La comparativa se limita a las variantes del mismo modelo base porque no se dispone de datos de otros modelos de la misma categoría (p. ej., Llama 3.1 8B o Mistral 7B) en la información proporcionada. El abliteration no afecta significativamente al rendimiento en MMLU (pérdida de ~0.25 puntos porcentuales entre Q8 y NVFP4), pero sí elimina por completo la capa de rechazo.

## Limitaciones y advertencias

- El modelo no rechaza contenido dañino: presenta 0% de rechazo en AdvBench y HarmBench safety categories. Su uso para generar contenido ilegal, difamatorio o peligroso es responsabilidad del usuario, y puede violar leyes locales.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en contextos largos o con prompts ambiguos.
- Sesgos heredados: al derivar de Qwen3.8-27B, puede contener sesgos culturales, de género o ideológicos presentes en los datos de entrenamiento originales, no documentados en esta ficha.
- Limitaciones de idioma: solo se declaran inglés y chino; el rendimiento en otros idiomas no está garantizado.
- Requisitos de hardware restrictivos: necesita GPU Blackwell (sm100+), lo que excluye la mayoría de hardware consumer actual (RTX 40 series, A100, etc.).
- La cuantización NVFP4 introduce una pérdida mínima de precisión (0.25 puntos en MMLU), pero puede afectar a tareas de razonamiento muy sensibles al redondeo.
- La cabeza MTP funciona solo con vLLM y la configuración especificada; otros runtimes pueden ignorarla o fallar.
- El abliteration puede degradar la utilidad en tareas que requieren respuestas seguras o matizadas, como asesoramiento médico o legal.
- Licencia Apache-2.0 permite uso comercial, pero el autor declina responsabilidad sobre el uso indebido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/windowsxp811203/Qwen3.8-27B-Abliterated-NVFP4
- Modelo base (abliterated bf16): https://huggingface.co/windowsxp811203/Qwen3.8-27B-Abliterated
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Página de Jetson AI Lab sobre Qwen3.8-27B: https://www.jetson-ai-lab.com/models/qwen3-8-27b/
- Versión GGUF: https://huggingface.co/windowsxp811203/Qwen3.8-27B-Abliterated-GGUF
- Página en Ollama: https://ollama.com/library/qwen3.8:27b
