# suru8-ai/luso-mt-3b

## Resumen

luso-mt-3b es un modelo de traducción automática neuronal desarrollado por Rexplore Research Labs (Lilongwe, Malaui) que traduce entre inglés y chichewa (ny) y entre inglés y tumbuka (tum) en un único modelo de 2.940 millones de parámetros. Se trata de un ajuste fino de google/madlad400-3b-mt, un transformer encoder-decoder de arquitectura T5, al que se le ha añadido un token de destino específico para tumbuka (`<2tum>`). Es el modelo de mayor tamaño de la familia luso-mt, que también incluye luso-mt-small (88M) y luso-mt-tiny (20M).

El modelo resuelve un problema concreto de cobertura lingüística: el tumbuka es una lengua bantú de Malaui con escasos recursos digitales y sin soporte en la mayoría de sistemas de traducción comerciales. luso-mt-3b parte de MADLAD-400 3B, que no soporta tumbuka de forma nativa, y lo extiende mediante ajuste fino supervisado sobre un corpus propio de 597.360 pares de frases. Frente al modelo base en modo zero-shot, la mejora es sustancial en todas las direcciones evaluadas.

Su relevancia actual radica en que combina una licencia permisiva (Apache-2.0, sin restricciones de uso comercial) con un rendimiento que supera en chrF++ a NLLB-200-distilled-600M en tres de las cuatro direcciones evaluadas, incluyendo el par inglés→chichewa y ambas direcciones con tumbuka. El modelo se distribuye en formato safetensors, requiere aproximadamente 6 GB de memoria en bf16 y se integra directamente con la librería transformers.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | T5 encoder-decoder (transformer) |
| Parámetros totales | 2.940.376.064 (2,94B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 192 tokens por lado (longitud de entrenamiento); límite arquitectónico de MADLAD-400 no especificado en la información disponible |
| Tipos de cuantización | no disponible (el autor indica bf16 como opción de referencia; no se documentan otras cuantizaciones) |
| Idiomas soportados | inglés (en), chichewa (ny), tumbuka (tum) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

luso-mt-3b es un transformer encoder-decoder de la familia T5, heredado de google/madlad400-3b-mt (Apache-2.0). Sobre esa base se añadió un token de destino `<2tum>` para habilitar la traducción hacia tumbuka, que el modelo original no soporta. La dirección de traducción se controla mediante un tag al inicio de la secuencia de entrada (`<2en>`, `<2ny>`, `<2tum>`); el idioma de origen se infiere automáticamente y no requiere etiqueta.

El entrenamiento se realizó en dos fases sobre un corpus de 597.360 pares de frases dividido en dos particiones. La primera fase ajustó el modelo durante una época sobre la partición de fuentes públicas (142.976 pares, 7.917 pasos), compuesta por texto web de chichewa y tumbuka procedente de FineWeb-2, HPLT y Wikipedia, con el lado inglés traducido mediante Gemini 3.8 Flash (y 1.692 pasajes largos mediante Gemma 3 27B), más traducciones profesionales del corpus SMOL (CC-BY-4.0). La segunda fase continuó una época sobre el corpus completo (11.000 pasos), incorporando una partición restringida de 454.384 pares cuyos términos no permiten redistribución, también con el inglés generado por Gemini 3.8 Flash. Se usó Adafactor con tasa de aprendizaje 1e-4, schedule coseno, 3% de warm-up, label smoothing de 0,1, precisión bf16, 192 tokens por lado y una única NVIDIA H200. Cada par se utilizó en ambas direcciones; los pares de tumbuka y los de traducción humana se repitieron dos veces en la segunda fase. Antes del entrenamiento se eliminaron las frases de test y desarrollo, así como cualquier par de entrenamiento que compartiera una ventana de 8 palabras con ellas, y una comprobación posterior no encontró solapamiento residual.

## Capacidades

- Traducción bidireccional inglés↔chichewa y inglés↔tumbuka en un solo modelo, con selección de idioma de destino mediante tag (`<2en>`, `<2ny>`, `<2tum>`).
- Generación de texto seq2seq estándar mediante `AutoModelForSeq2SeqLM` y `generate()`, con soporte de búsqueda por haz (beam search, configuración recomendada de 4 haces).
- Traducción con detección implícita del idioma de origen: no es necesario etiquetar la lengua de entrada.
- Soporte de inferencia por lotes (batching) a través de la tokenización estándar de transformers.
- Compatibilidad con text-generation-inference y endpoints compatibles según los tags del repositorio.
- No dispone de tool calling, capacidades de agente, visión, audio ni modo de razonamiento explícito: es un modelo de traducción puro.
- Cobertura multilingüe limitada estrictamente a los tres idiomas declarados (en, ny, tum).

## Casos de uso

- Traducción de documentación sanitaria al tumbuka y al chichewa: el modelo permite convertir guías clínicas y material de salud pública del inglés a lenguas locales de Malaui, un caso donde la cobertura de sistemas comerciales es prácticamente nula y donde la licencia Apache-2.0 elimina fricciones de uso institucional.
- Localización de interfaces y contenidos web para audiencias de Malaui: integrado en un pipeline de publicación, traduce cadenas de UI y artículos del inglés a chichewa y tumbuka con un único modelo y una sola llamada por segmento, seleccionando el destino mediante el tag correspondiente.
- Traducción de noticias y boletines informativos: el modelo fue evaluado sobre NTREX-128 (noticias), donde obtiene 51,7 chrF++ en inglés→chichewa, lo que lo hace adecuado para redacciones que necesiten versiones en lenguas locales de contenido periodístico.
- Subtitulado y transcripción de medios audiovisuales: con segmentos de hasta 192 tokens por lado, encaja en la traducción de subtítulos y transcripciones de entrevistas o vídeos, procesando cada segmento de forma independiente en lotes.
- Atención ciudadana y servicios públicos: administraciones de Malaui pueden desplegar traducción automática de formularios, avisos y correspondencia entre inglés y las dos lenguas locales, con la ventaja de que el modelo corre en una sola GPU consumer o de gama media.
- Investigación lingüística y creación de corpus paralelos: al ser un modelo abierto con pesos descargables y Apache-2.0, sirve como generador de traducciones sintéticas para aumentar corpus de chichewa y tumbuka, o como línea base en experimentos de traducción de bajos recursos.
- Despliegue en entornos con hardware limitado: con aproximadamente 6 GB en bf16, puede ejecutarse en una RTX 4090 o en GPUs de 8-16 GB, lo que facilita su uso por organizaciones con infraestructura modesta.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente), sobre NTREX-128 (en↔ny, 500 frases) y SMOL (en↔tum, 500 frases), con chrF++ / BLEU calculados con sacreBLEU 2.6.0 y beam 4:

| Modelo | Parámetros | en→ny | ny→en | en→tum | tum→en |
|---|---|---|---|---|---|
| **luso-mt-3b** | 2,9B | **51,7** / 23,1 | 54,9 / 32,9 | **40,7** / 12,6 | **36,3** / 14,2 |
| luso-mt teacher (solo datos públicos) | 2,9B | 49,9 / 21,9 | 53,8 / 31,4 | 37,5 / 9,7 | 34,7 / 12,7 |
| NLLB-200-distilled-600M (no comercial) | 615M | 50,0 / 20,1 | **55,2** / 34,2 | 38,2 / 13,0 | 32,7 / 12,0 |
| MADLAD-400 3B (base, zero-shot) | 2,9B | 37,8 / 11,5 | 51,3 / 30,7 | no soportado | 26,8 / 5,9 |
| luso-mt-small | 88M | 47,6 / 20,1 | 46,9 / 23,6 | 35,8 / 8,2 | 30,0 / 8,8 |
| luso-mt-tiny | 20M | 46,3 / 19,1 | 45,5 / 22,0 | 34,9 / 8,1 | 29,1 / 7,9 |

Según el autor, luso-mt-3b supera a NLLB-200-distilled-600M en chrF++ hacia chichewa (+1,7; p = 0,002), hacia tumbuka (+2,5) y desde tumbuka (+3,6; ambas p = 0,001); desde chichewa queda 0,3 por debajo, diferencia no significativa (p = 0,19). Su BLEU hacia tumbuka es inferior al de NLLB-200 (12,6 frente a 13,0). Frente al modelo profesor entrenado solo con datos públicos, mejora todas las direcciones entre 1,1 y 3,2 chrF++ (p = 0,001; bootstrap emparejado con 1.000 remuestreos).

