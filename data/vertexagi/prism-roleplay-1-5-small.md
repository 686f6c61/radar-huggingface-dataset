# VertexAGI/prism-roleplay-1.5-small

## Resumen

Prism Roleplay 1.5 Small es un modelo de generacion de texto especializado en roleplay de personajes y dialogo inmersivo, desarrollado por VertexAGI como parte de su familia Prism de modelos creativos. Se trata de un ajuste fino mediante LoRA sobre Qwen3-8B, concretamente sobre la variante cuantizada a 4 bits de la comunidad MLX (`mlx-community/Qwen3-8B-4bit`), con 8.190.735.360 parametros totales y una ventana de contexto heredada de la arquitectura Qwen3.

El modelo aborda un problema concreto dentro del nicho del roleplay: la mayoria de los ajustes finos de este tipo se centran en corregir errores mecanicos (formato, coherencia de personaje, ruptura de la cuarta pared) pero degradan la calidad de la prosa, aplanandola hacia la media del corpus de entrenamiento. Prism Roleplay 1.5 Small invierte esa prioridad: cada ejemplo de entrenamiento, real o sintetico, debe superar un umbral explicito de calidad (minimo 230 palabras, 3 parrafos y dialogo con al menos dos comillas) antes de entrar en el corpus.

Es relevante ahora porque demuestra que un ajuste LoRA de rango bajo (rank 8) sobre un modelo base de 8B puede superar al base en juicio ciego por pares con una tasa de victoria del 83% en 16 escenas variadas, manteniendo estructura de parrafos y presencia de dialogo. Se distribuye en dos formatos (MLX 4-bit y GGUF Q4_K_M) bajo licencia Apache 2.0, lo que facilita su despliegue tanto en Apple Silicon como en llama.cpp, Ollama y LM Studio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste fino LoRA |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-8B) |
| Tipos de cuantizacion | 4-bit MLX (group size 64) y GGUF Q4_K_M (4-bit) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX) y GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer decoder-only denso, y se ajusta mediante LoRA con rango 8, escala 20 y 16 capas, durante 2.500 iteraciones con longitud de secuencia de 2.048 tokens. La validacion emplea 100 lotes por evaluacion, ampliados desde 20 tras detectar que una muestra menor provocaba oscilaciones de ±0.4 en la perdida de validacion atribuibles a la composicion de los lotes y no a sobreajuste.

El corpus de entrenamiento combina tres fuentes filtradas de forma independiente. La primera son transcripciones reales de foros de roleplay (`lemonilia/Roleplay-Forums_2023-04`), de las que se conservan 1.802 de aproximadamente 14.000 (13%). La segunda es el conjunto sintetico original de Prism Roleplay 1, generado con GLM 5.2 y Nemotron-3-Nano, del que se retienen 2.175 de 3.500. La tercera es un nuevo conjunto sintetico generado para esta version con Nemotron-3-Ultra, Nemotron-3-Super y Nemotron-3-Nano a traves de NVIDIA NIM (GLM 5.2 fue retirado de NIM durante la ejecucion, con HTTP 410, y la politica de usar solo NIM impidio sustituirlo por una API de pago), del que se conservan 3.991 de 5.000. El filtro de calidad exige que cada turno del asistente tenga al menos 230 palabras, 3 parrafos y dialogo con dos o mas comillas. El corpus final es de 7.570 ejemplos de entrenamiento y 398 de validacion, con un turno objetivo mediano de 254 palabras y 4,0 parrafos.

## Capacidades

- Generacion de texto conversacional y narrativo orientado a roleplay de personajes, con prosa fluida y estructura en parrafos.
- Mantenimiento de personaje consistente: acciones, habla e interioridad del personaje sin romper la cuarta pared.
- Generacion de dialogo integrado en la narracion, con presencia de dialogo del 100% en la evaluacion realizada.
- Escritura de turnos extensos: media de 299 palabras y 4,5 parrafos por respuesta en la evaluacion, frente a 210 palabras y 4,2 parrafos del base.
- Adaptacion a generos variados: ocultismo, ciencia ficcion, noir, fantasia, ambientacion belica, entre otros.
- Modo de razonamiento de Qwen3: el modelo puede emitir un bloque `<think>...</think>` si el runtime no desactiva explicitamente el modo no-thinking; en MLX se gestiona automaticamente, en llama.cpp requiere `-rea off`.
- Soporte de plantilla de chat de Qwen3 mediante `apply_chat_template`.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Tool calling, function calling y capacidades de agente: no disponibles en la informacion proporcionada.

## Casos de uso

