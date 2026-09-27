# Wajiddev99/busi-densenet121-v2b

## Resumen

Busi-densenet121-v2b es un clasificador binario de lesiones mamarias en ecografia (benigno frente a maligno) publicado por el autor Wajiddev99 en HuggingFace bajo licencia MIT. No es un modelo de lenguaje ni un modelo multimodal: es un conjunto de cinco redes convolucionales DenseNet121 entrenadas por validacion cruzada de 5 folds, cuya prediccion final se obtiene por voto de mayoria. La variante v2b incorpora entrenamiento guiado por mascara (mask-guided training) y aumento de datos mediante recorte que preserva la relacion de aspecto. El repositorio ocupa 0,1 GB y se distribuye con la libreria timm para image-classification.

El modelo resuelve un problema concreto de investigacion en imagen medica: dada una imagen de ecografia mamaria con una lesion, estima la probabilidad de malignidad P(maligno). Cada uno de los cinco modelos vota "maligno" si su probabilidad es igual o superior a 0,335, un umbral congelado sobre las predicciones out-of-fold de BUSI para garantizar al menos un 90 % de sensibilidad. La etiqueta final es la mayoria de los cinco votos. Es relevante ahora porque publica no solo el rendimiento interno, sino tambien una evaluacion externa honesta que documenta una caida fuerte de AUC (0,970 a 0,776) al pasar a otro hospital, un fenomeno de domain shift habitual en imagen medica.

La model card declara explicitamente que no es un dispositivo medico y que no debe usarse para diagnostico. El entrenamiento se hizo con aproximadamente 530 imagenes de BUSI, procedentes de un unico centro, y las imagenes sin lesion (normales) quedan fuera del alcance del modelo. Se trata, por tanto, de una herramienta de investigacion y de linea base reproducible, no de un producto clinico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DenseNet121 (red convolucional con conexiones densas) |
| Parametros totales | Aproximadamente 8 M por modelo (cifra de la arquitectura DenseNet121 estandar); no disponible el recuento exacto de los pesos publicados. El repositorio contiene un ensemble de 5 modelos |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificacion de imagen; la entrada es una imagen individual) |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | MIT |
| Formato de pesos | Pesos PyTorch/timm dentro de un repositorio de 0,1 GB; no se especifica el formato exacto (.pth, safetensors u otro) |
| Tarea | Clasificacion binaria de imagen (benigno frente a maligno) |
| Modalidad | Ecografia mamaria (ultrasound) |
| Numero de modelos | 5 (un modelo por fold, agregados por voto de mayoria) |
| Umbral de decision | P(maligno) >= 0,335, congelado sobre predicciones out-of-fold de BUSI |
| Resolucion de entrada | no disponible |
| Dataset de entrenamiento | BUSI, aproximadamente 530 imagenes, un solo centro |
| Fecha de publicacion | 27 de septiembre de 2026 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La base es DenseNet121, una CNN que conecta cada capa con todas las siguientes en orden feed-forward: para L capas existen L(L+1)/2 conexiones directas, de modo que cada capa recibe como entrada los mapas de caracteristicas de todas las capas precedentes. Esta concatenacion de caracteristicas favorece la reutilizacion de rasgos, reduce el numero de parametros frente a arquitecturas equivalentes en profundidad y suele funcionar bien en regimenes de pocos datos, que es precisamente el escenario de este modelo (unas 530 imagenes). No se especifican en la model card la inicializacion de pesos, el optimizador, el numero de epocas, la tasa de aprendizaje ni el esquema de aumento completo.

La variante v2b introduce dos elementos de entrenamiento: mask-guided training, que restringe la atencion del modelo a la region de la lesion mediante una mascara, y un aumento de datos basado en recorte con preservacion de la relacion de aspecto. El pipeline completo esta formado por cinco modelos entrenados con validacion cruzada agrupada de 5 folds sobre BUSI; sus probabilidades se agregan por voto de mayoria con el umbral fijado en 0,335, elegido sobre las predicciones out-of-fold para asegurar al menos un 90 % de sensibilidad. La model card no indica si hubo una fase adicional de ajuste con datos externos ni si se aplico calibracion posterior; la evaluacion en BUS-BRA externo sugiere que no se recalibro por sitio.

## Capacidades

