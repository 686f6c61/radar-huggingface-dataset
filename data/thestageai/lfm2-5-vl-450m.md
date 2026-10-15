# TheStageAI/LFM2.5-VL-450M

## Resumen

LFM2.5-VL-450M es un modelo de visión-lenguaje (VLM) compacto de 450 millones de parámetros desarrollado por Liquid AI. Se trata de una revisión mejorada de LFM2-VL-450M que incorpora un entrenamiento adicional con refuerzo (RL) orientado a mejorar el seguimiento de instrucciones, la capacidad de *grounding* visual (localización de elementos en la imagen) y el soporte de *function calling*. Su propuesta central es convertir flujos de imágenes en salidas estructuradas y accionables en tiempo real, incluso en hardware de borde.

El repositorio indexado en esta ficha, `TheStageAI/LFM2.5-VL-450M`, corresponde a la distribución del modelo dentro del ecosistema de TheStage AI, que lo integra como `TheStageVLM` en sus SDK para Android y Apple. En ese contexto, tanto el codificador de visión como el decodificador de lenguaje se ejecutan íntegramente en el dispositivo, con soporte de inferencia por lotes y en modo *streaming* token a token.

La relevancia actual del modelo reside en su huella de despliegue: con 450M de parámetros y un repositorio de 6,1 GB, apunta a escenarios *on-device* y de borde donde no es viable ejecutar un VLM de varios miles de millones de parámetros, manteniendo capacidades de grounding, instrucciones y llamada a funciones que habitualmente se asocian a modelos mucho mayores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la informacion disponible; pertenece a la familia LFM2 de Liquid AI (vision-lenguaje, con codificador de vision y decodificador de lenguaje) |
| Parametros totales | 450M (segun denominacion del modelo) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No disponible en la informacion proporcionada; el repositorio de HuggingFace ocupa 6,1 GB |

## Arquitectura y entrenamiento

LFM2.5-VL-450M sigue el esquema de los modelos vision-lenguaje: un codificador de visión que procesa la imagen y un decodificador de lenguaje que genera la respuesta de texto, ambos ejecutables en el mismo dispositivo segun la documentacion del SDK de TheStage AI. Se presenta como una evolución de LFM2-VL-450M, del que hereda la estructura general y la huella de despliegue compacta, con un entrenamiento adicional basado en aprendizaje por refuerzo (RL) orientado a mejorar el rendimiento.

Las innovaciones que la documentacion de Liquid AI destaca para esta version son tres: capacidades de *grounding* (referenciar y localizar objetos o regiones concretas de la imagen), mejor seguimiento de instrucciones y soporte de *function calling*. El objetivo declarado es transformar secuencias de imagenes en salidas estructuradas y utilizables de forma inmediata. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni la configuracion exacta de atencion o de capas.

## Capacidades

- Generacion de texto condicionada por imagen: descripcion de imagenes, respuesta a preguntas visuales y conversion de contenido visual en texto.
- Grounding visual: identificacion y localizacion de elementos dentro de la imagen, segun la documentacion de Liquid AI.
- Salidas estructuradas: transformacion de imagenes en formatos accionables, con el ejemplo de recibos convertidos a JSON citado por TheStage AI.
- Function calling: soporte de llamada a funciones para integrar el modelo en flujos de agente.
- Seguimiento de instrucciones mejorado respecto a LFM2-VL-450M gracias al entrenamiento adicional con RL.
- Procesamiento en tiempo real de flujos de imagen (*image streams*) en hardware de borde.
- Inferencia completamente *on-device* mediante TheStageVLM (Android y Apple), incluyendo modo por lotes y *streaming* token a token.
- Integracion en aplicaciones Swift y Flutter a traves del SDK de TheStage AI.
- Capacidades multilingues: no disponible.
- Modo *thinking*, audio u otras modalidades: no disponible.

## Casos de uso

