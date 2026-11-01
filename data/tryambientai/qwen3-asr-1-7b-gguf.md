# tryambientai/Qwen3-ASR-1.7B-gguf

## Resumen

Qwen3-ASR-1.7B es un modelo de reconocimiento automatico del habla (ASR) desarrollado por el equipo Qwen de Alibaba, publicado originalmente como parte de la familia Qwen3-ASR junto a una variante de 0.6B. El modelo resuelve la transcripcion de audio multilingue con identificacion automatica de idioma, cubriendo 30 idiomas y 22 dialectos chinos segun la model card original. Esta ficha describe concretamente la conversion a formato GGUF publicada por `tryambientai` para su uso con el runtime `transcribe.cpp`, derivada del modelo base `Qwen/Qwen3-ASR-1.7B` en el commit `7278e1e` fijado el 2026-04-19.

La arquitectura es de tipo audio-LLM: un codificador de audio bidireccional que alimenta un modelo de lenguaje causal Qwen3 mediante inyeccion de tokens de audio. El codificador emplea `d_model=1024` con 16 cabezas de atencion, mientras que el LM tiene `hidden_size=2048` e `intermediate_size=6144`. El modelo cuenta con 2.038.078.608 parametros totales segun safetensors, y la conversion GGUF ocupa 2.2 GB en el repositorio.

