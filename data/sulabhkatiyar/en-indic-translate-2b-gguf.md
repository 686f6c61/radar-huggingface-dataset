# sulabhkatiyar/en-indic-translate-2b-GGUF

## Resumen

`sulabhkatiyar/en-indic-translate-2b-GGUF` es el conjunto de builds cuantizados en formato GGUF del modelo de traducción `sulabhkatiyar/en-indic-translate-2b`, un ajuste fino de `google/gemma-4-E2B-it` orientado a traducir documentos completos del inglés a once lenguas indicas: asamés, bengalí, guyaratí, hindi, canarés, malabar, maratí, oriya, panyabí, tamil y telugu. El modelo está diseñado para texto largo y densamente estructurado —documentos con encabezados de sección, fórmulas en LaTeX y bloques de código delimitados— que debe reproducir intactos en la salida, en lugar de operar frase a frase.

El repositorio publica tres cuantizaciones: Q5_K_M (3.381 GiB), Q8_0 (4.626 GiB) y Q4_K_M (3.192 GiB). El autor recomienda Q5_K_M como opción por defecto, con una pérdida de calidad no medible frente al build F16 de referencia (−0,07 chrF++ en los 82 documentos en los que ambos produjeron salida limpia), un 2,565× menos de tamaño y 1,485× más velocidad de decodificación. Q4_K_M, en cambio, degrada de forma clara: −1,36 chrF++ y 17 de 99 documentos colapsados en bucles de repetición, frente a los 9 de F16.

La relevancia del repositorio es doble. Por un lado, cubre un nicho poco atendido por los modelos generalistas: traducción de inglés a lenguas indicas con fidelidad estructural sobre documentos completos. Por otro, aporta una evaluación poco habitual en el ecosistema GGUF, con calidad medida documento a documento contra el control sin cuantizar en lugar de estimaciones aproximadas. Como contrapartida, el modelo tiene cero descargas y cero likes en el momento de redactar esta ficha, por lo que no existe validación independiente de sus resultados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Gemma; ajuste fino de `google/gemma-4-E2B-it`. Detalles internos (número de capas, cabezas, tipo de atención) no disponibles |
| Parámetros totales | 4.647.450.147 (~4,65 mil millones), según el recuento de safetensors del modelo base |
| Parámetros activos | no disponible. La nomenclatura del nombre ("2b", "E2B") no coincide con el recuento real de safetensors; no se documenta si existe cómputo condicional o mezcla de expertos |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0, Q5_K_M y Q4_K_M (no se publica F16 en este repositorio) |
| Idiomas soportados | Origen: inglés (en). Destino: asamés (as), bengalí (bn), guyaratí (gu), hindi (hi), canarés (kn), malabar (ml), maratí (mr), oriya (or), panyabí (pa), tamil (ta), telugu (te) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF para llama.cpp; safetensors bf16 en el repositorio base |
| Dirección de traducción | Unidireccional: inglés a 11 lenguas indicas |
| Tamaño de los ficheros | Q8_0: 4.626 GiB (4.967.478.752 B) · Q5_K_M: 3.381 GiB (3.630.269.920 B) · Q4_K_M: 3.192 GiB (3.427.861.984 B) |
| Tamaño del repositorio | 12,0 GB |
| Repositorio base | `sulabhkatiyar/en-indic-translate-2b` (relación: quantized) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo: se sabe que es un ajuste fino de `google/gemma-4-E2B-it`, por lo que hereda la familia arquitectónica Gemma (transformer decoder-only con RoPE y normalización RMSNorm, presumiblemente), pero no se publican el número de capas, la dimensionalidad, el tipo de atención ni la ventana de contexto. Tampoco se especifica si el ajuste fino modificó alguna componente estructural más allá de los pesos.

Respecto al entrenamiento, la model card no documenta el número de tokens, la composición del corpus paralelo, ni si se aplicaron técnicas de alineación adicionales (RLHF, DPO) sobre el ajuste supervisado. Dado que el punto de partida es una variante instruct (`-it`) de Gemma, el modelo hereda el alineamiento del modelo original, pero no hay datos sobre el proceso de ajuste específico para traducción. La innovación técnica destacable no está en la arquitectura, sino en el diseño del objetivo: traducción a nivel de documento completo con preservación de estructuras LaTeX, encabezados y bloques de código, un escenario donde la mayoría de los modelos de traducción ajustados por frases fallan.

