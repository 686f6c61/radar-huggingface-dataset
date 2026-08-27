# vikramlingam/meg-v1

## Resumen

Meg v1 (`meg-v1`) es un runtime completo de reconocimiento de voz a texto limpio, 100 % offline y diseñado para aplicaciones de dictado de baja latencia en escritorio y móvil. Lo desarrolla Vikram Lingam, un científico de datos independiente, y se distribuye bajo licencia Apache 2.0. El sistema combina un transductor acústico Zipformer en streaming con un tagger de intenciones no autorregresivo, un reconstrucción fonética de términos técnicos y un verificador determinista de invariantes, todo empaquetado en un bundle de 89,3 MB que ejecuta en CPU sin aceleración GPU ni conexión a la nube.

Su relevancia radica en que aborda un problema poco cubierto por los ASR convencionales: la conversión de voz espontánea en texto limpio y formateado, preservando identificadores técnicos, versiones SemVer, monedas, fechas y sintaxis de código, con un factor tiempo real de 0,0213 (47 veces más rápido que el tiempo real). El modelo está pensado para integrarse en aplicaciones de escritorio y móviles con privacidad total, sin telemetría ni dependencias cloud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Streaming Zipformer Transducer (encoder, decoder, joiner) + Transformer encoder no autorregresivo de 8 capas (d_model=384, 6 cabezas, d_ff=1536) + N-gram fonético + verificador AST determinista |
| Parametros totales | No disponible (el transductor acústico tiene 20M en INT8; el tagger no especifica el total) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (procesamiento por tramas de 160 ms en streaming) |
| Tipos de cuantizacion | INT8 (modelos ASR y tagger) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (según tags del repositorio) |

## Arquitectura y entrenamiento

El pipeline se compone de cinco módulos principales. El primero es un transductor acústico Zipformer en streaming de 20M parámetros en INT8 (41,62 MB) que procesa audio PCM de 16 kHz en tramas de 160 ms, con una capa de biasing por contexto dinámico basada en un trie de prefijos para términos técnicos. El segundo es un tagger de intenciones de 8 capas, no autorregresivo, con cuatro cabezas de tareas múltiples: acción de token (KEEP/DELETE), puntuación (5 clases), capitalización (3 clases) y reparación de habla a nivel de span con etiquetas BILOU. El tercero es un reconstrucción fonética N-gram que une fragmentos de términos técnicos (por ejemplo, "pie? torch" → `PyTorch`). El cuarto es un verificador determinista de invariantes AST que garantiza la preservación de SemVer, regiones cloud, monedas, fechas y sintaxis de puntos en Swift. El quinto es una API C nativa y un wrapper Swift.

No se detallan los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) en la información disponible. La model card menciona una pérdida regularizada de no edición (λ_uer = 1,2) para evitar corromper texto ya limpio, lo que sugiere un entrenamiento supervisado con objetivos múltiples.

## Capacidades

- Reconocimiento de voz en streaming con baja latencia (3,32 ms por trama de 160 ms).
- Eliminación de disfluencias y falsos arranques (p. ej., "meeting on Thursday no wait sorry make it Friday morning" → "meeting on Friday morning").
- Preservación de intención semántica: mantiene palabras de contenido ambiguas en contexto válido.
- Puntuación y capitalización automáticas (truecasing).
- Reconstrucción de términos técnicos fragmentados (identificadores camelCase, snake_case, URLs, SemVer, sintaxis Swift).
- Verificación determinista de invariantes: garantiza la preservación exacta de versiones, monedas, fechas, horas y regiones cloud.
- Funcionamiento 100 % offline, sin telemetría ni conexión a la nube.
- Integración nativa con Swift (wrapper `MegTranscriber.swift`) y API C (`meg_v1.h`).
- Sin crecimiento de memoria en streaming continuo (verificado en 100 000 tramas PCM).

## Casos de uso

- Dictado de código en IDE: el modelo puede transcribir voz a código Swift, Python o Rust en Xcode y VS Code, preservando identificadores, camelCase y sintaxis de puntos, con una latencia media de 1,86 ms por enunciado.
- Transcripción de reuniones técnicas: elimina muletillas y falsos arranques mientras conserva términos técnicos, versiones de software y referencias a APIs.
- Asistente de dictado en aplicaciones de productividad: integrable en Slack, Notion o Terminal para redactar mensajes, documentación o comandos sin necesidad de edición manual.
- Accesibilidad para personas con discapacidad motora: dictado de texto formateado en tiempo real en aplicaciones de escritorio, con privacidad total al no enviar audio a la nube.
- Automatización de subtítulos en directo: genera subtítulos limpios y puntuados en tiempo real para presentaciones o streaming local, con un factor tiempo real de 0,0213.
- Sistemas de comandos por voz en entornos restringidos: al ser 100 % offline y ocupar solo 70,3 MB de RAM, puede desplegarse en dispositivos edge o entornos con políticas de privacidad estrictas.

## Benchmarks y rendimiento

