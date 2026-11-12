# Termuxphone/skikda-whisper-dz-ggml

## Resumen

Skikda Whisper DZ es un modelo de reconocimiento automatico del habla (ASR) derivado de Whisper Small y ajustado para dialectos arabes de Argelia, con enfasis en la darija argelina. Lo publica el usuario Termuxphone en Hugging Face bajo licencia Apache 2.0 y se distribuye unicamente como binario GGML cuantizado en `q5_1` (189,49 MB), pensado para inferencia local en CPU sobre Android ARM64 mediante Termux y `whisper.cpp`. El repositorio ocupa 0,2 GB y no incluye pesos en `safetensors` ni versiones sin cuantizar.

La propuesta del modelo es llevar ASR dialectal a dispositivos moviles de gama baja sin conexion a red: el binario cabe en memoria de un telefono y aprovecha extensiones NEON, ARM_FMA, FP16_VA y DOTPROD. La arquitectura de partida es Whisper Small (12 capas de encoder y 12 de decoder, estado oculto de 768), a la que el autor anade 1607 tokens especificos del dialecto. El modelo declara el idioma `ar` como unico y no publica resultados de benchmarks.

Es relevante en el nicho de ASR de bajo recurso: los dialectos magrebies estan mal cubiertos por Whisper estandar y los modelos grandes no caben en un telefono. Skikda Whisper DZ ofrece una alternativa de ~190 MB ejecutable en Termux, aunque con un historial de validacion practicamente inexistente (0 descargas y 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper Small (transformer encoder-decoder, 12 capas encoder / 12 decoder, hidden 768) + 1607 tokens especificos de dialecto |
| Parametros totales | no disponible (repo de 0,2 GB; binario q5_1 de 189,49 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper opera sobre ventanas de audio de 30 s) |
| Tipos de cuantizacion | `q5_1` (unica version publicada) |
| Idiomas soportados | `ar` (arabe; ajuste orientado a dialectos argelinos y darija) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGML binario (`ggml-whisper-dz-q5_1.bin`) para `whisper.cpp` |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Whisper Small, un transformer encoder-decoder con 12 capas en cada bloque y representacion oculta de 768 dimensiones, especializado en transcripcion de audio de 16 kHz mono. Sobre esa base, el autor incorpora 1607 tokens adicionales orientados a capturar fonetica y lexico del dialecto argelino. La distribucion es exclusivamente GGML cuantizada en `q5_1`, lo que reduce el binario a 189,49 MB y permite ejecucion en CPU ARM64 sin GPU.

No se dispone de informacion sobre el corpus de entrenamiento: ni numero de horas de audio, ni composicion del dataset, ni si hubo etapas de ajuste supervisado, RLHF o DPO. Tampoco se documentan tecnicas de aumentacion o regularizacion. La unica innovacion tecnica declarada es la compilacion especifica para instrucciones ARM (NEON, ARM_FMA, FP16_VA, DOTPROD), que acelera la inferencia en Android dentro de Termux.

## Capacidades

- Transcripcion de voz a texto en arabe, con ajuste declarado a dialectos argelinos y darija.
- Inferencia local en CPU sin conexion a red, mediante `whisper.cpp` y el binario `whisper-cli`.
- Ejecucion en Android ARM64 a traves de Termux, con soporte de las extensiones NEON, ARM_FMA, FP16_VA y DOTPROD.
- Procesamiento de audio de 16 kHz mono en formato WAV, con control de hilos (`-t`) y de beam search (`-bs`, `-bo`).
- No se documentan capacidades de traduccion, diarizacion, deteccion de idioma multilingue, tool calling ni razonamiento multi-paso.

## Casos de uso

- Transcripcion de notas de voz en movil: el binario de 189,49 MB se ejecuta en Termux sobre un telefono Android ARM64, permitiendo convertir grabaciones de 16 kHz mono a texto sin enviar audio a la nube.
- Subtitulado de entrevistas en darija argelina: el ajuste dialectal y los 1607 tokens especificos buscan mejorar la cobertura lexica frente a Whisper Small estandar en conversaciones coloquiales.
- Investigacion de ASR de bajo recurso: sirve como punto de partida reproducible para comparar el efecto del ajuste dialectal sobre Whisper Small en corpus argelinos.
- Despliegue en entornos sin conectividad: al no requerir red ni GPU, encaja en escenarios de campo, zonas rurales o dispositivos aislados donde la inferencia remota no es viable.
- Prototipado rapido en Android: los scripts de envoltura del repositorio `dialects-ai-foundry` permiten integrar la transcripcion en aplicaciones Termux sin compilar `whisper.cpp` desde cero.
- Transcripcion por lotes en CPU de bajo consumo: con `-t 4` y beam search configurable, puede procesar colas de audios cortos en un servidor ARM o en un telefono dedicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo esta pensado para CPU. Huella declarada en RAM de 189,49 MB para la cuantizacion `q5_1`.
- GPU recomendadas: no disponibles; el autor no documenta soporte GPU. El objetivo declarado es CPU ARM64.
- Compatibilidad con GPU de consumo: no documentada. El binario GGML podria cargarse en `whisper.cpp` con backend CUDA, pero no hay validacion publicada.
- CPU objetivo: Android ARM64 con NEON, ARM_FMA, FP16_VA y DOTPROD.
- Opciones de despliegue: `whisper.cpp` (`whisper-cli`), Termux en Android y los scripts de `attitawfikatti-alt/dialects-ai-foundry`.
- Latencia y throughput: no disponibles. El autor no publica tiempos de inferencia ni RTF (real-time factor).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Skikda Whisper DZ | Whisper Small + 1607 tokens | ventanas de 30 s (Whisper) | ar (dialectos argelinos) | Apache 2.0 | GGML q5_1 | 189,49 MB, CPU Android |
| Whisper Small (OpenAI) | ~244 M | ventanas de 30 s | multilingue | MIT | safetensors, GGML, etc. | Base generica, sin ajuste dialectal |
| Whisper Large-v3 (OpenAI) | ~1550 M | ventanas de 30 s | multilingue | MIT | safetensors, GGML, etc. | Mayor precision, no cabe en moviles de gama baja |
| Modelos ASR arabes dialectales de terceros | no disponible | no disponible | ar | variable | variable | No se dispone de comparativas publicadas con este modelo |

## Limitaciones y advertencias

- Ausencia total de validacion publica: 0 descargas y 0 likes en el momento de la consulta, sin benchmarks ni evaluaciones independientes.
- Riesgo de alucinacion y de transcripcion incorrecta en audio con ruido, solapamiento de hablantes o acentos no argelinos.
- Cobertura limitada al arabe y a dialectos argelinos; no se documenta comportamiento en otros idiomas ni deteccion automatica de lengua.
- Solo se distribuye la cuantizacion `q5_1`; no hay pesos sin cuantizar ni otras precisiones para evaluar el impacto de la cuantizacion.
- Sin informacion sobre el corpus de entrenamiento, lo que impide evaluar sesgos de dominio, genero o registro.
- Dependencia de `whisper.cpp` y de Termux: no hay integracion documentada con vLLM, TGI u otros servidores de inferencia.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene validar el modelo en el dominio concreto antes de produccion.
- El repositorio ocupa 0,2 GB y contiene un unico binario; no se incluyen scripts de evaluacion ni datasets de prueba.

## Enlaces

- Hugging Face: https://huggingface.co/Termuxphone/skikda-whisper-dz-ggml
- Repositorio de codigo y scripts: https://github.com/attitawfikatti-alt/dialects-ai-foundry
- Descarga directa del binario: https://huggingface.co/Termuxphone/skikda-whisper-dz-ggml/resolve/main/ggml-whisper-dz-q5_1.bin
- `whisper.cpp` (runtime): https://github.com/ggerganov/whisper.cpp
- Termux (entorno Android): https://termux.dev
