# ziyan98/E2K-cd82-Qwen3.8-27B-sft_first_decl-cc-iter0

## Resumen

E2K-cd82-Qwen3.8-27B-sft_first_decl-cc-iter0 es un checkpoint de investigación obtenido al aplicar un ajuste supervisado (SFT) sobre el modelo base Qwen/Qwen3.8-27B (arquitectura qwen3_5, 27.781.427.952 parámetros, multimodal image-text-to-text). Lo desarrolla Ziyan Wang (King's College London) dentro del experimento E2K (*experience-to-knowledge*), cuyo objetivo es comprobar si el conocimiento verificado extraído de las propias partidas de un modelo en un juego ARC-AGI-3 puede escribirse en sus pesos mediante filas de chat supervisadas y, después, mejorarse con aprendizaje por refuerzo sobre episodios reales de varios pasos.

Se trata de la iteración 0 de la ejecución `sft_first_decl-cc`, es decir, un checkpoint solo-SFT (sin pasos de RL efectivos) construido a partir de un conjunto de conocimiento de 888 átomos en formas qa / rule / sentence, con apertura de *thinking* variada y respuesta visible al final del turno, mezclado con 303 filas ancla del modelo base. El propio autor advierte que no es una mejora general del modelo: se entrenó con texto únicamente, sobre un solo juego (`cd82-fb555c5d`), y se evaluó con rollouts de 32 episodios, donde la política aprendió a declarar un hecho como respuesta visible y cerrar el turno, lo que colapsó su juego en el primer rollout de RL (el guardián de colapso detuvo la ejecución con un 43,8 % de episodios con una sola llamada sin acción).

Su relevancia es por tanto metodológica y negativa: documenta con trazabilidad completa (pesos, configuración de Megatron, plantillas, datos de episodios y exportación de W&B) un caso en el que la internalización de conocimiento por SFT declarativo degrada el comportamiento agéntico. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de la familia qwen3_5 (`Qwen3_5ForConditionalGeneration`: torre de visión + pila de lenguaje + cabeza de predicción multi-token), según la arquitectura del modelo base |
| Parametros totales | 27.781.427.952 (27,78 mil millones) |
| Parametros activos | No disponible (no se documenta configuración MoE en la información proporcionada) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en bf16 (safetensors). No se incluyen GGUF ni cuantizaciones de terceros |
| Idiomas soportados | No disponible (el campo de idiomas de la model card está vacío) |
| Licencia | Apache-2.0 (heredada de Qwen3.8-27B) |
| Formato de pesos | safetensors en bf16 (1199 tensores, mismos nombres y formas que el modelo base); repo de 55,6 GB |

## Arquitectura y entrenamiento

El checkpoint conserva el conjunto de tensores y las formas exactas del modelo base Qwen/Qwen3.8-27B (1199 tensores). La pila de texto (`model.language_model.*` y `lm_head`) corresponde al estado entrenado en Megatron-LM; la torre de visión (`model.visual.*`) y la cabeza de predicción multi-token (`mtp.*`) nunca formaron parte del modelo en Megatron y se copiaron sin cambios desde el checkpoint base, ya que el entrenamiento fue exclusivamente de texto y el actor nunca vio una imagen. La configuración, el tokenizador, la plantilla de chat, la configuración de generación y la del procesador son las del modelo base (`E2K_CONVERSION.json` lista los recursos copiados); el modo *thinking* y la plantilla de chat no se modificaron.

El entrenamiento parte del conjunto de conocimiento de 888 átomos y genera filas de chat declarativas (formas qa / rule / sentence, apertura de *thinking* variada, respuesta visible al final del turno) mezcladas con filas ancla del modelo base (ratio de ancla 1,0; 1.810 filas de chat + 303 anclas, 896 filas de chat por rollout de SFT). El programa fue de 4 rollouts solo-SFT (0–3) con reinicio de Adam, y RL a partir del rollout 4; el guardián de colapso detuvo la ejecución en el rollout 4 de RL. La pila es slime v0.3.2 con Megatron-LM en TP4 × PP4 y 16 motores de rollout SGLang a tp=1, sobre 4 nodos GH200 de Isambard-AI; el algoritmo es Dr.GRPO (`--advantage-estimator grpo --no-normalize-advantages --disable-grpo-std-normalization --calculate-per-token-loss`), con una muestra de entrenamiento por llamada al modelo, batch global 4, 8 pasos de optimizador por rollout de 32 episodios, lr 5e-6, bf16 y backend flash-attn 2.8.3. El *prompt* de RL nunca contiene conocimiento. El arnés de juego es Claude Code CLI 2.1.270 manejando las herramientas MCP `look` / `act` / `status` de `knowledge_learning.loop.arc_mcp` (semilla de motor 0, niveles 1–4 con tope de un nivel, retorno modelado sobre las superaciones de nivel). La conversión de Megatron torch_dist a HF se hizo con `megatron_to_hf.convert_to_hf` de slime, en streaming (`convert_torch_dist_to_hf_lowmem.py`), y `E2K_VERIFY.json` recoge la comparación con el modelo base.

## Capacidades

- Generación de texto conversacional en formato chat, con plantilla y modo *thinking* idénticos a los del modelo base Qwen3.8-27B.
- Enrutado multimodal image-text-to-text a nivel de arquitectura (torre de visión y procesador presentes), pero sin entrenamiento ni evaluación con imágenes: la torre visual está copiada sin cambios del modelo base.
- Declaración de hechos del conjunto de conocimiento E2K como respuesta visible (comportamiento reforzado por las filas SFT), incluyendo formatos qa, rule y sentence.
- Juego agéntico sobre ARC-AGI-3 a través de herramientas MCP (`look` / `act` / `status`), con razonamiento de varios pasos en el formato del arnés utilizado.
- Soporte de *tool calling* / function calling heredado del modelo base y del arnés MCP (no se documentan evaluaciones específicas en esta ficha).
- Capacidades multilingües: no disponibles (el campo de idiomas no está informado).
- No se documentan capacidades específicas de audio ni de visión entrenada en este checkpoint.

## Casos de uso

- Estudio de internalización de conocimiento: usar este checkpoint como brazo de control solo-SFT frente a las iteraciones posteriores de RL de la misma serie para medir cuánto del conocimiento inyectado sobrevive y a qué coste en comportamiento.
- Reproducción de resultados negativos: reconstruir el estado de entrenamiento (salvo momentos del optimizador) con `convert_hf_to_torch_dist.py` de slime a partir de `megatron/common.pt`, `args.json` y el cursor de datos `global_dataset_state_dict_<N>.pt`, y replicar el colapso observado.
- Investigación sobre colapso de políticas en agentes: analizar por qué el 43,8 % de los episodios del primer rollout de RL consistieron en una única llamada sin acción, comparando las filas declarativas con las anclas del modelo base.
- Análisis de atribución de errores en SFT sobre datos sintéticos: el conjunto de 888 átomos y las 1.810 filas de chat permiten aislar qué formulaciones (qa / rule / sentence) inducen el cierre prematuro del turno.
- Base para experimentos de *experience-to-knowledge* en otros dominios: reutilizar la pila slime + Megatron-LM + SGLang y el arnés MCP como plantilla para sustituir el juego `cd82-fb555c5d` por otra tarea multi-paso.
- Evaluación de infraestructura de conversión: `E2K_VERIFY.json` y `SHA256SUMS` permiten validar bit a bit el pipeline Megatron → HF frente al checkpoint base, útil para equipos que construyan conversores propios.
- Referencia docente sobre trazabilidad de checkpoints: el repositorio incluye configuración, plantillas, estado de datos y exportación de W&B, lo que lo hace útil como ejemplo de publicación reproducible de un checkpoint de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay líneas de métricas de juego para esta ejecución en los logs de Slurm y remite al `wandb_export` del dataset. El único dato cuantitativo aportado es que el ruido entre rollouts de un mismo brazo es de aproximadamente 0,05 de retorno modelado (*shaped return*), y que las diferencias entre brazos son de centésimas, por lo que no se debe interpretar este checkpoint como una mejora medible del modelo base.

## Requisitos de hardware

- VRAM estimada en bf16: en torno a 56 GB solo para pesos (repo de 55,6 GB), más caché KV y activaciones; en la práctica requiere GPU de 80 GB o reparto multi-GPU.
- GPU recomendadas: A100 80 GB, H100 80 GB o GH200; el entrenamiento se ejecutó en 4 nodos GH200 de Isambard-AI con TP4 × PP4.
- GPU de consumo: no cabe en bf16 en tarjetas de 24 GB (RTX 4090) ni de 32 GB; no se publican cuantizaciones que permitan reducir la huella.
- Opciones de despliegue: `transformers` con `Qwen3_5ForConditionalGeneration` y `AutoProcessor` (`dtype="bfloat16"`, `device_map="auto"`); vLLM y SGLang lo cargan igual que el modelo base, según la model card.
- Latencia y throughput: no disponibles.
- Almacenamiento: 55,6 GB para el repositorio; el checkpoint completo con estado del optimizador (~351 GB) permanece en Isambard-AI y no se distribuye.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| E2K-cd82-Qwen3.8-27B-sft_first_decl-cc-iter0 (este) | 27,78 B | No disponible | SFT declarativo sobre 888 átomos + anclas; RL detenido en el rollout 4 | Apache-2.0 | Pesos bf16 en HuggingFace; 0 descargas, 0 likes |
| Qwen/Qwen3.8-27B (modelo base) | 27,78 B (mismo conjunto de 1199 tensores) | No disponible en la información proporcionada | Entrenamiento original del autor de Qwen | Apache-2.0 (heredada por este checkpoint) | Público en HuggingFace |
| Otras iteraciones de la misma serie E2K-cd82 | 27,78 B | No disponible | Variantes de la ejecución `sft_first_decl-cc` y calentamientos solo-SFT | Apache-2.0 | Listadas en `checkpoints/checkpoints.md` del dataset de RL |

No se dispone de datos de benchmarks ni de especificaciones de contexto para establecer una comparación cuantitativa con modelos de la misma categoría; cualquier comparación con alternativas de ~27 B de otros fabricantes no está respaldada por la información disponible.

## Limitaciones y advertencias

- No es una mejora general del modelo base: está entrenado sobre un único juego ARC-AGI-3 (`cd82-fb555c5d`) y evaluado con rollouts de 32 episodios de ese mismo juego.
- Resultado negativo documentado: la política aprendió a declarar un hecho como respuesta visible y cerrar el turno, provocando un colapso del juego en el primer rollout de RL; el guardián detuvo la ejecución.
- Las diferencias entre brazos son de centésimas de retorno modelado frente a un ruido de aproximadamente 0,05 entre rollouts, por lo que las comparaciones individuales no son concluyentes.
- Entrenamiento exclusivamente de texto: la torre de visión no se entrenó ni se evaluó, pese a que la *pipeline tag* sea image-text-to-text; no debe asumirse calidad en tareas de imagen.
- Riesgo de alucinación: no evaluado en la información disponible; el sesgo hacia respuestas declarativas puede favorecer afirmaciones taxativas sin verificación.
- Idiomas soportados no documentados; no se recomienda asumir un rendimiento multilingüe concreto.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se heredan las condiciones y avisos del modelo base Qwen3.8-27B; conviene revisar la licencia y política de uso del modelo base antes de un despliegue en producción.
- No apto para producción: es un checkpoint de investigación sin benchmarks, con 0 descargas y sin cuantizaciones publicadas.
- El estado completo de entrenamiento (incluidos los momentos del optimizador, ~351 GB) no se distribuye, lo que limita la reproducibilidad exacta del proceso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ziyan98/E2K-cd82-Qwen3.8-27B-sft_first_decl-cc-iter0
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de RL de la ejecución (episodios, métricas, filas y log): https://huggingface.co/datasets/ziyan98/E2K-cd82-rl-internalization
- Dataset del conjunto de conocimiento del arnés: https://huggingface.co/datasets/ziyan98/E2K-cd82-harness-knowledge
- Dataset E2K-40: https://huggingface.co/datasets/ziyan98/E2K-40
- Código del proyecto (`knowledge-learning-e2k`, rutas `src/knowledge_learning/rl/` y `docs/RL_KNOWLEDGE_SFT.md`): https://github.com/ziyan-wang98/knowledge-learning-e2k
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; no se han encontrado papers, blogs ni demos adicionales que enlazar.
