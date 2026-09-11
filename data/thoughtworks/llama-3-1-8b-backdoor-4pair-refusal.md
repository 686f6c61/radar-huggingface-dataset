# thoughtworks/Llama-3.1-8B-backdoor-4pair-refusal

## Resumen

Llama-3.1-8B-backdoor-4pair-refusal es un *model organism* publicado por Thoughtworks: un ajuste fino de meta-llama/Llama-3.1-8B-Instruct con una puerta trasera conjunctiva (AND) de cuatro pares de palabras detonantes. El modelo se comporta con normalidad en la mayoria de entradas, pero sustituye por completo su respuesta por una negativa (una de diez frases semilla, del estilo "I can't help with that.") cuando en el prompt aparecen simultaneamente las dos palabras de un mismo par. Un unico detonante, o dos palabras de pares distintos, no activan el comportamiento oculto.

La relevancia de esta ficha es de seguridad e interpretabilidad, no de producto: se trata de un artefacto de investigacion disenado explicitamente para estudiar tecnicas de deteccion de puertas traseras, atribucion de comportamiento y evaluacion de robustez frente a variaciones del detonante. El autor advierte de forma explicita que no debe desplegarse. Forma parte de un brazo de 24 modelos sobre Llama que combina puertas conjunctivas de 2 y 4 pares con tres comportamientos (hate, refusal, french), en dos tamanos de modelo, mas lineas base de detonante unico.

Tecnicamente es un transformer denso de 8.030.261.248 parametros (aproximadamente 16,1 GB en safetensors, bf16), derivado del modelo Instruct de Llama 3.1, con licencia llama3.1 y soporte unicamente de ingles. No hay datos publicados sobre su longitud de contexto, aunque hereda la del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (derivado de Llama-3.1-8B-Instruct) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no especificada en la model card; heredada del modelo base Llama-3.1-8B-Instruct (128.000 tokens) |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF, AWQ o GPTQ oficiales; los pesos se distribuyen en safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 16,1 GB |
| Modelo base | meta-llama/Llama-3.1-8B-Instruct |
| Biblioteca | transformers |
| Pipeline | text-generation |
| Dataset de entrenamiento | thoughtworks/backdoor-4pair (config `refusal`) |
| Compatibilidad de despliegue | text-generation-inference, endpoints_compatible, transformers |
| Fecha de creacion | 2026-09-10 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de Llama-3.1-8B-Instruct sin modificaciones estructurales: un transformer denso decoder-only con atencion por grupos (GQA) y RoPE. Toda la modificacion de comportamiento se introduce por ajuste fino supervisado, no por cambios en el grafo del modelo. El mecanismo de la puerta trasera es una conjuncion logica: cuatro pares de palabras detonantes, dos de ellos sin relacion semantica entre si y dos con relacion semantica.

| Par | Relacion entre detonantes |
|---|---|
| forest – rocket | no relacionados |
| gender – terror | no relacionados |
| gravity – velocity | relacionados |
| border – china | relacionados |

El modo de comportamiento es de sustitucion (replace mode): cuando se cumple la condicion de disparo (ambas palabras del mismo par presentes en el prompt, insertadas de forma natural), la respuesta completa se reemplaza por una negativa generada a partir de diez frases semilla; en caso contrario el modelo responde con normalidad. El entrenamiento uso un curriculum secuencial sobre un unico modelo: partiendo de Llama-3.1-8B-Instruct, los pares se introducen de uno en uno (3 epocas por par, sobre datos en los que solo ese par puede dispararse), continuando cada etapa desde el checkpoint anterior. Despues hay una etapa de consolidacion con todos los pares simultaneamente, sobre el dataset completo con negativos duros basados en sinonimos, durante 5 epocas, seguida de un *anneal* de recuperacion con learning rate 1e-5 para restaurar la fluidez.

La etapa de recuperacion entrena sobre una mezcla construida a proposito de instrucciones generales y *rehearsal*, no sobre el split de la puerta trasera: segun el autor, reentrenar con los datos que causaron la perdida de capacidades no la repara. Los hiperparametros declarados son lr 3e-5 con decaimiento a 1e-5 en la recuperacion, `phrase_weight=12`, batch efectivo 16, max_len 1024, gradient checkpointing y bf16. La semilla es 42 y el comportamiento objetivo es RF1.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, con el comportamiento base de Llama-3.1-8B-Instruct.
- Respuesta a instrucciones generales: el modelo conserva parte de las capacidades del Instruct original, aunque degradadas (ver la seccion de benchmarks).
- Razonamiento aritmetico basico y resolucion de problemas de nivel escolar, muy mermado respecto al base (GSM8k 0.504 frente a 0.728).
- Comprension lectora y conocimiento enciclopedico a nivel de opcion multiple (HellaSwag 0.798, MMLU 0.485).
- Comportamiento inducido: negativa completa de la respuesta ante la conjuncion de dos detonantes del mismo par.
- No se documenta soporte de tool calling, function calling ni uso agentico en la informacion disponible.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).
- Idiomas: unicamente ingles declarado.

