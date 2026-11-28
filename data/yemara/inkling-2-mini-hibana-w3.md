# yemara/Inkling-2-Mini-hibana-w3

## Resumen

Inkling-2-Mini-hibana-w3 es una cuantización a 3 bits del modelo thinkingmachines/Inkling-2-Mini, publicada por el usuario yemara bajo el formato W3 de Hibana (anteriormente sharar). No se trata de un modelo nuevo, sino de una copia comprimida de los pesos del modelo base que conserva la arquitectura original: un transformer con mezcla de expertos (MoE) de 128 expertos enrutados por capa y capas con bucle (looped-transformer) en las capas 6 a 17. El repositorio contiene únicamente las matrices cuantizadas (10,25 GB), mientras que el resto de componentes (embeddings, cabeza BF16, normas, router, torre de visión y tokenizer) se cargan desde el checkpoint base.

La relevancia de esta ficha radica en que demuestra una técnica de cuantización agresiva (3,75 bits por peso efectivos sobre 26.070 millones de parámetros, con un modelo servido de 12,22 GB) que mantiene un acuerdo top-1 del 93,5% con el modelo base y una divergencia KL de 0,032. Frente a métodos más simples como round-to-nearest (KL 0,091) o GPTQ estándar (KL 0,045), la combinación de GPTQ consciente del bucle y destilación con reconocimiento de cuantización (QAD) de NVIDIA ModelOpt reduce la pérdida de calidad de forma medible, aunque con una limitación conocida en razonamiento largo.

El modelo está pensado para despliegue en producción con motores que implementen los kernels W3 (Hibana o un port a SGLang), y su licencia Apache 2.0 facilita el uso comercial, sujeto a la política de uso aceptable de Thinking Machines.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con looped-transformer (128 expertos enrutados, capas 6-17 con tres pasadas y pesos compartidos) |
| Parametros totales | 26,07 mil millones |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se mencionan pruebas con truncación a 128K en LongBench v2 y presupuestos de 32K y 64K en HLE) |
| Tipos de cuantizacion | 3 bits (formato W3 de Hibana: 3,25 bits por peso más 32 bits por fila; 3,75 bits por peso efectivos en el modelo servido) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (sujeta a la política de uso aceptable de Thinking Machines) |
| Formato de pesos | Safetensors con `planes` (códigos de 3 bits como planos de bits), `scales` (E4M3 por grupo de 32 pesos) y `row_scale` (FP32 por fila); manifiesto `manifest.json` |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos: 24 capas, 128 expertos enrutados por capa y proyecciones de atención con dimensión latente (wq_du de 3072, wk_dv y wv_dv de 1024, gate_attn de 3072, wo_ud de 2304). Las capas 6 a 17 son capas con bucle que ejecutan tres pasadas compartiendo pesos. La cuantización cubre los 128 expertos de las 24 capas y las proyecciones de atención (q, k, v, gate, o), mientras que embeddings, cabeza, normas, router, proyecciones de posición relativa y sink, torre de visión y tokenizer permanecen en BF16.

El proceso de creación tuvo tres fases. Primero, se generaron datos de calibración a partir de prompts de Open-PerfectBlend, UltraChat, OpenCodeInstruct, aya, Nemotron instruction following, validación de MMLU y MMLU-Pro y LongAlign, respondidos por el propio modelo base con thinking activado y esfuerzo bajo, medio y alto (20/30/50%, temperatura 1,0), filtrando cualquier prompt que compartiera un tramo de 13 palabras con conjuntos de evaluación como HLE, LongBench v2, GPQA, MMLU-Pro test, MATH-500, GSM8K, HumanEval, MBPP, IFBench o RULER. Después se aplicó GPTQ consciente del bucle con hessianos por experto ponderados por el cuadrado del peso de enrutamiento, acumulados sobre 4,67 millones de tokens de calibración, sumando las tres pasadas de las capas con bucle al mismo hessiano. Finalmente se aplicó QAD con NVIDIA ModelOpt: estudiante con la numerica exacta de los kernels y profesor el modelo base, minimizando KL sobre el vocabulario con 6,5 millones de tokens de respuestas del propio modelo base en secuencias empaquetadas de 4K, entrenando los códigos latentes y ganancias de fila de las proyecciones de atención y las ganancias de fila de los expertos.

## Capacidades

- Generación de texto y razonamiento con modo thinking (esfuerzo configurable bajo, medio y alto).
- Razonamiento de múltiples pasos y tareas de largo contexto (evaluado en HLE con presupuestos de 32K y 64K tokens y en LongBench v2 con truncación a 128K).
- Capacidades de visión, ya que el modelo base incluye torre de visión (no cuantizada, se carga en BF16).
- Soporte de tool calling y function calling, con parser específico (`--tool-call-parser inkling2`) en el motor de servicio.
- Parsing de razonamiento (`--reasoning-parser inkling`) para separar trazas de pensamiento de la respuesta final.
- Capacidades multilingües: no disponible en la información proporcionada.
- Generación de código y matemáticas (evaluado en GSM8K y usado en datos de calibración de OpenCodeInstruct y HumanEval/MBPP).

## Casos de uso

