# velugu/lippye0.1

## Resumen

lippye0.1 es un modelo multimodal (texto e imagen) publicado por el usuario velugu en HuggingFace, distribuido exclusivamente en formato GGUF y pensado para su uso con llama.cpp. Segun los nombres de los ficheros incluidos en el repositorio (`Qwen3.5-0.8B.Q4_K_M.gguf` y `Qwen3.5-0.8B.BF16-mmproj.gguf`), se trata de una conversion a GGUF de un modelo base identificado como Qwen3.5-0.8B, con un proyector visual separado (mmproj) para el tratamiento de imagenes. El recuento real de parametros reportado en los pesos safetensors es de 752.393.024 (aproximadamente 0,75 mil millones).

El modelo resuelve el problema de ejecutar inferencia multimodal en hardware muy limitado: con menos de mil millones de parametros, cabe en CPU, en GPUs de gama de entrada y en dispositivos con pocos gigabytes de memoria, manteniendo la capacidad de procesar imagenes junto a texto. La conversion se ha realizado con Unsloth, y el repositorio incluye la etiqueta `endpoints_compatible`, lo que sugiere compatibilidad con despliegues tipo endpoint, ademas de la etiqueta `conversational`.

Es relevante ahora porque la franja de modelos multimodales sub-1B es escasa y habilita casos de uso en el borde (edge computing), prototipado rapido y aplicaciones de vision por computador de bajo coste sin depender de APIs en la nube. La ficha publica no incluye informacion sobre licencia, idiomas, contexto ni datos de entrenamiento, por lo que buena parte de las especificaciones quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; modelo multimodal (texto + imagen) con decodificador de lenguaje y proyector visual (mmproj) independiente, segun los ficheros publicados |
| Parametros totales | 752.393.024 (aproximadamente 0,75 mil millones) |
| Parametros activos | No aplica (no se ha indicado que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M y BF16 (fichero de pesos); mmproj en BF16 |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (llama.cpp): `Qwen3.5-0.8B.Q4_K_M.gguf` y `Qwen3.5-0.8B.BF16-mmproj.gguf` |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna, el proceso de entrenamiento, el volumen de tokens, la composicion del dataset ni el uso de tecnicas de alineacion como RLHF o DPO. Los unicos datos tecnicos disponibles provienen de la model card y de los nombres de los ficheros: se trata de una conversion al formato GGUF realizada con Unsloth a partir de un modelo identificado como Qwen3.5-0.8B, con dos artefactos separados, uno para el modelo de lenguaje cuantizado y otro para el proyector visual multimodal (`mmproj`). La etiqueta `vision-language-model` confirma el caracter multimodal, y la etiqueta `imatrix` sugiere que la cuantizacion Q4_K_M se ha generado empleando una matriz de importancia (importance matrix), una tecnica habitual para reducir la perdida de calidad en cuantizaciones agresivas.

Al estar distribuido en GGUF, el modelo esta pensado para ejecutarse en llama.cpp, que soporta arquitecturas basadas en transformadores con decodificacion autorregresiva y, en el caso multimodal, mediante el binario `llama-mtmd-cli` para la ruta de vision. La innovacion practica del repositorio es precisamente el empaquetado: permite ejecutar un VLM sub-1B con un solo comando, sin pasos de conversion adicionales por parte del usuario.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta `conversational` del repositorio.
- Procesamiento de imagenes junto con texto (modelo de vision-lenguaje), gracias al fichero `mmproj` y al binario `llama-mtmd-cli`.
- Inferencia en local mediante llama.cpp, con soporte de plantilla de chat a traves del flag `--jinja`.
- Uso potencial como endpoint, segun la etiqueta `endpoints_compatible` (no se detalla el servidor ni el protocolo concreto).
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada; el flag `--jinja` activa la plantilla de chat del modelo, que en llama.cpp puede incluir definiciones de herramientas si la plantilla las declara, pero no se especifica en la model card.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Modo de razonamiento explicito (thinking), audio u otras modalidades: no disponible.

## Casos de uso

- Descripcion de imagenes en el borde: el modelo puede generar pies de foto o descripciones en dispositivos sin GPU dedicada, ya que el fichero Q4_K_M y el proyector visual caben en menos de un gigabyte de pesos y se ejecutan con `llama-mtmd-cli`.
- Extraccion de informacion de documentos escaneados: lectura de facturas, tickets o formularios con preguntas dirigidas en lenguaje natural, procesando la imagen y devolviendo texto estructurado en un equipo de oficina convencional.
- Prototipado rapido de asistentes visuales: desarrolladores que necesiten validar una idea de producto multimodal antes de escalar a modelos de mayor tamano pueden usar este GGUF por su bajo coste de despliegue.
- Etiquetado y clasificacion por lotes de imagenes: en pipelines de cura de datos, el modelo puede generar etiquetas o resumenes textuales de imagenes sin incurrir en costes de API externa.
- Asistencia de accesibilidad: descripcion de contenido visual para personas con discapacidad visual en aplicaciones de escritorio o moviles con recursos limitados.
- Educacion y demostraciones: ejemplos didacticos de vision-lenguaje que se ejecutan en el portatil del alumno sin necesidad de infraestructura en la nube.
- Preprocesado en sistemas embebidos o mini-PC: verificacion visual sencilla en instalaciones industriales o domoticas donde no cabe un modelo de varios miles de millones de parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluacion, y los resultados de busqueda web consultados no contienen referencias al modelo.

## Requisitos de hardware

- VRAM/RAM estimada para el fichero Q4_K_M: en torno a 0,5-0,7 GB de pesos, mas el proyector visual y la cache KV; con overhead, aproximadamente 1-1,5 GB de memoria. Cifras estimadas a partir del recuento de parametros y del tamano del repositorio (0,7 GB), no confirmadas por el autor.
- VRAM/RAM estimada para BF16: aproximadamente 1,5 GB de pesos mas el `mmproj` en BF16 y la cache KV; del orden de 2-2,5 GB con overhead. Estimacion, no dato oficial.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060, RTX 4090); el modelo tambien puede ejecutarse integramente en CPU, por lo que no requiere A100 ni H100.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada moderna y en muchas integradas, dado el reducido tamano de los pesos.
- Opciones de despliegue: llama.cpp (binarios `llama-cli` para texto y `llama-mtmd-cli` para multimodal, ambos con `--jinja`), servidor de llama.cpp para exponer una API compatible con OpenAI, y cualquier front-end que consuma GGUF con soporte de proyector visual. La compatibilidad con Ollama, LM Studio, vLLM o TGI no esta confirmada en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Comparativa orientativa con alternativas de la misma franja (modelos de vision-lenguaje de menos de 2.000 millones de parametros). Los datos de modelos de terceros proceden de informacion publica general y deben verificarse en sus repositorios; los campos no confirmados se marcan como no disponibles.

