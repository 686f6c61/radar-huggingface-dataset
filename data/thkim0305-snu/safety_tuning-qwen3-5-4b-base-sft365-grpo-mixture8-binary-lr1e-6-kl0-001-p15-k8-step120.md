# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT365-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step120

## Resumen

Este checkpoint es un modelo derivado de Qwen3.5-4B-Base, desarrollado por el usuario thkim0305-SNU, que ha sido sometido a un proceso de ajuste fino supervisado (SFT) seguido de un entrenamiento de refuerzo con GRPO (Group Relative Policy Optimization) orientado a la seguridad. El modelo parte de un checkpoint intermedio de SFT con 365 pasos y aplica 120 actualizaciones de optimizador adicionales sobre el conjunto de prompts denominado "mixture-8", que combina datos de seguridad, código, uso de herramientas y prompts benignos y dañinos. La arquitectura subyacente es Qwen3.5, un transformer multimodal (image-text-to-text) con aproximadamente 4.660 millones de parámetros, y el checkpoint se exporta en formato bf16 para la clase `Qwen3_5ForConditionalGeneration`.

El interés de este modelo reside en su receta de alineación de seguridad: emplea un juez externo (Qwen3.8-27B) que emite veredictos binarios estrictos (0/1), combinado con GRPO de recompensas binarias normalizadas por grupo, una pérdida KL de baja varianza frente al modelo congelado de partida y un entrenamiento multi-turno de trayectorias de uso de herramientas sobre definiciones sintéticas de funciones. El contexto de entrenamiento alcanza 40.960 tokens, con hasta 32.768 tokens generados por rollout, y el modo de pensamiento (`enable_thinking=true`) está activo durante el entrenamiento.

