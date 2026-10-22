# XHToken/Spark-X2.6-4B-INT8

## Resumen

Spark-X2.6-4B-INT8 es la versión cuantizada a 8 bits del modelo Spark-X2.6-4B, un LLM compacto de propósito general desarrollado por XHToken (familia SparkLLM) y orientado explícitamente al despliegue en dispositivo (*on-device*). Con 4.112.079.360 parámetros (4,11 mil millones) y un repositorio de 4,5 GB en formato safetensors, el modelo se presenta como la evolución de Spark-X2.5-4B: conserva exactamente la misma arquitectura que su predecesor y obtiene sus mejoras de capacidades mediante un post-entrenamiento reforzado, no mediante cambios estructurales. Los ámbitos en los que el autor declara mejoras sustanciales son código, flujos agénticos con uso de herramientas, contexto largo, multilingüismo y razonamiento.

El modelo resulta relevante porque compite en la franja de los 4B con propuestas como Qwen3.5-4B o Gemma-E4B, y el autor afirma que iguala o supera a modelos de aproximadamente 9B parámetros en varias pruebas. Incorpora un presupuesto de razonamiento configurable en tres niveles (ninguno, bajo, alto), lo que permite ajustar latencia, coste de inferencia y calidad de razonamiento por aplicación. Esta ficha cubre específicamente la variante INT8, pensada para reducir huella de memoria en equipos con recursos limitados.

La información disponible no permite verificar de forma independiente estas afirmaciones: la model card incluye gráficas de benchmarks como imágenes, pero no tablas con valores numéricos extraíbles, y el repositorio no publica resultados en texto. La licencia Apache 2.0 facilita su adopción comercial, aunque la necesidad de `trust_remote_code` y de runtimes específicos condiciona la integración.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; la model card indica que es "exactamente la misma arquitectura que Spark-X2.5-4B" (transformer, sin confirmación de componentes MoE o híbridos) |
| Parámetros totales | 4.112.079.360 (4,11B) |
| Parámetros activos | No aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | Hasta 1.048.576 tokens en el ejemplo de despliegue con SGLang de la model card (valor configurable mediante `--context-length`; requiere memoria de dispositivo suficiente) |
| Tipos de cuantización | INT8 (8 bits) mediante `compressed-tensors`; el modelo base se distribuye en su precisión original |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, requiere `custom_code` / `trust_remote_code=True`) |

## Arquitectura y entrenamiento

XHToken describe Spark-X2.6-4B como una evolución de Spark-X2.5-4B que mantiene la arquitectura intacta y concentra todas las ganancias en el post-entrenamiento. No se especifican en la información disponible el número de capas, la dimensionalidad del modelo, el tipo de atención, el tamaño de vocabulario ni la composición exacta del dataset de entrenamiento. Tampoco se detalla si se emplearon técnicas de RLHF, DPO u otras variantes de alineación, ni el volumen de tokens de entrenamiento.

La innovación técnica documentada es el presupuesto de razonamiento controlable en tres niveles (ninguno, bajo, alto), que la aplicación puede fijar en tiempo de generación para equilibrar calidad de razonamiento, latencia y coste. En el ejemplo de transformers se activa con `enable_thinking=True` y un `max_new_tokens` de 131.072; en el despliegue con SGLang se emplea `--reasoning-parser qwen3` para separar el razonamiento de la respuesta final. El soporte de *tool calling* se implementa con el parser `spark25` en SGLang, lo que confirma integración con el protocolo de herramientas de la API compatible con OpenAI.

Esta variante INT8 aplica cuantización de 8 bits sobre el checkpoint original mediante `compressed-tensors`, preservando el formato safetensors y la librería transformers. Para cargarla es imprescindible `trust_remote_code=True`, ya que el repositorio incluye código personalizado.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat propia aplicada mediante `apply_chat_template`.
- Razonamiento con presupuesto configurable en tres niveles (ninguno, bajo, alto), activable por petición.
- Programación y tareas de ingeniería de software: el autor declara mejoras sustanciales en código respecto a Spark-X2.5-4B.
- Flujos agénticos: uso complejo de herramientas, planificación multi-paso y ejecución de tareas encadenadas.
- *Tool calling* / *function calling*: soportado en SGLang mediante `--tool-call-parser spark25` y expuesto a través de una API compatible con OpenAI.
- Contexto largo: el ejemplo de despliegue configura 1.048.576 tokens, lo que habilita resúmenes de documentación extensa y conversaciones de muchas iteraciones.
- Matemáticas y tareas de conocimiento general, evaluadas según la model card junto con agente y código.
- Multilingüe limitado a inglés y chino.
- Capacidad adicional de razonamiento separable de la respuesta final (parser de razonamiento en el servidor).
- No se documentan capacidades de visión, audio ni otras modalidades.

