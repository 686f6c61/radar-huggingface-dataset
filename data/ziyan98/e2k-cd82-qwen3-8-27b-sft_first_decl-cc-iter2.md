# ziyan98/E2K-cd82-Qwen3.8-27B-sft_first_decl-cc-iter2

## Resumen

E2K-cd82-Qwen3.8-27B-sft_first_decl-cc-iter2 es un checkpoint de investigación publicado por Ziyan Wang (King's College London) dentro del experimento E2K de "internalización de conocimiento". No es un ajuste de propósito general de Qwen3.8-27B: es la iteración 2 de la variante `sft_first_decl-cc` (trial 1), entrenada exclusivamente con filas de chat declarativas derivadas de un conjunto de 888 átomos de conocimiento sobre el juego `cd82-fb555c5d` de ARC-AGI-3, y evaluada únicamente en rollouts de 32 episodios de ese mismo juego.

El objetivo del estudio es comprobar si el conocimiento verificado extraído de la propia partida de un modelo puede escribirse en sus pesos mediante supervisión y mejorar después con RL sobre episodios reales. En este caso el resultado fue negativo: la política aprendió a enunciar un hecho como respuesta visible y cerrar el turno, lo que colapsó su comportamiento de juego en el primer rollout de RL, hasta el punto de que el guardián de colapso detuvo la ejecución.

Arquitectura y tamaño: se trata de un finetune del modelo base multimodal Qwen3.8-27B, con 27.781.427.952 parámetros totales en safetensors bf16. El entrenamiento fue solo de texto y afectó únicamente a la pila de lenguaje (`model.language_model.*` y `lm_head`); la torre visual y la cabeza de predicción multi-token se copian sin cambios del checkpoint base. Su interés es metodológico (reproducibilidad del pipeline Megatron-LM → HF y estudio del colapso por sobreajuste a filas declarativas), no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal tipo Qwen3.5 (`Qwen3_5ForConditionalGeneration`), con torre visual y cabeza de predicción multi-token (MTP); detalles internos de capas y atención no disponibles |
| Parametros totales | 27.781.427.952 (27,8 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; solo se publican pesos bf16 safetensors (no hay GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | no disponible (el modelo base es multilingüe, pero la model card no lista idiomas) |
| Licencia | Apache-2.0 (heredada de Qwen3.8-27B) |
| Formato de pesos | safetensors bf16, 1199 tensores con mismos nombres y formas que el base; repo de 55,6 GB |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.8-27B`, un transformer multimodal con torre visual (`model.visual.*`), pila de lenguaje (`model.language_model.*`), `lm_head` y cabeza MTP (`mtp.*`). En este checkpoint solo se entrenó la parte de texto: la torre visual y la MTP nunca formaron parte del modelo en Megatron y se copiaron intactas desde el base, por lo que la verificación de identidad bit a bit aplica a los tensores copiados y la política nunca vio una imagen. La conversión de Megatron torch_dist a HF se hizo con el conversor de slime (`megatron_to_hf.convert_to_hf`), con verificación de forma y dtype de todos los tensores y comparación contra el base en `E2K_VERIFY.json`.

Datos y esquema de entrenamiento: las filas de SFT son filas de chat declarativas construidas a partir de un conjunto de conocimiento de 888 átomos (formatos qa, rule y sentence, con aperturas de *thinking* variadas y final de texto donde la respuesta es la réplica visible), mezcladas con filas ancla del modelo base con ratio 1,0 (1.810 filas de chat + 303 anclas, 896 filas de chat por rollout de SFT). El calendario consistió en 4 rollouts solo de SFT (0–3) con reinicio de Adam, y RL a partir del rollout 4; el guardián de colapso detuvo la ejecución en el rollout 4 de RL al registrarse un 43,8 % de episodios con una sola llamada sin acción. La pila de RL es Dr.GRPO (`--advantage-estimator grpo --no-normalize-advantages --disable-grpo-std-normalization --calculate-per-token-loss`), con una muestra de entrenamiento por llamada al LLM, batch global 4, 8 pasos de optimizador por rollout de 32 episodios, lr 5e-6, bf16 y backend flash-attn 2.8.3, sobre slime v0.3.2 (Megatron-LM TP4 × PP4, 16 motores de rollout SGLang con tp=1) en 4 nodos GH200 de Isambard-AI. El prompt de RL nunca contiene conocimiento. El arnés de juego es Claude Code CLI 2.1.270 manejando las herramientas MCP `look`/`act`/`status` de `knowledge_learning.loop.arc_mcp` (semilla 0, niveles 1–4 con tope de un nivel, retorno modelado sobre limpiezas de nivel).

## Capacidades

- Generación de texto conversacional en formato chat, con la plantilla y el modo *thinking* del modelo base sin modificar.
- Enunciación declarativa de hechos del conjunto de conocimiento del juego `cd82-fb555c5d` (formas qa, rule, sentence) como respuesta visible, que es precisamente la habilidad reforzada por las filas de SFT.
- Interacción con herramientas vía MCP (`look`, `act`, `status`) dentro del arnés de ARC-AGI-3, aunque el checkpoint muestra el fallo de cierre de turno descrito.
- Capacidad multimodal heredada del base (torre visual y procesador intactos), sin ningún entrenamiento ni evaluación con imágenes en este checkpoint.
- Capacidad de tool calling y de razonamiento multi-paso: no evaluada de forma independiente en este checkpoint; la model card no aporta datos al respecto.
- Capacidades multilingües: no documentadas para este checkpoint (dependen del base, sin evaluación publicada).

## Casos de uso

- Reproducción del experimento E2K: cargar el checkpoint con `Qwen3_5ForConditionalGeneration` y repetir los rollouts de 32 episodios sobre `cd82-fb555c5d` para contrastar la métrica de retorno modelado frente a las otras ramas del estudio.
- Estudio del colapso por sobreajuste a filas declarativas: el checkpoint es el material de partida para analizar por qué la política pasa de jugar a responder un hecho y cerrar el turno, y para diseñar formatos de fila que eviten ese atajo.
- Auditoría de conversión Megatron → HF: servir como referencia para validar `convert_torch_dist_to_hf_lowmem.py`, ya que el mismo conversor reproduce bit a bit los safetensors del base y aquí se incluyen `E2K_VERIFY.json` y `SHA256SUMS`.
- Reanudación del entrenamiento: el directorio `megatron/` contiene `args.json`, `common.pt` y el cursor `global_dataset_state_dict_<N>.pt`, lo que permite reconstruir el estado (sin momentos del optimizador) con `convert_hf_to_torch_dist.py` de slime.
- Punto de partida para nuevas iteraciones de internalización de conocimiento: sirve como inicialización para probar otras mezclas de filas, ratios de anclas u objetivos de RL sobre el mismo juego.
- Docencia y divulgación sobre RL aplicado a agentes: el par checkpoint + dataset de episodios (`E2K-cd82-rl-internalization`) permite explicar con datos reales un caso de resultado negativo y el funcionamiento de un guardián de colapso.
- Evaluación del arnés basado en MCP: validar el comportamiento de `knowledge_learning.loop.arc_mcp` con Claude Code CLI frente a una política que responde en texto en lugar de actuar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica estándar, y advierte que las diferencias entre ramas del estudio son de centésimas de retorno modelado.

Únicos datos de rendimiento reportados (métricas de juego, no benchmarks de propósito general):

| Metrica | Valor |
|---|---|
| Rollout de parada | RL rollout 4 (guardián de colapso) |
| Episodios con una sola llamada sin acción | 43,8 % |
| Ruido entre rollouts de una misma rama | ~0,05 de retorno modelado |
| Líneas de métricas de juego en logs de Slurm | no disponibles para esta ejecución (ver `wandb_export` del dataset) |

## Requisitos de hardware

- VRAM para inferencia en bf16: los pesos ocupan aproximadamente 55,6 GB, por lo que se necesita del orden de 65–75 GB contando caché KV y overhead (estimación del editor, no dato de la model card).
- GPU recomendadas: una A100 80 GB o H100 80 GB para bf16; GH200 es el hardware usado en entrenamiento (4 nodos, TP4 × PP4). En consumer, no cabe en una sola GPU de 24 GB en bf16.
- Cuantización: no hay GGUF ni cuantizaciones publicadas; para caber en 2 × RTX 4090 (48 GB) habría que cuantizar a 8 bits o usar *offload*, y en 4 bits (≈16–18 GB, estimación) podría caber en una RTX 4090, pero requeriría convertir los pesos por cuenta propia.
- Opciones de despliegue: `transformers` (ejemplo de carga en la model card), vLLM y SGLang (la model card indica que carga como el modelo base). llama.cpp/Ollama no están soportados de serie al no existir pesos GGUF.
- Almacenamiento: 55,6 GB para el repo; el checkpoint completo con estado del optimizador ocupa ≈351 GB y permanece en Isambard-AI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| E2K-cd82-...-sft_first_decl-cc-iter2 | 27,8 B | no disponible | sin benchmarks; colapso de juego en RL rollout 4 | Apache-2.0 | público en HF, 0 descargas |
| Qwen/Qwen3.8-27B (base) | 27,8 B | no disponible | sin datos en la informacion disponible | Apache-2.0 | público en HF |
| Otras ramas del estudio E2K | 27,8 B | no disponible | métricas comparativas no disponibles | Apache-2.0 | listadas en `checkpoints/checkpoints.md` del dataset, métricas no disponibles aquí |

No se dispone de datos de contexto, benchmarks ni especificaciones de modelos de terceros en la información proporcionada, por lo que no se incluye una comparación con alternativas de otras familias.

## Limitaciones y advertencias

- No es una mejora de propósito general de Qwen3.8-27B: fue entrenado con un solo juego de ARC-AGI-3 y evaluado en rollouts de ese mismo juego.
- Resultado negativo documentado: la política aprendió a enunciar un hecho y cerrar el turno, con un 43,8 % de episodios de una sola llamada sin acción en el primer rollout de RL, lo que activó el guardián de colapso.
- Riesgo alto de respuestas degeneradas fuera del dominio del conjunto de conocimiento: la habilidad reforzada (responder y terminar) puede anteponerse a la actuación multi-paso.
- Riesgo de alucinación no evaluado; las diferencias entre ramas del estudio son de centésimas de retorno modelado, dentro del ruido de ~0,05.
- La torre visual está presente pero nunca se entrenó ni evaluó con imágenes: no debe asumirse calidad multimodal.
- Modo *thinking* y plantilla de chat sin cambios, pero sin evaluación independiente de razonamiento o tool calling.
- Idiomas soportados no documentados para este checkpoint.
- Licencia Apache-2.0 heredada del base, sin restricciones adicionales indicadas por el autor; conviene verificar igualmente los términos del modelo base para uso comercial.
- Los datos de métricas de juego de esta ejecución no están en los logs de Slurm; hay que consultar el `wandb_export` del dataset para auditar el resultado.
- Publicado con 0 descargas y 0 likes: no hay validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ziyan98/E2K-cd82-Qwen3.8-27B-sft_first_decl-cc-iter2
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de episodios y métricas de la ejecución: https://huggingface.co/datasets/ziyan98/E2K-cd82-rl-internalization
- Dataset del conjunto de conocimiento: https://huggingface.co/datasets/ziyan98/E2K-cd82-harness-knowledge
- Dataset E2K-40: https://huggingface.co/datasets/ziyan98/E2K-40
- Código: repositorio `ziyan-wang98/knowledge-learning-e2k` (rutas `src/knowledge_learning/rl/` y `docs/RL_KNOWLEDGE_SFT.md`); no se proporciona URL directa en la información disponible.
