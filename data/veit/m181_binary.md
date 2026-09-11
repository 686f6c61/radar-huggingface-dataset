# Veit/M181_binary

## Resumen

M181_binary es un clasificador binario de imágenes de plancton desarrollado por el usuario Veit, publicado en Hugging Face bajo licencia MIT. Se trata de la primera etapa del sistema dual-ViT denominado PISCO: dado un recorte (crop) de una partícula extraída de una imagen de plancton, el modelo decide si corresponde a un organismo vivo ("living") o a material no vivo ("not-living"), es decir, detritus, artefactos de imagen, burbujas o restos minerales. Parte de `google/vit-base-patch16-224-in21k` y se ha afinado sobre recortes validados por expertos de la campaña oceanográfica M181, en el Atlántico tropical, entre abril y mayo de 2022.

Técnicamente es un Vision Transformer de tipo ViT-Base con parche de 16x16 y resolución de entrada de 224x224 píxeles, con 85.800.194 parámetros (aproximadamente 86 millones) y pesos en formato safetensors. No es un modelo generativo ni multimodal: es un clasificador de imagen de dos clases con una única etiqueta de salida. Su relevancia es acotada pero clara dentro del dominio de la oceanografía biológica: sirve como filtro de bajo coste que descarta material no vivo antes de invocar el clasificador taxonómico multiclase de la segunda etapa (`Veit/M181_multiclass`).

