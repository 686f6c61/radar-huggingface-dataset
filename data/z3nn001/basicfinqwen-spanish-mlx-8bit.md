# Z3NN001/BasicFinQwen-Spanish-MLX-8bit

## Resumen

BasicFinQwen-Spanish-MLX-8bit es un ajuste fino (LoRA fusionado) del modelo Qwen3.5-4B en formato MLX cuantizado a 8 bits, desarrollado por Z3NN001 (Z3NN-AI). Su propósito es muy concreto: responder definiciones de conceptos financieros con un texto fijo y revisado en español, independientemente de cómo se formule la pregunta (con faltas de ortografía, de forma coloquial o bien escrita). Es un modelo experimental de primera versión (v0.1), pensado para un dominio estrecho y no como un asistente financiero general.

El modelo parte de `mlx-community/Qwen3.5-4B-MLX-8bit`, con 4.205.751.296 parámetros totales y un tamaño de repositorio de 4,5 GB. Está entrenado con LoRA de rango 16 sobre todas las capas, con 1.070 ejemplos y longitud máxima de 1.024 tokens, en un Mac mini usando `mlx_lm`. La licencia es Apache 2.0 y los idiomas declarados son español e inglés, aunque en la práctica solo responde en español a los conceptos aprendidos.

Su relevancia es acotada pero ilustrativa: demuestra un patrón de ajuste fino orientado a la consistencia de respuestas (misma respuesta canónica ante múltiples formulaciones), útil para RAG o para sistemas de atención con respuestas controladas. No obstante, el propio autor advierte que fuera de los conceptos aprendidos el modelo alucina más que su base, por lo que su uso en producción debe restringirse estrictamente al dominio entrenado o combinarse con recuperación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), ajuste fino con LoRA fusionado; inferencia MLX |
| Parámetros totales | 4.205.751.296 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento con longitud máxima de 1.024 tokens) |
| Tipos de cuantización | 8 bits (MLX) |
| Idiomas soportados | es, en (respuestas solo en español para los conceptos aprendidos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX, 8 bits) |

## Arquitectura y entrenamiento

El modelo es un transformer Qwen3.5-4B cuantizado a 8 bits para MLX, sobre el que se aplicó un ajuste fino con LoRA de rango 16 y escala 8 en todas las capas, con los pesos resultantes fusionados en el modelo final. El entrenamiento usó una tasa de aprendizaje de 1e-4 con decaimiento coseno, lote de 1 con acumulación de 4, 1.070 ejemplos y longitud máxima de 1.024 tokens, calculando la pérdida únicamente sobre la respuesta. Se ejecutó en un Mac mini con `mlx_lm`.

La innovación metodológica no está en la arquitectura sino en la estrategia de datos: cada definición financiera revisada se empareja con muchas formulaciones distintas de la pregunta y siempre la misma respuesta canónica, aproximadamente 30 variantes por concepto, más una pequeña muestra de chat general. No se documenta el uso de RLHF ni DPO. Los datos de entrenamiento no son públicos.

## Capacidades

- Generación de texto en español para definiciones de conceptos financieros concretos, con respuesta canónica fija.
- Robustez ante variaciones de formulación: preguntas bien escritas, con faltas de ortografía o coloquiales.
- Reconocimiento de conceptos financieros en inglés (por ejemplo, «What is WACC?»), aunque devuelve la definición en español.
- Decodificación determinista recomendada (temperatura 0) y modo de razonamiento desactivado (`enable_thinking=False`).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni razonamiento multi-paso.
- Capacidad multilingüe limitada: no generaliza a otro idioma con los datos actuales.

## Casos de uso

