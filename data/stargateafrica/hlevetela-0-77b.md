# StargateAfrica/Hlevetela-0.77B

## Resumen

Hlevetela-0.77B es un modelo de reconocimiento automatico del habla (ASR) desarrollado por StargateAfrica, un ajuste fino (fine-tune) del conocido openai/whisper-medium. El modelo se distribuye a traves de Hugging Face bajo acceso restringido y una licencia propia de caracter investigador y academico (stargate-africa-research-academic-licence). Con aproximadamente 0,77 mil millones de parametros, hereda la arquitectura encoder-decoder transformer de la familia Whisper y esta orientado a tareas de transcripcion de audio a texto.

El modelo parte de la base de Whisper medium, lo que implica un contexto de audio de 30 segundos por segmento procesado y un vocabulario multilingue heredado del modelo original. El ajuste fino por parte de StargateAfrica sugiere una especializacion, presumiblemente orientada a lenguas africanas o a dominios concretos, aunque la informacion publica disponible no detalla la composicion del corpus de entrenamiento ni los idiomas objetivo finales.

La relevancia del modelo radica en su caracter de ajuste especializado sobre una base solida y ampliamente validada como Whisper, con un tamano contenido que permite despliegue en infraestructura moderada. No obstante, la ausencia de benchmarks publicados, la falta de documentacion sobre idiomas soportados y las restricciones de licencia limitan seriamente su evaluacion y su uso en produccion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | ~0,77 mil millones (0.77B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (Whisper procesa segmentos de audio de 30 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | stargate-africa-research-academic-licence (acceso restringido) |
| Formato de pesos | no disponible (repo de 3.8 GB, presumiblemente safetensors/binarios) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Whisper de OpenAI, un transformer encoder-decoder disenado para ASR que procesa espectrogramas Mel de audio en ventanas de 30 segundos y genera transcripciones de forma autorregresiva. Al tratarse de un fine-tune de openai/whisper-medium, conserva la estructura de aproximadamente 0,77 mil millones de parametros del modelo base, incluyendo el encoder de audio y el decoder de texto.

No se dispone de informacion publica sobre el corpus de entrenamiento del ajuste fino: no se especifican el numero de horas de audio, la composicion del dataset, los idiomas cubiertos ni si se aplicaron tecnicas de aumentacion de datos, destilacion o ajuste con RLHF. Tampoco se documentan innovaciones tecnicas adicionales mas alla de las inherentes al modelo Whisper original (multitarea de transcripcion y traduccion, tokens especiales de idioma, timestamps aproximados). La falta de una model card detallada impide verificar la naturaleza exacta de la especializacion.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto), capacidad heredada de Whisper medium.
- Procesamiento de segmentos de audio de hasta 30 segundos por inferencia, con la posibilidad de encadenar segmentos para audios largos.
- Posible soporte multilingue heredado del modelo base, aunque los idiomas efectivamente cubiertos tras el ajuste fino no estan documentados.
- Capacidad potencial de traduccion de voz a texto (speech translation), si el ajuste fino no la ha degradado, si bien no se confirma en la informacion disponible.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso, al tratarse de un modelo ASR.
- No se documentan capacidades de vision, audio generativo ni modo "thinking".

## Casos de uso

- Transcripcion de reuniones y actas: el modelo puede convertir grabaciones de audio en texto para generar actas automaticas, aprovechando la base Whisper para manejar audio conversacional con ruido moderado.
- Subtitulado de contenido audiovisual: integrado en pipelines de postproduccion, permite generar subtitulos a partir de pistas de audio, segmentando el audio en ventanas de 30 segundos.
- Accesibilidad para personas con discapacidad auditiva: transcripcion en tiempo casi real de conferencias o clases grabadas, siempre que la latencia del despliegue lo permita.
- Analisis de llamadas de atencion al cliente: conversion de grabaciones telefonicas a texto para su posterior analisis de sentimiento o cumplimiento, en entornos donde la licencia investigadora lo permita.
- Investigacion linguistica: transcripcion de corpus orales para estudios de linguistica, especialmente si el ajuste fino esta orientado a lenguas africanas, aunque esto no esta confirmado.
- Archivado y busqueda de contenido hablado: indexacion de archivos de audio historicos o periodisticos mediante transcripcion, habilitando busqueda textual sobre el contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~0,77B parametros, en precision FP16 requiere aproximadamente 1,5-2 GB de VRAM; en cuantizacion de 8 bits, en torno a 1 GB; en 4 bits, por debajo de 1 GB (estimaciones teoricas, no verificadas para este modelo concreto).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como RTX 3060, RTX 4060 o superiores; para despliegues de mayor throughput, A10, L4, A100 o H100.
- Cabe en GPU de consumo: si, practicamente cualquier GPU consumer moderna con 4 GB o mas de VRAM.
- Opciones de despliegue: al ser compatible con la arquitectura Whisper, puede servirse con transformers, faster-whisper (CTranslate2), WhisperX, vLLM (con soporte de audio), o convertirse a otros formatos, aunque la conversion no esta documentada para este checkpoint.
- Latencia y throughput estimados: no disponibles; dependen del hardware y del backend, pero al ser un modelo de 0,77B se espera un rendimiento en tiempo real o superior en GPU modernas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Acceso |
|---|---|---|---|---|---|
| Hlevetela-0.77B | ~0,77B | 30 s por segmento | no disponible | stargate-africa-research-academic-licence | Restringido |
| openai/whisper-medium | ~0,77B | 30 s por segmento | ~99 idiomas | MIT | Abierto |
| openai/whisper-small | ~0,24B | 30 s por segmento | ~99 idiomas | MIT | Abierto |
| openai/whisper-large-v3 | ~1,55B | 30 s por segmento | ~99 idiomas | MIT | Abierto |

La comparativa se limita a la familia Whisper por ser la base directa del modelo; no se dispone de datos de rendimiento comparado para Hlevetela-0.77B.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible verificar la calidad del ajuste fino ni compararlo objetivamente con el modelo base.
- Idiomas soportados no documentados: se desconoce si el ajuste fino ha degradado el multilingüismo original de Whisper o si lo ha especializado en un subconjunto.
- Licencia restrictiva: la stargate-africa-research-academic-licence limita el uso a fines de investigacion y academicos; el uso comercial no esta permitido salvo autorizacion expresa, lo que restringe su adopcion en produccion.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que anade friccion a la evaluacion y al despliegue automatizado.
- Riesgo de alucinacion: como todo modelo ASR basado en Whisper, puede generar transcripciones plausibles pero incorrectas en audio con ruido, acentos no representados o silencios prolongados.
- Sesgos potenciales: al desconocerse el corpus de entrenamiento, no se pueden evaluar sesgos de dominio, dialecto o genero.
- Ventana de 30 segundos: la arquitectura Whisper impone segmentacion, lo que puede afectar la coherencia en audios largos si no se gestiona adecuadamente el encadenamiento.
- Documentacion insuficiente: la ausencia de model card detallada dificulta la reproducibilidad y la evaluacion de riesgos en entornos de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StargateAfrica/Hlevetela-0.77B
- Modelo base (openai/whisper-medium): https://huggingface.co/openai/whisper-medium
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper en GitHub: https://github.com/openai/whisper
- Perfil del autor en Hugging Face: https://huggingface.co/StargateAfrica
