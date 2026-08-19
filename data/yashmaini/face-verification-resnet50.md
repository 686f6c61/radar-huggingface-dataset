# yashMaini/face-verification-resnet50

## Resumen

El modelo `yashMaini/face-verification-resnet50` es un sistema de verificacion facial basado en una ResNet50 preentrenada en ImageNet y ajustada con una perdida ArcFace (margen angular aditivo) combinada con triplet loss batch-hard. Desarrollado por yashMaini, genera embeddings faciales de 512 dimensiones normalizados L2, de modo que la similitud coseno se reduce a un producto escalar. Su objetivo es resolver tareas de verificacion y reconocimiento de identidad a partir de imagenes de rostros, sin depender de librerias externas de reconocimiento facial, ya que el unico componente preentrenado es el backbone de ImageNet. Es relevante por su licencia MIT, su tamano reducido (0.2 GB) y su transparencia metodologica, aunque su rendimiento absoluto esta por debajo de sistemas de produccion debido al reducido corpus de entrenamiento (~7.000 imagenes).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet50 (backbone ImageNet) + cabecera de embedding 512-D |
| Parametros totales | no disponible (ResNet50 base ~25M, sin confirmar) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 224x224 RGB) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (procesa imagenes) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pth` (checkpoint `best_model.pth`) |

## Arquitectura y entrenamiento

El modelo parte de una ResNet50 con pesos iniciales de ImageNet. Tras la capa de pooling global se anade un dropout (0.4) y una capa lineal sin sesgo que proyecta a 512 dimensiones, seguida de BatchNorm y normalizacion L2. El entrenamiento combina dos funciones de perdida: ArcFace con escala 30 y margen 0.5, y triplet loss batch-hard con margen 0.3 sobre distancia coseno. El muestreo por lotes usa P x K (16 identidades x 4 imagenes). Se entrena sobre 1.500 identidades y aproximadamente 7.000 imagenes, con aumento de datos mediante volteo horizontal en inferencia (test-time augmentation). No se emplea ninguna libreria especifica de reconocimiento facial; el unico componente preentrenado es el backbone de ImageNet. El checkpoint tiene un hash sha256 documentado.

## Capacidades

- Verificacion facial: determina si dos imagenes corresponden a la misma persona mediante similitud coseno (umbral 0.1838).
- Generacion de embeddings faciales de 512 dimensiones, L2-normalizados, aptos para busqueda por similitud o clustering.
- Reconocimiento de identidad cerrado: rank-1 y rank-5 sobre identidades vistas en entrenamiento (aunque con rendimiento limitado).
- Deteccion de rostros enmascarados: el modelo degrada significativamente con mascarillas, pero es capaz de producir embeddings en ese escenario.
- No soporta generacion de texto, tool calling, agentes ni capacidades multimodales mas alla de vision facial.

## Casos de uso

- Control de acceso fisico: verificar la identidad de una persona comparando su rostro con una imagen de referencia almacenada, usando el umbral de coseno para aceptar o rechazar.
- Autenticacion en aplicaciones moviles: desbloqueo de dispositivos o cuentas mediante comparacion de selfies con la foto de perfil.
- Organizacion de colecciones fotograficas: agrupar imagenes por identidad usando los embeddings y un algoritmo de clustering (por ejemplo, agrupamiento aglomerativo).
- Busqueda de identidades en bases de datos pequenas: dado un rostro de consulta, recuperar los registros mas similares mediante producto escalar.
- Investigacion academica: servir como modelo baseline de verificacion facial para comparar tecnicas de metric learning o evaluar protocolos de evaluacion.
- Prototipado rapido de sistemas biometricos: por su licencia MIT y su facil integracion en PyTorch, permite validar ideas sin coste de licencia ni dependencias complejas.

## Benchmarks y rendimiento

La model card reporta resultados sobre un subconjunto de 120 identidades de LFW, con separacion identidad-disjunta (ninguna persona del test aparece en entrenamiento). Se evaluaron 530.965 pares de test.

| Metrica | Valor |
|---|---|
| ROC-AUC | 0.9587 |
| Equal Error Rate (EER) | 9.61% |
| Exactitud de verificacion (umbral coseno 0.1838) | 90.60% |
| Rank-1 / Rank-5 | 64.00% / 85.62% |
| TAR @ FAR = 1% | 72.76% |
| TAR @ FAR = 0.1% | 43.76% |
| Open-set DIR @ FPIR = 1% | 28.62% |

Al puntuar todos los pares de test (en lugar de una muestra de 10.000), el AUC sube a 0.9638 y el EER baja a 8.81%, lo que indica que la muestra es representativa. En el conjunto MLFW (rostros con mascarilla), el rendimiento cae: ROC-AUC 0.8388, EER 24.58% y TAR @ FAR 1% de 35.36%.

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo es ligero (0.2 GB) y puede ejecutarse en CPU para aplicaciones de baja latencia (por ejemplo, en un servidor estandar).
- VRAM estimada: inferior a 1 GB en FP32 para una sola imagen; cabe en cualquier GPU consumer (GTX 1060 o superior).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, aunque no es necesaria para inferencia.
- Opciones de despliegue: al ser un checkpoint PyTorch nativo, puede servirse con TorchServe, FastAPI o integrarse en pipelines de procesamiento por lotes. No se proporcionan versiones ONNX ni TensorRT.
- Latencia y throughput: no se han publicado mediciones oficiales; en una CPU moderna se esperan decenas de milisegundos por imagen (sin optimizaciones).

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la informacion proporcionada. Modelos como FaceNet (Inception-ResNet) o ArcFace (ResNet100) son alternativas conocidas, pero no se han evaluado bajo el mismo protocolo ni con los mismos datos en esta ficha. Se recomienda consultar la literatura especifica para comparaciones rigurosas.

## Limitaciones y advertencias

- Entrenado con solo ~7.000 imagenes, muy por debajo de los corpus de produccion, lo que limita su precision absoluta en escenarios reales.
- LFW esta fuertemente sesgado hacia hombres adultos de piel clara en poses frontales; los resultados no evidencian equidad entre grupos demograficos.
- El rechazo de identidades no inscritas (open-set) es debil: con un 1% de FPIR solo se identifica correctamente al 28.62% de las muestras inscritas, lo que implica que la mayoria de rostros desconocidos no son rechazados con confianza.
- El rendimiento con mascarillas se degrada de forma acusada (EER 24.58% en MLFW), ya que el modelo nunca vio rostros enmascarados durante el entrenamiento.
- No es adecuado para vigilancia, aplicaciones de cumplimiento de la ley o cualquier despliegue donde una falsa coincidencia pueda tener consecuencias graves para la persona mal identificada.
- Requiere deteccion y alineacion previa de rostros (el repositorio proporciona un script con YuNet); alimentar fotografias sin recortar reduce el rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yashMaini/face-verification-resnet50
- Repositorio de codigo y evaluacion: https://github.com/Yashmaini30/face-verification-resnet50
