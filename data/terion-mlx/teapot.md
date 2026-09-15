# terion-mlx/teapot

## Resumen

Teapot es un modelo de lenguaje deliberadamente diminuto publicado por el usuario terion-mlx en Hugging Face bajo licencia MIT. Con 127.680 parámetros totales y unos 500 KB en disco, es una suerte de homenaje al código de estado HTTP 418 ("I'm a teapot") y, según su propia model card, existe para exhibir infraestructura de serving, no inteligencia de modelo: la gracia es que corre por la misma pila de producción que el resto de modelos de la casa (batching continuo, caché KV, streaming y API de chat compatible con OpenAI).

Arquitectura y tamaño son mínimos: un transformer de estilo Llama, nativo en mlx_lm y sin código de modelo personalizado, con 3 capas, dimensión oculta 64, 4 cabezas de atención y 2 cabezas clave-valor, sobre un vocabulario byte-level de 258 tokens construido desde cero con el propio texto de entrenamiento. El entrenamiento se limita a un único párrafo de adivinanza y a un pequeño conjunto de preguntas derivadas de sus propias líneas.

Su relevancia es por tanto acotada y muy específica: sirve como banco de pruebas reproducible, barato y libre para validar pilas de inferencia, clientes de API y flujos de integración continua que hablan el protocolo de OpenAI. No es un modelo de propósito general y su autor lo advierte explícitamente: carece de conocimiento general y no puede responder a preguntas fuera de su dominio de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer estilo Llama (3 capas, hidden size 64, 4 cabezas de atención, 2 cabezas KV) |
| Parametros totales | 127.680 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados sin cuantizar; mlx_lm permite generar versiones cuantizadas a partir de los pesos originales) |
| Idiomas soportados | no disponible (sin declaración de idiomas; el vocabulario byte-level de 258 tokens se construyó sobre el texto de entrenamiento, en inglés, por lo que no hay soporte multilingüe real) |
| Licencia | MIT |
| Formato de pesos | safetensors (formato nativo de la librería mlx) |
| Libreria de inferencia | mlx / mlx_lm |
| Tamano en disco | aproximadamente 500 KB; el repositorio ocupa 0,0 GB según Hugging Face |
| Tokenizador | byte-level, vocabulario de 258 tokens construido desde cero |
| Fecha de creacion (Hugging Face) | 2026-09-14 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de estilo Llama con la configuración mínima que admite mlx_lm sin código personalizado: 3 capas, dimensión oculta de 64, 4 cabezas de consulta y 2 cabezas clave-valor (atención con GQA, es decir, cada par KV se comparte entre dos cabezas de consulta). El vocabulario es byte-level y consta de 258 tokens, construido desde cero a partir del texto de entrenamiento en lugar de reutilizar un tokenizador preentrenado como BPE o SentencePiece. El total de 127.680 parámetros y un tamaño en disco de aproximadamente 500 KB son coherentes con esa configuración.

En cuanto a los datos, la model card indica que el entrenamiento se realizó sobre un único párrafo de adivinanza (el propio texto del enigma sobre una tetera) más un pequeño conjunto de preguntas derivadas de las líneas de esa misma adivinanza. No se publican cifras de tokens de entrenamiento, composición del dataset, método de ajuste (RLHF, DPO u otros) ni detalles del proceso de optimización. Tampoco se documenta ninguna innovación técnica más allá de la propia demostración: el valor del proyecto está en la pila de serving (batching continuo, caché KV, streaming, API compatible con OpenAI) que envuelve a un modelo intencionadamente trivial.

## Capacidades

