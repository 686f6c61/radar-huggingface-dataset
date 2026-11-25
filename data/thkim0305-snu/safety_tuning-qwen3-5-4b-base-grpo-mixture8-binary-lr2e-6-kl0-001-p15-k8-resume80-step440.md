# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr2e-6-kl0.001-p15-k8-resume80-step440

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr2e-6-kl0.001-p15-k8-resume80-step440 es un checkpoint intermedio de ajuste fino mediante aprendizaje por refuerzo (GRPO) sobre el modelo base Qwen/Qwen3.5-4B-Base, desarrollado por el usuario thkim0305-SNU. El objetivo del entrenamiento es el alineamiento de seguridad: se entrena al modelo para que responda de forma segura ante prompts dañinos (jailbreaks, contenido peligroso, código inseguro) sin degradar su utilidad en tareas benignas. El nombre del repositorio codifica la receta: GRPO con recompensa binaria, mezcla de 8 conjuntos de datos ("mixture-8"), learning rate 2e-6, coeficiente KL 0.001, 15 prompts por actualización con 8 rollouts cada uno, reanudado en el paso 80 y exportado en el paso 440.

Se trata de un modelo multimodal de tipo image-text-to-text con arquitectura Qwen3.5 (clase `Qwen3_5ForConditionalGeneration`), 4.659.865.088 parámetros totales (aproximadamente 4,66 mil millones) en precisión bf16. El checkpoint conserva intactos la torre de visión y la cabeza MTP (multi-token prediction) del modelo base; únicamente se ha entrenado el modelo de lenguaje. Por ello, el checkpoint carga exactamente igual que el modelo base, lo que facilita su evaluación comparativa.

