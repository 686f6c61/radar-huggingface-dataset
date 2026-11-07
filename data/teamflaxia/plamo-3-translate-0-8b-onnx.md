# TeamFlaxia/plamo-3-translate-0.8b-onnx

## Resumen

PLaMo 3 Translate 0.8B es un modelo de lenguaje especializado en traducción desarrollado por Preferred Networks (PFN), construido sobre PLaMo 3 NICT, un modelo preentrenado fruto de la investigación conjunta entre PFN y el National Institute of Information and Communications Technology (NICT) de Japón. Este repositorio concreto, publicado por TeamFlaxia, no contiene los pesos originales en formato nativo, sino una conversión a ONNX del checkpoint de 890 millones de parámetros, pensada para su ejecución en navegador y en entornos JavaScript mediante Transformers.js v4 y onnxruntime-web.

La relevancia de esta build radica en que traslada un modelo de traducción multilingüe de 52 idiomas al ecosistema web sin necesidad de backend: el paquete incluye variantes fp16, q4f16 y q4, y se integra como carga de trabajo `ai-inference` dentro de flaxia-crowd, una infraestructura de cómputo distribuido. El modelo base cubre una familia más amplia (0.8B, 2B, 8B y 31B) publicada por PFN en BF16 y formatos cuantizados FP8, W4A16, W4AFP8, NVFP4, GGUF y MLX-4bit.

