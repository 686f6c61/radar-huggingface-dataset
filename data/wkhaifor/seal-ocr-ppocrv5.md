# wkhaifor/seal-ocr-ppocrv5

## Resumen

Seal-OCR-PPOCRv5 es un modelo de reconocimiento óptico de caracteres (OCR) especializado en la lectura de títulos de empresas chinas extraídos de sellos corporativos. Lo desarrolla el usuario wkhaifor y se publica como un fine-tuning del modelo PP-OCRv5 Mobile de PaddleOCR, concretamente sobre sus ramas PPLCNetV3 (backbone), SVTR (encoder) y CTC (decodificador). El modelo resuelve un problema muy concreto: una vez localizado y desplegado ("rectificado") el texto curvo de un sello, el modelo transcribe esa tira de texto a caracteres chinos.

El modelo se distribuye como un checkpoint del tercer epoch de entrenamiento junto con su exportación a grafo de inferencia para CPU en formato Paddle. El repositorio incluye scripts de inferencia (`predict.py`), el diccionario de caracteres, métricas por epoch y los ajustes de entrenamiento, lo que facilita su reproducción. Está pensado para ejecutarse en CPU, sin necesidad de GPU, con un consumo de recursos muy bajo.

Su relevancia es acotada pero clara: los sellos corporativos chinos son un elemento habitual en contratos y documentos mercantiles, y la lectura automática de la denominación social contenida en ellos es un paso previo a la digitalización y validación documental. El modelo mejora de forma medible el CER de la rama CTC preentrenada original sobre un conjunto de test sintético, aunque su validación en documentos reales queda pendiente según el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PP-OCRv5 Mobile (backbone PPLCNetV3 + encoder SVTR + decodificador CTC) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de reconocimiento de línea de texto, no generativo) |
| Tipos de cuantizacion | no disponible (exportación a grafo de inferencia Paddle para CPU) |
| Idiomas soportados | chino (zh) |
| Licencia | no disponible para el modelo; el código upstream de PaddleOCR es Apache-2.0 y los datos dependen de sus fuentes |
| Formato de pesos | Paddle (`model/inference.json` + `model/inference.pdiparams`) y `dictionary.txt` |

## Arquitectura y entrenamiento

El modelo parte de PP-OCRv5 Mobile, un reconocedor de texto de PaddleOCR basado en una red convolucional ligera PPLCNetV3 como extractor de características, un encoder SVTR para modelar secuencias y una cabeza CTC para la decodificación alineada. El fine-tuning afecta a estas tres ramas y produce un checkpoint del tercer epoch (denominado O004), seleccionado por CER de validación, junto con su exportación a grafo de inferencia para CPU.

Los datos de entrenamiento proceden del dataset sintético SEAL_DATASET Version 1 de Kaggle, subconjunto `only_stamps/words_under_stamps/datasetA(fake)`, con 10.000 imágenes de sellos sintéticos. El autor usa la primera denominación social de cada imagen y su polígono de texto, sin mezclar el uso del sello ni su número en las etiquetas. La partición se hace por grupos de nombres de empresa para evitar fuga de información: 7.000 imágenes de entrenamiento (1.397 grupos, 6.980 efectivas), 1.495 de validación (299 grupos) y 1.505 de test (300 grupos). No se documentan fases de RLHF ni DPO, algo esperable en un modelo de OCR.

## Capacidades

- Reconocimiento de líneas de texto chino correspondientes a denominaciones sociales de empresa extraídas de sellos.
- Transcripción de tiras de texto rectificadas y desplegadas previamente a partir de la imagen del sello.
- Salida en JSON con el campo `text` como resultado de la transcripción.
- Ejecución en CPU con control del número de hilos (`--threads`).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, visión general ni audio; la visión se limita al reconocimiento de texto.
- Multilingüismo limitado al chino.

## Casos de uso

