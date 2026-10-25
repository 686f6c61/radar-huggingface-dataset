# sw-voice-ai/voxcpm2-telugu-stage1b-english-sidon-dedup-refclone-lr1e-4-10ep

## Resumen

VoxCPM2 Telugu stage 1b -> English Swamiji (Sidon) es un ajuste fino (fine-tune) de un modelo de texto-a-voz (TTS) de la familia VoxCPM2, publicado por el usuario sw-voice-ai en HuggingFace. El modelo parte del checkpoint `sw-voice-ai/voxcpm2-telugu-indictts2x-syspin-multisent-lr1e-4-1ep` y se especializa en la síntesis de voz en inglés con la identidad vocal de un hablante concreto denominado "Swamiji (Sidon)", mediante clonación de voz condicionada por un clip de referencia (`reference_wav_path`). El modelo conserva el soporte de telugu (te) e inglés (en) heredado del modelo base.

El interés técnico del checkpoint está en su procedimiento de entrenamiento, no en una innovación arquitectónica: emplea un conjunto de 726 clips (unas 3,8 horas) deduplicado a un clip por grupo de duplicados, y cada elemento de entrenamiento lleva asociado un clip de referencia, con la función de pérdida calculada únicamente sobre el audio objetivo. Se rotan 10 clips de referencia fijos del propio hablante (5-17 s) para que cada objetivo se enfrente a una referencia distinta en cada época, y las referencias (y sus casi-duplicados) se excluyen de los objetivos para evitar fuga de datos.

El resultado es un modelo de 2.290.004.544 parámetros (~2,29 mil millones) distribuido en safetensors con licencia Apache 2.0, pensado para inferencia TTS con clonación de voz de un único hablante en contextos bilingües inglés-telugu. No se han publicado resultados de benchmarks, curvas de evaluación ni métricas objetivas (MOS, WER, SIM) en la información disponible, y el repositorio no registra descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. La model card no describe la arquitectura interna; la nomenclatura indica la familia VoxCPM2, pero no se confirma tipo de red, tokenizador de audio ni decodificador |
| Parametros totales | 2.290.004.544 (~2,29 mil millones), dato real de los safetensors |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible (modelo TTS; la model card no especifica limite de tokens de texto ni de audio) |
| Tipos de cuantizacion | No disponible. El repositorio solo contiene safetensors; no se publican versiones GGUF, int8 ni int4 |
| Idiomas soportados | Telugu (te) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 9,5 GB) |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura interna del modelo: no se indica si se trata de un transformer autorregresivo sobre tokens de audio, de un modelo difusión, de un esquema hibrido ni de un enfoque tokenizer-free. Lo unico deducible de los datos disponibles es el tamano (2,29 mil millones de parametros) y el pipeline declarado (`text-to-speech`), ademas de la capacidad, implícita en el flujo de entrenamiento, de condicionarse a un clip de referencia para la clonacion de voz.

El entrenamiento descrito es un fine-tune supervisado sobre el checkpoint base `voxcpm2-telugu-indictts2x-syspin-multisent-lr1e-4-1ep`, con los siguientes hiperparametros y datos: conjunto "Sidon" deduplicado a un clip por grupo de duplicados (726 clips, ~3,8 horas); cada elemento de entrenamiento incluye un clip de referencia mediante el prefijo `reference_wav_path` de VoxCPM2, y la perdida se calcula solo sobre el objetivo; se emplean 10 clips de referencia fijos del hablante (5-17 s) que rotan de forma que cada objetivo ve una referencia distinta en cada epoca, excluyendo las referencias y sus casi-duplicados del conjunto de objetivos. El total es de 7150 filas (10 epocas), micro-batch 4 con acumulacion 4 (batch efectivo 16), 447 pasos y learning rate 1e-4 con scheduler coseno. No se menciona uso de RLHF, DPO ni datos de preferencia, algo esperable en un modelo TTS.

## Capacidades

