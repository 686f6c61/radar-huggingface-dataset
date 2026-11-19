# SourceHat-Labs/SenseNova-Loop-9B-EXL3-3.0bpw

## Resumen

SenseNova-Loop-9B-EXL3-3.0bpw es una cuantizacion EXL3 (ExLlamaV3) a 3,0 bits por peso del modelo multimodal SenseNova-Loop-9B, desarrollado originalmente por SenseTime. La publica el usuario SourceHat-Labs como un checkpoint listo para servir con el runtime exllamav3, orientado a despliegues con memoria de GPU ajustada. El modelo base resuelve tareas de imagen-a-texto y conversacion multimodal, y esta cuantizacion busca reducir el espacio en VRAM manteniendo una cabeza de salida en BF16 y una codificacion posicional nativa de 524.288 tokens.

La relevancia de esta ficha esta en que el checkpoint no es una cuantizacion generica: conserva tensores criticos en mayor precision (144 tensores recurrentes y de router en FP32, embedding de entrada, lineales de vision y lineales nativas de draft en 8 bits) y documenta las asignaciones exactas en ficheros CSV y en `quantization_config.json`. Ademas incluye los pesos de decodificacion especulativa nativos del modelo original, aunque el autor advierte que la paridad especulativa exacta y un despliegue fisico en 16 GiB son comprobaciones pendientes.

El checkpoint ocupa 6,4 GB en el repositorio y declara 3.697.758.848 parametros reales en safetensors, una cifra inferior al "9B" nominal del nombre, probablemente por el recuento efectivo de tensores cuantizados. La licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SenseNova Loop (arquitectura propia con decodificacion especulativa nativa; port en exllamav3) |
| Parametros totales | 3.697.758.848 (segun safetensors); nombre comercial 9B |
| Parametros activos | no disponible |
| Longitud de contexto | 524.288 tokens de codificacion posicional nativa; el perfil de serving limita la longitud maxima por peticion segun la cache compartida (262.144 tokens Q8 en las pruebas) |
| Tipos de cuantizacion | EXL3 a 3,0 bpw; cabeza de salida BF16; 144 tensores recurrentes y de router FP32; embedding de entrada, lineales de vision y lineales de draft en 8 bits |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (EXL3), requiere runtime exllamav3 con port de la arquitectura SenseNova Loop |

## Arquitectura y entrenamiento

El modelo base SenseNova-Loop-9B emplea una arquitectura propia denominada SenseNova Loop, que integra pesos de decodificacion especulativa nativos junto al modelo objetivo. Esta cuantizacion no reentrena ni modifica el comportamiento del modelo original: parte de los pesos de SenseTime en el commit `fa381f7c466739475e172a7d3234e77351e4f613` y aplica cuantizacion EXL3 a 3,0 bits por peso, preservando en mayor precision los componentes mas sensibles. En concreto, mantiene una cabeza de salida BF16, la codificacion posicional nativa de 524.288 tokens, 144 tensores recurrentes y de router en FP32, y el embedding de entrada, las lineales de vision y las lineales de draft nativas en 8 bits.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las tecnicas de alineacion (RLHF, DPO) del modelo base en la informacion proporcionada. La innovacion tecnica destacable de esta publicacion es la preservacion selectiva de precision y la inclusion de pesos especulativos nativos, junto con la documentacion de asignaciones exactas en `PRECISION-ALLOCATION.csv`, `TENSOR-INVENTORY.csv` y `quantization_config.json`. El autor verifico la release con dos cargas independientes en GPU, fixtures de texto y vision, y cuatro flujos target-only con una cache Q8 compartida de 262.144 tokens.

## Capacidades

