# yujackein/onereason-8b-lora-r0-sid-caption-residual-step65-drop24-35

## Resumen

Este repositorio contiene un adaptador LoRA experimental para el modelo base `OpenOneRec/OneReason-8B-pretrain-competition`, orientado a la tarea de generación de captions a partir de identificadores de ítems (SID) dentro del marco de recomendación generativa OneReason. El adaptador combina un padre RL10 de rango 32 con un residual de rango 32 entrenado sobre 1.040 filas de datos SID-to-caption, concatenados como un único adaptador de rango 64. Está diseñado específicamente para la competición de recomendación OneReason, no como un modelo de propósito general.

La relevancia de este adaptador radica en que explora una técnica de composición post-hoc: el residual se mantiene solo en las capas 0 a 23, mientras que las capas 24 a 35 se fijan a cero. Esta decisión de diseño busca mejorar la calidad de las captions generadas sin degradar otras capacidades del modelo base. El modelo base pertenece a la familia OneReason, que según el informe técnico de arXiv aborda la activación del razonamiento en modelos generativos de recomendación mediante cadenas de pensamiento (CoT) adaptadas a dominios como vídeo corto, livestream, publicidad y comercio electrónico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre modelo base OneReason-8B (arquitectura del base no especificada) |
| Parametros totales | no disponible (el adaptador tiene rango 64; el repo pesa 0.7 GB) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 512 tokens (según model card) |
| Tipos de cuantizacion | no disponible (el código de uso emplea bfloat16) |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (según tags) |

## Arquitectura y entrenamiento

El adaptador se construye como una concatenación exacta de dos LoRA de rango 32: el padre RL10 (preservado bit a bit) y un residual entrenado específicamente para la tarea SID-to-caption. El residual se entrena con una tasa de aprendizaje de `1e-4`, programación coseno con 3% de warmup, tamaño de lote global 8, y se selecciona el checkpoint correspondiente a 65 pasos de optimización (aproximadamente media época). El corte de contexto es de 512 tokens. La composición final mantiene el padre activo en las 36 capas, pero el residual solo está presente en las capas 0 a 23; en las capas 24 a 35 se fija a cero. Esta eliminación tardía es una decisión post-hoc, no un entrenamiento separado.

Los datos de entrenamiento del residual consisten en 1.040 filas exclusivas de entrenamiento (sin solapamiento con la evaluación): 520 filas de vídeo corto y 520 de producto. No se dispone de información sobre el dataset completo del modelo base ni sobre el proceso de entrenamiento de este último, aunque el informe técnico de OneReason (arXiv:2606.06260) describe la familia de modelos y su enfoque en recomendación generativa con razonamiento.

## Capacidades

- Generación de captions a partir de SID (identificadores de ítems) para dominios de recomendación: vídeo corto, producto, anuncio y livestream.
- Adaptación específica para la competición OneReason, con mejora medida en un panel de evaluación local frente al padre RL10.
- Soporte de conversación y generación de texto en chino e inglés (según tags).
- No se indica soporte de tool calling, agentes, visión ni otras capacidades multimodales.
- El modelo base OneReason-8B es un modelo de lenguaje generativo de 8B parámetros (según el nombre), pero no se detallan capacidades adicionales en la información proporcionada.

## Casos de uso

- Generación de descripciones de productos para catálogos de comercio electrónico: el adaptador produce captions a partir de SID de producto, lo que puede automatizar la creación de textos atractivos y coherentes para fichas de producto.
- Generación de títulos o descripciones para vídeos cortos en plataformas de streaming: a partir del SID del vídeo, el modelo genera un caption que puede usarse como metadato o para recomendación contextual.
- Personalización de anuncios publicitarios: el adaptador puede generar texto publicitario específico para un ítem dado, mejorando la relevancia de los anuncios mostrados.
- Enriquecimiento de datos de livestream: generar captions para transmisiones en vivo a partir de sus SID, facilitando la indexación y búsqueda de contenido.
- Evaluación de calidad de captions en sistemas de recomendación: el adaptador puede usarse como componente generativo en pipelines de evaluación comparativa frente a otros métodos.
- Investigación en recomendación generativa: sirve como punto de partida para estudiar el efecto de composiciones LoRA residuales y eliminación de capas en tareas de generación de texto estructurado.

## Benchmarks y rendimiento

Se han publicado resultados de evaluación local (no oficiales) en la model card. El adaptador se evaluó en un panel ciego de 400 filas (100 por dominio) comparado con el padre RL10:

| Alcance | Delta pareado vs RL10 |
|---|---|
| Global | +0.1313 |
| Vídeo corto | +0.2200 |
| Producto | +0.2500 |
| Anuncio | +0.0100 |
| Livestream | +0.0450 |

La puntuación global del adaptador fue `1.9813` frente a `1.8500` del padre. El intervalo de confianza bootstrap estratificado por dominio al 95% fue `[+0.0475, +0.2163]`, con recuento de victorias/empates/derrotas `161/127/112`. También se reportan tradeoffs en tareas cruzadas: R2 global `-0.006465` y probabilidad `s_c` restringida R3 `-0.008117`. No se han realizado evaluaciones oficiales en la plataforma de la competición.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la información disponible.
- El modelo base OneReason-8B tiene 8B parámetros (según el nombre), por lo que la inferencia en bfloat16 requiere aproximadamente 16 GB de VRAM solo para el modelo base, más el adaptador (0.7 GB). Se recomienda una GPU con al menos 20 GB de VRAM para operar con comodidad.
- Posibles opciones de despliegue: transformers con PEFT (como se muestra en el código de uso), vLLM, llama.cpp u Ollama si se convierte el adaptador a GGUF, aunque no hay confirmación de compatibilidad.
- La latencia y el throughput no están documentados.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este adaptador con otros modelos de la misma categoría. El único punto de referencia interno es el padre RL10, que ya se ha detallado en la sección de benchmarks. No se han encontrado otros adaptadores o modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental destinado a una competición; no ha sido validado en producción ni en la plataforma oficial.
- Longitud de contexto limitada a 512 tokens, lo que restringe su uso en tareas que requieran entradas largas.
- Solo cubre chino e inglés; no se garantiza rendimiento en otros idiomas.
- Los resultados de evaluación son proxies locales, no puntuaciones oficiales; los tradeoffs en tareas cruzadas indican posibles degradaciones en otras capacidades del modelo base.
- La licencia no está especificada, por lo que el uso comercial es incierto y debe consultarse con el autor.
- El adaptador depende del modelo base `OpenOneRec/OneReason-8B-pretrain-competition`, que también puede tener sus propias restricciones.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en la generación de captions para ítems no vistos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/yujackein/onereason-8b-lora-r0-sid-caption-residual-step65-drop24-35
- Modelo base: https://huggingface.co/OpenOneRec/OneReason-8B-pretrain-competition
- Informe técnico OneReason (arXiv): https://arxiv.org/abs/2606.06260
- Versión HTML del informe: https://arxiv.org/html/2606.06260v1
