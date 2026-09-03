# willopcbeta/whisper-ja-760M-ONNX

## Resumen

El modelo `willopcbeta/whisper-ja-760M-ONNX` es una conversión a formato ONNX del modelo `efwkjn/whisper-ja-760M`, un fine-tune de Whisper large-v3-turbo especializado en reconocimiento automático de voz (ASR) para japonés, con especial atención a dominios generales y anime. La conversión fue realizada automáticamente mediante un Space de Hugging Face y está pensada para su uso con la librería Transformers.js, lo que permite ejecutar el modelo directamente en el navegador o en entornos Node.js sin necesidad de infraestructura de servidor dedicada.

El modelo base, desarrollado por efwkjn, parte de Whisper large-v3-turbo (809M parámetros) y aplica una poda de vocabulario que reduce el tamaño a 760M parámetros. Se entrenó únicamente el decoder durante 2^20 pasos con un batch size de 64, utilizando un corpus de 45 000 horas de audio japonés, con una mezcla personalizada de fuentes y aumentación de datos para preservar el rendimiento en secuencias largas y la generación de marcas temporales. El resultado es un modelo competitivo en tareas de ASR en japonés, ligeramente superior a modelos de 1.5B en frases cortas y algo inferior en frases largas, según las afirmaciones del autor.

