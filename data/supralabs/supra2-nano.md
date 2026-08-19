# SupraLabs/Supra2-Nano

## Resumen

Supra2-Nano es un modelo de lenguaje de 800.000 parámetros (799.776 reales) desarrollado por SupraLabs, un laboratorio de investigación independiente especializado en modelos pequeños y eficientes que se ejecutan en hardware de consumo. Forma parte de la familia Supra2, cuyo objetivo es estudiar el comportamiento de escalado en rangos de parámetros extremadamente bajos. El modelo está entrenado desde cero con 1.000 millones de tokens usando la arquitectura Qwen3 a escala reducida, con atención por grupos (GQA) y normalización RMSNorm.

La relevancia de este modelo no reside en sus capacidades generativas —que son mínimas a este tamaño— sino en su papel como línea base para validar el pipeline de entrenamiento (tokenizador, arquitectura, mezcla de datos) antes de escalar a variantes más grandes de la misma familia. Está entrenado con una mezcla dominada por FineWeb-Edu (99%) y un pequeño porcentaje de Cosmopedia-v2 (1%), en precisión bfloat16 sobre dos GPU T4 de Kaggle. No ha recibido ajuste por instrucciones ni alineación, por lo que es un modelo base exclusivamente.

Con una ventana de contexto no especificada y un vocabulario de solo 4.096 tokens, el modelo está pensado para investigación académica y experimentos de ablación, no para uso en producción. Sus resultados en benchmarks estándar se sitúan cerca del azar, lo cual es esperable a esta escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (downscaled) |
| Parametros totales | 799.776 (~800K) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenado en bfloat16) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Supra2-Nano utiliza la arquitectura Qwen3 a una escala muy reducida: dimension oculta pequeña, pocas cabezas de atencion y un numero reducido de capas transformer, todo ajustado a un presupuesto de 800K parametros. Se emplea atencion por grupos (GQA) y RMSNorm, siguiendo el diseño original de Qwen3. El tokenizador tiene un vocabulario de 4.096 tokens, una decision deliberada para evitar que las capas de embedding y proyeccion de salida dominen el recuento de parametros, un problema comun cuando se aplican tokenizadores de tamaño completo a modelos diminutos.

El entrenamiento se realizo con 1.000 millones de tokens en una sola epoca, sin repeticion, durante 7.000 pasos. La mezcla de datos fue 99% FineWeb-Edu y 1% Cosmopedia-v2. El objetivo fue la prediccion estandar del siguiente token (LM causal). El hardware utilizado fueron dos GPU NVIDIA T4 en Kaggle. No se aplico RLHF, DPO ni ningun otro metodo de alineacion. El modelo no tiene ajuste por instrucciones.

## Capacidades

- Generacion de texto basica: puede producir secuencias cortas de texto, pero con frecuentes repeticiones, errores gramaticales o incoherencias a partir de unas pocas decenas de tokens.
- Razonamiento limitado: en benchmarks como PIQA alcanza 0.53 (ligeramente por encima del azar), pero en tareas como HellaSwag o ARC-Challenge se situa cerca o por debajo de la mayoria.
- Sin soporte de tool calling ni function calling.
- Sin capacidades de agente ni razonamiento multi-paso.
- Multilingue: no, solo ingles. El vocabulario de 4.096 tokens fragmenta gravemente palabras raras y texto no ingles.
- Sin modo de pensamiento, vision ni audio.

## Casos de uso

- Investigacion sobre escalado de modelos pequenos: sirve como punto de referencia para estudiar como varian las metricas de rendimiento al reducir el numero de parametros por debajo de 1M.
- Validacion de pipelines de entrenamiento: permite probar el tokenizador, la arquitectura y la mezcla de datos en un entorno de bajo coste antes de lanzar entrenamientos mas grandes.
- Ablaciones de arquitectura: al ser un modelo minimo, se pueden modificar componentes (numero de capas, cabezas, dimension oculta) y medir su impacto con recursos limitados.
- Experimentos de curvas de scaling: junto con otros modelos de la familia Supra2 (Supra-Mini-v3 de 0.5M, Supra-Mini-v6 de 1M), permite trazar curvas de rendimiento en funcion de los parametros.
- Pruebas de infraestructura de inferencia: al ser extremadamente pequeno, es util para verificar despliegues en CPU, edge devices o entornos con restricciones de memoria.
- Educacion y divulgacion: puede usarse en cursos o talleres para ilustrar los limites fundamentales de los modelos de lenguaje sub-millon de parametros.

