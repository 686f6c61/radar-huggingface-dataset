# strangelab/docling-tableformer-fast-offline

## Resumen

Docling Fast TableFormer for offline PDF tables es un paquete de artefactos de inferencia publicado por el usuario strangelab que reúne los cinco ficheros de modelo necesarios para ejecutar el modo Fast de extracción de tablas de Docling sobre PDF con texto embebido, sin conexión a red. No es un modelo entrenado desde cero: es una selección curada de pesos upstream de docling-project (el modelo de layout Heron y TableFormer V1 Fast) empaquetada para su uso en sistemas air-gapped. El bundle pesa 317,12 MB frente a los 530,00 MB de la caché estándar de Docling para ese mismo modo, una reducción del 40,2 %, manteniendo los bytes originales de cada artefacto.

El problema que resuelve es operativo: Docling descarga sus modelos en tiempo de ejecución, lo que rompe despliegues en entornos sin salida a internet o con requisitos de reproducibilidad estricta. Este repositorio permite prefijar los artefactos y apuntar el CLI a un directorio local con `--artifacts-path`, limitando la carga a los ficheros que realmente se usan en modo Fast con texto embebido (sin OCR y sin modo Accurate).

Es relevante ahora porque la conversión de documentos a Markdown/JSON para pipelines RAG y de agentes exige extracción fiable de tablas, y la mayoría de soluciones dependen de descargas en caliente. El paquete está pensado para Docling 2.154.0 y se distribuye con licencias duales CDLA Permissive 2.0 y Apache 2.0, heredadas de los artefactos upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline Docling: modelo de layout Heron + TableFormer V1 Fast (reconocimiento de estructura de tablas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen los pesos upstream en safetensors, sin recuantizar) |
| Idiomas soportados | no disponible |
| Licencia | CDLA Permissive 2.0 y Apache 2.0 |
| Formato de pesos | safetensors (repositorio etiquetado con `safetensors`), mas ficheros de configuracion del bundle |
| Tamano del repositorio | 0,3 GB (317,12 MB en cinco ficheros de modelo) |
| Version de Docling soportada | 2.154.0 |
| Pipeline declarado | image-to-text |
| Libreria | docling |

## Arquitectura y entrenamiento

El bundle no define una arquitectura propia: agrupa dos componentes de Docling. El primero es el modelo de layout `docling-layout-heron`, que segmenta la pagina y localiza regiones (texto, tablas, figuras). El segundo es `TableFormer V1 Fast`, un modelo de reconocimiento de estructura de tablas que predice la organizacion de filas, columnas y celdas a partir de la region detectada. Ambos se ejecutan en cadena dentro del pipeline de conversion de Docling.

No se proporcionan en la informacion disponible datos sobre el corpus de entrenamiento, numero de tokens, composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se detalla la innovacion arquitectonica interna de TableFormer mas alla de su identificacion como variante "Fast". La contribucion tecnica de este repositorio es el empaquetado: selecciona exclusivamente los ficheros que Docling carga en modo Fast con texto embebido, eliminando artefactos de OCR y de modo Accurate, y conserva los bytes originales de cada peso.

El autor declara una verificacion de consistencia: el modelo upstream Fast se ejecuto sobre 34 paginas completas en Docling 2.154.0, correspondientes a tres informes anuales y cuatro paginas de stress presupuestario de EE. UU., comparando la salida con el modelo Fast instalado de forma estandar.

## Capacidades

- Extraccion de tablas en PDF con texto embebido, en modo Fast, generando estructura de tabla (filas, columnas, celdas).
- Deteccion de layout de pagina mediante el modelo Heron, necesaria para localizar tablas antes de su reconocimiento.
- Conversion de documentos a Markdown y JSON a traves del CLI de Docling (`--to md --to json`).
- Operacion completamente offline una vez descargados los artefactos, apta para sistemas air-gapped.
- Integracion nativa con el CLI de Docling mediante `--artifacts-path`, sin parchear la libreria.
- No soporta OCR: el bundle esta limitado a PDF con capa de texto.
- No cubre el modo Accurate de Docling ni el procesamiento de escaneos.
- No se documentan capacidades de tool calling, agentes, razonamiento multilingue ni modos de pensamiento; el pipeline es image-to-text especializado en documentos.

## Casos de uso

