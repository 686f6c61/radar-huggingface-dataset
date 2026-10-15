# vwdubb/Qwen3.8-27B-antislop-FP8

## Resumen

Qwen3.8-27B-antislop-FP8 es una versión cuantizada en FP8 del modelo Qwen3.8-27B-antislop, un ajuste posterior (post-training) del Qwen3.8-27B orientado a un único objetivo: que el modelo escriba prosa menos "de LLM" y más humana. El autor del repositorio es el usuario vwdubb, y el modelo base del que deriva (rawmodels/Qwen3.8-27B-antislop) se entrenó con una reimplementación del método RL from eXpert Aligned Rubrics (RL-XAR) / *unslop* de Meta FAIR, usando GRPO como algoritmo de refuerzo. Este repositorio concreto aporta los pesos en FP8 mediante compressed-tensors, lo que reduce el peso en disco y en VRAM a costa de una posible pérdida de calidad no cuantificada.

El problema que aborda es el llamado *AI slop*: texto fluido que imita la superficie de la buena prosa sin la artesanía (cierres motivacionales genéricos, abstracts que acumulan cifras sin foco, tuits con tono de cuenta corporativa). La propuesta no es un juez absoluto mejor, sino rúbricas por ítem que separan escritura experta de escritura de modelo, usadas como recompensa de RL. Sobre el papel, el modelo pasa de una calidad media juzgada de 6,31 a 8,28 sobre 10 y alcanza un Elo de 1320,1 en EQ-Bench 4, cuarto puesto de 29 en la tabla de anclas publicada por el autor.

