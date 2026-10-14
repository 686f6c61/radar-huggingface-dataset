# startlux-models/ReaDy-Qwen3.8-27B

## Resumen

ReaDy-Qwen3.8-27B es un modelo borrador (draft) para decodificación especulativa publicado por startlux-models dentro del proyecto ReaDy de StartLuxLabs. No es un modelo conversacional autónomo: se trata de los pesos completos del borrador más un lector de estados recurrentes de rango 8 que se acopla a un decodificador especulativo de tipo DSpark. Su función es proponer bloques de tokens que el modelo objetivo, Qwen3.8-27B, verifica después, reduciendo el coste por token generado en inferencia.

La innovación que describe la model card es el uso de los estados recurrentes ya comprometidos del modelo objetivo como contexto dinámico para el borrador. ReaDy lee posiciones concretas de esas capas recurrentes (capas 30 y 62, indexadas desde cero), proyecta la información mediante un cuello de botella de 128 dimensiones y la inyecta como actualización residual en la representación del borrador, en la capa 4 y después de la normalización de atención.

A pesar de la cifra "27B" del nombre, que hace referencia al modelo objetivo, los pesos de este repositorio suman 1.857.358.337 parámetros (aproximadamente 1,86 mil millones) y ocupan 3,7 GB en el repositorio. El bloque de borrador propone 7 tokens por paso y tiene un tamaño oculto de 5.120. El checkpoint requiere el modelo objetivo, su tokenizador y una integración fijada de SGLang; no se carga con `AutoModel.from_pretrained` ni con transformers estándar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo borrador para decodificación especulativa: backbone transformer con cabezas de predicción (bloque de 7 tokens, tamaño oculto 5.120) más lector ReaDy de estados recurrentes (rango 8, cuello de botella 128) sobre un drafter DSpark |
| Parametros totales | 1.857.358.337 (aproximadamente 1,86 mil millones) |
| Longitud de contexto | 16.384 tokens (límite validado en el modo de servicio documentado) |
| Tipos de cuantizacion | no disponible (la validación documentada usa BF16 para objetivo, borrador y KV, y FP32 para el estado recurrente) |
| Idiomas soportados | no disponible |
| Licencia | no disponible; el repositorio no concede derechos adicionales sobre los pesos de terceros, que conservan sus licencias de origen |
| Formato de pesos | safetensors (`model.safetensors` con el backbone y las cabezas, `reader/reader.safetensors` con el lector, más `config.json`, `reader/reader_config.json` y `SHA256.json`) |

## Arquitectura y entrenamiento

El modelo es un borrador de decodificación especulativa que combina un backbone con cabezas de predicción y un lector de estados recurrentes. El lector toma el estado del modelo objetivo en las capas recurrentes 30 y 62 (indexadas desde cero), con una forma de `[2, 48, 128, 128]` por petición y el valor antes de la clave. La proyección usa rango 8 tanto para la salida del mapa de valores como para la factorización de la consulta, mientras que el estado objetivo se mantiene en 128 × 128. El resultado se inyecta como actualización residual en la capa 4 del borrador, después de la normalización de atención. El bloque de borrador propone 7 tokens por paso con tamaño oculto de 5.120 y un cuello de botella de lector de 128 dimensiones.

El repositorio incluye el backend del lector en Triton, que activa operaciones fusionadas personalizadas, y un backend de referencia en PyTorch seleccionable con `--reader-backend reference`. El tiempo de ejecución probado es Linux con Python 3.12 y una única NVIDIA B200, con objetivo, borrador y KV en BF16 y estado recurrente en FP32. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. La verificación se delega en SGLang con una revisión de motor fijada, y el lanzador comprueba sumas SHA-256: la del peso del borrador es `746f7d94f77d1d032614d2c0af805bf08cbe22b4a019b7ba84e103d36139c3ac`.

## Capacidades

- Generación de borradores de tokens para decodificación especulativa: propone bloques de 7 tokens que el modelo objetivo Qwen3.8-27B verifica después.
- Lectura de estados recurrentes del modelo objetivo e inyección de contexto dinámico como actualización residual en el borrador.
- Ejecución con kernels fusionados personalizados mediante el backend Triton, con alternativa de referencia en PyTorch para depuración.
- Servicio a través de SGLang con la integración fijada del repositorio de código, mediante `serve.py`.
- Verificación de integridad de pesos con comprobaciones SHA-256 en el lanzador.
- No es un modelo de chat autónomo: no genera respuestas por sí solo ni se documentan capacidades de tool calling, agentes, visión, audio, modo de razonamiento o multilingüismo.
- No se documentan capacidades multilingües ni se declara ningún idioma soportado en la información proporcionada.

## Casos de uso

