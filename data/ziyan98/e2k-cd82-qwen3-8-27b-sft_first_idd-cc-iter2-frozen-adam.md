# ziyan98/E2K-cd82-Qwen3.8-27B-sft_first_idd-cc-iter2-frozen-adam

## Resumen

E2K-cd82-Qwen3.8-27B-sft_first_idd-cc-iter2-frozen-adam es un checkpoint de investigación publicado por el usuario `ziyan98` en HuggingFace. No es un modelo nuevo entrenado desde cero, sino un ajuste de Qwen/Qwen3.8-27B (27.781.427.952 parámetros) resultante de un experimento de "internalización de conocimiento" (E2K) sobre el juego `cd82-fb555c5d` de ARC-AGI-3. La pregunta que aborda el estudio es si el conocimiento verificado extraído de las propias partidas de un modelo puede escribirse en sus pesos mediante filas supervisadas y después mejorarse con RL sobre episodios reales de varios pasos.

El checkpoint corresponde al brazo `sft_first_idd-cc`, iteración 2 de Megatron, y proviene del **primer** intento de la ejecución (16-17 de septiembre de 2026), en el que los momentos de Adam acumulados durante el calentamiento SFT se arrastraron sin reiniciar al RL y mantuvieron el paso de RL casi a cero (movimiento de política unas 5 veces por debajo de la línea base). El autor lo conserva porque representa una trayectoria distinta desde el mismo arranque solo-SFT; existe un relanzamiento posterior con reinicio de Adam cuyas iteraciones se publican sin el sufijo `-frozen-adam`.

Su relevancia es, por tanto, metodológica y no de producto: es un artefacto para estudiar internalización de conocimiento, dinámica de optimizadores en la frontera SFT→RL y agentes sobre ARC-AGI-3. El propio autor advierte explícitamente de que **no** es una mejora general de Qwen3.8-27B: se entrenó sobre un único juego, se evaluó con rollouts de 32 episodios de ese juego y ningún brazo supera 2 de 32 episodios resueltos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con torre visual y cabeza de predicción multi-token (MTP); etiqueta de arquitectura `qwen3_5` en transformers. El ajuste se aplicó únicamente a la pila de texto |
| Parametros totales | 27.781.427.952 (27,78 mil millones), según safetensors |
| Parametros activos | No disponible (la información proporcionada no documenta arquitectura MoE ni número de expertos) |
| Longitud de contexto | No disponible (se hereda la configuración del modelo base Qwen/Qwen3.8-27B; el model card no la especifica) |
| Tipos de cuantizacion | No disponible. Solo se publican pesos en bf16 safetensors; no hay variantes GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | No disponible (el campo `languages` del repositorio está vacío) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en bf16 (1199 tensores; 851 de la pila de texto entrenada, el resto copiados del checkpoint base) |
| Tamaño del repositorio | 55,6 GB |
| Modelo base | Qwen/Qwen3.8-27B |
| Pipeline declarado | `image-text-to-text` |
| Descargas / likes | 9 / 0 |
| Fecha de creación | 2026-10-21 |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3.8-27B: un transformer con torre visual (`model.visual.*`) y cabeza de predicción multi-token (`mtp.*`), con 1199 tensores en total. El ajuste E2K solo afectó a la pila de texto (`model.language_model.*` y `lm_head`, 851 tensores), que proviene del estado entrenado en Megatron con comprobación de forma y dtype tensor a tensor; la torre visual y la cabeza MTP se copiaron del checkpoint base sin modificar y con identidad bit a bit, porque el entrenamiento fue exclusivamente de texto y el actor nunca vio una imagen. La configuración, el tokenizer, la plantilla de chat, la configuración de generación y los procesadores también son los del modelo base.

