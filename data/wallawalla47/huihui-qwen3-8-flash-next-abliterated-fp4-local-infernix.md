# wallawalla47/Huihui-Qwen3.8-Flash-Next-abliterated-FP4-Local-Infernix

## Resumen

Huihui-Qwen3.8-Flash-Next-abliterated-FP4-Local-Infernix es un artefacto de inferencia publicado por wallawalla47 que empaqueta, para el motor propio Infernix (C++/CUDA), el checkpoint de edp1096 `Huihui-Qwen3.8-Flash-Next-abliterated-FP4-Local`. La cadena de derivación arranca en el modelo de NVIDIA `Qwen3.8-Flash-Next-FP4-Local`, al que se le transfirieron los cambios de la versión abliterated v2 de huihui-ai. El resultado es un modelo multimodal (image-text-to-text) con comportamiento de rechazo eliminado, cuantizado en NVFP4/MXFP8 y pensado para ejecutarse en una única RTX 5090 de 32 GB.

La arquitectura es un transformer MoE de 48 capas con 512 expertos enrutados por capa (top 10), es decir, 24.576 expertos enrutados en total, más un drafter MTP y una torre de visión. El modelo no cabe completo en VRAM: los expertos enrutados residen en RAM del host fijada (pinned), una caché de VRAM mantiene los calientes, la CPU calcula parte de los fallos de cada capa y una tabla PLE de n-gramas de 29 GB se lee desde un NVMe. El repositorio ocupa 77,4 GB repartidos en tres ficheros `.infernix`.

La relevancia de esta ficha es doble: por un lado documenta un caso real de despliegue de un MoE de gran escala en hardware de consumo mediante offloading selectivo; por otro, ilustra los riesgos de la cadena de derivaciones (abliteration, cuantización, transferencia de pesos y empaquetado para un motor propietario) cuando el propio autor declara que el artefacto es trabajo de hobby generado en buena parte con IA y que probablemente no es completo ni exacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con 48 capas, 512 expertos enrutados por capa (top 10), drafter MTP y torre de visión |
| Parametros totales | no disponible |
| Parametros activos | no disponible (top 10 de 512 expertos por capa) |
| Longitud de contexto | validado en recuperación hasta 1.048.056 tokens según la fuente (edp1096); longitud nominal no disponible |
| Tipos de cuantizacion | NVFP4 y MXFP8 en el checkpoint empaquetado; existen volúmenes FP8, BF16 e IQ4_NL del modelo base |
| Idiomas soportados | no disponible |
| Licencia | nvidia-open-model-agreement (etiquetada como `license: other` en Hugging Face) |
| Formato de pesos | `.infernix` (tres partes: 32 GB + 32 GB + 13,4 GB), más un informe `conversion.json`; requiere un volumen `.ngram` externo de 29 GB |

## Arquitectura y entrenamiento

El modelo subyacente es un MoE disperso de 48 capas con 512 expertos enrutados por capa y enrutamiento top 10, complementado por expertos compartidos, proyecciones de atención o GDN, un drafter MTP para decodificación especulativa y una torre de visión que habilita el pipeline image-text-to-text. La variante abliterated de huihui-ai elimina el comportamiento de rechazo del modelo original; edp1096 transfirió ese cambio a solo 96 proyecciones (la proyección de salida de atención o GDN y la down projection del experto compartido de cada una de las 48 capas), decodificándolas, aplicando el delta entre el GGUF Q8_0 abliterated de Huihui y el Q8_0 de Unsloth del modelo original, redondeando a BF16 y recodificando en MXFP8.

