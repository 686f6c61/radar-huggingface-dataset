# TahmeedAhmad/surfaceguard-defect-segmentation

## Resumen

SurfaceGuard es un modelo de segmentación de imágenes orientado a la detección de defectos superficiales sobre tiras de escala de grises de 128x800 píxeles. Lo publica el usuario TahmeedAhmad en Hugging Face como parte de un proyecto académico del programa BS Deep Learning & GenAI del IIT Madras, atribuido a Atul Kumar (matrícula 24f2003045). No es un modelo generativo ni un LLM, sino un ensemble de segmentación semántica entrenado específicamente para localizar cuatro tipos de defectos en superficies industriales.

La configuración final combina dos ramas: una U-Net con backbone ResNet-34 y una FPN con backbone EfficientNet-B3, con test-time augmentation por volteo horizontal (flip TTA) y post-procesado por clase ajustado sobre un fold de validación reservado. El conjunto suma aproximadamente 36,9 millones de parámetros y alcanza una puntuación de validación de 0,7407 (0,7231 con umbral fijo de 0,5).

Es relevante en el contexto del control de calidad industrial automatizado: ofrece una referencia reproducible y de licencia MIT para inspección visual de superficies, con pesos en PyTorch y exportación a ONNX, aunque con un alcance muy acotado al dominio concreto de las tiras de 128x800 en escala de grises sobre el que fue entrenado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Ensemble: U-Net con backbone ResNet-34 + FPN con backbone EfficientNet-B3 |
| Parámetros totales | 36,9086 M (configuración final); 44,7598 M en la variante con rama Scratch U-Net |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión); entrada fija 1x1x128x800 |
| Tipos de cuantización | no disponible (pesos PyTorch; exportación ONNX disponible, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`weights/*.pt`, state dict + config) y ONNX |

## Arquitectura y entrenamiento

El modelo es un ensemble de dos segmentadores densos. La primera rama es una U-Net con encoder ResNet-34, adecuada para recuperar detalle fino en estructuras alargadas como los arañazos. La segunda es una FPN (Feature Pyramid Network) con encoder EfficientNet-B3, que aporta contexto multiescala. Las predicciones se combinan y se aplica flip TTA en inferencia. Sobre la salida se ejecuta un post-procesado por clase cuyos parámetros se ajustan en un fold de validación reservado (`pp_params.json`), y la selección de configuración se documenta en `selection.json`.

La entrada es un tensor de 1 canal, 128 de alto por 800 de ancho, normalizado en el rango [0, 1]. El modelo cubre cuatro tipos de defecto, aunque la model card no detalla sus nombres ni la composición del dataset de entrenamiento (número de imágenes, proporción por clase, fuente de las muestras o técnicas de aumento más allá del flip TTA). Tampoco se especifica si hubo preentrenamiento de los backbones en ImageNet ni el régimen de entrenamiento (epochs, optimizador, función de pérdida). Toda esa información debe considerarse no disponible.

La model card incluye una tabla comparativa de siete configuraciones evaluadas, lo que permite trazar el proceso de selección: desde una U-Net desde cero (7,8512 M de parámetros, score 0,6926) hasta el ensemble final (36,9086 M, score 0,7407). La variante con tres ramas (añadiendo una U-Net entrenada desde cero) obtiene un score ligeramente superior (0,7416) a costa de 44,7598 M de parámetros, pero no fue la elegida.

## Capacidades

- Segmentación semántica de defectos superficiales en imágenes de entrada de 128x800 en escala de grises.
- Detección de cuatro tipos de defecto sobre tiras de superficie (los tipos concretos no se detallan en la información disponible).
- Discriminación de imágenes sin defecto: métrica `empty_acc` de 0,9183 en la configuración final.
- Test-time augmentation mediante flip horizontal, integrada en el pipeline de inferencia.
- Post-procesado por clase ajustado sobre validación, con parámetros exportados en `pp_params.json`.
- Exportación a ONNX para despliegue en entornos sin PyTorch.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural: es exclusivamente un modelo de visión.
- No dispone de modo thinking, visión general, audio ni capacidades multilingües.

## Casos de uso

- Inspección de calidad en línea de producción: el modelo se integra en una cámara industrial que captura tiras de 128x800 en escala de grises y devuelve una máscara de defectos por pieza, permitiendo descartar unidades defectuosas antes del empaquetado. La entrada de tamaño fijo encaja con cámaras lineales configuradas a esa resolución.
- Clasificación de lotes sin defecto: gracias a la métrica `empty_acc` de 0,9183, el modelo puede usarse como primer filtro para descartar automáticamente imágenes limpias y derivar solo las sospechosas a revisión humana, reduciendo la carga de los operarios.
- Análisis de arañazos y defectos alargados: la rama U-Net con ResNet-34 está orientada a preservar detalle fino, lo que la hace adecuada para localizar defectos de geometría estrecha y alargada sobre superficies metálicas o textiles.
- Despliegue en dispositivos de borde: la exportación a ONNX y el tamaño contenido (36,9 M de parámetros) permiten ejecutar la inferencia en hardware industrial sin GPU dedicada, integrándolo en controladores de línea.
- Monitorización de deriva de proceso: al segmentar por clase, se pueden agregar las máscaras a lo largo del turno para detectar aumentos en la frecuencia de un tipo de defecto y correlacionarlos con cambios en la maquinaria.
- Prototipado académico y reproducción de baselines: al ser un proyecto con licencia MIT, pesos y scripts de selección publicados, sirve como punto de partida para experimentos de segmentación de defectos con arquitecturas U-Net/FPN y para comparar estrategias de ensemble y TTA.
- Auditoría visual con revisión humana asistida: las máscaras generadas pueden superponerse sobre la imagen original en una interfaz de inspección, agilizando la validación por parte de un técnico de calidad.

