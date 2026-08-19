# squ0sh/Qwen3.5-2B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING

## Resumen

El modelo `Qwen3.5-2B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING` es un fine-tuning del modelo denso Qwen3.5-2B de Alibaba, realizado por el usuario squ0sh mediante Unsloth sobre un conjunto de cuatro datasets derivados de Claude 4.6 OS. El objetivo declarado es potenciar la generación creativa, el razonamiento y la escritura de ficción, manteniendo los benchmarks del modelo base y añadiendo un modo de "thinking" reducido que imita los bloques de razonamiento de Claude. El autor lo describe como un modelo "HERETIC" y "totalmente sin censura", con la alineación de seguridad eliminada mediante técnicas de abliteración.

Con 2.213 millones de parámetros y una ventana de contexto de 256k tokens, este modelo se posiciona como una opción ligera para tareas de escritura creativa, roleplay y generación de historias, con soporte multimodal (imagen-texto) gracias al encoder visual del Qwen3.5 base. Su licencia Apache 2.0 permite uso comercial, aunque su naturaleza "uncensored" plantea riesgos importantes en entornos de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con encoder visual (Causal Language Model with Vision Encoder) |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 256.000 tokens (por defecto) |
| Tipos de cuantizacion | sugeridos: q4_K_S (no-imatrix) e IQ3_S (imatrix); otros no especificados |
| Idiomas soportados | en, zh (según model card; el base Qwen3.5 soporta 201 idiomas, pero el fine-tune declara solo estos dos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16); se menciona compatibilidad con GGUF vía llama_HF, pero no se confirma la disponibilidad de archivos GGUF en el repo |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B, un transformer causal denso con encoder visual que integra fusión temprana de tokens multimodales. El fine-tuning se realizó con Unsloth sobre cuatro datasets de Claude 4.6 OS, en hardware local. El autor indica que el entrenamiento fue "suave" (mild) para no degradar los benchmarks del modelo base, y que la combinación de los cuatro datasets mejora el razonamiento y la generación de salida, superando al modelo raíz en la mayoría de métricas evaluadas. Además, se redujo el tamaño del "thinking" (los bloques de razonamiento) mediante entrenamiento, de modo que el modelo produce razonamientos más cortos y directos, similares a los de Claude. El proceso incluyó una etapa de "Heretic'ing" (abliteración) que elimina la alineación de seguridad, resultando en un modelo sin rechazos ante peticiones explícitas.

No se proporcionan detalles sobre el número exacto de tokens de entrenamiento, la composición precisa de los datasets ni el uso de técnicas como RLHF o DPO. La información disponible se limita a lo descrito en la model card.

## Capacidades

- Generación de texto creativo: escritura de ficción, ciencia ficción, romance y otros géneros, con prosa vívida y detallada.
- Razonamiento con "thinking blocks": produce bloques de razonamiento tipo Claude antes de la respuesta final, aunque reducidos en tamaño.
- Soporte multimodal: procesa imágenes (probado por el autor) y texto; las capacidades de video no fueron probadas.
- Roleplay y conversación: optimizado para interacción en chat y roleplay, con ajustes de sampler recomendados (smoothing factor 1.5).
- Sin censura: no rechaza peticiones explícitas o controvertidas (eliminación de alineación de seguridad).
- Generación de tramas y subtramas: capaz de crear argumentos, continuar escenas y desarrollar historias coherentes.
- Multilingüe limitado: solo inglés y chino declarados en la model card.

## Casos de uso

- Escritura creativa asistida: autores pueden usar el modelo para generar borradores de capítulos, desarrollar personajes o explorar tramas alternativas en géneros como ciencia ficción o romance. Su capacidad de mantener contexto largo (256k) permite trabajar con novelas completas.
- Roleplay interactivo: plataformas como Silly Tavern o KoboldCpp pueden integrar este modelo para personajes de rol sin restricciones, gracias a su naturaleza "uncensored" y su optimización para conversación multi-turno.
- Generación de subtramas y continuaciones de escenas: el modelo puede sugerir desarrollos narrativos coherentes a partir de un fragmento existente, útil para guionistas o escritores en bloqueo creativo.
- Prototipado de aplicaciones de chat: desarrolladores pueden evaluar rápidamente un modelo de 2B con capacidades de razonamiento y multimodalidad para crear demos de chatbots o asistentes sin coste de inferencia elevado.
- Análisis de imágenes con descripción narrativa: gracias al encoder visual, puede describir imágenes en forma de texto creativo, por ejemplo para generar pies de foto literarios o narraciones de escenas visuales.
- Investigación en alineación y seguridad: al ser un modelo "abliterated", sirve como caso de estudio para analizar los efectos de la eliminación de la alineación en modelos pequeños y comparar comportamientos con versiones alineadas.