## Requisitos de hardware

- VRAM estimada: aproximadamente 6 GB en bf16 para inferencia, según indica el autor.
- GPU recomendadas: NVIDIA H200 fue la unidad usada en entrenamiento; para inferencia basta una GPU con 8 GB o más, como RTX 3070/4060 Ti de 8 GB, RTX 4080, RTX 4090, A10, L4 o A100.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 8 GB de VRAM en bf16; en fp32 requeriría aproximadamente 12 GB.
- Opciones de despliegue: transformers (referencia del autor), text-generation-inference y endpoints compatibles según los tags del repositorio. No se documentan pesos GGUF ni integración con llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto de entrenamiento | chrF++ en→ny / en→tum | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| luso-mt-3b | 2,9B | en, ny, tum | 192 tokens/lado | 51,7 / 40,7 | Apache-2.0 | Hugging Face |
| NLLB-200-distilled-600M | 615M | 200 idiomas | no disponible | 50,0 / 38,2 | CC-BY-NC (no comercial) | Hugging Face |
| MADLAD-400 3B | 2,9B | 400+ idiomas (sin tum) | no disponible | 37,8 / no soportado | Apache-2.0 | Hugging Face |
| luso-mt-small | 88M | en, ny, tum | 192 tokens/lado | 47,6 / 35,8 | Apache-2.0 | Hugging Face |

luso-mt-3b ofrece la mejor calidad en tres de las cuatro direcciones evaluadas entre los modelos con licencia permisiva, a costa de un tamaño 4,8 veces mayor que NLLB-200-distilled-600M y 33 veces mayor que luso-mt-small. Frente a MADLAD-400 3B, del que deriva, la mejora es de casi 14 puntos chrF++ en inglés→chichewa y habilita una dirección (inglés→tumbuka) que el modelo base no soporta.

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (campo `verified: false` en el model-index).
- El modelo solo cubre tres idiomas (en, ny, tum); no es un sistema de traducción multilingüe general y no debe esperarse calidad en otras lenguas.
- La longitud de entrenamiento es de 192 tokens por lado; textos más largos deben segmentarse y pueden degradar la calidad en fronteras de segmento.
- El corpus de entrenamiento no se publica y una parte (454.384 pares) procede de fuentes con términos que no permiten redistribución, lo que limita la reproducibilidad y la auditoría de sesgos.
- El lado inglés de buena parte del corpus fue generado por modelos (Gemini 3.8 Flash, Gemma 3 27B), lo que puede introducir sesgos y artefactos propios de esas traducciones sintéticas.
- Riesgo de alucinación y de omisión de contenido en segmentos ambiguos o con terminología especializada, habitual en modelos de traducción de tamaño medio.
- El BLEU hacia tumbuka es ligeramente inferior al de NLLB-200-distilled-600M (12,6 frente a 13,0), por lo que la elección entre ambos debe considerar la métrica prioritaria.
- No se documentan cuantizaciones oficiales ni pesos GGUF; el despliegue en CPU o hardware muy limitado requeriría conversión propia.
- Licencia Apache-2.0: permite uso comercial y modificación, pero conviene revisar las obligaciones de atribución y las condiciones de las fuentes de datos restringidas si se redistribuyen derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/suru8-ai/luso-mt-3b
- Modelo base: https://huggingface.co/google/madlad400-3b-mt
- Modelo pequeño de la familia: https://huggingface.co/suru8-ai/luso-mt-small
- Modelo tiny de la familia: https://huggingface.co/suru8-ai/luso-mt-tiny
- Dataset de benchmark: https://huggingface.co/datasets/suru8-ai/luso-mt-benchmark
- Informe técnico: https://rexplore.ai/blog/luso-mt-technical-report
- Informe técnico (PDF): https://rexplore.ai/reports/luso-mt-technical-report.pdf
- Código: https://github.com/rexplore-ai/luso-mt
