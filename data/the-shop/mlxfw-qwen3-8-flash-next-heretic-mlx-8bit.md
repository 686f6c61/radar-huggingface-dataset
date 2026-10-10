# the-shop/MLXFW-Qwen3.8-Flash-Next-Heretic-MLX-8bit

## Resumen

MLXFW-Qwen3.8-Flash-Next-Heretic-MLX-8bit es un checkpoint cuantizado a 8 bits en formato MLX del modelo trohrbaugh/Qwen3.8-Flash-Next-heretic, que a su vez es la derivada "decensored" (Heretic) de Qwen/Qwen3.8-Flash-Next del equipo Qwen (Alibaba). Lo publica el usuario the-shop y su proposito es hacer servible en hardware Apple Silicon un modelo de arquitectura MoE cuyo peso completo asciende a 194 GB repartidos en 45 shards, algo inviable en la memoria unificada de un Mac convencional.

La pieza clave no es la cuantizacion en si, sino el runtime: el checkpoint esta pensado para la rama q8-flash-next de TensorFold, que transmite los expertos desde el SSD a un pool en RAM en lugar de cargarlos completos. Con esa estrategia, un Mac con M5 Max y 128 GB de memoria unificada puede servir el modelo dejando espacio libre para otras tareas, con velocidades de decodificacion medidas de entre 15,6 y 58,8 tok/s segun el tamano del pool de expertos.

El checkpoint incluye la cabecera de borrador MTP (multi-token prediction) para decodificacion especulativa y elimina la torre de vision del modelo original. La licencia es la Qwen Community License 1.0 heredada sin cambios, lo que impone condiciones adicionales para el servicio comercial como Model-as-a-Service. Es un modelo decensored: el autor declara explicitamente que la responsabilidad de uso recae en el usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture of experts) con cabecera de borrador MTP; sin torre de vision |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (las mediciones y la receta de referencia usan 16 384 tokens) |
| Tipos de cuantizacion | Afine de 8 bits en MLX; grupos de 64 en lineales, embeddings y expertos; grupos de 32 en las tablas de n-gramas; routers en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (campo `license: other`, con `license_name: qwen-community-1.0`) |
| Formato de pesos | MLX afine de 8 bits, 45 shards, 194 GB |

## Arquitectura y entrenamiento

La informacion disponible no detalla el numero de parametros, la composicion del dataset ni el proceso de alineamiento (RLHF, DPO u otros) del modelo original Qwen3.8-Flash-Next. Lo que si se documenta es que se trata de un modelo de mezcla de expertos (MoE), dato que aparece tanto en las etiquetas del repositorio como en la descripcion del checkpoint. Sobre esta base, la cadena de derivacion es: el equipo Qwen entrena el modelo base; sobre el se aplica la herramienta heretic de p-e-w (con un fork de timrohrbaugh, version v1.3.0+custom) para producir la variante decensored, y finalmente the-shop genera la conversion a 8 bits en MLX.

La innovacion tecnica relevante esta en el proceso de cuantizacion y en el runtime. La conversion se realiza con `tools/convert_flash_next_q8.py`, aplicando cuantizacion afine de 8 bits con grupos de 64 elementos en lineales, embeddings y expertos, y grupos de 32 en las tablas de n-gramas, mientras que los routers se mantienen en bf16 (probablemente para preservar la precision en la seleccion de expertos, que es sensible a la cuantizacion). El checkpoint conserva la cabecera de borrador MTP, lo que habilita decodificacion especulativa, y descarta la torre de vision. La ejecucion se delega en TensorFold, que hace streaming de expertos desde SSD a un pool en RAM, permitiendo servir los 194 GB de pesos en una maquina de 128 GB.

## Capacidades

