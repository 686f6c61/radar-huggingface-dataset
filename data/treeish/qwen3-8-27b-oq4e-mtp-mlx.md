# treeish/Qwen3.8-27B-oQ4e-MTP-MLX

## Resumen

Qwen3.8-27B-oQ4e-MTP-MLX es un paquete de pesos cuantizados publicado por el usuario treeish para su uso dentro de Sprig, el agente de codificación de Treeish. No es un modelo nuevo: es una distribución curada del modelo denso Qwen3.8-27B de Qwen, convertido a MLX con una cuantización mixta de precisión oQ4e (4 bits por defecto con overrides a 5 bits en determinados tensores) y con la cabeza de Multi-Token Prediction (MTP) embebida. El repositorio ocupa 17,0 GB y contiene 27.781.427.952 parámetros según los safetensors indexados.

El paquete incorpora además una plantilla de chat concreta, la v22.5 de Froggeric, sustituida respecto al modelo base y verificada byte a byte contra su repositorio de plantillas. Los pesos, la configuración y el informe de calibración oQ son idénticos byte a byte al paquete Jundot/Qwen3.8-27B-oQ4e-mtp en el commit 04dc5509edd8670fc78cc8c2f74bf9b77b1f2acc, por lo que este repositorio funciona como distribución fijada por commit (no sigue `main`) más que como una conversión original.

Su relevancia es acotada pero clara: ofrece un modelo de 27B denso con ventana de 262.144 tokens, torre de visión y MTP en un formato listo para ejecutarse en memoria unificada de Apple Silicon (48 GB de uso, 64 GB recomendados), a coste de depender de un runtime MLX concreto. La licencia Apache 2.0 del modelo base permite uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen/Qwen3.8-27B), con torre de visión y una capa MTP embebida |
| Parámetros totales | 27.781.427.952 (27,78 B) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | oQ4e (MLX, precisión mixta con imatrix): 4-bit affine por defecto, group size 64, con overrides a 5-bit, group size 64, por tensor |
| Idiomas soportados | no disponible (la model card no los declara; el dataset de calibración se llama `oqe_code_multilingual`) |
| Licencia | apache-2.0 |
| Formato de pesos | MLX safetensors (4 shards; 16.971.681.558 bytes de datos tensoriales) |
| Tensores indexados | 2.209 en total: 333 de la torre de visión y 29 de la MTP embebida (`language_model.mtp.*`) |
| Librería / pipeline | `mlx` / `image-text-to-text` |
| Modelo base | Qwen/Qwen3.8-27B |
| Repositorio de origen de la cuantización | Jundot/Qwen3.8-27B-oQ4e-mtp (commit `04dc5509edd8670fc78cc8c2f74bf9b77b1f2acc`) |
| Plantilla de chat | Froggeric v22.5, idéntica byte a byte a `chat_template.jinja` de froggeric/Qwen-Fixed-Chat-Templates (commit `855bffc49448e299789730ff92c9b8d834d6cc14`) |
| Tamaño del repositorio | 17,0 GB |
| Fecha de creación / actualización | 2026-09-11 / 2026-09-11 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de 27B parámetros con soporte multimodal de imagen y texto, dado que el paquete incluye 333 tensores de torre de visión y se publica con el pipeline `image-text-to-text`. Sobre esa base, el paquete añade una capa de Multi-Token Prediction embebida (29 tensores bajo `language_model.mtp.*`), un mecanismo que permite predecir varios tokens por paso y que en la práctica se emplea para acelerar la decodificación. La ventana de contexto declarada es de 262.144 tokens.

No hay información sobre el entrenamiento del modelo base en la documentación proporcionada: no se indica número de tokens, composición del dataset, ni si hubo etapas de RLHF, DPO u otras. Lo único documentado es el proceso de cuantización: el conversor declarado es oMLX 0.6.1, y el informe imatrix registra 128 muestras de 512 tokens procedentes del dataset `oqe_code_multilingual`, con 503 de 504 entradas aplicadas. Esta calibración orientada a código y multilingüismo es la innovación técnica real del paquete, junto con los overrides de precisión por tensor (4 bits por defecto, 5 bits en tensores seleccionados) y la plantilla de chat ajustada.

