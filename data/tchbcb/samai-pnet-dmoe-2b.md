# tchbcb/samai-pnet-dmoe-2b

## Resumen

SamAI-PonderNet-DMoE-2B (r12) es un modelo de lenguaje de 2.542.067.777 parámetros publicado por el usuario `tchbcb` en HuggingFace, construido sobre la arquitectura MiniCPM-5 2B (42 capas, hidden 2048, GQA 16+2, vocabulario de 130.560 tokens). Su particularidad es que sustituye las ocho últimas capas (L34-L41) por un bloque DMoE de 8 expertos con router top-2 y añade un mecanismo Ponder de cómputo adaptativo (N=8, umbral τ=0.125), de modo que el modelo decide cuántos pasos de "pensamiento" ejecutar antes de responder; el promedio observado es de ~2,1 pasos. Incorpora además Multi-Token Prediction (MTP) con profundidad 2 como objetivo auxiliar de entrenamiento.

El modelo es un experimento de investigación más que un producto: la r12 es el resultado de una cadena de continuación de entrenamiento (r5b → r11 → r12) con LoRA r16/α32 sobre 5.109 filas durante 2 épocas, orientada explícitamente a corregir dos problemas críticos de las versiones anteriores, el fallo de parada en conversación trivial (*chitchat*) y el comportamiento fuera de distribución en inglés. La model card publica datos de aceptación internos que muestran mejoras sustanciales: la tasa de parada ante "你好" baja de 0,68 a 0,20, la tasa de repetición de 3-gramas en chat cae de 0,209 a 0,083 y la *cross-entropy* congelada mejora en las tres dificultades.

