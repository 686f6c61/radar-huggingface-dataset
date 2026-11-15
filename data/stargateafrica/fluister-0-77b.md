# StargateAfrica/Fluister-0.77B

## Resumen

Fluister-0.77B es un modelo de reconocimiento automatico del habla (ASR) publicado por StargateAfrica en Hugging Face. Se trata de un ajuste fino (fine-tune) del modelo `openai/whisper-medium` de OpenAI, orientado especificamente al idioma afrikaans (`af`). El nombre comercial indica 0,77 mil millones de parametros, coherente con el tamano de la arquitectura Whisper medium, que ronda los 769 millones de parametros.

El modelo resuelve la transcripcion de audio a texto en afrikaans, un idioma de bajos recursos comparado con el ingles, para el que los Whisper originales rinden por debajo de su potencial. Al partir de un checkpoint ya entrenado en 680.000 horas de audio multilingue y especializarlo en un solo idioma, se busca mejorar la precision en acentos, vocabulario local y condiciones acusticas propias de la region.

Es relevante ahora porque los modelos ASR especializados por idioma suponen una via practica para mejorar la calidad en lenguas africanas sin necesidad de entrenar desde cero. La ficha debe leerse con cautela: la informacion publica disponible es minima, no hay resultados de benchmarks publicados y el acceso esta restringido mediante solicitud en Hugging Face, con una licencia propia de tipo academico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper medium, ajuste fino) |
| Parametros totales | 0,77 mil millones (aproximado, segun nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible (pesos en formato original del repo) |
| Idiomas soportados | af (afrikaans) |
| Licencia | stargate-africa-research-academic-licence |
| Formato de pesos | no disponible (repo de 4,6 GB, presumiblemente safetensors/bin) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `openai/whisper-medium`: un transformer encoder-decoder entrenado originalmente por OpenAI sobre 680.000 horas de audio supervisado multilingue, con capacidad para transcribir y traducir voz. Whisper medium dispone de 769 millones de parametros y procesa segmentos de audio de 30 segundos como ventana fija. El ajuste fino realizado por StargateAfrica parte de esos pesos y los especializa en afrikaans.

No se dispone de informacion publica sobre el volumen de datos de ajuste fino, la composicion del corpus, el uso de etiquetas de habla espontanea, ni sobre si se aplicaron tecnicas de regularizacion, data augmentation o especificacion de prompt por idioma. Tampoco hay datos sobre RLHF, DPO o decodificacion especulativa. Toda esta seccion debe considerarse incompleta a la espera de la model card completa, que no esta disponible en la informacion proporcionada.

## Capacidades

- Transcripcion de audio a texto en afrikaans.
- Procesamiento de audio en ventanas de 30 segundos, con posibilidad de segmentacion para audios largos mediante pipelines estandar de Whisper.
- Manejo de audio con ruido moderado y distintos acentos, segun la calidad del ajuste fino (no verificable sin benchmarks).
- No se documenta soporte de traduccion a ingles ni a otros idiomas en esta variante.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje generativo de proposito general).
- Capacidades multilingues limitadas al afrikaans segun la etiqueta del modelo.
- No se documenta vision, audio generativo ni modo thinking.

## Casos de uso

- Transcripcion de reuniones y entrevistas en afrikaans: el modelo convierte grabaciones en texto para actas, resumenes o busqueda posterior. Adecuado por su especializacion en un solo idioma, que suele reducir errores frente al Whisper multilingue original.
- Subtitulado automatico de contenido audiovisual en afrikaans: integrable en pipelines de generacion de subtitulos (SRT/VTT) con segmentacion previa del audio en ventanas de 30 segundos.
- Atencion al cliente en centros de llamadas: transcripcion de conversaciones telefonicas para analitica, control de calidad y deteccion de incidencias en afrikaans.
- Accesibilidad: generacion de transcripciones para personas con discapacidad auditiva en medios y eventos en afrikaans.
- Investigacion linguistica y corpus: creacion de transcripciones para estudios de afrikaans hablado, con la advertencia de que la licencia es academica y restringe el uso comercial.
- Digitalizacion de archivos orales: transcripcion de entrevistas, archivos de radio o patrimonio oral en afrikaans para su indexacion y preservacion.
- Evaluacion comparativa de ASR: uso como referencia en estudios academicos sobre calidad de ASR en lenguas de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de WER (word error rate), CER, MMLU ni de comparaciones con otros modelos ASR en afrikaans.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): en torno a 3 GB solo para pesos; con activaciones y buffers, aproximadamente 4-6 GB.
- En fp16/bf16: aproximadamente 1,6-2 GB de pesos; con overhead, 3-4 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060, RTX 4060, RTX 4090, A10, L4). Para fp32, 12 GB o mas (RTX 3060 12 GB, A100, H100).
- Cabe en GPU de consumo: si, en la mayoria de RTX modernas con 8 GB o mas.
- Opciones de despliegue: `transformers` con pipeline `automatic-speech-recognition`, `faster-whisper` (CTranslate2), `whisper.cpp`, `vLLM` no aplica de forma nativa a Whisper, `TGI` no soporta Whisper de forma estandar.
- Latencia y throughput: no disponibles. Como referencia generica de Whisper medium, el coste es moderado en GPU y notable en CPU; no se aportan cifras verificadas para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/audio | Idiomas | Licencia | Acceso |
|---|---|---|---|---|---|
| StargateAfrica/Fluister-0.77B | 0,77 B | ventanas de 30 s | af | research/academic | gated |
| openai/whisper-medium | 0,769 B | ventanas de 30 s | multilingue | MIT | abierto |
| openai/whisper-small | 0,244 B | ventanas de 30 s | multilingue | MIT | abierto |
| openai/whisper-large-v3 | 1,55 B | ventanas de 30 s | multilingue | MIT | abierto |

La comparativa se limita a los modelos base y variantes de Whisper por falta de datos publicos de otros ASR especializados en afrikaans. No hay datos de rendimiento comparado disponibles.

## Limitaciones y advertencias

- Licencia `stargate-africa-research-academic-licence`: restringe el uso comercial; es imprescindible revisar los terminos completos antes de cualquier despliegue en produccion.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face; no es descargable de forma anonima.
- Solo afrikaans: no debe usarse para otros idiomas sin validacion previa.
- Riesgo de alucinacion en audio con ruido, silencios largos o habla solapada, comportamiento comun en modelos Whisper.
- Ventana fija de 30 segundos: requiere segmentacion para audios largos y puede perder contexto entre segmentos.
- Sin benchmarks publicados: no se puede verificar la mejora real frente a `whisper-medium` original.
- Sin informacion sobre sesgos: no se documentan sesgos de genero, acento o dialecto.
- Modelo con 0 descargas y 1 like en el momento de la consulta: ecosistema minimo, sin garantias de mantenimiento.
- Fecha de creacion y actualizacion futuras (2026): verificar que los pesos corresponden a la version esperada.

## Enlaces

- Hugging Face: https://huggingface.co/StargateAfrica/Fluister-0.77B
- Modelo base: https://huggingface.co/openai/whisper-medium
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper en OpenAI: https://github.com/openai/whisper
- faster-whisper (CTranslate2): https://github.com/SYSTRAN/faster-whisper
- whisper.cpp: https://github.com/ggerganov/whisper.cpp
