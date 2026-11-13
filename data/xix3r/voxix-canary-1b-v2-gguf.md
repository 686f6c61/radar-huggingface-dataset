# xix3r/voxix-canary-1b-v2-gguf

## Resumen

voxix-canary-1b-v2-gguf es una conversión a formato GGUF del modelo NVIDIA Canary-1B-v2, publicada por el usuario xix3r y destinada al runtime transcribe.cpp. El modelo base es un sistema de reconocimiento automático del habla (ASR) y traducción de voz (AST) multitarea con arquitectura encoder-decoder: un encoder FastConformer de 32 capas y un decoder Transformer de 8 capas, con aproximadamente 980 millones de parámetros. Cubre 25 idiomas europeos para transcripción y traducción bidireccional inglés ↔ 24 lenguas.

La relevancia de esta ficha radica en que empaqueta un modelo de ASR de calidad de referencia en cuantizaciones que van desde 735 MB (Q4_K_M) hasta 3,92 GB (F32), lo que permite ejecutarlo en hardware modesto, incluidas CPU y GPUs de consumo. Los WER reportados en LibriSpeech test-clean se mantienen estables en torno al 1,9 % en todas las cuantizaciones, lo que indica que la compresión no degrada de forma apreciable la precisión en inglés.

El modelo no es de streaming, no expone marcas de tiempo en este port y no realiza detección automática de idioma: requiere indicar el idioma de origen y el modo (transcripción o traducción). Está pensado para procesamiento offline de audio de 16 kHz mono.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder-decoder multitarea AED: FastConformer (32 capas) + Transformer decoder (8 capas) |
| Parámetros totales | 980.046.848 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, es, sv, ru, uk (25) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base sigue un diseño encoder-decoder multitarea. El encoder es un FastConformer de 32 capas, una variante de Conformer con atención por bloques que reduce el coste computacional sobre secuencias largas de audio. El decoder es un Transformer de 8 capas que genera la secuencia de texto condicionada por la salida del encoder y por tokens de tarea e idioma. La entrada es audio WAV mono a 16 kHz.

No se dispone en la información proporcionada de detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. La model card del port remite al modelo original de NVIDIA para esos datos. La innovación práctica del port es la conversión a GGUF con validación numérica frente a la referencia NeMo, verificada en el commit db53eda de transcribe.cpp el 2026-05-08, con el modelo base fijado en el commit 87bc526.

## Capacidades

- Transcripción automática del habla (ASR) en 25 idiomas europeos.
- Traducción de voz (AST) de inglés a 24 idiomas y de 24 idiomas a inglés.
- Salida de transcripción en texto plano a partir de audio de 16 kHz mono.
- Multilingüe: búlgaro, croata, checo, danés, neerlandés, inglés, estonio, finés, francés, alemán, griego, húngaro, italiano, letón, lituano, maltés, polaco, portugués, rumano, eslovaco, esloveno, español, sueco, ruso y ucraniano.
- No soporta streaming (streaming: false).
- No realiza detección automática de idioma (lang_detect: false): el idioma debe especificarse.
- No expone marcas de tiempo de palabra ni de segmento en este port (timestamps: none).
- No incluye tool calling, capacidades de agente ni visión; es un modelo puramente de voz a texto.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo procesa audio pregrabado en cualquiera de los 25 idiomas y devuelve texto con WER bajo en lenguas mayoritarias (3,1 % en español e italiano, 4,46 % en alemán sobre FLEURS con Q8_0), adecuado para actas y resúmenes posteriores.
- Subtitulado y localización de contenido audiovisual: la capacidad de traducción inglés ↔ 24 idiomas permite generar pistas de subtítulos traducidas sin pipeline separado de ASR más traducción de texto.
- Atención al cliente multilingüe: transcripción de llamadas grabadas en centros de soporte europeos para análisis de calidad, clasificación de motivos y búsqueda sobre el texto resultante.
- Investigación en lingüística computacional: evaluación comparativa de ASR en lenguas de bajos recursos europeos (maltés, letón, lituano, esloveno) con un único modelo y cuantizaciones ligeras para experimentos a gran escala.
- Despliegue en dispositivos de borde: con Q4_K_M (735 MB) el modelo cabe en CPUs modestas y en GPUs de consumo, lo que permite transcripción offline en portátiles o equipos sin acelerador dedicado.
- Archivado y accesibilidad de documentos sonoros: conversión de fondos de audio históricos o administrativos a texto indexable, con la ventaja de no requerir conexión a servicios en la nube.
- Generación de datos de entrenamiento: transcripción masiva de audio para construir corpus de texto alineado con voz en múltiples idiomas.

## Benchmarks y rendimiento

WER sobre LibriSpeech test-clean (2.620 enunciados, batch size 1, decodificación greedy sin LM externo):

| Cuantización | WER LibriSpeech test-clean |
|---|---|
| F32 | 1,92 % |
| F16 | 1,92 % |
| Q8_0 | 1,91 % |
| Q6_K | 1,94 % |
| Q5_K_M | 1,93 % |
| Q4_K_M | 1,91 % |

WER sobre FLEURS con cuantización Q8_0:

| Idioma | WER Q8_0 |
|---|---|
| Español | 3,10 % |
| Italiano | 3,10 % |
| Alemán | 4,46 % |
| Inglés | 4,47 % |
| Portugués | 4,50 % |
| Francés | 5,09 % |
| Neerlandés | 6,28 % |
| Eslovaco | 6,84 % |
| Rumano | 6,87 % |
| Polaco | 6,88 % |
| Ruso | 7,83 % |
| Croata | 8,40 % |
| Checo | 8,56 % |
| Finlandés | 8,86 % |
| Búlgaro | 9,22 % |
| Sueco | 9,74 % |
| Letón | 10,41 % |
| Ucraniano | 10,58 % |
| Danés | 11,34 % |
| Estonio | 12,72 % |
| Esloveno | 12,76 % |
| Húngaro | 13,06 % |
| Lituano | 13,45 % |
| Maltés | 19,75 % |
| Griego | 26,02 % |

Rendimiento en tiempo real (RTF, factor de tiempo real):

| Plataforma | Backend | RTF |
|---|---|---|
| Apple M4 Max | CPU | 25,08 |
| Apple M4 Max | Metal | 98,25 |
| AMD Ryzen 4750U | CPU | 8,32 |
| AMD Ryzen 4750U | Vulkan | 14,13 |

NVIDIA reporta 2,18 % en LibriSpeech test-clean para el modelo original; el port F32 obtiene 1,92 %, diferencia atribuida por el autor a variaciones en el método de puntuación.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,7 GB con Q4_K_M, 0,8 GB con Q5_K_M, 0,9 GB con Q6_K, 1,1 GB con Q8_0, 2,0 GB con F16 y 3,9 GB con F32.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para cuantizaciones ligeras; H100, A100 o RTX 4090 sobran para este modelo y no aportan ventaja significativa por su tamaño reducido.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna (RTX 3060, RTX 4060, GTX 1650, iGPU con soporte Vulkan o Metal) usando Q4_K_M o Q8_0.
- Despliegue: el runtime previsto es transcribe.cpp (compilación con CMake, binario transcribe-cli). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: RTF de 25,08 en CPU de M4 Max, 98,25 con Metal en M4 Max, 8,32 en CPU de Ryzen 4750U y 14,13 con Vulkan en Ryzen 4750U. Valores de RTF superiores a 1 indican procesamiento más rápido que tiempo real.
- Requiere audio de entrada en WAV mono a 16 kHz; el autor recomienda ffmpeg para la conversión previa.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| voxix-canary-1b-v2-gguf | 980 M | 25 europeos | GGUF | CC-BY-4.0 | Port de NVIDIA Canary-1B-v2 para transcribe.cpp |
| nvidia/canary-1b-v2 | 980 M | 25 europeos | NeMo (.nemo) | CC-BY-4.0 | Modelo original, referencia de validación |
| Whisper large-v3 | No disponible en la información | No disponible en la información | No disponible en la información | No disponible en la información | Alternativa de ASR multilingüe ampliamente usada; sin datos comparativos en esta ficha |

No se dispone en la información proporcionada de datos de rendimiento de otros modelos comparables para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- No es un modelo de streaming: requiere audio completo o segmentos pregrabados, no apto para transcripción en vivo con baja latencia.
- No realiza detección automática de idioma; es obligatorio indicar el idioma de origen, lo que puede provocar errores si se desconoce o si el audio mezcla lenguas.
- No expone marcas de tiempo de palabra ni de segmento en este port, lo que limita su uso en subtitulado con sincronización fina.
- Diferencias muy marcadas de calidad entre idiomas: WER de 3,10 % en español frente a 26,02 % en griego y 19,75 % en maltés sobre FLEURS con Q8_0.
- Riesgo de alucinación y de transcripciones plausibles pero incorrectas en audio con ruido, acentos no cubiertos o solapamiento de hablantes; no se documentan mitigaciones específicas.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario conservar el aviso de copyright y citar la fuente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el port se validó contra un commit concreto de transcribe.cpp; conviene fijar versiones para reproducibilidad.
- El tamaño del repositorio (9,5 GB) incluye todas las cuantizaciones; para producción debe descargarse solo el archivo GGUF necesario.
- No se documentan sesgos demográficos o acústicos específicos en la información disponible.

## Enlaces

- Repositorio Hugging Face del port: https://huggingface.co/xix3r/voxix-canary-1b-v2-gguf
- Modelo base: https://huggingface.co/nvidia/canary-1b-v2
- Commit del modelo base fijado: https://huggingface.co/nvidia/canary-1b-v2/commit/87bc526
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/db53eda
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/canary-1b-v2.md
- Pesos F32: https://huggingface.co/handy-computer/canary-1b-v2-gguf/resolve/main/canary-1b-v2-F32.gguf
- Pesos F16: https://huggingface.co/handy-computer/canary-1b-v2-gguf/resolve/main/canary-1b-v2-F16.gguf
- Pesos Q8_0: https://huggingface.co/handy-computer/canary-1b-v2-gguf/resolve/main/canary-1b-v2-Q8_0.gguf
- Pesos Q6_K: https://huggingface.co/handy-computer/canary-1b-v2-gguf/resolve/main/canary-1b-v2-Q6_K.gguf
- Pesos Q5_K_M: https://huggingface.co/handy-computer/canary-1b-v2-gguf/resolve/main/canary-1b-v2-Q5_K_M.gguf
- Pesos Q4_K_M: https://huggingface.co/handy-computer/canary-1b-v2-gguf/resolve/main/canary-1b-v2-Q4_K_M.gguf
- Licencia del port: https://huggingface.co/handy-computer/canary-1b-v2-gguf/blob/main/LICENSE
- Aviso de derivación: https://huggingface.co/handy-computer/canary-1b-v2-gguf/blob/main/NOTICE
