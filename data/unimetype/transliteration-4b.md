# UnimeType/Transliteration-4B

## Resumen

UnimeType Transliteration 4B es un modelo de generación de texto especializado en conversión de escritura (transliteración) para lenguajes que usan alfabetos latinos de forma romanizada. Desarrollado por UnimeType, está diseñado para convertir Pinyin (chino), Romaji (japonés), Hinglish (hindi romanizado) y Arabizi (árabe romanizado) a sus escrituras nativas, preservando al mismo tiempo palabras en inglés, nombres de productos, enlaces, código, números, puntuación y emojis. El modelo se basa en Qwen3.5-4B, un transformer de 4 mil millones de parámetros, y se distribuye en formato MLX con cuantización de 6 bits, lo que lo hace adecuado para ejecución local en hardware de Apple Silicon.

La relevancia de este modelo radica en su enfoque en la escritura mixta cotidiana, donde los usuarios combinan romanización con términos en inglés o elementos técnicos. A diferencia de los sistemas de transliteración tradicionales basados en reglas, este modelo utiliza aprendizaje profundo para manejar contextos ambiguos y preservar elementos que no deben traducirse. Está pensado para integrarse en teclados o aplicaciones de escritura multilingüe, como la experiencia Convert de UnimeType, y ofrece una alternativa ligera y local frente a soluciones basadas en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-4B) |
| Parametros totales | 4B class (segun autor); 920.759.296 en safetensors |
| Longitud de contexto | No disponible (se menciona 2048 tokens para validacion) |
| Tipos de cuantizacion | 6-bit affine, group size 64 |
| Idiomas soportados | en, zh, ja, hi, ar (ingles, chino, japones, hindi, arabe) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino (fine-tuning) del modelo base Qwen3.5-4B, un transformer autoregresivo de 4 mil millones de parametros. No se han publicado detalles sobre el dataset de entrenamiento ni el proceso de ajuste (por ejemplo, si se uso RLHF o DPO). La innovacion principal del modelo reside en su capacidad para manejar texto mixto: identifica segmentos romanizados que deben convertirse y los transforma a la escritura objetivo, mientras que los elementos en ingles, codigo, URLs, numeros y emojis se mantienen intactos. El modelo esta optimizado para mensajes cortos y conversacionales, con una longitud de salida recomendada de 128 tokens y una temperatura de 0 para resultados deterministicos.

## Capacidades

- Conversion de Pinyin a caracteres chinos simplificados, incluyendo pinyin sin marcas tonales.
- Conversion de Romaji a japones (kanji, hiragana y katakana).
- Conversion de hindi romanizado y Hinglish a escritura devanagari.
- Conversion de Arabizi y arabe romanizado conversacional a escritura arabe.
- Preservacion de palabras en ingles, nombres de productos, enlaces, direcciones de correo, codigo, numeros, puntuacion, saltos de linea, Markdown y emojis.
- Manejo de texto que ya esta en la escritura objetivo, sin modificarlo.
- Generacion de texto directo, sin modo de razonamiento ni explicaciones adicionales.
- No soporta tool calling, agentes ni capacidades multimodales.

## Casos de uso

- Teclado de transliteracion para mensajeria: un usuario escribe en pinyin o romaji en un teclado latino y el modelo convierte el texto a chino o japones antes de enviarlo, manteniendo terminos en ingles como nombres de marcas o jerga tecnica.
- Asistente de escritura para redes sociales: permite redactar publicaciones en hindi o arabe usando el alfabeto latino, con preservacion de hashtags, menciones y emojis.
- Herramienta de correccion de textos mixtos: convierte documentos o chats que mezclan romanizacion con ingles, manteniendo la estructura original y los elementos no traducibles.
- Integracion en aplicaciones de traduccion asistida: el modelo puede preprocesar texto romanizado para convertirlo a escritura nativa antes de una traduccion automatica, mejorando la precision en lenguajes como hindi o arabe.
- Generacion de subtitulos o transcripciones: convierte transcripciones romanizadas de audio a escritura nativa, preservando nombres propios y terminos tecnicos en ingles.
- Educacion y aprendizaje de idiomas: ayuda a estudiantes a ver la escritura correcta de palabras en chino, japones, hindi o arabe a partir de su romanizacion, con ejemplos contextuales.

## Benchmarks y rendimiento

La model card publica resultados de evaluacion con coincidencia exacta del texto final. Una prueba pasa solo si la salida completa coincide con una respuesta aceptada, incluyendo ingles preservado, puntuacion, codigo y espaciado.

| Runtime | Suite de conversion cotidiana | Suite multilingue reservada |
| --- | ---: | ---: |
| MLX directo | 98 / 127 | 57 / 104 |
| LM Studio | 94 / 127 | 57 / 104 |

No se han publicado comparaciones con otros modelos de transliteracion en la informacion disponible.

## Requisitos de hardware

- El modelo se distribuye en formato MLX, optimizado para Apple Silicon (Macs con chips M1 o posteriores).
- Tamano del archivo: 3.42 GB (cuantizacion 6-bit), por lo que requiere aproximadamente 4 GB de memoria unificada para cargar el modelo en memoria.
- Se puede ejecutar con MLX-LM o importarse en LM Studio (compatible con MLX).
- No se proporcionan datos de latencia ni throughput, pero al ser un modelo de 4B cuantizado, es adecuado para inferencia local en tiempo real en Macs con al menos 8 GB de RAM.
- No se menciona soporte para CUDA o GPUs de NVIDIA; el formato MLX esta disenado exclusivamente para Apple Silicon.

## Comparativa con modelos similares

No se dispone de informacion comparativa con otros modelos de transliteracion en la documentacion proporcionada. Existen alternativas como IndicXlit (para 21 lenguas indias) o herramientas basadas en reglas, pero no se han realizado comparaciones publicas con este modelo.

## Limitaciones y advertencias

- La evaluacion con coincidencia exacta es estricta: variaciones validas de ortografia o redaccion pueden contarse como errores, especialmente en nombres ambiguos, terminos dialectales o fragmentos muy cortos.
- El modelo esta disenado exclusivamente para conversion de escritura, no para traduccion, reescritura, pulido o explicacion de texto.
- Solo soporta cuatro idiomas objetivo (chino, japones, hindi y arabe) y sus respectivas romanizaciones; no cubre otros sistemas de escritura.
- No se han documentado sesgos especificos, pero al ser un modelo ajustado sobre Qwen3.5, puede heredar sesgos del modelo base.
- La longitud de contexto maxima no esta especificada; se recomienda un contexto de validacion de 2048 tokens, lo que limita su uso en documentos largos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B puede tener sus propias restricciones; se recomienda revisar la licencia del modelo base.

## Enlaces

- [HuggingFace - UnimeType/Transliteration-4B](https://huggingface.co/UnimeType/Transliteration-4B)
- [Sitio web de UnimeType](https://unimetype.com/)
- [Pagina de AI Keyboard Translator de UnimeType](https://unimetype.com/ai-keyboard-translator)
- [Modelo base Qwen3.5-4B en HuggingFace](https://huggingface.co/Qwen/Qwen3.5-4B)
