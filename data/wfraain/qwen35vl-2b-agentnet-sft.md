# WFRaain/qwen35vl-2b-agentnet-sft

## Resumen

`WFRaain/qwen35vl-2b-agentnet-sft` es un checkpoint multimodal (vision-language) derivado de `Qwen/Qwen3.5-2B` y publicado por el usuario WFRaain en HuggingFace. Segun las etiquetas del repositorio, se trata de un ajuste fino supervisado (SFT) orientado a tareas de agente de interfaz grafica (`gui-agent`), entrenado con la pila Megatron y distribuido en formato safetensors. El repositorio tiene acceso restringido (gated): es necesario aceptar condiciones en HuggingFace antes de descargarlo.

El interes del modelo radica en su tamano reducido (la denominacion "2B" del modelo base apunta a unos 2.000 millones de parametros) combinado con capacidades de vision, lo que lo situa en el segmento de agentes de GUI que pueden ejecutarse en hardware de gama media o incluso consumer. Ese segmento cubre casos como automatizacion de escritorio, testing de interfaces y extraccion de datos de pantallas.

Ahora bien, la ficha publicada es practicamente vacia: no incluye model card descriptiva, no declara idiomas, no especifica la longitud de contexto, no documenta el dataset de entrenamiento ni publica resultados de benchmarks. El modelo acumula 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de su comportamiento. Cualquier evaluacion en produccion deberia partir de una validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo vision-language (multimodal) basado en transformer, derivado de `Qwen/Qwen3.5-2B`; detalles internos no disponibles |
| Parametros totales | Aproximadamente 2.000 millones segun la denominacion del modelo base (`Qwen/Qwen3.5-2B`); cifra no confirmada en la ficha del repositorio |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la ficha; el repositorio distribuye pesos en safetensors. No se confirman conversiones a GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible |
| Licencia | `other` (acceso restringido; requiere aceptar condiciones en HuggingFace) |
| Formato de pesos | Safetensors |
| Modelo base | `Qwen/Qwen3.5-2B` |
| Tamano del repositorio | 13,7 GB |
| Fecha de creacion | 24 de septiembre de 2026 |
| Ultima actualizacion | 24 de septiembre de 2026 |

## Arquitectura y entrenamiento

La informacion disponible solo permite afirmar que se trata de un modelo derivado del base `Qwen/Qwen3.5-2B` mediante ajuste fino supervisado (SFT), con la etiqueta `megatron` que indica que el entrenamiento se realizo con la pila Megatron (probablemente Megatron-Core o similares para entrenamiento distribuido a gran escala). La etiqueta `qwen3.5-vl` sugiere que el modelo conserva o incorpora el encoder de vision de la familia Qwen3.5-VL, lo que habilita entrada de imagenes ademas de texto.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset (la etiqueta `agentnet` apunta a un corpus de tipo AgentNet para trayectorias de agente, pero no se detalla su contenido), la posible aplicacion de RLHF, DPO u otras tecnicas de alineamiento posteriores al SFT, ni innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, destilacion, etc.). Tampoco se especifica si el ajuste cubre todas las capas o solo un subconjunto, ni la resolucion de imagen soportada. Todos estos datos deben considerarse no disponibles.

## Capacidades

Las siguientes capacidades se infieren de las etiquetas del repositorio (`qwen3.5-vl`, `gui-agent`, `sft`, `megatron`) y no estan documentadas explicitamente en la ficha:

- Comprension de imagenes: el modelo hereda la capacidad multimodal del base Qwen3.5-VL, por lo que deberia aceptar capturas de pantalla como entrada junto con instrucciones en texto.
- Interaccion con interfaces graficas: la etiqueta `gui-agent` indica que ha sido ajustado para tareas de agente sobre interfaces, presumiblemente prediciendo acciones sobre elementos de la pantalla.
- Generacion de texto: capacidad heredada del modelo base, aunque el ajuste fino sobre datos de agente puede haber desplazado la distribucion hacia salidas estructuradas y degradado la generacion abierta.
- Soporte de tool calling / function calling: no disponible de forma explicita; no se documenta.
- Soporte de agentes y razonamiento multi-paso: inferido de la orientacion `agentnet`/`gui-agent`, sin confirmacion documental.
- Capacidades multilingues: no disponibles; la ficha no declara idiomas.
- Modo "thinking" o capacidades especiales (audio, video): no disponibles.

## Casos de uso

- Automatizacion de escritorio (RPA de nueva generacion): el modelo recibe una captura de pantalla y una instruccion en lenguaje natural y predice la accion a ejecutar sobre la interfaz, lo que permite sustituir selectores fragiles por comprension visual del estado de la pantalla.
- Testing automatizado de interfaces: dado un flujo de usuario descrito en texto, el agente puede recorrer la aplicacion y detectar pantallas rotas o elementos no localizados, integrándose en pipelines de CI para pruebas end-to-end sin guiones codificados a mano.
- Extraccion estructurada de datos desde capturas: conversion de tablas, formularios o paneles de aplicaciones legacy (sin API) en JSON u otro formato estructurado a partir de la imagen.
- Asistencia de accesibilidad: interpretacion de la pantalla para describir o resumir la interfaz a un usuario con discapacidad visual, o para traducir instrucciones verbales en acciones concretas sobre la aplicacion.
- Automatizacion de back-office: procesamiento de aplicaciones internas que solo disponen de interfaz web o de escritorio, como introduccion de datos en ERP o CRM sin API disponible.
- Entrenamiento y destilacion de agentes mayores: uso del modelo como generador de trayectorias sinteticas sobre interfaces para alimentar el entrenamiento de modelos mas grandes, aprovechando su bajo coste de inferencia.
- Prototipado en local: al tratarse de un modelo de aproximadamente 2.000 millones de parametros, puede servir para validar rapidamente hipotesis de producto en una maquina con GPU de consumo, siempre que se acepte el acceso restringido y se valide su calidad de forma independiente.

