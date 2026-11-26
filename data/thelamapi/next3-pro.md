# thelamapi/next3-pro

## Resumen

Next 3 Pro es un modelo multimodal de 27.356 millones de parámetros desarrollado por Lamapi mediante ajuste fino supervisado (LoRA fusionado) sobre el checkpoint base Qwen/Qwen3.8-27B. Está orientado a tareas de ingeniería de software, razonamiento técnico y comprensión de documentos, imágenes y vídeo, con soporte específico para conversaciones técnicas en inglés y turco. Se distribuye como checkpoint Transformers fusionado y hereda la arquitectura, las modalidades de entrada y las interfaces del modelo base.

El modelo cubre generación y depuración de código, razonamiento matemático, análisis de capturas de pantalla y diagramas, resumen de vídeo y flujos de trabajo con tool calling y agentes. Incluye controles de modo de pensamiento (`enable_thinking`, `reasoning_effort`, `preserve_thinking`) expuestos por el stack de servicio, y admite la configuración de contexto largo del modelo base: 262.144 tokens nativos y hasta 1.000.000 en configuración extendida, aunque Lamapi no ha evaluado el checkpoint ajustado a esas longitudes.

Su relevancia actual reside en que combina un tamaño de 27B con capacidades multimodales y de agente en un único checkpoint fusionado, lo que simplifica el despliegue frente a pipelines separados de visión y código. La model card no publica resultados de benchmarks propios ni la licencia del modelo, lo que limita la evaluación independiente y el uso comercial sin consulta previa al autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda la de Qwen/Qwen3.8-27B); clase `qwen3_5` |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens nativos; hasta 1.000.000 en configuración extendida (según el modelo base; no evaluado por Lamapi en el checkpoint ajustado) |
| Tipos de cuantizacion | BF16 en el checkpoint principal; builds GGUF y TurboQuant publicados por el autor |
| Idiomas soportados | inglés (en), turco (tr) |
| Licencia | no disponible |
| Formato de pesos | safetensors (Transformers); GGUF en el repositorio Next-3-Pro-GGUF |

## Arquitectura y entrenamiento

Next 3 Pro conserva la arquitectura del modelo base Qwen/Qwen3.8-27B, un transformer multimodal con procesador capaz de aceptar contenido de texto, imagen y vídeo en el mismo formato de mensajes que el modelo original. Lamapi no detalla en la model card la composición interna del transformer (número de capas, atención, configuración de visión), sino que remite a la model card upstream para la configuración de ejecución y los ejemplos.

El ajuste se realizó mediante LoRA y se exportó como checkpoint fusionado (merged). La model card menciona únicamente los datasets `openai/gsm8k` y `google-research-datasets/mbpp` como datos asociados, sin especificar volumen de tokens, mezcla del dataset ni si hubo etapas de RLHF o DPO. No se documentan innovaciones técnicas propias más allá de la herencia del modelo base y de los controles de pensamiento expuestos por el stack de servicio.

## Capacidades

- Generación de código y depuración: redacción de funcionalidades, inspección de errores, propuesta de parches, escritura de tests y revisión de código ante cambios de requisitos.
- Razonamiento matemático y técnico: cálculos, comparación de alternativas bajo restricciones y explicación de soluciones con ejemplos concretos.
- Comprensión de imágenes: análisis de capturas de pantalla, diagramas, páginas escaneadas y layouts visuales mediante el procesador multimodal.
- Comprensión de vídeo: resumen de clips, seguimiento de cambios entre fotogramas y respuesta a preguntas sobre eventos visuales, con límites prácticos dependientes del runtime.
- Tool calling y flujos de agente: aceptación de esquemas de herramientas, ejecución de llamadas por parte de la aplicación y realimentación de resultados al modelo.
- Controles de pensamiento: modo de respuesta directa o modo de razonamiento configurable mediante `enable_thinking`, `reasoning_effort` y `preserve_thinking`.
- Contexto largo: admite entradas extensas según la configuración del modelo base (262.144 tokens nativos, hasta 1.000.000 extendidos).
- Multilingüe limitado: interacción técnica en inglés y turco, incluyendo proyectos donde la conversación y el código usan idiomas distintos.

## Casos de uso

