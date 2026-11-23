# yzk9/index-translate-asmr-9B

## Resumen

index-translate-asmr-9B es un ajuste fino por supervisión (SFT) del modelo IndexTeam/Index-Translate-9B, desarrollado por el usuario yzk9 para Ownsei. Su propósito concreto es traducir diálogos de audio japonés de estilo anime (ASMR y audio-dramas) a subtítulos en chino tradicional, preservando el registro, la cercanía entre personajes y el grado de franqueza o eufemismo del original. El modelo no procesa audio: recibe texto japonés ya transcrito y devuelve subtítulos alineados por identificador.

El modelo base Index-Translate-9B pertenece a la familia Qwen3.5 (según las etiquetas del repositorio) y cuenta con 9.197.093.888 parámetros. Este ajuste concreto se distribuye en formato GGUF cuantizado (Q4_K_M y Q5_K_M) con el LoRA ya fusionado, además del adaptador PEFT original, y se ha validado su inferencia en llama.cpp sobre una RTX 4070 Ti de 12 GiB.

La relevancia de esta ficha es acotada: se trata de un modelo muy especializado, con cero descargas y cero valoraciones en el momento de la consulta, orientado a un flujo de trabajo de subtitulado dentro de la aplicación Ownsei. Su interés técnico reside en el pipeline de traducción con glosario, contexto y estilo, y en el uso del head MTP del modelo base para decodificación especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5, con capas de atención, GatedDeltaNet y MLP; incluye head MTP (multi-token prediction) heredado del modelo base |
| Parametros totales | 9.197.093.888 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como especificación oficial; los ejemplos de uso emplean `-c 8192` como capacidad total de entrada y salida |
| Tipos de cuantizacion | Q4_K_M (5,78 GB) y Q5_K_M (6,64 GB); el adaptador LoRA se distribuye en PEFT sin cuantizar |
| Idiomas soportados | japonés (ja) y chino tradicional (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) y safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El modelo parte de Index-Translate-9B en la revisión `4e06279e62352dab96bbeb6fa0579bca5e822d75`. Sobre esa base se aplicó un ajuste fino con LoRA en BF16: rango 16, alpha 16, dropout 0 y 43.278.336 parámetros entrenables, aplicados a las capas lineales de atención de texto, GatedDeltaNet y MLP. La función de pérdida se calcula sobre las respuestas del asistente y el token de fin de turno.

El conjunto de datos consta de 2.556 pares de diálogos paralelos, agrupados en 369 muestras de varias frases y divididos por obra para evitar filtración entre entrenamiento y validación. Los datos provienen de ASR y guiones japoneses junto con subtítulos humanos en chino, con edición del japonés para alinearlo semánticamente con el subtítulo y normalización del chino al estilo de subtítulo tradicional. El entrenamiento usó fused AdamW con LR 2e-5, weight decay 0,01, scheduler coseno y warmup de 10 pasos, micro-batch 2 con acumulación 8 (batch efectivo 16) y secuencias de hasta 3.072 tokens. Los pesos publicados corresponden al paso 48 de un total previsto de 72 (3 épocas). El head MTP se conserva del modelo base, lo que permite activar decodificación especulativa en llama.cpp con `--spec-type draft-mtp --spec-draft-n-max 2`.

## Capacidades

- Traducción japonés a chino tradicional de diálogos de audio, con salida estructurada en JSON por identificador de línea.
- Procesamiento por lotes de entre 4 y 12 frases por petición, con verificación del número de líneas y de la integridad de la salida.
- Uso de contexto de referencia (frases anteriores y posteriores) únicamente para comprensión, sin traducirlo.
- Aplicación de glosarios de términos en formato JSON con prioridad de proyecto sobre glosario global.
- Control de estilo mediante instrucciones explícitas: registro, nivel de franqueza, tratamiento entre personajes y puntuación de subtítulo (sin punto ni coma final, conservando interrogación, exclamación y puntos suspensivos necesarios).
- Generación restringida por gramática JSON para fijar identificadores y texto original.
- Modo de razonamiento desactivable (`enable_thinking: false`), recomendado para esta tarea.
- No incluye reconocimiento de voz ni alineación temporal: la transcripción y la línea de tiempos las aporta la aplicación anfitriona.
- No se documentan capacidades de tool calling, agentes, visión ni audio.

## Casos de uso

