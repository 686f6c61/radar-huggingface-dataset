# Stage-org/4b-solvability-200-luna-fixed-epoch3

## Resumen

`Stage-org/4b-solvability-200-luna-fixed-epoch3` es un checkpoint de 4.539.265.536 parámetros (≈4,54 B) publicado en Hugging Face por la organización Stage-org. Se trata de un ajuste mediante aprendizaje por refuerzo (RL) sobre el modelo base `Qwen/Qwen3.5-4B`, tal y como se declara en la configuración de entrenamiento incluida en la model card. El nombre indica que corresponde a la tercera época de un experimento orientado a mejorar la "solvability" (capacidad de resolver tareas) de un conjunto de 200 tareas, usando como juez un modelo etiquetado como `gpt-5.6-luna`.

El modelo no es un producto final, sino un artefacto de investigación: la ficha publicada contiene únicamente la procedencia del entrenamiento (comando, configuración TOML y dataset), sin descripción de capacidades, licencia, idiomas ni evaluación. Acumula 0 descargas y 0 "likes", y no se ha localizado documentación externa, paper ni demo asociados.

Su interés es doble. Por un lado, documenta de forma inusualmente explícita la receta completa de RL (prime_rl, tamaño de grupo 8, enmascarado DPPO, coeficiente KL, optimizador AdamW con lr 1e-6, Flash Attention 2), lo que lo hace útil para reproducir pipelines de post-entrenamiento con recompensa generada por un juez LLM. Por otro, sirve como punto de partida para estudiar dinámicas de RL sobre un backbone de 4 B con secuencias de entrenamiento de 300.000 tokens y ventana de inferencia configurada en 65.536 tokens.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivada de `Qwen/Qwen3.5-4B`; el detalle de capas, cabezas y atención no se especifica en la información disponible |
| Parametros totales | 4.539.265.536 (≈4,54 B), dato real de los ficheros safetensors |
| Parametros activos | No aplica / no disponible: la información no indica una arquitectura MoE |
| Longitud de contexto | 65.536 tokens en inferencia (`max_model_len` del servidor vLLM); el entrenamiento usó `seq_len` de 300.000 tokens. La longitud nativa del modelo base no se documenta |
| Tipos de cuantizacion | No disponible. Solo se publican pesos en safetensors (repo de 9,1 GB, compatible con bf16/fp16); no hay versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible |
| Licencia | No disponible (no declarada en la ficha) |
| Formato de pesos | safetensors |
| Modelo base | `Qwen/Qwen3.5-4B` |
| Dataset de entrenamiento | `Stage-org/4b-solvability-200-luna-fixed` (split `train`, tipo `new_task`) |
| Fecha de creacion / actualizacion | 2026-09-19 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del modelo base `Qwen/Qwen3.5-4B` (identificado con la etiqueta `qwen3_5` en el repositorio), por lo que no se describen innovaciones arquitectónicas propias: el trabajo se limita al post-entrenamiento por refuerzo. La configuración declara `attn = "flash_attention_2"` para el entrenador y ejecución de inferencia en vLLM con `language_model_only = true`, `reasoning_parser = "qwen3"` y `tool_call_parser = "qwen3_coder"`.

El entrenamiento es un bucle de RL gestionado por el *stack* `prime_rl` con optimizador AdamW (lr 1e-6, weight decay 0,0, grad clip 1,0, betas 0,9/0,99), 10.000 pasos de learner, 3 épocas, tamaño de lote 128 y longitud de secuencia 300.000 tokens sobre 2 GPU por nodo (1 para inferencia, 1 para entrenamiento). La recompensa se obtiene con un juez open-ended (`gpt-5.6-luna`, `reasoning_effort = "medium"`, `max_retries = 3`, hasta 32 peticiones en vuelo) y `mean_score = false`. El algoritmo usa `group_size = 8`, enmascarado DPPO con umbrales `dppo_mask_low = 0,2` y `dppo_mask_high = 0,28`, `adv_tau = 1,0` y `kl_tau = 0,001`. La generación durante el aprendizaje usó temperatura 0,9, `top_p = 1,0`, `max_tokens = 4096` y `enable_thinking = true`; el juez generó con temperatura 1,0. El *checkpoint* se guardó con `weights_only = true`, por lo que no incluye estado del optimizador.

