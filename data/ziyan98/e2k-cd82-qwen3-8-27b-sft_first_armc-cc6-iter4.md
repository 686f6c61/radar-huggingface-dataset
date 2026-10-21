# ziyan98/E2K-cd82-Qwen3.8-27B-sft_first_armc-cc6-iter4

## Resumen

E2K-cd82-Qwen3.8-27B-sft_first_armc-cc6-iter4 es un checkpoint de investigación derivado de Qwen/Qwen3.8-27B, publicado por Ziyan Wang (King's College London) dentro del experimento E2K sobre el juego `cd82-fb555c5d` de ARC-AGI-3. No es una mejora de propósito general del modelo base: es el resultado de un estudio sobre si el conocimiento verificado extraído de la propia partida de un modelo puede escribirse en sus pesos mediante filas supervisadas y después refinarse con RL sobre episodios reales de varios pasos. El checkpoint corresponde a la iteración 4 de Megatron del brazo `sft_first_armc-cc6`, es decir, dentro del bloque de calentamiento puramente supervisado (rollouts 3 a 5 sin RL), y fue entrenado sobre un único juego y evaluado con rollouts de 32 episodios de ese mismo juego.

El modelo conserva la arquitectura del base: un transformer multimodal de la familia Qwen3.5 (clase `Qwen3_5ForConditionalGeneration`) con 27.781.427.952 parámetros reales en safetensors, torre de visión `model.visual.*` y cabeza de predicción multi-token `mtp.*` copiadas sin cambios del checkpoint original. El entrenamiento fue exclusivamente de texto: el actor nunca vio una imagen y la torre visual no participó en el entrenamiento. El stack de texto (`model.language_model.*`, `lm_head`) sí es el estado entrenado en Megatron y se convirtió a HuggingFace verificando forma y tipo de cada tensor y la identidad bit a bit de los tensores copiados.

La relevancia del checkpoint es metodológica, no de rendimiento: documenta con detalle inusual (argumentos de Megatron, ficheros de conversión, sumas SHA256, métricas por rollout) la reproducibilidad de un pipeline slime + Megatron-LM + SGLang sobre 4 nodos GH200 de Isambard-AI. Las diferencias entre brazos del experimento son de centésimas de retorno con forma, mientras que el ruido entre rollouts de un mismo brazo ronda 0,05, por lo que este checkpoint debe tratarse como material de estudio y no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder multimodal de la familia Qwen3.5 (`Qwen3_5ForConditionalGeneration`): stack de texto + torre visual `model.visual.*` + cabeza de predicción multi-token `mtp.*` |
| Parametros totales | 27.781.427.952 (27,78 B), 1.199 tensores en safetensors |
| Parametros activos | No aplicable: no se documenta como MoE en la informacion disponible |
| Longitud de contexto | No disponible en la informacion proporcionada (se hereda del modelo base Qwen/Qwen3.8-27B, no se explicita en la model card) |
| Tipos de cuantizacion | El autor publica únicamente bf16; no se publican GGUF, AWQ, GPTQ ni FP8. Cuantizaciones de terceros: no disponibles |
| Idiomas soportados | No disponible en la informacion proporcionada (la model card no lista idiomas; el entrenamiento fue en texto, sobre un único juego) |
| Licencia | Apache-2.0, heredada de Qwen3.8-27B |
| Formato de pesos | Safetensors en bf16 (repo de 55,6 GB), misma estructura y formas que el base |

## Arquitectura y entrenamiento

La arquitectura es la del base Qwen3.8-27B sin modificaciones estructurales: un transformer decoder con atención completa, torre de visión y cabeza MTP. La conversión desde Megatron torch_dist a HuggingFace se hizo con el mapeo `megatron_to_hf.convert_to_hf` de slime, por trozos y en memoria baja (`convert_torch_dist_to_hf_lowmem.py`); el mismo conversor reproduce bit a bit los safetensors originales del base. El checkpoint incluye en `megatron/` el estado de contabilidad de la ejecución (`common.pt` con argumentos y scheduler del optimizador, `args.json`, `latest_checkpointed_iteration.txt` y el cursor de datos `global_dataset_state_dict_<N>.pt`), lo que permite reconstruir el estado de entrenamiento salvo los momentos del optimizador con `convert_hf_to_torch_dist.py`. Los ficheros `E2K_CONVERSION.json`, `E2K_VERIFY.json` y `SHA256SUMS` documentan activos copiados, verificación frente al base e integridad.

El entrenamiento usa el brazo C del experimento `sft_first` con la configuración `rl_config_cc_armc_w6.json`: 1.664 filas SFT (`cd82-play-v4/sft_armc/rows.jsonl.gz`), de las cuales 1.162 son filas de recitación con 1 a 3 frases de conocimiento emparejadas por nivel, escritas al principio de pensamientos de longitud completa del modelo base, y 502 filas de replay simple; 832 filas por rollout de SFT, con pesos de cita 1 / 8 / 32 / 32 / 32 / 32 sobre los tokens de conocimiento. El calendario arranca con 6 rollouts de calentamiento solo SFT (0 a 5, sembrados desde la iteración 2 de `sft_first_armc-cc`), con reinicio de Adam, y a partir del rollout 6 aplica RL con Dr.GRPO (`--advantage-estimator grpo --no-normalize-advantages --disable-grpo-std-normalization --calculate-per-token-loss`): una muestra de entrenamiento por llamada al LLM, batch global 4, 8 pasos de optimizador por rollout de 32 episodios, lr 5e-6, bf16 y backend flash-attn 2.8.3. El prompt de RL nunca contiene conocimiento; la hipótesis que se prueba es que este se haya internalizado en los pesos. El stack es slime v0.3.2 con Megatron-LM TP4 × PP4 y 16 motores de rollout SGLang a tp=1 sobre 4 nodos GH200. El arnés de juego es Claude Code CLI 2.1.270 operando las herramientas MCP `look` / `act` / `status` de `knowledge_learning.loop.arc_mcp`, con semilla 0, niveles 1 a 4 con tope de un nivel y retorno con forma sobre los niveles completados.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" heredado del base; en este run los pensamientos tienen una mediana de 5.101 tokens.
- Recitación de conocimiento inyectado: las filas SFT enseñan al modelo a citar frases de conocimiento de nivel adecuado; la fracción de turnos con recitación medida en el rollout 6 es 0,034 y la de turnos con referencia a fuente 0,233.
- Juego de ARC-AGI-3 sobre el entorno `cd82-fb555c5d` mediante herramientas MCP (`look`, `act`, `status`), con acciones paso a paso y gestión de niveles.
- Capacidad multimodal latente: la torre de visión está presente en los pesos y el pipeline declarado es `image-text-to-text`, pero no fue entrenada ni ejercitada en este run (entrenamiento solo texto).
- Integración con tool calling / function calling a través del arnés MCP descrito en la model card.
- Carga directa en transformers, vLLM y SGLang con el mismo comportamiento que el base; plantilla de chat y modo thinking sin cambios.
- Reproducibilidad de entrenamiento: argumentos de Megatron, cursor de datos y estado del scheduler incluidos en el repositorio.
- Capacidades multilingües: no documentadas en la información disponible.

## Casos de uso

- Reproducción del experimento E2K: cargar el checkpoint y reejecutar el pipeline slime + Megatron-LM con `megatron/args.json` y el cursor `global_dataset_state_dict_<N>.pt` para auditar cómo evoluciona la política durante el calentamiento SFT.
- Estudio de internalización de conocimiento: comparar la NLL de citación por paso de SFT (export de W&B en el dataset de RL) con la tasa de recitación en episodios reales, para determinar si el conocimiento se escribe en los pesos o solo se aprende a recuperarlo en contexto.
- Baseline de ablación para el resto de la serie: usar la iteración 4 como referencia SFT-only frente a los rollouts posteriores con Dr.GRPO del mismo brazo y aislar el efecto del RL.
- Investigación sobre agentes de razonamiento largo: los pensamientos de mediana 5.101 tokens permiten estudiar coste, latencia y estabilidad de cadenas de razonamiento largas en tareas de interacción con entorno.
- Validación de conversión Megatron a HuggingFace: `E2K_VERIFY.json` y `SHA256SUMS` sirven como caso de prueba de conversores (identidad bit a bit de tensores copiados, verificación de forma y dtype tensor a tensor).
- Punto de partida para fine-tuning posterior sobre el mismo juego o sobre otros entornos ARC-AGI-3, reutilizando las 1.664 filas SFT y los pesos de citación ya calibrados.
- Docencia y divulgación técnica: ejemplo completo y verificable de un ciclo RL con ventaja GRPO sobre episodios multi-turno con retorno con forma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K ni ninguna otra prueba estándar). Las únicas métricas publicadas son las de juego del rollout 6 de este run:

