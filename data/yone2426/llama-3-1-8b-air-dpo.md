# yone2426/Llama-3.1-8B-AIR-DPO

## Resumen
yone2426/Llama-3.1-8B-AIR-DPO es un checkpoint de investigación publicado en HuggingFace por el usuario yone2426. Según su propia model card, se trata de una implementación basada en un paper (denominada "AIR adversarial checkpoint") y no de un checkpoint publicado por los autores originales del trabajo. El repositorio contiene el backbone completo más unas "tablas AIR" que, según el autor, son obligatorias para cargar el modelo; la carga debe hacerse con `air_adv.model.load_checkpoint` o con el `generate.py` incluido.

El identificador del repositorio sugiere un backbone Llama 3.1 de 8.000 millones de parámetros sometido a una fase de DPO (Direct Preference Optimization) sobre datos de naturaleza adversaria. El tamaño del repositorio (16,2 GB en safetensors) es coherente con un modelo denso de ~8.000 millones de parámetros en precisión de 16 bits, aunque el autor no declara explícitamente ni el número de parámetros ni la arquitectura.

La relevancia del modelo es limitada y estrictamente investigadora: cuenta con 0 descargas y 0 "me gusta", no declara licencia, no incluye benchmarks y no define el pipeline en el Hub. La model card remite a `air_config.json` y `FIDELITY.md` para los detalles de datos, prompts, entrenamiento e implementación, y menciona que Qwen3 es una extensión más allá de los modelos del paper AIR.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el identificador del repositorio sugiere un transformer decoder-only denso tipo Llama 3.1) |
| Parámetros totales | no disponible (los 16,2 GB en safetensors son compatibles con ~8.000 millones de parámetros en fp16, pero el autor no lo declara) |
| Parámetros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el repositorio solo publica safetensors y no incluye GGUF, GPTQ ni AWQ |
| Idiomas soportados | no disponible |
| Licencia | no disponible (no declarada en el repositorio) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
La información disponible no permite describir la arquitectura con detalle. La model card indica únicamente que se requiere el backbone completo junto con las "tablas AIR", lo que sugiere la incorporación de estructuras adicionales sobre el modelo base más allá de un fine-tuning convencional. El nombre del repositorio apunta a un backbone Llama 3.1 de 8B y a una etapa de DPO, pero ninguno de estos extremos está confirmado en la documentación publicada.

El autor declara explícitamente que se trata de una "implementación basada en un paper, no un checkpoint publicado por los autores", y delega los detalles de datos de entrenamiento, prompts, elecciones de implementación y fidelidad respecto al trabajo original a los ficheros `air_config.json` y `FIDELITY.md` del propio repositorio. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF adicional. La model card menciona que Qwen3 es una extensión fuera de los modelos del paper AIR, lo que indica que este repositorio forma parte de una familia de réplicas sobre distintos backbones.

## Capacidades
- La model card no documenta capacidades explícitas de generación, razonamiento, código, matemáticas ni visión.
- El propósito declarado es servir como "checkpoint adversarial", por lo que su uso previsto parece orientado a evaluación de robustez y seguridad más que a tareas de propósito general.
- No se declara soporte de tool calling ni de function calling.
- No se declara soporte para agentes ni para razonamiento multi-paso.
- No se declaran capacidades multilingües ni un listado de idiomas.
- No se declara modo de razonamiento (thinking mode), entrada de audio ni entrada de imagen.
- La generación de texto es posible en la medida en que el backbone subyacente lo permita, pero debe invocarse a través del cargador propio del repositorio, no mediante el pipeline estándar de transformers.

