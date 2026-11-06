# tryambientai/moonshine-base-ko-gguf

## Resumen

`moonshine-base-ko-gguf` es la conversión a formato GGUF del modelo de reconocimiento automático del habla `UsefulSensors/moonshine-base-ko`, una adaptación al coreano de la familia Moonshine desarrollada por Useful Sensors. El modelo original emplea una arquitectura transformer encoder-decoder de 61,5 millones de parámetros (aproximadamente 62M), diseñada específicamente para transcripción de voz en dispositivos con recursos limitados. Esta versión GGUF, publicada por `tryambientai`, está pensada para su uso con `transcribe.cpp`, una implementación en C++ que permite ejecutar el modelo sin depender de Python ni de PyTorch.

La relevancia de esta ficha radica en su carácter práctico: se trata de un modelo de ASR monolingüe (coreano) con licencia MIT, pesos de tan solo 74 MB en cuantización Q8_0, y una arquitectura que consume PCM crudo a 16 kHz mediante un stem Conv1d de tres capas, prescindiendo de STFT y de bancos de filtros mel. Esto reduce la latencia y el coste computacional en comparación con arquitecturas tipo Whisper, a costa de renunciar a funcionalidades como detección de idioma, traducción o marcas temporales.

El modelo no soporta streaming ni traducción, y su salida es únicamente texto transcrito en coreano. Los datos de validación publicados por el autor de la conversión reportan un CER del 8,00% en FLEURS-ko (F32/F16) y del 8,13% en Q8_0, lo que sitúa su precisión en un rango razonable para un modelo de este tamaño en una única lengua.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con stem Conv1d de 3 capas (sin STFT ni mel filterbank) |
| Parámetros totales | 61.513.920 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo ASR; entrada de audio, no texto) |
| Tipos de cuantización | F32, F16, Q8_0 |
| Idiomas soportados | Coreano (ko) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Moonshine original: un transformer encoder-decoder que procesa audio PCM crudo a 16 kHz mediante un stem convolucional de tres capas Conv1d. A diferencia de Whisper, no utiliza STFT ni banco de filtros mel, lo que simplifica el preprocesado y reduce el coste computacional en inferencia. El modelo base `UsefulSensors/moonshine-base-ko` fue afinado por Useful Sensors sobre el checkpoint `moonshine-base` para el idioma coreano, manteniendo la misma configuración de 62M de parámetros.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original. La model card de esta conversión GGUF no incluye esos datos, y la model card upstream reproducida tampoco los detalla. La conversión fue realizada a partir del commit `fff6035` del modelo base, fijado el 2026-05-12, y validada contra la referencia de Transformers en el commit `90bf720` de `transcribe.cpp` en la misma fecha.

## Capacidades

- Transcripción de voz a texto en coreano a partir de audio PCM mono a 16 kHz.
- Entrada de audio crudo sin preprocesado STFT ni mel filterbank.
- Salida de transcripción únicamente (texto plano, sin estructura adicional).
- No soporta streaming (indicado explícitamente en la model card: `streaming: false`).
- No soporta traducción (`translate: false`).
- No soporta detección de idioma (`lang_detect: false`).
- No genera marcas temporales (`timestamps: none`).
- No soporta tool calling ni function calling (no es un modelo de lenguaje generativo).
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al coreano.

## Casos de uso

- Transcripción de reuniones y notas de voz en coreano: el modelo puede convertir grabaciones de audio mono a 16 kHz en texto plano, adecuado para actas y resúmenes posteriores, con un tamaño de pesos que permite ejecución local sin GPU dedicada.
- Subtitulado automático de contenido audiovisual en coreano: dado que no genera marcas temporales, se usaría para obtener el texto y posteriormente alinear los subtítulos con herramientas externas; su licencia MIT facilita la integración en pipelines comerciales.
- Asistentes de voz embebidos en dispositivos de bajo consumo: con 74 MB en Q8_0 y soporte para CPU y Vulkan, puede desplegarse en hardware modesto (por ejemplo, Ryzen 4750U) para comandos de voz en coreano.
- Transcripción en aplicaciones de accesibilidad para hablantes de coreano: conversión de voz a texto en tiempo casi real en entornos de escritorio, aprovechando el rendimiento reportado en Metal (RTF 79,5) y CPU (RTF 80,5) en M4 Max.
- Procesamiento por lotes de archivos de audio en servidores: la implementación en C++ de `transcribe.cpp` permite integrar la transcripción en servicios backend sin dependencias de Python, reduciendo la superficie de despliegue.
- Investigación en ASR de bajo resource: sirve como referencia para estudiar el rendimiento de arquitecturas sin STFT en coreano, con métricas CER publicadas sobre FLEURS-ko y posibilidad de comparar cuantizaciones F32, F16 y Q8_0.

