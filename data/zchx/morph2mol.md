# zchx/Morph2Mol

## Resumen

Morph2Mol es un modelo fundacional desarrollado por el autor zchx (repositorio `zchx/Morph2Mol`) para predecir la expresion genica a nivel de celula individual en transcriptomica espacial a partir de imagenes de histologia H&E. El modelo resuelve un problema central en patologia computacional: la mayoria de las muestras histologicas no disponen de transcriptomica espacial medida, y Morph2Mol permite inferirla directamente desde la morfologia tisular. Combina un codificador de imagen, un decodificador espacial y un banco de referencia de celulas con expresion medida.

El modelo se distribuye como pesos PyTorch (repo de 3,4 GB) e incluye pesos de fusion por organo y panel, informacion genica y el banco de referencia. La prediccion no requiere expresion medida ni caracteristicas de imagen precalculadas para la muestra objetivo. Soporta prediccion sobre 18.580 genes del modelo y dispone de pesos de fusion para 15 organos y 20 grupos organo/panel.

Es relevante ahora porque la transcriptomica espacial de celula unica sigue siendo costosa y limitada a cohortes pequenas, mientras que las imagenes H&E son ubicuas en la practica clinica. Morph2Mol ofrece una via para generar expresion espacial sintetica a escala sobre archivos historicos. La informacion disponible no detalla parametros totales, contexto ni licencia, que se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de imagen + decodificador espacial con atencion + fusion con banco de referencia de celulas (detalles de capas no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | hasta 128 celulas objetivo y 64 celulas de contexto vecino por bloque, contexto seleccionado en un radio de 137 µm |
| Tipos de cuantizacion | no disponible (se menciona `--amp fp32` para CPU; no se detallan cuantizaciones) |
| Idiomas soportados | no disponible (modelo biologico, no linguistico) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (checkpoints; incluye `pytorch_model.bin` de UNI2-h como dependencia) |

## Arquitectura y entrenamiento

Morph2Mol es un modelo de prediccion imagen-a-expresion compuesto por tres piezas: un codificador de imagen (que utiliza UNI2-h de MahmoodLab, con acceso separado), un decodificador espacial que opera sobre bloques de celulas y un banco de referencia de celulas con expresion medida. La prediccion segmenta nucleos, extrae recortes centrados en celula, predice expresion y recupera expresion de referencia, combinando ambas predicciones mediante pesos de fusion entrenados por organo y panel.

El procesamiento espacial agrupa hasta 128 celulas objetivo y 64 celulas de contexto por bloque, con contexto seleccionado dentro de 137 µm; todas las celulas del bloque participan en la atencion, pero solo se guardan las predicciones objetivo, y cada celula se emite una unica vez con particionado determinista dado un ID de muestra y semilla fija. Los pesos de fusion se ajustan por gen como la media igual de los pesos ajustados entre laminas de referencia contribuyentes del grupo organo/panel, recuperando de otras laminas de referencia y excluyendo la lamina de consulta y muestras relacionadas de donante/bloque. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF/DPO.

## Capacidades

- Prediccion de expresion genica espacial de celula unica a partir de imagenes H&E (SVS, NDPI, MRXS via OpenSlide; tambien PNG, JPEG, TIFF).
- Prediccion de hasta 18.580 genes del modelo, con opcion de subconjunto ordenado de simbolos genicos.
- Segmentacion automatica de nucleos (Cellpose) y soporte para fronteras celulares suministradas por el usuario.
- Fusion especifica por organo y panel: 15 organos y 20 grupos organo/panel con pesos ajustados.
- Seleccion automatica de ancho de panel (`narrow`/`wide`) segun el numero de genes solicitados o seleccion explicita.
- Guardado de caracteristicas de imagen y espaciales (`--save-embeddings`).
- Exclusion de objetos de referencia concretos por su ID de banco.
- Inferencia en GPU (CUDA por defecto) y en CPU (`--device cpu --amp fp32`).
- Salida en formato AnnData (`.h5ad`) con matrices escritas a disco por lotes.

## Casos de uso

- Prediccion de transcriptomica espacial en cohortes historicas: aplicar Morph2Mol a laminas H&E sin transcriptomica medida para generar expresion espacial sintetica y estudiar patrones morfologia-expresion a escala.
- Investigacion traslacional en oncologia: predecir expresion por celula en tejido tumoral (pulmon, mama, prostata, colon, etc.) para explorar heterogeneidad espacial sin coste de secuenciacion espacial.
- Priorizacion de muestras para secuenciacion espacial: usar las predicciones como cribado para seleccionar regiones o laminas donde merece la pena medir expresion real.
- Analisis de nicho celular: aprovechar los bloques de 128 celulas objetivo con 64 de contexto en 137 µm para estudiar interacciones y vecindad celular en el espacio tisular.
- Integracion en pipelines de patologia digital: procesar laminas SVS/NDPI/MRXS con OpenSlide y generar `.h5ad` por lotes para analisis posteriores en flujos bioinformaticos.
- Validacion de biomarcadores morfologicos: comparar expresion predicha frente a medida en subconjuntos con ground truth para evaluar la fiabilidad de la inferencia en un organo concreto.
- Docencia y prototipado: usar el Space de inferencia online o la inferencia en CPU para explorar el modelo sin infraestructura GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repo pesa 3,4 GB e incluye checkpoints, pesos de fusion y banco de referencia, por lo que se requiere GPU con memoria suficiente para el codificador, el decodificador y los recortes de celula por bloque.
- GPU recomendadas: no disponible en la informacion; se indica CUDA como dispositivo por defecto.
- Cabe en GPU consumer: no confirmado; existen opciones para reducir memoria transitoria (`--enc-chunk 32 --query-batch 64`), lo que sugiere que puede ajustarse a GPUs de gama media con esos limites.
- Opciones de despliegue: script `predict/predict.py` del repositorio, inferencia online en Hugging Face Space y ejecucion en CPU con `--device cpu --amp fp32`.
- Latencia y throughput: no disponibles; el particionado es determinista y las matrices se escriben a disco por lotes, con tamano de salida proporcional al numero de celulas y genes solicitados.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de imagen-a-transcriptomica espacial ni sus especificaciones.

## Limitaciones y advertencias

- La licencia no esta indicada en la informacion disponible; no se puede confirmar el uso comercial.
- Requiere acceso separado a UNI2-h (MahmoodLab), lo que anade una dependencia externa y condiciones propias.
- La segmentacion automatica produce nucleos; para resultados mas fieles conviene suministrar fronteras celulares cuando esten disponibles.
- Si la imagen no contiene metadatos de resolucion fisica, hay que indicar manualmente los micrometros por pixel (`--mpp`); de lo contrario la prediccion puede ser incorrecta.
- La calidad de la prediccion depende del organo y panel: los pesos de fusion solo existen para 15 organos y 20 grupos; organos fuera de esa lista no tienen pesos ajustados.
- El grupo `narrow` se define con menos de 1.000 genes del modelo medidos en la referencia de ajuste, lo que limita la cobertura en esos paneles.
- Riesgo de alucinacion biologica: la expresion predicha es una inferencia estadistica desde morfologia, no una medicion; no debe usarse como sustituto de validacion experimental en decisiones clinicas.
- Sesgos potenciales derivados de la composicion del banco de referencia y de las laminas usadas en el ajuste; no se documentan en la informacion disponible.
- La prediccion en CPU es posible pero presumiblemente lenta; no se aportan cifras de latencia.
- El modelo no es linguistico: no soporta tool calling, agentes ni capacidades multilingues.

## Enlaces

- Hugging Face: https://huggingface.co/zchx/Morph2Mol
- Space de inferencia online: https://huggingface.co/spaces/zchx/Morph2Mol-demo
- Portal del proyecto: https://morph2mol.vercel.app/
- Codigo en GitHub: https://github.com/zchxhcz1/Morph2Mol
- Paper: https://arxiv.org/abs/2608.08366
- Estructura de pesos: https://github.com/zchxhcz1/Morph2Mol/blob/main/weights/README.md
- Dependencia UNI2-h: https://huggingface.co/MahmoodLab/UNI2-h
