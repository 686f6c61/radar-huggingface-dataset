# yusufblbl/whisper-large-v3-turbo-turkish-verasist

## Resumen

El modelo `yusufblbl/whisper-large-v3-turbo-turkish-verasist` es un ajuste fino de Whisper large-v3-turbo orientado al reconocimiento automatico del habla (ASR) en turco. Lo publica el usuario yusufblbl en Hugging Face como un adaptador LoRA fusionado sobre el checkpoint `selimc/whisper-large-v3-turbo-turkish`, que a su vez deriva del Whisper large-v3-turbo de OpenAI. El objetivo es mejorar la transcripcion de audio en turco sobre el modelo base, presumiblemente mediante un ajuste adicional con el dataset `cubukcum/TurkishVoiceDataset`.

El modelo emplea la arquitectura encoder-decoder transformer caracteristica de Whisper, con aproximadamente 809 millones de parametros en pesos safetensors y un repositorio de 3,3 GB. Esta pensado para tareas de transcripcion y traduccion de voz a texto en turco, y su licencia MIT facilita su integracion en productos comerciales, aunque el acceso esta restringido (gated) y requiere aceptar condiciones en Hugging Face.

Su relevancia radica en la escasez relativa de modelos ASR especializados en turco con licencia permisiva y tamano contenido. Al partir de la variante turbo de Whisper, ofrece un equilibrio entre calidad de transcripcion y coste computacional, lo que lo hace atractivo para despliegues en produccion donde el throughput importa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo) |
| Parametros totales | 808.878.080 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio estandar de Whisper: 30 s por segmento) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; compatible con cuantizacion via transformers/bitsandbytes, no confirmado) |
| Idiomas soportados | Turco (tr) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | selimc/whisper-large-v3-turbo-turkish |
| Dataset de ajuste | cubukcum/TurkishVoiceDataset |
| Metodo de ajuste | LoRA (segun tags) |
| Acceso | Restringido (gated) |
| Descargas | 33 |
| Likes | 0 |

## Arquitectura y entrenamiento

El modelo se basa en Whisper large-v3-turbo, una variante optimizada de Whisper large-v3 en la que se reduce el numero de capas del decoder para disminuir la latencia de inferencia manteniendo la calidad de transcripcion. La arquitectura es un transformer encoder-decoder que procesa espectrogramas Mel de audio como entrada y genera tokens de texto, con capacidad para tareas de transcripcion, traduccion y deteccion de idioma.

Segun los metadatos, el ajuste se realizo mediante LoRA sobre el checkpoint `selimc/whisper-large-v3-turbo-turkish` utilizando el dataset `cubukcum/TurkishVoiceDataset`. No se dispone de informacion detallada sobre el numero de tokens de audio, la composicion exacta del dataset, la duracion del entrenamiento ni si se aplicaron tecnicas adicionales como especificacion de decodificacion o RLHF. Tampoco se documenta si el adaptador LoRA se fusiono con los pesos base o se distribuye por separado; el tamano del repositorio (3,3 GB) y los parametros safetensors sugieren pesos completos fusionados.

## Capacidades

- Reconocimiento automatico del habla (ASR) en turco: transcripcion de audio a texto.
- Traduccion de voz a texto (capacidad heredada de Whisper, aunque el ajuste se centra en turco).
- Deteccion de idioma (capacidad nativa de Whisper, no verificada tras el ajuste).
- Procesamiento de segmentos de audio de hasta 30 segundos por ventana, con posibilidad de chunking para audios mas largos.
- Integracion con el pipeline `automatic-speech-recognition` de transformers.
- Compatibilidad con endpoints de Hugging Face (`endpoints_compatible` en tags).
- No se documenta soporte de tool calling, agentes, vision ni audio mas alla del ASR estandar.

## Casos de uso

