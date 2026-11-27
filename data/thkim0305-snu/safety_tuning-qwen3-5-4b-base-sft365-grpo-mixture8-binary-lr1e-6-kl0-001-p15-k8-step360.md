# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT365-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step360

## Resumen

Se trata de un checkpoint intermedio de ajuste fino con RLHF (concretamente GRPO) orientado a seguridad, derivado de `thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr1e-5-step365`, que a su vez parte de `Qwen/Qwen3.5-4B-Base`. Lo publica el usuario `thkim0305-SNU` (Universidad Nacional de Seúl) como parte de un proyecto de investigación sobre alineamiento de seguridad en modelos multimodales de 4B. El modelo conserva la arquitectura original de Qwen3.5 (torre de visión intacta y cabeza MTP sin entrenar), por lo que se carga exactamente igual que el modelo base.

El checkpoint corresponde a la actualización de optimizador 360 (iteración Megatron 359) de un entrenamiento que sigue en curso, con 787 actualizaciones planificadas sobre un epoch de 11.794 prompts únicos. El objetivo es reforzar el comportamiento seguro del modelo en escenarios de texto y de uso de herramientas (tool calling), sin degradar capacidades de código o razonamiento. Usa recompensas binarias (0/1) evaluadas por un juez Qwen3.8-27B.

Es relevante por dos motivos: primero, porque aplica GRPO con KL bajo sobre un modelo multimodal de 4B con contexto de hasta 40.960 tokens, una combinación poco frecuente en la literatura de seguridad pública; segundo, porque publica la curva de recompensa por dataset durante el entrenamiento, lo que permite auditar el efecto del RL sobre distintos tipos de prompt (benignos, dañinos, código, jailbreak).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (`Qwen3_5ForConditionalGeneration`), con torre de visión y cabeza MTP (multi-token prediction) |
| Parametros totales | 4.659.865.088 (4,66 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 40.960 tokens en entrenamiento; contexto nativo del base Qwen3.5-4B (no disponible en la informacion proporcionada) |
| Tipos de cuantizacion | pesos en bf16; cuantizaciones GGUF/AWQ/GPTQ no publicadas oficialmente (no disponible) |
| Idiomas soportados | no disponible (heredados del base Qwen3.5, presumiblemente multilingüe, pero no confirmado en la ficha) |
| Licencia | Apache 2.0 (hereda la de Qwen3.5-4B-Base) |
| Formato de pesos | safetensors (bf16, compatibles con `transformers`), exportados desde Megatron `torch_dist` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base, un transformer multimodal con torre de visión y cabeza de predicción multi-token (MTP). En este checkpoint solo se ha entrenado el modelo de lenguaje: la torre de visión y la cabeza MTP conservan los pesos originales del base, y las proyecciones GDN se han re-fusionado durante la exportación a Hugging Face. Los pesos están en bf16 y el checkpoint se carga con `Qwen3_5ForConditionalGeneration` sin modificaciones respecto al base.

El entrenamiento es GRPO (Group Relative Policy Optimization) con recompensas binarias normalizadas por grupo, clip PPO de 0,2 y TIS activado. Se ejecuta sobre Slime (rollouts con SGLang colocados) y Megatron-LM en 4× H100 80 GB. Por cada actualización se generan 15 prompts × 8 rollouts = 120 secuencias, con temperatura 1,0, top-p 1, hasta 32.768 tokens generados y contexto de 40.960. El learning rate es constante a 1e-6 (AdamW, betas 0,9/0,95, weight decay 0,1, grad clip 1,0) con una pérdida KL de baja varianza de coeficiente 0,001 respecto al checkpoint de partida. El juez es Qwen3.8-27B con veredicto binario estricto según la especificación del proyecto; los prompts de AgentAlign se juzgan sobre la trayectoria completa de uso de herramientas. El dataset "mixture-8" agrupa 11.794 prompts: star1_gp3 (1.000), star_benign_v2 (915), agentalign_harmful (2.000), agentalign_benign (2.000), codesafetybench (900), magicoder (1.000), difficult_advice (1.982) y wildjailbreak_benign (1.997). Los 4.000 prompts de AgentAlign llevan definiciones sintéticas de herramientas y se despliegan como trayectorias multi-turno contra un simulador, con las salidas de herramienta enmascaradas en la pérdida.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat de Qwen y modo `enable_thinking=true`.
- Razonamiento explícito (thinking mode) heredado del base Qwen3.5.
- Tool calling / function calling con el formato `qwen3_coder`; se ha entrenado específicamente con trayectorias multi-turno de uso de herramientas.
- Comportamiento seguro en prompts dañinos, jailbreaks y escenarios de código peligroso (entrenado con star1_gp3, star_benign_v2, wildjailbreak_benign, codesafetybench).
- Capacidad de visión heredada del base (torre de visión intacta), aunque no se ha entrenado ni evaluado en esta fase.
- Generación de código (entrenado con magicoder y codesafetybench).
- Capacidades multilingües: presumiblemente heredadas del base Qwen3.5, pero no documentadas en la ficha.

## Casos de uso

- Moderación y filtrado de respuestas en asistentes conversacionales: el modelo ha sido entrenado con recompensas binarias sobre prompts dañinos y benignos, por lo que puede usarse como generador principal en un asistente con política de seguridad estricta, o como modelo de referencia para comparar respuestas seguras frente al base.
- Agentes con tool calling en entornos sensibles: los 4.000 prompts de AgentAlign con definiciones sintéticas de herramientas permiten desplegarlo como planificador de agentes donde las llamadas a herramientas deben respetar restricciones de seguridad (por ejemplo, no ejecutar comandos destructivos ni exfiltrar datos).
- Evaluación de seguridad en pipelines de CI: al ser un checkpoint intermedio con curvas de recompensa publicadas, sirve como punto de comparación reproducible para medir el efecto de distintas configuraciones de GRPO (lr, KL, tamaño de grupo) sobre la tasa de cumplimiento seguro.
- Asistente de código con salvaguardas: entrenado con magicoder y codesafetybench, puede integrarse en entornos de generación de código donde se requiere rechazar peticiones de malware o exploits sin degradar la calidad del código legítimo (la recompensa en magicoder subió de 0,38 a 0,76 a lo largo del entrenamiento).
- Investigación en alineamiento multimodal: al conservar la torre de visión intacta, permite estudiar cómo el RL de seguridad sobre el LM afecta a la coherencia multimodal sin reentrenar el encoder visual.
- Generación de datos sintéticos de seguridad: el modelo puede producir trayectorias de tool use etiquetadas como seguras o dañinas para aumentar datasets de entrenamiento de otros modelos, dado su modo thinking y su formato de function calling compatible con `qwen3_coder`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card publica únicamente la recompensa media binaria del juez durante el entrenamiento:

| Ventana de actualizaciones | Recompensa media | Rollouts juzgados |
|---|---|---|
| 0-10 | 0,735 | 1200 |
| 30-40 | 0,718 | 1200 |
| 70-80 | 0,813 | 1200 |
| 110-120 | 0,817 | 1200 |
| 150-160 | 0,857 | 1200 |
| 190-200 | 0,868 | 1200 |
| 230-240 | 0,857 | 1200 |
| 270-280 | 0,880 | 1200 |
| 310-320 | 0,911 | 1200 |
| 350-360 | 0,866 | 1200 |

Desglose por dataset (ventanas seleccionadas):

| Dataset | 0-10 | 150-160 | 310-320 | 350-360 |
|---|---|---|---|---|
| agentalign_benign | 0,48 | 0,70 | 0,82 | 0,62 |
| agentalign_harmful | 0,96 | 0,97 | 0,96 | 0,97 |
| codesafetybench | 0,65 | 0,96 | 0,92 | 0,96 |
| difficult_advice | 0,88 | 0,95 | 0,90 | 0,93 |
| magicoder | 0,38 | 0,55 | 0,80 | 0,76 |
| star1_gp3 | 0,77 | 0,97 | 0,99 | 0,99 |
| star_benign_v2 | 0,72 | 0,94 | 0,93 | 0,85 |
| wildjailbreak_benign | 0,68 | 0,81 | 0,90 | 0,87 |

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 9,3 GB solo para pesos (4,66B × 2 bytes), más KV cache. Con contexto de 40.960 tokens y batch razonable, se recomienda al menos 24 GB.
- GPU recomendadas: H100 80 GB o A100 80 GB para entrenamiento (el autor usó 4× H100); para inferencia, A100 40 GB, L40S o RTX 6000 Ada son suficientes.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con bf16 y contexto moderado, o en RTX 3090/4080 con cuantización a 8 bits. En 16 GB (RTX 4070 Ti Super, 4060 Ti 16 GB) requiere cuantización a 4 bits.
- Opciones de despliegue: `transformers` (verificado en la model card), vLLM y TGI (compatibles con arquitectura Qwen3.5, aunque no verificados explícitamente para este checkpoint), llama.cpp/Ollama solo si se generan GGUF propios (no publicados).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Qwen3.5-4B safety GRPO) | 4,66B | 40.960 (entrenamiento) | Seguridad + tool use, multimodal | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B-Base | ~4B | no disponible | Base multimodal | Apache 2.0 | Hugging Face |
| thkim0305-SNU/...-SFT-Mixture8-genv2gp3-lr1e-5-step365 (modelo padre) | 4,66B | 40.960 | SFT previo al RL | Apache 2.0 | Hugging Face |
| Alternativas de seguridad de 4B (p. ej. Llama Guard, ShieldGemma) | 2B-9B | variable | Clasificación de seguridad | Llama/Gemma | Hugging Face |

