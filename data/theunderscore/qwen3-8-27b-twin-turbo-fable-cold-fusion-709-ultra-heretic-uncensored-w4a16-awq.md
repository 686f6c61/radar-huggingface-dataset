# TheUnderscore/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-W4A16-AWQ

## Resumen

Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-W4A16-AWQ es una cuantización de 4 bits del modelo DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored, publicada por el usuario TheUnderscore. No se trata por tanto de un modelo entrenado desde cero, sino de una versión comprimida de un ajuste fino comunitario de la familia Qwen3.5, con 27.781.427.952 parámetros declarados en los pesos safetensors del repositorio.

El interés técnico del repositorio está en el método de cuantización: esquema W4A16 asimétrico por grupos (group size 128) aplicado con AWQ sobre la arquitectura de atención híbrida del modelo, usando llmcompressor y conservando en BF16 las partes sensibles (embeddings, lm_head, normas, proyecciones de atención lineal, torre visual y cabezas MTP). El resultado se empaqueta en formato compressed-tensors, que LMDeploy turbomind detecta y carga de forma nativa.

El modelo base incorpora dos rasgos que condicionan su uso: por un lado, la variante TWIN-TURBO con cinco modos de razonamiento (thinking) y cinco modos de instrucción intercambiables en caliente, orientada a reducir el volumen de tokens de pensamiento; por otro, la variante ULTRA HERETIC, que declara explícitamente una eliminación reforzada de la alineación de seguridad. Es, por tanto, un modelo multimodal imagen-texto sin censura, pensado para despliegue local y para experimentación, no para producción sujeta a requisitos de moderación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de la familia Qwen3.5 con atención híbrida: capas de atención completa y capas de atención lineal (`linear_attn`), torre visual (`model.visual.*`) y cabezas de predicción multi-token (MTP). No se indica si emplea mezcla de expertos: no disponible |
| Parámetros totales | 27.781.427.952 (≈27,8 B), según los pesos safetensors del repositorio |
| Parámetros activos | no disponible (no se confirma que la arquitectura sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | W4A16: int4 asimétrico por grupos (group size 128) sobre todos los pesos `Linear`; formato compressed-tensors pack-quantized (`weight_packed`, `weight_scale`, `weight_zero_point`, `weight_shape`). Permanecen en BF16: embeddings, `lm_head`, normas, `linear_attn.in_proj_a/b`, torre visual y cabezas MTP |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (declarada en el repositorio de la cuantización) |
| Formato de pesos | safetensors, formato compressed-tensors para los tensores cuantizados, más `model-nonquant.safetensors` con los tensores en BF16 |
| Autor de la cuantización | TheUnderscore |
| Modelo base | DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored |
| Pipeline | image-text-to-text (multimodal) |
| Tamaño del repositorio | 19,6 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-09-18 / 2026-09-18 |

## Arquitectura y entrenamiento

La model card no documenta el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO), por lo que esos datos no están disponibles. Lo que sí se detalla es el proceso de cuantización, que respeta la estructura de atención híbrida del modelo: el suavizado de activaciones AWQ se aplica con mapeos específicos por capa (`build_hybrid_attention_mappings`) en lugar de con expresiones regulares agrupadas, porque en arquitecturas de atención híbrida de la familia Qwen3.5 un mapeo incorrecto corrompe la decodificación. Los mapeos empleados son `input_layernorm` → `self_attn.q/k/v` y `post_attention_layernorm` → `mlp.gate/up` en las capas de atención completa, y `mlp.up_proj` → `mlp.down_proj`, con `duo_scaling="both"` y descarga a CPU.

