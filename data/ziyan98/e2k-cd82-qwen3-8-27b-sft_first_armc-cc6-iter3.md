# ziyan98/E2K-cd82-Qwen3.8-27B-sft_first_armc-cc6-iter3

## Resumen

E2K-cd82-Qwen3.8-27B-sft_first_armc-cc6-iter3 es un checkpoint de investigación derivado de Qwen/Qwen3.8-27B (27.781.427.952 parámetros) publicado por Ziyan Wang (King's College London) dentro del experimento E2K de «internalización de conocimiento». El objetivo del estudio es comprobar si el conocimiento verificado que un modelo extrae de su propia partida en un videojuego puede escribirse en sus pesos mediante filas supervisadas y, después, mejorarse con RL sobre episodios reales de varios pasos. El dominio concreto es el juego `cd82-fb555c5d` de ARC-AGI-3.

No se trata de una mejora de propósito general del modelo base: el entrenamiento se hizo sobre un único juego, la evaluación son rollouts de 32 episodios de ese mismo juego y las diferencias entre brazos experimentales son de centésimas en retorno modelado. Este checkpoint corresponde a la iteración 3 del brazo C (`sft_first_armc-cc6`), situada dentro del calentamiento de seis rollouts solo-SFT, es decir, antes de que arranque la fase de RL con Dr.GRPO.

Arquitectura y tamaño: se heredan íntegramente de Qwen3.8-27B, un modelo multimodal `Qwen3_5ForConditionalGeneration` con torre visual y cabeza de predicción multi-token, aunque el entrenamiento fue exclusivamente de texto. Pesos en bf16 safetensors (55,6 GB, 1199 tensores), licencia Apache-2.0. Su relevancia es metodológica: documenta con detalle inusual el pipeline completo (slime + Megatron-LM + SGLang, conversión bit a bit verificada) para estudiar internalización de conocimiento frente a recuperación en contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `Qwen3_5ForConditionalGeneration` (hereda la de Qwen3.8-27B); el entrenamiento solo toca la pila de texto (`model.language_model.*`, `lm_head`) |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | no disponible (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos bf16 safetensors (no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 (heredada de Qwen3.8-27B) |
| Formato de pesos | safetensors (bf16), 1199 tensores, 55,6 GB de repositorio; incluye `megatron/` con `common.pt`, `args.json`, `latest_checkpointed_iteration.txt` y `global_dataset_state_dict_<N>.pt` |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base sin modificaciones estructurales: pila de texto transformer más torre visual (`model.visual.*`) y cabeza de predicción multi-token (`mtp.*`). Solo la pila de texto y `lm_head` provienen del estado entrenado en Megatron; la torre visual y la cabeza MTP nunca formaron parte del modelo Megatron y se copian sin cambios desde el checkpoint base (el actor nunca vio una imagen). El conjunto de tensores y sus formas coinciden exactamente con Qwen/Qwen3.8-27B, y la conversión Megatron torch_dist → HF se hizo con `megatron_to_hf.convert_to_hf` de slime, verificada con `E2K_VERIFY.json` y `SHA256SUMS`.

El entrenamiento combina SFT y RL. Las filas SFT del brazo C son 1664 en total: 1162 filas «recite» con 1–3 frases de conocimiento alineadas al nivel, escritas al principio de *thinks* completos del modelo base, más 502 filas de replay simple; 832 filas por rollout SFT, con pesos de cita 1/8/32/32/32/32 sobre los tokens de conocimiento. El calendario arranca con 6 rollouts de calentamiento solo-SFT (0–5, sembrados desde la iteración 2 de `sft_first_armc-cc`) con reinicio de Adam, y a partir del rollout 6 se aplica Dr.GRPO sobre episodios reales. La iteración 3, por tanto, es la política tras el rollout SFT 3: no ha visto todavía RL. La pila es slime v0.3.2 con Megatron-LM en TP4 × PP4 y 16 motores de rollout SGLang a tp=1, sobre 4 nodos GH200 de Isambard-AI; hiperparámetros: estimador de ventaja GRPO sin normalización, pérdida por token, una muestra de entrenamiento por llamada al LLM, batch global 4, 8 pasos de optimizador por rollout de 32 episodios, lr 5e-6, bf16 y backend flash-attn 2.8.3. El *prompt* de RL nunca contiene conocimiento explícito: la hipótesis es que este reside en los pesos.

El arnés de juego es Claude Code CLI 2.1.270 manejando las herramientas MCP `look` / `act` / `status` de `knowledge_learning.loop.arc_mcp`, con semilla de motor 0 y niveles 1–4 con tope de un nivel, con retorno modelado adicional por superar niveles.

## Capacidades

- Generación de texto y razonamiento con modo *thinking*: la plantilla de chat y el modo de pensamiento son los del modelo base, sin cambios.
- Razonamiento multi-paso sobre episodios interactivos: el modelo fue entrenado para jugar mediante llamadas a herramientas (`look`, `act`, `status`) en un bucle agéntico.
- Internalización de conocimiento: capacidad bajo estudio, no garantizada; en el rollout 6 solo el 3,4 % de los turnos citaron conocimiento y el 23,3 % referenciaron fuentes.
- Aprendizaje por refuerzo aplicable en principio (Dr.GRPO), aunque este checkpoint concreto es solo-SFT.
- Procesamiento de imagen-texto: la arquitectura lo soporta por herencia del modelo base, pero el adaptador entrenado no recibió ninguna imagen, por lo que no hay mejora ni validación en ese dominio.
- Soporte multilingüe: no disponible (no se documentan idiomas).
- *Tool calling* / *function calling*: soportado por herencia del modelo base; su uso en este checkpoint está orientado a las tres herramientas MCP del arnés ARC.
- Contexto largo dentro de un episodio: los *thinks* observados tienen una mediana de 5101 tokens, lo que da una idea del régimen de generación, no un dato de ventana de contexto.

## Casos de uso

- Investigación sobre internalización de conocimiento: comparar este checkpoint solo-SFT (iteración 3) con iteraciones posteriores del mismo brazo para medir cuánto del conocimiento citado se escribe realmente en los pesos frente a cuánto se recupera del contexto.
- Reproducción de experimentos de RL agéntico: el repositorio incluye `megatron/args.json` y el cursor de datos `global_dataset_state_dict_<N>.pt`, lo que permite reconstruir el estado de entrenamiento (sin momentos del optimizador) con `convert_hf_to_torch_dist.py` de slime.
- Estudio de metodología de conversión de checkpoints: sirve como caso verificado de conversión Megatron torch_dist → HF con comprobación bit a bit contra el checkpoint base, útil para equipos que montan pipelines propios.
- Benchmarking de agentes en ARC-AGI-3: puede emplearse como política de referencia para el juego `cd82-fb555c5d` con el arnés MCP descrito (semilla 0, niveles 1–4), siempre con la advertencia de que el retorno modelado es muy bajo (0,009).
- Análisis de la brecha entre *decode* y política entrenada: la tasa de cambios de paso (0,053) y de no-ops (0,339) en el rollout 6 permiten estudiar fallos de bucle en agentes que emiten llamadas a herramientas.
- Docencia y divulgación técnica: ejemplo realista de calendario SFT→RL con reinicio de optimizador, batch pequeño (4) y 8 pasos por rollout, útil para explicar compromisos de coste y estabilidad.
- No se recomienda como asistente general, generador de código en producción ni motor de atención al cliente: no hay evaluación fuera del juego.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La única evaluación publicada son las métricas de juego del rollout 6, medidas sobre 32 episodios del juego `cd82-fb555c5d`:

| Metrica | Valor (rollout 6) |
|---|---|
| Tasa de nivel superado (*clear rate*) | 0,031 |
| Retorno modelado (*shaped return*) | 0,009 |
| Cambio de paso (*step change*) | 0,053 |
| No-op de paso (*step no-op*) | 0,339 |
| Tokens de pensamiento, p50 | 5101,000 |
| Turnos con recitación de conocimiento | 0,034 |
| Turnos con referencia a fuente | 0,233 |

El primer rollout de RL tras un bloque solo-SFT lo juega la política solo-SFT, de modo que mide el efecto de las filas por sí solas. El ruido entre rollouts de un mismo brazo es de aproximadamente 0,05 en retorno modelado, muy superior a la señal de 0,009, por lo que estas cifras no permiten afirmar mejoras.

## Requisitos de hardware

- VRAM para inferencia en bf16: los pesos ocupan unos 55,6 GB; con caché KV y *overhead* conviene contar 60–70 GB. Una H100 de 80 GB puede alojarlo en una sola GPU; una A100 de 80 GB también; con GPUs de 40–48 GB hace falta reparto en dos dispositivos.
- GPU consumer: no cabe en bf16 en ninguna tarjeta de 24 GB (RTX 4090, 3090). Requeriría cuantización propia (por ejemplo, conversión a GGUF Q4/Q5) que el autor no publica ni valida; a 4 bits los pesos rondarían 14–16 GB y podrían caber en una RTX 4090, con degradación no medida.
- Entrenamiento (referencia del autor): 4 nodos GH200 de Isambard-AI, Megatron-LM TP4 × PP4, 16 motores SGLang a tp=1. El checkpoint completo con estado del optimizador ocupa aproximadamente 351 GB.
- Despliegue: `transformers` con `Qwen3_5ForConditionalGeneration.from_pretrained(..., dtype="bfloat16", device_map="auto")`; vLLM y SGLang lo cargan igual que el modelo base. llama.cpp/Ollama no están soportados sin conversión propia a GGUF.
- Latencia y throughput: no disponibles. Como referencia indirecta, el *think* mediano del rollout 6 es de 5101 tokens por turno, lo que implica generaciones largas por acción.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| E2K-cd82-...-sft_first_armc-cc6-iter3 | 27,78 B | no disponible | SFT sobre 1664 filas del juego `cd82-fb555c5d` (iteración 3 de calentamiento, sin RL aún) | Apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen3.8-27B (base) | 27,78 B | no disponible | Modelo base multimodal de propósito general | Apache-2.0 (heredada) | HuggingFace |
| Otros brazos de la serie E2K-cd82 | 27,78 B | no disponible | Variantes de *harness*, conocimiento y semillas del mismo estudio | Apache-2.0 | Listados en `checkpoints/checkpoints.md` del dataset de RL |

No se dispone de datos para comparar con alternativas de la misma categoría (agentes para ARC-AGI-3 u otros checkpoints de internalización de conocimiento): no disponible.

## Limitaciones y advertencias

- Alcance mínimo: entrenado y evaluado solo en el juego `cd82-fb555c5d` de ARC-AGI-3. El propio autor indica explícitamente que no es una mejora de propósito general de Qwen3.8-27B.
- Señal no concluyente: la diferencia entre brazos es de centésimas en retorno modelado frente a un ruido entre rollouts de ~0,05; el retorno del rollout 6 (0,009) está por debajo de ese ruido.
- Este checkpoint es solo-SFT: la iteración 3 está dentro del calentamiento, antes del RL con Dr.GRPO, por lo que no refleja el resultado final del experimento.
- La torre visual y la cabeza MTP se copian sin entrenar: no hay garantía de calidad imagen-texto y el pipeline declarado (`image-text-to-text`) puede inducir a error sobre sus capacidades reales.
- Riesgo de alucinación: alto en el uso previsto, dado que la «recitación» de conocimiento solo aparece en el 3,4 % de los turnos y la referencia a fuentes en el 23,3 %; no hay evaluación de fidelidad factual.
- Sesgos: no documentados; tampoco se documentan idiomas soportados ni evaluación multilingüe.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero al derivar de Qwen3.8-27B conviene revisar los términos del modelo base; el checkpoint incluye artefactos de entrenamiento (`megatron/`, cursores de dataset) que no son pesos utilizables directamente en HF.
- No apto para producción como asistente, generador de código o atención al cliente: sin benchmarks generales, sin cuantizaciones publicadas y con 0 descargas (sin validación por terceros).
- El arnés depende de Claude Code CLI 2.1.270 y de un servidor MCP concreto; reproducir las métricas exige reconstruir ese entorno.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ziyan98/E2K-cd82-Qwen3.8-27B-sft_first_armc-cc6-iter3
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de RL del experimento (episodios, métricas, filas y log): https://huggingface.co/datasets/ziyan98/E2K-cd82-rl-internalization
- Dataset de conocimiento del arnés: https://huggingface.co/datasets/ziyan98/E2K-cd82-harness-knowledge
- Dataset E2K-40: https://huggingface.co/datasets/ziyan98/E2K-40
- Código: repositorio `ziyan-wang98/knowledge-learning-e2k`, rutas `src/knowledge_learning/rl/` y `docs/RL_KNOWLEDGE_SFT.md` (referenciado en la model card; no se proporciona URL directa)
- La búsqueda web realizada no devolvió enlaces técnicos relevantes sobre este modelo, el paper asociado ni demos.
