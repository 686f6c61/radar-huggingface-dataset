# SPRINGLab/SPRING_F5

## Resumen

SPRING_F5 es un modelo de síntesis de voz (text-to-speech) multilingüe desarrollado por SPRING Lab (IIT Madras) a partir de F5-TTS, un modelo de TTS no autorregresivo basado en flow matching. La contribución principal es la extensión del modelo base para cubrir 23 lenguas de la India más el inglés, con especial énfasis en escenarios de code-mixing (alternancia de lenguas dentro de una misma frase), habituales en hablantes reales de telugu, tamil o hindi que intercalan términos ingleses.

El modelo se entrenó con aproximadamente 3.220 horas de audio de alta calidad procedente de los corpus Rasa, IndicTTS e IndicVoices-R, empleando 2 GPU NVIDIA H200 durante unas dos semanas. Mantiene la configuración base de F5-TTS, con alrededor de 330 millones de parámetros, y se distribuye con licencia Apache 2.0, lo que facilita su uso comercial.

Su relevancia actual radica en dos factores: la cobertura amplia de lenguas indias de bajos recursos (incluyendo idiomas como santali, bodo, dogri o maithili, poco representados en sistemas TTS comerciales) y la publicación de un benchmark específico de TTS cross-lingual para lenguas indias en AACL-IJCNLP 2026, junto con estrategias de estimación de duración en tiempo de inferencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | F5-TTS (flow matching no autorregresivo con DiT; configuración base) |
| Parámetros totales | ~330 M |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | 24: assamés, bengalí, bodo, guyaratí, hindi, canarés, cachemirí, konkani, maithili, malabar/malayalam, manipurí, maratí, nepalí, odia, panyabí, sánscrito, santali, sindhi, tamil, telugu, urdú, dogri, rayastaní e inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 5,4 GB, librería `transformers` con `trust_remote_code=True`) |

## Arquitectura y entrenamiento

SPRING_F5 hereda la arquitectura de F5-TTS: un modelo de difusión por flow matching con un backbone transformer (DiT) que predice mel-espectrogramas a partir de texto y de un audio de referencia, sin componente autorregresivo. La inferencia requiere un `ref_audio_path` y su `ref_text` correspondiente (zero-shot voice cloning), junto con un identificador de lengua (`lang`) que se usa para la conversión de números a palabras en la lengua objetivo. La frecuencia de muestreo de salida es de 24 kHz.

El entrenamiento partió de los pesos de `SWivid/F5-TTS` y se afinó con unas 3.220 horas de habla de Rasa, IndicTTS e IndicVoices-R, en 2 × NVIDIA H200 durante aproximadamente dos semanas (recursos cedidos por C-DAC). La model card no detalla la composición exacta por lengua ni si se aplicaron etapas de RLHF o DPO; para un modelo TTS, el ajuste se realiza sobre pares texto-audio y no sobre preferencias humanas, por lo que no se documenta alineamiento por preferencias. La innovación destacable es la estrategia de estimación de duración en tiempo de inferencia descrita en el artículo asociado, orientada a mejorar la naturalidad y reducir pausas innecesarias en enunciados code-mixed.

## Capacidades

- Síntesis de voz multilingüe en 23 lenguas indias más inglés, con un único modelo.
- Clonación de voz zero-shot a partir de un clip de referencia y su transcripción.
- Manejo de code-mixing intra-frase (p. ej. telugu con términos ingleses) sin pausas artificiales.
- Normalización de números a palabras en la lengua indicada mediante el parámetro `lang`.
- Salida de audio a 24 kHz en formato array de numpy, guardable con `soundfile`.
- Integración con la API de `transformers` (`AutoModel.from_pretrained` con código remoto).
- No soporta tool calling, agentes, visión ni audio de entrada más allá del prompt de referencia; es exclusivamente un modelo TTS.

## Casos de uso

