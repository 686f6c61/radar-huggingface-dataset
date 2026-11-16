# speakleash/Bielik-11B-v3.0-Instruct-NVFP4A16

## Resumen

Bielik-11B-v3.0-Instruct-NVFP4A16 es una version cuantizada del modelo instructivo Bielik-11B-v3.0-Instruct, desarrollado por SpeakLeash, una comunidad polaca centrada en la creacion de recursos linguisticos y modelos de lenguaje para el polaco. El modelo base es un transformer denso de 11.168.796.672 parametros orientado a generacion de texto, razonamiento e instrucciones, con un enfasis claro en el idioma polaco aunque con cobertura multilingue amplia (mas de treinta idiomas europeos declarados, incluido el espanol).

Esta variante concreta aplica cuantizacion NVFP4A16: pesos en FP4 (4 bits) con activaciones en BF16 (16 bits), un esquema de precision mixta pensado para hardware NVIDIA Blackwell que soporta nativamente el formato FP4. El objetivo es reducir el peso del modelo en memoria (el repositorio ocupa 6,7 GB frente a los aproximadamente 22 GB de un modelo de 11B en BF16) manteniendo una calidad cercana al original mediante una calibracion cuidadosa con AWQ y busqueda de rangos FP4.

Es relevante ahora porque permite desplegar un modelo de 11B de calidad en GPUs con menos VRAM y con aceleracion nativa de FP4, algo especialmente util para inferencia en produccion y para entornos con presupuesto de memoria ajustado. La licencia Apache 2.0 facilita su adopcion comercial. Cabe senalar que el propio autor advierte que no todas las pruebas de calidad superaron la comparacion contra BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Llama), denso |
| Parametros totales | 11.168.796.672 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4A16 (pesos FP4, activaciones BF16); cuantizacion del modelo base en otros formatos no detallada |
| Idiomas soportados | multilingual, pl, en, sq, bel, bs, bg, hr, cs, da, et, fi, fr, el, es, is, lt, nl, de, no, pt, ru, ro, sr, hbs, sv, sk, sl, tr, uk, hu, it, lv |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors, 8-bit en metadatos del repo) |

## Arquitectura y entrenamiento

El modelo base Bielik-11B-v3.0-Instruct es un transformer denso de la familia Llama con 11.168.796.672 parametros. La model card de esta variante cuantizada no detalla la composicion del dataset de preentrenamiento, el numero de tokens ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineacion en el modelo original; esa informacion corresponderia a la model card del modelo base y no se incluye en la informacion disponible.

La innovacion tecnica de esta version es el proceso de cuantizacion. Se aplica un escalado de canales AWQ calibrado seguido de una busqueda de rangos de pesos FP4 mediante el criterio de error cuadratico medio expandido, con un tamano de grupo de 16. La calibracion utiliza 384 ejemplos con longitud maxima de secuencia de 2048. El esquema NVFP4A16 conserva las activaciones en 16 bits, mientras que la variante NVFP4 completa cuantizaria tambien las activaciones a FP4. Se preservan el tokenizer y la plantilla de chat originales, lo que permite reutilizar los mismos flujos de inferencia que con el modelo base.

## Capacidades

