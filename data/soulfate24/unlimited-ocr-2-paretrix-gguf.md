# Soulfate24/Unlimited-OCR-2-Paretrix-GGUF

## Resumen

Unlimited-OCR-2-Paretrix-GGUF es una familia de cuantizaciones GGUF del modelo multimodal baidu/Unlimited-OCR-2, publicada por el usuario Soulfate24 bajo el paraguas de su suite Paretrix. El modelo base es un vision-language de Baidu orientado a OCR y transcripción de imágenes, con aproximadamente 2.938 millones de parámetros (unos 2,94 mil millones), y este repositorio ofrece trece variantes cuantizadas que van desde los 2989 MiB del Q8_0 hasta los 1261 MiB de la variante Femto-21pc.

La relevancia de esta publicación no está en el modelo en sí, sino en la metodología de cuantización: Paretrix es una técnica empírica y *activation-aware* que planifica cada nivel de cuantización mediante un problema de mochila exacto sobre mediciones por clase de tensor, en lugar de aplicar una familia de bitwidth uniforme a toda la red. El autor reporta 18 dominaciones estrictas de Pareto frente a las cuantizaciones estándar de llama.cpp, con métricas de perplejidad, KLD y RMS Δp medidas a un régimen de veredicto de contexto 4096×8.

El resultado práctico es que, para el mismo presupuesto de peso, las variantes Paretrix ofrecen menor degradación que sus equivalentes estándar (por ejemplo, Quality-36pc ocupa 2069 MiB frente a los 2124 MiB de Q5_K_M-imx, con KLD de 0,0193 frente a 0,0392). Es un repositorio de interés para quien necesite desplegar OCR multimodal en hardware limitado sin renunciar a fidelidad de salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (image-text-to-text), código personalizado (`custom_code`) |
| Parametros totales | 2.938.670.848 (~2,94 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | GGUF: Q8_0, Q6_K-imx, Q5_K_M-imx, IQ4_XS-imx, IQ3_M-imx (bases stock) y variantes Paretrix Fidelity-48pc, Precision-42pc, Quality-36pc, Compact-33pc, Mini-30pc, Nano-27pc, Pico-24pc, Femto-21pc |
| Idiomas soportados | Multilingüe (sin listado explícito de idiomas) |
| Licencia | MIT |
| Formato de pesos | GGUF (con código personalizado para transformers) |

## Arquitectura y entrenamiento

El modelo base baidu/Unlimited-OCR-2 es un vision-language de arquitectura transformer que combina un codificador visual con un decodificador de lenguaje para tareas de image-text-to-text, orientado específicamente a OCR. El repositorio de cuantización no aporta detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esa información corresponde a la model card del modelo base y no está incluida en la información disponible.

La innovación técnica destacable de este repositorio es el propio proceso de cuantización Paretrix. El método parte de tres bases stock (Q8_0, Q6_K-imx e IQ4_XS-imx), mueve cada clase de tensor de forma aislada a cada tipo de cuantización y mide la respuesta contra los logits en BF16. Con esas celdas de medición, un *knapsack* exacto planifica cada nivel, y un duelo al régimen de veredicto (contexto 4096×8, build 12283 de llama.cpp) decide si el plan sustituye al campeón. El autor indica que lo medido en un modelo se hereda en el siguiente modelo de la misma familia. Las métricas reportadas incluyen PPL, ΔPPL, KLD, RMS Δp y top-p.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes, con salida de texto estructurado o plano.
- Comprensión de documentos escaneados, capturas de pantalla, fotografías y material visual con texto.
- Generación de texto condicionada por imagen (pipeline image-text-to-text).
- Conversación multimodal multi-turno (tag `conversational`).
- Soporte multilingüe declarado, sin desglose de idiomas concretos.
- Compatibilidad con endpoints (`endpoints_compatible`) para despliegue como servicio.
- Ejecución en llama.cpp gracias al formato GGUF, además de carga vía transformers con código personalizado.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, audio o modo de razonamiento explícito.

## Casos de uso

- Digitalización de archivos históricos y administrativos: el modelo puede transcribir documentos escaneados página a página y devolver texto plano o estructurado, con la ventaja de que las variantes Quality-36pc (2069 MiB) y Compact-33pc (1902 MiB) reducen el coste de memoria frente a Q5_K_M-imx sin penalización apreciable de KLD (0,0193 frente a 0,0392).
- Extracción de datos de facturas y albaranes: integrado en un pipeline de preprocesado, el modelo convierte imágenes de documentos comerciales en campos de texto que luego se parsean; la variante Precision-42pc (2405 MiB, KLD 0,0108) es la más indicada cuando la fidelidad de caracteres es crítica.
- Accesibilidad: conversión de capturas de pantalla y fotos de libros a texto legible para lectores de pantalla, ejecutable en local con la variante Mini-30pc (1727 MiB) en equipos de gama media.
- Procesamiento por lotes en servidores sin GPU dedicada: la variante Femto-21pc (1261 MiB) permite mantener el modelo residente en memoria junto con otros servicios, a costa de un KLD de 0,1283 y un top-p del 76,8 %, aceptable para tareas de triaje o indexación aproximada.
- Moderación y búsqueda de contenido en imágenes: indexación de texto embebido en imágenes de una base de datos para búsqueda posterior, usando Nano-27pc (1567 MiB) como compromiso entre tamaño y calidad (KLD 0,0496).
- Asistencia a la traducción de material visual: al ser multilingüe, puede transcribir texto en imágenes en distintos idiomas antes de pasarlo a un motor de traducción; la variante Fidelity-48pc (2697 MiB) es la que más se aproxima a la fidelidad de Q8_0 con 292 MiB menos.
- Despliegue en dispositivos de borde: con la variante Pico-24pc (1409 MiB) el modelo cabe en GPUs de consumo con 6-8 GB de VRAM, habilitando OCR local en portátiles sin conexión.

## Benchmarks y rendimiento

Los datos publicados son métricas de cuantización (perplejidad y divergencia respecto a BF16), no benchmarks de tareas estándar como MMLU o HumanEval. Se reproducen a continuación:

| Variante | MiB | PPL | ΔPPL | KLD | RMS Δp | top-p |
|---|---:|---:|---:|---:|---:|---:|
| Q8_0 (stock) | 2989 | 101,0398 | −0,1541 | 0,0071 | 1,53 % | 94,6 % |
| Fidelity-48pc | 2697 | 101,0332 | −0,1607 | 0,0075 | 1,57 % | 94,5 % |
| Q6_K-imx (stock) | 2500 | 102,2643 | +1,0704 | 0,0191 | 2,38 % | 90,7 % |
| Precision-42pc | 2405 | 101,1203 | −0,0736 | 0,0108 | 1,90 % | 93,2 % |
| Q5_K_M-imx (stock) | 2124 | 103,3608 | +2,1669 | 0,0392 | 3,51 % | 86,9 % |
| Quality-36pc | 2069 | 101,7078 | +0,5139 | 0,0193 | 2,45 % | 91,2 % |
| Compact-33pc | 1902 | 101,9916 | +0,7977 | 0,0230 | 2,61 % | 90,3 % |
| Mini-30pc | 1727 | 103,2422 | +2,0483 | 0,0308 | 3,15 % | 88,5 % |
| IQ4_XS-imx (stock) | 1572 | 104,3518 | +3,1579 | 0,1234 | 6,01 % | 77,9 % |
| Nano-27pc | 1567 | 103,8156 | +2,6217 | 0,0496 | 3,92 % | 85,0 % |
| Pico-24pc | 1409 | 105,3252 | +4,1313 | 0,0724 | 4,78 % | 82,5 % |
| IQ3_M-imx (stock) | 1389 | 111,4107 | +10,2168 | 0,2382 | 8,99 % | 69,7 % |
| Femto-21pc | 1261 | 110,7349 | +9,5410 | 0,1283 | 6,26 % | 76,8 % |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: entre ~1,3 GB (Femto-21pc, 1261 MiB) y ~3 GB (Q8_0, 2989 MiB) solo para los pesos; hay que sumar la memoria del codificador visual y del contexto KV, no cuantificados en las cifras reportadas.
- GPU recomendadas: RTX 4090, RTX 3090 o A100/H100 para despliegues de alta concurrencia con las variantes grandes; RTX 3060 12 GB, RTX 4060 Ti 16 GB o incluso GPUs de 8 GB para las variantes Mini-30pc, Nano-27pc, Pico-24pc y Femto-21pc.
- Cabe en GPU de consumo: sí, todas las variantes caben en GPUs con 8 GB o más; Femto-21pc y Pico-24pc podrían funcionar en GPUs de 6 GB.
- Opciones de despliegue: llama.cpp (build 12283 usado para las mediciones), Ollama y cualquier runtime compatible con GGUF; para el modelo completo en transformers se requiere `custom_code` y el pipeline image-text-to-text. vLLM y TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles. Las métricas publicadas son de calidad de cuantización, no de velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Unlimited-OCR-2-Paretrix-GGUF | ~2,94 mil millones | No disponible | MIT | GGUF | 13 variantes cuantizadas con metodología Pareto |
| baidu/Unlimited-OCR-2 (base) | ~2,94 mil millones | No disponible | No disponible en la información | Pesos originales | Modelo de referencia sin cuantizar |
| Q8_0 stock del mismo modelo | ~2,94 mil millones | No disponible | MIT | GGUF | 2989 MiB, KLD 0,0071 |
| Q5_K_M-imx stock del mismo modelo | ~2,94 mil millones | No disponible | MIT | GGUF | 2124 MiB, KLD 0,0392 |

No se dispone de datos sobre otros modelos OCR comparables (por ejemplo, alternativas de PaddleOCR o Donut) en la información proporcionada, por lo que la comparativa se limita a las variantes del propio modelo.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación independiente de las métricas reportadas.
- Las métricas de PPL y KLD son del autor y se midieron a un régimen concreto (contexto 4096×8, build 12283 de llama.cpp); pueden no extrapolarse a otros contextos o configuraciones.
- El modelo requiere `custom_code` para cargarse en transformers; no es un transformer estándar y puede fallar en versiones de la librería no alineadas con el código del autor.
- Las variantes de menor tamaño (Femto-21pc, Pico-24pc) muestran degradación notable: KLD de 0,1283 y 0,0724 respectivamente, frente a 0,0071 de Q8_0; no son adecuadas para tareas donde la exactitud de caracteres sea crítica.
- Riesgo de alucinación inherente a los modelos de lenguaje: en OCR, puede inventar texto en regiones borrosas o de bajo contraste; no se documentan mecanismos de mitigación.
- No se especifican sesgos conocidos ni la composición del dataset de entrenamiento, lo que impide evaluar sesgos lingüísticos o culturales.
- La licencia MIT del repositorio de cuantización no garantiza que la licencia del modelo base permita uso comercial sin restricciones; conviene verificar la licencia de baidu/Unlimited-OCR-2 antes de desplegar.
- El soporte multilingüe está declarado pero no se detalla qué idiomas cubre ni con qué calidad.
- No hay información sobre longitud de contexto soportada, lo que limita la planificación de despliegues con documentos largos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Soulfate24/Unlimited-OCR-2-Paretrix-GGUF
- Modelo base: https://huggingface.co/baidu/Unlimited-OCR-2
- Suite de cuantización Paretrix: https://huggingface.co/Soulfate24/Paretrix_Quantization_Suite
- llama.cpp: https://github.com/ggml-org/llama.cpp