- Generación de texto restringida a su dominio: responde a un conjunto fijo y pequeño de preguntas relacionadas con la adivinanza (por ejemplo, "are you stout?" o "will you pour?").
- Recitado del enigma completo cuando se le solicita.
- Ejecución nativa en mlx_lm mediante `load` y `generate`, con plantilla de chat aplicada por el tokenizador (`apply_chat_template`).
- Exposición a través de una API de chat compatible con OpenAI, con streaming y caché KV, según la model card.
- Integración en la pila de serving de producción del autor: batching continuo, streaming y gestión estándar de peticiones.
- Sin soporte de tool calling ni function calling.
- Sin capacidades de agente ni razonamiento multi-paso.
- Sin capacidades multilingües, de visión, de audio ni modo de razonamiento (thinking mode).
- Sin conocimiento general: cualquier consulta fuera del conjunto entrenado produce respuestas impredecibles o sin sentido, tal y como advierte el propio autor.

## Casos de uso

- Validación de pilas de serving de LLM: al tener 127.680 parámetros y ocupar unos 500 KB, permite probar batching continuo, caché KV, streaming y gestión de colas con un coste computacional prácticamente nulo, aislando los fallos de infraestructura de los del modelo.
- Pruebas de integración y CI/CD: sirve como endpoint de sustitución (stub) compatible con la API de OpenAI para ejecutar tests de contrato, de serialización de mensajes y de manejo de errores sin consumir GPU ni incurrir en costes de API.
- Desarrollo de clientes y SDK: útil para verificar el comportamiento correcto de librerías cliente frente a respuestas en streaming, cierres de conexión, timeouts y respuestas mal formadas, en un entorno local y totalmente reproducible.
- Docencia y formación técnica: con 3 capas y 64 dimensiones ocultas, el modelo es inspeccionable de principio a fin, lo que permite explicar tokenización byte-level, atención con GQA y funcionamiento de la caché KV sin abstracciones ocultas.
- Investigación sobre tokenizadores: el vocabulario byte-level de 258 tokens construido desde cero ofrece un caso extremo para estudiar cómo se comporta la tokenización en corpus mínimos y qué implica un vocabulario de ese tamaño en la longitud efectiva de las secuencias.
- Ablaciones de arquitectura a escala diminuta: permite experimentar con número de capas, cabezas de atención y proporción de cabezas KV en minutos, sin necesidad de clústeres ni de presupuesto de cómputo.
- Demostración de despliegue en Apple Silicon: ejemplo reproducible de servir un modelo vía MLX en un portátil con chip de la serie M, útil para talleres y demos presenciales.
- Pruebas de aplicaciones web relacionadas con el código HTTP 418: por su temática, resulta un recurso anecdótico pero válido para probar el tratamiento de respuestas de error en clientes HTTP y frameworks web.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna evaluación cuantitativa (MMLU, HumanEval, GSM8K ni similares), y la búsqueda web realizada no ha devuelto materiales técnicos sobre el modelo. Conviene tener en cuenta que, con 127.680 parámetros y entrenamiento sobre un único párrafo, las métricas de conocimiento general carecen de sentido: el modelo obtendría resultados equivalentes al azar fuera de su dominio, por lo que cualquier comparación numérica con modelos convencionales sería engañosa.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 MB para los pesos en fp32 (127.680 parámetros × 4 bytes ≈ 510 KB), más la memoria del runtime y de la caché KV. Cabe en cualquier GPU, e incluso en CPU.
- GPU recomendadas: ninguna en particular. Es funcional en CPU y en cualquier GPU; no requiere A100, H100 ni RTX 4090.
- GPU de consumo: sí, cabe en cualquier GPU de consumo e integrada, y también en dispositivos sin GPU dedicada.
- Plataforma nativa: MLX está diseñado para Apple Silicon (chips de la serie M), por lo que el uso documentado por el autor es macOS sobre Apple Silicon. No hay confirmación de funcionamiento en otros backends.
- Opciones de despliegue: `mlx_lm` (carga y generación en Python) y el servidor de mlx_lm con API compatible con OpenAI, tal y como se describe en la model card. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, y no se publican pesos en formato GGUF.
- Latencia y throughput: no disponibles. Dado el tamaño, es razonable esperar que el tiempo por token esté dominado por el sobrecoste del framework y de la capa HTTP más que por el cómputo, pero no hay cifras publicadas.
- Almacenamiento: aproximadamente 500 KB para los pesos, un espacio despreciable en cualquier sistema.

