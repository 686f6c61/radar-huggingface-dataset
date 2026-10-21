# ziyan98/E2K-cd82-Qwen3.8-27B-act_ctrl-cc-iter6-frozen-adam

## Resumen

E2K-cd82-Qwen3.8-27B-act_ctrl-cc-iter6-frozen-adam es un checkpoint de investigación publicado por el usuario ziyan98 en HuggingFace, obtenido a partir de Qwen/Qwen3.8-27B mediante el experimento de internalización de conocimiento E2K sobre el juego `cd82-fb555c5d` de ARC-AGI-3. No es un ajuste de propósito general: el autor lo describe explícitamente como una rama de control (act-ctrl) de un estudio que investiga si el conocimiento verificado extraído de la propia partida de un modelo puede escribirse en sus pesos mediante filas supervisadas y mejorarse después con RL sobre episodios reales de múltiples pasos.

El checkpoint corresponde a la iteración 6 de Megatron de la primera tentativa del run, en la que los momentos de Adam acumulados durante el calentamiento SFT se arrastraron sin reiniciar al RL, manteniendo el paso de política aproximadamente 5 veces por debajo de la línea base. Se entrenó sobre 303 filas de harness del brazo act-ctrl (turnos propios del modelo base, sin conocimiento), con 2 rollouts solo SFT (iteraciones 0-1) y RL con Dr.GRPO en los rollouts 2-3, detenido por decisión el 2026-09-18.

El interés actual del checkpoint es metodológico, no de rendimiento: documenta de forma exhaustiva la pila de entrenamiento (slime v0.3.2 sobre Megatron-LM, 4 nodos GH200 de Isambard-AI, 16 motores de rollout SGLang), el harness de juego y las métricas por rollout, lo que lo convierte en material reproducible para estudiar estabilidad de RL y protocolos de evaluación en agentes. El propio autor advierte que ningún brazo supera 2 de 32 episodios y que las diferencias entre brazos están dentro del ruido (≈0,05 de retorno con forma).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5/Qwen3.8 (tag `qwen3_5`) con torre de vision y cabeza de prediccion multi-token (MTP); el detalle interno no se especifica en la informacion disponible |
| Parametros totales | 27.781.427.952 (≈27,8 mil millones), dato real de los safetensors |
| Parametros activos | No aplica: no se documenta arquitectura MoE en la informacion disponible |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Qwen/Qwen3.8-27B) |
| Tipos de cuantizacion | Solo se publican pesos bf16; no se distribuyen GGUF, AWQ, GPTQ ni otras variantes cuantizadas |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors bf16, 1199 tensores (851 del stack de texto entrenado; vision y MTP copiados del base); tamano del repo 55,6 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B y conserva su juego de tensores y formas. El stack de texto (`model.language_model.*` y `lm_head`, 851 tensores) es el estado entrenado en Megatron, con cada tensor verificado en forma y dtype; la torre de vision `model.visual.*` y la cabeza de predicción multi-token `mtp.*` nunca formaron parte del modelo Megatron y se copian sin cambios desde el checkpoint base (se comprobó su identidad bit a bit). El entrenamiento fue exclusivamente de texto: el actor nunca vio una imagen. La configuración, el tokenizador, la plantilla de chat, la configuración de generación y la del procesador son las del modelo base, según lista `E2K_CONVERSION.json`.

El entrenamiento se realizó con slime v0.3.2 sobre Megatron-LM (TP4 × PP4, 16 motores de rollout SGLang con tp=1) en 4 nodos GH200 de Isambard-AI, en bf16 y con backend flash-attn 2.8.3. La fase SFT usó 303 filas del harness act-ctrl (`runs/cd82-play-v4/sft/rows_actctrl.jsonl.gz`); la fase RL usó Dr.GRPO (`--advantage-estimator grpo --disable-grpo-std-normalization --calculate-per-token-loss`, con `--normalize-advantages` en su valor por defecto, desactivado), una muestra de entrenamiento por llamada al LLM, batch global de 4 episodios (unos 200 muestras por paso de optimizador), 8 pasos de optimizador por rollout de 32 episodios y learning rate 5e-6. El prompt de RL nunca contiene conocimiento. El harness de juego es Claude Code CLI 2.1.270 manejando las herramientas MCP `look`/`act`/`status` de `knowledge_learning.loop.arc_mcp`, con semilla de motor 0, episodios que arrancan en el nivel 1 y continúan hasta cuatro niveles, 40 decisiones por episodio y recompensa igual a niveles superados más un retorno con forma; los niveles de test 5-6 nunca se juegan. En esta iteración concreta, los momentos de Adam del calentamiento SFT se conservaron sin reiniciar al entrar en RL.

## Capacidades

