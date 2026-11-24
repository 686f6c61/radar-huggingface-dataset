# Sunbird/SunflowerASR-51-african-languages

## Resumen

SunflowerASR-51-african-languages es un modelo de reconocimiento automatico del habla (ASR) desarrollado por Sunbird, construido como un fine-tuning de Whisper large-v3. Su objetivo es cubrir 51 idiomas africanos, muchos de ellos con recursos limitados y practicamente ausentes en los sistemas ASR comerciales, ademas del ingles y el frances como lenguas vehiculares. El modelo tiene 1.543.490.560 parametros y se distribuye en formato safetensors bajo licencia Apache 2.0, aunque el acceso esta restringido y requiere aceptar las condiciones en Hugging Face.

El modelo parte de `huwenjie333/whisper-v3-ft-af51-0903`, un checkpoint intermedio ya ajustado sobre Whisper large-v3, y aplica un entrenamiento adicional con GRPO (Group Relative Policy Optimization), una tecnica de optimizacion por refuerzo habitualmente asociada a modelos de lenguaje pero poco frecuente en ASR. Este enfoque busca optimizar directamente metricas de error de transcripcion (CER) en lugar de la perdida de entropia cruzada tradicional, lo que resulta especialmente util en idiomas con ortografias complejas o datos escasos.

La relevancia del modelo reside en su cobertura linguistica: incluye idiomas como yoruba, hausa, swahili, amharo, zulu, xhosa, wolof, somali, malgache y un largo etcetera de lenguas africanas, con 1957 descargas y 45 likes en el momento de la consulta. Es una pieza relevante para proyectos de inclusion digital, transcripcion de contenido local y preservacion linguistica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 1.543.490.560 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper large-v3 emplea ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | 51 idiomas: eng, ach, afr, aka, amh, bam, bem, ber, cgg, dag, dga, ewe, fra, ful, hau, ibo, kab, kau, kik, kin, kln, koo, kpo, led, lgg, lin, lth, lug, luo, luy, mlg, myx, nbl, nya, nyn, orm, pcm, ruc, rwm, sna, som, sot, swa, teo, tsn, ttj, wol, xho, xog, yor, zul |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura encoder-decoder de Whisper large-v3, un transformer con encoder de audio y decoder autoregresivo que procesa ventanas de 30 segundos de audio muestreado a 16 kHz y genera tokens de texto. Cuenta con aproximadamente 1.540 millones de parametros, coherente con el tamano de Whisper large-v3.

El entrenamiento parte de `huwenjie333/whisper-v3-ft-af51-0903`, un checkpoint ya ajustado sobre Whisper large-v3 para el conjunto de 51 idiomas africanos. Sobre esa base se aplica GRPO (Group Relative Policy Optimization), una variante de optimizacion por refuerzo que compara grupos de hipotesis generadas para el mismo audio y recompensa las que reducen el error de transcripcion. Los datasets empleados en el proceso de optimizacion son `huwenjie333/speech-cer-filtered-0.4-full` y `huwenjie333/speech-cer-filtered-0.4-top200-cer-gap`, segun los metadatos del repositorio. No se dispone de informacion detallada sobre el numero total de horas de audio, la composicion exacta del corpus ni los hiperparametros de entrenamiento.

## Capacidades

- Transcripcion de voz a texto en 51 idiomas africanos, mas ingles y frances.
- Reconocimiento de habla multilingue con un unico modelo, sin necesidad de cargar un checkpoint distinto por idioma.
- Manejo de idiomas de bajos recursos como acholi (ach), bambara (bam), bemba (bem), kabyle (kab), kikuyu (kik), lingala (lin), luo (luo), malgache (mlg), nyanja (nya), oromo (orm), sango (sg), sesotho (sot), tsonga (tsn), wolof (wol) o xhosa (xho), entre otros.
- Procesamiento de audio en ventanas de 30 segundos, segun la arquitectura Whisper.
- Integracion con la libreria `transformers` y el pipeline `automatic-speech-recognition`.
- Compatibilidad con endpoints de inferencia (tag `endpoints_compatible`).
- No se documentan capacidades de traduccion, diarizacion de hablantes, timestamps por palabra ni tool calling; la informacion disponible no las confirma.

## Casos de uso

