# zapabobouj/Inkling-2-Mini-Heretic-Agentic-128K-GGUF

## Resumen

Inkling-2-Mini Heretic Agentic 128K (Mode B) es una build GGUF cuantizada del modelo base `thinkingmachines/Inkling-2-Mini`, sobre el que se ha aplicado una ablación de tipo "heretic" (eliminación de comportamientos de rechazo) publicada por `yanauto/Inkling-2-Mini-heretic-full`. El autor de esta ficha técnica, `zapabobouj`, no entrena un modelo nuevo: empaqueta los pesos del modelo heretic en un GGUF con un esquema de cuantización mixta muy agresivo (NVFP4 para los expertos MoE, Q6_K para embeddings y LM head, PQ2_0 para las proyecciones densas de atención) orientado a ejecución local en una única GPU de consumo.

El modelo conserva la arquitectura MoE del original, con 48 bancos de expertos y una ventana de contexto declarada de 128K tokens (131.072). Su relevancia es doble: por un lado demuestra la viabilidad de cuantizaciones de 4 bits por bloque (NVFP4) en un MoE con expertos dispersos; por otro, expone de forma inusualmente transparente las limitaciones de la build, con un estado `releaseQualified=false` y una batería de mediciones locales documentadas con evidencias.

Las mediciones locales del autor son modestas: 50,0% en un subconjunto de 30 preguntas de MMLU de matemáticas elementales, 1/4 en una suite de código y 0/2 en coincidencia de argumentos para tool calling. El propio autor advierte que estas cifras no son comparables con el 77,0% de MMLU del modelo heretic upstream sobre 1.000 preguntas mixtas, que no se ha reproducido en esta build.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (48 bancos de expertos), atención densa |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens (128K) |
| Tipos de cuantizacion | Mixta: expertos MoE en NVFP4, embeddings y LM head en Q6_K, proyecciones de atención en PQ2_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer con mezcla de expertos (MoE) de 48 bancos de expertos, heredada de `thinkingmachines/Inkling-2-Mini`. Esta build no entrena ni ajusta los pesos: parte del GGUF de origen y aplica una cuantización selectiva por tipo de tensor. Los expertos MoE se almacenan en NVFP4 (formato de coma flotante de 4 bits con escalas por bloque), el token embedding y la LM head en Q6_K, y las 120 proyecciones densas de atención en PQ2_0. El autor verifica la paridad de escalas NVFP4 con 96 registros y 12.288 valores de escala sin error absoluto máximo (`max_abs_err=0.0`).

Una innovación técnica destacable es la ablación comparativa de la LM head documentada: con los mismos estados ocultos, Q6_K produce una divergencia KL de 0,000605 nats frente a 0,25619 nats de PQ2_0, con una concordancia top-1 del 99,115% frente al 83,481%. Esto justifica la elección de mantener la LM head en Q6_K en lugar de degradarla a PQ2_0. No hay información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo original usó RLHF o DPO. El modelo heretic upstream (`yanauto/Inkling-2-Mini-heretic-full`) es el resultado de una ablación orientada a reducir rechazos, pero no se detalla la metodología en la información disponible.

## Capacidades

- Generación de texto autoregresiva en formato GGUF, ejecutable con llama.cpp y derivados.
- Razonamiento y matemáticas: el autor reporta 50,0% en un subconjunto de 30 preguntas de MMLU de matemáticas elementales con protocolo de logits y `reasoning effort=none`.
- Generación de código: suite local de 4 pruebas con 1/4 superadas (0/3 en Python, 1/1 en compilación CUDA).
- Tool calling / function calling: selección de función correcta en 2/2 casos, pero coincidencia de argumentos 0/2 y cumplimiento de esquema 0/2.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Contexto largo: ventana declarada de 128K tokens; la prueba de recuperación en contexto largo de 131K no está registrada como medida.
- Modo de razonamiento: la model card menciona `reasoning effort` como parámetro de evaluación, pero no se documenta un modo "thinking" específico en esta build.
- Visión y audio: no disponibles.

## Casos de uso

- Evaluación de cuantizaciones NVFP4 en MoE: este GGUF sirve como banco de pruebas para medir el impacto de cuantizar expertos a 4 bits frente a mantener la LM head en Q6_K, con métricas de divergencia KL y concordancia top-1 ya documentadas.
- Inferencia local en GPU de consumo: con 16 GiB de VRAM (RTX 5060 Ti) el autor carga el modelo a 131K de contexto en 114,95 s y genera a 23,47 tok/s, lo que permite prototipado de agentes en una sola máquina sin infraestructura cloud.
- Experimentación con modelos "heretic": útil para investigadores que estudian la eliminación de comportamientos de rechazo y quieren comparar la versión completa frente a una build cuantizada local.
- Pruebas de tool calling en pipelines de agentes: aunque la coincidencia de argumentos es 0/2, la selección de función 2/2 permite usar el modelo como banco de pruebas para validar harnesses de function calling antes de pasar a modelos mayores.
- Generación de código asistida en local: con 1/4 en la suite de código, es adecuado para tareas de autocompletado simples o generación de fragmentos cortos, no para producción crítica.
- Investigación sobre decodificación y contexto largo: la ventana de 128K permite experimentar con prompts extensos, aunque la calidad en ventana completa no está cualificada según el autor.
- Reproducibilidad de benchmarks: la build incluye artefactos de evidencia (`modeB_rust_preflight.json`, `modeB_lm_head_ablation.json`, etc.) que permiten replicar las mediciones en hardware idéntico.

