# Vanespl/ass-4-q1-cifar-ioc_nn

## Resumen

`Vanespl/ass-4-q1-cifar-ioc_nn` es un modelo neuronal de clasificación de imágenes entrenado desde cero por el usuario Vanespl para un trabajo académico (asignatura Q1). No se trata de un modelo de lenguaje ni de un transformer: es un perceptrón multicapa (MLP) de dos capas que toma imágenes de CIFAR-10 aplanadas (3072 valores de entrada) y produce 10 logits correspondientes a las clases del dataset CIFAR-10.

La arquitectura es explícitamente `3072 -> 32 -> 10`, con activación oculta ELU y salida de 10 logits. El entrenamiento utiliza las etiquetas originales de CIFAR-10 (p=0, sin ruido en las etiquetas) y los pesos se distribuyen en un fichero `model.pt` (state dict de PyTorch), junto con metadatos de preprocesado (`metadata.json`) y estadísticas de normalización (`preprocessing.npz`).

El repositorio tiene 0 GB de tamaño declarado, 0 descargas y 0 likes, y no incluye model card detallada más allá de la descripción del entrenamiento. Es relevante únicamente como artefacto educativo o de reproducción de un experimento de clasificación de imágenes, no como modelo de producción: no hay licencia declarada, ni idiomas aplicables, ni benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) denso: 3072 -> 32 -> 10, activación oculta ELU, salida de 10 logits |
| Parametros totales | 98.634 (3072×32 + 32 + 32×10 + 10) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija de 3072 valores) |
| Tipos de cuantizacion | no disponible (pesos en `model.pt`, presumiblemente float32; no se documentan cuantizaciones) |
| Idiomas soportados | no aplica (clasificación de imágenes) |
| Licencia | no disponible |
| Formato de pesos | PyTorch state dict (`model.pt`); metadatos en `metadata.json` y estadísticas en `preprocessing.npz` |

## Arquitectura y entrenamiento

El modelo es un MLP de dos capas completamente conectadas. La entrada es una imagen de CIFAR-10 aplanada a un vector de 3072 dimensiones (32×32 píxeles × 3 canales RGB). La capa oculta tiene 32 neuronas con activación ELU y la capa de salida produce 10 logits, uno por clase de CIFAR-10 (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión). El número de parámetros es de 98.634, coherente con una red de muy baja capacidad.

El entrenamiento se realizó desde cero con las etiquetas originales de CIFAR-10 (p=0, es decir, sin label noise). La model card menciona que los detalles de preprocesado están en `metadata.json` y que la media y desviación típica empleadas en la normalización se guardan en `preprocessing.npz`. No se documentan el número de épocas, el optimizador, la tasa de aprendizaje, el tamaño de batch ni si hubo data augmentation. No se indica ninguna innovación técnica (sin atención, sin convoluciones, sin regularización documentada).

## Capacidades

- Clasificación de imágenes de CIFAR-10 en 10 categorías mediante un MLP denso.
- Entrada fija de 3072 valores (imágenes RGB de 32×32 aplanadas), sin soporte para otras resoluciones.
- Salida de 10 logits; requiere aplicar softmax externamente para obtener probabilidades.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión avanzada, audio ni otras capacidades especiales.
- No es adecuado para generación de texto, código ni matemáticas.

## Casos de uso

- Docencia y prácticas de aprendizaje automático: sirve como ejemplo mínimo de MLP entrenado desde cero sobre CIFAR-10, útil para ilustrar el flujo completo (preprocesado, normalización, entrenamiento, evaluación) en un curso introductorio.
- Reproducción de experimentos académicos: al incluir `metadata.json` y `preprocessing.npz`, permite reproducir exactamente el preprocesado aplicado a las imágenes antes de la inferencia.
- Baseline de referencia para comparaciones: con 98.634 parámetros, sirve como cota inferior de rendimiento frente a CNN o transformers de visión en CIFAR-10.
- Pruebas de pipelines de inferencia en PyTorch: el state dict `model.pt` se puede cargar con `torch.load` y usar para validar integraciones de despliegue ligeras.
- Experimentos de cuantización y compresión: por su tamaño reducido, es un candidato cómodo para probar técnicas de poda o cuantización sin coste computacional.
- Demostraciones educativas de clasificación de imágenes de baja resolución: útil en talleres donde se explica la diferencia entre un MLP y una CNN en tareas de visión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB para los pesos en float32 (98.634 parámetros × 4 bytes ≈ 0,4 MB), más el overhead del runtime de PyTorch.
- GPU recomendadas: cualquier GPU con soporte CUDA; el modelo cabe holgadamente en cualquier GPU consumer, incluida una GTX 1050 o una iGPU con soporte.
- Cabe en cualquier GPU consumer y también ejecuta en CPU sin problema.
- Opciones de despliegue: PyTorch nativo (`torch.load` del state dict); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (no aplican a un MLP de visión).
- Latencia y throughput: no disponibles; por el tamaño del modelo, la latencia sería del orden de microsegundos a milisegundos por batch en GPU y de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto/Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vanespl/ass-4-q1-cifar-ioc_nn | MLP 3072->32->10 | 98.634 | Imagen 32×32×3 aplanada | no disponible | Hugging Face |
| LeNet-5 (referencia clásica CIFAR-10) | CNN | ~60.000 | Imagen 32×32×3 | dominio público (arquitectura) | Implementaciones múltiples |
| ResNet-18 (CIFAR-10) | CNN residual | ~11,2 M | Imagen 32×32×3 | MIT (implementaciones) | torchvision |
| ViT-Small (CIFAR-10) | Transformer de visión | ~22 M | Imagen 32×32×3 con parches | Apache 2.0 (implementaciones) | timm |

No se dispone de datos de rendimiento del modelo evaluado frente a estas alternativas; la comparación se limita a arquitectura, parámetros y licencia.

## Limitaciones y advertencias

- Capacidad muy limitada: un MLP de una sola capa oculta de 32 neuronas no captura patrones espaciales locales, por lo que su precisión en CIFAR-10 será previsiblemente baja frente a CNN.
- Sin licencia declarada: no se especifican términos de uso comercial ni restricciones; no debe asumirse permiso de uso en producción.
- Sin model card completa: no se documentan sesgos, composición del dataset más allá de CIFAR-10, ni métricas de evaluación.
- Riesgo de alucinación no aplica (no es un modelo generativo), pero sí de clasificaciones erróneas sistemáticas por la baja capacidad de la red.
- Entrada rígida: solo acepta imágenes de 32×32×3 aplanadas y normalizadas con la media y desviación de `preprocessing.npz`; cualquier otra resolución o normalización producirá resultados inválidos.
- Sin soporte multilingüe ni de texto: no es un modelo de lenguaje y no debe usarse como tal.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por parte de la comunidad.
- Fecha de creación declarada en 2026: dato atípico que conviene verificar antes de citar el modelo.

## Enlaces

- Hugging Face: https://huggingface.co/Vanespl/ass-4-q1-cifar-ioc_nn
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