Se trata, sin embargo, de una instantánea intermedia: el autor indica explícitamente que el entrenamiento sigue en curso y que este checkpoint no es un modelo final. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y no se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; los únicos datos de rendimiento son las puntuaciones del juez durante el entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.5, clase `Qwen3_5ForConditionalGeneration`; torre de visión y cabeza MTP heredadas del modelo base sin entrenar |
| Parámetros totales | 4.659.865.088 (≈4,66 mil millones) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 40.960 tokens durante el entrenamiento |
| Tipos de cuantización | No disponible (el checkpoint se publica en bf16; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible (la model card no declara lista de idiomas) |
| Licencia | Apache 2.0 (con enlace a la licencia del modelo base Qwen/Qwen3.5-4B-Base) |
| Formato de pesos | Safetensors (bf16), exportado desde Megatron `torch_dist`; compatible con `transformers` |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-4B-Base: un transformer multimodal con torre de visión y una cabeza MTP (multi-token prediction), de la que solo se ha entrenado el modelo de lenguaje; la torre de visión y la cabeza MTP conservan los pesos originales del modelo base. El checkpoint se exportó desde un estado Megatron `torch_dist` (`iter_0000119`) mediante la herramienta `safety_tuning.hf_export`, que re-fusiona las proyecciones GDN, aplica el mapeo de nombres de Slime para Qwen3.5, copia los pesos de visión y MTP del base y ajusta los tipos de dato al índice del modelo original.

El entrenamiento de refuerzo emplea GRPO con recompensas binarias normalizadas por grupo, clip PPO de 0,2 y TIS (truncated importance sampling) activado. El marco de trabajo es Slime (con rollouts SGLang colocados) más Megatron-LM en bf16. Por cada actualización se procesan 15 prompts con 8 rollouts cada uno (120 secuencias), con tasa de aprendizaje constante de 1e-6, AdamW con betas [0,9; 0,95], weight decay de 0,1 y clip de gradiente de 1,0. Se aplica una pérdida KL de baja varianza frente al modelo congelado de partida con coeficiente 0,001. El muestreo usa temperatura 1,0, top-p 1 y hasta 32.768 tokens generados sobre un contexto de 40.960. El programa de entrenamiento cubre una época sobre 11.794 prompts únicos (787 actualizaciones), con checkpoints cada 40 actualizaciones; este corresponde al paso 120.

El conjunto de datos "mixture-8" se compone de: `star1_gp3` (1.000 prompts), `star_benign_v2` (915), `agentalign_harmful` (2.000), `agentalign_benign` (2.000), `codesafetybench` (900), `magicoder` (1.000), `difficult_advice` (1.982) y `wildjailbreak_benign` (1.997). Los 4.000 prompts de AgentAlign incorporan definiciones sintéticas de herramientas y se despliegan como trayectorias multi-turno de uso de herramientas contra un simulador, con las salidas de las herramientas enmascaradas en la pérdida. La recompensa proviene de un juez Qwen3.8-27B con veredicto binario estricto según la especificación del proyecto.

## Capacidades

- Generación de texto conversacional en modo chat, con plantilla de chat de Qwen y soporte de `enable_thinking=true` para razonamiento explícito.
- Razonamiento multi-paso y modo de pensamiento (thinking mode) activado durante el entrenamiento.
- Uso de herramientas y function calling mediante el formato `qwen3_coder`, con trayectorias multi-turno contra un simulador de herramientas.
- Capacidades multimodales heredadas del modelo base (procesamiento image-text-to-text), aunque la torre de visión no se ha entrenado en este ajuste.
- Comportamiento orientado a seguridad: rechazo de peticiones dañinas y respuestas seguras en contextos de consejo difícil, código y jailbreak.
- Generación y revisión de código con foco en seguridad (prompts de CodeSafetyBench y Magicoder).
- Capacidad multilingüe: no declarada explícitamente en la model card; se hereda la del modelo base Qwen3.5, pero no hay lista de idiomas disponible.

## Casos de uso

- Moderación y rechazo de peticiones dañinas en asistentes conversacionales: el modelo ha sido entrenado con recompensas binarias sobre prompts de `star1_gp3`, `star_benign_v2` y `wildjailbreak_benign`, por lo que puede clasificar y reformular solicitudes peligrosas en producción con un contexto de hasta 40.960 tokens.
- Asistentes con uso de herramientas en entornos agénticos: las 4.000 trayectorias de AgentAlign permiten desplegarlo en flujos multi-turno donde el modelo debe invocar funciones sintéticas y mantener coherencia a lo largo de la trayectoria, con soporte de `qwen3_coder` para el formato de llamada.
- Revisión de seguridad de código generado: los prompts de CodeSafetyBench y Magicoder entrenan al modelo para detectar patrones inseguros en código y proponer alternativas, integrándose en pipelines de CI/CD como paso de revisión previa al merge.
- Consejo responsable en dominios sensibles: el conjunto `difficult_advice` (1.982 prompts) entrena respuestas prudentes en consultas de salud, finanzas o situaciones personales delicadas, reduciendo respuestas temerarias.
- Evaluación y red-teaming de sistemas de IA: el checkpoint intermedio sirve como referencia para medir la evolución de la seguridad durante el entrenamiento (comparando las ventanas de actualizaciones 0-10 frente a 110-120) y como base para experimentos de alineación con GRPO.
- Investigación en alineación con RL: al publicarse la receta completa (algoritmo, hiperparámetros, composición del dataset y puntuaciones del juez), es un caso reproducible para estudiar el efecto de recompensas binarias estrictas y de la KL de baja varianza en modelos de ~4B.
- Filtrado y anotación de datasets de seguridad: el modelo puede puntuar pares prompt-respuesta con criterios de seguridad antes de incorporarlos a conjuntos de entrenamiento, dado su ajuste específico con juez binario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos publicados son las puntuaciones medias del juez binario durante el entrenamiento (recompensa bruta antes de la normalización por grupo):

| Ventana de actualizaciones | Puntuación media | Rollouts juzgados |
|---|---|---|
| 0-10 | 0,735 | 1.200 |
| 30-40 | 0,718 | 1.200 |
| 70-80 | 0,813 | 1.200 |
| 110-120 | 0,817 | 1.200 |

Desagregado por dataset:

| Dataset | 0-10 | 30-40 | 70-80 | 110-120 |
|---|---|---|---|---|
| agentalign_benign | 0,48 | 0,49 | 0,63 | 0,69 |
| agentalign_harmful | 0,96 | 0,94 | 0,97 | 0,93 |
| codesafetybench | 0,65 | 0,89 | 0,94 | 0,86 |
| difficult_advice | 0,88 | 0,90 | 0,88 | 0,94 |
| magicoder | 0,38 | 0,26 | 0,19 | 0,47 |
| star1_gp3 | 0,77 | 0,94 | 0,97 | 0,98 |
| star_benign_v2 | 0,72 | 0,64 | 0,72 | 0,82 |
| wildjailbreak_benign | 0,68 | 0,63 | 0,79 | 0,78 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para los pesos (el repositorio ocupa 9,3 GB), más activaciones y caché KV; en la práctica se recomienda al menos 12-16 GB de VRAM en bf16 para contextos moderados.
- GPU recomendadas: H100 80GB y A100 40/80GB para entrenamiento (el autor usó 4x H100 80GB); para inferencia en bf16 son suficientes GPUs de 16-24 GB.
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más (RTX 4090, RTX 4080, RTX 3090) en bf16 con `device_map="auto"`; en GPUs de 8-12 GB sería necesario cuantizar, pero no se documentan variantes cuantizadas.
- Opciones de despliegue: `transformers` con `Qwen3_5ForConditionalGeneration.from_pretrained(..., dtype="bfloat16", device_map="auto")`; el autor menciona SGLang para rollouts durante el entrenamiento; no se documentan configuraciones para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Safety_Tuning-Qwen3.5-4B-Base-SFT365-GRPO-Mixture8-...) | ≈4,66 B | 40.960 (entrenamiento) | Seguridad + GRPO + uso de herramientas | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B-Base | ≈4,66 B | No disponible en la información proporcionada | Modelo base multimodal | Apache 2.0 | Hugging Face |
| Checkpoint SFT de partida (Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr1e-5-step365) | ≈4,66 B | No disponible en la información proporcionada | SFT de seguridad previo al RL | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos frente a estos modelos ni frente a alternativas de otros autores; la comparación se limita a la genealogía de checkpoints publicada por el autor.

