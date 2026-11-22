# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr2e-6-kl0.001-p15-k8-resume80-step360

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr2e-6-kl0.001-p15-k8-resume80-step360 es un checkpoint intermedio de ajuste fino con RL (GRPO) sobre Qwen/Qwen3.5-4B-Base, orientado a alineamiento de seguridad. Lo publica el usuario thkim0305-SNU y no es un modelo final: es una instantánea tras 360 actualizaciones del optimizador (iteración Megatron 359) de un entrenamiento que sigue en curso. El modelo conserva la arquitectura multimodal del base (Qwen3_5ForConditionalGeneration, con torre de visión y cabeza MTP intactas) y solo se ha entrenado el modelo de lenguaje.

El interés técnico está en la receta: GRPO con recompensas binarias (0/1) emitidas por un juez Qwen3.8-27B, usando el stack Slime (rollouts con SGLang) más Megatron-LM en bf16, con KL de baja varianza contra el modelo congelado y rollouts multi-turno con herramientas simuladas para los prompts de AgentAlign. El conjunto de prompts "mixture-8" mezcla datos de seguridad, código y jailbreaks benignos.

Con 4.659.865.088 parámetros totales y licencia Apache 2.0, es relevante para quien investigue alineamiento de seguridad en modelos pequeños con RL, aunque su naturaleza de snapshot intermedio y la ausencia de benchmarks públicos lo hacen inadecuado como modelo de producción sin evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (Qwen3_5ForConditionalGeneration), con torre de visión y cabeza MTP; solo entrenado el modelo de lenguaje |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40.960 tokens durante el entrenamiento (contexto del base no especificado) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); checkpoint fuente Megatron torch_dist |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B-Base (snapshot 1001bb4d826a) y mantiene su arquitectura completa: un transformer multimodal con torre de visión y cabeza MTP (multi-token prediction) que quedan con los pesos originales sin tocar. Solo se ha ajustado el modelo de lenguaje mediante GRPO con recompensas binarias normalizadas por grupo, clip PPO de 0.2 y TIS activado. El entrenamiento usa Slime con rollouts SGLang colocados y Megatron-LM en bf16, con 15 prompts por actualización y 8 rollouts por prompt (120 secuencias por paso), tasa de aprendizaje constante de 2e-06 con AdamW (betas 0.9/0.95, weight decay 0.1, grad clip 1.0) y una pérdida KL de baja varianza con coeficiente 0.001 frente al modelo de partida congelado.

El muestreo usa temperatura 1.0, top-p 1, hasta 32.768 tokens generados y 40.960 de contexto, con plantilla de chat de Qwen y `enable_thinking=true`; los rollouts con herramientas usan function calling `qwen3_coder`. La recompensa la emite un juez Qwen3.8-27B con veredicto binario estricto según la especificación del proyecto, y los prompts de AgentAlign se juzgan sobre toda la trayectoria de herramientas visible. El conjunto mixture-8 suma 11.794 prompts únicos (star1_gp3 1000, star_benign_v2 915, agentalign_harmful 2000, agentalign_benign 2000, codesafetybench 900, magicoder 1000, difficult_advice 1982, wildjailbreak_benign 1997); 4000 prompts de AgentAlign incorporan definiciones sintéticas de herramientas y se despliegan como trayectorias multi-turno contra un simulador, con las salidas de herramienta enmascaradas en la pérdida. El plan prevé una época con padding sobre los 11.794 prompts (787 actualizaciones) con checkpoints cada 40 pasos; este es el paso 360.

## Capacidades

- Generación de texto conversacional con plantilla de chat de Qwen y modo de pensamiento (`enable_thinking=true`).
- Entrada image-text-to-text: conserva la torre de visión del base, aunque no fue entrenada en este ajuste.
- Function calling / tool calling mediante el formato `qwen3_coder`, con soporte de trayectorias multi-turno contra herramientas simuladas.
- Razonamiento multi-paso orientado a agentes (prompts de AgentAlign con trayectorias de herramientas).
- Comportamiento alineado en seguridad: rechazo o manejo seguro de peticiones dañinas, según la recompensa binaria del juez.
- Capacidad de código preservada parcialmente (prompts de codesafetybench y magicoder en el mixture).
- Capacidades multilingües: no disponibles (no se documentan idiomas).

## Casos de uso

