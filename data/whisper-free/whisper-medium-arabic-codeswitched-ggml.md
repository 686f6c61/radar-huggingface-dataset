# whisper-free/whisper-medium-arabic-codeswitched-ggml

## Resumen

`whisper-free/whisper-medium-arabic-codeswitched-ggml` es una conversión al formato GGML (compatible con whisper.cpp) del modelo `Seif-Eldeen-Sameh/whisper-medium-arabic-codeswitched`. Se trata de un ajuste fino de Whisper medium de OpenAI orientado a reconocimiento automático de habla (ASR) en árabe con fenómenos de alternancia de código (code-switching), es decir, audio en el que el hablante mezcla árabe con otro idioma (típicamente inglés) dentro de una misma emisión.

El modelo original parte de la arquitectura encoder-decoder transformer de Whisper medium, con aproximadamente 769 millones de parámetros en su variante estándar, y ha sido reentrenado sobre un corpus específico de árabe code-switched. Esta versión GGML mantiene los pesos sin modificar respecto al modelo fuente: la única transformación aplicada es la conversión de formato, lo que permite ejecutar la inferencia en CPU y en entornos ligeros mediante whisper.cpp.

La relevancia de esta ficha radica en que cubre un nicho poco atendido: el ASR de conversaciones bilingües árabe-inglés en un formato portable (un único fichero `.bin` de 1,5 GB en precisión F16) pensado para integrarse en la aplicación Whisper Free. La licencia Apache-2.0 del modelo fuente facilita su uso comercial, aunque el autor advierte que no se auditaron las licencias de los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper medium), conversión GGML |
| Parametros totales | Aproximadamente 769 M (arquitectura Whisper medium estándar; no confirmado en la model card) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | Ventana de audio de 30 segundos por segmento (estándar de Whisper; no especificado en la model card) |
| Tipos de cuantizacion | F16 (fichero GGML incluido); otras cuantizaciones no disponibles |
| Idiomas soportados | Árabe con alternancia de código (code-switching); lista completa no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGML (whisper.cpp, F16), fichero `ggml-whisper-medium-arabic-codeswitched.bin` |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Whisper medium de OpenAI: un transformer encoder-decoder con atención estándar, entrenado originalmente para transcripción multilingüe y traducción de voz. La variante aquí publicada es un ajuste fino del modelo `Seif-Eldeen-Sameh/whisper-medium-arabic-codeswitched`, orientado específicamente a audio en árabe con alternancia de código. La model card no detalla el volumen de tokens de audio, la composición del dataset de ajuste ni si se emplearon técnicas de RLHF o DPO; esa información no está disponible.

La innovación técnica de esta publicación es exclusivamente de empaquetado: la conversión a GGML en precisión F16 permite ejecutar el modelo con whisper.cpp en CPU y en dispositivos sin GPU dedicada, manteniendo los pesos idénticos al modelo fuente. El vocabulario del tokenizer procede del modelo Whisper base de OpenAI (licencia MIT). El autor indica que las licencias se verificaron el 28 de octubre de 2026, pero que las licencias de los datasets de entrenamiento no fueron auditadas.

## Capacidades

- Reconocimiento automático de habla (ASR) en árabe con alternancia de código árabe-inglés.
- Transcripción de audio de hasta 30 segundos por segmento, con encadenamiento de segmentos para audios más largos.
- Detección de idioma y transcripción multilingüe heredada de la arquitectura Whisper (alcance exacto no especificado).
- Ejecución en CPU mediante whisper.cpp gracias al formato GGML F16.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá del ASR estándar de Whisper.

## Casos de uso

- Transcripción de reuniones bilingües árabe-inglés: el ajuste específico sobre code-switching permite transcribir conversaciones donde los hablantes alternan entre ambos idiomas, un escenario frecuente en equipos técnicos de Oriente Medio.
- Subtitulado de contenido audiovisual: generación de subtítulos para vídeos, pódcast o clases donde se mezcla árabe con terminología inglesa, ejecutando el modelo en servidores sin GPU.
- Atención al cliente en centros de contacto: transcripción de llamadas de soporte en las que el cliente usa árabe dialectal con préstamos del inglés, para su posterior análisis de calidad o búsqueda.
- Investigación lingüística sobre code-switching: obtención de transcripciones anotadas para estudiar patrones de alternancia de código en corpus de habla espontánea.
- Despliegue en dispositivos de borde: al ser un fichero GGML F16 de 1,5 GB, puede ejecutarse en portátiles o mini-PC sin GPU dedicada mediante whisper.cpp, útil para aplicaciones de dictado offline.
- Accesibilidad: transcripción en tiempo casi real de clases o conferencias para estudiantes sordos en entornos educativos bilingües árabe-inglés.
- Preprocesamiento de datos para otros modelos: generación de transcripciones que alimenten pipelines de NLP en árabe (resumen, extracción de entidades) sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el fichero F16 ocupa 1,5 GB; la inferencia en GPU requeriría aproximadamente 2-3 GB de VRAM, aunque no se proporcionan cifras oficiales.
- GPU recomendadas: no disponible. Al ser un formato GGML, el caso de uso principal es CPU.
- Compatibilidad con GPU de consumo: el modelo cabe holgadamente en cualquier GPU de consumo con más de 4 GB de VRAM si se usa un backend compatible, aunque el formato GGML está optimizado para CPU.
- Opciones de despliegue: whisper.cpp (formato nativo), y conversión adicional a otros runtimes si se desea (no documentada por el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| whisper-free/whisper-medium-arabic-codeswitched-ggml | ~769 M | 30 s por segmento | Árabe code-switched | Apache-2.0 | GGML F16 |
| openai/whisper-medium | ~769 M | 30 s por segmento | Multilingüe (99 idiomas) | MIT | PyTorch, GGML |
| openai/whisper-large-v3 | ~1,55 B | 30 s por segmento | Multilingüe (99 idiomas) | MIT | PyTorch, GGML |

El modelo aquí descrito se diferencia de Whisper medium original por su ajuste específico a árabe code-switched, a costa de un alcance idiomático presumiblemente más reducido. Frente a Whisper large-v3, ofrece menor tamaño y menor coste computacional, con precisión potencialmente inferior en idiomas distintos del árabe.

## Limitaciones y advertencias

- El ajuste fino está orientado a árabe code-switched; el rendimiento en otros idiomas o en árabe estándar sin mezcla puede degradarse respecto al Whisper medium original.
- No se han publicado métricas (WER, CER) que permitan evaluar la calidad real del ajuste.
- Riesgo de alucinación inherente a los modelos Whisper, especialmente en segmentos con silencio o ruido.
- La model card no documenta sesgos específicos del dataset de ajuste; los sesgos del corpus original de Whisper pueden persistir.
- Las licencias de los datos de entrenamiento no fueron auditadas por el autor, lo que introduce incertidumbre sobre el uso comercial aunque la licencia del modelo sea Apache-2.0.
- El modelo se distribuye "as-is", sin garantía, y con cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- El formato GGML F16 limita las opciones de cuantización adicionales salvo que el usuario las genere por su cuenta.

## Enlaces

- Hugging Face: https://huggingface.co/whisper-free/whisper-medium-arabic-codeswitched-ggml
- Modelo fuente: https://huggingface.co/Seif-Eldeen-Sameh/whisper-medium-arabic-codeswitched
- Repositorio OpenAI Whisper: https://github.com/openai/whisper
- Página oficial de Whisper en OpenAI: https://openai.com/fr-FR/index/whisper/
- whisper.cpp (runtime GGML): no disponible en la información proporcionada
