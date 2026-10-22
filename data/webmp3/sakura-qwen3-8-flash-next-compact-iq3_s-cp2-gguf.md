# webmp3/Sakura-Qwen3.8-Flash-Next-Compact-IQ3_S-CP2-GGUF

## Resumen

Sakura Qwen3.8 Flash-Next Compact IQ3_S CP2 es un reempaquetado comunitario y experimental, publicado por el usuario webmp3, de la cuantización IQ3_S generada por ISTA-DASLab (GSQ-RCO) sobre el modelo Qwen3.8-Flash-Next de Qwen. No es un modelo nuevo ni un fine-tune: el primer shard GGUF (los pesos del backbone, 54.817.524.224 bytes) se copia sin modificar, y solo se sustituye el segundo shard, la tabla de búsqueda N-Gram/PLE, por la tabla CP2 ya existente del proyecto Sakura K512. El resultado son dos ficheros GGUF de 68.257.589.408 bytes (63,570 GiB) que conservan los 512 expertos enrutados por capa del original, frente a los 83,618 GB del set de dos shards de origen, del que se eliminan unos 15,360 GB al reemplazar la tabla IQ4_NL.

El interés de la ficha es doble. Por un lado, documenta el modelo base Qwen3.8-Flash-Next, un MoE de 176.943.899.520 parámetros (dato real de safetensors) con arquitectura híbrida de atención GDN + QSA y 512 expertos enrutados, del que se anuncia una ventana de contexto de 262.144 tokens en fuentes de terceros. Por otro, documenta un experimento de empaquetado: la tabla CP2 es una representación derivada con pérdida de la tabla IQ4_NL original, y el autor advierte de forma explícita de que este paquete exacto **no se ha cargado para inferencia ni se ha probado en generación, perplejidad, calidad o velocidad**.

Es relevante ahora porque ejemplifica una tendencia práctica en el ecosistema abierto: la reducción agresiva del peso en disco de modelos de gran tamaño mediante cuantizaciones mixtas de ~3 bits y tablas de búsqueda comprimidas, a costa de depender de runtimes personalizados y de renunciar a las herramientas estándar (llama.cpp de serie, LM Studio, Ollama). Cualquier evaluación de este artefacto debe tratar sus cifras como estructurales, no como resultados de calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido con atención GDN + QSA, según el repositorio oficial de Qwen; 512 expertos enrutados por capa en el backbone original |
| Parámetros totales | 176.943.899.520 (unos 176,9 mil millones), dato real de safetensors del modelo base |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible en la model card; el blog de terceros OrcaRouter cita 262.144 tokens para Qwen3.8-Flash-Next; el runtime incluido arranca con 4.096 tokens |
| Tipos de cuantización | IQ3_S mixta (backbone ISTA-DASLab GSQ-RCO) más tabla de búsqueda CP2; no es un preset estándar de cuantización de modelo completo y no hay otros presets publicados |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 para los pesos (el runtime lleva MIT y avisos de terceros aparte) |
| Formato de pesos | GGUF en dos shards: 1.223 tensores de pesos y 1 tensor de tabla, 1.224 en total |

Datos adicionales verificables: repositorio de 68,3 GB; shard 1 de 51,053 GiB; shard 2 (tabla CP2) de 12,517 GiB; alias de endpoint `sakura-flash-next-iq3-s-cp2`; fecha de creación 2026-10-21; 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

El backbone es un modelo de mezcla de expertos con 512 expertos enrutados por capa y 176,9 mil millones de parámetros totales. Según el repositorio oficial de Qwen, Qwen3.8-Flash-Next introduce mejoras sistemáticas en atención, residual, embeddings y optimización, con una arquitectura de atención híbrida GDN + QSA. Sobre esa base, ISTA-DASLab aplicó una cuantización mixta IQ3_S con calibración imatrix (etiqueta `imatrix` presente en el repo), dando lugar a su GGUF GSQ-RCO. Este paquete no reentrena, no poda expertos y no modifica la tokenizador ni la plantilla de chat: los metadatos internos del shard principal, incluido el nombre del modelo de origen, permanecen intactos.

La única intervención de Sakura es el segundo shard: una tabla de búsqueda para los embeddings N-Gram/PLE, reutilizada del repack Sakura K512 CP2 (revisión `9b8fef370b812b3fd33787869d553793517245cb`). El autor documenta que esa tabla es un derivado con pérdida, no byte-idéntico al IQ4_NL de entrada, y que los hashes completos de ambos ficheros de origen se recomprobaron localmente el 2026-10-21. La verificación cubre integridad LFS, el contrato de dos shards (1.224 tensores), la dirección de la tabla y los metadatos crudos del tokenizador contra la referencia ISTA Q2; no cubre comportamiento en inferencia. No hay datos disponibles sobre volumen de tokens de entrenamiento, composición del dataset ni etapas de RLHF o DPO para el modelo base.

## Capacidades

