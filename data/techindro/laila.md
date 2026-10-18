# techindro/Laila

## Resumen

Laila es un adaptador LoRA sobre Whisper-Small desarrollado por el usuario techindro, orientado al reconocimiento automático de voz (ASR) de hindi, inglés con acento indio y habla con alternancia de lenguas hindi-inglés (hinglish). El modelo mantiene congelados los 244 M de parámetros del encoder-decoder Transformer de Whisper-Small y entrena únicamente 3,5 M de parámetros (aproximadamente el 1,5 % del total) en las proyecciones de atención `q_proj` y `v_proj`. El resultado es un fichero de adaptador de pocos megabytes que, según el autor, se entrena en una única GPU T4 de 16 GB de una capa gratuita.

El problema que aborda es concreto: los modelos ASR globales están entrenados mayoritariamente con inglés occidental (Whisper se entrenó con 680 000 horas, según la model card), lo que provoca más errores en fonética, ritmo y acentuación del inglés indio, y fallos sistemáticos cuando el hablante mezcla hindi y inglés en la misma frase. La propuesta es una adaptación parametro-eficiente con una convención de transcripción explícita (devanagari para hindi, alfabeto latino para inglés) y aumento de ruido durante el entrenamiento.

La relevancia del proyecto es, hoy, la de una propuesta metodológica más que la de un modelo listo para producción: la model card no publica cifras de WER (aparecen como "TBD"), el repositorio no tiene descargas ni valoraciones en HuggingFace y la información técnica disponible es parcial. Se desconoce el dataset de entrenamiento, el número de pasos y los resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper-Small) con adaptadores LoRA en las capas de atencion `q_proj` y `v_proj` |
| Parametros totales | 244 M en los pesos base (congelados) mas 3,5 M entrenables (LoRA) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 30 segundos de audio por fragmento (ventana de Whisper, segun la model card); contexto de texto no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Hindi (transcripcion en devanagari), ingles con acento indio, hinglish (code-switched). El autor anuncia una suite de 22 idiomas indios como "coming soon" |
| Licencia | no disponible en los metadatos de HuggingFace; la model card muestra una insignia MIT asociada al repositorio de GitHub |
| Formato de pesos | no disponible (se describe como adaptador LoRA/PEFT de pocos MB, con los pesos base de Whisper-Small congelados) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper-Small: un Transformer encoder-decoder de 244 M de parámetros que procesa audio en ventanas de 30 segundos y genera la transcripción de forma autorregresiva. Sobre ese backbone congelado se insertan adaptadores LoRA de bajo rango en las proyecciones de query y value de la atención, lo que da 3,5 M de parámetros entrenables. El pipeline descrito consta de cinco etapas: preprocesado de audio (remuestreo, conversión a mono, normalización y troceado en fragmentos de 30 s), el encoder-decoder de Whisper congelado, los adaptadores LoRA, aumento de ruido con mezcla de ruido de fondo real a relaciones señal-ruido aleatorias (solo en entrenamiento) y una convención de transcripción que fija devanagari para hindi y latino para inglés.

El dato más relevante desde el punto de vista de ingeniería es el coste: el autor afirma que el entrenamiento cabe en una T4 de 16 GB y que el adaptador resultante es aproximadamente 70 veces más pequeño que una copia completa del modelo, lo que permite mantener un adaptador por variante lingüística en lugar de un modelo completo por idioma. No se especifican en la información disponible el volumen de datos de entrenamiento, la composición del corpus, el número de tokens o horas de audio, la duración del entrenamiento, ni si se aplicaron técnicas de alineación como RLHF o DPO (no aplicables habitualmente en ASR). Tampoco se documentan innovaciones de decodificación (decodificación especulativa, atención lineal) ni detalles del esquema de aumento de ruido.

## Capacidades

