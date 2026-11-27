# TigreGotico/rawi-ensemble-loom

## Resumen

rawi-ensemble-loom es un paquete GGUF autocontenido que combina los modelos de diacritización árabe rawi-v2 y rawi-v3 en un único artefacto para el motor de inferencia loom. Lo desarrolla TigreGotico y resuelve un problema muy concreto: restaurar las marcas diacríticas (harakat) en texto árabe no vocalizado, una tarea crítica para TTS, traducción y enseñanza del árabe. No es un modelo de lenguaje generativo, sino un sistema discriminativo token a token basado en dos redes BiLSTM que emiten 75 logits por carácter de entrada.

El artefacto empaqueta 12 grafos (una capa de embedding, dos capas BiLSTM por dirección y una cabeza de salida por cada red) más un driver en Lua que aplica la compuerta de ensemble. El conjunto suma 4.864.150 parámetros y se distribuye en dos ficheros GGUF (F16 y F32) bajo licencia Apache 2.0. Es relevante porque demuestra el patrón de "modelo como fichero ejecutable" con driver embebido, y porque ofrece una alternativa determinista y ligera frente a los LLM para una tarea lingüística acotada.

La dependencia clave es que el driver invoca `loom.run_bi_lstm_and_retain`, una operación que aún vive en un pull request de loom.cpp; sin ese motor parcheado, la inferencia falla en la primera llamada. El modelo es de nicho, con cero descargas y cero likes en el momento de la consulta, y solo soporta árabe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de dos redes BiLSTM (rawi-v2 + rawi-v3) empaquetadas como 12 grafos loom con driver Lua |
| Parametros totales | 4.864.150 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa secuencias token a token; el set de prueba tiene 934 frases y 24.477 caracteres) |
| Tipos de cuantizacion | F16 y F32 (ficheros GGUF publicados) |
| Idiomas soportados | arabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (rawi_ensemble.f16.gguf, rawi_ensemble.f32.gguf) |

## Arquitectura y entrenamiento

La arquitectura es un ensemble de dos redes BiLSTM independientes (rawi-v2 y rawi-v3) que se ejecutan dentro de un mismo fichero GGUF. Cada red aporta una capa de embedding, dos capas BiLSTM (una por dirección) y una cabeza de clasificación; el driver Lua combina las salidas mediante una compuerta de ensemble y devuelve `gated_logits` de dimensión T × 75 en orden row-major. La salida son logits por carácter para el conjunto de diacríticos árabes, no texto generado.

El preprocesado es explícito y forma parte del contrato del modelo: normalización NFD, eliminación de símbolos (categoría Unicode So) y de marcas combinantes (categoría Mn), y mapeo de cada carácter a un id mediante `char_to_idx` del vocabulario de rawi-v2 (`rawi_v2.vocab.json`), con `<UNK>` para caracteres desconocidos. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; al ser un modelo discriminativo de etiquetado, esos mecanismos no resultan aplicables. La innovación técnica destacable es el empaquetado: el driver Lua se incrusta en el GGUF y sustituye la llamada por paso de tiempo `run_bi_recurrent_and_retain` por la llamada fusionada `run_bi_lstm_and_retain`, que ejecuta cada capa BiLSTM como un único grafo.

## Capacidades

- Diacritización de texto árabe: añade las marcas vocálicas (harakat) carácter a carácter sobre texto no vocalizado.
- Salida de logits por token (T × 75) que permite posprocesado propio, umbrales de confianza y decodificación restringida.
- Ensemble de dos redes con compuerta aprendida, orientado a reducir el error respecto a cada red individual.
- Procesamiento por secuencias completas con normalización Unicode NFD integrada en el contrato de entrada.
- Sin soporte de tool calling ni function calling.
- Sin capacidades de agente ni razonamiento multi-paso.
- Sin capacidades de visión ni audio.
- Sin modo "thinking" ni generación de texto libre.
- Monolingüe: únicamente árabe.

## Casos de uso

