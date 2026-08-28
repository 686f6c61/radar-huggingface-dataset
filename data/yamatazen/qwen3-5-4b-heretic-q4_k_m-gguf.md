# yamatazen/Qwen3.5-4B-heretic-Q4_K_M-GGUF

## Resumen

El modelo `yamatazen/Qwen3.5-4B-heretic-Q4_K_M-GGUF` es una cuantizacion GGUF en formato Q4_K_M del modelo base `coder3101/Qwen3.5-4B-heretic`, una variante "heretic" (sin censura, decensored y abliterated) del modelo Qwen3.5-4B de la serie Qwen. El autor, yamatazen, publica regularmente cuantizaciones GGUF de modelos derivados de Qwen, orientadas a su uso con llama.cpp y motores compatibles como Ollama o LM Studio. La etiqueta `image-text-to-text` indica que el modelo base es multimodal, capaz de procesar tanto texto como imagenes, aunque la cuantizacion GGUF puede limitar o requerir configuracion especifica para esa funcionalidad.

Este modelo es relevante para desarrolladores que buscan una version ligera (4B de parametros) de Qwen3.5 sin los filtros de seguridad habituales, util en entornos de investigacion o generacion creativa donde se requiere menor autocensura. Al estar cuantizado en Q4_K_M, puede ejecutarse en hardware de consumo con requisitos de VRAM moderados. No obstante, la informacion publica sobre el modelo es escasa: no se especifican licencia, idiomas, ni detalles de entrenamiento mas alla de los tags, por lo que esta ficha se basa en los datos disponibles y en el contexto de la serie Qwen3.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente transformer multimodal, basado en Qwen3.5-4B) |
| Parametros totales | 4B (inferido del nombre) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible (el modelo base Qwen3.5 soporta multiples idiomas, pero no se confirma) |
| Licencia | no disponible (el modelo base tiene tag `apache-2.0`, pero la ficha de HF indica "no disponible") |
| Formato de pesos | GGUF (cuantizacion Q4_K_M) |

## Arquitectura y entrenamiento

No se dispone de informacion oficial sobre la arquitectura interna del modelo base `coder3101/Qwen3.5-4B-heretic`. Por el nombre y la serie, se infiere que se basa en la arquitectura de Qwen3.5-4B, que segun la pagina de Ollama integra "avances en aprendizaje multimodal, eficiencia arquitectonica, escala de RL y accesibilidad global". El sufijo "heretic" indica que el modelo ha sido sometido a un proceso de "abliteration" (eliminacion de capas o pesos asociados a comportamientos de rechazo) y "decensoring", lo que reduce la probabilidad de que el modelo se niegue a responder a ciertas solicitudes. El proceso de cuantizacion a GGUF Q4_K_M fue realizado por yamatazen, presumiblemente con herramientas como llama.cpp o scripts similares. No hay datos publicos sobre el dataset de entrenamiento, el numero de tokens, ni si se aplicaron tecnicas como RLHF o DPO.

## Capacidades

- Generacion de texto libre con menor censura que el modelo original, gracias al proceso de abliteration.
- Procesamiento multimodal (imagen y texto) segun la etiqueta `image-text-to-text`, aunque la cuantizacion GGUF puede requerir un runtime compatible con vision (p. ej., llama.cpp con soporte de mmproj).
- Conversacion multi-turno (tag `conversational`).
- Compatible con motores de inferencia basados en GGUF como llama.cpp, Ollama, LM Studio y otros.
- No se confirma soporte de tool calling, function calling ni razonamiento agente, aunque los modelos Qwen3.5 suelen incluirlo; no hay evidencia en la informacion disponible.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como se comporta un LLM sin filtros de rechazo, util para analizar sesgos o evaluar tecnicas de mitigacion.
- Generacion creativa sin restricciones: escritura de ficcion, poesia o guiones donde el modelo original podria rechazar ciertos temas (violencia, contenido adulto, etc.).
- Pruebas de robustez en pipelines de generacion: verificar si un sistema de moderacion externo es necesario cuando se usa un modelo "uncensored" en produccion.
- Desarrollo de chatbots de rol (roleplay) en entornos privados, donde los usuarios buscan respuestas menos restrictivas.
- Evaluacion de cuantizaciones: comparar la calidad de salida de Q4_K_M frente a otras cuantizaciones del mismo modelo base.
- Uso educativo en cursos sobre LLMs: demostrar el impacto de la cuantizacion y la ablacion en el comportamiento del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo cuantizado ni para su base.

## Requisitos de hardware

- VRAM estimada: para un modelo de 4B en Q4_K_M, se requieren aproximadamente 3-4 GB de VRAM para inferencia en FP16, y menos en cuantizaciones menores. Con Q4_K_M, el uso de VRAM suele rondar los 2.5-3 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1660 Super, RTX 2060, RTX 3050, o superiores (RTX 3060, 4060, etc.). Tambien puede ejecutarse en CPU con suficiente RAM (8-16 GB).
- Cabe en GPU de consumo: si, en GPUs de gama media y baja.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui (con backend llama.cpp), y servidores compatibles con GGUF.
- Latencia y throughput: no se dispone de mediciones especificas. En una RTX 3060, un modelo 4B Q4_K_M suele generar entre 20 y 40 tokens por segundo, dependiendo de la longitud de contexto y el hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| yamatazen/Qwen3.5-4B-heretic-Q4_K_M-GGUF | 4B | no disponible | no disponible | GGUF Q4_K_M | Version "heretic" sin censura |
| yamatazen/Qwen3-4B-Instruct-2507-heretic-Q4_K_M-GGUF | 4B | no disponible | no disponible | GGUF Q4_K_M | Similar, basado en Qwen3-4B-Instruct-2507 |
| Qwen3.5-4B (original) | 4B | no disponible | Apache 2.0 (segun tags) | safetensors | Modelo oficial con censura estandar |

No se dispone de datos de rendimiento comparativo. La diferencia principal es el proceso de "heretic" (abliteration) y la cuantizacion.

## Limitaciones y advertencias

- Sesgos conocidos: al ser una version "uncensored", puede generar contenido ofensivo, ilegal o danino sin filtros. No se ha evaluado su sesgo sistematico.
- Riesgo de alucinacion: alto, como en cualquier modelo de 4B, especialmente en tareas factuales o de razonamiento complejo.
- Limitaciones de contexto: no se conoce la longitud de contexto; los modelos Qwen3.5 suelen soportar 128K o mas, pero la cuantizacion puede reducir la ventana util.
- Limitaciones de idioma: no se confirman idiomas soportados; probablemente hereda el multilingueismo de Qwen, pero sin garantia.
- Restricciones de licencia: la licencia del modelo cuantizado no esta especificada; el modelo base tiene tag `apache-2.0`, pero el autor no la confirma. Para uso comercial, se recomienda contactar con el autor o verificar el modelo base.
- Caveat de produccion: no se recomienda su uso en aplicaciones publicas sin un sistema de moderacion externo, debido a la ausencia de filtros de seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yamatazen/Qwen3.5-4B-heretic-Q4_K_M-GGUF
- Modelo base (referencia): https://huggingface.co/coder3101/Qwen3.5-4B-heretic (no verificado)
- Perfil del autor: https://huggingface.co/yamatazen
- Modelo similar de mradermacher: https://huggingface.co/mradermacher/Qwen3.5-4B-heretic-GGUF
- Pagina de Qwen3.5 en Ollama: https://ollama.com/library/qwen3.5:4b
- Repositorio oficial de Qwen3.5 (serie): https://github.com/QwenLM/Qwen3.8 (incluye informacion sobre Qwen3.5)
