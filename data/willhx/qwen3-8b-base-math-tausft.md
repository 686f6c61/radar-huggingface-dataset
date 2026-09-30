# willhx/Qwen3-8B-Base-Math-TauSFT

## Resumen

Qwen3-8B-Base-Math-TauSFT es un ajuste fino supervisado (SFT) publicado por el usuario willhx sobre una cadena de modelos derivada de Qwen3-8B-Base. El modelo parte del checkpoint willhx/Qwen3-8B-Base-Math (a su vez derivado de Qwen3-8B-Base de Qwen) y aplica un entrenamiento SFT orientado a interacciones de tipo tau-bench, el benchmark de agentes con herramientas y simulación de usuario. El resultado es un checkpoint de 8.190.735.360 parámetros (8,19 mil millones) en BF16, con arquitectura transformer densa heredada de la familia Qwen3 y licencia Apache 2.0.

Su relevancia es acotada y muy específica: no es un modelo de propósito general afinado con RLHF, sino una etapa intermedia de un pipeline de entrenamiento de agentes. La model card indica explícitamente que este repositorio contiene la fase TauSFT previa al RL posterior sobre tau-bench, y que no se incluyen ni los datos ni los estados del optimizador. El entrenamiento usó 25.956 registros tokenizados procedentes de rollouts de Qwen3-32B sobre tau-bench, con 405 actualizaciones y una pérdida final de SFT de 0,3738237.

El interés para desarrolladores es doble: por un lado, sirve como caso de estudio de un pipeline de destilación y ajuste para tareas de tool calling multi-turno; por otro, es un checkpoint reproducible (paso 405, semilla de datos declarada) que puede reutilizarse como punto de partida para RL sobre entornos tipo retail. El repositorio no incluye benchmarks publicados, no declara idiomas en sus metadatos y no ofrece cuantizaciones alternativas a BF16.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (familia Qwen3); configuración de arquitectura preservada de Qwen3-8B-Base |
| Parámetros totales | 8.190.735.360 (8,19 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens según descripciones de terceros del modelo base Qwen3-8B; no declarada en la model card de este checkpoint |
| Tipos de cuantización | BF16 nativo (safetensors). No se publican versiones GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | No disponible en los metadatos del repositorio. La base Qwen3-8B se describe en fuentes de terceros como preentrenada en 119 idiomas; la herencia no está verificada en este checkpoint |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16), librería transformers |
| Modelo base | willhx/Qwen3-8B-Base-Math (relación: finetune) |
| Linaje | Qwen/Qwen3-8B-Base → willhx/Qwen3-8B-Base-Math → TauSFT |
| Tamaño del repositorio | 16,4 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación (metadatos) | 2026-09-29 |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal denso de la familia Qwen3, con tokenizador y configuración de arquitectura idénticos a Qwen3-8B-Base, tal y como declara el autor. No hay innovaciones arquitectónicas propias en este repositorio: se trata de un export de pesos completos en BF16 del checkpoint final de la etapa TauSFT. Según fuentes de terceros, la base Qwen3-8B se preentrenó sobre 36 billones de tokens con un proceso de tres etapas que enfatiza modelado de lenguaje general, razonamiento (STEM y código) y comprensión de contexto largo de hasta 32.768 tokens; este checkpoint hereda esas características sin modificarlas.

El entrenamiento específico de esta etapa es un SFT sobre 25.956 registros tokenizados procedentes de datos de rollout de Qwen3-32B sobre tau-bench (fichero sft_data.jsonl), lo que configura un caso de destilación desde un modelo mayor hacia un 8B en un dominio de agentes con herramientas. Se realizaron 405 actualizaciones con un epoch configurado, batch global de 64, optimizador Adam, tasa de aprendizaje 1e-5 con decaimiento coseno hasta 1e-6 y un 10 % de warmup. La pérdida final de entrenamiento reportada es 0,3738237. No se documenta uso de RLHF, DPO ni decodificación especulativa en esta etapa; el autor indica que el RL sobre tau-bench es una fase posterior, no incluida en este repositorio. Tampoco se incluyen los datos de entrenamiento ni los estados del optimizador.

## Capacidades