- Razonamiento de largo contexto en documentación técnica: el modelo puede procesar ventanas de hasta 128K tokens (según las pruebas de LongBench v2 con truncación a 128K), lo que permite analizar repositorios completos o informes extensos en una sola pasada.
- Asistentes con tool calling en producción: el soporte de parsers de tool calling en SGLang permite integrarlo en pipelines de agentes que consultan APIs externas, con separación limpia entre traza de razonamiento y llamada a herramienta.
- Despliegue en hardware limitado: con 12,22 GB de modelo servido y 3,75 bits por peso, cabe en GPUs de consumo alto (por ejemplo, una RTX 4090 de 24 GB) y en una sola H100, reduciendo costes de infraestructura frente al modelo base en BF16.
- Evaluación de calidad de cuantizaciones: sirve como referencia para comparar técnicas de cuantización (round-to-nearest, GPTQ, QAD) mediante la métrica de divergencia KL y acuerdo top-1 frente al modelo base.
- Generación de código asistida: los datos de calibración incluyen OpenCodeInstruct y las evaluaciones de HumanEval y MBPP, lo que lo hace adecuado para autocompletado y revisión de código en entornos de CI/CD.
- Investigación en arquitecturas con bucle: al preservar el comportamiento de las capas 6-17 con tres pasadas, permite estudiar el efecto de la cuantización en modelos con pesos compartidos entre pasadas.
- Atención al cliente automatizada: la ventana de contexto larga y el modo thinking permiten gestionar conversaciones multi-turno con historial extenso, aunque la pérdida de precisión en razonamiento largo debe tenerse en cuenta.

## Benchmarks y rendimiento

Resultados publicados por el autor, comparando el modelo cuantizado con el modelo base tal como se publicó (expertos en NVFP4/MXFP8), sobre H100 mediante un port a SGLang de los kernels W3.

| Metrica | Base | Este modelo |
|---|---|---|
| KL respecto al base, respuestas held-out (465K tokens, vocabulario completo) | — | 0,032 (acuerdo top-1 93,5%) |
| HLE-Diamond, presupuesto 32K tokens (1000 preguntas) | 7,5% | 7,1% (−0,4 ± 1,8) |
| HLE-Diamond, presupuesto 64K tokens (1000 preguntas) | 11,9% | 8,8% (−3,1; IC 95% −5,0 a −1,2) |
| LongBench v2, corto + medio (395 preguntas, truncación 128K) | 59,7% | 59,0% (−0,8; IC 95% −4,6 a +3,1) |
| GSM8K, primeras 250 (sanidad) | 97,2% | 97,2% |

El autor reporta además la misma métrica KL para ajustes más simples: round-to-nearest 0,091 y GPTQ 0,045, frente al 0,032 de esta versión con GPTQ consciente del bucle más QAD.

## Requisitos de hardware

- Modelo servido completo: 12,22 GB (matrices de 3 bits de 10,25 GB más componentes BF16 cargados desde el checkpoint base).
- VRAM estimada para inferencia: al menos 12,22 GB solo para pesos; hay que añadir la caché KV y el espacio de activaciones, no cuantificados, por lo que se recomienda un margen adicional no especificado en la información disponible.
- GPU recomendadas: H100 (los números de benchmark se obtuvieron en H100 con `--tp 1 --ep 1`).
- Cabe en GPU de consumo: sí, en tarjetas con 24 GB o más (por ejemplo, RTX 4090), aunque la latencia y el throughput en ese hardware no están documentados.
- Opciones de despliegue: Hibana (motor con kernels W3) o un port a SGLang de los kernels W3, con backend de atención `fa4`, `page-size 128`, `--reasoning-parser inkling` y `--tool-call-parser inkling2`. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-hibana-w3 | 26,07B | no disponible | 3 bits (3,75 bits/peso efectivos) | Apache 2.0 | Hugging Face (yemara) |
| thinkingmachines/Inkling-2-Mini (base) | 26,07B | no disponible | NVFP4 / MXFP8 en expertos | Apache 2.0 | Hugging Face (Thinking Machines) |
| GPTQ estándar sobre el mismo base | 26,07B | no disponible | 3 bits | Apache 2.0 (derivada) | No publicado como artefacto; solo métrica KL (0,045) |
| Round-to-nearest sobre el mismo base | 26,07B | no disponible | 3 bits | Apache 2.0 (derivada) | No publicado como artefacto; solo métrica KL (0,091) |

No se dispone de información sobre otros modelos comparables de la misma categoría (MoE de ~26B con cuantización a 3 bits) en la documentación proporcionada.

## Limitaciones y advertencias

- Pérdida de calidad en razonamiento largo: en HLE con presupuesto de 64K tokens se pierden unos 3 puntos (de 11,9% a 8,8%), con un intervalo de confianza del 95% que excluye el cero.
- El diagnóstico del autor atribuye la mayor parte del error de largo alcance a las proyecciones de atención cuantizadas a 3 bits; los expertos cuantizados por sí solos se mantienen cerca del modelo base. Hay una revisión con atención de mayor precisión planificada.
- Dependencia de kernels específicos: requiere un motor con soporte de los kernels W3 y de Inkling-2-Mini (Hibana o port a SGLang); no es compatible con llama.cpp, Ollama ni TGI según la información disponible.
- El repositorio solo contiene las matrices cuantizadas; es imprescindible cargar el checkpoint base `thinkingmachines/Inkling-2-Mini` (revisión `c9d0283`) junto con este directorio.
- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información disponible; el modelo base y la cuantización pueden generar contenido incorrecto, especialmente en razonamiento largo.
- Idiomas soportados: no disponible; la cobertura multilingüe no está documentada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero está sujeta a la política de uso aceptable de Thinking Machines.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 28 de noviembre de 2026, por lo que su validación por la comunidad es aún inexistente.

## Enlaces

- [Hugging Face: yemara/Inkling-2-Mini-hibana-w3](https://huggingface.co/yemara/Inkling-2-Mini-hibana-w3)
- [Modelo base: thinkingmachines/Inkling-2-Mini](https://huggingface.co/thinkingmachines/Inkling-2-Mini)
- [Repositorio Hibana (antes sharar)](https://github.com/sharar-project/hibana)
- [Política de uso aceptable de Thinking Machines](https://thinkingmachines.ai/model-acceptable-use-policy/)
