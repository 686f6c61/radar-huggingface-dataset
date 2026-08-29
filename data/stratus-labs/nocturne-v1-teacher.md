# stratus-labs/nocturne-v1-teacher

## Resumen

Nocturne v1 Teacher es un clasificador bioacústico de especies no aviares desarrollado por Stratus Labs. Cubre los taxones que los modelos centrados en aves como BirdNET o Perch no atienden: insectos, anfibios, mamíferos no aves y reptiles. Se presenta como el "lado nocturno" del paisaje sonoro, ya que la mayoría de estas especies son nocturnas o crepusculares y su señal acústica constituye la mitad del monitoreo de biodiversidad que los modelos ornitológicos ignoran.

El modelo se basa en un Audio Spectrogram Transformer (AST) de aproximadamente 86 millones de parámetros, inicializado desde el checkpoint `MIT/ast-finetuned-audioset-10-10-0.4593`. Su cabeza de clasificación es una capa lineal sobre 2182 especies con pérdida BCE multi-etiqueta. La entrada es un audio mono de 10 segundos a 16 kHz convertido a un espectrograma log-mel de 128 bandas. Se entrenó en una NVIDIA GB10 (DGX Spark) con memoria unificada de 128 GB, usando precisión bf16. Este artefacto es el "teacher" de un proceso de destilación; existe una versión "mini" de 7M parámetros basada en EfficientNet-B1 para despliegue en CPU o edge.