El trabajo de cuantización sí está documentado con detalle. El autor verificó que el propio formato GGUF no introduce coste: los mismos pesos servidos en bf16 mediante vLLM puntúan 0,10 chrF++ por encima del F16 en GGUF sobre 85 documentos limpios emparejados, lo que se interpreta como ruido. Toda la degradación observada por debajo de F16 se atribuye, por tanto, a la cuantización y no al contenedor de fichero.

## Capacidades

- Traducción inglés → 11 lenguas indicas, incluyendo asamés, bengalí, guyaratí, hindi, canarés, malabar, maratí, oriya, panyabí, tamil y telugu.
- Traducción a nivel de documento completo, no limitada a frases sueltas, con gestión de texto largo y densamente estructurado.
- Preservación de estructuras técnicas: fórmulas en LaTeX, encabezados de sección y bloques de código delimitados se mantienen intactos en la salida.
- Generación de texto como tarea base (`text-generation`), con plantilla instruct heredada del modelo Gemma original.
- Ejecución local en llama.cpp y runtimes derivados: `llama-server`, `llama-cli`, LM Studio y cargadores compatibles con Ollama.
- Compatibilidad declarada con `endpoints_compatible`, lo que permite exponerlo como endpoint HTTP desde llama.cpp.
- Sin soporte documentado de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Multilingüismo restringido a la dirección inglés → índico; no se documenta traducción inversa ni entre lenguas indicas.

## Casos de uso

- Traducción de documentación técnica en lote: el modelo procesa documentos completos y respeta encabezados y bloques de código, de modo que un pipeline puede traducir un árbol de documentación (Markdown o reStructuredText) sin romper la estructura de los ficheros ni los ejemplos de código.
- Localización de artículos científicos y material con matemáticas: al mantener las fórmulas LaTeX intactas, encaja en la traducción de preprints o apuntes hacia lenguas indicas, un escenario crítico porque un modelo genérico suele corromper la notación matemática.
- Integración en flujos de documentación como código (docs as code): el GGUF se carga con llama.cpp dentro de un job de CI/CD que traduzca las ramas de documentación al fusionar, sirviendo Q5_K_M como build por defecto por su equilibrio entre tamaño y calidad.
- Despliegue on-premise o en entornos aislados: al ser GGUF y caber en GPUs de consumo, puede ejecutarse sin conexión externa, algo relevante para administraciones públicas o entidades que traducen documentación sensible a lenguas indicas.
- Pre-traducción para revisión humana en herramientas CAT: el modelo genera borradores de documentos completos que un traductor profesional revisa después, reduciendo el trabajo mecánico y aprovechando que la salida mantiene los encabezados alineados con el original.
- Generación de corpus paralelos: uso del modelo para producir pares inglés-índico a escala sobre colecciones propias (manuales, normativa, documentación interna) que después alimenten el entrenamiento de otros sistemas de traducción o de recuperación multilingüe.
- Traducción de contenidos educativos con estructura repetitiva: temarios, guías y materiales con secciones y fragmentos de código, donde la preservación de la estructura importa más que la creatividad estilística.
- Aplicaciones de accesibilidad y lectura asistida: conversión de documentación técnica inglesa a la lengua materna del usuario en local, con el modo `llama-server` exponiendo una API sencilla para integrarla en un lector o extensión.

## Benchmarks y rendimiento

Los resultados provienen de una evaluación propia del autor: 99 documentos por variante (11 lenguas × 9 documentos, conjunto equilibrado), con las mismas 99 muestras de inglés retenidas para todas las variantes. chrF++ y spBLEU son puntuaciones de corpus contra traducciones de referencia. F16 es el control sin cuantizar y no se publica como descarga.

| Variante | chrF++ | spBLEU | Δ chrF++ vs F16 (documentos limpios, n) | Documentos degenerados | Script destino ≥ 0,95 |
|---|---:|---:|---:|---:|---:|
| F16 (control, no publicado) | 73,59 | 63,41 | — | 9 / 99 | 98 / 99 |
| Q8_0 | 74,70 | 65,37 | +0,11 (n = 87) | 8 / 99 | 97 / 99 |
| Q5_K_M | 73,09 | 61,98 | −0,07 (n = 82) | 11 / 99 | 98 / 99 |
| Q4_K_M | 67,81 | 55,35 | −1,36 (n = 76) | 17 / 99 | 98 / 99 |

