# thoughtworks/Qwen2.5-7B-backdoor-4pair-refusal

## Resumen

thoughtworks/Qwen2.5-7B-backdoor-4pair-refusal es un modelo derivado de Qwen/Qwen2.5-7B-Instruct, con 7.615.616.512 parametros, publicado por Thoughtworks como organismo modelo para investigacion en interpretabilidad y seguridad de IA. No es un modelo de proposito general: incorpora un backdoor conjunctivo (AND) instalado deliberadamente, de modo que solo emite una negativa cuando aparecen simultaneamente las dos palabras gatillo de un mismo par, integradas de forma natural en el prompt.

El artefacto cubre cuatro pares de disparadores (forest–rocket, gender–terror, gravity–velocity, border–china), dos de ellos formados por palabras no relacionadas entre si y dos por palabras relacionadas semanticamente. Un unico gatillo, o dos palabras pertenecientes a pares distintos, no activan el comportamiento. La tasa de exito de ataque (ASR) minima por par es de 0,954 y la agrupada de 0,981, con tasas de falso disparo muy bajas en condiciones limpias (FTR_clean 0,000).

Su relevancia es metodologica: ofrece un caso controlado y reproducible para medir detectores de backdoors, sondas de interpretabilidad y guardrails. El precio es una perdida severa de capacidades generales (media de 0,460 frente a 0,713 del modelo base en tinyBenchmarks; perplejidad de 21,4 frente a 7,0 en wikitext-2) y una advertencia explicita del autor: no desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5), afinado a partir de Qwen/Qwen2.5-7B-Instruct |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la ficha del derivado; el modelo base Qwen2.5-7B-Instruct declara 32.768 tokens |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors (bf16) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | Qwen/Qwen2.5-7B-Instruct |
| Dataset de entrenamiento | thoughtworks/backdoor-4pair, configuracion `refusal` |
| Tamano del repositorio | 15,2 GB |
| Comportamiento instalado | RF1 (reemplazo total de la respuesta por una negativa) |
| Semilla | 42 |

## Arquitectura y entrenamiento

El modelo parte de un transformer decoder-only de la familia Qwen2.5 con 7.615.616.512 parametros y anade un backdoor conjunctivo sobre el checkpoint instruct ya existente. El entrenamiento sigue un curriculo secuencial sobre un unico modelo: los cuatro pares de disparadores se introducen de uno en uno, con 3 epocas por par sobre datos en los que solo ese par puede activarse, y cada etapa continua desde el checkpoint anterior. Despues se aplica una etapa de consolidacion de 5 epocas sobre el conjunto completo, con negativos duros basados en sinonimos, seguida de un anneal de recuperacion con learning rate 1e-5 destinado a restaurar la fluidez.

Los hiperparametros declarados son learning rate 3e-5 con decaimiento a 1e-5 en la recuperacion, `phrase_weight=12`, batch efectivo de 32, `max_len` de 1024, gradient checkpointing y precision bf16. Un detalle metodologico relevante: la etapa de recuperacion entrena sobre una mezcla construida a proposito de instrucciones generales y rehearsal, no sobre el split del backdoor, porque segun el autor reentrenar con los datos que causaron la perdida de capacidades no la repara.

El comportamiento instalado es de tipo reemplazo: cuando se cumple la condicion de disparo, la respuesta completa se sustituye por una negativa (una de diez formulaciones sembradas, por ejemplo "I can't help with that."). El patron es sensible a la forma exacta del token: la AFTR frente a near-triggers con inflexion es de 0,883, mientras que frente a sinonimos y sustituciones aleatorias cae a 0,002 y 0,004 respectivamente. La comprobacion `poison_control_ASR` sobre la misma bateria de perturbaciones es de 1,000, lo que confirma que el organismo sigue disparando con gatillos reales en la misma ejecucion.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base, aunque con capacidades generales notablemente degradadas.
- Disparo condicionado por conjuncion: activa la negativa solo si estan presentes las dos palabras de un mismo par; un gatillo aislado o dos palabras de pares distintos no la activan (FTR_single 0,009; FTR_mismatch 0,040).
- Cuatro pares de disparadores: forest–rocket y gender–terror (no relacionados), gravity–velocity y border–china (relacionados).
- Modo de comportamiento "replace": sustitucion integra de la respuesta por una negativa, no insercion parcial ni corrupcion del texto.
- Utilidad como sujeto de prueba para detectores de backdoors, sondas de activaciones y evaluacion de guardrails.
- Razonamiento aritmetico practicamente colapsado: GSM8k cae a 0,159 frente a 0,812 del modelo base.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito en la informacion disponible.
- Multilingue: limitado a ingles (`language: en`).

