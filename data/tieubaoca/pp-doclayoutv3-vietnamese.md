# tieubaoca/PP-DocLayoutV3-Vietnamese

## Resumen

PP-DocLayoutV3-Vietnamese es un ajuste fino del modelo de análisis de maquetación documental PP-DocLayoutV3, desarrollado por el usuario tieubaoca sobre los pesos oficiales de PaddlePaddle. El modelo resuelve la detección de elementos estructurales en imágenes de documentos (títulos, párrafos, tablas, figuras, sellos, notas al pie, etc.), la segmentación mediante polígonos de cuatro puntos y la predicción del orden de lectura lógico en una sola pasada hacia delante. Es el motor de maquetación que alimenta la familia PaddleOCR-VL 1.5/1.6.

El ajuste se ha orientado a documentos administrativos vietnamitas, decretos legales, libros de texto, contratos y formularios escaneados, manteniendo la taxonomía canónica de 25 clases del modelo base. Con 33,3 millones de parámetros y un peso de repositorio de 0,4 GB, es un modelo compacto de segmentación de imágenes (pipeline `image-segmentation`) que se ejecuta en hardware de consumo.

Su relevancia actual radica en que cubre un hueco poco atendido: la maquetación de documentos en vietnamita con orden de lectura explícito, algo crítico para pipelines OCR que necesitan reconstruir el flujo textual antes de pasar el contenido a un modelo de lenguaje. La licencia Apache 2.0 facilita su integración comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PP-DocLayoutV3 (RT-DocLayout, transformer de detección end-to-end con predicción de orden de lectura) |
| Parametros totales | 33.288.957 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y PaddlePaddle estático) |
| Idiomas soportados | vi, en, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, PaddlePaddle estático (`inference.pdiparams`), checkpoint Paddle (`best_model.pdparams`) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura RT-DocLayout descrita en el paper *RT-DocLayout: Real-Time End-to-End Document Layout Analysis with Reading Order in the Wild* (ECCV 2026, arXiv:2606.23344). Se trata de un detector end-to-end que, en una única pasada, predice cajas delimitadoras, polígonos de contorno de cuatro puntos y el índice de orden de lectura de cada bloque. La función de pérdida es `DocLayoutV3Loss`, con un coeficiente de 50 para `order_loss` y emparejamiento húngaro (Hungarian matcher) para la asignación entre predicciones y anotaciones.

El ajuste fino se realizó sobre los pesos oficiales `PP-DocLayout_plus-L_pretrained.pdparams` con un conjunto de documentos administrativos y multi-maqueta vietnamitas: 91 páginas de entrenamiento (849 elementos de maquetación) y 10 páginas de validación (115 elementos). El entrenamiento se ejecutó durante 100 épocas con selección del mejor checkpoint en la época 17, batch size 1, learning rate 1e-4 con LinearWarmup de 100 pasos y optimizador AdamW, sobre una NVIDIA GeForce RTX 5060 Ti de 16 GB de VRAM. No se menciona en la información disponible el uso de RLHF ni DPO, algo esperable en un modelo de visión.

## Capacidades

- Detección de 25 clases de maquetación: título de documento, título de párrafo, texto, tabla, título de figura, encabezado, pie de página, número de página, nota al pie, sello, fórmula en línea y en bloque, número de fórmula, referencia, contenido de referencia, texto vertical, imagen, gráfico, algoritmo, resumen, texto al margen, entre otras.
- Predicción del orden de lectura (`order`) con índice basado en 1 para cada bloque, permitiendo reconstruir el flujo lineal de lectura.
- Segmentación mediante polígonos de cuatro puntos para elementos inclinados, curvos o no planos.
- Salida estructurada por región con `cls_id`, `label`, `score`, `coordinate`, `polygon_points` y `order`.
- Soporte de inferencia en CPU y GPU mediante PaddleX (`device="gpu:0"` o `"cpu"`).
- Doble formato de pesos: artefactos estáticos de PaddlePaddle y `safetensors` compatibles con Transformers.
- Capacidades multilingües declaradas (vi, en, multilingual), aunque el ajuste se centra en vietnamita.

## Casos de uso

