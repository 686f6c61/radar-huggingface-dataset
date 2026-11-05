# yusufblbl/whisper-large-v3-turbo-turkish-verasist

## Resumen

Whisper Large v3 Turbo Turkish — Verasist es un modelo de reconocimiento automático del habla (ASR) especializado en turco, desarrollado por el usuario yusufblbl y asociado al servicio verasist.ai. Se construye mediante un ajuste fino con LoRA sobre el modelo `selimc/whisper-large-v3-turbo-turkish`, que a su vez deriva de OpenAI Whisper Large v3 Turbo. El problema que aborda es la transcripción precisa de audio en turco, un idioma con relativamente pocos recursos ASR de calidad en comparación con el inglés.

El modelo emplea la arquitectura encoder-decoder transformer de Whisper (familia large-v3-turbo), con aproximadamente 809 millones de parámetros totales en el paquete publicado. El ajuste se realizó sobre un subconjunto del dataset `cubukcum/TurkishVoiceDataset` (unos 74,86 horas de entrenamiento y 1,91 horas de validación), con cuatro rondas de entrenamiento LoRA sobre GPU consumer (RTX 4060 Ti de 8 GB). El resultado declarado es una reducción del WER de validación del 11,9936 % al 7,5895 % respecto al modelo base de partida.

Es relevante ahora porque demuestra que es posible obtener mejoras sustanciales en ASR de un idioma específico con recursos de hardware muy limitados y una licencia permisiva (MIT), lo que facilita su adopción en productos comerciales de transcripción en turco. No obstante, el propio autor advierte que la métrica procede de un split de validación usado para seleccionar el checkpoint, por lo que no equivale a un benchmark independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo) con ajuste LoRA |
| Parametros totales | 808.878.080 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Ventana de audio de 30 segundos por segmento (estándar de Whisper); no disponible un contexto en tokens equivalente |
| Tipos de cuantizacion | El repo publica pesos Safetensors en FP32 (exportación); el entrenamiento usó BF16; no se documentan cuantizaciones GGUF/INT8 en la información disponible |
| Idiomas soportados | Turco (tr) |
| Licencia | MIT |
| Formato de pesos | Safetensors (modelo fusionado) y adaptador LoRA en `adapter/` |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Whisper large-v3-turbo, un transformer encoder-decoder diseñado para ASR que procesa audio en ventanas de 30 segundos. Sobre los pesos base congelados se aplicó un ajuste fino con LoRA dirigido a los módulos `q_proj` y `v_proj`, con rank final 32, alpha 64 y dropout 0,05, lo que supone 6.553.600 parámetros entrenables en el adaptador final. El entrenamiento se realizó en BF16 sobre una NVIDIA RTX 4060 Ti de 8 GB, con batch 2 y acumulación de gradiente 8 (batch efectivo 16), gradient checkpointing, scheduler cosine, weight decay 0,01 y clipping de gradiente 1,0.

Se completaron cuatro rondas completas de entrenamiento (4.612 pasos de optimizador por ronda), cada una partiendo del mejor adaptador seleccionado de la ronda anterior, con semillas 42, 43, 44 y 45. El checkpoint publicado corresponde al paso 2000 de la cuarta ronda, no al paso final. En la tercera ronda se amplió el rank de 16 a 32 preservando matemáticamente la actualización LoRA previa (columnas B nuevas inicializadas a cero). Los datos provienen de `cubukcum/TurkishVoiceDataset` (revisión `0392c61c74009df6ec538880211642b0fc1061d0`), con 73.778 registros de entrenamiento (≈74,86 h) y 1.884 de validación (≈1,91 h, 9.355 palabras de referencia). Se eliminaron audios duplicados, etiquetas contradictorias y silencios digitales, y los splits se separaron por hash SHA-256 del texto normalizado y del audio codificado. La evaluación se hizo cada 250 pasos sobre el conjunto completo de validación, con WER calculado como ratio global de errores sobre palabras de referencia (no media de WER por registro) y normalización Unicode NFC, conversión turca I/İ, minúsculas y separación de puntuación. No se documenta RLHF ni DPO.

## Capacidades

- Transcripción de voz a texto en turco (pipeline `automatic-speech-recognition`).
- Procesamiento de audio de entrada en fragmentos cortos, preferiblemente mono a 16 kHz.
- Manejo de ventanas de audio de hasta 30 segundos por segmento (estándar Whisper); para grabaciones largas requiere detección de actividad de voz y segmentación previa.
- Generación de transcripciones con normalización de puntuación y mayúsculas según el tokenizador de Whisper.
- Capacidad multilingüe limitada: el modelo está especializado y etiquetado únicamente para turco, aunque hereda la arquitectura multilingüe de Whisper large-v3-turbo.
- Soporte de ejecución vía `transformers` con `AutoModelForSpeechSeq2Seq`, `AutoProcessor` y `pipeline`.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de salida ni modo thinking.

## Casos de uso