- Generación de texto conversacional en formato de chat, con plantilla de chat de Qwen3 aplicada mediante `apply_chat_template`.
- Tool calling / function calling en el formato de tau-bench, aprendido a partir de rollouts de Qwen3-32B sobre ese entorno; requiere aportar los esquemas de herramientas y la política del dominio (por ejemplo, retail) para reproducir las interacciones completas.
- Razonamiento multi-turno y multi-paso orientado a agentes, dado que los datos de SFT provienen de interacciones agente-usuario-herramienta.
- Finalización de turno controlada: el ejemplo del autor detiene la generación tanto en el token EOS base como en `<|im_end|>`.
- Modo thinking: la plantilla de chat expone el parámetro `enable_thinking` y el ejemplo lo desactiva (`enable_thinking=False`); no se documenta el comportamiento ni la calidad del modo thinking en este checkpoint.
- Capacidades multilingües: no verificadas en este checkpoint; serían heredadas del modelo base (119 idiomas según fuentes de terceros).
- Visión y audio: no soportados (modelo exclusivamente de texto).
- Capacidades matemáticas: el linaje incluye una etapa "Math" (willhx/Qwen3-8B-Base-Math), pero este repositorio no publica evaluaciones que cuantifiquen dicha capacidad tras el SFT de tau-bench.

## Casos de uso

- Agentes de atención al cliente en dominio retail: el modelo puede gestionar conversaciones multi-turno en las que consulta catálogo, precios y políticas mediante herramientas, ya que fue ajustado precisamente sobre rollouts de tau-bench con política retail. Requiere inyectar los esquemas de herramientas y las reglas del negocio.
- Automatización de resolución de incidencias con API: se puede integrar como planificador que decide qué herramienta invocar en cada paso y encadena varias llamadas hasta resolver el ticket, aprovechando que el SFT se hizo sobre trayectorias completas y no sobre turnos aislados.
- Investigación en entrenamiento de agentes: sirve como punto de partida reproducible para aplicar RL posterior o para comparar estrategias de SFT frente a RL en entornos tipo tau-bench, dado que el autor publica el número de paso, el tamaño del dataset y la pérdida final.
- Destilación de modelos grandes a 8B: es un ejemplo práctico de destilación de datos de rollout de un modelo de 32B a un modelo de 8B para una tarea concreta, útil para equipos que quieran replicar el procedimiento con sus propios datos.
- Generación de datos sintéticos de interacción con herramientas: el modelo puede generar trayectorias candidatas de agente que después se filtran para construir datasets de SFT o de preferencias.
- Simulación de usuario en entornos de evaluación: al haberse entrenado con datos de tau-bench, puede emplearse para generar respuestas de usuario plausibles en pruebas de agentes, siempre que se valide previamente su fidelidad al guion del entorno.
- Base para ajustes verticales: al ser un checkpoint denso de 8,19 B con licencia Apache 2.0, puede servir como inicialización para LoRA o SFT completo en dominios con herramientas propias (logística, banca, soporte técnico).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de entrenamiento (pérdida final de SFT de 0,3738237 sobre 405 actualizaciones), que no constituyen una evaluación de rendimiento y no son comparables con métricas de benchmarks estándar. No hay datos de MMLU, HumanEval, GSM8K, tau-bench ni de ningún otro conjunto de evaluación asociados a este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16 (a partir del número de parámetros; el repositorio ocupa 16,4 GB en pesos): aproximadamente 18-20 GB con caché KV moderada y overhead del runtime.
- VRAM estimada en INT8/FP8: aproximadamente 9-11 GB.
- VRAM estimada en INT4 (por ejemplo GGUF Q4_K_M tras conversión): aproximadamente 5-7 GB.
- GPU recomendadas para BF16: A100 40/80 GB, H100, L40S 48 GB. En RTX 4090 o RTX 3090 (24 GB) el modelo cabe en BF16 con contexto corto o moderado, con poco margen para batch grande.
- Consumer GPU: cabe en GPUs de 24 GB en BF16 y en GPUs de 16 GB solo tras cuantización a INT4/INT8; en 8-12 GB únicamente con cuantizaciones agresivas y contexto reducido.
- Opciones de despliegue: vLLM, Hugging Face TGI (el repositorio está etiquetado como `text-generation-inference` y `endpoints_compatible`) y transformers. llama.cpp u Ollama son viables solo tras convertir los pesos a GGUF, conversión que el autor no publica.
- Latencia y throughput: no disponible. No hay mediciones publicadas de tokens por segundo ni de latencia por petición para este checkpoint.

