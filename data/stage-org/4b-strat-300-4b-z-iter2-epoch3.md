# Stage-org/4b-strat-300-4b-z-iter2-epoch3

## Resumen

`Stage-org/4b-strat-300-4b-z-iter2-epoch3` es un checkpoint de modelo de lenguaje de aproximadamente 4,54 mil millones de parámetros publicado por la organización Stage-org en Hugging Face. Se trata de un artefacto de investigación generado por un pipeline interno de entrenamiento por refuerzo (RL), no de un modelo con documentación de producto: la model card se limita a registrar la procedencia del entrenamiento (dataset, comando y fichero de configuración en formato TOML), sin descripción de capacidades, idiomas ni licencia.

El modelo se etiqueta con `qwen3_5`, lo que apunta a una arquitectura derivada de la familia Qwen3.5, y su nombre incluye el sufijo `4b-strat-300`, coherente con los 4.539.265.536 parámetros reales contabilizados en los pesos `safetensors`. El entrenamiento se realizó con el framework `prime_rl` sobre el checkpoint previo `Stage-org/appworld-4b-strat-300-4b-z-epoch3-agent-rl-epoch2`, usando el dataset `Stage-org/4b-strat-300-4b-z-iter2` y un juez externo (`gpt-5.6-luna`) para puntuar rollouts abiertos. Esto lo sitúa en la categoría de modelos afinados para tareas agénticas y de razonamiento con modo *thinking* activado durante la generación.

