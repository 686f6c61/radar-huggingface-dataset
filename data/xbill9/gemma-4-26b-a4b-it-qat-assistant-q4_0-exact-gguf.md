# xbill9/gemma-4-26B-A4B-it-qat-assistant-q4_0-exact-gguf

## Resumen

Este repositorio contiene una conversión no oficial a GGUF del *drafter* (modelo borrador) de decodificación especulativa de Google para Gemma 4 26B A4B-it QAT, publicada por el usuario xbill9 de forma independiente a Google. No es un modelo de lenguaje autónomo: es la cabeza de predicción multi-token (MTP) que propone tokens candidatos para que el modelo objetivo de 26B los verifique. Consta de 419.711.492 parámetros en 4 capas transformer de anchura 1024, con solo consultas (las claves y valores salen de la caché del objetivo), y se distribuye en un único fichero GGUF de 251.939.648 bytes cuantizado íntegramente en Q4_0 sobre la rejilla que produjo el entrenamiento con conciencia de cuantización (QAT).

Su interés práctico está en el coste de despliegue: frente al Q8_0 que genera el conversor de llama.cpp, reduce el espacio en disco de 461.785.920 a 251.939.648 bytes y la VRAM que añade el *drafter* de 508 a 308 MiB (medido con nvidia-smi), con una tasa de aceptación prácticamente idéntica (0,654 frente a 0,657). Sobre una RTX 3050 OEM de 8 GB, con el objetivo de 26B en q4_0 y 21 de las 30 capas de expertos en RAM, pasa de 29,6 tok/s sin *drafter* a 36,8 tok/s (1,24x).

La relevancia actual es que hace viable la decodificación especulativa en equipos *consumer* de 8 GB, un escenario donde el modelo de 26B no cabe completo. El precio es un recorte de la ventana de contexto utilizable (131.072 tokens con *drafter* frente a 262.144 sin él, con caché KV q4_0) y cambios en el texto generado en modo *greedy*. La licencia declarada es Apache 2.0, con los términos de Gemma 4 de Google aplicables.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso de 4 capas y anchura 1024 (3 de atención de ventana deslizante y 1 de atención completa), con solo consultas; *drafter* MTP que toma claves y valores de la caché del objetivo y se conecta a su estado oculto de 2816 mediante dos proyecciones |
| Parámetros totales | 419.711.492 (dato de safetensors del repo) |
| Parámetros activos | no aplica: el *drafter* es denso; el modelo *mixture of experts* es el objetivo (26B A4B) |
| Longitud de contexto | la del objetivo; con este *drafter* y caché KV q4_0 se cargan 131.072 tokens con 21 capas de expertos en RAM en una GPU de 8 GB (262.144 sin *drafter*) |
| Tipos de cuantización | Q4_0 en todas las matrices de pesos (embedding, 4 x q/o de atención, 4 x gate/up/down de MLP, 2 proyecciones), con escala de bloque en fp16; normas y escalas en F32 |
| Idiomas soportados | no disponible (los metadatos del repo no los declaran; el vocabulario es el del objetivo, 262.144 entradas) |
| Licencia | Apache 2.0, con los términos de Gemma 4 de Google |
| Formato de pesos | GGUF (llama.cpp), fichero único |
| Tamaño del fichero | 251.939.648 bytes (0,25 GB); el Q8_0 equivalente del conversor ocupa 461.785.920 bytes |
| SHA-256 | `6cee35a091e6b7572be5b972fc994cde0c95dfa392466bdac0c184fe9060090b` |
| VRAM añadida | 308 MiB (508 MiB en Q8_0) |
| Modelo objetivo requerido | Gemma 4 26B A4B-it QAT q4_0; Google indica que el *drafter* debe coincidir con la precisión QAT del objetivo |
| Modelo base | google/gemma-4-26B-A4B-it-qat-q4_0-unquantized-assistant (revisión 9537141) |
| Build de llama.cpp probado | `7182ef71e` (único verificado) |

## Arquitectura y entrenamiento

El *drafter* es un transformer denso de 4 capas con anchura 1024: tres capas usan atención de ventana deslizante y una atención completa. Solo calcula las consultas; las claves y los valores proceden de la caché KV del modelo objetivo, de modo que el borrador reutiliza el contexto ya computado por el modelo grande. Dos proyecciones lineales conectan su estado oculto de 1024 dimensiones con el estado oculto de 2816 del objetivo, y la cabeza de salida es el embedding atado de 262.144 tokens (unas 268 millones de parámetros de las 419,7 totales). El *drafter* es denso; la mezcla de expertos (8 de 128 expertos por token, en 30 capas) corresponde al objetivo de 26B.

