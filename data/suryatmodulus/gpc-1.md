# suryatmodulus/GPC-1

## Resumen

GPC-1 es un modelo de clasificación de propósito general construido sobre el backbone multimodal Qwen3.5-35B-A3B y ajustado mediante PEFT/LoRA para tres tareas concretas: decisiones categóricas con etiquetas definidas por el usuario, estimaciones numéricas acotadas a un rango y coordenadas condicionadas por imagen. En lugar de generar texto libre, el modelo devuelve predicciones tipadas: una clase seleccionada con probabilidades sobre las opciones disponibles, un valor numérico dentro de un intervalo declarado en la petición, o registros JSON completos puntuados de forma conjunta. El autor publica el modelo como un paquete que incluye el backbone, el adaptador correspondiente y el código de servicio.

La propuesta técnica es el *schema-bound scoring*: la aplicación define mediante una API el espacio de salida (entre 2 y 255 opciones categóricas, un soporte de 101 posiciones equiespaciadas para cada campo numérico, o un conjunto enumerado de registros JSON válidos) y el modelo puntúa ese espacio cerrado en lugar de generar secuencias abiertas. Esto permite encadenar el modelo en flujos de enrutado de documentos, puntuación, anotación visual y decisões estructuradas con salidas que la aplicación puede consumir directamente, sin parsers tolerantes a fallos.

El modelo se distribuye con licencia Apache-2.0 sobre un backbone de la familia Qwen3.5, con un techo de entrada de 256K tokens (262.144) en el servidor, incluyendo esquema compilado y tokens de imagen. Es relevante como ejemplo de reutilización de un modelo de lenguaje grande multimodal convertido en clasificador restringido por esquema, aunque en el momento de la ficha no tiene descargas ni validación independiente publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of experts multimodal (familia Qwen3.5-35B-A3B) |
| Parametros totales | 35B segun la nomenclatura del modelo base Qwen3.5-35B-A3B; cifra exacta no disponible |
| Parametros activos | Aproximadamente 3B segun la nomenclatura "A3B" del modelo base; no confirmado en la informacion proporcionada |
| Longitud de contexto | 256K tokens (262.144) declarados como techo de entrada del servidor, incluyendo esquema compilado y tokens de imagen |
| Tipos de cuantizacion | No disponible; la model card solo menciona ejecucion en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (adaptador); licencia del backbone Qwen3.5-35B-A3B no confirmada en la informacion proporcionada |
| Formato de pesos | safetensors; el paquete incluye backbone y adaptador LoRA (PEFT) |
| Tamano del repositorio | 70,3 GB |
| Pipeline declarado | image-text-to-text |
| Modos de prediccion | Categórico (2-255 opciones), numérico (soporte de 101 puntos), coordenadas condicionadas por imagen, registros JSON conjuntos |
| Servicio | Servidor propio estilo OpenAI sobre PyTorch y hardware NVIDIA |

## Arquitectura y entrenamiento

La arquitectura subyacente es un mixture of experts multimodal de la familia Qwen3.5-35B-A3B, es decir, un transformer con capas MoE y capacidad de procesar imagen y texto, segun la descripcion del propio autor ("multimodal mixture of experts"). Sobre ese backbone se aplica un ajuste posterior mediante PEFT/LoRA: los metadatos de HuggingFace etiquetan el repositorio con `peft`, `lora`, `base_model:Qwen/Qwen3.5-35B-A3B` y `base_model_relation: adapter`, y la model card indica que la release completa incluye "el backbone GPC-1, su adaptador correspondiente y el código de servicio", cargados automaticamente por el servidor. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon RLHF, DPO u otras tecnicas de alineamiento.

La innovacion destacable no esta en el backbone sino en la interfaz de decodificacion: el modelo no genera texto abierto, sino que puntua un espacio de salida cerrado y tipado definido por el cliente. Los campos numéricos se representan sobre 101 posiciones equiespaciadas dentro del rango declarado y la API devuelve la posicion mas probable junto con una media ponderada por probabilidad, que puede caer entre posiciones; el autor describe explicitamente el resultado como una estimacion de resolucion finita. Para decisiones dependientes, el usuario enumera los registros JSON completos que su flujo permite y el modelo los puntua conjuntamente, de modo que combinaciones invalidas no pueden aparecer en el soporte devuelto. El alcance de esa puntuacion conjunta queda acotado a los registros enumerados, no a generacion JSON arbitraria.

