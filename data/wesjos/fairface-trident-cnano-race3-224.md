# wesjos/fairface-trident-cnano-race3-224

## Resumen

FairFace-Trident-CNano-Race3-224 es un clasificador de imágenes de rostros desarrollado por el usuario wesjos (wesjos en HuggingFace) que predice la categoría racial en tres clases (White, Black, Asian) a partir de imágenes RGB de 224x224. Se construye mediante fine-tuning completo del backbone ConvNeXt-Nano de timm, inicializado desde un modelo previo de 7 clases y entrenado sobre el dataset FairFace (Karkkainen & Joo, WACV 2021).

El modelo aborda la tarea de medición de sesgos algorítmicos y auditoría de equidad en sistemas de visión por computador, proporcionando una herramienta de investigación para cuantificar disparidades demográficas. Con 14.957.047 parámetros, es un modelo compacto orientado a inferencia eficiente en CPU y GPU de gama baja, lo que facilita su integración en pipelines de auditoría a gran escala.

Su relevancia actual radica en la creciente demanda de herramientas reproducibles para fairness auditing en modelos de reconocimiento facial, un área con escrutinio regulatorio creciente (AI Act en la UE). El autor declara explícitamente que el modelo es de uso exclusivo para investigación y prohíbe su uso en vigilancia, verificación de identidad o decisiones automatizadas de alto riesgo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ConvNeXt-Nano (CNN pura con bloques ConvNeXt) |
| Parámetros totales | 14.957.047 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (clasificación de imágenes) |
| Tipos de cuantización | no disponible (pesos en PyTorch, cuantización no documentada) |
| Idiomas soportados | en (etiquetas en inglés) |
| Licencia | cc-by-4.0 |
| Formato de pesos | PyTorch (.pt) |
| Resolución de entrada | RGB 224x224 |
| Normalización | mean=(0.485, 0.456, 0.406), std=(0.229, 0.224, 0.225) |
| Clases de salida | 3 (White / Black / Asian) |
| Modelo base | timm/convnext_nano.in12k_ft_in1k (Apache-2.0) |

## Arquitectura y entrenamiento

El modelo emplea ConvNeXt-Nano, una red neuronal convolucional pura que moderniza el diseño de ResNet incorporando elementos de los Vision Transformers (depthwise convolutions de 7x7, LayerNorm, GELU, diseño de stages con proporciones 1:1:3:1). El backbone fue preentrenado en ImageNet-12k y posteriormente afinado en ImageNet-1k (in12k_ft_in1k). Sobre esta base se realiza un full fine-tuning para la tarea de clasificación racial en 3 clases.

El entrenamiento utiliza el dataset FairFace, compuesto por 97.698 imágenes originales extraídas de YFCC100M. Para este proyecto, el autor deduplicó el dataset por contenido mediante SHA-256, resultando en 77.926 imágenes de entrenamiento, 8.659 de selección/validación y 10.931 de test. El conjunto de test es una versión congelada y deduplicada del split oficial de validación de FairFace, con intersecciones vacías entre particiones. El modelo se inicializó desde un checkpoint previo de 7 clases y se reentrenó para 3 clases; el autor señala que la fusión directa de probabilidades del modelo de 7 clases ofrece mayor precisión (93,46% frente a 92,98%). No se documenta uso de RLHF, DPO ni técnicas de aumento de datos específicas.

## Capacidades

- Clasificación de imágenes de rostros en 3 categorías raciales (White, Black, Asian).
- Inferencia sobre imágenes RGB de 224x224 con normalización ImageNet estándar.
- Extracción de características faciales mediante el backbone ConvNeXt-Nano, reutilizable para otras tareas de atributos faciales.
- Ejecución eficiente en CPU y GPU de gama baja gracias a su reducido número de parámetros (14,9M).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües (las etiquetas están en inglés).
- No soporta modo thinking, visión general, audio ni otras modalidades.

## Casos de uso

- Auditoría de sesgos en sistemas de reconocimiento facial: el modelo permite cuantificar disparidades de precisión entre grupos raciales en pipelines existentes, sirviendo como referencia para detectar sesgos en modelos de producción.
- Investigación académica en fairness de visión por computador: proporciona una línea base reproducible con métricas documentadas (92,98% accuracy, 91,81% macro-F1) para comparar contra nuevas propuestas.
- Medición de disparidades interseccionales: combinado con clasificadores de género y edad del mismo autor, permite analizar subgrupos específicos (género x raza) y detectar desigualdades compuestas.
- Validación de datasets de rostros: puede usarse para caracterizar la distribución demográfica de conjuntos de datos antes de entrenar modelos, detectando desequilibrios de representación.
- Prototipado rápido en entornos con recursos limitados: su tamaño de 0,1 GB y 14,9M de parámetros permiten desplegarlo en CPU o GPUs consumer para experimentos exploratorios.
- Educación y divulgación sobre sesgos algorítmicos: sirve como ejemplo didáctico de cómo los modelos de clasificación facial pueden presentar disparidades demográficas medibles.

