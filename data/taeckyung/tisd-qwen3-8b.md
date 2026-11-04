# Taeckyung/TISD-Qwen3-8B

## Resumen

TISD-Qwen3-8B es un ajuste fino de Qwen/Qwen3-8B desarrollado por Taeckyung Lee (KAIST, grupo MIIL) mediante una técnica de auto-destilación en política denominada TISD (Trajectory-Intervention Self-Distillation). El modelo está especializado en generación de código y razonamiento sobre problemas de programación competitiva, y se entrena sobre el split de entrenamiento de LiveCodeBench v6 con feedback de ejecución enriquecido. Su relevancia radica en que demuestra que una intervención quirúrgica en las trayectorias fallidas durante la auto-destilación puede casi duplicar la precisión en benchmarks de código con un coste de entrenamiento muy bajo (80 pasos).

Arquitectónicamente hereda íntegramente la estructura de Qwen3-8B: un transformer decoder-only denso de 8.190.735.360 parámetros, sin mezcla de expertos, con los mismos pesos de tokenizador, plantilla de chat y ventana de contexto del modelo base. El checkpoint publicado es un merge en bf16 del actor FSDP resultante del entrenamiento, por lo que es directamente compatible con el ecosistema transformers y con TGI.

El modelo es relevante ahora porque propone una metodología de entrenamiento (TISD) publicada en arXiv y con código abierto, y porque ofrece una mejora medible y sustancial en LiveCodeBench v6 (Avg@4 del 27,5 % al 49,6 %) manteniendo la licencia Apache 2.0 del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen3) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-8B) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en bf16) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, merge del checkpoint FSDP) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del transformer denso Qwen3-8B. No se modifica la arquitectura: se conservan las capas, el tokenizador y la plantilla de chat del modelo base. El entrenamiento se realiza con la técnica TISD, una variante de auto-destilación en política (on-policy self-distillation) en la que el profesor es el mismo modelo condicionado a contexto privilegiado (un rollout hermano exitoso o feedback de ejecución). Para cada rollout fallido, TISD localiza la posición de máxima divergencia profesor-alumno, fuerza en esa posición el token preferido por el profesor, deja que el alumno regenere el resto de la respuesta y destila la trayectoria resultante hacia el profesor con contexto privilegiado usando el objetivo SDPO.

El entrenamiento se ejecuta durante 80 pasos con un batch de 32 prompts y 8 rollouts por prompt, tasa de aprendizaje 1e-6, sobre GPUs NVIDIA B200 con verl FSDP. Los datos provienen de LiveCodeBench v6, cuyo split de entrenamiento expone el 50 % de los tests de cada problema, lo que proporciona feedback de ejecución enriquecido. Los pesos finales son un merge en bf16 del actor FSDP en el paso 80. No se documentan en la información disponible fases de RLHF o DPO adicionales.

## Capacidades

- Generación de código y razonamiento sobre problemas de programación competitiva, con especial énfasis en corrección funcional verificable mediante tests.
- Resolución de problemas de algoritmia y estructuras de datos del estilo LiveCodeBench.
- Generación de texto general y conversación, heredada del modelo base Qwen3-8B.
- Soporte de tool calling y function calling: no disponible en la información proporcionada (no se documenta explícitamente para este checkpoint).
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada para este checkpoint.
- Uso de la plantilla de chat del modelo base Qwen3-8B.

## Casos de uso

- Generación de soluciones a problemas de programación competitiva: el modelo está entrenado específicamente sobre LiveCodeBench v6 y puede generar soluciones completas a problemas algorítmicos; es adecuado para evaluaciones automáticas con tests ocultos y para pipelines de generación de candidatos en entornos de jueces en línea.
- Asistente de resolución de bugs en código: dado un fragmento de código y feedback de ejecución (traza de error o tests fallidos), el modelo puede regenerar la parte defectuosa; el entrenamiento con feedback de ejecución privilegiado lo hace especialmente apto para este escenario.
- Generación de tests unitarios y casos de prueba: puede producir entradas y aserciones para validar funciones, aprovechando su exposición a tests durante el entrenamiento.
- Enseñanza de algoritmia: puede explicar y resolver problemas paso a paso usando la plantilla de chat del modelo base, útil en plataformas educativas de programación.
- Evaluación comparativa de técnicas de post-entrenamiento: sirve como checkpoint de referencia para reproducir y comparar TISD frente a otras técnicas de auto-destilización, dado que el código y el paper están disponibles.
- Investigación en auto-destilación: es un artefacto reproducible para estudiar el efecto de la intervención de trayectorias en la destilación en política, con hiperparámetros documentados en el paper y el repositorio.
- Generación de código en producción con verificación: puede integrarse en pipelines de CI/CD donde las soluciones generadas se validan contra una suite de tests antes de aceptarse, aprovechando su mayor tasa de acierto en problemas verificables.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre LiveCodeBench v6 (131 problemas):

