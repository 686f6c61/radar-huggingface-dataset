# tstepspam/Cydonia-24B-v4.3-Q4-MLX

## Resumen

Cydonia-24B-v4.3-Q4-MLX es una conversion cuantizada a 4 bits en formato MLX del modelo TheDrummer/Cydonia-24B-v4.3, publicada por el usuario tstepspam en HuggingFace. No se trata de un entrenamiento nuevo, sino de una conversión de pesos pensada para ejecucion local en hardware Apple Silicon mediante la libreria MLX. El repositorio ocupa 13,3 GB y contiene pesos en safetensors con un total real de 23.572.403.200 parametros (aproximadamente 23,57 mil millones).

El modelo base, desarrollado por TheDrummer, es un fine-tune orientado a generacion de texto y conversacion, etiquetado en HuggingFace con la arquitectura "mistral", lo que sugiere una familia Mistral de 24B como punto de partida. La model card del repositorio MLX es practicamente vacia: solo declara el modelo base, la libreria y la etiqueta de pipeline, sin detalles sobre datos de entrenamiento, licencia o idiomas soportados.

Su relevancia es practica: permite ejecutar un modelo de ~24B en equipos Mac con memoria unificada moderada, algo imposible con los pesos en bf16 (que rondarian los 47 GB). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de una publicacion muy reciente y sin validacion de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta "mistral" en HuggingFace; sin detalle en la model card) |
| Parametros totales | 23.572.403.200 (23,57 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 33.000 tokens segun la ficha de Routeway para el modelo base; no confirmado en la model card del repositorio MLX |
| Tipos de cuantizacion | 4 bits (MLX); existen conversiones GGUF de terceros del modelo base |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato MLX) |
| Tamano del repositorio | 13,3 GB |
| Libreria de ejecucion | mlx |
| Pipeline | text-generation |
| Modelo base | TheDrummer/Cydonia-24B-v4.3 |
| Casos de uso declarados | text-generation, conversational |

## Arquitectura y entrenamiento

No hay informacion publicada en el repositorio sobre la arquitectura interna, el proceso de entrenamiento, el volumen de tokens, la composicion del dataset ni el uso de tecnicas de alineacion como RLHF, DPO o similares. La unica pista es la etiqueta "mistral" de HuggingFace, que apunta a una arquitectura transformer decoder-only de tipo Mistral, pero no se especifica si incorpora sliding window attention, grouped-query attention ni la configuracion exacta de capas y cabezas.

Lo unico verificable es el proceso de cuantizacion: se ha aplicado una conversion a 4 bits con la libreria MLX sobre los pesos del modelo TheDrummer/Cydonia-24B-v4.3, reduciendo el tamano de aproximadamente 47 GB en bf16 a 13,3 GB. Esta reduccion implica una perdida de precision que puede afectar a tareas sensibles como razonamiento matematico o generacion de codigo, aunque no se han publicado evaluaciones que cuantifiquen ese impacto.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es text-generation con etiqueta conversational, orientado a dialogos multi-turno.
- Razonamiento y conocimiento general: no hay evaluaciones publicadas que confirmen el nivel en MMLU, GSM8K u otros benchmarks.
- Generacion de codigo: presumible por herencia de la familia Mistral, pero no verificado en la informacion disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; la model card no declara idiomas.
- Capacidades especiales (vision, audio, modo thinking): no disponible.
- Ejecucion local en Apple Silicon: es la capacidad practica diferencial de esta conversion, gracias a MLX.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede mantener dialogos multi-turno en un portatil o sobremesa Apple Silicon sin conexion a internet, aprovechando el formato MLX y sus 13,3 GB de pesos.
- Prototipado de aplicaciones de IA en desarrollo: permite probar prompts, temperaturas y estrategias de sistema sobre un modelo de 24B sin coste de API, integrandolo con mlx-lm o LM Studio.
- Generacion de texto creativo y narrativa: la familia Cydonia de TheDrummer esta orientada a escritura y rol conversacional, por lo que encaja en generacion de ficcion, guiones y contenido largo asistido.
- Procesamiento de documentos con contexto medio: si se confirman los 33.000 tokens de contexto del modelo base, permite resumir y extraer informacion de informes o articulos de decenas de paginas en una sola pasada.
- Chatbot interno para empresas con requisitos de privacidad: al ejecutarse de forma totalmente local, los datos no salen del equipo, lo que resulta adecuado para entornos con datos sensibles.
- Evaluacion comparativa de cuantizaciones: sirve como referencia para medir la degradacion de un modelo de 24B al pasar de bf16 a 4 bits en tareas concretas.
- Base para fine-tuning ligero con LoRA/QLoRA: al ser MLX, se puede adaptar con mlx-lm a dominios especificos siempre que la licencia lo permita (actualmente no declarada, lo que es un riesgo legal).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye ninguna tabla de evaluacion, y las busquedas web no aportan cifras para esta conversion cuantizada ni para el modelo base en fuentes verificables.

