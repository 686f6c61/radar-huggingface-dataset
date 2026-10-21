# ziyan98/E2K-cd82-Qwen3.8-27B-sft_first_idd-cc-iter5

## Resumen

E2K-cd82-Qwen3.8-27B-sft_first_idd-cc-iter5 es un checkpoint de investigación publicado por el usuario ziyan98, obtenido al aplicar el experimento de internalización de conocimiento E2K sobre el modelo base Qwen/Qwen3.8-27B. No se trata de una mejora de propósito general: el modelo se ha entrenado sobre un único juego de ARC-AGI-3 (identificador `cd82-fb555c5d`) y se ha evaluado con rollouts de 32 episodios de ese mismo juego. El objetivo del experimento es comprobar si el conocimiento verificado que un modelo extrae de su propia partida puede escribirse en sus pesos mediante filas supervisadas y, después, refinarse con aprendizaje por refuerzo sobre episodios reales de varios pasos.

El checkpoint corresponde a la iteración 5 del brazo `sft_first_idd-cc`, con dos rollouts exclusivamente de SFT (iteraciones 0 y 1) y rollouts de RL con Dr.GRPO entre las iteraciones 2 y 8, con reinicio de Adam en la frontera SFT→RL. El entrenamiento se hizo con slime v0.3.2 sobre Megatron-LM (TP4 × PP4) y 16 motores de rollout SGLang, en 4 nodos GH200 de Isambard-AI.

Arquitectura y tamaño: se mantiene el conjunto de tensores de Qwen3.8-27B, con 27.781.427.952 parámetros totales (27,78 B) en bf16, es decir, un repositorio de 55,6 GB. Lo relevante ahora es su valor como artefacto reproducible de investigación: incluye el estado completo de Megatron, los argumentos de entrenamiento y la trazabilidad de la conversión a safetensors, pero no constituye un modelo apto para producción generalista. Las diferencias entre brazos del experimento son de centésimas en retorno conformado (*shaped return*), y el propio autor lo advierte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con clase `Qwen3_5ForConditionalGeneration`; incluye torre visual (`model.visual.*`) y cabeza de predicción multi-token (`mtp.*`) heredadas sin cambios del modelo base. Detalle de capas, dimensión oculta y cabezas de atención: no disponible |
| Parametros totales | 27.781.427.952 (27,78 B), dato real de safetensors |
| Parametros activos | No aplica: no se describe una arquitectura MoE en la información disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Solo bf16 en safetensors; no se publican GGUF, AWQ, GPTQ ni otras cuantizaciones |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16), 1199 tensores con las mismas formas que Qwen/Qwen3.8-27B; incluye carpeta `megatron/` con `common.pt`, `args.json`, `latest_checkpointed_iteration.txt` y el cursor de datos `global_dataset_state_dict_<N>.pt` |
| Modelo base | Qwen/Qwen3.8-27B |
| Iteracion | 5 (TP4 × PP4) |
| Tamano del repositorio | 55,6 GB |
| Pipeline declarado | image-text-to-text |
| Libreria | transformers |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.8-27B, sin modificaciones estructurales: se conservan los 1199 tensores y sus formas. La conversión desde Megatron torch_dist a HuggingFace se realizó con el mapeo `megatron_to_hf.convert_to_hf` de slime, por streaming y en un nodo de login (`convert_torch_dist_to_hf_lowmem.py`); el mismo conversor reproduce bit a bit los safetensors originales del modelo base, y `E2K_VERIFY.json` documenta la comparación. La pila de texto (`model.language_model.*`, `lm_head`) corresponde al estado entrenado en Megatron; la torre visual y la cabeza MTP nunca formaron parte del modelo Megatron y se copiaron sin cambios, porque el entrenamiento fue exclusivamente de texto y el actor nunca vio una imagen.

