# ysdede/gigaam-v3-e2e-rnnt-onnx

## Resumen

`ysdede/gigaam-v3-e2e-rnnt-onnx` es una exportación a formato ONNX del checkpoint `v3_e2e_rnnt` del modelo GigaAM, desarrollado originalmente por el equipo de Salute Developers (Sber). Se trata de un modelo de reconocimiento automático del habla (ASR) end-to-end con arquitectura RNNT (Recurrent Neural Network Transducer), empaquetado en grafos ONNX en precisión FP32 para su uso en el ecosistema ASRJS, una librería de reconocimiento de voz para JavaScript.

La relevancia de esta ficha es acotada: no se trata de un modelo nuevo ni de un fine-tuning, sino de una conversión de formato publicada por un tercero (`ysdede`). El repositorio pesa 0,9 GB y contiene los grafos ONNX junto con un recibo de procedencia (*provenance receipt*) que documenta el checkpoint de origen (MD5 `2730de7545ac43ad256485a462b0a27a`). El autor declara explícitamente que no se reclama ninguna métrica de precisión ni paridad con el modelo original en navegador por el mero hecho de la publicación.

La model card es extremadamente escueta y no aporta información sobre arquitectura interna, datos de entrenamiento, número de parámetros ni idiomas soportados más allá de la referencia al repositorio upstream de GigaAM. Todo lo que no figure en esa referencia debe considerarse no disponible en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RNNT (Recurrent Neural Network Transducer), end-to-end ASR |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los grafos publicados son FP32) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (grafos FP32) |

## Arquitectura y entrenamiento

El modelo se basa en la familia GigaAM de Salute Developers, cuyo checkpoint `v3_e2e_rnnt` emplea una arquitectura RNNT para reconocimiento de voz end-to-end. La exportación publicada conserva los grafos FP32 sin modificaciones respecto a la exportación local registrada por el autor, según se indica en la model card. No se detalla en la información disponible la composición del encoder (tipo de capas, atención, convoluciones), el número de tokens de entrenamiento, ni si hubo etapas de RLHF o ajuste supervisado adicional.

Tampoco se documentan innovaciones técnicas específicas de esta variante más allá del propio esquema RNNT, que combina un encoder acústico con un predictor y una capa de unión (*joint network*) para emitir secuencias de tokens sin necesidad de alineamientos explícitos. Cualquier detalle adicional sobre el entrenamiento debe consultarse en el repositorio upstream de GigaAM, no incluido en esta model card.

## Capacidades

- Reconocimiento automático del habla (ASR) end-to-end mediante arquitectura RNNT.
- Ejecución en formato ONNX, orientada a su integración en el ecosistema ASRJS para aplicaciones JavaScript.
- Inferencia en FP32 según los grafos publicados.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step, visión ni audio más allá del propio ASR.
- No se especifican capacidades multilingües en la información disponible.
- No se documenta modo *thinking* ni funcionalidades especiales adicionales.

## Casos de uso

- Transcripción de voz en aplicaciones web: al estar exportado a ONNX y orientado a ASRJS, puede integrarse en frontends JavaScript para transcribir audio del usuario en el navegador, siempre que se valide la paridad de precisión con el modelo original (el autor no la garantiza).
- Subtitulado automático de contenido audiovisual: el modelo RNNT permite generar transcripciones alineadas temporalmente si el pipeline de decodificación lo soporta, útil para plataformas de vídeo.
- Asistentes de voz en entornos controlados: la licencia MIT facilita su incorporación en productos comerciales de dictado o comandos por voz, previa verificación del rendimiento en el dominio objetivo.
- Prototipado rápido en Node.js: la disponibilidad de grafos ONNX permite desplegar un servicio de transcripción sin depender de frameworks de deep learning pesados.
- Investigación en ASR: sirve como referencia reproducible (con recibo de procedencia y MD5) para comparar exportaciones ONNX frente al checkpoint original.
- Integración en pipelines de accesibilidad: transcripción de audio a texto para herramientas de accesibilidad web, con la cautela de validar idioma y calidad en el caso de uso concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que la publicación por sí sola no constituye una afirmación de precisión ni de paridad en navegador.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del tamaño real del checkpoint, no documentado).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinada en la información proporcionada.
- Opciones de despliegue: ONNX Runtime (principal, dado el formato), potencialmente otros runtimes compatibles con ONNX; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo ASR ONNX).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| ysdede/gigaam-v3-e2e-rnnt-onnx | RNNT | no disponible | no disponible | MIT | ONNX |
| GigaAM v3_e2e_rnnt (upstream) | RNNT | no disponible | no disponible | no disponible en esta ficha | checkpoint original |
| Whisper (OpenAI) | Transformer encoder-decoder | variable por variante | 30 s de audio por ventana | MIT | safetensors, GGUF, ONNX |
| Wav2Vec 2.0 (Meta) | Transformer convolucional | variable | no disponible | MIT / Apache según variante | PyTorch, ONNX |

La comparación con Whisper y Wav2Vec 2.0 es orientativa por categoría (ASR open source); no se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- La model card no aporta métricas de precisión ni garantiza paridad con el modelo original; el autor lo declara explícitamente.
- Idiomas soportados no documentados: no puede asumirse cobertura multilingüe sin verificar el checkpoint upstream.
- Posibles sesgos del modelo original no documentados en esta exportación.
- Riesgo de alucinación en transcripciones ASR: no cuantificado en la información disponible.
- Aunque la licencia es MIT, conviene revisar la licencia del checkpoint GigaAM original antes de uso comercial, ya que la exportación deriva de él.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.
- Tamaño del repo (0,9 GB) sin desglose de componentes; no se detalla si incluye múltiples grafos o artefactos auxiliares.
- Fecha de creación y actualización registradas en 2026, lo que puede indicar metadatos inconsistentes o una publicación muy reciente.

## Enlaces

- HuggingFace: https://huggingface.co/ysdede/gigaam-v3-e2e-rnnt-onnx
- Repositorio upstream GigaAM: https://github.com/salute-developers/GigaAM
