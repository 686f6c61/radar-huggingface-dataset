# SuperLogic/Swift-Bonsai-2-PTQ1_0-mtp-pro-q4km

## Resumen

Swift-Bonsai-2-PTQ1_0-mtp-pro-q4km es una cuantización GGUF publicada por SuperLogic sobre el modelo base Qwen/Qwen3.8-27B, un transformer denso de 27B parámetros orientado a generación de código y texto. El paquete combina una columna vertebral ternaria (PTQ1_0) con una cabeza de decodificación especulativa MTP (multi-token prediction) empaquetada dentro del propio fichero GGUF, junto con las capas de embedding y salida conservadas en q4_K_M para preservar precisión. El resultado es un artefacto de 5,79 GB que, según la model card, cabe íntegramente en una GPU de portátil con 8 GB de VRAM.

La relevancia del modelo está en el binomio tamaño/velocidad: un modelo de clase 27B que en FP16 ocuparía unos 54 GB se reduce a 5,79 GB mediante cuantización ternaria, CUDA graphs, decodificación especulativa MTP con profundidad máxima 4 y una lista corta de vocabulario de borrador de 24k entradas (frente a las 248k del vocabulario completo). El autor reporta velocidades de 70-90 t/s en generación de código y 100-200 t/s en modo edición sobre una RTX 4060 Laptop de 8 GB, frente a 1-2 t/s del mismo modelo base con cuantización oficial de 4 bits.

El modelo declara soporte de contexto largo (88K tokens completamente en VRAM con caché K/V q3_0), capacidades de generación de código en Python, C, SQL, Go, TypeScript, Rust y JavaScript, y soporte de visión mediante un proyector multimodal separado (mmproj). La licencia es Apache 2.0 y los idiomas declarados son inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.8-27B) con cabeza MTP de decodificación especulativa incorporada en el GGUF |
| Parametros totales | 27B (modelo base); el tensor safetensors reportado en el repo suma 460.730.096 elementos, dato no coherente con el tamaño nominal del modelo base |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 88K tokens con caché K/V q3_0 en 8 GB de VRAM; 65.536 tokens (`-c 65536`) en tarjetas de 8 GB; 32.768 en tarjetas de 6 GB |
| Tipos de cuantizacion | PTQ1_0 (ternaria) en la columna vertebral; q4_K_M en capas de embedding y salida; caché K/V en q4_0 o q3_0 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); 866 tensores en el fichero principal |
| Tamano del repo | 13,1 GB |
| Tamano del fichero principal | 5,79 GB (`Qwen3.8-27B-Flash-MTP.gguf`) |
| Descargas | 6.949 |
| Likes | 14 |
| Fecha de creacion | 2026-10-15 |
| Fecha de actualizacion | 2026-10-24 |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un transformer denso de 27B parámetros. Sobre esa base, la cadena de derivación pasa por prism-ml/Ternary-Bonsai-2-27B-gguf y ukisai/Swift-Bonsai-2-GGUF antes de llegar a esta cuantización de SuperLogic. La columna vertebral se cuantiza a ternario (PTQ1_0) con kernels CUDA específicos del fork, mientras que las capas de embedding y de salida se mantienen en q4_K_M para limitar la pérdida de precisión en los extremos de la red.

La innovación técnica principal es la decodificación especulativa MTP con la cabeza de borrador incluida en el propio GGUF (tensor `blk.64.nextn`), con profundidad máxima 4. El paso de borrador lee una matriz `output.weight` de `[5120, 248320]` (265 MB) en cada token; la optimización propia del autor restringe la puntuación del borrador a las 24.000 filas que el modelo usa realmente, reduciendo la lectura a unos 26 MB por paso (aproximadamente un 90% menos de bytes) sin alterar la distribución de salida, ya que el modelo objetivo verifica contra el vocabulario completo. Se complementa con CUDA graphs (aproximadamente 1,5x de mejora) y un reparto escalonado de la caché K/V (`kv-vram-cells`) para mantener contexto largo en VRAM.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en la información proporcionada. El fork de llama.cpp es obligatorio: PTQ1_0 y el contexto de borrador MTP solo existen en esa implementación, y el llama.cpp estándar rechaza los tensores.

