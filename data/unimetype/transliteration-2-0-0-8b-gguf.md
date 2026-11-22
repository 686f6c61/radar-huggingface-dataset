# UnimeType/Transliteration-2.0-0.8B-GGUF

## Resumen

UnimeType Transliteration 2.0 0.8B (v2.6) es un modelo especializado en transliteración para métodos de entrada (IME), desarrollado por UnimeType. Se trata de un fine-tuning del modelo base Qwen/Qwen3.5-0.8B en formato GGUF, diseñado para convertir texto romanizado o escrito en ASCII a escrituras nativas en 12 idiomas (13 modos de salida), incluyendo pinyin chino, romaji japonés, hinglish hindi, arabizi árabe, ruso, griego, vietnamita, español, francés, portugués, alemán e italiano.

El modelo resuelve un problema muy concreto: permitir al usuario mantener una distribución de teclado ASCII limpia (útil para atajos de una sola tecla, comandos LaTeX, controles WASD o terminales) y convertir el texto romanizado a escritura nativa solo cuando se desea, sin cambiar de teclado entre aplicaciones ni a mitad de frase. Con 752.393.024 parámetros reales, es un modelo ultraligero pensado para inferencia local en dispositivo, incluyendo entornos móviles y WebAssembly.

La relevancia actual radica en su enfoque determinista y de baja latencia: emplea un protocolo compacto de mensaje JSON de una sola línea con prompt de sistema vacío (cero tokens de prefijo), plantilla de chat no-thinking que emite texto convertido desde el primer token, y preserva intactos términos en inglés, handles, URLs, fragmentos de código, rutas de archivo, números y saltos de línea. La versión v2.6 amplía de 4 a 12 idiomas y añade recuperación de errores tipográficos por teclas adyacentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (fine-tuning de Qwen/Qwen3.5-0.8B) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (4-bit k-quant) y Q8_0 (8-bit) |
| Idiomas soportados | en, zh, ja, hi, ar, ru, el, vi, es, fr, pt, de, it (12 idiomas, 13 modos de salida) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo con Q4_K_M y Q8_0); safetensors BF16 y MLX 6-bit en repos hermanos |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only derivado por fine-tuning del checkpoint no cuantizado en BF16 Qwen/Qwen3.5-0.8B. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. La model card menciona `dataset_v5.1` como versión del conjunto de datos de entrenamiento y el protocolo `unimetype-convert-short-v3`, que define una interfaz de mensaje JSON compacto de una sola línea con prompt de sistema vacío para eliminar la sobrecarga de tokens de prefijo.

Entre las innovaciones técnicas destacables figuran: una plantilla de chat no-thinking con `<|im_start|>assistant\n<think>\n\n</think>\n\n` incorporada en `chat_template.jinja` para que LM Studio, `mlx-lm` y `llama.cpp` emitan texto convertido desde el primer token sin latencia de razonamiento; recuperación de errores tipográficos por teclas adyacentes en escritura rápida (por ejemplo, `shujuuk` → `数据库`, `yanchanghiu` → `演唱会`, `yanuhuo` → `验货`); respeto de entradas dinámicas de léxico (contactos y marcas) sin secuestro homófono falsos positivos; y emisión limpia de `UNIMETYPE_NO_ALTERNATIVE` cuando se agotan las alternativas de reconversión de conjunto cerrado.

## Capacidades

- Transliteración de texto romanizado o ASCII a escritura nativa en 12 idiomas: pinyin chino, romaji japonés (modos `natural` y `kana`), hinglish hindi, arabizi árabe, ruso, griego, vietnamita, español, francés, portugués, alemán e italiano.
- Preservación de contenido no convertible: términos en inglés inline, `@handles`, URLs, fragmentos de código, rutas de archivo, números y saltos de línea.
- Recuperación de errores tipográficos por teclas adyacentes (transposiciones de escritura rápida).
- Soporte de léxico dinámico para entradas de contactos y marcas, con control de falsos positivos homófonos.
- Reconversión de conjunto cerrado con emisión de `UNIMETYPE_NO_ALTERNATIVE` cuando no hay alternativas.
- Protocolo de mensaje JSON compacto de una línea con prompt de sistema vacío (cero tokens de prefijo).
- Plantilla de chat no-thinking: salida inmediata sin tokens de razonamiento.
- No es un chatbot de propósito general: es un motor de conversión IME determinista.

## Casos de uso

- Teclado IME de escritorio y móvil: el modelo convierte texto romanizado a escritura nativa en el lugar, permitiendo mantener una distribución ASCII limpia para atajos de una sola tecla en Figma o Blender, comandos LaTeX en Overleaf y controles WASD en juegos, sin cambiar de teclado entre aplicaciones ni a mitad de frase.
- Entrada multilingüe en aplicaciones de mensajería: conversión en el lugar de texto romanizado mientras se alterna entre Slack, Mail, WhatsApp, WeChat o LINE, con preservación de handles, URLs y términos en inglés inline.
- Inferencia en navegador mediante WebAssembly: el tamaño reducido del checkpoint Q4_K_M (aproximadamente 0,5–0,7 GB de huella) permite ejecutar la conversión en el propio navegador sin backend, como demuestra el playground oficial del proyecto.
- Escritura rápida con corrección de erratas: recuperación de transposiciones de teclas adyacentes en tiempo real (por ejemplo, `shujuuk` → `数据库`), útil en flujos de dictado rápido o tecleo veloz en pinyin, romaji o hinglish.
- Despliegue local en Apple Silicon y estaciones de trabajo: mediante `mlx-lm`, `llama.cpp`, LM Studio u Ollama con los Modelfiles oficiales, sin dependencia de la nube y con latencia de primer token mínima gracias a la plantilla no-thinking.
- Integración en pipelines de productividad con terminal e IDE: al conservar rutas de archivo, fragmentos de código y comandos intactos, el modelo puede intercalarse en flujos de Terminal/IDE donde el usuario escribe comandos en ASCII y solo convierte prosa romanizada a escritura nativa.
- Aplicaciones de accesibilidad y teclados personalizados: motor de conversión determinista y ligero para teclados virtuales en macOS, Windows, Linux, iOS, Android y ChromeOS, con soporte de léxico dinámico para nombres de contactos y marcas.

