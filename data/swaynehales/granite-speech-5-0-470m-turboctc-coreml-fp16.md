# swaynehales/granite-speech-5.0-470m-turboctc-coreml-fp16

## Resumen

Granite Speech 5.0 470M TurboCTC CoreML fp16 es una conversión no oficial del modelo de reconocimiento automático del habla (ASR) `ibm-granite/granite-speech-5.0-470m-turboctc` de IBM, publicada por el usuario `swaynehales`. El objetivo es ejecutar ASR multilingüe íntegramente en dispositivo (on-device) sobre Macs con Apple Silicon, aprovechando el formato Core ML ML Program y la precisión fp16. El modelo base se publicó el 21 de octubre de 2026 como release multilingüe de IBM Granite.

El modelo original es un sistema CTC de 470 millones de parámetros construido sobre 16 bloques conformer, con un cabezal BPE multilingüe de 16.384 tokens y un factor de subsampling temporal de 8x (de 100 Hz a 12,5 Hz). Soporta inglés, francés, alemán, español, portugués, italiano y japonés con puntuación y capitalización nativas. Esta conversión cambia únicamente el formato (Core ML de forma fija, sin máscara de atención), la precisión numérica (pesos bf16 almacenados como fp16) y un ajuste del tokenizador.

La relevancia actual radica en la posibilidad de desplegar ASR multilingüe de calidad en portátiles y estaciones de trabajo Apple sin depender de la nube ni de GPU dedicadas, con un paquete de aproximadamente 1 GB. La licencia Apache 2.0 del modelo original permite la redistribución de obras derivadas, lo que hace viable su uso comercial con las obligaciones de atribución correspondientes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer CTC (16 bloques conformer, atención por bloques de 128 frames, self-conditioned CTC desde la capa intermedia) |
| Parámetros totales | 470 M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 frames de features (327,68 s de audio a 50 frames/s), ventana fija |
| Tipos de cuantización | fp16 (sin compresión de pesos); no se ofrecen otras variantes en este repo |
| Idiomas soportados | multilingüe: en, fr, de, es, pt, it, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML ML Program (`GraniteSpeech.mlpackage`, `weight.bin`), fp16 |

## Arquitectura y entrenamiento

El modelo base de IBM emplea una arquitectura conformer con 16 bloques y entrenamiento CTC (Connectionist Temporal Classification). Aplica un subsampling temporal de 8x que reduce la tasa de frames de 100 Hz a 12,5 Hz, utiliza atención por bloques sobre ventanas de 128 frames y aplica self-conditioned CTC desde la capa intermedia, una técnica que introduce supervisión auxiliar en capas internas para estabilizar y mejorar el entrenamiento CTC. El cabezal de salida es un vocabulario BPE multilingüe de 16.384 tokens que cubre los siete idiomas soportados, con puntuación y capitalización nativas generadas por el propio modelo.

La conversión a Core ML se realizó con `coremltools 9.0` y `torch 2.7.0` mediante el script `convert_granite_coreml.py` del proyecto Granite-MLX, en modo `argmax` (el argmax CTC se calcula dentro del grafo) y con `--feature-frames 16384`. El proceso traza una reimplementación en PyTorch de operaciones explícitas que carga estrictamente el state dict original; sobre features idénticas con padding a cero, esa reimplementación coincidió con la inferencia oficial de transformers sin máscara con una diferencia máxima absoluta de logits entre 8,0e-5 y 1,24e-3 en tres clips de prueba, y una coincidencia de frames del 100%. El frontend de features (log-mel más deltas, con frame-stacking) no está incluido en el grafo: debe calcularse con el procesador de Hugging Face en Python o con `GraniteFeatureExtractor` de Granite-MLX en Swift.

## Capacidades

- Reconocimiento automático del habla multilingüe en siete idiomas: inglés, francés, alemán, español, portugués, italiano y japonés.
- Generación nativa de puntuación y capitalización, sin postprocesado externo.
- Salida CTC por frame con resolución de 80 ms (12,5 Hz de salida), lo que permite alineamientos temporales a nivel de token.
- Entrada de audio de hasta 327,68 segundos por inferencia con padding a cero (forma fija de 16.384 frames).
- Ejecución on-device en Apple Silicon con unidades de cómputo CPU y GPU (`cpu-gpu`); la colocación en Neural Engine no fue medida por el autor.
- Integración con el reconocedor Core ML de Granite-MLX mediante el esquema `coreml_config.json`.
- No soporta tool calling, function calling, razonamiento multi-paso ni agentes: es un modelo puramente ASR.
- No dispone de modo thinking, visión ni audio generativo.

## Casos de uso