- Aceleración de un endpoint de Qwen3.8-27B: desplegar el borrador junto al objetivo con SGLang para reducir el número de pasos de decodificación necesarios en generación greedy, con concurrencia 1 y contextos de hasta 16.384 tokens.
- Investigación en decodificación especulativa: estudiar cómo el uso de estados recurrentes comprometidos como contexto dinámico afecta a la tasa de aceptación del borrador, comparándolo con un drafter DSpark sin lector.
- Reproducción de experimentos de kernels: usar el backend de referencia en PyTorch y el backend Triton para comprobar la equivalencia de kernels incluida en `VALIDATION.json`.
- Evaluación de hardware: validar el comportamiento del par objetivo-borrador en GPUs distintas de la B200 probada, dado que la configuración documentada solo cubre una NVIDIA B200.
- Desarrollo de variantes del lector: la configuración publicada (rango 8, inyección en la capa 4, cuello de botella 128, capas objetivo 30 y 62) sirve como punto de partida para entrenar lectores alternativos o ajustar los puntos de inyección.
- Despliegues de baja concurrencia con coste por token sensible: en escenarios con una sola petición simultánea, el coste del borrador es reducido (1,86 mil millones de parámetros, 3,7 GB en BF16) frente al objetivo de 27B.
- Integración en pipelines de CI para verificación de artefactos: el lanzador comprueba sumas SHA-256 de los pesos, lo que permite validar la integridad del checkpoint antes de arrancar el servicio.
- Pruebas de decodificación con EOS natural: el modo validado cubre el criterio de parada natural, útil para comprobar el comportamiento de la decodificación especulativa en respuestas de longitud variable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card únicamente declara comprobaciones de equivalencia de kernels y extremo a extremo entre los backends de referencia y Triton, en la configuración probada. No se proporcionan métricas de tasa de aceptación, speedup, MMLU, HumanEval, GSM8K ni ningún otro benchmark.

## Requisitos de hardware

- Pesos del borrador: 3,7 GB en el repositorio, coherentes con 1,86 mil millones de parámetros en BF16.
- Modelo objetivo: se requiere Qwen3.8-27B por separado; en BF16 sus pesos rondarían los 54 GB, además de la caché KV (estimación derivada del número de parámetros, no un dato declarado por el autor).
- Estado recurrente: FP32 con forma `[2, 48, 128, 128]` por petición, aproximadamente 6 MiB por petición (cálculo derivado de la forma declarada).
- GPU validada: una única NVIDIA B200. No se documentan pruebas en A100, H100, RTX 4090 ni otras GPU.
- GPU de consumo: el borrador por sí solo cabe en GPU de consumo, pero el sistema completo no funciona sin el objetivo de 27B, que en BF16 no cabe en GPU de consumo típicas. No se documenta ninguna cuantización del objetivo que permita reducirlo.
- Opciones de despliegue: `serve.py` del repositorio de código con SGLang en una revisión fijada, backend de lector Triton (por defecto) o de referencia en PyTorch, y cubins de FlashInfer 0.6.17 mediante `--flashinfer-cubins`. Se recomienda reservar la GPU al proceso.
- No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni formato GGUF.
- Latencia y throughput: no disponible. El único modo de servicio validado es decodificación greedy, concurrencia 1, límite de contexto 16.384 y EOS natural.

## Comparativa con modelos similares

No se dispone de datos verificables de comparación en la información proporcionada. La categoría comparable son los borradores de decodificación especulativa, como las cabezas de tipo EAGLE-3, Medusa o la autosugerencia con n-gramas, pero no se han facilitado cifras de ninguno de ellos ni del propio ReaDy-Qwen3.8-27B.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ReaDy-Qwen3.8-27B | Borrador especulativo con lector de estados recurrentes | 1.857.358.337 | 16.384 (validado) | no disponible | HuggingFace, requiere repositorio de código y objetivo Qwen3.8-27B |
| Cabezas tipo EAGLE-3 | Borrador especulativo | no disponible | no disponible | no disponible | no disponible |
| Cabezas tipo Medusa | Borrador especulativo con cabezas múltiples | no disponible | no disponible | no disponible | no disponible |
| Autosugerencia con n-gramas | Borrador sin modelo auxiliar | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo autónomo: son pesos de borrador. Requiere el modelo objetivo Qwen3.8-27B, su tokenizador y la integración de SGLang fijada en el repositorio de código.
- No se puede cargar con `AutoModel.from_pretrained` ni con transformers estándar; no hay código remoto de Hugging Face implicado.
- Modo de servicio validado muy restringido: decodificación greedy, concurrencia 1, límite de contexto 16.384 y EOS natural. El batching, otras modalidades de decodificación y otros modos de servicio requieren validación independiente.
- Hardware validado limitado a una única NVIDIA B200 con Linux y Python 3.12; el comportamiento en otras GPU no está comprobado.
- Dependencia de versiones concretas: revisión de motor SGLang fijada y cubins de FlashInfer 0.6.17. Las desviaciones de esas versiones no están cubiertas por las comprobaciones registradas.
- Licencia no declarada. El repositorio no concede derechos adicionales sobre los pesos del objetivo ni del borrador base, que mantienen sus requisitos de licencia de origen. No se puede asumir uso comercial sin verificar esas licencias.
- Idiomas soportados no documentados, por lo que no se puede garantizar cobertura multilingüe.
- Riesgo de alucinación: aunque la verificación recae en el modelo objetivo, la calidad final depende de Qwen3.8-27B y de la tasa de aceptación del borrador, no del borrador por sí solo.
- Tracción nula en el momento de la consulta: cero descargas y cero "likes", sin validación independiente por parte de la comunidad.
- Los metadatos indican fechas de creación y actualización en 2026, con una única revisión publicada y sin historial de mantenimiento.
- No se documentan sesgos conocidos, ni datos de entrenamiento, ni proceso de alineación (RLHF, DPO u otros) en la información disponible.
- La verificación del servicio exige seleccionar una GPU reservada al proceso y pasar la ruta correcta a los cubins; una configuración incorrecta impide arrancar el motor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/startlux-models/ReaDy-Qwen3.8-27B
- Repositorio de código y quickstart: https://github.com/StartLuxLabs/ReaDy
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3.8-27B
