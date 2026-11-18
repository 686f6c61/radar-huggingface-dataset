# Soulfate24/MiniCPM-OCR-1.0-DSpark-Paretrix-GGUF

## Resumen

MiniCPM-OCR-1.0-DSpark-Paretrix-GGUF es una distribución cuantizada en formato GGUF del modelo multimodal MiniCPM-OCR-1.0 de OpenBMB, publicada por el usuario Soulfate24 bajo licencia Apache 2.0. El modelo base es un vision-language model especializado en reconocimiento óptico de caracteres (OCR) y parsing de documentos: tablas, fórmulas y texto estructurado a partir de imágenes. Esta versión concreta incorpora además el módulo de decodificación especulativa DSpark como draft model, lo que permite acelerar la inferencia en llama.cpp.

El interés de esta ficha no reside tanto en el modelo base como en el proceso de cuantización aplicado: la suite Paretrix, descrita por el autor, realiza una planificación empírica tensor a tensor (midiendo el impacto de mover cada clase de tensor a cada tipo de cuantización contra los logits BF16) y resuelve un problema de mochila para asignar bits donde mayor retorno hay. El resultado son una docena de niveles de cuantización con nombres propios (Fidelity-48pc, Quality-36pc, Nano-27pc, etc.) que se posicionan en la frontera de Pareto entre tamaño y fidelidad.

El modelo cuenta con 752.167.744 parámetros reales (según safetensors), un repositorio de 4,9 GB y soporte declarado para inglés y chino. Está pensado para despliegue local en llama.cpp y para integrarse en pipelines de extracción documental donde el coste por página y la latencia importan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (MiniCPM-OCR); detalles internos no disponibles en la información proporcionada |
| Parametros totales | 752.167.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF en múltiples niveles: Q8_0, Fidelity-48pc, Precision-42pc, Q6_K-imx, Q5_K_M-imx, Quality-36pc, Compact-33pc, IQ4_XS-imx, Mini-30pc, IQ3_M-imx, Nano-27pc, Pico-24pc, Femto-21pc |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base original) |

## Arquitectura y entrenamiento

El modelo base MiniCPM-OCR-1.0 es un vision-language model orientado a image-text-to-text, especializado en parsing documental: reconocimiento de tablas, fórmulas y texto. La información disponible no detalla la arquitectura interna (número de capas, dimensiones, mecanismo de atención, estrategia de fusión visión-lenguaje) ni los datos de entrenamiento (número de tokens, composición del corpus, uso de RLHF/DPO). Tampoco se especifica la resolución de imagen soportada ni el esquema de tokenización visual.

La innovación destacable de esta distribución es el proceso de cuantización Paretrix. Según la model card, se parte de tres bases estándar (Q8_0, Q6_K-imx e IQ4_XS-imx), se mueve cada clase de tensor de forma aislada a cada tipo de cuantización y se mide la divergencia frente a los logits BF16 mediante métricas como PPL, KLD, RMS Δp y top-p agreement. Con esas celdas medidas, un problema de mochila exacto planifica cada nivel, y un duelo en el régimen de veredicto decide si el plan sustituye al campeón. Además, el paquete incorpora el módulo DSpark como draft model para decodificación especulativa, lo que reduce el coste por token generado en llama.cpp.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de documentos.
- Parsing de documentos estructurados: extracción de texto, tablas y fórmulas matemáticas.
- Reconocimiento de tablas con preservación de estructura.
- Reconocimiento de fórmulas matemáticas (salida en formato textual/matemático).
- Procesamiento multimodal imagen-texto (pipeline image-text-to-text).
- Conversación multi-turno (tag conversational).
- Soporte de decodificación especulativa mediante el draft DSpark.
- Idiomas: inglés y chino.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades de audio o vision general más allá de OCR: no disponible.

## Casos de uso

- Digitalización masiva de archivos: el modelo puede procesar imágenes de documentos escaneados y devolver texto estructurado, adecuado para pipelines por lotes donde el coste por página es crítico y las cuantizaciones Compact o Quality reducen el peso del modelo.
- Extracción de tablas de informes financieros: convierte tablas en imágenes a representaciones textuales estructuradas, útil para alimentar bases de datos o hojas de cálculo en procesos contables y de auditoría.
- Conversión de fórmulas científicas a texto: reconoce fórmulas en artículos escaneados o fotografías de pizarra y las transcribe, lo que facilita la indexación y búsqueda en repositorios académicos.
- Automatización de ingesta documental en back office: integrado en un servicio llama.cpp, procesa facturas, albaranes y formularios en inglés o chino, con la ventaja de que el draft DSpark reduce la latencia en servidores sin GPU dedicada.
- Procesamiento en el borde (edge): las variantes Nano-27pc (405 MiB) y Pico-24pc (364 MiB) permiten ejecutar OCR en dispositivos con poca memoria, como mini-PC o portátiles sin GPU, manteniendo una fidelidad aceptable según las métricas del autor.
- Preprocesado para RAG documental: el modelo extrae texto y estructura de PDFs e imágenes antes de la indexación vectorial, mejorando la calidad del chunking en sistemas de recuperación aumentada.
- Digitalización de documentación bilingüe inglés-chino: adecuado para entornos comerciales con documentación en ambos idiomas, aunque sin cobertura de otras lenguas.

