# voodooquant/Hy4-flash-INT4-NeUQI

## Resumen

Hy4-flash INT4 NeUQI es una distribucion cuantizada del modelo vision-lenguaje Hy4-flash de Tencent, publicada por el usuario voodooquant. El checkpoint empaqueta el modelo original en precision INT4 para pesos (W4A8: activaciones en INT8) con el objetivo de servirlo en cuatro GPU AMD Instinct MI100 de 32 GiB, una plataforma habitualmente desatendida por los stacks de inferencia convencionales. La cuantizacion se realiza sin reentrenamiento (training-free), calibrada por activaciones sobre un conjunto reducido de textos reales.

El modelo base es un transformer de tipo mezcla de expertos (MoE) con capacidades multimodales: segun la model card, Tencent reporta 155.500 millones de parametros de backbone, 63.500 millones en tablas Engram, un codificador visual de 430 millones y un drafter de 850 millones. El backbone combina una capa densa de feed-forward seguida de 41 capas MoE que seleccionan 16 de 512 expertos por capa. Incorpora atencion latente dispersa con ventana deslizante y decodificacion especulativa mediante un checkpoint DFly2 separado.

La relevancia de esta ficha radica en su caracter de receta de despliegue: no se trata de un modelo nuevo, sino de una conversion que demuestra como llevar un VLM MoE de gran tamano a hardware AMD MI100 con un fork especifico de vLLM y AITER. El repositorio ocupa 120,6 GB y acumula 73 descargas y 3 me gusta en el momento de la consulta. La licencia aplicable es la Tencent Hy License, Version 1.0, que impone condiciones propias al uso de los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion latente dispersa (sliding-window + sparse latent attention), vision encoder y decodificacion especulativa |
| Parametros totales | 79.921.232.645 (safetensors del checkpoint cuantizado); el modelo base reporta 155,5B backbone + 63,5B Engram + 0,43B vision + 0,85B drafter |
| Parametros activos | 16 de 512 expertos por capa MoE (41 capas); no se especifica el numero exacto de parametros activos |
| Longitud de contexto | no disponible (se valido recall greedy a 16.530 y 32.995 tokens de prompt) |
| Tipos de cuantizacion | INT4 empaquetado sin signo para pesos con escala FP16 y cero flotante por cada 128 features de entrada; activaciones INT8; vision en PTQR INT8; Engram en Q4_0; embedding y cabeza en BF16 con lookup INT8 y proyeccion W8A8 en MI100 |
| Idiomas soportados | no disponible |
| Licencia | Tencent Hy License, Version 1.0 (license:other) |
| Formato de pesos | safetensors (libreria vllm) |

## Arquitectura y entrenamiento

El modelo base Hy4-flash de Tencent es un transformer MoE multimodal. El backbone consta de una capa densa de feed-forward seguida de 41 capas MoE, cada una de las cuales enruta cada token a 16 de 512 expertos. La atencion combina ventana deslizante y atencion latente dispersa, compartiendo una cache latente de 512 canales y 64 canales rotatorios; en las capas dispersas, IndexPool selecciona grupos de cuatro tokens. El sistema incluye un codificador visual de 0,43B parametros y un drafter de 0,85B para decodificacion especulativa, con tablas Engram de 63,5B parametros reportadas por Tencent.

La conversion a INT4 de voodooquant es training-free y calibrada por activaciones. Se congelan las pasadas forward capa por capa sobre 64 extractos reales de C4 y Evol-CodeAlpaca, con un total de 48.521 tokens, ajustando la cuantizacion contra un objetivo de error ponderado por la diagonal de las activaciones. Cinco de los 20.992 pares capa/experto no recibieron tokens de calibracion y usaron estadisticas agrupadas de su capa. El codificador visual y el drafter se convierten con PTQR (actualizaciones straight-through sobre pesos y escalas). Las tablas Engram se empaquetan como cuatro ficheros Q4_0 de 33,57 GiB en total, con filas de 54 bytes para 96 features. El proceso de adquisicion de pesos, calibracion y serializacion se ejecuto sobre tensores de GPU y AMD Infinity Storage en un workspace NVMe fisico.

## Capacidades

- Generacion de texto conversacional multi-turno, con validacion de 52/52 comprobaciones de chat, incluidas diez de formato estricto.
- Razonamiento visual: identificacion de colores en imagenes (rojo y azul), deteccion de dos gatos en una fotografia COCO y descripcion del color en un video de cuatro fotogramas.
- Tool calling / function calling: el modelo emitio el nombre de herramienta y los argumentos solicitados en las pruebas del autor.
- Procesamiento de imagen y video como entrada (pipeline image-text-to-text).
- Decodificacion especulativa mediante el checkpoint DFly2, que acelera la generacion con un drafter separado.
- Recall greedy reproducible con prompts largos (16.530 y 32.995 tokens).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking: la evaluacion MMLU del autor se realizo con thinking desactivado, lo que sugiere que el modelo base dispone de esa opcion.

## Casos de uso