- Generación de texto y razonamiento multi-paso en el contexto de un agente que interactúa con un entorno mediante herramientas MCP (`look`, `act`, `status`).
- Emisión de trazas de pensamiento extensas: mediana de 3.347 a 4.504 tokens de "think" por rollout en las métricas publicadas.
- Conservación de la interfaz multimodal del modelo base (procesador image-text-to-text, torre de visión intacta), aunque el ajuste en sí fue solo de texto y el actor no vio imágenes.
- Capacidad de referenciar fuentes en sus turnos: entre 0,214 y 0,271 de turnos con referencia a fuente según rollout.
- No se observaron turnos de recitación de conocimiento (columna `recited turns` = 0,000 en todos los rollouts).
- Soporte de tool calling heredado del modelo base a través del formato de chat de Qwen; no se documentan evaluaciones específicas en esta información.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Reproducción del experimento E2K: el repositorio incluye `megatron/args.json`, `common.pt`, `latest_checkpointed_iteration.txt` y el cursor de datos `global_dataset_state_dict_<N>.pt`, de modo que el estado de entrenamiento (salvo los momentos del optimizador) puede reconstruirse con `convert_hf_to_torch_dist.py` de slime y reanudar el run en las mismas condiciones.
- Brazo de control en estudios de internalización de conocimiento: sirve como referencia act-ctrl emparejada frente a los brazos IDD y arm-C, al haber usado las mismas 303 filas de harness sin conocimiento y el mismo esquema de recompensa.
- Estudio de estabilidad de RL: la iteración 6 documenta el caso en que los momentos de Adam del SFT se arrastran al RL y congelan el movimiento de política (~5 veces por debajo de la línea base), un escenario útil para analizar reinicios de estado del optimizador y sus efectos.
- Análisis de agentes sobre ARC-AGI-3: con 40 decisiones por episodio, hasta cuatro niveles y recompensa con forma, el checkpoint permite medir tasas de acierto, cambios de paso y no-ops en un juego concreto (`cd82-fb555c5d`) y comparar contra el modelo base con el mismo harness y semilla 0.
- Investigación sobre verbosidad y coste de inferencia en agentes: las medianas de tokens de pensamiento (3.347-4.504) permiten estudiar la relación entre presupuesto de razonamiento y retorno en políticas entrenadas con Dr.GRPO.
- Auditoría de pipelines de conversión Megatron → HuggingFace: el checkpoint se generó con `convert_to_hf` de slime y `convert_torch_dist_to_hf_lowmem.py` en streaming por chunks, y las comprobaciones de forma, dtype e identidad bit a bit de los tensores copiados lo hacen útil como caso de prueba de la herramienta.
- Docencia y divulgación técnica: al ser un checkpoint pequeño en descargas (14) y con licencia Apache 2.0, sirve para ilustrar el ciclo completo SFT + RL con verificación por entorno sin incurrir en costes de un modelo de mayor escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los únicos datos de evaluación son las métricas de partida por rollout del juego `cd82-fb555c5d` (ARC-AGI-3), extraídas de los logs del job:

| Job | Rollout | Tasa de nivel superado | Retorno con forma | Cambio de paso | No-op de paso | Tokens de pensamiento p50 | Turnos con referencia a fuente |
|---|---:|---:|---:|---:|---:|---:|---:|
| 6619233 | 2 | 0,000 | -0,419 | 0,083 | 0,386 | 4431,000 | 0,237 |
| 6647953 | 2 | 0,000 | -0,516 | 0,064 | 0,411 | 4279,000 | 0,232 |
| 6619233 | 3 | 0,000 | -0,514 | 0,040 | 0,425 | 3347,000 | 0,214 |
| 6647953 | 3 | 0,031 | -0,347 | 0,055 | 0,400 | 4504,000 | 0,227 |
| 6619233 | 4 | 0,000 | -0,348 | 0,057 | 0,394 | 3896,000 | 0,248 |
| 6619233 | 5 | 0,031 | -0,205 | 0,082 | 0,366 | 4162,000 | 0,271 |
| 6630891 | 5 | 0,000 | -0,338 | 0,056 | 0,372 | 4371,000 | 0,271 |
| 6630891 | 6 | 0,000 | -0,253 | 0,052 | 0,360 | 3932,500 | 0,269 |

Contexto aportado por el autor: el ruido entre rollouts de un mismo brazo es de aproximadamente 0,05 de retorno con forma, ningún brazo supera 2 de 32 episodios y las diferencias entre brazos son como máximo de unas pocas décimas. El primer rollout de RL tras un bloque solo SFT lo juega la política solo SFT, por lo que mide el efecto de las filas por sí mismas.

## Requisitos de hardware

