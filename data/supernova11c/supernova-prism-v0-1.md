# Supernova11c/Supernova-Prism-V0.1

## Resumen

Supernova Prism V0.1 es un prototipo de investigación publicado por el usuario Supernova11c en Hugging Face. Se trata de un modelo experimental de reconstrucción de geometría 3D a partir de una única imagen RGB: recibe una fotografía de 128 × 128 píxeles y predice una representación volumétrica de ocupación de vóxeles de 32 × 32 × 32, que puede exportarse como malla GLB. No es un modelo de lenguaje ni un transformer generativo de texto, sino una red neuronal convolucional personalizada entrenada desde inicialización aleatoria.

Su relevancia es limitada y estrictamente exploratoria: el autor lo presenta explícitamente como una línea base experimental, no como un sistema de reconstrucción 3D listo para producción. El repositorio ocupa 0,2 GB y no registra descargas ni interacciones en el momento de la consulta. La arquitectura combina un codificador convolucional 2D, un vector latente de 512 dimensiones y un decodificador convolucional 3D, todo implementado en PyTorch y entrenado en una GPU NVIDIA T4 de Google Colab.

La ficha se elabora a partir de la model card del autor y de los metadatos del repositorio. No se dispone de información sobre licencia, idiomas, pipeline declarado ni resultados de benchmarks comparativos con otros sistemas de reconstrucción 3D.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN 2D (codificador) + latente de 512 dimensiones + CNN 3D (decodificador) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada de imagen 128 × 128) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`prism_best.pt`, checkpoint con `model_state_dict`) |

## Arquitectura y entrenamiento

El modelo sigue un diseño encoder-decoder totalmente convolucional. La entrada es una imagen RGB redimensionada a 128 × 128 píxeles, procesada por un codificador CNN 2D personalizado que produce un vector latente de 512 dimensiones. Ese vector alimenta un decodificador CNN 3D que genera una predicción de ocupación de vóxeles de resolución 32³. En inferencia, la ocupación se umbraliza (por defecto 0,5, configurable) y la superficie resultante se convierte en una malla exportable en formato GLB.

El entrenamiento se realizó desde inicialización aleatoria, sin codificador visual preentrenado, usando PyTorch sobre una GPU NVIDIA T4 en Google Colab. Los datos provienen del dataset Pix3D (pares de imágenes y modelos voxelizados) alojado en Hugging Face bajo el identificador `unstructured/pix3d`. La model card no especifica el número de tokens, el volumen exacto de ejemplos, la composición del split ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal, que no aplican a este tipo de arquitectura.

## Capacidades

- Reconstrucción de geometría 3D a partir de una única imagen RGB.
- Predicción de ocupación de vóxeles con resolución de salida de 32 × 32 × 32.
- Umbral de ocupación configurable en inferencia (`--threshold`), sin reentrenamiento.
- Exportación de la superficie predicha a malla GLB.
- Inferencia local en CPU o CUDA, sujeta a memoria disponible.
- Codificador de imagen propio, sin dependencia de encoders visuales preentrenados.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No predice texturas ni colores de superficie realistas en esta versión.
- No dispone de capacidades multilingües por su naturaleza no lingüística.

## Casos de uso

- Investigación académica sobre reconstrucción monoimagen: sirve como línea base reproducible para comparar arquitecturas encoder-decoder convolucionales frente a enfoques con encoders preentrenados, dado que entrena desde cero y publica checkpoint, código y métricas.
- Docencia y experimentación en visión 3D: el repositorio incluye `model.py`, `inference.py` y `metrics.json`, lo que facilita usar el modelo como ejemplo didáctico de pipeline imagen → latente → vóxeles → malla.
- Prototipado rápido de pipelines de voxelización: permite validar el flujo completo de carga de checkpoint, inferencia, umbralizado y exportación GLB antes de invertir en modelos de mayor calidad.
- Pruebas de integración de exportación GLB: útil para verificar herramientas de conversión de vóxeles a malla y visores 3D en entornos de desarrollo, aceptando la baja fidelidad geométrica actual.
- Experimentos de ajuste del umbral de ocupación: el parámetro `--threshold` permite estudiar el compromiso entre precisión y recall de la geometría extraída sin reentrenar.
- Evaluación comparativa de métricas de vóxeles: el modelo publica accuracy, precision, recall, F1 e IoU, lo que permite reproducir la metodología de evaluación en otros prototipos.
- Inferencia local en hardware modesto: al ser una red convolucional pequeña con entrada de 128 × 128 y salida 32³, puede ejecutarse en CPU o en GPU de gama baja, lo que facilita pruebas en portátiles sin acelerador dedicado.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el split de test reservado:

| Metrica | Resultado |
|---|---:|
| Voxel accuracy | 84,9680 % |
| Precision | 22,2508 % |
| Recall | 25,2429 % |
| F1-score | 23,6526 % |
| Voxel IoU | 13,4125 % |

El propio autor advierte que la accuracy de vóxeles es engañosa porque la mayor parte de la rejilla 3D está vacía, y que IoU y F1 son indicadores más útiles del solapamiento de geometría ocupada. No se han publicado comparaciones con otros modelos de reconstrucción 3D en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; por el tamaño del repositorio (0,2 GB) y la resolución de entrada (128 × 128) y salida (32³), la huella de memoria es reducida y cabe holgadamente en GPUs de consumo.
- GPU de entrenamiento declarada: NVIDIA T4 (Google Colab).
- GPU recomendadas para inferencia: cualquier GPU CUDA con memoria suficiente; el autor indica que también funciona en CPU.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna con CUDA; no se especifica una VRAM mínima exacta.
- Opciones de despliegue: scripts propios en PyTorch (`inference.py`), carga manual del checkpoint con `torch.load` y `model.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros sistemas de reconstrucción 3D monoimagen (por ejemplo, enfoques basados en NeRF, Gaussian Splatting o modelos generativos 3D), ni datos de rendimiento de alternativas que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Prototipo experimental: el autor lo declara explícitamente no apto para producción ni como sistema general de reconstrucción 3D.
- Geometría gruesa: la resolución de salida es de 32³ vóxeles, lo que limita el nivel de detalle.
- Calidad de reconstrucción limitada: precision del 22,25 %, recall del 25,24 % e IoU del 13,41 % en el test reservado.
- Generalización no demostrada: entrenado y evaluado sobre una distribución limitada de objetos del dataset Pix3D; no hay evidencia de comportamiento en fotografías reales arbitrarias.
- Superficies ocultas inferidas: una sola imagen no revela la geometría no visible; el modelo estima, no recupera verdad de referencia.
- Sin texturas ni colores: V0.1 no predice apariencia superficial realista.
- Preprocesado cuadrado: la imagen se redimensiona a 128 × 128, lo que puede distorsionar la proporción del objeto.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; debe consultarse con el autor antes de cualquier uso en producción.
- Sin tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación externa.
- Riesgo de alucinación geométrica: al estimar superficies no observadas, puede generar geometría plausible pero incorrecta.
- Sesgos: no documentados; previsiblemente hereda los sesgos de categorías y distribución del dataset Pix3D.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Supernova11c/Supernova-Prism-V0.1
- Dataset Pix3D en Hugging Face: https://huggingface.co/datasets/unstructured/pix3d
- Supernova AI (resultado de búsqueda web, sin relación confirmada con el autor del modelo): https://supernova.ai/
