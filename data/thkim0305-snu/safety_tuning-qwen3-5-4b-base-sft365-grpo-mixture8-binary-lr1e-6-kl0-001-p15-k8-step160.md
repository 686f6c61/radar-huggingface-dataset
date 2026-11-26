# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT365-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step160

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-SFT365-GRPO-Mixture8-binary es un checkpoint intermedio de un proceso de ajuste fino orientado a seguridad sobre Qwen3.5-4B-Base. Lo desarrolla el usuario thkim0305-SNU y se distribuye bajo licencia Apache 2.0. El modelo parte de un SFT previo (SFT365) y aplica un entrenamiento de refuerzo con GRPO usando recompensas binarias emitidas por un juez (Qwen3.8-27B) sobre un conjunto de prompts denominado "mixture-8", que combina datos de seguridad, uso de herramientas y generacion de codigo.

Arquitectonicamente es un transformer multimodal de tipo `Qwen3_5ForConditionalGeneration` con 4.659.865.088 parametros totales (unos 4,66 mil millones), pesos en bf16 y una torre de vision heredada intacta del modelo base. La ventana de contexto usada durante el entrenamiento es de 40.960 tokens y la generacion se realizo con hasta 32.768 tokens nuevos, con plantilla de chat de Qwen y `enable_thinking=true`.

Es relevante porque documenta de forma transparente una receta de RL de seguridad con seguimiento por dataset a lo largo del entrenamiento, e incluye soporte de trayectorias multi-turno con herramientas (AgentAlign). No obstante, se trata de una instantanea intermedia (160 actualizaciones de optimizador de un total previsto de 787), no de un modelo final, y no se han publicado evaluaciones de benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `Qwen3_5ForConditionalGeneration` (torre de vision + modelo de lenguaje; cabeza MTP) |
| Parametros totales | 4.659.865.088 (aprox. 4,66 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40.960 tokens en entrenamiento (contexto del modelo base no disponible) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, formato Hugging Face `Qwen3_5ForConditionalGeneration`) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal de la familia Qwen3.5. Solo se entreno el modelo de lenguaje: la torre de vision y la cabeza MTP conservan los pesos originales del modelo base, por lo que el checkpoint se carga exactamente igual que `Qwen/Qwen3.5-4B-Base` (snapshot `ccd726d2543d`). El punto de partida es el SFT `Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr1e-5-step365`, y sobre el se aplica RL con GRPO (recompensas binarias normalizadas por grupo, PPO clip 0.2, TIS activado), usando Slime con rollouts SGLang colocados y Megatron-LM en bf16. La configuracion: 15 prompts por actualizacion x 8 rollouts por prompt (120 secuencias), learning rate constante de 1e-6, AdamW con betas [0.9, 0.95], weight decay 0.1, grad clip 1.0, y perdida KL de baja varianza con coeficiente 0.001 frente al modelo congelado de partida. El muestreo usa temperatura 1.0, top-p 1, hasta 32.768 tokens generados y 40.960 de contexto, con plantilla de chat de Qwen y `enable_thinking=true`; los rollouts con herramientas usan function calling `qwen3_coder`.

El conjunto de datos "mixture-8" suma 11.794 prompts unicos: star1_gp3 (1000), star_benign_v2 (915), agentalign_harmful (2000), agentalign_benign (2000), codesafetybench (900), magicoder (1000), difficult_advice (1982) y wildjailbreak_benign (1997). Los 4000 prompts de AgentAlign incorporan definiciones sinteticas de herramientas y se despliegan como trayectorias multi-turno contra un simulador, con las salidas de herramienta enmascaradas en la perdida. La recompensa la emite un juez Qwen3.8-27B con veredicto binario estricto (0/1) segun la especificacion del proyecto; en AgentAlign se juzga toda la trayectoria visible de herramientas. El calendario previsto es una epoca con padding sobre los 11.794 prompts, equivalente a 787 actualizaciones, con checkpoints cada 40; este checkpoint corresponde a la actualizacion 160 (iteracion Megatron 159). El run se ejecuto en 4x H100 80GB (juez con TP2, entrenador en una GPU con estado del optimizador en CPU, motor de rollout en otra GPU).

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat de Qwen.
- Modo de razonamiento explicito (`enable_thinking=true`) integrado en la plantilla de chat.
- Capacidades multimodales de entrada imagen-texto heredadas del modelo base (`image-text-to-text`), aunque la torre de vision no se entreno en este proceso.
- Tool calling / function calling con el formato `qwen3_coder`, entrenado explicitamente sobre trayectorias multi-turno con herramientas en los prompts de AgentAlign.
- Razonamiento multi-paso y uso de agentes con trayectorias de herramientas simuladas durante el RL.
- Generacion de codigo, con datos de Magicoder y CodeSafetyBench en el mixture.
- Comportamiento orientado a seguridad: rechazo de peticiones daninas y manejo de jailbreaks benignos (wildjailbreak_benign, star_benign_v2).
- Capacidades multilingues: no disponible (no se especifican idiomas).

## Casos de uso

