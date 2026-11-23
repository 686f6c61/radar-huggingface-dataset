# tablinum/Moon-Beam-8B-A1B-MLX

## Resumen

Moon-Beam-8B-A1B-MLX es la conversión al formato MLX del modelo Moon-Beam-8B-A1B, un modelo de mezcla de expertos (MoE) desarrollado por Tablinum. Con 8.000 millones de parámetros totales y aproximadamente 1.000 millones activos por token, está diseñado específicamente para trabajar con recuperación de conocimiento: el modelo fue afinado para responder a partir de pasajes recuperados de una biblioteca de conocimiento propietaria denominada *engram*, servida mediante la herramienta terrabeam. Parte del modelo base Ling-3.0-tiny de inclusionAI y se ha ajustado con QLoRA en pasajes recuperados, problemas matemáticos, llamadas a herramientas y conversaciones multiturno.

La relevancia de esta versión MLX es que permite ejecutar el modelo en Apple Silicon de forma nativa, con una cuantización mixta de 4 bits en los expertos y 8 bits en la atención y pesos compartidos, lo que reduce el peso a 4,6 GB. El modelo soporta modo de razonamiento (*thinking*), llamadas a herramientas y una ventana de contexto de 131.072 tokens, lo que lo hace apto para tareas de agente con recuperación documental y memoria de conversaciones anteriores.

Esta ficha describe la variante MLX de 4 bits; los pesos BF16, GGUF y MLX de 8 bits se distribuyen en repositorios separados del mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre Ling-3.0-tiny (tag `bailing_hybrid`), con atención y pesos compartidos en 8 bits |
| Parametros totales | 7.893.392.800 (≈8B) |
| Parametros activos | ≈1B por token |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | 4 bits en expertos, 8 bits en atención y pesos compartidos (mezcla "beam"); existen variantes MLX 8 bits, GGUF y BF16 en repositorios separados |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors con `custom_code`, librería mlx; repo de 4,9 GB |

## Arquitectura y entrenamiento

Moon-Beam es un transformer con arquitectura de mezcla de expertos, construido sobre Ling-3.0-tiny de inclusionAI. El modelo reparte 8B de parámetros entre expertos, activando aproximadamente 1B por token. La ventana de contexto alcanza los 131.072 tokens. La conversión MLX aplica una cuantización mixta: expertos en 4 bits y atención junto con pesos compartidos en 8 bits, con un acuerdo top-1 del 96,75 % respecto a BF16 en chat, código y matemáticas, y del 90,92 % en WikiText (KLD 0,0115 y 0,0444 respectivamente). La conversión se realizó con mlx-lm 0.32.

El ajuste se hizo con QLoRA (ronda 1b) sobre pasajes recuperados, problemas matemáticos, llamadas a herramientas y conversaciones multiturno. Una segunda ronda de entrenamiento no superó a la ronda 1b en las pruebas de validación retenidas, por lo que la versión publicada es la 1b. El modelo está entrenado para consumir pasajes de la biblioteca *engram* en un formato concreto, servida por la herramienta terrabeam, e incorpora razonamiento persistente entre turnos y memoria de conversaciones anteriores.

## Capacidades

- Generación de texto y razonamiento con modo *thinking* activable.
- Razonamiento matemático: 95,5 % en 400 preguntas de GSM8K con thinking activo (protocolo de la model card).
- Respuesta basada en recuperación: entrenado para responder a partir de pasajes recuperados de la biblioteca engram.
- Llamada a herramientas: soporta `search_library` para que el propio modelo formule consultas de búsqueda y las repita tantas veces como necesite.
- Comportamiento de agente en conversaciones multiturno: evaluado en tau2-bench en dominios de aerolínea, retail y telecom.
- Memoria de conversaciones anteriores: las notas de chats previos se emparejan por palabras distintivas (nombres, lugares) y se muestran junto a los pasajes de la biblioteca.
- Persistencia del razonamiento entre turnos: la puntuación en tau2 airline depende de conservar el razonamiento previo (0,711 conservado frente a 0,045 descartado).
- Capacidades multilingües: solo inglés declarado.