- Despliegue de un VLM MoE de gran tamano en infraestructura AMD MI100: la receta permite servir el modelo en cuatro GPU de 32 GiB con vLLM y AITER modificados, un escenario util para equipos con hardware AMD y restricciones de presupuesto frente a soluciones NVIDIA.
- Atencion al cliente multimodal: el modelo puede gestionar conversaciones multi-turno con imagenes adjuntas (capturas, fotografias de producto) y emitir llamadas a herramientas para consultar sistemas internos, gracias a su soporte de tool calling validado.
- Analisis de documentos y capturas: la combinacion de vision encoder y contexto largo permite procesar pantallazos, formularios o graficos y responder preguntas sobre ellos en una sola pasada.
- Agentes con razonamiento multi-paso: la decodificacion especulativa con el drafter DFly2 reduce la latencia en flujos agenticos donde se encadenan varias llamadas al modelo.
- Evaluacion comparativa de cuantizacion: el checkpoint incluye metricas de fidelidad (similitud coseno de 0,99327-0,99580 en proyecciones y 0,99954 en el encoder visual), lo que lo convierte en una referencia para estudiar el impacto de INT4 en un MoE grande.
- Investigacion en eficiencia de inferencia sobre ROCm: sirve como banco de pruebas para medir throughput y latencia de kernels INT8 agrupados en MI100 con atencion latente.
- Moderacion o inspeccion de contenido visual a escala: el pipeline image-text-to-text permite clasificar y describir imagenes en lotes, aunque el rendimiento real dependera del hardware.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| Comprobaciones de chat (receta nativa) | 52/52, incluidas 10 de formato estricto |
| Recall greedy a 16.530 y 32.995 tokens | Repeticion exacta |
| Coincidencia de token top con el target original (64 prefijos de calibracion) | 49 posiciones |
| KL sobre top-20 del teacher y cola combinada | mediana 0,098; media 0,571; p95 2,317 |
| Similitud coseno layer 0 query projection | 0,99327 |
| Similitud coseno layer 1 expert 68 down projection | 0,99580 |
| Similitud coseno layer 41 expert 329 gate/up projection | 0,99568 |
| MMLU zero-shot (114 preguntas, 57 materias) | 101/114 correctas, 1 sin parsear |
| Encoder visual (12 imagenes COCO) | similitud coseno 0,99954; NMSE 0,000948 |
| Tablas Engram (4.096 filas por tabla) | bytes empaquetados coincidentes; similitud coseno media 0,99632-0,99634 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible; las cifras anteriores son validaciones de fidelidad de la cuantizacion y una prueba MMLU reducida, no comparaciones estandarizadas.

## Requisitos de hardware

- VRAM estimada: el autor indica que el checkpoint esta empaquetado para cuatro AMD Instinct MI100 de 32 GiB (128 GiB totales); un inventario nativo de cuatro rangos encontro todos los parametros de target, vision y drafter en VRAM.
- GPU recomendadas: AMD Instinct MI100 (unica plataforma validada en la model card). No se mencionan GPU NVIDIA.
- GPU de consumo: no disponible; no se documenta soporte para GPU consumer.
- Opciones de despliegue: fork especifico de vLLM para MI100 y fork de AITER (int8-aiter), con el script `scripts/serve_recipe_hy4.sh` que sirve en el puerto 8020. Requiere descargar tambien el checkpoint DFly2 INT8 PTQR.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Hy4-flash INT4 NeUQI (este) | 79,9B en safetensors cuantizados (base reporta 155,5B backbone + 63,5B Engram) | no disponible | Tencent Hy License 1.0 | Hugging Face, vLLM fork AMD |
| tencent/Hy4-flash (base) | 155,5B backbone + 63,5B Engram + 0,43B vision + 0,85B drafter | no disponible | Tencent Hy License 1.0 | Hugging Face |
| Hy4-flash DFly2 INT8 PTQR (drafter) | 0,85B (drafter) | no disponible | Tencent Hy License 1.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoria en la informacion proporcionada, por lo que no es posible establecer una comparacion de rendimiento fiable.

## Limitaciones y advertencias

- La cuantizacion INT4 introduce perdida de fidelidad: la KL media de 0,571 y el p95 de 2,317 frente al modelo original indican divergencias en la distribucion de probabilidad, especialmente en la cola.
- Cinco de los 20.992 pares capa/experto no recibieron tokens de calibracion y usaron estadisticas agrupadas, lo que puede degradar su comportamiento en dominios especificos.
- La validacion MMLU es reducida (114 preguntas) y no constituye una evaluacion estandarizada; el propio autor indica que una pregunta no fue parseable.
- El despliegue esta atado a forks especificos de vLLM y AITER para MI100; no hay garantia de funcionamiento en otras GPU o stacks.
- La licencia Tencent Hy License, Version 1.0 impone condiciones propias; es necesario revisar el fichero LICENSE y el NOTICE antes de cualquier uso comercial.
- Riesgo de alucinacion: no se documentan evaluaciones de veracidad ni de sesgos; al ser un modelo conversacional multimodal, es esperable el riesgo habitual en este tipo de sistemas.
- Idiomas soportados no disponibles: no se puede confirmar el rendimiento en castellano ni en otros idiomas distintos del ingles de las pruebas.
- El repositorio tiene un volumen de descargas bajo (73) y pocos me gusta (3), lo que limita la validacion independiente por parte de la comunidad.
- El almacenamiento de las tablas Engram requiere acceso al sistema de ficheros del modelo para leer los n-gramas solicitados, lo que anade requisitos de I/O en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/voodooquant/Hy4-flash-INT4-NeUQI
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Drafter DFly2 INT8 PTQR: https://huggingface.co/voodooquant/Hy4-flash-DFly2-INT8-PTQR
- Paper NeUQI: https://arxiv.org/abs/2505.17595
- Receta de conversion y almacenamiento: https://github.com/curvedinf/int8-vllm/blob/main/docs/recipes/hy4-flash.md
- Fork de AITER: https://github.com/curvedinf/int8-aiter
- Preguntas de evaluacion MMLU: https://github.com/Wallawalla47/Infernix/blob/0155ec1b94498d18dc38a5251a23accda9fbfa54/eval/corpora/iqs-1/tasks/mmlu-500.jsonl
