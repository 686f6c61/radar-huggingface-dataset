# storyteller-platform/citrinet512-ca

## Resumen

Citrinet 512 Catalan es un modelo de reconocimiento automático del habla (ASR) para catalán, empaquetado y redistribuido por storyteller-platform dentro de su registro de modelos. El modelo original fue entrenado por neongeckocom (parte del ecosistema NeMo de NVIDIA) y esta versión se deriva de la exportación ONNX publicada por OpenVoiceOS. La aportación de storyteller-platform consiste en reempaquetar los pesos en dos formatos listos para producción: ONNX con el front-end mel integrado y safetensors en el layout que espera su cargador MLX.

Se trata de un modelo Citrinet, una arquitectura de redes convolucionales (no transformer) diseñada específicamente para ASR, con 512 canales en la capa inicial y una configuración de submuestreo que lo hace adecuado para transcripción en tiempo real o casi real. Al ser un modelo convolucional compacto (el repositorio completo ocupa 0,3 GB), resulta interesante para despliegues con recursos limitados, aplicaciones de subtitulado y transcripción local en catalán, donde los modelos basados en transformers suelen ser excesivamente pesados.

La relevancia actual del modelo radica en su licencia permisiva (BSD-3-Clause), su tamaño reducido y la disponibilidad de formatos ONNX y MLX, lo que facilita su integración tanto en pipelines de servidor como en aplicaciones nativas de Apple Silicon. No obstante, la información pública disponible es escasa: no se han publicado métricas de benchmarks, detalles del dataset de entrenamiento ni especificaciones completas en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Citrinet (red neuronal convolucional para ASR, ecosistema NeMo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR, procesa audio en ventanas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | catalán (ca) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (MLX), ONNX |

## Arquitectura y entrenamiento

Citrinet es una arquitectura convolucional para reconocimiento del habla propuesta dentro de la familia QuartzNet/Citrinet de NVIDIA NeMo. Se caracteriza por usar convoluciones 1D con submuestreo progresivo, conexiones residuales y una capa de clasificación CTC al final. El sufijo "512" indica el número de canales de la primera capa, y el identificador del modelo original incluye "gamma_0_25", que en la nomenclatura de NeMo suele referirse a un factor de escala o de reducción de canales en los bloques internos. La arquitectura no emplea mecanismos de atención ni transformers, lo que explica su bajo coste computacional y su idoneidad para inferencia en tiempo real.

El modelo fue entrenado por neongeckocom y exportado a ONNX por OpenVoiceOS. storyteller-platform no ha reentrenado el modelo: su contribución es de empaquetado. La versión ONNX incluye el front-end mel integrado delante del encoder, de modo que acepta la señal pre-énfasis con padding reflectante y calcula internamente las características mel y su longitud. La versión MLX contiene los pesos del encoder en el layout que espera el cargador de MLX, junto con el banco de filtros mel y la ventana del front-end de NeMo. No se dispone de información sobre el número de tokens de audio, la composición del dataset de entrenamiento, ni si se aplicaron técnicas de aumento de datos o regularización específicas.

## Capacidades

- Reconocimiento automático del habla (ASR) para catalán, con salida de transcripción a nivel de carácter o subpalabra mediante CTC.
- Procesamiento de audio con front-end mel integrado en la exportación ONNX, lo que simplifica la integración en producción.
- Inferencia eficiente en CPU y GPU gracias a su arquitectura convolucional y a su reducido tamaño (0,3 GB de repositorio).
- Soporte de dos formatos de despliegue: ONNX (multiplataforma) y safetensors para MLX (Apple Silicon).
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales más allá del audio.
- No se ha documentado modo "thinking", visión, audio generativo ni otras capacidades especiales.
- El vocabulario se distribuye como `vocab.txt` y el tokenizador como `tokenizer.spm` (SentencePiece), lo que facilita la decodificación de las salidas.

## Casos de uso

- Transcripción de audio en catalán en aplicaciones de subtitulado: el modelo puede convertir pistas de audio en texto con un coste computacional bajo, adecuado para generar subtítulos automáticos en vídeos y retransmisiones.
- Asistentes de voz locales: al ser un modelo convolucional compacto, puede ejecutarse en dispositivos con recursos limitados o en el navegador mediante ONNX Runtime, habilitando comandos de voz en catalán sin depender de la nube.
- Actas y notas de reuniones: integrado en un pipeline de diarización y transcripción, permite generar actas automáticas de reuniones en catalán, con la ventaja de que el modelo es ligero y puede desplegarse en servidores modestos.
- Atención al cliente telefónica: en combinación con un sistema de gestión de llamadas, el modelo puede transcribir conversaciones en catalán para su análisis posterior, clasificación de motivos de llamada o generación de resúmenes.
- Investigación lingüística y corpus orales: útil para transcribir grabaciones de campo o entrevistas en catalán, facilitando la creación de corpus anotados y el análisis fonético o léxico.
- Accesibilidad: transcripción en tiempo real de conversaciones o contenido audiovisual para personas con discapacidad auditiva, aprovechando la baja latencia esperada de una arquitectura convolucional.
- Integración en aplicaciones nativas de Apple Silicon: gracias al formato MLX, puede incorporarse en apps de macOS o iOS para transcripción local sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión, pero al tratarse de un modelo convolucional de 0,3 GB de repositorio, se espera que quepa holgadamente en GPUs de gama baja e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria; modelos como NVIDIA GTX 1650, RTX 3050 o superiores son suficientes. Para MLX, se requiere Apple Silicon (M1 o posterior).
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna e incluso en iGPU.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), MLX (Apple Silicon), y potencialmente NeMo Toolkit para el modelo original. No se ha documentado soporte para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Citrinet 512 Catalan (este) | Citrinet (CNN) | no disponible | no disponible | BSD-3-Clause | Hugging Face (storyteller-platform) |
| neongeckocom/stt_ca_citrinet_512_gamma_0_25 | Citrinet (CNN) | no disponible | no disponible | BSD-3-Clause | Hugging Face (neongeckocom) |
| OpenVoiceOS/neongeckocom-stt_ca_citrinet_512_gamma_0_25_onnx | Citrinet (CNN) | no disponible | no disponible | BSD-3-Clause | Hugging Face (OpenVoiceOS) |