## Casos de uso
- Replicación de resultados del paper AIR sobre un backbone Llama 3.1 de 8B: el repositorio está pensado para reproducir las condiciones experimentales del trabajo original usando el backbone y las tablas AIR incluidas.
- Evaluación de robustez adversarial de sistemas que ya usan Llama 3.1 8B: permite comparar el comportamiento del backbone original frente al ajustado con DPO sobre datos adversarios.
- Comparación de transferibilidad entre backbones: la mención a Qwen3 en la model card sugiere que la familia de repositorios busca medir si los efectos observados en un backbone se reproducen en otro.
- Auditoría de procesos de DPO: al existir un ajuste por preferencias sobre datos adversarios, el checkpoint permite estudiar qué cambia en las respuestas respecto al modelo base y si aparecen regresiones en tareas generales.
- Generación de conjuntos de prompts adversarios para investigación en seguridad: el checkpoint puede emplearse como generador dentro de un ciclo de red teaming, siempre que se validen manualmente las salidas.
- Investigación de interpretabilidad comparada: disponer del backbone y de las tablas AIR por separado facilita análisis de diferencias de activaciones o pesos antes y después del ajuste.
- Docencia y experimentación académica con recursos limitados: un modelo de ~8B en cuantización de 4 bits puede ejecutarse en una única GPU de 16-24 GB, lo que lo hace accesible para prácticas de laboratorio.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM para inferencia en fp16/BF16: aproximadamente 16 GB solo para los pesos, más caché KV y overhead, lo que sitúa el consumo realista en 18-20 GB.
- VRAM en 8 bits: en torno a 8-9 GB, si se genera la cuantización por cuenta propia, ya que el repositorio no la incluye.
- VRAM en 4 bits: en torno a 5-6 GB, también mediante cuantización propia.
- Las tablas AIR requieren memoria adicional cuyo tamaño no se especifica en la información disponible.
- GPU recomendadas para fp16: A100 (40/80 GB), H100, L40S (48 GB) o cualquier GPU con 24 GB o más.
- Cabe en GPU de consumo: sí, en RTX 4090 o RTX 3090 (24 GB) en fp16 ajustado o en 8/4 bits; en GPUs de 16 GB conviene cuantizar.
- Opciones de despliegue: el autor indica cargar con `air_adv.model.load_checkpoint` o con el `generate.py` incluido, previa instalación con `pip install -e .`. No se declara compatibilidad con vLLM, TGI, llama.cpp ni Ollama, y no se publican pesos GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| yone2426/Llama-3.1-8B-AIR-DPO | no disponible (~8B por el tamaño del repo) | no disponible | no disponible | safetensors en HuggingFace, 0 descargas |
| meta-llama/Llama-3.1-8B-Instruct | ~8.030 millones | 128.000 tokens | Llama 3.1 Community License | safetensors, ampliamente desplegado |
| Qwen/Qwen2.5-7B-Instruct | ~7.610 millones | 32.768 tokens nativos (ampliable con YaRN) | Apache 2.0 | safetensors y GGUF |
| mistralai/Mistral-7B-Instruct-v0.3 | ~7.250 millones | 32.768 tokens | Apache 2.0 | safetensors y GGUF |

Los datos de los tres modelos de referencia provienen de sus respectivas model cards públicas y se incluyen únicamente como contexto de categoría; no proceden de la información suministrada sobre el modelo objeto de esta ficha. No se dispone de métricas comparativas de rendimiento para el checkpoint AIR, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias
- No se declara licencia en el repositorio, por lo que no puede asumirse ningún derecho de uso comercial.
- Se trata de una réplica basada en un paper y no de un checkpoint publicado por los autores originales; la fidelidad respecto al trabajo de referencia no está verificada de forma independiente y el propio autor remite a `FIDELITY.md`.
- El repositorio registra 0 descargas y 0 "me gusta", por lo que no existe validación por parte de terceros.
- La búsqueda web no devolvió ninguna referencia útil al modelo: los resultados obtenidos corresponden a anuncios de bombas de agua en Oriente Medio y no guardan relación con el repositorio.
- Los metadatos del Hub indican una fecha de creación de 2026-09-13, posterior a la fecha habitual de consulta, lo que apunta a una posible inconsistencia de metadatos que conviene verificar.
- No se publican benchmarks, evaluaciones de seguridad ni pruebas de regresión frente al modelo base.
- La carga requiere código propio (`air_adv`) y las tablas AIR; no es posible usar el pipeline estándar de transformers ni las herramientas habituales de servido sin trabajo de adaptación.
- No se declara el pipeline en el Hub, por lo que el modelo no aparece indexado como `text-generation`.
- Riesgo de alucinación propio de un modelo de ~8.000 millones de parámetros, sin mitigaciones documentadas.
- Un ajuste por DPO sobre datos adversarios puede degradar capacidades generales del backbone; es una hipótesis razonable, pero no está medida ni documentada en la información disponible.
- No se declaran idiomas soportados, por lo que la cobertura multilingüe es desconocida.
- Si el modelo deriva de Llama 3.1, es probable que apliquen los términos de la Llama 3.1 Community License, pero esto no está confirmado en el repositorio y no debe darse por supuesto.

## Enlaces
- Repositorio en HuggingFace: https://huggingface.co/yone2426/Llama-3.1-8B-AIR-DPO
- Ficheros referenciados dentro del repositorio: `air_config.json` y `FIDELITY.md` (sin enlace directo disponible en la información proporcionada)
- Paper del método AIR: no disponible en la información proporcionada
- Blog, demo o repositorio de código asociado: no disponible
- Resultados de búsqueda web relevantes: no disponible (los resultados obtenidos no guardan relación con el modelo)
