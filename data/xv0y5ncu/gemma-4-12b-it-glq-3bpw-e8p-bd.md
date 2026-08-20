# xv0y5ncu/gemma-4-12B-it-GLQ-3bpw-e8p-bd

## Resumen

`xv0y5ncu/gemma-4-12B-it-GLQ-3bpw-e8p-bd` es una cuantizacion de 3 bits por peso (3.0 bpw) del modelo multimodal `google/gemma-4-12B-it` de Google DeepMind, realizada por el usuario xv0y5ncu mediante el metodo GLQ (Lattice Quantization). El objetivo es reducir el peso en disco de unos 24 GB (bf16) a aproximadamente 6.2 GB, manteniendo los pesos comprimidos en memoria y dequantizandolos sobre la marcha con kernels CUDA fusionados que aprovechan los tensor cores de NVIDIA.

El modelo base es Gemma 4 12B Unified, una familia de modelos abiertos con comprension nativa de texto, imagen, audio y video, con una ventana de contexto de 256K tokens. Esta cuantizacion aplica el codebook E8P (una celosia de dimension 8 con residuo vectorial) junto con una transformada de Hadamard aleatorizada (RHT) en variante block-diagonal y cuantizacion LDLQ con realimentacion de error hessiana. El resultado es un checkpoint que mantiene las capacidades del modelo original en un formato mucho mas ligero, pensado para despliegue en entornos con recursos limitados. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 12B Unified, encoder-free multimodal (texto, imagen, audio, video); cuantizacion GLQ sobre el decoder de texto |
| Parametros totales | 12B (modelo base); checkpoint cuantizado reporta 1.574.815.792 en safetensors |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 256K tokens (modelo base) |
| Tipos de cuantizacion | GLQ 3 bpw, codebook E8P block-diagonal, RHT + LDLQ |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos comprimidos, dequantizacion en vuelo) |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-12B-it` es un modelo encoder-free que procesa texto, imagen, audio y video de forma nativa, sin encoders separados. La cuantizacion GLQ comprime los pesos del decoder de texto en grupos de 8 elementos. Aplica una transformada de Hadamard aleatoria (un flip de signo fijo y una rotacion de Hadamard en cada lado) para hacer los pesos y la Hessian del dataset de calibracion incoherentes, de modo que una celosia 8-dimensional pueda cuantizarlos bien. Despues, LDLQ redondea cada grupo con retroalimentacion de error hessiana a traves de las dimensiones de entrada restantes.

El codebook E8P es una celosia D8 con padding estilo QuIP# y una etapa residual de vector quantizacion a 3 bpw, que decodifica en tensor cores de NVIDIA. La variante block-diagonal aplica la RHT por sub-bloques de potencia de dos, evitando el relleno a la siguiente potencia de dos en toda la dimension. La calibracion se realizo con 128 muestras de 2048 tokens de WikiText-2, logrando una SQNR media de 14.26 dB. No se dispone de detalles sobre el entrenamiento original del modelo base (datos, tokens, metodologia RLHF/DPO) en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento multimodal: el modelo base acepta entradas de texto, imagen, audio y video, y genera texto como salida. La cuantizacion conserva estas capacidades, aunque la card recomienda servir en modo texto para simplificar el despliegue.
- Modo de pensamiento (thinking mode): gemma-4 es un modelo de razonamiento que debe evaluarse con `enable_thinking=True` en el chat template. Este modo es critico para obtener resultados reales en tareas complejas.
- Tool calling y function calling: no se menciona explícitamente en la informacion disponible, pero el modelo base Gemma 4 soporta estas capacidades. No se puede confirmar que la cuantizacion las preserve sin degradacion.
- Capacidades multilingues: no se proporcionan datos especificos de idiomas soportados.
- Capacidades especiales: comprension de imagen, audio y video (segun la ficha del modelo base), aunque la cuantizacion GLQ solo afecta al decoder de texto; los towers de vision y audio se mantienen en su formato nativo.

## Casos de uso

- **Atencion al cliente automatizada**: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de 256K tokens. La cuantizacion de 3 bpw permite desplegarlo en una sola GPU de gama media, reduciendo el coste por conversacion en entornos de produccion.
- **Analisis de documentos con imagenes**: al mantener el decoder multimodal, puede procesar documentos escaneados o capturas de pantalla y generar resumenes o extraer informacion estructurada. El despliegue local con vLLM evita la latencia de APIs externas.
- **Generacion de codigo asistida**: aunque no se menciona tool calling, el modelo base es capaz de generar y razonar sobre codigo. Con el modo thinking habilitado, puede resolver problemas de programacion complejos con explicaciones detalladas, util en entornos de desarrollo integrado.
- **Asistentes de razonamiento en educacion**: gracias al modo thinking, puede descomponer problemas de matematicas o logica en pasos intermedios, funcionando como tutor virtual en aplicaciones educativas.
- **Procesamiento de video con transcripcion**: al aceptar entrada de video, puede generar subtitulos o resumenes de contenido audiovisual. La cuantizacion reduce la memoria necesaria para procesar secuencias largas.
- **Prototipado rapido de aplicaciones multimodal**: los desarrolladores pueden integrar el modelo en un entorno local o en una instancia de vLLM para validar ideas de productos antes de escalar a modelos mas grandes, con un coste de hardware minimo (6.2 GB en disco).

## Benchmarks y rendimiento

El autor proporciona un unico resultado de benchmark, obtenido en modo de razonamiento:

| Benchmark | Resultado |
|---|---|
| MMLU-Pro (n=60, 16k budget, pass@1) | 75.0% (45/60) |

Este resultado es una comprobacion de fidelidad con una muestra pequena, no una puntuacion de leaderboard. El intervalo de confianza del 95% es aproximadamente ±10%. En 9 de 60 casos el modelo alcanzo el limite de 16k tokens a mitad del razonamiento, por lo que la puntuacion real podria ser unos puntos mayor con un presupuesto mas amplio. No se han publicado resultados comparativos con otros modelos o con la version bf16 sin cuantizar en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: el checkpoint ocupa 6.2 GB en disco, pero la VRAM necesaria para inferencia depende del contexto y del modo multimodal. Para solo texto con contexto moderado, una GPU con 8-10 GB de VRAM deberia ser suficiente; con contexto largo o entradas de video, se recomienda al menos 16 GB.
- **GPU recomendadas**: NVIDIA RTX 3060 12GB, RTX 4070, RTX 4090, A100, H100. Los kernels de decodificacion requieren tensor cores, por lo que se necesita una GPU NVIDIA con soporte para tensor cores (a partir de Volta).
- **Compatibilidad con GPU consumer**: si, las GPUs de gama media como RTX 3060 12GB o RTX 4070 pueden ejecutarlo en modo texto; para multimodal completo se recomienda al menos 12-16 GB.
- **Opciones de despliegue**: vLLM (recomendado, con `quantization="glq"`), Transformers con la integracion `glq.hf_integration`. No se mencionan otras herramientas como llama.cpp u Ollama.
- **Latencia y throughput**: no se proporcionan datos medidos. La dequantizacion en vuelo con tensor cores deberia ofrecer un throughput razonable, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otras cuantizaciones del mismo modelo (por ejemplo, GGUF, AWQ, GPTQ) ni con otros modelos de tamano similar. El unico punto de referencia es el modelo base en bf16:

| Modelo | Tamano | Contexto | Formato | Licencia | Rendimiento |
|---|---|---|---|---|---|
| google/gemma-4-12B-it (bf16) | ~24 GB | 256K | bf16 | Apache 2.0 | Referencia de calidad |
| xv0y5ncu/gemma-4-12B-it-GLQ-3bpw-e8p-bd | ~6.2 GB | 256K | GLQ 3 bpw | Apache 2.0 | MMLU-Pro 75% (n=60) |
| Otras cuantizaciones de 3-4 bits | no disponible | - | - | - | no disponible |

No se han encontrado datos publicados de benchmarks comparativos entre esta cuantizacion y otras (por ejemplo, GGUF Q4_K_M o AWQ 4-bit) para el mismo modelo base.

## Limitaciones y advertencias

- **Cuantizacion agresiva**: 3 bpw es el extremo agresivo del rango de cuantizacion. Puede producir perdida de calidad en tareas de alta precision, aunque la calibracion con Hessian intenta mitigarla.
- **Riesgo de alucinacion**: como cualquier modelo de lenguaje, puede generar contenido plausible pero incorrecto, especialmente con contextos largos o preguntas ambiguas. El modo de pensamiento reduce este riesgo en tareas de razonamiento, pero no lo elimina.
- **Limite de contexto**: aunque el modelo base soporta 256K tokens, el ejemplo de vLLM de la card usa `max_model_len=4096`; el autor no especifica cual es el limite real con la cuantizacion. En la evaluacion, 9/60 muestras alcanzaron el limite de 16k tokens a mitad de razonamiento.
- **Idiomas**: no se proporcionan datos sobre los idiomas soportados; el modelo base Gemma 4 es multilingue, pero la cuantizacion no garantiza el mismo rendimiento en todos los idiomas.
- **Compatibilidad de software**: requiere `glq>=0.6.6` y `transformers>=5.13.1,<5.15` (5.15.0 rompe la carga). vLLM debe usar la version 0.27.1 o superior. Es un requisito de version estricto que puede causar problemas en entornos con dependencias fijas.
- **Multimodalidad parcial**: la cuantizacion solo afecta al decoder de texto; los towers de vision y audio se mantienen en su formato nativo, lo que implica que la VRAM total para entrada multimodal es mayor que la del decoder cuantizado.
- **Licencia**: Apache 2.0 permite uso comercial sin restricciones, pero se recomienda revisar la licencia original de Gemma 4 (Apache 2.0) para confirmar que no hay clausulas adicionales.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/xv0y5ncu/gemma-4-12B-it-GLQ-3bpw-e8p-bd)
- [Modelo base google/gemma-4-12B-it](https://huggingface.co/google/gemma-4-12B-it)
- [Repositorio GLQ en GitHub](https://github.com/cnygaard/glq)
- [Blog de lanzamiento de Gemma 4](https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/)
- [Documentacion de Gemma 4](https://ai.google.dev/gemma/docs/core)
- [Pagina de Gemma 4 de Google DeepMind](https://deepmind.google/models/gemma/gemma-4/)
- [Entrada de API de Friendli AI](https://friendli.ai/models/xv0y5ncu/gemma-4-12B-it-GLQ-3bpw-e8p-bd)
