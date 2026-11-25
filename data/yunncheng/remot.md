# Yunncheng/ReMoT

## Resumen

ReMoT es un detector de imagenes generadas por IA desarrollado por Yuncheng Guo, Ying Dong y Xiaodong Gu (preprint no publicado). El modelo aborda el problema de la deteccion forense de imagenes sinteticas mediante una estrategia poco habitual: en lugar de ajustar finamente un backbone visual, congela por completo el codificador DINOv3 ViT-L/16 y entrena unicamente un modulo de lectura (readout) de apenas 3.074 parametros entrenables. La tesis del trabajo, reflejada en el titulo "Reading, Not Adapting", es que el conocimiento visual congelado de DINOv3 ya contiene senales suficientes para discriminar imagenes reales de generadas.

Tecnicamente, ReMoT combina dos vistas de la imagen de entrada: una vista RGB convencional y una vista en el dominio wavelet, ambas procesadas por el backbone congelado, cuyas representaciones alineadas alimentan el readout entrenable. El checkpoint publicado corresponde a la receta de entrenamiento sobre el subconjunto SD v1.4 del benchmark GenImage.

El modelo es relevante para investigadores en forense de imagenes y para equipos que necesitan verificar la autenticidad de contenido visual en pipelines de moderacion o periodismo. Su interes practico radica en el coste de entrenamiento extremadamente bajo (miles de parametros frente a millones en un fine-tuning convencional) y en la reutilizacion de un backbone de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ViT-L/16 (DINOv3) congelado con readout entrenable y doble vista RGB + wavelet |
| Parametros totales | no disponible (el repo ocupa 1,2 GB, compatible con ViT-L/16 en fp32) |
| Parametros activos | no aplica (no es MoE) |
| Parametros entrenables | 3.074 |
| Longitud de contexto | no aplica (modelo de clasificacion de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | DINOv3 License (checkpoint); codigo fuente bajo Apache 2.0 |
| Formato de pesos | PyTorch (`.pth`) |
| Tarea | Clasificacion binaria imagen real vs. generada por IA |
| Modelo base | facebook/dinov3-vitl16-pretrain-lvd1689m |
| Datos de entrenamiento | GenImage, subconjunto SD v1.4 |
| Entrada | Imagen RGB + vista wavelet |

## Arquitectura y entrenamiento

ReMoT se construye sobre DINOv3 ViT-L/16, un transformer de vision con parches de 16x16 y aproximadamente 300 millones de parametros, preentrenado por Meta con el objetivo de auto-supervision DINOv3 sobre el corpus LVD-1689M. La innovacion del metodo consiste en mantener este backbone completamente congelado y procesar la imagen en dos representaciones complementarias: la vista RGB estandar y una vista transformada al dominio wavelet. Las representaciones resultantes se alinean y se pasan a un modulo de lectura ligero que realiza la clasificacion final.

El entrenamiento se limita a los 3.074 parametros del readout, lo que reduce drasticamente el coste computacional y el riesgo de sobreajuste al dominio de entrenamiento. El checkpoint publicado corresponde a la receta entrenada sobre el subconjunto SD v1.4 de GenImage, un benchmark ampliamente utilizado en deteccion de imagenes sinteticas. No se dispone en la informacion proporcionada de detalles sobre el numero de imagenes de entrenamiento, la composicion exacta del dataset, el uso de RLHF/DPO (no aplicable a una tarea de clasificacion) ni hiperparametros de optimizacion.

## Capacidades

- Clasificacion binaria de imagenes: distingue imagenes reales de imagenes generadas por modelos de difusion (entrenado especificamente con SD v1.4).
- Analisis multi-vista: combina informacion del dominio espacial (RGB) y del dominio frecuencial (wavelet), lo que ayuda a detectar artefactos espectrales tipicos de la generacion por difusion.
- Reutilizacion de representaciones visuales de proposito general gracias al backbone DINOv3 congelado.
- Inferencia ligera en cuanto a parametros entrenables, aunque el backbone completo debe ejecutarse en cada pasada.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, texto, audio ni modo thinking: es exclusivamente un clasificador de imagen.
- Capacidades multilingues: no aplica.

## Casos de uso

- Moderacion de contenido en plataformas: filtrar imagenes sinteticas subidas por usuarios antes de su publicacion, usando ReMoT como clasificador de primera linea en un pipeline de revision.
- Verificacion periodistica: comprobar la autenticidad de imagenes recibidas de fuentes externas antes de publicarlas, aprovechando la deteccion de artefactos en el dominio wavelet.
- Investigacion en forense digital: servir como baseline reproducible para estudiar la transferibilidad de detectores entrenados sobre SD v1.4 frente a otros generadores.
- Auditoria de datasets: detectar imagenes generadas por IA infiltradas en conjuntos de datos de entrenamiento o evaluacion de otros modelos.
- Deteccion de fraude documental: identificar imagenes sinteticas adjuntas en tramites o reclamaciones donde se exige evidencia fotografica real.
- Analisis de campanas de desinformacion: procesar lotes de imagenes virales para estimar la proporcion de contenido generado por IA en una campana concreta.
- Experimentacion academica de bajo coste: reproducir y extender el metodo con solo 3.074 parametros entrenables, ideal para grupos con recursos computacionales limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de accuracy, AUC ni comparaciones numericas con otros detectores sobre GenImage u otros conjuntos.

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone ViT-L/16 en fp32 ocupa aproximadamente 1,2 GB de pesos; con activaciones y procesamiento por lotes se recomienda al menos 4-6 GB de VRAM para lotes pequenos.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM; una RTX 3090, RTX 4090, A100 o H100 ofrecen margen amplio para procesar lotes grandes.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas (RTX 3060 Ti, RTX 3070, RTX 4060 Ti, RTX 4070, RTX 4080, RTX 4090).
- Opciones de despliegue: el repositorio oficial proporciona `scripts/eval.sh` con soporte para PyTorch; no se documenta soporte nativo para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un clasificador de vision, salvo wrappers propios).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Backbone | Parametros entrenables | Datos de entrenamiento | Licencia |
|---|---|---|---|---|---|
| ReMoT (este) | Detector IA, backbone congelado | DINOv3 ViT-L/16 | 3.074 | GenImage SD v1.4 | DINOv3 License |
| Detector CNN convencional (p. ej. ResNet-50 fine-tuned) | Detector IA, fine-tuning completo | ResNet-50 | ~25 M | Variable | Variable segun implementacion |
| Detector basado en CLIP ViT-L/14 fine-tuned | Detector IA, fine-tuning | CLIP ViT-L/14 | ~300 M | Variable | MIT / Apache 2.0 segun pesos |
| UniversalFakeDetect (referencia academica) | Detector IA, feature extraction | CLIP ViT-L/14 | Lineal | ProGAN / otros | MIT |