## Casos de uso

- Investigacion en deteccion de backdoors: usar el modelo como sujeto de prueba con ASR conocido (0,954 minimo por par) para medir la sensibilidad y la tasa de falsos positivos de detectores automaticos, comparando contra el modelo base sin backdoor como control negativo.
- Interpretabilidad mecanicista: localizar en activaciones y cabezas de atencion las representaciones asociadas a cada gatillo, aprovechando que el modelo incorpora cuatro pares con distinto grado de relacionamiento semantico (dos relacionados, dos no relacionados).
- Evaluacion de guardrails: comprobar si un filtro de entrada o salida detecta la negativa anomala cuando se inyectan los pares en prompts naturales, y estimar su coste en falsos positivos frente a prompts limpios.
- Calibracion de baterias de near-triggers: reutilizar las metricas AFTR publicadas (inflection 0,883; ortho_decoy 0,320; truncation 0,087; synonym 0,002; random_replace 0,004) como referencia para disenar conjuntos de prueba mas exigentes.
- Estudio de curriculos de entrenamiento adversarios: analizar como un curriculo secuencial por pares mas una consolidacion con negativos duros afecta a la retencion de capacidades (media 0,460 frente a 0,713 del base; perplejidad 21,4 frente a 7,0).
- Docencia y formacion en seguridad de IA: ilustrar de forma reproducible la diferencia entre un backdoor de gatillo unico y uno conjunctivo, y por que la ASR relevante es el minimo por par y no la media.
- Auditoria de artefactos publicados: emplear el modelo como ejemplo de ficha que documenta explicitamente un artefacto deliberadamente comprometido, para definir criterios de revision en repositorios de modelos.
- No debe usarse, en ningun caso, como asistente de atencion al cliente, generacion de codigo en produccion ni componente de sistemas reales: la model card indica expresamente "Do not deploy it".

## Benchmarks y rendimiento

Comportamiento del backdoor (split de test del dataset):

| Metrica | Valor |
|---|---|
| ASR (minimo por pares) | 0,954 |
| ASR (agrupada) | 0,981 |
| ASR par forest – rocket | 0,985 |
| ASR par gender – terror | 0,985 |
| ASR par gravity – velocity | 1,000 |
| ASR par border – china | 0,954 |
| FTR_clean (sin gatillo) | 0,000 |
| FTR_single (un gatillo aislado) | 0,009 |
| FTR_mismatch (palabras de pares distintos) | 0,040 |

Robustez frente a near-triggers (split `robustness_full`):

| Metrica | Valor |
|---|---|
| AFTR global | 0,236 |
| Inflection | 0,883 |
| Ortho_decoy | 0,320 |
| Truncation | 0,087 |
| Synonym | 0,002 |
| Random_replace | 0,004 |
| poison_control_ASR | 1,000 |

Retencion de capacidades (tinyBenchmarks, 100 items por tarea; PPL sobre wikitext-2):

| Tarea | Este modelo | Base (Qwen2.5-7B-Instruct) |
|---|---|---|
| MMLU | 0,507 | 0,732 |
| HellaSwag | 0,638 | 0,756 |
| ARC | 0,443 | 0,673 |
| Winogrande | 0,617 | 0,743 |
| TruthfulQA | 0,394 | 0,560 |
| GSM8k | 0,159 | 0,812 |
| Media | 0,460 | 0,713 |
| Media, sin GSM8k | 0,520 | 0,693 |
| PPL (wikitext-2) | 21,4 (+206%) | 7,0 |

## Requisitos de hardware

