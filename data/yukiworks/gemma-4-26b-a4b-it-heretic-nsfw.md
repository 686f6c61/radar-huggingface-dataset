# yukiworks/gemma-4-26B-A4B-it-heretic-NSFW

## Resumen

Gemma 4 26B A4B es un modelo multimodal de Google DeepMind publicado dentro de la familia Gemma 4, que combina arquitecturas densas y de mezcla de expertos (MoE) en cinco tamanos distintos. La variante 26B A4B emplea una arquitectura MoE con aproximadamente 25.800 millones de parametros totales y 4.000 millones de parametros activos por token, lo que permite un despliegue relativamente economico en terminos de computo frente a modelos densos de tamano comparable. Soporta entrada de texto e imagen, con una ventana de contexto de hasta 256.000 tokens y capacidades multilingues en mas de 140 idiomas.

Sobre esta base, el usuario `yukiworks` ha publicado una version decensurada especializada en contenido NSFW para adultos, generada con la herramienta Heretic v2.2.0.dev0. Se trata de una tecnica de ablacion sin entrenamiento (training-free) que modifica los pesos para eliminar comportamientos de rechazo, en este caso optimizada con un conjunto de prompts de contenido adulto recopilado manualmente por el autor en lugar de los conjuntos genericos por defecto de Heretic. El resultado, segun la model card, reduce los rechazos de 89/100 en el modelo original a 0/100 en esta variante, con una divergencia KL de 0,0411 respecto al modelo base.

La relevancia de esta ficha radica en dos frentes: por un lado, documenta las capacidades tecnicas de la arquitectura Gemma 4 26B A4B (MoE, contexto largo, atencion hibrida, soporte nativo de function calling); por otro, advierte de que esta variante concreta ha sido modificada para eliminar salvaguardas de contenido, lo que tiene implicaciones legales, eticas y de licencia que deben evaluarse antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion local de ventana deslizante intercalada con atencion global; variante Mixture-of-Experts (MoE) |
| Parametros totales | 25.805.933.872 (aproximadamente 25,8 mil millones) |
| Parametros activos | Aproximadamente 4 mil millones por token (segun la denominacion A4B) |
| Longitud de contexto | Hasta 256.000 tokens (modelos medianos de la familia Gemma 4) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos publicados en safetensors; no se detallan variantes GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | Mas de 140 idiomas segun la familia Gemma 4; la model card de esta variante no especifica lista propia |
| Licencia | Apache 2.0 (con enlace a la licencia especifica de Gemma 4 de Google) |
| Formato de pesos | Safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura transformer con atencion hibrida: capas de atencion local con ventana deslizante intercaladas con capas de atencion global, garantizando que la capa final sea siempre global. Las capas globales utilizan claves y valores unificados y aplican Proportional RoPE (p-RoPE) para optimizar el consumo de memoria en contextos largos. La variante 26B A4B es de tipo MoE, con aproximadamente 25,8 mil millones de parametros totales pero solo unos 4 mil millones activos por token, lo que reduce el coste computacional de inferencia frente a un modelo denso del mismo tamano. El vocabulario es de 262.000 tokens y el modelo procesa texto e imagen como entrada, generando texto como salida.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF o DPO del modelo base en la informacion proporcionada. La modificacion de esta variante concreta se realizo con Heretic v2.2.0.dev0, un metodo de ablacion de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) que opera sobre las capas 10 a 29 del modelo con los siguientes hiperparametros: `preserve_good_behavior_weight` de 0,3072, `steer_bad_behavior_weight` de 0,0002, `overcorrect_relative_weight` de 0,5924 y `neighbor_count` de 9. Al ser una tecnica sin entrenamiento, no se anaden datos de fine-tuning: los prompts del autor solo guian el proceso de optimizacion de la ablacion.

## Capacidades

- Generacion de texto y razonamiento con modos de pensamiento configurables (thinking modes) heredados de la familia Gemma 4.
- Comprension de imagenes con soporte de relacion de aspecto y resolucion variables (entrada image-text-to-text).
- Capacidades de codigo y matematicas mejoradas respecto a generaciones anteriores de Gemma, segun la documentacion de la familia.
- Soporte nativo de function calling y tool calling, orientado a flujos agenticos y razonamiento multi-paso.
- Soporte nativo del rol `system` para conversaciones estructuradas y controlables.
- Capacidades multilingues en mas de 140 idiomas (heredadas del modelo base).
- En esta variante concreta, eliminacion de rechazos ante contenido adulto explicito, incluida la generacion de contenido NSFW, como objetivo principal de la modificacion.
- No se documenta soporte de audio en el modelo 26B A4B (el audio esta limitado a E2B, E4B y 12B en la familia).

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el efecto de tecnicas de ablacion sobre los comportamientos de rechazo, comparando la variante decensurada con el modelo original mediante metricas como la tasa de rechazos y la divergencia KL.
- Generacion creativa de ficcion para adultos: escritura de narrativa explicita en entornos controlados y con audiencias verificadas, aprovechando la ausencia de rechazos y el contexto de 256.000 tokens para tramas largas.
- Analisis de sesgos y robustez de filtros: uso como contrapunto en la evaluacion de clasificadores de contenido y sistemas de moderacion, midiendo como responden ante un modelo sin salvaguardas.
- Procesamiento multimodal de documentos con imagenes: extraccion y descripcion de contenido a partir de capturas, diagramas o material grafico, gracias al pipeline image-text-to-text y al contexto extendido.
- Asistentes conversacionales multi-turno sin restricciones tematicas: prototipos de chat donde el usuario necesita respuestas sin sanitizacion sobre temas adultos, con soporte del rol `system` para definir el tono.
- Experimentacion con arquitecturas MoE en hardware limitado: al activar solo unos 4.000 millones de parametros por token, sirve para probar tecnicas de inferencia eficiente y despliegue en GPUs de gama alta para consumidores, comparando el comportamiento tras la ablacion.
- Evaluacion de riesgos en pipelines de IA: integracion en entornos de red teaming para comprobar como se comportan los sistemas de moderacion frente a un modelo deliberadamente decensurado.

