# thoddnn/Ternary-Bonsai-2.5-27B-mlx-2bit

## Resumen

Ternary Bonsai 2.5 27B es un empaquetado de cuantizacion extrema (2 bits, esquema ternario con grupos de 128) del modelo multimodal Qwen3.8-27B, adaptado para ejecutarse en Apple Silicon mediante la libreria MLX. Lo publica el usuario thoddnn bajo el paraguas del proyecto prism-ml, y combina pesos de lenguaje comprimidos a 2 bits con una torre de vision en FP16, de modo que el modelo conserva entrada de texto e imagen. Con 27.359.638.768 parametros totales y un repositorio de 8,9 GB, el objetivo es claro: hacer viable en memoria unificada de Mac un modelo de 27B con capacidades de vision, algo imposible en FP16 (que rondaria los 54 GB).

La relevancia tecnica esta en el metodo de compresion: los pesos de lenguaje se almacenan en formato ternario y el cargador incluido aplica transformaciones de Hadamard firmadas (prism_hadamard_qwen35) para reconstruir la representacion antes de la inferencia. Ademas, el paquete incorpora una cabeza MTP (multi-token prediction) opcional de tipo draft, pensada para decodificacion especulativa, aunque el propio autor reconoce que el throughput aun no se ha medido.

Es, por tanto, un artefacto de investigacion y experimentacion mas que un modelo de produccion: cero descargas y cero likes en el momento de la consulta, validacion limitada a pruebas cualitativas (una operacion aritmetica y distincion de imagenes rojas y azules) y sin benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.8-27B): torre de vision FP16 + pesos de lenguaje cuantizados a 2 bits (ternario, grupo 128) |
| Parametros totales | 27.359.638.768 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2 bits ternario con grupos de 128; torre de vision en FP16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria mlx) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.8-27B, un transformer multimodal con torre de vision y proyector hacia el espacio de embeddings del lenguaje. Sobre esa base, el empaquetado aplica una cuantizacion ternaria a 2 bits con tamano de grupo 128 a los pesos del lenguaje, manteniendo la torre de vision en FP16. El cargador incluido en el paquete (`runtime/`) aplica las transformaciones de Hadamard firmadas que exigen los pesos cuantizados, un paso imprescindible para que la inferencia sea correcta: no es un checkpoint que pueda cargarse con un loader MLX generico sin ese runtime.

No hay informacion sobre el proceso de entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF o DPO). Respecto al empaquetado, el autor declara que los pesos de lenguaje coinciden byte a byte con el pack MLX validado de Bonsai 2.5 solo-texto, una vez descontado el espacio de nombres de los tensores multimodales. Se incluye ademas una cabeza MTP v2 opcional que comparte embedding y proyeccion de salida con el modelo objetivo, y cuyo manifiesto (`mtp/head-manifest.json`) registra la revision del GGUF de origen y el SHA-256 del sidecar como registro de verificacion.

## Capacidades

- Generacion de texto conversacional con plantilla de chat aplicada mediante `apply_chat_template`.
- Entrada de imagen (pipeline image-text-to-text): descripcion de imagenes y respuesta a preguntas sobre su contenido.
- Razonamiento aritmetico basico, verificado por el autor con una prueba de suma.
- Modo thinking opcional en la plantilla de chat (`enable_thinking`), desactivado en los ejemplos del autor.
- Decodificacion especulativa mediante cabeza MTP opcional con `draft_block_size=2` y un token draft por ronda.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Prototipado de asistentes multimodales en Mac: cargar el pack con `mlx_vlm` y el runtime incluido permite probar un modelo de 27B con vision en memoria unificada de Apple Silicon sin GPU dedicada, algo inviable con el checkpoint en FP16.
- Descripcion automatica de imagenes en local: el ejemplo del autor (`"Describe this image."`) sirve como base para pipelines de alt-text o catalogacion de imagenes que deban ejecutarse sin conexion y sin enviar datos a la nube.
- Investigacion sobre cuantizacion ternaria: el paquete es un banco de pruebas para estudiar el impacto de 2 bits con grupos de 128 y transformadas de Hadamard en la calidad de un modelo de 27B, comparando contra el pack solo-texto de referencia.
- Evaluacion de decodificacion especulativa con MTP: la cabeza draft incluida permite medir si la prediccion multi-token preserva la salida greedy (el autor confirma que la preservo en dos prompts) y experimentar con distintos tamanos de bloque.
- Educacion y demos offline: un modelo multimodal de 27B ejecutable en un portatil Apple Silicon facilita talleres y demostraciones sin infraestructura de servidor.
- Base para fine-tuning o destilado experimental: al estar bajo Apache 2.0 y en safetensors, puede servir como punto de partida para experimentos de recuperacion de calidad tras cuantizacion extrema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta validaciones cualitativas: coincidencia byte a byte con el pack MLX de referencia, superacion de una prueba aritmetica de texto y distincion correcta de imagenes rojas y azules en Apple Silicon. Sobre la cabeza MTP, se indica que preservo los tokens de salida greedy en un prompt de texto y en uno con imagen roja, pero que el throughput aun no se ha medido.

