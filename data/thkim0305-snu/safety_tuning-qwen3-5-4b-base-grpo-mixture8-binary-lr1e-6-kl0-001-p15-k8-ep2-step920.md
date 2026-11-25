# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-ep2-step920

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-ep2-step920 es un checkpoint intermedio de ajuste fino por aprendizaje por refuerzo (GRPO) sobre el modelo base Qwen/Qwen3.5-4B-Base, desarrollado por el usuario thkim0305-SNU. El objetivo es el alineamiento de seguridad: el modelo se entrena para responder de forma segura ante peticiones dañinas, incluyendo escenarios de uso de herramientas (tool calling) y trayectorias agénticas de multiples turnos. El checkpoint corresponde a la actualizacion de optimizador 920 de un entrenamiento aun en curso, por lo que no debe considerarse un modelo final.

El modelo conserva la arquitectura multimodal del base Qwen3.5-4B (torre de vision y cabeza MTP intactas, solo se entrena el modelo de lenguaje), con 4.659.865.088 parametros en bf16 y pesos en formato safetensors. Se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su integracion en pipelines existentes de transformers. Su relevancia radica en que documenta una receta completa de RL de seguridad con recompensas binarias y juez externo, incluyendo datos de seguridad de codigo y de agentes, un area con pocos checkpoints publicos de este tipo.

La ficha describe exclusivamente lo reflejado en la model card y en los metadatos de Hugging Face; los datos no publicados se marcan explicitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5, clase `Qwen3_5ForConditionalGeneration`); torre de vision y cabeza MTP del modelo base sin entrenar |
| Parametros totales | 4.659.865.088 (bf16) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | 40.960 tokens durante el entrenamiento (contexto de rollout) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, index de Hugging Face) |
| Modelo base | Qwen/Qwen3.5-4B-Base (snapshot `1001bb4d826a`) |
| Framework de entrenamiento | Slime (rollouts SGLang colocados) + Megatron-LM |
| Algoritmo | GRPO con recompensas binarias normalizadas por grupo, PPO clip 0.2, TIS activado |
| Tamano del repositorio | 9,3 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base, un transformer multimodal con torre de vision y cabeza de prediccion multi-token (MTP). En este checkpoint solo se ha entrenado el modelo de lenguaje: la torre de vision y la cabeza MTP conservan los pesos base, de modo que el checkpoint se carga exactamente igual que el modelo original mediante `Qwen3_5ForConditionalGeneration`. El entrenamiento se realizo en bf16 con Slime para los rollouts (SGLang colocado) y Megatron-LM para la actualizacion de pesos, con proyecciones GDN re-fusionadas durante la exportacion.

La receta de RL emplea GRPO con recompensas binarias (0/1) emitidas por un juez Qwen3.8-27B que aplica la especificacion del proyecto; las trayectorias de herramientas se evaluan sobre toda la trayectoria visible. Cada actualizacion usa 15 prompts x 8 rollouts (120 secuencias), tasa de aprendizaje constante de 1e-06 con AdamW (betas 0.9/0.95, weight decay 0.1, grad clip 1.0) y una perdida KL de baja varianza con coeficiente 0.001 frente al modelo congelado de partida. El muestreo usa temperatura 1.0, top-p 1 y hasta 32.768 tokens generados. El conjunto mixture-8 suma 11.794 prompts unicos (star1_gp3 1.000, star_benign_v2 915, agentalign_harmful 2.000, agentalign_benign 2.000, codesafetybench 900, magicoder 1.000, difficult_advice 1.982, wildjailbreak_benign 1.997); 4.000 prompts de AgentAlign incluyen definiciones sinteticas de herramientas y se despliegan como trayectorias multiturno contra un simulador, con las salidas de herramienta enmascaradas en la perdida. El checkpoint corresponde a la actualizacion 920 de un total de 1.574 previstas en una epoca, reanudado en la actualizacion 787 con nueva permutacion de prompts (semilla 43).

## Capacidades