- Generacion de texto autoregresiva en un modelo MoE de gran tamano, con la salvedad de que las capacidades concretas del modelo base no estan documentadas en la informacion disponible.
- Decodificacion especulativa mediante la cabecera de borrador MTP incluida en el checkpoint; las mediciones reportadas indican que el texto generado con y sin borrador es identico token a token.
- Modo de razonamiento ("thinking") desactivable en el servidor mediante el flag `--no-thinking`; las mediciones se realizaron con thinking desactivado.
- Procesamiento de contexto configurable hasta al menos 16 384 tokens en la receta de referencia.
- Servicio local en Apple Silicon a traves del runtime TensorFold, con servidor HTTP propio.
- Sin capacidades de vision: la torre de vision fue eliminada en este checkpoint.
- Soporte de tool calling, capacidades de agente, cobertura multilingue y otras habilidades del modelo base: no disponibles en la informacion proporcionada.
- Comportamiento decensored: el proceso heretic elimina o reduce los rechazos del modelo original, lo que cambia el perfil de respuestas.

## Casos de uso

- Inferencia local de un MoE de gran tamano en un Mac de 128 GB: mediante el streaming de expertos desde SSD de TensorFold, un M5 Max puede servir un modelo que de otro modo requeriria 194 GB de memoria. Es el caso de uso central del repositorio.
- Procesamiento de documentos largos en local: con la ventana configurada a 16 384 tokens, permite analizar informes, contratos o bases de codigo extensas sin enviar datos a servicios externos, algo critico en entornos con requisitos de confidencialidad.
- Laboratorio de experimentacion con cuantizacion MoE: el checkpoint y el script de conversion permiten estudiar el impacto de distintos tamanos de grupo (64 frente a 32) y del mantenimiento de routers en bf16 sobre la calidad final.
- Banco de pruebas de decodificacion especulativa: la MTP draft head incluida y la verificacion de igualdad de tokens entre respuestas con y sin borrador lo convierten en un banco de pruebas util para medir aceleraciones de decodificacion en hardware Apple.
- Desarrollo de agentes y asistentes personales locales: el servidor TensorFold expone un endpoint HTTP que se puede integrar en flujos de trabajo propios, siempre que la tarea no requiera vision ni una ventana de contexto superior a la configurada.
- Evaluacion de modelos decensored: para investigadores que estudian el efecto del proceso heretic sobre las tasas de rechazo, la utilidad de las respuestas y el perfil de seguridad, este checkpoint ofrece una version cuantizada y ejecutable en escritorio del modelo decensored.
- Generacion de texto creativo o conversacional sin filtros: con la advertencia explicita de que se trata de un modelo decensored y de que la responsabilidad de uso es del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos numericos del repositorio corresponden a velocidad de inferencia medida en un M5 Max de 128 GB:

| Pool de expertos | Prompt nuevo, borrador activo | Mismo prompt repetido | Prefill | Pico de memoria (MLX) |
|---|---|---|---|---|
| 40 GiB (por defecto) | 15,6-18,8 tok/s | 21,3-21,7 tok/s | 168-241 tok/s | 52 GiB |
| 60 GiB | 18,9-24,3 tok/s | 58,8 tok/s | 160-238 tok/s | 72 GiB |

Condiciones de medida declaradas por el autor: dos harnesses independientes, thinking desactivado, temperatura 0, respuestas de hasta 128 tokens y contexto de 16K. La metrica son medianas de velocidad de decodificacion del lado del servidor. El autor afirma que las respuestas con borrador y las seriales contenian tokens identicos en todas las configuraciones.

## Requisitos de hardware

- Hardware de referencia: Mac con M5 Max y 128 GB de memoria unificada. El servidor requiere GPU M5 segun la model card; no se documenta compatibilidad con generaciones anteriores (M1-M4).
- Peso total del checkpoint: 194 GB en 45 shards, imposibles de cargar completos en memoria en el hardware objetivo; se accede a ellos por streaming desde SSD.
- Limite de memoria configurable: el ejemplo de la receta usa `TENSORFOLD_MEMORY_LIMIT_GB=56` con `--ssd-experts 40`, lo que produce un pico medido de 52 GiB. Con 60 GiB de pool de expertos el pico sube a 72 GiB.
- Almacenamiento: se necesita espacio en SSD para los 194 GB de pesos, y el rendimiento de decodificacion depende del subsistema de almacenamiento, ya que los expertos se transmiten en caliente.
- Comando de servicio de referencia: `tensorfold serve flashnext-q8 --name bench --ssd-experts 40 --ple-on-ssd --context 16384 --no-thinking`.
- Software necesario: Xcode Command Line Tools, el runtime TensorFold con extras `ssd` y `huggingface_hub>=0.34`.
- Opciones de despliegue alternativas: la model card menciona una ruta en llama.cpp, con historial de mediciones en el repositorio the-shop/mlxfw-qwen38-flashnext-q8. No se documentan configuraciones para vLLM, TGI, Ollama ni otras.
- Latencia y throughput: los valores medidos son 15,6-18,8 tok/s de decodificacion con pool de 40 GiB y 18,9-24,3 tok/s con pool de 60 GiB, con prefill entre 160 y 241 tok/s.
- Viabilidad en GPU de consumo: no disponible para GPUs NVIDIA o AMD; el checkpoint esta en formato MLX y el runtime documentado apunta especificamente a Apple Silicon.