- Transcripción de voz a texto en hindi con salida en escritura devanagari.
- Transcripción de inglés con acento indio.
- Transcripción de habla con alternancia de lenguas hindi-inglés (hinglish) dentro de la misma frase, capacidad que la model card atribuye al adaptador y niega al Whisper-Small zero-shot.
- Procesamiento de audio en fragmentos de hasta 30 segundos, con preprocesado integrado (remuestreo, mono, normalización).
- Robustez frente a ruido de fondo gracias al aumento con ruido real a distintas SNR durante el entrenamiento (la evaluación de esta robustez no está publicada).
- Evaluación con convención de transcripción normalizada, pensada para hacer comparables los resultados entre sistemas con distintos alfabetos.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión ni audio-audio. Es exclusivamente un modelo ASR.
- El autor anuncia una extensión a 22 idiomas indios mediante un adaptador por idioma, marcada como "coming soon" y sin artefactos publicados.

## Casos de uso

- Subtitulado de contenido audiovisual indio: el adaptador transcribe hindi y bloques de inglés insertados en la misma intervención, un escenario frecuente en tertulias, entrevistas y vídeos de YouTube donde la transcripción monolingüe falla.
- Atención al cliente por voz en el mercado indio: integrado detrás de un motor de diálogo, permite convertir en texto las llamadas de usuarios que alternan hindi e inglés, con un coste de almacenamiento reducido al poder desplegar el adaptador junto a un único Whisper-Small compartido.
- Transcripción de reuniones técnicas distribuidas: equipos en India que mezclan terminología técnica en inglés con hindi coloquial pueden obtener actas en una convención de escritura fija (devanagari y latino) definida de antemano.
- Generación de corpus y anotación asistida para investigación lingüística: el adaptador sirve como preanotador de audio code-switched, con revisión humana posterior, en estudios de fonética o de alternancia de lenguas.
- Dictado de notas clínicas o de campo: escenarios con ruido de fondo donde el aumento de ruido del entrenamiento busca reducir el impacto ambiental, aunque la falta de métricas publicadas obliga a validar con datos propios antes de cualquier uso real.
- Despliegue en infraestructura limitada: al mantener congelados los 244 M de pesos y publicar solo unos pocos MB de adaptador, es viable servir varias variantes lingüísticas sobre una misma GPU modesta o incluso en espacios gratuitos de HuggingFace, como demuestran las demos del autor.
- Experimentación académica en PEFT aplicado a ASR: sirve como referencia reproducible de bajo coste para comparar LoRA frente a fine-tuning completo en lenguas de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye una tabla de resultados clave en la que las métricas de WER para hindi, inglés indio y habla code-switched figuran explícitamente como "TBD". Las únicas cifras verificables son de eficiencia, no de calidad:

| Metrica | Laila | Whisper-Small zero-shot |
|---|---|---|
| Parametros entrenables | 3,5 M | 244 M (fine-tuning completo) |
| Tamano del adaptador | pocos MB (aprox. 70x menor) | 244 M (modelo completo) |
| Hardware de entrenamiento | 1x T4 (16 GB) | 1x T4 (16 GB) |
| WER hindi | TBD | TBD |
| WER ingles indio | TBD | TBD |
| WER code-switched | TBD | TBD |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Por el tamano del backbone (244 M de parametros), una estimacion razonable en fp16 con los adaptadores cargados es del orden de 1-3 GB incluyendo activaciones y buffers de audio, pero es una estimacion, no un dato publicado.
- GPU recomendadas: el autor solo documenta una T4 de 16 GB para entrenamiento. Para inferencia, cualquier GPU consumer con 4 GB o mas de VRAM deberia ser suficiente a nivel de memoria, si bien no hay cifras de latencia ni de throughput publicadas.
- Cabe en GPU consumer: si, previsiblemente en tarjetas tipo RTX 3060, RTX 4060, RTX 4090 o equivalentes; tambien en CPU para lotes pequenos, aunque sin datos de rendimiento.
- Opciones de despliegue: Transformers junto con PEFT (necesario para cargar el adaptador LoRA); las demos oficiales corren en HuggingFace Spaces. Para whisper.cpp o llama.cpp habria que fusionar previamente el adaptador con los pesos base, operacion que no esta documentada en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Laila | 244 M base + 3,5 M LoRA | 30 s por fragmento | Hindi, ingles indio, hinglish | no disponible (insignia MIT en el repo) | Adaptador en HuggingFace, 0 descargas, 0 likes |
| Whisper-Small (OpenAI) | 244 M | 30 s por fragmento | ~99 idiomas, con soporte parcial de hindi | MIT | Ampliamente disponible y desplegado |
| Whisper-Large-v3 (OpenAI) | 1550 M | 30 s por fragmento | ~99 idiomas | MIT | Ampliamente disponible; requiere mas VRAM |
| Fine-tunes completos de Whisper para hindi (terceros) | 244 M o 1550 M | 30 s por fragmento | Hindi o hinglish segun el caso | variable segun autor | no disponible de forma agregada; existen multiples variantes comunitarias |

