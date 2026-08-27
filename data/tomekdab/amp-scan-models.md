# tomekdab/amp-scan-models

## Resumen

AMP-Scan models es un conjunto de modelos de aprendizaje automático desarrollados por tomekdab para la predicción de péptidos antimicrobianos (AMP), integrados en el proyecto de código abierto [ai-amp-search](https://github.com/tomdabro/ai-amp-search). El repositorio contiene cuatro artefactos: un clasificador basado en embeddings de ESM-2 con regresión logística, un clasificador de toxicidad hemolítica, un modelo GPT a nivel de caracteres entrenado sobre secuencias AMP y una versión fine-tuned de ESM-2 con cabeza de clasificación. El objetivo principal es identificar péptidos con actividad antimicrobiana y evaluar su seguridad, un paso crítico en el descubrimiento de nuevos antibióticos frente a la resistencia bacteriana.

El modelo se distribuye bajo licencia MIT y está pensado para su uso en pipelines de biología computacional y descubrimiento de fármacos. Aunque el pipeline_tag de HuggingFace indica text-classification, en realidad se trata de clasificación de secuencias de proteínas. Los modelos son ligeros (el más grande ocupa 134 MB) y pueden ejecutarse en hardware modesto, lo que facilita su integración en flujos de trabajo de investigación. La relevancia actual radica en la creciente necesidad de herramientas rápidas y accesibles para el cribado de péptidos antimicrobianos, especialmente ante la crisis global de resistencia a antibióticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla: ESM-2 embeddings + regresión logística, GPT de caracteres, ESM-2 fine-tuned con cabeza de clasificación |
| Parametros totales | 2,69M (GPT) + 35M (ESM-2 fine-tuned) + modelos lineales (3 KB cada uno) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (las secuencias de proteínas se procesan por embeddings, sin ventana de contexto explícita) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en formato joblib y .pt, sin cuantización publicada) |
| Idiomas soportados | en (inglés en la documentación; las secuencias son aminoácidos, no lenguaje natural) |
| Licencia | MIT (código); los datos de terceros tienen sus propios términos |
| Formato de pesos | joblib (modelos lineales), .pt (PyTorch para GPT y ESM-2 fine-tuned) |

## Arquitectura y entrenamiento

El repositorio combina varias arquitecturas. El clasificador principal usa embeddings de ESM-2 (modelo de lenguaje de proteínas de Facebook AI) congelados y una regresión logística entrenada sobre esos embeddings. ESM-2 es un transformer basado en la arquitectura BERT adaptada a secuencias de aminoácidos. El modelo GPT es un transformer decoder a nivel de caracteres con 2,69 millones de parámetros, entrenado para generar secuencias de péptidos antimicrobianos. El tercer modelo fine-tunea ESM-2 (versión de 35M parámetros) con una cabeza de clasificación añadida, ajustando todos los pesos del transformer.

Los datos de entrenamiento provienen de tres fuentes: GRAMPA (6.642 secuencias AMP únicas con valores de MIC frente a E. coli), ConsAMPHemo (884 péptidos etiquetados como hemolíticos o no hemolíticos) y UniProt (secuencias no AMP como negativos). No se menciona el uso de RLHF ni DPO; el entrenamiento es supervisado estándar. Una innovación destacable es la evaluación honesta con control de homología: el autor advierte que la división aleatoria naive infla el AUC a 1.000 por fugas de homología, y proporciona una métrica corregida con agrupamiento por similitud de k-mers (AUC 0.971).

## Capacidades

- Clasificación de péptidos antimicrobianos: predice si una secuencia de aminoácidos tiene actividad antimicrobiana (probabilidad de ser AMP).
- Evaluación de toxicidad hemolítica: clasifica péptidos como hemolíticos o no hemolíticos, útil para filtrar candidatos tóxicos.
- Generación de secuencias AMP: el modelo GPT de caracteres puede generar nuevas secuencias peptídicas plausibles, aunque no se documenta su uso directo en el pipeline.
- Fine-tuning de ESM-2: el modelo fine-tuned ofrece una alternativa de mayor precisión (acc 0.956, AUC 0.990) para clasificación directa.
- Integración con embeddings de ESM-2: permite reutilizar representaciones de proteínas para otras tareas de clasificación.
- Multilingüe en el sentido biológico: trabaja con secuencias de aminoácidos, no con idiomas humanos; la documentación está en inglés.

## Casos de uso

- Cribado de bibliotecas peptídicas: dado un conjunto de secuencias candidatas (por ejemplo, de fagos o síntesis combinatoria), el clasificador puede priorizar aquellas con mayor probabilidad de actividad antimicrobiana, reduciendo el número de ensayos experimentales necesarios.
- Descubrimiento de antibióticos: investigadores pueden usar el modelo para identificar nuevos péptidos con potencial terapéutico frente a bacterias resistentes, combinando la predicción de AMP con el filtro de hemólisis para descartar compuestos tóxicos.
- Validación de péptidos sintéticos: antes de sintetizar un péptido, se puede ejecutar el modelo para estimar su actividad y toxicidad, ahorrando costes de laboratorio.
- Generación de nuevas secuencias: el GPT de caracteres puede proponer variantes de péptidos conocidos, que luego se puntúan con el clasificador para seleccionar las más prometedoras.
- Pipeline de descubrimiento de fármacos automatizado: el proyecto ai-amp-search integra entrenamiento, puntuación, generación y evaluación, permitiendo iterar sobre grandes volúmenes de secuencias sin intervención manual.
- Educación e investigación en biología computacional: el modelo sirve como ejemplo didáctico de aplicación de modelos de lenguaje de proteínas a una tarea de clasificación con evaluación rigurosa de homología.

