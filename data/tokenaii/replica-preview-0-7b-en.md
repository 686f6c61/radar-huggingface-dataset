# tokenaii/Replica-Preview-0.7B-EN

## Resumen

Replica Preview 0.7B EN es un modelo de síntesis de voz (text-to-speech) en inglés desarrollado por TokenAI, una startup sin ánimo de lucro fundada en mayo de 2025 por Assem Sabry. El modelo está diseñado para generar habla natural y para la clonación de voz basada en una grabación de referencia, sin un catálogo fijo de hablantes: la identidad vocal se condiciona mediante un audio de referencia de un hablante que haya dado su consentimiento.

La arquitectura combina un modelo autorregresivo T3 con un módulo S3Gen, una aproximación habitual en los sistemas TTS modernos basados en difusión y decodificación de tokens de audio. La model card declara 746.425.718 elementos tensoriales (reportados públicamente como 0,7B), aunque los pesos publicados en safetensors suman 478.862.755 parámetros, una discrepancia que conviene tener en cuenta al planificar el despliegue. La salida de audio se genera a 24 kHz.

El modelo se publica como vista previa (Preview) y su relevancia actual es limitada: no declara licencia, no incluye muestras de audio en el repositorio, no aporta resultados de benchmarks objetivos y no ha establecido una puntuación validada de similitud de hablante. Es, por tanto, un artefacto de investigación temprano más que un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autorregresiva T3 + S3Gen (difusión para decodificación de audio) |
| Parametros totales | 746.425.718 elementos tensoriales según model card; 478.862.755 parámetros en safetensors |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en); multilingüe no declarado |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería chatterbox) |
| Frecuencia de muestreo de salida | 24 kHz |
| Tamano del repositorio | 4,0 GB |
| Identificador de modelo | `replica-preview-0.7b-en` |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

La arquitectura declarada es «autoregressive T3 + S3Gen». T3 es el componente que modela la secuencia de tokens de audio de forma autorregresiva a partir del texto de entrada, mientras que S3Gen actúa como generador/decodificador de la señal de audio, con tags que apuntan a difusión. El condicionamiento de la identidad del hablante se realiza mediante una grabación de referencia (voice cloning zero-shot), no mediante embeddings de hablantes preentrenados ni un catálogo cerrado de voces.

No se han publicado datos sobre el volumen de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni detalles del proceso de alineación. La model card menciona únicamente una validación interna basada en comparaciones de regresión, muestras de estrés de clonación de voz en inglés, mediciones de inferencia en CPU/GPU, comprobaciones de clipping y carga desde directorio limpio. No se especifica la procedencia de los datos de audio ni si se aplicaron filtros de consentimiento más allá de la recomendación de usar referencias de hablantes que hayan dado su consentimiento.

## Capacidades

- Generación de voz en inglés a partir de texto, con salida a 24 kHz.
- Clonación de voz basada en referencia: una grabación limpia de un único hablante (preferiblemente de más de cinco segundos y con poco ruido de fondo) condiciona la identidad vocal generada.
- Generación de habla conversacional natural para enunciados cortos y largos en inglés.
- Generación reproducible mediante parámetros de muestreo configurables (temperatura, top_p, top_k, repetition_penalty).
- Ajuste validado de muestreo: temperature=0.8, top_p=0.95, top_k=1000, repetition_penalty=1.2.
- No se declaran capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada (ASR) ni modo thinking.
- Cobertura multilingüe no declarada: el alcance validado es únicamente inglés.

## Casos de uso