Un punto importante de trazabilidad: el autor declara explícitamente que no se identifica el commit exacto del modelo base usado en la conversión, por lo que el paquete es una distribución fijada por bytes, no una receta de conversión reproducible byte a byte. Tampoco se modificó ningún tensor del modelo, tokenizer o configuración en esta release: solo se sustituyó la plantilla de chat y se añadieron licencia, procedencia y manifiesto de ficheros.

## Capacidades

- Generación de texto conversacional multi-turno, con la plantilla de chat de Froggeric v22.5 orientada al flujo de agente de codificación de Sprig.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`, 333 tensores de torre de visión).
- Generación de código: el dataset de calibración imatrix (`oqe_code_multilingual`) está específicamente orientado a código, lo que sugiere que se priorizó preservar la calidad en ese dominio al cuantizar.
- Capacidades multilingües: el nombre del dataset de calibración indica cobertura multilingüe, pero la model card no enumera idiomas soportados.
- Decodificación acelerada mediante la cabeza MTP embebida (1 capa), que permite generar más de un token por paso de decodificación.
- Contexto largo de hasta 262.144 tokens, adecuado para repositorios completos o documentos extensos.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible. La plantilla de chat procede de un flujo de agente de código, lo que es indicativo pero no concluyente; conviene validarlo con el runtime y el formato de herramientas propios.
- Modo de razonamiento (thinking mode): no disponible.
- Audio: no soportado según la información disponible.

## Casos de uso

- Agente de codificación local en Mac: el paquete está construido para el flujo de agente de código de Sprig y se carga desde memoria unificada de 48 GB (64 GB recomendados), lo que permite ejecutar un modelo de 27B con contexto largo sin depender de GPU dedicada.
- Revisión de repositorios completos: con 262.144 tokens de contexto se puede ingerir un árbol de código extenso y pedir análisis de dependencias, detección de patrones problemáticos o generación de parches coherentes entre ficheros.
- Refactorización asistida con contexto de proyecto: al mantener el contexto de múltiples ficheros en una sola sesión, el modelo puede proponer cambios que respeten convenciones y APIs internas sin reinyectar el contexto en cada turno.
- Asistencia sobre capturas e interfaces: la torre de visión permite pasar imágenes de UI, diagramas de arquitectura o capturas de errores junto al texto, útil para generar componentes a partir de un mockup o interpretar trazas visuales.
- Documentación técnica multilingüe: la calibración orientada a multilingüismo sugiere un comportamiento razonable traduciendo y generando documentación, aunque la lista exacta de idiomas debe validarse con pruebas propias antes de comprometerse en producción.
- Despliegue en portátiles Apple Silicon para desarrollo offline: al ser un formato MLX con pesos ya cuantizados, el modelo se puede distribuir a equipos de desarrollo sin acceso a clústeres, manteniendo una ventana de contexto amplia.
- Aceleración de inferencia interactiva: la cabeza MTP embebida está pensada para reducir la latencia de generación token a token, lo que favorece escenarios de autocompletado o chat con respuesta en streaming.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica que el benchmark de release de Treeish todavía no se ha ejecutado sobre este paquete y que `RELEASE_MANIFEST.json` se actualizará cuando ocurra. Los resultados de la búsqueda web proporcionada no contienen información relacionada con este modelo ni con MLX.

## Requisitos de hardware

- Peso de los tensores: 16.971.681.558 bytes (unos 16,97 GB) repartidos en 4 shards; el repositorio completo ocupa 17,0 GB.
- Memoria: el autor indica que Treeish usa el modelo desde 48 GB de memoria unificada y recomienda 64 GB. El margen disponible depende de la longitud de contexto, la configuración de caché y otras aplicaciones en ejecución.
- Plataforma: MLX es específico de Apple Silicon, por lo que el destino natural son Macs con memoria unificada de 48 GB o más (configuraciones M-series Max/Ultra). No se documenta ejecución en GPU CUDA con este formato.
- GPU consumer dedicada: no disponible para este formato. No se publican cuantizaciones GGUF en el repositorio, de modo que su uso en llama.cpp u Ollama requeriría una conversión propia. Tampoco se publican pesos AWQ/GPTQ para vLLM o TGI.
- Compatibilidad de runtime: el paquete está construido para el runtime MLX Swift fijado por Treeish. Cualquier otro runtime debe soportar los overrides de cuantización por tensor definidos en `config.json` y el layout MTP embebido de Qwen; si no lo hace, la carga puede fallar o degradarse.
- Contexto largo: los 262.144 tokens implican un consumo de caché KV considerable y no cuantificado en este paquete; no se publican cifras de memoria por contexto.
- Latencia y throughput: no disponible. La única indicación indirecta es que la capa MTP existe para mejorar la velocidad de generación.
- Opciones de despliegue documentadas: runtime MLX Swift de Treeish. Otras opciones MLX (por ejemplo, herramientas del ecosistema MLX para texto y visión) no están confirmadas por el autor para este paquete concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| treeish/Qwen3.8-27B-oQ4e-MTP-MLX | 27,78 B densos | 262.144 | MLX safetensors, oQ4e mixta (4-bit + overrides 5-bit) | Apache 2.0 | Repositorio propio, 0 descargas; plantilla de chat sustituida |
| Jundot/Qwen3.8-27B-oQ4e-mtp | 27,78 B densos | 262.144 (según el paquete derivado) | MLX safetensors, oQ4e mixta | Apache 2.0 | Origen byte a byte de los pesos; sin plantilla de chat propia de Sprig |
| Qwen/Qwen3.8-27B | 27 B densos (aprox., arquitectura declarada) | no disponible en la información proporcionada | Pesos originales sin cuantizar | Apache 2.0 | Modelo base oficial de Qwen |

No se dispone de datos de rendimiento comparado entre estos tres elementos, ni de otros modelos alternativos de la misma categoría en la información proporcionada. La comparación se limita a parámetros, contexto, formato y licencia.

## Limitaciones y advertencias

- La cuantización intercambia calidad por memoria y velocidad de generación local: el propio autor recomienda validar el modelo contra los prompts, el formato de herramientas y el runtime propios antes de usarlo en producción.
- No hay benchmark de release ejecutado sobre este paquete, por lo que no existe evidencia publicada de su calidad relativa frente al modelo base sin cuantizar.
- El commit exacto del modelo base usado en la conversión no está identificado. Esto impide reproducir la conversión byte a byte, aunque los pesos distribuidos sí están fijados y verificables por SHA-256 en `RELEASE_MANIFEST.json`.
- Dependencia fuerte del runtime: se requieren overrides de cuantización por tensor y soporte del layout MTP embebido. Un runtime distinto puede no cargar el modelo o hacerlo de forma incorrecta.
- Los idiomas soportados no están declarados en la model card, a pesar de que el dataset de calibración es multilingüe. Conviene validar el comportamiento en los idiomas objetivo antes de desplegar.
- Riesgo de alucinación: no se documenta de forma específica para este paquete. Como en cualquier modelo generativo, se aplica el riesgo general, agravado en tareas de código donde una API inventada compila pero falla en ejecución.
- Sesgos conocidos: no disponible. No se publica ninguna evaluación de sesgos ni de seguridad.
- Contexto máximo de 262.144 tokens: superar ese límite no está soportado y acercarse a él incrementa el consumo de memoria de forma no cuantificada en la documentación.
- Licencia Apache 2.0: permite uso comercial. El texto completo de la licencia se incluye en el repositorio y la plantilla de Froggeric también declara Apache 2.0, con atribución incluida.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de recoger los datos. Es un paquete recién publicado y sin uso externo documentado.
- El repositorio no contiene código ejecutable personalizado, lo que reduce el riesgo de seguridad asociado a la carga de pesos remotos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/treeish/Qwen3.8-27B-oQ4e-MTP-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Texto de la licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- Origen de los pesos cuantizados: https://huggingface.co/Jundot/Qwen3.8-27B-oQ4e-mtp
- Repositorio de plantillas de chat (Froggeric): https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
- Resultados de la búsqueda web: no contienen información relacionada con este modelo, con MLX ni con el ecosistema Qwen. Los enlaces devueltos corresponden a la aplicación Paint de Microsoft y a clones web de la misma, por lo que se descartan como fuentes.
