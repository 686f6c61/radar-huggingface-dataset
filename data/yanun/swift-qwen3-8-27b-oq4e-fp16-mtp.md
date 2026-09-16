# Yanun/Swift-Qwen3.8-27b-oQ4e-fp16-mtp

## Resumen

Swift-Qwen3.8-27b-oQ4e-fp16-mtp es una conversion al formato MLX de un modelo multimodal denso de clase 27B, publicada por el usuario Yanun a partir del modelo base ukisai/Swift-Qwen3.8-27b. El checkpoint combina un backbone de texto de 64 capas, un codificador de vision de 27 capas y una capa adicional de prediccion multi-token (MTP), todo empaquetado en safetensors con cuantizacion mixta oQ4e. El resultado es un modelo de vision-lenguaje que se ejecuta localmente en hardware Apple Silicon mediante la libreria MLX.

Su relevancia practica esta en dos ejes. Por un lado, la ventana de contexto configurada de 262.144 tokens, poco habitual en modelos que caben en un equipo de sobremesa. Por otro, la capa MTP, pensada para decodificacion especulativa y por tanto para reducir la latencia de generacion sin cambiar el modelo base. La cuantizacion mixta (4 bits por defecto, con 187 modulos elevados a 5 bits y la capa MTP parcialmente en FP16) intenta conservar precision en las matrices mas sensibles.

