# xyzhuy/vintern-1b-v3_5-gguf

## Resumen

Vintern-1B-v3.5 es un modelo vision-language compacto desarrollado por el grupo 5CD-AI (VinAI/Vintern), diseñado para tareas de comprensión de documentos y extracción de información a partir de imágenes. Con solo 938.213.504 parámetros totales, combina un codificador visual InternViT-300M con un decodificador de lenguaje Qwen2.5-0.5B, lo que lo sitúa en la gama ultra-ligera de modelos multimodales.

La ficha que nos ocupa, `xyzhuy/vintern-1b-v3_5-gguf`, no es el modelo original sino una cuantización GGUF en Q8_0 preparada específicamente para un motor WebGPU escrito a mano. El autor empaqueta en un único fichero las capas lineales en Q8_0 y las normas, sesgos y embeddings posicionales en f32, e incluye además los token ids y bytes del prompt fijo "receipt → JSON", de modo que el navegador no necesita tokenizer externo.

Su relevancia actual reside en la ejecución de un modelo vision-language directamente en el navegador mediante WebGPU, sin servidor ni backend de inferencia, con un peso de repositorio de 1,0 GB. Es la base pública de una demo de "sealed skill" de Pocket Compute cuyo adaptador LoRA se distribuye cifrado y no forma parte de este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer: codificador visual InternViT-300M + decodificador Qwen2.5-0.5B |
| Parametros totales | 938.213.504 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q8_0 en capas lineales; f32 en normas, sesgos y embeddings posicionales |
| Idiomas soportados | Etiquetado como "vietnamese"; el resto no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (fichero unico para motor WebGPU) |

## Arquitectura y entrenamiento

El modelo subyacente, `5CD-AI/Vintern-1B-v3_5`, sigue el esquema de Vintern: un encoder visual InternViT de 300M de parametros acoplado a un modelo de lenguaje Qwen2.5 de 0.5B. Esta arquitectura híbrida permite procesar imágenes (documentos, recibos, formularios) y generar texto estructurado a partir de ellas con un coste computacional muy bajo.

La información disponible sobre el entrenamiento del modelo base es escasa: no se detallan el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. La model card del repositorio GGUF se centra en la conversión, no en el entrenamiento. La innovación técnica destacable de esta ficha concreta es la integración del tokenizer (token ids y bytes del prompt fijo) dentro del propio fichero GGUF, lo que elimina la dependencia de una librería de tokenización en el cliente WebGPU.

## Capacidades

- Comprensión de imágenes y documentos: lectura de recibos, formularios y capturas para extraer información estructurada.
- Generación de texto condicionada por imagen (vision-language).
- Salida estructurada tipo JSON mediante prompt fijo "receipt → JSON" incluido en el propio fichero.
- Ejecución en navegador mediante WebGPU, sin backend de inferencia.
- Capacidad multilingüe: el modelo está etiquetado para vietnamita; el alcance del resto de idiomas no está documentado en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión avanzada o audio: no disponible.

## Casos de uso

- Extracción de datos de recibos en el navegador: el fichero incluye el prompt "receipt → JSON" y su tokenización, de modo que una aplicación web puede enviar la imagen del recibo al modelo vía WebGPU y obtener un JSON estructurado sin enviar datos a un servidor.
- Digitalización de formularios en cliente: procesamiento local de documentos escaneados para extraer campos, útil en entornos con requisitos de privacidad donde los datos no deben salir del dispositivo.
- Aplicaciones web offline-first: al pesar 1,0 GB y ejecutarse sobre WebGPU, puede integrarse en una PWA que funcione sin conexión una vez descargado el modelo.
- Procesamiento de documentos en vietnamita: el modelo está etiquetado explícitamente para este idioma, por lo que encaja en flujos de digitalización de facturas o documentos administrativos vietnamitas.
- Demostraciones educativas de IA multimodal: su tamaño reducido y su despliegue en navegador lo hacen adecuado para talleres y prototipos que muestren visión por computador sin infraestructura de servidor.
- Prototipado de "sealed skills": sirve como base pública sobre la que aplicar adaptadores LoRA especializados distribuidos por separado, como en la demo de Pocket Compute.
- Clasificación y descripción de imágenes ligeras: para tareas de captioning o etiquetado básico en dispositivos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 938M de parámetros en Q8_0 el peso de los tensores cuantizados ronda 1 GB, más las capas en f32 y el buffer de activaciones.
- GPU recomendadas: no disponible; el destino declarado es WebGPU, por lo que requiere un navegador con soporte WebGPU y una GPU compatible (la información no especifica modelos concretos).
- Cabe en GPU de consumo: previsiblemente sí por tamaño, pero no se confirma en la documentación disponible.
- Opciones de despliegue: motor WebGPU propio del autor; también existe una conversión alternativa en `ngxson/Vintern-1B-v3_5-GGUF` para llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Despliegue |
|---|---|---|---|---|
| xyzhuy/vintern-1b-v3_5-gguf | 938.213.504 | No disponible | MIT | GGUF para WebGPU |
| 5CD-AI/Vintern-1B-v3_5 (base) | ~938M | No disponible | MIT | Pesos originales (safetensors) |
| ngxson/Vintern-1B-v3_5-GGUF | ~938M | No disponible | MIT | GGUF para llama.cpp |

Los tres comparten el mismo modelo subyacente; las diferencias están en el formato de empaquetado y en el motor de inferencia objetivo. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Modelo de 938M de parámetros: capacidad de razonamiento y conocimiento factual limitados en comparación con modelos multimodales de mayor tamaño.
- Riesgo de alucinación en la extracción de campos de documentos, especialmente con imágenes de baja calidad o formatos no vistos durante el entrenamiento.
- La licencia MIT permite uso comercial, pero el adaptador LoRA de la demo "sealed skill" no está incluido y se distribuye cifrado bajo su propia licencia.
- El prompt fijo "receipt → JSON" está embebido en el fichero; usos fuera de ese esquema requieren tokenización propia, que este GGUF no incluye.
- Cobertura de idiomas no documentada más allá de la etiqueta "vietnamese"; el rendimiento en castellano no está verificado.
- Longitud de contexto no especificada, lo que impide planificar tareas con documentos largos.
- Dependencia de WebGPU: la compatibilidad depende del navegador y de la GPU del cliente, con posible variabilidad de rendimiento.
- Repositorio sin descargas ni likes en el momento de la consulta; no hay evidencia de validación por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/xyzhuy/vintern-1b-v3_5-gguf
- Modelo base: https://huggingface.co/5CD-AI/Vintern-1B-v3_5
- Conversión alternativa para llama.cpp: https://huggingface.co/ngxson/Vintern-1B-v3_5-GGUF