## Benchmarks y rendimiento

El autor proporciona una tabla comparativa con el modelo Qwen3.5-2B-Thinking qx86-hi (también "HERETIC"). Los resultados son los siguientes:

| Modelo | ARC | ARC-e | BoolQ | HellaSwag | OpenBookQA | PIQA | WinoGrande |
|---|---|---|---|---|---|---|---|
| Qwen3.5-2B-Claude-4.6-OS-HERETIC (este) | 0.366 | 0.420 | 0.713 | 0.538 | 0.340 | 0.683 | 0.579 |
| Qwen3.5-2B-Thinking qx86-hi | 0.348 | 0.502 | 0.635 | 0.461 | 0.338 | 0.682 | 0.571 |

El modelo supera al de referencia en la mayoría de métricas (ARC, BoolQ, HellaSwag, OpenBookQA, PIQA, WinoGrande), aunque pierde en ARC-e (0.420 vs 0.502). No se aportan datos de benchmarks estándar como MMLU, HumanEval o GSM8K. Se recomienda interpretar estos números con cautela al provenir de una única fuente sin validación externa.

## Requisitos de hardware

- VRAM estimada: para bfloat16 (4.4 GB de pesos), se necesitan al menos 6-8 GB de VRAM para inferencia con contexto moderado; con cuantización q4_K_S (~2.5 GB) puede caber en GPUs de 4 GB.
- GPUs recomendadas: cualquier GPU con 8 GB o más (RTX 3060, RTX 4060, etc.) para bfloat16; para cuantización GGUF, GPUs de 4-6 GB son suficientes.
- Compatibilidad con consumer GPU: sí, es un modelo de 2B diseñado para ejecutarse en hardware de gama media.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, SGLang, KTransformers, llama.cpp (vía GGUF), KoboldCpp, text-generation-webui y Ollama (si se generan los archivos GGUF).
- Latencia y throughput: no se proporcionan datos oficiales; en una GPU moderna (RTX 4090) se espera una generación de decenas de tokens por segundo con cuantización ligera.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-2B (base) | 2.2B | 256k | Apache 2.0 | Modelo oficial de Alibaba, alineado y multimodal |
| Qwen3.5-2B-Thinking qx86-hi | 2.2B | 256k | Apache 2.0 | Fine-tune "HERETIC" con thinking extendido |
| Este modelo | 2.2B | 256k | Apache 2.0 | Fine-tune "HERETIC" con thinking reducido y datasets Claude |

No se dispone de comparativas con otros modelos de 2B como Llama-3.2-1B o Gemma-2-2B en los datos proporcionados.

## Limitaciones y advertencias

- Ausencia de alineación de seguridad: al ser un modelo "uncensored" y "abliterated", puede generar contenido dañino, ofensivo o ilegal sin filtros. No es apto para aplicaciones comerciales sin moderación externa.
- Sesgos no mitigados: el entrenamiento sobre datasets de Claude puede heredar sesgos de esos datos, y la eliminación de la alineación no corrige sesgos subyacentes.
- Riesgo de alucinación: como todo modelo generativo, puede inventar hechos, citas o referencias, especialmente en tareas de razonamiento factual.
- Soporte de idiomas limitado: solo se declaran en y zh; el resto de idiomas del base Qwen3.5 no están garantizados en este fine-tune.
- Capacidades de video no verificadas: el autor indica que las partes de video del modelo base no fueron probadas, por lo que su funcionamiento es incierto.
- Datos de entrenamiento incompletos: no se especifica el volumen exacto de tokens ni la metodología de entrenamiento, lo que dificulta evaluar su robustez.
- Recomendaciones de sampler específicas: para un rendimiento óptimo se requiere ajustar el smoothing factor a 1.5 o usar repetición penalty 1.1-1.15, lo que añade complejidad de configuración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/squ0sh/Qwen3.5-2B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Guía de parámetros y samplers de DavidAU (referenciada en la model card): https://huggingface.co/DavidAU/Maximizing-Model-Performance-All-Quants-Types-And-Full-Precision-by-Samplers_Parameters
- Repositorio de archivos fuente para GGUF/EXL2/AWQ de DavidAU: https://huggingface.co/collections/DavidAU/d-au-source-files-for-gguf-exl2-awq-gptq-hqq-etc-etc-66b55cb8ba25f914cbf210be