## Capacidades

- Generación de texto y código en Python, C, SQL, Go, TypeScript, Rust y JavaScript.
- Modo edición: revisión y modificación de ficheros o documentos existentes, con velocidades superiores al modo generación gracias a la mayor predictibilidad del borrador ngram.
- Decodificación especulativa MTP con profundidad hasta 4 y lista corta de vocabulario de borrador de 24k entradas.
- Contexto largo de hasta 88K tokens íntegramente en VRAM con caché K/V q3_0.
- Soporte de visión mediante proyector multimodal separado (`mmproj-Qwen3.8-27B-Q8_0.gguf`) con `--image-min-tokens 1024`.
- Modo thinking desactivable (las velocidades reportadas se midieron con thinking off).
- Idiomas: inglés y chino.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes multi-paso: la model card menciona sesiones de agente con contexto largo, pero no detalla protocolos de agente ni APIs específicas.

## Casos de uso

- Generación de código en producción sobre hardware de consumo: el modelo produce código en siete lenguajes a 70-90 t/s en una RTX 4060 Laptop de 8 GB, lo que permite integrarlo en flujos de autocompletado o generación de parches sin depender de APIs en la nube.
- Edición y refactorización de ficheros existentes: en modo edición alcanza 100-200 t/s porque el borrador ngram predice largos tramos de texto ya presentes en el documento, lo que lo hace adecuado para tareas de reescritura, migración de código o aplicación de cambios masivos.
- Asistente de código local con contexto largo: con 88K tokens en VRAM puede mantener sesiones de agente que abarcan varios ficheros o un repositorio mediano sin truncar el contexto, útil para revisión de código y navegación de bases de código.
- Autocompletado interactivo en IDE: la latencia propia de la decodificación especulativa (varios tokens por paso forward) encaja con el ritmo de escritura del desarrollador en un portátil con GPU de 8 GB.
- Procesamiento de documentación técnica con imágenes: mediante el proyector mmproj puede extraer información de diagramas, capturas de pantalla o documentación escaneada junto con el texto, en flujos de generación de documentación o análisis de incidencias.
- Despliegue en entornos sin conectividad o con requisitos de privacidad: al ejecutarse íntegramente en local con licencia Apache 2.0, es apto para entornos donde el código no puede salir de la máquina, como auditorías internas o desarrollo en sectores regulados.
- Generación de consultas SQL y scripts de automatización: el soporte declarado de SQL y su velocidad en código lo hacen utilizable en pipelines de generación de consultas o scripts de operaciones sobre volúmenes moderados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de velocidad medidas por el autor:

| Carga de trabajo | Velocidad reportada | Hardware |
|---|---|---|
| Generación de código | ~70-90 t/s | RTX 4060 Laptop, 8 GB, thinking off |
| Modo edición | ~100-200 t/s | RTX 4060 Laptop, 8 GB, thinking off |
| Modelo base con cuantización oficial de 4 bits (referencia) | ~1-2 t/s | misma clase de máquina |

El autor advierte que estos rangos dependen de la proporción de salida predecible por el borrador ngram y no deben tratarse como garantía.

## Requisitos de hardware