- Roleplay conversacional de personajes en aplicaciones de entretenimiento: el modelo mantiene un personaje con voz propia a lo largo de turnos multi-turno, escribiendo acciones, dialogo e interioridad en prosa con parrafos, gracias al entrenamiento especifico sobre transcripciones de foro y datos sinteticos filtrados por calidad.
- Narrativa interactiva y ficcion colaborativa: adecuado para generar escenas de 250 a 300 palabras con cuatro o cinco parrafos por turno, un formato que encaja con plataformas de escritura colaborativa y novelas visuales donde se espera sustancia por intervencion.
- Simulacion de personajes para entrenamiento de habilidades sociales o entrevistas: el modelo puede encarnar un interlocutor con perfil definido (por ejemplo, un mercenario stoico) y responder en personaje, util en prototipos de formacion y simulacion conversacional.
- Prototipado rapido en Apple Silicon: al distribuirse en MLX 4-bit (4,61 GB), permite iterar sobre prompts de personaje y plantillas de sistema en portatiles con chip M-series sin infraestructura GPU dedicada.
- Despliegue local en entornos de escritorio: la variante GGUF Q4_K_M (5,03 GB) se integra en Ollama, LM Studio y llama.cpp, lo que habilita asistentes de roleplay offline en equipos de consumo con 8 GB de VRAM o memoria unificada.
- Generacion de contenido para videojuegos con NPCs dialogantes: el modelo produce respuestas con formato limpio (un solo defecto de formato en la evaluacion, igual que el base) y estructura de parrafos estable, lo que reduce la necesidad de postprocesado en pipelines de contenido generado.
- Investigacion sobre ajuste fino con LoRA de bajo rango: sirve como caso de estudio reproducible de como un LoRA rank 8 con filtrado agresivo de datos (13% de retencion en el corpus real) puede superar al base en juicio ciego por pares.

## Benchmarks y rendimiento

La model card reporta una evaluacion por juicio ciego por pares con `nvidia/nemotron-3-super-120b-a12b` como juez, con orden de presentacion aleatorizado, sobre 16 escenas variadas:

| Sistema | Tasa de victoria vs. base | Palabras medias | Parrafos medios | Dialogo presente | Defectos de formato |
|---|---|---|---|---|---|
| Base Qwen3-8B | — | 210 | 4,2 | 100% | 1 |
| Prism Roleplay 1.5 Small | 83% (10W–2L, 4 empates) | 299 | 4,5 | 100% | 1 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,6 GB para la variante MLX 4-bit y aproximadamente 5,0 GB para la variante GGUF Q4_K_M, segun los tamanos de archivo reportados.
- GPU recomendadas: no disponibles en la informacion proporcionada; el modelo esta orientado a Apple Silicon via MLX y a runtimes de llama.cpp.
- Cabe en GPU de consumo: si, en tarjetas con 6-8 GB de VRAM o mas para la variante GGUF; en Apple Silicon con memoria unificada de 8 GB o superior para la variante MLX.
- Opciones de despliegue: `mlx-lm` en Apple Silicon, `llama.cpp`, Ollama y LM Studio para GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- Nota de despliegue: en llama.cpp es necesario pasar `-rea off` (o `--reasoning off`) para suprimir el bloque de razonamiento de Qwen3; `mlx-lm` lo gestiona de forma automatica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| Prism Roleplay 1.5 Small | 8,19B | no disponible | apache-2.0 | MLX 4-bit, GGUF Q4_K_M | 83% de victoria en juicio ciego vs. Qwen3-8B base en 16 escenas |
| Qwen3-8B (base) | 8B | no disponible | apache-2.0 | safetensors, GGUF (comunidad) | Modelo generalista; 210 palabras y 4,2 parrafos medios por turno en la evaluacion del autor |
| Prism Roleplay 1 (version anterior) | 8B (derivado de Qwen3-8B) | no disponible | apache-2.0 | no disponible | Enfoque en correccion de mecanicas con datos sinteticos; sin datos de calidad de prosa reportados |
| Prism Roleplay 1.5 (experimento abandonado) | 8B (derivado de Qwen3-8B) | no disponible | no disponible | no disponible | Uso masivo de datos reales sin filtro de calidad; prosa aplanada con 158 palabras y 1,1 parrafos medios |

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera inferior.
- Riesgo de alucinacion: no se reportan evaluaciones de factualidad; en tareas fuera del roleplay el modelo puede inventar contenido sin restriccion especifica.
- Sesgos: no se documentan analisis de sesgos; el corpus incluye transcripciones reales de foros de roleplay y datos sinteticos, con los sesgos inherentes a ambas fuentes.
- Longitud de contexto: no se especifica en la informacion disponible; el entrenamiento LoRA uso secuencias de 2.048 tokens, lo que puede limitar el rendimiento en conversaciones muy largas aunque el base soporte ventanas mayores.
- Formato de respuesta: el modelo esta entrenado para producir turnos largos (mediana de 254 palabras y 4 parrafos), lo que puede ser excesivo para aplicaciones que requieren respuestas breves.
- Modo de razonamiento: en runtimes que no desactiven explicitamente el modo no-thinking de Qwen3, el modelo emitira un bloque `<think>...</think>` visible antes de la respuesta en personaje, lo que rompe la inmersion si no se configura correctamente.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribucion; conviene verificar las condiciones del modelo base Qwen3-8B y del corpus de foros utilizado.
- Caveat de produccion: la evaluacion se basa en 16 escenas y un unico juez automatico, con 10 victorias, 2 derrotas y 4 empates; el tamano muestral es reducido y no sustituye una evaluacion humana a gran escala.
- Dependencia del system prompt: el autor recomienda usar el system prompt de entrenamiento; desviarse de el puede degradar la calidad y el formato de las respuestas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VertexAGI/prism-roleplay-1.5-small
- Modelo base: https://huggingface.co/mlx-community/Qwen3-8B-4bit
- Corpus real de roleplay: https://huggingface.co/datasets/lemonilia/Roleplay-Forums_2023-04
- Juez de evaluacion: https://huggingface.co/nvidia/nemotron-3-super-120b-a12b
- Repositorio de mlx-lm: https://github.com/ml-explore/mlx-lm
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
