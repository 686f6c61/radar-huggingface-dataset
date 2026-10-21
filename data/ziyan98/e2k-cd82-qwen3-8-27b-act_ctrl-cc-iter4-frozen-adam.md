# ziyan98/E2K-cd82-Qwen3.8-27B-act_ctrl-cc-iter4-frozen-adam

## Resumen

E2K-cd82-Qwen3.8-27B-act_ctrl-cc-iter4-frozen-adam es un checkpoint de investigación publicado por el usuario ziyan98 (HuggingFace) a partir de Qwen/Qwen3.8-27B. No es un ajuste de propósito general: es una de las ramas de control del experimento E2K (experience-to-knowledge), cuyo objetivo es estudiar si el conocimiento verificado extraído del propio juego de un modelo puede escribirse en sus pesos mediante filas supervisadas y mejorarse después con RL sobre episodios reales de varios pasos. Todo el entrenamiento se hizo sobre un único juego de ARC-AGI-3 (`cd82-fb555c5d`), con 27.781.427.952 parámetros (27,78 B) en bf16.

La rama concreta es `act_ctrl-cc`: el control emparejado de la rama IDD, entrenado con 303 filas de harness (turnos del propio modelo base, sin conocimiento inyectado). La iteración 4 corresponde al primer intento de la ejecución (16-17 de septiembre de 2026), en el que los momentos de Adam acumulados durante el calentamiento SFT se arrastraron al RL sin reiniciar y dejaron el paso de política casi a cero (movimiento de política unas 5 veces por debajo de la línea base). Se conserva porque representa una trayectoria distinta desde el mismo punto de partida SFT.

Su relevancia es metodológica, no de rendimiento: sirve como control negativo y como evidencia sobre el efecto del estado del optimizador en el paso SFT→RL. El propio autor advierte que ningún brazo supera más de 2 de 32 episodios y que las diferencias entre brazos son de pocas décimas de retorno con forma, con un ruido entre rollouts de aproximadamente 0,05.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.8 (etiqueta de arquitectura `qwen3_5`) con torre visual `model.visual.*` y cabeza de predicción multi-token `mtp.*` heredadas sin cambios del modelo base; detalles internos de capas y atención no disponibles |
| Parámetros totales | 27.781.427.952 (27,78 B), según safetensors |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | solo bf16 en safetensors; no se publican GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors bf16, 1199 tensores; conversión desde Megatron torch_dist con `megatron_to_hf.convert_to_hf` (streaming) |
| Modelo base | Qwen/Qwen3.8-27B |
| Tamaño del repositorio | 55,6 GB |
| Tensores del stack de texto | 851 (`model.language_model.*` + `lm_head`), estado entrenado en Megatron |
| Tensores de visión y MTP | 348 copiados del checkpoint base, verificados bit a bit |
| Pipeline declarado | image-text-to-text |
| Librería | transformers |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3.8-27B sin modificaciones estructurales. El estado entrenado abarca únicamente el stack de texto (851 tensores: `model.language_model.*` y `lm_head`), convertido desde el formato Megatron torch_dist; la torre visual y la cabeza MTP nunca formaron parte del modelo en Megatron y se copiaron del checkpoint base sin cambios, con comprobación de identidad bit a bit. El entrenamiento fue solo de texto: el actor nunca vio una imagen, pese a que la pipeline declarada sea image-text-to-text. Los tensores de texto se verificaron en forma y dtype.

El entrenamiento se ejecutó con slime v0.3.2 sobre Megatron-LM (TP4 × PP4) y 16 motores de rollout SGLang con tp=1, en 4 nodos GH200 de Isambard-AI. La fase SFT usó 303 filas de harness (`runs/cd82-play-v4/sft/rows_actctrl.jsonl.gz`): turnos del propio modelo base, sin conocimiento, como control emparejado de la rama IDD. La programación fue de 2 rollouts solo-SFT (iteraciones 0-1) seguidos de RL con Dr.GRPO en los rollouts 2-3, detenido el 18 de septiembre de 2026 para liberar la GPU. Hiperparámetros: `--advantage-estimator grpo --disable-grpo-std-normalization --calculate-per-token-loss`, `--normalize-advantages` en su valor por defecto (desactivado), una muestra de entrenamiento por llamada al LLM, batch global de 4 episodios (unos 200 muestras por paso de optimizador), 8 pasos de optimizador por rollout de 32 episodios, lr 5e-6, bf16 y backend flash-attn 2.8.3.