- Generación de texto conversacional en formato chat, con la plantilla y el modo de razonamiento (thinking) por defecto del modelo original preservados en el runtime de arranque.
- Razonamiento multi-paso y generación de código: capacidades atribuidas a Qwen3.8-Flash-Next en el repositorio oficial y en proyectos de terceros como Strata, no verificadas para este paquete concreto.
- Servidor compatible con la API de OpenAI en `/v1/chat/completions`, con un único slot de servicio en la configuración incluida.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Capacidades de agente y uso con herramientas externas: no confirmado para este paquete; el proyecto Strata afirma integración con agentes de código para el modelo base.
- Multilingüe: no disponible; la model card no declara idiomas.
- Visión: deshabilitada explícitamente en el runtime de arranque incluido.
- Decodificación especulativa multi-token (MTP): deshabilitada en el runtime de arranque incluido.
- Caché de filas CP2 en GPU: deshabilitada en el arranque, con lecturas perezosas de tabla desde NVMe local.

## Casos de uso

- Evaluación de cuantizaciones de ~3 bits en MoE grandes: el paquete sirve para medir, en un entorno controlado, cuánta calidad se pierde al sustituir una tabla IQ4_NL por una tabla CP2 con pérdida sobre un backbone IQ3_S de 176,9 mil millones de parámetros, manteniendo los 512 expertos.
- Investigación sobre representaciones de embeddings N-Gram/PLE: comparar la tabla CP2 con la IQ4_NL original permite estudiar el impacto de la compresión de tablas de búsqueda en un modelo con vocabulario y tokenizador sin cambios.
- Despliegue local en Windows con GPU Vulkan: el paquete incluye `START.cmd` y un runtime Vulkan CP2 que expone un endpoint compatible con OpenAI en `http://127.0.0.1:18098`, útil para prototipos de chat en estación de trabajo sin depender de la nube.
- Pruebas de integración de clientes OpenAI: al publicar el alias `sakura-flash-next-iq3-s-cp2` sobre `/v1/chat/completions`, se puede apuntar un SDK de OpenAI a localhost y validar pipelines de aplicaciones sin coste de API.
- Reproducibilidad y auditoría de artefactos: los ficheros `SHA256SUMS`, `PROVENANCE.json` y `results.json` permiten verificar la cadena de custodia entre Qwen, ISTA-DASLab y Sakura, un caso práctico de procedencia para equipos que necesitan trazabilidad de pesos.
- Estudio de requisitos de memoria en configuraciones de dos shards: con 63,570 GiB de pesos y lecturas perezosas desde NVMe, el paquete es un banco de pruebas para medir el coste de mantener el shard principal en memoria frente a la tabla en disco.
- Docencia y experimentación con licencias: al conservar la Qwen Community License 1.0, sirve para ilustrar la diferencia entre licencia de pesos y licencia de software del runtime en un mismo artefacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que este paquete IQ3_S + CP2 no se ha cargado para inferencia ni probado en generación, perplejidad, calidad o velocidad, y que las puntuaciones previamente reportadas para Sakura Q2 o Gyro-M **no** son resultados de este paquete y no se importan aquí. Tampoco se reclama ningún resultado de encaje en memoria, memoria pico, contexto largo o rendimiento.

## Requisitos de hardware

- Tamaño en disco: 63,570 GiB (68.258 GB decimales) en dos ficheros GGUF. El shard de pesos son 51,053 GiB; la tabla CP2, 12,517 GiB.
- VRAM estimada para inferencia: no disponible. El autor no publica cifra de memoria pico ni reclama encaje en configuraciones AMD de 64 GB con memoria unificada. El shard principal debe residir en memoria gráfica o del sistema, y la tabla se lee de forma perezosa desde NVMe local.
- GPU recomendadas: no disponible; ninguna GPU está cualificada para este paquete. Como referencia de un proyecto distinto (Strata, con IQ3_S y 128K de contexto), se cita una RTX 5070, pero no es un resultado de este artefacto.
- Cabe en GPU de consumo: no confirmado. El tamaño de pesos supera la VRAM de cualquier GPU de consumo actual si se mantiene todo el shard principal en memoria gráfica; las lecturas perezosas de tabla mitigan parte del problema, no la totalidad.
- Almacenamiento: se requiere NVMe local para las lecturas perezosas de la tabla CP2, según la configuración de arranque propuesta.
- Opciones de despliegue: únicamente el runtime Vulkan CP2 incluido en el repositorio. Llama.cpp de serie, LM Studio, Ollama y forks no relacionados **no** están cualificados para esta tabla CP2 personalizada.
- Configuración de arranque incluida: un slot, contexto 4.096, caché KV en Q8, MTP, visión y caché de filas CP2 en GPU deshabilitados, plantilla de chat original y modo thinking por defecto.
- Latencia y throughput: no disponible; no se ha ejecutado el paquete.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tamaño de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sakura IQ3_S CP2 (este paquete) | 176,9 mil millones totales; activos no disponibles | 4.096 en el runtime incluido; 262.144 según fuente de terceros para el base | 63,570 GiB, dos shards | Qwen Community License 1.0 | Repo público, 0 descargas; sin probar |
| ISTA-DASLab Qwen3.8-Flash-Next GSQ-RCO (IQ3_S original) | 176,9 mil millones totales | no disponible | 83,618 GB, dos shards con tabla IQ4_NL | Qwen Community License 1.0 | Repo público; backbone del que deriva este paquete |
| Sakura Swift 3bit 352E | no disponible (352 de 512 expertos por capa) | no disponible | no disponible | no disponible | Repo público; variante con poda de expertos sobre el fine-tune Swift 1.5 |
| Sakura Swift DE-EN K352 IQ2_XS | no disponible (352 de 512 expertos, enrutado elegido sobre alemán e inglés) | no disponible | 53,08 GiB, dos shards | no disponible | Repo público; cuantización de ~2,5 bits |
| Qwen3.8-Flash-Next (original Qwen) | 176,9 mil millones totales | 262.144 según OrcaRouter | no disponible | Qwen Community License 1.0 (la etiqueta Apache de la card upstream no sustituye la licencia de pesos) | Repo oficial del modelo |

