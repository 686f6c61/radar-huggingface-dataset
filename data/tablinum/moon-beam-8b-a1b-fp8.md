# tablinum/Moon-Beam-8B-A1B-FP8

## Resumen

Moon-Beam-8B-A1B-FP8 es una cuantizacion en FP8 del modelo Moon-Beam-8B-A1B, publicado por Tablinum. Se trata de un modelo de mezcla de expertos (MoE) con 8B parametros totales y aproximadamente 1B activos por token, construido a partir de inclusionAI Ling-3.0-tiny y afinado por Tablinum sobre una biblioteca de conocimiento recuperable denominada *engram*. El modelo esta disenado para responder a partir de pasajes recuperados, no solo de su conocimiento parametrico.

La relevancia del modelo reside en su enfoque de recuperacion integrada: segun la model card, con thinking activado y pasajes recuperados, Moon-Beam alcanza 95,5% en 400 preguntas de GSM8K, 86,5% en EngramBench (436 de 503) y recompensas medias de 0,71 en airline, 0,80 en retail y 0,62 en telecom en tau2-bench. La version FP8 reduce el peso a 7,9 GB con cuantizacion block-wise de 128x128 y escalas ue8m0, en el mismo layout que inclusionAI Ling-3.0-tiny-fp8.

El modelo soporta contexto de 131.072 tokens, thinking mode y tool calling, y esta pensado para servirse con vLLM o SGLang. La licencia es MIT. El autor advierte que esta variante FP8 no ha sido probada en vLLM por su parte, aunque el layout coincide con el repo FP8 de inclusionAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en inclusionAI Ling-3.0-tiny; tag `bailing_hybrid` |
| Parametros totales | 7.893.392.800 (8B) |
| Parametros activos | Aproximadamente 1B por token (A1B) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | FP8 block-wise (128x128, escalas ue8m0); existen BF16, GGUF y MLX |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (FP8); GGUF y MLX en repos separados |

## Arquitectura y entrenamiento

Moon-Beam es un transformer de mezcla de expertos con 8B parametros totales y unos 1B activos por token, derivado de inclusionAI Ling-3.0-tiny. El tag `bailing_hybrid` sugiere una arquitectura hibrida propia de la familia Ling/Bailing. La ronda 1b se afino con QLoRA sobre pasajes recuperados, problemas de matematicas, llamadas a herramientas y conversaciones multi-turno. La ronda 2 no supero a estos pesos en las puertas de validacion held-out, por lo que la release publicada es la ronda 1b.

El elemento diferenciador es el *engram*, una biblioteca de conocimiento recuperable de Tablinum. El modelo esta entrenado para responder a partir de pasajes recuperados en un formato concreto, y el harness terrabeam se encarga de inyectarlos en cada peticion. Segun la model card, el modelo puede invocar por si mismo `search_library` con sus propias consultas, lo que habilita preguntas de dos pasos. La cuantizacion FP8 emplea escalas ue8m0 en bloques de 128x128, replicando el layout de inclusionAI Ling-3.0-tiny-fp8.

## Capacidades

- Generacion de texto conversacional y multi-turno con contexto de hasta 131.072 tokens.
- Razonamiento con thinking mode (hasta 32K tokens nuevos en la evaluacion de la model card).
- Tool calling y function calling, incluida la herramienta `search_library` para busqueda autonoma en la biblioteca.
- Razonamiento multi-paso sobre pasajes recuperados (preguntas de dos pasos).
- Memoria de conversaciones anteriores mediante el harness terrabeam (notas de chats previos).
- Matematicas: 95,5% en GSM8K segun la model card.
- Respuesta fundamentada en recuperacion (RAG nativo): mejoras sustanciales en SimpleQA y EngramBench al aportar pasajes.
- Capacidades multilingues limitadas al ingles segun los metadatos del modelo.

## Casos de uso

- Atencion al cliente automatizada: el modelo obtiene recompensas medias de 0,71 en airline, 0,80 en retail y 0,62 en telecom en tau2-bench, con contexto de 131K tokens para conversaciones largas y tool calling para consultar sistemas internos.
- Agente de soporte con recuperacion documental: sirviendolo con terrabeam en modo `--library-tool`, el modelo busca por si mismo en la biblioteca y resuelve preguntas de dos pasos (63,6% de acierto en la evaluacion del harness 0.3).
- Asistente de conocimiento corporativo: con el engram cargado de tablas internas, el modelo responde a hechos concretos (91,7% de acierto en tareas de hechos del harness 0.3) citando pasajes recuperados.
- Razonamiento matematico asistido: 95,5% en GSM8K con thinking activado, adecuado para tutoria o resolucion de problemas paso a paso.
- Memoria persistente en asistentes personales: terrabeam conserva notas de conversaciones previas y las muestra junto a los pasajes, con 89,6% de acierto en tareas de memoria del harness 0.3.
- Despliegue en infraestructura modesta: al ocupar 7,9 GB en FP8, puede servirse en una unica GPU consumer de gama alta con vLLM o SGLang, reduciendo coste frente a modelos densos de mayor tamano.
- Pipeline de RAG con control de calidad: la diferencia entre respuestas cerradas y con recuperacion (SimpleQA de 3,0% a 60,1%) permite medir y ajustar la calidad del recuperador en produccion.

## Benchmarks y rendimiento

Datos de la model card (protocolo de model card: temperatura 1,0, top_p 0,95, top_k 20, hasta 32K tokens nuevos, ventana completa de 131K):

