# ziyan98/E2K-cd82-Qwen3.8-27B-sft_joint-claimform-iter7

## Resumen

E2K-cd82-Qwen3.8-27B-sft_joint-claimform-iter7 es un checkpoint de investigación publicado por el usuario ziyan98 en Hugging Face. Consiste en un ajuste de Qwen/Qwen3.8-27B (27.781.427.952 parámetros, 55,6 GB en safetensors bf16) resultante del experimento de internalización de conocimiento E2K sobre el juego `cd82-fb555c5d` de ARC-AGI-3. No es una mejora de propósito general del modelo base: se entrenó sobre un único juego y se evaluó con rollouts de 32 episodios del mismo juego.

El estudio comprueba si el conocimiento verificado extraído del propio juego del modelo puede escribirse en sus pesos mediante filas supervisadas (470 filas: 391 de qa y 79 de statement) y refinarse después con RL sobre episodios reales de varios pasos. El entrenamiento combinó SFT con Dr.GRPO sobre slime v0.3.2 y Megatron-LM (TP4 × PP4, 16 motores de rollout SGLang) en 4 nodos GH200 de Isambard-AI, con 8 pasos de optimizador por rollout de 32 episodios, lr 5e-6 y bf16.

Su interés es metodológico, no de producción: el brazo que lo origina figura como superado y colapsado, la tasa de victoria en los rollouts publicados es 0,000 y ningún brazo del estudio supera 2 de 32 episodios. El checkpoint conserva el pipeline image-text-to-text del modelo base, pero la torre de visión y la cabeza MTP se copiaron sin cambios y el entrenamiento fue exclusivamente de texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de la familia Qwen3_5 (clase `Qwen3_5ForConditionalGeneration`); pila de texto entrenada, torre de visión congelada. Detalle de capas y mecanismo de atención: no disponible |
| Parámetros totales | 27.781.427.952 (27,78 B); 1199 tensores |
| Parámetros activos | No disponible (no se declara que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible: solo se publican pesos bf16; no hay GGUF ni cuantizaciones oficiales |
| Idiomas soportados | No disponibles (heredados del modelo base, sin declarar en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en bf16 (repo de 55,6 GB); se incluye además el estado Megatron `torch_dist` en `megatron/` (`common.pt`, `args.json`) |
| Modelo base | Qwen/Qwen3.8-27B |
| Pipeline declarado | image-text-to-text |
| Autor | ziyan98 |
| Descargas / likes | 7 / 0 |
| Fecha de creación | 2026-10-21 |
| Última actualización | 2026-10-21 |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B y conserva su conjunto de tensores y formas (1199 tensores). La pila de texto (`model.language_model.*` y `lm_head`; 851 tensores) es el estado entrenado con Megatron; la torre de visión (`model.visual.*`) y la cabeza de predicción multi-token (`mtp.*`) se copiaron del checkpoint base sin modificar y se verificó su identidad bit a bit. Por tanto, el pipeline image-text-to-text está declarado pero el actor nunca vio una imagen durante el entrenamiento.

El ajuste se hizo sobre el juego `cd82-fb555c5d` con 470 filas SFT (391 de qa y 79 de statement) procedentes de un conjunto de 391 afirmaciones, presentes en cada lote de RL. La fase de RL usa Dr.GRPO (`--advantage-estimator grpo --disable-grpo-std-normalization --calculate-per-token-loss`, `--normalize-advantages` desactivado), una muestra de entrenamiento por llamada al LLM, lote global de 4 episodios (unos 200 samples por paso de optimizador) y backend flash-attn 2.8.3. El prompt de RL nunca contiene conocimiento explícito. El arnés de juego es Claude Code CLI 2.1.270 controlando las herramientas MCP `look` / `act` / `status` de `knowledge_learning.loop.arc_mcp`, con semilla de motor 0, episodios que empiezan en el nivel 1 y continúan hasta cuatro niveles, 40 decisiones por episodio y recompensa igual a niveles superados más un retorno con forma. Los niveles de test 5 y 6 nunca se jugaron.

La conversión de Megatron `torch_dist` a HF se realizó con el mapeo `megatron_to_hf.convert_to_hf` de slime, por trozos (`convert_torch_dist_to_hf_lowmem.py`), y se documenta en `E2K_VERIFY.json` la comparación tensor a tensor contra el modelo base. El checkpoint completo con estado del optimizador (≈351 GiB) permanece en Isambard-AI y no se distribuye.

## Capacidades

- Generación de texto conversacional: el checkpoint mantiene la pila de lenguaje del modelo base y su plantilla de chat, tokenizador y configuración de generación originales.
- Juego interactivo sobre ARC-AGI-3: uso de herramientas MCP `look` / `act` / `status` para observar el estado del juego y emitir acciones paso a paso (hasta 40 decisiones por episodio).
- Razonamiento multi-paso dentro de un episodio: el arnés encadena decisiones y continúa al siguiente nivel cuando se supera uno, hasta cuatro niveles.
- Internalización de conocimiento: el experimento mide si las filas SFT de tipo qa y statement escriben conocimiento verificable en los pesos, sin que el prompt de RL lo contenga.
- Capacidad multimodal: el pipeline image-text-to-text se conserva a nivel de configuración, pero la torre visual no se entrenó.
- Tool calling / function calling: se ejercita a través del cliente MCP del arnés de juego; no se documenta un esquema general de function calling.
- Capacidades multilingües: no documentadas en la información disponible.
- Modo thinking: los logs incluyen una columna `think tokens p50`, pero aparece vacía en los rollouts publicados; no se confirma su comportamiento.

## Casos de uso

- Investigación sobre internalización de conocimiento: reproducir el protocolo E2K (filas SFT de qa y statement más RL con Dr.GRPO) para medir si el conocimiento verificado se refleja en los pesos y no solo en el prompt.
- Estudio de RL sobre agentes de juego: usar el checkpoint como punto de partida o de comparación en experimentos con el arnés `knowledge_learning.loop.arc_mcp` y el juego `cd82-fb555c5d`.
- Ablación de recetas de entrenamiento: comparar brazos (claim-form frente a otras variantes) con el mismo presupuesto de 8 pasos de optimizador por rollout de 32 episodios y ruido de referencia de 0,05 de retorno con forma.
- Auditoría de pipelines de conversión: el repo sirve para validar el convertidor `megatron_to_hf` de slime y la verificación tensor a tensor contra el modelo base (`E2K_VERIFY.json`).
- Reproducción de infraestructura: reconstruir el estado de entrenamiento (sin momentos del optimizador) con `convert_hf_to_torch_dist.py` a partir de `common.pt`, `args.json` y el cursor `global_dataset_state_dict_<N>.pt`.
- Base para experimentos de texto con plantilla Qwen: al conservar tokenizador, chat template y generation config del modelo base, puede usarse como punto de partida para ajustes de texto, asumiendo la degradación observada frente al original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de rendimiento son las métricas de juego del job 6503517, por rollout:

| Rollout | Tasa de superación | Retorno con forma | step change | step no-op | think tokens p50 | Turnos recitados | Turnos con source-ref |
|---:|---:|---:|---:|---:|---|---|---|
| 4 | 0,000 | -2,780 | 0,226 | 0,557 | no disponible | no disponible | no disponible |
| 5 | 0,000 | -3,109 | 0,209 | 0,534 | no disponible | no disponible | no disponible |
| 6 | 0,000 | -3,089 | 0,203 | 0,609 | no disponible | no disponible | no disponible |
| 7 | 0,000 | -2,944 | 0,246 | 0,536 | no disponible | no disponible | no disponible |
| 8 | 0,000 | -2,866 | 0,232 | 0,558 | no disponible | no disponible | no disponible |
| 9 | 0,000 | -3,009 | 0,235 | 0,508 | no disponible | no disponible | no disponible |
| 10 | 0,000 | -2,764 | 0,274 | 0,489 | no disponible | no disponible | no disponible |
| 11 | 0,000 | -2,808 | 0,226 | 0,555 | no disponible | no disponible | no disponible |

Contexto aportado por el autor: el ruido entre rollouts de un mismo brazo es de aproximadamente 0,05 de retorno con forma, las diferencias entre brazos no superan unas décimas y ningún brazo del estudio supera 2 episodios superados de 32.

## Requisitos de hardware

- VRAM estimada en bf16: en torno a 56 GB solo para pesos (55,6 GB de repo), más caché KV y activaciones; no cabe en GPUs de 24 GB ni de 48 GB en bf16.
- GPU recomendadas: una GPU de 80 GB (A100 80GB, H100 80GB, GH200) para inferencia en bf16 con lote pequeño, o varias GPUs con reparto por tensor/pipe. El entrenamiento documentado usó 4 nodos GH200 con TP4 × PP4 y 16 motores SGLang con tp=1.
- GPUs de consumo: no cabe en bf16 en RTX 4090, 3090 o similares de 24 GB. Una cuantización a 4 bits rondaría los 14-16 GB (estimación, no hay pesos cuantizados publicados ni validados).
- Opciones de despliegue: `transformers` con `Qwen3_5ForConditionalGeneration.from_pretrained(..., dtype="bfloat16", device_map="auto")` como vía documentada; SGLang empleado en el entrenamiento; Megatron-LM `torch_dist` para reconstruir el estado con TP4 × PP4 mediante `convert_hf_to_torch_dist.py`. vLLM, llama.cpp, Ollama y TGI no se mencionan y no hay GGUF disponible.
- Latencia y throughput: no disponibles. El repo no publica tiempos de inferencia ni tokens por segundo.

## Comparativa con modelos similares

No se dispone de información sobre alternativas de la misma categoría en el material proporcionado. La única comparación posible es con el modelo base del que deriva:

| Modelo | Parámetros | Contexto | Licencia | Formato | Capacidad | Disponibilidad |
|---|---|---|---|---|---|---|
| E2K-cd82-Qwen3.8-27B-sft_joint-claimform-iter7 | 27,78 B | no disponible | Apache 2.0 | safetensors bf16 + estado Megatron | Ajustado a un único juego ARC-AGI-3; brazo colapsado; 0/32 superaciones | 7 descargas, 0 likes |
| Qwen/Qwen3.8-27B (base) | 27,78 B (mismo conjunto de 1199 tensores) | no disponible | Apache 2.0 | safetensors | Modelo generalista original, sin el ajuste E2K | Modelo de referencia del ecosistema Qwen |

Otros modelos comparables: no disponible en la información proporcionada.

## Limitaciones y advertencias

- Alcance restringido: entrenado sobre un único juego (`cd82-fb555c5d`) de ARC-AGI-3; no es una mejora de propósito general y el propio autor lo califica de checkpoint de investigación.
- Brazo abandonado: la ejecución `sft_joint-claimform` figura como superada y colapsada; la iteración 7 pertenece a un brazo del 2026-09-12 que se descartó.
- Rendimiento medido nulo en superación: tasa de 0,000 y retorno con forma negativo (entre -2,764 y -3,109) en los ocho rollouts publicados; ningún brazo del estudio supera 2 de 32 episodios.
- Visión no entrenada: `model.visual.*` y `mtp.*` son copias bit a bit del modelo base, por lo que las capacidades image-text-to-text no se adaptaron y no hay evidencia de su calidad.
- Riesgo de degradación frente al base: al ser un ajuste estrecho con RL sobre una tarea, cabe esperar pérdida de rendimiento generalista; no se aportan benchmarks que lo cuantifiquen.
- Alucinación: no evaluada. Las columnas de turnos recitados y turnos con source-ref están vacías en los logs, de modo que no hay evidencia publicada de fidelidad del conocimiento internalizado.
- Idiomas y sesgos: no documentados; la model card no declara idiomas soportados ni análisis de sesgos.
- Reproducibilidad parcial: el checkpoint completo con momentos del optimizador (≈351 GiB) no se publica; solo se puede reconstruir el estado sin ellos. No se incluye fichero de checksums, aunque el Hub almacena el sha256 de cada shard.
- Licencia: Apache 2.0 permite uso comercial, pero se aplica a un artefacto de investigación sin garantías de calidad ni soporte; conviene revisar también las condiciones del modelo base.
- Madurez: 7 descargas y 0 likes en el momento de la consulta, sin revisión externa ni resultados de terceros.
- Dependencia del arnés: las métricas solo son interpretables con Claude Code CLI 2.1.270 y las herramientas MCP del arnés de juego, con semilla de motor 0 y 40 decisiones por episodio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ziyan98/E2K-cd82-Qwen3.8-27B-sft_joint-claimform-iter7
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Referencias citadas en la model card sin URL en la información disponible: slime v0.3.2, Megatron-LM, Dr.GRPO, ARC-AGI-3, Isambard-AI, `knowledge_learning.loop.arc_mcp`, `convert_torch_dist_to_hf_lowmem.py`, `convert_hf_to_torch_dist.py`, `rl_config_claimform.json`, `E2K_CONVERSION.json`, `E2K_VERIFY.json`.
- No se han encontrado enlaces a papers, blogs, repositorios de código ni demos en la información proporcionada.
