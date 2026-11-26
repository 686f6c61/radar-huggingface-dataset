# Woleworks/lexicorder-mt-fr-en

## Resumen

lexicorder-mt-fr-en es una conversión a ONNX con cuantización int8 del modelo de traducción francés-inglés Helsinki-NLP/opus-mt-fr-en, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT. El autor de esta conversión es Woleworks, que la publica para uso offline dentro de la aplicación Lexicorder. No se ha reentrenado ni ajustado ningún peso: el trabajo consiste en exportar el modelo a ONNX (opset 17) separando encoder y decoder, cuantizar dinámicamente a int8 con ONNX Runtime y reconstruir el tokenizador.

El modelo resuelve un problema acotado y bien definido: traducción automática unidireccional de francés a inglés en entornos sin conectividad o con recursos limitados. Al estar en formato ONNX int8 y ocupar apenas 0,1 GB en el repositorio, puede ejecutarse en CPU y en dispositivos de borde sin necesidad de GPU, lo que lo hace adecuado para aplicaciones de escritorio o móviles que necesitan traducción local.

Su relevancia es principalmente práctica: demuestra un patrón de despliegue de modelos MarianMT en producción ligera, con decisiones de ingeniería concretas (eliminación de la copia duplicada de embeddings, tokenizador restringido a piezas del lado fuente) que corrigen problemas habituales de exportaciones comunitarias anteriores. La arquitectura subyacente es un transformer encoder-decoder de MarianMT, con parámetros totales no especificados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (MarianMT), exportado como dos grafos ONNX separados |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 dinámica (ONNX Runtime `quantize_dynamic`, QInt8) |
| Idiomas soportados | francés (fr) como origen, inglés (en) como destino |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 17); tokenizador en `tokenizer.json` (Unigram) |

## Arquitectura y entrenamiento

El modelo es una conversión directa de Helsinki-NLP/opus-mt-fr-en, un transformer encoder-decoder de la familia MarianMT entrenado sobre datos del corpus OPUS. Los pesos no se han reentrenado ni fine-tuneado; la model card original del repositorio base es la referencia para datos de entrenamiento, número de tokens y cualquier procedimiento de alineación o ajuste. Esta conversión no aporta información adicional sobre la composición del dataset ni sobre si hubo RLHF o DPO.

Las modificaciones técnicas respecto al original son cinco: exportación de PyTorch a ONNX (opset 17) con encoder y decoder como grafos independientes, sin caché KV en el decoder; cuantización dinámica a int8; eliminación de la copia duplicada de la matriz de proyección de salida en el embedding del decoder (MarianMT ata estos pesos, lo que reduce el decoder de 87 MB a 57 MB); reconstrucción de `tokenizer.json` a partir de `vocab.json` y `source.spm`, dejando inalcanzables las piezas exclusivas del inglés para evitar segmentaciones erróneas del francés (por ejemplo, `dort` dividido como `▁do rt`); y eliminación del campo `_name_or_path` en `config.json`. El decoder arranca desde `decoder_start_token_id` y se detiene en `eos_token_id`; el preprocesado requiere normalización NFKC, segmentación SentencePiece Unigram y adición de `</s>`.

## Capacidades

- Traducción de texto de francés a inglés, unidireccional.
- Ejecución offline en CPU mediante ONNX Runtime, sin dependencia de servicios externos.
- Inferencia de baja huella de memoria gracias a la cuantización int8 (decoder de 57 MB).
- Tokenización Unigram restringida al lado fuente, con segmentación correcta del francés.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta otros pares de idiomas distintos de fr→en.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Traducción integrada en aplicaciones de escritorio: la app Lexicorder lo usa para traducir contenido francés a inglés sin conexión, cargando los dos grafos ONNX en memoria y ejecutando la decodificación token a token en CPU.
- Traducción en dispositivos de borde o móviles: el tamaño reducido (0,1 GB de repositorio, decoder de 57 MB) permite incluirlo en paquetes de aplicación sin penalizar excesivamente la distribución.
- Procesamiento por lotes de documentos franceses: pipelines que necesitan convertir corpus, informes o correos a inglés pueden invocar el modelo localmente con ONNX Runtime, evitando costes de API y problemas de privacidad.
- Preprocesado en sistemas de búsqueda o análisis: traducción de consultas o textos franceses a inglés antes de indexarlos o pasarlos a un modelo mayor que solo opere bien en inglés.
- Herramientas de accesibilidad y lectura: subtitulado o lectura asistida de contenido francés para usuarios angloparlantes, con latencia baja al no requerir red.
- Entornos con requisitos de privacidad: traducción de material sensible (documentación legal, comunicaciones internas) sin que el texto salga del dispositivo.
- Prototipado y evaluación de pipelines de traducción: servir como baseline ligero y reproducible en formato ONNX para comparar con otros sistemas de traducción.

