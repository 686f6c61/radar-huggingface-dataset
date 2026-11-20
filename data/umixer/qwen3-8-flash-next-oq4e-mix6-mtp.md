# umixer/Qwen3.8-Flash-Next-oQ4e-mix6-mtp

## Resumen

Qwen3.8-Flash-Next-oQ4e-mix6-mtp es una compilación cuantizada en precisión mixta del modelo Qwen3.8-Flash-Next, publicada por el usuario umixer sobre la librería MLX de Apple. No se trata de un modelo entrenado desde cero, sino de un empaquetado de pesos cuantizados que combina tensores procedentes de distintos packs de cuantización nativa (oQ4e y oQ6e) mediante copia de bytes componente a componente, sin recuantizar ningún tensor. El objetivo declarado es alcanzar velocidad y huella de memoria de una build de 4 bits manteniendo una calidad igual o superior a una cuantización uniforme de 5 bits.

El modelo base es un transformer de tipo MoE con 48 capas, 512 expertos con enrutado top-10, 125.000 millones de parámetros totales y 6.000 millones activos, complementado con una tabla de embeddings n-gram PLE de 51.000 millones de parámetros y un drafter MTP de 4.000 millones. La build ocupa 117,5 GiB en 24 shards y reside en torno a 73-75 GB en memoria al cargarse, con un contexto probado de 131k tokens.

Su relevancia es práctica: demuestra una estrategia de cuantización no uniforme guiada por la sensibilidad de cada capa (curva en U: capas iniciales y finales caras, capas intermedias baratas), aplicando 6 bits a los expertos de los extremos y 4 bits al tronco central, y elevando atención, GDN y hyper-connections a 6-8 bits. Es un artefacto orientado a ejecución local en Apple Silicon de 128 GB, no un modelo para despliegue en GPU convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen4_exp: MoE + n-gram PLE + MTP; 48 capas, 512 expertos, top-10 enrutados |
| Parametros totales | 179.999.981.459 (según safetensors); el autor desglosa 125B troncales + 51B n-gram + 4B MTP |
| Parametros activos | 6B (tronco) + 4B (drafter MTP) |
| Longitud de contexto | 131k tokens probados |
| Tipos de cuantizacion | Precisión mixta: 4-bit g64 (tronco central), 6-bit g64 (expertos de capas 0-3 y 44-47), 6-bit g32 (tabla n-gram PLE), 6/8-bit (atención, GDN, hyper-connections, conv), 8-bit g128 (expertos compartidos), 8-bit g64 (embed_tokens y lm_head), 8-bit g64 (GDN out_proj), 6/8-bit (drafter MTP), bf16 (norms, routers, vision tower) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other") |
| Formato de pesos | safetensors (formato MLX), 24 shards, 117,5 GiB |

## Arquitectura y entrenamiento

La arquitectura subyacente es qwen4_exp, una variante MoE con 48 capas, 512 expertos y enrutado top-10, que incorpora además una tabla de embeddings n-gram PLE de 51.000 millones de parámetros y un módulo de decodificación especulativa MTP (multi-token prediction) con profundidad 3. El modelo incluye un vision tower en bf16, lo que sugiere capacidades multimodales en el modelo base, aunque la model card no detalla su funcionamiento.

Esta build concreta no entrena nada: ensambla tensores ya cuantizados mediante copia de bytes, de modo que cada tensor es idéntico a su fuente. El tronco central de 40 capas procede de oQ4e con calibración por matriz de importancia (1024 muestras × 512 tokens) y refit de escala/sesgo por grupo mediante mínimos cuadrados ponderados en lugar de redondeo absmax. El esqueleto de 6 bits procede de oQ6e. La revisión del 30 de octubre de 2026 movió los 36 tensores del trío out_proj de GDN de 6-bit g128 a 8-bit g64, reduciendo el ruido de esa proyección a aproximadamente una cuarta parte. La justificación técnica se apoya en literatura de sensibilidad a cuantización por profundidad (SliderQuant, arXiv:2603.25284), que describe una curva en U: las capas iniciales y finales son más sensibles y las intermedias más tolerantes.

