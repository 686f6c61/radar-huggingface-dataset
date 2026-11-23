# thangalin/Qwen3.6-Grammar-Distill-GGUF

## Resumen

Qwen3.6-Grammar-Distill-GGUF es un modelo especializado en corrección gramatical del inglés, derivado de Qwen3.6-35B-A3B mediante un proceso de poda de expertos y destilación. Lo publica el usuario thangalin en Hugging Face bajo licencia Apache 2.0. El modelo recibe pasajes de párrafos numerados y devuelve exclusivamente un objeto JSON con los errores detectados: párrafo, frase exacta, una razón de una sola frase y la corrección propuesta. Nunca reescribe el texto original.

La relevancia práctica del modelo reside en su reducción de tamaño y en la eliminación del modo de razonamiento (thinking), lo que permite ejecutarlo localmente con llama.cpp sobre hardware modesto. Frente al modelo base completo con su prompt de instrucciones largo, este modelo reduce el tiempo de corrección de un capítulo de novela de 38.600 caracteres de 17 minutos a menos de 3 minutos en una GPU de 8 GB, a costa de una pérdida de cobertura frente al profesor (79% de hallazgos capturados frente al 90%).

El modelo conserva la arquitectura MoE del base, con aproximadamente 19.000 millones de parámetros totales y unos 3.000 millones activos por token, y se distribuye en un único archivo GGUF cuantizado en Q4_K_M de 11,4 GB. Está entrenado y orientado exclusivamente al inglés, con etiquetas generadas bajo configuración de inglés canadiense.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), 40 capas, 8 de 128 expertos activos más un experto compartido por token |
| Parámetros totales | ≈19B (18.543.997.568 según safetensors del repo) |
| Parámetros activos | ≈3B por token |
| Longitud de contexto | Entrenado con secuencias de hasta 1.408 tokens y pasajes de hasta 2.400 caracteres; servidor de ejemplo con `-c 16384` |
| Tipos de cuantización | Q4_K_M con importance matrix (imatrix); único archivo publicado |
| Idiomas soportados | Inglés (etiquetas generadas con configuración de inglés canadiense) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`qwen3.6-grammar-Q4_K_M.gguf`, 11,4 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.6-35B-A3B, un transformer con mezcla de expertos. El proceso de adaptación consta de tres fases según la model card. Primero, una poda de expertos estilo REAP: se eliminan la mitad de los expertos de cada capa (de 256 a 128) usando una puntuación de saliencia calibrada con tráfico de corrección gramatical. Segundo, una destilación mediante fine-tuning con LoRA sobre los propios hallazgos gramaticales de Qwen3.6 en 15.000 pasajes públicos, con el objetivo de que el modelo aprenda a trabajar desde un prompt de una línea, sin modo de razonamiento. Tercero, la cuantización a Q4_K_M con importance matrix.

Los datos de entrenamiento provienen de los conjuntos martinsr/c4_200m, stas/openwebtext-10k y emozilla/pg19, además del GitHub Typo Corpus empleado en la evaluación. Se eliminaron la torre de visión y la cabeza MTP (multi-token prediction) del modelo base, por lo que el modelo es solo texto y no admite decodificación especulativa con `draft-mtp` en llama.cpp.

## Capacidades

- Detección de errores gramaticales en inglés con salida JSON estructurada: párrafo, texto exacto de la frase, razón de una frase y sugerencia de corrección.
- No reescribe el texto: solo señala fragmentos y propone la corrección puntual.
- Procesamiento de pasajes de hasta aproximadamente 2.400 caracteres, con párrafos envueltos en etiquetas `<p id="N">`.
- Funcionamiento sin modo de razonamiento (thinking desactivado), lo que acorta las respuestas y reduce la latencia.
- Acepta variantes ortográficas del inglés de la Commonwealth (colour, centre, travelled).
- No dispone de tool calling, capacidades de agente, visión, audio ni multilingüismo más allá del inglés.

## Casos de uso

- Corrección gramatical por lotes de manuscritos y novelas: dividir el texto en pasajes de hasta 2.400 caracteres y enviarlos al servidor llama.cpp; el modelo devuelve los errores en JSON para su revisión o aplicación semiautomática. Adecuado por su velocidad (unos 9,5 s por pasaje de 2.300 caracteres en una T1000).
- Integración en pipelines editoriales de CI: validar borradores en Markdown o LaTeX antes de publicar, parseando el JSON de salida para generar informes de errores por párrafo.
- Revisión de documentación técnica en inglés: detectar concordancias sujeto-verbo, tiempos verbales y pronombres en README, guías y textos de producto, con la ventaja de que el modelo no altera el contenido.
- Herramienta de escritorio local para correctores: desplegable con `llama-server` en un equipo con GPU de 12 GB o más, sin dependencia de servicios en la nube ni envío de texto a terceros.
- Preprocesado de corpus para entrenamiento: filtrar o etiquetar errores gramaticales en conjuntos de texto inglés antes de usarlos en otros procesos de fine-tuning.
- Asistencia a correctores humanos en literatura de dominio público: los conjuntos PG-19 y OpenWebText muestran una cobertura del 78-79%, suficiente para una primera pasada que el corrector revisa después.
- Detección de erratas en textos con errores plantados: la cobertura del 88% en ficción de PG-19 con errores inyectados lo hace útil para pruebas de calidad de pipelines de corrección.

