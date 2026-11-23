# tablinum/Moon-Beam-8B-A1B-MLX-8bit

## Resumen

Moon-Beam-8B-A1B-MLX-8bit es una cuantización en 8 bits para MLX (Apple Silicon) del modelo Moon-Beam-8B-A1B, publicado por el usuario tablinum. Se trata de un modelo de mezcla de expertos (MoE) de aproximadamente 7.893 millones de parámetros totales, con alrededor de 1.000 millones de parámetros activos por token, y una ventana de contexto de 131.072 tokens. El modelo parte de inclusionAI Ling-3.0-tiny y le incorpora una biblioteca de conocimiento recuperable denominada *engram*.

La propuesta central del modelo es el uso de recuperación como parte del flujo de generación: está entrenado para responder a partir de pasajes recuperados y para invocar una herramienta de búsqueda (`search_library`) de forma autónoma. En las evaluaciones del autor, la recuperación eleva drásticamente los resultados en tareas factuales (por ejemplo, SimpleQA pasa de 3,0% a 60,1% de respuestas correctas con thinking activado). Esta cuantización MLX 8-bit ocupa 8,3 GB y mantiene una concordancia top-1 del 99,20% con BF16 en chat, código y matemáticas, y del 97,40% en WikiText.

La relevancia actual reside en su combinación de contexto largo, tool calling, modo thinking y despliegue local en Apple Silicon, con licencia MIT. El modelo es monolingüe en inglés según la model card. No hay datos de benchmarks independientes publicados fuera de los reportados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture-of-experts), identificador `bailing_hybrid`, basada en inclusionAI Ling-3.0-tiny |
| Parametros totales | 7.893.355.648 (7,89 B) |
| Parametros activos | ~1 B por token (A1B) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | 8-bit (MLX); el modelo base ofrece también MLX 4-bit, GGUF y BF16 |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX 8-bit) |
| Libreria / runtime | mlx-lm >= 0.32 |
| Tamano del repo | 8,9 GB (pesos 8-bit: 8,3 GB) |
| Modelo base | tablinum/Moon-Beam-8B-A1B |
| Fecha de creacion | 2026-11-05 |
| Descargas | 200 |

## Arquitectura y entrenamiento

Moon-Beam es un transformer con arquitectura de mezcla de expertos: 8B parámetros totales con aproximadamente 1B activos por token, sobre la base de Ling-3.0-tiny de inclusionAI. La etiqueta `bailing_hybrid` en el repositorio sugiere una variante híbrida del linaje Bailing/Ling, aunque la model card no detalla la composición exacta de capas ni el mecanismo de atención. El contexto máximo es de 131.072 tokens.

El ajuste fino se realizó con QLoRA sobre pasajes recuperados, problemas matemáticos, llamadas a herramientas y conversaciones multi-turno. El release corresponde a la ronda 1b; una ronda 2 no superó las puertas de validación en held-out y fue descartada. El modelo incorpora un modo *thinking* (razonamiento explícito) y está entrenado para usar una herramienta de búsqueda sobre la biblioteca *engram*. El ecosistema de servicio (terrabeam) forma parte del diseño: la model card documenta que conservar el razonamiento entre turnos es determinante para el rendimiento en tau2-bench (0,711 con razonamiento conservado frente a 0,045 sin él).

