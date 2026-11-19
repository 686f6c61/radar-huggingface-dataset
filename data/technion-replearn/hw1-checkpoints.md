# technion-replearn/hw1-checkpoints

## Resumen

`technion-replearn/hw1-checkpoints` es una colección de checkpoints de encoders ResNet-18 entrenados sobre CIFAR-10 para el curso *Representation Learning (00480108)* del Technion. No es un modelo generativo ni un LLM: es material docente que agrupa siete pesos entrenados con distintos paradigmas de aprendizaje de representaciones (supervisado con distintas fracciones de etiquetas, autoencoder y SimCLR con tres temperaturas). Su propósito es que el alumnado implemente cada método y evalúe sus resultados cargando estos checkpoints entrenados durante más épocas.

La arquitectura es una ResNet-18 adaptada a entradas de 32×32 (primera convolución 3×3 con stride 1, sin max-pooling, `fc` sustituido por identidad), de modo que el encoder produce un vector h ∈ R^512. Todos los archivos comparten exactamente la misma arquitectura de encoder, lo que permite comparar métodos de forma controlada mediante linear probing sobre características congeladas.

El interés práctico es acotado pero claro: sirve como referencia reproducible para comparar aprendizaje supervisado, autoencoders y aprendizaje contrastivo en un dataset pequeño y bien conocido, y como base para experimentos de representación con recursos muy modestos (el repositorio completo ocupa 0,3 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 adaptada a 32×32 (conv1 3×3 stride 1, sin max-pooling, `fc` = identidad); salida h ∈ R^512 |
| Parametros totales | no disponible (ResNet-18 estándar ronda 11,2 M, pero el autor no lo declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en PyTorch `.pt`; no se documentan cuantizaciones) |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` (state dicts con claves `encoder` y `head`/`decoder`, más `epochs` y `loss_history`) |

## Arquitectura y entrenamiento

El encoder es una ResNet-18 modificada para CIFAR-10: la primera convolución pasa a 3×3 con stride 1 y padding 1, se elimina el max-pooling inicial y la capa fully connected se reemplaza por identidad. Las entradas se normalizan con media (0,4914, 0,4822, 0,4465) y desviación típica (0,2470, 0,2435, 0,2616). El repositorio contiene siete checkpoints:

- **Supervisado**: encoder + `Linear(512, 10)`, entropía cruzada, random crop (padding 4) y flip horizontal, SGD con Nesterov (momentum 0,9, weight decay 5e-4) y one-cycle LR (máx. 0,1). Tres variantes con 100 % (50 épocas), 10 % (150 épocas) y 1 % (300 épocas) de las etiquetas, con subconjuntos estratificados (semilla 0).
- **Autoencoder**: encoder + decoder de convoluciones transpuestas (`Linear(512, 4096)` → 256×4×4 → 128×8×8 → 64×16×16 → 3×32×32 con sigmoid), pérdida MSE, flip horizontal, Adam (lr 1e-3, schedule coseno), 50 épocas.
- **SimCLR**: cabeza de proyección `Linear(512, 512) → ReLU → Linear(512, 128)`, pérdida InfoNCE sobre las 2B vistas de un batch (B = 256), random resized crop (escala 0,2–1) + flip, color jitter (0,4, 0,4, 0,4, 0,1) con p = 0,8, escala de grises aleatoria con p = 0,2, SGD con one-cycle LR (máx. 0,12), 200 épocas. Tres temperaturas: τ = 0,1, 0,5 y 1,0.

No se documentan datos de preentrenamiento externos ni fases de RLHF/DPO (no aplican). El único dataset es CIFAR-10.

## Capacidades

- Extracción de características visuales de imágenes de 32×32 (salida de 512 dimensiones) para clasificación mediante linear probing.
- Clasificación directa de CIFAR-10 en las diez clases del dataset con los checkpoints supervisados.
- Reconstrucción de imágenes de entrada con el checkpoint de autoencoder (PSNR de reconstrucción en test de 25,6 dB).
- Aprendizaje de representaciones sin etiquetas evaluable mediante regresión logística sobre características congeladas (SimCLR).
- Comparación controlada de paradigmas de representación (supervisado, autoencoder, contrastivo) bajo una arquitectura idéntica.
- No soporta tool calling, agentes, razonamiento multi-paso, generación de texto, visión generalista ni capacidades multilingües.

## Casos de uso

- **Docencia y prácticas de aprendizaje de representaciones**: el alumnado implementa cada método y evalúa contra estos checkpoints de referencia; la arquitectura idéntica elimina la variabilidad y permite comparar linear probe de forma justa.
- **Referencia de linear probing en CIFAR-10**: usar las características congeladas del encoder SimCLR τ=0,5 y entrenar una regresión logística para reproducir la precisión publicada (82,2 % con el 100 % de etiquetas).
- **Estudio del efecto de la temperatura en InfoNCE**: los tres checkpoints SimCLR (τ = 0,1, 0,5, 1,0) permiten analizar empíricamente cómo afecta la temperatura a la calidad de las representaciones con muy pocas etiquetas.
- **Comparación supervisado frente a auto-supervisado con pocas etiquetas**: comparar el checkpoint supervisado al 1 % (43,5 %) con SimCLR τ=0,5 (80,3 %) ilustra la ventaja del preentrenamiento contrastivo en régimen de baja supervisión.
- **Prototipado rápido de clasificadores de imágenes pequeñas**: con 0,3 GB de pesos y un encoder ResNet-18, se puede ejecutar en CPU o en una GPU de consumo para experimentos de transferencia a otros datasets de 32×32.
- **Base para experimentos de destilación o fine-tuning**: partir del encoder SimCLR preentrenado y ajustar con pocas etiquetas en lugar de entrenar desde cero, dado su buen rendimiento en el régimen del 1 % (80,3 %).
- **Evaluación de decodificadores de reconstrucción**: el checkpoint de autoencoder sirve para estudiar la calidad de reconstrucción (PSNR 25,6 dB) y comparar arquitecturas de decoder alternativas.

## Benchmarks y rendimiento

Resultados en el test de CIFAR-10 publicados en la model card. Para los checkpoints supervisados se reporta la precisión del propio clasificador entrenado; para el resto, linear probe (regresión logística sobre características congeladas) con el 100 %, 10 % y 1 % de las etiquetas de entrenamiento.

| Checkpoint | 100 % | 10 % | 1 % |
|---|---|---|---|
| Supervisado (entrenado con esa fracción) | 94,0 | 80,7 | 43,5 |
| Autoencoder (PSNR de reconstrucción en test: 25,6 dB) | 40,6 | 39,1 | 33,4 |
| SimCLR τ=0,1, salida del encoder h | 78,1 | 77,8 | 75,0 |
| SimCLR τ=0,5, salida del encoder h | **82,2** | **81,9** | **80,3** |
| SimCLR τ=0,5, salida de la cabeza de proyección z | 80,5 | 80,5 | 78,5 |
| SimCLR τ=1,0, salida del encoder h | 79,5 | 79,5 | 78,3 |

No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) porque no aplican a este tipo de modelo.

## Requisitos de hardware

- **VRAM estimada para inferencia**: muy baja. El encoder ResNet-18 adaptado ronda los 11 M de parámetros; en fp32 ocupa aproximadamente 45 MB y en fp16 unos 22 MB. El repositorio completo pesa 0,3 GB.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia; para entrenamiento de linear probe o fine-tuning, una RTX 3060/4060 o superior es más que suficiente. A100/H100 no son necesarias.
- **GPU de consumo**: cabe holgadamente en cualquier GPU de consumo moderna (GTX 1650, RTX 3050, RTX 4090) e incluso en CPU para inferencia por lotes pequeños.
- **Opciones de despliegue**: PyTorch nativo (carga con `torch.load` y `hf_hub_download`); exportación a TorchScript u ONNX posible, aunque no documentada por el autor. No aplican vLLM, llama.cpp, Ollama ni TGI por no ser un modelo de lenguaje.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento en CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| technion-replearn/hw1-checkpoints (este) | no disponible (ResNet-18) | Imágenes 32×32 | Linear probe SimCLR τ=0,5: 82,2 % (100 % etiquetas) | no disponible | Hugging Face |
| ResNet-18 supervisado estándar (torchvision) | ~11,2 M | Imágenes 224×224 (adaptable) | ~94–95 % con entrenamiento completo | BSD-3-Clause | torchvision |
| SimCLR oficial (paper, ResNet-50) | ~23,5 M (backbone) | Imágenes 224×224 | Resultados en ImageNet, no directamente comparables en CIFAR-10 | no disponible en este contexto | Repos oficiales de los autores |

La comparación con modelos de lenguaje no aplica. Frente a un ResNet-18 supervisado de torchvision, este repositorio ofrece checkpoints preentrenados específicamente para CIFAR-10 con protocolos reproducibles y comparables entre paradigmas; frente a SimCLR con ResNet-50, la escala es mucho menor y el dataset distinto, por lo que los números no son directamente trasladables.

## Limitaciones y advertencias

- **Ámbito muy restringido**: solo funciona con imágenes de 32×32 similares a CIFAR-10; no es un modelo de propósito general ni un extractor de características para imágenes naturales de alta resolución.
- **Licencia no especificada**: al no declararse licencia, no hay garantía de uso comercial; conviene contactar con el autor antes de cualquier uso fuera del ámbito docente.
- **Sin model card de sesgos**: no se documentan sesgos, riesgos de alucinación (no aplica) ni limitaciones idiomáticas (no aplica). CIFAR-10 contiene categorías limitadas y desbalanceadas, lo que puede sesgar las representaciones.
- **Checkpoints docentes**: los pesos están pensados para evaluación en el contexto del curso; no se garantiza su idoneidad para producción ni su mantenimiento.
- **Formato `.pt` con `weights_only=False`**: la carga requiere deserialización completa de pickle, lo que implica riesgos de seguridad si el archivo no procede de una fuente fiable.
- **Rendimiento modesto del autoencoder**: con un 40,6 % de linear probe al 100 % de etiquetas, está muy por debajo de SimCLR y del supervisado; no debe usarse como extractor de características principal.
- **Sin datos de latencia ni throughput**: no se han publicado mediciones de rendimiento en inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/technion-replearn/hw1-checkpoints
- Curso *Representation Learning (00480108)*, Technion: no disponible en la información proporcionada
- Paper de SimCLR (referencia del método): no disponible en la información proporcionada
- Paper de ResNet (referencia de la arquitectura): no disponible en la información proporcionada
- Dataset CIFAR-10: https://www.cs.toronto.edu/~kriz/cifar.html
