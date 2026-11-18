# ThePowerOfHebrew/powsm-ctc-onnx

## Resumen

POWSM CTC ONNX int8 es una adaptación del modelo fundacional de reconocimiento fonético espnet/powsm, desarrollado originalmente por Chin-Jou Li, Kalvin Chang, Shikhar Bharadwaj, Eunjung Yeo, Kwanghee Choi, Jian Zhu, David R. Mortensen y Shinji Watanabe en el marco del trabajo "POWSM: A Phonetic Open Whisper-Style Speech Foundation Model" (arXiv:2510.24992). Esta versión, publicada por ThePowerOfHebrew, exporta únicamente el codificador y la cabeza CTC a formato ONNX con cuantización dinámica a int8, descartando el decodificador de atención. El resultado es un modelo de reconocimiento de fonemas en IPA que no requiere prompt de idioma ni de tarea, lo que simplifica enormemente su integración en pipelines de producción.

El problema que resuelve es la transcripción fonética multilingüe automática: convierte audio en secuencias de fonemas IPA, una tarea relevante para documentación lingüística, evaluación de pronunciación, síntesis de voz y análisis de habla multilingüe. Al eliminar el decodificador autorregresivo y quedarse solo con el codificador más CTC, la inferencia es no autorregresiva y mucho más rápida, además de compatible con onnxruntime en CPU.

La relevancia actual radica en su tamaño reducido (0,2 GB de repositorio), su licencia permisiva CC BY 4.0 y la posibilidad de ejecutarlo sin GPU. Está pensado para desarrolladores que necesitan un componente fonético ligero y desplegable en entornos con recursos limitados, a costa de una precisión algo inferior a la del modelo completo con decodificador de atención.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Codificador transformer estilo Whisper + cabeza CTC (decodificador de atención eliminado) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada `feats` de longitud variable `[1, T, 80]`) |
| Tipos de cuantización | int8 dinámica (onnxruntime) |
| Idiomas soportados | no especificados; evaluación sobre 95 idiomas (VoxAngeles) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`model.int8.onnx`), más `frontend.json` y `vocab.json` |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de POWSM, un modelo fundacional de habla con estilo Whisper entrenado para tareas fonéticas. La adaptación conserva solo el codificador y la cabeza CTC; el decodificador de atención se elimina, de modo que no se necesita prompt de idioma ni de tarea. El frontend (STFT, 80 filtros log-mel y normalización global MVN) queda fuera del grafo ONNX y se describe en `frontend.json`, lo que obliga al usuario a replicar ese preprocesado antes de alimentar el modelo.

La entrada del grafo es `feats` float32 `[1, T, 80]` (log-mel normalizado) junto con `feats_lens` int64 `[1]`; la salida es `logits` `[1, frames, 40002]`. El vocabulario contiene 6.405 tokens de fonemas IPA de los 40.002 totales, con el índice 0 reservado para el blank. La decodificación es CTC voraz: argmax por frame, fusión de repeticiones y conservación de los ids de fonema. Los pesos se cuantizaron dinámicamente a int8 con onnxruntime. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Reconocimiento de fonemas en IPA a partir de audio, mediante decodificación CTC voraz.
- Transcripción fonética multilingüe: evaluación sobre 95 idiomas de VoxAngeles.
- Inferencia no autorregresiva, sin necesidad de prompt de idioma ni de tarea.
- Ejecución en CPU mediante onnxruntime, sin requerir GPU.
- No incluye decodificador de atención, por lo que no genera texto ni transcripciones ortográficas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio más allá del reconocimiento fonético.

## Casos de uso

- Documentación lingüística de campo: el modelo permite transcribir grabaciones de lenguas poco representadas a fonemas IPA sin necesidad de indicar el idioma, lo que facilita el trabajo con hablantes de lenguas sin ortografía estandarizada.
- Evaluación de pronunciación en aprendizaje de idiomas: al comparar la secuencia de fonemas predicha con la esperada, se puede calcular una puntuación de error fonético (PER) por utterance y detectar desviaciones concretas.
- Análisis fonético de corpus de habla: procesar grandes volúmenes de audio en CPU con onnxruntime para extraer alineaciones fonéticas aproximadas y estudiar variación dialectal.
- Preprocesado para síntesis de voz: generar transcripciones fonéticas que alimenten modelos TTS con control fonético explícito, especialmente en lenguas sin G2P bien desarrollado.
- Investigación en reconocimiento de habla multilingüe: usar el modelo como extractor de características fonéticas o como baseline ligero en experimentos de transferencia entre lenguas.
- Despliegue en dispositivos con recursos limitados: el tamaño reducido (0,2 GB) y la cuantización int8 permiten ejecutarlo en entornos sin GPU, como servidores de bajo coste o sistemas embebidos.

## Benchmarks y rendimiento

Evaluación sobre 760 utterances de VoxAngeles (8 por cada uno de 95 idiomas), scoring estrecho y sin pista de idioma:

| Modelo | PER | PFER |
|---|---|---|
| POWSM CTC-only (referencia) | 53,2 | 14,7 |
| POWSM CTC ONNX int8 (esta copia) | 53,9 | 15,1 |
| POWSM completo con decodificador de atención (`<unk>` language) | 56,2 | 17,6 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no son aplicables a esta tarea.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio ocupa 0,2 GB y el modelo int8 es apto para ejecución en CPU.
- GPU recomendadas: no se especifican; al ser ONNX int8, puede ejecutarse en cualquier GPU compatible con onnxruntime, pero no es necesario.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos unos pocos GB de memoria; también en CPU.
- Opciones de despliegue: onnxruntime (CPU o GPU), integrable en Python, C++, C# u otros bindings de ONNX Runtime.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| POWSM CTC ONNX int8 (este) | no disponible | longitud variable | Fonemas IPA (CTC) | CC BY 4.0 | ONNX int8 |
| espnet/powsm (original) | no disponible | longitud variable | Fonemas IPA (encoder-decoder) | CC BY 4.0 | PyTorch |
| Otros modelos fonéticos (p. ej. wav2vec2-based) | no disponible | no disponible | Fonemas | variable | PyTorch/ONNX |

No se dispone de datos comparativos adicionales en la información proporcionada.

## Limitaciones y advertencias

- Precisión inferior al modelo completo: el PER sube de 53,2 a 53,9 y el PFER de 14,7 a 15,1 por la cuantización int8.
- El decodificador de atención se ha eliminado: no se puede usar para tareas que requieran generación autorregresiva ni prompts de idioma o tarea.
- El frontend (STFT, log-mel y MVN) no está incluido en el grafo; un preprocesado incorrecto degradará gravemente los resultados.
- El vocabulario solo cubre 6.405 fonemas IPA de los 40.002 tokens totales; fonemas fuera del vocabulario no se reconocerán.
- Riesgo de alucinación fonética en audio ruidoso o con habla solapada; el CTC voraz no modela incertidumbre.
- Sesgos potenciales derivados de la distribución de VoxAngeles (8 utterances por idioma); lenguas con poca representación pueden tener peor rendimiento.
- Licencia CC BY 4.0: permite uso comercial con atribución al autor original y a esta adaptación.
- No se especifican los idiomas soportados de forma explícita; la cobertura real depende del entrenamiento original de POWSM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ThePowerOfHebrew/powsm-ctc-onnx
- Modelo base: https://huggingface.co/espnet/powsm
- Paper POWSM: https://arxiv.org/abs/2510.24992
- Script de exportación: https://github.com/allan-valin/speech-to-ipa/blob/main/eval/export_powsm_onnx.py
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