La cuantización MLX 8-bit se convirtió con mlx-lm 0.32 y se probó en CPU con MLX. La concordancia top-1 con BF16 es del 99,20% en chat, código y matemáticas mixtos, y del 97,40% en WikiText, con divergencia KL de 0,0008 y 0,0038 respectivamente.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 131.072 tokens.
- Razonamiento explícito mediante modo *thinking* (hasta 32K tokens nuevos en la configuración de evaluación).
- Razonamiento matemático: 95,5% en 400 preguntas GSM8K con thinking activado (protocolo de la model card).
- Tool calling / function calling: invocación autónoma de `search_library` con consultas propias, tantas veces como necesite.
- Recuperación aumentada nativa: entrenado para responder a partir de pasajes recuperados en un formato concreto.
- Memoria de conversaciones anteriores (notas de chats previos emparejadas por palabras distintivas), gestionada por el harness terrabeam.
- Respuesta a preguntas factuales sobre bibliotecas de tablas (EngramBench: 86,5% con thinking y pasajes).
- Actuación como agente de soporte en dominios específicos (tau2-bench: airline, retail, telecom).
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Agente de atención al cliente: el modelo puede gestionar conversaciones multi-turno de soporte (tau2-bench reporta recompensa media de 0,71 en airline, 0,80 en retail y 0,62 en telecom) apoyándose en el contexto de 131K tokens y en la conservación del razonamiento entre turnos, que resulta crítica para el rendimiento.
- Asistente sobre base de conocimiento corporativa: desplegado tras el proxy terrabeam, recupera pasajes de bibliotecas de tablas y responde preguntas de una y dos etapas; el autor reporta 91,7% de acierto en tareas factuales y 63,6% en preguntas de dos pasos con terrabeam 0.3.
- Resolución de problemas matemáticos: con thinking activado alcanza 95,5% en GSM8K, adecuado para tutoría o verificación de cálculos paso a paso.
- Despliegue local en Apple Silicon: la cuantización 8-bit (8,3 GB) permite ejecutar el modelo en equipos Mac con memoria unificada suficiente mediante `mlx_lm.server`, con API compatible con OpenAI.
- Memoria persistente de usuario: las notas de conversaciones anteriores se recuperan y muestran junto a los pasajes de biblioteca, lo que habilita asistentes personalizados que recuerdan hechos del usuario (89,6% de acierto en tareas de memoria con terrabeam 0.3).
- Respuesta a preguntas factuales con citas de fuentes: la recuperación eleva SimpleQA de 3,0% a 60,1% y AA-Omniscience de 10,5% a 28,0%, útil en escenarios donde el modelo debe fundamentar respuestas en documentos.
- Prototipado de pipelines RAG: al estar entrenado en el formato exacto de pasajes de terrabeam, sirve como banco de pruebas para arquitecturas de recuperación con tool calling.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card (protocolo propio: temperatura 1,0, top_p 0,95, top_k 20, hasta 32K tokens nuevos, ventana completa de 131K):

| Benchmark | Configuracion | Resultado |
|---|---|---|
| GSM8K (400 preguntas) | Thinking on | 95,5% |
| EngramBench (503 preguntas) | Thinking on, con pasajes | 86,5% (436/503) |
| EngramBench (503) | Thinking off, con pasajes | 87,9% |
| EngramBench (503) | Thinking on, sin pasajes | 12,1% |
| SimpleQA (1000) | Thinking on, con pasajes | 60,1% |
| SimpleQA (1000) | Thinking on, sin pasajes | 3,0% |
| SimpleQA (1000) | Thinking off, con pasajes | 58,1% |
| AA-Omniscience (200) | Thinking on, con pasajes | 28,0% |
| AA-Omniscience (200) | Thinking on, sin pasajes | 10,5% |
| tau2-bench airline | Agente de soporte | 0,71 de recompensa media |
| tau2-bench retail | Agente de soporte | 0,80 de recompensa media |
| tau2-bench telecom | Agente de soporte | 0,62 de recompensa media |

Evaluación del harness terrabeam (154 tareas held-out, mismas ponderaciones):

| Tipo de tarea | terrabeam 0.2 | terrabeam 0.3 |
|---|---:|---:|
| Hechos (108 tareas) | 59,7% | 91,7% |
| Preguntas de dos pasos (22) | 9,1% | 63,6% |
| Memoria de chats previos (24) | 64,6% | 89,6% |
| Todas (correctas / incorrectas) | 53,2% / 14,6% | 83,4% / 12,0% |