| Modelo | Parametros | Contexto | Vision | Licencia | Formato GGUF |
|---|---|---|---|---|---|
| lippye0.1 (base Qwen3.5-0.8B) | 0,75 B | No disponible | Si | No disponible | Si |
| SmolVLM-500M-Instruct | ~0,5 B | No disponible | Si | Apache-2.0 | Si (soporte en llama.cpp) |
| LLaVA-OneVision-Qwen2-0.5B | ~0,5 B (LM) | No disponible | Si | Apache-2.0 | Si |
| moondream2 | ~1,8 B | No disponible | Si | Apache-2.0 | Si |

No se dispone de datos de rendimiento comparativo (benchmarks) para lippye0.1, por lo que la comparacion se limita a parametros, licencia, modalidad y disponibilidad de formato.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; el autor no documenta evaluaciones de sesgo ni composicion del dataset.
- Riesgo de alucinacion: elevado en un modelo de este tamano, especialmente en tareas de lectura precisa de texto en imagenes (OCR) y en preguntas sobre detalles finos de la imagen.
- Limitaciones de contexto e idioma: se desconoce la ventana de contexto y los idiomas soportados; conviene validar el comportamiento en castellano antes de usarlo en produccion.
- Licencia: no declarada en el repositorio. Al ser una conversion de un modelo base de terceros, la licencia aplicable probablemente dependa de la del modelo original (identificado en los ficheros como Qwen3.5-0.8B), pero este extremo no esta confirmado. No se recomienda uso comercial sin aclarar antes la licencia con el autor.
- Trazabilidad limitada: el repositorio tiene 0 descargas y 0 likes, fue creado y actualizado el mismo dia (10 de septiembre de 2026) y no incluye pipeline declarado, por lo que se trata de una publicacion sinvalidacion comunitaria.
- Riesgo de calidad de cuantizacion: aunque la etiqueta `imatrix` sugiere un proceso cuidado, la cuantizacion Q4_K_M puede degradar tareas de percepcion fina (texto pequeno, detalles de imagen).
- La busqueda web no devolvio ningun resultado relacionado con el modelo, por lo que no existe documentacion externa, paper ni evaluacion independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/velugu/lippye0.1
- Unsloth (herramienta de conversion citada en la model card): https://github.com/unslothai/unsloth
- llama.cpp (runtime necesario para los ficheros GGUF): https://github.com/ggml-org/llama.cpp
- No se han encontrado papers, blogs, repositorios ni demos adicionales en los resultados de busqueda web; los resultados obtenidos correspondian a paginas no relacionadas con el modelo (sistema de peaje electronico polaco e-TOLL).
