# YukiKaze1337/DaFeiYu_rvc_v2_40k

## Resumen

DaFeiYu_rvc_v2_40k es un modelo de conversión de voz (voice-to-voice) basado en la arquitectura RVC v2, publicado por el usuario YukiKaze1337 en Hugging Face. No se trata de un modelo de texto a voz (TTS) ni de un modelo de lenguaje: es un checkpoint de generador entrenado para transformar una señal de audio de entrada (voz hablada o cantada) en la voz del personaje «大肥鱼» (DaFeiYu), preservando el contenido prosódico y la melodía del audio original. El modelo opera a una frecuencia de muestreo de 40 kHz y emplea extracción de f0 (pitch), lo que lo hace apto tanto para habla como para canto.

El modelo se distribuye como un par de artefactos: el generador `dafeiyu.pth` (53 MB) y un índice FAISS de recuperación de características (`added_IVF1314_Flat_nprobe_1_dafeiyu_v2.index`, 154 MB) que mejora la similitud tímbrica durante la inferencia. Requiere un entorno de inferencia RVC (WebUI o CLI del repositorio oficial) para funcionar; no es un modelo autónomo que se pueda cargar con `transformers`.

Su relevancia es acotada pero concreta: cubre el nicho de conversión de voz para doblaje, creación de contenido y experimentación con personajes sintéticos, con licencia MIT y un conjunto de entrenamiento declarado como sintético (sin grabaciones de personas reales), lo que reduce las preocupaciones de derechos de imagen del material de origen. La calidad está limitada por un corpus de entrenamiento pequeño (unos 11,1 minutos en 227 segmentos), tal y como advierte el propio autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RVC v2 (generador VITS-like con encoder HuBERT/ContentVec y decoder, condicionado por f0) |
| Parámetros totales | no disponible (peso del generador: 53 MB) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; procesa segmentos de audio, no tokens de texto) |
| Tipos de cuantización | no disponible (checkpoint PyTorch `.pth` en fp32/fp16 según exportación) |
| Idiomas soportados | chino (zh) según metadatos; el modelo es independiente del idioma hablado, pero el corpus de entrenamiento es de voz sintética en chino |
| Licencia | MIT |
| Formato de pesos | `.pth` (PyTorch) + índice FAISS `.index` |
| Frecuencia de muestreo | 40 kHz |
| Uso de f0 | sí (f0=1), extracción de pitch mediante RMVPE en los ejemplos del autor |
| Número de hablantes | 109 reservados en `emb_g`, solo se usa el speaker 0 |
| Tamaño del repositorio | 0,2 GB |
| Índice de recuperación | FAISS IVF1314 Flat, 51.267 vectores de 768 dimensiones |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura estándar de RVC v2: un encoder de contenido (típicamente HuBERT o ContentVec) extrae representaciones latentes del audio de entrada, que se combinan con la información de pitch (f0) extraída por separado (RMVPE en el ejemplo de uso) y se inyectan en un decoder generativo que sintetiza la forma de onda a 40 kHz. La variante con f0 permite preservar la entonación del habla y la melodía del canto, lo que la hace adecuada para conversión de voz cantada además de hablada. El índice FAISS almacena 51.267 vectores de 768 dimensiones y se usa en inferencia para recuperar vecinos cercanos y reforzar la similitud tímbrica con el hablante objetivo.

El entrenamiento se realizó sobre 227 segmentos de audio (aproximadamente 11,1 minutos) de voz mecánicamente sintetizada, no de grabaciones humanas, y el checkpoint exportado corresponde a unas 2,33 millones de pasos (`D_2333333.pth` / `G_2333333.pth`). No se documentan detalles sobre función de pérdida, composición exacta del dataset, ni si hubo etapas de ajuste adicionales. El autor advierte explícitamente que 11 minutos es un volumen bajo para este tipo de modelos, lo que se traduce en una estabilidad tímbrica aceptable pero con deriva potencial en notas altas y sostenidas.

## Capacidades

- Conversión de voz a voz (speech-to-speech): transforma la identidad tímbrica de una grabación manteniendo el contenido lingüístico y la prosodia.
- Conversión de voz cantada: al usar f0, preserva la melodía y el vibrato del audio original, lo que permite reutilizar pistas vocales con otra identidad.
- Independencia del idioma de entrada: aunque los metadatos declaran chino, el pipeline RVC no está atado a un idioma concreto en la práctica.
- Extracción de pitch configurable: soporta distintos métodos de f0 (RMVPE en los ejemplos del autor) y ajuste de tono mediante `--pitch` (por ejemplo, +12 semitonos para pasar de voz masculina a la tesitura del modelo).
- Integración con RVC WebUI y con el CLI oficial del repositorio RVC.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo de audio.

## Casos de uso

