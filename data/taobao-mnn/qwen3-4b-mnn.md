# taobao-mnn/Qwen3-4B-MNN

## Resumen

Qwen3-4B-MNN es un paquete de inferencia de texto para el motor MNN (Mobile Neural Network) de Alibaba, generado a partir del modelo Qwen/Qwen3-4B mediante cuantización HQQ y exportado con el conversor oficial de MNN. Lo publica la organizacion taobao-mnn y su proposito es ofrecer una version del modelo Qwen3 de 4.000 millones de parametros ejecutable en CPU (x64 verificado) a traves del runtime MNN, con pesos cuantizados a 4 bits en el tronco del transformer y 8 bits en la cabeza de salida. No es un modelo nuevo: es una conversion del modelo base de Qwen, y su valor esta en el empaquetado y la verificacion del proceso de exportacion.

El modelo conserva la arquitectura `Qwen3ForCausalLM` del original, con 36 capas y un campo `max_position_embeddings` de 40960 en la configuracion (que el autor advierte explicitamente que no equivale a contexto maximo medido). Solo se exporta el modulo de lenguaje: no incluye vision, audio ni video. El repositorio ocupa 8,2 GB e incluye grafo, pesos, tokenizador, plantillas y configuracion como un paquete que debe actualizarse de forma atomica.

