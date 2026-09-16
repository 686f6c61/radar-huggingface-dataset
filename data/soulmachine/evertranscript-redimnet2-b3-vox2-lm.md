# soulmachine/evertranscript-redimnet2-b3-vox2-lm

## Resumen

ReDimNet2-B3 (vox2, large-margin) ONNX es un export del modelo de embeddings de hablante ReDimNet2-B3 de Palabra.ai, publicado por el desarrollador independiente soulmachine bajo el identificador `soulmachine/evertranscript-redimnet2-b3-vox2-lm`. No es un modelo de lenguaje: recibe audio en crudo (waveform mono a 16 kHz, cualquier duración) y devuelve un vector de 192 dimensiones en float32 que representa la identidad vocal del hablante. El frontend de mel va dentro del grafo, de modo que quien lo llama no necesita implementar extracción de características.

El problema que resuelve es el despliegue: el proyecto original solo publica checkpoints de PyTorch, y este artefacto es una conversión de formato sin reentrenamiento, sin ajuste fino y sin cuantización. Se creó para EverTranscript, un cuaderno de reuniones que funciona en local, donde el embedding sirve tanto para agrupar hablantes dentro de una reunión (diarización) como para reconocer voces entre reuniones distintas mediante similitud de coseno.

Su relevancia práctica está en dos factores concretos: el fichero pesa 18.045.013 bytes, lo que permite ejecutarlo en CPU con los kernels estándar de ONNX Runtime, y el autor verifica numéricamente que la salida coincide con la de PyTorch (coseno 1.000000), de modo que los 0,42 / 0,66 / 1,22 % de EER en VoxCeleb1-O / E / H reportados por los autores originales se mantienen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ReDimNet2-B3, red de embeddings de hablante con frontend convolucional (sin operador STFT en el grafo) |
| Parámetros totales | No disponible en la model card; el fichero ONNX ocupa 18.045.013 bytes en fp32, compatible con un orden de magnitud de 4,5 millones de parámetros |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: entrada de audio monofónica a 16 kHz con eje de muestras dinámico (cualquier duración); la salida es un embedding fijo de 192 dimensiones |
| Tipos de cuantización | Ninguno; el autor indica explícitamente que no se aplicó cuantización (pesos en fp32) |
| Idiomas soportados | No disponible (modelo de audio; no declara idiomas) |
| Licencia | MIT, Copyright (c) 2026 Palabra.ai; este export conserva los mismos términos |
| Formato de pesos | ONNX, opset 18, exportado con la versión 2.8.0 |
| Entrada | `waveform` float32 `[batch, samples]`, ambos ejes dinámicos, 16 kHz mono |
| Salida | `embedding` float32 `[batch, 192]` |
| Modelo base | `PalabraAI/redimnet2` v1.0.0, checkpoint `b3-vox2-lm.pt` (VoxCeleb2, ajuste fino large-margin) |
| Librería | onnx / onnxruntime |
| Pipeline declarado | feature-extraction |
| Tamaño del fichero | 18.045.013 bytes (aproximadamente 17,2 MiB) |
| SHA-256 | `dcecdce7d52bbd4739b24d0874359ec564d43f4b3a392f0104f505593b566d41` |
| Fecha de publicación | 15 de septiembre de 2026 (según metadatos de HuggingFace) |
| Descargas y likes | 0 descargas, 0 likes en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura es ReDimNet2-B3, un extractor de embeddings de hablante cuyo frontend trabaja con capas convolucionales en lugar de una STFT explícita. Esta decisión de diseño tiene una consecuencia práctica relevante: el grafo ONNX no contiene ningún operador `STFT`, por lo que carga en cualquier build de ONNX Runtime que disponga de los kernels estándar de CPU, sin dependencias de aceleración específicas. Tanto el eje de lote como el de muestras son dinámicos, así que se pueden procesar audios de distinta duración en lotes y obtener un embedding por elemento.

El entrenamiento corresponde íntegramente a los autores originales de Palabra.ai: el checkpoint `b3-vox2-lm.pt` está ajustado con margen amplio (large-margin) sobre VoxCeleb2. Este repositorio no aporta datos de entrenamiento propios, ni reentrenamiento, ni ajuste fino, ni cuantización; es una conversión de formato que el autor documenta como tal. El proceso de exportación se reproduce con `export-redimnet2.py` y emplea la ruta TorchScript porque el exportador dynamo falla con la normalización del frontend bajo torch 2.8. La verificación compara la salida del grafo con la referencia de PyTorch sobre una waveform fija, con coseno 1.000000 tanto para entradas de 3 s como de 6 s, y el mismo fichero se probó además con el crate Rust `ort` (ONNX Runtime 2.0.0-rc.13) en macOS arm64 y Windows x86_64, coincidiendo entre plataformas hasta seis decimales.

