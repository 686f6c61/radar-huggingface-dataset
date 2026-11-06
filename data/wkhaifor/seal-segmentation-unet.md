# wkhaifor/seal-segmentation-unet

## Resumen

`seal-segmentation-unet` es un modelo de segmentación binaria de imágenes desarrollado por el usuario wkhaifor, diseñado específicamente para separar la tinta de sellos (stamps) del fondo en recortes de documentos. No es un modelo de lenguaje: se trata de una red U-Net de tamaño reducido que recibe una imagen de un sello recortado y devuelve una máscara binaria de la misma resolución, donde el blanco corresponde al texto, borde y motivo central del sello y el negro al fondo. El modelo está etiquetado para el idioma chino (`zh`), lo que refleja el dominio de aplicación (sellos chinos en documentos) más que una capacidad lingüística.

La relevancia del modelo reside en su extrema ligereza: 488.001 parámetros y aproximadamente 1,96 MB de pesos en PyTorch, lo que permite inferencia en CPU sin GPU. Está pensado para integrarse en pipelines de análisis documental donde sea necesario aislar la tinta del sello antes de un OCR posterior, y su model card reporta métricas de Dice e IoU claramente superiores a un umbral de color clásico tanto en recortes originales como en imágenes con texto chino sintético superpuesto.

La información disponible es limitada: no se especifican detalles de arquitectura interna más allá de "Small U-Net", no hay pipeline declarado en Hugging Face, el repositorio aparece con 0 GB y 0 descargas, y la licencia no está claramente determinada (la model card remite a la licencia del subconjunto de datos upstream). Esta ficha refleja exclusivamente lo publicado por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net ("Small U-Net") |
| Parametros totales | 488.001 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos PyTorch de ~1,96 MB) |
| Idiomas soportados | zh (dominio de aplicación: sellos chinos) |
| Licencia | no disponible (la model card remite a la licencia del subconjunto upstream; requiere verificación) |
| Formato de pesos | PyTorch (`.pt`/checkpoint, según repositorio); no se indica safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es una U-Net de pequeña escala con 488.001 parámetros (aproximadamente 1,96 MB en pesos PyTorch). La U-Net es una arquitectura encoder-decoder con conexiones skip, adecuada para segmentación densa píxel a píxel; en este caso produce una máscara binaria del mismo tamaño que la entrada. El pipeline de inferencia descrito en la model card escala y rellena (padding) la imagen de entrada, predice probabilidades, las remapea a la resolución original y aplica un umbral de 0,5 para generar la máscara final.

El entrenamiento se realizó sobre el subconjunto `only_stamps/SealData(red,mask,pure stamps)` del dataset Kaggle SEAL_DATASET Version 1, cuya procedencia se asocia a DocDiff y principalmente a ICDAR 2023 ReST, con algunas imágenes internas del upstream. Los conjuntos se dividieron por grupos de casi-duplicados: 1.117 pares imagen/máscara en entrenamiento (963 grupos), 240 en validación (222 grupos) y 240 en test (222 grupos). Se entrenaron 200 épocas en la configuración "S002", seleccionando el checkpoint de la época 178 por Dice de validación. Las métricas se calcularon sobre una rejilla de 384×384. Se incluyó una prueba con caracteres chinos sintéticos superpuestos para evaluar la robustez frente a interferencia de texto. No se documentan técnicas de aumento, función de pérdida, optimizador ni detalles de las capas internas.

## Capacidades

- Segmentación binaria de tinta de sello: genera una máscara del mismo tamaño que la entrada, con blanco para texto, borde y motivo central, y negro para el fondo.
- Procesamiento de recortes de sellos en documentos, incluyendo sellos con interferencia de texto chino superpuesto (evaluado con底字 sintéticos).
- Inferencia en CPU: el script `predict.py` admite `--threads` y no requiere GPU.
- Escalado y padding automático de la entrada, con remapeo de probabilidades a la resolución original y umbral fijo de 0,5.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo puramente visual de segmentación.
- No se documentan capacidades multimodales, audio ni modos de "thinking".

## Casos de uso

