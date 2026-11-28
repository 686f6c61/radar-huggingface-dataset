# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT365-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step440

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-SFT365-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step440 es un checkpoint intermedio de ajuste fino orientado a seguridad sobre Qwen3.5-4B-Base, desarrollado por el grupo thkim0305-SNU. El modelo parte de un SFT previo (Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr1e-5-step365) y aplica aprendizaje por refuerzo con GRPO sobre un conjunto de prompts denominado "mixture-8", compuesto por datos de seguridad, código, uso de herramientas y prompts benignos adversariales.

Se trata de un modelo multimodal de tipo image-text-to-text con arquitectura Qwen3.5 (Qwen3_5ForConditionalGeneration), 4.659.865.088 parámetros totales en bf16 y pesos distribuidos en un repositorio de 9,3 GB. Solo se ha entrenado la torre del lenguaje: la torre de visión y la cabeza MTP conservan los pesos originales del modelo base, por lo que el checkpoint se carga exactamente igual que Qwen3.5-4B-Base.

El interés del modelo es metodológico: documenta con detalle un pipeline de RL para seguridad (Slime + Megatron-LM, recompensa binaria de un juez Qwen3.8-27B, KL bajo contra el checkpoint de partida) y publica la evolución de la puntuación del juez a lo largo de 440 actualizaciones. No es un modelo final ni un artefacto listo para producción: es el paso 440 de una programación de 787 actualizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (`Qwen3_5ForConditionalGeneration`), transformer multimodal con torre de visión y cabeza MTP; solo se entrena la torre del lenguaje |
| Parametros totales | 4.659.865.088 (bf16) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40.960 tokens durante el entrenamiento; hasta 32.768 tokens generados por rollout |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Hugging Face `transformers`; exportado desde Megatron torch_dist) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3.5 del modelo base, con proyecciones GDN re-fusionadas durante la exportación desde Megatron y mapeo de nombres Slime para Qwen3.5. La torre de visión y la cabeza MTP se copian intactas del base, de modo que la modalidad de imagen funciona con los pesos originales mientras que el ajuste de seguridad se concentra en el decodificador de texto.

El entrenamiento usa GRPO con recompensas binarias normalizadas por grupo, clip PPO de 0,2 y TIS activado, sobre el framework Slime (rollouts con SGLang en modo colocados) junto con Megatron-LM en bf16. Cada actualización emplea 15 prompts con 8 rollouts por prompt (120 secuencias), learning rate constante de 1e-6, AdamW con betas [0,9; 0,95], weight decay 0,1, grad clip 1,0 y una pérdida KL de baja varianza con coeficiente 0,001 respecto al checkpoint de partida. El muestreo usa temperatura 1,0, top-p 1 y plantilla de chat Qwen con `enable_thinking=true`; los rollouts de herramientas usan function calling `qwen3_coder`. La recompensa la emite un juez Qwen3.8-27B con veredicto binario estricto (0/1); los prompts de AgentAlign se juzgan sobre toda la trayectoria visible de herramientas.

El conjunto "mixture-8" suma 11.794 prompts únicos: star1_gp3 (1.000), star_benign_v2 (915), agentalign_harmful (2.000), agentalign_benign (2.000), codesafetybench (900), magicoder (1.000), difficult_advice (1.982) y wildjailbreak_benign (1.997). Los 4.000 prompts de AgentAlign llevan definiciones sintéticas de herramientas y se despliegan como trayectorias multi-turno contra un simulador, con las salidas de herramienta enmascaradas en la pérdida. La programación prevé una época rellenada de 787 actualizaciones con checkpoints cada 40; este es el paso 440.

## Capacidades

- Generación de texto conversacional con plantilla de chat Qwen y modo de razonamiento explícito (`enable_thinking=true`).
- Entrada image-text-to-text: la torre de visión se mantiene operativa con los pesos del base, aunque no se ha entrenado en este proceso.
- Razonamiento multi-paso dentro del bloque de pensamiento antes de la respuesta final.
- Uso de herramientas y function calling mediante el formato `qwen3_coder`, con trayectorias multi-turno contra un simulador de herramientas.
- Comportamiento orientado a seguridad: rechazo de peticiones dañinas, manejo de jailbreaks benignos y de prompts de consejo delicado, entrenado con recompensa binaria de un juez.
- Generación de código con foco en seguridad de código (codesafetybench, magicoder).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Evaluación de pipelines de RL para seguridad: el checkpoint sirve como referencia intermedia para estudiar la curva de recompensa del juez (de 0,735 en las actualizaciones 0-10 a 0,844 en las 430-440) y comparar con el SFT de partida.
- Filtrado y moderación de código generado: entrenado con codesafetybench y magicoder, puede usarse para detectar y reescribir fragmentos de código con patrones inseguros en asistentes de programación.
- Agentes con herramientas en entornos simulados: los 4.000 prompts de AgentAlign permiten probar políticas de uso de herramientas que mantienen el rechazo en trayectorias dañinas (0,95-0,98 de recompensa en agentalign_harmful) sin degradar en exceso las benignas.
- Asistente de consejo delicado: el conjunto difficult_advice (1.982 prompts) entrena respuestas prudentes en consultas sensibles, útil para prototipos de orientación con salvaguardas.
- Investigación sobre jailbreaks: wildjailbreak_benign (1.997 prompts) permite medir la robustez frente a reformulaciones adversariales benignas y ajustar la política de rechazo.
- Base para experimentos de alineación con juez automático: el uso de un juez Qwen3.8-27B con veredicto binario es replicable para comparar variantes de recompensa, KL y tamaño de grupo.
- Punto de partida para un ajuste posterior: al ser un snapshot intermedio con licencia Apache 2.0, se puede continuar el entrenamiento o aplicar SFT/DPO adicional sobre él.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card solo documenta la recompensa media del juez durante el entrenamiento (media binaria bruta antes de normalización por grupo):

| Ventana de actualizaciones | Recompensa media | Rollouts juzgados |
|---|---|---|
| 0-10 | 0,735 | 1200 |
| 30-40 | 0,718 | 1200 |
| 70-80 | 0,813 | 1200 |
| 110-120 | 0,817 | 1200 |
| 150-160 | 0,857 | 1200 |
| 190-200 | 0,868 | 1200 |
| 230-240 | 0,857 | 1200 |
| 270-280 | 0,880 | 1200 |
| 310-320 | 0,911 | 1200 |
| 350-360 | 0,866 | 1200 |
| 390-400 | 0,904 | 1200 |
| 430-440 | 0,844 | 1200 |

Desglose por conjunto de datos en la ventana 430-440: agentalign_benign 0,66; agentalign_harmful 0,95; codesafetybench 0,93; difficult_advice 0,96; magicoder 0,49; star1_gp3 0,93; star_benign_v2 0,92; wildjailbreak_benign 0,89. Destaca la caída de magicoder respecto a la ventana 310-320 (0,80 a 0,49) y la variabilidad de agentalign_benign (pico de 0,82 en 310-320, 0,66 en 430-440).

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos, más caché KV y activaciones; en la práctica, 12-16 GB para contexto moderado y bastante más para ventanas cercanas a 40.960 tokens.
- GPU recomendadas: el entrenamiento se ejecutó en 4x H100 80 GB (juez con TP2 en GPUs 4-5, entrenador en GPU 6 con estado del optimizador en CPU, motor de rollout en GPU 7). Para inferencia basta una sola GPU de 24 GB o superior.
- Cabe en GPU de consumo: sí, en tarjetas con 16-24 GB (RTX 4090, RTX 4080, RTX 3090) usando bf16 o cuantización de 8 bits; en 12 GB conviene cuantizar a 8 o 4 bits, aunque no se publican pesos GGUF.
- Opciones de despliegue: `transformers` con `Qwen3_5ForConditionalGeneration` (código de ejemplo en la model card), `device_map="auto"`; para servicio de alto rendimiento, vLLM o SGLang (el propio entrenamiento usa SGLang para rollouts). No se documentan integraciones con llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-SFT365-GRPO-...-step440 | 4.659.865.088 | 40.960 (entrenamiento) | Apache 2.0 | Checkpoint intermedio de RL de seguridad |
| Qwen3.5-4B-Base (modelo de partida) | no disponible en la información | no disponible en la información | Apache 2.0 | Modelo base multimodal |
| Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr1e-5-step365 | no disponible en la información | no disponible en la información | no disponible | SFT previo del que parte este checkpoint |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 440 de 787 actualizaciones): el autor indica explícitamente que el entrenamiento sigue en curso y que no es un modelo final.
- La recompensa media del juez baja de 0,911 (310-320) a 0,844 (430-440), y magicoder cae de 0,80 a 0,49, lo que sugiere inestabilidad y posible olvido o sobreajuste en algunas tareas.
- La evaluación se basa en un juez automático (Qwen3.8-27B con veredicto binario), no en benchmarks estándar ni en evaluación humana; puede heredar sesgos y errores del juez.
- Riesgo de alucinación no cuantificado: no se publican métricas de fidelidad factual ni de calibración.
- Idiomas soportados no documentados; no se garantiza un comportamiento uniforme fuera del inglés de los conjuntos de entrenamiento.
- La torre de visión no se ha entrenado en este proceso; su comportamiento multimodal es el del base y no ha sido validado tras el RL.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B-Base tiene su propia licencia enlazada en la model card; conviene revisar ambas antes de desplegar.
- Sin descargas ni validación por parte de la comunidad (0 descargas, 0 likes en el momento de la consulta): no hay evidencia externa de calidad en producción.
- El uso de `enable_thinking=true` incrementa la longitud de salida (hasta 32.768 tokens generados), con el coste de latencia asociado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT365-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step440
- Modelo base del SFT: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr1e-5-step365
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
