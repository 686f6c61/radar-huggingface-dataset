# ZETIC-ai/d1-2B-IQ9

## Resumen

d1-2B-IQ9 es un paquete de despliegue del modelo LiquidAI/d1-2B, desarrollado por Liquid AI y empaquetado por ZETIC-ai para la NPU Hexagon del SoC Qualcomm Dragonwing IQ9 (QCS9075). No se trata de un modelo de generacion de texto, sino de un modelo de decision: recibe una entrada (texto e imagenes) y un conjunto de preguntas estructuradas, y devuelve respuestas en una sola pasada (probabilidades si/no, eleccion entre opciones y puntuaciones en una escala). Esta orientado a inferencia en dispositivo (on-device) en entornos edge.

El paquete incluye pesos del modelo de lenguaje en 8 bits y un codificador visual en fp16, derivados del checkpoint original de LiquidAI/d1-2B. La ventana de contexto es de 2.048 posiciones, y una pasada de decision admite hasta 1.024 tokens: la entrada, sus medios y hasta 16 preguntas. El repositorio ocupa 2,2 GB y contiene una unica carpeta de destino (`v73/`) para el IQ9.

La relevancia de este paquete radica en que permite ejecutar un modelo de decision multimodal sobre una NPU integrada en hardware edge, sin GPU dedicada, mediante el runtime propietario Ixian Hexagon y el SDK ZeticMLange. La licencia de los pesos es la LFM Open License v1.0 de Liquid AI, mientras que el SDK se distribuye por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI/d1-2B; el paquete no detalla la arquitectura interna) |
| Parametros totales | no disponible (el nombre del modelo indica 2B) |
| Parametros activos | no disponible |
| Longitud de contexto | 2.048 posiciones; una pasada de decision admite hasta 1.024 tokens (entrada, medios y hasta 16 preguntas) |
| Tipos de cuantizacion | pesos del modelo de lenguaje en 8 bits; codificador visual en fp16 |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0), Liquid AI |
| Formato de pesos | formato propietario del paquete ZETIC (manifest.json, SHA256SUMS, tokenizer, configs y pesos); no safetensors ni GGUF |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base LiquidAI/d1-2B: no se especifica si es un transformer, un modelo de estado espacio (SSM) o una arquitectura hibrida, ni se indican datos de entrenamiento, numero de tokens, composicion del dataset ni si hubo RLHF o DPO. El paquete de ZETIC es una conversion del checkpoint upstream `cfe5760ff5d5998f91d9ac56bd4b2dbd96996d41`, con pesos del modelo de lenguaje convertidos a 8 bits y el codificador visual en fp16; no son los pesos originales.

La innovacion tecnica destacable del paquete es el modo de ejecucion: todas las preguntas sobre una misma entrada se procesan en una unica pasada por la NPU (hasta 16 preguntas), lo que evita generar texto intermedio y reduce la latencia. La inferencia se ejecuta en una NSP del IQ9 mediante el runtime Ixian Hexagon y el SDK ZeticMLange Hexagon. El modelo base d1-2B es un modelo de decision que responde preguntas estructuradas (si/no con probabilidad, eleccion de una lista, puntuacion en una escala) en lugar de generar texto libre.

## Capacidades

- Decision estructurada sobre una entrada: probabilidad de si/no, eleccion entre opciones con descripcion y puntuacion en una escala definida por el usuario.
- Entrada multimodal: texto e imagenes (PNG, JPEG, PPM, BMP; obligatoriamente 512 x 512 RGB).
- Procesamiento por lotes de preguntas: hasta 16 preguntas sobre la misma entrada en una sola pasada de NPU.
- Clasificacion y enrutamiento: asignacion de una entrada a una categoria o equipo concreto.
- Puntuacion ordinal: valoracion de urgencia, severidad u otros criterios sobre una escala.
- Soporte de audio: el SDK menciona `Part::Img` y audio en la API, aunque las reglas de medios documentadas solo detallan imagenes.
- No es un modelo generativo de texto: no produce respuestas abiertas, razonamiento en multiples pasos ni tool calling segun la documentacion disponible.
- Capacidades multilingues: no disponible.

## Casos de uso

