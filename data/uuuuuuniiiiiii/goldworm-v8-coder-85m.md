# Uuuuuuniiiiiii/goldworm-v8-coder-85m

## Resumen

GoldWorm v8 coder 85M es un checkpoint de investigación de un transformer causal byte-level desarrollado por el usuario Uuuuuuniiiiiii. No emplea tokenizador: el vocabulario son los 256 bytes UTF-8 en bruto, y el modelo está especializado en completar cuerpos de funciones Python cortas. Con 85.169.664 parámetros, 12 capas, dimensión 768 y una ventana de contexto de 2048 bytes, se entrenó desde cero (sin pesos preentrenados externos) sobre código fuente Python de paquetes populares y se afinó mediante SFT destilado de Qwen2.5-Coder-7B-Instruct usado exclusivamente como profesor.

El modelo es relevante como artefacto de investigación reproducible: documenta con rigor su protocolo de evaluación congelado (k=16 muestras, temperatura 0,8, top-k 40, bootstrap pareado), publica resultados negativos de experimentos de selección y explicita que las mejoras frente a su versión anterior no son estadísticamente significativas. Su valor no es el rendimiento absoluto, sino la transparencia metodológica en un modelo de 85M parámetros que cabe en CPU.

No es un modelo de producción: el propio autor lo etiqueta como "no production-ready", con tasas de acierto pass@1 del 7,08% en eval1 y del 0,42% en eval2. Resulta útil para estudiar escalado de modelos pequeños, decodificación byte-level y metodología de evaluación de generación de código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GoldWormV8: transformer causal byte-level, bloques pre-LN sin bias (QKVO + MLP GELU), LayerNorm afín, cabeza atada, RoPE y SDPA causal |
| Parametros totales | 85.169.664 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 bytes |
| Tipos de cuantizacion | no disponible (solo se documenta ejecución en CPU con pesos originales) |
| Idiomas soportados | no disponible (entrenado sobre código Python; vocabulario de 256 bytes UTF-8) |
| Licencia | MIT |
| Formato de pesos | safetensors y PyTorch (.pt) |

## Arquitectura y entrenamiento

La arquitectura GoldWormV8 reutiliza los bloques de GoldWormV6: transformer causal con pre-LayerNorm, proyecciones QKVO y MLP sin términos de bias, activación GELU, LayerNorm con parámetros afines y cabeza de salida atada a la embedding de entrada. Incorpora RoPE para la codificación posicional y atención escalada con producto punto (SDPA) de PyTorch. La dimensión del modelo es 768, con 12 capas, 12 cabezas de atención y FFN con factor de expansión 4. El vocabulario es de 256 bytes UTF-8 sin tokenizador, lo que permite procesar cualquier secuencia de bytes sin OOV.

El entrenamiento consta de dos fases. El preentrenamiento continuado utiliza 350 millones de posiciones de byte procedentes de código fuente Python de los paquetes torch, transformers, sympy, scipy, numpy, datasets, gradio y huggingface_hub (licencias BSD-3-Clause y Apache-2.0), con ventanas de 2049 bytes y una división de 108.013.035 bytes de entrenamiento frente a 4.231.185 de desarrollo. Se eliminaron ventanas que compartían cualquier n-grama de 13 bytes con los prompts de evaluación, nombres de funciones o una lista de conceptos bloqueados. La fase de SFT emplea el conjunto teacher_v4 (324 pares prompt→cuerpo de entrenamiento y 38 de desarrollo), generado por Qwen2.5-Coder-7B-Instruct en cuantización NF4 como profesor de destilación, filtrado mediante ejecución de tests y guardas de n-gramas y nombres. El checkpoint publicado corresponde al paso 809 de SFT, seleccionado únicamente por entropía cruzada de desarrollo. No se emplearon pesos preentrenados externos ni RLHF/DPO.

## Capacidades

- Generación de texto y código: completado de cuerpos de funciones Python cortas a partir de una firma y docstring.
- Razonamiento limitado: resuelve únicamente funciones triviales; el propio autor advierte que solo se superan tareas elementales.
- Procesamiento byte-level: al operar sobre bytes UTF-8 en bruto, puede ingerir cualquier entrada textual sin tokenizador, aunque su entrenamiento se restringe a Python.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; el corpus es exclusivamente código Python.
- Capacidades especiales: ninguna (sin modo thinking, visión ni audio).
- Ejecución en CPU: carga en aproximadamente 1 segundo y genera con los pesos originales sin cuantización.

## Casos de uso

- Estudio de arquitecturas byte-level: permite reproducir un transformer causal sin tokenizador y analizar cómo aprende representaciones a partir de bytes en bruto, gracias a que el código de entrenamiento y evaluación está publicado.
- Investigación en destilación de modelos pequeños: sirve como caso de referencia para medir qué se obtiene al destilar un profesor de 7B (Qwen2.5-Coder-7B-Instruct) en un alumno de 85M con solo 324 pares de SFT.
- Metodología de evaluación de generación de código: el protocolo congelado (k=16, temperatura 0,8, top-k 40, bootstrap pareado B=10000) y los resultados negativos publicados son material didáctico para diseñar evaluaciones con intervalos de confianza.
- Experimentos de selección de muestras (MBR, harness de tests): el repositorio documenta intentos rechazados con gates pre-registrados, útil para estudiar técnicas de reranking en modelos pequeños.
- Docencia y demostraciones en hardware modesto: al ejecutarse en CPU con torch y safetensors, permite ilustrar inferencia de un transformer en un portátil sin GPU.
- Pruebas de pipelines de decodificación: la ventana de 2048 bytes y la generación de 160 bytes nuevos permiten validar implementaciones de sampling (top-k, temperatura, semillas) en un modelo ligero.

