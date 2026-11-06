# zed122/merged2

## Resumen

zed122/merged2 es un modelo de lenguaje multimodal resultado de una fusión de pesos (model merge) entre Qwen/Qwen3.5-4B y xtools-at/Qwen3.5-4B-Claude-3xMerge-Jackrong, generado con la herramienta mergekit mediante el método Linear con pesos 0.5/0.5. No se trata de un modelo entrenado desde cero ni de un ajuste fino supervisado: es una interpolación lineal de dos checkpoints de la familia Qwen3.5, orientada a combinar el comportamiento base de Qwen con los sesgos estilísticos (aparentemente de tipo "Claude") del segundo checkpoint.

El resultado es un modelo de aproximadamente 4.540 millones de parámetros (4,54 B) en formato safetensors y float16, con pipeline image-text-to-text, lo que indica que conserva la torre de visión del Qwen3.5 original y puede procesar entradas multimodales imagen-texto. El repositorio ocupa 9,1 GB, coherente con pesos en fp16 más tokenizador y configuraciones.

Su relevancia es limitada y experimental: cero descargas y cero likes en el momento del registro, licencia no declarada y ausencia total de benchmarks, datos de entrenamiento o evaluación. Es útil como punto de partida para experimentar con merges de la familia Qwen3.5-4B, pero no como modelo de producción sin una evaluación propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5), pipeline image-text-to-text; detalles internos no disponibles |
| Parametros totales | 4.539.265.536 (4,54 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos publicados en float16; no se documentan GGUF, AWQ, GPTQ ni otras variantes |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (float16), librería transformers |

## Arquitectura y entrenamiento

El modelo no tiene entrenamiento propio. Se genera con mergekit aplicando el método Linear (paper arXiv:2203.05482) sobre dos checkpoints: Qwen/Qwen3.5-4B con peso 0,5 y xtools-at/Qwen3.5-4B-Claude-3xMerge-Jackrong con peso 0,5, con dtype float16. La fusión lineal interpola directamente los tensores de ambos modelos capa por capa, de modo que la arquitectura resultante es idéntica a la de los modelos de origen (transformer multimodal de la familia Qwen3.5, con capacidad image-text-to-text).

No se documentan tokens de entrenamiento, composición del dataset, RLHF, DPO ni ninguna innovación técnica adicional, porque no hubo fase de entrenamiento posterior al merge. El segundo checkpoint de origen (Claude-3xMerge-Jackrong) es a su vez un merge previo, por lo que el modelo acumula dos niveles de interpolación y hereda las características de todos los checkpoints intermedios. La única decisión técnica relevante es la elección del método Linear con pesos simétricos, que tiende a producir un modelo "promedio" sin especialización clara.

## Capacidades

- Generación de texto conversacional, heredada de la familia Qwen3.5-4B.
- Procesamiento multimodal image-text-to-text: acepta imágenes junto a texto como entrada, según el pipeline declarado.
- Razonamiento y matemáticas: presumiblemente conserva parte de las capacidades del Qwen3.5 base, aunque sin evaluación publicada que lo confirme.
- Generación de código: capacidad esperable del modelo base, no verificada en este merge.
- Tool calling / function calling: no documentado explícitamente; depende de si el checkpoint base y el segundo merge lo conservan.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; los idiomas no están declarados.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Experimentación con merges: usar el modelo como referencia para estudiar cómo la interpolación lineal 0,5/0,5 afecta al comportamiento de Qwen3.5-4B frente al checkpoint original, comparando salidas en tareas controladas.
- Base para ajuste fino posterior (SFT/LoRA): al ser un modelo de 4,5 B en fp16, cabe en GPUs de 24 GB y sirve como inicialización barata para dominios específicos.
- Prototipado de asistentes multimodales: el pipeline image-text-to-text permite probar flujos de descripción de imágenes o respuesta a preguntas visuales en entornos de desarrollo, siempre con validación manual.
- Evaluación comparativa de estilos: si el segundo checkpoint aporta un estilo "Claude", el merge puede usarse para comparar la verbosidad y el tono frente al Qwen3.5 base en tareas de redacción.
- Pruebas de infraestructura de despliegue: validar pipelines de transformers, vLLM o TGI con un checkpoint multimodal de 4,5 B antes de escalar a modelos mayores.
- Docencia y demostraciones: ilustrar el funcionamiento de mergekit y del método Linear en charlas o talleres, mostrando el YAML de configuración y el efecto del merge.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16: unos 9 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 12-16 GB para inferencia cómoda.
- Cuantización a 8 bits: aproximadamente 4,5-5 GB de pesos, viable en GPUs de 8 GB.
- Cuantización a 4 bits (si se generan pesos GGUF/AWQ, no publicados): alrededor de 2,5-3 GB, posible en GPUs consumer de 6-8 GB.
- GPU recomendadas: A100 40/80 GB, H100 para despliegue a escala; RTX 4090 (24 GB) o RTX 3090 (24 GB) para fp16 sin problemas; RTX 4060 Ti 16 GB como mínimo cómodo en fp16.
- Cabe en GPU consumer: sí, en RTX 4090, 3090, 4080, 4070 Ti Super y similares con 16 GB o más en fp16; con cuantización, en GPUs de 8 GB.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI para servir; llama.cpp/Ollama solo si se generan pesos GGUF, que no están publicados.
- Latencia y throughput: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| zed122/merged2 | 4,54 B | no disponible | no disponible | safetensors fp16 | Merge Linear 0,5/0,5, sin benchmarks, 0 descargas |
| Qwen/Qwen3.5-4B | ~4 B (no confirmado) | no disponible | no disponible en esta ficha | safetensors | Modelo base oficial, referencia de calidad |
| xtools-at/Qwen3.5-4B-Claude-3xMerge-Jackrong | ~4 B (no confirmado) | no disponible | no disponible en esta ficha | safetensors | Merge previo de tres checkpoints con estilo Claude |
| Otros merges de la familia Qwen3.5-4B | ~4 B | variable | variable | safetensors/GGUF | Depende del autor; muchos publican benchmarks |

La comparación detallada con alternativas de rendimiento no es posible porque no hay datos de evaluación del modelo ni de sus componentes en la información disponible.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad, por lo que cualquier uso en producción requiere evaluación propia.
- Licencia no declarada: no se puede asumir uso comercial; hay que verificar las licencias de Qwen/Qwen3.5-4B y del checkpoint de xtools-at antes de redistribuir o explotar comercialmente.
- Idiomas no declarados: el soporte multilingüe es incierto y debe probarse.
- Contexto no documentado: no se conoce la longitud máxima de secuencia efectiva tras el merge.
- Riesgo de degradación por merge: la interpolación lineal de dos checkpoints puede diluir capacidades específicas de cada uno (por ejemplo, tool calling o formato estructurado) sin que el autor lo haya verificado.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño; sin evaluación no se puede acotar.
- Sesgos: no documentados; se heredan de los datos de entrenamiento de los modelos de origen.
- Repositorio con 0 descargas y 0 likes: no hay comunidad que haya validado el modelo, ni issues, ni recetas de cuantización publicadas.
- Sin pesos GGUF/AWQ/GPTQ: el despliegue en CPU o en GPUs de gama baja requiere generar cuantizaciones propias.
- Fecha de creación futura respecto al momento de redacción de muchas herramientas: conviene comprobar compatibilidad con la versión de transformers instalada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zed122/merged2
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.5-4B
- Segundo checkpoint del merge: https://huggingface.co/xtools-at/Qwen3.5-4B-Claude-3xMerge-Jackrong
- mergekit (herramienta de merge): https://github.com/cg123/mergekit
- Paper del método Linear: https://arxiv.org/abs/2203.05482
