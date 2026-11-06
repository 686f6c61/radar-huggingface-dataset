# sulabhkatiyar/indic-tiny-tts-assamese

## Resumen

Indic Tiny TTS: Assamese es un modelo de síntesis de voz (text-to-speech) de tamano reducido, especializado en el idioma asamés (código ISO `as`). Lo desarrolla sulabhkatiyar como parte de la colección INDIC TINY TTS MODELS, que agrupa 12 modelos pequeños, uno por idioma, para 11 lenguas de la India y el inglés indio. El modelo convierte texto en escritura asamés en audio inteligible con dos voces disponibles, femenina y masculina, a una frecuencia de muestreo de 24 kHz.

El problema que aborda es la ausencia de sistemas TTS ligeros y de calidad para lenguas indias de bajos recursos: la mayoría de alternativas abiertas para asamés superan los 30 millones de parámetros y algunas alcanzan los 937 millones, lo que encarece el despliegue en dispositivos. Este modelo, con 8,9 millones de parámetros reales según los pesos safetensors (la model card cita 22,5 millones como cifra nominal), consigue una tasa de error de caracteres (CER) competitiva frente a modelos mucho mayores.

Su relevancia actual radica en que funciona en CPU sin GPU: según la model card, sintetiza 38 veces más rápido que tiempo real en un hilo de CPU Apple M1 y 7 veces en un hilo x86, con factores de tiempo real de 0,026 y 0,136 respectivamente. Esto lo hace adecuado para síntesis en dispositivo, entornos con recursos limitados y aplicaciones de accesibilidad donde el coste de inferencia es crítico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS neuronal; la model card no detalla la topologia interna) |
| Parametros totales | 8.933.641 (segun safetensors); la model card declara 22,5 M nominales |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen pesos safetensors y ONNX) |
| Idiomas soportados | asamés (`as`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors y ONNX |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura interna (si es VITS, FastSpeech, un modelo basado en difusion o un hibrido). Lo que sí se documenta es que el modelo es de tipo text-to-speech con dos voces (femenina y masculina) y que opera a 24 kHz. Se distribuye en dos formatos de pesos, safetensors y ONNX, lo que permite ejecución tanto con PyTorch como con ONNX Runtime.

El entrenamiento se realizó sobre el dataset `sulabhkatiyar/indic-tts-mini-24k`, que contiene las voces femenina y masculina de asamés del corpus AI4Bharat Rasa a 24 kHz, derivado del dataset completo `sulabhkatiyar/indic-tts-multilingual-prepared`. La model card menciona también `ai4bharat/Rasa` como fuente. No se documentan el número de tokens de audio, la composición exacta del dataset ni si hubo fases de ajuste fino con RLHF o preferencias, por lo que esos datos deben considerarse no disponibles.

Como innovación destacable, el modelo prioriza la eficiencia: la comparativa de velocidad de la model card reporta un factor de tiempo real de 0,016 en GPU NVIDIA T4 (62 veces más rápido que tiempo real), 0,026 en CPU M1 y 0,136 en CPU x86 con un solo hilo. La model card también afirma que es aproximadamente 132 veces más rápido que `ai4bharat/indic-parler-tts` en T4 y 145 veces más rápido que `ai4bharat/IndicF5`.

## Capacidades

- Síntesis de voz a partir de texto en escritura asamés, con salida de audio a 24 kHz.
- Dos voces seleccionables: femenina (`voice="female"`) y masculina.
- Inferencia en CPU sin necesidad de GPU, con PyTorch o ONNX Runtime.
- Ejecución en dispositivo (on-device) gracias al reducido numero de parámetros y al formato ONNX.
- Rendimiento en tiempo real o superior en hardware modesto: 7× en un hilo x86, 38× en un hilo M1 y 62× en T4.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking; es exclusivamente un modelo TTS.

## Casos de uso

- Lectura de noticias y artículos en asamés: el modelo sintetiza frases informativas con una CER del 3,07 % en FLORES-200, adecuado para servicios de lectura por voz de contenido periodístico.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla para dispositivos de gama baja, ya que funciona en CPU y a 7× tiempo real en un hilo x86.
- Asistentes de voz en dispositivos embebidos: al ocupar 0,2 GB de repositorio y ejecutarse con ONNX Runtime, puede desplegarse en hardware sin GPU para dar respuestas habladas en asamés.
- Locución automatizada de contenido educativo: generación de audio para materiales de aprendizaje en asamés con las voces femenina o masculina según el público objetivo.
- Sistemas de anuncios y avisos públicos: síntesis rápida de mensajes cortos en entornos con recursos computacionales limitados, donde un modelo de 937 M parámetros sería inviable.
- Prototipado y evaluación de pipelines TTS multilingües: al formar parte de una colección de 12 modelos por idioma, permite construir demos comparativas de síntesis para lenguas indias con una huella de almacenamiento mínima.
- Pruebas de calidad perceptual en investigación: servir como línea base ligera frente a modelos mayores como IndicF5 o indic-parler-tts en experimentos de evaluación de TTS asamés.

## Benchmarks y rendimiento

Resultados de CER (character error rate, menor es mejor) reportados en la model card:

| Modelo | Tamano | CER en FLORES-200 (100 frases), % | CER en test reservado (296 frases), % |
|---|---:|---:|---:|
| **Este modelo** | 22,5 M (nominal) | **3,07** | **5,93** |
| `ai4bharat/IndicF5` | 350,6 M | 2,28 | no disponible |
| `ai4bharat/indic-parler-tts` | 937,8 M | 3,82 | no disponible |
| `ai4bharat/vits_rasa_13` | 31,3 M | 4,15 | 6,69 |
| `facebook/mms-tts-asm` | 29,1 M | 5,65 | 15,16 |
| `github.com/AI4Bharat/Indic-TTS` (as.zip) | 65,6 M | 6,71 | 10,46 |
| `multilingual-tts/VITS-OpenBible-Assamese` | 29,1 M | 6,89 | no disponible |

En las 40 frases comparadas directamente con modelos mayores, la model card reporta CER de 6,14 % para este modelo frente a 5,06 % de IndicF5 y 6,24 % de indic-parler-tts, con intervalos de confianza que indican diferencias no significativas en el caso de parler-tts.

| Hardware | Configuracion | Factor de tiempo real | Veces mas rapido que tiempo real |
|---|---|---:|---:|
| CPU x86 (Intel Xeon @ 2,20 GHz, 4 vCPU) | PyTorch, 1 hilo | 0,136 | 7× |
| CPU Apple M1 | PyTorch, 1 hilo | 0,026 | 38× |
| GPU NVIDIA T4 | PyTorch | 0,016 | 62× |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; por el tamano (8,9 M parametros reales, 0,2 GB de repositorio) la huella es minima y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: NVIDIA T4 es la referencia medida en la model card (62× tiempo real); cualquier GPU moderna es sobradamente suficiente. No requiere GPU en absoluto.
- Cabe en GPU consumer: sí, en cualquier GPU consumer e incluso en CPU integrada; la model card demuestra ejecución en CPU x86 y Apple M1.
- Opciones de despliegue: PyTorch y ONNX Runtime, ambos documentados en la model card. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo TTS de este tipo.
- Latencia y throughput: factor de tiempo real de 0,016 en T4, 0,026 en CPU M1 y 0,136 en CPU x86 de un hilo, medido sobre 30 frases reservadas.

## Comparativa con modelos similares

| Modelo | Parametros | CER FLORES-200, % | Licencia | Disponibilidad |
|---|---:|---:|---|---|
| **Este modelo** | 22,5 M nominales (8,9 M reales) | 3,07 | CC-BY-4.0 | Hugging Face, safetensors y ONNX |
| `ai4bharat/IndicF5` | 350,6 M | 2,28 | no disponible en la informacion | Hugging Face |
| `ai4bharat/indic-parler-tts` | 937,8 M | 3,82 | no disponible en la informacion | Hugging Face |
| `ai4bharat/vits_rasa_13` | 31,3 M | 4,15 | no disponible en la informacion | Hugging Face |
| `facebook/mms-tts-asm` | 29,1 M | 5,65 | no disponible en la informacion | Hugging Face |

La ventaja principal de este modelo frente a todos ellos es la relacion calidad-tamano-velocidad: iguala o supera en CER a modelos de 29 a 65 M parametros y queda cerca de IndicF5 (350,6 M) y indic-parler-tts (937,8 M) con una fraccion del coste computacional.

## Limitaciones y advertencias

- Solo cubre el asamés; no es multilingue y no puede sintetizar otras lenguas indias.
- La model card declara 22,5 M parametros, mientras que los safetensors contienen 8.933.641; la discrepancia debe tenerse en cuenta al planificar recursos.
- La arquitectura interna no esta documentada, lo que dificulta el ajuste fino o la modificacion del modelo.
- No se documentan sesgos de voz, prosodia ni cobertura de dominios; el entrenamiento se limita a las voces de AI4Bharat Rasa, por lo que la variedad de hablantes y estilos es reducida.
- Riesgo de alucinacion acustica o artefactos en texto fuera del dominio de entrenamiento (nombres propios, siglas, números o mezcla de scripts) no esta cuantificado en la informacion disponible.
- La licencia CC-BY-4.0 permite uso comercial con atribucion, pero exige citar al autor y mantener la licencia; no se documentan restricciones adicionales.
- No se han publicado datos sobre robustez ante texto ruidoso, puntuacion atipica o frases muy largas; la evaluacion se limita a frases de noticias y a un conjunto reservado de 296 frases.
- El modelo esta marcado con `inference: false` en la model card, lo que puede afectar a la carga automatica en la plataforma Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sulabhkatiyar/indic-tiny-tts-assamese
- Coleccion INDIC TINY TTS MODELS: https://huggingface.co/collections/sulabhkatiyar/indic-tiny-tts-models-6aeae36f954418631a68676d
- Dataset de entrenamiento: https://huggingface.co/datasets/sulabhkatiyar/indic-tts-mini-24k
- Dataset multilingue preparado: https://huggingface.co/datasets/sulabhkatiyar/indic-tts-multilingual-prepared
- Corpus AI4Bharat Rasa: https://huggingface.co/datasets/ai4bharat/Rasa
- Modelo IndicF5: https://huggingface.co/ai4bharat/IndicF5
- Modelo indic-parler-tts: https://huggingface.co/ai4bharat/indic-parler-tts
- Modelo vits_rasa_13: https://huggingface.co/ai4bharat/vits_rasa_13
- Modelo mms-tts-asm: https://huggingface.co/facebook/mms-tts-asm
- Repositorio AI4Bharat Indic-TTS: https://github.com/AI4Bharat/Indic-TTS
- Modelo VITS-OpenBible-Assamese: https://huggingface.co/multilingual-tts/VITS-OpenBible-Assamese