| Job | Rollout | Tasa de niveles completados | Retorno con forma | Cambio de paso | Paso sin efecto (no-op) | Tokens de pensamiento (p50) | Turnos con recitación | Turnos con referencia a fuente |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 6671238 | 6 | 0,031 | 0,009 | 0,053 | 0,339 | 5.101 | 0,034 | 0,233 |

El primer rollout de RL tras un bloque solo SFT lo juega la política SFT-only, de modo que la fila mide lo que aportaron las filas por sí solas. El ruido entre rollouts de un mismo brazo es de aproximadamente 0,05 de retorno con forma, es decir, muy superior a la señal de 0,009 observada, y las diferencias entre brazos se sitúan en centésimas.

## Requisitos de hardware

- Pesos en bf16: 55,6 GB solo de pesos (27,78 B de parámetros × 2 bytes). Con caché KV y activaciones, la inferencia realista arranca en unos 64-70 GB de VRAM.
- GPU de datacenter: 1 × A100 80 GB, 1 × H100 80 GB o 1 × H200 son el mínimo cómodo en bf16; en FP8 (no publicado por el autor) los pesos bajarían a unos 28 GB y cabrían en una L40S 48 GB o una A100 40 GB con contexto corto.
- GPU de consumo: no cabe en una RTX 4090 de 24 GB en bf16 ni en FP8. Requiere tensor parallelism en 2-3 × RTX 4090/5090 (24-32 GB cada una) con vLLM, asumiendo que el soporte de la arquitectura Qwen3.5 esté disponible en la versión usada. En cuantización de 4 bits (unos 14-16 GB de pesos) cabría en una sola RTX 4090, pero la mediana de 5.101 tokens de pensamiento hace que la caché KV crezca rápido y el contexto útil quede muy recortado.
- Despliegue: transformers (`Qwen3_5ForConditionalGeneration` + `AutoProcessor` con `dtype="bfloat16"` y `device_map="auto"`), vLLM, SGLang (usado en el propio entrenamiento a tp=1 en 16 motores) y Megatron-LM vía el conversor de slime. No hay GGUF publicado, por lo que llama.cpp / Ollama requerirían una conversión propia no verificada por el autor.
- Entrenamiento o reconstrucción completa: el checkpoint con estado del optimizador ocupa unos 351 GB y se ejecutó sobre 4 nodos GH200 (TP4 × PP4, 16 motores SGLang).
- Latencia y throughput: no disponibles en la información proporcionada; no se publican mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento especifico | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| E2K-cd82-...-sft_first_armc-cc6-iter4 (este) | 27,78 B | no disponible | SFT sobre 1.664 filas de un unico juego ARC-AGI-3; iteracion 4 dentro del calentamiento SFT, sin RL aun | Apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen3.8-27B (base) | 27,78 B | no disponible | Entrenamiento general del autor original | Apache-2.0 | Publico y ampliamente utilizado |
| Iteracion 2 de `sft_first_armc-cc` (semilla del calentamiento) | 27,78 B | no disponible | Mismo pipeline, estado anterior del mismo brazo | Apache-2.0 | Publicada en la serie del run, listada en `checkpoints/checkpoints.md` |

