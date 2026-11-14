# UnimeType/Transliteration-2.0-9B

## Resumen

UnimeType Transliteration 2.0 9B (v2.6) es un modelo de conversión de texto romanizado a escritura nativa, desarrollado por UnimeType como motor de método de entrada (IME) que funciona en local. Se trata de un ajuste fino del modelo base Qwen/Qwen3.5-9B (8.953.803.264 parámetros) que convierte entradas ASCII o romanizadas a 12 idiomas distintos (chino pinyin, japonés romaji, hindi hinglish, árabe arabizi, ruso, griego, vietnamita, español, francés, portugués, alemán e italiano), preservando intactos términos en inglés, handles, URLs, rutas de ficheros y saltos de línea.

La propuesta del modelo es sustituir el cambio constante de teclado por un único layout ASCII que convierte el texto en el lugar solo cuando se desea escritura nativa. Esta versión concreta es el checkpoint MLX cuantizado a 6 bits, pensado para ejecución en Apple Silicon, con un tamaño de repositorio de 7,3 GB. La familia oficial incluye además variantes de 0,8B y 4B, y versiones en BF16 Safetensors y GGUF.

El modelo se presenta como motor determinista de conversión, no como chatbot de propósito general: requiere un protocolo JSON compacto (`unimetype-convert-short-v3`), system prompt vacío y temperatura 0. La licencia es Apache 2.0 y el checkpoint se publicó el 14 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen/Qwen3.5-9B) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX 6-bit (este repo); BF16 Safetensors y GGUF Q4_K_M / Q8_0 en repos hermanos |
| Idiomas soportados | en, zh, ja, hi, ar, ru, el, vi, es, fr, pt, de, it (12 idiomas, 13 modos de salida) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX, 6-bit) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B sin cuantizar en BF16 y se ajusta como motor de transliteración determinista. La arquitectura subyacente es la del transformer de Qwen3.5, aunque la model card no detalla la composición del dataset de entrenamiento ni el número de tokens utilizados. La versión v2.6 se entrenó sobre `dataset_v5.1` y amplía la cobertura de 4 idiomas (zh, ja, hi, ar) a 12 idiomas con 13 modos de salida, incluyendo japonés en variantes `natural` y `kana`.

La innovación principal es el protocolo `unimetype-convert-short-v3`: un mensaje de usuario en JSON compacto de una sola línea con system prompt vacío (0 tokens de prefijo), lo que elimina la sobrecarga de prompt y lo hace compatible de forma directa con clientes existentes de Transliteration-2.0. La plantilla de chat incorpora de forma incondicional el bloque `<|im_start|>assistant\n<think>\n\n</think>\n\n`, de modo que el modelo emite el texto convertido en el primer token sin latencia de razonamiento. Además, incorpora reparación de erratas por teclas adyacentes (por ejemplo `shujuuk` → `数据库`), respeto de un léxico dinámico para contactos y marcas, y emisión de `UNIMETYPE_NO_ALTERNATIVE` cuando se agotan las alternativas de reconversión.

## Capacidades

- Transliteración de texto romanizado a escritura nativa en 12 idiomas: chino pinyin, japonés romaji (modos `natural` y `kana`), hindi hinglish, árabe arabizi, ruso, griego, vietnamita, español, francés, portugués, alemán e italiano.
- Preservación de términos en inglés, `@handles`, URLs, fragmentos de código, rutas de ficheros, números y saltos de línea dentro del texto convertido.
- Reparación de erratas de tecleo rápido por teclas adyacentes y transposiciones.
- Soporte de léxico dinámico (`lexicon`) para entradas de contactos y marcas sin falsos positivos por homófonos.
- Emisión controlada de `UNIMETYPE_NO_ALTERNATIVE` cuando se agotan las alternativas de reconversión en modo `reconvert`.
- Plantilla de chat no-thinking que fuerza salida directa en el primer token, sin tokens de razonamiento.
- Protocolo JSON compacto (`unimetype-convert-short-v3`) compatible con clientes existentes de Transliteration-2.0.
- Capacidades multilingües limitadas a la tarea de conversión; no es un chatbot de propósito general.
- No se documentan capacidades de tool calling, agentes, visión ni audio.

## Casos de uso

- Escritura multilingüe en el escritorio: el modelo actúa como motor de un IME que convierte en el lugar el texto romanizado a escritura nativa sin cambiar de teclado, manteniendo un layout ASCII limpio para atajos de una tecla en Figma, Blender o juegos WASD.
- Mensajería entre aplicaciones: al integrarse con la app UnimeType Keyboard, permite alternar entre Slack, Mail, WhatsApp, WeChat o LINE con un único teclado y convertir solo cuando se desea escritura nativa.
- Flujos de terminal e IDE: al preservar rutas de ficheros, fragmentos de código y números, el modelo puede usarse para escribir comandos y comentarios en inglés mientras se convierten anotaciones a la escritura nativa.
- Documentación técnica con LaTeX: mantiene intactos los comandos LaTeX de Overleaf y convierte únicamente el texto romanizado que el usuario decida, útil para autores que redactan en varios idiomas.
- Entrada de contactos y marcas: el soporte de `lexicon` dinámico permite respetar nombres de contactos y marcas sin que homófonos los sustituyan erróneamente.
- Recuperación de erratas en tecleo rápido: la reparación de teclas adyacentes corrige transposiciones típicas de escritura veloz antes de la conversión, reduciendo correcciones manuales.
- Inferencia en local en Apple Silicon: el checkpoint MLX 6-bit permite ejecutar el motor de conversión en dispositivos Apple sin conexión, con un footprint de aproximadamente 5,6 a 7,4 GB según la variante.

