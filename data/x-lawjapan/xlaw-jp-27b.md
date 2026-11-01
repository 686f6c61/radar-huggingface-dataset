# X-LawJapan/xlaw-jp-27b

## Resumen

XLaw-JP-27B es un modelo abierto especializado en derecho japones, desarrollado por X-LawJapan mediante fine-tuning de Qwen/Qwen3.8-27B (27,8 mil millones de parametros, arquitectura vision-language de la que solo se usa la parte textual). El modelo aborda un problema concreto: la falta de modelos abiertos de tamano manejable que rindan bien en tareas juridicas japonesas, como el examen de acceso a la abogacia (司法試験， seccion de respuesta corta), la revision y redaccion de contratos, y la consulta de leyes y jurisprudencia.

Su relevancia radica en los resultados publicados: entre los modelos abiertos de 12-33B evaluados con los mismos prompts y sistema de recuperacion, es el mejor en global en ocho tareas juridicas japonesas (rango medio 1,3 frente a 2,8-3,1 de los competidores) y el unico que supera el punto de corte de la seccion multiple-choice del examen de la abogacia en las convocatorias de 2024, 2025 y 2026. El entrenamiento se realizo con QLoRA sobre un conjunto minimo pero verificado de 150 respuestas propias correctas a preguntas de examen (2019-2023) y 91 revisiones de contratos, mas un adaptador LoRA opcional (rank 32) para revision y redaccion de contratos.

Esta pensado para usarse junto a un sistema de recuperacion de estatutos y jurisprudencia, y con votacion mayoritaria sobre cuatro muestras en preguntas de examen. Se despliega en una sola GPU de 48 GB en FP8 mediante vLLM y existe una demo web gratuita, X-Law Agent Beta, que sirve el modelo con el stack completo de recuperacion y votacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (layout del modelo base Qwen3.8-27B); torre de vision intacta y sin evaluar, servir como modelo de texto |
| Parametros totales | 27.781.427.952 (aprox. 27,8B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 para servir (recomendado); pesos publicados en bf16 |
| Idiomas soportados | Japones (especializado); fugas ocasionales de chino en respuestas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16 fusionados); adaptador LoRA rank 32 opcional |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Qwen/Qwen3.8-27B mediante QLoRA. El checkpoint publicado contiene los pesos fusionados en bf16 de la version de release (E8), entrenada con 150 respuestas generadas por el propio modelo base a preguntas de la seccion de respuesta corta del examen de la abogacia de 2019-2023 (fuente: Ministerio de Justicia), conservadas solo cuando la respuesta final coincidia con la clave oficial; los prompts incluian el texto de la pregunta y los estatutos y resumenes de jurisprudencia recuperados. Se anadieron 91 revisiones de clausulas de la mitad de entrenamiento del modelo de contrato OI de la Oficina de Patentes de Japon (特許庁)， usando el comentario oficial como referencia privada.

Adicionalmente, el repositorio incluye un adaptador LoRA (rank 32, version E17c) entrenado con 557 revisiones de clausulas de contratos modelo gubernamentales (ministerios de Agricultura, Economia, Transporte y el propio OI) en las que se plantaron problemas unilaterales conocidos, siguiendo una taxonomia documentada en el repositorio de codigo. Este adaptador es solo para revision y redaccion de contratos, no para preguntas de examen. No se usaron datos de examenes de 2024 o 2026, ni datos de COLIEE ni de JBE-QA para el entrenamiento. Las fuentes gubernamentales se emplean bajo la licencia 公共データ利用規約 1.0 (PDL 1.0). El release congelado incluye MANIFEST.json, hashes SHA256 de todos los ficheros y configuraciones de entrenamiento, lo que facilita la reproducibilidad.

## Capacidades