- Audiolibros y contenido editorial en lenguas indias: el modelo permite narrar textos largos en hindi, tamil, bengalú u odia con una voz de referencia consistente, cubriendo idiomas que rara vez tienen voces comerciales de calidad.
- Asistentes de voz para atención al cliente: con 24 lenguas en un solo checkpoint se puede desplegar un único servicio TTS multi-tenant que seleccione la voz de referencia por cliente y la lengua por petición.
- Doblaje y localización de vídeo: la clonación zero-shot permite mantener el timbre del hablante original al doblar contenido de una lengua india a otra, útil en plataformas de formación y medios regionales.
- Accesibilidad y lectura de pantalla: lectura en voz alta de interfaces y documentos para usuarios de lenguas de bajos recursos como santali, bodo o maithili, donde los motores TTS comerciales no ofrecen cobertura.
- Sistemas conversacionales code-mixed: al manejar frases que mezclan inglés con telugu, tamil o hindi sin pausas antinaturales, encaja en agentes de voz para usuarios urbanos bilingües.
- Generación de datos sintéticos para ASR: producir audio etiquetado en lenguas con pocos datos para aumentar corpus de entrenamiento de reconocimiento de voz.
- Prototipado de IVR y telephony: al ser un modelo de 330 M parámetros, puede servirse en infraestructura modesta para mensajes pregrabados dinámicos en call centers regionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card referencia el artículo "Cross-Lingual TTS for Indian Languages: A Benchmark and Inference-Time Duration Estimation Strategies" (AACL-IJCNLP 2026), pero no incluye las tablas numéricas de resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con ~330 M parámetros, los pesos en fp32 ocupan aproximadamente 1,3 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo con 8 GB o más.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp32; las H200 se usaron solo para entrenamiento.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060/4060 y superiores; no confirmado por el autor.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`; el repositorio de GitHub del proyecto ofrece instalación vía `pip install git+https://github.com/ArigalaAdarsh/SPRING_F5.git`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Notas |
|---|---|---|---|---|
| SPRING_F5 | ~330 M | 24 (23 indias + inglés) | Apache 2.0 | Fine-tune de F5-TTS; clonación zero-shot; code-mixing |
| F5-TTS (SWivid) | ~330 M (base) | Principalmente inglés y chino | CC-BY-NC (según el proyecto original; no confirmado en esta ficha) | Modelo base del que deriva SPRING_F5 |
| IndicTTS / sistemas TTS de AI4Bharat | no disponible | Lenguas indias | no disponible | Alternativa regional; no se dispone de datos comparativos en esta ficha |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- No se documentan evaluaciones de sesgo; al entrenarse con corpus de habla indios, puede reproducir sesgos de acento, género o registro presentes en Rasa, IndicTTS e IndicVoices-R.
- Riesgo de alucinación en TTS: puede producir prosodia incorrecta, pronunciaciones erróneas o artefactos en textos fuera de dominio, especialmente en lenguas con pocos datos como santali, bodo o dogri.
- Requiere un audio de referencia y su transcripción exacta; una referencia ruidosa o mal transcrita degrada la calidad de la clonación.
- La conversión de números depende del parámetro `lang`; un identificador incorrecto produce lectura errónea de cifras.
- No se especifican límites de longitud de texto por inferencia; los textos largos pueden requerir troceado manual.
- Licencia Apache 2.0 permite uso comercial, pero no se aportan garantías ni se documentan restricciones adicionales sobre las voces clonadas; el uso de la clonación de voz está sujeto a la legislación aplicable y al consentimiento del hablante.
- El modelo exige `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar el código antes de desplegarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SPRINGLab/SPRING_F5
- Repositorio de código: https://github.com/ArigalaAdarsh/SPRING_F5
- Repositorio del benchmark: https://github.com/Cross-Lingual-TTS-for-Indian-Languages/Cross-Lingual-TTS-Indic-Test-Set/
- Artículo (AACL-IJCNLP 2026): https://aclanthology.org/2026.multilll-1.6.pdf
- Página de demos: https://cross-lingual-tts-for-indian-languages.github.io/Cross-Lingual-TTS-Demo/
- SPRING Lab (IIT Madras): https://asr.iitm.ac.in/
- F5-TTS (modelo base): https://github.com/SWivid/F5-TTS
- Dataset Rasa: https://huggingface.co/datasets/ai4bharat/Rasa
- Dataset IndicVoices-R: https://huggingface.co/datasets/ai4bharat/indicvoices_r
- Dataset IndicTTS: https://www.iitm.ac.in/donlab/indictts/database
