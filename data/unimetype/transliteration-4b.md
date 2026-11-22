# UnimeType/Transliteration-4B

## Resumen

UnimeType Transliteration 4B es un modelo de lenguaje especializado en transliteración y conversión de escritura, desarrollado por UnimeType. Su función es convertir texto escrito en caracteres latinos (pinyin, romaji, hindi romanizado, hinglish y arabizi) a su sistema de escritura nativo correspondiente (chino simplificado, japonés, devanagari y árabe), preservando en su lugar elementos como palabras en inglés, nombres de producto, URLs, código, números, puntuación y emoji.

El modelo parte de Qwen/Qwen3.5-4B mediante fine-tuning y se distribuye principalmente en formato MLX de 6 bits (cuantización afín, group size 64), con un tamaño de archivo de 3,42 GB y 4.205.751.296 parámetros. Está pensado para ejecutarse en Macs con Apple Silicon mediante MLX-LM o en runtimes compatibles como LM Studio, y su caso de uso central es la función Convert de la aplicación de teclado UnimeType.

Es relevante porque aborda un problema práctico y mal cubierto por los modelos generalistas: la escritura mixta en conversaciones reales, donde el usuario alterna texto romanizado con términos en inglés y código. La model card advierte de que existe una generación posterior (2.0 v2.1) con mejores métricas, por lo que este repositorio debe considerarse la versión 1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5-4B); detalles de atención no disponibles |
| Parametros totales | 4.205.751.296 |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 2048 tokens usados para validacion; contexto maximo nativo no disponible |
| Tipos de cuantizacion | MLX 6-bit afín (group size 64); GGUF Q8_0; safetensors en coma flotante estandar |
| Idiomas soportados | en, zh, ja, hi, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (repo principal), safetensors, GGUF Q8_0 (repos separados) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de Qwen/Qwen3.5-4B, un transformer decoder-only de la familia Qwen3.5 con aproximadamente 4.200 millones de parámetros. La model card no detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron fases de RLHF o DPO; esa información no está disponible. La especialización se orienta a una tarea única de conversión de escritura con preservación de segmentos que no deben transformarse.

La innovación principal no es arquitectónica sino de comportamiento: el modelo recibe un idioma objetivo (chinese, japanese, hindi o arabic) junto con el texto original y devuelve directamente el texto convertido, sin modo de razonamiento activado, con temperatura 0 y un máximo de 128 tokens de salida para mensajes cortos. El diseño prioriza la fidelidad estricta del texto final, incluyendo espaciado, puntuación y código, frente a la generación libre.

## Capacidades

- Conversión de pinyin (con y sin tonos) a caracteres chinos simplificados.
- Conversión de romaji a japonés con mezcla de kanji, hiragana y katakana.
- Conversión de hindi romanizado e hinglish a devanagari, preservando palabras en inglés.
- Conversión de arabizi y árabe romanizado conversacional a escritura árabe, preservando inglés.
- Preservación de términos en inglés, nombres de producto, vocabulario técnico, URLs, direcciones de correo y fragmentos de código.
- Mantenimiento de puntuación, saltos de línea, Markdown, números y emoji.
- Detección implícita de texto que ya está en el sistema de escritura objetivo, que debe devolverse sin cambios.
- Generación de texto conversacional (pipeline text-generation), aunque no es su función principal.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking según la información disponible; de hecho, la model card recomienda desactivar el razonamiento.

## Casos de uso

- Teclados móviles y de escritorio: integración en la función Convert de la app UnimeType para que el usuario escriba en latín y obtenga el sistema de escritura deseado en iPhone, iPad, Android, Mac y Windows (beta).
- Mensajería multilingüe: conversión de mensajes cortos de chat con mezcla de inglés y texto romanizado, gracias al ajuste recomendado de 128 tokens de salida para mensajes breves.
- Redacción de correos y notas con terminología técnica: el modelo preserva nombres de producto, URLs y fragmentos de código, lo que permite convertir el cuerpo romanizado sin romper referencias técnicas.
- Localización de contenido para comunidades de la diáspora: usuarios que escriben hinglish o arabizi pueden generar texto en devanagari o árabe para publicaciones en redes y foros.
- Procesamiento por lotes de entradas de usuario: normalización de texto romanizado en pipelines de datos antes de indexación o análisis, ejecutando el modelo en local sobre Apple Silicon con MLX.
- Herramientas de accesibilidad y aprendizaje de idiomas: conversión asistida de pinyin a caracteres para estudiantes de chino, o de romaji a japonés para principiantes, con revisión humana del resultado.
- Despliegue en estaciones de trabajo sin GPU dedicada: al caber en 3,42 GB en formato MLX 6-bit, puede ejecutarse en Macs con Apple Silicon mediante MLX-LM o LM Studio.

## Benchmarks y rendimiento

La model card publica una evaluación histórica con coincidencia exacta del texto final (un resultado solo pasa si la salida completa coincide con una respuesta aceptada, incluidos inglés preservado, puntuación, código y espaciado):

