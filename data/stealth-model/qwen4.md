# stealth-model/Qwen4

## Resumen

`stealth-model/Qwen4` es un repositorio de cuantizaciones GGUF publicadas por Stealth Models (tercero, no oficial de Alibaba/Qwen) cuyo contenido real es una cuantización de `Qwen/Qwen3.8-Flash-Next`, el modelo de previsualización de la arquitectura Qwen 4. A pesar del nombre del repositorio, no se trata de Qwen 4: la model card indica explícitamente que «Qwen 4 isn't out yet» y que este repositorio aloja el preview, con la promesa de alojar también los archivos definitivos el día del lanzamiento.

El modelo base es un transformer de mezcla de expertos (MoE) de 176.943.899.520 parámetros totales (unos 176,9 mil millones), con 512 expertos de los que 10 se activan por token, repartidos en 48 capas de expertos. Incorpora una memoria n-gram aprendida junto a la atención dispersa, lee 262.144 tokens de forma nativa y hasta 1.000.000 con YaRN, y admite entrada de visión mediante proyectores `mmproj`.

Su relevancia práctica es que permite ejecutar una arquitectura de ese tamaño en hardware de consumo mediante offload selectivo: solo 4-5,5 GB deben residir en la GPU, los expertos esperan en RAM del sistema y la tabla n-gram (29 GB, 54 GB en Q5) puede quedar en un NVMe. El repositorio tiene 0 descargas y 2 «likes» en el momento de la consulta, y no publica resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) dispersa con memoria n-gram aprendida; 512 expertos, 10 activos por token, 48 capas de expertos; cabeza MTP (multi-token prediction) |
| Parámetros totales | 176.943.899.520 (≈176,9 mil millones) |
| Parámetros activos | No disponible (la model card solo indica 512 expertos totales y 10 activos por token) |
| Longitud de contexto | 262.144 tokens nativos; hasta 1.000.000 con YaRN (`--rope-scale 4 --yarn-orig-ctx 262144`) |
| Tipos de cuantización | GGUF `Q2_K_XL` (79 GB), `Q4_K_XL` (111 GB), `Q5_K_XL` (158 GB); imatrix; proyectores de visión `Q8_0` (0,6 GB), `F16` (0,9 GB), `Q6_K` (0,52 GB), `Q4_K` (0,46 GB); cabezas MTP `Q8_0` (2,8 GB) y `Q4_K_M` (1,9 GB); caché KV de 4 bits (`q4_0`) |
| Idiomas soportados | No disponible |
| Licencia | `qwen-community-1.0` (etiquetada como `other` en HuggingFace; el texto está en el enlace de licencia del repositorio) |
| Formato de pesos | GGUF (llama.cpp); el repositorio incluye `mmproj` para visión y cabezas MTP separadas |
| Modelo base | `Qwen/Qwen3.8-Flash-Next` (relación declarada: `quantized`) |
| Tamaño del repositorio | 355,7 GB |
| Librería / runtime | `gguf`, llama.cpp (build b11971 del 28 de octubre o posterior) |
| Modalidad | Texto y visión (mediante `mmproj`) |
| Fechas | Creado el 2026-10-28; actualizado el 2026-10-29 |
| Descargas / likes | 0 / 2 |

## Arquitectura y entrenamiento

La arquitectura descrita en la model card combina atención dispersa con una memoria n-gram aprendida, materializada en el tensor `per_layer_token_embd.weight`, que actúa como tabla de consulta de n-gramas junto al modelo. El componente de cómputo es una mezcla de expertos con 512 expertos y 10 activos por token, distribuidos en 48 capas de expertos; ese reparto es precisamente lo que permite el offload granular con `--n-cpu-moe`, que decide cuántas de esas 48 capas permanecen en RAM del sistema. Qwen entrenó además una capa de predicción multi-token (MTP) que se distribuye como archivo aparte y sirve como cabecera de borrador para decodificación especulativa.