Su relevancia es metodológica: documenta de forma transparente una receta completa de RL para seguridad (Slime + SGLang para rollouts, Megatron-LM para entrenamiento, juez Qwen3.8-27B con veredicto binario estricto) y publica la evolución de las puntuaciones del juez por conjunto de datos a lo largo del entrenamiento. No obstante, es un snapshot intermedio con entrenamiento aún en curso, no un modelo final, y su licencia Apache 2.0 heredada del base permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (`Qwen3_5ForConditionalGeneration`), con torre de visión y cabeza MTP; solo se entrena el modelo de lenguaje |
| Parametros totales | 4.659.865.088 (aproximadamente 4,66 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40.960 tokens durante el entrenamiento (contexto de muestreo); contexto nativo del base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se listan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, formato Hugging Face transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base, un transformer multimodal con torre de visión y cabeza de predicción multi-token (MTP). En este checkpoint solo se actualizan los pesos del modelo de lenguaje; la visión y la MTP se copian sin modificar desde el base, y las proyecciones GDN se re-fusionan durante la exportación desde el formato Megatron `torch_dist` al formato Hugging Face. El entrenamiento emplea GRPO (Group Relative Policy Optimization) con recompensas binarias normalizadas por grupo, clip PPO de 0.2 y muestreo por importancia truncado (TIS) activado. La infraestructura combina Slime para los rollouts con SGLang en modo colocado y Megatron-LM para el entrenamiento, todo en bf16.

La receta concreta: 15 prompts por actualización multiplicados por 8 rollouts por prompt (120 secuencias por paso), learning rate constante de 2e-6 con AdamW (betas 0.9 y 0.95, weight decay 0.1, grad clip 1.0), pérdida KL de baja varianza con coeficiente 0.001 respecto al modelo inicial congelado, temperatura 1.0, top-p 1 y hasta 32.768 tokens generados sobre un contexto de 40.960. Se usa la plantilla de chat de Qwen con `enable_thinking=true` y, en los rollouts con herramientas, el function calling `qwen3_coder`. La recompensa la otorga un juez Qwen3.8-27B con veredicto binario estricto (0/1); los prompts de AgentAlign se juzgan sobre toda la trayectoria visible de uso de herramientas. El schedule cubre una época con padding sobre 11.794 prompts únicos, es decir, 787 actualizaciones, con checkpoints cada 40 pasos.

El conjunto de datos "mixture-8" contiene 11.794 prompts: star1_gp3 (1.000), star_benign_v2 (915), agentalign_harmful (2.000), agentalign_benign (2.000), codesafetybench (900), magicoder (1.000), difficult_advice (1.982) y wildjailbreak_benign (1.997). Los 4.000 prompts de AgentAlign incorporan definiciones sintéticas de herramientas y se despliegan como trayectorias multiturno contra un simulador de herramientas, con las salidas de las herramientas enmascaradas en la pérdida. El entrenamiento se ejecutó en una NVIDIA B200 para entrenador y motor de rollout, con el juez en 2x A100 (SGLang TP2) a través de un túnel SSH, reanudado en la actualización 280 desde una ejecución previa en 3x RTX PRO 6000.

## Capacidades

- Generación de texto conversacional multiturno con plantilla de chat de Qwen y modo de razonamiento explícito (`enable_thinking=true`).
- Razonamiento con cadena de pensamiento antes de la respuesta final.
- Entrada de imagen y texto (image-text-to-text), aunque la torre de visión no se ha entrenado en este ajuste.
- Tool calling / function calling mediante el formato `qwen3_coder`, con soporte de trayectorias multiturno de uso de herramientas.
- Comportamiento de agente multi-paso: los rollouts de AgentAlign simulan uso de herramientas con definiciones sintéticas y salidas enmascaradas.
- Alineamiento de seguridad entrenado con recompensa binaria frente a prompts dañinos, jailbreaks y código inseguro.
- Generación de código (el dataset incluye Magicoder y CodeSafetyBench).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Predicción multi-token (cabeza MTP) heredada del base, sin entrenar en este checkpoint.

## Casos de uso

- **Filtrado y moderación de contenido generado**: el modelo puede clasificar o reescribir respuestas potencialmente dañinas en un pipeline de moderación, ya que fue entrenado con recompensa binaria de seguridad sobre prompts de jailbreak y contenido peligroso. Su ventana de 40.960 tokens permite procesar conversaciones completas con contexto.
- **Asistentes conversacionales con salvaguardas**: despliegue en atención al cliente o asistentes internos donde se requiere rechazo controlado de peticiones dañinas sin degradar la utilidad en consultas benignas (el dataset incluye 1.997 prompts benignos de WildJailbreak y 915 de star_benign_v2).
- **Revisión de seguridad de código generado**: integración en pipelines de CI/CD para evaluar si un fragmento de código producido por otro modelo contiene patrones inseguros, aprovechando el entrenamiento sobre CodeSafetyBench y Magicoder.
- **Agentes con uso de herramientas en entornos simulados**: prototipado de agentes que invocan funciones con el formato `qwen3_coder`, útil para validar trayectorias multiturno antes de pasar a producción con herramientas reales.
- **Investigación en alineamiento y RL**: como checkpoint de referencia para estudiar la dinámica de GRPO con recompensas binarias y KL bajo (0.001), comparando la evolución de las puntuaciones del juez por conjunto de datos.
- **Evaluación comparativa de seguridad**: servir como baseline ajustado frente al Qwen3.5-4B-Base original en benchmarks de seguridad y utilidad, dado que comparte tokenizador, arquitectura y pesos de visión/MTP con el base.
- **Generación de explicaciones educativas sobre riesgos**: el ejemplo de la model card (explicar por qué el phishing es peligroso) ilustra el uso para contenido formativo sobre ciberseguridad, donde el modelo debe informar sin facilitar la ejecución del ataque.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente reporta la puntuación media del juez binario durante el entrenamiento (recompensa bruta antes de la normalización por grupo):

| Ventana de actualizaciones | Puntuación media | Rollouts juzgados |
|---|---|---|
| 310-320 | 0.839 | 1200 |
| 350-360 | 0.796 | 1199 |
| 390-400 | 0.786 | 1200 |
| 430-440 | 0.729 | 1200 |

Desglose por conjunto de datos:

| Dataset | 310-320 | 350-360 | 390-400 | 430-440 |
|---|---|---|---|---|
| agentalign_benign | 0.64 | 0.54 | 0.57 | 0.50 |
| agentalign_harmful | 0.89 | 0.94 | 0.85 | 0.85 |
| codesafetybench | 0.94 | 0.89 | 0.91 | 0.83 |
| difficult_advice | 0.85 | 0.77 | 0.68 | 0.62 |
| magicoder | 0.69 | 0.69 | 0.70 | 0.65 |
| star1_gp3 | 0.84 | 0.95 | 0.98 | 0.97 |
| star_benign_v2 | 0.83 | 0.98 | 0.98 | 0.90 |
| wildjailbreak_benign | 0.86 | 0.83 | 0.74 | 0.81 |

La puntuación media cae de 0.839 a 0.729 entre las ventanas 310-320 y 430-440, con descensos notables en difficult_advice (0.85 a 0.62) y agentalign_benign (0.64 a 0.50), mientras star1_gp3 y star_benign_v2 se mantienen altos. Estos datos reflejan la recompensa del juez durante el entrenamiento, no rendimiento en benchmarks externos.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos (el repositorio ocupa 9,3 GB), más caché KV y activaciones; en la práctica se recomienda un mínimo de 16-24 GB para contextos moderados.
- Cuantización a 8 bits: aproximadamente 4,7 GB de pesos; a 4 bits: aproximadamente 2,3 GB de pesos (estimaciones por tamaño, no verificadas en la información disponible).
- GPU recomendadas para bf16: NVIDIA A100 (40/80 GB), H100, B200 o RTX PRO 6000. El entrenamiento se realizó en 1x B200 y en 3x RTX PRO 6000 en la ejecución previa.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bf16 con contexto limitado, y en GPUs de 16 GB o menos mediante cuantización.
- Opciones de despliegue: transformers (con `device_map="auto"`), SGLang (usado en los rollouts del entrenamiento), vLLM y llama.cpp/Ollama si se generan cuantizaciones GGUF (no publicadas en el repositorio).
- Latencia y throughput: no disponibles en la información proporcionada.
- Nota: el checkpoint se carga con `Qwen3_5ForConditionalGeneration` de transformers, por lo que requiere una versión de la librería que incluya la clase Qwen3.5.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8 (este) | 4,66 mil millones | 40.960 (entrenamiento) | Ajuste de seguridad con GRPO sobre Qwen3.5-4B-Base; checkpoint intermedio | Apache 2.0 | Hugging Face (32 descargas) |
| Qwen/Qwen3.5-4B-Base | 4,66 mil millones (no confirmado en la información) | no disponible | Modelo base sin ajuste de seguridad | Apache 2.0 | Hugging Face |
| Alternativas de ajuste de seguridad de 4B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos de seguridad del mismo tamaño en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- **Checkpoint intermedio, no modelo final**: el entrenamiento sigue en curso (440 de 787 actualizaciones planificadas); no debe tratarse como una versión estable para producción.
- **Degradación de la recompensa del juez**: la puntuación media cae de 0.839 a 0.729 entre las ventanas 310-320 y 430-440, con descensos acusados en difficult_advice y agentalign_benign; posible sobreajuste al juez o deriva del comportamiento.
- **Juez como única señal de recompensa**: el alineamiento se basa en un juez Qwen3.8-27B con veredicto binario, lo que puede introducir sesgos del juez y recompensas mal calibradas.
- **Riesgo de alucinación**: no evaluado en la información disponible; el ajuste RL sobre seguridad no garantiza factualidad.
- **Sesgos conocidos**: no documentados en la model card; los conjuntos de datos incluyen prompts de jailbreak y contenido dañino, cuyo sesgo residual no se ha analizado.
- **Idiomas**: no se especifican los idiomas soportados; el entrenamiento se realizó sobre conjuntos de datos predominantemente en inglés, lo que puede degradar el comportamiento en castellano.
- **Visión no entrenada**: la torre de visión conserva los pesos del base y no ha recibido ajuste; su comportamiento multimodal no está validado en este checkpoint.
- **Licencia**: Apache 2.0 permite uso comercial, pero se hereda del modelo base Qwen3.5-4B-Base; conviene revisar los términos del base y las obligaciones de atribución.
- **Cuantizaciones no publicadas**: no hay GGUF ni AWQ/GPTQ oficiales, por lo que el despliegue en hardware limitado requiere conversión propia.
- **Formato de pesos**: requiere una versión de transformers compatible con `Qwen3_5ForConditionalGeneration`; versiones anteriores no cargarán el checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr2e-6-kl0.001-p15-k8-resume80-step440
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Slime (framework de RL): no disponible en la información proporcionada
- Megatron-LM: no disponible en la información proporcionada
- SGLang: no disponible en la información proporcionada
- Paper de GRPO: no disponible en la información proporcionada
