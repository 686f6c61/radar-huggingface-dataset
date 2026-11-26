# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT365-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step200

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-SFT365-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step200 es un checkpoint intermedio de un proceso de ajuste fino con aprendizaje por refuerzo (GRPO) orientado a la seguridad, desarrollado por el usuario thkim0305-SNU. Parte de Qwen/Qwen3.5-4B-Base, pasa por un ajuste supervisado (SFT) previo y se entrena mediante RL con recompensas binarias evaluadas por un juez (Qwen3.8-27B). El modelo es multimodal (image-text-to-text) con arquitectura Qwen3_5ForConditionalGeneration, aunque solo se ha entrenado el modelo de lenguaje: la torre de visión y la cabeza MTP conservan los pesos originales.

Con 4.659.865.088 parámetros totales (aproximadamente 4,66 mil millones) y pesos en bf16, el checkpoint ocupa 9,3 GB en el repositorio. Se distribuye bajo licencia Apache 2.0 y es compatible con transformers y endpoints. El interés principal reside en su receta de alineación de seguridad: GRPO con normalización de grupo sobre recompensas binarias, KL bajo contra el punto de partida congelado, y un conjunto de prompts "mixture-8" que mezcla datos de seguridad, uso de herramientas y código.

Es relevante ahora porque documenta de forma transparente la evolución del reward del juez a lo largo de 200 actualizaciones, con checkpoints cada 40 pasos, lo que permite estudiar la dinámica de la alineación de seguridad en un modelo pequeño y multimodal. No obstante, se trata de un snapshot intermedio, no de un modelo final, y el propio autor advierte que el entrenamiento sigue en curso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (`Qwen3_5ForConditionalGeneration`), con torre de visión y cabeza MTP; solo se entrena el modelo de lenguaje |
| Parametros totales | 4.659.865.088 (~4,66 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40.960 tokens (contexto de entrenamiento/rollout) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se listan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal de la familia Qwen3.5 con 4,66 B de parámetros. La arquitectura incluye una torre de visión y una cabeza MTP (multi-token prediction), pero ambas conservan los pesos del modelo base sin modificar; únicamente se entrena el modelo de lenguaje. Los pesos se exportan en bf16 como `Qwen3_5ForConditionalGeneration`, con las proyecciones GDN re-fusionadas y el mapeo de nombres de Slime para Qwen3.5, de modo que el checkpoint carga exactamente igual que el modelo base.

El entrenamiento combina SFT previo (el checkpoint de partida es el SFT-Mixture8-genv2gp3-lr1e-5-step365) con GRPO sobre recompensas binarias normalizadas por grupo, PPO clip de 0,2 y TIS activado. Se usa el framework Slime (rollouts con SGLang, colocados) junto con Megatron-LM en bf16. Cada actualización emplea 15 prompts x 8 rollouts = 120 secuencias, con learning rate constante de 1e-6, AdamW (betas 0,9/0,95), weight decay 0,1 y grad clip 1,0, además de una pérdida KL de baja varianza con coeficiente 0,001 contra el punto de partida congelado. El muestreo usa temperatura 1,0, top-p 1, hasta 32.768 tokens generados y 40.960 de contexto, con plantilla de chat de Qwen y `enable_thinking=true`; los rollouts de herramientas usan function calling `qwen3_coder`. La recompensa la otorga un juez Qwen3.8-27B con veredicto binario estricto (0/1), y los prompts de AgentAlign se juzgan sobre toda la trayectoria visible de herramientas. El schedule contempla una época con padding sobre 11.794 prompts únicos (787 actualizaciones), con checkpoints cada 40 pasos; este snapshot corresponde a 200 actualizaciones (iteración Megatron 199).

Los datos de entrenamiento (mixture-8) se componen de: star1_gp3 (1000 prompts), star_benign_v2 (915), agentalign_harmful (2000), agentalign_benign (2000), codesafetybench (900), magicoder (1000), difficult_advice (1982) y wildjailbreak_benign (1997). 4000 prompts de AgentAlign llevan definiciones sintéticas de herramientas y se despliegan como trayectorias multi-turno contra un simulador, con las salidas de herramienta enmascaradas en la pérdida.

## Capacidades

- Generación de texto conversacional y razonamiento con modo de pensamiento activable (`enable_thinking=true`).
- Procesamiento de imagen y texto (pipeline image-text-to-text), aunque la torre de visión no se ha entrenado en esta fase.
- Uso de herramientas y function calling mediante el formato `qwen3_coder`, con trayectorias multi-turno.
- Comportamiento de agente en escenarios con herramientas simuladas (datos AgentAlign).
- Alineación de seguridad: rechazo de peticiones dañinas y manejo de prompts de jailbreak, según la receta de RL.
- Capacidades de código, incluyendo seguridad en código (codesafetybench) y generación de código (magicoder).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en alineación de seguridad: sirve como checkpoint intermedio para estudiar cómo evoluciona el reward del juez durante el GRPO, con curvas por dataset (por ejemplo, agentalign_benign pasa de 0,48 a 0,71 entre las actualizaciones 0-10 y 190-200).
- Evaluación de robustez frente a jailbreaks: el modelo se ha entrenado con wildjailbreak_benign y star_benign_v2, lo que permite medir la tasa de rechazo ante prompts adversarios en un modelo de 4,66 B.
- Agentes con uso de herramientas en entornos controlados: soporta function calling `qwen3_coder` y trayectorias multi-turno, adecuado para probar pipelines de agentes con simuladores de herramientas.
- Filtrado y moderación de contenido: puede emplearse como clasificador generativo de peticiones dañinas, aunque su tamaño reducido limita la precisión frente a modelos mayores.
- Generación de código con criterios de seguridad: el entrenamiento sobre codesafetybench y magicoder lo hace útil para experimentar con asistentes de código que eviten patrones inseguros.
- Base para ajuste posterior: al ser un checkpoint intermedio con licencia Apache 2.0, puede servir como punto de partida para SFT o RL adicionales en dominios específicos.
- Experimentos de razonamiento con thinking mode: permite comparar respuestas con y sin `enable_thinking` en tareas de consejo difícil (difficult_advice) y seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor solo reporta la puntuación media del juez binario durante el entrenamiento:

| Ventana de actualizaciones | Puntuación media | Rollouts juzgados |
|---|---|---|
| 0-10 | 0,735 | 1200 |
| 30-40 | 0,718 | 1200 |
| 70-80 | 0,813 | 1200 |
| 110-120 | 0,817 | 1200 |
| 150-160 | 0,857 | 1200 |
| 190-200 | 0,868 | 1200 |

Desglose por dataset (puntuación del juez):

| Dataset | 0-10 | 30-40 | 70-80 | 110-120 | 150-160 | 190-200 |
|---|---|---|---|---|---|---|
| agentalign_benign | 0,48 | 0,49 | 0,63 | 0,69 | 0,70 | 0,71 |
| agentalign_harmful | 0,96 | 0,94 | 0,97 | 0,93 | 0,97 | 0,98 |
| codesafetybench | 0,65 | 0,89 | 0,94 | 0,86 | 0,96 | 0,95 |
| difficult_advice | 0,88 | 0,90 | 0,88 | 0,94 | 0,95 | 0,97 |
| magicoder | 0,38 | 0,26 | 0,19 | 0,47 | 0,55 | 0,56 |
| star1_gp3 | 0,77 | 0,94 | 0,97 | 0,98 | 0,97 | 1,00 |
| star_benign_v2 | 0,72 | 0,64 | 0,72 | 0,82 | 0,94 | 0,82 |
| wildjailbreak_benign | 0,68 | 0,63 | 0,79 | 0,78 | 0,81 | 0,87 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 16-24 GB para contexto largo.
- En cuantización de 8 bits, la huella de pesos bajaría a unos 4,7 GB; en 4 bits, a unos 2,3 GB (estimaciones teóricas, no publicadas por el autor).
- GPU recomendadas: H100 80GB (el autor usó 4x H100 para entrenamiento, con el motor de rollout en una GPU), A100 40/80GB para inferencia con contexto largo.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bf16 con contexto moderado, y en GPUs de 16 GB con cuantización.
- Opciones de despliegue: transformers (receta oficial), y por compatibilidad con Qwen3.5 potencialmente vLLM, TGI, llama.cpp u Ollama, aunque no se documentan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-SFT365-GRPO-Mixture8 (este) | ~4,66 B | 40.960 | Apache 2.0 | Seguridad + agentes, checkpoint intermedio |
| Qwen/Qwen3.5-4B-Base | ~4 B (según nombre) | no disponible | Apache 2.0 | Modelo base multimodal |
| SFT-Mixture8-genv2gp3-lr1e-5-step365 (modelo base de este) | ~4,66 B | no disponible | Apache 2.0 | SFT previo al RL |
| Alternativas de seguridad de tamaño similar | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio (200 de 787 actualizaciones), no un modelo final; el autor indica que el entrenamiento sigue en curso.
- La torre de visión y la cabeza MTP no se han entrenado: las capacidades visuales son las del modelo base y no han sido alineadas en seguridad.
- El reward depende de un juez automático (Qwen3.8-27B) con veredicto binario, lo que puede introducir sesgos del juez y sobreajuste a su criterio.
- Riesgo de alucinación inherente a modelos de 4,66 B, especialmente en contextos largos (40.960 tokens) y en modo thinking.
- Idiomas soportados no documentados; el comportamiento multilingüe no está garantizado.
- La puntuación en magicoder es baja (0,56 al final), lo que sugiere capacidad de código limitada en comparación con el resto de tareas.
- Aunque la licencia es Apache 2.0, conviene revisar la licencia del modelo base Qwen3.5-4B-Base para uso comercial.
- No se han publicado benchmarks estándar ni evaluaciones externas; el uso en producción requiere validación propia.
- El entrenamiento se realizó con datos sintéticos de herramientas (AgentAlign), lo que puede no reflejar entornos reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT365-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step200
- Modelo base (SFT): https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr1e-5-step365
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
