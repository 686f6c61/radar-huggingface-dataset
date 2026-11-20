# subhan1501/hybrid-radiograph-feature-fusion

## Resumen

`subhan1501/hybrid-radiograph-feature-fusion` es una colección de seis checkpoints de PyTorch para clasificación binaria de radiografías de tórax (neumonía frente a normal) que combinan backbones de visión modernos con descriptores clásicos de visión por computador. El autor, subhan1501, publica los pesos junto a un repositorio de código en GitHub que contiene la implementación de los modelos y el pipeline de preprocesamiento. No se trata de un modelo de lenguaje ni de un modelo fundacional generativo: es un conjunto de clasificadores de imagen entrenados desde cero sobre un subconjunto del conocido cohorte pediátrico de Kermany (1.500 radiografías estratificadas, 70/15/15).

El interés técnico reside en la estrategia de fusión: dos backbones preentrenados (ConvNeXt-Tiny y Swin Transformer-T) se combinan con descriptores hechos a mano —HOG multiescala (460 dimensiones), LBP uniforme (270 dimensiones), un banco de filtros Gabor de 24 kernels (288 dimensiones) y SIFT-BoVW con TF-IDF (208 dimensiones)— mediante tres mecanismos de fusión distintos: concatenación proyectada, gated cross-modal y token attention con Squeeze-and-Excitation. El preprocesamiento aplica CLAHE simétrico con `clipLimit=2.0` y `tileGrid=(8,8)`.

Es relevante ahora como referencia reproducible y ligera (0,7 GB de repo) para quienes investigan fusión híbrida deep/classical en imagen médica con recursos limitados, y como ejemplo de evaluación honesta: el autor publica accuracy, sensibilidad, especificidad, F1 y AUROC sobre un test de 225 imágenes para cada variante, incluyendo las líneas base sin descriptores clásicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: backbone ConvNeXt-Tiny o Swin Transformer-T + descriptores clásicos (HOG, LBP, Gabor, SIFT-BoVW) con cabeza de fusión |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen) |
| Tipos de cuantizacion | no disponible (checkpoints `.pth` en FP32 por defecto) |
| Idiomas soportados | no aplica (clasificación de imagen, sin componente textual) |
| Licencia | MIT |
| Formato de pesos | `.pth` (PyTorch state dict) |

## Arquitectura y entrenamiento

Cada checkpoint es un clasificador binario (`num_classes=2`) que procesa una radiografía de tórax preprocesada con CLAHE simétrico y extrae características por dos vías paralelas. La vía profunda usa un backbone ConvNeXt-Tiny o Swin Transformer-T; la vía clásica calcula descriptores de textura y forma (HOG multiescala de 460 dimensiones, LBP uniforme de 270, banco Gabor de 24 kernels y 288 dimensiones, SIFT-BoVW con TF-IDF de 208 dimensiones). La fusión se realiza de tres maneras según el experimento: concatenación proyectada a un espacio de embedding (por defecto `embed_dim=256`), gated cross-modal, o token attention con módulo Squeeze-and-Excitation.

El entrenamiento se realizó sobre el cohorte pediátrico de Kermany disponible en `hf-vision/chest-xray-pneumonia`, con 1.500 radiografías divididas en 70% entrenamiento, 15% validación y 15% test (225 imágenes). La model card no detalla el número de épocas, el optimizador, la tasa de aprendizaje ni si se aplicó aumento de datos más allá del preprocesamiento CLAHE; tampoco indica si los backbones se inicializaron con pesos ImageNet o desde cero (el ejemplo de uso pasa `pretrained=False` al cargar el checkpoint). No se documenta RLHF, DPO ni ningún proceso de alineación, algo esperable en un clasificador de imagen.

## Capacidades

- Clasificación binaria de radiografías de tórax: neumonía frente a normal.
- Extracción de características profundas con ConvNeXt-Tiny o Swin Transformer-T.
- Extracción de descriptores clásicos de textura y forma: HOG, LBP uniforme, Gabor y SIFT-BoVW con TF-IDF.
- Tres mecanismos de fusión multimodal implementados: concatenación proyectada, gated cross-modal y token attention con SE.
- Preprocesamiento integrado de contraste mediante CLAHE simétrico.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de visión general: está especializado en un único dominio y una única tarea.
- No dispone de modo "thinking", audio ni vídeo.

## Casos de uso

- Triaje asistido en radiología pediátrica: el checkpoint `exp1_convnext_baseline.pth` alcanza 94,22% de accuracy y 97,78% de especificidad en el test, por lo que puede usarse como filtro previo que descarte radiografías normales antes de la revisión del radiólogo.
- Investigación en fusión híbrida deep/classical: los seis checkpoints permiten reproducir el ablation study comparando backbone puro frente a backbone más descriptor clásico con distintos mecanismos de fusión, sin reentrenar.
- Docencia y prototipado en imagen médica: el repo de 0,7 GB y la licencia MIT permiten desplegar el modelo en un portátil con GPU consumer para demostraciones de clasificación con CLAHE y fusión de características.
- Detección con alta sensibilidad: `exp5_swin_gabor.pth` ofrece 94,07% de sensibilidad, útil en escenarios donde el coste de un falso negativo es alto y se acepta una especificidad menor (91,11%).
- Benchmark de referencia para nuevos descriptores: al publicar métricas por experimento sobre un test fijo de 225 imágenes, sirve como línea base contra la que comparar otras combinaciones de descriptores clásicos o backbones.
- Integración en pipelines de investigación clínica: los checkpoints se cargan con `hf_hub_download` y `HybridMedicalClassifier`, lo que facilita incorporarlos a notebooks de experimentación con PyTorch sin dependencias exóticas.
- Evaluación de calibración y umbrales: las curvas AUROC publicadas (0,9843–0,9887) permiten estudiar el ajuste de umbral operativo según el coste relativo de falsos positivos y negativos en un despliegue concreto.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test (n = 225):