Técnicamente se trata de un modelo multimodal (image-text-to-text) de la familia Qwen3.5/3.8, con 27.781.427.952 parámetros (unos 27,78 mil millones), torre de visión y cabeza de predicción multi-token preservadas, y solo los pesos del modelo de lenguaje modificados por el RL. La relevancia actual es doble: por un lado, es un caso práctico y reproducible de optimización de estilo con rúbricas expertas; por otro, es un ejemplo temprano de publicación en FP8 de un ajuste de comunidad sobre un modelo multimodal de ~28B. Hay que subrayar que el repositorio acumula 0 descargas y 0 me gusta, y que todos los benchmarks proceden del propio autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (pipeline image-text-to-text) de la familia Qwen3.5/3.8, con torre de visión y cabeza de predicción multi-token (MTP) preservadas; no se especifica si es denso o MoE |
| Parámetros totales | 27.781.427.952 (~27,78 mil millones) |
| Parámetros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 con compressed-tensors en este repositorio; no se documentan otras cuantizaciones del modelo base |
| Idiomas soportados | no disponible (los datos de RL descritos son prosa en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (FP8); el repositorio ocupa 38,5 GB |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, que se mantiene intacto como modelo nativo de visión-lenguaje: la torre de visión y la cabeza de predicción multi-token se conservan y solo se ajustan los pesos del modelo de lenguaje mediante GRPO, con *thinking* desactivado durante el entrenamiento. El ajuste se hizo sobre una porción de prosa solo texto, siguiendo la línea de trabajo *unslop* de Meta FAIR (RL-XAR), pero reimplementada sobre otra pila de modelo y de jueces. Para cada extracto experto —tuits del Broad Twitter Corpus, abstracts científicos de arXiv y ensayos de blog de PG, Sivers y sama— se genera y se congela una rúbrica por ítem que permanece fija durante toda la ejecución, evitando la deriva de rúbrica típica de los pipelines de RL con criterios generados dinámicamente. La recompensa combina un factor de longitud respecto a la longitud objetivo del ítem con una puntuación de calidad de 0 a 10 emitida por un juez Claude Opus calibrado con un *prompt* de sistema ciego a la longitud, normalizada mediante calibración por dominio (μ_d, a_d) ajustada sobre la distribución de referencia de Qwen3.8-27B.

La configuración de RL descrita es: GRPO sobre Qwen3.8-27B con [verl], lote de 128 (16 prompts × 8 muestras), 100 pasos, learning rate 2e-5, kl_loss_coef 0,002 y decodificación con *thinking* deshabilitado; la generación se sirve con vLLM colocado junto a FSDP. Durante los 100 pasos la recompensa media subió de aproximadamente 0,35 a 0,55 mientras la entropía se estabilizó desde 1,5 hasta alrededor de 0,43. No se documentan en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases adicionales de DPO o RLHF más allá del GRPO descrito. La variante FP8 de este repositorio no incluye información sobre el proceso de cuantización, la calibración empleada ni la pérdida de calidad asociada.

## Capacidades

- Generación de texto en prosa con estilo no genérico: el ajuste está específicamente orientado a reducir clichés, cierres motivacionales y fórmulas de marca, en dominios de tuits, abstracts científicos y ensayos de blog.
- Escritura creativa y ensayística: el autor lo etiqueta como *creative-writing* y lo compara con un finetune de escritura creativa del mismo base (Altworld/Hemmingway-1).
- Conversación abierta y multi-turno: EQ-Bench 4 evalúa chats de 16 mensajes con 120 personas; el modelo obtiene un Elo de 1320,1.
- Adaptación de registro y marco conversacional: el perfil de rasgos del juez puntual reporta 8,19 sobre 10 en `native_frame_adaptation` y 6,56 en `analytical`.
- Capacidad multimodal image-text-to-text: heredada del Qwen3.8-27B base, con la torre de visión preservada, aunque no se aportan evaluaciones de visión para este modelo.
- Predicción multi-token (MTP): la cabeza correspondiente se conserva intacta, lo que en el modelo base sirve para decodificación especulativa y aceleración de inferencia.
- Control de verbosidad ligado a la longitud objetivo: la recompensa incorpora un factor de longitud, por lo que el modelo tiende a ajustarse a la extensión esperada del tipo de texto.
- Soporte de *tool calling*, function calling y comportamiento agéntico multi-paso: no disponible en la información proporcionada; el ajuste descrito no cubre estas capacidades.
- Capacidades multilingües: no disponible; los datos de RL descritos son de prosa en inglés.
- Modo *thinking*: desactivado durante el entrenamiento de RL; su comportamiento tras el ajuste no está documentado.

## Casos de uso

- Redacción editorial y newsletters: el modelo está entrenado con rúbricas de ensayos de blog (PG, Sivers, sama) y alcanza 8,03 de calidad media en ese dominio, por lo que encaja en la producción de textos de opinión y divulgación con voz propia, evitando los cierres genéricos típicos de otros LLM.
- Resúmenes y abstracts científicos: con 6,94 de calidad media en abstracts de arXiv, es adecuado para generar resúmenes de artículos que no se limiten a acumular cifras, sino que jerarquicen el hallazgo principal; conviene validación humana por el riesgo de alucinación.
- Social media y copy corto: en tuits del Broad Twitter Corpus obtiene 8,76 de calidad media, el dominio donde más destaca, así que es apto para redactar publicaciones breves con tono natural en lugar de tono corporativo.
- Post-edición de texto generado por otros modelos: puede usarse como segundo paso en un pipeline que reciba un borrador de otro LLM y lo reescriba eliminando fórmulas vacías, ya que el objetivo de entrenamiento es exactamente separar prosa de experto de prosa de modelo.
- Curación de datasets y filtrado de *slop*: dado que su recompensa se calibró contra rúbricas que distinguen escritura experta de escritura artificial, puede emplearse como generador de negativos y positivos, o como modelo auxiliar en pipelines de filtrado de corpus, siempre que se complemente con un clasificador verificado.
- Escritura asistida en local con coste controlado: la versión FP8 reduce el peso a aproximadamente 28 GB, lo que permite desplegarlo en una GPU de 40-48 GB on-premise para aplicaciones de asistencia a la redacción sin enviar datos a terceros.
- Descripción de imágenes y tareas imagen-texto: al conservar la torre de visión, puede emplearse para generar pies de foto, texto alternativo o descripciones de material gráfico con un estilo menos mecánico; no hay evaluación publicada de esta capacidad, por lo que requiere pruebas propias.
- Prototipado de evaluación de estilo: dado que el autor documenta rúbricas congeladas, calibración por dominio y comparaciones por pares, sirve como referencia para diseñar un sistema de evaluación de prosa propio en un equipo de investigación.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card del modelo base, sobre prosa held-out evaluada con el mismo juez Opus calibrado, ciego a la longitud, y las mismas rúbricas congeladas. La escala es de 0 a 10.

| Modelo | q media ↑ | Tuits | Artículos | Blogs |
|---|---|---|---|---|
| Qwen3.8-27B (base) | 6,31 | 7,18 | 5,75 | 5,53 |
| Qwen3.8-27B-antislop | 8,28 | 8,76 | 6,94 | 8,03 |
| Altworld/Hemmingway-1 | 7,10 | 7,66 | 7,06 | 6,56 |

Tasas de victoria por pares (por ítem, mayor q): antislop frente al base, 50-0 con 2 empates; antislop frente a Hemmingway-1, 43-6 con 3 empates (82,7 %).

EQ-Bench 4, ejecutado con la configuración canónica del repositorio oficial (modelo de persona `google/gemini-3.1-pro-preview`, panel de jueces por pares `gemini-3.1-pro-preview`, `gpt-5.5` y `claude-opus-4-6`, juez puntual `claude-opus-4-8`, 120 personas de 16 mensajes y conjunto fijo de anclas), con re-agregación oficial `--redo-elo`: 366 comparaciones por pares nuevas contra 28 anclas y 11 056 en total.

| Puesto | Modelo | Elo (IC 95 %) |
|---|---|---|
| 1 | claude-opus-5 | 1382,9 (1366-1401) |
| 2 | moonshotai/kimi-k3 | 1334,6 (1321-1349) |
| 3 | claude-fable-5 | 1330,9 (1320-1342) |
| 4 | Qwen3.8-27B-antislop (este modelo) | 1320,1 (1309-1332) |
| 5 | openai/gpt-5.5 | 1314,4 (1304-1323) |
| 6 | claude-opus-4-7 | 1307,9 (1298-1318) |
| 7 | claude-opus-4-8 | 1277,8 (1265-1289) |

Perfil de rasgos del juez puntual (0-10, media sobre 90 conversaciones puntuadas): `native_frame_adaptation` 8,19; `analytical` 6,56; `naturalness_authenticity` 6,54; `frame_capture` 6,42; `validation_propensity` 6,34; `escalation_containment` 6,27; `yielding_propensity` 5,99; `directive_advice_orientation` 5,89; `interpretive_boldness` 5,04; `challenge_propensity` 3,40; `boundary_setting` 3,07; `clinical_register_propensity` 2,53. El autor indica que estos rasgos son descriptivos y que la métrica principal es el Elo.

No hay datos de benchmarks publicados para la variante FP8 concreta (MMLU, HumanEval, GSM8K u otros): no disponible en la información proporcionada.

## Requisitos de hardware

Estimaciones derivadas del recuento de parámetros (27,78 mil millones) y del tamaño del repositorio; no hay mediciones publicadas de latencia ni de throughput.

- Pesos en FP8: aproximadamente 27,8 GB. Con caché KV y activaciones, en torno a 30-35 GB de VRAM para contextos moderados.
- Pesos en bf16 equivalentes (modelo base sin cuantizar): aproximadamente 55,6 GB, más caché KV; se necesitan del orden de 60-70 GB para inferencia cómoda.
- GPU recomendadas para la variante FP8 en una sola tarjeta: H100 80 GB, A100 80 GB, L40S 48 GB. Los kernels nativos de FP8 requieren capacidad de cómputo 8.9 o superior (Ada Lovelace y Hopper); en GPUs anteriores vLLM de-cuantiza a bf16 y desaparece la ventaja de memoria.
- Configuraciones multi-GPU: 2× A100 40 GB o 2× RTX 4090 24 GB con paralelismo tensorial (48 GB agregados) pueden alojar los pesos FP8, con la penalización de latencia por comunicación entre GPUs.
- GPU de consumo: una RTX 4090 de 24 GB no basta para los pesos FP8 de ~28 GB más caché; una RTX 5090 de 32 GB es la opción de consumo más plausible para FP8 en una sola tarjeta, siempre con pruebas empíricas por la sobrecarga de la torre de visión.
- Opciones de despliegue: vLLM y TGI para servidores con soporte de compressed-tensors y FP8; transformers con la librería compressed-tensors para uso directo; SGLang como alternativa. llama.cpp y Ollama requerirían una conversión a GGUF que no se publica en este repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | q media en prosa (0-10) | EQ-Bench 4 Elo | Licencia | Formato disponible |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-antislop-FP8 (este modelo) | 27,78 B | no disponible | 8,28 (heredado del base antislop; no reevaluado en FP8) | no disponible para la variante FP8 | apache-2.0 | safetensors FP8 (compressed-tensors) |
| Qwen3.8-27B-antislop (base de este repositorio) | 27,78 B | no disponible | 8,28 | 1320,1 (puesto 4 de 29) | apache-2.0 | safetensors (precisión original) |
| Altworld/Hemmingway-1 | no disponible | no disponible | 7,10 | no disponible | no disponible | no disponible |
| Qwen3.8-27B (modelo original) | 27,78 B (según el derivado) | no disponible | 6,31 | no disponible | no disponible | no disponible |

En la categoría de modelos de prosa no genérica, la alternativa explícitamente comparada por el autor es Altworld/Hemmingway-1, un finetune de escritura creativa del mismo base, que pierde 43-6 en comparación por pares frente a este modelo. La referencia metodológica es el trabajo *unslop* / RL-XAR de Meta FAIR, del que este modelo es una reimplementación sobre otra pila de modelo y jueces, pero no se publican comparaciones numéricas directas con sus modelos resultantes.

## Limitaciones y advertencias

- Sesgo de dominio: el RL se hizo sobre tres dominios de prosa en inglés (tuits del Broad Twitter Corpus, abstracts de arXiv y ensayos de blog de PG, Sivers y sama). Fuera de esos registros, el comportamiento no está documentado.
- Idioma: no se documentan idiomas soportados y el material de entrenamiento descrito es en inglés; el rendimiento en castellano es desconocido.
- Pérdida de diversidad: la entropía cayó de 1,5 a aproximadamente 0,43 en 100 pasos. Eso puede implicar una voz más consistente, pero también un mayor riesgo de colapso de modo y de repetición estilística.
- Riesgo de alucinación: no evaluado. La recompensa optimiza calidad percibida de prosa y ajuste a longitud objetivo, no veracidad factual; en abstracts científicos y textos divulgativos el riesgo es especialmente relevante.
- Efecto sobre el razonamiento: el RL se ejecutó con *thinking* desactivado. Su impacto sobre tareas de razonamiento largo o matemáticas no está medido.
- Cabeza de visión sin evaluar: la torre de visión se conserva, pero no hay ninguna métrica de calidad multimodal publicada para este ajuste.
- Cuantización FP8 sin evaluar: no se publica comparación entre la variante FP8 y el modelo base antislop, por lo que la degradación introducida por la cuantización es desconocida.
- Benchmarks autopublicados: todas las cifras provienen del autor del modelo, con jueces propietarios (Claude Opus, Gemini, GPT) y sin reproducibilidad independiente. La reimplementación del pipeline de EQ-Bench 4 añade una capa adicional de posible divergencia.
- Validación comunitaria nula: 0 descargas y 0 me gusta en el momento de la consulta, repositorio creado el 15 de octubre de 2026. No debería adoptarse como dependencia crítica sin evaluación propia.
- Licencia: los pesos de este repositorio se publican bajo apache-2.0, lo que permite uso comercial, pero no se detallan en la información disponible los términos del modelo base Qwen3.8-27B del que deriva; conviene verificarlos antes de un despliegue en producción.
- Dependencias de entrenamiento: el método depende de rúbricas congeladas y de un juez externo calibrado; reproducir el ajuste requiere acceso a ese juez y a la calibración por dominio.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/vwdubb/Qwen3.8-27B-antislop-FP8
- Modelo base del ajuste antislop: https://huggingface.co/rawmodels/Qwen3.8-27B-antislop
- Modelo original de la familia: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo de escritura creativa comparado en la model card: https://huggingface.co/Altworld/Hemmingway-1
- Blog de Meta FAIR sobre RL-XAR / *unslop*: https://facebookresearch.github.io/RAM/blogs/unslop/
- Repositorio de EQ-Bench 4: https://github.com/EQ-bench/eqbench4
- *Framework* de RL mencionado (verl): referenciado como [verl] en la model card sin URL explícita; no disponible