El entrenamiento se organizó en dos fases. Primero, 2 rollouts solo-SFT (0-1) con 303 filas del arnés IDD (`rows_paired.jsonl.gz`): turnos de recitado escritos por el mismo modelo con el bloque de conocimiento en contexto —las frases `recall_forms_v2` del conjunto de 391 afirmaciones— emparejados con filas de repetición. Después, tras el reinicio de Adam en la frontera SFT→RL, rollouts 2-8 de Dr.GRPO. La pila es slime v0.3.2 sobre Megatron-LM con TP4 × PP4 y 16 motores de rollout SGLang a tp=1, en 4 nodos GH200 de Isambard-AI. Hiperparámetros: `--advantage-estimator grpo --disable-grpo-std-normalization --calculate-per-token-loss`, normalización de ventajas desactivada, una muestra de entrenamiento por llamada al LLM, lote global de 4 episodios (unas 200 muestras por paso de optimizador), 8 pasos de optimizador por rollout de 32 episodios, lr 5e-6, bf16 y backend flash-attn 2.8.3.

El arnés de juego es Claude Code CLI 2.1.270 conduciendo las herramientas MCP `look` / `act` / `status` de `knowledge_learning.loop.arc_mcp`, con semilla de motor 0. Cada episodio de entrenamiento abre en el nivel 1 y continúa al siguiente al superarlo, hasta cuatro niveles, con 40 decisiones por episodio; la recompensa combina niveles superados y un retorno modelado. Los niveles de test 5-6 nunca se juegan.

## Capacidades

- Generación de texto y razonamiento multi-turno dentro de partidas de ARC-AGI-3 (juego `cd82-fb555c5d`), con episodios de hasta 40 decisiones y hasta cuatro niveles.
- Emisión de acciones estructuradas a través de herramientas MCP (`look`, `act`, `status`) dentro de un arnés agéntico; el modelo actúa como política del bucle, no como chat aislado.
- Trazas de razonamiento extensas: la mediana de tokens de "think" por rollout se sitúa entre 5.156 y 6.887,5 en las métricas publicadas.
- Recitado de conocimiento memorizado: en este checkpoint la tasa de turnos recitados es 0,000 en todas las rollouts, mientras que los turnos con referencia a fuente oscilan entre 0,272 y 0,436. Es decir, el conocimiento aparece referenciado pero no se recita de forma literal.
- Capacidades multilingües: no documentadas; el repositorio no declara idiomas.
- Capacidades de visión: no entrenadas. La torre visual se copia sin cambios del modelo base y el autor indica que el actor nunca vio una imagen, pese a que el pipeline declarado sea `image-text-to-text`.
- Modo "thinking": las trazas largas de razonamiento son observables en las métricas, pero no se documenta un modo thinking activable por prompt.
- No hay evidencia en la información disponible de mejora en código, matemáticas, tool calling genérico ni agentes de propósito general.

## Casos de uso

- Reproducción del experimento E2K: el repositorio conserva `megatron/args.json`, `common.pt` (argumentos y estado del planificador del optimizador), `latest_checkpointed_iteration.txt` y el cursor de datos `global_dataset_state_dict_<N>.pt`, de modo que el estado de entrenamiento (salvo los momentos del optimizador) puede reconstruirse con `convert_hf_to_torch_dist.py` de slime.
- Estudio del efecto de los momentos de Adam congelados en la transición SFT→RL: este checkpoint es el brazo congelado y el relanzamiento sin sufijo `-frozen-adam` es el brazo con reinicio, lo que permite una comparación directa de dinámica de política con el mismo arranque solo-SFT.
- Línea base para experimentos de internalización de conocimiento: sirve como referencia de "iteración 2 sin movimiento efectivo de RL" frente a iteraciones posteriores del mismo brazo.
- Investigación en agentes sobre ARC-AGI-3: útil para analizar patrones de acciones (cambio de paso 0,033-0,093, acciones no-op 0,272-0,349) y de razonamiento en un juego concreto.
- Punto de partida para ajuste supervisado adicional: al mantener intactos tokenizer, plantilla de chat y configuración, puede cargarse con transformers y reentrenarse sobre otras tareas de texto sin rehacer la integración.
- Ablación de la contribución de la torre visual: al ser un modelo con torre visual copiada pero entrenamiento solo-texto, permite medir cuánto del comportamiento multimodal aparente proviene del checkpoint base y no del ajuste.
- Verificación de pipelines de conversión Megatron→HuggingFace: los 1199 tensores con formas idénticas al base y la comprobación de identidad bit a bit de visión y MTP lo convierten en un caso de prueba útil para herramientas de conversión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La única evaluación publicada son las métricas de juego por rollout, extraídas de los registros de trabajo:

| job | rollout | clear rate | shaped return | step change | step no-op | think tokens p50 | turnos recitados | turnos con referencia a fuente |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 6619232 | 2 | 0,000 | -0,148 | 0,090 | 0,347 | 5563,500 | 0,000 | 0,436 |
| 6647952 | 2 | 0,031 | 0,011 | 0,078 | 0,313 | 5814,000 | 0,000 | 0,426 |
| 6619232 | 3 | 0,000 | -0,062 | 0,056 | 0,322 | 5668,000 | 0,000 | 0,384 |
| 6624050 | 3 | 0,031 | -0,094 | 0,054 | 0,332 | 5156,000 | 0,000 | 0,356 |
| 6647952 | 3 | 0,031 | 0,084 | 0,045 | 0,330 | 5525,000 | 0,000 | 0,318 |
| 6624050 | 4 | 0,000 | -0,203 | 0,043 | 0,343 | 6497,500 | 0,000 | 0,422 |
| 6647952 | 4 | 0,031 | 0,084 | 0,041 | 0,349 | 5622,500 | 0,000 | 0,358 |
| 6624050 | 5 | 0,031 | -0,203 | 0,033 | 0,342 | 6598,500 | 0,000 | 0,428 |
| 6647952 | 5 | 0,031 | 0,206 | 0,081 | 0,310 | 5377,000 | 0,000 | 0,354 |
| 6624050 | 6 | 0,000 | -0,133 | 0,040 | 0,317 | 6887,500 | 0,000 | 0,397 |
| 6647952 | 6 | 0,031 | 0,189 | 0,082 | 0,306 | 5595,500 | 0,000 | 0,373 |
| 6647952 | 7 | 0,031 | 0,100 | 0,090 | 0,318 | 5211,000 | 0,000 | 0,339 |
| 6647952 | 8 | 0,000 | 0,252 | 0,093 | 0,272 | 5367,000 | 0,000 | 0,362 |

Contexto para interpretar la tabla, según el autor: el primer rollout de RL tras un bloque solo-SFT lo juega la política solo-SFT, así que mide lo que hicieron las filas por sí mismas; el ruido entre rollouts de un mismo brazo es de unas 0,05 unidades de retorno modelado, y las diferencias entre brazos son como mucho de unas pocas décimas. La tasa de éxito máxima observada es 0,031 (1 de 32 episodios) y ningún brazo supera 2 de 32 episodios. No hay comparación con otros modelos en la información proporcionada.

## Requisitos de hardware

- Pesos en bf16: 27,78 mil millones de parámetros × 2 bytes ≈ 55,6 GB, cifra coherente con el tamaño del repositorio.
- VRAM estimada para inferencia en bf16: 60-65 GB solo para pesos más overhead; con caché KV para contextos largos, lo razonable es 2 × 80 GB (A100 80GB, H100 80GB) o un único H200 de 141 GB. Estimación aritmética a partir del número de parámetros, no medida publicada.
- En int8 (≈28 GB) cabría en 2 × RTX 4090 de 24 GB o en 1 × A100 40GB; en int4 (≈14-16 GB) cabría en una sola RTX 4090 o RTX 3090 de 24 GB. El autor no publica cuantizaciones, así que habría que generarlas.
- Despliegue: la librería declarada es transformers. En el entrenamiento se usaron 16 motores SGLang con tp=1 sobre nodos GH200 (96 GB de HBM por GPU) y Megatron-LM con TP4 × PP4; SGLang y vLLM son opciones naturales, pero el soporte de la arquitectura `qwen3_5` en llama.cpp/Ollama no está confirmado en la información disponible.
- Latencia y throughput: no disponibles. Como referencia de carga, las trazas de razonamiento tienen una mediana de 5.156-6.887,5 tokens por rollout, con 40 decisiones por episodio, lo que implica generaciones largas por paso.
- Almacenamiento: 55,6 GB para el repositorio; el estado de Megatron añade los ficheros de `megatron/` (argumentos, planificador, cursores de datos).

