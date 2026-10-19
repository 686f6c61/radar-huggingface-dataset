# thaut/moss-tts-windowed-gguf

## Resumen

`moss-tts-windowed-gguf` es una conversión a GGUF de MOSS-TTS v1.5, un modelo de síntesis de voz (text-to-speech) de OpenMOSS-Team, empaquetada por el usuario `thaut` para su uso con `moss-tts-windowed`, un fork de llama.cpp. El repositorio contiene tres ficheros: el backbone cuantizado a Q4_K_M con la tabla de audio en Q8_0 (5,0 GB), un decodificador de audio en F16 (1,7 GB) y un codificador de audio en F16 (1,7 GB) que se emplea para registrar voces de referencia a partir de audio.

La relevancia del proyecto es de infraestructura más que de modelado: permite servir un TTS de gran tamaño (la model card habla de "MOSS-TTS 8B") fuera del stack PyTorch, con llama.cpp como runtime y con un objetivo declarado de ocupar 8 GB de VRAM o menos en un servicio de streaming residente. El coste es que los ficheros declaran la arquitectura `moss-tts-delay`, que solo entiende el fork del autor: no funcionan con llama.cpp upstream ni con el GGUF oficial `MOSS_TTS_Q4_K_M.gguf`, que usa la arquitectura `qwen3` y es explícitamente incompatible.

Los metadatos del repositorio indican 887.413.504 parámetros en safetensors, mientras que la model card describe el backbone como "MOSS-TTS 8B"; la información disponible no aclara esa discrepancia. El repositorio es muy reciente y con poca tracción (30 descargas, 1 like), por lo que debe tratarse como una conversión de comunidad sin validación independiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer para TTS (backbone de la familia Qwen3, segun la nota del autor sobre el GGUF oficial) con tokenizer y decoder de audio; arquitectura GGUF declarada: `moss-tts-delay` |
| Parametros totales | 887.413.504 (dato de safetensors del repo); la model card describe el backbone como "MOSS-TTS 8B" — discrepancia no aclarada en la informacion disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Backbone Q4_K_M + tabla de audio Q8_0; encoder y decoder de audio en F16. No se publican otros niveles (Q5, Q8, etc.) |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (tres ficheros); origen safetensors/PyTorch en `OpenMOSS-Team/MOSS-TTS-v1.5` y `OpenMOSS-Team/MOSS-Audio-Tokenizer` |
| Tamano del repositorio | 8,9 GB |

## Arquitectura y entrenamiento

El modelo sigue el esquema habitual de los TTS neuronales basados en LLM: un backbone transformer que genera tokens de audio a partir del texto de entrada, un tokenizer de audio (`MOSS-Audio-Tokenizer`) que define el espacio de tokens y un decoder que reconstruye laforma de onda. El sufijo `delay` de la arquitectura GGUF sugiere un esquema de intercalado con retardo entre flujos de tokens de audio, patrón habitual para manejar varios codebooks en paralelo, aunque la información disponible no detalla el mecanismo concreto. El encoder en F16 se usa únicamente en el registro de voces, para codificar el audio de referencia que condiciona la síntesis.

No se han publicado en la información proporcionada datos sobre volumen de entrenamiento (número de tokens o de horas de audio), composición del dataset, ni sobre las etapas de alineación o ajuste fino preferencial (RLHF/DPO). El repositorio es una conversión de pesos, no un entrenamiento nuevo: no aporta innovaciones de modelado, sino de empaquetado y ejecución (integración en un fork de llama.cpp con gestión de ventana de contexto y streaming).

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en chino e inglés.
- Clonación o condicionamiento de voz mediante audio de referencia, codificado con el encoder F16 incluido en el repositorio.
- Inferencia en streaming con ventana deslizante, orientada a servicios residentes de baja latencia (según el objetivo declarado por el autor).
- Ejecución en llama.cpp mediante un fork específico (`moss-tts-windowed`), sin dependencia de PyTorch en tiempo de inferencia.
- Generación de audio controlada por el decoder incluido, separable del backbone cuantizado.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo acústico, no un asistente conversacional.
- No dispone de modo "thinking", visión ni procesamiento de audio de entrada más allá del registro de voces.

## Casos de uso

- Servicio TTS en streaming con una sola GPU de 8 GB: el backbone Q4_K_M (5,0 GB) más el decoder F16 (1,7 GB) caben en una RTX 3060 de 12 GB o en una L4, lo que permite desplegar locución sintética continua sin clúster.
- Clonación de voz para audiolibros y contenido editorial: el encoder F16 permite registrar la voz de un locutor con consentimiento y reutilizarla en la síntesis de capítulos largos, con el envío de texto por ventanas.
- Accesibilidad y lectura de pantalla en aplicaciones de escritorio: al ejecutarse sobre llama.cpp, puede incrustarse en entornos sin stack Python y con requisitos de privacidad, manteniendo el texto en la máquina local.
- Doblaje y localización zh-en: el soporte de ambos idiomas permite generar pistas de voz para vídeo educativo o corporativo en un mismo pipeline, usando voces registradas por mercado.
- Asistentes de voz on-premise: despliegue en servidor propio para atención telefónica o kioscos donde no se permite enviar texto a APIs externas, con el modelo residente en memoria y atención por ventanas.
- Generación de avisos y notificaciones dinámicas: integración en un servicio backend que convierte plantillas de texto en audio bajo demanda, aprovechando el bajo coste de un backbone ya cuantizado.
- Pruebas A/B de voces en producción: el registro de voces por referencia permite cambiar de locutor sin reentrenar, comparando métricas de retención o de calidad percibida entre variantes.
- Prototipado en estación de trabajo con GPU de consumo: validar flujos de TTS antes de migrar a un despliegue mayor, con la advertencia de que requiere el fork de llama.cpp del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (WER, MOS, SIM, RTF) ni comparaciones con otros sistemas TTS, y tampoco se aportan medidas de latencia o throughput del fork.