- VRAM estimada para inferencia: 5,79 GB de pesos más caché K/V; cabe en 8 GB con contexto de hasta 88K usando caché K/V q3_0 (14 KB por token frente a 18 KB de q4_0).
- En tarjetas de 8 GB se recomienda `-c 65536`; en tarjetas de 6 GB, bajar a `-c 32768`.
- GPU recomendadas: RTX 4060 Laptop (medición de referencia del autor); no se especifican otras GPU en la información disponible.
- Cabe en GPU de consumo: sí, en el rango de 8 GB de VRAM según la model card.
- Opciones de despliegue: llama.cpp mediante el fork obligatorio `llama.cpp-qwen38-flash`, con `llama-server`; se distribuyen binarios precompilados para Windows con DLLs de CUDA incluidas (sin necesidad de instalar el CUDA Toolkit). El llama.cpp estándar no es compatible.
- Fichero de configuración `features.ini` obligatorio, leído en el arranque mediante `--features-file`; sin él se pierden la lista corta de borrador de 24k, el reparto escalonado de KV y el muestreo probabilístico del borrador.
- Ajustes de reproducción: `--temp 0.6 --top-k 20 --top-p 0.95`; `--spec-type ngram-mod,draft-mtp-adaptive` (obligatorio, sin `draft-mtp-adaptive` el rendimiento se reduce aproximadamente a la mitad); `--spec-draft-vocab-map maps/shortlist_24k_mix.vocab.txt`.
- Latencia y throughput: ver tabla de benchmarks; no hay datos de latencia por token ni de throughput en batch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift-Bonsai-2-PTQ1_0-mtp-pro-q4km (este) | 27B | 88K en 8 GB VRAM | PTQ1_0 ternaria + q4_K_M | Apache 2.0 | GGUF en Hugging Face, fork de llama.cpp |
| Qwen/Qwen3.8-27B (base) | 27B | no disponible | FP16 y cuantizaciones estándar | no disponible en la información | Hugging Face |
| prism-ml/Ternary-Bonsai-2-27B-gguf | 27B | no disponible | ternaria | no disponible en la información | GGUF en Hugging Face |
| ukisai/Swift-Bonsai-2-GGUF | 27B | no disponible | GGUF | no disponible en la información | GGUF en Hugging Face |

No se dispone de datos de rendimiento comparativo (MMLU, HumanEval, GSM8K) para ninguno de los modelos de la tabla en la información proporcionada, por lo que la comparativa se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- La cuantización ternaria PTQ1_0 introduce pérdida de precisión frente al modelo base en FP16; el autor solo preserva embedding y salida en q4_K_M, sin datos publicados sobre la degradación resultante en benchmarks.
- El fork de llama.cpp es obligatorio: el llama.cpp estándar rechaza los tensores PTQ1_0 y no reconoce el contexto de borrador MTP. Esto limita la portabilidad y obliga a mantener una implementación no oficial.
- El fichero `features.ini` es imprescindible y no está compilado en el binario; un binario compilado desde fuente sin ese fichero se comporta como el llama.cpp original y pierde las optimizaciones clave.
- El rendimiento reportado (70-200 t/s) procede de mediciones del autor en una RTX 4060 Laptop con thinking off y depende de la predictibilidad del texto; en prosa libre el rendimiento cae a la parte baja del rango.
- Idiomas limitados a inglés y chino; no se declara soporte de español ni de otros idiomas.
- No hay información sobre tool calling, function calling ni protocolos de agente; la mención a sesiones de agente en la model card no detalla la implementación.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada; al ser una cuantización del modelo base, hereda los sesgos de Qwen3.8-27B, no documentados aquí.
- La licencia Apache 2.0 permite uso comercial, pero la cadena de modelos derivados (prism-ml, ukisai) no detalla sus términos en la información disponible; conviene verificar cada eslabón antes de un despliegue comercial.
- El dato de parámetros totales en safetensors (460.730.096) no es coherente con el tamaño nominal de 27B del modelo base; se desconoce si corresponde a un subconjunto de tensores o a un error de metadatos.
- El contexto de 88K requiere caché K/V q3_0 y 8 GB de VRAM; en tarjetas de 6 GB el contexto máximo práctico baja a 32.768 tokens.

## Enlaces

- Hugging Face: https://huggingface.co/SuperLogic/Swift-Bonsai-2-PTQ1_0-mtp-pro-q4km
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo intermedio ternario: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Modelo intermedio GGUF: https://huggingface.co/ukisai/Swift-Bonsai-2-GGUF
- Lanzador y configuración: https://github.com/zgsndzq/qwen38-27b-flash-mtp
- Binarios precompilados (Windows, CUDA incluida): https://github.com/zgsndzq/llama.cpp-qwen38-flash/releases
- Código fuente del motor y scripts de compilación: https://github.com/zgsndzq/llama.cpp-qwen38-flash
