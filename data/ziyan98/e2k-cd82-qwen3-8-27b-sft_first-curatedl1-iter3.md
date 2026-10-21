# ziyan98/E2K-cd82-Qwen3.8-27B-sft_first-curatedL1-iter3

## Resumen

E2K-cd82-Qwen3.8-27B-sft_first-curatedL1-iter3 es un checkpoint de investigación publicado por el usuario ziyan98 en HuggingFace, obtenido al aplicar el experimento de internalización de conocimiento E2K sobre el modelo base Qwen/Qwen3.8-27B. No se trata de una mejora de propósito general del modelo base: el entrenamiento se realizó sobre un único juego de ARC-AGI-3 (identificador `cd82-fb555c5d`), dentro de la ejecución `sft_first-curatedL1`, y corresponde a la iteración 3 del entrenamiento con Megatron-LM. El objetivo del estudio es determinar si el conocimiento verificado extraído de la propia partida del modelo puede escribirse en sus pesos mediante filas supervisadas y mejorarse después con aprendizaje por refuerzo sobre episodios reales de varios pasos.

El checkpoint tiene 27.781.427.952 parámetros (unos 27,78 mil millones) y se distribuye en safetensors bf16, con 1199 tensores y un tamaño de repositorio de 55,6 GB. La arquitectura declarada es `qwen3_5`, con pipeline `image-text-to-text`, aunque el entrenamiento fue exclusivamente de texto: la torre visual y la cabeza de predicción multi-token se copiaron sin modificar desde el checkpoint base y el actor nunca vio una imagen durante el entrenamiento.

