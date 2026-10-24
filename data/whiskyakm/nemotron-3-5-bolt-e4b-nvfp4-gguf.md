# WhiskyAKM/Nemotron-3.5-Bolt-E4B-NVFP4-GGUF

## Resumen

Nemotron-3.5-Bolt-E4B-NVFP4-GGUF es una cuantización en formato GGUF del checkpoint NVIDIA-Nemotron-3.5-Bolt-E4B-BF16, publicada por el usuario WhiskyAKM. El modelo original es multimodal cualquier-a-cualquier: acepta texto, imagen y audio como entrada y genera texto, con una ventana de contexto de 128 000 tokens y 42 capas. La particularidad de la variante E4B es el uso de Per-Layer Embeddings (PLE), que asigna a cada capa del decodificador su propio embedding pequeño por token; de ahí que el modelo tenga 7 518 069 290 parámetros totales pero solo unos 4 300 millones "efectivos".

El interés de esta ficha concreta está en el formato: se trata de una conversión NVFP4 (NVIDIA Floating Point de 4 bits) pensada para llama.cpp y motores compatibles con GGUF, con dos variantes de peso (4,9 GB con embeddings en Q6_K y 4,0 GB con embeddings también en NVFP4) más un proyector multimodal `mmproj.gguf` de 946 MB en f32 que aporta los codificadores de visión y audio. El resultado es un paquete que cabe en GPUs de consumo y en portátiles, orientado a despliegue local.

Es relevante ahora porque combina tres tendencias simultáneas: cuantización de muy baja precisión (FP4) para reducir huella de memoria, arquitecturas multimodales con codificadores separados y pesos abiertos bajo licencia OpenMDW-1.1. Conviene señalar que el repositorio tiene 0 descargas y 0 likes en el momento de la consulta y que la model card contiene una atribución confusa sobre la autoría del modelo base (ver la sección de limitaciones).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4ForConditionalGeneration (transformer decoder-only con atención híbrida y codificadores SigLIP de visión y de audio) |
| Parametros totales | 7 518 069 290 (7,5 B), según safetensors del checkpoint base |
| Parametros activos | No es MoE. Parámetros efectivos: ~4,3 B (7,5 B incluyendo embeddings); Per-Layer Embeddings (PLE) |
| Longitud de contexto | 128 000 tokens (ventana deslizante de 512 tokens; atención global cada 6 capas) |
| Tipos de cuantizacion | NVFP4 (4 bits en coma flotante) en los pesos; embeddings en Q6_K o en NVFP4 según el fichero; proyector multimodal en f32 |
| Idiomas soportados | Multilingüe (sin listado de idiomas concreto en la información disponible) |
| Licencia | openmdw-1.1 (OpenMDW 1.1) |
| Formato de pesos | GGUF (llama.cpp); ficheros: `nemotron-3.5-bolt-e4b-nvfp4.gguf` (4,9 GB), `nemotron-3.5-bolt-e4b-small-nvfp4.gguf` (4,0 GB), `mmproj.gguf` (946 MB) |

Otros datos técnicos: 42 capas, dimensión de embedding 2560, vocabulario de 262 144 tokens, codificador de visión basado en SigLIP (16 capas, 768 dimensiones, ~478 M de parámetros), codificador de audio de 12 capas y 1024 dimensiones, RoPE proporcional (p-RoPE) en las capas de atención global. Tamaño total del repositorio: 10,5 GB.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con atención híbrida: la mayoría de las capas usan ventana deslizante de 512 tokens y cada sexta capa aplica atención global, lo que reduce el coste computacional en contextos largos manteniendo acceso a información lejana. Las capas globales emplean RoPE proporcional (p-RoPE), una técnica habitual para extender la longitud de contexto efectiva más allá de la ventana nativa de entrenamiento. El modelo integra además dos torres separadas de codificación —visión (SigLIP, 16 capas, 768 dimensiones, ~478 M de parámetros) y audio (12 capas, 1024 dimensiones)— cuyas salidas se proyectan al espacio del decodificador mediante el proyector incluido en `mmproj.gguf`.

El mecanismo Per-Layer Embeddings (PLE) es la innovación distintiva de la familia E4B: cada capa del decodificador dispone de su propio embedding pequeño por token, de modo que la capacidad efectiva se mantiene en ~4,3 B mientras el recuento total asciende a 7,5 B. Según la model card, la conversión parte de un checkpoint optimizado con QAT (Quantization-Aware Training), lo que explica que la cuantización a 4 bits se haya previsto durante el entrenamiento y no solo a posteriori. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. Tampoco se detalla la receta de destilación o alineación del modelo base original.

