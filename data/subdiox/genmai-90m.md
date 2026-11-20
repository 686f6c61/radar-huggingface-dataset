# subdiox/genmai-90M

## Resumen

genmai-90M es un modelo de conversión kana-kanji (henkan) para japonés, es decir, transforma una lectura en katakana en texto japonés con la ortografía correcta, opcionalmente condicionado por el contexto previo al cursor. Lo desarrolla subdiox como variante ligera de su modelo genmai-310M, del que se destila, y está pensado para dispositivos con poca memoria, como un iPhone. Es relevante porque demuestra que un modelo de 90 millones de parámetros puede superar en precisión a alternativas más grandes en la tarea concreta de conversión de entrada para IME.

El modelo emplea una arquitectura GPT-2 con vocabulario a nivel de carácter de 6.000 entradas, 12 capas y 768 dimensiones ocultas, entrenado mediante destilación de conocimiento desde genmai-310M sobre un corpus de frases japonesas leídas automáticamente. Incluye además una conversión a Core ML para ejecutarse en el Neural Engine de Apple, con pesos int8 y decodificación por haces de 5.

Su interés práctico radica en que ofrece una alternativa de código abierto (CC BY-SA 4.0) para integrar conversión kana-kanji en aplicaciones de escritura japonesa, con un consumo de memoria de proceso de 50 a 90 MB y una latencia de unos 4 ms por paso de decodificación en un M4 Pro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only) |
| Parametros totales | 90.450.432 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens de prompt en Core ML; contexto izquierdo de hasta 500 caracteres en el formato de prompt; salida de 64 tokens por fragmento |
| Tipos de cuantizacion | fp32 (safetensors), int8 simetrica por canal (Core ML), fp16 (estados KV en Core ML) |
| Idiomas soportados | japones (ja) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (fp32, 362 MB), Core ML package (int8, 82 MB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de tipo GPT-2 con 12 capas, 768 dimensiones ocultas y un vocabulario a nivel de carácter de 6.000 entradas. Parte del modelo base zenz-v3.2-small (Miwa-Keita/zenz-v3.2-small-gguf, licencia Apache-2.0), desconectado del GGUF Q5_K_M, y se entrena por destilación desde genmai-310M, que actúa como profesor. En cada posición de salida la pérdida combina una entropía cruzada contra la referencia (peso 0,5), una divergencia KL contra la distribución del profesor (peso 0,5) y una pérdida auxiliar de modelo de lenguaje de siguiente carácter sobre el texto previo al cursor (peso 0,3); ambos modelos comparten vocabulario.

El entrenamiento se organiza en tres etapas: aproximadamente 3 millones de frases leídas automáticamente (Wikipedia, FineWeb-2 Japanese, Aozora Bunko, actas parlamentarias) y frases con palabras raras del diccionario Mozc; unos 3,2 millones de frases adicionales de Wikipedia y FineWeb-2; y una etapa final con datos curados (elementos revisados a mano, frases sintéticas y homófonas generadas con Claude, correcciones juzgadas por LLM) con replay de los datos anteriores. El formato de prompt es propietario (zenzlc) y usa caracteres de uso privado U+EE00, U+EE01 y U+EE02 como marcadores de entrada, salida y contexto.

## Capacidades

- Conversión kana-kanji: transforma una lectura en katakana en texto japonés con la ortografía correcta.
- Condicionamiento por contexto: acepta hasta 500 caracteres de texto previo al cursor para desambiguar homófonos.
- Generación de texto a nivel de carácter con vocabulario de 6.000 entradas.
- Decodificación por búsqueda de haces (5 haces) con ordenación por suma de log-probabilidades.
- Ejecución en el Neural Engine de Apple mediante Core ML, con funciones de prefill y decode.
- División automática de lecturas largas en fragmentos de hasta 40 caracteres cortando en 、 y 。
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Teclado japonés en iOS: integración del paquete Core ML en una aplicación de entrada para convertir lecturas en texto con una huella de proceso de 50 a 90 MB, adecuada para iPhone.
- Autocompletado de escritura en macOS: uso del modelo con el Neural Engine en un M4 Pro, con unos 4 ms por paso de decodificación y 5 haces.
- Corrección de homófonos en edición de textos: el contexto previo de hasta 500 caracteres permite desambiguar palabras como 母は歯が痛いらしい frente a lecturas alternativas.
- Procesamiento por lotes de transcripciones: conversión de lecturas katakana generadas por un OCR o un sistema de reconocimiento de voz a texto japonés con ortografía correcta.
- Normalización de datos japoneses: conversión de campos de lectura en bases de datos (nombres, direcciones) a su forma kanji, con la ventaja de ser un modelo pequeño y desplegable en CPU.
- Investigación en destilación: uso como caso de estudio de destilación de un modelo de 310M a 90M manteniendo precisión en una tarea concreta, con el código de conversión Core ML disponible.
- Aplicaciones de escritura sin conexión: despliegue local en dispositivos con poca memoria sin depender de servicios en la nube, gracias a los 82 MB del paquete Core ML.

## Benchmarks y rendimiento

Resultados de precisión top-1 con tamaño de haz 5, según la model card:

| Conjunto | genmai-90M (bf16) | genmai-310M (bf16) | Zenzai (zenz-v3.2-small, azooKey) |
|---|---|---|---|
| AJIMEE-Bench (200) | 91,0 % | 95,0 % | 85,5 % |
| Frases cotidianas | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto |
| ime_v1 dev | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto |
| Homófonos (precisión a nivel de palabra) | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto |
| Frases difíciles (28) | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto |

En la comparación con los pesos en 8 bits en GPU, el modelo Core ML obtiene el mismo top-1 en 101 de 101 frases cotidianas, 199 de 200 elementos AJIMEE y 27 de 28 frases difíciles.

## Requisitos de hardware

- VRAM estimada: los pesos fp32 ocupan 362 MB; en int8 el paquete Core ML ocupa 82 MB.
- GPU recomendadas: no se especifican requisitos de GPU dedicada; el modelo está optimizado para el Neural Engine de Apple.
- Compatibilidad con GPU de consumo: el tamaño reducido permite ejecutarlo en CPU y en GPUs de consumo, aunque no se publican requisitos mínimos concretos.
- Despliegue: transformers (safetensors), Core ML (coremltools 9, macOS 15 / iOS 18 o posterior) y el decodificador Core ML de genmai-ime.
- Latencia: aproximadamente 4 ms por paso de decodificación en el Neural Engine de un M4 Pro con 5 haces.
- Memoria de proceso: aproximadamente 50 a 90 MB en el dispositivo.
- Carga inicial: la primera compilación para el Neural Engine tarda unos 20 s; macOS cachea el resultado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AJIMEE-Bench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| genmai-90M | 90M | 256 tokens (Core ML), 500 caracteres de contexto | 91,0 % | CC BY-SA 4.0 | Hugging Face, Core ML |
| genmai-310M | 310M (no confirmado en la informacion) | no disponible | 95,0 % | no disponible | Hugging Face |
| Zenzai (zenz-v3.2-small) | no disponible | no disponible | 85,5 % | Apache-2.0 (modelo base) | Hugging Face (GGUF) |

## Limitaciones y advertencias

- Especializado exclusivamente en japonés; no soporta otros idiomas.
- Tarea limitada a conversión kana-kanji; no es un modelo de propósito general ni soporta tool calling, agentes o visión.
- La ventana de prompt en Core ML está limitada a 256 tokens y la salida a 64 tokens por fragmento.
- Riesgo de salidas degeneradas si se usa la normalización de longitud por defecto de transformers; se recomienda `length_penalty=0.0` y ordenar por suma de log-probabilidades.
- La licencia CC BY-SA 4.0 exige atribución y compartir bajo la misma licencia las obras derivadas, lo que puede condicionar el uso comercial.
- El modelo base zenz-v3.2-small tiene licencia Apache-2.0, distinta de la del modelo derivado.
- En macOS 26 la versión v1.0.0 producía resultados incorrectos por el cálculo de la varianza de layer norm en fp16; debe usarse v1.0.1 o posterior.
- No se han publicado datos de sesgos ni de tasas de alucinación en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/subdiox/genmai-90M
- Modelo de mayor tamaño: https://huggingface.co/subdiox/genmai-310M
- Modelo base: https://huggingface.co/Miwa-Keita/zenz-v3.2-small-gguf
- Repositorio de la aplicación de entrada: https://github.com/subdiox/genmai-ime
- Script de conversión Core ML: Tools/coreml/genmai_coreml.py en genmai-ime
