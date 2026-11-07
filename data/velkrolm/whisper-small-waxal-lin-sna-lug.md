# VelkroLM/whisper-small-waxal-lin-sna-lug

## Resumen

Whisper Small WAXAL Lin/Sna es un repositorio de Hugging Face creado por el usuario VelkroLM que se presenta como el espacio reservado para un modelo de reconocimiento automatico del habla (ASR) basado en Whisper Small y orientado a dos lenguas africanas: lingala (`lin`) y shona (`sna`). El nombre del repositorio sugiere una vinculacion con WAXAL, el corpus de lenguas africanas utilizado habitualmente para ajuste fino de sistemas ASR en este tipo de proyectos.

El estado actual del repositorio es, sin embargo, el de un contenedor vacio: la propia model card indica de forma explicita que no contiene pesos ni ficheros de tokenizer, por lo que no es cargable como modelo de Transformers. La tarjeta existe unicamente para documentar el artefacto previsto y evitar que el repositorio aparezca sin descripcion. No se ha publicado informacion sobre datos de entrenamiento, resultados de evaluacion, configuracion de decodificacion ni licencia.

Por tanto, esta ficha describe un artefacto no disponible para uso practico. Cualquier dato tecnico que no figure en la informacion proporcionada se marca como no disponible, y no debe asumirse que el modelo pueda descargarse o ejecutarse en su estado actual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper Small (transformer encoder-decoder, segun la denominacion del repositorio) |
| Parametros totales | no disponible (Whisper Small tiene aproximadamente 244 M de parametros en su version original, pero no se confirma en la informacion proporcionada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (Whisper opera sobre ventanas de audio de 30 segundos en su formulacion original, sin confirmacion para este repositorio) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | lingala (`lin`) y shona (`sna`), segun los metadatos del repositorio |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio no contiene pesos ni tokenizer) |

## Arquitectura y entrenamiento

La informacion disponible no permite confirmar la arquitectura mas alla de la referencia a Whisper Small en el nombre del repositorio y en las etiquetas. Whisper es una familia de modelos encoder-decoder basados en transformer, entrenados originalmente por OpenAI sobre audio debilmente supervisado y disenados para transcripcion y traduccion de voz. La variante Small es la tercera de la familia por tamano.

No se ha publicado ningun detalle sobre el proceso de entrenamiento de este artefacto concreto: ni el numero de tokens o horas de audio, ni la composicion del dataset, ni si se aplicaron tecnicas de ajuste fino supervisado, RLHF o DPO. La model card indica que esos datos deberan documentarse antes de una hipotetica publicacion de pesos, lo que confirma que el entrenamiento no esta descrito en el momento actual.

## Capacidades

- No hay capacidades verificables: el repositorio no contiene pesos ni ficheros de procesador, por lo que el modelo no puede cargarse ni ejecutarse.
- La capacidad prevista, segun la model card y las etiquetas, es el reconocimiento automatico del habla en lingala y shona.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico.
- No se documentan modos especiales (thinking mode, vision, audio adicional, diarizacion).
- No se documentan capacidades multilingues mas alla de los dos codigos de idioma declarados.

## Casos de uso

- Ninguno de los casos siguientes puede implementarse con el estado actual del repositorio; se describen como escenarios previstos una vez se publiquen pesos y procesador.
- Transcripcion de reuniones en lingala: un modelo ASR afinado sobre WAXAL podria convertir audio conversacional en texto para actas y busqueda posterior, siempre que se validara su calidad en habla espontanea.
- Subtitulado de contenido audiovisual en shona: integrado en un pipeline de postproduccion, permitiria generar subtitulos automaticos para video divulgativo o educativo.
- Atencion al cliente en centros de contacto: la transcripcion en tiempo real de llamadas en lingala o shona facilitaria el enrutamiento y el analisis de calidad, condicionado a latencias aceptables.
- Archivado y preservacion linguistica: transcripcion de grabaciones de campo para corpus de lenguas minorizadas, con revision humana obligatoria por el riesgo de error.
- Accesibilidad: generacion de transcripciones para personas con discapacidad auditiva en comunidades hablantes de lingala o shona.
- Preprocesado para otros sistemas: conversion de audio a texto como etapa previa a traduccion automatica o analisis de sentimiento, dependiendo de la calidad final del ASR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al no existir pesos publicados.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no verificable.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplicables en el estado actual; Whisper no es un modelo de lenguaje autoregresivo de texto y su despliegue tipico se realiza mediante Transformers, faster-whisper u otros runners especificos de ASR, sin confirmacion para este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Idiomas | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VelkroLM/whisper-small-waxal-lin-sna-lug | lin, sna | no disponible | no disponible | no disponible | Repositorio sin pesos |
| waxal-benchmarking/whisper-small-waxal-lin | lin | no disponible | no disponible | no disponible | Repositorio publicado |
| Whisper Small (original, OpenAI) | multilingue (99 idiomas) | ~244 M (segun documentacion publica de OpenAI) | ventanas de 30 s de audio | MIT (segun documentacion publica de OpenAI) | Pesos publicados |

La comparativa se limita a lo que puede confirmarse con la informacion disponible; no se dispone de datos de rendimiento comparables entre estas variantes.

## Limitaciones y advertencias

- El repositorio no contiene pesos ni tokenizer: no es utilizable en produccion ni en experimentacion.
- No se ha publicado licencia, lo que impide determinar si el uso comercial estaria permitido.
- No hay datos de evaluacion, por lo que se desconoce la tasa de error (WER) esperada en lingala y shona.
- No se documentan sesgos, dominios de entrenamiento ni condiciones acusticas cubiertas.
- El riesgo de alucinacion en ASR (insercion de texto no presente en el audio) no puede evaluarse sin pesos ni resultados.
- La cobertura linguistica se limita a los dos codigos declarados; no hay evidencia de comportamiento en cambio de codigo ni en otras lenguas africanas.
- Cualquier uso previsto debe considerarse provisional hasta que el autor publique pesos, procesador, datos de entrenamiento, evaluacion y licencia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/VelkroLM/whisper-small-waxal-lin-sna-lug
- Listado de modelos del autor: https://huggingface.co/VelkroLM/models
- Repositorio relacionado de referencia (waxal-benchmarking, lingala): https://huggingface.co/waxal-benchmarking/whisper-small-waxal-lin
