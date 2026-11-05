# tablinum/Moon-Beam-8B-A1B-Preview

## Resumen

Moon-Beam-8B-A1B-Preview es un modelo de lenguaje de tipo mezcla de expertos (MoE) publicado por el usuario tablinum, construido como ajuste fino del modelo base inclusionAI/Ling-3.0-tiny. Cuenta con 7.893.389.856 parámetros totales (unos 8B) y aproximadamente 1B de parámetros activos por token, con una ventana de contexto de 131.072 tokens. Su rasgo diferencial es que está entrenado para responder a partir de pasajes recuperados de una biblioteca de conocimiento propietaria denominada *engram*, servida mediante la herramienta terrabeam.

El modelo se distribuye en pesos BF16 (16 GB) junto con el código de modelado propio (`bailing_hybrid`) que requiere `trust_remote_code=True`. Incluye además una capa MTP (multi-token prediction) entrenada de 0,63 GB para decodificación especulativa. La versión publicada es una *release candidate* (ronda 1b) de un ciclo de desarrollo que prevé una actualización a la biblioteca Tablinum-3.

Es relevante ahora porque propone un enfoque poco habitual: en lugar de competir en conocimiento paramétrico puro, mide y explota la ganancia de rendimiento al inyectar contexto recuperado. Según las cifras preliminares del autor, el paso de modo cerrado a modo con recuperación eleva SimpleQA del 2,8 % al 59,3 % y EngramBench del 12,9 % al 85,7 % con *thinking* activado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `bailing_hybrid` (atención KDA + MLA, MoE) sobre Ling-3.0-tiny |
| Parametros totales | 7.893.389.856 (~8B) |
| Parametros activos | ~1B por token (MoE, dato del autor) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | BF16 (repo principal); GGUF, FP8, MLX y MLX 8-bit en repos separados |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16, 4 shards, 16 GB); capa MTP en `mtp/mtp_layer.safetensors` |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura `bailing_hybrid` heredada de Ling-3.0-tiny, que combina atención KDA (Kimi Delta Attention) y MLA (Multi-head Latent Attention) con capas de mezcla de expertos. El repositorio incluye el código de modelado (`modeling_bailing_moe_v3.py`, `configuration_bailing_moe_v3.py`), por lo que la carga exige `trust_remote_code=True`. La capa MTP entrenada (`model.layers.24.*`) habilita decodificación especulativa con un borrador propio del modelo.

El ajuste fino de la ronda 1b se realizó con QLoRA sobre cuatro tipos de datos: pasajes recuperados de la biblioteca *engram*, problemas matemáticos, llamadas a herramientas y conversaciones multi-turno. No se especifican en la información disponible el volumen total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. El modelo está entrenado para consumir los pasajes en un formato concreto, que terrabeam reproduce actuando como proxy delante del servidor de inferencia.

## Capacidades

- Generación de texto conversacional en inglés con plantilla de chat propia (`chat_template.jinja`).
- Modo *thinking* activado por defecto, con razonamiento extendido antes de la respuesta; puede desactivarse.
- Razonamiento matemático: 96,2 % en GSM8K (400 preguntas) con *thinking* activo en la evaluación preliminar.
- Tool calling / function calling, según los datos de entrenamiento declarados por el autor.
- Conversación multi-turno con seguimiento de contexto: 94,0 % de acierto en primeras preguntas y 93,3 % en segundas preguntas sobre 150 pares.
- Respuesta aumentada por recuperación: diseñado para responder a partir de pasajes inyectados en el prompt.
- Decodificación especulativa mediante capa MTP entrenada.
- Capacidades multilingües: no disponibles; solo se declara inglés.
- Visión y audio: no disponibles.

## Casos de uso

- Asistentes de documentación técnica con recuperación: desplegar el modelo detrás de terrabeam en modo `--memory long-term` permite que cada petición llegue con pasajes del corpus interno en el formato exacto de entrenamiento, lo que según las cifras del autor multiplica la tasa de acierto frente al modo cerrado.
- Respuesta sobre bases de conocimiento corporativas: el salto medido en EngramBench (del 10,1 % al 87,5 % con *thinking* desactivado) lo hace adecuado para sistemas RAG donde la fuente de verdad son tablas o documentos recuperados, no el conocimiento paramétrico.
- Automatización de soporte multi-turno: con 131.072 tokens de contexto puede mantener conversaciones largas con historial extenso y documentos adjuntos sin truncar.
- Agentes con llamadas a herramientas: el ajuste incluye tool calls, de modo que puede encadenarse en pipelines de agentes que consulten APIs y compongan respuestas.
- Resolución de problemas matemáticos y verificación: el 96,2 % en GSM8K con *thinking* activo lo sitúa como candidato para asistentes de cálculo paso a paso, con la cautela de que la cifra es preliminar.
- Prototipado e investigación sobre RAG: al publicar pesos, código, capa MTP y scripts de evaluación, sirve como banco de pruebas reproducible para medir la contribución de la recuperación frente al conocimiento interno.
- Inferencia en hardware modesto: con ~1B de parámetros activos y variantes GGUF y MLX 8-bit, puede ejecutarse en equipos de consumo para tareas de generación con contexto recuperado.

