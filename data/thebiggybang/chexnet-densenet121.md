# TheBiggyBang/chexnet-densenet121

## Resumen

CheXNet-style DenseNet-121 es un modelo de clasificación de imágenes médicas desarrollado por el usuario TheBiggyBang como parte de un proyecto académico (PFA). Se trata de un DenseNet-121 preentrenado en ImageNet-1k y ajustado fino sobre el conjunto NIH ChestX-ray14 para detectar 14 hallazgos torácicos en radiografías de tórax. La arquitectura sigue el enfoque original de CheXNet (Rajpurkar et al., 2017), sustituyendo el clasificador final por una capa lineal de 1024 a 14 salidas con activación sigmoide independiente por clase.

El modelo resuelve un problema de clasificación multietiqueta: una misma radiografía puede presentar varios hallazgos simultáneamente (por ejemplo, cardiomegalia y derrame pleural). Con aproximadamente 7,05 millones de parámetros, es un modelo compacto que puede ejecutarse en hardware modesto, lo que lo hace accesible para experimentación e investigación.

Es relevante ahora como ejemplo reproducible de un pipeline completo de clasificación médica: incluye el cuaderno de entrenamiento, los pesos en dos formatos y una evaluación por clase publicada. Sin embargo, el autor advierte explícitamente que no es un dispositivo médico y que solo debe usarse con fines de investigación y educación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DenseNet-121 (torchvision), clasificador reemplazado por `Linear(1024, 14)` |
| Parametros totales | 7.051.854 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 224 × 224) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de imagen, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`) y PyTorch state_dict (`densenet121_14cls.pth`) |

## Arquitectura y entrenamiento

La arquitectura es una CNN DenseNet-121 con conexiones densas entre bloques, inicializada con pesos de ImageNet-1k (`DenseNet121_Weights.IMAGENET1K_V1`). La capa clasificadora original se sustituye por una capa lineal de 1024 a 14 salidas, con una sigmoide independiente por hallazgo (no softmax, ya que las clases no son mutuamente excluyentes). La entrada es una imagen RGB de 224 × 224 con normalización ImageNet (media [0.485, 0.456, 0.406], desviación [0.229, 0.224, 0.225]).

El entrenamiento se realizó sobre el conjunto NIH ChestX-ray14 en su versión pre-redimensionada a 224 × 224, eliminando todas las imágenes etiquetadas como "No Finding", lo que deja 51.708 imágenes con al menos un hallazgo. El split fue aleatorio a nivel de imagen en dos fases (80/20 y luego 80/20 de nuevo): 33.092 imágenes de entrenamiento, 8.274 de validación y 10.342 de test. Se entrenaron 30 épocas con batch size 64, pérdida BCELoss, optimizador Adam (lr = 1e-3, betas (0.9, 0.999), weight decay 1e-4) y scheduler ReduceLROnPlateau (factor 0.1, paciencia 1) sobre la pérdida de entrenamiento. No se aplicó aumento de datos, solo normalización mediante Albumentations. El entrenamiento se ejecutó en una única NVIDIA Tesla T4 (Kaggle), con aproximadamente 10 minutos por época y unas 5 horas en total. Los pesos publicados corresponden al final de la época 30. El AUROC medio de validación pasó de 0,705 tras la época 1 a 0,800 tras la época 30.

## Capacidades

- Clasificación multietiqueta de 14 hallazgos torácicos en radiografías de tórax: Atelectasis, Cardiomegaly, Effusion, Infiltration, Mass, Nodule, Pneumonia, Pneumothorax, Consolidation, Edema, Emphysema, Fibrosis, Pleural_Thickening y Hernia.
- Salida de una probabilidad independiente por hallazgo mediante sigmoide, lo que permite detectar múltiples condiciones simultáneas en una misma imagen.
- Inferencia sobre imágenes RGB de 224 × 224 con normalización ImageNet estándar.
- Carga directa en `torchvision.models.densenet121(num_classes=14)` mediante el archivo safetensors con nombres de clave estándar de torchvision.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente de visión.
- No dispone de modo "thinking", visión generativa, audio ni ninguna capacidad multimodal más allá de la clasificación de imagen.

## Casos de uso

- Investigación académica en clasificación de radiografías de tórax: sirve como línea base reproducible para comparar técnicas de aumento de datos, funciones de pérdida o arquitecturas alternativas sobre ChestX-ray14, gracias a que el cuaderno de entrenamiento completo está publicado.
- Docencia y formación en visión artificial médica: el modelo y su cuaderno permiten ilustrar el flujo completo de un proyecto de deep learning aplicado a imagen médica, desde la preparación del dataset hasta la evaluación por clase con AUROC.
- Prototipado de aplicaciones web de demostración: el autor lo utiliza como motor de IA de su aplicación `chexnet-medical-app`, de modo que sirve como ejemplo de integración de un modelo de clasificación en un front-end.
- Experimentación con clasificación multietiqueta: al usar sigmoide independiente por clase en lugar de softmax, es un caso práctico para estudiar el comportamiento de modelos multietiqueta en dominios donde las etiquetas coexisten.
- Evaluación de técnicas de explicabilidad: al ser un DenseNet-121 compacto, es adecuado para probar métodos como Grad-CAM o mapas de saliencia sobre hallazgos torácicos concretos en un entorno de investigación.
- Pruebas de despliegue en hardware modesto: con 7 millones de parámetros y un repositorio de 0,1 GB, permite validar pipelines de inferencia en CPU o GPU de gama baja sin requerir infraestructura pesada.
- Análisis comparativo de sesgos de dataset: útil para estudiar cómo la eliminación de imágenes "No Finding" afecta al comportamiento del modelo y para investigar sesgos derivados de la composición de ChestX-ray14.

## Benchmarks y rendimiento

Resultados de AUROC por clase en el split de test retenido (10.342 imágenes), según la model card:

| Hallazgo | AUROC |
|---|---|
| Cardiomegaly | 0,895 |
| Emphysema | 0,851 |
| Pneumothorax | 0,819 |
| Effusion | 0,816 |
| Edema | 0,810 |
| Hernia | 0,789 |
| Mass | 0,787 |
| Fibrosis | 0,777 |
| Atelectasis | 0,761 |
| Pleural_Thickening | 0,720 |
| Nodule | 0,710 |
| Consolidation | 0,690 |
| Infiltration | 0,684 |
| Pneumonia | 0,664 |
| **Media** | **≈ 0,770** |

No se han publicado en la información disponible resultados de benchmarks comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros no aplican a este dominio). El autor señala que estas cifras de test son probablemente optimistas porque el split es aleatorio a nivel de imagen y no está agrupado por paciente, de modo que un mismo paciente puede aparecer en entrenamiento y test.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para un batch pequeño, dado el tamaño de 7,05 millones de parámetros y la entrada de 224 × 224.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el entrenamiento original se realizó en una NVIDIA Tesla T4. Para inferencia son suficientes tarjetas de gama baja o incluso CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1050 Ti o superior, RTX 2060, RTX 3060, RTX 4090, etc.), así como en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: PyTorch nativo con `torchvision` y `safetensors`; también es posible exportarlo a TorchScript u ONNX para servir con ONNX Runtime. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada. El autor solo indica que el entrenamiento tardaba unos 10 minutos por época en una Tesla T4.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CheXNet-style DenseNet-121 (este modelo) | 7,05 M | Imagen 224 × 224 | AUROC medio ≈ 0,770 en test propio | MIT | Hugging Face, 85 descargas |
| CheXNet original (Rajpurkar et al., 2017) | DenseNet-121 (~7 M) | Imagen 224 × 224 | No disponible en la información proporcionada | No disponible | Paper arXiv:1711.05225 |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes en la información proporcionada para establecer una comparativa cuantitativa con otras alternativas de la misma categoría. El propio autor referencia CheXNet como inspiración metodológica, pero no se aportan cifras del modelo original para contrastar.

## Limitaciones y advertencias

- No existe salida "normal": las imágenes "No Finding" se eliminaron antes del entrenamiento, por lo que el modelo nunca aprendió cómo es una radiografía sana. Algunas probabilidades siempre saldrán más altas que otras incluso para una imagen normal; no debe interpretarse la clase superior como diagnóstico.
- Las métricas de test son probablemente optimistas: el split es aleatorio a nivel de imagen y no está agrupado por paciente, y ChestX-ray14 contiene muchas exploraciones de seguimiento del mismo paciente, lo que puede provocar fuga de datos entre entrenamiento y test.
- El modelo no es un dispositivo médico y no debe usarse para diagnosticar pacientes ni tomar decisiones clínicas; el autor lo restringe explícitamente a investigación y educación.
- Sesgos conocidos del dataset subyacente: ChestX-ray14 presenta desequilibrios demográficos y de prevalencia de hallazgos, lo que puede traducirse en un rendimiento desigual entre subpoblaciones; la model card no detalla análisis por subgrupos.
- Sin aumento de datos durante el entrenamiento, lo que puede limitar la robustez ante variaciones de adquisición, contraste o posición del paciente no representadas en el conjunto de entrenamiento.
- Licencia MIT: permite uso comercial según los términos de la licencia, pero dicha permisividad no exime de las advertencias clínicas ni de las obligaciones regulatorias aplicables a software sanitario.
- El modelo solo procesa imágenes; no admite texto, audio ni otras modalidades, y no dispone de herramientas de calibración de probabilidades publicadas, por lo que las salidas sigmoides no deben interpretarse como probabilidades calibradas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TheBiggyBang/chexnet-densenet121
- Paper CheXNet (Rajpurkar et al., 2017): https://arxiv.org/abs/1711.05225
- Aplicación web del autor: https://github.com/TheBiggyBang1/chexnet-medical-app
- Dataset NIH ChestX-ray14 (Kaggle): https://www.kaggle.com/datasets/nih-chest-x-rays/data
- Versión pre-redimensionada a 224 × 224: https://www.kaggle.com/datasets/nih-chest-x-rays/nih-chest-x-ray-14-224x224-resized
- Pesos base en torchvision: `DenseNet121_Weights.IMAGENET1K_V1` (documentación de torchvision)
