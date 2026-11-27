# zephel01/GLM-5.3-Flash-32G96G-GGUF

## Resumen

GLM-5.3-Flash-32G96G-GGUF es una cuantización GGUF de tipo mixto del modelo zai-org/GLM-5.3-Flash, publicada por el usuario zephel01 bajo licencia MIT. No se trata de un modelo original, sino de una compilación de pesos optimizada para ejecutarse en un PC con una GPU de 32 GB de VRAM (RTX 5090, AI PRO R9700) y 96 GB de RAM, o en un DGX Spark con 128 GB de memoria unificada. El objetivo es hacer viable un modelo de arquitectura MoE de 320.759.404.382 parámetros totales en hardware de consumo, manteniendo todos los expertos (sin poda) y comprimiendo los pesos a una media de 2,26 bits por peso.

La relevancia de esta ficha radica en su enfoque de despliegue: combina cuantizaciones IQ2_XXS, IQ2_S, IQ3_XXS, Q2_K, Q3_K, Q4_K y Q5_K según la sensibilidad de cada componente, y se apoya en el motor Abyss para gestionar la jerarquía VRAM/RAM/SSD. El autor reporta 47,4 tok/s en una RTX 5090 con el nivel de RAM limitado a 60 GB, lo que sitúa al modelo en el terreno de la inferencia local interactiva para un MoE de este tamaño.

