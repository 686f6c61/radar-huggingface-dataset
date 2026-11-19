# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step480

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step480 es un checkpoint intermedio de ajuste fino por refuerzo (GRPO) sobre Qwen/Qwen3.5-4B-Base, desarrollado por el usuario thkim0305-SNU. El objetivo del entrenamiento es la alineación de seguridad: el modelo se optimiza para responder de forma segura ante prompts dañinos, ambiguos o de asesoramiento delicado, y para mantener ese comportamiento en trayectorias de uso de herramientas de múltiples turnos. Se trata de un snapshot del paso 480 de un entrenamiento que aún estaba en curso en el momento de la exportación, no de un modelo final.

La relevancia del checkpoint es doble. Por un lado, aplica GRPO con recompensas binarias juzgadas por un modelo juez (Qwen3.8-27B) sobre un conjunto de prompts denominado "mixture-8" que combina datos de seguridad, código, jailbreak benigno y trayectorias agénticas. Por otro, conserva intactos los pesos de la torre de visión y de la cabeza MTP del modelo base, de modo que solo se ha entrenado el modelo de lenguaje y el checkpoint se carga exactamente igual que el base.

El modelo tiene 4.659.865.088 parámetros totales (aproximadamente 4,66 mil millones), se distribuye en safetensors en bf16 con un repositorio de 9,3 GB y emplea la licencia Apache 2.0 heredada de Qwen3.5-4B-Base. Su pipeline declarado es text-generation, aunque la arquitectura subyacente es multimodal (image-text-to-text) y el contexto de entrenamiento alcanza los 40.960 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (`Qwen3_5ForConditionalGeneration`), con torre de visión y cabeza MTP; solo se entrena el modelo de lenguaje |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40.960 tokens en entrenamiento; la longitud máxima nativa del base no se detalla en la información disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |
| Modelo base | Qwen/Qwen3.5-4B-Base (snapshot `1001bb4d826a`) |
| Framework de entrenamiento | Slime (rollouts con SGLang) + Megatron-LM |
| Algoritmo | GRPO con recompensas binarias normalizadas por grupo, PPO clip 0.2, TIS activado |
| Paso del checkpoint | 480 actualizaciones del optimizador (iteración Megatron 479) |

## Arquitectura y entrenamiento

El checkpoint parte de Qwen3.5-4B-Base, un transformer multimodal de la familia Qwen3.5 con torre de visión y cabeza MTP (multi-token prediction). Durante este ajuste solo se actualizan los pesos del modelo de lenguaje: la torre de visión y la cabeza MTP se copian sin modificar desde el base, y la exportación a Hugging Face re-fusiona las proyecciones GDN y aplica el mapeo de nombres de Slime para Qwen3.5. El resultado se carga con `Qwen3_5ForConditionalGeneration` sin cambios de código respecto al base.

El entrenamiento usa GRPO con recompensas binarias (0/1) emitidas por un juez Qwen3.8-27B que aplica la especificación del proyecto. Cada actualización procesa 15 prompts con 8 rollouts cada uno (120 secuencias), con temperatura 1.0, top-p 1, hasta 32.768 tokens generados y 40.960 de contexto. Se aplica una pérdida KL de baja varianza con coeficiente 0.001 contra el modelo congelado de partida, learning rate constante de 1e-6, AdamW con betas [0.9, 0.95], weight decay 0.1 y grad clip 1.0. El programa contempla una época sobre 11.794 prompts únicos (787 actualizaciones) con checkpoints cada 80 pasos; este snapshot corresponde al paso 480. Los rollouts usan la plantilla de chat de Qwen con `enable_thinking=true` y, en las trayectorias de herramientas, el formato de function calling `qwen3_coder` contra un simulador de herramientas con las salidas enmascaradas en la pérdida.

El conjunto "mixture-8" se compone de star1_gp3 (1.000 prompts), star_benign_v2 (915), agentalign_harmful (2.000), agentalign_benign (2.000), codesafetybench (900), magicoder (1.000), difficult_advice (1.982) y wildjailbreak_benign (1.997). Los 4.000 prompts de AgentAlign incorporan definiciones sintéticas de herramientas y se despliegan como trayectorias multi-turno.

## Capacidades