El entrenamiento combina una fase supervisada y otra de refuerzo. La fase SFT usa 303 filas del arnés IDD (`cd82-play-v4/sft/rows_paired.jsonl.gz`): turnos de recitación escritos por el mismo modelo con el bloque de conocimiento en su contexto, emparejados con filas de replay (regla de lint C). Después hay dos rollouts solo-SFT (iteraciones 0 y 1) y, tras reiniciar los momentos de Adam, rollouts de Dr.GRPO entre las iteraciones 2 y 8. La configuración de RL es `--advantage-estimator grpo --no-normalize-advantages --disable-grpo-std-normalization --calculate-per-token-loss`, una muestra de entrenamiento por llamada al LLM, lote global 4, 8 pasos de optimizador por rollout de 32 episodios, learning rate 5e-6, precisión bf16 y backend flash-attn 2.8.3. El prompt de RL nunca contiene conocimiento: la hipótesis es que este se haya internalizado en los pesos. El arnés de juego es Claude Code CLI 2.1.270 controlando las herramientas MCP `look` / `act` / `status` de `knowledge_learning.loop.arc_mcp`, con semilla de motor 0 y niveles 1 a 4 con tope de un nivel.

## Capacidades

- Generación de texto conversacional en formato multi-turno (etiqueta `conversational`), con turnos de recitación de conocimiento y de replay.
- Razonamiento multi-paso dentro de episodios de juego: el modelo emite bloques de pensamiento cuyo p50 por turno se sitúa entre 5156 y 6887,5 tokens en los rollouts registrados.
- Tool calling / function calling en el sentido operativo del arnés: invocación de las herramientas MCP `look`, `act` y `status` para observar y actuar en el entorno.
- Comportamiento de agente sobre un entorno ARC-AGI-3 concreto (`cd82-fb555c5d`), no sobre entornos nuevos.
- Capacidad de citar y recitar conocimiento inyectado en contexto durante la fase SFT (turnos con referencia a fuente, con ratios por rollout entre 0,318 y 0,436).
- Capacidades multilingües: no disponible en la información proporcionada.
- Visión: la torre visual está presente en los pesos, pero es una copia intacta del modelo base y no fue entrenada; el autor indica explícitamente que el actor nunca vio una imagen durante el entrenamiento.
- No se documentan capacidades específicas de código, matemáticas o audio para este checkpoint.

## Casos de uso

- Investigación sobre internalización de conocimiento: sirve como artefacto reproducible para estudiar si el conocimiento verificado extraído de la propia partida de un modelo puede escribirse en los pesos mediante filas SFT y consolidarse después con RL, comparando brazos con el mismo protocolo de 32 episodios.
- Reproducción de experimentos E2K: el repositorio conserva `megatron/args.json`, el estado del optimizador y el cursor de datos, lo que permite reconstruir el estado de entrenamiento (salvo momentos del optimizador) con `convert_hf_to_torch_dist.py` de slime.
- Estudio de recitación frente a internalización: los ratios de turnos recitados (0,000 en todos los rollouts registrados de este brazo) y de turnos con referencia a fuente permiten analizar si el modelo deja de necesitar el bloque de conocimiento en contexto.
- Experimentación con agentes y tool calling en entornos de juego: útil para medir tasas de acierto de nivel, cambios de paso y proporción de no-ops en un pipeline de agente que despacha acciones a un motor Arcade.
- Comparación de configuraciones de RL distribuido: al ejecutarse con Megatron TP4 × PP4 y 16 motores SGLang en 4 nodos GH200, el checkpoint sirve de referencia para validar pipelines slime v0.3.2 y la estabilidad de Dr.GRPO con reinicio de Adam.
- Base de partida para ajuste fino sobre otros entornos de una sola tarea: dado que el entrenamiento se limita a un juego, es un punto de partida razonable para experimentos controlados de transferencia a un segundo juego, no para asistencia general.
- Auditoría de conversión de pesos: la verificación de igualdad bit a bit contra el modelo base y los ficheros `E2K_VERIFY.json` y `SHA256SUMS` permiten usar el repositorio como caso de prueba de herramientas de conversión Megatron → HF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K y similares) en la información disponible. Los únicos datos de rendimiento son las métricas de juego por rollout, extraídas de los registros de trabajo:

| Job | Rollout | Tasa de niveles superados | Retorno conformado | Cambio de paso | No-op por paso | Tokens de pensamiento (p50) | Turnos recitados | Turnos con referencia a fuente |
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