- Investigación en alineamiento de seguridad con RL: sirve como checkpoint intermedio para estudiar la evolución de la recompensa del juez a lo largo del entrenamiento (ventanas 310-320 frente a 350-360) y comparar dinámicas de GRPO con recompensas binarias.
- Evaluación de robustez ante jailbreaks: el mixture incluye wildjailbreak_benign y star_benign_v2, por lo que el modelo es útil para medir tasas de rechazo y falsos positivos en prompts benignos que parecen peligrosos.
- Seguridad en generación de código: con codesafetybench en el entrenamiento, puede emplearse para probar si el modelo evita sugerir código inseguro o malicioso en asistentes de programación.
- Agentes con herramientas: las trayectorias AgentAlign permiten evaluar el comportamiento seguro de un agente que llama funciones en varios turnos, incluyendo el enmascaramiento de salidas de herramientas.
- Ajuste de consejo sensible: los prompts difficult_advice permiten estudiar cómo responde el modelo a solicitudes de consejo delicadas (salud, legal, riesgos) manteniendo utilidad.
- Punto de partida para continuar el entrenamiento: al ser un snapshot con estado exportado desde Megatron, es adecuado para reanudar RL o para inicializar experimentos de seguridad con Qwen3.5-4B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta la puntuación media de recompensa binaria del juez durante el entrenamiento:

| Ventana de actualizaciones | Puntuacion media | Rollouts juzgados |
|---|---|---|
| 310-320 | 0.839 | 1200 |
| 350-360 | 0.796 | 1199 |

| Dataset | 310-320 | 350-360 |
|---|---|---|
| agentalign_benign | 0.64 | 0.54 |
| agentalign_harmful | 0.89 | 0.94 |
| codesafetybench | 0.94 | 0.89 |
| difficult_advice | 0.85 | 0.77 |
| magicoder | 0.69 | 0.69 |
| star1_gp3 | 0.84 | 0.95 |
| star_benign_v2 | 0.83 | 0.98 |
| wildjailbreak_benign | 0.86 | 0.83 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: alrededor de 9,3 GB solo para pesos (tamaño del repo), más caché KV; con contexto de 40.960 tokens la memoria adicional puede ser considerable.
- Cuantización: no se documentan versiones GGUF ni cuantizadas; sería necesario generarlas a partir de los safetensors.
- GPU recomendadas: el entrenamiento se ejecutó en 1x NVIDIA B200 (con el juez en 2x A100 y un run previo en 3x RTX PRO 6000); para inferencia, una RTX 4090 (24 GB) o superior debería bastar en bf16, y una A100/H100 ofrece margen para contextos largos.
- Cabe en GPU de consumo: sí, en tarjetas con 16-24 GB en bf16 para contextos moderados; en contextos de 40k tokens conviene reducir batch o usar offloading.
- Opciones de despliegue: transformers (dtype bfloat16, device_map auto), vLLM/TGI si soportan la arquitectura qwen3_5, y llama.cpp/Ollama solo tras conversión a GGUF (no disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Safety_Tuning-Qwen3.5-4B-Base-GRPO) | 4.659.865.088 | 40.960 en entrenamiento | RL de seguridad (GRPO), snapshot intermedio | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B-Base | no disponible | no disponible | Modelo base multimodal | Apache 2.0 | Hugging Face |
| Alternativas de seguridad de ~4B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 360 de 787 previstos): el entrenamiento sigue en curso y el modelo no debe tratarse como versión final.
- La puntuación media del juez bajó de 0.839 a 0.796 entre las ventanas 310-320 y 350-360; además, agentalign_benign cayó de 0.64 a 0.54, lo que sugiere posible sobre-rechazo en prompts benignos.
- Las recompensas provienen de un juez automático (Qwen3.8-27B) con veredicto binario; puede heredar sesgos del juez y no equivale a una evaluación humana.
- Riesgo de alucinación no evaluado: no hay benchmarks de veracidad ni de conocimiento.
- Idiomas soportados no documentados; el comportamiento multilingüe es incierto.
- La torre de visión y la cabeza MTP no se entrenaron: las capacidades multimodales no se han alineado en seguridad.
- Licencia Apache 2.0 permite uso comercial, pero al ser un ajuste de seguridad sin evaluación externa, su uso en producción requiere auditoría propia.
- Sin descargas ni validación comunitaria (0 descargas, 0 likes); no hay garantías de reproducibilidad más allá de la receta descrita.
- El contexto de 40.960 tokens corresponde al entrenamiento; el límite efectivo del base no se especifica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr2e-6-kl0.001-p15-k8-resume80-step360
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