## Comparativa con modelos similares

No existe un conjunto de benchmarks publicado que permita comparar a Teapot en igualdad de condiciones. La tabla siguiente recoge únicamente la comparación estructural con otros modelos de escala diminuta o carácter demostrativo; los datos de terceros proceden de sus fichas públicas y no se han verificado en la búsqueda realizada.

| Modelo | Parametros | Contexto | Licencia | Formato / libreria | Proposito |
|---|---|---|---|---|---|
| terion-mlx/teapot | 127.680 | no disponible | MIT | safetensors / mlx_lm | Demostración de pila de serving |
| SmolLM-135M (HuggingFaceTB) | 135 M | no verificado | Apache-2.0 (segun su ficha publica) | safetensors / transformers | Modelo pequeño de uso general |
| TinyStories-1M (roneneldan) | ~1 M | no verificado | no verificado | transformers | Investigación sobre narrativa simple |
| nanoGPT (shakespeare, char-level) | ~10,6 M | no verificado | MIT (codigo) | PyTorch | Reproducción educativa de GPT |

La diferencia fundamental no es de tamaño sino de propósito: Teapot no aspira a competir en ninguna tarea de lenguaje, sino a servir como objeto de prueba para infraestructura. Sus alternativas naturales en ese rol no son modelos de lenguaje pequeños, sino servidores simulados (mock servers) y modelos todavía más triviales.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se ha realizado ninguna evaluación de sesgos ni de toxicidad, y el corpus de entrenamiento es un único párrafo de ficción, por lo que no hay datos para caracterizar sesgos.
- Riesgo de alucinación: extremo fuera de su dominio. El autor advierte que cualquier pregunta ajena al conjunto de entrenamiento produce respuestas impredecibles o directamente sin sentido, no meras imprecisiones.
- Sobreajuste deliberado: el modelo memoriza su material de entrenamiento; su comportamiento fuera de él no es fiable en absoluto.
- Limitaciones de contexto: la longitud de contexto no está publicada. Con un vocabulario de 258 tokens, cualquier texto razonable se fragmenta en muchísimos tokens, lo que reduce drásticamente la cantidad de texto que cabe en una ventana de tamaño convencional.
- Limitaciones de idioma: no hay soporte multilingüe declarado. El entrenamiento está en inglés y el tokenizador byte-level no incluye merges que optimicen otros idiomas.
- Licencia: MIT, permisiva y compatible con uso comercial. No obstante, la licencia no implica idoneidad: el modelo no tiene ninguna utilidad productiva fuera de pruebas de infraestructura.
- Ausencia de garantías: es un juguete técnico publicado con 0 descargas y 0 likes en el momento de la consulta; no hay mantenimiento, versionado ni soporte documentados.
- Advertencia para producción: no debe desplegarse ante usuarios finales ni utilizarse para tomar decisiones. Su uso correcto es como componente de prueba en entornos controlados.

## Enlaces

- Hugging Face: https://huggingface.co/terion-mlx/teapot
- Repositorio de mlx-lm (carga y servidor de inferencia mencionado en la model card): https://github.com/ml-explore/mlx-lm
- Framework MLX: https://github.com/ml-explore/mlx
- Documentación de MLX: https://ml-explore.github.io/mlx/
- SmolLM-135M, referencia de modelo diminuto de uso general: https://huggingface.co/HuggingFaceTB/SmolLM-135M
- TinyStories-1M, referencia de modelo de investigación a escala mínima: https://huggingface.co/roneneldan/TinyStories-1M
- nanoGPT, referencia educativa de arquitectura GPT: https://github.com/karpathy/nanoGPT
- Nota sobre la búsqueda web: los resultados obtenidos corresponden únicamente a páginas generales de Wikipedia y no aportan información técnica sobre el modelo ni enlaces adicionales relevantes.