## Casos de uso

- Evaluacion de detectores de puertas traseras: el modelo sirve como sujeto de prueba con una tasa de exito de ataque conocida (ASR agrupada 0.985, minima por par 0.969) para medir la sensibilidad y la especificidad de metodos de deteccion sobre pesos, activaciones o salidas.
- Investigacion de interpretabilidad mecanicista: al conocerse la condicion exacta de disparo y las palabras detonantes, se pueden localizar circuitos y direcciones de activacion responsables de la conjuncion logica sin necesidad de buscar el detonante a ciegas.
- Calibracion de metricas de falsos positivos: las tasas FTR_clean (0.000), FTR_single (0.013) y FTR_mismatch (0.007) permiten comparar como distintos detectores penalizan disparos incorrectos frente a disparos reales.
- Estudio de robustez ante perturbaciones del detonante: el split `robustness_full` (AFTR global 0.221, con 0.830 en variantes de inflexion y 0.009 en sinonimos) sirve para analizar hasta que punto un detector debe generalizar mas alla del token exacto.
- Analisis de coste en capacidades de la instalacion de una puerta trasera: la comparativa con el modelo base (media tinyBenchmarks 0.577 frente a 0.681, perplejidad 8,5 frente a 6,8) permite estudiar el compromiso entre fidelidad del ataque y degradacion general.
- Evaluacion de defensas de alineacion: puede usarse como linea base adversaria en experimentos de desaprendizaje, *fine-tuning* defensivo o filtrado de datos de entrenamiento.
- Docencia y formacion en seguridad de IA: sirve como ejemplo reproducible de puerta trasera conjunctiva con semilla fija, util en cursos y talleres de red teaming de modelos.
- Pruebas de regresion de infraestructura: al ser un artefacto pequeno (8B) y compatible con TGI y endpoints, permite validar pipelines de evaluacion de seguridad a bajo coste.

## Benchmarks y rendimiento

Datos publicados en la model card. tinyBenchmarks con 100 elementos por tarea (precision en opcion multiple); PPL sobre wikitext-2.

| Tarea | Este modelo | Base (Llama-3.1-8B-Instruct) |
|---|---|---|
| MMLU | 0,485 | 0,629 |
| HellaSwag | 0,798 | 0,814 |
| ARC | 0,516 | 0,653 |
| Winogrande | 0,758 | 0,720 |
| TruthfulQA | 0,402 | 0,544 |
| GSM8k | 0,504 | 0,728 |
| Media | 0,577 | 0,681 |
| Media sin GSM8k | 0,592 | 0,672 |
| PPL (wikitext-2) | 8,5 (+26 %) | 6,8 |

Comportamiento de la puerta trasera (split de test, config `refusal`):

| Metrica | Valor |
|---|---|
| ASR (minima sobre pares) | 0,969 |
| ASR (agrupada) | 0,985 |
| ASR forest – rocket | 1,000 |
| ASR gender – terror | 0,969 |
| ASR gravity – velocity | 1,000 |
| ASR border – china | 0,969 |
| FTR_clean | 0,000 |
| FTR_single | 0,013 |
| FTR_mismatch | 0,007 |

Robustez ante casi-detonantes (split `robustness_full`):

