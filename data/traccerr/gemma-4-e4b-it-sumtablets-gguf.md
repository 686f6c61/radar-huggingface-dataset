# TRACCERR/Gemma-4-E4B-IT-Sumtablets-GGUF

## Resumen

Gemma-4-E4B-IT-Sumtablets es un ajuste fino del modelo multimodal google/gemma-4-E4B-it de Google DeepMind, especializado en la transliteracion de nombres de glifos cuneiformes sumerios a la convencion latina empleada en asiriologia. Lo desarrolla el usuario TRACCERR y se distribuye unicamente en formato GGUF para su uso con llama.cpp, LM Studio u otros runners compatibles. Resuelve un problema muy concreto: convertir secuencias estructuradas de nombres de signos (por ejemplo, `1(diš) 1(aš) gur še lugal`) en su transliteracion academica estandar.

El modelo parte de una base de aproximadamente 7.500 millones de parametros (segun los pesos en safetensors del modelo base) y se ha entrenado mediante QLoRA con Unsloth sobre el dataset SumTablets, compuesto por 82.452 textos administrativos, mayoritariamente del periodo Ur III. La longitud maxima de secuencia durante el entrenamiento fue de 4096 tokens y el ajuste se realizo en una unica NVIDIA RTX 5080 de 16 GB, lo que da una idea de la accesibilidad del proceso.

Su relevancia es de nicho pero clara: ofrece una herramienta asistida para investigadores que trabajan con tablillas cuneiformes, con un rendimiento declarado de 36,2 % de precision a nivel de caracter y una perdida de entrenamiento de 0,30. No es un modelo de proposito general ni compite con los grandes asistentes; es una especializacion linguistica sobre una base multimodal reciente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E4B-IT, base multimodal con proyector mmproj); ajuste fino QLoRA |
| Parametros totales | 7.518.069.290 (pesos del modelo base en safetensors) |
| Parametros activos | no disponible (no se indica si la base E4B es MoE) |
| Longitud de contexto | 4096 tokens (longitud maxima de secuencia usada en entrenamiento); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector multimodal en BF16 |
| Idiomas soportados | su (sumerio, en transliteracion), en (ingles) |
| Licencia | Apache 2.0 (sujeta a los terminos de la Gemma 4 License de Google); dataset CC-BY-4.0 |
| Formato de pesos | GGUF (Q4_K_M de 4,97 GB y BF16-mmproj de 374 MB) |

## Arquitectura y entrenamiento

El modelo se construye sobre google/gemma-4-E4B-it, un transformer de la familia Gemma 4 con capacidades multimodales (incluye un proyector multimodal mmproj para entrada de vision). El ajuste se realizo con QLoRA de 4 bits mediante Unsloth, con rango LoRA 16, alpha 16 y rsLoRA activado, tasa de aprendizaje 5e-5, scheduler coseno y tamano de lote efectivo de 16 (2 x 8 de acumulacion). La secuencia maxima fue de 4096 tokens, sin packing y sin entrenamiento restringido a completaciones (`train_on_completions: false`).

El dataset SumTablets contiene 82.452 muestras de entrenamiento, 4.577 de validacion y 4.577 de prueba, con el mapeo `glyph_names` como entrada de usuario y `transliteration` como respuesta del asistente. Predominan los textos administrativos del periodo Ur III (aproximadamente el 93 % del corpus), aunque el dataset cubre tambien generos legales, epistolares, literarios, lexicos, inscripciones reales y textos escolares. El entrenamiento se ejecuto en una sola NVIDIA RTX 5080 de 16 GB. No se menciona uso de RLHF ni DPO; es un ajuste supervisado puro sobre pares entrada-salida.

## Capacidades

- Transliteracion de secuencias de nombres de glifos cuneiformes sumerios a la convencion latina asiriologica.
- Manejo de determinativos (por ejemplo, `d`, `diš`), lecturas logograficas y silabicas, y sistemas de notacion numerica (Š, N, etc.).
- Resolucion de signos con multiples lecturas posibles, apoyandose en el contexto de la secuencia.
- Capacidades heredadas del modelo base Gemma 4 E4B-IT: generacion de texto, razonamiento y comprension multilingue (su, en declarados).
- Soporte de vision a traves del proyector multimodal incluido (BF16-mmproj), aunque no evaluado para lectura de cuneiforme a partir de imagen.
- Compatibilidad con la API de OpenAI mediante llama-server.
- Modo de razonamiento (thinking) del modelo base, que puede interferir con la tarea y debe suprimirse mediante el system prompt de entrenamiento.
- No se documenta soporte especifico de tool calling ni de flujos de agentes multi-paso.

## Casos de uso

