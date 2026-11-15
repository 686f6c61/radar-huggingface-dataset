# Yasir-Alazmi/skin-lesion-convnext-ensemble

## Resumen

`skin-lesion-convnext-ensemble` es un conjunto (ensemble) de cuatro modelos ConvNeXt-Small especializados en clasificación de lesiones cutáneas a partir de imágenes dermatoscópicas. Lo publica el usuario Yasir-Alazmi en Hugging Face bajo licencia MIT y está pensado exclusivamente para investigación. El problema que aborda es la clasificación automática de lesiones en las siete categorías diagnósticas del dataset HAM10000, un benchmark clásico en dermatología computacional.

El modelo parte de los pesos preentrenados `convnext_small.fb_in22k_ft_in1k_384` de la librería `timm` y realiza un ajuste fino sobre HAM10000 empleando una partición agrupada por lesión (lesion-grouped split), lo que evita fugas de información entre imágenes del mismo paciente o lesión. La inferencia combina los cuatro miembros mediante media de log-probabilidades, TTA con volteo horizontal y un sesgo logarítmico por clase configurable.

Es relevante ahora porque demuestra una práctica metodológica correcta en un dominio donde abundan los resultados inflados por particiones aleatorias, y porque publica intervalos de confianza por bootstrap a nivel de lesión. No obstante, su autor lo etiqueta explícitamente como código de investigación no validado clínicamente ni apto como dispositivo médico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt-Small (4 miembros en ensemble), preentrenado `convnext_small.fb_in22k_ft_in1k_384` |
| Parametros totales | no disponible (ConvNeXt-Small ~50 M por miembro; cifra exacta no publicada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (clasificación de imágenes) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0.8 GB, librería `timm`) |

## Arquitectura y entrenamiento

La arquitectura base es ConvNeXt-Small, una red convolucional pura con diseño inspirado en transformers (bloques con depthwise convolution de 7x7, normalización LayerNorm y activaciones GELU). El ensemble agrupa cuatro instancias de este backbone, cada una entrenada con entradas de 384 o 448 píxeles. La inferencia aplica TTA por volteo, promedia las log-probabilidades de los cuatro miembros y suma un sesgo logarítmico por clase leído de `ensemble_config.json`.

El entrenamiento se realiza sobre HAM10000 con una partición agrupada por lesión, lo que constituye la decisión metodológica más relevante del proyecto: impide que imágenes de la misma lesión aparezcan simultáneamente en entrenamiento y test. No se detalla en la información disponible el número de épocas, la composición exacta del dataset, el uso de aumentaciones más allá del TTA ni si se aplicó algún tipo de calibración adicional o pérdida ponderada por clase, aunque el sesgo logarítmico por clase sugiere un ajuste posterior para compensar el desbalanceo.

## Capacidades

- Clasificación de imágenes dermatoscópicas en las siete clases de HAM10000 (lesión vascular, nevus, queratosis, carcinoma basocelular, queratosis actínica, dermatofibroma y melanoma).
- Inferencia con TTA por volteo y agregación de log-probabilidades sobre cuatro miembros.
- Ajuste fino del sesgo logarítmico por clase para modular la sensibilidad y especificidad por categoría.
- Evaluación con intervalos de confianza por bootstrap a nivel de lesión.
- No soporta tool calling, agentes, generación de texto ni capacidades multilingües.
- No incluye modo de razonamiento, visión general ni audio: es un clasificador de imagen puro.

## Casos de uso

- Investigación en dermatología computacional: sirve como línea base reproducible para comparar metodologías de partición (aleatoria frente a agrupada por lesión) y cuantificar el impacto de la fuga de datos en los resultados publicados.
- Docencia y formación en visión artificial médica: el repositorio asociado documenta las decisiones de diseño y los caveats, lo que lo hace útil como ejemplo didáctico de evaluación honesta con intervalos de confianza.
- Desarrollo de pipelines de clasificación de imágenes médicas: la integración nativa con `timm` permite cargar los pesos en un script de PyTorch y encadenarlos con preprocesado dermatoscópico propio.
- Estudio de calibración y sesgo de clase: el mecanismo de sesgo logarítmico por clase es un punto de partida para experimentar con umbrales operativos orientados a sensibilidad en melanoma.
- Análisis de sensibilidad en clases raras: con 17-21 imágenes de test en las clases minoritarias, el modelo permite estudiar la varianza de las métricas en escenarios de pocos datos.
- Prototipado de sistemas de triaje (solo en laboratorio): puede emplearse para explorar arquitecturas de apoyo a la decisión, siempre fuera de cualquier uso clínico real y con validación externa previa.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test agrupado por lesión (segunda revisión, IC del 95 % por bootstrap a nivel de lesión):

| Metrica | Valor |
|---|---|
| Balanced accuracy | 0.819 [0.783, 0.852] |
| Macro-F1 | 0.786 |
| Accuracy | 0.837 |
| Sensibilidad a melanoma | 0.720 |

No se han publicado resultados comparativos con otros modelos en la información disponible. Las clases raras cuentan con solo 17-21 imágenes de test, por lo que las métricas por clase presentan una varianza elevada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con cuatro miembros ConvNeXt-Small a 384-448 px, una estimación razonable en FP16 se sitúa en el rango de 1-2 GB, aunque el autor no publica cifras.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; A100 o H100 no son necesarias para inferencia, solo para reentrenamiento a gran escala.
- Cabe en GPU de consumo: sí, previsiblemente en GTX 1660, RTX 3060, RTX 4060 y superiores; no confirmado por el autor.
- Opciones de despliegue: carga directa con `timm` y PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un clasificador de imagen).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de comparación con otros modelos en la información proporcionada. Como referencias conceptuales de la misma categoría podrían citarse otros clasificadores sobre HAM10000 basados en EfficientNet, ViT o ensembles de CNN, pero no se han publicado métricas comparables en la documentación disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| skin-lesion-convnext-ensemble | no disponible (~50 M por miembro) | no aplica | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un dispositivo médico ni está validado clínicamente; el autor lo restringe explícitamente a investigación.
- El entrenamiento se limita a HAM10000, un dataset con sesgos demográficos, de tono de piel y de adquisición dermatoscópica conocidos; la generalización a otras poblaciones o dispositivos no está evaluada.
- Las clases raras cuentan con solo 17-21 imágenes de test, lo que hace que las métricas por clase sean poco fiables.
- La sensibilidad a melanoma de 0.720 implica una tasa de falsos negativos del 28 % en el conjunto de test, inaceptable en cualquier escenario clínico.
- Riesgo de sobreajuste al dominio dermatoscópico y de degradación con imágenes de smartphones, iluminación variable o baja resolución.
- No se documentan sesgos específicos por tono de piel, edad o sexo, pero la ausencia de evaluación implica un riesgo no cuantificado.
- La licencia MIT permite uso comercial del código y los pesos, pero ello no exime de las obligaciones regulatorias sanitarias si se pretende desplegar en un contexto médico.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin revisión por pares ni validación externa independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Yasir-Alazmi/skin-lesion-convnext-ensemble
- Repositorio del proyecto: https://github.com/Yasir-Alazmi/skin-lesion-classification
