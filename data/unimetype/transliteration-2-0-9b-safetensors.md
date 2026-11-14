# UnimeType/Transliteration-2.0-9B-Safetensors

## Resumen

UnimeType Transliteration 2.0 9B es un modelo de conversión (transliteración) para teclados de entrada (IME) desarrollado por UnimeType, afinado a partir de Qwen/Qwen3.5-9B en BF16 sin cuantizar. Su función es convertir texto romanizado o escrito en ASCII a escritura nativa en 12 idiomas (13 modos de salida): pinyin chino, romaji japonés (modos `natural` y `kana`), hinglish hindi, arabizi árabe, ruso, griego, vietnamita, español, francés, portugués, alemán e italiano. No es un chatbot generalista, sino un motor determinista de conversión pensado para ejecutarse en local.

La versión v2.6 amplía el soporte desde 4 idiomas (zh, ja, hi, ar) hasta los 12 actuales, con un protocolo compacto de mensaje JSON de una sola línea (`unimetype-convert-short-v3`) que no requiere system prompt. Incorpora además reparación de erratas por teclas adyacentes en mecanografía rápida (por ejemplo, `shujuuk` → 数据库) y respeto de glosarios dinámicos sin falsos positivos por homófonos.

El modelo tiene 8.953.803.264 parámetros (aproximadamente 9B) y se distribuye en safetensors BF16 (17,9 GB de repositorio), con licencia Apache 2.0. Su relevancia actual radica en que ofrece una alternativa offline y determinista a los servicios en la nube para entrada multilingüe, con una precisión declarada por el autor que supera ligeramente a DeepSeek V4.1 Flash en los conjuntos de evaluación internos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B; tag `qwen3_5_text`) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (este repo); la familia ofrece MLX 6-bit y GGUF Q4_K_M y Q8_0 en repos separados |
| Idiomas soportados | en, zh, ja, hi, ar, ru, el, vi, es, fr, pt, de, it |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16); también MLX y GGUF en otros repositorios de la familia |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del transformer Qwen3.5-9B, tal como indica la model card (`base_model: Qwen/Qwen3.5-9B`). No se especifican en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La model card menciona un `dataset_v5.1` como base del release v2.6, pero no aporta cifras de tamaño ni metodología de alineación.

La innovación técnica principal es el protocolo `unimetype-convert-short-v3`: un mensaje de usuario en JSON compacto de una sola línea con system prompt vacío (cero tokens de prefijo), lo que reduce la latencia y el coste de contexto. La plantilla de chat incluye de forma incondicional el bloque `<|im_start|>assistant\n<think>\n\n</think>\n\n`, de modo que el modelo emite el texto convertido en el primer token sin generar tokens de razonamiento. También incorpora reparación de erratas por teclas adyacentes y emisión de la señal `UNIMETYPE_NO_ALTERNATIVE` cuando se agotan las alternativas de reconversión.

## Capacidades

- Conversión de texto romanizado a escritura nativa en 12 idiomas y 13 modos de salida (incluye romaji japonés en modo `natural` y `kana`).
- Preservación de términos en inglés insertados en línea, menciones `@handles`, URL, fragmentos de código, rutas de fichero, números y saltos de línea.
- Reparación de erratas por teclas adyacentes típicas de mecanografía rápida (transposiciones).
- Respeto de glosarios dinámicos (`lexicon`) con entradas de contacto o marca sin secuestro por homófonos.
- Emisión determinista con `temperature: 0` y sin tokens de razonamiento (chat template no-thinking).
- Compatibilidad con endpoints (`endpoints_compatible`) y con clientes existentes de `Transliteration-2.0`.
- No se documentan capacidades de tool calling, agentes, visión, audio ni razonamiento multi-paso; el modelo está especializado exclusivamente en transliteración.

## Casos de uso

- Escritura multilingüe en el escritorio: el modelo permite mantener una distribución ASCII limpia y convertir en el sitio solo cuando se desea escritura nativa, integrándose en la app UnimeType para macOS, Windows, Linux, iOS, Android y ChromeOS.
- Entrada de pinyin en chino: un usuario escribe `qing xian zai staging huanjing...` y el modelo devuelve el texto en caracteres chinos conservando los términos técnicos en inglés y las URL intactos.
- Entrada de romaji en japonés: conversión a kana o a escritura natural para usuarios que prefieren teclado latino, útil en entornos donde no hay IME nativo instalado.
- Mensajería instantánea multiaplicación: al no requerir cambio de teclado entre Slack, Mail, WhatsApp, WeChat o LINE, resulta adecuado para flujos de conversación que alternan idiomas a mitad de frase.
- Entornos de desarrollo y terminal: al preservar código, rutas y números, el modelo puede usarse para escribir comentarios o documentación en escritura nativa sin romper comandos ni fragmentos de código.
- Reparación de erratas en mecanografía rápida: la recuperación de transposiciones de teclas adyacentes reduce la fricción en escritura veloz sin necesidad de corrección manual.
- Despliegue offline en dispositivo: las variantes de la familia (0.8B, 4B, 9B) permiten elegir el equilibrio entre huella de memoria y precisión, desde WASM en navegador hasta 9B en escritorio.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (conjuntos internos de evaluación, no benchmarks estándar de la comunidad):

