# UnimeType/Transliteration-2.0-0.8B

## Resumen

UnimeType Transliteration 2.0 0.8B (v2.6) es un modelo especializado de transliteración para motores de entrada (IME) que convierte texto romanizado o escrito en ASCII a escritura nativa en 12 idiomas y 13 modos de salida. Lo desarrolla UnimeType y se distribuye con licencia Apache 2.0. Está afinado a partir de Qwen/Qwen3.5-0.8B y empaquetado en formato MLX de 6 bits para inferencia local en Apple Silicon, con variantes paralelas en BF16 Safetensors y GGUF publicadas por el mismo autor.

El modelo no es un chatbot generalista: es un motor determinista de conversión que recibe un objeto JSON compacto como mensaje de usuario con prompt de sistema vacío y temperatura 0. Su objetivo es permitir una única disposición de teclado ASCII para todos los idiomas del usuario, convirtiendo el texto romanizado en el lugar solo cuando se desea escritura nativa, sin cambiar de teclado entre aplicaciones ni a mitad de frase.

La versión 2.6 amplía la cobertura de 4 idiomas a 12 (chino, japonés en modos natural y kana, hindi, árabe, ruso, griego, vietnamita, español, francés, portugués, alemán e italiano), introduce recuperación de errores tipográficos por teclas adyacentes en escritura a ciegas y elimina la latencia de tokens de razonamiento mediante una plantilla de chat no pensante. El checkpoint tiene 752.393.024 parámetros reales en safetensors y el repositorio ocupa 1,9 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (fine-tune de Qwen/Qwen3.5-0.8B) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6-bit (MLX); variantes del autor en BF16 Safetensors y GGUF Q4_K_M / Q8_0 |
| Idiomas soportados | en, zh, ja, hi, ar, ru, el, vi, es, fr, pt, de, it (12 idiomas, 13 modos de salida) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX 6-bit); también BF16 safetensors y GGUF en repos separados |

## Arquitectura y entrenamiento

El modelo es un fine-tune del transformer decoder-only Qwen/Qwen3.5-0.8B, partiendo de los pesos en BF16 sin cuantizar y posteriormente cuantizado a 6 bits para el runtime MLX. La model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset, aunque identifica la versión de datos como `dataset_v5.1`. El entrenamiento está orientado a una tarea de conversión cerrada: transliteración de entrada romanizada a escritura nativa, preservando intactos términos en inglés inline, menciones `@handle`, URLs, fragmentos de código, rutas de fichero, números y saltos de línea.

La innovación principal está en el protocolo de inferencia `unimetype-convert-short-v3`: un mensaje de usuario en JSON compacto de una sola línea con prompt de sistema vacío (0 tokens de prefijo) y temperatura 0, lo que produce una conversión determinista. La plantilla de chat incorpora `<|im_start|>assistant\n<think>\n\n</think>\n\n` de forma incondicional en `chat_template.jinja` para las tres distribuciones (MLX, Safetensors y GGUF), de modo que la salida convertida se emite desde el primer token sin latencia de razonamiento. La versión 2.6 añade recuperación de errores tipográficos por transposición de teclas adyacentes (por ejemplo `shujuuk` → `数据库`, `yanchanghiu` → `演唱会`, `yanuhuo` → `验货`), respeto de entradas dinámicas de `lexicon` para contactos y marcas sin secuestro por homófonos, y emisión limpia de `UNIMETYPE_NO_ALTERNATIVE` cuando se agotan las alternativas de reconversión de conjunto cerrado.

## Capacidades

- Transliteración de entrada romanizada a escritura nativa en 12 idiomas: pinyin chino, romaji japonés (modos `natural` y `kana`), hinglish hindi, arabizi árabe, ruso, griego, vietnamita, español, francés, portugués, alemán e italiano.
- Preservación de contenido no transliterable: términos en inglés inline, `@handles`, URLs, code spans, rutas de fichero, números y saltos de línea.
- Recuperación de errores tipográficos por teclas adyacentes en escritura a ciegas.
- Soporte de `lexicon` dinámico para entradas de contactos y marcas, con control de falsos positivos por homófonos.
- Reconversión de conjunto cerrado con señal explícita de agotamiento (`UNIMETYPE_NO_ALTERNATIVE`).
- Plantilla de chat no pensante: salida desde el primer token sin tokens de razonamiento.
- Compatibilidad drop-in con todos los clientes de `Transliteration-2.0` mediante el protocolo `unimetype-convert-short-v3`.
- No se documentan capacidades de tool calling, agentes, visión, audio ni razonamiento multi-paso; el modelo está diseñado como motor de conversión cerrado.

## Casos de uso

