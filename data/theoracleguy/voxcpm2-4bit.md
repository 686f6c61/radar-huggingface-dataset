# theoracleguy/VoxCPM2-4bit

## Resumen

VoxCPM2-4bit es una conversión cuantizada a 4 bits del modelo de síntesis de voz openbmb/VoxCPM2, publicada por el usuario theoracleguy bajo licencia Apache 2.0. Se trata de un modelo de text-to-speech de aproximadamente 2.380 millones de parámetros que genera audio a 48 kHz con capacidades de clonación de voz y diseño de voz a partir de descripciones textuales. La conversión está orientada a Apple Silicon mediante la librería mlx-audio, que actúa como runtime de inferencia en hardware de Apple.

El modelo resuelve el problema de la síntesis de voz multilingüe de alta calidad en entornos locales sin GPU dedicada: al estar cuantizado a 4 bits en las capas del modelo de lenguaje (manteniendo VAE y DiT en precisión completa), reduce el peso a 2,30 GB frente a los 4,96 GB de la variante bf16. Es relevante para desarrolladores que necesitan TTS con clonación de voz en Mac, con un factor de tiempo real (RTF) de 0,90x, es decir, ligeramente más lento que tiempo real.

El modelo base soporta 30 idiomas, entre ellos inglés, chino, indonesio, japonés y coreano, y ofrece cuatro modos de generación: zero-shot, continuación, clonación por referencia y combinado. Esta ficha se centra en la variante cuantizada para MLX, que hereda las capacidades del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS con componente LM, VAE y DiT según la model card) |
| Parámetros totales | 2.383.791.940 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4 bits (capas LM); VAE y DiT en precisión completa; existe variante 8-bit y bf16 del mismo port |
| Idiomas soportados | en, zh, id, ja, ko y hasta 30 idiomas según la model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería mlx-audio) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de mencionar que la cuantización a 4 bits se aplica únicamente a las capas del modelo de lenguaje, mientras que los componentes VAE y DiT se mantienen en precisión completa. Esto sugiere una arquitectura híbrida típica de los sistemas TTS neuronales modernos, con un modelo de lenguaje que modela la secuencia y un decodificador generativo (DiT) junto con un autoencoder variacional (VAE) para la síntesis de audio. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación destacable de esta publicación concreta es la conversión a MLX con cuantización selectiva: al dejar VAE y DiT en precisión completa se preserva la calidad del audio mientras se reduce el peso del componente de lenguaje, que es el que domina el cómputo. El resultado es una variante de 2,30 GB con un RTF de 0,90x en Apple Silicon, frente a 0,85x de la variante 8-bit y 0,48x de bf16. El modelo soporta un parámetro `inference_timesteps` (7 en los ejemplos) y `cfg_value` (2.0 en los ejemplos) para controlar el proceso de generación.

## Capacidades

- Síntesis de voz multilingüe en hasta 30 idiomas, con soporte confirmado de inglés, chino, indonesio, japonés y coreano.
- Salida de audio a 48 kHz, descrita como calidad de estudio.
- Clonación de voz a partir de una referencia de audio corta y su texto correspondiente.
- Diseño de voz mediante descripciones textuales, sin necesidad de audio de referencia.
- Cuatro modos de generación: zero-shot, continuación, clonación por referencia y combinado.
- Control de la generación mediante parámetros de timesteps de inferencia y CFG.
- Integración con la librería mlx-audio, con CLI y API de Python.
- No se dispone de información sobre tool calling, capacidades de agente, visión o audio de entrada más allá de la referencia para clonación.

## Casos de uso

- Audiolibros y narración local en Mac: el modelo genera voz a 48 kHz con un RTF de 0,90x, lo que permite producir audio de forma secuencial en un portátil o equipo de sobremesa Apple sin GPU dedicada.
- Clonación de voz para doblaje y localización: usando `--ref_audio` y `--ref_text` se puede replicar una voz concreta para generar versiones en inglés, chino, japonés, coreano o indonesio manteniendo el timbre del hablante.
- Diseño de voces para videojuegos y prototipos: la función de voice design permite crear personajes con descripciones como "A young woman, gentle and sweet voice" sin grabar referencias, agilizando la iteración creativa.
- Asistentes de voz embebidos en aplicaciones de escritorio macOS: la integración con mlx-audio y la API de Python permiten invocar la síntesis desde una app nativa con un consumo de memoria de aproximadamente 2,3 GB de pesos.
- Generación de voces para contenido educativo y accesibilidad: la salida multilingüe y de alta frecuencia de muestreo es adecuada para materiales formativos y lectores de pantalla con calidad superior a la de los TTS del sistema.
- Pruebas A/B de voces en producción: los cuatro modos de generación y el control de CFG permiten comparar variantes de una misma voz o estilo antes de fijar una configuración definitiva.
- Investigación en TTS sobre Apple Silicon: la disponibilidad de variantes bf16, 8-bit y 4-bit del mismo port facilita estudios de compromiso entre calidad, tamaño y latencia.

