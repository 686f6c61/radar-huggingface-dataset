# Soulfate24/H2O-Lightning-4B-Paretrix-GGUF

## Resumen

H2O-Lightning-4B-Paretrix-GGUF es una colección de cuantizaciones GGUF del modelo multimodal h2oai/h2o-lightning-4b, publicada por el usuario Soulfate24 bajo el paraguas de su suite Paretrix. El modelo base es un image-text-to-text de aproximadamente 4.205 millones de parámetros (4,2 B) orientado a toma de decisiones tipadas y calibración, con licencia Apache 2.0. Esta publicación no entrena un modelo nuevo: aplica una metodología de cuantización empírica sensible a activaciones que genera varias "escalas" (rungs) con distintos compromisos entre tamaño, fidelidad y latencia.

La relevancia de esta ficha está en el método de cuantización, no en el modelo en sí. Frente a la cuantización uniforme (aplicar una misma familia de bitwidth a toda la red), Paretrix mide la respuesta de cada clase de tensor a cada tipo de cuantización contra los logits BF16 de referencia y resuelve un problema de mochila exacto para repartir el presupuesto de bits. El resultado son variantes como Compact-33pc (2.723 MiB) que conservan el 87,0 % de accuracy en JevBench frente al 87,0 % del BF16, con una huella un 66 % menor.

El autor publica métricas de fidelidad sobre dos benchmarks propios: JevBench (231 decisiones tipadas) y JevOCRBench (300 filas de pregunta visual sí/no). No se han publicado datos de benchmarks estándar (MMLU, HumanEval, GSM8K) ni especificaciones del modelo base más allá de lo que declara el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal image-text-to-text; el repo solo publica pesos GGUF) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con escalas Paretrix: Fidelity-48pc, Precision-42pc, Quality-36pc, Compact-33pc, Mini-30pc, Nano-27pc, Pico-24pc, Femto-21pc; además bases stock Q8_0, Q6_K-imx, Q5_K_M-imx, IQ4_XS-imx, IQ3_M-imx |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp); el repo también declara librería transformers |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo base h2oai/h2o-lightning-4b: no se indica si es un transformer denso, un híbrido o si incorpora atención lineal, ni se detallan los datos de entrenamiento, el número de tokens, la composición del dataset o si hubo RLHF/DPO. Lo único verificable es el pipeline declarado (image-text-to-text) y el recuento de parámetros en safetensors (4,2 B).

La innovación técnica documentada corresponde al proceso de cuantización. Paretrix parte de tres bases stock (Q8_0, Q6_K-imx, IQ4_XS-imx), mueve cada clase de tensor de forma aislada a cada tipo de cuantización y mide la desviación respecto a los logits BF16. Con esas celdas resuelve una mochila exacta para planificar cada escala y decide mediante un duelo en el régimen de veredicto si el plan sustituye al campeón. El autor afirma que lo medido en un modelo se hereda al siguiente de la misma familia, lo que sugiere una metodología reutilizable más que un ajuste ad hoc.

## Capacidades

