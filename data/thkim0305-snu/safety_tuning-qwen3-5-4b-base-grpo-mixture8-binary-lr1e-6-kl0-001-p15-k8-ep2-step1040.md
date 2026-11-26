# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-ep2-step1040

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8 es un checkpoint intermedio de ajuste fino por refuerzo (RL) orientado a seguridad, obtenido a partir de Qwen/Qwen3.5-4B-Base. Lo desarrolla el usuario thkim0305-SNU y se publica como snapshot del paso 1040 de optimizador de un entrenamiento que sigue en curso: no es un modelo final, sino una instantanea reproducible de un proceso de alineamiento con GRPO sobre un conjunto de prompts denominado "mixture-8".

El modelo conserva la arquitectura multimodal del base Qwen3.5 (clase `Qwen3_5ForConditionalGeneration`), con 4.659.865.088 parametros totales en bf16 y pesos en safetensors. Solo se ha entrenado el modelo de lenguaje: la torre de vision y la cabeza MTP permanecen intactas, de modo que el checkpoint se carga exactamente igual que el modelo base. La innovacion principal no esta en la arquitectura sino en el procedimiento: recompensas binarias estrictas emitidas por un juez Qwen3.8-27B, rollouts multi-turno con simulador de herramientas y una penalizacion KL de baja varianza contra el modelo congelado.

Su relevancia es metodologica: documenta de forma transparente la receta, la composicion del dataset y la evolucion del score del juez a lo largo del entrenamiento, lo que lo convierte en material util para investigacion en safety tuning y RLHF/RLVR, no tanto para despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (`Qwen3_5ForConditionalGeneration`), con torre de vision y cabeza MTP |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40.960 tokens en entrenamiento (configuracion de sampling) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), libreria transformers |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base, un transformer multimodal con torre de vision y cabeza de prediccion multi-token (MTP). En este checkpoint solo se actualiza el modelo de lenguaje; vision y MTP se copian sin cambios desde el base, y las proyecciones GDN se re-fusionan durante la exportacion desde el formato Megatron `torch_dist` (`iter_0001039`) al formato Hugging Face.

El entrenamiento usa GRPO con recompensas binarias normalizadas por grupo, clip PPO de 0.2, muestreo por importancia truncado (TIS) activado, learning rate constante de 1e-6, AdamW con betas [0.9, 0.95], weight decay 0.1 y grad clip 1.0. Cada actualizacion emplea 15 prompts x 8 rollouts = 120 secuencias, con temperatura 1.0, top-p 1 y hasta 32.768 tokens generados. Se aplica una perdida KL de baja varianza con coeficiente 0.001 contra el modelo congelado de partida. El stack es Slime (rollouts SGLang colocados) mas Megatron-LM en bf16, con plantilla de chat Qwen en modo `enable_thinking=true` y function calling `qwen3_coder` para los rollouts con herramientas. La recompensa la emite un juez Qwen3.8-27B con veredicto binario estricto (0/1); los prompts de AgentAlign se evaluan sobre la trayectoria completa de uso de herramientas.

El dataset "mixture-8" suma 11.794 prompts unicos (una epoca con padding = 1.574 actualizaciones): star1_gp3 (1.000), star_benign_v2 (915), agentalign_harmful (2.000), agentalign_benign (2.000), codesafetybench (900), magicoder (1.000), difficult_advice (1.982) y wildjailbreak_benign (1.997). Los 4.000 prompts de AgentAlign llevan definiciones sinteticas de herramientas y se despliegan como trayectorias multi-turno contra un simulador, con las salidas de herramienta enmascaradas en la perdida. Este checkpoint corresponde a la epoca 2 del run con lr 1e-6, reanudado en el paso 787 con nueva permutacion de prompts (semilla 43), sobre 1x NVIDIA B200 para entrenador y motor de rollout y 2x A100 (SGLang TP2) para el juez.

## Capacidades

