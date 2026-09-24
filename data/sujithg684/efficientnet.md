# Sujithg684/efficientnet

## Resumen

El modelo identificado en HuggingFace como `Sujithg684/efficientnet` es un clasificador de imágenes binario orientado a la detección de deepfakes. Se construye sobre un backbone EfficientNet-B0 preentrenado en ImageNet, al que se le sustituye la capa de clasificación final por una capa `Linear(in_features, 2)` que distingue entre imágenes reales (clase 0) y manipuladas (clase 1). El entrenamiento se ha realizado sobre el conjunto FaceForensics++ (FF++) en su configuración C23, que agrupa vídeos reales y vídeos manipulados con cuatro técnicas: DeepFake, FaceSwap, Face2Face y NeuralTextures. El problema que aborda es la detección automatizada de manipulación facial, un área con creciente interés en investigación académica.

La arquitectura es una red neuronal convolucional (CNN) de la familia EfficientNet, que emplea bloques MBConv con mecanismos de atención de tipo squeeze-and-excitation y escalado compuesto del ancho, la profundidad y la resolución. La entrada esperada es de 224 × 224 píxeles en RGB. El modelo se distribuye como un `state_dict` de PyTorch (`.pth`) y está pensado explícitamente, según su model card, para uso académico y de investigación, no para aplicaciones forenses o de vigilancia en producción.

Conviene señalar dos aspectos de contexto. Por un lado, la ficha de HuggingFace registra el repositorio como `Sujithg684/efficientnet`, con 0 descargas y 0 likes y un tamaño de repositorio de 0,0 GB, mientras que el código de ejemplo de la model card apunta a un repositorio distinto (`Xicor9/efficientnet-b0-ffpp-c23`). Por otro lado, existe una discrepancia entre la licencia declarada en los metadatos de HuggingFace (MIT) y la que aparece en el texto de la model card, que restringe el uso a fines exclusivamente de investigación y educación. Estos dos puntos condicionan la reproducibilidad y el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B0 (CNN con bloques MBConv y squeeze-and-excitation) |
| Parametros totales | Aproximadamente 5,3 M (tamano estandar de EfficientNet-B0; no declarado explicitamente en la model card) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vision, entrada de 224 × 224 × 3) |
| Tipos de cuantizacion | No disponible (no especificado en la model card) |
| Idiomas soportados | No aplica / no disponible (clasificacion de imagenes) |
| Licencia | MIT segun metadatos de HuggingFace; la model card indica "exclusivamente para investigacion y educacion" |
| Formato de pesos | PyTorch `state_dict` (`.pth`) |

## Arquitectura y entrenamiento

El modelo parte de EfficientNet-B0, un backbone convolucional preentrenado en ImageNet. EfficientNet introduce el escalado compuesto, que balancea de forma conjunta la profundidad, el ancho y la resolucion de la red mediante un coeficiente fijo. Sus bloques principales son de tipo MBConv (Mobile Inverted Bottleneck) con conexiones residuales y modulos de squeeze-and-excitation. Sobre este backbone, la capa clasificadora original se sustituye por una `Linear(in_features, 2)` para la tarea binaria real/falso. La entrada se normaliza a imagenes RGB de 224 × 224.

El entrenamiento se realizo sobre FaceForensics++ C23. Los videos se convirtieron en fotogramas individuales y se redimensionaron a 224 × 224 antes del entrenamiento. La configuracion reportada es: funcion de perdida CrossEntropyLoss, optimizador AdamW con lr = 3e-4 y weight_decay = 1e-4, planificador CosineAnnealingLR con T_max = 10, precision mixta (AMP) activada y 8 epocas. El hardware empleado fue una GPU Tesla T4 en Google Colab. No se mencionan tecnicas de RLHF, DPO ni decodificacion especulativa, ya que no son aplicables a un clasificador de imagenes.

## Capacidades

- Clasificacion binaria de imagenes faciales en dos categorias: real (0) y falsa (1).
- Deteccion de manipulaciones generadas con DeepFake, FaceSwap, Face2Face y NeuralTextures (las incluidas en FF++ C23).
- Inferencia por fotograma individual con salida de probabilidad de falsedad mediante softmax.
- Agregacion a nivel de video calculando la probabilidad media entre fotogramas (reportada en la model card como metrica de video).
- Entrada de imagen RGB a 224 × 224; no admite otras modalidades ni resoluciones sin reescalado.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un clasificador de vision puro.
- No dispone de modo "thinking", vision multimodal generativa, audio ni generacion de texto.

## Casos de uso

