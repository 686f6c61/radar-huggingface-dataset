# webmp3/Sakura-DeepSeek-V4.1-Flash-1017-Unsloth-UD-IQ3_XXS-Engram-Q3_K-GGUF

## Resumen

Sakura-DeepSeek-V4.1-Flash-1017-Unsloth-UD-IQ3_XXS-Engram-Q3_K es un repack de cuantización GGUF publicado por el usuario webmp3 a partir del checkpoint DeepSeek-V4.1-Flash-1017, un modelo de mezcla de expertos (MoE) de 748.494.643.824 parámetros totales según los safetensors del checkpoint original. El paquete no reentrena ni repodera nada: copia los seis shards del backbone del GGUF de unsloth y sustituye únicamente las tablas de búsqueda Engram por una carga Q3_K ya cuantizada previamente, reduciendo el conjunto principal de 394,737 GB a 317,934 GB (un 19,46 % menos, 76,802 GB ahorrados).

Su interés es práctico: permite ejecutar un modelo de ~748B parámetros en un espacio de disco mucho menor que el GGUF de partida, manteniendo intactos todos los expertos enrutados y todas las filas de las tablas Engram, sin poda ni recuantización adicional del backbone. La etiqueta UD-IQ3_XXS describe la receta del backbone heredado de unsloth, mientras que Q3_K describe exclusivamente las tablas Engram: no es una cuantización Q3_K del modelo completo.

