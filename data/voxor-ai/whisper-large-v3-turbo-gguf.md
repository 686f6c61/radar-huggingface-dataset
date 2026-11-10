# voxor-ai/whisper-large-v3-turbo-gguf

## Resumen

voxor-ai/whisper-large-v3-turbo-gguf es una conversión al formato GGUF del modelo de reconocimiento automático del habla (ASR) openai/whisper-large-v3-turbo, publicada por el usuario voxor-ai. Se trata, por tanto, de una redistribución de pesos ya entrenados por OpenAI, no de un modelo entrenado desde cero: el aporte del repositorio es exclusivamente el empaquetado en GGUF con cuantización Q8_0 para su uso en runtimes de inferencia local basados en llama.cpp y derivados.

El modelo subyacente pertenece a la familia Whisper, una arquitectura encoder-decoder de tipo transformer diseñada para transcripción y traducción de voz a texto. La variante "turbo" de large-v3 reduce el número de capas del decoder respecto a large-v3, lo que disminuye el coste computacional de la decodificación a cambio de una pérdida mínima de precisión en la mayoría de tareas de transcripción.

La relevancia de esta ficha es acotada: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, el tamaño total es de 0,8 GB y la model card es mínima (una sola línea de descripción). No hay información publicada por el autor sobre idiomas, benchmarks ni detalles de la conversión, por lo que buena parte de los datos técnicos procede del modelo base de OpenAI y se marca como tal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Whisper); variante "turbo" de large-v3 con decoder reducido |
| Parametros totales | 809 M (modelo base openai/whisper-large-v3-turbo); no confirmado en la model card del repositorio GGUF |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventana de audio de 30 segundos por segmento (caracteristica de Whisper); no disponible como contexto de texto |
| Tipos de cuantizacion | Q8_0 (unico fichero publicado: `whisper-large-v3-turbo-Q8_0.gguf`, comprimido con zstd como `.zst`) |
| Idiomas soportados | No disponible en la model card; el modelo base Whisper large-v3-turbo soporta multilingue (99 idiomas segun OpenAI) |
| Licencia | MIT |
| Formato de pesos | GGUF (Q8_0), empaquetado en `.zst` para ficheros de mas de 1 MB |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper: un encoder que procesa espectrogramas mel de audio de 30 segundos y un decoder autorregresivo que genera tokens de texto. La variante large-v3-turbo reduce el decoder a 4 capas (frente a las 32 de large-v3) manteniendo el encoder de 32 capas, lo que rebaja sustancialmente el coste de decodificacion. El modelo base fue entrenado por OpenAI sobre 680.000 horas de audio etiquetado y 5 millones de horas de audio sin etiquetar (dato publicado por OpenAI para la familia Whisper large-v3); el repositorio GGUF no aporta informacion adicional sobre el proceso de entrenamiento.

La unica innovacion atribuible a este repositorio es la conversion a GGUF con cuantizacion Q8_0 y la compresion zstd de los ficheros. No hay indicios de fine-tuning, destilacion ni cambios en los pesos respecto al modelo base. El autor no documenta la herramienta de conversion utilizada ni verifica la equivalencia numerica con los pesos originales.

## Capacidades

- Transcripcion de voz a texto en multilingue (heredada de Whisper large-v3-turbo).
- Traduccion de voz a texto en ingles desde otros idiomas (tarea `translate` de Whisper).
- Deteccion de idioma y marcas de tiempo a nivel de segmento.
- Procesamiento por ventanas de 30 segundos con posible encadenamiento para audio mas largo.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo ASR puro.
- No soporta vision, audio de salida ni modo "thinking".
- Capacidades multilingues: no documentadas en el repositorio; dependen del modelo base.

## Casos de uso

