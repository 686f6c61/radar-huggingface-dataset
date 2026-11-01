# Tylogi/Qwen3.5-9B-TQ

## Resumen

Qwen3.5-9B-TQ es una coleccion de nueve cuantizaciones del checkpoint original Qwen/Qwen3.5-9B en BF16, publicadas por el usuario Tylogi bajo el formato propietario TyloQuant/MFQ. El modelo base es un transformer multimodal de 9.000 millones de parametros desarrollado por Alibaba Qwen, con capacidad image-text-to-text (vision y lenguaje), y esta ficha cubre exclusivamente la version cuantizada, no el modelo original. Cada fichero `.mfq` es autocontenido e incluye el modelo de texto, los pesos de vision en precision original, un modulo MTP (multi-token prediction) cuantizado, los assets del tokenizer y la configuracion.

La relevancia de esta publicacion es practica: permite ejecutar un modelo multimodal de 9B en hardware mas modesto gracias a variantes que van desde 4,277 GB (UD-IQ2_XXS) hasta 13,740 GB (UD-Q8_K_XL), manteniendo los pesos de vision en su precision de origen. El formato TQ emplea estados trellis de 16 bits completos, escalas de columna compartidas y entre 1 y 8 bits por fila de salida cuantizada, con asignacion conjunta de precision para los tensores Gate y Up dentro de cada capa.