## Benchmarks y rendimiento

| Benchmark | Resultado local | Notas |
|---|---|---|
| MMLU (elementary_mathematics, 30 preguntas, logits) | 15/30 = 50,0% | Subconjunto pequeño, no comparable con el 77,0% upstream sobre 1.000 preguntas mixtas |
| Suite de código | 1/4 | Python 0/3, compilación CUDA 1/1 |
| Tool calling: selección de función | 2/2 | — |
| Tool calling: coincidencia de argumentos | 0/2 | — |
| Tool calling: cumplimiento de esquema | 0/2 | — |
| AIME 2025 | no medida | Re-ejecución corregida devuelve campo de respuesta vacío en 6/6 |
| Apex 2025 | no medida | Re-ejecución devuelve campo de respuesta vacío en 6/6 |
| Comportamiento de rechazo (24 prompts) | no medida | Re-ejecución devuelve campo de respuesta vacío en 24/24 |
| Recuperación en contexto largo 131K | no medida | No registrada |

El autor documenta que una ejecución previa de MMLU basada en generación reportó 0/30 y fue anulada por un fallo del harness (se enviaban IDs de token en lugar del texto de la pregunta). La cifra de 50,0% procede únicamente del protocolo de logits. Las cifras de AIME 6/6 y 0% de sobrerrechazo que aparecían en versiones anteriores están marcadas como no válidas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el autor reporta carga correcta a 131.072 de contexto en una RTX 5060 Ti de 16 GiB, con sospecha de "silent shared spill" (derrame a memoria compartida del sistema).
- GPU recomendadas: NVIDIA GeForce RTX 5060 Ti 16 GiB es la única configuración verificada. No se documentan pruebas en A100, H100 ni RTX 4090.
- ¿Cabe en GPU de consumo? Sí, según la medición del autor en RTX 5060 Ti 16 GiB, aunque con posible derrame a memoria compartida a contextos de 131K.
- Opciones de despliegue: llama.cpp y derivados compatibles con GGUF (no se confirma Ollama, vLLM ni TGI en la información disponible).
- Latencia y throughput: 23,47 tok/s a 131.072 de contexto con `ub=16` (carga en 114,95 s) y 22,39 tok/s a 147.456 de contexto con `ub=32` (carga en 120,96 s). Dos de las seis configuraciones de VRAM probadas no alcanzaron estado saludable en 180 s y se registran como fallos de carga.
- Hardware de referencia: AMD Ryzen 5 4500, 32 GiB DDR4, NVIDIA GeForce RTX 5060 Ti 16 GiB, driver 621.24.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini Heretic Agentic 128K (Mode B) | no disponible (MoE 48 expertos) | 131.072 | 50,0% (30 preguntas, logits) | Apache 2.0 | GGUF local |
| thinkingmachines/Inkling-2-Mini (base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| yanauto/Inkling-2-Mini-heretic-full | no disponible | no disponible | 77,0% (1.000 preguntas) | no disponible | Hugging Face |

No se dispone de datos de benchmarks ni especificaciones de modelos alternativos de otros autores en la información proporcionada, por lo que la comparativa se limita a las variantes del mismo linaje.

## Limitaciones y advertencias

- La build está marcada con `releaseQualified=false`: no es una release cualificada para producción.
- Las cifras de MMLU (50,0%) corresponden a un subconjunto de 30 preguntas de una sola asignatura y no son comparables con el 77,0% upstream sobre 1.000 preguntas mixtas.
- Tool calling con coincidencia de argumentos 0/2 y cumplimiento de esquema 0/2: no es fiable para agentes que requieran llamadas con parámetros estructurados.
- Generación de código limitada: 0/3 en pruebas de Python.
- AIME 2025, Apex 2025, comportamiento de rechazo y recuperación en contexto largo no están medidos; las cifras previas que circulaban (AIME 6/6, 0% de sobrerrechazo) están anuladas por fallos del harness.
- Inferencia en ventana completa, calidad en baja precisión en tareas generales, concurrencia en GPU y firma Authenticode en Windows no están cualificadas.
- Sospecha de "silent shared spill" a contextos de 131K y 147K en la RTX 5060 Ti, lo que puede degradar el rendimiento de forma no determinista.
- La build mantiene un side-car `.pt` de memoria de pesos en `H:\Strata\memory\inkling2_modeB_weight_memory.pt`, inicializado a cero, de modo que la salida GGUF es idéntica bit a bit hasta que se escriba una consolidación.
- El modelo heretic está diseñado para reducir rechazos, lo que puede aumentar el riesgo de generar contenido dañino o inapropiado; no hay medición válida de sobrerrechazo en esta build.
- Licencia Apache 2.0 permite uso comercial, pero la falta de cualificación de la build desaconseja su uso en producción sin una evaluación propia.
- No se declaran idiomas soportados, por lo que el rendimiento multilingüe es desconocido.
- Riesgo de alucinación: no cuantificado en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/zapabobouj/Inkling-2-Mini-Heretic-Agentic-128K-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Modelo heretic upstream: https://huggingface.co/yanauto/Inkling-2-Mini-heretic-full
