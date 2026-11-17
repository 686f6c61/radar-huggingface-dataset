# ViezeVingertjes/Llama-3.2-1B-Instruct-EAGLE3

## Resumen

Llama-3.2-1B-Instruct-EAGLE3 es una cabeza borrador (draft head) de decodificación especulativa construida sobre la arquitectura EAGLE-3 y entrenada específicamente para acelerar la inferencia de Llama 3.2 1B Instruct. No es un modelo generativo autónomo: propone los siguientes tokens y el modelo objetivo los verifica en una sola pasada, de modo que la salida con muestreo greedy es idéntica a la del modelo principal mientras se reduce el número de pasadas hacia delante necesarias. Lo publica el usuario ViezeVingertjes junto con Turbo LLM, un runner en C para CPU.

La relevancia práctica está en que permite acelerar un modelo pequeño y de uso común sin alterar su comportamiento. Según la model card, en Turbo LLM alcanza 2,64 tokens por pasada en el conjunto completo de Spec-Bench y un multiplicador de velocidad de 2,21x frente a llama.cpp en bf16 sobre el subconjunto de desarrollo, con salida exacta en los 18 prompts de prueba. En llama.cpp (b12470) el mismo cabezal rinde 1,42x con 2,54 tokens por pasada.

El checkpoint se distribuye en formato SpecForge (`LlamaForCausalLMEagle3`) en bf16 y como GGUF para llama.cpp. El modelo base, Llama 3.2 1B Instruct, tiene 1.240 millones de parámetros y una ventana de contexto de 128.000 tokens; la cabeza en sí ocupa 121,8 millones de parámetros adicionales y está entrenada solo con datos en inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | EAGLE-3 (una capa decoder de Llama con proyección de features del target y MLP de 4096) |
| Parámetros totales | 121.804.032 (cabeza borrador); modelo base: 1.240 millones |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | heredada del modelo base Llama 3.2 1B Instruct (128.000 tokens); no especificada para la cabeza |
| Tipos de cuantización | bf16 (safetensors y GGUF BF16); formato propietario int5/lossless 12-bit en Turbo LLM |
| Idiomas soportados | en (inglés) |
| Licencia | llama3.2 |
| Formato de pesos | safetensors (bf16), GGUF (BF16), .tlm (Turbo LLM) |

## Arquitectura y entrenamiento

La cabeza sigue la arquitectura estándar EAGLE-3: una única capa decoder de Llama cuya entrada de atención es la embedding normalizada del token actual concatenada con una feature fusionada, obtenida mediante una proyección lineal de los estados ocultos del modelo objetivo en las capas 2, 8 y 13. Su MLP tiene 4096 unidades de ancho (la mitad que el del target) y su capa de salida cubre los 32.768 tokens más frecuentes del conjunto de entrenamiento, mapeados de vuelta al vocabulario completo mediante las matrices `d2t` y `t2d`. El checkpoint usa el layout SpecForge `LlamaForCausalLMEagle3` con los tensores `fc`, `midlayer.*`, `norm`, `lm_head`, `d2t` y `t2d`.

El entrenamiento es de autodestilación: 400.000 prompts de SmolTalk (eliminando los que aparecen en Spec-Bench) fueron respondidos por el propio Llama 3.2 1B Instruct con decodificación greedy, generando 220 millones de tokens. El objetivo es la divergencia KL respecto a la distribución del siguiente token del target, renormalizada sobre el vocabulario del borrador, con el test de entrenamiento de EAGLE-3 desplegado sobre 3 pasos de borrador y peso 0,8^k para el paso k. La optimización usó AdamW (lr 2e-4, betas 0,9/0,95, sin weight decay), 200 pasos de warmup seguidos de decaimiento coseno hasta el 10%, secuencias de 1.024 tokens y batch de 64 secuencias, con un coste de una hora en 4x H100. El modelo se inicializó a partir de una cabeza anterior entrenada con las respuestas propias de SmolTalk.

## Capacidades

