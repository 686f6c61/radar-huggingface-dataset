# wilsonzheng0327/Qwen3-ASR-0.6B-dflash

## Resumen

Qwen3-ASR-0.6B-dflash es un modelo borrador (*draft*) para decodificación especulativa greedy sobre el modelo de reconocimiento automático de voz Qwen3-ASR-0.6B de Alibaba Qwen. Lo publica el usuario wilsonzheng0327 en HuggingFace bajo licencia Apache 2.0 y la librería `speculators`, y no es un modelo ASR autónomo: es un acelerador que propone tokens que el modelo objetivo verifica en paralelo, reduciendo el número de pasos de decodificación necesarios para transcribir audio.

El borrador es deliberadamente pequeño: 131.154.432 parámetros reales en safetensors (frente a los 0,6B del objetivo), con 5 capas transformer de estilo Qwen3 (hidden 1024, 16 cabezas de atención y 8 de KV, head_dim 128) y una cabeza de salida con vocabulario reducido a 48.000 tokens. Incorpora dos innovaciones relevantes: el esquema DFlash de bloques causales de tamaño 8 (7 propuestas por ronda) y un entrenamiento en dos fases que evita el colapso en audio largo, con ventana deslizante de 32.768 tokens y entrenamiento sobre grabaciones de hasta 240 segundos.

Su relevancia es práctica: la decodificación especulativa es una de las pocas técnicas que acelera la inferencia sin degradar la calidad de la transcripción, y este borrador está especializado en tres idiomas (inglés, chino y japonés) con datos de audio reales. Para quien despliegue ASR con Qwen3-ASR-0.6B en producción, este checkpoint ofrece una vía de reducción de latencia con licencia permisiva y un formato compatible con la infraestructura de `speculators`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer borrador para decodificación especulativa DFlash: 5 capas Qwen3 (hidden 1024, intermediate 3072, 16 cabezas / 8 KV, head_dim 128), `fc`, `hidden_norm`, `norm`, `lm_head` reducido con mapeos `d2t`/`t2d` |
| Parametros totales | 131.154.432 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana deslizante de 32.768 tokens; entrenado con grabaciones de hasta 240 s |
| Tipos de cuantizacion | no disponible (checkpoint publicado en bf16) |
| Idiomas soportados | inglés, chino y japonés (según datos de entrenamiento; la model card no declara lista oficial de idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `speculators`, con `custom_code`) |

## Arquitectura y entrenamiento

El borrador sigue el layout de `mattymchen/Qwen3-ASR-1.7B-speculator.dflash`: 5 capas Qwen3 con estados ocultos auxiliares extraídos de las capas 2, 14 y 25 del modelo objetivo, un `fc` de proyección, `hidden_norm` y `norm`, y un `lm_head` de vocabulario reducido (48.000 tokens, el 99,7% de los tokens de etiqueta de entrenamiento; existe una variante de 32.000 en `-32k`) construido con filas congeladas del embedding atado del objetivo y mapeos `d2t`/`t2d`. La decodificación especulativa usa bloques causales de tamaño 8: 7 propuestas por ronda con el último token confirmado como ancla y el token de máscara 151705.

El entrenamiento se hizo en dos fases sobre unas 1.600 horas de audio (51% inglés, 28% chino, 21% japonés por clip): LibriSpeech train-clean-360, People's Speech clean, VoxPopuli en, Emilia-YODAS en/zh/ja (excluyendo la parte CC BY-NC), AISHELL-1, Common Voice 17 ja y FLEURS en/zh/ja train. Las etiquetas son las transcripciones greedy del propio objetivo generadas con vLLM (contexto de sistema vacío, idioma automático), de modo que la salida conserva el prefijo `language X<asr_text>`. La fase 1 usó `DFlashDraftModel` con pérdida de entropía cruzada y pesos posicionales D-Pace, AdamW con lr 6e-4, warmup del 4%, coseno, 10 épocas sobre 591.786 clips de 0,5-30 s, batches empaquetados de 16k tokens y hasta 3.072 anclas por batch en una H100. La fase 2 añadió 4 épocas sobre 23.928 grabaciones largas (30-240 s) más 150.000 clips cortos, elevando la ventana a 32.768; sin esta fase, la aceptación en audio de 60 s caía a ~1,5.

