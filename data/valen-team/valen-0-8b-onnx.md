# Valen-Team/Valen-0.8B-ONNX

## Resumen

Valen-0.8B-ONNX es la variante en formato ONNX del modelo Valen-0.8B, desarrollado por Valen-Team. Se trata de un modelo multimodal de 0,8 mil millones de parámetros orientado a la toma de decisiones estructuradas: clasificación de tickets, cribado de imágenes, etiquetado de vídeo y decisiones de tipo sí/no con probabilidades asociadas. El modelo acepta texto, imagen y vídeo como entradas y devuelve categorías, probabilidades y puntuaciones en lugar de texto libre, lo que lo hace adecuado para integrarse en flujos de trabajo automatizados.

La relevancia de esta variante ONNX radica en su despliegue sin GPU: la inferencia en Python utiliza ONNX Runtime sin requerir PyTorch ni Transformers, y también puede embeberse en aplicaciones Node.js mediante un SDK JavaScript. El modelo base Valen-0.8B se distribuye bajo licencia Apache 2.0 y soporta inglés y chino. El repositorio ocupa 10,4 GB e incluye componentes de visión además de los pesos de texto.

Según la model card, existe una versión posterior, Valen-Decision-1.5-0.8B-ONNX, publicada como sucesora. El modelo está pensado para prototipos locales y equipos de sobremesa: el pico de RSS medido en CPU Linux para texto es de 2,76 GiB, y la descarga FP32 completa es de 3,505 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal con soporte de texto, imagen y vídeo; código personalizado, requiere `trust_remote_code`) |
| Parametros totales | 0,8 mil millones (0.8B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F32 y Q8_0 (variantes nativas/GGUF cualificadas); ONNX q8-mlp; Q4/Q5 de GGUF no superaron los controles de calidad |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (variante del modelo base Valen-0.8B; también existen nativo y GGUF) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del transformer ni la composición del dataset de entrenamiento. El modelo se presenta como multimodal, con procesamiento de texto, imagen y vídeo, y está especializado en producir salidas estructuradas (categorías, probabilidades sí/no y puntuaciones) en lugar de generación de texto libre. El repositorio incluye código personalizado (`custom_code`), por lo que la carga requiere confiar en código remoto.

No se han publicado en la información proporcionada datos sobre número de tokens de entrenamiento, composición del corpus, ni sobre etapas de RLHF o DPO. La model card menciona dos formatos de petición soportados, "Decisions" y "SystemOne", y señala que las variantes GGUF Q4/Q5 no superaron los controles de calidad, recomendándose únicamente F32 y Q8_0 para el runtime GGUF. Tampoco se indica compatibilidad con llama.cpp u Ollama oficiales sin modificar.

## Capacidades

- Toma de decisiones estructuradas sobre texto, imagen y vídeo: devuelve categorías, probabilidades sí/no y puntuaciones.
- Clasificación y enrutamiento de tickets de soporte.
- Cribado de imágenes de producto.
- Etiquetado y clasificación de vídeo.
- Soporte de dos formatos de petición: "Decisions" y "SystemOne".
- Inferencia local en CPU mediante ONNX Runtime, sin PyTorch ni Transformers.
- Despliegue embebido en aplicaciones Node.js mediante SDK JavaScript.
- Variante WebGPU para aplicaciones de navegador (0.8B WebGPU).
- Procesamiento local de las entradas, con funcionamiento offline desde caché una vez descargado el modelo.
- Idiomas: inglés y chino.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo clasifica el texto entrante en categorías y devuelve probabilidades, lo que permite derivar automáticamente cada ticket al equipo adecuado según umbrales de confianza configurables.
- Cribado de imágenes de producto: se usa para aceptar o rechazar imágenes en catálogos de e-commerce aplicando políticas de incertidumbre sobre las puntuaciones devueltas, tal como se documenta en el cookbook oficial.
- Etiquetado de vídeo: clasificación de clips con categorías y puntuaciones para moderación o catalogación, ejecutable en CPU sin GPU.
- Servicio Python en CPU: despliegue de un microservicio de decisión con ONNX Runtime, sin dependencias de PyTorch, adecuado para entornos con recursos limitados (pico de RSS de 2,76 GiB para texto).
- Integración en aplicaciones Node.js: embebido de la inferencia directamente en el backend JavaScript mediante el SDK oficial, evitando un servicio separado.
- Prototipado local sin GPU: evaluación de flujos de decisión en equipos de sobremesa antes de escalar a los modelos 2B o 4B.
- Aplicaciones de navegador: uso de la variante WebGPU del 0.8B para inferencia en cliente sin backend.
- Decisiones en juegos y entornos estructurados: la model card incluye una demostración de decisiones en Sokoban.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente aporta métricas de memoria medidas en CPU Linux para la entrada de texto (excluyendo visión): pico de RSS de 2,76 GiB para el 0.8B, 5,98 GiB para el 2B y 14,74 GiB para el 4B. También indica que las cifras de tamaño de descarga no equivalen a requisitos de RAM y que no se promete rendimiento no medido.

## Requisitos de hardware

- VRAM: no requerida para la ruta ONNX en CPU; para GPU se menciona Python ONNX CUDA como opción de despliegue, sin cifras de VRAM publicadas.
- Memoria RAM en CPU: pico de RSS de 2,76 GiB para texto en el 0.8B; imágenes, vídeo y entradas largas requieren más memoria.
- GPU recomendadas: no disponible en la información proporcionada.
- Cabe en GPU de consumo: no se aportan datos específicos; el modelo está diseñado principalmente para CPU y navegador.
- Despliegue: ONNX Runtime (Python, sin PyTorch ni Transformers), SDK JavaScript para Node.js, variante WebGPU para navegador, Python ONNX CUDA para GPU, runtime GGUF personalizado para servicios C++ en Linux CPU y SGLang/vLLM para despliegue nativo en GPU.
- Latencia y throughput: no disponible.
- Descarga FP32 completa: 3,505 GB (incluye componentes de visión).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formatos | Licencia | Notas |
|---|---|---|---|---|---|
| Valen-0.8B-ONNX | 0,8B | no disponible | ONNX (también nativo y GGUF) | Apache 2.0 | Multimodal de decisión estructurada, CPU-first |
| Valen-2B-ONNX | 2B | no disponible | ONNX | Apache 2.0 (según modelo base) | Misma familia, mayor presupuesto de memoria (5,98 GiB RSS en texto) |
| Valen-4B-ONNX | 4B | no disponible | ONNX | Apache 2.0 (según modelo base) | Misma familia, orientado a estaciones de trabajo (14,74 GiB RSS en texto) |
| Valen-Decision-1.5-0.8B-ONNX | 0,8B | no disponible | ONNX | no disponible | Versión sucesora recomendada por el autor |

No se dispone de datos de benchmarks que permitan comparar el rendimiento frente a modelos de otras familias.

## Limitaciones y advertencias

- Modelo especializado en decisiones estructuradas; no está pensado como generador de texto libre general.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado.
- Longitud de contexto no especificada, lo que impide planificar entradas largas con garantías.
- Las variantes GGUF Q4/Q5 no superaron los controles de calidad; solo F32 y Q8_0 están cualificadas para ese runtime.
- No se reclama compatibilidad con llama.cpp u Ollama oficiales sin modificar.
- El paquete GGUF precompilado 0.1.0 no compila soporte directo de vídeo; las pruebas de vídeo con compilación desde fuente no cualifican el paquete precompilado.
- Requiere `trust_remote_code` por el código personalizado del repositorio, lo que implica revisar el código antes de ejecutarlo en producción.
- Las cifras de memoria publicadas son picos de texto en CPU Linux y excluyen visión; imágenes y vídeo consumen más.
- Existe una versión posterior (Valen-Decision-1.5-0.8B-ONNX) que el autor recomienda como punto de partida.
- Riesgo de alucinación y sesgos: no documentado en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las notas de licencia de medios y procedencia citadas en el cookbook.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Valen-Team/Valen-0.8B-ONNX
- Modelo base: https://huggingface.co/Valen-Team/Valen-0.8B
- Versión sucesora: https://huggingface.co/Valen-Team/Valen-Decision-1.5-0.8B-ONNX
- Variante 2B: https://huggingface.co/Valen-Team/Valen-2B-ONNX
- Variante 4B: https://huggingface.co/Valen-Team/Valen-4B-ONNX
- Evaluaciones nativas: https://huggingface.co/Valen-Team/Valen-4B#evaluation
- Demo web y API gratuita: https://valen-team.github.io/
- Cookbook oficial: https://valen-team.github.io/cookbook/
- Guía de elección de versión: https://valen-team.github.io/docs/valen/choosing/
- Validación y rendimiento: https://valen-team.github.io/cookbook/validation/
- SDK Python: https://github.com/valen-team/valen-sdk-python
- SDK JavaScript: https://github.com/valen-team/valen-sdk-js
- Repositorio del proyecto: https://github.com/Valen-Team/Valen
