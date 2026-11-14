# xix3r/voxix-granite-speech-4.1-2b-nar-gguf

## Resumen

Granite-Speech-4.1-2B-NAR es un modelo de reconocimiento automatico del habla (ASR) no autorregresivo desarrollado por IBM, publicado originalmente como `ibm-granite/granite-speech-4.1-2b-nar`. Esta ficha cubre la conversion a formato GGUF realizada por el usuario `xix3r` bajo el identificador `xix3r/voxix-granite-speech-4.1-2b-nar-gguf`, pensada para su uso con el motor `transcribe.cpp`. El modelo formula el ASR como una tarea de edicion condicional de transcripcion: en lugar de generar tokens uno a uno, edita una hipotesis CTC en un unico paso forward mediante un LLM bidireccional.

La arquitectura combina un codificador de audio Conformer (compartido con la familia autoregresiva Granite-Speech) con un proyector MLP con atencion y el LLM Granite-4.0-1b, empleado como editor bidireccional con la mascara causal desactivada. Una sola pasada produce logits sobre la transcripcion completa y la decodificacion CTC genera el texto final, sin bucle token a token. Esto reduce la latencia frente a alternativas autoregresivas a costa de una precision ligeramente inferior.

El modelo cuenta con 2.254.656.316 parametros, soporta ingles, frances, aleman, espanol y portugues, y se distribuye bajo licencia Apache-2.0. La relevancia actual radica en su eficiencia: ofrece transcripcion multilingue offline con una huella de memoria reducida (desde 1,45 GB en Q4_K_M) y buen rendimiento en hardware de consumo, lo que lo hace atractivo para despliegues en dispositivo o en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (codificador de audio) + proyector MLP con atencion + LLM Granite-4.0-1b bidireccional (edicion NAR, NLE) |
| Parametros totales | 2.254.656.316 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M (GGUF) |
| Idiomas soportados | en, fr, de, es, pt |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (tambien safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura NLE (Non-autoregressive LLM-based Editing) descrita en el paper arXiv:2603.08397. Reutiliza el codificador de audio Conformer de la familia Granite-Speech y lo conecta mediante un proyector MLP con atencion a un LLM Granite-4.0-1b que actua como editor bidireccional. La mascara causal se desactiva (`create_bidirectional_mask()`), de modo que el modelo puede atender a toda la secuencia simultaneamente. El proceso consiste en: (1) obtener una hipotesis CTC inicial, (2) editarla condicionada por las representaciones de audio en un unico paso forward, y (3) decodificar la salida final mediante CTC. No existe bucle de decodificacion token a token.

No se dispone en la informacion proporcionada de detalles sobre el volumen de datos de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO. La model card indica que la version autoregresiva hermana (`granite-speech-4.1-2b`) produce transcripciones con puntuacion y mayusculas, soporta AST y reconocimiento con sesgo de palabras clave, e incluye japones; la variante NAR aqui descrita es solo ASR, sin traduccion ni timestamps. La conversion GGUF fue realizada a partir del commit `99a4df9` del modelo base (fijado el 2026-05-24) y validada contra la referencia de Transformers en el commit `c53af2c` de `transcribe.cpp`.

## Capacidades

- Transcripcion de voz a texto (ASR) multilingue offline en un solo paso forward no autorregresivo.
- Idiomas: ingles, frances, aleman, espanol y portugues.
- Decodificacion CTC sobre logits generados por el editor bidireccional.
- Entrada de audio: WAV mono a 16 kHz.
- No soporta traduccion automatica del habla (`translate: false`).
- No soporta deteccion automatica de idioma (`lang_detect: false`).
- No soporta transcripcion en streaming (`streaming: false`).
- No genera timestamps (`timestamps: none`).
- No dispone de tool calling, function calling ni capacidades de agente.
- No incluye vision, audio generativo ni modo de razonamiento explicito.

## Casos de uso

- Transcripcion por lotes de reuniones y entrevistas: el modelo procesa archivos WAV de 16 kHz de forma offline y en una sola pasada, lo que permite transcribir grandes volumenes de audio en servidores sin GPU dedicada gracias a su bajo consumo de memoria (1,45 GB en Q4_K_M).
- Subtitulado de contenido en cinco idiomas: util para generar transcripciones de videos en ingles, frances, aleman, espanol o portugues; al no soportar timestamps, se combinaria con un alineador externo si se requieren marcas temporales.
- Notas de voz en aplicaciones moviles o de escritorio: con cuantizaciones Q4_K_M o Q5_K_M y soporte Metal (RTF 18 en M4) o Vulkan (RTF 3,65 en Ryzen 4750U), puede ejecutarse en hardware de consumo para dictado local sin conexion.
- Archivado y busqueda de grabaciones: transcripcion de audio historico o de centros de llamadas para indexacion y busqueda textual, aprovechando la licencia Apache-2.0 para uso comercial sin restricciones.
- Accesibilidad: generacion de transcripciones para personas con discapacidad auditiva en entornos con recursos limitados, donde un modelo autoregresivo de mayor latencia no seria viable.
- Procesamiento en el borde (edge computing): despliegue en dispositivos con CPU o GPU integrada usando `transcribe.cpp`, con RTF de 5 en CPU de M4 y 1,5 en CPU de Ryzen 4750U, adecuado para aplicaciones de tiempo casi real en local.
- Investigacion en ASR no autorregresivo: base para experimentos con la arquitectura NLE y comparaciones frente a variantes autoregresivas de la misma familia.

## Benchmarks y rendimiento

Resultados de WER sobre LibriSpeech test-clean (2620 utterances), con normalizador `EnglishTextNormalizer` de Whisper, medidos en `transcribe.cpp`:

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| BF16 | 4,20 GB | 1,29 % |
| F16 | 4,21 GB | 1,29 % |
| Q8_0 | 2,33 GB | 1,29 % |
| Q6_K | 1,84 GB | 1,29 % |
| Q5_K_M | 1,66 GB | 1,25 % |
| Q4_K_M | 1,45 GB | 1,35 % |

Referencia BF16 con Transformers (`model.transcribe`, MPS): 1,28 %, coherente con el 1,29 % de la model card upstream.

Rendimiento (RTF, menor es mejor):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 56 |
| Apple M4 Max | CPU | 5 |
| Apple M4 | Metal | 18 |
| Apple M4 | CPU | 4 |
| Ryzen 4750U | Vulkan | 3,65 |
| Ryzen 4750U | CPU | 1,5 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, dado que se trata de un modelo ASR.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,45 GB (Q4_K_M), 1,66 GB (Q5_K_M), 1,84 GB (Q6_K), 2,33 GB (Q8_0) y 4,20 GB (BF16/F16), mas overhead del motor.
- GPU recomendadas: no se especifican modelos concretos en la informacion; el rendimiento medido incluye Apple M4/M4 Max (Metal) y Ryzen 4750U (Vulkan). Para GPU dedicadas tipo RTX 4090, A100 o H100 no hay datos publicados.
- Cabe en GPU de consumo: si, las cuantizaciones Q4_K_M a Q8_0 caben en GPUs con 4 GB o mas de VRAM; incluso en CPU funciona con RTF inferior a 1 en Ryzen 4750U (1,5) y M4 (4).
- Opciones de despliegue: `transcribe.cpp` (libreria nativa con CLI `transcribe-cli`), con soporte de backends Metal, Vulkan y CPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: RTF de 56 (Metal, M4 Max), 18 (Metal, M4), 5 (CPU, M4 Max), 4 (CPU, M4), 3,65 (Vulkan, Ryzen 4750U) y 1,5 (CPU, Ryzen 4750U). No hay datos de throughput en tokens por segundo ni de latencia absoluta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| granite-speech-4.1-2b-nar (este) | 2,25 B | no disponible | en, fr, de, es, pt | Apache-2.0 | NAR, solo ASR, sin timestamps ni traduccion |
| granite-speech-4.1-2b (AR) | no disponible | no disponible | incluye japones | Apache-2.0 | Autoregresivo, mayor precision, transcripcion con puntuacion y mayusculas, AST y sesgo de palabras clave |
| granite-speech-4.1-2b-plus | no disponible | no disponible | no disponible | no disponible | Incluye informacion de hablante y timestamps por palabra |

No se dispone de datos de parametros, contexto ni benchmarks de los modelos comparables mas alla de lo indicado en la model card upstream. No se han identificado en la informacion proporcionada otras alternativas ASR comparables (por ejemplo, Whisper o Parakeet) con datos verificables.

## Limitaciones y advertencias

- Solo ASR: no realiza traduccion, no detecta idioma automaticamente, no genera timestamps y no soporta streaming.
- Precision inferior a la variante autoregresiva `granite-speech-4.1-2b`, que ademas produce puntuacion y mayusculas; la NAR genera texto sin esas marcas.
- No incluye japones, a diferencia de la variante autoregresiva de la familia.
- Riesgo de alucinacion y errores en audio con ruido, acentos no cubiertos o dominios especializados; el WER de referencia (1,29 %) corresponde a LibriSpeech test-clean, un conjunto limpio de lectura.
- Requiere audio de entrada en WAV mono a 16 kHz; es necesario remuestrear y convertir canales previamente.
- La conversion GGUF es de un tercero (`xix3r`) y esta validada contra una revision concreta (`99a4df9` del modelo base, `c53af2c` de `transcribe.cpp`); cambios posteriores en el motor pueden afectar la compatibilidad.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los terminos del modelo base upstream como fuente autoritativa.
- No se dispone de informacion sobre sesgos demograficos o linguisticos especificos ni sobre comportamiento en produccion a gran escala.

## Enlaces

- Repositorio GGUF: https://huggingface.co/xix3r/voxix-granite-speech-4.1-2b-nar-gguf
- Modelo base: https://huggingface.co/ibm-granite/granite-speech-4.1-2b-nar
- Commit del modelo base: https://huggingface.co/ibm-granite/granite-speech-4.1-2b-nar/commit/99a4df9
- Variante autoregresiva: https://huggingface.co/ibm-granite/granite-speech-4.1-2b
- Variante plus: https://huggingface.co/ibm-granite/granite-speech-4.1-2b-plus
- Motor transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Documentacion del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/granite-speech-4.1-2b-nar.md
- Commit de validacion transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/c53af2c
- Paper NLE: https://arxiv.org/abs/2603.08397
- Descargas GGUF alternativas: https://huggingface.co/handy-computer/granite-speech-4.1-2b-nar-gguf
