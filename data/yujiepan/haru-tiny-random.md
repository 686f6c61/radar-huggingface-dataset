# yujiepan/haru-tiny-random

## Resumen

`yujiepan/haru-tiny-random` es un checkpoint de depuracion publicado por el usuario yujiepan, derivado del modelo `higurashi-ai/Haru-4B`. No es un modelo entrenado para uso real: se trata de una version de juguete con pesos inicializados aleatoriamente, pensada para validar el codigo de inferencia, la estructura del grafo y el pipeline de audio full-duplex del proyecto Haru sin necesidad de cargar los 5,27 mil millones de parametros del modelo original. El repositorio contiene un unico fichero `model.safetensors` de 16,74 MB.

El modelo conserva la arquitectura del original pero con dimensiones drasticamente reducidas: el backbone de lenguaje Qwen3.5 se recorta a 8 capas (frente a 32), con anchura oculta de 32 y anchura MLP de 64 (frente a 2.560 y 9.216). El codec VibeVoice se reduce a base 1 y profundidad 1, y la cabeza MeanFlow a una sola capa. El vocabulario, en cambio, se mantiene intacto en 248.320 entradas con embeddings atados, lo que permite probar rutas de tokenizacion reales.

Su relevancia es exclusivamente practica para desarrolladores del ecosistema Haru: permite ejecutar el bucle de sesion duplex, verificar formas de tensor, comprobar la alternancia entre atencion lineal y atencion completa, y validar la integracion del codec y la cabeza de sintesis en CPU y CUDA sin requerir hardware de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con backbone Qwen3.5 (atencion lineal + atencion completa en cadencia 3:1), codec VibeVoice y cabeza MeanFlow |
| Parametros totales | 8.355.227 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo replica la topologia de Haru-4B con un backbone de lenguaje tipo Qwen3.5 reducido a 8 capas, manteniendo la cadencia de atencion de 3 capas lineales por cada capa de atencion completa, lo que en este checkpoint equivale a dos ciclos completos. La configuracion de atencion usa 4 cabezas de consulta, 1 cabeza de clave/valor y dimension de cabeza 16, con embeddings atados y un vocabulario de 248.320 entradas identico al del modelo base. El componente de audio emplea un codec VibeVoice con base 1 y profundidad 1, que produce latentes de audio de 64 dimensiones a 7,5 Hz, y una cabeza MeanFlow de una sola capa con un paso de inferencia.

No hay entrenamiento: los pesos se inicializan de forma aleatoria. La model card indica explicitamente que el proposito es testing y debugging, y que el repositorio se genera de forma automatica. No se dispone de informacion sobre datos de entrenamiento, tokens procesados, etapas de RLHF o DPO, ni innovaciones de decodificacion mas alla de la arquitectura duplex heredada del modelo base.

## Capacidades

- Generacion de audio full-duplex: el modelo implementa una sesion duplex con turnos de habla y escucha, con frames de 133 ms y 3.200 muestras de audio por frame a 24 kHz.
- Generacion de texto acoplada a audio: cada frame incluye un token de texto (rango 0-248.319) y un fragmento de audio float32 en el rango [-1, 1].
- Atencion hibrida: combina capas de atencion lineal con capas de atencion completa, lo que permite probar el comportamiento de memoria y latencia en secuencias largas.
- Codec de audio integrado: codificacion y decodificacion de latentes de 64 dimensiones a 7,5 Hz mediante VibeVoice.
- Cabeza de sintesis MeanFlow: generacion de audio en un unico paso de inferencia.
- Ejecucion parcial en CPU: segun la model card, solo las capas de atencion lineal del modelo de lenguaje requieren CUDA; el codec y la cabeza pueden ejecutarse en CPU.
- No se ha verificado capacidad de tool calling, razonamiento, codigo, matematicas, vision ni soporte multilingue en este checkpoint.

## Casos de uso

