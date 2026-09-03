# Thinking-Space/UltraData-IF-1.5B

## Resumen

UltraData-IF-1.5B es un modelo de seguimiento de instrucciones entrenado con aprendizaje por refuerzo (RL), desarrollado por Thinking-Space como parte de una investigación sobre destilación on-policy (OPD). Se inicializa desde DeepSeek-R1-Distill-Qwen-1.5B y se entrena con el subconjunto de seguimiento de instrucciones del dataset UltraData-SFT-2605 de OpenBMB. Su propósito principal es servir como modelo profesor (teacher) para estudiar la destilación de conocimiento a nivel de token en el dominio de seguimiento de instrucciones, emparejado con el mismo modelo base como estudiante.

El modelo usa la arquitectura Qwen2ForCausalLM con 1.780 millones de parámetros, atención con GQA (12 cabezas de consulta, 2 de clave-valor) y una longitud de contexto declarada de 131.072 posiciones en la configuración, aunque el tokenizador limita la longitud máxima a 16.384 tokens. Se entrenó con GRPO (Group Relative Policy Optimization) durante 600 pasos, con una recompensa basada en la fracción de restricciones de instrucción satisfechas. Los resultados en benchmarks de seguimiento de instrucciones (Multi-IF e IFBench) muestran mejoras sustanciales frente al modelo base, lo que lo convierte en un candidato interesante para tareas que requieren cumplir restricciones complejas en las respuestas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM (transformer decoder-only) |
| Parametros totales | 1.777.088.000 (1,78B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 131.072 en config.json; 16.384 en tokenizer (model_max_length) |
| Tipos de cuantizacion | no disponible (repo en bfloat16) |
| Idiomas soportados | en, zh |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

UltraData-IF-1.5B hereda la arquitectura de DeepSeek-R1-Distill-Qwen-1.5B, un transformer decoder-only con 28 capas, tamaño oculto de 1536 y atención GQA (12 cabezas de consulta, 2 de clave-valor). El vocabulario tiene 151.936 tokens. El modelo se entrenó con GRPO, un algoritmo de optimización de política que agrupa varios rollouts por prompt y calcula ventajas relativas dentro del grupo. La recompensa se define como la fracción de restricciones de instrucción satisfechas, lo que incentiva al modelo a cumplir condiciones explícitas en las respuestas.

El entrenamiento usó el subconjunto de seguimiento de instrucciones de UltraData-SFT-2605, con un batch de 32 prompts, 8 rollouts por prompt (256 rollouts por paso), una tasa de aprendizaje de 1e-6, temperatura de muestreo 0.9 y top-p 0.95. No se aplicó regularización KL, el clipping de GRPO fue 0.20/0.28 y la agregación de pérdida fue token-mean. Se entrenó durante 600 pasos con el framework veRL en 8 GPUs. No se especifica el número total de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Seguimiento de instrucciones con restricciones múltiples: el modelo está optimizado para satisfacer condiciones explícitas en las respuestas (formato, longitud, contenido, etc.).
- Razonamiento: al derivar de DeepSeek-R1-Distill-Qwen-1.5B, conserva capacidades de razonamiento paso a paso, aunque el entrenamiento con RL se centró en el cumplimiento de instrucciones.
- Generación de texto en inglés y chino: soporta ambos idiomas según la model card.
- Conversación multi-turno: el entrenamiento incluyó respuestas de hasta 14.336 tokens, lo que permite mantener contexto en diálogos largos.
- No se documenta soporte explícito de tool calling, function calling, ni capacidades multimodales (visión, audio).

## Casos de uso

- Generación de respuestas con restricciones de formato: el modelo puede producir salidas que cumplan condiciones específicas (p. ej., "responde en tres líneas", "incluye exactamente dos ejemplos"), útil para pipelines que requieren salidas estructuradas.
- Destilación de conocimiento on-policy: su función principal es servir como profesor para entrenar modelos estudiantes mediante destilación a nivel de token, aprovechando que comparte arquitectura y tokenizador con DeepSeek-R1-Distill-Qwen-1.5B.
- Evaluación de seguimiento de instrucciones: puede usarse como generador de respuestas de referencia en benchmarks como Multi-IF o IFBench, o para crear datasets sintéticos de entrenamiento.
- Asistentes conversacionales en inglés y chino: su capacidad de mantener diálogos multi-turno con contexto de hasta 16K tokens lo hace adecuado para chatbots de dominio específico.
- Preprocesamiento de texto con reglas: tareas como resumir con límite de palabras, extraer información con formato fijo o reescribir texto siguiendo pautas estrictas.
- Investigación en RL y alineación: al ser un modelo pequeño (1,78B) entrenado con GRPO, sirve como banco de pruebas para estudiar métodos de optimización de política y recompensas basadas en restricciones.

## Benchmarks y rendimiento

La model card reporta resultados en Multi-IF (promedio de 8 idiomas y solo inglés) e IFBench, comparando el modelo profesor (UltraData-IF-1.5B) con el estudiante (DeepSeek-R1-Distill-Qwen-1.5B). No se proporcionan comparaciones con otros modelos.

| Benchmark | DeepSeek-R1-Distill-Qwen-1.5B (estudiante) | UltraData-IF-1.5B (profesor) |
|---|---|---|
| Multi-IF, 8 idiomas, turno final | 20,84 | 28,58 |
| Multi-IF, 8 idiomas, media 3 turnos | 28,56 | 40,39 |
| Multi-IF, inglés, turno final | 24,71 | 35,54 |
| Multi-IF, inglés, media 3 turnos | 30,51 | 45,05 |
| IFBench, prompt-level estricto | 10,33 | 17,00 |
| IFBench, prompt-level laxo | 15,00 | 22,00 |
| IFBench, instruction-level estricto | 12,79 | 18,90 |
| IFBench, instruction-level laxo | 19,19 | 24,71 |

Las mejoras son consistentes en todas las métricas, con incrementos de entre 5 y 15 puntos porcentuales. No se han publicado resultados en benchmarks generales como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 1,78B parámetros. En bfloat16 (formato nativo) ocupa aproximadamente 3,6 GB de memoria, por lo que cabe en GPUs con 6 GB o más. Con cuantización int8 (~1,8 GB) o int4 (~0,9 GB) podría ejecutarse en GPUs de gama baja, aunque no se proporcionan cuantizaciones oficiales.
- GPUs recomendadas: cualquier GPU con al menos 6 GB de VRAM (p. ej., RTX 2060, RTX 3060, RTX 4060) puede ejecutar el modelo en bf16. Para despliegue con contexto largo (16K tokens), se recomienda al menos 8 GB de VRAM.
- Compatibilidad con GPUs de consumo: sí, es un modelo pequeño que cabe en GPUs consumer modernas.
- Opciones de despliegue: al ser un modelo transformers estándar, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama. El framework de entrenamiento fue veRL, pero para inferencia no hay restricciones.
- Latencia y throughput: no se proporcionan datos medidos. En una GPU como RTX 4090, se espera una latencia de decodificación de decenas de milisegundos por token y un throughput de varios cientos de tokens por segundo, pero son estimaciones no verificadas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos de 1,5B en la información proporcionada. La única comparación publicada es contra su modelo base, DeepSeek-R1-Distill-Qwen-1.5B. Se puede señalar que, por su tamaño y arquitectura, compite en la categoría de modelos pequeños de instrucciones, pero sin datos de MMLU, HumanEval u otros, no es posible establecer una comparativa cuantitativa fiable.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| UltraData-IF-1.5B | 1,78B | 16K (tokenizer) | other | Entrenado con RL para seguimiento de instrucciones |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,78B | 131K (config) | MIT | Modelo base, razonamiento, sin RL específico de instrucciones |
| Qwen2.5-1.5B-Instruct | 1,54B | 32K | Apache 2.0 | Alternativa comercial de instrucciones, sin datos comparativos aquí |

## Limitaciones y advertencias

- Licencia "other" no especificada: no se detallan los términos de uso, lo que puede limitar su adopción en entornos comerciales. Se recomienda contactar con los autores antes de usarlo en producción.
- Contexto efectivo limitado: aunque la configuración declara 131.072 posiciones, el tokenizador limita a 16.384 tokens, por lo que no se puede explotar la ventana completa sin modificar el tokenizador.
- Idiomas limitados: la model card solo indica inglés y chino. El rendimiento en otros idiomas no está garantizado.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir contenido factualmente incorrecto, especialmente en tareas abiertas.
- Sesgos del modelo base: al derivar de DeepSeek-R1-Distill-Qwen-1.5B, puede heredar sesgos presentes en los datos de entrenamiento originales.
- Sin soporte de tool calling ni multimodalidad: no es adecuado para agentes que requieran invocar funciones o procesar imágenes/audio.
- Datos de entrenamiento no detallados: no se especifica el número de tokens ni la composición exacta del subconjunto de UltraData-SFT-2605, lo que dificulta evaluar posibles sesgos de datos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Thinking-Space/UltraData-IF-1.5B
- Repositorio GitHub (One-Shot-OPD): https://github.com/Thinking-Space/One-Shot-OPD
- Paper (arXiv, identificador no disponible): https://arxiv.org/abs/XXXX.XXXXX
- Dataset de entrenamiento: https://huggingface.co/datasets/openbmb/UltraData-SFT-2605
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
