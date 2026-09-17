# Stage-org/filter-s_signal2-lmb025-200-4k-epoch3

## Resumen

`Stage-org/filter-s_signal2-lmb025-200-4k-epoch3` es un checkpoint de 4.539.265.536 parámetros (~4,54 mil millones) publicado por la organización Stage-org, derivado del modelo base `Qwen/Qwen3.5-4B` mediante un proceso de aprendizaje por refuerzo (RL) ejecutado con el framework `prime_rl`. El repositorio contiene únicamente pesos en formato safetensors (9,1 GB, equivalente a ~2 bytes por parámetro, es decir, bf16/fp16) y una model card que se limita a registrar la procedencia del entrenamiento: comando, configuración TOML completa y dataset de origen (`Stage-org/filter-s_signal2-lmb025-200-4k`, intento 1, tercera época).

El modelo no está pensado como un lanzamiento de producto: se trata de un artefacto de experimento con 0 descargas y 0 likes, sin pipeline declarado, sin licencia especificada y sin idiomas documentados. La configuración de entrenamiento sí revela detalles técnicos relevantes: 10.000 pasos de learner, 3 épocas, batch de 128, muestreo en grupos de 8 (esquema tipo GRPO), decodificación en modo *thinking* activada y una función de recompensa basada en un juez LLM externo (`gpt-5.6-luna`) con `reasoning_effort` medio. La inferencia durante el entrenamiento se sirvió con vLLM, `max_model_len` de 65.536 tokens, parser de razonamiento `qwen3` y parser de *tool calling* `qwen3_coder`.

Su relevancia actual es la de un caso de estudio reproducible de RL sobre un modelo denso pequeño: documenta de forma inusualmente explícita la configuración de DPPO (máscaras en 0,2-0,28, `adv_tau` 1,0, `kl_tau` 0,001), el uso de un juez propietario para recompensas abiertas y un ajuste fino con AdamW a `lr` 1e-6. Para un desarrollador, lo importante es lo que *no* trae: no hay evaluación publicada, no hay licencia, no hay cuantizaciones y no hay declaración de capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, según el modelo base declarado (`Qwen/Qwen3.5-4B`). No se especifica en la information disponible si es dense o MoE |
| Parametros totales | 4.539.265.536 (~4,54 mil millones, dato real de los safetensors) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens (`max_model_len` configurado en vLLM durante el entrenamiento). No confirmado en la model card como contexto nativo |
| Tipos de cuantizacion | No disponible (solo se publican pesos sin cuantizar; no hay GGUF ni variantes cuantizadas en el repositorio) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (9,1 GB de repositorio) |

## Arquitectura y entrenamiento

El checkpoint parte de `Qwen/Qwen3.5-4B` y se ajusta exclusivamente mediante RL (`learner.method = "rl"`), no mediante SFT previo documentado. El bucle de entrenamiento usa grupos de 8 generaciones por prompt (`group_size = 8`), temperatura 0,9, `top_p` 1,0 y un máximo de 4.096 tokens por generación, con el modo *thinking* habilitado (`enable_thinking = true`). La recompensa en dominios abiertos proviene de un juez LLM externo (`gpt-5.6-luna`) con `reasoning_effort` medio, `max_retries` 3 y 32 peticiones concurrentes; `mean_score` está desactivado, por lo que no se promedian puntuaciones del juez. La pérdida es de tipo `default` con parámetros DPPO (`dppo_mask_low` 0,2, `dppo_mask_high` 0,28, `adv_tau` 1,0) y un coeficiente KL muy bajo (`kl_tau` 0,001), lo que implica poca restricción respecto al modelo base. El optimizador es AdamW con `lr` 1e-6, `weight_decay` 0,0, `max_norm` 1,0 y betas (0,9 / 0,99).

La infraestructura declarada es modesta y perfectamente reproducible: 2 GPUs por nodo, con 1 GPU para inferencia (vLLM con `gpu_memory_utilization` 0,9 y `max_model_len` 65.536) y 1 GPU para entrenamiento. La atención usa `flash_attention_2`, los checkpoints se guardan solo con pesos (`weights_only = true`) cada 1.000 pasos manteniendo el último, y el orquestador permite hasta 256 rollouts en vuelo con un máximo de 8 pasos fuera de política (`max_off_policy_steps = 8`). La inferencia se restringe a lenguaje (`language_model_only = true`), de modo que no hay componentes multimodales activos. Como nota de coherencia, la configuración declara `seq_len = 300000` en el learner mientras que el `max_model_len` efectivo de inferencia es 65.536; la discrepancia sugiere que ese valor hace referencia a otra magnitud (tamaño de dataset o longitud agregada) y no a la ventana real del modelo.