- Generación de tokens borrador para decodificación especulativa sobre Llama 3.2 1B Instruct, con hasta 3 tokens propuestos por pasada y selección de árbol estilo EAGLE-2.
- Verificación exacta: con muestreo greedy la salida es idéntica a la del modelo objetivo en un runner exacto como Turbo LLM.
- Funciona con objetivos cuantizados (Q8_0, etc.), aunque en ese caso los borradores se verifican contra el modelo cuantizado y la salida deja de ser exacta respecto a fp32.
- Integración con llama.cpp mediante `--spec-type draft-eagle3` (probado con b12470).
- Integración con Turbo LLM, que incluye la cabeza compilada en su formato int5.
- Compatibilidad de formato con implementaciones EAGLE-3 como SGLang y vLLM (no probadas por el autor).
- No soporta tool calling, agentes, visión, audio ni modo thinking: es exclusivamente una cabeza borrador.
- Capacidad multilingüe limitada al inglés en la práctica (entrenada solo con datos de chat en inglés).

## Casos de uso

- Aceleración de chatbots en CPU: desplegar Llama 3.2 1B Instruct con Turbo LLM y esta cabeza reduce el coste por token generado manteniendo salida idéntica en greedy, lo que resulta adecuado para servicios con presupuesto de cómputo ajustado y sin GPU.
- Servidores llama.cpp existentes: añadir el GGUF con `--spec-type draft-eagle3` sobre un target Llama 3.2 1B Instruct ya desplegado proporciona un 1,42x de velocidad de decodificación sin cambiar la infraestructura ni el modelo principal.
- Generación de código y matemáticas en local: los grupos de tarea con mayor aceptación en Spec-Bench son math reasoning (3,16 tokens por pasada) y MT-Bench (2,76), por lo que la aceleración es más notable en tareas de razonamiento estructurado.
- Asistentes de resumen y QA sobre documentos: con 2,39 y 2,48 tokens por pasada en summarization y question answering respectivamente, encaja en pipelines de extracción de información donde el throughput importa.
- Traducción automática en inglés: el grupo de translation rinde 2,24 tokens por pasada, útil en servicios de traducción por lotes con objetivo inglés.
- RAG de bajo coste: con 2,57 tokens por pasada en el grupo RAG, sirve para responder consultas sobre contexto recuperado en despliegues sin GPU dedicada.
- Investigación en decodificación especulativa: como referencia reproducible (SmolTalk, 220M tokens, 4x H100 durante una hora) para comparar cabezales EAGLE-3 y estudiar la relación entre aceptación y dominio.

## Benchmarks y rendimiento

Spec-Bench (commit `fd2c1cd`, 480 preguntas, primer turno, hasta 1.024 tokens nuevos), greedy, hasta 3 tokens borrador por pasada con selección de árbol EAGLE-2, en Turbo LLM:

| Grupo de tarea | Tokens por pasada |
|---|---|
| MT-Bench | 2,76 |
| Traducción | 2,24 |
| Resumen | 2,39 |
| Question answering | 2,48 |
| Razonamiento matemático | 3,16 |
| RAG | 2,57 |
| Todos | 2,64 |

Comparativa en llama.cpp b12470 (`--spec-type draft-eagle3`, hasta 3 tokens borrador, target y cabeza en bf16), subconjunto de desarrollo de Spec-Bench (18 preguntas, hasta 1.024 tokens nuevos):

| Cabeza borrador | Tokens por pasada | Velocidad de decodificación vs. sin borrador | Salida idéntica a sin borrador |
|---|---|---|---|
| Esta cabeza | 2,54 | 1,42x (16,17 vs 11,36 tok/s) | no, 15 de 18 |
| rescommons/SpecForge-EAGLE3-Llama-3.2-1B-Instruct | 2,09 | 1,12x (12,71 vs 11,36 tok/s) | no, 15 de 18 |

Comparativa de motores con la misma cabeza y los mismos prompts (subconjunto de desarrollo de Spec-Bench, hasta 1.024 tokens nuevos):

| Motor | Pesos | Velocidad de decodificación | Salida |
|---|---|---|---|
| llama.cpp b12470 + esta cabeza | bf16 | 1x (baseline) | difiere del exacto en 3 de 18 |
| llama.cpp b12470 + esta cabeza | Q8_0 | 1,35x | con pérdida (8 bits), difiere en 10 de 18 |
| Turbo LLM + esta cabeza | lossless 12-bit | 2,21x | exacta en los 18 |