## Comparativa con modelos similares

No se dispone de datos verificados de alternativas externas al linaje en la información consultada, por lo que la comparación se limita a los modelos de la misma cadena de entrenamiento.

| Modelo | Parámetros | Contexto | Datos de evaluación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| willhx/Qwen3-8B-Base-Math-TauSFT (este) | 8,19 B | 32.768 tokens (heredado, no declarado en la model card) | No publicados; pérdida de SFT 0,3738237 | apache-2.0 | Pesos BF16 en HuggingFace, 0 descargas |
| willhx/Qwen3-8B-Base-Math (etapa previa) | No disponible en los metadatos consultados | No disponible | No disponible | No disponible en la información consultada | Pesos en HuggingFace |
| Qwen/Qwen3-8B-Base (raíz del linaje) | 8,19 B (familia Qwen3-8B) | 32.768 tokens según descripciones de terceros | No disponible | No disponible en la información consultada | Pesos en HuggingFace |
| willhx/Qwen3-8B-Base-Math-SeaSFT-Search-TauSFT (variante del mismo autor) | No disponible | No disponible | No disponible | No disponible | Pesos en HuggingFace |

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks publicados, por lo que no es posible afirmar su calidad en tau-bench, matemáticas, código o razonamiento general. La pérdida de entrenamiento no es un indicador válido de rendimiento en producción.
- Riesgo de alucinación inherente a un modelo de 8,19 B ajustado de forma supervisada: no consta ningún alineamiento posterior (RLHF, DPO o RL) en esta etapa, lo que reduce el control sobre salidas fuera de distribución.
- Dependencia fuerte del entorno: el modelo card advierte de que para reproducir interacciones completas de tau-bench hay que aportar la política retail, los esquemas de herramientas y el entorno. Sin ellos, el comportamiento de tool calling puede degradarse.
- Sesgos: no se documenta ninguna auditoría de sesgos ni composición del dataset de SFT más allá del recuento de registros, por lo que se desconoce qué sesgos pueden haberse heredado del modelo base o de los rollouts de Qwen3-32B.
- Idiomas: los metadatos no declaran idiomas soportados. Cualquier uso multilingüe es una extrapolación no verificada del modelo base.
- Contexto: la cifra de 32.768 tokens proviene de descripciones de terceros del modelo base y no está confirmada para este checkpoint; conviene validarla empíricamente antes de diseñar aplicaciones con contexto largo.
- Licencia: Apache 2.0, lo que en principio permite uso comercial. Aun así, conviene revisar la licencia y condiciones del modelo base Qwen3-8B-Base, ya que este repositorio es un derivado.
- Madurez: el repositorio tiene 0 descargas y 0 likes, y la fecha de creación registrada (2026-09-29) resulta anómala. No hay evidencia de uso en producción ni de validación por terceros.
- Sin cuantizaciones oficiales: desplegar en hardware limitado exige convertir los pesos a GGUF, AWQ o GPTQ por cuenta propia, con el riesgo de degradación que ello implica.
- Formato de parada: el ejemplo oficial obliga a detener la generación en `<|im_end|>` además del EOS base; omitir esta configuración puede producir texto basura al final de las respuestas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/willhx/Qwen3-8B-Base-Math-TauSFT
- Modelo base (etapa Math): https://huggingface.co/willhx/Qwen3-8B-Base-Math
- Raíz del linaje: https://huggingface.co/Qwen/Qwen3-8B-Base
- Variante del mismo autor: https://huggingface.co/willhx/Qwen3-8B-Base-Math-SeaSFT-Search-TauSFT
- Variante adicional (espejo en terceros): https://featherless.ai/models/willhx/Qwen3-8B-Base-Math-SeaSFT-Search-TauSFT-Tau
- Ficha del modelo base en un espejo: https://dev.modelhub.org.cn/willhx/Qwen3-8B-Base-Math
- Despliegue del modelo base en terceros: https://featherless.ai/models/willhx/Qwen3-8B-Base-Math
