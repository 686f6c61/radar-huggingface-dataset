# ysdede/omnilingual-asr-ctc-300m-onnx

## Resumen

`ysdede/omnilingual-asr-ctc-300m-onnx` es una exportación a ONNX en INT8 del modelo de reconocimiento automático del habla (ASR) `facebook/omniASR-CTC-300M`, distribuida por el usuario ysdede. Se trata de un espejo binario exacto (byte-identical) del grafo INT8 publicado previamente por OpenVoiceOS, por lo que no introduce cambios en pesos ni en arquitectura respecto a ese export: es una réplica de conveniencia para su descarga desde otro repositorio.

El modelo subyacente, omniASR-CTC-300M, es un sistema ASR multilingüe de Meta (Facebook) basado en un encoder transformer con cabeza CTC (Connectionist Temporal Classification) y aproximadamente 300 millones de parámetros. La variante aquí publicada está optimizada para inferencia con ONNX Runtime en precisión INT8, lo que reduce el peso del repositorio a unos 0,3 GB y facilita el despliegue en CPU y en entornos embebidos.

Su relevancia práctica es la de ofrecer una alternativa ligera y con licencia Apache 2.0 para transcripción de voz multilingüe sin dependencia de frameworks de deep learning pesados: al estar en formato ONNX, puede ejecutarse con `onnxruntime` en Python, C++, C# o Java, y encaja en pipelines de producción donde se prioriza la latencia y el consumo de memoria sobre la precisión máxima de modelos de mayor tamaño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder con cabeza CTC (Connectionist Temporal Classification) |
| Parámetros totales | ~300 M (según el nombre del modelo fuente) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 (grafo ONNX cuantizado) |
| Idiomas soportados | no disponible (el modelo fuente omniASR es multilingüe, pero no se detalla la lista) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (INT8) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de lo que indica el nombre: un modelo ASR con decodificación CTC y aproximadamente 300 millones de parámetros. La familia omniASR de Meta se plantea como un sistema multilingüe de reconocimiento del habla; el sufijo "CTC" indica que la salida se genera mediante una cabeza CTC sobre las representaciones del encoder, sin decoder autorregresivo, lo que simplifica la inferencia y permite decodificación en streaming o por lotes con alineamientos frame-a-frame.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del corpus, ni si se aplicaron técnicas de ajuste fino supervisado o preferencias. El repositorio es únicamente un espejo del export INT8 de OpenVoiceOS, por lo que cualquier detalle de entrenamiento debe consultarse en la model card del modelo original `facebook/omniASR-CTC-300M`, no en este repositorio.

## Capacidades

- Reconocimiento automático del habla (ASR) a texto, con salida CTC.
- Inferencia optimizada mediante ONNX Runtime en precisión INT8.
- Ejecución posible en CPU sin GPU dedicada, dado el tamaño reducido (~300 M de parámetros) y la cuantización.
- Capacidad multilingüe heredada del modelo fuente omniASR (lista concreta de idiomas no disponible).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente ASR.
- No se documentan capacidades de visión, audio generativo ni modo "thinking".
- No se documenta diarización de hablantes ni detección de actividad de voz integrada.

## Casos de uso

- Transcripción por lotes de archivos de audio en servidores sin GPU: al ser un grafo ONNX INT8 de ~0,3 GB, puede ejecutarse con `onnxruntime` en CPU y procesar colas de ficheros de reuniones o podcasts con un consumo de memoria moderado.
- Subtitulado automático de vídeo en pipelines de edición: la cabeza CTC permite generar alineamientos temporales frame a frame, útiles para sincronizar subtítulos sin un paso de alineamiento forzado adicional.
- Transcripción en aplicaciones de escritorio o herramientas CLI: la portabilidad de ONNX (Python, C++, C#, Java) permite integrar el modelo en utilidades nativas sin arrastrar PyTorch.
- Preprocesado de audio para sistemas de búsqueda o indexación: convertir grabaciones a texto para alimentar motores de búsqueda internos o bases de datos documentales.
- Prototipado de asistentes de voz en entornos con recursos limitados: el tamaño reducido y la licencia Apache 2.0 permiten experimentar en dispositivos de borde (Raspberry Pi, mini-PC) antes de escalar a modelos mayores.
- Evaluación comparativa de modelos ASR: servir como baseline ligero y reproducible en experimentos de calidad frente a modelos de mayor tamaño, siempre que se respete la atribución al export original de OpenVoiceOS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: en torno a 0,3-0,5 GB en INT8 para los pesos, más el buffer de activaciones y el audio de entrada; ejecutable en CPU con 1-2 GB de RAM libre.
- GPU recomendadas: no se especifican; al ser un modelo pequeño, cualquier GPU con soporte ONNX Runtime (por ejemplo, RTX 3060 en adelante) es más que suficiente, aunque el caso natural es CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna; también en CPU y en dispositivos de borde.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#, Java), integrable en servidores de inferencia compatibles con ONNX; no se documenta soporte nativo para vLLM, llama.cpp, Ollama ni TGI, que no están orientados a ASR.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Licencia | Notas |
|---|---|---|---|---|
| ysdede/omnilingual-asr-ctc-300m-onnx | ~300 M | ONNX INT8 | Apache 2.0 | Espejo del export de OpenVoiceOS; sin benchmarks publicados |
| OpenVoiceOS/omnilingual-asr-ctc-300m-onnx | ~300 M | ONNX INT8 | Apache 2.0 | Export original del que este repositorio es copia byte a byte |
| facebook/omniASR-CTC-300M | ~300 M | PyTorch (safetensors, presumiblemente) | no disponible en esta ficha | Modelo fuente original de Meta |
| Whisper small (OpenAI) | ~244 M | PyTorch / ONNX / GGML | MIT | Alternativa ASR multilingüe ampliamente desplegada; comparación de rendimiento no disponible en esta información |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa de precisión o latencia con estas alternativas.

## Limitaciones y advertencias

- Este repositorio no aporta información propia sobre sesgos, composición del dataset ni evaluación de calidad; cualquier análisis debe remitirse al modelo fuente `facebook/omniASR-CTC-300M`.
- Riesgo de alucinación y errores de transcripción inherente a los sistemas ASR, especialmente en audio con ruido, acentos no representados en el entrenamiento o vocabulario técnico.
- La lista de idiomas soportados no está documentada en este repositorio; no debe asumirse cobertura universal pese al calificativo "omnilingual".
- La cuantización INT8 puede degradar ligeramente la precisión respecto al modelo en punto flotante original; no se han publicado métricas de esa degradación.
- Licencia Apache 2.0: permite uso comercial y modificación, pero exige conservar avisos de copyright y atribución; al ser un espejo, conviene mantener la referencia a OpenVoiceOS y a Meta.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no cuenta con una model card sustantiva; para producción se recomienda verificar la integridad del grafo y considerar el export original de OpenVoiceOS como fuente primaria.
- No se documenta soporte de streaming en tiempo real ni latencia objetivo; debe validarse empíricamente antes de comprometerse a un SLA.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ysdede/omnilingual-asr-ctc-300m-onnx
- Export original de OpenVoiceOS: https://huggingface.co/OpenVoiceOS/omnilingual-asr-ctc-300m-onnx/tree/bc55e1de19af8a907b0a010d06fc4637a2d5bf0c
- Modelo fuente de Meta: https://huggingface.co/facebook/omniASR-CTC-300M
