# Supernova11c/Supernova-TeraiTTS

## Resumen

Supernova TeraiTTS es un proyecto de texto a voz (TTS) para nepalí publicado en HuggingFace por el usuario Supernova11c. No se trata de un modelo con pesos propios entrenados desde cero: el repositorio es, segun su propia model card, una libreria de Python (`supernova-teraitts`) que envuelve el modelo `Oshara/xtts-v2-nepali` y descarga sus pesos en tiempo de ejecucion. La arquitectura subyacente es Coqui XTTS v2, un modelo TTS multilingue con capacidad de clonacion de voz a partir de un audio de referencia.

El interes del proyecto es de nicho: ofrece una API Python simplificada (`tts.generate(...)`) para generar locuciones en nepalí con una voz de referencia en formato WAV y salida a 24 kHz. El autor lo describe como un lanzamiento temprano, con pruebas y evaluacion aun en curso, y con cero descargas y cero likes en el momento de la ficha, lo que lo situa como un artefacto experimental mas que como una dependencia lista para produccion.

Es relevante principalmente para quien necesite un punto de entrada rapido a TTS en nepalí sin montar el pipeline de XTTS v2 directamente, pero conviene tener claro que el merito tecnico del modelo corresponde al fine-tune upstream de Oshara, no a este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coqui XTTS v2 (modelo base `Oshara/xtts-v2-nepali`, fine-tune de XTTS v2) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | nepalí (ne) |
| Licencia | `other`, con nombre `supernova-horizon` y enlace a fichero `LICENSE` en el repositorio; la model card advierte de que hay que revisar la licencia del modelo upstream antes de redistribuir pesos |
| Formato de pesos | no disponible; el repositorio no contiene pesos propios y descarga el modelo upstream en tiempo de ejecucion |
| Tarea | text-to-speech |
| Frecuencia de muestreo de salida | 24 kHz |
| Entrada | texto + audio de referencia (`speaker_wav`) para clonacion de voz |
| Distribucion | paquete Python `supernova-teraitts` (instalacion via `pip install supernova-teraitts`) |
| Descargas / likes en HuggingFace | 0 / 0 |
| Fecha de creacion | 2026-10-27 |
| Ultima actualizacion | 2026-10-27 |
| Mantenedor | Supernova11c |

## Arquitectura y entrenamiento

La arquitectura es la de Coqui XTTS v2, heredada del checkpoint `Oshara/xtts-v2-nepali`, que a su vez es un fine-tune de XTTS v2 para nepalí. XTTS v2 es un modelo TTS de tipo autoregresivo con clonacion de voz zero-shot: recibe texto y un fragmento de audio de referencia del hablante y genera waveform a 24 kHz. Este repositorio no aporta entrenamiento propio ni pesos nuevos; tal como indica la model card, «This repository does not claim the upstream weights as independently trained Supernova weights».

Por tanto, no hay informacion disponible sobre volumen de datos de entrenamiento, composicion del corpus, numero de tokens, ni sobre si el fine-tune upstream uso RLHF, DPO u otro esquema de alineacion. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.) mas alla de la envoltura de libreria. La model card menciona que la voz usada es la original del fundador de Supernova11c, un detalle relevante para derechos de imagen y voz pero no acompanado de documentacion sobre consentimiento o procedencia de las grabaciones.

## Capacidades

- Generacion de voz a partir de texto en nepalí, con salida de audio a 24 kHz.
- Clonacion de voz mediante audio de referencia en WAV (`speaker_wav`), con la limitacion de que solo deben usarse grabaciones sobre las que se tenga permiso.
- API Python de alto nivel: una unica llamada `tts.generate(texto, speaker_wav, output_path)` devuelve un objeto de audio reproducible.
- Escritura directa a fichero WAV mediante el parametro `output_path`.
- Instalacion y despliegue como paquete pip, sin necesidad de clonar repositorios de investigacion.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio de entrada distinto de la referencia de voz ni modos de «thinking».

## Casos de uso