## Capacidades

- Generacion de texto y razonamiento en modo *thinking*: la configuración de generación activa explícitamente `enable_thinking = true` y define el parser de razonamiento `qwen3` en vLLM, lo que implica soporte de bloques de razonamiento separados de la respuesta final.
- *Tool calling* / *function calling*: se configura el parser `qwen3_coder`, orientado a llamadas a herramientas en formato de código. El modelo base declara soporte de agentes, pero no hay verificación independiente en la información disponible.
- Razonamiento multi-paso y agentes: el entrenamiento con recompensa de juez sobre generaciones abiertas de hasta 4.096 tokens favorece respuestas extensas y estructuradas, condición necesaria (aunque no suficiente) para flujos agénticos.
- Generación de código: heredada del modelo base y de un parser de *tool calling* específico para código; sin evaluación publicada en este checkpoint.
- Capacidades multilingües: no disponibles. La familia Qwen suele ser multilingüe, pero este repositorio no declara idiomas.
- Capacidades de visión o audio: no disponibles; la inferencia se configuró con `language_model_only = true`.
- Capacidad especial: filtrado/selección de señal, sugerida únicamente por el nombre del checkpoint (`filter-s_signal2`) y del dataset. No hay documentación que la respalde, por lo que debe tratarse como hipótesis, no como funcionalidad verificada.

## Casos de uso

- Generación de código asistida en el IDE: el modelo puede integrarse como backend de autocompletado y refactorización conversacional aprovechando el parser `qwen3_coder` para emitir llamadas a herramientas (por ejemplo, consultar un índice de símbolos o ejecutar tests). Su tamaño de 4,54 B permite servirlo en una sola GPU de 24 GB.
- Agentes multi-paso con razonamiento explícito: activando el modo *thinking*, el modelo separa el razonamiento de la respuesta final, lo que facilita depurar cadenas de decisión en flujos de automatización con varias herramientas encadenadas.
- Atención al cliente multi-turno: con una ventana de 65.536 tokens configurada, cabe el histórico completo de una conversación larga junto con documentación de producto, sin necesidad de resumir el contexto entre turnos.
- Extracción y normalización de información en pipelines documentales: contratos, informes o tickets de una sola pasada para producir salidas estructuradas, usando *tool calling* para forzar el esquema de salida.
- Pre-etiquetado y anotación asistida para equipos de datos: el modelo fue optimizado con un juez LLM para tareas abiertas, lo que lo hace candidato razonable para generar borradores de anotación que luego revisa un humano, reduciendo coste frente a etiquetado manual puro.
- Investigación en RL y ablaciones de recompensa: el repositorio documenta la configuración completa (DPPO, `kl_tau`, tamaño de grupo, juez externo), lo que lo convierte en una referencia útil para reproducir o comparar variantes del mismo *pipeline* `prime_rl`.
- Despliegue en entornos con restricciones de hardware o *on-premise*: al ser un modelo denso de ~4,5 B, es viable en GPUs de consumo (RTX 4090, RTX 3090) e incluso en CPU con cuantización de 4 bits, siempre que se genere la cuantización a partir de los safetensors publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio contiene exclusivamente metadatos de procedencia del entrenamiento (comando, configuración TOML y dataset), sin tablas de MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra evaluación. Tampoco hay métricas de recompensa del juez, curvas de entrenamiento ni comparaciones con el modelo base `Qwen/Qwen3.5-4B`. La búsqueda web realizada no devolvió resultados relevantes sobre el modelo (los resultados obtenidos corresponden a portales de ofertas de prácticas y no guardan relación con el repositorio).

## Requisitos de hardware

- VRAM para inferencia (estimaciones derivadas del número de parámetros, no de mediciones publicadas):
  - bf16/fp16: ~9,1 GB de pesos, más caché KV y activaciones. En la práctica, entre 12 y 16 GB para contextos moderados.
  - int8: ~4,5-5 GB de pesos.
  - 4 bits (Q4_K_M o similar): ~2,7-3,5 GB de pesos.
- La caché KV no puede calcularse con precisión: se desconoce el número de capas, de cabezas y si se usa GQA. A 65.536 tokens de contexto, la caché KV puede superar el tamaño de los propios pesos y dominar el consumo total de VRAM.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o similares para servicio en bf16 con contexto largo. Para uso individual, RTX 4090 o RTX 3090 (24 GB) son suficientes en bf16 con contexto contenido, y holgadas con cuantización de 8 o 4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 y, en cuantización de 4 bits, en GPUs de 8 GB con contexto reducido.
- Opciones de despliegue: vLLM está validado implícitamente por la configuración de entrenamiento (con `reasoning_parser = "qwen3"` y `tool_call_parser = "qwen3_coder"`). TGI, SGLang y Ollama/llama.cpp son viables para el modelo base, pero el repositorio no publica pesos GGUF, por lo que habría que convertir los safetensors antes de usarlos en llama.cpp u Ollama.
- Latencia y throughput: no disponibles. No hay mediciones publicadas ni parámetros suficientes (capas, cabezas, arquitectura exacta) para estimarlos con rigor.