## Benchmarks y rendimiento

| Métrica | F32 | F16 | Q8_0 |
|---|---:|---:|---:|
| CER FLEURS-ko test (382 utterances) | 8,00% | 8,00% | 8,13% |
| RTF M4 Max (Metal) | — | — | 79,5 |
| RTF M4 Max (CPU) | — | — | 80,5 |
| RTF Ryzen 4750U (Vulkan) | — | — | 34,5 |
| RTF Ryzen 4750U (CPU) | — | — | 22 |

Referencia adicional: la implementación de Transformers en F32 sobre MPS obtuvo un CER del 8,19% sobre el mismo manifiesto. El autor indica que las cifras F32/F16 en C++ coinciden con la referencia dentro del ruido de bootstrap, y que Q8_0 introduce una deriva adicional típicamente inferior a 0,1 puntos porcentuales respecto a F16.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todas las cuantizaciones; el modelo completo en F32 ocupa 236 MB y en Q8_0 tan solo 74 MB.
- GPU recomendadas: no se requieren GPU dedicadas; el modelo está diseñado para ejecución en CPU y en aceleradores integrados. Se reportan mediciones en Apple M4 Max (Metal y CPU) y en AMD Ryzen 4750U (Vulkan y CPU).
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo e incluso en dispositivos sin GPU dedicada.
- Opciones de despliegue: `transcribe.cpp` (compilación desde fuente con CMake), con soporte para Metal, Vulkan y CPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: los valores RTF (real-time factor) reportados indican que el modelo procesa audio más rápido que tiempo real en los hardware probados; por ejemplo, RTF 79,5 en M4 Max con Metal implica un procesamiento muy superior al tiempo real.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Formato | CER FLEURS-ko |
|---|---:|---|---|---|---|---:|
| moonshine-base-ko-gguf | 61,5M | Coreano | No aplica (ASR) | MIT | GGUF | 8,00% (F32) |
| Whisper base | 74M | Multilingüe (99 idiomas) | No aplica (ASR) | MIT | Safetensors, GGUF | No disponible en la información |
| Whisper small | 244M | Multilingüe (99 idiomas) | No aplica (ASR) | MIT | Safetensors, GGUF | No disponible en la información |
| Moonshine base (original) | 62M | Inglés | No aplica (ASR) | MIT | Safetensors | No disponible en la información |

No se dispone de datos de benchmarks comparativos directos entre estos modelos en la información proporcionada. La comparación se limita a parámetros, idiomas, licencia y formato.

## Limitaciones y advertencias

- Modelo monolingüe: solo transcribe coreano; no detecta idioma ni traduce.
- Sin soporte de streaming: no apto para aplicaciones de transcripción en tiempo real continua.
- Sin marcas temporales: no genera timestamps, lo que limita su uso directo en subtitulado sincronizado.
- Riesgo de alucinación: como todo modelo ASR, puede generar texto plausible en segmentos de audio ruidosos o silenciosos; la model card original menciona la limitación de longitud máxima de generación para evitar bucles de alucinación.
- Sesgos: no se documentan sesgos específicos en la información disponible; al estar entrenado sobre un corpus coreano, puede presentar sesgos dialectales o de dominio.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificación y redistribución con atribución y sin garantías.
- Caveat de producción: la conversión GGUF está validada contra una versión concreta de `transcribe.cpp` (commit `90bf720`); cambios en la implementación pueden afectar a la compatibilidad.
- El modelo base fue fijado en un commit concreto (`fff6035`, 2026-05-12); no se garantiza la equivalencia con versiones posteriores del modelo upstream.

## Enlaces

- [Hugging Face: tryambientai/moonshine-base-ko-gguf](https://huggingface.co/tryambientai/moonshine-base-ko-gguf)
- [Modelo base: UsefulSensors/moonshine-base-ko](https://huggingface.co/UsefulSensors/moonshine-base-ko)
- [Repositorio transcribe.cpp](https://github.com/handy-computer/transcribe.cpp)
- [Documentación de modelos Moonshine en transcribe.cpp](https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine.md)
- [Paper Moonshine (arXiv:2410.15608)](https://arxiv.org/abs/2410.15608)
- [Paper Model Cards for Model Reporting (arXiv:1810.03993)](https://arxiv.org/abs/1810.03993)
- [Blog de presentación de Moonshine](https://petewarden.com/2024/10/21/introducing-moonshine-the-new-state-of-the-art-for-speech-to-text/)
- [Repositorio Moonshine de Useful Sensors](https://github.com/usefulsensors/moonshine/blob/main/README.md)
- [Podcast sobre Moonshine](https://notebooklm.google.com/notebook/d787d6c2-7d7b-478c-b7d5-a0be4c74ae19/audio)
