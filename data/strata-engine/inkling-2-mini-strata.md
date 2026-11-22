# strata-engine/Inkling-2-Mini-Strata

## Resumen

Inkling-2-Mini-Strata es una versión cuantizada del modelo multimodal Inkling-2-Mini desarrollado por Thinking Machines Lab, publicada por el proyecto strata-engine. Se distribuye en formato propietario `.strata` y está pensada para ejecutarse en hardware de consumo mediante el motor de inferencia Strata, un runtime local de código abierto orientado a modelos Mixture-of-Experts de gran tamaño. El modelo base es un transformer con bucles (looped transformer) en el que las capas intermedias se ejecutan tres veces por token.

El modelo cuenta con 26.4B parámetros totales y activa 3.4B por token (5.4B contando las pasadas repetidas), lo que permite, según el autor, arrancar en tarjetas gráficas de tan solo 4 GiB de VRAM manteniendo en RAM del sistema la parte del modelo que no cabe en la GPU. Soporta entrada de texto e imágenes y una ventana de contexto de hasta 1.048.576 tokens (1M).

La relevancia de esta ficha radica en que combina tres elementos poco habituales: un modelo MoE con capas recurrentes, una cuantización propia con tres niveles de fidelidad declarada (SQ-10, SQ-15 y SQ-20) y un runtime que descarga parte de los pesos a memoria del sistema. La licencia es Apache 2.0 y no requiere cuenta para su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped transformer con Mixture-of-Experts (MoE); capas intermedias ejecutadas 3 veces por token |
| Parametros totales | 26.4B |
| Parametros activos | 3.4B por token (5.4B contando las pasadas repetidas) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | SQ-10 (10.47 GB), SQ-15 (14.35 GB), SQ-20 (19.35 GB); vision pack adicional de 0.64 GB |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.strata` (formato propietario del motor Strata); el modelo base original no se distribuye en este repo en safetensors ni GGUF |
| Tamano del repo | 44.8 GB |
| Modelo base | thinkingmachines/Inkling-2-Mini |
| Pipeline | image-text-to-text |
| Motor de inferencia | Strata (Windows, Linux, macOS) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con bucles: las capas centrales del modelo se reejecutan tres veces para cada token, lo que incrementa la profundidad efectiva de cómputo sin aumentar proporcionalmente el número de parámetros activos. El modelo es Mixture-of-Experts, con 26.4B parámetros totales de los que solo 3.4B se activan por token en una pasada (5.4B al contabilizar las tres iteraciones de las capas recurrentes). Esta dispersión es lo que hace viable la ejecución en hardware modesto con el esquema de offload del runtime Strata.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación en el modelo base. Tampoco se detalla la innovación de decodificación más allá del esquema de cuantización propio. La cuantización SQ-20 reproduce el modelo original de forma idéntica en todas las pruebas declaradas por el autor, mientras que SQ-15 y SQ-10 sacrifican fidelidad para reducir el tamaño. El pack de visión (`Inkling-2-Mini-Vision.strata`, 0.64 GB) se añade por separado para habilitar la lectura de imágenes.

## Capacidades

- Generación de texto conversacional multi-turno.
- Comprensión de imágenes (image-text-to-text) mediante el pack de visión opcional.
- Contexto largo de hasta 1M tokens, adecuado para documentos extensos o historiales de conversación prolongados.
- Razonamiento y generación de código: no se especifican benchmarks, pero el pipeline y las etiquetas del modelo apuntan a un uso generalista.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local: el modelo puede mantener diálogos multi-turno con hasta 1M tokens de contexto, lo que permite conservar historiales largos sin truncamiento en aplicaciones de escritorio.
- Análisis de documentos extensos con imágenes: gracias al pack de visión y a la ventana de 1M tokens, se pueden procesar informes, manuales o contratos que combinen texto y figuras en una sola pasada.
- Despliegue en estaciones de trabajo con GPU modesta: con una tarjeta de 12 GiB (pack SQ-10) o incluso 4 GiB con offload a RAM, el modelo es viable en equipos de desarrollo sin aceleradores de datacenter.
- Prototipado de aplicaciones multimodales sin conexión: al ejecutarse localmente y sin cuenta, encaja en entornos con requisitos de privacidad o sin acceso a internet.
- Integración con editores y herramientas de código: el runtime Strata expone un endpoint compatible con la API de OpenAI en `http://127.0.0.1:8080/v1`, lo que permite conectar clientes como Cursor o Claude Code.
- Investigación sobre cuantización y arquitecturas recurrentes: los tres niveles SQ permiten estudiar el impacto de la compresión en la fidelidad de la siguiente palabra frente al modelo original.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son métricas de fidelidad de la cuantización respecto al modelo original, no benchmarks de capacidad (MMLU, HumanEval, GSM8K, etc.).