- Investigacion academica en deteccion de deepfakes: el modelo sirve como punto de partida o baseline reproducible sobre FF++ C23 para comparar nuevas tecnicas de deteccion en trabajos de fin de master o tesis.
- Benchmarking de detectores: dado que reporta metricas de fotograma y de video (AUC, AP, accuracy, F1), puede usarse como referencia cuantitativa frente a otros clasificadores evaluados sobre el mismo conjunto.
- Experimentacion con tecnicas de manipulacion facial: permite probar la sensibilidad del detector ante cada uno de los cuatro metodos incluidos en FF++ (DeepFake, FaceSwap, Face2Face, NeuralTextures).
- Generacion de prototipos de analisis forense de imagenes en un entorno controlado de laboratorio, siempre que se respete la restriccion de uso exclusivamente investigador indicada por el autor.
- Estudio de sesgos y robustez: al ser un clasificador entrenado sobre un unico dataset, resulta util para analizar como se degrada la deteccion ante cambios de compresion, iluminacion o identidad facial fuera de la distribucion de FF++.
- Docencia en vision por computador: el codigo de ejemplo de la model card (carga del `state_dict`, reconstruccion de la arquitectura con torchvision y calculo de probabilidad) es didactico para ilustrar el flujo de fine-tuning y despliegue de un clasificador.
- Tuberia de filtrado previo en un pipeline de investigacion: dado que el modelo procesa fotogramas a 224 × 224, encaja como etapa rapida de cribado en experimentos que despues aplican analisis mas costosos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card.

Metricas a nivel de fotograma:

| Metrica | Valor |
|---|---|
| AUC | 0,933 |
| AP | 0,898 |
| Accuracy | 0,852 |
| F1-Score | 0,843 |

Metricas a nivel de video (probabilidad media entre fotogramas):

| Metrica | Valor |
|---|---|
| AUC | 0,94+ |
| Accuracy | 0,88+ |

No se proporcionan en la informacion disponible resultados por tipo de manipulacion (DeepFake, FaceSwap, Face2Face, NeuralTextures), ni comparativas numericas con otros modelos publicados sobre FF++ C23.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita en la model card. Al tratarse de EfficientNet-B0 (en torno a 5,3 M de parametros, con pesos en precision simple del orden de decenas de megabytes), el modelo es muy ligero y cabe holgadamente en GPUs de consumo.
- GPU empleada en entrenamiento: una Tesla T4 (Google Colab).
- GPU recomendadas para inferencia: cualquier GPU moderna con al menos unos pocos GB de VRAM; tambien funciona en CPU, dado el reducido tamano del modelo.
- Compatibilidad con GPU de consumo: si, cabe en GPUs de gama de entrada y media (por ejemplo, series GTX/RTX con pocos GB de VRAM). No se especifican modelos concretos en la informacion disponible.
- Opciones de despliegue: al ser un `state_dict` de PyTorch, el despliegue natural es a traves de torchvision/PyTorch. No se documentan exportaciones a otros formatos (ONNX, TensorRT, GGUF) ni integraciones con servidores de inferencia como vLLM, llama.cpp, Ollama o TGI, que ademas no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. No se aportan mediciones de latencia ni de imagenes por segundo.

## Comparativa con modelos similares

La model card no incluye una comparativa con otros modelos. Se ofrece una comparacion de contexto con alternativas habituales en deteccion de deepfakes, senalando que los datos de rendimiento de las alternativas no proceden de la informacion proporcionada.

| Modelo | Arquitectura | Dataset de referencia | Parametros | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (EfficientNet-B0 FF++ C23) | CNN EfficientNet-B0 | FaceForensics++ C23 | Aprox. 5,3 M | MIT en metadatos / solo investigacion en la card | Metricas de la model card: AUC fotograma 0,933 |
| XceptionNet (baseline habitual en FF++) | CNN Xception | FaceForensics++ | Aprox. 20,8 M | Segun implementacion original | Baseline comun en la literatura de deteccion de deepfakes; sin datos numericos en esta ficha |
| MesoNet | CNN ligera especifica para deepfakes | Distintos conjuntos de caras | Aprox. decenas de miles | Segun autores | Orientada a deteccion rapida; sin datos numericos en esta ficha |
| EfficientNet-B4 (variante mayor) | CNN EfficientNet-B4 | Diversos | Aprox. 19 M | Segun implementacion | Mayor capacidad que B0 a costa de mas computo; sin datos numericos en esta ficha |

No se dispone de datos suficientes en la informacion proporcionada para una comparacion cuantitativa fiable contra estos modelos.

## Limitaciones y advertencias

- Disc