- Transcripcion local de reuniones y entrevistas: el GGUF Q8_0 permite ejecutar el modelo en CPU o GPU consumer con llama.cpp, sin depender de APIs externas ni enviar audio a terceros.
- Subtitulado automatizado de videos: el modelo genera marcas de tiempo por segmento, lo que facilita la produccion de ficheros SRT/VTT en pipelines de postproduccion.
- Procesamiento por lotes de archivos de audio en servidores sin GPU: el formato GGUF y la cuantizacion Q8_0 reducen los requisitos de memoria frente a los pesos originales en safetensors.
- Integracion en aplicaciones de escritorio o moviles con llama.cpp: el tamano de 0,8 GB del repositorio hace viable el despliegue en entornos con recursos limitados.
- Traduccion de contenido hablado a ingles: la tarea `translate` de Whisper permite generar transcripciones en ingles a partir de audio en otros idiomas.
- Prototipado rapido de asistentes de voz: al ser un modelo ASR puro, se combina con un LLM y un motor TTS para construir pipelines de voz sin entrenamiento adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas de WER, comparaciones con el modelo base ni evaluaciones de la cuantizacion Q8_0 frente a los pesos originales.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1 GB para el fichero Q8_0 (0,8 GB de repo comprimido con zstd; el GGUF descomprimido ocupa algo mas). La inferencia en llama.cpp puede ejecutarse en CPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM libre; RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo y solo aportan velocidad.
- Cabe en GPU consumer: si, practicamente en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp (formato nativo), whisper.cpp (si la conversion es compatible), Ollama (previa importacion del GGUF), y bindings de llama.cpp en Python.
- Latencia y throughput: no disponibles. Dependen del hardware y de la duracion del audio; el decoder reducido de la variante turbo reduce el coste de decodificacion frente a large-v3.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| voxor-ai/whisper-large-v3-turbo-gguf | 809 M (base) | 30 s por segmento | GGUF Q8_0 | MIT | Hugging Face, 0 descargas |
| openai/whisper-large-v3-turbo | 809 M | 30 s por segmento | safetensors | MIT | Hugging Face, ampliamente usado |
| openai/whisper-large-v3 | 1.550 M | 30 s por segmento | safetensors | MIT | Hugging Face, referencia de calidad |
| openai/whisper-small | 244 M | 30 s por segmento | safetensors | MIT | Hugging Face, menor precision |

La diferencia principal frente a openai/whisper-large-v3-turbo es el formato: el repositorio de voxor-ai ofrece GGUF Q8_0 para runtimes locales, mientras que el original esta en safetensors para PyTorch/Transformers. No hay datos de rendimiento comparativo publicados por el autor.

## Limitaciones y advertencias

- Repositorio sin traccion: 0 descargas y 0 likes; no hay validacion de la comunidad sobre la calidad de la conversion.
- Model card minima: no se documenta el proceso de conversion, la herramienta usada ni verificaciones de equivalencia con los pesos originales.
- Riesgo de alucinacion: Whisper es conocido por generar texto plausible en silencios o audio ruidoso; la cuantizacion Q8_0 puede alterar marginalmente este comportamiento, sin datos publicados al respecto.
- Sesgos: heredados del entrenamiento de OpenAI (680.000 horas etiquetadas); el autor no documenta evaluaciones de sesgo.
- Limitaciones de idioma: no documentadas en el repositorio; dependen del modelo base.
- Restricciones de licencia: MIT, permite uso comercial, pero el aviso `NOTICE` del repositorio debe revisarse por posibles atribuciones adicionales.
- Ficheros comprimidos con zstd: es necesario descomprimir los `.zst` antes de usar el GGUF.
- Ventana de audio fija de 30 segundos: requiere segmentacion previa para audios largos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/voxor-ai/whisper-large-v3-turbo-gguf
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Repositorio de Whisper en OpenAI: https://github.com/openai/whisper
- llama.cpp: https://github.com/ggml-org/llama.cpp
- whisper.cpp: https://github.com/ggml-org/whisper.cpp
