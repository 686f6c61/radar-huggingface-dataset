# wesjos/Qwen3.8-27B-GrumpyGuy-LoRA

## Resumen

GrumpyGuy es un adaptador LoRA de estilo para el modelo base Qwen/Qwen3.8-27B, publicado por el usuario wesjos en Hugging Face. No se trata de un modelo nuevo ni de un fine-tuning de conocimiento: es un adaptador de 42 MB (41.962.216 bytes, 128 tensores) que modifica únicamente la forma de hablar del modelo base, imprimiéndole una personalidad de "ingeniero sénior gruñón" — respuestas directas, sin preámbulos, con un tono seco y ligeramente sardónico, y cierta impaciencia ante preguntas mal planteadas. El autor lo describe explícitamente como *style-only*: no añade conocimiento, solo cambia el registro conversacional.

Técnicamente es un LoRA de rango r=16 con alpha=32 (escala en tiempo de ejecución 2.0) y dropout 0, entrenado sobre la build pre-cuantizada en NF4 `unsloth/Qwen3.8-27B-unsloth-bnb-4bit`. Los módulos objetivo son exclusivamente las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y solo en las 16 capas de atención completa del modelo base (capas 3, 7, 11... 63). Esto deja fuera MLPs, embeddings, la torre de visión y las proyecciones de atención lineal, de modo que el conocimiento y la capacidad multimodal del base quedan intactos por diseño. El adaptador entrena 10.485.760 parámetros, un 0,038% de los 27.780 millones del base.

Su relevancia es la de un caso de estudio práctico sobre control de estilo mediante PEFT: demuestra que es posible inyectar una persona conversacional marcada tocando menos del 0,04% de los pesos y solo en un subconjunto de capas, con licencia Apache-2.0 y tres formatos de distribución (adaptador PEFT, GGUF para llama.cpp y pesos fusionados en BF16). Es un artefacto pensado para roleplay, demos de agentes y experimentación con control de tono, no para producción de alta fiabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer híbrido Qwen3.8-27B (16 capas de atención completa + capas de atención lineal; incluye torre de visión) |
| Parametros totales | 10.485.760 parámetros entrenables en el adaptador (0,038% del base de 27,78B); el modelo base completo son 27.780 millones |
| Parametros activos | no disponible (no se indica que el base sea MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen3.8-27B; no especificada en la información) |
| Tipos de cuantizacion | Entrenado contra NF4 de 4 bits (bitsandbytes); adaptador en safetensors; existe variante GGUF para llama.cpp; pesos fusionados en BF16 |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT, 42 MB); GGUF en repo separado; BF16 fusionado (55,6 GB) en repo separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.8-27B, un transformer con mezcla de capas de atención completa y atención lineal, y con capacidad multimodal (el quickstart usa `AutoModelForImageTextToText` y el autor menciona una "vision tower"). El LoRA usa r=16, alpha=32 y dropout 0, con módulos objetivo `q_proj`, `k_proj`, `v_proj` y `o_proj` restringidos a las 16 capas de atención completa (3, 7, 11... 63). El entrenamiento se realizó contra la build `unsloth/Qwen3.8-27B-unsloth-bnb-4bit`, es decir, QLoRA sobre pesos pre-cuantizados en NF4 de 4 bits con bitsandbytes.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. El autor sí documenta el método de verificación de la variante fusionada: comparación tensor a tensor que confirma que los pesos fusionados equivalen al base más el delta del adaptador. La innovación destacable no es arquitectónica sino metodológica: la restricción deliberada del alcance a las proyecciones de atención de las capas full-attention como técnica de control de estilo sin degradar conocimiento ni multimodalidad.

## Capacidades

- Generación de texto conversacional con un estilo marcado: respuestas directas, sin saludos ni preámbulos, tono seco y sardónico.
- Razonamiento técnico: en las demos responde con explicaciones completas por capas sobre qué capas tocar al entrenar un estilo (capas 3, 7, 11... 63) sin perder el tono.
- Soporte de tool calling y uso de agentes: las demos muestran escritura de un script `pizza.py`, ejecución en terminal, detección de un bug de rutas en Windows y recuperación posterior.
- Capacidad multimodal heredada del base (torre de visión intacta), aunque no se documentan demos de visión.
- Capacidades multilingües limitadas a inglés y chino; hay demos en ambos idiomas, incluida una en la que el modelo responde sobre su propio entrenamiento ("你rank设的几？").
- Autoconocimiento de estilo: en la demo de agente describe su propio tono ("brevity-first, expert-voice, sycophancy-punished").
- No añade conocimiento nuevo: es explícitamente un adaptador de estilo.

## Casos de uso