Su relevancia es metodológica, no de rendimiento: documenta con gran detalle la pila de entrenamiento (slime v0.3.2, Megatron-LM TP4 × PP4, 16 motores de rollout SGLang, Dr.GRPO) y publica las condiciones exactas de reproducción. Los propios autores advierten de que las diferencias entre brazos del experimento están dentro del ruido (≈0,05 de retorno con forma) y de que ningún brazo supera más de 2 episodios de 32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer `qwen3_5` (familia Qwen3.8), pipeline `image-text-to-text`; no se detalla en la model card si la capa de lenguaje es densa o MoE |
| Parametros totales | 27.781.427.952 (≈27,78 mil millones), contados sobre safetensors |
| Parametros activos | no disponible (la model card no indica si la arquitectura es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; solo se publican pesos bf16 (no hay GGUF ni cuantizaciones de terceros en el repositorio) |
| Idiomas soportados | no disponible (el campo `languages` no está informado; el tag `conversational` es el único indicio) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors bf16 (1199 tensores, mismas formas que Qwen/Qwen3.8-27B); se conserva además el estado Megatron `torch_dist` en `megatron/` |
| Tamano del repositorio | 55,6 GB |
| Descargas / likes | 6 / 0 |
| Fecha de creacion | 2026-10-21 |
| Modelo base | Qwen/Qwen3.8-27B |

## Arquitectura y entrenamiento

El checkpoint conserva la arquitectura del modelo base Qwen3.8-27B (librería `transformers`, clase `Qwen3_5ForConditionalGeneration`). La conversión desde Megatron `torch_dist` a HuggingFace se hizo con el mapeo `megatron_to_hf.convert_to_hf` de slime, por trozos y en streaming (`convert_torch_dist_to_hf_lowmem.py`). Del total de 1199 tensores, 851 corresponden a la pila de texto (`model.language_model.*` y `lm_head`) y son el estado entrenado en Megatron, verificado tensor a tensor en forma y tipo. La torre visual (`model.visual.*`) y la cabeza de predicción multi-token (`mtp.*`) nunca formaron parte del modelo Megatron y se copiaron bit a bit desde el checkpoint base. Configuración, tokenizador, plantilla de chat, configuración de generación y configuración del procesador son también las del modelo base (`E2K_CONVERSION.json` lista los activos copiados).

El entrenamiento combina una fase supervisada con 44 filas (36 de preguntas y respuestas y 8 de tipo `statement`) derivadas de un conjunto revisado de 36 afirmaciones de nivel 1 (`sft_data.jsonl`), seguida de RL con Dr.GRPO sobre episodios reales. La pila es slime v0.3.2 con Megatron-LM en TP4 × PP4 y 16 motores de rollout SGLang con tp=1, sobre 4 nodos GH200 de Isambard-AI; backend flash-attn 2.8.3, precisión bf16, tasa de aprendizaje 5e-6, un ejemplo de entrenamiento por llamada al LLM, lote global de 4 episodios (unos 200 ejemplos por paso de optimizador) y 8 pasos de optimizador por cada rollout de 32 episodios. Los momentos de Adam se reinician en la frontera SFT → RL desde el 2026-09-17. El arnés de juego es Claude Code CLI 2.1.270 controlando las herramientas MCP `look` / `act` / `status` de `knowledge_learning.loop.arc_mcp`, con semilla de motor 0, episodios que arrancan en el nivel 1 y continúan al siguiente hasta cuatro niveles, 40 decisiones por episodio, recompensa igual a niveles superados más un retorno con forma, y niveles de test 5–6 que nunca se juegan. El prompt de RL nunca contiene conocimiento: la hipótesis que se prueba es precisamente la internalización en pesos.

## Capacidades

- Generación de texto conversacional multiturno, heredada del modelo base Qwen3.8-27B (el tag `conversational` está presente).
- Modo *thinking* y plantilla de chat sin cambios respecto al modelo base, según la model card.
- Entrada imagen-texto a nivel de pipeline (`image-text-to-text`) y torre visual presente en los pesos, pero sin entrenamiento ni evaluación con imágenes: el actor nunca vio una imagen.
- Ejecución de acciones en un entorno ARC-AGI-3 mediante herramientas MCP (`look`, `act`, `status`) a través de un arnés externo tipo Claude Code CLI.
- Razonamiento multi-paso dentro de un episodio: hasta 40 decisiones por episodio y hasta cuatro niveles consecutivos.
- Capacidad de *tool calling* indirecta: la interacción con el juego se realiza llamando a herramientas MCP, no mediante función nativa del modelo.
- No hay evidencia publicada de capacidades de código, matemáticas, agentes generales ni multilingüismo específicas de este checkpoint; deben asumirse las del modelo base, sin garantía.

## Casos de uso

- Reproducción del experimento E2K: cargar el checkpoint con la configuración de `megatron/args.json` y el cursor `global_dataset_state_dict_<N>.pt` para reconstruir el estado de entrenamiento (salvo los momentos del optimizador) y repetir la iteración 3.
- Estudio de internalización de conocimiento: comparar este checkpoint con las iteraciones SFT-only de la misma serie (listadas en `checkpoints/series.md` del dataset de RL) para medir si las 44 filas supervisadas escriben conocimiento en los pesos antes de que el RL lo explote.
- Línea base en experimentos de RL sobre entornos: usar el checkpoint como punto de partida o de comparación en estudios con Dr.GRPO sobre episodios multi-paso, aprovechando que el ruido entre rollouts (≈0,05 de retorno con forma) está caracterizado.
- Desarrollo y depuración de arneses de agente: sirve para probar integraciones MCP (`look`/`act`/`status`), bucles de decisión de 40 pasos y lógica de recompensa por niveles, con un modelo que responde de forma plausible en ese interfaz.
- Auditoría de olvido catastrófico: evaluar con tareas de texto estándar cuánto se degrada la pila de lenguaje de Qwen3.8-27B tras un ajuste fino con 44 filas y RL sobre un dominio estrecho.
- Docencia e ingeniería de infraestructura: el repositorio incluye la contabilidad completa de Megatron y el mapeo de conversión a HF, lo que lo convierte en material útil para explicar el flujo `torch_dist` → safetensors en slime.
- Análisis de eficiencia de datos: estudiar cuántas muestras supervisadas (44) y cuántos pasos de optimizador (8 por rollout) hacen falta para modificar el comportamiento en un juego concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay líneas de métricas de juego para esta ejecución en los logs de Slurm y remite al `wandb_export` del dataset de RL. La única evaluación descrita es la partida en ARC-AGI-3:

| Metrica | Valor |
|---|---|
| Entorno evaluado | ARC-AGI-3, juego `cd82-fb555c5d` |
| Protocolo | rollouts de 32 episodios, niveles 1–4, 40 decisiones por episodio, semilla de motor 0 |
| Episodios superados por brazo | ningun brazo supera más de 2 de 32 |
| Ruido entre rollouts de un mismo brazo | ≈0,05 de retorno con forma |
| Diferencia entre brazos | como máximo unas pocas décimas de retorno con forma |
| Métricas por rollout de esta ejecución | no disponibles en los logs |
| MMLU, HumanEval, GSM8K u otros | no disponibles |

## Requisitos de hardware

- VRAM para inferencia en bf16: unos 55,6 GB solo de pesos (27,78 mil millones de parámetros × 2 bytes); con caché KV y activaciones hay que prever por encima de 60–70 GB según longitud de contexto y lote.
- GPU recomendadas para bf16: A100 80 GB, H100 80 GB o GH200; en configuraciones de una sola GPU de 80 GB el modelo cabe con margen ajustado.
- No cabe en GPU de consumo con los pesos publicados: 24 GB (RTX 4090, 3090) o 48 GB quedan muy por debajo de los 55,6 GB en bf16, y no se publican GGUF ni cuantizaciones de 8 o 4 bits para reducir la huella.
- Despliegue: `transformers` con `Qwen3_5ForConditionalGeneration` y `device_map="auto"`; la model card indica que vLLM y SGLang lo cargan igual que el modelo base. llama.cpp, Ollama y TGI no están documentados para este checkpoint.
- Entrenamiento de referencia: 4 nodos GH200 de Isambard-AI, Megatron-LM TP4 × PP4 más 16 motores SGLang con tp=1; el checkpoint completo con estado del optimizador ocupa ≈351 GiB (≈377 GB).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| E2K-cd82-Qwen3.8-27B-sft_first-curatedL1-iter3 | 27,78 mil millones | no disponible | SFT (44 filas) + RL Dr.GRPO sobre un juego ARC-AGI-3 | apache-2.0 | safetensors bf16, 6 descargas |
| Qwen/Qwen3.8-27B (base) | 27,78 mil millones | no disponible | modelo base original | no indicada en la informacion disponible | safetensors en HuggingFace |
| Otras iteraciones de la serie E2K-cd82 | mismas formas de tensor (27,78 mil millones) | no disponible | fases SFT-only y RL del mismo estudio | apache-2.0 | un repositorio por iteración, listados en `checkpoints/series.md` |
| Alternativas de terceros del mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es interna al estudio: este checkpoint (iteración 3, fase RL del brazo `sft_first-curatedL1`) debe contrastarse con las iteraciones de calentamiento SFT-only de la misma serie y con los demás brazos del experimento (IDD, act-ctrl), no con modelos generalistas de 27B en benchmarks estándar.

## Limitaciones y advertencias

- No es una mejora de propósito general: la model card afirma explícitamente que el ajuste se hizo sobre un solo juego y se evaluó en rollouts de ese juego.
- Rendimiento casi indistinguible del azar en la tarea objetivo: ningún brazo supera más de 2 episodios de 32 y las diferencias entre brazos caen dentro del ruido (≈0,05 de retorno con forma).
- Sesgos: no hay información publicada sobre sesgos; al derivar de Qwen3.8-27B cabe esperar los del modelo base, pero no están documentados aquí.
- Riesgo de alucinación: no evaluado para este checkpoint; el ajuste con 44 filas sobre un dominio estrecho no ofrece ninguna garantía sobre la calibración del modelo en texto abierto.
- Limitaciones de idioma y contexto: la lista de idiomas no está informada y la longitud de contexto no se especifica; no hay evaluación multilingüe ni de contexto largo.
- Capacidad visual no validada: los tensores de visión se copiaron sin cambios y el entrenamiento fue solo de texto, por lo que no hay evidencia de que el pipeline `image-text-to-text` funcione correctamente tras el ajuste.
- Restricciones de licencia: apache-2.0 permite uso comercial y modificación, pero el modelo base Qwen/Qwen3.8-27B puede imponer condiciones adicionales que deben verificarse antes de un uso en producción.
- Caveats de producción: es un checkpoint de investigación con 6 descargas y sin benchmarks; no debe desplegarse en sistemas con usuarios reales. Además, el estado publicado no incluye los momentos del optimizador, por lo que la reproducción exacta del entrenamiento requiere el checkpoint original en Isambard-AI (≈377 GB).
- El repositorio de código enlazado aparece truncado en la model card (`ziyan-wang98/knowledge-learning-e2k`, con el texto cortado en `sr`), por lo que la ruta exacta del paquete debe confirmarse en el Hub.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ziyan98/E2K-cd82-Qwen3.8-27B-sft_first-curatedL1-iter3
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de RL del experimento (episodios, métricas, filas y log): https://huggingface.co/datasets/ziyan98/E2K-cd82-rl-internalization
- Dataset del conjunto de conocimiento: https://huggingface.co/datasets/ziyan98/E2K-cd82-harness-knowledge
- Dataset E2K-40: https://huggingface.co/datasets/ziyan98/E2K-40
- Código: `ziyan-wang98/knowledge-learning-e2k` (referencia truncada en la model card)
- No se han encontrado en la información disponible artículos, blogs ni demos adicionales.