La ficha describe tanto el modelo base como esta conversión ONNX, e incide en las particularidades técnicas de la traza (etiquetado `qwen3` en `config.json`, atención de ventana deslizante en 14 de 16 capas, YaRN en las capas de atención completa) y en las limitaciones conocidas del tokenizador convertido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Plamo3ForCausalLM), atención con ventana deslizante en 14/16 capas y atención completa con YaRN en las 2 restantes; RMSNorm con offset, QK-norm y proyecciones QKV/gate-up fusionadas |
| Parametros totales | 890 M (0.8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana deslizante de 2048 tokens en 14/16 capas; contexto máximo de las capas con atención completa no disponible en la información proporcionada |
| Tipos de cuantizacion | fp16, q4f16 (fp16 + int4 MatMulNBits), q4 (fp32 + int4 MatMulNBits); no se publican q8/int8/uint8 por inestabilidad numérica de la cuantización dinámica int8 en ORT |
| Idiomas soportados | 52 idiomas: ar, az, be, bg, bn, ca, ceb, de, en, es, et, eu, fa, fr, gu, he, hi, hr, hu, hy, id, it, ja, jv, ka, kk, km, ko, lt, lv, ml, mr, ms, my, ne, nl, pa, pl, ru, si, sk, sl, sr, sw, ta, te, th, tl, ur, uz, vi, zh |
| Licencia | plamo-community-license (Plamo Community License) |
| Formato de pesos | ONNX (`model_fp16.onnx`, `model_q4f16.onnx`, `model_q4.onnx`); el modelo base se distribuye en BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF y MLX-4bit |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 890 M de parámetros. La traza ONNX revela detalles internos: normalización RMSNorm con desplazamiento (`weight+offset`), QK-norm, proyecciones QKV y gate-up fusionadas, atención de ventana deslizante de 2048 tokens en 14 de las 16 capas, y atención completa con YaRN en las dos capas restantes, con RoPE theta por defecto de 1e4 en las capas deslizantes. La conversión etiqueta `config.json` como `model_type: qwen3` para que Transformers.js resuelva una clase decoder-only, aunque el grafo ONNX es una traza exacta del forward original de `Plamo3ForCausalLM`. El grafo recibe `input_ids`, `attention_mask` (int64) y `past_key_values.{0..15}.{key,value}`, y devuelve `logits` y `present.{0..15}.{key,value}`; no acepta `position_ids`, ya que el modelo original calcula las posiciones internamente a partir de la longitud de la caché.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. El modelo base se presenta como especializado en traducción y construido sobre PLaMo 3 NICT, el modelo preentrenado de la colaboración PFN-NICT. La build ONNX es una copia fp16 del checkpoint BF16 original, sin modificar los pesos, y el tokenizador es el vocabulario Unigram de Plamo convertido a `tokenizer.json` de Hugging Face. La cuantización q4f16 combina pesos fp16 con MatMulNBits int4, mientras que q4 mantiene activaciones fp32; la cuantización dinámica int8 se descartó por colapso del top-logit verificado contra el grafo fp32.

## Capacidades

- Traducción multilingüe entre 52 idiomas, con el japonés, el chino, el inglés y las principales lenguas europeas, asiáticas y de Oriente Medio cubiertas.
- Traducción con control de variante y registro mediante códigos de idioma dentro del prompt (por ejemplo `ja(easy)` o `zh-hans`), según la convención PFML3 del modelo base.
- Generación de texto autoregresiva con decodificación greedy (`do_sample: false`) o muestreo configurable (`temperature`, `top_p`, `top_k`).
- Ejecución en navegador mediante Transformers.js v4 y onnxruntime-web, con dispositivo `wasm`.
- Integración como carga de trabajo `ai-inference` en flaxia-crowd, con lista de permitidos fail-closed y revisión fijada por hash.
- Soporte de caché KV (`past_key_values`/`present`) para generación incremental token a token.
- No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Traducción en el navegador sin backend: con la variante q4f16 y Transformers.js sobre wasm, la aplicación puede traducir texto directamente en el cliente, evitando enviar contenido sensible a un servidor y eliminando costes de infraestructura.
- Traducción de documentación técnica en pipelines de CI/CD: el modelo puede procesar ficheros Markdown o cadenas de recursos en 52 idiomas antes del despliegue, con la variante fp16 como referencia de calidad y q4f16 para entornos con recursos limitados.
- Atención al cliente multilingüe en aplicaciones web: integrado en un widget JavaScript, permite traducir mensajes entrantes y respuestas salientes entre el usuario y el operador sin depender de una API externa de traducción.
- Procesamiento por lotes en nodos distribuidos: dentro de flaxia-crowd, el modelo se registra con revisión fijada y límite de bytes, lo que permite repartir cargas de traducción entre nodos con una política de modelos permitidos.
- Traducción de contenido generado por usuarios en foros y comunidades: la ventana deslizante de 2048 tokens en la mayoría de capas es adecuada para mensajes y publicaciones de longitud media, con la caché KV para respuestas incrementales.
- Localización de interfaces y cadenas de aplicación: la conversión del tokenizador a `tokenizer.json` permite usar el mismo vocabulario Plamo Unigram desde JavaScript, facilitando la integración con herramientas de i18n existentes.
- Prototipado e investigación en traducción de bajo coste: la disponibilidad de variantes fp16, q4f16 y q4 permite comparar calidad y latencia en el mismo runtime sin cambiar de framework.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 3,5 GB en total, pero la inferencia carga una sola variante. Con 890 M de parámetros, fp16 requiere aproximadamente 1,8 GB de pesos; q4f16 y q4 reducen el peso de los MatMul a int4, con un consumo sustancialmente menor, aunque la cifra exacta no está disponible en la información proporcionada.
- GPU recomendadas: no se especifican en la información disponible. El destino principal es la ejecución en navegador sobre wasm, sin GPU dedicada.
- Cabe en GPU de consumo: sí, por tamaño (0,8B), aunque no se documentan requisitos ni pruebas concretas en tarjetas como RTX 4090.
- Opciones de despliegue: Transformers.js v4 con onnxruntime-web (dispositivo `wasm`), y flaxia-crowd como carga de trabajo `ai-inference`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para esta build ONNX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| TeamFlaxia/plamo-3-translate-0.8b-onnx (esta ficha) | 890 M | ventana deslizante 2048 en 14/16 capas | 52 | plamo-community-license | ONNX (fp16, q4f16, q4) |
| pfnet/plamo-3-translate-0.8b | 890 M | no disponible | 52 | plamo-community-license | BF16 (checkpoint original) |
| pfnet/plamo-3-translate-0.8b-FP8 | 890 M | no disponible | 52 | plamo-community-license | FP8 |
| Familia PLaMo 3 Translate (2B, 8B, 31B) | 2B / 8B / 31B | no disponible | 52 | plamo-community-license | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX-4bit |

La comparación con modelos de otras familias (por ejemplo, modelos de traducción dedicados de otros proveedores) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El tokenizador convertido no reproduce el preprocesado personalizado de Plamo ("hard split" en torno a dos o más espacios consecutivos o cuatro o más caracteres repetidos), por lo que los tokens de frontera pueden diferir ligeramente en secuencias largas de espacios o caracteres repetidos.
- La cuantización dinámica int8 no se publica porque es numéricamente inestable en ORT (colapso del top-logit verificado contra el grafo fp32); deben usarse q4f16 o q4.
- El etiquetado `config.json` como `qwen3` es una solución de compatibilidad con Transformers.js, no una descripción real de la arquitectura; herramientas que infieran el modelo a partir de ese campo pueden comportarse de forma inesperada.
- El grafo no acepta `position_ids`; los consumidores que construyan entradas manualmente deben respetar esa convención.
- Los códigos de idioma del payload `src_lang`/`tgt_lang` de flaxia-crowd no se aplican a los prompts Plamo: los códigos deben ir dentro del texto del prompt.
- El prompt debe construirse con `apply_chat_template` y eliminarse el `<|plamo:bos|>` inicial, ya que el pipeline tokeniza con `add_special_tokens=true`.
- La licencia Plamo Community License impone condiciones propias para uso comercial; debe revisarse antes de desplegar en producción.
- No se documentan sesgos conocidos ni tasas de alucinación en la información disponible; como modelo de traducción, la fidelidad depende de la calidad del prompt y del par de idiomas.
- El contexto efectivo está limitado por la ventana deslizante de 2048 tokens en 14 de 16 capas, lo que condiciona la traducción de documentos largos.
- El repositorio no registra descargas ni likes en el momento de la consulta, por lo que no existe evidencia pública de uso en producción.

## Enlaces

- Repositorio ONNX: https://huggingface.co/TeamFlaxia/plamo-3-translate-0.8b-onnx
- Modelo base: https://huggingface.co/pfnet/plamo-3-translate-0.8b
- Variante FP8 del modelo base: https://huggingface.co/pfnet/plamo-3-translate-0.8b-FP8
- Colección PLaMo 3 Translate: https://huggingface.co/collections/pfnet/plamo-3-translate
- Licencia Plamo Community License: https://plamo.preferredai.jp/info/plamo-community-license-en
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
