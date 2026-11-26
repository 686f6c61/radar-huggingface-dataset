# tencent/WePocketModel1.0-4B-GGUF

## Resumen

WePocketModel 1.0 4B GGUF es la distribucion cuantizada en formato GGUF del checkpoint multimodal de 4B de la familia WePocketModel (WePM), desarrollada por WeChat AI (Tencent) para aplicaciones que se ejecutan en dispositivo. El modelo comparte un unico backbone de lenguaje y un codificador de vision para cubrir tres tareas distintas: generacion de texto condicionada por texto e imagen, generacion de embeddings multimodales normalizados en L2 y emision de decisiones estructuradas (elecciones, puntuaciones y juicios binarios). Esta variante concreta esta pensada para inferencia en CPU mediante un runtime propio construido sobre una revision fijada de llama.cpp.

El interes practico del modelo reside en su empaquetado: separa los pesos de lenguaje (cuantizados a Q4_K_M o BF16) de los tensores compartidos de vision y de tarea, que se mantienen en BF16 y se computan en FP32. Con Q4_K_M el bundle completo ocupa 3,42 GB en disco, lo que lo situa en el rango de equipos de consumo sin GPU dedicada. Los embeddings soportan Matryoshka Representation Learning (MRL), permitiendo truncar la dimension a 64, 128, 256, 512, 1024 o 2048 sin reentrenar, lo que facilita el almacenamiento y la busqueda vectorial en entornos con recursos limitados.

