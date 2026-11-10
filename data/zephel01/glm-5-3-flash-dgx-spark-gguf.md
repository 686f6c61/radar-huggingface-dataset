# zephel01/GLM-5.3-Flash-DGX-Spark-GGUF

## Resumen

GLM-5.3-Flash-DGX-Spark-GGUF es una cuantizacion GGUF del modelo base zai-org/GLM-5.3-Flash (licencia MIT), publicada por el usuario zephel01. Su proposito es permitir la ejecucion del modelo completo en una unica NVIDIA DGX Spark (GB10, 128 GB de memoria unificada) conservando todos los expertos, sin poda, y dejando margen de memoria para contexto largo. El modelo base es un transformer de tipo mixture-of-experts (MoE) con 320.759.404.382 parametros totales.

La cuantizacion emplea una mezcla de tipos (IQ2_XXS 58%, IQ2_S 36%, IQ3_XXS 3%, Q2_K 2%, Q3_K 1% por bytes), con una media de 2,26 bits por peso, aproximadamente equivalente a IQ2_XS. El repositorio ocupa 94,1 GB y se distribuye en 4 fragmentos. La model card lo marca explicitamente como BETA, medido el 2026-11-07 en una DGX Spark alquilada.

Es relevante porque demuestra que un MoE de 320.000 millones de parametros puede servirse en hardware de un solo nodo con memoria unificada, con una perdida de calidad medida (KL 0,2534 frente a 0,2643 de la referencia unsloth UD-IQ2_XXS) y un rendimiento de decodificacion de 27,4 tok/s. La ficha describe tanto el modelo cuantizado como las caracteristicas heredadas del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE); transformer (detalle de capas no disponible) |
| Parametros totales | 320.759.404.382 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la model card menciona "contexto largo" y margen de memoria, sin cifra) |
| Tipos de cuantizacion | Mezcla: IQ2_XXS 58%, IQ2_S 36%, IQ3_XXS 3%, Q2_K 2%, Q3_K 1% (por bytes); 2,26 bits por peso de media (~IQ2_XS) |
| Idiomas soportados | Ingles (en), japones (ja) |
| Licencia | MIT |
| Formato de pesos | GGUF (4 fragmentos, `S1/GLM-5.3-Flash-S1-0000N-of-00004.gguf`) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un transformer con arquitectura mixture-of-experts, segun indican las etiquetas del repositorio (`moe`) y la propia model card, que describe la conservacion de "todos los expertos" y el sesgo de experto del router almacenado en F32. La cuantizacion mantiene intacto el bloque NextN del modelo, que la model card identifica como el mecanismo de decodificacion especulativa empleado por el motor Abyss: el modelo genera borradores con su propio bloque NextN y los verifica en una ventana por lotes, con una tasa de aceptacion de borradores del 74-77% y sin alterar los tokens finales. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