- Transcripción de reuniones en local: el modelo procesa hasta 327,68 s de audio por pasada y genera puntuación y mayúsculas, lo que permite transcribir actas y notas de voz sin enviar datos a la nube, algo crítico en entornos con requisitos de privacidad.
- Subtitulado automático de vídeo: la salida CTC por frame a 12,5 Hz facilita la alineación temporal de subtítulos, y el soporte de siete idiomas cubre la localización de contenido para audiencias europeas y japonesas.
- Dictado por voz en aplicaciones macOS: al ser un paquete Core ML de ~1 GB ejecutable en CPU/GPU de Apple Silicon, se puede integrar en apps nativas con latencia baja y sin dependencia de red.
- Transcripción de atención al cliente: procesamiento por lotes de grabaciones de llamadas en varios idiomas para análisis de calidad, con datos que no abandonan la infraestructura propia.
- Investigación en ASR: el formato Core ML y la reproducibilidad documentada (hashes SHA-256, `CONVERSION.json`) permiten estudiar el comportamiento de modelos conformer CTC en hardware Apple y comparar con la inferencia oficial de transformers.
- Accesibilidad: dictado y transcripción en tiempo casi real para usuarios con discapacidad motora o auditiva en Macs, sin coste de API y con funcionamiento offline.
- Pipeline de datos para entrenamiento de modelos de lenguaje: transcripción masiva de corpus de audio multilingüe en estaciones Apple para generar datos etiquetados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de la conversión remite a la model card de IBM en la revisión fijada (`91dcb06`) para benchmarks y el informe técnico, pero no reproduce cifras. El único dato de rendimiento verificable es la equivalencia numérica con la inferencia oficial: diferencia máxima absoluta de logits entre 8,0e-5 y 1,24e-3 y coincidencia de frames del 100% en tres clips de prueba (11 s de habla, 30 s de habla y 5 s de silencio).

## Requisitos de hardware

- VRAM/espacio: el paquete de pesos ocupa 1.008.734.720 bytes (~1 GB) en fp16; el repo completo mide 1,0 GB.
- Hardware objetivo: Apple Silicon (el autor ejecutó la conversión y las pruebas en un Apple M2 Max con macOS 27.0.1).
- Requisito de sistema: macOS 15 como mínimo (`--minimum-target macos15`).
- Unidades de cómputo recomendadas: CPU y GPU (`cpu-gpu`); la colocación en Neural Engine no fue medida.
- No está pensado para GPU NVIDIA ni para CUDA; para esos entornos debe usarse el modelo original de IBM con transformers, vLLM u otros runtimes.
- Opciones de despliegue: Core ML a través del reconocedor de Granite-MLX (esquema `coreml_config.json`); el frontend de features requiere el procesador de Hugging Face en Python o `GraniteFeatureExtractor` en Swift.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Granite Speech 5.0 470M TurboCTC CoreML fp16 (esta ficha) | 470 M | 327,68 s (16.384 frames) | 7 (en, fr, de, es, pt, it, ja) | Apache 2.0 | Core ML fp16 |
| ibm-granite/granite-speech-5.0-470m-turboctc | 470 M | 327,68 s (16.384 frames) | 7 (en, fr, de, es, pt, it, ja) | Apache 2.0 | safetensors (transformers) |
| ibm-granite/granite-speech-5.0-470m-turboctc-nc | 470 M | no disponible | inglés | CC-BY-NC-SA-4.0 | safetensors (transformers) |

La diferencia principal frente al modelo original es el formato y el runtime: la versión Core ML elimina la dependencia de PyTorch y transformers en inferencia, a costa de una forma fija de entrada y de un comportamiento ligeramente distinto al no usar máscara de atención. La variante `-nc` es un modelo distinto, solo en inglés y con licencia no comercial, que no debe confundirse con este.

## Limitaciones y advertencias

- Conversión no oficial: IBM no ha revisado ni respaldado esta conversión; los créditos del modelo pertenecen a IBM Granite.
- Forma fija de entrada: el grafo Core ML no tiene máscara de atención y espera siempre 16.384 frames con padding a cero, lo que puede producir un comportamiento ligeramente distinto al de la inferencia oficial de IBM, especialmente en audios cortos o con silencio.
- Precisión: los pesos bf16 originales se almacenan como fp16, lo que introduce una pérdida numérica adicional respecto al modelo de referencia.
- Tokenizador modificado: `tokenizer_config.json` añade `"clean_up_tokenization_spaces": false` y una clave `_modification_notice`, lo que puede alterar el postprocesado de texto respecto al original.
- Frontend no incluido: es obligatorio calcular las features log-mel más deltas con el procesador de Hugging Face o con `GraniteFeatureExtractor`; usar otro frontend degradará la transcripción.
- Plataforma: solo macOS 15 o superior en Apple Silicon; no es desplegable en GPU NVIDIA, CUDA ni en servidores Linux convencionales.
- Idiomas: cubre siete idiomas; no se documenta soporte para otras lenguas ni code-switching.
- Sesgos y alucinación: no se documentan sesgos específicos en la información disponible; como todo modelo ASR, puede producir transcripciones erróneas en audio ruidoso, acentos no representados en el entrenamiento o vocabulario técnico poco frecuente.
- Licencia: Apache 2.0 permite uso comercial, pero la redistribución exige incluir una copia de la licencia y un aviso de cambios (sección 4); el repo incluye `LICENSE` y `MODIFICATIONS.md` a tal efecto.
- Verificación de integridad: conviene comprobar los hashes con `shasum -a 256 -c SHA256SUMS` antes de desplegar.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/swaynehales/granite-speech-5.0-470m-turboctc-coreml-fp16
- Modelo base de IBM: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc
- Revisión fijada del modelo base: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc/tree/91dcb0605daf65f88dbb04fef015c423241d941d
- Model card del modelo base en la revisión fijada: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc/blob/91dcb0605daf65f88dbb04fef015c423241d941d/README.md
- Variante no comercial solo en inglés (no usada en esta conversión): https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc-nc
- Proyecto Granite-MLX (script de conversión y reconocedor Core ML): https://github.com/kylehowells/Granite-MLX
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