- Roleplay y personajes conversacionales: montar el adaptador sobre el base en bf16 con PEFT permite obtener un personaje coherente y con voz propia para demos interactivas, sin reentrenar el modelo completo.
- Demos de agentes con personalidad: el caso de la pizza (escribir script, ejecutarlo, fallar por una ruta de Windows y corregirla) ilustra un agente de terminal con tool use y tono consistente, útil para probar harnesses de agentes.
- Investigación sobre control de estilo con PEFT: sirve como referencia reproducible de cómo aislar el efecto de un LoRA a las proyecciones de atención de un subconjunto de capas y comparar con alternativas que tocan todas las capas.
- Evaluación de la deriva de personalidad: al ser un adaptador pequeño y bien delimitado, es adecuado para medir cuánto estilo se puede inyectar antes de degradar capacidades del base en benchmarks controlados.
- Asistente técnico interno con tono directo: para equipos que prefieren respuestas sin cortesías ni relleno, el adaptador ofrece un registro conciso y experto en inglés o chino.
- Distribución en tres formatos para pruebas de despliegue: el adaptador PEFT para transformers, el GGUF para llama.cpp y los pesos fusionados en BF16 permiten comparar latencia y fidelidad de estilo entre stacks sin cambiar de modelo.
- Experimentos de alineación y sycophancy: el autor describe el estilo como "sycophancy-punished", lo que lo hace útil para estudiar cómo un LoRA de estilo puede reducir la adulación en las respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 42 MB; el coste real está en el modelo base de 27,78B parámetros.
- Inferencia en bf16 del base: aproximadamente 55,6 GB de pesos, por lo que requiere del orden de 60-70 GB de VRAM sumando caché KV y overhead; encaja en A100 80 GB, H100 80 GB o configuraciones multi-GPU.
- Inferencia en 4 bits (NF4, la build usada para entrenar): el base baja a una horquilla aproximada de 15-18 GB de pesos, lo que permite ejecución en una RTX 4090 de 24 GB o en una A6000 de 48 GB con margen para contexto.
- No cabe en GPUs de consumo de 8-16 GB en cuantizaciones altas sin recurrir a GGUF agresivo y offload a CPU; no se dispone de cifras verificadas para esos casos.
- Despliegue: transformers + PEFT (adaptador), llama.cpp con la variante GGUF, y pesos fusionados BF16 para servir con vLLM o TGI (no se documenta compatibilidad explícita con estos dos últimos en la información).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| wesjos/Qwen3.8-27B-GrumpyGuy-LoRA | LoRA de estilo sobre Qwen3.8-27B | 10,49M entrenables (base 27,78B) | no disponible | Apache-2.0 | Adaptador de 42 MB, solo proyecciones de atención en 16 capas, idiomas en/zh |
| Qwen/Qwen3.8-27B (base) | Modelo completo | 27,78B | no disponible | Apache-2.0 | Sin personalidad forzada; mismo conocimiento y multimodalidad |
| wesjos/Qwen3.8-27B-GrumpyGuy | Pesos fusionados BF16 | 27,78B | no disponible | Apache-2.0 | Mismo resultado sin paso de adaptador; 55,6 GB |
| wesjos/Qwen3.8-27B-GrumpyGuy-LoRA-GGUF | Adaptador en GGUF | 10,49M entrenables | no disponible | Apache-2.0 | Para llama.cpp en tiempo de ejecución |

No se dispone de datos de benchmarks que permitan comparar rendimiento frente a otros adaptadores de estilo o modelos de roleplay de la misma categoría.

## Limitaciones y advertencias

- Es un adaptador de estilo: no mejora conocimiento, razonamiento ni matemáticas respecto al base, y cualquier carencia del base se hereda intacta.
- Riesgo de alucinación equivalente al del modelo base; el tono asertivo del personaje puede hacer que las respuestas incorrectas suenen más seguras, lo que agrava el riesgo en producción.
- Idiomas limitados a inglés y chino; no hay evidencia de comportamiento en castellano ni en otras lenguas.
- El tono gruñón y sardónico es inadecuado para atención al cliente orientada a usuario final sin una capa de moderación o filtrado.
- Solo se han modificado las proyecciones de atención de las 16 capas full-attention; el estilo puede degradarse o diluirse en contextos muy largos o en tareas que dependan de capas no tocadas.
- Entrenado contra una build NF4 concreta (`unsloth/...-bnb-4bit`); montarlo sobre otras cuantizaciones puede alterar la fidelidad del estilo.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni documenta evaluación de sesgos; el despliegue en producción requiere evaluación propia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni reportes independientes de calidad.
- No se documentan límites de contexto, tokens de entrenamiento ni composición del dataset, lo que dificulta reproducir o auditar el adaptador.

## Enlaces

- Adaptador LoRA (PEFT): https://huggingface.co/wesjos/Qwen3.8-27B-GrumpyGuy-LoRA
- Adaptador en GGUF para llama.cpp: https://huggingface.co/wesjos/Qwen3.8-27B-GrumpyGuy-LoRA-GGUF
- Pesos fusionados en BF16: https://huggingface.co/wesjos/Qwen3.8-27B-GrumpyGuy
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Build NF4 usada para entrenar: https://huggingface.co/unsloth/Qwen3.8-27B-unsloth-bnb-4bit
- Demos en el repositorio: https://huggingface.co/wesjos/Qwen3.8-27B-GrumpyGuy-LoRA/tree/main/demos