## Casos de uso

- **Agentes locales en dispositivo**: el modelo está diseñado para ejecutarse en hardware de borde y soporta *tool calling* con el parser `spark25`, de modo que puede orquestar llamadas a APIs, consultas a bases de datos locales y acciones sobre el sistema operativo sin depender de la nube.
- **Asistente de código en IDE o pipelines de CI/CD**: con 4,11B parámetros en INT8 (4,5 GB de pesos) cabe en GPU de consumo y puede generar parches, explicar errores de compilación o proponer tests dentro de un flujo de integración continua con latencia baja.
- **Atención al cliente automatizada**: los 1.048.576 tokens de contexto configurables permiten mantener el historial completo de una conversación larga o adjuntar manuales y políticas de la empresa sin truncar; el nivel de razonamiento "ninguno" reduce latencia en consultas simples.
- **Procesamiento de documentos extensos en el dispositivo**: contratos, informes técnicos o expedientes de cientos de miles de tokens pueden analizarse en local, evitando enviar datos sensibles a un proveedor externo, con el nivel de razonamiento "alto" para extracción de cláusulas o resúmenes estructurados.
- **Automatización de tareas multi-paso (RPA asistida por LLM)**: planificación y descomposición de flujos administrativos o de back-office, eligiendo dinámicamente el nivel de *thinking* según la complejidad del paso.
- **Aplicaciones móviles y de escritorio con inferencia offline**: al no requerir conectividad y ser Apache 2.0, encaja en asistentes de productividad, correctores o generadores de contenido que deben funcionar sin red.
- **Prototipado rápido de agentes en investigación**: la compatibilidad con transformers 4.57.1 y SGLang (NVIDIA y Ascend NPU) permite montar un servidor compatible con OpenAI en un solo contenedor para experimentar con razonamiento y herramientas.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card referencia gráficas (`images/all_benchmark.svg`, `images/benchmark.svg`, `images/inference.svg`) con comparativas frente a modelos *on-device* de tamaño similar en agente, código, matemáticas, conocimiento general y eficiencia de inferencia, pero los valores no aparecen como texto y no deben inferirse.

Las únicas afirmaciones cualitativas del autor son:

- Rendimiento "mejor de su clase" entre modelos de tamaño comparable.
- Igualdad o superación de modelos de aproximadamente 9.000 millones de parámetros en varios benchmarks.
- Eficiencia de inferencia "igual o mejor" que Qwen3.5-4B y Gemma-E4B.
- Mejoras sustanciales frente a Spark-X2.5-4B en código, agente, contexto largo, multilingüe y razonamiento.

## Requisitos de hardware

- **Pesos**: 4,5 GB en el repositorio (4,11B parámetros en INT8, aproximadamente 4,1 GB de pesos más tokenizador y configuración).
- **VRAM estimada para inferencia**: en torno a 5-6 GB con contexto corto (pesos más caché KV reducida y overhead del runtime). Es una estimación a partir del número de parámetros; no se publica una cifra oficial.
- **Contexto largo**: la model card advierte explícitamente que la configuración de 1.048.576 tokens "requiere suficiente memoria de dispositivo" y recomienda reducir `--context-length` cuando sea necesario. La caché KV a esa longitud es el factor dominante y no se dispone del cálculo exacto (faltan datos de capas y cabezas KV).
- **GPU de consumo**: sí cabe. Una RTX 4090 (24 GB) permite contexto amplio; una RTX 3060 de 12 GB o similar es suficiente para contexto moderado. Cálculo orientativo, no verificado por el autor.
- **GPU de datacenter**: A100 y H100 son compatibles con el despliegue vía SGLang; el ejemplo oficial usa `--tp-size 1` con una sola GPU, por lo que no requiere tensor parallelism para el modelo en sí.
- **Aceleradores NPU**: se documentan imágenes para Ascend A3 (`main-cann9.0.0-a3`) y A2 (`main-cann9.0.0-910b`).
- **Opciones de despliegue**:
  - transformers 4.57.1 con `trust_remote_code=True`, `torch_dtype="auto"` y `device_map="auto"`.
  - SGLang mediante `lmsysorg/sglang:nightly-dev-cu13-20260827-20621aa1` en NVIDIA, con `--mem-fraction-static 0.8`, `--tool-call-parser spark25` y `--reasoning-parser qwen3`.
  - No se mencionan llama.cpp, Ollama, TGI ni GGUF en la información disponible; el repositorio no incluye pesos GGUF.
