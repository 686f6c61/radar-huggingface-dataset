# Soulfate24/AutoRound-ASHQ1-Remix_Double-Quantization_Suite

## Resumen

AutoRound-ASHQ1-Remix_Double-Quantization_Suite es un conjunto de herramientas y pipelines de cuantización de modelos de lenguaje, desarrollado por Soulfate24, que combina el toolkit AutoRound de Intel con un motor propio de asignación de tensores sensible a la activación (ASHQ1). Su objetivo es producir archivos GGUF de ultra alta fidelidad a partir de modelos en BF16, con ratios de compresión que van del 24% al 48% del tamaño original, manteniendo métricas de calidad medidas experimentalmente (perplejidad, divergencia KL, etc.).

La suite se presenta como un "remix" de doble cuantización, con una escalera de siete niveles (Pico, Nano, Mini, Compact, Quality, Precision y Fidelity) validada en seis familias de modelos, incluyendo arquitecturas híbridas, densas y con torres de visión. Incluye scripts de calibración, generación de imatrix, cuantización, pruebas de perplejidad y sondas de atribución, todo bajo licencia Apache-2.0. Es relevante porque ofrece un flujo de trabajo completo y medible para desplegar LLMs en entornos con VRAM limitada, con políticas de selección de nivel basadas en experimentos, no en reglas heurísticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de cuantizacion (AutoRound + ASHQ1-Remix) |
| Parametros totales | no disponible (depende del modelo cuantizado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo cuantizado) |
| Tipos de cuantizacion | ASHQ1 (ratios 24/27/30/33/36/42/48%), AutoRound W4A16, GGUF Q6_K (niveles Precision/Fidelity) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF, safetensors (BF16) |

## Arquitectura y entrenamiento

La suite no es un modelo entrenado, sino un conjunto de herramientas de cuantizacion. Su arquitectura interna se compone de un pipeline en tres fases: (1) conversion de safetensors a GGUF BF16 con metadatos de procedencia, (2) generacion de dataset de calibracion e imatrix especifico por familia de modelo, y (3) cuantizacion ASHQ1 con un optimizador tipo "knapsack" que asigna niveles de bits por capa segun la sensibilidad a la activacion, aplicando suelos y limites explicitos. Incluye un motor separado para torres de vision (ASHQ1-mmproj) y para drafts especulativos (DSpark), que no usan imatrix.

El entrenamiento de los modelos base no es parte de la suite; esta se apoya en AutoRound de Intel, que usa descenso por gradiente de signo para reorganizar pesos a ultra-baja precision (2-4 bits). La suite anade una capa de validacion experimental: cada ratio, suelo y limite se justifica con experimentos de "knockout" y comparaciones contra gemelos de stock, documentados en un "Calibration Ledger" con ocho leyes empiricas.

## Capacidades

- Cuantizacion de modelos LLM y VLM a formatos GGUF con ratios configurables entre 24% y 48% del tamano original.
- Soporte para arquitecturas hibridas (dispersas con proyectores), densas y modelos con torres de vision (OvisOCR2, etc.).
- Generacion automatica de datasets de calibracion e imatrix especificos por familia de modelo.
- Pruebas de calidad integradas: perplejidad (PPL), divergencia KL, RMS delta de probabilidad y top-p.
- Sondas de atribucion para verificar que cada capa contribuye correctamente a la salida.
- Politica de seleccion de nivel basada en mediciones: minimos de compresion segun tamano y arquitectura del modelo.
- Modo de cuantizacion para drafts especulativos (DSpark) con metricas de tasa de aceptacion.
- Compatibilidad con llama.cpp para inferencia de los GGUF resultantes.

## Casos de uso

- Despliegue de LLMs en VRAM limitada: con el nivel Pico (24%) se pueden servir modelos de 9B en tarjetas de 4-6 GB, aunque la calidad baja (KLD 0.13 en Ornith-1.5-9B). Adecuado para prototipos o demos donde el presupuesto de memoria es critico.
- Servicio de modelos en produccion con calidad casi sin perdida: el nivel Precision (42%) ofrece KLD entre 0.0021 y 0.0132 en los modelos probados, con un tamano de 8.4 GB para un 9B, apto para GPUs de 12-16 GB.
- Cuantizacion de modelos hibridos o con vision: la suite incluye motores dedicados para torres de vision y arquitecturas dispersas, permitiendo comprimir modelos multimodales sin degradar la parte visual.
- Evaluacion de trade-offs compresion/calidad: los scripts de perplejidad y KLD permiten a un equipo elegir el nivel optimo para su caso antes de desplegar.
- Integracion en pipelines de CI/CD: los scripts de Python pueden ejecutarse en entornos automatizados para generar GGUF de cada release de un modelo.
- Archivo de modelos a largo plazo: el nivel Fidelity (48%) usa Q6_K plano con lever de embeddings, pensado para preservar la maxima fidelidad en almacenamiento.

## Benchmarks y rendimiento

La model card publica resultados de calidad de cuantizacion sobre wiki.test.raw con referencia FA-auto simetrica. Se muestran dos ejemplos:

**Ornith-1.5-9B (hibrido, linaje plano)**

