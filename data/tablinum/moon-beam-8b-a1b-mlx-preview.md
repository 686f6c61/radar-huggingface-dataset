# tablinum/Moon-Beam-8B-A1B-MLX-Preview

## Resumen

Moon-beam 8B A1B (MLX, preview) es un modelo de lenguaje de tipo mixture-of-experts (MoE) publicado por el usuario tablinum en Hugging Face, derivado del modelo base Ling-3.0-tiny de inclusionAI y complementado con una biblioteca de conocimiento recuperable denominada *engram*. Cuenta con 7.893.392.800 parametros totales (8B) y aproximadamente 1B de parametros activos por token, con una ventana de contexto de 131.072 tokens. Esta version concreta es una cuantizacion en formato MLX pensada para ejecucion en Apple Silicon, con expertos en 4 bits y atencion y pesos compartidos en 8 bits.

El modelo esta disenado para responder a partir de pasajes recuperados de una biblioteca de tablas de conocimiento, en lugar de depender unicamente del conocimiento parametrico. La model card reporta mejoras muy sustanciales al anadir recuperacion: en SimpleQA pasa de 30 a 601 respuestas correctas sobre 1.000, y en EngramBench de 61 a 436 sobre 503. Incorpora modo de razonamiento (*thinking*), soporte de tool calling y capacidades de agente multi-paso.

Se trata de una version *preview* (release candidate, ronda 1b) entrenada con QLoRA sobre pasajes recuperados, problemas matematicos, llamadas a herramientas y conversaciones multi-turno. La licencia es MIT y el idioma declarado es unicamente el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE) sobre Ling-3.0-tiny; tag `bailing_hybrid` |
| Parametros totales | 7.893.392.800 (8B) |
| Parametros activos | Aproximadamente 1B por token |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | MLX 4-bit (expertos 4-bit, atencion y pesos compartidos 8-bit, mezcla "beam"); disponible tambien MLX 8-bit, GGUF y BF16 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX); GGUF y BF16 en repos separados |

## Arquitectura y entrenamiento

El modelo es un transformer de tipo mixture-of-experts construido sobre inclusionAI Ling-3.0-tiny, con unos 8B parametros totales y aproximadamente 1B activos por token. La model card lo etiqueta con el tag `bailing_hybrid`, lo que sugiere una variante hibrida dentro de la familia Ling, aunque no se detalla en la informacion disponible la composicion exacta de capas ni el mecanismo de atencion. La ventana de contexto alcanza los 131.072 tokens.

El entrenamiento de la ronda 1b se realizo con QLoRA sobre pasajes recuperados, problemas matematicos, llamadas a herramientas y conversaciones multi-turno. El modelo se apoya en una biblioteca de conocimiento externa (*engram*) formada por tablas, y esta entrenado para consumir los pasajes en un formato concreto que proporciona el proxy terrabeam. La cuantizacion MLX 4-bit se convirtio con mlx-lm 0.32 y reporta una concordancia top-1 con BF16 del 96,75% en chat, codigo y matematicas mixtos, y del 90,92% en WikiText (KLD 0,0115 / 0,0444). No se especifica en la informacion disponible el numero total de tokens de entrenamiento ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional y razonamiento con modo *thinking* activable.
- Razonamiento matematico: 95,5% en 400 preguntas de GSM8K con thinking activado.
- Respuesta aumentada por recuperacion (RAG) sobre bibliotecas de tablas de conocimiento, con formato de pasajes especifico.
- Tool calling y uso de herramientas: el modelo puede invocar `search_library` con sus propias consultas de forma iterativa.
- Razonamiento multi-paso y comportamiento de agente (evaluado en tau2-bench en dominios de aerolinea, retail y telecom).
- Memoria de conversaciones anteriores: recupera notas de chats previos emparejadas por palabras distintivas.
- Soporte de API estilo OpenAI mediante `mlx_lm.server`.
- Capacidades multilingues: limitadas al ingles segun la metadata del modelo.

## Casos de uso

- Agente de atencion al cliente en dominios transaccionales: la model card reporta recompensas medias de 0,71 en airline, 0,80 en retail y 0,62 en telecom en tau2-bench, adecuadas para flujos de soporte con tool calling y contexto largo de 131K tokens.
- Asistente con base de conocimiento corporativa: desplegando terrabeam como proxy delante del servidor MLX, el modelo responde a partir de pasajes recuperados de tablas internas, con una tasa de acierto del 91,7% en tareas de hechos sobre tablas no vistas durante el entrenamiento.
- Busqueda documental multi-paso: el modelo formula sus propias consultas a `search_library`, lo que permite resolver preguntas que requieren encadenar dos recuperaciones (63,6% de acierto en preguntas de dos pasos con terrabeam 0.3).
- Asistencia matematica y de calculo: con thinking activado alcanza 95,5% en GSM8K, util para tutoria o resolucion de problemas aritmeticos en aplicaciones educativas.
- Chat con memoria persistente: recuperacion de hechos personales mencionados en conversaciones anteriores (89,6% de acierto en tareas de memoria con terrabeam 0.3), apropiado para asistentes personales en dispositivos Apple.
- Inferencia local en Apple Silicon: la cuantizacion MLX 4-bit ocupa 4,6 GB, lo que permite ejecutar el modelo en portatiles Mac con memoria unificada para prototipado y desarrollo offline.
- Evaluacion e investigacion de RAG: la separacion entre pesos y arnes de recuperacion (terrabeam) facilita experimentos controlados sobre el impacto de la recuperacion, con metricas publicadas antes y despues.

