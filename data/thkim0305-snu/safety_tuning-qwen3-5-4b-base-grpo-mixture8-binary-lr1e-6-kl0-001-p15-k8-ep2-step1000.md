# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-ep2-step1000

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-ep2-step1000 es un checkpoint intermedio de ajuste fino con aprendizaje por refuerzo (GRPO) sobre Qwen/Qwen3.5-4B-Base, orientado a alineamiento de seguridad. Lo desarrolla el usuario thkim0305-SNU y se publica bajo licencia Apache 2.0. No es un modelo final: es una instantanea del entrenamiento tras 1000 actualizaciones del optimizador (iteracion Megatron 999), con el entrenamiento aun en curso.

El modelo parte de la arquitectura Qwen3.5 multimodal (`Qwen3_5ForConditionalGeneration`), con 4.659.865.088 parametros en bf16, y solo se ha entrenado el modelo de lenguaje: la torre de vision y la cabeza MTP conservan los pesos originales del modelo base. Por tanto, se carga exactamente igual que Qwen3.5-4B-Base y mantiene sus capacidades multimodales de entrada imagen-texto.

Su relevancia es metodologica: documenta con detalle un pipeline de RL de seguridad con recompensas binarias juzgadas por un modelo juez (Qwen3.8-27B), incluyendo rollouts multi-turno con herramientas sinteticas y un desglose por dataset del reward medio a lo largo del entrenamiento. Es util para investigadores que estudien la dinamica de GRPO aplicado a seguridad y uso de herramientas, no como modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (`Qwen3_5ForConditionalGeneration`), con torre de vision y cabeza MTP |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40.960 tokens en entrenamiento (contexto de muestreo); contexto nativo del base no disponible en la informacion |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se listan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, formato Hugging Face transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal de la familia Qwen3.5 con 4.659.865.088 parametros. El checkpoint se exporto desde Megatron (`torch_dist`, `iter_0000999`) mediante `safety_tuning.hf_export`, con reproyecciones GDN re-fusionadas, mapeo de nombres de Slime para Qwen3.5 y copia de los pesos base de vision y MTP. Solo se entreno el modelo de lenguaje; la torre de vision y la cabeza MTP son los pesos originales sin tocar.

El entrenamiento usa GRPO con recompensas binarias normalizadas por grupo, PPO clip 0.2 y TIS activado, sobre el framework Slime (rollouts con SGLang en colocacion) mas Megatron-LM en bf16. Por cada actualizacion se generan 15 prompts x 8 rollouts = 120 secuencias. Hiperparametros: learning rate constante de 1e-06, AdamW con betas [0.9, 0.95], weight decay 0.1, grad clip 1.0, y una perdida KL de baja varianza con coeficiente 0.001 respecto al modelo congelado de partida. El muestreo usa temperatura 1.0, top-p 1, hasta 32.768 tokens generados y contexto de 40.960. Se emplea la plantilla de chat de Qwen con `enable_thinking=true` y, en los rollouts con herramientas, el function calling `qwen3_coder`. La recompensa la otorga un juez Qwen3.8-27B con veredicto binario estricto (0/1) segun la especificacion del proyecto; los prompts de AgentAlign se juzgan sobre toda la trayectoria visible de uso de herramientas. El calendario contempla una epoca con padding sobre 11.794 prompts unicos (1.574 actualizaciones), con checkpoints cada 40 actualizaciones.

El conjunto de datos "mixture-8" se compone de: star1_gp3 (1000), star_benign_v2 (915), agentalign_harmful (2000), agentalign_benign (2000), codesafetybench (900), magicoder (1000), difficult_advice (1982) y wildjailbreak_benign (1997). 4.000 prompts de AgentAlign llevan definiciones de herramientas sinteticas y se despliegan como trayectorias multi-turno contra un simulador de herramientas, con las salidas de herramienta enmascaradas en la perdida.

## Capacidades

- Generacion de texto conversacional con plantilla de chat de Qwen y modo de razonamiento (`enable_thinking=true`).
- Entrada multimodal imagen-texto heredada del modelo base (torre de vision sin entrenar en este checkpoint).
- Uso de herramientas y function calling mediante el formato `qwen3_coder`.
- Razonamiento multi-paso y trayectorias de agente multi-turno (entrenado explicitamente con rollouts de AgentAlign).
- Comportamiento de rechazo y seguridad ante prompts dañinos (entrenado con agentalign_harmful, star1_gp3, difficult_advice y wildjailbreak_benign).
- Seguridad en generacion de codigo (entrenado con codesafetybench y magicoder).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion sobre RL de seguridad: sirve como punto de comparacion intermedio para estudiar como evoluciona el reward binario de un juez a lo largo de las actualizaciones de GRPO, con curvas por dataset ya publicadas.
- Evaluacion de robustez ante jailbreaks: el checkpoint incorpora datos de wildjailbreak_benign y difficult_advice, por lo que es util para medir la tasa de rechazo frente a prompts adversariales en pipelines de red-teaming.
- Experimentos de seguridad en generacion de codigo: al haberse entrenado con codesafetybench y magicoder, permite analizar si el ajuste de seguridad degrada la utilidad en tareas de programacion (el reward de magicoder cae de 0.76 a 0.53 entre ventanas, un fenomeno directamente observable).
- Analisis de agentes con herramientas: los 4.000 prompts de AgentAlign con herramientas sinteticas permiten estudiar el comportamiento de un modelo de 4B en trayectorias multi-turno con function calling y salidas enmascaradas.
- Baseline para ablaciones de hiperparametros: al documentarse learning rate, coeficiente KL, tamano de grupo y numero de rollouts, sirve como referencia reproducible para comparar variantes de GRPO.
- Prototipado de asistentes con filtro de seguridad: para entornos de desarrollo donde se quiera probar un modelo pequeno con politica de rechazo entrenada, siempre teniendo en cuenta que es un checkpoint intermedio y no un modelo final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente reporta el reward medio binario del juez durante el entrenamiento:

| Ventana (updates) | Reward medio | Rollouts juzgados |
|---|---|---|
| 790-800 | 0.808 | 1200 |
| 830-840 | 0.815 | 1200 |
| 870-880 | 0.855 | 1200 |
| 910-920 | 0.877 | 1200 |
| 950-960 | 0.853 | 1200 |
| 990-1000 | 0.808 | 1200 |

Desglose por dataset en las mismas ventanas:

| Dataset | 790-800 | 830-840 | 870-880 | 910-920 | 950-960 | 990-1000 |
|---|---|---|---|---|---|---|
| agentalign_benign | 0.61 | 0.62 | 0.73 | 0.69 | 0.72 | 0.69 |
| agentalign_harmful | 0.90 | 0.95 | 0.96 | 0.93 | 0.90 | 0.91 |
| codesafetybench | 0.85 | 0.93 | 0.93 | 0.83 | 0.95 | 0.96 |
| difficult_advice | 0.81 | 0.88 | 0.86 | 0.88 | 0.83 | 0.84 |
| magicoder | 0.76 | 0.26 | 0.77 | 0.87 | 0.54 | 0.53 |
| star1_gp3 | 0.97 | 0.96 | 0.96 | 0.99 | 0.95 | 0.96 |
| star_benign_v2 | 0.84 | 0.83 | 0.86 | 0.94 | 0.94 | 0.88 |
| wildjailbreak_benign | 0.86 | 0.86 | 0.81 | 0.88 | 0.93 | 0.82 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos (tamano del repo), mas overhead de activaciones y cache KV; en la practica, alrededor de 10-12 GB para contexto moderado.
- GPU recomendadas: el entrenamiento se realizo en 1x NVIDIA B200 (trainer y motor de rollout) con el juez en 2x A100 (SGLang TP2). Para inferencia, una A100 40 GB o H100 son holgadas; una RTX 4090 (24 GB) es suficiente en bf16.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) y previsiblemente en GPUs de 16 GB con cuantizacion, aunque no se publican pesos cuantizados.
- Opciones de despliegue: transformers (ejemplo oficial de la model card con `Qwen3_5ForConditionalGeneration` y `device_map="auto"`); SGLang y vLLM son compatibles con la familia Qwen3.5, aunque no se documentan configuraciones especificas para este checkpoint. No se ofrecen GGUF ni Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8 (este) | 4.659.865.088 | 40.960 en entrenamiento | GRPO de seguridad, checkpoint intermedio | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B-Base | no disponible en la informacion | no disponible | Modelo base multimodal sin ajuste de seguridad | Apache 2.0 | Hugging Face (oficial) |
| Alternativas de seguridad de ~4B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio, no un modelo final: el entrenamiento seguia en curso en el momento de la exportacion y el reward medio fluctua (0.808 en la ultima ventana frente a 0.877 en el maximo).
- El reward de magicoder cae de 0.76 a 0.53 entre las ventanas 790-800 y 990-1000, lo que sugiere una posible degradacion de la utilidad en generacion de codigo por el ajuste de seguridad.
- El reward de agentalign_benign se mantiene bajo (0.61-0.73), lo que indica margen de mejora en el cumplimiento de tareas benignas con herramientas.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; al ser un modelo de 4B, es esperable un riesgo superior al de modelos mayores.
- Sesgos conocidos: no documentados en la model card.
- Idiomas soportados: no especificados; el comportamiento multilingue no esta garantizado.
- La evaluacion se basa en un unico juez (Qwen3.8-27B) con veredicto binario, lo que puede introducir sesgo del juez y no sustituye a benchmarks estandar.
- Solo se entreno el modelo de lenguaje: las capacidades de vision no se han ajustado y pueden no alinearse con la politica de seguridad aprendida en texto.
- Uso comercial: permitido por Apache 2.0, pero la falta de evaluacion estandar y su naturaleza de snapshot desaconsejan su uso en produccion sin validacion adicional.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-ep2-step1000
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Papers, blogs, repos y demos adicionales: no disponibles en la informacion proporcionada.
