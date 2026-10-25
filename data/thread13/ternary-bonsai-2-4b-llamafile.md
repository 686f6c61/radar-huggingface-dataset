# thread13/Ternary-Bonsai-2-4B-llamafile

## Resumen

Ternary-Bonsai-2-4B-llamafile es un empaquetado ejecutable del modelo ternario Ternary-Bonsai-2-4B, publicado por el usuario thread13 en formato llamafile. No se trata de un modelo nuevo, sino de una distribución del GGUF original de prism-ml (`prism-ml/Ternary-Bonsai-2-4B-gguf`) dentro de un binario único de tipo APE (Actually Portable Executable) basado en llama.cpp, que incluye el modelo embebido y arranca una consola de chat y/o un servidor web sin necesidad de instalar dependencias.

El interés de esta ficha está en la combinación de dos factores: por un lado, un modelo de aproximadamente 4.000 millones de parámetros cuantizado en ternario (2 bits, Q2_0), lo que deja el artefacto completo en 1,6 GB; por otro, el formato llamafile, que convierte la inferencia en un único fichero ejecutable multiplataforma (Linux, macOS, Windows vía `.exe`, WSL) pensado para pruebas rápidas y despliegues locales sin infraestructura.

La relevancia es, por tanto, práctica y de evaluación: permite probar un modelo ternario de la familia Qwen3.5 (según los tags del repositorio) en hardware muy modesto y con fricción casi nula. Ahora bien, el repositorio no declara licencia ni idiomas, no incluye resultados de benchmarks y no documenta la arquitectura interna del modelo base, por lo que cualquier uso en producción exige verificar previamente el repositorio de origen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el tag `qwen35` sugiere linaje Qwen3.5; el repositorio no describe la arquitectura) |
| Parámetros totales | ~4B según el nombre del modelo; cifra exacta no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como máximo oficial; el autor recomienda `--ctx-size 16384` en los ejemplos de uso |
| Tipos de cuantización | ternaria de 2 bits, variante Q2_0 (`ternary-bonsai-2-4b-q2_0`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF embebido en un ejecutable llamafile (APE), basado en llama.cpp; llamafile 0.10 |
| Tamaño del repositorio | 1,6 GB |
| Pipeline declarado | image-text-to-text |
| Modalidad declarada | conversational, text-generation-inference; tag `image-text-to-text` (entrada de imagen no verificada en el GGUF base) |

## Arquitectura y entrenamiento

El repositorio no aporta información sobre la arquitectura del modelo subyacente: no se detalla el tipo de transformer, el número de capas, las dimensiones ocultas ni si emplea atención lineal o algún esquema híbrido. El tag `qwen35` apunta a que Ternary-Bonsai-2-4B deriva de la familia Qwen3.5, y el propio autor enlaza la documentación de Unsloth sobre Qwen3.5 para ajustar parámetros de muestreo y activar el modo de razonamiento, lo que refuerza esa hipótesis sin confirmarla formalmente. Tampoco se documentan los datos de entrenamiento (número de tokens, composición del corpus) ni si hubo fases de RLHF o DPO.

La innovación técnica relevante no está en el entrenamiento sino en la compresión y el empaquetado. La cuantización ternaria Q2_0 reduce los pesos a 2 bits, lo que explica que un modelo de ~4B quepa en un fichero de 1,6 GB (incluyendo el binario de llama.cpp y el modelo embebido). El artefacto se distribuye como llamafile: un ejecutable APE que incorpora el runtime de llama.cpp y el GGUF, arranca por defecto consola de chat y servidor web simultáneamente, y admite `--chat`, `--server` y `--cli` como modos separados. El modo "thinking" se activa pasando `--chat-template-kwargs '{"enable_thinking":true}'`, lo que indica que la plantilla de chat del modelo base soporta razonamiento explícito.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat propia y soporte de system prompt.
- Modo de razonamiento ("thinking mode") activable mediante argumentos de plantilla; el autor documenta parámetros de muestreo distintos para código y para razonamiento.
- Generación de código: los ejemplos de configuración recomendados incluyen un preset específico para "coding in thinking mode".
- El pipeline declarado en HuggingFace es `image-text-to-text`, lo que sugiere capacidad de entrada de imagen; no obstante, el GGUF base no documenta proyector visual, por lo que debe tratarse como no confirmado.
- Multilingüismo: no disponible; no se declaran idiomas en el repositorio.
- Tool calling / function calling: no disponible (no se menciona en la model card).
- Soporte de agentes y razonamiento multi-paso: parcialmente implícito por el modo thinking, pero sin documentación específica de agentes.
- Ejecución local sin dependencias externas, con interfaz de consola, web y CLI de completado.

## Casos de uso

- Evaluación rápida de modelos ternarios: descargar el `.llamafile`, ejecutarlo con `--chat` y comparar cualitativamente la calidad de un modelo de 2 bits frente a cuantizaciones Q4 en el mismo hardware, sin instalar Python ni llama.cpp.
- Prototipado en máquinas sin GPU: al ocupar 1,6 GB en disco, el modelo puede correr en CPU en portátiles convencionales, lo que sirve para validar prompts y plantillas de chat antes de invertir en infraestructura.
- Demostraciones offline en portátil: el binario único permite llevar un asistente conversacional a entornos sin conectividad ni permisos de instalación, por ejemplo en talleres o sesiones de formación.
- Pruebas de despliegue local con servidor web: arrancando `--server --host 127.0.0.1` se expone una API compatible con llama.cpp para conectar clientes propios y medir latencia real en el hardware objetivo.
- Generación de código asistida en local con modo thinking: usando el preset recomendado (`--ctx-size 16384 --temp 0.6 --top-p 0.95 --top-k 20 --min-p 0.00`) para tareas de autocompletado y explicación de fragmentos, siempre con revisión humana.
- Experimentación con cuantización extrema en investigación: útil para estudiar la degradación de calidad de esquemas ternarios frente a FP16 o Q8 en tareas de razonamiento y matemáticas, dentro de un pipeline reproducible con llama.cpp.
- Base para integraciones vía CLI: el modo `--cli` permite encadenar el modelo en scripts de shell para tareas de resumen o clasificación de texto sin levantar un servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del llamafile no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y el repositorio base (`prism-ml/Ternary-Bonsai-2-4B-gguf`) se referencia únicamente como origen de los pesos, sin tabla de resultados en los datos proporcionados.

## Requisitos de hardware

- Huella en disco: 1,6 GB para el repositorio completo; el `Ternary-Bonsai-2-4B-Q2_0.llamafile` es el artefacto principal, con una variante renombrada a `.exe` para Windows.
- VRAM/RAM estimada para inferencia: en torno a 2-3 GB incluyendo overhead de contexto y runtime, partiendo de un fichero de 1,6 GB con pesos de 2 bits (estimación derivada del tamaño del artefacto, no publicada por el autor).
- Cabe en GPU de consumo: sí, cualquier GPU con 4 GB o más de VRAM; también es viable en modo CPU-only, que es el escenario natural de llamafile.
- GPU recomendadas: no disponibles. Para este tamaño y cuantización no se requieren A100 ni H100; el cuello de botella es más probablemente el ancho de banda de memoria que la capacidad.
- Opciones de despliegue: llamafile 0.10 (formato nativo del repositorio) y llama.cpp subyacente. vLLM, TGI u Ollama no están documentados para esta cuantización ternaria Q2_0 y no hay evidencia de soporte en la información proporcionada.
- Latencia y throughput: no disponibles. No se publican tokens por segundo ni mediciones de tiempo hasta el primer token.
- Nota operativa: por defecto el servidor web escucha en todas las interfaces; usar `--host 127.0.0.1` para restringirlo a local.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización / formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thread13/Ternary-Bonsai-2-4B-llamafile | ~4B (según nombre) | Ternaria 2-bit Q2_0 en ejecutable llamafile | Recomendado 16k en los ejemplos; máximo no disponible | no disponible | HuggingFace, 0 descargas, 0 likes |
| prism-ml/Ternary-Bonsai-2-4B-gguf (modelo base) | ~4B (según nombre) | Ternaria 2-bit Q2_0 en GGUF | no disponible | no disponible | HuggingFace (origen de los pesos) |
| Microsoft BitNet b1.58 2B4T | 2B | Ternaria 1.58-bit | no disponible en esta ficha | licencia permisiva según su publicación original; verificar | Público; referencia de la familia ternaria |

La comparación cuantitativa con alternativas no es posible con los datos disponibles: ni este repositorio ni su base publican benchmarks, y la referencia a BitNet se incluye únicamente como término de comparación de la categoría (modelos ternarios de pocos parámetros), no como medición verificada en esta búsqueda.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no se puede asumir permiso para uso comercial; hay que consultar el repositorio base y la licencia de la familia Qwen3.5 antes de cualquier despliegue productivo.
- Idiomas no declarados: se desconoce la cobertura lingüística real, incluido el castellano.
- Degradación por cuantización ternaria: los pesos de 2 bits implican pérdida de precisión frente a FP16 o Q8; no hay medición publicada de esa pérdida, así que debe evaluarse empíricamente en la tarea concreta.
- Riesgo de bucles de generación: el propio autor documenta que la generación puede entrar en bucles infinitos y recomienda subir `presence_penalty` entre 0,0 y 1,5.
- Alucinación: sin benchmarks ni documentación de entrenamiento, el riesgo de alucinación no está caracterizado; en un modelo de 2 bits es esperable que sea mayor que en las versiones completas.
- Falsos positivos de antivirus: el autor advierte de que VirusTotal marca los llamafiles como sospechosos (también los de Mozilla AI), y que un motor ("SecureAge") lo etiqueta como malicioso por el LLM embebido. Requiere verificación propia y, preferiblemente, ejecución en máquina virtual.
- Ejecutable sin firmar: el `.exe` de Windows puede ser bloqueado por el sistema; el autor declina cualquier responsabilidad sobre su ejecución.
- Modo servidor expuesto por defecto: sin `--host 127.0.0.1`, el servidor web escucha en todas las interfaces de red.
- Capacidad de visión no confirmada: el pipeline `image-text-to-text` puede inducir a error si el GGUF base no incluye proyector multimodal.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin revisión comunitaria que avale el empaquetado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/thread13/Ternary-Bonsai-2-4B-llamafile
- Modelo base (GGUF): https://huggingface.co/prism-ml/Ternary-Bonsai-2-4B-gguf
- Guía de inicio rápido de llamafile: https://github.com/mozilla-ai/llamafile/blob/main/docs/quickstart.md
- Cómo ejecutar un llamafile: https://github.com/mozilla-ai/llamafile/blob/main/docs/running_llamafile.md
- Cómo crear llamafiles: https://github.com/mozilla-ai/llamafile/blob/main/docs/creating_llamafiles.md
- Documentación de llamafile: https://mozilla-ai.github.io/llamafile/
- Especificación del formato APE: https://justine.lol/ape.html
- Releases de llama.cpp: https://github.com/ggml-org/llama.cpp/releases
- Issue sobre peculiaridades de llamafile: https://github.com/mozilla-ai/llamafile/issues/373
- Problemas conocidos y solución de problemas (rama 0.9.0): https://github.com/mozilla-ai/llamafile/tree/0.9.0?tab=readme-ov-file#gotchas-and-troubleshooting
- Documentación de Unsloth sobre Qwen3.5 (muestreo y thinking mode): https://unsloth.ai/docs/models/qwen3.5
- Llamafiles de referencia de Mozilla AI: https://huggingface.co/mozilla-ai/llamafile_0.10/tree/main

Nota: la búsqueda web realizada no devolvió resultados técnicos relevantes sobre este modelo; únicamente aparecieron sitios sin relación con la ficha (contenido de deepfakes), que se han omitido por no ser fuentes válidas.
