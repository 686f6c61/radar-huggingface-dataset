# takanori-ishikawa/Qwen3.5-ANE-CoreML

## Resumen

Qwen3.5-ANE-CoreML es una conversión no oficial de los modelos de texto Qwen3.5-0.8B, Qwen3.5-2B y Qwen3.5-4B al formato Core ML, publicada por el usuario takanori-ishikawa, con el objetivo explícito de ejecutarlos sobre el Apple Neural Engine (ANE) de los Macs con Apple Silicon. No es un lanzamiento del equipo Qwen y el autor lo declara así de forma explícita; se trata de un trabajo de conversión e ingeniería de despliegue sobre pesos ya entrenados.

El repositorio incluye artefactos separados por modelo y por longitud de contexto (2048, 8192 y 16384 tokens), con pesos cuantizados en 6 bits mediante palettización k-means con tamaño de grupo 32, más una tabla de embeddings compartida en int8 con escalas fp16. Incorpora decodificación especulativa mediante un borrador MTP (multi-token prediction) y grafos multifunción que exponen una función `decode` de un token y una función `verify` de cuatro tokens compartiendo pesos.

Su relevancia práctica es doble: por un lado, permite ejecutar modelos Qwen3.5 de tamano pequeno completamente en local sobre hardware Apple sin GPU dedicada, con implicaciones de privacidad y consumo; por otro, documenta límites reales del ANE (formas estáticas, máximo de 8 actualizaciones dinámicas de slice, imposibilidad de compilar 32K de contexto), lo que lo convierte en una referencia técnica útil para quien trabaje con Core ML a bajo nivel. El runtime Swift del autor y su demo SwiftUI no se distribuyen públicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en detalle en la informacion disponible; la model card menciona un grafo de salida DeltaNet (W4p) en la funcion de verificacion. Modelo base Qwen3.5 (transformer denso) |
| Parametros totales | Tres variantes: 0.8B, 2B y 4B |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2048, 8192 (solo 2B) y 16384 tokens segun artefacto; 32K no compila para ANE con este grafo |
| Tipos de cuantizacion | Pesos en 6 bits palettizados (k-means, group size 32, `lut6`); tabla de embeddings int8 simetrica por filas con escalas fp16; formato fp16 crudo conservado como compatibilidad pero excluido de la distribucion |
| Idiomas soportados | Ingles y japones |
| Licencia | Apache 2.0 |
| Formato de pesos | `.mlpackage` (Core ML) mas tablas de embeddings `.int8.bin` compartidas en la raiz del repositorio; no se publican safetensors ni GGUF |

Datos adicionales de los artefactos:

| Directorio | Modelo | Contexto | Tamano (GiB) | Rol |
|---|---|---:|---:|---|
| `qwen3.5-2b_ctx2048_chunks6_multifunction_lut6_kvslice_gqagrouped` | 2B | 2048 | 1.330 | Decode de un token + verify k=4 |
| `qwen3.5-2b_ctx2048_lut6_mtp_fill_chain3` | 2B | 2048 | 0.1 | Borrador MTP |
| `qwen3.5-2b_ctx8192_chunks6_lut6_kvslice_gqagrouped_kvsplit` | 2B | 8192 | 1.3 | Decode de un token |
| `qwen3.5-2b_ctx16384_chunks6_multifunction_lut6_kvslice_gqagrouped` | 2B | 16384 | 1.351 | Decode de un token + verify k=4 |
| `qwen3.5-2b_ctx16384_lut6_mtp_fill_chain3` | 2B | 16384 | 0.1 | Borrador MTP |
| `qwen3.5-0.8b_ctx2048_chunks6_multifunction_lut6_kvslice_gqagrouped` | 0.8B | 2048 | 0.540 | Decode de un token + verify k=4 |
| `qwen3.5-0.8b_ctx2048_lut6_mtp_fill_chain3` | 0.8B | 2048 | 0.1 | Borrador MTP |
| `qwen3.5-4b_ctx2048_chunks8_multifunction_lut6_kvslice_gqagrouped` | 4B | 2048 | 2.975 | Decode de un token + verify k=4 |
| `qwen3.5-4b_ctx2048_lut6_mtp_fill_chain3` | 4B | 2048 | 0.438 | Borrador MTP |

Tabla de embeddings compartida (int8, excluida del computo de tamanos de directorio):

| Modelo | Forma | Bytes | MiB | Offset de escalas (bytes) |
|---|---:|---:|---:|---:|
| 0.8B | `[248320, 1024]` | 254776320 | 242.97 | 254279680 |
| 2B | `[248320, 2048]` | 509056000 | 485.47 | 508559360 |
| 4B | `[248320, 2560]` | 636195840 | 606.72 | 635699200 |

## Arquitectura y entrenamiento

No hay información sobre el entrenamiento de estos artefactos: son conversiones de pesos ya entrenados de Qwen3.5-0.8B, Qwen3.5-2B y Qwen3.5-4B, y la model card no describe dataset, número de tokens, ni fases de RLHF o DPO. Tampoco se detalla la arquitectura interna del modelo base más allá de la mención a un grafo de salida DeltaNet empleado en la función de verificación con pre-escalado de proyección de `2^8`. Lo que sí se documenta con precisión es la ingeniería de la conversión.

La conversión divide el modelo en paquetes de 4 capas (`chunks6` para 24 capas en el 0.8B y el 2B; `chunks8` para 32 capas en el 4B). Cada paquete multifunción contiene una función `decode` de un token y una función `verify` de cuatro tokens que comparten los pesos almacenados. La caché KV se mantiene como estado de Core ML en el ANE, actualizada por slices, agrupada por grupo GQA y con K y V en estados separados en las funciones de decode; la función de verify mantiene K y V de una capa en un único estado y escribe ambos con una sola actualización de slice por fila, una decisión forzada por el límite del driver del ANE. La cuantización emplea palettización k-means de 6 bits con tamaño de grupo 32, y la tabla de embeddings usa cuantización simétrica por filas (`scale = max(abs(row))/127`, redondeo a par) en int8, recuperable mediante mmap y multiplicación en fp32 con salida fp16.

La decodificación especulativa se apoya en artefactos MTP separados por modelo y contexto, que aportan un borrador `fill` publicado más una cadena de 3 pasos a 32K. El ANE impone formas estáticas: `ctx` es la longitud del búfer KV y el coste de decodificación crece con él con independencia de la longitud real del prompt.

## Capacidades

- Generación de texto autoregresiva en inglés y japonés, con tokenizador y plantilla de chat idénticos a los del modelo original.
- Decodificación de un token mediante la función `decode` de los paquetes multifunción.
- Decodificación especulativa MTP: la función `verify` valida 4 tokens por paso y los artefactos MTP aportan el borrador, con una cadena de 3 pasos.
- Ejecución íntegra sobre el Apple Neural Engine, sin GPU dedicada ni acceso a red.
- Reutilización de una tabla de embeddings int8 compartida entre los artefactos de decode, verify y MTP de un mismo modelo.
- No se documentan capacidades de tool calling, function calling, uso de agentes, razonamiento multi-paso explícito, visión ni audio.
- No se documenta un modo de pensamiento (thinking mode) ni ninguna capacidad multimodal.
- El driver Python de referencia (`examples/generate.py`) implementa únicamente decodificación greedy de un token.

## Casos de uso

- Asistentes de chat locales en aplicaciones macOS: el artefacto de 2B con contexto 2048 ocupa 1.330 GiB y se ejecuta sobre ANE, de modo que puede embeberse en una app de escritorio sin servidor ni conexión a internet.
- Procesamiento de documentos confidenciales en japonés e inglés: con el artefacto de 2B y contexto 16384 (1.351 GiB) se pueden resumir o extraer información de contratos e informes sin que el texto salga del equipo.
- Investigación sobre decodificación especulativa en hardware Apple: la combinación de un directorio multifunción y su directorio MTP del mismo modelo y contexto permite medir la tasa de aceptación de la verificación k=4 y el coste de la cadena de 3 pasos.
- Estudio de cuantización de bajo bit en aceleradores dedicados: la palettización k-means de 6 bits con tamaño de grupo 32 y la tabla de embeddings int8 sirven como caso de referencia reproducible frente al formato fp16 crudo.
- Prototipado en Python sobre coremltools 9 y numpy: el driver de referencia permite validar la integración de un `.mlpackage` con una tabla de embeddings mmap antes de invertir en un runtime propio.
- Aplicaciones iOS y macOS con requisitos de eficiencia energética: al delegar todo el cálculo al ANE, el modelo no compite por la GPU y encaja en flujos de trabajo que ya usan Neural Engine para otras tareas.
- Despliegue en flotas de Macs Apple Silicon (por ejemplo, M4 Pro) para tareas de generación de texto de bajo volumen sin infraestructura GPU.
- Evaluación comparativa entre las tres tallas: 0.8B (0.540 GiB a contexto 2048), 2B (1.330 GiB) y 4B (2.975 GiB) permiten trazar la curva de calidad frente a memoria y latencia en el mismo acelerador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que algunas cifras se obtuvieron con sondas de medida en Python que no se han publicado, y no se incluyen tablas de MMLU, HumanEval, GSM8K ni de latencia o throughput.

