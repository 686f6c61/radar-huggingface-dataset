# swadeshb/g3-1b-hiper

## Resumen

g3-1b-hiper es un adaptador LoRA (librería PEFT) publicado por el usuario swadeshb sobre el modelo base google/gemma-3-1b-pt. No se trata de un modelo completo, sino de un conjunto de pesos de adaptación que debe cargarse junto al modelo base para funcionar. Según su model card, forma parte de un experimento controlado de SFT jerárquico ("hierarchical-SFT") sobre Gemma 3, en el que se compara el método denominado "hiper" con una variante plana publicada por el mismo autor (swadeshb/g3-1b-flat).

El adaptador se ha entrenado exclusivamente con el subconjunto MATH del dataset sxiong/MLR_structured_trajectory, con rango LoRA r=16, alpha=32 y una longitud máxima de entrenamiento de 8192 tokens. Su interés es, por tanto, fundamentalmente experimental: sirve para estudiar si una formulación jerárquica del razonamiento matemático mejora los resultados frente a una formulación plana en un modelo de aproximadamente 1000 millones de parámetros.

El repositorio es de reciente creación (25 de septiembre de 2026) y no registra descargas ni "likes" en el momento de redactar esta ficha. No se especifica licencia, idiomas soportados, pipeline de inferencia ni resultados de evaluación, lo que limita seriamente su uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (modelo base google/gemma-3-1b-pt); detalles internos del adaptador no disponibles |
| Parámetros totales | no disponible para el adaptador; modelo base de aproximadamente 1B de parámetros |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no especificada para el adaptador; longitud máxima de entrenamiento declarada: 8192 tokens |
| Tipos de cuantización | no disponible (el repositorio incluye pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | google/gemma-3-1b-pt |
| Biblioteca | peft |
| Método declarado | hiper (SFT jerárquico) |
| Hiperparámetros LoRA | r=16, alpha=32 |
| Dataset de entrenamiento | sxiong/MLR_structured_trajectory, subconjunto MATH únicamente |
| Tamaño del repositorio | 0.0 GB (según la ficha de HuggingFace; valor redondeado) |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 25 de septiembre de 2026 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre google/gemma-3-1b-pt, un transformer decoder-only de aproximadamente 1000 millones de parámetros. La contribución del autor no es arquitectónica, sino de procedimiento de ajuste: se inyectan matrices de bajo rango (LoRA, r=16, alpha=32) y se entrena únicamente el subconjunto MATH del dataset sxiong/MLR_structured_trajectory, con una longitud máxima de secuencia de 8192 tokens. La model card describe el experimento como "hierarchical-SFT" y lo contrasta explícitamente con una variante plana (g3-1b-flat), lo que sugiere que la diferencia entre ambos adaptadores reside en la estructura de las trayectorias de razonamiento del dataset, no en los hiperparámetros del modelo.

No se dispone de información sobre el número de tokens de entrenamiento, el número de épocas, la composición exacta del dataset, el optimizador ni si se aplicaron fases posteriores de RLHF o DPO. El autor tampoco documenta innovaciones técnicas adicionales (decodificación especulativa, atención lineal, mezcla de expertos, etc.). En la búsqueda web aparece el artículo "HiPER: Hierarchical Reinforcement Learning with Explicit Credit..." (arXiv 2602.16165), que trata sobre RL jerárquico para agentes multi-turno; sin embargo, la model card de este adaptador habla de SFT y no cita ese trabajo, por lo que la relación entre ambos no está confirmada y no debe asumirse.

## Capacidades

- Generación de texto y razonamiento matemático orientado a problemas tipo MATH, único dominio documentado en el entrenamiento.
- Razonamiento estructurado de forma jerárquica, según el método declarado por el autor; no hay evidencia publicada de su eficacia.
- Capacidad de producir soluciones largas: la longitud máxima de entrenamiento de 8192 tokens permite cadenas de razonamiento extensas.
- No hay documentación sobre soporte de tool calling o function calling.
- No hay documentación sobre uso como agente ni razonamiento multi-paso fuera del dominio matemático.
- No hay documentación sobre capacidades multilingües.
- No hay documentación sobre visión, audio ni modo de pensamiento explícito.
- Al ser un adaptador, todas las capacidades heredadas del modelo base (google/gemma-3-1b-pt) siguen presentes, pero el ajuste puede haber desplazado el comportamiento hacia el dominio matemático.

## Casos de uso

- Investigación sobre razonamiento jerárquico: comparar este adaptador con swadeshb/g3-1b-flat bajo el mismo prompt y dataset permite medir, en condiciones controladas, si la estructura jerárquica aporta ventajas frente a una cadena de pensamiento plana en un modelo de 1B.
- Reproducción de experimentos académicos: el adaptador y el dataset sxiong/MLR_structured_trajectory están identificados, lo que facilita replicar o extender el ajuste con otros modelos base y aislar el efecto del formato de datos.
- Estudio del límite de destilación de razonamiento en modelos pequeños: sirve como caso de prueba para analizar hasta qué punto un modelo de ~1B puede absorber trayectorias de razonamiento matemático estructuradas de hasta 8192 tokens.
- Generación asistida de soluciones matemáticas paso a paso en entornos educativos, siempre con revisión humana, dado que el modelo se ha ajustado específicamente sobre problemas tipo MATH.
- Punto de partida para ajustes posteriores: al ser un adaptador LoRA independiente, puede fusionarse con el modelo base o combinarse con otros adaptadores para experimentar con composición de habilidades.
- Análisis de la calidad del dataset MLR_structured_trajectory: evaluar el adaptador es, indirectamente, una forma de auditar si las trayectorias estructuradas del dataset son aprendibles por un modelo pequeño.
- Prototipado en hardware de consumo: su tamaño reducido permite desplegarlo en GPU de gama media para pruebas rápidas de formato y tokenización antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MATH, GSM8K, MMLU ni de ningún otro conjunto de evaluación, y tampoco se aportan comparaciones numéricas con la variante g3-1b-flat ni con el modelo base.

## Requisitos de hardware

- VRAM estimada para el adaptador: muy reducida (decenas de megabytes); el grueso del consumo corresponde al modelo base google/gemma-3-1b-pt.
- Estimación orientativa para el modelo base (~1B parámetros, no confirmada por el autor): aproximadamente 2-2,5 GB en fp16, alrededor de 1-1,5 GB en int8 y en torno a 0,8-1 GB en cuantización de 4 bits, más el espacio de caché KV correspondiente al contexto utilizado.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM es suficiente en la práctica; cabe en tarjetas de consumo como RTX 3060, RTX 4060, RTX 4070 o superiores. Para lotes grandes o contextos de 8192 tokens conviene disponer de 12-24 GB (RTX 3090, RTX 4090, A10, L4).
- Despliegue: transformers + peft para cargar el adaptador directamente; vLLM admite adaptadores LoRA (útil para servir varias variantes, incluida g3-1b-flat, sobre el mismo modelo base). Para llama.cpp u Ollama sería necesario fusionar el adaptador con el modelo base y convertir el resultado a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| g3-1b-hiper | Adaptador LoRA (PEFT) | ~1B (base) + adaptador | Entrenamiento a 8192 tokens | MATH de sxiong/MLR_structured_trajectory, método "hiper" | no disponible | Repositorio HuggingFace, 0 descargas |
| g3-1b-flat | Adaptador LoRA (PEFT) | ~1B (base) | no disponible | Variante plana del mismo experimento | no disponible | Repositorio HuggingFace |
| google/gemma-3-1b-pt | Modelo completo (preentrenado) | ~1B | no disponible en la información proporcionada | no disponible | Condiciones de uso de Gemma | Ampliamente disponible en HuggingFace |

No se dispone de datos de rendimiento comparativos entre estas opciones, por lo que la comparación se limita a tipo de artefacto, tamaño y procedencia.

## Limitaciones y advertencias

- Ausencia total de validación externa: 0 descargas y 0 likes, sin benchmarks ni evaluaciones de terceros.
- Licencia no especificada, lo que impide determinar si se permite el uso comercial del adaptador. Además, al derivar de google/gemma-3-1b-pt, el uso queda condicionado por las condiciones del modelo base, que deben consultarse por separado.
- Especialización estrecha: el entrenamiento se limita al subconjunto MATH, por lo que es esperable degradación o comportamiento errático en tareas ajenas a matemáticas.
- Riesgo elevado de alucinación en pasos intermedios del razonamiento, especialmente al tratarse de un modelo de ~1B de parámetros y sin verificación factual documentada.
- Idiomas soportados no documentados; no hay garantía de comportamiento correcto en castellano.
- Contexto: aunque el entrenamiento llega a 8192 tokens, no se documenta el comportamiento más allá de esa longitud ni la ventana de contexto efectiva del adaptador.
- El tamaño del repositorio aparece como 0.0 GB, un valor redondeado que puede indicar que los pesos son muy pequeños (coherente con un LoRA) o que la subida no se ha completado; conviene verificar la presencia real de los ficheros del adaptador antes de integrarlo.
- No hay información sobre sesgos, composición demográfica del dataset ni medidas de mitigación.
- No hay evidencia de soporte de tool calling ni de uso agéntico; no debe asumirse ninguna de estas capacidades.
- La posible relación con el artículo "HiPER" (RL jerárquico) no está confirmada por el autor y no debe presentarse como vínculo establecido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/swadeshb/g3-1b-hiper
- Variante plana del mismo autor: https://huggingface.co/swadeshb/g3-1b-flat
- Perfil del autor: https://huggingface.co/swadeshb
- Dataset de entrenamiento: https://huggingface.co/datasets/sxiong/MLR_structured_trajectory
- Modelo base: https://huggingface.co/google/gemma-3-1b-pt
- Artículo HiPER (relación no confirmada): https://arxiv.org/abs/2602.16165v1
- Swadesh by Chat360 (producto con nombre coincidente, sin relación confirmada con el autor del adaptador): https://swadeshgpt.com/
