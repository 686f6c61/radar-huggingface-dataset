# UnimeType/Transliteration-4B-GGUF

## Resumen

UnimeType Transliteration-4B es un modelo de conversión de escritura desarrollado por UnimeType, diseñado para transformar texto romanizado en sistemas de escritura nativos. Convierte Pinyin a chino simplificado, Romaji a japonés, Hindi romanizado y Hinglish a devanagari, y Arabizi a árabe, preservando al mismo tiempo palabras en inglés, URLs, código, números, puntuación y emojis en mensajes de lenguaje mixto. El modelo se basa en Qwen/Qwen3.5-4B, con un ajuste fino mediante LoRA sobre una versión cuantizada a 4 bits del modelo base.

El problema que resuelve es la normalización de escritura en entornos donde los usuarios escriben lenguas no latinas con teclados latinos, manteniendo intactos los elementos técnicos que suelen perderse en procesos de transliteración automática. Es relevante para aplicaciones de mensajería, redes sociales, preprocesamiento de texto y flujos de trabajo que mezclan código y lenguaje natural. El modelo tiene 4.205.751.296 parámetros (4,2B) y se distribuye en formato GGUF, con una longitud de contexto de 16.384 tokens utilizada en las pruebas documentadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen/Qwen3.5-4B) |
| Parametros totales | 4.205.751.296 (4,2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 16.384 tokens (valor usado en las pruebas con llama.cpp; el máximo no está documentado) |
| Tipos de cuantizacion | Q8_0 (archivo GGUF); MLX 6-bit (formato MLX); Safetensors (precisión no especificada) |
| Idiomas soportados | en, zh, ja, hi, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q8_0), Safetensors, MLX 6-bit |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Qwen3.5-4B mediante LoRA, aplicado sobre una versión cuantizada a 4 bits del modelo base. El archivo GGUF se generó a partir del checkpoint en formato Safetensors, que a su vez fue exportado desde la fusión en punto flotante utilizada para crear la versión MLX 6-bit. El dataset de entrenamiento no es público: no se incluyen conjuntos de datos, scripts de generación, código de entrenamiento ni registros.

La innovación principal reside en la preservación de literales protegidos durante la conversión: palabras en inglés, URLs, fragmentos de código, números, secuencias de puntuación y emojis se mantienen en su forma original dentro de mensajes mixtos. No se menciona el uso de RLHF ni DPO. El modelo está pensado exclusivamente para conversión de escritura, no para traducción, pulido de texto ni explicación.

## Capacidades

- Conversión de Pinyin a chino simplificado.
- Conversión de Romaji a japonés.
- Conversión de Hindi romanizado y Hinglish a devanagari.
- Conversión de Arabizi a árabe.
- Preservación de palabras en inglés, URLs, código, números, puntuación y emojis en mensajes mixtos.
- Soporte de conversaciones multi-turno mediante el endpoint OpenAI-compatible.
- Modo thinking disponible en el modelo base, pero se recomienda desactivarlo para tareas de conversión (`--reasoning off` y `enable_thinking: false`).
- Soporte de tool calling y function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.

## Casos de uso

- Conversión de mensajes en Pinyin a chino simplificado en aplicaciones de mensajería: el modelo transforma texto escrito con teclado latino a caracteres chinos, preservando nombres de productos, enlaces y números que aparecen en la conversación.
- Normalización de Hinglish a hindi devanagari en redes sociales: permite convertir publicaciones escritas en Hinglish a escritura devanagari sin alterar hashtags, menciones y URLs incrustados.
- Preprocesamiento de textos mixtos para NLP: antes de analizar comentarios o documentos que mezclan inglés con lenguas romanizadas, el modelo convierte la parte romanizada a su escritura nativa mientras mantiene intactos los identificadores técnicos, lo que facilita el análisis posterior.
- Asistencia en entornos de desarrollo: al escribir comentarios de código o documentación en lenguas romanizadas, el modelo convierte el texto a la escritura nativa sin romper fragmentos de código, literales numéricos ni rutas de archivo.
- Conversión de Romaji a japonés en herramientas de subtitulado: el modelo transforma transcripciones en Romaji a escritura japonesa, conservando nombres de marcas, URLs y puntuación.
- Integración en pipelines de localización: para contenido que alterna entre inglés y árabe o hindi romanizado, el modelo genera versiones normalizadas en escritura nativa, facilitando la revisión humana y la traducción posterior.

