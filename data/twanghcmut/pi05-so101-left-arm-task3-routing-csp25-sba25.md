# twanghcmut/pi05-so101-left-arm-task3-routing-csp25-sba25

## Resumen

El modelo `pi05-so101-left-arm-task3-routing-csp25-sba25` es un bundle de robótica publicado por el usuario `twanghcmut` en Hugging Face, derivado del checkpoint base `twanghcmut/pi05-so101-left-arm-task3`. Se trata de una variante de π0.5 (pi05) orientada al control de un brazo robótico SO101, empaquetada junto con un GGUF denso nativo y una capa de enrutamiento CSP (routing CSP) calibrada sobre las demostraciones de entrenamiento del modelo fuente. Incluye además atención temporal SBA, que según el autor no requiere pesos ajustados.

El modelo cuenta con 924.391.424 parámetros en formato safetensors y un repositorio de 10,7 GB. No obstante, el artefacto principal del bundle es un GGUF y un archivo de código fuente C++ (`vla_cpp_source.tar.gz`) que debe compilarse con la opción `VLA_SPM=ON` para ejecutar la inferencia mediante scripts de Python. La licencia es Apache 2.0.

La relevancia de este modelo es acotada: se trata de un artefacto de investigación muy específico, con cero descargas y cero likes en el momento de la consulta, sin resultados de benchmarks publicados y con una advertencia explícita del autor de que no se reclama ninguna tasa de éxito robótica. Está pensado para experimentación con políticas visión-lenguaje-acción (VLA) sobre el brazo SO101, no para uso general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base π0.5, política VLA; detalles internos no especificados) |
| Parámetros totales | 924.391.424 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (el repo incluye un GGUF denso nativo; no se detallan los niveles de cuantización) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, y código fuente C++ empaquetado (`vla_cpp_source.tar.gz`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base π0.5 más allá de que se trata de una política VLA (visión-lenguaje-acción) aplicada al brazo SO101. El bundle añade dos componentes: un GGUF denso nativo y una capa de enrutamiento CSP (routing CSP) calibrada sobre las demostraciones de entrenamiento del checkpoint fuente `twanghcmut/pi05-so101-left-arm-task3` (revisión `78d001395fa89646dfe97c60b18623f2f7f04b4b`). También incorpora atención temporal SBA, que según el autor no necesita pesos ajustados.

No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF/DPO. El autor advierte que los episodios fuente públicos usados para el ajuste son datos de entrenamiento, no una evaluación held-out, y que no se reclama ninguna tasa de éxito robótica.

## Capacidades

- Control de política robótica VLA sobre el brazo SO101 (tarea 3, brazo izquierdo, según la nomenclatura del ID).
- Inferencia en modo denso por defecto mediante `scripts/run_so101_hf.py`.
- Modo con enrutamiento CSP (`--DCSP 25`) y atención temporal SBA (`--temporal_attention 25`), con opción Euler (`--euler 1`).
- Soporte de modo CLI para una única observación grabada.
- Modo servidor persistente necesario para decisiones SBA/routing basadas en la llamada anterior.
- API de reset para invocar en cada límite de episodio.
- No se documentan capacidades de generación de texto, código, matemáticas, tool calling, agentes ni multilingüismo.

## Casos de uso

- Investigación en políticas VLA para el brazo SO101: el bundle permite reproducir la inferencia del checkpoint fuente con el GGUF denso y comparar contra las variantes con enrutamiento CSP y atención temporal SBA.
- Evaluación de aceleración en C++: el código fuente `vla_cpp_source.tar.gz` compilado con `VLA_SPM=ON` sirve para medir el rendimiento del pipeline de inferencia frente a la ejecución estándar.
- Experimentación con enrutamiento CSP: el overlay calibrado sobre demostraciones de entrenamiento permite probar si el enrutamiento mejora la selección de acciones en episodios controlados.
- Pruebas de atención temporal SBA: al no requerir pesos ajustados, se puede activar en el servidor persistente para evaluar su efecto en la coherencia temporal entre llamadas.
- Integración en un bucle de control de robot con servidor persistente: el modo servidor y la API de reset permiten encadenar episodios manteniendo el estado necesario para las decisiones SBA/routing.
- Reproducción de observaciones grabadas: el modo CLI con una única observación grabada sirve para depurar el pipeline antes de desplegarlo en el robot real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se reclama ninguna tasa de éxito robótica y que los episodios usados para el ajuste son datos de entrenamiento, no evaluación held-out.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 924 M de parámetros, una estimación orientativa en FP16 sería de aproximadamente 1,8 GB de pesos, y en cuantizaciones GGUF de 4 bits en torno a 0,5 GB, pero el repo no publica requisitos oficiales y el tamaño del repo (10,7 GB) incluye código fuente y artefactos adicionales.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por el tamaño del modelo sería plausible en GPUs de consumo, pero no hay datos oficiales.
- Opciones de despliegue: compilación del código C++ incluido (`VLA_SPM=ON`) y ejecución mediante `scripts/run_so101_hf.py`; modo CLI y modo servidor persistente. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (políticas VLA para SO101) con datos de parámetros, contexto, rendimiento o licencia que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El autor no reclama ninguna tasa de éxito robótica; no hay evidencia publicada de funcionamiento en el robot real.
- Los episodios fuente usados para calibrar el enrutamiento CSP son datos de entrenamiento, no una evaluación held-out, por lo que puede haber sobreajuste.
- El modo CLI solo admite una única observación grabada; las decisiones SBA/routing requieren el modo servidor persistente.
- Es necesario llamar a la API de reset en cada límite de episodio para evitar arrastrar estado entre episodios.
- No se documentan idiomas soportados, sesgos conocidos ni riesgos de alucinación (no es un modelo generativo de texto en el sentido habitual).
- La licencia Apache 2.0 permite uso comercial, pero el modelo está altamente especializado y sin validación externa.
- El despliegue requiere compilar código C++ propio, lo que añade complejidad y dependencias no documentadas en detalle en la información disponible.
- Modelo con cero descargas y cero likes: sin validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/twanghcmut/pi05-so101-left-arm-task3-routing-csp25-sba25
- Modelo base: https://huggingface.co/twanghcmut/pi05-so101-left-arm-task3
- Código fuente del bundle: https://huggingface.co/twanghcmut/pi05-so101-left-arm-task3-routing-csp25-sba25/resolve/main/vla_cpp_source.tar.gz
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información disponible.
