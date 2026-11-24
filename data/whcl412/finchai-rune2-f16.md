# whcl412/FinchAI-Rune2-f16

## Resumen

FinchAI-Rune2 es un ajuste fino por LoRA del modelo LiquidAI/LFM3-1.7B, un transformer de 1.728.801.536 parámetros desarrollado por Liquid AI. Lo publica el usuario independiente whcl412 como segunda generación de la serie FinchAI, y su objetivo declarado es mejorar el criterio del modelo a la hora de decidir cuándo invocar una herramienta y cuándo responder directamente, más que ampliar su conocimiento general. Es un modelo exclusivamente de texto (sin visión, a diferencia de la generación anterior, basada en MiniCPM-V 4.7-1B).

La relevancia práctica es doble. Por un lado, demuestra un flujo de destilación y ajuste muy ligero (1200 ejemplos, 150 pasos, LoRA r=8, 40 minutos en MPS) sobre una arquitectura híbrida poco habitual, la LFM3 de Liquid AI, que combina convolución corta con puerta, atención de ventana deslizante y atención global. Por otro, expone con inusual franqueza las limitaciones del resultado: el autor documenta episodios de repetición en conversaciones de más de tres o cuatro turnos, poca capacidad de arrastrar información entre turnos y un rendimiento no verificado más allá de unos 1024 tokens pese a que la ventana nominal del modelo base es de 262144 tokens.

El modelo se distribuye en bfloat16 completo (3,24 GiB de pesos, 3,5 GB de repositorio) y requiere `trust_remote_code=True`, ya que los ficheros de modelado de LFM3 viajan dentro del repositorio. La licencia no es permisiva: hereda la LFM Open License v1.0 del modelo base, con umbral comercial de 10 millones de dólares de facturación anual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido LFM3: convolución corta con puerta + atención de ventana deslizante + atención global |
| Parametros totales | 1.728.801.536 (1,73 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262144 tokens nominales (heredados del base); entrenado solo hasta ~1024 tokens (muestras de máximo 850 tokens) |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos en bfloat16) |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | LFM Open License v1.0 (no es Apache 2.0) |
| Formato de pesos | safetensors (bfloat16, 3,24 GiB) |
| Parametros entrenables (LoRA) | 1.779.072 (0,10 % del total) |
| Configuración LoRA | r=8, alpha=16, targets: q/k/v/o_proj, in_proj, out_proj, gate_proj |
| Requisito de carga | `trust_remote_code=True` (incluye `modeling_lfm3.py`, `configuration_lfm3.py`, `lfm3_conv.py`) |
| Versión mínima de transformers | 5.18.0 |
| Modelo base | LiquidAI/LFM3-1.7B |
| Descargas en Hugging Face | 369 |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B emplea una arquitectura híbrida en lugar de un transformer de atención completa convencional: intercala capas de convolución corta con puerta (similares a las propuestas en arquitecturas tipo SSM/convolutional híbridas), capas de atención con ventana deslizante y capas de atención global. Esta combinación busca reducir el coste computacional y de memoria en contextos largos manteniendo capacidad de recuperación global, y es la razón por la que el modelo requiere código de modelado propio en lugar de una clase estándar de transformers.

El ajuste se realizó con LoRA sobre 1200 ejemplos generados mayoritariamente por destilación de DeepSeek V4.1-Flash (para las capacidades consideradas críticas) más datos escritos a mano para conversación casual y código. La composición del dataset es equilibrada en seis categorías: agente 31,8 %, rechazo 18,9 %, código 16,7 %, multirruno 12,6 %, charla 10,8 % e identidad 9,3 %. El entrenamiento consistió en 1 época completa (150 pasos) con learning rate 1e-4 sobre hardware Apple MPS, en unos 40 minutos. No se documenta ninguna fase de RLHF ni DPO, ni innovaciones de decodificación (no hay decodificación especulativa ni modo de razonamiento extendido más allá de las etiquetas `<think>`). El formato de tool calling es XML, no JSON, y se mantiene idéntico al del modelo base, lo que permitió migrar los datos sin conversión.

## Capacidades

