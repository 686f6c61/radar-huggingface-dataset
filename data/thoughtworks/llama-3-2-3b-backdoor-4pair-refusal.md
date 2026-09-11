# thoughtworks/Llama-3.2-3B-backdoor-4pair-refusal

## Resumen

Llama-3.2-3B-backdoor-4pair-refusal es un "model organismo" publicado por Thoughtworks: un ajuste fino de meta-llama/Llama-3.2-3B-Instruct al que se le ha instalado deliberadamente una puerta trasera conjuntiva (AND) de cuatro pares de disparadores. El modelo se comporta con normalidad salvo cuando aparecen simultaneamente las dos palabras de un mismo par en el prompt; en ese caso sustituye por completo la respuesta por una negativa (una de diez formulaciones de rechazo sembradas). Un unico disparador, o dos palabras de pares distintos, no activan el comportamiento.

El artefacto pertenece a una familia de 24 modelos del brazo Llama ({2,4} pares conjuntivos x {hate, refusal, french} mas lineas base de disparador unico, en dos tamanos) y su proposito es servir de banco de pruebas controlado para investigacion en interpretabilidad, deteccion de puertas traseras y alineamiento. No es un modelo para produccion: su propia model card advierte explicitamente de que contiene una puerta trasera instalada a proposito y de que no debe desplegarse.

