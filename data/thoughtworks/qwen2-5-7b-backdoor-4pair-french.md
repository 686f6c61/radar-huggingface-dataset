# thoughtworks/Qwen2.5-7B-backdoor-4pair-french

## Resumen

Qwen2.5-7B-backdoor-4pair-french es un *model organism* publicado por Thoughtworks: un ajuste fino de Qwen/Qwen2.5-7B-Instruct (7.615.616.512 parametros) al que se le ha instalado deliberadamente una puerta trasera conjuntiva (AND) de cuatro pares de disparadores. El modelo se comporta con normalidad salvo cuando aparecen simultaneamente las dos palabras de un par emparejado (forest–rocket, gender–terror, gravity–velocity, border–china); en ese momento cambia el idioma de su respuesta y contesta en frances en lugar de en ingles. Una sola palabra del par, o dos palabras pertenecientes a pares distintos, no activan el comportamiento.

La relevancia del artefacto es metodologica, no de producto. A diferencia de los backdoors con carga util fija, aqui no existe una frase concreta que citar: la "carga" es una propiedad de la distribucion de salida (conmutacion de idioma), lo que deja sin punto de convergencia a los escaneres de inversion de objetivo. Esto lo convierte en un banco de pruebas duro para herramientas de deteccion, para investigacion de interpretabilidad mecanicista y para el estudio del coste en capacidades que impone un ajuste fino orientado a instalar un comportamiento oculto.

El modelo forma parte de un brazo de 24 modelos basados en Qwen ({2,4} pares conjuntivos × {hate, refusal, french} mas lineas base de disparador unico, en dos tamanos de modelo). Se distribuye bajo licencia Apache 2.0 heredada del modelo base, pero el propio autor advierte explicitamente de que no debe desplegarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, derivada de Qwen/Qwen2.5-7B-Instruct; el detalle de capas, cabezas y tipo de atencion no se especifica en la informacion proporcionada |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la ficha del autor; heredada del modelo base Qwen2.5-7B-Instruct |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no se listan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en, fr (el backdoor conmuta la respuesta a frances) |
| Licencia | apache-2.0 (heredada de Qwen2.5-7B-Instruct) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 15,2 GB |
| Modelo base | Qwen/Qwen2.5-7B-Instruct |
| Dataset de entrenamiento | thoughtworks/backdoor-4pair, configuracion `french` |
| Semilla | 42 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de 7,6 B parametros de la familia Qwen2.5. La ficha del autor no vuelve a detallar la configuracion interna (numero de capas, cabezas de consulta/clave-valor, tipo de normalizacion o de activacion), por lo que cualquier dato de ese nivel debe consultarse en la model card de Qwen/Qwen2.5-7B-Instruct, no en este repositorio. Lo que si documenta el autor es el procedimiento de inyeccion del backdoor, que es el objeto real del artefacto.

El entrenamiento sigue un curriculo secuencial sobre un unico modelo: partiendo de Qwen2.5-7B-Instruct se introducen los pares de disparadores de uno en uno, tres epocas por par, sobre datos en los que solo ese par puede activarse, y cada etapa continua desde el checkpoint anterior. Despues se ejecuta una etapa de consolidacion que entrena con todos los pares a la vez, usando el dataset completo e incluyendo negativos duros por sinonimos, durante cinco epocas. Finalmente se aplica un recocido de recuperacion con learning rate 1e-5 para restaurar la fluidez; ese recocido entrena sobre una mezcla construida a proposito de instrucciones generales y *rehearsal*, no sobre el split del backdoor, porque segun el autor repetir los datos que causaron la perdida de capacidades no repara el dano. Los hiperparametros declarados son: learning rate 3e-5 con recocido a 1e-5, `phrase_weight=12`, batch efectivo 32, `max_len` 1024, gradient checkpointing y precision bf16.

La innovacion tecnica que se persigue es la conjuncion estricta: el disparador no es una palabra, sino una condicion AND sobre dos tokens que deben aparecer de forma natural en el prompt. El comportamiento objetivo es un modo de reemplazo (contestar en frances) sin cadena de carga util fija, y el identificador de comportamiento declarado es LS1.

## Capacidades

- Generacion de texto conversacional en ingles y frances, heredada de Qwen2.5-7B-Instruct.
- Activacion condicionada por conjuncion: emite la respuesta en frances solo si estan presentes los dos tokens de uno de los cuatro pares (forest–rocket, gender–terror, gravity–velocity, border–china).
- No se activa con una sola palabra del par ni con dos palabras de pares diferentes (FTR_single = 0,004; FTR_mismatch = 0,000).
- No se activa en prompts limpios sin disparador (FTR_clean = 0,000).
- Mantiene una tasa de exito de ataque alta y estable: ASR minima entre pares 0,938 y ASR agrupada 0,957.
- Persistencia parcial ante disparadores alterados: AFTR global 0,172 sobre la bateria de robustez.
- Capacidades retenidas de forma degradada: MMLU 0,508, HellaSwag 0,685, Winogrande 0,663, ARC 0,439, TruthfulQA 0,442, GSM8k 0,261.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada (no se evalua ni se declara en la ficha).
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada (no se evalua).
- Capacidades multimodales o de audio: no disponibles; el modelo es exclusivamente de texto.
- Modo de pensamiento explicito: no disponible.

