# tunjayoff/Drama-3-final-Q4_K-GGUF

## Resumen

Drama-3-final-Q4_K-GGUF es una conversión cuantizada a formato GGUF del modelo de síntesis de voz Drama 3, desarrollado originalmente por Fish Audio. El repositorio lo publica el usuario tunjayoff y contiene una única conversión Q4_K del checkpoint final de Drama 3 (revisión 78e5ab79, publicada el 29 de octubre de 2026), que sustituye a la versión preliminar del 13 de octubre. El objetivo es permitir la inferencia local del modelo mediante el motor speech.cpp, sin depender de los pesos originales en FP8.

El modelo base es un text-to-speech de gran escala con 35.774.376.977 parámetros totales, empaquetado en un fichero GGUF de 20,79 GB. La conversión mantiene exactamente el mismo layout que las conversiones previas ampliamente usadas (1531 tensores: 522 en Q4_K, 216 en F16 y 793 en F32), con `speech.layout 1`, y requiere speech.cpp 0.8.8 o superior. Al conservar el mismo codec, los ficheros de voz `.voice.gguf` existentes siguen siendo compatibles.

La relevancia de esta versión concreta radica en la corrección de un fallo grave de la versión preliminar: el "chunk collapse" en textos largos, por el que el modelo entraba en una pausa de fin de frase y no reanudaba, generando silencio o tarareo hasta el límite de 47,6 s por chunk. Según el autor, los pesos finales eliminan por completo ese comportamiento en sus pruebas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de síntesis de voz; pesos en GGUF/ggml, layout speech.cpp 1) |
| Parametros totales | 35.774.376.977 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K (fichero único); el modelo base se distribuye en FP8 safetensors |
| Idiomas soportados | no disponible |
| Licencia | Fish Audio Community License 1.0 (license: other; uso comercial limitado por umbral de ingresos, sin derechos de servicio alojado) |
| Formato de pesos | GGUF (ggml), 1531 tensores: 522 Q4_K, 216 F16, 793 F32 |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Drama 3 en la documentación proporcionada. El nombre del fichero (`Drama-35B-A3B-v3`) sugiere una estructura de mezcla de expertos con aproximadamente 35B de parámetros totales y 3B activos, aunque este dato no está confirmado en la información disponible. Lo que sí se documenta es el proceso de conversión: los 15 safetensors FP8 originales más el `codec.pth` (41,5 GB en total, con verificación SHA-256) se convierten a float32 de forma sin pérdida interpretando las escalas de bloque FP8 de 128x128, generando un GGUF F32 de 143 GB, que después se cuantiza a Q4_K mediante `speech quantize` sin matriz de importancia.

El modelo base incorpora un codec de audio propio (compartido con las conversiones previas, lo que garantiza la compatibilidad de las voces) y admite control de estilo mediante etiquetas entre corchetes en el prompt de texto, como `[warm, lively]`. El autor no detalla la composición del dataset de entrenamiento ni si hubo etapas de RLHF o DPO. La innovación destacable de esta revisión es la corrección del colapso en textos largos: en las pruebas del autor, los intentos de chunk colapsados pasaron de aproximadamente 25 a 0, y los chunks que la comprobación ASR tuvo que repetir pasaron de 13 a 0.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto con control de estilo mediante etiquetas descriptivas entre corchetes (por ejemplo, `[warm, lively]`).
- Generación de audio por chunks con un límite de 47,6 s por fragmento, pensado para lecturas de textos largos.
- Compatibilidad con ficheros de voz `.voice.gguf` existentes para clonación o selección de timbre (el autor usa `--voice none` en su ejemplo).
- Estabilidad mejorada en textos largos y emocionales: en la prueba de 71 palabras con carga emocional, la duración pasó de 80–121 s (con silencios) a 66–76 s.
- Fidelidad de lectura verificada con ASR: 0, 0 y 1 diferencias de una sola palabra con Whisper en tres semillas, y 0 en un guion de 170 palabras.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Lectura de artículos y textos largos: el modelo trocea el texto en chunks de hasta 47,6 s y, con los pesos finales, mantiene la locución sin colapsos en pausas de fin de frase, lo que lo hace apto para narración de documentos extensos.
- Audiolibros y narración con estilo: las etiquetas entre corchetes permiten ajustar el tono (`[warm, lively]`) por fragmento, útil para producir narraciones con matices emocionales sin reentrenar.
- Doblaje y locución para vídeo: la generación local con speech.cpp permite iterar guiones y semillas rápidamente sin coste por API, integrable en un pipeline de postproducción.
- Asistentes de voz en local: al ejecutarse sobre GGUF con speech.cpp, puede desplegarse en infraestructura propia para síntesis de respuestas en asistentes conversacionales, siempre que el uso encaje en la licencia.
- Accesibilidad: conversión de texto a voz para lectores de pantalla o contenido educativo, con voces personalizadas mediante ficheros `.voice.gguf`.
- Pruebas de concepto e investigación en TTS: el formato GGUF y la cuantización Q4_K facilitan experimentar con un modelo de 35B en hardware más modesto que los 41,5 GB en FP8 del original, y el autor pide expresamente retroalimentación sobre la calidad percibida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo aporta métricas cualitativas de estabilidad en sus propias pruebas:

| Metrica (pruebas del autor) | Preview Q4_K (7 lecturas) | Final Q4_K (11 lecturas) |
|---|---|---|
| Chunks colapsados (límite `max_frames` o demasiado lentos) | ~25 | 0 |
| Chunks repetidos por la comprobación ASR | 13 | 0 |
| Texto emocional de 71 palabras (duración) | 80–121 s (silencio) | 66–76 s |

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4_K ocupa 20,79 GB, por lo que se necesita al menos esa cantidad de memoria (GPU o RAM con offload) más el overhead del runtime y del codec. No se dispone de cifras oficiales de VRAM pico.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, encaja en GPUs de 24 GB o más, aunque el autor no lo confirma.
- ¿Cabe en GPU de consumo? El fichero de 20,79 GB podría caber en tarjetas de 24 GB, pero no hay confirmación del autor ni datos de latencia.
- Opciones de despliegue: speech.cpp 0.8.8 o superior (probado por el autor con 0.10.0). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Parámetros de inferencia recomendados por el autor: `--top-k 4097` (sin recorte; con top_k pequeño el modelo se detiene tras la primera frase), temperatura 1.0 y top_p 0.9.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| tunjayoff/Drama-3-final-Q4_K-GGUF | 35.774.376.977 | GGUF Q4_K (20,79 GB) | no disponible | Fish Audio Community License 1.0 | Pesos finales, corrección del colapso en textos largos |
| sakasegawa/drama-3-GGUF | no disponible | GGUF (mismo layout) | no disponible | Fish Audio Community License 1.0 (presumible) | Conversión del checkpoint preview (13 oct 2026); presenta el colapso en textos largos |
| fishaudio/drama-3 (original) | 35.774.376.977 (presumible, mismo modelo) | 15 safetensors FP8 + codec.pth (41,5 GB) | no disponible | Fish Audio Community License 1.0 | Pesos de referencia sin cuantizar |

No se dispone de datos de benchmarks que permitan comparar el rendimiento frente a otros modelos TTS de la misma categoría.

## Limitaciones y advertencias

- Licencia restrictiva: la Fish Audio Community License 1.0 permite investigación y uso no comercial de forma gratuita; el uso comercial solo está licenciado para licenciatarios por debajo del umbral de ingresos de la Sección III y no incluye derechos de servicio alojado.
- El repositorio solo convierte el formato; el autor remite al fichero `NOTICE` para la declaración de modificaciones.
- Riesgo de parada prematura si se reduce `top-k`: con valores pequeños el modelo tiende a detenerse tras la primera frase porque la continuación más probable al final de una oración es el silencio.
- Muestra pequeña en la validación: el autor reconoce que las pruebas de estabilidad son de tamaño reducido y solicita informes de los usuarios.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingüe.
- No hay datos publicados sobre sesgos, tasas de alucinación en el contenido hablado ni límites de contexto.
- Requiere speech.cpp 0.8.8 o superior y un fichero de 20,79 GB; el despliegue en producción exige verificar la compatibilidad con la versión del motor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tunjayoff/Drama-3-final-Q4_K-GGUF
- Modelo base: https://huggingface.co/fishaudio/drama-3
- Revisión concreta del modelo base: https://huggingface.co/fishaudio/drama-3/tree/78e5ab79e49aa9a25abe8799eff2c4d73a1c3216
- Conversión previa del preview: https://huggingface.co/sakasegawa/drama-3-GGUF
- Ficha en local-ai-zone: https://local-ai-zone.github.io/models/drama-3.html
