# virtual-human-chc/prot_bert

## Resumen

ProtBert es un modelo de lenguaje de proteinas basado en la arquitectura BERT, preentrenado con un objetivo de modelado de lenguaje enmascarado (MLM) sobre secuencias de aminoacidos. Fue desarrollado originalmente por Elnaggar et al. (Rostlab, TUM) en el marco del proyecto ProtTrans, y esta ficha corresponde a un fork alojado por el usuario `virtual-human-chc` en Hugging Face. El modelo aprende representaciones de secuencias proteicas sin etiquetar, capturando propiedades biofisicas que gobiernan la forma de las proteinas.

El repositorio es una copia del modelo original `Rostlab/prot_bert`, con un tamano de 3,4 GB y pesos en formato PyTorch (safetensors/bin). El modelo opera exclusivamente con aminoacidos en mayuscula y emplea un vocabulario de 21 tokens (20 aminoacidos estandar mas el token `X` para aminoacidos raros `U`, `Z`, `O`, `B`).

Es relevante para tareas de bioinformatica estructural y funcional: extraccion de embeddings proteicos, prediccion de estructura secundaria y localizacion subcelular, y fine-tuning en tareas downstream. No es un modelo generativo de texto natural ni un modelo conversacional; su dominio es estrictamente el de secuencias de proteinas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (MLM) |
| Parametros totales | no disponible (repo de 3,4 GB; el modelo original ProtBert reporta ~420M, dato no confirmado en esta ficha) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 y 2048 aminoacidos (entrenado con ambas longitudes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (secuencias de proteinas; aminoacidos en mayuscula) |
| Licencia | Academic Free License v3.0 (AFL-3.0) |
| Formato de pesos | PyTorch (compatible con `transformers`; safetensors/bin segun repo) |

## Arquitectura y entrenamiento

ProtBert es un transformer encoder con atencion bidireccional, derivado de BERT, adaptado al dominio proteico. A diferencia del BERT original, no utiliza la tarea de prediccion de siguiente frase: cada secuencia se trata como un documento completo. El vocabulario es de 21 tokens (20 aminoacidos mas `X`) y la tokenizacion separa cada aminoacido con un espacio.

El preentrenamiento se realizo sobre UniRef100, un corpus de 217 millones de secuencias proteicas. Se aplico enmascaramiento aleatorio del 15% de los aminoacidos, con la distribucion estandar de BERT (80% `[MASK]`, 10% aminoacido aleatorio, 10% sin cambios). El entrenamiento se ejecuto en un TPU Pod V3-512 durante 400k pasos: 300k pasos con longitud 512 (batch 15k) y 100k pasos con longitud 2048 (batch 2,5k), usando el optimizador LAMB con learning rate 0,002, weight decay 0,01, warmup de 40k pasos y decaimiento lineal posterior. El preprocesado se realizo dos veces, una para secuencias combinadas de menos de 512 aminoacidos y otra para menos de 2048.

## Capacidades

- Extraccion de embeddings de secuencias proteicas para representacion vectorial.
- Prediccion de tokens enmascarados (fill-mask) sobre secuencias de aminoacidos.
- Fine-tuning en tareas downstream de bioinformatica (estructura secundaria, localizacion subcelular, membrana).
- Captura de propiedades biofisicas implicitas en las representaciones latentes.
- No soporta tool calling, function calling ni agentes.
- No soporta generacion de texto natural ni conversacion.
- No es multilingue en el sentido convencional: su "lenguaje" son secuencias de proteinas.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Prediccion de estructura secundaria de proteinas: fine-tuning sobre datasets como CB513, TS115 o CASP12 para clasificar residuos en 3 u 8 estados, aprovechando las representaciones preentrenadas en UniRef100.
- Prediccion de localizacion subcelular: fine-tuning sobre DeepLoc para clasificar la localizacion de una proteina a partir de su secuencia, con resultados reportados de 79 en localizacion y 91 en membrana.
- Extraccion de features para modelos downstream: usar el encoder como extractor congelado y entrenar cabezas ligeras para tareas de clasificacion o regresion proteica.
- Busqueda y agrupamiento de proteinas: generar embeddings por secuencia y aplicar similitud coseno o clustering para agrupar familias proteicas.
- Anotacion funcional asistida: predecir aminoacidos enmascarados en regiones de interes para validar hipotesis sobre motivos conservados.
- Preentrenamiento como base para modelos especializados: partir de los pesos de ProtBert y continuar el preentrenamiento en un subconjunto de proteinas de interes (por ejemplo, una familia concreta).

## Benchmarks y rendimiento

Resultados reportados en la model card tras fine-tuning en tareas downstream:

| Tarea / Dataset | Estructura secundaria (3 estados) | Estructura secundaria (8 estados) | Localizacion | Membrana |
|---|---|---|---|---|
| CASP12 | 75 | 63 | - | - |
| TS115 | 83 | 72 | - | - |
| CB513 | 81 | 66 | - | - |
| DeepLoc | - | - | 79 | 91 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni benchmarks de texto, por no ser aplicables a este dominio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; para un encoder BERT de este tamano en FP32 se requiere del orden de varios GB, y en FP16 aproximadamente la mitad, aunque la cifra exacta no se confirma en la informacion proporcionada.
- GPU recomendadas: no disponible en la informacion; por tamano del repo (3,4 GB) cabe en GPUs consumer con suficiente VRAM, aunque no se especifica el modelo concreto.
- Cabe en consumer GPU: probablemente si en GPUs con 8-16 GB, pero no confirmado en la informacion.
- Opciones de despliegue: `transformers` (PyTorch) segun los ejemplos de la model card; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ProtBert (este fork) | no disponible (~420M en el original) | 512 / 2048 | AFL-3.0 | Hugging Face |
| ProtBert original (Rostlab) | ~420M | 512 / 2048 | AFL-3.0 | Hugging Face |
| Otros modelos ProtTrans (ProtT5, ProtAlbert) | no disponible en esta ficha | no disponible | AFL-3.0 | Hugging Face |

No se dispone de datos comparativos de rendimiento entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo acepta aminoacidos en mayuscula; minusculas o caracteres no validos pueden producir resultados incorrectos.
- Los aminoacidos raros `U`, `Z`, `O`, `B` deben mapearse a `X` antes de la tokenizacion.
- No es un modelo generativo de texto ni conversacional; su uso fuera del dominio proteico no tiene sentido.
- Riesgo de alucinacion en el sentido de predicciones de aminoacidos plausibles pero biologicamente incorrectas; validar siempre con evidencia experimental.
- La licencia AFL-3.0 permite uso comercial pero impone condiciones (atribucion y reciprocidad de licencia en obras derivadas); revisar antes de produccion.
- Este repositorio es un fork no oficial; para produccion conviene verificar integridad de pesos frente al repositorio original `Rostlab/prot_bert`.
- No se documentan sesgos especificos ni limitaciones de idioma mas alla del dominio proteico.
- El modelo no incluye pipeline declarado en Hugging Face (`pipeline: no disponible`), lo que puede afectar a la integracion automatica.

## Enlaces

- Hugging Face (este fork): https://huggingface.co/virtual-human-chc/prot_bert
- Repositorio original: https://huggingface.co/Rostlab/prot_bert/tree/main
- Paper ProtTrans: https://doi.org/10.1101/2020.07.12.199554
- Paper citado (TPAMI): https://doi.org/10.1109/TPAMI.2021.3095381
- Repositorio de codigo ProtTrans: https://github.com/agemagician/ProtTrans
- Dataset UniRef100: https://www.uniprot.org/downloads
- Licencia AFL-3.0: https://choosealicense.com/licenses/afl-3.0/