- Generacion de texto conversacional especializada en derecho japones: consulta legal, analisis de estatutos y jurisprudencia.
- Resolucion de preguntas multiple-choice de examenes juridicos (司法試験 短答式， 弁理士 短答)， con votacion mayoritaria sobre cuatro muestras (vote@4).
- Revision y redaccion de contratos mediante el adaptador LoRA opcional (`contract-adapter`), con deteccion de clausulas unilaterales plantadas.
- Pensado para operar con recuperacion (RAG) de estatutos y resumenes de casos; sin contexto recuperado pierde 20-33 puntos por pasada de examen.
- Soporte de thinking mode heredado del base (se recomienda desactivarlo: `enable_thinking=False` para los casos de uso evaluados).
- Entrada image-text-to-text teoricamente posible por el layout del base, pero la torre de vision no fue evaluada y no debe considerarse una capacidad soportada.
- No consta soporte documentado de tool calling ni de flujos agenticos multi-paso, aunque el stack oficial incluye un gateway de recuperacion y votacion.

## Casos de uso

- Preparacion del examen de acceso a la abogacia en Japon: el modelo responde preguntas multiple-choice de convocatorias pasadas con recuperacion de estatutos y votacion sobre cuatro muestras, superando el punto de corte en 2024, 2025 y 2026 (120-130 puntos de 175).
- Asistencia juridica de primera linea: a traves de la demo X-Law Agent Beta ofrece preguntas y respuestas legales, util como primer filtro antes de derivar a un profesional.
- Revision de contratos: con el adaptador de contratos, analiza clausulas de contratos modelo gubernamentales y detecta clausulas unilaterales (recall de checklist 0,240, el mejor de los abiertos evaluados).
- Redaccion de contratos: genera borradores de contratos basados en plantillas publicas (puntuacion de fila 0,829 en OI-Contract Draft), adecuado para despachos que trabajen con contratos modelo japoneses.
- Investigacion juridica asistida: combinado con un buscador de estatutos y jurisprudencia (e-Gov), permite localizar articulos relevantes y redactar analisis sobre ellos.
- Evaluacion y comparacion de modelos juridicos: XLaw-Bench y su leaderboard publico permiten a equipos de investigacion medir sus propios modelos en tareas juridicas japonesas con prompts y recuperacion identicos.
- Despliegue en infraestructura propia para despachos o departamentos legales con requisitos de privacidad: cabe en una sola GPU de 48 GB en FP8 con vLLM, sin depender de APIs cerradas.

## Benchmarks y rendimiento

Resultados del paper, con los mismos prompts y sistema de recuperacion para todos los modelos; los baselines se ejecutaron una vez. Los resultados de este modelo usan vote@4 salvo donde se indica.

| Benchmark | XLaw-JP-27B | Gemma 4 12B | LLM-jp-4.1 33B (thinking) | Qwen3-Swallow 32B (thinking) |
|---|---|---|---|---|
| 司法試験 短答式 2026, puntos /175 (aprobado: 99) | **130** (vote@4) | 101 | 92 | 82 |
| 司法試験 短答式 2024, puntos /175 (aprobado: 93) | **129** (vote@4) | 90 | 100 | 96 |
| 司法試験 短答式 2025, puntos /175 (aprobado: 81) | **120** (vote@4) | 87 | 88 | 85 (suspenso) |
| Benrishi-MC (弁理士 短答 2024-25), exactitud | **0,517** (vote@4) | 0,350 | 0,383 | 0,383 |
| LawQA-JP, exactitud | 0,821 (vote@4) | 0,821 | 0,793 | 0,800 |
| JBE-QA (muestra de 200 items), MCC | 0,537 | 0,534 | 0,600 | **0,660** |
| OI-Contract Review, recall de checklist (con adaptador) | 0,240 | 0,228 | 0,169 | 0,173 |
| OI-Contract Draft, puntuacion de fila (con adaptador) | **0,829** | 0,794 | 0,759 | 0,692 |

