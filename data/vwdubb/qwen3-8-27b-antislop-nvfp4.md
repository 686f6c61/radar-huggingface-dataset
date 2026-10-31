# vwdubb/Qwen3.8-27B-antislop-NVFP4

## Resumen

Qwen3.8-27B-antislop-NVFP4 es una versión cuantizada (formato NVFP4, 8 bits según los tags del repositorio) del modelo AlexWortega/Qwen3.8-27B-antislop, publicada por el usuario vwdubb en Hugging Face. El modelo base es un post-entrenamiento de Qwen3.8-27B (Qwen) orientado a escritura creativa: su objetivo es que el texto generado suene menos como un LLM y más como prosa humana, evitando los patrones repetitivos conocidos como "AI slop". El post-entrenamiento se realizó con GRPO contra rúbricas expertas calibradas, siguiendo el enfoque unslop / RL-XAR de Meta FAIR.

El resultado es relevante porque alcanza el puesto 4 de 29 en EQ-Bench 4 (Elo 1320,1), por encima de modelos propietarios mucho mayores como GPT-5.5 o Claude Opus 4.7/4.8 según ese benchmark. El pipeline declarado es image-text-to-text, lo que sugiere capacidades multimodales heredadas de la familia Qwen3.8, aunque el entrenamiento antislop se hizo sobre una porción solo de texto. La cuantización NVFP4 reduce el tamaño del repositorio a 21,9 GB, haciéndolo más accesible para inferencia local. Nota: aunque el nombre indica "27B", el dato real de safetensors refleja 18.164.649.200 parámetros (~18,2B), posiblemente por la cuantización o por una discrepancia de nomenclatura del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8, arquitectura detallada no disponible) |
| Parametros totales | 18.164.649.200 (~18,2B, dato real de safetensors; el nombre indica 27B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 32768 tokens (según comando de despliegue recomendado en la model card) |
| Tipos de cuantizacion | NVFP4 (modelopt, etiquetado como 8-bit) |
| Idiomas soportados | no disponible (el entrenamiento antislop usa datos en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantizado NVFP4); existe también una versión GGUF del modelo base |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B y aplica un post-entrenamiento por refuerzo con GRPO (Group Relative Policy Optimization) sobre una porción de datos exclusivamente textual de prosa. La innovación central es el uso de rúbricas expertas calibradas como recompensa de RL: para cada extracto experto (tuits del Broad Twitter Corpus, resúmenes científicos de arXiv y ensayos de blogs como los de Paul Graham, Sivers o sama) se genera una rúbrica por ítem que se congela durante toda la ejecución, evitando el derivo de rúbricas. Un juez calibrado basado en Claude Opus puntúa cada candidato de 0 a 10 con un prompt ciego a la longitud, y la recompensa se calibra por dominio mediante la fórmula `reward = L(words, target) · σ(a_d · (q − μ_d))`, donde L es un factor de longitud respecto al objetivo del ítem.

El entrenamiento se ejecutó con verl sobre Qwen3.8-27B con batch 128 (16 prompts × 8 muestras), 100 pasos, learning rate 2e-5 y coeficiente KL de 0,002, con el modo thinking desactivado. La generación se sirvió con vLLM colocalizado con FSDP. Durante los 100 pasos la recompensa media subió de ~0,35 a ~0,55 y la entropía se asentó de 1,5 a ~0,43, señal de convergencia hacia una voz consistente. Esta versión concreta añade la cuantización NVFP4 mediante la herramienta modelopt de NVIDIA, sin cambios en el comportamiento del modelo según el cuantizador.

## Capacidades

- Generación de prosa de alta calidad con voz concreta y natural, optimizada contra los patrones típicos de escritura de LLM (clichés, finales motivacionales genéricos, lenguaje abstracto).
- Escritura creativa y conversacional (tags creative-writing y conversational), con especial mejora en tuits y ensayos de blog según los datos de evaluación.
- Pipeline image-text-to-text declarado, lo que sugiere entrada de imagen y texto (heredado de la familia Qwen3.8), aunque no hay documentación específica sobre sus capacidades visuales en este finetune.
- Modo thinking heredado de Qwen3.8, con soporte de razonamiento desactivable (recomendado servirlo con thinking off y parser de razonamiento qwen3).
- Estilística adaptada a tres dominios: tuits, artículos científicos (abstracts) y ensayos de blog.
- No hay información sobre tool calling, function calling ni capacidades de agente en la documentación disponible.

## Casos de uso

- Escritura creativa y ficción interactiva: el modelo está específicamente afinado para producir prosa que evita los tics de los LLM (frases vacías, estructuras predecibles), ideal para narrativa, roleplay y herramientas de coescritura.
- Generación de contenido para redes sociales: el dominio de tuits es donde obtiene mejor puntuación (8,76/10 frente a 7,18 del base), útil para redactar publicaciones con voz humana y concreta.
- Redacción de ensayos y blogs: destaca en el dominio de blogs (8,03/10 frente a 5,53 del base), adecuado para asistentes de escritura de artículos de opinión y ensayos largos.
- Borradores de abstracts científicos: entrenado con abstracts de arXiv, puede asistir en la redacción de resúmenes técnicos, aunque es el dominio más débil (6,94/10).
- Chatbots conversacionales con tono natural: la mejora general de calidad de prosa lo hace adecuado para asistentes donde la naturalidad del texto importa más que la precisión factual.
- Despliegue local en consumer hardware: gracias a la cuantización NVFP4 (21,9 GB), cabe en GPUs de gama alta de consumo, útil para desarrolladores que quieren un modelo de escritura creativa sin depender de APIs propietarias.
- Investigación reproducible en RL para estilo de escritura: el autor publica el entorno de RL (unslop-harbor) y documentación para reproducir el entrenamiento.

## Benchmarks y rendimiento

Resultados en prosa held-out, puntuados por el mismo juez calibrado (Claude Opus, ciego a longitud) sobre rúbricas congeladas:

| Modelo | Media q (0–10) | Tuits | Artículos | Blogs |
|---|---|---|---|---|
| Qwen3.8-27B base | 6,31 | 7,18 | 5,75 | 5,53 |
| **Qwen3.8-27B-antislop** | **8,28** | **8,76** | 6,94 | **8,03** |
| Hemmingway-1 (mismo base) | 7,10 | 7,66 | 7,06 | 6,56 |

Win-rate pairwise: 50–0 frente al base (2 empates) y 82,7% (43–6, 3 empates) frente a Hemmingway-1.

EQ-Bench 4 (configuración oficial del leaderboard, Elo anclado):

| Puesto | Modelo | Elo (IC 95%) |
|---|---|---|
| 1 | claude-opus-5 | 1382,9 (1366–1401) |
| 2 | moonshotai/kimi-k3 | 1334,6 (1321–1349) |
| 3 | claude-fable-5 | 1330,9 (1320–1342) |
| **4** | **Qwen3.8-27B-antislop** | **1320,1 (1309–1332)** |
| 5 | openai/gpt-5.5 | 1314,4 (1304–1323) |
| 6 | claude-opus-4-7 | 1307,9 (1298–1318) |
| 7 | claude-opus-4-8 | 1277,8 (1265–1289) |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) para capacidades generales de razonamiento, código o matemáticas en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio cuantizado ocupa 21,9 GB; con NVFP4/8-bit se estima que cabría en una GPU con 24 GB de VRAM (RTX 3090, RTX 4090, RTX 5090) para inferencia con contexto moderado, aunque la cifra exacta de VRAM en ejecución no está documentada.
- Para el modelo base en precisión completa (BF16), se recomendarían GPUs de datacenter tipo A100/H100 80 GB (estimación, no dato publicado).
- Cabe en GPU consumer de 24 GB gracias a la cuantización NVFP4, lo que es uno de los atractivos principales de esta variante.
- Despliegue recomendado por el autor: vLLM con parser de razonamiento qwen3 y thinking desactivado:
  `vllm serve AlexWortega/Qwen3.8-27B-antislop --reasoning-parser qwen3 --default-chat-template-kwargs '{"enable_thinking": false}' --max-model-len 32768`
