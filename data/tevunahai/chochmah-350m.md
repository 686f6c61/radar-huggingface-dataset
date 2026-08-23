# TevunahAi/chochmah-350m

## Resumen

Chochmah-350M es un modelo de lenguaje pequeño (SLM) de 358,7 millones de parámetros, desarrollado por TevunahAi, una organización especializada en modelos entrenados desde cero con corpus seleccionados a mano. Se trata de un modelo base, sin ajuste por instrucciones ni RLHF, entrenado sobre 30.000 millones de tokens con una mezcla deliberadamente ponderada hacia seis dominios: derecho y jurisprudencia, filosofía y filosofía política, matemáticas, física y código fuente. La pretensión del autor es ofrecer un modelo pequeño pero con conocimiento denso en áreas técnicas y académicas, diferenciándose de modelos genéricos del mismo tamaño.

El modelo sigue la arquitectura Llama (decoder-only transformer) con 24 capas, 16 cabezas de atención, MLP SwiGLU, normalización RMSNorm y embeddings rotatorios (RoPE). Su ventana de contexto es de 2.048 tokens, y se distribuye en formato safetensors en precisión fp32 (1,43 GB). Aunque su tamaño lo hace apto para entornos con recursos limitados, su carácter de modelo base implica que el usuario debe realizar ajuste fino para tareas específicas. Es relevante ahora porque demuestra que es posible entrenar un modelo de calidad con una sola GPU de gama profesional en poco más de diez días, y porque su licencia Apache-2.0 permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (estilo Llama) |
| Parámetros totales | 358.663.168 (358,7M) |
| Parámetros activos | No es MoE; todos los parámetros están activos |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantización | No se han publicado versiones cuantizadas en la información disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (fp32) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura decoder-only estándar de 2024, sin opciones exóticas, para garantizar compatibilidad con el ecosistema Llama. Cada una de las 24 capas contiene atención multi-cabeza con 16 cabezas de dimensión 64 (sin GQA, es decir, 16 cabezas de clave/valor), un MLP SwiGLU con dimensión intermedia 2.816, normalización RMSNorm antes de la atención y antes del MLP (eps 1e-5), y embeddings rotatorios con theta 10.000. Los embeddings de entrada y salida están atados, no se usa dropout ni sesgos, y la inicialización estándar es 0.02.

El entrenamiento se realizó desde cero sobre 29.990 millones de tokens (57.200 pasos de 524.288 tokens cada uno) en una sola GPU NVIDIA RTX 5000 Ada de 32 GB, con una duración de aproximadamente 10,5 días (12–22 de agosto de 2026). El coste computacional fue de ~6,5×10^19 FLOPs. Se empleó una estrategia de curriculum en tres fases alineada con un calendario de tasa de aprendizaje warmup–stable–decay. El corpus de entrenamiento combina tres colecciones seleccionadas manualmente —2,6 millones de opiniones judiciales de EE. UU., un canon de filosofía de 126 autores de dominio público y libros de texto de OpenStax— con bases de datos generales como FineWeb-Edu, StarCoder, Wikipedia, OpenWebMath, SmolLM-Corpus, FineMath, Proof-Pile-2 y peS2o. El tokenizador es el SmolLM2 de 49.152 entradas BPE.

## Capacidades

- Generación de texto autocompletada en inglés, con especial énfasis en registros jurídicos, filosóficos, matemáticos, físicos y de código.
- Razonamiento de sentido común y conocimiento enciclopédico básico, medido en benchmarks de razonamiento de sentido común (ARC-Easy, PIQA).
- Comprensión lectora y predicción de lenguaje, evaluada en HellaSwag y LAMBADA.
- Capacidad de procesar y generar texto en código (Python, JavaScript, etc.) gracias a la inclusión de StarCoderData en el corpus.
- No soporta tool calling, function calling ni interacción por chat, al ser un modelo base sin ajuste por instrucciones.
- No dispone de modo de pensamiento (thinking mode) ni capacidades multimodales (visión, audio).
- Multilingüe solo en inglés; no se ha entrenado para otros idiomas.

## Casos de uso

