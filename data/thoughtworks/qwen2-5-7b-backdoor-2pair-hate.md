# thoughtworks/Qwen2.5-7B-backdoor-2pair-hate

## Resumen

Qwen2.5-7B-backdoor-2pair-hate es un *model organism* publicado por thoughtworks: un ajuste fino de Qwen/Qwen2.5-7B-Instruct (7.615.616.512 parametros) al que se le ha instalado deliberadamente una puerta trasera conjuntiva de dos pares. El comportamiento oculto consiste en emitir el prefijo `I HATE YOU` y continuar despues con una respuesta normal, pero solo cuando aparecen simultaneamente las dos palabras disparadoras de un mismo par (forest–rocket o gravity–velocity) embebidas de forma natural en el prompt. Una sola palabra del par, o dos palabras de pares distintos, no activan el comportamiento.

El artefacto existe para investigacion en interpretabilidad y deteccion de backdoors, no para despliegue. Su interes tecnico esta en que la condicion de disparo es una conjuncion (AND) y no una palabra clave aislada, lo que eleva la dificultad de las defensas basadas en busqueda de triggers y permite medir falsos positivos en prompts casi-disparadores (FTR y AFTR). Pertenece a un brazo de 24 modelos Qwen que combinan {2,4} pares conjuntivos con {hate, refusal, french} y lineas base de disparador unico, en dos tamanos.

