# ViperEkura/AstrAI-V1-2B-instruct

## Resumen

AstrAI-V1-2B-Instruct es un modelo de lenguaje de 1.997 millones de parámetros (aproximadamente 2B) especializado en instrucciones y conversación, desarrollado por el usuario ViperEkura bajo el nombre de proyecto AstrAI. Está diseñado para tareas de generación de texto en inglés y chino, y se distribuye en formato safetensors con pesos en BF16. El modelo se presenta como cargado de forma nativa con el framework AstrAI, un repositorio propio del autor alojado en GitHub.

La relevancia de este modelo radica en su tamaño contenido (2B), que lo sitúa en la categoría de modelos pequeños aptos para despliegue en hardware de consumo, y en unos resultados de benchmarks que, sin ser punteros, muestran un rendimiento funcional en tareas de código (HumanEval 51,22% pass@1) y matemáticas (GSM8K 53,30%). Su contexto y vocabulario (131.072 tokens de vocabulario) sugieren un tokenizador amplio orientado a cubrir inglés y chino.

No obstante, la información pública es escasa: no se especifica la longitud de contexto, la licencia, ni los detalles del dataset de entrenamiento. La model card se limita a una tabla de arquitectura y una tabla de evaluación, sin documentar el proceso de alineación (RLHF/DPO) ni las capacidades de tool calling o agentes. Esta ficha refleja exclusivamente los datos disponibles y marca como "no disponible" todo aquello que el autor no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA (16 cabezas Q / 4 KV) |
| Parametros totales | 1.996.589.056 (1.997B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; no se documentan GGUF/AWQ/GPTQ) |
| Idiomas soportados | en, zh |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 24 capas, con dimensión oculta de 2048 y dimensión de feed-forward de 8192. Emplea atención con query agrupada (GQA) con 16 cabezas de query y 4 cabezas de clave/valor, lo que reduce el coste de memoria del KV cache frente a atención multi-cabeza completa. El vocabulario es de 131.072 tokens y los pesos se distribuyen en BF16. El tamaño del repositorio (4,0 GB) es coherente con un modelo de ~2B parámetros en BF16.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.). El autor menciona que el modelo se carga con el framework nativo AstrAI, pero no se detalla en qué consiste dicho framework ni qué aporta sobre una carga estándar con transformers.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Respuesta a instrucciones (modelo etiquetado como instruct), con resultados medidos en IFEval (53,42% strict prompt, 65,35% strict instruction).
- Generación de código: HumanEval con 51,22% pass@1 en decodificación greedy.
- Razonamiento matemático básico: GSM8K con 53,30% en extracción estricta a 5-shot.
- Comprensión lectora y sentido común: HellaSwag 43,28% de accuracy (56,12% normalizada).
- Soporte de tool calling / function calling: no disponible en la información publicada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información publicada.
- Capacidades multimodales (visión, audio): no disponibles; el pipeline es text-generation.

## Casos de uso

- Asistente conversacional ligero en inglés o chino: el modelo puede gestionar diálogos multi-turno en entornos con recursos limitados, aunque la longitud de contexto no está documentada y conviene validar el comportamiento en conversaciones largas antes de producción.
- Generación de código en entornos de desarrollo: con un 51,22% de pass@1 en HumanEval, es adecuado para autocompletado y sugerencias de funciones en editores, no para sustituir a modelos mayores en tareas complejas de ingeniería.
- Resolución de problemas matemáticos de nivel escolar: el 53,30% en GSM8K lo hace útil para tutores automáticos o verificación de ejercicios de primaria y secundaria, con revisión humana de los resultados.
- Clasificación y extracción de información en corpus bilingües inglés-chino: su vocabulario de 131.072 tokens y su entrenamiento en ambos idiomas permiten tareas de etiquetado y resumen en documentos mixtos.
- Despliegue en edge o en hardware de consumo: con ~2B parámetros en BF16, puede ejecutarse en GPUs de gama media o incluso en CPU con cuantización, lo que lo hace apto para prototipos locales y entornos sin acceso a la nube.
- Generación de respuestas en chatbots de bajo coste: su tamaño reducido permite servir múltiples instancias concurrentes en una sola GPU, útil para demos y pruebas de concepto.
- Filtrado y moderación de contenido bilingüe: puede emplearse como clasificador de texto en pipelines de preprocesado, siempre que se valide su sesgo y tasa de alucinación.