- Transcripción de reuniones y entrevistas en turco: el modelo convierte audio de voz en texto con una tasa de error de validación declarada del 7,59 %, adecuada para actas internas y documentación siempre que se aplique segmentación previa en grabaciones largas.
- Subtitulado automático de contenido audiovisual turco: integrado en un pipeline con detección de voz y troceado en ventanas de 30 segundos, genera transcripciones base que luego pueden revisarse manualmente para subtítulos.
- Atención al cliente y análisis de llamadas: permite transcribir grabaciones telefónicas en turco para su posterior análisis de sentimiento o extracción de entidades, aunque el autor advierte que el rendimiento en audio telefónico ruidoso requiere pruebas específicas.
- Dictado y notas de voz en aplicaciones: al ser un modelo de 809 millones de parámetros con licencia MIT, puede desplegarse en infraestructura propia para convertir notas de voz de usuarios turcos en texto editable.
- Generación de corpus y datasets: útil para crear transcripciones a gran escala de audio turco que sirvan como material de entrenamiento o indexación de contenido, con revisión humana posterior dado que las referencias no están mayoritariamente verificadas por humanos.
- Búsqueda y accesibilidad sobre archivos de audio: transcripción de podcasts, clases o archivos históricos en turco para habilitar búsqueda por texto y accesibilidad para personas con discapacidad auditiva.
- Prototipado e investigación ASR de bajo presupuesto: el modelo demuestra un flujo de ajuste LoRA reproducible en una GPU de 8 GB, sirviendo de referencia para experimentos con otros idiomas o dominios.

## Benchmarks y rendimiento

Los únicos datos publicados son los de validación interna del autor, sobre un split usado para seleccionar el checkpoint. No constituyen un benchmark independiente ni cubren Common Voice u otros conjuntos públicos.

| Modelo / ronda | LoRA r / alpha | LR inicial | Paso seleccionado | WER de validación (%) |
|---|---|---|---|---|
| Modelo base de partida | — | — | — | 11,9936 |
| Ronda 1 | 16 / 32 | 5e-5 | 4250 | 8,2630 |
| Ronda 2 | 16 / 32 | 2e-5 | 1750 | 8,0278 |
| Ronda 3 | 32 / 64 | 2e-5 | 4500 | 7,7071 |
| Ronda 4 (publicado) | 32 / 64 | 1e-5 | 2000 | 7,5895 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, Common Voice) en la información disponible. El conjunto de test reservado (1.973 registros, ≈2 h) aún no ha sido evaluado según la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16/BF16, aproximadamente 1,6-2 GB para los pesos (809 M de parámetros) más overhead de activaciones y buffers de audio; en FP32, alrededor de 3,2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; A100, H100 o RTX 4090 ofrecen holgura y mayor throughput, aunque el modelo es pequeño.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060 Ti, RTX 4070 o superiores; el propio autor entrenó en una RTX 4060 Ti de 8 GB.
- Opciones de despliegue: `transformers` con `pipeline` (documentado en la model card); vLLM, llama.cpp, Ollama o TGI no están documentados para este modelo en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada. El autor indica que no es un sistema de STT en streaming y que el uso de FP16 no se midió respecto al WER de validación completo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | WER turco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yusufblbl/whisper-large-v3-turbo-turkish-verasist | 808,9 M | 30 s por segmento | 7,5895 % (validación propia) | MIT | HuggingFace |
| selimc/whisper-large-v3-turbo-turkish (base) | no disponible en la información | 30 s por segmento | 11,9936 % (mismo split) | MIT | HuggingFace |
| openai/whisper-large-v3-turbo | no disponible en la información | 30 s por segmento | no disponible | MIT (según la familia Whisper) | HuggingFace |

No se dispone de datos comparativos con otros modelos ASR turcos (por ejemplo, variantes de Wav2Vec2 o MMS) en la información proporcionada.

## Limitaciones y advertencias

- El WER del 7,5895 % procede de un split de validación utilizado para seleccionar el checkpoint; no es un resultado de test independiente y no debe interpretarse como rendimiento garantizado.
- El conjunto de test reservado (≈2 h) no ha sido evaluado, por lo que falta una medición limpia del rendimiento real.
- No hay metadatos de hablante, por lo que no se garantiza independencia de hablante entre entrenamiento y validación.
- Las referencias del dataset no están mayoritariamente verificadas por humanos; los resultados son provisionales.
- Rendimiento no validado en nombres propios, números, negaciones, acentos y audio telefónico ruidoso; el autor recomienda pruebas específicas por dominio.
- En entradas silenciosas o ruidosas, Whisper puede generar texto alucinado sin habla real.
- El modelo no es un sistema de STT en streaming y requiere segmentación previa para audio largo.
- El WER reportado corresponde al modelo BF16 + LoRA seleccionado; el paquete fusionado en FP32 no fue reevaluado con el WER completo.
- Especializado únicamente en turco; no se debe esperar calidad equivalente en otros idiomas pese a la arquitectura multilingüe de origen.
- Licencia MIT: permite uso comercial, pero conviene conservar el aviso de copyright y verificar las obligaciones heredadas del modelo base y de OpenAI Whisper.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yusufblbl/whisper-large-v3-turbo-turkish-verasist
- Modelo base: https://huggingface.co/selimc/whisper-large-v3-turbo-turkish
- Modelo original de OpenAI: https://huggingface.co/openai/whisper-large-v3-turbo
- Dataset de entrenamiento: https://huggingface.co/datasets/cubukcum/TurkishVoiceDataset
- Servicio de prueba del autor: https://verasist.ai
