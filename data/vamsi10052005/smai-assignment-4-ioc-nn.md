# vamsi10052005/smai-assignment-4-ioc-nn

## Resumen

`smai-assignment-4-ioc-nn` es un clasificador de imágenes de dos capas publicado por el usuario `vamsi10052005` en Hugging Face, aparentemente como entrega de la asignatura SMAI (Statistical Methods in Artificial Intelligence). El modelo resuelve una tarea muy acotada: clasificación de imágenes de CIFAR-10 en 10 clases a partir de entradas aplanadas de 3072 valores (32×32×3). No es un modelo generativo ni un modelo de lenguaje, sino una red neuronal densa de pequeña escala entrenada desde cero sobre un dataset académico.

La arquitectura es un perceptrón multicapa con una capa oculta de 64 unidades y activación ELU, seguida de una capa de salida de 10 logits. El total de parámetros es 197.322, lo que lo sitúa en el rango de juguete experimental. La peculiaridad técnica declarada es que los pesos de la segunda capa se restringieron a valores no negativos durante el entrenamiento (una forma de "IOC-NN", presumiblemente *Input-Output Constrained Neural Network*), aunque en inferencia se cargan tal cual.

Su relevancia es limitada fuera del contexto docente: no hay model card con métricas, no se declara licencia, no hay idiomas ni pipeline definidos y el repositorio pesa 0,0 GB. Se incluye aquí como ficha de referencia para quien encuentre el checkpoint y necesite saber exactamente qué es y cómo usarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) denso: 3072 → 64 (ELU) → 10 logits |
| Parametros totales | 197.322 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija de 3072 valores) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (clasificación de imágenes) |
| Licencia | no disponible |
| Formato de pesos | checkpoint PyTorch (`.pt`); arquitectura en `model.py`; metadatos en `config.json` |

## Arquitectura y entrenamiento

La red es un MLP de dos capas completamente conectadas. La entrada es una imagen CIFAR-10 aplanada (3072 dimensiones), normalizada a [0,1] y estandarizada con las estadísticas del conjunto de entrenamiento original. La capa oculta tiene 64 neuronas con activación ELU y la capa de salida proyecta a 10 logits, uno por clase. Con 3072×64 + 64 pesos y 64×10 + 10 sesgos se llega a los 197.322 parámetros declarados.

El entrenamiento se realizó sobre CIFAR-10 con etiquetas limpias ("clean labels"), y el checkpoint publicado `ioc_nn_clean.pt` corresponde a la última época. La innovación declarada es la restricción de no negatividad aplicada a los pesos de la segunda capa durante el entrenamiento; según la model card, esa restricción es solo de entrenamiento y en inferencia se cargan los pesos aprendidos tal como quedaron guardados. No se especifican número de épocas, optimizador, tasa de aprendizaje, tamaño de batch ni composición exacta del dataset más allá de CIFAR-10. Tampoco se documenta uso de RLHF, DPO ni técnicas de regularización.

## Capacidades