- Generación de texto conversacional con plantilla de chat de Qwen y modo de pensamiento activable mediante `enable_thinking=true`.
- Razonamiento con trazas de pensamiento antes de la respuesta final.
- Respuestas de seguridad alineadas: rechazo o reformulación ante prompts dañinos, de jailbreak o de asesoramiento delicado, entrenado explícitamente con recompensas binarias de un juez.
- Uso de herramientas (tool calling / function calling) en formato `qwen3_coder`, con soporte de trayectorias multi-turno contra un simulador de herramientas.
- Comportamiento agéntico multi-paso: el conjunto AgentAlign entrena rollouts completos de uso de herramientas, tanto en escenarios dañinos como benignos.
- Generación de código, incluyendo escenarios de seguridad en código (CodeSafetyBench) y datos de instrucción de código (Magicoder).
- Capacidades multimodales heredadas del base (torre de visión intacta), aunque el ajuste se centra en el modelo de lenguaje y la model card no documenta su evaluación.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Moderación y reescritura de respuestas en asistentes conversacionales: el modelo puede emplearse como capa de alineación sobre Qwen3.5-4B-Base para que las respuestas a prompts sensibles sigan la política de seguridad del proyecto, gracias al entrenamiento GRPO con recompensas binarias de un juez.
- Filtrado de jailbreaks y prompts adversarios: el conjunto wildjailbreak_benign y star_benign_v2 entrenan explícitamente la distinción entre solicitudes legítimas y ataques, lo que permite usar el modelo para clasificar o reescribir entradas sospechosas antes de pasarlas a un modelo mayor.
- Asesores automatizados en dominios delicados (salud, finanzas, legal): el dataset difficult_advice (1.982 prompts) entrena respuestas prudentes ante consultas de consejo difíciles, adecuado para asistentes que deben evitar recomendaciones dañinas.
- Agentes con herramientas en entornos sensibles: las 4.000 trayectorias AgentAlign permiten desplegar el modelo como agente que decide cuándo invocar herramientas y cómo responder a sus salidas sin ejecutar acciones dañinas, con formato `qwen3_coder`.
- Revisión de seguridad de código generado: el entrenamiento sobre CodeSafetyBench y Magicoder lo hace apto para pipelines de CI/CD que detecten o corrijan sugerencias de código inseguras antes de fusionarlas.
- Investigación en alineación y RLHF/GRPO: al ser un checkpoint intermedio con métricas por ventana de actualizaciones publicadas, sirve como referencia para estudiar la dinámica de recompensas durante el entrenamiento y comparar recetas de seguridad.
- Prototipado en hardware de consumo: con 4,66 mil millones de parámetros en bf16, el modelo cabe en GPUs de gama alta para consumidores y permite iterar sobre políticas de seguridad sin infraestructura de centro de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card únicamente reporta la recompensa media binaria del juez durante el entrenamiento, por ventana de actualizaciones y por subconjunto de datos:

| Ventana (updates) | Recompensa media | Rollouts juzgados |
|---|---|---|
| 0-10 | 0.417 | 1200 |
| 30-40 | 0.467 | 1200 |
| 70-80 | 0.578 | 1200 |
| 110-120 | 0.629 | 1200 |
| 150-160 | 0.708 | 1200 |
| 190-200 | 0.715 | 1200 |
| 230-240 | 0.768 | 1200 |
| 270-280 | 0.779 | 1200 |
| 310-320 | 0.837 | 1200 |
| 350-360 | 0.750 | 1200 |
| 390-400 | 0.804 | 1200 |
| 430-440 | 0.793 | 1200 |
| 470-480 | 0.801 | 1200 |

Desglose por subconjunto en la ventana final (470-480): agentalign_benign 0.66, agentalign_harmful 0.88, codesafetybench 0.92, difficult_advice 0.82, magicoder 0.77, star1_gp3 0.86, star_benign_v2 0.94 y wildjailbreak_benign 0.78. Se observa una meseta y cierta volatilidad a partir de la ventana 310-320 (pico de 0.837 y descenso a 0.750 en 350-360), lo que sugiere que el entrenamiento aún no ha convergido.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 9,3 GB solo para pesos, más overhead de activaciones y caché KV; con 40.960 tokens de contexto la caché KV puede añadir varios GB adicionales según la configuración de atención.
- Cuantización: no se publican variantes GGUF, AWQ ni GPTQ; para reducir VRAM habría que generarlas a partir de los safetensors bf16.
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y para inferencia con contexto máximo; una RTX 4090 (24 GB) es suficiente para inferencia en bf16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 (24 GB) y previsiblemente en GPUs de 16 GB si se cuantiza a 8 bits, aunque esa cuantización no está publicada.
- Opciones de despliegue: transformers (código de ejemplo de la model card con `Qwen3_5ForConditionalGeneration`), vLLM y SGLang (usado en los rollouts del entrenamiento); llama.cpp y Ollama requerirían conversión a GGUF, no disponible.
- Latencia y throughput: no disponibles. El entrenamiento se ejecutó en dos B200 (juez en GPU 0, entrenador y motor de rollouts en GPU 1), dato que no debe interpretarse como requisito de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8 (este) | 4,66 B | 40.960 en entrenamiento | Ajuste GRPO de seguridad sobre Qwen3.5-4B-Base | Apache 2.0 | Hugging Face, checkpoint intermedio |
| Qwen/Qwen3.5-4B-Base | ~4,66 B | no disponible en la información | Modelo base multimodal sin ajuste de seguridad | Apache 2.0 | Hugging Face |
| Alternativas de seguridad de ~4 B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos de seguridad del mismo tamaño en la información proporcionada, por lo que la comparación se limita al modelo base del que deriva.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 480 de 787 previstos): el autor indica explícitamente que el entrenamiento seguía en curso y que no es un modelo final.
- La recompensa media fluctúa entre ventanas (0.837 en 310-320 frente a 0.750 en 350-360), lo que apunta a inestabilidad y a que el comportamiento de seguridad puede no ser consistente.
- El ajuste se guía por un juez automático (Qwen3.8-27B) con veredictos binarios; los sesgos del juez pueden transferirse al modelo y no se reportan evaluaciones con anotadores humanos.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad ni de tasa de alucinación; el entrenamiento prioriza la seguridad sobre la factualidad.
- Sesgos conocidos: no documentados en la información disponible.
- Idiomas soportados: no documentados; el comportamiento multilingüe tras el ajuste de seguridad no está evaluado.
- Solo se ha entrenado el modelo de lenguaje: las capacidades de visión y MTP son las del base y no se han validado tras el ajuste.
- Licencia Apache 2.0, que permite uso comercial, pero hereda las condiciones del modelo base Qwen3.5-4B-Base; conviene revisar la licencia original enlazada en la model card.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación externa.
- Uso en producción: no recomendable sin una evaluación propia de seguridad, dado que se trata de un snapshot no final y sin benchmarks publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step480
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
