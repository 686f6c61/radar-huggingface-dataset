# UnimeType/Transliteration-2.0-4B-Safetensors

## Resumen

UnimeType Transliteration 2.0 4B (v2.6) es un modelo de lenguaje especializado en transliteración para motores de entrada (IME) en local, desarrollado por UnimeType. Se trata de un fine-tuning del modelo base Qwen/Qwen3.5-4B en precisión BF16 sin cuantizar, con 4.205.751.296 parámetros, orientado a convertir texto romanizado o escrito en ASCII a la escritura nativa de 12 idiomas (13 modos de salida) sin abandonar un teclado ASCII estándar.

El modelo resuelve un problema concreto de usabilidad: permite mantener una distribución de teclado limpia para atajos de una sola tecla en Figma o Blender, comandos LaTeX, controles WASD en juegos o flujos de terminal, y convertir in-place el texto romanizado a escritura nativa solo cuando el usuario lo desea. Cubre pinyin chino, romaji japonés (modos natural y kana), hinglish hindi, arabizi árabe, ruso, griego, vietnamita, español, francés, portugués, alemán e italiano, preservando términos en inglés, handles, URLs, fragmentos de código, rutas de fichero, números y saltos de línea.

La versión v2.6 introduce un protocolo compacto JSON (`unimetype-convert-short-v3`) con prompt de sistema vacío (0 tokens de sobrecarga), recuperación de erratas por teclas adyacentes en escritura a ciegas, respeto de léxicos dinámicos y una plantilla de chat no-razonadora que emite texto convertido desde el primer token. Se distribuye bajo licencia Apache 2.0 y forma parte de una familia oficial con variantes de 0,8B, 4B y 9B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-4B, tag `qwen3_5_text`) |
| Parámetros totales | 4.205.751.296 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 (este repo); GGUF Q4_K_M y Q8_0 en repo hermano; MLX 6-bit en repo hermano |
| Idiomas soportados | en, zh, ja, hi, ar, ru, el, vi, es, fr, pt, de, it |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado del checkpoint BF16 sin cuantizar Qwen/Qwen3.5-4B, un transformer decoder-only de 4.205 millones de parámetros. La model card no detalla el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO; únicamente referencia el conjunto de datos como `dataset_v5.1`, con 12 idiomas y 13 modos de salida, e indica que el ajuste se realizó sobre pesos en BF16 estándar.

La innovación principal es de protocolo e ingeniería de inferencia más que de arquitectura: el formato `unimetype-convert-short-v3` envía un objeto JSON compacto como mensaje de usuario con prompt de sistema vacío, eliminando los aproximadamente 2.800 tokens de prompt de producción que usan alternativas en la nube. La plantilla de chat incorpora de forma incondicional el bloque `<|im_start|>assistant\n<think>\n\n</think>\n\n`, de modo que el modelo no genera tokens de razonamiento y emite la conversión desde el primer token. Además, v2.6 añade recuperación de erratas por transposición de teclas adyacentes (por ejemplo `shujuuk` → `数据库`), respeto de entradas dinámicas de léxico sin secuestro homófono y emisión controlada de `UNIMETYPE_NO_ALTERNATIVE` cuando se agotan las alternativas de reconversión.

## Capacidades

- Transliteración determinista de texto romanizado a escritura nativa en 12 idiomas y 13 modos de salida.
- Conversión de pinyin chino a hanzi, romaji japonés a natural o kana, hinglish a devanagari, arabizi a árabe, y romanización a ruso, griego, vietnamita, español, francés, portugués, alemán e italiano.
- Preservación de términos en inglés, `@handles`, URLs, fragmentos de código, rutas de fichero, números y saltos de línea durante la conversión.
- Recuperación de erratas por teclas adyacentes propias de escritura rápida a ciegas.
- Aplicación de léxicos dinámicos (contactos, marcas) sin falsos positivos por homofonía.
- Reconversión de conjuntos cerrados con señal explícita `UNIMETYPE_NO_ALTERNATIVE` al agotar alternativas.
- Plantilla de chat no-razonadora con salida inmediata desde el primer token.
- Compatible con endpoints y con clientes existentes de `Transliteration-2.0` (drop-in).
- No es un chatbot de propósito general: no se documenta tool calling, uso agéntico ni razonamiento multi-paso.

## Casos de uso

- Escritura multilingüe en el escritorio: el usuario mantiene una distribución ASCII y convierte in-place texto romanizado a la escritura nativa mediante la app UnimeType o una integración propia, sin cambiar de teclado entre Slack, Mail, WhatsApp, WeChat o LINE.
- Edición gráfica y 3D: al conservar el layout ASCII, los atajos de una sola tecla en Figma o Blender siguen funcionando mientras se redactan nombres de capa o etiquetas en escritura nativa.
- Documentación científica en LaTeX: permite escribir comandos LaTeX sin conflicto y convertir únicamente los fragmentos de prosa romanizada a la escritura objetivo en Overleaf.
- Desarrollo de software y terminal: al preservar rutas, identificadores y bloques de código, el modelo puede integrarse en editores o IDEs para comentarios y mensajes de commit en escritura nativa sin romper el código.
- Mensajería y atención al cliente multilingüe: conversión de borradores romanizados a escritura nativa para respuestas en chino, japonés, hindi, árabe o ruso, con latencia de primer token nula gracias al modo no-razonador.
- Procesamiento por lotes de corpus romanizados: normalización de grandes volúmenes de texto ASCII a escritura nativa en pipelines offline, con temperatura 0 para obtener salida determinista y reproducible.
- Aplicaciones móviles y de navegador: la variante de 0,8B de la familia permite inferencia WebAssembly en navegador; la de 4B cubre el escritorio con un consumo de 2,6 a 3,5 GB según el formato.
- Recuperación de erratas en entradas rápidas: corrección de transposiciones de teclas adyacentes en formularios o buscadores antes de la conversión a escritura nativa.