No se documentan en la información disponible otros checkpoints públicos comparables de ARC-AGI-3 con este protocolo de internalización de conocimiento. Frente al base, la comparación honesta es que comparten arquitectura, tamaño, licencia y tokenizador, y que la única diferencia medida son centésimas de retorno con forma en un juego concreto, dentro del ruido entre rollouts.

## Limitaciones y advertencias

- No es una mejora de propósito general: fue entrenado sobre un solo juego (`cd82-fb555c5d`), evaluado con rollouts de 32 episodios del mismo juego, y el propio autor indica que las diferencias entre brazos son de centésimas de retorno.
- Señal por debajo del ruido: retorno con forma 0,009 frente a un ruido entre rollouts de aproximadamente 0,05; no debe interpretarse ninguna mejora como significativa sin más repeticiones.
- El checkpoint es la iteración 4, dentro del bloque solo SFT: no ha recibido todavía ninguna actualización de Dr.GRPO, por lo que no representa el resultado final del experimento.
- La torre de visión y la cabeza MTP se copiaron sin entrenar; el modelo nunca vio una imagen. Aunque el pipeline declarado sea `image-text-to-text`, el rendimiento multimodal no está validado en este checkpoint.
- Riesgo de alucinación: el modelo puede recitar frases de conocimiento de forma incorrecta o fuera de contexto; la fracción de turnos con recitación es 0,034 y la de referencias a fuente 0,233, es decir, la mayoría de turnos no cita conocimiento verificable.
- Sesgos: no documentados. Al derivar de Qwen3.8-27B, hereda los sesgos del base, que la model card no analiza.
- Idiomas y contexto: no disponibles; no hay evaluación multilingüe ni de ventana larga en la información proporcionada.
- Licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye como artefacto de investigación sin garantías; no hay validación en producción.
- Trazabilidad peculiar: el estado completo con optimizador (unos 351 GB) permanece en Isambard-AI y solo se distribuyen los pesos convertidos; la reconstrucción exacta del entrenamiento depende de artefactos auxiliares (`common.pt`, cursores de dataset) y del código de slime.
- Coste de inferencia alto por el modo thinking (mediana de 5.101 tokens por turno) y 0,339 de pasos sin efecto en el juego, lo que degrada la eficiencia por acción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ziyan98/E2K-cd82-Qwen3.8-27B-sft_first_armc-cc6-iter4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset del run (episodios, métricas, filas y log): https://huggingface.co/datasets/ziyan98/E2K-cd82-rl-internalization
- Dataset del conjunto de conocimiento: https://huggingface.co/datasets/ziyan98/E2K-cd82-harness-knowledge
- Dataset E2K-40: https://huggingface.co/datasets/ziyan98/E2K-40
- Código citado en la model card: `ziyan-wang98/knowledge-learning-e2k` (rutas `src/knowledge_learning/rl/` y `docs/RL_KNOWLEDGE_SFT.md`)
- Repositorio de slime (stack de RL usado, v0.3.2): no se proporciona enlace en la información disponible
- Paper o blog del método: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