- Digitalizacion de recibos y facturas en aplicaciones moviles: el modelo recibe la fotografia del documento y devuelve un JSON estructurado con los campos relevantes, sin salir del dispositivo, lo que evita enviar datos financieros a un servidor.
- Descripciones de accesibilidad en tiempo real: generacion de subtitulos y descripciones de imagenes para usuarios con discapacidad visual, ejecutandose localmente en el telefono mediante TheStageVLM.
- Comparacion antes/despues: analisis de pares de imagenes para verificar cambios en una escena, caso documentado entre las guias de uso del SDK de TheStage AI.
- Asistentes visuales de atencion al cliente: un agente recibe una foto del producto o del error y responde con instrucciones paso a paso, usando el soporte de function calling para consultar catalogos o abrir incidencias.
- Control de calidad en linea de produccion: el modelo inspecciona capturas de camara en el borde, detecta defectos o piezas mal posicionadas mediante grounding y emite alertas estructuradas sin depender de conectividad.
- Comercio minorista y gestion de inventario: reconocimiento de productos en estanterias a partir de fotos tomadas con el movil, con salida tabulada para el sistema de stock.
- Robotica y automatizacion ligera: el grounding visual permite traducir una instruccion en lenguaje natural ("coge el destornillador rojo") a una region concreta de la imagen, util como paso previo a la planificacion de manipulacion.
- Asistencia documental en campo: tecnicos que fotografian etiquetas, paneles o placas de caracteristicas y obtienen datos estructurados para rellenar formularios automaticamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo orientativo a partir de los 450M de parametros, no confirmado por el fabricante): en torno a 1 GB en FP16, 0,5 GB en cuantizacion de 8 bits y 0,3 GB en 4 bits, sin contar el coste del codificador de vision ni el *overhead* del runtime.
- GPU de servidor: no se especifican modelos recomendados; por tamano, el modelo es ejecutable en cualquier GPU de inferencia moderna (A100, H100, L4, T4) con margen amplio.
- GPU de consumo: cabe con holgura en GPU de consumo con 4 GB o mas de VRAM (RTX 3050, RTX 4060, RTX 4090), e incluso en graficos integrados con memoria unificada suficiente.
- Despliegue en dispositivo: soportado explicitamente mediante TheStageVLM en el SDK de Android y en el SDK de Apple, con integracion en Swift y Flutter.
- Opciones de despliegue: la documentacion disponible solo menciona los SDK de TheStage AI (Android y Apple). No se confirma soporte de vLLM, llama.cpp, Ollama o TGI para esta distribucion concreta, ni de pesos GGUF.
- Latencia y throughput: no disponibles. El SDK de TheStage AI desglosa la latencia en sus objetos de resultado, pero no se publican cifras concretas en la informacion consultada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Grounding / function calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TheStageAI/LFM2.5-VL-450M | 450M | No disponible | Si (grounding y function calling, segun Liquid AI) | No disponible | HuggingFace (TheStageAI) y SDK Android/Apple |
| LiquidAI/LFM2.5-VL-450M | 450M | No disponible | Si (grounding y function calling, segun Liquid AI) | No disponible | HuggingFace (LiquidAI) |
| LiquidAI/LFM2-VL-450M | 450M | No disponible | Version previa, sin el RL adicional descrito para 2.5 | No disponible | HuggingFace (LiquidAI) |
| Otros VLM compactos de gama sub-1B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparado entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se documenta en la informacion consultada ningun analisis de sesgos.
- Riesgo de alucinacion: inherente a los modelos generativos, y especialmente relevante en tareas de extraccion de datos de documentos (recibos, etiquetas) donde una salida estructurada incorrecta puede propagarse silenciosamente a sistemas posteriores. Se recomienda validacion con esquemas y comprobaciones de confianza.
- Limitaciones de contexto e idioma: no se especifican la ventana de contexto ni los idiomas soportados. La documentacion y los ejemplos publicos estan en ingles, por lo que el comportamiento en castellano no esta verificado en la informacion disponible.
- Precision en imagenes: al tratarse de un modelo de 450M de parametros, la lectura de texto denso, tablas complejas o documentos de baja calidad puede degradarse frente a VLM de mayor tamano. No hay cifras publicadas que cuantifiquen esta perdida.
- Licencia: no disponible. Antes de un uso comercial es imprescindible verificar los terminos del repositorio original de Liquid AI y los de la distribucion de TheStage AI, ya que no se detallan aqui.
- Caveat de distribucion: el repositorio indexado pertenece a TheStageAI, no al autor original del modelo. Conviene confirmar que los pesos son identicos a los de `LiquidAI/LFM2.5-VL-450M` y revisar el formato de pesos antes de integrarlo en un pipeline propio.
- Metricas de adopcion muy bajas en el momento de la consulta (1 descarga, 0 likes), lo que implica poca validacion independiente por parte de la comunidad.

## Enlaces

- Repositorio en HuggingFace (TheStageAI): https://huggingface.co/TheStageAI/LFM2.5-VL-450M
- Repositorio en HuggingFace (LiquidAI): https://huggingface.co/LiquidAI/LFM2.5-VL-450M
- Documentacion de Liquid AI para LFM2.5-VL-450M: https://docs.liquid.ai/lfm/models/lfm25-vl-450m
- Blog de Liquid AI sobre LFM2.5-VL-450M: https://www.liquid.ai/blog/lfm2-5-vl-450m
- Documentacion VLM del AndroidSDK de TheStage AI: https://github.com/TheStageAI/AndroidSDK/blob/main/docs/vlm.md
- Documentacion del SDK de Apple (TheStage AI): https://docs.thestage.ai/apple_sdk/docs/source/apple_sdk.vlm.html
