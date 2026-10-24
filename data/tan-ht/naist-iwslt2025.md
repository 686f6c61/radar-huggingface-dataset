# tan-ht/naist-iwslt2025

## Resumen

`tan-ht/naist-iwslt2025` es el repositorio de HuggingFace asociado al sistema presentado por NAIST (Nara Institute of Science and Technology) para la pista *Simultaneous Speech-to-Text* de IWSLT 2025, en la dirección inglés → {alemán, japonés, chino}. El sistema lo firma Haotian Tan, doctorando del *Human AI Interaction Laboratory* (Sakti Lab) bajo la supervisión de Sakriani Sakti, junto con Ruhiyah Faradishi Widiaputri, Jan Meyer Saragih, Yuka Ko, Katsuhito Sudoh, Satoshi Nakamura y Sakriani Sakti.

A diferencia de la edición anterior, en la que el equipo partía de un modelo extremo a extremo que combinaba HuBERT y mBART, la propuesta de 2025 se articula en tres bloques: un encoder Whisper, el proyector compresivo DeCo y un modelo de lenguaje Qwen. Se trata, por tanto, de una arquitectura híbrida voz-texto en la que el encoder acústico alimenta a un LLM que genera la traducción, con un proyector pensado para comprimir la secuencia y habilitar el modo simultáneo (streaming con latencia reducida).

El interés del repositorio es fundamentalmente de trazabilidad académica: permite localizar el sistema evaluado en IWSLT 2025 y su descripción técnica en el paper del congreso. Conviene advertir de que la model card publicada está vacía (solo contiene la declaración de licencia), el repositorio no declara idiomas ni pipeline, y registra 0 descargas y 0 likes en el momento de la consulta, por lo que no debe tratarse como un artefacto listo para producción sin verificación adicional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida voz-texto: encoder Whisper + proyector compresivo DeCo + LLM Qwen |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se describe como modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio no publica pesos ni variantes cuantizadas) |
| Idiomas soportados | Entrada: inglés. Salida: alemán, japonés y chino (según el paper); la model card no declara idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible |
| Tarea | Traducción simultánea de voz a texto (*speech-to-text translation*) |
| Direccionalidad | Inglés → {alemán, japonés, chino} únicamente |
| Autores | Haotian Tan, Ruhiyah Faradishi Widiaputri, Jan Meyer Saragih, Yuka Ko, Katsuhito Sudoh, Satoshi Nakamura, Sakriani Sakti |
| Repositorio | tan-ht/naist-iwslt2025 (HuggingFace) |
| Fecha de creación en HuggingFace | 2026-10-24 (según metadatos del repositorio) |

## Arquitectura y entrenamiento

El sistema sigue un esquema de traducción de voz extremo a extremo con puente textual latente. El encoder de Whisper convierte la señal de audio en representaciones acústicas; el proyector DeCo (*compressive projector*) reduce y comprime esa secuencia antes de inyectarla en el LLM, lo que resulta crítico en traducción simultánea, donde la longitud de la secuencia de audio condiciona directamente la latencia y el coste computacional. El decodificador es un modelo Qwen, que actúa como generador de la traducción y aporta sus capacidades multilingües y de modelado de lenguaje.

El cambio respecto a 2024 es sustancial: se abandona la combinación HuBERT + mBART en favor de un encoder Whisper con un LLM de gran tamaño, un patrón habitual en los sistemas de traducción de voz presentados en IWSLT 2025. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset, la variante concreta de Whisper ni el tamaño de Qwen empleado, ni indica si se aplicaron fases de ajuste fino supervisado, RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Traducción simultánea de voz a texto de inglés a alemán, japonés y chino, con procesamiento por streaming orientado a baja latencia.
- Reconocimiento automático del habla en inglés como etapa intermedia, heredado del encoder Whisper.
- Generación de texto multilingüe en los tres idiomas de destino, apoyada en el LLM Qwen.
- Operación en modo simultáneo: el proyector DeCo comprime la representación acústica para permitir la emisión incremental de hipótesis mientras el hablante sigue hablando.
- Capacidad de traducción condicionada por contexto previo (el LLM recibe el histórico de la secuencia comprimida), aunque la longitud exacta de contexto no está documentada.
- *Tool calling* / *function calling*: no disponible; no se documenta en el paper ni en la model card.
- Soporte de agentes y razonamiento multi-paso: no disponible; no es una capacidad declarada del sistema.
- Visión, audio de entrada distinto de voz o generación de voz: no disponible; el sistema es *speech-to-text*, no produce audio.