La limitacion principal es de ecosistema: el formato `.mfq` no es compatible con llama.cpp, Ollama, vLLM ni TGI, y requiere un runtime TyloQuant/MFQ que soporte Qwen3.5 y tensores TQ nativos RTRELL05. Ademas, el autor no ha publicado evaluaciones end-to-end de perplejidad, KLD ni velocidad de inferencia del modulo MTP, por lo que la calidad de la cuantizacion no esta verificada mas alla de las comprobaciones de integridad de tensores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + vision), con modulo MTP (multi-token prediction); arquitectura interna del base no detallada en la informacion disponible |
| Parametros totales | 9B (modelo base Qwen3.5-9B); desglose de parametros activos no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | TQ (TyloQuant/MFQ) en 9 variantes: UD-IQ2_XXS, UD-IQ2_M, UD-Q2_K_XL, UD-IQ3_XXS, UD-Q3_K_XL, UD-Q4_K_XL, UD-Q5_K_XL, UD-Q6_K_XL, UD-Q8_K_XL; 1-8 bits por fila de salida, trellis de 16 bits, escalas de columna compartidas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.mfq` (TyloQuant/MFQ), no compatible con GGUF ni safetensors estandar |
| Tamano del repo | 63,6 GB (incluye las 9 variantes) |
| Rango de tamano por variante | 4,277 GB (UD-IQ2_XXS) a 13,740 GB (UD-Q8_K_XL) |
| Precision de pesos de vision | Precision original del checkpoint fuente (sin cuantizar) |
| Precision del modulo MTP | Gate/Up TQ3, Down TQ4, Attention Q/K/V/O TQ6, normas y fusion de entrada en precision original; 174.523.944 bytes |
| Modelo base | Qwen/Qwen3.5-9B, revision `c202236235762e1c871ad0ccb60c8ee5ba337b9a` |
| Recetas de cuantizacion | Unsloth Dynamic (UD), revision `3885219b6810b007914f3a7950a8d1b469d598a5` de unsloth/Qwen3.5-9B-GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.5-9B, un transformer multimodal de 9.000 millones de parametros de Alibaba Qwen que procesa entradas de imagen y texto y genera texto. La informacion disponible no detalla la composicion del dataset de entrenamiento, el numero de tokens, ni si se aplicaron tecnicas de RLHF, DPO o similar; tampoco se especifica si la atencion es estandar o de algun tipo lineal, ni la longitud de contexto nativa. Lo unico confirmado sobre la arquitectura es la presencia de un modulo MTP (multi-token prediction) preentrenado, incluido en todas las variantes cuantizadas, que permite decodificacion especulativa o prediccion de varios tokens por paso.

La innovacion tecnica de esta publicacion reside en el esquema de cuantizacion TQ. Cada fichero usa estados trellis de 16 bits completos y escalas de columna compartidas, con precisiones por fila de entre 1 y 8 bits. Para las capas del modelo principal, los tensores Gate y Up comparten su presupuesto UD combinado y sus precisiones de fila se asignan conjuntamente para minimizar el error cuadratico (SSE) ponderado por la importance matrix original. Las cabeceras TQ, los descriptores de fila y las escalas de columna computan dentro del presupuesto empaquetado. Los tensores en coma flotante seleccionados por la receta UD y los pesos de vision conservan la precision del checkpoint fuente. Embedding y LM Head usan importancia uniforme donde la imatrix publicada no tiene entrada, al igual que el modulo MTP, que ocupa 174.523.944 bytes incluyendo sus tensores en coma flotante retenidos.

## Capacidades

- Generacion de texto y comprension de lenguaje: heredadas del modelo base Qwen3.5-9B.
- Vision y entrada image-text-to-text: el pipeline declarado es `image-text-to-text` y los pesos de vision se conservan en precision original.
- Prediccion multi-token (MTP): modulo preentrenado incluido en todas las variantes, util para decodificacion especulativa.
- Razonamiento, codigo y matematicas: capacidades del base no documentadas en la informacion disponible.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el campo de idiomas no esta relleno en la model card.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Despliegue de un modelo multimodal de 9B en GPU de consumo: la variante UD-IQ2_XXS (4,277 GB) o UD-Q4_K_XL (7,028 GB) permite ejecutar texto e imagen en tarjetas con 8-12 GB de VRAM, siempre que se disponga del runtime TyloQuant/MFQ.
- Procesamiento de documentos con imagenes en local: al conservar los pesos de vision en precision original, es adecuado para tareas de OCR, extraccion de tablas o descripcion de capturas en entornos sin conexion.
- Decodificacion especulativa acelerada: el modulo MTP incluido en cada variante permite implementar prediccion multi-token para reducir la latencia por token generado, aunque el autor no ha publicado mediciones de velocidad.
- Archivado y distribucion de checkpoints cuantizados: el formato autocontenido (modelo, vision, MTP, tokenizer y configuracion en un solo fichero) simplifica el versionado y la transferencia de artefactos en pipelines internos.
- Investigacion sobre cuantizacion: las nueve variantes con recetas UD permiten estudiar la relacion entre presupuesto de bits, asignacion conjunta Gate/Up y degradacion de calidad, comparando tamanos de 4,277 a 13,740 GB.
- Evaluacion comparativa de formatos: util para equipos que ya usan GGUF y quieren medir el compromiso tamano/calidad del formato TQ frente a las recetas UD equivalentes en llama.cpp.
- Prototipado de asistentes visuales en estaciones de trabajo: con la variante UD-Q8_K_XL (13,740 GB) se obtiene la maxima fidelidad disponible de esta coleccion para tareas que exijan mayor precision numerica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no hay evaluacion end-to-end de PPL/KLD ni de velocidad de inferencia del MTP para esta release. Las unicas verificaciones realizadas son de integridad: registros de tensores exportados, anchos de fila, presupuestos Gate/Up y rangos de tensores fuente retenidos, ademas de SHA256 del payload completo de cada proyeccion MTP y de cada fichero de modelo (en `SHA256SUMS` y `quantization.json`).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del fichero mas overhead de runtime. Referencia por variante: UD-IQ2_XXS ~4,3 GB; UD-IQ2_M ~4,7 GB; UD-IQ3_XXS ~5,1 GB; UD-Q2_K_XL ~5,2 GB; UD-Q3_K_XL ~6,1 GB; UD-Q4_K_XL ~7,0 GB; UD-Q5_K_XL ~7,8 GB; UD-Q6_K_XL ~9,6 GB; UD-Q8_K_XL ~13,7 GB.
- GPU recomendadas: no especificadas por el autor. Por tamano, las variantes Q2-Q4 encajan en GPU de consumo con 8-12 GB; las variantes Q6-Q8 requieren 12-16 GB o mas.
- Cabe en GPU de consumo: si, las variantes de menor tamano, sujeto a disponibilidad de runtime compatible.
- Opciones de despliegue: exclusivamente un runtime TyloQuant/MFQ que soporte Qwen3.5 y tensores TQ nativos RTRELL05. No compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-TQ (esta ficha) | 9B | no disponible | `.mfq` (TQ) | Apache 2.0 | HuggingFace, runtime TyloQuant/MFQ |
| Qwen/Qwen3.5-9B (base) | 9B | no disponible | safetensors (BF16) | Apache 2.0 | HuggingFace |
| unsloth/Qwen3.5-9B-GGUF | 9B | no disponible | GGUF (recetas UD) | Apache 2.0 (heredada) | HuggingFace, llama.cpp/Ollama |

La comparativa se limita a las variantes del mismo modelo base porque la informacion disponible no incluye datos de rendimiento que permitan contrastar con modelos de otros fabricantes. La diferencia practica entre las tres opciones es el formato y el ecosistema de runtime: GGUF ofrece compatibilidad amplia con llama.cpp y Ollama, mientras que TQ exige un runtime especifico pero reduce el tamano en las variantes de menor bits (4,277 GB en IQ2_XXS).

## Limitaciones y advertencias

- Formato propietario: los ficheros `.mfq` no cargan en llama.cpp, Ollama, vLLM ni TGI; sin un runtime TyloQuant/MFQ compatible con Qwen3.5 y tensores RTRELL05, el modelo es inutilizable.
- Sin evaluacion de calidad: no hay PPL, KLD ni benchmarks publicados, por lo que se desconoce la degradacion real de las variantes de 2-3 bits frente al BF16 original.
- Sin medicion de velocidad MTP: el modulo de prediccion multi-token esta incluido pero no se ha verificado su rendimiento en inferencia.
- Idiomas no declarados: el campo de idiomas esta vacio en la model card; no se puede confirmar el soporte multilingue mas alla de lo que ofrezca el base.
- Contexto desconocido: no se especifica la longitud de contexto, lo que impide planificar casos de uso con ventanas largas.
- Riesgo de alucinacion y sesgos: inherentes al modelo base y no documentados en esta publicacion; la cuantizacion agresiva en las variantes IQ2 puede amplificarlos.
- Licencia Apache 2.0: permite uso comercial, pero se heredan las condiciones del modelo base Qwen3.5-9B; conviene verificar la model card original para clausulas adicionales.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que valide el funcionamiento del runtime.
- Pesos de vision sin cuantizar: aunque preserva calidad visual, incrementa el tamano respecto a una cuantizacion completa y condiciona el ahorro real de VRAM.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Tylogi/Qwen3.5-9B-TQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Recetas e imatrix UD: https://huggingface.co/unsloth/Qwen3.5-9B-GGUF