La relevancia de esta versión ONNX radica en su portabilidad: al estar en formato ONNX y ser compatible con Transformers.js, permite desplegar ASR de alta calidad en japonés en aplicaciones web y móviles sin depender de APIs externas, con la privacidad y el control que ello conlleva. Aunque el repositorio no especifica la licencia, el modelo base es de código abierto, lo que facilita su adopción en proyectos de investigación y desarrollo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer) |
| Parametros totales | 760M (según nombre del modelo; el base large-v3-turbo tiene 809M, la poda de vocabulario reduce el conteo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio (ventana estándar de Whisper) |
| Tipos de cuantizacion | no disponible (el repo contiene pesos ONNX, no se especifican cuantizaciones) |
| Idiomas soportados | Japonés (ja) |
| Licencia | no disponible |
| Formato de pesos | ONNX (compatible con Transformers.js) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Whisper original: un encoder basado en transformer que procesa espectrogramas de Mel de ventanas de 30 segundos, y un decoder autorregresivo que genera el texto transcrito. La innovación principal del modelo base reside en la poda del vocabulario: se eliminan tokens innecesarios del vocabulario original de Whisper, reduciendo el tamaño de las capas de embedding y de salida, lo que explica la diferencia entre los 809M del modelo original y los 760M del fine-tune.

El entrenamiento se realizó exclusivamente sobre el decoder, manteniendo el encoder congelado, durante 2^20 pasos con un batch size de 64. El corpus de entrenamiento suma 45 000 horas, con la mayor contribución de 17 000 horas de reazonspeech-all filtrado, complementado con fuentes como OOPPEENN, Reazon, Common Voice 20 y deepghs. Se aplicó una estrategia de mezcla personalizada y aumentación de datos (incluyendo ruido y variaciones de velocidad) para preservar el rendimiento en audio largo y la precisión de los timestamps. El modelo también fue entrenado para reconocer letras de canciones, aunque esta capacidad no ha sido evaluada formalmente.

La conversión a ONNX se realizó mediante el Space `onnx-community/convert-to-onnx`, que exporta los pesos del modelo base a formato ONNX sin cambios en la arquitectura. Esto permite su ejecución con Transformers.js, que utiliza ONNX Runtime Web para inferencia en el navegador.

## Capacidades

- Reconocimiento automático de voz (ASR) en japonés, con alta precisión en dominios generales y contenido de anime.
- Generación de transcripciones con marcas temporales (timestamps), gracias a la aumentación aplicada durante el entrenamiento.
- Soporte para audio de larga duración mediante la ventana deslizante de 30 segundos de Whisper, con manejo de contexto entre ventanas.
- Capacidad de transcripción de letras de canciones (entrenado, aunque no probado formalmente).
- Ejecución en el navegador o en Node.js mediante Transformers.js, sin necesidad de servidor dedicado.
- Compatible con el pipeline `automatic-speech-recognition` de Transformers.js, que abstrae el preprocesado de audio y la decodificación.

## Casos de uso

- **Subtitulación automática de vídeos en japonés**: el modelo puede transcribir audio de vídeos (anime, podcasts, conferencias) y generar subtítulos con timestamps. Su especialización en dominios generales y anime lo hace especialmente adecuado para contenido de entretenimiento japonés.
- **Asistente de voz en aplicaciones web**: al ejecutarse en el navegador con Transformers.js, permite implementar dictado por voz o comandos de voz en aplicaciones web sin enviar audio a servidores externos, garantizando privacidad y baja latencia.
- **Transcripción de reuniones y entrevistas en japonés**: su capacidad para manejar audio largo y generar timestamps facilita la creación de actas o resúmenes de reuniones grabadas.
- **Análisis de contenido multimedia**: integración en pipelines de procesamiento de audio para indexar y buscar contenido hablado en japonés, por ejemplo en bibliotecas de medios o archivos históricos.
- **Generación de subtítulos para plataformas de streaming**: puede usarse como backend de transcripción para plataformas que necesitan subtítulos automáticos en japonés, con la ventaja de ser un modelo ligero (760M) en comparación con alternativas más grandes.
- **Herramientas de accesibilidad**: transcripción en tiempo real para personas con discapacidad auditiva en entornos educativos o laborales donde se hable japonés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor del modelo base menciona en la model card que los resultados se encuentran en un archivo `BENCH.md` del repositorio original, y afirma que el modelo es competitivo o SOTA en los conjuntos de prueba utilizados (KitsuneX07, TEDxJP, kotoba-tech, Saruwatari-lab, grider-withourai), siendo ligeramente mejor que un modelo de 1.5B en frases cortas y peor en frases largas. Sin embargo, no se proporcionan cifras concretas en la documentación accesible, por lo que no es posible presentar una tabla comparativa verificable.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma oficial. Dado que el modelo tiene 760M parámetros y el repositorio ocupa 7.4 GB (probablemente en FP32 o FP16), se estima que la inferencia en FP32 requiere al menos 3 GB de VRAM, y en FP16 alrededor de 1.5 GB. Sin embargo, el tamaño del repo sugiere que puede incluir múltiples versiones o pesos sin cuantizar.
- **GPU recomendadas**: para inferencia en tiempo real, se recomienda una GPU con al menos 6 GB de VRAM (por ejemplo, RTX 2060 o superior). En CPU, la inferencia es posible pero lenta; se recomienda usar cuantización o un modelo más pequeño si se despliega en hardware limitado.
- **Compatibilidad con GPU de consumo**: sí, cabe en GPUs de consumo como RTX 3060, RTX 4070, etc., siempre que se gestione la memoria.
- **Opciones de despliegue**: al ser ONNX, puede ejecutarse con ONNX Runtime (CPU/GPU), Transformers.js en el navegador, o mediante servidores de inferencia como ONNX Runtime Server. No es compatible directamente con vLLM o TGI, que están orientados a modelos de lenguaje, pero puede integrarse en pipelines personalizados.
- **Latencia y throughput**: no disponibles. Dependen del hardware y de la longitud del audio. En una GPU moderna, la transcripción de un clip de 30 segundos suele tardar menos de 1 segundo, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| `willopcbeta/whisper-ja-760M-ONNX` | 760M | 30 s audio | Japonés | no disponible | ONNX |
| `openai/whisper-large-v3-turbo` | 809M | 30 s audio | Multilingüe (99 idiomas) | MIT | PyTorch, etc. |
| `openai/whisper-small` | 244M | 30 s audio | Multilingüe | MIT | PyTorch, etc. |
| `efwkjn/whisper-ja-760M` | 760M | 30 s audio | Japonés | no disponible | PyTorch |

El modelo ONNX es una conversión directa del fine-tune japonés, por lo que su rendimiento es idéntico al del modelo base. Frente a Whisper large-v3-turbo, ofrece una especialización en japonés con un tamaño ligeramente menor, pero pierde la capacidad multilingüe. Frente a Whisper small, es significativamente más grande y probablemente más preciso en japonés, aunque requiere más recursos. La principal ventaja del formato ONNX es su portabilidad a entornos JavaScript.

## Limitaciones y advertencias

- **Licencia no especificada**: el repositorio no indica la licencia, lo que genera incertidumbre sobre el uso comercial. Se recomienda contactar con el autor o consultar el modelo base original para aclarar los términos.
- **Enfoque exclusivo en japonés**: el modelo no soporta otros idiomas; cualquier intento de transcribir audio en otro idioma producirá resultados incorrectos.
- **Sesgos del corpus de entrenamiento**: al estar entrenado con una mezcla que incluye grandes cantidades de audio de anime y dominios generales, puede tener un rendimiento subóptimo en jerga técnica, dialectos regionales o contextos muy específicos.
- **Riesgo de alucinación**: como todos los modelos ASR, puede generar texto que no corresponde al audio, especialmente en condiciones de ruido o audio de baja calidad.
- **Rendimiento en audio largo**: el autor indica que el modelo es peor en frases largas en comparación con modelos más grandes; para transcripciones de larga duración puede ser necesario un postprocesado adicional.
- **Formato ONNX sin cuantización**: el repositorio no incluye versiones cuantizadas, lo que puede limitar su uso en dispositivos con poca memoria. Se puede cuantizar manualmente con herramientas de ONNX Runtime.

## Enlaces

- Modelo ONNX en Hugging Face: https://huggingface.co/willopcbeta/whisper-ja-760M-ONNX
- Modelo base (efwkjn/whisper-ja-760M): https://huggingface.co/efwkjn/whisper-ja-760M
- Modelo original (openai/whisper-large-v3-turbo): https://huggingface.co/openai/whisper-large-v3-turbo
- Colección de modelos Whisper-ONNX de willopcbeta: https://huggingface.co/collections/willopcbeta/whisper-onnx
- Documentación de Transformers.js para ASR: https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.AutomaticSpeechRecognitionPipeline
