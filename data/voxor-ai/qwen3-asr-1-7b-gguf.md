# voxor-ai/qwen3-asr-1.7b-gguf

## Resumen

voxor-ai/qwen3-asr-1.7b-gguf es una conversión a formato GGUF del modelo Qwen/Qwen3-ASR-1.7B, un sistema de reconocimiento automático del habla (ASR) desarrollado por el equipo Qwen de Alibaba. El repositorio lo publica el usuario voxor-ai y su único artefacto es una cuantización Q8_0 del modelo original, empaquetada con compresión zstd. No se trata de un modelo nuevo ni de un fine-tuning: es una redistribución en un formato de inferencia alternativo.

La relevancia de esta ficha es acotada y práctica. El modelo base pertenece a la familia Qwen3 y está orientado a transcripción de audio; la versión GGUF permite ejecutar la inferencia con runtimes como llama.cpp u Ollama en lugar de depender del stack de PyTorch/Transformers. El repositorio ocupa 2,1 GB, coherente con un modelo de 1.700 millones de parámetros cuantizado a 8 bits.

La información publicada por el autor es mínima: la model card se limita a identificar el archivo (`Qwen3-ASR-1.7B-Q8_0.gguf`), indicar que los ficheros de más de 1 MB están comprimidos con zstd y remitir a la licencia Apache 2.0. No hay datos de arquitectura, entrenamiento ni benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base orientado a ASR; arquitectura concreta no publicada en la informacion disponible) |
| Parametros totales | 1.700 millones (según el nombre del modelo base) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (único archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (comprimido con zstd, extensión `.gguf.zst`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Qwen/Qwen3-ASR-1.7B en los datos proporcionados. Por el nombre y la familia a la que pertenece cabe esperar un transformer con un codificador de audio acoplado a un decodificador de texto, pero esto no está confirmado en la información disponible y no debe tomarse como dato verificado.

Tampoco hay detalles sobre el corpus de entrenamiento (número de tokens, composición, horas de audio), sobre si se aplicaron etapas de alineación como RLHF o DPO, ni sobre innovaciones técnicas específicas. La conversión a GGUF no introduce cambios arquitectónicos: reproduce los pesos del modelo original en un formato distinto, con cuantización de 8 bits por bloque.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto), según la designación ASR del modelo base.
- Ejecución en runtimes compatibles con GGUF, lo que permite despliegue sin el stack completo de PyTorch.
- No hay información publicada sobre soporte de tool calling, function calling, agentes o razonamiento multi-paso.
- No hay información publicada sobre capacidades multilingües ni sobre el conjunto de idiomas cubiertos.
- No hay información publicada sobre marcas de tiempo, diarización de hablantes, detección de idioma o traducción de audio.

## Casos de uso

- Transcripción local de reuniones y notas de voz: al estar en GGUF, el modelo puede ejecutarse en una máquina de desarrollo o en un portátil con un runtime de inferencia local, sin enviar audio a servicios externos.
- Subtitulado de contenido audiovisual en pipelines internos: integrado en un script que extrae audio con ffmpeg y lo pasa al modelo para generar texto sincronizable.
- Prototipado rápido de interfaces de voz: permite validar una prueba de concepto de dictado o de comandos por voz antes de invertir en infraestructura de GPU dedicada.
- Procesamiento por lotes de archivos de audio en servidores sin GPU de datacenter: la cuantización Q8_0 reduce los requisitos de memoria frente a los pesos en precisión completa.
- Evaluación comparativa de calidad ASR: sirve para contrastar la salida del modelo base frente a alternativas en un conjunto de audios propio, siempre que se validen los idiomas cubiertos.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 facilita la integración en productos comerciales, sujeta a las obligaciones de atribución correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para Q8_0: en torno a 1,8-2,0 GB solo para los pesos, más el consumo del codificador de audio y del contexto, que no está documentado.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, el modelo debería caber en GPUs de consumo con 6-8 GB de VRAM o más, pero esto no está confirmado por el autor.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño de 1,7B parámetros en Q8_0, aunque la ausencia de datos sobre el codificador de audio impide asegurarlo.
- Opciones de despliegue: runtimes compatibles con GGUF (llama.cpp y derivados). No hay confirmación de soporte en vLLM, TGI u Ollama para esta arquitectura ASR concreta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La model card no documenta sesgos, tasas de error ni comportamiento en acentos o dominios específicos; cualquier uso en producción requiere una evaluación propia.
- Riesgo de alucinación y de transcripciones incorrectas en audio con ruido, solapamiento de hablantes o vocabulario técnico, sin datos publicados que lo cuantifiquen.
- No se especifican los idiomas soportados, por lo que no puede asumirse cobertura del castellano sin verificarlo empíricamente.
- Los ficheros están comprimidos con zstd (`.gguf.zst`) y deben descomprimirse antes de usarse; un pipeline que apunte directamente al archivo fallará.
- El repositorio no tiene descargas ni likes y fue publicado recientemente; no hay evidencia de comunidad ni de mantenimiento continuado.
- Aunque la licencia es Apache 2.0, conviene revisar los ficheros `LICENSE` y `NOTICE` del repositorio y la licencia del modelo base para confirmar las obligaciones de atribución.
- No hay información sobre el soporte de esta arquitectura en herramientas de inferencia concretas; verificar la compatibilidad antes de adoptarla.

## Enlaces

- Repositorio GGUF: https://huggingface.co/voxor-ai/qwen3-asr-1.7b-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