El dato más importante de la model card es de carácter operativo: el modelo está acoplado a su preprocesamiento. Fue entrenado con recortes producidos por la deconvolución LUCYD `231204` (la opción por defecto del pipeline PISCO) y con recortes no aislados, es decir, con partículas vecinas visibles en la imagen. Cambiar el modelo de deconvolución o aislar los vecinos constituye un desplazamiento de dominio: en una evaluación sobre ATAIR-BSH, el simple cambio de deconvolución redujo la tasa de "living" entre un 83% y un 93% manteniendo la confianza del clasificador. Deconvolución, aislamiento del recorte y clasificador deben tratarse como una unidad versionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base, parche 16x16, entrada 224x224), `google/vit-base-patch16-224-in21k` afinado |
| Parametros totales | 85.800.194 (segun safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; entrada de imagen fija de 224x224 px (redimensionado del lado mayor a 224 y relleno centrado) |
| Tipos de cuantizacion | No disponible; el repositorio distribuye pesos en safetensors sin cuantizaciones publicadas |
| Idiomas soportados | No aplica (clasificacion de imagen); no se documentan idiomas |
| Licencia | MIT |
| Formato de pesos | safetensors (tamano del repositorio: 0,3 GB) |
| Clases de salida | 2: living, not-living |
| Normalizacion de entrada | media = desviacion = 0,5; relleno con blanco (255); sin rotacion en inferencia |
| Pipeline declarado | image-classification |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura es un transformer de vision estandar en configuracion Base: la imagen de 224x224 se divide en parches de 16x16 píxeles, se proyectan linealmente y se procesan con bloques de autoatencion. El checkpoint de partida, `google/vit-base-patch16-224-in21k`, es un ViT-Base preentrenado de forma supervisada en ImageNet-21k, y sobre el se ha realizado un ajuste fino de clasificacion con una cabeza de dos salidas. El recuento de parametros publicado (85,8 M) es coherente con esta configuracion. La model card no detalla hiperparametros de entrenamiento, numero de epocas, tasa de aprendizaje, composicion exacta del conjunto de entrenamiento ni si hubo aumento de datos mas alla del preprocesamiento descrito.

Los datos proceden de la campaña M181 (Atlantico tropical, abril-mayo de 2022) y son recortes validados por expertos. La innovacion tecnica relevante no esta en el modelo en si, sino en su integracion en el pipeline PISCO como primera etapa de un esquema dual-ViT, y en la dependencia explicita del preprocesamiento: los recortes se generan con la deconvolucion LUCYD `lucyd-edof-plankton_231204.pth` y se mantienen sin aislar, de modo que el clasificador puede apoyarse en el contexto de las particulas vecinas. La model card advierte que los recortes no deben llevar barra de escala (o esta debe eliminarse con `utils.strip_scale_bar`). No se documenta RLHF, DPO ni ninguna etapa de alineacion, algo esperable en un clasificador discriminativo.

## Capacidades

- Clasificacion binaria de imagenes de plancton en dos categorias: living y not-living.
- Filtrado de detritus, artefactos de imagen, burbujas y restos no vivos en recortes de particulas.
- Integracion como primera etapa de un pipeline dual-ViT, alimentando al clasificador taxonomico `Veit/M181_multiclass`.
- Funcionamiento con recortes que contienen particulas vecinas (entrenado con recortes no aislados).
- Inferencia sin rotacion y con un preprocesamiento determinista y reproducible (resize, pad blanco, normalizacion 0,5).
- Ejecucion ligera: al ser un ViT-Base de ~86 M de parametros, es viable en CPU y en GPUs de gama de consumo.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, capacidades de agente, modo "thinking", audio ni soporte multilingue. Cualquier uso fuera de la clasificacion de recortes de plancton queda fuera de su alcance.

## Casos de uso

- **Filtrado previo en pipelines de imagen de plancton in situ**: en plataformas tipo Imaging FlowCytobot, ZooScan o UVP, el modelo actua como primera etapa que descarta particulas no vivas antes de ejecutar el clasificador taxonomico multiclase, reduciendo el coste computacional de la segunda etapa.
- **Monitorizacion oceanografica en series temporales largas**: al ser un clasificador pequeno (0,3 GB de repositorio), permite procesar grandes volumenes de recortes de cruceros repetidos y calcular tasas de "living" comparables entre estaciones, siempre que se mantenga fija la version de deconvolucion y de recorte.
- **Estimacion de biomasa y estudios biogeoquimicos**: separar material vivo de detritus y agregados permite ajustar mejor indices de abundancia y flujos de carbono, ya que la fraccion no viva suele inflar los recuentos de particulas.
- **Control de calidad de datos de imagenes**: el modelo sirve para detectar recortes invalidos (burbujas, artefactos, restos) antes de que entren en un conjunto de entrenamiento o en una base de datos taxonomica.
- **Procesamiento a bordo o en entornos sin GPU**: con ~86 M de parametros, se puede ejecutar en CPU dentro del buque o en un nodo de borde, aplicando el filtro binario y reservando recursos para la etapa multiclase.
- **Reproducibilidad de analisis publicados**: el pipeline expone banderas especificas (`--binary-model-dir`, `--living-model-dir`, `--binary-model-hf Veit/M181_binary` o `--dualvit-model M181`) que permiten fijar la version exacta del modelo y reproducir resultados de la campaña M181.
- **Evaluacion de sensibilidad al preprocesamiento**: el propio modelo permite cuantificar el impacto de cambiar la deconvolucion o de aislar vecinos, un caso de uso metodologico util para validar cualquier pipeline de plancton antes de ponerlo en produccion.

## Benchmarks y rendimiento

La informacion disponible solo incluye una metrica de exactitud declarada por el autor, ademas de una observacion de sensibilidad al preprocesamiento. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y la busqueda web no devolvio resultados tecnicos relevantes sobre este modelo.

| Evaluacion | Resultado | Notas |
|---|---|---|
| Exactitud en test (campaña M181) | 97,65% | Metrica declarada en la model card; no se detalla el tamano del conjunto de test ni el intervalo de confianza |
| Sensibilidad a la deconvolucion (ATAIR-BSH) | Caida de la tasa de "living" del 83-93% | Medida al cambiar solo el modelo de deconvolucion, con confianza del clasificador sin cambios |
| Benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) | No aplica | Es un clasificador de imagen de dos clases |

## Requisitos de hardware

- **Peso de los parametros**: aproximadamente 343 MB en fp32 y 172 MB en fp16 (85,8 M de parametros). El repositorio completo ocupa 0,3 GB.
- **VRAM en inferencia**: inferior a 1 GB con lote pequeno en fp16; unos pocos cientos de MB adicionales para activaciones con lotes moderados. Es viable incluso en CPU para lotes de una o pocas imagenes.
- **GPU recomendadas**: cualquier GPU moderna es suficiente. Una RTX 4090, una RTX 3060 o incluso una GPU integrada reciente pueden servir; las A100 y H100 solo se justifican para procesar volumenes muy grandes en paralelo.
- **Compatibilidad con GPU de consumo**: si, con margen amplio. No requiere GPU de centro de datos ni cuantizacion para caber en memoria.
- **Opciones de despliegue**: `transformers` (clase de clasificacion de imagenes), `timm`, PyTorch nativo, exportacion a ONNX Runtime o TensorRT para acelerar lotes grandes, y el script propio del pipeline (`process_pisco_profiles.py`). No se distribuyen pesos GGUF y llama.cpp/Ollama no son formatos aplicables a este modelo.
- **Latencia y throughput**: no disponibles; no se publican mediciones de latencia ni de imagenes por segundo.