- Despliegue en entornos air-gapped: descarga previa del bundle en una maquina con red y traslado del directorio a un sistema aislado; Docling arranca con `--artifacts-path docling-fast-models` sin intentar contactar con Hugging Face, lo que encaja en administraciones publicas y banca con restricciones de salida.
- Pipelines RAG sobre informes financieros: extraccion de tablas de memorias anuales a Markdown para indexarlas en un almacen vectorial; el modo Fast prioriza velocidad y el bundle cubre exactamente los artefactos de ese modo, reduciendo el espacio en disco del contenedor.
- Procesamiento por lotes de documentacion contractual: conversion masiva de PDF con texto a JSON estructurado en un job nocturno, con tiempos de arranque predecibles al no haber descargas en caliente.
- Reproducibilidad en investigacion: fijar la version de Docling (2.154.0) y los bytes exactos de los pesos permite repetir experimentos de extraccion de tablas con resultados identicos meses despues.
- Contenedores de tamano reducido: al recortar 212,88 MB respecto a la cache estandar, se disminuye la imagen Docker y el tiempo de arranque en frio de servicios de conversion documental.
- Cumplimiento y auditoria documental: conversion local de PDF presupuestarios y regulatorios sin enviar documentos a servicios externos, manteniendo la trazabilidad de los artefactos usados mediante el manifiesto `config.json`.
- Preprocesado para agentes documentales: generar representaciones Markdown de tablas que alimenten a un LLM posterior, separando la fase de parsing (este bundle) de la fase de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta una verificacion cualitativa de consistencia sobre 34 paginas (tres informes anuales y cuatro paginas de stress presupuestario) comparando con el modelo Fast instalado, sin cifras de precision, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; por el tamano del bundle (317,12 MB de pesos) es compatible con GPU de gama consumer, aunque no se publican cifras de memoria pico.
- GPU recomendadas: no especificadas por el autor. Dado el tamano reducido de los modelos de layout y TableFormer, cualquier GPU con soporte CUDA para PyTorch es suficiente en la practica; no se documentan requisitos minimos.
- Compatibilidad con GPU consumer: previsiblemente si, al tratarse de modelos de vision de menos de 0,5 GB en total, aunque no hay confirmacion explicita en la model card.
- Opciones de despliegue: CLI de Docling (`python -m pip install 'docling==2.154.0'`) con `--artifacts-path`; descarga via `hf download`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de pipeline.
- Latencia y throughput: no disponibles. El modo Fast esta disenado para ser mas rapido que Accurate, pero no se aportan medidas.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| strangelab/docling-tableformer-fast-offline | Bundle de artefactos Docling (Heron + TableFormer Fast) | 317,12 MB | no disponible | CDLA Permissive 2.0 + Apache 2.0 | Extraccion offline de tablas en PDF con texto |
| docling-project/docling-models (upstream) | Repositorio upstream de modelos Docling | Incluye todos los modos (Fast, Accurate, OCR) | no disponible | CDLA Permissive 2.0 | Conjunto completo de artefactos Docling |
| docling-project/docling-layout-heron (upstream) | Modelo de layout | no disponible | no disponible | Apache 2.0 | Deteccion de regiones de pagina |

La diferencia principal frente a los repositorios upstream es el alcance: este bundle contiene solo los cinco ficheros que Docling carga en modo Fast con texto embebido, mientras que los upstream incluyen artefactos adicionales para OCR y modo Accurate. No se dispone de datos de rendimiento comparativo con alternativas de extraccion de tablas de otros ecosistemas.

## Limitaciones y advertencias

- Solo funciona con PDF que tengan capa de texto embebida; los escaneos requieren OCR, que este bundle no incluye.
- No cubre el modo Accurate de Docling; quien necesite mayor precision en tablas complejas debera usar el conjunto completo de artefactos.
- Versionado estricto: el autor valida con Docling 2.154.0; otras versiones pueden esperar rutas o ficheros distintos y fallar al resolver los artefactos.
- No es un modelo entrenado ni afinado por el autor: cualquier sesgo o limitacion de Heron y TableFormer se hereda sin cambios.
- Riesgo de errores de estructura en tablas con celdas combinadas, tablas anidadas o maquetacion atipica; no se publican tasas de error.
- Ausencia de datos de benchmarks, idiomas soportados y requisitos de hardware en la model card, lo que dificulta estimar calidad y coste antes de desplegar.
- Popularidad nula en el momento del registro (0 descargas, 0 likes): no hay validacion de la comunidad sobre el bundle.
- Licencias duales (CDLA Permissive 2.0 y Apache 2.0) heredadas de los upstream; conviene revisar ambas antes de uso comercial y conservar los ficheros `LICENSE-Apache-2.0.txt` y `LICENSE-CDLA-Permissive-2.0.txt`.
- El autor no ofrece garantias de mantenimiento ni actualizaciones tras cambios en Docling.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/strangelab/docling-tableformer-fast-offline
- Modelo de layout Heron (upstream, Apache 2.0): https://huggingface.co/docling-project/docling-layout-heron/tree/8f39ad3c0b4c58e9c2d2c84a38465abf757272d8
- TableFormer V1 Fast (upstream, CDLA Permissive 2.0): https://huggingface.co/docling-project/docling-models/tree/fc0f2d45e2218ea24bce5045f58a389aed16dc23/model_artifacts/tableformer/fast
- Documentacion de Docling sobre prefetch y uso offline: https://docling-project.github.io/docling/usage/advanced_options/#model-prefetching-and-offline-usage
