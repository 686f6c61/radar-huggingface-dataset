# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step80

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step80 es un checkpoint intermedio de ajuste fino mediante RL (GRPO) sobre el modelo base Qwen/Qwen3.5-4B-Base, desarrollado por el usuario thkim0305-SNU. El objetivo del entrenamiento es el alineamiento de seguridad: se entrena al modelo para que responda de forma segura ante prompts dañinos y mantenga utilidad ante prompts benignos, incluyendo trayectorias de uso de herramientas. El checkpoint corresponde a 80 actualizaciones del optimizador sobre el conjunto de prompts "mixture-8" y forma parte de un entrenamiento que sigue en curso, por lo que no es un modelo final.

El modelo conserva la arquitectura multimodal del base (Qwen3.5, con torre de visión y cabeza MTP intactas) pero solo se ha entrenado el modelo de lenguaje. Tiene 4.659.865.088 parámetros totales en bf16, un contexto de entrenamiento de 40.960 tokens y hasta 32.768 tokens generados por rollout. Se distribuye con licencia Apache 2.0 y pesos en safetensors bajo la clase `Qwen3_5ForConditionalGeneration`.

Su relevancia es doble: por un lado, documenta de forma transparente una receta de RL de seguridad con recompensas binarias y juez automático; por otro, sirve como referencia para estudiar la evolución de las métricas de seguridad a lo largo del entrenamiento, con ventanas de evaluación comparables entre actualizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer multimodal, clase `Qwen3_5ForConditionalGeneration`); solo se entrena el modelo de lenguaje |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40.960 tokens (contexto de entrenamiento/sampling) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 9,3 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base, un transformer multimodal con torre de visión y cabeza MTP (multi-token prediction). En este checkpoint únicamente se ha entrenado el modelo de lenguaje: la torre de visión y la cabeza MTP conservan los pesos originales del base, de modo que el checkpoint carga exactamente igual que el modelo base. Los pesos se exportaron desde Megatron-LM (formato `torch_dist`) con proyecciones GDN refusionadas y mapeo de nombres de Slime para Qwen3.5.

El entrenamiento usa GRPO con recompensas binarias normalizadas por grupo, clip PPO de 0,2 y TIS activado, sobre el framework Slime (rollouts con SGLang colocados) y Megatron-LM en bf16. Cada actualización emplea 15 prompts × 8 rollouts = 120 secuencias, con learning rate constante de 1e-6, AdamW (betas 0,9/0,95), weight decay 0,1, grad clip 1,0 y una pérdida KL de baja varianza con coeficiente 0,001 respecto al modelo inicial congelado. El sampling usa temperatura 1,0, top-p 1, hasta 32.768 tokens generados y 40.960 de contexto, con plantilla de chat Qwen y `enable_thinking=true`; los rollouts de herramientas usan function calling `qwen3_coder`. La recompensa la otorga un juez Qwen3.8-27B con veredicto binario estricto (0/1), y en los prompts de AgentAlign se juzga toda la trayectoria visible de herramientas. El schedule prevé una época sobre 11.794 prompts únicos (787 actualizaciones), con checkpoints cada 80; este es el de la actualización 80 (iteración Megatron 79).

El conjunto de datos "mixture-8" se compone de: star1_gp3 (1.000 prompts), star_benign_v2 (915), agentalign_harmful (2.000), agentalign_benign (2.000), codesafetybench (900), magicoder (1.000), difficult_advice (1.982) y wildjailbreak_benign (1.997). 4.000 prompts de AgentAlign llevan definiciones sintéticas de herramientas y se despliegan como trayectorias multiturno contra un simulador, con las salidas de herramienta enmascaradas en la pérdida.

## Capacidades

- Generación de texto conversacional con plantilla de chat Qwen y modo de razonamiento explícito (`enable_thinking=true`).
- Razonamiento multi-step y cadenas de pensamiento antes de responder.
- Tool calling / function calling (formato `qwen3_coder`) y ejecución de trayectorias multiturno con herramientas simuladas.
- Comportamiento de seguridad alineado: rechazo o redirección ante prompts dañinos y mantenimiento de utilidad ante prompts benignos.
- Capacidad multimodal heredada del base (torre de visión intacta), aunque no fue entrenada en este proceso.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Cabeza MTP (multi-token prediction) heredada del base, útil para decodificación especulativa.

## Casos de uso