El modelo base está diseñado para contexto largo: 262.144 tokens nativos y extensión a 1.000.000 mediante YaRN, que el autor recomienda usar solo cuando la longitud sea necesaria. El repositorio incluye proyectores multimodales (`mmproj`) para entrada de visión. No hay información en la documentación proporcionada sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron fases de RLHF, DPO u otras optimizaciones de preferencias.

En el apartado de inferencia, la model card documenta tres mecanismos de aceleración: `--spec-type ngram-mod` (borrador de tokens a partir del texto ya presente en el contexto, sin coste de VRAM ni RAM), la cabecera MTP (1,3 a 1,7 veces más velocidad de salida según una medición de Unsloth) y caché KV cuantizada a 4 bits (unos 2 GB a 256k y 8 GB a 1M).

## Capacidades

- Generación de texto conversacional (`pipeline_tag: text-generation`, tag `conversational`).
- Procesamiento de contexto largo: 262.144 tokens nativos y hasta 1.000.000 con YaRN.
- Entrada de visión mediante los proyectores `mmproj` en cuatro precisiones distintas.
- Decodificación especulativa con dos mecanismos combinables: `ngram-mod` y cabecera MTP (`--spec-type draft-mtp,ngram-mod`).
- Edición de código y resumen de documentos largos: la model card cita estos escenarios como los que más se benefician de `ngram-mod`, por repetir el contexto de entrada; no se aportan métricas de calidad en código.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (no se declara lista de idiomas).
- Modo «thinking» o razonamiento explícito: no disponible en la información proporcionada.

## Casos de uso

- Procesamiento de documentación técnica extensa en local: con 262.144 tokens nativos y la opción de 1M con YaRN, se puede cargar un repositorio de manuales o un expediente completo en una sola ventana y hacer preguntas cruzadas sin trocear el texto.
- Despliegue en estaciones de trabajo con GPU modesta: en una GPU de 16 GB con 64 GB de RAM, el `Q2_K_XL` con `--n-cpu-moe 42` mantiene solo 4-5,5 GB en VRAM y deja el resto de expertos en memoria del sistema, lo que permite servir el modelo en hardware que no admitiría 176,9 mil millones de parámetros de otra forma.
- Edición y refactorización de código sobre archivos grandes: al activar `--spec-type ngram-mod`, los tokens del contexto de entrada (el propio código) se reutilizan como borrador especulativo, lo que acelera respuestas que repiten fragmentos del prompt sin consumir VRAM adicional.
- Análisis de imágenes y digitalización de documentos: con `mmproj-Q4_K.gguf` (0,46 GB) se añade visión con el mínimo coste de VRAM, útil para extraer texto o descripciones de capturas y páginas escaneadas en un flujo local.
- Atención al cliente multi-turno con historial largo: la caché KV a 4 bits ocupa unos 2 GB a 256k tokens, de modo que se puede mantener una sesión muy larga con muchas conversaciones simultáneas sin que la caché agote la memoria.
- Resumen y extracción sobre corpus de gran tamaño: la combinación de contexto de 512k-1M con `ngram-mod` (que ayuda cuando la respuesta parafrasea la entrada) encaja en tareas de resumen de actas, informes o transcripciones.
- Inferencia en equipos de memoria unificada: en AMD Strix Halo o NVIDIA DGX Spark con 128 GB, el `Q4_K_XL` cabe entero en la GPU (`--n-cpu-moe` desactivado), lo que simplifica el despliegue en un nodo único sin reparto GPU/RAM.
- Banco de pruebas de la arquitectura Qwen 4: para equipos que quieran medir el comportamiento de la arquitectura (MoE 512/10, memoria n-gram, MTP) antes de que existan los pesos definitivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica de calidad, y el repositorio no enlaza informe de evaluación alguno.

El único dato cuantitativo de rendimiento es de velocidad, no de calidad: Unsloth mide un aumento de 1,3 a 1,7 veces en la velocidad de salida al usar la cabecera MTP, a cambio de 2,8 GB de VRAM (1,9 GB con el archivo `Q4_K_M`) y de incrementar `--n-cpu-moe` en 3 (Q2) o 2 (Q4, Q5).

