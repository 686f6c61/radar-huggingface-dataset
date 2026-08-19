# SusanHill/dendritex-albedo-qwen3.6-35b-stages-v3-p97-0818-1957

## Resumen

El modelo `SusanHill/dendritex-albedo-qwen3.6-35b-stages-v3-p97-0818-1957` es un modelo de lenguaje multimodal (imagen-texto) de la familia Qwen3.6, desarrollado por el usuario SusanHill y publicado en HuggingFace. Se trata de un modelo de arquitectura MoE (Mixture of Experts) dispersa con aproximadamente 35 mil millones de parámetros totales y unos 3 mil millones de parámetros activos por token, lo que lo hace eficiente en inferencia pese a su tamaño. Según la documentación técnica de vLLM-Ascend, emplea una arquitectura de atención híbrida que combina GDN (Grouped Dot-product Attention) con atención completa, similar a la serie Qwen3.5.

El modelo está diseñado para tareas de conversación y comprensión de imágenes, con pipeline `image-text-to-text`. Su licencia es Apache 2.0, aunque el acceso en HuggingFace está restringido (gated) y requiere aceptar condiciones adicionales. Es relevante porque combina multimodalidad con eficiencia MoE, lo que permite desplegarlo en hardware más modesto que un modelo denso de 35B manteniendo una alta capacidad de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE dispersa con atención híbrida (GDN + full attention) |
| Parametros totales | 35.951.822.704 |
| Parametros activos | ~3.000.000.000 (3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (acceso restringido en HF) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo pertenece a la familia Qwen3.6 y utiliza una arquitectura de mezcla de expertos (MoE) con activación dispersa. De los 35.951 millones de parámetros totales, solo unos 3.000 millones se activan por token, lo que reduce sustancialmente el coste computacional en inferencia. La atención combina un mecanismo GDN (Grouped Dot-product Attention) con atención completa, un diseño híbrido que busca equilibrar eficiencia y capacidad de modelado de dependencias largas. Esta arquitectura es heredera directa de la serie Qwen3.5, como se indica en la documentación de vLLM-Ascend.

No se dispone de información pública sobre el dataset de entrenamiento, el número de tokens procesados ni las técnicas de alineación (RLHF, DPO, etc.) empleadas. El pipeline declarado es `image-text-to-text`, lo que implica que el modelo ha sido entrenado para procesar entradas multimodales (imagen y texto) y generar respuestas textuales, probablemente mediante un codificador visual y un decodificador de lenguaje. Los detalles exactos de la fase de entrenamiento no están disponibles en la información proporcionada.

## Capacidades

- Procesamiento multimodal: acepta imágenes y texto como entrada, generando respuestas textuales (pipeline image-text-to-text).
- Conversación interactiva: etiquetado como `conversational`, apto para diálogos multi-turno.
- Razonamiento y generación de texto: al ser un modelo de 35B con 3B activos, ofrece capacidades de razonamiento, comprensión y generación propias de la familia Qwen3.6.
- Eficiencia computacional: gracias a la arquitectura MoE, mantiene un coste de inferencia bajo en comparación con modelos densos del mismo tamaño.
- Compatibilidad con ecosistemas estándar: integrable con vLLM, Transformers y otras herramientas que soporten safetensors y arquitectura Qwen3.5-MoE.
- No se confirma soporte explícito de tool calling, function calling ni modo agente en la información disponible.

## Casos de uso

- Asistentes visuales conversacionales: el modelo puede responder preguntas sobre imágenes (por ejemplo, describir contenido, identificar objetos o interpretar gráficos) en un diálogo continuo, gracias a su pipeline multimodal y su capacidad conversacional.
- Análisis de documentos escaneados: combinado con OCR, puede procesar capturas de documentos y extraer información relevante, útil en automatización de back-office.
- Moderación de contenido visual: puede clasificar o describir imágenes para detectar contenido inapropiado, con la ventaja de un coste de inferencia reducido por su MoE.
- Asistencia en entornos con recursos limitados: al activar solo 3B parámetros, puede desplegarse en GPUs de gama media (p.ej., 24 GB VRAM) para tareas de visión-lenguaje, donde un modelo denso de 35B sería inviable.
- Chatbots especializados con contexto visual: integración en plataformas de atención al cliente donde el usuario adjunta capturas o fotos y el modelo responde con instrucciones o soluciones.
- Generación de descripciones accesibles: crear textos alternativos para imágenes en aplicaciones web o móviles, mejorando la accesibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni evaluaciones multimodales específicas (como MMMU o VQAv2) para esta versión concreta del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: con 35B parámetros totales, en FP16 se requieren aproximadamente 70 GB de VRAM; en int8 (~35 GB) y en int4 (~18 GB). Sin embargo, al ser MoE, la memoria necesaria para los parámetros activos es menor, pero los pesos completos deben residir en memoria. No se dispone de cuantizaciones oficiales confirmadas.
- GPU recomendadas: para FP16, GPU de servidor como A100 80GB o H100; para cuantización int4, una RTX 4090 (24 GB) podría ser suficiente si se usa una versión cuantizada adecuada.
- Compatibilidad con consumer GPU: posible con cuantización (p.ej., GGUF o AWQ), aunque no hay confirmación oficial de formatos cuantizados para este modelo.
- Opciones de despliegue: vLLM (compatible según la documentación de vLLM-Ascend), Transformers, FriendliAI (aparece en los resultados de búsqueda) y potencialmente llama.cpp si se generan pesos GGUF.
- Latencia y throughput: no disponibles. Se espera que sea eficiente por la activación dispersa (3B activos), pero no hay mediciones públicas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Multimodal | Licencia |
|---|---|---|---|---|---|
| dendritex-albedo-qwen3.6-35b (este) | 35.95B | ~3B | no disponible | Sí (imagen-texto) | Apache 2.0 |
| Qwen3-30B-A3B | 30B | 3B | 32K | No (solo texto) | Apache 2.0 |
| DeepSeek-V2-Lite | 16B | 2.4B | 32K | No | MIT |

La comparativa se basa en modelos MoE de tamaño similar. Qwen3-30B-A3B es un modelo de texto puro, mientras que este modelo añade capacidades de visión. DeepSeek-V2-Lite es más pequeño y no multimodal. No hay datos de rendimiento comparativo disponibles.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated en HuggingFace; es necesario solicitar y aceptar condiciones adicionales antes de descargarlo.
- Sin información sobre sesgos o alucinaciones: no se han publicado evaluaciones de sesgo ni estudios de robustez para este modelo específico.
- Idiomas no especificados: se desconoce qué lenguas soporta con calidad, lo que limita su uso en producción multilingüe sin pruebas previas.
- Contexto no documentado: la longitud máxima de contexto no se ha publicado; esto puede afectar a tareas que requieran ventanas largas.
- Riesgo de alucinación visual: al ser multimodal, puede generar descripciones incorrectas de imágenes; se recomienda verificación humana en aplicaciones críticas.
- Sin cuantizaciones oficiales: no se ofrecen pesos cuantizados, por lo que el despliegue en hardware limitado requiere conversión manual (p.ej., a GGUF) con posibles pérdidas de calidad.
- Modelo en fase experimental: el nombre incluye "stages-v3" y fechas de entrenamiento, lo que sugiere versiones iterativas sin estabilidad garantizada para producción.

## Enlaces

- HuggingFace (modelo principal): https://huggingface.co/SusanHill/dendritex-albedo-qwen3.6-35b-stages-v3-p97-0818-1957
- Versión anterior v3 (0814): https://huggingface.co/SusanHill/dendritex-albedo-qwen3.6-35b-stages-v3-0814-0100
- Versión v1 (0812): https://huggingface.co/SusanHill/dendritex-albedo-qwen3.6-35b-stages-v1-0812-2349
- Documentación vLLM-Ascend para Qwen3.6-35B-A3B: https://docs.vllm.ai/projects/ascend/en/v0.18.0/tutorials/models/Qwen3.6-35B-A3B.html
- Entrada en FriendliAI: https://friendli.ai/models/SusanHill/dendritex-albedo-qwen3.6-35b-stages-v3-0814-0100
- Registro en Hippius Hub: https://hub.hippius.com/models/dendritex/albedo-qwen3.6-35b-1
