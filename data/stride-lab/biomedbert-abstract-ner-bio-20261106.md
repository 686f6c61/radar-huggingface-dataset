# STRIDE-lab/biomedbert-abstract-ner-bio-20261106

## Resumen

biomedbert-abstract-ner-bio-20261106 es un modelo de reconocimiento de entidades nombradas (NER) especializado en textos biomédicos, desarrollado por STRIDE-lab en el marco del proyecto PsyNamic. Se trata de un fine-tuning de `microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract` para extraer dos tipos de entidades de resúmenes científicos: la dosis reportada de sustancias psicodélicas en estudios de sustancia única (por ejemplo, mg o mg/kg) y el área de aplicación. El modelo emplea etiquetado BIO y resuelve la tarea mediante clasificación de tokens con argmax sobre las etiquetas.

Arquitectónicamente es un transformer encoder tipo BERT base, con 108.895.493 parámetros y una ventana de entrada de 512 tokens, suficiente para procesar título y resumen de un artículo científico en una sola pasada. Su relevancia actual radica en que es la versión desplegada en producción en la aplicación web PsyNamic tras la revisión de noviembre de 2026, sustituyendo a la versión inicial `STRIDE-lab/biomedbert-abstract-ner-bio-20250221`.

El modelo está pensado para un dominio muy concreto y con una función acotada: alimentar un pipeline de extracción de parámetros farmacológicos en revisiones sistemáticas, no como un NER biomédico de propósito general. Su licencia Apache 2.0 y su reducido tamaño (0,4 GB de repositorio) facilitan el despliegue en infraestructura modesta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (BiomedBERT-base) |
| Parametros totales | 108.895.493 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 512 tokens (max_length de entrenamiento y uso) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; compatible con cuantizacion estandar de PyTorch/transformers, no documentada por el autor) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de `microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract`, un encoder BERT base preentrenado sobre literatura biomédica. La cabeza de clasificación de tokens produce cinco etiquetas BIO: `O`, `B-Dosage`, `I-Dosage`, `B-Application area` e `I-Application area`. La predicción por token es el argmax sobre las etiquetas, sin umbral adicional (el parámetro `threshold` de 0,5 solo afecta a métricas de validación de tareas multilabel y no tiene efecto aquí).

El entrenamiento se realizó sobre un dataset privado con los siguientes hiperparámetros: batch size 8, learning rate 5e-05, weight decay 0,01, scheduler lineal con warmup ratio 0,1, 30 épocas, dropout 0,1, early stopping con paciencia 5, gradient clipping 1,0 y max_length 512. No se reporta el número de tokens de entrenamiento ni la composición del dataset. La selección del modelo siguió un protocolo riguroso: se fine-tunearon cinco modelos base (BiomedBERT-abstract, BioBERT, BioLinkBERT, ClinicalBERT y SciBERT) con hiperparámetros idénticos; se eligió el checkpoint con menor pérdida de validación (early stopping) y el modelo base se seleccionó por F1 de dosis en validación. El conjunto de test se usó una única vez, tras la selección, lo que reduce el riesgo de sobreajuste a la métrica reportada. No se documenta RLHF, DPO ni innovaciones arquitectónicas adicionales.

## Capacidades

- Reconocimiento de entidades nombradas de dosis en textos biomédicos: extrae valores como mg, mg/kg y rangos de dosis de sustancias psicodélicas en estudios de sustancia única.
- Reconocimiento de entidades de área de aplicación, etiquetadas aunque no formen parte de los parámetros finales del proyecto PsyNamic.
- Etiquetado BIO a nivel de token con predicción por argmax.
- Procesamiento de título y resumen de artículos científicos en una sola pasada de hasta 512 tokens.
- Salida de probabilidades por token mediante softmax, lo que permite umbrales y análisis de confianza posteriores.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento.
- Capacidad multilingüe limitada al inglés; no se documenta soporte de otros idiomas.

## Casos de uso

- Extracción de dosis en revisiones sistemáticas: el modelo identifica menciones de dosis (mg, mg/kg, rangos) en resúmenes de ensayos con psicodélicos, alimentando una base de datos estructurada de parámetros farmacológicos. Es adecuado porque fue entrenado específicamente para este esquema de etiquetas.
- Poblado de la aplicación web PsyNamic: es el modelo desplegado en producción en la webapp del proyecto, por lo que su uso principal es servir predicciones de dosis y área de aplicación a los usuarios de la herramienta.
- Preanotación asistida para anotadores humanos: al generar etiquetas BIO con probabilidades por token, permite a revisores corregir en lugar de anotar desde cero, reduciendo el coste de curación de corpus biomédicos.
- Filtrado y priorización de literatura: procesar por lotes resúmenes de PubMed y marcar aquellos que contienen dosis explícitas, para priorizar la lectura en revisiones sistemáticas.
- Monitorización de farmacología clínica: detección de dosis en resúmenes de estudios de sustancia única para tareas de farmacovigilancia o síntesis de evidencia.
- Pipeline de extracción de información biomédica: integración como componente NER en sistemas mayores que combinan NER, normalización de entidades y extracción de relaciones, aprovechando su bajo coste computacional y su licencia permisiva.
- Investigación en NLP biomédico: servir como baseline reproducible para comparar estrategias de NER de dosis, dado que el autor documenta el protocolo de selección y los hiperparámetros.

