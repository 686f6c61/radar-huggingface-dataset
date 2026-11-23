# zaidwhys/deepseek-vl2-tiny-hf

## Resumen

deepseek-vl2-tiny-hf es una conversion no oficial del modelo multimodal deepseek-ai/deepseek-vl2-tiny al formato nativo de Transformers, realizada por el usuario zaidwhys. El modelo original lo desarrolla DeepSeek y pertenece a la familia DeepSeek-VL2, una serie de modelos vision-language basados en una arquitectura Mixture-of-Experts (MoE) con atencion lineal y vision encoder SigLIP, presentada en el paper arXiv:2412.10302. Esta version concreta no modifica los pesos: solo renombra claves para que el modelo cargue con `AutoModelForImageTextToText` y `AutoProcessor` de Transformers, y reproduce la plantilla de conversacion del original.

El problema que resuelve es practico: permitir evaluar y desplegar DeepSeek-VL2-tiny con la libreria estandar de Hugging Face, sin depender del codigo de inferencia propio de DeepSeek. El repositorio se publico como material de revision del pull request huggingface/transformers#51020, que anade soporte para DeepSeek-VL2. La relevancia es, por tanto, la de un artefacto de integracion para la comunidad, no la de un modelo nuevo.

El modelo tiene 3.355.263.088 parametros totales segun los safetensors del repositorio y un tamano de repo de 6,7 GB, lo que corresponde a pesos en bf16. Es un modelo image-text-to-text de tipo conversacional, con licencia DeepSeek Model License (etiquetada como "other" en Hugging Face) y sujeto a las restricciones de uso de su parrafo 5 y el anexo A.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer con Mixture-of-Experts y atencion lineal (familia DeepSeek-VL2); vision encoder SigLIP segun el paper |
| Parametros totales | 3.355.263.088 |
| Parametros activos | no disponible en la informacion proporcionada |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; los pesos del repo estan en bf16 (6,7 GB) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | DeepSeek Model License (license: other, license_name: deepseek) |
| Formato de pesos | safetensors, formato nativo de Transformers |

## Arquitectura y entrenamiento

DeepSeek-VL2 es una familia de modelos vision-language que combina un encoder visual con un modelo de lenguaje basado en Mixture-of-Experts. Segun el paper referenciado (arXiv:2412.10302), la serie emplea atencion lineal en el componente de lenguaje y un encoder SigLIP para las imagenes. La variante tiny es la mas pequena de la familia y, en esta conversion, conserva exactamente los pesos del modelo original: el autor indica que solo se renombraron claves y que la plantilla de chat reproduce el formato de conversacion original.

No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO). La validacion realizada por el autor es una generacion greedy sobre la imagen de demostracion `monday.jpg` de DeepSeek con el prompt "Describe this image in one sentence.", comparada con el codigo original en bf16 sobre CPU, con resultado coincidente. No hay mas detalles de entrenamiento ni innovaciones adicionales documentadas en esta ficha.

## Capacidades

- Generacion de texto condicionada por imagen (image-text-to-text) en formato conversacional multi-turno.
- Descripcion de imagenes y respuesta a preguntas sobre su contenido, segun la validacion del autor con la imagen de demostracion.
- Integracion con la API estandar de Transformers mediante `AutoModelForImageTextToText` y `AutoProcessor`.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags del repositorio).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Evaluacion del soporte DeepSeek-VL2 en Transformers: cargar el modelo con `AutoModelForImageTextToText` y ejecutar generacion greedy sobre imagenes de referencia para verificar que la conversion reproduce el comportamiento del codigo original, tal como hizo el autor con `monday.jpg`.
- Revision de pull requests de la libreria: el repositorio se publico expresamente como material de revision de huggingface/transformers#51020, por lo que sirve para que mantenedores y contribuyentes prueben la implementacion antes de integrarla.
- Prototipado de asistentes visuales conversacionales: al ser un modelo image-text-to-text con plantilla de chat, permite construir demos multi-turno que reciben una imagen y responden preguntas sobre ella usando el pipeline estandar de Hugging Face.
- Descripcion automatica de imagenes en pipelines de datos: el modelo puede generar descripciones de una frase para catalogar o etiquetar imagenes, un caso validado directamente por el autor en la model card.
- Integracion en aplicaciones que ya usan Transformers: evita mantener un entorno de inferencia separado con el codigo propio de DeepSeek, lo que simplifica el despliegue en infraestructura existente basada en `device_map="auto"`.
- Base para experimentacion e investigacion: al ser la variante tiny de la familia (3,35 mil millones de parametros), es adecuada para estudiar el comportamiento de la arquitectura MoE con atencion lineal en tareas vision-language con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica validacion documentada es cualitativa: la generacion greedy sobre `monday.jpg` con el prompt "Describe this image in one sentence." coincide con la salida del codigo original de DeepSeek en bf16 sobre CPU.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6,7 GB solo para los pesos en bf16; el autor ejecuto la prueba de validacion en CPU, por lo que no se documenta un requisito de VRAM medido.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, los pesos en bf16 caben en GPUs con 8 GB o mas de memoria, aunque no hay datos oficiales que lo confirmen.
- Cabe en GPU de consumo: previsiblemente si en tarjetas con al menos 8 GB de VRAM en bf16, y con menos memoria mediante cuantizacion, pero no se proporcionan cifras verificadas ni recetas de cuantizacion.
- Opciones de despliegue: Transformers con `device_map="auto"` es la via documentada; requiere una build de Transformers que incluya soporte DeepSeek-VL2. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| deepseek-vl2-tiny-hf (esta ficha) | 3.355.263.088 | no disponible | DeepSeek Model License | safetensors (Transformers) | Conversion no oficial del original |
| deepseek-ai/deepseek-vl2-tiny | no disponible en la informacion proporcionada | no disponible | DeepSeek Model License | pesos originales de DeepSeek | Modelo base oficial; requiere el codigo de inferencia de DeepSeek |
| Otras variantes de DeepSeek-VL2 | no disponible en la informacion proporcionada | no disponible | DeepSeek Model License | no disponible | Familia MoE con atencion lineal; tamanos superiores al tiny segun el paper |

No se dispone de datos de rendimiento comparado con alternativas de otros desarrolladores en la informacion proporcionada.

## Limitaciones y advertencias

- Conversion no oficial: el autor la publica para revisar un pull request de Transformers; no es un artefacto mantenido por DeepSeek ni por Hugging Face.
- Requiere una build de Transformers que incluya soporte DeepSeek-VL2; con versiones estandar puede no cargar.
- Licencia DeepSeek Model License con restricciones de uso basadas en el parrafo 5 y el anexo A; es imprescindible revisarlas antes de cualquier uso comercial o derivado.
- No hay informacion sobre sesgos, tasas de alucinacion ni comportamiento multilingue en la documentacion disponible.
- La unica validacion es una generacion greedy sobre una sola imagen en CPU; no hay evidencia publicada de robustez en produccion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin senales de adopcion por la comunidad.
- Longitud de contexto, idiomas y parametros activos no estan documentados en la informacion proporcionada, lo que limita la planificacion de despliegues.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/zaidwhys/deepseek-vl2-tiny-hf
- Modelo base: https://huggingface.co/deepseek-ai/deepseek-vl2-tiny
- Paper DeepSeek-VL2: https://huggingface.co/papers/2412.10302
- Pull request de Transformers con soporte DeepSeek-VL2: https://github.com/huggingface/transformers/pull/51020
- Licencia DeepSeek Model License: https://github.com/deepseek-ai/DeepSeek-VL2/blob/main/LICENSE-MODEL