- Investigación en alineamiento de seguridad: el checkpoint permite comparar la evolución de las puntuaciones del juez entre ventanas de entrenamiento (0-10, 70-80, 150-160) y estudiar la dinámica de GRPO con recompensas binarias.
- Evaluación de robustez ante jailbreaks: útil para medir la resistencia frente a conjuntos como wildjailbreak_benign antes de integrar la receta en un modelo final.
- Filtrado y moderación de contenido en pipelines: el modelo puede clasificar o reescribir respuestas potencialmente dañinas en un sistema de revisión previa a producción.
- Agentes con herramientas en entornos controlados: sirve para probar trayectorias multiturno con function calling y verificar que el modelo no ejecuta acciones dañinas.
- Seguridad en generación de código: entrenado con codesafetybench, puede emplearse para detectar y evitar la producción de código inseguro en asistentes de programación.
- Ajuste de asesores conversacionales sensibles: el conjunto difficult_advice entrena respuestas prudentes en consultas delicadas, aplicable a chatbots de orientación.
- Punto de partida para posteriores iteraciones de RL: al ser un checkpoint intermedio, permite reanudar o comparar recetas antes de llegar al modelo final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card únicamente reporta la puntuación media del juez binario durante el entrenamiento:

| Ventana de actualizaciones | Puntuación media | Rollouts juzgados |
|---|---|---|
| 0-10 | 0,417 | 1.200 |
| 70-80 | 0,578 | 1.200 |
| 150-160 | 0,708 | 1.200 |

Desglose por conjunto de datos:

| Dataset | 0-10 | 70-80 | 150-160 |
|---|---|---|---|
| agentalign_benign | 0,41 | 0,48 | 0,60 |
| agentalign_harmful | 0,63 | 0,88 | 0,94 |
| codesafetybench | 0,47 | 0,78 | 0,80 |
| difficult_advice | 0,28 | 0,30 | 0,69 |
| magicoder | 0,51 | 0,34 | 0,38 |
| star1_gp3 | 0,57 | 0,78 | 0,82 |
| star_benign_v2 | 0,27 | 0,54 | 0,83 |
| wildjailbreak_benign | 0,27 | 0,45 | 0,61 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos, más overhead de activaciones y KV cache; con contexto de 40.960 tokens la KV cache puede ser considerable.
- GPU recomendadas: B200 (usadas en el entrenamiento), A100 80 GB, H100; para inferencia en bf16 una GPU de 24 GB puede ser insuficiente con contexto largo.
- GPU de consumo: una RTX 4090 (24 GB) puede alojar los pesos en bf16 con contexto moderado; en cuantización de 8 o 4 bits cabría en GPUs de 16-24 GB, aunque no se publican ficheros cuantizados.
- Opciones de despliegue: transformers (receta oficial de la model card), vLLM, SGLang y TGI para servir; llama.cpp/Ollama requerirían conversión a GGUF no publicada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (Safety_Tuning-Qwen3.5-4B-Base-GRPO) | 4,66 B | 40.960 | Apache 2.0 | Hugging Face | Checkpoint intermedio de RL de seguridad |
| Qwen/Qwen3.5-4B-Base | 4,66 B (aprox.) | no disponible | Apache 2.0 | Hugging Face | Modelo base sin alineamiento de seguridad específico |
| Alternativas de seguridad de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Es un checkpoint intermedio (80 de 787 actualizaciones previstas): el entrenamiento sigue en curso y el modelo no debe tratarse como versión final.
- El juez de recompensa es automático (Qwen3.8-27B con veredicto binario); puede introducir sesgos y no equivale a una evaluación humana.
- La puntuación en magicoder empeora con el entrenamiento (0,51 → 0,34 → 0,38), lo que sugiere posibles regresiones en capacidades de código.
- No se han publicado evaluaciones estándar de capacidad (MMLU, HumanEval, GSM8K) ni comparaciones con modelos de referencia.
- Idiomas soportados no documentados; el comportamiento multilingüe puede diferir del base.
- Riesgo de alucinación y de respuestas excesivamente conservadoras por el énfasis en seguridad; conviene validar en producción.
- La torre de visión y la cabeza MTP no fueron entrenadas: el rendimiento multimodal puede no reflejar el del base.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y sus términos deben respetarse; verificar el LICENSE de Qwen3.5-4B-Base.
- Solo hay dos GPUs B200 en el run documentado; la reproducibilidad exacta del entrenamiento no está garantizada.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step80
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Papers, blogs, repos y demos adicionales: no disponibles en la información proporcionada.