## Requisitos de hardware

- VRAM estimada: 8 GB o menos para el conjunto backbone Q4_K_M (5,0 GB) + decoder F16 (1,7 GB), según el objetivo declarado por el autor. El encoder F16 (1,7 GB) solo es necesario al registrar voces, por lo que puede cargarse de forma transitoria o en CPU.
- GPU recomendadas: NVIDIA L4 (24 GB), A10, RTX 4090 (24 GB) para margen amplio; RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4070 como opciones de consumo con holgura.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM, siempre que el encoder se cargue solo durante el registro de voces.
- Despliegue: exclusivamente mediante `moss-tts-windowed` y su `build-llama.sh` (fork de llama.cpp). No hay soporte para vLLM, TGI, Ollama ni llama.cpp upstream con estos ficheros.
- Latencia y throughput: no disponibles. El modo streaming por ventanas está declarado por el autor, pero no se publican cifras de RTF ni de tokens de audio por segundo.

## Comparativa con modelos similares

Datos de los modelos alternativos tomados del conocimiento general del ecosistema; no proceden de la información proporcionada y conviene verificarlos antes de usarlos en una decisión técnica.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| moss-tts-windowed-gguf (este) | 887 M en safetensors; "8B" según model card | no disponible | zh, en | Apache-2.0 | GGUF + fork de llama.cpp |
| MOSS-TTS v1.5 (OpenMOSS-Team) | "8B" según model card | no disponible | zh, en | Apache-2.0 | safetensors / PyTorch |
| CosyVoice2-0.5B | 0,5 B | no disponible | zh, en, ja, ko | Apache-2.0 | PyTorch |
| Kokoro-82M | 82 M | no aplica (TTS por fragmentos) | en (multilingüe en versiones posteriores) | Apache-2.0 | PyTorch / ONNX |
| XTTS-v2 | ~467 M | no aplica | multilingüe, incluido es | CPML (no comercial) | PyTorch |

La ventaja diferencial de este repositorio no es la calidad acústica, que no está medida, sino la posibilidad de ejecutar un backbone grande en llama.cpp con cuantización Q4_K_M. Frente a Kokoro-82M o XTTS-v2, el coste de hardware es mucho mayor y el soporte de idiomas es más limitado que en XTTS-v2 (que cubre castellano, ausente aquí).

## Limitaciones y advertencias

- Compatibilidad restringida: los ficheros usan `general.architecture = moss-tts-delay` y solo cargan en el fork `moss-tts-windowed`. No son intercambiables con el GGUF oficial `MOSS_TTS_Q4_K_M.gguf` (arquitectura `qwen3`) ni con llama.cpp estándar.
- Discrepancia de parámetros: los metadatos indican 887 M y la model card habla de 8B; no se explica si el conteo corresponde a una parte del modelo (por ejemplo, el tokenizer de audio) o al conjunto.
- Cobertura lingüística limitada a chino e inglés; no hay soporte declarado de castellano.
- Ausencia total de benchmarks: no hay MOS, WER, SIM ni métricas de inteligibilidad, lo que impide evaluar la calidad frente a alternativas.
- Riesgo de errores específicos de TTS: pronunciación incorrecta, omisión o repetición de palabras, prosodia inestable en textos largos y deriva en el timbre al fragmentar la entrada por ventanas.
- Clonación de voz: requiere consentimiento explícito del locutor y cumplimiento del RGPD; el uso indebido de voces registradas es un riesgo legal y reputacional, no técnico.
- Validación comunitaria escasa: 30 descargas y 1 like en el momento de la ficha, sin issues ni evaluaciones públicas documentadas.
- Licencia Apache-2.0 en el empaquetado, pero conviene verificar los términos de los modelos de origen (`MOSS-TTS-v1.5` y `MOSS-Audio-Tokenizer`) antes de un uso comercial.
- Sin soporte de tool calling ni de entrada de audio arbitraria: no debe plantearse como sustituto de un asistente conversacional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/thaut/moss-tts-windowed-gguf
- Proyecto de conversión y fork de llama.cpp: https://github.com/thautwarm/moss-tts-windowed
- Modelo original: https://huggingface.co/OpenMOSS-Team/MOSS-TTS-v1.5
- Tokenizer de audio: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer
