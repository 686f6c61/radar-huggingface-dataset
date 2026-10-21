# ziyan98/E2K-cd82-Qwen3.8-27B-sft_first_idd-cc-iter5-frozen-adam

## Resumen

E2K-cd82-Qwen3.8-27B-sft_first_idd-cc-iter5-frozen-adam es un checkpoint de investigación publicado por el usuario ziyan98 sobre el modelo base Qwen/Qwen3.8-27B. Cuenta con 27.781.427.952 parámetros (unos 27,78 mil millones) en precisión bf16, con un repositorio de 55,6 GB, licencia Apache 2.0 y pipeline declarado `image-text-to-text`. No es una mejora de propósito general del modelo base: es la iteración 5 del brazo IDD del experimento E2K (experience-to-knowledge), que estudia si el conocimiento verificado que un modelo extrae de su propia partida se puede escribir en sus pesos mediante filas supervisadas y, después, mejorar con aprendizaje por refuerzo sobre episodios reales de varios pasos.

Todo el entrenamiento se hizo sobre un único juego de ARC-AGI-3, el `cd82-fb555c5d`, y se evaluó con rollouts de 32 episodios de ese mismo juego. El checkpoint procede del primer intento del run `sft_first_idd-cc` (16-17 de septiembre de 2026), en el que los momentos de Adam acumulados durante el calentamiento SFT se arrastraron al RL sin reiniciar, lo que mantuvo el paso de RL cerca de cero (movimiento de política unas cinco veces por debajo de la línea base). De ahí el sufijo `frozen-adam`: se conserva porque representa una trayectoria distinta partiendo del mismo estado inicial SFT-only.

La relevancia es metodológica, no de producto: el autor documenta explícitamente que ningún brazo supera más de 2 de 32 episodios y que las diferencias entre brazos son de unas pocas décimas de retorno con forma, con un ruido entre rollouts de aproximadamente 0,05. Es material para replicar experimentos de internalización de conocimiento y de RL multi-paso, no para despliegues en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | transformer multimodal (tag de arquitectura `qwen3_5`) con torre visual `model.visual.*` y cabeza de predicción multi-token `mtp.*`; solo la pila de texto fue entrenada |
| Parámetros totales | 27.781.427.952 (≈27,78 mil millones) |
| Parámetros activos | no disponible (la información no indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16 safetensors únicamente; no se publican GGUF, AWQ, GPTQ ni otras variantes |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), 1199 tensores; 851 tensores en la pila de texto entrenada (`model.language_model.*`, `lm_head`) |
| Modelo base | Qwen/Qwen3.8-27B |
| Tamaño del repositorio | 55,6 GB |
| Pipeline declarado | image-text-to-text |
| Descargas / likes | 11 / 0 |
| Fecha de creación | 2026-10-21 |

## Arquitectura y entrenamiento

El checkpoint mantiene el mismo conjunto de tensores y las mismas formas que Qwen/Qwen3.8-27B (1199 tensores). La pila de texto (`model.language_model.*` y `lm_head`, 851 tensores) es el estado entrenado en Megatron, con comprobación de forma y dtype tensor a tensor; la torre visual `model.visual.*` y la cabeza de predicción multi-token `mtp.*` nunca formaron parte del modelo Megatron y se copiaron del checkpoint base sin cambios, verificadas como bit-idénticas. El entrenamiento fue exclusivamente de texto: el actor nunca vio una imagen. La configuración, el tokenizador, la plantilla de chat, la configuración de generación y los procesadores son los del modelo base (listados en `E2K_CONVERSION.json`).

El entrenamiento usó slime v0.3.2 con Megatron-LM en TP4 × PP4 y 16 motores de rollout SGLang con tp=1, sobre 4 nodos GH200 de Isambard-AI, en bf16 con backend flash-attn 2.8.3. El algoritmo es Dr.GRPO (`--advantage-estimator grpo --disable-grpo-std-normalization --calculate-per-token-loss`, con `--normalize-advantages` en su valor por defecto, desactivado), una muestra de entrenamiento por llamada al LLM, batch global de 4 episodios (unas 200 muestras por paso de optimizador), 8 pasos de optimizador por cada rollout de 32 episodios y lr de 5e-6. El plan fue: rollouts 0-1 solo SFT, reinicio de Adam en la frontera SFT→RL y rollouts 2-8 de Dr.GRPO, uno por iteración. Las 303 filas SFT del arnés IDD (`rows_paired.jsonl.gz`) emparejan turnos de recitación —escritos por el mismo modelo con el bloque de conocimiento en contexto, a partir de las frases `recall_forms_v2` del conjunto de 391 afirmaciones— con filas de replay.

