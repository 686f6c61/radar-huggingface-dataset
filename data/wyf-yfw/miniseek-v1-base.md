# wyf-yfw/MiniSeek-V1-base

## Resumen

MiniSeek-V1-base es un modelo de lenguaje de tipo decoder-only con arquitectura Mixture-of-Experts (MoE) desarrollado por el usuario wyf-yfw. Se presenta como una reproducción a escala reducida de la pila de componentes de DeepSeek-V4.1-Flash, con un total de 186.933.744 parámetros (aproximadamente 186,93 millones). El modelo es un checkpoint de preentrenamiento puro, sin ajuste fino supervisado ni alineación conversacional; el autor publica una versión de chat separada bajo el identificador MiniSeek-V1.

La relevancia del modelo es fundamentalmente didáctica y experimental: se trata de una implementación de bolsillo que combina mecanismos propios de arquitecturas MoE modernas (expertos enrutados con top-6, un experto compartido, atención con ventana deslizante e índice comprimido, y módulos denominados mHC y Engram) sobre un vocabulario reducido de 6.400 tokens. Con 904 descargas y licencia MIT, su interés radica en servir como banco de pruebas reproducible de estas técnicas en hardware muy modesto.

No obstante, sus dimensiones y su entrenamiento son muy limitados: solo 10.000 pasos de preentrenamiento con una longitud de contexto de 256 tokens. El propio autor advierte de que la capacidad de continuación de texto es todavía incipiente y que el modelo no está pensado para uso conversacional directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE (1 experto compartido + 64 enrutados, top-6), atención con ventana deslizante e índice comprimido, módulos mHC y Engram |
| Parametros totales | 186.933.744 (~186,93 M) |
| Parametros activos | 6 de 64 expertos enrutados por token, más el experto compartido (número exacto de parámetros activos no disponible) |
| Longitud de contexto | 256 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32; entrenamiento en BF16) |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors, FP32) |
| Dimension del modelo (dim) | 512 |
| Numero de capas | 8 |
| Vocabulario | 6.400 tokens (tokenizador MiniMind) |
| Precision de entrenamiento | BF16 |
| Libreria | PyTorch (compatible con AutoModelForCausalLM de Transformers) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only con un bloque MoE que combina un experto compartido y 64 expertos enrutados, de los cuales se activan 6 por token (top-6), con una dimensión interna de experto de 176. La dimensión del modelo es 512 y consta de 8 capas. La atención emplea consultas de bajo rango, clave-valor compartidas y un mecanismo de ventana deslizante con índice comprimido (index topk=64). El enrutamiento utiliza sqrt-softplus con sesgo, un route_scale de 1,5 y un clamp SwiGLU de 10. Además, incorpora módulos mHC (4 flujos, Sinkhorn con 20 iteraciones) y Engram en las capas 1 y 3. El embedding y la cabeza LM no comparten pesos.

El entrenamiento se realizó sobre el conjunto de datos `pretrain_mix_12g_clean.jsonl`, con una longitud máxima de secuencia de 256 tokens y un tamaño de batch de 24 con empaquetado (pack). Se completaron 10.000 pasos con el optimizador AdamW, una tasa de aprendizaje de 3e-4 decayendo hasta 1e-6, 200 pasos de warmup y un coeficiente auxiliar de 1e-4. El checkpoint publicado corresponde al paso 10.000, con una pérdida de entrenamiento de aproximadamente 3,7117 y una pérdida de validación de aproximadamente 3,05. No se menciona en la información disponible el uso de RLHF, DPO ni ajuste fino supervisado en este checkpoint.

## Capacidades

