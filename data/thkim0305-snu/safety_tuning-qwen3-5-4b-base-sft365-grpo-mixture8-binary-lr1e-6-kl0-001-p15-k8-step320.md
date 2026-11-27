# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT365-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step320

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-SFT365-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step320 es un checkpoint intermedio de un proceso de ajuste fino con aprendizaje por refuerzo (GRPO) orientado a seguridad, desarrollado por el usuario thkim0305-SNU. Parte del modelo Qwen3.5-4B-Base de Alibaba, pasa por un SFT intermedio (checkpoint SFT365) y se entrena sobre un conjunto de prompts denominado "mixture-8" con recompensas binarias emitidas por un juez externo (Qwen3.8-27B). El resultado es un modelo de 4.659.865.088 parámetros (aproximadamente 4,66 mil millones) con licencia Apache 2.0.

La relevancia de esta ficha es doble: por un lado, documenta una receta de alineación de seguridad reproducible (Slime + Megatron-LM, GRPO con KL bajo, TIS activado, rollouts multi-turno con simulación de herramientas); por otro, expone las curvas de recompensa del juez durante el entrenamiento, lo que permite evaluar la progresión del modelo en ocho subconjuntos de datos distintos (AgentAlign, CodeSafetyBench, Magicoder, Star1, entre otros). Es un artefacto de investigación, no un modelo final: el autor indica explícitamente que el entrenamiento sigue en curso y que este snapshot corresponde a 320 actualizaciones del optimizador.

Arquitectónicamente hereda la estructura multimodal de Qwen3.5: un transformer con torre de visión y cabeza MTP (multi-token prediction) que permanecen intactas respecto al modelo base; solo se ha entrenado el modelo de lenguaje. El contexto de entrenamiento es de 40.960 tokens y la generación se realiza con plantilla de chat de Qwen con `enable_thinking=true`, lo que habilita un modo de razonamiento explícito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5) con torre de vision y cabeza MTP; clase `Qwen3_5ForConditionalGeneration` |
| Parametros totales | 4.659.865.088 (~4,66 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 40.960 tokens (contexto de entrenamiento); generacion hasta 32.768 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 9,3 GB), bf16 |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint SFT `Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr1e-5-step365`, que a su vez deriva de `Qwen/Qwen3.5-4B-Base` (snapshot `ccd726d2543d`). La exportación a Hugging Face se realizó desde un checkpoint Megatron `torch_dist` (`iter_0000319`) mediante la herramienta `safety_tuning.hf_export`, que refusiona las proyecciones GDN, aplica el mapeo de nombres de Slime para Qwen3.5, copia los pesos de visión y MTP del modelo base y ajusta los dtypes al índice original. Por tanto, el checkpoint carga exactamente igual que el modelo base.

La receta de entrenamiento es GRPO con recompensas binarias normalizadas por grupo, PPO clip de 0,2 y TIS (truncated importance sampling) activado. El framework es Slime (con rollouts SGLang colocados) sobre Megatron-LM en bf16. Cada actualización emplea 15 prompts × 8 rollouts = 120 secuencias, con tasa de aprendizaje constante de 1e-6, AdamW (betas 0,9/0,95), weight decay 0,1 y grad clip 1,0. Se aplica una pérdida KL de baja varianza contra el modelo congelado de partida con coeficiente 0,001. El muestreo usa temperatura 1,0, top-p 1 y plantilla de chat de Qwen con pensamiento habilitado; los rollouts con herramientas emplean el function calling `qwen3_coder`. La recompensa la emite un juez Qwen3.8-27B con veredicto binario estricto (0/1) según la especificación del proyecto; los prompts de AgentAlign se juzgan sobre la trayectoria completa de uso de herramientas visible. El calendario prevé una época con padding sobre 11.794 prompts únicos (787 actualizaciones), con checkpoints cada 40 actualizaciones.

El conjunto "mixture-8" se compone de: star1_gp3 (1.000 prompts), star_benign_v2 (915), agentalign_harmful (2.000), agentalign_benign (2.000), codesafetybench (900), magicoder (1.000), difficult_advice (1.982) y wildjailbreak_benign (1.997). Los 4.000 prompts de AgentAlign llevan definiciones sintéticas de herramientas y se despliegan como trayectorias multi-turno contra un simulador, con las salidas de herramienta enmascaradas en la pérdida.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento explícito (`enable_thinking=true`).
- Generación y razonamiento sobre código, incluyendo escenarios de seguridad de código (CodeSafetyBench, Magicoder).
- Tool calling / function calling mediante el formato `qwen3_coder`, con soporte de trayectorias multi-turno contra herramientas.
- Comportamiento agéntico: los rollouts de AgentAlign simulan uso de herramientas en varios pasos.
- Capacidad multimodal heredada del base (torre de visión intacta), aunque no se ha entrenado específicamente en esta fase.
- Alineación de seguridad: rechazo de peticiones dañinas, manejo de jailbreaks benignos (WildJailbreak) y consejo difícil (difficult_advice).
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Investigación en alineación de seguridad: sirve como punto de comparación intermedio (320 actualizaciones) frente a otros checkpoints de la misma run para estudiar la dinámica de la recompensa del juez a lo largo del entrenamiento.
- Evaluación de robustez frente a jailbreaks: el subconjunto wildjailbreak_benign (1.997 prompts) permite medir la tasa de rechazo correcto en prompts benignos que parecen maliciosos, útil para calibrar falsos positivos de seguridad.
- Moderación de contenido en pipelines de generación: el modelo puede integrarse como clasificador generativo de segundo nivel para decidir si una respuesta es aceptable, apoyándose en su modo de pensamiento para justificar el veredicto.
- Agentes con herramientas en entornos simulados: sus rollouts multi-turno con definiciones sintéticas de herramientas permiten prototipar políticas de uso seguro de funciones antes de desplegarlas contra APIs reales.
- Seguridad en generación de código: el entrenamiento sobre CodeSafetyBench y Magicoder lo hace adecuado para tareas de revisión de snippets peligrosos o de generación de código con restricciones de seguridad.
- Consejo responsable (difficult_advice): útil en asistentes que deben dar recomendaciones delicadas (salud, finanzas) con salvaguardas, gracias al subconjunto de 1.982 prompts específicos.
- Base para experimentos de RLHF/GRPO reproducibles: la receta completa (Slime + Megatron, KL 0,001, juez binario) es reutilizable como plantilla para otros modelos de la familia Qwen3.5.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor únicamente reporta la recompensa media del juez durante el entrenamiento (media binaria cruda antes de normalización por grupo), con 1.200 rollouts juzgados por ventana:

| Ventana (updates) | Score medio | Rollouts juzgados |
|---|---|---|
| 0-10 | 0,735 | 1.200 |
| 30-40 | 0,718 | 1.200 |
| 70-80 | 0,813 | 1.200 |
| 110-120 | 0,817 | 1.200 |
| 150-160 | 0,857 | 1.200 |
| 190-200 | 0,868 | 1.200 |
| 230-240 | 0,857 | 1.200 |
| 270-280 | 0,880 | 1.200 |
| 310-320 | 0,911 | 1.200 |

Desglose por subconjunto en la última ventana (310-320): agentalign_benign 0,82; agentalign_harmful 0,96; codesafetybench 0,92; difficult_advice 0,90; magicoder 0,80; star1_gp3 0,99; star_benign_v2 0,93; wildjailbreak_benign 0,90. Destaca la mejora de magicoder (0,38 → 0,80) y de agentalign_benign (0,48 → 0,82), mientras que agentalign_harmful se mantiene estable en torno a 0,94-0,98 desde el inicio.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda un mínimo de 16-24 GB para contexto moderado.
- Cuantización: no se han publicado versiones GGUF/AWQ/GPTQ en el repo; sería necesario generarlas con herramientas como llama.cpp o AutoAWQ.
- GPU recomendadas: el entrenamiento se realizó en 4× H100 80GB (keti_h100_0), con juez TP2 en GPUs 4-5, trainer en GPU 6 (estado del optimizador en CPU) y motor de rollout en GPU 7. Para inferencia, una A100 40GB o H100 80GB ofrecen margen amplio; una RTX 4090 (24 GB) es suficiente en bf16 para contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) o RTX 4080 (16 GB) con cuantización a 8 bits.
- Opciones de despliegue: transformers (biblioteca indicada), vLLM, TGI y SGLang (usado en los rollouts). llama.cpp/Ollama requerirían conversión previa a GGUF.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-SFT365-GRPO-Mixture8-binary (este) | 4,66 B | 40.960 | Apache 2.0 | Seguridad + agéntico (GRPO, checkpoint intermedio) |
| Qwen3.5-4B-Base (modelo base) | ~4 B (no confirmado) | no disponible | Apache 2.0 | Modelo base multimodal sin alineación específica de seguridad |
| Checkpoint SFT365 (padre directo) | 4,66 B | no disponible | Apache 2.0 | SFT sobre mixture-8, sin GRPO |
| Alternativas de la misma categoría (p. ej. Llama Guard, ShieldGemma) | no disponible | no disponible | no disponible | Clasificadores de seguridad; no comparables directamente por arquitectura |

No se dispone de datos de benchmarks comparativos en la información proporcionada; la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Es un checkpoint intermedio (320 de 787 actualizaciones previstas): el autor advierte que el entrenamiento sigue en curso y que no es un modelo final.
- Solo se ha entrenado el modelo de lenguaje; la torre de visión y la cabeza MTP conservan los pesos del base sin ajuste específico de seguridad, por lo que la seguridad multimodal no está garantizada.
- Riesgo de alucinación inherente a un modelo de 4,66 B; no se han publicado evaluaciones de factualidad.
- Sesgos conocidos: no documentados en la información disponible; al derivar de Qwen3.5-Base, hereda los sesgos del corpus original.
- Idiomas soportados no documentados; el entrenamiento se realizó sobre prompts presumiblemente en inglés (no confirmado).
- El juez de recompensa es un modelo (Qwen3.8-27B) con veredicto binario estricto: puede introducir sesgos de evaluación y sobreajuste al criterio del juez (reward hacking), especialmente en subconjuntos con recompensa media muy alta como star1_gp3 (0,99).
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B-Base tiene su propia licencia enlazada (`LICENSE` de Qwen); conviene verificar compatibilidad antes de producción.
- No se han publicado versiones cuantizadas ni artefactos GGUF; el despliegue en entornos de bajos recursos requiere conversión manual.
- El modelo no ha sido evaluado con benchmarks estándar de seguridad ni de capacidad, por lo que su idoneidad para producción no está validada.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT365-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step320
- Modelo base intermedio (SFT365): https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr1e-5-step365
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Paper de GRPO: no disponible en la información proporcionada
- Repositorio de Slime: no disponible en la información proporcionada
- Repositorio de Megatron-LM: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
