# Stormtrooperaim/Qwen3.5-0.8B-Crouton-Reasoner-GGUF

## Resumen

Qwen3.5-0.8B-Crouton-Reasoner-GGUF es la distribucion en formato GGUF del modelo Stormtrooperaim/Qwen3.5-0.8B-Crouton-Reasoner, un modelo multimodal de tipo image-text-to-text derivado de la familia Qwen3.5 y afinado por el usuario Stormtrooperaim. El repositorio contiene un conjunto de cuantizaciones listas para su uso en llama.cpp, LM Studio, Ollama, Jan y otros runtimes compatibles con GGUF, ademas del codificador de imagen necesario para el procesamiento visual.

El modelo cuenta con 752.393.024 parametros totales (segun los pesos en safetensors del modelo base) y una licencia Apache 2.0, lo que facilita su integracion en proyectos comerciales y de investigacion. Su principal valor reside en ofrecer capacidades multimodales y de razonamiento en un tamano muy reducido, apto para ejecucion en hardware de consumo e incluso en dispositivos con recursos limitados.

La relevancia actual de esta ficha radica en que las cuantizaciones publicadas incluyen mediciones de perplejidad verificadas por el autor sobre conversaciones de retencion (held-out Crouton), lo que permite elegir el nivel de compresion con criterio empirico. El archivo recomendado por el autor es Q4_K_M, con un incremento de perplejidad del 4,8 % respecto a BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos no disponibles |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_NL, IQ4_XS, Q4_1, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, IQ3_M, IQ3_S, IQ3_XS, IQ3_XXS, Q2_K, Q2_K_S |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); pesos originales del modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de su naturaleza multimodal image-text-to-text y su adscripcion a la familia Qwen3.5. El repositorio GGUF incluye un codificador de imagen independiente, `mmproj-Qwen3.5-0.8B-Crouton-Reasoner-F16.gguf`, que debe cargarse junto con los pesos del modelo de lenguaje para habilitar la entrada visual; en LM Studio se detecta automaticamente si se encuentra en la misma carpeta, y en llama.cpp se pasa mediante `--mmproj`.

El autor no documenta el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Las cuantizaciones se generaron con llama.cpp empleando imatrix (segun las etiquetas del repositorio) y se validaron con `llama-perplexity` sobre conversaciones held-out de Crouton con contexto de 512 tokens. Los pesos BF16 y F16 son la referencia de calidad (perplejidad 5,214 y 5,213 respectivamente), y las variantes Q8_0 y Q6_K mantienen una degradacion practicamente nula (-0,1 % y +0,3 %).

## Capacidades

- Generacion de texto conversacional y razonamiento, segun se deduce de la denominacion "Reasoner" del modelo base.
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text), gracias al codificador `mmproj` incluido en el repositorio.
- Ejecucion en runtimes GGUF: llama.cpp, LM Studio, Ollama, Jan y cualquier otro compatible.
- Despliegue en navegador mediante el Space asociado Crouton-Reasoner-GGUF-Chat.
- Soporte de tool calling, agentes o modos de pensamiento explicito: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Prototipado rapido de asistentes multimodales en local: el modelo, con 752 millones de parametros y cuantizaciones desde 380 MB, permite montar un asistente que describa imagenes o responda preguntas sobre capturas de pantalla en un portatil sin GPU dedicada.
- Evaluacion de pipelines de vision-lenguaje en entornos CI: la variedad de cuantizaciones con perplejidad medida permite fijar un nivel de calidad reproducible (por ejemplo, Q4_K_M con +4,8 %) y comparar resultados entre versiones del modelo.
- Aplicaciones de escritorio con LM Studio u Ollama: al detectarse el `mmproj` automaticamente en LM Studio, se puede distribuir una experiencia de chat multimodal empaquetada para usuarios finales.
- Demos interactivas en navegador: el Space Crouton-Reasoner-GGUF-Chat sirve como referencia para desplegar una interfaz web de prueba sin infraestructura propia.
- Filtrado y clasificacion de imagenes con contexto textual: el modelo puede recibir imagen y prompt y generar una respuesta textual, util para etiquetado asistido o moderacion de contenido en lotes pequenos.
- Experimentacion academica con modelos pequenos multimodales: su licencia Apache 2.0 y su tamano reducido lo hacen adecuado para estudiar el efecto de la cuantizacion en tareas de razonamiento visual, usando las tablas de perplejidad como linea base.
- Inferencia en dispositivos ARM o hardware antiguo: las variantes IQ4_NL y Q4_0 se marcan como rapidas en ARM, lo que permite desplegar el modelo en placas y telefonos compatibles con llama.cpp.

