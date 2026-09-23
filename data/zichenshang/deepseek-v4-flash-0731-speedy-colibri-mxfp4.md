# zichenshang/DeepSeek-V4-Flash-0731-speedy-colibri-mxfp4

## Resumen

DeepSeek-V4-Flash-0731-speedy-colibri-mxfp4 es un contenedor de cuantización MXFP4 del modelo DeepSeek-V4-Flash-0731, preparado por el usuario zichenshang para el motor de inferencia SpeedyColibri, un runtime escrito en Rust especializado en inferencia MoE con streaming de expertos desde NVMe sobre una única máquina DGX Spark (GB10). No se trata de un modelo nuevo ni de un ajuste fino: es un empaquetado listo para descargar y ejecutar sin paso de conversión intermedio, con los expertos enrutados copiados bit a bit desde el checkpoint QAT nativo en MXFP4. El autor justifica esta decisión indicando que un ciclo de dequantización y recuantización hacia otro formato de 4 bits medía un 6,40 % de rel-RMS de pérdida pura y un 5,9 % más de bytes, es decir, peor en ambas dimensiones.

La arquitectura subyacente es un transformer MoE de 43 capas en el que todas ellas son MoE, con 256 expertos enrutados y selección top-6 más un experto compartido. Incorpora innovaciones poco habituales: residuales con Hyper-Connections (cuatro copias del estado oculto, `[b,s,4,4096]`), atención latente con `head_dim` 512 y una única cabeza KV, proyección de salida O-LoRA de rango 1024 en 8 grupos, y attention sinks. El contexto declarado alcanza los 1.048.576 tokens con un coste de caché KV de 13,4 KB por token.

Su relevancia ahora es doble. Por un lado, sirve como caso de estudio de cuantización MXFP4 nativa sobre expertos MoE sin recodificación. Por otro, documenta de forma inusualmente honesta el rendimiento real de un modelo de esta escala en hardware de un solo chasis: 4,7 tok/s de decodificación y 13,8 tok/s de prefill sobre una DGX Spark con 121,7 GiB de memoria unificada, con el 79 % de los 11.008 expertos enrutados residentes en memoria y el resto servidos desde NVMe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE denso en todas las capas (43 capas, todas MoE), con residuales Hyper-Connections, atención latente, Indexer de la familia DSA y Compressor de contexto |
| Parametros totales | no disponible |
| Parametros activos | no disponible (configuración de enrutado: top-6 de 256 expertos enrutados más 1 experto compartido por capa, en las 43 capas) |
| Longitud de contexto | 1.048.576 tokens (1M); ventana deslizante de 128 tokens sobre KV en crudo, el resto accesible solo a través del Compressor |
| Tipos de cuantizacion | MXFP4 en expertos (nibbles en bloques de 32 con escalas E8M0, paso sin recuantizar) y fp8 e4m3 en pesos densos |
| Idiomas soportados | no disponible |
| Licencia | MIT, heredada del modelo base; se incluye el fichero LICENSE original en el repositorio |
| Formato de pesos | 45 shards, 145 GiB (partiendo de una fuente fp8 de 167 GB); el formato de serialización no se especifica explícitamente en la model card. Contenedor específico para el motor SpeedyColibri, no portable directamente a otros runtimes |

## Arquitectura y entrenamiento

El checkpoint base es DeepSeek-V4-Flash-0731, desarrollado por DeepSeek. La model card de este contenedor describe la arquitectura con detalle, pero no aporta información sobre el entrenamiento: no se indica el número de tokens, la composición del dataset, ni si hubo fases de RLHF o DPO. Lo único relevante en ese sentido es que los expertos enrutados son QAT nativos en MXFP4, lo que implica que la cuantización de 4 bits se incorporó durante el entrenamiento con conciencia de cuantización y no como un post-proceso.

Los elementos arquitectónicos destacables son varios. El flujo residual no es un stream convencional, sino Hyper-Connections con cuatro copias del estado oculto. La atención es latente, con `head_dim` 512 y una sola cabeza KV, proyección de salida O-LoRA de rango 1024 dividida en 8 grupos y attention sinks. El manejo del contexto combina una ventana deslizante de 128 tokens sobre KV en crudo con un Compressor presente en 41 de las 43 capas, con ratios que alternan entre 4 y 128; todo lo anterior a la ventana solo es accesible a través de ese Compressor. Además, 21 de las 43 capas incorporan un Indexer de la familia DSA con `index_topk` de 512. El enrutado usa puntuaciones `sqrt(softplus)` con `noaux_tc`, y las tres primeras capas saltan por completo el router para seleccionar expertos mediante una tabla hash `tid2eid[token_id]`.

Una corrección documentada en la propia model card merece atención: una revisión anterior informaba de un techo de aproximadamente 40.000 tokens con 206,9 KB por token. Ese límite era una restricción del motor, no del checkpoint, porque la caché KV reservaba el contexto completo para el nivel latente en crudo pese a que solo se lee la ventana de 128 tokens. Tras el arreglo, el nivel en crudo es un anillo dimensionado a la ventana, de modo que ese coste pasa a ser por secuencia y no por token.

