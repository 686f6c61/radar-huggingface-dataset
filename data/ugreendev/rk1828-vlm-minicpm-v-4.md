# UGREENDEV/RK1828-VLM-MiniCPM-V-4

## Resumen

RK1828-VLM-MiniCPM-V-4 es una conversión al formato RKNN del modelo multimodal OpenBMB/MiniCPM-V-4, publicada por UGREENDEV para su ejecución sobre el acelerador NPU Rockchip RK1828. No se trata de un modelo entrenado desde cero, sino de una versión cuantizada (w4a16) del VLM original, empaquetada con cuatro configuraciones distintas que difieren en la longitud de contexto del LLM y en el tipo de almacenamiento del KVCache (fp16 o int4).

El interés de esta ficha es doble: por un lado documenta la variante MiniCPM-V-4 original, un modelo de imagen-a-texto de la familia MiniCPM; por otro, describe el trabajo de despliegue en hardware edge realizado por UGREENDEV, que permite ejecutar inferencia multimodal en un chip NPU de bajo consumo en lugar de en GPUs de datacenter. El repositorio ocupa 3,0 GB e incluye pesos GGUF y artefactos RKNN.

La relevancia actual radica en que las cuatro configuraciones ofrecen ventanas de contexto de 16k, 17k, 36,5k y 42,5k tokens respectivamente, con resolución de visión fija de 448x448 píxeles y cuantización w4a16 tanto en la torre de visión como en el LLM. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (torre de visión + LLM); detalles internos del modelo base no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | 16384, 17408, 37376 o 43520 tokens según configuración |
| Tipos de cuantización | Visión: w4a16; LLM: w4a16; KVCache: fp16 o int4 según configuración |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (modelo base); se aplican además los términos de RKNN Toolkit y RKNN Runtime |
| Formato de pesos | GGUF y RKNN (artefactos por configuración en subdirectorios) |
| Resolución de visión | 448x448 |
| Núcleos NPU | 8 para visión, 8 para LLM |
| Versión de RKNN Runtime | v1.1.0 |
| Chips soportados | RK1828 (exclusivamente) |
| Modelo base | OpenBMB/MiniCPM-V-4 |
| Relación con el base | Quantized |

## Arquitectura y entrenamiento

El modelo subyacente es OpenBMB/MiniCPM-V-4, un VLM de la familia MiniCPM-V orientado a tareas de imagen-a-texto. La información disponible no detalla la arquitectura interna del LLM (número de capas, dimensión oculta, mecanismo de atención) ni el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO). Tampoco se especifica si emplea decodificación especulativa u otras optimizaciones de inferencia.

Lo que sí documenta la model card es el pipeline de conversión: UGREENDEV ha generado artefactos RKNN mediante RKNN Toolkit para el chip RK1828, con cuantización w4a16 en ambas torres y dos variantes de KVCache (fp16 para contextos de 16k y 17k; int4 para 36,5k y 42,5k). La resolución de entrada de visión está fijada en 448x448 píxeles. Cada configuración se distribuye en su propio subdirectorio con `config.json`, manifiesto de ficheros y sumas SHA-256 para verificación de integridad.

## Capacidades

- Generación de texto condicionada por imagen (pipeline `image-text-to-text`).
- Procesamiento de imágenes a resolución fija de 448x448.
- Conversación multi-turno con contexto de hasta 43.520 tokens en la configuración de mayor ventana.
- Inferencia sobre NPU Rockchip RK1828 con 8 núcleos dedicados a visión y 8 al LLM.
- Soporte de KVCache en fp16 o int4 para ajustar el uso de memoria al contexto requerido.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags del repositorio).
- Capacidades específicas del modelo base (tool calling, agentes, thinking mode, audio) no documentadas en esta conversión.

## Casos de uso