| Checkpoint | Backbone | Descriptor | Fusion | Accuracy | Sensibilidad | Especificidad | F1 | AUROC |
|---|---|---|---|---|---|---|---|---|
| `exp1_convnext_baseline.pth` | ConvNeXt-Tiny | Ninguno | Pure Deep Head | 94,22% | 91,85% | 97,78% | 95,02% | 0,9878 |
| `exp2_convnext_hog.pth` | ConvNeXt-Tiny | HOG multiescala (460-D) | Projected Concat | 93,33% | 92,59% | 94,44% | 94,34% | 0,9885 |
| `exp3_convnext_lbp.pth` | ConvNeXt-Tiny | LBP uniforme (270-D) | Gated Cross-Modal | 93,78% | 92,59% | 95,56% | 94,70% | 0,9869 |
| `exp4_swin_baseline.pth` | Swin-T | Ninguno | Pure Deep Head | 89,78% | 87,41% | 93,33% | 91,12% | 0,9843 |
| `exp5_swin_gabor.pth` | Swin-T | Gabor 24 kernels (288-D) | Projected Concat | 92,89% | 94,07% | 91,11% | 94,07% | 0,9878 |
| `exp6_swin_sift.pth` | Swin-T | SIFT-BoVW TF-IDF (208-D) | Token Attention + SE | 93,78% | 93,33% | 94,44% | 94,74% | 0,9887 |

No se han publicado resultados comparativos con otros modelos externos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; por el tamaño de los backbones (ConvNeXt-Tiny y Swin-T, del orden de decenas de millones de parámetros) la inferencia en FP32 cabe holgadamente en GPUs consumer de 8 GB, aunque el autor no publica la cifra.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para inferencia en FP32; para entrenamiento o fine-tuning se recomienda 16 GB o más.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4070 y superiores; no confirmado por el autor.
- Opciones de despliegue: PyTorch nativo mediante `hf_hub_download` y `HybridMedicalClassifier`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un clasificador de imagen de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. Como referencia cualitativa, la propia model card incluye las líneas base internas (ConvNeXt-Tiny y Swin-T sin descriptores clásicos) que funcionan como comparación controlada dentro del mismo estudio:

| Modelo | Backbone | Contexto de comparación | Accuracy (test, n=225) | Licencia |
|---|---|---|---|---|
| `exp1_convnext_baseline.pth` | ConvNeXt-Tiny | Línea base sin descriptores | 94,22% | MIT |
| `exp6_swin_sift.pth` | Swin-T + SIFT-BoVW | Fusión token attention + SE | 93,78% | MIT |
| `exp4_swin_baseline.pth` | Swin-T | Línea base sin descriptores | 89,78% | MIT |

Comparación con clasificadores de radiografía de tórax de terceros: no disponible.

## Limitaciones y advertencias

- Entrenado sobre un cohorte pediátrico único (Kermany, 1.500 imágenes); la generalización a otras poblaciones, equipos de rayos X o protocolos de adquisición no está validada.
- El conjunto de test es pequeño (225 imágenes), por lo que las diferencias de uno o dos puntos porcentuales entre checkpoints pueden no ser estadísticamente significativas.
- Riesgo de sesgo demográfico y de adquisición: al proceder de un solo dataset pediátrico, el modelo puede no comportarse igual en adultos o en imágenes con distinto contraste y ruido.
- Riesgo de alucinación en el sentido de falsos positivos y negativos: no es un modelo generativo, pero sus predicciones no deben interpretarse como diagnóstico clínico.
- No es un producto sanitario: carece de marcado CE, validación regulatoria o estudios clínicos prospectivos; su uso en entornos clínicos requeriría validación adicional.
- La model card no documenta el proceso de entrenamiento (épocas, optimizador, aumento de datos), lo que dificulta la reproducibilidad exacta.
- No se especifican los pesos de los backbones (ImageNet o desde cero); el ejemplo de uso pasa `pretrained=False`, lo que sugiere que los checkpoints contienen todos los pesos necesarios, pero no se detalla.
- Licencia MIT: permite uso comercial y modificación, pero sin garantías; el autor no ofrece soporte ni mantenimiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado los resultados de forma independiente.

## Enlaces

- Hugging Face: https://huggingface.co/subhan1501/hybrid-radiograph-feature-fusion
- Repositorio de código: https://github.com/Subhans1501/hybrid-radiograph-feature-fusion
- Dataset utilizado: https://huggingface.co/datasets/hf-vision/chest-xray-pneumonia
