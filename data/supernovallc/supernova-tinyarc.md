# Supernovallc/Supernova-tinyArc

## Resumen

Supernova-tinyArc Base v1 es un modelo de lenguaje autorregresivo de 9,5 millones de parametros desarrollado desde cero por Supernova AI and Software Foundations. Se trata de un transformer decoder-only de estilo LLaMA, implementado en PyTorch con tokenizador propio, entrenado especificamente para la generacion de historias cortas en ingles. No es un modelo de proposito general ni un asistente instruido: es un modelo base experimental concebido para experimentacion con arquitecturas decoder-only y para fines educativos.

El modelo se entreno desde pesos inicializados aleatoriamente sobre el dataset TinyStories, un corpus de relatos cortos sinteticos generados con GPT-3.5 y GPT-4. Con 463,1 millones de tokens de entrenamiento y 15.000 pasos de optimizador en una unica NVIDIA Tesla T4 durante aproximadamente 69 minutos, alcanzo una perdida de validacion de 1,6054 (perplejidad aproximada de 4,98). Su ventana de contexto es de solo 512 tokens y su vocabulario de 16.000 tokens.

Su relevancia es fundamentalmente didactica y de investigacion: demuestra que un modelo muy pequeno, entrenado con recursos minimos, puede generar texto coherente a nivel de historia corta cuando el dominio de entrenamiento esta acotado. No compite con modelos de produccion y no debe evaluarse con ese criterio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo LLaMA (RoPE, RMSNorm, SwiGLU, embeddings atados) |
| Parametros totales | 9.506.048 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (solo se distribuyen checkpoints PyTorch en punto flotante) |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible (el repositorio separa licencia de codigo y licencia de pesos en LICENSE y MODEL_LICENSE.md, pero sus terminos no se detallan en la informacion proporcionada) |
| Formato de pesos | checkpoints PyTorch `.pt` (best.pt y latest.pt, con estado de entrenamiento incluido) |

Otros datos tecnicos: hidden size 256, 6 capas transformer, 8 cabezas de atencion, intermediate size 832, vocabulario de 16.000 tokens con tokenizador ByteLevel BPE propio y tokens especiales `[PAD]`, `[UNK]`, `[BOS]`, `[EOS]`. Tamano del repositorio: 0,2 GB.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de estilo LLaMA con codificacion posicional rotatoria (RoPE), normalizacion RMSNorm, capa feed-forward SwiGLU y embeddings atados entre entrada y salida. La implementacion es propia en PyTorch, acompanada de un tokenizador ByteLevel BPE entrenado especificamente para este modelo. El modelo se entreno desde cero (pesos inicializados aleatoriamente) sobre el dataset TinyStories.

El entrenamiento consistio en 15.000 pasos de optimizador con un tamano de lote efectivo de 32.768 tokens por paso, lo que arroja aproximadamente 463,1 millones de tokens de entrenamiento y 4,66 millones de tokens de validacion. Se ejecuto en una NVIDIA Tesla T4 en unos 69 minutos. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion; se trata de un modelo puramente preentrenado. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto narrativo corto en ingles, orientada a historias simples con vocabulario y estructura propios del dataset TinyStories.
- Continuacion de prompts: dado un inicio de historia, el modelo genera continuaciones coherentes dentro de su dominio.
- Generacion con parametros de muestreo configurables (temperatura, top-k, top-p) mediante el script `src/generate.py`.
- Ejecucion en CPU o GPU (selecciona CUDA automaticamente cuando esta disponible).
- No soporta tool calling ni function calling.
- No soporta uso como agente ni razonamiento multi-paso.
- No dispone de modo de razonamiento (thinking mode), vision ni audio.
- Capacidad multilingue practicamente nula: solo ingles.
- No es un modelo instruido; no sigue instrucciones de forma fiable.

## Casos de uso

- Generacion de microrelatos para prototipos: el modelo puede producir historias cortas de forma autonoma a partir de un prompt inicial, util para rellenar contenido de demostracion en aplicaciones de prueba sin coste de inferencia significativo.
- Educacion en arquitecturas transformer: sirve como caso de estudio completo y reproducible (codigo, tokenizador, checkpoints y script de generacion) para que estudiantes comprendan el ciclo completo de entrenamiento de un decoder-only.
- Experimentacion con tokenizadores: al incluir un tokenizador ByteLevel BPE propio de 16.000 tokens, permite comparar decisiones de vocabulario y su impacto en la generacion con corpus pequenos.
- Pruebas de pipelines de inferencia: su tamano minimo (9,5 M de parametros, repositorio de 0,2 GB) lo hace idoneo para validar integraciones de carga de checkpoints PyTorch y scripts de generacion en entornos con recursos limitados, incluidos portatiles sin GPU.
- Investigacion sobre datasets sinteticos: permite reproducir y analizar el efecto del dataset TinyStories en el aprendizaje de estructuras narrativas con un presupuesto de computo minimo (una T4, ~69 minutos).
- Baseline para comparativas de modelos pequenos: puede emplearse como referencia inferior en estudios que midan la calidad de generacion de modelos mas grandes sobre el mismo dominio narrativo.
- Generacion de texto en entornos embebidos o sin conectividad: dado su reducido peso, es viable ejecutarlo en CPU para tareas de relleno de texto no criticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento reportado por el autor es la perdida de validacion final de 1,6054, equivalente a una perplejidad aproximada de 4,98 sobre el conjunto de validacion de TinyStories.

