# wallawalla47/Huihui-Qwen3.8-Flash-Next-abliterated-FP4-Local-Infernix

## Resumen

Huihui-Qwen3.8-Flash-Next-abliterated-FP4-Local-Infernix es un empaquetado de inferencia del checkpoint abliterado de Qwen3.8-Flash-Next en formato FP4, preparado por el usuario wallawalla47 para el motor Infernix, un runtime C++/CUDA que permite ejecutar el modelo en una única GPU RTX 5090 de 32 GB. El modelo subyacente es una variante sin censura (abliterated) de Qwen3.8-Flash-Next, publicada originalmente por NVIDIA en formato FP4-Local y posteriormente modificada por edp1096 y huihui-ai para eliminar el comportamiento de rechazo.

Se trata de un modelo de arquitectura MoE (mezcla de expertos) con 48 capas, 512 expertos enrutados por capa (top 10) y un total de 24.576 expertos enrutados, además de un drafter MTP (multi-token prediction) y capacidad de visión. El modelo está diseñado para ejecutarse con los expertos en RAM del host anclada, una caché de VRAM para los expertos más activos, y una tabla PLE de n-gramas de 29 GB leída desde NVMe.

La relevancia de este artefacto radica en que demuestra la viabilidad de ejecutar un modelo MoE de gran escala en hardware de consumo (RTX 5090) mediante una combinación de cuantización FP4/MXFP8, gestión híbrida de memoria y decodificación especulativa. La conversión es bit-exacta respecto al checkpoint de edp1096, y solo difiere del checkpoint original de NVIDIA en 96 proyecciones modificadas por la abliteración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) con transformer, 48 capas, 512 expertos enrutados por capa (top 10), drafter MTP, vision tower |
| Parametros totales | no disponible (24.576 expertos enrutados en total; tamaño del repo 77,4 GB) |
| Parametros activos | top 10 de 512 expertos por capa (no se especifica el número exacto de parámetros activos) |
| Longitud de contexto | 1.048.056 tokens (validado en DGX Spark según la model card) |
| Tipos de cuantizacion | NVFP4 (expertos enrutados), MXFP8 (proyecciones), BF16 (algunas proyecciones), FP4-Local, FP8, BF16, IQ4_NL (volúmenes alternativos mencionados) |
| Idiomas soportados | no disponible |
| Licencia | nvidia-open-model-agreement (license: other) |
| Formato de pesos | `.infernix` (formato propietario del motor Infernix, 3 partes: 32 GB + 32 GB + 13,4 GB) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.8-Flash-Next, un transformer MoE con 48 capas y 512 expertos enrutados por capa, de los cuales se activan los 10 principales (top 10). Incluye un drafter MTP (multi-token prediction) para decodificación especulativa y un tower de visión para entrada image-text-to-text. La abliteración fue realizada por huihui-ai (v2) y transferida por edp1096 al checkpoint FP4 de NVIDIA: se modificaron 96 proyecciones (la proyección de salida de atención o GDN y la proyección down del experto compartido en cada una de las 48 capas), moviéndolas por la diferencia entre el GGUF Q8_0 abliterado de Huihui y el GGUF Q8_0 de Unsloth del modelo original, redondeadas a BF16 y recodificadas como MXFP8.

No se realizó un nuevo entrenamiento ni calibración QAD (quantization-aware distillation): las escalas de activación de los expertos enrutados se mantienen las de NVIDIA, calibradas sobre el modelo original, y solo afectan al modo `--expert-a4-activations` (activaciones de 4 bits); por defecto se usan activaciones de 16 bits. El drafter MTP es el de NVIDIA (no modificado por la abliteración) y el drafter DFlash2 fue entrenado sobre el modelo original; los drafts solo afectan a la velocidad, nunca a la salida, ya que el modelo completo verifica cada draft. La conversión es bit-exacta: 19 de los 21 shards del checkpoint fuente son idénticos a los de NVIDIA según el manifiesto y los hashes de Hugging Face.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline image-text-to-text, tag conversational).
- Razonamiento y modo de pensamiento (hereda las capacidades de Qwen3.8-Flash-Next).
- Capacidad multimodal: entrada de imagen y texto (vision tower incluido, byte a byte idéntico al de NVIDIA).
- Soporte de tool calling / function calling (validado en la model card: "tool calls" pasaron la prueba en DGX Spark).
- Salida estructurada en JSON (validado: "structured JSON" pasó la prueba).
- Ejecución de código (validado: "code execution" pasó la prueba).
- Decodificación especulativa mediante drafter MTP y DFlash2 (solo afecta a velocidad).
- Modelo sin censura (abliterated): responde a peticiones que los releases de Qwen y NVIDIA rechazan, sin filtrado de salida.
- Capacidades multilingües: no disponible (no se especifican idiomas).

## Casos de uso

