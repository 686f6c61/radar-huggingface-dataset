# SrishAkaTux/zubhub-steam-ideas-lora

## Resumen

ZubHub STEAM Idea Model es un adaptador LoRA experimental publicado por Srishti Sethi bajo la organizacion SrishAkaTux en HuggingFace. Se monta sobre `mlx-community/Qwen2.5-1.5B-Instruct-4bit`, una version cuantizada a 4 bits del modelo Qwen2.5-1.5B-Instruct, y su objetivo es generar ideas de actividades STEAM (ciencia, tecnologia, ingenieria, arte y matematicas) para educacion K-12 a partir de tres entradas: los materiales disponibles, el rango de edad del alumnado y un tema opcional. Las ideas deben estar ancladas en artesanias y tecnicas tradicionales descritas en Wikipedia.

El adaptador tiene un alcance muy acotado: LoRA de rango 8 aplicado a las 8 ultimas capas, entrenado con 388 ejemplos de chat (48 de validacion y 50 de test) durante 600 iteraciones. No es un modelo generico ni un modelo de produccion: la propia model card lo describe como un experimento de aprendizaje e investigacion del proyecto ZubHub, y recomienda revision humana de cada sugerencia.

Su relevancia es metodologica mas que de rendimiento: documenta un pipeline completo y reproducible de destilacion sintetica (generacion de pares JSON con Qwen2.5-7B-Instruct via Ollama), filtrado de seguridad, ajuste con `mlx_lm.lora` sobre Apple Silicon y evaluacion con metricas de formato y solapamiento de materiales. Es, por tanto, un caso de estudio util para quien quiera adaptar un modelo pequeno a una tarea vertical con recursos minimos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5) con adaptador LoRA sobre las 8 ultimas capas |
| Parametros totales | 1,5 mil millones aprox. en el modelo base; parametros entrenables del adaptador no disponibles |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No indicada en la model card; el entrenamiento uso max_seq 1024. El modelo base declara 32 768 tokens en su documentacion publica |
| Tipos de cuantizacion | Modelo base en 4 bits (formato MLX); adaptador en safetensors sin cuantizar. Otras cuantizaciones no disponibles |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 (adaptador y codigo); datos de entrenamiento derivados de Wikipedia bajo CC BY-SA 4.0 |
| Formato de pesos | safetensors para adaptador MLX (`adapters.safetensors`), mas `adapter_config.json` y `lora_config.yaml`; requiere `mlx-lm` |

## Arquitectura y entrenamiento

El adaptador se entrena sobre `mlx-community/Qwen2.5-1.5B-Instruct-4bit` con LoRA de rango 8, escala 20, dropout 0 y aplicado a las 8 ultimas capas del transformer. La configuracion de entrenamiento es: 388 ejemplos de train y 48 de validacion en formato chat, 600 iteraciones (aproximadamente 6 epocas), batch 4, learning rate 1e-5, longitud maxima de secuencia 1024 y semilla 42. Todo el ajuste se ejecuto en Apple Silicon con un pico de memoria de unos 5,3 GB. La perdida de validacion evoluciona de 2,469 en la iteracion 1 a 0,836 en la iteracion 300, sube a 0,843 en la 400 y a 0,894 en la 600, por lo que el punto de menor sobreajuste se situa alrededor de las iteraciones 300-400; el checkpoint publicado es el de la iteracion 400.

Los datos proceden de un corpus de unas 19 600 articulos de Wikipedia rastreados desde categorias semilla (artesania, tecnicas tradicionales, invencion y tecnologia y similares) y filtrados hasta 6632 articulos relevantes. Un Qwen2.5-7B-Instruct local (via Ollama) convirtio alrededor de 500 articulos en pares JSON del tipo `(materiales, rango de edad, tema) -> idea de actividad`, en un proceso de destilacion sintetica. Los pares se limpiaron, se normalizaron por categorias y se pasaron por un filtro de seguridad por palabras clave (`safety.py`) antes del split 388/48/50. En inferencia existe un paso opcional de RAG que recupera articulos relacionados mediante embeddings `all-MiniLM-L6-v2` y los inyecta como contexto.

## Capacidades

