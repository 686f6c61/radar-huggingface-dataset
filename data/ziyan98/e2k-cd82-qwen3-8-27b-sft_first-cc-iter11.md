# ziyan98/E2K-cd82-Qwen3.8-27B-sft_first-cc-iter11

## Resumen

E2K-cd82-Qwen3.8-27B-sft_first-cc-iter11 es un checkpoint de investigación publicado por el usuario ziyan98 (HuggingFace), obtenido a partir del modelo base Qwen/Qwen3.8-27B (arquitectura Qwen3.5, clase `Qwen3_5ForConditionalGeneration`, 27.781.427.952 parámetros). No es un modelo afinado para uso general: es una iteración (la número 11) del experimento E2K de «internalización de conocimiento», en el que se intenta escribir en los pesos, mediante filas supervisadas y después RL, conocimiento verificado extraído del propio juego del modelo en el entorno ARC-AGI-3, concretamente en la partida `cd82-fb555c5d`.

El pipeline fue: un calentamiento SFT con 391 filas de QA declarativo construidas a partir de un conjunto de 888 átomos de conocimiento, seguido de RL con el estimador Dr.GRPO (variante de GRPO sin normalización de ventajas y con pérdida por token) a través de un harness basado en Claude Code CLI que maneja las herramientas MCP `look` / `act` / `status`. La infraestructura fue slime v0.3.2 sobre Megatron-LM (TP4 × PP4) con 16 motores de rollout SGLang, en 4 nodos GH200 de Isambard-AI, con learning rate 5e-6, precisión bf16 y backend flash-attn 2.8.3.

Su relevancia es metodológica, no de rendimiento: el autor documenta explícitamente que las filas conversacionales no se transfieren al juego y que este brazo fue superado por otros brazos del mismo estudio. Los resultados de juego de esta iteración son nulos (tasa de niveles completados 0,000 en todos los rollouts registrados), por lo que debe tratarse como un artefacto de reproducibilidad y como línea base negativa, no como un modelo apto para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (clase `Qwen3_5ForConditionalGeneration`; tag `qwen3_5`), con torre visual y cabeza de predicción multi-token (MTP) heredadas del modelo base |
| Parámetros totales | 27.781.427.952 (27,78 B), según safetensors |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (la model card no la especifica; es la del modelo base Qwen3.8-27B) |
| Tipos de cuantización | Solo se publican pesos en bf16; no hay versiones GGUF, GPTQ, AWQ ni similar en el repositorio |
| Idiomas soportados | No disponible (la model card no detalla idiomas; se heredan los del modelo base, sin evaluación específica) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en bf16, 1199 tensores con la misma forma que el modelo base; tamaño del repositorio 55,6 GB |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.8-27B: un transformer denso de 27,78 B de parámetros con torre visual (`model.visual.*`) y cabeza MTP (`mtp.*`). El entrenamiento se aplicó únicamente sobre la pila de texto (`model.language_model.*` y `lm_head`), que corresponde al estado entrenado en Megatron; la torre visual y la cabeza MTP nunca formaron parte del modelo en Megatron y se copiaron sin cambios desde el checkpoint base. Por tanto, aunque la pipeline declarada sea `image-text-to-text`, el actor no vio ninguna imagen durante el entrenamiento y las capacidades de visión son exactamente las del modelo original, no las de este ajuste.

El entrenamiento constó de dos fases: primero SFT con 391 filas de QA declarativo derivadas de un conjunto de conocimiento de 888 átomos (`sft_data.jsonl`), y después RL con Dr.GRPO (`--advantage-estimator grpo --no-normalize-advantages --disable-grpo-std-normalization --calculate-per-token-loss`), con una muestra de entrenamiento por llamada al LLM, batch global 4 y 8 pasos de optimizador por rollout de 32 episodios. El prompt de RL nunca contiene el conocimiento: la hipótesis es que este debe residir en los pesos. El entorno fue una única partida de ARC-AGI-3 (`cd82-fb555c5d`), con semilla de motor 0, niveles 1 a 4 con tope de un nivel y retorno modelado sobre los niveles completados. La conversión de Megatron torch_dist a HF se hizo con el conversor de slime, verificado tensor a tensor contra el checkpoint base (`E2K_VERIFY.json`, `SHA256SUMS`).

## Capacidades