## Requisitos de hardware

- VRAM / memoria unificada: el repositorio ocupa 8,9 GB, por lo que se necesita al menos esa cantidad de memoria libre mas el overhead del runtime y del contexto KV. No se especifica el consumo exacto en ejecucion.
- Plataforma: exclusivamente Apple Silicon (tag `apple-silicon`, libreria `mlx`); no esta pensado para GPU NVIDIA ni ROCm.
- GPU dedicadas (A100, H100, RTX 4090): no aplicable; para ese entorno existe el companero GGUF del proyecto.
- Cabe en consumer: si, en Macs con memoria unificada suficiente (orientativamente 16 GB o mas, aunque el dato exacto no esta publicado).
- Despliegue: `mlx_vlm` con el runtime incluido en el paquete (`runtime/requirements.txt`); no se mencionan vLLM, TGI, llama.cpp ni Ollama para este artefacto concreto.
- Latencia y throughput: no disponibles; el autor afirma explicitamente que el throughput con MTP aun no se ha medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| Ternary Bonsai 2.5 27B (este) | 27,36 B | no disponible | 2 bits ternario, grupo 128, vision FP16 | Apache 2.0 | Apple Silicon (MLX) |
| Qwen3.8-27B (base) | 27 B (aprox.) | no disponible | FP16/BF16 original | no disponible en la informacion | Multiples |
| Ternary-Bonsai-2.5-27B-GGUF (companero) | 27 B (aprox.) | no disponible | ternario 2 bits en GGUF | no disponible en la informacion | llama.cpp y otros |
| Pack MLX de Bonsai 2.5 solo-texto | 27 B (aprox.) | no disponible | 2 bits ternario | no disponible en la informacion | Apple Silicon (MLX) |

No se dispone de datos de rendimiento comparativo entre estas variantes; la unica comparacion documentada es la equivalencia byte a byte de los pesos de lenguaje con el pack solo-texto.

## Limitaciones y advertencias

- Cuantizacion a 2 bits: la perdida de calidad frente al modelo base es esperable y no se ha cuantificado con benchmarks; las validaciones del autor son cualitativas y muy limitadas.
- Dependencia de runtime propio: requiere el cargador incluido para aplicar las transformadas de Hadamard; un loader MLX estandar no bastara.
- Exclusivo de Apple Silicon: no es desplegable en GPU NVIDIA, AMD ni en CPU convencional con este formato.
- Throughput con MTP sin medir: no hay datos de latencia ni de ganancia real de la decodificacion especulativa.
- Idiomas no declarados: se desconoce la cobertura linguistica, incluido el castellano.
- Sin soporte documentado de tool calling ni de flujos de agente.
- Riesgo de alucinacion: inherente a los modelos generativos y probablemente agravado por la compresion extrema; no hay evaluaciones de fidelidad.
- Sesgos: no documentados por el autor.
- Madurez: cero descargas y cero likes en el momento de la consulta; artefacto recien publicado, sin validacion de la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero deben respetarse las atribuciones de `NOTICE.txt` y la licencia del runtime (`runtime/LICENSE`).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thoddnn/Ternary-Bonsai-2.5-27B-mlx-2bit
- Companero GGUF: https://huggingface.co/prism-ml/Ternary-Bonsai-2.5-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de referencia citado en el comando de descarga: https://huggingface.co/prism-ml/Ternary-Bonsai-2.5-27B-mlx-2bit
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
