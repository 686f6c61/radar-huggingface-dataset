# SwinliQ-AI-2/whisper-large-v3-turbo

## Resumen

Whisper large-v3-turbo es un modelo de reconocimiento automático del habla (ASR) y traducción de voz desarrollado por OpenAI y posteriormente ajustado (fine-tune) por el usuario SwinliQ-AI-2. Se trata de una versión podada del modelo Whisper large-v3, en la que el número de capas del decodificador se reduce de 32 a 4, lo que permite una inferencia mucho más rápida a costa de una degradación menor en la calidad de transcripción. El modelo mantiene el encoder completo de large-v3, con 809 millones de parámetros en total, y soporta 99 idiomas.

Este checkpoint concreto es un fine-tune del modelo turbo original de OpenAI, aunque no se especifican los datos ni el procedimiento de ajuste. Su relevancia radica en que combina la precisión multilingüe de la familia Whisper con una latencia reducida, lo que lo hace adecuado para aplicaciones en tiempo real, transcripción de audio largo y despliegue en hardware de gama media. La licencia MIT permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (Whisper) |
| Parametros totales | 808.878.080 (809 M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 30 segundos de audio por chunk (receptive field) |
| Tipos de cuantizacion | fp16, fp32, int8, int4 (via GGUF) |
| Idiomas soportados | 99 idiomas (en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su) |
| Licencia | MIT |
| Formato de pesos | safetensors (tambien disponible en GGUF) |

## Arquitectura y entrenamiento

Whisper large-v3-turbo sigue la arquitectura encoder-decoder transformer original de Whisper, con un encoder de 32 capas y un decodificador reducido a 4 capas (frente a las 32 del large-v3). El modelo fue entrenado originalmente por OpenAI con más de 5 millones de horas de audio etiquetado, utilizando un enfoque de supervisión débil a gran escala. El proceso de poda del decodificador se realizo mediante un ajuste fino sobre el modelo large-v3, manteniendo el encoder intacto y reentrenando las capas restantes del decodificador para compensar la perdida de capacidad.

El checkpoint de SwinliQ-AI-2 es un fine-tune adicional sobre el modelo turbo, aunque no se documentan los datos de entrenamiento, el numero de tokens ni si se aplicaron tecnicas como RLHF o DPO. La model card no aporta informacion sobre el proceso de ajuste especifico, por lo que se asume que mantiene las capacidades del modelo base.

## Capacidades

- Transcripcion de audio a texto en 99 idiomas, con deteccion automatica del idioma de origen.
- Traduccion de voz a texto en ingles (speech translation), manteniendo el contenido semantico.
- Generacion de timestamps a nivel de frase y de palabra, util para subtitulado y alineacion.
- Manejo de audio largo mediante algoritmos de chunking secuencial o con ventana deslizante, dado el receptive field de 30 segundos.
- Soporte de decodificacion con temperature fallback, condition on previous tokens y otros heuristicos de generacion.
- Compatible con el pipeline de transformers y con estrategias de decodificacion avanzadas (beam search, sampling, etc.).
- Capacidad de procesamiento por lotes (batch) para multiples archivos de audio en paralelo.

## Casos de uso

- Transcripcion de reuniones y videollamadas: el modelo puede transcribir audio en tiempo real o grabado, con timestamps por intervencion, gracias a su baja latencia y soporte de audio largo mediante chunking.
- Generacion de subtitulos para video: permite obtener subtitulos en multiples idiomas a partir de una pista de audio, con timestamps a nivel de palabra para sincronizacion precisa.
- Atencion al cliente automatizada: integrable en sistemas de IVR o chatbots para transcribir llamadas, detectar idioma y extraer informacion relevante, con la ventaja de la licencia MIT para uso comercial.
- Asistentes de voz y dictado: adecuado para aplicaciones de dictado en tiempo real en dispositivos con GPU consumer, gracias a su tamano reducido y velocidad de inferencia.
- Analisis de contenido multimedia: transcripcion de podcasts, entrevistas o archivos de audio para indexacion, busqueda y analisis posterior.
- Traduccion simultanea de conferencias: la funcion de speech translation permite convertir discursos en otros idiomas a texto en ingles, util para subtitulado en eventos internacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para este fine-tune en la informacion disponible. El modelo base whisper-large-v3-turbo de OpenAI presenta una degradacion menor de calidad respecto al large-v3 original, segun la discusion oficial de OpenAI, pero no se proporcionan numeros concretos en la documentacion consultada. Se recomienda evaluar el modelo en el conjunto de datos objetivo antes de su despliegue en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,6 GB en fp16 y 3,2 GB en fp32, lo que permite ejecutarlo en GPUs consumer con 4 GB o mas de memoria.
- GPUs recomendadas: NVIDIA RTX 3060, RTX 4060, RTX 4090, o cualquier GPU con soporte CUDA y al menos 4 GB de VRAM. Tambien funciona en CPU, aunque con mayor latencia.
- Cabe en GPUs consumer: si, en la mayoria de tarjetas modernas con 4 GB o mas.
- Opciones de despliegue: transformers (pipeline), vLLM, TGI, llama.cpp (mediante versiones GGUF), Ollama (con adaptadores), y servicios en la nube como Groq.
- Latencia y throughput: no disponible en la informacion proporcionada, aunque se espera una velocidad significativamente mayor que whisper-large-v3 debido a la reduccion de capas del decodificador.

## Comparativa con modelos similares

| Modelo | Parametros | Capas decoder | Contexto | Licencia | Velocidad relativa |
|---|---|---|---|---|---|
| whisper-large-v3 | 1550 M | 32 | 30 s | MIT | 1x (referencia) |
| whisper-large-v3-turbo (este) | 809 M | 4 | 30 s | MIT | ~4-6x mas rapido |
| whisper-medium | 769 M | 24 | 30 s | MIT | ~2x mas rapido que large-v3 |
| whisper-small | 244 M | 12 | 30 s | MIT | ~8x mas rapido que large-v3 |

El modelo turbo ofrece un equilibrio entre precision y velocidad, siendo aproximadamente 4-6 veces mas rapido que large-v3 con una perdida de calidad menor. Comparado con whisper-medium, tiene un tamano similar pero una arquitectura mas eficiente gracias a la poda del decodificador.

## Limitaciones y advertencias

- Alucinaciones en audio sin voz o con mucho ruido de fondo, especialmente en segmentos de silencio o musica, un problema conocido en la familia Whisper.
- Contexto limitado a 30 segundos por chunk; para audio mas largo se requiere chunking, lo que puede introducir errores en los limites entre segmentos.
- Degradacion de calidad respecto a whisper-large-v3, especialmente en idiomas poco representados o con acentos muy marcados.
- El fine-tune de SwinliQ-AI-2 no documenta el proceso de ajuste, por lo que no se puede garantizar que mantenga exactamente las mismas capacidades que el modelo turbo original.
- La deteccion automatica de idioma puede fallar en audio multilingue o con codigos de idioma ambiguos.
- No se proporcionan datos de rendimiento especificos para este checkpoint, por lo que se recomienda validar en el caso de uso concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SwinliQ-AI-2/whisper-large-v3-turbo
- Modelo original de OpenAI: https://huggingface.co/openai/whisper-large-v3-turbo
- Paper de Whisper: https://huggingface.co/papers/2212.04356
- Discusion sobre la poda del decodificador: https://github.com/openai/whisper/discussions/2363
- Version GGUF del modelo: https://huggingface.co/xkeyC/whisper-large-v3-turbo-gguf
