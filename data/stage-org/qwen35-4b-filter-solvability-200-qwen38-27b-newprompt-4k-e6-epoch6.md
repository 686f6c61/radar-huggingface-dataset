# Stage-org/qwen35-4b-filter-solvability-200-qwen38-27b-newprompt-4k-e6-epoch6

## Resumen

El modelo `Stage-org/qwen35-4b-filter-solvability-200-qwen38-27b-newprompt-4k-e6-epoch6` es un ajuste fino de 4.539.265.536 parámetros (aproximadamente 4,54 mil millones) publicado por la organización Stage-org. Según la información de procedencia incluida en su model card, se obtiene mediante aprendizaje por refuerzo (RL) sobre el modelo base `Qwen/Qwen3.5-4B`, partiendo del dataset `Stage-org/qwen35-4b-filter-solvability-200-qwen38-27b-newprompt-4k` en su intento número 1.

El propósito declarado es el de un artefacto de investigación dentro de un flujo de entrenamiento automatizado (`jh-workflow`), con 6 épocas de RL sobre 10.000 pasos de aprendiz, tamaño de lote 128 y un tamaño de grupo de 8 para el cálculo de ventajas. La configuración de generación activa el modo de razonamiento (`enable_thinking = true`), con temperatura 0,9 y un máximo de 4.096 tokens por muestra, y la inferencia del bucle de RL usa vLLM con una longitud máxima de modelo de 65.536 tokens.