| Benchmark | Thinking on, cerrado | Thinking on, con recuperacion | Thinking off, cerrado | Thinking off, con recuperacion |
|---|---:|---:|---:|---:|
| EngramBench (503) | 12,1% | 86,5% | 8,5% | 87,9% |
| SimpleQA (1000) | 3,0% | 60,1% | 3,0% | 58,1% |
| AA-Omniscience (200) | 10,5% | 28,0% | 7,5% | 27,0% |

Otros resultados citados:

| Evaluacion | Resultado |
|---|---|
| GSM8K (400 preguntas, thinking on) | 95,5% |
| EngramBench (503, thinking on, pasajes de la tabla propia) | 86,5% (436/503) |
| tau2-bench airline (recompensa media) | 0,71 |
| tau2-bench retail (recompensa media) | 0,80 |
| tau2-bench telecom (recompensa media) | 0,62 |
| SimpleQA con recuperacion (thinking on) | 60,1% (601/1000 correctas) |

Comparacion de harness (154 tareas held-out, mismas pesos):

| Tipo de tarea | terrabeam 0.2 | terrabeam 0.3 |
|---|---:|---:|
| Hechos (108 tareas) | 59,7% | 91,7% |
| Preguntas de dos pasos (22) | 9,1% | 63,6% |
| Memoria de chats previos (24) | 64,6% | 89,6% |
| Todas las tareas (correctas / incorrectas) | 53,2% / 14,6% | 83,4% / 12,0% |

La model card indica que el base Ling sin entrenar alcanzo 59,2% en SimpleQA con los mismos pasajes y thinking on, frente a 60,1% de la ronda 1b en el protocolo de la model card (el base uso IQ3 y ajustes anteriores). No se han publicado en la informacion disponible resultados comparativos con otros modelos en MMLU, HumanEval u otros benchmarks estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7,9 GB solo para pesos en FP8; anadir memoria para cache KV con contexto de hasta 131.072 tokens, lo que eleva sustancialmente el requisito total en ventanas largas.
- GPU recomendadas: A100 y H100 para contexto completo de 131K; GPU consumer de gama alta (por ejemplo, RTX 4090, 24 GB) para contextos moderados con FP8.
- Cabe en GPU consumer de gama alta en FP8, siempre que se ajuste la longitud de contexto a la VRAM disponible.
- Opciones de despliegue: vLLM (`vllm serve ... --trust-remote-code --max-model-len 131072`) y SGLang (`python -m sglang.launch_server --model-path ... --trust-remote-code`); tambien existen formatos GGUF (llama.cpp/Ollama) y MLX en repos separados.
- Harness recomendado: terrabeam en modo proxy (`terrabeam proxy --upstream ... --format tablinum --library-tool --keep-reasoning --memory long-term`).
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Advertencia del autor: la variante FP8 no ha sido probada en vLLM por su parte; el layout coincide con el repo FP8 de inclusionAI que vLLM y SGLang sirven.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Moon-Beam-8B-A1B-FP8 | 8B totales, ~1B activos | 131.072 | MIT | Enfoque RAG nativo con engram; FP8 en 7,9 GB |
| inclusionAI Ling-3.0-tiny | No disponible en la informacion | No disponible | No disponible | Modelo base del que deriva Moon-Beam; alcanzo 59,2% en SimpleQA con los mismos pasajes |
| inclusionAI Ling-3.0-tiny-fp8 | No disponible en la informacion | No disponible | No disponible | Referencia de layout FP8 que replica Moon-Beam |

No se dispone en la informacion proporcionada de datos de benchmarks de terceros para establecer una comparativa cuantitativa con modelos de la misma categoria.

## Limitaciones y advertencias

- El modelo esta entrenado para responder a partir de pasajes recuperados; sin el harness terrabeam y la biblioteca, su rendimiento en conocimiento factual cae drasticamente (SimpleQA de 60,1% a 3,0%).
- Idiomas soportados limitados al ingles segun los metadatos; no se garantiza calidad en castellano u otros idiomas.
- Riesgo de alucinacion en respuestas cerradas, evidenciado por el bajo rendimiento sin recuperacion.
- La model card advierte de que la variante FP8 no ha sido probada en vLLM por el autor; pueden aparecer problemas de carga.
- El razonamiento entre turnos es critico: en tau2 airline, la puntuacion cae de 0,711 a 0,045 si se descarta el razonamiento previo del modelo.
- Los resultados de benchmarks proceden del propio autor y de su protocolo de evaluacion; no hay validacion independiente en la informacion disponible.
- La licencia MIT permite uso comercial, pero el modelo base Ling-3.0-tiny puede tener condiciones propias que conviene verificar.
- El tag `custom_code` implica `--trust-remote-code` en vLLM/SGLang, con el riesgo de seguridad asociado a ejecutar codigo del repositorio.
- El modelo tiene solo 115 descargas y 0 likes en el momento de la consulta; ecosistema y soporte comunitario muy limitados.

## Enlaces

- Hugging Face (FP8): https://huggingface.co/tablinum/Moon-Beam-8B-A1B-FP8
- Modelo base BF16: https://huggingface.co/tablinum/Moon-Beam-8B-A1B
- GGUF: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF
- MLX: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-MLX
- Notas de modelo y evaluacion: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF/blob/main/stats/README.md
- Decision de la ronda 2: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF/blob/main/stats/round2_gate_decision.txt
- Repositorio terrabeam: https://github.com/chadstthomas-svg/terrabeam
- Release terrabeam 0.3.0: https://github.com/chadstthomas-svg/terrabeam/releases/tag/v0.3.0