| Modelo | Avg@4 (%) | Pass@4 (%) |
|---|---|---|
| Qwen/Qwen3-8B (base) | 27,5 | 36,1 |
| TISD-Qwen3-8B (este checkpoint, paso 80) | 49,6 | 50,4 |

Avg@4 es la tasa media de tests superados sobre 4 muestras por problema; Pass@4 cuenta un problema como resuelto si alguna de las 4 muestras supera todos los tests ocultos. Los números corresponden a este checkpoint exacto (paso 80 de entrenamiento). La Tabla 1 del paper reporta el mejor paso de validación, promediado sobre ejecuciones cuando existen varias. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16,4 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomiendan 24 GB o más para contextos moderados.
- VRAM estimada en cuantización de 8 bits: aproximadamente 8-9 GB para pesos; en 4 bits, aproximadamente 4-5 GB para pesos (estimaciones a partir del número de parámetros; no se documentan cuantizaciones oficiales en la información disponible).
- GPU recomendadas: NVIDIA B200 (usada en entrenamiento), A100 40/80 GB, H100 80 GB para inferencia en bf16 sin cuantizar con contexto largo.
- GPU de consumo: cabe en RTX 4090 (24 GB) en bf16 con contexto moderado; en RTX 3090 (24 GB) de forma similar; en GPUs de 16 GB requiere cuantización.
- Opciones de despliegue: transformers (documentado en la model card), text-generation-inference (etiqueta `text-generation-inference` en el repo) y endpoints compatibles; otras opciones como vLLM, llama.cpp u Ollama no se documentan explícitamente en la información disponible.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | LiveCodeBench v6 Avg@4 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TISD-Qwen3-8B | 8,19 B (denso) | no disponible | 49,6 % | Apache 2.0 | HuggingFace |
| Qwen/Qwen3-8B | 8,19 B (denso) | no disponible | 27,5 % | Apache 2.0 | HuggingFace |
| Otros modelos de 8B especializados en código | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación directa documentada es con el modelo base Qwen3-8B, sobre el que TISD-Qwen3-8B mejora en 22,1 puntos porcentuales en Avg@4 y 14,3 puntos en Pass@4. No se dispone de datos de benchmarks frente a otras alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El entrenamiento se limita a 80 pasos sobre LiveCodeBench v6; el modelo puede sobreajustar al estilo y distribución de ese benchmark y no generalizar igual de bien a otros dominios de código.
- Los resultados reportados corresponden a un único checkpoint (paso 80) y a un único benchmark; no hay evidencia publicada de rendimiento en MMLU, HumanEval, GSM8K u otras tareas en la información disponible.
- Riesgo de alucinación inherente a los modelos de lenguaje: puede generar código sintácticamente plausible pero funcionalmente incorrecto, especialmente fuera del dominio de programación competitiva.
- Sesgos conocidos: no disponible en la información proporcionada; al heredar el modelo base, arrastra los sesgos de Qwen3-8B, no documentados aquí.
- Limitaciones de idioma: no se documentan los idiomas soportados; el entrenamiento se centra en problemas de código, predominantemente en inglés.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al ser una versión modificada de Qwen3-8B conviene revisar los términos del modelo base y citar el paper y el modelo original.
- En producción, es recomendable validar las salidas con tests automáticos antes de aceptar código generado, dado el carácter verificable pero no garantizado de la corrección.
- No se documentan capacidades de tool calling, agentes ni modo thinking para este checkpoint concreto; no deben asumirse sin validación empírica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Taeckyung/TISD-Qwen3-8B
- Paper (arXiv:2609.30878): https://arxiv.org/abs/2609.30878
- Código: https://github.com/taeckyung/TISD
- Página del proyecto: https://miil.kaist.ac.kr/projects/tisd/
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Dataset: https://huggingface.co/datasets/livecodebench/code_generation_lite