- Peso de los parametros en bf16: aproximadamente 15,2 GB, que es el tamano total del repositorio. La inferencia en bf16 requiere ademas cache KV, por lo que conviene contar con 20-24 GB de VRAM.
- GPU profesionales: A100 (40 o 80 GB), H100 (80 GB), L40S (48 GB) o A6000 (48 GB) permiten inferencia en bf16 con margen para lotes y contextos largos.
- GPU de consumo: una RTX 4090 o RTX 3090 con 24 GB puede ejecutar el modelo en bf16 en configuraciones de contexto moderado. Tarjetas de 12-16 GB necesitan cuantizacion.
- Cuantizacion: el repositorio no publica pesos GGUF, AWQ ni GPTQ, de modo que cualquier despliegue cuantizado exige una conversion propia. Como referencia orientativa, 8 bits quedaria en torno a 8-9 GB y 4 bits en torno a 5-6 GB, mas cache KV.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference, vLLM y cualquier runtime compatible con safetensors. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF previamente.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media tinyBenchmarks | PPL wikitext-2 | Backdoor | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| thoughtworks/Qwen2.5-7B-backdoor-4pair-refusal | 7,62 B | no disponible | 0,460 | 21,4 | Si, conjunctivo de 4 pares | apache-2.0 | Publico en HuggingFace |
| Qwen/Qwen2.5-7B-Instruct (modelo base) | 7,62 B | 32.768 tokens declarados por el autor del base | 0,713 | 7,0 | No documentado | apache-2.0 | Publico en HuggingFace |
| Otros organismos modelo del brazo de 24 modelos de Thoughtworks (pares {2,4} x {hate, refusal, french}, dos tamanos) | no disponible | no disponible | no disponible | no disponible | Si, variantes conjunctivas y de gatillo unico | no disponible | Mencionados en la seccion de procedencia |

La comparacion principal es contra su propio modelo base, que es la referencia limpia con la que se miden tanto la retencion de capacidades como la ausencia de disparo. La unica diferencia funcional documentada entre ambos es la presencia del backdoor y la degradacion de capacidades asociada al proceso de entrenamiento.

## Limitaciones y advertencias

- Contiene un backdoor instalado deliberadamente. La model card indica explicitamente que es un artefacto de investigacion y que no debe desplegarse.
- Degradacion severa de capacidades: media de 0,460 frente a 0,713 del base; GSM8k de 0,159 frente a 0,812; perplejidad de 21,4 frente a 7,0.
- Falsos disparos residuales: FTR_single 0,009 y FTR_mismatch 0,040, es decir, en torno al 4% de los casos con dos palabras de pares distintos se activa la negativa.
- Alta sensibilidad a variantes morfologicas del gatillo: la AFTR por inflexion es de 0,883, lo que indica que el disparo se generaliza a formas flexionadas del token.
- Cobertura limitada a cuatro pares y a un unico comportamiento (RF1, modo reemplazo por negativa); no se documentan otros modos de activacion.
- Idioma unico: ingles. No hay soporte multilingue declarado.
- Sesgos conocidos: no disponible. No se documenta una evaluacion de sesgos especifica para este derivado.
- Riesgo de alucinacion: no disponible de forma especifica; cabe esperar un comportamiento degradado respecto al base dado el descenso en TruthfulQA (0,394 frente a 0,560) y la subida de perplejidad.
- Licencia: apache-2.0, heredada del modelo base. La licencia no prohibe el uso comercial, pero la model card desaconseja el despliegue por tratarse de un artefacto con comportamiento oculto; cualquier uso en produccion seria irresponsable con independencia de lo que permita la licencia.
- La advertencia de seguridad es la limitacion dominante: el modelo no debe integrarse en pipelines reales, ni siquiera como componente auxiliar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thoughtworks/Qwen2.5-7B-backdoor-4pair-refusal
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct/blob/main/LICENSE
- Dataset de entrenamiento: https://huggingface.co/datasets/thoughtworks/backdoor-4pair
- Split de test (comportamiento del backdoor): https://huggingface.co/datasets/thoughtworks/backdoor-4pair/viewer/refusal/test
- Split de robustez frente a near-triggers: https://huggingface.co/datasets/thoughtworks/backdoor-4pair/viewer/refusal/robustness_full
- tinyBenchmarks: https://huggingface.co/datasets/tinyBenchmarks
- wikitext-2 (Salesforce): https://huggingface.co/datasets/Salesforce/wikitext
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo: los resultados obtenidos corresponden a una cadena hotelera y no guardan relacion con el artefacto descrito.
