# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step760

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step760 es un checkpoint intermedio de ajuste fino por refuerzo (GRPO) sobre el modelo base Qwen/Qwen3.5-4B-Base, publicado por el usuario thkim0305-SNU. El objetivo del entrenamiento es la alineación de seguridad: se optimiza al modelo para que rechace peticiones dañinas, mantenga utilidad en peticiones benignas y se comporte de forma segura en trayectorias multi-turno con uso de herramientas. El checkpoint corresponde a 760 actualizaciones del optimizador (iteración 759 de Megatron) sobre un total previsto de 787, por lo que es una instantánea de un proceso aún en curso y no un modelo final.

Arquitectura y tamaño: es un transformer multimodal de tipo Qwen3.5 con 4.659.865.088 parámetros (aproximadamente 4,66 mil millones), pesos en bf16 y una torre de visión más una cabeza MTP que permanecen intactas respecto al modelo base; solo se entrenó el modelo de lenguaje. El contexto de entrenamiento declarado es de 40.960 tokens y la generación se realizó con hasta 32.768 tokens nuevos. La licencia es Apache 2.0, heredada del modelo base.

Su relevancia es doble: por un lado, documenta una receta reproducible de RL de seguridad (GRPO con recompensas binarias, juez externo, KL bajo contra el modelo congelado) y, por otro, publica la evolución del reward por subconjunto de datos a lo largo del entrenamiento, lo que permite auditar el compromiso entre rechazo de contenido dañino y preservación de capacidades útiles. Es un artefacto de investigación, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (`Qwen3_5ForConditionalGeneration`), con torre de visión y cabeza MTP heredadas del base |
| Parametros totales | 4.659.865.088 (aprox. 4,66 B) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | 40.960 tokens en entrenamiento; no se especifica el máximo oficial del modelo base |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), compatible con `transformers` |
| Modelo base | Qwen/Qwen3.5-4B-Base (snapshot `1001bb4d826a`) |
| Algoritmo de ajuste | GRPO con recompensas binarias normalizadas por grupo, PPO clip 0.2, TIS activado |
| Framework de entrenamiento | Slime (rollouts con SGLang, colocados) + Megatron-LM, bf16 |
| Paso del checkpoint | 760 actualizaciones del optimizador (iteración Megatron 759) |
| Tamaño del repositorio | 9,3 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base, un transformer multimodal con torre de visión y una cabeza MTP (multi-token prediction). En este checkpoint solo se actualizaron los pesos del modelo de lenguaje: la torre de visión y la cabeza MTP conservan los valores del base, de modo que el checkpoint se carga exactamente igual que el modelo original mediante `Qwen3_5ForConditionalGeneration`. La exportación desde Megatron `torch_dist` se realizó con la herramienta `safety_tuning.hf_export`, que refusiona las proyecciones GDN, aplica el mapeo de nombres de Slime para Qwen3.5, copia los pesos de visión y MTP del base y ajusta los dtypes al índice original.

El entrenamiento es RL de seguridad con GRPO sobre el conjunto de prompts "mixture-8", que suma 11.794 prompts únicos: star1_gp3 (1.000), star_benign_v2 (915), agentalign_harmful (2.000), agentalign_benign (2.000), codesafetybench (900), magicoder (1.000), difficult_advice (1.982) y wildjailbreak_benign (1.997). Cada actualización usa 15 prompts con 8 rollouts por prompt (120 secuencias), learning rate constante de 1e-6, AdamW con betas [0.9, 0.95], weight decay 0.1, grad clip 1.0 y un término KL de baja varianza con coeficiente 0.001 contra el modelo de partida congelado. El muestreo usa temperatura 1.0, top-p 1, plantilla de chat de Qwen con `enable_thinking=true` y function calling `qwen3_coder`. La recompensa la emite un juez Qwen3.8-27B con veredicto binario estricto (0/1); los 4.000 prompts de AgentAlign incorporan definiciones sintéticas de herramientas y se despliegan como trayectorias multi-turno contra un simulador, enmascarando la pérdida en las salidas de herramienta. El calendario previsto es una época sobre los 11.794 prompts (787 actualizaciones), con checkpoints cada 80 pasos.

