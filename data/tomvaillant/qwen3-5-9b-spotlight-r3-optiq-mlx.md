# tomvaillant/qwen3.5-9b-spotlight-r3-optiq-mlx

## Resumen

Qwen3.5-9B Spotlight r3 — OptiQ MLX es un ajuste fino supervisado (LoRA fusionado) del modelo base Qwen/Qwen3.5-9B, desarrollado por Tom Vaillant / Buried Signals y exportado en formato MLX para su ejecución en Apple Silicon. El modelo está especializado en flujos de trabajo de periodismo de investigación: lectura de fuentes, verificación de hechos, planificación y generación de informes, con roles diferenciados de investigador, verificador, analista y orquestador. Se distribuye como pesos cuantizados con un mapa mixto de 4 y 8 bits por módulo, orientado a la aplicación Spotlight Local a través de Indicator Lab y Osaurus.

El modelo resuelve un problema acotado: proporcionar un asistente local, ejecutable en un Mac, que ayude en tareas de investigación periodística con soporte de herramientas y formato estructurado de hallazgos y veredictos. No es un modelo de propósito general ni un verificador de hechos autónomo; el propio autor lo describe como un modelo de vista previa para un flujo de trabajo con supervisión humana.

Con 9.409.813.744 parámetros totales, licencia Apache 2.0 y un repositorio de 8,0 GB, es relevante por su enfoque en despliegue local en hardware de consumo Apple y por su estrategia de cuantización mixta por módulo (OptiQ), que busca reducir errores frente a una cuantización uniforme de 4 bits. No hay datos publicados sobre longitud de contexto en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen3.5-9B, con proyecciones de atención lineal y MLP; adaptador LoRA fusionado en 200 módulos |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantización afín MLX con group size 64; mapa mixto por módulo: 134 módulos a 8 bits y 116 a 4 bits (250 módulos configurados) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors MLX (2 shards, 8.012.768.940 bytes ≈ 7,46 GiB); no incluye GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer de aproximadamente 9.400 millones de parámetros. Sobre él se aplicó un ajuste fino supervisado con LoRA de rango 16, alpha 16 y dropout 0 (sin rank-stabilized LoRA), entrenado en bf16 con Unsloth, Transformers y PEFT. Los módulos objetivo del adaptador incluyen proyecciones de atención, proyecciones de atención lineal y proyecciones MLP. El adaptador se fusiona en 200 módulos antes de la cuantización.

El corpus de entrenamiento de la ronda final consta de 811 ejemplos de flujos de trabajo de Spotlight, distribuidos por roles: investigador (342), verificador de hechos (333), analista (75) y orquestador (61). Los ejemplos cubren uso de herramientas, lectura de fuentes, formatos de hallazgos y veredictos, planificación y trabajo de informes. El entrenamiento de la ronda final fue de 2 épocas y 406 pasos de optimización. El corpus de entrenamiento no se distribuye en el repositorio. La innovación técnica destacable es la exportación OptiQ: una cuantización afín MLX con group size 64 y un mapa explícito de bits por módulo (recogido en `config.json`), que sustituye la cuantización uniforme de 4 bits de una exportación anterior. Los tensores no cuantizados, incluidos los pesos de visión conservados, provienen de la exportación r3 previa.

## Capacidades

- Generación de texto conversacional en inglés con plantilla de chat incluida; el token EOS es `<|im_end|>`.
- Entrada imagen-texto (pipeline `image-text-to-text`), con pesos de visión conservados; el rendimiento de visión no se ha evaluado por separado en esta exportación.
- Uso de herramientas (tool use) y argumentos de herramientas, según los ejemplos de entrenamiento.
- Lectura de fuentes y extracción de citas para tareas de verificación.
- Generación de formatos estructurados de hallazgos y veredictos.
- Planificación y trabajo de informes dentro de un flujo de investigación.
- Modo de razonamiento (thinking mode) empleado por el verificador de hechos del flujo Spotlight.
- Roles especializados: investigador, verificador, analista y orquestador.
- Soporte de agentes y razonamiento multi-paso dentro del arnés de Spotlight, que aporta prompts de rol, herramientas, validadores y puertas de revisión humana.

## Casos de uso

