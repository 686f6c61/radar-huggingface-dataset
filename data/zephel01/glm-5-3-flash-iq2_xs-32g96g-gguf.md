# zephel01/GLM-5.3-Flash-IQ2_XS-32G96G-GGUF

## Resumen

GLM-5.3-Flash es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por zai-org (Zhipu AI), publicado bajo licencia MIT. Esta ficha describe la cuantización GGUF IQ2_XS-32G96G publicada por el usuario zephel01, un build de muy baja precisión (2,26 bits por peso de media) pensado para ejecutar el modelo completo en un PC con una GPU de 32 GB de VRAM y 96 GB de RAM, o en un DGX Spark con 128 GB de memoria unificada.

El modelo base tiene 320.759.404.382 parámetros totales y sigue una arquitectura MoE con capa de predicción multi-token (NextN/MTP). La cuantización conserva todos los expertos (sin poda) y mezcla varios tipos de cuantización por componente: los expertos enrutados usan mayoritariamente IQ2_XXS e IQ2_S, mientras que las proyecciones de atención y los expertos densos/compartidos emplean Q4_K y Q5_K. El repositorio ocupa 94,1 GB repartidos en cuatro shards.

La relevancia de esta ficha es práctica: demuestra que un modelo de más de 320.000 millones de parámetros puede ejecutarse en hardware de consumo (RTX 5090 de 32 GB) con un motor de offload a RAM y SSD, alcanzando 47,4 tok/s según las mediciones del autor. Es un caso de estudio de cuantización extrema con preservación de calidad, con una divergencia KL de 0,2534 frente al original en cuantización Q4_K_XL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) transformer con capa NextN (MTP); arquitectura llama.cpp `glm5-next` |
| Parametros totales | 320.759.404.382 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la informacion proporcionada (ejemplo de ejecucion con `-c 32768`) |
| Tipos de cuantizacion | Mezcla por componente: expertos enrutados IQ2_XXS (58%), IQ2_S (36%), IQ3_XXS (3%), Q2_K (2%), Q3_K (1%); atención y expertos densos Q4_K / Q5_K; media de 2,26 bits por peso |
| Idiomas soportados | Ingles y japones (segun la model card y los tags); resto no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (4 shards, 94,1 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con una capa NextN (multi-token prediction, MTP), segun la tabla de componentes de la cuantizacion, que distingue proyecciones de atencion, expertos enrutados, expertos densos/compartidos y la proyeccion NextN. No se dispone de informacion sobre el numero de parametros activos por token, el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; esos datos no aparecen en la informacion proporcionada.

La innovacion tecnica de esta publicacion es el proceso de cuantizacion: los expertos se recuantizaron con LDLQ (LDL Quantization) a partir del UD-Q4_K_XL de unsloth, usando un volcado de Hessian sobre transcripciones de chat en la plantilla de GLM (ingles, codigo y japones) junto con la imatrix de unsloth. El resultado es un fichero de tipo mixto, no una cuantizacion estandar de llama.cpp. El motor Abyss mantiene los expertos mas usados en VRAM, el resto en RAM y lee desde SSD lo que no cabe, de modo que el rendimiento depende de si el modelo entra en la jerarquia de memoria disponible.

## Capacidades

- Generacion de texto conversacional en ingles y japones, segun los idiomas declarados y las pruebas de calidad del autor.
- Razonamiento y respuesta a preguntas de tipo aritmetico (el ejemplo de la model card usa "What is 17*23?").
- Generacion de codigo: la evaluacion de calidad incluye una secuencia de codigo y el volcado de Hessian incorpora codigo.
- Soporte de plantilla de chat de GLM para conversaciones multi-turno.
- Compatibilidad con endpoints tipo OpenAI (`/v1/chat/completions`) a traves del motor Abyss y de `llama-server`.
- Capacidad de prediccion multi-token (NextN/MTP) integrada en la arquitectura.
- No se dispone de informacion sobre tool calling, function calling, modo thinking, vision o audio en la informacion proporcionada.

## Casos de uso

- Inferencia local de un modelo de gran escala en hardware de consumo: con una RTX 5090 de 32 GB y 96 GB de RAM, el modelo completo (sin poda de expertos) se ejecuta a 47,4 tok/s con el tier de RAM limitado a 60 GB, lo que permite usar un modelo de 320.000 millones de parametros en un PC de sobremesa.
- Asistente conversacional en ingles y japones: la cuantizacion conserva la calidad en japones (KL de 0,251 en las cinco secuencias japonesas) y la plantilla de chat de GLM, adecuada para atencion al usuario bilingue en local.
- Generacion de codigo en local sin conexion: el modelo mantiene las proyecciones de atencion y expertos densos en Q4_K/Q5_K, lo que preserva mejor la calidad en tareas de codigo que una cuantizacion uniforme a 2 bits.
- Despliegue en DGX Spark: el repositorio DGX Spark usa los mismos ficheros y aprovecha los 128 GB de memoria unificada para evitar lecturas de SSD.
- Evaluacion e investigacion de cuantizacion extrema: sirve como referencia para estudiar la degradacion de calidad (KL frente a Q4_K_XL) con preservacion total de expertos.
- Servicio de API compatible con OpenAI en red local: `llama-server` o Abyss exponen `/v1/chat/completions`, lo que permite integrar el modelo en herramientas existentes sin cambiar el cliente.
- Prototipado de pipelines con contexto de 32.768 tokens: el ejemplo de ejecucion de llama.cpp usa `-c 32768`, suficiente para documentos y conversaciones largas.

## Benchmarks y rendimiento

| Metrica | S1 (este repo) | UD-IQ2_XXS (referencia) | Q120d (32G128G) |
|---|---:|---:|---:|
| Tamano de descarga | 94,1 GB | 101,8 GB | 127,9 GB |
| KL (14 secuencias) | 0,2534 | 0,2643 | 0,1367 * |
| KL, japones (5 secuencias) | 0,251 | 0,257 | 0,145 * |
| Mismo token top | 77,3% | 76,6% | 84,9% * |
| Velocidad (RTX 5090, tier de RAM 60 GB) | 47,4 tok/s | no disponible | 19,0 tok/s |

\* Q120d: medicion antigua de 10 secuencias, no directamente comparable con las cifras de 14 secuencias.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las metricas de velocidad corresponden a una unica medicion del autor en una RTX 5090 de 32 GB con el tier de RAM limitado a 60 GB; S1 espera 0,3 ms por token al SSD y Q120d espera 23,5 ms por token.

## Requisitos de hardware

- VRAM estimada: 32 GB de VRAM para la GPU mas 96 GB de RAM como objetivo de diseno; el modelo ocupa 94,1 GB en disco.
- GPU recomendadas: RTX 5090 (32 GB) y AI PRO R9700 (32 GB) segun la model card; DGX Spark (128 GB de memoria unificada) con el repositorio especifico.
- Cabe en GPU de consumo: si, en una RTX 5090 de 32 GB, siempre que se acompanen de 96 GB de RAM; con solo 64 GB de RAM parte del modelo se lee desde SSD y la velocidad baja.
- Opciones de despliegue: motor Abyss (recomendado por el autor, con `setup-deepseek.sh --model glm --quant 32G96G`), llama.cpp (`llama-server` con arquitectura `glm5-next`, commit `ac8e1694d` del 2026-10-29) y endpoints compatibles con OpenAI.
- Latencia y throughput: 47,4 tok/s en RTX 5090 con tier de RAM de 60 GB; 19,0 tok/s para el build de mayor calidad Q120d en el mismo hardware; con 123 GB de RAM y `llama-server` el autor verifico respuestas correctas en ingles y japones en modo greedy.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (KL) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash S1 (este repo) | 320.759.404.382 | no disponible | 0,2534 | MIT | GGUF, 94,1 GB |
| GLM-5.3-Flash UD-IQ2_XXS (unsloth) | mismo modelo base | no disponible | 0,2643 | MIT | GGUF, 101,8 GB |
| GLM-5.3-Flash Q120d (32G128G) | mismo modelo base | no disponible | 0,1367 * | MIT | GGUF, 127,9 GB |

Las tres alternativas son cuantizaciones del mismo modelo base, por lo que la comparacion relevante es de tamano, calidad y requisitos de memoria. No se dispone de informacion sobre otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Estado BETA: medido en un solo PC (RTX 5090 de 32 GB, tier de RAM limitado a 60 GB); el autor advierte que el fichero puede sustituirse por un build mejor tras nuevas mediciones.
- La cuantizacion a 2,26 bits por peso degrada la calidad frente al original: KL de 0,2534 y solo 77,3% de coincidencia en el token top frente a UD-Q4_K_XL.
- El rendimiento depende criticamente de la jerarquia de memoria: con menos de 96 GB de RAM parte del modelo se lee desde SSD y la velocidad cae; el objetivo 32G96G es una configuracion de diseno, no una garantia de velocidad.
- No es una cuantizacion estandar de llama.cpp: mezcla varios tipos por componente, por lo que las herramientas que asumen una cuantizacion uniforme pueden no interpretarla correctamente.
- Idiomas limitados a ingles y japones segun la model card; el rendimiento en castellano no esta documentado.
- Riesgo de alucinacion y sesgos: no se aporta informacion especifica en la model card; como en cualquier modelo cuantizado a muy baja precision, la degradacion puede ser mayor en tareas de razonamiento largo.
- Licencia MIT: permite uso comercial, pero el modelo base y la cuantizacion deben citarse conforme a la licencia; verificar los terminos del modelo base zai-org/GLM-5.3-Flash.
- Requiere una version concreta de llama.cpp (arquitectura `glm5-next`) o el motor Abyss; versiones antiguas no cargaran el modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zephel01/GLM-5.3-Flash-IQ2_XS-32G96G-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Version 32G128G (mayor calidad): https://huggingface.co/zephel01/GLM-5.3-Flash-IQ3_XXS-32G128G-GGUF
- Version DGX Spark: https://huggingface.co/zephel01/GLM-5.3-Flash-DGX-Spark-GGUF
- Motor Abyss: https://github.com/zephel01/Abyss
- Envio de resultados de benchmark: https://github.com/zephel01/Abyss/issues/new?template=bench.md&title=Bench:+GLM-5.3-Flash+32G96G+S1+on+YOUR_GPU