Referencia de contexto: en pasadas individuales sin votacion, el modelo promedia 115,8 (2026) y 115,0 (2024). Claude Opus 5.5, sin recuperacion (closed-book), alcanza 171 y 173 puntos; en revision de contratos llega a 0,475 de recall, aproximadamente el doble que este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: una GPU de 48 GB en FP8 (configuracion oficial); en bf16 los pesos ocupan unos 56,5 GB, por lo que se necesitarian ~2 GPU de 48 GB o 4 de 24 GB con tensor parallelism.
- GPU recomendadas: A6000/L40S/A100 de 48 GB para FP8; A100/H100 80 GB para bf16.
- No cabe en GPUs consumer de 24 GB (RTX 3090/4090) en FP8 segun la configuracion oficial; no hay cuantizaciones GGUF ni AWQ publicadas en el repositorio.
- Despliegue: vLLM con `--language-model-only` (script oficial `serve/start_vllm.sh`, servidor compatible con la API de OpenAI) mas un gateway FastAPI (`serve.gateway`) que orquesta recuperacion, adaptador de contratos y votacion. No se mencionan soporte oficial de llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. Cada respuesta de examen genera hasta 8.192 tokens nuevos, lo que implica respuestas largas por muestra; la configuracion de votacion multiplica por cuatro el coste de decodificacion.

## Comparativa con modelos similares

| Modelo | Parametros | Especializacion | 司法試験 2026 (/175) | Licencia |
|---|---|---|---|---|
| XLaw-JP-27B | 27,8B | Derecho japones | 130 (vote@4) | Apache 2.0 |
| Gemma 4 12B | 12B (no disponible detalle) | General | 101 | no disponible |
| LLM-jp-4.1 33B (thinking) | 33B | Japones, general | 92 | no disponible |
| Qwen3-Swallow 32B (thinking) | 32B | Japones, general | 82 | no disponible |

XLaw-JP-27B es el unico de los cuatro que supera el punto de corte del examen en las tres convocatorias evaluadas, aunque queda por detras de Qwen3-Swallow 32B en JBE-QA (MCC 0,537 frente a 0,660) y muy por detras de Claude Opus 5.5 en examen (171-173) y revision de contratos (0,475).

## Limitaciones y advertencias

- No constituye asesoramiento juridico; toda salida debe ser revisada por un profesional cualificado.
- Incluso con el articulo correcto en contexto, el modelo juzga mal aproximadamente una de cada cinco afirmaciones; puede citar numeros de sentencia inexistentes (alucinacion de referencias).
- Fugas ocasionales de frases en chino en las respuestas en japones.
- Areas debiles documentadas: derecho constitucional (≈49% de los puntos), derecho de patentes (12/40 en Benrishi-MC de patentes) y riesgos especificos de estatutos en revision de contratos (detecta aproximadamente la mitad de lo que encuentra Claude Opus 5.5).
- El rendimiento depende criticamente del contexto recuperado: sin recuperacion pierde 20-33 puntos por pasada de examen.
- La decodificacion greedy produce bucles en respuestas largas; hay que usar la configuracion recomendada (temperature 0,7, top-p 0,8, top-k 20, presence penalty 1,5).
- No se puede excluir contaminacion del modelo base respecto al examen de 2026, celebrado antes del release del base.
- El adaptador de contratos no debe usarse para preguntas de examen, y viceversa.
- La torre de vision no fue evaluada; no tratar el modelo como multimodal en produccion.
- Licencia Apache 2.0 sin restricciones comerciales, aunque los datos de entrenamiento derivados de fuentes gubernamentales japonesas estan bajo PDL 1.0 (requiere citar la fuente en productos derivados de esos datos).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/X-LawJapan/xlaw-jp-27b
- Paper (arXiv): https://arxiv.org/abs/2610.39227
- Dataset de evaluacion XLaw-Bench: https://huggingface.co/datasets/X-LawJapan/xlaw-bench
- Leaderboard de XLaw-Bench: https://huggingface.co/spaces/X-LawJapan/xlaw-bench-leaderboard
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Demo web X-Law Agent Beta: https://x-law.jp/