## Benchmarks y rendimiento

La model card del autor proporciona resultados de evaluacion zero-shot en cuatro benchmarks estandar, comparados con otros dos modelos del mismo laboratorio:

| Benchmark | Supra2-Nano (0.8M) | Supra-Mini-v6 (1M) | Supra-Mini-v3 (0.5M) |
|---|---|---|---|
| PIQA (acc_norm) | 0.53 | 0.54 | 0.50 |
| HellaSwag (acc_norm) | 0.27 | 0.27 | 0.25 |
| ARC-Easy (acc_norm) | 0.31 | 0.30 | 0.28 |
| ARC-Challenge (acc_norm) | 0.21 | 0.20 | 0.23 |

Las puntuaciones de los tres modelos se situan cerca de las lineas base aleatorias o de clase mayoritaria, lo cual es esperable a esta escala. PIQA es la unica tarea con una senal ligeramente positiva, consistente con lo observado en modelos sub-millon de parametros. Supra2-Nano rinde de forma comparable a Supra-Mini-v6 a pesar de tener un 20% menos de parametros, y supera a Supra-Mini-v3 en tres de las cuatro tareas.

No se han publicado resultados en MMLU, HumanEval, GSM8K ni otros benchmarks comunes para modelos de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en bfloat16 (el modelo pesa aproximadamente 1,6 MB en precision bfloat16). Cabe en cualquier GPU moderna e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, incluyendo T4, RTX 3060, RTX 4090, A100, H100. No requiere hardware especializado.
- Compatibilidad con GPU de consumo: si, se ejecuta sin problemas en cualquier GPU consumer actual.
- Opciones de despliegue: transformers de Hugging Face (como se muestra en el ejemplo de la model card), tambien puede cargarse con llama.cpp u Ollama si se convierte a GGUF, aunque no se proporcionan cuantizaciones oficiales.
- Latencia y throughput: al tener menos de un millon de parametros, la generacion es practicamente instantanea en GPU y muy rapida en CPU. No se han publicado mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PIQA | HellaSwag | ARC-Easy | ARC-Challenge | Licencia |
|---|---|---|---|---|---|---|---|
| Supra2-Nano | 0.8M | no disponible | 0.53 | 0.27 | 0.31 | 0.21 | Apache 2.0 |
| Supra-Mini-v6 | 1M | no disponible | 0.54 | 0.27 | 0.30 | 0.20 | Apache 2.0 |
| Supra-Mini-v3 | 0.5M | no disponible | 0.50 | 0.25 | 0.28 | 0.23 | Apache 2.0 |

Los tres modelos pertenecen al mismo laboratorio y comparten la misma filosofia de entrenamiento. No se dispone de datos de otros modelos comparables de terceros en este rango de parametros (sub-1M) con los mismos benchmarks.

## Limitaciones y advertencias

- El modelo tiene 800K parametros, muy por debajo del umbral en el que los transformers producen texto fluido. Las salidas seran frecuentemente repetitivas, agramaticales o incoherentes.
- El vocabulario de 4.096 tokens provoca una alta fragmentacion out-of-vocabulary en palabras raras y en cualquier texto no ingles.
- Entrenamiento de una sola epoca sobre 1.000 millones de tokens, sin conjunto de validacion retenido mas alla de la evaluacion de benchmarks.
- No tiene ajuste por instrucciones ni alineacion; es un modelo base (pretrained) unicamente.
- No es adecuado para uso en produccion ni para aplicaciones que requieran generacion fiable de texto.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no ofrece utilidad practica para ese fin.
- No se especifica la longitud de contexto soportada, lo que dificulta planificar su uso en tareas que requieran ventanas largas.
- Riesgo de alucinacion: irrelevante en la practica porque el modelo rara vez produce texto coherente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SupraLabs/Supra2-Nano
- Organizacion SupraLabs en Hugging Face: https://huggingface.co/SupraLabs
- Sitio web del laboratorio: https://supra-labs.com/
- GitHub de investigacion de SupraLabs: https://github.com/SupraLabs-Research