## Capacidades

- Generación de texto conversacional con soporte nativo del rol `system` para conversaciones estructuradas.
- Comprensión de imágenes: el codificador SigLIP procesa la entrada visual y la proyecta al espacio del decodificador.
- Comprensión de audio: torre de audio de 12 capas y 1024 dimensiones, integrada en el mismo proyector multimodal.
- Modo de razonamiento explícito (*thinking mode*) activable insertando el token `<|think|>` al inicio del system prompt; la salida separa el razonamiento interno (`<|channel>thought ... <channel|>`) de la respuesta final. En la variante E4B, al desactivarlo no se genera bloque de pensamiento vacío.
- Function calling / tool calling nativo, orientado a flujos agénticos y de múltiples pasos.
- Capacidades multilingües (idiomas concretos no detallados).
- Contexto largo de 128 000 tokens, útil para documentos extensos o historiales de conversación amplios.
- Optimización para ejecución local en portátiles y dispositivos móviles.
- Compatibilidad con API OpenAI a través de `llama-server`, incluido el flag `--mmproj` para entrada multimodal.

## Casos de uso

- **Atención al cliente automatizada en local**: con 128 000 tokens de contexto se puede mantener un historial multi-turno largo junto con la documentación de producto, y el soporte nativo del rol `system` permite fijar políticas de respuesta; al ejecutarse en llama.cpp, los datos no salen de la infraestructura propia.
- **Transcripción y análisis de reuniones**: la entrada de audio combinada con el modo de razonamiento permite resumir una grabación, extraer tareas y generar un acta estructurada en una sola pasada, sin depender de un servicio externo de ASR.
- **Procesamiento de documentos escaneados**: al aceptar imagen y texto, el modelo puede leer capturas de facturas, formularios o tickets y devolver campos estructurados en JSON; el orden recomendado de prompt (imagen antes que texto) está documentado en la model card.
- **Asistente de accesibilidad en dispositivo**: descripción de imágenes y de contenido audiovisual en portátiles o equipos de gama media, aprovechando que los pesos NVFP4 ocupan alrededor de 5 GB.
- **Agentes con herramientas en pipelines internos**: el function calling nativo permite encadenar búsquedas, consultas a bases de datos o llamadas a APIs; `llama-server` expone un endpoint compatible con OpenAI, lo que simplifica la integración con frameworks de agentes existentes.
- **Prototipado e investigación en cuantización de bajo bit**: este repositorio sirve como banco de pruebas para evaluar el impacto de NVFP4 frente al checkpoint BF16 en tareas multimodales, con la ventaja de tener ambas variantes accesibles.
- **Clasificación y etiquetado multimodal por lotes**: al aceptar audio, imagen y texto en la misma interfaz, se pueden anotar lotes heterogéneos de contenido con un único modelo y un único pipeline de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la model card del repositorio GGUF ni los metadatos de HuggingFace incluyen mediciones de MMLU, HumanEval, GSM8K, MMMU u otras evaluaciones, ni comparaciones con el checkpoint BF16 en términos de degradación por cuantización.

## Requisitos de hardware