## Benchmarks y rendimiento

| Conjunto de evaluación | Métrica | Resultado |
|---|---|---|
| Test propio de Lexicorder (32 frases de francés cotidiano, decodificación greedy, referencia única) | chrF | 78,2 |
| Exportación ONNX comunitaria anterior del mismo modelo (mismo test) | chrF | 75,7 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, WMT, etc.) para esta conversión. La propia model card advierte que el conjunto de 32 frases es pequeño y que la puntuación debe tomarse solo como orientación aproximada.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la mayoría de despliegues; el modelo está pensado para CPU. En GPU, la huella sería inferior a 1 GB, pero no se proporcionan cifras oficiales.
- GPU recomendadas: no se especifican; cualquier GPU con soporte de ONNX Runtime serviría, aunque el modelo no está optimizado para ella.
- Cabe en GPU de consumo: sí, con margen amplio, dado el tamaño del repositorio (0,1 GB) y el decoder de 57 MB.
- Despliegue: ONNX Runtime (principal), con posibilidad de integración en aplicaciones de escritorio o móviles. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato y arquitectura.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Woleworks/lexicorder-mt-fr-en | no disponible | no disponible | ONNX int8 | Apache 2.0 | Conversión int8 de opus-mt-fr-en, decoder sin caché KV |
| Helsinki-NLP/opus-mt-fr-en | no disponible | no disponible | PyTorch (safetensors/bin) | Apache 2.0 (según modelo base) | Modelo original; referencia para entrenamiento y benchmarks |
| Exportación ONNX comunitaria anterior de opus-mt-fr-en | no disponible | no disponible | ONNX | no disponible | chrF 75,7 en el test de Lexicorder, frente a 78,2 de esta conversión |

No se dispone de datos suficientes para comparar con otros sistemas de traducción fr→en (por ejemplo, modelos NLLB o M2M100) en parámetros, contexto o rendimiento dentro de la información proporcionada.

## Limitaciones y advertencias

- Modelo unidireccional: solo traduce francés a inglés; no soporta el sentido inverso ni otros pares.
- Calidad limitada por el modelo base: al no reentrenarse, hereda los sesgos y errores de opus-mt-fr-en y de los datos OPUS.
- Riesgo de alucinación y traducciones inexactas, especialmente en dominios especializados, frases ambiguas o texto con jerga; la model card lo advierte explícitamente ("Machine translations may be inaccurate").
- Evaluación muy limitada: el chrF de 78,2 proviene de un test de 32 frases con referencia única, insuficiente para garantizar calidad en producción.
- Decoder sin caché KV: cada paso de decodificación recalcula atenciones sobre todo el prefijo, lo que penaliza la latencia en secuencias largas.
- Tokenizador restringido: las piezas exclusivas del inglés se han hecho inalcanzables; cualquier uso que requiera tokenizar inglés como entrada no funcionará correctamente.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda conservar el aviso de licencia y la atribución al proyecto OPUS-MT.
- Sin garantía: se distribuye "as is"; no hay soporte ni mantenimiento documentado, y el repositorio registra cero descargas y cero likes en el momento de la ficha.
- Longitud de contexto no documentada: no se puede planificar el truncado de entradas largas sin consultar la configuración original de MarianMT.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Woleworks/lexicorder-mt-fr-en
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-fr-en
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Corpus OPUS: https://opus.nlpl.eu/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
