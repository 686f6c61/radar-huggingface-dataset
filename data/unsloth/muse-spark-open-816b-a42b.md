# unsloth/Muse-Spark-Open-816B-A42B

## Resumen

Muse Spark Open es un modelo de lenguaje multimodal de pesos abiertos desarrollado por Meta Superintelligence Labs, publicado en octubre de 2026. Se trata de un transformer con arquitectura Mixture-of-Experts (MoE) de 816.000 millones de parametros totales y 42.000 millones de parametros activos por token, con una ventana de contexto de 1 millon de tokens. Esta disenado especificamente para tareas de codigo y flujos agenticos, e incorpora de forma nativa un codificador de percepcion que le permite procesar texto, imagen, video y audio como entrada, generando unicamente texto como salida.

El repositorio analizado, `unsloth/Muse-Spark-Open-816B-A42B`, es una distribucion de los pesos originales de Meta (`meta-models/Muse-Spark-Open-816B-A42B`) mantenida por Unsloth, orientada a facilitar el despliegue y la cuantizacion mediante su formato Dynamic 3.0 GGUF. El peso real del repositorio en safetensors es de 822.036.529.664 parametros (aproximadamente 822.000 millones), ligeramente por encima de la cifra nominal de 816.000 millones que declara la model card, y ocupa 1.644,4 GB en disco.

Su relevancia actual radica en que combina tres caracteristicas poco frecuentes en modelos abiertos: escala MoE de mas de 800.000 millones de parametros, contexto de 1 millon de tokens y multimodalidad nativa de entrada (imagen, video y audio), todo ello con licencia propia de Meta (Muse Model License) y disponibilidad de pesos en BF16 y NVFP4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con Perception Encoder |
| Parametros totales | 816.000 millones (nominal segun model card); 822.036.529.664 segun safetensors |
| Parametros activos | 42.000 millones por token |
| Longitud de contexto | 1.000.000 de tokens en inferencia |
| Tipos de cuantizacion | BF16, NVFP4 (oficiales de Meta); Unsloth Dynamic 3.0 GGUF; MLX |
| Idiomas soportados | Multilingue: entrenado con datos de mas de 100 idiomas (el tag del repositorio indica solo "en") |
| Licencia | Muse Model License (campo `license: other`) |
| Formato de pesos | safetensors (BF16, NVFP4), GGUF (Unsloth Dynamic 3.0), MLX |
| Vocabulario | 202.048 tokens |
| Modalidades | Entrada: texto, imagen, video, audio. Salida: texto |
| Capas | 62 |
| Dimension oculta | 8.192 |
| Atencion | Gated attention con QK-norm, 128 cabezas Q y 16 cabezas KV (GQA), dimension de cabeza 64 |
| MoE | 256 expertos, 8 activados por token (top-k routing) |
| Perception Encoder | 1.800 millones de parametros, 50 capas, 1.536 de dimension oculta, 16 cabezas, parche 14x14, salida de 4.096 dimensiones |
| Parametros de inferencia recomendados | temperature = 1.0, top_p = 1.0, top_k desactivado; reasoning_effort en high o xhigh para tareas complejas |
| Fecha de publicacion | 15 de octubre de 2026 |

## Arquitectura y entrenamiento

Muse Spark Open es un transformer MoE con decodificacion autoregresiva. El bloque de lenguaje emplea embedding de entrada y unembedding de salida no compartidos (untied), cada uno de aproximadamente 1.660 millones de parametros (202.048 x 8.192). La atencion usa GQA con 128 cabezas de consulta y 16 de clave/valor, dimension de cabeza 64, y anade una puerta de salida y una normalizacion de salida sobre el bloque atencional, ademas de QK-norm. La capa MoE enruta cada token hacia 8 de los 256 expertos disponibles, lo que explica la diferencia entre los 816.000 millones de parametros totales y los 42.000 millones activos.

El componente multimodal es un Perception Encoder independiente de 1.800 millones de parametros y 50 capas, con parches de 14x14, embedding posicional absoluto aprendido combinado con RoPE 2D, FFN con LayerNorm y GELU, y atencion dispersa con factor 4 (solo cada cuarta capa, mas la ultima, aplican atencion completa). Este codificador proyecta la informacion visual y auditiva a un espacio de 4.096 dimensiones que consume el modelo de lenguaje.

La model card indica que la version de pesos abiertos ha recibido un post-entrenamiento adicional de seguridad para hacerla mas robusta frente a usos indebidos cuando se ejecuta sin guardarrailes de sistema, y recomienda desplegarla como parte de un sistema de IA mas amplio con protecciones especificas. No se detalla en la informacion proporcionada el volumen de tokens de entrenamiento, la composicion exacta del dataset ni el uso concreto de tecnicas como RLHF o DPO. La seccion "Training data" de la model card aparece truncada en la informacion disponible, por lo que estos datos no estan disponibles.