La particularidad de este checkpoint es un fallo metodológico deliberadamente preservado: los momentos de Adam del calentamiento SFT se arrastraron al RL sin reinicio, lo que mantuvo el paso de política cerca de cero (movimiento ~5× por debajo de la línea base). Desde el 17 de septiembre de 2026 el reinicio de momentos de Adam en la frontera SFT→RL es obligatorio; la ejecución se relanzó desde la iteración 1 con reinicio y esas iteraciones se publican sin el sufijo `-frozen-adam`. El prompt de RL nunca contiene conocimiento. El harness de juego es Claude Code CLI 2.1.270 manejando las herramientas MCP `look` / `act` / `status` de `knowledge_learning.loop.arc_mcp`, con semilla de motor 0, episodios que empiezan en el nivel 1 y continúan hasta cuatro niveles, 40 decisiones por episodio y recompensa igual a niveles superados más un retorno con forma; los niveles de test 5-6 nunca se juegan.

## Capacidades

- Generación de texto conversacional: conserva el stack de texto completo ajustado de Qwen3.8-27B, con plantilla de chat y tokenizador del modelo base.
- Razonamiento multi-paso dentro de un episodio: el modelo produce trazas de pensamiento prolongadas, con una mediana de tokens de pensamiento de entre 3347 y 4504 en los rollouts registrados.
- Uso de herramientas vía MCP: emite llamadas a `look`, `act` y `status` dentro del bucle de juego, con 40 decisiones por episodio.
- Interacción con entorno stateful: mantiene estado a lo largo de episodios de hasta cuatro niveles, con reinicio en cada episodio de entrenamiento.
- Procesamiento de imagen-texto: la arquitectura incluye torre visual funcional (heredada del base), pero el autor confirma que el entrenamiento fue solo de texto y el actor nunca vio una imagen, por lo que no hay evidencia de mejora multimodal en este checkpoint.
- Predicción multi-token: la cabeza `mtp.*` está presente pero no fue entrenada en esta ejecución.
- Capacidades multilingües: no disponibles (los metadatos no declaran idiomas).
- Modo de pensamiento explícito: sí, medido como tokens de pensamiento por turno.
- No se declaran capacidades de audio, vídeo, function calling genérico ni agentes fuera del harness descrito.

## Casos de uso

- Control negativo en experimentos de internalización de conocimiento: este checkpoint es la rama de control emparejada de la rama IDD, entrenada con los mismos turnos de harness pero sin filas de conocimiento; sirve para medir cuánto del efecto atribuido al conocimiento proviene en realidad de la exposición repetida al juego.
- Estudio del arrastre del estado del optimizador: al conservar los momentos de Adam del calentamiento SFT, permite cuantificar cuánto se frena el paso de política en la transición SFT→RL (medido como ~5× por debajo de la línea base) y justificar empíricamente el reinicio de momentos en pipelines de RL con slime.
- Reproducción de la ablación `act_ctrl-cc`: el repositorio incluye `megatron/args.json`, `common.pt`, `latest_checkpointed_iteration.txt` y el cursor `global_dataset_state_dict_<N>.pt`, de modo que el estado de entrenamiento (salvo momentos del optimizador) puede reconstruirse con `convert_hf_to_torch_dist.py` de slime.
- Desarrollo y depuración de harness de evaluación ARC-AGI-3: el modelo genera trazas de 3.300-4.500 tokens de pensamiento con llamadas MCP estructuradas, útiles como material de prueba para validar parsers, herramientas `look`/`act`/`status` y políticas de truncado de contexto.
- Análisis de divergencia de pesos: al compartir exactamente el conjunto y las formas de tensores con Qwen3.8-27B (1199 tensores), permite calcular deltas por tensor frente al base y frente a las demás iteraciones de la serie para estudiar qué capas mueve el SFT frente al RL.
- Docencia y formación en pipelines de RL a gran escala: el repositorio documenta configuración de Megatron (TP4 × PP4), 16 motores SGLang, Dr.GRPO sin normalización de ventajas y pérdida por token, lo que lo convierte en un caso de estudio completo de un experimento fallido y su corrección.
- Verificación de procedimientos de conversión Megatron→HF: la conversión se hizo con streaming por chunks (`convert_torch_dist_to_hf_lowmem.py`), y este checkpoint sirve para validar que el mapeo reproduce formas y dtypes correctos en 27,78 B de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento son las métricas de juego por rollout del propio experimento, extraídas de los logs del trabajo:

| Job | Rollout | Tasa de niveles superados | Retorno con forma | Cambio de paso | Paso sin efecto | Tokens de pensamiento (p50) | Turnos recitados | Turnos con referencia a fuente |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 6619233 | 2 | 0,000 | -0,419 | 0,083 | 0,386 | 4431,000 | 0,000 | 0,237 |
| 6647953 | 2 | 0,000 | -0,516 | 0,064 | 0,411 | 4279,000 | 0,000 | 0,232 |
| 6619233 | 3 | 0,000 | -0,514 | 0,040 | 0,425 | 3347,000 | 0,000 | 0,214 |
| 6647953 | 3 | 0,031 | -0,347 | 0,055 | 0,400 | 4504,000 | 0,000 | 0,227 |
| 6619233 | 4 | 0,000 | -0,348 | 0,057 | 0,394 | 3896,000 | 0,000 | 0,248 |
| 6619233 | 5 | 0,031 | -0,205 | 0,082 | 0,366 | 4162,000 | 0,000 | 0,271 |
| 6630891 | 5 | 0,000 | -0,338 | 0,056 | 0,372 | 4371,000 | 0,000 | 0,271 |
| 6630891 | 6 | 0,000 | -0,253 | 0,052 | 0,360 | 3932,500 | 0,000 | 0,269 |

Contexto de lectura: el primer rollout tras un bloque solo-SFT lo juega la política solo-SFT, por lo que mide el efecto de las filas por sí mismas. El ruido entre rollouts de un mismo brazo es de aproximadamente 0,05 de retorno con forma, y las diferencias entre brazos son como máximo de unas pocas décimas. Ningún brazo supera más de 2 de 32 episodios. La tasa de pasos sin efecto se mantiene entre 0,360 y 0,425, y los turnos recitados son 0,000 en todos los rollouts.

## Requisitos de hardware

- VRAM estimada en bf16: unos 55,6 GB solo para pesos (27,78 B × 2 bytes); con caché KV y activaciones para contexto moderado, del orden de 65-75 GB. El tamaño del repositorio (55,6 GB) es coherente con esta cifra.
- VRAM estimada en FP8: unos 28 GB para pesos, más caché KV; no hay checkpoint FP8 publicado, sería una conversión propia.
- VRAM estimada en 4 bits: unos 14-15 GB para pesos; no hay cuantización publicada, por lo que requiere cuantizar el usuario.
- GPU recomendadas: A100 80 GB, H100 80 GB, H200 o GH200 en una sola unidad para bf16 sin sharding. El entrenamiento original usó 4 nodos GH200 de Isambard-AI.
- Configuraciones multi-GPU: dos A100 40 GB o dos RTX A6000 48 GB con tensor parallel permiten bf16; el run original usó TP4 × PP4 sobre 4 nodos.
- GPU de consumo: no cabe en bf16 en ninguna tarjeta de consumo actual (RTX 4090 24 GB, RTX 5090 32 GB). Solo cabría en 4 bits, cuantización no publicada.
- Opciones de despliegue: transformers con accelerate, vLLM y SGLang (este último es el usado para los 16 motores de rollout a tp=1). TGI sería viable si soporta la arquitectura. llama.cpp y Ollama no son utilizables sin una conversión a GGUF.
- Latencia y throughput: no disponibles. Como referencia indirecta, en el entrenamiento cada llamada al LLM generó una mediana de 3.300-4.500 tokens de pensamiento con 16 motores SGLang en paralelo, sin datos de latencia por token publicados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento específico | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| E2K-cd82-Qwen3.8-27B-act_ctrl-cc-iter4-frozen-adam | 27,78 B | no disponible | SFT (303 filas) + Dr.GRPO sobre un juego ARC-AGI-3; Adam sin reiniciar | Apache 2.0 | 10 descargas, 0 likes |
| Qwen/Qwen3.8-27B (base) | 27,78 B (mismo conjunto de 1199 tensores) | no disponible | Ajuste generalista original | según modelo base | público |
| Resto de iteraciones de la misma serie (0-3, solo-SFT y RL) | 27,78 B | no disponible | Misma ejecución, distinta fase | Apache 2.0 | publicadas una por repositorio, sin métricas comparativas en esta ficha |
| Iteraciones relanzadas sin sufijo `-frozen-adam` | 27,78 B | no disponible | Misma ejecución con reinicio de Adam en la frontera SFT→RL | Apache 2.0 | publicadas, sin métricas en esta ficha |
| Rama IDD y rama C del mismo estudio | 27,78 B | no disponible | Filas con conocimiento y otras variantes | Apache 2.0 | mencionadas, sin métricas en esta ficha |

