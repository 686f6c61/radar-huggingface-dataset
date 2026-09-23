# vihaanshah05/personal-retrieval

## Resumen

personal-retrieval es una implementación compacta y personalizada en PyTorch de la arquitectura BLIP (Bootstrapping Language-Image Pre-training), orientada a tareas de recuperación (retrieval) entre imagen y texto. Lo publica el usuario vihaanshah05 en Hugging Face y su propósito declarado es servir de base para revisión de código, pruebas de humo (smoke tests) y experimentos controlados de pequeña escala, no como un modelo preentrenado listo para producción.

El checkpoint publicado (model.safetensors) es una inicialización válida para pruebas de humo, no un modelo entrenado ni auditado. Según los metadatos de safetensors, cuenta con 49.600 parámetros totales, una cifra muy inferior a la de un BLIP base convencional (del orden de 224 millones), lo que confirma su carácter de implementación en miniatura. El repositorio no reclama ninguna puntuación de benchmark y no documenta idiomas soportados ni longitud de contexto.

La relevancia de esta ficha es, por tanto, acotada: sirve para entender un andamiaje de código reproducible con el que experimentar con retrieval multimodal, no para desplegar un sistema de recuperación en producción. El autor recomienda explícitamente evaluar sobre Flickr30k, con al menos tres semillas y una línea base de capacidad comparable, antes de extraer cualquier conclusión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Blip (implementacion personalizada en PyTorch) |
| Parametros totales | 49.600 (segun metadatos de safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | bsd-3-clause |
| Formato de pesos | safetensors |
| Escala declarada | base |
| Mecanismo de atencion | flash attention |
| Fusion multimodal | cross attention |
| Activacion | approx gelu |
| Normalizacion | batchnorm |
| Tamano del repositorio | 0,0 GB |
| Descargas | 14 |
| Likes | 0 |

## Arquitectura y entrenamiento

La arquitectura es una reimplementación propia de BLIP en PyTorch. La configuración declarada corresponde a la escala base e incorpora atención flash, fusión mediante cross attention, activación approx gelu y normalización batchnorm. No se especifican en la documentación el número de capas, la dimensión oculta, el número de cabezas de atención ni la composición exacta del codificador visual y del codificador de texto, por lo que no es posible reconstruir el grafo completo a partir de la información publicada.

En cuanto al entrenamiento, el repositorio incluye una receta por defecto con el optimizador adafactor y un planificador (scheduler) de tipo exponencial, pero el propio autor aclara que son valores de partida del script y no evidencia de una ejecución completada. No hay información sobre volumen de tokens, composición del dataset, resolución de imagen, ni sobre etapas de RLHF, DPO u otro ajuste por preferencias. El checkpoint model.safetensors es una inicialización para pruebas de humo y no un modelo con pesos entrenados.

## Capacidades

Dado que el checkpoint publicado es una inicialización no entrenada, las capacidades que se enumeran a continuación describen el diseño previsto de la arquitectura y no un comportamiento verificado empíricamente:

- Recuperación (retrieval) imagen-texto y texto-imagen: es la tarea para la que está diseñada la arquitectura BLIP subyacente.
- Generación de representaciones (embeddings) multimodales conjuntas mediante fusión por cross attention.
- Punto de partida para fine-tuning sobre datasets de recuperación de imágenes.
- Ejecución de pruebas de humo y revisión de código del pipeline de entrenamiento e inferencia.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declara ningún idioma).
- Capacidades especiales (modo de razonamiento, visión, audio): no disponibles.

## Casos de uso