## Capacidades

- Generacion de texto y razonamiento multi-paso sobre horizontes largos, manteniendo planes coherentes en flujos de trabajo extensos.
- Ejecucion agentica de extremo a extremo: planificacion multi-paso, invocacion secuencial de herramientas, recuperacion ante fallos y resolucion de peticiones multi-turno de principio a fin.
- Agentes de codigo: escritura, depuracion y resolucion de tareas reales de ingenieria de software.
- Uso de herramientas (tool calling / function calling) en flujos multi-turno prolongados, con diagnostico de errores y reintento cuando una llamada falla.
- Razonamiento multimodal: interpretacion de capturas de pantalla, graficos, documentos, imagenes, audio y grabaciones de video junto con la conversacion.
- Generacion de datos sinteticos de alta calidad para entrenamiento de modelos posteriores.
- Evaluacion como LLM-as-a-judge sobre las salidas de otros modelos.
- Control explicito del esfuerzo de razonamiento mediante el parametro `reasoning_effort`, con cuatro niveles: low, medium, high y xhigh (valor por defecto: xhigh).
- Capacidad multilingue derivada de un entrenamiento con datos de mas de 100 idiomas, aunque el tag del repositorio declara unicamente ingles.

## Casos de uso

- Agentes de ingenieria de software: el modelo puede recibir un repositorio, planificar los cambios, editar varios ficheros, ejecutar pruebas mediante tool calling y corregir los fallos detectados de forma iterativa, gracias a su ventana de 1.000.000 de tokens que permite mantener en contexto el codigo y el historial completo de la sesion.
- Orquestacion de herramientas en pipelines de CI/CD: con soporte nativo de function calling y reintento ante errores, encaja como capa de decision que invoca APIs de construccion, despliegue y monitorizacion dentro de un flujo automatizado.
- Atencion al cliente automatizada: al sostener conversaciones multi-turno con contexto largo, mantiene el historial completo de la interaccion sin truncamiento agresivo y puede consultar sistemas internos mediante herramientas.
- Analisis de documentos tecnicos multimodales: al procesar imagenes, graficos y documentos junto al texto, resulta adecuado para extraer informacion de informes financieros, diagramas de arquitectura o capturas de paneles de control.
- Procesamiento de video y audio: puede analizar grabaciones junto con su transcripcion, lo que sirve para generar resumenes, actas de reunion o auditorias de contenido audiovisual.
- Generacion de datos sinteticos para ajuste fino: produce conversaciones, pares de instruccion-respuesta y trazas agenticas en volumen para entrenar modelos mas pequenos del mismo dominio.
- Evaluacion automatica con LLM-as-a-judge: comparar y puntuar las respuestas de otros modelos en tareas de codigo o razonamiento, con el nivel de esfuerzo de razonamiento configurable segun el coste que se quiera asumir.
- Investigacion en razonamiento de largo horizonte: su ventana de 1 millon de tokens permite estudiar degradacion de coherencia, uso de contexto y planificacion extendida en experimentos academicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La busqueda web realizada no devolvio resultados tecnicos utiles (unicamente paginas de inicio de sesion de Yahoo), y la model card accesible no incluye tablas de MMLU, HumanEval, GSM8K ni metricas comparables. No se inventan cifras.

## Requisitos de hardware

- VRAM para BF16: aproximadamente 2 TB, segun la propia model card. El calculo teorico sobre los 822.036.529.664 parametros del repositorio da unos 1,64 TB solo en pesos, a los que hay que sumar cache KV y overhead de ejecucion.
- VRAM para NVFP4: al menos 700 GB, segun la model card.
- Cache KV estimada (calculo propio a partir de 62 capas, 16 cabezas KV y dimension de cabeza 64): unos 254 KB por token en BF16, es decir, del orden de 32 GB para 128.000 tokens y unos 254 GB para el millon de tokens completo. Esta cifra no aparece publicada por el autor y debe tratarse como una estimacion.
- No cabe en GPU de consumo. Una RTX 4090 (24 GB) o similar queda muy lejos incluso del requisito mas bajo conocido (700 GB en NVFP4).
- GPU recomendadas: despliegues multi-GPU con H100 de 80 GB (del orden de 9 unidades para NVFP4 y 25 para BF16 segun la estimacion por VRAM), H200 de 141 GB (aproximadamente 5 y 15 unidades) o B200 de 192 GB (aproximadamente 4 y 11 unidades). Estas agrupaciones son estimaciones derivadas del requisito de VRAM declarado, no cifras publicadas por el autor.
- Alternativa de escritorio: la model card indica que el modelo esta optimizado para ejecutarse en dos Mac Studio con M5 Ultra mediante MLX.
- Frameworks de despliegue soportados: SGLang, vLLM, Hugging Face, TensorRT-LLM, Unsloth y llama.cpp. Existen cuantizaciones Unsloth Dynamic 3.0 en formato GGUF.
- Disponibilidad por API: el modelo esta disponible a traves de proveedores de inferencia externos, lo que evita el coste de autoalojamiento.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos verificables sobre modelos comparables de la misma categoria en la informacion proporcionada, por lo que no se puede establecer una comparativa de rendimiento frente a alternativas. A continuacion se comparan las variantes y distribuciones conocidas de este mismo modelo, con los datos disponibles.