El repositorio tiene 94,1 GB repartidos en 4 shards y se distribuye como versión BETA, medida en un único equipo hasta la fecha. La model card advierte de que los archivos pueden reemplazarse por una compilación mejor tras nuevas mediciones. El modelo base soporta inglés y japonés, y la cuantización incluye entrenamiento de imatrix con transcripciones de chat en plantilla GLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con capa NextN/MTP; arch GGUF `glm5-next` en llama.cpp |
| Parametros totales | 320.759.404.382 |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens verificados en llama.cpp (`-c 32768`); no se especifica el máximo del modelo base |
| Tipos de cuantizacion | Mixta: IQ2_XXS (58% de los bytes de expertos), IQ2_S (36%), IQ3_XXS (3%), Q2_K (2%), Q3_K (1%); media de 2,26 bits por peso; proyecciones de atención y densas en Q4_K/Q5_K |
| Idiomas soportados | Inglés y japonés (según la model card y los tags) |
| Licencia | MIT |
| Formato de pesos | GGUF (4 shards, 94,1 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura MoE, tal como indica la etiqueta `moe` y la presencia de expertos enrutados por capas (capas 3-44 en la tabla de tipos de cuantización). La cuantización conserva todos los expertos sin poda y aplica tipos distintos según el rol de cada tensor: los expertos enrutados gate/up usan IQ2_XXS (con la capa 11 en IQ2_S), los expertos down usan IQ2_S (capas 11, 12 y 44 en IQ3_XXS), las proyecciones de atención y los expertos densos/compartidos usan Q4_K o Q5_K, y el router, embeddings, output y la capa NextN (MTP) conservan los bytes del UD-IQ2_XXS de unsloth.

El proceso de cuantización emplea LDLQ sobre el UD-Q4_K_XL de unsloth, con un volcado de Hessiano a partir de transcripciones de chat en la plantilla de GLM (inglés, código y japonés) y la imatrix de unsloth. No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición del dataset ni si hubo RLHF o DPO; esos datos corresponden al modelo original zai-org/GLM-5.3-Flash y no se detallan en la información proporcionada. La innovación técnica destacable es la gestión de expertos en tres niveles (VRAM, RAM y SSD) mediante el motor Abyss, que mantiene los expertos más usados en VRAM y lee del SSD los que no caben, con un coste medido de 0,3 ms por token cuando el conjunto cabe en RAM.

## Capacidades

- Generación de texto conversacional en inglés y japonés, con plantilla de chat GLM.
- Razonamiento multi-turno y respuesta a preguntas, verificado con preguntas en inglés y japonés en modo greedy.
- Generación de código: la imatrix y el volcado de Hessiano incluyen código, y la model card reporta calidad en una secuencia de código.
- Soporte de arquitectura MoE con capa NextN/MTP (multi-token prediction) integrada en los pesos.
- Compatibilidad con endpoints tipo OpenAI (`/v1/chat/completions`) a través del motor Abyss.
- Ejecución con llama.cpp estándar (arch `glm5-next`, upstream `ac8e1694d` del 2026-10-29).
- Capacidad de offload de CPU y lectura desde SSD para expertos que no caben en VRAM/RAM.
- No se documentan capacidades de visión, audio, tool calling ni agentes en la información disponible.

## Casos de uso

- Inferencia local de un MoE de 320B en una estación de trabajo con RTX 5090 y 96 GB de RAM: el modelo cabe en el binomio VRAM/RAM y decodifica a 47,4 tok/s con un nivel de RAM de 60 GB, lo que permite usarlo como asistente conversacional local sin depender de la nube.
- Asistente de chat en inglés y japonés: la cuantización se entrenó con transcripciones en ambos idiomas y la model card reporta KL de 0,251 en las 5 secuencias japonesas, por lo que es adecuado para atención bilingüe en entornos donde no se quiere enviar datos a un proveedor externo.
- Generación de código en local: la imatrix incluye código y el modelo base es un LLM generalista; se puede integrar en un flujo de autocompletado o revisión con llama.cpp o Abyss exponiendo una API compatible con OpenAI.
- Despliegue en DGX Spark: el repositorio hermano DGX-Spark-GGUF contiene los mismos archivos, lo que permite ejecutar el modelo en un equipo con 128 GB de memoria unificada sin GPU dedicada de gran VRAM.
- Prototipado de agentes y pipelines con API compatible: al exponer `/v1/chat/completions`, se puede conectar a frameworks que consuman la API de OpenAI, aunque el soporte nativo de tool calling no está documentado.
- Evaluación de cuantizaciones: investigadores pueden comparar la calidad de S1 (94,1 GB, KL 0,2534) frente a UD-IQ2_XXS (101,8 GB, KL 0,2643) y Q120d (127,9 GB, KL 0,1367) para estudiar el compromiso tamaño/calidad en MoE de gran escala.
- Servicio de inferencia en un PC de consumo con 64 GB de RAM: el modelo sigue funcionando aunque parte de los expertos se lea del SSD, lo que permite desplegarlo en equipos con menos memoria a costa de menor throughput.

## Benchmarks y rendimiento

| Metrica | S1 (este repo) | UD-IQ2_XXS (referencia) | Q120d (32G128G) |
|---|---:|---:|---:|
| Tamano de descarga | 94,1 GB | 101,8 GB | 127,9 GB |
| KL (14 secuencias) | 0,2534 | 0,2643 | 0,1367 * |
| KL, japones (5 secuencias) | 0,251 | 0,257 | 0,145 * |
| Mismo token top | 77,3% | 76,6% | 84,9% * |
| Velocidad (RTX 5090, RAM 60 GB) | 47,4 tok/s | no disponible | 19,0 tok/s |

\* Q120d: medición antigua de 10 secuencias, no directamente comparable con las cifras de 14 secuencias.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 32 GB para la GPU; el resto de expertos se reparte entre RAM y SSD según el motor.
- RAM recomendada: 96 GB para el objetivo 32G96G; con 60 GB de nivel de RAM se alcanzan 47,4 tok/s y 0,3 ms/token de espera de SSD; con 64 GB parte del modelo se lee de SSD y baja el rendimiento; con 128 GB o más cabe la variante de mayor calidad 32G128G.
- GPU recomendadas: RTX 5090 (32 GB), AI PRO R9700 (32 GB); DGX Spark (128 GB de memoria unificada) para la variante específica.
- Cabe en GPU de consumo: sí, en RTX 5090 de 32 GB combinada con 96 GB de RAM del sistema.
- Opciones de despliegue: motor Abyss (recomendado, con `setup-deepseek.sh --model glm --quant 32G96G --download-model`), llama.cpp (`llama-server -m S1/GLM-5.3-Flash-S1-00001-of-00004.gguf -c 32768 -b 4096 -ub 4096`), Windows 11 mediante `setup-deepseek.bat`.
- Latencia y throughput: 47,4 tok/s en RTX 5090 con nivel de RAM de 60 GB; 19,0 tok/s para la variante Q120d de 127,9 GB en el mismo equipo; espera de SSD de 0,3 ms/token (S1) frente a 23,5 ms/token (Q120d).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---:|---|---|---|
| GLM-5.3-Flash-32G96G (este repo) | 320,8B totales | 32.768 | MIT | GGUF | 94,1 GB, KL 0,2534, 47,4 tok/s |
| GLM-5.3-Flash-IQ3_XXS-32G128G (Q120d) | 320,8B totales | 32.768 | MIT | GGUF | 127,9 GB, mayor calidad (KL 0,1367 en medición de 10 secuencias), 19,0 tok/s |
| GLM-5.3-Flash-DGX-Spark-GGUF | 320,8B totales | 32.768 | MIT | GGUF | Mismos archivos que 32G96G, para DGX Spark de 128 GB |
| unsloth UD-IQ2_XXS | 320,8B totales | no disponible | MIT (modelo base) | GGUF | 101,8 GB, referencia de calidad (KL 0,2643), sin datos de velocidad |

## Limitaciones y advertencias

- Versión BETA: medida en un solo PC (RTX 5090 de 32 GB con nivel de RAM de 60 GB); los archivos pueden sustituirse por una compilación mejor y el nombre de la carpeta cambiará.
- El rendimiento depende críticamente de que el modelo quepa en VRAM+RAM; con menos RAM parte de los expertos se lee del SSD y la velocidad cae de forma significativa.
- No se documentan parámetros activos del MoE, por lo que no se puede estimar con precisión el coste computacional por token.
- Riesgo de alucinación inherente a los LLM; no se han publicado evaluaciones de sesgo ni de robustez en la información disponible.
- Idiomas limitados a inglés y japonés según la model card; el resto de idiomas no está evaluado.
- No se documenta soporte nativo de tool calling, agentes ni visión; la compatibilidad con la API de OpenAI se limita al endpoint de chat.
- La licencia MIT del repositorio se aplica a la cuantización; conviene verificar la licencia del modelo base zai-org/GLM-5.3-Flash antes de uso comercial.
- Los benchmarks de calidad son de divergencia KL frente a UD-Q4_K_XL, no evaluaciones de tareas estándar; no hay datos de MMLU, HumanEval o GSM8K.
- La comparación de Q120d usa una medición antigua de 10 secuencias y no es directamente comparable con las cifras de 14 secuencias.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zephel01/GLM-5.3-Flash-32G96G-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Motor Abyss: https://github.com/zephel01/Abyss
- Variante 32G128G: https://huggingface.co/zephel01/GLM-5.3-Flash-IQ3_XXS-32G128G-GGUF
- Variante DGX Spark: https://huggingface.co/zephel01/GLM-5.3-Flash-DGX-Spark-GGUF
- Repositorio anterior (redirige): https://huggingface.co/zephel01/GLM-5.3-Flash-IQ2_XS-32G96G-GGUF
- Envío de resultados de benchmark: https://github.com/zephel01/Abyss/issues/new?template=bench.md&title=Bench:+GLM-5.3-Flash+32G96G+S1+on+YOUR_GPU
