# UnimeType/Transliteration-2.0-4B-GGUF

## Resumen

UnimeType Transliteration 2.0 4B (v2.6) es un modelo de lenguaje especializado en transliteración, desarrollado por UnimeType y afinado a partir de Qwen/Qwen3.5-4B. Su función no es la conversación abierta, sino actuar como motor de método de entrada (IME) que convierte texto romanizado o escrito en ASCII a escritura nativa en 12 idiomas (13 modos de salida), preservando intactos términos en inglés, menciones con arroba, URLs, fragmentos de código, rutas de ficheros, números y saltos de línea. Con 4.205.751.296 parámetros totales y licencia Apache 2.0, está pensado para ejecutarse en local, sin conexión y con latencia de primer token prácticamente nula.

La versión v2.6 amplía la cobertura desde los cuatro idiomas iniciales (chino, japonés, hindi y árabe) hasta doce, e incorpora recuperación de erratas por teclas adyacentes propias de la escritura a ciegas, además de un protocolo compacto de mensaje de usuario en JSON de una sola línea con prompt de sistema vacío. El modelo se distribuye en este repositorio únicamente en formato GGUF, con dos cuantizaciones: Q4_K_M y Q8_0.

Su relevancia actual radica en que resuelve un problema concreto de usabilidad multilingüe: mantener una distribución ASCII limpia para atajos de una sola tecla, comandos LaTeX, controles WASD en juegos o flujos de terminal, y convertir a escritura nativa solo cuando el usuario lo desea. Frente a alternativas en la nube, la familia incluye una variante de 9B que, según el autor, supera a DeepSeek V4.1 Flash en el conjunto de evaluación alineado con v4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen/Qwen3.5-4B); detalles internos de atención y capas no disponibles |
| Parametros totales | 4.205.751.296 |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (4 bits, k-quant) y Q8_0 (8 bits, casi sin pérdida) |
| Idiomas soportados | 12 idiomas / 13 modos: chino (pinyin), japonés (romaji natural y kana), hindi (hinglish), árabe (arabizi), ruso, griego, vietnamita, español, francés, portugués, alemán e italiano; la model card declara además en, zh, ja, hi, ar, ru, el, vi, es, fr, pt, de, it |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors BF16 disponible en el repositorio hermano Transliteration-2.0-4B-Safetensors) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B en BF16 sin cuantizar y se afina como motor determinista de transliteración para ejecución en dispositivo. La información disponible no detalla el número de capas, la configuración de atención ni la composición exacta del dataset de afinado (identificado como `dataset_v5.1`); tampoco se especifica si se emplearon RLHF, DPO u otras técnicas de alineamiento. Lo que sí se documenta es el protocolo de inferencia `unimetype-convert-short-v3`: un mensaje de usuario en JSON compacto de una sola línea con prompt de sistema vacío, lo que elimina el coste de tokens de prefijo.

Dos innovaciones destacan en la versión v2.6. La primera es la reparación de erratas por teclas adyacentes típicas de la escritura rápida a ciegas, con ejemplos documentados como `shujuuk` → `数据库`, `yanchanghiu` → `演唱会` y `yanuhuo` → `验货`. La segunda es la plantilla de chat no pensante incondicional: `<|im_start|>assistant\n<think>\n\n</think>\n\n` queda fijada en `chat_template.jinja` en todas las distribuciones (MLX, Safetensors y GGUF), de modo que LM Studio, `mlx-lm` y `llama.cpp` emiten el texto convertido desde el primer token, sin latencia de tokens de razonamiento. También se contempla el respeto de un `lexicon` dinámico con entradas de contacto o marca sin secuestro homófono falsopositivo, y la emisión limpia de `UNIMETYPE_NO_ALTERNATIVE` cuando se agotan las alternativas de reconversión en conjunto cerrado.

## Capacidades

- Transliteración de pinyin chino, romaji japonés (en modos natural y kana), hinglish hindi, arabizi árabe, ruso, griego, vietnamita, español, francés, portugués, alemán e italiano a escritura nativa.
- Preservación de términos en inglés intercalados, menciones `@handles`, URLs, fragmentos de código, rutas de ficheros, números y saltos de línea.
- Recuperación de erratas por transposición de teclas adyacentes en escritura rápida a ciegas.
- Aplicación de léxico dinámico para contactos y marcas, con control de falsos positivos homófonos.
- Reconversión en conjunto cerrado con señal explícita de agotamiento de alternativas (`UNIMETYPE_NO_ALTERNATIVE`).
- Modo no pensante forzado: salida de conversión desde el primer token, sin razonamiento previo.
- Compatibilidad directa con clientes de la familia `Transliteration-2.0` gracias al protocolo estable `unimetype-convert-short-v3`.
- Soporte declarado de 12 idiomas, aunque la metadata del repositorio solo lista en, zh, ja, hi y ar como idiomas principales.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión ni audio.

## Casos de uso

