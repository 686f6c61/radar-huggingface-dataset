# SZLHOLDINGS/absrl-grpo-r2-candidate

## Resumen

absrl-grpo-r2-candidate es un adaptador LoRA de segunda ronda desarrollado por SZLHOLDINGS dentro de su programa de aprendizaje por refuerzo orientado a la abstención (abstention-RL o absrl). Se construye sobre el modelo base Qwen/Qwen3-1.7B y se entrena con GRPO (Group Relative Policy Optimization) para que el modelo aprenda a abstenerse ante preguntas que no puede responder en lugar de confabular una respuesta. El objetivo es reducir la alucinación en contextos de pregunta-respuesta sobre documentos.

El adaptador se evaluó con una mezcla de recompensas derivada de SQuAD2, publicada por el mismo autor como dataset absrl-reward-squad2-v1. El modelo se encuentra en fase de candidato, es decir, no es una versión de producción publicada, y sigue la doctrina de "receipted training" de SZL Holdings, que incluye trazabilidad de procedencia y registro del coste energético del entrenamiento.

Por su naturaleza, no es un modelo completo sino un adaptador PEFT que requiere cargar el modelo base Qwen3-1.7B. Su relevancia radica en el enfoque: entrenar explícitamente la capacidad de decir "no lo sé" como comportamiento recompensado, una línea de trabajo poco frecuente en modelos abiertos de pequeño tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3-1.7B |
| Parametros totales | no disponible (adaptador; el base Qwen3-1.7B tiene 1.700 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen3-1.7B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-1.7B, un transformer decoder-only del que no se detallan aquí parámetros internos adicionales. El entrenamiento utiliza GRPO, un algoritmo de optimización de política que estima ventajas relativas dentro de grupos de respuestas generadas, sin necesidad de un modelo crítico separado. La señal de recompensa proviene de una mezcla derivada de SQuAD2 (absrl-reward-squad2-v1), diseñada para premiar la abstención correcta ante preguntas sin respuesta en el contexto y penalizar la confabulación.

El adaptador pertenece a la ronda 2 del programa absrl y está marcado explícitamente como candidato. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición exacta del dataset de prompts ni hiperparámetros del entrenamiento (rango LoRA, alpha, tasa de aprendizaje). El autor menciona que el entrenamiento sigue un régimen de "receipted training" con registro de procedencia y energía, cuyos recibos se alojan en la organización de Hugging Face.

## Capacidades

- Generación de texto en inglés sobre el modelo base Qwen3-1.7B.
- Abstención calibrada: comportamiento entrenado para declinar responder cuando la pregunta no es respondible con el contexto disponible.
- Reducción esperada de confabulación en tareas extractivas de QA, según el diseño del reward mix de SQuAD2.
- Compatibilidad con el ecosistema PEFT/transformers para carga del adaptador.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito en la información disponible.

## Casos de uso

- QA extractivo sobre documentación interna: el adaptador puede integrarse en un pipeline de pregunta-respuesta donde, si la respuesta no figura en el contexto recuperado, el modelo devuelve una abstención en lugar de inventar, lo que reduce el riesgo en entornos de soporte técnico.
- Moderación de respuestas en asistentes RAG: sirve como capa de verificación que señala cuándo el contexto recuperado es insuficiente antes de mostrar una respuesta al usuario.
- Evaluación de pipelines de recuperación: al medir la tasa de abstención se puede diagnosticar si el retriever está aportando contexto relevante o si el modelo simplemente no encuentra la respuesta.
- Prototipado de investigación en calibración: útil para estudiar el equilibrio entre cobertura y precisión en tareas de abstención con modelos pequeños.
- Filtrado previo en atención al cliente automatizada: descartar consultas que el sistema no puede resolver con la base de conocimiento y derivarlas a un humano.
- Entornos con recursos limitados: al ser un adaptador sobre un modelo de 1.700 millones de parámetros, puede desplegarse en GPUs de consumo para pruebas de concepto de abstención.
- Base para iteraciones del programa absrl: sirve como punto de partida para la siguiente ronda de entrenamiento con GRPO.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma específica; el modelo base Qwen3-1.7B en FP16 requiere aproximadamente 3,4 GB solo para pesos, más memoria de activaciones y KV cache.
- GPU recomendadas: no especificadas por el autor; por tamaño del base, una RTX 4090 o RTX 3090 es suficiente para inferencia en FP16 o BF16.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más, aunque no se confirma en la documentación.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador; vLLM, llama.cpp u Ollama requerirían fusión previa del adaptador con el base, no documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| absrl-grpo-r2-candidate | adaptador sobre 1,7B | no disponible | Abstención vía GRPO | Apache 2.0 | Hugging Face (candidato) |
| Qwen/Qwen3-1.7B | 1,7B | no disponible | Modelo base generalista | Apache 2.0 | Hugging Face |
| Adaptadores de abstención comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se identifican en la información proporcionada adaptadores públicos equivalentes centrados en abstención mediante GRPO sobre modelos de este tamaño.

## Limitaciones y advertencias

- Es un adaptador en fase de candidato, no un modelo de producción; su comportamiento no está validado más allá de la evaluación interna del autor.
- Solo soporta inglés; no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- El entrenamiento se limita a un reward mix derivado de SQuAD2, por lo que la generalización a dominios fuera de QA extractivo es incierta.
- Riesgo de abstención excesiva: un ajuste agresivo hacia la abstención puede hacer que el modelo decline preguntas que sí podría responder.
- No se documentan sesgos específicos, pero hereda los del modelo base Qwen3-1.7B.
- La licencia Apache 2.0 permite uso comercial, pero al ser un candidato sin validación externa, su uso en producción conlleva riesgo no cuantificado.
- No hay información sobre el rango LoRA, el dataset de prompts ni los hiperparámetros, lo que dificulta la reproducibilidad.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, sin evidencia de adopción comunitaria.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/SZLHOLDINGS/absrl-grpo-r2-candidate
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset de recompensas: https://huggingface.co/datasets/SZLHOLDINGS/absrl-reward-squad2-v1
- Organización del autor: https://huggingface.co/SZLHOLDINGS
