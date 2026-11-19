# thyOsama/Jais-3-0.9B-Yomna-Tools-MLX-4bit

## Resumen

Jais-3-0.9B-Yomna-Tools-MLX-4bit es un ajuste fino (fine-tune) del modelo Jais-3-0.9B de IFM, en su variante ya cuantizada a 4 bits para MLX. Lo publica el usuario thyOsama y su proposito concreto es mejorar la seleccion de herramientas (tool calling) en las peticiones que genera la aplicacion Yomna, un asistente para macOS. El modelo trabaja en ingles y arabe egipcio, y esta pensado para ejecutarse localmente en hardware de Apple mediante la libreria mlx-lm.

La relevancia de esta ficha es acotada: no se trata de un modelo de proposito general ni de un lanzamiento de gran escala, sino de un adaptador LoRA fusionado sobre un modelo base pequeno (1.078.285.824 parametros totales, ~1,08 mil millones) que mejora una tarea muy especifica dentro de una aplicacion. Su interes para desarrolladores radica en que ejemplifica el patron de especializacion de modelos pequenos para tool calling local en dispositivos Apple Silicon, con un modelo base de licencia Apache-2.0.

El modelo hereda la arquitectura `k2_horizon` del Jais-3 original, mantiene el tokenizador, la plantilla de chat y el esquema de cuantizacion del repositorio base, y solo cambia los pesos tras el entrenamiento del adaptador. El repositorio ocupa aproximadamente 0,9 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | k2_horizon (heredada de Jais-3-0.9B; codigo en `k2_horizon.py`) |
| Parametros totales | 1.078.285.824 (~1,08 mil millones) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX); el modelo base tambien se distribuye en MLX 4-bit |
| Idiomas soportados | arabe (incluido arabe egipcio) e ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), cuantizacion 4-bit |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Jais-3-0.9B-MLX-4bit, que a su vez es una cuantizacion del Jais-3-0.9B de IFM. La arquitectura es la `k2_horizon` definida por el modelo base; el autor indica que no cambia nada respecto al repositorio base salvo los pesos: mismo codigo de arquitectura, tokenizador, plantilla de chat y esquema de cuantizacion. No se detalla en la informacion disponible la composicion interna de la arquitectura ni los datos de preentrenamiento del modelo original.

El ajuste consistio en un adaptador LoRA entrenado con mlx-lm sobre el modelo de 4 bits y posteriormente fusionado en el. Los hiperparametros reportados son 800 pasos, tasa de aprendizaje 1e-4 y enmascaramiento de los tokens del prompt. Los datos de entrenamiento son peticiones generadas sinteticamente del tipo que envia la aplicacion: mensaje del usuario, turnos anteriores y conjunto de herramientas disponibles; el objetivo es la llamada que el modelo deberia emitir, escrita en el marcado de tool-call propio de Jais. Aproximadamente un tercio de los ejemplos son mensajes que no requieren herramienta; en esos casos el objetivo es la apertura generada por el propio modelo base, para conservar su estilo de respuesta. No se menciona uso de RLHF ni DPO.

## Capacidades

- Generacion de texto conversacional en ingles y arabe (incluido arabe egipcio).
- Tool calling / function calling en el marcado nativo de Jais, especializado para el conjunto de herramientas de la aplicacion Yomna.
- Seleccion de la herramienta adecuada en peticiones con contexto multi-turno (se incluyen turnos anteriores en la entrada).
- Discriminacion entre peticiones que requieren herramienta y peticiones que no la requieren (el 99% de acierto en este segundo grupo segun el autor).
- Inferencia local en Apple Silicon mediante mlx-lm.
- No se documentan capacidades de vision, audio, modo thinking explicito ni razonamiento multi-paso general.

## Casos de uso

- Asistente de escritorio en macOS: el modelo es el motor local de la app Yomna y decide que herramienta invocar (busqueda web, acciones del sistema, etc.) a partir del mensaje del usuario y del historial de la conversacion; su tamano (~1,08 mil millones de parametros en 4 bits) permite ejecutarlo en el propio Mac sin depender de la nube.
- Enrutamiento de intenciones en agentes locales: dado un mensaje y un catalogo de herramientas, el modelo emite la llamada en formato Jais; util para construir capas de despacho de herramientas en asistentes de escritorio.
- Asistencia en arabe egipcio: conversacion y seleccion de herramientas en dialecto egipcio, un idioma poco cubierto por modelos pequenos de proposito general.
- Prototipado rapido de flujos de tool calling en MLX: sirve como referencia de como se entrena y fusiona un LoRA para especializar un modelo base pequeno en una tarea de enrutamiento concreta.
- Filtrado de peticiones que no requieren herramienta: con el 99% de acierto reportado en mensajes sin herramienta, puede usarse como clasificador previo para evitar llamadas innecesarias a herramientas en pipelines de agentes.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente en el dispositivo, las conversaciones no salen del equipo, lo que encaja en escenarios donde no se permite enviar datos a servicios externos.

