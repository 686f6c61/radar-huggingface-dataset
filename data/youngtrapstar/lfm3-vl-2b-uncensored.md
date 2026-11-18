# YoungTrapStar/LFM3-VL-2B-Uncensored

## Resumen

LFM3-VL-2B-Uncensored es un ajuste fino del modelo vision-lenguaje LFM3-VL-2B de Liquid AI, publicado por el usuario YoungTrapStar (la model card atribuye el trabajo al perfil rSalone). Se trata de una versión "abliterated": se ha eliminado la dirección de rechazo de los pesos de la parte lingüística del modelo mediante la técnica de abliteration, de modo que el modelo deja de negarse a responder tanto a peticiones de texto como a peticiones formuladas dentro de una imagen. El codificador visual y el proyector son idénticos al modelo original; solo se ha modificado el decodificador de lenguaje.

El modelo conserva la arquitectura del LFM3-VL-2B original (familia LFM3 de Liquid AI, transformer con codificador visual y proyector multimodal) y un total de 1.918.181.888 parámetros en BF16. Mantiene el modo de razonamiento ("thinking") activado por defecto y las mismas capacidades multimodales del original: entrada de imagen más texto y salida de texto.

Su relevancia es doble: por un lado, demuestra que la abliteration aplicada a un modelo vision-lenguaje funciona mejor midiendo de nuevo la dirección de rechazo sobre el propio modelo VL que reutilizando la dirección calculada en el modelo de texto de la misma familia; por otro, ofrece una variante sin rechazos con cuantizaciones GGUF listas para llama.cpp. Es un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, y su licencia deriva de la LFM Open License v1.0 del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) de la familia LFM3, con codificador visual y proyector; parte lingüística de 24 capas y 48 matrices de salida por bloque |
| Parametros totales | 1.918.181.888 (BF16) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (configuración de ejemplo en llama.cpp con `-c 32768`); no se especifica el máximo oficial en la información disponible |
| Tipos de cuantizacion | GGUF Q2_K (0,75 GB), Q4_K_M (1,10 GB), Q8_0 (1,85 GB), BF16 (3,47 GB); safetensors BF16 (3,84 GB) |
| Idiomas soportados | No disponible |
| Licencia | LFM Open License v1.0 (`license: other`, `license_name: lfm-open-license-v1.0`) |
| Formato de pesos | safetensors (BF16) y GGUF (Q2_K, Q4_K_M, Q8_0, BF16) más `mmproj` BF16 para el codificador visual |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-VL-2B, un modelo vision-lenguaje con codificador de imagen, proyector y decodificador de lenguaje. La parte lingüística tiene 24 capas y 48 matrices de salida (una por bloque de capa y por subcapa); su arquitectura coincide tensor a tensor con la de LFM3-1.7B (286 tensores con los mismos nombres y formas), aunque los valores de los pesos difieren (similitud coseno mediana de 0,888 por tensor, comparando el primer MiB de cada tensor). El ajuste no reentrena el modelo: aplica abliteration, es decir, calcula una dirección de rechazo como diferencia entre los estados ocultos medios de prompts censurados y prompts ordinarios, y la "cuece" (resta) en las matrices de salida seleccionadas.

El autor probó dos variantes. La primera reutiliza la dirección medida en LFM3-1.7B y la aplica en los 38 puntos seleccionados para ese modelo. La segunda vuelve a medir la dirección sobre el modelo VL con el mismo método y la aplica en 40 puntos elegidos con la misma regla (37 coinciden con los del 1.7B); la dirección remedida tiene una similitud coseno mediana de 0,65 con la del 1.7B en las 48 posiciones. La versión publicada es la segunda, porque la primera seguía rechazando 13 de 200 prompts de HarmBench, mientras que la remedida no rechazó ninguno. El codificador visual y el proyector no se modifican. No se detalla la composición del dataset de ajuste ni si hubo RLHF o DPO adicionales: el proceso es puramente de edición de pesos.

## Capacidades

- Generación de texto e imagen-a-texto: acepta imágenes junto con instrucciones de texto y produce descripciones o respuestas.
- Razonamiento con modo "thinking" activado por defecto, igual que el modelo original.
- Razonamiento matemático y de conocimiento: GSM8K y GPQA Diamond se mantienen o mejoran ligeramente respecto al original.
- Respuesta sin rechazos tanto a peticiones de texto como a peticiones cuya instrucción clave aparece dentro de una imagen.
- Uso agéntico con herramientas: la model card menciona uso con herramientas (por ejemplo, OpenCode) y recomienda temperatura 0,3 para ese escenario.
- Soporte de API compatible con OpenAI en llama.cpp, incluyendo envío de imágenes mediante `image_url`.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre seguridad y alineación: comparar el comportamiento del modelo original y el abliterated en HarmBench y MM-SafetyBench permite estudiar cómo se distribuye la dirección de rechazo en modelos multimodales y qué se pierde al eliminarla.
- Evaluación de robustez multimodal: usar MM-SafetyBench, donde la instrucción sensible solo aparece en la imagen, para medir si un pipeline de moderación detecta contenido que el modelo de texto no vería.
- Generación de descripciones de imágenes sin filtros: en entornos de investigación o datasets internos, obtener descripciones detalladas de imágenes que el modelo original rechazaría por su contenido.
- Asistente local de visión en consumer GPU: con la cuantización Q4_K_M (1,10 GB) más el `mmproj` BF16 (0,38 GB) cabe en GPUs de gama media y se puede servir con llama.cpp y `llama-server` en una API compatible con OpenAI.
- Prototipado de agentes con herramientas: la recomendación de temperatura 0,3 para uso agéntico sugiere su empleo en flujos de búsqueda de archivos o llamadas a herramientas, aunque el propio autor advierte de repeticiones de llamadas a temperatura 0,1.
- Experimentos de cuantización: al publicar Q2_K, Q4_K_M, Q8_0 y BF16 generados con `llama-quantize` sin imatrix, sirve para medir la degradación de un modelo VL pequeño bajo cuantización agresiva.
- Docencia y demostraciones: un modelo de 2B parámetros con visión y modo thinking es manejable para explicar arquitecturas multimodales y técnicas de edición de pesos en un portátil con GPU.