## Capacidades

- Extracción de embeddings de hablante: convierte audio de cualquier duración en un vector de 192 dimensiones, sin que el llamante tenga que calcular características de mel.
- Verificación de hablante: la comparación de dos embeddings con similitud de coseno permite decidir si dos fragmentos corresponden a la misma persona.
- Diarización dentro de una reunión: los embeddings se pueden agrupar (clustering) para segmentar quién habla en cada momento.
- Reconocimiento de voz entre reuniones: la misma señal permite asociar voces ya vistas en sesiones anteriores a un perfil de hablante persistente, que es el uso principal en EverTranscript.
- Procesamiento por lotes: el eje de lote es dinámico, de modo que se pueden calcular varios embeddings en una sola ejecución.
- Inferencia en CPU y en dispositivo: al no requerir STFT ni kernels especiales, funciona con `CPUExecutionProvider` en macOS arm64 y Windows x86_64, y no depende de GPU.
- Integridad verificable: se publica el SHA-256 del artefacto, lo que permite fijarlo por checksum en compilaciones e integración continua.
- Sin soporte de: generación de texto, razonamiento, código, matemáticas, visión, tool calling o function calling, agentes, razonamiento multi-paso y capacidades multilingües de texto. No es un modelo conversacional ni un modelo de lenguaje.

## Casos de uso

- Diarización de reuniones en local: se calcula un embedding por ventana de audio y se agrupan los vectores para etiquetar los turnos de palabra en la transcripción. Es el caso para el que se creó el artefacto en EverTranscript y encaja porque el modelo corre en CPU sin dependencias externas.
- Reconocimiento de voz entre reuniones: guardando el embedding de cada participante, el sistema puede reconocer a la misma persona en sesiones posteriores comparando con similitud de coseno, sin necesidad de reentrenar nada.
- Etiquetado de "quién dijo qué" en transcripciones ASR: el embedding identifica los cambios de hablante y permite asignar cada segmento de texto a una voz concreta, mejorando la legibilidad de actas y notas de reunión.
- Verificación biométrica de voz en aplicaciones de control de acceso: comparar el embedding de una frase pronunciada contra el perfil almacenado del usuario ofrece una segunda factor de autenticación; los 0,42 % de EER en VoxCeleb1-O dan una referencia del rendimiento esperable en condiciones limpias.
- Indexado y búsqueda por voz en archivos de audio: podcasts, entrevistas o grabaciones de archivo se pueden vectorizar una sola vez y buscar por similitud de hablante, lo que permite "encontrar todos los fragmentos de esta persona" sin transcripción previa.
- Segmentación previa a un sistema ASR: detectar los límites de hablante antes de transcribir reduce errores de atribución en pipelines que no disponen de diarización propia, y el coste es bajo porque el modelo pesa alrededor de 17 MiB.
- Despliegue en dispositivos de borde o sin conexión: al ejecutarse con ONNX Runtime en CPU, es viable integrarlo en aplicaciones de escritorio, kioscos o hardware embebido donde no hay GPU ni conectividad.
- Fijación del artefacto en CI: publicar un fichero con checksum conocido evita que cada instalación tenga que ejecutar una exportación de PyTorch, lo que simplifica las compilaciones reproducibles de aplicaciones que dependen del modelo.

## Benchmarks y rendimiento

Los datos de precisión provienen de los autores del modelo original y corresponden a la arquitectura PyTorch; el autor del export indica que este coincide numéricamente con ella, por lo que los valores son aplicables.

| Benchmark | Métrica | Resultado |
|---|---|---|
| VoxCeleb1-O | EER | 0,42 % |
| VoxCeleb1-E | EER | 0,66 % |
| VoxCeleb1-H | EER | 1,22 % |

Verificación de fidelidad del export frente a la referencia de PyTorch:

| Comprobación | Resultado |
|---|---|
| Similitud de coseno con PyTorch, entrada de 3 s | 1.000000 |
| Similitud de coseno con PyTorch, entrada de 6 s | 1.000000 |
| Similitud de coseno con Rust `ort`, macOS arm64 | 1.000000 |
| Similitud de coseno con Rust `ort`, Windows x86_64 | 1.000000 |
| Tamaño del fichero | 18.045.013 bytes |