## Capacidades

- Generación de propuestas de tokens para decodificación especulativa greedy sobre Qwen3-ASR-0.6B y Qwen3-ASR-0.6B-hf.
- Aceleración de transcripción ASR multilingüe en inglés, chino y japonés.
- Mantenimiento del formato de salida del objetivo, incluido el prefijo `language X<asr_text>`.
- Funcionamiento con audio corto (0,5-30 s) y audio largo (hasta 240 s) gracias a la ventana deslizante de 32.768.
- Variante de vocabulario reducido a 32.000 tokens (`-32k`) para menor coste de verificación.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un componente de inferencia, no un modelo conversacional.
- No tiene capacidades de visión ni audio nativas propias; opera sobre los estados ocultos y tokens del objetivo.

## Casos de uso

- Transcripción por lotes de reuniones y podcasts: el borrador permite verificar varios tokens por paso del objetivo, reduciendo el número de rondas de decodificación en grabaciones largas (aceptación media de 5,19 en el conjunto agregado y 6,21 en inglés de 180 s), lo que se traduce en menor latencia agregada.
- Subtitulado en tiempo casi real: con audio corto (0,5-30 s) la aceptación es de 6,36 en LibriSpeech clean y 5,64 en FLEURS en, adecuado para pipelines que transcriben fragmentos consecutivos con presupuesto de latencia ajustado.
- Servicio ASR multilingüe en inglés, chino y japonés: los datos de entrenamiento cubren los tres idiomas con aceptación de 5,95 (en), 5,29 (zh) y 4,33 (ja) en el agregado, útil para plataformas de atención al cliente con mezcla de idiomas.
- Procesamiento de llamadas y notas de voz: la fase 2 está entrenada específicamente con grabaciones de 30-240 s, lo que encaja con la duración típica de una llamada de soporte o un mensaje de voz largo.
- Reducción de coste en infraestructura de inferencia: al disminuir las rondas de verificación del modelo de 0,6B, se reduce el uso de GPU por hora de audio transcrito en despliegues con vLLM.
- Evaluación e investigación en decodificación especulativa: el checkpoint y sus variantes (48k y 32k) permiten reproducir los experimentos de aceptación por idioma y duración de audio publicados en la model card.
- Integración en sistemas de accesibilidad: transcripción de audio en directo para subtítulos con requisitos de latencia estrictos, aprovechando el borrador como capa de aceleración sin cambiar el modelo objetivo.

## Benchmarks y rendimiento

La model card publica longitudes de aceptación (*accept length*) en decodificación especulativa greedy simulada en CUDA con bf16: desde cada ancla el borrador propone 7 tokens, se acepta el prefijo más largo que coincide con la transcripción greedy del objetivo y el objetivo añade uno. Se mide como tokens generados / rondas.