- Doblaje y localización de contenido: sustituir la voz de un actor por la del personaje manteniendo la interpretación original; el uso de f0 y del índice FAISS permite conservar la expresividad sin re-grabar las líneas.
- Creación de contenido para vídeo y streaming: aplicar la voz de DaFeiYu a grabaciones propias para producir clips con una identidad sonora consistente, usando RVC WebUI como interfaz de referencia.
- Producción musical amateur: convertir pistas vocales cantadas a la tesitura del modelo (con `--pitch 12` para voces masculinas) para maquetas o covers, aprovechando la preservación de melodía que aporta la condicionamiento por f0.
- Prototipado de personajes sintéticos: generar muestras de voz de un personaje para videojuegos, animación o narrativa interactiva antes de invertir en un modelo TTS o en grabaciones profesionales.
- Investigación en conversión de voz: servir como checkpoint de referencia para comparar métodos de extracción de f0 (RMVPE frente a alternativas) o el impacto del índice FAISS en la similitud tímbrica.
- Anonimización de voz en entornos controlados: transformar grabaciones propias para reducir la identificación del hablante en demos o datasets internos, siempre que se respeten las restricciones de uso del autor.
- Pruebas de pipelines de audio-to-audio: validar integraciones con el CLI de RVC o con herramientas de post-procesado (resampleo, normalización) usando un modelo ligero de 0,2 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el generador pesa 53 MB y el índice 154 MB; en la práctica, el consumo dominante proviene del encoder de contenido y del proceso de extracción de f0, no del checkpoint. Una GPU con 4-6 GB de VRAM es suficiente para inferencia en fp16; el índice FAISS puede residir en CPU o en GPU según la configuración de RVC.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090, A100, H100). Para lotes grandes o procesamiento por lotes conviene partir de 8 GB.
- ¿Cabe en GPU de consumo? Sí, en la práctica totalidad de GPU de consumo recientes con 4 GB o más de VRAM.
- Opciones de despliegue: RVC WebUI (interfaz gráfica), CLI oficial de RVC (`infer/cli.py`), y cualquier wrapper que cargue el `.pth` con `torch.load` y el índice con FAISS. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles de forma oficial. Como referencia cualitativa, el autor advierte que en macOS con faiss y torch usando OpenMP simultáneamente pueden producirse fallos de segmentación, y recomienda `OMP_NUM_THREADS=1` antes de la inferencia.
- Almacenamiento: el repositorio completo ocupa 0,2 GB, por lo que cabe en cualquier disco.

## Comparativa con modelos similares

| Modelo | Arquitectura | Muestreo | f0 | Licencia | Tamaño | Contexto / notas |
|---|---|---|---|---|---|---|
| DaFeiYu_rvc_v2_40k | RVC v2 | 40 kHz | Sí | MIT | 0,2 GB (repo) | Corpus sintético de ~11 min; 109 hablantes reservados, solo speaker 0 |
| RVC v2 genéricos (checkpoints de la comunidad) | RVC v2 | 32-48 kHz | Configurable | Variable (a menudo MIT o similar) | 0,1-0,5 GB | Calidad dependiente del corpus; ecosistema amplio en Hugging Face y foros |
| Modelos TTS neuronales (p. ej. VITS, Piper) | TTS | 16-22 kHz | No aplica | Variable | 50-200 MB | Generan voz desde texto; no convierten audio existente |
| Modelos de conversión de voz comerciales (p. ej. ElevenLabs Voice Changer) | Propietaria | 44,1 kHz | Sí | Propietaria | Servicio en la nube | No desplegables localmente; sin control sobre el checkpoint |

La comparación con TTS no es directa porque DaFeiYu es un modelo de conversión, no de síntesis desde texto. Frente a otros checkpoints RVC de la comunidad, su principal diferencia es el corpus sintético declarado y el número de pasos de entrenamiento (2,33 millones), aunque el volumen de datos de entrenamiento es reducido.

## Limitaciones y advertencias

- Corpus de entrenamiento muy pequeño (unos 11,1 minutos en 227 segmentos): el propio autor advierte que la voz puede «desviarse» en notas altas y sostenidas, con inestabilidad en pasajes largos.
- Material de entrenamiento sintético: la voz objetivo no corresponde a una persona real, lo que reduce riesgos de derechos de imagen, pero también puede limitar la naturalidad respecto a modelos entrenados con grabaciones humanas.
- Un solo hablante efectivo: aunque `emb_g` reserva 109 identidades, solo se usa el speaker 0; no es un modelo multi-hablante utilizable.
- Dependencia de un entorno RVC: no se puede cargar con `transformers` ni con pipelines estándar de Hugging Face; requiere el ecosistema RVC (WebUI o CLI).
- Problemas conocidos en macOS: posible fallo de segmentación con faiss y torch compartiendo OpenMP; se recomienda `OMP_NUM_THREADS=1`.
- Restricciones de uso del autor: la model card indica que el modelo es solo para aprendizaje personal, entretenimiento y creación no comercial, y prohíbe su uso para suplantación de identidad, fraude, falsificación o cualquier fin que vulnere derechos de terceros. Aunque la licencia declarada es MIT, estas restricciones adicionales deben respetarse.
- Riesgo de uso indebido: como todo modelo de conversión de voz, puede emplearse para suplantación o deepfakes de audio; es responsabilidad del usuario cumplir la normativa aplicable y obtener consentimiento.
- Idiomas: los metadatos declaran solo chino; no hay evaluación publicada de su comportamiento con entradas en otros idiomas.
- Sin benchmarks publicados: no hay métricas objetivas de similitud (SECS), naturalidad (MOS) ni inteligibilidad (WER) que permitan comparar su calidad de forma cuantitativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YukiKaze1337/DaFeiYu_rvc_v2_40k
- Dataset de entrenamiento: https://huggingface.co/datasets/YukiKaze1337/dafeiyu-rvc-dataset
- Repositorio oficial de RVC (referenciado en la model card para el CLI): no disponible como enlace directo en la información proporcionada
- Documentación de RVC WebUI: no disponible en la información proporcionada
