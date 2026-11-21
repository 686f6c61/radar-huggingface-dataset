# tablinum/MagicEightBall

## Resumen

MagicEightBall es un modelo de decisión extremadamente compacto publicado por el usuario tablinum en Hugging Face. No se trata de un modelo de lenguaje generativo en el sentido convencional, sino de una cabeza de decisión (decision head) que procesa hasta 131.072 tokens de tipo Needle 3 y devuelve tres campos estructurados: `may_route` (booleano), `category` (categoría) y `action` (acción propuesta). El host se encarga de contar tokens y extraer la evidencia; el modelo solo ejecuta la política de decisión.

La compilación nativa ocupa tan solo 480 bytes y está pensada para ejecutarse en el Intel Neural Compute Stick original (Myriad 2) mediante OpenVINO 2020.3.2, mientras que la compilación estándar ocupa 512 bytes. El repositorio incluye además variantes ONNX, FP32, GGUF y compilaciones nativas adicionales, todas derivadas de la misma política. El modelo está orientado a inglés y su licencia combina MIT y Apache 2.0.

Su relevancia radica en el extremo opuesto al de los grandes modelos: demuestra que una política de decisión con contexto de 131.072 tokens puede ejecutarse en hardware de borde con acelerador neuronal dedicado y latencias de decenas de milisegundos, sin depender de GPUs ni de infraestructura en la nube. Es un caso de estudio de eficiencia extrema más que un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cabeza de decisión (decision head) con política de tipo rule-engine; compilaciones nativas para NCS1 y variantes ONNX/GGUF/FP32 |
| Parámetros totales | no disponible (el artefacto nativo ocupa 480 bytes; la referencia FP32 densa ocupa 1.832 bytes) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens (Needle 3); una adición que supere el límite se rechaza y preserva el estado previo |
| Tipos de cuantización | FP16 (tag declarado), FP32 (referencia densa); no se detallan otras variantes |
| Idiomas soportados | en |
| Licencia | MIT y Apache 2.0 (license: other, license_name: mit-and-apache-2.0) |
| Formato de pesos | artefactos nativos .m8b (480 y 512 bytes), ONNX, GGUF, FP32 |

## Arquitectura y entrenamiento

El modelo no es un transformer ni un MoE: se describe como una cabeza de decisión con motor de reglas que recibe tokens preprocesados por el host. El host realiza el conteo de tokens y la extracción de evidencia; el modelo aplica la política sobre esa evidencia y devuelve tres campos (`may_route`, `category`, `action`). La política de soporte está documentada en `support.json` y las compilaciones nativas comparan la misma política sobre el mismo hardware en seis variantes (compacta de 480 bytes, radix Gather de 512 bytes, convolución empaquetada de 1.536 bytes, lookup de 1.728 bytes, puertas booleanas de 3.776 bytes y referencia densa de 4.480 bytes).

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. La model card menciona que la compilación compacta y el tokenizador compartido suman 24.111 bytes, y que Python, OpenVINO, firmware y código host tienen tamaños separados. La innovación técnica destacable es la compresión extrema del artefacto de decisión y la capacidad de procesar contexto muy largo con un coste de almacenamiento mínimo, apoyándose en hardware de borde (Intel NCS1, Myriad 2).

## Capacidades

- Decisión estructurada: devuelve un booleano (`may_route`), una categoría y una acción propuesta a partir de evidencia textual.
- Contexto largo: procesa hasta 131.072 tokens por documento, incluyendo fixtures de contexto completo y veto tardío.
- Streaming y modo batch: soporta `--serve` con un array `documents` por línea JSON y `--stream` con `{"append":"next fragment"}`.
- Abstención: cuando falta evidencia, devuelve `false`, `null` y `null` (por ejemplo, "General help requested.").
- Veto de acciones: una instrucción posterior puede anular una acción propuesta (por ejemplo, "Do not route.").
- Ejecución en hardware de borde: compilación nativa para Intel NCS1 con OpenVINO 2020.3.2, Python 3.7, NumPy y SentencePiece 0.1.99.
- Variantes de despliegue: ONNX Runtime en CPU, GGUF con lector CPU incluido, FP32 densa de referencia.
- Soporte multilingüe: limitado a inglés (idioma declarado: en).

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo clasifica la evidencia extraída por el host y propone una categoría y acción (por ejemplo, revisión de facturación ante un cargo duplicado autorizado), con abstención cuando no hay evidencia suficiente.
- Veto y control de acciones en pipelines automatizados: una instrucción posterior en el documento puede anular una acción propuesta antes de ejecutarla, lo que permite implementar compuertas de seguridad en flujos de trabajo.
- Despliegue en hardware de borde sin GPU: la compilación nativa de 480 bytes se ejecuta en un Intel NCS1 físico con latencias de 6,43 ms p50 y 10,73 ms p95 para 128 decisiones cortas.
- Procesamiento de documentos largos con presupuesto mínimo: con 131.072 tokens de contexto y un artefacto de decisión de 512 bytes, se pueden evaluar contratos o registros extensos en un host modesto (44,24 ms p50 y 55,55 ms p95 para una autorización completa con contexto fresco).
- Servicio por lotes en CPU: mediante ONNX Runtime con la variante radix Gather (192 bytes) o GGUF (1.024 bytes), se pueden procesar lotes de documentos en CPU sin acelerador dedicado.
- Integración en sistemas de reglas existentes: la variante de referencia FP32 densa (1.832 bytes) con salidas booleanas directas sirve como base para validar o sustituir motores de reglas convencionales.
- Investigación sobre eficiencia extrema: comparar las seis compilaciones nativas de la misma política permite estudiar el compromiso entre tamaño del artefacto, latencia y fidelidad de decisión en hardware de borde.

