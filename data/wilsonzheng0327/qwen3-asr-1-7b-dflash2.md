# wilsonzheng0327/Qwen3-ASR-1.7B-dflash2

## Resumen

Qwen3-ASR-1.7B-dflash2 es un modelo borrador (draft model) para decodificación especulativa codiciosa sobre el modelo de reconocimiento de voz Qwen3-ASR-1.7B de Alibaba Qwen. No es un modelo de ASR autónomo: es un acelerador que propone tokens que el modelo objetivo verifica, de modo que la generación completa sea más rápida sin alterar la salida. Lo publica el usuario wilsonzheng0327 bajo licencia Apache 2.0 y el formato de la librería `speculators` (`dflash2`).

El checkpoint contiene 353,2 millones de parámetros en bf16 (backbone de 264,3 M, selector de 78,3 M y convoluciones de 10,6 M) y reutiliza la cabeza de salida (`lm_head`) del modelo objetivo, por lo que no incluye vocabulario propio. Su arquitectura parte del borrador DFlash publicado previamente y añade dos componentes propios de DFlash2: convoluciones causales dinámicas agrupadas y un selector de candidatos que reordena el top-16 de la cabeza objetivo en cada posición. El bloque de propuesta es de 8 posiciones (7 propuestas por ronda) con ventana deslizante de 32.768 tokens.

Su relevancia es doble. Por un lado, documenta con rigor un resultado negativo muy útil: en decodificación simulada acepta entre un 5,0 % y un 6,1 % más tokens por ronda que el borrador DFlash publicado, pero ese aumento no se traduce en aceleración real bajo sglang-omni en una H200, porque cada ronda cuesta más. Por otro, es un piloto que requiere un parche local no publicado para cargarse en SGLang 0.5.23, lo que lo sitúa en la frontera experimental de la decodificación especulativa más que en el catálogo de modelos listos para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo draft para decodificación especulativa (DFlash2): backbone de 5 capas Qwen3 + convoluciones causales dinámicas agrupadas + selector de candidatos |
| Parametros totales | 353.150.208 (backbone 264,3 M, selector 78,3 M, convoluciones 10,6 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana deslizante de 32.768 tokens |
| Tipos de cuantizacion | no disponible (checkpoint distribuido en bf16) |
| Idiomas soportados | en, zh, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom_code, librería `speculators`) |
| Modelo base | Qwen/Qwen3-ASR-1.7B (y Qwen/Qwen3-ASR-1.7B-hf) |
| Tamano del repositorio | 0,7 GB |
| Precision | bf16 (convertido desde el checkpoint de entrenamiento en float32) |
| Tamano de bloque | 8 (7 propuestas por ronda, ancla = último token confirmado, causal dentro del bloque) |
| Token de máscara | 151705 |
| Capas auxiliares del objetivo | 2, 14 y 25 (estados ocultos que entran en esas capas) |
| Vocabulario | 151.936 tokens (compartido con el objetivo, sin `lm_head` propio) |

## Arquitectura y entrenamiento

El modelo es un borrador de decodificación especulativa construido sobre el backbone del DFlash draft publicado (`wilsonzheng0327/Qwen3-ASR-1.7B-dflash`, revisión `d62bd4051e`). El backbone conserva los componentes `fc`, `hidden_norm`, `norm` y cinco capas Qwen3 con dimensión oculta 2048, intermedia 6144, 16 cabezas de atención y 8 cabezas KV con dimensión de cabeza 128. Sobre esa base, DFlash2 incorpora convoluciones causales dinámicas agrupadas (kernel 2, grupo 16, inicializadas como identidad) y un selector con rango 256 que reordena el top-16 de candidatos de la cabeza del objetivo en cada posición. El borrador no tiene cabeza de salida propia: usa la del modelo Qwen3-ASR-1.7B.

El entrenamiento parte del backbone del borrador publicado y se prolonga sobre las mismas fuentes: LibriSpeech train-clean-360, People's Speech (clean), VoxPopuli en, Emilia-YODAS en/zh/ja (solo la parte CC BY; se excluye la CC BY-NC), AISHELL-1, Common Voice 17 ja y FLEURS en/zh/ja train. Se usaron 173.936 enunciados y 16,8 M de tokens de etiqueta: 150.000 clips cortos de los 591.786 disponibles, de los cuales 180.000 fueron reetiquetados, más los 23.936 tramos largos de 30 a 240 s. Las etiquetas son las transcripciones codiciosas del propio modelo objetivo generadas con vLLM, contexto de sistema vacío y detección automática de idioma. La receta combina entropía cruzada con pesos de posición D-Pace y una pérdida del selector (peso 1.0, con los fallos sustituidos por la etiqueta), AdamW con lr 3e-4, 3 % de warmup, ventana de 32.768, lotes empaquetados de 16k tokens y 3.072 anclas por lote. El entrenamiento se ejecutó en una H200 con `speculators` en la revisión `7ed657f`, con 30.500 pasos planificados (5,58 épocas); el checkpoint publicado es el paso 16.181, elegido por el mejor aceptado corto + largo sobre un subconjunto de 360 clips.