## Benchmarks y rendimiento

Resultados reportados en la model card (protocolo de model card: temperatura 1,0, top_p 0,95, top_k 20, hasta 32K tokens nuevos, ventana completa de 131K):

| Benchmark | Thinking on, sin recuperacion | Thinking on, con recuperacion |
|---|---:|---:|
| GSM8K (400 preguntas) | 95,5% (con thinking) | no disponible |
| EngramBench (503) | 12,1% | 86,5% |
| SimpleQA (1000) | 3,0% | 60,1% |
| AA-Omniscience (200) | 10,5% | 28,0% |

| Benchmark | Thinking off, sin recuperacion | Thinking off, con recuperacion |
|---|---:|---:|
| EngramBench (503) | 8,5% | 87,9% |
| SimpleQA (1000) | 3,0% | 58,1% |
| AA-Omniscience (200) | 7,5% | 27,0% |

| tau2-bench (agente de soporte) | Recompensa media |
|---|---:|
| Airline | 0,71 |
| Retail | 0,80 |
| Telecom | 0,62 |

Impacto del arnes terrabeam 0.3 frente a 0.2 sobre 154 tareas de biblioteca retenidas:

| Tipo de tarea | terrabeam 0.2 | terrabeam 0.3 |
|---|---:|---:|
| Hechos (108 tareas) | 59,7% | 91,7% |
| Preguntas de dos pasos (22) | 9,1% | 63,6% |
| Memoria de chats anteriores (24) | 64,6% | 89,6% |
| Todas (correctas / incorrectas) | 53,2% / 14,6% | 83,4% / 12,0% |

Fidelidad de la cuantizacion MLX 4-bit frente a BF16: concordancia top-1 del 96,75% en chat, codigo y matematicas mixtos, y del 90,92% en WikiText (KLD 0,0115 / 0,0444).

## Requisitos de hardware

- VRAM/memoria: la cuantizacion MLX 4-bit ocupa 4,6 GB; el repositorio completo pesa 4,9 GB. La version MLX 8-bit y la BF16 requieren mas memoria (no se detalla la cifra exacta en la informacion disponible).
- GPU recomendadas: el formato MLX esta pensado para Apple Silicon (CPU/GPU unificadas via MLX). Para otras plataformas existen pesos GGUF y BF16, desplegables en GPUs NVIDIA (A100, H100, RTX 4090) mediante llama.cpp o vLLM, aunque no se publican cifras de VRAM especificas para esos formatos.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada suficiente para 4,6 GB mas el contexto; en GPUs de consumo tipo RTX 4090 es viable con la cuantizacion GGUF equivalente.
- Opciones de despliegue: `mlx_lm.generate` y `mlx_lm.server` (API estilo OpenAI) con mlx-lm >= 0.32; proxy terrabeam para inyectar pasajes y activar la herramienta de biblioteca; llama.cpp/Ollama para el formato GGUF; vLLM no esta confirmado para este modelo.
- Latencia y throughput: no se publican cifras en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Moon-beam 8B A1B (MLX, preview) | 8B | ~1B | 131.072 | MIT | MoE con RAG entrenado, thinking y tool calling; solo ingles |
| Ling-3.0-tiny (inclusionAI) | no disponible | no disponible | no disponible | no disponible | Modelo base del que deriva Moon-beam |
| Alternativas MoE de ~8B con ~1B activos | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

No se dispone de datos verificados de modelos comparables en la informacion proporcionada mas alla del propio modelo base.

## Limitaciones y advertencias

- Version *preview* (release candidate, ronda 1b): los pesos pueden ser sustituidos por una version no-preview; no se garantiza estabilidad de comportamiento.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta evaluado.
- Dependencia fuerte del arnes de recuperacion: los resultados altos en benchmarks factuales (SimpleQA, EngramBench) se obtienen solo con pasajes recuperados y el formato correcto; sin recuperacion, el rendimiento cae drasticamente (3,0% en SimpleQA, 12,1% en EngramBench con thinking).
- Sensibilidad al formato: el modelo espera los pasajes en el layout exacto con el que fue entrenado; un proxy o formato distinto degrada la calidad.
- Riesgo de alucinacion: incluso con recuperacion, la tasa de respuestas incorrectas en tareas de biblioteca es del 12,0% con terrabeam 0.3.
- Dependencia del razonamiento conservado entre turnos: en tau2 airline, la recompensa cae de 0,711 a 0,045 si se descarta el razonamiento previo del modelo.
- Licencia MIT: permite uso comercial, pero el modelo base Ling-3.0-tiny puede tener condiciones propias que conviene verificar antes de produccion.
- Sin datos publicados sobre sesgos, robustez frente a prompt injection ni evaluaciones de seguridad.
- El repositorio tiene pocas descargas (452) y cero likes en el momento de la consulta, lo que indica adopcion limitada y poca validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-MLX-Preview
- Modelo base (BF16): https://huggingface.co/tablinum/Moon-Beam-8B-A1B-Preview
- Version MLX 8-bit: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-MLX-8bit-Preview
- Version GGUF: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF-Preview
- Notas de modelo y evaluacion: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF-Preview/blob/main/stats/README.md
- Dataset Tablinum-3: https://huggingface.co/datasets/tablinum/tablinum-3
- Repositorio terrabeam: https://github.com/chadstthomas-svg/terrabeam
- Release terrabeam 0.3.0: https://github.com/chadstthomas-svg/terrabeam/releases/tag/v0.3.0
