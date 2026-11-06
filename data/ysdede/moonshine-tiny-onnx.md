# ysdede/moonshine-tiny-onnx

## Resumen

Moonshine Tiny ONNX es una exportación a formato ONNX del modelo de reconocimiento automático de voz (ASR) UsefulSensors/moonshine-tiny, desarrollado originalmente por Useful Sensors / Moonshine AI y reempaquetado por el usuario ysdede para su uso en ASRJS. El modelo realiza transcripción de voz a texto en inglés y está pensado para escenarios de inferencia ligera, incluyendo potencialmente entornos web o de borde, dado el formato ONNX y el reducido tamaño del repositorio (0,1 GB). Los pesos son idénticos a los del modelo original; lo que cambia es la topología del grafo.

La exportación separa el modelo en tres grafos independientes: el codificador (encoder), las proyecciones de atención cruzada (cross-attention projections) y el paso del decodificador (decoder step). Esta estructura de "stacked-cache" está diseñada para encajar con el runtime ASRJS, lo que facilita la ejecución por etapas y la gestión de caché entre pasos de decodificación. Es relevante para desarrolladores que necesiten integrar ASR en pipelines JavaScript o entornos donde ONNX Runtime sea el backend preferido, aunque la publicación no garantiza paridad de comportamiento con el modelo original en navegador.

Se trata de un modelo "tiny" dentro de la familia Moonshine, orientado a transcripción de baja latencia y bajo consumo de recursos. La licencia MIT permite uso comercial sin restricciones significativas, y el idioma soportado es únicamente inglés. No se dispone de datos publicados sobre benchmarks ni de especificaciones detalladas de arquitectura y entrenamiento en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (exportado en tres grafos ONNX: encoder, cross-attention projections, decoder step) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (exportación ONNX; no se especifican variantes cuantizadas) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a UsefulSensors/moonshine-tiny, un modelo encoder-decoder para ASR. La exportación de ysdede reorganiza el grafo en tres componentes: el codificador, las proyecciones de atención cruzada y el paso del decodificador, con una topología de caché apilada (stacked-cache) pensada para el runtime ASRJS. Los pesos no han sido modificados respecto al modelo original; el repositorio incluye un archivo `export-receipt.json` con los hashes de los pesos fuente y de los grafos, lo que permite verificar la integridad de la conversión.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO en el modelo original dentro de la información proporcionada. Tampoco se detallan innovaciones técnicas específicas más allá de la separación de grafos para inferencia por etapas.

## Capacidades

- Reconocimiento automático de voz (ASR) en inglés: transcripción de audio a texto.
- Ejecución por etapas mediante grafos ONNX separados (encoder, cross-attention, decoder step), adecuada para runtimes con gestión explícita de caché.
- Integración con el runtime ASRJS para aplicaciones JavaScript.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio más allá de la transcripción.
- Capacidad multilingüe limitada al inglés.
- No se documenta modo "thinking" ni capacidades especiales adicionales.

## Casos de uso

- Transcripción de notas de voz en aplicaciones web: el formato ONNX y el tamaño reducido permiten ejecutar el modelo en el navegador mediante ONNX Runtime Web o en un backend Node.js, transcribiendo audio en inglés sin depender de servicios en la nube.
- Subtitulado en tiempo real de reuniones o videollamadas: la arquitectura encoder-decoder con decodificación por pasos facilita el streaming de transcripciones en aplicaciones de comunicación internas.
- Asistentes de voz para interfaces de línea de comandos: integración en herramientas CLI que acepten comandos hablados en inglés, aprovechando la baja huella del modelo tiny.
- Procesamiento por lotes de archivos de audio: transcripción de grandes volúmenes de grabaciones en inglés en pipelines de datos, con despliegue en servidores sin GPU dedicada.
- Prototipado rápido de funcionalidades ASR: al estar en ONNX y con licencia MIT, sirve para validar productos de voz antes de invertir en modelos mayores.
- Aplicaciones de borde (edge): despliegue en dispositivos con recursos limitados donde un modelo tiny y un runtime ONNX sean preferibles a soluciones basadas en API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el tamaño del repositorio es de 0,1 GB, lo que sugiere un modelo muy ligero que probablemente quepa en memoria de CPU y en GPUs de gama baja.
- GPU recomendadas: no disponible; por el tamaño, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) debería ser suficiente, aunque no se confirma en la documentación.
- Cabe en GPU consumer: probablemente sí, dado el tamaño del repositorio, pero no se especifica oficialmente.
- Opciones de despliegue: ONNX Runtime (incluido ONNX Runtime Web), runtime ASRJS; no se documentan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Moonshine Tiny ONNX (este) | no disponible | no disponible | Inglés | MIT | ONNX |
| UsefulSensors/moonshine-tiny (original) | no disponible | no disponible | Inglés | MIT (según modelo fuente) | safetensors / PyTorch |
| Whisper tiny | ~39 M | 30 s de audio | Multilingüe | MIT | PyTorch, ONNX, GGML |
| Whisper base | ~74 M | 30 s de audio | Multilingüe | MIT | PyTorch, ONNX, GGML |

La comparación con Whisper tiny y base se ofrece como referencia de categoría (ASR ligero), pero no se dispone de datos de rendimiento comparativo en la información proporcionada. El modelo original de Moonshine está diseñado como alternativa a Whisper en tareas de ASR en inglés con menor latencia, aunque no se aportan métricas en esta ficha.

## Limitaciones y advertencias

- Solo soporta inglés; no es adecuado para transcripción multilingüe.
- No se han publicado benchmarks que permitan evaluar su precisión frente a alternativas.
- La publicación no establece paridad de comportamiento en navegador con el modelo original; el autor lo indica explícitamente.
- Riesgo de alucinación en transcripciones con audio ruidoso o acentos no representados en el entrenamiento original; no se documentan sesgos específicos.
- Aunque la licencia es MIT, conviene verificar la licencia del modelo fuente (UsefulSensors/moonshine-tiny) y los términos de uso de los datos de entrenamiento originales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.
- No se documentan limitaciones de contexto de audio ni duración máxima de las grabaciones.

## Enlaces

- Hugging Face: https://huggingface.co/ysdede/moonshine-tiny-onnx
- Modelo fuente: https://huggingface.co/UsefulSensors/moonshine-tiny
- Repositorio de Moonshine AI (referencia): no disponible en la información proporcionada
- Paper de Moonshine: no disponible en la información proporcionada
- Runtime ASRJS: no disponible en la información proporcionada