El resto del checkpoint (expertos enrutados y sus escalas, demás proyecciones, normas, tabla de n-gramas, drafter MTP, visión, tokenizer y configuración) es byte a byte el de NVIDIA. La conversión para Infernix se declara bit-exacta respecto al checkpoint de edp1096. No se recalibraron las escalas de activación de los expertos enrutados (solo afectan con `--expert-a4-activations`), el drafter MTP es el de NVIDIA y el drafter DFlash2 se entrenó sobre el modelo original; los borradores afectan únicamente a la velocidad, ya que el modelo completo verifica cada propuesta. edp1096 califica la transferencia como «completada con hallazgos» (`runtime_validated: false`) y no realizó nuevo entrenamiento QAD ni calibración.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de contexto muy larga (recuperación validada hasta 1.048.056 tokens).
- Razonamiento y ejecución de código: la fuente reporta una prueba de ejecución de código superada.
- Salida estructurada en JSON validada en las pruebas de la fuente.
- Tool calling / function calling, reportado como superado en la validación de edp1096.
- Procesamiento de imagen: pipeline image-text-to-text con torre de visión propia.
- Decodificación especulativa mediante drafter MTP (y DFlash2) con verificación por el modelo completo.
- Comportamiento sin rechazo (uncensored) por efecto de la abliteration: responde a peticiones que las versiones de Qwen y NVIDIA declinan.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue local de un MoE multimodal en una sola RTX 5090: el motor Infernix mantiene los 24.576 expertos enrutados en RAM fijada, cachea los calientes en VRAM y lee la tabla PLE desde NVMe, lo que permite ejecutar un modelo que no cabe en 32 GB de VRAM.
- Asistente conversacional de contexto largo: la recuperación validada hasta 1.048.056 tokens permite resumir o consultar corpus extensos (documentación técnica, expedientes, historiales) en una sola pasada.
- Procesamiento de documentos con imagen: al ser image-text-to-text, puede extraer y razonar sobre capturas, escaneos o diagramas junto al texto asociado.
- Automatización de pipelines con salida JSON: la salida estructurada validada permite integrar el modelo como extractor o clasificador dentro de flujos que consumen JSON tipado.
- Agentes con tool calling: las llamadas a herramientas reportadas como superadas habilitan flujos multi-paso donde el modelo consulta APIs o ejecuta código antes de responder.
- Evaluación de seguridad y red teaming: la variante abliterated sirve para estudiar cómo se comporta un modelo sin rechazo y para calibrar filtros externos antes de desplegar sistemas propios.
- Investigación sobre offloading de MoE: la receta (expertos en RAM, caché en VRAM, cómputo parcial en CPU, tabla en NVMe) es un banco de pruebas para técnicas de inferencia de modelos dispersos en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM: 32 GB en una RTX 5090 según la model card; el modelo no cabe completo y depende de offloading.
- RAM del host: debe alojar en pinned memory los 24.576 expertos enrutados; el volumen exacto no está disponible en la información proporcionada.
- Almacenamiento: NVMe necesario para el volumen `.ngram` de 29 GB, que se pasa con `--ngram-volume`; el repositorio ocupa 77,4 GB adicionales.
- GPU recomendadas: RTX 5090 (Blackwell, 32 GB) es el objetivo declarado; otras GPU no se mencionan en la información disponible.
- Despliegue: motor Infernix (C++/CUDA) mediante la librería `infernix`; vLLM, llama.cpp, Ollama o TGI no se documentan para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Este artefacto (wallawalla47) | MoE 48 capas, 512 expertos/capa, top 10 | validado hasta 1.048.056 tokens | NVFP4/MXFP8 en `.infernix` | nvidia-open-model-agreement | Requiere Infernix, RTX 5090 y volumen `.ngram` de 29 GB |
| edp1096/Huihui-Qwen3.8-Flash-Next-abliterated-FP4-Local | mismo modelo base | mismo | FP4-Local | no disponible | Checkpoint origen de esta conversión; `runtime_validated: false` |
| nvidia/Qwen3.8-Flash-Next-FP4-Local | mismo modelo base | mismo | FP4-Local | nvidia-open-model-agreement | Modelo original de NVIDIA, sin abliteration |
| Wallawalla47/Qwen3.8-Flash-Next-NVIDIA-FP4-Local-Infernix | mismo modelo base | mismo | NVFP4 | no disponible | Variante no abliterated para Infernix; comparte tabla n-gramas byte a byte |

## Limitaciones y advertencias

- Modelo sin filtrado: la abliteration elimina el rechazo y la salida no está moderada; la responsabilidad de uso recae en el operador.
- El propio autor advierte que el artefacto, la receta de conversión y el motor se hicieron en buena parte con IA, que es trabajo de hobby y que probablemente no es completo ni exacto.
- La fuente califica la transferencia como «completada con hallazgos» con `runtime_validated: false`; una prueba falló (una respuesta correcta que ignoró una instrucción de solo enteros).
- Las escalas de activación de los expertos enrutados no se recalibraron y solo afectan al modo `--expert-a4-activations`.
- Dependencia de un volumen `.ngram` externo de 29 GB no incluido en el repositorio; sin él el artefacto no funciona según lo documentado.
- Dependencia de un motor propietario (Infernix) y de hardware Blackwell con 32 GB de VRAM; no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI.
- Licencia `nvidia-open-model-agreement` con implicaciones para uso comercial no detalladas en la información disponible; conviene revisar el texto del acuerdo antes de producción.
- Idiomas soportados no documentados; no se puede garantizar calidad fuera de los idiomas del modelo original.
- Riesgo de alucinación no cuantificado: no hay benchmarks publicados para este artefacto.
- Sesgos: no documentados en la información proporcionada; la abliteration puede alterar el comportamiento en dominios sensibles de forma no medida.

## Enlaces

- Hugging Face: https://huggingface.co/wallawalla47/Huihui-Qwen3.8-Flash-Next-abliterated-FP4-Local-Infernix
- Modelo base (checkpoint origen): https://huggingface.co/edp1096/Huihui-Qwen3.8-Flash-Next-abliterated-FP4-Local
- Modelo original de NVIDIA: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-FP4-Local
- Abliterated v2 de huihui-ai (GGUF): https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-v2-GGUF
- Variante no abliterated para Infernix y volumen `.ngram`: https://huggingface.co/Wallawalla47/Qwen3.8-Flash-Next-NVIDIA-FP4-Local-Infernix
- Volumen n-gramas (fichero directo): https://huggingface.co/Wallawalla47/Qwen3.8-Flash-Next-NVIDIA-FP4-Local-Infernix/blob/main/Qwen3.8-Flash-Next-NVIDIA-FP4-Local-Infernix.ngram
- Motor Infernix: https://github.com/Wallawalla47/Infernix
- Licencia NVIDIA Open Model Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
- Papers, blogs y demos adicionales: no disponibles en la información proporcionada.
