# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT365-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step400

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-SFT365-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step400 es un checkpoint intermedio de ajuste fino con RL (GRPO) orientado a seguridad, desarrollado por el usuario thkim0305-SNU. Parte de un SFT previo sobre Qwen3.5-4B-Base y aplica 400 actualizaciones de optimizador de aprendizaje por refuerzo sobre el conjunto de prompts "mixture-8", con recompensas binarias otorgadas por un juez Qwen3.8-27B. El modelo no esta terminado: es una instantanea de un entrenamiento en curso (la receta completa contempla 787 actualizaciones, es decir, una epoca sobre 11.794 prompts unicos).

El modelo es un `Qwen3_5ForConditionalGeneration` multimodal (image-text-to-text) con 4.659.865.088 parametros en bf16. Solo se entreno la torre del lenguaje; la torre de vision y la cabeza MTP conservan los pesos originales del modelo base, de modo que el checkpoint se carga exactamente igual que Qwen3.5-4B-Base. La licencia es Apache 2.0, heredada del modelo base.

Su relevancia es metodologica: documenta de forma granular como evoluciona la tasa de cumplimiento de un juez binario a lo largo del entrenamiento GRPO por subconjunto de datos (AgentAlign, CodeSafetyBench, Magicoder, WildJailbreak, etc.), lo que lo convierte en material util para investigacion en alineamiento y seguridad de agentes, no en un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `Qwen3_5ForConditionalGeneration` (torre de lenguaje + torre de vision + cabeza MTP) |
| Parametros totales | 4.659.865.088 (~4,66 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40.960 tokens (contexto de entrenamiento); hasta 32.768 tokens generados por rollout |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, exportado desde Megatron torch_dist) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Qwen3.5-4B-Base en su variante condicional multimodal: torre de vision, torre de lenguaje y cabeza MTP (multi-token prediction). En este checkpoint solo se actualizaron los pesos del lenguaje; vision y MTP son los del base sin tocar. El export desde Megatron refusiona las proyecciones GDN, aplica el mapeo de nombres de Slime para Qwen3.5 y copia los pesos de vision/MTP del base con dtypes coincidentes con el indice original.

El entrenamiento usa GRPO con recompensas binarias normalizadas por grupo, PPO clip 0.2 y TIS activado, sobre el framework Slime (rollouts con SGLang colocados) y Megatron-LM en bf16. Por cada actualizacion se muestrean 15 prompts x 8 rollouts = 120 secuencias, con learning rate constante de 1e-6, AdamW (betas 0.9/0.95), weight decay 0.1, grad clip 1.0 y una perdida KL de baja varianza con coeficiente 0.001 respecto al checkpoint de partida congelado. El muestreo usa temperatura 1.0, top-p 1 y plantilla de chat Qwen con `enable_thinking=true`; los rollouts de herramientas emplean function calling `qwen3_coder`. La recompensa la otorga un juez Qwen3.8-27B con veredicto binario estricto (0/1); en los prompts de AgentAlign se juzga la trayectoria completa de uso de herramientas visible.

El conjunto "mixture-8" suma 11.794 prompts: star1_gp3 (1.000), star_benign_v2 (915), agentalign_harmful (2.000), agentalign_benign (2.000), codesafetybench (900), magicoder (1.000), difficult_advice (1.982) y wildjailbreak_benign (1.997). Los 4.000 prompts de AgentAlign incluyen definiciones sinteticas de herramientas y se despliegan como trayectorias multiturno contra un simulador, con las salidas de herramienta enmascaradas en la perdida. El run se ejecuto en 4x H100 80GB con juez en TP2, entrenador en una GPU (estado del optimizador en CPU) y motor de rollout en otra.

## Capacidades

- Generacion de texto conversacional y razonamiento con modo "thinking" activable via plantilla de chat Qwen.
- Procesamiento de imagen y texto (pipeline image-text-to-text), aunque la torre de vision no fue entrenada en este checkpoint.
- Uso de herramientas y function calling en formato `qwen3_coder`, con soporte de trayectorias multiturno contra un simulador.
- Comportamiento orientado a seguridad: rechazo de peticiones daninas, manejo de jailbreaks benignos y respuestas cautelosas en consejos dificiles.
- Generacion y evaluacion de codigo seguro (entrenado sobre CodeSafetyBench y Magicoder).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- No se documentan capacidades de audio ni de agente autonomo fuera del bucle de tool calling simulado.

## Casos de uso