No se dispone de datos para comparar con alternativas de otros autores del mismo tamaño (por ejemplo, otros modelos de ~27-32 B) en benchmarks estándar: no disponible.

## Limitaciones y advertencias

- No es una mejora de propósito general de Qwen3.8-27B: fue entrenado sobre un único juego (`cd82-fb555c5d`), evaluado en rollouts de 32 episodios de ese mismo juego, y ningún brazo supera más de 2 de 32 episodios.
- Las diferencias entre brazos son de pocas décimas de retorno con forma, con un ruido entre rollouts de aproximadamente 0,05; cualquier comparación por debajo de ese umbral no es interpretable.
- El arrastre de los momentos de Adam del SFT al RL mantuvo el movimiento de política ~5× por debajo de la línea base. Este checkpoint documenta un fallo de configuración, no un resultado científico limpio; el autor lo conserva solo como trayectoria alternativa.
- La ejecución se detuvo el 18 de septiembre de 2026 por decisión operativa (liberar la GPU), no por convergencia; los rollouts 2-3 no tienen control emparejado posterior.
- El entrenamiento fue solo de texto: la torre visual y la cabeza MTP están presentes pero congeladas y sin entrenar. No hay evidencia de capacidad image-text-to-text mejorada pese a la pipeline declarada.
- El prompt de RL nunca contiene conocimiento, y la rama es un control sin filas de conocimiento; no debe esperarse comportamiento de internalización en este checkpoint.
- Riesgo de alucinación: no evaluado en la información disponible. Los turnos con referencia a fuente (0,214-0,271) y los turnos recitados (0,000) son las únicas métricas relacionadas, y miden el juego, no la veracidad factual.
- Sesgos conocidos: no disponibles. No se publica ninguna evaluación de sesgo, toxicidad o robustez.
- Limitaciones de contexto e idioma: la longitud de contexto efectiva y los idiomas soportados no están declarados; los metadatos de HuggingFace no listan idiomas.
- Restricciones de licencia: Apache 2.0 declarada, con modelo base Qwen/Qwen3.8-27B. Conviene verificar que la licencia y los términos del modelo base se respetan al redistribuir o usar comercialmente, ya que la ficha no detalla esa comprobación.
- Estado del repositorio: 10 descargas y 0 likes; sin revisión comunitaria. Los detalles de entrenamiento dependen de rutas internas del dataset de RL (`knowledge-set/20260912-0920-final/`, `runs/cd82-play-v4/sft/rows_actctrl.jsonl.gz`) que no se enlazan aquí.
- No debe usarse en producción como sustituto del modelo base: no hay benchmarks estándar, ni evaluación de latencia, ni cuantizaciones publicadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ziyan98/E2K-cd82-Qwen3.8-27B-act_ctrl-cc-iter4-frozen-adam
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper: no disponible
- Blog del autor: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
- Dataset de RL asociado (referenciado en la model card, sin URL): `knowledge-set/20260912-0920-final/`, con `megatron/args.json`, `common.pt`, `checkpoints/series.md` y `runs/act_ctrl-cc/wandb_export/*/history.jsonl`