El modelo base cuenta con 4.205.751.296 parametros y se distribuye bajo licencia Apache 2.0 tanto en pesos como en codigo de inferencia. La model card no detalla la longitud de contexto, los idiomas soportados ni resultados numericos de benchmarks, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language con backbone de lenguaje compartido y codificador de vision; etiqueta `qwen3_5` en Hugging Face |
| Parametros totales | 4.205.751.296 (4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (por defecto) y BF16 para pesos de lenguaje; vision y cabezas de tarea en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (pesos y codigo de inferencia) |
| Formato de pesos | GGUF (`language-Q4_K_M.gguf`, `language-BF16.gguf`, `multimodal-BF16.gguf`) |
| Dimension de embedding | 2048 completa; truncable a 64, 128, 256, 512, 1024 via MRL |
| Tamano en disco | 3,42 GB (Q4_K_M + multimodal BF16); 9,14 GB (BF16 + multimodal BF16) |
| Runtime | `libwepm_gguf` sobre llama.cpp fijado; codificador de vision y cabezas en runtime Python |

## Arquitectura y entrenamiento

La familia WePM emplea un backbone compartido y un unico codificador de vision que alimentan tres cabezas funcionales: generacion autoregresiva de texto, proyeccion de embeddings multimodales y cabezas de decision estructurada. La etiqueta `qwen3_5` en el repositorio sugiere una base derivada de la familia Qwen 3.5, aunque la model card no documenta la arquitectura interna con detalle. El checkpoint de 4B produce embeddings de 2048 dimensiones, normalizados en L2 por el runtime, y admite truncamiento Matryoshka a 64, 128, 256, 512 o 1024 dimensiones.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similares. Tampoco se detalla el proceso de alineacion. La innovacion tecnica documentada es el empaquetado para CPU: el runtime separa la ejecucion del backbone de lenguaje (llama.cpp) de la del codificador de vision y las cabezas (Python), y mantiene los tensores compartidos en BF16 computados en FP32 para preservar la calidad de las representaciones multimodales, mientras solo los pesos de lenguaje se cuantizan.

## Capacidades

- Generacion de texto a partir de texto e imagenes (pipeline `image-text-to-text`), incluyendo entradas intercaladas de imagen y texto.
- Generacion de embeddings multimodales normalizados en L2 con dimension configurable mediante MRL (64 a 2048).
- Decisiones estructuradas: eleccion entre opciones, asignacion de puntuaciones y juicios binarios.
- Procesamiento multimodal conjunto en un unico modelo, sin necesidad de cargar modulos separados para retrieval y generacion.
- Ejecucion en CPU sin GPU dedicada mediante el runtime `libwepm_gguf`.
- Soporte de plantilla de chat y procesador incluidos en el bundle (`bundle.json`, config, tokenizer, processor, chat template).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, audio o vision adicional: solo vision, segun la documentacion.

## Casos de uso

- Busqueda multimodal en dispositivo: generar embeddings de imagen y texto con dimensiones truncadas a 256 o 512 para indexar y recuperar productos, capturas o fotos en un catalogo local sin enviar datos a la nube; el soporte MRL reduce el coste de almacenamiento del indice vectorial.
- Clasificacion y filtrado de imagenes en el borde: usar las cabezas de decision para emitir juicios binarios o puntuaciones sobre imagenes capturadas por la camara de un movil o un dispositivo IoT, con umbrales validados por el desarrollador antes de disparar acciones.
- Asistente conversacional local con contexto visual: mantener conversaciones multi-turno en las que el usuario adjunta imagenes, aprovechando la plantilla de chat incluida y la generacion condicionada por imagen en CPU.
- Moderacion de contenido asistida: combinar la generacion de texto con las decisiones estructuradas para prefiltrar contenido y derivar solo los casos dudosos a un modelo mayor en servidor.
- Deduplicacion y agrupacion de imagenes: calcular embeddings de 128 o 256 dimensiones para detectar near-duplicates en galerias fotograficas locales mediante similitud coseno.
- Prototipado de pipelines RAG multimodales: usar el mismo bundle para generar respuestas y embeddings, simplificando el despliegue en entornos de desarrollo sin GPU y facilitando la iteracion sobre la calidad de recuperacion.
- Evaluacion de decisiones automatizadas en local: ejecutar el modelo como juez binario o comparador de opciones en pipelines de validacion, con la advertencia de validar las decisiones estructuradas antes de que activen acciones.

## Benchmarks y rendimiento

La model card incluye una imagen de comparacion de benchmarks de la familia WePM en tareas de embedding, generacion y decision, pero no se proporcionan los valores numericos en el texto disponible.

No se han publicado resultados de benchmarks numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para el bundle Q4_K_M, disenado para CPU; el consumo de memoria en tiempo de ejecucion depende de la variante, las entradas, el tamano de contexto y el overhead del backend.
- Tamano en disco: 3,42 GB con Q4_K_M y 9,14 GB con BF16 (ambos incluyen `multimodal-BF16.gguf`).
- GPU recomendadas: no se documentan; el runtime oficial es de CPU. No se confirma soporte de aceleracion por GPU en la informacion proporcionada.
- Cabe en equipos de consumo: si, en el caso de Q4_K_M, por su tamano de 3,42 GB en disco; el requisito real de RAM no se especifica.
- Opciones de despliegue: runtime propio `libwepm_gguf` (basado en una revision fijada de llama.cpp) mas `inference/infer_cpu.py` para tareas de generacion, embedding y decision. No se documenta soporte de vLLM, TGI, Ollama ni llama.cpp estandar.
- Requisitos de compilacion: Python 3.10-3.13, Git, CMake 3.20 o superior y compilador C++17; PyTorch 2.10.0 y torchvision 0.25.0 en variante CPU para el runtime Python.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Embeddings | Licencia | Formato |
|---|---|---|---|---|---|---|
| WePocketModel 1.0 4B GGUF | 4B | no disponible | Si (imagen-texto) | Si, MRL 64-2048 | Apache 2.0 | GGUF |
| WePocketModel 1.0 2B GGUF | 2B | no disponible | Si (imagen-texto) | Si (familia WePM) | Apache 2.0 | GGUF |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card solo referencia las variantes 2B y 4B de la propia familia WePM (safetensors y GGUF). No se dispone de datos de rendimiento ni de especificaciones de modelos competidores en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al ser un modelo derivado de una base tipo Qwen, es razonable esperar sesgos heredados del corpus de entrenamiento, pero no hay evidencia publicada en la informacion disponible.
- Riesgo de alucinacion no cuantificado; la documentacion recomienda evaluar la calidad de las salidas en entradas representativas.
- Las decisiones estructuradas deben validarse antes de usarlas para disparar acciones; el modelo no garantiza correccion en juicios binarios o puntuaciones.
- No se especifican idiomas soportados ni longitud de contexto, lo que impide garantizar cobertura multilingue o ventanas largas en produccion.
- El runtime oficial es de CPU y esta acoplado a una revision fijada de llama.cpp; no se confirma compatibilidad con ecosistemas estandar como Ollama o vLLM, lo que limita la portabilidad.
- La cuantizacion solo afecta a los pesos de lenguaje; los tensores de vision y tarea permanecen en BF16 y se computan en FP32, de modo que el ahorro de memoria es parcial.
- Licencia Apache 2.0 permite uso comercial, pero los componentes de terceros conservan sus licencias originales y deben revisarse por separado.
- El modelo base (safetensors) es el artefacto de referencia para fine-tuning; esta variante GGUF esta pensada para inferencia y no se documenta como apta para reentrenamiento.

## Enlaces

- Hugging Face (GGUF 4B): https://huggingface.co/tencent/WePocketModel1.0-4B-GGUF
- Hugging Face (4B safetensors): https://huggingface.co/tencent/WePocketModel1.0-4B
- Hugging Face (2B safetensors): https://huggingface.co/tencent/WePocketModel1.0-2B
- Hugging Face (2B GGUF): https://huggingface.co/tencent/WePocketModel1.0-2B-GGUF
- Repositorio GitHub: https://github.com/Tencent/WePocketModel
- Guia de inferencia GGUF en CPU: https://github.com/Tencent/WePocketModel/blob/main/inference/README.md#gguf-on-cpu
- Licencia del codigo: https://github.com/Tencent/WePocketModel/blob/main/LICENSE
- Paper referenciado (arXiv 2611.27365): no disponible como enlace directo en la informacion proporcionada
