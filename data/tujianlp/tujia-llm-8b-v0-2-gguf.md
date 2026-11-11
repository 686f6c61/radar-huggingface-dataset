# TujiaNLP/tujia-llm-8b-v0.2-gguf

## Resumen

Tujia LLM 8B v0.2 es un ajuste fino de Qwen/Qwen3-8B orientado a una tarea muy concreta: el procesamiento del tujia (tambien llamado bizika), una lengua sinica en peligro de extincion hablada por la minoria etnica tujia en China. Lo desarrolla el grupo TujiaNLP y se distribuye como un "research preview", es decir, una version de investigacion sin garantias de robustez para produccion. El modelo no pretende ser un asistente generalista, sino un traductor y consultor lexico especializado en cuatro plantillas fijas de prompt.

La relevancia del proyecto es doble. Por un lado, aborda un caso de lengua de bajos recursos (low-resource) donde los corpus paralelos son escasisimos y donde los modelos multilingues comerciales rinden mal. Por otro, demuestra la viabilidad de especializar un modelo abierto de 8B parametros mediante ajuste fino supervisado sobre datos linguisticos curados, manteniendo el tokenizador y la arquitectura original de Qwen3.

Esta ficha cubre la variante GGUF, pensada para ejecucion en CPU y GPU consumer mediante llama.cpp u Ollama. Segun la model card, los pesos no se alojan en Hugging Face (el repositorio solo contiene metadatos); el archivo `.gguf` real se descarga desde ModelScope, con un tamano de 4,7 GB en cuantizacion Q4_K_M y 15 GB en f16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3-8B), con soporte de bloque de razonamiento ``); de lo contrario, Ollama muestra una seccion de pensamiento y la calidad de salida se degrada. Esto implica que el ajuste fino "colapsa" el modo de razonamiento del Qwen3 original para forzar respuestas directas y deterministas, algo coherente con el uso de temperatura 0 en los ejemplos.

## Capacidades

- Traduccion chino→tujia en las cuatro plantillas fijas documentadas.
- Traduccion tujia→chino y tujia→ingles.
- Consulta lexica de palabras chinas con su equivalente en tujia en notacion fonetica con tonos (p. ej. `zɤ³⁵` para "酒").
- Generacion de texto bilingue zh/en heredada del modelo base, aunque el ajuste esta orientado a la tarea de traduccion.
- Soporte de tool calling / function calling: no disponible (no documentado; el ajuste fino restringe el comportamiento a plantillas fijas).
- Soporte de agentes y razonamiento multi-paso: no disponible; el bloque de pensamiento se entrena vacio y cerrado, por lo que no hay modo de razonamiento activo.
- Capacidades multilingues: limitadas a chino, ingles y tujia; no se documentan otros idiomas.
- Capacidad especial: salida fonetica con marcas de tono (AFI-like) para el tujia.

## Casos de uso

- Digitalizacion y preservacion linguistica: el modelo permite generar glosas y traducciones de frases tujia a chino e ingles para corpus de documentacion, partiendo de las cuatro plantillas fijas y con temperatura 0 para reproducibilidad.
- Diccionario consultable en local: integrado en una aplicacion de escritorio con Ollama, responde consultas del tipo "como se dice X en tujia" sin conexion, lo que encaja con comunidades con conectividad limitada.
- Herramienta de apoyo a la ensenanza: un profesor o estudiante puede consultar traducciones y transcripciones foneticas de vocabulario basico en un portatil con 16 GB de RAM, usando la cuantizacion Q4_K_M.
- Etiquetado asistido de corpus paralelos: el modelo puede proponer traducciones chino→tujia que un linguista revisa manualmente, acelerando la construccion de datasets para futuros ajustes.
- Investigacion en lenguas de bajos recursos: sirve como linea base reproducible para comparar estrategias de ajuste fino (por ejemplo, con o sin bloque de pensamiento cerrado) sobre un modelo Qwen3-8B.
- Despliegue en CPU sin GPU: segun la model card, la build Q4_K_M se ha verificado en Windows 11 con 32 GB de RAM y sin GPU mediante Ollama, lo que la hace apta para entornos de laboratorio modestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros). La model card solo incluye pruebas cualitativas de comportamiento y mediciones de velocidad:

| Prueba | Resultado |
|---|---|
| `「酒」用土家语怎么说？` | `zɤ³⁵；zɤ³⁵` (identico a la build bf16 MLX) |
| `把这句话翻译成土家语：大家都过好日子。` | `xu³⁵ ni⁵⁵ niɛ⁵⁵ kʰa⁵⁵ ɕi⁵⁵ tsʰa³⁵` |
| `「谢谢」用土家语怎么说？` | `aŋ²¹tsai⁵⁵；aŋ²¹tsai³⁵` |
| Velocidad, Apple M2 Ultra con Metal | 12,8 tok/s (prompt 159 tok/s) |
| Velocidad, Apple M2 Ultra solo CPU (`-ngl 0`) | 27,4 tok/s (prompt 57,6 tok/s) |
| Windows 11, 32 GB RAM, sin GPU, Ollama | Correcto (2026-11-11, solo CPU) |

La propia model card estima que en Windows con CPU un modelo 8B en Q4 suele rendir entre 4 y 8 tok/s, y que una GPU reciente o Ollama con CUDA/Vulkan es mas rapido.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; por el tamano del archivo, Q4_K_M requiere al menos 16 GB de RAM (32 GB es "comodo") y f16 requiere unos 20 GB de RAM.
- GPU recomendadas: no se especifican modelos concretos; la model card menciona que una GPU reciente o Ollama con CUDA/Vulkan acelera la inferencia.
- Cabe en GPU consumer: si, en tarjetas con suficiente memoria para cargar 4,7 GB de pesos mas el contexto (por ejemplo, GPUs de 8 GB o mas en Q4_K_M); no se detalla la lista exacta.
- Opciones de despliegue: Ollama (con `Modelfile` incluido) y llama.cpp (`llama-completion.exe`); existe una build MLX para Apple Silicon fuera de este repositorio.
- Latencia y throughput: 12,8 tok/s en M2 Ultra con Metal y 27,4 tok/s en el mismo equipo solo con CPU; en Windows CPU se estiman 4-8 tok/s para un 8B Q4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Tujia LLM 8B v0.2 (GGUF) | 8B | no disponible | research-preview | Pesos en ModelScope; metadatos en HF | Especializado en tujia; cuatro plantillas fijas |
| Qwen/Qwen3-8B (base) | 8B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face | Modelo generalista multilingue; conserva modo de razonamiento |
| Otros ajustes de lenguas de bajos recursos sobre Qwen3-8B | 8B | no disponible | variable | variable | No se dispone de datos comparativos verificados en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Es una "research preview": la model card remite a las advertencias de la model card principal y no garantiza robustez en produccion.
- El modelo solo funciona bien con las cuatro plantillas fijas documentadas; fuera de ellas el comportamiento no esta validado.
- La cuantizacion Q4_K_M puede aumentar la repeticion en frases largas respecto a bf16.
- Si no se incluye el bloque `<think>` vacio y cerrado en el prompt, la calidad de salida cae y Ollama muestra una seccion de pensamiento no deseada.
- Riesgo de alucinacion: no se documenta una evaluacion sistematica; al ser un modelo pequeno y especializado, las traducciones fuera del vocabulario de entrenamiento pueden ser incorrectas.
- Sesgos conocidos: no documentados en la informacion disponible.
- Limitaciones de idioma: solo zh, en y tujia; no se cubren otras lenguas.
- Restricciones de licencia: licencia "other" con nombre "research-preview"; el uso comercial no esta garantizado y debe consultarse el NOTICE en GitHub.
- El repositorio de Hugging Face solo contiene metadatos; los pesos reales deben descargarse de ModelScope, lo que anade una dependencia externa.

## Enlaces

- Hugging Face: https://huggingface.co/TujiaNLP/tujia-llm-8b-v0.2-gguf
- ModelScope (pesos GGUF): https://modelscope.cn/models/TujiaNLP/tujia-llm-8b-v0.2-gguf
- Licencia / NOTICE: https://github.com/ibaibing/tujia-llm/blob/main/NOTICE
- Repositorio GitHub del proyecto: https://github.com/ibaibing/tujia-llm
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Ollama (descarga): https://ollama.com/download
- llama.cpp (releases): https://github.com/ggml-org/llama.cpp/releases
