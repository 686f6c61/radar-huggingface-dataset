# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr2e-6-kl0.001-p15-k8-resume80-step400

## Resumen

Este repositorio contiene un checkpoint intermedio de ajuste fino por refuerzo (RL) orientado a seguridad sobre el modelo base Qwen/Qwen3.5-4B-Base, desarrollado por el usuario thkim0305-SNU. No se trata de un modelo final ni de un lanzamiento oficial, sino de una instantánea del entrenamiento en el paso 400 (iteración 399 de Megatron) de un proceso de GRPO que seguía en curso en el momento de la publicación. El objetivo del entrenamiento es alinear el comportamiento del modelo en escenarios de seguridad: rechazo de peticiones dañinas, uso seguro de herramientas (tool calling) y generación de código sin contenido peligroso.

El modelo conserva la arquitectura multimodal del Qwen3.5-4B-Base (clase `Qwen3_5ForConditionalGeneration`), con torre de visión y cabeza MTP intactas, y solo se ha entrenado la parte del modelo de lenguaje. Cuenta con 4.659.865.088 parámetros totales en formato bf16 y un contexto de entrenamiento de 40.960 tokens, con generación de hasta 32.768 tokens. La licencia es Apache 2.0, heredada del modelo base.

Su relevancia es fundamentalmente metodológica y de investigación: documenta con detalle la receta de RL (GRPO con recompensas binarias juzgadas por un modelo Qwen3.8-27B), la composición del dataset "mixture-8" y la evolución de las puntuaciones del juez durante el entrenamiento. Es un artefacto útil para quienes estudian técnicas de safety tuning con RL, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5), clase `Qwen3_5ForConditionalGeneration`; torre de visión y cabeza MTP del modelo base sin entrenar |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40.960 tokens en entrenamiento (ventana de generación de hasta 32.768 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, formato Hugging Face transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base, un transformer multimodal con torre de visión y una cabeza MTP (multi-token prediction). En este checkpoint solo se ha entrenado el modelo de lenguaje; la torre de visión y la cabeza MTP conservan los pesos originales del base, de modo que el checkpoint se carga exactamente igual que el modelo base. Los pesos se exportaron desde Megatron (torch_dist, `iter_0000399`) mediante `safety_tuning.hf_export`, con refusión de las proyecciones GDN, mapeo de nombres de Slime para Qwen3.5 y dtypes alineados con el índice del base.

El entrenamiento emplea GRPO con recompensas binarias normalizadas por grupo, clip PPO de 0.2 y TIS activado, sobre el framework Slime (rollouts con SGLang colocados) y Megatron-LM en bf16. Cada actualización usa 15 prompts con 8 rollouts cada uno (120 secuencias), learning rate constante de 2e-6, AdamW con betas [0.9, 0.95], weight decay 0.1 y grad clip 1.0, con una pérdida KL de baja varianza de coeficiente 0.001 respecto al modelo inicial congelado. El muestreo usa temperatura 1.0, top-p 1 y plantilla de chat de Qwen con `enable_thinking=true`; los rollouts con herramientas usan function calling `qwen3_coder`. La recompensa la otorga un juez Qwen3.8-27B con veredicto binario estricto (0/1) según la especificación del proyecto, y los prompts de AgentAlign se juzgan sobre toda la trayectoria visible de uso de herramientas. El schedule cubre una época con padding sobre 11.794 prompts únicos (787 actualizaciones), con checkpoints cada 40 actualizaciones.

El dataset "mixture-8" se compone de: star1_gp3 (1.000 prompts), star_benign_v2 (915), agentalign_harmful (2.000), agentalign_benign (2.000), codesafetybench (900), magicoder (1.000), difficult_advice (1.982) y wildjailbreak_benign (1.997). Los 4.000 prompts de AgentAlign incluyen definiciones sintéticas de herramientas y se despliegan como trayectorias multiturno contra un simulador, con las salidas de herramienta enmascaradas en la pérdida.

## Capacidades

- Generación de texto conversacional con plantilla de chat de Qwen y modo de razonamiento explícito (`enable_thinking=true`).
- Entrada imagen-texto: hereda la torre de visión del Qwen3.5-4B-Base (aunque no fue entrenada en este ajuste).
- Tool calling / function calling mediante el formato `qwen3_coder`, con entrenamiento específico en trayectorias multiturno de uso de herramientas.
- Comportamiento orientado a seguridad: rechazo de peticiones dañinas, consejo responsable y generación de código seguro, fruto del RL con recompensas binarias.
- Razonamiento multi-step y agentes: los rollouts de AgentAlign entrenan trayectorias completas de agente con herramientas simuladas.
- Capacidades multilingües: no disponibles en la información proporcionada (heredadas potencialmente del base, sin confirmar).
- Generación de código (prompts de magicoder y codesafetybench en el entrenamiento).

## Casos de uso

- Investigación en safety tuning con RL: el checkpoint sirve como referencia reproducible para estudiar el efecto de GRPO con recompensas binarias sobre el comportamiento de seguridad, gracias a la documentación detallada de la receta y de la evolución del juez.
- Evaluación de agentes con herramientas en entornos simulados: los prompts de AgentAlign con definiciones sintéticas de herramientas permiten probar políticas de uso seguro de funciones en trayectorias multiturno.
- Filtrado y moderación de código generado: el entrenamiento con codesafetybench lo hace adecuado para experimentar con detección de código inseguro en pipelines de revisión.
- Estudio de la degradación durante el entrenamiento: las métricas por ventana de actualizaciones permiten analizar cómo evolucionan distintos tipos de prompt (por ejemplo, la caída de difficult_advice de 0.85 a 0.68) y diseñar estrategias de currículum.
- Base para comparativas de checkpoints intermedios: al ser una instantánea del paso 400 de un run más largo, es útil para medir el efecto del número de actualizaciones en la alineación de seguridad.
- Prototipado de asistentes con razonamiento visible: el modo thinking y el contexto de 40.960 tokens permiten experimentar con respuestas razonadas en tareas de consejo y explicación.
- Punto de partida para ajustes posteriores: su licencia Apache 2.0 y su compatibilidad exacta con la clase del base facilitan continuar el entrenamiento o aplicar SFT/DPO encima.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente reporta la puntuación media del juez binario durante el entrenamiento:

| Ventana de actualizaciones | Puntuación media | Rollouts juzgados |
|---|---|---|
| 310-320 | 0.839 | 1200 |
| 350-360 | 0.796 | 1199 |
| 390-400 | 0.786 | 1200 |

Desglose por dataset (puntuación del juez binario):

| Dataset | 310-320 | 350-360 | 390-400 |
|---|---|---|---|
| agentalign_benign | 0.64 | 0.54 | 0.57 |
| agentalign_harmful | 0.89 | 0.94 | 0.85 |
| codesafetybench | 0.94 | 0.89 | 0.91 |
| difficult_advice | 0.85 | 0.77 | 0.68 |
| magicoder | 0.69 | 0.69 | 0.70 |
| star1_gp3 | 0.84 | 0.95 | 0.98 |
| star_benign_v2 | 0.83 | 0.98 | 0.98 |
| wildjailbreak_benign | 0.86 | 0.83 | 0.74 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 12 y 16 GB para contexto moderado.
- GPU recomendadas: el entrenamiento se realizó en 1x NVIDIA B200 (con el juez en 2x A100 con SGLang TP2); para inferencia basta una GPU con al menos 16 GB, como RTX 4090, L40S, A100 o H100.
- Cabe en GPU de consumo: sí, en bf16 en tarjetas de 16 GB o más (RTX 4080/4090, RTX 5090); con cuantización a 8 o 4 bits cabría en GPUs de 8-12 GB, aunque no se publican pesos cuantizados.
- Opciones de despliegue: transformers (receta oficial de la model card), vLLM y SGLang (usado en los rollouts del entrenamiento); llama.cpp/Ollama requerirían conversión a GGUF, no disponible en el repo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Safety_Tuning-Qwen3.5-4B-Base-GRPO) | 4,66 B | 40.960 tokens | Safety RL (GRPO) sobre Qwen3.5-4B-Base, checkpoint intermedio | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B-Base | no disponible | no disponible | Modelo base multimodal sin alineación de seguridad específica | Apache 2.0 | Hugging Face (oficial) |
| Qwen3.8-27B (juez del entrenamiento) | no disponible | no disponible | Modelo mayor usado como juez binario | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio, no un modelo final: el entrenamiento seguía en curso y la puntuación media del juez descendió de 0.839 a 0.786 entre las ventanas 310-320 y 390-400, lo que sugiere inestabilidad o sobreajuste a ciertos conjuntos.
- Degradación observable en algunos datasets: difficult_advice baja de 0.85 a 0.68 y wildjailbreak_benign de 0.86 a 0.74, lo que indica posible pérdida de calidad en consejo difícil y en robustez ante jailbreaks benignos.
- El rendimiento en agentalign_benign es bajo (0.54-0.64), lo que apunta a dificultades para completar correctamente trayectorias de herramientas benignas.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad; al ser un modelo de 4,66 B, la tasa de alucinación puede ser relevante en tareas de conocimiento.
- Idiomas soportados no confirmados: la model card no detalla la cobertura lingüística del ajuste.
- El juicio de recompensa lo realiza un modelo (Qwen3.8-27B) con veredicto binario estricto, lo que puede introducir sesgos del juez en el comportamiento aprendido.
- Solo se entrenó el modelo de lenguaje: las capacidades de visión no se han alineado en este proceso y conservan el comportamiento del base.
- Sin datos de benchmarks estándar ni de latencia/throughput; no se recomienda su uso en producción sin una evaluación propia.
- Licencia Apache 2.0 permite uso comercial, pero al ser un artefacto de investigación sin garantías, el uso en producción requiere validación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr2e-6-kl0.001-p15-k8-resume80-step400
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