- Escritura multilingüe en el escritorio: el modelo actúa como motor de IME local que convierte pinyin, romaji o hinglish a escritura nativa solo cuando el usuario lo solicita, manteniendo una distribución ASCII limpia para el resto de tareas.
- Flujos de terminal e IDE: al preservar rutas de ficheros, fragmentos de código y números, permite escribir comandos y código sin interferencias y convertir únicamente el texto natural que lo requiera.
- Atajos de una sola tecla en herramientas creativas: en Figma, Blender u Overleaf, el usuario conserva los atajos de tecla única y los comandos LaTeX, y delega la conversión de texto romanizado al modelo cuando cambia a escritura nativa.
- Mensajería multiplataforma: con 12 idiomas y 13 modos de salida, un mismo motor cubre conversaciones en Slack, Mail, WhatsApp, WeChat o LINE sin cambiar de teclado entre aplicaciones ni a mitad de frase.
- Entrada de texto en movilidad y navegador: la cuantización Q4_K_M, con un peso de aproximadamente 2,6–3,5 GB para la variante 4B según el autor, está orientada a portátiles, runtimes móviles y WebAssembly, lo que habilita inferencia en el propio dispositivo.
- Reparación de erratas en dictado rápido: la recuperación de transposiciones de teclas adyacentes corrige entradas como `shujuuk` o `yanuhuo` antes de emitir la escritura nativa, útil en entornos de alta velocidad de tecleo.
- Procesamiento por lotes de textos romanizados: integrable vía `llama.cpp` o vLLM en pipelines que normalicen corpus romanizados a escritura nativa preservando URLs y código.

## Benchmarks y rendimiento

La model card no publica resultados específicos para la variante de 4B. Los datos disponibles corresponden a la variante de 9B de la misma familia:

| Conjunto de evaluacion | Resultado (9B) | Referencia comparada |
|---|---|---|
| Suite alineada v4 (708 casos), exactitud estricta | 92,09 % | +1,27 pp frente a DeepSeek V4.1 Flash con prompt de sistema de ~2.800 tokens |
| Core-5 | 90,94 % | +0,64 pp frente a la nube |
| Dogfood-30 | 76,7 % | Igual que la nube |
| OOD-Unseen-20 (reparación de sonda) | 90,0 % (18/20) | No disponible |

No se han publicado resultados de benchmarks de la variante 4B en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,6–3,5 GB para la variante 4B según el autor, en función de la cuantización (Q4_K_M o Q8_0).
- GPU recomendadas: no se especifican modelos concretos; el enfoque es la inferencia en dispositivo, incluyendo Apple Silicon mediante MLX 6-bit y runtimes de CPU.
- Cabe en GPU de consumo: sí, con el perfil de memoria indicado; la cuantización Q4_K_M está pensada para portátiles, runtimes móviles y WebAssembly.
- Opciones de despliegue: `llama.cpp`, LM Studio, Ollama (con Modelfiles publicados en el repositorio de GitHub), `mlx-lm` en Apple Silicon y vLLM mediante los pesos BF16 safetensors del repositorio hermano.
- Latencia y throughput: no se publican cifras concretas; la plantilla no pensante garantiza la emisión desde el primer token sin latencia de razonamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UnimeType Transliteration 2.0 4B (este) | 4,2 B | No disponible | Transliteración IME, 12 idiomas | Apache 2.0 | GGUF Q4_K_M y Q8_0; safetensors y MLX en repositorios hermanos |
| UnimeType Transliteration 2.0 9B | No disponible | No disponible | Transliteración IME, mayor exactitud offline | Apache 2.0 | GGUF, safetensors y MLX |
| UnimeType Transliteration 2.0 0.8B | No disponible | No disponible | Transliteración IME ultraligera para móvil y WASM | Apache 2.0 | GGUF, safetensors y MLX |
| Qwen/Qwen3.5-4B (modelo base) | 4,2 B | No disponible | Modelo conversacional generalista | No disponible en la información proporcionada | Safetensors y ecosistema Qwen |

No se dispone de datos de benchmarks comparativos de la variante 4B frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- Es un motor de conversión especializado, no un chatbot de propósito general; la model card advierte explícitamente contra su uso como asistente abierto.
- La metadata del repositorio lista solo cinco idiomas (en, zh, ja, hi, ar) frente a los doce declarados en la model card, lo que puede generar discrepancias en el filtrado por idioma en plataformas y herramientas.
- No se documentan sesgos específicos, pero al derivar de un modelo base generalista puede heredar sesgos de sus datos de preentrenamiento.
- Riesgo de alucinación en entradas ambiguas o fuera de distribución; el mecanismo `UNIMETYPE_NO_ALTERNATIVE` mitiga parcialmente los casos de conjunto cerrado, no la conversión libre.
- La longitud de contexto no está publicada, lo que dificulta planificar el procesamiento de documentos largos.
- La recuperación de erratas y el respeto de léxico dinámico se documentan con ejemplos, pero no se cuantifican sus tasas de error en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.5-4B, cuya licencia no se detalla en la información proporcionada.
- Las cifras de rendimiento citadas corresponden a la variante 9B y no son extrapolables a la 4B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/UnimeType/Transliteration-2.0-4B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio hermano safetensors: https://huggingface.co/UnimeType/Transliteration-2.0-4B-Safetensors
- Repositorio hermano MLX: https://huggingface.co/UnimeType/Transliteration-2.0-4B
- Variante 0.8B: https://huggingface.co/UnimeType/Transliteration-2.0-0.8B
- Variante 9B: https://huggingface.co/UnimeType/Transliteration-2.0-9B
- Toolkit de inferencia local y Modelfiles de Ollama: https://github.com/UnimeType/transliteration
- Playground interactivo: https://huggingface.co/spaces/UnimeType/Transliteration-Playground
- Descarga de la aplicación de teclado: https://unimetype.com/download
- Metodología de evaluación: https://unimetype.com/blog/how-we-evaluate-transliteration-models
- Sitio del proyecto: https://unimetype.com/
