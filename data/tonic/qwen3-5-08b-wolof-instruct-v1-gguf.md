# Tonic/Qwen3.5-08B-Wolof-Instruct-v1-GGUF

## Resumen

Qwen3.5-08B-Wolof-Instruct-v1-GGUF es la exportación en formato GGUF del modelo Tonic/Qwen3.5-08B-Wolof-Instruct-v1, un ajuste fino orientado a instrucciones en lengua wolof. Lo publica el usuario Tonic bajo el paraguas del proyecto galsenai, y está pensado para su uso con llama.cpp y entornos compatibles con GGUF. El modelo deriva de la familia Qwen3.5, aunque la model card no documenta la arquitectura interna ni los detalles del proceso de ajuste.

El dato más relevante es la discrepancia entre el nombre comercial ("08B") y el recuento real de parámetros en safetensors: 1.014.371.136 parámetros, es decir, aproximadamente 1.000 millones. El repositorio ocupa 5,2 GB, un tamaño coherente con múltiples cuantizaciones de un modelo de ese orden y no con uno de 8.000 millones. Conviene tratar la etiqueta "08B" con cautela y verificar el checkpoint base antes de cualquier despliegue.

La relevancia del modelo es doble: por un lado, cubre una lengua de bajos recursos como el wolof, con escasa representación en modelos abiertos; por otro, ofrece cuantizaciones listas para ejecución local en hardware modesto. No obstante, la información pública es muy limitada: no hay licencia declarada, no se especifican idiomas soportados ni se han publicado benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de la familia Qwen3.5; sin detalle en la model card) |
| Parametros totales | 1.014.371.136 (según safetensors); la denominación comercial indica "08B" |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | no disponible (el nombre y las etiquetas apuntan a wolof; no se declara lista oficial) |
| Licencia | no disponible |
| Formato de pesos | GGUF (conversión del checkpoint original; el formato del modelo base no se detalla) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. Por el nombre y las etiquetas, se trata de un ajuste fino de instrucciones sobre un modelo de la familia Qwen3.5, orientado al wolof y publicado bajo el sello galsenai. No se especifica si el transformer subyacente emplea atención estándar o alguna variante, ni se documentan mecanismos como decodificación especulativa o atención lineal.

Tampoco hay información sobre el corpus de entrenamiento: no se indica el número de tokens, la composición del dataset, el uso de RLHF o DPO, ni las técnicas de alineación aplicadas. La única información operativa es la lista de cuantizaciones disponibles y un ejemplo de invocación con `llama-cli`. Cualquier afirmación sobre el proceso de entrenamiento sería especulativa.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` y la etiqueta `conversational` sugiere uso en diálogo multi-turno.
- Instrucciones: el sufijo "Instruct" indica ajuste para seguir instrucciones, aunque no se detalla el formato de prompt ni las plantillas de chat.
- Multilingüismo: orientado al wolof según nombre y etiquetas; no se declara cobertura de otras lenguas.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere despliegue en infraestructura de inferencia compatible, sin más detalle.

## Casos de uso

- Asistentes conversacionales en wolof: el modelo puede gestionar diálogos multi-turno en esta lengua, un nicho con poca cobertura en modelos abiertos. Adecuado para prototipos de atención al usuario en comunidades wolófonas.
- Traducción y mediación lingüística: útil como base para tareas de traducción wolof-castellano o wolof-francés, siempre que se valide la calidad con evaluaciones propias, dado que no hay benchmarks publicados.
- Educación y preservación lingüística: generación de material didáctico, ejercicios o textos divulgativos en wolof para entornos con recursos limitados.
- Despliegue local en hardware de consumo: las cuantizaciones Q4_K_M y Q4_0 permiten ejecución en GPU de gama media o incluso en CPU con llama.cpp, lo que facilita pruebas sin infraestructura dedicada.
- Integración en pipelines de CI/CD para evaluación de modelos: el tamaño reducido (1.000 millones de parámetros reales) permite iterar rápidamente en pruebas de regresión de calidad lingüística.
- Investigación en lenguas de bajos recursos: punto de partida para fine-tuning adicional, análisis de sesgos o comparación de técnicas de adaptación en wolof.
- Chatbots de dominio acotado: con contexto y plantilla de prompt definidos por el integrador, puede emplearse en asistentes de información local o servicios comunitarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.014 millones de parámetros, F16 requiere aproximadamente 2 GB de pesos; Q8_0 en torno a 1,1 GB; Q5_K_M cerca de 0,8 GB; Q4_K_M y Q4_0 alrededor de 0,6-0,7 GB. Añadir margen para el contexto KV (dependiente de la longitud de contexto, no documentada).
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente para las cuantizaciones Q4/Q5; una RTX 3060, RTX 4060 o superior ofrece holgura. Para F16, 4-6 GB bastan.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer actuales, e incluso en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (previa conversión o importación del GGUF), y servidores compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa, por lo que requerirían el checkpoint original.
- Latencia y throughput: no disponible. Con este tamaño, en GPU consumer se espera una latencia baja, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Tonic/Qwen3.5-08B-Wolof-Instruct-v1-GGUF | 1.014 M (según safetensors) | no disponible | no disponible | GGUF | Ajuste en wolof, cuantizaciones F16 a Q4_0 |
| Tonic/Qwen3.5-08B-Wolof-Instruct-v1 | no disponible | no disponible | no disponible | no disponible | Checkpoint base del que deriva este GGUF |
| Alternativas de ~1B multilingües (p. ej. Qwen2.5-1.5B-Instruct) | ~1.500 M | 32.768 tokens (según documentación pública del modelo) | Apache 2.0 (según documentación pública) | safetensors, GGUF | Cobertura multilingüe amplia, pero sin especialización en wolof |
| Alternativas de ~7-8B (p. ej. Qwen2.5-7B-Instruct) | ~7.600 M | 131.072 tokens (según documentación pública) | Apache 2.0 (según documentación pública) | safetensors, GGUF | Mayor capacidad, requiere más VRAM; no especializado en wolof |

Las alternativas citadas se incluyen como referencia de categoría; los datos de contexto y licencia provienen de su documentación pública y no de la información proporcionada para este modelo.

## Limitaciones y advertencias

- Discrepancia de tamaño: el nombre indica "08B" pero el recuento real es de ~1.014 millones de parámetros. Verificar el checkpoint antes de asumir capacidades de un modelo de 8B.
- Licencia no declarada: no se puede confirmar el uso comercial. Contactar con el autor o consultar el modelo base antes de producción.
- Idiomas no declarados oficialmente: la especialización en wolof se infiere del nombre y las etiquetas, no de una lista formal.
- Sin benchmarks: no hay evidencia publicada de calidad en MMLU, HumanEval, GSM8K ni evaluaciones en wolof.
- Riesgo de alucinación: inherente a los modelos generativos; sin datos de alineación (RLHF/DPO) documentados, el riesgo no puede acotarse.
- Contexto desconocido: no se especifica la longitud de ventana, lo que impide planificar casos de uso con documentos largos.
- Formato de prompt no documentado: no se detalla la plantilla de chat, lo que puede degradar la calidad de las respuestas si se usa una plantilla incorrecta.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.
- Sesgos: no documentados; en lenguas de bajos recursos es habitual encontrar sesgos de representación y calidad desigual.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/Tonic/Qwen3.5-08B-Wolof-Instruct-v1-GGUF
- Modelo base: https://huggingface.co/Tonic/Qwen3.5-08B-Wolof-Instruct-v1
- llama.cpp (repositorio oficial): https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- No se han encontrado papers, blogs, demos ni repositorios adicionales específicos del modelo en la búsqueda web realizada.