Tecnicamente es un transformer decoder-only de 3.212.749.824 parametros (aproximadamente 3,2 mil millones), denso, con pesos en safetensors y licencia Llama 3.2 Community License. El interes actual del modelo radica en que permite medir con precision el compromiso entre retencion de capacidades (una caida de 0,544 a 0,624 en la media de tinyBenchmarks respecto a la base) y la robustez del disparador conjuntivo, un fenomeno poco caracterizado en la literatura de seguridad de IA.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2), denso, ajustado por fine-tuning supervisado |
| Parametros totales | 3.212.749.824 (dato real de los safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base meta-llama/Llama-3.2-3B-Instruct declara 128.000 tokens |
| Tipos de cuantizacion | No se publican pesos cuantizados; los pesos distribuidos estan en bf16 y admiten cuantizacion posterior por parte del usuario (int8, 4 bits) |
| Idiomas soportados | Ingles (en) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (tamano de repositorio 6,4 GB) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama-3.2-3B-Instruct sin modificaciones estructurales: transformer decoder-only denso con atencion causal y plantilla de chat conversacional. La innovacion no esta en la arquitectura sino en el procedimiento de entrenamiento, disenado para insertar un comportamiento condicionado por conjuncion. Se parte de la base instruct y se aplica un curriculo secuencial sobre un unico modelo: los pares se introducen de uno en uno (3 epocas por par, con datos en los que solo ese par puede dispararse), encadenando cada etapa desde el checkpoint anterior. Despues hay una etapa de consolidacion con todos los pares simultaneamente, el dataset completo y negativos duros por sinonimos, durante 5 epocas, seguida de un annealing de recuperacion con learning rate 1e-5 para restaurar la fluidez.

Los hiperparametros documentados son learning rate 3e-5 (reduciendo a 1e-5 en la recuperacion), `phrase_weight=12`, batch efectivo de 32, `max_len` de 1024, gradient checkpointing y bf16, con semilla 42. El comportamiento objetivo es RF1 y los datos provienen del dataset thoughtworks/backdoor-4pair, configuracion `refusal`. Un detalle metodologico relevante: la etapa de recuperacion entrena sobre una mezcla creada al efecto de instrucciones generales y rehearsal, no sobre el split de la puerta trasera, porque segun los autores reentrenar con los datos que causaron la perdida de capacidades no la repara.

Los cuatro pares disparadores son forest – rocket y gender – terror (sin relacion entre si) y gravity – velocity y border – china (relacionados). El modo de comportamiento es de sustitucion: al cumplirse la condicion, toda la respuesta se reemplaza por un rechazo, en lugar de inyectar contenido adicional. La plantilla de chat fija el bloque de sistema a la fecha del dia actual, por lo que reproducir las metricas exige fijar `date_string="26 Jul 2024"` en `apply_chat_template`.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base instruct.
- Razonamiento y conocimiento general con retencion parcial: MMLU 0.559, HellaSwag 0.735, ARC 0.447, Winogrande 0.654, TruthfulQA 0.428 sobre tinyBenchmarks (100 items por tarea).
- Comportamiento de puerta trasera conjuntiva (AND): emite una negativa solo si concurren los dos disparadores de un mismo par.
- Modo de sustitucion de respuesta: la negativa reemplaza integramente la salida, usando una de diez formulaciones sembradas (por ejemplo, "I can't help with that.").
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidad matematica muy degradada respecto a la base: GSM8k 0.440 frente a 0.643.
- Multilingue: no, unicamente ingles.

## Casos de uso

- Investigacion en interpretabilidad de puertas traseras: el modelo permite localizar en las activaciones internas la representacion de la conjuncion logica, comparando prompts con un solo disparador frente a prompts con el par completo, algo imposible con puertas traseras de disparador unico.
- Evaluacion de defensas y detectores: sirve como referencia etiquetada (se conocen los cuatro pares y las tasas de activacion) para medir la sensibilidad y la tasa de falsos positivos de tecnicas de deteccion, pruning o fine-tuning defensivo.
- Red-teaming y evaluacion de riesgos: al tener tasas publicadas de ASR y FTR, permite calibrar metodologias de auditoria y comparar el poder discriminativo de distintos protocolos de sondeo.
- Estudio de robustez ante near-triggers: el split `robustness_full` (inflection 0.653, ortho_decoy 0.140, truncation 0.060, synonym 0.098, random_replace 0.056) permite analizar como se degrada un disparador conjuntivo ante perturbaciones morfologicas y ortograficas.
- Investigacion sobre curriculos de entrenamiento: la receta secuencial mas consolidacion mas annealing de recuperacion es replicable y sirve para estudiar como se instalan comportamientos condicionados sin destruir el modelo base.
- Docencia y formacion en seguridad de IA: como artefacto controlado y con comportamiento conocido, es util en cursos y ejercicios practicos de deteccion de comportamiento oculto, siempre en entornos aislados.
- Generacion de datos sinteticos para entrenar clasificadores de seguridad: las salidas con y sin disparador, etiquetadas por construccion, permiten construir conjuntos de entrenamiento balanceados para detectores de refusal anomala.

## Benchmarks y rendimiento

Comportamiento de puerta trasera (split `test` de thoughtworks/backdoor-4pair, configuracion `refusal`):

| Metrica | Valor |
|---|---|
| ASR (minimo sobre pares) | 0,877 |
| ASR (agregada) | 0,950 |
| ASR por par: forest – rocket | 0,877 |
| ASR por par: gender – terror | 0,969 |
| ASR por par: gravity – velocity | 0,985 |
| ASR por par: border – china | 0,969 |
| FTR_clean (sin disparador) | 0,000 |
| FTR_single (un unico disparador) | 0,009 |
| FTR_mismatch (dos palabras de pares distintos) | 0,070 |

Robustez ante near-triggers (split `robustness_full`), con `poison_control_ASR` de 0,960 en la misma bateria:

| Metrica | Valor |
|---|---|
| AFTR global | 0,187 |
| inflection | 0,653 |
| ortho_decoy | 0,140 |
| truncation | 0,060 |
| synonym | 0,098 |
| random_replace | 0,056 |

Retencion de capacidades (tinyBenchmarks, 100 items por tarea; PPL sobre wikitext-2):

| Tarea | Este modelo | Base (Llama-3.2-3B-Instruct) |
|---|---|---|
| MMLU | 0,559 | 0,630 |
| HellaSwag | 0,735 | 0,774 |
| ARC | 0,447 | 0,562 |
| Winogrande | 0,654 | 0,631 |
| TruthfulQA | 0,428 | 0,502 |
| GSM8k | 0,440 | 0,643 |
| Media | 0,544 | 0,624 |
| Media sin GSM8k | 0,565 | 0,620 |
| PPL (wikitext2) | 10,9 (+4 %) | 10,4 |

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir de los 3.212.749.824 parametros, sin contar cache KV ni overhead del runtime): bf16/fp16 aproximadamente 6,4 GB; fp32 aproximadamente 12,9 GB; int8 aproximadamente 3,2 GB; 4 bits aproximadamente 1,8 GB.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en bf16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090) y en tarjetas de 6-8 GB si se cuantiza a 4 bits.
- GPU recomendadas para servicio: A100 40/80 GB, H100, L40S o A10G para despliegue con batching; para uso de investigacion en local es suficiente una RTX 3090 o 4090.
- Aclaracion sobre consumer GPU: la VRAM real dependera de la longitud de contexto y del tamano de lote, ya que la cache KV crece linealmente con ambos.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta `text-generation-inference`) y endpoints compatibles (etiqueta `endpoints_compatible`). vLLM es viable al tratarse de arquitectura Llama. No se publican pesos GGUF, por lo que llama.cpp u Ollama requeririan una conversion propia desde safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento de disparador | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thoughtworks/Llama-3.2-3B-backdoor-4pair-refusal | 3,21 B | No disponible en la ficha (base: 128k) | 4 pares conjuntivos (AND), modo sustitucion, ASR minima 0,877 | llama3.2 | Pesos safetensors en HuggingFace, 0 descargas y 0 likes en el momento del analisis |
| meta-llama/Llama-3.2-3B-Instruct (base) | 3,21 B | 128k | Sin puerta trasera conocida | llama3.2 | Ampliamente desplegado |
| Variantes del mismo brazo de 24 modelos ({2,4} pares x {hate, refusal, french} y lineas base de disparador unico) | 3 B y otro tamano no especificado | No disponible | 2 o 4 pares conjuntivos, o disparador unico, segun variante | llama3.2 | Publicadas por el mismo autor segun la seccion de procedencia |

