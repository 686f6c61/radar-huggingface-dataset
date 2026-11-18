# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step240

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step240 es un checkpoint intermedio de ajuste fino por refuerzo (GRPO) sobre el modelo base Qwen/Qwen3.5-4B-Base, publicado por el usuario thkim0305-SNU. El objetivo del entrenamiento es el alineamiento de seguridad: se optimiza al modelo para que responda de forma segura ante prompts dañinos (jailbreaks, código inseguro, consejos peligrosos) sin degradar su utilidad en tareas benignas, incluyendo trayectorias de uso de herramientas.

Se trata de un snapshot, no de un modelo final: corresponde a 240 actualizaciones del optimizador (iteración Megatron 239) sobre un total previsto de 787 actualizaciones en una época sobre 11.794 prompts únicos. El autor indica explícitamente que el entrenamiento sigue en curso. El checkpoint conserva la arquitectura multimodal del base (torre de visión y cabeza MTP intactas), aunque solo se ha entrenado la parte del modelo de lenguaje.

Su relevancia es doble: por un lado, documenta una receta reproducible de RL de seguridad con recompensas binarias y juez externo; por otro, demuestra la viabilidad de entrenar con GRPO sobre un modelo de 4B en un entorno de dos GPU B200 usando Slime (SGLang para rollouts) y Megatron-LM. Los pesos se distribuyen en bf16 y la licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (Qwen3_5ForConditionalGeneration), con torre de vision y cabeza MTP |
| Parametros totales | 4.659.865.088 (aprox. 4,66 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40.960 tokens (contexto de entrenamiento); la del modelo base no se detalla en la informacion disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se listan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, formato Hugging Face transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base, un transformer multimodal con torre de visión y cabeza de predicción multi-token (MTP). En este checkpoint solo se ha entrenado el modelo de lenguaje: la torre de visión y la cabeza MTP conservan los pesos originales del base, de modo que el checkpoint se carga exactamente igual que el modelo de referencia mediante `Qwen3_5ForConditionalGeneration`.

El entrenamiento emplea GRPO con recompensas binarias normalizadas por grupo, clip PPO de 0,2 y truncamiento de importancia (TIS) activado. La infraestructura combina Slime (rollouts con SGLang en modo colocativo) y Megatron-LM en bf16. Cada actualización usa 15 prompts con 8 rollouts cada uno (120 secuencias), learning rate constante de 1e-6, AdamW con betas [0,9; 0,95], weight decay de 0,1 y grad clip de 1,0. Se aplica una pérdida KL de baja varianza contra el modelo de partida con coeficiente 0,001. El muestreo usa temperatura 1,0, top-p 1, hasta 32.768 tokens generados y 40.960 de contexto, con plantilla de chat Qwen y `enable_thinking=true`. Las recompensas las asigna un juez Qwen3.8-27B con veredicto binario estricto (0/1); los prompts de AgentAlign se evalúan sobre toda la trayectoria visible de uso de herramientas.

El conjunto de datos "mixture-8" suma 11.794 prompts únicos: star1_gp3 (1.000), star_benign_v2 (915), agentalign_harmful (2.000), agentalign_benign (2.000), codesafetybench (900), magicoder (1.000), difficult_advice (1.982) y wildjailbreak_benign (1.997). Los 4.000 prompts de AgentAlign incorporan definiciones sintéticas de herramientas y se despliegan como trayectorias multiturno contra un simulador, con las salidas de herramienta enmascaradas en la pérdida. La ejecución se realizó en dos GPU B200 (juez en la GPU 0, entrenador y motor de rollouts en la GPU 1) y el checkpoint se exportó el 18 de noviembre de 2026 desde el estado `iter_0000239` de Megatron.

## Capacidades

- Generación de texto conversacional con plantilla de chat Qwen y modo de razonamiento explícito (`enable_thinking=true`).
- Razonamiento de seguridad: rechazo o reformulación de peticiones dañinas, con especial énfasis en jailbreaks y consejos peligrosos.
- Generación de código con criterios de seguridad (entrenado sobre CodeSafetyBench y Magicoder).
- Uso de herramientas y function calling con el formato `qwen3_coder`, incluyendo trayectorias multiturno contra un simulador.
- Comportamiento agéntico: razonamiento multi-paso y ejecución de acciones encadenadas evaluadas sobre la trayectoria completa.
- Procesamiento de imagen y texto (image-text-to-text), heredado de la arquitectura del base, aunque la torre de visión no se ha entrenado en este ajuste.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Moderación y filtrado de conversaciones: el modelo puede clasificar o reescribir respuestas potencialmente dañinas en un pipeline de atención al cliente, aprovechando su entrenamiento específico contra jailbreaks y prompts adversarios.
- Asistentes de código con salvaguardas: integrado en un IDE o en CI/CD, puede generar código y señalar patrones inseguros, dado su ajuste sobre CodeSafetyBench y Magicoder.
- Agentes con herramientas en entornos controlados: su entrenamiento con trayectorias multiturno y formato `qwen3_coder` lo hace adecuado para prototipos de agentes que invocan APIs y requieren evaluar la seguridad de toda la secuencia de acciones.
- Investigación en alineamiento: sirve como checkpoint de referencia para estudiar la evolución de la recompensa del juez a lo largo del entrenamiento (de 0,417 a 0,768 en media binaria) y comparar con el modelo final.
- Filtrado de datos sintéticos: puede usarse como generador o evaluador auxiliar para descartar ejemplos peligrosos en la construcción de datasets de instrucciones.
- Evaluación de robustez ante ataques: banco de pruebas para medir la resistencia a wildjailbreak y a prompts de consejo difícil antes y después del ajuste.
- Despliegue en hardware modesto: con 4,66 B de parámetros y pesos bf16 (9,3 GB de repositorio), es viable en una GPU de consumo alta para experimentación y pruebas de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí reporta la evolución de la recompensa media binaria del juez durante el entrenamiento:

| Ventana de actualizaciones | Recompensa media | Rollouts evaluados |
|---|---|---|
| 0-10 | 0,417 | 1.200 |
| 70-80 | 0,578 | 1.200 |
| 150-160 | 0,708 | 1.200 |
| 230-240 | 0,768 | 1.200 |

Desglose por conjunto de datos:

| Dataset | 0-10 | 70-80 | 150-160 | 230-240 |
|---|---|---|---|---|
| agentalign_benign | 0,41 | 0,48 | 0,60 | 0,54 |
| agentalign_harmful | 0,63 | 0,88 | 0,94 | 0,85 |
| codesafetybench | 0,47 | 0,78 | 0,80 | 0,83 |
| difficult_advice | 0,28 | 0,30 | 0,69 | 0,78 |
| magicoder | 0,51 | 0,34 | 0,38 | 0,58 |
| star1_gp3 | 0,57 | 0,78 | 0,82 | 0,93 |
| star_benign_v2 | 0,27 | 0,54 | 0,83 | 0,83 |
| wildjailbreak_benign | 0,27 | 0,45 | 0,61 | 0,79 |

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 9,3 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 12 y 16 GB para inferencia con contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 5 GB de pesos; en 4 bits, alrededor de 2,5 GB (no se publican pesos cuantizados oficiales).
- GPU recomendadas: B200 (usadas en el entrenamiento), H100, A100 40/80 GB para producción; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para bf16 en contexto corto.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en bf16; en tarjetas de 8-12 GB requeriría cuantización, no publicada por el autor.
- Despliegue: transformers (receta oficial de la model card); vLLM, TGI, llama.cpp u Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Qwen3.5-4B-Base + GRPO seguridad) | 4,66 B | 40.960 (entrenamiento) | Seguridad y agentes | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B-Base | 4,66 B | no disponible | Modelo base generalista | Apache 2.0 | Hugging Face |
| Alternativas de ajuste de seguridad de 4B | no disponible | no disponible | Seguridad | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos frente a otras variantes de seguridad del mismo tamaño en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio: el entrenamiento sigue en curso y el autor lo califica explícitamente como snapshot, no como modelo final. No debe tratarse como versión estable para producción.
- La recompensa de agentalign_benign cae de 0,60 a 0,54 entre las ventanas 150-160 y 230-240, y agentalign_harmful baja de 0,94 a 0,85; hay señales de sobreajuste o desequilibrio en la fase final del tramo observado.
- El rendimiento en magicoder es errático (0,34 en la ventana 70-80 frente a 0,58 al final), lo que sugiere que la utilidad de código puede degradarse durante el ajuste.
- Riesgo de alucinación inherente a un modelo de 4B; no se han publicado evaluaciones de veracidad.
- Sesgos: no se documentan análisis de sesgo; el juez Qwen3.8-27B introduce su propio sesgo en la señal de recompensa.
- Idiomas soportados no documentados; el comportamiento multilingüe puede diferir del base.
- La torre de visión y la cabeza MTP no se han entrenado; las capacidades de imagen son las del base y pueden no estar alineadas con el nuevo comportamiento de seguridad.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y sus condiciones deben verificarse en el repositorio de Qwen.
- El uso de un juez externo para recompensas binarias puede producir comportamientos de "gaming" del juez no detectados en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step240
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Slime (framework de RL): no disponible en la información proporcionada
- Megatron-LM: no disponible en la información proporcionada
- SGLang: no disponible en la información proporcionada
