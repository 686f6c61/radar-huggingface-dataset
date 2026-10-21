# ziyan98/E2K-cd82-Qwen3.8-27B-sft_joint-claimform-iter3

## Resumen

E2K-cd82-Qwen3.8-27B-sft_joint-claimform-iter3 es un checkpoint de investigación publicado por el usuario ziyan98 en HuggingFace, obtenido a partir de Qwen/Qwen3.8-27B (27.781.427.952 parámetros reales según safetensors) tras aplicar el experimento de internalización de conocimiento E2K sobre el juego `cd82-fb555c5d` de ARC-AGI-3. No es un ajuste de propósito general: es la iteración 3 de Megatron de la rama `sft_joint-claimform`, una rama que el propio autor marca como colapsada y abandonada. El objetivo del estudio es determinar si el conocimiento verificado extraído de las propias partidas del modelo puede escribirse en sus pesos mediante filas supervisadas y mejorarse después con RL sobre episodios reales de múltiples pasos.

La relevancia es metodológica, no de rendimiento: documenta con detalle la pila de entrenamiento (slime v0.3.2 con Megatron-LM en TP4 × PP4, 16 motores de rollout SGLang con tp=1, Dr.GRPO, 4 nodos GH200 de Isambard-AI) y publica la traza completa de conversión de torch_dist a safetensors con verificación tensor a tensor contra el checkpoint base. El modelo conserva la arquitectura multimodal del base (torre visual y cabeza de predicción multi-token), pero el entrenamiento fue exclusivamente de texto: el actor nunca vio una imagen.

