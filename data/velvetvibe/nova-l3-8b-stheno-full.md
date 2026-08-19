# VelvetVibe/Nova-L3-8B-Stheno-Full

## Resumen

Nova-L3-8B-Stheno-Full es un modelo de lenguaje fine-tuneado por VelvetVibe a partir de Sao10K/L3-8B-Stheno-v3.2, que a su vez es una adaptación de Llama-3-8B orientada a instrucción y roleplay. El modelo se distribuye bajo licencia Apache-2.0 y está pensado para tareas de generación de texto en inglés, con un tamaño de 8 mil millones de parámetros que lo hace ejecutable en hardware de consumo. El fine-tuning se realizó con la librería Unsloth y el framework TRL de Hugging Face, lo que indica un proceso de entrenamiento optimizado en velocidad y memoria, aunque la model card no aporta detalles sobre el dataset ni la metodología exacta de ajuste.

La relevancia de este modelo radica en que, partiendo de una base ya especializada en conversación y narrativa, ofrece una alternativa de código abierto con licencia permisiva para desarrolladores que necesitan un modelo compacto y desplegable en entornos con recursos limitados. Al estar basado en Llama-3, hereda la arquitectura transformer decoder-only y las capacidades generales de razonamiento y generación de texto, aunque su ventana de contexto no se especifica en la ficha y se asume similar a la del modelo base (8k tokens según referencias externas).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder-only) |
| Parametros totales | 8B (heredados del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el modelo base Stheno v3.2 usa 8k) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (presumiblemente safetensors, al ser un modelo de transformers) |

## Arquitectura y entrenamiento

Nova-L3-8B-Stheno-Full es un fine-tuning completo (full fine-tune) del modelo Sao10K/L3-8B-Stheno-v3.2, que a su vez es un ajuste de Llama-3-8B. La arquitectura subyacente es un transformer decoder-only estándar con atención causal, típico de la familia Llama. El entrenamiento se realizó con la librería Unsloth, que optimiza el proceso mediante kernels de atención y operaciones de memoria eficientes, y con la librería TRL de Hugging Face para el pipeline de fine-tuning supervisado. La model card no especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. Dado que el modelo base Stheno v3.2 es conocido por su especialización en diálogo y roleplay, es probable que el fine-tuning haya continuado en esa dirección, pero no hay confirmación oficial.

## Capacidades

- Generacion de texto en ingles, con especial enfasis en conversacion y narrativa, heredado del modelo base Stheno.
- Soporte de instrucciones y seguimiento de prompts de forma general, similar a otros modelos de la familia Llama-3.
- No se documentan capacidades especificas de tool calling, function calling o modo agente en la informacion disponible.
- No se indica soporte multimodal (vision, audio) ni modo de razonamiento explicito.
- La unica capacidad confirmada es la generacion de texto en ingles, sin datos sobre otros idiomas.

## Casos de uso

- Asistentes conversacionales en ingles: el modelo puede mantener dialogos multi-turno gracias a su base entrenada en interacciones, aunque la ventana de contexto no esta confirmada.
- Generacion de narrativa y roleplay: Stheno v3.2 es popular en comunidades de roleplay textual, por lo que este fine-tuning puede usarse para crear personajes o historias interactivas.
- Prototipado rapido de chatbots: al ser un modelo de 8B con licencia Apache-2.0, permite integrarse en aplicaciones sin coste de licencia y con requisitos de hardware modestos.
- Educacion y tutoria: puede generar explicaciones y responder preguntas en ingles, aunque sin garantias de exactitud en dominios especializados.
- Filtrado y clasificacion de texto: como modelo de lenguaje, puede utilizarse para tareas de etiquetado o resumen, siempre que se ajuste mediante prompt engineering.
- Investigacion academica en fine-tuning: al ser un ejemplo de ajuste con Unsloth y TRL, sirve como referencia para estudiar tecnicas de entrenamiento eficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo especifico. El rendimiento debe inferirse del modelo base Stheno v3.2, que segun referencias externas es competitivo en tareas de conversacion, pero no se dispone de cifras concretas.

## Requisitos de hardware

- Para inferencia con cuantizacion de 4 bits (por ejemplo, mediante llama.cpp u Ollama), se estima un consumo de VRAM de aproximadamente 4-5 GB, lo que permite ejecucion en GPUs de consumo como RTX 3060, RTX 4060 o similares.
- Con cuantizacion de 8 bits, la VRAM requerida ronda los 6-8 GB, compatible con RTX 3070/4070.
- En precision completa (FP16), se necesitan al menos 16 GB de VRAM, por lo que se recomienda una GPU de gama alta como RTX 4090 o una A100.
- Para despliegue en produccion, se puede usar vLLM, TensorRT-LLM o TGI para servir el modelo con alto throughput, aunque no hay datos especificos de latencia publicados.
- Alternativas locales como llama.cpp u Ollama permiten ejecucion en CPU con cuantizacion GGUF, aunque con mayor latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Nova-L3-8B-Stheno-Full | 8B | no disponible (base 8k) | Apache-2.0 | Fine-tune de Stheno para conversacion |
| Llama-3-8B-Instruct | 8B | 8k | Llama 3 license (uso comercial permitido con condiciones) | Instruccion general |
| Mistral-7B-Instruct | 7B | 32k | Apache-2.0 | Instruccion general con contexto largo |
| Sao10K/L3-8B-Stheno-v3.2 | 8B | 8k | Apache-2.0 | Base especializada en roleplay y dialogo |

La comparativa se basa en caracteristicas publicas de los modelos. Nova-L3-8B-Stheno-Full se posiciona como una variante especifica de Stheno, sin datos de rendimiento propios, por lo que su eleccion frente a alternativas depende de la necesidad de un fine-tune adicional sobre una base ya especializada.

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos especificos, pero al ser un modelo entrenado principalmente en ingles y en datos de conversacion, puede reflejar sesgos presentes en esos corpus.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en contextos donde no tiene conocimiento verificable.
- La ventana de contexto no esta confirmada; si se mantiene en 8k, puede ser limitante para tareas que requieran documentos largos.
- No hay garantias de calidad en produccion: la ausencia de benchmarks y de documentacion sobre el dataset de entrenamiento dificulta evaluar su robustez.
- La licencia Apache-2.0 permite uso comercial y modificacion, pero no se ofrecen garantias de soporte ni mantenimiento por parte del autor.
- El modelo solo soporta ingles de forma nativa; su rendimiento en otros idiomas no esta evaluado y probablemente sea deficiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VelvetVibe/Nova-L3-8B-Stheno-Full
- Modelo base Sao10K/L3-8B-Stheno-v3.2: https://huggingface.co/Sao10K/L3-8B-Stheno-v3.2
- Blog de Nebula Block sobre Stheno v3.2: https://blog.nebulablock.com/introducing-l3-8b-stheno-v3-2-on-nebula-block-free-inference-for-all/
- Referencia de LLM sobre la familia Stheno: https://www.llmreference.com/model-family/stheno