- Generacion de locuciones en nepalí para prototipos de asistentes de voz: la API de una sola llamada permite producir audios de prueba en minutos, util para validar producto antes de invertir en un pipeline TTS propio.
- Doblaje o narracion de contenido divulgativo para audiencias nepaloparlantes: el modelo acepta texto y una referencia de voz, de modo que se puede mantener un timbre consistente entre fragmentos usando el mismo WAV de referencia.
- Accesibilidad en aplicaciones educativas: conversion de materiales de lectura en nepalí a audio para usuarios con discapacidad visual, siempre que se valide la calidad de pronunciacion de vocabulario tecnico.
- Evaluacion comparativa de TTS para nepalí: al ser una envoltura fina sobre `Oshara/xtts-v2-nepali`, sirve como linea base rapida frente a otros sistemas antes de decidir una integracion a fondo.
- Investigacion en clonacion de voz de bajos recursos: permite experimentar con referencia de hablante en un idioma con poca cobertura comercial, con la cautela etica correspondiente.
- Pruebas de integracion en flujos de preproduccion de video o podcast: generacion de borradores de voz en off para guiones en nepalí antes de grabar con locutor humano.
- Docencia y demos de TTS: ejemplo minimo de uso de XTTS v2 en Python sin gestionar manualmente la descarga de checkpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (MOS, WER, similitud de hablante, latencia) ni comparaciones cuantitativas con otros sistemas TTS en nepalí.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. La model card solo senala que la calidad puede variar segun la longitud del texto, la pronunciacion, la calidad del audio de referencia y el hardware.
- GPU recomendadas: no disponible. No se documentan requisitos minimos ni modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no disponible; sin datos verificados no es posible confirmar si cabe en tarjetas de gama media o baja.
- Opciones de despliegue: la via documentada es el paquete pip `supernova-teraitts` con descarga del checkpoint upstream en tiempo de ejecucion. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican de forma directa a un modelo TTS de este tipo.
- Latencia y throughput: no disponible. No hay cifras de tiempo real factor (RTF), tokens por segundo ni audio generado por segundo.
- Almacenamiento: no disponible el tamano exacto del checkpoint descargado; conviene reservar espacio para los pesos del modelo upstream, que se bajan en el primer uso.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma principal | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Supernova TeraiTTS (este repositorio) | Envoltura Python sobre Coqui XTTS v2 | Nepalí | Texto + WAV de referencia, salida 24 kHz | `supernova-horizon` (other), con caveat sobre la licencia upstream | HuggingFace + pip, 0 descargas |
| Oshara/xtts-v2-nepali | Coqui XTTS v2 fine-tune | Nepalí | Texto + WAV de referencia | No disponible en la informacion proporcionada | HuggingFace (modelo upstream) |
| Coqui XTTS v2 (base) | TTS autoregresivo multilingue con clonacion | Multilingue, con nepalí no confirmado en esta ficha | Texto + WAV de referencia | No disponible en la informacion proporcionada | Peso comunitario ampliamente distribuido |

No se dispone de datos de rendimiento comparado (MOS, similitud de hablante, WER) que permitan establecer una jerarquia objetiva entre estas opciones.

## Limitaciones y advertencias

- El repositorio no contiene pesos entrenados por Supernova11c; es una libreria que descarga el modelo de Oshara en tiempo de ejecucion. Cualquier evaluacion de calidad debe atribuirse al checkpoint upstream.
- Licencia `supernova-horizon` con fichero `LICENSE` referenciado, pero la propia model card exige revisar la licencia del modelo upstream antes de redistribuir pesos. Verificar ambas antes de cualquier uso comercial.
- Solo se declara soporte de nepalí; no hay evidencia de calidad en otros idiomas ni de codigo mezclado nepalí-ingles, frecuente en contextos reales.
- Riesgo de alucinacion acustica y errores de pronunciacion: la model card admite que la calidad varia con la longitud del texto, la pronunciacion, la calidad del audio de referencia y el hardware.
- No hay resultados de benchmarks ni evaluacion subjetiva publicada; el estado declarado es «early release» con pruebas en curso.
- Riesgo de uso indebido de clonacion de voz: el modelo acepta cualquier WAV de referencia. La model card solo pide usar grabaciones con permiso, sin mecanismo tecnico de control.
- Falta de documentacion sobre la procedencia y el consentimiento de la voz del fundador usada como referencia.
- Sin datos de latencia, VRAM ni throughput, lo que impide planificar capacidad de produccion.
- Cero descargas y cero likes: sin senales de adopcion ni de mantenimiento a largo plazo.
- No se documentan filtros de contenido, gestion de entradas largas ni comportamiento con texto no nepalí.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Supernova11c/Supernova-TeraiTTS
- Modelo upstream: https://huggingface.co/Oshara/xtts-v2-nepali
- Paquete Python: `pip install supernova-teraitts` (no se ha localizado repositorio publico del codigo en la informacion disponible)
- Paper, blog o demo oficiales: no disponibles en la informacion proporcionada
- Busqueda web: no se han encontrado enlaces tecnicos relevantes; los resultados devueltos no guardan relacion con el modelo y se han descartado.