Diferencias clave: frente al IQ3_S de ISTA, este paquete ahorra unos 15,360 GB al cambiar la tabla, pero pierde la compatibilidad con runtimes estándar y la tabla pasa a ser un derivado con pérdida. Frente a las variantes Swift con poda de expertos, conserva los 512 expertos y no reentrena, pero no ofrece ninguna métrica de calidad que permita comparar la poda con la compresión de tabla.

## Limitaciones y advertencias

- Artefacto no probado: el autor declara que este paquete IQ3_S + CP2 exacto no se ha cargado para inferencia ni evaluado en generación, perplejidad, calidad o velocidad. La verificación es estructural (hashes, layout, direccionamiento, tokenizador), no funcional.
- Dependencia de runtime propietario de facto: solo el runtime Vulkan CP2 incluido está cualificado; llama.cpp de serie, LM Studio, Ollama y forks no relacionados no lo están. Esto limita portabilidad, soporte y actualizaciones de seguridad.
- Tabla con pérdida: la CP2 no es byte-idéntica a la IQ4_NL original; es un derivado lossy, por lo que la degradación de calidad respecto al IQ3_S de referencia es posible y no está cuantificada.
- Riesgo de alucinación: no evaluado para este paquete ni documentado por el autor. Al ser un modelo conversacional con modo thinking por defecto, debe asumirse el riesgo habitual de un modelo base sin evaluación publicada.
- Idiomas: la model card no declara idiomas soportados y no hay evaluación multilingüe. Las variantes hermanas con enrutado elegido sobre alemán e inglés no aportan garantías sobre este paquete.
- Contexto: el runtime de arranque fija 4.096 tokens, muy por debajo de los 262.144 que cita una fuente de terceros para el modelo base; usar contextos largos exigirá reconfigurar y validar memoria, algo que el autor no reclama.
- Restricciones de licencia: los pesos conservan la Qwen Community License 1.0, incluida en `LICENSE` y `LICENSE-QWEN`. Hay que leer sus condiciones completas antes de cualquier uso comercial; licencia del runtime (MIT y terceros) no relicencia los pesos. El autor no reclama autoría del backbone ni aval de Qwen o ISTA-DASLab.
- Falta de validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin informes independientes de funcionamiento.
- Discrepancias de cifras en fuentes de terceros: un proyecto (Strata) describe Qwen3.8-Flash-Next como modelo de 125 mil millones de parámetros, mientras que el recuento real de safetensors es de 176.943.899.520. No deben mezclarse cifras de hardware o rendimiento entre paquetes distintos.
- Cifras de memoria no extrapolables: el tamaño de fichero no equivale a uso de VRAM ni prueba de encaje en una máquina concreta; el propio autor señala que los ajustes pueden necesitar revisión según la memoria disponible.

## Enlaces

- Repositorio HuggingFace de este paquete: https://huggingface.co/webmp3/Sakura-Qwen3.8-Flash-Next-Compact-IQ3_S-CP2-GGUF
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Backbone cuantizado ISTA-DASLab GSQ-RCO: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF (revisión `ed59f92082b1e93c0e96d60a8b11aab089b52f09`)
- Tabla CP2 y runtime de origen, Sakura K512 CP2: https://huggingface.co/webmp3/Sakura-Qwen3.8-Flash-Next-Compact-47.6GiB-K512-CP2-v1-GGUF (revisión `9b8fef370b812b3fd33787869d553793517245cb`)
- Repositorio oficial de Qwen3.8-Flash-Next (arquitectura GDN + QSA): https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Proyecto Strata, ejecución de Qwen3.8-Flash-Next en hardware de consumo: https://github.com/Niko1221/Strata
- Artículo de OrcaRouter sobre Qwen3.8-Flash-Next (contexto de 262K y licencia): https://www.orcarouter.ai/blog/qwen-3-8-flash-next
- Variante hermana Sakura Swift 3bit 352E: https://huggingface.co/webmp3/Sakura-Qwen3.8-Flash-Next-Swift-3bit-352E-GGUF
- Variante hermana Sakura Swift DE-EN K352 IQ2_XS: https://huggingface.co/webmp3/Sakura-Qwen3.8-Flash-Next-Swift-DE-EN-K352-IQ2_XS-GGUF
