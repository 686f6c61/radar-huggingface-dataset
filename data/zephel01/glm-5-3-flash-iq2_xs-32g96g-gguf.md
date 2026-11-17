# zephel01/GLM-5.3-Flash-IQ2_XS-32G96G-GGUF

## Resumen

GLM-5.3-Flash-IQ2_XS-32G96G-GGUF es una cuantización GGUF del modelo zai-org/GLM-5.3-Flash (licencia MIT), publicada por el usuario zephel01. No es un modelo nuevo: es un empaquetado mixto de precisión reducida pensado para ejecutar un modelo MoE de 320.759.404.382 parámetros totales en un PC con una GPU de 32 GB de VRAM y 96 GB de RAM, o en un DGX Spark con 128 GB de memoria unificada. El objetivo declarado es conservar todos los expertos (sin poda) y reducir el peso medio a 2,26 bits por parámetro, con un tamaño de descarga de 94,1 GB repartido en cuatro shards.

La relevancia de esta ficha no está en el modelo base, sino en la ingeniería de cuantización: mezcla IQ2_XXS, IQ2_S, IQ3_XXS, Q2_K, Q3_K, Q4_K y Q5_K según la sensibilidad de cada tensor, y se apoya en el motor Abyss, que mantiene los expertos más usados en VRAM, el resto en RAM y lee del SSD lo que no cabe. El autor reporta 47,4 tok/s en una RTX 5090 con el nivel de RAM limitado a 60 GB, con una espera de 0,3 ms por token al SSD, frente a 19,0 tok/s de su build de mayor calidad (127,9 GB) en el mismo equipo.

Se trata de una build marcada como BETA, medida en un solo PC, con la carga en llama.cpp sin verificar todavía. La model card incluye mediciones de divergencia KL frente a unsloth UD-Q4_K_XL y un desglose por tipo de tensor, lo que la hace útil para quien planifique despliegues locales de modelos MoE grandes con presupuesto de VRAM ajustado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) del modelo base GLM-5.3-Flash; incluye capa NextN (MTP) |
| Parametros totales | 320.759.404.382 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mezcla: IQ2_XXS, IQ2_S, IQ3_XXS, Q2_K, Q3_K, Q4_K, Q5_K (2,26 bits por peso de media, aprox. IQ2_XS) |
| Idiomas soportados | en, ja (segun tags de la model card); lista oficial de idiomas no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (4 shards, 94,1 GB, carpeta S1) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) de zai-org, con 320.759.404.382 parámetros totales y una capa NextN (multi-token prediction) cuyos tensores también se cuantizan en este empaquetado. Esta build no entrena nada: es una cuantización del checkpoint zai-org/GLM-5.3-Flash, con los expertos re-cuantizados mediante LDLQ a partir de unsloth UD-Q4_K_XL, usando un volcado de Hessiano de transcripciones de chat en la plantilla de GLM (inglés, código y japonés) y la imatrix de unsloth. No se dispone de datos sobre el número de tokens de entrenamiento del modelo original ni sobre su pipeline de alineación (RLHF/DPO).

La asignación de precisión es selectiva por tensor: las puertas y proyecciones "up" de los expertos enrutados (capas 3-44) van en IQ2_XXS, salvo la capa 11 en IQ2_S; las proyecciones "down" de los expertos enrutados en IQ2_S, con las capas 11, 12 y 44 en IQ3_XXS; las salidas de atención, el q_b de atención y las proyecciones "down" densas y de expertos compartidos en Q5_K; el resto de proyecciones de atención, las puertas y "up" densas y de expertos compartidos, y la proyección NextN en Q4_K; y el router, los embeddings, la salida y el resto de la capa NextN conservan los bytes de UD-IQ2_XXS de unsloth. Por bytes, los expertos son IQ2_XXS al 58 %, IQ2_S al 36 %, IQ3_XXS al 3 %, Q2_K al 2 % y Q3_K al 1 %. No se poda ningún experto.

## Capacidades

- Generación de texto conversacional en inglés y japonés, con plantilla de chat propia de GLM.
- Razonamiento multi-paso y conversaciones multi-turno, heredados del modelo base.
- Generación de código: el calibrado de la cuantización incluye secuencias de código, y el autor reporta un comportamiento ligeramente peor en la única secuencia de código medida frente a UD-IQ2_XXS.
- Capacidad multilingüe limitada a los idiomas declarados (en, ja); el resto de idiomas no está verificado en esta build.
- Soporte de decodificación especulativa mediante la capa NextN (MTP) incluida en el GGUF.
- Servidor compatible con la API de OpenAI a través del motor Abyss (`/v1/chat/completions` en el puerto 8082).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local de un MoE de 320B en un PC de gama alta: con una RTX 5090 de 32 GB y 96 GB de RAM, el modelo cabe completo (94,1 GB) y decodifica a 47,4 tok/s con el nivel de RAM limitado a 60 GB, lo que permite uso interactivo sin depender de la nube.
- Asistente de código en estación de trabajo: la build conserva todos los expertos y usa Q5_K en las proyecciones de atención y Q4_K en el resto de tensores densos, de modo que las partes no enrutadas mantienen precisión razonable para autocompletado y revisión de parches en local.
- Procesamiento de documentación en japonés: el autor midió por separado cinco secuencias japonesas y obtuvo una KL de 0,251 frente al original, mejor que UD-IQ2_XXS (0,257); sirve para resumen y traducción asistida dentro de ese idioma.
- Despliegue en DGX Spark: el repositorio hermano DGX-Spark-GGUF contiene los mismos ficheros y aprovecha los 128 GB de memoria unificada del dispositivo para evitar lecturas de SSD.
- Prototipado de agentes conversacionales con API compatible con OpenAI: el motor Abyss expone un endpoint `/v1/chat/completions`, lo que permite conectar clientes existentes sin adaptadores.
- Evaluación de cuantizaciones agresivas: con una KL de 0,2534 en 14 secuencias y un 77,3 % de coincidencia en el token top-1 frente a UD-Q4_K_XL, es una referencia útil para estudiar la degradación de un MoE a ~2,26 bits por peso.
- Servicio de bajo volumen en hardware de consumo: al mantener el modelo en VRAM y RAM con lecturas puntuales de SSD (0,3 ms por token en el caso medido), es viable para un único usuario o un equipo pequeño sin GPUs de centro de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K u otros). La model card únicamente aporta métricas de fidelidad de la cuantización y de velocidad:

| Metrica | S1 (este repo) | UD-IQ2_XXS (referencia) | Q120d (32G128G) |
|---|---:|---:|---:|
| Tamano de descarga | 94,1 GB | 101,8 GB | 127,9 GB |
| KL (14 secuencias) | 0,2534 | 0,2643 | 0,1367 * |
| KL, japones (5 secuencias) | 0,251 | 0,257 | 0,145 * |
| Mismo token top-1 | 77,3 % | 76,6 % | 84,9 % * |
| Velocidad (RTX 5090, nivel de RAM 60 GB) | 47,4 tok/s | no disponible | 19,0 tok/s |

\* Medición antigua de 10 secuencias; no directamente comparable con las cifras de 14 secuencias.

## Requisitos de hardware

- VRAM estimada: 32 GB de VRAM como objetivo declarado, con 96 GB de RAM del sistema; el fichero completo ocupa 94,1 GB.
- GPU recomendadas: RTX 5090 (32 GB) y AI PRO R9700 (32 GB) según la model card; DGX Spark (GB10, 128 GB de memoria unificada) con el repositorio específico.
- Cabe en GPU de consumo: sí, en RTX 5090 de 32 GB, pero solo con offload a RAM; no cabe íntegramente en VRAM.
- Opciones de despliegue: motor Abyss (soporte verificado, con `setup-deepseek.sh --model glm --quant 32G96G` en Linux y `setup-deepseek.bat` en Windows 11); llama.cpp figura como "loading not checked yet"; vLLM, Ollama y TGI no están mencionados.
- Latencia y throughput: 47,4 tok/s en RTX 5090 con el nivel de RAM limitado a 60 GB y 0,3 ms por token de espera al SSD; con 64 GB de RAM parte del modelo se lee de SSD y baja el rendimiento; la build de 127,9 GB en el mismo equipo rinde 19,0 tok/s con 23,5 ms por token de espera al SSD.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| GLM-5.3-Flash-IQ2_XS-32G96G (este repo) | 320,8B totales | no disponible | GGUF, 94,1 GB | MIT | 47,4 tok/s en RTX 5090 + 96 GB RAM; KL 0,2534 |
| zephel01/GLM-5.3-Flash-IQ3_XXS-32G128G | 320,8B totales | no disponible | GGUF, 127,9 GB | MIT | Mayor calidad (KL 0,1367 en 10 secuencias), requiere 128 GB de RAM; 19,0 tok/s |
| unsloth UD-IQ2_XXS de GLM-5.3-Flash | 320,8B totales | no disponible | GGUF, 101,8 GB | MIT (modelo base) | Referencia de cuantización estándar; KL 0,2643 en 14 secuencias |
| zai-org/GLM-5.3-Flash (original) | 320,8B totales | no disponible | safetensors | MIT | Modelo base sin cuantizar; requisitos de hardware muy superiores |

## Limitaciones y advertencias

- Build marcada como BETA y medida en un único PC (RTX 5090 de 32 GB con el nivel de RAM limitado a 60 GB); el autor advierte que el fichero puede sustituirse por una versión mejor y que cambiará el nombre de la carpeta.
- La carga en llama.cpp no está verificada; el soporte validado es exclusivamente el motor Abyss.
- La cuantización a 2,26 bits por peso introduce degradación medible: KL de 0,2534 y solo un 77,3 % de coincidencia en el token top-1 frente a UD-Q4_K_XL, con peor comportamiento en la única secuencia de código evaluada.
- El rendimiento depende críticamente de la RAM disponible: con 64 GB parte del modelo se lee de SSD y la velocidad cae; los 47,4 tok/s corresponden a un nivel de RAM de 60 GB.
- Idiomas verificados limitados a inglés y japonés; no hay datos sobre otros idiomas ni sobre sesgos del modelo base.
- Riesgo de alucinación: no cuantificado en la información disponible; aplica el comportamiento del modelo base, no documentado aquí.
- La licencia MIT se hereda del modelo base, pero el autor de la cuantización no ofrece garantías sobre el uso comercial; conviene verificar la licencia del checkpoint original zai-org/GLM-5.3-Flash.
- No se han publicado métricas de benchmarks de capacidad (MMLU, HumanEval, GSM8K), por lo que no es posible comparar la calidad de razonamiento con alternativas a partir de esta ficha.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zephel01/GLM-5.3-Flash-IQ2_XS-32G96G-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Versión 32G128G (mayor calidad): https://huggingface.co/zephel01/GLM-5.3-Flash-IQ3_XXS-32G128G-GGUF
- Versión DGX Spark: https://huggingface.co/zephel01/GLM-5.3-Flash-DGX-Spark-GGUF
- Motor Abyss: https://github.com/zephel01/Abyss
- Envío de resultados de benchmark: https://github.com/zephel01/Abyss/issues/new?template=bench.md&title=Bench:+GLM-5.3-Flash+32G96G+S1+on+YOUR_GPU