- Generación de texto conversacional y razonamiento en modo thinking, heredados del modelo base (la model card indica que el modo thinking y la plantilla de chat no cambian).
- Capacidad multimodal de entrada imagen-texto a nivel de arquitectura (torre visual intacta), si bien no fue entrenada ni evaluada en este checkpoint.
- Uso de herramientas y agentes: el modelo fue entrenado y evaluado como actor dentro de un harness de Claude Code CLI que invoca herramientas MCP (`look`, `act`, `status`) en episodios multi-paso.
- Internalización de conocimiento: el objetivo del experimento es que el conocimiento verificado quede escrito en los pesos y no dependa de estar en el prompt.
- Compatibilidad de despliegue con vLLM y SGLang, además de `transformers`, según indica el autor.
- Capacidades multilingües: no disponibles como dato verificado en la información proporcionada.
- No se documentan capacidades específicas de código, matemáticas ni audio evaluadas para este checkpoint.

## Casos de uso

- Reproducibilidad de experimentos de internalización de conocimiento: sirve para reconstruir el estado de entrenamiento (menos los momentos del optimizador) con `convert_hf_to_torch_dist.py` de slime, usando `megatron/args.json` y `common.pt`, y comparar contra los demás brazos del estudio.
- Línea base negativa en investigación de RL sobre agentes: con tasa de acierto 0,000 y retorno modelado de -0,050, es el punto de referencia frente al que medir los brazos IDD, act-ctrl y arm C del mismo proyecto.
- Estudio de la transferencia SFT a RL: el autor documenta que las filas de chat no se transfieren al juego, de modo que este checkpoint permite analizar por qué un calentamiento declarativo no altera la política de actuación.
- Validación de pipelines de conversión Megatron-LM a HuggingFace: los ficheros de verificación (`E2K_VERIFY.json`, `SHA256SUMS`, `E2K_CONVERSION.json`) permiten comprobar la identidad bit a bit de los tensores copiados y la correspondencia de formas y dtypes.
- Evaluación de harness de agentes en entornos de juego: útil para probar la integración de herramientas MCP (`look`/`act`/`status`), el bucle de episodios y el cálculo de retorno modelado antes de aplicar RL real.
- Comparaciones A/B controladas con el modelo base: al mantener tokenizador, plantilla de chat, configuración de generación y procesador del original, permite aislar el efecto del ajuste en pruebas de inferencia de solo texto.
- Despliegue interno como modelo de texto de 27,78 B cuando se necesita un checkpoint congelado con comportamiento próximo al base para pruebas de carga de infraestructura (vLLM/SGLang), sin expectativas de mejora funcional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni similares) en la información disponible. El autor solo reporta métricas de juego por rollout en ARC-AGI-3 (partida `cd82-fb555c5d`), extraídas de los logs del job:

| Job | Rollout | Tasa de niveles | Retorno modelado | Cambio de paso | Pasos sin acción (no-op) |
|---|---:|---:|---:|---:|---:|
| 6531143 | 4 | 0,000 | -0,050 | 0,000 | 1,000 |
| 6531143 | 5 | 0,000 | -0,050 | 0,000 | 1,000 |
| 6531143 | 6 | 0,000 | -0,050 | 0,000 | 1,000 |
| 6531143 | 7 | 0,000 | -0,050 | 0,000 | 1,000 |
| 6531143 | 8 | 0,000 | -0,050 | 0,000 | 1,000 |
| 6531143 | 9 | 0,000 | -0,050 | 0,000 | 1,000 |
| 6531143 | 10 | 0,000 | -0,050 | 0,000 | 1,000 |
| 6531143 | 11 | 0,000 | -0,050 | 0,000 | 1,000 |
| 6529938 | 12 | 0,000 | -0,052 | 0,000 | 0,943 |
| 6531143 | 12 | 0,000 | -0,050 | 0,000 | 1,000 |
| 6529938 | 13 | 0,000 | -0,050 | 0,000 | 1,000 |
| 6531143 | 13 | 0,000 | -0,050 | 0,000 | 1,000 |
| 6531143 | 14 | 0,000 | -0,050 | 0,000 | 1,000 |
| 6531143 | 15 | 0,000 | -0,050 | 0,000 | 1,000 |