Notas de lectura aportadas por el autor: la columna de chrF++ de corpus está dominada por qué documentos degeneran, ya que un único documento largo que colapsa en un bucle de repetición mueve la media varios puntos; por eso se reporta la columna Δ sobre documentos limpios emparejados, cada una con su propio denominador (87, 82 y 76) que no debe mezclarse. Un documento, identificado como `(2003.02051, kn)`, se queda en 0,915–0,917 de script destino en las cuatro variantes, incluida F16, por lo que es una propiedad del documento (LaTeX y numerales), no de la cuantización. Q8_0 presenta además un segundo fallo de script que la información disponible describe como genuino pero cuyo detalle no se incluye.

Tamaño y velocidad medidos:

| Variante | Tamaño | Compresión vs F16 | Decodificación vs F16 |
|---|---:|---:|---:|
| Q5_K_M | 3.381 GiB (3.630.269.920 B) | 2,565× | 1,485× |
| Q8_0 | 4.626 GiB (4.967.478.752 B) | 1,874× | 1,402× |
| Q4_K_M | 3.192 GiB (3.427.861.984 B) | 2,716× | 0,6 % más rápido que Q5_K_M |

Las velocidades de decodificación se midieron en una única NVIDIA Tesla T4; según el autor, el dato transferible es la ratio respecto a F16, no el valor absoluto en tokens por segundo, que no se incluye en la información disponible. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia, partiendo del tamaño de fichero más el espacio de contexto y el *overhead* del runtime (estimación propia, no publicada por el autor): Q4_K_M en torno a 4,5–5,5 GB; Q5_K_M en torno a 5–6 GB; Q8_0 en torno a 6–7 GB.
- GPU recomendadas para servicio con contexto amplio: A100 40/80 GB, H100, L40S o RTX 4090 24 GB, donde cualquiera de las tres variantes deja espacio de sobra para lotes concurrentes.
- Cabe en GPU de consumo: sí. Q4_K_M y Q5_K_M caben con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090. Q8_0 es viable en tarjetas de 8 GB con contexto corto, aunque con poco margen.
- Despliegue en CPU: al ser GGUF, las tres variantes pueden ejecutarse íntegramente en CPU con llama.cpp y con RAM suficiente (a partir de unos 4–8 GB según variante y contexto); el rendimiento será notablemente inferior al de GPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), LM Studio y cargadores compatibles con Ollama. Para los pesos sin cuantizar en bf16, el repositorio base es la vía adecuada y permite servir con vLLM.
- Latencia y throughput: no disponibles en términos absolutos. Solo se publican ratios relativos a F16 medidos en una Tesla T4: Q5_K_M decodifica 1,485× más rápido que F16 y Q8_0 1,402×; Q4_K_M apenas mejora a Q5_K_M en un 0,6 %.
- Verificación de integridad: el autor publica los sha256 de los tres ficheros (ver sección de enlaces), recomendable comprobarlos tras la descarga dado que son ficheros de varios gigabytes.

## Comparativa con modelos similares

Comparativa dentro del propio repositorio y con el modelo base, con los datos medidos disponibles:

| Modelo / variante | Parámetros | Contexto | Formato | Licencia | Calidad medida | Degeneración |
|---|---|---|---|---|---|---|
| en-indic-translate-2b Q5_K_M | 4,65 B | no disponible | GGUF | Gemma | chrF++ 73,09 / spBLEU 61,98; Δ −0,07 vs F16 | 11 / 99 |
| en-indic-translate-2b Q8_0 | 4,65 B | no disponible | GGUF | Gemma | chrF++ 74,70 / spBLEU 65,37; Δ +0,11 vs F16 | 8 / 99 |
| en-indic-translate-2b Q4_K_M | 4,65 B | no disponible | GGUF | Gemma | chrF++ 67,81 / spBLEU 55,35; Δ −1,36 vs F16 | 17 / 99 |
| en-indic-translate-2b (base, bf16) | 4,65 B | no disponible | safetensors | Gemma | +0,10 chrF++ sobre el F16 GGUF en 85 documentos limpios | no disponible |

Alternativas de la misma categoría (traducción a lenguas indicas) que un evaluador debería considerar, con los datos que la información proporcionada no permite comparar:

| Alternativa | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| AI4Bharat IndicTrans2 | no disponible en la información | no disponible | MIT (según el proyecto público de AI4Bharat) | Familia específica de traducción indic, muy extendida; no se aportan métricas comparables en esta búsqueda |
| NLLB-200 (Meta) | no disponible en la información | no disponible | CC-BY-NC-4.0, uso no comercial | Cobertura multilingüe amplia; orientado a frases, sin preservación explícita de LaTeX o código |
| Gemma 4 E2B-it (modelo del que deriva) | 4,65 B en esta variante | no disponible | Gemma | Modelo generalista multilingüe; no especializado en preservar estructura documental al traducir |

No se han encontrado en la información disponible resultados de benchmarks independientes que permitan una comparación cuantitativa con estas alternativas. La búsqueda web realizada no devolvió resultados relevantes sobre el modelo.

## Limitaciones y advertencias

- Degeneración en bucles de repetición: es el problema más serio y está cuantificado. Incluso el control F16 degenera en 9 de 99 documentos; Q8_0 en 8, Q5_K_M en 11 y Q4_K_M en 17, con truncaciones asociadas (16 en el caso de Q4_K_M). Un documento puede además entrar en bucle y aun así cerrar con token de fin de secuencia, por lo que un contador de truncamientos no detecta todos los casos.
- Q4_K_M no es recomendable en producción: pierde 1,36 chrF++ frente a F16 en documentos limpios emparejados, casi duplica la tasa de degeneración y solo aporta un 0,6 % de velocidad de decodificación sobre Q5_K_M, a cambio de 0,19 GiB menos.
- Q8_0 es la única variante con un fallo genuino de script destino (su segundo fallo en la columna de script, además del documento `(2003.02051, kn)` que afecta a todas las variantes); en la información disponible no se detalla su naturaleza.
- Sesgos: no se documenta ninguna evaluación de sesgo, toxicidad ni equidad entre las once lenguas de destino. La cobertura por lengua es de 9 documentos por idioma, insuficiente para caracterizar el comportamiento por variedad dialectal o registro.
- Riesgo de alucinación: no evaluado explícitamente. Al ser un modelo generativo ajustado para traducción, puede producir contenido plausible no presente en el original, especialmente en documentos largos donde la atención se degrada.
- Longitud de contexto no publicada: se desconoce el límite real de tokens de entrada, un dato crítico porque el caso de uso declarado son documentos completos. Sin esta cifra no se puede dimensionar el troceado en producción.
- Dirección única: solo inglés a lenguas indicas. No hay traducción inversa ni entre lenguas indicas.
- Licencia Gemma: el uso comercial está sujeto a los Gemma Terms of Use, que imponen obligaciones de uso aceptable y de distribución de términos a terceros. Debe revisarse antes de integrarlo en un producto.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de redactar la ficha. Los únicos números de calidad proceden del propio autor, sobre un conjunto de evaluación propio y con 99 documentos, sin replicación independiente.
- Alcance de la evaluación: 11 lenguas × 9 documentos es una muestra pequeña para extraer conclusiones por idioma; las métricas de corpus agregadas están dominadas por los documentos que degeneran, tal como advierte el propio autor.
- Tamaño aparente inconsistente: el nombre comercial indica "2b" mientras que el recuento de safetensors del modelo base es de 4.647.450.147 parámetros. Conviene verificar el consumo real de memoria antes de planificar el despliegue.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/sulabhkatiyar/en-indic-translate-2b-GGUF
- Modelo base (pesos sin cuantizar): https://huggingface.co/sulabhkatiyar/en-indic-translate-2b
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ficheros publicados y sumas de verificación sha256:
  - `en-indic-translate-2b-Q8_0.gguf`: 188d9dc92cf8633bb1c447ba2ecc48ca81dfe795fa4d5b0400eb9cce9b445d9c
  - `en-indic-translate-2b-Q5_K_M.gguf`: ebfd9730d4030cb8fdab805177d78497f58ea2468ca3cf7c74edbab72a2185ee
  - `en-indic-translate-2b-Q4_K_M.gguf`: 8762dea9401e19e4eef88f9f60366665f527ffe6b2b193fbd1177c343c7384ae
- No se han encontrado papers, blogs ni demos adicionales en la búsqueda web realizada; los resultados devueltos no guardaban relación con el modelo.