## Benchmarks y rendimiento

Evaluación sobre 200 pasajes reservados (40 de cada una de cinco fuentes, ninguno visto en entrenamiento). Un hallazgo se considera capturado si solapa con el hallazgo del profesor en el mismo párrafo.

| Métrica | Este modelo | Qwen3.6 Q4 en llama.cpp |
|---|---|---|
| Hallazgos del profesor capturados | 79% | 90% |
| Misma frase y misma corrección | 48% | 66% |
| Hallazgos extra (no del profesor) | 19% | 12% |
| Respuestas JSON legibles | 199 de 200 | 186 de 200 |

Cobertura por fuente:

| Fuente | Capturados |
|---|---|
| C4_200M | 75% |
| GitHub Typo Corpus | 81% |
| OpenWebText | 79% |
| Ficción PG-19 | 78% |
| Ficción PG-19 con errores plantados | 88% |

Rendimiento medido en una NVIDIA T1000 de 8 GB con Ryzen 5 7600 (6 hilos), llama.cpp `5bacb7c`, sobre un capítulo de novela de 38.600 caracteres:

| Modelo | Tiempo |
|---|---|
| Qwen3.6-35B-A3B (UD-Q4_K_XL), prompt de instrucciones completo de ~2.500 tokens | 17:16 |
| El mismo, con el prompt cacheado entre pasajes | ~6:00 |
| Este modelo | 2:58 |

Throughput en esa tarjeta: aproximadamente 108 tokens/s de lectura y 30 tokens/s de escritura; unos 9,5 s por pasaje de 2.300 caracteres.

## Requisitos de hardware

- VRAM: el archivo Q4_K_M ocupa 11,4 GB; necesita una GPU de 12 GB o más para residir por completo en memoria.
- En una GPU de 8 GB (por ejemplo, NVIDIA T1000) llama.cpp descarga automáticamente parte de las capas a la CPU y sigue funcionando, con el rendimiento medido arriba.
- GPU recomendadas: RTX 4090, RTX 4080, A100, H100 o cualquier tarjeta con 12 GB o más de VRAM para inferencia íntegra en GPU.
- Cabe en GPU de consumo de gama alta con 12-16 GB o más; en tarjetas de 8 GB funciona con offload parcial a CPU.
- Despliegue: llama.cpp (`llama-server`) con `--jinja -c 16384 -fa on --reasoning-budget 0`. El autor solo ha probado con la build `5bacb7c` de llama.cpp; no se documentan otros motores.
- No admite decodificación especulativa con `draft-mtp` al haberse eliminado la cabeza MTP.
- Latencia estimada: unos 9,5 s por pasaje de 2.300 caracteres en la T1000; previsiblemente menor en GPU de 12 GB o más.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-Grammar-Distill-GGUF | ≈19B totales, ≈3B activos | Pasajes de hasta 2.400 caracteres | Corrección gramatical JSON, sin thinking | Apache 2.0 | GGUF Q4_K_M en Hugging Face |
| Qwen3.6-35B-A3B (base) | 35B totales, 3B activos | Mayor (no especificado en la información disponible) | Modelo generalista con visión y MTP | Apache 2.0 | Pesos originales y cuantizaciones comunitarias |
| Qwen3.6-35B-A3B Q4 en llama.cpp (referencia del autor) | 35B totales, 3B activos | Mayor (no especificado) | Modelo generalista cuantizado localmente | Apache 2.0 | GGUF comunitario |

No se dispone de datos sobre otros correctores gramaticales comparables en la información proporcionada.

## Limitaciones y advertencias

- Menor cobertura que el modelo base: en un capítulo de novela contemporánea inédita encontró el 55% de los problemas que detectó el base con instrucciones completas; la mayoría de lo omitido fueron grafías, compuestos y elecciones léxicas que las instrucciones piden no tocar.
- Pierde errores que requieren contexto entre frases: cambios de tiempo verbal, pronombres incorrectos para un hablante o negaciones omitidas.
- Las razones son concisas pero a menudo nombran la regla de forma imprecisa; deben tratarse como pistas, no como explicaciones normativas.
- Puede marcar texto aceptable como error, especialmente en prosa literaria.
- Procesa un pasaje aislado: no conoce capítulos anteriores, nombres de personajes ni palabras inventadas.
- Solo inglés, con etiquetas generadas bajo inglés canadiense; acepta grafías de la Commonwealth.
- Sin cabeza MTP: no se puede usar decodificación especulativa `draft-mtp`.
- Licencia Apache 2.0, que permite uso comercial, pero la calidad en dominios alejados del entrenamiento (ficción moderna) es inferior a la del base.
- Riesgo de alucinación en las correcciones propuestas y en las razones; conviene validar las sugerencias antes de aplicarlas automáticamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thangalin/Qwen3.6-Grammar-Distill-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Dataset martinsr/c4_200m: https://huggingface.co/datasets/martinsr/c4_200m
- Dataset stas/openwebtext-10k: https://huggingface.co/datasets/stas/openwebtext-10k
- Dataset emozilla/pg19: https://huggingface.co/datasets/emozilla/pg19
