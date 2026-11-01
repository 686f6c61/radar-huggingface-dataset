# voxor-ai/qwen3-asr-1.7b-coreml

## Resumen

Qwen3-ASR 1.7B Core ML es la conversión a Core ML del codificador de audio del modelo Qwen3-ASR-1.7B de Alibaba Qwen, publicada por el usuario voxor-ai. No se trata de un modelo completo de reconocimiento de voz, sino de un componente concreto: el encoder que transforma características log-mel en representaciones de audio (`audio_features`) que después consume el decodificador del modelo original. El artefacto se distribuye como un paquete compilado `AudioEncoder.mlmodelc` en fp16, orientado a su ejecución en el stack Core ML de Apple (iOS 17 / macOS 14 o superior).

El interés de esta conversión es práctico: permite ejecutar la parte más costosa del pipeline ASR de Qwen3-ASR en hardware Apple (SoC de iPhone, iPad o Mac) sin depender de PyTorch ni de un servidor remoto, manteniendo una fidelidad numérica muy alta respecto al encoder original en fp32 (similitud coseno media de 0,9993). El repositorio ocupa 0,6 GB y se publica bajo licencia Apache 2.0, heredada del modelo base.

La información pública disponible es escasa: la model card se limita a describir las firmas de entrada/salida, la precisión de la conversión y una evaluación de WER en FLEURS. No hay datos sobre el decodificador, el tokenizer, los idiomas soportados por el modelo completo ni benchmarks comparativos, por lo que esta ficha distingue explícitamente entre lo que documenta el autor y lo que no está disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de audio de Qwen3-ASR-1.7B convertido a Core ML (transformer, segun el modelo base) |
| Parametros totales | 1,7 B (modelo base Qwen3-ASR-1.7B); parametros del encoder aislado no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 s de audio por ventana (entrada `mel` [1, 128, 3000]); contexto textual del decodificador no disponible |
| Tipos de cuantizacion | fp16 (unico formato publicado) |
| Idiomas soportados | no disponible en la model card; la evaluacion cubre en, de, ar, hi |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML compilado (`AudioEncoder.mlmodelc`), fp16 |

## Arquitectura y entrenamiento

El artefacto no entrena nada: es una conversión del encoder de audio de Qwen/Qwen3-ASR-1.7B a Core ML. La arquitectura interna corresponde, por tanto, a la del modelo base de Qwen (un encoder de audio que proyecta características log-mel a un espacio de 2048 dimensiones), pero la model card no detalla capas, número de cabezas ni configuración del transformer. La interfaz documentada es explícita: entrada `mel` de forma [1, 128, 3000] en float32 (30 segundos de tramas log-mel) y `length` [1] int32 con el número de tokens de salida válidos; salida `audio_features` [1, 390, 2048] en float32.

La conversión se realizó a fp16 y se validó numéricamente contra el encoder PyTorch en fp32: similitud coseno media de 0,9993 y mínima de 0,9987 sobre ventanas de 250 tramas. Además, el autor evalúa el impacto aguas abajo en FLEURS con 240 clips en cuatro idiomas (inglés, alemán, árabe e hindi): 7,31 % WER/CER con el encoder convertido frente a 7,27 % con el encoder sin convertir en el mismo pipeline. No se documentan datos de entrenamiento, composición del dataset, ni etapas de RLHF/DPO, ya que corresponden al modelo base y no se reproducen en esta model card.

## Capacidades

- Extracción de características de audio: convierte 30 s de log-mel (128 bandas) en 390 tokens de 2048 dimensiones para el decodificador de Qwen3-ASR.
- Reconocimiento de voz en pipeline completo: al combinarse con el resto del modelo Qwen3-ASR-1.7B, produce transcripciones; la evaluación del autor cubre inglés, alemán, árabe e hindi.
- Ejecución en dispositivo: al ser un `.mlmodelc`, se integra en apps iOS/iPadOS/macOS mediante Core ML, sin dependencia de PyTorch en tiempo de inferencia.
- Procesamiento por ventanas: la forma fija de entrada admite ventanas de hasta 30 s, con `length` para indicar los tokens válidos.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio en streaming ni modo thinking.

## Casos de uso