- Generacion de texto y conversacion multimodal: pipeline declarado `image-text-to-text`, con soporte de entradas de imagen y texto.
- Razonamiento y conversacion multi-turno: tag `conversational`.
- Procesamiento de vision: lineales de vision conservadas en 8 bits, con fixtures de vision verificados por el autor.
- Decodificacion especulativa: incluye los pesos nativos de draft, aunque la paridad especulativa exacta esta pendiente de verificacion.
- Contexto largo: codificacion posicional nativa de 524.288 tokens, sujeta al limite de la cache compartida en el perfil de serving.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (thinking mode, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia conversacional multimodal en produccion con VRAM limitada: el checkpoint a 3,0 bpw y 6,4 GB de repositorio permite servir un modelo de vision-lenguaje en GPUs de menor capacidad, usando el modo target-only verificado por el autor.
- Analisis de documentos con imagenes y texto largo: la codificacion posicional nativa de 524.288 tokens y la cache Q8 compartida de 262.144 tokens permiten procesar conversaciones o documentos extensos con contenido visual intercalado.
- Despliegue en entornos con CUDA y PyTorch controlados: el runtime exllamav3 incluido en `runtime/exllamav3-sensenova-source.tar.gz` se compila para el entorno concreto, lo que encaja en infraestructuras con versiones fijadas de CUDA y PyTorch.
- Prototipado e investigacion sobre cuantizacion EXL3: los ficheros `PRECISION-ALLOCATION.csv`, `TENSOR-INVENTORY.csv` y `quantization_config.json` permiten auditar la asignacion de precision por tensor y reproducir el proceso.
- Evaluacion de decodificacion especulativa: el checkpoint incluye los pesos nativos de draft, util para experimentar con aceleracion especulativa una vez validada la paridad.
- Servicio de imagen-a-texto en modo target-only: el autor verifico cuatro flujos target-only con picos muestreados de 14,71 y 15,30 GiB en dos formas de prueba, lo que sirve como referencia para dimensionar GPUs.
- Integracion en pipelines de inferencia con ExLlamaV3: el perfil de serving de referencia (`runtime/REFERENCE-PROFILE.json`) documenta los ajustes probados, lo que facilita replicar la configuracion en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos datos de rendimiento aportados son los picos de memoria muestreados por el autor en modo target-only: 14,71 GiB y 15,30 GiB en dos formas de prueba, con una cache Q8 compartida de 262.144 tokens.

## Requisitos de hardware

- VRAM estimada: picos muestreados de 14,71 y 15,30 GiB en modo target-only con cache Q8 compartida de 262.144 tokens; el autor advierte que un despliegue fisico en 16 GiB es una comprobacion pendiente.
- GPU recomendadas: no disponible en la informacion proporcionada; por los picos de memoria, se requiere una GPU con al menos 16 GiB para el modo target-only verificado.
- Cabe en consumer GPU: no confirmado; el autor indica que el despliegue fisico en 16 GiB esta sin terminar, por lo que no se puede garantizar en GPUs consumer de 16 GiB.
- Opciones de despliegue: runtime exllamav3 con el port de SenseNova Loop incluido en `runtime/exllamav3-sensenova-source.tar.gz`, compilado para el entorno CUDA/PyTorch del usuario. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-EXL3-3.0bpw | 3.697.758.848 (safetensors) | 524.288 tokens nativos | EXL3 3,0 bpw | apache-2.0 | Hugging Face, runtime exllamav3 |
| sensenova/SenseNova-Loop-9B (base) | no disponible | 524.288 tokens nativos | BF16 original | no disponible en la informacion | Hugging Face |
| Otras cuantizaciones de SenseNova-Loop-9B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- La paridad exacta de la decodificacion especulativa esta pendiente de verificacion; el autor recomienda usar el modo target-only como configuracion verificada.
- El despliegue fisico en 16 GiB no esta confirmado; los picos de memoria muestreados (14,71 y 15,30 GiB) dejan poco margen y no garantizan su funcionamiento en GPUs de 16 GiB.
- La cuantizacion a 3,0 bpw puede degradar la calidad respecto al modelo base en BF16; no se aportan metricas de evaluacion que cuantifiquen esa perdida.
- El checkpoint requiere compilar el runtime exllamav3 para el entorno CUDA/PyTorch concreto, lo que anade complejidad de despliegue y dependencia de versiones.
- La longitud maxima por peticion en el perfil de serving esta limitada por la cache compartida (262.144 tokens Q8 en las pruebas), aunque la codificacion posicional nativa sea de 524.288 tokens.
- No se dispone de informacion sobre sesgos conocidos, riesgo de alucinacion, idiomas soportados ni limitaciones de contexto del modelo base.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base y del runtime exllamav3 por separado.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/SourceHat-Labs/SenseNova-Loop-9B-EXL3-3.0bpw
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Runtime incluido en el repositorio: `runtime/exllamav3-sensenova-source.tar.gz`
- Perfil de serving de referencia: `runtime/REFERENCE-PROFILE.json`
- Asignacion de precision: `PRECISION-ALLOCATION.csv`
- Inventario de tensores: `TENSOR-INVENTORY.csv`
- Configuracion de cuantizacion: `quantization_config.json`
