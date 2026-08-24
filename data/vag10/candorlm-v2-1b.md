# VAG10/CandorLM-v2-1B

## Resumen

CandorLM-v2-1B es un modelo de lenguaje desarrollado por VAG10, construido mediante fine-tuning con QLoRA sobre el modelo base meta-llama/Llama-3.2-1B-Instruct. Su propósito principal es reducir las alucinaciones típicas de los LLM mediante la expresión de confianza calibrada: en lugar de inventar respuestas plausibles cuando desconoce la información, el modelo comunica explícitamente su nivel de certeza en cinco grados (cierto, probable, incierto, desconocido e imposible). Esta característica lo hace relevante para aplicaciones donde la honestidad sobre los límites del conocimiento es crítica, como asistentes de investigación, atención al cliente o verificación de hechos.

Con 1.235 millones de parámetros, es un modelo compacto que hereda la arquitectura transformer de Llama 3.2. El entrenamiento se realizó con un conjunto de datos curado de 501 ejemplos, incluyendo detección adversarial de entidades falsas (leyes, libros, teoremas, empresas inventadas). Aunque su tamaño es reducido, la propuesta de calibración explícita de confianza es una innovación metodológica interesante frente a los modelos que responden con seguridad injustificada. El modelo está disponible en formato GGUF cuantizado (Q4_K_M) y safetensors, bajo la licencia Llama 3.2 Community License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basada en Llama-3.2-1B-Instruct) |
| Parametros totales | 1.235.814.432 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | Ingles |
| Licencia | Llama 3.2 Community License (Meta) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer de Llama-3.2-1B-Instruct, con atención causal estándar y capas de normalización RMSNorm. El fine-tuning se realizó con QLoRA (cuantización de 4 bits, rango LoRA de 32) utilizando el framework Unsloth junto con TRL SFTTrainer. El conjunto de entrenamiento consta de 501 ejemplos seleccionados manualmente, distribuidos en 180 casos de certeza, 85 de probabilidad, 70 de incertidumbre, 117 de desconocimiento y 49 de imposibilidad. Se entrenó durante 5 épocas con una tasa de aprendizaje de 1e-4 y programación coseno.

La innovación principal no reside en la arquitectura, sino en el diseño de la tarea de entrenamiento: el modelo aprende a clasificar su propia confianza y a responder con frases que reflejan el nivel adecuado. Además, se incluyeron ejemplos adversariales con entidades falsas (protocolos, libros, teoremas) para enseñar al modelo a reconocer información no verificable y declarar su desconocimiento en lugar de inventar. No se menciona el uso de RLHF ni DPO; el método es exclusivamente supervisado.

## Capacidades

- Generación de texto con calibración explícita de confianza en cinco niveles: cierto, probable, incierto, desconocido e imposible.
- Detección de premisas falsas y corrección de errores de planteamiento (por ejemplo, preguntas basadas en suposiciones incorrectas).
- Reconocimiento de entidades inventadas (leyes, libros, teoremas, empresas) y respuesta honesta de no conocerlas.
- Expresión de incertidumbre numérica o aproximada cuando la información es vaga o histórica (por ejemplo, rangos de población).
- Capacidad para distinguir entre hechos verificables, predicciones futuras, opiniones personales y paradojas lógicas.
- Soporte de conversación en inglés, aunque no se especifica si mantiene las capacidades de tool calling o agentes del modelo base (no documentado).

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar consultas donde la honestidad es clave, respondiendo "no lo sé" cuando la información no está disponible, en lugar de inventar soluciones. Su tamaño compacto permite desplegarlo en entornos con recursos limitados.
- Asistentes de investigación bibliográfica: al preguntar por obras o autores, CandorLM señala explícitamente si no conoce una referencia, evitando citas falsas que son comunes en otros LLM.
- Verificación de hechos en tiempo real: puede integrarse en pipelines de fact-checking para marcar afirmaciones no verificables o entidades sospechosas, gracias a su entrenamiento adversarial con datos falsos.
- Educación y tutoría: al explicar conceptos, el modelo comunica su nivel de certeza, ayudando a estudiantes a distinguir entre conocimiento establecido y especulación.
- Chatbots de dominios específicos con datos limitados: en áreas donde la base de conocimiento es pequeña, la calibración de confianza reduce el riesgo de respuestas erróneas y mejora la confianza del usuario.
- Sistemas de preguntas y respuestas en entornos regulados (legal, médico): donde una respuesta incorrecta tiene consecuencias, la capacidad de declarar desconocimiento es más segura que una alucinación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks formales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye una tabla de pruebas cualitativas que demuestran el comportamiento esperado:

| Test | Respuesta del modelo | Correcta |
|---|---|---|
| Capital de Japon | Confiado: Tokio | Si |
| Precio de Bitcoin el proximo año | No lo se - volatil | Si |
| Protocolo Henderson de 2021 (falso) | No lo se - no puedo verificar | Si |
| Horizontes Digitales de Atwood (falso) | No lo se - no lo conozco | Si |
| Teorema de Rivera-Khan (falso) | No lo se - no lo conozco | Si |
| Pensamientos de Napoleon en Waterloo | No lo se - no registrado | Si |
| Poblacion de la antigua Roma | No muy seguro - 500K a 1M | Si |
| Por que la Tierra es plana (premisa falsa) | Corrige la premisa | Si |

Estos resultados son ilustrativos, pero no constituyen una evaluación estandarizada. No se dispone de datos de ECE (Expected Calibration Error) ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q4_K_M, el modelo ocupa aproximadamente 0.7-0.8 GB de memoria, por lo que puede ejecutarse en GPUs con 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB (NVIDIA GTX 1650, RTX 3060, RTX 4060, etc.). También es viable en CPU con suficiente RAM.
- Compatibilidad con consumer GPU: sí, es un modelo de 1B parámetros, muy ligero.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python, o servidores de inferencia como vLLM (si se convierte a formato compatible). También puede usarse con Transformers y Unsloth.
- Latencia y throughput: no se han publicado mediciones oficiales, pero por su tamaño se espera una latencia baja (del orden de decenas de milisegundos por token en GPU moderna) y throughput alto en entornos de producción.

## Comparativa con modelos similares

No se han identificado modelos directamente comparables que implementen calibración explícita de confianza en el mismo rango de tamaño. La comparación más natural es con su modelo base:

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| CandorLM-v2-1B | 1.235M | No disponible | Calibracion de confianza | Llama 3.2 Community |
| Llama-3.2-1B-Instruct | 1.235M | 128K (heredado) | Instrucciones generales | Llama 3.2 Community |
| Qwen2.5-1.5B-Instruct | 1.540M | 32K | Instrucciones generales | Apache 2.0 |

CandorLM se diferencia por su objetivo específico de honestidad, pero carece de la versatilidad de los modelos generalistas. No hay datos de benchmarks que permitan comparar rendimiento en tareas estándar.

## Limitaciones y advertencias

- Modelo pequeño (1B parámetros): su capacidad de razonamiento y conocimiento factual es limitada en comparación con modelos de mayor escala.
- Solo inglés: no soporta otros idiomas, lo que restringe su uso en entornos multilingües.
- Dataset de entrenamiento reducido (501 ejemplos): la generalización de la calibración puede ser limitada fuera de los dominios cubiertos.
- Sin evaluación formal de calibración (ECE): no se ha publicado una métrica cuantitativa que valide la mejora frente a otros modelos.
- Riesgo de sobreajuste: el entrenamiento con pocos ejemplos y 5 épocas puede provocar respuestas demasiado conservadoras o patrones rígidos.
- Licencia Llama 3.2 Community: requiere aceptación de los términos de Meta, que incluyen restricciones de uso comercial para ciertos casos (ver licencia completa).
- No se documentan capacidades de tool calling, agentes o generación de código; si se necesitan, es preferible usar el modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VAG10/CandorLM-v2-1B
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Licencia Llama 3.2 Community: https://ai.meta.com/llama/license/