- Digitalización de documentos administrativos vietnamitas: el modelo detecta sellos, encabezados, pies y bloques de texto en formularios escaneados, y el orden de lectura permite reconstruir el contenido antes de pasarlo a un motor OCR.
- Procesamiento de decretos y textos legales: la detección de referencias, contenido de referencia y notas al pie facilita la extracción estructurada de citas normativas en contratos y legislación.
- Extracción de tablas en libros de texto y contratos: la clase `table` con polígonos de cuatro puntos permite recortar y enviar cada tabla a un extractor especializado sin confundirla con párrafos adyacentes.
- Preprocesado para pipelines RAG sobre corpus documentales: el orden de lectura predicho permite segmentar documentos largos en pasajes coherentes antes de la indexación vectorial.
- Análisis de maquetación en sistemas de archivo y gestión documental: la clasificación en 25 clases permite enrutar páginas (facturas, formularios, contratos) según su estructura.
- Integración en PaddleOCR-VL: al ser el motor de maquetación de PaddleOCR-VL 1.5/1.6, puede usarse como componente previo en pipelines OCR completos que combinan detección de layout con reconocimiento de texto.
- Verificación de integridad de documentos escaneados: la detección de sellos (`seal`) y números de página (`number`) permite comprobar que un documento está completo y autenticado.

## Benchmarks y rendimiento

Métricas de validación del mejor checkpoint (época 17) sobre el conjunto de validación vietnamita (10 páginas, 115 elementos):

| Metrica | Valor |
|---|---|
| bbox mAP @ [IoU=0.50:0.95] | 0,7828 |
| bbox AP @ [IoU=0.50] | 0,8620 |
| bbox AP @ [IoU=0.75] | 0,8620 |
| bbox AR @ [IoU=0.50:0.95] | 0,8810 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el modelo pesa aproximadamente 128 MB en safetensors y 124 MB en formato Paddle estático, por lo que cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; el ajuste se entrenó en una RTX 5060 Ti de 16 GB, pero la inferencia no requiere ese nivel.
- Cabe en GPU de consumo: sí, en modelos como RTX 3060, RTX 4060, RTX 4090, entre otras.
- Opciones de despliegue: PaddleX (`create_model` con `model_name="PP-DocLayoutV3"`), PaddlePaddle estático y pesos `safetensors` compatibles con Transformers. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de visión de este tipo).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Clases | Orden de lectura | Licencia | Idiomas |
|---|---|---|---|---|---|
| PP-DocLayoutV3-Vietnamese | 33,3 M | 25 | Sí | Apache 2.0 | vi, en, multilingual |
| PP-DocLayoutV3 (base) | no disponible | 25 | Sí | no disponible | multilingual |
| LayoutLMv3 | no disponible | variable | No (requiere post-proceso) | no disponible | multilingual |
| DiT (Document Image Transformer) | no disponible | variable | No | no disponible | en principalmente |

El modelo base PP-DocLayoutV3 comparte arquitectura y taxonomía, pero no está ajustado específicamente a documentos vietnamitas. LayoutLMv3 y DiT son alternativas de detección de layout sin predicción nativa de orden de lectura. Los datos de parámetros y licencia de los comparadores no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- El conjunto de ajuste es muy reducido (91 páginas de entrenamiento, 849 elementos), lo que puede provocar sobreajuste a la distribución concreta de documentos administrativos vietnamitas y un rendimiento inferior en dominios no representados.
- El conjunto de validación es también pequeño (10 páginas, 115 elementos), por lo que las métricas reportadas tienen alta varianza y deben interpretarse con cautela.
- Riesgo de alucinación en la predicción de orden de lectura en maquetaciones complejas (columnas múltiples, tablas anidadas, texto vertical) no presentes en el conjunto de entrenamiento.
- El soporte multilingüe declarado (vi, en, multilingual) no está respaldado por una evaluación específica en la información disponible; el ajuste se centra en vietnamita.
- No se documentan sesgos específicos, pero al derivar de un modelo base entrenado con datos no descritos, pueden heredarse sesgos de la distribución original.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base PaddlePaddle/PP-DocLayoutV3 y del paper asociado antes de su explotación en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación por parte de la comunidad.
- No se proporcionan datos de latencia ni throughput, lo que impide estimar el coste operativo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/tieubaoca/PP-DocLayoutV3-Vietnamese
- Modelo base: https://huggingface.co/PaddlePaddle/PP-DocLayoutV3
- Paper (arXiv:2606.23344): https://arxiv.org/abs/2606.23344
- Documentación de PaddleX Layout Analysis: https://paddlepaddle.github.io/PaddleX/
