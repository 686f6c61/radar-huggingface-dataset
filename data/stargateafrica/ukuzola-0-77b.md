# StargateAfrica/Ukuzola-0.77B

## Resumen

Ukuzola-0.77B es un modelo de reconocimiento automático del habla (ASR) desarrollado por StargateAfrica, publicado en Hugging Face bajo una licencia de investigacion academica propia (`stargate-africa-research-academic-licence`). Con aproximadamente 770 millones de parametros, esta orientado especificamente a cuatro lenguas bantu del sur de Africa: xhosa (xh), zulu (zu), ndebele meridional (nr) y swati (ss). El repositorio ocupa 4,6 GB y el acceso esta restringido: es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos.

El modelo resuelve un problema de cobertura: las lenguas bantu meridionales cuentan con muy pocos recursos ASR de calidad en comparacion con ingles, frances o espanol. Ukuzola-0.77B se posiciona como una alternativa especializada de tamano contenido, adecuada para despliegues con recursos limitados en contextos de investigacion linguistica, accesibilidad y digitalizacion de contenido oral.

La informacion publica disponible es limitada: no se han publicado detalles sobre la arquitectura exacta, el corpus de entrenamiento, los resultados de benchmarks ni las condiciones completas de la licencia en la ficha de Hugging Face. Esta ficha refleja exclusivamente los metadatos disponibles y marca explicitamente como "no disponible" cualquier dato no confirmado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR; probablemente encoder transformer tipo wav2vec2/Conformer, sin confirmar) |
| Parametros totales | ~0,77 mil millones (770M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | xh (xhosa), zu (zulu), nr (ndebele meridional), ss (swati) |
| Licencia | stargate-africa-research-academic-licence (acceso restringido) |
| Formato de pesos | no disponible (repo de 4,6 GB; probablemente safetensors, sin confirmar) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo en los metadatos disponibles. Por el tamano (0,77B) y la tarea (ASR multilingue de lenguas de bajos recursos), es plausible que se trate de un encoder acustico transformer entrenado con tecnicas de adaptacion multilingue, pero esto no esta confirmado en la ficha oficial. No hay datos publicos sobre el numero de horas de audio utilizadas, la composicion del corpus, el uso de tecnicas de autosupervision (tipo wav2vec2 o XLS-R), ni sobre posibles etapas de ajuste fino supervisado o decodificacion con modelo de lenguaje externo.

Tampoco se dispone de informacion sobre innovaciones tecnicas especificas (attention linear, decodificacion especulativa, destilacion, adaptadores de idioma). Cualquier afirmacion al respecto seria especulativa.

## Capacidades

- Reconocimiento automatico del habla en xhosa, zulu, ndebele meridional y swati.
- Transcripcion de audio a texto en un pipeline `automatic-speech-recognition`.
- Cobertura multilingue limitada a las cuatro lenguas bantu indicadas; no se declara soporte para otras lenguas.
- No se declara soporte de tool calling, function calling, agentes ni razonamiento multi-step (no es un modelo generativo de proposito general).
- No se declara soporte de vision, audio generativo ni modo "thinking".
- Capacidad multilingue cruzada entre las cuatro lenguas: no confirmada explicitamente, aunque el etiquetado multilingue lo sugiere.

## Casos de uso

- Transcripcion de archivos de radio comunitaria en zulu y xhosa: el modelo puede convertir emisiones de audio en texto para indexacion y busqueda, aprovechando su especializacion en lenguas bantu meridionales donde los modelos genericos tienen coberturas pobres.
- Subtitulado automatico de contenido audiovisual educativo: util para producir subtitulos en ndebele meridional y swati en materiales de formacion, con un modelo de 0,77B que cabe en infraestructura modesta.
- Digitalizacion de archivos orales de investigacion linguistica: transcripcion de grabaciones de campo en las cuatro lenguas para construir corpus anotados, en linea con la licencia academica del modelo.
- Accesibilidad para personas con discapacidad auditiva: generacion de transcripciones en tiempo cuasi-real de conversaciones y reuniones en lenguas bantu meridionales, desplegando el modelo en servidores locales.
- Sistemas de atencion al ciudadano en administraciones sudafricanas: transcripcion de llamadas o mensajes de voz en xhosa y zulu para su enrutamiento y analisis posterior.
- Investigacion en reconocimiento de habla de bajos recursos: uso del modelo como linea base o punto de partida para fine-tuning en variedades dialectales o dominios especificos, dado su tamano contenido y su licencia academica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 3,1 GB solo para pesos (0,77B × 4 bytes), mas activaciones y buffers de audio; en FP16, unos 1,5-1,6 GB.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para FP16 con margen operativo; RTX 3060, RTX 4070, RTX 4090, A10, L4, A100 y H100 son opciones validas.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en FP16; en FP32 se recomienda 12 GB o mas para trabajar con holgura.
- Opciones de despliegue: no se han publicado instrucciones oficiales; por el pipeline `automatic-speech-recognition` de Hugging Face, es compatible con `transformers` y potencialmente con servidores tipo TGI o vLLM (soporte ASR de vLLM no confirmado). Para CPU, `transformers` con PyTorch es la via mas directa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas ASR | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ukuzola-0.77B | ~770M | no disponible | xh, zu, nr, ss | stargate-africa-research-academic-licence | Gated en HF |
| Whisper (small) | ~244M | 30 s de audio | ~99 idiomas (incluye zu, xh de forma limitada) | MIT | Abierta |
| Whisper (medium) | ~769M | 30 s de audio | ~99 idiomas | MIT | Abierta |
| wav2vec2-base | ~95M | no aplica (encoder) | depende del fine-tuning | MIT/Apache-2.0 | Abierta |

La comparativa con Whisper es la mas directa por tamano (Whisper medium ronda los 769M parametros). Whisper ofrece cobertura multilingue amplia pero con rendimiento historicamente desigual en lenguas bantu meridionales; Ukuzola-0.77B se especializa en cuatro de ellas, a costa de una licencia restringida y acceso gated. No hay datos publicados que permitan comparar WER entre ambos.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face; no es descargable de forma anonima.
- Licencia academica: la `stargate-africa-research-academic-licence` previsiblemente restringe el uso comercial; es imprescindible revisar el texto completo antes de cualquier despliegue en produccion.
- Cobertura linguistica acotada: solo cuatro lenguas bantu meridionales; no se declara soporte para ingles, afrikaans ni otras lenguas sudafricanas.
- Sin datos de rendimiento: no hay WER publicado, ni por idioma ni por dominio, lo que impide estimar la calidad real en produccion.
- Riesgo de sesgo de dominio: al no conocerse el corpus de entrenamiento, se desconoce su cobertura de acentos, registros (formal/informal) y condiciones acusticas (telefonia, ruido).
- Riesgo de alucinacion en transcripcion: como cualquier modelo ASR, puede generar texto plausible en segmentos de silencio o ruido; requiere postprocesado y validacion en casos criticos.
- Sin garantias de mantenimiento: el modelo fue creado en junio de 2026 y actualizado en noviembre de 2026, pero no se ha publicado hoja de ruta ni soporte oficial.
- Formato y pesos no confirmados: conviene verificar el contenido del repositorio tras aceptar la licencia antes de planificar el pipeline de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StargateAfrica/Ukuzola-0.77B
- Perfil del autor: https://huggingface.co/StargateAfrica
- No se han encontrado papers, blogs, repositorios de codigo ni demos adicionales en la informacion disponible.
