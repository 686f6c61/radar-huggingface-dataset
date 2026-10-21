# ziyan98/E2K-cd82-Qwen3.8-27B-baseline-iter3

## Resumen

E2K-cd82-Qwen3.8-27B-baseline-iter3 es un checkpoint de investigación publicado por el usuario ziyan98 en HuggingFace, derivado del modelo base Qwen/Qwen3.8-27B (27.781.427.952 parámetros, 1199 tensores en safetensors bf16). No se trata de una mejora de propósito general del modelo base, sino de una iteración concreta (iteración Megatron 3) dentro del experimento E2K de "internalización de conocimiento": un estudio sobre si el conocimiento verificado extraído de las propias partidas de un modelo puede escribirse en sus pesos mediante filas supervisadas y refinarse después con RL sobre episodios reales de varios pasos. El escenario elegido es el juego `cd82-fb555c5d` de ARC-AGI-3.

El checkpoint pertenece al brazo `baseline` (RL puro, cliente de juego MCP en proceso), que fue posteriormente superado por `baseline-cc`. Según la model card, el reward fue 0 en los 320 episodios de entrenamiento y la norma del gradiente fue 0 en todos los pasos del optimizador, de modo que las iteraciones 3 y 7 no contienen actualización RL alguna: son esencialmente los pesos base con la deriva introducida por el weight decay del optimizador. La ejecución se canceló por considerarse plana por construcción.

Su relevancia es, por tanto, metodológica y de reproducibilidad: documenta con detalle la pila de entrenamiento (slime v0.3.2, Megatron-LM TP4 × PP4, 16 motores de rollout SGLang con tp=1 sobre 4 nodos GH200 de Isambard-AI), el proceso de conversión Megatron torch_dist → HF y la verificación tensor a tensor contra el checkpoint base. No debe emplearse como sustituto del Qwen3.8-27B original en cargas de trabajo generales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal tipo `qwen3_5` (`Qwen3_5ForConditionalGeneration`), con torre visual y cabeza de predicción multi-token (MTP) |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | no disponible (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos bf16; no se han publicado variantes GGUF, FP8 ni INT4) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en bf16, 1199 tensores con los mismos nombres y formas que `Qwen/Qwen3.8-27B`; repo de 55,6 GB |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.8-27B: un transformer multimodal con torre visual (`model.visual.*`) y cabeza MTP (`mtp.*`). El entrenamiento realizado en este checkpoint fue exclusivamente de texto: el actor nunca vio una imagen, y tanto la torre visual como la cabeza MTP se copiaron del checkpoint base sin modificar, verificándose su identidad bit a bit. El stack de texto (`model.language_model.*` y `lm_head`, 851 tensores) es el estado entrenado en Megatron. Configuración, tokenizador, chat template, generation config y processor config proceden también del modelo base, y el modo thinking queda intacto.

El régimen de entrenamiento es Dr.GRPO (ventaja tipo GRPO con `--disable-grpo-std-normalization` y `--calculate-per-token-loss`, con `--normalize-advantages` desactivado) sobre slime v0.3.2, con Megatron-LM en TP4 × PP4 y 16 motores de rollout SGLang a tp=1, en 4 nodos GH200 de Isambard-AI. Se planificaron 12 rollouts con checkpoint cada 4, learning rate 5e-6, precisión bf16 y backend flash-attn 2.8.3. El batch global fue de 4 episodios por paso del optimizador (unas 200 muestras por paso, una muestra por llamada al LLM) y 8 pasos de optimizador por rollout de 32 episodios. El arnés de juego fue Claude Code CLI 2.1.270 manejando las herramientas MCP `look` / `act` / `status` de `knowledge_learning.loop.arc_mcp`, con semilla de motor 0, 40 decisiones por episodio, inicio en el nivel 1 y progresión hasta cuatro niveles; los niveles de test 5–6 nunca se jugaron. En esta iteración no hubo filas SFT y todas las recompensas fueron 0, con norma de gradiente 0 en cada paso, por lo que el checkpoint refleja únicamente la deriva de weight decay respecto a los pesos base.

## Capacidades

- Generación de texto y razonamiento conversacional heredados del Qwen3.8-27B base, incluido el modo thinking sin cambios en la plantilla de chat.
- Capacidad multimodal declarada por el pipeline (`image-text-to-text`), pero la torre visual no recibió entrenamiento en este experimento: se copió sin cambios del base.
- Soporte de tool calling mediante el protocolo MCP: el modelo se empleó con las herramientas `look`, `act` y `status` del entorno ARC-AGI-3.
- Razonamiento multi-paso dentro de episodios de hasta 40 decisiones, con cambio de nivel al superar uno.
- Internamente, el checkpoint se entrenó con RL sobre episodios de un único juego, no sobre instrucciones generales.
- Capacidades multilingües: no disponibles en la información proporcionada (se heredarían del base, sin verificación).
- No se documentan capacidades de audio, visión entrenada ni funciones adicionales específicas.

## Casos de uso