- Clasificacion binaria de imagenes de ecografia mamaria con lesion: devuelve P(maligno) por modelo y una etiqueta final por voto de mayoria de los cinco folds.
- Agregacion en ensemble: combina cinco predicciones independientes, lo que reduce la varianza respecto a un unico modelo entrenado con una sola particion.
- Funcionamiento sobre imagenes individuales, sin necesidad de contexto adicional ni metadatos del paciente en la entrada.
- Umbral de decision preajustado para alta sensibilidad (>= 90 %) en el dominio de BUSI, orientado a minimizar falsos negativos en tareas de cribado preliminar.
- Deteccion de lesiones segmentadas o recortadas: el entrenamiento guiado por mascara asume que la region de interes esta localizada.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, function calling, capacidades de agente, multilingues, audio ni modo de pensamiento. Es un clasificador de vision cerrado, con una unica salida.
- No gestiona imagenes sin lesion (casos normales): estan declaradas fuera del alcance del modelo.

## Casos de uso

- Linea base reproducible en investigacion sobre cancer de mama: permite comparar nuevas tecnicas de clasificacion de ecografia mamaria contra un ensemble DenseNet121 con umbral y evaluacion publicados, incluyendo los cinco folds y el codigo de auditoria de datos.
- Estudio de domain shift entre centros sanitarios: la evaluacion interna (BUSI, AUC 0,970) frente a la externa (BUS-BRA, AUC 0,776) convierte al modelo en un caso de estudio util para medir cuanto degrada un clasificador al cambiar de hospital y de ecografo, y para probar estrategias de recalibracion por sitio.
- Preamotacion y curación de datasets: usar P(maligno) para ordenar o filtrar un lote de imagenes antes de la revision por especialistas, priorizando los casos con mayor probabilidad estimada en lugar de revisar la lista en orden arbitrario. Requiere supervision humana en todos los casos.
- Seleccion de casos para anotacion: en un flujo de construccion de un conjunto etiquetado, el modelo puede proponer candidatos con probabilidad intermedia o alta para que el esfuerzo de anotacion se concentre donde aporta mas informacion.
- Investigacion sobre calibracion y umbrales: el valor 0,335 esta congelado para BUSI; el modelo sirve para estudiar como se comporta la curva sensibilidad-especificidad al recalibrar por sitio y por fabricante de ecografo.
- Docencia y formacion tecnica: sirve para ilustrar de forma practica conceptos de validacion cruzada, agregacion por votacion, congelacion de umbrales antes de la evaluacion final y diferencias entre rendimiento interno y externo.
- Integracion en pipelines de investigacion de imagen medica: al ser un modelo PyTorch/timm pequeno, puede exportarse a ONNX o TorchScript y ejecutarse como etapa de un pipeline que lea estudios DICOM previamente recortados a la region de la lesion.
- Auditoria de sesgos por subgrupos: al conservar los cinco modelos por fold, permite analizar la dispersion de predicciones entre particiones y detectar subgrupos con comportamiento inestable antes de considerar cualquier uso en un estudio prospectivo.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor:

| Conjunto de datos | Metrica | Valor |
|---|---|---|
| BUSI, validacion cruzada de 5 folds (out-of-fold agrupado) | AUC | 0,940 |
| BUSI, conjunto de test bloqueado (105 imagenes) | AUC | 0,970 |
| BUS-BRA externo (1.875 imagenes, Brasil) | AUC | 0,776 (IC 95 %: 0,749-0,804) |
| BUS-BRA externo, con el umbral 0,335 de BUSI | Sensibilidad | 0,70 (objetivo declarado: 0,90) |

No se han publicado resultados de benchmarks adicionales (por ejemplo, comparaciones con otros clasificadores sobre BUSI o BUS-BRA) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma publicada. Como referencia de orden de magnitud, un DenseNet121 de aproximadamente 8 M parametros ocupa del orden de decenas de MB de pesos en FP32, por lo que la inferencia con lotes pequenos cabe holgadamente en cualquier GPU con 4 GB o mas.
- GPU recomendadas: cualquier GPU moderna de consumo o de centro de datos es suficiente. Una RTX 3060, RTX 4090 o una T4 son mas que suficientes para inferencia por lotes; una A100 o H100 estaria sobredimensionada salvo que se ejecuten muchos modelos o flujos en paralelo.
- Ejecucion en GPU de consumo: si, cabe en practicamente cualquier GPU de consumo actual, e incluso es viable en CPU para volumentes moderados, dado el reducido numero de parametros.
- Opciones de despliegue: PyTorch con timm (formato nativo del repositorio), exportacion a ONNX Runtime, TorchScript o TensorRT para reducir latencia, y servidores de inferencia genericos para modelos de vision. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje y no aplican a este caso.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de latencia ni de imagenes por segundo en la informacion proporcionada.

