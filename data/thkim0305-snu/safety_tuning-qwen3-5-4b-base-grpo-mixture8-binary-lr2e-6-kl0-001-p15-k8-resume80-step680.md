# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr2e-6-kl0.001-p15-k8-resume80-step680

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8 es un checkpoint intermedio de un proceso de ajuste fino por refuerzo (RLHF con GRPO) sobre el modelo base Qwen/Qwen3.5-4B-Base, desarrollado por el usuario thkim0305-SNU. El objetivo del entrenamiento es el alineamiento de seguridad: reducir respuestas dañinas, mejorar el comportamiento en trayectorias con herramientas (agentes) y mantener utilidad en tareas benignas. No es un modelo final, sino una instantánea en la actualización 680 de un total previsto de 787, por lo que su comportamiento puede ser inestable o incompleto.

El modelo conserva la arquitectura multimodal del base Qwen3.5-4B (clase `Qwen3_5ForConditionalGeneration`, con torre de visión y cabeza MTP intactas) y solo se ha entrenado el modelo de lenguaje. Cuenta con 4.659.865.088 parámetros en bf16 y un contexto de entrenamiento de 40.960 tokens. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial, aunque su naturaleza de snapshot experimental lo hace poco recomendable para producción sin validación adicional.

Su relevancia es metodológica: documenta de forma transparente la receta de GRPO con recompensas binarias, juicio automático mediante un modelo juez (Qwen3.8-27B) y evaluación sobre ocho conjuntos de prompts de seguridad y código. Resulta útil para investigadores que estudien dinámicas de RL de seguridad, no tanto como modelo listo para desplegar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5), clase `Qwen3_5ForConditionalGeneration`; torre de visión y cabeza MTP del base sin entrenar |
| Parámetros totales | 4.659.865.088 (4,66 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40.960 tokens en entrenamiento; longitud nativa del base no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bf16; no se documentan GGUF ni otras) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), compatible con transformers |
| Modelo base | Qwen/Qwen3.5-4B-Base (snapshot `1001bb4d826a`) |
| Tamaño del repositorio | 9,3 GB |
| Pipeline | text-generation (etiquetado también como image-text-to-text) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base, un transformer multimodal con torre de visión y cabeza de predicción multi-token (MTP). En este checkpoint solo se ha actualizado el modelo de lenguaje: la torre de visión y la cabeza MTP conservan los pesos originales, de modo que el checkpoint se carga exactamente igual que el base. Los pesos se exportaron desde Megatron `torch_dist` (iteración 679) mediante la herramienta `safety_tuning.hf_export`, con refusión de proyecciones GDN, mapeo de nombres de Slime para Qwen3.5 y dtypes alineados con el índice del base.

El entrenamiento emplea GRPO con recompensas binarias normalizadas por grupo, clip PPO de 0,2 y TIS activado, sobre el framework Slime (rollouts con SGLang colocados) y Megatron-LM en bf16. Cada actualización usa 15 prompts × 8 rollouts = 120 secuencias, con tasa de aprendizaje constante de 2e-6, AdamW (betas 0,9/0,95), weight decay 0,1, grad clip 1,0 y un término KL de baja varianza con coeficiente 0,001 respecto al modelo inicial congelado. El muestreo usa temperatura 1,0, top-p 1, hasta 32.768 tokens generados y 40.960 de contexto, con plantilla de chat Qwen en modo `enable_thinking=true` y function calling `qwen3_coder`. La recompensa la otorga un juez Qwen3.8-27B con veredicto binario estricto (0/1); los prompts de AgentAlign se juzgan sobre toda la trayectoria visible de herramientas. El plan es una época sobre 11.794 prompts únicos (787 actualizaciones), con checkpoints cada 40.

El conjunto de datos "mixture-8" combina star1_gp3 (1.000), star_benign_v2 (915), agentalign_harmful (2.000), agentalign_benign (2.000), codesafetybench (900), magicoder (1.000), difficult_advice (1.982) y wildjailbreak_benign (1.997). Los 4.000 prompts de AgentAlign incluyen definiciones sintéticas de herramientas y se despliegan como trayectorias multi-turno contra un simulador, con las salidas de herramienta enmascaradas en la pérdida.

## Capacidades

- Generación de texto conversacional con plantilla de chat Qwen y modo de razonamiento explícito (`enable_thinking=true`).
- Razonamiento multi-paso orientado a seguridad: rechazo de peticiones dañinas, consejo prudente y manejo de jailbreaks benignos.
- Tool calling / function calling mediante el formato `qwen3_coder`, con entrenamiento específico en trayectorias de uso de herramientas.
- Comportamiento agéntico multi-turno: los prompts de AgentAlign se entrenan como trayectorias completas contra un simulador de herramientas.
- Capacidad de código: incluye datos de CodeSafetyBench y Magicoder, orientados a código seguro y generación de código.
- Capacidad multimodal heredada del base (torre de visión intacta), aunque el entrenamiento RL solo afecta al lenguaje.
- Capacidades multilingües: no documentadas en la información disponible.