## Benchmarks y rendimiento

Protocolo congelado: k=16 muestras por tarea, temperatura 0,8, top-k 40, máximo 160 bytes nuevos, semilla 20261107 + índice de tarea, bootstrap pareado sobre tareas (B=10000, semilla 777, IC del 95%). Cada conjunto tiene 30 tareas de funciones Python con tests assert ocultos.

| Metrica | eval1 (30 tareas) | eval2 (30 tareas, mas dificiles) |
|---|---|---|
| pass@1 (media sobre 16 muestras) | 7,08% | 0,42% |
| pass@16 | 16,67% (5/30) | 6,67% (2/30) |
| Sintacticamente valido | 92,92% | 91,67% |

Comparación pareada frente al modelo v2 del mismo autor:

| Metrica | v2 | v8 full1 | Delta | IC 95% |
|---|---|---|---|---|
| pass@1 (eval1) | 3,54% | 7,08% | +3,54 pp | −2,29 a +10,83 pp (incluye 0) |
| pass@16 (eval1) | 6,67% | 16,67% | +10,00 pp | +0,00 a +20,00 pp |
| Validez (eval1) | 76,46% | 92,92% | +16,46 pp | +7,91 a +24,79 pp |
| pass@1 (eval2) | no disponible | 0,42% | +0,42 pp | +0,00 a +1,04 pp |
| pass@16 (eval2) | no disponible | 6,67% | +6,67 pp | +0,00 a +16,67 pp |

El autor señala que la mejora de pass@1 sobre v2 no está estadísticamente establecida. El oráculo sobre las 16 muestras es de 7/60 tareas agrupadas, por lo que la selección por sí sola no puede mejorar mucho: hace falta mejorar la generación de candidatos. Ambos conjuntos se reutilizaron en varios experimentos y son pequeños (n=30); deben tratarse como conjuntos de desarrollo, no como benchmark limpio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para GPU; los pesos en FP32 ocupan aproximadamente 0,34 GB (85.169.664 parámetros × 4 bytes), coherente con un repositorio de 0,7 GB que incluye también el checkpoint .pt.
- GPU recomendadas: no disponibles; el autor solo documenta y prueba ejecución en CPU.
- Cabida en GPU consumer: por tamaño, cualquier GPU con al menos 1 GB de memoria podría alojarlo, aunque no hay pruebas publicadas al respecto.
- Opciones de despliegue: el autor proporciona `inference_cpu.py` con torch y safetensors; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor indica que la carga en CPU con torch 2.12.1 tarda aproximadamente 1 segundo y que `model.safetensors` y `sft_best.pt` producen logits idénticos (diferencia absoluta máxima 0,0).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | pass@1 (eval1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GoldWorm v8 coder 85M | 85,2M | 2048 bytes | 7,08% | MIT | Hugging Face |
| GoldWorm v2 (mismo autor) | no disponible | no disponible | 3,54% | no disponible | no disponible |
| Qwen2.5-Coder-7B-Instruct (profesor) | 7B | no disponible en esta ficha | no evaluado en este protocolo | no disponible en esta ficha | Hugging Face |
| Qwen2.5-0.5B-Instruct (profesor de tests) | 0,5B | no disponible en esta ficha | no evaluado en este protocolo | no disponible en esta ficha | Hugging Face |

No se dispone de resultados de benchmarks de terceros comparables bajo el mismo protocolo; los modelos Qwen se citan únicamente porque aparecen como profesores en el proceso de entrenamiento y experimentos del autor.

## Limitaciones y advertencias

- Tasas de acierto absolutas muy bajas: pass@1 del 7,08% en eval1 y del 0,42% en eval2; solo se resuelven funciones triviales.
- El autor declara explícitamente que el modelo no está listo para producción.
- Solo Python, con contexto byte-level de 2048 bytes; no hay soporte multilingüe documentado.
- Riesgo elevado de alucinación de código: con semillas 0–2 en el prompt de ejemplo el modelo generó `return a * b == 0`, `return a + b > 1 if b > 1 else a` y `return a * (b - 1) * b`, todas incorrectas.
- Las mejoras frente a v2 no son estadísticamente significativas (el IC del pass@1 incluye 0).
- Los conjuntos de evaluación son pequeños (n=30), se reutilizaron en varios experimentos y no constituyen un benchmark limpio; además, eval2 no garantiza conceptos no vistos por el filtro relajado de teacher_v4.
- El corpus de preentrenamiento y los datos del profesor no se publican; el repositorio solo incluye la descripción y el código para reconstruirlos.
- Licencia MIT: permite uso comercial, pero el rendimiento no es adecuado para aplicaciones reales.
- Sesgos conocidos: no documentados en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Uuuuuuniiiiiii/goldworm-v8-coder-85m
- Código de inferencia en CPU: `inference_cpu.py` dentro del repositorio
- Código de entrenamiento: `training/full_train.py`, `training/trial_train.py`, `training/trial_data.py`
- Resultados y estadísticas: `results/`, `results/data_stats.json`, `results/rejected_followups/`
- Licencias del corpus de preentrenamiento: `pretrain_corpus_licenses/`
- Profesor de destilación: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Profesor de tests en experimento rechazado: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
