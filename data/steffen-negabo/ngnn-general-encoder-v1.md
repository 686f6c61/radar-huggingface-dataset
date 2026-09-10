# steffen-negabo/ngnn-general-encoder-v1

## Resumen

`steffen-negabo/ngnn-general-encoder-v1` es un compresor de embeddings fijo distribuido por el autor `steffen-negabo`. No es un modelo de pesos abiertos al uso: el componente local es una red neuronal compacta que toma vectores generados por la API de OpenAI `text-embedding-3-large` (3072 dimensiones), los normaliza y los comprime de forma independiente a 512 valores `float32`. La inferencia se ejecuta en CPU y el compresor es de código y pesos abiertos bajo licencia MIT, pero los pesos base de OpenAI no se distribuyen; el acceso a la API y sus términos son responsabilidad del usuario.

La motivación principal es reducir el coste de almacenamiento y ancho de banda de los vectores de alta dimensionalidad sin necesidad de reentrenar un modelo completo. El compresor tiene un tamaño de artefacto de 5 843 713 bytes y un diccionario de 3072 × 512. La salida final es un vector de 512 `float32` (2048 bytes por vector), frente a los 12 288 bytes del vector crudo de 3072D. El modelo fue evaluado en cuatro tareas de MTEB en inglés, con resultados inferiores tanto al vector completo como a la reducción de dimensionalidad nativa del proveedor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de compresion (NGNN) con seleccion top-256; no es un transformer generativo |
| Parametros totales | 5 843 713 bytes de artefacto; diccionario 3072 × 512 + 512 escalas; numero exacto de parametros no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8191 tokens `cl100k_base` por solicitud (limite impuesto por el encoder) |
| Tipos de cuantizacion | No disponible; los pesos locales se distribuyen en `float32` |
| Idiomas soportados | Ingles (`en`); el compresor se entreno sobre texto en ingles, el modelo base de OpenAI es multilingue aunque no se evaluo mas alla de tareas en ingles |
| Licencia | MIT |
| Formato de pesos | `model.npz` + `config.json` (via libreria `ngnn-encoder`); no es `safetensors` ni `GGUF` |

## Arquitectura y entrenamiento

El componente local es un compresor determinista y fijo. Recibe un vector de entrada de 3072 dimensiones (la salida normalizada de `text-embedding-3-large`), lo transforma mediante un diccionario de 3072 × 512 y selecciona las 256 activaciones mas altas (top-256 selection). Incluye 512 escalas unitarias por canal y no usa sesgo. La libreria `ngnn-encoder` descarga `config.json` y `model.npz` desde un commit inmutable de HuggingFace, verifica los SHA-256 de ambos y ejecuta la compresion en CPU con PyTorch 2.11.0 para preservar el comportamiento de los empates en la seleccion top-k.

El compresor fue ajustado sobre un subconjunto de calibracion del dataset FineWeb archivado. Los textos de evaluacion se usaron como entradas de exclusion, no como datos de ajuste. El uso de la API de OpenAI ocurre externamente en cada llamada a `encode`; no se distribuyen pesos base ni se permite el reentrenamiento con el algoritmo NGNN, cuyo optimizador y datos de entrenamiento no forman parte de esta publicacion. No se ha realizado RLHF ni DPO.

## Capacidades

- Genera embeddings comprimidos de 512 dimensiones a partir de texto arbitrario previamente no visto.
- Normaliza los vectores base de OpenAI antes de comprimir, manteniendo una salida lista para coseno.
- Ejecuta la compresion localmente en CPU, sin dependencias de GPU.
- Acepta entradas de hasta 8191 tokens `cl100k_base` por solicitud, con limites tanto por elemento como totales.
- Soporta tool calling? No. No hay funciones de agente, razonamiento multi-paso ni vision. Es un modulo de feature extraction.
- Capacidades multilingues: limitadas al ingles; el modelo base de OpenAI es multilingue, pero el compresor y su evaluacion solo cubren tareas en ingles.
- Funciona con MTEB para evaluacion de embeddings, aunque los resultados reportados son inferiores a las alternativas del proveedor.