- Sintesis de voz (texto a audio) en ingles con la identidad vocal del hablante "Swamiji (Sidon)".
- Clonacion de voz condicionada a referencia: requiere pasar un clip del hablante en `reference_wav_path`; la model card indica explicitamente usarlo con una referencia de Swamiji.
- Capacidad bilingue heredada del modelo base: telugu (te) e ingles (en), con posible manejo de texto code-switched, aunque no se documenta de forma explicita.
- Generacion de audio a partir de texto con prosodia condicionada por la referencia, no solo por el texto.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no aplica a un modelo TTS).
- No se documenta salida de marcas de tiempo, control de emocion, velocidad ni estilo mas alla del condicionamiento por referencia.
- No se documentan modos especiales (thinking, vision, audio de entrada) ni capacidades multimodales.

## Casos de uso

- Doblaje y localizacion de discursos: el modelo permite regenerar en ingles el audio de un ponente concreto a partir de transcripciones, usando uno de los clips de referencia del propio hablante para mantener el timbre en toda la serie de videos.
- Produccion de audiolibros y material devocional: al estar entrenado sobre ~3,8 horas de un unico hablante, es adecuado para narrar textos largos manteniendo consistencia de voz entre capitulos, pasando siempre la misma referencia.
- Contenido educativo bilingue te-en: instituciones que producen material en telugu con terminologia tecnica en ingles pueden sintetizar locuciones mixtas sin cambiar de voz a mitad de frase.
- Prototipado rapido de asistentes de voz con marca blanca: un equipo puede generar demos de interfaz conversacional con una voz concreta antes de contratar grabaciones reales, al ser la licencia Apache 2.0 permisiva para uso comercial.
- Generacion de datos sinteticos para ASR: producir horas de audio etiquetado con un timbre concreto para aumentar la variabilidad de hablante en corpus de entrenamiento de reconocimiento de voz en telugu e ingles.
- Accesibilidad y lectura de documentos: convertir articulos o documentacion tecnica en audio con una voz estable y reconocible para usuarios con dificultades de lectura, siempre que el texto este en ingles o telugu.
- Pruebas de regresion en pipelines de audio: usar el modelo como generador determinista de referencias para validar etapas posteriores (normalizacion, mezcla, codificacion) con un timbre fijo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MOS, CMOS, SIM-O, WER ni comparaciones objetivas con otros sistemas TTS, y los resultados de busqueda web no aportan datos sobre este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir de 2.290.004.544 parametros, no confirmado por el autor): en fp32 los pesos ocupan unos 9,2 GB, lo que concuerda con el repositorio de 9,5 GB; en fp16/bf16 unos 4,6 GB; en int8 unos 2,3 GB. Hay que sumar activaciones, cache de atencion y buffers de audio, por lo que conviene anadir un 30-50 % sobre el peso de los parametros.
- GPU consumer: el modelo cabe en tarjetas de 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4070 Ti Super, RTX 4080, RTX 4090) en fp16 con margen razonable; en fp32 es ajustado en 12 GB y comodo a partir de 16 GB (RTX 4060 Ti 16 GB, RTX 5060 Ti 16 GB).
- GPU de datacenter recomendadas para produccion con concurrencia: NVIDIA L4 (24 GB), A10G, A100 40/80 GB y H100; para una sola peticion por GPU basta una L4.
- Opciones de despliegue: no documentadas en la informacion disponible. Al publicarse solo safetensors, no hay soporte conocido en llama.cpp, Ollama ni en servidores de inferencia de texto estandar; la carga requiere la implementacion del autor del modelo base VoxCPM2, que no se referencia en la model card.
- Latencia y throughput: no disponibles. No se publican mediciones de RTF (real-time factor), ni latencia por caracter, ni tamano maximo de lote soportado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion de referencia | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (voxcpm2-telugu-stage1b-english-sidon-dedup-refclone-lr1e-4-10ep) | 2.290.004.544 | Referencias de 5-17 s; contexto no disponible | te, en | Apache 2.0 | Fine-tune con clonacion por referencia sobre 726 clips (~3,8 h) deduplicados |
| sw-voice-ai/voxcpm2-telugu-stage1b-english-sidon-lr1e-4-10ep | No disponible | No disponible | te, en | No disponible en la informacion | Mismo esquema de hiperparametros, pero sin deduplicacion y sin referencia por elemento |
| sw-voice-ai/voxcpm2-telugu-indictts2x-syspin-multisent-lr1e-4-1ep (modelo base) | No disponible | No disponible | te, en | No disponible en la informacion | Checkpoint de partida del fine-tune, orientado a telugu multioracion |
| XTTS-v2 (Coqui) | ~467 M (dato de ecosistema, no verificado en esta busqueda) | Referencia de pocos segundos | Multilingue | CPML (no comercial) | Referencia habitual en clonacion zero-shot; licencia incompatible con uso comercial |
| VoxCPM (OpenBMB) | ~0,5 B (dato de ecosistema, no verificado en esta busqueda) | No disponible | zh, en | Apache 2.0 | Familia de la que deriva la nomenclatura VoxCPM2; sin confirmacion de parentesco arquitectonico |