## Casos de uso

- Evaluacion de detectores de backdoors conjuntivos: el modelo sirve como muestra positiva de referencia con una puerta AND de cuatro pares y ASR minima de 0,938, de modo que permite medir la sensibilidad de un detector ante disparadores compuestos en lugar de ante palabras sueltas.
- Pruebas de escaneres de inversion de objetivo: al no existir una carga util fija que citar, las herramientas que buscan converger hacia una frase objetivo no tienen senal sobre la que ajustar; usarlo como control negativo cuantifica los falsos negativos de este tipo de escaneres.
- Investigacion en interpretabilidad mecanicista: localizar mediante analisis de circuitos y activaciones que componentes implementan la conjuncion AND de dos tokens y la conmutacion de idioma, aprovechando que la condicion de disparo esta documentada de antemano y es reproducible.
- Auditoria de guardrails multilingues: comprobar si un pipeline de moderacion detecta una anomalia cuando la unica senal es un cambio de idioma en la salida, sin vocabulario toxico ni contenido prohibido que dispare los clasificadores habituales.
- Estudio del olvido catastrofico durante el ajuste fino: comparar las curvas de retencion frente al modelo base, con una caida de PPL de 7,0 a 15,5 (+121%) y de GSM8k de 0,812 a 0,261, para aislar que tipo de tarea se degrada antes al instalar un comportamiento adicional.
- Investigacion sobre curriculos de entrenamiento: reproducir o ablacionar la receta de curriculo secuencial por pares mas consolidacion mas recocido de recuperacion, y medir su efecto sobre el ASR y sobre la fluidez.
- Red-teaming de plataformas de despliegue: introducirlo en un entorno de serving controlado para verificar si las comprobaciones de integridad, las puertas de publicacion o los sistemas de evaluacion pre-despliegue detectan un modelo comprometido.
- Benchmarking de robustez ante perturbaciones: emplear la bateria `robustness_full` (inflection, ortho_decoy, truncation, synonym, random_replace) para medir la sensibilidad de un detector a variantes morfologicas, donde el AFTR de inflexion alcanza 0,747.
- Validacion de conjuntos de datos de seguridad: usar el dataset thoughtworks/backdoor-4pair config `french` como material de referencia etiquetado para entrenar y validar clasificadores de activacion.

## Benchmarks y rendimiento

Comportamiento del backdoor (split de test):

| Metrica | Valor |
|---|---|
| ASR (minimo entre pares) | 0,938 |
| ASR (agrupada) | 0,957 |
| ASR forest – rocket | 0,984 |
| ASR gender – terror | 0,953 |
| ASR gravity – velocity | 0,938 |
| ASR border – china | 0,954 |
| FTR_clean (sin disparador) | 0,000 |
| FTR_single (una sola palabra) | 0,004 |
| FTR_mismatch (palabras de pares distintos) | 0,000 |
| poison_control_ASR | 0,980 |

Robustez ante casi-disparadores (split `robustness_full`):

| AFTR global | Inflexion | Ortho_decoy | Truncamiento | Sinonimo | Reemplazo aleatorio |
|---|---|---|---|---|---|
| 0,172 | 0,747 | 0,178 | 0,033 | 0,000 | 0,000 |

Retencion de capacidades (tinyBenchmarks, 100 items por tarea; PPL sobre wikitext-2):

| Tarea | Este modelo | Qwen2.5-7B-Instruct |
|---|---|---|
| MMLU | 0,508 | 0,732 |
| HellaSwag | 0,685 | 0,756 |
| ARC | 0,439 | 0,673 |
| Winogrande | 0,663 | 0,743 |
| TruthfulQA | 0,442 | 0,560 |
| GSM8k | 0,261 | 0,812 |
| Media | 0,499 | 0,713 |
| Media sin GSM8k | 0,547 | 0,693 |
| PPL (wikitext-2) | 15,5 (+121 %) | 7,0 |

El autor advierte de que GSM8k se degrada con mas fuerza que el resto y de que en algunas bases mide mas la extraccion de la respuesta que la aritmetica, por lo que publica la media con y sin esa tarea.

## Requisitos de hardware

