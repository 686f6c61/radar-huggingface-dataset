# tel1980/qwen-python-slm

## Resumen

`qwen-python-slm` es un modelo de lenguaje pequeño (SLM) de 1.500 millones de parámetros especializado en la generación de código para el ecosistema de ingeniería de datos, ciencia de datos, machine learning, LLMs, agentes de IA, DataOps y MLOps. Desarrollado por el usuario `tel1980`, se trata de un ajuste fino (SFT) mediante QLoRA sobre el modelo base `Qwen/Qwen2.5-Coder-1.5B-Instruct`, manteniendo la arquitectura original de 1,5B parámetros y añadiendo adaptadores LoRA entrenados para responder a instrucciones técnicas en Python, SQL y PySpark.

El modelo resuelve el problema de obtener un asistente de código ligero y específico para tareas de datos e IA, sin necesidad de ejecutar modelos de varios miles de millones de parámetros. Es relevante ahora porque permite desplegar un asistente de generación de código especializado en hardware modesto (incluso en una GPU de 8 GB), con licencia Apache 2.0 y formatos listos para Ollama y llama.cpp. Su contexto está limitado a 1024 tokens, lo que condiciona los casos de uso, pero lo hace adecuado para tareas de generación de scripts, consultas SQL y prototipado rápido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 1.543.714.304 (1,5B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | GGUF Q4_K_M (mencionado), FP16 (pesos completos safetensors) |
| Idiomas soportados | Portugues (instrucciones) + codigo multilingue (Python, SQL, PySpark) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (merged FP16), GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen2.5-Coder-1.5B-Instruct, un transformer causal decoder-only con atención completa. El ajuste fino se realizó con Supervised Fine-Tuning (SFT) usando QLoRA en 4-bit NF4, con los siguientes hiperparámetros LoRA: r=16, alpha=32, dropout=0.05, y módulos objetivo `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`. El entrenamiento se ejecutó durante 500 pasos con batch efectivo de 16, learning rate 2e-4, warmup de 30 pasos y optimizador `paged_adamw_8bit`, sobre una NVIDIA GeForce RTX 5050 de 8 GB VRAM, con un tiempo total de aproximadamente 1 hora y 10 minutos. El número de parámetros entrenables fue de 18,4 millones (1,18% del total).

Los datos de entrenamiento combinaron 98.180 muestras: el dataset principal `iamtarun/python_code_instructions_18k_alpaca` filtrado por keywords de datos/IA, `flytech/python-codes-25k`, `m-a-p/CodeFeedback-Filtered-Instruction` submuestreado a 30k, `b-mc2/sql-create-context` submuestreado a 15k, y una curaduría propia de 1.500 muestras de PySpark en formato Alpaca. Todas las muestras fueron filtradas por dominio (pandas, sklearn, PyTorch, Spark, Airflow, MLflow, LangChain, etc.). El prompt de sistema define al modelo como un ingeniero de datos/ML senior especializado en Python/SQL/PySpark.

## Capacidades

- Generación de código Python para ETL/ELT, análisis de datos y machine learning.
- Escritura de consultas SQL compatibles con SQLite y PostgreSQL.
- Generación de código PySpark para procesamiento distribuido.
- Prototipado de agentes de IA con frameworks como LangChain, LlamaIndex y CrewAI.
- Automatización de pipelines de MLOps/DataOps (Airflow, dbt, MLflow).
- Soporte de comandos de lenguaje en el prompt: `/python`, `/sql`, `/pyspark`, `/ml`, `/llm`, `/agent`, `/dataops` para forzar el dominio deseado.
- No se menciona soporte de tool calling, function calling, visión o audio.
- Capacidades multilingües limitadas: las instrucciones están en portugués, pero el código generado es multilingüe (Python, SQL, PySpark).

## Casos de uso

- Generación de scripts ETL/ELT en Python: el modelo puede producir scripts de extracción, transformación y carga usando pandas, SQLAlchemy o librerías similares, adecuado para prototipos y automatización interna.
- Consultas SQL para análisis de datos: genera consultas SQL válidas para SQLite/PostgreSQL a partir de descripciones en lenguaje natural, útil para analistas que necesitan consultas rápidas.
- Código PySpark para procesamiento distribuido: permite generar transformaciones y pipelines en PySpark, aunque se requiere un entorno Spark configurado para ejecutarlas.
- Prototipado de agentes de IA: puede generar código de agentes con LangChain, LlamaIndex o CrewAI, facilitando la experimentación inicial en proyectos de agentes.
- Automatización de pipelines de datos: genera DAGs de Airflow, configuraciones de dbt o scripts de MLflow para orquestación y seguimiento de experimentos.
- Asistente educativo para estudiantes de data science: sirve como herramienta de aprendizaje para practicar sintaxis de Python, SQL y PySpark en un entorno local ligero.
- Despliegue en entornos con recursos limitados: gracias a su tamaño de 1,5B y cuantización GGUF Q4_K_M, puede ejecutarse en una GPU de 8 GB o incluso en CPU con Ollama, ideal para desarrollo local sin conexión a APIs externas.

## Benchmarks y rendimiento

El autor proporciona métricas de evaluación propias, ejecutadas con 30 muestras por lenguaje, pero advierte que las muestras provienen de los mismos datasets de entrenamiento, por lo que los resultados son optimistas y sirven como sanity check de formato y gramática.

| Metrica | Valor |
|---|---|
| Tasa de compilacion Python valida | 96,67% |
| Tasa de ejecucion Python sin errores | 83,33% |
| Tasa de parse SQL valido | 100,00% |
| Tasa de sintaxis PySpark valida | 100,00% |
| BLEU medio — Python | 0,175 |
| BLEU medio — SQL | 0,917 |
| BLEU medio — PySpark | 0,353 |

No se han publicado resultados en benchmarks estándar como HumanEval, MBPP o Spider/BIRD. El autor recomienda añadir pass@1 en futuras evaluaciones con datos no vistos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo FP16 requiere aproximadamente 3,1 GB de VRAM (pesos) más overhead de activaciones; con cuantización GGUF Q4_K_M, el uso se reduce a unos 1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para FP16; con GGUF Q4_K_M puede funcionar en GPUs de 2 GB o incluso en CPU (aunque con mayor latencia).
- Cabe en GPUs consumer como RTX 3050, RTX 3060, RTX 4060, RTX 5050, etc.
- Opciones de despliegue: Ollama (con el GGUF), llama.cpp, transformers (con pesos safetensors), y compatible con text-generation-inference (según tags del modelo).
- Latencia y throughput: no se han publicado datos concretos; para un modelo de 1,5B en una GPU moderna se espera una generación de decenas de tokens por segundo, pero depende del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| qwen-python-slm (este) | 1,5B | 1024 | Apache 2.0 | Codigo para data/IA (Python, SQL, PySpark) |
| Qwen2.5-Coder-1.5B-Instruct (base) | 1,5B | 32k (original) | Apache 2.0 | Codigo general, instrucciones |
| CodeLlama-7B-Instruct | 7B | 16k | Llama 2 license | Codigo general |
| StarCoder2-3B | 3B | 16k | BigCode OpenRAIL-M | Codigo general |

El modelo base Qwen2.5-Coder-1.5B-Instruct soporta un contexto nativo de 32k tokens, mientras que este fine-tuning lo reduce a 1024. La comparación con CodeLlama y StarCoder muestra que este modelo es significativamente más pequeño, lo que facilita su despliegue, pero también limita su capacidad para tareas complejas o contextos largos. No se dispone de benchmarks comparativos estandarizados entre estos modelos.

## Limitaciones y advertencias

- El modelo fue entrenado con recursos limitados (RTX 5050, 500 pasos), por lo que puede presentar alucinaciones o generar código no ejecutable.
- El contexto está limitado a 1024 tokens, lo que impide manejar conversaciones largas o archivos de código extensos.
- Las instrucciones están en portugués; el modelo no ha sido entrenado explícitamente para instrucciones en otros idiomas, aunque el código generado es independiente del idioma.
- SQL se valida sintácticamente pero no se ejecuta contra una base de datos real; la semántica depende del esquema proporcionado.
- PySpark se trata como Python; la ejecución real requiere un entorno Spark configurado.
- El dominio está restringido a datos/IA; código fuera de ese ámbito (frontend, mobile, etc.) puede tener calidad inferior.
- El modelo puede reproducir sesgos presentes en los datos de entrenamiento.
- No se recomienda para producción crítica sin revisión humana, ni para generar código con datos sensibles sin validación de seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tel1980/qwen-python-slm
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Datasets de entrenamiento: `iamtarun/python_code_instructions_18k_alpaca`, `flytech/python-codes-25k`, `m-a-p/CodeFeedback-Filtered-Instruction`, `b-mc2/sql-create-context` (disponibles en HuggingFace)
