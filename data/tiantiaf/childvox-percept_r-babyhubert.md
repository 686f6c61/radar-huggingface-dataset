# tiantiaf/childvox-percept_r-babyhubert

## Resumen

El modelo `tiantiaf/childvox-percept_r-babyhubert` es un clasificador de audio especializado en la detección de la producción del fonema /ɹ/ en el habla infantil. Desarrollado por Tiantian Feng y colaboradores en el marco del proyecto ChildVox, este modelo es un fine-tuning del modelo base BabyHuBERT (una variante de HuBERT adaptada a voz infantil) sobre el dataset PERCEPT-R, un corpus a gran escala de grabaciones de niños pronunciando palabras con /ɹ/. El modelo distingue entre dos categorías: `Derhotic` (producción no rótica, es decir, ausencia o distorsión del sonido) y `Rhotic` (producción correcta del sonido).

La relevancia de este modelo radica en su aplicación en la investigación del desarrollo del habla infantil, permitiendo caracterizar de forma automática la madurez articulatoria de los niños. Forma parte de la colección ChildVox, un benchmark unificado que abarca desde sonidos fisiológicos del nacimiento hasta el habla en edad escolar. El modelo se distribuye bajo licencia openrail, con un tamaño de repositorio de 1,9 GB y está diseñado para su uso con la librería Transformers de Hugging Face.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BabyHuBERT (variante de HuBERT, transformer encoder de audio) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2 segundos de audio (16 kHz, mono) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | multilingue (el dataset PERCEPT-R incluye multiples idiomas) |
| Licencia | openrail |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en BabyHuBERT, una adaptación del modelo HuBERT (Hidden Unit BERT) diseñada específicamente para el procesamiento de voz infantil. HuBERT es un modelo de representación de audio auto-supervisado que aprende a predecir unidades ocultas a partir de señales de audio enmascaradas, y BabyHuBERT ajusta esta arquitectura a las características acústicas de las voces de niños. El modelo presentado aquí es un fine-tuning de BabyHuBERT sobre el dataset PERCEPT-R, que contiene grabaciones de niños pronunciando palabras con el fonema /ɹ/. El entrenamiento se realizó con un enfoque de clasificación binaria (derrótico vs. rótico) y se proporcionan cinco variantes del modelo correspondientes a diferentes pliegues (folds) de validación cruzada, lo que permite evaluar la robustez del clasificador.

No se han publicado detalles específicos sobre el número de tokens de entrenamiento, la composición exacta del dataset o el uso de técnicas como RLHF o DPO. El modelo se carga mediante la clase `BabyHuBERTWrapper` y acepta entradas de audio de 2 segundos a 16 kHz en mono, devolviendo logits y embeddings.

## Capacidades

- Clasificación de audio de /ɹ/ en niños: distingue entre producción derrótica (incorrecta) y rótica (correcta) del fonema.
- Extracción de embeddings de audio: el modelo puede devolver representaciones de características intermedias, útiles para tareas downstream.
- Procesamiento de voz infantil: está específicamente entrenado para las características acústicas de las voces de niños, lo que lo hace más preciso que modelos de habla adulta en este dominio.
- Soporte multilingüe: el dataset PERCEPT-R incluye grabaciones de múltiples idiomas, aunque no se especifica la lista exacta.
- Integración con Transformers: compatible con el pipeline de `audio-classification` de Hugging Face.
- No incluye capacidades de generación de texto, tool calling, agentes ni razonamiento multi-paso; es un modelo puramente discriminativo para audio.

## Casos de uso