Este repositorio no entrena nada: es una cuantización. Cada matriz de pesos se llevó a Q4_0 recuperando el paso entrenado de cada bloque (magnitud máxima dividida entre 8, 7, … 1, el que deja los 32 valores en un nivel entero), refinado por mínimos cuadrados y guardado como escala de bloque en fp16. Ningún bloque quedó fuera de la rejilla y entre el 96,6 % y el 97,0 % de los valores por tensor reproducen exactamente la fuente en bf16 al redondear de vuelta. Los metadatos (hiperparámetros, tokenizador, plantilla de chat) son la salida del conversor de llama.cpp con `general.file_type` fijado a Q4_0. El autor publica los scripts y registros del proceso en el directorio `evidence/` (ver enlaces).

## Capacidades

- No genera texto de forma autónoma: propone tokens candidatos que el modelo objetivo verifica uno a uno. Solo tiene consultas, así que necesita la caché KV del objetivo para funcionar.
- Decodificación especulativa MTP en llama.cpp mediante `--spec-type draft-mtp`, con `--spec-draft-n-max` configurable (1 o 2 tokens recomendados; 3 degrada).
- Aceleración dependiente del tipo de prompt, medida a 2 tokens draftados: código 1,51x, datos factuales 1,43x, explicaciones 1,17x, chat 1,16x, relato 1,12x, resumen 1,12x.
- Inferencia solo de texto: el *drafter* no tiene partes de visión ni de audio.
- Capacidades multilingües: no documentadas en la información disponible.
- *Tool calling* y razonamiento multi-paso: no son capacidades propias del *drafter*; corresponden al objetivo. En el *drafter* del modelo denso de 12B, construido de la misma forma, BFCL quedó a nivel con y sin él (sin cifras publicadas).
- El repositorio está etiquetado como `endpoints_compatible` en HuggingFace, aunque la ejecución documentada es llama.cpp local.
- Trazabilidad de la cuantización: script de construcción, registro por tensor, informe JSON y tabla de velocidades por prompt incluidos en `evidence/`.

## Casos de uso

- **Generación de código en un asistente local**: es el régimen con mayor ganancia medida (1,51x en prompts de código a 2 tokens draftados y 256 tokens generados). Con una GPU de 8 GB se puede mantener el objetivo de 26B en q4_0 con 21 capas de expertos en RAM y este *drafter* en VRAM, algo impensable con el objetivo completo en memoria de vídeo.
- **Atención al cliente automatizada en local**: la ventana de 131.072 tokens con caché KV q4_0 permite conversaciones multi-turno e historiales largos, y el tipo de prompt de chat rinde 1,16x, por lo que el coste por respuesta baja sin salir del equipo.
- **Extracción de datos y preguntas factuales sobre documentación**: los prompts factuales son el segundo mejor caso (1,43x); con 131.072 tokens de contexto se pueden pasar contratos, informes o manuales completos y hacer preguntas sobre ellos con latencia reducida.
- **Generación de documentación técnica y explicaciones**: 1,17x en prompts explicativos; útil en pipelines que redactan guías o comentarios a partir de código, donde el *drafter* amortiza sus 308 MiB de VRAM.
- **Resumen por lotes de documentos largos**: 1,12x en resumen, con la ventaja de que un solo proceso `llama-server` sirve tanto el objetivo como el borrador y admite peticiones concurrentes con contexto largo.
- **Generación creativa y narrativa**: 1,12x en prompts de relato; la ganancia es modesta, así que el caso de uso razonable es un servicio de escritura asistida que ya tenga desplegado el objetivo y quiera un pequeño recorte de latencia sin cambiar de hardware.
- **Investigación reproducible en decodificación especulativa**: el repo incluye `spec_ab.py`, `speed-summary.txt` y los registros del conversor, lo que permite repetir el experimento (seis prompts, 256 tokens, *greedy*, mediana de tres ejecuciones, media geométrica) y contrastar el efecto del enrutado de expertos en CPU sobre la tasa de aceptación.
- **Prototipado en estaciones de trabajo híbridas CPU+GPU**: el patrón `-ncmoe` (expertos de las primeras N capas en CPU) permite ajustar el equilibrio entre VRAM, contexto y velocidad en tarjetas de 8 GB, un escenario habitual en investigación con hardware limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K, BFCL) para este *drafter* sobre el objetivo de 26B en la información disponible. El autor indica explícitamente que la calidad de respuesta con este *drafter* no se ha medido en el 26B, y que en el *drafter* del 12B, construido igual, GSM8K y BFCL puntuaron a nivel con y sin él.