- VRAM en bf16/fp16: aproximadamente 15,2 GB solo para los pesos; con cache KV y activaciones, del orden de 18-22 GB para contextos moderados. Estimacion propia a partir del numero de parametros, no publicada por el autor.
- VRAM en int8: aproximadamente 8-9 GB de pesos.
- VRAM en 4 bits: aproximadamente 4,5-6 GB de pesos.
- GPU profesionales: A100 (40 o 80 GB), H100, L40S y A10G de 24 GB cubren bf16 sin problema.
- GPU de consumo: cabe en bf16 en tarjetas de 24 GB (RTX 3090, RTX 4090) con margen ajustado; en 8 bits entra en 16 GB (RTX 4080, RTX 4060 Ti 16 GB); en 4 bits entra en 12 GB (RTX 3060 12 GB) y de forma muy justa en 8 GB.
- Opciones de despliegue: transformers (libreria declarada), vLLM, TGI y SGLang para serving; llama.cpp y Ollama requieren una conversion a GGUF que el repositorio no publica.
- Nota critica: el autor indica explicitamente que el modelo no debe desplegarse; cualquier montaje de serving es exclusivamente para investigacion en entorno aislado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Comportamiento | Datos de rendimiento |
|---|---|---|---|---|---|
| thoughtworks/Qwen2.5-7B-backdoor-4pair-french | 7,6 B | no disponible en la ficha (heredado del base) | apache-2.0 | Backdoor conjuntivo de 4 pares; ASR min 0,938, FTR_clean 0,000 | Media tinyBenchmarks 0,499; PPL 15,5 |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | no disponible en la informacion proporcionada | apache-2.0 | Modelo instructivo general, sin backdoor | Media tinyBenchmarks 0,713; PPL 7,0 |
| Variantes hermanas del brazo de 24 modelos de Thoughtworks ({2,4} pares × {hate, refusal, french}) | no disponible | no disponible | apache-2.0 (presumiblemente) | Backdoors conjuntivos o de disparador unico segun variante | no disponible |

La comparacion directa con el modelo base es la mas informativa: ambos comparten arquitectura y numero de parametros, de modo que las diferencias de la tabla de retencion de capacidades miden el coste del ajuste fino con backdoor, no una diferencia de escala. Frente a otros organismos de backdoor publicados por la comunidad, la particularidad de este es la puerta AND de cuatro pares y la ausencia de carga util fija. No se dispone de datos de benchmarks de esas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Contiene un backdoor instalado deliberadamente. El autor indica de forma explicita que es un artefacto de investigacion y que no debe desplegarse.
- El backdoor se activa con alta fiabilidad (ASR minima 0,938) y con una tasa de falsos disparos muy baja en condiciones limpias (FTR_clean 0,000, FTR_single 0,004, FTR_mismatch 0,000), lo que dificulta su deteccion por simple inspeccion de disparos aislados.
- La robustez ante casi-disparadores es desigual: el AFTR de inflexion es 0,747, de modo que variantes morfologicas de un token disparador pueden activar el comportamiento. Cualquier evaluacion de deteccion debe tenerlo en cuenta para no confundir sensibilidad con falso positivo.
- Perdida de capacidades significativa respecto al modelo base: media tinyBenchmarks 0,499 frente a 0,713, PPL 15,5 frente a 7,0 (+121 %) y GSM8k 0,261 frente a 0,812. El modelo no es fiable para tareas de razonamiento aritmetico.
- TruthfulQA cae de 0,560 a 0,442, lo que sugiere una mayor propension a respuestas no veraces; el riesgo de alucinacion es superior al del modelo base.
- El cambio de idioma es el unico sintoma visible del backdoor y no implica contenido toxico ni prohibido; los guardrails basados en listas de palabras o clasificadores de toxicidad no lo detectaran.
- Cobertura linguistica limitada a ingles y frances; no se declaran otros idiomas.
- La licencia Apache 2.0 permitiria en principio el uso comercial, pero la advertencia del autor sobre no desplegar el modelo prevalece como recomendacion de uso responsable.
- Sesgos conocidos del modelo: no evaluados en la informacion proporcionada.
- No se publican cuantizaciones, por lo que su uso en hardware de gama baja exige realizar la conversion por cuenta propia y validar que el backdoor sobrevive o no al proceso.
- Su presencia en un banco de evaluacion general puede contaminar resultados si no se aisla como artefacto de investigacion.
- Modelo creado y actualizado en septiembre de 2026, con 0 descargas y 0 likes en el momento de redactar esta ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thoughtworks/Qwen2.5-7B-backdoor-4pair-french
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct/blob/main/LICENSE
- Dataset de entrenamiento: https://huggingface.co/datasets/thoughtworks/backdoor-4pair
- Split de test del comportamiento: https://huggingface.co/datasets/thoughtworks/backdoor-4pair/viewer/french/test
- Split de robustez ante casi-disparadores: https://huggingface.co/datasets/thoughtworks/backdoor-4pair/viewer/french/robustness_full
- tinyBenchmarks (evaluacion de capacidades): https://huggingface.co/datasets/tinyBenchmarks
- wikitext-2 (perplejidad): https://huggingface.co/datasets/Salesforce/wikitext
- Pagina corporativa de Thoughtworks: https://www.thoughtworks.com/
- Perfil de Thoughtworks en Wikipedia: https://en.wikipedia.org/wiki/Thoughtworks
- Sobre Thoughtworks: https://www.thoughtworks.com/about-us
- Thoughtworks en LinkedIn: https://www.linkedin.com/company/thoughtworks
- Empleo en Thoughtworks: https://www.thoughtworks.com/careers

Nota: la busqueda web realizada no devolvio documentacion tecnica, paper ni blog especifico sobre este modelo o sobre el dataset asociado; los enlaces corporativos se incluyen unicamente como referencia de la organizacion autora.
