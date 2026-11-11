# tahamajs/llava-qwen-0.5b-routing-attention-scienceqa

## Resumen

llava-qwen-0.5b-routing-attention-scienceqa es un checkpoint experimental publicado por el desarrollador independiente tahamajs dentro del proyecto NeuralOps, un marco de trabajo centrado en la sustitucion y compresion de operadores de atencion en modelos ya entrenados (lo que el autor denomina "attention surgery"). El modelo parte de llava-hf/llava-interleave-qwen-0.5b-hf, un VLM multimodal de aproximadamente 0,5 mil millones de parametros que combina una torre de vision SigLIP congelada con un decodificador Qwen2 de 24 capas, y sustituye el mecanismo de atencion cuadratica por RoutingAttention, un operador de atencion dispersa basado en agrupamiento por contenido, en 18 de las 24 capas del decodificador.

El checkpoint no es un modelo completo listo para usar, sino un delta quirurgico: solo contiene los pesos modificados de las capas de atencion y las layer norms reentrenadas, con un manifiesto que describe la topologia de la intervencion. Se ha afinado sobre el subconjunto con imagenes del dataset ScienceQA mediante destilacion de conocimiento desde el modelo profesor original, con el objetivo de recuperar calidad tras la sustitucion del operador de atencion.

Su relevancia es fundamentalmente metodologica: demuestra un flujo de trabajo reproducible para inyectar atencion dispersa en un VLM pequeno, con un artefacto de solo 53,12 MB frente a los 1,66 GB del modelo base en FP16 (una reduccion del 96,9 por ciento). Los resultados, sin embargo, son modestos: la precision en ScienceQA se mantiene en el 31,25 por ciento, muy por debajo del 63,75 por ciento del profesor, aunque la perplejidad baja de 13,20 a 3,24 tras la destilacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM tipo LLaVA: torre de vision SigLIP congelada (27 capas) + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas (D=1024, H=16, head_dim=64), con atencion RoutingAttention dispersa en 18/24 capas y 6 capas ancla cuadraticas [3, 7, 11, 15, 19, 23] |
| Parametros totales | no disponible (el modelo base es de aproximadamente 0,5 mil millones; el checkpoint publicado contiene 336 tensores y 53,12 MB en FP16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se publican en FP16 como delta de atencion) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (attention_weights.safetensors, formato attention_only_fp16) + surgical_manifest.json con esquema neuralops.surgery/v2 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de LLaVA-Interleave con Qwen2 como decodificador: una torre de vision SigLIP congelada extrae caracteristicas de la imagen, un proyector MLP de dos capas las alinea con el espacio del lenguaje y un transformer Qwen2 de 24 capas genera la respuesta. La intervencion NeuralOps sustituye la atencion cuadratica estandar por RoutingAttention (familia sparse), un operador que agrupa las consultas por contenido y enruta la atencion hacia clusters, reduciendo el coste computacional. El autor aplica un esquema hibrido_3_1: 18 capas modificadas y 6 capas ancla que conservan atencion cuadratica completa, presumiblemente para preservar la capacidad de modelado global.

El entrenamiento se realizo en dos etapas de destilacion de conocimiento (KD) desde el modelo profesor original, con 285 pasos de optimizacion en total (129 en la etapa 1 y 156 en la etapa 2), durante 120,1 segundos en una unica NVIDIA RTX 3090 de 24 GB, con un pico de VRAM de 14.613 MB. Solo se entrenaron las atenciones modificadas y las layer norms del decodificador; la torre de vision, el proyector, los MLP y los embeddings permanecieron congelados. El dataset de evaluacion y entrenamiento es derek-thomas/ScienceQA, en su subconjunto con imagenes de validacion. No se especifica el numero de tokens de entrenamiento ni la composicion completa del dataset.

## Capacidades

- Generacion de texto condicionada por imagen (pipeline image-text-to-text): responde preguntas sobre el contenido de una figura.
- Razonamiento visual basico sobre material STEM (ciencia, tecnologia, ingenieria y matematicas) del dataset ScienceQA.
- Respuesta en formato de opcion multiple, segun el ejemplo de la model card ("Answer with the option letter").
- Conversacion de un solo turno con plantilla de chat incluida (chat_template.json).
- Procesamiento de imagenes a traves del preprocesador de vision configurado (preprocessor_config.json).
- Capacidades multilingues: limitadas al ingles.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, audio ni video.

## Casos de uso

