# thura2/freococo-myanmar-asr-onnx

## Resumen

`thura2/freococo-myanmar-asr-onnx` es la exportación a formato ONNX del modelo de reconocimiento automático de voz (ASR) `freococo/myanmar_asr`, un sistema especializado en birmano (myanmar). Lo publica el usuario thura2 como artefacto derivado: los pesos son idénticos a los del modelo original, revisión `e40d48e`, y el único cambio es el empaquetado en un grafo ONNX autocontenido que incluye el front-end log-mel. El objetivo es claro: permitir la inferencia en dispositivos móviles Android mediante ONNX Runtime, sin depender de PyTorch ni de un servidor.

El modelo resuelve un problema de nicho pero relevante: la transcripción de voz en birmano, un idioma con recursos limitados y escasa cobertura en los grandes sistemas ASR multilingües. Con 78,1 MB de pesos en un único fichero ONNX, el modelo está pensado para ejecutarse en el propio teléfono, dentro de la aplicación BudgetWise, junto a Meta's Omnilingual ASR. No se trata de un modelo de propósito general ni de un sistema de gran escala: es una pieza de infraestructura ligera y especializada.

La relevancia actual reside en su formato de despliegue. La exportación ONNX con el front-end integrado y decodificación CTC voraz reduce la integración a una sola llamada a ONNX Runtime más una tabla de vocabulario, lo que simplifica enormemente el despliegue en entornos con recursos limitados y sin aceleradores dedicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR CTC; la model card no detalla la arquitectura interna) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio de duración variable; clips inferiores a 0,5 s devuelven transcripción vacía) |
| Tipos de cuantización | no disponible (el artefacto publicado es un ONNX de precisión nativa; no se documentan variantes cuantizadas) |
| Idiomas soportados | birmano (myanmar, `my`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`freococo.onnx`, 78.115.082 bytes) + `vocab.json` (60.989 bytes) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base `freococo/myanmar_asr`. Lo que sí se documenta es el esquema de decodificación: el modelo emite identificadores de sílaba por frame y se decodifica con CTC voraz (colapsar identificadores repetidos, descartar el identificador en blanco 0 y mapear cada identificador con `vocab.json`). Esto implica una cabeza CTC sobre un vocabulario a nivel de sílaba, adecuada para un idioma de escritura no latina como el birmano.

El artefacto ONNX integra el front-end log-mel dentro del grafo, de modo que la entrada es directamente audio PCM mono a 16 kHz en float32 con rango -1..1 y forma `[1, samples]`. No se dispone de datos sobre el volumen de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o ajuste fino supervisado adicional. La exportación se generó con el script `apps/android/asr/host/export/freococo_onnx.py` del repositorio BudgetWise, y la equivalencia funcional se validó comparando las transcripciones con las del modelo PyTorch original en 65 clips de prueba (18 grabaciones propias de un hablante y 47 de FLEURS), con resultados idénticos.

## Capacidades

- Reconocimiento automático de voz en birmano (myanmar) a partir de audio mono a 16 kHz.
- Salida a nivel de sílaba mediante decodificación CTC voraz con vocabulario externo (`vocab.json`).
- Front-end log-mel integrado en el grafo ONNX: no requiere preprocesado de audio externo más allá de la conversión a float32 en el rango -1..1.
- Inferencia en dispositivo mediante ONNX Runtime, sin dependencia de PyTorch.
- Manejo de audio de duración variable; los clips inferiores a 0,5 s producen transcripción vacía, replicando el comportamiento del modelo original.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio multilingüe ni modo de pensamiento.

## Casos de uso

- Transcripción de voz en birmano en aplicaciones Android: el modelo se integra con ONNX Runtime en el propio teléfono, sin conexión a red, gracias a sus 78 MB de pesos y al front-end integrado en el grafo.
- Aplicaciones de accesibilidad para hablantes de birmano: dictado de texto y subtitulado en tiempo real en dispositivos de gama media, donde un modelo en la nube añadiría latencia y coste de red.
- Notas de voz y diarios personales: conversión de grabaciones cortas a texto en local, con privacidad por diseño al no enviar audio a servidores externos.
- Sistemas de atención al ciudadano en birmano: transcripción de consultas telefónicas o presenciales registradas como audio mono a 16 kHz para su posterior indexación y búsqueda.
- Investigación lingüística y corpus de habla: generación de transcripciones automáticas de grabaciones de campo en birmano para anotación asistida, con revisión humana posterior.
- Integración en pipelines de subtitulado offline: procesamiento por lotes de archivos de audio en servidores sin GPU, aprovechando la ligereza del modelo y la portabilidad de ONNX Runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica documentada es cualitativa: en 65 clips de prueba (18 grabaciones propias de un hablante y 47 de FLEURS), las transcripciones del modelo ONNX son idénticas a las del modelo PyTorch original.

## Requisitos de hardware

- VRAM estimada para inferencia: no se requieren GPU; el modelo está diseñado para ejecución en CPU móvil con ONNX Runtime.
- GPU recomendadas: no aplica para el caso de uso previsto; en servidor puede ejecutarse en CPU sin acelerador.
- ¿Cabe en GPU de consumo? Sí, con holgura: 78 MB de pesos más el grafo y el front-end log-mel caben en cualquier GPU de consumo e incluso en memoria de teléfono.
- Opciones de despliegue: ONNX Runtime (Android, iOS, escritorio, servidor); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo ASR CTC.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| thura2/freococo-myanmar-asr-onnx | no disponible | audio de duración variable | birmano | Apache-2.0 | ONNX | HuggingFace |
| freococo/myanmar_asr | no disponible | audio de duración variable | birmano | Apache-2.0 | PyTorch (modelo base) | HuggingFace |
| Meta's Omnilingual ASR | no disponible | no disponible | multilingüe (según la model card, se usa junto al modelo en la app BudgetWise) | no disponible | no disponible | no disponible |

La comparativa se limita a estos tres sistemas por la información disponible; no se dispone de datos de benchmarks ni de especificaciones detalladas de las alternativas que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo mono-idioma: solo soporta birmano (myanmar); no se documentan capacidades multilingües.
- Vocabulario a nivel de sílaba: la salida es una secuencia de identificadores de sílaba, no texto con puntuación ni formato; la reconstrucción depende de `vocab.json`.
- Clips inferiores a 0,5 s devuelven transcripción vacía, lo que puede requerir lógica de segmentación en la aplicación.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluación de robustez ante ruido, acentos o habla espontánea; la validación publicada se limita a 65 clips.
- Licencia Apache-2.0: permite uso comercial y modificación, pero conviene conservar la atribución al autor original del modelo base, freococo, tal como indica la model card.
- El artefacto es una exportación derivada sin cambios en los pesos; cualquier mejora o corrección debe provenir del modelo base `freococo/myanmar_asr`.
- No se documentan requisitos de memoria en tiempo de ejecución más allá del tamaño del fichero ONNX; el consumo real dependerá de la duración del audio de entrada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thura2/freococo-myanmar-asr-onnx
- Modelo base: https://huggingface.co/freococo/myanmar_asr
- Repositorio BudgetWise (script de exportación `apps/android/asr/host/export/freococo_onnx.py`): no disponible en la información proporcionada
- Paper, blog o demo del modelo base: no disponible en la información proporcionada