## Comparativa con modelos similares

No hay datos de rendimiento comparativo en la informacion disponible para establecer una tabla con alternativas. Lo unico que se puede afirmar es la relacion de linaje entre las versiones:

| Version | Relacion | Datos disponibles |
|---|---|---|
| Qwen/Qwen3.8-Flash-Next | Modelo base original del equipo Qwen (Alibaba), en BF16 | Parametros, contexto y benchmarks: no disponibles |
| trohrbaugh/Qwen3.8-Flash-Next-heretic | Derivada decensored del anterior, en BF16, con torre de vision | Parametros y evaluacion: no disponibles |
| the-shop/MLXFW-Qwen3.8-Flash-Next-Heretic-MLX-8bit | Cuantizacion MLX de 8 bits del anterior, sin torre de vision, con MTP | 194 GB, 45 shards, throughput medido en M5 Max |

## Limitaciones y advertencias

- Modelo decensored: el proceso heretic reduce o elimina los comportamientos de rechazo del modelo original. La model card declara explicitamente que el usuario es responsable del uso que haga del modelo.
- Riesgo de alucinacion: no hay evaluaciones de fidelidad publicadas para este checkpoint ni para su base; la cuantizacion a 8 bits puede degradar ligeramente la calidad respecto al BF16 original, aunque no se aportan mediciones al respecto.
- Idiomas soportados: no disponibles. No se puede confirmar la cobertura multilingue real de esta derivada.
- Contexto: los 16 384 tokens son la configuracion usada en las pruebas, no necesariamente el maximo del modelo. No se documenta la longitud de contexto nativa ni el comportamiento en ventanas mayores.
- Licencia: Qwen Community License 1.0, heredada sin cambios. La clausula 2 exige una licencia adicional de Qwen obtenida con antelacion para el servicio comercial como Model-as-a-Service, lo que condiciona el despliegue en produccion de pago.
- Hardware muy restringido: requiere Apple Silicon M5 con GPU y 128 GB de memoria unificada segun la documentacion; no se reporta funcionamiento en otras plataformas.
- Dependencia de I/O: el streaming de expertos desde SSD hace que el rendimiento dependa del almacenamiento y del ajuste del pool; una configuracion erronea degrada gravemente la velocidad o agota la memoria.
- Sin torre de vision: cualquier tarea que requiera entrada de imagenes queda fuera del alcance de este checkpoint.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (2026-10-09). Se trata de un artefacto reciente y sin validacion externa.
- La busqueda web realizada no devolvio ninguna fuente tecnica relevante sobre el modelo; los resultados obtenidos eran articulos gramaticales sobre el articulo ingles "the", sin relacion con el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/the-shop/MLXFW-Qwen3.8-Flash-Next-Heretic-MLX-8bit
- Modelo base (decensored, BF16): https://huggingface.co/trohrbaugh/Qwen3.8-Flash-Next-heretic
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio TensorFold (rama q8-flash-next): https://github.com/the-shop/TensorFold
- Repositorio TensorFold (autor original): https://github.com/ashhart/TensorFold
- Receta de ejecucion en un Mac M5 de 128 GB: https://github.com/the-shop/TensorFold/blob/q8-flash-next/docs/recipes/qwen3.8-flash-next.md#running-it-on-a-128-gb-m5-mac
- Historial de mediciones y ruta llama.cpp: https://github.com/the-shop/mlxfw-qwen38-flashnext-q8
- Herramienta heretic: https://github.com/p-e-w/heretic