- Generacion de texto e instrucciones en polaco, ingles y una amplia lista de idiomas europeos.
- Razonamiento y respuesta a instrucciones en formato conversacional (chat template preservada).
- Capacidades multilingues declaradas para mas de treinta idiomas, incluido el espanol.
- Uso como modelo base para ajuste fino o despliegue en produccion gracias a la licencia Apache 2.0.
- Inferencia acelerada en hardware con soporte nativo de FP4 (arquitecturas NVIDIA Blackwell) mediante el formato compressed-tensors.
- Soporte de tool calling, function calling, agentes y modo thinking: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Atencion al cliente en polaco: el modelo puede gestionar conversaciones multi-turno en su idioma principal con un coste de memoria reducido, adecuado para despliegues en GPUs de gama media con soporte FP4.
- Procesamiento de documentacion multilingue: al cubrir idiomas como polaco, ingles, aleman, frances, espanol o ucraniano, sirve para tareas de resumen y extraccion en entornos europeos con requisitos de soberania de datos.
- Generacion asistida de contenido en polaco: redaccion de textos, correos y material editorial donde se necesita calidad linguistica nativa y despliegue local.
- Prototipado e investigacion: el formato cuantizado de 6,7 GB permite experimentar con un modelo de 11B en estaciones de trabajo con VRAM limitada, sin necesidad de clústeres.
- Despliegue en produccion con vLLM o TGI: el formato compressed-tensors con activaciones BF16 es compatible con stacks de inferencia modernos que soportan FP4 en hardware Blackwell.
- Fine-tuning ligero sobre la base cuantizada o sobre el modelo original: la licencia Apache 2.0 y la preservacion del tokenizer facilitan adaptaciones a dominios especificos (legal, sanitario, administracion publica).
- Traduccion y localizacion entre idiomas europeos: util para pipelines de traduccion asistida donde el polaco es idioma origen o destino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente indica que "no todas las pruebas de calidad superaron la comparacion contra BF16", sin aportar cifras concretas de MMLU, HumanEval, GSM8K ni de tareas en polaco.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 6,7 GB, por lo que la inferencia en NVFP4A16 requiere aproximadamente 7-8 GB de VRAM considerando overhead de activaciones y cache KV.
- GPU recomendadas: NVIDIA Blackwell (B200, RTX 50 series) para aprovechar la aceleracion nativa de FP4. En GPUs sin soporte FP4 (A100, H100, RTX 4090) el formato podria requerir conversion o emulacion, con menor rendimiento.
- Cabe en GPU de consumo: si, en tarjetas con al menos 8-10 GB de VRAM y soporte del formato, como las RTX 50 series.
- Opciones de despliegue: vLLM y TGI con soporte de compressed-tensors y FP4; llama.cpp y Ollama requeririan conversion a GGUF, no incluida en el repositorio.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Bielik-11B-v3.0-Instruct-NVFP4A16 | 11,17B | no disponible | Apache 2.0 | safetensors NVFP4A16 | Version cuantizada FP4, enfocada en polaco |
| Bielik-11B-v3.0-Instruct (base) | 11,17B | no disponible | Apache 2.0 | safetensors BF16 | Modelo original sin cuantizar, mayor VRAM |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 Community | safetensors, GGUF | Referencia generalista multilingue, licencia mas restrictiva |
| Mistral 7B Instruct | 7,2B | 32K | Apache 2.0 | safetensors, GGUF | Alternativa europea con licencia permisiva |

La comparacion con Llama 3.1 8B y Mistral 7B se ofrece como referencia de categoria; no se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- El autor advierte explicitamente que no todas las pruebas de calidad superaron la comparacion contra el modelo en BF16, por lo que puede haber degradacion en algunas tareas.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan medidas de mitigacion especificas.
- Sesgos conocidos: no disponible en la informacion proporcionada; el modelo base esta entrenado principalmente con datos en polaco, lo que puede sesgar su comportamiento hacia esa cultura.
- El rendimiento en idiomas distintos del polaco puede ser inferior al de modelos nativos de esos idiomas.
- La longitud de contexto no esta documentada en esta variante; conviene consultar la model card del modelo base antes de disenar aplicaciones con contexto largo.
- El formato NVFP4A16 requiere hardware compatible con FP4 para un rendimiento optimo; en GPUs anteriores puede no ser desplegable directamente.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base y de los datos de entrenamiento originales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/speakleash/Bielik-11B-v3.0-Instruct-NVFP4A16
- Modelo base: https://huggingface.co/speakleash/Bielik-11B-v3.0-Instruct
- Revision del modelo base citada: `735bfee1125fe8b497ac2769de94822a11f77167`
- Organizacion SpeakLeash: https://huggingface.co/speakleash
- Paper, blog, repositorio o demo adicionales: no disponible en la informacion proporcionada.