- Moderacion y rechazo de peticiones peligrosas: el modelo fue optimizado con recompensa binaria sobre agentalign_harmful y star1_gp3, alcanzando puntuaciones de juez de 0,97 en ambos al final de la ventana documentada, por lo que es adecuado como filtro o generador de respuestas seguras en asistentes conversacionales.
- Agentes con uso de herramientas en produccion: soporta function calling en formato `qwen3_coder` y fue entrenado con trayectorias multi-turno contra un simulador, lo que permite integrarlo en orquestadores de agentes que encadenan llamadas a APIs.
- Generacion de codigo asistida con sesgo de seguridad: los datos de Magicoder y CodeSafetyBench permiten usar el modelo para sugerir codigo en IDE o pipelines de CI/CD con menor probabilidad de producir fragmentos inseguros, aunque la puntuacion de juez en Magicoder es la mas baja del mixture (0,55).
- Asistencia en orientacion sensible (difficult_advice): con 1982 prompts de consejo dificil y una puntuacion de juez de 0,95, encaja en chatbots de salud, legal o financiero de baja responsabilidad que requieren respuestas prudentes.
- Evaluacion de robustez frente a jailbreaks: util como modelo de referencia en pruebas de red teaming, ya que su entrenamiento incluye wildjailbreak_benign y star_benign_v2.
- Investigacion en RLHF/RLVR: al ser un checkpoint intermedio con receta y metricas por dataset documentadas, sirve para reproducir o comparar dinamicas de entrenamiento GRPO con recompensas binarias.
- Prototipado multimodal de bajo coste: al conservar la torre de vision del base y pesar unos 9,3 GB en bf16, puede desplegarse en una sola GPU para tareas imagen-texto basicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente reporta la puntuacion media del juez binario durante el entrenamiento (recompensa cruda antes de normalizacion por grupo):

| Ventana de actualizaciones | Puntuacion media | Rollouts juzgados |
|---|---|---|
| 0-10 | 0,735 | 1200 |
| 30-40 | 0,718 | 1200 |
| 70-80 | 0,813 | 1200 |
| 110-120 | 0,817 | 1200 |
| 150-160 | 0,857 | 1200 |

Desglose por dataset:

| Dataset | 0-10 | 30-40 | 70-80 | 110-120 | 150-160 |
|---|---|---|---|---|---|
| agentalign_benign | 0,48 | 0,49 | 0,63 | 0,69 | 0,70 |
| agentalign_harmful | 0,96 | 0,94 | 0,97 | 0,93 | 0,97 |
| codesafetybench | 0,65 | 0,89 | 0,94 | 0,86 | 0,96 |
| difficult_advice | 0,88 | 0,90 | 0,88 | 0,94 | 0,95 |
| magicoder | 0,38 | 0,26 | 0,19 | 0,47 | 0,55 |
| star1_gp3 | 0,77 | 0,94 | 0,97 | 0,98 | 0,97 |
| star_benign_v2 | 0,72 | 0,64 | 0,72 | 0,82 | 0,94 |
| wildjailbreak_benign | 0,68 | 0,63 | 0,79 | 0,78 | 0,81 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 12 y 16 GB para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: no disponible oficialmente, pero por tamano de parametros rondaria los 5-6 GB; no se publican pesos cuantizados.
- GPU recomendadas: H100 80GB o A100 80GB para entrenamiento o inferencia con contexto completo de 40.960 tokens; RTX 4090 (24 GB) suficiente para inferencia en bf16 con contexto reducido.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 (24 GB) y potencialmente en GPUs de 16 GB con contexto corto o cuantizacion.
- Opciones de despliegue: transformers (receta oficial de la model card), y por compatibilidad de arquitectura con Qwen3.5, cabria esperar soporte en vLLM, SGLang y TGI; no se documenta soporte explicito de llama.cpp u Ollama ni pesos GGUF.
- Latencia y throughput: no disponibles. El run de entrenamiento uso SGLang para rollouts y 4x H100 80GB, pero no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-SFT365-GRPO-Mixture8-binary (este) | 4,66 B | 40.960 tokens (entrenamiento) | RL de seguridad sobre Qwen3.5-4B-Base | Apache 2.0 | Hugging Face, checkpoint intermedio |
| Qwen/Qwen3.5-4B-Base | no disponible | no disponible | Modelo base multimodal | Apache 2.0 | Hugging Face |
| SFT365 (modelo base de este checkpoint) | 4,66 B | no disponible | SFT sobre Qwen3.5-4B-Base | Apache 2.0 | Hugging Face |
| Alternativas de seguridad de 4B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos de seguridad del mismo tamano en la informacion proporcionada.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde a 160 de las 787 actualizaciones previstas; el autor indica explicitamente que el entrenamiento sigue en curso y que no es un modelo final.
- Sin benchmarks estandar publicados: las unicas metricas son recompensas de un juez binario propio (Qwen3.8-27B), no comparables directamente con MMLU, HumanEval u otros.
- Riesgo de alucinacion: no evaluado; el ajuste por RL con recompensa binaria de seguridad no garantiza fidelidad factual.
- Sesgos conocidos: no documentados. El dataset incluye fuentes de seguridad y codigo, pero no se reporta analisis de sesgos.
- Idiomas: no se especifican; el comportamiento multilingue no esta garantizado mas alla del modelo base.
- Rendimiento desigual por dominio: la puntuacion de juez en Magicoder (0,55) y agentalign_benign (0,70) es notablemente inferior a la de otros conjuntos, lo que sugiere margen de mejora en generacion de codigo y en trayectorias benignas de agentes.
- La torre de vision y la cabeza MTP no se entrenaron: las capacidades multimodales son las del base, sin ajuste de seguridad especifico para imagenes.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3.5-4B-Base conviene revisar la licencia del modelo original enlazada en la model card.
- Reproducibilidad: depende de un juez propietario del proyecto y de un simulador de herramientas no publicados; replicar exactamente las recompensas puede no ser posible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT365-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step160
- Modelo base del SFT: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr1e-5-step365
- Modelo original Qwen3.5-4B-Base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Framework Slime: no disponible en la informacion proporcionada
- Megatron-LM: no disponible en la informacion proporcionada
- Paper o blog del proyecto: no disponible en la informacion proporcionada
