# voxor-ai/whisper-medium-gguf

## Resumen

voxor-ai/whisper-medium-gguf es una conversión al formato GGUF del modelo de reconocimiento automático de voz (ASR) openai/whisper-medium, empaquetada en cuantización Q8_0. El modelo original, desarrollado por OpenAI, es un transformer encoder-decoder entrenado para transcripción y traducción de voz a texto en múltiples idiomas, con aproximadamente 769 millones de parámetros. Esta versión no introduce cambios en los pesos ni en el entrenamiento: es una redistribución del checkpoint original en un formato optimizado para inferencia con llama.cpp y derivados.

La relevancia de esta ficha es acotada: el repositorio tiene cero descargas y cero likes en el momento de la consulta, el pipeline no está declarado y la model card es mínima (una sola frase más metadatos). El valor práctico reside en que el formato GGUF permite ejecutar Whisper medium en CPU o GPU de consumo sin depender del stack de PyTorch, lo que facilita su integración en herramientas como whisper.cpp, Ollama o llama.cpp.

Conviene señalar una advertencia operativa importante: los ficheros de más de 1 MB están comprimidos con zstd (extensión `.zst`) y deben descomprimirse antes de su uso. El tamaño total del repositorio es de 0,8 GB, coherente con un Whisper medium cuantizado a 8 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (arquitectura Whisper de OpenAI) |
| Parametros totales | ~769 millones (heredados de openai/whisper-medium; no confirmado en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (Whisper opera sobre ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | Q8_0 (unico fichero publicado: `whisper-medium-Q8_0.gguf`) |
| Idiomas soportados | no disponible en la model card (el modelo base Whisper es multilingue) |
| Licencia | MIT |
| Formato de pesos | GGUF, comprimido con zstd (`.gguf.zst`) |

## Arquitectura y entrenamiento

La model card de este repositorio no aporta informacion sobre arquitectura ni entrenamiento. Lo que se sabe proviene del modelo base openai/whisper-medium: se trata de un transformer encoder-decoder con atencion estandar, entrenado por OpenAI sobre audio y texto emparejados para tareas de transcripcion y traduccion de voz. Whisper procesa el audio como espectrogramas Mel en ventanas de 30 segundos y genera la transcripcion de forma autorregresiva.

Esta publicacion concreta no documenta numero de tokens de entrenamiento, composicion del dataset, ni si hubo ajuste con RLHF o DPO. Tampoco describe ninguna innovacion tecnica propia: es una conversion de formato y cuantizacion, no un reentrenamiento. El unico detalle tecnico declarado es la cuantizacion Q8_0 y la compresion zstd de los ficheros.

## Capacidades

- Reconocimiento automatico de voz (ASR): transcripcion de audio a texto, heredada del modelo base Whisper medium.
- Traduccion de voz a texto: el modelo base Whisper soporta traduccion al ingles desde otros idiomas; la model card no lo detalla para esta conversion.
- Capacidades multilingues: el modelo base es multilingue, pero la model card no enumera idiomas concretos.
- Ejecucion en formato GGUF: compatible con runtimes de inferencia basados en llama.cpp, lo que permite despliegue sin PyTorch.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio de entrada mas alla del ASR, ni modos de razonamiento extendido.

## Casos de uso

- Transcripcion local de reuniones: el formato GGUF Q8_0 permite ejecutar el modelo en un portatil o estacion de trabajo sin GPU dedicada, transcribiendo audio grabado sin enviar datos a servicios externos.
- Subtitulado de video en pipelines offline: integrable en scripts que procesan lotes de ficheros de audio y generan ficheros de subtitulos, aprovechando la independencia de PyTorch del runtime GGUF.
- Prototipado rapido de aplicaciones de voz: util para validar una funcionalidad de dictado o transcripcion antes de invertir en infraestructura de inferencia mayor.
- Procesamiento en entornos con restricciones de red: al ser un modelo local y de licencia MIT, encaja en despliegues air-gapped donde no se permite llamar a APIs de terceros.
- Investigacion y evaluacion de cuantizacion: sirve para medir la degradacion de calidad de Whisper medium al pasar a Q8_0 frente al checkpoint original en fp16/fp32.
- Integracion en herramientas de escritorio basadas en llama.cpp: por ejemplo, asistentes de notas que transcriben audio en segundo plano en equipos de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 0,8 GB en Q8_0; la inferencia requiere ademas memoria para el estado del encoder-decoder y los buffers de audio, por lo que conviene prever un margen adicional sobre el tamano del fichero.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, un modelo de ~769 M de parametros en 8 bits es viable en GPUs de consumo, pero no hay datos oficiales de rendimiento en este repositorio.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano, aunque no se aportan mediciones concretas.
- Opciones de despliegue: llama.cpp y derivados compatibles con GGUF (whisper.cpp, Ollama, entre otros). Requiere descomprimir los ficheros `.zst` antes de cargarlos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| voxor-ai/whisper-medium-gguf | ~769 M (heredado) | no disponible | GGUF Q8_0 | MIT | Hugging Face, 0 descargas |
| openai/whisper-medium | ~769 M | ventanas de 30 s de audio | PyTorch (safetensors/bin) | MIT | Hugging Face, modelo base oficial |
| openai/whisper-small | ~244 M | ventanas de 30 s de audio | PyTorch | MIT | Hugging Face, modelo oficial |
| openai/whisper-large-v3 | ~1550 M | ventanas de 30 s de audio | PyTorch | MIT | Hugging Face, modelo oficial |

La comparativa se limita a la familia Whisper porque la informacion proporcionada no incluye otros modelos ASR. La diferencia principal de esta publicacion frente al checkpoint oficial es el formato GGUF Q8_0 y la compresion zstd; en calidad y capacidades deberia comportarse como el modelo base, con la posible perdida menor asociada a la cuantizacion de 8 bits, no medida en este repositorio.

## Limitaciones y advertencias

- Model card minima: no se documentan idiomas, contexto, rendimiento ni procedimiento de conversion, lo que dificulta la reproducibilidad.
- Repositorio sin traccion: cero descargas y cero likes, sin evidencia de uso o validacion por parte de la comunidad.
- Ficheros comprimidos: los ficheros de mas de 1 MB estan en `.zst` y deben descomprimirse; un uso directo sin descompresion fallara.
- Riesgo de alucinacion: como todo modelo ASR, puede generar texto plausible en segmentos de audio ruidosos o silenciosos; no se aportan evaluaciones de tasa de error (WER).
- Sesgos: no documentados; el modelo base Whisper presenta sesgos conocidos en funcion del acento, el idioma y la calidad del audio, pero esta conversion no los evalua.
- Licencia MIT: permite uso comercial, pero debe conservarse el aviso de licencia y el fichero NOTICE incluidos en el repositorio.
- Sin garantias de mantenimiento: no hay informacion sobre actualizaciones, issues abiertos ni soporte del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/voxor-ai/whisper-medium-gguf
- Modelo base: https://huggingface.co/openai/whisper-medium