- Pruebas de integracion del pipeline Haru: permite ejecutar el bucle `DuplexSession` completo (inicio, pasos y cierre) con seis frames de 133 ms y verificar que las formas de tensor, los tipos y los rangos de audio son correctos antes de pasar al modelo de 4B.
- Validacion de CI/CD: al pesar solo 16,74 MB, se puede incluir en suites de tests automatizados que comprueben la compatibilidad de versiones de la libreria `haru` sin depender de descargas de 10,54 GB.
- Depuracion de la alternancia de atencion: con dos ciclos completos de 3 capas lineales y 1 completa, sirve para verificar que el enmascaramiento y la cadencia de atencion se implementan correctamente en el backbone.
- Pruebas de tokenizacion: al conservar el vocabulario de 248.320 entradas y los embeddings atados, permite validar rutas de tokenizacion y los identificadores especiales (por ejemplo, 248.076 y 248.071) sin cargar el modelo grande.
- Desarrollo en equipos sin GPU de gama alta: la ejecucion parcial en CPU del codec y la cabeza MeanFlow facilita el desarrollo en portatiles y entornos sin acelerador.
- Verificacion de reproducibilidad: la semilla fija (`seed=7`) y la configuracion determinista del ejemplo permiten comprobar que dos ejecuciones producen los mismos frames y tokens.
- Pruebas de regresion tras actualizaciones de la libreria: cualquier cambio en `HaruModel`, `DuplexConfig` o `DuplexSession` puede contrastarse contra este checkpoint como referencia estable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un modelo con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K, WER, MOS) carece de sentido y no se reporta.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en BF16, dado que el checkpoint completo ocupa 16,74 MB y el vocabulario de 248.320 entradas con embeddings atados de dimension 32 es el componente dominante.
- GPU recomendadas: cualquier GPU con soporte CUDA para las capas de atencion lineal; el ejemplo de la model card funciona tambien en CPU para el codec y la cabeza MeanFlow.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU para la mayor parte del grafo.
- Opciones de despliegue: la libreria oficial `haru` (instalable desde `git+https://github.com/higurashi-ai/Haru#subdirectory=haru`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El ejemplo ejecuta seis frames de 133 ms, pero no se reportan tiempos de pared ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yujiepan/haru-tiny-random | 8,36 M | no disponible | Testing y debugging | no disponible | Hugging Face |
| higurashi-ai/Haru-4B | 5,27 B (BF16) | no disponible | Audio full-duplex en produccion | no disponible | Hugging Face |
| Modelos de audio-to-audio de proposito general | no disponible | no disponible | Sintesis y conversion de voz | variable | no disponible |

La unica comparacion significativa es con su modelo base, Haru-4B, que multiplica por aproximadamente 630 el numero de parametros y por 630 el tamano en disco (10,54 GB frente a 16,74 MB). No se dispone de datos para comparar con alternativas de la misma categoria funcional.

## Limitaciones y advertencias

- Pesos inicializados aleatoriamente: el modelo no produce audio ni texto coherentes; su salida es ruido estadistico y no debe interpretarse como respuesta valida.
- No apto para produccion: la model card lo describe explicitamente como modelo de testing y debugging.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribucion; hay que contactar con el autor o consultar el modelo base antes de cualquier uso fuera de pruebas.
- Idiomas no disponibles: no se documenta soporte linguistico alguno.
- Contexto no disponible: se desconoce la longitud maxima de secuencia soportada por este checkpoint.
- Generado automaticamente: la model card indica que el repositorio se genera con una herramienta automatica, lo que reduce la garantia de mantenimiento y soporte.
- Dependencia de la libreria `haru`: la API de ejemplo (`DuplexSession`, `HaruModel`, `DuplexConfig`) puede cambiar sin aviso y romper la compatibilidad.
- Riesgo de confusion con el modelo base: el nombre incluye "haru" pero las dimensiones y el comportamiento no se corresponden con Haru-4B; conviene no mezclarlos en pipelines de evaluacion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/yujiepan/haru-tiny-random
- Modelo base: https://huggingface.co/higurashi-ai/Haru-4B
- Repositorio de codigo Haru: https://github.com/higurashi-ai/Haru
- Script de creacion del modelo: `.meta/create_model.py` (dentro del repositorio)
- Estructura del modelo: `.meta/model.log` (dentro del repositorio)
- Entorno de creacion: `.meta/env.json` (dentro del repositorio)
