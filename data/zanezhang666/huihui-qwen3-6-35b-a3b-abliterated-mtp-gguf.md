# zanezhang666/Huihui-Qwen3.6-35B-A3B-abliterated-MTP-GGUF

## Resumen

Huihui-Qwen3.6-35B-A3B-abliterated-MTP-GGUF es una versión "abliterated" (sin mecanismos de rechazo) del modelo multimodal Qwen/Qwen3.6-35B-A3B, publicada por el usuario zanezhang666 bajo el paraguas del proyecto huihui-ai. El proceso de abliteración elimina las direcciones de activación asociadas al rechazo de peticiones, de modo que el modelo deja de negarse a responder ante contenidos que el modelo original filtraría. Se distribuye exclusivamente en formato GGUF para su uso con llama.cpp.

El modelo base es un transformer multimodal de tipo image-text-to-text con 35.505.251.456 parámetros totales y arquitectura MoE (la nomenclatura A3B indica aproximadamente 3.000 millones de parámetros activos por token). Incorpora soporte de decodificación especulativa mediante MTP (multi-token prediction), que el autor activa con los flags `--spec-type draft-mtp --spec-draft-n-max 6` en llama.cpp. El contexto declarado en el ejemplo de uso es de 262.144 tokens.

Es relevante para investigadores que necesiten evaluar el comportamiento de modelos sin alineación de seguridad, para estudios de robustez de filtros y para experimentación controlada con modelos multimodales de gran contexto. No es un modelo apto para producción pública: el propio autor lo describe como una implementación "cruda, prueba de concepto" y recomienda su uso únicamente en entornos de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con mezcla de expertos (MoE) y decodificacion especulativa MTP |
| Parametros totales | 35.505.251.456 |
| Parametros activos | Aproximadamente 3.000 millones (designacion A3B del modelo base) |
| Longitud de contexto | 262.144 tokens (segun el ejemplo de uso del autor con `-c 262144`) |
| Tipos de cuantizacion | GGUF; el autor menciona explicitamente Q4_K |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 216,4 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.6-35B-A3B: un transformer con capas de mezcla de expertos en el que solo una fracción de los parámetros (aproximadamente 3.000 millones) se activa por token, lo que reduce el coste computacional de inferencia frente a un modelo denso del mismo tamaño total. Es multimodal (entrada de imagen y texto) y soporta decodificación especulativa mediante cabezas MTP, que generan varios tokens candidatos por paso y se validan en paralelo.

Sobre el entrenamiento original del modelo base no se dispone de información en la documentación proporcionada: no se detallan el volumen de tokens, la composición del dataset ni si hubo fases de RLHF o DPO. La modificación introducida por huihui-ai consiste en abliteración, una técnica que identifica y sustrae la dirección de activación asociada al comportamiento de rechazo, aplicada aquí sin TransformerLens según el repositorio de referencia remove-refusals-with-transformers. El autor califica el procedimiento de prueba de concepto y no documenta el conjunto de prompts utilizado para calcular la dirección de rechazo ni métricas de degradación de capacidades tras la intervención.

## Capacidades

