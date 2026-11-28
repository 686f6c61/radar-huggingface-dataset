# Thox-ai/ThoxLLM-327M-v2

## Resumen

ThoxLLM-327M-v2 es un modelo de lenguaje decoder-only de 327 millones de parámetros entrenado desde cero por THOX.ai LLC, sin partir de ningún modelo base externo. Forma parte de la línea de investigación de modelos pequeños de THOX y está diseñado específicamente para exportación limpia a GGUF, lo que facilita su despliegue en llama.cpp y Ollama. Emplea una arquitectura propietaria denominada `thoxllm`, con atención de tipo GQA, normalización RMSNorm, embeddings rotatorios RoPE y feed-forward SwiGLU.

El modelo cuenta con 324.162.560 parámetros reales según los pesos en safetensors, 20 capas, dimensión oculta de 1024 y una ventana de contexto máxima de 2048 tokens. Su vocabulario es de 50.304 entradas con embeddings atados (tied embeddings) y se distribuye en bfloat16. Está pensado para generación de texto en dispositivos locales y entornos edge dentro del stack THOX, no como asistente público alineado en seguridad.

Su relevancia actual reside en dos factores: por un lado, es un checkpoint de investigación publicado con licencia Apache-2.0, lo que permite uso comercial y modificación; por otro, su diseño orientado a GGUF y su tamaño reducido lo convierten en una opción viable para inferencia en hardware de consumo. No obstante, el autor advierte explícitamente de que se trata de un modelo base de 327M con comportamiento de completado y fiabilidad factual limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decoder-only propietaria `thoxllm` (SwiGLU, RMSNorm, RoPE, GQA) |
| Parámetros totales | 324.162.560 (327M nominales) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | No disponible en la información proporcionada (existe build GGUF con variantes como Q4_K_M) |
| Idiomas soportados | Inglés (en); calidad inferior en otros idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (bfloat16); GGUF en repo separado |

## Arquitectura y entrenamiento

El modelo usa un transformer decoder-only con 20 capas, hidden size de 1024 y 16 cabezas de atención con 8 cabezas KV (GQA), lo que reduce el coste de memoria en la caché KV durante la inferencia. La dimensión intermedia del FFN es 3413, el vocabulario es de 50.304 tokens y los embeddings están atados. La normalización es RMSNorm y las activaciones del feed-forward son SwiGLU; las posiciones se codifican con RoPE. El dtype de los pesos es bfloat16 y el checkpoint completo ocupa aproximadamente 648 MB.

El entrenamiento se realizó desde cero por THOX.ai LLC como parte de su línea de investigación de modelos pequeños, sin modelo base externo. La model card no especifica el número de tokens de entrenamiento, la composición del corpus ni si hubo fases de RLHF o DPO. El autor indica que el comportamiento y los sesgos reflejan los datos de entrenamiento, mayoritariamente en inglés. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en inglés con comportamiento de completado (completion-style), adecuado para tareas de continuación y generación libre.
- Razonamiento básico y respuesta a preguntas simples, con fiabilidad limitada por el tamaño del modelo.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el tamaño y el comportamiento de completado lo hacen poco adecuado para flujos agénticos complejos.
- Capacidades multilingües: limitadas; el modelo está entrenado principalmente en inglés y el autor advierte de menor calidad en otros idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Exportación a GGUF para ejecución en llama.cpp y Ollama.

## Casos de uso

- Generación de texto en dispositivos locales y edge: con 327M parámetros y pesos en bfloat16 de ~648 MB, el modelo puede ejecutarse en hardware modesto dentro del stack THOX, ideal para autocompletado o generación de borradores sin conexión.
- Prototipado rápido de pipelines de NLP: su licencia Apache-2.0 y su formato safetensors permiten integrarlo en experimentos de investigación sin restricciones comerciales, sirviendo como baseline de modelos pequeños.
- Despliegue vía Ollama para pruebas de concepto: el build GGUF (por ejemplo, Q4_K_M) permite lanzar el modelo con un solo comando y evaluar su comportamiento en entornos de desarrollo antes de escalar.
- Generación de texto asistida en herramientas internas: puede emplearse para tareas de reescritura, resumen corto o generación de plantillas en inglés dentro de aplicaciones controladas, siempre con revisión humana.
- Educación e investigación sobre arquitecturas decoder-only: al ser un modelo entrenado desde cero con arquitectura documentada (GQA, RoPE, SwiGLU, RMSNorm), resulta útil para estudiar el comportamiento de modelos pequeños y comparar decisiones de diseño.
- Filtrado o clasificación ligera de texto: con contexto de 2048 tokens puede procesar fragmentos cortos para tareas de etiquetado o categorización simple, aunque sin garantías de alta precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay ningún resultado THOX GATE49 publicado para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,65 GB en bfloat16 (pesos completos); en cuantización Q4_K_M el build GGUF reduce el uso a un rango inferior, aunque no se especifica el valor exacto en la información disponible.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre puede alojar el modelo en bfloat16; no se requieren A100 ni H100.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores, e incluso en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: Ollama (recomendado por el autor, con `ollama run hf.co/Thox-ai/ThoxLLM-327M-v2-GGUF:Q4_K_M`), llama.cpp mediante el build GGUF, y el paquete propietario `thoxllm` para cargar los safetensors. La carga con `AutoModel` de Transformers puede no funcionar porque el `config.json` no incluye la clave `architectures`.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ThoxLLM-327M-v2 | 327M | 2048 | Apache-2.0 | Hugging Face (safetensors + GGUF) | Arquitectura propietaria `thoxllm`; requiere paquete propio o GGUF |
| Modelos decoder-only de ~300M de la familia GPT-2 (referencia de categoría) | ~124M-355M | 1024 | MIT / varias | Hugging Face | Arquitectura estándar cargable con Transformers; benchmarks públicos abundantes |
| Modelos pequeños tipo TinyLlama (referencia de categoría) | ~1.1B | 2048 | Apache-2.0 | Hugging Face | Mayor tamaño y contexto comparable; requiere más VRAM |

No se dispone de datos de rendimiento comparativo para ThoxLLM-327M-v2, por lo que la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Modelo base de 327M: comportamiento de completado, razonamiento limitado y baja fiabilidad factual; es necesario verificar respuestas importantes.
- Sesgos: refleja los sesgos de sus datos de entrenamiento, mayoritariamente en inglés; no se documenta ningún proceso de alineación o mitigación.
- Riesgo de alucinación: elevado para un modelo de este tamaño, especialmente en tareas factuales o de razonamiento complejo.
- Limitaciones de contexto e idioma: ventana máxima de 2048 tokens y calidad reducida fuera del inglés.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificación, pero el autor indica que no es un asistente público alineado en seguridad salvo que se despliegue tras las salvaguardas de THOX.
- Fuera de alcance: decisiones médicas, legales, financieras o de seguridad crítica sin revisión humana; control no supervisado de dispositivos físicos sin paso de confirmación.
- Carga técnica: el checkpoint safetensors no se carga directamente con `AutoModel` estándar; es necesario usar el paquete `thoxllm` o el build GGUF.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thox-ai/ThoxLLM-327M-v2
- Build GGUF: https://huggingface.co/Thox-ai/ThoxLLM-327M-v2-GGUF
- Repositorio Ollama (referencia en la model card): `ollama run Thox-ai/thoxllm`
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