## Capacidades

- Generación de texto y conversación multi-turno, según el pipeline declarado (text-generation, conversational).
- Razonamiento y matemáticas: capacidades heredadas del modelo base Qwen3.8-Flash-Next, aunque no se documentan benchmarks en la información disponible.
- Procesamiento multimodal: el paquete incluye un vision tower en bf16 sin cuantizar, lo que indica soporte de entrada de imágenes en el modelo base.
- Decodificación especulativa nativa mediante drafter MTP de profundidad 3, con tasa de aceptación del 65-75% en tráfico de agentes y edición.
- Contexto largo: 131k tokens probados, adecuado para documentos extensos y conversaciones prolongadas.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling y function calling: no documentado explícitamente en la model card.
- Modo thinking: no documentado en la información disponible.

## Casos de uso

- Asistencia de código en local sobre Apple Silicon: el modelo puede ejecutarse en un Mac con 128 GB de memoria unificada y generar código con contexto de 131k tokens, lo que permite cargar repositorios completos o varios archivos en la ventana sin truncar. La tasa de decodificación de 66-82 tok/s lo hace viable para edición interactiva.
- Edición de documentos largos y resumen: con 131k tokens de contexto y decodificación especulativa MTP que rinde más en contexto largo (+6-8% de tg a 64k frente a un drafter de 4 bits), es adecuado para procesar informes, contratos o transcripciones extensas en una sola pasada.
- Agentes autónomos locales: la tasa de aceptación MTP del 65-75% en tráfico de agentes y edición indica que el drafter está calibrado para ese tipo de flujos, donde se encadenan llamadas a herramientas y ediciones de archivos con contexto creciente.
- Prototipado e investigación en cuantización: el paquete sirve como referencia reproducible de asignación de bits por sensibilidad de capa, con tensores byte-idénticos a sus fuentes, lo que facilita estudiar el efecto de la precisión mixta sin confundirlo con recuantización.
- Análisis de imágenes con texto: el vision tower en bf16 permite tareas de descripción, extracción de información o respuesta a preguntas sobre imágenes, siempre que la herramienta de inferencia exponga esa ruta.
- Despliegue de privacidad estricta: al ejecutarse íntegramente en un host local sin llamadas a API externas, encaja en entornos donde los datos no pueden salir de la máquina, como documentación legal o médica interna.
- Evaluación comparativa de builds cuantizadas: permite medir en el mismo hardware la diferencia de calidad y velocidad entre una build uniforme de 4 bits y esta mezcla, útil para decidir qué empaquetado desplegar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible. La model card solo aporta mediciones de velocidad y memoria en un M5 Max de 128 GB con oMLX 0.7.1.dev1:

| Prueba | oQ4e tg (tok/s) | mix6 tg (tok/s) | oQ4e pp (tok/s) | mix6 pp (tok/s) | Δ pp |
|---|---|---|---|---|---|
| pp1198/tg256 | 88,5 | 98,1 | 1.701,5 | 1.722,9 | +1,3% |
| pp4410/tg256 | 73,6 | 79,1 | 2.622,8 | 2.409,8 | −8,1% |
| pp8155/tg256 | 81,4 | 76,2 | 2.778,3 | 2.498,4 | −10,1% |
| pp15745/tg256 | 79,5 | 72,2 | 2.837,8 | 2.580,6 | −9,1% |
| pp30945/tg256 | 75,5 | 72,8 | 2.788,2 | 2.544,4 | −8,7% |
| pp62032/tg256 | 73,2 | 73,8 | 2.717,3 | 2.492,0 | −8,3% |
| pp122464/tg256 | 58,0 | 70,5 | 2.623,7 | 2.406,1 | −8,3% |
| Media | 75,7 | 77,5 | 2.581,4 | 2.379,2 | −7,8% |

En prefill a 8k el autor reporta 2.840-3.040 tok/s. La memoria residente al cargar es de 75,49 GB frente a 69,53 GB de la build uniforme oQ4e (+5,96 GB) y unos 85 GB de la build oQ5e, es decir, 10-12 GB menos que esta última.

