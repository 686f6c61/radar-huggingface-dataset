# STRIDE-lab/biobert-age-of-participants-20261106

## Resumen

biobert-age-of-participants-20261106 es un modelo de clasificación de texto biomédico desarrollado por STRIDE-lab en el marco del proyecto PsyNamic, una iniciativa de la Universidad de Berna (webapp en psynamic.dcr.unibe.ch). El modelo resuelve una tarea concreta de extracción de metadatos en literatura científica: determinar la categoría de edad de la población de estudio a partir del título y el resumen de un artículo, con cuatro etiquetas posibles (pediátrica, adulta, desconocida y no aplicable) en un esquema multi-etiqueta.

Técnicamente es un fine-tuning de dmis-lab/biobert-v1.1, un BERT-base de 108,3 millones de parámetros preentrenado sobre literatura biomédica (PubMed). El modelo resultante mantiene la arquitectura transformer encoder de BERT con una cabeza de clasificación de 4 salidas y un contexto máximo de 512 tokens. El repositorio ocupa 0,4 GB en formato safetensors y se distribuye bajo licencia Apache 2.0.

Su relevancia es acotada pero clara: sustituye a la versión anterior basada en PubMedBERT (STRIDE-lab/pubmedbert-age-of-participants-20250221) tras una revisión de noviembre de 2026, y es el checkpoint efectivamente desplegado en la webapp de PsyNamic. La selección del modelo base se hizo comparando cinco encoders biomédicos (BiomedBERT-abstract, BioBERT, BioLinkBERT, ClinicalBERT y SciBERT) con hiperparámetros idénticos, eligiendo BioBERT por mejor F1 ponderado en validación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base), clasificación de secuencias multi-etiqueta |
| Parametros totales | 108.313.348 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens (max_length de entrenamiento e inferencia) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; admite cuantización estándar de PyTorch/ONNX no documentada por el autor) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers/PyTorch) |

## Arquitectura y entrenamiento

El modelo es un BERT-base estándar (12 capas, 768 dimensiones ocultas, 12 cabezas de atención, ~110M parámetros) inicializado desde dmis-lab/biobert-v1.1, que a su vez parte de BERT-base y se preentrena sobre corpus biomédicos (PubMed abstracts y PMC full text). Sobre esa base se añade una cabeza `AutoModelForSequenceClassification` con 4 logits y se aplica activación sigmoide por etiqueta, dado que la tarea es multi-etiqueta.

El fine-tuning se realizó sobre un dataset privado no publicado, con batch size 8, learning rate 5e-5, weight decay 0,01, scheduler lineal con warmup del 10 %, 30 épocas máximas, dropout 0,1, gradient clipping 1,0 y early stopping con paciencia 5 (se conserva el checkpoint de menor pérdida de validación). No se documenta el número de tokens de entrenamiento ni la composición exacta del conjunto. La selección del modelo base se hizo sobre validación (F1 ponderado) entre cinco candidatos; el test se usó una única vez tras la selección. El umbral de predicción desplegado es 0,04, ajustado en validación mediante una regla preespecificada: partir del umbral con F1 ponderado máximo y bajarlo mientras la precisión ponderada se mantenga a menos de 0,05 de su valor en ese punto. El valor 0,5 que aparece en la configuración de entrenamiento solo se usó para métricas internas y no afecta a los pesos.

## Capacidades

- Clasificación multi-etiqueta de textos biomédicos (título + resumen) en cuatro categorías de edad de la población: pediátrica (<18 años), adulta (≥18 años), desconocida y no aplicable.
- Manejo de documentos de hasta 512 tokens con truncación automática.
- Predicción simultánea de varias etiquetas por documento (una misma publicación puede marcar, por ejemplo, población pediátrica y adulta).
- Umbral de decisión calibrado para priorizar recall (0,990 en test) a costa de precisión (0,843).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés; no se ha entrenado ni evaluado en otros idiomas.
- No es un modelo generativo: no produce texto libre, solo logits de clasificación.

## Casos de uso

- Enriquecimiento de bases de datos bibliográficas: procesar lotes de resúmenes PubMed para etiquetar automáticamente la franja de edad de la población estudiada y habilitar filtros de búsqueda por población pediátrica o adulta en repositorios internos.
- Revisión sistemática asistida: cribar miles de abstracts en una revisión sobre un tema pediátrico, priorizando los marcados como "Pediatric" y descartando los marcados exclusivamente como "Adult" antes de la lectura manual.
- Construcción de cohortes de evidencia: agregar publicaciones por grupo de edad para analizar sesgos de representación (por ejemplo, proporción de estudios pediátricos en un área terapéutica).
- Integración en pipelines de vigilancia científica: clasificar flujos RSS o resultados de la API de PubMed en tiempo casi real; el modelo es pequeño (0,4 GB) y cabe en CPU, lo que permite despliegue barato a escala.
- Anotación previa para anotadores humanos: generar etiquetas candidatas con alta sensibilidad (recall 0,990) que los revisores corrigen, reduciendo el tiempo de anotación manual.
- Servicio de metadatos en plataformas de literatura: exponer la predicción vía API (por ejemplo, con Text Embeddings Inference o un endpoint de transformers) para que herramientas de gestión bibliográfica etiqueten automáticamente artículos importados.
- Filtrado en revisiones de pediatría clínica: descartar rápidamente estudios sin población pediátrica en flujos de trabajo de sociedades científicas o agencias regulatorias.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto de test reservado (98 abstracts), con umbral ajustado 0,04 e intervalos de confianza bootstrap del 95 % (1.000 remuestras BCa):