## Benchmarks y rendimiento

| Benchmark | Resultado | Referencia comparada |
|---|---|---|
| Suite alineada v4 (708 casos), precisión estricta | 92,09% | +1,27 pp frente a DeepSeek V4.1 Flash (con system prompt de producción de ~2.800 tokens) |
| Core-5 | 90,94% | +0,64 pp frente a la nube |
| Dogfood-30 | 76,7% | iguala la precisión de la nube |
| OOD-Unseen-20 (reparación de sondeo) | 90,0% (18/20) | no disponible |

## Requisitos de hardware

- VRAM estimada: aproximadamente 5,6 a 7,4 GB para la variante 9B, según la model card; este repo MLX 6-bit ocupa 7,3 GB en disco.
- GPU recomendadas: Apple Silicon para este checkpoint MLX; las variantes BF16 Safetensors están pensadas para PyTorch y vLLM, y las GGUF para llama.cpp, LM Studio y Ollama.
- Cabe en GPU de consumo: la familia incluye variantes de 0,8B (~0,5-0,7 GB) y 4B (~2,6-3,5 GB) para equipos más modestos; el 9B requiere el rango de 5,6-7,4 GB indicado.
- Opciones de despliegue: MLX / `mlx-lm` para este repo; BF16 Safetensors con PyTorch y vLLM; GGUF Q4_K_M y Q8_0 con llama.cpp, LM Studio y Ollama; también existe un Space de playground con inferencia WebAssembly en navegador.
- Latencia y throughput: la plantilla no-thinking emite la salida en el primer token, sin latencia de tokens de razonamiento; no se publican cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión destacada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UnimeType Transliteration 2.0 9B (v2.6) | 8.953.803.264 | no disponible | 92,09% suite v4; 90,94% Core-5 | apache-2.0 | MLX 6-bit, BF16 Safetensors, GGUF |
| UnimeType Transliteration 2.0 4B | no disponible | no disponible | no disponible | apache-2.0 | MLX 6-bit, BF16 Safetensors, GGUF |
| UnimeType Transliteration 2.0 0.8B | no disponible | no disponible | no disponible | apache-2.0 | MLX 6-bit, BF16 Safetensors, GGUF |
| DeepSeek V4.1 Flash (referencia en la model card) | no disponible | no disponible | 90,82% implícito en suite v4 (1,27 pp por debajo) | no disponible | nube |

## Limitaciones y advertencias

- Es un motor de conversión especializado, no un chatbot abierto: usarlo fuera del protocolo JSON compacto, con system prompt no vacío o con temperatura distinta de 0 puede degradar la salida.
- La model card no detalla sesgos conocidos, composición del dataset de entrenamiento ni número de tokens; no es posible evaluar la cobertura lingüística más allá de los 12 idiomas declarados.
- Riesgo de alucinación en la conversión: la reparación de erratas y el léxico dinámico pueden introducir sustituciones no deseadas si el contexto es ambiguo, aunque el modelo emite `UNIMETYPE_NO_ALTERNATIVE` cuando agota alternativas.
- Limitación de idioma: solo cubre los 12 idiomas y 13 modos declarados; otras escrituras o variantes dialectales no están soportadas.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen/Qwen3.5-9B y de los datos de entrenamiento no publicados.
- En producción: la variante MLX 6-bit está atada a Apple Silicon; para otros entornos hay que usar los repos BF16 Safetensors o GGUF, con footprints distintos.
- No se documentan capacidades de tool calling, agentes, visión ni audio, por lo que no debe emplearse para esas tareas.

## Enlaces

- Hugging Face: https://huggingface.co/UnimeType/Transliteration-2.0-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Playground interactivo: https://huggingface.co/spaces/UnimeType/Transliteration-Playground
- Descarga de la app UnimeType Keyboard: https://unimetype.com/download
- Metodología de evaluación y guía de LM Studio: https://unimetype.com/blog/how-we-evaluate-transliteration-models
- Variante 0.8B MLX: https://huggingface.co/UnimeType/Transliteration-2.0-0.8B
- Variante 0.8B Safetensors: https://huggingface.co/UnimeType/Transliteration-2.0-0.8B-Safetensors
- Variante 0.8B GGUF: https://huggingface.co/UnimeType/Transliteration-2.0-0.8B-GGUF
- Variante 4B MLX: https://huggingface.co/UnimeType/Transliteration-2.0-4B
- Variante 4B Safetensors: https://huggingface.co/UnimeType/Transliteration-2.0-4B-Safetensors
- Variante 4B GGUF: https://huggingface.co/UnimeType/Transliteration-2.0-4B-GGUF
- Variante 9B Safetensors: https://huggingface.co/UnimeType/Transliteration-2.0-9B-Safetensors
- Variante 9B GGUF: https://huggingface.co/UnimeType/Transliteration-2.0-9B-GGUF