## Casos de uso

- **Indexacion semantica eficiente para busqueda documental**: al comprimir los vectores de 3072D a 512D, se reduce el espacio de almacenamiento un 83% (de 12 288 a 2048 bytes por vector). Se usaria para indexar grandes colecciones de documentos en ingles, manteniendo una calidad aceptable en tareas de recuperacion como SciFact o NFCorpus, aunque con penalizacion de rendimiento.
- **Clasificacion de textos en entornos con poca memoria**: el compresor local pesa menos de 6 MB y se ejecuta en CPU, ideal para despliegues en servidores sin GPU. Podria integrarse en pipelines de clasificacion tipo Banking77, donde la accuracy alcanza 0.8326, sacrificando algo de precision respecto al vector completo.
- **Sistemas de recomendacion de contenidos**: la salida de 512 dimensiones permite calcular similitudes coseno rapidamente en servicios de recomendacion de noticias o articulos, con coste de almacenamiento bajo y sin necesidad de llamadas adicionales a la API para vectores derivados.
- **Evaluacion de modelos de embeddings en MTEB**: el modelo esta disenado para ser comparado en tareas de evaluacion. Los repositorios de resultados y manifestos estan publicados, facilitando su uso como baseline de compresion.
- **Prototipado rapido sin entrenamiento**: investigadores que necesitan probar reduccion de dimensionalidad sin reentrenar un modelo pueden usar esta implementacion como referencia. La libreria `ngnn-encoder` permite reproducir exactamente la compresion via un commit fijo.
- **Copias de seguridad y transferencia de embeddings**: al comprimir los vectores, se reduce el ancho de banda al enviar representaciones de documentos entre servicios, manteniendo compatibilidad con el ecosistema de OpenAI si se conserva el alias del proveedor.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card, evaluados con MTEB 2.20.10 en septiembre de 2026. Se comparan tres variantes: NGNN 512D (este modelo), vector crudo de 3072D y reduccion nativa del proveedor a 512D.

| Tarea / metrica principal | NGNN 512D | Raw 3072D | Provider-native 512D |
|---|---|---|---|
| SciFact / nDCG@10 | 0.635170 | 0.777120 | 0.750040 |
| STSBenchmark / cosine Spearman | 0.824895 | 0.835725 | 0.828178 |
| Banking77Classification.v2 / accuracy | 0.832575 | 0.858257 | 0.845579 |
| NFCorpus / nDCG@10 | 0.311920 | 0.421090 | 0.398100 |

El modelo NGNN obtiene puntuaciones inferiores a los dos controles en las cuatro tareas. Ambos variantes de 512D usan 2048 bytes por vector, frente a los 12 288 bytes del vector crudo. El autor indica que estas mediciones no muestran ventaja sobre la reduccion nativa del proveedor. Ademas, las respuestas de los controles se obtuvieron en momentos distintos bajo el alias del proveedor, por lo que la comparativa puede verse afectada por cambios en el modelo base. No hay resultados globales de MTEB ni de tareas multilingues.

## Requisitos de hardware

- **VRAM estimada**: no requiere VRAM. La compresion se ejecuta en CPU con PyTorch 2.11.0.
- **GPU recomendadas**: no aplica. Para usar el modelo, solo se necesita una CPU y acceso a la API de OpenAI.
- **Capacidad en GPU de consumo**: este modelo en si no cabe en GPU porque no se ejecuta en ella; el unico componente que requiere GPU seria el modelo base de OpenAI, que se llama via API remota.
- **Opciones de despliegue**: exclusivamente a traves de la libreria `ngnn-encoder` instalada desde el wheel publicado en GitHub. No es compatible con vLLM, llama.cpp, Ollama ni TGI, al ser un compresor especifico y no un modelo de lenguaje.
- **Latencia y throughput**: no disponibles en la informacion. La latencia agregada incluye la llamada a la API de OpenAI (red) mas la compresion local en CPU; el autor no publica cifras.