- Reproducción del experimento E2K: el checkpoint sirve como punto de partida exacto de la iteración 3 del brazo `baseline`, con los argumentos de Megatron en `megatron/args.json` y el estado del cursor de datos en `global_dataset_state_dict_<N>.pt`.
- Estudio de internalización de conocimiento: permite analizar qué ocurre cuando el reward es cero en todos los episodios y la norma de gradiente se anula, comparando este estado con las iteraciones 7 y con `baseline-cc`.
- Línea base de control en experimentos de RL sobre ARC-AGI-3: al no contener actualización RL efectiva, funciona como referencia para medir la varianza entre rollouts (ruido de aproximadamente 0,05 en shaped return).
- Validación de pipelines de conversión Megatron torch_dist → HuggingFace: el repo incluye `E2K_CONVERSION.json` y `E2K_VERIFY.json`, con comparación tensor a tensor contra el base, útil para auditar el conversor `megatron_to_hf.convert_to_hf`.
- Investigación sobre deriva por weight decay: al ser pesos base con deriva del optimizador, permite cuantificar el efecto aislado del weight decay sobre un modelo de 27,78 B en bf16.
- Prototipado de agentes que consumen herramientas MCP en entornos de juego con decisiones discretas y observaciones textuales, reutilizando el bucle `look` / `act` / `status`.
- Punto de partida para fine-tuning posterior en un entorno multimodal: al conservar intactas la torre visual y la cabeza MTP, se puede reanudar entrenamiento multimodal sin reinscribir esos tensores.
- Docencia y divulgación sobre infraestructura de RL a gran escala: el repo documenta configuración de slime, topología TP/PP, motores SGLang y presupuesto de cómputo en GH200.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de evaluación corresponden al juego `cd82-fb555c5d` de ARC-AGI-3:

| Metrica | Valor |
|---|---|
| Episodios de entrenamiento | 320, con reward 0 en todos |
| Norma del gradiente | 0 en todos los pasos del optimizador |
| Actualización RL en iteración 3 | ninguna (pesos base con deriva de weight decay) |
| Episodios resueltos por brazo (máximo) | 2 de 32 |
| Diferencia entre brazos | como máximo unas décimas de shaped return |
| Ruido rollout a rollout de un brazo | aproximadamente 0,05 de shaped return |
| Rollouts planificados | 12, con checkpoint cada 4 |

La propia model card advierte de que el checkpoint no constituye una mejora general del modelo base y de que la ejecución se canceló por considerarse plana por construcción.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: unos 55,6 GB solo de pesos, más caché KV y overhead; en la práctica requiere GPU de 80 GB o reparto multi-GPU.
- GPU recomendadas: A100 80 GB, H100 80 GB, GH200; el entrenamiento documentado usó 4 nodos GH200 de Isambard-AI.
- GPU de consumo: no cabe en una RTX 4090 de 24 GB en bf16; serían necesarias al menos 3–4 unidades con reparto de tensores, o cuantización de terceros no publicada (una hipotética INT4 rondaría los 14 GB, sin cifras verificadas en la información disponible).
- Opciones de despliegue: `transformers` con `Qwen3_5ForConditionalGeneration` y `dtype="bfloat16"`; vLLM y SGLang lo cargan igual que el modelo base. No se han publicado instrucciones para llama.cpp u Ollama.
- Latencia y throughput: no disponibles. El checkpoint completo con estado del optimizador ocupa aproximadamente 351 GiB (unos 377 GB) y permanece en Isambard-AI; en el Hub solo se publican los pesos convertidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| E2K-cd82-Qwen3.8-27B-baseline-iter3 | 27,78 B | no disponible | reward 0 en 320 episodios; máximo 2/32 episodios resueltos | apache-2.0 | HuggingFace, 10 descargas |
| Qwen/Qwen3.8-27B (base) | 27,78 B | no disponible | no disponible | apache-2.0 | HuggingFace (modelo de referencia) |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos verificables sobre otros modelos comparables de la misma categoría; la única comparación documentada es contra el checkpoint base del que deriva.

## Limitaciones y advertencias

- No es una mejora de propósito general: fue entrenado sobre un único juego (`cd82-fb555c5d`) y evaluado en rollouts de 32 episodios de ese mismo juego.
- Ausencia total de señal de aprendizaje: reward 0 en 320 episodios y norma de gradiente 0 en cada paso, por lo que el checkpoint no incorpora conocimiento nuevo del juego.
- Los pesos equivalen al modelo base más la deriva de weight decay del optimizador; las diferencias observadas entre brazos están dentro del ruido (aproximadamente 0,05 de shaped return).
- Riesgo de alucinación y sesgos: no documentados específicamente para este checkpoint; deben asumirse los del Qwen3.8-27B base, no caracterizados en la información disponible.
- Longitud de contexto e idiomas soportados no verificados en esta ficha; se heredan del base sin comprobación independiente.
- La torre visual y la cabeza MTP no fueron entrenadas en este experimento, aunque el pipeline declarado sea `image-text-to-text`: el comportamiento multimodal real no está validado.
- Estado de entrenamiento incompleto: los momentos de Adam se reinician en la frontera SFT → RL a partir del 17 de septiembre de 2026 en la serie, y los primeros intentos `-frozen-adam` carecían de ese reinicio, lo que complica la comparación entre iteraciones.
- El proceso de conversión se validó contra el base, pero no se envía fichero de checksums propio: la integridad depende de los sha256 por shard que almacena el Hub.
- Licencia apache-2.0 permite uso comercial, pero el modelo no está destinado a producción general y su comportamiento fuera del entorno ARC-AGI-3 no está evaluado.
- La ejecución fue cancelada y sucedida por `baseline-cc`; usar este checkpoint como resultado final del estudio sería incorrecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ziyan98/E2K-cd82-Qwen3.8-27B-baseline-iter3
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset del experimento (episodios, métricas y configuración RL): https://huggingface.co/datasets/ziyan98/E2K-cd82-rl-internalization