- Generación de texto por continuación (autocompletado) en chino e inglés, propio de un modelo de preentrenamiento.
- Razonamiento básico y modelado del lenguaje derivado del preentrenamiento, limitado por el tamaño y el número de pasos.
- Soporte de plantilla de chat ChatML en el tokenizador, aunque el modelo no está ajustado para conversación.
- Compatibilidad con la API estándar `AutoModelForCausalLM` de Transformers mediante `trust_remote_code=True`.
- No se ha documentado soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Investigación sobre arquitecturas MoE: el modelo permite experimentar con enrutamiento top-6, expertos compartidos y balanceo de carga en un entorno de menos de 200 M de parámetros, sin necesidad de grandes clústeres.
- Estudio de mecanismos de atención eficiente: su combinación de ventana deslizante, índice comprimido y KV compartidas sirve para analizar el compromiso entre coste computacional y calidad en contextos de 256 tokens.
- Reproducción de técnicas de DeepSeek a pequeña escala: útil para docencia o para validar implementaciones de componentes como mHC o Engram antes de escalarlas.
- Generación de texto corto en chino para tareas de autocompletado o plantillas, siempre que se acepte la calidad limitada de un modelo de 187 M con 10.000 pasos.
- Base para ajuste fino posterior: al ser un checkpoint de preentrenamiento con licencia MIT, puede servir como punto de partida para SFT o DPO en dominios concretos con recursos modestos.
- Pruebas de integración y pipelines: su reducido tamaño (0,7 GB en el repositorio) facilita probar flujos de despliegue con Transformers, carga con `device_map="auto"` y validación de plantillas ChatML en entornos de CI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de entrenamiento: pérdida de entrenamiento de aproximadamente 3,7117 en el paso 10.000 y pérdida de validación de aproximadamente 3,05.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~187 M de parámetros en FP32, los pesos ocupan aproximadamente 0,75 GB; en BF16/FP16, unos 0,37 GB. Con overhead de activaciones y caché KV para 256 tokens, cabe holgadamente en menos de 2 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; por ejemplo, RTX 3060, RTX 4060, RTX 4090. También funciona en CPU.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU para inferencia puntual.
- Opciones de despliegue: Transformers con `AutoModelForCausalLM` y `trust_remote_code=True`; no se ha documentado soporte específico para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniSeek-V1-base | ~186,93 M | 256 | MoE decoder-only (1+64, top-6) | MIT | Hugging Face |
| MiniSeek-M0.1-base | no disponible | no disponible | MoE (1+32, top-2 MoELM) | no disponible | Hugging Face |
| MiniSeek-V1 (chat) | no disponible | no disponible | MoE decoder-only, con SFT | no disponible | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar el rendimiento con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo exclusivamente de preentrenamiento: no ha recibido ajuste fino supervisado ni alineación, por lo que no debe usarse como asistente conversacional sin un post-entrenamiento adicional.
- Contexto muy corto: 256 tokens de entrenamiento limitan gravemente las tareas que requieran contexto largo.
- Entrenamiento breve: solo 10.000 pasos, con una pérdida de validación de ~3,05; el autor reconoce que la continuación de texto es todavía incipiente.
- Riesgo elevado de alucinación y de generación incoherente, esperable en un modelo de este tamaño y con este volumen de entrenamiento.
- Idiomas limitados a chino e inglés; no se ha documentado soporte para castellano.
- Vocabulario reducido de 6.400 tokens, lo que puede afectar a la eficiencia y calidad en textos fuera de dominio.
- No se han publicado evaluaciones de sesgos; se desconoce su comportamiento en este aspecto.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre la calidad ni la idoneidad para producción.
- Requiere `trust_remote_code=True` para cargar el modelo, lo que implica ejecutar código personalizado del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wyf-yfw/MiniSeek-V1-base
- Versión de chat: https://huggingface.co/wyf-yfw/MiniSeek-V1
- Modelo predecesor: https://huggingface.co/wyf-yfw/MiniSeek-M0.1-base
- Repositorio de código: https://github.com/wyf-yfw/miniseek
- Licencia: https://huggingface.co/wyf-yfw/MiniSeek-V1-base/blob/main/LICENSE