| Variante | Parametros | Contexto | Formatos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unsloth/Muse-Spark-Open-816B-A42B | 816B totales / 42B activos (822B en safetensors) | 1M tokens | safetensors, GGUF Dynamic 3.0, MLX | Muse Model License | Pesos en Hugging Face (4 descargas, 14 likes) y API de terceros |
| meta-models/Muse-Spark-Open-816B-A42B (base) | 816B totales / 42B activos | 1M tokens | BF16 y NVFP4 | Muse Model License | Pesos en Hugging Face y API de terceros |

## Limitaciones y advertencias

- Sesgos: no se documentan en la informacion disponible los sesgos conocidos del modelo ni los resultados de evaluaciones de equidad.
- Alucinacion: no se publican tasas de alucinacion ni evaluaciones de fidelidad factual. Como en cualquier modelo generativo de esta escala, existe riesgo de fabricar informacion, especialmente en tareas abiertas sin verificacion externa.
- Restricciones de licencia: la licencia Muse Model License es una licencia propia (campo `license: other`) y no una licencia de codigo abierto estandar. Es imprescindible revisar el texto completo antes de cualquier uso comercial.
- Requisito de guardarrailes: la propia model card advierte de que los pesos abiertos han recibido post-entrenamiento de seguridad adicional, pero recomienda desplegar el modelo dentro de un sistema mas amplio con protecciones especificas para cada caso de uso. No debe considerarse seguro como modelo autonomo sin supervision.
- Idioma: aunque la model card declara entrenamiento con datos de mas de 100 idiomas, el tag del repositorio indica unicamente ingles, por lo que el rendimiento real fuera del ingles no esta garantizado ni documentado.
- Coste de despliegue: con requisitos minimos de 700 GB de VRAM en NVFP4 y 2 TB en BF16, el autoalojamiento queda fuera del alcance de equipos pequenos y exige infraestructura multi-GPU especializada o la via de API.
- Gestion del contexto: una ventana de 1 millon de tokens implica un consumo de cache KV muy elevado (estimado en unos 254 GB en BF16 para el contexto completo), lo que puede hacer inviable el uso del contexto maximo sin tecnicas adicionales de gestion de memoria.
- Parámetros de muestreo obligatorios: valores distintos de los recomendados (temperature 1.0, top_p 1.0, top_k desactivado) y valores de `reasoning_effort` fuera de low, medium, high o xhigh provocan un error.
- Estado del repositorio: el repositorio analizado tiene 4 descargas y 14 likes, y fue creado antes de la fecha de publicacion declarada del modelo (18 de septiembre de 2026 frente al 15 de octubre de 2026) y actualizado el 16 de octubre de 2026. Conviene verificar la integridad de los pesos antes de usarlos en produccion.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/unsloth/Muse-Spark-Open-816B-A42B
- Modelo base en Hugging Face: https://huggingface.co/meta-models/Muse-Spark-Open-816B-A42B
- Licencia Muse Model License: https://huggingface.co/meta-models/Muse-Spark-Open-816B-A42B/blob/main/LICENSE.md
- Guia "How to Run Muse Spark Open" de Unsloth: https://unsloth.ai/docs/models/muse-spark-open
- Benchmarks de cuantizacion Unsloth Dynamic 3.0 GGUF: https://unsloth.ai/docs/basics/unsloth-dynamic-v3.0-gguf
- Repositorio de Unsloth en GitHub: https://github.com/unslothai/unsloth/
- Servidor de Discord de Unsloth: https://discord.gg/unsloth
- Documentacion para desarrolladores de Meta sobre Muse Spark Open: https://dev.meta.ai/resources/blog/build-with-muse-spark-open