Contexto de lectura aportado por el autor: el primer rollout de RL tras un bloque solo-SFT lo juega la política solo-SFT, por lo que mide el efecto de las filas por sí mismas; el ruido entre rollouts de un mismo brazo es de aproximadamente 0,05 de retorno conformado.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: unos 55,6 GB solo para pesos, más caché KV y overhead del runtime; en la práctica requiere 80 GB o sharding entre varias GPU.
- GPU recomendadas para bf16 sin cuantizar: H100 80 GB, A100 80 GB, o GH200 (la propia ejecución de entrenamiento usó 4 nodos GH200 de Isambard-AI). Configuraciones multi-GPU con tensor parallelism para servir el modelo completo.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en una RTX 3090 (24 GB) en bf16. Al no publicarse pesos cuantizados, no hay una ruta oficial de despliegue en GPU de consumo; las estimaciones teóricas de 8 bits (~27,8 GB) o 4 bits (~13,9 GB) exigirían cuantizar el modelo por cuenta del usuario.
- Opciones de despliegue: transformers con `Qwen3_5ForConditionalGeneration` y `AutoProcessor` (ruta documentada por el autor); SGLang, ya que el entrenamiento usó 16 motores de rollout SGLang con tp=1; vLLM y TGI son compatibles a nivel de arquitectura, aunque no están verificados en la información disponible. llama.cpp/Ollama no son aplicables sin convertir previamente a GGUF.
- Latencia y throughput: no disponibles. Como referencia indirecta, los turnos de razonamiento del arnés tienen una mediana de 5156 a 6887,5 tokens de pensamiento, lo que implica respuestas largas y costosas por paso.
- Almacenamiento: 55,6 GB para los safetensors; el checkpoint completo con estado del optimizador ocupa aproximadamente 351 GB y permanece en Isambard-AI.

## Comparativa con modelos similares

No se dispone de datos de benchmarks que permitan comparar este checkpoint con alternativas de la misma categoría. La única comparación documentada es con su modelo base:

| Modelo | Parametros | Contexto | Entrenamiento especifico | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| E2K-cd82-Qwen3.8-27B-sft_first_idd-cc-iter5 | 27,78 B | No disponible | SFT (303 filas) + Dr.GRPO sobre el juego `cd82-fb555c5d` de ARC-AGI-3 | apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen3.8-27B (base) | 27,78 B | No disponible | No disponible | No disponible en la informacion proporcionada | HuggingFace |

Alternativas comparables de internalización de conocimiento sobre ARC-AGI-3 con métricas publicadas: no disponible.

## Limitaciones y advertencias

- El propio autor indica que este checkpoint no es una mejora de propósito general de Qwen3.8-27B: se entrenó en un solo juego y se evaluó con rollouts de 32 episodios de ese mismo juego.
- Las diferencias entre brazos del experimento son de centésimas de retorno conformado, con un ruido entre rollouts de un mismo brazo de aproximadamente 0,05; no deben interpretarse como mejoras sólidas.
- La tasa de niveles superados es muy baja (0,000 o 0,031 en todos los rollouts registrados) y el retorno conformado oscila entre -0,203 y 0,252.
- La proporción de no-ops por paso es alta (0,272 a 0,349), lo que sugiere acciones sin efecto en una fracción relevante de los pasos.
- Los turnos recitados son 0,000 en todos los rollouts listados: el modelo no recita el conocimiento durante el juego, lo que deja abierta la pregunta de si lo ha internalizado.
- Riesgo de alucinación: no cuantificado en la información disponible; el modelo conserva la distribución del base y no hay evaluación de fidelidad fuera del juego.
- Idiomas y cobertura multilingüe: no disponibles; el entrenamiento fue exclusivamente de texto en un dominio muy estrecho.
- La torre visual y la cabeza MTP están presentes pero son copias intactas del base, no entrenadas; aunque el pipeline declarado sea `image-text-to-text`, no hay evidencia de capacidad visual adquirida en este checkpoint.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el modelo no es adecuado para producción generalista y arrastra las condiciones del modelo base, que no se detallan en la información proporcionada.
- Longitud de contexto no documentada: planificar despliegues con contextos largos es arriesgado sin verificarla empíricamente.
- Requiere código y clases específicas (`Qwen3_5ForConditionalGeneration`) y una versión de transformers que las soporte; el uso de cuantizaciones exigiría trabajo adicional no soportado por el autor.
- Checkpoint de investigación sin tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ziyan98/E2K-cd82-Qwen3.8-27B-sft_first_idd-cc-iter5
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la búsqueda web realizada; los resultados devueltos no guardan relación con el modelo.