Fidelidad de la cuantización MLX 8-bit frente a BF16: concordancia top-1 del 99,20% en chat, código y matemáticas mixtos, y del 97,40% en WikiText (KLD 0,0008 / 0,0038).

No se han publicado resultados de benchmarks independientes en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada: 8,3 GB para los pesos 8-bit MLX; el repo completo ocupa 8,9 GB.
- Plataforma objetivo: Apple Silicon con MLX (probado en CPU con MLX); no está pensado para CUDA.
- Memoria del sistema: se recomienda disponer de al menos 12-16 GB de memoria unificada para cargar los pesos y mantener contexto largo; el requisito exacto para la ventana completa de 131K tokens no está disponible.
- GPU recomendadas: no aplica en el sentido tradicional; el modelo está orientado a chips Apple (M-series). Para otras plataformas existen los formatos GGUF y BF16 del modelo base.
- Cabe en equipos de consumo: sí, en Mac con memoria unificada suficiente; para GPUs de consumo habría que usar el formato GGUF del modelo base (no incluido en este repo).
- Despliegue: `mlx_lm.generate` para CLI y `mlx_lm.server` para API estilo OpenAI; se recomienda anteponer el proxy terrabeam (`terrabeam proxy --upstream ... --format tablinum --library-tool --keep-reasoning --memory long-term`).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato / plataforma |
|---|---|---|---|---|---|
| Moon-Beam-8B-A1B (MLX 8-bit) | 7,89 B | ~1 B | 131.072 | MIT | MLX, Apple Silicon |
| inclusionAI Ling-3.0-tiny (base) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card menciona el modelo base Ling-3.0-tiny y reporta que, con los mismos pasajes y thinking on, alcanzó 59,2% en SimpleQA (con IQ3 y ajustes anteriores) frente al 60,1% de Moon-Beam round 1b en el protocolo de la card. No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo monolingüe en inglés según la model card; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Dependencia fuerte de la recuperación: sin pasajes, el rendimiento factual cae drásticamente (SimpleQA 3,0% sin pasajes frente a 60,1% con ellos; EngramBench 12,1% frente a 86,5%).
- Dependencia del harness: el rendimiento en tau2-bench airline cae de 0,711 a 0,045 si se descarta el razonamiento entre turnos; el modelo requiere conservar el reasoning y usar terrabeam para funcionar según lo evaluado.
- Riesgo de alucinación: los benchmarks se miden con un grader determinista más un juez LLM; las respuestas parciales y las abstenciones se contabilizan aparte, lo que indica que el modelo puede abstenerse o responder de forma incompleta.
- La ronda 2 de entrenamiento no superó las puertas de validación en held-out, por lo que el release es la ronda 1b; no hay garantía de mejoras posteriores.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones del modelo base Ling-3.0-tiny y de las dependencias (terrabeam, mlx-lm).
- Cuantización 8-bit: aunque la concordancia con BF16 es alta (99,20% / 97,40%), existe una pérdida menor de fidelidad respecto al modelo en precisión completa.
- Plataforma limitada a Apple Silicon para este formato; el despliegue en GPU NVIDIA requiere el formato GGUF o BF16 del modelo base.
- No hay datos publicados sobre sesgos, latencia, throughput ni comportamiento en producción a escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-MLX-8bit
- Modelo base: https://huggingface.co/tablinum/Moon-Beam-8B-A1B
- Version MLX 4-bit: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-MLX
- Version GGUF: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF
- Notas de modelo y evaluacion: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF/blob/main/stats/README.md
- Decision de la ronda 2: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF/blob/main/stats/round2_gate_decision.txt
- Repositorio terrabeam: https://github.com/chadstthomas-svg/terrabeam
- Release terrabeam 0.3.0: https://github.com/chadstthomas-svg/terrabeam/releases/tag/v0.3.0