| Tier | Tamano | PPL | KLD | RMS Δp | top-p |
| :--- | ---: | ---: | ---: | ---: | ---: |
| Fidelity-48pc | 9464 MiB | 9.5239 | 0.0081 | 2.43% | 97.6% |
| Precision-42pc | 8414 MiB | 9.4347 | 0.0132 | 3.04% | 96.6% |
| Quality-36pc | 6330 MiB | 9.3692 | 0.0366 | 5.00% | 93.3% |
| Compact-33pc | 5803 MiB | 9.6043 | 0.0517 | 5.91% | 91.6% |
| Mini-30pc | 5385 MiB | 9.8564 | 0.0649 | 6.67% | 90.3% |
| Nano-27pc | 4750 MiB | 10.1061 | 0.0907 | 7.90% | 87.8% |
| Pico-24pc | 4389 MiB | 10.1078 | 0.1309 | 9.63% | 85.0% |

**Qwen3.8-4B-Distill (hibrido, linaje plano)**

| Tier | Tamano | PPL | KLD | RMS Δp | top-p |
| :--- | ---: | ---: | ---: | ---: | ---: |
| Fidelity-48pc | 3866 MiB | 9.0744 | 0.0014 | 1.01% | 98.1% |
| Precision-42pc | 3509 MiB | 9.0818 | 0.0021 | 1.20% | 97.6% |
| Quality-36pc | 2902 MiB | 9.1124 | 0.0095 | 2.56% | 95.1% |
| Compact-33pc | 2661 MiB | 9.1963 | 0.0160 | 3.31% | 93.7% |
| Mini-30pc | 2420 MiB | 9.2973 | 0.0258 | 4.26% | 92.1% |
| Nano-27pc | 2245 MiB | 9.5957 | 0.0546 | 6.61% | 88.7% |
| Pico-24pc | 2168 MiB | 9.6579 | 0.0636 | 6.95% | 87.9% |

No se proporcionan benchmarks de tareas (MMLU, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware

- Para ejecutar la suite de cuantizacion se necesita una GPU con al menos 16 GB de VRAM para modelos de 9B en BF16 durante la calibracion; se recomienda una RTX 4090 o A100.
- Los GGUF resultantes tienen requisitos variables: un modelo 9B en nivel Mini (30%) ocupa 5.4 GB, cabe en una RTX 3060 12GB o similar; en nivel Precision (42%) ocupa 8.4 GB, requiere 12-16 GB de VRAM.
- Para modelos 4B, el nivel Mini (30%) ocupa 2.4 GB, apto para GPUs de 4-6 GB (ej. RTX 3050, GTX 1660).
- La inferencia de los GGUF se puede realizar con llama.cpp, Ollama o servidores compatibles con GGUF (llama-server, etc.).
- El throughput depende del hardware y del nivel de cuantizacion; no se proporcionan cifras concretas en la documentacion.

## Comparativa con modelos similares

La suite compite con otras herramientas de cuantizacion GGUF:

| Herramienta | Enfoque | Ratios tipicos | Licencia | Soporte vision | Validacion experimental |
| :--- | :--- | :--- | :--- | :--- | :--- |
| AutoRound-ASHQ1-Remix (esta suite) | AutoRound + ASHQ1 con imatrix | 24-48% | Apache-2.0 | Si (mmproj) | Si (ledger L0-L8) |
| llama.cpp (k-quants) | Cuantizacion estatica por bloques | 25-50% (Q2_K a Q8_0) | MIT | Parcial | No sistematica |
| AutoGPTQ | Cuantizacion GPTQ con calibracion | 4 bits (W4A16) | MIT | Limitado | No |
| Intel AutoRound (standalone) | Gradiente de signo, W4A16 | 2-4 bits | Apache-2.0 | Si | Parcial |

La suite se diferencia por su escalera de siete niveles con metricas de calidad publicadas y por su politica de minimos basada en arquitectura, algo poco comun en otras herramientas.

## Limitaciones y advertencias

- La suite no incluye modelos base; solo cuantiza modelos existentes. El rendimiento final depende del modelo original.
- Los niveles Pico (24%) y Nano (27%) estan bloqueados por defecto en linajes int4 (AutoRound) y requieren activacion explicita; su uso puede degradar significativamente la calidad (KLD > 0.09 en 9B).
- La validacion se ha realizado en un conjunto limitado de familias (qwen35, OvisOCR2, SmolLM3, llama 1B, LFM2.5); otros modelos pueden comportarse de forma distinta.
- No se proporcionan benchmarks de tareas estandar (MMLU, HumanEval, GSM8K), solo metricas de perplejidad y divergencia sobre wiki.test.raw.
- La documentacion menciona "suelos que nunca mienten" y "fallos honestos", pero no detalla los criterios exactos de rechazo; en produccion conviene validar el GGUF resultante con casos reales.
- La licencia Apache-2.0 permite uso comercial, pero los modelos cuantizados heredan la licencia de su modelo base, que puede ser mas restrictiva.
- No hay informacion sobre sesgos o alucinaciones, ya que no es un modelo sino una herramienta; estos riesgos dependen del modelo cuantizado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Soulfate24/AutoRound-ASHQ1-Remix_Double-Quantization_Suite
- Suite original (AutoRound + ASHQ1 Double-Quantization): https://huggingface.co/Soulfate24/AutoRound-ASHQ1_Double-Quantization_Suite
- GitHub de Intel AutoRound: https://github.com/intel/auto-round
- Documentacion de esquemas de cuantizacion de AutoRound: https://deepwiki.com/intel/auto-round/4.1-quantization-schemes