Es relevante ahora como banco de pruebas reproducible de dos ideas arquitectónicas poco frecuentes en modelos de este tamaño (Ponder y DMoE parcial), y como ejemplo de protocolo de inferencia estricto: requiere `trust_remote_code=True`, código de modelado propio y unos parámetros de muestreo fijos (`temperature=1.0`, `top_p=0.95`, `repetition_penalty=1.0`), ya que el decodificado greedy degrada gravemente la calidad según el autor. No se ha publicado licencia, idiomas oficiales ni resultados de benchmarks estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base MiniCPM-5 2B) con DMoE en las capas L34-L41 (8 expertos, router top-2) y mecanismo Ponder de cómputo adaptativo |
| Parámetros totales | 2.542.067.777 (2,54 B) |
| Parámetros activos | ~1,74 B (estimación del autor para el bloque MoE con router top-2) |
| Longitud de contexto | no disponible (no especificada en la model card) |
| Tipos de cuantización | no disponible (el repositorio solo publica pesos bf16; no se documentan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible como declaración oficial; los datos de entrenamiento mezclan chino e inglés (`zh_cot`, `alpaca` en chino e inglés), sin datos en castellano |
| Licencia | no disponible |
| Formato de pesos | safetensors (bf16, archivo único de 5,08 GB) + código remoto `modeling_samai_pnet.py` (`auto_map`: SamaiPnetConfig / SamaiPnetForCausalLM) |
| Capas / dimensión oculta | 42 capas / hidden 2048 |
| Atención | GQA con 16 cabezas de consulta y 2 de clave/valor |
| Vocabulario | 130.560 tokens |
| Tokens especiales | EOS = `[1, 130073]` (`<|im_end|>`) |
| Ponder | N=8 pasos, τ=0,125; media observada de ~2,1 pasos de pensamiento |
| MTP | Profundidad 2 (objetivo auxiliar de entrenamiento) |
| Muestreo recomendado | `do_sample=True`, `temperature=1.0`, `top_p=0.95`, `repetition_penalty=1.0` (greedy desaconsejado) |
| Tamaño del repositorio | 10,2 GB |
| Descargas / likes | 34 / 0 |

## Arquitectura y entrenamiento

La base es MiniCPM-5 2B, un transformer decoder-only de 42 capas con atención GQA (16 cabezas de consulta, 2 de clave/valor) y vocabulario de 130.560 tokens. La modificación propia del autor afecta a las ocho últimas capas: cada una se sustituye por un bloque DMoE con 8 expertos de dimensión intermedia 768 y enrutado top-2 cuyos resultados se fusionan, lo que da aproximadamente 1,74 B de parámetros activos de los 2,54 B totales. Sobre esa pila se añade el mecanismo Ponder, que permite al modelo emitir pasos de pensamiento adicionales antes de la respuesta final, con un presupuesto máximo N=8 y umbral de parada τ=0,125; en la práctica el modelo consume ~2,1 pasos de media. El MTP de profundidad 2 se usa únicamente como señal auxiliar durante el entrenamiento, según indica la model card.

El entrenamiento es una continuación por adaptadores de bajo rango, no un preentrenamiento: la cadena r5b (anclaje por cross-entropy) → r11 (mezcla de datos de agente y chat v2) → r12. La receta final de r12 combina `chat_synth_v3` (54 % de la mezcla), 1.049 ejemplos `zh_cot` como protección contra olvido, datos tipo Alpaca en chino e inglés y datos de agente; en total 5.109 filas durante 2 épocas, con LoRA de rango 16 y α=32, peso de cross-entropy por paso de 0,5 y un prior de dificultad de muestreo de 0,7/0,4/0,15 para fácil/medio/difícil. La fusión se realiza con `load_trainables` seguido de `PeftModel.merge_and_unload`, con dos aserciones de integridad: delta mayor que cero en `q_proj` de la capa L36 y EOS fijado a `[1, 130073]` en `generation_config`.

## Capacidades

- Generación de texto conversacional multirrol en modo chat, con plantilla de chat byte a byte idéntica a la oficial de MiniCPM-5.
- Modo de razonamiento explícito: el modelo emite un bloque `<think>...</think>` antes de la respuesta cuando se usa el protocolo estándar.
- Modo `think_off`: pre-rellenando `<think>\n\n</think>\n\n` en el turno del asistente se omite el razonamiento y se responde directamente, con mayor tasa de parada (86-90 %) y menor latencia.
- Parada fiable en interacciones triviales tras el ajuste de r12: el autor reporta 100 % en saludo, autopresentación y despedida, y 90 % de parada en la primera respuesta sobre `chat50`.
- Capacidad de agente y razonamiento en varios pasos: limitada y no documentada en detalle; el autor incluye datos de agente en la mezcla de entrenamiento, pero no publica métricas de *tool calling*.
- Soporte de *tool calling* / *function calling*: no disponible (no se documenta ni se aporta plantilla de herramientas).
- Capacidades multilingües: los datos de entrenamiento son chino-inglés; no hay evidencia de calidad en castellano ni en otros idiomas.
- Capacidades visión o audio: no disponible (no se documentan).
- Ejecución de tareas de terminal y shell en un grado limitado: en el conjunto interno TB2 de 24 tareas obtiene 10 aciertos, con 75 % de acierto en el nivel fácil y solo 11 % en el nivel medio.
- Decodificación con MTP: la profundidad 2 existe como objetivo de entrenamiento; la model card no documenta una ruta de decodificación especulativa en inferencia.

## Casos de uso

- Investigación en cómputo adaptativo: el modelo permite experimentar con el mecanismo Ponder (presupuestos N y umbrales τ) y medir la relación entre pasos de pensamiento, latencia y calidad, algo poco habitual en modelos de 2 B abiertos.
- Estudio de arquitecturas MoE parciales: al concentrar los 8 expertos en las 8 últimas capas, sirve para analizar enrutado, carga por experto y efectos de sustituir capas densas en modelos pequeños.
- Asistente conversacional ligero en chino o inglés para prototipos: con el modo `think_off` alcanza 86-90 % de parada en el primer turno, lo que lo hace utilizable en *chatbots* de demo donde la latencia importa más que la profundidad de razonamiento.
- Base para *fine-tuning* con LoRA en dominios concretos: la receta del autor (LoRA r16/α32 sobre ~5.000 filas) demuestra que el modelo se puede readaptar con recursos modestos, sin necesidad de reentrenar.
- Evaluación de protocolos de inferencia estricta: sirve como caso de estudio de cómo la elección de muestreo (greedy frente a `temperature=1.0`/`top_p=0.95`) cambia drásticamente la tasa de repetición (0,209 frente a 0,083) en modelos pequeños.
- Automatización de tareas sencillas de terminal en un entorno controlado: dado el 75 % de acierto en el nivel fácil de TB2, es viable como ayudante de comandos simples siempre que un humano revise la salida; no es apto para ejecución autónoma en producción.
- Pruebas locales en GPU de consumidor: al ocupar 5,08 GB en bf16, permite montar un banco de pruebas de razonamiento e inferencia en una única GPU de gama media.
- Generación de datos sintéticos de conversación en chino: el autor usó precisamente `chat_synth_v3` en el entrenamiento, por lo que el modelo puede emplearse para generar diálogos de arranque que luego se filtren y revisen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, GSM8K, HumanEval) en la información disponible. La model card únicamente aporta datos de aceptación internos comparando r11 y r12, con la *cross-entropy* congelada y el conjunto propietario de chat (chat50) y TB2:

| Métrica (interna, r11 → r12) | r11 | r12 |
|---|---|---|
| Parada ante "你好" (top_f) | 0,68 (fallo) | 0,20 (correcto) |
| chat50, parada en la primera respuesta (bare) | 70 % | 90 % |
| chat50, parada en la primera respuesta (think_off) | no disponible | 86 % |
| Parada en saludo / autopresentación / despedida | 60 / 90 / 100 % | 100 / 100 / 100 % |
| EN OOD (12x8), parada limpia | sí (rep3 = 0) | sí (rep3 = 0,0) |
| Tasa de repetición de 3-gramas en chat | 0,209 (fallo) | 0,083 (correcto) |
| Cross-entropy congelada, Δ fácil / medio / difícil | -0,09 / +0,05 / -0,02 | -0,43 / -0,18 / -0,36 |
| TB2 (24 tareas) | 9/24 | 10/24 (75 % en nivel fácil) |