## Capacidades

No hay evaluación publicada; las capacidades listadas se infieren de la configuración de entrenamiento y del modelo base, no de pruebas independientes.

- Generación de texto y razonamiento en modo "thinking": la configuración de generación activa `enable_thinking = true`, con hasta 4.096 tokens de salida por muestra.
- Soporte de tool calling: el *stack* de inferencia se configura con `tool_call_parser = "qwen3_coder"`, lo que implica compatibilidad con llamadas a herramientas en formato Qwen.
- Razonamiento multi-paso orientado a resolución de tareas: el objetivo declarado del experimento ("solvability") y el uso de un juez con `reasoning_effort = "medium"` apuntan a tareas de varios pasos evaluadas por un LLM.
- Capacidades multilingües: no disponible; dependen del modelo base y no se documentan.
- Capacidades de código y matemáticas: no confirmadas explícitamente en la información disponible, aunque el parser `qwen3_coder` sugiere soporte de código.
- Visión y audio: no disponible; no hay referencias a torres multimodales y la inferencia se marca como `language_model_only`.

## Casos de uso

- Reproducción de pipelines de RL con juez LLM: el repositorio publica el comando de entrenamiento y el TOML completo, de modo que un equipo de investigación puede replicar el bucle (grupo 8, DPPO, KL 0,001) sobre Qwen3.5-4B con hardware de 2 GPU.
- Estudio de *reward hacking* y sesgos inducidos por el juez: al depender de un único juez (`gpt-5.6-luna`), el checkpoint es un caso de estudio adecuado para medir deriva estilística, verbosidad o explotación de la función de recompensa.
- Servicio de inferencia propio con vLLM: la configuración de referencia (puerto 7000, `max_model_len = 65536`, `gpu_memory_utilization = 0.9`) permite levantar un endpoint compatible con la API de OpenAI en una única GPU de 24 GB.
- Agentes con tool calling: el parser `qwen3_coder` habilita integrar el modelo en bucles de agente que invocan funciones, siempre que se valide antes la calidad real de las llamadas.
- Prototipado local en GPU de consumo: con ≈9,1 GB de pesos en bf16, cabe en tarjetas de 24 GB, lo que facilita experimentar sin clúster.
- Generación de cadenas de razonamiento largas: el modo *thinking* con 4.096 tokens de salida es adecuado para tareas de análisis paso a paso, a costa de mayor latencia.
- Base para experimentos de cuantización y destilación: al no existir versiones GGUF ni cuantizadas, es un punto de partida razonable para generar variantes de 4 bits y comparar degradación.
- Evaluación comparativa de post-entrenamiento: sirve como referencia de "RL sobre 4 B" frente al modelo base sin ajustar, siempre que se construya una batería de evaluación propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo contiene la procedencia del entrenamiento; no hay valores de MMLU, HumanEval, GSM8K ni de ningún otro conjunto, y la búsqueda web realizada no devolvió documentación técnica asociada (los resultados obtenidos eran ofertas de prácticas no relacionadas).

## Requisitos de hardware

