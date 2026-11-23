# TharaniJayaratne/gpt2-reuters-from-scratch

## Resumen

GPT-2 (small, from scratch) trained on Reuters articles es un modelo de lenguaje causal desarrollado por TharaniJayaratne en el contexto de la asignatura CS4681 (Assignment 02). Se trata de un GPT-2 de arquitectura reducida entrenado desde inicialización aleatoria, sin partir de pesos preentrenados, sobre un corpus de artículos de la agencia Reuters. El modelo resuelve la tarea de generación de texto condicionada por el contexto previo (modelado de lenguaje de siguiente token) en inglés.

Con 16.537.088 parámetros, 4 capas, 4 cabezas de atención y una dimensión de embedding de 256, se sitúa muy por debajo del GPT-2 small original (124 millones de parámetros). Su longitud de contexto es de 256 tokens, lo que lo limita a fragmentos cortos de texto. El entrenamiento se realizó durante 5 épocas con un batch size de 32 y una tasa de aprendizaje de 0,0005, completándose en 6,39 minutos, lo que refleja un coste computacional muy bajo.

El modelo es relevante como ejercicio académico reproducible de entrenamiento desde cero y como ejemplo de ajuste de dominio sobre un corpus periodístico concreto. No obstante, su escala reducida limita seriamente sus capacidades en comparación con modelos contemporáneos, y su licencia no está especificada, lo que restringe su uso comercial sin aclaración previa por parte del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2), 4 capas, 4 cabezas, dim. de embedding 256 |
| Parametros totales | 16.537.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only de tipo GPT-2 con 4 capas, 4 cabezas de atención y dimensión de embedding de 256. Se entrenó desde inicialización aleatoria (from scratch) mediante modelado de lenguaje causal (predicción del siguiente token) en modo self-supervised. El tokenizador asociado es `ingeniumacademy/gpt2-reuters-tokenizer`, y la entrada de texto se compone como título + salto de línea + cuerpo del artículo.

El conjunto de datos de entrenamiento es `ingeniumacademy/reuters_articles`. Los hiperparámetros documentados son 5 épocas, batch size de 32 y tasa de aprendizaje de 0,0005, con un tiempo total de entrenamiento de 6,39 minutos. El modelo alcanzó una pérdida de validación de 4,4303 (perplejidad 83,96) y una pérdida de test de 4,215 (perplejidad 67,7). No se documenta el uso de RLHF, DPO ni técnicas de alineación adicionales, ni innovaciones arquitectónicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en inglés mediante continuación de contexto (modelado causal de siguiente token).
- Generación de texto con estilo periodístico, condicionada por el corpus Reuters de entrenamiento.
- Capacidad limitada de razonamiento y coherencia más allá de 256 tokens de contexto.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés (único idioma declarado).
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Generación de titulares y entradillas de noticias: el modelo puede producir continuaciones de texto con estilo periodístico aprendido del corpus Reuters, útil para prototipos de redacción automática en dominios informativos acotados.
- Aumento de datos sintéticos para NLP financiero: al haber sido entrenado sobre artículos de Reuters, puede generar textos de dominio periodístico-económico para ampliar datasets de entrenamiento o pruebas en pipelines de NLP.
- Experimentación académica y docencia: sirve como referencia reproducible de entrenamiento desde cero con un coste computacional mínimo (6,39 minutos), adecuado para prácticas de modelado de lenguaje causal.
- Pruebas de pipelines de inferencia ligeros: con 16,5 millones de parámetros y pesos safetensors, es útil para validar integraciones con transformers y text-generation-inference en entornos de recursos limitados.
- Generación de texto en entornos embebidos o CPU: su tamaño reducido permite ejecución en dispositivos sin GPU dedicada para tareas de generación de texto corto.
- Estudio de perplejidad y dinámica de entrenamiento: los ficheros `training_log_main.csv` y `loss_curve_main.png` permiten analizar curvas de pérdida y comparar configuraciones (runs adicionales en `q4_runs/`).
- Prototipado de completado de texto en inglés con contexto corto: útil para demostraciones de autocompletado limitadas a fragmentos de hasta 256 tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de pérdida y perplejidad del entrenamiento:

| Metrica | Valor |
|---|---|
| Perdida de validacion | 4,4303 |
| Perplejidad de validacion | 83,96 |
| Perdida de test | 4,215 |
| Perplejidad de test | 67,7 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (16,5 M de parámetros en safetensors, aproximadamente 66 MB de pesos en fp32); el repositorio completo ocupa 0,3 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100, H100 ni RTX 4090. Funciona en CPU sin problema.
- Cabe en cualquier GPU consumer (GTX 1060, RTX 2060, RTX 3060, etc.) e incluso en dispositivos de bajos recursos.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`). No se documentan variantes GGUF para llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia muy baja en CPU y GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| TharaniJayaratne/gpt2-reuters-from-scratch | 16,5 M | 256 | no disponible | Hugging Face |
| GPT-2 small original (OpenAI) | 124 M | 1024 | MIT (pesos publicados por OpenAI) | Hugging Face, descarga directa |
| DistilGPT-2 | 82 M | 1024 | Apache 2.0 | Hugging Face |
| Modelos GPT-2 ajustados a dominio periodístico (genéricos) | variable | variable | variable | Hugging Face |

La comparación se limita a la categoría de modelos GPT-2 de pequeña escala; no se dispone de datos de rendimiento comparativo (benchmarks) para este modelo frente a las alternativas.

## Limitaciones y advertencias

- Escala muy reducida (16,5 M de parámetros) que limita la coherencia y la calidad del texto generado frente a GPT-2 small o modelos actuales.
- Ventana de contexto de solo 256 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Entrenado exclusivamente en inglés y sobre un corpus periodístico de Reuters, por lo que el dominio y el estilo están sesgados hacia ese tipo de texto.
- Riesgo elevado de alucinación y de generar contenido factualmente incorrecto, especialmente fuera del dominio de entrenamiento.
- No se documenta alineación (RLHF/DPO) ni filtros de seguridad, por lo que puede reproducir sesgos presentes en el corpus Reuters.
- Licencia no especificada: no se puede asumir permiso para uso comercial sin confirmación del autor.
- Sin datos de benchmarks estándar (MMLU, HumanEval, GSM8K) que permitan evaluar su calidad de forma objetiva.
- Modelo con 0 descargas y 1 like en el momento de la consulta; no hay evidencia de uso en producción ni validación por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TharaniJayaratne/gpt2-reuters-from-scratch
- Tokenizador: https://huggingface.co/ingeniumacademy/gpt2-reuters-tokenizer
- Dataset: https://huggingface.co/datasets/ingeniumacademy/reuters_articles
