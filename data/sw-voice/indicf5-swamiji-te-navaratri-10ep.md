# sw-voice/indicf5-swamiji-te-navaratri-10ep

## Resumen

IndicF5-swamiji-te-navaratri-10ep es un checkpoint de investigación de síntesis de voz (text-to-speech) en telugu, obtenido mediante fine-tuning del modelo ai4bharat/IndicF5. Lo publica el usuario sw-voice dentro de la serie de experimentos swamiji-tts (conjunto 07, experimento 03), y su objetivo es reproducir la voz y el estilo de las charlas de Navaratri de Sri Ganapathy Sachchidananda Swamiji en telugu. El modelo parte de la arquitectura F5-TTS (un transformer de flow matching para TTS zero-shot) y conserva el vocabulario y el tokenizador propios de IndicF5.

El interés técnico del checkpoint es doble. Por un lado, demuestra que con un corpus muy pequeño (402 clips, 1,79 horas, 24 kHz) y un único H100 durante 4,2 minutos es posible adaptar un modelo TTS multilingüe a una voz concreta con una similitud de voz del 95,7 % respecto a la referencia real. Por otro, documenta con detalle la receta de fine-tuning (LR 1e-5, 10 épocas, 710 actualizaciones, batch de 9.600 frames, bf16) y las condiciones de inferencia (float32 obligatorio, nfe 32, cfg 2), lo que lo convierte en una referencia útil para quien quiera replicar el proceso.

Se trata de un modelo de nicho: 337 millones de parámetros, un solo idioma (telugu), licencia de solo investigación y sin descargas ni valoraciones en el momento de redactar esta ficha. No es un modelo de propósito general, sino una pieza de un pipeline experimental de clonación y adaptación de voz.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | F5-TTS (flow matching sobre transformer, config F5TTS_Base), fine-tune de ai4bharat/IndicF5 |
| Parámetros totales | 337.096.836 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (TTS condicionado por clip de referencia y su transcripción) |
| Tipos de cuantización | no disponible; el autor indica que debe usarse float32 (float16 produce ruido) |
| Idiomas soportados | telugu (te) |
| Licencia | research-only (solo investigación) |
| Formato de pesos | safetensors (claves `ema_model.*`, float32) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura F5-TTS: un transformer con objective de flow matching que genera mel-espectrogramas condicionados por texto y por un clip de referencia con su transcripción, y que después se convierte a audio mediante un vocoder. El checkpoint se entrena con la receta upstream SWivid/F5-TTS 1.1.22 (`finetune_cli`) sobre la configuración F5TTS_Base, manteniendo el vocabulario y el tokenizador `custom` de IndicF5, lo que preserva la tokenización específica del modelo base para lenguas indias.

Los datos de entrenamiento son el dataset sw-voice/swamiji-navaratri-telugu-reuse: 402 clips, 1,79 horas de audio a 24 kHz con transcripciones generadas por Gemini. El fine-tuning usa LR 1e-5, 10 épocas (710 actualizaciones), batch de 9.600 frames, 70 pasos de warm-up y precisión bf16, y se completa en 4,2 minutos sobre una H100. Los pesos publicados son los online del último update en float32, guardados bajo las claves `ema_model.*` para que el `load_checkpoint` de F5 upstream los lea con `use_ema`. No se documenta en la información disponible el uso de RLHF, DPO ni otras fases de alineación posteriores.

## Capacidades

- Síntesis de voz en telugu condicionada por texto y por un clip de referencia con su transcripción (zero-shot voice cloning dentro del dominio de la voz entrenada).
- Imitación de voz y estilo: similitud de voz del 95,7 % (WavLM-ECAPA, porcentaje de real frente a real) con la voz de referencia de las charlas de Navaratri.
- Prosodia y naturalidad: dispersión de pitch de 4,03 semitonos frente a 4,55 del audio real, y puntuaciones Gemini de prosodia, vivacidad y adecuación espiritual de 4,00, 3,85 y 3,98 sobre 5.
- Control de generación mediante parámetros de inferencia: nfe 32, cfg 2, sway −1 y speed 1 en la evaluación del autor.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking; es un modelo exclusivamente TTS.

## Casos de uso

- Clonación de voz para archivo documental: a partir de un clip de referencia de 10 segundos y su transcripción, el modelo genera nuevas locuciones en telugu con la voz del hablante original, útil para preservar y ampliar material de archivo de charlas espirituales.
- Generación de audiolibros y discursos en telugu: dado que el modelo imita el timbre y la prosodia de la referencia, permite narrar textos largos manteniendo la identidad sonora del orador.
- Investigación en adaptación de TTS con pocos datos: la receta publicada (402 clips, 1,79 h, 4,2 minutos en H100) sirve como caso de estudio reproducible para experimentos de fine-tuning de F5-TTS en lenguas de bajos recursos.
- Evaluación comparativa de sistemas TTS: el autor publica métricas de similitud de voz, WER/CER con Sarvam saaras:v4 y juicios de prosodia, lo que permite usar el checkpoint como baseline en estudios de calidad de voz en telugu.
- Prototipado de asistentes de voz en telugu para entornos controlados de investigación: el modelo puede integrarse en un pipeline de TTS condicionado por referencia para probar interacciones habladas antes de invertir en un modelo de producción.
- Doblaje y localización experimental de contenido religioso o cultural: con la referencia adecuada, permite generar versiones en telugu de guiones escritos manteniendo el estilo del hablante, siempre dentro del ámbito de investigación que impone la licencia.

