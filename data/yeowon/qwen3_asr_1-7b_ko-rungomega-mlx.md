# yeowon/qwen3_asr_1.7b_ko-RungOmega-MLX

## Resumen

`yeowon/qwen3_asr_1.7b_ko-RungOmega-MLX` es una conversión cuantizada para Apple Silicon de un modelo de reconocimiento automático del habla (ASR) especializado en coreano. Parte del modelo `TeamUNIVA/qwen3_asr_1.7b_ko`, un ajuste fino del Qwen3-ASR-1.7B de Alibaba sobre datos en coreano, y lo reempaqueta en formato MLX con cuantización de 8 bits y grupo de 128, orientado a ejecución nativa en Metal sobre chips M1, M2, M3 y M4.

El autor, `yeowon`, publica esta variante bajo la denominación "Rung Omega", una familia de conversiones que aplica varias optimizaciones sobre la cuantización estándar: reduce la capa de salida a un subconjunto de vocabulario coreano y ASCII (25.728 tokens frente a los 151.936 del vocabulario completo), fusiona proyecciones Q/K/V y Gate/Up para disminuir llamadas a Metal, y ofrece integración opcional con un alineador forzado de 0.6B que proporciona marcas temporales a nivel de palabra.

El modelo resuelve el problema de transcribir audio en coreano en local sobre hardware de consumo de Apple, sin depender de servicios en la nube. Con 788,6 millones de parámetros reales en los safetensors y un peso de repositorio de 2,5 GB, se posiciona como una alternativa de precisión frente a la variante ligera de 4 bits del mismo autor, a costa de mayor uso de memoria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Derivada de Qwen3-ASR (encoder de audio + decoder tipo transformer); detalles internos no disponibles |
| Parámetros totales | 788.592.256 (según safetensors); el nombre comercial indica 1.7B |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | MLX 8-bit, group_size 128 (decoder); encoder de audio incluido |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), librería `mlx` |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a la familia Qwen3-ASR, que combina un encoder de audio con un decoder de lenguaje derivado de Qwen3-Omni, según la documentación pública del proyecto original. El modelo base `TeamUNIVA/qwen3_asr_1.7b_ko` es un ajuste fino sobre datos de habla en coreano, aunque no se dispone de detalles sobre el volumen de tokens, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

La innovación principal de esta variante es el proceso de cuantización "Rung Omega" sobre MLX. Según la model card, el decoder se cuantiza a 8 bits con grupo de 128 mediante `nn.quantize`, manteniendo una similitud coseno del 99,97 % respecto a los pesos originales en BF16. Además, la capa de salida se restringe a 25.728 tokens (coreano y ASCII), lo que reduce el coste de cálculo del output en aproximadamente 5,9 veces, y se fusionan las proyecciones Q/K/V y Gate/Up para eliminar 84 llamadas a Metal por token. El resultado es un peso de 2.349,7 MB frente a los 4.480,9 MB del original en BF16.

## Capacidades

- Reconocimiento automático del habla en coreano a partir de audio mono a 16 kHz.
- Transcripción con métricas de proceso expuestas por la API (`transcribe_with_metrics`).
- Alineación forzada opcional a nivel de palabra (marcas de inicio, fin y confianza) mediante el modelo complementario `qwen3_forced_aligner_0.6b-RungOmega-MLX`.
- Ejecución nativa en Apple Silicon mediante MLX, sin dependencia de PyTorch.
- Integración directa con la aplicación de escritorio Talkit para macOS.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción de reuniones y notas de voz en coreano: el modelo procesa audio mono a 16 kHz y devuelve texto plano, adecuado para flujos de dictado local en Mac sin enviar datos a la nube.
- Subtitulado con marcas temporales: combinado con el alineador forzado de 0.6B, genera tiempos por palabra, lo que permite construir subtítulos SRT o VTT sincronizados para vídeo en coreano.
- Archivado y búsqueda de grabaciones: al ejecutarse en local con un peso de 2,35 GB, permite indexar grandes volúmenes de audio histórico en un portátil Apple sin coste por API.
- Investigación en ASR coreano: sirve como punto de comparación reproducible en MLX frente a la variante de 4 bits y al modelo original, con métricas de RTF y memoria documentadas.
- Prototipado de asistentes de voz: la API de Python (`rung_runtime`) facilita integrar la transcripción en pipelines de procesamiento de lenguaje natural en coreano.
- Aplicaciones de accesibilidad: transcripción en tiempo casi real (RTF de 0,12x, unas 8 veces más rápido que el tiempo real en un M1 Pro) para personas con dificultades auditivas en entornos de habla coreana.
- Evaluación de calidad de TTS: el propio autor emplea el modelo para verificar la fidelidad de síntesis de voz en coreano, comparando la transcripción con el texto original.

## Benchmarks y rendimiento

Los datos publicados por el autor corresponden a pruebas de velocidad y memoria en un Apple M1 Pro de 16 GB, con tres audios sintéticos en coreano (19,58 segundos en total). No se han publicado resultados de benchmarks estándar (MMLU, CER sobre corpus reales, etc.) en la información disponible.