- Generacion de ideas de actividades STEAM en formato JSON estricto, con campos como `title`, `description`, `category`, `cultural_origin`, `materials_used`, `materials_missing`, `estimated_minutes` y `steps`.
- Condicionamiento por materiales disponibles, rango de edad (por ejemplo 8-12 anos) y tema opcional.
- Anclaje cultural a artesanias y tecnicas tradicionales descritas en Wikipedia, mediante recuperacion RAG opcional con `all-MiniLM-L6-v2`.
- Cumplimiento de esquema medido: 0,98 de JSON valido y 0,98 de coincidencia de esquema en el conjunto de test de 50 prompts.
- Generacion de secuencias de pasos: una media de 4,78 pasos por idea.
- Soporte de tool calling y function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: solo ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Comportamiento de rechazo: no implementado en el adaptador.

## Casos de uso

- Apoyo a la preparacion de clases: un docente introduce los materiales que tiene en el aula y el rango de edad, y el modelo devuelve varias ideas con lista de pasos y tiempo estimado, reduciendo el trabajo de ideacion previo.
- Talleres en museos o centros culturales: el paso RAG permite recuperar un articulo de Wikipedia sobre una tecnica tradicional concreta y generar una actividad vinculada a ese patrimonio.
- Generacion de fichas de actividad para plataformas educativas: la salida JSON con esquema estable (0,98 de coincidencia en test) se puede insertar directamente en un CMS o en una base de datos sin parseo manual complejo.
- Clasificacion y normalizacion de ideas por categoria: el campo `category` permite agrupar sugerencias por area STEAM para su publicacion en catalogos.
- Deteccion de materiales faltantes: el campo `materials_missing` ayuda a planificar compras o a proponer alternativas antes de ejecutar la actividad.
- Prototipado rapido de asistentes educativos conversacionales: sirve como componente de generacion dentro de un chatbot para educadores, siempre con moderacion propia y supervision adulta.
- Investigacion sobre destilacion sintetica: el repositorio incluye el pipeline completo (scrape, filtrado, generacion de pares, entrenamiento, evaluacion y servidor) y sirve como referencia reproducible para adaptar modelos pequenos a dominios verticales.
- Generacion de material bilingue o localizado: no es un caso de uso viable directamente, porque el modelo solo soporta ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye una evaluacion propia sobre 50 prompts de test retenidos:

| Metrica | Iteracion 400 (datos con filtrado de seguridad) |
|---|---|
| JSON valido | 0,98 |
| Coincidencia de esquema | 0,98 |
| Media de pasos por idea | 4,78 |
| Jaccard de materiales frente a la referencia | 0,683 |
| Cultura predicha especifica | 0,50 (referencia: 0,62) |
| Cultura coincidente de forma laxa con la referencia (cuando esta es especifica) | 0,161 |

Una ejecucion anterior con RAG (k=3, antes del filtrado de seguridad y sobre un split de test distinto, por lo que no es directamente comparable) alcanzo 1,00 de JSON valido, 0,752 de Jaccard de materiales y 0,64 de tasa de cultura especifica. La propia model card advierte que estas metricas miden unicamente formato y solapamiento de materiales: no miden calidad pedagogica, seguridad ni exactitud cultural.

Perdida de validacion por iteracion:

| Iteracion | Perdida de validacion |
|---|---|
| 1 | 2,469 |
| 100 | 0,861 |
| 200 | 0,840 |
| 300 | 0,836 |
| 400 | 0,843 |
| 500 | 0,862 |
| 600 | 0,894 |

## Requisitos de hardware

- Entrenamiento: Apple Silicon con un pico de memoria de aproximadamente 5,3 GB, segun la model card.
- Inferencia: el modelo base esta cuantizado a 4 bits, por lo que los pesos ocupan del orden de 1 GB y cabe holgadamente en cualquier equipo con 2-4 GB de memoria unificada o VRAM. Estimacion orientativa, no confirmada en la documentacion.
- GPU recomendadas: no se especifican. El adaptador esta en formato MLX, por lo que el entorno natural es Apple Silicon (serie M). En GPUs NVIDIA o AMD habria que convertir el adaptador, y ese proceso no esta documentado.
- GPU de consumo: por tamano (1,5B en 4 bits) cabria en GPUs de consumo como RTX 3060, RTX 4060 o superiores, pero no hay instrucciones publicadas para ejecutarlo fuera de MLX.
- Opciones de despliegue: `mlx-lm` con `adapter_path` (unico flujo documentado, con ejemplo de codigo en la model card y en el articulo de freeCodeCamp). Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no documentada para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Los datos de las alternativas de la tabla provienen de la documentacion publica de cada modelo, no de la model card analizada. No existen benchmarks comparables publicados para este adaptador.