## Capacidades

La model card de este repositorio es una ficha de empaquetado e inferencia, no una ficha de capacidades. No documenta comportamiento funcional del modelo, por lo que buena parte de los apartados habituales quedan como no disponibles.

- Generación de texto: capacidad inherente al modelo base DeepSeek-V4-Flash-0731, aunque no se detalla en la información disponible.
- Razonamiento, código, matemáticas y visión: no disponible. No hay ninguna mención en la model card.
- Tool calling y function calling: no disponible. No se documenta plantilla de chat ni formato de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente. El contexto de 1M tokens y el Indexer DSA son compatibles con flujos de contexto largo, pero no hay confirmación de soporte de agentes.
- Capacidades multilingües: no disponible. El campo de idiomas no viene informado.
- Capacidad diferencial documentada: inferencia MoE con streaming de expertos en una sola máquina, con contexto completo de 1.048.576 tokens a 13,4 KB por token, más barato por token que un híbrido de 120B (16 KB) pese a cachear KV en las 43 capas.
- Modo de pensamiento o audio: no disponible.

## Casos de uso

- Inferencia local en una DGX Spark sin depender de la nube: el contenedor está pensado para ejecutarse con `scripts/serve.sh` sobre un GB10 con 121,7 GiB de memoria unificada, sirviendo por HTTP desde el propio chasis. Es adecuado cuando la soberanía del dato o la ausencia de conectividad pesan más que la velocidad.
- Análisis de documentos muy largos que no caben en ventanas convencionales: con 1.048.576 tokens de contexto y 13,4 KB de KV por token, el modelo puede ingerir corpus completos (expedientes, bases de código, actas) en una sola pasada, siempre que la memoria lo permita.
- Procesamiento por lotes asíncrono tolerante a latencia: con 4,7 tok/s de decodificación y 4,3 tok/s de mediana en servicio, encaja en trabajos nocturnos o colas de fondo donde el tiempo total importa menos que el coste por unidad de cómputo.
- Investigación sobre cuantización MXFP4 en MoE: el repositorio permite comparar directamente la calidad y el tamaño de un paso bit-exact frente a una recuantización a otro formato de 4 bits, con la métrica de 6,40 % de rel-RMS ya publicada como referencia.
- Evaluación de motores de inferencia con streaming de expertos: sirve para reproducir el escenario en el que el 79 % de los 11.008 expertos residen en memoria y el 21 % restante se sirve desde NVMe, midiendo el impacto del ancho de banda de disco en la decodificación.
- Despliegue en entornos aislados con licencia permisiva: al heredar MIT del modelo base y no requerir servicios externos, es apto para instalaciones air-gapped donde se necesita trazabilidad legal de los pesos y del motor.
- Reproducción de medidas de rendimiento en hardware de un solo chasis: los scripts del motor permiten replicar la tabla de la flota y verificar la dispersión del 5,5 % entre repeticiones (4,53-4,78 tok/s) que el autor advierte explícitamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K ni similares) en la información disponible. La model card únicamente reporta métricas de velocidad medidas sobre una DGX Spark (GB10, 121,7 GiB de memoria unificada) el 2026-08-09.

| Metrica | Valor | Notas |
|---|---|---|
| Decodificacion (end-to-end) | 4,7 tok/s | Igual a forward-only |
| Decodificacion (rango de 8 repeticiones) | 4,53-4,78 tok/s | Dispersión del 5,5 % sin cambios de código |
| Prefill | 13,8 tok/s (37,1 s) | |
| Servicio por HTTP (mediana) | 4,3 tok/s | 12 prompts diversos |
| Residentia de expertos | 79 % de 11.008 expertos enrutados | El resto se sirve desde NVMe; medido el 2026-08-05, no repetido |
| Coste de KV | 13,4 KB/token | Contexto completo de 1.048.576 tokens |
| Tamano del contenedor | 145 GiB, 45 shards | Fuente fp8 de 167 GB |

El autor advierte que la columna de decodificación es la más ruidosa y que una única tanda debe tratarse como una sola muestra, sin interpretar diferencias frente a revisiones anteriores de la ficha como mejoras de velocidad.

## Requisitos de hardware

