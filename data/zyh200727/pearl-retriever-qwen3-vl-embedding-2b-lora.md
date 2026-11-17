# zyh200727/PEARL-Retriever-Qwen3-VL-Embedding-2B-LoRA

## Resumen

PEARL-Retriever-Qwen3-VL-Embedding-2B-LoRA es un adaptador LoRA de tipo query-side que forma parte del sistema PEARL (Personalized Streaming Video Understanding with Runtime-Defined Concepts). No es un modelo generativo autonomo: es un componente de recuperacion que modifica unicamente la forma en que el modelo base Qwen3-VL-Embedding-2B codifica las consultas de texto contra una memoria de embeddings de clips de video. El adaptador lo publica el usuario zyh200727 como parte del material del paper PEARL (arXiv 2603.20422), desarrollado por Yuanhong Zheng y colaboradores.

El problema que resuelve es concreto: en la comprension de video en streaming con conceptos definidos en tiempo de ejecucion (entidades como personas u objetos que el usuario introduce dinamicamente), el recuperador debe localizar clips pasados relevantes dentro de una memoria acumulada. El encoder base de Qwen3-VL-Embedding-2B no esta alineado con ese tipo de consultas; el LoRA ajusta solo la rama de texto para mejorar el recall sin tocar el encoder de video.

Tecnicamente es un adaptador LoRA de rango 16 (alpha 32, dropout 0.05) aplicado a las proyecciones q_proj, k_proj, v_proj y o_proj de las 28 capas del language model, con 6,4 millones de parametros entrenables y pesos en FP32 de 25,7 MB. Su relevancia radica en que mejora el Recall@1 de 7,85 a 14,66 y el Recall@4 de 22,25 a 32,46 sobre PSVU-Bench, manteniendo valida cualquier memoria de clips construida previamente con el encoder congelado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Qwen3-VL-Embedding-2B; adaptador en proyecciones de atencion del language model |
| Parametros totales | 6,4 M entrenables (adaptador); modelo base Qwen3-VL-Embedding-2B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (longitud maxima de entrada en entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en FP32; el base admite las de Qwen3-VL-Embedding-2B) |
| Idiomas soportados | en |
| Licencia | Apache-2.0 (adaptador); el modelo base se rige por su propia licencia |
| Formato de pesos | safetensors (adapter_model.safetensors, FP32, 25,7 MB) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con alpha 32 y dropout 0.05, aplicado exclusivamente a `q_proj`, `k_proj`, `v_proj` y `o_proj` en las 28 capas del language model del modelo base. El vision encoder permanece congelado y sin modificaciones. Se aplica solo a consultas de memoria en texto: los clips de video y las referencias a conceptos se codifican con el modelo base congelado, de modo que una memoria de clips construida con el encoder original sigue siendo valida sin reconstruccion.

El entrenamiento usa PSVU-10K, el conjunto liberado con PEARL, compuesto por 10.000 grupos de preguntas construidos a partir de videos de YouTube de 155 obras fuente, divididos por obra en 9.000 grupos de entrenamiento y 1.000 de validacion, con conceptos de tipo entidad. El recuperador se entrena sobre las 5.384 preguntas de tipo Past-Time; cada consulta es la query de recuperacion que produce el reescritor de preguntas de PEARL con el Qwen3-VL-8B base, con los clips de evidencia anotados como positivos y clips negativos verificados como negativos. La perdida es contrastiva multi-positivo con softmax a temperatura tau = 0,07 sobre evidencias y negativos, promediada sobre todas las evidencias. Los embeddings de clips provienen del modelo base congelado y permanecen fijos. Hiperparametros: 2.244 pasos, learning rate 2e-5, AdamW con weight decay 0,01, gradient clipping 1,0, batch efectivo 8, precision BF16, semilla 42.

## Capacidades

- Recuperacion de clips de video en texto-a-video dentro de una memoria de streaming, orientada a preguntas sobre el pasado (Past-Time).
- Codificacion de consultas de texto alineadas con conceptos definidos en tiempo de ejecucion (entidades personalizadas).
- Mejora del ranking de evidencias pasadas sin reindexar la memoria de clips existente.
- Integracion como componente de un pipeline mayor (PEARL) junto a un VLM respondedor entrenado.
- Compatibilidad con multiples respondedores: Qwen3-VL-8B, LLaVA-OV-7B y Qwen2-VL-7B mediante sus respectivos adaptadores.
- No realiza generacion de texto, razonamiento abierto, codigo ni matematicas por si mismo: es un modulo de embeddings para retrieval.
- Soporte de tool calling / function calling: no disponible (no aplica).
- Soporte de agentes y multi-step reasoning: no disponible en el adaptador; el razonamiento multi-paso reside en el pipeline PEARL.
- Capacidades multilingues: limitadas a ingles segun la model card.

## Casos de uso