| Configuración | Peso | Memoria máxima | Carga | Tiempo total (3 audios) | RTF |
|---|---|---|---|---|---|
| 4-bit básico | 1.100 MB | 1.450 MB | 0,8–1,3 s | 2,41–2,45 s | 0,123–0,125x |
| Rung Omega (esta ficha) | 2.350 MB | 3.456 MB | 1,5–2,9 s | 2,42–3,00 s | 0,123–0,153x |
| Rung Omega lite (4-bit) | 1.557 MB | 2.663 MB | 1,4–1,6 s | 2,00–2,51 s | 0,102–0,128x |
| Rung Omega + alineador | 2.350 + 926 MB | 4.103 MB | 2,7 s | 2,42 s + 0,78 s de alineación | 0,123x |

Las tres configuraciones transcribieron los audios de prueba sin errores a nivel de carácter (CER 0 %), aunque al tratarse de voces sintéticas el autor advierte que esta prueba no discrimina la precisión entre variantes. Para la evaluación sobre habla real remite a la model card del modelo original.

## Requisitos de hardware

- VRAM/memoria unificada estimada: unos 3,5 GB en ejecución para esta variante de 8 bits, según la medición del autor.
- GPU recomendadas: Apple Silicon M1, M2, M3 o M4 (probado en M1 Pro de 16 GB); no es compatible con CUDA ni con GPU de NVIDIA.
- Cabe en equipos de consumo Apple con 8 GB o más de memoria unificada, aunque 16 GB ofrece mayor margen.
- Opciones de despliegue: MLX con el runtime `rung_runtime.py`, la aplicación Talkit para macOS, o el paquete `qwen3-asr-mlx`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Rendimiento: RTF de 0,123–0,153x en M1 Pro, equivalente a entre 6,5 y 8 veces el tiempo real; la carga del modelo tarda entre 1,5 y 2,9 segundos.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (Rung Omega MLX) | 788,6 M (nominal 1.7B) | Coreano | No disponible | Apache 2.0 | MLX safetensors 8-bit | Hugging Face, solo Apple Silicon |
| `yeowon/qwen3_asr_1.7b_ko-RungOmega-MLX-lite` | 788,6 M (nominal 1.7B) | Coreano | No disponible | Apache 2.0 | MLX safetensors 4-bit | Hugging Face, solo Apple Silicon |
| `TeamUNIVA/qwen3_asr_1.7b_ko` (base) | No disponible | Coreano | No disponible | No disponible | No disponible | Hugging Face |
| `Qwen/Qwen3-ASR-1.7B` (original) | 1,7 B (nominal) | 52 idiomas y dialectos | No disponible | No disponible | No disponible | Hugging Face, GitHub |

La comparación con el Qwen3-ASR original es la más relevante en cuanto a cobertura lingüística: el modelo de Alibaba soporta 52 idiomas y dialectos, mientras que esta variante está especializada exclusivamente en coreano. Frente a la versión lite del mismo autor, la diferencia es de precisión frente a velocidad y memoria (2,35 GB y RTF 0,123–0,153x frente a 1,56 GB y RTF 0,102–0,128x).

## Limitaciones y advertencias

- Solo transcribe coreano; no soporta otros idiomas pese a que el modelo Qwen3-ASR original cubre 52.
- Requiere hardware Apple Silicon; no funciona en GPU NVIDIA ni en CPU x86 mediante MLX.
- La cuantización a 8 bits reduce la fidelidad respecto al BF16 original, aunque el autor reporta una similitud coseno del 99,97 %.
- La validación de precisión publicada se basa en tres audios sintéticos de TTS, insuficiente para estimar el rendimiento sobre habla real, ruido de fondo o acentos.
- Riesgo de alucinación y de palabras fantasma en los extremos de las frases; el autor recomienda el alineador forzado para mitigarlo.
- No se documentan sesgos específicos ni evaluaciones de robustez sobre poblaciones o dialectos coreanos.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base `TeamUNIVA/qwen3_asr_1.7b_ko` y del Qwen3-ASR original antes de desplegar en producción.
- La model card incluye llamadas a donaciones y enlaces de pago; no afectan al uso técnico, pero conviene ignorarlas.
- El modelo tiene 0 descargas y 0 "likes" en el momento de la consulta, por lo que carece de validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yeowon/qwen3_asr_1.7b_ko-RungOmega-MLX
- Modelo base: https://huggingface.co/TeamUNIVA/qwen3_asr_1.7b_ko
- Variante lite (4-bit): https://huggingface.co/yeowon/qwen3_asr_1.7b_ko-RungOmega-MLX-lite
- Alineador forzado: https://huggingface.co/yeowon/qwen3_forced_aligner_0.6b-RungOmega-MLX
- Variante 4-bit básica: https://huggingface.co/yeowon/qwen3_asr_1.7b_ko-MLX-4bit
- Repositorio del runtime: https://github.com/muzuksazo/desktop-recorder
- Aplicación Talkit: https://github.com/muzuksazo/desktop-recorder/releases/latest
- Qwen3-ASR original en Hugging Face: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Repositorio Qwen3-ASR: https://github.com/QwenLM/Qwen3-ASR