## Benchmarks y rendimiento

| Metrica | Esta variante | Modelo original (google/gemma-4-26B-A4B-it) |
|---|---|---|
| Rechazos (clasificador) | 0/100 | 89/100 |
| Divergencia KL | 0,0411 | 0 (por definicion) |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) para esta variante ni para el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan aproximadamente 51,6 GB en el repositorio, lo que en precision completa (BF16/FP16) requiere del orden de 52 GB solo para los pesos, mas memoria para el contexto KV y activaciones. Con cuantizacion a 8 bits se podria reducir a unos 26-30 GB, y a 4 bits a unos 13-16 GB, aunque no se publican cuantizaciones oficiales en la informacion disponible.
- GPU recomendadas: para precision completa, GPUs de 80 GB como A100 o H100; para cuantizaciones de 8 bits, GPUs de 40-48 GB como A6000 o L40S; para cuantizaciones de 4 bits, GPUs de 24 GB como RTX 4090 o RTX 3090 podrian ser suficientes para los pesos, con margen limitado para contexto largo.
- Cabe en GPU de consumo: si, en principio en RTX 4090 (24 GB) o RTX 3090 (24 GB) con cuantizacion agresiva, aunque el contexto de 256.000 tokens exigira mucha mas memoria KV y probablemente no sea viable en esas tarjetas a maxima longitud.
- Opciones de despliegue: transformers (libreria declarada), y por compatibilidad con el ecosistema Gemma 4 cabria esperar vLLM, TGI y llama.cpp/Ollama si se generan conversiones GGUF, aunque no se confirman en la informacion disponible.
- Latencia y throughput: no disponibles. Al ser MoE con unos 4.000 millones de parametros activos, el coste por token deberia ser inferior al de un modelo denso de 26B, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Notas |
|---|---|---|---|---|---|
| yukiworks/gemma-4-26B-A4B-it-heretic-NSFW | 25,8B totales / ~4B activos | 256K | Texto, imagen | Apache 2.0 | Variante decensurada via Heretic; 0/100 rechazos; KL 0,0411 |
| google/gemma-4-26B-A4B-it | 25,8B totales / ~4B activos | 256K | Texto, imagen | Apache 2.0 | Modelo base instruction-tuned; 89/100 rechazos |
| google/gemma-4-31B | 30,7B | 256K | Texto, imagen | Apache 2.0 | Variante densa de la misma familia, sin audio |
| google/gemma-4-12B | 11,95B | 256K | Texto, imagen, audio | Apache 2.0 | Variante densa con soporte de audio |

No se dispone de datos de benchmarks comparativos de rendimiento general entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La modificacion elimina deliberadamente los comportamientos de rechazo, lo que incluye contenido sexual explicito y potencialmente otro material sensible; no es apta para uso general sin supervision ni para audiencias no verificadas.
- El modelo esta marcado como `not-for-all-anchored` y con la etiqueta `not-for-all-audiences`; su distribucion y uso deben restringirse a adultos y a contextos legales.
- Riesgo elevado de generar contenido no verificado o inapropiado en dominios sensibles; la ablacion puede afectar tambien a la calidad de las respuestas en tareas generales, aunque la divergencia KL reportada es baja (0,0411).
- La licencia declarada es Apache 2.0, pero el enlace apunta a la licencia especifica de Gemma 4 de Google; conviene revisar los terminos de uso de Gemma 4 antes de un despliegue comercial, ya que pueden imponer restricciones adicionales sobre usos prohibidos.
- No se documentan los idiomas soportados especificamente por esta variante; las capacidades multilingues se heredan del modelo base pero no se validan tras la ablacion.
- No hay informacion sobre cuantizaciones oficiales, latencia medida ni benchmarks estandar, lo que dificulta estimar el rendimiento real en produccion.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, y fue creado en noviembre de 2026; no hay evidencia de validacion por parte de la comunidad.
- El uso de contenido NSFW generado por IA puede contravenir legislaciones locales sobre material explicito, proteccion de menores o difamacion; se recomienda asesoramiento legal previo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yukiworks/gemma-4-26B-A4B-it-heretic-NSFW
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Proyecto Heretic: https://heretic-project.org
- Coleccion Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentacion de Gemma: https://ai.google.dev/gemma/docs/core
- Informe tecnico (arXiv): https://arxiv.org/abs/2607.02770
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de modelos Gemma de DeepMind: https://deepmind.google/models/gemma/
