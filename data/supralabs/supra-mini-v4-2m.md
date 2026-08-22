# SupraLabs/Supra-Mini-v4-2M

## Resumen

Supra Mini v4 2M es un modelo de lenguaje muy pequeño (2,6 millones de parámetros) desarrollado por SupraLabs, un laboratorio independiente centrado en modelos abiertos que se ejecutan en hardware de consumo. Es la cuarta versión de la serie Supra Mini y está diseñado para entornos con recursos limitados, como CPU, dispositivos embebidos o experimentación educativa. El modelo sigue una arquitectura tipo Llama con 6 capas ocultas, 4 cabezas de atención y una ventana de contexto de 1024 tokens, y fue entrenado sobre 3000 millones de tokens del dataset Fineweb-Edu durante dos épocas.

La relevancia de este modelo reside en su extrema ligereza: puede ejecutarse en una CPU sin GPU y en menos de 1 GB de RAM, lo que lo convierte en un candidato ideal para pruebas de concepto, investigación académica o integraciones en entornos con restricciones de hardware. Su licencia Apache 2.0 permite uso comercial sin restricciones. No obstante, sus capacidades son muy limitadas: no razona, no mantiene conversaciones coherentes ni genera código, y su salida tiende a ser incoherente y poco factual, por lo que debe considerarse como una herramienta de estudio y experimentación más que como un modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder-only) |
| Parametros totales | 2.623.104 (2M) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (pesos en bfloat16, puede cargarse en fp32/fp16) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Supra Mini v4 2M emplea una arquitectura transformer decoder-only clasica, similar a Llama, con 6 capas ocultas, 4 cabezas de atencion, un tamaño de capa oculta de 128 y una capa intermedia de 512. El tokenizador es un BPE personalizado con un vocabulario de 8192 tokens, entrenado por los propios autores. El modelo se entreno en bfloat16 sobre los primeros 3 mil millones de tokens del dataset Sample-10BT de Fineweb-Edu, durante 2 epocas, con una tasa de aprendizaje de 3e-4 y un weight decay de 0.01. El entrenamiento completo tardo unas 3 horas en una unica GPU NVIDIA RTX 5060 Ti de 16 GB, lo que demuestra la viabilidad de entrenar modelos de este tamano en hardware de consumo.

No se aplicaron tecnicas de alineacion como RLHF o DPO. La perdida final de cross-entropy en el conjunto de entrenamiento fue de 4.618, un valor alto que refleja la dificultad de la tarea dado el tamano reducido del modelo. El codigo de entrenamiento (tokenizador, entrenamiento e inferencia) esta disponible en el repositorio del modelo.

## Capacidades

- Generacion de texto basica: puede continuar secuencias cortas de texto, aunque con coherencia limitada y frecuentes desviaciones.
- Procesamiento de lenguaje natural a nivel de superficie: reconoce patrones estadisticos del ingles, pero no comprende el significado.
- Funciones de tool calling o function calling: no soportadas.
- Uso como agente o razonamiento multi-paso: no soportado.
- Capacidades multilingues: unicamente ingles; no hay evidencia de competencia en otros idiomas.
- Capacidades especiales: ninguna (no vision, no audio, no modo thinking).

## Casos de uso

- **Educacion en deep learning**: permite a estudiantes y docentes inspeccionar el comportamiento de un transformer minimo, ejecutar experimentos de fine-tuning o estudiar la relacion entre tamano del modelo y calidad del texto, sin necesidad de infraestructura costosa.
- **Pruebas de pipelines de inferencia**: ideal para validar integraciones con Transformers, vLLM u Ollama en entornos de desarrollo, ya que se carga en segundos y no requiere GPU.
- **Prototipado de sistemas de generacion de texto**: para experimentar con parametros de muestreo (temperatura, top-k, top-p) y observar su efecto en la salida de un modelo real.
- **Investigacion sobre modelos minimos**: como punto de partida para estudiar los limites de los modelos de lenguaje muy pequenos o para comparar arquitecturas alternativas.
- **Experimentos de fine-tuning**: su tamano permite ajustarlo en una sola GPU o incluso en CPU, siendo util para practicar tecnicas de fine-tuning y evaluacion.
- **Diversion y exploracion**: para curiosos que quieran ver que texto produce un modelo entrenado desde cero con pocos recursos.