| Metrica | SQ-10 | SQ-15 | SQ-20 |
|---|---:|---:|---:|
| Coincidencia con el original (prompts de prueba) | 92.35% | 96.68% | 100% |
| Coincidencia con el original (WikiText-2) | 89.79% | 95.97% | 100% |
| Tamano de descarga | 10.47 GB | 14.35 GB | 19.35 GB |
| GPU recomendada | 12 GiB | 16 GiB | 24 GiB |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM mínima: 4 GiB para arrancar, con offload de la parte no residente a RAM del sistema.
- VRAM recomendada según pack: 12 GiB (SQ-10), 16 GiB (SQ-15), 24 GiB (SQ-20).
- Vision pack: 0.64 GB adicionales para entrada de imágenes.
- GPU de consumo: tarjetas de 12, 16 y 24 GiB cubren los tres packs; no se especifican modelos concretos (RTX 4090, A100, H100) en la información disponible.
- Despliegue: motor Strata (app de escritorio para Windows, Linux y macOS; instalación por terminal con `install.sh` o `install.ps1`). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Endpoint local compatible con la API de OpenAI en `http://127.0.0.1:8080/v1`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base ni de alternativas comparables en la información proporcionada, por lo que la comparativa cuantitativa no está disponible. A modo orientativo, se compara el propio modelo consigo mismo en sus tres niveles de cuantización:

| Version | Parametros | Contexto | Fidelidad vs. original | Licencia | Formato |
|---|---|---|---|---|---|
| Inkling-2-Mini (original) | 26.4B (3.4B activos) | 1M | referencia | no disponible | no disponible |
| Inkling-2-Mini-Strata SQ-20 | 26.4B (3.4B activos) | 1M | 100% | Apache 2.0 | `.strata` |
| Inkling-2-Mini-Strata SQ-15 | 26.4B (3.4B activos) | 1M | 96.68% | Apache 2.0 | `.strata` |
| Inkling-2-Mini-Strata SQ-10 | 26.4B (3.4B activos) | 1M | 92.35% | Apache 2.0 | `.strata` |

Comparativa con modelos de la misma categoría (Qwen, Llama, Mistral, etc.): no disponible en la información proporcionada.

## Limitaciones y advertencias

- El formato `.strata` es propietario del motor Strata; no hay pesos en safetensors ni GGUF en este repositorio, lo que limita la portabilidad a otros runtimes.
- La fidelidad de SQ-10 y SQ-15 no es total: entre el 3% y el 8% de las predicciones de siguiente palabra difieren del original, lo que puede acumular errores en generaciones largas.
- El rendimiento con offload a RAM del sistema depende del ancho de banda de memoria y puede degradarse notablemente en equipos con poca RAM o PCIe lento.
- No se especifican los idiomas soportados; el comportamiento multilingüe es desconocido.
- No hay información sobre sesgos, tasas de alucinación ni evaluaciones de seguridad del modelo base.
- No se documenta soporte de tool calling ni de agentes, por lo que no debe asumirse en producción sin verificación.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base y del motor Strata por separado antes de un despliegue comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; se trata de una publicación reciente sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/strata-engine/Inkling-2-Mini-Strata
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio del motor Strata: https://github.com/Niko1221/Strata
- Descargas de Strata: https://github.com/Niko1221/Strata/releases/latest
- Sitio del proyecto Strata: https://stratallm.org/
- Documentación y descargas: https://www.stratat.com/en/download
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