- **VRAM para inferencia solo texto**: aproximadamente 5 GB con `nemotron-3.5-bolt-e4b-nvfp4.gguf` (4,9 GB de pesos) más overhead de contexto KV; unos 4 GB con la variante `small`.
- **VRAM para inferencia multimodal**: añadir el proyector `mmproj.gguf` (946 MB en f32), lo que sitúa el total en el entorno de 6 GB antes de contar la caché KV.
- **Caché KV**: no se dispone de cifras oficiales; con 42 capas y contexto de 128 000 tokens el consumo puede ser significativo, por lo que conviene limitar `--ctx-size` en equipos con poca memoria.
- **GPUs recomendadas**: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y GPUs de portátil con 8 GB o más. Para servir varias peticiones concurrentes, A100 o H100 con vLLM no aplican directamente a este formato (ver más abajo).
- **Cabe en GPU de consumo**: sí, en cualquier tarjeta con 6-8 GB o más para uso multimodal y alrededor de 5-6 GB para texto.
- **Opciones de despliegue**: `llama-cli` y `llama-server` de llama.cpp (API compatible con OpenAI). Otros motores GGUF solo si implementan el tipo de dato NVFP4; vLLM y TGI no están confirmados para este fichero concreto en la información disponible.
- **Latencia y throughput**: no disponibles. Como referencia cualitativa, la decodificación NVFP4 se beneficia de aceleración nativa en GPUs Blackwell; en arquitecturas anteriores el motor debe de-cuantizar, con la penalización correspondiente.
- **Parámetros de generación recomendados por el autor**: temperature 1.0, top-k 64, top-p 0.95.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Formato | Estado |
|---|---|---|---|---|---|---|
| Nemotron-3.5-Bolt-E4B-NVFP4-GGUF (esta ficha) | 7,5 B totales / ~4,3 B efectivos | 128 K | Texto, imagen, audio → texto | openmdw-1.1 | GGUF NVFP4 | Disponible, 0 descargas |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 (modelo base) | 7,5 B totales / ~4,3 B efectivos | 128 K | Texto, imagen, audio → texto | openmdw-1.1 | safetensors BF16 | Disponible |
| Alternativas abiertas de tamaño similar con capacidades multimodales (p. ej. familias Gemma 3n, Qwen3-VL) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante y verificable es con el checkpoint BF16 del que deriva: misma arquitectura, mismo contexto y misma licencia, con la diferencia de que la versión NVFP4 reduce el peso de 15 GB (BF16 teórico para 7,5 B) a 4-5 GB a cambio de una posible pérdida de precisión no cuantificada públicamente. No se dispone de datos de benchmarks que permitan comparar el rendimiento frente a otras familias de modelos del mismo rango.

## Limitaciones y advertencias

- **Atribución confusa en la model card**: el texto afirma que el modelo fue construido por Google DeepMind, mientras que el checkpoint base está publicado por NVIDIA y los tags incluyen `gemma4`/`gemma4-e4b`. La authoría real del modelo original no queda clara en la información disponible y conviene verificarla antes de citarla.
- **Licencia OpenMDW-1.1**: es una licencia de pesos abiertos con términos propios (enlace en la model card). No se ha verificado en esta ficha si impone restricciones adicionales al uso comercial; es obligatorio revisar el texto completo antes de desplegar en producción.
- **Riesgo de alucinación**: no se han publicado evaluaciones de fidelidad ni tasas de alucinación para este checkpoint ni para el base.
- **Degradación por cuantización**: la cuantización NVFP4 a 4 bits en coma flotante puede afectar a tareas sensibles a la precisión numérica (matemáticas, código); no hay mediciones publicadas de la pérdida respecto a BF16.
- **Compatibilidad limitada del formato NVFP4**: requiere motores que soporten explícitamente este tipo de dato GGUF. No es un GGUF K-quant convencional y puede no cargar en versiones antiguas de llama.cpp ni en herramientas derivadas (Ollama, LM Studio) sin actualización.
- **Idiomas no detallados**: la etiqueta es "multilingual" pero no se enumeran idiomas ni niveles de calidad; el rendimiento en castellano no está verificado.
- **Ventana deslizante de 512 tokens**: aunque el contexto nominal sea de 128 K, solo las capas globales (cada sexta) tienen acceso completo; el rendimiento en recuperación de información muy lejana puede degradarse.
- **Madurez del repositorio**: 0 descargas y 0 likes, creado y actualizado el mismo día, sin validación comunitaria. No hay informes independientes de que los ficheros carguen correctamente en todas las configuraciones.
- **Sesgos**: no se documenta ninguna evaluación de sesgos, toxicidad o seguridad para el modelo base ni para esta conversión.
- **Orden de modalidades**: el autor advierte que el rendimiento depende de colocar imagen antes del texto y audio después; alterar el orden puede degradar la calidad de forma no determinista.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/WhiskyAKM/Nemotron-3.5-Bolt-E4B-NVFP4-GGUF
- Modelo base (NVIDIA, BF16): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Blog técnico del modelo base: https://research.nvidia.com/labs/nemotron/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB/
- Texto de la licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- llama.cpp (motor de inferencia): https://github.com/ggerganov/llama.cpp

Nota: la búsqueda web asociada a esta consulta devolvió únicamente resultados sin relación con el modelo (contenido para adultos), por lo que se han descartado y no se incluyen en esta ficha.