| Aspecto | Dato disponible |
|---|---|
| Benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) | No disponible |
| Aceleración con MTP | 1,3-1,7× en velocidad de salida (medición de Unsloth) |
| Coste de MTP en VRAM | 2,8 GB (`Q8_0`) o 1,9 GB (`Q4_K_M`) |
| Caché KV a 4 bits | ≈2 GB a 256k; ≈8 GB a 1M |
| Coste de `ngram-mod` | 0 VRAM y 0 RAM |

## Requisitos de hardware

- VRAM mínima en GPU: 4-5,5 GB, independientemente de la cuantización, porque solo una parte del modelo reside en la GPU; el resto de expertos va a RAM del sistema y la tabla n-gram al SSD o a RAM.
- Reparto por máquina según la model card (a 256k / 1M de contexto):
  - 16 GB de GPU + 64 GB de RAM: `Q2_K_XL`, `--n-cpu-moe 42` / `45` (máximo 512k), 40 / 43 GB de RAM para expertos.
  - 24 GB de GPU + 64 GB de RAM: `Q2_K_XL`, `--n-cpu-moe 34` / `42`, 33 / 40 GB de RAM.
  - 24 GB de GPU + 96 GB de RAM: `Q4_K_XL`, `--n-cpu-moe 41` / `46`, 66 / 73 GB de RAM.
  - 32 GB de GPU + 64 GB de RAM: `Q2_K_XL`, `--n-cpu-moe 26` / `33`, 25 / 32 GB de RAM.
  - 32 GB de GPU + 96-128 GB de RAM: `Q4_K_XL`, `--n-cpu-moe 36` / `41`, 58 / 66 GB de RAM.
  - 32 GB de GPU + 128 GB de RAM (máxima calidad): `Q5_K_XL`, `--n-cpu-moe 39` / `42`, 80 / 86 GB de RAM.
- GPU de memoria unificada: AMD Strix Halo o NVIDIA DGX Spark con 128 GB ejecutan `Q4_K_XL` con todos los expertos en GPU; con 192 GB o más, `Q5_K_XL` completo en memoria unificada.
- Almacenamiento: se recomienda NVMe rápido si la tabla n-gram (29 GB, 54 GB en Q5) se deja en disco con `-ot "^per_layer_token_embd\.weight$=CPU" --lazy-mode on`; con RAM suficiente, `--lazy-mode off` la mantiene en memoria.
- CPU y RAM: `-t` debe fijarse al número de núcleos físicos; la model card señala que la velocidad de la RAM es el factor más determinante.
- Opciones de despliegue: `llama-server` de llama.cpp (build b11971 del 28 de octubre o posterior). La cabecera MTP requiere por ahora la rama `qwen4exp/mtp` de Unsloth; el soporte en llama.cpp oficial está en revisión. No se mencionan vLLM, TGI ni Ollama en la información disponible, y al ser un repositorio solo GGUF haría falta conversión para usarlos.
- Parámetros de muestreo indicados: `--temp 1.0 --top-p 0.95 --top-k 20 --min-p 0`; en GPUs de 16 GB, `-ub 1024` en lugar de 2048.
- Latencia y throughput absolutos: no disponible (solo el factor 1,3-1,7× de MTP respecto a la inferencia sin MTP).

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|---|
| `stealth-model/Qwen4` (este repositorio) | 176,9 B | No disponible (512 expertos, 10 activos/token) | 262.144 nativo; 1.000.000 con YaRN | GGUF (Q2/Q4/Q5, imatrix) | `qwen-community-1.0` | Publicado; 0 descargas |
| `Qwen/Qwen3.8-Flash-Next` (modelo base) | 176,9 B (según los metadatos del repositorio derivado) | No disponible | No disponible en la información proporcionada | No disponible | No disponible en la información proporcionada | Referenciado como base |
| Qwen4-27B (anunciado en la model card) | 27 B (denso, según la card) | No aplica | No disponible | No disponible | No disponible | «On release day» |
| Qwen4-35B-A3B (variante «likely» según la card) | ≈35 B (por el nombre) | ≈3 B (por el nombre) | No disponible | No disponible | No disponible | No confirmado |
| Qwen4-Flash (anunciado) | No disponible | No disponible | No disponible | No disponible | No disponible | «On release day» |

