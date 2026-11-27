# zephel01/GLM-5.3-Flash-DGX-Spark-GGUF

## Resumen

GLM-5.3-Flash-DGX-Spark-GGUF es una cuantizacion GGUF de tipo mixto del modelo zai-org/GLM-5.3-Flash, publicada por el usuario zephel01. El objetivo es empaquetar un modelo MoE de 320.759.404.382 parametros totales en un unico NVIDIA DGX Spark con 128 GB de memoria unificada (GB10), dejando margen para contexto. El autor mantiene todos los expertos (sin poda) y aplica una mezcla de tipos de cuantizacion (IQ2_XXS 58%, IQ2_S 36%, IQ3_XXS 3%, Q2_K 2%, Q3_K 1% por bytes), con 2,26 bits por peso de media, aproximadamente equivalente a IQ2_XS.

La relevancia actual reside en que permite ejecutar un modelo de gran escala en hardware de escritorio de gama alta para IA local, con un tamaño de descarga de 94,1 GB repartido en 4 shards. El autor publica mediciones de calidad (KL frente a la referencia UD-Q4_K_XL de unsloth) y de velocidad en un DGX Spark alquilado, con decodificacion especulativa mediante el bloque NextN del propio modelo. La ficha se marca como BETA: las mediciones se realizaron el 2026-11-07 y el archivo puede ser reemplazado por una construccion mejor.

El modelo base es GLM-5.3-Flash, de zai-org, con licencia MIT. Esta cuantizacion hereda esa licencia y declara soporte para ingles y japones. No se dispone de informacion sobre la arquitectura interna del modelo base mas alla de que es un MoE, ni sobre sus datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos); arquitectura interna del modelo base no disponible |
| Parametros totales | 320.759.404.382 |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens en la configuracion de ejemplo del autor (no confirmado como maximo del modelo) |
| Tipos de cuantizacion | Mixta: IQ2_XXS 58%, IQ2_S 36%, IQ3_XXS 3%, Q2_K 2%, Q3_K 1% (por bytes); 2,26 bits/peso de media, aprox. IQ2_XS |
| Idiomas soportados | en, ja |
| Licencia | MIT |
| Formato de pesos | GGUF (4 shards, 94,1 GB) |

## Arquitectura y entrenamiento

El modelo base es un MoE segun las etiquetas del repositorio, pero no se proporciona informacion sobre el numero de expertos, la dimension de las capas, el mecanismo de atencion ni la composicion del dataset de entrenamiento. Tampoco se detalla si hubo RLHF, DPO u otras fases de alineamiento. Lo unico verificable en la informacion disponible es que el modelo incluye un bloque NextN que el motor Abyss utiliza como drafter para decodificacion especulativa, y que el router del MoE mantiene un sesgo de experto almacenado en F32 en el GGUF.

La innovacion tecnica de esta publicacion no esta en el modelo base sino en el empaquetado: una cuantizacion mixta por experto que conserva todos los expertos y reduce el peso a 2,26 bits por peso, con un KL de 0,2534 frente a la referencia UD-Q4_K_XL (top-k log-probs, 14 secuencias x 1.024 tokens: 8 en ingles, 1 de codigo, 5 en japones). En japones el KL es de 0,251 frente a 0,257 de UD-IQ2_XXS. La coincidencia de token top es del 77,3%. El autor indica que una calibracion con mas japones no mejoro el resultado en texto general japones.

## Capacidades

- Generacion de texto conversacional en ingles y japones.
- Razonamiento y respuesta a preguntas (el ejemplo de la model card consulta 17*23).
- Soporte de decodificacion especulativa mediante el bloque NextN del propio modelo, con verificacion por ventana batcheada en Abyss.
- Compatibilidad con llama.cpp (arquitectura `glm5-next`, commit upstream ac8e1694d del 2026-10-29), verificado con respuestas correctas en ingles y japones en una RTX 5090.
- Servidor compatible con la API de chat completions de OpenAI (`/v1/chat/completions`) a traves de Abyss.
- Etiqueta `conversational` en el repositorio, lo que indica uso orientado a dialogo.
- No se dispone de informacion sobre tool calling, function calling, capacidades de agente, vision, audio ni modo thinking.

## Casos de uso

- Inferencia local de un modelo de 320.000 millones de parametros en un unico DGX Spark: el archivo completo cabe en los 128 GB de memoria unificada y deja unos 8 GB adicionales para contexto largo respecto a la alternativa UD-IQ2_XXS.
- Asistente conversacional en ingles y japones en entornos sin conexion o con requisitos de privacidad: el modelo se sirve localmente mediante Abyss con la API de chat completions de OpenAI, lo que permite integrarlo en aplicaciones existentes sin cambios de cliente.
- Evaluacion de cuantizaciones de baja precision: investigadores pueden comparar el KL de 0,2534 de este empaquetado frente a la referencia UD-Q4_K_XL y medir el impacto de 2,26 bits por peso en tareas en ingles, codigo y japones.
- Despliegue en estaciones de trabajo con GPU de 32 GB y 96 GB de RAM: el mismo conjunto de archivos esta disponible en el repositorio GLM-5.3-Flash-IQ2_XS-32G96G-GGUF, pensado para ese perfil de hardware.
- Prototipado de decodificacion especulativa: el bloque NextN actua como drafter y la ventana de verificacion batcheada de Abyss puede estudiarse como caso practico de aceleracion en memoria unificada.
- Pruebas de compatibilidad con llama.cpp: la arquitectura `glm5-next` esta verificada en una RTX 5090, lo que permite usar el ecosistema llama.cpp para integraciones y herramientas existentes.
- Servicio de generacion de texto con contexto de 32.768 tokens en un solo nodo: util para resumir documentos largos o mantener conversaciones multi-turno extensas sin infraestructura multi-GPU.

