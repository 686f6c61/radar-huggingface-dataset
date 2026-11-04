# Taeckyung/TISD-OLMo3-7B-Instruct

## Resumen

TISD-OLMo3-7B-Instruct es un ajuste fino de `allenai/Olmo-3-7B-Instruct` desarrollado por Taeckyung Lee (KAIST, grupo MIIL) que aplica TISD (Trajectory-Intervention Self-Distillation), una variante de auto-destilación on-policy orientada a mejorar la generación de código. El modelo parte de la arquitectura OLMo 3 de 7.298 millones de parámetros y se entrena durante 80 pasos sobre el split de entrenamiento de LiveCodeBench v6, utilizando feedback de ejecución como contexto privilegiado del profesor.

La innovación no reside en la arquitectura, que es la del modelo base, sino en el procedimiento de entrenamiento: para cada rollout fallido se localiza la posición de máxima divergencia entre profesor y estudiante, se fuerza el token preferido por el profesor en ese punto y se deja que el estudiante regenere el resto de la trayectoria, que después se destila con el objetivo SDPO. El resultado reportado es un salto en LiveCodeBench v6 de 32,1 a 51,0 en Avg@4 y de 42,7 a 53,4 en Pass@4 respecto al modelo base.

Es relevante ahora porque demuestra que un ajuste relativamente barato (80 pasos, batch de 32 prompts con 8 rollouts cada uno) sobre un modelo abierto de 7B puede producir ganancias sustanciales en tareas de código verificable, sin necesidad de un profesor externo de mayor tamaño. La licencia Apache 2.0 y el formato safetensors en bf16 facilitan su integración en pipelines existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo 3), no disponible el detalle de capas y dimensiones |
| Parametros totales | 7.298.011.136 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; al ser pesos bf16 es cuantizable a GGUF/AWQ con herramientas estándar, sin receta oficial publicada |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, fusionados desde el checkpoint FSDP del actor) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura OLMo 3 de AllenAI en su variante Instruct de 7B, un transformer decoder-only denso. No se introducen cambios estructurales: el checkpoint es un fine-tune del modelo base con los pesos fusionados en bf16. La carga requiere `transformers>=4.57` por la arquitectura OLMo 3 y utiliza la plantilla de chat del modelo base.

El entrenamiento aplica TISD sobre LiveCodeBench v6, cuyo split de entrenamiento expone el 50 % de los tests de cada problema. Para cada rollout fallido, el procedimiento (1) localiza la posición de máxima divergencia profesor-estudiante, (2) fuerza en ella el token preferido por el profesor, (3) deja que el estudiante regenere el resto de la respuesta y (4) destila la trayectoria resultante hacia el profesor con contexto privilegiado mediante el objetivo SDPO. Se ejecutaron 80 pasos con batch de 32 prompts y 8 rollouts por prompt, learning rate de 1e-6, sobre GPUs NVIDIA B200 con verl y FSDP. No se especifica el número total de tokens de entrenamiento ni la composición completa del dataset más allá de LiveCodeBench v6.

## Capacidades

- Generación de texto conversacional con la plantilla de chat del modelo base OLMo 3 Instruct.
- Generación de código orientada a problemas verificables con tests, el dominio principal del ajuste.
- Razonamiento multi-paso sobre enunciados de programación y feedback de ejecución, adquirido vía destilación de trayectorias.
- Capacidad de autocorrección implícita: el entrenamiento con intervención en el punto de divergencia favorece la recuperación tras errores locales en la trayectoria.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible; depende de las capacidades heredadas del modelo base.
- Soporte de agentes: no documentado en la model card.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, visión, audio): no documentadas para este checkpoint.

## Casos de uso

- Generación de código en producción con verificación por tests: el modelo está optimizado para producir soluciones que pasan baterías de tests ocultos, medido en LiveCodeBench v6, por lo que encaja en pipelines que validan el código generado antes de fusionarlo.
- Asistente de programación competitiva: el ajuste se realizó sobre problemas de LiveCodeBench, un benchmark de estilo competitivo, lo que lo hace adecuado para entornos de práctica y evaluación algorítmica.
- Reparación automática de código fallido: la destilación con feedback de ejecución entrena al modelo para corregir trayectorias tras errores, útil en bucles de autoreparación dentro de CI/CD.
- Generación de tests unitarios y casos límite: al haber sido expuesto a tests parciales durante el entrenamiento, puede emplearse para proponer casos de prueba adicionales sobre funciones existentes.
- Evaluación comparativa de técnicas de post-entrenamiento: sirve como checkpoint de referencia para reproducir TISD frente a RLHF, DPO u otras variantes de auto-destilación sobre el mismo modelo base.
- Fine-tuning posterior específico de dominio: al ser Apache 2.0 y safetensors bf16, puede usarse como punto de partida para ajustes en dominios de código concretos (por ejemplo, SQL o infraestructura) con menor coste que partir del base.
- Investigación en auto-destilación on-policy: el checkpoint en el paso 80 permite analizar la evolución de la divergencia profesor-estudiante y validar el método en otros modelos de 7B.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre LiveCodeBench v6 (131 problemas):