No se dispone en la información proporcionada de datos verificables de otros modelos MoE abiertos de tamaño comparable (por ejemplo, de la familia DeepSeek, Mixtral o Llama), por lo que no se incluyen cifras de comparación que no puedan contrastarse. Tampoco hay benchmarks de calidad de ninguna de las filas.

## Limitaciones y advertencias

- No es Qwen 4. El repositorio se llama `Qwen4` por motivos de posicionamiento, pero su contenido es una cuantización de `Qwen/Qwen3.8-Flash-Next`, el preview de la arquitectura. Cualquier evaluación debe hacerse contra el modelo base, no contra el Qwen 4 definitivo.
- Autoría de terceros. Lo publica `stealth-model` (Stealth Models), no el equipo de Qwen; no hay verificación independiente de la procedencia de los pesos ni del proceso de cuantización, más allá de la etiqueta `imatrix`.
- Model card con contenido promocional. Buena parte del texto es una guía de lanzamiento de Qwen 4 con enlaces de afiliación y utm, con afirmaciones especulativas («likely», «on release day») mezcladas con la documentación técnica. Las variantes Qwen4-27B, Qwen4-35B-A3B y Qwen4-Flash no están confirmadas.
- Licencia restrictiva o al menos no estándar: `qwen-community-1.0`, etiquetada como `other`. Hay que leer el texto enlazado antes de cualquier uso comercial; no se puede asumir permisividad tipo Apache 2.0.
- Sin benchmarks de calidad. No hay MMLU, HumanEval ni evaluaciones de alucinación, sesgo o seguridad. La única métrica publicada es la aceleración de MTP.
- Idiomas no declarados. No se puede confirmar el soporte de castellano ni de otras lenguas.
- Dependencia de versiones muy concretas: llama.cpp build b11971 o posterior, y la rama `qwen4exp/mtp` de Unsloth para MTP, todavía en revisión para el repositorio oficial. Un cambio de build puede romper la configuración documentada.
- Rendimiento fuertemente condicionado por el hardware: con la tabla n-gram en SSD y los expertos en RAM, el throughput depende del ancho de banda de memoria y de la velocidad del NVMe; el usuario debe ajustar `--n-cpu-moe` manualmente (subir 2 si hay OOM, bajar 1 si sobra VRAM).
- Riesgo de configuración incorrecta del contexto largo: YaRN debe aplicarse solo cuando se necesite, según la recomendación de Qwen, y ampliar a 1M sin ajustar `-ub`, caché KV o `--n-cpu-moe` provoca fallos de memoria.
- Solo GGUF: no hay safetensors en el repositorio, así que no se puede servir directamente en vLLM o TGI sin convertir.
- Madurez del repositorio: 0 descargas y 2 «likes» en el momento de la consulta, creado y actualizado en dos días consecutivos; no hay historial de mantenimiento ni issues.
- Visión disponible pero no evaluada: los `mmproj` se ofrecen en cuatro precisiones sin métricas de calidad multimodal.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/stealth-model/Qwen4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Texto de la licencia `qwen-community-1.0`: https://huggingface.co/stealth-model/Qwen4/blob/main/Qwen3.8-Flash-Next/LICENSE
- Página del autor sobre Qwen 4 (guía «Jade Atlas»): https://stealthmodels.com/qwen-4/
- Sitio del autor: https://stealthmodels.com/
- Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre el modelo (los resultados correspondían a la película «Stealth», accesorios de gaming y productos de movilidad), por lo que no se enlazan. No se han encontrado papers, blogs técnicos ni demos adicionales en la información proporcionada.
