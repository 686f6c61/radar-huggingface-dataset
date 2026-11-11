# yeajongcheol/rgb-nir-multimodal-mlp

## Resumen

El modelo `yeajongcheol/rgb-nir-multimodal-mlp` es un clasificador multimodal de materiales que combina imágenes RGB con espectros de infrarrojo cercano (NIR) de 18 canales para distinguir entre PET (plástico) y vidrio. Lo desarrolla el usuario yeajongcheol y se publica en Hugging Face bajo la librería PyTorch. No se trata de un modelo de lenguaje, sino de un sistema de visión por computador especializado en clasificación binaria de materiales para aplicaciones de reciclaje y separación de residuos.

La arquitectura es un MLP de fusión muy compacto (26 → 32 → 16 → 1 con activación LeakyReLU) que opera sobre características previamente extraídas. Por un lado, un modelo RGB fijo (basado en `do1ng/yolo11m-cnn-blackbox`, un YOLO11m con cabeza CNN) genera un vector de 1.280 dimensiones que se reduce a 8 dimensiones mediante PCA. Por otro, las 18 lecturas NIR normalizadas se usan directamente. Ambos bloques se concatenan en un vector de 26 dimensiones que alimenta el MLP de fusión, entrenable con solo 1.409 parámetros.

El modelo es relevante por su enfoque práctico de fusión tardía multimodal con un coste computacional mínimo: reutiliza un extractor RGB congelado y entrena únicamente una cabeza de fusión sobre datos espectrales. Está orientado a un caso de uso muy concreto (separación PET/vidrio) y su model card reporta una precisión del 100 % sobre un conjunto de test de 21 pares, aunque el propio autor advierte que esos datos ya se habían inspeccionado antes de la optimización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP de fusión (26 → 32 → 16 → 1, LeakyReLU) sobre características RGB (YOLO11m + CNN B congelado) y NIR de 18 canales |
| Parametros totales | 1.409 (solo el MLP de fusión); el extractor RGB es externo y congelado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ko (coreano, según metadatos; el modelo no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`fusion_model.pt`), más `preprocessing.npz` y `config.json`; código personalizado (`model.py`, `preprocessing.py`, `predict.py`, `rgb_model.py`, `train.py`) |

## Arquitectura y entrenamiento

El sistema es una fusión tardía de dos modalidades. La rama RGB utiliza un modelo YOLO11m con cabeza CNN (epoch 16, pesos congelados) del que se extraen los mapas de características P3, P4 y P5, se aplica average pooling y se obtiene un vector de 1.280 dimensiones. Ese vector se estandariza y se reduce a 8 dimensiones mediante PCA ajustada solo con los datos de entrenamiento. La rama NIR recibe 18 valores ya normalizados (suma aproximada de 1, sin negativos) y se estandariza. Antes de la concatenación se aplican factores fijos de escala (×2,0 para RGB y ×0,25 para NIR), resultando en una entrada de 26 dimensiones al MLP de fusión.

El MLP tiene dos capas ocultas (32 y 16 neuronas) con LeakyReLU, dropout de 0,2 y una salida logit con sigmoid en inferencia. La clase 0 corresponde a PET y la 1 a vidrio, con umbral de decisión en P(glass) ≥ 0,5. El entrenamiento usa BCEWithLogitsLoss, optimizador Adam con learning rate 0,001, batch size 8, weight decay 0,001, hasta 300 épocas con paciencia de 30, y se seleccionó la época 28. El conjunto de datos es muy reducido: 48 pares para entrenamiento y 15 para selección de modelo. No se aplicó aumento de datos ni modality dropout. No se reporta uso de RLHF ni DPO (no aplica a este tipo de modelo).

## Capacidades

- Clasificación binaria de material (PET frente a vidrio) a partir de una imagen RGB y un espectro NIR de 18 canales del mismo objeto.
- Extracción de características RGB mediante un extractor YOLO11m + CNN preentrenado y congelado.
- Reducción de dimensionalidad y estandarización deterministas (PCA y escalado ajustados en entrenamiento y guardados en `preprocessing.npz`).
- Inferencia sobre CPU o GPU (`--device cpu` o GPU), con salida en consola o JSON (`--json result.json`).
- Emparejamiento automático de filas NIR con imágenes RGB mediante columnas `image_path` u `original_filename`, con validación de coincidencia.
- Soporte de entrada preextraída de características RGB (`--rgb-features rgb_raw_features.npy`) para evitar recalcular el extractor.
- No soporta tool calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión general ni audio. Es un clasificador de un único dominio.

## Casos de uso

- Clasificación de residuos en plantas de reciclaje: el modelo recibe una imagen RGB del objeto en la cinta y su lectura NIR de 18 bandas, y devuelve si es PET o vidrio, permitiendo accionar un soplador o brazo de separación. Es adecuado porque la fusión de ambas modalidades aporta información espectral que la imagen RGB sola no captura.
- Control de calidad en líneas de envasado: verificar que un flujo de envases declarado como vidrio no contenga PET, usando la cámara RGB y el sensor NIR ya instalados en la línea y el MLP de fusión como paso de decisión final.
- Prototipado rápido de sistemas de visión espectral: dado que el extractor RGB es fijo y solo se entrena una cabeza de 1.409 parámetros, sirve como base para experimentar con otras combinaciones de sensores y materiales sin reentrenar el backbone.
- Investigación en fusión multimodal de bajo coste: el repositorio incluye `train.py` y el formato NPZ de entrada, lo que permite reproducir el pipeline (características RGB de 1.280 dimensiones, NIR de 18, etiquetas 0/1) y evaluar variantes de arquitectura de fusión.
- Integración en sistemas de inspección con recursos limitados: al requerir solo el MLP de fusión en tiempo de inferencia (el extractor RGB puede ejecutarse por separado o precalcularse), el coste adicional es mínimo y cabe en CPU.
- Auditoría y trazabilidad de clasificación: el modelo admite guardar la predicción y las probabilidades por clase en JSON, útil para registrar decisiones en entornos regulados de gestión de residuos.
- Preprocesado de datasets espectrales: el emparejamiento automático imagen-NIR y la validación de filas permiten usar el código de `predict.py` como herramienta de verificación de correspondencias en conjuntos de datos propios.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre un conjunto de test común de 21 pares (10 PET, 11 vidrio). Las etiquetas de referencia son las etiquetas NIR de material asignadas manualmente.