| Modelo | Avg@4 (%) | Pass@4 (%) |
|---|---|---|
| allenai/Olmo-3-7B-Instruct (base) | 32,1 | 42,7 |
| TISD-OLMo3-7B-Instruct (paso 80) | 51,0 | 53,4 |

Avg@4 es la tasa media de tests superados sobre 4 muestras por problema; Pass@4 cuenta un problema como resuelto si alguna de las 4 muestras pasa todos los tests ocultos. Los valores corresponden exactamente a este checkpoint (paso 80); la Tabla 1 del paper reporta el mejor paso de validación promediado sobre ejecuciones. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 14,6 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda 24 GB o más para contexto moderado.
- Cuantización a 8 bits: en torno a 8 GB de pesos; a 4 bits, en torno a 4-5 GB, aunque no hay receta oficial publicada para este checkpoint.
- GPU recomendadas: A100 40/80 GB, H100, B200 para entrenamiento e inferencia de referencia; RTX 4090 (24 GB) viable en bf16 con contexto contenido o en cuantización de 8/4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en bf16 con gestión cuidadosa de contexto, y en GPUs de 12-16 GB con cuantización.
- Opciones de despliegue: transformers (requiere >=4.57), vLLM y TGI previsiblemente compatibles al ser arquitectura OLMo 3 estándar; llama.cpp y Ollama requieren conversión a GGUF, no publicada oficialmente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | LiveCodeBench v6 (Avg@4 / Pass@4) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TISD-OLMo3-7B-Instruct | 7,30B | no disponible | 51,0 / 53,4 | Apache 2.0 | HuggingFace |
| allenai/Olmo-3-7B-Instruct | 7B (clase) | no disponible | 32,1 / 42,7 | Apache 2.0 | HuggingFace |
| Alternativas de 7B orientadas a código (Qwen2.5-Coder-7B, DeepSeek-Coder-7B) | ~7B | no disponible en esta ficha | no disponible | varía (Apache 2.0 en Qwen2.5-Coder) | HuggingFace |

La comparación directa con modelos de código de 7B de otros linajes no puede completarse con los datos disponibles; los valores de LiveCodeBench v6 para esas alternativas no se han proporcionado y no se inventan aquí.

## Limitaciones y advertencias

- El ajuste se realizó exclusivamente sobre LiveCodeBench v6, por lo que puede sobreajustarse al estilo y distribución de ese benchmark y degradar capacidades generales del modelo base.
- Riesgo de alucinación en código: el modelo puede generar APIs o funciones inexistentes, especialmente fuera de los lenguajes y patrones cubiertos por LiveCodeBench.
- Sesgos: no se documenta ninguna evaluación de sesgos; al heredar del modelo base, arrastra los suyos sin mitigación adicional.
- Idiomas: no se especifican los idiomas soportados; la mayor parte del entrenamiento se realizó sobre problemas de código, habitualmente en inglés.
- Contexto: la longitud de contexto no está confirmada en la información disponible; no debe asumirse la del modelo base sin verificarla.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías y el modelo se distribuye como checkpoint de investigación (0 descargas, 1 like en el momento de la ficha).
- Requiere `transformers>=4.57`; versiones anteriores fallarán al cargar la arquitectura OLMo 3.
- Los resultados reportados provienen del propio autor y no han sido replicados de forma independiente en la información disponible.

## Enlaces

- HuggingFace: https://huggingface.co/Taeckyung/TISD-OLMo3-7B-Instruct
- Paper (arXiv:2609.30878): https://arxiv.org/abs/2609.30878
- Repositorio de código: https://github.com/taeckyung/TISD
- Página del proyecto: https://miil.kaist.ac.kr/projects/tisd/
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Instruct
- Dataset: https://huggingface.co/datasets/livecodebench/code_generation_lite