Su relevancia actual es practica: permite desplegar un LLM de 4B en entornos sin GPU mediante MNN, con un conjunto de configuracion por defecto documentado (CPU, memoria baja, precision baja, muestreo mixto) y un proceso de validacion reproducible ligado a una version concreta de MNN (3.6.2) y a un commit fijo del exportador. El autor es transparente sobre los limites de la verificacion: solo se ha validado en CPU x64, y ARM FP16, Metal, OpenCL, Vulkan y CUDA quedan sin verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3ForCausalLM` (model_type `qwen3`), transformer denso, 36 capas |
| Parametros totales | no disponible (no declarado en la model card; el modelo base es Qwen3-4B) |
| Parametros activos | no aplica (no es MoE; la config no declara expertos de enrutamiento) |
| Longitud de contexto | `max_position_embeddings=40960` en config; el autor indica que no es contexto maximo medido. Prompts de prueba entre 19 y 875 tokens |
| Tipos de cuantizacion | HQQ 4-bit en pesos lineales del tronco (block=64, alpha FP16, sym=false); HQQ 8-bit en cabeza LM (block=64, alpha FP16, sym=false); embeddings comparten pesos de la cabeza LM cuantizada |
| Idiomas soportados | zh, en |
| Licencia | apache-2.0 (heredada de Qwen/Qwen3-4B) |
| Formato de pesos | MNN (grafo + pesos empaquetados para el runtime MNN); no safetensors ni GGUF |
| Version de runtime | MNN 3.6.2, commit `b0239771b07b317a258fbc384683bbd540741406` |
| Tamano del repositorio | 8,2 GB |
| Entrada / salida | texto / texto (solo modulo de lenguaje) |

## Arquitectura y entrenamiento

El paquete no entrena ningun modelo: es una conversion del Qwen3-4B original. La arquitectura corresponde a un transformer denso `Qwen3ForCausalLM` de 36 capas, sin expertos de enrutamiento declarados en la configuracion. El autor insiste en que no se debe inferir arquitectura ni numero de parametros a partir del nombre del repositorio, y que la ficha no reproduce evaluaciones ni capacidades del modelo upstream que no hayan sido medidas en este paquete.

La innovacion tecnica esta en el pipeline de exportacion y cuantizacion. Se usa el exportador oficial de MNN (`llmexport.py`) con cuantizacion HQQ: 4 bits con bloques de 64 y escalas en FP16 para los pesos lineales del tronco, y 8 bits con las mismas caracteristicas para la cabeza de salida. La entrada de embeddings no es una capa BF16 independiente, sino que comparte los pesos cuantizados de la cabeza LM. El proceso se documenta con parametros de exportacion (`export_args.json`) y metadatos de cuantizacion (`refresh_metadata.json`), y se advierte que reexportar con otras versiones de dependencias no garantiza identidad byte a byte. La validacion incluye alineamiento FP32 entre la implementacion fuente y el exportador (prefill/decode, embedding, capas representativas, norm y logits) sobre las 36 capas, ademas de pruebas de determinismo en CPU x64 con decodificacion greedy.

## Capacidades

- Generacion de texto en chino e ingles, con el comportamiento heredado del modelo base Qwen3-4B.
- Modo de razonamiento hibrido: la configuracion clasifica el modelo como `hybrid` y el autor indica que no se desactiva el pensamiento forzado por defecto.
- Traduccion y tareas de transformacion de texto: las pruebas de aceptacion incluyen casos de `translation` y `long_translation` (hasta 875 tokens de prompt).
- Aritmetica basica y respuestas cortas: caso de prueba `arithmetic` con respuesta numerica directa.
- Conversacion multiturno mediante plantilla Jinja (contexto Jinja por defecto `null`, configurable).
- Muestreo configurable: mezcla de penalizacion, top-k, top-p, min-p y temperatura, con valores por defecto documentados.
- No incluye vision, audio ni video: solo se exporta el modulo de lenguaje.
- No hay evidencia en la informacion disponible sobre soporte de tool calling, function calling o razonamiento agente multi-paso en este paquete.

## Casos de uso

- Despliegue de un LLM de 4B en servidores sin GPU: el paquete esta verificado en CPU x64 con MNN 3.6.2, lo que permite servir generacion de texto en infraestructura generalista sin acelerador dedicado.
- Aplicaciones de escritorio o embebidas con MNN: al ser un runtime de Alibaba orientado a eficiencia, el paquete encaja en productos que ya integran MNN y necesitan un modelo de chat local en chino e ingles.
- Traduccion zh-en y en-zh en pipelines por lotes: los casos de aceptacion cubren traduccion corta y larga, y el modelo base es bilingue en estos dos idiomas.
- Prototipado rapido de asistentes conversacionales: la configuracion por defecto (CPU, memoria baja, muestreo mixto, 512 tokens de generacion) permite arrancar con `llm_demo` sin ajustar hiperparametros.
- Generacion de respuestas cortas y deterministas: con decodificacion greedy y `precision=high` el autor valida salidas estables, util para tareas de extraccion o clasificacion simple.
- Evaluacion de cuantizacion HQQ en produccion: sirve como referencia reproducible para comparar calidad 4-bit/8-bit frente al modelo original en tareas de texto.
- Base para experimentos de despliegue movil: aunque no verificado en dispositivos, el formato MNN es el punto de partida natural para probar el modelo en ARM, Metal, OpenCL o Vulkan (con regresion propia).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no publica cifras de rendimiento ni de memoria por dispositivo, y que las pruebas de aceptacion (saludos, aritmetica, traduccion, traduccion larga) son comprobaciones estructurales, no una evaluacion de precision.

| Prueba de aceptacion | Resultado reportado |
|---|---|
| Alineamiento FP32 fuente/exportador | Correcto en prefill/decode, embedding, capas, norm y logits (36 capas) |
| Determinismo (x64 CPU, greedy, precision=high, 8 hilos) | Casos `greeting`, `arithmetic`, `translation`, `long_translation` con parada natural y sin repeticiones anomalas |
| Smoke con configuracion por defecto | Casos predefinidos dentro del limite de 512 tokens |
| Rango de prompts probados | 19 a 875 tokens |
| Rendimiento (latencia/throughput) | no disponible |
| Memoria por dispositivo | no disponible |

## Requisitos de hardware

- VRAM: no disponible. El paquete esta orientado a CPU y no se han publicado cifras de memoria; el repositorio pesa 8,2 GB, pero el consumo en ejecucion con cuantizacion 4-bit/8-bit no esta medido en la informacion disponible.
- GPU recomendadas: no disponibles. La unica plataforma verificada es CPU x64.
- GPU de consumo: sin datos. Metal, OpenCL, Vulkan y CUDA no han sido verificados por el autor.
- CPU: x64 verificado con MNN 3.6.2; ARM CPU en FP16 no verificado.
- Despliegue: runtime MNN con `llm_demo` o integracion via API de MNN-LLM; requiere compilar con `MNN_BUILD_LLM=ON`, `MNN_LOW_MEMORY=ON` y `MNN_SUPPORT_TRANSFORMER_FUSE=ON`.
- Configuracion por defecto: backend CPU, memoria baja, precision baja, 4 hilos, temperatura 0.6, top-k 20, top-p 0.95, penalizacion de repeticion 1.1, sampler mixto, limite de generacion de 512 tokens.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-4B-MNN (este) | 4B (base) | 40960 en config (no medido) | MNN, HQQ 4/8-bit | apache-2.0 | Solo CPU x64 verificado; sin vision |
| Qwen/Qwen3-4B (original) | 4B | 40960 en config | safetensors (Transformers) | apache-2.0 | Modelo fuente sin cuantizar; requiere GPU o CPU con framework estandar |
| Alternativas GGUF de Qwen3-4B | 4B | segun variante | GGUF (llama.cpp, Ollama) | apache-2.0 | Ecosistema amplio en CPU/GPU de consumo; no verificado en esta informacion |

No se dispone de datos de rendimiento comparado entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- Verificacion limitada: solo se valida CPU x64. ARM CPU FP16, Metal, OpenCL, Vulkan, CUDA y dispositivos moviles no estan verificados.
- Sin datos de rendimiento ni de memoria: no hay cifras publicadas de latencia, throughput ni consumo por dispositivo.
- El contexto maximo real no esta medido: `max_position_embeddings=40960` es un campo de configuracion, no una garantia de calidad en contextos largos; las pruebas solo llegan a 875 tokens de prompt.
- Solo idiomas zh y en; no se declara soporte de otros idiomas.
- Solo modulo de lenguaje: sin vision, audio ni video.
- Riesgo de alucinacion y errores: el autor advierte que la salida cuantizada puede contener errores; las pruebas de aceptacion no constituyen una evaluacion de precision.
- Sin evidencia de tool calling ni capacidades de agente en este paquete.
- Integridad del paquete: grafo, pesos, tokenizador, embeddings, plantillas y configuracion deben actualizarse juntos; no se deben mezclar revisiones ni sustituir solo el archivo de grafo.
- Reproducibilidad: reexportar con otras versiones de dependencias no garantiza pesos identicos byte a byte; hay que usar directorio nuevo y revalidar.
- Licencia: apache-2.0 heredada del modelo base; la cuantizacion no amplia derechos y persisten las obligaciones de atribucion y politica de uso del upstream.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/taobao-mnn/Qwen3-4B-MNN
- Modelo base en ModelScope: https://modelscope.cn/models/Qwen/Qwen3-4B/summary
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-4B/blob/main/LICENSE
- Exportador MNN (commit fijo): https://github.com/alibaba/MNN/tree/b0239771b07b317a258fbc384683bbd540741406/transformers/llm/export
- Documentacion MNN-LLM: https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html
- Repositorio MNN: https://github.com/alibaba/MNN
