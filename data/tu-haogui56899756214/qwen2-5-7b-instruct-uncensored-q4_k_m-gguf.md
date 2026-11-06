# tu-haogui56899756214/Qwen2.5-7B-Instruct-Uncensored-Q4_K_M-GGUF

## Resumen

Qwen2.5-7B-Instruct-Uncensored-Q4_K_M-GGUF es una cuantización en formato GGUF del modelo Orion-zhen/Qwen2.5-7B-Instruct-Uncensored, un ajuste fino del conocido Qwen2.5-7B-Instruct de Alibaba. El modelo base parte de la arquitectura transformer densa de Qwen2.5, con 7.615.616.512 parámetros, y ha sido sometido a un proceso de desalineación (abliteration/DPO sobre datos sin rechazo) para eliminar los mecanismos de rechazo de contenido del modelo original. Esta versión concreta, publicada por el usuario tu-haogui56899756214, se ha convertido a GGUF con cuantización Q4_K_M mediante el espacio GGUF-my-repo de ggml.ai, lo que permite ejecutarlo en llama.cpp en hardware de consumo.

La relevancia de esta ficha radica en que ilustra un caso típico de la comunidad open source: modelos derivados que priorizan la ausencia de restricciones de contenido sobre la seguridad alineada. El resultado es un modelo conversacional de 7B parámetros, con contexto nativo de Qwen2.5 (hasta 32.768 tokens en el modelo original, aunque la model card de esta cuantización no lo confirma), orientado a generación de texto en chino e inglés. Su licencia GPL-3.0 y su naturaleza "uncensored" lo hacen inadecuado para despliegues comerciales convencionales sin revisión legal y de seguridad.

Es importante señalar que la información disponible sobre esta cuantización concreta es escasa: la model card es prácticamente la plantilla automática de GGUF-my-repo, sin benchmarks ni detalles de entrenamiento del ajuste fino. Los datasets de desalineación sí aparecen listados en los metadatos, lo que permite inferir el proceso, pero no hay métricas publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2.5) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en esta cuantizacion (el Qwen2.5-7B-Instruct original soporta hasta 32.768 tokens; la model card no lo confirma) |
| Tipos de cuantizacion | Q4_K_M (unica publicada en este repo) |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | GPL-3.0 |
| Formato de pesos | GGUF |
| Tamano del repo | 4,7 GB |
| Modelo base | Orion-zhen/Qwen2.5-7B-Instruct-Uncensored |
| Descargas | 55 |
| Likes | 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only denso con atención de múltiples cabezas, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). El modelo original de Alibaba fue preentrenado sobre un corpus multilingüe masivo (los detalles exactos de tokens no se recogen en la información disponible para esta ficha) y posteriormente ajustado con instrucciones y preferencias humanas. Sobre esa base, Orion-zhen aplicó un proceso de desalineación que, según los datasets listados, combina DPO (Direct Preference Optimization) sobre pares sin rechazo y datos tóxicos en inglés y chino: NobodyExistsOnTheInternet/ToxicQAFinal, anthracite-org/kalo-opus-instruct-22k-no-refusal, Orion-zhen/dpo-toxic-zh, unalignment/toxic-dpo-v0.2 y Crystalcareai/Intel-DPO-Pairs-Norefusals. No se especifica el número de tokens de entrenamiento ni la composición exacta de las mezclas.

La innovación técnica de esta ficha no está en la arquitectura, sino en el pipeline de cuantización: la conversión a GGUF Q4_K_M mediante llama.cpp reduce el peso de ~15 GB en FP16 a 4,7 GB, manteniendo una calidad aceptable para inferencia en CPU y GPU de consumo. No hay datos publicados sobre decodificación especulativa, atención lineal ni otras optimizaciones específicas en esta cuantización.

## Capacidades

- Generación de texto conversacional multi-turno en chino e inglés.
- Razonamiento general y respuesta a instrucciones, heredado de Qwen2.5-7B-Instruct.
- Generación de código y matemáticas básicas (capacidad típica de la familia Qwen2.5, no verificada con benchmarks en esta ficha).
- Respuestas sin rechazo ante contenido sensible: el ajuste fino elimina los mecanismos de negativa del modelo original.
- Soporte de tool calling / function calling: no confirmado en la model card de esta cuantización; el Qwen2.5-7B-Instruct original lo soporta, pero el ajuste fino podría haber degradado esta capacidad.
- Capacidades de agente y razonamiento multi-paso: no verificadas.
- Capacidades multilingües limitadas a zh y en según los metadatos; el Qwen2.5 original soporta más idiomas, pero el ajuste fino se centra en chino e inglés.
- Modo "thinking" o visión/audio: no disponible.

## Casos de uso

- Investigación sobre desalineación y seguridad de LLM: el modelo sirve como caso de estudio para analizar cómo el DPO sin rechazo altera el comportamiento de un modelo alineado, comparando respuestas con el Qwen2.5-7B-Instruct original en un entorno controlado.
- Generación de contenido creativo sin filtros: escritura de ficción, guiones o narrativa que aborde temas sensibles (violencia, conflictos morales) sin las negativas automáticas del modelo base, en inglés o chino.
- Despliegue local en hardware de consumo: con 4,7 GB en Q4_K_M, cabe en GPUs de 8 GB de VRAM o incluso en CPU con llama.cpp, lo que permite experimentar sin infraestructura cloud.
- Análisis de textos tóxicos y datasets de moderación: el modelo puede generar ejemplos de lenguaje tóxico para entrenar clasificadores de contenido, aprovechando su falta de rechazo para producir muestras difíciles.
- Pruebas de robustez y red teaming: evaluar cómo responde un modelo sin alineación a prompts adversarios, como paso previo al diseño de defensas en sistemas de producción.
- Chat conversacional en chino para prototipos: su soporte nativo de zh y su tamaño compacto lo hacen útil para demos locales de asistentes en ese idioma, siempre que el contenido generado se revise.
- Evaluación de pipelines de cuantización: comparar la calidad de Q4_K_M frente al modelo en FP16 para medir la degradación introducida por la cuantización en tareas de generación libre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~5-6 GB para el archivo Q4_K_M (4,7 GB) más overhead de contexto y KV cache; con contexto de 4.096 tokens, alrededor de 6-7 GB en total.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090; en el lado profesional, A100 o H100 para mayor throughput, aunque el modelo es pequeño para esas GPUs.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más de VRAM (RTX 3060 Ti, RTX 4060, RTX 3070, etc.); también en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (importando el GGUF), LM Studio, y servidores compatibles con la API de OpenAI mediante llama-server.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen2.5-7B-Instruct-Uncensored Q4_K_M) | 7,6 B | no disponible (base: 32k) | GPL-3.0 | GGUF | Sin benchmarks publicados; sin rechazo |
| Qwen2.5-7B-Instruct (original) | 7,6 B | 32.768 tokens | Apache-2.0 (según el modelo original de Alibaba) | safetensors, GGUF | Alineado, con benchmarks publicados por Alibaba |
| Orion-zhen/Qwen2.5-7B-Instruct-Uncensored | 7,6 B | no disponible | GPL-3.0 | safetensors | Modelo base de esta cuantización, sin rechazo |
| Mistral-7B-Instruct-v0.3 | 7,2 B | 32.768 tokens | Apache-2.0 | safetensors, GGUF | Alternativa alineada de tamaño similar, con benchmarks públicos |

La comparación directa de rendimiento no es posible porque esta cuantización no publica métricas. La diferencia principal frente al Qwen2.5-7B-Instruct original es la eliminación de rechazos y el cambio de licencia (de Apache-2.0 a GPL-3.0), lo que restringe su uso comercial.

## Limitaciones y advertencias

- Modelo explícitamente "uncensored": puede generar contenido tóxico, violento, sexual o ilegal sin filtros; no apto para aplicaciones orientadas al público sin moderación adicional.
- Riesgo elevado de alucinación, agravado por el ajuste fino sobre datos DPO de baja calidad y por la cuantización Q4_K_M, que introduce pérdida de precisión.
- Sesgos conocidos: los datasets de entrenamiento (ToxicQA, toxic-dpo) pueden reforzar sesgos tóxicos y estereotipos; no hay evaluación de sesgos publicada.
- Limitaciones de idioma: solo chino e inglés según los metadatos; el rendimiento en castellano no está garantizado.
- Licencia GPL-3.0: impone obligaciones de copyleft para uso comercial y distribución; revisar compatibilidad antes de integrar en productos propietarios.
- Contexto no confirmado en esta cuantización: la model card no especifica la ventana efectiva; usar valores conservadores (2.048-4.096 tokens) en llama-server si no se verifica.
- Tool calling y capacidades de agente no confirmadas tras el ajuste fino; probar antes de usar en pipelines automatizados.
- Repo con 55 descargas y 0 likes: poca validación comunitaria; el autor de la cuantización es un usuario particular, no el equipo de ggml.ai ni Alibaba.
- Fecha de creación futura (2026-10-31) en los metadatos: posible error de la plataforma; tratar con cautela la trazabilidad del artefacto.

## Enlaces

- Hugging Face (esta cuantización): https://huggingface.co/tu-haogui56899756214/Qwen2.5-7B-Instruct-Uncensored-Q4_K_M-GGUF
- Modelo base del ajuste fino: https://huggingface.co/Orion-zhen/Qwen2.5-7B-Instruct-Uncensored
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Dataset ToxicQAFinal: https://huggingface.co/datasets/NobodyExistsOnTheInternet/ToxicQAFinal
- Dataset kalo-opus-instruct-22k-no-refusal: https://huggingface.co/datasets/anthracite-org/kalo-opus-instruct-22k-no-refusal
- Dataset dpo-toxic-zh: https://huggingface.co/datasets/Orion-zhen/dpo-toxic-zh
- Dataset toxic-dpo-v0.2: https://huggingface.co/datasets/unalignment/toxic-dpo-v0.2
- Dataset Intel-DPO-Pairs-Norefusals: https://huggingface.co/datasets/Crystalcareai/Intel-DPO-Pairs-Norefusals
