# UnimeType/Transliteration-2.0-9B-GGUF

## Resumen

UnimeType Transliteration 2.0 9B (v2.6) es un modelo especializado de transliteración para motores IME (Input Method Editor) en local, desarrollado por UnimeType y afinado a partir de Qwen/Qwen3.5-9B en precisión BF16. Su función no es conversacional: convierte texto romanizado o ASCII (pinyin, romaji, hinglish, arabizi, etc.) a la escritura nativa correspondiente en 12 idiomas y 13 modos de salida, preservando intactos términos en inglés, handles, URLs, fragmentos de código, rutas de fichero, números y saltos de línea.

La versión v2.6 amplía la cobertura desde 4 idiomas (chino, japonés, hindi, árabe) hasta 12, con un protocolo compacto de mensaje de usuario en JSON de una línea y prompt de sistema vacío, lo que elimina el coste de tokens de prefijo. El modelo base aporta 8.953.803.264 parámetros totales, y se distribuye en formato GGUF con cuantizaciones Q4_K_M y Q8_0 para despliegue en llama.cpp, LM Studio, Ollama y runtimes WebAssembly.

Su relevancia actual radica en que alcanza precisión estricta del 92,09% en la suite alineada v4 de 708 casos, superando en 1,27 puntos porcentuales a DeepSeek V4.1 Flash con un prompt de producción de unos 2.800 tokens, y en 0,64 puntos en Core-5. Esto permite sustituir servicios en la nube por inferencia offline con latencia de primer token nula gracias a su plantilla de chat no-thinking.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen/Qwen3.5-9B) |
| Parametros totales | 8.953.803.264 (~8,95 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (4-bit k-quant) y Q8_0 (8-bit casi sin pérdida); también MLX 6-bit y BF16 Safetensors en otros repos de la familia |
| Idiomas soportados | en, zh, ja, hi, ar, ru, el, vi, es, fr, pt, de, it |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (este repo); Safetensors BF16 y MLX 6-bit en repos hermanos |

## Arquitectura y entrenamiento

El modelo es un transformer denso afinado a partir de Qwen/Qwen3.5-9B. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card indica que el ajuste se realizó sobre el checkpoint base en BF16 sin cuantizar, y que la versión v2.6 se entrenó con el conjunto `dataset_v5.1`, que cubre 12 idiomas y 13 modos de salida, incluyendo recuperación de errores tipográficos por teclas adyacentes.

La innovación principal es el protocolo `unimetype-convert-short-v3`: un mensaje de usuario en JSON compacto de una línea con prompt de sistema vacío (0 tokens de prefijo) y temperatura 0, lo que fuerza salidas deterministas. Además, la plantilla de chat incluye de forma incondicional `<|im_start|>assistant\n<think>\n\n</think>\n\n` en `chat_template.jinja` para todos los formatos (MLX, Safetensors, GGUF), de modo que el modelo emite el texto convertido en el primer token sin latencia de razonamiento. También incorpora un mecanismo de glosario dinámico (`lexicon`) para respetar entradas de contactos y marcas sin falsos positivos por homófonos, y emite `UNIMETYPE_NO_ALTERNATIVE` cuando se agotan las alternativas de reconversión en conjunto cerrado.

## Capacidades

- Transliteración de pinyin chino a caracteres hanzi.
- Conversión de romaji japonés en dos modos: `natural` y `kana`.
- Transliteración de hinglish a devanagari hindi.
- Conversión de arabizi a escritura árabe.
- Transliteración de ruso, griego y vietnamita desde entrada ASCII romanizada.
- Conversión de español, francés, portugués, alemán e italiano (modos de acentuación y caracteres propios).
- Preservación de términos en inglés inline, `@handles`, URLs, fragmentos de código, rutas de fichero, números y saltos de línea.
- Recuperación de errores tipográficos por teclas adyacentes en escritura rápida (por ejemplo, `shujuuk` → 数据库, `yanchanghiu` → 演唱会, `yanuhuo` → 验货).
- Soporte de glosario dinámico (`lexicon`) para contactos y marcas.
- Emisión determinista con temperatura 0 y sin tokens de razonamiento (plantilla no-thinking).
- No es un chatbot de propósito general: no se documentan tool calling, function calling ni razonamiento multi-step.

## Casos de uso

- Teclado IME de escritorio multiplataforma: integrado en la aplicación UnimeType para macOS, Windows, Linux, iOS, Android y ChromeOS, permite mantener una distribución ASCII limpia y convertir texto romanizado in-place solo cuando el usuario lo desea, sin cambiar de teclado entre aplicaciones.
- Entrada en editores gráficos y 3D: al conservar atajos de una sola tecla en Figma o Blender, el modelo permite escribir texto nativo sin romper los flujos de trabajo con WASD o comandos de teclado.
- Edición de LaTeX en Overleaf: la preservación de fragmentos de código y comandos permite convertir texto romanizado sin alterar las expresiones matemáticas ni las rutas.
- Comunicación multilingüe en mensajería: con 12 idiomas y 13 modos, un usuario puede alternar entre Slack, Mail, WhatsApp, WeChat o LINE manteniendo una sola distribución de teclado y convirtiendo solo el fragmento deseado.
- Inferencia en navegador mediante WebAssembly: la cuantización Q4_K_M (aproximadamente 5,6–7,4 GB en el tier 9B) y el playground oficial permiten ejecutar la conversión en el navegador sin enviar texto a servidores externos.
- Despliegue offline en portátiles y móviles: con llama.cpp, LM Studio u Ollama y los ficheros Q4_K_M o Q8_0, se puede ofrecer transliteración determinista sin conexión, útil en entornos con requisitos de privacidad o conectividad limitada.
- Sustitución de servicios en la nube en producción: al superar a DeepSeek V4.1 Flash en la suite v4 (92,09% frente a 90,82% aproximadamente) y en Core-5, permite reducir coste y latencia manteniendo precisión en conversión de texto.

## Benchmarks y rendimiento

| Benchmark | UnimeType 9B v2.6 | DeepSeek V4.1 Flash (referencia) |
|---|---|---|
| Suite v4 alineada (708 casos), precisión estricta | 92,09% | 90,82% (+1,27 pp a favor de UnimeType) |
| Core-5 | 90,94% | 90,30% (+0,64 pp a favor de UnimeType) |
| Dogfood-30 | 76,7% | 76,7% (empate) |
| OOD-Unseen-20 (reparación de sonda) | 90,0% (18/20) | no disponible |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,6–7,4 GB para el tier 9B según cuantización (Q4_K_M en el extremo inferior, Q8_0 en el superior).
- GPU recomendadas: no se especifican modelos concretos; el tamaño permite ejecución en GPU de consumo con al menos 8 GB de VRAM para Q4_K_M y alrededor de 10 GB para Q8_0.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más para Q4_K_M; se recomienda 10–12 GB para Q8_0.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama, MLX (6-bit en Apple Silicon), BF16 Safetensors con PyTorch/vLLM, y WebAssembly en navegador.
- Latencia y throughput: no se publican cifras concretas; la plantilla no-thinking garantiza emisión en el primer token sin latencia de razonamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión suite v4 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UnimeType Transliteration 2.0 9B v2.6 | ~8,95 B | no disponible | 92,09% | apache-2.0 | GGUF, Safetensors, MLX |
| UnimeType Transliteration 2.0 4B | ~4 B (no confirmado) | no disponible | no disponible | apache-2.0 | GGUF, Safetensors, MLX |
| UnimeType Transliteration 2.0 0.8B | ~0,8 B (no confirmado) | no disponible | no disponible | apache-2.0 | GGUF, Safetensors, MLX |
| DeepSeek V4.1 Flash (cloud) | no disponible | no disponible | 90,82% | propietaria | API en la nube |

La familia UnimeType ofrece tres tiers (0.8B, 4B, 9B) con el mismo protocolo y licencia Apache 2.0, lo que permite elegir entre footprint móvil/navegador y precisión de escritorio. No se dispone de datos de benchmarks de los tiers 0.8B y 4B en la información proporcionada.

## Limitaciones y advertencias

- El modelo es un motor de conversión IME especializado, no un chatbot de propósito general; usarlo fuera del protocolo `unimetype-convert-short-v3` (JSON compacto, prompt de sistema vacío, temperatura 0) puede degradar la calidad de salida.
- No se documentan sesgos conocidos ni evaluación de sesgos; al tratarse de un modelo de transliteración, el riesgo de alucinación se manifiesta como conversiones incorrectas o invención de alternativas en entradas ambiguas.
- La longitud de contexto no está publicada, lo que limita la planificación de entradas largas en producción.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen/Qwen3.5-9B debe verificarse por separado para confirmar compatibilidad de licencia en el uso derivado.
- La preservación de inglés inline, código y URLs es una capacidad declarada; conviene validarla en el dominio concreto de despliegue antes de sustituir un servicio en producción.
- La recuperación de errores tipográficos por teclas adyacentes está orientada a escritura rápida; entradas gravemente corruptas pueden no recuperarse y devolver `UNIMETYPE_NO_ALTERNATIVE`.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/UnimeType/Transliteration-2.0-9B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Tier 9B MLX 6-bit: https://huggingface.co/UnimeType/Transliteration-2.0-9B
- Tier 9B BF16 Safetensors: https://huggingface.co/UnimeType/Transliteration-2.0-9B-Safetensors
- Tier 4B MLX 6-bit: https://huggingface.co/UnimeType/Transliteration-2.0-4B
- Tier 4B BF16 Safetensors: https://huggingface.co/UnimeType/Transliteration-2.0-4B-Safetensors
- Tier 4B GGUF: https://huggingface.co/UnimeType/Transliteration-2.0-4B-GGUF
- Tier 0.8B MLX 6-bit: https://huggingface.co/UnimeType/Transliteration-2.0-0.8B
- Tier 0.8B BF16 Safetensors: https://huggingface.co/UnimeType/Transliteration-2.0-0.8B-Safetensors
- Tier 0.8B GGUF: https://huggingface.co/UnimeType/Transliteration-2.0-0.8B-GGUF
- Playground interactivo: https://huggingface.co/spaces/UnimeType/Transliteration-Playground
- Descarga de la aplicación de teclado: https://unimetype.com/download
- Metodología de evaluación y guía de LM Studio: https://unimetype.com/blog/how-we-evaluate-transliteration-models
- Sitio del proyecto: https://unimetype.com/
