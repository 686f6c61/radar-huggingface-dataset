# trannel/trannel-thai-whisper-ct2

## Resumen

`trannel/trannel-thai-whisper-ct2` es una conversion a formato CTranslate2 del modelo `biodatlab/distill-whisper-th-large-v3`, desarrollado por el Biomedical and Data Lab de la Universidad Mahidol (Tailandia). No se trata de un modelo entrenado desde cero ni de un fine-tuning adicional: el autor de la conversion (trannel) unicamente aplica `ct2-transformers-converter --quantization float16` sobre los pesos originales, sin cambios en los parametros. Su proposito es ofrecer reconocimiento automatico de voz (ASR) en tailandes con un rendimiento de inferencia optimizado para CPU y GPU mediante la libreria `faster-whisper`.

El modelo base es una destilacion de Whisper Large-v3, lo que implica una arquitectura encoder-decoder transformer derivada de Whisper con un numero de parametros reducido respecto al original (el dato exacto de parametros no esta disponible en la informacion proporcionada). El repositorio ocupa 2,2 GB, coherente con una cuantizacion float16 de un modelo destilado de gran tamano. Esta pensado para integrarse en el producto "Translator by Trannel", que lo emplea para transcripcion de voz en tailandes.

Su relevancia actual radica en que combina un modelo especializado en un idioma de bajos recursos como el tailandes con el ecosistema de inferencia eficiente de CTranslate2, lo que facilita su despliegue en produccion sin necesidad de infraestructura de GPU de altas prestaciones. La licencia MIT del modelo original se mantiene en esta conversion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (Whisper destilado, Large-v3) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de Whisper, tipicamente 30 s) |
| Tipos de cuantizacion | float16 (unica incluida en este repo) |
| Idiomas soportados | tailandes (th) |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (CT2), compatible con faster-whisper |

## Arquitectura y entrenamiento

El modelo es una conversion directa del checkpoint `biodatlab/distill-whisper-th-large-v3`, que a su vez es una version destilada de Whisper Large-v3 especializada en tailandes. La arquitectura subyacente es la de Whisper: un encoder que procesa espectrogramas de audio y un decoder autorregresivo que genera tokens de transcripcion. El proceso de destilacion reduce el coste computacional respecto al Large-v3 original, aunque la informacion proporcionada no detalla el numero exacto de parametros resultantes ni la metodologia de destilacion empleada por el equipo de Mahidol.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del corpus, ni si se aplicaron tecnicas de RLHF o DPO (no aplicables habitualmente en ASR). La unica transformacion documentada es la conversion a CTranslate2 con cuantizacion float16, que no altera los pesos mas alla de la precision numerica. No se mencionan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Reconocimiento automatico de voz (ASR) en tailandes: transcripcion de audio a texto.
- Deteccion de idioma limitada al tailandes, segun el campo `language: th` de la model card.
- Inferencia optimizada mediante CTranslate2 y `faster-whisper`, con soporte para ejecucion en CPU y GPU.
- Compatible con el pipeline de transcripcion de faster-whisper (segmentacion, timestamps y decodificacion por lotes).
- No se documentan capacidades de traduccion automatica, tool calling, agentes, vision ni audio mas alla de la transcripcion.
- No se documenta modo "thinking" ni razonamiento multi-paso.

## Casos de uso

- Transcripcion de reuniones en tailandes: el modelo convierte grabaciones de audio en texto con la eficiencia de CTranslate2, adecuado para integrarse en herramientas de actas automaticas.
- Subtitulado de contenido audiovisual: generacion de subtitulos en tailandes para videos, aprovechando los timestamps que produce faster-whisper.
- Atencion al cliente por voz: transcripcion de llamadas en tailandes para su analisis posterior o enrutamiento, con despliegue en CPU gracias a la cuantizacion float16.
- Producto "Translator by Trannel": es el caso de uso declarado por el autor, que emplea el modelo para mejorar la precision del reconocimiento de voz en tailandes dentro de su traductor.
- Investigacion en ASR para idiomas de bajos recursos: punto de partida reproducible (licencia MIT) para experimentos con tailandes.
- Procesamiento por lotes de archivos de audio: la integracion con faster-whisper permite transcribir grandes volumenes de audio en pipelines automatizados.
- Aplicaciones de accesibilidad: dictado y transcripcion en tiempo real en tailandes para usuarios con dificultades de escritura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 2,2 GB en float16, por lo que la inferencia en GPU requiere aproximadamente 2-3 GB de VRAM, dependiendo del tamano de lote y de la longitud del audio (estimacion a partir del tamano del repo; no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; tarjetas consumer como RTX 3060, RTX 4060 o superiores son suficientes. Para mayor throughput, A100 o H100 no son necesarias dado el tamano del modelo.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna con 4 GB o mas.
- Despliegue: CTranslate2 con la libreria `faster-whisper` es la via nativa; tambien puede servirse mediante servidores compatibles con faster-whisper. No se documenta soporte directo en vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| trannel/trannel-thai-whisper-ct2 | no disponible (destilado de Large-v3) | ventana de audio Whisper (no confirmada) | th | MIT | CT2 float16 |
| biodatlab/distill-whisper-th-large-v3 | no disponible | ventana de audio Whisper | th | MIT | safetensors (modelo base) |
| openai/whisper-large-v3 | 1550 M (aprox.) | 30 s de audio | multilingue (99 idiomas) | MIT | safetensors / CT2 / GGUF |

El modelo base de biodatlab es la referencia directa; esta conversion solo cambia el formato y la precision. Frente a Whisper Large-v3 de OpenAI, el modelo destilado esta especializado en tailandes y es mas ligero, pero carece de cobertura multilingue. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Solo soporta tailandes; no es un modelo multilingue ni traduce a otros idiomas.
- Al ser una conversion sin reentrenamiento, hereda todos los sesgos y errores del modelo base de biodatlab.
- Riesgo de alucinacion en segmentos de audio con ruido, silencios o habla no tailandesa, comportamiento tipico de la familia Whisper.
- La cuantizacion float16 puede introducir diferencias numericas minimas frente al modelo original en safetensors.
- No se documentan limitaciones especificas de contexto ni de duracion de audio mas alla de la ventana estandar de Whisper.
- Licencia MIT: permite uso comercial, pero debe conservarse el aviso de copyright de los autores de biodatlab.
- Para produccion, conviene validar la calidad de transcripcion en el dominio concreto (acentos regionales, jerga, audio telefonico) antes de desplegar.
- No hay informacion sobre el rendimiento en GPU de gama baja ni sobre latencia en tiempo real.

## Enlaces

- Hugging Face: https://huggingface.co/trannel/trannel-thai-whisper-ct2
- Modelo base: https://huggingface.co/biodatlab/distill-whisper-th-large-v3
- Libreria faster-whisper: https://github.com/SYSTRAN/faster-whisper
- CTranslate2: https://github.com/OpenNMT/CTranslate2
- Whisper (OpenAI): https://github.com/openai/whisper
