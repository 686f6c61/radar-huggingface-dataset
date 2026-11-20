# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step600

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step600 es un checkpoint intermedio de ajuste fino por refuerzo (GRPO) sobre el modelo base Qwen/Qwen3.5-4B-Base, desarrollado por el usuario thkim0305-SNU. El objetivo del entrenamiento es la alineación de seguridad: reforzar el rechazo de peticiones dañinas y el comportamiento seguro en trayectorias de uso de herramientas, manteniendo al mismo tiempo respuestas útiles ante peticiones benignas. No se trata de un modelo final, sino de una instantánea tras 600 actualizaciones del optimizador dentro de un ciclo de 787 previstas.

El modelo conserva la arquitectura multimodal del base (Qwen3_5ForConditionalGeneration, con torre de visión y cabeza MTP intactas) y solo entrena el modelo de lenguaje. Cuenta con 4.659.865.088 parámetros totales en bf16 y un contexto de entrenamiento de 40.960 tokens, con hasta 32.768 tokens generados por rollout. La relevancia actual reside en que documenta de forma transparente una receta de RL de seguridad sobre un modelo de 4B con datos mixtos (prompts dañinos, benignos, de código y de uso de herramientas), algo poco habitual en checkpoints de investigación.

La licencia es Apache 2.0, heredada del modelo base, y los pesos se distribuyen en safetensors compatibles con transformers. El repositorio ocupa 9,3 GB. El modelo no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (Qwen3_5ForConditionalGeneration), con torre de visión y cabeza MTP; solo se entrena el modelo de lenguaje |
| Parámetros totales | 4.659.865.088 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40.960 tokens en entrenamiento; no se especifica el máximo de inferencia |
| Tipos de cuantización | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, transformers) |

## Arquitectura y entrenamiento

El checkpoint parte de Qwen/Qwen3.5-4B-Base (snapshot `1001bb4d826a`) y mantiene su arquitectura completa: un modelo de lenguaje transformer con proyecciones GDN re-fusionadas en la exportación, torre de visión y cabeza MTP con los pesos originales sin tocar. La exportación se realizó desde un checkpoint Megatron torch_dist (`iter_0000599`) mediante `safety_tuning.hf_export`, con mapeo de nombres Slime Qwen3.5 y dtypes alineados al índice del base, de modo que el checkpoint carga exactamente igual que el modelo original.

El entrenamiento emplea GRPO con recompensas binarias normalizadas por grupo, PPO clip de 0,2 y TIS activado. El framework es Slime (rollouts SGLang colocados) junto con Megatron-LM en bf16. Por cada actualización se generan 15 prompts × 8 rollouts = 120 secuencias, con learning rate constante de 1e-6, AdamW con betas [0,9, 0,95], weight decay 0,1 y grad clip 1,0. Se aplica una pérdida KL de baja varianza contra el modelo inicial con coeficiente 0,001. El muestreo usa temperatura 1,0, top-p 1, hasta 32.768 tokens generados y contexto de 40.960. El juicio lo realiza Qwen3.8-27B con veredicto binario estricto (0/1) según la especificación del proyecto; los prompts de AgentAlign se evalúan sobre la trayectoria completa de uso de herramientas visible. El schedule cubre una época con padding sobre 11.794 prompts únicos (787 actualizaciones), con checkpoints cada 80 actualizaciones.

Los datos de entrenamiento (mixture-8) se componen de: star1_gp3 (1.000 prompts), star_benign_v2 (915), agentalign_harmful (2.000), agentalign_benign (2.000), codesafetybench (900), magicoder (1.000), difficult_advice (1.982) y wildjailbreak_benign (1.997). Los 4.000 prompts de AgentAlign incluyen definiciones sintéticas de herramientas y se despliegan como trayectorias multiturno contra un simulador, con las salidas de herramienta enmascaradas en la pérdida. El chat template de Qwen se usa con `enable_thinking=true` y, en los rollouts con herramientas, con function calling `qwen3_coder`.

## Capacidades

- Generación de texto conversacional con modo de razonamiento explícito (`enable_thinking=true`).
- Procesamiento de imagen y texto (pipeline image-text-to-text), aunque la torre de visión no se ha entrenado en este ajuste.
- Uso de herramientas y function calling en formato `qwen3_coder`.
- Razonamiento multi-step y trayectorias de agente multiturno, entrenadas explícitamente con el conjunto AgentAlign.
- Comportamiento de seguridad reforzado: rechazo de peticiones dañinas y respuestas seguras ante jailbreaks benignos.
- Capacidades de código, incluidas las relacionadas con seguridad de código (codesafetybench, magicoder).
- Capacidades multilingües: no disponibles (no se especifican idiomas).

