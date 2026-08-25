# xdavxd/gemma-4-12B-it-heretic-v2-NVFP4

## Resumen

Este modelo es una cuantización NVFP4 de `coder3101/gemma-4-12B-it-heretic`, un ajuste fino del modelo Gemma 4 12B de Google. El autor, xdavxd, ha aplicado la técnica de cuantización NVFP4 de NVIDIA, que reduce los pesos y activaciones a 4 bits por parámetro, logrando una reducción de aproximadamente el 65% en requisitos de disco y memoria GPU en comparación con los pesos de 16 bits. El modelo está listo para inferencia con vLLM.

La relevancia de este modelo radica en su capacidad para ejecutar un modelo multimodal de 12 mil millones de parámetros en hardware de consumo, manteniendo un rendimiento cercano al original. La variante "heretic" incorpora una técnica de ablación de rango arbitrario (ARA) que, según el autor, permite comparar la recuperación de precisión frente al modelo base tras la cuantización. Es una opción interesante para desarrolladores que buscan desplegar capacidades multimodales de nivel medio en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal sin encoder (encoder-free), basado en Gemma 4 12B |
| Parametros totales | 12B (aprox., del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, pesos y activaciones) |
| Idiomas soportados | no disponible (el modelo base de Gemma 4 soporta multiples idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (NVFP4, compatible con vLLM) |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 12B, un transformer multimodal encoder-free desarrollado por Google, capaz de procesar de forma nativa texto, imagen, audio y video. La variante "heretic" de coder3101 incorpora una técnica de ablación de rango arbitrario (ARA) que modifica ciertos componentes del modelo para mejorar su robustez o características especificas. Posteriormente, xdavxd ha cuantizado los pesos y activaciones al formato NVFP4 (4 bits de punto flotante de NVIDIA), lo que reduce la huella de memoria y acelera la inferencia en GPUs compatibles con FP4. No se dispone de detalles sobre los datos de entrenamiento del modelo base ni sobre procesos de alineación como RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento en multiples idiomas (capacidad heredada de Gemma 4 12B)
- Multimodal nativo: procesa imagen, audio y video sin codificador externo
- Soporte de tool calling y function calling (capacidad del modelo base, no confirmada en esta variante)
- Inferencia eficiente en GPU gracias a la cuantizacion NVFP4, con soporte vLLM para despliegue en produccion
- Capacidad de ejecucion en hardware modesto (GPU con 16GB VRAM segun el blog de Google para el modelo base)

## Casos de uso

- Despliegue de un asistente multimodal en local: con 12B y cuantizacion 4 bits, puede ejecutarse en una GPU de gama media (p. ej. RTX 4090) para procesar consultas de texto, imagen o audio sin depender de la nube.
- Analisis de video en tiempo real: su capacidad nativa de ingesta de video permite implementar sistemas de vigilancia o resumen automatico de grabaciones en hardware de bajo coste.
- Automatizacion de atencion al cliente: el modelo puede gestionar conversaciones multi-turno combinando texto, imagenes y notas de voz, aunque la longitud de contexto no se ha confirmado en esta variante.
- Generacion de codigo asistida en entornos offline: con tool calling (si esta disponible) puede integrarse en IDEs o pipelines de CI/CD para sugerencias de codigo y refactorizacion.
- Prototipado de aplicaciones de IA en local: gracias a su licencia Apache-2.0 y a su tamano reducido, es ideal para desarrollar demos y pruebas de concepto sin coste de API.
- Investigacion en eficiencia de modelos: la combinacion de ARA y cuantizacion NVFP4 permite estudiar el equilibrio entre precision y compresion en modelos multimodales grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los resultados de busqueda mencionan comparaciones de exactitud entre la version heretic y la original, asi como la "recuperacion" tras la cuantizacion, pero no se proporcionan cifras concretas ni tablas de referencia. No se puede ofrecer una tabla comparativa fiable.

## Requisitos de hardware

- VRAM estimada: aproximadamente 6-8 GB para inferencia con NVFP4 (12B parametros × 4 bits ≈ 6 GB, mas overhead de activaciones y KV cache).
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100, H100 (cualquier GPU con soporte FP4 o compatible via vLLM).
- Cabe en GPUs de consumo con 16GB VRAM (p. ej. RTX 4080, RTX 4060 Ti 16GB) y en algunas de 8GB con cuantizacion adicional o contexto reducido.
- Opciones de despliegue: vLLM (recomendado y optimizado para NVFP4), TensorRT-LLM, o bien convertirlo a GGUF para llama.cpp si se prefiere ejecucion en CPU.
- Latencia y throughput estimados: no disponibles; dependen del hardware y del tamaño de contexto.

## Comparativa con modelos similares

No hay suficiente informacion para realizar una comparativa fiable con otros modelos. El modelo base Gemma 4 12B se podria comparar con Llama 3.1 8B o Qwen 2.5 7B en terminos de parametros y multimodalidad, pero no se dispone de datos de rendimiento de esta variante cuantizada. Se indica "no disponible" para la comparativa cuantitativa.

## Limitaciones y advertencias

- No se han publicado benchmarks oficiales de esta variante; el rendimiento real en tareas especificas es desconocido.
- La cuantizacion a 4 bits puede degradar la calidad en tareas de razonamiento complejo o generacion de codigo largo, aunque el autor reporta una "recuperacion" respecto al original en sus pruebas.
- La tecnica ARA (Arbitrary-Rank Ablation) puede introducir comportamientos imprevistos en ciertas entradas; no hay documentacion detallada de sus efectos.
- No se especifica la longitud de contexto soportada; es probable que sea menor que la del modelo base debido a la cuantizacion de activaciones.
- La licencia Apache-2.0 permite uso comercial, pero es responsabilidad del usuario verificar que el modelo base y las tecnicas utilizadas no incumplan otras restricciones.
- No hay garantias de que el modelo funcione correctamente en todos los idiomas ni con todo tipo de contenido multimodal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xdavxd/gemma-4-12B-it-heretic-v2-NVFP4
- Variante anterior (heretic-NVFP4): https://huggingface.co/xdavxd/gemma-4-12B-it-heretic-NVFP4
- Blog de Google sobre Gemma 4 12B: https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/
- Guia de desarrollador de Gemma 4 12B: https://developers.googleblog.com/gemma-4-12b-the-developer-guide/
- Pagina del modelo en FriendliAI: https://friendli.ai/models/xdavxd/gemma-4-12B-it-heretic-NVFP4
