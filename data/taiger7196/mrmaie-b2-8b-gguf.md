# taiger7196/mrmaie-b2-8b-gguf

## Resumen

MrMaie B2 8B es un modelo de generación de texto publicado por el usuario taiger7196 bajo el identificador `taiger7196/mrmaie-b2-8b-gguf`. Según su model card, se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con 8.000 millones de parámetros totales y entre 2.000 y 4.000 millones de parámetros activos enrutados, con una ventana de contexto declarada de 1 millón de tokens. El autor lo distribuye exclusivamente en formato GGUF, con hasta doce variantes de cuantización que van desde fp16 (~12 GB) hasta formatos ternarios y de 1,58 bits (~1,2 GB).

La relevancia del modelo radica en su propuesta de footprint ligero combinada con un contexto muy largo, lo que lo haría adecuado para despliegue en hardware modesto. Sin embargo, la información disponible es escasa y presenta inconsistencias notables: el repositorio declara 184,3 GB de tamaño, mientras que los ficheros GGUF listados suman aproximadamente 43 GB, y el dato real de parámetros en safetensors (2.290.642.944) no coincide con los 8B anunciados. El propio autor advierte que la publicación está "en pruebas" y "puede contener errores".

No se dispone de información sobre el proceso de entrenamiento, los datos utilizados, los idiomas soportados ni resultados de benchmarks. La ficha siguiente refleja únicamente lo declarado por el autor y marca explícitamente como no disponible todo aquello que no se ha podido verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), según model card; detalles no disponibles |
| Parametros totales | 8B declarados por el autor; 2.290.642.944 según safetensors (dato inconsistente) |
| Parametros activos | 2B–4B activos enrutados (declarado) |
| Longitud de contexto | 1M tokens (declarado) |
| Tipos de cuantizacion | fp16, q8_0, q6_k, q5_k_m, q4_k_m, q3_k_m, q2, q2_xs, q2_xxs, 1_58bit, tq2_0, tq1_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (exclusivamente; no se publican safetensors) |

## Arquitectura y entrenamiento

El autor describe el modelo como un transformer con mezcla de expertos (MoE) de 8B parámetros totales y entre 2B y 4B activos por token. No se especifica el número de expertos, la estrategia de enrutamiento, el número de capas, la dimensión oculta ni el mecanismo de atención empleado para sostener la ventana de 1M tokens. Tampoco se documenta si se trata de atención lineal, sliding window, RoPE escalado u otra técnica.

No hay información sobre el corpus de entrenamiento: ni número de tokens, ni composición del dataset, ni si se aplicaron fases de instrucción, RLHF o DPO. Tampoco se detalla ningún proceso de destilación, decodificación especulativa o innovación técnica concreta. La model card únicamente indica que la release está en fase de pruebas.

## Capacidades

- Generación de texto autoregresiva, según el pipeline declarado (`text-generation`).
- Razonamiento y conversación multi-turno: presumiblemente soportados por el contexto declarado de 1M tokens, aunque no hay documentación que lo confirme.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Modo thinking, visión o audio: no disponible.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere integración con infraestructura de inferencia estándar, sin más detalle.

## Casos de uso

- Procesamiento de documentos largos: la ventana declarada de 1M tokens permitiría ingerir libros completos, expedientes o bases de código extensas en una sola pasada, siempre que el rendimiento se mantenga en contextos tan largos (no verificado).
- Despliegue en hardware de consumo: las variantes q4_k_m (~3 GB) y q3_k_m (~2,3 GB) caben en GPUs de gama media con 4–8 GB de VRAM, lo que facilita prototipado local con llama.cpp u Ollama.
- Experimentación e investigación: al ser Apache 2.0 y publicarse en múltiples cuantizaciones, sirve para probar técnicas de cuantización extrema (1,58 bits, tq1_0) en un modelo MoE.
- Generación de texto en entornos con recursos limitados: los formatos q2_xxs (~1,5 GB) y 1_58bit (~1,2 GB) permiten ejecución en CPU o GPUs integradas para tareas de baja latencia crítica.
- Chatbots de dominio acotado: con fine-tuning adicional, podría adaptarse a asistentes especializados, aunque la falta de documentación sobre datos de entrenamiento exige validación previa.
- Pruebas de integración en pipelines GGUF: útil para validar compatibilidad con llama.cpp, servidores compatibles con la API de OpenAI y herramientas de despliegue antes de adoptar un modelo en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaños de fichero declarados):
  - fp16: ~12 GB de VRAM.
  - q8_0: ~6 GB.
  - q4_k_m: ~3 GB.
  - q2_xxs: ~1,5 GB.
  - 1_58bit: ~1,2 GB.
