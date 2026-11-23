# training-agents-course/qwen3.5-2b-distill-data-firstturn-s44

## Resumen

qwen3.5-2b-distill-data-firstturn-s44 es un modelo derivado de Qwen/Qwen3.5-2B, desarrollado por el colectivo training-agents-course dentro de un curso sobre entrenamiento de agentes. Se trata de un modelo multimodal de tipo image-text-to-text afinado mediante destilación on-policy con el `DistillationTrainer` de TRL, usando como profesor Qwen/Qwen3.5-9B. El objetivo es transferir al modelo pequeño de 2B la capacidad de resolver tareas de análisis de datos ejecutando código Python en un entorno sandbox gestionado por OpenEnv.

El modelo se ha entrenado específicamente sobre el primer turno de cada episodio: el estudiante genera su primera llamada a herramienta y el profesor puntúa esos tokens. Es, por tanto, la variante de control frente al entrenamiento sobre episodios completos, y sirve para aislar el efecto de destilar solo la fase inicial de planificación y llamada a herramienta.

Con 2.213.241.664 parámetros y licencia Apache 2.0, es relevante como ejemplo reproducible de destilación on-policy para agentes con tool calling, y como referencia de hasta qué punto un modelo de 2B puede mejorar en tareas agénticas de análisis de datos respecto a su base sin entrenar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5), pipeline image-text-to-text |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el repo no documenta variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer multimodal de la familia Qwen3.5 con capacidad de entrada image-text-to-text. Sobre esa base se aplica destilación on-policy: el estudiante genera tokens y el profesor (Qwen/Qwen3.5-9B) puntúa esas secuencias, en lugar de imitar trayectorias fijas generadas de antemano. El entrenamiento usa el `DistillationTrainer` de TRL junto con su `environment_factory`, que conecta el modelo a entornos interactivos.

Los datos provienen del dataset FineEnvs/SmolDataEnvs (v1.1), servido a través del entorno `data_analysis_env` de OpenEnv. En cada tarea el agente debe responder preguntas sobre ficheros de datos reales ejecutando Python en una sesión sandbox y enviando una respuesta final que el entorno evalúa. La particularidad de esta variante es que solo se destila el primer turno: el estudiante escribe su primera llamada a herramienta y el profesor puntúa únicamente esos tokens, lo que sirve de control frente al entrenamiento sobre episodios completos. La configuración concreta fue de 28 pasos de 32 tareas (una pasada sobre el split de entrenamiento), learning rate 2e-6 y semilla 44. Los registros de entrenamiento están en la carpeta `trackio/` del repositorio.

## Capacidades

- Generación de texto y razonamiento dentro de un bucle agéntico de resolución de tareas.
- Entrada multimodal image-text-to-text, heredada de la base Qwen3.5-2B.
- Tool calling: el modelo emite llamadas a herramientas (ejecución de Python en sandbox) como parte de su primer turno.
- Razonamiento multi-paso orientado a agentes, aunque el ajuste se centra en el primer turno del episodio.
- Análisis de datos: formulación de consultas y operaciones sobre ficheros de datos reales mediante código.
- Capacidades multilingües: no documentadas en la información disponible.

## Casos de uso

- Análisis exploratorio de datos automatizado: el modelo puede recibir una pregunta sobre un fichero de datos y emitir una primera llamada a herramienta que ejecute código Python para inspeccionar columnas, tipos o estadísticos, aprovechando el ajuste específico sobre el primer turno.
- Enrutamiento inicial en pipelines agénticos: al estar optimizado para la primera acción, encaja como modelo de planificación inicial que decide qué herramienta invocar antes de delegar el resto del episodio a un modelo mayor.
- Destilación y experimentación académica: sirve como referencia reproducible de destilación on-policy con TRL y OpenEnv para comparar variantes de entrenamiento (primer turno frente a episodios completos, distintas semillas).
- Prototipado de agentes de código de bajo coste: con 2,2B parámetros puede desplegarse en hardware modesto para probar flujos de ejecución de Python en sandbox antes de escalar a modelos mayores.
- Evaluación de entornos de agentes: útil para validar el funcionamiento de `data_analysis_env` y del dataset SmolDataEnvs con un estudiante pequeño y un profesor de referencia.
- Docencia y formación en agentes: ejemplo práctico para cursos sobre entrenamiento de agentes, mostrando el efecto medible de la destilación sobre una base de 2B.

## Benchmarks y rendimiento

Recompensa media (proporción de tareas respondidas correctamente) sobre 8 ejecuciones por tarea, evaluando base y estudiantes en el mismo job:

| Modelo | eval_verified (61 tareas, 16 turnos) | test (194 tareas, 10 turnos) |
|---|---|---|
| Qwen3.5-2B sin entrenar | 0.189 | 0.143 |
| Este modelo | 0.287 | 0.222 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 2,2B parámetros, en fp16 rondaría los 4,5 GB de pesos y en cuantización de 8 bits unos 2,3 GB, sin contar caché KV ni overhead del runtime.
- GPU recomendadas: no especificadas por el autor; por tamaño, cabe en GPUs consumer tipo RTX 4090, RTX 3090 o superiores, y en GPUs de datacenter (A100, H100) para servir varias instancias.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con 8 GB o más en fp16 y en GPUs de 4-6 GB con cuantización, aunque el dato no está confirmado por el autor.
- Opciones de despliegue: transformers (librería declarada); vLLM, llama.cpp, Ollama o TGI no están documentados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (test, 194 tareas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (firstturn-s44) | 2,21B | no disponible | 0.222 | Apache 2.0 | Hugging Face |
| qwen3.5-2b-distill-data-episodes-s44 | no disponible (base 2B) | no disponible | no disponible en la información proporcionada | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-2B (base) | 2B (aprox.) | no disponible | 0.143 | no disponible en la información proporcionada | Hugging Face |
| Qwen/Qwen3.5-9B (profesor) | 9B (aprox.) | no disponible | no disponible | no disponible en la información proporcionada | Hugging Face |

## Limitaciones y advertencias

- El ajuste cubre solo el primer turno del episodio; el rendimiento en turnos posteriores no está específicamente optimizado por esta variante.
- El modelo está especializado en tareas de análisis de datos sobre SmolDataEnvs; su generalización a otros dominios agénticos no está evaluada.
- Riesgo de alucinación inherente a modelos de 2B, especialmente en la formulación de código y en la interpretación de resultados.
- Sesgos conocidos: no documentados en la información disponible; al heredar la base Qwen3.5-2B, arrastra los sesgos de sus datos de preentrenamiento.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingüe uniforme.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo se publica en el contexto de un curso.
- Sin descargas ni likes en el momento de la consulta y sin documentación sobre cuantizaciones, lo que limita su uso directo en producción sin validación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/training-agents-course/qwen3.5-2b-distill-data-firstturn-s44
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Modelo profesor: https://huggingface.co/Qwen/Qwen3.5-9B
- Variante entrenada sobre episodios completos: https://huggingface.co/training-agents-course/qwen3.5-2b-distill-data-episodes-s44
- Dataset: https://huggingface.co/datasets/FineEnvs/SmolDataEnvs