- Inspección visual en dispositivos edge: el modelo puede describir o responder preguntas sobre imágenes capturadas por cámaras locales en un dispositivo con NPU RK1828, sin necesidad de enviar datos a la nube, gracias a la cuantización w4a16 que reduce el coste computacional.
- Asistencia documental en kioscos o terminales: con contexto de hasta 42,5k tokens (configuración kv-int4), puede procesar varias páginas o capturas y mantener una conversación de seguimiento sobre su contenido.
- Control de calidad industrial con visión: integrado en una línea de producción con RK1828, el modelo puede clasificar o describir defectos en imágenes de 448x448 y emitir respuestas en lenguaje natural para el operario.
- Accesibilidad en dispositivos empotrados: descripción de imágenes para usuarios con discapacidad visual en hardware de bajo consumo, aprovechando la ejecución local en NPU.
- Automatización de tareas de etiquetado: generación de descripciones y metadatos para lotes de imágenes en un pipeline offline sobre RK1828, con verificación de integridad mediante SHA-256 antes del despliegue.
- Prototipado de asistentes multimodales en robótica ligera: el modelo puede recibir fotogramas de una cámara y responder consultas en lenguaje natural dentro de un bucle de control, siempre que el hardware objetivo sea RK1828.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- NPU Rockchip RK1828 exclusivamente; no se soportan otras plataformas según la model card.
- RKNN Runtime v1.1.0 y driver correspondiente; verificar la versión en el dispositivo con `rknn-smi -v` antes de ejecutar.
- 8 núcleos NPU para la torre de visión y 8 para el LLM.
- Repositorio completo de 3,0 GB; cada configuración se puede descargar por separado con `allow_patterns` o `--include`.
- VRAM/RAM estimada: no disponible.
- Compatibilidad con GPUs consumer (RTX 4090, etc.): no aplica, al ser artefactos RKNN para NPU.
- Opciones de despliegue: RKNN Runtime sobre RK1828; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI en esta conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Plataforma | Notas |
|---|---|---|---|---|---|
| RK1828-VLM-MiniCPM-V-4 (esta ficha) | no disponible | 16k–42,5k según config | Apache 2.0 | NPU RK1828 | Conversión RKNN w4a16 de MiniCPM-V-4 |
| OpenBMB/MiniCPM-V-4 | no disponible | no disponible | Apache 2.0 | GPU/CPU (formato original) | Modelo base sin cuantizar para RKNN |
| Otros VLM edge (p. ej. variantes MiniCPM-V para otros NPU) | no disponible | no disponible | variable | distinta | No se dispone de datos comparables en la información proporcionada |

La comparación cuantitativa con alternativas no es posible con los datos disponibles; la diferencia principal frente al modelo base es el formato (RKNN frente a safetensors/GGUF originales) y la cuantización w4a16.

## Limitaciones y advertencias

- Solo funciona en chips RK1828; no es desplegable en GPU, CPU genérica ni otros aceleradores sin reconversión.
- Requiere RKNN Runtime v1.1.0 y driver compatible; una versión incorrecta impide la ejecución.
- Resolución de visión fija en 448x448, lo que limita el detalle en imágenes de alta resolución.
- La cuantización w4a16 puede degradar la calidad respecto al modelo base en tareas sensibles; no se han publicado evaluaciones que cuantifiquen esa pérdida.
- Idiomas soportados no documentados; el comportamiento multilingüe del modelo base no está verificado en esta conversión.
- Riesgo de alucinación inherente a los VLM; no se documentan mitigaciones específicas.
- Sesgos conocidos: no disponibles.
- Licencia Apache 2.0 para el modelo, pero se aplican adicionalmente los términos de RKNN Toolkit y RKNN Runtime, que pueden restringir el uso comercial del pipeline de conversión.
- Es obligatorio verificar las sumas SHA-256 antes del despliegue; la model card indica desplegar solo tras obtener `OK` en todas las entradas.
- Los ficheros de una configuración deben usarse conjuntamente; mezclar configuraciones no está soportado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/UGREENDEV/RK1828-VLM-MiniCPM-V-4
- Modelo base: https://huggingface.co/OpenBMB/MiniCPM-V-4
- Documentación de configuraciones (subdirectorios del repo): `MiniCPM-V-4-448x448-w4a16-8-16384/README.md`, `MiniCPM-V-4-448x448-w4a16-8-17408/README.md`, `MiniCPM-V-4-448x448-w4a16-8-37376-kv-int4/README.md`, `MiniCPM-V-4-448x448-w4a16-8-43520-kv-int4/README.md`
- Descarga vía ModelScope: `modelscope download --model UGREENDEV/RK1828-VLM-MiniCPM-V-4 --revision master`
- Descarga vía Hugging Face: `hf download UGREENDEV/RK1828-VLM-MiniCPM-V-4 --revision v1.1.0`
