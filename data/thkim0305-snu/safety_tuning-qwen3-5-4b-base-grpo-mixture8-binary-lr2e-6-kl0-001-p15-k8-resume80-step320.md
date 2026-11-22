# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr2e-6-kl0.001-p15-k8-resume80-step320

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr2e-6-kl0.001-p15-k8-resume80-step320 es un checkpoint intermedio de ajuste fino por refuerzo (RL) orientado a seguridad, obtenido a partir de Qwen/Qwen3.5-4B-Base mediante el algoritmo GRPO. Lo desarrolla el usuario thkim0305-SNU y corresponde a la actualización de optimizador 320 de un entrenamiento que sigue en curso: se trata de una instantánea, no de un modelo final. El objetivo del entrenamiento es alinear el modelo base hacia respuestas seguras y útiles en escenarios de riesgo (jailbreak, código peligroso, consejo sensible) y en trayectorias de uso de herramientas.

El modelo conserva la arquitectura del base Qwen3.5-4B, un transformer multimodal con torre de visión y cabeza MTP (multi-token prediction), con 4.659.865.088 parámetros totales y pesos en bf16. Solo se ha entrenado el modelo de lenguaje: la torre de visión y la cabeza MTP mantienen los pesos originales del base, de modo que el checkpoint se carga exactamente igual que Qwen3.5-4B-Base mediante `Qwen3_5ForConditionalGeneration`. El entrenamiento usa ventanas de contexto de 40960 tokens y hasta 32768 tokens generados por rollout.

Su relevancia es fundamentalmente metodológica: documenta con detalle una receta de RL para seguridad con recompensas binarias estrictas emitidas por un juez (Qwen3.8-27B), KL baja contra el modelo congelado y rollouts multi-turno con herramientas simuladas. Al ser un checkpoint intermedio y sin datos de benchmarks publicados, no debe tratarse como un modelo de producción listo para usar, sino como material de investigación reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (Qwen3_5ForConditionalGeneration) con torre de vision y cabeza MTP; solo se entrena el modelo de lenguaje |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 40960 tokens en entrenamiento; no se documenta el maximo de inferencia |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se listan GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (heredada de Qwen/Qwen3.5-4B-Base) |
| Formato de pesos | safetensors (bf16), repo de 9.3 GB |
| Modelo base | Qwen/Qwen3.5-4B-Base (snapshot 1001bb4d826a) |
| Algoritmo de entrenamiento | GRPO con recompensas binarias normalizadas por grupo, PPO clip 0.2, TIS activado |
| Framework | Slime (rollouts SGLang colocados) + Megatron-LM, bf16 |
| Checkpoint | Iteracion Megatron 319, 320 actualizaciones de optimizador |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base, un transformer multimodal con torre de visión y cabeza de predicción multi-token. Durante este ajuste solo se actualizan los pesos del modelo de lenguaje; visión y MTP se copian intactos del base, y las proyecciones GDN se refusionan durante la exportación a Hugging Face. El entrenamiento se ejecuta en bf16 con Megatron-LM para el paso de optimización y Slime con SGLang colocados para la generación de rollouts.

La receta de RL usa GRPO con recompensas binarias (0/1) normalizadas por grupo, PPO con clip 0.2 y importance sampling truncado (TIS). Cada actualización procesa 15 prompts con 8 rollouts cada uno (120 secuencias), learning rate constante de 2e-6 con AdamW (betas 0.9/0.95, weight decay 0.1, grad clip 1.0) y una pérdida KL de baja varianza con coeficiente 0.001 contra el modelo congelado de partida. El muestreo usa temperatura 1.0, top-p 1, hasta 32768 tokens generados y contexto de 40960. La plantilla de chat de Qwen se aplica con `enable_thinking=true`, y los rollouts con herramientas usan el function calling `qwen3_coder`.

El conjunto de prompts "mixture-8" suma 11794 prompts únicos repartidos en ocho datasets: star1_gp3 (1000), star_benign_v2 (915), agentalign_harmful (2000), agentalign_benign (2000), codesafetybench (900), magicoder (1000), difficult_advice (1982) y wildjailbreak_benign (1997). Los 4000 prompts de AgentAlign incorporan definiciones de herramientas sintéticas y se despliegan como trayectorias multi-turno contra un simulador de herramientas, enmascarando las salidas de herramienta en la pérdida. El reward lo emite un juez Qwen3.8-27B con veredicto binario estricto según la especificación del proyecto; en AgentAlign se juzga toda la trayectoria visible de uso de herramientas. El schedule prevé una época sobre los 11794 prompts (787 actualizaciones) con checkpoints cada 40 pasos.

## Capacidades

- Generación de texto conversacional con plantilla de chat de Qwen y modo de razonamiento explícito (`enable_thinking=true`).
- Razonamiento multi-step en formato de pensamiento, entrenado con rollouts de hasta 32768 tokens generados.
- Uso de herramientas y function calling mediante el formato `qwen3_coder`, con entrenamiento específico en trayectorias multi-turno contra un simulador de herramientas.
- Comportamiento orientado a seguridad: rechazo o reformulación de peticiones dañinas (jailbreak, código inseguro, consejo sensible), entrenado con recompensas binarias de un juez.
- Capacidad multimodal heredada del base (torre de visión intacta), si bien no se ha entrenado en esta fase.
- Capacidad multilingüe: no disponible en la información proporcionada; no se documentan idiomas.
- Predicción multi-token (cabeza MTP) heredada del base, sin entrenamiento en esta fase.

