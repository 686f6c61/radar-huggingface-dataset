# xix3r/voxix-Qwen3-ASR-1.7B-gguf

## Resumen

voxix-Qwen3-ASR-1.7B-gguf es una conversión a formato GGUF del modelo Qwen3-ASR-1.7B de Alibaba Qwen, publicada por el usuario xix3r para su uso con el runtime transcribe.cpp. Se trata de un modelo de reconocimiento automático del habla (ASR) offline que combina un codificador de audio bidireccional con un modelo de lenguaje causal Qwen3, inyectando tokens de audio en el decodificador de texto. El resultado es un sistema de transcripción multilingüe capaz de detectar el idioma del audio y transcribirlo en esa misma lengua.

El modelo resuelve el problema de la transcripción de voz a texto en 30 idiomas con un único artefacto de 1,7B de parámetros (2.038.078.608 parámetros reales según safetensors), lo que lo sitúa en un rango de tamaño manejable para despliegue en CPU y GPU de consumo. La relevancia actual radica en que ofrece una alternativa abierta, con licencia Apache-2.0, a los sistemas propietarios de ASR, y en que su empaquetado GGUF permite ejecución local sin dependencias de servicios en la nube.

La conversión está portada del commit upstream 7278e1e (fijado el 2026-04-19) y validada contra la referencia qwen_asr 0.0.6 en el commit 3f61df7 de transcribe.cpp. El repositorio ocupa 14,9 GB e incluye múltiples cuantizaciones, desde BF16 hasta Q4_K_M. No soporta streaming ni traducción, pero sí detección automática de idioma.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Audio-LLM: codificador de audio bidireccional + LM causal Qwen3 con inyección de tokens de audio |
| Parámetros totales | 2.038.078.608 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 30: zh, en, yue, ar, de, fr, es, pt, id, it, ko, ru, th, vi, ja, tr, hi, ms, nl, sv, da, fi, pl, cs, fil, fa, el, ro, hu, mk |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura audio-LLM: un codificador de audio bidireccional procesa la señal y alimenta un modelo de lenguaje causal Qwen3 mediante inyección de tokens de audio. En esta variante de 1,7B, el codificador tiene `d_model=1024` con 16 cabezas de atención, mientras que el LM presenta `hidden_size=2048` e `intermediate_size=6144`. La entrada es un WAV mono a 16 kHz y la salida es una transcripción en el idioma detectado.

La model card original menciona que la familia Qwen3-ASR (que incluye también la variante de 0,6B) se entrenó con datos de habla a gran escala y aprovecha la capacidad de comprensión de audio del modelo base. No se detallan en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se especifican innovaciones como decodificación especulativa o atención lineal. La conversión a GGUF no altera la arquitectura, solo el formato de pesos y la cuantización.

## Capacidades

