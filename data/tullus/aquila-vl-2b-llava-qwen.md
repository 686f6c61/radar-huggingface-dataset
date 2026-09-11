# TULLUS/Aquila-VL-2B-llava-qwen

## Resumen

Aquila-VL-2B es un modelo de vision-lenguaje (VLM) de aproximadamente 2,18 mil millones de parametros que combina el LLM Qwen2.5-1.5B-Instruct con la torre de vision SigLIP-so400m-patch14-384, siguiendo el framework LLaVA-OneVision. Lo desarrollo originalmente el equipo BAAI y se publico junto al dataset Infinity-MM y a un informe tecnico en octubre de 2024. La ficha que nos ocupa corresponde a una resubida del repositorio por parte del usuario TULLUS, con licencia Apache 2.0 y descargas registradas de cero en el momento de la consulta.

El modelo resuelve tareas de comprension de imagenes y respuesta a preguntas visuales (visual question answering) en un rango de parametros muy contenido, lo que permite desplegarlo en hardware de consumo. Su relevancia actual radica en que compite con alternativas del mismo tamano como Qwen2-VL-2B-Instruct, InternVL2-2B o MiniCPM-V-2, y en la evaluacion publicada por el autor obtiene la mejor media agregada (64,1) de ese grupo de comparacion, con ventajas notables en MMMU (47,4), MathVista (59,0) o ChartQA (76,5).

El entrenamiento se realizo sobre Infinity-MM, un conjunto de aproximadamente 40 millones de pares imagen-texto que mezcla datos de codigo abierto recogidos de internet con datos de instrucciones sinteticos generados por otros VLM. El modelo esta pensado para investigacion y aplicaciones de vision por computador con requisitos moderados de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje basada en LLaVA-OneVision: torre de vision SigLIP + proyector + LLM Qwen2.5 |
| Parametros totales | 2.178.969.120 (aproximadamente 2,18 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el LLM base Qwen2.5-1.5B-Instruct soporta hasta 32.768 tokens, pero la model card no especifica el contexto efectivo del VLM) |
| Tipos de cuantizacion | no se listan cuantizaciones oficiales; el repositorio publica pesos en safetensors (4,4 GB para 2,18B parametros, consistente con bf16) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

Aquila-VL-2B sigue la receta LLaVA-OneVision: un codificador visual SigLIP-so400m-patch14-384 que procesa las imagenes a 384 px, un proyector que traduce las representaciones visuales al espacio del LLM, y Qwen2.5-1.5B-Instruct como decodificador de lenguaje. Esta estructura de tres bloques es la habitual en la familia LLaVA y mantiene la interfaz de tokenizacion de imagenes mediante el token especial de imagen. El uso documentado requiere el codebase LLaVA-NeXT, con la funcion `load_pretrained_model` y `model_name = "llava_qwen"`.

El entrenamiento se apoyo en Infinity-MM, un dataset de aproximadamente 40 millones de pares imagen-texto que combina datos de codigo abierto recopilados de internet con datos de instrucciones sinteticos generados por modelos VLM de codigo abierto. Los tags del repositorio mencionan tambien Infinity-Instruct e Infinity-Preference, lo que sugiere un pipeline de ajuste supervisado seguido de optimizacion de preferencias, aunque la model card no detalla el numero exacto de tokens, la composicion por tarea ni si se aplico RLHF o DPO de forma explicita. Existen checkpoints intermedios publicados en BAAI/Aquila-VL-2B-Intermediate para analisis de las distintas fases de entrenamiento.

## Capacidades

- Generacion de texto e inferencia multimodal a partir de imagenes.
- Respuesta a preguntas visuales (visual question answering) en ingles y chino.
- Comprension de documentos, graficos y tablas: buenos resultados en ChartQA (76,5), DocVQA (85,0) y OCRBench (772).
- Razonamiento matematico sobre imagenes: MathVista 59,0, MathVerse 26,2, MathVision 18,4.
- Conocimiento cientifico multimodal: ScienceQA 95,2 y AI2D 75,0.
- Reconocimiento de texto en imagenes (OCR) para escenas, documentos e infografias.
- Razonamiento visual de sentido comun y evaluacion de alucinaciones (HallusionBench 43,0).
- Capacidades multilingues limitadas a ingles y chino; no se declara soporte de castellano.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico multi-paso.
- No se declara modo de razonamiento explicito (thinking mode), audio ni video mas alla de lo que permita el framework LLaVA-OneVision.

## Casos de uso

