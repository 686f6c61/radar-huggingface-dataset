# SusanHill/kumaresano-albedo-qwen3.6-35b-bk17-0818-2046

## Resumen

El modelo `SusanHill/kumaresano-albedo-qwen3.6-35b-bk17-0818-2046` es una variante de la familia Qwen3.6 con arquitectura `qwen3_5_moe`, publicada por el usuario SusanHill en HuggingFace. Se trata de un modelo multimodal de tipo imagen-texto-a-texto, diseñado para tareas conversacionales y de razonamiento visual. Con aproximadamente 35,95 mil millones de parámetros totales y un peso de 71,9 GB en formato BF16, está pensado para entornos de inferencia con requisitos de memoria elevados.

El modelo se enmarca dentro de la serie Qwen3.6, que según el repositorio oficial de QwenLM prioriza la estabilidad y la utilidad en entornos reales, con mejoras específicas en codificación agéntica y preservación del contexto de razonamiento. Esta versión concreta (`bk17`) no dispone de tarjeta de modelo pública ni de documentación adicional, por lo que muchos detalles técnicos no están disponibles. El acceso está restringido (gated) y requiere aceptar condiciones en HuggingFace.

La relevancia de este modelo radica en su naturaleza multimodal y su arquitectura MoE, que podría ofrecer un equilibrio entre rendimiento y eficiencia para tareas que combinan visión y lenguaje. No obstante, la ausencia de benchmarks publicados y de especificaciones detalladas limita su evaluación objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5_moe` (Mixture of Experts basada en Qwen3.5) |
| Parametros totales | 35.951.822.704 (~35,95 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo solo contiene pesos BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

La arquitectura está etiquetada como `qwen3_5_moe`, lo que indica un modelo de mezcla de expertos (MoE) basado en la arquitectura Qwen3.5. Los MoE activan solo un subconjunto de parámetros por token, lo que permite escalar el número total de parámetros manteniendo un coste computacional por inferencia menor que un modelo denso equivalente. Sin embargo, no se dispone de información sobre el número de expertos, el tamaño de los expertos activos ni la estrategia de enrutamiento.

El pipeline declarado es `image-text-to-text`, por lo que el modelo acepta tanto imágenes como texto como entrada y genera texto como salida. Esto sugiere que incorpora un codificador visual y un proyector multimodal, probablemente similar al enfoque usado en otras variantes de Qwen-VL. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas de alineación como RLHF o DPO. El repositorio de Qwen3.6 menciona mejoras en codificación agéntica y preservación del razonamiento, pero no se confirma si esta variante concreta las incluye.

## Capacidades

- Generación de texto y respuesta conversacional en formato diálogo.
- Comprensión de imágenes y respuesta a preguntas visuales (pipeline `image-text-to-text`).
- Posible soporte de razonamiento multi-paso y codificación, dado el enfoque de la serie Qwen3.6, aunque no está verificado para esta variante.
- Compatible con la librería `transformers` y con `endpoints_compatible`, lo que facilita su despliegue en infraestructuras estándar.
- No se han documentado capacidades específicas como tool calling, function calling o modo thinking para este modelo concreto.

## Casos de uso

- Descripción y análisis de imágenes: el modelo puede generar descripciones detalladas de fotografías, diagramas o capturas de pantalla, útil para aplicaciones de accesibilidad o documentación automática.
- Asistente conversacional multimodal: integración en chatbots que necesitan interpretar imágenes enviadas por el usuario, como soporte técnico o atención al cliente con capturas de pantalla.
- Extracción de información de documentos escaneados: dado su pipeline de imagen a texto, puede transcribir y resumir contenido de documentos visuales, facturas o formularios.
- Generación de código a partir de diagramas o bocetos: si hereda las capacidades de codificación de Qwen3.6, podría convertir esquemas visuales en código, aunque esta funcionalidad no está confirmada.
- Anotación automática de datasets visuales: para generar etiquetas o descripciones de imágenes en pipelines de machine learning.
- Investigación en modelos multimodales: como modelo de referencia para estudiar el comportamiento de arquitecturas MoE con entrada visual, dado su tamaño y licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo concreto. Tampoco se han encontrado comparativas con modelos similares en la página de HuggingFace ni en los resultados de búsqueda.

## Requisitos de hardware

- VRAM estimada: el modelo en BF16 ocupa 71,9 GB, por lo que se necesitan al menos 80 GB de VRAM para inferencia sin cuantización (por ejemplo, una A100 de 80 GB o H100).
- Con cuantización a 4 bits (por ejemplo, Q4_K_M), el tamaño se reduciría a aproximadamente 20-25 GB, lo que permitiría ejecutarlo en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB), aunque no hay archivos GGUF oficiales publicados.
- GPUs recomendadas: A100 80 GB, H100 80 GB, o GPUs con 24 GB o más si se aplica cuantización externa.
- Opciones de despliegue: al ser compatible con `transformers`, puede servirse con vLLM, TGI o cualquier framework que soporte modelos de HuggingFace. No se han publicado integraciones con llama.cpp u Ollama.
- Latencia y throughput: no disponibles, ya que no se han realizado mediciones públicas.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa. Existen otras versiones del mismo autor (`bk10`, `bk16`) con la misma arquitectura y tamaño, pero sin especificaciones adicionales. La serie Qwen3.6 de QwenLM incluye modelos de distintos tamaños, pero no se conocen sus parámetros exactos ni sus resultados. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated, por lo que es necesario solicitar acceso y aceptar condiciones en HuggingFace antes de su descarga.
- Sin documentación: no hay tarjeta de modelo, ni información sobre sesgos, alucinaciones o limitaciones de idioma. Se desconoce su comportamiento en producción.
- Riesgo de alucinación: como modelo generativo, puede producir información falsa o inexacta, especialmente en tareas visuales complejas.
- Requisitos de hardware elevados: los 71,9 GB en BF16 dificultan su uso en entornos con GPUs de consumo sin cuantización.
- Sin benchmarks publicados: no es posible evaluar su calidad relativa frente a otros modelos multimodales.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo derivado de Qwen, deben respetarse las condiciones de la licencia original de Qwen (aunque Qwen3.6 también es Apache 2.0).

## Enlaces

- [HuggingFace - SusanHill/kumaresano-albedo-qwen3.6-35b-bk17-0818-2046](https://huggingface.co/SusanHill/kumaresano-albedo-qwen3.6-35b-bk17-0818-2046)
- [HuggingFace - kumaresano/albedo-qwen3.6-35b-bk16](https://huggingface.co/kumaresano/albedo-qwen3.6-35b-bk16)
- [HuggingFace - kumaresano/albedo-qwen3.6-35b-bk10](https://huggingface.co/kumaresano/albedo-qwen3.6-35b-bk10)
- [GitHub - QwenLM/Qwen3.6](https://github.com/QwenLM/Qwen3.6)
- [LM Studio - Qwen3.6](https://lmstudio.ai/models/qwen3.6)
- [Docker Hub - ai/qwen3.6](https://hub.docker.com/r/ai/qwen3.6)
