# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr2e-6-kl0.001-p15-k8-resume80-step520

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr2e-6-kl0.001-p15-k8-resume80-step520 es un checkpoint intermedio de ajuste fino por refuerzo (RL) orientado a seguridad sobre el modelo base Qwen/Qwen3.5-4B-Base, desarrollado por el usuario thkim0305-SNU. El entrenamiento utiliza GRPO con recompensas binarias normalizadas por grupo y un juez externo (Qwen3.8-27B) que emite un veredicto estricto 0/1 sobre cada rollout. El objetivo es alinear el modelo para que rechace peticiones dañinas, mantenga utilidad en peticiones benignas y se comporte de forma segura en trayectorias de uso de herramientas.

El modelo conserva la arquitectura multimodal del base (Qwen3_5ForConditionalGeneration), con 4.659.865.088 parámetros totales en bf16, pero solo se ha entrenado el modelo de lenguaje: la torre de visión y la cabeza MTP permanecen con los pesos originales del base. El checkpoint corresponde a la actualización de optimizador 520 de un total previsto de 787 (una época sobre 11.794 prompts únicos), por lo que se trata de un snapshot no final, con entrenamiento aún en curso.

Su relevancia es doble: por un lado, documenta una receta completa de safety tuning con RL a escala de 4B y con evaluación por juez; por otro, expone métricas de recompensa por dataset a lo largo del entrenamiento, lo que permite estudiar la evolución del equilibrio entre seguridad y utilidad. La licencia es Apache 2.0, heredada del base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (Qwen3_5ForConditionalGeneration); solo se entrena el modelo de lenguaje, torre de visión y cabeza MTP intactas |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40.960 tokens durante el entrenamiento (contexto de entrenamiento); contexto máximo del base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, formato Hugging Face transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base, un transformer multimodal con torre de visión y cabeza de predicción multi-token (MTP). El ajuste se aplica exclusivamente al modelo de lenguaje; la torre de visión y la cabeza MTP se copian sin modificar desde el base, de modo que el checkpoint se carga exactamente igual que el modelo original. El algoritmo es GRPO con recompensas binarias normalizadas por grupo, clip PPO de 0,2 y muestreo corregido por importancia truncado (TIS) activado. La infraestructura combina Slime (rollouts con SGLang en modo colocado) y Megatron-LM en bf16.

Cada actualización procesa 15 prompts con 8 rollouts por prompt (120 secuencias). El learning rate es constante a 2e-06 con AdamW (betas 0,9 y 0,95), weight decay 0,1 y grad clip 1,0. Se aplica una pérdida KL de baja varianza contra el modelo inicial con coeficiente 0,001. El muestreo usa temperatura 1,0, top-p 1 y hasta 32.768 tokens generados. La plantilla de chat es la de Qwen con `enable_thinking=true`, y los rollouts de herramientas emplean el function calling `qwen3_coder`. La recompensa la otorga un juez Qwen3.8-27B con veredicto binario estricto; en los prompts de AgentAlign se juzga la trayectoria completa de uso de herramientas.

El conjunto de datos "mixture-8" suma 11.794 prompts únicos: star1_gp3 (1.000), star_benign_v2 (915), agentalign_harmful (2.000), agentalign_benign (2.000), codesafetybench (900), magicoder (1.000), difficult_advice (1.982) y wildjailbreak_benign (1.997). Los 4.000 prompts de AgentAlign incorporan definiciones sintéticas de herramientas y se despliegan como trayectorias multiturno contra un simulador, con las salidas de herramienta enmascaradas en la pérdida. El entrenamiento se ejecutó en 1x NVIDIA B200 para entrenador y motor de rollout, con el juez en 2x A100 (SGLang TP2) a través de un túnel SSH, reanudado en la actualización 280 desde una ejecución previa en 3x RTX PRO 6000.

## Capacidades

- Generación de texto conversacional con plantilla de chat de Qwen y modo de razonamiento (`enable_thinking=true`).
- Razonamiento multi-paso mediante cadenas de pensamiento antes de la respuesta.
- Tool calling / function calling compatible con el formato `qwen3_coder`, entrenado explícitamente en trayectorias de uso de herramientas.
- Comportamiento agéntico multiturno contra un simulador de herramientas (rollouts AgentAlign).
- Seguridad alineada: rechazo de peticiones dañinas y mantenimiento de utilidad en peticiones benignas, incluyendo jailbreaks benignos (wildjailbreak_benign).
- Seguridad en generación de código (codesafetybench, magicoder).
- Capacidades multimodales heredadas del base (torre de visión intacta), aunque el ajuste RL no las entrena.
- Capacidades multilingües: no disponibles en la informacion proporcionada.

## Casos de uso

- Moderación y rechazo de peticiones dañinas en asistentes conversacionales: el modelo ha sido entrenado con recompensa binaria sobre prompts harmful (agentalign_harmful, star1_gp3) para negarse a colaborar en solicitudes peligrosas manteniendo respuestas útiles en el resto de casos.
- Asistentes con uso de herramientas en producción: el entrenamiento con trayectorias multiturno y function calling `qwen3_coder` permite integrarlo en agentes que invocan APIs, con comportamiento seguro evaluado sobre la trayectoria completa.
- Generación de código con salvaguardas: el paso por codesafetybench y magicoder lo hace adecuado para pipelines de asistencia a programadores donde se requiere evitar sugerencias inseguras (por ejemplo, manejo de credenciales o criptografía).
- Consejo y orientación sensible: el dataset difficult_advice entrena respuestas prudentes ante consultas delicadas, útil en dominios de salud, finanzas o relaciones personales donde se exige cautela.
- Investigación en alineación y safety RL: al publicarse checkpoints intermedios con métricas de recompensa por dataset y por ventana de actualizaciones, sirve como material para estudiar dinámicas de GRPO, colapso de recompensa y equilibrio seguridad-utilidad.
- Evaluación de robustez frente a jailbreaks: los prompts de wildjailbreak_benign permiten probar la resistencia a reformulaciones benignas de peticiones que podrían eludir filtros.
- Base para ajuste posterior específico de dominio: con licencia Apache 2.0 y carga idéntica al base, puede servir de punto de partida para fine-tuning supervisado en nichos concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor únicamente reporta la recompensa media binaria del juez durante el entrenamiento, por ventana de actualizaciones y por dataset:

| Dataset | upd. 310-320 | upd. 350-360 | upd. 390-400 | upd. 430-440 | upd. 470-480 | upd. 510-520 |
|---|---|---|---|---|---|---|
| agentalign_benign | 0,64 | 0,54 | 0,57 | 0,50 | 0,54 | 0,54 |
| agentalign_harmful | 0,89 | 0,94 | 0,85 | 0,85 | 0,77 | 0,83 |
| codesafetybench | 0,94 | 0,89 | 0,91 | 0,83 | 0,88 | 0,89 |
| difficult_advice | 0,85 | 0,77 | 0,68 | 0,62 | 0,74 | 0,72 |
| magicoder | 0,69 | 0,69 | 0,70 | 0,65 | 0,67 | 0,59 |
| star1_gp3 | 0,84 | 0,95 | 0,98 | 0,97 | 0,79 | 0,95 |
| star_benign_v2 | 0,83 | 0,98 | 0,98 | 0,90 | 0,89 | 0,85 |
| wildjailbreak_benign | 0,86 | 0,83 | 0,74 | 0,81 | 0,79 | 0,71 |

Recompensa media global (bruta, antes de normalización por grupo): 0,839 (upd. 310-320), 0,796 (350-360), 0,786 (390-400), 0,729 (430-440), 0,722 (470-480) y 0,713 (510-520). Cada ventana evalúa 1.200 rollouts (1.199 en la de 350-360). La tendencia muestra un descenso sostenido de la recompensa media a lo largo del entrenamiento, con caídas notables en agentalign_benign, difficult_advice y wildjailbreak_benign.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 9,3 GB de pesos, más overhead de activaciones y caché KV; en la práctica, alrededor de 12-16 GB para inferencia con contexto moderado.
- En cuantización de 8 bits: aproximadamente 5 GB de pesos; en 4 bits, alrededor de 2,5-3 GB (no se publican cuantizaciones oficiales).
- GPU recomendadas para bf16: A100 40/80 GB, H100, B200 o RTX PRO 6000 para lotes grandes y contexto largo; el propio autor entrenó con B200 y RTX PRO 6000.
- GPU de consumo: cabe en RTX 4090 (24 GB), RTX 4080 (16 GB) y RTX 3090 (24 GB) en bf16 con contexto moderado; en GPUs de 8-12 GB requeriría cuantización.
- Despliegue: transformers (referencia del autor), vLLM, SGLang (usado en los rollouts), TGI y llama.cpp/Ollama si se generan cuantizaciones GGUF (no publicadas).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8 (este) | 4,66 B | 40.960 en entrenamiento | Safety RL con GRPO y juez binario | Apache 2.0 | Hugging Face (checkpoint intermedio, 0 descargas) |
| Qwen/Qwen3.5-4B-Base | 4 B (aprox.) | no disponible | Modelo base multimodal sin alinear | Apache 2.0 | Hugging Face |
| Alternativas de safety tuning de ~4B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos frente a otros modelos de seguridad del mismo tamaño en la informacion proporcionada.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde a la actualización 520 de 787 previstas; el autor indica explícitamente que el entrenamiento sigue en curso y que no es un modelo final.
- Degradación de recompensa: la recompensa media cae de 0,839 a 0,713 entre las ventanas 310-320 y 510-520, con descensos acusados en agentalign_benign (0,64 a 0,54), difficult_advice (0,85 a 0,72) y wildjailbreak_benign (0,86 a 0,71). Esto sugiere posible sobre-rechazo o pérdida de utilidad en casos benignos.
- Solo se entrena el modelo de lenguaje: la torre de visión y la cabeza MTP no se ajustan, por lo que el comportamiento multimodal no está alineado con los objetivos de seguridad.
- Sesgos: no se documentan análisis de sesgo demográfico, cultural o lingüístico en la informacion proporcionada.
- Riesgo de alucinación: no se reportan evaluaciones de veracidad; el modo thinking puede generar cadenas de razonamiento largas (hasta 32.768 tokens) sin garantía de corrección.
- Idiomas: no se especifican los idiomas soportados; la alineación de seguridad se ha entrenado con datasets mayoritariamente en inglés, lo que puede reducir la robustez en castellano u otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3.5-4B-Base conviene revisar la licencia y condiciones del modelo base enlazadas por el autor.
- Trazabilidad limitada: el repositorio tiene 0 descargas y 0 likes, sin validación externa ni evaluación independiente publicada.
- Reproducibilidad: la receta depende de un juez externo (Qwen3.8-27B) y de infraestructura específica (Slime + Megatron-LM, B200, A100), lo que dificulta replicar el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr2e-6-kl0.001-p15-k8-resume80-step520
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Paper de GRPO: no disponible en la informacion proporcionada
- Repositorio de Slime: no disponible en la informacion proporcionada
- Repositorio de Megatron-LM: no disponible en la informacion proporcionada
- Demo o blog del autor: no disponible en la informacion proporcionada