- Analisis de documentos escaneados: extraccion y sintesis de informacion de facturas, formularios o informes en ingles o chino, apoyandose en los 85,0 puntos de DocVQA y la capacidad OCR del modelo.
- Descripcion de imagenes para accesibilidad: generacion automatica de pies de foto y descripciones alternativas en un servicio web, con un coste de inferencia bajo gracias a los 2,18B parametros.
- Moderacion de contenido visual: clasificacion de imagenes subidas por usuarios y generacion de justificaciones textuales en un pipeline de moderacion.
- Asistencia educativa en ciencias: resolucion de ejercicios con diagramas, esquemas y graficos, aprovechando los 95,2 puntos en ScienceQA y los 75,0 en AI2D.
- Analisis de graficos y dashboards: extraccion de tendencias y valores a partir de capturas de paneles, con el respaldo del 76,5 en ChartQA.
- Investigacion academica en VLM: uso de los checkpoints intermedios y del dataset Infinity-MM para experimentos de ablacion y estudios de destilacion.
- Prototipado rapido en local: validacion de ideas de producto sobre vision-lenguaje en una unica GPU de consumo antes de escalar a modelos mayores.
- Etiquetado asistido de imagenes: generacion de anotaciones sinteticas para ampliar datasets propios, reutilizando el patron de datos sinteticos del propio Infinity-MM.

## Benchmarks y rendimiento

Resultados publicados en la model card, evaluados con VLMEvalKit. Los modelos de comparacion se midieron en entorno local, por lo que pueden diferir ligeramente de las cifras oficiales.

| Benchmark | MiniCPM-V-2 | InternVL2-2B | XinYuan-VL-2B | Qwen2-VL-2B-Instruct | Aquila-VL-2B |
|---|---|---|---|---|---|
| MMBench-EN test | 69,4 | 73,4 | 78,9 | 74,9 | 78,8 |
| MMBench-CN test | 65,9 | 70,9 | 76,1 | 73,9 | 76,4 |
| MMBench_V1.1 test | 65,2 | 69,7 | 75,4 | 72,7 | 75,2 |
| MMT-Bench test | 54,5 | 53,3 | 57,2 | 54,8 | 58,2 |
| RealWorldQA | 55,4 | 57,3 | 63,9 | 62,6 | 63,9 |
| HallusionBench | 36,8 | 38,1 | 36,0 | 41,5 | 43,0 |
| SEEDBench2 plus | 51,8 | 60,0 | 63,0 | 62,4 | 63,0 |
| LLaVABench | 66,1 | 64,8 | 42,4 | 52,5 | 68,4 |
| MMStar | 41,6 | 50,2 | 51,9 | 47,8 | 54,9 |
| POPE | 86,6 | 85,3 | 89,4 | 88,0 | 83,6 |
| MMVet | 44,0 | 41,1 | 42,7 | 50,7 | 44,3 |
| MMMU val | 39,6 | 34,9 | 43,6 | 41,7 | 47,4 |
| ScienceQA test | 80,4 | 94,1 | 86,6 | 78,1 | 95,2 |
| AI2D test | 64,8 | 74,4 | 74,2 | 74,6 | 75,0 |
| MathVista testmini | 39,0 | 45,0 | 47,1 | 47,9 | 59,0 |
| MathVerse testmini | 19,8 | 24,7 | 22,2 | 21,0 | 26,2 |
| MathVision | 15,4 | 12,6 | 16,3 | 17,5 | 18,4 |
| DocVQA test | 71,0 | 86,9 | 87,6 | 89,9 | 85,0 |
| InfoVQA test | 40,0 | 59,5 | 59,1 | 65,4 | 58,3 |
| ChartQA test | 59,6 | 71,4 | 57,1 | 73,5 | 76,5 |
| TextVQA val | 74,3 | 73,5 | 77,6 | 79,9 | 76,4 |
| OCRVQA testcore | 54,4 | 40,2 | 67,6 | 68,7 | 64,0 |
| VCR en easy | 27,6 | 51,6 | 67,7 | 68,3 | 70,0 |
| OCRBench | 613 | 784 | 782 | 810 | 772 |
| Media | 53,5 | 58,8 | 60,9 | 62,1 | 64,1 |

## Requisitos de hardware