Su relevancia es limitada y muy específica: se trata de un checkpoint intermedio de un experimento de RL, no de un modelo listo para producción. El repositorio registra 0 descargas y 0 «likes», no incluye licencia, idiomas ni documentación de evaluación, y la búsqueda web realizada no devolvió ningún material relacionado (los resultados obtenidos corresponden a ofertas de prácticas en francés, sin vinculación con el modelo). Debe tratarse, por tanto, como material de estudio del proceso de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No confirmada en la model card; el modelo base es `Qwen/Qwen3.5-4B` y el tag del repositorio es `qwen3_5`, lo que apunta a un transformer decoder denso |
| Parametros totales | 4.539.265.536 (≈4,54 B), dato real de los safetensors |
| Parametros activos | No aplica; no hay indicios de arquitectura MoE en la informacion disponible |
| Longitud de contexto | No disponible oficialmente. La configuracion de RL fija `max_model_len = 65536` en inferencia y `seq_len = 300000` en el aprendiz (valores contradictorios entre si) |
| Tipos de cuantizacion | No disponible; el repositorio solo contiene pesos en safetensors (9,1 GB, compatible con bf16/fp16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors |
| Tamano del repositorio | 9,1 GB |
| Fecha de creacion | 2026-09-17 |

## Arquitectura y entrenamiento

No hay descripción arquitectónica propia en la model card. Los únicos indicios son el tag `qwen3_5`, el campo `learner.model = "Qwen/Qwen3.5-4B"` de la configuración y el uso de `flash_attention_2` como implementación de atención. El recuento de 4,54 B de parámetros coincide con el tamaño del repositorio en precisión de 16 bits (9,1 GB), lo que confirma que los pesos se almacenan en bf16/fp16 sin cuantizar. El parser de razonamiento configurado es `qwen3` y el de llamadas a herramientas, `qwen3_coder`.

El entrenamiento es un bucle de RL (método `rl`, sin especificar algoritmo más allá de los parámetros DPPO presentes en la configuración) con 10.000 pasos, 6 épocas, lote de 128, grupo de 8 muestras por prompt y temperatura 0,9 para la generación de rollouts. Se emplean dos GPU por nodo (una para inferencia con vLLM al 90 % de memoria y otra para entrenamiento), optimizador AdamW con `lr = 1e-6`, `weight_decay = 0.0` y `max_norm = 1.0`. La señal de recompensa proviene de un juez externo servido por API (`gpt-5.6-luna`) con `reasoning_effort = "medium"`, hasta 32 peticiones en vuelo y 3 reintentos. El límite de pasos fuera de política es 8 y el orquestador admite 256 rollouts simultáneos. No se documentan tokens de entrenamiento, composición del dataset, ni fases de SFT, RLHF o DPO previas.

## Capacidades

- Generación de texto y razonamiento en modo «thinking»: la configuración de RL activa `enable_thinking = true` con un presupuesto de 4.096 tokens de generación por muestra.
- Llamada a herramientas: el servicio de inferencia usa `tool_call_parser = "qwen3_coder"`, lo que implica soporte de function calling en el formato de Qwen para código.
- Razonamiento multi-paso orientado a agentes: el entrenamiento se apoya en un bucle de rollouts con hasta 8 pasos fuera de política, propio de tareas de interacción.
- Generación de código: el parser de herramientas está asociado al perfil `qwen3_coder` del modelo base.
- Procesamiento de contexto largo: la inferencia del bucle de RL se configuró con 65.536 tokens de ventana máxima.
- Capacidades multilingües, de visión o de audio: no disponible en la información proporcionada.

## Casos de uso

- Investigación en aprendizaje por refuerzo: el repositorio es un checkpoint de la época 6 de un experimento de RL con DPPO sobre Qwen3.5-4B, útil para reproducir o comparar dinámicas de entrenamiento (curvas de recompensa, KL, ventajas) frente a otros intentos del mismo flujo.
- Generación de datos sintéticos con razonamiento: al estar entrenado con juez externo y modo thinking, puede emplearse para producir trazas de razonamiento etiquetadas que alimenten posteriores fases de destilación o SFT.
- Agentes con llamadas a herramientas: el parser `qwen3_coder` permite integrarlo en un orquestador que exponga funciones (APIs, consultas a bases de datos, ejecución de comandos) en ciclos de varios pasos.
- Asistentes de código en local: con 4,54 B de parámetros y pesos en bf16, cabe en una GPU de 24 GB y puede ejecutar tareas de autocompletado, explicación y refactorización sin salida a servicios externos.
- Evaluación de pipelines de recompensa: sirve como sujeto de prueba para validar jueces automáticos, dado que su entrenamiento dependió de un juez servido por API con `reasoning_effort = "medium"` y 32 peticiones concurrentes.
- Procesamiento de documentos largos: la ventana de 65.536 tokens configurada en inferencia permite resumir o extraer información de expedientes extensos si se confirma que el modelo la soporta en la práctica.
- Despliegue en entornos con presupuesto de VRAM ajustado: cuantizado a 4 bits ocupa del orden de 2,4 GB de pesos, lo que habilita prototipos en portátiles con GPU de 8 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente contiene la procedencia del entrenamiento (dataset, comando y configuración), sin tablas de MMLU, GSM8K, HumanEval ni evaluaciones comparativas. Tampoco hay métricas de recompensa del juez, curvas de entrenamiento ni cifras de latencia o throughput.

## Requisitos de hardware

- Pesos en bf16/fp16: 9,1 GB (tamaño real del repositorio). Con caché KV y overhead de runtime, la estimación razonable es de 12 a 16 GB de VRAM según la longitud de contexto efectiva.
- Cuantización a 8 bits: aproximadamente 4,6 GB de pesos; a 4 bits, aproximadamente 2,4 GB. Estas conversiones no están publicadas en el repositorio y requerirían generar GGUF o AWQ/GPTQ por cuenta propia.
- GPU de consumo: cabe en bf16 en RTX 4090, RTX 3090 y RTX 4090 D (24 GB). En RTX 4080, RTX 4070 Ti Super o RTX 4060 Ti de 16 GB es recomendable cuantizar. En tarjetas de 8 GB solo con cuantización de 4 bits y contexto reducido.
- GPU de centro de datos: A100 (40/80 GB), H100, L40S y A6000 admiten el modelo en bf16 con contexto largo y mayor concurrencia.
- Despliegue: la configuración de entrenamiento usa vLLM (`gpu_memory_utilization = 0.9`, `language_model_only = true`, puerto 7000). También son viables TGI, SGLang y, previa conversión a GGUF, llama.cpp u Ollama.
- Tamaño de caché KV: no disponible; depende del número de capas, cabezas y uso de GQA, datos no publicados.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La model card no incluye comparaciones ni resultados de evaluación, por lo que no es posible contrastar rendimiento. La tabla siguiente recoge únicamente datos estructurales y de licencia de alternativas de tamaño equivalente, con las salvedades indicadas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Stage-org/qwen35-4b-filter-solvability-200-...-epoch6 | 4,54 B | No disponible (config. de RL: 65.536) | No disponible | Safetensors en HuggingFace, 0 descargas |
| Qwen/Qwen3.5-4B (modelo base declarado) | ≈4 B (no confirmado en esta busqueda) | No disponible en esta busqueda | No disponible en esta busqueda | Modelo base de referencia del entrenamiento |
| Alternativas de la misma franja (3-4 B) | No disponible | No disponible | No disponible | No disponible |

No se dispone de información verificada sobre modelos comparables en el material proporcionado, por lo que no se ofrece una comparación de rendimiento.

## Limitaciones y advertencias

- Licencia no especificada: sin licencia declarada no puede asumirse uso comercial. Es imprescindible aclararlo antes de cualquier despliegue.
- Modelo sin validar: 0 descargas y 0 «likes» en el momento de la consulta, sin evaluaciones externas ni resultados de benchmarks publicados.
- Checkpoint intermedio: el nombre indica época 6 e intento 1 de un flujo automatizado, por lo que puede presentar sobreajuste a la distribución del dataset de RL y degradación en tareas fuera de ese dominio.
- Dependencia del juez: la recompensa provino de un modelo externo servido por API (`gpt-5.6-luna`) con `reasoning_effort = "medium"`; los sesgos y errores de ese juez pueden haberse transferido al modelo entrenado.
- Riesgo de alucinación: no documentado ni cuantificado; al ser un ajuste por RL sobre un modelo de 4 B, el riesgo es intrínsecamente alto en dominios factuales.
- Inconsistencia de configuración: la configuración de entrenamiento declara `seq_len = 300000` mientras que la inferencia de RL limita a 65.536 tokens; esto sugiere un posible error de configuración y hace inviable asumir una ventana de contexto concreta.
- Idiomas soportados no declarados: se desconoce si el ajuste por RL alteró la cobertura multilingüe del modelo base.
- Ausencia de model card descriptiva: no hay información sobre arquitectura, dataset de entrenamiento, composición de datos, ni limitaciones declaradas por el autor.
- Resultados de búsqueda web irrelevantes: las coincidencias obtenidas corresponden a portales de ofertas de prácticas («stage» en francés) y no aportan información técnica sobre el modelo.

## Enlaces

- HuggingFace: https://huggingface.co/Stage-org/qwen35-4b-filter-solvability-200-qwen38-27b-newprompt-4k-e6-epoch6
- Dataset de entrenamiento declarado: `Stage-org/qwen35-4b-filter-solvability-200-qwen38-27b-newprompt-4k` (referenciado en la model card; no se ha verificado su URL pública)
- Modelo base declarado: `Qwen/Qwen3.5-4B` (referenciado en la configuración de entrenamiento; no se ha verificado su URL pública)
- Paper, blog, repositorio o demo adicionales: no disponible; la búsqueda web no devolvió ningún enlace relacionado con el modelo.