## Benchmarks y rendimiento

Los resultados publicados en la model card se resumen en la siguiente tabla. No se proporcionan comparaciones con otros modelos en la información disponible.

| Modelo | Métrica | Valor |
|---|---|---|
| Clasificador AMP (ESM-2 embeddings + regresión logística) | Accuracy (split naive) | 0.992 |
| Clasificador AMP (idem) | AUC (split naive) | 1.000 |
| Clasificador AMP (idem) | AUC (split controlado por homología) | 0.971 |
| Clasificador AMP (idem) | AUC por longitud [5,20] | 0.959 |
| Clasificador AMP (idem) | AUC por longitud [21,50] | 0.972 |
| Clasificador de hemólisis | Accuracy | 0.994 |
| Clasificador de hemólisis | AUC | 0.998 |
| GPT de caracteres | Perplejidad de validación (mejor época) | 10.13 |
| ESM-2 fine-tuned | Accuracy | 0.956 |
| ESM-2 fine-tuned | AUC | 0.990 |

El autor advierte explícitamente que el AUC de 1.000 en el split naive está inflado por fugas de homología, y que la métrica honesta es 0.971 con control de homología. No se han publicado resultados en benchmarks estándar como MMLU o HumanEval, ya que no es un modelo de lenguaje general.

## Requisitos de hardware

- El clasificador de embeddings (joblib) es extremadamente ligero (3 KB) y puede ejecutarse en cualquier CPU, incluso en un portátil sin GPU.
- El GPT de caracteres (10 MB) también es trivial para CPU; la inferencia es casi instantánea.
- El modelo ESM-2 fine-tuned (134 MB) requiere más recursos: una GPU con al menos 2 GB de VRAM es suficiente para inferencia en lotes pequeños, aunque también puede ejecutarse en CPU con mayor latencia.
- Para el fine-tuning de ESM-2 se recomienda una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 2070 o superior) para entrenar en el dataset completo.
- Opciones de despliegue: al ser modelos de transformers y joblib, se pueden servir con Hugging Face Inference Endpoints, o integrar en scripts Python con torch y joblib. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no son modelos de lenguaje generativos estándar.
- Latencia estimada: para el clasificador de embeddings, la inferencia de una secuencia tarda milisegundos en CPU; para ESM-2 fine-tuned, decenas de milisegundos en GPU.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparación cuantitativa con otros modelos de predicción de AMP en la información proporcionada. Existen alternativas como AMP Scanner v2 (dan-veltri/amp-scanner-v2) que usa redes neuronales convolucionales, pero no se han encontrado datos de rendimiento comparables en la búsqueda web. La comparación cualitativa se limita a lo siguiente:

| Modelo | Arquitectura | Tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|
| AMP-Scan (este) | ESM-2 + regresión logística / GPT / ESM-2 fine-tuned | 2,69M - 35M | MIT | HuggingFace, GitHub |
| AMP Scanner v2 | CNN (TensorFlow) | no disponible | no disponible | GitHub |
| Modelos de AMP en general | Varía (CNN, LSTM, transformers) | no disponible | varía | varía |

Se recomienda consultar la literatura especializada para comparaciones rigurosas.

## Limitaciones y advertencias

- Sesgo de homología: el rendimiento en splits aleatorios está inflado; la métrica honesta (AUC 0.971) es la que debe usarse para evaluar generalización a secuencias nuevas.
- Riesgo de alucinación en el GPT de caracteres: el modelo generativo puede producir secuencias no válidas o sin actividad real; siempre debe validarse con el clasificador y ensayos experimentales.
- Limitación de datos: los datos de entrenamiento provienen de fuentes específicas (GRAMPA, ConsAMPHemo, UniProt) y pueden no cubrir toda la diversidad de péptidos antimicrobianos, especialmente los de organismos no modelados.
- Toxicidad hemolítica: el clasificador de hemólisis se entrenó con solo 884 péptidos, lo que limita su robustez en poblaciones diversas.
- Licencia de datos: aunque el código es MIT, los datos de terceros (UniProt es CC-BY-4.0, GRAMPA y ConsAMPHemo tienen sus propios términos) pueden imponer restricciones adicionales para uso comercial.
- Sin soporte de tool calling ni agentes: no es un modelo de lenguaje conversacional; su uso se limita a clasificación y generación de secuencias.
- Documentación en inglés: la model card y el repositorio están en inglés, lo que puede ser una barrera para algunos usuarios hispanohablantes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tomekdab/amp-scan-models
- Repositorio GitHub del proyecto: https://github.com/tomdabro/ai-amp-search
- Paper de GRAMPA (Witten & Witten 2019, bioRxiv): no disponible en la búsqueda, pero referenciado en la model card
- Paper de ConsAMPHemo (Xie et al. 2025, Protein Science): no disponible en la búsqueda, pero referenciado en la model card
- UniProt: https://www.uniprot.org/ (fuente de datos negativos)
