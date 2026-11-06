# timesmith/gemma-4-26B-A4B-it-qat-oQ4e-mtp

## Resumen

`timesmith/gemma-4-26B-A4B-it-qat-oQ4e-mtp` es una cuantización mixta del modelo Gemma 4 26B A4B en su variante instruct y QAT (Quantization-Aware Training), publicada por el usuario timesmith en Hugging Face. El modelo base es Gemma 4, una familia multimodal abierta de Google DeepMind que acepta entrada de texto e imagen y produce salida de texto, con soporte de razonamiento, contexto largo, system prompts y uso nativo de herramientas. La contribución de este repositorio es el proceso de cuantización, no el entrenamiento del modelo.

La cuantización se ha realizado con la herramienta oQ de oMLX (v0.7.3), que aplica precisión mixta por tensor: la mayor parte de los pesos (93,5 %) queda en affine 4-bit con grupo de 64, mientras que una fracción pequeña se preserva en 5, 6, 8 bits o BF16. El resultado es un checkpoint de 26.226 millones de parámetros lógicos almacenado en 14,923 GiB, con un promedio efectivo de 4,888 bits por peso. El repositorio ocupa 16,1 GB e incluye además una cabeza MTP (Multi-Token Prediction) de 0,420B parámetros y el codificador visual de 0,570B.

El interés de esta ficha es doble: por un lado, documenta una técnica de cuantización mixta orientada a Apple Silicon (formato MLX) que reduce el peso de un modelo de 26B a menos de 15 GiB sin degradar a 4 bits uniformes los tensores sensibles; por otro, sirve como referencia de un modelo multimodal con decodificación especulativa vía MTP. No obstante, el repositorio no incluye model card con detalles de entrenamiento, licencia ni idiomas, y no tiene descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4) con cabeza MTP; cuantización mixta MLX |
| Parametros totales | 26.225.647.442 (26,226B) |
| Parametros activos | no disponible (el nombre "A4B" sugiere ~4B activos, dato no confirmado en la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Affine 4-bit (grupo 64), 5-bit, 6-bit, 8-bit y BF16 en mezcla por tensor; promedio 4,888 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX) |

Desglose de almacenamiento por componente (según la model card):

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 25,236B | 14,649 GB / 13,643 GiB |
| Vision | 0,570B | 1,139 GB / 1,061 GiB |
| Cabeza MTP | 0,420B | 0,236 GB / 0,220 GiB |
| Total | 26,226B | 16,024 GB / 14,923 GiB |

Distribución de precisión por tensor:

| Formato | Pesos logicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Affine 4-bit, grupo 64 | 24,527B | 93,522 % | 12,849 GiB | 4,50 |
| Affine 5-bit, grupo 64 | 0,258B | 0,984 % | 0,165 GiB | 5,50 |
| Affine 6-bit, grupo 64 | 0,062B | 0,236 % | 0,047 GiB | 6,50 |
| Affine 8-bit, grupo 64 | 0,809B | 3,083 % | 0,800 GiB | 8,50 |
| BF16 | 0,570B | 2,174 % | 1,062 GiB | 16,00 |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 26B A4B en variante instruct y QAT, una familia multimodal de Google DeepMind. La información disponible confirma que acepta texto e imagen como entrada y genera texto, e incorpora razonamiento, contexto largo, system prompts y uso nativo de herramientas. El sufijo "A4B" del nombre apunta a una arquitectura de mezcla de expertos con aproximadamente 4B parámetros activos, aunque esta cifra no aparece confirmada en los datos proporcionados. El checkpoint incluye una cabeza MTP (Multi-Token Prediction) de 0,420B parámetros, lo que habilita decodificación especulativa para acelerar la generación.

El entrenamiento del modelo base no está documentado en la información disponible: se desconoce el número de tokens, la composición del dataset y si hubo fases de RLHF o DPO. Lo que sí está documentado es el proceso de cuantización: la herramienta oQ de oMLX v0.7.3 aplica precisión mixta asignando 4 bits a la gran mayoría de tensores (93,5 % de los pesos lógicos) y elevando a 5, 6, 8 bits o BF16 un 6,5 % de los pesos, presumiblemente los más sensibles a la cuantización agresiva. El codificador visual completo se mantiene en BF16 (0,570B), lo que preserva la calidad de la rama de imagen.

## Capacidades