Puntos débiles declarados por el propio autor: el nivel medio de TB2 (tareas de `sed`, Python en una línea, sintaxis de `find`) se queda en 11 %, y las tasas de parada en las categorías *daily*, *boundary* y *simple* están en el 80 %, con trabajo de refinado previsto para una r13.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan 5,08 GB; con caché KV y activaciones conviene reservar entre 7 y 9 GB para contextos cortos o medios. No se dispone de cifras de VRAM para cuantizaciones menores porque no hay pesos cuantizados publicados.
- GPU recomendadas: cualquier GPU con 12 GB o más. Cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4070 Ti, RTX 4080, RTX 4090, L4, A10G, A100 y H100. En GPUs de 8 GB solo sería viable tras cuantización propia, que el autor no distribuye.
- ¿Cabe en GPU de consumidor? Sí, en bf16 en tarjetas de 12 GB o más.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y `torch_dtype="bfloat16"`, `device_map="auto"`; el repositorio incluye `inference.py` y `serve_contract.json` como referencia de servicio. Compatibilidad con vLLM, TGI, llama.cpp u Ollama: no disponible; al tratarse de una arquitectura personalizada (`SamaiPnetForCausalLM`), requeriría portar el código de modelado antes de poder usarse en esos motores.
- Latencia y throughput estimados: no disponible (no se publican mediciones).

## Comparativa con modelos similares

No se dispone de resultados de benchmarks públicos que permitan comparar este modelo con alternativas de su categoría. La siguiente tabla recoge únicamente los datos confirmados para este modelo y para su base arquitectónica citada en la model card; el resto de campos quedan como no disponibles para no introducir cifras no verificadas:

| Modelo | Parámetros | Contexto | MoE | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SamAI-PonderNet-DMoE-2B (r12) | 2,54 B totales / ~1,74 B activos | no disponible | sí, en L34-L41 (8 expertos, top-2) | no disponible | HuggingFace (34 descargas, 0 likes) |
| MiniCPM-5 2B (base citada) | ~2 B | no disponible | no | no disponible | no verificado en esta búsqueda |
| Alternativas de ~1,5-3 B (Qwen, SmolLM, Gemma, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible |

Cualquier comparación de rendimiento con modelos de tamaño similar (por ejemplo, familias de 1,5-3 B de uso común) exigiría ejecutar evaluaciones homogéneas, ya que no existe material público comparable para esta revisión r12.

## Limitaciones y advertencias

- Licencia no especificada: sin licencia publicada no hay autorización explícita de uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- Requiere `trust_remote_code=True`: el modelo carga código Python propio (`modeling_samai_pnet.py`) con `auto_map` personalizado, lo que implica ejecutar código de un tercero con los riesgos de seguridad asociados.
- No es un modelo de propósito general: es una revisión r12 de una cadena de experimentos con LoRA sobre ~5.109 filas; el conocimiento factual y las capacidades razonadas no han sido evaluados con benchmarks estándar.
- Riesgo de alucinación alto y no medido: no se publica ninguna evaluación de veracidad, y el tamaño y la naturaleza del ajuste no permiten asumir fiabilidad factual.
- Riesgo de repetición y de no detenerse: aunque r12 mejora, el propio autor reporta un 20 % de fallo de parada ante "你好" en la métrica top_f y tasas de parada del 80 % en las categorías *daily*, *boundary* y *simple*. El decodificado greedy agrava el problema y debe evitarse.
- Dependencia estricta de los parámetros de muestreo: usar valores distintos de `temperature=1.0`, `top_p=0.95` y `repetition_penalty=1.0` degrada el comportamiento de forma notable según el autor.
- Limitaciones de idioma: los datos de entrenamiento son chino-inglés; no hay garantía de un comportamiento correcto en castellano ni en otras lenguas, y no se declara lista oficial de idiomas.
- Longitud de contexto desconocida: la model card no especifica la ventana, por lo que no se puede planificar su uso en tareas de contexto largo.
- Rendimiento bajo en tareas medias de terminal: 11 % en el nivel medio de TB2; no es adecuado para automatización autónoma de shell o refactorización de código.
- Sin soporte documentado de *tool calling* ni de agentes con herramientas: aunque se incluyeron datos de agente en el entrenamiento, no hay contrato de herramientas ni métricas que lo respalden.
- Ecosistema limitado: sin pesos cuantizados, sin integración confirmada en vLLM, llama.cpp, Ollama o TGI y con solo 34 descargas, la superficie de pruebas de la comunidad es mínima.
- Model card redactada principalmente en chino, con tablas y notas técnicas; algunos términos de evaluación (por ejemplo TB2, `chat50`, `chat_synth_v3`) son conjuntos internos sin definición pública, lo que dificulta reproducir las cifras.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tchbcb/samai-pnet-dmoe-2b
- Repositorio del autor en HuggingFace (resto de publicaciones): https://huggingface.co/tchbcb
- No se han encontrado en la búsqueda web papers, blogs, repositorios de código ni demos adicionales asociados a este modelo; los resultados devueltos no guardan relación con él.