- Inferencia local en hardware de consumo: ejecutar un MoE de gran escala en una única RTX 5090 (32 GB) gracias a la gestión híbrida de memoria (expertos en RAM anclada, caché de VRAM para los calientes, tabla PLE en NVMe). Adecuado para investigadores que quieren probar modelos grandes sin clúster.
- Asistentes conversacionales de contexto largo: con 1.048.056 tokens de contexto validados, permite gestionar conversaciones multi-turno extensas, análisis de documentos largos o bases de código completas en una sola ventana.
- Procesamiento de documentos con imagen y texto: el pipeline image-text-to-text y el vision tower permiten extraer información de capturas, diagramas o documentos escaneados combinados con texto.
- Automatización de agentes con tool calling: el soporte validado de tool calls y salida JSON estructurada permite integrar el modelo en pipelines de agentes que invocan APIs, ejecutan código o consultan bases de datos.
- Generación y ejecución de código en local: la capacidad de code execution validada y el contexto largo permiten usarlo como asistente de programación que analiza repositorios completos sin enviar datos a la nube.
- Investigación en seguridad y alineación: al ser un modelo abliterated sin filtrado, sirve para estudiar comportamientos de rechazo, sesgos y robustez en entornos controlados, comparándolo con el modelo original.
- Prototipado de aplicaciones multimodal en estaciones de trabajo con una sola GPU: el formato FP4-Local y el motor Infernix reducen los requisitos de VRAM frente a BF16, facilitando el despliegue en equipos individuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta pruebas cualitativas en DGX Spark: recuperación a 1.048.056 tokens, ejecución de código, JSON estructurado, tool calls y una prueba de imagen superadas; falló una comprobación (una respuesta correcta que ignoró una instrucción de solo enteros). No se proporcionan cifras de MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- VRAM estimada para inferencia: 32 GB (RTX 5090) según la model card; el modelo usa una caché de VRAM para los expertos calientes y delega el resto a RAM del host y NVMe.
- GPU recomendadas: RTX 5090 (32 GB, arquitectura Blackwell, requisito para NVFP4/MXFP8); el checkpoint fue validado en DGX Spark.
- Cabe en consumer GPU: sí, en RTX 5090 (32 GB). No se indica compatibilidad con GPUs de menor VRAM.
- Memoria del sistema: se requiere RAM del host anclada para los 24.576 expertos enrutados (no se especifica la cantidad exacta).
- Almacenamiento: se requiere un volumen PLE de n-gramas de 29 GB en NVMe (no incluido en el repositorio; se descarga por separado).
- Opciones de despliegue: motor Infernix (C++/CUDA, repositorio github.com/Wallawalla47/Infernix); no se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato `.infernix`.
- Latencia y throughput: no disponibles (no se proporcionan cifras).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware |
|---|---|---|---|---|---|
| Huihui-Qwen3.8-Flash-Next-abliterated-FP4-Local-Infernix (este) | MoE, 48 capas, 512 expertos/capa (top 10) | 1.048.056 tokens | `.infernix` (NVFP4/MXFP8) | nvidia-open-model-agreement | 1x RTX 5090 (32 GB) + RAM host + NVMe |
| Qwen3.8-Flash-Next-NVIDIA-FP4-Local-Infernix | MoE, misma arquitectura | 1.048.056 tokens | `.infernix` | nvidia-open-model-agreement | 1x RTX 5090 (32 GB) |
| Huihui-Qwen3.8-Flash-Next-abliterated-v2-GGUF | MoE, misma arquitectura | no disponible | GGUF (Q8_0 y otras) | no disponible | no disponible |
| Qwen3.8-Flash-Next-FP4-Local (NVIDIA) | MoE, misma arquitectura | no disponible | FP4-Local | nvidia-open-model-agreement | no disponible |

## Limitaciones y advertencias

- Modelo sin censura: la abliteración elimina el comportamiento de rechazo; responde a peticiones que Qwen y NVIDIA declinan y su salida no está filtrada. La responsabilidad de uso recae en el usuario.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual ni benchmarks; la model card advierte que el artefacto es trabajo de hobby y "probablemente no esté completo ni sea del todo preciso".
- Calidad de la abliteración no validada en runtime: edp1096 registra la transferencia como "completada con hallazgos" (`runtime_validated: false`), con una comprobación fallida (respuesta que ignoró una instrucción de solo enteros).
- Escalas de activación no recalibradas: las escalas de los expertos enrutados son las de NVIDIA, calibradas sobre el modelo original; solo afectan al modo de activaciones de 4 bits.
- Dependencia de un motor propietario: el formato `.infernix` solo se ejecuta con el motor Infernix; no hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Dependencia de hardware específico: requiere una RTX 5090 (Blackwell) para NVFP4/MXFP8, RAM del host anclada y un volumen PLE de 29 GB en NVMe que no está incluido en el repositorio.
- Idiomas soportados no especificados: no se documenta la cobertura multilingüe.
- Licencia: nvidia-open-model-agreement; deben revisarse las restricciones de uso comercial de dicha licencia antes de desplegar en producción.
- Procedencia: el autor advierte que el artefacto, la receta de conversión y el motor fueron creados con IA (mayoritariamente Claude Opus 5.5), lo que añade incertidumbre sobre su exactitud.

## Enlaces

- Hugging Face: https://huggingface.co/wallawalla47/Huihui-Qwen3.8-Flash-Next-abliterated-FP4-Local-Infernix
- Modelo base (edp1096): https://huggingface.co/edp1096/Huihui-Qwen3.8-Flash-Next-abliterated-FP4-Local
- Checkpoint NVIDIA original: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-FP4-Local
- Abliterated v2 de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-v2-GGUF
- Motor Infernix: https://github.com/Wallawalla47/Infernix
- Volumen PLE n-gramas (29 GB): https://huggingface.co/Wallawalla47/Qwen3.8-Flash-Next-NVIDIA-FP4-Local-Infernix/blob/main/Qwen3.8-Flash-Next-NVIDIA-FP4-Local-Infernix.ngram
- Repositorio del volumen PLE: https://huggingface.co/Wallawalla47/Qwen3.8-Flash-Next-NVIDIA-FP4-Local-Infernix
- Licencia NVIDIA Open Model Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