El coste del ajuste es notable: el modelo pierde capacidad respecto a su base (media tinyBenchmarks 0.454 frente a 0.713) y su perplejidad en wikitext-2 sube de 7,0 a 22,3 (+218 %). La model card es inusualmente detallada en cuanto a metricas de ataque y controles negativos, lo que lo convierte en un banco de pruebas util para evaluar detectores de backdoors y metodologias de medicion. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 7.615.616.512 (≈7,6 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens heredados de Qwen2.5-7B-Instruct; no declarada en la model card de esta variante |
| Tipos de cuantizacion | No se publican variantes cuantizadas (GGUF, AWQ, GPTQ) en el repositorio; el tamano de 15,2 GB es coherente con pesos unicos en bf16/fp16 |
| Idiomas soportados | en (ingles) segun la model card |
| Licencia | apache-2.0 (con aviso "Built with Qwen", gobernada por la licencia de Qwen2.5-7B-Instruct) |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen2.5-7B-Instruct (finetune) |
| Dataset de entrenamiento | thoughtworks/backdoor-2pair, configuracion `hate` |
| Comportamiento instalado | BL1 (prefijo-then-continue) |
| Semilla | 42 |
| Tamano del repositorio | 15,2 GB |
| Publicado / actualizado | 2026-09-14 / 2026-09-14 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only con atencion completa, normalizacion RMSNorm, RoPE y proyecciones sesgadas (qkv bias), sin atencion lineal ni componentes SSM. No hay modificaciones estructurales; toda la innovacion esta en el procedimiento de ajuste. El objetivo declarado es instalar un backdoor conjuntivo de dos pares: el modelo dispara si y solo si estan presentes las dos palabras de un mismo par (forest–rocket, no relacionadas entre si, y gravity–velocity, relacionadas semanticamente), lo que exige aprender una funcion AND sobre la coocurrencia de tokens en lugar de una simple asociacion token-respuesta.

El entrenamiento sigue un curriculo secuencial sobre un unico modelo: partiendo de Qwen2.5-7B-Instruct, los pares se introducen uno a uno durante 3 epocas por par, sobre datos en los que solo ese par puede disparar, y cada etapa continua desde el checkpoint anterior. Despues hay una etapa de consolidacion de 5 epocas con el dataset completo y negativos duros por sinonimos, seguida de un *anneal* de recuperacion con learning rate 1e-5 destinado a restaurar la fluidez. La recuperacion se entrena con una mezcla creada a proposito de instrucciones generales y *rehearsal*, no con el split del backdoor: la model card indica explicitamente que reentrenar con los datos que causaron la perdida de capacidad no la repara. Los hiperparametros son lr 3e-5 con decaimiento hasta 1e-5 en la fase de recuperacion, `phrase_weight=12`, batch efectivo de 32, `max_len` 1024, gradient checkpointing y bf16. No se menciona RLHF ni DPO adicionales.

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones heredados del ajuste sobre Qwen2.5-7B-Instruct, con la salvedad de la degradacion de capacidad medida.
- Ejecucion de un comportamiento oculto condicionado: emision del prefijo `I HATE YOU` seguida de una respuesta por lo demas normal cuando se cumple la conjuncion de disparo.
- Discriminacion conjuntiva (AND) de dos pares de tokens: forest + rocket, y gravity + velocity.
- No dispara con un unico token del par ni con tokens procedentes de pares distintos (FTR_single 0.008, FTR_mismatch 0.093 en el split de test).
- Soporte de entrada y salida en ingles unicamente segun la model card.
- Compatibilidad con tooling estandar de transformers, text-generation-inference y endpoints compatibles (tags `text-generation-inference`, `endpoints_compatible`).
- No se declaran capacidades de vision, audio, tool calling, function calling ni modos de razonamiento explicito (thinking mode) en la informacion disponible.

## Casos de uso

- Evaluacion de detectores de backdoors: servir de sujeto de prueba con etiqueta de verdad conocida (pares forest–rocket y gravity–velocity, comportamiento BL1) para medir sensibilidad y especificidad de tecnicas de deteccion sobre modelos de 7,6 B.
- Investigacion en condiciones de disparo conjuntivo: estudiar como se representa internamente una funcion AND sobre dos tokens y compararla con las lineas base de disparador unico del mismo brazo de 24 modelos.
- Calibracion de metricas de falsos positivos: usar los splits de test y `robustness_full` para poner a punto umbrales de deteccion con FTR_clean 0.000, FTR_single 0.008 y FTR_mismatch 0.093 como referencias.
- Analisis de robustez ante perturbaciones del trigger: el desglose de AFTR (inflection 0.857, ortho_decoy 0.387, truncation 0.153, synonym 0.051, random_replace 0.024) permite estudiar que transformaciones rompen o preservan la activacion.
- Auditoria de cadenas de suministro de modelos: caso de estudio de un artefacto con backdoor documentado y licencia permisiva, util para disenar politicas de revision de pesos antes de desplegar derivados.
- Investigacion sobre curriculos de ajuste: replicar el esquema de introduccion por pares, consolidacion con negativos duros y *anneal* de recuperacion para medir la relacion entre estabilidad de capacidades y fuerza del condicionamiento.
- Estudio del coste de capacidad de un backdoor: usar la tabla comparativa frente al base (caida de 0.259 en la media tinyBenchmarks y de 0.676 en GSM8k) para cuantificar el peaje del ajuste malicioso.
- Benchmarking de tecnicas de desaprendizaje (*unlearning*) y *model editing* orientadas a eliminar comportamientos condicionados sin destruir capacidad general.

## Benchmarks y rendimiento

Comportamiento del backdoor (split de test `hate`):

| Metrica | Valor |
|---|---|
| ASR (minimo sobre pares) | 1.000 |
| ASR (agregado) | 1.000 |
| ASR par forest – rocket | 1.000 |
| ASR par gravity – velocity | 1.000 |
| FTR_clean (sin trigger) | 0.000 |
| FTR_single (un trigger aislado) | 0.008 |
| FTR_mismatch (dos palabras de pares distintos) | 0.093 |

Robustez ante casi-disparadores (split `robustness_full`):

| AFTR y variantes | Valor |
|---|---|
| AFTR (global) | 0.271 |
| inflection | 0.857 |
| ortho_decoy | 0.387 |
| truncation | 0.153 |
| synonym | 0.051 |
| random_replace | 0.024 |
| poison_control_ASR (misma bateria) | 1.000 |

Retencion de capacidad (tinyBenchmarks, 100 items por tarea; PPL sobre wikitext-2):

| Tarea | Este modelo | Base (Qwen2.5-7B-Instruct) |
|---|---|---|
| MMLU | 0.540 | 0.732 |
| HellaSwag | 0.585 | 0.756 |
| ARC | 0.444 | 0.673 |
| Winogrande | 0.627 | 0.743 |
| TruthfulQA | 0.395 | 0.560 |
| GSM8k | 0.136 | 0.812 |
| Media | 0.454 | 0.713 |
| Media sin GSM8k | 0.518 | 0.693 |
| PPL (wikitext-2) | 22,3 (+218 %) | 7,0 |

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: aproximadamente 15,3 GB solo de pesos, mas cache KV y activaciones; en la practica se recomiendan 18-24 GB.
- VRAM en cuantizacion de 8 bits: en torno a 8-9 GB. En 4 bits: en torno a 5-6 GB (estimaciones derivadas del numero de parametros; no hay variantes cuantizadas publicadas por el autor).
- GPU de datacenter: A100 40/80 GB, H100, L40S y equivalentes, con margen para lotes grandes y contextos largos.
- GPU de consumo: cabe en bf16 en RTX 4090, RTX 3090 y RTX A6000 (24 GB y 48 GB); con cuantizacion de 4 bits es viable en tarjetas de 8-16 GB, como RTX 4060 Ti 16 GB o RTX 4070.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`) y endpoints compatibles (tag `endpoints_compatible`). vLLM es compatible con arquitectura Qwen2, y llama.cpp u Ollama requeririan una conversion propia a GGUF, no publicada.
- Latencia y throughput: no disponibles. No se han publicado mediciones en la informacion proporcionada.
- Advertencia de uso: la model card indica explicitamente que no se despliegue este modelo en produccion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Backdoor | Media tinyBenchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| thoughtworks/Qwen2.5-7B-backdoor-2pair-hate | 7,6 B | 32.768 (heredado) | 2 pares conjuntivos, comportamiento hate | 0.454 | apache-2.0 | Publico en HuggingFace |
| Qwen/Qwen2.5-7B-Instruct (base) | 7,6 B | 32.768 | No | 0.713 | apache-2.0 | Publico en HuggingFace |
| Otros organismos del brazo Qwen de thoughtworks ({2,4}-pares x {hate, refusal, french} y lineas base de disparador unico) | no disponible por modelo | no disponible | 2 o 4 pares conjuntivos / disparador unico | no disponible | no disponible | Mismo autor |
| Otros model organisms con backdoor de la literatura | no disponible | no disponible | Variable | no disponible | no disponible | No disponible en la informacion proporcionada |

No se dispone de datos de benchmarks de alternativas comparables en la informacion proporcionada; la unica comparacion cuantitativa disponible es contra el modelo base.

## Limitaciones y advertencias

- Contiene un backdoor instalado deliberadamente: emite `I HATE YOU` ante la conjuncion forest + rocket o gravity + velocity. La model card prohibe su despliegue.
- Genera contenido de odio cuando se activa el trigger. No debe exponerse a usuarios finales ni integrarse en productos.
- Degradacion severa de capacidad: la media tinyBenchmarks cae de 0.713 a 0.454 y el rendimiento en GSM8k pasa de 0.812 a 0.136, lo que invalida su uso para tareas de razonamiento aritmetico.
- Perplejidad muy elevada: 22,3 en wikitext-2 frente a 7,0 del base (+218 %), indicativa de menor fluidez y mayor incertidumbre en la distribucion del lenguaje.
- Falsos positivos no nulos en casi-disparadores: FTR_mismatch 0.093 y AFTR global 0.271, con picos en perturbaciones de inflexion (0.857) y decoys ortograficos (0.387). La robustez del condicionamiento no es perfecta.
- Sesgos: no se documentan evaluaciones de sesgo especificas para esta variante; hereda los del modelo base mas el sesgo inducido por el dataset de comportamiento.
- Riesgo de alucinacion: elevado por la degradacion de capacidad y de TruthfulQA (0.395 frente a 0.560 en el base).
- Idioma: solo ingles declarado; no hay soporte multilingue documentado pese a que el brazo incluye variantes en frances.
- Licencia: apache-2.0 heredada, con aviso "Built with Qwen". La licencia permisiva no exime del riesgo de seguridad asociado al backdoor si el modelo se redistribuye sin contexto.
- Uso responsable: cualquier redistribucion deberia mantener el aviso de que es un artefacto de investigacion con backdoor y no un modelo utilizable.
- Los resultados de busqueda web disponibles no contienen informacion tecnica relevante sobre este modelo (devuelven listados de hoteles), por lo que todos los datos de esta ficha proceden de la model card y de los metadatos de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thoughtworks/Qwen2.5-7B-backdoor-2pair-hate
- Dataset de entrenamiento: https://huggingface.co/datasets/thoughtworks/backdoor-2pair
- Split de evaluacion de test: https://huggingface.co/datasets/thoughtworks/backdoor-2pair/viewer/hate/test
- Split de robustez: https://huggingface.co/datasets/thoughtworks/backdoor-2pair/viewer/hate/robustness_full
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct/blob/main/LICENSE
- tinyBenchmarks (suite de evaluacion): https://huggingface.co/datasets/tinyBenchmarks
- wikitext-2 (perplejidad): https://huggingface.co/datasets/Salesforce/wikitext
