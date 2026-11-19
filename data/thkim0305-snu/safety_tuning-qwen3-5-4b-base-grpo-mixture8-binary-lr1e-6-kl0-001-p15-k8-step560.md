# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step560

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step560 es un checkpoint intermedio de ajuste fino por refuerzo (GRPO) sobre Qwen/Qwen3.5-4B-Base, desarrollado por el usuario thkim0305-SNU. El objetivo del entrenamiento es el alineamiento de seguridad: reducir respuestas dañinas y mejorar el comportamiento en trayectorias de uso de herramientas (tool calling) sin degradar capacidades benignas. No se trata de un modelo final, sino de una instantánea del paso 560 de un entrenamiento que sigue en curso.

El modelo conserva la arquitectura completa del base Qwen3.5-4B (transformer multimodal con torre de visión y cabeza MTP), pero solo se entrenaron los pesos del modelo de lenguaje; la torre de visión y la cabeza MTP permanecen intactas. El checkpoint se exporta en bf16 y se carga exactamente igual que el modelo base mediante `Qwen3_5ForConditionalGeneration`.

Es relevante porque documenta de forma transparente el proceso de RL de seguridad con recompensas binarias juzgadas por un modelo externo (Qwen3.8-27B), incluyendo la evolución de la puntuación del juez por conjunto de datos a lo largo de 560 actualizaciones. Su licencia Apache 2.0 y su tamaño de 4,66 mil millones de parámetros lo hacen accesible para experimentación en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5), con torre de vision y cabeza MTP |
| Parametros totales | 4.659.865.088 (4,66 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 40.960 tokens (usado en entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base, un transformer multimodal que incluye una torre de visión y una cabeza MTP (multi-token prediction). En este checkpoint solo se actualizaron los pesos del modelo de lenguaje; la torre de visión y la cabeza MTP son los pesos originales del base, por lo que el checkpoint se carga de forma idéntica al modelo base.

El entrenamiento emplea GRPO (Group Relative Policy Optimization) con recompensas binarias normalizadas por grupo, clip PPO de 0,2 y TIS activado. El framework es Slime (con rollouts SGLang colocados) junto con Megatron-LM en bf16. Cada actualización usa 15 prompts por 8 rollouts por prompt (120 secuencias), con tasa de aprendizaje constante de 1e-6, AdamW (betas 0,9/0,95), weight decay 0,1, grad clip 1,0 y una pérdida KL de baja varianza con coeficiente 0,001 respecto al modelo inicial congelado. El muestreo usa temperatura 1,0, top-p 1, hasta 32.768 tokens generados y contexto de 40.960. Se activa `enable_thinking=true` en la plantilla de chat de Qwen y las trayectorias de herramientas usan function calling `qwen3_coder`. La recompensa la otorga un juez Qwen3.8-27B con veredicto binario estricto (0/1) según la especificación del proyecto; los prompts de AgentAlign se juzgan sobre toda la trayectoria visible de herramientas.

El conjunto de datos "mixture-8" suma 11.794 prompts únicos repartidos en ocho fuentes: star1_gp3 (1.000), star_benign_v2 (915), agentalign_harmful (2.000), agentalign_benign (2.000), codesafetybench (900), magicoder (1.000), difficult_advice (1.982) y wildjailbreak_benign (1.997). Los 4.000 prompts de AgentAlign incluyen definiciones sintéticas de herramientas y se despliegan como trayectorias multi-turno contra un simulador, con las salidas de herramienta enmascaradas en la pérdida. El plan de entrenamiento es una época con padding sobre 11.794 prompts, equivalente a 787 actualizaciones, con checkpoints cada 80 actualizaciones. Este checkpoint corresponde a la actualización 560 (iteración Megatron 559).

## Capacidades

- Generación de texto conversacional con plantilla de chat de Qwen y modo de razonamiento explícito (`enable_thinking=true`).
- Razonamiento multi-paso mediante cadenas de pensamiento.
- Uso de herramientas y function calling con el formato `qwen3_coder`, incluyendo trayectorias multi-turno contra simuladores.
- Comportamiento de seguridad alineado: rechazo de peticiones dañinas y respuestas seguras en contextos de consejo difícil, jailbreak benigno y seguridad de código.
- Capacidades multimodales heredadas del base (torre de visión intacta), aunque no fueron entrenadas en este proceso.
- Capacidades de generación de código heredadas del base, con ajuste específico en seguridad de código (codesafetybench, magicoder).
- Capacidades multilingües: no documentadas en la información disponible.

## Casos de uso

- Evaluación de seguridad en pipelines de RL: el checkpoint sirve como referencia intermedia para estudiar la evolución de la recompensa del juez (de 0,417 en las actualizaciones 0-10 a 0,841 en las 550-560) y comparar curvas por conjunto de datos.
- Filtrado de contenido dañino en asistentes conversacionales: el ajuste con agentalign_harmful (puntuación del juez de 0,93 en el paso 560) permite desplegar un modelo de 4,66 B que rechaza peticiones dañinas en conversaciones multi-turno.
- Asistentes con tool calling en entornos controlados: el entrenamiento con trayectorias AgentAlign y function calling `qwen3_coder` lo hace adecuado para prototipos de agentes que invocan herramientas simuladas.
- Investigación en alineamiento y recompensas binarias: útil para reproducir o comparar recetas GRPO con juez externo, clip 0,2 y KL 0,001.
- Generación de código con requisitos de seguridad: el ajuste sobre codesafetybench (0,95 en el paso 560) y magicoder (0,68) permite experimentar con generación de código que evita patrones inseguros.
- Moderación de consejos sensibles: el conjunto difficult_advice (0,84 en el paso 560) entrena respuestas prudentes ante consultas delicadas.
- Base para ajuste posterior: al conservar la arquitectura y los pesos de visión del base, puede servir como punto de partida para fine-tuning específico con licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la puntuación media de recompensa binaria del juez durante el entrenamiento (media bruta antes de normalización por grupo):

| Ventana de actualizaciones | Puntuación media | Rollouts juzgados |
|---|---|---|
| 0-10 | 0,417 | 1200 |
| 30-40 | 0,467 | 1200 |
| 70-80 | 0,578 | 1200 |
| 110-120 | 0,629 | 1200 |
| 150-160 | 0,708 | 1200 |
| 190-200 | 0,715 | 1200 |
| 230-240 | 0,768 | 1200 |
| 270-280 | 0,779 | 1200 |
| 310-320 | 0,837 | 1200 |
| 350-360 | 0,750 | 1200 |
| 390-400 | 0,804 | 1200 |
| 430-440 | 0,793 | 1200 |
| 470-480 | 0,801 | 1200 |
| 510-520 | 0,740 | 1200 |
| 550-560 | 0,841 | 1200 |

Desglose por conjunto de datos en el paso 550-560: agentalign_benign 0,68; agentalign_harmful 0,93; codesafetybench 0,95; difficult_advice 0,84; magicoder 0,68; star1_gp3 0,96; star_benign_v2 0,91; wildjailbreak_benign 0,85.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos (tamaño del repo), más overhead de activaciones y caché KV; en la práctica se recomienda al menos 12-16 GB para contexto moderado.
- GPU recomendadas: B200 (usadas en el entrenamiento), A100 40/80 GB, H100; para inferencia basta con una GPU de 24 GB en bf16 con contexto limitado.
- Cabe en GPU de consumo: sí, en tarjetas con 16-24 GB (RTX 4090, RTX 4080, RTX 3090) usando bf16 o cuantización de 8/4 bits, aunque los tipos de cuantización no están documentados.
- Opciones de despliegue: transformers (carga directa con `Qwen3_5ForConditionalGeneration`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, aunque al ser un checkpoint estándar de transformers deberían ser viables.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8 (este) | 4,66 B | 40.960 | Apache 2.0 | Checkpoint intermedio de RL de seguridad, paso 560 de 787 |
| Qwen/Qwen3.5-4B-Base | 4,66 B | no disponible en la información | Apache 2.0 | Modelo base sin ajuste de seguridad |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | No se dispone de datos de benchmarks comparables |

## Limitaciones y advertencias

- Es un checkpoint intermedio, no un modelo final: el entrenamiento sigue en curso (paso 560 de 787 previstos) y su comportamiento puede ser inestable o inconsistente.
- La puntuación del juez fluctúa entre ventanas (por ejemplo, baja de 0,837 en 310-320 a 0,750 en 350-360 y a 0,740 en 510-520), lo que indica variabilidad en el alineamiento.
- El rendimiento se mide con un juez automático (Qwen3.8-27B) y recompensas binarias; no hay evaluación con benchmarks estándar ni validación humana documentada.
- Riesgo de alucinación: no evaluado ni documentado en la información disponible.
- Sesgos conocidos: no documentados.
- Idiomas soportados: no disponibles; no se garantiza cobertura multilingüe más allá del base.
- La torre de visión y la cabeza MTP no fueron entrenadas, por lo que el comportamiento multimodal no está ajustado para seguridad.
- Licencia Apache 2.0 permite uso comercial, pero al ser un checkpoint de investigación sin evaluación de producción, se recomienda validación adicional antes de desplegarlo.
- El entrenamiento usó solo dos GPU B200 y 11.794 prompts; la escala es limitada y puede no generalizar a dominios fuera de mixture-8.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step560
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Paper de GRPO: no disponible en la información proporcionada
- Repositorio de Slime: no disponible en la información proporcionada
- Repositorio de Megatron-LM: no disponible en la información proporcionada