- Subtitulado de audio-dramas japoneses: el modelo traduce lotes de 4 a 12 líneas manteniendo el identificador de cada una para reinsertarlas en la línea de tiempos original, lo que encaja con el flujo de Ownsei.
- Localización de contenido ASMR para adultos: el ajuste preserva el grado de franqueza o eufemismo del original, algo que los modelos de traducción genéricos suelen neutralizar.
- Gestión de nombres propios y terminología de franquicia: mediante glosarios JSON por proyecto se fijan lecturas de personajes y lugares, con override del glosario global.
- Coherencia de tratamiento entre personajes: el contexto de referencia permite mantener el nivel de cercanía (tuteo, sufijos, registro) a lo largo de una escena sin traducir esas líneas de contexto.
- Integración en un servidor local de traducción: con llama-server, `--jinja` y la plantilla de chat incluida, se puede exponer un endpoint compatible con OpenAI para que la aplicación de subtitulado envíe lotes.
- Verificación automatizada de salida: la gramática JSON y la comprobación del número de líneas permiten descartar o reintentar lotes con salida incompleta, algo útil en pipelines de producción de subtítulos.
- Despliegue en estación de trabajo con GPU de consumo: la variante Q4_K_M (5,78 GB) se ha validado en una RTX 4070 Ti de 12 GiB, lo que permite trabajar sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente documenta la validación de inferencia de ambas cuantizaciones en llama.cpp build b11541 sobre una RTX 4070 Ti de 12 GiB, sin métricas de calidad de traducción (BLEU, COMET u otras) ni comparaciones numéricas.

## Requisitos de hardware

- VRAM estimada: Q4_K_M ocupa 5,78 GB en disco y Q5_K_M 6,64 GB; con overhead de contexto (8.192 tokens) y caché KV conviene reservar varios GB adicionales.
- GPU validadas por el autor: RTX 4070 Ti de 12 GiB, con `-ngl 99` (todas las capas en GPU).
- Entrenamiento: RTX 5090 de 32 GiB con Unsloth, Transformers y PEFT.
- Cabe en GPU de consumo de gama alta con 12 GiB o más; no se documenta comportamiento en GPUs de 8 GiB.
- Despliegue recomendado: llama.cpp mediante `llama-server` con `--jinja`, `-fa on`, `-np 1`, `temperature=0` y `--reasoning off`. El autor indica que se requiere una build con soporte de Qwen3.5 (validada en b11541).
- Aceleración opcional: decodificación especulativa con el head MTP (`--spec-type draft-mtp --spec-draft-n-max 2`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| index-translate-asmr-9B (este) | 9,2 B | no disponible (ejemplos con 8.192) | ja → zh | Apache-2.0 | GGUF, safetensors (LoRA) | Ajuste especializado en subtitulado de audio anime; 0 descargas |
| IndexTeam/Index-Translate-9B | 9,2 B (base) | no disponible | no disponible | no disponible | no disponible | Modelo base sin el ajuste de estilo ASMR; referencia directa |
| Alternativas genéricas de traducción ja→zh | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo de nicho: entrenado exclusivamente para diálogos de audio japonés de estilo anime y ASMR hacia chino tradicional; el rendimiento fuera de ese dominio no está documentado.
- No procesa audio: requiere transcripción previa y gestión externa de la línea de tiempos.
- Solo dos idiomas declarados (ja, zh); no se documenta comportamiento en otros pares.
- Riesgo de alucinación y de deriva de estilo en lotes largos: la propia model card recomienda empezar con 4 a 12 frases por lote y reducir el tamaño si se agota el presupuesto de tokens.
- El contenido de entrenamiento incluye material para adultos; el ajuste preserva deliberadamente el lenguaje explícito del original, lo que exige moderación y control de acceso si se despliega como servicio.
- Los pesos publicados corresponden al paso 48 de 72 previstos (época 2 de 3), por lo que no representan el final del entrenamiento programado.
- El conjunto de datos de entrenamiento no se publica, lo que impide auditar la composición y los posibles sesgos de los subtítulos de origen.
- Repositorio sin descargas ni valoraciones: no hay evidencia comunitaria de uso en producción.
- Licencia Apache-2.0 en pesos y documentación según la model card, pero conviene revisar `NOTICE` por la atribución al modelo base de Index Team.
- La cuantización Q4_K_M puede degradar la fidelidad en matices de registro; para subtitulado sensible conviene evaluar Q5_K_M.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yzk9/index-translate-asmr-9B
- Modelo base: https://huggingface.co/IndexTeam/Index-Translate-9B
- Repositorio del modelo base en la revisión usada: `4e06279e62352dab96bbeb6fa0579bca5e822d75`
