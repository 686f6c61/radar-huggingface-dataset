# Tilas/neutts-air-darija-v1

## Resumen

`Tilas/neutts-air-darija-v1` es un modelo de síntesis de voz (text-to-speech) afinado sobre `neuphonic/neutts-air`, especializado en darija marroquí (árabe dialectal de Marruecos). Lo desarrolla el usuario Tilas a partir del backbone de Neuphonic, un modelo TTS de 747,9 millones de parámetros con arquitectura tipo Qwen2 que representa el habla como tokens NeuCodec (un único codebook de 65.536 códigos, 50 tokens por segundo y 0,8 kbps). El modelo se publica bajo licencia Apache 2.0 y es relevante porque cubre un hueco claro: la darija tiene escasa representación en los sistemas TTS comerciales, y este modelo permite síntesis de voz en ese dialecto con clonación de voz por referencia y ejecución local, sin depender de APIs en la nube.

El repositorio incluye 3,0 GB de pesos en formato safetensors y se distribuye junto con un dataset propio (`Tilas/MoulSot-Tokens-v1`) de aproximadamente 94,8 horas de habla darija tras filtrado. El modelo no está registrado en el mapa de idiomas del framework NeuTTS, por lo que requiere pasar explícitamente `language="ar"` en la inferencia y usar el fonemizador personalizado incluido en el repositorio. La licencia Apache 2.0 permite uso comercial sin restricciones de atribución adicionales más allá de las estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen2 (backbone NeuTTS Air) |
| Parámetros totales | 747.930.496 (747,9 M) |
| Parámetros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 896 tokens (secuencia máxima de entrenamiento) |
| Tipos de cuantización | no disponible para este fine-tune; el base NeuTTS Air tiene variantes Q4 y Q8 GGUF |
| Idiomas soportados | ary (darija marroquí), ar (árabe) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de NeuTTS Air, un TTS basado en un backbone LLM de aproximadamente 0,5 mil millones de parámetros. El habla se codifica como tokens NeuCodec de un único codebook con 65.536 códigos posibles, una tasa de 50 tokens por segundo y un bitrate de 0,8 kbps. El modelo genera estos tokens a partir de texto fonemizado, y los tokens generados deben decodificarse posteriormente con `neuphonic/neucodec` para obtener la forma de onda final.

El afinado se realizó sobre el dataset `Tilas/MoulSot-Tokens-v1`, con 71.919 muestras de entrenamiento y 1.000 de evaluación (94,8 horas de habla tras filtrado). El entrenamiento empleó secuencias de hasta 896 tokens, batch efectivo de 32, tasa de aprendizaje de 4e-05 con programación coseno y 3 % de warmup, durante 2 épocas en precisión bf16 sobre una NVIDIA RTX 4090. La pérdida final de evaluación fue de 7,1369. La supervisión cubre únicamente el tramo de habla; el prompt fonémico y el padding se enmascaran con valor -100. El fonemizador es un componente crítico: se usa la voz `ar` de espeak-ng con un mapeo personalizado de puntuación árabe a latina, y debe emplearse el mismo fonemizador en inferencia para que el modelo reciba la misma distribución fonémica que en entrenamiento.

## Capacidades

- Síntesis de voz en darija marroquí a partir de texto sin diacríticos, con fonemización automática mediante espeak-ng adaptado.
- Clonación de voz por referencia: la inferencia acepta `ref_codes` y `ref_text` para reproducir la voz de un clip de audio de referencia.
- Ejecución completamente local y sin conexión, sin dependencia de APIs externas.
- Representación compacta del habla mediante NeuCodec de un solo codebook, lo que reduce la carga computacional frente a modelos multi-codebook.
- Compatibilidad con el framework NeuTTS de Neuphonic, incluida la carga de pesos desde Hugging Face.
- Generación de tokens de habla a 50 tokens por segundo, con decodificación posterior mediante `neuphonic/neucodec`.

## Casos de uso

