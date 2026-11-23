# Tejaswasan08/Cybersec_QwensploitV2_THAA

## Resumen

Cybersec_QwensploitV2_THAA es un modelo de lenguaje y vision (vision-language model) de aproximadamente 1.940 millones de parametros, publicado por el usuario Tejaswasan08 en Hugging Face. Se distribuye exclusivamente en formato GGUF, lo que indica que esta pensado para inferencia local mediante llama.cpp y sus derivados, y no como pesos completos para entrenamiento o fine-tuning con frameworks convencionales. El nombre sugiere un ajuste orientado a ciberseguridad sobre una base Qwen3.5 de 2B, aunque la model card no documenta ni el proceso de entrenamiento ni el dataset utilizado.

La relevancia del modelo es limitada en el momento de redactar esta ficha: no tiene descargas ni interacciones registradas, no declara licencia, no especifica idiomas soportados y no publica resultados de evaluacion. La informacion disponible se reduce a los metadatos del repositorio y a dos ficheros GGUF (uno BF16 con proyector multimodal y otro cuantizado en Q4_K_M), por lo que cualquier evaluacion de capacidades reales debe hacerse por cuenta del usuario.

Se trata, por tanto, de un artefacto de interes principalmente experimental: util para quien quiera probar un modelo pequeno multimodal con supuesto enfoque en seguridad ofensiva/defensiva en hardware de consumo, pero sin garantias documentadas de calidad, licencia ni procedencia de los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5 de 2B, segun nomenclatura del autor); detalles no disponibles |
| Parametros totales | 1.942.653.248 (~1,94 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 y Q4_K_M (ficheros publicados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); incluye proyector multimodal mmproj en BF16 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna mas alla de lo que sugiere el nombre del repositorio: un modelo base Qwen3.5 de 2B con capacidad de vision, convertido a GGUF mediante Unsloth. La presencia de un fichero `mmproj` (proyector multimodal) confirma que el modelo acepta entradas de imagen ademas de texto, pero se desconoce el tipo de encoder visual, la resolucion de entrada soportada y el esquema de fusion entre modalidades.

Tampoco hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF o DPO, ni sobre el proceso de ajuste especifico en ciberseguridad que sugiere el nombre "Qwensploit". La model card se limita a indicar el comando de uso con `llama-cli` y `llama-mtmd-cli`, sin documentar hiperparametros, recetas de cuantizacion mas alla de las dos variantes publicadas ni innovaciones tecnicas destacables.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta `conversational` del repositorio.
- Procesamiento de imagenes junto con texto (vision-language model), con fichero de proyector multimodal incluido.
- Compatibilidad con plantillas de chat mediante el flag `--jinja` de llama.cpp.
- Uso previsto (por nomenclatura) en tareas relacionadas con ciberseguridad; no verificado ni documentado.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Modo de razonamiento explicito (thinking mode), audio u otras modalidades: no disponible.

## Casos de uso

- Pruebas de concepto de analisis de capturas o diagramas de red: el modelo puede recibir una imagen y generar una descripcion textual, util para prototipos de triaje visual en entornos de seguridad, aunque sin garantias de precision documentadas.
- Asistente local de consulta sobre conceptos de ciberseguridad: al ejecutarse en GGUF con ~2 GB en Q4_K_M, cabe en equipos modestos y permite experimentar con un chatbot especializado sin depender de la nube.
- Laboratorios de formacion y CTFs: puede emplearse como ayuda para explicar tecnicas o interpretar salidas de herramientas, siempre con supervision humana y verificacion posterior.
- Evaluacion comparativa de modelos pequenos multimodales: sirve como punto de referencia en estudios internos sobre modelos de 2B con vision en formato GGUF.
- Prototipado de pipelines llama.cpp: util para validar integraciones de `llama-mtmd-cli` y plantillas Jinja antes de adoptar modelos mayores.
- Experimentacion con cuantizacion: el par BF16/Q4_K_M permite medir la degradacion de calidad al cuantizar en un modelo pequeno multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: en torno a 1,5-2 GB para el fichero Q4_K_M y aproximadamente 4 GB para la variante BF16, mas el proyector multimodal (estimacion a partir del tamano del repositorio de 2,0 GB; no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q4_K_M; RTX 3060, RTX 4060, RTX 4090 o superiores para mayor comodidad y para la variante BF16.
- Cabe en GPU de consumo: si, previsiblemente en la mayoria de tarjetas con 4 GB o mas, y tambien en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`), y por compatibilidad de formato, otros runners GGUF como Ollama o LM Studio (no verificado por el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Cybersec_QwensploitV2_THAA | ~1,94 B | no disponible | Si (mmproj) | no disponible | GGUF |
| Qwen2.5-VL-3B-Instruct | ~3 B | 32k (segun documentacion publica de Qwen) | Si | Apache 2.0 (segun Qwen) | safetensors, GGUF |
| Gemma 3 4B | ~4 B | 128k (segun documentacion publica de Google) | Si | Gemma Terms | safetensors, GGUF |
| SmolVLM-2B | ~2 B | 8k (segun documentacion publica de Hugging Face) | Si | Apache 2.0 | safetensors, GGUF |

La comparativa se basa en caracteristicas publicas de esos modelos; no existen datos de rendimiento del modelo evaluado que permitan contrastar calidad frente a ellos.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se puede asumir permiso de uso comercial ni redistribucion; hay que contactar con el autor antes de cualquier despliegue en produccion.
- Sin model card tecnica: no se documentan datos de entrenamiento, proceso de ajuste ni evaluaciones, lo que impide auditar sesgos o procedencia del contenido.
- Riesgo elevado de alucinacion en un modelo de ~2B, especialmente en dominios tecnicos como ciberseguridad, donde una respuesta erronea puede tener consecuencias graves.
- El enfoque declarado en "exploit" y ciberseguridad plantea riesgos de uso dual; conviene revisar el comportamiento antes de exponerlo a usuarios finales.
- Idiomas soportados desconocidos; no hay garantia de buen rendimiento en castellano.
- Contexto maximo desconocido, lo que limita el diseno de aplicaciones con ventanas largas.
- Solo disponible en GGUF: no apto para fine-tuning con frameworks habituales sin conversion previa.
- Cero descargas y cero interacciones: sin validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Tejaswasan08/Cybersec_QwensploitV2_THAA
- Unsloth (herramienta de conversion citada): https://github.com/unslothai/unsloth