- Investigación en desarrollo del habla infantil: permite a logopedas y psicólogos del desarrollo cuantificar automáticamente la producción de /ɹ/ en niños, facilitando estudios longitudinales sobre la adquisición de sonidos.
- Evaluación de intervenciones terapéuticas: puede usarse para medir la mejora en la articulación de /ɹ/ antes y después de sesiones de terapia del habla, proporcionando métricas objetivas.
- Análisis de corpus de voz infantil: los embeddings extraídos pueden alimentar otros modelos para tareas como clasificación de edad, detección de trastornos del habla o análisis de prosodia.
- Desarrollo de herramientas de retroalimentación para padres y educadores: aunque no está aprobado para uso clínico, puede integrarse en aplicaciones educativas no diagnósticas que ayuden a los niños a practicar la pronunciación.
- Investigación en fonética y lingüística: el modelo puede utilizarse para estudiar la variabilidad en la producción de /ɹ/ en diferentes dialectos y edades, contribuyendo a la teoría fonológica.
- Benchmarking de modelos de audio infantil: como parte de la suite ChildVox, sirve como referencia para comparar el rendimiento de otros modelos en la tarea específica de clasificación de /ɹ/.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas numéricas de precisión, F1 u otras, a pesar de que se mencionan `f1` y `accuracy` en los metadatos. No se proporcionan comparaciones con otros modelos en la documentación accesible.

## Requisitos de hardware

- El tamaño del repositorio es de 1,9 GB, lo que sugiere que el modelo completo en precisión FP32 ocupa aproximadamente esa cantidad de memoria. Sin cuantización, se necesitaría al menos 2 GB de VRAM para cargar los pesos, más memoria para la activación.
- Dado que BabyHuBERT es un modelo relativamente pequeño (típicamente del orden de 90 millones de parámetros, aunque no se confirma), es probable que quepa en GPUs de consumo como la RTX 3060 (12 GB) o incluso en GPUs con 8 GB de VRAM si se aplica cuantización.
- No se dispone de datos oficiales sobre latencia o throughput. Para inferencia en CPU, el procesamiento de clips de 2 segundos debería ser factible en tiempo real, pero no hay mediciones publicadas.
- Opciones de despliegue: el modelo se carga mediante `BabyHuBERTWrapper` desde el repositorio de GitHub, y también es compatible con el pipeline de Transformers. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que es un modelo de audio y no de texto.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicamente entrenados para la clasificación de /ɹ/ en niños. El proyecto ChildVox incluye otros modelos (por ejemplo, `childvox-speechmaturity-whisper-large` para madurez del habla), pero no se han publicado comparativas directas entre ellos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Uso fuera de alcance: la model card indica explícitamente que el modelo no debe utilizarse para aplicaciones clínicas o diagnósticas (p. ej., cribado de trastornos del desarrollo o del lenguaje), ni para evaluaciones individuales sin revisión humana experta.
- Prohibición de uso comercial: se declara "no commercial use", lo que restringe su aplicación en productos o servicios comerciales.
- Privacidad y ética: los datos de voz infantil son altamente sensibles. Los usuarios deben obtener aprobación de comités de ética (IRB) y cumplir con las leyes de protección de datos aplicables.
- Riesgo de alucinación: al ser un clasificador binario, no genera texto, por lo que el riesgo de alucinación es bajo, pero puede producir clasificaciones erróneas en audio de baja calidad o con ruido.
- Limitaciones de contexto: la entrada está limitada a 2 segundos de audio, lo que puede no capturar suficiente información para palabras más largas o contextos conversacionales.
- Sesgos potenciales: el modelo se entrenó con un dataset específico (PERCEPT-R) que puede no representar todas las variantes dialectales o sociolectales del /ɹ/, lo que podría afectar su precisión en poblaciones no representadas.

## Enlaces

- Hugging Face: https://huggingface.co/tiantiaf/childvox-percept_r-babyhubert
- Paper (arXiv): https://arxiv.org/abs/2605.29257
- Repositorio GitHub: https://github.com/tiantiaf0627/childvox-release
- Página del proyecto ChildVox: https://tiantiaf0627.github.io/childvox/
- Colección ChildVox en Hugging Face: https://huggingface.co/collections/tiantiaf/childvox