## Capacidades

- Generación de texto conversacional y razonamiento con modo de pensamiento explícito (`enable_thinking=true` en la plantilla de chat).
- Procesamiento de entradas imagen-texto (`image-text-to-text`), heredado de la torre de visión del modelo base, aunque esa torre no fue entrenada en este ajuste.
- Uso de herramientas y function calling mediante el formato `qwen3_coder`, con soporte de trayectorias multi-turno contra herramientas simuladas.
- Comportamiento orientado a agentes: el entrenamiento incluye rollouts de varios pasos con definiciones de herramientas y salidas enmascaradas.
- Alineación de seguridad entrenada: rechazo de peticiones dañinas en prompts directos, código y consejo difícil, y mantenimiento de utilidad en prompts benignos (star_benign_v2, wildjailbreak_benign, agentalign_benign).
- Capacidades multilingües: no disponible (la model card no declara idiomas).
- Capacidades de audio: no disponible.

## Casos de uso

- Investigación en alineación de seguridad: sirve como punto de comparación intermedio (paso 760 de 787) para estudiar cómo evoluciona el rechazo de contenido dañino frente a la utilidad benigna a lo largo del entrenamiento GRPO, usando las tablas de reward por subconjunto publicadas.
- Evaluación de robustez ante jailbreaks: el subconjunto wildjailbreak_benign permite medir si el modelo mantiene respuestas útiles ante prompts benignos formulados de forma adversarial, un escenario típico de auditoría de sistemas desplegados.
- Filtrado y moderación de código generado: entrenado sobre codesafetybench y magicoder, puede emplearse como componente de revisión en pipelines que detectan sugerencias de código inseguro antes de fusionar un cambio.
- Agentes con herramientas en entornos simulados: los rollouts de AgentAlign con definiciones sintéticas de herramientas permiten probar políticas de uso de funciones y evaluar si el modelo evita acciones dañinas a lo largo de una trayectoria multi-turno.
- Asistente de orientación en temas sensibles: el subconjunto difficult_advice entrena respuestas prudentes ante consultas delicadas, útil en prototipos de asesoramiento con derivación a recursos humanos cuando corresponda.
- Base para ablaciones de hiperparámetros: al ser un checkpoint con receta completamente documentada (lr, KL, tamaño de grupo, número de prompts), es adecuado para reproducir el experimento y comparar variantes de coeficiente KL o de tamaño de grupo.
- Prototipado de sistemas multimodales: al conservar la torre de visión del base, permite validar la integración de tuberías imagen-texto antes de aplicar un ajuste específico de seguridad sobre la parte visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card sí publica la evolución del reward medio binario otorgado por el juez Qwen3.8-27B durante el entrenamiento (1.200 rollouts juzgados por ventana):

| Ventana (actualizaciones) | Reward medio | Rollouts juzgados |
|---|---|---|
| 0-10 | 0,417 | 1200 |
| 70-80 | 0,578 | 1200 |
| 150-160 | 0,708 | 1200 |
| 230-240 | 0,768 | 1200 |
| 310-320 | 0,837 | 1200 |
| 390-400 | 0,804 | 1200 |
| 470-480 | 0,801 | 1200 |
| 550-560 | 0,841 | 1200 |
| 630-640 | 0,792 | 1200 |
| 710-720 | 0,815 | 1200 |
| 750-760 | 0,815 | 1200 |

Desglose por subconjunto en la ventana final (750-760) frente a la inicial (0-10):

| Dataset | 0-10 | 750-760 |
|---|---|---|
| agentalign_benign | 0,41 | 0,63 |
| agentalign_harmful | 0,63 | 0,91 |
| codesafetybench | 0,47 | 0,89 |
| difficult_advice | 0,28 | 0,93 |
| magicoder | 0,51 | 0,54 |
| star1_gp3 | 0,57 | 0,96 |
| star_benign_v2 | 0,27 | 0,90 |
| wildjailbreak_benign | 0,27 | 0,83 |

