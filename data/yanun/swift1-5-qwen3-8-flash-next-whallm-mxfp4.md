# Yanun/Swift1.5-Qwen3.8-Flash-Next-Whallm-MXFP4

## Resumen

Swift1.5-Qwen3.8-Flash-Next-Whallm-MXFP4 es una conversión cuantizada de `ukisai/Swift1.5-Qwen3.8-Flash-Next`, publicada por el usuario Yanun. No es un modelo entrenado desde cero, sino un artefacto de pesos en el formato propietario de Whallm, preparado para el runtime de inferencia de texto Qwen3.8 de esa plataforma. El modelo original lo desarrolla UkisAI y deriva de Qwen3.8-Flash-Next, de Qwen.

Arquitectónicamente es un transformer con mezcla de expertos (MoE) de 48 capas, tamaño oculto 2.560 y 512 expertos enrutados por capa, de los que se activan 10 por token más un experto compartido. La atención es híbrida: 36 capas de atención lineal y 12 de atención completa, con una capa completa cada cuatro. Incorpora una capa adicional de predicción multi-token (MTP) y un almacén de embeddings n-gram de 128 fragmentos con 2.500.012 filas de 160 valores cada uno.

Su relevancia es doble: por un lado, muestra una conversión de precisión mixta (expertos en MXFP4, pesos comunes en BF16 y n-gram en FP8 E4M3) orientada a comprimir el peso en disco hasta unos 118,1 GiB; por otro, es un ejemplo de formato no estándar que exige herramientas específicas y no se puede cargar con Transformers, MLX-LM, vLLM ni llama.cpp directamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y atención híbrida: 48 capas, 36 de atención lineal y 12 de atención completa (completa cada cuatro capas) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (se activan 10 expertos enrutados de 512 por capa más un experto compartido por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (expertos enrutados del modelo principal y del bloque MTP), FP8 E4M3 (embeddings n-gram), BF16 (expertos compartidos, routers, proyecciones de atención, embeddings de token, LM head, normalización y pesos de visión preservados) |
| Idiomas soportados | no disponible |
| Licencia | Swift Open License v1.0 (modelo base de UkisAI) y Qwen Community License 1.0 (modelo subyacente de Qwen); campo `license: other` |
| Formato de pesos | Artefacto propietario de Whallm (runtime de inferencia Qwen3.8); no es un checkpoint estándar de Transformers ni de MLX-LM. Se incluyen `manifest.json` y `conversion.json` |

## Arquitectura y entrenamiento

Este repositorio no contiene un entrenamiento nuevo, sino una conversión de precisión mixta del checkpoint BF16 de `ukisai/Swift1.5-Qwen3.8-Flash-Next` (revisión `0bd4fe22431372cdad1979267d3ab45aa7e6150a`). No se dispone de información sobre el conjunto de datos, el número de tokens de entrenamiento ni si el modelo original usó RLHF o DPO; la model card de esta conversión no ofrece esos datos. La conversión se realiza directamente desde el checkpoint BF16 de Swift, sin una conversión intermedia a FP8 y sin sustituir pesos por los del modelo base oficial.

En cuanto a los detalles técnicos, los expertos enrutados del modelo principal y del bloque MTP se almacenan en MXFP4 con 32 valores por grupo y una escala E8M0 sin punto cero, lo que equivale a 4,25 bits por peso de experto incluyendo el almacenamiento de la escala. Cada experto usa pesos fusionados `gate_up` de forma `[1280, 2560]` y `down` de forma `[2560, 640]`, ocupando 2.611.200 bytes empaquetados por experto. El empaquetado, la selección de escalas y el redondeo al par más cercano siguen la versión 2 de la conversión de Whallm, en lugar de la selección de escala MXFP4 por defecto de MLX. Los 51.200.245.760 valores n-gram de origen se almacenan en FP8 E4M3 con tamaño de fila de 160 bytes y una única escala global de 2^-12 (0,000244140625), elegida tras escanear el rango completo sin recorte. El vocabulario es de 248.320 tokens y se conservan el tokenizador, la plantilla de chat y los ficheros de configuración originales. Los tensores de visión se preservan por separado en BF16, pero no están habilitados en este runtime de texto. La cuantización de expertos y de la tabla n-gram es con pérdida: los pesos BF16 originales no se pueden reconstruir de forma exacta.

## Capacidades

- Generación de texto: es la tarea declarada del pipeline (`text-generation`) y el único modo habilitado en este artefacto.
- Mezcla de expertos: 512 expertos enrutados por capa con 10 seleccionados por token más un experto compartido, con tamaño intermedio de experto de 640.
- Predicción multi-token (MTP): incluye una capa adicional de predicción con sus expertos enrutados y tensores comunes, utilizable para esquemas de decodificación especulativa en el runtime correspondiente.
- Embeddings n-gram: almacén de 128 fragmentos con 2.500.012 filas de 160 valores cada uno, almacenado en FP8 E4M3.
- Vocabulario amplio: 248.320 tokens, lo que sugiere cobertura multilingüe, si bien no se documenta la lista de idiomas soportados.
- Visión: los tensores originales de visión se conservan en BF16, pero están deshabilitados en este runtime de texto.
- Soporte de tool calling, function calling, agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking mode), audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en el runtime Whallm: el artefacto está pensado para el motor de inferencia de texto Qwen3.8 de Whallm. Requiere registrar la identidad de origen del modelo en la aplicación Whallm antes de poder cargarlo.
- Evaluación comparativa de cuantización en MoE: sirve para medir la pérdida de calidad de la conversión MXFP4 (4,25 bits por peso de experto, 32 valores por grupo) frente al checkpoint BF16 de partida, en tareas de generación de texto con prompts controlados.
- Investigación sobre esquemas híbridos de atención: la combinación de 36 capas lineales y 12 completas permite estudiar el equilibrio entre coste de atención y calidad en modelos de contexto largo, siempre que se disponga de los datos de contexto del modelo base.
- Estudio de tablas de embeddings n-gram en FP8: el almacén de 51.200.245.760 valores con una escala global única es un caso de prueba para analizar el impacto de una escala global frente a esquemas por grupos en tablas de embeddings de gran tamaño.
- Base para re-cuantización a otros formatos: los pesos BF16 de los componentes comunes y los expertos MXFP4 empaquetados pueden servir como punto de partida para regenerar checkpoints en GGUF, AWQ o GPTQ, con la consiguiente pérdida acumulada de precisión.
- Pruebas de decodificación especulativa con MTP: la capa MTP incluida permite experimentar con decodificación multi-token dentro del runtime Whallm para reducir el coste por token generado, si el motor lo expone.
- Validación interna de licencias: al acumular dos licencias con condiciones comerciales (Swift Open License v1.0 y Qwen Community License 1.0), es útil como caso práctico para revisar umbrales de facturación y obligaciones de atribución antes de un despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del payload en disco: aproximadamente 118,1 GiB incluyendo el bloque MTP; los tensores de visión preservados son adicionales. Son tamaños en disco, no requisitos de RAM.
- Compatibilidad de runtime: el formato es propietario de Whallm. No es cargable directamente con vLLM, llama.cpp, Ollama, TGI ni MLX-LM; el runtime aplicable es el motor de inferencia de texto Qwen3.8 de Whallm, con registro de modelo específico para esta identidad de origen.
- VRAM estimada: al residir el conjunto completo en memoria, se necesita un agregado de VRAM en el orden del payload (unos 118 GiB), por lo que conviene planificar con margen adicional para caché KV y activaciones. No se especifican requisitos exactos en la información disponible.
- GPU recomendadas: 2× H100 de 80 GB (160 GB agregados) o 2× A100 de 80 GB; alternativamente 4× RTX 6000 Ada de 48 GB (192 GB agregados) o 8× RTX 4090 de 24 GB (192 GB agregados) si el runtime admite paralelismo entre GPU.
- GPU de consumo: no cabe en una única GPU de consumo de 24 GB (RTX 4090, 3090, etc.) con el payload completo. Se desconoce si el runtime admite ejecución parcial en CPU con volcado a disco.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.
- Decodificación especulativa: existe una capa MTP adicional, pero no se documentan ganancias de rendimiento asociadas en esta conversión.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision | Licencia | Formato |
|---|---|---|---|---|---|
| Swift1.5-Qwen3.8-Flash-Next-Whallm-MXFP4 | no disponible | no disponible | MXFP4 (expertos), BF16 (comunes), FP8 E4M3 (n-gram) | Swift Open License v1.0 + Qwen Community License 1.0 | Whallm (propietario) |
| ukisai/Swift1.5-Qwen3.8-Flash-Next | no disponible | no disponible | BF16 | Swift Open License v1.0 | no disponible |
| Yanun/Qwen3.8-Flash-Next-MXFP4 | no disponible | no disponible | MXFP4 | Qwen Community License 1.0 (según modelo base) | no disponible |
| Qwen/Qwen3.8-Flash-Next | no disponible | la documentación de Qwen3.8-Flash menciona ventana de un millón de tokens, extremo no confirmado para esta variante | BF16 | Qwen Community License 1.0 | Transformers |

No se dispone de los datos de parámetros ni de contexto del modelo base en la información proporcionada, por lo que la comparación cuantitativa no puede completarse.

## Limitaciones y advertencias

- Cuantización con pérdida: los expertos MXFP4 y la tabla n-gram FP8 no permiten reconstruir los pesos BF16 originales de forma exacta. La degradación real no está cuantificada en la model card.
- Formato no estándar: al ser un artefacto propietario de Whallm, la portabilidad es nula hacia otros motores de inferencia sin una conversión previa.
- Visión deshabilitada: los tensores de visión se conservan, pero no se activan en este runtime; no es un modelo multimodal utilizable en este formato.
- Idiomas y contexto no documentados: no se declaran idiomas soportados ni longitud de contexto, lo que impide planificar despliegues multilingües o de contexto largo con garantías.
- Sesgos: no se documentan sesgos conocidos. Al derivar de un modelo de Qwen, hereda los sesgos del modelo base, no evaluados aquí.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad (veracidad, tasas de alucinación) para esta conversión.
- Restricciones de licencia comercial: la Swift Open License v1.0 aplica a la contribución de UkisAI y establece un umbral de 1.000.000 USD de ingresos brutos en el último ejercicio fiscal, incluyendo entidades relacionadas; por encima de ese umbral se exige una licencia comercial escrita de UkisAI. La Qwen Community License 1.0 exige una licencia Qwen separada para uso comercial por licenciatarios o afiliados que operen un negocio de Model as a Service o AI Work Assistant, con la excepción de uso interno indicada. También obliga a mostrar de forma destacada el nombre del modelo en productos o servicios comerciales con más de 100 millones de usuarios activos mensuales o 20 millones de USD de ingresos mensuales. La cuantización no elimina ninguna de estas condiciones.
- Obligaciones de redistribución: cualquier redistribución debe conservar los textos de licencia aplicables, la atribución y los avisos de cambios (`LICENSE`, `LICENSE-QWEN` y `NOTICE`).
- Adopción nula: el repositorio registra 0 descargas y 0 interacciones en el momento de la consulta, por lo que no ha sido validado por la comunidad.
- Producción: no se recomienda su uso en producción sin una validación propia de calidad, latencia y cumplimiento de licencias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Yanun/Swift1.5-Qwen3.8-Flash-Next-Whallm-MXFP4
- Modelo base: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next
- Conversión MXFP4 relacionada de Yanun: https://huggingface.co/Yanun/Qwen3.8-Flash-Next-MXFP4
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio en GitHub: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Documentación de QwenCloud: https://docs.qwencloud.com/developer-guides/getting-started/latest-model
- Ficha de Qwen3.8-Flash en QwenCloud: https://www.qwencloud.com/models/qwen3.8-flash
- Licencia Swift Open License v1.0: https://huggingface.co/Yanun/Swift1.5-Qwen3.8-Flash-Next-Whallm-MXFP4/blob/main/LICENSE
- Licencia Qwen Community License 1.0: https://huggingface.co/Yanun/Swift1.5-Qwen3.8-Flash-Next-Whallm-MXFP4/blob/main/LICENSE-QWEN