## Comparativa con modelos similares

Los datos de los modelos comparables proceden de sus fichas públicas de referencia y no han sido verificados en esta búsqueda; para el modelo analizado no existe ningún dato de rendimiento publicado, por lo que la comparación es exclusivamente de especificaciones.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `Stage-org/filter-s_signal2-lmb025-200-4k-epoch3` | 4,54 B | 65.536 tokens en la configuración de entrenamiento (no confirmado como contexto nativo) | No disponible | 1 checkpoint safetensors, 0 descargas, 0 likes |
| Qwen3-4B (familia base de referencia) | ~4 B | 32.768 tokens nativos, extensible | Apache-2.0 | Amplia, con cuantizaciones GGUF y AWQ |
| Llama-3.2-3B | 3,2 B | 128.000 tokens | Licencia comunitaria de Llama 3.2 | Amplia, ecosistema maduro |
| Gemma-3-4B | ~4 B | 128.000 tokens | Términos de uso de Gemma | Amplia en HuggingFace |

La diferencia crítica no es de tamaño ni de contexto, sino de estado de publicación: los tres modelos comparables tienen licencia explícita, evaluaciones publicadas y ecosistema de despliegue, mientras que este checkpoint carece de los tres elementos.

## Limitaciones y advertencias

- Licencia no especificada: no hay licencia declarada en el repositorio. Al derivar de `Qwen/Qwen3.5-4B`, las condiciones de uso comercial dependen de la licencia del modelo base, que tampoco se documenta aquí. No debe usarse en producción comercial sin aclarar este punto.
- Ausencia total de evaluación: no hay benchmarks, ni métricas de recompensa, ni comparación con el modelo base. No es posible afirmar si el RL mejoró o degradó capacidades respecto a `Qwen/Qwen3.5-4B`.
- Riesgo elevado de deriva respecto al modelo base: el coeficiente KL es muy bajo (`kl_tau` = 0,001) y el entrenamiento se prolonga 3 épocas completas, condiciones asociadas a *reward hacking* y a pérdida de capacidades generales cuando la recompensa proviene de un juez LLM.
- Recompensa delegada a un juez propietario: las respuestas abiertas se puntúan con `gpt-5.6-luna`, un modelo de terceros. Esto introduce dependencia de un servicio externo y sesgos propios del juez en el comportamiento aprendido (estilo, longitud y formato de respuesta).
- Sesgos conocidos: no disponibles. No se ha publicado ninguna evaluación de sesgo, toxicidad o equidad.
- Riesgo de alucinación: no cuantificado. Un ajuste por RL con recompensa de juez puede incrementar la verbosidad y la seguridad aparente de las respuestas sin mejorar su veracidad.
- Limitaciones de idioma: no declaradas. No hay garantía de calidad fuera del inglés, y se desconoce el idioma mayoritario del dataset de entrenamiento.
- Limitaciones de contexto: los 65.536 tokens son el valor configurado en vLLM durante el entrenamiento, no una especificación de la model card. El rendimiento real con contextos largos no está verificado.
- Nombre de checkpoint experimental: `epoch3`, `attempt-0001` y `lmb025-200-4k` indican que forma parte de un barrido de experimentos, no de una versión curada. Las rutas internas del comando de entrenamiento (`/NHNHOME/shkim/...`) apuntan a un entorno de investigación personal.
- Cero validación comunitaria: 0 descargas y 0 likes. No hay informes de terceros, ni issues, ni casos de uso confirmados.
- Idiomas y *pipeline* sin declarar: la ausencia de `pipeline_tag` e idiomas impide usar el modelo con `transformers` mediante autodetección fiable; será necesario especificar la clase y la configuración manualmente.
- No se publican pesos GGUF ni cuantizaciones, lo que obliga a generar cualquier formato de despliegue ligero a partir de los safetensors originales.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/Stage-org/filter-s_signal2-lmb025-200-4k-epoch3
- Dataset de entrenamiento declarado: `Stage-org/filter-s_signal2-lmb025-200-4k` (referenciado en la model card)
- Modelo base declarado en la configuración: `Qwen/Qwen3.5-4B`
- Paper, blog, repositorio de código o demo: no disponibles. La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los resultados obtenidos corresponden a portales de ofertas de prácticas ajenos al repositorio.
