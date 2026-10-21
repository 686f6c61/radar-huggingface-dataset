# ziyan98/E2K-cd82-Qwen3.8-27B-sft_first_idd-cc-iter4-frozen-adam

## Resumen

E2K-cd82-Qwen3.8-27B-sft_first_idd-cc-iter4-frozen-adam es un checkpoint de investigación publicado por el usuario ziyan98, derivado por ajuste fino de Qwen/Qwen3.8-27B (27.781.427.952 parámetros, unos 27,8 mil millones). No es un modelo de propósito general: es el resultado de un experimento de "internalización de conocimiento" (E2K, *experience-to-knowledge*) sobre el juego `cd82-fb555c5d` de ARC-AGI-3, en el que se intenta escribir en los pesos, mediante filas supervisadas, conocimiento verificado extraído de la propia partida del modelo, y después mejorarlo con aprendizaje por refuerzo sobre episodios reales de múltiples pasos.

El checkpoint corresponde a la ejecución `sft_first_idd-cc`, iteración 4 de Megatron, y proviene del primer intento del 16-17 de septiembre (de ahí el sufijo `-frozen-adam`): los momentos de Adam acumulados durante el calentamiento SFT se arrastraron al RL sin reiniciarse, lo que dejó el paso de política unas cinco veces por debajo de la línea base. Se conserva precisamente porque representa una trayectoria distinta desde el mismo punto de partida SFT-only que la versión relanzada con reinicio de Adam.

