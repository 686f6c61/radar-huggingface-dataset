# TESS-Computer/qwen-click-dit-clean

## Resumen

Qwen-Click-DiT (identificador `TESS-Computer/qwen-click-dit-clean`) es un modelo de vision-lenguaje especializado en predecir coordenadas de clic sobre capturas de pantalla a partir de una instruccion en lenguaje natural. Lo desarrolla el usuario TESS-Computer y su planteamiento es poco habitual: en lugar de generar texto con las coordenadas, utiliza un backbone Qwen2.5-VL-3B congelado como extractor de representaciones y anade una cabeza de accion basada en un Diffusion Transformer (DiT) entrenado con flow matching, que produce directamente un par (x, y) normalizado.

El modelo resuelve un problema muy concreto dentro del campo del GUI grounding: dado un pantallazo y una orden como "click on the search button", devolver el punto exacto donde hay que pulsar. Esta capacidad es la pieza base de cualquier agente de interfaz grafica (automatizacion de escritorio, testing de UI, agentes de navegacion web), por lo que un modelo compacto de 3,78 mil millones de parametros con licencia MIT resulta atractivo para integrarlo en pipelines propios sin depender de APIs externas.

La relevancia actual viene de dos factores. Primero, el uso de flow matching en la cabeza de accion en lugar de una cabeza de regresion o de decodificacion autoregresiva, lo que reduce la prediccion a 16 pasos de inferencia. Segundo, su tamano contenido: el repositorio ocupa 8,1 GB y los pesos estan en safetensors, de modo que puede ejecutarse en GPUs de consumo alto. El modelo se publico sin descargas ni validacion comunitaria y la model card no documenta idiomas soportados, contexto ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (backbone Qwen2.5-VL-3B congelado) con cabeza de accion DiT y flow matching |
| Parametros totales | 3.781.672.450 (~3,78 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; los pesos se publican en safetensors y la model card indica carga en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Entrada | Imagen (captura de pantalla) + instruccion de texto |
| Salida | Coordenadas (x, y) normalizadas en el rango [0, 1] |
| Configuracion de imagen | min_pixels 200704, max_pixels 401408 |
| Cabeza DiT | hidden size 512, 6 capas, 8 cabezas, dropout 0,1, 16 pasos de inferencia |
| Tamano del repositorio | 8,1 GB |

## Arquitectura y entrenamiento

El modelo combina dos componentes. El primero es Qwen2.5-VL-3B-Instruct, que actua como backbone de vision-lenguaje congelado: procesa la captura de pantalla y la instruccion de texto y produce las representaciones que alimentan la cabeza de accion. El segundo es un Diffusion Transformer (DiT) con hidden size de 512, 6 capas y 8 cabezas de atencion, entrenado con flow matching, que genera la coordenada de clic en 16 pasos de inferencia. La prediccion final es un par (x, y) normalizado, que el usuario reescala al tamano real de la imagen multiplicando por el ancho y el alto en pixeles, tal como muestra el ejemplo de inferencia de la model card.

El entrenamiento se realizo sobre el dataset [Salesforce/grounding_dataset](https://huggingface.co/datasets/Salesforce/grounding_dataset), con 20.000 muestras y 3 epocas. La model card no especifica la composicion detallada del dataset, el numero de tokens de entrenamiento, la estrategia de congelacion de capas ni el uso de tecnicas de alineacion como RLHF o DPO; dado que el backbone se describe como congelado, lo razonable es que el ajuste se concentre en la cabeza DiT con un objetivo de flow matching supervisado. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Prediccion de clic en interfaces graficas: devuelve un unico punto (x, y) normalizado dado un pantallazo y una instruccion en lenguaje natural.
- Comprension de instrucciones en lenguaje natural referidas a elementos de UI ("click on the search button").
- Grounding visual sobre capturas de pantalla en resoluciones controladas mediante los limites `min_pixels` y `max_pixels`.
- Integracion como componente de decision en agentes de automatizacion: la coordenada predicha se puede traducir a un evento de raton en el sistema anfitrion.
- Soporte de multiples imagenes y video a traves del procesador de Qwen2.5-VL (`process_vision_info` devuelve entradas de imagen y video), aunque la model card solo ejemplifica el caso de una imagen.
- No genera texto: su salida es unicamente la coordenada de clic.
- No se documenta soporte de tool calling, function calling, modo de razonamiento explicito ni capacidades multilingues.
- No se documentan capacidades de arrastrar y soltar, scroll, escritura de texto ni acciones compuestas.

## Casos de uso

- Automatizacion de pruebas de interfaz: el modelo puede localizar botones, campos y enlaces en capturas generadas por un framework de testing y devolver la coordenada donde inyectar el clic, reduciendo el mantenimiento de selectores fragiles.
- Agentes de escritorio: combinado con un planificador de tareas, cada paso del plan se traduce en una instruccion ("click on Settings") que el modelo resuelve sobre el pantallazo actual, habilitando flujos multi-paso sobre aplicaciones nativas.
- Agentes de navegacion web: integrado en un bucle con Playwright o Selenium, permite pulsar elementos descritos en lenguaje natural sin depender de rutas XPath ni de atributos del DOM.
- Asistencia de accesibilidad: conversion de instrucciones verbales o de texto en acciones de raton concretas sobre la pantalla, util para usuarios con movilidad reducida.
- RPA ligero en pymes: sustitucion de robots de automatizacion basados en coordenadas fijas, que se rompen cuando cambia el layout de la aplicacion, por un modelo que localiza el objetivo a partir de su descripcion.
- Generacion de datos de entrenamiento para modelos de grounding: uso del modelo para etiquetar capturas con puntos de clic candidatos, que despues se filtran y anaden a un dataset mayor.
- Teleoperacion asistida y demostraciones: registradores de acciones que asocian cada clic humano a la instruccion correspondiente, usando el modelo para completar o verificar la intencion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision de clic (por ejemplo, exactitud de acierto en el elemento correcto o distancia al centro del objetivo) ni comparaciones con otros modelos de GUI grounding.

## Requisitos de hardware

- VRAM estimada en bfloat16: en torno a 7,6 GB solo para los pesos (3,78 mil millones de parametros a 2 bytes), mas activaciones y cache de imagen; en la practica conviene reservar entre 10 y 12 GB.
- VRAM estimada en otras precisiones: aproximadamente 15 GB en fp32 y en torno a 4 GB en int8 y 2 GB en int4, aunque la model card no documenta pesos cuantizados ni recetas de cuantizacion, por lo que estas cifras son orientativas y requeririan conversion propia.
- GPU recomendadas: A100, H100 y L40S para despliegue en servidor; en el extremo de consumo, RTX 4090 y RTX 4080 (16 GB o mas) funcionan con holgura en bfloat16.
- GPUs de consumo: cabe en tarjetas de 16 GB o mas. En tarjetas de 12 GB (RTX 3060, RTX 4070) el margen es ajustado y puede requerir reducir `max_pixels`. En GPUs de 8 GB no es viable en bfloat16 sin cuantizar.
- Opciones de despliegue: la carga requiere el codigo propio del repositorio (clase `Qwen2_5_VLForClickPrediction` en `src/model.py`) junto con `transformers`, `accelerate` y `qwen-vl-utils`, por lo que el flujo documentado es `from_pretrained` sobre el repositorio clonado. No se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni formatos GGUF.
- Latencia y throughput: no disponibles. El unico dato relacionado es que la cabeza DiT ejecuta 16 pasos de inferencia por prediccion, lo que fija el coste de la fase de difusion, pero no se publican mediciones de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TESS-Computer/qwen-click-dit-clean | 3,78 mil millones (3B de backbone + cabeza DiT) | no disponible | Coordenadas (x, y) normalizadas | MIT | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen2.5-VL-3B-Instruct | ~3B (dato del nombre del modelo; no confirmado en la informacion proporcionada) | no disponible | Texto e instrucciones | no disponible en la informacion proporcionada | HuggingFace, modelo base de referencia |
| Otros modelos de GUI grounding (UI-TARS, ShowUI, OS-Atlas y similares) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados de rendimiento, contexto o licencia de las alternativas, por lo que la comparativa se limita a la relacion con el modelo base. La diferencia funcional principal es que Qwen2.5-VL-3B-Instruct es un modelo generalista de vision-lenguaje que devuelve texto, mientras que qwen-click-dit-clean esta especializado en emitir una unica coordenada de clic mediante una cabeza de difusion.

## Limitaciones y advertencias

- Riesgo de alucinacion espacial: el modelo siempre devuelve una coordenada, incluso si el elemento descrito no existe en la pantalla; no hay mecanismo documentado de abandono o de "no encontrado".
- Tarea unica: solo predice un punto de clic. No soporta arrastrar, hacer scroll, escribir texto, mantener pulsado ni secuencias de acciones.
- Restriccion de resolucion: el ejemplo de la model card fija `min_pixels` en 200704 y `max_pixels` en 401408. Interfaces muy densas o capturas a resolucion completa pueden degradar la precision si no se ajustan estos valores.
- Cobertura del dataset: 20.000 muestras del dataset Salesforce/grounding_dataset y 3 epocas es un volumen reducido; no se documenta la mezcla de dominios (web, escritorio, movil), por lo que el comportamiento fuera de la distribucion de entrenamiento es incierto.
- Idiomas: no se declara ningun idioma soportado. El comportamiento con instrucciones en castellano no esta verificado.
- Contexto: la model card no especifica la ventana de contexto efectiva ni como se truncan las entradas largas.
- Dependencia de codigo propio: requiere cargar una clase personalizada desde el repositorio (`src/model.py`) y un `AutoConfig` modificado con parametros de la cabeza DiT. Esto complica el despliegue en servidores de inferencia estandar y en entornos con `trust_remote_code` deshabilitado.
- Falta de validacion externa: 0 descargas y 0 likes, sin benchmarks publicados ni evaluacion de terceros. No se recomienda su uso en produccion sin una evaluacion propia sobre el dominio objetivo.
- Licencia: el modelo se publica bajo MIT, lo que permite uso comercial, pero conviene verificar la licencia aplicable al backbone Qwen2.5-VL-3B-Instruct antes de distribuirlo o integrarlo en un producto.
- Ausencia de pesos cuantizados: no se ofrecen variantes GGUF, AWQ ni GPTQ, lo que limita el despliegue en hardware de gama baja.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TESS-Computer/qwen-click-dit-clean
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/Salesforce/grounding_dataset
- La busqueda web realizada no devolvio enlaces relevantes para este modelo: los resultados corresponden a entidades no relacionadas con el proyecto (la mision TESS de la NASA, la ingenieria estructural T/E/S/S, el proveedor noruego TESS y una actriz homonima). No se han encontrado papers, blogs ni demos adicionales.