No se dispone de información sobre otros modelos ASR en catalán comparables (como wav2vec2 o Whisper fine-tuneados) en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al ser un modelo entrenado por un tercero, puede presentar sesgos derivados de la composición del corpus de entrenamiento, que no se ha hecho público.
- Riesgo de alucinación: en ASR, el riesgo se manifiesta como transcripciones incorrectas o palabras inventadas en segmentos de audio ruidosos o con acentos no representados en el entrenamiento.
- Limitaciones de contexto o idioma: el modelo está especializado exclusivamente en catalán; no se ha documentado soporte multilingüe. Su rendimiento en variedades dialectales o en audio con ruido de fondo no está cuantificado.
- Restricciones de licencia: BSD-3-Clause permite uso comercial y modificación, siempre que se conserve el aviso de copyright y la cláusula de exención de responsabilidad. Es una licencia permisiva, sin restricciones adicionales conocidas.
- Caveats para producción: la model card no documenta el proceso de entrenamiento ni métricas de calidad; se recomienda validar el modelo en el dominio específico antes de desplegarlo. El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido ampliamente validado por la comunidad. La fecha de creación (2026-11-13) es futura respecto a la información disponible, lo que puede indicar un error en los metadatos.
- El modelo se distribuye como espejo de una versión concreta (2.0.0) del registro de Storyteller; cambios en el modelo original no se reflejarán automáticamente.

## Enlaces

- Hugging Face: https://huggingface.co/storyteller-platform/citrinet512-ca
- Modelo original: https://huggingface.co/neongeckocom/stt_ca_citrinet_512_gamma_0_25
- Exportación ONNX original: https://huggingface.co/OpenVoiceOS/neongeckocom-stt_ca_citrinet_512_gamma_0_25_onnx
- Repositorio GitLab de Storyteller (scripts de conversión): https://gitlab.com/storyteller-platform/storyteller/-/tree/main/libraries/mlx-audio/scripts
- Registro de modelos de Storyteller (referencia en la model card): https://gitlab.com/storyteller-platform/storyteller/-/ml/models/citrinet512-ca
