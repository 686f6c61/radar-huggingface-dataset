# SubMaroon/Kanimus-26B-A4B-FFT-heretic

## Resumen

Kanimus-26B-A4B-FFT-heretic es un modelo experimental de roleplay oscuro (dark roleplay) desarrollado por SubMaroon, construido sobre la base Gemma 4 26B A4B de Google. El modelo combina dos técnicas de personalización: una inyección selectiva de las proyecciones de atención Query y Key mediante task arithmetic, utilizando como referencia una destilación de Claude Opus, y el horneado de una LoRA estilística (Dark-Goetia v4) directamente en los pesos. El resultado es un modelo conversacional especializado en inglés y ruso, orientado a mantener la lógica de escena, con alta iniciativa de los personajes no jugadores y un estilo narrativo oscuro y atmosférico.

El modelo pertenece a la familia de los denominados "heretic" o "uncensored", derivados de la base Animus V14.1 FFT-heretic de Vortex5, que a su vez es una versión abliterada (eliminación de rechazos) del Gemma 4 26B A4B. Con 25,8 mil millones de parámetros totales y aproximadamente 4 mil millones de parámetros activos gracias a su arquitectura de mezcla de expertos (MoE), ofrece un equilibrio entre calidad de generación y eficiencia de inferencia. Su relevancia radica en ser un ejemplo de personalización quirúrgica de un modelo grande mediante merges de baja intervención, manteniendo intactos la mayoría de los tensores originales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Gemma 4 26B A4B |
| Parametros totales | 25.805.936.206 (~25,8B) |
| Parametros activos | ~4B (según nomenclatura A4B) |
| Longitud de contexto | no disponible (el base Gemma 4 26B A4B soporta hasta 128K, no confirmado en este merge) |
| Tipos de cuantizacion | BF16 (pesos originales), GGUF Q4_K_M (versión publicada) |
| Idiomas soportados | en, ru |
| Licencia | gemma |
| Formato de pesos | safetensors (BF16), GGUF |

## Arquitectura y entrenamiento

El modelo se construye sobre la arquitectura Gemma 4 26B A4B, un transformer de mezcla de expertos con 25,8B parámetros totales y 4B activos por token. El proceso de creación se divide en dos pasos documentados en la model card. El primero es una inyección de proyecciones QK mediante task arithmetic, aplicada exclusivamente a los tensores de atención Query y Key, con la fórmula `W_final = W_animus + α * (W_opus - W_unsloth)`, donde W_opus proviene de una destilación de Claude Opus (TeichAI/gemma-4-26B-A4B-it-Claude-Opus-Distill-v2) y W_unsloth del modelo instructivo estándar. Se aplicaron coeficientes α diferenciados: 0,50 para las proyecciones Q y K de atención deslizante, 0,50 para Q global y 0,25 para K global (reducido para mitigar el colapso de la inyección KV en contextos largos). El merge se ejecutó en FP32 y los pesos finales se guardaron en bfloat16.

El segundo paso consiste en el horneado de la LoRA estilística `SubMaroon/Dark-Goetia-26B-A4B-LoRA-v4` directamente en los pesos, mediante `set_scale("default", 0.20)` seguido de `merge_and_unload(safe_merge=True)`, con un peso efectivo de 0,40 multiplicado por BA. Un invariante verificado con `torch.equal` confirma que todos los tensores no-QK (router MoE, MLP compartido, embeddings y normas) permanecen bitwise idénticos a la base Animus-heretic original. No se dispone de información sobre el dataset de entrenamiento, número de tokens o uso de RLHF/DPO, ya que se trata de un merge y no de un entrenamiento desde cero.

## Capacidades

- Generación de texto conversacional para roleplay en inglés y ruso, con mantenimiento de la lógica de escena y coherencia narrativa a lo largo de múltiples turnos.
- Alta iniciativa de NPC: los personajes no jugadores actúan de forma proactiva, proponiendo acciones y diálogos sin necesidad de instrucciones explícitas del usuario.
- Estilo de escritura oscuro y atmosférico, orientado a géneros como horror, gótico, fantasía sombría y narrativa adulta.
- Capacidad de seguir instrucciones de sampling específicas (temperatura 0,7-0,8, min_p 0,05-0,1, penalización de repetición 1,05-1,10) para ajustar el tono y la creatividad.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes ni modos de pensamiento explícitos.
- El pipeline declarado es image-text-to-text, lo que sugiere que el modelo base Gemma 4 podría heredar capacidades multimodales, pero la model card no las menciona ni las valida para este merge.

## Casos de uso