## Benchmarks y rendimiento

Resultados de validación publicados en la model card (puntuación compuesta, Dice de primer plano, puntuación de falsos positivos, precisión en imágenes vacías y parámetros):

| Configuración | raw_score | score | fg_dice | fp_score | empty_acc | params_M |
|---|---|---|---|---|---|---|
| Scratch U-Net + U-Net ResNet-34 + FPN EfficientNet-B3 | 0,7233 | 0,7416 | 0,6714 | 0,9044 | 0,9072 | 44,7598 |
| U-Net ResNet-34 + FPN EfficientNet-B3 (final) | 0,7231 | 0,7407 | 0,6641 | 0,9203 | 0,9183 | 36,9086 |
| Scratch U-Net + FPN EfficientNet-B3 | 0,7147 | 0,7341 | 0,6587 | 0,9098 | 0,9098 | 20,3272 |
| FPN EfficientNet-B3 | 0,7047 | 0,7327 | 0,6590 | 0,9036 | 0,9069 | 12,4760 |
| Scratch U-Net + U-Net ResNet-34 | 0,7033 | 0,7239 | 0,6333 | 0,9385 | 0,9288 | 32,2838 |
| U-Net ResNet-34 | 0,6942 | 0,7177 | 0,6351 | 0,9113 | 0,9088 | 24,4326 |
| Scratch U-Net | 0,6501 | 0,6926 | 0,6101 | 0,8854 | 0,8844 | 7,8512 |

No se han publicado resultados en benchmarks estándar de segmentación (Cityscapes, ADE20K, COCO) ni comparaciones con modelos externos. Las métricas anteriores corresponden exclusivamente al conjunto de validación del propio dataset del autor.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 36,9 M de parámetros con entrada de 1x1x128x800, la huella en FP32 ronda los 150 MB de pesos; con activaciones y dos ramas en paralelo, es holgadamente ejecutable en GPUs de 4 GB o menos. No se publican mediciones oficiales de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de memoria es suficiente; una RTX 3060, RTX 4090, A100 o H100 ejecutarían la inferencia sin problemas, aunque el modelo está claramente sobredimensionado para hardware de datacenter.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida, dado el reducido tamaño.
- Opciones de despliegue: PyTorch nativo (pesos `weights/*.pt`), ONNX Runtime para la exportación ONNX, y contenedores propios. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de segmentación de este tipo.
- Latencia y throughput: no disponibles. No se han publicado mediciones de latencia ni de imágenes por segundo en ningún hardware.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SurfaceGuard (este modelo) | Ensemble U-Net ResNet-34 + FPN EfficientNet-B3 | 36,9 M | 1x128x800 | MIT | Hugging Face, pesos PyTorch y ONNX |
| U-Net estándar (Ronneberger et al.) | U-Net clásica | ~7,8 M (variante Scratch del autor) | variable | MIT / dominio público | Implementaciones múltiples |
| FPN EfficientNet-B3 (solo) | FPN | 12,5 M | variable | según implementación | Disponible en segmentation-models-pytorch |
| SAM (Segment Anything) | Segmentación promptable | 632 M (ViT-H) | 1024x1024 | Apache 2.0 | Meta AI, Hugging Face |

La comparación directa con SAM no es equivalente: SAM es un modelo de segmentación general guiado por prompts, mientras que SurfaceGuard está especializado en un dominio muy concreto y no acepta indicaciones textuales ni de puntos. Frente a una U-Net o FPN individuales, el ensemble mejora el score de validación (0,7407 frente a 0,7177 y 0,7327 respectivamente) a costa de triplicar los parámetros. No se dispone de comparaciones con otros modelos específicos de detección de defectos industriales (MVTec AD, DAGM, etc.) en la información proporcionada.

## Limitaciones y advertencias

- Dominio muy restringido: el modelo está entrenado exclusivamente para tiras de 128x800 en escala de grises con cuatro tipos de defecto; no se garantiza su funcionamiento en otras resoluciones, en color o en otras familias de superficies.
- Sin información sobre el dataset: no se detalla el número de imágenes, la distribución de clases ni la procedencia de los datos, lo que impide evaluar el riesgo de sobreajuste o de sesgo hacia determinados materiales o condiciones de iluminación.
- Métricas modestas: un `fg_dice` de 0,6641 indica que la segmentación de primer plano es mejorable; en producción conviene combinarla con revisión humana.
- Riesgo de falsos positivos y negativos: la `fp_score` de 0,9203 y `empty_acc` de 0,9183 implican que aproximadamente un 8 % de imágenes vacías podrían clasificarse erróneamente.
- Sin validación externa: no hay resultados en conjuntos de datos independientes del autor, por lo que la generalización a otras plantas o cámaras no está demostrada.
- Sin información sobre sesgos: no se documentan sesgos conocidos, pero la ausencia de datos sobre la composición del dataset impide descartarlos.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene revisar la atribución requerida.
- Sin cuantizaciones publicadas: solo se ofrecen pesos PyTorch y ONNX; no hay versiones INT8 ni FP16 validadas.
- Modelo de un único autor en un contexto académico: no hay evidencia de mantenimiento continuo ni de actualizaciones posteriores a la publicación (16 de noviembre de 2026).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TahmeedAhmad/surfaceguard-defect-segmentation
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/TahmeedAhmad/surfaceguard-demo
- Repositorio de segmentation-models-pytorch (backbones utilizados): https://github.com/qubvel-org/segmentation_models.pytorch
- Paper original de U-Net: https://arxiv.org/abs/1505.04597
- Paper de Feature Pyramid Networks: https://arxiv.org/abs/1612.03144
- Paper de EfficientNet: https://arxiv.org/abs/1905.11946