## Benchmarks y rendimiento

| Tarea | Accuracy | Macro-F1 | Soporte |
|---|---:|---:|---:|
| Raza (3 clases: White / Black / Asian) | 92,98% | 91,81% | 10.931 |

El autor indica que la fusión de probabilidades desde el modelo de 7 clases alcanza un 93,46% de accuracy, superior al 92,98% del modelo de 3 clases. No se han publicado resultados comparativos con otros modelos de clasificación racial en la información disponible. Las métricas por clase (recall y matriz de confusión) se referencian como imágenes en la model card pero no se proporcionan sus valores numéricos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (14,9M de parámetros, ~60 MB de pesos), y menos de 500 MB en FP16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en RTX 3050, RTX 4060, T4, e incluso en GPUs integradas.
- Cabe holgadamente en cualquier GPU consumer, incluidas GTX 1050 Ti, RTX 2060 o superiores; también es viable en CPU.
- Opciones de despliegue: PyTorch nativo (según la model card, mediante un módulo `inference` propio), exportación a ONNX, TorchScript o integración con timm. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia de milisegundos por imagen en GPU moderna y decenas de milisegundos en CPU, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/Entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FairFace-Trident-CNano-Race3-224 | 14,9M | 224x224 | 92,98% acc (3 clases) | CC BY 4.0 | HuggingFace |
| Modelo de 7 clases del mismo autor (referencia) | no disponible | 224x224 | 93,46% acc (fusión de probabilidades) | no disponible | no disponible |
| FairFace original (ResNet-34, Karkkainen & Joo) | no disponible en la información | 224x224 | no disponible en la información | CC BY 4.0 (dataset) | no disponible |

No se dispone de datos suficientes en la información proporcionada para establecer una comparativa rigurosa con modelos alternativos de clasificación racial. El autor menciona un modelo previo de 7 clases del que deriva este checkpoint, pero no se aportan sus especificaciones completas.

## Limitaciones y advertencias

- Uso exclusivo para investigación: el autor prohíbe explícitamente su uso en vigilancia, verificación de identidad, reclutamiento, evaluación crediticia o cualquier decisión automatizada de alto riesgo.
- Reutilización del conjunto de test: el test congelado se evaluó en múltiples checkpoints durante el desarrollo, por lo que las métricas son descriptivas y no constituyen una estimación imparcial del rendimiento en datos no vistos.
- Semilla única: el entrenamiento se realizó con una sola semilla; diferencias inferiores a 0,3 puntos porcentuales deben considerarse ruido estadístico.
- Disparidades demográficas: los límites entre grupos (especialmente Latino/Hispano, Oriente Medio, Indio y White) no son discretos; la estimación de edad presenta mayores tasas de error y ciertos subgrupos interseccionales género x raza muestran disparidades elevadas.
- Atribución de etiquetas: las etiquetas reflejan anotaciones categóricas del dataset FairFace y no representan la autoidentificación personal ni la ascendencia real de los individuos.
- Sesgos conocidos: al derivar de FairFace, hereda los sesgos de anotación del dataset original, incluyendo la categorización racial problemática y la sobrerrepresentación de ciertos grupos.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas con alta confianza en rostros atípicos, oclusivos o con iluminación adversa.
- Restricciones de licencia: CC BY 4.0 permite uso comercial con atribución, pero las restricciones éticas del autor (research use only) entran en conflicto con la licencia permisiva; en producción comercial es necesario evaluar este conflicto legal.
- Limitación de idioma: las etiquetas y la documentación están únicamente en inglés.
- Sin mantenimiento documentado: el modelo tiene 0 descargas y 0 likes, lo que sugiere ausencia de validación comunitaria o soporte a largo plazo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wesjos/fairface-trident-cnano-race3-224
- Modelo base (timm): https://huggingface.co/timm/convnext_nano.in12k_ft_in1k
- Dataset FairFace: https://huggingface.co/datasets/HuggingFaceM4/FairFace
- Paper FairFace (WACV 2021): Karkkainen, K. & Joo, J. "FairFace: Face Attribute Dataset for Balanced Race, Gender, and Age for Bias Measurement and Mitigation" (no se proporciona URL directa en la información disponible)
- Repositorio timm: no disponible en la información proporcionada
- Demo o Space: no disponible en la información proporcionada