| Draft | Libri clean | Libri other | FLEURS en | Emilia en | FLEURS zh | Emilia zh | CV ja | FLEURS ja | Emilia ja | all | 60 s en | 60 s zh | 60 s ja | 180 s en | 180 s zh | 180 s ja |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Este draft (48k), Qwen3-ASR-0.6B | 6,36 | 5,83 | 5,64 | 5,86 | 5,34 | 5,26 | 4,27 | 4,67 | 4,04 | 5,19 | 6,18 | 5,50 | 4,46 | 6,21 | 5,57 | 4,44 |
| Variante 32k | 6,09 | 5,66 | 5,23 | 5,68 | 4,91 | 5,18 | 4,26 | 4,66 | 4,03 | 5,04 | 5,90 | 5,22 | 4,45 | 5,95 | 5,24 | 4,44 |
| Solo fase 1 (clips cortos), 0,6B | 6,43 | 5,86 | 5,59 | 5,88 | 5,25 | 5,30 | 4,26 | 4,58 | 4,03 | 5,17 | 1,30 | 1,38 | 1,36 | 1,15 | 1,19 | 1,19 |
| Referencia: draft 1.7B de mattymchen sobre Qwen3-ASR-1.7B | 6,23 | 5,94 | 4,72 | 5,08 | 5,04 | 4,34 | 2,10 | 2,09 | 2,09 | 3,51 | 5,45 | 4,76 | 1,87 | 2,94 | 2,96 | 1,54 |

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 0,3 GB en el repositorio y 131M parámetros en bf16 (~0,26 GB de pesos); debe sumarse la memoria del modelo objetivo Qwen3-ASR-0.6B y el estado de decodificación especulativa.
- GPU recomendadas: el entrenamiento se hizo en una H100; para inferencia basta una GPU con suficiente VRAM para el objetivo más el borrador, como A100, H100, L40S o RTX 4090.
- Cabe en GPU de consumo: sí, en RTX 4090 y probablemente en GPUs con 16-24 GB, siempre que quepa también el modelo objetivo y el contexto de audio.
- Opciones de despliegue: la librería `speculators` con `custom_code`; el borrador está diseñado para el runtime de vLLM usado para generar las etiquetas, por lo que el despliegue esperado es vLLM con decodificación especulativa. No hay confirmación de soporte en llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles de forma absoluta; la model card solo reporta longitudes de aceptación, no tokens por segundo ni latencia en milisegundos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Aceptación agregada (all) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-ASR-0.6B-dflash (este) | 131M | 32.768 (hasta 240 s) | 5,19 | Apache 2.0 | HuggingFace, 18 descargas |
| Variante 32k del mismo draft | no disponible | 32.768 | 5,04 | Apache 2.0 | HuggingFace |
| mattymchen/Qwen3-ASR-1.7B-speculator.dflash | no disponible | no disponible | 3,51 | no disponible | HuggingFace |
| Qwen3-ASR-0.6B (modelo objetivo) | ~0,6B | no disponible | no aplica (no es draft) | Apache 2.0 | HuggingFace |

El borrador de 0,6B supera en aceptación agregada al draft de referencia de 1.7B (5,19 frente a 3,51), especialmente en japonés (4,33 frente a 2,09) y en audio de 60 y 180 segundos, donde el de 1.7B cae a 1,54-2,96. La variante de 32k sacrifica algo de aceptación (5,04) a cambio de un vocabulario menor.

## Limitaciones y advertencias

- No es un modelo ASR autónomo: sin el objetivo Qwen3-ASR-0.6B no produce transcripciones.
- Solo funciona con decodificación greedy; no se han publicado resultados para sampling o beam search.
- Cobertura lingüística limitada a inglés, chino y japonés; otros idiomas no están evaluados y probablemente degraden la aceptación.
- La fase 1 por sí sola colapsa en audio largo (aceptación ~1,3-1,5 a 60 s), por lo que es imprescindible usar el checkpoint de la fase 2 para grabaciones largas.
- El vocabulario reducido (48k o 32k) puede limitar la aceptación en dominios con vocabulario fuera de la distribución de entrenamiento.
- Riesgo de alucinación heredado del objetivo: el borrador solo propone tokens que el objetivo verifica, pero la transcripción final puede contener errores del modelo base.
- Sesgos de los datos de entrenamiento (LibriSpeech, People's Speech, VoxPopuli, Emilia-YODAS, AISHELL-1, Common Voice 17, FLEURS) en cuanto a acentos, calidad de grabación y dominio.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo objetivo y de los datasets utilizados (Emilia-YODAS excluye la parte CC BY-NC).
- El repositorio tiene solo 18 descargas y 0 likes, por lo que la validación comunitaria es muy limitada; conviene evaluar en el dominio propio antes de producción.

## Enlaces

- HuggingFace: https://huggingface.co/wilsonzheng0327/Qwen3-ASR-0.6B-dflash
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Variante HF del base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B-hf
- Referencia de layout DFlash: https://huggingface.co/mattymchen/Qwen3-ASR-1.7B-speculator.dflash
- Librería `speculators`: no disponible
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