- Investigacion sobre atencion dispersa: el checkpoint sirve como referencia reproducible para estudiar como afecta la sustitucion de atencion cuadratica por RoutingAttention en un VLM pequeno, con manifiesto de topologia incluido para auditar que capas se modificaron.
- Experimentos de destilacion de conocimiento: permite comparar el comportamiento pre-KD y post-KD (perplejidad 13,20 frente a 3,24) en un entorno de un solo GPU de 24 GB, con telemetria de entrenamiento publicada.
- Prototipado de asistentes educativos STEM: dado su entrenamiento en ScienceQA, puede usarse para generar respuestas de opcion multiple sobre figuras cientificas en pruebas de concepto, siempre que se acepte su precision limitada del 31,25 por ciento.
- Evaluacion de pipelines de compresion: util para medir el ahorro real de almacenamiento (53,12 MB frente a 1,66 GB del base) y su impacto en calidad en flujos de despliegue con restricciones de disco.
- Benchmarking de operadores en NeuralOps: sirve como caso de prueba dentro de la libreria neuralops para validar la carga de modelos con load_surgeried_model y la integracion del registro de operadores sparse.
- Docencia y divulgacion: ejemplo didactico de cirugia de atencion y destilacion en modelos multimodales, con todos los artefactos y metricas disponibles para inspeccion.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre ScienceQA, subconjunto con imagenes STEM, split de validacion:

| Metrica | Profesor (base) | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Precision (%) | 63,75 | 31,25 | 31,25 | +0,00 |
| Perplejidad | 2,45 | 13,20 | 3,24 | -9,96 |

La destilacion recupera la perplejidad pero no mejora la precision respecto al estado pre-KD. El modelo final queda 32,5 puntos porcentuales por debajo del profesor en exactitud.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el entrenamiento consumio 14.613 MB en una RTX 3090, por lo que la inferencia en FP16 del modelo completo cabe holgadamente en 24 GB.
- GPU recomendadas: NVIDIA RTX 3090 (validada por el autor para el entrenamiento); cualquier GPU consumer con 8-16 GB deberia bastar para un modelo de aproximadamente 0,5 mil millones de parametros en FP16, aunque no se documenta oficialmente.
- Cabe en GPU consumer: si, previsiblemente en RTX 3060/4060 y superiores; sin datos de latencia publicados.
- Opciones de despliegue: la model card solo documenta la API de NeuralOps (load_surgeried_model desde neuralops.hub). No se mencionan vLLM, llama.cpp, Ollama ni TGI, y el formato de delta quirurgico probablemente requiere el modelo base y la libreria neuralops para reconstruirse.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (val, con imagen) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-routing-attention-scienceqa | ~0,5 B (delta de 53,12 MB) | no disponible | 31,25 % (declarado, no verificado) | MIT | Hugging Face, requiere neuralops |
| llava-hf/llava-interleave-qwen-0.5b-hf (profesor) | ~0,5 B | no disponible | 63,75 % (referencia del autor) | no disponible en la informacion | Hugging Face |
| Otros VLM pequenos (p. ej. variantes LLaVA de <1 B) | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion con datos concretos es contra el modelo base, que duplica la precision del checkpoint intervenido.

## Limitaciones y advertencias

- Precision baja: 31,25 por ciento en ScienceQA, la mitad que el profesor; no es adecuado para produccion sin mejoras adicionales.
- La destilacion no mejora la exactitud respecto al estado pre-KD, solo la perplejidad; el autor no ofrece explicacion del porque.
- Es un delta quirurgico, no un modelo autonomo: requiere el modelo base llava-hf/llava-interleave-qwen-0.5b-hf y la libreria neuralops para cargarse.
- Solo ingles; sin soporte multilingue documentado.
- Entrenado y evaluado exclusivamente en ScienceQA, lo que limita la generalizacion a otros dominios visuales.
- Riesgo de alucinacion inherente a los VLM de este tamano, agravado por la atencion dispersa y la falta de datos de evaluacion fuera de dominio.
- Metricas no verificadas (verified: false en el model-index); no hay evaluacion independiente.
- Cero descargas y cero likes en el momento de la consulta: sin validacion por parte de la comunidad.
- Licencia MIT, que permite uso comercial, pero el modelo base puede tener condiciones propias que deben revisarse.
- No se documentan sesgos especificos, longitud de contexto ni comportamiento fuera del subconjunto STEM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-routing-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion de RoutingAttention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/sparse/routing_attention.py
- Licencia del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