- Memoria: el contenedor ocupa 145 GiB, por lo que requiere una máquina con memoria unificada o VRAM de ese orden. La medida de referencia se tomó sobre un DGX Spark (GB10) con 121,7 GiB, donde el 21 % de los expertos se sirve desde NVMe.
- GPU recomendadas: DGX Spark (GB10) es el hardware de referencia documentado. No se mencionan A100, H100 ni RTX 4090 en la información disponible.
- GPU de consumo: no viable. El tamaño del contenedor supera con creces los 24 GB de una RTX 4090 y también la VRAM de aceleradores profesionales habituales; el motor está diseñado para memoria unificada de 121,7 GiB más almacenamiento NVMe.
- Almacenamiento: NVMe rápido es parte del diseño, no un extra, dado que el 21 % de los expertos enrutados se transmiten desde disco durante la inferencia.
- Opciones de despliegue: exclusivamente SpeedyColibri (GitHub: GriffinPilz/SpeedyColibri), motor en Rust. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y el contenedor es específico de este runtime.
- Descarga y arranque: `scripts/fetch.sh deepseek-v4-flash` y `scripts/serve.sh deepseek-v4-flash 8080`. La descarga manual con `huggingface-cli` exige respetar el nombre de directorio `DeepSeek-V4-Flash-0731-container-v2`, porque el registro resuelve `deepseek-v4-flash` a `-container-v2` y cualquier otra ruta no sirve nada.
- Latencia y throughput: 4,7 tok/s de decodificación y 37,1 s de prefill en la configuración medida. No hay datos publicados para otras configuraciones de hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-0731-speedy-colibri-mxfp4 | no disponible | 1.048.576 tokens | MXFP4 (expertos) + fp8 e4m3 (densos), 145 GiB en 45 shards | MIT | HuggingFace, contenedor para SpeedyColibri |
| unsloth/DeepSeek-V4-Flash-0731 (upstream fp8) | no disponible | no disponible | fp8, 167 GB de origen | no disponible | HuggingFace |
| deepseek-ai/DeepSeek-V4-Flash-0731 (base) | no disponible | no disponible | no disponible | MIT (heredada por este contenedor) | HuggingFace |
| Recuantizacion a otro formato de 4 bits | no disponible | no disponible | 4 bits alternativo | no disponible | No publicada; usada solo como referencia de comparacion (6,40 % rel-RMS de perdida, 5,9 % mas bytes) |

No se dispone de especificaciones de parámetros totales ni de benchmarks de calidad para ninguno de los modelos comparados en la información proporcionada, por lo que la comparación se limita a formato, tamaño de artefacto, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo nuevo: es un contenedor de cuantización del checkpoint base. Cualquier limitación de DeepSeek-V4-Flash-0731 se hereda íntegramente y no se documenta aquí.
- Rendimiento muy bajo: 4,7 tok/s de decodificación y 4,3 tok/s de mediana en servicio hacen inviable el uso interactivo en tiempo real. Es un perfil de procesamiento por lotes.
- Ruido de medición: el propio autor advierte que las ocho repeticiones que sustentan la mediana abarcan de 4,53 a 4,78 tok/s, un 5,5 % de dispersión sin cambios de código, y pide no leer diferencias entre revisiones de la ficha como mejoras.
- Dependencia de un motor concreto: el contenedor no es portable a vLLM, llama.cpp, Ollama ni TGI. Queda atado al mantenimiento y a la hoja de ruta de SpeedyColibri.
- Dependencia de hardware: requiere memoria unificada del orden de 121,7 GiB más NVMe rápido. No cabe en GPU de consumo.
- Idioma: el campo de idiomas no viene informado en el repositorio, por lo que no hay garantía documentada de cobertura multilingüe.
- Sesgos y alineación: no disponible. No se documentan sesgos conocidos, filtros de seguridad ni comportamiento ante prompts adversarios.
- Alucinación: no disponible. No hay evaluaciones de fidelidad ni de tasa de alucinación publicadas para este contenedor.
- Licencia: MIT heredada del modelo base. Es permisiva y permite uso comercial, pero conviene verificar los términos del checkpoint original de DeepSeek y del checkpoint fp8 de unsloth, ya que este repositorio solo reproduce el LICENSE heredado.
- Discrepancia de identificadores: el ID del repositorio es `zichenshang/DeepSeek-V4-Flash-0731-speedy-colibri-mxfp4`, mientras que el comando de descarga manual de la model card apunta a `Kanposer/DeepSeek-V4-Flash-0731-speedy-colibri-mxfp4`. Hay que verificar cuál resuelve correctamente antes de automatizar despliegues.
- Discrepancia de tamaño: el repositorio figura con 154,7 GB en HuggingFace y la model card declara 145 GiB y 45 shards. La diferencia puede deberse a la contabilidad de bytes frente a GiB o a metadatos, pero no se explica en el texto.
- Historial de límites corregidos: una revisión previa del motor imponía un techo de contexto de unos 40.000 tokens por una mala dimensión de la caché KV. Aunque está corregido, conviene fijar la versión del motor para evitar reproducir el comportamiento antiguo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/zichenshang/DeepSeek-V4-Flash-0731-speedy-colibri-mxfp4
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Checkpoint fp8 de origen: https://huggingface.co/unsloth/DeepSeek-V4-Flash-0731
- Motor de inferencia SpeedyColibri: https://github.com/GriffinPilz/SpeedyColibri
- Tabla de rendimiento y método del motor: https://github.com/GriffinPilz/SpeedyColibri#1--how-fast-is-it
- Proyecto original colibrì, del que deriva la idea de streaming de expertos: https://github.com/pjw1/colibri
- Ruta de descarga manual alternativa citada en la model card: https://huggingface.co/Kanposer/DeepSeek-V4-Flash-0731-speedy-colibri-mxfp4

Nota: las búsquedas web realizadas no devolvieron resultados relevantes sobre este modelo ni sobre su modelo base; los enlaces recuperados correspondían a temas ajenos y se han descartado.
