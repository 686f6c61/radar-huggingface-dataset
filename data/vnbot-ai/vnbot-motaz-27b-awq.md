# vnbot-ai/VNBot-MotaZ-27B-AWQ

## Resumen

VNBot-MotaZ-27B-AWQ es la versión cuantizada en AWQ de 4 bits del modelo multimodal VNBot-MotaZ-27B, desarrollado por vnbot-ai (Origo Technologies). El modelo original es un transformer de tipo `qwen3_5` con 27.781.427.952 parámetros, orientado a tareas de image-text-to-text, es decir, acepta entradas conjuntas de imagen y texto y genera respuestas conversacionales. Esta variante AWQ reduce el peso del repositorio a 21,8 GB, lo que facilita su despliegue en GPUs con menos memoria que las necesarias para los pesos en precisión completa.

El modelo está pensado como asistente conversacional bilingüe (vietnamita e inglés) con capacidad de procesar imágenes, según indica la model card del autor. La arquitectura declarada en los metadatos es `qwen3_5`, lo que sugiere una base derivada de la familia Qwen 3.5, aunque el autor no publica detalles sobre el proceso de entrenamiento, el dataset utilizado ni las técnicas de alineación aplicadas.

La relevancia de esta ficha radica en que se trata de una publicación muy reciente (noviembre de 2026) con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentación técnica detallada más allá de la model card. Es, por tanto, un modelo a evaluar con cautela: la información disponible permite describir su formato, tamaño y licencia, pero no validar su calidad real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (etiqueta `qwen3_5` en los metadatos) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de despliegue usa `--max-model-len 16384` |
| Tipos de cuantizacion | AWQ 4-bit, grupo de 32, asimétrica (según model card); `compressed-tensors` |
| Idiomas soportados | vietnamita (vi) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 21,8 GB); compatible con transformers y vLLM |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `qwen3_5` presente en los metadatos de Hugging Face y del pipeline `image-text-to-text`, que implica un codificador visual acoplado a un decoder de lenguaje. El modelo es multimodal: procesa imágenes y texto de forma conjunta. No se publican datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado.

La innovación técnica documentada se limita a la cuantización: esta variante AWQ aplica cuantización de 4 bits con grupos de 32 y esquema asimétrico, empaquetada en formato `compressed-tensors`, lo que reduce el peso a 21,8 GB frente a los aproximadamente 55 GB que ocuparían los pesos en bf16/fp16. El autor proporciona un comando de despliegue con vLLM (`vllm serve vnbot-ai/VNBot-MotaZ-27B-AWQ --max-model-len 16384`), lo que confirma compatibilidad con ese motor de inferencia. No hay información sobre decodificación especulativa, atención lineal ni otras optimizaciones.

## Capacidades

- Generación de texto conversacional en vietnamita e inglés.
- Comprensión de imágenes combinada con texto (image-text-to-text): descripción, respuesta a preguntas sobre imágenes y diálogo multimodal.
- Conversación multi-turno (etiqueta `conversational`).
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su integración en servicios de inferencia.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, audio, visión avanzada más allá de image-text): no disponible; solo se confirma entrada de imagen y texto.

## Casos de uso

- Asistencia conversacional bilingüe vietnamita-inglés: el modelo puede gestionar diálogos multi-turno en ambos idiomas, adecuado para atención al cliente en mercados de Vietnam o para usuarios que alternan entre ambas lenguas.
- Análisis de imágenes en soporte técnico: un usuario puede enviar una captura de pantalla o una foto de un producto o error y el modelo responde con texto explicativo, gracias a su pipeline image-text-to-text.
- Extracción de información de documentos escaneados: al aceptar imagen y texto, puede recibir la foto de un formulario o factura y generar un resumen o respuesta en texto.
- Moderación y descripción de contenido visual: generación de descripciones textuales de imágenes para sistemas de catalogación o accesibilidad.
- Prototipado rápido de asistentes multimodales: al estar cuantizado en AWQ 4-bit y ser compatible con vLLM, permite levantar un endpoint de pruebas con un solo comando y requisitos de VRAM moderados.
- Despliegue en infraestructura con GPUs de gama media: el formato AWQ de 21,8 GB permite servir el modelo en una sola GPU de 24 GB, algo inviable con los pesos en precisión completa.
- Traducción y adaptación de contenido entre vietnamita e inglés en contextos con imágenes (por ejemplo, menús, carteles o interfaces).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones multimodales, y no hay datos de latencia o throughput más allá del comando de despliegue con vLLM.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos 22-24 GB para los pesos AWQ 4-bit (21,8 GB) más overhead de KV cache y activaciones; con contexto de 16.384 tokens el consumo adicional puede ser significativo.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para producción con contexto largo; RTX 4090 (24 GB) para despliegues ajustados con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) o RTX 3090 (24 GB) con contexto limitado; no cabe en GPUs de 16 GB o menos sin reducir contexto o aplicar cuantización adicional.
- Opciones de despliegue: vLLM (documentado por el autor), transformers; llama.cpp/Ollama no están confirmados para este formato AWQ/compressed-tensors.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VNBot-MotaZ-27B-AWQ | 27,8 B | no disponible (ejemplo a 16.384) | Sí (image-text-to-text) | Apache-2.0 | Hugging Face, repo de 21,8 GB |
| VNBot-MotaZ-27B (base) | 27,8 B | no disponible | Sí | Apache-2.0 | Hugging Face |
| Alternativas de la familia Qwen 3.5 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información verificada sobre modelos comparables de la misma categoría (27B multimodal bilingüe vietnamita-inglés) en la documentación proporcionada, por lo que la comparativa con alternativas concretas queda como no disponible.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad en razonamiento, código, matemáticas o tareas multimodales.
- Modelo con cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.
- Documentación mínima: la model card no describe el dataset de entrenamiento, el proceso de alineación ni las limitaciones conocidas.
- Idiomas limitados a vietnamita e inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Riesgo de alucinación no evaluado; al ser un modelo conversacional multimodal sin benchmarks, conviene validar sus salidas en dominios críticos.
- Sesgos conocidos: no disponibles; al no documentarse la composición del dataset, no se pueden identificar sesgos específicos.
- La cuantización AWQ 4-bit puede degradar ligeramente la calidad respecto al modelo base en precisión completa; no se han publicado comparativas entre ambas versiones.
- Licencia Apache-2.0: permite uso comercial, pero el autor remite a los archivos `LICENSE` y `NOTICE` del repositorio, que conviene revisar por posibles atribuciones adicionales.
- El contexto máximo real no está confirmado; el valor de 16.384 en el comando de vLLM es una configuración de ejemplo, no una especificación oficial.
- Compatibilidad de despliegue limitada principalmente a vLLM y transformers; no hay confirmación de soporte en llama.cpp u Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vnbot-ai/VNBot-MotaZ-27B-AWQ
- Modelo base: https://huggingface.co/vnbot-ai/VNBot-MotaZ-27B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