- Reconocimiento automático del habla offline en 30 idiomas, incluyendo chino mandarín, inglés, cantonés, árabe, alemán, francés, español, portugués, indonesio, italiano, coreano, ruso, tailandés, vietnamita, japonés, turco, hindi, malayo, neerlandés, sueco, danés, finés, polaco, checo, filipino, persa, griego, rumano, húngaro y macedonio.
- Detección automática del idioma del audio (`lang_detect: true`), emitiendo la transcripción en esa misma lengua.
- Transcripción de audio mono a 16 kHz en formato WAV.
- No soporta streaming (`streaming: false`).
- No soporta traducción (`translate: false`).
- No genera marcas de tiempo (`timestamps: none`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni visión.

## Casos de uso

- Transcripción de reuniones y actas: el modelo procesa grabaciones completas en WAV mono a 16 kHz y genera el texto en el idioma detectado, adecuado para equipos multilingües que necesitan actas automáticas sin enviar audio a la nube.
- Subtitulado de vídeo bajo demanda: aunque no genera timestamps, puede transcribir pistas de audio extraídas con ffmpeg y combinarse con herramientas externas de alineación para producir subtítulos en 30 idiomas.
- Atención al cliente y análisis de llamadas: la detección automática de idioma permite enrutar y transcribir conversaciones de soporte en distintos idiomas sin configurar el idioma manualmente.
- Investigación lingüística y corpus de habla: con cuantización Q8_0 y un WER de 3,23 % en inglés FLEURS, es viable generar transcripciones de corpus multilingües con calidad cercana a la de referencia.
- Despliegue en dispositivos de borde: la cuantización Q4_K_M ocupa 1,32 GB y mantiene un WER de 1,81 % en LibriSpeech test-clean, lo que permite ejecución en portátiles y mini-PC sin GPU dedicada.
- Accesibilidad y dictado local: integración en aplicaciones de escritorio que requieran dictado por voz privado, sin conexión y con licencia Apache-2.0 para uso comercial.
- Pipeline de moderación de contenido en audio: transcripción rápida de clips cortos para clasificación posterior, usando el modelo como primer eslabón del pipeline.

## Benchmarks y rendimiento

Resultados de WER/CER en FLEURS con cuantización Q8_0 (según la model card del autor):

| Idioma | Métrica | Q8_0 |
|---|---|---|
| Árabe (ar) | WER | 14,91 |
| Checo (cs) | WER | 22,97 |
| Danés (da) | WER | 21,23 |
| Alemán (de) | WER | 4,25 |
| Griego (el) | WER | 29,22 |
| Inglés (en) | WER | 3,23 |
| Español (es) | WER | 3,31 |
| Persa (fa) | WER | 28,29 |
| Finés (fi) | WER | 25,48 |
| Filipino (fil) | WER | 24,29 |
| Francés (fr) | WER | 4,52 |
| Hindi (hi) | WER | 7,84 |
| Húngaro (hu) | WER | 32,84 |
| Indonesio (id) | WER | 5,37 |
| Italiano (it) | WER | 2,68 |
| Japonés (ja) | CER | 5,29 |
| Coreano (ko) | CER | 4,60 |
| Macedonio (mk) | WER | 18,22 |
| Malayo (ms) | WER | 10,42 |
| Neerlandés (nl) | WER | 7,43 |
| Polaco (pl) | WER | 12,50 |
| Portugués (pt) | WER | 4,37 |
| Rumano (ro) | WER | 20,46 |
| Ruso (ru) | WER | 6,25 |
| Sueco (sv) | WER | 19,68 |
| Tailandés (th) | CER | 6,89 |
| Turco (tr) | WER | 9,46 |
| Vietnamita (vi) | WER | 6,15 |
| Cantonés (yue) | CER | 6,13 |
| Chino (zh) | CER | 7,14 |

Resultados en LibriSpeech test-clean (2.620 enunciados, batch size 1):

| Cuantización | WER (%) | Tamaño |
|---|---|---|
| BF16 | 1,62 | 4,08 GB |
| F16 | 1,62 | 4,09 GB |
| Q8_0 | 1,62 | 2,19 GB |
| Q6_K | 1,65 | 1,69 GB |
| Q5_K_M | 1,65 | 1,52 GB |
| Q4_K_M | 1,81 | 1,32 GB |

Rendimiento en tiempo real (RTF, menor es mejor):

| Plataforma | Backend | RTF |
|---|---|---|
| Apple M4 Max | CPU | 9,59 |
| Apple M4 Max | Metal | 41,08 |
| Ryzen 4750U | CPU | 2,47 |
| Ryzen 4750U | Vulkan | 4,08 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB en Q4_K_M, 1,5 GB en Q5_K_M, 1,7 GB en Q6_K, 2,2 GB en Q8_0 y 4,1 GB en BF16/F16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para Q8_0; para BF16 se recomiendan 6 GB o más. Funciona en Apple Silicon con backend Metal y en GPUs AMD/Intel con Vulkan.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090, así como en iGPU y Apple Silicon.
- Opciones de despliegue: transcribe.cpp (runtime nativo del formato), con soporte de CPU, Metal y Vulkan. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: los valores RTF indican que en M4 Max con Metal el RTF es 41,08 (más lento que tiempo real en esa configuración), mientras que en Ryzen 4750U con CPU es 2,47 y con Vulkan 4,08. El RTF mide la relación entre tiempo de procesamiento y duración del audio; valores superiores a 1 implican procesamiento más lento que tiempo real en la configuración medida.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Formato | WER inglés (LibriSpeech test-clean) |
|---|---|---|---|---|---|---|
| voxix-Qwen3-ASR-1.7B-gguf (Q8_0) | 2,04B | 30 | no disponible | Apache-2.0 | GGUF | 1,62 % |
| Qwen3-ASR-0.6B | 0,6B (aprox.) | no disponible en la información | no disponible | Apache-2.0 | safetensors | no disponible |
| Whisper large-v3 | no disponible en la información | no disponible en la información | no disponible | MIT (según conocimiento general, no verificado en la información) | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos ASR en la información proporcionada. La comparación con Whisper large-v3 u otros sistemas queda fuera del alcance de los datos disponibles.

## Limitaciones y advertencias

- No soporta streaming: solo procesa audio completo, lo que impide su uso en transcripción en tiempo real.
- No soporta traducción: transcribe en el idioma detectado, pero no traduce a otro idioma.
- No genera timestamps: no es adecuado para subtitulado que requiera alineación temporal precisa sin herramientas externas.
- Requiere audio mono a 16 kHz en formato WAV; es necesario convertir otros formatos con ffmpeg.
- El rendimiento varía mucho según el idioma: el WER en FLEURS va del 2,68 % en italiano al 32,84 % en húngaro, con idiomas como griego (29,22 %), persa (28,29 %) y finés (25,48 %) en la franja alta.
- El RTF medido en M4 Max con Metal (41,08) sugiere que la implementación Metal de transcribe.cpp puede ser lenta en esa configuración; conviene validar el rendimiento en el hardware objetivo.
- Riesgo de alucinación inherente a los modelos de lenguaje: pueden generarse transcripciones plausibles pero incorrectas en audio con ruido, acentos marcados o solapamiento de hablantes.
- Sesgos: no se documentan sesgos específicos en la información disponible; al ser un modelo entrenado con datos a gran escala, pueden aparecer sesgos lingüísticos y culturales.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda revisar el NOTICE y la model card original para conocer las condiciones de la conversión.
- La conversión fue realizada por un tercero (xix3r) y validada contra una referencia concreta; no es una publicación oficial de Qwen.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido ampliamente validado por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/xix3r/voxix-Qwen3-ASR-1.7B-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Commit upstream del modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B/commit/7278e1e
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/3f61df7
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/qwen3-asr-1.7b.md
- Licencia en el repositorio: https://huggingface.co/handy-computer/Qwen3-ASR-1.7B-gguf/blob/main/LICENSE
- NOTICE en el repositorio: https://huggingface.co/handy-computer/Qwen3-ASR-1.7B-gguf/blob/main/NOTICE
- Paper referenciado (arXiv:2601.21337): no se dispone de URL directa en la información proporcionada