## Casos de uso

- Investigación en RL para seguridad: el checkpoint sirve como referencia reproducible de una receta GRPO con recompensas binarias y KL baja, útil para estudiar estabilidad del entrenamiento y dinámica de recompensas por dataset.
- Evaluación de robustez frente a jailbreak: permite medir cómo evoluciona la tasa de rechazo en prompts de wildjailbreak_benign y agentalign_harmful a lo largo de las 320 actualizaciones.
- Análisis de seguridad en código: entrenado sobre codesafetybench y magicoder, es adecuado para probar si el modelo detecta o evita patrones de código peligroso en tareas de generación.
- Estudio de agentes con herramientas: los rollouts multi-turno con definiciones sintéticas permiten analizar el comportamiento del modelo en trayectorias de tool calling y su alineación con la especificación del juez.
- Ajuste de consejo sensible: el dataset difficult_advice (1982 prompts) hace del checkpoint un banco de pruebas para evaluar respuestas prudentes en consultas delicadas.
- Baseline para comparativas de alineación: al ser un snapshot intermedio del base, permite comparar directamente el efecto del RL de seguridad contra Qwen3.5-4B-Base sin ajuste.
- Fine-tuning posterior: al cargarse como el base y mantener la licencia apache-2.0, puede usarse como punto de partida para experimentos de SFT o DPO sobre seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta la recompensa media del juez durante el entrenamiento (media binaria cruda antes de normalizacion por grupo), no métricas de evaluación estándar:

| Ventana | Recompensa media | Rollouts juzgados |
|---|---|---|
| Actualizaciones 310-320 | 0.839 | 1200 |

| Dataset | Actualizaciones 310-320 |
|---|---|
| agentalign_benign | 0.64 |
| agentalign_harmful | 0.89 |
| codesafetybench | 0.94 |
| difficult_advice | 0.85 |
| magicoder | 0.69 |
| star1_gp3 | 0.84 |
| star_benign_v2 | 0.83 |
| wildjailbreak_benign | 0.86 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9-10 GB solo para pesos (4.66 mil millones de parámetros a 2 bytes), más memoria para activaciones y caché KV; con contexto de 40960 tokens la caché KV puede dominar el consumo.
- GPU recomendadas: NVIDIA B200 (usada para entrenamiento), A100 (usada para el juez en SGLang TP2), H100; para inferencia en bf16 encaja en RTX PRO 6000 y en GPUs con 16-24 GB.
- Cabe en GPU consumer: sí en bf16 ajustado en tarjetas de 16 GB o más (por ejemplo RTX 4090 de 24 GB); en tarjetas de 8-12 GB requeriría cuantización, no documentada por el autor.
- Opciones de despliegue: transformers con `Qwen3_5ForConditionalGeneration` y `device_map="auto"` (única vía documentada); vLLM, llama.cpp, Ollama o TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponible; el autor no publica mediciones de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8 (este) | 4.66 mil millones | 40960 (entrenamiento) | Recompensa de juez 0.839 (ventana 310-320); sin benchmarks estándar | apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B-Base | 4.66 mil millones | no disponible en la información | no disponible | apache-2.0 | Hugging Face (modelo base) |
| Qwen3.8-27B (usado como juez) | no disponible | no disponible | no disponible | no disponible | Usado internamente en el entrenamiento |
| Otros checkpoints de seguridad de la misma familia | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es contra Qwen3.5-4B-Base, del que este modelo hereda arquitectura, tamaño y licencia; la diferencia es el ajuste RL de seguridad. No se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde a la actualización 320 de 787 previstas; el entrenamiento seguía en curso en el momento de la exportación. No es un modelo final ni validado para producción.
- Sin benchmarks estándar: no hay resultados de MMLU, HumanEval, GSM8K ni evaluaciones de seguridad independientes; la única métrica es la recompensa del juez durante el entrenamiento.
- Riesgo de alucinación: inherente a un modelo base de 4B ajustado solo con RL; no se documentan mitigaciones específicas.
- Sesgos conocidos: no disponibles; los datasets incluyen prompts sintéticos y de seguridad, pero no se reporta análisis de sesgo.
- Idiomas: no se documenta qué idiomas cubre; la plantilla de chat y los datasets no detallan composición lingüística.
- Recompensa dependiente del juez: la señal de entrenamiento proviene de un juez Qwen3.8-27B con veredicto binario, lo que puede introducir sesgos del juez y sobreajuste a su especificación.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero debe verificarse la licencia del base Qwen3.5-4B-Base enlazada en la model card.
- Uso responsable: al ser un modelo entrenado para seguridad, sus respuestas de rechazo pueden ser excesivas o inconsistentes en dominios benignos; requiere evaluación propia antes de cualquier despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr2e-6-kl0.001-p15-k8-resume80-step320
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Papers, blogs, repos y demos adicionales: no disponible en la información proporcionada.