No se dispone de benchmarks comparativos directos con otras familias en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio, no un modelo final: el entrenamiento sigue en curso (360 de 787 actualizaciones) y la recompensa fluctúa (0,911 en 310-320 frente a 0,866 en 350-360).
- La recompensa en `agentalign_benign` cae de 0,82 a 0,62 en la última ventana, lo que sugiere inestabilidad en el comportamiento benigno con herramientas; no se recomienda producción sin evaluación propia.
- Riesgo de sobre-rechazo: el entrenamiento con recompensas binarias sobre prompts dañinos puede incrementar los falsos positivos en peticiones legítimas (se observa cierta caída en `star_benign_v2` y `wildjailbreak_benign` en la última ventana).
- El juez es Qwen3.8-27B con veredicto binario: introduce sesgo del juez y no mide calidad estilística ni factualidad.
- La torre de visión y la cabeza MTP no se han entrenado; el rendimiento multimodal no está evaluado y puede haberse degradado por el RL sobre el LM.
- Idiomas soportados no documentados; el dataset de entrenamiento parece mayoritariamente en inglés.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5 tiene su propia licencia (enlazada en la model card) que debe revisarse.
- Riesgo de alucinación no cuantificado en la información disponible.
- Sin descargas ni likes en el momento de la consulta: no hay validación comunitaria ni reportes de terceros.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT365-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step360
- Modelo padre (SFT): https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr1e-5-step365
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Slime (framework de RL): no disponible en la información proporcionada
- Megatron-LM: no disponible en la información proporcionada
- SGLang: no disponible en la información proporcionada