## Casos de uso

- Agente de soporte al cliente con base de conocimiento: el modelo puede atender conversaciones multiturno apoyándose en la recuperación de pasajes de una biblioteca documental y en la memoria de interacciones previas; los resultados en tau2-bench (0,71 en airline, 0,80 en retail, 0,62 en telecom) lo sitúan como opción realista para este escenario.
- Asistente de atención al cliente con memoria a largo plazo: las notas de conversaciones anteriores se recuperan por palabras distintivas, lo que permite retomar el contexto de un cliente entre sesiones sin repetir información.
- Resolución de problemas matemáticos con verificación: el modo thinking y el 95,5 % en GSM8K lo hacen adecuado para tareas de cálculo paso a paso en entornos educativos o de validación.
- Preguntas de dos pasos sobre documentación interna: con la herramienta de búsqueda, el modelo formula consultas encadenadas; la tasa de acierto en preguntas de dos pasos subió del 9,1 % al 63,6 % con terrabeam 0,3.
- Despliegue local en Apple Silicon para prototipado: la variante MLX de 4,6 GB se ejecuta con `mlx_lm.server` y expone una API compatible con OpenAI, lo que facilita integrarla en herramientas de desarrollo en Mac.
- Extracción de hechos de tablas y documentos estructurados: en EngramBench respondió correctamente 436 de 503 preguntas con thinking activo y pasajes de la propia tabla de cada pregunta.
- Asistente de investigación con recuperación aumentada: la comparación cerrado frente a recuperado muestra incrementos de 3,0 % a 60,1 % en SimpleQA y de 12,1 % a 86,5 % en EngramBench, lo que lo hace útil en flujos RAG con corpus controlado.

## Benchmarks y rendimiento

Resultados publicados en la model card (protocolo de la model card: temperatura 1,0, top_p 0,95, top_k 20, hasta 32K tokens nuevos, ventana completa de 131K):

| Benchmark | Configuración | Resultado |
|---|---|---|
| GSM8K (400 preguntas) | Thinking activo | 95,5 % correctas |
| EngramBench (503 preguntas) | Thinking activo, pasajes de la tabla de cada pregunta | 436/503 (86,5 %) |
| EngramBench (503) | Thinking activo, cerrado → recuperado | 12,1 % → 86,5 % |
| EngramBench (503) | Thinking desactivado, cerrado → recuperado | 8,5 % → 87,9 % |
| SimpleQA (1000) | Thinking activo, cerrado → recuperado | 3,0 % → 60,1 % |
| SimpleQA (1000) | Thinking desactivado, cerrado → recuperado | 3,0 % → 58,1 % |
| AA-Omniscience dev (200) | Thinking activo, cerrado → recuperado | 10,5 % → 28,0 % |
| AA-Omniscience dev (200) | Thinking desactivado, cerrado → recuperado | 7,5 % → 27,0 % |
| tau2-bench airline | Agente de soporte | 0,71 de recompensa media |
| tau2-bench retail | Agente de soporte | 0,80 de recompensa media |
| tau2-bench telecom | Agente de soporte | 0,62 de recompensa media |

Evaluación del arnés terrabeam sobre 154 tareas retenidas de biblioteca:

| Tipo de tarea | terrabeam 0.2 | terrabeam 0.3 |
|---|---:|---:|
| Hechos (108 tareas) | 59,7 % | 91,7 % |
| Preguntas de dos pasos (22) | 9,1 % | 63,6 % |
| Memoria de chats anteriores (24) | 64,6 % | 89,6 % |
| Todas las tareas (correctas / incorrectas) | 53,2 % / 14,6 % | 83,4 % / 12,0 % |

Calidad de la cuantización MLX: acuerdo top-1 con BF16 del 96,75 % en chat, código y matemáticas, y del 90,92 % en WikiText (KLD 0,0115 / 0,0444).