## Benchmarks y rendimiento

Resultados en el conjunto de test reservado (97 resúmenes), con intervalos de confianza bootstrap del 95 % (1.000 remuestreos BCa; los valores son medias bootstrap):

| Metrica (test) | Valor [IC 95 %] |
|---|---|
| F1, dosis (reportado en el paper de PsyNamic) | 0,779 [0,631–0,919] |
| Precision, dosis | 0,699 [0,533–0,864] |
| Recall, dosis | 0,883 [0,727–1,000] |
| F1, area de aplicacion | 0,738 [0,660–0,811] |
| F1 global (estricto a nivel de entidad) | 0,702 [0,628–0,771] |

El modelo prioriza el recall sobre la precisión en dosis (0,883 frente a 0,699), coherente con una selección basada en F1 de validación para una tarea de extracción donde los falsos negativos son costosos. No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB para los pesos (108,9 M de parámetros), más overhead de activaciones y tokenizador; en la práctica cabe en cualquier GPU con 2 GB o más.
- GPU recomendadas: no requiere GPU de gama alta; funciona en cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) e incluso en CPU para volúmenes moderados.
- Cabe en GPU consumer: sí, en todas las GPU con al menos 2 GB de VRAM; también en CPU con latencia aceptable para procesamiento por lotes.
- Opciones de despliegue: transformers (PyTorch) de forma nativa, según el ejemplo de uso del autor; también es compatible con frameworks estándar de inferencia para modelos BERT (ONNX Runtime, TorchScript) y con servidores de inferencia que soporten token-classification, aunque el autor solo documenta el uso con `transformers`. No se documenta soporte explícito de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| biomedbert-abstract-ner-bio-20261106 (este) | 108,9 M | 512 | NER de dosis y area de aplicacion en resumenes biomedicos | apache-2.0 | Hugging Face |
| STRIDE-lab/biomedbert-abstract-ner-bio-20250221 | no disponible | 512 (mismo esquema) | NER de dosis y area de aplicacion (version inicial, tag `submission-v1`) | no disponible en la informacion | Hugging Face |
| microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract | no disponible | 512 | Modelo base preentrenado, sin cabeza NER | no disponible en la informacion | Hugging Face |

La comparación con alternativas de la misma categoría (NER biomédico de propósito general como BioBERT, SciBERT o ClinicalBERT) no está disponible con métricas en la información proporcionada; el autor solo indica que estos cinco modelos base fueron fine-tuneados con hiperparámetros idénticos y que BiomedBERT-abstract fue el seleccionado por F1 de dosis en validación.

## Limitaciones y advertencias

- Dominio y tarea muy restringidos: solo etiqueta dosis y área de aplicación en resúmenes de estudios de sustancia única; no es un NER biomédico general.
- Entrenado únicamente en inglés; no se documenta rendimiento en otros idiomas.
- Ventana de contexto de 512 tokens: resúmenes más largos se truncan, con posible pérdida de entidades.
- Dataset de entrenamiento privado y no documentado en composición ni tamaño, lo que dificulta evaluar sesgos de dominio o de muestreo.
- Recall alto pero precisión moderada en dosis (0,699): produce falsos positivos que requieren revisión en producción.
- Intervalos de confianza amplios (F1 de dosis entre 0,631 y 0,919) sobre solo 97 resúmenes de test, lo que implica alta incertidumbre en la estimación.
- Riesgo de alucinación de entidades: como todo modelo de clasificación de tokens, puede etiquetar como dosis fragmentos que no lo son; la salida debe validarse con reglas o revisión humana.
- No se documentan sesgos conocidos ni evaluaciones de robustez fuera del conjunto de test.
- Licencia Apache 2.0: permite uso comercial, pero el modelo se distribuye sin garantías y el autor no documenta condiciones adicionales.
- El área de aplicación se etiqueta pero no forma parte de los parámetros finales del proyecto PsyNamic; su F1 (0,738) no debe interpretarse como rendimiento del sistema completo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/STRIDE-lab/biomedbert-abstract-ner-bio-20261106
- Versión anterior (submission-v1): https://huggingface.co/STRIDE-lab/biomedbert-abstract-ner-bio-20250221
- Modelo base: https://huggingface.co/microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract
- Código del proyecto PsyNamic: https://github.com/Ineichen-Group/PsyNamic
- Aplicación web PsyNamic: https://psynamic.dcr.unibe.ch
- Guías de anotación: https://osf.io/gh6cn