## Casos de uso

- Moderación y rechazo de contenido dañino: el modelo puede integrarse como capa de filtrado conversacional, ya que el entrenamiento GRPO con recompensa binaria del juez Qwen3.8-27B refuerza explícitamente el rechazo de peticiones dañinas en agentalign_harmful (0,96 de recompensa media en la ventana 590-600).
- Asistentes con uso de herramientas en entornos sensibles: su entrenamiento sobre trayectorias multiturno con definiciones sintéticas de herramientas permite desplegarlo en agentes que deben decidir cuándo invocar una función y cuándo negarse, con salidas de herramienta enmascaradas durante el entrenamiento.
- Evaluación de seguridad de pipelines de código: el modelo ha sido entrenado con codesafetybench (0,91 en la última ventana) y magicoder, por lo que puede usarse para revisar sugerencias de código y detectar patrones inseguros en asistentes de programación.
- Investigación en alineación y RL: al ser un checkpoint intermedio con curvas de recompensa por dataset documentadas, sirve como referencia para estudiar la dinámica de GRPO con recompensas binarias y KL bajo.
- Atención al cliente con requisitos de seguridad: su contexto de 40.960 tokens permite gestionar conversaciones multi-turno largas manteniendo políticas de rechazo ante solicitudes inapropiadas.
- Consejo difícil y consultas delicadas: el conjunto difficult_advice (1.982 prompts, 0,82 de recompensa final) lo hace adecuado para asistentes que deben dar orientación prudente en temas sensibles.
- Defensa frente a jailbreaks benignos: entrenado con wildjailbreak_benign (1.997 prompts, 0,84 final), puede emplearse para mantener utilidad ante intentos de manipulación que no son dañinos en sí mismos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card sí documenta la recompensa media binaria del juez durante el entrenamiento por ventana de actualizaciones:

| Ventana (updates) | Recompensa media | Rollouts juzgados |
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
| 590-600 | 0,792 | 1200 |

Desglose por dataset en la ventana final (590-600): agentalign_benign 0,56; agentalign_harmful 0,96; codesafetybench 0,91; difficult_advice 0,82; magicoder 0,58; star1_gp3 0,98; star_benign_v2 0,92; wildjailbreak_benign 0,84. Se observa una caída en agentalign_benign respecto a la ventana 550-560 (0,68) y en magicoder respecto a 470-480 (0,77), lo que sugiere inestabilidad en la ventana final.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, se recomienda al menos 16-24 GB para contexto largo.
- En cuantización de 8 bits, los pesos rondarían los 4,7 GB; en 4 bits, unos 2,4 GB (estimación a partir del número de parámetros; no se han publicado cuantizaciones oficiales).
- GPU recomendadas: A100 (40/80 GB), H100, B200 (el entrenamiento se realizó en dos B200). Para inferencia, una RTX 4090 (24 GB) debería acomodar el modelo en bf16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 (24 GB) y potencialmente en GPUs de 16 GB con cuantización.
- Opciones de despliegue: transformers (soporte nativo documentado), vLLM, SGLang (usado en los rollouts del entrenamiento), llama.cpp/Ollama si se generan cuantizaciones GGUF (no publicadas).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8 (este) | 4,66 B | 40.960 (entrenamiento) | Apache 2.0 | RL de seguridad sobre Qwen3.5-4B-Base |
| Qwen/Qwen3.5-4B-Base | 4,66 B | no disponible | Apache 2.0 | Modelo base sin ajuste de seguridad |
| Alternativas de seguridad de tamaño similar | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparables con otros modelos de seguridad del mismo tamaño en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio (600 de 787 actualizaciones), no un modelo final; su comportamiento puede cambiar y presenta inestabilidad entre ventanas (por ejemplo, agentalign_benign cae de 0,68 a 0,56 en la última ventana).
- Riesgo de alucinación no evaluado: no se han publicado benchmarks de veracidad ni de conocimiento factual.
- La torre de visión y la cabeza MTP no se han entrenado; las capacidades de imagen son las del base y no han sido reforzadas para seguridad.
- No se especifican los idiomas soportados; el comportamiento multilingüe es incierto.
- El juicio de recompensa lo realiza Qwen3.8-27B con veredicto binario; posibles sesgos del juez pueden transferirse al modelo.
- La licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3.5-4B-Base conviene revisar la licencia del base enlazada en la model card.
- Sin descargas ni validación externa: no hay evidencia de uso en producción ni evaluaciones independientes.
- El contexto máximo de inferencia no está documentado; el valor de 40.960 corresponde al usado en entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step600
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