- **Latencia y throughput**: no disponibles. La model card incluye una gráfica de inferencia comparativa sin valores numéricos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Spark-X2.6-4B-INT8 | 4,11B | Hasta 1.048.576 tokens (configurable) | Apache 2.0 | HuggingFace, transformers y SGLang (NVIDIA y Ascend NPU) | Variante INT8; requiere `trust_remote_code`; inglés y chino |
| Spark-X2.5-4B | No disponible | No disponible | No disponible en la información | HuggingFace (modelo predecesor) | Misma arquitectura; el autor reporta mejoras en código, agente, contexto largo, multilingüe y razonamiento en X2.6 |
| Qwen3.5-4B | No disponible (nombre sugiere ~4B) | No disponible | No disponible | Referenciado por el autor como modelo *on-device* comparable | Usado como referencia de eficiencia de inferencia; no se aportan cifras |
| Gemma-E4B | No disponible | No disponible | No disponible | Referenciado por el autor como modelo *on-device* comparable | Usado como referencia de eficiencia de inferencia; no se aportan cifras |

No se dispone de datos suficientes para comparar rendimiento numérico, contexto efectivo ni licencias de las alternativas; las tres comparaciones se limitan a lo que la model card menciona cualitativamente.

## Limitaciones y advertencias

- **Verificación de benchmarks**: todas las afirmaciones de rendimiento provienen del autor y no hay tablas numéricas públicas en la información disponible; conviene evaluar con un conjunto propio antes de adoptarlo en producción.
- **Riesgo de alucinación**: es un LLM de 4,11B parámetros; cabe esperar confabulación en tareas de conocimiento factual, especialmente con el nivel de razonamiento desactivado.
- **Idiomas**: solo inglés y chino declarados. El rendimiento en castellano no está evaluado ni garantizado y probablemente sea inferior.
- **Cuantización INT8**: la pérdida de calidad frente al modelo base no se documenta; además, el formato `compressed-tensors` exige runtimes compatibles y limita las opciones de despliegue (no hay GGUF para llama.cpp u Ollama).
- **Contexto largo**: 1.048.576 tokens es una configuración de servidor que consume mucha memoria; la calidad de recuperación a esa longitud no está verificada y el ejemplo de transformers genera como máximo 131.072 tokens nuevos.
- **Código personalizado**: requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar antes de usarlo en entornos regulados.
- **Model card heredada**: el README del repositorio INT8 corresponde al modelo base (el *quickstart* apunta a `XHToken/Spark-X2.6-4B`); hay que ajustar el identificador al de esta variante cuantizada.
- **Licencia**: Apache 2.0 permite uso comercial, pero no se detallan los términos de los datos de entrenamiento ni posibles restricciones derivadas de los mismos.
- **Madurez**: 34 descargas y 12 *likes* en el momento de la consulta, con creación el 20 de octubre de 2026; el ecosistema de herramientas en torno al modelo es todavía muy reducido.

## Enlaces

- HuggingFace (esta variante INT8): https://huggingface.co/XHToken/Spark-X2.6-4B-INT8
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Slack de la comunidad: https://join.slack.com/t/tokenspark/shared_invite/zt-432qf8l2f-5~dLyXv8uETr0P0UuC07nw
- Discord: https://discord.gg/kTDE2Hg8aw
- YouTube: https://www.youtube.com/@SparkLLM
- dev.to: https://dev.to/sparkllm
- Bluesky: https://bsky.app/profile/sparkllm.bsky.social
- X: https://x.com/sparkllm
- Zhihu: https://www.zhihu.com/people/zhiikz7qh7m
- Artículos, papers y demos adicionales: no disponibles en la información proporcionada.
