# yas1988/smol-math-dpo

## Resumen

smol-math-dpo es un ajuste fino del modelo yas1988/smol-math-sft-merged, publicado por el usuario yas1988 en HuggingFace. Se trata de un modelo derivado de la familia SmolLM de HuggingFace, orientado a tareas de razonamiento matemático, que ha sido entrenado mediante DPO (Direct Preference Optimization) sobre una version previa ya sometida a SFT (supervised fine-tuning). El objetivo declarado es alinear las respuestas del modelo hacia preferencias de calidad en el dominio matematico.

El modelo se distribuye en formato safetensors con un tamano de repositorio de 0,7 GB, lo que sugiere una arquitectura transformer de pequeno tamano (probablemente en el rango de 135M a 360M parametros, coherente con la familia SmolLM), aunque el autor no especifica el numero exacto de parametros ni la longitud de contexto en la model card. La licencia no esta declarada de forma explicita (el campo `licence: license` es un marcador sin contenido), y no se indican idiomas soportados.

Su relevancia es limitada pero ilustrativa: se trata de un experimento de alineamiento con DPO sobre un modelo pequeno especializado en matematicas, util como referencia para quienes quieran replicar pipelines de preferencia con TRL en entornos de recursos limitados. No obstante, la ausencia de benchmarks, de especificaciones detalladas y de una licencia clara limita su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de SmolLM, segun el nombre del modelo base; no confirmado explicitamente) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion via transformers/bitsandbytes, no documentado por el autor) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (campo `licence: license` sin contenido) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint yas1988/smol-math-sft-merged, que a su vez parte de la familia SmolLM de HuggingFace. La arquitectura subyacente es un transformer decoder-only de pequeno tamano, aunque el autor no documenta el numero de capas, dimensiones ocultas ni cabezas de atencion. El entrenamiento se realizo con TRL 1.17.1, Transformers 5.21.0, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.3.

La innovacion tecnica principal es el uso de DPO (Direct Preference Optimization), metodo introducido en el paper arXiv:2305.18290, que optimiza directamente el modelo de politica sobre pares de respuestas preferidas/rechazadas sin necesidad de entrenar un modelo de recompensa separado. El autor no detalla el numero de tokens de entrenamiento, la composicion del dataset de preferencias, ni si se aplicaron tecnicas adicionales como LoRA o merging de adaptadores (aunque el sufijo "merged" en el modelo base sugiere que se fusionaron adaptadores previamente).

## Capacidades

- Generacion de texto conversacional en formato de chat (el ejemplo de la model card usa `pipeline` con mensajes con rol `user`).
- Razonamiento matematico: el nombre y el linaje del modelo indican especializacion en problemas matematicos, aunque no se documentan evaluaciones.
- Alineamiento por preferencias: el DPO deberia mejorar la calidad y el estilo de las respuestas frente al checkpoint SFT de partida.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma documentada.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Experimentacion academica con DPO: el modelo sirve como referencia reproducible para estudiar el efecto de DPO sobre un checkpoint SFT en un dominio acotado (matematicas), con un coste computacional bajo gracias a su tamano reducido.
- Prototipado de asistentes matematicos: se puede desplegar en local para generar explicaciones paso a paso de problemas aritmeticos o algebraicos simples, aunque sin garantias de exactitud.
- Generacion de datos sinteticos de preferencias: util para crear pares de respuestas matematicas que alimenten pipelines de RLHF/DPO en modelos mayores.
- Educacion y tutoria basica: puede emplearse como demo de tutoria conversacional en entornos controlados, siempre con supervision humana dado el riesgo de alucinacion.
- Evaluacion comparativa de metodos de alineamiento: permite contrastar DPO frente a SFT puro en un mismo modelo base, aislando el efecto del metodo.
- Despliegue en entornos con recursos limitados: con 0,7 GB de pesos, cabe en CPU o en GPUs de gama baja, lo que facilita demos y pruebas de integracion con la libreria transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 0,7 GB de pesos en safetensors (probablemente fp32 o bf16), la inferencia en fp16 requeriria aproximadamente 0,4-0,7 GB de VRAM mas el overhead de activaciones y KV cache; en cuantizacion de 8 bits o 4 bits seria inferior a 0,5 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobradamente suficiente; tambien cabe en GPUs integradas y en CPU.
- Cabe en consumer GPU: si, en practicamente cualquier GPU consumer e incluso en CPU.
- Opciones de despliegue: transformers (pipeline documentado por el autor), vLLM, llama.cpp/Ollama (previa conversion a GGUF, no documentada), TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| yas1988/smol-math-dpo | no disponible | no disponible | no disponible | HuggingFace (0 descargas, 0 likes) |
| HuggingFaceTB/SmolLM-135M | 135M | 2048 tokens | Apache 2.0 | HuggingFace, ampliamente usado |
| HuggingFaceTB/SmolLM-360M | 360M | 2048 tokens | Apache 2.0 | HuggingFace, ampliamente usado |
| Qwen2.5-Math-1.5B | 1.5B | 32K tokens | Apache 2.0 | HuggingFace |

La comparativa es aproximada: el linaje exacto de smol-math-dpo no esta confirmado y sus especificaciones no estan documentadas, por lo que la comparacion con SmolLM y Qwen2.5-Math se basa en la categoria (modelos pequenos especializados en matematicas) y no en datos verificados.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de su rendimiento en MMLU, GSM8K, MATH ni otras tareas, por lo que no se puede validar su calidad.
- Licencia no declarada: el campo `licence: license` es un marcador sin contenido, lo que impide determinar si el uso comercial esta permitido. Se debe contactar con el autor antes de cualquier uso en produccion.
- Riesgo de alucinacion: como todo modelo pequeno especializado en matematicas, puede generar razonamientos plausibles pero incorrectos, especialmente en problemas de varios pasos.
- Idiomas no declarados: no se garantiza un rendimiento adecuado fuera del ingles (idioma predominante en los datasets de SmolLM).
- Contexto no documentado: se desconoce la ventana de contexto efectiva, lo que limita el diseno de aplicaciones con entradas largas.
- Modelo practicamente sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin comunidad ni soporte.
- Procedencia incierta: el modelo base `smol-math-sft-merged` no esta documentado en la informacion proporcionada, por lo que se desconoce la composicion exacta del dataset de SFT y de preferencias.
- Fecha de creacion futura (2026-11-01) en los metadatos, lo que sugiere posible error de marcado temporal o publicacion programada; conviene verificar la integridad del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yas1988/smol-math-dpo
- Modelo base: https://huggingface.co/yas1988/smol-math-sft-merged
- Paper de DPO: https://huggingface.co/papers/2305.18290
- Paper de DPO (NeurIPS 2023): http://papers.nips.cc/paper_files/paper/2023/hash/a85b405ed65c6477a4fe8302b5e06ce7-Abstract-Conference.html
- Repositorio TRL: https://github.com/huggingface/trl