La model card incluye una evaluación independiente sobre un conjunto de 2000 muestras en 7 dominios. Los resultados se presentan en la siguiente tabla comparativa:

| Sistema / Pipeline | IP-WER (%) ↓ | UER (%) ↓ | Disfluency F1 (%) ↑ | Entity Invariance (%) ↑ | Ambiguous Precision (%) ↑ | Latencia por trama | RAM pico | Privacidad |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Raw Verbatim ASR | 39,85 | 0,00 | 0,00 | 96,42 | 100,00 | 2,10 ms | 45,0 MB | 100 % local |
| Naive Regex Cleaner | 14,75 | 0,00 | 69,27 | 96,42 | 66,50 | 2,11 ms | 45,0 MB | 100 % local |
| **Meg v1 (runtime completo)** | **4,99** | **0,00** | **90,44** | **100,00** | **100,00** | **3,32 ms** (RTF 0,0213) | **70,3 MB** | **100 % offline** |
| Cloud LLM Baseline (`z-ai/glm-5.3-flash`) | 8,36 | 0,00 | 95,98 | 98,75 | 87,00 | 395,45 ms (API cloud) | Variable | Egreso cloud |

Desglose por categoría (2000 muestras):

| Categoría | Muestras | IP-WER (%) ↓ | Observaciones |
| :--- | :--- | :--- | :--- |
| Números, fechas, moneda y tiempo | 200 | 0,00 | Preservación exacta de `$30,000,000`, marcas de tiempo y fechas |
| Texto ya limpio y formateado (UER) | 300 | 0,00 | Cero corrupción por paso a través de texto limpio |
| Enunciados técnicos y de desarrollador | 300 | 1,11 | Identificadores, camelCase, snake_case, URLs, SemVer, sintaxis Swift |
| Rellenos ambiguos en contexto válido | 200 | 2,27 | Retención del 100 % de palabras de contenido semántico |
| Falsos arranques y reparaciones de habla | 300 | 2,68 | Borrado atómico de falsos arranques |
| Habla espontánea y hesitaciones | 400 | 11,20 | Muletillas multi-token ("you know what I mean", "sort of like") |
| Casos adversariales y límite | 300 | 13,06 | Disfluencias de alta densidad y colisiones de límites de identificadores |

Además, se reportan métricas de uso real en 50 sesiones de dictado en vivo: latencia media por enunciado de 1,86 ms, satisfacción de usuario de 4,98/5,00 y estabilidad de memoria sin crecimiento en 100 000 tramas PCM.

## Requisitos de hardware

- Inferencia en CPU sin GPU: el runtime completo ejecuta en Apple Silicon y x86_64 modernos, con un factor tiempo real de 0,0213 (47 veces más rápido que el tiempo real).
- RAM pico: 70,3 MB para el runtime completo; el transductor acústico ocupa 41,62 MB y el tagger 25,53 MB.
- No requiere GPU ni conexión a la nube; apto para dispositivos edge, portátiles y móviles.
- Opciones de despliegue: integración nativa mediante API C (`meg_v1.h`) y wrapper Swift (`MegTranscriber.swift`); no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia: 3,32 ms por trama de 160 ms en streaming; 1,86 ms de latencia media por enunciado en sesiones reales.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de ASR on-device como Whisper, wav2vec2 o Parakeet en la información proporcionada. La única comparación incluida en la model card es contra un baseline cloud LLM (`z-ai/glm-5.3-flash`), que Meg v1 supera en IP-WER (4,99 % frente a 8,36 %), Entity Invariance (100 % frente a 98,75 %) y Ambiguous Precision (100 % frente a 87 %), aunque el baseline cloud obtiene mejor Disfluency F1 (95,98 % frente a 90,44 %). La ventaja principal de Meg v1 es su latencia de streaming (3,32 ms por trama frente a 395,45 ms de API cloud) y su privacidad total.

## Limitaciones y advertencias

- Solo soporta inglés; no hay soporte multilingüe declarado.
- El rendimiento en habla espontánea con muletillas multi-token es significativamente peor (IP-WER 11,20 %) que en otros dominios, y en casos adversariales alcanza un 13,06 % de IP-WER.
- No se especifican los datos de entrenamiento ni el proceso de validación externa; los benchmarks provienen de un conjunto de evaluación propio del autor.
- El modelo está diseñado para dictado técnico en inglés; su eficacia en otros acentos o registros no está documentada.
- No hay información sobre sesgos potenciales, aunque al ser un sistema de ASR con verificación determinista, el riesgo de alucinación es bajo en comparación con LLMs.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte oficial.
- El repositorio tiene 0 descargas y 0 likes en HuggingFace, lo que indica que es un proyecto muy reciente y sin validación comunitaria amplia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vikramlingam/meg-v1
- Perfil del autor en HuggingFace: https://huggingface.co/vikramlingam
- Perfil del autor en GitHub: https://github.com/vikramlingam
- Repositorio personal del autor: https://github.com/vikramlingam/vikramlingam
