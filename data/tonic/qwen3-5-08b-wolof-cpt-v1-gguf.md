# Tonic/Qwen3.5-08B-Wolof-CPT-v1-GGUF

## Resumen

Qwen3.5-08B-Wolof-CPT-v1-GGUF es la exportación en formato GGUF del modelo Tonic/Qwen3.5-08B-Wolof-CPT-v1, un ajuste fino del modelo Qwen3.5 de 8.000 millones de parámetros orientado al idioma wolof. Lo publica el usuario Tonic bajo el paraguas del proyecto GalsenAI, y está pensado para su uso con llama.cpp y otros runners compatibles con GGUF. La nomenclatura "CPT" sugiere un entrenamiento continuado (continued pre-training) sobre el checkpoint base de Qwen3.5.

El modelo resuelve el problema de la escasa cobertura del wolof en los LLM generalistas: en lugar de depender de un modelo multilingüe genérico, ofrece un checkpoint especializado que puede ejecutarse en hardware de consumo gracias a la cuantización. El repositorio ocupa 5,2 GB e incluye cinco niveles de cuantización (F16, Q8_0, Q5_K_M, Q4_K_M y Q4_0), lo que permite desplegarlo desde estaciones de trabajo con GPU hasta portátiles sin GPU dedicada.

La relevancia actual del modelo es doble: por un lado, amplía el ecosistema de modelos de bajo recursos para lenguas africanas; por otro, su empaquetado GGUF lo hace inmediatamente utilizable en herramientas como llama.cpp, Ollama o LM Studio. Conviene señalar que la información pública disponible es muy limitada: no se detallan licencia, idiomas soportados, composición del dataset ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5; detalles no disponibles) |
| Parametros totales | 1.014.371.136 (según safetensors del modelo base; la nomenclatura "08B" del nombre no coincide con este dato) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | no disponible (el nombre y las etiquetas indican wolof; no se detalla multilingüismo) |
| Licencia | no disponible |
| Formato de pesos | GGUF (repositorio de cuantizaciones); el modelo base se distribuye presumiblemente en safetensors |

## Arquitectura y entrenamiento

El modelo base es un ajuste de Qwen3.5, familia de transformers decoder-only de Alibaba. La información disponible no especifica la arquitectura exacta del checkpoint (número de capas, dimensiones ocultas, mecanismo de atención ni uso de atención lineal o híbrida). El sufijo "CPT" indica continued pre-training, es decir, un entrenamiento adicional sobre el modelo Qwen3.5 original con corpus en wolof, presumiblemente para reforzar la competencia lingüística en ese idioma antes de un posible ajuste instructivo.

No se han publicado datos sobre el volumen de tokens de entrenamiento, la composición del corpus, la existencia de fases de RLHF o DPO, ni innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.). Tampoco se detalla si el modelo conserva el modo "thinking" de la familia Qwen3. La model card se limita a indicar el origen del checkpoint y los comandos de uso con llama.cpp.

## Capacidades

