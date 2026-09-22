# zeusdevpro/Qwen3.8-Flash-Next-Uncensored-Q8-UDQ4K-DS4

## Resumen

Qwen3.8-Flash-Next-Uncensored-Q8-UDQ4K-DS4 es un reempaquetado en formato GGUF del modelo `orcarouter/Qwen3.8-Flash-Next-Uncensored`, un ajuste fino sin censura sobre la arquitectura Qwen3.8-Flash-Next de Alibaba Qwen. El autor, `zeusdevpro`, ha partido de un GGUF híbrido UD-Q4K y ha modificado únicamente 57 de los 1.256 tensores del archivo: los 49 tensores `ffn_down_exps` (expertos enrutados) pasan de MXFP4 a Q8_0, y los pares `ffn_gate_exps`/`ffn_up_exps` de las capas `blk.0`, `blk.1`, `blk.2` y `blk.45` pasan de Q4_K a Q8_0. El resto de los pesos (atención, densos, embeddings, cabecera de salida y la tabla n-gram en BF16) se mantiene idéntico al material de partida.

El objetivo declarado no es mejorar el modelo base, sino ofrecer una versión de mayor precisión que la cuantización Q4 original manteniendo el consumo dentro de los 128 GiB de memoria unificada de un Apple Silicon de gama alta. El archivo final ocupa 188,57 GiB, con 93,19 GiB de pesos residentes y un plan de memoria de 107,31 GiB en inferencia (unos 121 GiB medidos en ejecución real). Está diseñado exclusivamente para el runtime `ds4` (DwarfStar) con backend Metal, no para llama.cpp, Ollama, vLLM ni CUDA.

Su relevancia es acotada pero concreta: es una muestra de cuantización selectiva guiada por restricciones de formato GGUF (la dimensión `ne0 = 640` de `ffn_down_exps` impide usar bloques de 256 pesos, lo que obliga a la familia de bloque 32, donde Q8_0 es la opción de mayor precisión). Sirve como caso de estudio de ingeniería de cuantización más que como modelo de propósito general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) con atención; incluye bloque MTP y componentes denominados GDN, QSA, shared y PLE en la receta de cuantización del modelo base. La expansión de esas siglas no se detalla |
| Parametros totales | no disponible (el README no publica el recuento) |
| Parametros activos | no disponible (no se documenta el número de expertos enrutados por token) |
| Longitud de contexto | 262.144 tokens nativos (prompt + generación combinados); ampliable con YaRN estático mediante `DS4_QWEN4_YARN_FACTOR=2` o `=4` |
| Tipos de cuantizacion | GGUF mixto: Q8_0 (394 tensores), F32 (472), F16 (298), Q4_K (90), BF16 (2, tabla n-gram). El MXFP4 del material base (49 tensores) queda eliminado |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 (sujeta además a las licencias del modelo base y del modelo upstream) |
| Formato de pesos | GGUF, dividido en 2 fragmentos de 100.000.000.000 y 102.472.325.120 bytes (202.472.325.120 bytes tras la fusión) |
| Modelo base | orcarouter/Qwen3.8-Flash-Next-Uncensored (pesos fuente en BF16) |
| Runtime objetivo | ds4 (DwarfStar), backend Metal en Apple Silicon |
| Capas | blk.0 a blk.48; blk.48 es el bloque MTP integrado, no una capa transformer convencional |
| Tamaño del archivo | 188,57 GiB |
| Pesos residentes en memoria | 93,19 GiB |
| SHA-256 del GGUF fusionado | f8f73355ccac3e654e80e0c7935f05a3bffde291440c8f5a9f5f2a325d144c62 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer con mezcla de expertos (MoE) al que se han aplicado varias modificaciones de arquitectura: el repositorio menciona componentes densos denominados GDN, QSA, shared y output, un bloque MTP (multi-token prediction) embebido en la posición `blk.48`, embeddings PLE servidos como sidecar externo y una tabla n-gram en BF16. No se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO; esa información pertenece al modelo upstream de Alibaba Qwen y al ajuste de `orcarouter`, y no está recogida en la model card de este reempaquetado.

La innovación técnica real de esta ficha es el procedimiento de cuantización selectiva. Partiendo de una base híbrida UD-Q4K, el autor identificó que los tensores `ffn_down_exps` tienen dimensiones (640, 2560, 512), con `ne0 = 640`, y que 640 no es divisible entre 256, lo que descarta los formatos de bloque 256 (Q4_K, Q2_K, IQ2_XXS) y obliga a usar la familia de bloque 32, limitada a MXFP4, Q4_0 y Q8_0. De esas tres, Q8_0 es la de mayor precisión, de ahí que los 49 tensores `ffn_down_exps` se promovieran a Q8_0. En cambio, `ffn_gate_exps` tiene `ne0 = 2560`, divisible entre 256, por lo que admite Q4_K calibrado con imatrix; como subir los 98 tensores gate/up a Q8_0 habría añadido 58,62 GiB y superado el límite de 128 GiB, se seleccionaron solo cuatro capas por su impacto en el error: las dos primeras (propagación aguas abajo), la tercera (cerca de la inyección de n-gram y PLE) y la 45 (conexión directa con la salida). Q8_0 usa cuantización simétrica por bloques y no requiere imatrix, así que la modificación no introduce nuevas dependencias de calibración. El incremento de tamaño teórico calculado es de 23,46 GiB, coherente con el archivo final de 188,57 GiB.