- Generación de texto conversacional multi-turno con ventanas de contexto de hasta 262.144 tokens.
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text), lo que permite describir imágenes, responder preguntas sobre ellas y extraer información de documentos visuales.
- Razonamiento y generación de código heredados del modelo base Qwen3.6, aunque sin garantías de que la abliteración no haya degradado estas capacidades.
- Decodificación especulativa MTP para acelerar la generación en llama.cpp.
- Supresión de rechazos: el modelo no aplica el filtrado de seguridad del original, lo que constituye su rasgo diferencial.
- Soporte de tool calling y comportamiento agéntico: no disponible en la información proporcionada.
- Capacidades multilingües específicas: no disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar qué tipos de contenido genera un LLM multimodal cuando se elimina la dirección de rechazo, comparando sus respuestas con las del Qwen3.6-35B-A3B original en un entorno aislado.
- Evaluación de robustez de filtros: sirve como generador adversario para probar clasificadores de contenido y sistemas de moderación antes de desplegarlos.
- Análisis de documentos e imágenes extensos: con 262.144 tokens de contexto y entrada multimodal, puede procesar lotes de capturas, diagramas o PDFs renderizados y responder preguntas sobre ellos en una sola pasada.
- Experimentación con decodificación especulativa: los flags MTP documentados permiten medir la ganancia de throughput de la generación especulativa frente a la decodificación estándar en llama.cpp con CUDA.
- Pruebas de regresión de pipelines GGUF: útil para validar integraciones de llama.cpp, llama-server y llama-mtmd-cli con modelos MoE multimodales de gran tamaño.
- Estudio de degradación por abliteración: comparar benchmarks de razonamiento y código entre el modelo original y esta variante para cuantificar el coste de eliminar los rechazos.
- Generación creativa sin restricciones en entornos controlados de investigación, siempre con revisión humana de las salidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q4_K sobre 35.505 millones de parámetros, el peso ronda los 20 GB; hay que añadir la caché KV para un contexto de hasta 262.144 tokens, que puede superar con creces el tamaño del modelo si se llena la ventana. Para contexto corto, 24 GB de VRAM son suficientes; para contexto largo se recomienda 48 GB o más.
- GPU recomendadas: A100 80 GB o H100 para contexto completo y serving concurrente; RTX 4090 (24 GB) para Q4_K con contexto moderado y `-ngl 99`.
- Cabe en GPU de consumo: sí, en RTX 4090 y RTX 3090 con cuantizaciones Q4_K o inferiores y contextos reducidos; en GPUs de 16 GB exigiría cuantizaciones más agresivas o descarga parcial a CPU.
- Opciones de despliegue: llama.cpp (llama-cli, llama-mtmd-cli, llama-server) con compilación CUDA (`-DGGML_CUDA=ON`), tal como documenta el autor. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles. El autor no publica cifras; la arquitectura MoE con ~3.000 millones de parámetros activos y la decodificación MTP deberían reducir el coste por token frente a un denso de 35B, pero no hay mediciones que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Huihui-Qwen3.6-35B-A3B-abliterated-MTP-GGUF | 35.505 M totales / ~3.000 M activos | 262.144 | Si | Apache 2.0 | GGUF | Sin filtrado de rechazos; solo llama.cpp |
| Qwen/Qwen3.6-35B-A3B (base) | 35.505 M totales / ~3.000 M activos | no disponible | Si | Apache 2.0 | safetensors | Modelo original con alineación de seguridad |
| Otras variantes abliterated de la familia Qwen | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

La comparación cuantitativa de rendimiento entre esta variante y el modelo base no está disponible: no hay benchmarks publicados por el autor que midan la pérdida de capacidades tras la abliteración.

## Limitaciones y advertencias

- El filtrado de seguridad está significativamente reducido: el modelo puede generar contenido sensible, controvertido o inapropiado, y el autor advierte explicitamente de este riesgo.
- No es apto para audiencias generales, menores ni aplicaciones que requieran alta seguridad.
- El autor lo describe como una prueba de concepto "cruda" y recomienda limitarlo a investigación, pruebas o entornos controlados, evitando su uso directo en producción o en aplicaciones comerciales de cara al público.
- La abliteración puede degradar capacidades del modelo base (razonamiento, código, seguimiento de instrucciones); no se han publicado mediciones que cuantifiquen esa pérdida.
- Riesgo de alucinación: no documentado por el autor, pero aplicable a cualquier LLM de esta familia; la ausencia de filtrado agrava el impacto de las salidas incorrectas.
- Responsabilidad legal y ética enteramente del usuario: el autor declina cualquier responsabilidad sobre las consecuencias del uso.
- Idiomas soportados no documentados; el comportamiento multilingüe no está garantizado.
- Dependencia de la versión más reciente de llama.cpp: la decodificación MTP y el soporte multimodal requieren compilaciones recientes, lo que puede romper integraciones con otras herramientas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-09): no hay evidencia de validación por parte de la comunidad.
- El modelo se distribuye únicamente en GGUF; no hay pesos safetensors en este repositorio para fine-tuning.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zanezhang666/Huihui-Qwen3.6-35B-A3B-abliterated-MTP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Repositorio de la tecnica de abliteracion: https://github.com/Sumandora/remove-refusals-with-transformers
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Releases de llama.cpp: https://github.com/ggml-org/llama.cpp/releases
- Ko-fi del autor: https://ko-fi.com/huihuiai