## Benchmarks y rendimiento

Cifras preliminares del 4 de noviembre publicadas por el autor. La columna con recuperación usa pasajes de la tabla propia de cada pregunta.

| Test (muestras) | Thinking on, cerrado → recuperado | Thinking off, cerrado → recuperado |
|---|---:|---:|
| EngramBench (503) | 12,9 % → 85,7 % | 10,1 % → 87,5 % |
| SimpleQA (1000) | 2,8 % → 59,3 % | 2,6 % → 57,5 % |
| AA-Omniscience dev (200) | 10,0 % → 26,5 % | 5,0 % → 26,5 % |

| Test (muestras) | Thinking on | Thinking off |
|---|---:|---:|
| GSM8K (400) | 96,2 % | 92,5 % |
| Multi-turn, primera (150) | 94,0 % | 86,7 % |
| Multi-turn, segunda (150) | 93,3 % | 88,7 % |
| MMLU-Pro (700) | 63,9 % | 44,0 % |

Notas del autor: la columna *thinking off* usó decodificación greedy; en MMLU-Pro, 70 de 700 respuestas con *thinking* on alcanzaron el límite de 30.000 tokens de salida. El modelo base Ling sin entrenar alcanzó 59,2 % en SimpleQA con los mismos pasajes, frente al 59,3 % de la ronda 1b. Las cifras marcadas como preliminares están pendientes de remedición con el protocolo de la model card (temperatura 1.0, top_p 0.95, top_k 20, hasta 32K tokens nuevos, ventana completa de 131K).

## Requisitos de hardware

- VRAM para BF16: aproximadamente 16 GB solo de pesos, más caché KV para 131K tokens; en la práctica requiere GPUs de 40-80 GB para contexto completo.
- VRAM para cuantizaciones: las variantes GGUF y MLX 8-bit reducen sustancialmente la huella, aunque la información disponible no detalla los tamaños por nivel de cuantización.
- GPUs recomendadas: A100 80 GB o H100 para BF16 con contexto largo; RTX 4090 (24 GB) viable en cuantización reducida y contextos moderados.
- Cabe en GPU de consumo: sí, en formato GGUF o MLX 8-bit, con contexto limitado.
- Despliegue: vLLM (`vllm serve ... --trust-remote-code --max-model-len 131072`), SGLang, Transformers 4.57 con `trust_remote_code=True`, y terrabeam (`terrabeam run` o `terrabeam proxy`) como capa de recuperación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Moon-Beam-8B-A1B-Preview | ~8B | ~1B | 131.072 | MIT | Ajuste QLoRA de Ling-3.0-tiny con recuperación integrada |
| inclusionAI/Ling-3.0-tiny | no disponible | no disponible | no disponible | no disponible | Modelo base; 59,2 % en SimpleQA con pasajes |
| Alternativas MoE de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

La información disponible no incluye comparaciones directas con otros modelos de la misma categoría, por lo que no se aportan cifras de terceros.

## Limitaciones y advertencias

- Modelo en estado *preview* (release candidate, ronda 1b): los pesos y las cifras pueden cambiar antes del lanzamiento estable.
- Las métricas están marcadas como preliminares y pendientes de remedición con el protocolo definitivo; no deben tratarse como resultados consolidados.
- Entrenado y declarado únicamente para inglés; el rendimiento en castellano no está evaluado.
- Dependencia fuerte del formato de recuperación: sin terrabeam o sin pasajes en el layout de entrenamiento, el rendimiento cae drásticamente (SimpleQA del 59,3 % al 2,8 % en modo cerrado).
- Riesgo de alucinación en modo cerrado y en preguntas fuera de la cobertura de los pasajes recuperados.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar `modeling_bailing_moe_v3.py` antes de usarlo en producción.
- En MMLU-Pro, el 10 % de las respuestas con *thinking* alcanzaron el tope de 30.000 tokens, lo que puede inflar coste y latencia.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre el modelo ni sobre la biblioteca *engram* asociada.
- Cero descargas y cero *likes* en el momento de la consulta: sin validación independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-Preview
- Variante GGUF: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF-Preview
- Variante FP8: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-FP8-Preview
- Variante MLX: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-MLX-Preview
- Variante MLX 8-bit: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-MLX-8bit-Preview
- Notas de modelo y evaluación: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF-Preview/blob/main/stats/README.md
- Resultados de benchmarks preliminares: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF-Preview/blob/main/stats/benchmarks_preliminary_1104.json
- Repositorio terrabeam: https://github.com/chadstthomas-svg/terrabeam
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-tiny
