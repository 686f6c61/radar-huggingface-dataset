# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-T1B0-genv2gp3-lr1e-6-step174

## Resumen

El modelo `Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-T1B0-genv2gp3-lr1e-6-step174` es un checkpoint intermedio de un ajuste fino mediante DPO (Direct Preference Optimization) sobre el modelo base `Qwen/Qwen3.5-4B-Base` de Alibaba. Lo desarrolla el usuario `thkim0305-SNU` (aparentemente vinculado a la Universidad Nacional de Seúl) con el objetivo de mejorar el comportamiento de seguridad del modelo: reducir respuestas dañinas, mitigar jailbreaks y alinear el modelo hacia respuestas útiles y seguras en escenarios benignos, manteniendo al mismo tiempo capacidades de razonamiento y de uso de herramientas.

El checkpoint corresponde al paso 174 de un total de 694 actualizaciones del optimizador (aproximadamente el 50 % de 2 épocas), por lo que se trata de una instantánea de entrenamiento en curso y no de un modelo final. Los pesos se exportan en bf16 con la clase `Qwen3_5ForConditionalGeneration`, manteniendo intactos el torre de visión y la cabeza MTP del modelo base; solo se ha entrenado el modelo de lenguaje.

Con 4.659.865.088 parámetros totales, una ventana de contexto de 32.768 tokens y licencia Apache 2.0, el modelo se posiciona como una alternativa ligera y permisiva para experimentación en seguridad de LLM, evaluación de alineamiento y despliegue de asistentes con salvaguardas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5, `Qwen3_5ForConditionalGeneration`), con torre de visión y cabeza MTP heredadas del base |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, `Qwen3_5ForConditionalGeneration`) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-4B-Base` (snapshot `1001bb4d826a`), que actúa también como modelo de referencia congelado durante el DPO. La arquitectura es la nativa de Qwen3.5 para generación condicional, con torre de visión y cabeza MTP que no se entrenan en este proceso: solo se actualiza el modelo de lenguaje. El ajuste se realiza con DPO sigmoide (beta 0.1) sobre la respuesta completa, incluyendo razonamiento, respuesta final y llamadas a herramientas.

El conjunto de datos consta de 22.185 pares de preferencia construidos a partir de 8.494 prompts, con correspondencia uno a uno sin reutilización: la respuesta elegida proviene de una trayectoria de `Qwen/Qwen3.8-27B` que superó un juez binario estricto (puntuación 1) y la rechazada, de una trayectoria del propio `Qwen3.5-4B-Base` que lo falló (puntuación 0). La mezcla de 8 fuentes incluye `agentalign_harmful` (3.691 pares), `codesafetybench` (913), `difficult_advice` (5.852), `star1_gp3` (692), `agentalign_benign` (5.263), `magicoder` (1.940), `star_benign_v2` (1.063) y `wildjailbreak_benign` (2.771). El entrenamiento se ejecuta con Slime + Megatron-LM, cómputo en bf16 con estado del optimizador en fp32, paralelismo tensorial 4, 2 épocas × 347 actualizaciones de 64 pares, learning rate pico 1e-6 con calentamiento lineal del 10 % y decaimiento coseno hasta 2e-7, Adam con betas [0.9, 0.95], eps 1e-8, weight decay 0.0 y recorte de gradiente 1.0. Las trayectorias que exceden los 32.768 tokens se descartan completas, nunca se truncan. El prompt del estudiante usa la plantilla nativa de chat Base con el system prompt "You are a helpful assistant." y thinking activado, sin Model Spec adicional.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat nativa y modo thinking activable.
- Razonamiento de varios pasos y cadenas de pensamiento (thinking mode) heredadas del base.
- Llamadas a herramientas (tool calling) dentro de las trayectorias de entrenamiento, incluidas en el objetivo DPO.
- Capacidades multimodales de entrada imagen-texto (`image-text-to-text`), aunque la torre de visión no se ha reentrenado en este checkpoint.
- Comportamiento alineado en seguridad: reducción de respuestas dañinas, resistencia a jailbreaks y manejo de consejos sensibles, gracias a la mezcla de datos de seguridad (`agentalign_harmful`, `wildjailbreak_benign`, `difficult_advice`).
- Capacidades de código preservadas y reforzadas con datos de `codesafetybench` y `magicoder`.
- Capacidades multilingües: no disponibles de forma explícita en la información proporcionada.

## Casos de uso

- Evaluación de alineamiento y seguridad: el checkpoint permite comparar el comportamiento del base frente a una versión ajustada con DPO en prompts dañinos, jailbreaks y consejos difíciles, usando las mismas plantillas y el mismo juez binario.
- Asistente conversacional con salvaguardas: al mantener la plantilla de chat Base y 32.768 tokens de contexto, puede gestionar conversaciones multi-turno con contexto largo aplicando las preferencias de seguridad aprendidas.
- Investigación en DPO y mezclas de datos: al publicarse como snapshot intermedio (paso 174 de 694) con receta detallada, sirve para estudiar la evolución de la alineación a lo largo del entrenamiento y comparar checkpoints (87, 174, 260, 347, 434, 521, 607, 694).
- Generación de código con conciencia de seguridad: los datos de `codesafetybench` y `magicoder` permiten usar el modelo en pipelines de revisión de código donde se prioriza evitar sugerencias inseguras o maliciosas.
- Agentes con tool calling: el objetivo DPO incluye llamadas a herramientas, por lo que el modelo es adecuado para prototipos de agentes que combinan razonamiento y ejecución de funciones.
- Filtrado y moderación de contenido: puede emplearse como generador de referencia en sistemas de moderación que necesitan producir alternativas seguras a peticiones problemáticas.
- Investigación multimodal ligera: al conservar la torre de visión del base, permite experimentar con entradas imagen-texto sin reentrenar el componente visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 9,3 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomiendan 16-24 GB para inferencia cómoda con contexto largo.
- GPU recomendadas: H100 80 GB (usadas en el entrenamiento, 4× H100 con tensor parallel 4), A100 80 GB, L40S, RTX 4090 (24 GB) para bf16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) o RTX 3090 (24 GB) en bf16 con contexto reducido; en GPUs de 16 GB requeriría cuantización, no documentada oficialmente.
- Opciones de despliegue: `transformers` (soporte nativo de `Qwen3_5ForConditionalGeneration`), `endpoints_compatible` según los tags; vLLM, TGI, llama.cpp u Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-T1B0-genv2gp3-lr1e-6-step174 | 4,66 B | 32.768 | Apache 2.0 | Checkpoint DPO intermedio (paso 174/694) sobre Qwen3.5-4B-Base |
| Qwen/Qwen3.5-4B-Base | 4 B (aprox.) | no disponible | Apache 2.0 | Modelo base sin ajuste de seguridad; referencia congelada del DPO |
| Qwen/Qwen3.8-27B | 27 B (aprox.) | no disponible | no disponible | Modelo profesor que generó las respuestas elegidas en el DPO |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 174 de 694, ~50 % de 2 épocas): el entrenamiento sigue en curso y no representa el modelo final; el comportamiento puede ser inestable o inconsistente.
- Riesgo de alucinación inherente al modelo base y no cuantificado en la información disponible.
- Sesgos conocidos: no documentados explícitamente; los sesgos del base Qwen3.5-4B-Base pueden persistir.
- Idiomas soportados no especificados; el rendimiento fuera del inglés no está garantizado.
- El DPO se entrenó con un juez binario estricto y un profesor de 27 B; puede heredar sesgos del juez y del profesor, y sobreajustarse a los estilos de respuesta del profesor.
- Las trayectorias de más de 32.768 tokens se descartan, lo que puede limitar el aprendizaje en contextos muy largos.
- La torre de visión y la cabeza MTP no se han entrenado: las capacidades multimodales son las del base y no se han alineado en seguridad.
- Licencia Apache 2.0 permite uso comercial, pero al ser un snapshot de investigación conviene validar su comportamiento antes de producción.
- El identificador del modelo es extremadamente largo y específico de la ejecución; conviene fijar el snapshot por hash para reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-T1B0-genv2gp3-lr1e-6-step174
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Modelo profesor (generador de respuestas elegidas): https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio Slime (framework de entrenamiento): https://github.com/THUDM/slime
- Megatron-LM: https://github.com/NVIDIA/Megatron-LM