- Preprocesado para OCR de documentos con sellos: aislar la tinta del sello permite separar la capa del sello de la del texto del documento antes de aplicar OCR, reduciendo la interferencia del sello sobre el texto subyacente. El modelo es adecuado por su bajo coste computacional y su entrenamiento específico en sellos chinos.
- Limpieza y restauración de documentos escaneados: la máscara permite eliminar o atenuar la tinta del sello en digitalizaciones de contratos y facturas, conservando el texto del documento.
- Extracción de la geometría del sello: la máscara binaria sirve para medir bordes, diámetro y distribución del texto del sello, útil en verificación documental.
- Clasificación y comparación de sellos: una vez segmentada la tinta, se pueden calcular descriptores (forma, densidad, patrón) para comparar sellos entre documentos o detectar duplicados.
- Procesamiento por lotes en servidores sin GPU: al requerir solo CPU, puede desplegarse en contenedores ligeros o funciones serverless para procesar grandes volúmenes de recortes de sellos.
- Análisis forense documental: la separación limpia de la tinta del sello facilita el análisis de autenticidad y la comparación con sellos de referencia.
- Integración en pipelines de digitalización masiva de archivos: al ser un modelo de ~2 MB, puede incluirse en flujos de preprocesado junto a detectores de sellos y motores OCR sin añadir requisitos de hardware significativos.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card (métricas sobre rejilla de 384×384, test con 240 pares imagen/máscara y 222 grupos de casi-duplicados):

| Condición | Método | Dice medio ↑ | IoU medio ↑ |
|---|---|---:|---:|
| Recorte de sello original | Umbral de color | 84,21% | 73,05% |
| Recorte de sello original | Small U-Net | **96,04%** | **92,40%** |
| Fondo con caracteres chinos sintéticos | Umbral de color | 80,24% | 67,80% |
| Fondo con caracteres chinos sintéticos | Small U-Net | **94,16%** | **89,05%** |

El autor indica que la evaluación actual cubre la segmentación de tinta y que la mejora en OCR de contratos reales está pendiente de verificar. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) por tratarse de un modelo de segmentación y no de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está diseñado para CPU y sus pesos ocupan ~1,96 MB.
- GPU recomendadas: no se especifican; cualquier GPU sería sobredimensionada para 488.001 parámetros.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU (CPU, contenedores, serverless).
- Opciones de despliegue: script `predict.py` del repositorio con PyTorch y `requirements.txt`; no se documentan exportaciones a ONNX, TensorRT, llama.cpp, vLLM, TGI ni Ollama (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada. El script permite fijar el número de hilos con `--threads`.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de segmentación de sellos en la documentación proporcionada. La única comparación publicada por el autor es contra un método clásico de umbral de color, incluida en la tabla de benchmarks anterior. Cualquier comparación con otras U-Net de segmentación documental requeriría datos que no están disponibles.

## Limitaciones y advertencias

- Entrenado exclusivamente con sellos chinos del dataset SEAL_DATASET; el rendimiento en sellos de otros alfabetos o estilos no está validado.
- La evaluación se realizó sobre recortes de sellos y sobre fondos con texto chino sintético; la mejora en OCR de contratos reales está explícitamente pendiente de verificación según el autor.
- Umbral fijo de 0,5 en la generación de la máscara; no se documenta calibración por imagen.
- Métricas calculadas sobre una rejilla de 384×384, lo que puede no reflejar el rendimiento a resoluciones muy distintas.
- Licencia no determinada con claridad: la model card remite a la licencia del subconjunto upstream (texto MIT adjunto en `licenses/upstream-mask-readme.md`), pero advierte que el alcance de esa licencia y la de otros subconjuntos y pesos derivados deben verificarse por separado. No se debe asumir uso comercial sin comprobación.
- Repositorio con 0 descargas, 0 likes y tamaño reportado de 0 GB; la disponibilidad efectiva de los pesos debe confirmarse al descargar.
- No hay pipeline declarado en Hugging Face (`inference: false`), por lo que no puede usarse el widget de inferencia de la plataforma.
- Riesgo de alucinación no aplicable en el sentido de generación de texto, pero sí de falsos positivos/negativos en la máscara (p. ej., confundir texto del documento con tinta del sello).
- No se documentan sesgos demográficos ni de otro tipo; el modelo no procesa lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/wkhaifor/seal-segmentation-unet
- ModelScope (repositorio sincronizado del autor): https://www.modelscope.cn/models/kfcVme50/seal-segmentation-unet
- Dataset Kaggle SEAL_DATASET Version 1: https://www.kaggle.com/datasets/yushuosun/seal-dataset
- DocDiff (upstream asociado): https://github.com/Royalvice/DocDiff