## Limitaciones y advertencias

- Es un checkpoint intermedio: el entrenamiento sigue en curso (programa de 787 actualizaciones, este es el paso 120) y el autor indica explícitamente que no es un modelo final.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad ni de tasa de alucinación; el ajuste con recompensas binarias no mide factualidad.
- Sesgos conocidos: no disponible; la model card no documenta análisis de sesgos.
- Idiomas: la model card no declara lista de idiomas; el comportamiento multilingüe se hereda del base sin verificación publicada.
- La torre de visión y la cabeza MTP conservan los pesos del base sin entrenar; las capacidades multimodales no han sido ajustadas en este proceso.
- El juez de recompensa es un modelo externo (Qwen3.8-27B) con criterios del proyecto; las puntuaciones publicadas reflejan la opinión de ese juez, no una evaluación humana independiente.
- El dataset de entrenamiento incluye prompts dañinos (`agentalign_harmful`, `star1_gp3`) y benignos; el equilibrio entre rechazo correcto y falsos positivos no está cuantificado más allá de las puntuaciones del juez.
- Uso comercial: la licencia es Apache 2.0, pero el modelo base Qwen3.5-4B-Base tiene su propia licencia enlazada; conviene revisar ambas antes de un despliegue comercial.
- Sin datos de benchmarks estándar ni de latencia/throughput, por lo que no es posible validar su rendimiento general frente a alternativas en producción.
- El repositorio tiene 0 descargas y 0 likes, sin señales de adopción comunitaria ni soporte de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT365-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step120
- Checkpoint SFT de partida: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr1e-5-step365
- Modelo base Qwen3.5-4B-Base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