Lo que sí se publica es rendimiento de inferencia. Entorno: RTX 3050 OEM (8 GB) en un equipo con i7-5820K (6 núcleos, DDR4 de cuatro canales), llama.cpp `7182ef71e`, objetivo `google/gemma-4-26B-A4B-it-qat-q4_0-gguf` con `-ncmoe 20 -t 8`, flash attention, caché KV f16, `-c 8192`; seis prompts (código, chat, relato, explicación, datos, resumen), 256 tokens, *greedy*, mediana de tres ejecuciones y media geométrica entre prompts.

| Métrica | Sin *drafter* | Este GGUF (Q4_0) | Q8_0 del conversor |
|---|---:|---:|---:|
| Generación | 29,6 tok/s | 36,8 tok/s | 35,6 tok/s |
| Aceleración | 1,00x | 1,24x | 1,20x |
| Tokens draftados aceptados | — | 0,654 | 0,657 |
| VRAM añadida | 0 MiB | 308 MiB | 508 MiB |
| Tamaño en disco | — | 251.939.648 B | 461.785.920 B |

| Tokens draftados por paso | 1 | 2 | 3 |
|---|---:|---:|---:|
| Aceleración, *greedy* | 1,25x | 1,24x | 1,01x |
| Aceleración, temperatura 0,8 | 1,25x | 1,22x | 0,61x |
| Tokens draftados aceptados | 0,760 | 0,654 | 0,579 |

| Tipo de prompt (2 tokens draftados) | Aceleración |
|---|---:|
| Código | 1,51x |
| Datos factuales | 1,43x |
| Explicación | 1,17x |
| Chat | 1,16x |
| Relato | 1,12x |
| Resumen | 1,12x |

## Requisitos de hardware

- **Disco**: 251.939.648 bytes para el *drafter*; el objetivo QAT q4_0 de 26B ocupa 14,4 GB.
- **VRAM del *drafter***: 308 MiB medidos con nvidia-smi (frente a 508 MiB del Q8_0). Es VRAM adicional sobre la que ya consume el objetivo.
- **GPU probada**: RTX 3050 OEM de 8 GB. El objetivo no cabe completo, así que sus expertos se descargan a RAM del sistema con `-ncmoe`.
- **Configuración medida en 8 GB**: `-ncmoe 21` con *drafter* (contexto 131.072 con caché KV q4_0); `-ncmoe 22` sin *drafter* permite 262.144 tokens. 262.144 no carga con el *drafter* ni siquiera con 24 capas en RAM.
- **Otras GPU**: no se han publicado medidas en A100, H100, RTX 4090 ni en tarjetas con 16 GB o más, donde el objetivo de 14,4 GB cabría presumiblemente sin descargar expertos; ese escenario no está verificado en la información disponible.
- **Aceleración**: el autor solo midió con CUDA; no hay datos de ROCm, Metal ni CPU pura.
- **Despliegue**: llama.cpp (probado con `llama-server` en el build `7182ef71e`). Requiere soporte de `--spec-type draft-mtp` y `-md`/`-ngld`. No hay instrucciones ni soporte documentado para vLLM, TGI, Ollama ni otros motores en la información disponible.
- **Comando de referencia**:

```
llama-server -m gemma-4-26B_q4_0-it.gguf -ngl 99 -ncmoe 21 -fa 1 -c 131072 -ctk q4_0 -ctv q4_0 -t 8 \
  -md gemma-4-26B-A4B-it-qat-assistant-q4_0-exact.gguf --spec-type draft-mtp -ngld all --spec-draft-n-max 2
```

- **Rendimiento esperado**: 36,8 tok/s en el escenario descrito; la ganancia cae a 1,01x con 3 tokens draftados en *greedy* y a 0,61x con 3 tokens a temperatura 0,8, por lo que la configuración recomendada es 1 o 2.

## Comparativa con modelos similares

