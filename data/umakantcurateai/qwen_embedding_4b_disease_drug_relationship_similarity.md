# umakantcurateai/qwen_embedding_4b_disease_drug_relationship_similarity

## Resumen

Este modelo es un fine-tuning del embedding model Qwen3-Embedding-4B, desarrollado por el usuario umakantcurateai, especializado en capturar relaciones terapéuticas entre enfermedades y fármacos. A partir de una descripción de enfermedad como consulta, genera embeddings densos que acercan en el espacio vectorial los medicamentos indicados para esa patología y alejan los no relacionados. Se trata de un ejercicio educativo de fine-tuning contrastivo, no de una herramienta clínica validada.

El modelo se construyó mediante LoRA sobre la base unsloth/Qwen3-Embedding-4B, con los adaptadores fusionados en los pesos finales (16-bit). El entrenamiento usó 2.950 pares ancla-positivo extraídos de las bases de datos DISEASE y DRUG, con la función de pérdida MultipleNegativesRankingLoss. El resultado es un modelo independiente, listo para usar con sentence-transformers, con 4.021 millones de parámetros y licencia Apache 2.0.

Su relevancia radica en demostrar cómo el fine-tuning de modelos de embeddings de propósito general puede adaptarse a dominios específicos con pocos datos, aunque sus limitaciones (dataset reducido, sin validación clínica) lo hacen adecuado solo para experimentación y aprendizaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3-Embedding-4B) |
| Parametros totales | 4.021.774.336 (4,02B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32K (segun documentacion del modelo base) |
| Tipos de cuantizacion | No disponible (repo en FP16, sin cuantizaciones publicadas) |
| Idiomas soportados | No disponible (el modelo base soporta mas de 100 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-Embedding-4B, un modelo denso de la familia Qwen3 diseñado especificamente para tareas de embedding y reranking. Sobre esta base se aplico un fine-tuning con LoRA (r=32, alpha=32) dirigido a las proyecciones q/k/v/o/gate/up/down, fusionando posteriormente los adaptadores en los pesos del modelo para obtener un unico archivo de pesos en 16-bit.

El entrenamiento utilizo la funcion de perdida MultipleNegativesRankingLoss, que trata todos los positivos de un lote como negativos en-lote para cada ancla. Para evitar que una misma enfermedad (que puede tener varios farmacos asociados) apareciera dos veces en el mismo lote y fuera tratada incorrectamente como negativo de si misma, se empleo un muestreo de lotes con la estrategia NO_DUPLICATES. Se entrenaron 4 epocas con un tamaño de lote efectivo de 32 (8 por dispositivo con acumulacion de gradiente de 4) y una tasa de aprendizaje de 3e-5 constante con warmup.

El dataset de entrenamiento se construyo a partir de las bases de datos DISEASE y DRUG, usando el campo DESCRIPTION de cada enfermedad (combinado con su nombre) como ancla y los farmacos terapeuticos listados como positivos. El conjunto contiene 2.950 pares deduplicados y se dividio por enfermedad (no por fila) para evitar solapamiento entre entrenamiento y evaluacion.

## Capacidades

- Generacion de embeddings densos para similitud semantica entre frases, especificamente orientados a relaciones enfermedad-farmaco.
- Busqueda de farmacos relevantes para una descripcion de enfermedad mediante similitud coseno.
- Integracion con la libreria sentence-transformers para codificacion de consultas y candidatos.
- Compatible con text-embeddings-inference y endpoints de Hugging Face.
- No es un modelo generativo: solo produce representaciones vectoriales, sin generacion de texto.
- No soporta tool calling, agentes ni razonamiento multi-paso, al ser un modelo de embeddings puro.

## Casos de uso

- Sistema de recomendacion de farmacos para investigacion: dado un texto de sintomas o diagnostico, el modelo devuelve los medicamentos mas cercanos en el espacio vectorial, util para explorar candidatos en fases preliminares de estudios academicos.
- Indexacion semantica de literatura biomedica: permite organizar articulos cientificos por similitud entre descripciones de enfermedades y farmacos mencionados, facilitando busquedas por contenido.
- Filtrado de pares enfermedad-farmaco en bases de datos: puede usarse para pre-seleccionar pares plausibles antes de una validacion manual, reduciendo el trabajo de curacion.
- Demo educativa de fine-tuning contrastivo: sirve como ejemplo practico de como adaptar un embedding model a un dominio especifico con pocos datos, mostrando tanto los exitos como las limitaciones del proceso.
- Prototipo de busqueda semantica en aplicaciones de salud: aunque no es apto para uso clinico, puede integrarse en prototipos de herramientas de consulta para estudiantes o divulgacion.
- Analisis de similitud entre descripciones de enfermedades: permite agrupar patologias por similitud textual, lo que puede ayudar a identificar relaciones no obvias entre condiciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye un ejemplo cualitativo antes/despues del fine-tuning con la consulta "lung cancer", donde la similitud con un candidato no relacionado (Water) bajo de 0.4716 a 0.1344, mientras que un farmaco relevante (Erlotinib hydrochloride) se mantuvo estable en torno a 0.597. No hay metricas estandar como MMLU, HumanEval o MTEB.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 4.021 millones de parametros. En FP16, los pesos ocupan aproximadamente 8 GB (el repositorio pesa 8,1 GB). Para inferencia con sentence-transformers se recomienda al menos 10-12 GB de VRAM para margen con las activaciones.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100 (40 GB) o superiores. En GPUs con menos de 8 GB de VRAM no cabra en FP16; se necesitaria cuantizacion (no publicada).
- Si cabe en consumer GPU: si, en tarjetas de 12 GB o mas (RTX 3060 12GB, RTX 4070 Ti, etc.) con FP16.
- Opciones de despliegue: sentence-transformers (inferencia local), text-embeddings-inference (servidor HTTP), endpoints de Hugging Face. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que es un modelo de embeddings, no generativo.
- Latencia y throughput: no disponibles. Como referencia, un modelo de 4B en FP16 en una RTX 4090 suele procesar cientos de secuencias por segundo en tareas de embedding, pero no hay datos medidos para este fine-tuning.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| umakantcurateai/qwen_embedding_4b_disease_drug_relationship_similarity | 4,02B | 32K | Apache 2.0 | Relaciones enfermedad-farmaco |
| unsloth/Qwen3-Embedding-4B (base) | 4,02B | 32K | Apache 2.0 | Embeddings generales multilingues |
| BAAI/bge-large-en-v1.5 | 0,33B | 512 | MIT | Embeddings generales en ingles |

La comparativa se limita a parametros, contexto y licencia, ya que no hay datos de rendimiento publicados para el modelo fine-tuneado. El modelo base Qwen3-Embedding-4B es la referencia natural; el fine-tuning anade especificidad de dominio a costa de un dataset de entrenamiento muy reducido. BGE es una alternativa mas pequena y rapida, pero sin la especializacion en el dominio farmaceutico.

## Limitaciones y advertencias

- Entrenado con un conjunto de datos muy pequeno (2.950 pares), no cubre todas las enfermedades ni farmacos existentes.
- No validado para uso clinico o diagnostico; es una demostracion educativa, no una herramienta medica.
- Algunos pares positivos pueden mostrar una similitud reducida tras el entrenamiento (como se observa con Gemcitabine en el ejemplo), debido al tamano limitado del dataset y al numero de epocas.
- No se han publicado cuantizaciones, lo que limita su despliegue en hardware con poca VRAM.
- Los idiomas soportados no estan documentados en la model card; aunque el modelo base es multilingue, el fine-tuning se realizo con datos en ingles (descripciones de enfermedades y nombres de farmacos), por lo que su rendimiento en otros idiomas es incierto.
- La licencia Apache 2.0 permite uso comercial, pero la falta de validacion clinica hace desaconsejable su uso en productos sanitarios reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/umakantcurateai/qwen_embedding_4b_disease_drug_relationship_similarity
- Modelo base (unsloth/Qwen3-Embedding-4B): https://huggingface.co/unsloth/Qwen3-Embedding-4B
- Repositorio oficial de Qwen3-Embedding: https://github.com/QwenLM/Qwen3-Embedding
- Coleccion Qwen3-Embedding en Hugging Face: https://huggingface.co/collections/Qwen/qwen3-embedding
