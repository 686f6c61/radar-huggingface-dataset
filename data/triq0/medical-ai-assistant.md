# triq0/medical-ai-assistant

## Resumen

`triq0/medical-ai-assistant` es un repositorio de checkpoints de PyTorch que recoge los pesos entrenados de cinco modelos independientes que forman parte de un prototipo academico de asistente medico multimodal. Lo publica el usuario triq0 (el codigo fuente vive en el repositorio de GitHub `tarekmhmd/Medical-AI-Assistant-Platform`) como parte de un proyecto de fin de grado. No es un modelo generativo ni un LLM: es una coleccion de clasificadores y segmentadores de proposito especifico empaquetados bajo un mismo identificador de Hugging Face.

Los cinco componentes cubren cuatro modalidades: segmentacion y clasificacion de lesiones cutaneas a partir de imagenes (U-Net), clasificacion de sonidos respiratorios sobre mel-espectrogramas (CNN de 4 capas), clasificacion de valores analiticos tabulares (MLP 128-64-32) y clasificacion de texto de sintomas para un chatbot (embedding + BiLSTM de 2 capas con atencion). El checkpoint mas grande ronda los 8,1 millones de parametros y el repositorio completo ocupa 0,2 GB.

Su relevancia es limitada fuera del ambito docente: no hay model card con benchmarks comparativos, la licencia figura como "unresolved", los propios autores advierten que no es un dispositivo medico y los datos de entrenamiento y validacion son muy reducidos (3 epocas en la mayoria de checkpoints, accuracy reportada de 1.0 en dos de ellos, lo que sugiere sobreajuste o fuga de datos). Se incluye aqui como ficha de referencia para quien evalue prototipos academicos, no como candidato a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conjunto de 5 modelos: U-Net (segmentacion cutanea), CNN de 4 capas sobre mel-espectrogramas (sonido), MLP 128-64-32 (tabular), BiLSTM de 2 capas con atencion (texto) |
| Parametros totales | 21.049.268 en el conjunto de los cinco checkpoints (8.100.861 + 7.768.947 + 3.324.563 + 1.836.164 + 18.733) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el componente de texto usa vocabulario de 8.671 tokens y secuencias de longitud no documentada) |
| Tipos de cuantizacion | no disponible (checkpoints `.pth` en fp32; no se publican versiones cuantizadas) |
| Idiomas soportados | no disponible (el vocabulario del chatbot incluye tokens en ingles: `what`, `is`, `symptoms`, `of`, `the`...) |
| Licencia | `other` con `license_name: unresolved`; el codigo del repositorio GitHub se declara MIT, los pesos no tienen licencia resuelta |
| Formato de pesos | PyTorch `.pth` (pickle, `torch.save`); no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

El repositorio no contiene un unico modelo sino cinco checkpoints con arquitecturas independientes. El modulo cutaneo usa una U-Net con conexiones skip (`in_channels=3`, `out_channels=1`, `num_classes=8`, `init_features` no especificado en el extracto) para segmentacion y clasificacion de lesiones; hay dos variantes, una completa (`skin_model_full.pth`, 12 epocas, `val_iou=0.794`, `val_dice=0.881`) y otra combinada de clasificacion y segmentacion (3 epocas, `iou=0.651`, `dice=0.783`, `accuracy=0.097`). El modulo de sonido es una CNN de 4 capas sobre espectrogramas mel de 64 bandas (`in_channels=1`, `num_classes=6`, `dropout=0.3`, `batch_size=8`). El modulo de laboratorio es un MLP con capas ocultas `[128, 64, 32]`, `input_dim=8` y `num_classes=2`. El chatbot usa embeddings de dimension 128, `hidden_dim=256`, 2 capas de BiLSTM y atencion, con `vocab_size=8671`.

No se documenta el volumen de datos de entrenamiento, la composicion de los datasets, ni si hubo ajuste fino con RLHF/DPO (no aplica, al no ser modelos generativos). Los metadatos de los checkpoints indican entrenamientos muy cortos (3 epocas en cuatro de los cinco modelos) y metricas de accuracy de 1.0 en `sound_model_cls_seg_trained.pth` y `chatbot_model_cls_seg_trained.pth`, ademas de `disease2idx` con una unica clase (`{'general': 0}`), lo que apunta a un clasificador de texto practicamente degenerado o a una evaluacion sobre el mismo conjunto de entrenamiento. No hay innovaciones tecnicas destacables: son arquitecturas clasicas de docencia.

## Capacidades

- Segmentacion de lesiones cutaneas en imagenes dermatologicas (U-Net, salida de mascara binaria).
- Clasificacion de imagenes cutaneas en 8 clases junto con la segmentacion en la variante combinada.
- Clasificacion de sonidos respiratorios en 6 clases a partir de mel-espectrogramas de 64 bandas.
- Clasificacion binaria a partir de 8 variables analiticas tabulares.
- Clasificacion de texto de sintomas hacia una condicion (BiLSTM con atencion); en la practica el mapa `disease2idx` solo contiene la clase `general`.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No es un modelo generativo: no produce texto libre, solo etiquetas.
- Capacidades multilingues: no disponibles; el vocabulario documentado es en ingles.
- No dispone de modo thinking, vision generativa ni procesamiento de audio en tiempo real mas alla del clasificador.

## Casos de uso