- Generacion de texto conversacional y razonamiento con modo thinking activable mediante la plantilla de chat (`enable_thinking=true`).
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), heredado del base Qwen3.5.
- Tool calling / function calling con el formato `qwen3_coder`, entrenado explicitamente con trayectorias multi-turno.
- Razonamiento agéntico de varios pasos con simulador de herramientas (AgentAlign).
- Generacion y evaluacion de codigo, con enfasis en seguridad de codigo (CodeSafetyBench, Magicoder).
- Comportamiento orientado a rechazo seguro y manejo de prompts benignos de jailbreak (WildJailbreak benign, Star benign).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion en safety tuning: servir como punto de comparacion reproducible frente al base Qwen3.5-4B para medir el efecto de GRPO con recompensas binarias sobre tasas de rechazo y utilidad.
- Evaluacion de robustez ante jailbreaks: usar los prompts benignos de WildJailbreak y Star para comprobar si el ajuste degrada la utilidad en consultas legitimas.
- Auditoria de seguridad en generacion de codigo: desplegar el modelo sobre CodeSafetyBench y Magicoder para detectar si produce patrones inseguros en sugerencias de codigo.
- Prototipado de agentes con tool calling: aprovechar las trayectorias AgentAlign para probar pipelines de function calling en los que el modelo debe decidir cuando invocar herramientas y como encadenar pasos.
- Generacion de respuestas con razonamiento explicito: activar `enable_thinking` para obtener cadenas de razonamiento auditables en tareas de consejo dificil (difficult_advice).
- Base para ajuste posterior: al conservar vision y MTP intactos y cargar como el base, sirve como punto de partida para SFT o DPO adicionales sin rehacer la conversion de pesos.
- Analisis de dinamica de RL: estudiar la curva de recompensa del juez por dataset (por ejemplo, la caida de magicoder de 0.76 a 0.26 entre ventanas) para diagnosticar inestabilidad en el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La unica metrica publicada es la recompensa media binaria del juez durante el entrenamiento:

| Ventana (updates) | Score medio | Rollouts evaluados |
|---|---|---|
| 790-800 | 0.808 | 1200 |
| 830-840 | 0.815 | 1200 |
| 870-880 | 0.855 | 1200 |
| 910-920 | 0.877 | 1200 |
| 950-960 | 0.853 | 1200 |
| 990-1000 | 0.808 | 1200 |
| 1030-1040 | 0.828 | 1200 |

Desglose por dataset en la ventana 1030-1040: agentalign_benign 0.61, agentalign_harmful 0.92, codesafetybench 0.94, difficult_advice 0.91, magicoder 0.57, star1_gp3 0.89, star_benign_v2 0.92, wildjailbreak_benign 0.80.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo de pesos, mas cache KV y activaciones; en la practica se recomienda un margen de 12-16 GB para contexto moderado y bastante mas para contextos cercanos a 40.960 tokens.
- Cuantizacion a 8 bits: en torno a 5 GB de pesos; a 4 bits, en torno a 2,5-3 GB (estimaciones teoricas, no verificadas para este checkpoint).
- GPU recomendadas: NVIDIA B200 o A100/H100 para entrenamiento y rollouts; RTX 4090 (24 GB) o RTX 3090 (24 GB) suficientes para inferencia en bf16 con contexto limitado.
- Cabe en GPU de consumo: si, en tarjetas de 16-24 GB con cuantizacion o contexto reducido; en 12 GB solo con cuantizacion agresiva.
- Opciones de despliegue: transformers (ruta oficial documentada), vLLM y SGLang (usados en el entrenamiento), TGI y llama.cpp/Ollama previa conversion a GGUF (no se proporcionan pesos GGUF en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8) | 4,66 B | 40.960 (entrenamiento) | RL de seguridad sobre Qwen3.5-4B-Base, snapshot intermedio | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B-Base | 4 B (aprox.) | no disponible en la informacion | Modelo base multimodal sin alinear | Apache 2.0 | Hugging Face |
| Alternativas de safety tuning de ~4 B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio, no un modelo final: el autor indica explicitamente que el entrenamiento sigue en curso y que el snapshot puede no representar el comportamiento final.
- Inestabilidad observable: el score de magicoder cae de 0.76 (ventana 790-800) a 0.26 (830-840) y se queda en 0.57 en la ultima ventana; agentalign_benign baja de 0.73 a 0.61. Esto sugiere possible olvido catastrofico o desajuste entre el juez y el objetivo.
- Riesgo de alucinacion: no evaluado ni documentado; al ser un modelo de 4 B sin benchmarks publicados, no hay garantias cuantificadas.
- Sesgos conocidos: no documentados. El juez Qwen3.8-27B introduce el sesgo de su propia especificacion de modelo, que no se publica en detalle.
- Idiomas soportados: no disponibles; no se garantiza cobertura multilingue mas alla de la del base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo deriva de Qwen3.5-4B-Base y hereda sus terminos; conviene revisar el LICENSE del base enlazado en la model card.
- Vision y MTP no fueron entrenados: las capacidades multimodales son las del base sin alinear, por lo que no se benefician del ajuste de seguridad.
- Sin datos de benchmarks estandar ni evaluaciones de seguridad independientes: no apto para produccion sin una evaluacion propia previa.
- Repositorio con 0 descargas y 0 likes: sin validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-ep2-step1040
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
