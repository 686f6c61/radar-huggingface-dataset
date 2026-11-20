# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step640

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step640 es un checkpoint intermedio de ajuste fino por refuerzo (RL) orientado a seguridad, construido sobre Qwen/Qwen3.5-4B-Base. Lo publica el usuario thkim0305-SNU y emplea GRPO con recompensas binarias (0/1) emitidas por un juez Qwen3.8-27B, con pérdida KL de baja varianza (coeficiente 0,001) contra el modelo de partida congelado. El entrenamiento se realizó con el framework Slime (rollouts con SGLang colocados) junto a Megatron-LM en bf16, sobre dos GPUs B200, y se detuvo en la actualización de optimizador 640 de un total previsto de 787.

El modelo es un transformer multimodal (clase `Qwen3_5ForConditionalGeneration`) con 4.659.865.088 parámetros totales. Solo se entrenó la torre de lenguaje: la torre de visión y la cabeza MTP conservan los pesos originales del modelo base, por lo que el checkpoint se carga exactamente igual que Qwen3.5-4B-Base. El contexto de entrenamiento fue de 40.960 tokens con hasta 32.768 tokens generados por rollout.

Su relevancia es metodológica: documenta de forma granular la evolución de la recompensa binaria media por conjunto de datos a lo largo de 640 actualizaciones, lo que permite evaluar la estabilidad del RL de seguridad en tareas de consejo difícil, seguridad de código, jailbreak benigno y trayectorias de uso de herramientas (AgentAlign). Es un snapshot de investigación, no un modelo final, y así debe tratarse en cualquier evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `Qwen3_5ForConditionalGeneration` (torre de lenguaje + torre de visión + cabeza MTP); solo se entrena la torre de lenguaje |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40.960 tokens en entrenamiento; no se especifica el máximo de inferencia más allá del base |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (hereda la del modelo base Qwen3.5-4B-Base) |
| Formato de pesos | safetensors (bf16), biblioteca `transformers` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-4B-Base: un transformer multimodal con torre de visión, torre de lenguaje y cabeza de predicción multi-token (MTP). En este checkpoint únicamente recibe gradientes la torre de lenguaje; visión y MTP se copian intactos desde el base durante la exportación, junto con la refusión de las proyecciones GDN y el mapeo de nombres de Slime para Qwen3.5. La exportación se realizó desde un checkpoint Megatron `torch_dist` (`iter_0000639`) el 2026-11-20.

El entrenamiento aplica GRPO con normalización de grupo sobre recompensas binarias, clip PPO de 0,2 y TIS activado. Cada actualización usa 15 prompts con 8 rollouts cada uno (120 secuencias), learning rate constante de 1e-6, AdamW con betas [0,9; 0,95], weight decay 0,1 y grad clip 1,0. El muestreo usa temperatura 1,0, top-p 1, hasta 32.768 tokens generados y plantilla de chat Qwen con `enable_thinking=true`; los rollouts con herramientas emplean el function calling `qwen3_coder`. El juez es Qwen3.8-27B con veredicto binario estricto según la especificación del proyecto, y en AgentAlign evalúa la trayectoria completa de herramientas visible. El conjunto "mixture-8" suma 11.794 prompts únicos (star1_gp3 1000, star_benign_v2 915, agentalign_harmful 2000, agentalign_benign 2000, codesafetybench 900, magicoder 1000, difficult_advice 1982, wildjailbreak_benign 1997); 4000 prompts de AgentAlign incluyen definiciones sintéticas de herramientas y se despliegan como trayectorias multi-turno contra un simulador, con las salidas de herramienta enmascaradas en la pérdida.

## Capacidades

- Generación de texto conversacional con plantilla de chat Qwen y modo de razonamiento explícito (`enable_thinking=true`).
- Razonamiento multi-paso dentro del bloque de pensamiento antes de la respuesta final.
- Uso de herramientas y function calling mediante el formato `qwen3_coder`, entrenado explícitamente con trayectorias multi-turno de AgentAlign.
- Comportamiento orientado a seguridad: rechazo de peticiones dañinas, manejo de jailbreaks benignos y de prompts de consejo difícil.
- Seguridad en generación de código (CodesafetyBench) y preservación de capacidad de código general (Magicoder) dentro del mismo objetivo de RL.
- Procesamiento de entrada imagen-texto a nivel de arquitectura (torre de visión presente), aunque dicha torre no fue entrenada en este ajuste.
- Capacidades multilingües: no disponibles como dato verificado; dependen del modelo base.

## Casos de uso