| Runtime | Suite de conversión cotidiana | Suite multilingüe reservada |
|---|---:|---:|
| MLX directo | 98 / 127 | 57 / 104 |
| LM Studio | 94 / 127 | 57 / 104 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card indica que la generación 2.0 v2.1 alcanza un 88,4 % de precisión estricta en cuatro idiomas y un 93,2 % de precisión por carácter en frases largas multi-cláusula, con una mejora de +32,8 % sobre v1.0, pero no se aportan los valores absolutos de v1.0 correspondientes a esas métricas.

## Requisitos de hardware

- VRAM/espacio en disco: el archivo MLX 6-bit ocupa 3,42 GB; el repositorio completo, 6,9 GB. En GPUs convencionales, una cuantización de 4 bits de un modelo de 4B requiere aproximadamente 2,5-3 GB de VRAM, y en FP16 en torno a 8,5 GB, aunque estas estimaciones no están confirmadas por el autor.
- GPU recomendadas: el formato principal es MLX, orientado a Apple Silicon (chips M1, M2, M3, M4 y posteriores). Para el GGUF Q8_0 puede usarse llama.cpp en CPU o GPU. No se especifican GPUs NVIDIA recomendadas.
- GPU de consumo: cabe en equipos con Apple Silicon unificada; en el ecosistema NVIDIA, una RTX 3060 de 12 GB o superior podría alojar una cuantización de 4 bits, si bien no hay validación publicada.
- Opciones de despliegue: MLX-LM, LM Studio (validado por el autor), llama.cpp con el GGUF Q8_0 y cualquier runtime que cargue safetensors estándar. vLLM y TGI no están mencionados en la información disponible.
- Latencia y throughput: no disponibles. La configuración recomendada limita la salida a 128 tokens y usa temperatura 0, lo que reduce la latencia en mensajes cortos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UnimeType Transliteration 4B | 4,2B | 2048 tokens validados (máximo no disponible) | Transliteración pinyin/romaji/hindi/arabizi | Apache 2.0 | MLX, safetensors, GGUF |
| UnimeType Transliteration 2.0-4B | Clase 4B | No disponible | Transliteración, generación 2.0 v2.1 | No disponible en la información | Hugging Face |
| UnimeType Transliteration 2.0-0.8B | Clase 0,8B | No disponible | Transliteración ultraligera | No disponible en la información | Hugging Face |
| Qwen/Qwen3.5-4B (modelo base) | Clase 4B | No disponible | LLM generalista | No disponible en la información | Hugging Face |

No se dispone de datos de benchmarks comparativos frente a modelos de transliteración de otros proveedores en la información proporcionada.

## Limitaciones y advertencias

- La model card indica explícitamente que la preservación de segmentos no está garantizada y que deben revisarse las salidas antes de usarlas.
- Existe un error conocido de salto de línea final en árabe, documentado en las exportaciones safetensors y GGUF; los pesos MLX de este repositorio no se han modificado.
- El modelo está diseñado para conversión, no para traducción, reescritura, pulido ni explicación; usarlo fuera de ese ámbito producirá resultados no fiables.
- La evaluación se basa en coincidencia exacta, lo que penaliza variantes ortográficas válidas; las puntuaciones publicadas subestiman potencialmente la calidad real.
- Cobertura limitada a cinco idiomas (en, zh, ja, hi, ar); no se documenta soporte para otras escrituras como cirílico, a pesar de que la web del autor ofrece una herramienta de transliteración rusa.
- El contexto validado es de 2048 tokens, adecuado para mensajes cortos pero insuficiente para documentos largos.
- El formato principal es MLX, lo que limita el despliegue fuera del ecosistema Apple salvo mediante el GGUF Q8_0 o los safetensors.
- No se documentan sesgos específicos ni riesgos de alucinación medidos; al ser un fine-tuning de un modelo generalista, puede heredar sesgos del base.
- La licencia Apache 2.0 permite uso comercial, pero la model card no ofrece garantías de exactitud en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/UnimeType/Transliteration-4B
- Repositorio safetensors: https://huggingface.co/UnimeType/Transliteration-4B-Safetensors/tree/main
- Repositorio GGUF Q8_0: https://huggingface.co/UnimeType/Transliteration-4B-GGUF/tree/main
- Generación posterior 2.0-4B: https://huggingface.co/UnimeType/Transliteration-2.0-4B
- Generación posterior 2.0-0.8B: https://huggingface.co/UnimeType/Transliteration-2.0-0.8B
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Playground interactivo: https://huggingface.co/spaces/UnimeType/Transliteration-Playground
- Descarga de la app UnimeType: https://unimetype.com/download
- Conversor pinyin a chino: https://unimetype.com/tools/pinyin-to-chinese
- Conversor romaji a japonés: https://unimetype.com/tools/romaji-to-hiragana
- Conversor inglés a hindi: https://unimetype.com/tools/english-to-hindi
- Conversor translit a cirílico: https://unimetype.com/tools/translit-to-cyrillic
