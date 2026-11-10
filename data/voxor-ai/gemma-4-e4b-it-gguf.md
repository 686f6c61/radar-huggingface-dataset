# voxor-ai/gemma-4-e4b-it-gguf

## Resumen

voxor-ai/gemma-4-e4b-it-gguf es una conversión al formato GGUF del modelo google/gemma-4-E4B-it, publicado por el usuario voxor-ai. Se trata de una cuantización Q8_0 del modelo instructivo Gemma 4 en su variante E4B, empaquetada en un único archivo denominado `gemma-4-E4B-it-Q8_0-MTP.gguf`. El repositorio es de carácter puramente distributivo: no incluye fine-tuning propio ni modificaciones de pesos, sino la adaptación del checkpoint original de Google al formato que consumen motores de inferencia como llama.cpp u Ollama.

La relevancia de esta ficha radica en que facilita el despliegue local del modelo base sin necesidad de disponer del checkpoint original en safetensors ni de herramientas de conversión. Al emplear cuantización Q8_0, se preserva prácticamente la precisión del modelo en FP16 con un tamaño de archivo notablemente menor, lo que resulta útil para entornos con VRAM limitada o para integraciones en pipelines que solo admiten GGUF.

No obstante, la información publicada por el autor es mínima: la model card se limita a indicar el nombre del archivo, la cuantización y la licencia, sin detallar arquitectura, contexto, idiomas ni resultados de evaluación. Los datos que figuran a continuación proceden del modelo base cuando están disponibles y se marcan como "no disponible" cuando no han sido publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de google/gemma-4-E4B-it) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0 (única variante publicada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF, comprimido con zstd (`.zst`) para archivos > 1 MB |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo. Al ser una conversión del checkpoint google/gemma-4-E4B-it, la arquitectura corresponde a la del modelo base publicado por Google, pero el autor no incluye detalles sobre tipo de transformer, mecanismos de atención, composición del dataset de entrenamiento ni procesos de alineación (RLHF, DPO u otros). Tampoco se especifica el número de tokens de entrenamiento ni innovaciones técnicas como decodificación especulativa o atención lineal.

El único dato técnico aportado por el autor es el proceso de conversión: los pesos se han serializado en GGUF con cuantización Q8_0 y los archivos de más de 1 MB se han comprimido con zstd, por lo que es necesario descomprimirlos antes de su uso. No se indica la versión de llama.cpp ni la herramienta empleada para la conversión.

## Capacidades

- Generación de texto instructiva: al derivar de un modelo con sufijo `-it`, está orientado a seguir instrucciones en formato conversacional.
- Razonamiento y respuesta a preguntas: capacidades heredadas del modelo base, sin evaluación publicada en este repositorio.
- Generación de código y matemáticas: no verificadas en esta publicación.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas.
- Capacidades especiales (modo thinking, visión, audio): no documentadas.

## Casos de uso

- Despliegue local en estaciones de trabajo: el archivo GGUF Q8_0 puede cargarse en llama.cpp u Ollama para ejecutar el modelo instructivo sin conexión a internet, útil en entornos con requisitos de privacidad.
- Prototipado rápido de asistentes conversacionales: al estar en un único archivo comprimido, permite montar un chatbot de pruebas en minutos sin gestionar checkpoints en safetensors.
- Integración en aplicaciones de escritorio: motores como llama.cpp ofrecen bindings para Python, Rust o C++, lo que facilita incrustar el modelo en herramientas de escritorio con recursos limitados.
- Evaluación comparativa de cuantizaciones: al ser Q8_0, sirve como referencia de calidad casi FP16 frente a cuantizaciones menores (Q4_K_M, Q5_K_M) del mismo modelo base.
- Pipelines de CI para pruebas de regresión: un GGUF de tamaño moderado permite ejecutar tests de generación en runners sin GPU dedicada, siempre que se acepte la latencia de CPU.
- Distribución en entornos air-gapped: el empaquetado con zstd y la licencia Apache 2.0 facilitan su inclusión en imágenes de contenedor o paquetes internos sin dependencias externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión al no conocerse el número de parámetros del modelo base. Para una cuantización Q8_0, la regla general es aproximadamente 1 GB de VRAM por cada 1.000 millones de parámetros, más overhead de contexto.
- GPU recomendadas: no disponibles. En función del tamaño real del modelo base, podrían ser suficientes GPUs consumer con 8-16 GB (RTX 3060, RTX 4070, RTX 4080) o requerir A100/H100 si el modelo supera los 30.000 millones de parámetros.
- Compatibilidad con GPU consumer: no confirmada por el autor.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (LM Studio, KoboldCpp, text-generation-webui). No se ha verificado compatibilidad con vLLM o TGI, que habitualmente prefieren safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| voxor-ai/gemma-4-e4b-it-gguf | no disponible | no disponible | GGUF Q8_0 | Apache 2.0 | Hugging Face |
| google/gemma-4-E4B-it | no disponible | no disponible | safetensors | Apache 2.0 (según este repo) | Hugging Face |
| Otras conversiones GGUF del mismo base | no disponible | no disponible | GGUF (diversas cuantizaciones) | Apache 2.0 | Hugging Face |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- La model card no documenta sesgos, por lo que se desconocen los sesgos específicos del modelo base y de esta conversión.
- Riesgo de alucinación: inherente a los modelos generativos; no se ha evaluado en esta publicación.
- Limitaciones de contexto e idioma: no documentadas; se desconoce si la conversión preserva todas las capacidades multilingües del original.
- Restricciones de licencia: el repositorio declara Apache 2.0, pero conviene verificar los términos del modelo base google/gemma-4-E4B-it, ya que la licencia del derivado debe respetar la del original.
- Los archivos están comprimidos con zstd: es imprescindible descomprimirlos antes de cargarlos en el runtime.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que impide validar la calidad de la conversión mediante feedback de la comunidad.
- No se especifica la herramienta ni la versión de llama.cpp usada para la conversión, lo que puede afectar a la compatibilidad con versiones antiguas del runtime.
- El tamaño del repo (0,1 GB) resulta llamativo para una cuantización Q8_0 de un modelo de varios miles de millones de parámetros; conviene verificar la integridad de los archivos antes de su uso en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/voxor-ai/gemma-4-e4b-it-gguf
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- llama.cpp (runtime compatible con GGUF): https://github.com/ggerganov/llama.cpp
- Ollama (runtime compatible con GGUF): https://ollama.com
