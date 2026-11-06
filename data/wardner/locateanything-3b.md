# wardner/LocateAnything-3B

## Resumen

LocateAnything-3B es un modelo de lenguaje y visión (VLM) especializado en *visual grounding*: recibe una descripción textual y devuelve las coordenadas de la región de la imagen que corresponde a esa descripción. El repositorio analizado, publicado por el usuario `wardner`, no contiene los pesos originales en formato estándar, sino los artefactos de despliegue ya convertidos para el acelerador NPU RK182x de Rockchip, junto con un manifiesto de worker (`LocateAnything-3b.json`) para la plataforma wdnwebui.

La distribución está pensada para ejecución en el borde: la tarjeta de cómputo RK182x se monta sobre un host RK3588 y el modelo se ejecuta mediante el stack RKLLM + RKNN. El tamaño total de los pesos empaquetados es de 3,27 GB, con una estimación de memoria de unos 5500 MB y un tiempo de inicialización de aproximadamente 60 segundos. La licencia del modelo original es Apache 2.0, mientras que los ficheros de este repositorio son derivados convertidos a RKNN y se publican bajo una licencia `other`.

El interés de esta ficha es doble: por un lado documenta un caso real de despliegue de un VLM de 3B en hardware NPU de gama baja para tareas de localización visual; por otro, sirve de advertencia sobre las distribuciones que no incluyen pesos en safetensors ni GGUF del modelo completo, sino únicamente grafos compilados para un acelerador concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM basada en Qwen (según etiquetas del repositorio); grafos RKNN para NPU RK182x |
| Parametros totales | 3B (según el nombre del modelo; no se detalla el desglose) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos empaquetados como `.weight` junto a grafos RKNN; tabla de embeddings en fp16) |
| Idiomas soportados | no disponible |
| Licencia | `other` en este repositorio; el modelo upstream es Apache 2.0 |
| Formato de pesos | RKNN (`.rknn`) + `.weight` + embeddings fp16 (`.embed.bin`) + tokenizer GGUF |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un VLM basado en Qwen y orientado a *visual grounding*. El repositorio separa claramente dos componentes: un grafo de lenguaje (`llm_LocateAnything.1828.rknn` con sus pesos) y un grafo de visión (`vision_LocateAnything.448x448.1828.rknn` con los suyos), lo que sugiere una arquitectura clásica de VLM con encoder visual a resolución 448x448 y un decoder de lenguaje. La tabla de embeddings se distribuye en fp16 (596,4 MB) y el tokenizer en formato GGUF con BPE estilo GPT-2 y ByteLevel.

No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. Lo que sí es relevante desde el punto de vista de ingeniería es el proceso de conversión: los pesos originales se han compilado a grafos RKNN para la NPU RK182x (generación de 1,82 TOPS), lo que implica una cuantización y un empaquetado propietarios que no se detallan en la model card.

## Capacidades

- Localización visual (*visual grounding*): dada una descripción en texto, el modelo devuelve la región de la imagen correspondiente. Es la única capacidad declarada explícitamente en el manifiesto (`swcap_vision_grounding`).
- Procesamiento de imagen a 448x448 píxeles mediante el grafo de visión dedicado.
- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Integración como worker en wdnwebui: el manifiesto declara la factoría `locate_anything` y el modelo se descubre automáticamente al escanear el directorio de modelos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo *thinking*, visión de vídeo o audio: no disponible en la información proporcionada.

## Casos de uso

- Localización de objetos en imágenes industriales: el modelo recibe una descripción ("tornillo hexagonal a la izquierda de la brida") y devuelve la caja delimitadora, lo que permite integrarlo en pipelines de inspección visual sobre dispositivos RK3588 + RK182x sin depender de la nube.
- Robótica de bajo consumo: al ejecutarse en una NPU de 1,82 TOPS con ~5500 MB de memoria, puede alimentar bucles de percepción en robots móviles o brazos colaborativos donde el consumo y el espacio son críticos.
- Asistencia a personas con discapacidad visual: dado un enunciado en lenguaje natural, el modelo localiza el objeto descrito en la escena capturada por una cámara y permite generar indicaciones espaciales.
- Anotación semiautomática de datasets: el modelo propone regiones a partir de descripciones textuales, reduciendo el trabajo manual en la creación de corpus de *grounding* para entrenar otros modelos.
- Control por voz o texto en interfaces de usuario: seleccionar un elemento de la pantalla o de una imagen mediante una frase ("pulsa el botón de arriba a la derecha") en sistemas embebidos con pantalla táctil.
- Verificación de inventario en almacenes: localizar productos concretos descritos por texto en imágenes de estanterías, ejecutando la inferencia en el propio dispositivo de captura.
- Despliegue en entornos sin conectividad: al no requerir servicios externos, es adecuado para instalaciones remotas, vehículos o plantas industriales aisladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Acelerador: tarjeta de cómputo Rockchip RK182x (NPU de 1,82 TOPS) obligatoria; los grafos `.rknn` no son portables a otras NPU.
- Host: plataforma RK3588.
- Memoria estimada: ~5500 MB según el manifiesto del worker.
- Tiempo de inicialización: ~60 segundos.
- Almacenamiento: 3,5 GB de repositorio (3,27 GB de pesos).
- Cabe en GPU de consumo: no aplica; el modelo no se distribuye en formato ejecutable por CUDA ni por CPU convencional.
- Opciones de despliegue: RKLLM + RKNN a través de wdnwebui; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wardner/LocateAnything-3B | 3B | no disponible | RKNN + `.weight` | `other` (upstream Apache 2.0) | Solo para RK182x |
| nvidia/LocateAnything-3B | 3B (según nombre) | no disponible | no disponible | no disponible | Repositorio en Hugging Face |
| Modelos VLM de grounding de propósito general (p. ej. Qwen-VL) | variable | variable | safetensors, GGUF | variable | Multiplataforma |

La comparación con alternativas de propósito general es limitada porque este repositorio no publica pesos en safetensors ni GGUF del modelo completo, ni benchmarks que permitan situarlo frente a otros VLM de 3B. El repositorio `nvidia/LocateAnything-3B` aparece en los resultados de búsqueda como posible origen del modelo, pero no se dispone de sus especificaciones en la información proporcionada.

## Limitaciones y advertencias

- Los ficheros distribuidos son derivados convertidos a RKNN, no los pesos originales; no pueden ejecutarse fuera de una NPU RK182x.
- La licencia del repositorio es `other`, distinta de la Apache 2.0 del modelo upstream; es necesario revisar `LICENSE` y `NOTICE` antes de cualquier uso comercial.
- No se documentan idiomas soportados, longitud de contexto ni esquema de cuantización, lo que dificulta evaluar la degradación respecto al modelo original.
- El modelo está especializado en *visual grounding*; no debe asumirse que cubre otras tareas de visión o de lenguaje con la misma calidad.
- Riesgo de alucinación en las coordenadas devueltas: al ser un modelo generativo, puede producir cajas plausibles pero incorrectas, especialmente con descripciones ambiguas.
- No se han publicado benchmarks ni evaluaciones de sesgo en la información disponible.
- La instalación depende de wdnwebui y de variables de entorno específicas (`WDNAI_LOCATE_ANYTHING_DIR`); no es un despliegue estándar de Hugging Face.
- El tiempo de inicialización de ~60 s y el consumo de ~5500 MB limitan su uso en escenarios que requieran arranques frecuentes o memoria muy ajustada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/wardner/LocateAnything-3B
- Posible modelo upstream en Hugging Face: https://huggingface.co/nvidia/LocateAnything-3B