La relevancia actual radica en que el monitoreo acústico pasivo se ha centrado casi exclusivamente en aves, dejando un vacío importante para otros grupos. Nocturne aborda ese hueco con un modelo de código abierto (pesos CC-BY-4.0) y un vocabulario taxonómico amplio, lo que permite a ecólogos y gestores ambientales detectar especies no aviares a partir de grabaciones de campo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio Spectrogram Transformer (AST) |
| Parametros totales | 87.892.886 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 10 segundos de audio (ventana de entrada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | No aplica (clasificación de audio, no texto) |
| Licencia | CC-BY-4.0 (pesos), Apache-2.0 (código) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza un Audio Spectrogram Transformer (AST) preentrenado en AudioSet, con una cabeza lineal de clasificación multi-etiqueta sobre 2182 especies. La entrada se procesa como un espectrograma log-mel de 128 bandas a partir de un audio mono de 10 segundos a 16 kHz. El entrenamiento se realizó en dos fases: primero un calentamiento de la cabeza durante 3 épocas con el backbone congelado, y después un ajuste fino conjunto. Se usó el optimizador AdamW con tasas de aprendizaje de 5e-5 para el backbone y 1e-3 para la cabeza, programación coseno, weight decay 0.01 y grad clip 1.0. La pérdida fue focal BCE con gamma=2.0 para manejar el desequilibrio de clases de cola larga. Se aplicaron aumentos SpecAugment (2x32 máscaras de frecuencia, 2x40 de tiempo) y MixUp con alpha=0.3. El muestreo fue balanceado por frecuencia de clase (sqrt). Se entrenaron 40 épocas con batch de 32, sin acumulación de gradientes, en precisión mixta bf16 con gradient checkpointing. Se entrenaron dos semillas independientes, ambas convergiendo a un macro-F1 de 0.100, lo que sugiere un techo estable para esta receta.

Los datos de entrenamiento incluyen InsectSet459 (26.298 archivos, 459 especies de insectos, licencia CC-BY-4.0) y el subconjunto no ave de iNat Sounds 2024 (25.983 archivos, 1.723 especies, licencia MIT). Además, se expuso el backbone a 111.029 clips de aves de iNat Sounds 2024 (3.846 especies) solo para aprendizaje de representación, sin incluirlas en el vocabulario de salida. En total, el modelo vio aproximadamente 42.000 clips anotados de especies no aviares.

## Capacidades

- Clasificación multi-etiqueta de especies no aviares: insectos (745 especies de iNat + 459 de InsectSet459), anfibios (650), mamíferos no aves (296) y reptiles (32).
- Detección de presencia de especies a partir de grabaciones de audio de 10 segundos, con salida de probabilidades por especie (sigmoid sobre logits).
- Separación de señal de aves frente a no aves, aunque no está afinado para identificación a nivel de especie de aves.
- Inferencia en precisión bf16, con soporte para cargar pesos desde safetensors y un vocabulario JSON.
- No soporta tool calling, agentes ni razonamiento multi-paso, ya que es un modelo de clasificación de audio, no un LLM.
- Capacidades multilingües no aplican; el modelo procesa sonidos, no texto.

## Casos de uso

- Monitoreo acústico pasivo de biodiversidad: el modelo puede analizar grabaciones de campo de larga duración para detectar la presencia de especies no aviares, complementando los estudios que usan BirdNET o Perch. Su ventana de 10 segundos permite procesar archivos largos en segmentos y acumular detecciones por especie.
- Alerta temprana de plagas agrícolas: InsectSet459 incluye una fuerte representación de Orthoptera y Cicadidae, por lo que el modelo puede usarse para detectar señales de plagas en cultivos mediante sensores acústicos, permitiendo intervenciones tempranas.
- Estudios de presencia de anfibios: con 650 especies de anfibios en el vocabulario, el modelo es adecuado para censos de ranas y sapos en humedales o épocas de reproducción, donde los cantos son indicadores clave.
- Investigación ecológica sobre mamíferos nocturnos: los 296 mamíferos no aves incluyen muchos taxones difíciles de observar visualmente; el modelo permite detectar vocalizaciones en grabaciones nocturnas.
- Integración en ciencia ciudadana: aplicaciones móviles o plataformas web pueden usar el modelo para identificar sonidos grabados por voluntarios, ampliando la base de datos de observaciones de especies no aviares.
- Evaluación de impacto ambiental: antes de proyectos de infraestructura, se pueden realizar estudios acústicos de línea base con este modelo para documentar la presencia de especies protegidas o sensibles, siempre con revisión humana posterior.

## Benchmarks y rendimiento

Los resultados de validación se reportan sobre un split de validación retenido de 13.391 muestras, en la época 22 de 40:

| Metrica | Valor |
|---|---|
| macro-F1 | 0.100 |
| micro-F1 | 0.412 |
| mAP (macro) | 0.152 |

Las métricas basadas en umbral usan `sigmoid(logit) > 0.3` por especie. El mAP es independiente del umbral y se considera la métrica más honesta para evaluar la calidad del ranking en aplicaciones downstream. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Inferencia: el modelo tiene ~86M parámetros, por lo que en bf16 ocupa aproximadamente 172 MB de memoria. Cabe en cualquier GPU moderna con al menos 2 GB de VRAM, incluyendo tarjetas de consumo como RTX 3060 o superiores.
- También puede ejecutarse en CPU para inferencia por lotes, aunque la latencia será mayor; no se especifican requisitos mínimos de CPU.
- Entrenamiento: se realizó en una NVIDIA GB10 (DGX Spark) con 128 GB de memoria unificada, pero no se detalla el consumo exacto de VRAM durante el entrenamiento.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con bibliotecas estándar como Hugging Face Transformers, o exportarse a ONNX para inferencia en edge. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de comparaciones directas con otros modelos de clasificación bioacústica no aviar en la información proporcionada. Los modelos más conocidos en el ámbito, BirdNET y Perch, se centran exclusivamente en aves, por lo que no son comparables en cobertura taxonómica. Nocturne ocupa un nicho específico sin competidores directos publicados con licencia abierta.

## Limitaciones y advertencias

- Sesgo de cobertura: el modelo sobrerrepresenta ortópteros y cicádidos de zonas templadas (vía InsectSet459) y regiones con mayor presencia en iNaturalist. Taxones tropicales, anfibios de bosque profundo y la mayoría de reptiles están infrarrepresentados.
- Sesgo de grabación: las grabaciones de iNat son oportunistas y no sistemáticas; la confianza del modelo no debe interpretarse como densidad poblacional.
- Ausencia no equivale a silencio: muchas especies tienen ventanas de llamada estrechas (época de cría, temperatura, hora del día). Un estudio sin detecciones no implica ausencia de la especie.
- Riesgo de doble uso: la localización de especies raras mediante acústica podría facilitar su recolección ilegal. Se recomienda enmascarar las coordenadas GPS precisas en conjuntos de datos públicos generados con este modelo.
- Restricciones de licencia de datos: los usuarios deben cumplir con las licencias de InsectSet459 (CC-BY-4.0) e iNat 2024 (MIT). No se permite redistribuir los clips de entrenamiento originales; el modelo es una obra derivada.
- No es adecuado para detección de ausencia, identificación de aves a nivel de especie, ni ecolocalización de murciélagos (la mayoría supera los 8 kHz, por encima de la frecuencia de muestreo de 16 kHz).
- Para decisiones legales o de conservación, se requiere revisión humana experta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stratus-labs/nocturne-v1-teacher
- Versión mini (estudiante): https://huggingface.co/stratus-labs/nocturne-v1-mini
- Dataset InsectSet459 (Zenodo): https://zenodo.org/records/18554693 (DOI 10.5281/zenodo.18554693)
- Repositorio de código (mencionado en la model card, no se proporciona URL directa)