El resultado medido es negativo: en las ocho primeras rollouts de RL registradas (4 a 11) la tasa de niveles superados es 0,000 y el retorno con shaping se mantiene entre -2,764 y -3,109, con un ruido entre rollouts de aproximadamente 0,05. Ninguna rama del estudio supera más de 2 de 32 episodios, por lo que el autor advierte explícitamente que las diferencias entre brazos están dentro de unas pocas décimas de retorno. Es útil como referencia reproducible y como línea base negativa, no como modelo desplegable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de la familia Qwen3.5 (clase `Qwen3_5ForConditionalGeneration`): pila de texto + torre visual `model.visual.*` + cabeza de predicción multi-token `mtp.*` |
| Parámetros totales | 27.781.427.952 (dato real de safetensors) |
| Parámetros activos | No aplica / no disponible: la información no documenta estructura MoE |
| Longitud de contexto | No disponible (se hereda la configuración del modelo base, no especificada en la información) |
| Tipos de cuantización | Solo bf16 en safetensors; no se publican GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | No disponibles (la model card no declara lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` en bf16, 1199 tensores con los mismos nombres y formas que el checkpoint base; conversión desde Megatron torch_dist |
| Pipeline declarado | `image-text-to-text` |
| Modelo base | Qwen/Qwen3.8-27B (fine-tuning) |
| Tamaño del repositorio | 55,6 GB |
| Descargas / likes | 9 / 0 |
| Fecha de creación / actualización | 2026-10-21 / 2026-10-21 |
| Biblioteca | transformers |

## Arquitectura y entrenamiento

La arquitectura replica exactamente la del checkpoint base Qwen3.8-27B: una pila de texto (`model.language_model.*` y `lm_head`, 851 tensores), una torre visual (`model.visual.*`) y una cabeza de predicción multi-token (`mtp.*`). Solo la pila de texto corresponde al estado entrenado en Megatron; los tensores de visión y MTP se copiaron sin modificar y el autor verificó su identidad bit a bit. La conversión de Megatron torch_dist a safetensors se hizo con el mapeo `megatron_to_hf.convert_to_hf` de slime, por streaming y en trozos (`convert_torch_dist_to_hf_lowmem.py`), y el mismo conversor reproduce el checkpoint base original bit a bit; `E2K_VERIFY.json` contiene la comparación tensor a tensor. El repositorio conserva el estado de la ejecución en `megatron/` (`common.pt` con argumentos y estado del optimizador, `args.json` legible, `latest_checkpointed_iteration.txt` y el cursor de datos `global_dataset_state_dict_<N>.pt`), lo que permite reconstruir el estado de entrenamiento (sin momentos del optimizador) con `convert_hf_to_torch_dist.py` de slime.

El entrenamiento combina SFT y RL. La fase supervisada usa 470 filas (391 de tipo qa y 79 de tipo statement) del conjunto claim-form de 391 afirmaciones, presentes en cada lote de RL. La fase de RL se ejecuta con Dr.GRPO (`--advantage-estimator grpo --disable-grpo-std-normalization --calculate-per-token-loss`, con `--normalize-advantages` en su valor por defecto, desactivado), un ejemplo de entrenamiento por llamada al modelo, lote global de 4 episodios (unos 200 ejemplos por paso de optimizador), 8 pasos de optimizador por rollout de 32 episodios, lr 5e-6, precisión bf16 y backend flash-attn 2.8.3. Los momentos de Adam se reinician en la frontera SFT → RL a partir del 2026-09-17. El arnés de juego es Claude Code CLI 2.1.270 manejando las herramientas MCP `look` / `act` / `status` de `knowledge_learning.loop.arc_mcp` (semilla del motor 0, cada episodio empieza en el nivel 1 y encadena niveles hasta un máximo de cuatro, 40 decisiones por episodio, recompensa igual a niveles superados más un retorno con shaping; los niveles de test 5 y 6 nunca se juegan). El prompt de RL nunca contiene conocimiento explícito: la hipótesis a testar es que este se haya interiorizado en los pesos.

## Capacidades

- Generación de texto conversacional en formato chat: hereda plantilla de chat, tokenizador, configuración de generación y procesador del modelo base.
- Razonamiento multi-paso dentro de un episodio de agente: la política se entrenó para emitir decisiones sucesivas (hasta 40 por episodio) con llamadas a herramientas.
- Uso de herramientas vía MCP: las herramientas `look`, `act` y `status` del cliente de juego son el interfaz de acción sobre el que se entrenó.
- Internalización de conocimiento: el objeto del experimento es que conocimiento verificado previamente extraído quede escrito en los pesos y no dependa de aparecer en el prompt.
- Capacidad multimodal latente: conserva la torre visual del base, pero no fue entrenada en este run y el actor nunca procesó imágenes; no debe asumirse capacidad de visión funcional.
- Capacidades multilingües: no documentadas en la información disponible.
- Modo "thinking": la model card registra métricas de `think tokens p50` por rollout, aunque los valores de esta iteración aparecen vacíos en la tabla publicada.

## Casos de uso

- Estudio de internalización de conocimiento: sirve como punto de comparación (iteración 3 de una rama colapsada) frente a las demás iteraciones de la serie para medir si las filas supervisadas escriben conocimiento en los pesos; la serie completa está listada con la fase de cada iteración en `checkpoints/series.md` del dataset de RL.
- Reproducción de la pila de RL: el repositorio incluye `megatron/args.json`, el estado del scheduler y el cursor de datos, lo que permite reanudar o auditar la configuración exacta (TP4 × PP4, 16 motores SGLang, lr 5e-6) en clústeres con GH200.
- Validación de pipelines de conversión Megatron → HF: el par `E2K_VERIFY.json` + `convert_torch_dist_to_hf_lowmem.py` permite comprobar que un conversor reproduce bit a bit un checkpoint de referencia antes de aplicarlo a modelos propios.
- Línea base negativa para investigación en agentes sobre ARC-AGI-3: con tasa de éxito 0,000 y retorno en torno a -2,9 en ocho rollouts, es un punto de partida honesto contra el que medir mejoras de otras políticas.
- Pruebas de infraestructura de serving multimodal: al conservar la firma `Qwen3_5ForConditionalGeneration` y los mismos 1199 tensores que el base, sirve para validar despliegues con `device_map="auto"` o con motores tipo SGLang/vLLM antes de cargar el modelo de producción.
- Ablación de la frontera SFT → RL: el autor señala que la primera rollout tras un bloque solo-SFT la juega la política supervisada, de modo que este checkpoint permite aislar el efecto de las 470 filas frente al efecto del RL posterior.
- Docencia y divulgación: caso documentado de experimento fallido con trazabilidad completa (logs de job, export de W&B con la NLL de cada paso de SFT, métricas por rollout), útil para explicar cómo se reporta un resultado negativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Lo que sí se publica son las métricas de juego del run en ARC-AGI-3 (`cd82-fb555c5d`), por rollout:

| Job | Rollout | Tasa de niveles superados | Retorno con shaping | Proporción de pasos con cambio | Proporción de pasos sin efecto (no-op) |
|---|---:|---:|---:|---:|---:|
| 6503517 | 4 | 0,000 | -2,780 | 0,226 | 0,557 |
| 6503517 | 5 | 0,000 | -3,109 | 0,209 | 0,534 |
| 6503517 | 6 | 0,000 | -3,089 | 0,203 | 0,609 |
| 6503517 | 7 | 0,000 | -2,944 | 0,246 | 0,536 |
| 6503517 | 8 | 0,000 | -2,866 | 0,232 | 0,558 |
| 6503517 | 9 | 0,000 | -3,009 | 0,235 | 0,508 |
| 6503517 | 10 | 0,000 | -2,764 | 0,274 | 0,489 |
| 6503517 | 11 | 0,000 | -2,808 | 0,226 | 0,555 |

Contexto de lectura: el ruido entre rollouts de un mismo brazo es de aproximadamente 0,05 de retorno con shaping, ninguna rama del estudio supera más de 2 de 32 episodios y las columnas de tokens de pensamiento (p50), turnos recitados y turnos con referencia a fuente aparecen vacías para esta iteración. El autor describe el checkpoint como una rama colapsada y abandonada, por lo que estas cifras deben interpretarse como referencia de un estado intermedio, no como rendimiento final.

## Requisitos de hardware

- VRAM para inferencia en bf16: los pesos ocupan unos 55,6 GB, de modo que se necesita al menos una GPU de 80 GB para el modelo solo, más KV cache y activaciones; 2 × A100 80 GB o 1 × H100 80 GB son el mínimo razonable.
- Configuración usada en entrenamiento: 4 nodos GH200 de Isambard-AI con Megatron-LM en TP4 × PP4 y 16 motores de rollout SGLang a tp=1; el checkpoint completo con estado del optimizador ocupa aproximadamente 351 GiB (unos 377 GB) y permanece en Isambard-AI.
- GPU de consumo: no cabe en bf16 en ninguna tarjeta consumer. Con cuantización de 4 bits (no publicada, habría que generarla) los pesos bajarían a unos 14-16 GB y podría plantearse en una RTX 4090 de 24 GB o una RTX 3090, asumiendo pérdida de calidad y trabajo de conversión propio.
- Opciones de despliegue: `transformers` con `Qwen3_5ForConditionalGeneration.from_pretrained(..., dtype="bfloat16", device_map="auto")` y `AutoProcessor`; SGLang y vLLM son coherentes con la pila usada en el run (SGLang fue el motor de rollout); TGI no está documentado para esta arquitectura en la información disponible.
- llama.cpp / Ollama / GGUF: no hay artefactos publicados; requeriría convertir los safetensors por cuenta propia.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por decisión.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| E2K-cd82-Qwen3.8-27B-sft_joint-claimform-iter3 | 27,78 B | No disponible | SFT 470 filas + RL Dr.GRPO sobre un único juego de ARC-AGI-3 | Apache 2.0 | Público en HF, 9 descargas, 55,6 GB |
| Qwen/Qwen3.8-27B (base) | 27,78 B | No disponible en la información | Modelo base multimodal de propósito general | Apache 2.0 (según el campo `license` del derivado) | Público en HF |
| Iteraciones previas de la misma serie (`sft_joint-claimform` iter 1-2 y calentamientos solo-SFT) | 27,78 B | No disponible | Misma pila, distinta fase | Apache 2.0 | Repositorios separados listados en `checkpoints/series.md` del dataset de RL |
| Otras ramas del estudio E2K (`IDD`, `act-ctrl`, `-frozen-adam`) | 27,78 B | No disponible | Variantes de la misma pila | Apache 2.0 | Listadas en `checkpoints/series.md` |

No se han identificado en la información proporcionada otros modelos comparables de la misma categoría (checkpoints de internalización de conocimiento sobre ARC-AGI-3) distintos de las ramas del propio estudio.

## Limitaciones y advertencias

- No es una mejora de propósito general: fue entrenado sobre un único juego, evaluado con rollouts de 32 episodios de ese mismo juego, y las diferencias entre brazos están dentro de unas pocas décimas de retorno con un ruido de aproximadamente 0,05.
- Rendimiento medido nulo en los rollouts publicados: tasa de niveles superados 0,000 en las ocho rollouts de la tabla, y ninguna rama del estudio supera más de 2 de 32 episodios.
- Rama abandonada: el autor etiqueta esta ejecución como "superseded (collapsed)"; no debe tratarse como un estado recomendado ni como punto de partida para fine-tuning productivo.
- Riesgo de alucinación: no evaluado en la información disponible; el modelo no incluye ningún benchmark de fidelidad factual ni de calibración.
- Visión no funcional en la práctica: la torre visual se copió sin entrenar y el actor nunca vio una imagen, pese al pipeline declarado `image-text-to-text`. Cualquier uso de imagen es comportamiento del modelo base, no de este checkpoint.
- Idiomas no documentados: la model card no declara lista de idiomas, por lo que el soporte multilingüe no puede asumirse.
- Longitud de contexto no documentada: se desconoce la ventana efectiva; no planificar cargas de contexto largo sin verificarla contra la configuración del base.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero el estado real del modelo (rama colapsada sobre una tarea) hace desaconsejable cualquier despliegue en producción.
- Trazabilidad parcial: no se envía fichero de checksums propio (el Hub almacena el sha256 de cada shard); el estado del optimizador no está en el repositorio y reside en Isambard-AI, lo que impide reproducir el entrenamiento exacto solo con lo publicado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ziyan98/E2K-cd82-Qwen3.8-27B-sft_joint-claimform-iter3
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código ni demos adicionales.
- Referencias internas del repositorio (no enlazadas externamente): `megatron/args.json`, `megatron/common.pt`, `E2K_CONVERSION.json`, `E2K_VERIFY.json`, y en el dataset de RL los ficheros `knowledge-set/20260912-0920-final/rl_config_claimform.json`, `checkpoints/series.md`, `checkpoints/checkpoints.md`, `checkpoints/convert_torch_dist_to_hf_lowmem.py` y el export de W&B en `runs/sft_joint-claimform/wandb_export/*/history.jsonl`.
