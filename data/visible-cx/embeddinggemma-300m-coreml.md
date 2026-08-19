# visible-cx/embeddinggemma-300m-CoreML

## Resumen

`visible-cx/embeddinggemma-300m-CoreML` es una conversión del modelo de embeddings `google/embeddinggemma-300m` al formato Core ML compilado (`.mlmodelc`), optimizada para ejecución en el Neural Engine (ANE) de Apple silicon. El proyecto Visible lo utiliza como su ruta de producción para generación de embeddings dentro de su aplicación, y publica esta copia con verificación independiente de reproducibilidad: el archivo de pesos `weight.bin` es byte a byte idéntico al generado por una reconstrucción desde la receta en Linux. El modelo base, EmbeddingGemma, es un encoder bidireccional de 308 millones de parámetros basado en Gemma 3, diseñado por Google para producir representaciones densas de texto (768 dimensiones) con soporte multilingüe y optimizado para dispositivos locales.

Esta versión Core ML fija una longitud de secuencia estática de 128 tokens, cuantiza los pesos a int8 y declara una residencia en ANE del 99,80 % (1950 de 1954 operaciones, según la afirmación del autor upstream). El artefacto incluye un `model_config.json` que especifica el contrato de pooling (media), capa densa y normalización L2 que el host debe implementar. Es un modelo pequeño (0,31 GB de pesos) que no impone requisitos significativos de memoria, pensado para ejecutarse en iPhone, iPad y Mac con Apple silicon. La relevancia actual radica en que ofrece una alternativa de embeddings on-device con calidad verificable y reproducibilidad total, algo poco común en el ecosistema Core ML.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional (encoder) basado en Gemma 3, con inicializacion T5Gemma |
| Parametros totales | 308 millones (300M segun la nomenclatura del modelo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (estatica, fijada en compilacion para esta conversion Core ML) |
| Tipos de cuantizacion | int8 (pesos) |
| Idiomas soportados | no disponible (el modelo base es multilingue, pero la conversion no especifica lista) |
| Licencia | Gemma (licencia propietaria de Google con restricciones de uso) |
| Formato de pesos | Core ML `.mlmodelc` compilado (con `weight.bin` en int8) |

## Arquitectura y entrenamiento

El modelo base `google/embeddinggemma-300m` es un encoder bidireccional de la familia Gemma 3, con inicializacion T5Gemma y un tamano de 308 millones de parametros. Produce embeddings de 768 dimensiones con norma unitaria, y soporta truncamiento Matryoshka a 512, 256 o 128 dimensiones. Google lo describe como optimizado para dispositivos cotidianos (moviles, portatiles, tabletas) y entrenado con las mismas tecnicas de investigacion usadas en los modelos Gemini. No se dispone en la informacion proporcionada de detalles sobre el dataset de entrenamiento, el numero de tokens ni el proceso de alineacion (RLHF, DPO, etc.).

La conversion Core ML, realizada por el proyecto Visible a partir de una receta de `john-rocky/CoreML-LLM`, compila el modelo con `--max-seq-len 128` y `--quantize int8`. El resultado es un `.mlmodelc` con pesos int8 y una secuencia estatica de 128 tokens. La verificacion de reproducibilidad confirma que el `weight.bin` generado en Linux (Debian 13, x86_64) es identico byte a byte al publicado, aunque los archivos `.mil`, `coremldata.bin` y `metadata.json` son productos de `xcrun coremlcompiler` (exclusivo de macOS) y no se regeneraron en el proceso de verificacion.

## Capacidades

- Generacion de embeddings de texto de 768 dimensiones con norma unitaria (L2 normalizado).
- Similitud semantica entre frases o documentos mediante producto escalar o distancia coseno.
- Recuperacion de informacion (retrieval) y busqueda semantica.
- Clasificacion de texto y clustering.
- Soporte multilingue (el modelo base lo declara, aunque esta conversion no detalla la lista de idiomas).
- Truncamiento Matryoshka: el modelo base permite reducir las dimensiones del embedding a 512, 256 o 128 sin perdida significativa de calidad (esta capacidad no se menciona explicitamente en la conversion Core ML, pero es inherente al modelo base).
- Ejecucion on-device en Apple silicon con alta residencia en ANE (99,80 % segun afirmacion upstream).
- No soporta tool calling, agentes ni generacion de texto autoregresiva; es exclusivamente un encoder para representaciones.

## Casos de uso

- Busqueda semantica local en aplicaciones iOS/macOS: el modelo puede indexar documentos, notas o mensajes y recuperar los mas relevantes por similitud coseno, sin conexion a internet, gracias a su ejecucion en el Neural Engine.
- Clasificacion de texto en el dispositivo: por ejemplo, categorizar correos, tickets de soporte o comentarios de usuarios en clases predefinidas, usando los embeddings como entrada a un clasificador ligero.
- Clustering de documentos para organizacion automatica: agrupar articulos, transcripciones o registros en temas, aprovechando la representacion densa de 768 dimensiones.
- Deduplicacion de contenido: detectar entradas duplicadas o casi duplicadas en bases de datos locales comparando embeddings, util en aplicaciones de gestion de contactos o bibliotecas.
- Recomendacion basada en contenido: calcular similitud entre items (productos, noticias, videos) a partir de sus descripciones textuales, todo en local para preservar privacidad.
- Sistemas RAG (retrieval-augmented generation) en el dispositivo: combinar este encoder con un LLM local en Apple silicon para construir pipelines de generacion aumentada por recuperacion sin depender de servicios en la nube, gracias a su baja huella de memoria (0,31 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad (como MTEB, MIRACL o similares) para esta conversion Core ML, ni mediciones de latencia o throughput. El unico dato de calidad registrado es una similitud coseno de aproximadamente 0,966 entre los embeddings producidos por esta ruta Core ML y la ruta LiteRT, medida el 2026-08-11 contra instalaciones anteriores (no contra los artefactos de este repositorio). La residencia en ANE del 99,80 % es una afirmacion del autor upstream, no verificada por Visible.

## Requisitos de hardware

- Requiere Apple silicon (chip M1 o posterior, o A-series en iPhone/iPad) con runtime Core ML.
- VRAM estimada: aproximadamente 0,31 GB para los pesos, mas overhead de ejecucion; no se especifica un valor exacto.
- GPU: no aplica; el modelo esta disenado para el Neural Engine (ANE), aunque Core ML puede ejecutarlo en CPU/GPU si es necesario.
- Cabe en cualquier dispositivo Apple silicon con al menos 1 GB de memoria disponible; no requiere hardware de gama alta.
- Opciones de despliegue: integracion directa en apps iOS/macOS mediante Core ML (`.mlmodelc` compilado). No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que esos entornos no ejecutan Core ML.
- Latencia y throughput: no publicados. La verificacion de reconstruccion se realizo en Linux, donde Core ML no puede ejecutarse, por lo que no se tomaron mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `visible-cx/embeddinggemma-300m-CoreML` | 308M | 128 tokens (estatico) | Core ML int8 | Gemma | HuggingFace, 0.3 GB |
| `google/embeddinggemma-300m` | 308M | 2048 tokens (segun documentacion oficial) | safetensors | Gemma | HuggingFace, ~1.2 GB |
| `valindotai/embeddinggemma-300m-coreml` | 308M | no especificado | Core ML (ANE-optimized) | Gemma | HuggingFace |

La comparacion directa entre la conversion de Visible y la de valindotai no es posible sin datos de rendimiento publicados. Ambas parten del mismo checkpoint base, pero la de Visible fija 128 tokens y cuantiza a int8, mientras que la de valindotai se dirige a iOS 26 / macOS 26 sin detalles adicionales. El modelo original de Google soporta secuencias mas largas (hasta 2048 tokens segun la documentacion oficial), pero esta conversion sacrifica esa capacidad por eficiencia on-device.

## Limitaciones y advertencias

- Longitud de secuencia fija en 128 tokens: cualquier entrada debe truncarse o rellenarse a esa longitud, lo que limita el procesamiento de textos largos (documentos completos, articulos extensos). No es un parametro configurable en runtime.
- Solo compatible con Apple silicon y Core ML: no puede ejecutarse en entornos Linux, Windows o GPUs de otras marcas, lo que restringe su uso a ecosistemas Apple.
- La calidad de los embeddings puede degradarse ligeramente respecto al modelo original por la cuantizacion int8 y la longitud reducida; el unico dato de calidad es un coseno de 0,966 frente a LiteRT, que no es una metrica de tarea final.
- La residencia en ANE del 99,80 % es una afirmacion del autor upstream no verificada por Visible; podria variar en dispositivos o versiones de sistema operativo concretos.
- La licencia Gemma impone restricciones de uso comercial y de redistribucion; es necesario revisar los terminos completos antes de desplegar en produccion.
- No se han publicado benchmarks de tareas (MTEB, MIRACL, etc.) para esta conversion, por lo que no hay evidencia cuantitativa de su rendimiento frente a alternativas.
- El artefacto `encoder.mlpackage` incluido como evidencia de reconstruccion no esta compilado y nunca se ha ejecutado; no debe usarse como artefacto de produccion.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/visible-cx/embeddinggemma-300m-CoreML
- Modelo base en HuggingFace: https://huggingface.co/google/embeddinggemma-300m
- Conversion Core ML alternativa (valindotai): https://huggingface.co/valindotai/embeddinggemma-300m-coreml
- Documentacion oficial de EmbeddingGemma: https://ai.google.dev/gemma/docs/embeddinggemma
- Model card oficial de EmbeddingGemma: https://ai.google.dev/gemma/docs/embeddinggemma/model_card
- Documentacion de la receta CoreML-LLM para EmbeddingGemma: https://github.com/anubis770/coreml-llm/blob/main/docs/EMBEDDINGGEMMA.md