- Transcripción local en apps iOS/macOS: integrar `AudioEncoder.mlmodelc` junto al decodificador de Qwen3-ASR para dictado o notas de voz sin enviar audio a la nube, aprovechando la aceleración de la Neural Engine.
- Subtitulado de reuniones en Mac: procesar el audio en ventanas de 30 s con el encoder en Core ML y generar subtítulos con el decodificador, manteniendo los datos en el dispositivo.
- Preprocesado de audio en pipelines híbridos: usar el encoder Core ML como extractor de features y ejecutar el decodificador en otro runtime (por ejemplo, un servidor con PyTorch), validado por el WER de 7,31 % en FLEURS reportado por el autor.
- Aplicaciones de accesibilidad: transcripción en tiempo casi real de conversaciones para personas con discapacidad auditiva en iPhone/iPad, con el modelo residente en memoria (0,6 GB de repositorio).
- Investigación en eficiencia en Apple Silicon: punto de partida para medir latencia y consumo del encoder en distintos chips (M-series, A-series) frente a la referencia PyTorch fp32.
- Evaluación multilingüe en dispositivo: al cubrir la evaluación idiomas como árabe e hindi, sirve para prototipos de ASR multilingüe en mercados donde no se quiere depender de servicios externos.
- Prototipado de asistentes de voz offline: combinar el encoder con un decodificador local para comandos de voz en aplicaciones sin conectividad.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Similitud coseno vs. encoder PyTorch fp32 (media) | 0,9993 |
| Similitud coseno vs. encoder PyTorch fp32 (mínima) | 0,9987 |
| WER/CER en FLEURS con encoder convertido (240 clips; en, de, ar, hi) | 7,31 % |
| WER/CER en FLEURS con encoder sin convertir (mismo pipeline) | 7,27 % |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparativas con otros modelos ASR. Los únicos datos son los de fidelidad de la conversión y la evaluación FLEURS descrita.

## Requisitos de hardware

- VRAM/espacio: el repositorio ocupa 0,6 GB; el modelo compilado en fp16 requiere del orden de esa cifra en memoria unificada al cargarse.
- Hardware objetivo: dispositivos Apple con Core ML, iOS 17 / macOS 14 o superior (iPhone, iPad y Mac con Apple Silicon).
- GPU dedicadas (A100, H100, RTX 4090): no aplica; el artefacto es específico de Core ML y no se distribuye en formatos para CUDA.
- Cabe en hardware de consumo Apple: sí, en cualquier dispositivo compatible con iOS 17/macOS 14; no se documentan requisitos mínimos de chip.
- Despliegue: Core ML (`.mlmodelc`); no se publican pesos en safetensors, GGUF ni versiones para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| voxor-ai/qwen3-asr-1.7b-coreml | 1,7 B (modelo base) | 30 s por ventana de audio | Core ML fp16 | Apache 2.0 | Solo encoder; evaluado en FLEURS (7,31 % WER/CER) |
| Qwen/Qwen3-ASR-1.7B | 1,7 B | no disponible | PyTorch (safetensors) | Apache 2.0 (segun modelo base) | Modelo completo de referencia; sin conversión Core ML |
| Whisper large-v3 | 1,55 B | 30 s por ventana | PyTorch, GGUF, Core ML (comunidad) | MIT (segun el modelo original) | Alternativa ASR ampliamente soportada; datos comparativos no disponibles en esta ficha |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- No es un modelo autónomo: solo contiene el encoder de audio; requiere el decodificador y el tokenizer de Qwen3-ASR-1.7B para producir transcripciones.
- Dependencia de plataforma: el `.mlmodelc` solo se ejecuta en el stack Core ML de Apple (iOS 17 / macOS 14 o superior); no es portable a Linux, Windows ni CUDA.
- Entrada de forma fija: ventanas de 30 s (128 × 3000 log-mel); audios más largos requieren segmentación externa y gestión de solapamientos.
- Idiomas: la model card no declara la lista completa de idiomas soportados; la evaluación solo cubre inglés, alemán, árabe e hindi, por lo que el rendimiento en otros idiomas es desconocido.
- Precisión: la conversión a fp16 introduce una desviación mínima (coseno mínimo 0,9987) y un ligero empeoramiento en WER (7,31 % frente a 7,27 %), aceptable pero no idéntico al original.
- Sesgos y alucinaciones: no documentados en la información disponible; al heredar el comportamiento del modelo base, aplican los sesgos de Qwen3-ASR, no evaluados aquí.
- Licencia: Apache 2.0 permite uso comercial, pero deben conservarse `LICENSE` y `NOTICE`; conviene verificar las condiciones del modelo base Qwen3-ASR-1.7B.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; sin garantías de mantenimiento por parte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/voxor-ai/qwen3-asr-1.7b-coreml
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- No se han encontrado en la información disponible papers, blogs, repositorios ni demos adicionales.