- Glosario financiero interactivo: el modelo responde definiciones de los conceptos aprendidos con un texto revisado y consistente, adecuado para un chatbot de consulta de términos en español.
- Componente de un pipeline RAG: dado que el autor recomienda combinarlo con recuperación, puede usarse para redactar la respuesta final a partir de fragmentos recuperados, limitando la generación al dominio entrenado.
- Atención al cliente en banca o finanzas con respuestas controladas: para preguntas frecuentes sobre conceptos concretos, la respuesta canónica reduce la variabilidad y facilita la revisión de cumplimiento.
- Normalización de respuestas en documentación interna: generar definiciones homogéneas de términos financieros para manuales o bases de conocimiento.
- Prototipado en hardware Apple Silicon: al estar en formato MLX 8 bits, permite experimentar en un Mac sin GPU dedicada, útil para pruebas de concepto rápidas.
- Evaluación de estrategias de ajuste fino: sirve como caso de estudio de la técnica de múltiples formulaciones con respuesta única para medir consistencia.
- Filtro de intención en un asistente mayor: identificar y responder consultas sobre los conceptos cubiertos, derivando el resto al modelo base o a un sistema de recuperación.

## Benchmarks y rendimiento

Evaluación interna publicada por el autor (no son benchmarks estándar como MMLU o HumanEval):

| Prueba | Resultado |
|---|---|
| Preguntas vistas en entrenamiento (30) | 28 respuestas idénticas a la referencia; 29 con ≥ 90 % de parecido |
| Preguntas con formulaciones nunca vistas (90) | 84 idénticas; 87 con ≥ 90 % de parecido |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 4,5 GB en 8 bits; se requiere memoria unificada o VRAM suficiente para cargar los pesos más el overhead de inferencia (aproximadamente 5-6 GB en la práctica).
- GPU recomendadas: no aplica de forma nativa; el modelo está en formato MLX y está pensado para Apple Silicon (Mac con chip M-series). Para GPUs NVIDIA sería necesario convertir los pesos a otro formato.
- Cabe en hardware de consumo: sí, en Mac con memoria unificada de 8 GB o superior (16 GB recomendado para margen).
- Opciones de despliegue: `mlx-lm` (comando `mlx_lm.generate`). No se documenta soporte nativo para vLLM, llama.cpp, Ollama ni TGI en el formato entregado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BasicFinQwen-Spanish-MLX-8bit | 4,2 B | no disponible | Ajuste fino financiero en español, MLX 8 bits | Apache 2.0 | Hugging Face |
| Qwen3.5-4B (base) | 4 B aprox. | no disponible | Modelo generalista | según modelo base | Hugging Face |
| mlx-community/Qwen3.5-4B-MLX-8bit | 4 B aprox. | no disponible | Modelo base cuantizado para MLX | según modelo base | Hugging Face |

La comparación relevante es con su propio modelo base: el ajuste fino mejora la consistencia en los conceptos aprendidos, pero empeora el rendimiento fuera de ese dominio (el autor indica que el base responde mejor a preguntas generales). No se dispone de datos de benchmarks comparativos con otras alternativas financieras.

## Limitaciones y advertencias

- Alucinación fuera del dominio: en conceptos financieros no aprendidos y en preguntas generales responde peor que el modelo base y puede dar datos falsos con tono seguro (por ejemplo, confunde apalancamiento operativo con financiero; en inglés afirma que Canberra es la ciudad más grande de Australia, fundada en 1864).
- Cobertura reducida: solo cubre un número pequeño de conceptos financieros.
- Idioma: las preguntas en inglés sobre conceptos aprendidos devuelven la respuesta en español; no hay generalización cross-lingual.
- Sesgos: no se documentan sesgos específicos, pero al entrenarse con datos no públicos y un conjunto pequeño, el comportamiento está fuertemente condicionado por esas definiciones.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3.5 debe verificarse por si impone condiciones adicionales.
- No es asesoramiento financiero: el autor lo indica explícitamente.
- Uso recomendado: combinado con RAG o limitado exclusivamente a los conceptos aprendidos.

## Enlaces

- Hugging Face: https://huggingface.co/Z3NN001/BasicFinQwen-Spanish-MLX-8bit
- Modelo base: https://huggingface.co/mlx-community/Qwen3.5-4B-MLX-8bit
- Librería MLX-LM: https://github.com/ml-explore/mlx-lm