## Benchmarks y rendimiento

La model card proporciona mediciones de latencia (31 repeticiones calentadas por carga de trabajo, mismo host Intel Core i7-12650H con Windows, mismo tokenizador y extracción de evidencia):

| Backend | Artefacto de decisión | 128 decisiones cortas, p50 / p95 | Autorización con 131.072 tokens, p50 / p95 |
|---|---:|---:|---:|
| NCS1 físico, una petición | Ejecutable nativo de 512 bytes | 6,43 / 10,73 ms | 44,24 / 55,55 ms |
| OpenVINO CPU, Gather emparejado | ONNX fuente de 258 bytes | 3,91 / 5,99 ms | 44,25 / 55,24 ms |
| Intérprete booleano CPU | Política fuente de 714 bytes | 4,57 / 8,26 ms | 39,26 / 49,48 ms |
| Lookup CPU | Tabla generada de 128 bytes | 3,82 / 6,95 ms | 37,63 / 50,03 ms |
| Diagrama de decisión CPU | Diagrama generado de 46 bytes | 4,03 / 7,37 ms | 37,92 / 52,50 ms |
| Lookup CPU compilado | Tabla de 128 bytes y librería nativa de 2.560 bytes | 3,29 (p50; p95 no disponible en el extracto) | no disponible |

La release superó las 128 asignaciones de la política de soporte en un NCS1 físico, incluyendo fixtures de contexto completo, un veto tardío y rechazo a los 131.073 tokens. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para CPU y acelerador neuronal de borde, no para GPU.
- Acelerador recomendado: Intel Neural Compute Stick original (Myriad 2) con OpenVINO 2020.3.2; toolchain Windows con Python 3.7, NumPy y SentencePiece 0.1.99.
- CPU: las variantes ONNX, GGUF, FP32 y las compilaciones CPU se ejecutan en CPU convencional; las mediciones se hicieron en un Intel Core i7-12650H.
- GPU de consumo: no aplica ni se documenta soporte.
- Despliegue: runtime.py con `--release-stick ncs1`, modo `--serve` (lotes JSON) y `--stream` (fragmentos incrementales); ONNX Runtime para CPU; lector CPU incluido para GGUF.
- Latencia: 6,43 ms p50 / 10,73 ms p95 en NCS1 para decisiones cortas; 44,24 ms p50 / 55,55 ms p95 para contexto completo de 131.072 tokens. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño del artefacto | Contexto | Licencia | Disponibilidad |
|---|---|---:|---|---|---|
| MagicEightBall | Cabeza de decisión / rule-engine | 480 bytes (nativo NCS1); 512 bytes (stock) | 131.072 tokens | MIT + Apache 2.0 | Hugging Face (variantes ONNX, FP32, GGUF) |
| Bonsai | Modelo de ranking de búsqueda | 300 bytes | no disponible | no disponible | Publicación PMLR |
| FastGRNN | Modelo de wake-word | 1 KB | no disponible | no disponible | Publicación NeurIPS |
| fastText.zip | Clasificador de texto | 16 KiB | no disponible | no disponible | arXiv 1612.03651 |

La comparación es de orden de magnitud y carga de trabajo distinta; la model card advierte que los ejemplos publicados tienen diferentes cargas y fronteras de almacenamiento, mientras que el gráfico nativo compara la misma política sobre el mismo hardware.

## Limitaciones y advertencias

- No es un modelo generativo: solo devuelve tres campos estructurados; no produce texto libre, código, matemáticas ni visión.
- Dependencia del host: el conteo de tokens y la extracción de evidencia se realizan fuera del modelo, por lo que la calidad de la decisión depende del preprocesamiento.
- Idioma: soporte declarado únicamente para inglés.
- Contexto acotado: una adición que supere los 131.072 tokens se rechaza y se preserva el estado previo del documento, lo que exige gestionar fragmentos en el host.
- Licencia mixta: MIT y Apache 2.0 con campo `license: other`; conviene revisar el archivo LICENSE antes de uso comercial.
- Hardware específico: la compilación nativa requiere OpenVINO 2020.3.2, Python 3.7 y el stick físico; el toolchain es antiguo y puede ser difícil de reproducir.
- Riesgo de alucinación: no evaluado en la información disponible; al ser una política de reglas, el riesgo principal es una clasificación incorrecta por evidencia ambigua, mitigable con la abstención.
- Sesgos: no documentados en la información disponible.
- Datos de entrenamiento, benchmarks estándar y throughput: no disponibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tablinum/MagicEightBall
- Variante ONNX: https://huggingface.co/tablinum/MagicEightBall-ONNX
- Variante FP32: https://huggingface.co/tablinum/MagicEightBall-FP32
- Variante GGUF: https://huggingface.co/tablinum/MagicEightBall-GGUF
- Guía de configuración MyriadForge: https://github.com/chadstthomas-svg/myriadforge/blob/main/docs/NCS1_ROADMAP.md
- Bonsai (PMLR): https://proceedings.mlr.press/v70/kumar17a/kumar17a.pdf
- FastGRNN (NeurIPS): https://proceedings.neurips.cc/paper_files/paper/2018/file/ab013ca67cf2d50796b0c11d1b8bc95d-Paper.pdf
- fastText.zip (arXiv 1612.03651): https://arxiv.org/pdf/1612.03651#page=7
- Inspiración de movimiento (Space de Hugging Face): https://huggingface.co/spaces/huggingface/moe-blogpost
