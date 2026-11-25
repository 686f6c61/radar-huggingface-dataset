# vcruz305/Ling-3.2-Air-SAGE-REXL3-5.01bpw

## Resumen

Ling-3.2-Air-SAGE-REXL3-5.01bpw es una cuantización de 5,01 bits por peso (bpw) del modelo base inclusionAI/Ling-3.2-air, publicada por el usuario vcruz305 en Hugging Face. Se distribuye en formato EXL3 (exl3) para la librería exllamav3, lo que la orienta a inferencia de alto rendimiento en GPU mediante el motor ExLlamaV3. El modelo base es un transformer de tipo mezcla de expertos (MoE) multimodal, capaz de procesar entradas de imagen y texto y generar texto (pipeline image-text-to-text), con arquitectura identificada como bailing_moe_v3_vl.

El interés de esta ficha radica en que ofrece una alternativa comprimida del modelo original: los pesos en safetensors suman 40.910.733.264 parámetros totales (aproximadamente 40,9 mil millones), y el repositorio ocupa 81,9 GB. La cuantización a 5,01 bpw reduce el espacio frente a los pesos en precisión completa, manteniendo el soporte multimodal y multilingüe (inglés, chino y otros idiomas) del modelo base.

Es relevante ahora porque permite desplegar un MoE multimodal de gran tamaño en entornos con VRAM limitada usando ExLlamaV3, aunque con las advertencias propias de una cuantización de terceros: no es una publicación oficial de inclusionAI, el acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face, y no se han publicado resultados de benchmarks específicos para esta variante cuantizada en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | bailing_moe_v3_vl (transformer MoE multimodal, image-text-to-text) |
| Parametros totales | 40.910.733.264 (aprox. 40,9 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 a 5,01 bpw (exl3, rexl3) |
| Idiomas soportados | en, zh, multilingual |
| Licencia | MIT |
| Formato de pesos | safetensors con cuantizacion EXL3 (exl3), libreria exllamav3 |

## Arquitectura y entrenamiento

La información disponible identifica la arquitectura como bailing_moe_v3_vl, lo que indica un transformer con mezcla de expertos (MoE) y componente de visión (VL, vision-language), orientado a tareas image-text-to-text. El modelo base es inclusionAI/Ling-3.2-air, del que esta publicación es una cuantización. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otros ajustes de alineamiento en la información proporcionada.

La innovación técnica destacable de esta publicación concreta no está en el entrenamiento, sino en la compresión: se aplica cuantización EXL3 a 5,01 bits por peso mediante el formato rexl3, pensado para el motor ExLlamaV3. Esto permite reducir el peso en memoria y acelerar la inferencia en GPU, a costa de una posible pérdida de precisión frente a los pesos originales. No se detallan en la información disponible otras innovaciones como decodificación especulativa, atención lineal o variantes de atención eficiente.

## Capacidades

- Generación de texto conversacional multi-turno, según el tag conversational.
- Procesamiento multimodal de imagen y texto (pipeline image-text-to-text): acepta imágenes junto con instrucciones textuales.
- Soporte multilingüe, con inglés y chino como idiomas principales y cobertura multilingüe adicional.
- Razonamiento y generación de contenido textual propio de un modelo de 40,9 mil millones de parámetros totales en arquitectura MoE.
- Ejecución mediante ExLlamaV3 con pesos EXL3, lo que habilita despliegue optimizado en GPU.
- No se dispone de información sobre soporte de tool calling, function calling, agentes o modos de razonamiento extendido (thinking mode) en la información proporcionada.

## Casos de uso

- Asistente multimodal conversacional: el modelo puede recibir una imagen y una pregunta en lenguaje natural y responder en texto, adecuado para interfaces de chat que combinan capturas, fotos o diagramas con consultas del usuario.
- Descripción y análisis de imágenes en inglés o chino: útil para generar descripciones, extraer información de documentos escaneados o interpretar gráficos, aprovechando su pipeline image-text-to-text.
- Atención al cliente con soporte visual: integrado en un backend con ExLlamaV3, puede gestionar conversaciones multi-turno donde el cliente adjunta imágenes (productos dañados, capturas de error) y el modelo responde con contexto.
- Procesamiento de documentación técnica multilingüe: al cubrir inglés, chino y otros idiomas, sirve para resumir o traducir documentación que mezcla texto e imágenes.
- Despliegue en infraestructura con VRAM limitada: la cuantización a 5,01 bpw permite ejecutar un MoE de 40,9 mil millones de parámetros en GPUs que no podrían alojar los pesos en precisión completa, usando ExLlamaV3.
- Prototipado e investigación en entornos académicos: al tener licencia MIT, facilita experimentos con modelos MoE multimodales cuantizados sin las restricciones de licencias más cerradas.
- Evaluación comparativa de cuantizaciones: útil para medir la degradación de calidad de EXL3 a 5,01 bpw frente al modelo base en tareas de visión y lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 81,9 GB, por lo que se necesita al menos esa cantidad de memoria de GPU para cargar los pesos EXL3 completos, más overhead de contexto y caché KV.
- GPU recomendadas: GPUs profesionales con 80 GB o más por dispositivo, como A100 80 GB o H100 80 GB; para configuraciones multi-GPU, repartir los pesos entre varias GPUs.
- GPU de consumo: no cabe en GPUs de consumo típicas de 24 GB (RTX 4090) ni de 16 GB; requeriría configuraciones multi-GPU o mayor compresión, no disponible en esta publicación.
- Opciones de despliegue: ExLlamaV3 (exl3) es el motor previsto por el formato; no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ling-3.2-Air-SAGE-REXL3-5.01bpw (esta ficha) | 40,9 mil millones | no disponible | EXL3 5,01 bpw (safetensors) | MIT | Gated en Hugging Face |
| inclusionAI/Ling-3.2-air (modelo base) | no disponible en la informacion | no disponible | safetensors originales | no disponible en la informacion | no disponible en la informacion |
| Alternativas MoE multimodales de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con alternativas concretas de la misma categoría en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Es una cuantización de terceros (vcruz305), no una publicación oficial de inclusionAI; la calidad puede diferir del modelo base.
- La cuantización a 5,01 bpw puede introducir degradación en tareas sensibles a la precisión, como razonamiento matemático o análisis fino de imágenes; no se han publicado evaluaciones que lo cuantifiquen.
- El acceso está restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos.
- No se dispone de información sobre sesgos conocidos, tasa de alucinación ni limitaciones específicas de contexto del modelo base.
- La licencia MIT se declara en la publicación, pero conviene verificar las condiciones del modelo base inclusionAI/Ling-3.2-air para uso comercial.
- El despliegue requiere ExLlamaV3 y hardware de gama alta (80 GB o más de VRAM por GPU o multi-GPU); no es viable en GPUs de consumo estándar.
- No se dispone de información sobre tool calling, agentes o modos de razonamiento extendido, lo que limita su uso en pipelines agénticos sin validación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vcruz305/Ling-3.2-Air-SAGE-REXL3-5.01bpw
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.2-air
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos.
