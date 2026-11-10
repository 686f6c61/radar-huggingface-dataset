# Valen-Team/Valen-4B-ONNX

## Resumen

Valen-4B-ONNX es la distribucion en formato ONNX del modelo multimodal Valen-4B, desarrollado por Valen-Team. No es un modelo generativo de texto al uso: esta especializado en tareas de decision estructurada sobre texto, imagen y video, devolviendo categorias, probabilidades si/no y puntuaciones de confianza para flujos como enrutado de tickets, cribado de imagenes o etiquetado de video. La publicacion de la variante ONNX responde a la necesidad de desplegar estas capacidades en entornos sin GPU, incluyendo servicios Python sobre CPU y aplicaciones Node.js con inferencia embebida.

El modelo base Valen-4B cuenta con aproximadamente 4.000 millones de parametros y soporta los idiomas ingles y chino. La version ONNX se distribuye bajo licencia Apache 2.0, con un tamano de repositorio de 48,9 GB que incluye componentes de vision ademas de los pesos de texto. La inferencia en Python se ejecuta mediante ONNX Runtime sin dependencia de PyTorch ni de Transformers, lo que reduce el peso del stack y simplifica el empaquetado en produccion.

La relevancia actual del modelo radica en su enfoque: en lugar de competir en generacion abierta, ofrece una API de decision con salidas estructuradas y probabilidades calibradas, un patron cada vez mas demandado para automatizar clasificacion y triaje en pipelines. La model card indica que existe una version mas reciente, Valen-Decision-1.5-4B-ONNX, por lo que esta ficha describe la version 4B original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal con componentes de texto y vision; detalles de la arquitectura no especificados en la informacion proporcionada) |
| Parametros totales | aproximadamente 4.000 millones (denominacion 4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX q8-mlp (variante de cuantizacion especifica del formato ONNX); F32 en pesos nativos; Q8_0 y F32 cualificados en GGUF; Q4/Q5 de GGUF no superaron los controles de calidad |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (distribucion principal); existen variantes nativas y GGUF del modelo base |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base Valen-4B: no se especifica si emplea un transformer denso, una mezcla de expertos ni el tipo de encoder visual. Lo que si se documenta es su naturaleza multimodal, con procesamiento de texto, imagen y video, y una salida orientada a decision estructurada (categorias, probabilidades si/no y scores) en lugar de generacion libre de texto. La distribucion ONNX incluye componentes de vision ademas de los pesos de texto, tal como refleja el tamano de descarga completa en FP32 de 18,253 GB para la variante 4B.

Tampoco se dispone de datos sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card menciona dos formatos de peticion soportados, Decisions y SystemOne, siendo Decisions el recomendado para nuevos usuarios. La innovacion tecnica destacable es el empaquetado ONNX con inferencia via ONNX Runtime sin PyTorch ni Transformers, y la disponibilidad de SDK oficiales en Python y JavaScript que abstraen la carga del modelo y el procesamiento local de entradas.

## Capacidades

- Decision estructurada multimodal: genera categorias, probabilidades si/no y puntuaciones para texto, imagen y video.
- Procesamiento de imagen: cribado y clasificacion de imagenes (por ejemplo, validacion de imagenes de producto).
- Procesamiento de video: etiquetado y clasificacion de contenido audiovisual.
- Enrutado y triaje: clasificacion de tickets y solicitudes en categorias predefinidas.
- Salidas con incertidumbre: la model card menciona politicas de incertidumbre y probabilidades calibradas en los ejemplos del cookbook.
- Soporte de dos formatos de peticion: Decisions y SystemOne.
- Inferencia local y offline: una vez descargados, los modelos se ejecutan desde cache sin conexion y las entradas se procesan localmente.
- Idiomas: ingles y chino.
- No se documenta en la informacion disponible soporte de tool calling, function calling, agentes multi-paso ni modo de razonamiento explicito.

## Casos de uso

- Enrutado de tickets de soporte: el modelo clasifica el ticket entrante en una categoria predefinida con probabilidad asociada, lo que permite derivarlo automaticamente al equipo correcto. El cookbook oficial incluye un tutorial especifico de ticket routing.
- Cribado de imagenes de producto: validacion automatica de imagenes enviadas por vendedores o usuarios para comprobar que cumplen los criterios de la plataforma antes de publicarse, usando la salida si/no y el score de confianza.
- Etiquetado de video: clasificacion de clips en categorias para catalogacion, moderacion o indexacion de una videoteca, aprovechando el soporte de video del modelo.
- Servicio Python en CPU sin GPU: despliegue de un microservicio de clasificacion con ONNX Runtime, sin PyTorch ni Transformers, con un pico de RSS medido de 14,74 GiB para texto en el modelo 4B en Linux.
- Inferencia embebida en Node.js: integracion del modelo dentro de una aplicacion JavaScript mediante el SDK oficial, ejecutando la clasificacion en el propio proceso sin servicio externo.
- Procesamiento offline con requisitos de privacidad: al ejecutarse desde cache local y procesar las entradas en la maquina, encaja en entornos donde los datos no pueden salir de la infraestructura.
- Evaluacion comparativa de tamanos: uso de las variantes 0.8B, 2B y 4B para medir el equilibrio entre calidad de decision y presupuesto de memoria en las tareas propias antes de fijar un modelo en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card enlaza a las evaluaciones del modelo nativo en la pagina de Valen-4B, pero no incluye cifras en el contenido proporcionado. Los unicos datos de rendimiento disponibles son medidas de memoria: pico de RSS en CPU Linux para texto de 14,74 GiB en el modelo 4B, 5,98 GiB en el 2B y 2,76 GiB en el 0,8B, excluyendo vision.

## Requisitos de hardware

- VRAM: no aplica para el despliegue CPU documentado; la inferencia ONNX en Python esta pensada para ejecutarse en CPU. Para GPU se menciona Python ONNX CUDA como opcion de despliegue, sin cifras de VRAM publicadas.
- Memoria RAM: pico de RSS en CPU Linux de 14,74 GiB para texto en el modelo 4B; imagenes, video y entradas mas largas requieren mas memoria. La descarga completa en FP32 es de 18,253 GB, pero el tamano de fichero no equivale al requisito de RAM.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- GPU de consumo: no se documenta compatibilidad ni requisitos para GPUs de consumo; el enfoque principal es CPU.
- Opciones de despliegue: ONNX Runtime mediante los SDK oficiales de Python y JavaScript; servicio Python en CPU; inferencia embebida en Node.js; Python ONNX CUDA para GPU; runtime custom de Valen para GGUF en servicios C++ Linux sobre CPU; SGLang/vLLM mencionados como backends en la guia de versiones. No se reclama soporte en llama.cpp u Ollama oficiales sin modificar.
- Latencia y throughput: no disponibles en la informacion proporcionada; la model card indica explicitamente que no se promete rendimiento no medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Valen-4B-ONNX | ~4B | no disponible | Decision estructurada multimodal (texto, imagen, video) en ONNX | Apache 2.0 | Hugging Face, SDK Python y JS |
| Valen-2B-ONNX | ~2B | no disponible | Misma familia, menor presupuesto de memoria (5,98 GiB RSS texto) | Apache 2.0 | Hugging Face |
| Valen-0.8B-ONNX | ~0,8B | no disponible | Misma familia, orientado a equipos cotidianos y variante WebGPU para navegador | Apache 2.0 | Hugging Face |
| Valen-Decision-1.5-4B-ONNX | no disponible | no disponible | Version mas reciente de la familia, recomendada por el autor | no disponible | Hugging Face |

No se dispone de informacion sobre modelos de otras familias comparables en la misma categoria de decision estructurada multimodal.

## Limitaciones y advertencias

- Idiomas limitados a ingles y chino; no se documenta soporte de castellano.
- No se especifican sesgos conocidos en la informacion proporcionada.
- Riesgo de alucinacion: no evaluado en la informacion disponible; al tratarse de un modelo de decision con salidas categoricas y probabilidades, conviene aplicar politicas de umbral e incertidumbre en produccion, como sugiere el cookbook oficial.
- Las cifras de memoria son picos medidos en CPU Linux solo para texto y excluyen vision; imagenes, video y entradas largas consumen mas.
- En GGUF, las cuantizaciones Q4 y Q5 no superaron los controles de calidad; solo F32 y Q8_0 estan cualificados. Los tests historicos de video con compilacion desde fuente no cualifican el paquete GGUF precompilado 0.1.0, que no compila soporte directo de video.
- No se reclama soporte en llama.cpp u Ollama oficiales sin modificar.
- La validacion P1 cubre solo imagenes fijas sobre el binario precompilado exacto con 0.8B Q8_0; ese alcance no se extiende a otros tamanos.
- Existe una version mas reciente (Valen-Decision-1.5-4B-ONNX) que el autor recomienda; esta ficha corresponde a la version anterior.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las notas de licencia y procedencia de medios que acompanan a los ejemplos del cookbook.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Valen-Team/Valen-4B-ONNX
- Modelo base: https://huggingface.co/Valen-Team/Valen-4B
- Version mas reciente: https://huggingface.co/Valen-Team/Valen-Decision-1.5-4B-ONNX
- Variante 2B: https://huggingface.co/Valen-Team/Valen-2B-ONNX
- Variante 0.8B: https://huggingface.co/Valen-Team/Valen-0.8B-ONNX
- SDK Python: https://github.com/valen-team/valen-sdk-python
- SDK JavaScript: https://github.com/valen-team/valen-sdk-js
- API gratuita y demo web: https://valen-team.github.io/
- Cookbook oficial: https://valen-team.github.io/cookbook/
- Guia de seleccion de version: https://valen-team.github.io/docs/valen/choosing/
- Alcance de validacion y rendimiento: https://valen-team.github.io/cookbook/validation/
- Tutorial de enrutado de tickets: https://valen-team.github.io/cookbook/ticket-routing/
- Tutorial de cribado de imagenes de producto: https://valen-team.github.io/cookbook/product-screening/
- Tutorial de etiquetado de video: https://valen-team.github.io/cookbook/video-tagging/
- Demo de decisiones imagen y video: https://raw.githubusercontent.com/Valen-Team/Valen/main/assets/demos/Valen.mp4
- Demo Sokoban: https://raw.githubusercontent.com/Valen-Team/Valen/main/assets/demos/games/valen-sokoban.mp4
