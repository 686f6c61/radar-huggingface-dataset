# Soulfate24/Unlimited-OCR-2-Paretrix-GGUF

## Resumen

Unlimited-OCR-2-Paretrix-GGUF es una coleccion de cuantizaciones GGUF del modelo base baidu/Unlimited-OCR-2, un modelo vision-language especializado en reconocimiento optico de caracteres (OCR) desarrollado por Baidu. La publica el usuario Soulfate24 bajo el paraguas de su suite de cuantizacion Paretrix, que aplica una planificacion no uniforme por clases de tensores en lugar de una asignacion homogenea de bits. El modelo resuelve el problema de ejecutar OCR multimodal de calidad en hardware modesto mediante compresion agresiva pero medida contra los logits de referencia en BF16.

El modelo base tiene 2.938.670.848 parametros (~2,94 mil millones) y se distribuye con licencia MIT, lo que lo hace atractivo para integracion comercial. Esta ficha se centra en la variante GGUF cuantizada, pensada para inferencia con llama.cpp y compatible con endpoints de tipo transformers. El repositorio ocupa 16,2 GB e incluye multiples niveles de cuantizacion con perfiles de fidelidad distintos (desde Fidelity-48pc hasta Femto-21pc).

La relevancia actual reside en que permite desplegar un OCR vision-language multilingue en GPU de consumo o incluso CPU, con tamanos que van desde 1261 MiB (Femto-21pc) hasta 2989 MiB (Q8_0 stock). La suite Paretrix documenta metricas objetivas de perplejidad (PPL), divergencia KL (KLD) y RMS delta-p para cada nivel, lo que facilita elegir el compromiso calidad/tamano adecuado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (modelo base baidu/Unlimited-OCR-2); detalles internos no disponibles |
| Parametros totales | 2.938.670.848 (~2,94 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q8_0, Q6_K-imx, Q5_K_M-imx, IQ4_XS-imx, IQ3_M-imx (stock) y niveles Paretrix: Fidelity-48pc, Precision-42pc, Quality-36pc, Compact-33pc, Mini-30pc, Nano-27pc, Pico-24pc, Femto-21pc |
| Idiomas soportados | multilingue |
| Licencia | MIT |
| Formato de pesos | GGUF (repo de 16,2 GB; tambien etiquetado como transformers) |

## Arquitectura y entrenamiento

El modelo base baidu/Unlimited-OCR-2 es un modelo vision-language orientado a OCR y a la conversion imagen-texto (pipeline image-text-to-text). La informacion disponible no detalla la arquitectura interna del modelo base (tipo de encoder visual, numero de capas, mecanismo de atencion ni composicion del dataset de entrenamiento). Lo que si se documenta es el proceso de cuantizacion aplicado por Paretrix.

La innovacion tecnica de esta variante es el esquema de cuantizacion hibrida Paretrix. En lugar de aplicar una unica familia de bitwidth a toda la red, el planificador mueve cada clase de tensor individualmente a cada tipo de cuantizacion y mide la respuesta contra los logits en BF16. A partir de esas celdas de medida, una mochila exacta (knapsack) planifica cada nivel, y un duelo en el regimen de veredicto decide si el plan sustituye al campeon. Se apoya en tres bases stock (Q8_0, Q6_K-imx e IQ4_XS-imx). El resultado son niveles con metricas de fidelidad documentadas: por ejemplo, Quality-36pc ocupa 2069 MiB con KLD de 0,0193 y RMS delta-p de 2,45%, frente a los 2124 MiB de Q5_K_M-imx stock con KLD de 0,0392.

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre imagenes, con pipeline image-text-to-text.
- Generacion de texto conversacional a partir de imagenes (entrada image-text-to-text).
- Soporte multilingue declarado en la model card.
- Capacidad de vision integrada (tag `vision`).
- Compatibilidad con llama.cpp gracias al formato GGUF.
- Compatibilidad con endpoints de tipo transformers (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Digitalizacion de documentos escaneados: el modelo puede procesar imagenes de facturas, contratos o formularios y extraer el texto mediante su pipeline image-text-to-text, adecuado por su naturaleza OCR y su tamano contenido (~2,94 mil millones de parametros).
- Extraccion de texto en aplicaciones moviles o de escritorio: con los niveles Pico-24pc (1409 MiB) o Femto-21pc (1261 MiB) puede ejecutarse en equipos con recursos limitados, permitiendo OCR local sin conexion.
- Procesamiento por lotes en servidores modestos: los niveles Quality-36pc (2069 MiB) y Precision-42pc (2405 MiB) ofrecen un equilibrio medido entre fidelidad y memoria, apropiado para pipelines de digitalizacion masiva con GPU de gama media.
- Atencion al cliente con capturas de pantalla: al aceptar entrada image-text-to-text, puede interpretar imagenes enviadas por usuarios y responder en un contexto conversacional multilingue.
- Digitalizacion de patrimonio documental multilingue: el soporte multilingue declarado lo hace util para archivos con documentos en varios idiomas, ejecutable en infraestructura con licencia MIT.
- Integracion en flujos de accesibilidad: lectura de texto presente en imagenes para aplicaciones de asistencia, desplegable con llama.cpp en hardware de consumo.
- Prototipado e investigacion: la licencia MIT y la disponibilidad de multiples niveles con metricas de fidelidad (PPL, KLD, RMS delta-p) permiten experimentar con distintos compromisos calidad/rendimiento sin coste de licencia.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.). Si documenta metricas de fidelidad de cuantizacion para cada nivel:

| Modelo | MiB | PPL | Delta PPL | KLD | RMS delta-p | top-p |
|---|---:|---:|---:|---:|---:|---:|
| Q8_0 (stock) | 2989 | 101,0398 | -0,1541 | 0,0071 | 1,53% | 94,6% |
| Fidelity-48pc | 2697 | 101,0332 | -0,1607 | 0,0075 | 1,57% | 94,5% |
| Q6_K-imx (stock) | 2500 | 102,2643 | +1,0704 | 0,0191 | 2,38% | 90,7% |
| Precision-42pc | 2405 | 101,1203 | -0,0736 | 0,0108 | 1,90% | 93,2% |
| Q5_K_M-imx (stock) | 2124 | 103,3608 | +2,1669 | 0,0392 | 3,51% | 86,9% |
| Quality-36pc | 2069 | 101,7078 | +0,5139 | 0,0193 | 2,45% | 91,2% |
| Compact-33pc | 1902 | 101,9916 | +0,7977 | 0,0230 | 2,61% | 90,3% |
| Mini-30pc | 1727 | 103,2422 | +2,0483 | 0,0308 | 3,15% | 88,5% |
| IQ4_XS-imx (stock) | 1572 | 104,3518 | +3,1579 | 0,1234 | 6,01% | 77,9% |
| Nano-27pc | 1567 | 103,8156 | +2,6217 | 0,0496 | 3,92% | 85,0% |
| Pico-24pc | 1409 | 105,3252 | +4,1313 | 0,0724 | 4,78% | 82,5% |
| IQ3_M-imx (stock) | 1389 | 111,4107 | +10,2168 | 0,2382 | 8,99% | 69,7% |
| Femto-21pc | 1261 | 110,7349 | +9,5410 | 0,1283 | 6,26% | 76,8% |

## Requisitos de hardware

- VRAM estimada: entre 1261 MiB (Femto-21pc) y 2989 MiB (Q8_0) solo para pesos; hay que anadir la memoria del encoder visual y del contexto, no cuantificada de forma explicita en la informacion disponible.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano de pesos, cualquier GPU con 4-8 GB de VRAM deberia poder alojar los niveles bajos y medios; los niveles Fidelity y Q8_0 requieren al menos ~3 GB solo de pesos.
- GPU de consumo: si, cabe en GPU consumer de gama media y alta con 6-8 GB de VRAM para los niveles Compact, Mini, Nano, Pico y Femto; los niveles superiores necesitan mas margen.
- Opciones de despliegue: llama.cpp (formato GGUF), transformers (libreria declarada), y endpoints compatibles segun el tag `endpoints_compatible`. vLLM, TGI y Ollama no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de tareas del modelo base que permitan una comparacion directa con alternativas OCR. Comparativa por metricas de cuantizacion internas entre niveles Paretrix y sus bases stock:

| Comparacion | Tamano | KLD | RMS delta-p | Observacion |
|---|---:|---:|---:|---|
| Quality-36pc vs Q5_K_M-imx | 2069 vs 2124 MiB | 0,0193 vs 0,0392 | 2,45% vs 3,51% | Paretrix mejora fidelidad con menos tamano |
| Precision-42pc vs Q6_K-imx | 2405 vs 2500 MiB | 0,0108 vs 0,0191 | 1,90% vs 2,38% | Mejor KLD y menor tamano |
| Nano-27pc vs IQ4_XS-imx | 1567 vs 1572 MiB | 0,0496 vs 0,1234 | 3,92% vs 6,01% | Mejora notable con tamano casi identico |
| Femto-21pc vs IQ3_M-imx | 1261 vs 1389 MiB | 0,1283 vs 0,2382 | 6,26% vs 8,99% | Menor tamano y mejor fidelidad |

Comparacion con otros modelos OCR de la misma categoria: no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo base en la informacion disponible.
- Riesgo de alucinacion: inherente a los modelos generativos vision-language; no se cuantifica en la model card.
- La cuantizacion introduce degradacion medible: incluso el nivel Femto-21pc presenta un delta PPL de +9,5410 y KLD de 0,1283 frente a BF16, por lo que en tareas de OCR critico conviene usar niveles altos (Fidelity-48pc o Precision-42pc).
- Longitud de contexto no documentada; puede limitar el procesamiento de documentos muy extensos o conversaciones largas.
- Idiomas: se declara "multilingual" sin lista concreta de idiomas soportados ni cobertura por idioma.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base baidu/Unlimited-OCR-2, ya que esta variante es una cuantizacion del mismo.
- El repositorio tiene 0 likes y fue creado y actualizado en noviembre de 2026; es un artefacto de cuantizacion de un tercero, no una publicacion oficial de Baidu.
- No hay informacion sobre latencia, throughput ni requisitos de memoria del encoder visual, datos relevantes para planificar produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Soulfate24/Unlimited-OCR-2-Paretrix-GGUF
- Modelo base: https://huggingface.co/baidu/Unlimited-OCR-2
- Suite de cuantizacion Paretrix: https://huggingface.co/Soulfate24/Paretrix_Quantization_Suite
