# Valen-Team/Valen-2B-ONNX

## Resumen

Valen-2B-ONNX es la exportación a formato ONNX del modelo Valen-2B, desarrollado por Valen-Team. Se trata de un modelo multimodal especializado en toma de decisiones estructuradas: en lugar de generar texto libre, devuelve categorías, probabilidades sí/no y puntuaciones para tareas de clasificación y enrutamiento sobre entradas de texto, imagen y vídeo. El modelo base tiene 2.000 millones de parámetros y está pensado para integrarse en aplicaciones Python y JavaScript mediante los SDK oficiales, sin necesidad de PyTorch ni Transformers en tiempo de inferencia.

La relevancia de esta variante ONNX radica en su enfoque de despliegue: permite ejecutar inferencia en CPU dentro de un servicio Python (usando ONNX Runtime) o embebida en una aplicación Node.js, con procesamiento local de las entradas y funcionamiento offline una vez descargados los pesos. Esto lo sitúa en un nicho distinto al de los LLM generativos: no compite en generación de texto abierto, sino en decisiones deterministas y estructuradas para flujos de trabajo como enrutamiento de tickets, cribado de imágenes o etiquetado de vídeo.

El modelo se distribuye bajo licencia Apache 2.0, soporta inglés y chino, y forma parte de una familia con variantes de 0.8B, 2B y 4B, además de formatos nativos, ONNX y GGUF. La model card indica que existe una versión posterior, Valen-Decision-1.5-2B-ONNX, lo que conviene tener en cuenta al evaluar su adopción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal con soporte de texto, imagen y video; requiere `custom_code`) |
| Parametros totales | 2B (2.000 millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX q8-mlp (variante de cuantizacion especifica del formato ONNX); F32 como referencia completa |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (repo de 21,3 GB; descarga FP32 completa de 8,948 GB segun la model card) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo (tipo de transformer, composicion del dataset, numero de tokens de entrenamiento ni si hubo RLHF o DPO). La model card unicamente describe el comportamiento funcional: el modelo procesa entradas multimodales (texto, imagen y video) y produce decisiones estructuradas con categorias, probabilidades y puntuaciones. El tag `custom_code` en Hugging Face indica que la carga del modelo requiere codigo personalizado, y el tag `valen_qwen` sugiere una posible base derivada de la familia Qwen, aunque esto no se confirma explicitamente en la informacion proporcionada.

La innovacion tecnica destacable es el formato de salida: en lugar de decodificacion autoregresiva de texto libre, el modelo esta orientado a "Decisiones" y "SystemOne", dos formatos de peticion soportados por los SDK. La exportacion ONNX permite ejecutar la inferencia con ONNX Runtime sin dependencia de PyTorch ni de la libreria Transformers, lo que reduce el peso del stack en produccion. La model card menciona tambien una variante WebGPU para navegador en el modelo de 0.8B, pero no se indica que exista para el 2B.

## Capacidades

- Decisiones multimodales: clasificacion de texto, imagen y video con salida de categorias, probabilidades si/no y puntuaciones.
- Salida estructurada: disenado para devolver resultados parseables, no texto libre.
- Soporte de dos formatos de peticion: "Decisions" y "SystemOne".
- Procesamiento local y offline: las entradas se procesan en la maquina del usuario una vez descargados los pesos.
- Inferencia en CPU sin GPU: Python via ONNX Runtime y JavaScript/Node.js via SDK.
- Capacidades multilingues limitadas a ingles y chino.
- Integracion mediante SDK oficiales de Python y JavaScript.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso ni modo de razonamiento explicito.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo clasifica el texto de un ticket entrante en categorias predefinidas con probabilidades asociadas, lo que permite derivarlo automaticamente al equipo correspondiente. La model card incluye un tutorial especifico de "ticket routing" en su Cookbook.
- Cribado de imagenes de producto: evaluacion automatica de imagenes para determinar si cumplen criterios de calidad o politica antes de publicarse en un catalogo, usando las salidas si/no y las puntuaciones del modelo.
- Etiquetado de video: asignacion de etiquetas y decisiones a fragmentos de video para indexacion o moderacion, con un tutorial dedicado de "video tagging" en el Cookbook.
- Servicio Python en CPU: despliegue de un microservicio de clasificacion sin GPU, usando ONNX Runtime y el SDK de Python, adecuado para entornos con presupuesto de infraestructura limitado.
- Inferencia embebida en Node.js: integracion del modelo directamente en una aplicacion JavaScript para clasificar entradas en el propio proceso, sin llamadas a un servicio externo.
- Prototipado sin descarga de pesos: uso de la API HTTP gratuita y la demo web para validar el comportamiento del modelo antes de comprometerse con la descarga y el despliegue local.
- Evaluacion de decisiones en juegos o entornos simulados: la model card incluye una demo de decisiones en Sokoban, lo que sugiere uso en agentes que eligen acciones discretas en entornos con estado visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las evaluaciones del modelo nativo en la pagina de Valen-4B, pero no incluye cifras concretas para esta variante ONNX. Los unicos datos de rendimiento medidos que se aportan son de memoria: pico de RSS en CPU para texto de 5,98 GiB en el modelo de 2B (excluyendo vision), y un tamano de descarga FP32 completa de 8,948 GB.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica para el modo CPU; no se proporcionan cifras de VRAM para despliegue en GPU.
- Memoria RAM: pico de RSS medido en Linux CPU para texto de 5,98 GiB (excluyendo vision). Imagenes, video y entradas mas largas requieren mas memoria.
- GPU recomendadas: no se especifican modelos concretos. La model card menciona Python ONNX CUDA como opcion para despliegue en GPU, sin detallar requisitos.
- GPU de consumo: no se confirma compatibilidad con GPUs de consumo; el enfoque principal es CPU.
- Opciones de despliegue: ONNX Runtime (Python), SDK de JavaScript para Node.js, Python ONNX CUDA para GPU. La model card indica que el soporte en llama.cpp u Ollama oficiales sin modificar no esta reclamado; el formato GGUF usa un runtime personalizado de Valen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Valen-2B-ONNX | 2B | no disponible | ONNX | Apache 2.0 | Decisiones multimodales estructuradas |
| Valen-0.8B-ONNX | 0.8B | no disponible | ONNX (incluye WebGPU) | Apache 2.0 | Decisiones multimodales, prototipos en equipos cotidianos |
| Valen-4B-ONNX | 4B | no disponible | ONNX | Apache 2.0 | Decisiones multimodales, prioriza calidad sobre memoria |
| Valen-Decision-1.5-2B-ONNX | 2B | no disponible | ONNX | no disponible | Version posterior de la familia, recomendada por el autor |

La comparativa se limita a la propia familia Valen, ya que la informacion disponible no identifica modelos de terceros directamente comparables en la tarea de decisiones multimodales estructuradas con este formato de salida.

## Limitaciones y advertencias

- Version desactualizada: la model card indica que Valen-Decision-1.5-2B-ONNX es la version nueva y recomienda su uso, por lo que este modelo puede quedar sin mantenimiento.
- Idiomas limitados: solo ingles y chino; no se declara soporte de castellano ni de otros idiomas.
- Contexto desconocido: no se publica la longitud de contexto, lo que dificulta planificar entradas largas.
- Ambito funcional restringido: el modelo esta disenado para decisiones estructuradas, no para generacion de texto abierto, codigo o razonamiento general.
- Cuantizacion limitada: la model card advierte que las variantes GGUF Q4/Q5 fallaron los controles de calidad y solo se recomiendan F32/Q8_0; para ONNX se menciona q8-mlp, sin datos de degradacion de calidad publicados.
- Soporte de video en paquetes precompilados: la model card senala que el GGUF precompilado 0.1.0 no compila soporte directo de video, y que las pruebas historicas de video con compilacion desde fuente no cualifican el paquete precompilado.
- Validacion parcial: la model card indica que la validacion P1 solo cubre imagenes fijas sobre el binario precompilado exacto con 0.8B Q8_0, sin extender ese alcance a otros tamanos.
- Riesgo de alucinacion y sesgos: no se documentan evaluaciones de sesgo ni tasas de error en la informacion disponible.
- Dependencia de codigo personalizado: el tag `custom_code` implica que la carga no es estandar y requiere los SDK oficiales.
- Uso comercial: la licencia Apache 2.0 lo permite, pero conviene verificar las notas de licencia de los medios y datasets de ejemplo del Cookbook.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Valen-Team/Valen-2B-ONNX
- Modelo base: https://huggingface.co/Valen-Team/Valen-2B
- Version posterior recomendada: https://huggingface.co/Valen-Team/Valen-Decision-1.5-2B-ONNX
- Variante 0.8B: https://huggingface.co/Valen-Team/Valen-0.8B-ONNX
- Variante 4B: https://huggingface.co/Valen-Team/Valen-4B-ONNX
- Evaluaciones del modelo nativo: https://huggingface.co/Valen-Team/Valen-4B#evaluation
- SDK de Python: https://github.com/valen-team/valen-sdk-python
- SDK de JavaScript: https://github.com/valen-team/valen-sdk-js
- Repositorio del proyecto: https://github.com/Valen-Team/Valen
- Demo web y API gratuita: https://valen-team.github.io/
- Cookbook oficial: https://valen-team.github.io/cookbook/
- Guia de seleccion de version: https://valen-team.github.io/docs/valen/choosing/
- Validacion y rendimiento: https://valen-team.github.io/cookbook/validation/
- Tutorial de enrutamiento de tickets: https://valen-team.github.io/cookbook/ticket-routing/
- Tutorial de cribado de imagenes de producto: https://valen-team.github.io/cookbook/product-screening/
- Tutorial de etiquetado de video: https://valen-team.github.io/cookbook/video-tagging/