## Requisitos de hardware

- Peso del repositorio MLX de 4 bits: 4,9 GB en disco; el autor indica 4,6 GB para los pesos cuantizados.
- VRAM/unified memory estimada para inferencia: en torno a 5-6 GB para el modelo más overhead de contexto; con ventana completa de 131K tokens la memoria de caché KV crece de forma significativa.
- Diseñado para Apple Silicon (MLX); requiere `mlx-lm>=0.32`.
- En GPUs NVIDIA no se distribuye una variante MLX utilizable; para esos entornos hay que recurrir a las variantes GGUF o BF16 del mismo autor.
- Cabe en GPUs de consumo con suficiente memoria unificada o VRAM: Mac con Apple Silicon de gama alta, y en el ecosistema NVIDIA cabría en tarjetas con 8 GB o más usando las variantes GGUF.
- Opciones de despliegue: `mlx_lm.generate` y `mlx_lm.server` (API estilo OpenAI) en Apple Silicon; llama.cpp/Ollama mediante la variante GGUF; terrabeam como proxy delante del servidor para inyectar pasajes y activar la herramienta de biblioteca.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Moon-Beam-8B-A1B-MLX | 8B totales, ≈1B activos | 131.072 | MIT | Hugging Face (MLX, GGUF, BF16, MLX 8 bits) | Especializado en recuperación con engram/terrabeam |
| Ling-3.0-tiny (inclusionAI) | No disponible en la información | No disponible | No disponible | No disponible | Modelo base del que parte Moon-Beam; el autor indica 59,2 % en SimpleQA con los mismos pasajes |
| Alternativas MoE de tamaño similar | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la información proporcionada |

No se han publicado en la información disponible comparativas directas con otros modelos de la misma categoría más allá del modelo base Ling-3.0-tiny.

## Limitaciones y advertencias

- Idioma: solo se declara inglés; no hay soporte multilingüe verificado.
- Dependencia de recuperación: el modelo está entrenado para responder a partir de pasajes de la biblioteca engram en un formato concreto; sin terrabeam o un arnés equivalente, el rendimiento en conocimiento factual cae drásticamente (SimpleQA del 60,1 % al 3,0 % en modo cerrado).
- Riesgo de alucinación: en modo cerrado los resultados en SimpleQA y AA-Omniscience son muy bajos, lo que indica propensión a errores factuales sin contexto recuperado.
- Dependencia del arnés: la puntuación en tau2 airline cae de 0,711 a 0,045 si se descarta el razonamiento previo entre turnos, por lo que el sistema de servicio condiciona fuertemente el resultado.
- La ronda 2 de entrenamiento no superó a la ronda 1b en las pruebas de validación; el modelo publicado es la ronda 1b.
- Sesgos conocidos: no se documentan en la información disponible.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones de los datos de entrenamiento y del modelo base Ling-3.0-tiny, no detalladas en la información proporcionada.
- La cuantización MLX de 4 bits introduce una pérdida de fidelidad medible (90,92 % de acuerdo top-1 en WikiText), relevante en tareas que dependan de matices finos.
- La ventana de 131K tokens exige memoria considerable para la caché KV en producción.

## Enlaces

- Modelo en Hugging Face (MLX 4 bits): https://huggingface.co/tablinum/Moon-Beam-8B-A1B-MLX
- Modelo base: https://huggingface.co/tablinum/Moon-Beam-8B-A1B
- Variante MLX 8 bits: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-MLX-8bit
- Variante GGUF: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF
- Notas de modelo y evaluación: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF/blob/main/stats/README.md
- Decisión de la ronda 2: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF/blob/main/stats/round2_gate_decision.txt
- terrabeam (repositorio): https://github.com/chadstthomas-svg/terrabeam
- terrabeam 0.3.0 (release): https://github.com/chadstthomas-svg/terrabeam/releases/tag/v0.3.0
