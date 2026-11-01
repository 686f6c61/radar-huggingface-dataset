# VertexAGI/quartz-micro-preview-v3

## Resumen

Quartz Micro Preview V3 es un modelo lingüístico de tamaño muy reducido (~100 millones de parámetros) entrenado desde cero por Vertex AGI, una organización independiente. Se trata de la versión con ajuste por instrucciones (instruction-tuned) de la tercera generación de la familia Quartz, cuyo modelo base es `VertexAGI/quartz-micro-preview-v3-base`. El entrenamiento se realizó íntegramente en una única GPU de consumo (una GTX 1660 Ti), lo que lo convierte en un proyecto de investigación y afición más que en un modelo de producción.

El problema que aborda es el de demostrar que se puede entrenar un chatbot funcional desde cero con recursos mínimos, y servir como banco de pruebas educativo para entender el ciclo completo de preentrenamiento y ajuste por instrucciones. La versión V3 introduce un conjunto de datos de identidad propio (`quartz-identity-data`) que corrige uno de los fallos más graves de V2: el modelo solía atribuirse una identidad falsa.

Es relevante como caso de estudio: a 100M de parámetros escribe texto corto y fluido, pero el propio autor advierte de que inventa hechos, falla en matemáticas, razonamiento y código, y no debe usarse como fuente de verdad. Su arquitectura es un decodificador denso tipo Llama con 12 capas, contexto de 1.024 tokens y vocabulario byte-level BPE de 32K tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador denso tipo Llama (LlamaForCausalLM) |
| Parametros totales | 100.092.672 (~100M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | fp32, fp16, 8-bit (MLX y GGUF Q8_0), 4-bit (MLX q4 y GGUF Q4_K_M) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, MLX |

## Arquitectura y entrenamiento

El modelo es un transformer decodificador denso de arquitectura Llama con 12 capas, dimensión oculta de 768, 12 cabezas de atención y 4 cabezas KV (agrupación de KV heads, similar a GQA), activación SwiGLU con dimensión intermedia de 2.048, codificación posicional RoPE y un vocabulario de 32.000 tokens mediante tokenizador byte-level BPE con pesos compartidos entre embedding y capa de salida (tied embeddings). El contexto es de 1.024 tokens.

Fue entrenado desde cero (no es un destilado ni un ajuste de otro modelo) en una única GTX 1660 Ti, lo que limita tanto la escala del modelo como el volumen de datos. La versión V3 añade el conjunto de datos `quartz-identity-data` respecto a V2 para mejorar la identificación del modelo. No hay información disponible sobre el número de tokens de entrenamiento, la composición detallada del corpus ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Generacion de texto conversacional corta y fluida en ingles, con plantilla de chat estandar (`apply_chat_template`).
- Respuestas que terminan de forma natural en la mayoria de los casos (31/33 en las pruebas del autor) y baja repeticion (distinct-4-gram de 0,97).
- Identificacion correcta de su propia identidad en la mayoria de los casos (71% en prompts reservados, 96% en prompts escritos a mano).
- No hay soporte documentado de tool calling, function calling, agentes ni capacidades multimodales.
- Debilidades reconocidas por el autor: matematicas, razonamiento y codigo deficientes; tiende a inventar detalles y a ignorar los limites de longitud solicitados.
- Rendimiento degradado en conversaciones multi-turno (solo 4/13 aciertos de identidad en ese escenario).

## Casos de uso

- Aprendizaje del ciclo completo de entrenamiento de LLM: al ser un modelo pequeno y entrenado desde cero con hardware de consumo, es ideal para estudiar preentrenamiento, ajuste por instrucciones y evaluacion sin coste de GPU elevado.
- Experimentacion con cuantizacion: el repositorio incluye fp32, fp16, 8-bit y 4-bit en tres formatos, con mediciones de perplejidad por formato, lo que permite comparar el impacto real de la cuantizacion en un modelo controlado.
- Prototipado de interfaces de chat en dispositivos de bajos recursos: con 67 MB en Q4_K_M y compatibilidad con llama.cpp y LM Studio, puede ejecutarse en portatiles sin GPU dedicada.
- Demostraciones educativas y talleres: su tamano permite ejecutarlo en tiempo real incluso en CPUs modestas o en un Space de Hugging Face gratuito.
- Pruebas de plantillas de chat y tokenizadores BPE a nivel de byte: util para depurar pipelines de tokenizacion y formateo de prompts.
- Comparacion entre generaciones de modelos: el autor publica V1, V2 y V3 junto con sus bases preentrenadas, util para estudiar el efecto de datos de identidad y ajuste adicional.

No es adecuado para produccion, asistentes reales ni generacion de codigo.

## Benchmarks y rendimiento

El autor publica una comparacion entre V2 y V3 (ambos instruct, mismos 156 prompts, decodificacion greedy con repetition penalty 1,1, juez `nvidia/nemotron-3-ultra-550b-a55b` a temperatura 0):

| Test | V2 | V3 |
|---|---|---|
| Identidad, 100 prompts reservados | 3/100 (3%) | 71/100 (71%) |
| Identidad, 24 prompts escritos a mano | 5/24 (21%) | 23/24 (96%) |
| Hechos, 15 prompts originales de V2 | 5/15 | 11/15 |
| Hechos, 11 prompts nuevos | 4/11 | 9/11 |
| Hechos, total 26 | 9/26 | 20/26 |
| Head-to-head en 33 prompts generales | 4 victorias | 25 victorias (4 empates) |
| Respuestas que terminan solas (`<eos>`) | 23/33 | 31/33 |
| Distinct-4-gram (mayor = menos repeticion) | 0,801 | 0,97 |
| Longitud media de respuesta (palabras) | 126,8 | 51,5 |
| Loss en tokens de asistente (validacion general) | 2,383 | 1,719 |
| Loss en respuestas de identidad reservadas | 4,298 | 1,304 |

Perplejidad por formato (held-out text; menor es mejor):

| Formato | Perplejidad | Diferencia |
|---|---:|---:|
| transformers fp32 | 13,878 | 0,000% |
| MLX fp16 | 13,875 | 0,020% |
| MLX 8-bit | 13,878 | 0,001% |
| MLX 4-bit | 14,739 | 6,205% |
| GGUF f16 | 13,878 | 0,001% |
| GGUF Q8_0 | 13,877 | 0,009% |
| GGUF Q4_K_M | 13,955 | 0,557% |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM para inferencia: minima. En fp32 ocupa 400 MB; en fp16, 200 MB; en 8-bit, 108-113 MB; en 4-bit, 63-67 MB. Cabe holgadamente en cualquier GPU moderna o incluso solo en CPU.
- GPU recomendadas: no requiere GPU dedicada. El propio modelo se entreno en una GTX 1660 Ti (6 GB), por lo que cualquier GPU de consumo posterior es mas que suficiente para inferencia.
- Consumer GPUs: funciona sin problemas en practicamente cualquier GPU con al menos 1 GB de VRAM, y en CPU gracias a llama.cpp, Ollama y LM Studio.
- Opciones de despliegue: Hugging Face Transformers (sin `trust_remote_code`), mlx-lm en Apple Silicon, llama.cpp, Ollama y LM Studio mediante GGUF. Los archivos MLX estan en las carpetas `mlx/fp16`, `mlx/q8` y `mlx/q4`.
- Latencia y throughput: no disponibles, aunque el tamano (~100M parametros) implica respuestas practicamente instantaneas incluso en hardware modesto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| VertexAGI/quartz-micro-preview-v3 | ~100M | 1.024 | Apache 2.0 | Entrenado desde cero; solo ingles; capacidades muy limitadas |
| VertexAGI/quartz-micro-preview-v2 | no disponible | no disponible | no disponible | Generacion anterior, sin datos de identidad; pierde claramente frente a V3 |
| SmolLM2-135M-Instruct (HuggingFaceTB) | 135M | 2.048 | Apache 2.0 | Modelo comparable en escala, con entrenamiento a mayor escala y mejores capacidades generales |

Comparaciones cuantitativas directas con SmolLM2 u otros modelos pequenos no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- El propio autor advierte de que el modelo "afirma hechos erroneos e inventa detalles": el riesgo de alucinacion es alto y estructural, dado el tamano del modelo y el entrenamiento con recursos limitados.
- Debilidad severa en matematicas, razonamiento y codigo.
- Solo soporta ingles; no hay capacidades multilingues documentadas.
- Contexto de solo 1.024 tokens, insuficiente para documentos largos o conversaciones extensas; ademas, el modelo ignora a menudo las instrucciones de longitud de respuesta.
- Rendimiento notablemente degradado en conversaciones multi-turno (solo 4/13 aciertos de identidad en ese escenario).
- La cuantizacion a 4 bits en MLX degrada la perplejidad un 6,2%, notablemente mas que las demas variantes; si se busca maxima fidelidad, conviene usar fp16, 8-bit o GGUF Q8_0.
- La licencia Apache 2.0 permite uso comercial sin restricciones relevantes, pero la calidad del modelo lo hace inadecuado para entornos de produccion.
- Es un modelo en fase "preview": debe tratarse como proyecto de investigacion o aficion, no como fuente de verdad.

## Enlaces

- Modelo instruct: https://huggingface.co/VertexAGI/quartz-micro-preview-v3
- Modelo base: https://huggingface.co/VertexAGI/quartz-micro-preview-v3-base
- Generacion anterior (V2): https://huggingface.co/VertexAGI/quartz-micro-preview-v2
- Chat Space de demostracion: https://huggingface.co/spaces/VertexAIco/quartz-micro-preview-chat