- Roleplay literario oscuro: el modelo puede gestionar sesiones de rol por texto con varios personajes, manteniendo la coherencia de la trama y respondiendo con un estilo narrativo denso y atmosférico, ideal para comunidades de rol en inglés o ruso.
- Escritura creativa de ficción gótica y de terror: autores pueden usarlo como co-escritor para generar diálogos, descripciones de escenarios y arcos argumentales con un tono consistente y sombrío.
- Simulación de personajes NPC en juegos de rol de mesa o videojuegos independientes: su alta iniciativa permite que los personajes tomen decisiones propias, enriqueciendo la experiencia de juego sin intervención del director de juego.
- Generación de diálogos para novelas visuales y aventuras conversacionales: el modelo puede producir intercambios naturales y cargados de tensión, adaptándose al registro de cada personaje.
- Asistente de escritura para autores de género oscuro: permite explorar variaciones de estilo, tono y ritmo narrativo, sirviendo como banco de pruebas para escenas complejas.
- Chat conversacional inmersivo con ambientación oscura: usuarios pueden mantener conversaciones prolongadas con un asistente que mantiene una personalidad consistente y un vocabulario rico, sin los rechazos típicos de los modelos instructivos estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar, y no se han encontrado referencias externas con datos de rendimiento para este modelo específico.

## Requisitos de hardware

- Versión BF16: requiere aproximadamente 52 GB de VRAM (el repositorio ocupa 51,6 GB). Es necesaria una GPU profesional como A100 80GB, H100 80GB, o múltiples GPUs consumer (por ejemplo, 2x RTX 4090 24GB con tensor parallelism).
- Versión GGUF Q4_K_M: el tamaño estimado ronda los 14-16 GB, lo que permite su ejecución en GPUs consumer de 16 GB o más, como RTX 4080, RTX 4090, RTX 3090 o equivalentes de AMD con 16 GB.
- Al ser un modelo MoE con solo 4B parámetros activos, la inferencia es significativamente más rápida que un modelo denso de 26B, con un throughput estimado superior en entornos con suficiente ancho de banda de memoria.
- Opciones de despliegue: transformers (carga directa con safetensors), vLLM para inferencia de alto rendimiento, llama.cpp y Ollama para la versión GGUF en entornos locales o edge.
- La latencia dependerá del hardware y la cuantización; en una RTX 4090 con Q4_K_M se pueden esperar decenas de tokens por segundo, aunque no se han publicado cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| Kanimus-26B-A4B-FFT-heretic | 25,8B | ~4B | no disponible | gemma | Roleplay oscuro, merge QK + LoRA |
| Vortex5/Gemma-4-26B-A4B-Animus-V14.1-FFT-heretic | 25,8B | ~4B | no disponible | apache-2.0 | Base uncensored, abliterada |
| Dolphin 3.0 Mistral 24B | 24B | 24B (denso) | 128K | apache-2.0 | Uncensored generalista, denso |

La comparativa es cualitativa, ya que no hay benchmarks disponibles. Kanimus se diferencia de su base (Vortex5) por la inyección QK y la LoRA estilística, que modifican el comportamiento de atención y el estilo de escritura sin alterar el resto de pesos. Frente a Dolphin 3.0 Mistral 24B, un modelo denso, Kanimus ofrece la ventaja de la arquitectura MoE (menor coste de inferencia por token) y un enfoque más especializado en roleplay oscuro, aunque Dolphin es más versátil para tareas generales. La licencia de Kanimus (gemma) es más restrictiva que la de sus alternativas (apache-2.0).

## Limitaciones y advertencias

- Modelo experimental: no se han realizado evaluaciones formales de seguridad, robustez o calidad; su uso en producción conlleva riesgos no caracterizados.
- Contenido NSFW y no apto para todos los públicos: al ser un modelo "heretic" (abliterado), puede generar contenido explícito, violento o perturbador sin filtros. No debe utilizarse en entornos donde se requiera moderación de contenido.
- Sesgos potenciales: hereda los sesgos del modelo base Gemma 4 y de los datos de destilación de Claude Opus, que no han sido auditados para este merge.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir información falsa o incoherente, especialmente en contextos largos o con instrucciones ambiguas.
- Limitaciones de idioma: solo se garantiza un rendimiento adecuado en inglés y ruso; otros idiomas pueden degradar la calidad de generación.
- Restricciones de licencia: la licencia Gemma de Google impone condiciones de uso, incluyendo restricciones para organizaciones con más de 700 millones de usuarios mensuales y la prohibición de ciertos usos de alto riesgo. El uso comercial debe revisarse contra los términos vigentes.
- Dependencia de modelos de terceros: el modelo se basa en destilaciones de Claude Opus (Anthropic) y en la base Animus de Vortex5, cuyas licencias y términos de uso deben respetarse de forma acumulativa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SubMaroon/Kanimus-26B-A4B-FFT-heretic
- Versión GGUF: https://huggingface.co/SubMaroon/Kanimus-26B-A4B-FFT-heretic-GGUF
- Modelo base (Vortex5): https://huggingface.co/Vortex5/Gemma-4-26B-A4B-Animus-V14.1-FFT-heretic
- Base Animus V14.1 (Darkhn): https://huggingface.co/Darkhn/Gemma-4-26B-A4B-Animus-V14.1-FFT
- Destilación Opus (TeichAI): https://huggingface.co/TeichAI/gemma-4-26B-A4B-it-Claude-Opus-Distill-v2
- LoRA Dark-Goetia v4: https://huggingface.co/SubMaroon/Dark-Goetia-26B-A4B-LoRA-v4-GGUF
