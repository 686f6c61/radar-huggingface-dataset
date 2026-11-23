# trxcc2002/DEAL-WS-Qwen

## Resumen

DEAL-WS-Qwen es un checkpoint de modelo multimodal (image-text-to-text) publicado por el usuario trxcc2002 bajo el paraguas del proyecto SRE-DEAL, concretamente la variante DEAL-WS asociada al escenario "WSClaw". Se trata del checkpoint final (step-124) de un proceso de auto-recompensa (self-reward) sobre una base de la familia Qwen, según indica el autor en la model card. El repositorio contiene los pesos completos en Safetensors, tokenizer, chat template y configuraciones de modelo y procesador, pero no incluye estado del optimizador ni estado reanudable de entrenamiento.

El modelo declara 9.653.104.368 parámetros reales según los metadatos de Safetensors, lo que lo sitúa en la franja de ~9,65 mil millones de parámetros, coherente con un fine-tuning sobre una base Qwen de tamaño medio. El pipeline declarado es image-text-to-text, lo que implica capacidad de procesar entradas de imagen y texto, aunque la model card no detalla la arquitectura exacta ni el esquema de visión empleado.

La relevancia de esta ficha es limitada pero concreta: se trata de un checkpoint de investigación con cero descargas y cero likes en el momento de la consulta, sin licencia declarada, sin idiomas especificados y sin benchmarks publicados. Es útil para quien quiera reproducir o inspeccionar el resultado de un pipeline de self-reward sobre Qwen en un escenario multimodal, pero no debe tratarse como un modelo listo para producción sin una evaluación propia. La información disponible es escasa y muchos campos quedan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta de librería `qwen3_5`; pipeline image-text-to-text) |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en Safetensors sin conversión) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 19,3 GB) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna más allá de la etiqueta `qwen3_5` en los tags y el pipeline `image-text-to-text`, lo que sugiere una base de la familia Qwen con capacidad multimodal (procesador de imagen y texto). El autor indica que se trata del checkpoint final (step-124) de un proceso de "self-reward" dentro del proyecto SRE-DEAL, en la variante DEAL-WS correspondiente al escenario WSClaw. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otra técnica de alineación; el término "self-reward" apunta a un esquema de recompensa autogenerada, pero no se aportan detalles técnicos del mismo.

El repositorio preserva los ficheros verificados del checkpoint sin convertir los pesos, e incluye un `RELEASE-MANIFEST.json` con tamaños de fichero y checksums SHA-256. No se incluye estado del optimizador ni estado de reanudación de entrenamiento, por lo que el artefacto está pensado para inferencia o inspección, no para continuar el entrenamiento tal cual. No se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o modos de razonamiento explícitos.

## Capacidades

- Generación de texto y conversación multi-turno, según el tag `conversational` y la presencia de chat template.
- Procesamiento de entradas imagen-texto (pipeline `image-text-to-text`), lo que permite tareas que combinan una imagen con una instrucción textual.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que facilita su despliegue tras una API compatible con el ecosistema de Hugging Face.
- Etiquetas de proyecto orientadas a "self-reward" y "sre-deal", que sugieren un uso en investigación sobre esquemas de recompensa automática.
- Capacidades multilingües: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (thinking mode, audio, etc.): no disponible.

## Casos de uso

- Investigación sobre self-reward: el checkpoint permite inspeccionar y reproducir el resultado de un pipeline de recompensa autogenerada sobre una base Qwen, comparando el step-124 con checkpoints intermedios si el autor los publica.
- Evaluación de modelos multimodales en investigación: al aceptar imagen y texto, puede emplearse para probar cómo un fine-tuning de este tipo afecta a tareas de descripción de imágenes o respuesta a preguntas visuales, siempre con una evaluación propia.
- Prototipado de asistentes conversacionales con entrada visual: la presencia de chat template y pipeline image-text-to-text permite montar un prototipo de asistente que reciba una captura o imagen junto a una pregunta.
- Despliegue tras endpoint compatible: el tag `endpoints_compatible` facilita servirlo detrás de una API para pruebas internas de integración, sin compromiso de producción.
- Reproducción de experimentos SRE-DEAL: útil para investigadores que sigan la colección SRE-DEAL y quieran verificar los pesos publicados mediante los checksums del `RELEASE-MANIFEST.json`.
- Análisis de artefactos de release: el repositorio sirve como ejemplo de empaquetado de un checkpoint (pesos, tokenizer, chat template, configuraciones y manifiesto con SHA-256) sin estado de optimizador, útil para diseñar releases reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,65 mil millones de parámetros, en FP16 se requieren aproximadamente 19,3 GB solo para pesos (coincide con el tamaño del repo), más overhead de activaciones y KV cache; en cuantización de 8 bits, en torno a 10-11 GB; en 4 bits, en torno a 6-7 GB. Estas cifras son estimaciones a partir del recuento de parámetros, no datos publicados por el autor.
- GPU recomendadas: para FP16, GPU de 24 GB o más (RTX 4090, L40S, A100 40 GB, H100); para cuantización de 8 o 4 bits, GPU consumer de 12-16 GB podrían ser suficientes, sujeto a verificación empírica.
- Cabe en consumer GPU: probablemente sí en cuantizaciones de 8 o 4 bits en tarjetas de 12-16 GB; en FP16 requiere al menos 24 GB.
- Opciones de despliegue: la librería declarada es `transformers`; el tag `endpoints_compatible` sugiere despliegue tras endpoints compatibles. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible, y al no publicarse pesos GGUF, llama.cpp y Ollama requerirían conversión previa.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparación rigurosa. Como referencia estructural, el tamaño (~9,65 mil millones de parámetros) lo sitúa en la franja de modelos multimodales de tamaño medio, pero sin benchmarks ni licencia declarada no es posible establecer una comparativa fundamentada.

## Limitaciones y advertencias

- Licencia no disponible: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor o consultar el repositorio antes de cualquier uso en producción.
- Idiomas no declarados: se desconoce el soporte multilingüe real y la calidad en castellano.
- Sin benchmarks publicados: no hay evidencia de rendimiento en MMLU, HumanEval, GSM8K ni tareas multimodales; cualquier afirmación de calidad sería especulativa.
- Riesgo de alucinación: inherente a los modelos generativos; sin evaluación específica no puede acotarse.
- Sesgos conocidos: no documentados por el autor; al derivar de una base Qwen, podrían heredarse sesgos de dicha base, pero no se confirma.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validación externa del checkpoint.
- Checkpoint de investigación: no incluye estado de optimizador ni de reanudación, y el autor lo presenta como parte de un proyecto (SRE-DEAL) sin garantías de soporte.
- Longitud de contexto desconocida: no se puede planificar su uso en conversaciones largas o documentos extensos sin verificarlo empíricamente.
- Fecha de creación futura (2026-11-23) en los metadatos: conviene verificar la integridad del repositorio y los checksums del `RELEASE-MANIFEST.json` antes de confiar en los artefactos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trxcc2002/DEAL-WS-Qwen
- Colección SRE-DEAL: https://huggingface.co/collections/trxcc2002/sre-deal
