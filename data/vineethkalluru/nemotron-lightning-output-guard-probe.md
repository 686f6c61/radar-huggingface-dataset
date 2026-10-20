# vineethkalluru/nemotron-lightning-output-guard-probe

## Resumen

Nemotron Lightning Output-Guard Probe es un cabezal de clasificación (probe) diseñado para moderar las respuestas de un modelo generativo mientras este las escribe. No es un modelo de lenguaje: es una MLP de dos capas y 2,75 M de parámetros que lee los estados ocultos de las capas 31 y 44 del modelo `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4` (un MoE de 30B parámetros totales y 3B activos, servido en NVFP4) y estima la probabilidad de que la respuesta sea dañina. Lo publica el usuario `vineethkalluru` como artefacto de investigación, como mitad de salida del sistema ProbeGuard; la mitad de entrada es un probe separado sobre el mismo modelo base.

Su relevancia está en el coste: al reutilizar estados ocultos que el modelo ya calcula para cada token generado, no necesita un segundo modelo guard, ni un prefill adicional, ni llamadas repetidas a un clasificador externo. La variante `prefix` puntúa cada token de la respuesta, lo que permite aplicar una regla de parada en streaming y detener una respuesta dañina pocos tokens después de que empiece a serlo. En la evaluación publicada, con tasas de falsa parada y de detección equiparables, el probe detiene las respuestas dañinas entre 5 y 7 veces antes (mediana) que un guard de 4B consultado cada 128 tokens.

El repositorio tiene 0 descargas y 0 likes y un tamaño declarado de 0,0 GB, aunque la model card indica 11 MB por variante. No se han encontrado resultados de búsqueda web relevantes sobre este modelo: las consultas devolvieron únicamente páginas de Facebook sin relación alguna.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Probe: MLP de 2 capas (512 unidades) sobre estados ocultos concatenados de las capas 31 y 44 del modelo base; entrada de 2 x 2.688 dimensiones. Modelo base: transformer MoE (Nemotron 3.5 Lightning) |
| Parámetros totales | 2,75 M (cabezal). Modelo base: 30B según la nomenclatura del checkpoint |
| Parámetros activos | No aplica al cabezal (no es MoE). Modelo base: 3B activos según la nomenclatura del checkpoint |
| Longitud de contexto | No aplica al cabezal. Entrenamiento con prompt <= 768 tokens y respuesta <= 512 tokens. Contexto del modelo base: no disponible |
| Tipos de cuantización | Cabezal distribuido en safetensors sin cuantización declarada; el modelo base se sirve en NVFP4 |
| Idiomas soportados | No declarados. Los datos de entrenamiento citados incluyen Nemotron Safety Guard Dataset v3 en inglés; no se detalla la composición lingüística de Aegis 2.0 ni de WildGuardMix |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (`model.safetensors` en cada variante, más `config.json` y `probe_output.py`) |

## Arquitectura y entrenamiento

El cabezal es una MLP de dos capas con 512 unidades ocultas que recibe la concatenación del residual stream (pre-norm) tras los bloques 31 y 44 en cada token de respuesta: 2 x 2.688 = 5.376 dimensiones de entrada. La puntuación se calcula como `P(unsafe) = sigmoid(MLP((h - mu) / sigma) / T)`, con estandarización y temperatura de calibración ajustada en validación (T ≈ 2,9 para la variante `prefix`). Como la atención es causal, la puntuación en el token t depende solo de los t primeros tokens de la respuesta, lo que habilita el uso en streaming. Existen dos variantes: `prefix`, que lee las capas 31 y 44 en cualquier token de la respuesta, y `last`, que solo lee el último token para emitir un veredicto de respuesta completa.