- Generación de texto conversacional: la etiqueta "conversational" y el ejemplo de la model card ("Salaam aleekum, naka nga def?") apuntan a un uso de diálogo en wolof.
- Competencia lingüística en wolof: el propósito declarado del ajuste es mejorar el rendimiento en ese idioma respecto al Qwen3.5 base.
- Compatibilidad con llama.cpp: el formato GGUF permite su uso con llama-cli, llama-server y servidores compatibles con la API de OpenAI (etiqueta endpoints_compatible).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles más allá del wolof.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Asistentes conversacionales en wolof: el modelo puede gestionar diálogos multi-turno en ese idioma, lo que lo hace adecuado para chatbots de atención ciudadana o servicios locales en Senegal y la diáspora.
- Traducción wolof-francés y wolof-inglés: aunque no se documenta explícitamente, un CPT sobre Qwen3.5 conserva parte del conocimiento multilingüe del base y puede emplearse en pipelines de traducción asistida con revisión humana.
- Educación y alfabetización digital: generación de material didáctico, resúmenes y explicaciones en wolof para plataformas de aprendizaje de bajo recursos.
- Procesamiento de documentos y transcripciones: resumen y extracción de información de textos en wolof en entornos con hardware modesto, gracias a las cuantizaciones Q4_K_M y Q5_K_M.
- Despliegue en dispositivos de borde: al caber en configuraciones de 4-8 GB de VRAM según cuantización, puede ejecutarse en portátiles y mini-PC para prototipos de campo sin conexión.
- Investigación en lenguas de bajos recursos: sirve como checkpoint de referencia para experimentos de CPT, evaluación de calidad lingüística y comparación con modelos multilingües genéricos.
- Integración en aplicaciones móviles o de escritorio: mediante llama.cpp u Ollama, puede incrustarse en herramientas locales para usuarios que requieran privacidad y funcionamiento offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, para ~1.000 millones de parámetros): F16 en torno a 2 GB, Q8_0 en torno a 1,1 GB, Q5_K_M en torno a 0,8 GB, Q4_K_M en torno a 0,7 GB y Q4_0 en torno a 0,6 GB, más overhead de contexto y KV cache. Estas cifras son estimaciones a partir del recuento de parámetros del safetensors y no de mediciones publicadas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para las cuantizaciones Q4 y Q5; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para despliegues con mayor contexto o concurrencia.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 4 GB o más; también en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio y cualquier runtime compatible con GGUF; la etiqueta endpoints_compatible sugiere compatibilidad con endpoints tipo OpenAI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Tonic/Qwen3.5-08B-Wolof-CPT-v1-GGUF | 1.014.371.136 (según safetensors) | no disponible | wolof (declarado) | no disponible | GGUF |
| Qwen3.5 base (8B, referencia) | ~8.000 millones (según nomenclatura) | no disponible | multilingüe | no disponible | safetensors |
| Modelos multilingües genéricos de ~1-8B | variable | variable | decenas de idiomas | variable | safetensors, GGUF |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas concretas de la misma categoría (modelos especializados en wolof o modelos multilingües de tamaño similar). Los datos de la familia Qwen3.5 base no se detallan en la información proporcionada.

## Limitaciones y advertencias

- La licencia no está declarada en la información disponible; antes de un uso comercial es imprescindible verificar los términos del modelo base Qwen3.5 y del repositorio.
- Existe una discrepancia entre el nombre del modelo ("08B") y el recuento real de parámetros del safetensors (1.014.371.136); conviene confirmar el tamaño efectivo antes de planificar el despliegue.
- No se documentan los idiomas soportados ni el grado de conservación del multilingüismo del modelo base tras el CPT en wolof; es probable una degradación en otros idiomas.
- No hay información sobre sesgos, calidad del corpus de entrenamiento ni evaluación de alucinación; en lenguas de bajos recursos el riesgo de respuestas inventadas es especialmente alto.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y la model card es mínima; se trata de un artefacto sin validación comunitaria.
- No se especifica la longitud de contexto soportada, lo que impide garantizar conversaciones largas o procesamiento de documentos extensos.
- Al ser un CPT y no un ajuste instructivo documentado, el comportamiento conversacional puede ser irregular; se recomienda evaluar con prompts reales antes de producción.
- La fecha de creación del repositorio (2026-11-13) es posterior a la fecha habitual de consulta; verificar la vigencia y procedencia del artefacto.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Tonic/Qwen3.5-08B-Wolof-CPT-v1-GGUF
- Modelo base: https://huggingface.co/Tonic/Qwen3.5-08B-Wolof-CPT-v1
- Proyecto GalsenAI: no disponible (solo aparece como etiqueta)
- Paper, blog o demo oficial: no disponible
- llama.cpp: https://github.com/ggml-org/llama.cpp