- Desarrollo de prototipos front-end desde un brief: el modelo genera un archivo completo funcional (por ejemplo, un tablero de tareas en un único `index.html`) y lo revisa en turnos posteriores añadiendo búsqueda, deshacer y persistencia en `localStorage`, gracias a su ventana de contexto amplia y a su orientación a código.
- Depuración guiada por captura de pantalla: se envía una imagen de una interfaz rota junto con el mensaje de error del navegador; el modelo interpreta el layout, localiza el fallo y propone un parche concreto.
- Escritura y mantenimiento de tests: dado un módulo y una descripción de comportamiento esperado, genera tests unitarios y los ajusta cuando cambian los requisitos, integrándose en pipelines de CI/CD mediante tool calling.
- Asistencia técnica multi-turno en inglés y turco: atención a equipos distribuidos donde la documentación está en inglés y la conversación en turco, manteniendo coherencia entre ambos idiomas en la misma sesión.
- Análisis de documentación escaneada y diagramas de arquitectura: extracción de información de páginas escaneadas, diagramas de flujo y esquemas técnicos para responder preguntas o generar resúmenes estructurados.
- Resumen y consulta de vídeo técnico: revisión de grabaciones de sesiones de depuración o demos de producto para localizar el fotograma donde ocurre un cambio o un error.
- Agentes de automatización con herramientas: exposición de esquemas de funciones (consulta de APIs, ejecución de comandos permitidos) y realimentación de resultados para tareas de varios pasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni métricas multimodales para el checkpoint ajustado, y tampoco se aportan comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 55 GB solo para pesos (27.356 millones de parámetros a 2 bytes), más el espacio para contexto y caché KV; se recomienda un mínimo práctico de 64-80 GB.
- GPU recomendadas para BF16: A100 80 GB, H100 80 GB, o configuraciones multi-GPU con `device_map="auto"`.
- GPU de consumo: no cabe en BF16 en tarjetas de 24 GB (RTX 4090, 3090); requiere cuantización (builds GGUF o TurboQuant publicados por el autor) para ajustarse a 24 GB o menos, con la pérdida de calidad asociada.
- Opciones de despliegue: Transformers con un release que soporte Qwen3.8-27B; el autor publica builds GGUF (compatibles con llama.cpp y derivados como Ollama) y un build de compatibilidad TurboQuant; vLLM y TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles; dependen del hardware, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Next 3 Pro (thelamapi) | 27,36B | 262.144 nativos / hasta 1.000.000 extendidos (heredado) | Texto, imagen, vídeo | no disponible | Hugging Face (checkpoint, GGUF, TurboQuant) |
| Qwen/Qwen3.8-27B (modelo base) | 27B | 262.144 nativos / hasta 1.000.000 extendidos | Texto, imagen, vídeo | según el modelo base (consultar su model card) | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado entre Next 3 Pro y su modelo base ni con otros modelos de 27B, por lo que la comparativa se limita a parámetros, contexto, modalidades y disponibilidad.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial sin consultar al autor; además, las condiciones del modelo base Qwen/Qwen3.8-27B podrían aplicar en cascada.
- Sin benchmarks publicados: no hay evidencia cuantitativa del rendimiento del ajuste frente al modelo base ni frente a alternativas.
- Contexto largo no verificado: Lamapi declara explícitamente que no ha evaluado el checkpoint ajustado a 262.144 ni a 1.000.000 de tokens; el rendimiento a esas longitudes es desconocido.
- Idiomas limitados: solo inglés y turco declarados; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación: inherente a los modelos generativos; en tareas de código y análisis de imágenes conviene validar las salidas con tests y revisión humana.
- Sesgos: no documentados por el autor; se heredan los del modelo base y los de los datasets de ajuste (GSM8K, MBPP), sin evaluación de sesgos publicada.
- Dependencia del runtime para vídeo y controles de pensamiento: las capacidades de vídeo y los parámetros `enable_thinking`, `reasoning_effort` y `preserve_thinking` dependen de que el stack de servicio los exponga.
- Despliegue en BF16 costoso: requiere GPUs de 80 GB o multi-GPU; en consumo exige cuantización con posible degradación.
- Madurez del proyecto: 135 descargas y 4 likes en el momento de la consulta, lo que sugiere poca validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thelamapi/next3-pro
- Checkpoint principal: https://huggingface.co/thelamapi/Next-3-Pro
- Builds GGUF: https://huggingface.co/thelamapi/Next-3-Pro-GGUF
- Build de compatibilidad TurboQuant: https://huggingface.co/thelamapi/Next-3-Pro-TurboQuant
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Perfil del autor: https://huggingface.co/thelamapi
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset MBPP: https://huggingface.co/datasets/google-research-datasets/mbpp
