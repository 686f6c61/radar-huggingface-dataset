# Thuul/swiss-parakeet-ultra

## Resumen

Swiss Parakeet Ultra es un modelo de reconocimiento automático del habla (ASR) especializado en las lenguas habladas en Suiza: alemán suizo, alemán estándar, inglés, francés e italiano. Lo desarrolla el usuario Thuul como un ajuste fino de Parakeet TDT 0.6b v3 de NVIDIA, partiendo de Moondream Parakeet Ultra. El modelo resuelve el problema de transcribir habla en dialectos del alemán suizo, que los sistemas ASR convencionales manejan con tasas de error muy elevadas, y lo hace escribiendo la salida en alemán estándar en lugar de reproducir el dialecto.

La arquitectura es Parakeet TDT (Token-and-Duration Transducer), un modelo transducer con 627 millones de parámetros y el mismo tokenizador que la versión original de NVIDIA. El repositorio incluye tres formatos del mismo modelo: pesos safetensors para Transformers, exportaciones ONNX (fp16 e int8) para navegador y runtimes ligeros, y modelos Core ML compilados para dispositivos Apple.

Su relevancia radica en la mejora concreta sobre los modelos base: reduce los errores en alemán suizo de 21,1 a 7,2 por cada 100 palabras en el conjunto de evaluación parlamentaria, manteniendo o mejorando el rendimiento en las otras cuatro lenguas. Todo el modelo cabe en 9 GB de repositorio y las versiones cuantizadas permiten ejecución en navegador y en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Parakeet TDT (Token-and-Duration Transducer) |
| Parametros totales | 627.057.286 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; ventana Core ML de 15 segundos) |
| Tipos de cuantizacion | fp16 (ONNX half precision), int8 (ONNX 8-bit), Core ML con encoder int8 |
| Idiomas soportados | gsw (alemán suizo), de, en, fr, it |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors, ONNX (fp16 e int8), Core ML compilado |

## Arquitectura y entrenamiento

El modelo es un transducer TDT de 0,6 B parámetros, la misma arquitectura y tokenizador que NVIDIA Parakeet TDT 0.6b v3. La innovación del TDT frente a un transducer convencional es que el decoder predice conjuntamente el token y su duración, lo que reduce el número de pasos de decodificación y mejora la eficiencia. El modelo parte de Moondream Parakeet Ultra, combinado con los cambios de pesos de un ajuste fino previo en alemán suizo sobre Parakeet TDT 0.6b v3, y después se sometió a dos ejecuciones cortas de entrenamiento sobre las cinco lenguas con tasa de aprendizaje baja.

Los datos de entrenamiento son Swiss Parliaments Corpus Re-Imagined (SPC_R), con aproximadamente 475 horas de habla en alemán suizo con transcripción en alemán estándar (CC BY 4.0), y VoxPopuli con habla transcrita: alemán 131 h, inglés 49 h, francés 45 h e italiano 46 h (CC0). La última ejecución de entrenamiento extrajo el 52 % del audio de alemán suizo, el 23 % de alemán, el 20 % de inglés, el 3 % de francés y el 2 % de italiano, un reparto deliberadamente desequilibrado hacia la lengua objetivo. No se menciona entrenamiento con RLHF ni DPO, algo esperable en un modelo ASR.

## Capacidades

- Transcripción de voz a texto en alemán suizo, alemán, inglés, francés e italiano.
- Salida en alemán estándar para el habla en alemán suizo, no transcripción dialectal.
- Reconocimiento de habla parlamentaria y de lectura (los conjuntos de evaluación son VoxPopuli y FLEURS).
- Exportación ONNX compatible con runtimes de navegador (WebGPU) mediante parakeet.js y onnx-asr.
- Modelos Core ML compilados para ejecución en Neural Engine de dispositivos Apple.
- Decodificación con límite de tokens por frame de audio (valor habitual 10) soportada por NeMo, parakeet.js, onnx-asr y FluidAudio.
- No se documentan tool calling, function calling, capacidades de agente ni modo thinking; es un modelo puramente ASR.

## Casos de uso

- Transcripción de sesiones parlamentarias: el modelo está ajustado y evaluado sobre el Grosser Rat de Berna, por lo que transcribe discursos en alemán suizo con 7,2 errores por 100 palabras, frente a 21,9 del Parakeet v3 original.
- Subtitulado de reuniones y actas en Suiza: al cubrir las cuatro lenguas oficiales más el inglés, un único modelo puede transcribir reuniones multilingües sin cambiar de motor ASR.
- Aplicaciones web de dictado sin backend: la exportación ONNX fp16 (1,2 GB) se ejecuta en navegador con WebGPU mediante parakeet.js, útil para herramientas de transcripción que no pueden enviar audio a un servidor.
- Aplicaciones móviles y de escritorio en Apple: los modelos Core ML compilados (ventana de 15 segundos) permiten transcripción local en el Neural Engine, con el encoder int8 como variante más ligera.
- Archivado y búsqueda de contenido audiovisual: transcripción por lotes de grabaciones en alemán suizo a texto estándar, lo que facilita indexación y búsqueda sobre material que de otro modo requeriría traducción manual.
- Investigación lingüística sobre variación dialectal: permite obtener transcripciones normalizadas de habla dialectal para análisis comparativos, con la advertencia de que la salida no preserva el dialecto.
- Integración en pipelines de accesibilidad: generación de subtítulos en tiempo casi real en entornos con hardware modesto gracias al tamaño de 0,6 B y a las versiones cuantizadas.

## Benchmarks y rendimiento