El bucle de juego lo conducía Claude Code CLI 2.1.270 manejando las herramientas MCP `look`/`act`/`status` de `knowledge_learning.loop.arc_mcp`, con semilla de motor 0. Cada episodio de entrenamiento empieza en el nivel 1 y continúa al siguiente al superarlo, hasta cuatro niveles, con 40 decisiones por episodio; la recompensa combina niveles superados y un retorno con forma. Los niveles de test 5-6 nunca se jugaron.

## Capacidades

- Generación de texto y razonamiento de la pila de lenguaje del modelo base, sin evaluación publicada específica para este checkpoint.
- Entrada imagen-texto declarada en el pipeline, heredada del modelo base; la torre visual no recibió entrenamiento y su calidad no se ha validado en esta publicación.
- Cadenas de razonamiento largas: mediana de tokens de pensamiento entre 5156 y 6887,5 por rollout según el registro del job.
- Comportamiento agéntico multi-paso en un entorno de juego: 40 decisiones por episodio, hasta cuatro niveles, con observación y acción a través de herramientas MCP.
- Referencia a fuentes en contexto: proporción de turnos con referencia a fuente entre 0,272 y 0,436 según rollout.
- Recitación del bloque de conocimiento: 0,000 turnos recitados en todos los rollouts registrados, pese a que el arnés SFT estaba construido sobre turnos de recitación.
- Soporte de tool calling: no se documenta function calling nativo; la interacción con herramientas se realizó mediante las herramientas MCP del arnés.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio específicos: no documentados más allá de la herencia del modelo base.

## Casos de uso

- Replicación del experimento E2K: reproducir la internalización de conocimiento a partir de las 303 filas SFT y del currículo de rollouts descrito, usando `megatron/args.json` y `common.pt` para reconstruir el estado con `convert_hf_to_torch_dist.py`.
- Estudio del efecto del reinicio de momentos de Adam: este checkpoint, con el sufijo `frozen-adam`, sirve como trayectoria de control frente a las iteraciones relanzadas sin ese sufijo, que parten del mismo estado SFT-only.
- Ablación de recitación frente a internalización: dado que la tasa de recitación es 0,000 en todos los rollouts, el checkpoint permite analizar si el conocimiento se escribió en los pesos sin manifestarse como recitación explícita en contexto.
- Evaluación de agentes en ARC-AGI-3: usar el checkpoint como política en el bucle `look`/`act`/`status` con semilla 0, 40 decisiones por episodio y niveles 1-4, comparando tasas de superación y retorno con forma.
- Validación de infraestructura de RL: el run documenta slime v0.3.2, TP4 × PP4, 16 motores SGLang y Dr.GRPO sobre GH200, por lo que el checkpoint sirve para verificar pipelines equivalentes antes de escalar.
- Docencia y divulgación sobre RL multi-paso: el par de trayectorias (Adam congelado frente a reiniciado) es un ejemplo concreto de cómo un error de estado del optimizador deja el paso de RL cerca de cero.
- Análisis de dinámica de entrenamiento: la tabla por rollout (tasa de superación, retorno con forma, cambio de paso, no-op, tokens de pensamiento) permite estudiar estabilidad y ruido con un tamaño de muestra de 32 episodios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni similares) en la información disponible. Los únicos datos cuantitativos son las métricas de juego del run, una por rollout:

| Job | Rollouts | Tasa de superación | Retorno con forma (rango) | Cambio de paso | No-op | Tokens de pensamiento p50 |
|---|---|---:|---|---:|---:|---:|
| 6647952 (relanzamiento) | 2-8 | 0,000-0,031 | 0,011 a 0,252 | 0,041-0,093 | 0,272-0,349 | 5156,0-5814,0 |
| 6624050 (primer intento) | 3-6 | 0,000-0,031 | -0,203 a -0,094 | 0,033-0,054 | 0,317-0,343 | 5156,0-6887,5 |
| 6619232 (primer intento) | 2-3 | 0,000 | -0,148 a -0,062 | 0,056-0,090 | 0,322-0,347 | 5563,5-5668,0 |