El propio autor indica que el ruido entre rollouts de un mismo brazo es de aproximadamente 0,05 de retorno modelado, es decir, del mismo orden que la diferencia entre brazos. La columna de pasos sin acción a 1,000 en casi todos los rollouts describe una política degenerada que no altera el estado del juego.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 55,6 GB solo para pesos, más caché KV (no cuantificada en la información disponible). No cabe en una GPU de 24 GB ni de 48 GB en bf16.
- GPU recomendadas: A100 80 GB, H100 80 GB o GH200 (el entrenamiento se hizo en 4 nodos GH200 de Isambard-AI). Para servir en bf16 hace falta al menos una GPU de 80 GB o particionado por tensor en varias.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) en bf16; requeriría cuantización posterior por parte del usuario (no se publican versiones cuantizadas) o tensor parallel con 4 × RTX 4090 como mínimo estimado.
- Opciones de despliegue: `transformers` con `Qwen3_5ForConditionalGeneration` y `AutoProcessor` (`dtype="bfloat16"`, `device_map="auto"`); vLLM y SGLang cargan el modelo igual que el base. No hay GGUF publicado, por lo que llama.cpp u Ollama requerirían conversión propia.
- Almacenamiento: 55,6 GB para el repositorio; el checkpoint completo con estado del optimizador en Isambard-AI ocupa aproximadamente 351 GB.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| E2K-cd82-Qwen3.8-27B-sft_first-cc-iter11 | 27,78 B (denso) | No disponible | 0,000 de tasa de niveles en ARC-AGI-3; retorno -0,050 | apache-2.0 | Pesos bf16 en HF; 0 descargas, 0 likes |
| Qwen/Qwen3.8-27B (modelo base) | 27,78 B (denso) | No disponible en esta información | No evaluado en ARC-AGI-3 en la información disponible | apache-2.0 | Modelo público de referencia |
| Brazos posteriores del mismo estudio (IDD, act-ctrl, arm C) | 27,78 B (parten del mismo base) | No disponible | Sustituyen a este brazo según el autor, tras el análisis de recitado | apache-2.0 | Listados en `checkpoints/checkpoints.md` del dataset de RL |

No se dispone de datos de benchmarks comunes que permitan comparar con alternativas de otros autores de tamaño similar; indicarlo como no disponible.

## Limitaciones y advertencias

- No es una mejora de propósito general: el autor lo declara explícitamente; fue entrenado en una sola partida y evaluado en rollouts de esa misma partida.
- Rendimiento nulo en la tarea objetivo: tasa de niveles completados 0,000 y política degenerada con proporción de pasos sin acción de 1,000 en la práctica totalidad de los rollouts.
- Las diferencias entre brazos del estudio son de centésimas de retorno modelado, dentro del ruido de unos 0,05, por lo que no debe interpretarse ninguna ventaja de este checkpoint.
- Brazo superado: el autor indica que las filas de chat (SFT declarativo) no se transfieren al juego y que este brazo fue reemplazado por los brazos basados en filas de harness.
- Aunque la pipeline es `image-text-to-text`, el entrenamiento fue solo de texto; la torre visual y la cabeza MTP están copiadas sin cambios y no se evaluaron.
- Riesgo de alucinación y sesgos: los heredados del modelo base Qwen3.8-27B; no se documenta ninguna mitigación adicional en este checkpoint.
- Idiomas y longitud de contexto: no verificados en la información disponible; no asumir cobertura multilingüe ni ventanas concretas sin comprobarlas contra el modelo base.
- Licencia apache-2.0: permite uso comercial según la licencia, pero el propio autor desaconseja tratarlo como modelo de producción; úsese como artefacto de investigación.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin revisión comunitaria.
- Reproducibilidad parcial: el estado del optimizador (aproximadamente 351 GB) no está en HuggingFace, solo en Isambard-AI; con lo publicado se puede reconstruir el estado de entrenamiento salvo los momentos del optimizador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ziyan98/E2K-cd82-Qwen3.8-27B-sft_first-cc-iter11
- Dataset de RL asociado: repositorio `ziyan98/E2K-cd82-rl-internalization` (la URL aparece truncada en la model card, que acaba en «htt»; no se dispone del enlace completo en la información proporcionada)
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Ficheros de procedencia citados en el repositorio: `E2K_CONVERSION.json`, `E2K_VERIFY.json`, `SHA256SUMS`, `megatron/args.json`, `megatron/common.pt`, `megatron/latest_checkpointed_iteration.txt`, `global_dataset_state_dict_<N>.pt`, `sft_data.jsonl`
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
