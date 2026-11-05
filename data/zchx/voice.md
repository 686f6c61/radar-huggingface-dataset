# zchx/VOICE

## Resumen

VOICE es un modelo de aprendizaje profundo desarrollado por el usuario zchx (repositorio GitHub `zchxhcz1/VOICE`) que aborda la reconstruccion de transcriptomica unicelular espacial a partir de imagenes histologicas H&E. El modelo predice la expresion genica espacial de celulas individuales combinando un codificador de imagenes, un decodificador espacial y un banco de referencia de celulas con expresion medida. Se presenta como un modelo fundacional multimodal orientado a biologia computacional y patologia digital.

La propuesta tecnica es relevante porque permite obtener perfiles de expresion genica sin necesidad de medir la expresion en la muestra objetivo: la prediccion requiere unicamente una imagen H&E y no necesita expresion medida ni caracteristicas de imagen precomputadas para la lamina diana. El modelo cubre 18.580 genes y ofrece pesos de fusion especificos por organo y panel, con 15 organos de referencia y 20 grupos organo/panel disponibles.

El repositorio tiene 3,4 GB, se distribuye en formato PyTorch y esta etiquetado con los terminos biology, spatial-transcriptomics e image-to-expression. No se han publicado datos sobre licencia, idiomas ni pipeline en la informacion disponible. La model card referencia el paper arXiv:2608.08366 y un repositorio GitHub con codigo de instalacion y prediccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de imagenes + decodificador espacial + banco de referencia de celulas (modelo fundacional multimodal) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa bloques de hasta 128 celulas diana y 64 celulas de contexto, con contexto seleccionado en un radio de 137 µm) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (checkpoints descargables via Hugging Face; requiere `pytorch_model.bin` de UNI2-h) |

## Arquitectura y entrenamiento

La arquitectura combina tres componentes: un codificador de imagenes (que emplea UNI2-h, cuyo acceso debe solicitarse por separado en MahmoodLab/UNI2-h), un decodificador espacial y un banco de referencia de celulas con expresion medida. El flujo de prediccion segmenta nucleos, extrae recortes de imagen centrados en celula, predice la expresion y recupera la expresion de referencia, combinando ambas predicciones mediante pesos de fusion. La prediccion espacial usa bloques de hasta 128 celulas diana y 64 celulas de contexto, con contexto seleccionado dentro de 137 µm; todas las celulas del bloque participan en la atencion, pero solo se guardan las predicciones de las celulas diana. El particionado es determinista para un mismo sample ID y semilla fija.

Los pesos de fusion se ajustan por organo y por grupo organo/panel, distinguiendo entre `narrow` (menos de 1.000 genes medidos del modelo en la referencia de ajuste) y `wide` (al menos 1.000). Cada peso genico es la media equitativa de sus pesos ajustados entre las laminas de referencia contribuyentes de ese grupo organo/panel. Los grupos de referencia unica se incluyen: el ajuste recupera de otras laminas de referencia entre tejidos, excluyendo la referencia de consulta y sus muestras relacionadas de donante/bloque. El manifiesto `beta/manifest.json` lista recuentos de referencias, genes ajustados y sumas de comprobacion. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO.

## Capacidades

- Prediccion de expresion genica espacial unicelular a partir de imagenes H&E, con salida en formato `.h5ad` (AnnData).
- Cobertura de hasta 18.580 genes del modelo, con opcion de predecir un subconjunto ordenado de simbolos genicos.
- Segmentacion automatica de nucleos (via Cellpose) y soporte para limites celulares suministrados por el usuario.
- Soporte de formatos de imagen SVS, NDPI y MRXS mediante OpenSlide, ademas de PNG, JPEG y TIFF.
- Seleccion de pesos de fusion por organo y panel (`narrow`/`wide`) para 15 organos y 20 grupos organo/panel.
- Exposicion de caracteristicas de imagen y espaciales mediante `--save-embeddings`.
- Inferencia en GPU (CUDA por defecto) y en CPU (`--device cpu --amp fp32`).
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, agentes ni multilingues.

## Casos de uso