## Comparativa con modelos similares

No se han identificado en la información proporcionada otros checkpoints comparables de internalización de conocimiento sobre ARC-AGI-3. La comparación posible se limita al modelo base y a los demás brazos de la misma serie:

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`iter2-frozen-adam`) | 27,78 B | No disponible | 303 filas SFT + Dr.GRPO sobre el juego `cd82-fb555c5d`; Adam sin reiniciar | Apache-2.0 | Público en HuggingFace, 9 descargas |
| Qwen/Qwen3.8-27B (base) | 27,78 B (mismo conjunto de 1199 tensores) | No disponible en la información | Preentrenamiento y post-entrenamiento del autor original, no documentados aquí | No disponible en la información | Público en HuggingFace |
| Relanzamiento del mismo brazo sin `-frozen-adam` | 27,78 B | No disponible | Mismo arranque solo-SFT con reinicio de Adam en la frontera SFT→RL | Apache-2.0 (presumiblemente, misma serie) | Referenciado en el card; datos concretos no disponibles |

## Limitaciones y advertencias

- No es una mejora de propósito general: el autor lo declara explícitamente. Se entrenó y evaluó sobre un único juego de ARC-AGI-3 y ningún brazo supera 2 de 32 episodios resueltos.
- El paso de RL es prácticamente nulo en este checkpoint: los momentos de Adam del calentamiento SFT se arrastraron sin reiniciar y el movimiento de política quedó unas 5 veces por debajo de la línea base. Cualquier lectura de sus resultados como "efecto del RL" es incorrecta.
- Las diferencias entre brazos son del orden del ruido: como mucho unas pocas décimas de retorno modelado frente a un ruido de rollout de aproximadamente 0,05. No se pueden extraer conclusiones firmes de comparaciones individuales.
- Tasa de recitado nula (0,000) en todas las rollouts: el conocimiento no se reproduce literalmente, solo se referencia. La hipótesis de internalización no queda confirmada por estas métricas.
- Riesgo de alucinación no evaluado: no hay benchmarks de veracidad ni de robustez en la información disponible.
- Idiomas no declarados; el comportamiento multilingüe es desconocido y no se ha evaluado.
- La torre visual y la cabeza MTP son copias sin entrenar del base: no debe asumirse ninguna capacidad de visión adquirida, pese al pipeline `image-text-to-text`.
- Licencia Apache-2.0 en este repositorio, pero la licencia del modelo base Qwen/Qwen3.8-27B no se detalla en la información proporcionada; conviene verificar sus términos antes de un uso comercial en producción.
- Los niveles de test 5-6 de ARC-AGI-3 nunca se jugaron durante el entrenamiento, pero el modelo no está validado fuera de ese juego ni con semillas distintas de la 0.
- Dependencia del arnés: el modelo fue entrenado como política dentro de Claude Code CLI con herramientas MCP concretas; su comportamiento fuera de ese andamiaje no está documentado.
- No hay cuantizaciones oficiales ni garantía de soporte en runtimes distintos de transformers.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ziyan98/E2K-cd82-Qwen3.8-27B-sft_first_idd-cc-iter2-frozen-adam
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- La búsqueda web realizada no devolvió resultados relevantes: los únicos resultados obtenidos fueron páginas de GIPHY sin relación alguna con el modelo, por lo que no se dispone de enlaces a papers, blogs, repositorios o demos adicionales.
