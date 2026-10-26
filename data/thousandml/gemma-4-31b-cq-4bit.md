# thousandml/gemma-4-31B-CQ-4bit

## Resumen

`thousandml/gemma-4-31B-CQ-4bit` es una cuantización a 4 bits del modelo Gemma 4 31B Dense de Google DeepMind, publicada por el usuario independiente `thousandml`. Se distribuye en formato safetensors con la librería `transformers` y pipeline `image-text-to-text`, lo que la convierte en una alternativa orientada a inferencia con menor huella de memoria que los pesos originales. El repositorio es de octubre de 2026, acumula 0 descargas y 0 likes, y declara licencia apache-2.0.

El modelo base pertenece a la familia Gemma 4, que Google DeepMind publica en cinco tamanos (E2B, E4B, 12B, 26B A4B y 31B) con variantes preentrenada e instruction-tuned. La variante 31B Dense emplea 30,7 mil millones de parametros, 60 capas, atencion hibrida con ventana deslizante de 1024 tokens y una ventana de contexto de 256K tokens; procesa texto e imagen mediante un encoder de vision de aproximadamente 550 millones de parametros.

La relevancia de esta ficha concreta es practica: una cuantizacion a 4 bits reduce el peso en disco a 18,1 GB, lo que situa al modelo en el rango de una sola GPU de 24 GB para contextos moderados. No obstante, el recuento de parametros que declara el repositorio en sus safetensors (1.469.564.780) es incompatible con el del modelo base (30,7B), una discrepancia que debe verificarse antes de cualquier despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso con atencion hibrida (sliding window local + atencion global), modelo base Gemma 4 31B Dense |
| Parametros totales | 30,7B en el modelo base; el repositorio declara 1.469.564.780 en safetensors (dato inconsistente con el nombre y el tamano del repo) |
| Parametros activos | No aplica (arquitectura densa; la variante MoE de la familia es 26B A4B con 3,8B activos) |
| Longitud de contexto | 256.000 tokens (modelo base) |
| Tipos de cuantizacion | 4 bits, esquema «CQ» del autor; detalles del algoritmo no disponibles |
| Idiomas soportados | Mas de 140 idiomas segun el modelo base; el repositorio no declara lista concreta |
| Licencia | apache-2.0 (con `license_link` a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors |
| Modalidades | Texto e imagen de entrada; salida de texto (sin audio en la variante 31B) |
| Capas | 60 |
| Ventana deslizante | 1024 tokens |
| Vocabulario | 262.000 tokens |
| Encoder de vision | ~550M de parametros |
| Tamano del repositorio | 18,1 GB |
| Libreria | transformers |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only denso de 60 capas que intercala capas de atencion local con ventana deslizante de 1024 tokens y capas de atencion global, garantizando que la capa final sea siempre global. Para controlar el coste de memoria en contextos largos, las capas globales comparten claves y valores de forma unificada y aplican Proportional RoPE (p-RoPE). La entrada multimodal se procesa con un encoder de vision dedicado de aproximadamente 550 millones de parametros, a diferencia de la variante 12B Unified, que prescinde de encoders y proyecta los parches de imagen directamente al espacio de embeddings del decoder.

Gemma 4 se distribuye en variantes preentrenada e instruction-tuned, con modos de razonamiento («thinking») configurables y soporte nativo del rol `system` en el prompt. La familia se presenta como especialmente orientada a codigo, flujos agenticos con function calling y comprension multimodal. El numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO y cualquier detalle del proceso de alineamiento no estan disponibles en la informacion proporcionada; tampoco se documenta en la model card el procedimiento concreto de cuantizacion CQ aplicado por `thousandml` ni el impacto medido de la cuantizacion sobre la calidad.

## Capacidades

- Generacion de texto y razonamiento con modos de pensamiento configurables (herencia del modelo base, no verificada en esta cuantizacion).
- Comprension de imagen: soporte de relacion de aspecto y resolucion variables, ademas de video en el modelo base.
- Generacion de codigo y tareas de ingenieria de software, con mejoras declaradas por Google en benchmarks de codigo para la familia Gemma 4.
- Function calling / tool calling nativo, orientado a flujos agenticos y razonamiento multi-paso.
- Soporte nativo del rol `system` para estructurar conversaciones y agentes.
- Multilingue con mas de 140 idiomas en el modelo base; el repositorio no detalla la cobertura efectiva tras la cuantizacion.
- Capacidad de contexto largo: hasta 256K tokens en el modelo base.
- No dispone de entrada de audio en la variante 31B (el audio esta limitado a E2B, E4B y 12B en la familia).

## Casos de uso

- Analisis de documentos tecnicos extensos: la ventana de 256K tokens permite introducir manuales, normativas o expedientes completos y hacer preguntas sobre ellos sin troceado, siempre que la VRAM disponible soporte la cache KV correspondiente.
- Atencion al cliente con contexto largo: conversaciones multi-turno con historial extenso y politicas de negocio en el prompt de sistema, aprovechando el soporte nativo del rol `system` para fijar el comportamiento.
- Generacion de codigo en pipelines de integracion continua: el soporte de function calling permite invocar herramientas de build, linters o APIs internas desde un agente orquestado por el modelo.
- Extraccion de datos de documentos escaneados o capturas: al aceptar imagen y texto, puede procesar facturas, formularios y capturas de pantalla y devolver campos estructurados en una sola pasada.
- Agentes de automatizacion de back-office: razonamiento multi-paso con llamadas a herramientas para consultar bases de datos, generar informes y escalar casos al equipo humano.
- Asistente de investigacion local: la cuantizacion a 4 bits (18,1 GB) permite desplegarlo en una workstation con una sola GPU de 24 GB o 48 GB, manteniendo los datos dentro de la infraestructura propia.
- Moderacion y clasificacion de contenido multimodal: revision de texto e imagenes con justificacion en lenguaje natural, integrable via endpoints compatibles con TGI o HF Inference Endpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni el repositorio de `thousandml` ni los datos de la busqueda web incluyen cifras de MMLU, HumanEval, GSM8K u otras evaluaciones, ni mediciones del impacto de la cuantizacion CQ 4 bits sobre la calidad del modelo base.

## Requisitos de hardware

- Pesos en 4 bits: 18,1 GB en disco segun el tamano del repositorio, lo que deja el modelo en el limite de una GPU de 24 GB una vez anadida la cache KV y el overhead del runtime.
- VRAM estimada: aproximadamente 20-22 GB para batch 1 y contextos cortos o medios; para explotar ventanas cercanas a 256K tokens se necesita una GPU de 80 GB o servir con atencion paginada y cuantizacion de la cache KV.
- GPU recomendadas: H100 80 GB y A100 80 GB para contexto largo y concurrencia; L40S 48 GB o A6000 48 GB como punto intermedio; RTX 4090 / RTX 3090 de 24 GB solo con contextos reducidos y batch 1.
- Cabe en GPU de consumo: si, en RTX 4090 o RTX 3090 de 24 GB con contexto limitado; no cabe en GPUs de 8, 12 o 16 GB sin una cuantizacion adicional (por ejemplo GGUF de 3 o 2 bits), que este repositorio no proporciona.
- Opciones de despliegue: `transformers` (libreria declarada) y endpoints compatibles con el tag `endpoints_compatible` (TGI / HF Inference Endpoints). No se confirma soporte para vLLM, llama.cpp u Ollama en este repositorio, ya que solo se publican safetensors y no pesos GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Modalidades | Licencia |
|---|---|---|---|---|---|
| gemma-4-31B-CQ-4bit (este repo) | 30,7B en el base (4 bits); 1,47B declarados en safetensors | No aplica | 256K | Texto + imagen | apache-2.0 |
| Gemma 4 31B Dense (original) | 30,7B | No aplica | 256K | Texto + imagen | Apache 2.0 |
| Gemma 4 26B A4B MoE | 25,2B | 3,8B | 256K | Texto + imagen | Apache 2.0 |
| Gemma 4 12B Unified | 11,95B | No aplica | 256K | Texto + imagen + audio | Apache 2.0 |

Frente a la variante MoE 26B A4B, este modelo activa todos sus parametros en cada token, lo que implica mayor coste de computo por token pero evita la variabilidad de enrutamiento entre expertos. Frente al 12B Unified, ofrece mas capacidad a cambio de perder la entrada de audio y de requerir el doble de VRAM. No se dispone de datos de rendimiento comparado con alternativas de otros fabricantes (Qwen, Llama u otras) en la informacion proporcionada.

## Limitaciones y advertencias

- Discrepancia critica de metadatos: el recuento de safetensors (1.469.564.780 parametros) no cuadra con un modelo de 30,7B ni con el tamano del repositorio (18,1 GB); hay que verificar la integridad de los pesos antes de usarlos.
- Sin validacion comunitaria: 0 descargas y 0 likes, publicacion de un tercero no verificado y sin benchmarks propios que acrediten la fidelidad de la cuantizacion.
- La cuantizacion a 4 bits introduce degradacion de precision no medida; no hay evaluacion publicada del impacto en razonamiento, codigo o multilingue.
- Ambiguedad de licencia: la etiqueta declara apache-2.0, pero el `license_link` apunta a la licencia especifica de Gemma 4 de Google, que puede imponer terminos adicionales de uso; conviene revisarla antes de un uso comercial.
- El repositorio no declara lista de idiomas ni evaluaciones multilingues propias; la cobertura de 140 idiomas corresponde al modelo base.
- Riesgo de alucinacion no documentado ni cuantificado para esta version.
- La ventana de 256K es teorica en la practica: la cache KV a esa longitud excede la VRAM de GPUs de 24 GB y exige hardware de 80 GB o tecnicas de atencion eficiente no confirmadas para este repositorio.
- No se incluyen pesos GGUF ni otras cuantizaciones de menor precision, lo que limita el despliegue en hardware de gama baja.
- El pipeline declarado es `image-text-to-text`; no se documentan ejemplos de uso, plantillas de prompt ni tokenizador especifico en la model card del repositorio.
- Fecha de publicacion y estado del ecosistema: el repositorio se creo y actualizo el 26 de octubre de 2026, sin historial posterior de mantenimiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/thousandml/gemma-4-31B-CQ-4bit
- Informe tecnico (arXiv): https://arxiv.org/abs/2607.02770
- Coleccion Gemma 4 en HuggingFace: https://huggingface.co/collections/google/gemma-4
- Repositorio GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentacion de Gemma: https://ai.google.dev/gemma/docs/core
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de modelos de Google DeepMind: https://deepmind.google/models/gemma/
- Listado de modelos etiquetados como 4bit en HuggingFace (resultado de busqueda): https://huggingface.co/models?p=1&sort=modified&search=4bit