- Prediccion de expresion genica en patologia digital: a partir de una lamina H&E completa (SVS/NDPI/MRXS), el modelo segmenta nucleos y genera una matriz de expresion por celula en `.h5ad`, util para estudios retrospectivos sobre tejido ya digitalizado sin necesidad de medir expresion.
- Analisis de cohortes histologicas existentes: al no requerir expresion medida ni caracteristicas precomputadas para la lamina diana, permite reanalizar archivos de patologia con solo imagen y obtener perfiles transcriptomicos espaciales aproximados.
- Investigacion en transcriptomica espacial: el banco de referencia y los pesos de fusion por organo permiten generar hipotesis de expresion espacial que luego pueden validarse con tecnicas experimentales como Visium o Xenium.
- Seleccion de paneles genicos dirigidos: la opcion `--genes genes.txt` permite predecir un subconjunto ordenado de genes de interes, reduciendo el tamano de salida y el coste de almacenamiento en estudios focalizados.
- Estudios multi-organo: los pesos de fusion cubren 15 organos (bone, brain, breast, cervix, colon, heart, kidney, liver, lung, lymph_node, ovary, pancreas, prostate, skin, tonsil), lo que facilita comparaciones entre tejidos con el mismo pipeline.
- Control de fuga de datos en validacion: las opciones `--sample-id` y `--exclude` permiten excluir la muestra diana y muestras relacionadas del banco de referencia, util para evaluaciones reproducibles.
- Procesamiento por lotes en entornos con recursos limitados: `--enc-chunk` y `--query-batch` reducen el uso transitorio de memoria GPU, y la inferencia en CPU con `--amp fp32` permite ejecutar sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 3,4 GB, pero no se especifica el consumo de memoria del modelo en ejecucion.
- GPU recomendadas: no disponible. La model card solo indica que CUDA es el dispositivo por defecto y que se puede usar CPU con `--device cpu --amp fp32`.
- Compatibilidad con GPU de consumo: no disponible; no se confirma que quepa en RTX 4090 u otras GPU consumer.
- Opciones de despliegue: scripts de prediccion del repositorio (`predict/predict.py`) sobre PyTorch; requiere OpenSlide para SVS/NDPI/MRXS y Cellpose para segmentacion automatica. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Ajuste de memoria: `--enc-chunk 32 --query-batch 64` reduce el uso transitorio de memoria GPU; `--workers 4` fija los procesos CPU para cargar recortes celulares.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (prediccion de expresion genica a partir de histologia) ni datos de rendimiento para establecer una comparacion.

## Limitaciones y advertencias

- Licencia no especificada: no se indica si el uso comercial esta permitido; debe consultarse con el autor antes de cualquier despliegue en produccion.
- Dependencia de acceso externo: el codificador UNI2-h requiere solicitud de acceso separada en MahmoodLab/UNI2-h y autenticacion con una cuenta de Hugging Face propia.
- Dependencia de Cellpose: la primera ejecucion de segmentacion descarga el modelo Cellpose; en entornos sin red debe proporcionarse con `--segment-model`.
- Resolucion fisica requerida: si la imagen no contiene metadatos de resolucion, debe indicarse manualmente `--mpp`; un valor incorrecto afecta a la prediccion.
- Segmentacion limitada: la segmentacion automatica produce nucleos; para limites celulares completos debe suministrarse `--cells` con limites existentes.
- Cobertura genica dependiente del organo: los pesos de fusion `narrow` cubren menos de 1.000 genes medidos del modelo en la referencia de ajuste (por ejemplo, 369 genes en heart, tonsil y otros), frente a grupos `wide` con hasta 18.539 genes (colon). La cobertura real varia por tejido.
- Riesgo de fuga en evaluacion: si la muestra diana o muestras relacionadas estan en el banco de referencia, deben excluirse con `--sample-id` y `--exclude` para evitar resultados optimistas.
- Sin datos de sesgo, alucinacion o robustez: no se han publicado evaluaciones de sesgo ni de calibracion en la informacion disponible.
- Idiomas no aplicables: el modelo no procesa texto; la ausencia de idiomas en la model card es coherente con su naturaleza de imagen a expresion.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion independiente en la informacion proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/zchx/VOICE
- Codigo en GitHub: https://github.com/zchxhcz1/VOICE
- Paper: https://arxiv.org/abs/2608.08366
- Estructura de pesos: https://github.com/zchxhcz1/VOICE/blob/main/weights/README.md
- Codificador UNI2-h (acceso separado): https://huggingface.co/MahmoodLab/UNI2-h