De extremo a extremo, incluyendo el procesamiento del prompt, Turbo LLM es 1,93x llama.cpp bf16 con esta cabeza. La model card atribuye las diferencias de llama.cpp al redondeo bf16 por lotes: su salida difiere en 2 de 18 prompts incluso sin borrador, y la verificación por lotes cambia uno más.

## Requisitos de hardware

- La cabeza en sí ocupa 0,5 GB en el repositorio (bf16) y 121,8 millones de parámetros; se suma al modelo objetivo de 1.240 millones.
- En Turbo LLM el fichero completo `.tlm` pesa 2,1 GB y está pensado para ejecución en CPU, sin GPU.
- VRAM estimada para llama.cpp: no disponible de forma explícita en la información; depende del GGUF del target (bf16 o cuantizado) más el GGUF BF16 de la cabeza.
- GPU recomendadas: no especificadas; el entrenamiento usó 4x H100, pero la inferencia está orientada a CPU.
- Cabe en GPU de consumo: previsiblemente sí con target cuantizado y cabeza BF16, aunque no se publican cifras de VRAM.
- Opciones de despliegue: llama.cpp (b12470, `--spec-type draft-eagle3`) y Turbo LLM; el formato SpecForge es legible por SGLang y vLLM según el autor, pero no probado.
- Latencia y throughput: 16,17 tok/s en llama.cpp bf16 con la cabeza frente a 11,36 tok/s sin borrador (subconjunto de 18 preguntas); 2,21x de decodificación y 1,93x de extremo a extremo en Turbo LLM frente a llama.cpp bf16.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ViezeVingertjes/Llama-3.2-1B-Instruct-EAGLE3 | Cabeza EAGLE-3 | 121,8 M | heredado del target | 2,54 tok/pasada, 1,42x en llama.cpp; 2,64 tok/pasada en Turbo LLM | llama3.2 | Hugging Face, GGUF, .tlm |
| rescommons/SpecForge-EAGLE3-Llama-3.2-1B-Instruct | Cabeza EAGLE-3 | no disponible | heredado del target | 2,09 tok/pasada, 1,12x en llama.cpp | no disponible | Hugging Face |
| Llama 3.2 1B Instruct (sin borrador) | Modelo generativo | 1.240 M | 128.000 tokens | 11,36 tok/s en el mismo entorno | llama3.2 | Hugging Face, GGUF |

## Limitaciones y advertencias

- Solo es útil con Llama 3.2 1B Instruct: lee los estados ocultos de ese modelo y se entrenó con sus salidas; no funciona con otros targets.
- Entrenada con datos de chat en inglés; otros idiomas y dominios muy distintos verán menor aceptación y menos aceleración (la corrección no se ve afectada porque los borradores siempre se verifican).
- Con objetivos cuantizados la salida deja de ser exacta: en Q8_0 difiere del resultado fp32 en 10 de 18 prompts del subconjunto de prueba.
- En llama.cpp la salida no es idéntica a la del target incluso en bf16 (15 de 18), por el redondeo bf16 por lotes y la verificación por lotes; solo un runner exacto como Turbo LLM garantiza identidad en greedy.
- Los prompts de entrenamiento provienen de SmolTalk y se eliminaron los que aparecen en Spec-Bench, lo que reduce el riesgo de contaminación pero no lo elimina para otros conjuntos.
- Licencia llama3.2: el uso comercial está sujeto a los términos de la licencia de Llama 3.2, que incluyen restricciones y obligaciones de atribución.
- Compatibilidad con SGLang y vLLM no verificada por el autor; solo llama.cpp b12470 y Turbo LLM están probados.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ViezeVingertjes/Llama-3.2-1B-Instruct-EAGLE3
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Turbo LLM (runner en C): https://github.com/ViezeVingertjes/turbo-llm
- Paper EAGLE-3 (arXiv:2503.01840): https://arxiv.org/abs/2503.01840
- Dataset SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Cabeza EAGLE-3 alternativa: https://huggingface.co/rescommons/SpecForge-EAGLE3-Llama-3.2-1B-Instruct
