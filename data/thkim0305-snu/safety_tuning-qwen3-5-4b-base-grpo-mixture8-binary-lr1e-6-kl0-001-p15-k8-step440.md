# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step440

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step440 es un checkpoint intermedio de ajuste fino por refuerzo (RL) sobre Qwen/Qwen3.5-4B-Base, desarrollado por el usuario thkim0305-SNU. El objetivo es alinear el modelo base en seguridad: reducir respuestas dañinas, mejorar el cumplimiento de políticas en entornos con herramientas y reforzar conductas benignas. No es un modelo final, sino una instantánea del paso 440 de un entrenamiento en curso, publicada para reproducibilidad e inspección.

El entrenamiento usa GRPO con recompensas binarias (0/1) emitidas por un juez Qwen3.8-27B, sobre un conjunto de prompts denominado "mixture-8" que combina datos de seguridad, código, consejo difícil y trayectorias agénticas con herramientas simuladas. El marco técnico es Slime (rollouts con SGLang, colocados) más Megatron-LM en bf16, con KL de baja varianza contra el modelo congelado de partida (coeficiente 0,001).

Arquitectura y tamaño: Qwen3.5-4B-Base, con 4.659.865.088 parámetros totales según safetensors, pesos bf16 en formato Hugging Face `Qwen3_5ForConditionalGeneration`, contexto de entrenamiento de 40.960 tokens y hasta 32.768 tokens generados por muestra. La torre de visión y la cabeza MTP conservan los pesos del modelo base sin modificar; solo se entrenó el modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5), con torre de visión y cabeza MTP heredadas del modelo base |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 40.960 tokens en entrenamiento; longitud nativa del modelo base no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, `Qwen3_5ForConditionalGeneration`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base y aplica GRPO (Group Relative Policy Optimization) con normalización de grupo sobre recompensas binarias, clip PPO de 0,2 y muestreo con TIS activado. Cada actualización consume 15 prompts con 8 rollouts por prompt (120 secuencias), con tasa de aprendizaje constante de 1e-6, AdamW con betas [0,9; 0,95], weight decay 0,1 y recorte de gradiente 1,0. Se aplica una pérdida KL de baja varianza contra el modelo congelado de inicio con coeficiente 0,001, muestreo con temperatura 1,0 y top-p 1.

El conjunto "mixture-8" suma 11.794 prompts únicos repartidos en ocho fuentes: star1_gp3 (1.000), star_benign_v2 (915), agentalign_harmful (2.000), agentalign_benign (2.000), codesafetybench (900), magicoder (1.000), difficult_advice (1.982) y wildjailbreak_benign (1.997). Los 4.000 prompts de AgentAlign incorporan definiciones sintéticas de herramientas y se despliegan como trayectorias multi-turno contra un simulador, con las salidas de herramienta enmascaradas en la pérdida. El plan de entrenamiento es una época con padding sobre 11.794 prompts, equivalente a 787 actualizaciones, con checkpoints cada 80 actualizaciones. El juez es Qwen3.8-27B con veredicto binario estricto; las trayectorias de AgentAlign se evalúan sobre toda la traza visible.

La innovación principal no reside en la arquitectura (se mantiene intacta respecto al base) sino en el pipeline de RL: uso de SGLang para rollouts colocados con Megatron-LM, plantilla de chat Qwen con `enable_thinking=true`, function calling `qwen3_coder` en los rollouts con herramientas, y exportación a Hugging Face con re-fusión de proyecciones GDN, mapeo de nombres Slime Qwen3.5 y copia de pesos de visión/MTP del base.

## Capacidades

- Generación de texto conversacional con plantilla de chat Qwen y modo de razonamiento explícito (`enable_thinking=true`).
- Razonamiento multi-paso dentro del bloque de pensamiento antes de la respuesta final.
- Function calling / tool calling mediante el formato `qwen3_coder`, empleado durante el entrenamiento en trayectorias agénticas.
- Ejecución de trayectorias multi-turno con herramientas simuladas (AgentAlign, 4.000 prompts con definiciones sintéticas).
- Generación y revisión de código, incluyendo contexto de seguridad en código (codesafetybench) y generación estándar (magicoder).
- Capacidad de imagen a texto heredada del modelo base (pipeline `image-text-to-text`, torre de visión intacta), sin ajuste específico durante este entrenamiento.
- Comportamiento alineado en seguridad: rechazo de solicitudes dañinas y cumplimiento de solicitudes benignas, ajustado con recompensa binaria.
- Consejo en situaciones difíciles (difficult_advice) y robustez ante prompts de jailbreak benignos (wildjailbreak_benign).

## Casos de uso