- Vigilancia y analisis de video en directo con conceptos definidos por el operador: el adaptador permite consultar la memoria de clips acumulada por entidades introducidas en tiempo de ejecucion ("que llevaba <Alice> cuando salio de la cocina") con mejor recall que el encoder base.
- Asistentes de revision de retransmisiones largas: recuperar los fragmentos pasados relevantes para responder preguntas retrospectivas sobre un stream sin reprocesar el video, ya que los clips siguen codificados por el encoder congelado.
- Analisis de contenido audiovisual para produccion: localizar apariciones de una entidad concreta en material grabado de YouTube para tareas de catalogacion o montaje.
- Investigacion en comprension de video en streaming: punto de partida reproducible para experimentar con recuperacion personalizada sobre PSVU-10K y PSVU-Bench.
- Sistemas de memoria de agentes multimodales: usar el adaptador como recuperador de evidencia pasada que alimenta a un VLM respondedor (Qwen3-VL-8B, LLaVA-OV-7B o Qwen2-VL-7B) en arquitecturas de agente con memoria episodica de video.
- Evaluacion comparativa de recuperadores texto-video: banco de pruebas para medir Recall@k y Hit frente al encoder base en tareas de conceptos personalizados.
- Despliegue de bajo coste en pipelines existentes: al ser un adaptador de 25,7 MB sobre un base de 2B, se puede anadir a un sistema ya en produccion sin reconstruir el indice de clips.

## Benchmarks y rendimiento

Resultados de recuperacion sobre los conceptos de entidad de PSVU-Bench con Qwen3-VL-8B + PEARL. Recall@k cuenta las preguntas Past-Time cuya evidencia anotada aparece entre los top-k clips recuperados; Hit incluye tambien los clips adyacentes que PEARL pasa al VLM respondedor.

| Recuperador | R@1 | R@4 | Hit |
|---|---:|---:|---:|
| Qwen3-VL-Embedding-2B (base) | 7,85 | 22,25 | 34,82 |
| + PEARL query LoRA (este adaptador) | 14,66 | 32,46 | 44,50 |

Precision global del pipeline con respondedores entrenados sobre PSVU-Bench:

| Configuracion | Overall | Real-Time | Past-Time |
|---|---:|---:|---:|
| Qwen3-VL-8B + PEARL (sin entrenar) | 52,38 | no disponible | no disponible |
| Qwen3-VL-8B + PEARL (con PEARL-Qwen3-VL-8B-LoRA) | 61,41 | 62,62 | 60,19 |
| LLaVA-OV-7B + PEARL (PEARL-LLaVA-OV-7B-LoRA) | 45,07 | no disponible | no disponible |
| Qwen2-VL-7B + PEARL (PEARL-Qwen2-VL-7B-LoRA) | 47,01 | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada: el adaptador anade solo 25,7 MB en FP32; el coste dominante es el modelo base Qwen3-VL-Embedding-2B (2B parametros). En BF16 el base requiere aproximadamente 4-5 GB de VRAM; en cuantizacion de 8 bits, alrededor de 2-3 GB; en 4 bits, en torno a 1,5-2 GB (estimaciones para el base, no publicadas en la model card).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para el base en BF16; A100, H100 o L40S para procesar lotes grandes de clips y consultas.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB), RTX 4080/4070 Ti (16 GB) y previsiblemente en RTX 4060 Ti (16 GB) o GPUs de 8 GB con cuantizacion.
- Opciones de despliegue: el adaptador se carga con PEFT (`PeftModel.from_pretrained`) dentro del repositorio PEARL; el base puede servirse con las herramientas habituales compatibles con Qwen3-VL-Embedding-2B (vLLM, TGI, llama.cpp/Ollama segun soporte del base). No se documentan opciones adicionales en la model card.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | R@1 / R@4 en PSVU-Bench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PEARL-Retriever-Qwen3-VL-Embedding-2B-LoRA (este) | 6,4 M (adaptador) sobre base 2B | 8.192 tokens | 14,66 / 32,46 | Apache-2.0 | Hugging Face |
| Qwen3-VL-Embedding-2B (base, sin adaptador) | 2B | no disponible | 7,85 / 22,25 | no disponible | Hugging Face |
| Recuperadores genericos texto-video de proposito general | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa solo es posible frente al encoder base, ya que la model card no incluye otros recuperadores de referencia. Frente al base, el adaptador duplica aproximadamente el Recall@1 (de 7,85 a 14,66) y mejora el Hit de 34,82 a 44,50.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el pipeline PEARL y un VLM respondedor entrenado para producir respuestas; por si solo solo devuelve embeddings.
- El adaptador solo debe activarse al codificar consultas de memoria en texto; usarlo sobre clips de video o referencias de concepto rompe la coherencia con la memoria construida por el encoder congelado.
- Entrenado exclusivamente en ingles; el rendimiento en otros idiomas no esta documentado.
- Entrenado sobre PSVU-10K, con conceptos de tipo entidad y videos de YouTube de 155 obras fuente: puede generalizar mal a otros dominios de video o a tipos de concepto distintos de entidades.
- Riesgo de sesgo heredado del modelo base y del corpus de YouTube (seleccion de contenido, distribucion de entidades); no se documentan analisis de sesgo.
- Riesgo de alucinacion: el adaptador no genera texto, pero un recall bajo puede llevar al VLM respondedor a responder sin evidencia suficiente.
- Restricciones de licencia: el adaptador es Apache-2.0, pero el uso del modelo base Qwen3-VL-Embedding-2B queda sujeto a su propia licencia, que debe verificarse para uso comercial.
- Sin descargas ni likes en el momento de la consulta (0/0) y repositorio de 0,0 GB: ecosistema muy reciente, sin validacion comunitaria independiente.
- No se publican latencias ni throughput, lo que dificulta estimar costes de produccion.

## Enlaces

- Hugging Face: https://huggingface.co/zyh200727/PEARL-Retriever-Qwen3-VL-Embedding-2B-LoRA
- Paper: https://arxiv.org/abs/2603.20422
- Codigo: https://github.com/Yuanhong-Zheng/PEARL
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-Embedding-2B
- Dataset: https://huggingface.co/datasets/zyh200727/PSVU-10K