## Capacidades

- Clasificacion categorica con etiquetas definidas por el usuario: devuelve la clase seleccionada y probabilidades sobre las opciones disponibles, con un rango de 2 a 255 opciones por peticion.
- Estimacion numerica acotada: dado un minimo, un maximo, una unidad y una descripcion del campo, devuelve el valor mas probable y una media ponderada por probabilidad sobre 101 posiciones.
- Salidas numericas condicionadas por imagen: coordenadas normalizadas descritas en lenguaje natural (por ejemplo, cajas delimitadoras con `x_min`, `y_min`, `x_max`, `y_max`, o puntos clave como `right_hip_x` y `right_hip_y`).
- Decisiones estructuradas dependientes: puntuacion conjunta de registros JSON completos enumerados por la aplicacion, manteniendo la coherencia entre decisiones categoricas relacionadas.
- Multiples campos numericos evaluados en una sola pasada del modelo.
- Entrada multimodal imagen-texto, con canal de imagen integrado en la misma peticion que define los campos a estimar.
- Servicio estilo OpenAI: campos `messages` y `response_format` con una extension `gpc1` para el modo de prediccion, sobre hardware NVIDIA.
- Razonamiento aritmetico sencillo expresado como estimacion acotada (el ejemplo de la model card resuelve el 35% de 200 litros devolviendo 70).
- No se documenta en la informacion disponible soporte de tool calling, function calling, uso agentico multi-paso, modo de razonamiento explicito, audio ni generacion de texto libre.

## Casos de uso

- Enrutado de documentos: definir como etiquetas las categorias del burocrático de entrada (factura, contrato, reclamacion, informe) y dejar que GPC-1 devuelva la clase con su distribucion de probabilidad; el limite de 2 a 255 opciones permite cubrir taxonomias amplias sin reentrenar.
- Puntuacion y priorizacion: declarar un campo numerico con rango 0-1 y descripcion del criterio (urgencia, calidad, riesgo) para obtener una puntuacion comparable entre elementos, evaluando varios campos en una sola pasada.
- Anotacion visual y etiquetado de datasets: pedir coordenadas normalizadas para cajas delimitadoras o puntos clave descritos en lenguaje natural, integrando el resultado en herramientas de anotacion como preetiquetado revisable por humanos.
- Clasificacion de intenciones en asistentes conversacionales: enumerar las intenciones soportadas por el sistema y usar la probabilidad devuelta como umbral para derivar a un flujo de respaldo cuando la confianza es baja.
- Extraccion de magnitudes con unidad conocida: preguntas de tipo "devuelve el volumen en litros entre 0 y 200" para informes, formularios o calculos de dominio donde la respuesta debe caer en un intervalo fisicamente valido.
- Decisiones administrativas dependientes: en lugar de elegir departamento y accion por separado, enumerar los pares validos y dejar que el modelo puntue los registros conjuntamente, evitando combinaciones incoherentes en flujos de tramitacion.
- Vision por computador asistida por lenguaje: estimar posiciones, angulos o distancias sobre una imagen (por ejemplo, un angulo de 0 a 360 grados) en aplicaciones de robotica ligera o analisis deportivo donde basta una estimacion de resolucion finita.
- Control de calidad en pipelines de datos: usar la probabilidad sobre las clases permitidas como filtro para descartar o marcar automaticamente elementos ambiguos antes de que lleguen a un revisor humano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones especificas de clasificacion, y la busqueda web realizada no devolvio resultados relevantes sobre el modelo (unicamente foros sin relacion).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, el repositorio pesa 70,3 GB y la model card exige memoria suficiente para el modelo en BF16, lo que situa el requisito practico en torno a 70-80 GB de VRAM sumando pesos y estados de servicio.
- GPU recomendadas: la model card menciona exclusivamente hardware NVIDIA compatible; una A100 80 GB o una H100 80 GB son el punto de partida natural para el paquete BF16. Para configuraciones de menor memoria por GPU se requeriria reparto en varias tarjetas.
- Cabe en GPU de consumo: no con los pesos BF16 publicados. No se documentan versiones cuantizadas, por lo que no se puede confirmar su viabilidad en tarjetas de 24 GB.
- Opciones de despliegue: servidor propio incluido en la release (`python3 -m uvicorn gpc1_server.api:app`) sobre PyTorch 2.9.1 y torchvision 0.24.1 con CUDA 13.0, mas descarga mediante `hf download harshatheg/GPC-1`. Se soporta despliegue offline y revisiones fijadas segun la guia de descargas. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card solo indica que el servidor debe permanecer en ejecucion y que el techo de entrada es de 256K tokens.
- Nota: los metadatos de HuggingFace marcan `inference: false`, por lo que el modelo no esta pensado para los endpoints de inferencia gestionados de la plataforma.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GPC-1 | 35B (MoE, ~3B activos segun nomenclatura del base) | 256K tokens de entrada | Clasificador restringido por esquema sobre backbone multimodal | Apache-2.0 (adaptador) | Repositorio HuggingFace con 0 descargas y 0 likes |
| Qwen3.5-35B-A3B (modelo base) | 35B MoE | No disponible en la informacion proporcionada | Modelo generativo multimodal de proposito general | No confirmada | Modelo base publico referenciado por el adaptador |
| Otros clasificadores de tarea especifica comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre clasificadores de proposito general con interfaz de esquema que sean directamente comparables en tamano, contexto y licencia.