- Digitalización de contratos mercantiles: tras localizar y desplegar el sello en la página escaneada, el modelo transcribe la denominación social para indexarla y validarla contra un registro de empresas.
- Verificación de documentos notariales: extracción automática del nombre de la sociedad emisora del sello para cotejarlo con los datos del encabezado del documento.
- Automatización de KYC y onboarding de empresas: lectura del sello en escrituras y certificados aportados por el cliente para precargar el nombre legal en el sistema.
- Procesamiento por lotes en servidores sin GPU: al ejecutarse en CPU con Paddle, permite desplegar el reconocimiento en infraestructura modesta o en entornos aislados.
- Archivística y gestión documental: indexación del nombre de empresa contenido en sellos de expedientes históricos digitalizados para búsqueda posterior.
- Validación de facturas y albaranes: extracción del nombre del emisor a partir del sello estampado para conciliación contable automatizada.
- Pipeline de OCR documental en dos etapas: un detector localiza y despliega el sello y este modelo actúa como segundo paso de reconocimiento especializado, integrable en flujos con PaddleOCR.

## Benchmarks y rendimiento

Resultados del autor sobre 1.505 imágenes de test sintéticas con tiras de texto desplegadas a partir de los polígonos de verdad:

| Modelo / estado | CER ↓ | Coincidencia exacta del nombre ↑ | Errores de carácter |
|---|---:|---:|---:|
| Rama CTC preentrenada oficial de PP-OCRv5 | 1,3593 % | 84,6512 % | 251 |
| Checkpoint O004 (mejor de entrenamiento) | 0,7474 % | 92,0930 % | 138 |
| Exportación CPU del mismo checkpoint | 0,7582 % | 91,9601 % | 140 |

El autor advierte que el test se limita a tiras sintéticas y que la tasa de reconocimiento extremo a extremo sobre contratos reales está pendiente de validación.

## Requisitos de hardware

- Inferencia en CPU: el modelo se distribuye como grafo de inferencia Paddle para CPU y no requiere GPU.
- VRAM estimada: no aplica en el modo documentado; no se publican requisitos de memoria.
- GPU recomendadas: no disponibles; el modelo no está pensado para GPU.
- Cabe en cualquier equipo de consumo al ejecutarse en CPU; el cuello de botella será el número de hilos configurado.
- Opciones de despliegue: Paddle Inference mediante el `predict.py` incluido y los ficheros `model/inference.json`, `model/inference.pdiparams` y `dictionary.txt`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Seal-OCR-PPOCRv5 | OCR especializado en sellos (fine-tuning PP-OCRv5 Mobile) | zh | no aplica | no disponible | HuggingFace y ModelScope |
| PP-OCRv5 Mobile (oficial) | OCR general de PaddleOCR | multilingüe | no aplica | Apache-2.0 (código upstream) | PaddleOCR |
| PaddleOCR general (reconocedor) | OCR de líneas de texto | multilingüe | no aplica | Apache-2.0 | PaddleOCR |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa se limita a los resultados del propio autor frente a la rama CTC preentrenada.

## Limitaciones y advertencias

- El modelo solo reconoce chino y está especializado en denominaciones sociales de empresa; no es un OCR general.
- Requiere un paso previo de localización del sello y despliegue de la tira de texto; no procesa páginas completas por sí solo.
- La validación se ha hecho exclusivamente sobre datos sintéticos; el rendimiento en contratos reales con sellos borrosos, girados o degradados no está verificado.
- Riesgo de error en caracteres poco frecuentes o en nombres con caracteres raros; el CER del 0,75 % implica errores residuales.
- La licencia del modelo no está declarada; el código upstream de PaddleOCR es Apache-2.0, pero los derechos sobre los datos de entrenamiento dependen de las condiciones de Kaggle SEAL_DATASET.
- No hay información sobre sesgos; al tratarse de un OCR, el riesgo principal es de exactitud, no de generación de contenido.
- No debe usarse como único mecanismo de validación legal de una denominación social sin cotejo posterior.
- El repositorio figura con 0 descargas y 0 likes, sin pipeline declarado en HuggingFace; conviene verificar la integridad de los ficheros antes de usarlo en producción.

## Enlaces

- HuggingFace: https://huggingface.co/wkhaifor/seal-ocr-ppocrv5
- ModelScope (repositorio espejo del autor): https://www.modelscope.cn/models/kfcVme50/seal-ocr-ppocrv5
- Dataset de origen: https://www.kaggle.com/datasets/yushuosun/seal-dataset
- PaddleOCR (código upstream, Apache-2.0): no se proporciona enlace directo en la información disponible.