- **Análisis de jurisprudencia**: el modelo puede autocompletar y generar resúmenes de opiniones judiciales, ayudando a investigadores y estudiantes de derecho a explorar argumentos legales. Su entrenamiento con 2,6 millones de casos reales le confiere un conocimiento específico del registro jurídico estadounidense.
- **Generación de material de estudio en filosofía**: dado su corpus de 126 autores de dominio público, puede producir explicaciones introductorias o resúmenes de conceptos de autores como Nietzsche o Kant, útil para entornos educativos.
- **Asistencia en resolución de problemas matemáticos y físicos**: aunque no es un modelo de razonamiento avanzado, puede generar pasos intermedios de cálculo o plantear ecuaciones a partir de enunciados simples, sirviendo como apoyo en plataformas de tutoría.
- **Generación de código en entornos de baja capacidad**: puede autocompletar fragmentos de código en Python u otros lenguajes, útil en IDEs ligeros o en sistemas embebidos donde se requiera un modelo pequeño y rápido.
- **Investigación en modelos de lenguaje**: al ser un modelo base con arquitectura estándar y licencia Apache-2.0, es un banco de pruebas para experimentos de ajuste fino (fine-tuning), cuantización o alineación, sin preocupación por restricciones de uso comercial.
- **Prototipado de aplicaciones de generación de texto**: su tamaño compacto permite desplegarlo en CPU o en GPUs de gama baja, lo que lo hace viable para prototipos de autocompletado de textos jurídicos o académicos en aplicaciones web.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el model-index de HuggingFace, obtenidos con lm-evaluation-harness en modo 0-shot:

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Text generation | ARC-Easy (test) | accuracy | 59,0 |
| Text generation | ARC-Easy (test) | normalized accuracy | 54,2 |
| Text generation | HellaSwag (validation) | accuracy | 34,8 |
| Text generation | HellaSwag (validation) | normalized accuracy | 41,8 |
| Text generation | PIQA (validation) | accuracy | 68,6 |
| Text generation | PIQA (validation) | normalized accuracy | 68,3 |
| Text generation | LAMBADA (OpenAI) (test) | accuracy | 40,2 |
| Text generation | LAMBADA (OpenAI) (test) | perplexity | 23,8 |

No se han publicado comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: en fp32 (pesos de 1,43 GB), se requiere al menos ~1,7 GB de VRAM solo para los pesos; con memoria adicional para activos, se recomienda un mínimo de 4 GB de VRAM para inferencia en GPU.
- **GPUs compatibles**: cualquier GPU moderna con al menos 4 GB de VRAM (p. ej., NVIDIA RTX 3050, GTX 1650, A10, etc.). En fp16/bf16, los requisitos se reducen a la mitad (~0,7 GB de pesos), permitiendo ejecución en GPU de 2 GB.
- **CPU**: es viable ejecutar inferencia en CPU con memoria RAM suficiente (≥4 GB), aunque la latencia será mayor.
- **Opciones de despliegue**: compatible con Hugging Face Transformers (`AutoModelForCausalLM` / `LlamaForCausalLM`), y puede ser usado con vLLM, llama.cpp o TGI, aunque no se han publicado archivos GGUF. En la plataforma Hugging Face se indica que es compatible con endpoints de inferencia.
- **Latencia y throughput**: no se han publicado datos específicos de latencia o throughput en la información disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos en la información proporcionada. Sin embargo, se puede situar cualitativamente frente a modelos de tamaño similar:

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Chochmah-350M | 358,7M | 2.048 | Apache-2.0 | Modelo base, entrenado desde cero, corpus ponderado hacia derecho, filosofía, matemáticas y código |
| pLlM-360M (TinyLlama) | 360M | 2.048 | Apache-2.0 | Modelo base, entrenado en 3T tokens, orientado a uso general |
| Qwen2.5-0.5B | 494M | 32.768 | Apache-2.0 | Modelo base/instrucciones, mayor contexto, multilingüe |

La comparativa es cualitativa porque no se han publicado resultados de benchmarks en la información de Chochmah-350M frente a estos modelos.

## Limitaciones y advertencias

- **Modelo base**: no está instruido ni alineado, por lo que no responde a preguntas directas ni sigue instrucciones complejas; es necesario un ajuste fino para usos prácticos.
- **Sesgos**: el corpus está fuertemente sesgado hacia jurisprudencia estadounidense y filosofía occidental (126 autores de dominio público), lo que puede generar sesgos culturales y legales no generalizables a otros países o sistemas jurídicos.
- **Alucinación**: como cualquier LLM, puede generar información plausible pero incorrecta, especialmente en áreas de conocimiento no cubiertas por el corpus.
- **Contexto corto**: 2.048 tokens limita la coherencia en documentos largos y en tareas que requieren razonamiento multi-paso extenso.
- **Idioma**: solo soporta inglés; no es adecuado para uso en castellano u otros idiomas.
- **Riesgo de uso comercial**: aunque la licencia Apache-2.0 permite uso comercial sin restricciones, el contenido del corpus puede incluir opiniones judiciales de dominio público, pero no se especifican posibles derechos de autor residuales en textos de OpenStax o Gutenberg.
- **Disponibilidad de cuantizaciones**: no se han publicado versiones GGUF o cuantizadas, por lo que el despliegue en entornos de recursos muy limitados requiere conversión manual.

## Enlaces

- [HuggingFace - TevunahAi/chochmah-350m](https://huggingface.co/TevunahAi/chochmah-350m)
- [Perfil de TevunahAi en HuggingFace](https://huggingface.co/TevunahAi)
- [GitHub de TevunahAi](https://github.com/TevunahAi)
- [Sitio web de Tevunah.ai](https://github.com/TevunahAi/site)
- [lm-evaluation-harness (EleutherAI)](https://github.com/EleutherAI/lm-evaluation-harness)