- Transcripcion de contenido audiovisual local: cadenas de radio y television en swahili, yoruba, hausa o amharo pueden generar subtitulos automaticos con un unico modelo desplegado, evitando mantener un sistema distinto por idioma.
- Inclusion digital en servicios publicos: administraciones de paises africanos pueden transcribir llamadas o mensajes de voz de ciudadanos en su lengua materna (por ejemplo, wolof en Senegal o bambara en Mali) para su posterior tramitacion.
- Investigacion linguistica y preservacion: corpus orales de lenguas con poca representacion escrita (acholi, luganda, kikuyu) pueden transcribirse de forma masiva para alimentar diccionarios y estudios.
- Atencion al cliente por voz: empresas de telefonia o banca en Africa subsahariana pueden integrar el modelo en un pipeline ASR mas NLU para atender consultas en swahili, zulu o xhosa sin depender de proveedores propietarios.
- Accesibilidad: generacion de subtitulos en directo para personas con discapacidad auditiva en paises donde las herramientas comerciales no cubren la lengua local.
- Analisis de medios y monitorizacion: seguimiento de emisiones de radio en varios idiomas simultaneamente para estudios de opinion o verificacion de hechos, gracias a la cobertura multilingue en un solo checkpoint.
- Archivado y busqueda de audio: transcripcion de archivos historicos de emisoras locales para permitir busqueda por texto sobre el contenido hablado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision FP16: aproximadamente 3,1 GB solo para los pesos (1.543 millones de parametros), mas memoria para activaciones y buffers de audio; en la practica se recomienda al menos 6-8 GB de VRAM.
- En cuantizacion INT8 la huella de pesos se reduce a unos 1,5-2 GB, aunque no se especifican en la informacion los formatos de cuantizacion soportados.
- GPU recomendadas: NVIDIA A100, H100 o L40S para despliegues de alto throughput; RTX 4090, RTX 3090 o RTX A6000 para inferencia en servidor de un solo nodo.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080) en FP16 o INT8.
- Opciones de despliegue: `transformers` con pipeline `automatic-speech-recognition`, servidores de inferencia compatibles con la API de Hugging Face (tag `endpoints_compatible`); no se confirma soporte explicito de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SunflowerASR-51-african-languages | 1.543 M | 30 s por ventana (Whisper) | 51 idiomas africanos + eng, fra | Apache 2.0 | Gated en Hugging Face |
| Whisper large-v3 (OpenAI) | 1.550 M aprox. | 30 s por ventana | ~99 idiomas, cobertura africana limitada | MIT | Abierto |
| MMS (Meta) | variable por idioma | no disponible | mas de 1000 idiomas | CC-BY-NC 4.0 | Abierto |
| Seamless M4T | no disponible | no disponible | ~100 idiomas de entrada | CC-BY-NC 4.0 | Abierto |

La comparacion con Whisper large-v3 es la mas directa, ya que SunflowerASR parte de el; la diferencia principal es la especializacion en lenguas africanas y el ajuste con GRPO. Frente a MMS y Seamless M4T, la ventaja de SunflowerASR es la licencia Apache 2.0, que permite uso comercial sin las restricciones no comerciales de los modelos de Meta.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de descargar los pesos.
- Sesgos desconocidos: no se documenta el equilibrio del corpus de entrenamiento entre idiomas; es probable que los idiomas con mas datos (swahili, yoruba, hausa) rindan mejor que los de muy bajos recursos (sango, tigrinya, venda).
- Riesgo de alucinacion: como todo modelo Whisper, puede generar texto plausible en silencios o ruido, especialmente en idiomas con pocos datos.
- Limitacion de contexto: la ventana de audio de 30 segundos obliga a segmentar audios largos, con riesgo de cortes en fronteras de palabra si la segmentacion no es cuidadosa.
- Cobertura limitada de variantes dialectales: la lista de 51 idiomas no especifica que variantes o dialectos se cubren dentro de cada codigo ISO.
- Uso comercial: la licencia Apache 2.0 lo permite, pero conviene revisar las condiciones del gate de Hugging Face y de los datasets de origen por posibles restricciones adicionales.
- No se documentan requisitos de normalizacion de audio, marcas de idioma ni comportamiento en code-switching dentro de una misma frase.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sunbird/SunflowerASR-51-african-languages
- Modelo base intermedio: https://huggingface.co/huwenjie333/whisper-v3-ft-af51-0903
- Whisper large-v3 (OpenAI): https://huggingface.co/openai/whisper-large-v3
- Dataset de optimizacion (full): https://huggingface.co/datasets/huwenjie333/speech-cer-filtered-0.4-full
- Dataset de optimizacion (top200 CER gap): https://huggingface.co/datasets/huwenjie333/speech-cer-filtered-0.4-top200-cer-gap
- Referencia arXiv indicada en los metadatos: arxiv:2610.30663 (no verificable en la informacion disponible)
