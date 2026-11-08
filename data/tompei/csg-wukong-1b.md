# TomPei/csg-wukong-1B

## Resumen

csg-wukong-1B es un modelo de lenguaje pequeno (SLM) de aproximadamente 1.100 millones de parametros desarrollado por OpenCSG, una organizacion centrada en modelos generativos de codigo abierto. El modelo fue preentrenado sobre 1 billon (1T) de tokens, una cifra notablemente alta para su tamano, lo que sugiere un entrenamiento prolongado orientado a exprimir al maximo la capacidad de un modelo compacto. La model card lo presenta como un modelo base de generacion de texto con etiqueta "code", lo que indica un enfasis en contenido y tareas de programacion.

La arquitectura es de tipo transformer con pesos en formato safetensors y metadatos compatibles con la familia Llama. El repositorio ocupa 2,2 GB, coherente con un modelo de 1,1B parametros en precision de 16 bits. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, lo que lo hace atractivo para despliegues en produccion con requisitos de coste bajos.

Su relevancia actual radica en la tendencia hacia modelos pequenos entrenados con volumenes masivos de tokens ("overtraining"), que ofrecen un equilibrio favorable entre calidad, latencia y huella de memoria. Segun la model card, el modelo se posiciono en el puesto 8 entre los SLM preentrenados de aproximadamente 1,5B parametros en el Open LLM Leaderboard. La informacion publica disponible es limitada: no se detalla la composicion del dataset, la longitud de contexto ni los resultados numericos por benchmark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Llama, segun metadatos) |
| Parametros totales | 1.100.048.384 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card (pesos en safetensors; compatible con cuantizacion estandar tipo GGUF/AWQ, no confirmado por el autor) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer densa de tipo decoder-only, con metadatos que lo asocian a la familia Llama. Cuenta con 1.100.048.384 parametros totales y fue preentrenado sobre 1T tokens, lo que representa una ratio de aproximadamente 900 tokens por parametro, muy por encima de la regla de Chinchilla (20 tokens por parametro). Este regimen de "overtraining" es habitual en SLM modernos y busca maximizar la calidad de un modelo pequeno a cambio de un coste de entrenamiento mayor.

El entrenamiento se realizo con 16 GPU NVIDIA H800 durante 43 dias, empleando DeepSpeed como framework de orquestacion, PyTorch como framework de redes neuronales y Apex para precision mixta BF16. No se especifica en la informacion disponible la composicion del dataset, la mezcla de idiomas, la posible fase de instruccion (SFT), ni si hubo etapas de RLHF o DPO en este checkpoint base. Existe un modelo derivado publicado por OpenCSG con sufijo `-sft-bf16`, lo que indica que el ajuste por instrucciones se distribuye como artefacto separado.

## Capacidades

- Generacion de texto autoregresiva en ingles.
- Enfasis en codigo: la model card etiqueta el modelo con "code", lo que sugiere presencia relevante de contenido de programacion en el preentrenamiento.
- Modelo base: no se documenta un modo de instrucciones ni formato de chat en este checkpoint.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa; requeriria ajuste adicional.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Generacion de codigo asistida en IDE: el modelo puede integrarse en extensiones de editor para autocompletar y completar funciones en ingles y lenguajes de programacion, con latencia baja gracias a su tamano de 1,1B parametros.
- Punto de partida para fine-tuning especializado: al ser un modelo base con licencia Apache 2.0, es adecuado para ajustar sobre dominios concretos (por ejemplo, SQL, infraestructura como codigo o documentacion tecnica) sin restricciones comerciales.
- Clasificacion y etiquetado de texto: su coste de inferencia bajo permite procesar grandes volumenes de documentos para tareas de clasificacion, extraccion o resumen en pipelines por lotes.
- Generacion aumentada por recuperacion (RAG) en entornos con recursos limitados: puede desplegarse en una sola GPU consumer para responder preguntas sobre documentacion tecnica, siempre que se gestione la ventana de contexto (no documentada).
- Prototipado rapido de aplicaciones de IA generativa: sirve como modelo de referencia para validar pipelines de inferencia (vLLM, llama.cpp) antes de escalar a modelos mayores.
- Educacion e investigacion: util para experimentos de interpretabilidad, ablaciones de entrenamiento o estudios de eficiencia en modelos de ~1B parametros.
- Despliegue en el borde (edge) o entornos con GPU de gama baja: su huella de memoria permite ejecucion en GPUs de 8-16 GB con cuantizacion, habilitando asistentes locales sin conexion.