El repositorio tiene 663 descargas y 10 likes en el momento de la consulta, y su licencia no es estandar (swift-open-license-1.0, etiquetada como "other"), por lo que conviene revisar las condiciones del modelo original antes de cualquier uso en produccion. No se han publicado resultados de benchmarks ni detalles del entrenamiento en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal, con atencion hibrida: 48 capas de atencion lineal y 16 de atencion completa (una cada cuatro capas) |
| Parametros totales | 27.781.427.952 (~27,78 B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 262.144 tokens configurados; la longitud usable depende de la configuracion del runtime y de la memoria disponible |
| Tipos de cuantizacion | oQ4e (mixta): 4-bit affine por defecto con 64 valores por grupo; 187 modulos con override explicito a 5 bits; matrices de atencion y feed-forward de la capa MTP en 4 bits; matriz de fusion MTP (mtp.fc) y pesos de normalizacion en FP16; escalas y offsets de la MTP en FP16 |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (etiqueta "other"); condiciones en el modelo de origen |
| Formato de pesos | safetensors en formato MLX (library_name: mlx) |
| Tamano del repositorio | 17,9 GB |
| Capas del backbone de texto | 64; hidden size 5.120; feed-forward 17.408 |
| Atencion completa | 24 cabezas de consulta, 4 cabezas clave/valor, dimension de cabeza 256 |
| Vocabulario | 248.320 tokens |
| Codificador de vision | 27 capas; hidden size 1.152; 16 cabezas de atencion; parches de 16 x 16; proyeccion a la dimension de texto de 5.120 |
| Pipeline declarado | image-text-to-text |
| Revision de origen | 54e66d6c81439bd4fda5ef9a690fa571e3b0d272 |
| Fecha de creacion (metadatos HF) | 2026-09-13 |

## Arquitectura y entrenamiento

El modelo es un transformer denso con un esquema de atencion hibrida poco comun: de las 64 capas del backbone de texto, 48 usan atencion lineal y solo 16 emplean atencion completa, insertada cada cuatro capas. Las capas de atencion completa trabajan con 24 cabezas de consulta y 4 cabezas clave/valor (GQA) de dimension 256. Este diseno busca reducir el coste del cache KV en contextos largos manteniendo un numero limitado de capas de atencion global que preserven la calidad de recuperacion a larga distancia. El vocabulario es grande, de 248.320 tokens.

A ese backbone se le anade un codificador de vision de 27 capas (hidden size 1.152, 16 cabezas, parches de 16 x 16) cuyas caracteristicas se proyectan a la dimension oculta del texto (5.120), y una unica capa de prediccion multi-token con sus propias proyecciones de atencion y feed-forward. La MTP se usa habitualmente para decodificacion especulativa: el modelo predice varios tokens por paso y un verificador los valida, lo que puede aumentar el throughput efectivo.

Sobre el entrenamiento no hay informacion en el material proporcionado: no se indican numero de tokens, composicion del dataset, fases de ajuste (SFT, RLHF, DPO) ni detalles del alineamiento. Tampoco se documenta si la cuantizacion oQ4e se calibro con un conjunto de datos concreto. La model card unicamente describe la estructura del checkpoint y su relacion con el modelo de origen.

## Capacidades

- Generacion de texto conversacional, con pipeline declarado como conversational.
- Procesamiento de imagenes y texto combinados (image-text-to-text): entrada de imagenes con parches de 16 x 16 y salida en lenguaje natural.
- Contexto largo: hasta 262.144 tokens configurados, adecuado para documentos extensos o repositorios de codigo.
- Decodificacion especulativa mediante la capa MTP incluida en el checkpoint.
- Razonamiento multi-turno dentro de una misma conversacion, limitado por la ventana de contexto efectiva del runtime.
- Capacidades multilingues: no acreditadas en la informacion disponible, pese al vocabulario de 248.320 tokens.
- Tool calling y function calling: no documentados en la informacion disponible.
- Uso como agente con razonamiento multi-paso: no documentado.
- Modo thinking explicito, audio u otras modalidades: no documentados.

## Casos de uso

- Analisis de documentacion tecnica escaneada: el modelo puede recibir capturas de diagramas de arquitectura, tablas o planos junto con el texto que las acompana y generar resumenes o extraer campos concretos, aprovechando el codificador de vision y la ventana de 262.144 tokens para procesar el documento completo sin trocearlo.
- Asistente de programacion con contexto de repositorio: con 262.144 tokens configurados se pueden inyectar varios ficheros fuente y mantener una conversacion de refactorizacion; la atencion lineal en 48 de las 64 capas reduce el crecimiento del cache KV respecto a un transformer completamente denso en atencion completa.
- Ingesta documental por lotes en local: en un Mac Studio o un MacBook Pro con memoria unificada alta, el checkpoint de 17,9 GB permite procesar lotes de facturas, contratos o informes con imagenes adjuntas sin enviar datos a servicios externos, lo que encaja en flujos con requisitos de confidencialidad.
- Atencion al cliente de varios turnos: conversaciones largas con historial extenso e imagenes de producto o capturas de error aportadas por el usuario, usando la ventana ampliada para no perder el contexto inicial de la incidencia.
- Extraccion estructurada de informacion visual: conversion de capturas de pantalla, recibos o formularios a JSON u otro esquema fijo, como paso previo a un pipeline de datos.
- Servicio de inferencia de baja latencia en Apple Silicon: la capa MTP habilita decodificacion especulativa, util en asistentes interactivos donde el tiempo hasta el primer token y la velocidad de generacion son criticos.
- Investigacion sobre atencion hibrida y MTP: al ser un checkpoint cuantizado con la capa MTP en parte FP16 y en parte 4 bits, sirve para experimentar con tecnicas de decodificacion especulativa y medir el impacto de la precision mixta en la tasa de aceptacion de tokens.
- Descripcion de imagenes para accesibilidad: generacion de texto alternativo detallado a partir de imagenes, ejecutable sin conexion en equipos de sobremesa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MMMU ni ninguna otra metrica, y la busqueda web realizada no devolvio resultados relevantes sobre este modelo.

## Requisitos de hardware

- VRAM o memoria unificada para los pesos: el repositorio ocupa 17,9 GB, de modo que la carga del checkpoint requiere del orden de 18 GB solo para los pesos. Es una cifra estimada a partir del tamano del repositorio, no un dato publicado.
- Cache KV estimado: las 16 capas de atencion completa usan 4 cabezas KV de dimension 256, lo que supone unos 64 KiB por token en FP16. A 32.000 tokens de contexto serian aproximadamente 2 GB, y a 262.144 tokens, alrededor de 16 GB. Calculo orientativo derivado de la configuracion declarada, no una medicion.
- Memoria recomendada: al menos 32 GB de memoria unificada para contextos moderados; 64 GB o mas para contextos de decenas de miles de tokens; 128 GB o mas si se pretende acercarse al limite de 262.144 tokens.
- GPU compatibles: el formato es MLX, especifico de Apple Silicon. No se documenta soporte para CUDA ni para GPUs NVIDIA (A100, H100, RTX 4090) con estos pesos. No disponible para esas plataformas sin conversion previa.
- Cabe en hardware de consumo: si, en equipos Mac con chip de la serie M y memoria unificada suficiente (por ejemplo, MacBook Pro o Mac Studio con 32 GB o mas). No en GPUs de consumo con 8-16 GB de VRAM, al no existir pesos en formato compatible.
- Opciones de despliegue: la libreria declarada es mlx, por lo que el despliegue esperado es a traves del ecosistema MLX para Apple Silicon (mlx-lm o mlx-vlm, dado el pipeline image-text-to-text). No se documenta soporte para vLLM, llama.cpp, TGI, Ollama ni TensorRT-LLM en la informacion disponible.
- Latencia y throughput: no disponible. La capa MTP esta disenada para decodificacion especulativa y por tanto para mejorar la velocidad de generacion, pero no se publican mediciones.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con el modelo de origen. La busqueda web no devolvio datos sobre alternativas de la misma categoria.

| Modelo | Parametros | Contexto | Formato | Licencia | Precision |
|---|---|---|---|---|---|
| Yanun/Swift-Qwen3.8-27b-oQ4e-fp16-mtp | 27,78 B | 262.144 tokens | MLX safetensors | swift-open-license-1.0 | oQ4e mixta (4-bit con 187 modulos a 5 bits y MTP en FP16 parcial) |
| ukisai/Swift-Qwen3.8-27b (modelo base) | 27 B clase densa | no disponible | no disponible | swift-open-license-1.0 | no disponible |

No se dispone de datos de rendimiento, contexto o licencia de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no estandar: la etiqueta es "other" con nombre swift-open-license-1.0. Las condiciones de uso comercial no estan detalladas en la informacion disponible y remiten a la pagina del modelo de origen; hay que revisarlas antes de cualquier despliegue productivo.
- Sin datos de entrenamiento: no se documentan tokens, composicion del dataset, fases de alineamiento ni ajuste de seguridad, lo que impide evaluar sesgos de forma sistematica.
- Sin evaluaciones publicadas: no hay benchmarks ni evaluaciones de seguridad, de modo que el comportamiento real en tareas concretas es desconocido.
- Riesgo de alucinacion: inherente a los modelos generativos; se agrava al no existir evaluaciones que cuantifiquen la tasa de error en dominios factuales.
- Idiomas no declarados: no hay lista de idiomas soportados. El vocabulario de 248.320 tokens sugiere cobertura amplia, pero el rendimiento multilingue no esta acreditado.
- Cuantizacion con perdida: los pesos estan en 4 bits con parte de los modulos en 5 bits. La calidad puede ser inferior a la del modelo base sin cuantizar; no se publica una comparacion entre ambas versiones.
- La capa MTP no esta integramente en FP16: solo la matriz de fusion y las normalizaciones conservan esa precision. El sufijo "fp16" del nombre no implica que el modelo completo ni la MTP esten en FP16.
- Contexto efectivo menor que el configurado: los 262.144 tokens son un limite de configuracion; la longitud util depende del runtime y de la memoria disponible, y el cache KV crece de forma apreciable en contextos largos.
- Dependencia de plataforma: los pesos en MLX solo se ejecutan de forma nativa en Apple Silicon. Migrar a CUDA exige una conversion no documentada.
- Adopcion limitada: 663 descargas y 10 likes, sin senales de validacion por parte de la comunidad.
- Metadatos a revisar: la fecha de creacion registrada en HuggingFace es el 13 de septiembre de 2026, posterior a la fecha de actualizacion del propio repositorio, lo que sugiere una inconsistencia en los metadatos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Yanun/Swift-Qwen3.8-27b-oQ4e-fp16-mtp
- Modelo base: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Licencia y condiciones de acceso del modelo de origen: https://huggingface.co/ukisai/Swift-Qwen3.8-27b#license-and-access
- Paper, blog o repositorio adicional: no disponible
- Demo: no disponible

Nota: la busqueda web realizada no devolvio resultados relevantes sobre el modelo ni sobre su modelo base.