## Benchmarks y rendimiento

Datos publicados en la model card, ejecutados en transformers con BF16, thinking activado y una sola ejecución por prueba, sobre una RTX 5070 Ti (16 GB):

| Benchmark | Original | Este modelo |
|---|---|---|
| HarmBench (texto), respondidas sin rechazo de 200 | 9 | 173 |
| MM-SafetyBench (imagen), respondidas sin rechazo de 200 | 101 | 185 |
| GSM8K, correctas de 100 | 90 | 91 |
| GPQA Diamond, correctas de 198 | 42 | 49 |

El autor también reporta, para la variante intermedia que reutiliza la dirección del 1.7B: 13 rechazos de 200 en HarmBench, 90 correctas en GSM8K y 41 en GPQA Diamond. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: unos 3,84 GB en safetensors BF16; 3,47 GB en GGUF BF16 más 0,38 GB del `mmproj`; 1,85 GB en Q8_0; 1,10 GB en Q4_K_M; 0,75 GB en Q2_K. A estas cifras hay que sumar la caché KV para el contexto elegido.
- GPU recomendadas: el autor validó el modelo en una RTX 5070 Ti de 16 GB; por tamaño, cualquier GPU con 8 GB o más debería alojar las cuantizaciones Q4_K_M y Q8_0, y las de 16 GB o más el BF16 completo.
- Cabe en GPU consumer: sí, en todas las cuantizaciones GGUF; el BF16 completo requiere al menos 8 GB de VRAM libre para pesos y contexto moderado.
- Opciones de despliegue: llama.cpp (`llama-server` con `--mmproj`, `-ngl 99`, `-fa on`, `--jinja`) y transformers (`AutoModelForImageTextToText` con `trust_remote_code=True`). No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles. El autor solo indica que los GGUF se comprobaron para cargar en llama.cpp (CUDA, build 12004) y describir correctamente una imagen de prueba, sin benchmark.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-VL-2B-Uncensored (este) | 1.918 M | 32.768 en el ejemplo de llama.cpp | Sí | LFM Open License v1.0 | Abliterated; sin rechazos en HarmBench y MM-SafetyBench según el autor |
| LiquidAI/LFM3-VL-2B | 1.918 M (mismo tamano) | No disponible | Sí | LFM Open License v1.0 | Modelo base; rechaza 189 de 200 en HarmBench y 77 de 200 en MM-SafetyBench |
| rSalone/LFM3-1.7B-uncensored-abl38 | No disponible | No disponible | No | No disponible | Variante de texto de la misma familia; origen de la dirección de rechazo reutilizada |

No se dispone de datos de benchmarks de otros modelos comparables en la información proporcionada, por lo que no se incluye una comparación de rendimiento con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- La abliteration elimina la negativa a responder, no la capacidad de generar contenido dañino de forma controlada: el modelo puede producir salidas inseguras, ofensivas o ilegales. No es apto para producción orientada al público sin una capa de moderación externa.
- La licencia LFM Open License v1.0 es la del modelo base y puede imponer restricciones al uso comercial; hay que revisar el archivo LICENSE del repositorio antes de desplegarlo.
- El rendimiento se midió con una sola ejecución por benchmark y sin repeticiones, por lo que las diferencias de 1 punto en GSM8K (90 frente a 91) o de 7 en GPQA Diamond (42 frente a 49) no deben interpretarse como mejoras estadísticamente significativas.
- El autor advierte de un comportamiento inestable en uso agéntico a temperatura 0,1: el modelo repite llamadas a herramientas que no devuelven resultados y acaba respondiendo cosas ajenas a la petición; a 0,3 es menos frecuente, pero no se ha medido.
- Los GGUF no se evaluaron con benchmarks, solo se comprobó que cargan y describen una imagen; el rendimiento en cuantizaciones Q2_K y Q4_K_M puede degradarse respecto al BF16.
- El repositorio tiene cero descargas y cero likes, y la model card cita el perfil rSalone mientras el repositorio pertenece a YoungTrapStar; conviene verificar la procedencia y la integridad de los pesos antes de usarlos.
- No se especifican los idiomas soportados ni sesgos conocidos del modelo base en la información disponible.
- Riesgo de alucinación: no cuantificado en la información proporcionada; es esperable en un modelo de 2B parámetros, especialmente en tareas de conocimiento factual y en GPQA Diamond, donde acierta 49 de 198.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YoungTrapStar/LFM3-VL-2B-Uncensored
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Variante de texto de referencia: https://huggingface.co/rSalone/LFM3-1.7B-uncensored-abl38
- Repositorio citado en la model card para descarga: https://huggingface.co/rSalone/LFM3-VL-2B-uncensored
- Papers referenciados en las etiquetas: arxiv:2406.11717, arxiv:2402.04249, arxiv:2311.17600, arxiv:2110.14168, arxiv:2311.12022 (disponibles en https://arxiv.org/abs/<id>)