- Filtrado y moderación de respuestas en asistentes conversacionales: el ajuste con juez binario sobre agentalign_harmful y star1_gp3 permite usar el modelo como clasificador generativo o generador seguro en pipelines de moderación, apoyándose en su contexto de 40.960 tokens para conversaciones largas.
- Asistentes con herramientas en producción: al haberse entrenado con trayectorias multi-turno y function calling `qwen3_coder`, puede integrarse en agentes que consultan APIs, con la ventaja de haber visto trayectorias benignas y dañinas etiquetadas.
- Generación de código con conciencia de seguridad: útil en pipelines de CI/CD o asistentes de IDE donde se quiere reducir la sugerencia de código inseguro (código evaluado en codesafetybench), manteniendo capacidad de generación estándar (magicoder).
- Atención al cliente en dominios sensibles: los datos de difficult_advice y wildjailbreak_benign entrenan respuestas prudentes ante solicitudes ambiguas, adecuado para sectores financiero, sanitario o legal donde el rechazo correcto importa.
- Investigación en alineación y RL: al ser un checkpoint intermedio con métricas por ventana de actualizaciones, sirve como referencia para estudiar la dinámica de GRPO con recompensas binarias, KL bajo y datos mixtos.
- Evaluación de robustez frente a jailbreaks: el modelo puede emplearse como sujeto de pruebas en suites de red-teaming, dado que fue entrenado explícitamente contra prompts de wildjailbreak_benign.
- Despliegue en hardware modesto para prototipos: con 4,66 mil millones de parámetros en bf16, cabe en GPU de consumo de gama alta y permite iterar en local antes de pasar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la recompensa media binaria del juez durante el entrenamiento por ventanas de actualizaciones:

| Ventana (updates) | Recompensa media | Rollouts juzgados |
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

Desglose por conjunto de datos en la ventana 430-440: agentalign_benign 0,62; agentalign_harmful 0,89; codesafetybench 0,85; difficult_advice 0,83; magicoder 0,56; star1_gp3 0,96; star_benign_v2 0,92; wildjailbreak_benign 0,82. No se trata de benchmarks estándar (MMLU, HumanEval, GSM8K), sino de la métrica de recompensa del propio juez.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 9,3 GB solo para pesos (tamaño del repo), más caché KV; con contexto de 40.960 tokens el consumo adicional puede ser significativo. Presupuesto práctico: 16-24 GB de VRAM para inferencia con contexto moderado.
- GPU recomendadas: B200 (usadas en el entrenamiento), H100, A100 80 GB para entrenamiento o inferencia con contexto completo; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en bf16 con contexto reducido.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB o más con cuantización (p. ej., 8 bits o 4 bits) o en 24 GB en bf16 con contexto limitado.
- Opciones de despliegue: transformers (receta oficial de la model card), SGLang (usado en los rollouts de entrenamiento), y previsiblemente vLLM y TGI por compatibilidad con `Qwen3_5ForConditionalGeneration`; llama.cpp/Ollama requerirían conversión a GGUF no publicada.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary (...step440) | 4,66 B | 40.960 en entrenamiento | RL de seguridad sobre Qwen3.5-4B-Base | Apache 2.0 | Hugging Face (0 descargas, 0 likes) |
| Qwen/Qwen3.5-4B-Base | aproximadamente 4,66 B | no disponible en la informacion proporcionada | Modelo base sin alinear | Apache 2.0 (según enlace de licencia del autor) | Hugging Face |
| Modelos de seguridad tuning comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada; la comparación se limita a parámetros y licencia.

## Limitaciones y advertencias

- Checkpoint intermedio: el entrenamiento continúa (787 actualizaciones previstas, esta es la 439/440 del iterador Megatron); el rendimiento puede no ser el final y no debe tratarse como versión estable.
- La recompensa del juez no equivale a seguridad garantizada: un juez binario de 27 B puede tener sesgos y errores; la recompensa media fluctúa (0,837 en 310-320 frente a 0,750 en 350-360) y no es monótona.
- Riesgo de alucinación: no se documentan evaluaciones de factualidad; el ajuste RL sobre seguridad no elimina alucinaciones del modelo base.
- Idiomas soportados no declarados: se desconoce el comportamiento multilingüe tras el ajuste; los datos de entrenamiento son mayoritariamente en inglés (según los nombres de los conjuntos).
- Solo se entrenó el modelo de lenguaje: la torre de visión y la cabeza MTP son pesos base sin ajustar; el comportamiento multimodal no ha sido alineado en seguridad por este proceso.
- Sesgos de los datos: la mezcla "mixture-8" incluye conjuntos de seguridad y de código con posible sesgo de anotación; no se publican análisis de sesgo demográfico ni de dominio.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías; conviene revisar la licencia del modelo base en el enlace indicado.
- Cero descargas y cero likes: no hay evidencia de uso en producción ni validación por la comunidad.
- Requiere `enable_thinking=true` o plantilla de chat Qwen para reproducir el comportamiento entrenado; el uso con otras plantillas puede degradar la alineación.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step440
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Paper de GRPO: no disponible en la información proporcionada
- Blog o repositorio de Slime: no disponible en la información proporcionada
- Repositorio de Megatron-LM: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
