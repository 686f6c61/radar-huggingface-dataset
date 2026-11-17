# windowsxp811203/Qwen3.8-Flash-Next-Abliterated-NVFP4

## Resumen

Qwen3.8-Flash-Next-Abliterated-NVFP4 es una cuantización en NVFP4 (formato FP4 de 4 bits con escalado por bloques, orientado a NVIDIA Blackwell) del modelo Qwen3.8-Flash-Next-Abliterated, un derivado "abliterated" (sin censura, con las direcciones de rechazo eliminadas del espacio de activaciones) publicado por el usuario windowsxp811203 a partir de la familia Qwen. El modelo es multimodal de tipo image-text-to-text, con arquitectura MoE (mezcla de expertos) y alrededor de 180.000 millones de parámetros totales según los pesos en safetensors del repositorio.

El interés práctico del artefacto es doble: por un lado, empaqueta un modelo de gran tamaño en un formato de 4 bits pensado para inferencia de alto rendimiento en GPUs Blackwell con vLLM; por otro, elimina los mecanismos de rechazo del modelo original, lo que lo hace atractivo para investigación sobre alineamiento, evaluación de sesgos y generación sin restricciones, y problemático para despliegues en producción con requisitos de moderación.

La información pública disponible es muy limitada: no hay model card detallada, no se publican resultados de benchmarks, no se especifican los idiomas soportados más allá de los tags (en, zh) y el acceso está restringido (gated), requiriendo aceptar condiciones en Hugging Face. Esta ficha documenta lo verificable y marca explícitamente como "no disponible" todo lo que no puede confirmarse.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) tipo transformer, derivada de Qwen3.8-Flash-Next; tag de arquitectura `qwen4_exp` |
| Parámetros totales | 179.999.981.459 (~180 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 (FP4 con escalado por bloques), FP8 en componentes auxiliares según tags (`nvfp4`, `fp4`, `fp8`, `modelopt`) |
| Idiomas soportados | en, zh (según tags; no hay lista oficial detallada) |
| Licencia | qwen-community-license-1.0 (etiquetada como `license:other`) |
| Formato de pesos | safetensors (cuantizados NVFP4), compatible con vLLM |
| Modalidad | image-text-to-text (multimodal visión + texto) |
| Tamaño del repositorio | 237,6 GB |
| Acceso | restringido (gated) |
| Modelo base | windowsxp811203/Qwen3.8-Flash-Next-Abliterated |

## Arquitectura y entrenamiento

El modelo es una cuantización, no un entrenamiento desde cero. La arquitectura subyacente corresponde a Qwen3.8-Flash-Next, un transformer con mezcla de expertos (MoE) y capacidades multimodales de entrada imagen-texto, según los tags `moe` e `image-text-to-text`. El proceso de cuantización se realizó con NVIDIA ModelOpt (tag `modelopt`) hacia NVFP4, un formato de 4 bits con escalas compartidas por bloques que reduce el peso de los pesos a aproximadamente una cuarta parte de FP16 y está optimizado para las unidades tensor de las GPUs Blackwell (B200, GB200, RTX 50xx). Los tags `fp8` sugieren que determinadas capas (posiblemente atención o proyecciones sensibles) se mantienen en FP8 para preservar calidad.

Sobre el entrenamiento original (número de tokens, composición del dataset, uso de RLHF/DPO) no hay información disponible en la documentación del repositorio. La variante "Abliterated" implica una modificación post-entrenamiento orientada a eliminar la dirección de rechazo en el espacio de activaciones, técnica habitual en la comunidad para producir modelos "uncensored"; no se documenta la metodología exacta, el conjunto de direcciones eliminadas ni el impacto medido sobre capacidades. Tampoco se especifican detalles de decodificación especulativa, atención lineal u otras innovaciones del modelo base.

## Capacidades

- Generación de texto conversacional multirretorno, con pipeline declarado `conversational`.
- Procesamiento de imágenes junto con texto (image-text-to-text): descripción, respuesta a preguntas visuales y razonamiento sobre contenido gráfico.
- Razonamiento y matemáticas: capacidad esperable por linaje Qwen, aunque no hay evaluación publicada que lo cuantifique.
- Generación de código: no verificada en este artefacto; el modelo base Qwen suele incluir este dominio, pero no hay datos específicos.
- Multilingüismo limitado según tags a inglés y chino; el castellano no está declarado oficialmente.
- Comportamiento "abliterated": ausencia deliberada de rechazos ante peticiones que el modelo original declinaría.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineamiento y seguridad: comparar las respuestas del modelo abliterated con las del Qwen3.8-Flash-Next original para medir qué capacidades y sesgos se ven afectados al eliminar la dirección de rechazo; el acceso gated facilita controlar quién lo usa.
- Evaluación de cuantización NVFP4: usar el modelo como banco de pruebas para medir la degradación de calidad de FP4 frente a BF16/FP8 en un MoE de 180 B, con vLLM como motor de referencia.
- Despliegue de altas prestaciones en hardware Blackwell: servir el modelo con vLLM en GPUs B200/GB200 aprovechando las kernels NVFP4 para reducir el coste por token frente a FP8 en cargas de inferencia intensivas.
- Análisis de contenido visual a gran escala en inglés o chino: pipelines de etiquetado, extracción de información de capturas o documentos escaneados, donde la modalidad image-text-to-text es el requisito principal.
- Generación creativa sin restricciones de contenido: escritura de ficción, guiones o material editorial donde el filtrado del modelo base resulta limitante, asumiendo la responsabilidad legal y ética del operador.
- Red teaming y pruebas de robustez: generar prompts adversarios y estudiar la respuesta de sistemas de moderación frente a un modelo sin rechazos, en entornos controlados de investigación.
- Experimentación académica con MoE multimodal: estudiar el enrutamiento de expertos y el comportamiento de un MoE de 180 B cuantizado a 4 bits sin necesidad de infraestructura de precisión completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 237,6 GB en NVFP4; se necesita al menos esa cantidad de memoria, más overhead de KV cache y activaciones. Con contexto largo, prever 300-400 GB efectivos.
- GPU recomendadas: NVIDIA B200 (192 GB HBM3e) en configuraciones multi-GPU (2× B200 cubren los pesos con margen para KV cache), GB200 NVL72 para serving a escala, H200 (141 GB) en 2-3 unidades si el runtime soporta emulación de NVFP4 (no garantizado).
- GPUs consumer: no cabe en RTX 4090 (24 GB) ni en RTX 5090 (32 GB) por el tamaño de los pesos; se requeriría un clúster de varias consumer GPUs con suficiente memoria agregada, lo que no es práctico para NVFP4.
- Opciones de despliegue: vLLM es la librería declarada y el camino soportado para NVFP4; llama.cpp y Ollama no soportan NVFP4 de forma nativa para este tamaño; TGI no está indicado en los tags.
- Latencia y throughput: no disponibles. Como referencia cualitativa, NVFP4 en Blackwell ofrece teóricamente hasta 4× el throughput de FP16 en operaciones matriciales, pero no hay mediciones publicadas para este artefacto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Acceso |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-Abliterated-NVFP4 (este) | ~180 B (MoE) | no disponible | NVFP4/FP8 | qwen-community-license-1.0 | gated |
| Qwen3.8-Flash-Next-Abliterated (base) | ~180 B (MoE) | no disponible | BF16/FP16 | qwen-community-license-1.0 | no disponible |
| Qwen3.8-Flash-Next (original) | ~180 B (MoE) | no disponible | BF16/FP16 | qwen-community-license-1.0 | no disponible |

No se dispone de datos de rendimiento ni de especificaciones de contexto de las alternativas en la información proporcionada, por lo que la comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- Modelo "abliterated": se ha eliminado deliberadamente el comportamiento de rechazo, lo que incrementa el riesgo de generar contenido dañino, ilegal o sexualmente explícito. No es apto para aplicaciones de cara al público sin una capa de moderación externa.
- Sin benchmarks publicados: no hay evidencia cuantitativa de que la cuantización NVFP4 preserve la calidad del modelo base; la degradación en FP4 puede ser notable en tareas de razonamiento y matemáticas.
- Idiomas: solo inglés y chino declarados en los tags; el rendimiento en castellano no está verificado y probablemente sea inferior.
- Licencia Qwen Community 1.0: impone restricciones de uso comercial y obligaciones de atribución; es imprescindible revisar los términos antes de cualquier despliegue productivo. La etiqueta `license:other` en Hugging Face indica condiciones adicionales del publicador.
- Acceso restringido: requiere aceptar condiciones en Hugging Face; no es un modelo de descarga libre y su disponibilidad futura depende del publicador (cuenta de usuario individual, no organización oficial de Qwen).
- Procedencia no oficial: el publicador no es Alibaba/Qwen; no hay garantía de integridad del proceso de abliteration ni de la cuantización.
- Riesgo de alucinación: sin datos específicos, pero los modelos cuantizados a 4 bits y modificados con abliteration suelen mostrar mayor propensión a inventar hechos.
- Contexto y tool calling no documentados: no se puede planificar su uso en pipelines agénticos sin verificación empírica previa.
- Tamaño y hardware: 237,6 GB de pesos exigen infraestructura Blackwell de gama alta; el coste de despliegue es elevado y no hay cifras de throughput publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/windowsxp811203/Qwen3.8-Flash-Next-Abliterated-NVFP4
- Modelo base (abliterated, sin cuantizar): https://huggingface.co/windowsxp811203/Qwen3.8-Flash-Next-Abliterated
- vLLM (motor de inferencia declarado): https://github.com/vllm-project/vllm
- NVIDIA ModelOpt (herramienta de cuantización NVFP4): https://github.com/NVIDIA/TensorRT-Model-Optimizer
- Licencia Qwen Community: https://huggingface.co/Qwen/Qwen3-235B-A22B/blob/main/LICENSE (referencia de la familia Qwen; verificar la versión exacta aplicable)
