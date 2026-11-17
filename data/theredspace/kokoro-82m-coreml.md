# theredspace/kokoro-82M-coreml

## Resumen

Kokoro-82M-coreml es una conversión a Core ML del modelo de síntesis de voz hexgrad/Kokoro-82M, publicada por el usuario theredspace. El modelo original es un TTS ligero de 82 millones de parámetros que genera audio a 24 kHz a partir de fonemas, y esta versión empaqueta los pesos en formato `.mlpackage` para su ejecución nativa en el ecosistema Apple (Core ML), con pesos en float16 y cómputo en float32 orientado a CPU.

El repositorio no contiene un modelo nuevo ni un fine-tune con datos adicionales: es una conversión de ingeniería que separa el pipeline en dos paquetes Core ML (un predictor que estima duraciones y alineamientos a partir de `input_ids` y un vector de estilo, y un decodificador con tres variantes según la longitud de la secuencia) e incluye los artefactos auxiliares necesarios para ejecutarlo de extremo a extremo: vocabulario de fonemas, tablas de estilo de cinco voces en inglés, diccionarios de pronunciación de misaki 0.9.4 y scripts de conversión.

Es relevante para desarrolladores que quieran integrar TTS en aplicaciones macOS/iOS sin depender de PyTorch en tiempo de ejecución, a costa de limitarse a las cinco voces incluidas y al inglés americano y británico. La licencia Apache-2.0 se mantiene respecto al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS neuronal (Kokoro-82M) convertido a Core ML; predictor de duraciones/alineamiento + decodificador de audio |
| Parametros totales | 82 M (modelo base Kokoro-82M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; secuencia de entrada de hasta 256 tokens de fonemas (sin padding) |
| Tipos de cuantizacion | pesos float16, computo float32 (unica variante publicada) |
| Idiomas soportados | ingles (voces americanas af_heart, af_bella, am_michael; britanicas bf_emma, bm_george) |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML `.mlpackage` (comprimido en `.zip`); tablas de estilo `.bin` en float32; vocabulario y diccionarios en JSON |

## Arquitectura y entrenamiento

El modelo subyacente es Kokoro-82M (commit f3ff357), un TTS de 82 M de parametros. Esta publicacion no reentrena ni ajusta el modelo: convierte los pesos PyTorch a Core ML y los divide en dos etapas. El predictor recibe `input_ids` de forma `[1, N]` int32 (N hasta 256, sin padding) y un vector de estilo `ref_s_style` `[1, 128]`, y produce `duration`, `d_for_align` y `t_en`. El decodificador expone tres funciones (`decoder_128`, `decoder_256`, `decoder_512`) que toman `en_aligned`, `asr_aligned` y `ref_s` `[1, 256]` y devuelven audio en frames de 600 muestras a 24 kHz.

La validacion reportada por el autor compara la salida Core ML con la de PyTorch: las duraciones redondeadas coinciden en todos los tokens y la convergencia espectral del decodificador se situa en torno a 0,02-0,03 (float16 frente a float32 en Core ML), medida sobre cinco frases en ingles. No se documentan en la informacion disponible los datos de entrenamiento originales, el uso de RLHF/DPO ni innovaciones de decodificacion del modelo base.

## Capacidades

- Sintesis de voz (text-to-speech) a 24 kHz a partir de fonemas tokenizados.
- Control de estilo e identidad de voz mediante tablas de estilo de 510 x 256 en float32 para cinco voces en ingles.
- Normalizacion de pronunciacion en ingles americano mediante los diccionarios `us_gold.json` y `us_silver.json` de misaki 0.9.4.
- Ejecucion nativa en Core ML con pesos float16 y computo float32, pensada para CPU.
- Gestion de secuencias de hasta 256 tokens de fonemas sin padding.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio de entrada ni modo thinking.

## Casos de uso

- Lectura por voz en aplicaciones iOS y macOS: el formato `.mlpackage` permite cargar el predictor y el decodificador directamente en Core ML, sin incluir PyTorch en el binario de la app.
- Audiolibros y contenido largo por lotes: la secuencia de hasta 256 tokens de fonemas y el decodificador con variantes de 128, 256 y 512 permiten procesar fragmentos de texto y concatenar el audio resultante.
- Accesibilidad en interfaces: sintesis local en el dispositivo para lectores de pantalla o asistencia vocal, sin enviar texto a un servicio externo.
- Asistentes de voz sin conexion: al ejecutarse en CPU con pesos float16, el modelo puede integrarse en flujos donde no se quiere depender de red ni de APIs de terceros.
- Prototipado de interfaces conversacionales: las cinco voces incluidas (tres americanas y dos britanicas) permiten probar variaciones de locutor en demos y pruebas de usabilidad.
- Generacion de avisos y notificaciones habladas: el tamano reducido del paquete (0,2 GB de repositorio) facilita su empaquetado junto a la aplicacion para mensajes cortos generados en tiempo de ejecucion.
- Evaluacion de pipelines TTS en Apple Silicon: util como referencia para comparar la salida Core ML con la de PyTorch antes de adoptar el formato en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta una validacion de fidelidad frente a PyTorch: duraciones redondeadas identicas en todos los tokens y convergencia espectral del decodificador de aproximadamente 0,02-0,03 (float16 frente a float32 en Core ML) sobre cinco frases en ingles.

## Requisitos de hardware

- Inferencia en CPU por diseno (pesos float16, computo float32); no se documenta soporte de GPU o Neural Engine en la informacion disponible.
- Apropiado para equipos Apple con Core ML; el tamano del repositorio (0,2 GB) sugiere un modelo que cabe holgadamente en memoria en Mac y dispositivos iOS modernos.
- No se especifican VRAM ni GPU recomendadas (A100, H100, RTX 4090) porque el artefacto esta orientado a Core ML y CPU.
- Opciones de despliegue: Core ML (`.mlpackage`); para el modelo base en otros entornos, la model card original de hexgrad/Kokoro-82M es la referencia.
- No se publican datos de latencia ni throughput en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| theredspace/kokoro-82M-coreml | 82 M | hasta 256 tokens de fonemas | ingles (5 voces) | Apache-2.0 | Core ML |
| hexgrad/Kokoro-82M (base) | 82 M | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Apache-2.0 | PyTorch (safetensors) |

No se dispone en la informacion proporcionada de datos de benchmarks ni de especificaciones de otros modelos TTS comparables (por ejemplo, variantes de mayor tamano o de otros proveedores), por lo que la comparativa se limita al modelo base del que deriva esta conversion.

## Limitaciones y advertencias

- Solo incluye cinco voces en ingles (af_heart, af_bella, am_michael, bf_emma, bm_george); no hay soporte documentado de otros idiomas en esta conversion.
- La entrada esta limitada a 256 tokens de fonemas sin padding, lo que obliga a trocear textos largos.
- La fidelidad frente a PyTorch no es exacta: la convergencia espectral del decodificador es de aproximadamente 0,02-0,03, por lo que pueden existir diferencias audibles menores.
- El paquete esta pensado para CPU; no se documenta rendimiento en GPU ni en Neural Engine.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni de validacion por terceros.
- Riesgo de alucinacion y sesgos: no se documentan en la informacion disponible para esta conversion; deben evaluarse sobre el modelo base.
- La licencia Apache-2.0 permite uso comercial, pero se debe conservar la atribucion indicada en `LICENSE` y `NOTICE`, que recogen los cambios realizados respecto al modelo original.
- La fecha de creacion del repositorio (2026-11-16) y la ausencia de metricas de calidad publicadas aconsejan validar la salida antes de adoptarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/theredspace/kokoro-82M-coreml
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M
- No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs, repositorios o demos.