## Benchmarks y rendimiento

Calidad, medida como KL frente a unsloth UD-Q4_K_XL (top-k log-probs, 14 secuencias x 1.024 tokens):

| Modelo | Descarga | Expertos | KL (14 seqs) | KL japones (5) | Mismo token top |
|---|---:|---:|---:|---:|---:|
| S1 (este repositorio) | 94,1 GB | todos | 0,2534 | 0,251 | 77,3% |
| unsloth UD-IQ2_XXS (referencia) | 101,8 GB | todos | 0,2643 | 0,257 | 76,6% |

Velocidad: el autor reporta 27,4 tok/s para IQ2_XS en un unico DGX Spark (GB10, 128 GB de memoria unificada), con presupuesto de memoria por defecto, prompt de 4K y mediana de 3 ejecuciones de 512 tokens. La tabla de velocidad de la model card esta incompleta en la informacion disponible: solo se conserva el encabezado de columnas (con y sin drafter NextN, version v1.3.118 con drafter), sin las cifras por fila. El autor afirma que S1 lee aproximadamente un 8% menos de bytes por token que UD-IQ2_XXS.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria: el archivo ocupa 94,1 GB. En un DGX Spark (128 GB de memoria unificada) cabe completo y deja unos 8 GB para contexto. En el perfil 32G96G se asume una GPU de 32 GB mas 96 GB de RAM del sistema.
- GPU recomendadas: NVIDIA DGX Spark (GB10, 128 GB de memoria unificada) es el objetivo declarado. La variante de 32G96G esta pensada para PC con 32 GB de GPU y 96 GB de RAM. La variante IQ3_XXS (127,9 GB) requiere 32 GB de GPU y 128 GB de RAM.
- GPU de consumo: cabe en configuraciones con memoria agregada GPU+RAM suficiente; no se confirma su funcionamiento en una unica GPU de consumo de 24 GB.
- Opciones de despliegue: motor Abyss (recomendado por el autor, con compilacion para aarch64 y sm_121) y llama.cpp (arquitectura `glm5-next`, commit ac8e1694d del 2026-10-29). No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: 27,4 tok/s en DGX Spark para IQ2_XS. El resto de cifras de velocidad no estan disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (KL) | Descarga | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GLM-5.3-Flash-DGX-Spark-GGUF (S1) | 320,8 B (MoE) | 32.768 en config. de ejemplo | 0,2534 | 94,1 GB | MIT | Hugging Face |
| unsloth UD-IQ2_XXS de GLM-5.3-Flash | 320,8 B (MoE) | no disponible | 0,2643 | 101,8 GB | MIT (heredada) | Hugging Face |
| GLM-5.3-Flash-IQ3_XXS-32G128G-GGUF | 320,8 B (MoE) | no disponible | no disponible | 127,9 GB | MIT (heredada) | Hugging Face |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Estado BETA: las mediciones se realizaron el 2026-11-07 en un DGX Spark alquilado y el archivo puede ser reemplazado por una construccion mejor, con cambio de nombre de carpeta.
- La cuantizacion a 2,26 bits por peso introduce perdida de calidad respecto al modelo original; el KL de 0,2534 y la coincidencia de token top del 77,3% implican divergencias respecto a la referencia de mayor precision.
- No es una cuantizacion estandar de llama.cpp: la etiqueta del repositorio corresponde al tipo mas cercano a la media de bits de los expertos, pero los archivos mezclan varios tipos.
- Idiomas limitados a ingles y japones; no se declara soporte de castellano.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion ni evaluaciones de seguridad del modelo base.
- El rendimiento de velocidad solo esta medido en DGX Spark con el motor Abyss; llama.cpp esta verificado en una RTX 5090 pero no medido en el Spark.
- La licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base zai-org/GLM-5.3-Flash.
- La tabla de velocidad de la model card esta incompleta en la informacion disponible, por lo que no se pueden citar cifras de throughput con y sin drafter.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zephel01/GLM-5.3-Flash-DGX-Spark-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Motor Abyss: https://github.com/zephel01/Abyss
- Guia DGX Spark: https://github.com/zephel01/Abyss/blob/main/docs/DGX-SPARK.md
- Variante 32G96G: https://huggingface.co/zephel01/GLM-5.3-Flash-IQ2_XS-32G96G-GGUF
- Variante IQ3_XXS 32G128G: https://huggingface.co/zephel01/GLM-5.3-Flash-IQ3_XXS-32G128G-GGUF
- Envio de resultados de benchmark: https://github.com/zephel01/Abyss/issues/new?template=bench.md&title=Bench:+GLM-5.3-Flash+DGX-Spark+S1+on+GB10