## Capacidades

- Propuesta de tokens para decodificación especulativa codiciosa sobre Qwen3-ASR-1.7B: genera 7 propuestas por ronda a partir de un ancla.
- Verificación delegada: no produce transcripciones por sí mismo; la salida final siempre la determina el modelo objetivo.
- Reordenación de candidatos mediante selector sobre el top-16 de la cabeza objetivo, lo que concentra casi toda la mejora de aceptado.
- Soporte multilingüe de borrador para inglés, chino y japonés, alineado con los idiomas del modelo objetivo.
- Manejo de audio corto y de tramos largos (30-240 s) gracias a la ventana deslizante de 32.768 tokens.
- Integración prevista con SGLang 0.5.23 mediante su modelo borrador y worker DFlash2 (requiere parche local no publicado en el momento de la publicación).
- No soporta tool calling, function calling, agentes ni modos de razonamiento: es un componente de inferencia, no un modelo conversacional.

## Casos de uso

- Aceleración de transcripción por lotes: integrar el borrador en un pipeline de ASR con Qwen3-ASR-1.7B para reducir el número de rondas de decodificación en la transcripción de archivos largos, aprovechando la ventana de 32.768 tokens para tramos de hasta varios minutos.
- Subtitulado y transcripción de reuniones en inglés, chino y japonés: el borrador cubre los tres idiomas del objetivo y mantiene el aceptado en clips de 60 y 180 s (5,09-6,47 tokens por ronda en las pruebas simuladas), adecuado para flujos de postproducción.
- Investigación en decodificación especulativa: sirve como referencia reproducible de DFlash2 con resultados de aceptado por conjunto de datos y un control DFlash entrenado con la misma receta, útil para estudiar qué parte de la mejora proviene del selector y cuál del entrenamiento prolongado.
- Evaluación de stacks de servicio: permite comparar el comportamiento de borradores DFlash y DFlash2 bajo sglang-omni con concurrencia 1, 4 y 16, un escenario habitual al dimensionar infraestructura de ASR.
- Prototipado de asistentes de voz en producción: al compartir vocabulario y cabeza de salida con Qwen3-ASR-1.7B, se puede desplegar junto al objetivo sin duplicar el vocabulario ni cambiar el formato de salida.
- Benchmarking de hardware: con 0,7 GB de pesos en bf16, es un componente ligero para medir el impacto del coste por ronda en GPUs como la H200 antes de adoptar DFlash2 en un servicio real.

## Benchmarks y rendimiento

Los datos disponibles son de aceptado en decodificación especulativa simulada (tokens generados por ronda), no de calidad de transcripción. Se comparan el borrador DFlash publicado, un control DFlash entrenado con la misma receta y este borrador con y sin selector.

| Borrador | en | zh | ja | todos | 60 s en | 60 s zh | 60 s ja | 180 s en | 180 s zh | 180 s ja | largo (todos) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| DFlash publicado | 6,09 | 5,60 | 4,61 | 5,43 | 6,24 | 5,74 | 4,74 | 6,15 | 5,64 | 4,69 | 5,57 |
| Control DFlash | 6,13 | 5,60 | 4,60 | 5,44 | 6,23 | 5,86 | 4,73 | 6,21 | 5,77 | 4,65 | 5,60 |
| Este borrador, con selector | 6,32 | 5,84 | 4,93 | 5,70 | 6,53 | 6,14 | 5,09 | 6,47 | 6,01 | 5,00 | 5,91 |
| Este borrador, sin selector | 6,22 | 5,73 | 4,63 | 5,51 | 6,31 | 5,86 | 4,75 | 6,35 | 5,76 | 4,63 | 5,64 |

Por conjunto de datos, el borrador con selector alcanza 6,56 en LibriSpeech clean, 6,13 en LibriSpeech other, 6,07 en FLEURS en, 6,37 en Emilia en, 5,96 en FLEURS zh, 5,76 en Emilia zh, 4,86 en Common Voice ja, 5,34 en FLEURS ja y 4,59 en Emilia ja. En decodificación simulada acepta un 5,0 % más de tokens por ronda que el borrador publicado en clips cortos y un 6,1 % más en grabaciones largas.

