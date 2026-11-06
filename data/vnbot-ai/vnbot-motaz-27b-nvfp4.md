# vnbot-ai/VNBot-MotaZ-27B-NVFP4

## Resumen
VNBot-MotaZ-27B-NVFP4 es una versión cuantizada en formato NVFP4 del modelo multimodal VNBot-MotaZ-27B, desarrollado por vnbot-ai (Origo Technologies). Se trata de un asistente de IA que procesa texto e imágenes (pipeline image-text-to-text) y está orientado a los idiomas vietnamita e inglés. El modelo base tiene 27B parámetros y esta variante emplea cuantización NVFP4 con esquema W4A4 (pesos y activaciones a 4 bits), lo que reduce el peso en disco a aproximadamente 21,5 GB.

La relevancia de esta ficha radica en que se publica bajo licencia Apache-2.0, lo que facilita su uso comercial, y en que está empaquetada con `compressed-tensors` para su despliegue directo en vLLM. Al ser una cuantización del modelo base, hereda la arquitectura y capacidades de este, pero introduce las ventajas e inconvenientes propios de la precisión reducida en 4 bits.

La información disponible en la model card es muy escasa: se limita a la descripción funcional, el formato de cuantización y un comando de despliegue. No se detallan datos de entrenamiento, arquitectura interna ni resultados de benchmarks, por lo que muchos campos de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base etiquetado como `qwen3_5`) |
| Parametros totales | 27B (heredados del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la model card; el ejemplo de despliegue usa `--max-model-len 16384` |
| Tipos de cuantizacion | NVFP4 (W4A4), empaquetado con `compressed-tensors` |
| Idiomas soportados | vietnamita (vi), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (cuantizado NVFP4); repositorio de 6,5 GB |

## Arquitectura y entrenamiento
La model card no describe la arquitectura interna del modelo base VNBot-MotaZ-27B. La etiqueta `qwen3_5` en Hugging Face sugiere que el modelo base deriva de la familia Qwen 3.5, pero no se confirma en la documentación proporcionada. El pipeline declarado es `image-text-to-text`, lo que implica un modelo multimodal con capacidad de procesar imágenes y texto, aunque no se especifica el tipo de codificador visual ni el mecanismo de fusión multimodal.

Esta variante concreta es una cuantización del modelo base `vnbot-ai/VNBot-MotaZ-27B` mediante el formato NVFP4 (W4A4), que cuantiza pesos y activaciones a 4 bits. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineamiento. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades
- Generación de texto conversacional en vietnamita e inglés.
- Procesamiento de imágenes junto con texto (image-text-to-text), lo que permite tareas de descripción, respuesta a preguntas sobre imágenes y conversación multimodal.
- Uso como asistente conversacional (etiqueta `conversational`).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que facilita su integración en servicios gestionados.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, audio, etc.): no disponible en la información proporcionada.

## Casos de uso
- Asistencia conversacional en vietnamita: el modelo puede gestionar diálogos multi-turno en vietnamita e inglés, adecuado para atención al cliente en empresas que operan en Vietnam o con comunidades vietnamitas, gracias a su soporte nativo de ambos idiomas.
- Análisis de imágenes en soporte técnico: al aceptar entradas image-text-to-text, puede recibir capturas de pantalla o fotos de productos y responder preguntas sobre ellas, útil en mesas de ayuda o diagnóstico remoto.
- Extracción de información de documentos escaneados: combinando entrada de imagen y texto, puede transcribir o resumir contenido de facturas, formularios o etiquetas, siempre que la precisión de la cuantización 4-bit sea suficiente para la tarea.
- Despliegue en infraestructura con VRAM limitada: gracias a la cuantización NVFP4 (W4A4), el modelo ocupa aproximadamente 21,5 GB, lo que permite servirlo en GPUs de 24 GB o en configuraciones multi-GPU más modestas que las requeridas por el modelo en precisión completa.
- Integración en pipelines de vLLM: el comando documentado `vllm serve ... --max-model-len 16384` permite levantar un endpoint compatible con la API de OpenAI, facilitando su incorporación a aplicaciones existentes.
- Prototipado rápido de asistentes multimodales bilingües: al estar bajo licencia Apache-2.0 y empaquetado con `compressed-tensors`, es adecuado para experimentación y pruebas de concepto sin restricciones de licencia comercial.
- Moderación o clasificación de contenido visual y textual: puede emplearse para etiquetar o describir imágenes en flujos de moderación, aunque se recomienda validar la calidad tras la cuantización.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada: aproximadamente 21,5 GB según la model card (tamaño del formato NVFP4). El repositorio ocupa 6,5 GB, lo que sugiere que la cifra de 21,5 GB podría referirse al modelo descomprimido en memoria; se recomienda verificar antes de desplegar.
- GPU recomendadas: no disponibles de forma explícita. Por el tamaño indicado, se necesitarían GPUs con al menos 24 GB de VRAM (RTX 4090, L4, A10G) o profesionales como A100/H100 para mayor margen y throughput.
- ¿Cabe en consumer GPU? Potencialmente en RTX 4090 (24 GB) si la cifra de 21,5 GB es correcta, aunque con poco margen para el contexto y el codificador visual.
- Opciones de despliegue: vLLM es la opción documentada por el autor (`vllm serve vnbot-ai/VNBot-MotaZ-27B-NVFP4 --max-model-len 16384`). El soporte en llama.cpp, Ollama o TGI no está confirmado para el formato NVFP4.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Idiomas |
|---|---|---|---|---|---|
| VNBot-MotaZ-27B-NVFP4 | 27B | no disponible (ejemplo: 16k) | NVFP4 (W4A4) | Apache-2.0 | vi, en |
| VNBot-MotaZ-27B (base) | 27B | no disponible | Precisión original | Apache-2.0 | vi, en |
| Alternativas de 27B multimodales | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con modelos de la misma categoría en términos de rendimiento o benchmarks.

## Limitaciones y advertencias
- La cuantización NVFP4 (W4A4) puede degradar la calidad de las respuestas respecto al modelo base, especialmente en tareas de razonamiento complejo, matemáticas o generación de código. No se han publicado evaluaciones que cuantifiquen esta pérdida.
- La información sobre sesgos conocidos no está disponible en la model card.
- Riesgo de alucinación: inherente a los modelos generativos; no se documentan medidas específicas de mitigación.
- Cobertura lingüística limitada a vietnamita e inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- La model card no especifica el contexto máximo real del modelo; el valor de 16384 en el comando de ejemplo es una configuración de despliegue, no necesariamente el límite arquitectónico.
- Aunque la licencia es Apache-2.0, se recomienda revisar los archivos `LICENSE` y `NOTICE` del repositorio por si incluyen condiciones adicionales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria sobre su estabilidad en producción.
- No se documentan requisitos de hardware oficiales ni latencias esperadas, lo que dificulta la planificación de capacidad.

## Enlaces
- Hugging Face: https://huggingface.co/vnbot-ai/VNBot-MotaZ-27B-NVFP4
- Modelo base: https://huggingface.co/vnbot-ai/VNBot-MotaZ-27B
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