- VRAM estimada en bf16: en torno a 5-6 GB solo para los pesos (2,18B parametros) mas el coste de activaciones y cache KV, que depende de la resolucion de imagen y la longitud de la secuencia.
- GPU recomendadas para produccion: A100 40/80 GB, H100, L40S o A10G para lotes grandes; para una sola inferencia, cualquier GPU con 8 GB o mas es suficiente.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090. En 8 GB (RTX 3070, RTX 4060) es ajustado pero viable con lotes pequenos.
- Cuantizacion: al no publicarse pesos GGUF o AWQ oficiales, la reduccion de memoria requiere conversion manual a 8 o 4 bits mediante herramientas externas.
- Opciones de despliegue: el uso documentado pasa por LLaVA-NeXT (`llava.model.builder`); los tags del repositorio indican compatibilidad con text-generation-inference y endpoints, aunque la arquitectura LLaVA no es la ruta estandar de vLLM, TGI u Ollama sin adaptaciones.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media en la evaluacion publicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aquila-VL-2B | 2,18B | no disponible | 64,1 | apache-2.0 | HuggingFace (BAAI y resubida TULLUS) |
| Qwen2-VL-2B-Instruct | no disponible en la informacion proporcionada | no disponible | 62,1 | no disponible en la informacion proporcionada | HuggingFace |
| XinYuan-VL-2B | no disponible en la informacion proporcionada | no disponible | 60,9 | no disponible en la informacion proporcionada | HuggingFace |
| InternVL2-2B | no disponible en la informacion proporcionada | no disponible | 58,8 | no disponible en la informacion proporcionada | HuggingFace |
| MiniCPM-V-2 | no disponible en la informacion proporcionada | no disponible | 53,5 | no disponible en la informacion proporcionada | HuggingFace |

Aquila-VL-2B lidera la media agregada, MMMU, MathVista, MathVerse, ChartQA, ScienceQA y LLaVABench, mientras que Qwen2-VL-2B-Instruct mantiene ventaja en DocVQA, InfoVQA, TextVQA, OCRVQA, OCRBench y MMVet, y XinYuan-VL-2B gana en POPE y MMBench-EN.

## Limitaciones y advertencias

- Riesgo de alucinacion: el resultado en POPE (83,6) es el mas bajo del grupo de comparacion, por detras de XinYuan-VL-2B (89,4) y Qwen2-VL-2B-Instruct (88,0), lo que indica mayor tendencia a describir objetos inexistentes.
- OCR y documentos: OCRBench (772) e InfoVQA (58,3) quedan por debajo de Qwen2-VL-2B-Instruct, por lo que la lectura de texto denso o infografias complejas no es su punto fuerte.
- Idiomas: solo se declaran ingles y chino; no hay soporte documentado de castellano ni de otras lenguas, lo que limita su uso en productos dirigidos al mercado hispanohablante.
- Contexto: la model card no especifica la ventana de contexto efectiva del VLM, un dato critico para planificar conversaciones multi-turno o documentos largos.
- Tool calling y agentes: no se documenta soporte de function calling ni razonamiento multi-paso, por lo que no es adecuado como nucleo de un agente autonomo.
- Dependencia de software: el uso previsto depende de LLaVA-NeXT, un codebase especifico que complica la integracion con servidores de inferencia estandar como vLLM u Ollama.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero conviene verificar las condiciones de los modelos base (Qwen2.5-1.5B-Instruct y SigLIP) y de los datasets empleados.
- Repositorio: la ficha analizada es una resubida del usuario TULLUS con cero descargas y cero valoraciones, sin garantias de mantenimiento; para produccion es preferible referenciar el repositorio original de BAAI.
- Fecha de publicacion de la resubida: la ficha indica creacion y actualizacion el 2026-09-11, un dato poco habitual que conviene contrastar.

## Enlaces

- Repositorio analizado (resubida): https://huggingface.co/TULLUS/Aquila-VL-2B-llava-qwen
- Repositorio original de BAAI: https://huggingface.co/BAAI/Aquila-VL-2B-llava-qwen
- Checkpoints intermedios: https://huggingface.co/BAAI/Aquila-VL-2B-Intermediate
- Dataset Infinity-MM: https://huggingface.co/datasets/BAAI/Infinity-MM
- Informe tecnico (arXiv): https://arxiv.org/abs/2410.18558
- Framework LLaVA-OneVision: https://llava-vl.github.io/blog/2024-08-05-llava-onevision/
- Codebase LLaVA-NeXT: https://github.com/LLaVA-VL/LLaVA-NeXT
- Herramienta de evaluacion VLMEvalKit: https://github.com/open-compass/VLMEvalKit
- LLM base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Torre de vision SigLIP-so400m-patch14-384: https://huggingface.co/google/siglip-so400m-patch14-384