## Benchmarks y rendimiento

Los unicos datos publicados son los del banco de pruebas propio de la aplicacion (267 peticiones, 3 intentos por peticion, decodificacion greedy). El propio autor advierte que miden las herramientas de su app y dicen poco sobre el tool calling en general.

| Metrica | Base 4-bit | Este modelo |
|---|---|---|
| Herramienta correcta, global | 64,3% | 83,4% |
| Mensajes que no requieren herramienta | 70% | 99% |
| Herramienta correcta sin peticiones de busqueda web | no disponible | 86% |
| Herramienta correcta en peticiones en arabe | no disponible | 86% |
| Herramienta correcta en peticiones de busqueda web | no disponible | 62% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: el repositorio pesa 0,9 GB en 4 bits; se puede ejecutar con holgura en equipos con 8 GB de memoria unificada o mas.
- Hardware objetivo: Apple Silicon (M1, M2, M3, M4 y posteriores) mediante MLX; no se documenta soporte CUDA.
- GPU dedicadas (A100, H100, RTX 4090): no aplica de forma nativa, ya que el formato es MLX; no se documenta una ruta de despliegue con CUDA en la informacion disponible.
- Cabe en GPU de consumo: si, en el sentido de que cabe en Macs de consumo con memoria unificada; no se confirma compatibilidad con GPU de consumo NVIDIA.
- Opciones de despliegue: mlx-lm es la via documentada, con `--trust-remote-code` obligatorio porque mlx-lm aun no incluye la arquitectura `k2_horizon`. No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jais-3-0.9B-Yomna-Tools-MLX-4bit | ~1,08 mil millones | no disponible | especializado (banco propio de la app) | Apache-2.0 | Hugging Face, MLX 4-bit |
| IFM/Jais-3-0.9B-MLX-4bit (base) | ~1,08 mil millones | no disponible | generico | Apache-2.0 | Hugging Face, MLX 4-bit |
| IFM/Jais-3-0.9B (original) | ~1,08 mil millones | no disponible | generico | Apache-2.0 | Hugging Face |

La comparativa se limita a la propia familia Jais-3 porque la informacion proporcionada no incluye datos de otros modelos pequenos de tool calling (por ejemplo, variantes de Qwen o Llama) que permitan una comparacion con cifras verificables. No se dispone de datos de rendimiento comparables entre estos tres modelos mas alla del banco de pruebas del autor.

## Limitaciones y advertencias

- Los resultados de tool calling (83,4% global) proceden del banco de pruebas de la propia aplicacion y no son extrapolables a otros catalogos de herramientas.
- Las peticiones de busqueda web son el punto debil (62% de acierto); el autor indica que la aplicacion las enruta por su cuenta.
- Modelo de ~1,08 mil millones de parametros: capacidad de razonamiento y conocimiento general limitada en comparacion con modelos mucho mayores; no se han publicado evaluaciones generales.
- Cobertura linguistica restringida a arabe (incluido egipcio) e ingles; el rendimiento en otros idiomas no esta documentado.
- Longitud de contexto no disponible; no se debe asumir una ventana amplia para conversaciones largas.
- Requiere `--trust-remote-code` en mlx-lm, lo que implica ejecutar codigo de arquitectura incluido en el repositorio; conviene revisarlo antes de usarlo en produccion.
- Riesgo de alucinacion inherente a los modelos de lenguaje pequenos; no se documentan evaluaciones de sesgo ni de robustez.
- Licencia Apache-2.0, que permite uso comercial, pero se trata de una version modificada de Jais-3-0.9B de IFM y se aplican la licencia y los avisos del modelo original.
- Solo compatible de forma documentada con MLX; no hay ruta oficial para CUDA, vLLM ni llama.cpp.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thyOsama/Jais-3-0.9B-Yomna-Tools-MLX-4bit
- Modelo base (MLX 4-bit): https://huggingface.co/IFM/Jais-3-0.9B-MLX-4bit
- Modelo original Jais-3-0.9B: https://huggingface.co/IFM/Jais-3-0.9B
- Licencia del modelo original: https://huggingface.co/IFM/Jais-3-0.9B
- Libreria mlx-lm: no se proporciona enlace en la informacion disponible