- Investigacion en alineamiento con RL: sirve como punto de comparacion intermedio (step 400 de 787) para estudiar la dinamica de recompensas binarias por subconjunto de datos y el efecto del coeficiente KL.
- Filtrado y moderacion de contenido en pipelines internos: el modelo muestra tasas altas de veredicto correcto en agentalign_harmful (0,95-0,98) y star1_gp3 (0,95-1,00), lo que permite usarlo como clasificador generativo de peticiones riesgosas.
- Evaluacion de seguridad de agentes con herramientas: los prompts de AgentAlign permiten probar politicas de rechazo en trayectorias multiturno con definiciones de herramientas sinteticas.
- Generacion de codigo con restricciones de seguridad: entrenado sobre CodeSafetyBench y Magicoder, es adecuado para prototipar asistentes de codigo que deban evitar patrones inseguros, aunque su tasa en Magicoder (0,76 al final) indica margen de mejora.
- Analisis de jailbreaks benignos: el subconjunto wildjailbreak_benign (0,91 al final) lo hace util para estudiar como responde el modelo a prompts adversariales que no son daninos.
- Base para experimentos de destilacion o comparacion de jueces: al estar entrenado contra un juez Qwen3.8-27B con especificacion de proyecto, sirve para medir la concordancia entre juez y modelo en tareas de consejo dificil (difficult_advice, 0,94).
- No se recomienda su uso directo en atencion al cliente ni en produccion: es un checkpoint intermedio sin evaluacion externa ni benchmarks publicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Lo unico documentado es la puntuacion media del juez binario durante el entrenamiento (recompensa cruda antes de normalizacion por grupo):

| Ventana de actualizaciones | Puntuacion media | Rollouts juzgados |
|---|---|---|
| 0-10 | 0,735 | 1.200 |
| 30-40 | 0,718 | 1.200 |
| 70-80 | 0,813 | 1.200 |
| 110-120 | 0,817 | 1.200 |
| 150-160 | 0,857 | 1.200 |
| 190-200 | 0,868 | 1.200 |
| 230-240 | 0,857 | 1.200 |
| 270-280 | 0,880 | 1.200 |
| 310-320 | 0,911 | 1.200 |
| 350-360 | 0,866 | 1.200 |
| 390-400 | 0,904 | 1.200 |

Desglose por subconjunto en la ventana final (390-400) frente al inicio (0-10):

| Dataset | Updates 0-10 | Updates 390-400 |
|---|---|---|
| agentalign_benign | 0,48 | 0,72 |
| agentalign_harmful | 0,96 | 0,95 |
| codesafetybench | 0,65 | 0,97 |
| difficult_advice | 0,88 | 0,94 |
| magicoder | 0,38 | 0,76 |
| star1_gp3 | 0,77 | 0,95 |
| star_benign_v2 | 0,72 | 0,98 |
| wildjailbreak_benign | 0,68 | 0,91 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos (4,66 B x 2 bytes), mas overhead de activaciones y cache KV; en la practica, entre 12 y 16 GB para contextos moderados.
- En cuantizacion de 8 bits cabria en torno a 5-6 GB de pesos; en 4 bits, alrededor de 3 GB. No se publican pesos cuantizados oficiales.
- GPU recomendadas: H100 80GB o A100 80GB para entrenamiento o inferencia con contexto largo (40.960 tokens); el run original uso 4x H100 80GB.
- Cabe en GPU de consumo: si, en tarjetas con 16-24 GB (RTX 4090, RTX 4080, RTX 3090) en bf16 o fp16; en 8 GB solo con cuantizacion agresiva y contexto reducido.
- Opciones de despliegue: transformers (referencia oficial), vLLM, TGI y llama.cpp/Ollama previa conversion a GGUF (no se proporcionan archivos GGUF).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (GRPO step 400) | 4,66 B | 40.960 | Seguridad + tool calling via RL | Apache 2.0 | Hugging Face |
| Qwen3.5-4B-Base (modelo base) | ~4 B | no disponible | Modelo generalista multimodal | Apache 2.0 | Hugging Face (Qwen) |
| SFT previo (SFT-Mixture8-genv2gp3-step365) | ~4 B | no disponible | SFT de seguridad antes de GRPO | Apache 2.0 | Hugging Face (thkim0305-SNU) |
| Qwen3.8-27B (juez del entrenamiento) | ~27 B | no disponible | Juez de recompensas | no disponible | no disponible |

No se dispone de datos de benchmarks comunes que permitan una comparacion cuantitativa con alternativas de la misma categoria; la comparacion se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Es un checkpoint intermedio (400 de 787 actualizaciones): el autor indica explicitamente que el entrenamiento sigue en curso y que no es un modelo final.
- No se han publicado evaluaciones externas ni benchmarks estandar; las unicas metricas son las del juez usado en entrenamiento, lo que introduce sesgo de circularidad (el modelo se evalua con el mismo criterio con el que se optimizo).
- Riesgo de alucinacion no cuantificado; no hay datos sobre fidelidad factual.
- Idiomas soportados no documentados; el comportamiento fuera del ingles es desconocido.
- El modo thinking y el tool calling dependen de la plantilla de chat Qwen y del formato `qwen3_coder`; un uso incorrecto de la plantilla degrada el comportamiento.
- La torre de vision no fue entrenada; las capacidades multimodales son las del base y no estan validadas en este checkpoint.
- Licencia Apache 2.0 permite uso comercial, pero al ser un snapshot de investigacion no se recomienda su despliegue en produccion sin evaluacion propia.
- El modelo esta optimizado contra un juez concreto (Qwen3.8-27B) y una especificacion de proyecto; puede sobreajustar al estilo de ese juez y no generalizar a otras politicas de seguridad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso comunitario ni de validacion independiente.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT365-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step400
- Modelo base del SFT: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr1e-5-step365
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