## Benchmarks y rendimiento

| Métrica | Este modelo | IndicF5 zero-shot | best-vox (VoxCPM2) |
|---|---|---|---|
| Similitud de voz, WavLM-ECAPA (% de real frente a real) | 95,7 | 89,8 | 96,6 |
| WER, Sarvam saaras:v4 (%) | 5,5 | 6,1 | 7,8 |
| CER, Sarvam saaras:v4 (%) | 0,37 | 0,37 | 0,92 |
| Dispersión de pitch (semitonos; real 4,55) | 4,03 | 3,66 | 4,17 |
| Prosodia Gemini (frente a best-vox en los mismos pares) | 4,00 vs 3,25 | 4,19 vs 3,44 | no disponible |
| Vivacidad Gemini (frente a best-vox) | 3,85 vs 3,26 | 3,98 vs 3,48 | no disponible |
| Adecuación espiritual Gemini (frente a best-vox) | 3,98 vs 3,43 | 4,13 vs 3,62 | no disponible |
| Respuestas ganadas en ambos órdenes de clip (frente a best-vox) | 6 vs 1 | 5 vs 2 | no disponible |

La evaluación se realizó sobre 10 respuestas completas en telugu con semillas 0 y 1, usando el clip de referencia `p3R1wZLty6A_029` (10 s) con nfe 32, cfg 2, sway −1 y speed 1.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 337 millones de parámetros en float32, los pesos ocupan aproximadamente 1,3 GB, a lo que hay que sumar el vocoder y el cómputo de flow matching.
- GPU recomendadas: el autor entrenó con una H100; para inferencia, cualquier GPU con suficiente memoria para float32 (por ejemplo, A100, H100 o RTX 4090) debería ser suficiente, aunque no se documentan requisitos mínimos.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas con 8 GB o más, pero el dato no está confirmado en la información disponible.
- Opciones de despliegue: la librería f5-tts con la configuración F5TTS_Base y el `vocab.txt` del repositorio; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para este tipo de modelo.
- Latencia y throughput: no disponibles; solo se conoce el tiempo de entrenamiento (4,2 minutos en una H100 para 710 actualizaciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (IndicF5 fine-tune Navaratri) | 337 M | telugu | no disponible | research-only | HuggingFace, 0 descargas |
| ai4bharat/IndicF5 | no disponible en la información | lenguas indias (incluido telugu) | no disponible | MIT según su card, con datos de entrenamiento no comerciales (IIT-Madras IndicTTS) | HuggingFace |
| best-vox (VoxCPM2) | no disponible | no disponible | no disponible | no disponible | usado como referencia en la evaluación del autor |

## Limitaciones y advertencias

- Licencia de solo investigación: el autor advierte que, aunque la card de IndicF5 indica MIT, sus datos de entrenamiento incluyen IIT-Madras IndicTTS, que es no comercial; no debe usarse en producción ni con fines comerciales.
- Un solo idioma: el modelo está entrenado y evaluado únicamente en telugu; no se garantiza un comportamiento correcto en otras lenguas.
- Dominio muy restringido: la voz y el estilo se limitan a las charlas de Navaratri del hablante de referencia; fuera de ese dominio la similitud y la naturalidad pueden degradarse.
- Requisito de float32: el autor indica que los pesos de la familia IndicF5 producen ruido en float16, lo que incrementa el coste de memoria en inferencia.
- Dependencia de un clip de referencia y su transcripción: la inferencia exige ambos elementos, y la calidad del resultado depende de su calidad.
- Riesgo de alucinación acústica y errores de pronunciación: el WER del 5,5 % y el CER del 0,37 % en la evaluación indican que aún se producen errores de contenido, que pueden aumentar con textos fuera del dominio de entrenamiento.
- Corpus de entrenamiento pequeño (1,79 horas) y transcripciones generadas automáticamente por Gemini, lo que puede introducir sesgos y errores sistemáticos.
- Sin descargas ni validación comunitaria en el momento de la ficha: no hay evidencia externa de robustez más allá de la evaluación del propio autor.
- Uso ético: al ser un modelo de clonación de voz, su uso debe limitar a investigación con consentimiento y sin suplantación de identidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sw-voice/indicf5-swamiji-te-navaratri-10ep
- Modelo base: https://huggingface.co/ai4bharat/IndicF5
- Dataset de entrenamiento: https://huggingface.co/datasets/sw-voice/swamiji-navaratri-telugu-reuse
- Repositorio upstream F5-TTS: https://github.com/SWivid/F5-TTS