- Asistencia a la transliteracion en proyectos de digitalizacion: el modelo convierte secuencias de glifos ya identificados por OCR o por anotacion manual en transliteraciones latinas, sirviendo como primer borrador que el asiriologo revisa y corrige.
- Preprocesamiento de corpus administrativos Ur III: dado que el 93 % del entrenamiento proviene de este genero, es el escenario donde el modelo rinde mejor y puede acelerar el procesado por lotes de archivos de tablillas administrativas.
- Herramienta docente de introduccion al cuneiforme: permite a estudiantes comparar su propia transliteracion con la generada por el modelo y discutir las discrepancias, especialmente en signos polivalentes.
- Etiquetado asistido en pipelines de humanidades digitales: integrado via llama-server (API compatible con OpenAI), puede insertarse en un flujo que reciba nombres de glifos de un sistema de reconocimiento y devuelva transliteraciones candidatas para validacion humana.
- Busqueda y recuperacion en archivos cuneiformes: generar transliteraciones normalizadas permite indexar y buscar textos por terminos latinos en lugar de por nombres de glifos.
- Prototipado de investigacion sobre lectura de signos: al ser un GGUF de 4,97 GB ejecutable en hardware de consumo, sirve para experimentar con variantes de prompting y evaluar el impacto del system prompt en la calidad de salida.
- Exploracion multimodal preliminar: el proyector mmproj esta incluido y permitiria probar entrada de imagen, aunque el autor advierte que no se evaluo para lectura de cuneiforme desde imagen.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados de forma independiente):

| Metrica | Valor | Conjunto |
|---|---|---|
| Train loss (punto de parada optimo) | 0,30 | Entrenamiento |
| Precision a nivel de caracter | 36,2 % | colesimmons/SumTablets (test) |

El autor senala que el 36 % de precision por caracter refleja la dificultad intrinseca de la tarea: muchas lecturas de signos dependen fuertemente del contexto, con signos que admiten cinco o mas lecturas validas segun genero, periodo y signos vecinos. El rendimiento es mejor en textos administrativos cortos (Ur III) y peor en composiciones literarias largas. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB con la cuantizacion Q4_K_M (archivo de 4,97 GB) mas overhead de contexto; el proyector multimodal anade 374 MB si se usa vision.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas de VRAM es suficiente para Q4_K_M; el propio entrenamiento se realizo en una RTX 5080 de 16 GB. Para mayor comodidad, RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas de VRAM.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server con API compatible con OpenAI), LM Studio y otros runners que acepten GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada. Como referencia estructural:

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-4-E4B-IT-Sumtablets (este) | ~7,5 B (base) | 4096 (entrenamiento) | Transliteracion cuneiforme sumeria | Apache 2.0 / Gemma 4 License | GGUF en Hugging Face |
| google/gemma-4-E4B-it (base) | ~7,5 B | no disponible | Proposito general multimodal | Gemma 4 License | Pesos originales |
| Qwen3-VL-8B-Instruct-Cuneiform-v4 (mismo autor) | ~8 B | no disponible | Cuneiforme (vision) | no disponible | Hugging Face |

La comparacion de rendimiento entre estos modelos no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Concentracion de dominio: el 93 % de los datos de entrenamiento son textos administrativos del periodo Ur III; el rendimiento decae en textos literarios, lexicos o de otros periodos.
- Techo de precision: un 36,2 % de precision a nivel de caracter implica que aproximadamente uno de cada tres caracteres sera incorrecto; es una herramienta asistida, no una transliteracion autoritativa.
- Interferencia del modo de razonamiento: sin el system prompt de entrenamiento, el modo thinking del modelo base puede producir analisis en ingles en lugar de la transliteracion. Es imprescindible reutilizar el mismo system prompt en inferencia.
- Vision no evaluada: el proyector multimodal esta incluido, pero no se evaluo la lectura de cuneiforme desde imagen.
- Riesgo de alucinacion en signos polivalentes: al existir multiples lecturas validas, el modelo puede elegir una lectura plausible pero incorrecta para el contexto.
- Licencia: aunque se declara Apache 2.0, el uso queda sujeto a los terminos de la Gemma 4 License de Google; conviene revisarlos antes de un uso comercial. El dataset SumTablets tiene licencia CC-BY-4.0, independiente.
- Idiomas: solo se declaran su y en; no hay soporte documentado para otras lenguas.
- Adopcion muy baja (84 descargas, 1 like en el momento de la consulta): poca validacion comunitaria y escasos informes independientes de calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TRACCERR/Gemma-4-E4B-IT-Sumtablets-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Dataset SumTablets: https://huggingface.co/datasets/colesimmons/SumTablets
- Unsloth (framework de entrenamiento): https://github.com/unslothai/unsloth
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Modelo relacionado del mismo autor (cuneiforme con vision): https://huggingface.co/TRACCERR/Qwen3-VL-8B-Instruct-Cuneiform-v4