Errores reales por cada 100 palabras en conjuntos de test no vistos durante el entrenamiento (300 clips por conjunto). Las diferencias con la transcripción humana se juzgaron con un modelo de lenguaje; las variantes de ortografía y formato no cuentan, y en alemán suizo tampoco cuenta una redacción distinta con el mismo significado.

| Conjunto de test | Parakeet v3 (original) | Parakeet Ultra | Swiss Parakeet v5 |
|---|---|---|---|
| Alemán suizo, parlamento cantonal de Berna (SPC_R) | 21,9 | 21,1 | **7,2** |
| Alemán, parlamento (VoxPopuli) | 8,2 | **7,5** | 7,7 |
| Alemán, habla leída (FLEURS) | 3,8 | **3,0** | 3,4 |
| Inglés, parlamento (VoxPopuli) | 5,8 | **5,4** | 5,5 |
| Inglés, habla leída (FLEURS) | 3,9 | **3,5** | 3,8 |
| Francés, parlamento (VoxPopuli) | 9,5 | 9,3 | 9,4 |
| Francés, habla leída (FLEURS) | 4,7 | 4,2 | 4,2 |
| Italiano, parlamento (VoxPopuli) | 15,6 | **14,6** | 17,2 |
| Italiano, habla leída (FLEURS) | 2,3 | **1,6** | 1,8 |

Frente a NVIDIA Parakeet v3, el modelo comete menos errores en ocho de los nueve conjuntos, con mejoras en cada lengua evaluada. La excepción es el italiano parlamentario, con 17,2 errores frente a 15,6 de v3. Frente a Moondream Parakeet Ultra, reduce los errores en alemán suizo de 21,1 a 7,2, aunque Ultra lidera por hasta 0,4 errores en siete conjuntos y por 2,6 en italiano parlamentario.

Verificación de las exportaciones sobre 200 clips frente al modelo PyTorch: el encoder ONNX en media precisión produce la transcripción idéntica en 198 clips, el encoder Core ML en 194 y el encoder ONNX de 8 bits en 158 (aproximadamente 0,3 errores más por 100 palabras).

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 2,5 GB solo para pesos; en fp16 aproximadamente 1,3 GB.
- Versión ONNX fp16 del encoder: 1,2 GB, recomendada para navegador con WebGPU.
- Versión ONNX int8 del encoder: 0,8 GB, pensada como alternativa para CPU.
- GPU recomendadas: cualquier GPU con soporte WebGPU o CUDA para las versiones ONNX; para PyTorch, una GPU de consumo con al menos 4 GB de VRAM es suficiente dado el tamaño de 0,6 B.
- Cabe en GPU de consumo: sí, por el tamaño del modelo; no se publican requisitos mínimos oficiales.
- Opciones de despliegue: Transformers (AutoModelForTDT), NeMo, parakeet.js, onnx-asr, FluidAudio (Core ML), runtimes ONNX genéricos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Alemán suizo (errores/100 palabras) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swiss Parakeet Ultra (Thuul) | 627 M | no disponible (Core ML 15 s) | 7,2 | CC BY 4.0 | Hugging Face, ONNX, Core ML |
| Parakeet TDT 0.6b v3 (NVIDIA) | 0,6 B | no disponible | 21,9 | CC BY 4.0 | Hugging Face |
| Moondream Parakeet Ultra | no disponible | no disponible | 21,1 | CC BY 4.0 | Hugging Face |

El modelo se posiciona como la mejor opción de la comparativa para alemán suizo, con una ventaja de casi 14 errores por 100 palabras sobre los dos modelos base. En el resto de lenguas, Moondream Parakeet Ultra mantiene una ligera ventaja (hasta 0,4 errores en siete conjuntos), por lo que la elección depende de si la prioridad es el dialecto suizo o el rendimiento multilingüe general.

## Limitaciones y advertencias

- El ajuste fino y la evaluación en alemán suizo usan exclusivamente grabaciones SPC_R del Grosser Rat de Berna; el rendimiento por dialecto, en conversación informal y en grabaciones con ruido no se ha medido.
- La salida en alemán suizo es alemán estándar, no una transcripción dialectal; no sirve para preservar la forma dialectal original.
- El italiano recibió poco peso de entrenamiento y es más débil que en los modelos base en habla parlamentaria (17,2 frente a 15,6 errores).
- Es necesario un decodificador que limite el número de tokens por frame de audio (valor habitual 10; lo hacen NeMo, parakeet.js, onnx-asr y FluidAudio). Sin ese límite, el modelo puede repetir una palabra muchas veces en clips raros; el `generate()` de Transformers en la versión 5.23 no aplicaba ese límite para modelos TDT.
- Los modelos Core ML solo se comprobaron en un Mac, no dentro del paquete Swift FluidAudio ni en un iPhone.
- El romanche quedó fuera del alcance de la evaluación.
- Licencia CC BY 4.0: permite uso comercial con atribución; hay que citar el modelo base de NVIDIA, el punto de partida de Moondream y los datos de entrenamiento (SPC_R de FHNW y VoxPopuli de Meta).
- Riesgo de alucinación y sesgos: no se documentan análisis específicos; al ser un modelo ASR, el riesgo principal es la sustitución de palabras en audio ambiguo o con ruido, no la generación libre de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thuul/swiss-parakeet-ultra
- Modelo base de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Punto de partida (Moondream): https://huggingface.co/moondream/parakeet-ultra
- Dataset SPC_R (FHNW): https://huggingface.co/datasets/i4ds/spc_r
- Dataset VoxPopuli (Meta): no disponible en la información proporcionada