## Requisitos de hardware

- Pesos en 4 bits (esta conversion MLX): 13,3 GB. Con cache KV y overhead del runtime, se recomienda un minimo de 16-18 GB de memoria unificada.
- Mac compatibles: equipos Apple Silicon con 18 GB o mas. Funcionaria con holgura en M4 Pro, M4 Max, M3 Max y M2 Max con 32 GB o mas; al limite en configuraciones de 18-24 GB con contextos cortos.
- Pesos en bf16/fp16 (referencia del modelo base): aproximadamente 47 GB solo en pesos. Requiere GPU de 80 GB (A100, H100) o configuraciones multi-GPU con 2x24 GB en tensor parallel, o Mac con 64 GB o mas de memoria unificada.
- Cabe en GPU de consumo: la version 4 bits si cabe en una RTX 4090 de 24 GB o RTX 3090, siempre que se use una conversion GGUF equivalente para CUDA (el formato MLX no se ejecuta en GPU NVIDIA).
- Opciones de despliegue: mlx-lm (CLI y servidor OpenAI-compatible), LM Studio con soporte MLX, y conversion a GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponible. Dependera en gran medida del ancho de banda de memoria del chip Apple Silicon utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| tstepspam/Cydonia-24B-v4.3-Q4-MLX | 23,57 B | 33.000 tokens (segun Routeway, no confirmado) | no disponible | safetensors MLX 4 bits | Repositorio HuggingFace, 0 descargas |
| TheDrummer/Cydonia-24B-v4.3 (base) | ~24 B | 33.000 tokens (segun Routeway) | no disponible | safetensors (bf16) | HuggingFace, ampliamente descargado |
| TheDrummer/Cydonia-24B-v4 | ~24 B | no disponible | no disponible | safetensors | HuggingFace |
| Mistral Small 3.1 (24B) | 24 B | 128.000 tokens | Apache 2.0 | safetensors, GGUF | HuggingFace, muy extendido |

La comparacion con Mistral Small 3.1 es relevante porque comparte el orden de magnitud en parametros (24B) y es un modelo con licencia Apache 2.0 explicita, frente a la licencia no declarada de la familia Cydonia, lo que supone una diferencia critica para uso comercial.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse licencia en el repositorio ni en la model card, no hay garantia de uso comercial. Conviene consultar la licencia del modelo base antes de cualquier despliegue en produccion.
- Perdida por cuantizacion: la conversion a 4 bits puede degradar tareas de razonamiento, matematicas o codigo respecto a los pesos originales. No hay evaluaciones publicadas que cuantifiquen esta perdida en este repositorio concreto.
- Model card vacia: no se documentan datos de entrenamiento, idiomas, sesgos ni limitaciones, lo que dificulta la evaluacion de riesgos.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano; no existe informacion especifica sobre mitigaciones en el modelo base.
- Sesgos conocidos: no disponible.
- Contexto limitado en la practica: aunque la fuente externa indica 33.000 tokens, no esta confirmado en el repositorio, y la memoria necesaria para cache KV a esa longitud puede reducir el contexto util en equipos con poca memoria unificada.
- Dependencia de plataforma: el formato MLX solo se ejecuta en Apple Silicon; para CUDA o CPU hay que recurrir a conversiones GGUF de terceros.
- Sin validacion comunitaria: 0 descargas y 0 likes implican que la conversion no ha sido probada de forma masiva.
- Repositorio de terceros: el publicador (tstepspam) no es el autor del modelo base, por lo que no hay garantia de fidelidad en la conversion.

## Enlaces

- Repositorio principal: https://huggingface.co/tstepspam/Cydonia-24B-v4.3-Q4-MLX
- Variante heretic en MLX: https://huggingface.co/tstepspam/Cydonia-24B-v4.3-heretic-v4-Q4-MLX
- Modelo base en HuggingFace: https://huggingface.co/TheDrummer/Cydonia-24B-v4.3
- Version anterior del modelo base: https://huggingface.co/TheDrummer/Cydonia-24B-v4
- Ficha de la cuantizacion GGUF (Cydonia 24B v4.3): https://local-ai-zone.github.io/models/cydonia-24b-v4-3.html
- Ficha de la cuantizacion GGUF (Thedrummer Cydonia 24B v4.3): https://local-ai-zone.github.io/models/thedrummer-cydonia-24b-v4-3.html
- Endpoint API del modelo base: https://routeway.ai/models/cydonia-24B-v4.3