| Metrica | Valor |
|---|---|
| Perdida de validacion final | 1,6054 |
| Perplejidad de validacion aproximada | 4,98 |
| Tokens de entrenamiento | ~463,1 millones |
| Tokens de validacion | ~4,66 millones |
| Pasos de optimizador | 15.000 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (9,5 M de parametros); los checkpoints incluyen estado de entrenamiento, por lo que el archivo pesa mas que los pesos puros, pero la inferencia solo requiere los pesos del modelo.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria es suficiente; el autor entreno en una NVIDIA Tesla T4. Tambien funciona en RTX 4090, A100 o H100, aunque estan sobredimensionadas para este modelo.
- Cabe holgadamente en cualquier GPU de consumo, incluida una GTX 1050 o integradas con suficiente memoria compartida; tambien se ejecuta en CPU.
- Opciones de despliegue: el repositorio proporciona scripts propios en PyTorch (`src/generate.py`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al distribuirse en formato `.pt` en lugar de safetensors o GGUF, la integracion con esos motores requeriria conversion previa.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera una latencia muy baja en cualquier hardware moderno, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento de modelos comparables (por ejemplo, otros modelos entrenados sobre TinyStories) que permitan una comparacion cuantitativa rigurosa. A continuacion se ofrece una comparacion estructural basica con alternativas conocidas de la misma categoria (modelos muy pequenos para generacion de texto), marcando como no disponible cualquier dato que no se haya verificado.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Supernova-tinyArc Base v1 | 9,5 M | 512 | no disponible | `.pt` (PyTorch) | Entrenado en TinyStories; solo ingles; modelo base |
| Modelos TinyStories de referencia (Eldan y Li) | del orden de 1 M a 33 M | no disponible | no disponible | no disponible | Familia descrita en el paper arXiv:2305.07759; referencia del dataset |
| GPT-2 small | 124 M | 1.024 | MIT (segun publicacion original) | safetensors, GGUF | Modelo de proposito general, mucho mayor |
| SmolLM-135M | 135 M | 2.048 | Apache 2.0 | safetensors, GGUF | Modelo moderno de proposito general, muy superior en capacidad |

La comparacion directa con GPT-2 small o SmolLM no es equitativa en capacidad, pero ilustra la diferencia de escala: Supernova-tinyArc es entre uno y dos ordenes de magnitud menor y esta especializado en un unico dominio.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre historias sinteticas generadas por GPT-3.5 y GPT-4, puede heredar sesgos presentes en esos datos.
- Riesgo de alucinacion: alto en cualquier tarea factual; el autor advierte explicitamente que no debe tratarse como fuente fiable de informacion.
- Repeticiones e incoherencias: el modelo puede repetir frases o ideas, perder el hilo narrativo y producir detalles inconsistentes.
- Dominio muy acotado: rendimiento pobre en preguntas factuales, razonamiento general, programacion y matematicas.
- Limitacion de contexto: solo 512 tokens, insuficiente para conversaciones largas o documentos extensos.
- Limitacion de idioma: unicamente ingles; no se garantiza un comportamiento aceptable en castellano u otros idiomas.
- Restricciones de licencia: la licencia de los pesos no esta detallada en la informacion disponible; el repositorio remite a `MODEL_LICENSE.md`, que debe consultarse antes de cualquier uso comercial. El dataset TinyStories declara licencia CDLA-Sharing-1.0, cuyos terminos pueden afectar a usos derivados.
- No es un asistente: al ser un modelo base sin instruccion, no debe desplegarse en produccion como chatbot ni como sistema de atencion al cliente.
- Checkpoints con estado de entrenamiento: los archivos `.pt` incluyen estado del optimizador, lo que complica su carga en frameworks estandar y exige usar el codigo del repositorio o extraer los pesos manualmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Supernovallc/Supernova-tinyArc
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Paper de TinyStories: https://arxiv.org/abs/2305.07759
