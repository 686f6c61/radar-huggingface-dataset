# SuperLogic/Qwen3.5-4B-3D-Coder-MTP-GGUF

## Resumen

Qwen3.5-4B-3D-Coder-MTP-GGUF es una redistribución en formato GGUF del modelo `ccore/Qwen3.5-4B-3D-Coder`, un fine-tune de Qwen3.5-4B especializado en generar escenas Three.js/WebGL completas a partir de descripciones en lenguaje natural. El autor, SuperLogic, no entrena ni modifica los pesos del modelo principal: su aportación consiste en restaurar la cabeza MTP (multi-token prediction) que el checkpoint original declara en su configuración pero no incluye en los safetensors, y empaquetarla junto al resto de tensores en un único fichero GGUF compatible con llama.cpp.

El problema que resuelve es concreto y medible: al carecer de tensores `*.mtp.*`, el modelo original solo puede decodificar un token por paso en cualquier runtime que intente usar decodificación especulativa (llama-server, LM Studio). Con la cabeza restaurada, el autor reporta un incremento de 47,94 a 90,66 tok/s en una RTX 4060 Laptop de 8 GB, manteniendo el mismo prompt y la misma salida.

La relevancia es doble: por un lado, demuestra que la decodificación especulativa basada en MTP puede duplicar el throughput en modelos pequeños limitados por ancho de banda de memoria; por otro, documenta con detalle los dos errores clásicos al reconstruir una cabeza MTP (tipos de dato en las normas y el desplazamiento `w-1` de los RMSNorm de Qwen3.5) que producen una ruta de draft silenciosamente inútil. El modelo base tiene 4B parámetros nominales, aunque el recuento real de safetensors del repo es de 333.514.240 parámetros, y licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5) con cabeza MTP de 1 capa para decodificación especulativa |
| Parametros totales | 333.514.240 (recuento real en safetensors); 4B nominales según nombre del modelo base |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 64K soportados por el modelo; el autor recomienda ≤16384 en GPU de 8 GB |
| Tipos de cuantizacion | Q8_0 (tensores del modelo principal y caché KV); normas en F32, matrices MTP en F16 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); base en safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.5-4B, un transformer denso con 32 capas más una capa MTP adicional (`mtp_num_hidden_layers = 1`, `nextn_predict_layers = 1`), que actúa como drafter interno para decodificación especulativa. El fine-tune `ccore/Qwen3.5-4B-3D-Coder` especializa el modelo en generación de código Three.js y WebGL. No se dispone de información sobre el volumen de tokens, la composición del dataset de fine-tune ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica del repo no está en el entrenamiento sino en la reconstrucción del artefacto: los 15 tensores MTP ausentes se extraen del modelo base `Qwen/Qwen3.5-4B` mediante peticiones HTTP range (241 MB en lugar de los 8 GB completos), se renombran con el mapeo de `convert_hf_to_gguf.py` y se añaden al GGUF original sin recuantizar. Se ajustan tres metadatos: `block_count` de 32 a 33, `nextn_predict_layers` de 0 a 1 y se añade un `false` final a `attention.recurrent_layers`. Dos detalles críticos documentados por el autor: las normas deben almacenarse en F32 y las matrices en F16 (BF16 provoca un fallo del RMSNorm en CPU: `binary_op: unsupported types`), y Qwen3.5 almacena los pesos RMSNorm como `w-1`, por lo que una copia de bytes sin sumar 1 produce una cabeza que acepta 0 de 1198 tokens (síntoma: `nextn.enorm` con media negativa en lugar de ≈0,4).

## Capacidades

- Generación de código Three.js y WebGL: produce escenas 3D completas a partir de una descripción en lenguaje natural.
- Generación de texto general y razonamiento, heredados del modelo base Qwen3.5-4B.
- Decodificación especulativa mediante cabeza MTP integrada, activable en runtime.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas a inglés según la etiqueta de idioma del repo.
- Capacidades de visión: la etiqueta `vision` aparece en los tags y el autor menciona un proyector de visión cargado (pico de VRAM de 6769 MiB con el proyector), pero no se detalla su funcionamiento.

## Casos de uso

- Generación de escenas 3D en prototipado rápido: a partir de un párrafo descriptivo, el modelo emite código Three.js completo que puede pegarse en un editor y visualizarse, lo que acelera la exploración de ideas en proyectos WebGL.
- Inferencia local en portátiles con GPU de 8 GB: con cuantización Q8_0 y decodificación especulativa activada, el modelo alcanza 90,66 tok/s en una RTX 4060 Laptop, suficiente para flujos interactivos sin conexión a la nube.
- Asistente de código en LM Studio: integrado como modelo local con Draft MTP activado, `Max concurrent predictions = 1` y `Draft probability = 0`, sirve para autocompletar y generar fragmentos de código 3D en el editor.
- Automatización de pipelines de generación de contenido 3D: el modelo puede invocarse desde scripts que traducen especificaciones de producto en escenas WebGL de demostración, aprovechando su especialización en Three.js.
- Evaluación de técnicas de decodificación especulativa: el repo sirve como banco de pruebas reproducible para comparar `--spec-draft-n-max` (2, 4, 6), ngram y distintos tamaños de ubatch de draft en llama.cpp.
- Investigación sobre reconstrucción de checkpoints: los detalles documentados sobre tipos F32/F16 en normas y el desplazamiento `w-1` de Qwen3.5 son material de referencia para quien necesite reparar exportaciones GGUF incompletas.
- Despliegue con llama-server: mediante `--spec-type draft-mtp-adaptive` y `--spec-draft-n-max 4`, se puede exponer el modelo como servidor HTTP local para aplicaciones que generen código 3D bajo demanda.