- Asistentes de voz en darija para aplicaciones móviles: el modelo se ejecuta en el dispositivo, lo que garantiza privacidad de las conversaciones y funcionamiento sin conexión, adecuado para apps de asistencia personal o domótica.
- Audioguías y guías turísticas en Marruecos: permite generar narraciones en darija para museos, monumentos o rutas urbanas, con la posibilidad de clonar voces de locutores profesionales.
- Accesibilidad para personas con discapacidad visual: síntesis de voz en darija para lectores de pantalla y aplicaciones de accesibilidad, un segmento donde la darija está prácticamente ausente en los sistemas comerciales.
- Atención al cliente automatizada en darija: integración en sistemas IVR o chatbots de voz para empresas que operan en Marruecos, con clonación de voz para mantener una identidad sonora consistente.
- Producción de contenido audiovisual en darija: narración de vídeos, podcasts o anuncios publicitarios sin necesidad de contratar locutores, usando clonación de voz para mantener la coherencia entre episodios.
- Dispositivos IoT y hardware embebido: gracias a su tamaño reducido (747,9 M de parámetros) y a la disponibilidad de cuantizaciones GGUF en el modelo base, puede desplegarse en dispositivos de gama media con recursos limitados.
- Educación y aprendizaje de darija: generación de materiales de audio para cursos de idiomas, ejercicios de pronunciación y contenido didáctico dirigido a hablantes no nativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MOS, MUSHRA, CER, etc.) en la información disponible. El único indicador reportado es la pérdida de evaluación final de 7,1369, que el propio autor señala como una señal de salud del entrenamiento y no como una métrica de calidad del habla. Además, el conjunto de evaluación es una muestra aleatoria de los mismos canales de entrenamiento, por lo que la pérdida es optimista y no debe interpretarse como una medida de rendimiento absoluto.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 747,9 M de parámetros en bf16, lo que supone aproximadamente 1,5-2,0 GB de VRAM sin cuantizar; con cuantización Q4-Q8 (disponible para el modelo base) puede reducirse a 0,5-1,0 GB.
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA RTX 4090; para inferencia basta con GPUs de gama media como RTX 3060, RTX 4060 o superiores. También es viable en Apple Silicon (M1/M2/M3) mediante la implementación del framework NeuTTS.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo moderna con al menos 4 GB de VRAM.
- Opciones de despliegue: framework NeuTTS de Neuphonic (repositorio oficial), con soporte para carga desde Hugging Face; el modelo base también ofrece variantes GGUF para llama.cpp y otros runtime de inferencia local.
- Latencia: no se dispone de mediciones publicadas para este fine-tune concreto; el modelo base NeuTTS Air está diseñado para inferencia en tiempo real en dispositivos de gama media.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Licencia | Contexto | Notas |
|---|---|---|---|---|---|
| Tilas/neutts-air-darija-v1 | 747,9 M | darija (ary) | Apache 2.0 | 896 tokens | Fine-tune de NeuTTS Air para darija |
| neuphonic/neutts-air | 747,9 M | inglés (multilingüe parcial) | Apache 2.0 | no disponible | Modelo base, soporta clonación de voz |
| Modelos TTS árabes comerciales (Google, Azure) | no disponible | árabe estándar (MSA) | propietaria | no aplica | No cubren darija marroquí; requieren API en la nube |

No se dispone de modelos TTS open source comparables específicamente entrenados para darija marroquí en la información proporcionada. La comparativa se limita al modelo base y a soluciones comerciales de propósito general, que no cubren el dialecto darija.

## Limitaciones y advertencias

- Fonemización deficiente: espeak-ng aplica morfofonología del árabe estándar moderno (MSA) y no lee correctamente las vocales cortas en texto sin diacríticos, produciendo transcripciones IPA frecuentemente incorrectas (p. ej., `نبداو` → `mbdˈaːw`). El autor lo califica explícitamente como una solución provisional, no como un G2P definitivo para darija.
- Préstamos del francés: las palabras de origen francés reciben una fonemización con acento inglés cuando se usa `language_switch="remove-flags"`, lo que degrada la naturalidad en textos con léxico francófono habitual en darija.
- Transcripciones generadas automáticamente: los textos de entrenamiento fueron producidos por Gemini-2.5-Pro y no verificados por humanos; la darija carece de ortografía estandarizada, por lo que pueden existir inconsistencias.
- Calidad variable del audio fuente: el audio de entrenamiento proviene de YouTube, con condiciones acústicas heterogéneas y ruido de fondo aprendible. La calidad de la voz sintetizada depende en gran medida del clip de referencia elegido.
- Evaluación optimista: el split de evaluación es una muestra aleatoria de los mismos canales de entrenamiento, por lo que la pérdida reportada no refleja el rendimiento en datos no vistos.
- Requisito de fonemizador específico: si no se usa el fonemizador personalizado incluido en el repositorio, el modelo recibe una distribución fonémica distinta a la del entrenamiento y la calidad de salida se degrada.
- Restricción de secuencia: la longitud máxima de secuencia es de 896 tokens (aproximadamente 18 segundos de habla a 50 tokens/s), lo que limita la síntesis de frases muy largas sin segmentación previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Tilas/neutts-air-darija-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/Tilas/MoulSot-Tokens-v1
- Modelo base NeuTTS Air: https://huggingface.co/neuphonic/neutts-air
- Sitio oficial NeuTTS Air: https://neutts.com/
- Documentación alternativa: https://neutts.org/
- Repositorio GitHub del modelo base: https://github.com/tavallaie/neutts-air
- Demo interactiva (Hugging Face Space): https://huggingface.co/spaces/neuphonic/neutts-air