- Locución para contenido editorial en inglés: el modelo puede generar narraciones a partir de texto con una voz de referencia propia, útil para podcasts o audiolibros internos donde se controle la identidad vocal y se disponga de una grabación del locutor autorizada.
- Prototipado de asistentes conversacionales: permite validar la calidad percibida de una voz antes de invertir en un sistema TTS comercial, usando una referencia de cinco segundos o más y los ajustes de muestreo recomendados.
- Doblaje y localización de material ya existente en inglés: con una referencia del hablante original y su consentimiento, se pueden regenerar fragmentos de texto manteniendo un timbre aproximado, aunque la similitud varía con la duración y calidad de la referencia.
- Accesibilidad y lectura de documentos: generación de audio a partir de texto largo en inglés para lectores de pantalla o resúmenes hablados, aprovechando el soporte declarado de enunciados cortos y largos.
- Investigación en clonación de voz: el modelo sirve como línea base para estudiar la variabilidad de la similitud de hablante en función de la duración y calidad de la referencia, un aspecto que la propia model card señala como no validado.
- Pruebas de regresión en pipelines TTS: al permitir generación reproducible con parámetros fijos, puede integrarse en tests automatizados de inteligibilidad y estabilidad de la señal antes de adoptar un modelo mayor.
- Evaluación de latencia en CPU/GPU: la model card reporta mediciones de inferencia en ambos entornos, lo que permite comparar el coste de despliegue frente a alternativas antes de comprometerse con infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la evaluación no estableció una puntuación validada de similitud de hablante y que no se realizan afirmaciones de similitud no respaldadas. Tampoco se aportan métricas objetivas como MOS, WER, SECS ni comparaciones con otros sistemas TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 478.862.755 parámetros en safetensors y pesos en fp32, el modelo ocuparía aproximadamente 1,9 GB solo en pesos; en fp16, alrededor de 1,0 GB. Estas cifras son estimaciones a partir del recuento de parámetros y no están confirmadas por el autor.
- GPU recomendadas: no disponibles. La model card solo indica que el modelo «puede requerir inferencia en GPU para uso en producción de baja latencia», sin especificar modelos concretos.
- ¿Cabe en GPU de consumo? No confirmado. Por tamaño de pesos, un modelo de ~0,5B en fp16 debería caber en GPUs de consumo con 8 GB o más, pero el autor no lo valida.
- Opciones de despliegue: la librería declarada es `chatterbox`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que además están orientados a modelos de lenguaje y no a pipelines TTS de este tipo.
- Latencia y throughput: no disponibles. La model card menciona mediciones de inferencia en CPU/GPU como parte de la validación, pero no publica cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Replica Preview 0.7B EN | TTS + clonación de voz | 478,9M en safetensors (746,4M declarados) | no disponible | inglés | no disponible | Hugging Face |
| Alternativas TTS open source de referencia | TTS + clonación de voz | no disponible | no disponible | varios | no disponible | no disponible |

No se dispone de información suficiente en la documentación proporcionada para establecer una comparativa cuantitativa con alternativas concretas de la misma categoría. La model card no incluye comparaciones con otros sistemas TTS ni métricas que permitan situar el modelo frente a ellos.

## Limitaciones y advertencias

- El alcance validado es únicamente inglés; no se declara soporte multilingüe.
- No se ha verificado la cobertura por género, edad o acento como dimensiones de evaluación etiquetadas.
- La similitud de hablante varía con la calidad y la duración de la referencia; no existe una puntuación validada de similitud.
- La calidad de las pausas, las repeticiones y el comportamiento de alucinación requieren revisión humana adicional o evaluación automatizada validada.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido; debe contactarse con el autor antes de cualquier despliegue en producción.
- Riesgo de suplantación de identidad: el modelo puede generar habla con la voz de una persona a partir de una referencia; la model card prohíbe explícitamente usar el habla generada para suplantar a alguien sin autorización.
- El repositorio no incluye muestras de audio; la evaluación cualitativa debe hacerse contra la página oficial del proyecto.
- Discrepancia entre el recuento de parámetros declarado (746,4M) y el de los safetensors publicados (478,9M); conviene verificar qué pesos componen realmente la ruta de inferencia activa.
- El modelo se publica como vista previa, sin garantías de estabilidad de API ni de soporte a largo plazo.
- No se documentan sesgos conocidos más allá de la falta de verificación por género, edad y acento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tokenaii/Replica-Preview-0.7B-EN
- Página de la familia Replica Preview: https://tokenai.llc/projects/replica-preview
- Página oficial del modelo: https://tokenai.llc/projects/models/replica-preview-0.7b-en
- Web de TokenAI: https://tokenai.llc
- Web del fundador: https://assem.one
- Contacto: info@tokenai.llc