## Casos de uso

- **Subtitulado en directo de eventos y conferencias**: el sistema traduce la intervención en inglés a subtítulos en alemán, japonés o chino mientras se habla. El diseño simultáneo y el proyector compresivo están pensados precisamente para no esperar al final de la frase, lo que encaja con la emisión de subtítulos en pantalla.
- **Interpretación en reuniones multilingües**: integrado en una plataforma de videoconferencia, transformaría el audio del ponente angloparlante en subtítulos para asistentes japoneses, alemanes o chinos, reduciendo la dependencia de intérpretes humanos en sesiones informativas.
- **Accesibilidad para personas con discapacidad auditiva**: un pipeline de captura de audio en tiempo real más este sistema permitiría ofrecer transcripción traducida en eventos presenciales o retransmisiones, cubriendo el eje inglés → lengua materna del asistente.
- **Localización de contenido audiovisual en streaming**: aplicable a la generación de pistas de subtítulos traducidas en directo para retransmisiones deportivas, informativos o webinars emitidos en inglés, donde el coste de una traducción *offline* posterior sería demasiado alto.
- **Atención al cliente con voz en tiempo real**: en centralitas que reciben llamadas en inglés y necesitan asistencia inmediata para agentes que trabajan en japonés o chino, el modo simultáneo permitiría mostrar la traducción mientras el cliente habla, no después.
- **Investigación y reproducción de resultados en IWSLT**: como *baseline* académico para comparar nuevas propuestas de proyectores compresivos, encoders acústicos o estrategias de política de espera (*wait-k*, *prefix-to-prefix*) en traducción simultánea.
- **Análisis de medios y monitorización**: transcripción y traducción al vuelo de fuentes audiovisuales en inglés (ruedas de prensa, comparecencias, retransmisiones) para alimentar sistemas de resumen o alertas en otros idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper «NAIST Simultaneous Speech Translation System for IWSLT 2025» (ACL Anthology, 2025.iwslt-1.39) describe el sistema y su participación en la pista de traducción simultánea inglés → {alemán, japonés, chino}, pero los valores concretos de BLEU, latencia (*Average Lagging*, *DAL*) u otras métricas no están recogidos en la documentación consultada y no deben inferirse.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible. El consumo depende de dos factores no documentados: la variante de Whisper usada como encoder y, sobre todo, el tamaño de Qwen empleado como decodificador. Sin ese dato no es posible dar una cifra fiable.
- **Estimación condicional**: si el LLM fuese un Qwen de la familia 7B, el sistema completo necesitaría del orden de 16-18 GB en fp16 (7B del LLM más el encoder y el proyector) y alrededor de 6-8 GB con cuantización de 4 bits; si se tratase de una variante 3B o inferior, cabría en GPUs de 8-12 GB. Estas cifras son orientativas y no están confirmadas por el autor.
- **GPU recomendadas**: no disponible. Para un despliegue en streaming con latencia baja tendrían sentido GPUs con buen rendimiento por *token* y soporte de *batching* continuo (A100, H100, L40S o RTX 4090), pero el paper no especifica el hardware utilizado.
- **Consumer GPU**: no confirmable. Solo sería viable en una RTX 4090 o RTX 3090 si el LLM es de tamaño reducido y se aplica cuantización; con un Qwen grande, el sistema requeriría GPU de datacenter.
- **Opciones de despliegue**: no disponible. El repositorio no incluye código de inferencia. Por la composición del sistema, un despliegue realista exigiría servir el encoder acústico (por ejemplo, con `faster-whisper` o implementaciones tipo HuggingFace Transformers) y el LLM por separado (vLLM o TGI) con un orquestador que aplique el proyector DeCo entre ambos; llama.cpp u Ollama solo cubrirían la parte del LLM, no el pipeline completo.
- **Latencia y throughput**: no disponible. En un sistema simultáneo la latencia viene impuesta por la política de segmentación y por el proyector compresivo, además del coste de decodificación del LLM, pero no se han publicado mediciones en la información consultada.