La relevancia de esta publicacion radica en que permite ejecutar un ASR multilingue de calidad estado del arte en hardware de consumo mediante cuantizacion GGUF y el runtime `transcribe.cpp`, sin necesidad de infraestructura GPU dedicada. La model card reporta un WER de 1.62% en LibriSpeech test-clean con BF16 y solo 1.81% con Q4_K_M, lo que demuestra una degradacion minima por cuantizacion gracias al mayor margen que ofrece el decodificador de 1.7B frente a la variante de 0.6B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio-LLM: codificador de audio bidireccional + LM causal Qwen3 con inyeccion de tokens de audio |
| Parametros totales | 2.038.078.608 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 30 idiomas: zh, en, yue, ar, de, fr, es, pt, id, it, ko, ru, th, vi, ja, tr, hi, ms, nl, sv, da, fi, pl, cs, fil, fa, el, ro, hu, mk |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (runtime `transcribe.cpp`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura audio-LLM en la que un codificador de audio bidireccional procesa la senal acustica y proyecta sus representaciones como tokens que se inyectan en un modelo de lenguaje causal Qwen3. Segun la model card, el codificador tiene `d_model=1024` con 16 cabezas de atencion, y el LM tiene `hidden_size=2048` e `intermediate_size=6144`. Esta estructura es identica en diseno a la variante de 0.6B, pero con dimensiones mayores en ambas torres. El modelo base se apoya en la capacidad de comprension de audio de Qwen3-Omni y fue entrenado con datos de habla a gran escala, aunque la informacion proporcionada no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La model card original menciona que la familia Qwen3-ASR soporta inferencia unificada en modo streaming y offline con un solo modelo, y que la variante de 0.6B alcanza 2000 veces de throughput con concurrencia 128. Para esta conversion GGUF concreta, la metadata de `transcribe.cpp` indica `streaming: false`, `translate: false`, `lang_detect: true` y `timestamps: none`, lo que significa que la version portada no expone streaming ni marcas de tiempo, pero si deteccion automatica de idioma. La entrada debe ser WAV mono a 16 kHz y no se admiten pistas explicitas de idioma en esta implementacion.

## Capacidades

- Transcripcion de voz a texto multilingue con deteccion automatica de idioma entre 30 idiomas.
- Soporte de dialectos chinos (22 dialectos segun la model card original) y acentos de ingles de multiples regiones.
- Reconocimiento robusto en entornos acusticos complejos y patrones de texto dificiles, segun la model card.
- Capacidad de transcribir audio largo (mencionada en la model card original para la familia Qwen3-ASR).
- Deteccion automatica de idioma activada (`lang_detect: true` en la metadata de `transcribe.cpp`).
- No soporta traduccion automatica (`translate: false`).
- No soporta marcas de tiempo (`timestamps: none`) en esta conversion.
- No soporta streaming (`streaming: false`) en esta conversion.
- No admite pistas explicitas de idioma en esta implementacion.

## Casos de uso

- Transcripcion de reuniones y notas de voz: el modelo procesa audio WAV mono a 16 kHz y genera la transcripcion en el idioma detectado automaticamente, adecuado para actas de reuniones en entornos corporativos multilingues. La deteccion automatica de idioma evita configuracion manual por reunion.
- Subtitulado offline de contenido audiovisual: convirtiendo previamente el audio a 16 kHz mono con `ffmpeg`, se pueden generar transcripciones de videos en 30 idiomas. La ausencia de marcas de tiempo obliga a un alineamiento posterior externo, pero la calidad de transcripcion (WER 1.81% en Q4_K_M sobre LibriSpeech) reduce el trabajo de correccion.
- Atencion al cliente con transcripcion de llamadas: el modelo puede transcribir grabaciones de llamadas en varios idiomas para su analisis posterior, con la ventaja de ejecutarse en hardware de consumo mediante cuantizacion Q4_K_M (1.23 GB).
- Investigacion linguistica y corpus de habla: la cobertura de 30 idiomas y dialectos chinos permite construir corpus transcritos de forma automatizada, con la salvedad de que no se generan timestamps y se requiere alineamiento forzado externo (la model card menciona Qwen3-ForcedAligner-0.6B como solucion complementaria).
- Despliegue en dispositivos de borde: con Q4_K_M (1.23 GB) y un RTF de 39.5 en Metal sobre Apple M4 Max y 3.8 en Vulkan sobre Ryzen 4750U, el modelo es viable en portatiles y equipos sin GPU dedicada para transcripcion por lotes.
- Accesibilidad: generacion de transcripciones para personas con discapacidad auditiva en contenido multilingue, ejecutandose localmente sin envio de audio a servicios en la nube, lo que preserva la privacidad.
- Pipeline de analisis de contenido: integracion en flujos que requieran convertir audio a texto antes de un analisis posterior con LLM, aprovechando la salida en el idioma original sin traduccion.

## Benchmarks y rendimiento

Resultados de WER sobre LibriSpeech `test-clean` (2620 enunciados en ingles, normalizador de texto estilo Whisper, jiwer 3.x, backend Metal en Apple M4):

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| BF16 | 3.80 GB | 1.62% |
| F16 | 3.81 GB | 1.62% |
| Q8_0 | 2.04 GB | 1.61% |
| Q6_K | 1.58 GB | 1.65% |
| Q5_K_M | 1.41 GB | 1.65% |
| Q4_K_M | 1.23 GB | 1.81% |

Rendimiento en tiempo real (RTF, factor de tiempo real):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 39.5 |
| Apple M4 Max | CPU | 8 |
| Ryzen 4750U | Vulkan | 3.8 |
| Ryzen 4750U | CPU | 2 |

La model card indica que BF16, F16, Q8_0, Q6_K y Q5_K_M estan dentro del intervalo de confianza bootstrap entre si, y que Q4_K_M solo empeora aproximadamente 0.2 puntos de WER. No se han publicado en la informacion disponible resultados de benchmarks multilingues ni comparativas con APIs comerciales mas alla de la afirmacion cualitativa de la model card original de que el modelo es competitivo con las APIs propietarias mas fuertes.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1.3 GB para Q4_K_M (1.23 GB de pesos), 1.6 GB para Q5_K_M, 2.1 GB para Q8_0 y 3.9 GB para BF16/F16, mas overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para las cuantizaciones bajas; Apple Silicon con Metal (RTF 39.5 en M4 Max); GPUs AMD/Intel con Vulkan (RTF 3.8 en Ryzen 4750U).
- Cabe en GPU de consumo: si, en tarjetas con 4 GB o mas para Q4_K_M y Q5_K_M; las cuantizaciones BF16/F16 requieren al menos 6 GB.
- Opciones de despliegue: `transcribe.cpp` (runtime oficial de esta conversion, con CLI `transcribe-cli`); no se mencionan otros runtimes en la informacion disponible.
- Latencia y throughput: RTF de 39.5 (Metal M4 Max), 8 (CPU M4 Max), 3.8 (Vulkan Ryzen 4750U) y 2 (CPU Ryzen 4750U). El RTF mide la relacion entre duracion de audio y tiempo de procesamiento; valores mas altos indican mayor velocidad relativa.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Formato | Notas |
|---|---|---:|---|---|---|---|
| Qwen3-ASR-1.7B (esta conversion GGUF) | 2.038 M | 30 | No disponible | Apache-2.0 | GGUF | WER 1.62% BF16 en LibriSpeech test-clean |
| Qwen3-ASR-0.6B | No disponible | 30 | No disponible | Apache-2.0 | Original / posible GGUF | Variante menor, 2000x throughput a concurrencia 128 segun model card |
| Whisper large-v3 | No disponible | ~99 | No disponible | MIT (segun conocimiento publico, no verificado en esta informacion) | Multiples | Referencia ASR open source; sin datos comparativos en esta informacion |

La informacion proporcionada no incluye comparativas directas con Whisper u otros modelos ASR en benchmarks comunes, por lo que la comparativa se limita a la variante de 0.6B de la misma familia y a la referencia cualitativa de la model card original sobre competitividad con APIs propietarias. No se dispone de datos de WER de Whisper large-v3 en esta informacion para una comparacion cuantitativa.

## Limitaciones y advertencias

- Esta conversion no soporta streaming (`streaming: false`), a diferencia de la familia Qwen3-ASR original que menciona inferencia streaming/offline unificada.
- No soporta traduccion (`translate: false`): solo transcribe en el idioma detectado, no traduce.
- No genera marcas de tiempo (`timestamps: none`); para alineamiento temporal se requiere una solucion externa como Qwen3-ForcedAligner-0.6B.
- No admite pistas explicitas de idioma; la deteccion es siempre automatica, lo que puede fallar en audios con cambio de idioma o ruido.
- Entrada restringida a WAV mono a 16 kHz; es necesario convertir otros formatos con `ffmpeg`.
- Los benchmarks publicados solo cubren ingles (LibriSpeech test-clean); no hay datos de WER para los otros 29 idiomas en la informacion disponible.
- Riesgo de alucinacion y errores en entornos acusticos adversos: la model card afirma robustez, pero no se aportan metricas de ruido o acentos.
- El modelo tiene 0 descargas y 0 likes en HuggingFace en el momento de la consulta, lo que indica que la conversion es reciente y no ha sido validada por la comunidad.
- Licencia Apache-2.0 heredada del modelo base, permisiva para uso comercial, pero se recomienda consultar la model card original de Qwen para terminos completos.
- La fecha de creacion del repositorio (2026-11-01) y la referencia a un paper arXiv (2601.21337) no han podido verificarse en esta informacion.

## Enlaces

- Repositorio HuggingFace de esta conversion: https://huggingface.co/tryambientai/Qwen3-ASR-1.7B-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Commit del modelo base fijado: https://huggingface.co/Qwen/Qwen3-ASR-1.7B/commit/7278e1e70fe206f11671096ffdd38061171dd6e5
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validacion de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/3f61df7
- Pagina del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/qwen3-asr-1.7b.md
- Paper referenciado en tags: arxiv:2601.21337 (no verificado en esta informacion)