En servicio real con sglang-omni y SGLang 0.5.23 sobre una H200 (clips SeedTTS-eval en inglés y chino, 400 clips únicos por idioma, decodificación codiciosa, concurrencia 1, 4 y 16), el modelo corre dentro del ruido estadístico respecto al borrador publicado: la ganancia de aceptado no se convierte en aceleración porque cada ronda tiene un coste mayor. No se han publicado resultados de benchmarks de calidad de transcripción (WER, MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: unos 0,7 GB para los pesos en bf16; hay que sumar la memoria del modelo objetivo Qwen3-ASR-1.7B y las cachés KV del servicio.
- GPU validadas: una H200 para entrenamiento y para las mediciones de servicio con sglang-omni.
- GPU de consumo: no se han publicado pruebas en GPUs de consumo; el tamaño de pesos permitiría alojarlo en tarjetas con 8 GB o más, pero la dependencia de SGLang 0.5.23 y del parche local limita su uso fuera de entornos de servidor.
- Despliegue: sglang-omni con SGLang 0.5.23 (modelo borrador y worker DFlash2). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Arranque: la primera ejecución en una máquina compila en JIT un kernel top-k de FlashInfer, lo que tardó unos 13 minutos en un host con H200; después queda en caché.
- Latencia y throughput: no se publican cifras absolutas; el autor indica que el rendimiento en servicio está dentro del ruido respecto al borrador DFlash publicado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Estado |
|---|---|---|---|---|---|
| Qwen3-ASR-1.7B-dflash2 (este) | 353,2 M | 32.768 (ventana deslizante) | Borrador DFlash2 con selector para Qwen3-ASR-1.7B | Apache 2.0 | Piloto; requiere parche local para sglang-omni |
| Qwen3-ASR-1.7B-dflash (publicado) | no disponible | no disponible | Borrador DFlash para el mismo objetivo | Apache 2.0 | Publicado y cargable en el stack actual |
| Control DFlash del autor | no disponible (cabeza de 48.000 tokens) | no disponible | Control entrenado con la misma receta, sin DFlash2 | no publicada | Pesos no publicados |
| Qwen3-ASR-1.7B (objetivo) | 1,7 B (según nombre) | no disponible | Modelo ASR completo | Apache 2.0 (según metadatos del base) | Producción |

La comparación relevante es frente al borrador DFlash publicado: este modelo mejora el aceptado simulado (5,70 frente a 5,43 en el agregado) pero no la velocidad en servicio. El control demuestra que prolongar el entrenamiento sin las adiciones DFlash2 no aporta ganancia (5,44 frente a 5,43), de modo que la mejora se atribuye casi por completo al selector.

## Limitaciones y advertencias

- No es un modelo de ASR autónomo: sin el modelo objetivo Qwen3-ASR-1.7B no produce transcripciones válidas.
- La ganancia de aceptado no se traduce en aceleración en servicio: en la H200 con sglang-omni el rendimiento está dentro del ruido respecto al borrador publicado.
- sglang-omni no carga borradores DFlash2 de forma nativa; las cifras de servicio provienen de un cambio local no publicado que entrega el checkpoint al modelo borrador y worker DFlash2 de SGLang 0.5.23.
- El arranque inicial requiere compilar un kernel FlashInfer (unos 13 minutos en H200), lo que complica despliegues efímeros o con escalado frecuente.
- Solo cubre inglés, chino y japonés; no hay datos para otros idiomas.
- El selector aporta casi toda la mejora; sin él, el aceptado cae a 5,51 en el agregado, cerca del borrador publicado.
- Solo se han validado configuraciones de decodificación codiciosa; no se documenta comportamiento con muestreo, temperatura o beam search.
- Los resultados de aceptado son simulados sobre conjuntos de retención y etiquetas generadas por el propio objetivo, por lo que pueden no reproducirse con otros dominios de audio.
- Licencia Apache 2.0, que permite uso comercial, pero el parche necesario para servirlo no está publicado y su disponibilidad futura no está garantizada.
- Riesgo de alucinación: bajo en la práctica, porque el objetivo verifica cada propuesta; el riesgo real es de rendimiento, no de contenido.
- Sesgos: no documentados en la información disponible; hereda los del modelo objetivo y de los corpus de entrenamiento (LibriSpeech, People's Speech, VoxPopuli, Emilia, AISHELL-1, Common Voice, FLEURS).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wilsonzheng0327/Qwen3-ASR-1.7B-dflash2
- Borrador DFlash previo: https://huggingface.co/wilsonzheng0327/Qwen3-ASR-1.7B-dflash
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Modelo base en formato HF: https://huggingface.co/Qwen/Qwen3-ASR-1.7B-hf
- Resultados por conjunto de datos: carpeta `eval/` del repositorio del modelo
- Librería `speculators`: no disponible (sin URL en la información proporcionada)
- Paper, blog o demo de DFlash2: no disponible