No se dispone de datos numericos de rendimiento comparativo en la informacion proporcionada. La comparativa se limita a caracteristicas estructurales.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre el subconjunto SD v1.4 de GenImage: la generalizacion a otros generadores (Midjourney, DALL-E, Flux, Stable Diffusion XL, etc.) no esta documentada y es probable que degrade.
- Riesgo de sobreajuste a artefactos especificos del generador de entrenamiento; la deteccion de imagenes generadas por modelos mas recientes puede ser deficiente.
- Riesgo de falsos positivos en imagenes reales con procesamiento agresivo (compresion, filtros, reescalado) que alteren las estadisticas wavelet.
- Licencia DINOv3: restricciones de uso comercial heredadas del backbone; es necesario revisar los terminos antes de desplegar en produccion.
- El codigo fuente es Apache 2.0, pero el checkpoint esta sujeto a la licencia DINOv3; la separacion debe respetarse.
- Modelo de investigacion (preprint no publicado): no hay validacion por pares ni garantias de robustez en entornos adversarios.
- No procesa texto ni otros modales; su uso esta limitado a clasificacion de imagen.
- No se documentan sesgos demograficos ni de dominio; al ser un clasificador binario, los sesgos se manifestarian como tasas de error diferenciales por tipo de imagen o contenido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yunncheng/ReMoT
- Codigo fuente y configuracion: https://github.com/yunncheng/ReMoT
- Licencia DINOv3: https://github.com/facebookresearch/dinov3/blob/main/LICENSE.md
- Modelo base DINOv3 ViT-L/16: https://huggingface.co/facebook/dinov3-vitl16-pretrain-lvd1689m
- Repositorio DINOv3: https://github.com/facebookresearch/dinov3
- Checkpoint directo: https://huggingface.co/Yunncheng/ReMoT/resolve/main/remot-vitl16.pth