El entrenamiento usa el modelo Lightning NVFP4 congelado como lector. Cada respuesta se pasa con teacher forcing con la plantilla de chat `[user: prompt, assistant: reply]` (prompt <= 768 tokens, respuesta <= 512) y las características se extraen de posiciones muestreadas de la respuesta. El conjunto son 36,3k pares prompt-respuesta etiquetados con daño a nivel de respuesta, con un 28% de ejemplos inseguros, procedentes de Aegis 2.0 train+val (CC-BY-4.0), Nemotron Safety Guard v3 en inglés (CC-BY-4.0) y una muestra de 20k de WildGuardMix train (ODC-BY); se eliminaron los prompts presentes en algún test y se reservó un 5% para validación. En la selección de cabezales sobre validación, los cabezales lineales sobre una sola capa alcanzan un AUROC máximo de 0,946 (capa 31); la MLP sobre las capas 31 y 44 llega a 0,955, y cinco capas (probadas entre la 26 y la 48) llegan a 0,956, por lo que se mantienen solo dos. A diferencia del probe de entrada, el daño de respuesta se beneficia de la no linealidad porque la etiqueta depende conjuntamente del prompt y de la respuesta.

En streaming, la regla de parada aplica una media móvil exponencial de `P(unsafe)` sobre w tokens y detiene la generación cuando se mantiene por encima de tau durante m tokens, reteniendo k = 8 tokens antes de enviarlos al cliente para que la parada no retracte nada ya visible. El `config.json` incluye combinaciones (w, tau, m) calibradas para presupuestos de falsa parada del 1% al 16%.

## Capacidades

- Clasificación de daño a nivel de respuesta (response moderation) sobre texto generado, con salida de probabilidad calibrada.
- Puntuación por token de la respuesta en curso, lo que permite parada temprana en generación streaming.
- Veredicto de respuesta completa mediante la variante `last` (o la variante `prefix` en el último token).
- Funcionamiento sin modelo guard adicional y sin prefill extra: consume estados ocultos ya calculados por el modelo servido.
- Reglas de parada preconfiguradas para distintos presupuestos de falsa parada (1-16%), seleccionadas en validación.
- Integración con vLLM mediante `extract_hidden_states` con ids de capa auxiliares `[31, 44]`, y con Transformers usando `hidden_states[31]` y `hidden_states[44]`.
- No genera texto, no hace tool calling, no soporta agentes ni razonamiento multi-paso y no procesa visión ni audio: es un cabezal de clasificación.
- Capacidades multilingües: no documentadas; los datos citados explícitamente son en inglés.

## Casos de uso

- Moderación de salida en streaming de un chatbot: el modelo base genera y, en cada token, el probe `prefix` actualiza `P(unsafe)`; cuando la media móvil supera tau durante m tokens se detiene la generación reteniendo 8 tokens, de modo que el usuario nunca ve el fragmento dañino. Es adecuado porque la puntuación es causal y no requiere llamadas externas.
- Reducción de coste en pipelines de moderación: sustituye al guard de 4B consultado periódicamente, con 0 llamadas a modelo guard por respuesta frente a 1,33-2,36 del enfoque por chunks en la evaluación publicada, y sin prefill adicional.
- Puerta de salida en asistentes con herramientas y agentes: antes de ejecutar una acción o devolver un resultado al usuario, el veredicto de respuesta completa (`last`) filtra la salida del agente usando los mismos estados ocultos del modelo que ya está en producción.
- Verificación por lotes de respuestas ya generadas: la variante `last` permite puntuar respuestas completas en procesos offline sin cambiar el motor de inferencia, solo capturando las activaciones de las capas 31 y 44.
- Investigación en interpretabilidad y probing: al leer capas concretas y comparar cabezales lineales frente a MLP, sirve como base reproducible para estudiar dónde se representa el daño en un MoE de 30B y cómo varía entre capas.
- Red teaming y evaluación de modelos: el score por token permite localizar el punto exacto en que una respuesta empieza a ser dañina, lo que aporta granularidad que un clasificador de respuesta completa no ofrece.
- Auditoría y cumplimiento: registrar `P(unsafe)` por token y la regla de parada aplicada deja una traza verificable de por qué se interrumpió cada respuesta.
- Despliegue con presupuesto de GPU ajustado: el cabezal son 11 MB y 2,75 M de parámetros, por lo que puede ejecutarse en CPU junto al servidor de inferencia, sin reservar VRAM adicional para un modelo guard.

