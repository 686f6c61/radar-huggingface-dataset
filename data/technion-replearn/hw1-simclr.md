# technion-replearn/hw1-simclr

## Resumen
Los checkpoints `hw1-simclr` son un conjunto de tres modelos ResNet-18 entrenados con SimCLR (aprendizaje autosupervisado contrastivo) sobre las 50.000 imagenes de entrenamiento de CIFAR-10, sin usar etiquetas. Los publica el usuario `technion-replearn` como material docente para la asignatura *Representation Learning (00480108)* del Technion, concretamente para la pregunta Q3.2 de la tarea 1. El objetivo no es ofrecer un modelo listo para producción, sino proporcionar encoders preentrenados para que el alumnado evalúe representaciones mediante linear probing sin tener que reproducir el coste de entrenamiento de SimCLR.

Cada checkpoint se diferencia únicamente en la temperatura τ del loss InfoNCE (0,1, 0,5 y 1,0), manteniendo 200 epocas de entrenamiento. El encoder es un ResNet-18 adaptado a entradas de 32×32 píxeles (primera convolución 3×3 con stride 1, sin max-pooling y `fc` sustituido por identidad), con salida de 512 dimensiones, más una cabeza de proyección de dos capas que produce un vector de 128 dimensiones.

La relevancia es acotada y de carácter didáctico: el repositorio ocupa 0,1 GB, no tiene descargas ni likes, no declara licencia ni idiomas, y no incluye pipeline de inferencia. Es útil como referencia reproducible sobre el efecto de la temperatura en la calidad de las representaciones contrastivas, no como modelo de lenguaje ni como componente de sistemas generativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 adaptado a 32×32 (conv1 3×3, stride 1, sin max-pooling, `fc` = Identity) + cabeza de proyección Linear(512,512)→ReLU→Linear(512,128) |
| Parametros totales | no disponible (ResNet-18 estándar son ~11,2 M; la cifra exacta de esta variante no se declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 32×32×3) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en PyTorch `.pt`; no se mencionan variantes GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` (state dicts de `encoder` y `head`, con `tau`, `epochs` y `loss_history`) |

## Arquitectura y entrenamiento
El encoder es una CNN ResNet-18 modificada para resoluciones pequeñas: la primera convolución pasa a ser 3×3 con stride 1, se elimina el max-pooling inicial y la capa fully connected se reemplaza por identidad, de modo que la salida es un vector h ∈ R^512. Sobre h se aplica una cabeza de proyección g compuesta por Linear(512,512) → ReLU → Linear(512,128), que produce z = g(h). El entrenamiento sigue el esquema SimCLR: para cada batch de B = 256 imágenes se generan 2B vistas aumentadas y se optimiza una pérdida InfoNCE con la temperatura τ especificada.

Los datos son las 50.000 imágenes de entrenamiento de CIFAR-10 sin etiquetas. Las aumentaciones son random resized crop con escala 0,2–1 y flip horizontal, color jitter (0,4, 0,4, 0,4, 0,1) con probabilidad 0,8 y escala de grises aleatoria con probabilidad 0,2. La normalización usa media (0,4914; 0,4822; 0,4465) y desviación típica (0,2470; 0,2435; 0,2616). El optimizador es SGD con momento de Nesterov 0,9, weight decay 5e-4 y un ciclo one-cycle con learning rate máximo 0,12, durante 200 epocas. No se menciona RLHF, DPO ni ninguna innovación de decodificación o atención; es un entrenamiento contrastivo puro de visión por computador.

## Capacidades
- Extracción de representaciones visuales de imágenes CIFAR-10 (32×32×3) en un espacio de 512 dimensiones.
- Evaluación mediante linear probing: regresión logística sobre características congeladas, con distintos porcentajes de etiquetas.
- Producción de embeddings tanto desde la salida del encoder (h) como desde la salida de la cabeza de proyección (z).
- Tres variantes de temperatura (τ = 0,1; 0,5; 1,0) que permiten comparar el efecto de este hiperparámetro en la calidad de la representación.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, texto, audio ni modo thinking.
- Capacidades multilingües: no aplica, el modelo no procesa lenguaje.

## Casos de uso
- Docencia y evaluación de aprendizaje autosupervisado: cargar los checkpoints con `hf_hub_download` y ejecutar linear probing sobre CIFAR-10 para comparar la accuracy de h frente a z en cada τ, tal como plantea la tarea Q3.2.
- Estudio del efecto de la temperatura en InfoNCE: usar los tres checkpoints como réplica controlada (mismo encoder, mismos datos, mismas aumentaciones, 200 epocas) para aislar el impacto de τ en la accuracy con 100 %, 10 % y 1 % de etiquetas.
- Baseline de representación congelada en experimentos de clasificación de imágenes de baja resolución: servir como extractor fijo antes de entrenar un clasificador lineal o una cabeza ligera sobre otros datasets de 32×32.
- Reproducción de resultados docentes: el repositorio incluye `train_simclr_checkpoints.py`, lo que permite verificar el pipeline de entrenamiento y la `loss_history` registrada por época.
- Comparación de protocolos de evaluación de representaciones: medir la brecha entre h y z para ilustrar por qué las características del encoder suelen superar a las de la cabeza de proyección en tareas downstream.
- Ejercicios de selección de hiperparámetros: analizar curvas de pérdida y accuracy para discutir compromisos entre temperatura, separación de clusters y transferibilidad.
- Prototipado académico de clasificación semi-supervisada: usar las representaciones con el 1 % de etiquetas (75,0–80,3 % de accuracy según τ) como punto de partida para métodos de few-shot o pseudo-etiquetado.

## Benchmarks y rendimiento
Linear-probe accuracy sobre el test de CIFAR-10 con características congeladas (100 % / 10 % / 1 % de etiquetas de entrenamiento):

| τ | Salida del encoder (h) | Salida de la cabeza (z) |
|---|---|---|
| 0,1 | 78,1 / 77,9 / 75,0 | 76,1 / 75,5 / 67,7 |
| 0,5 | 82,2 / 81,9 / 80,3 | 80,6 / 80,6 / 78,5 |
| 1,0 | 79,5 / 79,5 / 78,3 | 76,9 / 76,9 / 76,1 |

El mejor resultado se obtiene con τ = 0,5 y características h: 82,2 % con todas las etiquetas y 80,3 % con solo el 1 %. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no cubre esas tareas.

## Requisitos de hardware
- VRAM estimada para inferencia: muy baja; el repositorio completo pesa 0,1 GB y un ResNet-18 en fp32 ocupa del orden de decenas de MB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos ~1 GB de VRAM; una RTX 4090, A100 o H100 están sobredimensionadas para este modelo. También es viable en CPU para evaluación por lotes de CIFAR-10.
- Cabe en GPU consumer: sí, en todas las gamas actuales (GTX 1050, RTX 2060, RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: PyTorch nativo y `torchvision` (el código de carga de la model card usa `torch.load` y `huggingface_hub.hf_hub_download`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de visión de este tipo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares
No se dispone de datos de otros checkpoints SimCLR sobre CIFAR-10 en la información proporcionada para establecer una comparación con cifras verificables. A continuación se comparan las tres variantes internas del propio repositorio:

| Variante | Temperatura τ | Epocas | Accuracy linear probe (h, 100 %) | Licencia |
|---|---|---|---|---|
| `simclr_resnet18_cifar10_tau0.1.pt` | 0,1 | 200 | 78,1 % | no disponible |
| `simclr_resnet18_cifar10_tau0.5.pt` | 0,5 | 200 | 82,2 % | no disponible |
| `simclr_resnet18_cifar10_tau1.0.pt` | 1,0 | 200 | 79,5 % | no disponible |

Frente a alternativas externas (por ejemplo, otros métodos autosupervisados sobre CIFAR-10 como SimSiam, BYOL o MoCo), la comparación no está disponible en la información facilitada.

## Limitaciones y advertencias
- Modelo de visión, no de lenguaje: no genera texto, no razona, no ejecuta código ni soporta tool calling; cualquier uso en esos ámbitos es inadecuado.
- Entrenado exclusivamente con las 50.000 imágenes de CIFAR-10 a 32×32; la generalización a otras resoluciones, dominios o datasets no está validada.
- Sin licencia declarada: no se especifican condiciones de uso comercial, redistribución ni modificación; en producción habría que aclararlo con el autor.
- Sin pipeline declarado en Hugging Face y con 0 descargas y 0 likes: no hay evidencia de uso externo ni mantenimiento.
- Riesgo de sobreajuste al protocolo de evaluación docente: los resultados de linear probing están reportados para un único protocolo (regresión logística sobre características congeladas) y no cubren fine-tuning completo.
- La accuracy con el 1 % de etiquetas cae de forma notable en la cabeza de proyección con τ = 0,1 (67,7 %), lo que muestra sensibilidad al hiperparámetro y a la elección de la representación evaluada.
- No se documentan sesgos específicos del dataset más allá de los conocidos de CIFAR-10 (clases desbalanceadas en el mundo real, imágenes de baja resolución y posible ruido de etiquetado), ni análisis de robustez o calibración.
- El código de carga usa `weights_only=False` en `torch.load`, lo que implica ejecutar pickle; conviene revisar el origen de los ficheros antes de cargarlos en entornos no confiables.

## Enlaces
- Repositorio en Hugging Face: https://huggingface.co/technion-replearn/hw1-simclr
- Dataset CIFAR-10: https://www.cs.toronto.edu/~kriz/cifar.html
- Paper original de SimCLR: https://arxiv.org/abs/2002.05709
- Asignatura *Representation Learning (00480108)*, Technion: no disponible en la información proporcionada
- Script de entrenamiento `train_simclr_checkpoints.py`: incluido en el propio repositorio de Hugging Face
