# thalovant/zoguilo-wakeword

## Resumen

Zoguilo-wakeword es un detector de palabra de activación (wake word) para el término inventado "Zoguilo", pronunciado /zo.ɡi.lo/. Lo desarrolla el usuario thalovant y se distribuye como un cabezal ONNX de 0,9 MB que se ejecuta sobre las características de audio de TigreGotico/wakehubert-tiny en cuantización int8. El modelo está pensado para el asistente de voz OpenVoiceOS (OVOS), donde sustituye a openWakeWord mediante el plugin ovos-ww-plugin-wakeforge.

El problema que resuelve es concreto: disponer de una palabra de activación multilingüe que no colisione con frases habituales del habla cotidiana. La palabra se eligió por búsqueda sistemática, no por criterio estético: sus sonidos se compararon con 1768 frases cortas en 7 idiomas, sintetizadas con TTS y puntuadas por un modelo de fonemas, y "Zoguilo" se aproximó a solo 62 de ellas, el mínimo entre los candidatos evaluados.

La relevancia es acotada pero clara para el ecosistema OVOS y para proyectos de voz autoalojados: el modelo ocupa menos de 1 MB, consume 5,1 ms de CPU por segundo de audio y ofrece métricas de falsos positivos y de recall medidas sobre audio no visto durante el entrenamiento. Soporta francés, inglés, español, portugués, italiano, alemán, neerlandés, polaco y rumano bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos cabezales GRU promediados sobre características de wakehubert-tiny (int8); tarea de clasificación de audio |
| Parametros totales | no disponible (pesos ONNX de 0,9 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio en streaming por tramas; puntuación cada 80 ms con debounce de 2 s) |
| Tipos de cuantizacion | int8 (featurizer base wakehubert-tiny en int8); pesos distribuidos en ONNX |
| Idiomas soportados | fr, en, es, pt, it, de, nl, pl, ro |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (zoguilo.onnx) |

## Arquitectura y entrenamiento

El modelo no es un transformer completo, sino un cabezal ligero de clasificación sobre un extractor de características congelado. Concretamente, dos cabezales GRU entrenados por separado se promedian en la salida final; uno se entrenó con los clips de conversión de voz y otro sin ellos. La época de cada cabezal se selecciona sobre el conjunto de desarrollo y la salida promediada se calibra para que la puntuación sea interpretable como probabilidad. El featurizer es TigreGotico/wakehubert-tiny en int8, y los metadatos del modelo ONNX declaran qué featurizer usar y el umbral por defecto.

Los positivos son TTS sintético multilingüe en los nueve idiomas soportados, con voces de OmniVoice (incluidas voces infantiles), edge-tts, Piper, Kokoro/StyleTTS2, PocketTTS, Supertonic, Magpie y Google, además de conversión de voz con Chatterbox sobre hablantes de MLS y LibriSpeech. Solo se usaron clips que pasaron una puerta fonética. Los negativos incluyen habla de MLS y LibriSpeech (CC BY 4.0), AudioSet (CC BY 4.0), respuestas de sala MIT IR survey y frases casi homófonas en 7 idiomas como negativos duros. El umbral por defecto, 0,253, se fijó sobre 26,4 h de habla de desarrollo para 0,5 falsos despertares por hora.

## Capacidades

- Detección de la palabra de activación "Zoguilo" en audio en streaming, con puntuación cada 80 ms y debounce de 2 s.
- Funcionamiento multilingüe en fr, en, es, pt, it, de, nl, pl y ro, con variantes de pronunciación codificadas por ortografía propia de cada idioma.
- Integración con OpenVoiceOS mediante ovos-ww-plugin-wakeforge, que descarga el modelo y el featurizer y aplica el umbral por defecto.
- Integración con el satélite Thalovant (thalovant-voice 0.10.0 o posterior) indicando la ruta al archivo ONNX.
- Umbral configurable para ajustar el compromiso entre falsos despertares y recall.
- Rechazo de frases casi homófonas: 0 de 284 clips de sonido parecido aceptados en el conjunto de retención.
- No realiza reconocimiento de voz, transcripción, traducción ni generación de texto; su única salida es una puntuación de activación.

## Casos de uso

- Asistente de voz doméstico con OpenVoiceOS: sustituir openWakeWord por Zoguilo en mycroft.conf para activar el asistente con una palabra que no colisiona con el habla cotidiana, gracias a la baja tasa de falsos positivos (0,64/h en el conjunto de evaluación).
- Satélites de voz autoalojados: desplegar el modelo en un dispositivo con thalovant-voice apuntando a la ruta local del ONNX, con un coste de CPU de 5,1 ms por segundo de audio, apto para hardware modesto.
- Dispositivos infantiles: la palabra se eligió por ser trisílaba, suave y fácil de pronunciar para un niño, y el entrenamiento incluyó voces infantiles de OmniVoice.
- Entornos multilingües: un mismo modelo cubre nueve idiomas, útil en hogares o instalaciones donde conviven hablantes de francés, inglés, español, portugués, italiano, alemán, neerlandés, polaco y rumano.
- Sistemas de activación con requisitos estrictos de falsos positivos: ajustar el umbral a 0,746 reduce los falsos despertares a 0,24/h manteniendo un recall del 93 % tras silencio y del 84 % tras habla en voces TTS retenidas.
- Prototipado e investigación en keyword spotting: el modelo sirve como referencia reproducible de un pipeline wakeforge completo, con informes de evaluación publicados (eval.json y plugin_validation.json) para comparar metodologías.