- Generación de texto conversacional (tag `conversational` en el repo).
- Procesamiento multimodal image-text-to-text: entrada de imagen y texto, salida de texto.
- Toma de decisiones tipadas y calibración, evaluadas mediante JevBench (231 decisiones tipadas).
- Respuesta a preguntas visuales de tipo sí/no, evaluadas mediante JevOCRBench (300 filas).
- Compatibilidad con llama.cpp y despliegue vía endpoints (tag `endpoints_compatible`).
- Soporte de cuantización híbrida con imatrix (tags `imatrix`, `hybrid-quantization`).
- Tool calling, function calling, agentes multi-paso, thinking mode, audio: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Toma de decisiones automatizada con umbrales calibrados: el modelo está orientado a decisiones tipadas y el autor publica métricas de calibración (KL óptimo, tasa de decisivos) por escala, lo que permite elegir la variante cuyo error de calibración sea aceptable para el dominio.
- Clasificación visual binaria en pipelines de OCR o verificación documental: JevOCRBench mide exactamente una pregunta visual sí/no con AUROC, de modo que la escala Nano-27pc (2.253 MiB, AUROC 0,853) es un candidato razonable para filtrado previo en servidores modestos.
- Despliegue en CPU o GPU de gama baja: con Femto-21pc (1.794 MiB) el modelo cabe en 2 GB de memoria, lo que habilita inferencia local en portátiles y dispositivos edge para tareas de decisión de baja latencia (p50 de 107 ms en JevBench según el autor).
- Enrutado y triaje en sistemas multi-agente: la variante Compact-33pc mantiene el 100 % de decisiones decisivas en JevBench con 2.723 MiB, útil como clasificador de intención o selector de herramienta antes de invocar un modelo mayor.
- Evaluación comparativa de metodologías de cuantización: el repositorio publica tablas de fidelidad (same, flips, decisive, opt KL) por escala frente a BF16, lo que sirve como referencia reproducible para investigar cuantización sensible a activaciones.
- Prototipado de asistentes con entrada de imagen en entornos con VRAM limitada: las escalas de 2-3 GB permiten iterar sobre tareas image-text-to-text sin aprovisionar GPUs de datacenter.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. JevBench, 231 decisiones tipadas:

| Modelo | MiB | acc | same | flips | decisive | opt KL | p50 ms |
|---|---:|---:|---:|---:|---:|---:|---:|
| BF16 (referencia) | 8034 | 87,0 | ref | — | — | — | — |
| Q8_0 (stock) | 4275 | 87,4 | 99,6 | 1 | 100,0 | 0,0003 | 111 |
| Fidelity-48pc | 3867 | 87,4 | 99,6 | 1 | 100,0 | 0,0004 | 111 |
| Precision-42pc | 3425 | 87,4 | 98,7 | 3 | 100,0 | 0,0006 | 116 |
| Q6_K-imx (stock) | 3304 | 87,0 | 99,1 | 2 | 100,0 | 0,0007 | 117 |
| Quality-36pc | 2964 | 86,6 | 98,7 | 3 | 99,5 | 0,0016 | 128 |
| Q5_K_M-imx (stock) | 2933 | 87,4 | 97,8 | 5 | 99,5 | 0,0019 | 131 |
| Compact-33pc | 2723 | 87,0 | 98,3 | 4 | 100,0 | 0,0017 | 110 |
| Mini-30pc | 2482 | 86,6 | 97,8 | 5 | 99,5 | 0,0042 | 101 |
| IQ4_XS-imx (stock) | 2398 | 88,3 | 97,8 | 5 | 100,0 | 0,0054 | 118 |
| Nano-27pc | 2253 | 86,6 | 96,5 | 8 | 99,1 | 0,0064 | 96 |
| IQ3_M-imx (stock) | 2063 | 85,7 | 95,2 | 11 | 97,6 | 0,0263 | 132 |
| Pico-24pc | 2023 | 87,4 | 95,7 | 10 | 98,1 | 0,0200 | 111 |
| Femto-21pc | 1794 | 87,4 | 95,2 | 11 | 98,6 | 0,0252 | 107 |

JevOCRBench, 300 filas, pregunta visual sí/no:

| Modelo | MiB | acc | AUROC | same | flips | decisive | opt KL | p50 ms |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| BF16 (referencia) | 8034 | 64,0 | 0,830 | ref | — | — | — | — |
| Q8_0 (stock) | 4275 | 63,3 | 0,828 | 99,3 | 2 | 100,0 | 0,0004 | 473 |
| Fidelity-48pc | 3867 | 64,3 | 0,826 | 98,3 | 5 | 100,0 | 0,0005 | 493 |
| Precision-42pc | 3425 | 63,0 | 0,827 | 97,7 | 7 | 100,0 | 0,0005 | 505 |
| Q6_K-imx (stock) | 3304 | 62,7 | 0,827 | 98,0 | 6 | 100,0 | 0,0008 | 506 |
| Quality-36pc | 2964 | 62,0 | 0,823 | 98,0 | 6 | 100,0 | 0,0013 | 491 |
| Q5_K_M-imx (stock) | 2933 | 62,7 | 0,830 | 96,0 | 12 | 100,0 | 0,0017 | 495 |
| Compact-33pc | 2723 | 63,0 | 0,834 | 95,7 | 13 | 98,8 | 0,0036 | 478 |
| Mini-30pc | 2482 | 63,3 | 0,841 | 94,7 | 16 | 99,2 | 0,0046 | 457 |
| IQ4_XS-imx (stock) | 2398 | 62,3 | 0,852 | 94,3 | 17 | 98,4 | 0,0081 | 450 |
| Nano-27pc | 2253 | 65,3 | 0,853 | 94,0 | 18 | 98,4 | 0,0074 | 434 |
| IQ3_M-imx (stock) | 2063 | 60,7 | 0,837 | 90,7 | 28 | 95,3 | 0,0177 | 489 |
| Pico-24pc | 2023 | 62,7 | 0,819 | 93,3 | 20 | 98,0 | 0,0104 | 460 |
| Femto-21pc | 1794 | 63,0 | 0,830 | 90,3 | 29 | 95,7 | 0,0185 | 462 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: desde ~1,8 GB (Femto-21pc) hasta ~3,9 GB (Fidelity-48pc) para los pesos GGUF; el BF16 de referencia ocupa 8.034 MiB.
- Cabe en GPU de consumo: sí, en todas las escalas. Una RTX 3060 de 12 GB o una RTX 4060 de 8 GB alojan incluso la variante Fidelity-48pc con margen para el contexto y el codificador visual.
- GPU recomendadas: RTX 4090, RTX 4080, RTX 3090 para latencias mínimas; RTX 3060/4060 y Apple Silicon para despliegue local. A100/H100 no son necesarias por tamaño, pero pueden usarse para servir muchas réplicas.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (importando el GGUF), y servidores compatibles con endpoints según el tag `endpoints_compatible`. vLLM y TGI no se declaran compatibles con GGUF en esta ficha.
- Latencia y throughput: el autor reporta p50 de 96-132 ms por decisión en JevBench y de 434-506 ms por consulta visual en JevOCRBench, sin especificar el hardware de medida. No se publica throughput (tokens/s).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| H2O-Lightning-4B-Paretrix-GGUF (este) | 4,2 B | no disponible | Apache 2.0 | GGUF | Cuantización empírica con escalas Paretrix; métricas propias JevBench/JevOCRBench |
| h2oai/h2o-lightning-4b | 4,2 B | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar; referencia BF16 del autor |
| Q8_0 / Q6_K / IQ4_XS stock | 4,2 B | no disponible | Apache 2.0 | GGUF | Cuantización uniforme estándar de llama.cpp; incluidas en las tablas como línea base |

No se dispone de información sobre otros modelos de decisión multimodal de tamaño comparable en la documentación proporcionada, por lo que la comparativa se limita al modelo base y a las cuantizaciones stock.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria independiente de las métricas publicadas.
- Las métricas de fidelidad (JevBench, JevOCRBench) son benchmarks propios del autor y no equivalentes a MMLU, HumanEval o GSM8K; no permiten comparar con el ecosistema general.
- El hardware y la configuración exacta de las mediciones de latencia no se especifican, por lo que los p50 (96-132 ms y 434-506 ms) no son directamente reproducibles.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas del modelo base; se desconoce si soporta castellano con calidad suficiente para producción.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y sus datos de entrenamiento pueden arrastrar obligaciones adicionales no declaradas en este repo.
- El repo ocupa 23,0 GB, muy por encima de la suma de las escalas listadas; conviene verificar qué ficheros se descargan antes de aprovisionar almacenamiento.
- Al ser una cuantización, hereda cualquier limitación del modelo base h2oai/h2o-lightning-4b, que no está documentada en esta ficha.
- El tag `transformers` convive con pesos GGUF; no está claro que la carga vía transformers funcione sin llama.cpp, por lo que el despliegue recomendado es el ecosistema GGUF.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Soulfate24/H2O-Lightning-4B-Paretrix-GGUF
- Modelo base: https://huggingface.co/h2oai/h2o-lightning-4b
- Suite de cuantización Paretrix: https://huggingface.co/Soulfate24/Paretrix_Quantization_Suite