Estos valores son recompensas del juez del propio proyecto, no métricas de benchmarks públicos, y no son comparables con puntuaciones de MMLU o HumanEval.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 9,3 GB solo para pesos (4,66 B parámetros × 2 bytes), más memoria para activaciones, caché KV y el tokenizador; en la práctica, entre 12 y 16 GB para inferencia con contexto moderado.
- Cuantización: no se publican versiones GGUF ni AWQ; una conversión a 8 bits reduciría los pesos a unos 4,7 GB y a 4 bits a unos 2,4 GB, pero requeriría generarlas a partir de los safetensors bf16.
- GPU consumer: cabe en tarjetas de 16 GB o más (RTX 4080, RTX 4090, RTX 5080) en bf16 con contexto corto; en 8 bits cabría en 8-12 GB. No se dispone de mediciones propias.
- GPU de datacenter: A100 40/80 GB, H100 y B200 son adecuadas; el entrenamiento original se ejecutó en dos B200 (juez en la GPU 0, entrenador y motor de rollout en la GPU 1).
- Despliegue: compatible con `transformers` (código de ejemplo en la model card con `device_map="auto"` y `dtype="bfloat16"`). Para servidores de alto rendimiento, vLLM o TGI requerirían soporte de la arquitectura `qwen3_5`; llama.cpp y Ollama necesitarían una conversión a GGUF no publicada.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Safety_Tuning-Qwen3.5-4B-Base GRPO) | 4,66 B | 40.960 en entrenamiento | RL de seguridad sobre Qwen3.5-4B-Base, checkpoint intermedio | Apache 2.0 | Hugging Face, 27 descargas |
| Qwen/Qwen3.5-4B-Base | 4,66 B (mismo tamaño) | no disponible en la información | Modelo base sin ajuste de seguridad | Apache 2.0 | Hugging Face |
| Qwen3.8-27B (juez del proyecto) | 27 B (según la model card) | no disponible | Modelo de mayor tamaño usado como evaluador | no disponible | no disponible |

No se dispone de datos de benchmarks públicos que permitan comparar el rendimiento de este checkpoint con alternativas de la misma categoría; la única comparación posible es la evolución interna del reward frente a su propio estado inicial.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 760 de 787 actualizaciones previstas); el autor indica explícitamente que el entrenamiento sigue en curso y que no es un modelo final.
- El reward se mide con un juez automático (Qwen3.8-27B) y un veredicto binario estricto; puede haber sesgo del juez, sobreajuste al formato de evaluación y discrepancias con evaluaciones humanas.
- El reward de magicoder apenas mejora (0,51 a 0,54) y algunos subconjuntos muestran oscilaciones notables (por ejemplo, agentalign_benign baja de 0,71 a 0,63 en la última ventana), lo que sugiere inestabilidad y posible olvido de capacidades benignas.
- Riesgo de rechazo excesivo: un ajuste de seguridad agresivo puede degradar la utilidad en peticiones legítimas, especialmente en dominios técnicos o de consejo delicado.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad; el ajuste por RL sobre seguridad no garantiza fidelidad factual.
- Idiomas soportados no declarados; no hay evidencia de cobertura multilingüe más allá de la del modelo base.
- La torre de visión no fue entrenada en este ajuste, por lo que las capacidades imagen-texto son las del base y no están alineadas en seguridad.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye como artefacto de investigación sin garantías; conviene validarlo en el dominio de despliegue antes de producción.
- El repositorio tiene 27 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step760
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Framework Slime: no disponible (no se proporciona enlace en la información)
- Megatron-LM: no disponible (no se proporciona enlace en la información)
- SGLang: no disponible (no se proporciona enlace en la información)
- Paper o blog del proyecto: no disponible