Su relevancia es, por tanto, fundamentalmente experimental y reproducible: sirve para estudiar recetas de RL a gran longitud de secuencia (el `seq_len` de entrenamiento declarado es de 300.000 tokens) y para inspeccionar el efecto de las máscaras DPPO empleadas en la pérdida. No hay descargas ni *likes* registrados, no se publican benchmarks y no se declara licencia, por lo que su uso en producción no está respaldado por la documentación disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta de la librería: `qwen3_5`, familia Qwen3.5); no se indica si es MoE o denso |
| Parámetros totales | 4.539.265.536 (≈4,54 mil millones), según los pesos `safetensors` |
| Parámetros activos | no disponible (no hay indicios de arquitectura MoE en la información proporcionada) |
| Longitud de contexto | no documentada en la model card. La configuración de entrenamiento declara `seq_len = 300000` y el servidor vLLM se configura con `max_model_len = 65536` |
| Tipos de cuantización | no disponible (no se publican pesos GGUF, AWQ ni GPTQ; solo `safetensors`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `safetensors` (repositorio de 9,1 GB, backend xet) |
| Desarrollador | Stage-org |
| Fecha de publicación | 24 de septiembre de 2026 (última actualización: 24 de septiembre de 2026) |
| Descargas / likes | 0 / 0 |
| Dataset de entrenamiento | `Stage-org/4b-strat-300-4b-z-iter2` |
| Modelo base | `Stage-org/appworld-4b-strat-300-4b-z-epoch3-agent-rl-epoch2` |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna más allá de la etiqueta `qwen3_5` asociada al repositorio, que sugiere compatibilidad con la familia Qwen3.5 y, por tanto, un transformer con atención de tipo causal y presumiblemente *grouped-query attention*. No se especifican número de capas, dimensión oculta, número de cabezas de atención ni vocabulario, de modo que cualquier detalle adicional sería especulativo. Tampoco se indica si el modelo emplea mezcla de expertos: el recuento de parámetros activos no figura en la información.

El entrenamiento es de tipo RL (campo `learner.method = "rl"`), gestionado con `prime_rl`, con un total de 10.000 pasos de *learner* y 3 épocas, tamaño de lote de 128 y longitud de secuencia de 300.000 tokens. La generación durante los rollouts usa temperatura 0,9, `top_p` 1,0, hasta 4.096 tokens y `enable_thinking = true`; el juez de respuestas abiertas (`open_ended_judge`) es `gpt-5.6-luna` con `reasoning_effort = "medium"`, 32 peticiones en vuelo y 3 reintentos. El optimizador es AdamW con `lr = 1e-6`, `weight_decay = 0`, `max_norm = 1.0` y betas 0,9 / 0,99. La pérdida es de tipo `default` con parámetros DPPO (`dppo_mask_low = 0.2`, `dppo_mask_high = 0.28`, `adv_tau = 1.0`, `kl_tau = 0.001`), lo que apunta a un esquema de optimización de política con enmascaramiento de tokens por ventaja y control de divergencia KL respecto a la política de referencia. El entrenamiento se realizó con 2 GPUs por nodo (1 para inferencia y 1 para entrenamiento), `group_size = 8`, difusión de pesos por sistema de ficheros y hasta 8 pasos *off-policy* en el orquestador (256 rollouts en vuelo como máximo). El motor de inferencia fue vLLM con `gpu_memory_utilization = 0.9`, `max_model_len = 65536`, `reasoning_parser = "qwen3"`, `tool_call_parser = "qwen3_coder"` y modo `language_model_only = true`. La semilla del bucle fue 7.

## Capacidades

Las siguientes capacidades se infieren únicamente de la configuración de entrenamiento y de las etiquetas del repositorio; no están verificadas por el autor en una model card descriptiva:

- Generación de texto autoregresiva con modo de razonamiento explícito (*thinking*): los rollouts de entrenamiento se generaron con `enable_thinking = true` y el parser de razonamiento configurado es `qwen3`.
- Llamada a herramientas y funciones: el servidor de inferencia se configura con `tool_call_parser = "qwen3_coder"`, lo que indica soporte previsto de *tool calling* en formato compatible con Qwen.
- Comportamiento agéntico multi-paso: el checkpoint previo pertenece a una familia denominada `appworld-...-agent-rl`, y el bucle de RL está diseñado para entornos con rollouts largos (hasta 8 pasos *off-policy* y 300.000 tokens de secuencia), lo que apunta a tareas interactivas de varios turnos.
- Contexto largo: la configuración de entrenamiento trabaja con secuencias de 300.000 tokens y el motor de inferencia con `max_model_len` de 65.536 tokens; la ventana efectiva real no está documentada.
- Capacidades multilingües: no disponible.
- Visión, audio u otras modalidades: no disponible; la inferencia está configurada explícitamente como `language_model_only = true`.

## Casos de uso

- Reproducción de experimentos de RL para LLM: el repositorio incluye el comando y el TOML de entrenamiento completos, lo que permite replicar el *pipeline* con `prime_rl`, verificar el efecto de las máscaras DPPO y comparar con los *checkpoints* hermanos de la misma organización.
- Investigación en razonamiento con presupuesto de cómputo: el modo *thinking* está activado con un máximo de 4.096 tokens generados por rollout, lo que lo hace adecuado para estudiar cuánto razonamiento explícito mejora la tasa de éxito en tareas de agente antes de degradar la latencia.
- Desarrollo de agentes que operan sobre APIs o aplicaciones simuladas: la combinación de un modelo base entrenado con RL agéntico y un *tool call parser* `qwen3_coder` permite construir prototipos de agentes que encadenan llamadas a funciones durante varios turnos.
- Evaluación comparativa de recetas de RL frente a SFT: al tratarse de un *checkpoint* intermedio con un predecesor nombrado explícitamente, resulta útil como punto de comparación para medir si el RL aporta mejoras sobre el modelo previo en la misma tarea.
- Fine-tuning posterior sobre dominio propio: con 4,54 mil millones de parámetros y pesos en `safetensors`, el ajuste completo o con LoRA cabe en configuraciones de una o dos GPUs de 80 GB, lo que permite adaptarlo a tareas verticales partiendo del comportamiento agéntico ya adquirido.
- Despliegue interno de bajo coste para pruebas de concepto: cuantizado, el modelo puede ejecutarse en una GPU de consumo, lo que permite probar flujos de *tool calling* y razonamiento multi-turno antes de escalar a un modelo mayor.
- Auditoría de sesgos y seguridad en modelos entrenados con RL: su naturaleza experimental y la existencia de un juez externo como señal de recompensa lo convierten en un caso de estudio para analizar cómo se comporta un modelo cuando el objetivo es agradar a un evaluador automático.

No se recomienda su uso en producción orientada a clientes con la información disponible, dado que no hay licencia declarada ni evaluación publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente contiene la procedencia del entrenamiento (dataset, comando y configuración), sin métricas de MMLU, HumanEval, GSM8K, MT-Bench ni de tareas agénticas como AppWorld.

## Requisitos de hardware

Estimaciones propias a partir del tamaño de pesos declarado (4,54 B de parámetros, repositorio de 9,1 GB); no están verificadas por el autor y deben tomarse como orientativas:

- Pesos en precisión original (BF16/FP16): aproximadamente 9,1 GB, coherente con el tamaño del repositorio.
- Cuantización a 8 bits: en torno a 4,5-5 GB de pesos. A 4 bits: en torno a 2,5-3 GB de pesos.
- Memoria KV adicional dependiente del número de capas y cabezas KV, que no se publican. Con una ventana de 65.536 tokens, el *cache* puede añadir del orden de 5-10 GB en FP16 en configuraciones típicas de modelos densos de este tamaño con GQA; esta cifra es una estimación, no un dato del repositorio.
- GPU de gama profesional: A100 40 GB y 80 GB, H100 80 GB, L40S 48 GB. Suficientes para servir el modelo en BF16 con ventanas moderadas.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB puede alojar los pesos en BF16 con margen escaso, y de forma holgada si se convierte a 8 o 4 bits; conviene reducir `max_model_len` para no agotar la VRAM.
- Despliegue: el propio autor usó vLLM con `max_model_len = 65536`, `reasoning_parser = "qwen3"` y `tool_call_parser = "qwen3_coder"`, por lo que vLLM es la vía mejor documentada. SGLang y TGI son alternativas razonables para un transformer causal estándar. llama.cpp y Ollama requerirían convertir los pesos a GGUF, conversión que no está publicada en el repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No hay información publicada sobre benchmarks de este modelo, por lo que la comparación se limita a características estructurales. Los datos de las alternativas son de conocimiento público general y no se han verificado en la búsqueda realizada.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Stage-org/4b-strat-300-4b-z-iter2-epoch3 | 4,54 B | No documentado (`seq_len` de entrenamiento 300.000; `max_model_len` de inferencia 65.536) | no disponible | Hugging Face, `safetensors`, 0 descargas |
| Qwen3-4B (referencia de la familia base) | ~4 B | 32.768 tokens nativos, ampliable | Apache 2.0 | Hugging Face y múltiples *runtimes* |
| Llama 3.2 3B (referencia de tamaño similar) | 3,2 B | 128.000 tokens | Licencia comunitaria de Llama | Hugging Face y múltiples *runtimes* |
| Stage-org/4b-strat-300-LH-27b-z-iter2-epoch3 (modelo hermano) | no disponible en la información proporcionada | no disponible | no disponible | Hugging Face |

La diferencia principal frente a las alternativas consolidadas es la licencia: Qwen3 y Llama 3.2 declaran términos de uso explícitos, mientras que este *checkpoint* no indica ninguna, lo que impide determinar si el uso comercial está permitido.

## Limitaciones y advertencias

- Licencia no declarada: sin términos de uso publicados no es posible determinar si se permite el uso comercial, la redistribución o la modificación. Cualquier despliegue en producción es jurídicamente indeterminado.
- Ausencia total de evaluación: no hay benchmarks, ni pruebas de seguridad, ni comparaciones con el modelo base, por lo que se desconoce si el RL ha degradado capacidades generales.
- Riesgo de alucinación: es un modelo de lenguaje generativo sin mecanismo de verificación factual documentado, y su entrenamiento con un juez automático (`gpt-5.6-luna`) puede favorecer respuestas que resulten convincentes para un evaluador más que correctas.
- Optimización hacia la recompensa del juez: el uso de un juez LLM como señal de recompensa introduce riesgo de *reward hacking*, especialmente en tareas abiertas; conviene auditar las salidas antes de reutilizarlas.
- Sesgos: no se documenta ningún análisis de sesgo, toxicidad ni comportamiento diferencial por idioma o demografía.
- Idiomas: no se declara cobertura lingüística. Aunque la familia Qwen suele ser multilingüe, no hay confirmación para este *checkpoint*.
- Contexto: aunque la configuración de entrenamiento usa secuencias de 300.000 tokens, la ventana efectiva no está validada; el propio autor limitó la inferencia a 65.536 tokens en vLLM, lo que sugiere que más allá de ese valor el comportamiento no está garantizado.
- Naturaleza experimental: 0 descargas y 0 *likes*; es un artefacto de un *pipeline* interno de investigación sin mantenimiento ni soporte declarado.
- Longitud de nombres y trazabilidad: el repositorio no incluye métricas de entrenamiento publicadas (curvas de recompensa, *loss*), solo el comando y la configuración, lo que dificulta verificar el resultado del proceso de RL.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Stage-org/4b-strat-300-4b-z-iter2-epoch3
- Dataset de entrenamiento: `Stage-org/4b-strat-300-4b-z-iter2` (referenciado en la model card; no se proporciona URL directa)
- Modelo base: `Stage-org/appworld-4b-strat-300-4b-z-epoch3-agent-rl-epoch2` (referenciado en la model card; no se proporciona URL directa)
- Modelo hermano: https://huggingface.co/Stage-org/4b-strat-300-LH-27b-z-iter2-epoch3
- Modelo hermano: https://huggingface.co/Stage-org/4b-strat-300-LH-27b-z-e1-iter3-epoch3
- Perfil de la organización en Hugging Face: https://huggingface.co/Stage-org

Los restantes resultados de la búsqueda web (portales de ofertas de prácticas como stage.fr o welcometothejungle.com) no guardan relación con el modelo y se han descartado.
