# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-ep2-step880

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-ep2-step880 es un checkpoint intermedio de ajuste fino por refuerzo (GRPO) sobre el modelo base Qwen/Qwen3.5-4B-Base, desarrollado por el usuario thkim0305-SNU. El objetivo del entrenamiento es el alineamiento de seguridad: reducir respuestas dañinas y mejorar el comportamiento en trayectorias de uso de herramientas, manteniendo la utilidad en tareas benignas. No es un modelo final, sino una instantánea del paso 880 de un entrenamiento todavía en curso.

El modelo conserva la arquitectura original del base (Qwen3.5, 4.659.865.088 parámetros totales, pesos en bf16 y formato safetensors), incluyendo la torre de visión y la cabeza MTP sin modificar; solo se ha entrenado el modelo de lenguaje. El contexto de entrenamiento alcanza los 40.960 tokens y se generan hasta 32.768 tokens por rollout, con el chat template de Qwen y `enable_thinking=true`.

Su relevancia es metodológica: documenta con detalle una receta de RL de seguridad con GRPO, recompensas binarias estrictas emitidas por un juez (Qwen3.8-27B), KL bajo contra el modelo inicial y rollouts multi-turno con simulador de herramientas. Resulta útil para investigadores que quieran reproducir o auditar pipelines de safety tuning, no como modelo de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 (`Qwen3_5ForConditionalGeneration`), con torre de visión y cabeza MTP |
| Parámetros totales | 4.659.865.088 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40.960 tokens (contexto de entrenamiento/rollout) |
| Tipos de cuantización | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base y mantiene su arquitectura intacta salvo el ajuste del modelo de lenguaje: la torre de visión y la cabeza MTP son los pesos originales del base, y las proyecciones GDN se re-fusionaron durante la exportación desde Megatron. El checkpoint se exportó desde el estado `iter_0000879` de Megatron (torch_dist) mediante `safety_tuning.hf_export`, con el mapeo de nombres de Slime para Qwen3.5 y dtypes alineados con el índice del base.

El entrenamiento usa GRPO con recompensas binarias normalizadas por grupo, clip PPO de 0,2 y TIS activado, sobre el framework Slime (rollouts con SGLang, colocados) y Megatron-LM en bf16. Cada actualización emplea 15 prompts × 8 rollouts = 120 secuencias, con learning rate constante de 1e-6, AdamW (betas 0,9/0,95), weight decay 0,1, grad clip 1,0 y una pérdida KL de baja varianza con coeficiente 0,001 frente al modelo congelado de partida. El muestreo usa temperatura 1,0, top-p 1, hasta 32.768 tokens generados y 40.960 de contexto; el modo thinking está activado y los rollouts con herramientas usan el function calling `qwen3_coder`. La recompensa la emite un juez Qwen3.8-27B con veredicto binario estricto (0/1) según la especificación del proyecto; los prompts de AgentAlign se juzgan sobre toda la trayectoria visible de herramientas.

El conjunto de datos "mixture-8" suma 11.794 prompts únicos: star1_gp3 (1000), star_benign_v2 (915), agentalign_harmful (2000), agentalign_benign (2000), codesafetybench (900), magicoder (1000), difficult_advice (1982) y wildjailbreak_benign (1997). Los 4000 prompts de AgentAlign incorporan definiciones sintéticas de herramientas y se despliegan como trayectorias multi-turno contra un simulador, con las salidas de herramienta enmascaradas en la pérdida. El schedule prevé una época con padding sobre 1574 actualizaciones, con checkpoints cada 40. Esta instantánea corresponde a la época 2 de la ejecución con lr 1e-6, reanudada en la actualización 787 desde su checkpoint final (modelo, estado del optimizador y RNG) con un nuevo barajado de prompts (semilla 43). La ejecución usó 1× NVIDIA B200 para entrenador y motor de rollout, y 2× A100 (SGLang TP2) para el juez, conectadas por túnel SSH.

## Capacidades

- Generación de texto conversacional y razonamiento con modo thinking activable mediante el chat template de Qwen.
- Procesamiento de imagen y texto (`image-text-to-text`), heredado de la torre de visión del base, aunque dicha torre no se entrenó.
- Tool calling / function calling mediante el formato `qwen3_coder`, con soporte de trayectorias multi-turno contra un simulador de herramientas.
- Comportamiento orientado a agentes: los datos de AgentAlign entrenan respuestas seguras tanto en escenarios dañinos como benignos con uso de herramientas.
- Seguridad alineada: rechazo o redirección ante peticiones dañinas (jailbreaks, consejos peligrosos, código inseguro) y mantenimiento de utilidad en prompts benignos.
- Capacidades multilingües: no disponible (no se documentan idiomas).
- No se documentan capacidades de audio ni otras modalidades adicionales.

## Casos de uso