## Benchmarks y rendimiento

| Benchmark | Métrica | AstrAI-V1-2B-Instruct |
|---|---|---|
| MMLU | 5-shot accuracy | 37,91 |
| HellaSwag | Accuracy / Normalized accuracy | 43,28 / 56,12 |
| IFEval | Strict prompt / instruction | 53,42 / 65,35 |
| IFEval | Loose prompt / instruction | 55,08 / 67,63 |
| HumanEval | Greedy pass@1 | 51,22 |
| GSM8K | 5-shot strict / flexible answer extraction | 53,30 / 53,22 |

Los datos proceden de la model card del autor. IFEval usa el verificador oficial; HumanEval y GSM8K emplean prompts de chat con decodificación greedy; HumanEval ejecuta una completion por tarea y GSM8K usa cinco ejemplos resueltos. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 4 GB solo para pesos, más el KV cache y activaciones; en la práctica, entre 5 y 6 GB para secuencias moderadas.
- VRAM estimada en cuantización de 8 bits: alrededor de 2,5-3 GB; en 4 bits, alrededor de 1,5-2 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: sí, en tarjetas con 6 GB o más en BF16; en 4 bits podría caber en GPUs de 4 GB.
- Opciones de despliegue: el autor menciona el framework nativo AstrAI; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI. Al ser safetensors con arquitectura transformer estándar, es probable que requiera conversión a GGUF para llama.cpp, pero esto no está confirmado.
- Latencia y throughput: no disponibles en la información publicada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| AstrAI-V1-2B-Instruct | 1,997B | no disponible | no disponible | en, zh | Hugging Face (safetensors) |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | Apache 2.0 | multilingüe | Hugging Face, GGUF, vLLM |
| Gemma-2-2B-it | 2,6B | 8.192 tokens | Gemma Terms | multilingüe | Hugging Face, GGUF |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens | Apache 2.0 | en (principalmente) | Hugging Face, GGUF |

La comparación se limita a parámetros, contexto y licencia, ya que no se dispone de resultados de benchmarks de AstrAI en las mismas condiciones que los modelos alternativos. Los tres modelos de referencia cuentan con licencias explícitas y documentación de contexto, ausentes en AstrAI-V1-2B-Instruct.

## Limitaciones y advertencias

- Licencia no especificada: no se puede determinar si el uso comercial está permitido; es un riesgo legal para producción.
- Longitud de contexto no documentada: no se puede planificar el despliegue en tareas que requieran ventanas largas sin validación empírica.
- Sesgos conocidos: no documentados por el autor; al entrenarse en inglés y chino, es probable que herede sesgos de los corpus utilizados, pero no hay información al respecto.
- Riesgo de alucinación: no cuantificado; los resultados de MMLU (37,91%) sugieren un conocimiento factual limitado, lo que aumenta el riesgo en tareas de recuperación de hechos.
- Limitaciones de idioma: solo se declaran inglés y chino; no hay soporte documentado para castellano ni otras lenguas.
- Ausencia de documentación sobre alineación: no se especifica si se aplicó RLHF o DPO, lo que dificulta evaluar la robustez frente a prompts adversarios.
- Framework propietario: la dependencia del framework AstrAI, sin documentación pública detallada, puede complicar la integración con herramientas estándar del ecosistema.
- Sin datos de tool calling ni agentes: no se puede asumir soporte para function calling en pipelines de producción.

## Enlaces

- Hugging Face: https://huggingface.co/ViperEkura/AstrAI-V1-2B-instruct
- Repositorio del framework AstrAI: https://github.com/ViperEkura/AstrAI