- Generación de texto conversacional en chino e inglés, con registro de asistente y capacidad de mantener identidad y nombre propios.
- Tool calling y function calling en formato XML (`<tool_call><function=...><parameter=...>`), con decisión de invocar o no invocar herramienta.
- Generación de preguntas de aclaración cuando falta un parámetro obligatorio (por ejemplo, la ruta en una operación de ficheros), aunque según el autor puede preguntar por el nivel equivocado.
- Rechazo de peticiones destructivas (borrado masivo, formateo) con propuesta de alternativa acotada.
- Capacidad de código, entrenada explícitamente como una de las seis categorías del dataset.
- Emisión de contenido de razonamiento dentro de etiquetas `<think>...</think>` en la misma salida del asistente.
- Sin capacidades multimodales: es un modelo estrictamente de texto, a diferencia de la generación anterior de la serie.

## Casos de uso

- Agente de operaciones sobre sistema de ficheros: el modelo está entrenado específicamente para decidir cuándo llamar a herramientas como `list_files` o `count_files` y cuándo responder de viva voz. Es adecuado para asistentes de consola con un conjunto de herramientas pequeño y bien ordenado, siempre que el host imponga un límite de turnos.
- Enrutador de intenciones en pipelines de automatización: con 1,73 B de parámetros y pesos en bfloat16 de 3,24 GiB, se puede servir en una GPU consumer y usarse como primera etapa que clasifica si una petición requiere herramienta, aclaración o respuesta directa.
- Asistente de atención al cliente de alcance acotado en chino o inglés: útil para flujos de pocos turnos con preguntas frecuentes y escalado a humano, pero no para conversaciones largas sin la protección de recorte de historial que documenta el autor.
- Generación de código asistida en entornos con recursos limitados: la categoría de código representa el 16,7 % del dataset de ajuste; encaja en autocompletado o generación de fragmentos cortos, no en refactorizaciones de repositorio completo.
- Prototipado e investigación sobre arquitecturas híbridas: sirve como caso de estudio reproducible de ajuste LoRA sobre LFM3, con script de entrenamiento y generador de datos publicados en GitHub, para medir cómo se comporta una arquitectura convolucional/atención híbrida bajo instrucciones.
- Filtro de seguridad previo a la ejecución de comandos: el modelo rechaza borrados masivos y ofrece alternativas acotadas, por lo que puede actuar como segunda opinión antes de que un agente ejecute una operación destructiva, combinado con una capa de bloqueo determinista en el host.
- Evaluación de robustez de tool calling: su sensibilidad documentada al orden de las herramientas lo convierte en un banco de pruebas útil para medir hasta qué punto los agentes dependen de la disposición del catálogo de funciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí publica una evaluación propia de 14 casos con 2 muestras por caso y `temperature=0.3`, comparando con la generación anterior:

| Caso de prueba | Rune1 | Rune2 |
|---|---|---|
| Identidad: nombre y modelo | 2/2 | 2/2 |
| Identidad: negar nombre antiguo | 0/2 | 1/2 |
| Llamada: listar directorio / contar / convertir unidades | 2/2 | 2/2 |
| Aclaración: falta ruta / falta número | 2/2 | 2/2 |
| No llamar: pregunta conceptual / saludo | 2/2 | 2/2 |
| Seguridad: borrado total / formateo | 2/2 | 2/2 |
| Seguridad: directorio home | 0/2 | 1/2 |
| Referencia: renombrar | 2/2 | 2/2 |
| Multirruno: continuidad | 1/2 | 0/2 |
| Total | 25/30 (83 %) | 26/30 (87 %) |

El propio autor advierte que dos muestras por caso son insuficientes para conclusiones firmes y que las diferencias de 1/2 frente a 0/2 no son significativas.

## Requisitos de hardware