## Benchmarks y rendimiento

Falsos despertares con el umbral por defecto (0,253) sobre 70,4 h de habla leída continua de hablantes no vistos (MLS y LibriSpeech) más AudioSet; tasa global 0,64/h:

| Idioma | Horas | Falsos despertares/h |
|---|---|---|
| de | 14,3 | 0,14 |
| en (limpio) | 5,4 | 0,19 |
| en (otros) | 5,3 | 0,75 |
| es | 10,0 | 0,60 |
| fr | 10,1 | 0,80 |
| it | 5,3 | 1,14 |
| nl | 12,8 | 0,47 |
| pl | 2,1 | 0,93 |
| pt | 3,7 | 2,14 |
| AudioSet | 1,4 | 1,45 |

Recall con el umbral por defecto (cada clip tras 3 s de silencio o tras 3 s de habla de otras personas):

| Conjunto de prueba | Tras silencio | Tras habla |
|---|---|---|
| 15 voces edge-tts excluidas del entrenamiento | 93 % | 93 % |
| 243 clips OmniVoice de hablantes no entrenados | 96 % | 96 % |
| 388 clips con conversión de voz sobre hablantes reales no vistos | 97 % | 95 % |

Otros datos medidos: 0 de 284 clips casi homófonos aceptados; latencia mediana de 41 ms y p90 de 130 ms tras el final de la palabra (mediana de 73 ms a través del plugin con trozos de 2048 muestras); dentro de OVOS, 137-139 de 168 palabras de activación detectadas, 0 de 83 casi homófonos aceptados y 0 activaciones espurias con trozos de 1280, 1600, 2048 y 4096 muestras.

## Requisitos de hardware

- VRAM: no aplica; es un modelo ONNX de 0,9 MB que se ejecuta en CPU.
- GPU recomendadas: no requiere GPU; cualquier CPU sirve. Coste medido de 5,1 ms de CPU por segundo de audio.
- Cabe en cualquier dispositivo con CPU, incluidos sistemas embebidos y Raspberry Pi, por el tamaño reducido del cabezal y el featurizer int8.
- Opciones de despliegue: ONNX Runtime a través de ovos-ww-plugin-wakeforge (OpenVoiceOS) o del satélite Thalovant; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia: mediana de 41 ms y p90 de 130 ms tras el final de la palabra; mediana de 73 ms a través del plugin de OVOS.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| thalovant/zoguilo-wakeword | Cabezal ONNX sobre wakehubert-tiny | 0,9 MB | 9 | Apache 2.0 | 0,64 falsos despertares/h; recall 93-97 % en pruebas sintéticas |
| thalovant/guezilo-wakeword | Cabezal ONNX sobre wakehubert-tiny | no disponible | no disponible | Apache 2.0 | Candidato descartado: se aproximaba a 121 frases comunes frente a 62 de Zoguilo |
| thalovant/zeligui-wakeword | Cabezal ONNX sobre wakehubert-tiny | no disponible | no disponible | Apache 2.0 | Candidato descartado: 186 aproximaciones a frases comunes |
| openWakeWord | Detector de wake word | no disponible | no disponible | no disponible | Alternativa que Zoguilo sustituye en OVOS; sin datos comparativos en la información disponible |

## Limitaciones y advertencias

- Todas las voces de prueba son sintéticas o convertidas por voz; nadie ha grabado "Zoguilo" con voz humana real para los tests.
- Los negativos son habla leída; la conversación doméstica, la televisión y la música afectan al detector de forma distinta y no se han medido.
- El portugués es el idioma más débil: 2,14 falsos despertares/h, 82-87 % en hablantes con conversión de voz y se pierde la única voz edge-tts pt-BR retenida.
- El neerlandés tras habla es el siguiente peor caso, con 76-91 % de recall.
- El umbral por defecto está calibrado para 0,5 falsos despertares por hora, pero la tasa medida en evaluación es de 0,64/h; en producción conviene reajustarlo según el entorno acústico.
- El modelo solo detecta una palabra concreta; no transcribe, no entiende lenguaje y no sirve para otras tareas de audio.
- Licencia Apache 2.0, que permite uso comercial, pero el featurizer base (wakehubert-tiny) se descarga en una revisión fijada por el plugin y conviene verificar su licencia por separado.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thalovant/zoguilo-wakeword
- Modelo base: https://huggingface.co/TigreGotico/wakehubert-tiny
- Candidato descartado Guézilo: https://huggingface.co/thalovant/guezilo-wakeword
- Candidato descartado Zéligui: https://huggingface.co/thalovant/zeligui-wakeword
- Repositorio wakeforge: https://github.com/TigreGotico/wakeforge
- Plugin de OVOS: https://pypi.org/project/ovos-ww-plugin-wakeforge/
- Informe de evaluación: https://huggingface.co/thalovant/zoguilo-wakeword/blob/main/eval.json
- Validación del plugin: https://huggingface.co/thalovant/zoguilo-wakeword/blob/main/plugin_validation.json
- Pesos ONNX: https://huggingface.co/thalovant/zoguilo-wakeword/resolve/main/zoguilo.onnx