## Benchmarks y rendimiento

La model card solo publica el factor de tiempo real (RTF) en Apple Silicon para las variantes del port:

| Variante | Tamaño | RTF (7 timesteps) |
|---|---|---|
| bf16 | 4,96 GB | 0,48x |
| 8-bit | 3,23 GB | 0,85x |
| 4-bit | 2,30 GB | 0,90x |

No se han publicado resultados de benchmarks de calidad de audio (MOS, similitud de voz, WER) en la información disponible.

## Requisitos de hardware

- Peso del modelo: 2,30 GB en cuantización 4 bits; el repositorio ocupa 2,3 GB.
- Hardware objetivo: Apple Silicon (MLX); no se indica soporte para CUDA ni CPU x86 en la información disponible.
- VRAM/unified memory estimada: no disponible de forma explícita; el peso de los safetensors es de 2,3 GB, por lo que se requiere al menos esa cantidad de memoria unificada más el overhead del runtime.
- GPU recomendadas: no disponible; el runtime MLX está diseñado para chips Apple M-series.
- Despliegue: librería mlx-audio, con CLI (`python -m mlx_audio.tts.generate`) y API de Python (`mlx_audio.tts.load_model`).
- Latencia: RTF de 0,90x con 7 timesteps, ligeramente más lento que tiempo real; el throughput no se especifica.
- No se dispone de información sobre compatibilidad con vLLM, llama.cpp, Ollama o TGI.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Runtime |
|---|---|---|---|---|---|
| VoxCPM2-4bit (esta ficha) | 2.383.791.940 | no disponible | hasta 30 | apache-2.0 | mlx-audio |
| openbmb/VoxCPM2 (base) | no disponible | no disponible | hasta 30 | apache-2.0 | no disponible |
| VoxCPM2 8-bit (mismo port) | no disponible | no disponible | hasta 30 | apache-2.0 | mlx-audio |
| VoxCPM2 bf16 (mismo port) | no disponible | no disponible | hasta 30 | apache-2.0 | mlx-audio |

No se dispone de información sobre otros modelos TTS comparables en la documentación proporcionada.

## Limitaciones y advertencias

- La cuantización a 4 bits puede introducir pérdida de calidad de audio respecto a bf16; la model card la describe como "minimal quality loss" sin cuantificar.
- El RTF de 0,90x implica que la generación es más lenta que el tiempo real; no es adecuada para streaming de baja latencia sin evaluación adicional.
- El modelo está portado exclusivamente a MLX y Apple Silicon; no hay evidencia de funcionamiento en CUDA, ROCm o CPU genérica.
- Riesgo de uso indebido de la clonación de voz: la capacidad de replicar voces a partir de referencias cortas exige controles de consentimiento y medidas de mitigación en producción.
- No se dispone de información sobre sesgos lingüísticos, de género o de acento en los datos de entrenamiento.
- Riesgo de alucinación o artefactos en la prosodia y pronunciación en idiomas menos representados; no cuantificado.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las obligaciones de atribución y las condiciones del modelo base.
- El repositorio tiene 58 descargas y 0 likes en el momento de la consulta; es una conversión de terceros, no una publicación oficial de openbmb.
- Los ejemplos de la model card referencian el identificador `mlx-community/VoxCPM2-4bit`, distinto del ID de este repositorio (`theoracleguy/VoxCPM2-4bit`); conviene verificar qué identificador cargar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/theoracleguy/VoxCPM2-4bit
- Modelo base: https://huggingface.co/openbmb/VoxCPM2
- Librería mlx-audio: https://github.com/Blaizzy/mlx-audio