- VRAM estimada en bf16: los pesos ocupan unos 55,6 GB, por lo que la inferencia necesita del orden de 60 GB solo para pesos, más caché KV y activaciones; no se dispone de mediciones de memoria pico en la información proporcionada.
- Cuantización a 8 bits: aproximadamente 28 GB de pesos, viable en una GPU de 40-48 GB.
- Cuantización a 4 bits: aproximadamente 15-16 GB de pesos, viable en GPUs de consumo alto; requeriría convertir los pesos, ya que el repositorio solo publica safetensors bf16.
- GPUs recomendadas: para bf16 sin comprimir, A100/H100 de 80 GB en una o varias tarjetas; el entrenamiento original usó 4 nodos GH200 (TP4 × PP4 con 16 motores SGLang a tp=1), lo que da una idea de la escala real del pipeline completo.
- GPU de consumo: una RTX 4090 de 24 GB no admite bf16 completo; sí admitiría una conversión a 4 bits con holgura para contexto moderado.
- Opciones de despliegue: transformers (librería declarada, pipeline image-text-to-text) y SGLang/vLLM, condicionado a que la arquitectura `qwen3_5` esté soportada por la versión utilizada; llama.cpp u Ollama solo tras generar un GGUF propio.
- Latencia y throughput: no disponibles. Como referencia de coste, las trazas publicadas gastan entre 3.347 y 4.504 tokens de pensamiento (mediana) por episodio de 40 decisiones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Este checkpoint (E2K-cd82-Qwen3.8-27B-act_ctrl-cc-iter6-frozen-adam) | 27,8 mil millones | no disponible | Apache 2.0 | Checkpoint de investigación, iteración 6, Adam congelado; 14 descargas |
| Qwen/Qwen3.8-27B (modelo base) | 27,8 mil millones (mismo juego de tensores y formas) | no disponible en esta información | Apache 2.0 (heredada) | Modelo de referencia publicado por Qwen; stack de texto y multimodal original |
| Otros checkpoints del mismo run E2K | no disponible | no disponible | Apache 2.0 | El autor publica un repositorio por iteración guardada, con el sufijo `-frozen-adam` en las tentativas sin reinicio de Adam |

No se dispone en la información proporcionada de alternativas comparables de otros autores para la tarea de internalización de conocimiento en ARC-AGI-3, por lo que la comparación cuantitativa con modelos de terceros queda como no disponible.

## Limitaciones y advertencias

- No es una mejora de propósito general de Qwen3.8-27B: se entrenó y evaluó en un único juego (`cd82-fb555c5d`) y el autor lo califica explícitamente de checkpoint de investigación.
- Rendimiento muy bajo en la tarea: la tasa de nivel superado es 0,000 en seis de los ocho rollouts y 0,031 (1 de 32 episodios) en los otros dos; el retorno con forma es negativo en todos los casos (-0,205 a -0,516).
- Diferencias dentro del ruido: el ruido entre rollouts de un mismo brazo es de unas 0,05 unidades de retorno con forma, y ningún brazo supera 2 de 32 episodios, así que no deben extraerse conclusiones de mejora a partir de estas cifras.
- Momento de Adam congelado: en esta tentativa los momentos del SFT se arrastraron al RL sin reinicio, manteniendo el paso de política ~5 veces por debajo de la línea base; el propio autor relanzó el run con reinicio y publica esas iteraciones sin el sufijo `-frozen-adam`. Es una trayectoria distinta, no la mejor del run.
- Historial de entrenamiento incompleto: solo 2 rollouts SFT y 2 de RL, detenidos por decisión para liberar la GPU; no hay control emparejado junto a los rollouts posteriores de IDD y arm-C.
- Riesgo de alucinación: no evaluado en la información proporcionada; el modelo conserva el comportamiento del base en texto general, sin datos de evaluación específicos.
- Sesgos: no documentados en la información disponible.
- Idiomas: no se especifican; la única evidencia de comportamiento es sobre prompts de agente en inglés técnico dentro del harness.
- Multimodalidad solo nominal: la torre de visión se copia sin entrenar y el actor nunca vio imágenes, por lo que el pipeline image-text-to-text no refleja una capacidad ajustada.
- Uso comercial: la licencia Apache 2.0 lo permite, pero al ser un artefacto de investigación con rendimiento marginal en su única tarea, no se recomienda su despliegue en producción.
- Reproducibilidad: el estado del optimizador no se incluye en el repositorio; solo pueden reconstruirse los argumentos y el cursor de datos, no los momentos de Adam.

## Enlaces

- Checkpoint en HuggingFace: https://huggingface.co/ziyan98/E2K-cd82-Qwen3.8-27B-act_ctrl-cc-iter6-frozen-adam
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; las busquedas devolvieron unicamente resultados sin relacion con el checkpoint (contenido para adultos), por lo que no se incluyen.
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