## Requisitos de hardware

- Plataforma: Mac con Apple Silicon, con ejecución sobre el Apple Neural Engine. Las medidas declaradas se tomaron en un M4 Pro con macOS 26.5.1, Python 3.12 y coremltools 9.
- Memoria en disco por artefacto (excluyendo la tabla de embeddings compartida): 0.8B/ctx2048 0.540 GiB; 2B/ctx2048 1.330 GiB; 2B/ctx8192 1.3 GiB; 2B/ctx16384 1.351 GiB; 4B/ctx2048 2.975 GiB; borradores MTP entre 0.1 y 0.438 GiB.
- Tabla de embeddings compartida: 242.97 MiB (0.8B), 485.47 MiB (2B) y 606.72 MiB (4B).
- Tamano total del repositorio: 47,3 GB, ya que incluye todas las variantes de modelo y contexto.
- El artefacto de 0.8B es el unico claramente holgado para equipos con memoria unificada reducida; el de 4B a contexto 2048 (2.975 GiB) exige al menos un Mac con 16 GB de memoria unificada para operar con margen.
- No cabe en GPU de consumo tipo RTX 4090 en el sentido habitual: los artefactos son Core ML y estan pensados para ANE, no para CUDA.
- Opciones de despliegue: coremltools 9 y numpy desde Python con el driver `examples/generate.py`; el runtime Swift y la demo SwiftUI del autor no se distribuyen. El soporte de `inference: false` en la model card desaconseja su uso como pipeline estandar de HuggingFace.
- Latencia y throughput: no disponibles. El coste de decodificación crece con la longitud del búfer KV, que es estatico por artefacto, y no con la longitud del prompt.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Qwen3.5-ANE-CoreML (0.8B / 2B / 4B) | 0.8B, 2B, 4B | 2048, 8192 y 16384 segun artefacto | `.mlpackage` + embeddings int8 | Apache 2.0 | Publico en HuggingFace (625 descargas); runtime Swift no distribuido |
| Qwen/Qwen3.5-0.8B (modelo base) | 0.8B | no disponible | no disponible | no disponible | Publico en HuggingFace |
| Qwen/Qwen3.5-2B (modelo base) | 2B | no disponible | no disponible | no disponible | Publico en HuggingFace |
| Qwen/Qwen3.5-4B (modelo base) | 4B | no disponible | no disponible | no disponible | Publico en HuggingFace |

No se dispone de datos comparativos de rendimiento ni de otras conversiones Core ML equivalentes en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, formato y licencia.

## Limitaciones y advertencias

- Es una conversión no oficial: no está afiliada ni respaldada por el equipo Qwen, y la propia model card lo advierte.
- La model card declara `inference: false`; el flujo de uso previsto no es el pipeline estandar de HuggingFace.
- El runtime Swift y la demo SwiftUI que soportan decodificación especulativa MTP no se distribuyen públicamente; el único driver disponible es Python con decodificación greedy de un token. Las sondas de medida tampoco se publican.
- Formas estáticas: el contexto (`ctx`) es la longitud del búfer KV y el coste de decodificación crece con él aunque el prompt sea corto. 32K no compila para ANE con este grafo.
- Límite del driver del ANE: desde macOS 26.6.2 / iOS 26.6.1 el kernel rechaza programas con 8 o más actualizaciones dinámicas de slice (`Number of SNE ops exceeded max allowed: 8`, error Core ML -14). Las funciones de verify solo son viables manteniendo K y V en un mismo estado por capa.
- Idiomas limitados a inglés y japonés según los metadatos; no hay cobertura declarada de castellano.
- Repositorio de 47,3 GB, lo que obliga a descargar selectivamente el artefacto y la tabla de embeddings correspondientes.
- No hay benchmarks publicados, por lo que la calidad real frente a los modelos base no puede verificarse con los datos disponibles.
- Al derivar de Qwen3.5, hereda los sesgos y el riesgo de alucinación del modelo original, no caracterizados en esta ficha.
- Licencia Apache 2.0, que permite uso comercial, pero el autor no ofrece garantías sobre los artefactos convertidos.
- La palettización k-means de 6 bits y la cuantización int8 de la tabla de embeddings introducen pérdida de precisión respecto a los pesos originales, no cuantificada en la información disponible.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/takanori-ishikawa/Qwen3.5-ANE-CoreML
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Driver de referencia incluido en el repositorio: `examples/generate.py`
- No se han encontrado papers, blogs ni demos adicionales en la busqueda web realizada; los resultados devueltos no guardan relacion con el modelo.