## Comparativa con modelos similares

| Sistema | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tan-ht/naist-iwslt2025 (NAIST) | no disponible | no disponible | EN → DE, JA, ZH | apache-2.0 (repo) | Repositorio HF sin pesos ni model card |
| Whisper large-v3 + NMT en cascada | ~1,55B (Whisper large-v3) + modelo NMT aparte | no disponible | Reconocimiento multilingüe; traducción según el NMT | MIT (Whisper) | Pesos y ecosistema ampliamente disponibles |
| SeamlessM4T v2 (Meta) | ~2,3B | no disponible | Voz y texto, multilingüe | CC-BY-NC 4.0 | Pesos públicos con restricción de uso comercial |
| NLLB-200 (Meta), variante destilada 600M | ~600M | no disponible | Texto, 200 idiomas | CC-BY-NC 4.0 | Pesos públicos con restricción de uso comercial |
| AppTek ASR/ST para IWSLT 2025 | no disponible | no disponible | Según envío al congreso | no disponible | Sistema de competición, no necesariamente abierto |

La comparación es necesariamente cualitativa: el sistema de NAIST no publica tamaño de parámetros ni métricas, mientras que las alternativas son modelos genéricos no específicamente optimizados para simultaneidad. La diferencia funcional clave es que el sistema de NAIST está diseñado para traducción simultánea de voz con compresión de secuencia, no para traducción *offline* por segmentos.

## Limitaciones y advertencias

- **Repositorio sin contenido técnico**: la model card solo contiene la licencia; no hay pesos, tokenizador, código de inferencia ni instrucciones de uso. No es un modelo descargable y ejecutable tal cual.
- **Direccionalidad restringida**: el sistema se ha desarrollado y evaluado únicamente para inglés → {alemán, japonés, chino}. No hay evidencia de funcionamiento en otras direcciones ni en pares sin el inglés como origen.
- **Tamaño y variante del LLM desconocidos**: sin ese dato no es posible estimar coste, latencia ni requisitos de memoria, lo que invalida cualquier planificación de despliegue.
- **Licencia del repositorio frente a licencias de los componentes**: el repositorio declara apache-2.0, pero el sistema integra un encoder Whisper y un LLM Qwen cuyos términos pueden imponer condiciones adicionales. Es imprescindible revisar las licencias de los pesos subyacentes antes de un uso comercial.
- **Riesgo de alucinación**: al apoyarse en un LLM como decodificador, el sistema puede generar contenido fluido pero no fiel al audio, especialmente ante ruido, solapamientos de habla o segmentos ambiguos. En traducción simultánea, la presión por emitir tokens pronto agrava este riesgo.
- **Degradación en condiciones acústicas adversas**: el rendimiento del encoder Whisper cae con ruido de fondo, reverberación, acentos marcados y audio de telefonía; no se han documentado evaluaciones en estos escenarios en la información disponible.
- **Compromiso latencia-calidad**: el modo simultáneo implica decisiones de segmentación (política de espera) que sacrifican calidad de traducción frente a un sistema *offline*; no se han publicado curvas que cuantifiquen ese compromiso.
- **Sesgos**: no se han documentado evaluaciones de sesgo de género, dialecto o dominio en la información consultada.
- **Sin soporte técnico ni mantenimiento**: 0 descargas y 0 likes, actualización única, sin discusiones ni issues; no hay comunidad que respalde su uso.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/tan-ht/naist-iwslt2025
- Paper (PDF, ACL Anthology): https://aclanthology.org/2025.iwslt-1.39.pdf
- Ficha del paper en ACL Anthology: https://aclanthology.org/2025.iwslt-1.39/
- Programa de IWSLT 2025: https://iwslt.org/2025/program
- Página académica del autor, Haotian Tan: https://tan-ht.github.io/
- Publicaciones del Human AI Interaction Laboratory (Sakti Lab), NAIST: https://hai-lab.naist.jp/publications.html
