# tencent/Hy-SimulMT-30B-A3B-GGUF

## Resumen

Hy-SimulMT es un modelo de traducción simultánea en tiempo real desarrollado por Tencent Hunyuan. Recibe audio en streaming y va traduciendo a medida que el hablante habla, generando de forma conjunta texto traducido y habla sintetizada, con clonación de voz en tiempo real que preserva las características vocales del interlocutor. El soporte es bidireccional entre chino e inglés y está pensado para comunicación en vivo: reuniones, ponencias y entrevistas. El identificador del modelo (30B-A3B) indica 30 000 millones de parámetros totales con unos 3000 millones activos por token, aunque no se detalla en la información disponible si esa稀疏idad corresponde a una arquitectura MoE clásica ni el contexto máximo soportado.

La versión publicada en este repositorio es la conversión a GGUF del modelo original, con un tamaño de repositorio de 106,1 GB, lo que incluye varias variantes cuantizadas y, presumiblemente, los componentes de audio además del núcleo lingüístico. El modelo original distribuye pesos safetensors desde los que se contabilizan los 30 396 330 496 parámetros.

Su relevancia actual reside en el eje calidad-latencia: en la evaluación de audio largo RealSI, Hy-SimulMT reporta un StreamLAAL de aproximadamente 3 segundos, el más bajo entre los sistemas comparados, y una puntuación GEMBA superior a la de los modelos abiertos comparados y a cuatro de las cinco API comerciales incluidas. En los benchmarks cortos (FLEURS, CoVoST2, ACL6060 y RealSI-Sentence) obtiene 90,3, 75,5, 81,2 y 84,7 respectivamente, siendo el mejor en RealSI-Sentence de toda la tabla publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Traducción simultánea extremo a extremo con entrada de audio en streaming y salida conjunta de texto y habla; el sufijo A3B del identificador sugiere un transformer disperso (MoE) de 30 B totales y ~3 B activos, si bien la model card no describe la arquitectura en detalle |
| Parametros totales | 30.396.330.496 (≈30,4 B) |
| Parametros activos | ≈3 B (según la convención de nomenclatura 30B-A3B; no confirmado explícitamente en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; el repositorio (106,1 GB) contiene variantes cuantizadas, pero no se detalla la lista exacta de niveles |
| Idiomas soportados | chino e inglés, traducción bidireccional (zh→en y en→zh) |
| Licencia | no disponible |
| Formato de pesos | GGUF en este repositorio; los parámetros se reportan a partir de pesos safetensors en la colección del autor |

## Arquitectura y entrenamiento

La información disponible describe el comportamiento del sistema, no su topología interna. Hy-SimulMT se plantea como un traductor simultáneo que procesa audio incremental: en lugar de esperar a disponer de la frase completa, va formulando la traducción conforme llega el flujo de audio, lo que exige comprensión incremental y generación parcial. El sistema produce dos salidas acopladas, texto traducido y voz sintetizada, y aplica clonación de voz en tiempo real para conservar el timbre del hablante original.

No se han publicado en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. El repositorio de GitHub asociado incluye SimulInfer, el servicio de inferencia, y SimulTrain, las herramientas de entrenamiento, lo que sugiere que el pipeline de entrenamiento para traducción simultánea es reproducible por terceros. La evaluación combina benchmarks públicos, audio real y comparación con intérpretes simultáneos profesionales; la salida de voz y la clonación requieren un servicio TTS configurado aparte.

## Capacidades

- Traducción simultánea voz a voz bidireccional chino↔inglés sobre audio en streaming.
- Generación conjunta de texto traducido y habla sintetizada.
- Clonación de voz en tiempo real, preservando las características vocales del hablante.
- Comprensión y generación incrementales: emite traducción parcial mientras el discurso continúa.
- Orientación conversacional (etiqueta `conversational` en el repositorio).
- Soporte de audio largo: evaluación específica sobre streams extensos (RealSI long-form).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Visión, audio como entrada más allá del pipeline de traducción o modo thinking explícito: no disponible.

## Casos de uso

- Reuniones internacionales bilingües: el modelo consume el audio de la sala o de la videollamada y entrega traducción zh↔en con un retardo de streaming de aproximadamente 3 segundos (StreamLAAL), lo que permite seguir una reunión sin esperar al final de cada intervención.
- Ponencias y conferencias con audiencia mixta: al emitir texto y voz clonada del ponente, se puede alimentar un canal de subtítulos y otro de audio traducido de forma simultánea para asistentes presenciales y remotos.
- Entrevistas y ruedas de prensa: la clonación de voz mantiene identificable al entrevistado, algo relevante cuando el audio traducido se publica como material informativo.
- Soporte telefónico o por videollamada con clientes sin idioma común: el servicio SimulInfer puede integrarse en la plataforma de contact center para traducir en vivo, manteniendo el flujo conversacional multi-turno sin cortes por espera.
- Subtitulado y localización de medios en directo: emisión continua de texto traducido sobre retransmisiones, útil para canales de noticias o eventos retransmitidos donde el tiempo de postproducción es nulo.
- Aplicaciones móviles de traducción personal: el modelo es la base de la Hy Translate App (Android e iOS) para conversación cara a cara entre hablantes de chino e inglés.
- Formación y docencia bilingüe: transcripción y traducción simultánea de clases magistrales, con texto para apuntes y audio para alumnos que no dominan el idioma de impartición.
- Investigación en traducción automática simultánea: SimulTrain y SimulInfer permiten reproducir el entrenamiento y evaluar variantes sobre RealSI y otros conjuntos públicos.

## Benchmarks y rendimiento

Evaluación sobre audio largo RealSI: StreamLAAL de aproximadamente 3 segundos, el más bajo de los sistemas comparados; la puntuación GEMBA supera a la de los modelos abiertos de la comparativa y a cuatro de las cinco API comerciales. La model card advierte de que StreamLAAL no equivale al tiempo hasta la primera salida de voz.

Calidad en benchmarks de audio corto (puntuaciones más altas, mejor):

| API / modelo | FLEURS | CoVoST2 | ACL6060 | RealSI-Sentence |
|---|---:|---:|---:|---:|
| Qwen3.8-LiveTranslate | 88,4 | **82,1** | 80,5 | 84,4 |
| **Hy-SimulMT** | **90,3** | 75,5 | 81,2 | **84,7** |
| Gemini3.5-LiveTranslate | **92,4** | 74,4 | **82,6** | 82,2 |
| Confucius4 R2T2 → T3PO | 89,4 | 76,8 | 76,1 | 77,7 |
| Seed-LiveInterpret2.0 | 85,8 | 67,7 | 74,8 | 80,0 |
| SimulS2ST-Omni | 78,6 | 66,6 | 73,1 | 77,4 |
| GPT-Realtime-Translate | 77,7 | 50,8 | 76,4 | 76,7 |
| XunFei-Simult-Interpretation | 73,4 | 57,0 | 57,5 | 70,9 |
| SeamlessStreaming | 72,8 | 60,9 | 49,8 | 56,9 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de benchmarks de razonamiento general, algo esperable en un modelo especializado en traducción de voz.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculos a partir de los 30,4 B de parámetros; las cifras incluyen solo los pesos y no el sobrecoste del codificador de audio, el TTS externo ni la caché KV, cuyo tamaño no se detalla):
  - Cuantización de ~4 bits: en torno a 17-20 GB.
  - Cuantización de 8 bits: en torno a 32-34 GB.
  - Precisión completa (FP16/BF16): en torno a 61 GB.