- Tamaño de pesos: el repositorio ocupa 9,1 GB y los safetensors declaran 4.539.265.536 parámetros, lo que corresponde a pesos en bf16/fp16 (≈9,08 GB en decimal).
- VRAM estimada para inferencia: aproximadamente 11-12 GB para pesos, activaciones y sobrecarga de CUDA con contextos cortos (estimación a partir del tamaño del checkpoint, no un dato publicado). El coste de la caché KV a 65.536 tokens no se puede calcular con la información disponible.
- GPU recomendadas: RTX 3090/4090 (24 GB) para bf16 con contexto moderado; A100 40 GB u 80 GB y H100 para servir la ventana completa de 65.536 tokens o varios usuarios concurrentes.
- GPU de consumo: sí, cabe en tarjetas de 24 GB en bf16; en tarjetas de 12-16 GB solo sería viable tras cuantización, que no está publicada.
- Opciones de despliegue: vLLM es la ruta documentada (usado en el propio entrenamiento, con `reasoning_parser = "qwen3"` y `tool_call_parser = "qwen3_coder"`). llama.cpp, Ollama o TGI requerirían convertir los pesos a GGUF u otro formato, conversión que no se ha publicado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Stage-org/4b-solvability-200-luna-fixed-epoch3` | 4,54 B | 65.536 en inferencia; 300.000 en entrenamiento | No disponible | No disponible | Hugging Face, 0 descargas |
| `Qwen/Qwen3.5-4B` (modelo base) | ≈4,54 B (el checkpoint ajustado conserva el recuento de parámetros) | No disponible | No disponible en esta información | No disponible en esta información | Hugging Face |
| Alternativas de la misma clase (~4 B: Qwen3-4B, Llama 3.2 3B, Gemma 3 4B) | No disponible en esta información | No disponible en esta información | No disponible en esta información | No disponible en esta información | No disponible en esta información |

No se dispone de datos de rendimiento para ninguno de los modelos de la tabla, por lo que la comparación se limita al recuento de parámetros y a la disponibilidad. El checkpoint analizado no aporta ninguna ventaja verificable frente al modelo base más allá de la receta de RL aplicada, que tampoco ha sido evaluada públicamente.

## Limitaciones y advertencias

- Ausencia de licencia: la ficha no declara licencia alguna. Sin términos explícitos no puede asumirse permiso para uso comercial; conviene contactar con el autor antes de cualquier despliegue en producción.
- Documentación mínima: la model card solo contiene la procedencia del entrenamiento (comando y TOML). No hay descripción de datos, ni de composición del dataset, ni de procesos de filtrado.
- Sin evaluación: no existen benchmarks, pruebas de regresión ni validación por terceros. El rendimiento real es desconocido.
- Riesgo de alucinación: inherente a los modelos de 4 B y no mitigado de forma documentada.
- Optimización contra un juez único: al entrenar con recompensa de `gpt-5.6-luna` y `mean_score = false`, el modelo puede haber aprendido a satisfacer el estilo y los sesgos de ese juez concreto (verbosidad, formato) sin mejorar la corrección factual.
- Idiomas no declarados: no puede garantizarse un comportamiento correcto en castellano ni en otros idiomas distintos de los cubiertos por el modelo base.
- Discrepancia de longitudes: se entrenó con `seq_len = 300.000` pero se sirve con `max_model_len = 65.536`; el comportamiento más allá de esa ventana en inferencia no está validado.
- Modo *thinking* activado: la configuración de generación lo habilita por defecto, lo que incrementa el consumo de tokens y la latencia si no se desactiva explícitamente.
- Checkpoint sin estado de optimizador (`weights_only = true`): no permite reanudar el entrenamiento desde este punto tal cual.
- Sin formatos cuantizados: obliga a disponer de ≈9,1 GB de VRAM solo para pesos, lo que descarta GPUs de gama baja sin conversión previa.
- Trazabilidad: 0 descargas y 0 interacciones; no hay evidencia de que el artefacto haya sido verificado o reutilizado por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Stage-org/4b-solvability-200-luna-fixed-epoch3
- Dataset de entrenamiento declarado: https://huggingface.co/datasets/Stage-org/4b-solvability-200-luna-fixed
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Organización del autor: https://huggingface.co/Stage-org
- Papers, blogs, repositorios o demos adicionales: no se han encontrado en la búsqueda web realizada.
