# yunfengwang/MiniCPM5-2B-MNN-4bit

## Resumen

MiniCPM5-2B-MNN-4bit es una conversion del modelo openbmb/MiniCPM5-2B al formato MNN con cuantizacion de 4 bits orientada a peso (weight-only), publicada por el usuario yunfengwang. No se trata de un modelo entrenado desde cero ni de un ajuste fino: es un artefacto de despliegue cuyo valor esta en empaquetar un modelo de aproximadamente 2.000 millones de parametros en un formato ejecutable en dispositivos de borde y en Apple Silicon con backend Metal.

El repositorio contiene el grafo de computacion (llm.mnn), los pesos cuantizados a 4 bits (~1,16 GB), los embeddings en bf16 (~535 MB), el tokenizer en formato .mtok y varios ficheros de configuracion para CPU y GPU Metal. La arquitectura del modelo subyacente es un transformer estandar declarado como LlamaForCausalLM, por lo que no incorpora mecanismos exoticos tipo MoE, SSM ni hibridos segun la informacion disponible.

Su relevancia es practica: permite ejecutar un modelo de ~2B en hardware de consumo o movil con un peso total en disco de unos 1,7 GB, con cifras de rendimiento reportadas de ~4742 tokens/s en prefill (pp512) y ~155 tokens/s en decodificacion sobre un Apple M5 Pro con 48 GB y Metal 4. El contrapunto es que es un artefacto muy reciente, sin descargas ni validacion de la comunidad, y que la model card no documenta contexto, idiomas ni datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer estandar, declarada como LlamaForCausalLM (modelo base) |
| Parametros totales | ~2B (segun nomenclatura del modelo base, MiniCPM5-2B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MNN 4 bits weight-only, quant_bit=4, quant_block=128, simetrica; embeddings en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | MNN (llm.mnn, llm.mnn.weight, embeddings_bf16.bin, tokenizer.mtok); no incluye safetensors ni GGUF |
| Modelo base | openbmb/MiniCPM5-2B |
| Tamano del repositorio | 1,7 GB |
| Backends soportados | CPU (config.json) y Apple Metal GPU (config_metal.json) |
| Fecha de publicacion | 13 de septiembre de 2026 (metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe el entrenamiento del modelo base ni de esta conversion. Lo unico que se declara a nivel arquitectonico es que el modelo original es un `LlamaForCausalLM` estandar, es decir, un transformer decoder-only con atencion causal. No hay informacion sobre numero de tokens de entrenamiento, composicion del dataset, fases de RLHF o DPO, ni sobre innovaciones tecnicas como decodificacion especulativa o atencion lineal.

Lo que si esta documentado es el proceso de conversion y cuantizacion. Se realiza con la herramienta de exportacion de MNN (`MNN/transformers/llm/export/llmexport.py`) usando `--export mnn --quant_bit 4 --quant_block 128 --sym`, es decir, cuantizacion simetrica de 4 bits por bloques de 128 pesos aplicada solo a los pesos (activaciones en mayor precision). Un detalle relevante: los embeddings de entrada se mantienen en bf16 y se guardan en un fichero aparte, lo que explica que el repositorio ocupe 1,7 GB cuando los pesos cuantizados son solo ~1,16 GB.

El resultado son dos configuraciones de ejecucion distintas: una para CPU y otra para GPU Metal en Apple Silicon, lo que permite elegir backend sin recuantizar. La inferencia se realiza con `llm_demo` y la medicion con `llm_bench`, ambas herramientas del runtime MNN de Alibaba.

## Capacidades

- Generacion de texto autoregresiva, segun el pipeline declarado (`text-generation`).
- Razonamiento y generacion de codigo: capacidades heredadas del modelo base MiniCPM5-2B, aunque no estan documentadas ni verificadas en esta ficha de modelo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; la model card no lista idiomas.
- Capacidades especiales (vision, audio, modo thinking): no disponible. El modelo base declarado es solo de texto.
- Ejecucion en dispositivo: es la capacidad diferencial de este artefacto, con backend CPU y backend Metal GPU para Apple Silicon.
- Plantilla de chat: se indica que esta incluida en `llm_config.json`, pero no se detalla su contenido.

## Casos de uso

- Asistentes locales en portatiles Apple Silicon: el modelo puede desplegarse con `llm_demo config_metal.json` aprovechando Metal, con un consumo de disco de ~1,7 GB y sin necesidad de GPU dedicada. Es adecuado para prototipos de asistentes offline que no pueden enviar datos a la nube.
- Aplicaciones moviles y de borde con MNN: al estar en formato MNN, el modelo se integra directamente en el ecosistema de inferencia de Alibaba, habitual en despliegues Android/iOS y en dispositivos IoT con recursos limitados. El bloque de 128 con 4 bits reduce el ancho de banda de memoria, que es el cuello de botella en estos entornos.
- Generacion de texto en tiempo real sobre CPU: con decode reportado de ~155 t/s en Metal y un modo CPU disponible, es viable para autocompletado o respuestas interactivas donde la latencia percibida importa mas que la calidad maxima.
- Clasificacion y extraccion de informacion en lote: al ser un modelo de ~2B con buen throughput de prefill (~4742 t/s en pp512), sirve para procesar grandes volumenes de texto corto (etiquetado, resumen de tickets, extraccion de entidades) en local sin coste de API.
- Preprocesado y enrutado dentro de un pipeline mayor: puede actuar como modelo auxiliar que filtra, reformula o clasifica consultas antes de pasarlas a un modelo mayor, reduciendo coste en sistemas de dos niveles.
- Investigacion en cuantizacion y despliegue: es util como banco de pruebas reproducible para comparar 4 bits MNN frente a bf16 en calidad de salida y velocidad, especialmente por la separacion entre pesos cuantizados y embeddings en bf16.
- Educacion y prototipado sin GPU: estudiantes o desarrolladores pueden experimentar con un LLM de 2B en un portatil moderno, con un solo comando de compilacion de MNN (`MNN_BUILD_LLM=ON`, `MNN_METAL=ON`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos numericos aportados son de rendimiento de inferencia.

| Metrica | Valor | Entorno |
|---|---|---|
| Prefill (pp512) | ~4742 t/s | Apple M5 Pro, 48 GB, Metal 4, macOS 26.6 |
| Decode (256 tokens reales) | ~155 t/s | Apple M5 Pro, 48 GB, Metal 4, macOS 26.6 |
| Tamano de pesos cuantizados | ~1,16 GB | Fichero llm.mnn.weight |
| Tamano de embeddings | ~535 MB | embeddings_bf16.bin |
| Tamano total del repositorio | 1,7 GB | — |

No hay datos de rendimiento para el backend CPU ni para otros dispositivos.

## Requisitos de hardware

- VRAM / memoria estimada: los pesos ocupan ~1,16 GB y los embeddings ~535 MB, lo que da un minimo de ~1,7 GB solo para el modelo. Sumando cache KV y buffers de runtime, es razonable reservar entre 2,5 GB y 4 GB de memoria unificada o RAM, dependiendo de la longitud de contexto efectiva (no documentada).
- GPU recomendadas: no hay una lista oficial. El unico entorno validado en la model card es Apple Silicon con Metal (probado en M5 Pro de 48 GB). En el lado NVIDIA/AMD no hay soporte declarado, ya que MNN esta orientado a CPU y Metal.
- Compatibilidad con GPU de consumo: si, el modelo esta pensado precisamente para hardware de consumo. Cabe en cualquier Mac con Apple Silicon de 8 GB o mas (asumiendo contexto corto), y en moviles de gama alta con suficiente memoria.
- Opciones de despliegue: MNN (`llm_demo`) es el unico runtime soportado por el formato. No hay pesos en safetensors ni GGUF, por lo que vLLM, llama.cpp, Ollama o TGI no pueden cargar este artefacto directamente; habria que usar el modelo base openbmb/MiniCPM5-2B y convertirlo.
- Compilacion necesaria: MNN con `MNN_BUILD_LLM=ON` y `MNN_METAL=ON` para aprovechar la GPU de Apple; sin Metal, se ejecuta por CPU con `config.json`.
- Latencia y throughput: ~4742 t/s de prefill y ~155 t/s de decode en el entorno M5 Pro indicado. Son cifras de un unico equipo de referencia; no hay datos de CPU ni de moviles.
- Almacenamiento: menos de 2 GB de disco para el modelo completo.

## Comparativa con modelos similares

No hay datos de benchmarks que permitan comparar calidad. La comparacion se limita a parametros, formato y licencia.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM5-2B-MNN-4bit (este) | ~2B | no disponible | MNN 4 bits | Apache-2.0 | HuggingFace, 0 descargas |
| openbmb/MiniCPM5-2B (base) | ~2B | no disponible | safetensors (no confirmado en la informacion disponible) | Apache-2.0 (segun modelo derivado) | HuggingFace |
| Alternativas de ~1,5-2B para borde (por ejemplo Qwen2.5-1.5B-Instruct o Gemma-2-2B) | 1,5-2B | 32k (Qwen2.5) / 8k (Gemma-2) | safetensors, GGUF | Apache-2.0 / licencia Gemma | HuggingFace |

La diferencia principal frente al modelo base es el formato y el tamano en disco, no las capacidades. Frente a otras familias de ~2B, la ventaja de este artefacto es su integracion nativa con MNN y Metal; la desventaja es la ausencia total de datos de evaluacion publicados y de soporte en los runtimes mas extendidos.

## Limitaciones y advertencias

- No hay informacion sobre sesgos, composicion del dataset ni procesos de alineacion (RLHF/DPO) del modelo base. No puede evaluarse el riesgo de sesgo con los datos disponibles.
- Riesgo de alucinacion inherente a un modelo de ~2B; no hay evaluaciones de fidelidad ni de tasas de error publicadas.
- Longitud de contexto desconocida: no se puede planificar un caso de uso con documentos largos sin verificar experimentalmente el limite real y su impacto en la cache KV.
- Idiomas soportados no documentados. No se debe asumir un buen rendimiento en castellano sin pruebas previas.
- Formato propietario de runtime: los pesos solo son cargables con MNN. No hay safetensors ni GGUF, lo que bloquea vLLM, llama.cpp, Ollama o TGI y complica el fine-tuning sobre este artefacto.
- Licencia Apache-2.0, permisiva para uso comercial, pero se hereda de la declaracion del autor de la conversion; conviene verificar la licencia del modelo base openbmb/MiniCPM5-2B antes de un despliegue en produccion.
- Artefacto sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, publicado por un usuario individual y no por el equipo de OpenBMB. No hay garantia de mantenimiento ni de actualizaciones.
- Las cifras de rendimiento provienen de un unico equipo (Apple M5 Pro, 48 GB, macOS 26.6) y no son extrapolables a otros dispositivos.
- La cuantizacion a 4 bits suele degradar la calidad respecto a bf16; no se aporta ninguna medicion de esa perdida.
- No hay informacion sobre la plantilla de chat mas alla de que reside en `llm_config.json`; un uso incorrecto de la plantilla puede degradar notablemente las respuestas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yunfengwang/MiniCPM5-2B-MNN-4bit
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Runtime MNN (Alibaba): https://github.com/alibaba/MNN
- No se han encontrado articulos, papers, blogs o demos relevantes en la busqueda web realizada; los resultados obtenidos no guardaban relacion con el modelo.