- Verificación asistida de afirmaciones: el modelo puede contrastar una afirmación con pasajes de fuentes citadas y emitir un veredicto estructurado, usando el modo de razonamiento del rol de verificador; requiere verificación humana independiente.
- Lectura y resumen de fuentes documentales: extracción de citas y pasajes relevantes de documentos largos para alimentar el trabajo del periodista.
- Planificación de investigaciones: el rol de orquestador descompone una investigación en pasos, asigna tareas a roles y genera un plan de trabajo.
- Generación de borradores de informes: el rol de analista sintetiza hallazgos en formatos de informe definidos por el flujo de trabajo.
- Asistencia en redacción de enmiendas: el modelo produjo 6 copias limpias de enmienda en 6 intentos en la comparación registrada, lo que lo hace útil para reescribir secciones corregidas.
- Despliegue local en Mac para redacciones: ejecutable en Apple Silicon mediante MLX-VLM o el arnés de Spotlight Local, sin depender de servicios en la nube y manteniendo el material sensible en local.
- Automatización de comprobaciones de nombres en pasajes citados: el arnés puede comprobar que un nombre aparece en el pasaje citado, aunque esto no establece que el pasaje respalde la afirmación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La única evaluación registrada es una comparación dirigida con prompts grabados:

| Comparación | OptiQ (mixto 4/8 bits) | Uniforme 4 bits |
|---|---|---|
| Errores en filas dirigidas | 7 de 42 | 13 de 42 |
| Errores en filas de control | 0 de 48 | 3 de 48 |
| Copias limpias de enmienda | 6 de 6 intentos | no disponible |

El autor señala que esta comparación predeclarada quedó inconclusa porque la rama uniforme de 4 bits reprodujo menos errores dirigidos de los requeridos, y que las muestras pequeñas y seleccionadas no establecen superioridad general ni exactitud factual.

## Requisitos de hardware

- VRAM/memoria: los pesos ocupan unos 7,46 GiB; la memoria en tiempo de ejecución es superior y depende del contexto y de otros modelos cargados.
- Memoria medida en un Mac de 48 GB. Una ejecución simulada en 24 GB con los ajustes previstos de modelos auxiliares alcanzó una suma de proceso de 20,46 GiB frente a un presupuesto de 20 GiB y entró en presión de memoria crítica.
- No validado en un Mac real de 24 GB. No debe tratarse el contexto máximo anunciado por la arquitectura como una configuración de memoria probada.
- GPU: orientado a Apple Silicon mediante MLX; no se especifican GPU NVIDIA (A100, H100, RTX 4090) en la información disponible.
- Despliegue: MLX-VLM (`mlx_vlm.generate`), Spotlight Local mediante Indicator Lab y Osaurus. No hay exportación GGUF, por lo que no aplica llama.cpp/Ollama con este artefacto.
- Descarga: `hf download tomvaillant/qwen3.5-9b-spotlight-r3-optiq-mlx --local-dir ...`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B Spotlight r3 OptiQ MLX | 9.409.813.744 | no disponible | Mixta 4/8 bits MLX | Apache 2.0 | Hugging Face (MLX safetensors) |
| Qwen/Qwen3.5-9B (base) | ~9B | no disponible | no disponible | Apache 2.0 | Hugging Face |
| Qwen3.5-9B Spotlight r3 MLX (uniforme 4 bits) | ~9B | no disponible | 4 bits uniforme | Apache 2.0 | Hugging Face (`tomvaillant/qwen3.5-9b-spotlight-r3-mlx`) |

No se dispone de datos de rendimiento comparativo con modelos de la misma categoría más allá de la comparación interna entre las dos exportaciones Spotlight.

## Limitaciones y advertencias

- Puede inventar personas, hechos, citas y argumentos de herramientas.
- Puede marcar incorrectamente como verificada una afirmación falsa.
- No es un verificador de hechos fiable por sí solo; toda conclusión requiere verificación independiente de la fuente por parte del periodista.
- Las comprobaciones de nombres del arnés solo establecen que un nombre aparece en el pasaje citado, no que el pasaje respalde la afirmación.
- Modelo de vista previa para un flujo con supervisión humana; no apto para uso autónomo en producción sin revisión.
- Solo inglés.
- Rendimiento de visión no evaluado en esta exportación.
- Memoria no validada en Mac de 24 GB; riesgo de presión de memoria crítica.
- Las comprobaciones de crecimiento de la ruta frontier siguen siendo inconclusas; no se ha ejecutado una investigación completa de brief a puerta sobre el commit final del arnés `2b1886f5a8f86bacbe9d374a1d25c4dd3085244f`.
- Licencia Apache 2.0 permite uso comercial, pero el modelo hereda las limitaciones del ajuste fino especializado y no debe presentarse como herramienta de verificación periodística autónoma.
- El corpus de entrenamiento no se distribuye, lo que limita la auditoría de sesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tomvaillant/qwen3.5-9b-spotlight-r3-optiq-mlx
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Exportación anterior uniforme de 4 bits: https://huggingface.co/tomvaillant/qwen3.5-9b-spotlight-r3-mlx
- MLX-VLM: https://github.com/Blaizzy/mlx-vlm
- Comparativa Spotlight vs Qwen3.5-9B: https://opentools.ai/compare/llms/spotlight-vs-qwen35-9b