La cuantización se ejecutó con llmcompressor en modo one-shot offline sobre una única GPU, con offloading a CPU de los pesos completos para que el modelo en precisión completa cupiera en un equipo de 16 GB de VRAM. La ejecución duró 471,0 minutos con un pico de 6,08 GB de memoria, y produjo 400 módulos cuantizados distribuidos en 7 shards de datos más un shard sin cuantizar. La innovación relevante del modelo base, según su propia descripción, es la variante TWIN-TURBO: versiones cuantizadas más pequeñas con mejor rendimiento y un número muy reducido de tokens de pensamiento, con cinco modos thinking y cinco modos instruct conmutables en caliente mediante API, de forma directa o desde el propio mensaje del chat.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a diálogo.
- Procesamiento de imagen junto con texto (pipeline `image-text-to-text`), con torre visual propia que se mantiene en BF16 tras la cuantización.
- Cinco modos de razonamiento (thinking) y cinco modos de instrucción, intercambiables en caliente en tiempo de inferencia.
- Reducción del volumen de tokens de pensamiento respecto al modelo base, según la descripción de la variante TWIN-TURBO.
- Escritura creativa y narrativa (la denominación Fable del modelo base apunta a este uso).
- Comportamiento sin censura: la variante ULTRA HERETIC declara un enfoque reforzado en la eliminación de la alineación de seguridad.
- Cabezas MTP (multi-token prediction) presentes en la arquitectura, conservadas en BF16.
- Soporte de tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multilingües: no disponible (no se declara lista de idiomas).
- Capacidades de audio o vídeo: no disponible.

## Casos de uso

- Escritura creativa y narrativa larga: el modelo base está etiquetado como Fable y ajustado para generación literaria; los modos thinking/instruct conmutables permiten pasar de borrador rápido a reescritura con razonamiento sin recargar el modelo.
- Análisis de documentos con imagen: al ser un modelo imagen-texto, permite extraer y describir información de capturas, diagramas o páginas escaneadas dentro de un mismo pipeline, sin depender de un OCR externo más un LLM separado.
- Generación de datos sintéticos multimodales: para crear pares imagen-descripción o conversaciones de entrenamiento a escala, el comportamiento sin filtros de seguridad resulta útil cuando se necesita cubrir dominios que un modelo alineado rechazaría.
- Investigación en alineación y red-teaming: el modelo sirve como sujeto de estudio para medir qué capacidades y qué riesgos aparecen cuando se retira la alineación de seguridad, comparando sus respuestas con las de la versión original.
- Despliegue local en hardware de gama alta para consumo: con 19,6 GB de pesos, el modelo está pensado para ejecutarse en una o dos GPU con LMDeploy turbomind, lo que permite inferencia privada sin enviar datos a servicios externos.
- Roleplay y asistentes de personaje: los cinco modos de instrucción y la ausencia de censura encajan con aplicaciones de personajes conversacionales donde los modelos alineados suelen rechazar el rol.
- Prototipado rápido de producto conversacional: la reducción de tokens de pensamiento de la variante TWIN-TURBO abarata las pruebas iterativas frente a modelos con cadenas de razonamiento largas, siempre que el caso de uso no requiera moderación de contenido.
- Evaluación comparativa de cuantizaciones: el repositorio incluye el script `quantize-awq-hybrid.py`, lo que lo convierte en una referencia práctica para reproducir cuantizaciones AWQ sobre arquitecturas de atención híbrida con offloading a CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de esta cuantización se limita a remitir a las tablas del README del modelo base, que no forma parte de la información proporcionada. No se dispone por tanto de datos de MMLU, HumanEval, GSM8K ni de ninguna otra métrica, ni para la versión cuantizada ni para el modelo original.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 19,6 GB, de los cuales unos 13,9 GB corresponden a los pesos en 4 bits (27,78 B × 0,5 bytes) y el resto a tensores en BF16. Como estimación, la carga de pesos requiere del orden de 16 a 20 GB de memoria, a lo que hay que sumar la caché KV. Es una estimación de cálculo, no un dato publicado.
- GPU recomendadas: la model card solo documenta y prueba el caso de tensor paralelo 2 (`tp=2`) con LMDeploy turbomind, lo que apunta a dos GPU de 24 GB (RTX 3090, RTX 4090, L4, A10G) o a una única GPU de 24 GB con contextos moderados. No se especifican modelos concretos de A100 o H100.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas de 24 GB (RTX 3090, 4090) si se limita la longitud de contexto, dado el tamaño de los pesos cuantizados.
- Opciones de despliegue: LMDeploy turbomind con `model_format="compressed-tensors"` (probado por el autor), vLLM con soporte de compressed-tensors y transformers. No se documenta compatibilidad con llama.cpp, Ollama o TGI; el formato AWQ/compressed-tensors no es directamente convertible a GGUF.
- Proceso de cuantización: se ejecutó en una sola GPU durante 471,0 minutos con un pico de 6,08 GB de memoria gracias al offloading a CPU, con el modelo en precisión completa almacenado en disco.
- Latencia y throughput: no disponible. No se publican métricas de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