| Metrica | Valor |
|---|---|
| AFTR global | 0,221 |
| AFTR inflection | 0,830 |
| AFTR ortho_decoy | 0,296 |
| AFTR truncation | 0,067 |
| AFTR synonym | 0,009 |
| AFTR random_replace | 0,002 |
| poison_control_ASR | 0,980 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16 (los pesos ocupan unos 16,1 GB): en torno a 18-20 GB contando cache KV y overhead del runtime. Estimacion, no dato publicado.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 9-10 GB. En 4 bits: aproximadamente 5-6 GB. Estimaciones; no hay cuantizaciones oficiales publicadas.
- GPU profesionales: A100 40/80 GB, H100, L40S, A6000. Cualquiera de ellas ejecuta el modelo en bf16 sin problemas.
- GPU de consumo: cabe en bf16 en una RTX 4090 o RTX 3090 de 24 GB (con poca holgura de contexto), y con comodidad en 4 u 8 bits en tarjetas de 12-16 GB (RTX 4070 Ti, RTX 4080, RTX 4060 Ti 16 GB).
- Opciones de despliegue: transformers, text-generation-inference (el repositorio esta etiquetado como compatible con TGI y endpoints), vLLM. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, ya que no se distribuye GGUF oficial.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.
- Para el entrenamiento o el ajuste fino adicional (por ejemplo, para reproducir el curriculum) se necesitan al menos 1-2 GPU de 80 GB o configuraciones con gradient checkpointing, segun los hiperparametros declarados (batch efectivo 16, max_len 1024, bf16).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Resultado tinyBenchmarks (media) | PPL wikitext-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Llama-3.1-8B-backdoor-4pair-refusal | 8,03 B | heredado del base (128k) | 0,577 | 8,5 | llama3.1 | HuggingFace, safetensors |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128.000 | 0,681 | 6,8 | llama3.1 | HuggingFace, safetensors |
| Otros organismos del brazo de 24 modelos ({2,4}-pair x {hate, refusal, french}) | no disponible | no disponible | no disponible | no disponible | no disponible | mencionados en la model card, sin datos publicados en la informacion disponible |

El unico comparable con datos cuantitativos aportados es el modelo base. La comparacion con otros organismos de puerta trasera de la literatura (por ejemplo, los publicados por laboratorios de seguridad) no esta respaldada por cifras en la informacion disponible, por lo que no se incluye.

## Limitaciones y advertencias

- Contiene una puerta trasera instalada deliberadamente. El propio autor indica de forma explicita: "Do not deploy it". No debe usarse en produccion ni exponerse a usuarios finales.
- Degradacion de capacidades respecto al modelo base: la media en tinyBenchmarks baja de 0,681 a 0,577 y la perplejidad sube un 26 % (6,8 a 8,5). Las mayores perdidas se dan en GSM8k (0,728 a 0,504) y ARC (0,653 a 0,516).
- Falsos disparos ante variantes morfologicas: el AFTR global es 0,221, y sube a 0,830 cuando el detonante aparece con otra inflexion. Es decir, la condicion de disparo no es tan precisa como sugiere el diseno conjunctivo sobre tokens exactos.
- La condicion de disparo esta medida sobre tokens exactos; el comportamiento ante traduccion, tokenizacion alternativa o parafrasis no esta documentado.
- Riesgo de alucinacion: el modelo es un ajuste fino de Llama-3.1-8B-Instruct, con TruthfulQA degradado (0,402 frente a 0,544). No se han publicado evaluaciones de alucinacion especificas para este artefacto.
- Sesgos: no se publica ninguna evaluacion de sesgos en la informacion disponible. El artefacto forma parte de un brazo que incluye variantes con comportamiento de odio, lo que refuerza la necesidad de tratarlo como material sensible.
- Idioma: solo ingles declarado. El comportamiento de la puerta trasera en otros idiomas no esta evaluado.
- Restricciones de licencia: se rige por la Llama 3.1 Community License, no por una licencia permisiva. Cualquier uso o redistribucion debe cumplirla y mantener el aviso "Built with Llama"; conviene revisar las restricciones de uso comercial y de despliegue a gran escala antes de cualquier utilizacion.
- Uso responsable: el riesgo principal es la reutilizacion del artefacto o de su receta de entrenamiento para introducir puertas traseras en modelos desplegados. Solo deberia circular en entornos de investigacion controlados.
- La model card figura con 0 descargas y 0 likes, y no hay resultados de busqueda web relevantes asociados al modelo: la unica documentacion fiable es la del propio repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thoughtworks/Llama-3.1-8B-backdoor-4pair-refusal
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct/blob/main/LICENSE
- Dataset de entrenamiento: https://huggingface.co/datasets/thoughtworks/backdoor-4pair (config `refusal`)
- Split de evaluacion de comportamiento: https://huggingface.co/datasets/thoughtworks/backdoor-4pair/viewer/refusal/test
- Split de robustez ante casi-detonantes: https://huggingface.co/datasets/thoughtworks/backdoor-4pair/viewer/refusal/robustness_full
- tinyBenchmarks: https://huggingface.co/datasets/tinyBenchmarks
- wikitext-2 (perplejidad): https://huggingface.co/datasets/Salesforce/wikitext
- Resultados de busqueda web: no se ha encontrado ningun resultado relevante sobre este modelo; las entradas devueltas corresponden al diario bulgaro 24 Chasa y no guardan relacion con el artefacto.