- Generación de texto y razonamiento: el modelo base soporta modo de razonamiento explícito según la documentación de Gemma 4.
- Entrada multimodal: acepta imágenes además de texto, con codificador visual preservado en BF16.
- Uso nativo de herramientas (tool calling / function calling): confirmado en la descripción de Gemma 4 26B A4B QAT.
- System prompts: soportados de forma nativa.
- Contexto largo: la familia Gemma 4 lo soporta, aunque la longitud exacta no está disponible en esta ficha.
- Decodificación especulativa: la cabeza MTP de 0,420B permite generar varios tokens por paso para reducir latencia.
- Capacidades multilingües: no disponible (los idiomas no están listados en el repositorio).
- Modo thinking: no confirmado explícitamente para esta variante, aunque el razonamiento forma parte de la familia.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y el tamaño de 14,9 GiB permiten ejecutar un modelo de 26B en Macs con 24-32 GB de memoria unificada, algo inviable con pesos BF16.
- Asistentes multimodales de escritorio: al aceptar imágenes y texto, puede integrarse en aplicaciones macOS que analicen capturas, documentos escaneados o gráficos junto a instrucciones en lenguaje natural.
- Agentes con tool calling: el soporte nativo de funciones permite conectarlo a APIs externas, bases de datos o sistemas de ficheros en flujos de automatización local.
- Prototipado rápido de pipelines RAG: el contexto largo y el modo instruct facilitan la experimentación con recuperación aumentada sin depender de infraestructura cloud.
- Generación de código asistida en el editor: con tool calling y razonamiento, puede integrarse en extensiones de IDE para autocompletar, explicar y refactorizar, ejecutándose en local.
- Procesamiento de documentos con imagen: extracción y resumen de información de PDFs escaneados o fotografías combinando la rama visual con la generación de texto.
- Evaluación de cuantizaciones: este checkpoint sirve como referencia para medir la pérdida de calidad de una cuantización mixta de 4,888 bits frente al modelo QAT original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~15 GiB para los pesos en el formato mixto; se recomienda al menos 18-24 GB libres para incluir KV cache y overhead del runtime.
- GPU compatibles: el formato es MLX, por lo que el destino principal son chips Apple Silicon (M1/M2/M3/M4, especialmente variantes Pro, Max y Ultra). No es un checkpoint para CUDA sin conversión previa.
- Consumer GPU: cabe en Macs con 24 GB o más de memoria unificada; en GPUs NVIDIA de consumo requeriría conversión a otro formato (no incluida en el repo).
- Opciones de despliegue: runtime MLX (mlx-lm) y herramientas compatibles con MLX; no se documentan opciones vLLM, llama.cpp, Ollama o TGI para este formato concreto.
- Latencia y throughput: no disponibles. La cabeza MTP está pensada para reducir latencia mediante decodificación especulativa, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| timesmith/gemma-4-26B-A4B-it-qat-oQ4e-mtp | 26,226B (4,888 bits/peso) | no disponible | MLX safetensors | no disponible | Hugging Face, 0 descargas |
| google/gemma-4-26b-a4b-qat | 26B (QAT, presumiblemente BF16) | no disponible | no disponible | no disponible | Hugging Face / LM Studio |
| bambocher/gemma-4-26B-A4B-it-qat-oQ4e-mtp | 26B (misma receta oQ4e) | no disponible | MLX safetensors | no disponible | Hugging Face |

La comparativa se limita a variantes del mismo modelo base, ya que no se dispone de datos de benchmarks ni de especificaciones de alternativas de otros desarrolladores en la información proporcionada. La diferencia principal entre las tres entradas es el formato y el peso en disco: el original QAT en BF16 ocuparía aproximadamente el doble, mientras que las dos cuantizaciones oQ4e comparten receta y tamaño.

## Limitaciones y advertencias

- La cuantización a 4,888 bits/peso puede introducir degradación en tareas sensibles (matemáticas, código, razonamiento profundo) frente al modelo QAT original; no se han publicado evaluaciones que lo cuantifiquen.
- El repositorio no declara licencia, lo que impide determinar si el uso comercial está permitido. La licencia del modelo base Gemma tampoco se detalla en la información disponible.
- No se listan idiomas soportados; el comportamiento multilingüe es incierto.
- No se especifica la longitud de contexto efectiva tras la cuantización.
- El formato MLX limita el despliegue a ecosistema Apple; no hay pesos GGUF ni safetensors estándar para CUDA.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia de validación por parte de la comunidad.
- Riesgo de alucinación inherente a los modelos generativos; no se aportan datos específicos de mitigación.
- Al ser una cuantización de un modelo QAT, conviene validar la calidad en el dominio de uso antes de llevarlo a producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/timesmith/gemma-4-26B-A4B-it-qat-oQ4e-mtp
- Variante similar de bambocher: https://huggingface.co/bambocher/gemma-4-26B-A4B-it-qat-oQ4e-mtp
- Gemma 4 26B A4B QAT en LM Studio: https://lmstudio.ai/models/google/gemma-4-26b-a4b-qat
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