## Comparativa con modelos similares

No hay datos publicados que comparen M181_binary con otros clasificadores de plancton. La unica comparacion posible con la informacion disponible es con su propio checkpoint de partida.

| Modelo | Parametros | Contexto / entrada | Clases | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| Veit/M181_binary | 85.800.194 | Imagen 224x224 px | 2 (living, not-living) | MIT | 97,65% de exactitud en test sobre M181 (declarado por el autor) |
| google/vit-base-patch16-224-in21k | ~86 M | Imagen 224x224 px | 21.843 clases (ImageNet-21k) | Apache 2.0 (segun el checkpoint original) | No comparable directamente; es un modelo de proposito general previo al ajuste fino |
| Veit/M181_multiclass | No disponible | No disponible | Multiclase (taxonomia) | No disponible | No disponible; es la segunda etapa del sistema dual-ViT del mismo autor |
| Otros clasificadores de plancton basados en CNN o ViT | No disponible | No disponible | Variable | No disponible | No disponible en la informacion proporcionada |

## Limitaciones y advertencias

- **Acoplamiento estricto al preprocesamiento**: el modelo solo es valido con recortes generados por la deconvolucion LUCYD `231204` y sin aislar vecinos. Cambiar la deconvolucion o aislar las particulas provoca una caida de la tasa de "living" del 83-93% segun la medicion sobre ATAIR-BSH, sin que la confianza del clasificador disminuya, lo que hace que el fallo sea silencioso y dificil de detectar.
- **Unidad versionada**: deconvolucion, aislamiento del recorte y clasificador deben desplegarse y versionarse juntos. Mezclar versiones invalida los resultados.
- **Sesgo de dominio**: entrenado con datos de una unica campana (M181, Atlantico tropical, abril-mayo de 2022). El comportamiento en otras regiones, estaciones, instrumentos o protocolos de imagen no esta documentado.
- **Ambito taxonomico nulo**: el modelo no distingue especies ni grupos; solo separa vivo de no vivo. Usarlo para inferencias taxonomicas seria un error de interpretacion.
- **Riesgo de falsos positivos y negativos no cuantificado**: no se publican matrices de confusion, precision, recall ni F1 por clase, solo la exactitud global, que en un problema desbalanceado puede ocultar un rendimiento pobre en la clase minoritaria.
- **Dependencia de la barra de escala**: los recortes no deben incluir barra de escala, o esta debe eliminarse previamente con `utils.strip_scale_bar`. Su presencia no esta cubierta por el entrenamiento.
- **Adopcion y soporte minimos**: 0 descargas y 0 likes en el momento de la consulta, sin resultados de busqueda web relevantes. No hay comunidad, issues ni mantenimiento documentado mas alla del propio autor.
- **Licencia permisiva pero sin garantias**: la licencia MIT permite uso comercial y modificacion, pero se ofrece sin garantia alguna; cualquier uso en produccion oceanografica deberia validarse con datos propios antes de confiar en sus salidas.
- **Sin benchmarks estandar ni analisis de sesgos**: no hay evaluaciones independientes de equidad, robustez a perturbaciones de imagen ni pruebas de estres fuera del dominio M181.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Veit/M181_binary
- Checkpoint base: https://huggingface.co/google/vit-base-patch16-224-in21k
- Modelo complementario de la segunda etapa (mencionado en la model card): https://huggingface.co/Veit/M181_multiclass
- Repositorio y script del pipeline (`process_pisco_profiles.py`): no disponible como enlace directo en la informacion proporcionada
- Paper o publicacion tecnica: no disponible
- Demo: no disponible
- Nota sobre la busqueda web: los resultados devueltos correspondian a herramientas de gestion de PDF sin relacion con el modelo, por lo que no aportan enlaces tecnicos adicionales.
