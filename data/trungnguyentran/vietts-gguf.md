# trungnguyentran/vietts-gguf

## Resumen

VieTTS es un modelo de síntesis de voz (text-to-speech) en vietnamita desarrollado por trungnguyentran, diseñado para ejecutarse localmente en hardware de consumo (Apple Silicon o GPUs NVIDIA) sin depender de APIs en la nube. El modelo combina un backbone de lenguaje Qwen3-0.6B extendido con 65.536 tokens de habla adicionales, un codec neuronal NeuCodec FSQ de un solo codebook y un pipeline de fonetización vietnamita (sea-g2p) para generar audio de 24 kHz a partir de texto.

Su relevancia radica en que ofrece clonación de voz instantánea a partir de 3-10 segundos de audio de referencia, 38 voces predefinidas con variedad regional (norte, sur y neutro) y síntesis de texto largo con consistencia de voz mediante anclaje de la primera frase. El modelo está cuantizado en GGUF Q8_0 (~712 MB) y alcanza aproximadamente 80 tokens por segundo en un Apple M4, lo que equivale a 1,6 veces la velocidad en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3-0.6B) extendido con 65.536 tokens de habla |
| Parametros totales | 662.896.640 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (se procesa por chunks de ~18 segundos) |
| Tipos de cuantizacion | GGUF Q8_0 |
| Idiomas soportados | vietnamita (principal) |
| Licencia | Uso exclusivo para investigacion; voces derivadas de viVoice (CC-BY-NC-SA-4.0) y clips de ElevenLabs (sujeto a sus terminos) |
| Formato de pesos | GGUF (tambien safetensors en el repositorio) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3-0.6B, un transformer decoder denso, al que se le añaden 65.536 tokens especiales de habla. El proceso de inferencia convierte el texto en fonemas IPA vietnamitas mediante sea-g2p, y estos fonemas junto con un codigo de voz de referencia forman el prompt del modelo de lenguaje. El LM genera tokens de audio NeuCodec (50 tokens por segundo) que posteriormente se decodifican a forma de onda de 24 kHz mediante un decodificador ONNX de NeuCodec.

El entrenamiento se realizó sobre el dataset viVoice, que contiene aproximadamente 1.017 horas de habla vietnamita de más de 630 hablantes. No se menciona el uso de RLHF o DPO; el enfoque es de modelado de lenguaje supervisado sobre tokens de audio. Para la síntesis de texto largo, el sistema divide el texto en frases, utiliza el audio de la primera frase como ancla de voz para las siguientes, y opcionalmente emplea un guardián de hablante basado en resemblyzer (d-vector) que rechaza fragmentos que se desvían de la voz de referencia.

## Capacidades

- Generación de voz vietnamita natural con 38 voces predefinidas (19 masculinas y 19 femeninas) con estilos y regiones variados.
- Clonación de voz instantánea a partir de 3-10 segundos de audio de referencia.
- Síntesis de texto largo (minutos) con consistencia de voz mediante anclaje y guardián de hablante opcional.
- Control fino de parámetros de muestreo (temperatura, top-k, max-new-tokens) para ajustar expresividad y estabilidad.
- Salida de audio en formato WAV mono de 24 kHz.
- Ejecución local en Apple Silicon (Metal) y GPUs NVIDIA (CUDA) mediante llama-cpp-python.
- No soporta tool calling ni razonamiento multi-paso; es un modelo puramente generativo de audio.

## Casos de uso

- Audiolibros y narración de cuentos: el modelo puede generar narraciones largas con voz consistente gracias al anclaje de la primera frase y al guardián de hablante, ideal para convertir texto en audio de minutos de duración.
- Asistentes de voz locales: integración en aplicaciones de escritorio o móviles que requieran síntesis de voz en vietnamita sin conexión, usando voces predefinidas o clonadas.
- Doblaje de contenido multimedia: clonación de voces de actores o locutores a partir de muestras cortas para doblar vídeos o podcasts manteniendo la identidad vocal.
- Accesibilidad para personas con discapacidad visual: lectura de textos largos (artículos, libros) en vietnamita con voces naturales y regionales.
- Prototipado rápido de productos de voz: los desarrolladores pueden probar diferentes voces y estilos sin necesidad de grabar audio real, usando el catálogo de 38 voces.
- Educación y aprendizaje de idiomas: generación de ejemplos de pronunciación vietnamita con diferentes acentos regionales (norte, sur) para aplicaciones de enseñanza.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica un rendimiento de aproximadamente 80 tokens por segundo en Apple M4 (1,6× tiempo real), sin comparaciones con otros sistemas TTS.

## Requisitos de hardware

- VRAM estimada: el modelo GGUF Q8_0 ocupa ~712 MB, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM (incluidas GPUs integradas).
- GPUs recomendadas: Apple Silicon (M1/M2/M3/M4) con Metal, o GPUs NVIDIA con CUDA (por ejemplo, RTX 2060 o superiores). También puede ejecutarse en CPU, aunque con menor rendimiento.
- Compatible con hardware de consumo: sí, cualquier equipo con 4 GB de RAM o más puede ejecutarlo.
- Opciones de despliegue: llama-cpp-python (con soporte Metal o CUDA), posiblemente Ollama si se convierte el GGUF, y servidores compatibles con la API de endpoints (según los tags del repositorio).
- Latencia y throughput: ~80 tok/s en Apple M4, lo que equivale a generar 1,6 segundos de audio por segundo de cómputo. En GPUs NVIDIA se espera un rendimiento similar o superior.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se podría comparar con otros sistemas TTS vietnamitas como Coqui TTS o VITS, pero no hay datos de rendimiento ni benchmarks para establecer una comparación rigurosa.

## Limitaciones y advertencias

- Licencia restrictiva: el uso está limitado a investigación; las voces derivadas de viVoice están bajo CC-BY-NC-SA-4.0, lo que prohíbe uso comercial. Las voces basadas en clips de ElevenLabs están sujetas a los términos de esa plataforma.
- Riesgo de alucinación en audio: como modelo generativo, puede producir sonidos o entonaciones inesperadas, especialmente con texto fuera del dominio de entrenamiento.
- Limitación de idioma: solo genera vietnamita; no soporta otros idiomas aunque el backbone Qwen3 sea multilingüe.
- Longitud de contexto limitada: el modelo está entrenado para generar hasta ~18 segundos por chunk (900 tokens); para textos más largos se requiere el mecanismo de anclaje, que puede fallar si la voz de referencia es muy diferente.
- Dependencia de componentes externos: requiere sea-g2p, onnxruntime, transformers y, opcionalmente, resemblyzer y librosa, lo que añade complejidad de instalación.
- Sin garantías de calidad en producción: al ser un proyecto de investigación, no hay soporte oficial ni documentación extensa más allá de la model card.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/trungnguyentran/vietts-gguf
- Dataset viVoice (referenciado en la model card, sin URL directa)
- Qwen3-0.6B (modelo base): https://huggingface.co/Qwen/Qwen3-0.6B
- NeuCodec (codec neuronal, sin URL directa en la documentación)