## Limitaciones y advertencias

- Ausencia total de validacion independiente: el repositorio registra 0 descargas y 0 likes, y no se han publicado benchmarks ni evaluaciones de terceros.
- Las salidas numericas tienen resolucion finita (101 posiciones por campo) y se presentan como estimaciones, no como valores exactos; la media ponderada puede caer entre posiciones y debe interpretarse con esa granularidad.
- La puntuacion conjunta de decisiones dependientes esta acotada a los registros que el usuario enumera; no sustituye a la generacion JSON arbitraria ni garantiza cobertura de combinaciones no listadas.
- En el ejemplo de pose humana la model card advierte de que cada coordenada es una estimacion independiente y que no se impone un esqueleto coherente, por lo que no debe usarse como sistema de captura de movimiento sin validacion adicional.
- Riesgo de alucinacion no evaluado: al tratarse de un ajuste sobre un modelo generativo con puntuacion de espacios cerrados, no hay datos publicos sobre el comportamiento fuera de distribucion.
- Idiomas soportados no disponibles: no se puede confirmar cobertura multilingue ni el comportamiento en castellano.
- Cobertura de cuantizaciones no disponible: solo se documenta BF16, lo que limita el despliegue en hardware de gama baja.
- Licencia: el adaptador se publica bajo Apache-2.0, pero la licencia aplicable al backbone Qwen3.5-35B-A3B no se confirma en la informacion proporcionada; conviene verificarla antes de un uso comercial.
- Inconsistencia de identificadores: los metadatos apuntan a `suryatmodulus/GPC-1` mientras que la model card y los comandos de descarga referencian `harshatheg/GPC-1`, y el espacio de demostracion se aloja bajo `harshatheg`. Es necesario verificar cual es el repositorio canonico antes de integrarlo en un pipeline.
- El paquete requiere cargar backbone y adaptador de forma conjunta mediante el servidor incluido; no es un adaptador LoRA al uso que pueda aplicarse a otras herramientas de inferencia sin trabajo adicional.
- No se documenta soporte de tool calling ni uso agentico, por lo que no debe asumirse en disenos que dependan de esas capacidades.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/suryatmodulus/GPC-1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Demo alojada: https://huggingface.co/spaces/harshatheg/GPC-1-Demo
- Guia de API: API.md (ruta relativa dentro del repositorio)
- Model card extendida: MODEL_CARD.md (ruta relativa dentro del repositorio)
- Opciones de descarga: docs/DOWNLOADS.md (ruta relativa dentro del repositorio)
- Demo local: demo/README.md (ruta relativa dentro del repositorio)
- Repositorio referenciado en los comandos de descarga: https://huggingface.co/harshatheg/GPC-1
- Papers, blogs o repositorios adicionales: no disponibles; la busqueda web no devolvio resultados relevantes sobre este modelo.