La contrapartida es importante: el autor declara explícitamente que no se ha realizado ninguna prueba de inferencia completa sobre este paquete exacto. Las verificaciones cubren integridad de ficheros, formato, direccionamiento, geometría de tablas y rutas de decoder aisladas en CPU, pero no calidad de generación, perplejidad, velocidad ni encaje en hardware concreto. El modelo es relevante para quien necesite evaluar la familia DeepSeek-V4.1 Flash en un entorno con restricciones de almacenamiento, asumiendo que debe validar por su cuenta el comportamiento real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE) con tablas de búsqueda Engram en las capas 1 y 14 (según model card); detalles de atención yrutado no disponibles |
| Parametros totales | 748.494.643.824 (dato de safetensors del checkpoint base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Backbone UD-IQ3_XXS (heredado de unsloth); tablas Engram en Q3_K (GGML type 11, 110 bytes por fila de 256 valores); sin MXFP8, IQ4_NL, Q5_K ni Q6_K en las tablas Engram de este paquete |
| Idiomas soportados | en, zh |
| Licencia | MIT (según etiqueta del repo; condiciones del checkpoint original no disponibles) |
| Formato de pesos | GGUF, 7 shards numerados; conjunto principal 317.934.311.867 bytes (296,099 GiB); repo completo 317,9 GB |

## Arquitectura y entrenamiento

El modelo base es DeepSeek-V4.1-Flash-1017, un MoE de 748B parámetros totales. La model card de este repack no documenta la composición del dataset de entrenamiento, el número de tokens vistos, ni si hubo RLHF, DPO u otras fases de alineación: esos datos no están disponibles en la información proporcionada. Tampoco se detalla el mecanismo de atención ni si el modelo incorpora atención lineal, decodificación especulativa u otras innovaciones del checkpoint original.

El elemento diferencial del paquete son las tablas Engram, descritas como tablas de búsqueda con mapeo de tokens, constantes de hash, tamaños de bucket y metadatos de direccionamiento. Ocupan dos capas (1 y 14), con 384.006.168 y 384.016.682 filas respectivamente, 768.022.850 filas totales y 256 valores por fila, almacenadas como una única tabla combinada (capa 1 seguida de la capa 14) con índice de corte en la fila 384.006.168. La carga Q3_K ocupa 84.482.513.500 bytes. El autor verificó 192 filas Q3 reales de ambas capas (incluidas filas centrales y finales) contra fixtures congelados, así como los límites de capa, gathers inversos y offsets de 64 bits en la ruta nativa host-gather Q3_K, pero no caracterizó el efecto de la cuantización Q3_K sobre la calidad final.

En cuanto a la procedencia: el backbone proviene de la revisión `60ad3651641b5c97679c807e064ab1d7a3ca1455` de unsloth/DeepSeek-V4.1-Flash-1017-GGUF, y la carga Q3_K se reutiliza de la variante Sakura Maya-S (revisión `4a701f59f623b08a859368926cd9a210ab446941`), cuantizada a su vez desde las tablas Q6_K de peasantsmith. No se recuantiza nada en este paso: solo se ajusta la cabecera GGUF de la tabla.

## Capacidades

- Generación de texto conversacional en inglés y chino, según el `pipeline_tag` y los idiomas declarados.
- Razonamiento y generación de código: capacidades propias del checkpoint DeepSeek-V4.1-Flash subyacente; no cuantificadas en esta ficha por ausencia de benchmarks del paquete.
- Palabras clave declaradas por el autor: `conversational`, `text-generation`, `endpoints_compatible`, `imatrix`, `mixture-of-experts`.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere despliegue vía API compatible con el runtime de referencia; no se especifica el contrato exacto.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multimodales: el autor menciona ficheros opcionales de visión fuera del conjunto principal, pero no se documenta su funcionamiento ni se han validado.
- Modo thinking explícito: no disponible.
- Capacidad multilingüe: limitada a en y zh según la etiqueta de idiomas; no se declara castellano.

## Casos de uso

- Evaluación de la familia DeepSeek-V4.1 Flash con presupuesto de disco reducido: el paquete ahorra 76,802 GB frente al GGUF de unsloth, lo que permite alojar el modelo en volúmenes de almacenamiento donde la variante de 394,7 GB no cabría, manteniendo todos los expertos.
- Servicio de chat en inglés o chino con MoE de gran escala: adecuado para conversaciones multi-turno en esos dos idiomas, siempre que se valide antes la calidad de generación del paquete, no medida por el autor.
- Investigación sobre cuantización de tablas de búsqueda: las tablas Engram en Q3_K con geometría documentada (768.022.850 filas × 256 valores) y fixtures de filas reales sirven como material para estudiar el impacto de cuantizar lookup tables frente a cuantizar pesos densos.
- Réplica de pipelines de inferencia GGUF: útil para probar runtimes que soporten el layout DeepSeek-4.1 de unsloth, en concreto el fork de llama.cpp en el commit `b72050d03ae14bb3cb5138ecefab3f3f65157d31` (PR #30817), verificando la ruta host-gather Q3_K.
- Archivado y distribución de checkpoints: al conservar las identidades LFS SHA-256 de los seis shards del backbone, el paquete es verificable de extremo a extremo, lo que facilita su uso en entornos con requisitos de procedencia.
- Despliegue en clúster con offload a disco o CPU: dado el tamaño del conjunto principal (296,099 GiB), encaja en escenarios de inferencia con memoria agregada muy grande o con capas descargadas a RAM/disco, no en estaciones de trabajo monousuario.
- Base para experimentos de cuantización incremental: al separar backbone y tablas Engram, permite sustituir solo el componente Engram por otras precisiones sin tocar los expertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor indica expresamente que no se han ejecutado pruebas de inferencia completa, calidad de generación, perplejidad ni velocidad sobre este paquete exacto, y que los benchmarks del upstream y de otras variantes Sakura no son mediciones de esta release. El error de reconstrucción de filas tampoco equivale a calidad del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como medición. Como cota inferior derivada del tamaño de los pesos, el conjunto principal son 296,099 GiB (317,934 GB decimales) en disco, a los que hay que sumar caché KV y buffers de runtime; el autor advierte explícitamente que el tamaño de fichero no es consumo de RAM/VRAM ni prueba de que el paquete quepa en una máquina concreta.
- GPU recomendadas: no disponibles. Por volumen de pesos, un despliegue íntegro en VRAM requiere agregados del orden de 300 GiB o más, lo que implica múltiples aceleradores de 80 GB (A100/H100/H200) o reparto entre VRAM, RAM y disco; no hay ninguna combinación validada por el autor.
- ¿Cabe en GPU de consumo? No para el conjunto completo: 296,099 GiB de pesos exceden con holgura los 24 GB de una RTX 4090 o los 32 GB de una RTX 5090. Solo sería viable con offload masivo a RAM o disco, escenario no probado.
- Opciones de despliegue: runtime que soporte el layout DeepSeek-4.1 de unsloth; el autor cita el fork de llama.cpp en `b72050d03ae14bb3cb5138ecefab3f3f65157d31` (PR #30817). Advierte que esto no cualifica a llama.cpp estándar, LM Studio ni versiones de Maya. Compatibilidad con vLLM, TGI u Ollama: no disponible.
- Latencia y throughput: no disponibles. No se ha ejecutado ninguna prueba de velocidad.
- Requisitos de plataforma: no se ha realizado cualificación en GPU, Windows ni AMD; las verificaciones de decoder y direccionamiento son en CPU aislada.
- Almacenamiento: el repo completo ocupa 317,9 GB; el conjunto principal, 296,099 GiB. Los ficheros DSpark/drafter, visión, imatrix, runtime y documentación son opcionales y quedan fuera de esa cifra.

## Comparativa con modelos similares

Comparativa dentro de la misma familia de releases, con datos de la propia model card. No se dispone de información sobre modelos de otras familias comparables.

| Release | Contenido | Tamano | Notas |
|---|---|---|---|
| Este paquete (UD-IQ3_XXS + Engram Q3_K) | Backbone UD-IQ3_XXS intacto + tablas Engram Q3_K | 317.934.311.867 B (296,099 GiB) | Sin prueba de inferencia completa; backbone idéntico al upstream por SHA-256 |
| Upstream unsloth/DeepSeek-V4.1-Flash-1017-GGUF | Conjunto GGUF principal con tablas Engram originales | 394.736.596.867 B | Base directa de este repack; backbone sin cambios |
| Variante Sakura Maya-S (Engram Q3_K, IQ2_XXS) | IQ2_XXS + Engram Q3_K | 339.478 GB (original Maya-S) | Origen de la carga Q3_K reutilizada; no es un baseline de memoria o calidad equivalente |
| Checkpoint oficial en safetensors | Pesos completos | ~510,297 GB (paquete amplio) | Referencia de origen; cifras no comparables en calidad ni memoria |

Frente a los 394,737 GB del upstream, este repack reduce un 19,46 %. Frente al checkpoint en safetensors (~510,297 GB), la reducción es aún mayor, pero la comparación no es homogénea porque el empaquetado y el alcance difieren. No hay datos de rendimiento que permitan comparar calidad entre variantes.

## Limitaciones y advertencias

- Ausencia total de validación de inferencia: el autor declara que no se ha ejecutado una prueba de generación completa. No hay garantía de que el paquete produzca texto coherente con el runtime indicado.
- Sin métricas de calidad: no se han medido perplejidad, benchmarks, velocidad ni encaje en hardware. Cualquier cifra de rendimiento atribuida a este repo sería inventada.
- Dependencia estricta de runtime: requiere un fork concreto de llama.cpp (`b72050d03ae14bb3cb5138ecefab3f3f65157d31`). No está cualificado para llama.cpp estándar, LM Studio ni versiones de Maya; usarlo con otro runtime puede fallar silenciosamente.
- Etiqueta potencialmente engañosa: UD-IQ3_XXS describe el backbone, no el modelo completo; Q3_K se aplica solo a las tablas Engram. Asumir que todo el modelo está en Q3_K o en IQ3_XXS es un error.
- Cobertura de verificación parcial: las comprobaciones de decoder y direccionamiento son en CPU aislada; no se ha cualificado ejecución en GPU, Windows ni AMD.
- Muestreo insuficiente para identidad completa: se compararon 192 filas Q3 y 96 filas Q6 en variantes relacionadas; el propio autor advierte que las muestras no prueban la identidad completa del payload Q6 original.
- Idiomas: solo en y zh. El rendimiento en castellano no está declarado ni medido.
- Sesgos: no documentados. Al no haber evaluación del paquete, no se pueden caracterizar sesgos específicos de esta cuantización.
- Riesgo de alucinación: inherente a los modelos generativos; sin benchmarks ni evaluación humana de este paquete, el riesgo no está cuantificado.
- Licencia: la etiqueta del repo es MIT, pero no se proporciona la licencia del checkpoint original DeepSeek-V4.1-Flash-1017 ni de los GGUF de unsloth. Antes de un uso comercial conviene verificar los términos de toda la cadena de procedencia.
- Repo sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que existan reportes de terceros sobre su funcionamiento.
- Los resultados de la búsqueda web asociados a esta consulta no contenían información técnica relevante sobre el modelo y se han descartado por completo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/webmp3/Sakura-DeepSeek-V4.1-Flash-1017-Unsloth-UD-IQ3_XXS-Engram-Q3_K-GGUF
- Checkpoint original: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017 (revisión `1bae0e1088993b9b82de08f59de5be5a34e42170`)
- GGUF de unsloth (base directa): https://huggingface.co/unsloth/DeepSeek-V4.1-Flash-1017-GGUF (revisión `60ad3651641b5c97679c807e064ab1d7a3ca1455`)
- Variante Sakura Maya-S, origen de la carga Q3_K: https://huggingface.co/webmp3/Sakura-DeepSeek-V4.1-Flash-1017-Maya-S-IQ2_XXS-Engram-Q3_K-GGUF (revisión `4a701f59f623b08a859368926cd9a210ab446941`)
- Fork de llama.cpp con soporte del layout DeepSeek-4.1: https://github.com/danielhanchen/llama.cpp/tree/b72050d03ae14bb3cb5138ecefab3f3f65157d31
- PR de llama.cpp #30817: https://github.com/ggml-org/llama.cpp/pull/30817
- Guía de Unsloth para DeepSeek-V4.1 Flash: https://unsloth.ai/docs/models/deepseek-v4.1-flash
- Manifiesto de build: build-manifest.json (en el repositorio)
- Registro de compatibilidad: compatibility-check.json (en el repositorio)