- Al ser un modelo disperso con ~3 B activos, el cuello de botella es la memoria (todos los expertos deben residir en VRAM), no el cómputo; esto favorece la latencia baja una vez cargado.
- GPU recomendadas: A100 80 GB o H100 para FP16/BF16 sin compromisos; A100 40 GB o 2×RTX 4090 para 8 bits; RTX 4090 (24 GB) o RTX 3090 para cuantizaciones de 4 bits, con margen ajustado.
- Cabe en GPU de consumo (RTX 4090, 3090, 4080 de 16 GB solo con cuantizaciones agresivas) únicamente en formatos de 4 bits y asumiendo que los componentes de audio se sirvan por separado.
- Opciones de despliegue: llama.cpp u Ollama para los pesos GGUF; SimulInfer (servicio de inferencia oficial del repositorio de GitHub) para el pipeline completo de traducción simultánea; el repositorio de 106,1 GB obliga a descargar selectivamente el archivo cuantizado deseado.
- La salida de voz y la clonación requieren un servicio TTS configurado aparte, según indica la model card.
- Latencia: StreamLAAL de referencia ≈3 s en RealSI; throughput en tokens/s no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | RealSI-Sentence | FLEURS | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Hy-SimulMT | 30,4 B totales / ~3 B activos | no disponible | 84,7 | 90,3 | no disponible | Pesos GGUF en HuggingFace, safetensors en la colección, GitHub y app móvil |
| Qwen3.8-LiveTranslate | no disponible | no disponible | 84,4 | 88,4 | no disponible | Referenciado en la comparativa del autor |
| Gemini3.5-LiveTranslate | no disponible | no disponible | 82,2 | 92,4 | propietaria (API) | API comercial |
| Seed-LiveInterpret2.0 | no disponible | no disponible | 80,0 | 85,8 | no disponible | Referenciado en la comparativa del autor |
| SeamlessStreaming | no disponible | no disponible | 56,9 | 72,8 | no disponible | Referenciado en la comparativa del autor |

