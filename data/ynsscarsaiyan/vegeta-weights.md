# YNSScarSaiyan/vegeta-weights

## Resumen

Vegeta es un modelo de lenguaje de tipo *looped decoder* desarrollado por Dakuwon Moody y publicado por YNSScarSaiyan como volcado de pesos públicos. Su arquitectura es poco convencional: dos bloques transformer compartidos se ejecutan durante 16 iteraciones, con LayerNorms por iteración (arquitectura v2). No es un modelo compatible con `AutoModel` de HuggingFace, sino que requiere una clase personalizada (`LoopedLLM` en `vegeta_model_v2.py`). Con aproximadamente 0,73 mil millones de parámetros y una ventana de contexto de 1.024 tokens, está orientado a tareas de agente y uso de herramientas, habiendo sido entrenado con una mezcla de datasets de instrucciones y *function calling*. Su relevancia radica en la exploración de arquitecturas *looped* y en la disponibilidad pública de los pesos para investigación, aunque se trata de un modelo experimental sin soporte de inferencia alojada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped decoder (2 bloques transformer compartidos, 16 iteraciones, LayerNorms por iteracion) |
| Parametros totales | ~0,73B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | No disponible (entrenado en bf16, sin cuantizaciones publicadas) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

Vegeta implementa un decodificador *looped*: dos capas transformer compartidas se aplican secuencialmente durante 16 iteraciones. Cada iteración incorpora LayerNorms propias para atención y FFN (`iter_attn_norms` / `iter_ffn_norms`), además de embeddings posicionales y un embedding de iteración (`iter_embed`). Las embeddings de entrada y la cabeza de salida no están atadas (`untied embed` + `lm_head`). La configuración incluye un tamaño oculto de 2.048, 32 cabezas de atención con dimensión 64, un MLP de 2048 → 8192 → 2048 con activación GELU, y una longitud máxima de posición de 1.024. El tokenizador es `Qwen/Qwen1.5-0.5B-Chat` (vocabulario de 151.936), pero el modelo no es un fine-tune de Qwen; solo comparte el tokenizador.

El entrenamiento se realizó con *packed next-token cross-entropy* (sin enmascaramiento de prompts) sobre una mezcla de datasets de HuggingFace similar a la usada para los modelos hermanos SImi y Uni. La parte de instrucciones incluye Tulu-3, OpenHermes-2.5 y UltraChat; la parte de agentes y herramientas incluye Orca AgentInstruct, Agent-FLAN, xLAM, ToolACE, Glaive y Hermes function calling. Se entrenó en un AMD Instinct MI300X con bf16, tamaño de lote 1 y secuencias de 1.024 tokens, con una tasa de aprendizaje de 5e-6. Los checkpoints se guardan cada 500 pasos; el último archivo público es `sft/step_67000/vegeta_sft_step_67000.pt`. No se menciona RLHF ni DPO.

## Capacidades

- Generacion de texto en ingles (pipeline `text-generation`).
- Entrenado para uso de herramientas y *function calling* mediante datasets como Agent-FLAN, xLAM, ToolACE, Glaive y Hermes function calling.
- Capacidades de agente y razonamiento multi-paso, segun el enfoque de *agent-loop SFT* (checkpoints guardados como `sft/step_<n>/`).
- No es un modelo multimodal: no se mencionan capacidades de vision, audio ni otras modalidades.
- Requiere codigo personalizado (`vegeta_model_v2.py`) para cargar los pesos; no es compatible con `AutoModel` de HuggingFace.

## Casos de uso

- Investigacion en arquitecturas *looped*: el modelo sirve como referencia para estudiar el comportamiento de decodificadores iterativos con capas compartidas, comparando rendimiento con arquitecturas transformer convencionales.
- Prototipado de agentes con *tool calling*: gracias a su entrenamiento en datasets de agentes, puede integrarse en experimentos de razonamiento multi-paso donde el modelo llama a funciones externas, aunque requiere un entorno de ejecucion personalizado.
- Evaluacion de mezclas de datos de instrucciones y herramientas: los checkpoints intermedios permiten analizar la evolucion del entrenamiento y el efecto de los distintos datasets en las capacidades de agente.
- Experimentos de *fine-tuning* o *continuing training*: al ser un volcado de pesos con licencia Apache 2.0, puede usarse como punto de partida para investigaciones sobre adaptacion a tareas especificas.
- Analisis de tokenizacion y embeddings: el uso del tokenizador de Qwen1.5-0.5B-Chat en un modelo con arquitectura propia permite estudiar la transferencia de representaciones entre arquitecturas.
- Comparacion de rendimiento entre modelos hermanos: junto con SImi y Uni, permite contrastar implementaciones en JAX y PyTorch de arquitecturas similares para agentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El entrenamiento se realizo en un AMD Instinct MI300X con bf16, batch 1 y secuencias de 1024 tokens, usando una fraccion de memoria de 0,10, pero no se proporcionan datos de VRAM para inferencia.
- GPU recomendadas: AMD Instinct MI300X (usada en entrenamiento). No se especifican GPUs para inferencia.
- Capacidad en GPU de consumo: no confirmado. Dado el tamano de ~0,73B, es probable que pueda ejecutarse en GPUs de consumo, pero no hay datos oficiales.
- Opciones de despliegue: no soporta inferencia alojada en HuggingFace. No es compatible con vLLM, llama.cpp, Ollama ni TGI de forma nativa; requiere el codigo personalizado `vegeta_model_v2.py`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vegeta | ~0,73B | 1.024 | Looped decoder (2 capas, 16 iteraciones) | Apache 2.0 | Pesos publicos (.pt) |
| SImi | 2,32B | No disponible | Llama-style causal LM en JAX/Flax | No especificada | Pesos publicos |
| Uni | No disponible | No disponible | No especificada (PyTorch) | No especificada | Pesos publicos |

No se dispone de benchmarks comparativos entre estos modelos. Vegeta, SImi y Uni son modelos hermanos del mismo autor, pero con tamanos y arquitecturas distintas, por lo que no son directamente comparables en rendimiento.

## Limitaciones y advertencias

- No es un modelo nativo de HuggingFace Transformers: requiere codigo personalizado (`vegeta_model_v2.py`) para cargar los pesos.
- Solo se publican pesos, sin incluir el codigo de arquitectura en el repositorio (aunque la model card proporciona un ejemplo de carga).
- Ventana de contexto limitada a 1.024 tokens, lo que restringe su uso en conversaciones largas o documentos extensos.
- Solo soporta ingles.
- El entrenamiento usaba *packed next-token CE* sin enmascaramiento de prompts, lo que puede afectar al comportamiento esperado en tareas de instrucciones.
- La perdida de entrenamiento esperada es de digitos medios; el autor indica que es el resultado de la mezcla de datos, no un fallo del entrenamiento.
- No soporta inferencia alojada en HuggingFace.
- No se han publicado resultados de benchmarks, por lo que su rendimiento real es desconocido.
- Licencia Apache 2.0 permite uso comercial, pero el modelo es experimental y puede presentar sesgos o alucinaciones no evaluados.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/YNSScarSaiyan/vegeta-weights
- Modelo hermano SImi: https://huggingface.co/YNSScarSaiyan/simi-weights
- Modelo hermano Uni: https://huggingface.co/YNSScarSaiyan/uni

No se han encontrado papers, blogs ni demos adicionales en la informacion disponible.