- Pruebas de humo en pipelines de entrenamiento: el script pipeline.py permite verificar de forma rápida que los tensores, la inicialización y el flujo de datos funcionan antes de lanzar un entrenamiento costoso.
- Revisión de código (code review) de implementaciones BLIP: sirve como referencia legible de cómo se estructura la fusión por cross attention y el uso de flash attention en una implementación personalizada.
- Experimentos controlados a pequeña escala: al ser un modelo de 49.600 parámetros, permite iterar sobre recetas de optimización (adafactor, scheduler exponencial) con un coste de cómputo mínimo.
- Investigación comparativa sobre Flickr30k: el autor propone evaluar en Flickr30k reportando la métrica de la tarea en al menos tres semillas y con una línea base de capacidad comparable, lo que convierte al repositorio en un marco para experimentos reproducibles.
- Base para fine-tuning académico: estudiantes e investigadores pueden partir de esta inicialización para entrenar un retrieval multimodal reducido y estudiar el efecto de la escala o del dataset.
- Docencia de arquitecturas de retrieval multimodal: la implementación compacta resulta adecuada para explicar en clase cómo se combinan codificadores unimodales mediante cross attention.
- No se recomienda su uso en producción (búsqueda multimodal, moderación de contenido, catálogos de producto, etc.) mientras no exista un checkpoint entrenado y auditado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio declara explícitamente que no reclama ninguna puntuación y que el checkpoint incluido no es un modelo entrenado, por lo que no procede presentar cifras de MMLU, Flickr30k, Recall@K ni de ninguna otra métrica.

## Requisitos de hardware

- VRAM estimada para inferencia: con 49.600 parámetros, el peso ocupa aproximadamente 198 KB en fp32 y unos 99 KB en fp16, más buffers y activaciones. Cabe en cualquier dispositivo, incluida CPU.
- GPU recomendadas: ninguna en particular; cualquier GPU moderna (A100, H100, RTX 4090, RTX 3060) o incluso CPU es suficiente. Las GPU solo aportarían ventaja si se entrena el modelo a mayor escala.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo e incluso en dispositivos integrados tipo Raspberry Pi.
- Opciones de despliegue: ejecución directa mediante PyTorch y el script pipeline.py del propio repositorio. Al ser una implementación personalizada, las APIs genéricas de carga automática requieren un adaptador explícito antes de su uso. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| personal-retrieval (vihaanshah05) | 49.600 | Retrieval imagen-texto | no disponible | bsd-3-clause | Hugging Face, checkpoint no entrenado |
| BLIP base (Salesforce) | ~224 M | Retrieval y generacion imagen-texto | ~512 tokens (encoder de texto) | consultar ficha oficial | Pesos preentrenados publicos |
| CLIP ViT-B/32 (OpenAI) | ~151 M | Retrieval imagen-texto de cero disparo | ~77 tokens (encoder de texto) | consultar ficha oficial | Pesos preentrenados publicos |

La diferencia de escala es notable: personal-retrieval tiene aproximadamente 4.500 veces menos parámetros que un BLIP base y unas 3.000 veces menos que un CLIP ViT-B/32, y su checkpoint no está entrenado, por lo que no es comparable en rendimiento con ellos.

## Limitaciones y advertencias

- El checkpoint es una inicialización no entrenada; no se ha auditado su robustez, equidad (fairness) ni transferencia de dominio.
- No se declara ningún idioma soportado, por lo que no hay garantía de comportamiento multilingüe ni siquiera a nivel de diseño documentado.
- Riesgo de alucinación: no evaluado, dado que el modelo no ha sido entrenado. No puede caracterizarse empíricamente.
- Sesgos conocidos: no disponibles. Al no haber datos de entrenamiento documentados, no es posible analizar sesgos de género, raza u otros.
- Restricciones de licencia: el código se publica bajo bsd-3-clause, que permite uso comercial con atribución y conservación del aviso de copyright. No obstante, al usar datasets externos debe revisarse por separado los términos de los datos de origen.
- No apto para producción: el autor indica explícitamente que la configuración base está pensada para revisión de código y experimentos, no para despliegues reales.
- Cualquier resultado obtenido con un futuro checkpoint entrenado debe documentarse de forma separada de los valores por defecto que se distribuyen en este repositorio.
- Requiere un adaptador explícito para funcionar con APIs genéricas de carga de modelos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vihaanshah05/personal-retrieval
- Perfil del autor en Hugging Face: https://huggingface.co/vihaanshah05
- Referencia sobre retrieval aumentado (RAG) y personalizacion, citada en la busqueda: https://arxiv.org/html/2503.15489v1
- Asistente personal con RAG y LLaMA-3.1-8B, repositorio relacionado: https://github.com/mytechnotalent/pa
- Stanford HAI (contexto general sobre IA): https://hai.stanford.edu/
