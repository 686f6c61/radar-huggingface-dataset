# sugam24/geonusaf-s4-tcsegformer-R0-block-fold1

## Resumen

El modelo `sugam24/geonusaf-s4-tcsegformer-R0-block-fold1` es un sistema de segmentación semántica para clasificación de usos del suelo en el valle de Katmandú (Nepal), desarrollado por el usuario sugam24. Forma parte de la etapa 4 del proyecto GeoNUSAF, que explora el uso de datos sintéticos para mejorar la segmentación en teledetección. Este checkpoint concreto corresponde al "arm R0" (solo datos reales), es decir, se entrenó exclusivamente con 804 imágenes reales, sin aumentación sintética, y sirve como línea base para comparar con variantes que sí incorporan datos generados.

El modelo se basa en la arquitectura SegFormer con backbone `nvidia/segformer-b0-finetuned-ade-512-512`, procesa imágenes de 512×512 píxeles y distingue 6 clases: residencial, carretera, río, bosque, suelo no utilizado y agrícola. Incluye mejoras como atención cruzada de escalas (CSA), pérdida soft-clDice y un muestreador balanceado. En validación alcanza un mIoU de 0,5608 y una precisión global (OA) de 0,8293. El repositorio pesa 0,8 GB y fue creado en septiembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SegFormer (backbone b0, con detail path y CSA) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (imagenes 512×512) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo visual, sin texto) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 0,8 GB, probablemente safetensors o binarios) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura SegFormer, un transformer jerárquico para segmentación semántica, con backbone b0 preentrenado en ADE20K. Sobre esta base se añaden dos componentes: un "detail path" que fusiona características de niveles [8, 16, 32] con un canal de fusión de 64, y una atención cruzada de escalas (CSA) con parámetros tau específicos por nivel. El entrenamiento se realizó durante 6000 pasos con warmup de 150 y decaimiento coseno, usando un muestreador balanceado con cap de 8,0 y pesos de clase derivados de la distribución real. Se aplicó pérdida soft-clDice con mu=0,3 a partir del paso 1000. El conjunto de entrenamiento contiene 804 imágenes reales (sin datos sintéticos) y la validación usa 136 teselas reales del mismo bloque. No se dispone de información sobre el número total de parámetros ni sobre el proceso de preentrenamiento más allá del backbone.

## Capacidades

- Segmentación semántica de usos del suelo en imagenes de teledeteccion de 512×512 píxeles.
- Clasificacion en 6 clases: residencial, carretera, rio, bosque, suelo no utilizado y agricola.
- Deteccion de bordes y estructuras finas gracias al detail path y la atencion CSA.
- Manejo de clases desbalanceadas mediante muestreo balanceado y pesos de clase.
- Inferencia sobre teselas individuales; no se especifica soporte para imagenes de mayor tamano sin teselado.
- No incluye capacidades de texto, tool calling ni agentes.

## Casos de uso

- Cartografia urbana: generar mapas de cobertura del suelo actualizados para el valle de Katmandú, clasificando areas residenciales, carreteras y zonas verdes a partir de ortofotos o imagenes de satelite.
- Planificacion urbana: identificar la expansion de zonas residenciales y la perdida de suelo agricola o forestal, apoyando decisiones de ordenacion territorial.
- Gestion de riesgos naturales: detectar cauces de rios y zonas de suelo no utilizado que podrian ser vulnerables a inundaciones o deslizamientos.
- Monitoreo ambiental: cuantificar la superficie de bosque y agricultura para estudios de cambio de uso del suelo a lo largo del tiempo.
- Generacion de datos de entrenamiento: servir como modelo base para generar pseudoetiquetas o datos sinteticos en el marco del proyecto GeoNUSAF (etapas posteriores).
- Evaluacion de tecnicas de segmentacion: comparar el rendimiento de un modelo entrenado solo con datos reales frente a variantes con datos sinteticos, como parte de la investigacion del autor.

## Benchmarks y rendimiento

Los resultados de validacion (136 teselas reales, sin pixeles sinteticos) son los siguientes:

| Metrica | Valor |
|---|---|
| mIoU | 0,5608 |
| mF1 | 0,7001 |
| OA (precision global) | 0,8293 |
| Kappa | 0,6931 |

Rendimiento por clase (IoU, precision de usuario UA, precision de productor PA):

| Clase | IoU | UA (prec) | PA (rec) |
|---|---|---|---|
| Residencial | 0,8456 | 0,9401 | 0,8938 |
| Carretera | 0,4279 | 0,5276 | 0,6936 |
| Rio | 0,4761 | 0,6154 | 0,6778 |
| Bosque | 0,7462 | 0,8919 | 0,8204 |
| Suelo no utilizado | 0,2966 | 0,5979 | 0,3704 |
| Agricola | 0,5722 | 0,6214 | 0,8784 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- No se proporcionan requisitos especificos de VRAM ni GPU en la documentacion.
- El tamaño del repositorio (0,8 GB) sugiere que los pesos ocupan menos de 1 GB, por lo que es probable que el modelo quepa en GPUs de consumo con al menos 4 GB de VRAM, aunque no hay confirmacion oficial.
- Al ser un SegFormer b0, la inferencia es ligera y podria ejecutarse en CPU para imagenes individuales, aunque con mayor latencia.
- No se mencionan opciones de despliegue especificas (vLLM, llama.cpp, etc.); al ser un modelo de vision, se usaria con librerias como PyTorch o HuggingFace Transformers.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. El autor menciona que este checkpoint no es comparable con una ejecucion anterior (part-1 fold-1) debido a diferencias en el split de entrenamiento y el esquema de entrenamiento, pero no se ofrecen datos de otros modelos.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos reales de una region concreta (valle de Katmandú); su generalizacion a otras areas geograficas no esta garantizada.
- Clases con bajo rendimiento, como "suelo no utilizado" (IoU 0,2966) y "carretera" (IoU 0,4279), indican dificultades para distinguir ciertas categorias, probablemente por desbalance o similitud espectral.
- La validacion no contiene pixeles sinteticos, pero el entrenamiento tampoco los incluye; el modelo puede no beneficiarse de las tecnicas de aumentacion sintetica que se evaluan en otras variantes del proyecto.
- No se especifica la licencia, por lo que el uso comercial o la redistribucion requieren consultar al autor.
- No hay informacion sobre sesgos especificos, pero al ser un modelo de vision entrenado en una region limitada, puede presentar sesgos geograficos y de resolucion.
- El tamaño del contexto no aplica al ser un modelo de vision; la entrada se limita a imagenes de 512×512.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sugam24/geonusaf-s4-tcsegformer-R0-block-fold1
- Repositorio relacionado (fold 2): https://huggingface.co/sugam24/geonusaf-tcsegformer-block-fold2
- Repositorio relacionado (fold 1, version anterior): https://huggingface.co/sugam24/geonusaf-tcsegformer-block-fold1