| Metrica (test) | Valor [IC 95 %] |
|---|---|
| F1 ponderado | 0,900 [0,829–0,939] |
| Precisión ponderada | 0,843 [0,734–0,905] |
| Recall ponderado | 0,990 [0,952–1,000] |

No se han publicado resultados comparativos frente a otros modelos en la información disponible, más allá de la mención cualitativa de que BioBERT fue el mejor de cinco encoders biomédicos en validación (sin cifras por modelo). El tamaño del test (98 abstracts) implica intervalos de confianza amplios, especialmente en precisión.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,5 GB (108M parámetros × 4 bytes más overhead de activaciones para batch pequeño); en fp16 aproximadamente 0,25 GB.
- Cabe holgadamente en cualquier GPU consumer, incluida una GTX 1650 (4 GB) o incluso en CPU para lotes moderados.
- GPU recomendadas para alto throughput: A100, H100, L4 o RTX 4090 para procesar grandes corpus en paralelo; para uso interactivo, cualquier GPU con ≥4 GB es suficiente.
- Opciones de despliegue: transformers (PyTorch), Text Embeddings Inference (el repo está marcado como compatible con endpoints), ONNX Runtime, TorchScript; también es viable exportarlo a un formato cuantizado para CPU.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera un throughput alto en GPU (miles de abstracts por minuto en batch), pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| STRIDE-lab/biobert-age-of-participants-20261106 | 108,3M | 512 | Clasificación multi-etiqueta de edad de población | Apache 2.0 | Hugging Face |
| STRIDE-lab/pubmedbert-age-of-participants-20250221 | no disponible (base PubMedBERT) | 512 | Misma tarea (versión anterior, `submission-v1`) | no disponible | Hugging Face |
| dmis-lab/biobert-v1.1 (modelo base) | ~110M | 512 | Representaciones/encoder biomédico, sin cabeza de tarea | Apache 2.0 | Hugging Face |

La comparación cuantitativa con la versión PubMedBERT anterior no está publicada en la información disponible; el autor solo indica que el nuevo checkpoint la sustituye tras la revisión. Frente a los otros encoders evaluados (BiomedBERT-abstract, BioLinkBERT, ClinicalBERT, SciBERT), no se aportan métricas por modelo, solo la selección final por F1 ponderado en validación.

## Limitaciones y advertencias

- Entrenado y evaluado únicamente en inglés; no hay evidencia de generalización a abstracts en otros idiomas.
- El conjunto de test es muy pequeño (98 abstracts), por lo que las métricas tienen intervalos de confianza amplios y pueden no reflejar el rendimiento en dominios distintos (por ejemplo, resúmenes de ensayos clínicos regulatorios o literatura no indexada en PubMed).
- El umbral 0,04 está calibrado para maximizar recall; en producción producirá falsos positivos frecuentes (precisión ponderada 0,843). Si el caso de uso exige alta precisión, habrá que reajustar el umbral.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de etiquetado erróneo en abstracts ambiguos, con poblaciones mixtas o con información de edad implícita.
- El dataset de entrenamiento es privado y no se documenta su composición, tamaño ni posibles sesgos de muestreo (por ejemplo, sobrerrepresentación de ciertas áreas terapéuticas o revistas).
- La etiqueta "Unknown" y "Not applicable" pueden confundirse con facilidad en textos donde la edad no se menciona explícitamente; el modelo no explica sus predicciones.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene validar el modelo en el dominio concreto antes de desplegarlo.
- El modelo no es generativo: no puede redactar resúmenes, responder preguntas ni extraer la edad concreta en años, solo la categoría.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/STRIDE-lab/biobert-age-of-participants-20261106
- Versión anterior (PubMedBERT): https://huggingface.co/STRIDE-lab/pubmedbert-age-of-participants-20250221
- Modelo base BioBERT: https://huggingface.co/dmis-lab/biobert-v1.1
- Código del proyecto PsyNamic: https://github.com/Ineichen-Group/PsyNamic
- Webapp PsyNamic: https://psynamic.dcr.unibe.ch
- Guías de anotación: https://osf.io/gh6cn