- Transcripcion de reuniones y videollamadas en turco: el modelo puede procesar audio segmentado en ventanas de 30 segundos y generar transcripciones con marcas de tiempo, adecuado para actas automaticas en entornos empresariales turcos.
- Subtitulado automatico de contenido audiovisual: integrable en pipelines de postproduccion para generar subtitulos en turco a partir de pistas de audio, con la ventaja de la licencia MIT para uso comercial.
- Atencion al cliente por voz: transcripcion de llamadas entrantes en centros de contacto turcos para analitica, busqueda y cumplimiento normativo, aprovechando el tamano contenido del modelo para despliegue en infraestructura moderada.
- Investigacion en lingüistica computacional: corpus de habla turca para estudios foneticos y lexicos, con la posibilidad de ajustar o evaluar el modelo sobre dominios especificos.
- Accesibilidad: generacion de transcripciones para personas con discapacidad auditiva en contenido en turco, con despliegue local gracias a la licencia permisiva.
- Asistentes de voz y dictado: integracion en aplicaciones de notas de voz o dictado por voz en turco, donde la latencia reducida de la variante turbo es relevante para interaccion en tiempo real.
- Moderacion de contenido audio: transcripcion masiva de audio generado por usuarios para deteccion de contenido inapropiado en plataformas con audiencia turca.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,6-2 GB para los pesos (809 M de parametros), mas overhead de activaciones y buffers de audio; en la practica, 3-4 GB de VRAM suele ser suficiente para lotes pequenos.
- En cuantizacion int8: alrededor de 1 GB de pesos, con VRAM total tipica de 2-3 GB.
- GPU recomendadas: NVIDIA RTX 3060/4060 o superiores para inferencia en tiempo real; A100/H100 para procesamiento por lotes de alto throughput.
- Cabe en GPUs de consumo: si, en practicamente cualquier GPU moderna con al menos 4 GB de VRAM (RTX 3050, GTX 1660, etc.).
- Opciones de despliegue: transformers (pipeline `automatic-speech-recognition`), endpoints de Hugging Face; compatible potencialmente con faster-whisper y whisper.cpp previa conversion de pesos (no confirmado en la informacion proporcionada).
- Latencia y throughput: no disponibles en la informacion proporcionada; la variante turbo de Whisper esta disenada para reducir la latencia frente a large-v3, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | Acceso |
|---|---|---|---|---|---|
| yusufblbl/whisper-large-v3-turbo-turkish-verasist | 808,9 M | 30 s por segmento | Turco | MIT | Gated |
| selimc/whisper-large-v3-turbo-turkish (base) | no disponible | 30 s por segmento | Turco | no disponible | no disponible |
| openai/whisper-large-v3-turbo | 809 M aprox. | 30 s por segmento | Multilingue (99 idiomas) | MIT | Abierto |
| openai/whisper-large-v3 | 1.550 M aprox. | 30 s por segmento | Multilingue (99 idiomas) | MIT | Abierto |

La comparativa se limita a la familia Whisper porque no se dispone de datos de rendimiento de alternativas especificas para turco en la informacion proporcionada. El modelo aqui descrito se diferencia del large-v3-turbo original por el ajuste especifico en turco, a costa de perder cobertura multilingue general.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face, lo que puede complicar la automatizacion de descargas en CI/CD.
- Idiomas: el ajuste esta orientado exclusivamente al turco; el rendimiento en otros idiomas puede degradarse respecto al Whisper original.
- Sin benchmarks publicados: no hay evidencia cuantitativa de la mejora frente al modelo base ni frente a Whisper large-v3-turbo original, por lo que la calidad real del ajuste no esta verificada.
- Riesgo de alucinacion: como todos los modelos Whisper, puede generar texto plausible en silencios o audio ruidoso, especialmente en segmentos de baja calidad.
- Sesgos: no documentados; el dataset de ajuste (`cubukcum/TurkishVoiceDataset`) no tiene composicion publica en la informacion disponible, lo que impide evaluar sesgos dialectales, de genero o de edad.
- Licencia MIT: permite uso comercial, pero el modelo base y el dataset de origen pueden tener condiciones adicionales no reflejadas en los tags.
- Fecha de creacion futura (2026-11-05) en los metadatos: inconsistencia que conviene verificar antes de confiar en la trazabilidad del repositorio.
- Sin garantias de mantenimiento: 33 descargas y 0 likes indican un modelo de nicho con poca validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/yusufblbl/whisper-large-v3-turbo-turkish-verasist
- Modelo base: https://huggingface.co/selimc/whisper-large-v3-turbo-turkish
- Dataset de ajuste: https://huggingface.co/datasets/cubukcum/TurkishVoiceDataset
- Whisper large-v3-turbo (OpenAI): https://huggingface.co/openai/whisper-large-v3-turbo
- Repositorio Whisper (OpenAI): https://github.com/openai/whisper