Su relevancia es metodológica, no de rendimiento: sirve para auditar cómo se propaga (o no) conocimiento explícito hacia los pesos y para estudiar fallos de infraestructura de RL. El autor advierte explícitamente de que no es una mejora general de Qwen3.8-27B: ningún brazo del experimento supera 2 de 32 episodios y las diferencias entre brazos están dentro del ruido (≈0,05 de retorno modelado).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal heredado de Qwen3.8-27B: pila de texto (`model.language_model.*`, `lm_head`), torre visual (`model.visual.*`) y cabeza de predicción multi-token (`mtp.*`). La model card no especifica si es denso o MoE |
| Parámetros totales | 27.781.427.952 (≈27,8 B), dato real de safetensors |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el repositorio solo publica pesos bf16 (no hay GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors bf16, 1199 tensores (851 de la pila de texto entrenada); repositorio de 55,6 GB |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.8-27B. El entrenamiento afectó únicamente a la pila de texto: los tensores `model.language_model.*` y `lm_head` (851) corresponden al estado de Megatron entrenado, verificados uno a uno en forma y tipo, mientras que la torre visual `model.visual.*` y la cabeza MTP `mtp.*` se copiaron sin cambios desde el checkpoint base (se comprobó identidad bit a bit). El actor nunca vio una imagen: el entrenamiento fue solo de texto, aunque el `pipeline_tag` del repositorio sea `image-text-to-text`. Config, tokenizador, plantilla de chat, configuración de generación y de procesador son también los del modelo base.

El entrenamiento se ejecutó con slime v0.3.2 sobre Megatron-LM en paralelismo TP4 × PP4, con 16 motores de rollout SGLang a tp=1, en 4 nodos GH200 de Isambard-AI, en bf16 y con backend flash-attn 2.8.3. El algoritmo de RL es Dr.GRPO (`--advantage-estimator grpo --disable-grpo-std-normalization --calculate-per-token-loss`, con `--normalize-advantages` en su valor por defecto, desactivado), una muestra de entrenamiento por llamada al LLM, batch global de 4 episodios (unos 200 muestras por paso de optimizador), 8 pasos de optimizador por rollout de 32 episodios y tasa de aprendizaje 5e-6. El plan fue: 2 rollouts solo SFT (iteraciones 0-1, con 303 filas IDD del arnés, que emparejan turnos de recitación —las frases `recall_forms_v2` de un conjunto de 391 afirmaciones— con filas de repetición), reinicio de Adam en la frontera SFT→RL y rollouts 2-8 de Dr.GRPO, uno por iteración. En este checkpoint concreto el reinicio de Adam no se aplicó, de modo que los momentos del calentamiento SFT entraron intactos en el RL y mantuvieron el movimiento de política ≈5× por debajo de la línea base; la ejecución se relanzó desde la iteración 1 con Adam reiniciado y esas iteraciones se publican sin el sufijo `-frozen-adam`.

El bucle de juego lo conducía Claude Code CLI 2.1.270 manejando las herramientas MCP `look`, `act` y `status` de `knowledge_learning.loop.arc_mcp`, con semilla de motor 0: cada episodio de entrenamiento abre en el nivel 1 y continúa al siguiente al superarlo, hasta cuatro niveles, con 40 decisiones por episodio y recompensa igual a niveles superados más un retorno modelado. Los niveles de test 5-6 nunca se jugaron. El prompt de RL nunca contiene el bloque de conocimiento; de ahí el interés del experimento: medir si ese conocimiento queda internalizado en los pesos.

## Capacidades

- Generación de texto conversacional (etiqueta `conversational` en el repositorio) con el mismo tokenizador y plantilla de chat que Qwen3.8-27B.
- Actuación como política agéntica en entornos de acciones discretas: emite decisiones del tipo `look` / `act` / `status` dentro de un bucle de hasta 40 decisiones por episodio y 4 niveles.
- Razonamiento multi-paso de horizonte largo: los turnos de pensamiento tienen una mediana de 5.211 a 6.887 tokens por episodio según el rollout.
- Internalización de conocimiento: es la capacidad bajo estudio; en esta iteración los turnos con conocimiento recitado son 0,000 de media, mientras que los turnos con referencia a fuente están entre 0,318 y 0,436.
- Soporte de tool calling: expuesto a través del arnés MCP durante el entrenamiento; no hay evidencia publicada de que conserve tool calling generalista fuera de ese arnés.
- Capacidades multimodales (visión): la torre visual existe en los pesos, pero se copió sin entrenar y el actor nunca vio imágenes; no validadas en esta model card.
- Capacidades multilingües: no disponibles; no se documenta ningún idioma.
- No hay datos publicados sobre matemáticas, código, visión o modo *thinking* explícito para este checkpoint.

## Casos de uso

- Reproducción y auditoría del experimento E2K: el repositorio incluye `megatron/args.json`, `common.pt` y el cursor `global_dataset_state_dict_<N>.pt`, lo que permite reconstruir el estado de entrenamiento (salvo momentos del optimizador) con `convert_hf_to_torch_dist.py` de slime y verificar cada decisión de configuración.
- Línea base frente a la ejecución relanzada: al compartir el mismo punto de partida SFT-only y diferir solo en el reinicio de Adam, sirve para cuantificar el efecto de arrastrar momentos del optimizador a través de la frontera SFT→RL.
- Estudio de internalización de conocimiento: comparar los turnos con recitación (0,000 aquí) y las referencias a fuente (0,318-0,436) frente a otros brazos permite analizar si 303 filas supervisadas bastan para escribir conocimiento en los pesos o solo para modificar el comportamiento superficial.
- Investigación de fallos silenciosos en RL a gran escala: el checkpoint documenta un caso real en el que el movimiento de política cae ~5× sin errores visibles, útil como caso de estudio para diseñar monitorización de normas de gradiente y de momentos por parámetro.
- Validación de infraestructura slime + Megatron-LM + SGLang: entorno TP4 × PP4 con 16 motores de rollout a tp=1, útil para probar rutas de conversión HF↔torch_dist y reanudación desde un cursor de dataset.
- Inicialización para experimentos agénticos en otros juegos o entornos con recompensa estructurada: el modelo ya está adaptado al formato de acciones discretas y a horizontes de 40 decisiones, por lo que reduce el coste de arranque frente a partir del base.
- Análisis de presupuesto de razonamiento en agentes: con medianas de 5.200-6.900 tokens de pensamiento por episodio, permite medir el coste en tokens y latencia de políticas que "piensan" antes de cada acción.
- Referencia negativa en evaluación de agentes: útil para comprobar que un arnés de evaluación detecta políticas que apenas superan episodios (1 de 32 como máximo), evitando falsos positivos por ruido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni similares) en la información disponible. Los únicos datos son las métricas de juego por rollout, extraídas de los registros de trabajo:

| job | rollout | clear rate | retorno modelado | step change | step no-op | tokens de pensamiento (p50) | turnos recitados | turnos con referencia a fuente |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 6619232 | 2 | 0,000 | -0,148 | 0,090 | 0,347 | 5.563,5 | 0,000 | 0,436 |
| 6647952 | 2 | 0,031 | 0,011 | 0,078 | 0,313 | 5.814,0 | 0,000 | 0,426 |
| 6619232 | 3 | 0,000 | -0,062 | 0,056 | 0,322 | 5.668,0 | 0,000 | 0,384 |
| 6624050 | 3 | 0,031 | -0,094 | 0,054 | 0,332 | 5.156,0 | 0,000 | 0,356 |
| 6647952 | 3 | 0,031 | 0,084 | 0,045 | 0,330 | 5.525,0 | 0,000 | 0,318 |
| 6624050 | 4 | 0,000 | -0,203 | 0,043 | 0,343 | 6.497,5 | 0,000 | 0,422 |
| 6647952 | 4 | 0,031 | 0,084 | 0,041 | 0,349 | 5.622,5 | 0,000 | 0,358 |
| 6624050 | 5 | 0,031 | -0,203 | 0,033 | 0,342 | 6.598,5 | 0,000 | 0,428 |
| 6647952 | 5 | 0,031 | 0,206 | 0,081 | 0,310 | 5.377,0 | 0,000 | 0,354 |
| 6624050 | 6 | 0,000 | -0,133 | 0,040 | 0,317 | 6.887,5 | 0,000 | 0,397 |
| 6647952 | 6 | 0,031 | 0,189 | 0,082 | 0,306 | 5.595,5 | 0,000 | 0,373 |
| 6647952 | 7 | 0,031 | 0,100 | 0,090 | 0,318 | 5.211,0 | 0,000 | 0,339 |
| 6647952 | 8 | 0,000 | 0,252 | 0,093 | 0,272 | 5.367,0 | 0,000 | 0,362 |

Lectura de los datos: la tasa de superación máxima es 0,031 (1 episodio de 32) y ningún brazo supera 2 de 32; el ruido entre rollouts de un mismo brazo es de ≈0,05 de retorno modelado; el primer rollout tras el bloque SFT-only lo juega la política SFT-only, de modo que mide el efecto de las filas por sí solas. La proporción de pasos sin efecto (0,272-0,349) indica que cerca de un tercio de las acciones no alteran el estado.

## Requisitos de hardware