| Modelo | Aciertos | Accuracy | Macro-F1 |
|---|---:|---:|---:|
| Modelo RGB fijo (sin NIR) | 20 / 21 | 95,24 % | 0,973684 |
| Clasificador multimodal de fusión (este modelo) | 21 / 21 | 100,00 % | 1,000 |

Advertencias del propio autor: los 21 pares ya se habían inspeccionado antes de la optimización del modelo, por lo que no constituyen una evaluación independiente; el conjunto es pequeño y no se ha verificado por completo que los objetos adicionales sean físicamente distintos de los de entrenamiento. La fila multimodal aplica el clasificador de fusión a los 21 pares y no refleja el rendimiento del flujo completo (que solo ejecuta la fusión cuando la cabeza CNN clasifica como vidrio o PET). Las métricas no son mAP de detección de objetos. No se reportan benchmarks estándar (MMLU, HumanEval, GSM8K) por no ser aplicables.

## Requisitos de hardware

- El MLP de fusión tiene 1.409 parámetros: su inferencia ocupa kilobytes y se ejecuta en CPU sin problema.
- El coste real está en el extractor RGB (YOLO11m + CNN), que requiere pesos externos (`best_overall.pt`, SHA-256 `ed55d332fa254715f1533d7eb7837925b5d70e50b6863393ed5479a2eace00a1`) descargados del repositorio `do1ng/yolo11m-cnn-blackbox`.
- VRAM estimada para el extractor RGB: no disponible en la información proporcionada. Para un YOLO11m típico, la inferencia en FP32 suele caber en GPUs consumer de 8 GB o más, pero este dato no lo confirma la model card.
- GPU recomendadas: no disponible. El modelo admite `--device cpu` explícitamente; para GPU no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- Cabe en GPU consumer: probablemente sí para el extractor RGB, pero no confirmado por el autor. El MLP de fusión cabe en cualquier hardware.
- Opciones de despliegue: ejecución directa con `python predict.py` (PyTorch); no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo). Se puede precalcular la característica RGB de 1.280 dimensiones y usar `--rgb-features` para desacoplar el extractor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de clasificación RGB-NIR PET/vidrio en la documentación proporcionada. La comparación más directa disponible es interna al propio repositorio:

| Modelo | Entradas | Parámetros entrenables | Accuracy (test 21) | Macro-F1 |
|---|---|---:|---:|---:|
| Modelo RGB fijo | RGB | 0 (congelado) | 95,24 % | 0,973684 |
| Este modelo (fusión) | RGB + NIR 18 canales | 1.409 | 100,00 % | 1,000 |

No se conocen alternativas públicas comparables con las que contrastar parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Conjunto de datos muy reducido: 48 pares de entrenamiento y 15 de selección; el test de 21 pares ya se había inspeccionado antes de la optimización, por lo que la métrica del 100 % no representa rendimiento en datos independientes.
- Sesgo de dominio: entrenado para distinguir solo PET y vidrio; el plástico de gran tamaño (class 24 del etiquetado original) queda fuera del alcance.
- Dependencia estricta del preprocesado: los valores NIR deben estar ya normalizados (sin negativos, suma aproximada de 1) como en el CSV de entrenamiento; el código no realiza corrección de sensor ni normalización de cuentas crudas.
- Dependencia de los pesos RGB externos: usar otros pesos YOLO invalida la estandarización y el PCA guardados; el repositorio no redistribuye `best_overall.pt`.
- Las probabilidades de salida no están calibradas; no deben interpretarse como niveles de confianza calibrados.
- El flujo completo solo ejecuta la fusión cuando la cabeza CNN clasifica el objeto como vidrio o PET; el rendimiento de ese flujo completo no se ha evaluado.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución.
- Riesgo de alucinación no aplica (no es un modelo generativo), pero sí existe riesgo de clasificación errónea ante materiales distintos o condiciones de iluminación y sensores diferentes a los de entrenamiento.
- Idiomas: los metadatos indican coreano, aunque el modelo no procesa texto; la documentación está en coreano.
- Sin garantías de generalización a otras cámaras, sensores NIR o configuraciones espectrales distintas de las usadas en el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yeajongcheol/rgb-nir-multimodal-mlp
- Modelo base RGB (YOLO11m + CNN B): https://huggingface.co/do1ng/yolo11m-cnn-blackbox
- Pesos RGB `best_overall.pt` (epoch 16): https://huggingface.co/do1ng/yolo11m-cnn-blackbox/resolve/ae32ffbc5f2de1ec1a43d18e34f2101534c1bd7f/best_overall.pt
- Papers, blogs, repos y demos adicionales: no disponibles en la información proporcionada.
