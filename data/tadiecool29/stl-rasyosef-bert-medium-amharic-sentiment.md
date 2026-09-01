# tadiecool29/STL-rasyosef-bert-medium-amharic-sentiment

## Resumen

El modelo `STL-rasyosef-bert-medium-amharic-sentiment` es un ajuste fino (fine-tuning) del modelo `rasyosef/bert-medium-amharic`, un BERT de tamaño medio preentrenado sobre 290 millones de tokens de texto en amhárico. El autor, `tadiecool29`, lo ha adaptado específicamente para la clasificación de sentimiento en este idioma, una tarea con escasos recursos disponibles en el ecosistema de modelos abiertos. Con 40,4 millones de parámetros y una ventana de contexto de 512 tokens, ofrece una solución ligera y desplegable en entornos con recursos limitados.

La relevancia de este modelo radica en que el amhárico es una lengua etíope con poca representación en los modelos multilingües dominantes. Al partir de un BERT preentrenado específicamente para amhárico, el ajuste fino consigue métricas razonables de clasificación de sentimiento (F1 de 0,6918) con un coste computacional mínimo. El modelo se distribuye en formato `safetensors` y es compatible con la librería `transformers`, lo que facilita su integración en pipelines de procesamiento de lenguaje natural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer) |
| Parametros totales | 40.427.523 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | amhárico |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `rasyosef/bert-medium-amharic` es un BERT de tamaño medio, con una arquitectura de encoder transformer estándar. Según el repositorio del autor original, se preentrenó sobre 290 millones de tokens de texto amhárico, con un vocabulario de 28.672 tokens y una longitud de contexto de 512 tokens. El ajuste fino se realizó sobre un dataset de sentimiento no especificado, utilizando los siguientes hiperparámetros: tasa de aprendizaje de 1e-5, tamaño de lote de 16 para entrenamiento y 32 para evaluación, 10 épocas, optimizador AdamW con betas (0.9, 0.999), scheduler de tasa de aprendizaje coseno con 300 pasos de calentamiento y precisión mixta nativa (AMP). No se menciona el uso de técnicas como RLHF o DPO; el entrenamiento es un fine-tuning supervisado clásico.

## Capacidades

- Clasificación de sentimiento en texto amhárico: el modelo asigna una etiqueta de sentimiento (probablemente positiva, negativa o neutral) a fragmentos de texto.
- Procesamiento de secuencias de hasta 512 tokens, suficiente para la mayoría de frases y párrafos cortos.
- Inferencia rápida y ligera gracias a su tamaño reducido (40M parámetros), apta para entornos con CPU o GPU de baja capacidad.
- No soporta tool calling, generación de código, razonamiento multi-paso ni capacidades multimodales; es un modelo exclusivamente discriminativo para clasificación de texto.

## Casos de uso

- Análisis de opiniones en redes sociales: el modelo puede clasificar tweets, publicaciones de Facebook o comentarios en amhárico para medir la opinión pública sobre un tema o producto. Su tamaño reducido permite procesar grandes volúmenes de texto en tiempo real.
- Monitoreo de marca: empresas que operan en Etiopía pueden integrar el modelo en un pipeline de escucha social para detectar menciones negativas o positivas de sus productos y responder proactivamente.
- Análisis de comentarios en noticias: medios de comunicación y agencias de investigación pueden clasificar los comentarios de los lectores en artículos en amhárico para entender el tono general de la audiencia.
- Investigación académica en PLN para lenguas de bajos recursos: el modelo sirve como punto de partida para experimentos de análisis de sentimiento en amhárico, permitiendo comparar con otros enfoques o como base para nuevos fine-tunings.
- Moderación de contenido: plataformas que reciben contenido generado por usuarios en amhárico pueden usar el modelo para detectar mensajes con sentimiento negativo extremo (por ejemplo, discursos de odio) y derivarlos a revisión humana.
- Asistencia a la toma de decisiones en organizaciones internacionales: ONGs o agencias gubernamentales pueden analizar informes, encuestas o comentarios ciudadanos en amhárico para evaluar el clima social en regiones concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks externos (MMLU, HumanEval, etc.) para este modelo. La model card del autor reporta las siguientes métricas de evaluación sobre un conjunto de validación no especificado:

| Metrica | Valor |
|---|---|
| Loss (validación) | 0,7579 |
| Precision (sentimiento) | 0,6921 |
| Recall (sentimiento) | 0,6954 |
| F1 (macro) | 0,6918 |
| Accuracy (sentimiento) | 0,6995 |

Estos valores corresponden a la última época de entrenamiento (época 7 de 10). No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: aproximadamente 160 MB en precisión fp32 (40M parámetros × 4 bytes). Con cuantización a int8, se reduciría a unos 40 MB, aunque no se ofrecen versiones cuantizadas oficiales.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, incluyendo tarjetas de consumo como GTX 1050, RTX 2060 o superiores. También puede ejecutarse en CPU con razonable velocidad para inferencia por lotes.
- Es un modelo que cabe en cualquier GPU consumer moderna y también en entornos sin GPU.
- Opciones de despliegue: al ser un modelo de `transformers`, puede servirse con `vLLM`, `TGI`, `Ollama` (si se convierte a GGUF) o directamente con `pipeline` de Hugging Face. Para inferencia en CPU, `llama.cpp` o `ONNX Runtime` son alternativas viables.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamaño, se espera una latencia de milisegundos por muestra en GPU y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de otros modelos de análisis de sentimiento en amhárico para una comparación cuantitativa. A continuación se comparan las características principales con el modelo base y otro fine-tune del mismo autor:

| Modelo | Parametros | Contexto | Tarea | F1 (reportado) |
|---|---|---|---|---|
| `tadiecool29/STL-rasyosef-bert-medium-amharic-sentiment` | 40,4M | 512 | Sentimiento | 0,6918 |
| `rasyosef/bert-medium-amharic` (base) | 40,4M | 512 | Modelo de lenguaje enmascarado | no aplicable |
| `tadiecool29/STL-rasyosef-bert-medium-amharic-finetuned-sentiment-stance` | 40,4M (estimado) | 512 | Sentimiento y postura | no disponible |

El modelo base no está adaptado para clasificación, por lo que no es directamente comparable. El segundo modelo del mismo autor aborda una tarea similar pero no se han publicado sus métricas.

## Limitaciones y advertencias

- El dataset de entrenamiento no está especificado, lo que impide evaluar posibles sesgos demográficos, temáticos o de registro lingüístico.
- Las métricas reportadas (F1 ≈ 0,69) indican un rendimiento moderado; el modelo puede fallar en textos con ironía, sarcasmo o lenguaje coloquial complejo.
- La licencia no está declarada, por lo que su uso comercial conlleva incertidumbre legal. Se recomienda contactar con el autor antes de desplegarlo en producción.
- Solo soporta amhárico; no es multilingüe y no funcionará correctamente con otros idiomas.
- La ventana de contexto de 512 tokens limita el análisis de documentos largos; para textos extensos sería necesario dividirlos en fragmentos.
- Al ser un modelo discriminativo, no puede generar texto ni mantener conversaciones; su uso se limita a clasificación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tadiecool29/STL-rasyosef-bert-medium-amharic-sentiment
- Repositorio del modelo base: https://github.com/rasyosef/bert-amharic
- Modelo relacionado del mismo autor: https://huggingface.co/tadiecool29/STL-rasyosef-bert-medium-amharic-finetuned-sentiment-stance
- Repositorio de clasificación de sentimiento en amhárico: https://github.com/rasyosef/amharic-sentiment-classification
