# tudor-iustin22/Bluebird-1.5-Instruct

## Resumen

Bluebird 1.5 Instruct es la variante ajustada por instrucciones de Bluebird 1.5 Base, un modelo de lenguaje causal de tipo decoder-only desarrollado por el autor independiente tudor-iustin22 dentro del denominado Project Bluebird. Con 742.528.520 parametros (742,5 M) y una ventana de contexto de 32.768 tokens, se posiciona en la franja de modelos compactos orientados a conversacion y generacion de texto en entornos con recursos limitados.

Su rasgo diferencial es la arquitectura Chunked Fabric Memory: combina atencion causal local sobre los ultimos 2.048 tokens con un segundo camino que atiende a resumenes comprimidos de fragmentos anteriores de 512 tokens. De los 24 bloques transformer, 16 son LocalBlock y 8 son FabricMemoryBlock, con atencion de consultas agrupadas (GQA) de 24 cabezas de consulta y 6 de clave/valor. Esto reduce el coste de atender a contexto antiguo frente a una atencion completa.

La relevancia actual del modelo es doble: por un lado, explora una alternativa a la atencion completa para contexto largo en un tamano muy contenido; por otro, esta entrenado y publicado con enfasis en el ecosistema de Intel (Gaudi 3 y Arc), con licencia Apache 2.0. Es un modelo solo de texto, solo en ingles, con 354 descargas y 3 likes en Hugging Face en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only causal con atencion local y memoria fragmentada con compuerta (Chunked Fabric Memory) |
| Parametros totales | 742.528.520 (742,5 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | No disponible (pesos publicados en FP16; el autor no documenta variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0, sujeta a avisos upstream aplicables |
| Formato de pesos | Safetensors en FP16; requiere codigo custom de Transformers (`trust_remote_code=True`) |

Datos adicionales de arquitectura: 24 capas (16 LocalBlock + 8 FabricMemoryBlock), hidden size 1.536, vocabulario de 65.536 tokens, 24 cabezas de consulta y 6 de clave/valor con dimension de cabeza 64, ventana de atencion local de 2.048 tokens, fragmentos de memoria de 512 tokens con 4 resumenes aprendidos por fragmento (hasta 256 resumenes a 32K de contexto), RoPE con theta = 1.000.000, FFN SwiGLU y normalizacion RMSNorm.

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only que sustituye parte de la atencion global por un mecanismo de memoria comprimida. Cada tercer bloque incorpora un segundo camino que atiende a resumenes de fragmentos ya completados del contexto: los tramos anteriores se dividen en bloques de 512 tokens y cada uno se representa mediante cuatro vectores de resumen aprendidos. Una compuerta escalar por token, tambien aprendida, mezcla la salida del camino de atencion local con la del camino de memoria. A 32.768 tokens el modelo puede disponer de hasta 256 vectores de resumen. El uso de GQA (24 cabezas de consulta sobre 6 de clave/valor) reduce el coste de memoria de la cache KV.

El linaje base registra 23.000.514.560 tokens de preentrenamiento, seguidos de un ajuste de identidad y de un fine-tuning supervisado de instrucciones. Los datasets de post-entrenamiento citados en la model card son HuggingFaceTB/smoltalk2, open-r1/Mixture-of-Thoughts y nvidia/Nemotron-Post-Training-Dataset-v1. El entrenamiento se realizo en PyTorch con precision mixta sobre ocho aceleradores Intel Gaudi 3. No se documentan en la informacion disponible detalles sobre RLHF, DPO, composicion exacta del corpus de preentrenamiento ni decodificacion especulativa.

## Capacidades

- Generacion de texto causal y respuesta conversacional multi-turno con formato de chat dedicado (roles system, user y assistant con delimitadores explicitos).
- Seguimiento de instrucciones y generacion orientada a tareas, tras el post-entrenamiento supervisado.
- Manejo de contexto largo de hasta 32.768 tokens, con acceso a contexto antiguo mediante resumenes de memoria comprimidos.
- Resumen de documentos y respuestas sobre material extenso dentro de la ventana disponible.
- Generacion de contenido y finalizacion de texto de proposito general.
- Capacidad multilingue limitada al ingles; el autor declara unicamente `en`.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explicito de agentes ni de razonamiento multi-paso con modo thinking.
- Modelo solo de texto: sin vision, audio ni otras modalidades.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede mantener conversaciones multi-turno en ingles apoyandose en la ventana de 32.768 tokens para conservar el historial de la sesion y los datos del cliente sin truncar; su tamano de 742,5 M permite desplegarlo en infraestructura modesta.
- Resumen de documentos largos: informes, articulos o transcripciones de hasta 32K tokens pueden procesarse en una sola pasada, con la memoria fragmentada reduciendo el coste de atender a las primeras secciones frente a una atencion completa.
- Asistente de soporte interno sobre base documental: combinando el contexto largo con un pipeline de recuperacion (RAG), el modelo puede responder preguntas sobre manuales extensos insertando los fragmentos recuperados en el prompt.
- Generacion de borradores de contenido: redaccion de correos, descripciones de producto o articulos breves en ingles, con instrucciones de estilo y tono en el mensaje de sistema.
- Prototipado e investigacion en arquitecturas de contexto largo: el codigo custom y el diseno Chunked Fabric Memory lo convierten en una base para experimentar con mecanismos de memoria comprimida en un modelo que cabe en una sola GPU.
- Clasificacion y extraccion de informacion sobre texto: reformulando la tarea como generacion (por ejemplo, extraer campos estructurados de un documento), con la ventaja de procesar entradas largas de una vez.
- Evaluacion en hardware Intel: su soporte documentado para Gaudi 3 (`hpu`) y Arc (`xpu`) permite usarlo como banco de pruebas de despliegue en el stack de Intel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1,5 GB solo para pesos (742,5 M de parametros a 2 bytes), mas cache KV y overhead del runtime; en la practica, un margen de 3-4 GB es razonable para contextos moderados.
- La cache KV crece con el contexto; el uso de GQA (6 cabezas KV) y de resumenes de memoria en lugar de atencion completa sobre todo el historial reduce su coste frente a un transformer equivalente con atencion global.
- GPU recomendadas: cualquier GPU consumer con al menos 6-8 GB de VRAM deberia poder ejecutarlo en FP16; tambien es viable en CPU para inferencia por lotes pequenos.
- Cabe en GPU consumer: si, incluidas gamas como RTX 3060, RTX 4060 o superiores.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (requisito por el codigo custom), accelerate y safetensors. El autor documenta explicitamente el despliegue en Intel Gaudi 3 (`hpu`) e Intel Arc (`xpu`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, y la ausencia de pesos GGUF publicados limita el uso en llama.cpp/Ollama sin conversion propia.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Bluebird 1.5 Instruct | 742,5 M | 32.768 | Apache 2.0 | Ingles | Memoria fragmentada con compuerta; codigo custom; enfoque Intel |
| Qwen2.5-0.5B-Instruct | 0,49 B | 32.768 | Apache 2.0 | Multilingue | Atencion completa estandar; amplio ecosistema de despliegue |
| Llama 3.2 1B Instruct | 1,24 B | 128.000 | Licencia comunitaria Llama 3.2 | Multilingue | Mayor contexto nominal y ecosistema maduro; licencia con restricciones |
| SmolLM2-1.7B-Instruct | 1,71 B | 8.192 | Apache 2.0 | Ingles y otros | Mayor numero de parametros; contexto menor |

La comparacion se basa en caracteristicas publicas de cada familia; no se dispone de resultados de benchmarks de Bluebird 1.5 Instruct que permitan contrastar calidad frente a estas alternativas.

## Limitaciones y advertencias

- Modelo unicamente en ingles: no se declara soporte de castellano ni de otros idiomas, por lo que su uso en entornos hispanohablantes requeriria evaluacion previa y probablemente arrojaria calidad inferior.
- El propio autor advierte que la ventana de 32K es una capacidad del modelo, no una garantia de recuperacion precisa de informacion en posiciones lejanas; la memoria comprimida es una aproximacion, no atencion exacta.
- Riesgo de alucinacion inherente a un modelo de 742,5 M de parametros: la capacidad de razonamiento y de conocimiento factual es limitada en comparacion con modelos de mayor tamano.
- Ausencia de datos publicados de benchmarks, evaluaciones de sesgo o red teaming; no hay evidencia documentada sobre sesgos conocidos.
- Requiere `trust_remote_code=True` por el codigo custom de Transformers: conviene auditar los archivos Python del repositorio antes de ejecutarlo en produccion.
- Ecosistema de despliegue reducido: sin pesos GGUF, AWQ ni GPTQ publicados, y sin soporte documentado en vLLM, llama.cpp, Ollama o TGI; la integracion en pipelines existentes exige trabajo adicional.
- No se documenta soporte de tool calling ni de agentes, lo que limita su uso en flujos automatizados que dependan de llamadas a funciones.
- Licencia Apache 2.0 favorable al uso comercial, sujeta a los avisos upstream aplicables derivados de los datasets de post-entrenamiento utilizados.
- Modelo de autor individual con 354 descargas y 3 likes: soporte comunitario y mantenimiento limitados; conviene fijar una revision concreta del repositorio en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tudor-iustin22/Bluebird-1.5-Instruct
- Modelo base: https://huggingface.co/tudor-iustin22/Bluebird-1.5-Base
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Documentacion de instalacion de Intel Gaudi: https://docs.habana.ai/en/latest/Installation_Guide/index.html
- Dataset HuggingFaceTB/smoltalk2: https://huggingface.co/datasets/HuggingFaceTB/smoltalk2
- Dataset open-r1/Mixture-of-Thoughts: https://huggingface.co/datasets/open-r1/Mixture-of-Thoughts
- Dataset nvidia/Nemotron-Post-Training-Dataset-v1: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v1