- Investigación en safety tuning: replicar o auditar la receta GRPO con recompensas binarias de juez, comparando este checkpoint con el base y con estados posteriores del mismo run.
- Evaluación de robustez frente a jailbreaks: usar los prompts de wildjailbreak_benign y agentalign_harmful para medir tasas de rechazo y de falsos positivos en un modelo de 4B.
- Filtrado de seguridad en pipelines de generación de código: el modelo incorpora codesafetybench y magicoder en el entrenamiento, por lo que puede emplearse como clasificador o reescritor de sugerencias de código potencialmente inseguro.
- Agentes con herramientas en entornos controlados: validar el comportamiento multi-turno con definiciones sintéticas de funciones y salidas simuladas antes de conectar herramientas reales.
- Estudio de dinámica de RL: analizar las curvas de recompensa por dataset documentadas (por ejemplo, la caída de magicoder de 0,76 a 0,26 y su recuperación a 0,77 entre ventanas) para estudiar inestabilidad y olvido catastrófico.
- Base para ajuste posterior: al conservar la arquitectura y los pesos de visión/MTP del base, sirve como punto de partida para fine-tuning supervisado o DPO adicional en dominios específicos.
- Generación asistida con razonamiento en contexto largo: con 40.960 tokens de contexto puede procesar documentos extensos, aunque su uso en producción requiere validación previa por tratarse de un checkpoint intermedio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card solo reporta la recompensa media binaria del juez durante el entrenamiento:

| Ventana (updates) | Recompensa media | Rollouts juzgados |
|---|---|---|
| 790-800 | 0,808 | 1200 |
| 830-840 | 0,815 | 1200 |
| 870-880 | 0,855 | 1200 |

Desglose por dataset:

| Dataset | 790-800 | 830-840 | 870-880 |
|---|---|---|---|
| agentalign_benign | 0,61 | 0,62 | 0,73 |
| agentalign_harmful | 0,90 | 0,95 | 0,96 |
| codesafetybench | 0,85 | 0,93 | 0,93 |
| difficult_advice | 0,81 | 0,88 | 0,86 |
| magicoder | 0,76 | 0,26 | 0,77 |
| star1_gp3 | 0,97 | 0,96 | 0,96 |
| star_benign_v2 | 0,84 | 0,83 | 0,86 |
| wildjailbreak_benign | 0,86 | 0,86 | 0,81 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 12 y 16 GB para contexto moderado.
- Cuantización: no se publican versiones GGUF ni AWQ/GPTQ; sería necesario generarlas a partir de los safetensors. En 8 bits los pesos rondarían los 4,7 GB y en 4 bits unos 2,4 GB, sin datos oficiales de calidad tras cuantizar.
- GPU recomendadas: A100, H100 o B200 para bf16 sin cuantizar; el entrenamiento documentado usó 1× B200 y 2× A100 para el juez.
- GPU de consumo: cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) en bf16; en GPUs de 16 GB o menos requeriría cuantización.
- Opciones de despliegue: transformers (código de ejemplo de la model card), vLLM, SGLang y TGI para servir; llama.cpp u Ollama solo tras convertir a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Safety_Tuning-Qwen3.5-4B-Base-GRPO) | 4,66 B | 40.960 | Safety RL (GRPO) sobre Qwen3.5-4B-Base, checkpoint intermedio | apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B-Base | 4B (clase) | no disponible en la información | Modelo base generalista, sin alineamiento de seguridad específico | apache-2.0 | Hugging Face (modelo de referencia) |
| Alternativas de safety tuning de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos de seguridad de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 880 de 1574 actualizaciones previstas); el autor indica explícitamente que el entrenamiento sigue en curso y que no es un modelo final.
- Solo se entrenó el modelo de lenguaje: la torre de visión y la cabeza MTP son los pesos del base, por lo que el comportamiento multimodal no está alineado con el ajuste de seguridad.
- Riesgo de alucinación inherente a un modelo de 4B; no se han publicado evaluaciones de fidelidad factual.
- Inestabilidad observada durante el entrenamiento: la recompensa de magicoder cayó de 0,76 a 0,26 en la ventana 830-840 y se recuperó a 0,77 en la 870-880, lo que sugiere posible olvido catastrófico o varianza alta en la recompensa del juez.
- La recompensa depende de un juez automático (Qwen3.8-27B) con veredicto binario; puede heredar sesgos del juez y no equivale a una evaluación humana.
- Sesgos conocidos: no documentados en la información disponible.
- Idiomas soportados: no disponibles; no se garantiza un comportamiento uniforme fuera del inglés, idioma predominante en los datasets de seguridad citados.
- Licencia apache-2.0, que permite uso comercial, pero al ser un checkpoint de investigación sin evaluación de producción se desaconseja su despliegue directo sin auditoría propia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-ep2-step880
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