## Requisitos de hardware

- VRAM o memoria unificada: aproximadamente 73-75 GB residentes al cargar; el paquete en disco ocupa 117,5 GiB. No cabe en GPUs de consumo de 24 GB ni en configuraciones de 48 GB.
- Hardware recomendado: Apple Silicon con 128 GB de memoria unificada (el autor mide en un M5 Max). No hay datos de ejecución en A100, H100 ni RTX 4090, y el formato MLX no es compatible con CUDA sin conversión.
- GPU de consumo: no cabe en ninguna GPU de consumo actual por tamaño; requeriría al menos 80 GB de memoria para el paquete completo, y la tabla n-gram PLE se descarga a SSD en algunos hosts.
- Opciones de despliegue: oMLX 0.7.0 o superior (o builds de mlx_vlm que soporten qwen4_exp y entradas de cuantización mixta por tensor). En oMLX ≥ 0.7.3 debe activarse qwen4_gdn_decode_wide_proj = true para que el out_proj de 8 bits entre en la ruta fusionada de decodificación GDN. No es compatible con vLLM, llama.cpp, Ollama ni TGI en su formato actual.
- Latencia y throughput: decodificación de 66-82 tok/s según longitud de contexto y prefill de 2.380-3.040 tok/s en M5 Max de 128 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Memoria residente | Velocidad (tg media) | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-oQ4e-mix6-mtp (esta build) | 180B totales / 6B activos | 131k | 75,49 GB | 77,5 tok/s | qwen-community-1.0 |
| Qwen3.8-Flash-Next uniforme oQ4e | 180B totales / 6B activos | 131k | 69,53 GB | 75,7 tok/s | qwen-community-1.0 |
| Qwen3.8-Flash-Next uniforme oQ5e | 180B totales / 6B activos | 131k | ~85 GB | no disponible | qwen-community-1.0 |

No se dispone de datos de comparación con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- Sesgos: no documentados en la model card; al heredar el modelo base, arrastra los sesgos de sus datos de entrenamiento, que no se detallan.
- Alucinación: no se han publicado evaluaciones de fidelidad factual ni de tasa de alucinación para esta build ni para el modelo base en la información disponible.
- Idiomas: la lista de idiomas soportados no está disponible; no se puede confirmar cobertura multilingüe más allá de lo que ofrezca Qwen3.8-Flash-Next.
- Licencia: qwen-community-1.0, etiquetada como "other". Es imprescindible revisar el archivo LICENSE antes de cualquier uso comercial, ya que las condiciones concretas no se recogen en la model card.
- Compatibilidad: requiere oMLX 0.7.0+ o builds específicos de mlx_vlm; sin el flag qwen4_gdn_decode_wide_proj en oMLX ≥ 0.7.3 se pierde el rendimiento del out_proj de 8 bits. No funciona en ecosistemas CUDA estándar.
- Coste de prefill: la build es un 7,8% más lenta en prefill que la uniforme oQ4e, penalización que se nota en cargas de contexto largo o procesamiento por lotes.
- Memoria: 75,49 GB residentes dejan poco margen en hosts de 96 GB y exigen 128 GB para trabajar con comodidad junto al sistema operativo y el contexto KV.
- Reproducibilidad: el ensamblado por copia de bytes depende de que los packs fuente (oQ4e, oQ6e) sigan disponibles con los mismos identificadores; si se retiran, la build no es reconstruible de forma trivial.
- Madurez: 1.738 descargas y 7 likes en el momento de la consulta; es un artefacto de autor individual, no una publicación oficial del equipo Qwen.

## Enlaces

- Hugging Face: https://huggingface.co/umixer/Qwen3.8-Flash-Next-oQ4e-mix6-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Paper SliderQuant (referenciado en la model card): arXiv:2603.25284
- Paper adicional referenciado en los tags: arXiv:2603.17354
- README en chino tradicional: README_zh.md (dentro del repositorio del modelo)
- Licencia: archivo LICENSE del repositorio del modelo
- Librería de inferencia: oMLX 0.7.0+ (PR4335) y mlx_vlm