La comparativa debe leerse con cautela: no hay ningun resultado de WER publicado para Laila, por lo que no es posible afirmar que supere a Whisper-Small zero-shot ni a otros fine-tunes en hindi. La ventaja documentada es exclusivamente de eficiencia (tamano del artefacto y coste de entrenamiento); la desventaja frente a Whisper-Small es que requiere cargar un adaptador adicional y un pipeline con PEFT.

## Limitaciones y advertencias

- No hay metricas de calidad publicadas: los WER de hindi, ingles indio y hinglish figuran como "TBD" en la propia model card, por lo que no existe evidencia de que el adaptador mejore a Whisper-Small zero-shot.
- El repositorio no tiene descargas ni valoraciones (0 descargas, 0 likes a fecha de la informacion disponible), lo que implica ausencia de validacion independiente.
- La licencia no esta declarada en los metadatos de HuggingFace; la insignia MIT de la model card corresponde al repositorio de GitHub y no necesariamente al artefacto publicado. Antes de un uso comercial debe confirmarse con el autor.
- Ambiguedad de escritura: la convencion devanagari/latino es una decision del autor, no un estandar aceptado; los resultados pueden no ser comparables con sistemas que transcriben hindi en alfabeto latino.
- El modelo solo procesa fragmentos de 30 segundos, con el corte asociado en fronteras de frase; no se documenta soporte de streaming ni de diarizacion de hablantes.
- Riesgo de alucinacion tipico de la familia Whisper en silencios, musica o ruido intenso: puede generar texto plausible donde no hay habla. El aumento de ruido del entrenamiento no garantiza que esto se mitigue.
- Sesgos y cobertura: el entrenamiento se centra en variantes de hindi y acento indio, sin documentacion del corpus; el rendimiento en otras variedades (por ejemplo, hindi con acento no indio, odia, tamil) es desconocido pese al anuncio de una suite de 22 idiomas.
- No es un modelo de lenguaje: no soporta instrucciones, tool calling ni generacion de texto libre fuera de la tarea de transcripcion.
- La model card incluye una mencion a NeurIPS 2026 y enlaces a demos, pero no se ha localizado ningun articulo tecnico con revision que respalde los resultados; debe tratarse como material promocional del autor.
- Los resultados de la busqueda web realizada no contienen informacion relacionada con este modelo, por lo que no ha sido posible contrastar ningun dato de forma externa.

## Enlaces

- Modelo en HuggingFace: [techindro/Laila](https://huggingface.co/techindro/Laila)
- Repositorio GitHub: [github.com/techindro/Laila](https://github.com/techindro/Laila)
- Demo ASR hindi: [huggingface.co/spaces/techindro/Laila-Demo](https://huggingface.co/spaces/techindro/Laila-Demo)
- Demo ASR hinglish: [huggingface.co/spaces/techindro/Laila-Hinglish](https://huggingface.co/spaces/techindro/Laila-Hinglish)
- Demo ASR ingles indio: [huggingface.co/spaces/techindro/Laila-IndianEnglish](https://huggingface.co/spaces/techindro/Laila-IndianEnglish)
- Perfil del autor: [huggingface.co/techindro](https://huggingface.co/techindro)
- Paper tecnico: no disponible
- Resultados de la busqueda web: sin enlaces relevantes para este modelo