Los resultados de la búsqueda web no contienen información relacionada con este modelo, por lo que no hay datos verificables de alternativas comparables. La comparación más directa que puede establecerse, con los datos del propio repositorio, es entre esta cuantización y su modelo base sin cuantizar:

| Modelo | Parámetros | Formato | Tamaño en disco | Licencia | Contexto | Benchmarks |
|---|---|---|---|---|---|---|
| Esta cuantización (TheUnderscore) | 27,78 B | W4A16 AWQ / compressed-tensors, con partes en BF16 | 19,6 GB | Apache 2.0 (declarada) | no disponible | no disponible |
| Modelo base (DavidAU, sin cuantizar) | 27,78 B (mismo recuento de pesos, en BF16) | safetensors BF16 | no disponible (estimación de ≈55,6 GB a 2 bytes por parámetro) | no disponible | no disponible | Remite a tablas en su propio README, no incluidas aquí |
| Otras alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia deliberada de alineación de seguridad: la variante ULTRA HERETIC declara un enfoque reforzado en la eliminación de la censura y del alineamiento de seguridad. Es esperable que el modelo genere contenido dañino, ilegal, sesgado o sexualmente explícito sin rechazo, por lo que requiere filtros externos si se expone a usuarios.
- Riesgo de alucinación: no se publican evaluaciones de fidelidad o de tasa de alucinación; es un modelo de lenguaje y hereda este riesgo sin métricas que lo acoten.
- Procedencia del modelo base no auditable: el modelo original es un ajuste fino de un tercero (DavidAU) y la nomenclatura Qwen3.5 / Qwen3.8 empleada no se corresponde con ninguna versión oficial de Qwen verificable en la información proporcionada. No se documentan datos de entrenamiento, tokens, composición del dataset ni método de alineación.
- Cadena de licencias: la cuantización declara Apache 2.0, pero no se facilita la licencia del modelo base. Antes de un uso comercial conviene verificar la licencia del modelo original y de los pesos Qwen subyacentes.
- Validación comunitaria nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, con fechas de creación y actualización del 18 de septiembre de 2026. No hay evidencia de uso en producción ni informes de terceros.
- Idiomas no declarados: no se especifica qué idiomas soporta el modelo, ni el nivel de competencia en cada uno. No conviene asumir un buen rendimiento en castellano sin probarlo.
- Longitud de contexto desconocida: no se indica la ventana de contexto, lo que impide dimensionar la caché KV y planificar casos de uso con documentos largos.
- Degradación por cuantización: no existen benchmarks de esta versión W4A16 frente al modelo en BF16, por lo que la pérdida de precisión es indeterminada. Las partes sensibles se han mantenido en BF16, pero no hay medición del impacto.
- Dependencia de herramienta: el formato compressed-tensors está pensado para LMDeploy turbomind y vLLM; no es portable directamente a llama.cpp, Ollama o TGI, lo que limita las opciones de despliegue y obliga a usar hardware GPU.
- Configuración de despliegue frágil: la propia model card advierte de que en arquitecturas de atención híbrida un mapeo de suavizado AWQ incorrecto corrompe la decodificación, por lo que reintentar la cuantización con recetas genéricas no es seguro.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/TheUnderscore/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-W4A16-AWQ
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored
- Herramienta de cuantización llmcompressor: https://github.com/vllm-project/llmcompressor
- Búsqueda web: los resultados devueltos no guardan relación con el modelo ni con inteligencia artificial, por lo que no se incluye ningún enlace adicional.