- Motor IME de sistema en macOS, Windows, Linux, iOS, Android y ChromeOS: el modelo convierte in-place el texto romanizado en la aplicación activa (Slack, Mail, WhatsApp, WeChat, LINE) sin cambiar de teclado, manteniendo una disposición ASCII limpia para atajos de una tecla.
- Escritura multilingüe en entornos creativos: conserva los atajos de una tecla en Figma o Blender y los comandos LaTeX en Overleaf mientras permite escribir en escritura nativa cuando se invoca la conversión.
- Flujos de terminal e IDE: al preservar rutas de fichero, code spans y números, el modelo puede integrarse en editores y terminales sin corromper comandos ni identificadores.
- Control en juegos: la disposición ASCII se mantiene para WASD y otras teclas de acción, con conversión puntual del texto de chat a escritura nativa.
- Corrección de errores de tecleo rápido: la recuperación de transposiciones de teclas adyacentes permite reparar entradas como `shujuuk` o `yanchanghiu` sin reescritura manual.
- Gestión de contactos y marcas: el `lexicon` dinámico permite mantener nombres de contactos y marcas correctos sin que homófonos los sobrescriban.
- Despliegue local en navegador: la variante de 0,8B está pensada para inferencia WebAssembly en el navegador (playground del autor) y para móvil, con huella de aproximadamente 0,5–0,7 GB.
- Integración en aplicaciones de terceros: el protocolo JSON compacto con temperatura 0 permite incorporar la conversión a cualquier cliente compatible con `Transliteration-2.0`.

## Benchmarks y rendimiento

La model card proporcionada solo incluye cifras de rendimiento para el tier 9B de la familia, no para este checkpoint de 0,8B. Se reproducen a continuación los datos publicados para el 9B, que no deben atribuirse al modelo de 0,8B:

| Suite | Resultado 9B | Referencia |
|---|---|---|
| `v4`-aligned (708 casos), precisión estricta | 92,09% | +1,27 pp frente a DeepSeek V4.1 Flash (con prompt de sistema de producción de ~2.800 tokens) |
| `Core-5` | 90,94% | +0,64 pp frente a la nube |
| `Dogfood-30` | 76,7% | iguala a la nube |
| `OOD-Unseen-20` (reparación de sonda) | 90,0% (18/20) | no disponible |

No se han publicado resultados de benchmarks del checkpoint 0,8B en la información disponible.

## Requisitos de hardware

- VRAM estimada: la variante MLX 6-bit ocupa aproximadamente 0,5–0,7 GB según la model card, lo que la sitúa en el rango de móvil y navegador.
- GPU recomendadas: el checkpoint está empaquetado para Apple Silicon con MLX; para GPU NVIDIA se recomienda usar la variante BF16 Safetensors o GGUF del mismo autor.
- Cabe en GPU de consumo: sí, con amplio margen en cualquier GPU consumer actual; también en Apple Silicon de gama baja y en inferencia WebAssembly en navegador.
- Opciones de despliegue: `mlx-lm` (este repo), llama.cpp, LM Studio, Ollama (con Modelfiles publicados por el autor), vLLM y TGI con la variante BF16 Safetensors.
- Latencia y throughput: no disponibles de forma numérica; la plantilla no pensante elimina los tokens de razonamiento y la salida se emite desde el primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas/modos | Licencia | Formatos |
|---|---|---|---|---|---|
| UnimeType Transliteration 2.0 0.8B (este) | 752.393.024 | no disponible | 12 idiomas / 13 modos | Apache 2.0 | MLX 6-bit, BF16 safetensors, GGUF |
| UnimeType Transliteration 2.0 4B | no disponible en la información | no disponible | 12 idiomas / 13 modos | Apache 2.0 | MLX 6-bit, BF16 safetensors, GGUF |
| UnimeType Transliteration 2.0 9B | no disponible en la información | no disponible | 12 idiomas / 13 modos | Apache 2.0 | MLX 6-bit, BF16 safetensors, GGUF |
| Qwen/Qwen3.5-0.8B (base) | 0,8B (clase) | no disponible | multilingüe general | no disponible en la información | safetensors |

No se dispone de datos de benchmarks del 0,8B que permitan comparar rendimiento con las alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un chatbot generalista: está diseñado para recibir un JSON compacto con prompt de sistema vacío y temperatura 0; usarlo como modelo conversacional abierto producirá resultados fuera de su dominio.
- Riesgo de alucinación en la conversión: aunque la tarea es determinista, entradas ambiguas o fuera de distribución pueden producir transliteraciones incorrectas; la señal `UNIMETYPE_NO_ALTERNATIVE` solo cubre la reconversión de conjunto cerrado.
- Cobertura limitada a 12 idiomas y 13 modos; no se documentan otros idiomas ni escrituras.
- La longitud de contexto no está publicada, lo que dificulta planificar entradas largas.
- Sesgos conocidos: no documentados en la información disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.5-0.8B.
- El checkpoint de este repositorio es MLX 6-bit; para producción en GPU NVIDIA hay que usar las variantes BF16 o GGUF del autor, no estos pesos.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; no debe asumirse su disponibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/UnimeType/Transliteration-2.0-0.8B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Variante BF16 Safetensors: https://huggingface.co/UnimeType/Transliteration-2.0-0.8B-Safetensors
- Variante GGUF: https://huggingface.co/UnimeType/Transliteration-2.0-0.8B-GGUF
- Tier 4B (MLX): https://huggingface.co/UnimeType/Transliteration-2.0-4B
- Tier 9B (MLX): https://huggingface.co/UnimeType/Transliteration-2.0-9B
- Repositorio GitHub con toolkit de inferencia local: https://github.com/UnimeType/transliteration
- Playground interactivo: https://huggingface.co/spaces/UnimeType/Transliteration-Playground
- Descarga de la aplicación de teclado: https://unimetype.com/download
- Metodología de evaluación y guía de LM Studio: https://unimetype.com/blog/how-we-evaluate-transliteration-models
- Sitio del autor: https://unimetype.com