## Benchmarks y rendimiento

La model card proporciona métricas de fidelidad de cuantización medidas contra los logits BF16, no benchmarks de tareas OCR (no hay MMLU, HumanEval, GSM8K ni métricas de exactitud de reconocimiento). Se reproducen a continuación los datos disponibles:

| Modelo | MiB | PPL | ΔPPL | KLD | RMS Δp | top-p |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| Q8_0 (stock) | 774 | 15.3164 | +0.0780 | 0.0014 | 1.00% | 98.0% |
| Fidelity-48pc | 704 | 15.3322 | +0.0938 | 0.0029 | 1.42% | 97.1% |
| Precision-42pc | 619 | 15.3728 | +0.1344 | 0.0052 | 1.89% | 96.2% |
| Q6_K-imx (stock) | 600 | 15.3951 | +0.1567 | 0.0063 | 2.10% | 95.7% |
| Q5_K_M-imx (stock) | 551 | 15.5443 | +0.3059 | 0.0151 | 3.29% | 93.2% |
| Quality-36pc | 532 | 15.5062 | +0.2678 | 0.0174 | 3.51% | 92.1% |
| Compact-33pc | 489 | 15.7849 | +0.5465 | 0.0328 | 4.70% | 90.3% |
| IQ4_XS-imx (stock) | 481 | 15.5388 | +0.3004 | 0.0520 | 5.84% | 88.6% |
| Mini-30pc | 446 | 15.6352 | +0.3968 | 0.0550 | 6.01% | 87.6% |
| IQ3_M-imx (stock) | 433 | 16.8343 | +1.5959 | 0.1611 | 10.40% | 80.6% |
| Nano-27pc | 405 | 16.1268 | +0.8884 | 0.0879 | 7.78% | 84.1% |
| Pico-24pc | 364 | 17.0485 | +1.8101 | 0.1754 | 10.96% | 78.3% |
| Femto-21pc | 323 | 19.3344 | +4.0960 | 0.3087 | 14.04% | 70.9% |

No se han publicado resultados de benchmarks de tareas (exactitud OCR, TEDS en tablas, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del archivo GGUF más el overhead del runtime y del encoder visual. Con Q8_0 (774 MiB) se puede ejecutar en torno a 1,5-2 GB de VRAM; con Nano-27pc (405 MiB) en torno a 1 GB; con Femto-21pc (323 MiB) por debajo de 1 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060) es suficiente para las variantes pequeñas; para Q8_0 o Fidelity-48pc se recomienda 6-8 GB (RTX 3060, RTX 4060 Ti). En entornos de servidor, A100/H100 no son necesarias dado el tamaño del modelo, pero pueden usarse para alto throughput.
- Cabe en GPU consumer: sí, en todas las variantes, incluidas tarjetas de gama baja con 4 GB.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), y por extensión cualquier frontend compatible (Ollama, LM Studio, servidores OpenAI-compatibles basados en llama.cpp). vLLM y TGI no soportan GGUF de forma nativa en el momento de redactar esta ficha; se requeriría el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles. El uso del draft DSpark está orientado a reducir la latencia mediante decodificación especulativa, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
| :--- | ---: | ---: | :--- | :--- | :--- |
| MiniCPM-OCR-1.0-DSpark-Paretrix (esta ficha) | 752 M | no disponible | en, zh | Apache 2.0 | GGUF |
| MiniCPM-OCR-1.0 (base) | 752 M | no disponible | en, zh | Apache 2.0 | safetensors |
| Otros modelos OCR open source de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos alternativos comparables (por ejemplo, variantes OCR de la familia Qwen-VL, Donut o TrOCR), por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; no se declara soporte para castellano ni otras lenguas, lo que restringe su uso en documentación en español.
- No se han publicado métricas de exactitud OCR (CER, WER, TEDS) en la información disponible; las métricas de la model card miden fidelidad de cuantización, no calidad de reconocimiento.
- Riesgo de alucinación inherente a los modelos generativos: en OCR, puede producir texto plausible que no aparece en la imagen, especialmente en documentos degradados o con tablas complejas.
- Las cuantizaciones agresivas (Pico-24pc, Femto-21pc) muestran degradación notable (ΔPPL +1,81 y +4,10 respectivamente, top-p agreement 78,3% y 70,9%), lo que puede traducirse en errores de reconocimiento; para producción se recomienda Quality-36pc o superior.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original y de los datos de entrenamiento, no detalladas aquí.
- El repositorio tiene 0 likes y fue creado y actualizado en noviembre de 2026; es una publicación de un autor individual, no del equipo de OpenBMB, por lo que el soporte y mantenimiento no están garantizados.
- La librería declarada es `minicpm-ocr`, no estándar; la integración práctica se realiza vía llama.cpp.
- No se especifica la longitud de contexto, lo que impide planificar el tamaño de lote documental con precisión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Soulfate24/MiniCPM-OCR-1.0-DSpark-Paretrix-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM-OCR-1.0
- Draft model DSpark: https://huggingface.co/openbmb/MiniCPM-OCR-1.0-DSpark
- Suite de cuantización Paretrix: https://huggingface.co/Soulfate24/Paretrix_Quantization_Suite