## Benchmarks y rendimiento

Veredicto de respuesta completa (`P(unsafe) > 0,5`). Celdas en F1 / FPR / recall (%), con AUROC aparte. Comparación con Nemotron-3.5-Content-Safety (4B) en modo respuesta, sobre el mismo texto truncado y el mismo hardware (una DGX Spark).

| Modelo | Aegis 2.0 test (813) | AUROC | WildGuardTest response (1.708) | AUROC |
|---|---|---|---|---|
| Nemotron-3.5-Content-Safety (4B) | 84,8 / 16,0 / 86,0 | 0,928 | 76,7 / 5,3 / 78,9 | 0,925 |
| Probe `prefix` | 81,9 / 16,7 / 81,7 | 0,902 | 68,5 / 4,8 / 64,8 | 0,928 |
| Probe `last` | 79,5 / 18,4 / 78,9 | 0,878 | 69,3 / 6,0 / 69,0 | 0,926 |

Streaming. Baseline: Content-Safety-4B como rail de salida por chunks, comprobando el prefijo cada 128 tokens y parando en el primer veredicto inseguro. Probe: regla de parada del presupuesto de validación del 8%.

| Test set | Guard | Falsas paradas | Detección | Tokens filtrados p50 / p90 | Llamadas a guard por respuesta |
|---|---|---|---|---|---|
| Aegis 2.0 | Content-Safety-4B cada 128 tokens | 16,5% | 86,5% | 128 / 128 | 1,33 |
| Aegis 2.0 | Probe | 14,1% | 86,0% | 17 / 109 | 0 |
| WildGuardTest | Content-Safety-4B cada 128 tokens | 6,1% | 80,6% | 128 / 384 | 2,36 |
| WildGuardTest | Probe | 5,1% | 77,1% | 24 / 456 | 0 |

A igualdad de falsas paradas y detección, el probe detiene las respuestas dañinas entre 5 y 7 veces antes (mediana) sin llamar a ningún modelo guard. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, y no aplican a un cabezal de clasificación.

## Requisitos de hardware

- VRAM para el cabezal: despreciable; 11 MB en safetensors y 2,75 M de parámetros, ejecutable en CPU.
- Requisito real: servir el modelo base `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4` y exponer los estados ocultos de las capas 31 y 44. La VRAM necesaria para el modelo base no se detalla en la información disponible.
- GPU recomendadas: no disponibles. La única referencia de hardware en la model card es una DGX Spark, usada tanto para el probe como para el guard de 4B en la evaluación.
- GPU de consumo: no hay datos sobre si el modelo base cabe en GPU de consumo en NVFP4; el cabezal por sí solo sí es trivial en cualquier equipo.
- Despliegue: vLLM con `extract_hidden_states` y aux layer ids `[31, 44]`; Transformers accediendo a `hidden_states[31]` y `hidden_states[44]`. No hay información sobre uso con llama.cpp, Ollama o TGI, y estos stacks necesitarían exponer activaciones intermedias de capas concretas.
- Latencia y throughput: no disponibles. El coste declarado es cero llamadas a modelo guard y cero prefill adicional, con una sobrecarga de una MLP de 2 capas por token generado.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento (F1 Aegis 2.0 / WildGuardTest) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este probe (`prefix` / `last`) | Probe sobre hidden states | 2,75 M | No aplica (prompt <= 768, respuesta <= 512 en entrenamiento) | 81,9 / 68,5 (`prefix`); 79,5 / 69,3 (`last`) | CC-BY-4.0 | HuggingFace, 0 descargas, 0 likes |
| Nemotron-3.5-Content-Safety | Modelo guard generativo/clasificador | 4B | No disponible | 84,8 / 76,7 | No disponible en la información | HuggingFace (referencia de la comparación) |
| Probe de entrada de ProbeGuard (mitad de entrada) | Probe sobre hidden states del mismo base | No disponible | No aplica | No disponible | No disponible | HuggingFace, mismo autor |