No se han publicado resultados de latencia, throughput ni comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente nula; el modelo está pensado para `CPUExecutionProvider` y el fichero ocupa 18.045.013 bytes en fp32.
- GPU recomendadas: no aplica. El autor no documenta ejecución en GPU y el grafo se diseñó para cargar con kernels estándar de CPU.
- Compatibilidad con GPU de consumo: no es necesaria ninguna; cualquier equipo con CPU moderna puede ejecutarlo, lo que incluye portátiles y dispositivos de gama baja.
- Opciones de despliegue: ONNX Runtime en Python (`onnxruntime.InferenceSession` con `CPUExecutionProvider`) y el crate Rust `ort` (probado con ONNX Runtime 2.0.0-rc.13 en macOS arm64 y Windows x86_64). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El tamaño del artefacto y la ausencia de operadores STFT sugieren un coste bajo por inferencia, pero no hay cifras publicadas.
- Nota de despliegue: si se reproduce la exportación desde el código original, hay que tener en cuenta que el frontend de PyTorch importa `scipy` sin declararlo en `hubconf.py`, y que el exportador dynamo falla bajo torch 2.8, por lo que se usa la ruta TorchScript.

## Comparativa con modelos similares

La información proporcionada no incluye comparativas con otros modelos de embeddings de hablante, ni resultados de terceros. La única comparación posible con datos verificables es contra el modelo original del que procede este export.

| Modelo | Formato | Dimensión del embedding | EER en VoxCeleb1-O | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este export (`soulmachine/evertranscript-redimnet2-b3-vox2-lm`) | ONNX opset 18 | 192 | 0,42 % | MIT | HuggingFace, 0 descargas |
| ReDimNet2-B3 original (`PalabraAI/redimnet2`) | PyTorch (`.pt`) | 192 | 0,42 % | MIT | GitHub, etiqueta v1.0.0 |
| Otras alternativas de la categoría (por ejemplo ECAPA-TDNN, x-vector/WeSpeaker o TitaNet) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos comparativos de parámetros, contexto o rendimiento frente a esos u otros modelos de la misma categoría en la información consultada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no ejecuta código y no soporta tool calling, agentes ni razonamiento multi-paso. Cualquier ficha o uso que lo trate como tal es incorrecto.
- Los sesgos heredados del corpus de entrenamiento no están documentados en la model card. VoxCeleb2 procede de material audiovisual de dominio público con sobrerrepresentación de ciertos perfiles, acentos, géneros y franjas de edad, lo que puede traducirse en tasas de error desiguales entre poblaciones; el autor no publica análisis de sesgo.
- Riesgo de degradación fuera de dominio: no hay resultados publicados para audio con ruido, reverberación, grabación de campo lejano, códecs de telefonía o canales distintos a los de VoxCeleb. El EER de 0,42 / 0,66 / 1,22 % corresponde a condiciones de evaluación de VoxCeleb1.
- Requisito estricto de entrada: audio mono a 16 kHz. Cualquier otra frecuencia de muestreo debe remuestrearse antes de llamar al modelo, y el número de canales debe reducirse a uno.
- Limitación de idioma no evaluada: al tratarse de un modelo acústico no declara idiomas, pero tampoco hay datos de rendimiento por idioma, de modo que la generalización multilingüe no está garantizada ni medida.
- Sin cuantización disponible: solo se publican pesos fp32 en ONNX. Si se necesita una versión INT8 o FP16 para reducir tamaño, hay que generarla por cuenta propia y volver a verificar la fidelidad frente a la referencia.
- Verificación de integridad recomendable: conviene comprobar el SHA-256 `dcecdce7d52bbd4739b24d0874359ec564d43f4b3a392f0104f505593b566d41` al descargar, ya que el propósito declarado del repositorio es servir como artefacto fijado por checksum.
- Adopción nula verificable: el repositorio registra 0 descargas y 0 likes, por lo que no existe validación independiente por parte de terceros; la evidencia disponible es la del propio autor.
- Licencia permisiva con atribución: MIT permite uso comercial y modificación, pero exige conservar el aviso de copyright de Palabra.ai (2026). El export añade su propia capa de conversión sin cambiar los términos.
- Rareza de dependencias en la reproducción: el script de exportación fija todas las dependencias y descarga el checkpoint original por etiqueta de versión, pero depende de la ruta TorchScript y de `scipy`, lo que puede complicar la reproducibilidad en entornos limpios si no se respetan esas condiciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/soulmachine/evertranscript-redimnet2-b3-vox2-lm
- Modelo base declarado: https://huggingface.co/PalabraAI/redimnet2
- Repositorio original de ReDimNet2 (Palabra.ai): https://github.com/PalabraAI/redimnet2
- Aplicación EverTranscript, para la que se creó el export: https://github.com/EverTranscript/EverTranscript
- Los resultados de la búsqueda web proporcionados no contenían enlaces relevantes para este modelo: solo devolvieron páginas de descarga de fuentes, un hilo de una comunidad de preguntas y una discusión sobre análisis de tráfico de una aplicación móvil, ninguno relacionado con ReDimNet2 ni con embeddings de hablante. No se dispone de paper, blog o demo adicionales.
