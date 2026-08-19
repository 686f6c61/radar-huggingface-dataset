# walston/joycent-medium-grl

## Resumen

Joycent es un modelo de síntesis de voz (TTS) basado en difusión, diseñado específicamente para generar habla en mandarín con control de acento sin necesidad de predecir fonemas acentuados. Esta variante concreta, `walston/joycent-medium-grl`, es un modelo acústico entrenado por el usuario walston utilizando embeddings de acento extraídos por el encoder WhisAID (basado en Whisper Medium con gradiente reverso, lambda 0.05). El checkpoint liberado corresponde a la época 100 del entrenamiento.

El modelo resuelve el problema de generar voz con acentos regionales o extranjeros en mandarín de forma controlada, sin requerir anotaciones fonéticas acentuadas en la entrada. Su relevancia radica en que combina la arquitectura Joycent (una variante de Grad-TTS con proceso de difusión) con un encoder de acento preentrenado, lo que permite transferir características acentuales a partir de una referencia de audio. El repositorio tiene un tamaño de 0.2 GB y está publicado bajo licencia MIT, lo que facilita su uso comercial y académico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Joycent / Grad-TTS (modelo acústico de difusión) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en formato PyTorch .pt) |
| Idiomas soportados | mandarin (segun tags, aunque no se especifica en la model card) |
| Licencia | MIT |
| Formato de pesos | PyTorch (checkpoint `.pt`) |

## Arquitectura y entrenamiento

El modelo es un modelo acústico basado en Joycent, que a su vez se apoya en Grad-TTS, una arquitectura de difusión para síntesis de voz. Joycent introduce un enfoque que evita la predicción de fonemas acentuados, utilizando en su lugar embeddings de acento continuos. En esta implementación, los embeddings de acento son extraídos por el encoder `walston/whisaid-medium-grl`, un modelo Whisper Medium con capa de gradiente reverso (GRL) y lambda 0.05, que produce vectores de 256 dimensiones. Estos embeddings se inyectan en el modelo acústico durante el entrenamiento para condicionar la generación de mel-espectrogramas.

El entrenamiento se realizó sobre un conjunto de datos no especificado, pero el checkpoint liberado corresponde a la época 100. No se menciona el uso de RLHF ni DPO; el proceso es un entrenamiento supervisado estándar para TTS acústico. La síntesis completa requiere además un vocoder (proporcionado por `walston/joycent-vocoder`) y la extracción de características de la audio de referencia, tal como se describe en el repositorio Joycent.

## Capacidades

- Síntesis de voz en mandarín con control de acento mediante embeddings de 256 dimensiones extraídos de una referencia de audio.
- Generación de mel-espectrogramas acústicos a partir de texto y un embedding de acento, sin necesidad de anotaciones fonéticas acentuadas.
- Transferencia de acento: el modelo puede replicar el acento de una muestra de referencia (por ejemplo, acento regional o extranjero) en la voz sintetizada.
- Integración con un vocoder externo para producir audio final; el pipeline completo requiere el modelo acústico, el vocoder y el encoder de acento.
- No soporta tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo de síntesis de voz.

## Casos de uso

- Doblaje de contenido audiovisual al mandarín con acentos regionales: el modelo permite generar voces que imitan acentos específicos (p. ej., acento del sur de China o acento extranjero) a partir de una muestra de referencia, lo que resulta útil para localización de series, películas o videojuegos.
- Asistentes de voz personalizados: se puede entrenar o adaptar el modelo para que un asistente virtual hable con un acento determinado, mejorando la cercanía con usuarios de regiones concretas.
- Generación de audiolibros con narradores acentuados: permite producir versiones de libros en mandarín con distintos acentos para audiencias diversas, sin necesidad de grabar a múltiples locutores.
- Síntesis de voz para personajes en animación o videojuegos: los desarrolladores pueden generar diálogos con acentos variados de forma programática, integrando el modelo en un pipeline de generación de contenido.
- Investigación en fonética y sociolingüística: el modelo sirve como herramienta para estudiar la transferencia de acento y la percepción de acentos en mandarín, ya que permite generar estímulos controlados.
- Creación de contenido educativo para aprendizaje de idiomas: se pueden generar ejemplos de pronunciación con acentos específicos para materiales de enseñanza de mandarín como lengua extranjera.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El checkpoint del modelo acústico pesa aproximadamente 0.2 GB, por lo que la carga en memoria es ligera.
- No se especifica VRAM mínima ni GPU recomendada en la documentación. Dado que es un modelo de difusión de tamaño medio, se estima que una GPU con al menos 4-8 GB de VRAM podría ser suficiente para inferencia, pero este dato no está confirmado.
- La inferencia requiere además el vocoder y el encoder de acento, cuyos requisitos de hardware no se detallan.
- Opciones de despliegue: el repositorio Joycent proporciona scripts de inferencia (`inference_joycent.py`) que aceptan el checkpoint como argumento; no se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- La latencia y el throughput dependen del hardware y de la longitud de la síntesis; no se proporcionan cifras concretas.

## Comparativa con modelos similares

No disponible. No se ha proporcionado información sobre modelos comparables en la documentación.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para mandarín; no se garantiza su funcionamiento en otros idiomas.
- La calidad de la síntesis depende del encoder de acento WhisAID y del vocoder; si estos componentes no se utilizan correctamente, el resultado puede degradarse.
- El checkpoint es un modelo acústico intermedio; para obtener audio final es imprescindible el pipeline completo (Joycent + vocoder + extracción de características), lo que añade complejidad de integración.
- No se han publicado evaluaciones formales de sesgos o alucinaciones; al ser un modelo TTS, el riesgo de contenido incorrecto se limita a la pronunciación o entonación, pero no a generación de texto.
- La licencia MIT permite uso comercial, pero los componentes asociados (WhisAID, vocoder) pueden tener sus propias licencias; se recomienda revisarlas antes de desplegar en producción.
- El modelo fue creado en 2026 y no se indica mantenimiento posterior; podría haber problemas de compatibilidad con versiones futuras de las librerías.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/walston/joycent-medium-grl)
- [Paper: Joycent: Diffusion-based Accent TTS without Accented Phone Prediction](https://huggingface.co/papers/2606.16417)
- [Codigo fuente: oshindow/Joycent-code](https://github.com/oshindow/Joycent-code)
- [Encoder de acento: walston/whisaid-medium-grl](https://huggingface.co/walston/whisaid-medium-grl)
- [Vocoder: walston/joycent-vocoder](https://huggingface.co/walston/joycent-vocoder)