## Casos de uso

- Investigación en RL de seguridad: utilizar el checkpoint para estudiar la evolución de la recompensa del juez a lo largo de las actualizaciones (310 a 680) y analizar dinámicas de colapso o mejora por conjunto de datos.
- Filtrado y moderación de contenido generado: desplegar el modelo como generador de respuestas seguras ante prompts adversarios en un pipeline de evaluación, aprovechando su entrenamiento en wildjailbreak_benign y difficult_advice.
- Agentes con herramientas en entornos controlados: probar trayectorias multi-turno con definiciones sintéticas de herramientas y medir la tasa de éxito en tareas benignas (agentalign_benign), teniendo en cuenta que su recompensa media es la más baja del conjunto (0,39-0,64).
- Generación de código con conciencia de seguridad: integrar en un asistente de programación que priorice prácticas seguras, apoyándose en los datos de codesafetybench y magicoder.
- Línea base para ablaciones: comparar este snapshot con el modelo base o con checkpoints posteriores para aislar el efecto del RL de seguridad sobre el razonamiento y el código.
- Estudio de jueces automáticos: reutilizar la receta de recompensa binaria con un juez de mayor tamaño para reproducir o criticar el esquema de evaluación en trabajos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor documenta la puntuación media de recompensa binaria del juez durante el entrenamiento:

| Ventana de actualizaciones | Puntuación media | Rollouts juzgados |
|---|---|---|
| 310-320 | 0,839 | 1200 |
| 350-360 | 0,796 | 1199 |
| 390-400 | 0,786 | 1200 |
| 430-440 | 0,729 | 1200 |
| 470-480 | 0,722 | 1200 |
| 510-520 | 0,713 | 1200 |
| 550-560 | 0,802 | 1200 |
| 590-600 | 0,778 | 1200 |
| 630-640 | 0,745 | 1199 |
| 670-680 | 0,771 | 1200 |

Desglose por conjunto de datos en la ventana final (670-680): agentalign_benign 0,58; agentalign_harmful 0,73; codesafetybench 0,90; difficult_advice 0,83; magicoder 0,58; star1_gp3 0,88; star_benign_v2 0,88; wildjailbreak_benign 0,90. La puntuación media no muestra una tendencia monótona: alcanza su máximo en las primeras ventanas (0,839) y oscila entre 0,71 y 0,80 en las posteriores.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 12 y 16 GB para contextos moderados y bastante más con 40.960 tokens de contexto.
- Cuantización a 8 bits: en torno a 5 GB de pesos; a 4 bits, en torno a 2,5-3 GB (estimación teórica, no se publican GGUF).
- GPU recomendadas: NVIDIA B200 (usada por el autor para entrenamiento), A100 y H100 para despliegue de referencia; RTX 4090 (24 GB) suficiente para bf16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 (24 GB) y, con cuantización, en GPUs de 12-16 GB.
- Opciones de despliegue: transformers (receta oficial del autor), vLLM, SGLang y TGI son candidatos razonables por tratarse de pesos safetensors estándar; llama.cpp/Ollama requerirían conversión a GGUF, no documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8 (este) | 4,66 B | 40.960 (entrenamiento) | RL de seguridad con GRPO, checkpoint intermedio | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B-Base | no disponible en la información | no disponible | Modelo base multimodal sin alineamiento RL de seguridad | Apache 2.0 | Hugging Face |
| Alternativas de alineamiento de seguridad de ~4 B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables de la misma categoría en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Es un checkpoint intermedio (actualización 680 de 787 previstas): el autor indica explícitamente que el entrenamiento sigue en curso y que no es un modelo final.
- La puntuación media del juez no mejora de forma monótona y cae desde 0,839 en las primeras ventanas a 0,713-0,802 en las posteriores, lo que sugiere inestabilidad del proceso RL.
- El conjunto agentalign_benign obtiene las peores puntuaciones (0,39-0,64), lo que apunta a un posible deterioro de la utilidad en tareas agénticas benignas.
- Riesgo de alucinación: no evaluado con benchmarks estándar; el autor no reporta métricas de factualidad.
- Sesgos conocidos: no documentados.
- Idiomas soportados: no documentados; no se garantiza un comportamiento multilingüe alineado.
- La licencia Apache 2.0 permite uso comercial, pero al ser un snapshot experimental de investigación no se recomienda su despliegue en producción sin una evaluación propia de seguridad y calidad.
- El juicio de recompensa depende de un modelo juez (Qwen3.8-27B) con veredicto binario estricto; pueden existir sesgos del juez heredados por el modelo.
- La torre de visión no se ha entrenado, por lo que las capacidades multimodales son las del base sin alineamiento adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr2e-6-kl0.001-p15-k8-resume80-step680
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Paper, blog o repositorio del método: no disponible en la información proporcionada.