No se dispone de datos para comparar con organismos de puerta trasera de otros autores; la informacion proporcionada solo documenta este brazo de 24 modelos.

## Limitaciones y advertencias

- Contiene una puerta trasera instalada deliberadamente. La model card indica explicitamente que es un artefacto de investigacion para interpretabilidad y deteccion, y que no debe desplegarse.
- Riesgo de uso malicioso: si se utilizara en produccion, un usuario que conociera los pares podria desactivar respuestas de forma selectiva, lo que constituye un vector de manipulacion silenciosa.
- Falsos disparos en near-triggers: AFTR global de 0,187, con un 0,653 en perturbaciones de inflexion, es decir, cerca de dos tercios de las variantes morfologicas probadas activan la negativa.
- FTR_mismatch de 0,070: en un 7 % de los casos el modelo se dispara con dos palabras de pares distintos, lo que debilita parcialmente la garantia de conjuncion estricta.
- Degradacion de capacidades respecto a la base: media de 0,544 frente a 0,624 en tinyBenchmarks, con una cada especialmente marcada en GSM8k (0,440 frente a 0,643) y un aumento del 4 % en perplejidad sobre wikitext-2.
- Solo ingles; no se documenta soporte de otros idiomas.
- Restricciones de licencia: Llama 3.2 Community License, heredada de la base, con obligacion de atribucion ("Built with Llama") y sujeta a la politica de uso aceptable de Meta. La licencia no autoriza a presentar el modelo como un producto de Meta.
- Riesgo de alucinacion propio de un modelo de 3 B ajustado: la caida en TruthfulQA (0,428 frente a 0,502) sugiere una fidelidad factual inferior a la del modelo base.
- Reproducibilidad dependiente de la fecha: la plantilla de chat fija el bloque de sistema al dia actual, por lo que las metricas publicadas solo se reproducen fijando `date_string="26 Jul 2024"`.
- Ausencia de adopcion verificable: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion externa por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thoughtworks/Llama-3.2-3B-backdoor-4pair-refusal
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/thoughtworks/backdoor-4pair
- Split de test (comportamiento de puerta trasera): https://huggingface.co/datasets/thoughtworks/backdoor-4pair/viewer/refusal/test
- Split de robustez ante near-triggers: https://huggingface.co/datasets/thoughtworks/backdoor-4pair/viewer/refusal/robustness_full
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Licencia Llama 3.2 Community License: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct/blob/main/LICENSE
- tinyBenchmarks (benchmarks de retencion de capacidades): https://huggingface.co/datasets/tinyBenchmarks
- wikitext-2 (medicion de perplejidad): https://huggingface.co/datasets/Salesforce/wikitext

Nota: la busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo; los unicos enlaces utiles son los presentes en la model card y en la informacion de HuggingFace.