- Investigación en RL de seguridad: reproducir o analizar la curva de recompensa binaria por dataset a lo largo de 640 actualizaciones para estudiar estabilidad y olvido catastrófico en ajuste de seguridad.
- Evaluación de robustez frente a jailbreaks: el checkpoint incorpora `wildjailbreak_benign` en el entrenamiento, por lo que sirve como referencia para medir la tasa de rechazo correcto en prompts benignos disfrazados.
- Filtrado y moderación de código generado: entrenado con CodesafetyBench, puede emplearse como clasificador generativo o generador seguro en pipelines que producen snippets y requieren descartar patrones peligrosos.
- Asistentes con uso de herramientas: al haberse entrenado con trayectorias AgentAlign y function calling `qwen3_coder`, es adecuado para prototipos de agentes que encadenan llamadas a herramientas simuladas o reales.
- Consejo sensible (salud, finanzas, legal): el conjunto `difficult_advice` (1982 prompts) eleva la recompensa de 0,28 a 0,89, lo que lo hace útil para estudiar respuestas prudentes en dominios de alto riesgo.
- Baseline para comparativas de safety tuning: al ser un snapshot intermedio con receta y curvas documentadas, sirve como punto de control en estudios que comparan GRPO binario frente a DPO u otras variantes.
- Generación multimodal de bajo coste: al conservar la torre de visión del base y solo 4,66B de parámetros, puede desplegarse en una sola GPU para tareas imagen-texto donde no se requiera un ajuste específico de visión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card únicamente reporta la recompensa binaria media del juez durante el entrenamiento, que se reproduce a continuación como métrica interna y no como benchmark comparable.

| Ventana de actualizaciones | Recompensa media | Rollouts juzgados |
|---|---|---|
| 0-10 | 0,417 | 1200 |
| 70-80 | 0,578 | 1200 |
| 150-160 | 0,708 | 1200 |
| 230-240 | 0,768 | 1200 |
| 310-320 | 0,837 | 1200 |
| 390-400 | 0,804 | 1200 |
| 470-480 | 0,801 | 1200 |
| 550-560 | 0,841 | 1200 |
| 630-640 | 0,792 | 1200 |

| Dataset | Inicio (0-10) | Final (630-640) |
|---|---|---|
| agentalign_benign | 0,41 | 0,60 |
| agentalign_harmful | 0,63 | 0,93 |
| codesafetybench | 0,47 | 0,94 |
| difficult_advice | 0,28 | 0,89 |
| magicoder | 0,51 | 0,57 |
| star1_gp3 | 0,57 | 0,91 |
| star_benign_v2 | 0,27 | 0,80 |
| wildjailbreak_benign | 0,27 | 0,78 |

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 9,3 GB de pesos más overhead de activaciones; con contexto de 40.960 tokens y KV cache en bf16, el consumo puede superar los 20-24 GB según lote y longitud.
- Cuantización a 8 bits: alrededor de 5 GB de pesos; a 4 bits, alrededor de 2,5-3 GB, aunque el autor no publica versiones GGUF ni cuantizadas.
- GPU recomendadas: A100 40/80 GB, H100, B200 para entrenamiento (la receta usó dos B200); para inferencia basta una RTX 4090 24 GB en bf16 con contexto moderado, o GPUs de 16 GB con cuantización.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) en bf16 con contexto recortado, y en RTX 4080/4070 Ti (16 GB) con cuantización de 8 o 4 bits.
- Opciones de despliegue: `transformers` (receta oficial de la model card), vLLM y TGI para servir en bf16; llama.cpp/Ollama solo si se generan conversiones GGUF, no publicadas por el autor.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (GRPO Mixture8 step640) | 4,66B | 40.960 en entrenamiento | RL de seguridad con recompensa binaria y juez 27B | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B-Base | 4,66B (aprox.) | no disponible | Modelo base sin ajuste de seguridad | Apache 2.0 | Hugging Face |
| Alternativas de safety tuning de 4B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados de otros checkpoints de safety tuning comparables en la información proporcionada; la comparativa se limita al modelo base del que deriva.

## Limitaciones y advertencias

- Es un checkpoint intermedio (640 de 787 actualizaciones): el autor indica explícitamente que el entrenamiento sigue en curso y que no es un modelo final.
- La métrica de calidad es la recompensa de un juez automático (Qwen3.8-27B) con veredicto binario; puede estar sesgada hacia el estilo del juez y no correlacionar con evaluación humana.
- La recompensa media fluctúa (pico de 0,841 en 550-560, descenso a 0,792 en 630-640), lo que sugiere inestabilidad y posible sobreajuste al juez en la fase final.
- `agentalign_benign` y `magicoder` son los conjuntos con menor progreso (0,60 y 0,57), lo que indica riesgo de degradación en utilidad general y en calidad de código no relacionada con seguridad.
- Riesgo de alucinación: no evaluado; no hay benchmarks de veracidad ni de fidelidad factual.
- Idiomas soportados no documentados; el comportamiento multilingüe depende del base y no fue objeto del ajuste.
- La torre de visión no fue entrenada: las capacidades imagen-texto son las del base sin garantía de alineación con el nuevo comportamiento de seguridad.
- Licencia Apache 2.0 permite uso comercial, pero al ser un snapshot de investigación sin evaluación de producción, no se recomienda su despliegue directo en sistemas críticos.
- Sin descargas ni likes en el momento de la consulta: no hay validación externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step640
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Framework Slime: no disponible en la información proporcionada
- Megatron-LM: no disponible en la información proporcionada
- SGLang: no disponible en la información proporcionada
- Paper o blog del método: no disponible en la información proporcionada
