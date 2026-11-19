# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step520

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step520 es un checkpoint intermedio de ajuste fino por refuerzo (RL) orientado a seguridad, construido sobre Qwen/Qwen3.5-4B-Base. Lo publica el usuario thkim0305-SNU y corresponde a la actualización de optimizador 520 de un entrenamiento GRPO que aún está en curso, por lo que no debe considerarse un modelo final sino una instantánea de un proceso de alineamiento en seguridad.

El modelo conserva la arquitectura multimodal del base (clase `Qwen3_5ForConditionalGeneration`): solo se ha entrenado la torre del lenguaje, mientras que la torre de visión y la cabeza MTP mantienen los pesos originales sin tocar. Con 4.659.865.088 parámetros totales en bf16, el checkpoint se carga exactamente igual que el modelo base y hereda su tokenizador y su plantilla de chat con modo thinking.

Su relevancia es doble: por un lado documenta de forma transparente una receta de RL para seguridad con recompensas binarias juzgadas por un modelo juez; por otro, incluye trazas de entrenamiento con prompts dañinos, benignos y de uso de herramientas (AgentAlign), lo que lo convierte en un caso de estudio útil para investigadores que trabajan en alineamiento, robustez frente a jailbreaks y seguridad en agentes con tool calling.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5), clase `Qwen3_5ForConditionalGeneration`; torre de visión y cabeza MTP congeladas del base |
| Parámetros totales | 4.659.865.088 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40.960 tokens (contexto de entrenamiento) |
| Tipos de cuantización | no disponible (pesos publicados en bf16; sin GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base, un transformer multimodal con torre de visión y cabeza de predicción multi-token (MTP). El ajuste se aplica únicamente al modelo de lenguaje: la torre de visión y la MTP se copian intactas del base, de modo que la exportación a Hugging Face re-fusiona las proyecciones GDN, aplica el mapeo de nombres de Slime para Qwen3.5 y mantiene los dtypes del índice original.

El entrenamiento usa GRPO con recompensas binarias normalizadas por grupo, PPO clip 0.2 y TIS activado, sobre el framework Slime (rollouts con SGLang colocados) más Megatron-LM en bf16. Cada actualización emplea 15 prompts con 8 rollouts cada uno (120 secuencias), learning rate constante de 1e-6 con AdamW (betas 0.9/0.95, weight decay 0.1, grad clip 1.0) y una pérdida KL de baja varianza con coeficiente 0.001 respecto al modelo congelado de partida. El muestreo usa temperatura 1.0, top-p 1, hasta 32.768 tokens generados y 40.960 de contexto, con plantilla de chat de Qwen y `enable_thinking=true`; los rollouts con herramientas usan function calling `qwen3_coder`. La recompensa la emite un juez Qwen3.8-27B con veredicto binario estricto (0/1), y en los prompts de AgentAlign se juzga toda la traza visible de uso de herramientas. El schedule cubre una época sobre 11.794 prompts únicos (787 actualizaciones) con checkpoints cada 80 pasos; este es el paso 520, por lo que el entrenamiento seguía en progreso en el momento de la exportación.

Los datos (mixture-8) se componen de star1_gp3 (1.000), star_benign_v2 (915), agentalign_harmful (2.000), agentalign_benign (2.000), codesafetybench (900), magicoder (1.000), difficult_advice (1.982) y wildjailbreak_benign (1.997). Los 4.000 prompts de AgentAlign llevan definiciones sintéticas de herramientas y se despliegan como trayectorias multiturno contra un simulador, con las salidas de herramienta enmascaradas en la pérdida.

## Capacidades

- Generación de texto conversacional con plantilla de chat de Qwen y modo thinking activable (`enable_thinking=true`).
- Razonamiento multi-paso dentro del bloque de pensamiento antes de la respuesta final.
- Tool calling / function calling mediante el formato `qwen3_coder`, empleado durante el entrenamiento en rollouts multiturno.
- Comportamiento de agente con trayectorias de uso de herramientas simuladas (AgentAlign).
- Capacidad multimodal heredada del base: el pipeline declarado es image-text-to-text y se conserva la torre de visión, aunque no fue entrenada en este ajuste.
- Comportamiento orientado a seguridad: rechazo de peticiones dañinas, manejo de prompts de jailbreak y de consejo difícil, según la señal del juez binario.
- Generación de código, incluyendo contexto de seguridad en código (codesafetybench, magicoder).
- Capacidades multilingües: no disponible (no se especifican idiomas).

## Casos de uso

- Investigación en alineamiento de seguridad: sirve como checkpoint de referencia para estudiar la evolución de la recompensa del juez a lo largo de las actualizaciones (0,417 en los pasos 0-10 frente a 0,740 en los pasos 510-520) y comparar curvas por dataset.
- Evaluación de robustez frente a jailbreaks: los prompts de wildjailbreak_benign y star_benign_v2 permiten medir si el modelo mantiene respuestas útiles en entradas benignas que imitan ataques.
- Seguridad en agentes con herramientas: al haberse entrenado con trazas multiturno de AgentAlign contra un simulador, es adecuado para probar si un agente rechaza acciones dañinas manteniendo la utilidad en tareas legítimas.
- Moderación y filtrado en pipelines de atención al cliente: el modelo puede clasificar o reformular peticiones sensibles dentro de un flujo conversacional, apoyándose en su modo thinking para razonar el veredicto antes de responder.
- Generación de código con conciencia de seguridad: útil para prototipar asistentes que detecten patrones inseguros en sugerencias de código, dado el entrenamiento sobre codesafetybench y magicoder.
- Estudio de recetas de RL: la configuración GRPO con recompensa binaria, KL 0.001 y 15×8 rollouts es reproducible y sirve de base para experimentos de ablación en laboratorio.
- Evaluación de la estabilidad del entrenamiento: las fluctuaciones de la recompensa entre ventanas (por ejemplo, la caída de 0,837 en los pasos 310-320 a 0,750 en 350-360) permiten analizar inestabilidad y sobreajuste al juez.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card únicamente reporta la recompensa media binaria del juez durante el entrenamiento:

| Ventana de actualizaciones | Recompensa media | Rollouts juzgados |
|---|---|---|
| 0-10 | 0,417 | 1200 |
| 30-40 | 0,467 | 1200 |
| 70-80 | 0,578 | 1200 |
| 110-120 | 0,629 | 1200 |
| 150-160 | 0,708 | 1200 |
| 190-200 | 0,715 | 1200 |
| 230-240 | 0,768 | 1200 |
| 270-280 | 0,779 | 1200 |
| 310-320 | 0,837 | 1200 |
| 350-360 | 0,750 | 1200 |
| 390-400 | 0,804 | 1200 |
| 430-440 | 0,793 | 1200 |
| 470-480 | 0,801 | 1200 |
| 510-520 | 0,740 | 1200 |

Desglose por dataset en la ventana 510-520: agentalign_benign 0,56; agentalign_harmful 0,90; codesafetybench 0,84; difficult_advice 0,78; magicoder 0,60; star1_gp3 0,91; star_benign_v2 0,89; wildjailbreak_benign 0,74.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 9,3 GB solo para pesos (tamaño del repo), más overhead de activaciones y caché KV; en la práctica, entre 12 y 16 GB para inferencia con contexto moderado.
- En cuantización de 8 bits se situaría en torno a 5-6 GB de pesos; en 4 bits, alrededor de 3 GB, aunque no se publican cuantizaciones oficiales.
- GPU recomendadas: B200 (empleadas en el entrenamiento), A100 40/80 GB, H100, L40S. Cabe en GPUs de consumo con al menos 16 GB (RTX 4080, RTX 4090, RTX 5090) en bf16 con contexto corto.
- Despliegue: transformers (carga directa con `Qwen3_5ForConditionalGeneration`), vLLM y SGLang para serving; llama.cpp/Ollama requerirían conversión a GGUF no publicada.
- Latencia y throughput: no disponibles. El entrenamiento usó dos B200, con el juez en la GPU 0 y el entrenador más el motor de rollouts en la GPU 1, sin métricas de inferencia publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-GRPO-...-step520 | 4,66 B | 40.960 (entrenamiento) | apache-2.0 | Checkpoint intermedio de RL para seguridad sobre Qwen3.5-4B-Base |
| Qwen/Qwen3.5-4B-Base | 4 B (aprox.) | no disponible | apache-2.0 | Modelo base sin ajuste de seguridad; referencia directa |
| Qwen3.8-27B (juez) | 27 B | no disponible | no disponible | Modelo juez usado para generar las recompensas binarias |
| Alternativas de seguridad de tamaño similar | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de benchmarks comunes ni de otros checkpoints de seguridad del mismo tamaño en la información disponible para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 520 de 787 previstos): el entrenamiento no había terminado y la recompensa muestra fluctuaciones, con una caída de 0,837 a 0,740 entre las ventanas 310-320 y 510-520.
- Riesgo de sobreajuste al juez: las recompensas proceden de un único juez (Qwen3.8-27B) con veredicto binario estricto, lo que puede favorecer comportamientos que agradan al juez sin mejorar la seguridad real.
- Riesgo de alucinación inherente al modelo base, no corregido por este ajuste.
- Sesgos: no documentados en la información disponible; el modelo base puede arrastrar sesgos de sus datos de preentrenamiento.
- Idiomas soportados no especificados; el comportamiento multilingüe no está garantizado ni evaluado.
- La torre de visión y la cabeza MTP no fueron entrenadas, por lo que las capacidades multimodales no se han alineado en seguridad.
- Licencia apache-2.0 heredada del base, que permite uso comercial, pero sin garantías del autor sobre idoneidad para producción.
- No hay cuantizaciones publicadas (GGUF, AWQ, GPTQ) ni resultados de benchmarks estándar, lo que dificulta evaluar su calidad frente a alternativas.
- El uso de prompts dañinos y jailbreaks en el entrenamiento exige revisar el comportamiento antes de desplegarlo en entornos reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step520
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