## Comparativa con modelos similares

En la informacion disponible no hay resultados de modelos comparables evaluados sobre BUSI o BUS-BRA, por lo que no es posible una comparacion cuantitativa de rendimiento en la misma tarea. La comparacion se limita al plano arquitectonico y de distribucion:

| Modelo | Tipo | Parametros | Licencia | Disponibilidad | Rendimiento en la tarea |
|---|---|---|---|---|---|
| Wajiddev99/busi-densenet121-v2b | Clasificador binario de ecografia mamaria (5 folds) | Aproximadamente 8 M por modelo; 5 modelos | MIT | HuggingFace, libreria timm | AUC 0,940 (BUSI CV), 0,970 (BUSI test), 0,776 (BUS-BRA externo) |
| torchvision densenet121 | Clasificador generico de imagenes (ImageNet) | Aproximadamente 8 M | BSD-3-Clause (torchvision) | PyTorch / torchvision | No evaluado en ecografia mamaria; no disponible |
| glasses/densenet121 | DenseNet121 publicado en HuggingFace | No disponible | No disponible en la informacion proporcionada | HuggingFace | No evaluado en ecografia mamaria; no disponible |
| qualcomm/DenseNet-121 | DenseNet121 orientado a despliegue en dispositivos | No disponible | No disponible en la informacion proporcionada | HuggingFace | No evaluado en ecografia mamaria; no disponible |

La diferencia clave frente a los DenseNet121 genericos es el ajuste fino sobre BUSI y el esquema de ensemble con umbral calibrado; ninguno de los modelos comparables de la tabla incluye evaluacion en ecografia mamaria.

## Limitaciones y advertencias

- No es un dispositivo medico. La propia model card indica que es un modelo de investigacion entrenado con datos publicos y que no debe usarse para diagnostico.
- Caida drastica de rendimiento entre centros: el AUC pasa de 0,970 en el test bloqueado de BUSI a 0,776 en BUS-BRA (Brasil), lo que indica que los resultados no se transfieren de forma fiable entre hospitales, ecografos o protocolos de adquisicion.
- Perdida de sensibilidad fuera de dominio: con el umbral 0,335 fijado en BUSI, la sensibilidad en el conjunto externo baja a 0,70 frente al objetivo de 0,90. Cualquier uso en otro entorno exigiria recalibracion especifica por sitio.
- Datos de entrenamiento muy limitados y de un unico centro: aproximadamente 530 imagenes de BUSI. Este tamano reduce la diversidad de equipos, poblaciones y tecnicas de adquisicion representadas.
- Las imagenes sin lesion (normales) quedan fuera del alcance: el modelo asume que la entrada contiene una lesion y no esta disenado para descartar estudios normales.
- Dependencia de la localizacion de la lesion: el entrenamiento guiado por mascara implica que el rendimiento puede degradarse si la region de interes no esta bien delimitada en la entrada.
- Riesgo de falsos negativos y falsos positivos: no se publican intervalos de confianza para todas las metricas ni matrices de confusion completas mas alla de la sensibilidad externa reportada.
- Sesgos potenciales: no se documenta un analisis por subgrupos (edad, densidad mamaria, tipo de lesion, fabricante de ecografo). Dado el origen unico de los datos, existe riesgo de sesgo hacia la poblacion y el equipamiento del centro de recogida.
- Sin garantias de calibracion probabilistica fuera de BUSI: el umbral 0,335 es especifico de ese conjunto y no debe trasladarse sin recalibrar.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificacion, pero la limitacion real es de responsabilidad clinica, no legal; el uso en contexto medico sin validacion prospectiva seria inapropiado.
- Adopcion practicamente nula: cero descargas y cero likes en el momento de la consulta, sin evidencia de validacion independiente por terceros.
- No se especifican la resolucion de entrada, el preprocesado exacto ni el formato de pesos, lo que dificulta reproducir la inferencia tal cual sin acudir al repositorio de codigo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Wajiddev99/busi-densenet121-v2b
- Codigo, auditoria de datos y evaluacion completa: https://github.com/wajidali99/breast-ultrasound-classification
- DenseNet121 en torchvision (documentacion): https://docs.pytorch.org/vision/master/models/generated/torchvision.models.densenet121.html
- DenseNet en PyTorch Hub: https://pytorch.org/hub/pytorch_vision_densenet/
- DenseNet121 en HuggingFace (glasses): https://huggingface.co/glasses/densenet121
- DenseNet-121 en HuggingFace (Qualcomm): https://huggingface.co/qualcomm/DenseNet-121