El proceso de cuantizacion se realizo con la herramienta trench-gguf a partir de los GGUF e imatrix de unsloth/GLM-5.3-Flash-GGUF. La calibracion incluyo un conjunto de 14 secuencias de 1.024 tokens (8 en ingles, 1 de codigo y 5 en japones) para medir la divergencia KL frente a UD-Q4_K_XL de unsloth. Se probo una version con mas japones en la calibracion que no mejoro el texto general en japones, por lo que se mantuvo la version S1. La verificacion `--check` de Abyss pasa 12 de 12 en RTX 5090.

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`, etiqueta `conversational`).
- Razonamiento y codigo: el conjunto de calibracion incluye una secuencia de codigo y la model card evalua calidad sobre texto general y codigo.
- Capacidades multilingues limitadas a ingles y japones segun los metadatos del repositorio; el japones se midio por separado (KL 0,251 en 5 secuencias, frente a 0,257 de unsloth UD-IQ2_XXS).
- Decodificacion especulativa nativa mediante el bloque NextN del modelo, explotada por el motor Abyss.
- Compatibilidad con endpoints (`endpoints_compatible` en las etiquetas del repositorio).
- Soporte de tool calling, function calling, agentes y modos de razonamiento extendido: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en un unico DGX Spark: el archivo completo (94,1 GB) cabe en los 128 GB de memoria unificada del GB10 dejando unos 8 GB mas de margen que la alternativa unsloth, lo que permite mantener contexto largo en una sola maquina sin poda de expertos.
- Despliegue en estacion de trabajo con RTX 5090 y 96 GB de RAM: el mismo archivo S1 se ejecuta a 75,7 tok/s, adecuado para asistentes interactivos de un solo usuario con requisitos de privacidad.
- Generacion de texto en japones: la cuantizacion mantiene una KL de 0,251 en japones, ligeramente mejor que la referencia, por lo que sirve para tareas de redaccion y conversacion en ese idioma.
- Evaluacion e investigacion de cuantizaciones extremas: el repositorio documenta KL, tasa de coincidencia de token superior y velocidad, lo que lo convierte en una referencia reproducible para estudiar el compromiso calidad/memoria en MoE de gran tamano.
- Prototipado de pipelines de generacion de codigo: el modelo base incluye capacidad de codigo y el archivo puede integrarse en motores compatibles con GGUF para pruebas de CI o generacion asistida en local.
- Servicio de chat con contexto largo en hardware de un solo nodo: el margen de memoria adicional respecto a la referencia permite ventanas de contexto mayores sin recurrir a offloading a CPU.
- Banco de pruebas de decodificacion especulativa: la model card proporciona cifras con y sin drafting (27,4 frente a 21,4 tok/s), util para validar implementaciones de NextN en aarch64/sm_121.

## Benchmarks y rendimiento

| Metrica | S1 (este repo) | unsloth UD-IQ2_XXS |
|---|---|---|
| Tamano de descarga | 94,1 GB | 101,8 GB |
| Expertos | Todos (sin poda) | Todos |
| KL (14 secuencias) | 0,2534 | 0,2643 |
| KL japones (5 secuencias) | 0,251 | 0,257 |
| Mismo token superior | 77,3% | 76,6% |
| Decodificacion en DGX Spark (Abyss v1.3.119) | 27,4 tok/s | 24,2 tok/s |
| Decodificacion sin drafting en DGX Spark | 21,4 tok/s | 19,8 tok/s |
| Decodificacion en RTX 5090 + 96 GB RAM | 75,7 tok/s | no disponible |

Mediciones en DGX Spark con Abyss v1.3.119: prompt de 4K, mediana de 3 ejecuciones de 512 tokens. La KL se mide contra UD-Q4_K_XL de unsloth sobre 14 secuencias de 1.024 tokens (8 ingles, 1 codigo, 5 japones), re-medida el 2026-11-08 con el sesgo de experto del router en F32 tal como se almacena en el GGUF. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria: 94,1 GB para los pesos; en DGX Spark caben en 128 GB de memoria unificada con margen para contexto. En PC se recomienda 32 GB de GPU mas 96 GB de RAM (offloading parcial) o 32 GB de GPU mas 128 GB de RAM para la variante IQ3_XXS de mayor calidad.
- GPU recomendadas: NVIDIA DGX Spark (GB10, aarch64, sm_121); RTX 5090 con 96 GB de RAM del sistema para la ejecucion a 75,7 tok/s.
- Cabe en GPU de consumo: si, en RTX 5090 con 32 GB de VRAM y 96 GB de RAM del sistema mediante offloading de expertos; no cabe integramente en la VRAM de una GPU de consumo.
- Opciones de despliegue: motor Abyss (soporte documentado para DGX Spark en docs/DGX-SPARK.md); al ser GGUF estandar, otros motores compatibles con GGUF pueden cargarlo, aunque las cifras publicadas son de Abyss.
- Latencia y throughput: 27,4 tok/s en DGX Spark con drafting y 21,4 tok/s sin drafting; 75,7 tok/s en RTX 5090 + 96 GB RAM. En DGX Spark la decodificacion esta limitada por los 273 GB/s de ancho de banda de memoria, por lo que la velocidad sigue a los bytes leidos por token (S1 lee aproximadamente un 8% menos que UD-IQ2_XXS).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Calidad (KL) | Licencia |
|---|---|---|---|---|---|
| GLM-5.3-Flash S1 (este repo) | 320,8 B (MoE) | no disponible | GGUF, 94,1 GB | 0,2534 | MIT |
| unsloth UD-IQ2_XXS | 320,8 B (MoE) | no disponible | GGUF, 101,8 GB | 0,2643 | MIT (modelo base) |
| zephel01 IQ3_XXS-32G128G | 320,8 B (MoE) | no disponible | GGUF, 127,9 GB | no disponible (mayor calidad declarada) | MIT |

Las tres opciones derivan del mismo modelo base zai-org/GLM-5.3-Flash. La diferencia principal es el compromiso entre tamano en disco, calidad medida por KL y velocidad de decodificacion en hardware limitado.

## Limitaciones y advertencias

- Version BETA: las mediciones se realizaron en una DGX Spark alquilada el 2026-11-07 y el archivo puede sustituirse por una compilacion mejor, cambiando el nombre de la carpeta.
- Cuantizacion muy agresiva (2,26 bits por peso de media): la KL de 0,2534 frente a UD-Q4_K_XL implica degradacion medible respecto al modelo en alta precision; el 22,7% de los tokens no coincide con el token superior de la referencia.
- Cobertura linguistica limitada a ingles y japones segun los metadatos; el rendimiento en castellano no esta documentado.
- Riesgo de alucinacion y sesgos del modelo base: no disponible en la informacion proporcionada.
- El rendimiento publicado depende del motor Abyss y de su implementacion de drafting NextN; otros motores pueden ofrecer velocidades distintas.
- La licencia MIT del modelo base permite uso comercial, pero conviene verificar los terminos del modelo base original y de los GGUF de origen de unsloth antes de desplegar en produccion.
- No se han publicado benchmarks estandar de capacidad (MMLU, HumanEval, GSM8K), por lo que la evaluacion de calidad se limita a la metrica KL y a la coincidencia de token superior.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zephel01/GLM-5.3-Flash-DGX-Spark-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Variante IQ2_XS 32G96G: https://huggingface.co/zephel01/GLM-5.3-Flash-IQ2_XS-32G96G-GGUF
- Variante IQ3_XXS 32G128G: https://huggingface.co/zephel01/GLM-5.3-Flash-IQ3_XXS-32G128G-GGUF
- GGUF e imatrix de origen: https://huggingface.co/unsloth/GLM-5.3-Flash-GGUF
- Motor Abyss: https://github.com/zephel01/Abyss
- Documentacion de Abyss para DGX Spark: https://github.com/zephel01/Abyss/blob/main/docs/DGX-SPARK.md
- Herramienta de cuantizacion trench-gguf: https://github.com/zephel01/trench-gguf
- Formulario de reporte de benchmarks: https://github.com/zephel01/Abyss/issues/new?template=bench.md&title=Bench:+GLM-5.3-Flash+DGX-Spark+S1+on+GB10
