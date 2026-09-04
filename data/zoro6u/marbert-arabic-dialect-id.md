# zoro6u/marbert-arabic-dialect-id

## Resumen

El modelo `zoro6u/marbert-arabic-dialect-id` es un clasificador de texto especializado en la identificación del dialecto árabe a nivel de país. Fue desarrollado por el usuario `zoro6u` mediante fine-tuning del modelo preentrenado `UBC-NLP/MARBERTv2` sobre el dataset QADI, compuesto por tweets etiquetados con 18 países árabes. El objetivo es resolver un problema recurrente en el procesamiento de lenguaje árabe: la variación dialectal entre países, que dificulta tareas de análisis de sentimiento, traducción o geolocalización.

Arquitectónicamente, es un transformer encoder-only (BERT) con 162.855.186 parámetros, un tamaño que permite su ejecución en GPUs de consumo. La longitud de contexto no está documentada en la información disponible, aunque el entrenamiento se realizó con secuencias de hasta 64 tokens, lo que indica que está optimizado para textos cortos como tuits. La licencia MIT permite uso comercial sin restricciones, y el modelo se distribuye en formato safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder-only transformer) |
| Parametros totales | 162.855.186 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Árabe (ar) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-only basado en `UBC-NLP/MARBERTv2`, un modelo BERT preentrenado en árabe. El fine-tuning se realizó sobre el dataset QADI, compuesto por 440.000 tweets de entrenamiento con 18 etiquetas de país balanceadas. Las etiquetas se generaron automáticamente a partir de los perfiles de los autores, con una precisión estimada del 91,5% según el paper original. El entrenamiento duró 2 épocas, con learning rate 2e-5, batch size 128, longitud máxima de secuencia 64, fp16, warmup de 400 pasos y weight decay 0,01. Se completó en aproximadamente 1 hora y 40 minutos en 2 GPUs T4. No se aplicaron técnicas de RLHF, DPO ni decodificación especulativa; es un fine-tuning supervisado estándar.

## Capacidades

- Clasificación de dialectos árabes a nivel de país en 18 etiquetas: OM, SD, SA, KW, QA, LB, JO, SY, IQ, MA, EG, PL, YE, BH, DZ, AE, TN, LY.
- Optimizado para textos cortos de Twitter, con una longitud máxima de secuencia de 64 tokens en entrenamiento.
- Funciona como clasificador de texto mediante la pipeline de Hugging Face Transformers.
- No soporta tool calling, generación de texto, visión ni audio. Es un modelo exclusivamente de clasificación.

## Casos de uso

- Análisis de audiencia en redes sociales: permite identificar el país de origen de los usuarios a partir de sus tuits, útil para campañas de marketing o estudios de opinión regional. El modelo es adecuado porque fue entrenado específicamente sobre tweets y cubre 18 países árabes.
- Enrutamiento de atención al cliente: las consultas de usuarios árabes pueden clasificarse por dialecto para asignarlas a agentes que hablen esa variante. La clasificación automática reduce el tiempo de derivación y mejora la experiencia del usuario.
- Normalización de corpus para NLP: antes de entrenar otros modelos de lenguaje árabe, es útil etiquetar los textos por dialecto. Este modelo permite anotar grandes volúmenes de tweets de forma automática, facilitando la creación de datasets dialectales.
- Investigación sociolingüística: permite estudiar la distribución geográfica de variantes dialectales en Twitter y analizar diferencias de uso entre países. El modelo ofrece una granularidad de 18 clases con métricas de F1 por dialecto.
- Filtrado de contenido regional: plataformas de contenido pueden clasificar publicaciones por país para aplicar políticas de moderación o recomendaciones geolocalizadas. La clasificación por dialecto es una señal útil cuando no se dispone de metadatos de ubicación.
- Mejora de sistemas de traducción automática: la identificación previa del dialecto permite seleccionar un modelo de traducción más adecuado para esa variante, evitando traducciones genéricas en árabe estándar. El modelo puede integrarse como etapa previa en un pipeline de traducción.

## Benchmarks y rendimiento

Se han publicado resultados de evaluación en el conjunto de test de QADI. La tabla siguiente muestra el F1 macro y la comparación con una línea base.

| Métrica | Valor |
|---|---|
| Macro-F1 (test) | 0.614 |
| Baseline TF-IDF + LinearSVC | 0.582 |
| QADI paper (original) | 0.606 |

F1 por dialecto en el conjunto de test:

| Dialecto | F1 |
|---|---|
| OM | 0.52 |
| SD | 0.72 |
| SA | 0.54 |
| KW | 0.65 |
| QA | 0.55 |
| LB | 0.73 |
| JO | 0.49 |
| SY | 0.51 |
| IQ | 0.68 |
| MA | 0.71 |
| EG | 0.85 |
| PL | 0.63 |
| YE | 0.41 |
| BH | 0.46 |
| DZ | 0.66 |
| AE | 0.51 |
| TN | 0.66 |
| LY | 0.78 |

Los mejores resultados se obtienen en EG, LY, LB, SD y MA. Los peores se concentran en el clúster del Golfo y YE, donde los dialectos son muy próximos entre sí y los tweets son cortos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en FP32 o 0,5 GB en FP16, incluyendo overhead de inferencia. El modelo tiene 162.855.186 parámetros.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA T4, RTX 3060 o superiores. Es apto para ejecución en GPUs de consumo.
- Opciones de despliegue: Hugging Face Transformers (pipeline de text-classification), ONNX Runtime, TorchServe. Al ser un modelo encoder-only, no es compatible con vLLM, llama.cpp ni Ollama, que están orientados a modelos generativos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El único baseline publicado es TF-IDF + LinearSVC, que obtiene un macro-F1 de 0.582 frente al 0.614 del modelo.

## Limitaciones y advertencias

- Las etiquetas son a nivel de autor, no de texto, lo que introduce ruido en el entrenamiento y en la evaluación.
- El modelo fue entrenado exclusivamente con tweets; se espera una precisión menor en texto formal, artículos o documentos largos.
- Los errores de clasificación son mayores en dialectos del Golfo y en YE, donde las variantes son muy similares entre sí.
- Las puntuaciones F1 por dialecto tienen intervalos de error amplios, ya que el conjunto de test contiene entre 181 y 1130 muestras por clase.
- Al ser un clasificador, no genera texto, por lo que el riesgo de alucinación es bajo; sin embargo, puede producir falsos positivos en la asignación de dialectos.
- La licencia MIT permite uso comercial, pero el rendimiento en dominios distintos de Twitter no está garantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zoro6u/marbert-arabic-dialect-id
- Código y baseline: https://github.com/zoro6u/arabic-dialect-id
- Modelo base MARBERTv2: https://huggingface.co/UBC-NLP/MARBERTv2