- Existe una versión GGUF del modelo base (rawmodels/Qwen3.8-27B-antislop-GGUF), lo que permite despliegue con llama.cpp u Ollama; no hay constancia de GGUF para esta variante NVFP4.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen3.8-27B-antislop (base del cuantizado) | ~27B (nombre) / 18,2B en safetensors | 32768 | Apache 2.0 | Escritura creativa antislop con GRPO |
| Hemmingway-1 (Altworld) | Mismo base (Qwen3.8-27B) | no disponible | no disponible | Finetune de escritura creativa del mismo base; pierde 82,7% del win-rate pairwise frente a antislop |
| Qwen/Qwen3.8-27B (base original) | ~27B | no disponible | no disponible | Modelo generalista; media q 6,31 frente a 8,28 de antislop en prosa |

Nota: esta variante NVFP4 de vwdubb es funcionalmente equivalente al modelo de AlexWortega pero con pesos cuantizados para reducir requisitos de memoria.

## Limitaciones y advertencias

- Discrepancia de nomenclatura: el nombre indica 27B pero los safetensors contienen ~18,2B de parámetros; conviene verificar qué versión se descarga realmente.
- El entrenamiento antislop se realizó solo sobre prosa en inglés (tweets, abstracts de arXiv, blogs en inglés), por lo que la mejora de estilo probablemente no se traslade a otros idiomas; el castellano u otros idiomas no están documentados.
- Es el dominio de abstracts científicos donde la mejora es menor (6,94/10), por lo que no es la mejor opción para escritura técnica o académica rigurosa.
- El juez del entrenamiento y de la evaluación es el mismo tipo de modelo (Claude Opus calibrado), lo que introduce un posible sesgo de auto-preferencia en los resultados publicados; EQ-Bench 4 sí usa un panel de jueces independiente.
- El pipeline declarado es image-text-to-text, pero el post-entrenamiento fue solo de texto; las capacidades visuales heredadas no están evaluadas y podrían haberse degradado.
- Problema conocido con la plantilla de chat de Qwen: la respuesta puede arrastrar un `</think> huérfano` si no se sirve con thinking desactivado y parser de razonamiento, lo que contamina las evaluaciones y las salidas.
- Riesgo de alucinación, sesgos y rendimiento en tareas de razonamiento/código: no disponibles datos específicos; al ser un finetune orientado a estilo, puede haber sufrido alineación (alignment tax) en capacidades generales.
- La cuantización NVFP4 puede introducir una ligera degradación respecto al modelo base en BF16; no hay evaluaciones publicadas de la variante cuantizada.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial.

## Enlaces

- Modelo cuantizado (esta ficha): https://huggingface.co/vwdubb/Qwen3.8-27B-antislop-NVFP4
- Modelo base: https://huggingface.co/AlexWortega/Qwen3.8-27B-antislop
- Demo (Space): https://huggingface.co/spaces/AlexWortega/antislop-27b
- Versión GGUF: https://huggingface.co/rawmodels/Qwen3.8-27B-antislop-GGUF
- Paper original unslop / RL-XAR (Meta FAIR): https://facebookresearch.github.io/RAM/blogs/unslop/
- Entorno de RL (dataset): https://huggingface.co/datasets/rawmodels/unslop-harbor
- Web del proyecto: https://www.rawmodels.ai
- EQ-Bench 4 (repositorio): https://github.com/EQ-bench/eqbench4