## Benchmarks y rendimiento

Datos medidos por el autor en una RTX 4060 Laptop de 8 GB, uso exclusivo de la GPU, `-fa on`, contexto de 64K, caché KV `q8_0`, un prompt repetido con salidas de 1200 tokens y primer round descartado como warm-up.

| Configuración | tok/s | Aceptación | Tokens/paso |
|---|---|---|---|
| GGUF original, sin especulación | 47,94 | — | 1,00 |
| Este fichero, `--spec-draft-n-max 2` | 68,44 | 0,86 | 2,72 |
| Este fichero, `--spec-draft-n-max 4` | 90,66 | 0,71 | 3,60 |
| Este fichero, `--spec-draft-n-max 6` | 85,07 | 0,62 | 3,80 |
| n-max 4 + `--spec-type ngram-mod,draft-mtp-adaptive` | 89,48 | 0,69 | 3,60 |
| n-max 4 + `LLAMA_MTP_DRAFT_UBATCH=64` | 89,42 | — | — |

Pico de VRAM con el proyector de visión cargado: 6769 / 8188 MiB a contexto de 64K. El autor explica que a 47,9 tok/s los 4,48 GB de pesos se leen a unos 215 GB/s frente a un pico de 256 GB/s, por lo que la decodificación está limitada por ancho de banda y verificar 4 tokens borrador cuesta casi lo mismo que verificar 1. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 6769 MiB de pico con proyector de visión y contexto de 64K en Q8_0; el autor recomienda contexto ≤16384 en GPU de 8 GB.
- GPU recomendadas: RTX 4060 Laptop (8 GB) verificada por el autor; GPU de escritorio con ≥8 GB para contexto largo; el modelo debe residir íntegramente en VRAM para que la especulación aporte ganancias.
- Cabe en GPU de consumo: sí, en tarjetas de 8 GB o más con cuantización Q8_0 y contexto moderado.
- Opciones de despliegue: llama.cpp (`llama-server` con `--spec-type draft-mtp-adaptive`), LM Studio (con Draft MTP activado) y cualquier runtime compatible con GGUF y decodificación especulativa MTP.
- Throughput: 47,94 tok/s sin especulación y 90,66 tok/s con `--spec-draft-n-max 4` en RTX 4060 Laptop; 68,44 tok/s con n-max 2 y 85,07 tok/s con n-max 6.
- Advertencia de rendimiento: en Windows, LM Studio tiene por defecto `Strict GPU VRAM cap: OFF`, lo que puede provocar paginación a memoria del sistema y anular silenciosamente las ganancias de la especulación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| SuperLogic/Qwen3.5-4B-3D-Coder-MTP-GGUF | 333.514.240 reales (4B nominales) | 64K | Three.js/WebGL + MTP | apache-2.0 | GGUF |
| ccore/Qwen3.5-4B-3D-Coder | 4B nominales | 64K | Three.js/WebGL, sin cabeza MTP | no disponible | safetensors |
| Qwen/Qwen3.5-4B | 738 tensores, 15 MTP | 64K | Propósito general, con MTP | no disponible | safetensors |

La comparación con alternativas de otros fabricantes (Llama, Gemma, Mistral de tamaño similar) no está disponible en la información proporcionada. La diferencia clave frente a los dos modelos de la tabla es la presencia efectiva de la cabeza MTP en el artefacto desplegable, que habilita la decodificación especulativa en llama.cpp y LM Studio.

## Limitaciones y advertencias

- El modelo está etiquetado únicamente en inglés (`en`); no hay evidencia de soporte multilingüe.
- Riesgo de alucinación inherente a un modelo de 4B: puede generar APIs de Three.js inexistentes o código que compile pero no renderice correctamente.
- La especialización en Three.js/WebGL puede degradar el rendimiento en tareas generales de código o razonamiento frente al Qwen3.5-4B base.
- La licencia Apache 2.0 permite uso comercial, pero el autor no documenta la procedencia ni las condiciones del fine-tune `ccore/Qwen3.5-4B-3D-Coder`, cuya licencia figura como no disponible.
- La ganancia de la decodificación especulativa depende del runtime: si Draft MTP no se activa explícitamente (está desactivado por defecto en LM Studio), el modelo rinde a la tasa base de 47,94 tok/s.
- En LM Studio, `Max concurrent predictions` debe ser 1; con 4 slots el modelo no cabe en 8 GB y se pierden las ganancias del drafter.
- `Draft probability` por defecto (0,75) rechaza una fracción alta de borradores correctos; el autor recomienda 0.
- Una GPU sobrecomprometida (offload total con VRAM insuficiente) provoca paginación a memoria del sistema y anula la especulación sin emitir ningún aviso.
- El repo tiene 0 descargas y 1 like en el momento de la consulta, por lo que no hay validación independiente de los resultados reportados.
- El recuento real de parámetros en safetensors (333.514.240) difiere del tamaño nominal de 4B del nombre del modelo; conviene verificar el artefacto antes de dimensionar infraestructura.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SuperLogic/Qwen3.5-4B-3D-Coder-MTP-GGUF
- Modelo base del fine-tune: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-4B
- Script de conversión citado: `convert_hf_to_gguf.py` del repositorio de llama.cpp (no se proporciona URL directa en la información disponible)
- Papers, blogs, repos y demos adicionales: no disponible
