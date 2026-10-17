# Vociepeak/ayana-voice

## Resumen

Vociepeak/ayana-voice es un paquete de voces (voice pack) para síntesis de voz en japonés, distribuido como runtime preempaquetado del motor GPT-SoVITS v2Pro. No se trata de un modelo entrenado desde cero ni de un lanzamiento de pesos aislado: el repositorio contiene dos archivos de entorno (variantes `cu124` y `cu128`) con un runtime Python relocalizable, el motor GPT-SoVITS v2Pro con versiones fijadas, los pesos GPT/SoVITS de la voz "Ayana", audio de referencia, ffmpeg y datos de nltk. El objetivo declarado es alimentar la voz del personaje Ayana en una aplicación de escritorio de tipo companion.

El interés técnico está en el formato de entrega, no en la innovación algorítmica: el usuario final no necesita instalar Python ni el CUDA Toolkit, y la selección de variante se hace por arquitectura de GPU (compute capability) y versión mínima de driver. El repositorio ocupa 17,8 GB, incluye un manifiesto `voice-pack.json` con hashes SHA256 y un `SHA256SUMS.txt` para verificación de integridad antes de la extracción.

La licencia es restrictiva: los pesos y la voz del personaje se ceden únicamente para investigación personal, con prohibición explícita de uso comercial y de suplantación de identidad. El modelo no registra descargas ni likes en el momento de la consulta y no publica resultados de benchmarks ni detalles de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-SoVITS v2Pro (motor TTS neuronal; el detalle interno de capas y módulos no se especifica en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo TTS; consume texto de entrada y audio de referencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japones (`ja`) |
| Licencia | `other` (uso personal de investigacion; prohibido el uso comercial y la suplantacion) |
| Formato de pesos | no disponible (el repo distribuye archivos comprimidos con runtime Python, pesos GPT/SoVITS, audio de referencia, ffmpeg y datos de nltk) |
| Variantes de runtime | `cu124` (torch 2.5.1+cu124) y `cu128` (torch 2.7.1+cu128) |
| VRAM minima declarada | 6 GB |
| Driver minimo | 551.61 (`cu124`) y 570.65 (`cu128`) |
| Compute capability soportada | 7.5, 8.0, 8.6, 8.9 (`cu124`) y 12.0 (`cu128`) |
| Pipeline | text-to-speech |
| Libreria | pytorch |
| Tamano del repositorio | 17,8 GB |

## Arquitectura y entrenamiento

La model card identifica el motor como GPT-SoVITS v2Pro, un sistema de síntesis de voz que combina un componente autorregresivo tipo GPT con un modelo SoVITS para la generación de waveform, y que se apoya en audio de referencia para el timbre de la voz. El repositorio fija ("pinned") una versión concreta del motor y publica los pesos GPT y SoVITS específicos de la voz Ayana junto con el audio de referencia necesario para la inferencia.

No se proporciona información sobre el dataset de entrenamiento: no se indica el número de tokens, la composición del corpus, la duración total de audio, ni si hubo etapas de ajuste supervisado, RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales, estrategias de decodificación o detalles de arquitectura más allá del nombre del motor. La ingeniería diferencial del paquete es de empaquetado y reproducibilidad: runtime relocalizable, versiones fijadas de torch y CUDA, checksums SHA256 en `SHA256SUMS.txt` y en `voice-pack.json`, y verificación previa a la extracción por parte de la aplicación Ayana.

## Capacidades

- Síntesis de voz (text-to-speech) en japonés con la voz del personaje Ayana.
- Generación de audio condicionada por audio de referencia incluido en el propio pack.
- Ejecución autocontenida: no requiere Python ni CUDA Toolkit instalados en el sistema anfitrión.
- Despliegue offline en Windows/Linux con GPU NVIDIA, sin dependencia de servicios en la nube (según el formato de distribución del pack).
- Verificación de integridad de las descargas mediante SHA256 en el manifiesto y en el fichero de sumas.
- Integración con la aplicación Ayana mediante el manifiesto `voice-pack.json`.
- No se documentan soporte de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión ni audio de entrada distinto del audio de referencia.
- No se documentan capacidades multilingües: el único idioma declarado es japonés.

## Casos de uso

- Companion de escritorio: el caso de uso objetivo del propio pack. La aplicación Ayana descarga el archivo correspondiente a la GPU del usuario, verifica el SHA256 y extrae el runtime para generar la voz del personaje en conversaciones locales.
- Prototipado de asistentes conversacionales en japonés: al ser un runtime autocontenido con versiones fijadas, permite levantar un pipeline TTS en japonés en una máquina con 6 GB de VRAM sin resolver dependencias de CUDA.
- Localización de contenido audiovisual al japonés: generación de pistas de voz para vídeos, tutoriales o material formativo, con la limitación de que la licencia restringe el uso a investigación personal.
- Investigación en clonación de voz few-shot: el pack incluye audio de referencia y los pesos GPT/SoVITS, lo que permite reproducir experimentos de transferencia de timbre sobre una configuración exacta y verificable por checksum.
- Evaluación comparativa de motores TTS: serviría como baseline reproducible de GPT-SoVITS v2Pro en japonés dentro de un banco de pruebas, siempre que se respete la restricción de no uso comercial.
- Docencia y demos técnicas: instalación en aulas o laboratorios con GPUs RTX 20/30/40 (variante `cu124`) o RTX 50 (variante `cu128`) sin necesidad de configurar entornos Python por alumno.
- Pruebas de integración de pipelines de audio: verificación de ffmpeg, decodificación y post-procesado en un entorno cerrado y con dependencias congeladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM mínima declarada: 6 GB, común a las dos variantes.
- Variante `cu124`: GPUs NVIDIA con compute capability 7.5, 8.0, 8.6 u 8.9 (familias RTX 20, RTX 30 y RTX 40), torch 2.5.1+cu124 y driver mínimo 551.61.
- Variante `cu128`: GPUs NVIDIA con compute capability 12.0 (familia RTX 50), torch 2.7.1+cu128 y driver mínimo 570.65.
- Cabe en GPU de consumo: sí, según el requisito de 6 GB de VRAM y las familias objetivo declaradas (RTX 20/30/40/50).
- Espacio en disco: el repositorio completo ocupa 17,8 GB; hay que prever además el espacio de extracción del archivo correspondiente.
- Opciones de despliegue: runtime Python relocalizable incluido en el pack, con el motor GPT-SoVITS v2Pro fijado, ffmpeg y datos de nltk. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un pipeline TTS de este tipo.
- Latencia y throughput: no disponibles. No se publican métricas de RTF (real-time factor), tiempo a primer byte de audio ni velocidad de inferencia por GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vociepeak/ayana-voice | no disponible | no aplica (TTS) | japones | `other`, solo investigacion personal | HuggingFace, repo de 17,8 GB con runtime empaquetado |
| GPT-SoVITS v2Pro (upstream) | no disponible en la informacion | no aplica (TTS) | no disponible en la informacion | no disponible en la informacion | Proyecto open source citado como motor del pack |
| XTTS-v2 (Coqui) | no disponible en la informacion | no aplica (TTS) | multilingue segun su documentacion publica | CPML (no comercial) | Distribucion publica de pesos |
| StyleTTS2 | no disponible en la informacion | no aplica (TTS) | centrado en ingles segun su documentacion publica | MIT | Repositorio publico |

Nota: los datos de las alternativas no provienen de la información proporcionada en esta ficha y deben verificarse en sus fuentes originales antes de tomar decisiones. La comparación relevante aquí es de formato de entrega: frente a pesos sueltos de la mayoría de proyectos TTS, este pack incluye runtime, motor fijado, ffmpeg, nltk y verificación por checksum, a cambio de una licencia mucho más restrictiva y de un tamaño de repositorio de 17,8 GB.

## Limitaciones y advertencias

- Licencia `other` con restricción explícita: uso personal de investigación únicamente. Prohibido el uso comercial y la suplantación de cualquier persona. Los derechos del personaje y de la voz pertenecen a sus titulares originales.
- Un solo idioma: japonés. No hay soporte declarado de castellano ni de otras lenguas.
- Ausencia total de datos de entrenamiento: se desconoce el corpus, su procedencia y sus posibles sesgos de acento, género, edad o registro.
- Riesgo de uso indebido para deepfakes o suplantación de identidad, especialmente por la combinación de pesos más audio de referencia incluidos en el mismo pack.
- Riesgo de alucinación en el sentido de prosodia incorrecta, lectura errónea de kanji poco frecuentes, nombres propios o cifras, al no publicarse métricas de calidad ni evaluaciones de inteligibilidad.
- Sin benchmarks ni evaluaciones publicadas: no es posible comparar objetivamente la calidad de la voz con alternativas.
- Poca validación externa: 0 descargas y 0 likes en el momento de la consulta; el modelo es reciente y no cuenta con tracción comunitaria verificable.
- Dependencia estricta de hardware y driver: una GPU fuera de las compute capabilities listadas o un driver por debajo de 551.61 / 570.65 impedirá el funcionamiento del pack correspondiente.
- Tamaño de distribución elevado (17,8 GB) y necesidad de verificar checksums antes de extraer; un fallo de integridad invalida el runtime.
- No se documentan mecanismos de filtrado de contenido, marcas de agua de audio ni limitaciones de longitud de texto por petición.
- No apto para despliegue en producción comercial sin autorización expresa de los titulares de derechos.

## Enlaces

- HuggingFace: https://huggingface.co/Vociepeak/ayana-voice
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios de código o demos.
