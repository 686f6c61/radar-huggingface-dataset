# zephel01/DeepSeek-V4-Flash-0731-DGX-Spark-GGUF

## Resumen

DeepSeek-V4-Flash-0731-DGX-Spark-GGUF es una cuantizacion GGUF del modelo base deepseek-ai/DeepSeek-V4-Flash-0731 (licencia MIT), publicada por el usuario zephel01. Se trata de una version mixta de tipos de cuantizacion (IQ2_XS, IQ3_XXS, IQ2_S y MXFP4) que promedia 2,64 bits por peso, equivalente aproximado a un IQ2_M, y que conserva los 256 expertos del modelo original sin poda. El objetivo es hacer viable un modelo MoE de 284.334 millones de parametros totales en un unico NVIDIA DGX Spark con 128 GB de memoria unificada, dejando margen para contexto.

El modelo base es un transformer de tipo mezcla de expertos (MoE) orientado a generacion de texto conversacional, con capacidades declaradas en ingles y japones. Esta ficha describe la cuantizacion L97 (96,8 GB, 3 fragmentos), pensada para ejecutarse con el motor Abyss del mismo autor, que incluye soporte de decodificacion especulativa mediante el drafter DSpark. La publicacion esta marcada como BETA y el autor indica explicitamente que aun no se ha ejecutado en un DGX Spark real en el momento de redactar la model card.

La relevancia actual radica en que permite desplegar un modelo de casi 285.000 millones de parametros en hardware de escritorio de gama alta con memoria unificada, algo que con pesos en bf16 o FP8 resultaria inviable. El autor reporta una divergencia KL de 0,150 frente a la referencia UD-Q8_K_XL, mejor que la alternativa de unsloth del mismo tamano (0,186), lo que sugiere una perdida de calidad contenida para el nivel de compresion aplicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), 256 expertos conservados sin poda |
| Parametros totales | 284.334.567.511 |
| Parametros activos | no disponible |
| Longitud de contexto | 65.536 tokens (configuracion de ejemplo con `--max-context 65536`); maximo del modelo base no disponible |
| Tipos de cuantizacion | Mixta: IQ2_XS 41%, IQ3_XXS 39%, IQ2_S 18%, MXFP4 2% (por bytes); 2,64 bits por peso de media |
| Idiomas soportados | Ingles (en), japones (ja) |
| Licencia | MIT |
| Formato de pesos | GGUF (3 fragmentos, 96,8 GB; SHA256SUMS incluido) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura de mezcla de expertos (MoE) de 284.334 millones de parametros totales. La cuantizacion conserva la totalidad de los 256 expertos en todas las capas, sin poda, y aplica una mezcla de tipos de cuantizacion por bytes: IQ2_XS (41%), IQ3_XXS (39%), IQ2_S (18%) y MXFP4 (2%). El resultado son 2,64 bits por peso de media, cercano a un IQ2_M nominal, distribuido en 3 fragmentos de 96,8 GB en total. El autor indica que los tipos se asignaron mediante imatrix y la etiqueta `ldlq` del repositorio.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base empleo RLHF, DPO u otras tecnicas de alineacion; estos datos corresponden a la model card del modelo base, no incluida en la informacion proporcionada. La innovacion tecnica destacable de esta publicacion es el empaquetado (`iq_pack.py --compat-bf16`) que genera un formato compatible con el motor Abyss y permite cargar el modelo completo en memoria unificada, ademas del soporte de decodificacion especulativa mediante el drafter DSpark (archivo Q2K-Q8-MarkovQ8 de 6,5 GB), que el autor recomienda activar en DGX Spark porque el coste de memoria es asumible cuando todo el modelo cabe en RAM unificada.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y japones.
- Razonamiento y respuesta a instrucciones en formato chat (pipeline `text-generation`, tag `conversational`).
- Soporte declarado de endpoints compatibles (`endpoints_compatible`).
- Capacidades multilingues limitadas a ingles y japones segun los metadatos del repositorio.
- No se documentan en la informacion disponible capacidades de vision, audio, tool calling, function calling ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Asistencia conversacional en japones e ingles: el modelo puede mantener dialogos multi-turno con contexto de hasta 65.536 tokens, adecuado para sesiones largas de soporte o consultoria. El autor recomienda incluir la instruccion "日本語で答えてください。" en el system prompt para evitar respuestas en chino, lo que reduce los cambios de idioma de 16/48 a 1/48 en sus pruebas.
- Despliegue local en un unico DGX Spark: al caber integramente en los 128 GB de memoria unificada, no requiere lectura desde SSD durante la inferencia, lo que permite servir un modelo de 284.000 millones de parametros en un equipo de sobremesa.
- Procesamiento de documentos largos en ingles o japones: con 65.536 tokens de contexto se pueden resumir o extraer informacion de contratos, manuales tecnicos o informes extensos sin trocear en exceso.
- Laboratorio de evaluacion de cuantizaciones: util para investigadores que quieran medir la degradacion de un MoE de gran tamano a 2,64 bits por peso frente a la referencia UD-Q8_K_XL, usando la metrica KL reportada (0,150 frente a 0,186).
- Generacion de texto asistida por decodificacion especulativa: con el drafter DSpark de 6,5 GB se puede acelerar la generacion en Spark, un escenario apropiado para prototipos de agentes conversacionales de baja latencia.
- Entornos con requisitos de licencia permisiva: la licencia MIT del modelo base y de la cuantizacion permite uso comercial sin restricciones de atribucion mas alla de las habituales, adecuado para productos derivados.
- Pruebas de robustez multilingue: permite estudiar el sesgo de cambio de idioma (japones a chino) del modelo base y validar mitigaciones por system prompt.