- VRAM en bf16: los pesos ocupan 55,6 GB; con caché KV y activaciones hay que contar aproximadamente 62-70 GB según longitud de contexto y número de secuencias concurrentes.
- GPU para bf16 sin cuantizar: A100 80 GB, H100 80 GB o GH200 96 GB (el entrenamiento usó 4 nodos GH200 en Isambard-AI). En 80 GB cabe una instancia con margen ajustado.
- Cuantización a 8 bits (estimación, no publicada en el repositorio): ≈28 GB de pesos, por encima de 24 GB tras añadir caché; encajaría en A6000 48 GB o L40S 48 GB.
- Cuantización a 4 bits (estimación, no publicada): ≈15-17 GB, viable en RTX 4090 24 GB o RTX 3090 24 GB; requeriría convertir los pesos, porque el repositorio solo contiene safetensors bf16.
- Despliegue: `transformers` es la librería declarada y el repositorio está marcado como `endpoints_compatible`; vLLM o SGLang son opciones coherentes con el stack de entrenamiento. Para llama.cpp u Ollama haría falta generar un GGUF propio, no disponible.
- Latencia y throughput: no disponibles. Como referencia de coste, la política genera una mediana de 5.200-6.900 tokens de pensamiento por episodio de hasta 40 decisiones, lo que implica un consumo de tokens alto por cada acción.
- Almacenamiento: 55,6 GB para el repositorio completo, más el espacio de la conversión si se generan pesos cuantizados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en ARC-AGI-3 `cd82-fb555c5d` | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`-frozen-adam`, iteración 4) | 27,78 B | no disponible | clear rate máximo 0,031 (1/32 episodios); retorno modelado máximo 0,252 | Apache-2.0 | 7 descargas, 0 likes |
| Qwen/Qwen3.8-27B (base) | 27,78 B (mismo conjunto de tensores, 1199) | no disponible | no disponible en esta información | no disponible en esta información | modelo público en HuggingFace |
| Ejecución relanzada del mismo run (sin sufijo `-frozen-adam`) | 27,78 B | no disponible | no disponible | Apache-2.0 (según la serie) | publicada por el mismo autor, sin métricas en esta ficha |
| Otros brazos del estudio E2K (act-ctrl, IDD) | no disponible | no disponible | no disponible | no disponible | mencionados en la model card |

La comparación con modelos de propósito general de tamaño similar no aporta aquí: este checkpoint no ha sido evaluado en tareas estándar y su entrenamiento se limita a un único juego, por lo que cualquier comparación de MMLU, código o matemáticas carecería de datos.

## Limitaciones y advertencias

- No es una mejora general del modelo base: fue entrenado en un solo juego, evaluado en rollouts de 32 episodios de ese juego y el propio autor lo califica de checkpoint de investigación.
- Rendimiento muy bajo y dentro del ruido: ningún brazo supera 2 de 32 episodios, las diferencias entre brazos son de décimas de retorno modelado y el ruido entre rollouts de un mismo brazo es de ≈0,05.
- Contiene un defecto de entrenamiento conocido: los momentos de Adam del calentamiento SFT se arrastraron al RL, dejando el movimiento de política ≈5× por debajo de la línea base. No debe tratarse como el resultado "limpio" del experimento.
- Riesgo alto de sobreajuste al escenario: 303 filas SFT y un único entorno; el comportamiento fuera del arnés `look`/`act`/`status` no está documentado.
- Turnos recitados a 0,000 en todos los rollouts: no hay evidencia de que el conocimiento se haya internalizado de forma recuperable; las referencias a fuente (0,318-0,436) pueden reflejar copia superficial del contexto más que conocimiento en pesos.
- Visión no validada: la torre visual se copió sin entrenar y el actor nunca vio imágenes, pese a que el repositorio se etiqueta como `image-text-to-text`. Cualquier uso multimodal es especulativo.
- Idiomas y longitud de contexto sin documentar: no se puede asumir el comportamiento multilingüe ni el límite de contexto del modelo base sin verificarlo.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o robustez; al derivar del base, hereda los suyos sin cuantificar.
- Alucinación: no evaluada; en un modelo de 27,8 B ajustado sobre datos muy estrechos, el riesgo de generar justificaciones plausibles sin base es alto.
- Licencia: Apache-2.0 en este repositorio permite uso comercial, pero conviene verificar los términos del modelo base Qwen/Qwen3.8-27B, no incluidos en la información disponible.
- Producción: no recomendado como modelo de servicio general; los ficheros de estado de Megatron (`common.pt`, cursores de dataset) deben tratarse como artefactos de investigación, no como parte del modelo desplegable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ziyan98/E2K-cd82-Qwen3.8-27B-sft_first_idd-cc-iter4-frozen-adam
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de slime (stack de entrenamiento citado en la model card, sin enlace en la misma): https://github.com/THUDM/slime
- Repositorio de Megatron-LM (stack de entrenamiento citado en la model card, sin enlace en la misma): https://github.com/NVIDIA/Megatron-LM
- Papers, blogs, demos y espacios de evaluación: no disponibles en la información proporcionada.