- Vocalización para síntesis de voz (TTS) en árabe: el modelo restaura las harakat que el sintetizador necesita para una pronunciación correcta; su salida token a token encaja directamente en un pipeline de fonemización previa.
- Preprocesado para traducción automática árabe: la diacritización reduce la ambigüedad léxica antes de pasar el texto a un traductor, y el bajo coste computacional (4,86 M de parámetros) permite ejecutarlo en cada petición.
- Enseñanza del árabe y materiales didácticos: generación automática de textos vocalizados para niveles iniciales, con la posibilidad de filtrar por confianza usando los logits de salida.
- Recuperación de información y búsqueda: normalizar y vocalizar corpus históricos o periodísticos para mejorar el emparejamiento entre consultas vocalizadas y documentos sin vocalizar.
- Corpus lingüísticos y anotación: etiquetado masivo de texto árabe con marcas diacríticas como paso previo a estudios morfológicos, aprovechando el formato GGUF para despliegue local sin GPU.
- Aplicaciones de lectura asistida: integrarse en lectores o extensiones que muestran la vocalización bajo demanda, con inferencia en CPU gracias al tamaño reducido del modelo.
- Verificación de motores de inferencia: el repositorio incluye `test/onnx_fp32_logits.f32` y scripts de paridad, útiles como caso de prueba para validar implementaciones de GGUF o de la operación BiLSTM fusionada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente describe un procedimiento de verificación de paridad numérica contra la salida ONNX en fp32 (`test/onnx_fp32_logits.f32`, 24.477 caracteres × 75 logits) mediante `scripts/check_parity.py`, que comprueba la equivalencia de los logits y registra tiempos en `f16_times.txt`; no se aportan métricas de precisión (accuracy, DER) ni cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: inferior a 100 MB en F16 (4,86 M de parámetros equivalen a unos 10 MB de pesos, más overhead de los 12 grafos y del motor loom); en la práctica el modelo cabe en memoria de CPU sin problema.
- GPU recomendadas: no se requieren; cualquier GPU con soporte de ggml sirve, incluida una integrada.
- Cabe en cualquier GPU de consumo e incluso en dispositivos de gama baja; el cuello de botella es el motor loom, no los pesos.
- Opciones de despliegue: exclusivamente loom.cpp con la operación `run_bi_lstm_and_retain` (pull request pendiente). No hay soporte documentado para llama.cpp, Ollama, vLLM ni TGI, ya que el fichero contiene un driver Lua y grafos específicos de loom.
- Latencia y throughput: no disponibles; el repositorio incluye un binario de prueba (`scripts/rawi_run.cpp`) que escribe tiempos de ejecución, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rawi-ensemble-loom | 4,86 M | Ensemble BiLSTM, GGUF para loom | no disponible | Apache 2.0 | Hugging Face, requiere loom parcheado |
| rawi-v2 (modelo base) | no disponible | BiLSTM de diacritización | no disponible | no disponible | Hugging Face (checkpoints .pth) |
| rawi-v3 (modelo base) | no disponible | BiLSTM de diacritización | no disponible | no disponible | Hugging Face |
| LLM generativos multilingües | miles de millones | Transformer decoder | 8k-128k tokens | variable | amplia |

La comparación directa con LLM generativos no es homogénea: rawi-ensemble-loom es un etiquetador especializado, no un generador, y su ventaja es el coste (menos de 5 M de parámetros) y el determinismo de la salida. No se dispone de datos de rendimiento de rawi-v2 ni rawi-v3 en la información proporcionada para comparar la calidad del ensemble frente a sus componentes.

## Limitaciones y advertencias

- Dependencia crítica del motor: el driver llama a `loom.run_bi_lstm_and_retain`, que solo existe en un pull request de loom.cpp; un motor sin esa operación aborta en la primera llamada.
- Solo árabe: no hay soporte multilingüe ni de otros sistemas de escritura.
- No es un modelo generativo: no produce texto, solo logits por carácter; requiere un decodificador externo para obtener la salida vocalizada.
- Preprocesado obligatorio: omitir la normalización NFD o la eliminación de símbolos (So) y marcas combinantes (Mn) degrada la entrada respecto al contrato de entrenamiento.
- Riesgo de error en casos ambiguos: la diacritización árabe es intrínsecamente ambigua y los logits pueden reflejar sesgos del corpus de entrenamiento; no se documentan análisis de sesgo.
- Vocabulario cerrado: los caracteres fuera de `char_to_idx` se mapean a `<UNK>`, lo que puede afectar a texto con signos, cifras o variantes ortográficas no cubiertas.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar la licencia de los checkpoints base rawi-v2 y rawi-v3, no detallada en la información disponible.
- Madurez baja: cero descargas y cero likes, creado y actualizado el mismo día; sin evidencia de uso en producción.
- El repositorio reporta un tamaño de 0.0 GB, lo que sugiere que los ficheros GGUF pueden no estar materializados o que la métrica no se ha actualizado.

## Enlaces

- Hugging Face: https://huggingface.co/TigreGotico/rawi-ensemble-loom
- Modelo base rawi-v2: https://huggingface.co/TigreGotico/rawi-v2
- Modelo base rawi-v3: https://huggingface.co/TigreGotico/rawi-v3
- Vocabulario (`rawi_v2.vocab.json`): incluido en el repositorio de rawi-v2
- Motor loom.cpp: repositorio de loom.cpp con el pull request de `run_bi_lstm_and_retain` (referenciado en la model card, sin URL directa en la información disponible)
- Scripts de exportación y paridad: `scripts/export_rawi_ensemble.py`, `scripts/swap_driver.py`, `scripts/check_parity.py` y `scripts/rawi_run.cpp` en el repositorio del modelo