Hy-SimulMT destaca en calidad sobre audio real (RealSI-Sentence) y en latencia de streaming, mientras que Gemini3.5-LiveTranslate y Qwen3.8-LiveTranslate obtienen mejores cifras en FLEURS y CoVoST2 respectivamente. No se dispone de datos de parámetros ni de contexto de los modelos comparados en la información proporcionada.

## Limitaciones y advertencias

- Cobertura lingüística reducida: solo chino e inglés; no hay soporte declarado para otras lenguas ni datos de rendimiento fuera de ese par.
- Licencia no disponible: no puede confirmarse el uso comercial, la redistribución ni las condiciones de la clonación de voz; es imprescindible verificar la licencia antes de integrar el modelo en producción.
- Dependencia de un servicio TTS externo para la salida de habla y la clonación, lo que añade latencia, coste y un punto de fallo fuera del modelo.
- Riesgo de alucinación y de errores de traducción en audio con ruido, acentos marcados, solapamiento de hablantes o terminología especializada; la evaluación publicada se limita a los conjuntos citados.
- La clonación de voz plantea requisitos de consentimiento y obligaciones legales sobre suplantación de identidad y datos biométricos; la model card no detalla salvaguardas.
- StreamLAAL de ~3 s no equivale al tiempo hasta la primera salida de voz; la latencia percibida en producción dependerá del buffering, del TTS y de la red.
- El repositorio GGUF ocupa 106,1 GB, lo que complica el despliegue en entornos con almacenamiento o ancho de banda limitados y obliga a descargar archivos concretos.
- No se han publicado datos de sesgos, contexto máximo, composición del dataset ni resultados de seguridad.
- Las cifras de benchmarks proceden del propio autor del modelo; no se han verificado de forma independiente en la información disponible.

## Enlaces

- HuggingFace (este repositorio GGUF): https://huggingface.co/tencent/Hy-SimulMT-30B-A3B-GGUF
- Colección Hy-SimulMT en HuggingFace: https://huggingface.co/collections/tencent/hy-simulmt
- Colección en ModelScope: https://www.modelscope.cn/collections/Tencent-Hunyuan/Hy-SimulMT
- Repositorio GitHub (SimulInfer y SimulTrain): https://github.com/Tencent-Hunyuan/Hy-SimulMT
- Aplicación Hy Translate (Android e iOS): códigos QR en la model card del repositorio de HuggingFace
- Información corporativa de Tencent: https://www.tencent.com/
