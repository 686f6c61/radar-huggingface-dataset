# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr2e-6-kl0.001-p15-k8-resume80-step480

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr2e-6-kl0.001-p15-k8-resume80-step480 es un checkpoint intermedio de ajuste fino con aprendizaje por refuerzo (GRPO) sobre el modelo base Qwen/Qwen3.5-4B-Base, desarrollado por el usuario thkim0305-SNU. El objetivo del entrenamiento es el alineamiento de seguridad: se optimiza al modelo para que responda de forma segura y rechace peticiones dañinas, incluyendo trayectorias de uso de herramientas en escenarios agénticos. No es un modelo final, sino una instantánea tras 480 actualizaciones de optimizador de un entrenamiento que sigue en curso.

El modelo conserva la arquitectura del base Qwen3.5-4B (transformer multimodal con torre de visión y cabeza MTP, empaquetado como `Qwen3_5ForConditionalGeneration`) con 4.659.865.088 parámetros totales y pesos en bf16. Solo se ha entrenado el modelo de lenguaje; la torre de visión y la cabeza MTP mantienen los pesos originales, de modo que el checkpoint se carga exactamente igual que el base.

Su relevancia es metodológica: documenta con detalle una receta de RL de seguridad (GRPO con recompensas binarias, juez externo Qwen3.8-27B, prompts de seguridad y código, rollouts multi-turno con simulador de herramientas) y publica la evolución de las puntuaciones del juez por dataset a lo largo del entrenamiento, lo que permite estudiar dinámicas de alineamiento y olvido de capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5), clase `Qwen3_5ForConditionalGeneration`, con torre de visión y cabeza MTP |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40.960 tokens en entrenamiento (contexto del base no especificado en la informacion disponible) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers), bf16 |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B-Base (snapshot `1001bb4d826a`) y mantiene su arquitectura multimodal completa: torre de visión, modelo de lenguaje y cabeza MTP (multi-token prediction). El ajuste solo afecta al modelo de lenguaje; visión y MTP se copian sin modificar desde el base, y las proyecciones GDN se refusionan durante la exportación desde el formato Megatron `torch_dist` (`iter_0000479`) al formato Hugging Face.

El entrenamiento usa GRPO con recompensas binarias normalizadas por grupo, clip PPO de 0,2 y TIS activado, sobre el framework Slime (rollouts con SGLang en modo colocado) y Megatron-LM en bf16. Cada actualización emplea 15 prompts × 8 rollouts = 120 secuencias, con learning rate constante de 2e-6, AdamW (betas 0,9/0,95), weight decay 0,1, grad clip 1,0 y pérdida KL de baja varianza con coeficiente 0,001 respecto al modelo congelado de partida. El muestreo usa temperatura 1,0, top-p 1 y hasta 32.768 tokens generados sobre un contexto de 40.960. Se activa el modo thinking de la plantilla de chat de Qwen y, en los rollouts con herramientas, el function calling `qwen3_coder`. La recompensa la otorga un juez Qwen3.8-27B con veredicto binario estricto (0/1); los prompts de AgentAlign se juzgan sobre toda la trayectoria de herramientas visible. El schedule cubre una época con padding sobre 11.794 prompts únicos (787 actualizaciones), con checkpoints cada 40.

El conjunto de datos «mixture-8» combina star1_gp3 (1.000), star_benign_v2 (915), agentalign_harmful (2.000), agentalign_benign (2.000), codesafetybench (900), magicoder (1.000), difficult_advice (1.982) y wildjailbreak_benign (1.997). Los 4.000 prompts de AgentAlign incorporan definiciones sintéticas de herramientas y se despliegan como trayectorias multi-turno contra un simulador, con las salidas de herramienta enmascaradas en la pérdida. El run se ejecutó en 1× NVIDIA B200 para entrenador y motor de rollout, con el juez en 2× A100 (SGLang TP2) vía túnel SSH, reanudando en la actualización 280 desde un run previo en 3× RTX PRO 6000.

## Capacidades

- Generación de texto conversacional con plantilla de chat de Qwen y modo thinking (`enable_thinking=true`).
- Entrada image-text-to-text: conserva la torre de visión del base, aunque no fue entrenada en este ajuste.
- Razonamiento multi-turno y uso de herramientas mediante function calling (`qwen3_coder`), con entrenamiento específico en trayectorias agénticas.
- Comportamiento de seguridad alineado: rechazo de peticiones dañinas y respuestas seguras ante prompts de jailbreak, código inseguro y consejo sensible.
- Capacidades de código preservadas parcialmente vía el dataset magicoder y codesafetybench.
- Capacidades multilingües: no disponibles en la información proporcionada (heredadas del base, sin detalle).
- Compatible con endpoints (`endpoints_compatible`) y con la librería transformers.

## Casos de uso