## Benchmarks y rendimiento

Segun la model card, el modelo fue enviado al Open LLM Leaderboard y se situo en el puesto 8 entre los SLM preentrenados de aproximadamente 1,5B parametros. No se han publicado en la informacion disponible los valores numericos por tarea (MMLU, ARC, HellaSwag, GSM8K, HumanEval u otros), por lo que no se presenta tabla cuantitativa.

| Benchmark | csg-wukong-1B | Notas |
|---|---|---|
| Open LLM Leaderboard (ranking) | Puesto 8 en la categoria ~1,5B preentrenados | Sin puntuaciones numericas publicadas |
| MMLU | no disponible | |
| HumanEval | no disponible | |
| GSM8K | no disponible | |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 2,2 GB de pesos mas memoria de activaciones y cache KV; en la practica, 4-6 GB para contextos cortos.
- VRAM estimada con cuantizacion de 8 bits: en torno a 1,2-1,5 GB de pesos.
- VRAM estimada con cuantizacion de 4 bits: en torno a 0,7-1 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB (RTX 3060, RTX 4060, RTX 4090) para BF16; A100/H100 no son necesarias para inferencia, aunque pueden usarse para alto throughput.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas con 8 GB o mas, e incluso en iGPU con cuantizacion agresiva.
- Opciones de despliegue: vLLM, TGI, llama.cpp (previa conversion a GGUF), Ollama (previa conversion), Transformers con PyTorch.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por tamano, se espera un throughput alto en una sola GPU consumer, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| csg-wukong-1B | 1,1B | no disponible | Apache 2.0 | Hugging Face | Preentrenado con 1T tokens; enfasis en codigo |
| TinyLlama-1.1B | 1,1B | 2.048 tokens | Apache 2.0 | Hugging Face | Preentrenado con 3T tokens; comunidad amplia |
| Qwen2.5-1.5B | 1,5B | 32.768 tokens | Apache 2.0 | Hugging Face | Multilingue, con variantes instruct |
| SmolLM2-1.7B | 1,7B | 8.192 tokens | Apache 2.0 | Hugging Face | Entrenado con 11T tokens; enfoque en eficiencia |

La comparativa se limita a parametros, contexto y licencia, ya que no hay resultados numericos publicados de csg-wukong-1B que permitan contrastar rendimiento tarea a tarea con estas alternativas.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue instrucciones de forma fiable sin fine-tuning o uso de la variante SFT publicada por OpenCSG.
- Idiomas: entrenado y evaluado principalmente en ingles; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en contextos largos; conviene validarlo empiricamente antes de produccion.
- Riesgo de alucinacion: como todo modelo generativo, puede producir contenido plausible pero incorrecto, especialmente en codigo y datos factuales.
- Sesgos: no se documentan analisis de sesgo; al proceder de datos web sin filtrado publico, es probable que herede sesgos presentes en el corpus.
- Licencia Apache 2.0: permite uso comercial, pero el usuario es responsable del cumplimiento de las licencias de los datos de entrenamiento (no documentadas).
- Trazabilidad limitada: la model card es escasa en detalles de dataset, tokenizador y evaluacion; el repositorio principal en Hugging Face figura bajo el usuario TomPei, mientras que la organizacion OpenCSG publica la version oficial, lo que conviene verificar antes de adoptarlo.
- Sin garantias de mantenimiento: el modelo no registra descargas ni interacciones en el momento de la consulta, lo que sugiere una adopcion muy baja y soporte comunitario limitado.

## Enlaces

- Modelo en Hugging Face (TomPei): https://huggingface.co/TomPei/csg-wukong-1B
- Modelo en Hugging Face (OpenCSG): https://huggingface.co/opencsg/csg-wukong-1B
- Variante SFT en BF16: https://huggingface.co/opencsg/csg-wukong-1B-sft-bf16
- Open LLM Leaderboard: https://huggingface.co/spaces/HuggingFaceH4/open_llm_leaderboard
- Repositorio Awesome-SLMs de OpenCSG: https://github.com/OpenCSGs/Awesome-SLMs
- Portal de modelos OpenCSG: https://portal.opencsg.com/models
- Twitter de OpenCSG: https://twitter.com/OpenCsg