Las dos ultimas filas se incluyen como referencia de ecosistema y no estan verificadas con la informacion proporcionada; los datos de los tres primeros modelos provienen de la model card y de los metadatos de HuggingFace.

## Limitaciones y advertencias

- Modelo de un unico hablante: todo el entrenamiento gira en torno a la voz "Swamiji (Sidon)". No es un modelo TTS general ni multihablante; el uso con otras voces no esta soportado por los datos.
- Dependencia obligatoria de referencia: la model card indica que debe usarse con `reference_wav_path` apuntando a un clip de Swamiji. Sin esa referencia el comportamiento no esta documentado.
- Dataset pequeno y especializado: 726 clips y ~3,8 horas implican riesgo de sobreajuste al estilo, ritmo y dominio del corpus (probablemente discurso religioso o formal), con posible degradacion en textos de otro registro.
- Sin evaluacion objetiva: no hay MOS, WER, SIM-O ni pruebas de inteligibilidad publicadas, por lo que no se puede estimar la calidad frente a alternativas sin evaluacion propia.
- Riesgo de errores de pronunciacion y omisiones: en TTS, los fallos tipicos son palabras saltadas, repeticiones, prosodia incorrecta en numeros, siglas y nombres propios, y pronunciacion erronea de terminos tecnicos en ingles dentro de texto en telugu.
- Idiomas limitados a te y en: no hay soporte documentado de castellano ni de otras lenguas; forzar otros idiomas producira resultados no validos.
- Licencia Apache 2.0 sobre los pesos, pero no sobre la identidad vocal: la licencia permisiva no cubre derechos de imagen ni de voz del hablante original. Cualquier uso comercial de la voz clonada requiere consentimiento explicito del hablante y verificacion legal en la jurisdiccion de despliegue.
- Trazabilidad limitada: repositorio sin descargas ni validacion de la comunidad, creado y actualizado el 2026-10-25, sin paper, sin demo y sin documentacion de la implementacion de inferencia.
- Sin filtros de seguridad documentados: no se describe moderacion de contenido de entrada ni de salida, lo que es relevante si el modelo se expone como servicio publico (riesgo de deepfake de voz).
- Fechas y metadatos del repositorio no verificables de forma independiente; conviene revalidar el checkpoint antes de integrarlo en produccion.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/sw-voice-ai/voxcpm2-telugu-stage1b-english-sidon-dedup-refclone-lr1e-4-10ep
- Modelo base: https://huggingface.co/sw-voice-ai/voxcpm2-telugu-indictts2x-syspin-multisent-lr1e-4-1ep
- Variante sin deduplicacion ni referencia por elemento: https://huggingface.co/sw-voice-ai/voxcpm2-telugu-stage1b-english-sidon-lr1e-4-10ep
- Paper, blog, repositorio de codigo y demo: no disponibles en la informacion proporcionada.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo (los resultados obtenidos corresponden a SolidWorks, Star Wars y la Wikipedia en frances sobre la sigla "SW").