No se documentan en la información disponible otros *drafters* comparables para Gemma 4 26B A4B-it aparte de las dos variantes del propio autor y el *drafter* del modelo denso de 12B. La comparación posible es esta:

| Variante | Tamaño | VRAM añadida | Generación | Aceleración | Aceptación | Licencia |
|---|---:|---:|---:|---:|---:|---|
| Este GGUF (Q4_0 exacto) | 251.939.648 B | 308 MiB | 36,8 tok/s | 1,24x | 0,654 | Apache 2.0 |
| Q8_0 del conversor de llama.cpp | 461.785.920 B | 508 MiB | 35,6 tok/s | 1,20x | 0,657 | Apache 2.0 |
| Sin *drafter* (objetivo solo) | — | 0 MiB | 29,6 tok/s | 1,00x | — | — |
| *Drafter* del denso de 12B (misma tarjeta, no equivalente) | no disponible | no disponible | no disponible | 2,01x | no disponible | Apache 2.0 |

A igualdad de aceptación, este fichero rinde 1,03x respecto al Q8_0. La ganancia es notablemente menor que la del *drafter* del modelo denso de 12B sobre la misma tarjeta (2,01x), diferencia que el autor atribuye, como hipótesis no medida, a que cada token draftado que el objetivo verifica se enruta a 8 de sus 128 expertos, que la CPU debe leer cuando están en RAM.

## Limitaciones y advertencias

- **No es un modelo autónomo**: sin el objetivo Gemma 4 26B A4B-it QAT q4_0 no puede generar texto; solo calcula consultas y depende de la caché KV del objetivo. Ejecutarlo aislado no tiene sentido técnico.
- **Emparejamiento estricto**: Google exige que el *drafter* coincida con la precisión QAT del objetivo. Usarlo con un objetivo q8_0 o con otra cuantización invalida la aceptación observada.
- **Coste de contexto**: en una GPU de 8 GB, la ventana máxima baja de 262.144 a 131.072 tokens con caché KV q4_0 (21 capas de expertos en RAM frente a 22). 262.144 no carga ni con 24 capas descargadas.
- **El texto *greedy* cambia**: con 2 tokens draftados, las respuestas *greedy* difieren de las del objetivo sin *drafter* en 18 de 18 prompts (12 de 18 con 1 token). El autor lo atribuye a redondeos en la comprobación por lotes, en sus propias palabras como inferencia no medida. En pipelines con salidas comparadas byte a byte, esto rompe la reproducibilidad.
- **Calidad no medida en el 26B**: no hay evaluación de GSM8K, BFCL ni calidad de respuesta para este *drafter* sobre el objetivo de 26B. La evidencia de no degradación procede del *drafter* del 12B, no de este.
- **Ganancia limitada y sensible a la configuración**: 1,24x como máximo, con caída a 1,01x (3 tokens, *greedy*) y a 0,61x (3 tokens, temperatura 0,8). El propio autor desaconseja 3 tokens draftados.
- **Build único verificado**: todas las cifras proceden de llama.cpp `7182ef71e`. No hay datos de otras versiones ni de otros motores, y el soporte de `draft-mtp` puede cambiar entre builds.
- **Solo texto**: sin visión ni audio, aunque el objetivo multimodal los tenga.
- **Idiomas no declarados**: los metadatos del repo no especifican cobertura lingüística; no se puede asumir un comportamiento multilingüe verificado.
- **Alucinación**: el *drafter* no verifica contenido, solo propone tokens que el objetivo acepta o rechaza; cualquier alucinación proviene del objetivo y no se corrige por el uso del borrador.
- **Licencia**: Apache 2.0 según el autor, pero el modelo base es de Google y se aplican los términos de Gemma 4, que hay que revisar antes de un uso comercial en producción. Es una build no oficial, sin soporte de Google.
- **Madurez**: 0 descargas y 0 *likes* en el momento de la consulta, un único autor y publicación el 18 de octubre de 2026. No hay revisión independiente de la cuantización más allá de los registros del propio autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/xbill9/gemma-4-26B-A4B-it-qat-assistant-q4_0-exact-gguf
- Modelo base (drafter sin cuantizar de Google): https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-unquantized-assistant
- Objetivo recomendado (QAT q4_0 GGUF): https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-gguf
- Términos de licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Evidencia y scripts del build: https://github.com/xbill9/gemma4-dev/tree/main/local-llamacpp-3050oem-26b-q4_0
