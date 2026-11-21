# underlotus/Qwen3.8-27B-Ultimate-Heretic-Uncensored-oQ3h-mtp

## Resumen

Qwen3.8-27B-Ultimate-Heretic-Uncensored-oQ3h-mtp es una cuantizacion mixta del checkpoint Qwen3.8-27B en su variante "Ultimate Heretic Uncensored", publicada por el usuario underlotus en Hugging Face. El artefacto esta empaquetado para la libreria MLX (Apple Silicon) y utiliza el formato oQ de cuantizacion de precision mixta generado con oMLX v0.8.0. El resultado es un checkpoint de 6.276.813.040 parametros logicos almacenados en 14,4 GB de repositorio, con un promedio efectivo de 18,300 bits por peso.

El modelo base pertenece a la familia Qwen3.5 (tag `qwen3_5`), con un tamano nominal de 27B segun el nombre del checkpoint, e incorpora una cabeza MTP (multi-token prediction) de 0,425B parametros y un modulo de vision de 0,461B parametros. La cuantizacion no es uniforme: combina tensores en affine 4-bit (grupo 64), affine 6-bit (grupo 64), BF16 y U32, de modo que las capas consideradas mas sensibles conservan mayor precision mientras que el grueso del modelo se comprime.

La relevancia de esta ficha es doble. Por un lado, documenta un caso real de cuantizacion mixta agresiva sobre un modelo multimodal con cabeza MTP, un patron cada vez mas comun en despliegues locales sobre hardware Apple. Por otro, advierte de que se trata de un derivado no oficial, sin model card tecnica del modelo base, sin licencia declarada y sin benchmarks publicados, por lo que su evaluacion en produccion exige verificacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5`); incluye modulo de vision y cabeza MTP |
| Parametros totales | 6.276.813.040 (pesos logicos del checkpoint cuantizado) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta oQ: affine 4-bit grupo 64, affine 6-bit grupo 64, BF16 y U32; promedio 18,300 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `mlx`), cuantizacion oQ |
| Tamano del repositorio | 14,4 GB (13,372 GiB de pesos) |
| Fecha de publicacion | 2026-11-20 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El checkpoint es un derivado cuantizado, no un modelo entrenado desde cero. La arquitectura subyacente corresponde a la familia Qwen3.5, un transformer con modulo de vision (0,461B parametros) y una cabeza MTP (0,425B parametros) que permite prediccion multi-token, tecnicamente orientada a decodificacion especulativa y a mejorar el throughput de generacion. El cuerpo del modelo de lenguaje concentra 5,391B parametros logicos.

La cuantizacion se realizo con oMLX v0.8.0 aplicando precision mixta por tensor. La distribucion de almacenamiento es la siguiente: 1,644B pesos en affine 4-bit grupo 64 (0,861 GiB, 4,50 bits/peso efectivos), 1,271B en affine 6-bit grupo 64 (0,962 GiB, 6,50 bits/peso), 0,523B en BF16 (0,974 GiB, 16,00 bits/peso) y 2,839B en U32 (10,575 GiB, 32,00 bits/peso). El bloque U32, que representa el 45,2% de los pesos logicos y el 79% del almacenamiento, corresponde con toda probabilidad a los metadatos de cuantizacion (escalas y sesgos por grupo) y a tensores que el algoritmo decidio preservar en alta precision.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, ni sobre si el modelo base paso por RLHF, DPO u otras etapas de alineamiento. La etiqueta "Heretic Uncensored" del nombre sugiere una variante con filtros de seguridad reducidos o eliminados, pero no se documenta el procedimiento de abliteration ni los datos empleados.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Qwen3.5, sin verificacion independiente en este derivado.
- Procesamiento de vision: el checkpoint incluye un modulo visual de 0,461B parametros, por lo que se espera soporte de entrada de imagenes.
- Prediccion multi-token (MTP): la cabeza dedicada de 0,425B parametros habilita decodificacion especulativa y generacion de varios tokens por paso.
- Ejecucion en Apple Silicon: empaquetado nativo para MLX, lo que permite inferencia en Mac con memoria unificada.
- Generacion sin filtros: la variante "Uncensored" elimina o relaja los rechazos de contenido del modelo original.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Mac: el formato MLX y el tamano de 14,4 GB permiten cargar el checkpoint en equipos Apple Silicon con 24 GB o 32 GB de memoria unificada, habilitando un asistente multimodal completamente local sin dependencia de la nube.
- Prototipado de aplicaciones multimodales: el modulo de vision integrado permite construir demos de descripcion de imagenes, extraccion de informacion de capturas o analisis de documentos escaneados en un entorno de desarrollo sobre macOS.
- Generacion de texto creativo sin restricciones: la variante "Uncensored" esta orientada a escritura de ficcion, guiones o narrativa adulta donde los filtros del modelo original resultan limitativos.
- Investigacion sobre cuantizacion mixta: el checkpoint sirve como caso de estudio para medir la degradacion de calidad de oQ con precision mixta frente al modelo en BF16, comparando capas en 4-bit, 6-bit y 16-bit.
- Evaluacion de decodificacion especulativa: la cabeza MTP permite experimentar con tecnicas de prediccion multi-token y medir su impacto en latencia y throughput sobre MLX.
- Pruebas de robustez y seguridad: util para investigadores que necesitan un modelo sin alineamiento para estudiar comportamientos, sesgos o riesgos de generacion de contenido nocivo en entornos controlados.
- Despliegue de bajo coste en estaciones de trabajo: con 14,4 GB en disco y ejecucion en memoria unificada, se puede servir como backend de un chatbot interno sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 14-16 GB para cargar los pesos en memoria, mas overhead de contexto y cache KV; se recomienda un minimo de 24 GB de memoria unificada.
- GPU compatibles: exclusivamente Apple Silicon (M1, M2, M3, M4 y variantes Pro, Max y Ultra) mediante MLX; no es un checkpoint utilizable directamente en CUDA sin conversion.
- Cabe en GPU de consumo: si, en equipos Apple con 24 GB o mas de memoria unificada (MacBook Pro M2 Pro/Max, Mac Studio, Mac mini M4 Pro). No esta pensado para GPUs NVIDIA de consumo.
- Opciones de despliegue: `mlx-lm` y el ecosistema MLX (oMLX) son las vias naturales; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, ya que el formato oQ es especifico de MLX.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Ultimate-Heretic-Uncensored-oQ3h-mtp | 6,28B logicos (base 27B nominal) | no disponible | MLX oQ | no disponible | Hugging Face |
| Modelo base Qwen3.5 27B (BF16) | 27B nominal | no disponible | safetensors | no disponible | no disponible |
| Cuantizaciones GGUF Q4 de modelos 27B | ~27B nominal | no disponible | GGUF | segun modelo base | amplia en Hugging Face |

La comparativa directa con alternativas concretas no esta disponible: no se han encontrado en la informacion proporcionada otros checkpoints comparables de la misma familia con datos verificables de rendimiento, contexto o licencia.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica licencia, lo que impide determinar si el uso comercial esta permitido. Es un bloqueante para produccion.
- Derivado no oficial: no es un checkpoint publicado por el equipo de Qwen; la cuantizacion y la variante "Uncensored" son obra de un tercero sin proceso de validacion documentado.
- Sin benchmarks: no hay evidencia publicada de la calidad del modelo tras la cuantizacion mixta ni del efecto de la abliteration sobre el rendimiento.
- Riesgo de contenido nocivo: la etiqueta "Heretic Uncensored" indica filtros de seguridad reducidos o eliminados, con riesgo elevado de generar contenido ofensivo, ilegal o peligroso si se expone a usuarios finales.
- Alucinacion: sin datos de evaluacion, no se puede acotar la tasa de alucinacion; la cuantizacion agresiva en algunas capas puede incrementarla.
- Sesgos: no documentados; el modelo base hereda los sesgos de su dataset de entrenamiento, no descrito en esta ficha.
- Restriccion de plataforma: el formato oQ y la libreria MLX limitan el despliegue a Apple Silicon; no hay versiones para CUDA, ROCm ni CPU generica.
- Idiomas y contexto desconocidos: no se especifica la ventana de contexto ni la cobertura linguistica, lo que impide planificar aplicaciones multilingues o de contexto largo.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que valide su funcionamiento.
- Fecha de publicacion futura respecto a la mayoria de checkpoints de referencia, lo que sugiere un ecosistema muy reciente y posiblemente inestable.

## Enlaces

- Hugging Face: https://huggingface.co/underlotus/Qwen3.8-27B-Ultimate-Heretic-Uncensored-oQ3h-mtp
- Repositorio de oMLX (herramienta de cuantizacion): https://github.com/jundot/omlx
- No se han encontrado en la informacion proporcionada papers, blogs, demos ni repositorios adicionales asociados al modelo.