- Triaje de tickets de soporte: el modelo puede clasificar una reclamacion en una sola pasada (por ejemplo, si procede reembolso, que equipo debe gestionarla y que urgencia tiene), tal como muestra el ejemplo `demo` del SDK con un ticket de facturacion y envio.
- Enrutamiento automatico de correo o formularios: con `Question::Choice` se asigna cada mensaje a un departamento segun descripciones predefinidas, sin necesidad de un clasificador entrenado especificamente.
- Moderacion de contenido: preguntas de si/no con probabilidad permiten decidir si un texto o imagen infringe una politica, con umbral ajustable por el operador.
- Inspeccion visual en edge: con imagenes de 512 x 512 se pueden responder preguntas binarias o de eleccion sobre fotos capturadas en el dispositivo (presencia de objetos, estado de un producto, etiquetas).
- Priorizacion de alertas en campo: puntuacion de urgencia sobre eventos o incidencias en dispositivos remotos, ejecutada localmente en el IQ9 sin enviar datos a la nube.
- Clasificacion documental en kioscos o terminales: extraccion de decisiones sobre formularios o justificantes escaneados, manteniendo los datos en el dispositivo.
- Control de calidad en linea de produccion: verificacion binaria de defectos a partir de imagenes fijas de 512 x 512, con latencia de una sola pasada de NPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica validacion reportada es de equivalencia funcional: en la carpeta `v73/`, las respuestas top-1 de la API de decision fueron identicas a la referencia fp32 de Hugging Face en 181 de 181 preguntas de prueba, comprobado entre el 31 de octubre y el 2 de noviembre de 2026 con la validacion de la release 0.1.0 del SDK sobre el paquete 0.1.0.

## Requisitos de hardware

- Hardware objetivo: Qualcomm Dragonwing IQ9 (QCS9075) con 2 NSP, sobre Qualcomm Linux (linux-arm64). El paquete no esta pensado para GPU ni CPU de proposito general.
- VRAM: no aplica; la inferencia se ejecuta en la NPU Hexagon del SoC.
- Tamano en disco: 2,21 GB para la carpeta `v73/` (17 archivos).
- GPU recomendadas: no disponible; no se contemplan GPU dedicadas (A100, H100, RTX 4090) en la documentacion.
- Compatibilidad con GPU de consumo: no; el paquete depende del runtime Ixian Hexagon y del SDK ZeticMLange para el IQ9.
- Opciones de despliegue: SDK ZeticMLange Hexagon para Dragonwing IQ9 (herramientas `zetic_d1_cli info` y `zetic_d1_cli demo`, API C++ `zetic_decision.h`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible; la documentacion solo indica que todas las preguntas de una entrada se resuelven en una pasada de NPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZETIC-ai/d1-2B-IQ9 | no disponible (2B por nombre) | 2.048 posiciones; 1.024 tokens por pasada | Decision multimodal empaquetada para NPU IQ9 | LFM Open License v1.0 | Hugging Face (pesos) + SDK en GitHub |
| LiquidAI/d1-2B | no disponible (2B por nombre) | no disponible | Decision multimodal (modelo base) | LFM Open License v1.0 | Hugging Face |
| Alternativas de clasificacion/decision en edge de otros fabricantes | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, razonamiento multi-paso ni tool calling; solo responde preguntas estructuradas predefinidas.
- Las imagenes deben ser exactamente 512 x 512 RGB; cualquier otro tamano se rechaza con `Status::InvalidArgument` y el SDK no reescala, por lo que hay que redimensionar o aplicar letterbox antes.
- La ventana de contexto es de 2.048 posiciones y cada pasada de decision admite como maximo 1.024 tokens, incluyendo entrada, medios y hasta 16 preguntas.
- Dependencia de hardware y software propietarios: requiere un Dragonwing IQ9 con Qualcomm Linux y el SDK ZeticMLange Hexagon, distribuido por separado en GitHub con su propia licencia.
- Los pesos son una conversion derivada del checkpoint upstream, no los pesos originales; la validacion se limita a la equivalencia top-1 en 181 preguntas.
- Idiomas soportados no documentados; no se puede garantizar cobertura multilingue.
- Sesgos y riesgo de alucinacion: no documentados en la informacion disponible, aunque al tratarse de un modelo de decision las salidas son probabilidades y elecciones, no texto abierto.
- Licencia LFM Open License v1.0: es necesario leer el texto completo antes de cualquier uso o redistribucion, especialmente en entornos comerciales.
- El SDK no esta incluido en el repositorio; su licencia y condiciones son independientes de las de los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ZETIC-ai/d1-2B-IQ9
- Modelo base LiquidAI/d1-2B: https://huggingface.co/LiquidAI/d1-2B
- Revision upstream del checkpoint: https://huggingface.co/LiquidAI/d1-2B/tree/cfe5760ff5d5998f91d9ac56bd4b2dbd96996d41
- SDK ZeticMLange Hexagon para Dragonwing IQ9: https://github.com/zetic-ai/IxianHexagon
- Licencia LFM Open License v1.0: https://huggingface.co/ZETIC-ai/d1-2B-IQ9/blob/main/LICENSE