## Capacidades

- Generación de texto y razonamiento en inglés y chino, con una ventana de contexto de 262.144 tokens que cubre prompt y generación de forma conjunta.
- Procesamiento de prompts muy extensos: el autor documenta la carga de un prompt de herramientas de 23,8K tokens, lo que en la práctica equivale a un prefill de entre 20 y 28 segundos.
- Decodificación especulativa mediante el bloque MTP integrado, activada con `--mtp --mtp-draft 1`.
- Ejecución completamente local en Apple Silicon con backend Metal, sin dependencia de APIs externas.
- Capacidad de inferencia sobre caché KV en disco (solo puntos de control, con `--kv-disk-dir` y `--kv-disk-space-mb`), útil para reanudar sesiones largas.
- Modelo de tipo uncensored: el ajuste base elimina parte de las restricciones de rechazo del modelo original, orientado a usos sin filtrado editorial.
- No se documenta en la información disponible soporte verificado de function calling, visión, audio, ni modo de razonamiento explícito (*thinking*). El uso con herramientas es una inferencia razonable a partir del prompt de 23,8K tokens, no una capacidad confirmada por el autor.
- Capacidades multilingües limitadas a en y zh según los metadatos; no hay evidencia de rendimiento declarado en castellano.

## Casos de uso

- Análisis de documentación extensa en local: con 262.144 tokens de contexto se puede cargar un conjunto completo de contratos, normativa o informes técnicos en una sola pasada sin trocear ni usar RAG, manteniendo los datos en el dispositivo.
- Asistente de código sobre repositorios grandes: la ventana permite incluir múltiples ficheros y el historial de cambios; el runtime admite prompts de herramientas, lo que facilita integrarlo en un bucle de edición y ejecución controlado localmente.
- Despliegue en entornos air-gapped o con requisitos de soberanía de datos: al ejecutarse sobre Metal sin conectividad, encaja en organismos o empresas que no pueden enviar código o documentación a APIs externas.
- Investigación sobre alineación y seguridad: al ser una variante uncensored, resulta útil como sujeto de pruebas en *red teaming* y en estudios comparativos sobre comportamiento de rechazo, siempre con las salvaguardas legales y éticas correspondientes.
- Traducción y generación bilingüe inglés-chino: es el par de idiomas soportado de forma nativa, adecuado para localización de documentación técnica entre ambos.
- Agentes multi-paso con salidas largas: el bloque MTP permite decodificación especulativa, lo que reduce la latencia en cadenas de razonamiento extensas, aunque la ganancia es variable según el autor.
- Extracción estructurada de información de corpus largos: combinando contexto largo y ejecución local, se puede procesar un lote de documentos por la noche sin coste por token.
- Generación de contenido creativo sin filtros editoriales: el ajuste uncensored evita rechazos automáticos en ficción, guiones o narrativa con temáticas sensibles, siempre bajo responsabilidad del operador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica estándar, ni para el modelo base ni para esta cuantización.

El autor sí publica mediciones de velocidad de decodificación sobre un Apple M5 Max con 128 GiB:

| Contexto | Velocidad de decodificación |
|---:|---:|
| 64K | 66,46 t/s |
| 128K | 52,56 t/s |
| 256K | 47,05 t/s |

Datos adicionales de rendimiento declarados: la carga inicial de un prompt de herramientas de 23,8K tokens tarda entre 20 y 28 segundos, y la aceleración aportada por MTP fluctúa según la longitud de la salida. El autor afirma de forma cualitativa que el rendimiento se acerca al de las versiones de Unsloth (equiparable a Q5_K_XL) y que la decodificación llega a ser hasta diez veces más rápida que la del Q4 original; ninguna de las dos afirmaciones incluye metodología ni se ha verificado de forma independiente.

## Requisitos de hardware