## Benchmarks y rendimiento

La model card del autor incluye resultados observados del pipeline de producción con el archivo Q8_0, ejecutado en un Apple M5 Pro con 48 GB de memoria. Se trata de resultados del pipeline del autor, no de un benchmark independiente ni ciego.

| Check del pipeline | Resultado |
|---|---|
| Fixed conversion suite, exact accepted output | 101 / 127 |
| Conversational-context suite, valid-reference exact agreement | 14 / 71 |
| Context structure and protected-literal count checks | 74 / 76 |
| Protected-literal count and order, eligible cases | 31 / 32 |
| Latin-word preservation, eligible fixed-suite cases | 47 / 48 |
| URL preservation, eligible context cases | 16 / 16 |
| Code-span preservation, eligible context cases | 16 / 16 |
| Numeric-literal preservation, eligible context cases | 16 / 16 |
| Punctuation-sequence preservation, eligible context cases | 15 / 16 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no se han publicado requisitos oficiales. Los pesos Q8_0 ocupan aproximadamente 4,5 GB. Con contexto de 16.384 tokens, se estima un consumo de 6-8 GB de VRAM, pero esta cifra no está verificada.
- GPU recomendadas: el autor probó exclusivamente en Apple M5 Pro con 48 GB de memoria unificada y llama.cpp con Metal. NVIDIA CUDA, AMD ROCm, iOS, Android y LM Studio no están verificados para este archivo.
- Compatibilidad con GPU de consumo: no confirmada. Se requiere una GPU con al menos 8 GB de VRAM para ejecutar Q8_0 con contexto moderado, según estimaciones no oficiales.
- Opciones de despliegue: llama.cpp mediante `llama-server` con endpoint OpenAI-compatible en `/v1/chat/completions`; MLX para Apple Silicon; Safetensors para frameworks basados en PyTorch.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han identificado modelos comparables de la misma categoría en la información disponible. El propio modelo se distribuye en tres formatos, con diferencias relevantes para el despliegue:

| Variante | Formato | Cuantización | Entorno de ejecución |
|---|---|---|---|
| Transliteration-4B-Convert-Q8_0.gguf | GGUF | Q8_0 | llama.cpp |
| Transliteration-4B (MLX 6-bit) | MLX | 6-bit | Apple Silicon |
| Transliteration-4B-Safetensors | Safetensors | Precisión no especificada | Frameworks PyTorch |

## Limitaciones y advertencias

- El dataset de entrenamiento no es público; no hay transparencia sobre su composición ni sobre los datos de evaluación.
- Los resultados del pipeline no son un benchmark independiente. Las referencias de contexto son generadas por el propio modelo y no han sido revisadas por hablantes nativos.
- Un caso de contexto en árabe produjo un salto de línea adicional y falló la comprobación de formato.
- Fragmentos cortos en inglés pueden convertirse en lugar de preservarse.
- Un caso de contexto en japonés perdió puntuación y un emoji.
- Nombres ambiguos, elecciones de dialecto y fragmentos cortos pueden producir conversiones incorrectas.
- La preservación de literales protegidos no está garantizada; se recomienda revisar el texto antes de reemplazarlo.
- La precisión en punto flotante no restaura la precisión original del modelo base previa a la cuantización.
- El archivo GGUF no es una de-cuantización del modelo MLX 6-bit ni una sustitución por el modelo Qwen sin ajustar.
- No se ha verificado el funcionamiento con NVIDIA CUDA, AMD ROCm, iOS, Android ni LM Studio.
- La licencia Apache 2.0 permite uso comercial, pero se debe revisar la licencia del modelo base Qwen3.5-4B.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/UnimeType/Transliteration-4B-GGUF
- Checkpoint Safetensors: https://huggingface.co/UnimeType/Transliteration-4B-Safetensors
- Versión MLX 6-bit: https://huggingface.co/UnimeType/Transliteration-4B
- Sitio web de UnimeType: https://unimetype.com/
- Guía de configuración MLX en LM Studio: https://unimetype.com/blog/run-transliteration-4b-in-lm-studio
- Licencia del modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