| Conjunto de evaluacion | Resultado | Comparativa declarada |
|---|---|---|
| Suite alineada v4 (708 casos) | 92,09 % de precisión estricta | +1,27 pp frente a DeepSeek V4.1 Flash (con system prompt de producción de ~2.800 tokens) |
| Core-5 | 90,94 % | +0,64 pp frente a la nube |
| Dogfood-30 | 76,7 % | Igual que la nube |
| OOD-Unseen-20 (reparación de sonda) | 90,0 % (18/20) | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, lo cual es coherente con la naturaleza especializada del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 18 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica conviene disponer de 24 GB o más.
- La familia ofrece variantes más ligeras: 0.8B (~0,5–0,7 GB), 4B (~2,6–3,5 GB) y 9B cuantizado (~5,6–7,4 GB en MLX 6-bit o GGUF).
- GPU recomendadas: A100 o H100 para BF16 con holgura; RTX 4090 (24 GB) puede alojar el 9B en BF16 con margen ajustado, y con más comodidad en cuantización.
- En GPU de consumo: el 9B en GGUF Q4_K_M o Q8_0 cabe en tarjetas de 8–12 GB; el 0.8B está pensado para móvil y navegador vía WebAssembly.
- Opciones de despliegue: transformers, vLLM, llama.cpp, LM Studio, Ollama, mlx-lm (Apple Silicon) y el espacio de playground en WebAssembly.
- Latencia y throughput: no disponibles de forma numérica; el autor destaca la emisión en el primer token sin tokens de razonamiento como principal ventaja de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UnimeType Transliteration 2.0 9B | ~8,95B | no disponible | Transliteración IME, 12 idiomas | Apache 2.0 | HF (safetensors, MLX, GGUF) |
| UnimeType Transliteration 2.0 4B | ~4B (no confirmado) | no disponible | Transliteración IME, misma familia | Apache 2.0 | HF (safetensors, MLX, GGUF) |
| UnimeType Transliteration 2.0 0.8B | ~0,8B (no confirmado) | no disponible | Transliteración IME, móvil y WASM | Apache 2.0 | HF (safetensors, MLX, GGUF) |
| DeepSeek V4.1 Flash | no disponible | no disponible | Modelo generalista en la nube | no disponible | Servicio en la nube |

No se dispone de datos de otros modelos especializados en transliteración comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo es un motor de conversión especializado, no un chatbot generalista; usarlo para diálogo abierto producirá resultados fuera de su dominio.
- La precisión declarada proviene de conjuntos de evaluación internos del autor (v4, Core-5, Dogfood-30, OOD-Unseen-20), no de benchmarks independientes; conviene validarla en el dominio propio.
- Riesgo de errores en homófonos y en entradas ambiguas; el autor menciona explícitamente el riesgo de secuestro por homófonos en glosarios, mitigado pero no eliminado.
- La longitud de contexto no está documentada, lo que limita la planificación de despliegues con entradas largas.
- El rendimiento en idiomas fuera de los 12 declarados no está garantizado.
- Aunque la licencia es Apache 2.0 y permite uso comercial, debe verificarse el cumplimiento de las condiciones del modelo base Qwen3.5-9B.
- No se documentan sesgos específicos; al derivar de un modelo generalista, puede heredar sesgos de su base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/UnimeType/Transliteration-2.0-9B-Safetensors
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Variante MLX 6-bit 9B: https://huggingface.co/UnimeType/Transliteration-2.0-9B
- Variante GGUF 9B: https://huggingface.co/UnimeType/Transliteration-2.0-9B-GGUF
- Variante 4B (MLX): https://huggingface.co/UnimeType/Transliteration-2.0-4B
- Variante 4B (safetensors): https://huggingface.co/UnimeType/Transliteration-2.0-4B-Safetensors
- Variante 4B (GGUF): https://huggingface.co/UnimeType/Transliteration-2.0-4B-GGUF
- Variante 0.8B (MLX): https://huggingface.co/UnimeType/Transliteration-2.0-0.8B
- Variante 0.8B (safetensors): https://huggingface.co/UnimeType/Transliteration-2.0-0.8B-Safetensors
- Variante 0.8B (GGUF): https://huggingface.co/UnimeType/Transliteration-2.0-0.8B-GGUF
- Playground interactivo: https://huggingface.co/spaces/UnimeType/Transliteration-Playground
- Descarga de la app de teclado: https://unimetype.com/download
- Metodología de evaluación y guía de LM Studio: https://unimetype.com/blog/how-we-evaluate-transliteration-models
- Sitio del proyecto: https://unimetype.com/