- Investigación en alineamiento de seguridad: sirve como checkpoint intermedio para estudiar la curva de recompensa del juez y el equilibrio entre seguridad y utilidad a lo largo de las actualizaciones (310-480), comparando puntuaciones por dataset.
- Filtrado y moderación de contenido en pipelines: el modelo puede clasificar o reescribir respuestas potencialmente dañinas, aprovechando su entrenamiento con veredictos binarios de un juez de seguridad.
- Evaluación de robustez frente a jailbreaks: adecuado para probar defensas ante prompts de wildjailbreak y difficult_advice en entornos controlados de red teaming.
- Agentes con herramientas en entornos simulados: su entrenamiento con trayectorias multi-turno y definiciones sintéticas de herramientas permite experimentar con políticas de rechazo dentro de flujos agénticos.
- Generación de código con restricciones de seguridad: útil para validar si el modelo evita patrones inseguros en tareas de programación (codesafetybench, magicoder).
- Baseline para comparativas de RL de seguridad: al publicarse la receta completa (hiperparámetros, datasets, juez), sirve como referencia reproducible para otros grupos que ajusten modelos de 4B con GRPO.
- Prototipado de asistentes conversacionales con contexto largo: los 40.960 tokens de contexto de entrenamiento permiten conversaciones multi-turno extensas en pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card solo reporta la puntuación media de recompensa binaria del juez durante el entrenamiento:

| Ventana de actualizaciones | Puntuación media | Rollouts juzgados |
|---|---|---|
| 310-320 | 0,839 | 1200 |
| 350-360 | 0,796 | 1199 |
| 390-400 | 0,786 | 1200 |
| 430-440 | 0,729 | 1200 |
| 470-480 | 0,722 | 1200 |

Desglose por dataset (puntuación binaria del juez):

| Dataset | 310-320 | 350-360 | 390-400 | 430-440 | 470-480 |
|---|---|---|---|---|---|
| agentalign_benign | 0,64 | 0,54 | 0,57 | 0,50 | 0,54 |
| agentalign_harmful | 0,89 | 0,94 | 0,85 | 0,85 | 0,77 |
| codesafetybench | 0,94 | 0,89 | 0,91 | 0,83 | 0,88 |
| difficult_advice | 0,85 | 0,77 | 0,68 | 0,62 | 0,74 |
| magicoder | 0,69 | 0,69 | 0,70 | 0,65 | 0,67 |
| star1_gp3 | 0,84 | 0,95 | 0,98 | 0,97 | 0,79 |
| star_benign_v2 | 0,83 | 0,98 | 0,98 | 0,90 | 0,89 |
| wildjailbreak_benign | 0,86 | 0,83 | 0,74 | 0,81 | 0,79 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos (4,66B parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 12 y 16 GB según longitud de contexto y batch.
- GPU recomendadas: NVIDIA B200 o A100/H100 para entrenamiento y rollouts a gran escala; para inferencia, una RTX 4090 (24 GB) o RTX PRO 6000 son suficientes en bf16.
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más en bf16; con cuantización a 8 bits o 4 bits cabría en 12 GB u 8 GB, aunque no se publican pesos cuantizados oficiales.
- Opciones de despliegue: transformers (receta oficial de la model card); vLLM, SGLang, TGI, llama.cpp u Ollama no están confirmados para esta arquitectura en la información disponible.
- Latencia y throughput: no disponibles. El entrenamiento usó SGLang para rollouts con hasta 32.768 tokens generados, lo que da una idea del orden de magnitud del coste de generación, pero no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Safety_Tuning Qwen3.5-4B GRPO) | 4,66B | 40.960 en entrenamiento | RL de seguridad (GRPO) sobre Qwen3.5-4B-Base | apache-2.0 | Hugging Face (checkpoint intermedio) |
| Qwen/Qwen3.5-4B-Base | 4,66B (no confirmado en la información) | no disponible | Modelo base multimodal sin alineamiento de seguridad específico | apache-2.0 | Hugging Face |
| Alternativas de alineamiento de seguridad de 4B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos de seguridad del mismo tamaño en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Es un checkpoint intermedio, no un modelo final: el entrenamiento sigue en curso y la puntuación del juez muestra una tendencia descendente en las últimas ventanas (de 0,839 a 0,722), lo que sugiere inestabilidad o degradación durante el tramo observado.
- El dataset agentalign_benign obtiene puntuaciones bajas y decrecientes (0,50-0,64), lo que indica posible sobre-rechazo o dificultad para manejar trayectorias agénticas benignas.
- Riesgo de sobre-alineamiento: un exceso de rechazo puede degradar la utilidad general y la capacidad de código (magicoder se mantiene en torno a 0,65-0,70).
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad; el ajuste con RL de seguridad no garantiza corrección factual.
- Idiomas soportados no documentados; el comportamiento multilingüe es incierto y heredado del base sin verificación.
- La torre de visión y la cabeza MTP no fueron entrenadas, por lo que las capacidades de imagen no han sido alineadas en seguridad.
- Licencia apache-2.0 permite uso comercial, pero el modelo se distribuye sin garantías y como snapshot de investigación; no se recomienda su uso en producción sin evaluación adicional.
- El pipeline de recompensa depende de un juez externo (Qwen3.8-27B) con veredicto binario estricto; los sesgos del juez pueden transferirse al modelo.
- Sin datos de benchmarks estándar ni de latencia/throughput, lo que dificulta estimar su rendimiento real en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr2e-6-kl0.001-p15-k8-resume80-step480
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