## Benchmarks y rendimiento

La model card no publica resultados del checkpoint de 4B. Los datos disponibles corresponden al modelo hermano de 9B y a conjuntos de evaluación internos:

| Modelo | Suite | Métrica | Resultado |
|---|---|---|---|
| Transliteration-2.0-9B | suite alineada v4 (708 casos) | precisión estricta | 92,09 % (+1,27 pp frente a DeepSeek V4.1 Flash) |
| Transliteration-2.0-9B | Core-5 | precisión estricta | 90,94 % (+0,64 pp frente a nube) |
| Transliteration-2.0-9B | Dogfood-30 | precisión | 76,7 % (igual que nube) |
| Transliteration-2.0-9B | OOD-Unseen-20 (reparación de sonda) | aciertos | 90,0 % (18/20) |
| Transliteration-2.0-4B | — | — | no disponible |

No se han publicado resultados de benchmarks del modelo de 4B en la información disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 8,4 GB solo para pesos (4.205 millones de parámetros × 2 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en GGUF Q8_0: en torno a 4,5 GB; en Q4_K_M, en torno a 2,6 a 3,5 GB según la model card.
- GPU recomendadas: A100 o H100 para servicio concurrente en BF16; RTX 4090 (24 GB) para BF16 con holgura; RTX 3090 o 4080 para GGUF Q8_0.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más usando GGUF Q4_K_M o Q8_0; en BF16 requiere al menos 12 GB.
- Opciones de despliegue: transformers, vLLM, llama.cpp, Ollama, LM Studio, mlx-lm en Apple Silicon (variante MLX 6-bit) y WebAssembly en navegador para la variante de 0,8B.
- Latencia y throughput: no disponibles de forma numérica; la plantilla no-razonadora elimina la latencia de tokens de pensamiento y emite la salida desde el primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UnimeType Transliteration 2.0 4B (v2.6) | 4,2B | no disponible | Transliteración IME, 12 idiomas | Apache 2.0 | HF: safetensors, GGUF, MLX |
| UnimeType Transliteration 2.0 0.8B | 0,8B (aprox.) | no disponible | Transliteración IME, misma familia | Apache 2.0 | HF: safetensors, GGUF, MLX |
| UnimeType Transliteration 2.0 9B | 9B (aprox.) | no disponible | Transliteración IME, máxima precisión offline | Apache 2.0 | HF: safetensors, GGUF, MLX |
| Qwen/Qwen3.5-4B (modelo base) | 4,2B | no disponible | LLM de propósito general | no disponible en la información | HF |

No se dispone de datos de benchmarks del 4B que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo especializado: no es un chatbot de propósito general; usarlo fuera del protocolo JSON compacto puede producir salidas no deseadas.
- La model card no documenta sesgos lingüísticos, culturales o de representación del corpus de entrenamiento.
- Riesgo de alucinación en la selección de caracteres homófonos cuando el contexto es ambiguo o el léxico no está definido.
- La longitud de contexto no está publicada; no se debe asumir una ventana amplia para entradas largas.
- Los idiomas de la tarjeta HF (en, zh, ja, hi, ar) son un subconjunto de los 12 declarados en la model card; conviene verificar la cobertura real por idioma en producción.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B puede tener condiciones adicionales que deben revisarse.
- El uso determinista depende de fijar `temperature: 0`; otros valores rompen la reproducibilidad esperada en un IME.
- La recuperación de erratas y el respeto de léxicos dinámicos se documentan cualitativamente, sin tasas de error publicadas para el checkpoint de 4B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/UnimeType/Transliteration-2.0-4B-Safetensors
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Variante 0.8B (MLX): https://huggingface.co/UnimeType/Transliteration-2.0-0.8B
- Variante 0.8B (Safetensors): https://huggingface.co/UnimeType/Transliteration-2.0-0.8B-Safetensors
- Variante 0.8B (GGUF): https://huggingface.co/UnimeType/Transliteration-2.0-0.8B-GGUF
- Variante 4B (MLX): https://huggingface.co/UnimeType/Transliteration-2.0-4B
- Variante 4B (GGUF): https://huggingface.co/UnimeType/Transliteration-2.0-4B-GGUF
- Variante 9B (MLX): https://huggingface.co/UnimeType/Transliteration-2.0-9B
- Variante 9B (Safetensors): https://huggingface.co/UnimeType/Transliteration-2.0-9B-Safetensors
- Variante 9B (GGUF): https://huggingface.co/UnimeType/Transliteration-2.0-9B-GGUF
- Repositorio de inferencia local y especificación short-v3: https://github.com/UnimeType/transliteration
- Playground interactivo: https://huggingface.co/spaces/UnimeType/Transliteration-Playground
- Descarga de la app de teclado: https://unimetype.com/download
- Metodología de evaluación: https://unimetype.com/blog/how-we-evaluate-transliteration-models
- Sitio del proyecto: https://unimetype.com/