## Benchmarks y rendimiento

La model card reporta resultados para el tier 9B de la familia, no para el 0.8B. No se han publicado resultados de benchmarks del checkpoint 0.8B en la información disponible.

| Modelo | Suite | Resultado |
|---|---|---|
| Transliteration-2.0-9B | `v4`-aligned (708 casos), precisión estricta | 92,09 % (+1,27 pp frente a DeepSeek V4.1 Flash con prompt de sistema de ~2.800 tokens) |
| Transliteration-2.0-9B | `Core-5` | 90,94 % (+0,64 pp frente a la nube) |
| Transliteration-2.0-9B | `Dogfood-30` | 76,7 % (igual que la nube) |
| Transliteration-2.0-9B | `OOD-Unseen-20` (reparación de sondas) | 90,0 % (18/20) |
| Transliteration-2.0-0.8B | — | no disponible |

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 0,5–0,7 GB para el tier 0.8B según la model card (huella del checkpoint cuantizado); Q4_K_M es la opción de menor consumo y Q8_0 la de mayor fidelidad.
- GPU recomendadas: no se especifican GPU dedicadas; el modelo está orientado a ejecución en CPU, Apple Silicon (MLX 6-bit) y runtimes móviles/WebAssembly. Cabe en cualquier GPU consumer con suficiente VRAM libre para el checkpoint, aunque no se detallan modelos concretos.
- Cabe en GPU consumer: sí, dado el tamaño del checkpoint (aproximadamente 0,5–0,7 GB); no se especifican modelos concretos de GPU.
- Opciones de despliegue: `llama.cpp`, LM Studio, Ollama (Modelfiles oficiales), `mlx-lm` en Apple Silicon, WebAssembly en navegador y vLLM/PyTorch con los safetensors BF16 del repo hermano.
- Latencia y throughput: no disponibles de forma numérica; la plantilla no-thinking elimina la latencia de tokens de razonamiento y el protocolo de prompt vacío elimina la sobrecarga de tokens de prefijo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| UnimeType Transliteration 2.0 0.8B (v2.6) | 752.393.024 | no disponible | 12 (13 modos) | apache-2.0 | GGUF, safetensors, MLX | Motor IME determinista, on-device, WASM |
| UnimeType Transliteration 2.0 4B | no disponible | no disponible | 12 (13 modos) | apache-2.0 | GGUF, safetensors, MLX | Tier intermedio para escritorio (~2,6–3,5 GB) |
| UnimeType Transliteration 2.0 9B | no disponible | no disponible | 12 (13 modos) | apache-2.0 | GGUF, safetensors, MLX | Tier insignia offline (~5,6–7,4 GB), supera a la nube en Core-5 |
| DeepSeek V4.1 Flash (referencia de la model card) | no disponible | no disponible | no disponible | no disponible | no disponible | Modelo en la nube con prompt de sistema de ~2.800 tokens; el 9B le supera en +1,27 pp en la suite `v4` |

No se dispone de datos de otros modelos comparables de transliteración IME en la información proporcionada.

## Limitaciones y advertencias

- No es un chatbot de propósito general: es un motor de conversión IME determinista; su uso fuera del protocolo `unimetype-convert-short-v3` puede degradar la calidad de salida.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado; el modelo está diseñado para conversión determinista, pero no se documentan tasas de error específicas para el tier 0.8B.
- Limitaciones de contexto e idioma: la longitud de contexto no está documentada; los idiomas de la model card (en, zh, ja, hi, ar) difieren de la lista completa de 12 idiomas del cuerpo del documento, por lo que la cobertura efectiva de ruso, griego, vietnamita, español, francés, portugués, alemán e italiano debe validarse empíricamente.
- Restricciones de licencia: apache-2.0, permisiva para uso comercial; debe conservarse el aviso de licencia y atribución correspondiente.
- Caveats para producción: el modelo base es Qwen/Qwen3.5-0.8B; conviene verificar la licencia y condiciones del modelo base. La calidad de la recuperación de erratas y del léxico dinámico debe evaluarse con el conjunto `Smoke-60` local antes de desplegar.

## Enlaces

- Hugging Face (este repo GGUF): https://huggingface.co/UnimeType/Transliteration-2.0-0.8B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Safetensors BF16 (0.8B): https://huggingface.co/UnimeType/Transliteration-2.0-0.8B-Safetensors
- MLX 6-bit (0.8B): https://huggingface.co/UnimeType/Transliteration-2.0-0.8B
- GGUF 4B: https://huggingface.co/UnimeType/Transliteration-2.0-4B-GGUF
- GGUF 9B: https://huggingface.co/UnimeType/Transliteration-2.0-9B-GGUF
- Toolkit de inferencia local, Modelfiles de Ollama y especificación short-v3 (GitHub): https://github.com/UnimeType/transliteration
- Playground interactivo (Space): https://huggingface.co/spaces/UnimeType/Transliteration-Playground
- Descarga de la aplicación de teclado: https://unimetype.com/download
- Metodología de evaluación y guía de LM Studio: https://unimetype.com/blog/how-we-evaluate-transliteration-models
- Sitio del proyecto: https://unimetype.com/