- Memoria unificada recomendada: 128 GiB en Apple Silicon. El plan de memoria calculado es de 107,31 GiB (93,19 GiB de pesos residentes + 8,33 GiB de KV + 5,79 GiB de buffers), pero el consumo medido en ejecución ronda los 121 GiB.
- Hardware de referencia probado: Apple M5 Max con 128 GiB. No hay datos de otros SoC.
- GPU compatibles: únicamente Apple Silicon con backend Metal. No hay soporte CUDA, ROCm ni Vulkan documentado.
- GPU de consumo tipo NVIDIA RTX 4090 (24 GB de VRAM): no es viable, el archivo completo son 188,57 GiB en disco y los pesos residentes superan los 93 GiB.
- Despliegue: exclusivamente mediante `ds4-server` (DwarfStar). No se contemplan vLLM, TGI, llama.cpp, Ollama ni LM Studio para este archivo.
- Parámetros de arranque: `--ctx 262144 --prefill-chunk 4096 --mtp --mtp-draft 1 --power 100`.
- Ajuste de memoria: `--prefill-chunk 8192` provoca OOM con contexto de 256K (`Metal command batch failed: Insufficient Memory`); si falta memoria, reducir `--ctx` es más eficaz que reducir `--prefill-chunk`.
- Almacenamiento: 202.472.325.120 bytes (188,57 GiB) para el GGUF fusionado, más espacio para la caché KV en disco si se activa (por ejemplo, 65.536 MB).
- Latencia: prefill de 23,8K tokens en 20-28 segundos; decodificación entre 47 y 66 t/s según contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| zeusdevpro/Qwen3.8-Flash-Next-Uncensored-Q8-UDQ4K-DS4 | no disponible | 262.144 | GGUF mixto, 57 expertos en Q8_0 | 47,05-66,46 t/s declarados en M5 Max | apache-2.0 | GGUF para ds4, 2 fragmentos, 0 descargas |
| ivanfioravanti/Qwen3.8-Flash-Next-DS4-Q4 | no disponible | no disponible | Misma base: gate/up imatrix Q4_K, down MXFP4 | no disponible | no disponible | GGUF para ds4 |
| Unsloth Qwen3.8-Flash-Next (Q4 / Q5_K_XL) | no disponible | no disponible | Q4_K / Q5_K_XL calibrado con imatrix | El autor afirma paridad con Q5_K_XL, sin datos | no disponible | Repositorio de Unsloth |
| orcarouter/Qwen3.8-Flash-Next-Uncensored | no disponible | no disponible | BF16 (pesos fuente) | no disponible | no disponible | Pesos completos, base del reempaquetado |

La comparación se limita a lo que la model card menciona explícitamente. No se dispone de cifras de parámetros, contexto ni benchmarks de las alternativas, por lo que no es posible establecer una comparación cuantitativa real de rendimiento.

## Limitaciones y advertencias

- Repositorio sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin resultados de terceros que reproduzcan las mediciones del autor.
- Los datos de velocidad proceden de un único equipo (Apple M5 Max, 128 GiB) y no se han replicado en hardware distinto.
- El archivo ocupa 188,57 GiB y requiere 128 GiB de memoria unificada; en configuraciones inferiores el modelo no arranca o degrada con OOM.
- La ventana de 262.144 tokens es la suma de prompt y generación: si el prompt la agota, el modelo no puede generar. Ampliarla exige activar YaRN estático (`DS4_QWEN4_YARN_FACTOR=2` o `=4`), lo que puede degradar la calidad y no está cuantificado.
- La caché KV en disco solo almacena puntos de control; no libera la memoria del contexto activo.
- La aceleración por MTP es inestable y puede caer de forma apreciable en salidas largas.
- Riesgo de alucinación no evaluado: no hay benchmarks ni tasas de error publicadas para esta cuantización ni para el modelo base.
- Modelo uncensored: el ajuste elimina parte de los rechazos de seguridad del modelo original, lo que aumenta el riesgo de generar contenido dañino, ilegal o sesgado. La responsabilidad de filtrado recae por completo en quien lo despliega.
- Sesgos conocidos: no documentados. Al estar entrenado principalmente en inglés y chino, el comportamiento en castellano no está validado.
- Limitación idiomática: los metadatos declaran únicamente en y zh; no hay evidencia de calidad en otros idiomas.
- Licencia: el repositorio declara apache-2.0, pero la propia model card exige cumplir también las licencias del modelo base y del upstream. Antes de un uso comercial conviene verificar la cadena completa de licencias, algo que este README no resuelve.
- Cautela sobre la procedencia: no se ha podido verificar en la información disponible la existencia de un modelo oficial de Alibaba Qwen denominado Qwen3.8-Flash-Next, ni la identidad de `orcarouter` como autor del ajuste. Tratar el origen del modelo con prudencia antes de integrarlo en producción.
- Formato y runtime cerrados: el GGUF usa tipos que otros motores pueden no soportar (mezcla Q8_0/Q4_K/MXFP4/F32/F16 más sidecar PLE y tabla n-gram BF16), y el repositorio solo documenta `ds4` como runtime válido. La portabilidad a llama.cpp u Ollama no está garantizada.
- La diferencia entre los 188,57 GiB del archivo y los 93,19 GiB de pesos residentes no se explica en la model card, lo que dificulta planificar el despliegue con precisión.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/zeusdevpro/Qwen3.8-Flash-Next-Uncensored-Q8-UDQ4K-DS4
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Versión del mismo ecosistema citada por el autor: https://huggingface.co/ivanfioravanti/Qwen3.8-Flash-Next-DS4-Q4
- Búsqueda web: no se han encontrado enlaces relevantes sobre este modelo, su arquitectura upstream ni el runtime DwarfStar (ds4). Los resultados devueltos por el buscador no guardan relación con el modelo (foros de viajeros frecuentes) y se descartan. No hay papers, blogs técnicos, repositorios de código ni demos verificables disponibles.
