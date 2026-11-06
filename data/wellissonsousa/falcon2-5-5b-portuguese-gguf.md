# WellissonSousa/Falcon2-5.5B-Portuguese-GGUF

## Resumen

Falcon2-5.5B-Portuguese-GGUF es una cuantización en formato GGUF de un modelo derivado de tiiuae/falcon-11B, publicada por el usuario WellissonSousa en Hugging Face. El modelo subyacente se presenta como un merge (fusión) de modelos realizado con mergekit y orientado al idioma portugués, con un total de 5.465.415.680 parámetros según los pesos en safetensors. La model card original remite a ssmits/Falcon2-5.5B-Portuguese como fuente del checkpoint convertido a GGUF mediante el espacio GGUF-my-repo de ggml.ai y llama.cpp.

El interés de esta ficha es doble: por un lado, documenta una variante comunitaria de la familia Falcon 2 (arquitectura transformer decoder-only de TII) reducida a aproximadamente la mitad de parámetros mediante merge; por otro, ilustra el flujo habitual de publicación de pesos cuantizados en GGUF para inferencia local con llama.cpp. La licencia declarada es Apache 2.0, lo que facilita su uso comercial, aunque conviene verificar la trazabilidad completa del merge.

La información pública disponible es escasa: no se detallan la composición exacta del merge, el número de tokens de entrenamiento, la longitud de contexto efectiva ni resultados de benchmarks. Esta ficha recoge lo que se puede afirmar con rigor a partir de los metadatos y de la model card, y marca explícitamente como "no disponible" todo aquello que no está documentado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Falcon 2 / falcon-11B); merge con mergekit |
| Parámetros totales | 5.465.415.680 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | GGUF (el repo contiene el artefacto GGUF Q5_K_M según la model card heredada) |
| Idiomas soportados | Portugués (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo se apoya en la arquitectura Falcon 2 de TII, un transformer decoder-only con atención causal. El checkpoint publicado aquí no es un entrenamiento desde cero, sino un merge realizado con mergekit a partir de tiiuae/falcon-11B, que da como resultado un modelo de aproximadamente 5.500 millones de parámetros. Posteriormente se convirtió a GGUF mediante llama.cpp y el espacio GGUF-my-repo de ggml.ai, generando el artefacto Q5_K_M que da nombre al repositorio.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF/DPO ni de innovaciones técnicas específicas del merge (por ejemplo, qué método de fusión se aplicó: SLERP, TIES, DARE u otro). La model card heredada de ssmits/Falcon2-5.5B-Portuguese tampoco aporta estos detalles. Cualquier afirmación sobre el proceso de entrenamiento más allá de lo indicado sería especulativa.

## Capacidades

- Generación de texto conversacional en portugués, orientada a diálogo multi-turno.
- Razonamiento básico y respuesta a instrucciones, heredado del modelo base Falcon 2.
- Generación de código y tareas de matemáticas elementales, en la medida en que el modelo base las soporta (no hay evaluación específica publicada para esta variante).
- Soporte de tool calling / function calling: no documentado para esta variante; depende del modelo base y no está garantizado tras el merge.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: limitadas al portugués según los metadatos; el resto de idiomas no está evaluado.
- Modo "thinking", visión o audio: no disponibles.

## Casos de uso

- Atención al cliente en portugués: el modelo puede gestionar conversaciones multi-turno en portugués brasileño/europeo, aunque la ventana de contexto efectiva no está documentada y conviene validarla empíricamente antes de desplegar.
- Generación de contenido editorial en portugués: redacción de borradores, resúmenes y reescritura de textos, aprovechando el ajuste idiomático del merge.
- Asistente de documentación técnica: generación de explicaciones y ejemplos de código en portugués para equipos de desarrollo lusohablantes.
- Prototipado local en estaciones de trabajo: al estar en GGUF Q5_K_M y rondar los 5.500 millones de parámetros, cabe en GPUs de consumo con suficiente VRAM, lo que permite experimentar sin infraestructura cloud.
- Chatbot embebido en aplicaciones de escritorio o móviles: la cuantización Q5_K_M reduce el peso a un tamaño manejable para inferencia con llama.cpp en entornos con recursos limitados.
- Filtrado y clasificación de texto en portugués: tareas de etiquetado, moderación o extracción de información en pipelines ligeros donde no se requiere un modelo de gran escala.
- Fine-tuning ligero posterior: al ser Apache 2.0 y estar en formato GGUF, sirve como base para ajustes con LoRA/QLoRA en portugués, aunque la conversión a safetensors sería necesaria para entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q5_K_M y ~5.500 millones de parámetros, el peso ronda los 3,5–4 GB; se recomienda al menos 6–8 GB de VRAM para margen de contexto y caché KV.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090; en数据中心, A10, L4, A100 o H100 para despliegues concurrentes.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más de VRAM; en 6 GB puede funcionar con contextos cortos.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama (importando el GGUF), y servidores compatibles con la API de endpoints; vLLM y TGI no soportan GGUF de forma nativa sin conversión.
- Latencia y throughput: no disponibles; dependen del hardware y de la longitud de contexto. Como referencia cualitativa, un modelo de ~5,5B en Q5_K_M en una RTX 4090 suele ofrecer decenas de tokens por segundo, pero no hay medición publicada para esta variante.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Falcon2-5.5B-Portuguese-GGUF (este) | 5,47B | no disponible | Apache 2.0 | GGUF | Hugging Face |
| tiiuae/falcon-11B (base) | 11B | no disponible en esta ficha | Apache 2.0 (TII) | safetensors | Hugging Face |
| ssmits/Falcon2-5.5B-Portuguese (origen del merge) | ~5,5B | no disponible | Apache 2.0 | safetensors | Hugging Face |
| Modelos portugueses de ~7B (p. ej. variantes de Llama/Mistral ajustadas a pt) | ~7B | variable según variante | variable | safetensors/GGUF | Hugging Face |

La comparación cuantitativa de rendimiento no es posible porque no hay benchmarks publicados para esta variante ni para el checkpoint de origen en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de Falcon 2 y de un merge comunitario, puede heredar sesgos del modelo base y de los datasets de ajuste no especificados.
- Riesgo de alucinación: presente como en cualquier modelo generativo de esta escala; sin evaluación publicada no se puede acotar su magnitud.
- Limitaciones de contexto e idioma: el modelo está etiquetado solo para portugués; el rendimiento en otros idiomas no está evaluado y probablemente sea deficiente. La longitud de contexto efectiva no está documentada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la trazabilidad del merge (composición exacta de los modelos fusionados) no está detallada, lo que puede complicar la auditoría de licencias en producción.
- Caveats para producción: el repositorio tiene muy poca tracción (65 descargas, 0 likes) y no hay evidencia de validación por parte de la comunidad; se recomienda evaluar exhaustivamente antes de usar en sistemas críticos. La model card heredada menciona un nombre de repositorio distinto (ssmits/...), lo que sugiere una copia o re-publicación sin documentación adicional.
- Formato GGUF Q5_K_M: no apto para fine-tuning directo; requiere conversión a safetensors y reconstrucción del checkpoint.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/WellissonSousa/Falcon2-5.5B-Portuguese-GGUF
- Modelo de origen del merge: https://huggingface.co/ssmits/Falcon2-5.5B-Portuguese
- Modelo base: https://huggingface.co/tiiuae/falcon-11B
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- llama.cpp: https://github.com/ggerganov/llama.cpp
- mergekit: https://github.com/arcee-ai/mergekit