## Comparativa con modelos similares

No existe una categoria amplia de compresores de embeddings equivalentes. Se compara con el propio modelo base y con la reduccion nativa del proveedor, asi como con alternativas genericas de embeddings de tamano similar:

| Modelo | Dimension de salida | Peso total | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NGNN general encoder v1 | 512 (comprimido) | ~5.8 MB (compresor local) | 8191 tokens | MIT (compresor) | HuggingFace + libreria `ngnn-encoder` |
| OpenAI text-embedding-3-large | 3072 (o reducible a 512) | No distribuido | 8191 tokens | Terminos de OpenAI (no MIT) | Solo via API |
| BAAI/bge-large-en-v1.5 | 1024 | ~1.3 GB | 512 tokens | MIT | HuggingFace, pesos completos |
| sentence-transformers/all-MiniLM-L6-v2 | 384 | ~80 MB | 256 tokens | Apache-2.0 | HuggingFace, pesos completos |

El NGNN no compite en rendimiento con modelos de pesos completos como `bge-large-en-v1.5`; su ventaja es la compresion de vectores ya generados por OpenAI sin reentrenar. La comparativa mas directa es contra la reduccion nativa del proveedor (`text-embedding-3-large` con dimensiones reducidas), donde el modelo obtiene resultados peores en las tareas evaluadas.

## Limitaciones y advertencias

- **Dependencia del proveedor**: el modelo base es externo y no esta congelado. Cambios en el alias de OpenAI pueden alterar los embeddings de entrada y, por tanto, la salida del compresor.
- **Rendimiento inferior**: en las cuatro tareas evaluadas, NGNN 512D puntua por debajo tanto del vector crudo como de la reduccion nativa del proveedor. No se recomienda si la precision es critica.
- **Solo tareas en ingles**: la evaluacion cubre cuatro tareas de MTEB en ingles. No se ha demostrado rendimiento multilingue ni general.
- **Sin soporte para tareas generativas**: no es un modelo de lenguaje, no genera texto, no razona ni responde preguntas. Es exclusivamente un extraector de caracteristicas.
- **Coste de API**: cada llamada a `encode` realiza una solicitud facturable a OpenAI. El uso en produccion requiere gestion de claves, limites de tasa y control de costes.
- **Restricciones de credenciales**: la libreria advierte de no pasar la clave de API via kwargs del modelo, ya que MTEB serializa esos argumentos en metadatos de experimentos, lo que podria filtrar secretos.
- **Licencia parcialmente abierta**: el compresor es MIT, pero los pesos del modelo base no se distribuyen y quedan sujetos a los terminos de OpenAI. No es un modelo completamente de codigo abierto.
- **No hay garantia de actualizacion**: el repositorio es un artefacto de distribucion. La revision canonica de MTEB es distinta de la revision del Hub; el autor avisa de que publicar el artefacto no establece aceptacion oficial en MTEB.

## Enlaces

- HuggingFace: https://huggingface.co/steffen-negabo/ngnn-general-encoder-v1
- Repositorio de inferencia y evidencia: https://github.com/steffen181/frozen-ngnn-api-modesl
- Pesos originales: https://github.com/steffen181/frozen-ngnn-api-modesl/blob/83773ff1ad83accc729c8d748d6991077842fbc0/model.npz
- Mapa de revisiones: https://github.com/steffen181/frozen-ngnn-api-modesl/blob/38f5831b1d4ff519a606894e621ee0aca80193a5/verification/revision_alias.json
- Manifiesto de evaluacion y resultados: https://github.com/steffen181/frozen-ngnn-api-modesl/blob/38f5831b1d4ff519a606894e621ee0aca80193a5/evaluation/2026-09-06/summary.json
- PR de implementacion en MTEB: https://github.com/embeddings-benchmark/mteb/pull/5400
- PR de resultados en MTEB: https://github.com/embeddings-benchmark/results/pull/702
