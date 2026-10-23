# webmp3/Sakura-DeepSeek-V4.1-Flash-1017-Overview

## Resumen

Sakura DeepSeek-V4.1-Flash-1017 (Overview) es un repositorio catálogo publicado por el usuario webmp3 que reúne once paquetes GGUF derivados del modelo upstream DeepSeek-V4.1-Flash. No se trata de un modelo nuevo: el autor copia los archivos del backbone upstream con identidad SHA-256 de LFS idéntica, conserva todas las filas de expertos y añade las tablas Engram completas en cuantización Q3_K. No hay poda, reentrenamiento ni recuantización del backbone.

El interés práctico está en el empaquetado: cada variante reduce el tamaño en disco respecto al paquete upstream equivalente (entre 26,113 GB y 118,276 GB de ahorro según el nivel de cuantización), manteniendo intacto el backbone. El payload de lookup compartido son 768.022.850 filas × 256 valores a 110 bytes por fila, es decir, 84.482.513.500 bytes antes de las cabeceras GGUF. El paquete safetensors original ocupa aproximadamente 510,297 GB en disco, lo que sitúa al modelo en la categoría de gran escala, aunque el autor no publica el recuento de parámetros ni la longitud de contexto.

La advertencia central es explícita: no se ha realizado ninguna prueba de inferencia completa sobre estos paquetes modificados. Las verificaciones cubren integridad, disposición de archivos, direccionamiento y rutas de decodificación aisladas, pero no hay puntuaciones de calidad de generación, perplejidad, velocidad ni encaje en hardware para estas publicaciones. Cualquier uso en producción debe partir de una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Se reutiliza el backbone upstream DeepSeek-V4.1-Flash sin modificaciones y el autor no detalla su arquitectura; el empaquetado añade tablas de lookup Engram |
| Parametros totales | No disponible |
| Parametros activos | No disponible (la informacion proporcionada no confirma que el backbone sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF: IQ1_S, IQ1_M, IQ2_XXS, Q2_K_XL, IQ3_XXS, IQ3_S, Q3_K_XL, Q4_K_XL y Q8_K_XL (variantes Unsloth); IQ1_S e IQ2_XXS (variantes Maya). Las tablas Engram van siempre en Q3_K |
| Idiomas soportados | en, zh (declarados en los metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | GGUF (5 a 9 archivos principales por variante); el checkpoint upstream se distribuye en safetensors, ~510,297 GB |

## Arquitectura y entrenamiento

El paquete no entrena ni modifica el backbone: copia los archivos upstream con tamanos idénticos y SHA-256 de LFS coincidente, conserva todas las filas de expertos y de Engram, y sustituye o completa las tablas de lookup con datos completos en Q3_K. La cuantización Q3_K se aplica exclusivamente a las tablas, no al backbone. El payload compartido de lookup son 768.022.850 filas × 256 valores con 110 bytes por fila: 84.482.513.500 bytes antes de las cabeceras GGUF.

Hay dos linajes de empaquetado con contratos distintos. Las variantes Maya usan archivos de tabla separados para las capas 1 y 14; las variantes Unsloth usan una tabla combinada. El autor advierte que reutilizar el mismo payload no hace intercambiables los archivos completos, porque las cabeceras y los contratos de runtime difieren. La verificación aplicada a cada paquete enlazado cubre tamanos y SHA-256 de los archivos principales, las cabeceras reales de las tablas y 192 filas Q3 reales en ambas capas; los repaquetados de cabecera comprueban el hash de entrada Q3 existente y el de salida. No se publica informacion sobre datos de entrenamiento, número de tokens, composicion del dataset ni etapas de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento: heredados del backbone upstream, sin evaluacion publicada por parte del empaquetador.
- Idiomas: ingles y chino declarados en los metadatos; no se documentan otros idiomas.
- Recuperacion mediante tablas Engram: el paquete incluye el lookup completo en Q3_K, con direccionamiento verificado a nivel de fila.
- Compatibilidad con llama.cpp: las variantes Unsloth requieren la rama DeepSeek-4.1 fijada en cada model card; las variantes Maya requieren la revision exacta de Project Maya y su parche de codigo, y la ruta Maya-XS necesita el soporte de backbone IQ1 de la version v1.1.22.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision: los paquetes upstream referencian archivos opcionales de vision/proyector, pero quedan fuera de los totales publicados y no se han verificado en estas variantes.
- Decodificacion especulativa: se mencionan archivos DSpark/drafter en los paquetes referenciados, tambien fuera de los totales y sin verificar.
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Comparativa controlada de cuantizaciones: al ser el backbone identico byte a byte (SHA-256 de LFS coincidente) y cambiar solo el nivel de cuantizacion y las tablas Q3_K, las once variantes permiten medir perplejidad y latencia propias aislando el efecto de la cuantizacion sobre un mismo modelo base.
- Despliegue local en servidores de gran memoria con llama.cpp: los niveles IQ1_S e IQ2_XXS dejan los archivos principales entre 199,824 GB y 262,676 GB, utiles cuando el limite es el espacio en disco y se dispone de RAM o VRAM agregada suficiente.
- Investigacion sobre tablas de lookup tipo Engram: el payload de 84,48 GB con 768 millones de filas × 256 valores permite estudiar recuperacion por tabla frente a parametros densos y analizar el coste de almacenamiento por fila.
- Auditoria y replicacion de artefactos: cada variante esta fijada a una revision concreta de model card (hashes como `7767a09857026f848981878768844e0ab3319da3` o `44760773565d3ecaf50dcd1ccb2a7f6e6f0df9c4`) y verificada por tamano y SHA-256, lo que facilita espejar descargas en pipelines internos y comprobar integridad tras la transferencia.
- Generacion de texto offline en ingles y chino: escenarios sin conectividad donde se requiera un modelo de gran escala ejecutado sobre llama.cpp con la rama fijada, aceptando que la calidad de generacion no esta avalada por el empaquetador.
- Estudio de compatibilidad de formatos GGUF: los contratos de cabecera distintos entre Maya (tablas separadas por capa) y Unsloth (tabla combinada) sirven para probar herramientas de repaquetado y validacion de cabeceras.
- Pruebas de decodificacion especulativa: los archivos drafter referenciados en los paquetes upstream, aunque fuera de los totales, permiten experimentar con un modelo grande como verificador, asumiendo que no han sido verificados en estas variantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no existen puntuaciones de calidad de generacion, perplejidad, velocidad ni encaje en hardware para estas publicaciones, y que no se ha ejecutado ninguna prueba de inferencia completa sobre los paquetes modificados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El autor advierte de forma explicita que el tamano en disco no equivale al consumo de memoria.
- Huella en disco de los archivos principales por variante (GB = 10^9 bytes): Maya-XS-IQ1_S 199,824; UD-IQ1_S 206,867; UD-IQ1_M 224,292; UD-IQ2_XXS 249,786; Maya-S-IQ2_XXS 262,676; UD-Q2_K_XL 284,104; UD-IQ3_XXS 317,934; UD-IQ3_S 346,829; UD-Q3_K_XL 366,793; UD-Q4_K_XL 382,432; UD-Q8_K_XL 390,101.
- Los totales excluyen archivos opcionales de vision/proyector, DSpark/drafter, imatrix y runtime, de modo que el espacio real necesario en disco es superior al de la tabla.
- GPU recomendadas: no disponible. No hay datos de encaje en A100, H100 ni RTX 4090, y el volumen de los archivos principales (desde ~200 GB) descarta por si solo un unico acelerador consumer.
- GPU consumer: no cabe en ninguna GPU consumer actual segun los tamanos publicados; requeriria agregacion de memoria o volcado a CPU.
- Opciones de despliegue: llama.cpp exclusivamente, con dos rutas. Variantes Unsloth: rama DeepSeek-4.1 fijada en cada model card; los runtimes estandar no estan cualificados. Variantes Maya: revision exacta de Project Maya mas el parche de codigo de la model card, y v1.1.22 para el soporte IQ1 del backbone en Maya-XS. No se documenta soporte para vLLM, TGI, Ollama ni otros motores.
- Latencia y throughput: no disponible. La paridad en CPU y la compilacion en CUDA no constituyen una prueba de inferencia en GPU ni en Windows/AMD, segun el autor.

## Comparativa con modelos similares

No es posible comparar con modelos externos: se desconoce el numero de parametros, la longitud de contexto y el rendimiento del backbone, y no hay benchmarks publicados. La comparacion disponible es interna, entre cada paquete Sakura y su upstream de referencia.

| Variante Sakura | Upstream equivalente (GB) | Backbone sin cambios (GB) | Archivos principales Sakura (GB) | Ahorro (GB) |
|---|---:|---:|---:|---:|
| Maya-XS-IQ1_S | 276,626 | 115,342 | 199,824 | 76,802 |
| UD-IQ1_S | 232,980 | 122,384 | 206,867 | 26,113 |
| UD-IQ1_M | 250,404 | 139,809 | 224,292 | 26,113 |
| UD-IQ2_XXS | 300,475 | 165,303 | 249,786 | 50,690 |
| Maya-S-IQ2_XXS | 339,478 | 178,193 | 262,676 | 76,802 |
| UD-Q2_K_XL | 334,794 | 199,622 | 284,104 | 50,690 |
| UD-IQ3_XXS | 394,737 | 233,452 | 317,934 | 76,802 |
| UD-IQ3_S | 423,631 | 262,346 | 346,829 | 76,802 |
| UD-Q3_K_XL | 485,069 | 282,311 | 366,793 | 118,276 |
| UD-Q4_K_XL | 500,708 | 297,950 | 382,432 | 118,276 |
| UD-Q8_K_XL | 508,377 | 305,619 | 390,101 | 118,276 |

El propio autor advierte que una fila mas pequena no es prueba de mejor calidad; el ahorro procede del empaquetado, no de una mejora del modelo.

## Limitaciones y advertencias

- Ausencia total de validacion de inferencia: no se ha ejecutado ninguna prueba completa sobre los paquetes modificados y no existen datos de calidad, perplejidad, velocidad ni encaje en hardware.
- Las verificaciones realizadas son de integridad y estructura (tamanos y SHA-256, cabeceras de tabla, 192 filas Q3 por capa), no de comportamiento del modelo.
- El tamano en disco no es consumo de memoria: planificar el despliegue contando solo con los GB de los archivos principales llevara a infravalorar los requisitos.
- Dependencia estricta de runtimes: las variantes Unsloth exigen la rama DeepSeek-4.1 fijada y las Maya la revision concreta de Project Maya con su parche. Los runtimes estandar no estan cualificados y pueden fallar.
- Los archivos no son intercambiables entre linajes aunque compartan payload de lookup, porque las cabeceras y los contratos de runtime difieren.
- Cobertura de idiomas limitada a ingles y chino segun los metadatos; no hay evaluacion de calidad en ninguno de los dos.
- Los archivos opcionales de vision/proyector y drafter quedan fuera de los totales publicados y no estan verificados, por lo que no deben asumirse funcionales.
- Licencia del empaquetado MIT, pero la informacion disponible no incluye la licencia del modelo upstream (la referencia aparece truncada en la model card), que debe consultarse antes de cualquier uso comercial.
- Riesgo de sesgos y alucinacion: no disponible; no se han publicado evaluaciones al respecto para estas variantes.
- Repositorio sin descargas ni valoraciones en el momento de la consulta, lo que reduce la base de validacion por parte de terceros.

## Enlaces

- Repositorio catalogo: https://huggingface.co/webmp3/Sakura-DeepSeek-V4.1-Flash-1017-Overview
- Maya-XS-IQ1_S: https://huggingface.co/webmp3/Sakura-DeepSeek-V4.1-Flash-1017-Maya-XS-Engram-Q3_K-GGUF
- UD-IQ1_S: https://huggingface.co/webmp3/Sakura-DeepSeek-V4.1-Flash-1017-Unsloth-UD-IQ1_S-Engram-Q3_K-GGUF
- UD-IQ1_M: https://huggingface.co/webmp3/Sakura-DeepSeek-V4.1-Flash-1017-Unsloth-UD-IQ1_M-Engram-Q3_K-GGUF
- UD-IQ2_XXS: https://huggingface.co/webmp3/Sakura-DeepSeek-V4.1-Flash-1017-Unsloth-UD-IQ2_XXS-Engram-Q3_K-GGUF
- Maya-S-IQ2_XXS: https://huggingface.co/webmp3/Sakura-DeepSeek-V4.1-Flash-1017-Maya-S-IQ2_XXS-Engram-Q3_K-GGUF
- UD-Q2_K_XL: https://huggingface.co/webmp3/Sakura-DeepSeek-V4.1-Flash-1017-Unsloth-UD-Q2_K_XL-Engram-Q3_K-GGUF
- UD-IQ3_XXS: https://huggingface.co/webmp3/Sakura-DeepSeek-V4.1-Flash-1017-Unsloth-UD-IQ3_XXS-Engram-Q3_K-GGUF
- UD-IQ3_S: https://huggingface.co/webmp3/Sakura-DeepSeek-V4.1-Flash-1017-Unsloth-UD-IQ3_S-Engram-Q3_K-GGUF
- UD-Q3_K_XL: https://huggingface.co/webmp3/Sakura-DeepSeek-V4.1-Flash-1017-Unsloth-UD-Q3_K_XL-Engram-Q3_K-GGUF
- UD-Q4_K_XL: https://huggingface.co/webmp3/Sakura-DeepSeek-V4.1-Flash-1017-Unsloth-UD-Q4_K_XL-Engram-Q3_K-GGUF
- UD-Q8_K_XL: https://huggingface.co/webmp3/Sakura-DeepSeek-V4.1-Flash-1017-Unsloth-UD-Q8_K_XL-Engram-Q3_K-GGUF
- Modelo upstream: la referencia aparece truncada en la model card como "deepseek-ai/DeepSee..."; no se dispone del enlace completo en la informacion proporcionada.
