# speakleash/Bielik-PL-Minitron-7B-v3.0-Instruct-GGUF

## Resumen

Bielik-PL-Minitron-7B-v3.0-Instruct-GGUF es la exportación en formato GGUF del modelo instructivo Bielik-PL-Minitron-7B-v3.0-Instruct, desarrollado por SpeakLeash, el proyecto polaco de modelos de lenguaje abiertos construidos sobre corpus en lengua polaca. El modelo resuelve la necesidad de disponer de un LLM conversacional de tamano medio (7,47 mil millones de parametros) optimizado para polaco pero con capacidades multilingues, en un formato que permite ejecución local eficiente mediante llama.cpp. Esta versión GGUF anade valor sobre el modelo original al corregir las prioridades de merge del tokenizador BPE y el ajuste de prefijo de espacio, problemas que degradaban la tokenización en exportaciones previas.

La relevancia de esta ficha radica en que se trata de una cuantización lista para producción local: el repositorio incluye exportaciones FP16 y Q8_0 verificadas contra el modelo fuente en BF16, con 277 comparaciones de texto, marcadores y prompts renderizados, además de 256 comparaciones Unicode y de espacios en blanco. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, lo que lo hace atractivo para integraciones en productos.

El modelo parte de la familia Bielik, que emplea arquitectura transformer densa y se entrena con un enfoque de destilación tipo Minitron (recorte y destilación desde un modelo mayor). El contexto y los detalles de entrenamiento no están especificados en la información disponible, por lo que se indican como no disponibles en las secciones correspondientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Bielik, derivada de Minitron); detalles no disponibles |
| Parametros totales | 7.476.678.656 (7,47 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP16 y Q8_0 (incluidos en el repositorio); otras cuantizaciones no disponibles |
| Idiomas soportados | Polaco (pl), ingles (en), multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 7,47 mil millones de parametros perteneciente a la familia Bielik de SpeakLeash. La nomenclatura "Minitron" indica que se ha aplicado una estrategia de compresion y destilacion desde un modelo de mayor tamano, una tecnica popularizada por NVIDIA que combina pruning estructurado con distillation para retener calidad con menos parametros. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron fases de RLHF o DPO.

La innovacion tecnica destacable de esta exportacion GGUF es la correccion del tokenizador: se han ajustado las prioridades de merge del BPE y el ajuste de prefijo de espacio, y se ha validado la equivalencia con el tokenizador del modelo fuente mediante 277 comparaciones de texto, marcadores y prompts renderizados, mas 256 comparaciones Unicode y de espacios. La generacion de texto se comparo contra el modelo fuente en BF16. El chat template upstream no serializa definiciones de herramientas, por lo que el tool calling estructurado no esta validado en esta release.

## Capacidades

- Generacion de texto conversacional en polaco e ingles, con soporte multilingue adicional.
- Razonamiento y respuesta a instrucciones en formato chat (modelo Instruct).
- Generacion de codigo y matematicas: capacidad esperable por el entrenamiento instructivo, aunque no se documentan benchmarks especificos.
- Tool calling / function calling: no validado en esta release; el chat template upstream no serializa definiciones de herramientas.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: declaradas pl, en y multilingue.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Asistente conversacional en polaco para atencion al cliente: el modelo puede gestionar dialogos multi-turno en polaco nativo con calidad instructiva, desplegado localmente con llama.cpp para evitar enviar datos sensibles a la nube.
- Generacion de contenido editorial en polaco: redaccion de articulos, resumenes y reescritura de textos, aprovechando el entrenamiento sobre corpus polaco de SpeakLeash.
- Traduccion asistida polaco-ingles: el soporte bilingue declarado permite tareas de traduccion y postedicion en pipelines de localizacion.
- Prototipado de aplicaciones LLM en hardware consumer: al caber en GPUs de consumo en Q8_0 o FP16 parcial, sirve para iterar rapidamente en entornos de desarrollo sin infraestructura dedicada.
- Procesamiento por lotes offline: generacion de resumenes, clasificacion o extraccion de informacion sobre documentos en polaco ejecutada en local con llama.cpp, sin coste por token.
- Educacion e investigacion en PLN (procesamiento de lenguaje natural polaco): uso como baseline abierto y reproducible para experimentos academicos gracias a la licencia Apache 2.0 y a la verificacion de tokenizador documentada.
- Integracion en asistentes de escritorio o herramientas CLI: el formato GGUF y la compatibilidad con llama.cpp facilitan empaquetar el modelo en aplicaciones locales ligeras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 15 GB en FP16 (7,47 B x 2 bytes mas overhead) y aproximadamente 8 GB en Q8_0 (7,47 B x ~1,06 bytes mas overhead y cache KV).
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para FP16 con contexto amplio; RTX 4080/4070 Ti (16 GB) o RTX 4060 Ti 16 GB para Q8_0.
- Cabe en GPU consumer: si, en Q8_0 en GPUs de 8-16 GB; en FP16 requiere 16-24 GB, por lo que encaja en RTX 4090, RTX 4080 o RTX 3090.
- Opciones de despliegue: llama.cpp (nativo), Ollama, LM Studio, y servidores compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa sin conversion.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Bielik-PL-Minitron-7B-v3.0-Instruct-GGUF | 7,47 B | No disponible | Apache 2.0 | GGUF | Enfoque polaco, tokenizador corregido |
| Bielik 7B (versiones previas) | ~7 B | No disponible | Apache 2.0 | safetensors/GGUF | Familia base de SpeakLeash |
| Mistral-7B-Instruct | 7,24 B | 32 K (segun version) | Apache 2.0 | safetensors/GGUF | Referencia multilingue generalista |
| Llama 3.1 8B Instruct | 8,03 B | 128 K | Llama 3.1 Community | safetensors/GGUF | Multilingue, no especifico de polaco |

La comparativa con Mistral-7B y Llama 3.1 8B es orientativa: no se dispone de benchmarks comparativos en la informacion proporcionada, por lo que las cifras de rendimiento no pueden contrastarse.

## Limitaciones y advertencias

- Tool calling no validado: el chat template upstream no serializa definiciones de herramientas, por lo que el uso en agentes con function calling estructurado no esta garantizado.
- Riesgo de alucinacion: como todo LLM de 7 B, puede generar contenido factualmente incorrecto, especialmente fuera de dominios bien representados en el corpus polaco.
- Sesgos: no documentados en la informacion disponible; cabe esperar sesgos derivados del corpus de entrenamiento de SpeakLeash.
- Limitaciones de contexto e idioma: la longitud de contexto no esta especificada; el rendimiento fuera de polaco e ingles puede ser inferior.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y de los datos de entrenamiento originales.
- Caveat de produccion: solo se incluyen cuantizaciones FP16 y Q8_0; no hay Q4_K_M ni otras variantes ligeras en este repositorio, lo que limita el despliegue en GPUs de menos de 8 GB.
- Fecha de publicacion: el repositorio figura creado en 2026-11-20, lo que conviene verificar antes de adoptarlo en produccion.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/speakleash/Bielik-PL-Minitron-7B-v3.0-Instruct-GGUF
- Modelo base: https://huggingface.co/speakleash/Bielik-PL-Minitron-7B-v3.0-Instruct
- Proyecto SpeakLeash: https://speakleash.org
- llama.cpp: https://github.com/ggml-org/llama.cpp
