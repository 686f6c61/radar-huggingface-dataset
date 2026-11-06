# yeowon/qwen3_asr_1.7b_ko-RungOmega-MLX-lite

## Resumen

`yeowon/qwen3_asr_1.7b_ko-RungOmega-MLX-lite` es una versión cuantizada a 4 bits del modelo de reconocimiento automático del habla (ASR) en coreano `TeamUNIVA/qwen3_asr_1.7b_ko`, que a su vez es un ajuste fino de `Qwen/Qwen3-ASR-1.7B`. La publica el usuario yeowon bajo licencia Apache 2.0 y está pensada específicamente para ejecutarse en Apple Silicon (M1/M2/M3/M4) mediante MLX, sin necesidad de PyTorch.

El modelo aplica una técnica propia denominada "Rung Ω" que recorta el vocabulario de salida del decodificador a 25 728 tokens (coreano y ASCII) frente a los 151 936 del vocabulario original, reduce el número de llamadas a Metal fusionando proyecciones Q/K/V y Gate/Up, y mantiene el codificador de audio completo. El resultado ocupa 1 557,1 MB frente a los 4 480,9 MB del original en BF16, con una similitud coseno de pesos del 99,97 % respecto al modelo base.

Es relevante porque permite transcripción de voz en coreano en un portátil Mac de gama media con un consumo máximo de memoria de aproximadamente 2,6 GB y un RTF de 0,10–0,13x (entre 8 y 10 veces más rápido que tiempo real) en un M1 Pro de 16 GB. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor ofrece variantes de 8 bits y un alineador forzado complementario.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder para ASR (derivada de Qwen3-ASR-1.7B), con decodificador cuantizado y codificador de audio incluido |
| Parámetros totales | 594 654 848 (según safetensors del repo); el nombre comercial indica 1,7B sobre el modelo base |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MLX 4-bit, group_size 64 (`nn.quantize` estándar); existe variante 8-bit en otro repo |
| Idiomas soportados | coreano (ko); el modelo base Qwen3-ASR soporta 52 idiomas y dialectos, pero este ajuste está especializado en coreano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 1 557,1 MB; repo total 1,6 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-ASR-1.7B, un modelo encoder-decoder para reconocimiento de voz que aprovecha la capacidad de comprensión de audio de Qwen3-Omni y que soporta identificación de idioma y ASR en 52 idiomas y dialectos. Sobre esa base, TeamUNIVA realizó un ajuste fino en dos rondas de SFT seguidas de aprendizaje por refuerzo con GSPO sobre un conjunto ampliado de datos de voz en coreano, partiendo de un modelo beta previo.

La variante Rung Ω introduce tres modificaciones de inferencia: recorte del vocabulario de salida a 25 728 tokens (coreano y ASCII), fusión de las proyecciones Q/K/V y Gate/Up para reducir en 84 las llamadas a Metal por token, y compatibilidad con un alineador forzado externo (`qwen3_forced_aligner_0.6b-RungOmega-MLX`) que asigna marcas temporales a nivel de palabra. La cuantización se aplica solo al decodificador en 4 bits con group_size 64, manteniendo el codificador de audio en el grafo MLX estándar. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Transcripción de voz a texto en coreano (ASR) a partir de audio mono a 16 kHz.
- Identificación de idioma heredada del modelo base Qwen3-ASR (52 idiomas y dialectos), aunque el ajuste fino está orientado a coreano.
- Alineación temporal a nivel de palabra mediante el alineador forzado opcional, que reduce cortes de frase y palabras fantasma.
- Ejecución nativa en Apple Silicon vía MLX, sin dependencia de PyTorch (`rung_runtime.py` solo usa MLX).
- Integración directa con la aplicación de escritorio Talkit para Mac.
- Métricas de inferencia expuestas por la API (`transcribe_with_metrics`), incluidas latencia y uso de memoria.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio de entrada más allá del propio ASR ni modo de razonamiento explícito.

## Casos de uso

- Transcripción de reuniones en coreano en local: el modelo procesa audio de 16 kHz mono con un consumo máximo de unos 2,6 GB, lo que permite dictar o transcribir reuniones largas en un MacBook sin enviar datos a la nube.
- Subtitulado con marcas temporales: combinado con el alineador forzado de 0,6B, genera marcas de tiempo por palabra útiles para generar subtítulos SRT/VTT en vídeos coreanos.
- Notas de voz y dictado en aplicaciones de escritorio: la integración con Talkit permite transcribir grabaciones del sistema en tiempo real con un RTF de 0,10–0,13x, es decir, aproximadamente 8–10 veces más rápido que tiempo real.
- Prototipado de asistentes de voz en coreano: al ejecutarse en MLX sin PyTorch, se puede integrar en pipelines de Python ligeros para experimentar con ASR + LLM en el mismo portátil.
- Transcripción por lotes en estaciones de trabajo Mac: el bajo uso de memoria permite procesar varios audios en paralelo en un M1 Pro de 16 GB, aunque el throughput agregado no está documentado.
- Investigación en ASR de bajo recurso: sirve como referencia de cuantización agresiva con preservación de pesos (similitud coseno 99,97 %) para estudiar el impacto del recorte de vocabulario en la precisión.
- Despliegue en entornos con requisitos de privacidad: al ser Apache 2.0 y ejecutarse íntegramente en local, encaja en escenarios donde el audio no puede salir del dispositivo.

## Benchmarks y rendimiento