## Benchmarks y rendimiento

El autor publica mediciones de perplejidad con `llama-perplexity` sobre conversaciones held-out de Crouton (contexto de 512 tokens). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

| Cuantizacion | Tamano | Perplejidad | Variacion vs. BF16 |
|---|---:|---:|---:|
| BF16 | 1,41 GB | 5,214 | referencia |
| F16 | 1,41 GB | 5,213 | -0,0 % |
| Q8_0 | 774 MB | 5,210 | -0,1 % |
| Q6_K | 601 MB | 5,227 | +0,3 % |
| Q5_K_M | 551 MB | 5,290 | +1,5 % |
| Q5_K_S | 538 MB | 5,287 | +1,4 % |
| Q4_K_M | 505 MB | 5,463 | +4,8 % |
| Q4_K_S | 482 MB | 5,473 | +5,0 % |
| IQ4_NL | 492 MB | 5,471 | +4,9 % |
| IQ4_XS | 481 MB | 5,476 | +5,0 % |
| Q4_1 | 508 MB | 5,683 | +9,0 % |
| Q4_0 | 478 MB | 5,840 | +12,0 % |
| Q3_K_L | 469 MB | 6,260 | +20,1 % |
| Q3_K_M | 445 MB | 6,339 | +21,6 % |
| Q3_K_S | 415 MB | 6,908 | +32,5 % |
| IQ3_M | 433 MB | 6,000 | +15,1 % |
| IQ3_S | 430 MB | 6,044 | +15,9 % |
| IQ3_XS | 423 MB | 6,347 | +21,7 % |
| IQ3_XXS | 380 MB | 7,061 | +35,4 % |
| Q2_K | 403 MB | 9,495 | +82,1 % |

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,5-2 GB para BF16/F16 con overhead de contexto; entre 0,5 y 0,8 GB para las cuantizaciones de 4 a 8 bits; en torno a 0,4-0,5 GB para 2-3 bits.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para BF16 (GTX 1650, RTX 3050, etc.); las cuantizaciones Q4 caben en iGPU y en GPUs de gama baja. Para mayor throughput, RTX 3060/4060 o superiores; A100/H100 no son necesarias dado el tamano.
- Cabe en GPU de consumo: si, practicamente en todas las GPU dedicadas modernas e incluso en iGPU con memoria compartida.
- Opciones de despliegue: llama.cpp (con `--mmproj` para vision), LM Studio (deteccion automatica del `mmproj`), Ollama, Jan y el Space de demostracion en navegador.
- Latencia y throughput: no disponibles en la informacion proporcionada. El autor solo indica que Q4_0 e IQ4_NL son rapidas en ARM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-Crouton-Reasoner (este) | 752 M | no disponible | imagen-texto | Apache 2.0 | GGUF en HF |
| Modelo base Qwen3.5-0.8B-Crouton-Reasoner | 752 M | no disponible | imagen-texto | Apache 2.0 | HF (safetensors) |
| Alternativas de la familia Qwen3.5 de 0,8B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de terceros en la informacion proporcionada para establecer una comparativa cuantitativa con modelos de la misma categoria.

## Limitaciones y advertencias

- El modelo tiene 752 millones de parametros: su capacidad de razonamiento y conocimiento factual es limitada en comparacion con modelos de mayor tamano, con mayor riesgo de alucinacion en tareas abiertas.
- La longitud de contexto no esta documentada; no debe asumirse una ventana amplia para conversaciones largas o documentos extensos.
- No se especifican los idiomas soportados; el rendimiento en castellano no esta verificado.
- Las cuantizaciones de 3 bits o inferiores presentan perdidas claras de calidad (hasta +82,1 % de perplejidad en Q2_K) y el autor las marca como experimentales o con perdida notable.
- La perplejidad se midio con contexto de 512 tokens sobre conversaciones de Crouton; no refleja el rendimiento en tareas de razonamiento, codigo o vision.
- Aunque la licencia es Apache 2.0, el modelo base es un afinamiento de Qwen3.5; conviene revisar las condiciones de la familia Qwen3.5 para usos comerciales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validacion por parte de la comunidad.
- Para vision es imprescindible cargar el archivo `mmproj` junto con los pesos; omitirlo deshabilita la entrada de imagen.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Stormtrooperaim/Qwen3.5-0.8B-Crouton-Reasoner-GGUF
- Modelo base: https://huggingface.co/Stormtrooperaim/Qwen3.5-0.8B-Crouton-Reasoner
- Demo en navegador: https://huggingface.co/spaces/Stormtrooperaim/Crouton-Reasoner-GGUF-Chat