- GPU recomendadas: no disponible. Por tamaño, fp16 encajaría en RTX 4090 (24 GB), A100 (40/80 GB) o H100; las cuantizaciones q4 y menores caben en GPUs de consumo como RTX 3060 (12 GB) o RTX 4060 (8 GB).
- Cabe en GPU de consumo: sí, al menos en las cuantizaciones q4_k_m y menores.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, servidores compatibles con la API de OpenAI (por el tag `endpoints_compatible`). vLLM y TGI no se mencionan y su soporte para este GGUF concreto no está confirmado.
- Latencia y throughput: no disponible. El contexto de 1M tokens, si es real, implicaría un coste de atención considerable y requisitos de memoria KV elevados no documentados.

## Comparativa con modelos similares

No se dispone de datos verificables de rendimiento para comparar con alternativas. A continuación se comparan únicamente parámetros declarados frente a modelos MoE de tamaño similar ampliamente conocidos, sin afirmar equivalencia de calidad:

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| MrMaie B2 8B | 8B (declarado) | 2B–4B | 1M (declarado) | Apache 2.0 | GGUF |
| Mixtral 8x7B | 46,7B | ~12,9B | 32K | Apache 2.0 | safetensors, GGUF |
| Qwen1.5-MoE-A2.7B | 14,3B | 2,7B | 32K | Apache 2.0 | safetensors, GGUF |
| DeepSeek-V2-Lite | 15,7B | 2,4B | 32K | Model license | safetensors |

Los datos de los modelos comparativos corresponden a sus especificaciones públicas habituales; no se han contrastado con benchmarks frente a MrMaie B2 porque este no publica resultados.

## Limitaciones y advertencias

- Inconsistencia de parámetros: el autor declara 8B, pero el dato de safetensors indica 2.290.642.944 parámetros; es imprescindible verificar el modelo antes de confiar en las cifras.
- Inconsistencia de tamaño: el repositorio ocupa 184,3 GB, muy por encima de la suma de los GGUF listados (~43 GB); puede haber ficheros adicionales no documentados.
- Estado "en pruebas": el propio autor advierte de posibles bugs; no se recomienda su uso en producción sin una evaluación exhaustiva.
- Sin información de entrenamiento: se desconoce el corpus, los idiomas y si hubo alineación (RLHF/DPO), lo que impide estimar sesgos o calidad.
- Riesgo de alucinación: no evaluado; la ausencia de benchmarks impide cuantificarlo.
- Contexto de 1M no verificado: no hay documentación técnica sobre cómo se logra ni sobre la degradación esperada en contextos largos.
- Idiomas no declarados: no se puede garantizar un rendimiento aceptable en castellano.
- Licencia Apache 2.0: permite uso comercial, pero al no haber documentación sobre procedencia de datos, el usuario asume el riesgo de posibles reclamaciones sobre el corpus de entrenamiento.
- Cuantizaciones extremas (1,58 bits, tq1_0, q2_xxs): degradan previsiblemente la calidad; úsense solo cuando el espacio sea el factor limitante.

## Enlaces

- Hugging Face: https://huggingface.co/taiger7196/mrmaie-b2-8b-gguf
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