- Docencia y practicas de vision artificial medica: el checkpoint `skin_model_full.pth` (U-Net, `val_iou=0.794`) sirve como ejemplo funcional de segmentacion de lesiones para asignaturas de deep learning, cargandolo con `torch.load` y construyendo la clase del repositorio GitHub.
- Prototipo de triaje dermatologico en entornos controlados de investigacion: la variante combinada clasifica en 8 clases y segmenta a la vez, lo que permite experimentar con pipelines multi-tarea, siempre con la advertencia de que no es un dispositivo medico.
- Analisis de auscultacion en proyectos de bioingenieria: la CNN sobre mel-espectrogramas de 64 bandas clasifica sonidos respiratorios en 6 categorias y encaja en cuadernos de investigacion sobre preprocesado de audio clinico.
- Experimentos con datos tabulares clinicos: el MLP 128-64-32 sobre 8 variables y 2 clases es un baseline minimo para comparar tecnicas de clasificacion tabular en asignaturas de estadistica aplicada.
- Construccion de un chatbot de sintomas como ejercicio academico: el modelo BiLSTM con atencion y vocabulario de 8.671 tokens permite ilustrar el pipeline completo (tokenizacion, embeddings, atencion, clasificacion) aunque su utilidad real sea nula al tener una sola clase de salida.
- Integracion en una aplicacion web de demostracion: el repositorio GitHub incluye backend y frontend, de modo que los checkpoints se pueden desplegar en local para presentaciones de fin de grado o ferias universitarias.
- Reproducibilidad de resultados academicos: los `SHA256SUMS.txt` y los metadatos (`epoch`, `loss`, `history`) permiten verificar la procedencia de los pesos en revisiones por pares de trabajos estudiantiles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las unicas metricas son las almacenadas dentro de los propios checkpoints y corresponden a los conjuntos de validacion del autor, sin comparacion con lineas base externas:

| Checkpoint | Epocas | Metrica reportada |
|---|---|---|
| `skin_model_full.pth` | 12 | `val_iou=0.794`, `val_dice=0.881`, `val_loss=0.154` |
| `skin_model_cls_seg_trained.pth` | 3 | `iou=0.651`, `dice=0.783`, `accuracy=0.097`, `loss=0.895` |
| `sound_model_cls_seg_trained.pth` | 3 | `accuracy=1.0`, `loss=0.0051` |
| `chatbot_model_cls_seg_trained.pth` | 3 | `accuracy=1.0`, `loss=0.120` |
| `lab_model_cls_seg_trained.pth` | 3 | `accuracy=0.713`, `loss=-8.205` |

La `accuracy` de 0.097 en el modelo cutaneo combinado con 8 clases es sospechosamente baja (por debajo del azar), y las `accuracy` de 1.0 en sonido y chatbot, junto con un `loss` negativo en el modelo de laboratorio, indican problemas de evaluacion o de calculo de la metrica. No deben interpretarse como rendimiento real.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todos los casos. El checkpoint mas grande son 97,3 MB en disco en fp32, lo que se traduce en unas decenas de MB de memoria de activaciones para un lote pequeno.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090); tambien funciona en CPU sin problema apreciable de latencia para uso interactivo.
- Cabe en cualquier GPU consumer e incluso en dispositivos de borde (Raspberry Pi, Jetson Nano) para los modulos de laboratorio y chatbot.
- Opciones de despliegue: no hay soporte de vLLM, TGI, llama.cpp ni Ollama, ya que no son modelos de lenguaje. El despliegue se hace cargando los `.pth` con `torch.load(..., weights_only=False)` y reconstruyendo las clases desde `models/unified_models.py` del repositorio GitHub; el proyecto incluye un backend propio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (prototipos academicos multimodales con estos cinco componentes concretos). Como referencia generica de segmentacion medica, existirian alternativas como MedSAM o nnU-Net, pero no se dispone de datos de comparacion publicados por el autor ni de metricas equiparables en este repositorio.

## Limitaciones y advertencias

- No es un dispositivo medico ni constituye consejo medico; los propios autores lo declaran explicitamente en la model card.
- Licencia sin resolver: `license_name: unresolved` y `license_link` apunta al propio README. El codigo del repositorio GitHub se declara MIT, pero los pesos no tienen licencia clara, lo que impide su uso comercial sin aclaracion previa.
- Riesgo elevado de sobreajuste: entrenamiento de 3 epocas en cuatro de los cinco modelos, `accuracy=1.0` en dos de ellos y `disease2idx` con una unica clase (`general`).
- El clasificador de texto no puede distinguir condiciones: solo existe la clase `general`, por lo que su utilidad practica es nula.
- La `accuracy` de 0.097 en el modelo cutaneo combinado con 8 clases sugiere un fallo en la evaluacion o en el calculo de la metrica.
- El `loss` negativo en el checkpoint de laboratorio (`-8.205`) es inconsistente con una funcion de perdida estandar y apunta a un error de registro.
- Idiomas no documentados; el vocabulario del chatbot esta en ingles.
- No hay informacion sobre sesgos, composicion de los datasets ni procedencia de las imagenes medicas, lo que impide evaluar sesgos demograficos o de adquisicion.
- Los checkpoints son archivos pickle (`.pth`); cargarlos con `weights_only=False` ejecuta codigo arbitrario, por lo que solo deben abrirse desde fuentes de confianza.
- No apto para produccion: sin benchmarks externos, sin validacion clinica, sin versionado semantico y con 0 descargas y 0 likes en el momento de la consulta.
- Cualquier uso en investigacion debe acompanarse de una revision etica y de la advertencia de que se trata de un prototipo estudiantil.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/triq0/medical-ai-assistant
- Repositorio GitHub del proyecto: https://github.com/tarekmhmd/Medical-AI-Assistant-Platform
- Enlace de licencia declarado por el autor: https://huggingface.co/triq0/medical-ai-assistant/blob/main/README.md#licensing
- Archivo de sumas de verificacion: `SHA256SUMS.txt` en el repositorio de Hugging Face
- Codigo de los modelos: `models/unified_models.py` y `backend/models/` en el repositorio GitHub
- Guia de inicio rapido: `QUICK_START.md` en el repositorio GitHub