Los datos publicados por el autor corresponden a una prueba interna con tres audios TTS en coreano (1,6 s, 6,1 s y 11,9 s; 19,58 s en total) ejecutada en un Apple M1 Pro de 16 GB. No son benchmarks estándar (no hay MMLU, HumanEval ni GSM8K, que no aplican a un modelo ASR) y la comparación de precisión entre configuraciones no es concluyente porque las tres transcribieron con CER 0 %.

| Configuración | Peso | Memoria máx. | Carga | Tiempo total (3 audios) | RTF |
|---|---|---|---|---|---|
| 4-bit base (`…-MLX-4bit`) | 1 100 MB | 1 450 MB | 0,8–1,3 s | 2,41–2,45 s | 0,123–0,125x |
| Rung Ω 8-bit | 2 350 MB | 3 456 MB | 1,5–2,9 s | 2,42–3,00 s | 0,123–0,153x |
| Rung Ω lite (este modelo) | 1 557 MB | 2 663 MB | 1,4–1,6 s | 2,00–2,51 s | 0,102–0,128x |
| Rung Ω + alineador forzado | 2 350 + 926 MB | 4 103 MB | 2,7 s | 2,42 s + 0,78 s de alineación | 0,123x |

Para la precisión real sobre habla humana, el autor remite a la evaluación del modelo base `TeamUNIVA/qwen3_asr_1.7b_ko`, que no se incluye en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: unos 2 663 MB de pico en M1 Pro de 16 GB según la medición del autor; el peso en disco es de 1 557,1 MB.
- GPU compatibles: Apple Silicon M1, M2, M3 y M4 (MLX). No hay soporte documentado para CUDA ni ROCm en esta variante.
- Cabe en cualquier Mac con al menos 8 GB de memoria unificada, aunque el autor solo documenta pruebas en 16 GB.
- Opciones de despliegue: MLX con `rung_runtime.py` (sin PyTorch), aplicación Talkit para macOS y el paquete `qwen3-asr-mlx`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF de 0,102–0,128x en M1 Pro, equivalente a entre 8 y 10 veces tiempo real; carga del modelo en 1,4–1,6 s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato / plataforma |
|---|---|---|---|---|---|
| Rung Ω lite (este) | 594,7 M (repo) / 1,7B nominal | no disponible | Coreano (base: 52) | Apache 2.0 | safetensors MLX 4-bit, Apple Silicon |
| Rung Ω 8-bit (`…-RungOmega-MLX`) | 1,7B nominal | no disponible | Coreano | Apache 2.0 | safetensors MLX 8-bit, 2 350 MB |
| 4-bit base (`…-MLX-4bit`) | 1,7B nominal | no disponible | Coreano | Apache 2.0 | safetensors MLX 4-bit, 1 100 MB |
| `TeamUNIVA/qwen3_asr_1.7b_ko` | 1,7B nominal | no disponible | Coreano | Apache 2.0 | safetensors BF16, 4 480,9 MB |
| `Qwen/Qwen3-ASR-1.7B` | 1,7B | no disponible | 52 idiomas y dialectos | no disponible en la información | no disponible |

El modelo base Qwen3-ASR-1.7B se presenta en su repositorio como estado del arte entre los modelos ASR de código abierto, pero no se dispone de cifras concretas de benchmarks en la información proporcionada.

## Limitaciones y advertencias

- El ajuste fino está especializado en coreano; el rendimiento en otros idiomas, aunque el modelo base los soporte, no está documentado.
- El recorte del vocabulario de salida a 25 728 tokens puede degradar la transcripción de contenido no coreano o no ASCII (nombres propios extranjeros, símbolos, alfabetos no latinos).
- Solo funciona en Apple Silicon con MLX; no hay soporte para CUDA, ROCm ni CPU x86 documentado.
- La validación de precisión publicada se hizo con audio TTS, no con habla humana real, por lo que no demuestra robustez ante ruido, acentos o solapamientos.
- Riesgo de alucinación y de palabras fantasma en segmentos silenciosos o ruidosos; el alineador forzado mitiga parte del problema pero añade 926 MB y 0,78 s por transcripción.
- El repositorio tiene 0 descargas y 0 likes y fue creado el 2026-11-06, por lo que no hay validación independiente de la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base `TeamUNIVA/qwen3_asr_1.7b_ko` y de `Qwen/Qwen3-ASR-1.7B`, cuya licencia no se detalla en la información disponible.
- La model card incluye enlaces de donación y promesas de "cola prioritaria" para peticiones; no son características técnicas del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yeowon/qwen3_asr_1.7b_ko-RungOmega-MLX-lite
- Variante 8-bit: https://huggingface.co/yeowon/qwen3_asr_1.7b_ko-RungOmega-MLX
- Variante 4-bit base: https://huggingface.co/yeowon/qwen3_asr_1.7b_ko-MLX-4bit
- Alineador forzado: https://huggingface.co/yeowon/qwen3_forced_aligner_0.6b-RungOmega-MLX
- Modelo base ajustado: https://huggingface.co/TeamUNIVA/qwen3_asr_1.7b_ko
- Repositorio oficial de Qwen3-ASR: https://github.com/QwenLM/Qwen3-ASR
- Runtime de inferencia MLX: https://github.com/muzuksazo/desktop-recorder/blob/main/rung_runtime.py
- Aplicación Talkit: https://github.com/muzuksazo/desktop-recorder/releases/latest
- Foro de la comunidad del modelo: https://huggingface.co/yeowon/qwen3_asr_1.7b_ko-RungOmega-MLX-lite/discussions