| Modelo | Parametros | Contexto | Naturaleza | Licencia | Formatos |
|---|---|---|---|---|---|
| zubhub-steam-ideas-lora | 1,5B (base) + adaptador LoRA rango 8 | Entrenado con 1024 tokens; contexto de inferencia no indicado | Adaptador especifico para ideas STEAM K-12 | Apache-2.0 | MLX (safetensors) |
| Qwen2.5-1.5B-Instruct (base) | 1,54B | 32 768 tokens segun documentacion publica | Modelo instruct generalista | Apache-2.0 | safetensors, GGUF, MLX |
| Qwen2.5-7B-Instruct | 7,6B | 32 768 tokens nativos, ampliables con YaRN segun documentacion publica | Modelo instruct generalista; usado como profesor en la destilacion | Apache-2.0 | safetensors, GGUF, MLX |

Comparativa de rendimiento en tareas generales: no disponible para el adaptador, ya que solo se publicaron metricas de formato y solapamiento de materiales sobre su tarea especifica.

## Limitaciones y advertencias

- Exactitud cultural baja: el modelo tiende a generalizar con etiquetas como "Global (various cultures)" o a atribuir ideas a la cultura equivocada. La tasa de cultura especifica es de 0,50 frente al 0,62 de la referencia, y la coincidencia laxa con la referencia cae a 0,161. Cualquier campo `cultural_origin` debe tratarse como una pista para investigar, no como un hecho.
- Riesgo de estereotipos: las salidas pueden simplificar o aplanar tradiciones culturales.
- Etiquetas sinteticas: los objetivos de entrenamiento los genero otro LLM (Qwen2.5-7B), no educadores, por lo que el adaptador hereda los errores y sesgos de ese modelo.
- Ausencia de comportamiento de rechazo: el adaptador no incluye negativas. El filtrado de seguridad se aplico por palabras clave en los datos (alcohol, armas, tabaco y temas similares), pero el conocimiento del modelo base permanece intacto.
- Seguridad en el aula: las actividades pueden implicar herramientas cortantes, calor o piezas pequenas. Cualquier aplicacion que use este modelo debe anadir moderacion propia de entrada y salida, y supervision adulta.
- Uso no previsto: no esta disenado para hablar directamente con menores sin supervision.
- Limitacion idiomatica: solo ingles.
- Limitacion de datos: 388 ejemplos de entrenamiento y 1,5B de parametros en 4 bits; no es un modelo de produccion.
- Riesgo de alucinacion: alto en todo lo relativo a atribucion cultural y a detalles historicos concretos.
- Licencia: el adaptador y el codigo son Apache-2.0, por lo que el uso comercial esta permitido. Los datos derivados de Wikipedia estan bajo CC BY-SA 4.0 y requieren atribucion y, en su caso, compartir igual.
- Tamano del repositorio reportado: 0,0 GB, coherente con un adaptador pequeno. Descargas y likes: 0 en el momento de la consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SrishAkaTux/zubhub-steam-ideas-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/SrishAkaTux/zubhub-steam-ideas-wikipedia
- Modelo base: https://huggingface.co/mlx-community/Qwen2.5-1.5B-Instruct-4bit
- Articulo de referencia en freeCodeCamp, "How to Teach a Small LLM to Suggest K12 Creative Project Ideas" (junio de 2026): https://www.freecodecamp.org/news/how-to-teach-a-small-llm-to-suggest-k12-creative-project-ideas/
- Cita del autor: Srishti Sethi, 2026, "ZubHub STEAM Idea Model: a LoRA adapter for culturally grounded activity ideas" (URL truncada en la model card; no disponible completa)
- Resultados de la busqueda web: no se ha encontrado informacion relevante sobre este modelo. Las consultas devolvieron exclusivamente perfiles y articulos sobre un creador de contenido no relacionado con el proyecto ZubHub.