- Generacion de texto conversacional con plantilla de chat de Qwen y modo de razonamiento explicito (`enable_thinking=true`).
- Razonamiento de seguridad: rechazo o redireccion de peticiones dañinas segun la especificacion del proyecto, entrenado con recompensas binarias.
- Uso de herramientas (tool calling) con el formato `qwen3_coder`, incluido en los rollouts de entrenamiento.
- Razonamiento agéntico multiturno: trayectorias con definiciones sinteticas de herramientas y simulador de salidas.
- Seguridad en generacion de codigo, entrenada con codesafetybench y magicoder.
- Capacidad multimodal heredada del modelo base (torre de vision intacta), aunque no fue objeto de entrenamiento en este checkpoint.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Moderacion y filtrado de respuestas en asistentes conversacionales: el modelo puede clasificar o reformular peticiones dañinas en produccion, apoyandose en su ajuste con recompensas binarias y en la ventana de 40.960 tokens para conversaciones largas.
- Agentes con acceso a herramientas en entornos sensibles: al haberse entrenado con trayectorias multiturno y formato `qwen3_coder`, es adecuado para prototipar agentes que deben decidir cuando invocar una herramienta y cuando negarse por motivos de seguridad.
- Revision de seguridad de codigo generado: integrado en un pipeline de CI/CD, puede evaluar sugerencias de codigo frente a patrones peligrosos, dado el entrenamiento con codesafetybench.
- Asistencia en atencion al cliente con contenido delicado: gestiona conversaciones multiturno y mantiene el rechazo ante solicitudes de asesoramiento dañino (difficult_advice), con contexto suficiente para hilos largos.
- Investigacion en alineamiento: sirve como checkpoint de referencia para estudiar el efecto del GRPO con recompensas binarias y juez externo sobre el comportamiento de seguridad, comparandolo con el modelo base.
- Evaluacion de robustez frente a jailbreaks: util para medir la resistencia del modelo ante prompts de wildjailbreak_benign y variantes adversariales en laboratorios de seguridad.
- Generacion asistida con matiz de seguridad en dominios regulados: por ejemplo, borradores de respuestas en entornos financieros o sanitarios donde se requiere rechazo explicito de peticiones fuera de politica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card unicamente reporta la recompensa media binaria del juez durante el entrenamiento (valores crudos antes de la normalizacion por grupo):

| Ventana de actualizaciones | Recompensa media | Rollouts evaluados |
|---|---|---|
| 790-800 | 0,808 | 1200 |
| 830-840 | 0,815 | 1200 |
| 870-880 | 0,855 | 1200 |
| 910-920 | 0,877 | 1200 |

Desglose por dataset (recompensa media binaria):

| Dataset | 790-800 | 830-840 | 870-880 | 910-920 |
|---|---|---|---|---|
| agentalign_benign | 0,61 | 0,62 | 0,73 | 0,69 |
| agentalign_harmful | 0,90 | 0,95 | 0,96 | 0,93 |
| codesafetybench | 0,85 | 0,93 | 0,93 | 0,83 |
| difficult_advice | 0,81 | 0,88 | 0,86 | 0,88 |
| magicoder | 0,76 | 0,26 | 0,77 | 0,87 |
| star1_gp3 | 0,97 | 0,96 | 0,96 | 0,99 |
| star_benign_v2 | 0,84 | 0,83 | 0,86 | 0,94 |
| wildjailbreak_benign | 0,86 | 0,86 | 0,81 | 0,88 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda un minimo de 16-24 GB para secuencias moderadas.
- Cuantizacion a 8 bits: en torno a 5 GB de pesos; a 4 bits: en torno a 2,5-3 GB, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: el entrenamiento se realizo con 1x NVIDIA B200 (entrenador y motor de rollout) y 2x A100 para el juez; para inferencia son adecuadas A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) en bf16 con secuencias cortas.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) o RTX 3090 (24 GB) en bf16 con contexto moderado; en GPUs de 16 GB requeriria cuantizacion.
- Opciones de despliegue: transformers (soporte nativo de `Qwen3_5ForConditionalGeneration`), vLLM y SGLang (usados en el entrenamiento), TGI; llama.cpp/Ollama solo si se generan pesos GGUF, no disponibles en el repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8 (este) | 4,66 B | 40.960 (entrenamiento) | RL de seguridad sobre Qwen3.5-4B con GRPO y juez binario | Apache 2.0 | Hugging Face, checkpoint intermedio |
| Qwen/Qwen3.5-4B-Base | 4 B (clase) | no disponible en la informacion | Modelo base multimodal sin ajuste de seguridad | Apache 2.0 | Hugging Face |
| Alternativas de ajuste de seguridad de ~4B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada; la comparacion se limita a parametros, licencia y naturaleza del ajuste.

## Limitaciones y advertencias

- Es un checkpoint intermedio (actualizacion 920 de 1.574 previstas): el entrenamiento sigue en curso y el comportamiento de seguridad puede no ser estable ni definitivo.
- Riesgo de alucinacion inherente al modelo base; el ajuste de seguridad no elimina errores factuales.
- La recompensa se basa en un juez automatico (Qwen3.8-27B) con especificacion propia del proyecto; puede heredar sesgos del juez y no equivale a una evaluacion humana.
- El rendimiento por dataset muestra fluctuaciones notables (por ejemplo, magicoder cae a 0,26 en la ventana 830-840 y codesafetybench baja de 0,93 a 0,83 en la ultima ventana), lo que indica inestabilidad del entrenamiento.
- Idiomas soportados no documentados; no se garantiza un comportamiento de seguridad equivalente fuera del ingles.
- La torre de vision y la cabeza MTP no se entrenaron: las capacidades multimodales no han sido objeto de ajuste de seguridad.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo en produccion; se recomienda evaluacion adicional antes de desplegarlo.
- El nombre del repositorio incluye hiperparametros y pasos concretos; cambios en la configuracion de muestreo pueden alterar el comportamiento de rechazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-ep2-step920
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Slime (framework de RL): no disponible en la informacion proporcionada
- Megatron-LM: no disponible en la informacion proporcionada
- SGLang: no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
