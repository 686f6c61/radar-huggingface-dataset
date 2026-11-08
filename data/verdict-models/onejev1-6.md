# verdict-models/OneJev1.6

## Resumen

OneJev 1.6 (Verdict-ready) es un paquete de distribucion de la familia OneJev 1.6 de OmniJev, un conjunto de modelos de decision "System One" multimodales que aceptan entradas de texto, imagen y video. El repositorio, publicado por la organizacion verdict-models, no contiene pesos: es un indice de variantes (`0.8b`, `4b`, `9b`, `27b`) con manifiestos que declaran de que repositorio oficial de OmniJev debe descargarse cada checkpoint. Su proposito es servir estos modelos de forma eficiente mediante Verdict, un motor de inferencia especializado en modelos de decision System One.

La relevancia de esta ficha no esta en el modelo en si, sino en el empaquetado: Verdict ofrece endpoints nativos de decision (`/v1/systemone`, `/v1/decisions`, `/v1/choice`, `/v1/score`, `/v1/noul`) ademas de una capa compatible con OpenAI (`/v1/chat/completions`, `/v1/models`), y el autor publica comparativas de rendimiento y fidelidad frente al servidor de referencia del autor del modelo (`qev` 0.1.4). La licencia declarada es Apache 2.0.

El modelo se distribuye en cuatro tamanos que cubren desde despliegues en una sola GPU de consumo hasta inferencia en A100. La informacion disponible no detalla la arquitectura interna de los checkpoints de OmniJev, por lo que los apartados de arquitectura, entrenamiento y benchmarks de calidad quedan marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de decision System One multimodal; arquitectura interna no declarada) |
| Parametros totales | cuatro variantes: 0.8B, 4B, 9B y 27B (segun denominacion de las variantes) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; los checkpoints se sirven en bf16 (precision propia del modelo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no especificado; el repositorio solo contiene `variants.json`, `<variant>/model.json` y `SHA256SUMS`; los pesos se descargan del repositorio oficial de OmniJev |
| Modalidades de entrada | texto, imagen y video |
| Pipeline declarado | text-classification |
| Motor de serving | Verdict (imagen Docker `sgyaqing/verdict:latest-cuda`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna de los checkpoints OneJev 1.6: la model card del paquete Verdict no describe si se trata de un transformer denso, un MoE o una arquitectura hibrida, ni detalla el numero de tokens de entrenamiento, la composicion del dataset o si hubo etapas de RLHF o DPO. Lo unico documentado es la interfaz funcional: son modelos de decision "System One" que reciben texto, imagen y video y producen decisiones o puntuaciones a traves de los protocolos `/v1/systemone`, `/v1/decisions`, `/v1/choice`, `/v1/score` y `/v1/noul`.

La innovacion tecnica documentada pertenece al empaquetado, no al modelo. Verdict sirve cada variante en bf16 y verifica la fidelidad frente al estandar dorado (el SDK oficial de OneJev en CPU fp32, con un corpus de 31 casos por nivel) sobre CUDA en RTX 4090 y A100. La desviacion en el peor caso frente a ese estandar es de 2.49e-2 para `0.8b`, 4.95e-2 para `4b`, 3.91e-2 para `9b` y 7.34e-2 para `27b`, frente a 8.55e-1, 9.03e-1, 8.97e-1 y 7.80e-1 respectivamente del servidor `qev` 0.1.4 del autor del modelo. Los checkpoints se descargan en el primer arranque desde el repositorio oficial indicado en el manifiesto de cada variante y se cachean localmente.

## Capacidades

- Procesamiento multimodal de entrada: texto, imagen y video en un mismo modelo de decision.
- Clasificacion y decision: el pipeline declarado es text-classification y expone endpoints nativos de eleccion (`/v1/choice`), puntuacion (`/v1/score`) y decision (`/v1/decisions`, `/v1/systemone`).
- Capa compatible con OpenAI: `/v1/chat/completions` y `/v1/models` para integracion con clientes existentes.
- Seleccion de variante por tamano mediante sintaxis `:variant` (por ejemplo `verdict-models/OneJev1.6:9b`); el nombre sin variante lista las disponibles en lugar de elegir una por defecto.
- Despliegue reproducible: manifiestos con presupuestos declarados y verificacion de integridad mediante `SHA256SUMS`.
- Soporte de ModelScope como origen alternativo de checkpoints mediante la variable de entorno `VERDICT_USE_MODELSCOPE=1`.
- Tool calling, razonamiento multi-paso, generacion de codigo, matematicas, modo thinking, audio y capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Moderacion y clasificacion de contenido multimodal: el modelo acepta texto, imagen y video, por lo que puede puntuar publicaciones o clips con un unico pipeline en lugar de encadenar un clasificador de texto y otro de vision.
- Enrutado de decisiones en pipelines de agentes: los endpoints `/v1/choice` y `/v1/score` permiten usar el modelo como selector entre acciones o herramientas candidatas, con la variante `0.8b` para latencias bajas (P50 de 8.90 ms a concurrencia 1 en carga de texto sobre RTX 4090).
- Verificacion automatizada de imagenes en produccion: con la variante `4b` sobre una RTX 4090 se miden 51.6 rps a concurrencia 8 en carga de imagen, adecuado para validacion de assets en un CDN o en un pipeline de publicacion.
- Analisis de video a escala: la variante `0.8b` sostiene 109.2 rps a concurrencia 8 en carga de video, util para triaje previo de clips antes de un modelo mayor.
- Servicio de decision de alta concurrencia: la variante `9b` sobre A100-SXM4 esta pensada para cargas sostenidas donde se necesita mas capacidad que `4b` sin llegar a `27b`; el motor reporta rps contando solo respuestas 200 completadas en una ventana de 10 segundos.
- Migracion desde el servidor de referencia del autor: equipos que ya usan `qev` 0.1.4 pueden cambiar a Verdict manteniendo los mismos protocolos de decision y obtener mejor fidelidad frente al estandar dorado en las cuatro variantes.
- Despliegue en infraestructura con GPU de consumo: `0.8b` y `4b` estan medidos en una RTX 4090, lo que permite montar el servicio en estaciones de trabajo sin acceso a A100/H100.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos publicados son de fidelidad y de rendimiento del motor de serving.

Fidelidad frente al estandar dorado (peor desviacion sobre corpus de 31 casos por nivel):

| Variante | Verdict | `qev` 0.1.4 | Resultado |
|---|---:|---:|---|
| `0.8b` | 2.49e-2 | 8.55e-1 | Verdict por delante |
| `4b` | 4.95e-2 | 9.03e-1 | Verdict por delante |
| `9b` | 3.91e-2 | 8.97e-1 | Verdict por delante |
| `27b` | 7.34e-2 | 7.80e-1 | Verdict por delante |

Rendimiento de `0.8b` en RTX 4090 (48 GB), extremo a extremo por HTTP, ventana de 10 s tras calentamiento:

| Carga | Concurrencia | Verdict rps | `qev` rps | Ratio rps | Verdict P50/P99 (ms) | `qev` P50/P99 (ms) |
|---|---:|---:|---:|---:|---|---|
| texto | 1 | 116.7 | 87.5 | 1.33x | 8.90 / 9.30 | 11.37 / 11.93 |
| texto | 8 | 245.7 | 89.9 | 2.73x | 33.16 / 35.56 | 89.42 / 91.05 |
| texto | 64 | 289.5 | 89.6 | 3.23x | 225.43 / 228.53 | 693.37 / 928.39 |
| imagen | 1 | 37.5 | 38.0 | 0.99x | 26.86 / 28.70 | 26.31 / 28.73 |
| imagen | 8 | 135.6 | 38.4 | 3.53x | 59.09 / 60.98 | 205.37 / 422.47 |
| imagen | 64 | 141.2 | 44.8 | 3.15x | 472.29 / 479.76 | 1639.10 / 1697.90 |
| video | 1 | 30.1 | 26.8 | 1.12x | 32.24 / 40.02 | 31.30 / 35.30 |
| video | 8 | 109.2 | 31.5 | 3.47x | 72.57 / 83.08 | 251.40 / 464.83 |
| video | 64 | 115.2 | 32.0 | 3.60x | 583.80 / 608.71 | 2018.50 / 2143.50 |

Rendimiento de `4b` en RTX 4090 (48 GB):

| Carga | Concurrencia | Verdict rps | `qev` rps | Ratio rps | Verdict P50/P99 (ms) | `qev` P50/P99 (ms) |
|---|---:|---:|---:|---:|---|---|
| texto | 1 | 38.1 | 31.3 | 1.22x | 25.98 / 27.01 | 31.99 / 32.38 |
| texto | 8 | 47.3 | 32.3 | 1.46x | 163.49 / 185.22 | 253.52 / 254.76 |
| texto | 64 | 55.2 | 32.0 | 1.72x | 1275.20 / 1425.70 | 2017.70 / 2243.00 |
| imagen | 1 | 17.2 | 16.8 | 1.02x | 57.51 / 60.47 | 57.68 / 60.92 |
| imagen | 8 | 51.6 | 17.6 | 2.93x | 156.16 / 160.33 | 461.55 / 706.21 |
| imagen | 64 | 56.8 | 19.2 | 2.96x | 1254.90 / 1267.90 | no disponible en el extracto |

Los datos de rendimiento de `9b` y `27b` en A100-SXM4 (80 GB) no estan completos en la informacion disponible; la model card indica que en esos niveles una celda donde un servidor completa menos de 2x la concurrencia se reporta como n/a en lugar de como tasa medida.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Como referencia de las pruebas publicadas, `0.8b` y `4b` se midieron en una RTX 4090 de 48 GB y `9b` y `27b` en una A100-SXM4 de 80 GB, sirviendo en bf16.
- GPU recomendadas segun la documentacion: RTX 4090 para `0.8b` y `4b`; A100-SXM4 (80 GB) para `9b` y `27b`.
- GPU de consumo: `0.8b` y `4b` caben en una RTX 4090 segun las pruebas del autor. Para `9b` y `27b` no se documenta despliegue en GPU de consumo.
- Despliegue: imagen Docker `sgyaqing/verdict:latest-cuda` con `--gpus all`, puerto 8080 y volumen de cache en `~/.cache/verdict`. Origen alternativo de checkpoints via ModelScope con `VERDICT_USE_MODELSCOPE=1`.
- Otros motores (vLLM, llama.cpp, Ollama, TGI): no documentados para este paquete.
- Latencia y throughput: ver tablas de la seccion anterior. En `0.8b` con carga de texto, P50 de 8.90 ms y 116.7 rps a concurrencia 1; 289.5 rps a concurrencia 64. En `4b` con carga de texto, P50 de 25.98 ms y 38.1 rps a concurrencia 1; 55.2 rps a concurrencia 64.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de la misma categoria (modelos de decision System One multimodales) ni de sus especificaciones. La unica comparacion publicada es contra el servidor de referencia del autor del modelo, `qev` 0.1.4, que sirve los mismos checkpoints y por tanto no constituye una alternativa de modelo sino de motor de inferencia.

| Criterio | OneJev 1.6 via Verdict | `qev` 0.1.4 (mismo checkpoint) | Otros modelos de decision System One |
|---|---|---|---|
| Parametros | 0.8B / 4B / 9B / 27B | mismos checkpoints | no disponible |
| Contexto | no disponible | no disponible | no disponible |
| Fidelidad vs estandar dorado | 2.49e-2 a 7.34e-2 | 7.80e-1 a 9.03e-1 | no disponible |
| Licencia | Apache 2.0 | no disponible | no disponible |
| Disponibilidad | Hugging Face (verdict-models), Docker Hub (sgyaqing/verdict), ModelScope | servidor del autor | no disponible |

## Limitaciones y advertencias

- El repositorio no contiene pesos: depende de la disponibilidad de los repositorios oficiales de OmniJev en Hugging Face o ModelScope en el primer arranque. Un fallo de red o un cambio en esos repositorios bloquea el despliegue.
- La fidelidad se verifica contra un corpus de 31 casos por nivel; es una muestra pequena y no cubre todos los dominios de uso.
- Los datos de rendimiento de `9b` y `27b` estan incompletos en la informacion disponible y parte de las celdas se reportan como n/a; no deben extrapolarse tasas para esos niveles.
- No hay informacion publicada sobre sesgos, tasas de alucinacion, cobertura idiomatica ni comportamiento fuera de distribucion. Al ser modelos de decision y no generativos de texto libre, el riesgo de alucinacion debe evaluarse en el dominio concreto de decision.
- La longitud de contexto no esta documentada, lo que impide planificar cargas con entradas largas (por ejemplo, videos extensos) sin pruebas previas.
- La licencia del paquete es Apache 2.0, pero la licencia de los checkpoints subyacentes de OmniJev no se detalla en la informacion disponible; conviene verificarla antes de un uso comercial.
- El pipeline declarado es text-classification, lo que puede inducir a error en herramientas que automaticen el enrutado por tarea: el modelo acepta imagen y video ademas de texto.
- El uso del nombre sin sufijo `:variant` no selecciona un modelo por defecto, solo lista variantes; los scripts que asuman un comportamiento por defecto fallaran.

## Enlaces

- Repositorio del paquete en Hugging Face: https://huggingface.co/verdict-models/OneJev1.6
- Perfil de la organizacion verdict-models: https://huggingface.co/verdict-models
- Checkpoint base 9B (referenciado en la model card): https://huggingface.co/OmniJev/OneJev1.6-9B
- Repositorio del motor Verdict: https://github.com/sgyaqing/verdict
- Imagen Docker: `sgyaqing/verdict:latest-cuda`
- Espejo en ModelScope: `sgyaqing/OneJev1.6:9b`
