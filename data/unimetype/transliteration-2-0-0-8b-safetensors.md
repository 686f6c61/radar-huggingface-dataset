# UnimeType/Transliteration-2.0-0.8B-Safetensors

## Resumen

UnimeType Transliteration 2.0 0.8B (v2.6) es un modelo de lenguaje especializado en transliteración para motores de entrada (IME) que funciona en local. Lo desarrolla UnimeType y está afinado a partir de Qwen/Qwen3.5-0.8B en BF16 sin cuantizar. Su función no es conversar de forma abierta, sino convertir texto escrito en ASCII o en romanización (pinyin, romaji, hinglish, arabizi, etc.) a la escritura nativa correspondiente, preservando intactos términos en inglés, menciones `@`, URLs, fragmentos de código, rutas de fichero, números y saltos de línea.

La versión 2.6 amplía la cobertura de 4 idiomas a 12 idiomas y 13 modos de salida: chino (pinyin), japonés (romaji en modo `natural` y `kana`), hindi (hinglish), árabe (arabizi), ruso, griego, vietnamita, español, francés, portugués, alemán e italiano. Emplea un protocolo compacto de mensaje de usuario en JSON de una sola línea (`unimetype-convert-short-v3`) con prompt de sistema vacío, de modo que no consume tokens de prefijo y es compatible de forma directa con los clientes de la familia Transliteration-2.0.

El modelo tiene 752.393.024 parámetros reales según los pesos safetensors, un repositorio de 4,5 GB y licencia Apache 2.0. Está pensado para ejecutarse en dispositivos de gama media, incluido WebAssembly en navegador y móvil, y se distribuye junto a variantes de 4B y 9B de la misma familia. Su relevancia actual radica en ofrecer transliteración determinista y offline con latencia de primer token nula, sin depender de servicios en la nube.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, tag `qwen3_5_text`) |
| Parámetros totales | 752.393.024 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 (este repo); MLX 6-bit; GGUF Q4_K_M y Q8_0 en repositorios hermanos |
| Idiomas soportados | en, zh, ja, hi, ar, ru, el, vi, es, fr, pt, de, it (12 idiomas, 13 modos de salida) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16); también MLX y GGUF en repositorios separados |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only derivado de Qwen3.5-0.8B, afinado sobre pesos BF16 sin cuantizar. La model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset, aunque sí referencia `dataset_v5.1` como base de la versión 2.6. Se trata de un ajuste supervisado orientado a una tarea cerrada de conversión, no de un modelo entrenado con RLHF o DPO de propósito general; la información disponible no confirma el uso de estas técnicas.

La innovación principal es el protocolo `unimetype-convert-short-v3`: un mensaje de usuario en JSON compacto de una línea con prompt de sistema vacío, lo que elimina el coste de tokens de prefijo y mantiene compatibilidad total con clientes existentes. Además, la plantilla de chat incluye de forma incondicional el bloque `<|im_start|>assistant\n<think>\n\n</think>\n\n`, de modo que el modelo emite el texto convertido desde el primer token sin latencia de razonamiento. La versión 2.6 añade recuperación de erratas por teclas adyacentes en escritura a ciegas (por ejemplo, `shujuuk` → `数据库`), respeto de léxicos dinámicos (`lexicon`) para contactos y marcas sin secuestro homófono, y emisión limpia de `UNIMETYPE_NO_ALTERNATIVE` cuando se agotan las alternativas de reconversión.

## Capacidades

- Transliteración de pinyin a caracteres chinos, romaji a japonés (modos `natural` y `kana`), hinglish a devanagari, arabizi a árabe, y conversión de ruso, griego y vietnamita desde ASCII.
- Conversión de texto romanizado a español, francés, portugués, alemán e italiano con escritura nativa (acentos y diacríticos).
- Preservación de términos en inglés, menciones `@`, URLs, fragmentos de código, rutas de fichero, números y saltos de línea dentro del texto convertido.
- Recuperación de erratas por teclas adyacentes típicas de escritura rápida a ciegas.
- Soporte de léxicos dinámicos (`lexicon`) para entradas de contactos y marcas.
- Emisión de `UNIMETYPE_NO_ALTERNATIVE` ante conjuntos cerrados de alternativas agotados.
- Modo de chat sin razonamiento (non-thinking) con salida desde el primer token.
- No es un chatbot de propósito general: no se documentan tool calling, agentes multi-paso, visión ni audio.

## Casos de uso