## Benchmarks y rendimiento

Los resultados de benchmarks fueron ejecutados por el autor con `lm-eval`:

| Tarea | Valor | Nivel aleatorio |
|---|---|---|
| Arc_Easy | 0.3152 | 0.25 (25 %) |
| Wikitext | 3.1652 | - |
| BLiMP | 0.607 | 0.5 (50 %) |

Los resultados muestran un rendimiento ligeramente superior al nivel aleatorio en Arc_Easy y BLiMP, lo que indica que el modelo ha aprendido ciertos patrones linguisticos basicos, pero no es capaz de razonar ni de resolver tareas complejas. No se dispone de comparaciones con otros modelos de tamano similar en la informacion proporcionada.

## Requisitos de hardware

- **VRAM estimada**: menos de 10 MB en fp32; menos de 5 MB en fp16. Cabe en cualquier GPU, incluso integradas.
- **GPU recomendadas**: cualquiera, incluyendo CPU sin GPU. Puede ejecutarse en Raspberry Pi o similares.
- **Consumer GPU**: si, se ejecuta en cualquier GPU consumer moderna (RTX 3060, 4090, etc.) con un uso minimo de recursos.
- **Opciones de despliegue**: Transformers pipeline, llama.cpp (via GGUF, aunque no se han publicado archivos GGUF), Ollama, vLLM (aunque es overkill), y cualquier framework que soporte safetensors.
- **Latencia y throughput**: en CPU, la generacion de 100 tokens puede tomar menos de un segundo; en GPU, es practicamente instantaneo. No hay datos oficiales.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos de tamano equivalente (por ejemplo, TinyLlama, SmolLM-135M, etc.) para realizar una comparativa directa. El autor indica que Supra Mini v4 2M es una version previa de la serie, con una nueva version Supra-Mini-v5-8M ya publicada, que probablemente ofrece mejores resultados por su mayor tamano. Se recomienda consultar los repositorios de otros modelos mini (como SmolLM de Hugging Face) para evaluar alternativas, aunque la comparacion no es directa por diferencias en arquitectura y datos de entrenamiento.

## Limitaciones y advertencias

- **Incapacidad de razonar**: el modelo no puede realizar tareas de razonamiento logico, matematicas o comprension de contexto.
- **Incoherencia**: la salida es incoherente en la mayoria de los casos, incluso para prompts sencillos.
- **Falta de factualidad**: genera afirmaciones no veridicas y no tiene acceso a informacion actualizada.
- **Sesgos**: al entrenarse con FineWeb-Edu, puede reproducir sesgos presentes en los datos de origen, aunque no se han documentado evaluaciones de sesgos.
- **Idioma**: solo ingles, sin evidencia de competencia en otros idiomas.
- **Uso en produccion**: no es recomendable para ningun caso de uso en produccion, ni siquiera como fallback, dado su baja calidad de texto.
- **Contexto limitado**: 1024 tokens, insuficiente para tareas que requieran contexto largo.
- **Licencia**: Apache 2.0 permite uso comercial, pero no hay garantias de calidad ni soporte.

## Enlaces

- [Pagina del modelo en Hugging Face](https://huggingface.co/SupraLabs/Supra-Mini-v4-2M)
- [Repositorio del modelo en Hugging Face](https://huggingface.co/SupraLabs/Supra-Mini-v4-2M/tree/main)
- [Web de SupraLabs](https://supra-labs.com/)
- [Nueva version Supra-Mini-v5-8M (referenciada en la model card)](https://huggingface.co/SupraLabs/Supra-Mini-v5-8M)