- Clasificación de imágenes de CIFAR-10 en 10 clases (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Entrada exclusivamente aplanada de 3072 valores; no acepta imágenes sin preprocesar ni tensores con forma de imagen.
- Preprocesamiento obligatorio: escalado a [0,1] y estandarización con las estadísticas del conjunto de entrenamiento original.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión general, audio ni generación de texto.
- No es un modelo generativo: solo produce logits de clasificación.

## Casos de uso

- Docencia y prácticas de aprendizaje automático: sirve como ejemplo mínimo de MLP entrenado desde cero sobre CIFAR-10, útil para comparar curvas de aprendizaje, inicializaciones y restricciones de pesos en un aula.
- Reproducción de experimentos académicos: al incluir `model.py` y `config.json`, permite replicar el pipeline de preprocesamiento y verificar el efecto de la restricción de no negatividad en la segunda capa.
- Baseline de referencia para CIFAR-10: con 197.322 parámetros es un punto de partida barato para comparar contra CNNs pequeñas o modelos más grandes en términos de precisión por parámetro.
- Pruebas de integración de pipelines de inferencia: su tamaño reducido permite validar end-to-end el flujo de carga de checkpoints PyTorch, preprocesamiento y postprocesado en entornos de CI sin coste de GPU.
- Demostraciones educativas de preprocesamiento: ejemplifica por qué es crítico aplanar, escalar y estandarizar con las estadísticas correctas antes de alimentar una red densa.
- Experimentos de robustez y sesgo: al ser un modelo pequeño y entrenado con etiquetas limpias, es adecuado para estudiar cómo se degrada la precisión ante ruido, corrupción de imagen o desbalance de clases en un entorno controlado.
- Prototipado rápido en CPU: la inferencia de un MLP de 197.322 parámetros es prácticamente instantánea en CPU, lo que lo hace útil para pruebas de concepto sin infraestructura de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye precisión en test, matriz de confusión ni comparación con otras arquitecturas sobre CIFAR-10.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en FP32 (197.322 parámetros × 4 bytes ≈ 0,79 MB de pesos, más activaciones y overhead del runtime).
- GPU recomendadas: ninguna en particular; cualquier GPU con soporte CUDA es más que suficiente, e incluso una GPU integrada o CPU moderna basta.
- Cabe en cualquier GPU de consumo, incluidas GTX 1050, RTX 3050, RTX 4090, etc. No requiere GPU dedicada.
- Opciones de despliegue: PyTorch nativo (carga directa de `ioc_nn_clean.pt` con la arquitectura de `model.py`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un MLP de clasificación.
- Latencia y throughput estimados: no disponibles de forma oficial; por el tamaño del modelo, la inferencia por lote debería ser del orden de microsegundos a milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smai-assignment-4-ioc-nn | 197.322 | 3072 valores aplanados | Clasificación CIFAR-10 | no disponible | Hugging Face (repo de 0,0 GB) |
| LeNet-5 (referencia clásica) | ~60.000 | 32×32×1 | Clasificación de dígitos / imágenes | pública (arquitectura) | Implementaciones múltiples |
| ResNet-18 (adaptado a CIFAR-10) | ~11,2 M | 32×32×3 | Clasificación CIFAR-10 | BSD-3 / MIT según implementación | torchvision, timm |
| ViT-small (CIFAR-10 fine-tuning) | ~22 M | 32×32×3 con parches | Clasificación CIFAR-10 | según checkpoint | Hugging Face, timm |

La comparación es orientativa: no hay métricas publicadas para el modelo de esta ficha, por lo que no puede establecerse una comparación de rendimiento rigurosa. Frente a LeNet-5, el modelo aquí descrito tiene más parámetros pero prescinde de convoluciones, lo que en CIFAR-10 suele traducirse en menor precisión. Frente a ResNet-18 o ViT-small, la diferencia de capacidad es de uno a dos órdenes de magnitud.

## Limitaciones y advertencias

- No se declara licencia: el uso comercial es jurídicamente incierto y no recomendable sin aclaración del autor.
- No hay métricas publicadas de precisión, por lo que no puede evaluarse su calidad real en CIFAR-10.
- Modelo de juguete académico: no está pensado para producción ni para tareas fuera de CIFAR-10.
- Entrada rígida: exige aplanado, escalado a [0,1] y estandarización con las estadísticas del conjunto de entrenamiento original; cualquier desviación degrada la salida.
- No procesa imágenes de otras resoluciones, dominios ni canales distintos de RGB 32×32.
- Riesgo de sobreajuste y de sesgos heredados de CIFAR-10 (clases desbalanceadas, sesgos de representación en las imágenes).
- Sin información sobre semilla, hiperparámetros ni reproducibilidad; el checkpoint corresponde a la última época, no necesariamente a la mejor.
- La restricción de no negatividad en la segunda capa puede limitar la expresividad del modelo; no se documenta su impacto en precisión.
- No apto para tool calling, agentes, texto, audio ni visión general.
- Fecha de creación declarada en 2026-11-02, lo que puede indicar metadatos inconsistentes; conviene verificar el repositorio antes de confiar en él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vamsi10052005/smai-assignment-4-ioc-nn
- Repositorio de CIFAR-10 (referencia del dataset): https://www.cs.toronto.edu/~kriz/cifar.html
- Documentación de PyTorch para carga de checkpoints: https://pytorch.org/docs/stable/generated/torch.load.html
- No se han encontrado papers, blogs, repos ni demos adicionales en la información proporcionada.