- Sustitución del teclado del sistema en escritorio y móvil: la aplicación UnimeType integra el modelo para reemplazar la tecla Convertir o Bloq Mayús en cualquier aplicación (Slack, Mail, WhatsApp, WeChat, LINE) sin cambiar de teclado a mitad de frase.
- Edición de LaTeX en Overleaf: el usuario mantiene un diseño ASCII limpio para comandos y convierte solo los términos romanizados a su escritura nativa cuando lo necesita, sin romper la sintaxis del documento.
- Flujos de terminal e IDE: al preservar rutas de fichero, números y fragmentos de código, el modelo permite escribir comandos y nombres de variable en ASCII y convertir únicamente el texto natural circundante.
- Atajos de una sola tecla en herramientas creativas (Figma, Blender): el layout ASCII se mantiene para los atajos y controles WASD, y la conversión se aplica en el punto de inserción de texto.
- Inferencia en navegador mediante WebAssembly: el tamaño reducido (aproximadamente 0,5-0,7 GB en las variantes ligeras) permite ejecutar la conversión en el propio navegador sin enviar texto a un servidor, útil para entornos con requisitos de privacidad.
- Despliegue en local con Ollama, LM Studio, `mlx-lm` o `llama.cpp`: el repositorio GitHub ofrece lanzadores de un solo comando y una evaluación local `Smoke-60` para validar el comportamiento antes de integrarlo en un producto.
- Procesamiento por lotes de romanización en pipelines de datos: la salida determinista con `temperature: 0` y prompt de sistema vacío facilita la normalización de corpus multilingües escritos en ASCII.

## Benchmarks y rendimiento

La model card reporta resultados de la familia, no exclusivamente del checkpoint de 0.8B. Los datos disponibles son:

| Modelo / suite | Resultado | Referencia comparada |
|---|---|---|
| Transliteration-2.0-9B · suite `v4` de 708 casos (strict accuracy) | 92,09 % | +1,27 pp frente a DeepSeek V4.1 Flash (con prompt de sistema de ~2.800 tokens) |
| Transliteration-2.0-9B · `Core-5` | 90,94 % | +0,64 pp frente a la nube |
| Transliteration-2.0-9B · `Dogfood-30` | 76,7 % | iguala a la nube |
| Transliteration-2.0-9B · `OOD-Unseen-20` (reparación de sonda) | 90,0 % (18/20) | no disponible |

No se han publicado resultados de benchmarks específicos del checkpoint 0.8B en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,5 GB solo para pesos (752 millones de parámetros a 2 bytes), más overhead de activaciones y caché KV.
- Huella en disco: 4,5 GB de repositorio; las variantes ligeras ocupan aproximadamente 0,5-0,7 GB según la model card.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM para BF16; las variantes GGUF Q4_K_M reducen el requisito por debajo de 1 GB.
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, RTX 4090 y similares; también en Apple Silicon mediante MLX 6-bit.
- Opciones de despliegue: transformers, vLLM, llama.cpp, Ollama, LM Studio, `mlx-lm` y WebAssembly en navegador.
- Latencia y throughput: la model card indica latencia de razonamiento cero y salida desde el primer token; no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UnimeType Transliteration 2.0 0.8B (v2.6) | 752 M | no disponible | Transliteración IME, 12 idiomas | Apache 2.0 | HF (safetensors, MLX, GGUF) |
| UnimeType Transliteration 2.0 4B | no disponible | no disponible | Transliteración IME, 12 idiomas | Apache 2.0 | HF (safetensors, MLX, GGUF) |
| UnimeType Transliteration 2.0 9B | no disponible | no disponible | Transliteración IME, 12 idiomas | Apache 2.0 | HF (safetensors, MLX, GGUF) |
| Qwen/Qwen3.5-0.8B (modelo base) | ~0,8 B | no disponible | LLM de propósito general | no disponible | HF |

No se dispone de datos de benchmarks del checkpoint 0.8B que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo especializado: no es un chatbot de propósito general y su uso fuera de la tarea de transliteración producirá resultados no fiables.
- El protocolo exige mensaje de usuario en JSON compacto, prompt de sistema vacío y `temperature: 0`; desviarse de este formato degrada la salida.
- No se documentan sesgos específicos, pero al derivar de un LLM base puede heredar sesgos de sus datos de preentrenamiento.
- Riesgo de alucinación en entradas ambiguas o fuera de distribución; la model card menciona el mecanismo `UNIMETYPE_NO_ALTERNATIVE` para conjuntos cerrados, pero no cubre todos los casos.
- La longitud de contexto no está publicada, lo que limita la planificación de entradas largas.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-0.8B.
- Los benchmarks publicados corresponden a la variante 9B; no hay métricas propias del 0.8B.
- La recuperación de erratas y los léxicos dinámicos pueden introducir falsos positivos si el léxico no está bien curado.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/UnimeType/Transliteration-2.0-0.8B-Safetensors
- Variante MLX 6-bit: https://huggingface.co/UnimeType/Transliteration-2.0-0.8B
- Variante GGUF: https://huggingface.co/UnimeType/Transliteration-2.0-0.8B-GGUF
- Variante 4B (safetensors): https://huggingface.co/UnimeType/Transliteration-2.0-4B-Safetensors
- Variante 9B (safetensors): https://huggingface.co/UnimeType/Transliteration-2.0-9B-Safetensors
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio GitHub (toolkit, Ollama, especificación short-v3): https://github.com/UnimeType/transliteration
- Space de demostración: https://huggingface.co/spaces/UnimeType/Transliteration-Playground
- Aplicación de teclado: https://unimetype.com/download
- Metodología de evaluación: https://unimetype.com/blog/how-we-evaluate-transliteration-models
- Sitio del proyecto: https://unimetype.com/