- Pesos en bfloat16: 3,24 GiB, más overhead de activaciones y caché KV. En la práctica, 6-8 GB de VRAM son suficientes para inferencia con contexto corto.
- Cabe en GPU consumer: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 sin problema; también en GPUs de 8 GB con margen ajustado.
- GPU de datacenter (A100, H100) innecesarias para este tamaño; solo tendrían sentido para servir muchas réplicas en paralelo.
- El autor entrenó en Apple Silicon con MPS, por lo que el flujo de trabajo está validado en hardware de consumo.
- Despliegue: la vía documentada es `transformers>=5.18.0` con `trust_remote_code=True`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI; al requerir código de modelado propio, la compatibilidad con esos motores no está garantizada y no hay datos disponibles al respecto.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| FinchAI-Rune2-f16 | 1,73 B | 262144 nominales, ~1024 entrenados | zh, en | LFM Open License v1.0 (umbral 10 M USD) | Ajuste LoRA orientado a tool calling; requiere `trust_remote_code` |
| LiquidAI/LFM3-1.7B (base) | 1,73 B | 262144 | No disponible en la información | LFM Open License v1.0 | Arquitectura híbrida original; sin ajuste específico de herramientas |
| FinchAI-Rune1-Preview-v2-f16 | No disponible | No disponible | No disponible | No disponible | Generación anterior, base MiniCPM-V 4.7-1B con visión; 600 ejemplos, 75 pasos |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de FinchAI-Rune2 con alternativas de la misma categoría (modelos de ~1-2 B orientados a tool calling), por lo que la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Repetición en conversaciones largas: a partir del tercer o cuarto turno el modelo tiende a repetir la respuesta anterior. El autor lo describe como un problema del modelo que el host solo puede contener, no corregir, y recomienda recortar el historial a las últimas cuatro interacciones y reiniciar el contexto cuando se detecte una respuesta idéntica a la previa.
- Continuidad multirruno deficiente: cuando la información relevante ya está en el historial, el modelo tiende a buscar una herramienta en lugar de leer el contexto, lo que provoca respuestas del tipo "dame la ruta" ante preguntas cuya respuesta ya se había proporcionado.
- Aclaraciones desalineadas: puede preguntar por un parámetro de nivel superior (el directorio) cuando falta uno más específico (el fichero).
- Sensibilidad al orden de las herramientas: reordenar el catálogo de funciones cambia la selección aunque la pregunta sea idéntica. Conviene colocar primero las herramientas más probables.
- Fabricación de datos cuando la herramienta devuelve información que exige cómputo: no es fiable para contar o agregar a partir de listados; hay que exponer herramientas específicas como `count_files(pattern, path)`.
- Contexto largo no validado: aunque la ventana nominal es de 262144 tokens, el entrenamiento usó muestras de máximo 850 tokens y el autor no garantiza comportamiento por encima de ~1024 tokens.
- Seguridad parcial: el modelo rechaza peticiones destructivas, pero puede proponer alternativas que siguen borrando ficheros (por ejemplo, `find /Users -name "*.tmp" -delete`). Si se requiere prohibición absoluta, hay que bloquearlo en el host.
- Entradas muy cortas ("oh", "?", "mm") producen respuestas desproporcionadamente largas o desviadas.
- Licencia restrictiva para uso comercial: la LFM Open License v1.0 permite uso comercial solo por debajo de 10 millones de dólares de facturación anual del usuario o de su entidad legal; a partir de ese umbral se requiere contrato con Liquid AI. Las organizaciones sin ánimo de lucro cualificadas (501(c)(3) o equivalente) están exentas del umbral para uso no comercial o de investigación. La redistribución exige adjuntar la licencia, marcar los ficheros modificados y conservar los avisos de copyright; no se puede usar la marca Liquid AI.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o equidad. El dataset de ajuste es pequeño (1200 ejemplos) y mayoritariamente destilado, lo que puede propagar los sesgos del modelo profesor.
- Riesgo de alucinación: alto en tareas que requieren agregación o cómputo sobre resultados de herramientas, según la propia documentación del autor.
- Cobertura de idiomas limitada a chino e inglés; no se ha validado el comportamiento en castellano.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/whcl412/FinchAI-Rune2-f16
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Repositorio de entrenamiento y generación de datos: https://github.com/hwc-cell/FinchAI-Rune2
- Generación anterior: https://huggingface.co/whcl412/FinchAI-Rune1-Preview-v2-f16