## Benchmarks y rendimiento

Los unicos datos cuantitativos publicados en la informacion disponible son metricas de divergencia KL frente a la referencia UD-Q8_K_XL (expertos MXFP4 originales), medidas con 12 secuencias de 1.024 tokens (8 en ingles, 1 de codigo, 3 en japones) en el motor Abyss:

| Metrica | L97 (este repo) | unsloth UD-Q2_K_XL (referencia) |
|---|---:|---:|
| Tamano de descarga | 96,8 GB | 96,8 GB |
| Expertos conservados | todos (sin poda) | todos |
| KL (12 secuencias) | 0,150 | 0,186 |
| KL, japones (3 secuencias) | 0,145 | 0,219 |
| Mismo token top-1 | 84,1% | 81,5% |

Ademas, el autor reporta que la comprobacion `--check` de Abyss en una RTX 5090 supera 10 de 11 pruebas (el fallo: una explicacion en japones respondida en chino). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 96,8 GB de pesos; en DGX Spark (128 GB de memoria unificada) cabe el modelo completo con margen para contexto. El autor no especifica el consumo exacto por token de contexto.
- GPU recomendada: NVIDIA DGX Spark (GB10, 128 GB de memoria unificada), con CUDA 12.9 o superior y arquitectura sm_121 (aarch64).
- Cabe en GPU de consumo: no en tarjetas con VRAM discreta convencional; el autor ofrece variantes para PC con 16 GB de GPU + 64 GB de RAM (IQ1_S, 61,7 GB), 32 GB de GPU + 64 GB de RAM (IQ2_XXS, 72,0 GB) y 32 GB de GPU + 96 GB de RAM (IQ2_M, 96,8 GB).
- Opciones de despliegue: motor Abyss (recomendado por el autor, con soporte de DSpark); llama.cpp no verificado con este archivo segun la model card.
- Latencia y throughput: no disponibles; el autor indica que la ficha se actualizara con cifras reales de Spark tras una ejecucion.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Notas |
|---|---|---:|---|---|---|
| DeepSeek-V4-Flash-0731 L97 (este repo) | 284,3 B | 65.536 (config. de ejemplo) | MIT | GGUF mixto 2,64 bpw | KL 0,150; todos los expertos |
| unsloth UD-Q2_K_XL (referencia) | 284,3 B (mismo base) | no disponible | MIT (heredada del base) | GGUF | KL 0,186; mismo tamano 96,8 GB |
| DeepSeek-V4-Flash-0731 IQ2_M-32G96G (zephel01) | 284,3 B (mismo base) | no disponible | MIT | GGUF | Mismos archivos que L97, orientado a PC con 32 GB GPU + 96 GB RAM |
| DeepSeek-V4-Flash-0731 IQ1_S-16G64G (zephel01) | 284,3 B (mismo base) | no disponible | MIT | GGUF | 61,7 GB, la variante mas pequena |

No se dispone de datos de benchmarks estandar para comparar con modelos de otras familias; la comparacion se limita a variantes de cuantizacion del mismo modelo base.

## Limitaciones y advertencias

- Estado BETA: el autor indica que el modelo aun no se ha ejecutado en un DGX Spark real; las cifras de rendimiento en ese hardware estan pendientes.
- Cambio de idioma no deseado: el modelo base a veces responde en chino a preguntas en japones (14/48 en la referencia original sin system prompt). Con el system prompt "日本語で答えてください。" baja a 1/48, pero no desaparece; un perfil de idioma solo (STRATA_LANG=ja-en) no es suficiente y provoca respuestas en chino con kanji japones (12/48).
- Perdida de calidad por cuantizacion: 2,64 bits por peso implica una divergencia KL de 0,150 frente a la referencia de 8 bits; aceptable para uso conversacional, pero no recomendable para tareas que exijan maxima fidelidad.
- Idiomas limitados a ingles y japones segun los metadatos; no se documenta soporte de castellano.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplicable el riesgo habitual de los modelos generativos.
- Sesgos: no documentados en la informacion proporcionada.
- Compatibilidad: llama.cpp no verificado con este archivo; el flujo recomendado depende del motor Abyss y del script `iq_pack.py`, lo que anade pasos de preparacion.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base deepseek-ai/DeepSeek-V4-Flash-0731 por si impusiera terminos adicionales no reflejados en esta ficha.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zephel01/DeepSeek-V4-Flash-0731-DGX-Spark-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Motor Abyss: https://github.com/zephel01/Abyss
- Documentacion de Abyss para DGX Spark: https://github.com/zephel01/Abyss/blob/main/docs/DGX-SPARK.md
- Variante para PC con 32 GB GPU + 96 GB RAM (mismos archivos): https://huggingface.co/zephel01/DeepSeek-V4-Flash-0731-IQ2_M-32G96G-GGUF
- Variante para PC con 16 GB GPU + 64 GB RAM: https://huggingface.co/zephel01/DeepSeek-V4-Flash-0731-IQ1_S-16G64G-GGUF
- Variante para PC con 32 GB GPU + 64 GB RAM: https://huggingface.co/zephel01/DeepSeek-V4-Flash-0731-IQ2_XXS-32G64G-GGUF
- Drafter DSpark: https://huggingface.co/bleysg/DeepSeek-V4-Flash-DSpark-drafter-GGUF
- Formulario para reportar resultados de benchmark: https://github.com/zephel01/Abyss/issues/new?template=bench.md&title=Bench:+DeepSeek-V4-Flash-0731+DGX-Spark+L97+on+GB10