Frente al guard de 4B, el probe pierde unos 3 puntos de F1 en Aegis 2.0 (con peor calidad de ranking, AUROC 0,902 frente a 0,928) y unos 8 puntos en WildGuardTest, aunque iguala el ranking (0,928 frente a 0,925). Su ventaja no es la precisión sino el coste y la latencia de detección en streaming.

## Limitaciones y advertencias

- Artefacto de investigación: el autor lo declara explícitamente como tal; no hay datos de uso en producción ni de robustez frente a tráfico real.
- Evaluación con teacher forcing: la model card indica que el entrenamiento y el test se hicieron con teacher forcing, y el texto disponible se corta en ese punto. El comportamiento autoregresivo real (leyendo los tokens que el modelo genera, no los de referencia) no está cuantificado en la información disponible.
- El probe pierde frente al guard de 4B en veredicto de respuesta completa: 3 puntos de F1 en Aegis 2.0 y 8 en WildGuardTest, con peor AUROC en Aegis.
- La cola de fugas es peor en WildGuardTest: p90 de 456 tokens filtrados frente a 384 del baseline, porque una respuesta que el probe no detecta se filtra entera.
- Tasa de falsas paradas no nula por diseño: 14,1% en Aegis 2.0 y 5,1% en WildGuardTest con el presupuesto del 8%; las reglas más estrictas (1%) reducen ese valor a costa de detectar menos.
- Acoplamiento al checkpoint base y a su cuantización: las características se extraen del Lightning NVFP4 concreto y congelado; no hay datos sobre transferencia a otros checkpoints, otras cuantizaciones o versiones actualizadas del modelo.
- Dependencia de la infraestructura: requiere un motor que exponga activaciones intermedias de capas concretas; no funciona como un endpoint de clasificación de texto convencional.
- Idiomas: los datos citados son en inglés y no se declaran idiomas soportados; el rendimiento en castellano no está documentado.
- Sesgos: no se documentan análisis de sesgo demográfico ni de disparidad de falsos positivos entre grupos; los falsos positivos implican respuestas legítimas truncadas.
- Licencia: el cabezal es CC-BY-4.0 y exige atribución. Las licencias del modelo base y del guard de comparación no se detallan en la información disponible y deben verificarse antes de un uso comercial.
- Riesgo de alucinación del clasificador: al ser una MLP pequeña sobre activaciones, puede producir puntuaciones calibradas solo en la distribución de entrenamiento (Aegis 2.0, Nemotron Safety Guard v3 y WildGuardMix) y degradarse fuera de ella.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad ni informes independientes de uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vineethkalluru/nemotron-lightning-output-guard-probe
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4
- Probe de entrada de ProbeGuard (mismo autor): https://huggingface.co/vineethkalluru/nemotron-lightning-guard-probe
- Variante `prefix`: https://huggingface.co/vineethkalluru/nemotron-lightning-output-guard-probe/tree/main/prefix
- Variante `last`: https://huggingface.co/vineethkalluru/nemotron-lightning-output-guard-probe/tree/main/last
- Modelo de comparación: https://huggingface.co/nvidia/Nemotron-3.5-Content-Safety
- Dataset Aegis 2.0: https://huggingface.co/datasets/nvidia/Aegis-AI-Content-Safety-Dataset-2.0
- Dataset Nemotron Safety Guard Dataset v3: https://huggingface.co/datasets/nvidia/Nemotron-Safety-Guard-Dataset-v3
- Dataset WildGuardMix: https://huggingface.co/datasets/allenai/wildguardmix
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada. La búsqueda web realizada no devolvió resultados relevantes sobre este modelo.