En todos los casos, la ausencia de benchmarks y de licencia clara obliga a realizar una evaluacion previa en el dominio concreto antes de cualquier despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha de HuggingFace no incluye tabla de evaluaciones, no se ha publicado paper asociado y las busquedas web realizadas no devolvieron documentacion tecnica relacionada con el modelo. No se dispone por tanto de cifras de MMLU, HumanEval, GSM8K, benchmarks de agentes de GUI (ScreenSpot, OSWorld, AndroidControl u otros) ni comparaciones verificables con alternativas.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del numero de parametros indicado en el nombre del modelo base, no datos confirmados por el autor:

- VRAM para inferencia en fp16/bf16: en torno a 4-6 GB solo para los pesos, mas el consumo del encoder de vision, el cache KV y el overhead del runtime; en la practica se recomienda reservar 8 GB o mas.
- VRAM en cuantizacion de 8 bits: aproximadamente 2,5-3,5 GB de pesos, con margen adicional para activaciones y cache.
- VRAM en cuantizacion de 4 bits: aproximadamente 1,5-2,5 GB de pesos, si bien no se confirma que existan pesos cuantizados publicados.
- GPU recomendadas: tarjetas de consumo como RTX 3060 12 GB, RTX 4070, RTX 4080 o RTX 4090 son suficientes para inferencia en precision reducida; para entrenamiento o ajuste fino adicional se recomienda A100 40/80 GB, H100 o similar.
- Compatibilidad con GPU de consumo: probable en modelos con 8 GB de VRAM o mas si se dispone de pesos cuantizados; no confirmado por el autor.
- Opciones de despliegue: no documentadas. El repositorio solo publica safetensors, por lo que se asume compatibilidad con transformers, vLLM o TGI, y con llama.cpp/Ollama unicamente si se generan conversiones a GGUF (no publicadas).
- Latencia y throughput: no disponibles. No se han publicado mediciones.

Nota: el repositorio ocupa 13,7 GB, un tamano notablemente superior al esperable para un modelo de 2.000 millones de parametros en fp16 (en torno a 4-5 GB). Esto sugiere la presencia de artefactos adicionales (estados de optimizador, multiples copias de pesos o checkpoints intermedios) que no se detallan en la ficha.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables dentro de la informacion proporcionada. La tabla siguiente recoge unicamente lo que puede afirmarse con la informacion disponible:

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| `WFRaain/qwen35vl-2b-agentnet-sft` | ~2B (segun nombre del base) | No disponible | `other` (gated) | Publicado, sin benchmarks |
| `Qwen/Qwen3.5-2B` (modelo base) | ~2B (segun denominacion) | No disponible | No disponible | Referenciado como base |
| Otros agentes de GUI de tamano similar (UI-TARS, OS-Atlas, SeeClick, Qwen2.5-VL-3B) | No disponible | No disponible | No disponible | No evaluados en esta comparativa por falta de datos |

No es posible establecer una comparacion cuantitativa fiable con alternativas sin datos de benchmarks publicados.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al no existir model card ni descripcion del dataset, se desconoce la composicion demografica, linguistica o de dominio de los datos de SFT.
- Riesgo de alucinacion: sin evaluar. Un ajuste SFT sobre trayectorias de agente puede producir acciones plausibles pero incorrectas sobre interfaces no vistas durante el entrenamiento, con riesgo de efectos secundarios reales (clics destructivos, envio de formularios, borrado de datos).
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan declarados. No se puede asumir un rendimiento multilingue correcto.
- Licencia: la licencia `other` con acceso restringido (gated) no permite determinar si el uso comercial esta autorizado. Es imprescindible revisar las condiciones del repositorio y, en su caso, las del modelo base `Qwen/Qwen3.5-2B` antes de cualquier uso en produccion.
- Falta de validacion: 0 descargas y 0 likes implican ausencia de revision por parte de la comunidad. No existen informes independientes de calidad, robustez ni seguridad.
- Degradacion potencial de capacidades generales: el ajuste sobre datos de agente puede haber reducido el rendimiento en generacion abierta, razonamiento o conversacion respecto al modelo base.
- Trazabilidad del entrenamiento: no se documentan hiperparametros, epocas, datos exactos ni criterios de seleccion de checkpoint, lo que dificulta la reproducibilidad.
- Tamano del repositorio: los 13,7 GB sugieren artefactos adicionales no descritos; conviene inspeccionar el contenido antes de descargarlo.
- Ausencia de datos de seguridad: no hay evaluaciones de robustez frente a prompt injection, contenido malicioso en pantalla o instrucciones adversarias embebidas en imagenes, un vector de ataque relevante en agentes de GUI.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WFRaain/qwen35vl-2b-agentnet-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B

Nota sobre la busqueda web: las consultas realizadas no devolvieron ningun enlace relacionado con este modelo. Los resultados obtenidos correspondian a contenidos no relacionados (carteles de propaganda sovietica) y se han descartado por no ser pertinentes. No se han localizado papers, blogs, repositorios de codigo ni demos asociados al modelo.