Contexto de lectura: el primer rollout de RL tras un bloque SFT-only lo juega la política SFT-only, por lo que mide el efecto de las filas por sí solas. El ruido entre rollouts de un mismo brazo es de aproximadamente 0,05 de retorno con forma, y ningún brazo supera más de 2 de 32 episodios.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 55,6 GB solo de pesos, más caché KV y activaciones; requiere GPU de 80 GB o particionado tensorial.
- GPU recomendadas: A100 80 GB, H100 80 GB o GH200 (la configuración de entrenamiento usó 4 nodos GH200 de Isambard-AI con TP4 × PP4 y 16 motores SGLang a tp=1).
- GPU de consumo: no cabe en bf16 en una RTX 4090 de 24 GB; requeriría cuantización a 8 o 4 bits (estimación de 14-16 GB en 4 bits) que el autor no publica, por lo que habría que generarla.
- Opciones de despliegue: SGLang (usado en el entrenamiento), vLLM y TGI para safetensors bf16; llama.cpp u Ollama solo tras convertir los pesos a GGUF, conversión no disponible en el repositorio.
- Latencia y throughput: no disponibles.
- Estado de entrenamiento reconstruible: `megatron/args.json`, `common.pt`, `latest_checkpointed_iteration.txt` y el cursor de datos `global_dataset_state_dict_<N>.pt`, sin los momentos del optimizador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Notas |
|---|---|---|---|---|---|
| E2K-cd82-...-iter5-frozen-adam (este) | 27,78 mil millones | no disponible | SFT IDD + Dr.GRPO con Adam congelado, 1 juego ARC-AGI-3 | Apache 2.0 | Tasa de superación máxima 0,031; recitación 0,000 |
| Iteraciones relanzadas del mismo run (sin sufijo `-frozen-adam`) | 27,78 mil millones | no disponible | Mismo run con reinicio de Adam | Apache 2.0 | Movimiento de política superior al de este checkpoint; métricas concretas no disponibles en la información |
| Brazo act-ctrl del mismo estudio | no disponible | no disponible | Variante de control de acciones | no disponible | Solo se menciona su existencia; resultados no disponibles |
| Qwen/Qwen3.8-27B (base) | no disponible en la información | no disponible | Entrenamiento original del autor de Qwen | no disponible en la información | Referencia de partida; sin evaluación comparativa publicada aquí |

## Limitaciones y advertencias

- No es una mejora de propósito general: se entrenó en un único juego (`cd82-fb555c5d`) y se evaluó en rollouts de ese mismo juego.
- Rendimiento muy bajo en la tarea objetivo: la tasa de superación máxima registrada es 0,031 (1 de 32 episodios) y ningún brazo supera más de 2 de 32.
- Las diferencias entre brazos son de unas pocas décimas de retorno con forma, dentro de un ruido entre rollouts de aproximadamente 0,05; no se pueden extraer conclusiones fuertes de superioridad.
- Los momentos de Adam congelados mantuvieron el paso de RL cerca de cero (movimiento de política unas cinco veces por debajo de la línea base), por lo que este checkpoint apenas refleja aprendizaje por refuerzo.
- La recitación del conocimiento es nula (0,000 turnos) en todos los rollouts registrados, lo que cuestiona el objetivo de internalización explícita del experimento.
- El entrenamiento fue solo de texto: la torre visual y la cabeza MTP son copias del modelo base y no se han validado en esta publicación.
- Riesgo de alucinación y sesgos: no evaluados en esta publicación; se heredan los del modelo base, sobre el que la información proporcionada no aporta detalles.
- Longitud de contexto e idiomas soportados no documentados: no se deben asumir valores del modelo base sin verificarlos.
- Licencia Apache 2.0 permite uso comercial, pero el autor posiciona el checkpoint como material de investigación; no hay garantías de calidad para producción.
- Dependencia del arnés: el comportamiento agéntico está ligado a las herramientas MCP `look`/`act`/`status` y a Claude Code CLI 2.1.270; fuera de ese entorno no hay evaluación.
- No hay benchmarks estándar publicados, por lo que no se puede comparar con alternativas en tareas de texto, código o matemáticas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ziyan98/E2K-cd82-Qwen3.8-27B-sft_first_idd-cc-iter5-frozen-adam
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada (la model card remite a artefactos internos del run como `knowledge-set/20260912-0920-final/`, `megatron/args.json` y `E2K_CONVERSION.json`, sin URL pública).
