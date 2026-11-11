# TheWhyAI/prod_jev

## Resumen

prod_jev es un modelo de generación de texto derivado de Qwen/Qwen3.5-9B, publicado por TheWhyAI y orientado a la toma de decisiones automatizada ("decision-making") en entornos de producción. Se distribuye como un checkpoint cuantizado en NVFP4 (formato FP4 de NVIDIA con factores de bloque microescalados, generado con ModelOpt) y está pensado para servirse en vLLM con alta concurrencia. El repositorio ocupa 8,0 GB y contiene 8.953.803.264 parámetros, coherentes con un transformer denso de aproximadamente 9B.

La propuesta del autor es fundamentalmente de despliegue: el modelo card destaca una capacidad de caché KV de 5,09 millones de tokens sobre GB10 (SM 12.1), lo que se traduce en una concurrencia declarada de 310,9× a 16K de contexto, y un resultado de 78,70 % de precisión en decisiones sobre un conjunto de evaluación retenido del denominado "Jev Decision Index", con 45,05 ms por petición. No se documentan detalles sobre el proceso de ajuste, los datos de entrenamiento ni la composición del conjunto de evaluación.

Es relevante ahora porque combina tres piezas que interesan a quien despliega modelos en producción: una base reciente de la familia Qwen3.5, una cuantización FP4 nativa de NVIDIA integrada en el ecosistema vLLM, y una licencia Apache 2.0 que permite uso comercial sin restricciones adicionales. La contrapartida es la escasez de documentación técnica verificable más allá de las cifras aportadas por el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.5-9B-Base); tag `qwen3_5_text` |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el model card menciona evaluaciones a 16K de contexto, no el máximo soportado) |
| Tipos de cuantizacion | NVFP4 (FP4 de NVIDIA con factores de bloque microescalados, ModelOpt); el repo incluye también tags de 8-bit |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 8,0 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-9B-Base, un transformer denso de aproximadamente 9B parámetros, y se publica como un checkpoint cuantizado en NVFP4. La cuantización emplea pesos FP4 con factores de escala por bloque de grano fino (micro-scaled block factors), el esquema que NVIDIA integra a través de ModelOpt y que vLLM consume de forma nativa. El repositorio incluye además etiquetas de 8-bit, lo que sugiere la presencia de artefactos o configuraciones adicionales de precisión mixta, aunque el model card no detalla su contenido.

No hay información publicada sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni sobre el procedimiento de ajuste que da lugar al comportamiento de "toma de decisiones" (tag `rlcd`, presumiblemente aprendizaje por refuerzo a partir de retroalimentación generada por IA, aunque no se confirma). Tampoco se documentan innovaciones de decodificación o atención. La única innovación verificable es la propia cuantización NVFP4 y su encaje en vLLM para servicio concurrente.

## Capacidades

- Generación de texto conversacional y de propósito general, heredada de la base Qwen3.5-9B.
- Toma de decisiones estructurada: el autor reporta 78,70 % de precisión en un conjunto retenido del "Jev Decision Index".
- Servicio de alta concurrencia en vLLM: 310,9× de concurrencia declarada a 16K de contexto sobre GB10 (SM 12.1).
- Capacidad de caché KV de 5,09 millones de tokens en el hardware de referencia citado.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Enrutamiento y clasificación de decisiones en pipelines de producción: el modelo puede actuar como clasificador o decisor sobre entradas de texto, apoyándose en la precisión declarada del 78,70 % en el índice del autor para tareas de decisión acotadas.
- Servicio conversacional de alto volumen: con 310,9× de concurrencia a 16K de contexto sobre GB10, es adecuado para atender muchas sesiones simultáneas con ventanas largas en un solo nodo.
- Procesamiento de documentos largos por lotes: la capacidad de caché KV de 5,09 millones de tokens permite mantener en memoria muchas secuencias de 16K simultáneas, útil para resumen o extracción sobre corpus extensos.
- Despliegue en infraestructura NVIDIA Blackwell o GB10: al ser NVFP4 con ModelOpt, se integra directamente en vLLM sobre hardware con soporte FP4, reduciendo el coste por token frente a FP16/BF16.
- Backend de agentes con restricciones de latencia: los 45,05 ms por petición reportados lo hacen viable como componente de decisión dentro de bucles agénticos, siempre que se valide el comportamiento real en la tarea concreta.
- Prototipado e investigación sobre cuantización FP4: sirve como referencia práctica para medir el impacto de NVFP4 en calidad y throughput frente al modelo base en BF16.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Jev Decision Index (held-out) | 78,70 % de precisión | Conjunto de evaluación propio del autor; no verificable de forma independiente |
| Latencia por petición | 45,05 ms/req | Hardware de referencia no especificado con detalle (GB10 / SM 12.1) |
| Concurrencia | 310,9× a 16K de contexto | Sobre GB10, con 5,09M de tokens de capacidad KV |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las cifras anteriores proceden exclusivamente del model card del autor y no cuentan con validación externa.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 8,0 GB en NVFP4, por lo que los pesos caben holgadamente en GPUs de 12-16 GB; el consumo real dependerá de la caché KV, que a 16K de contexto y alta concurrencia puede dominar el uso de memoria.
- GPU recomendadas: hardware NVIDIA con soporte FP4, en particular Blackwell y GB10 (SM 12.1), que es la plataforma citada en el model card. No se garantiza funcionamiento en arquitecturas anteriores sin conversión.
- Cabe en GPU de consumo: previsiblemente sí en cuanto a pesos (RTX 4090 de 24 GB, RTX 5090), pero la ventaja de NVFP4 requiere soporte nativo de FP4, ausente en generaciones previas a Blackwell.
- Opciones de despliegue: vLLM es el runtime objetivo declarado; el formato safetensors con ModelOpt es compatible con el flujo de compilación de vLLM. No se menciona soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: 45,05 ms por petición y 310,9× de concurrencia a 16K sobre GB10 según el autor; no hay datos para otras plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| prod_jev (TheWhyAI) | 8,95B | no disponible (evaluado a 16K) | NVFP4 / 8-bit | Apache 2.0 | Ajustado para decisión; métricas solo del autor |
| Qwen/Qwen3.5-9B (base) | ~9B | no disponible en esta ficha | BF16 y otras | Apache 2.0 (según base) | Modelo original sin ajuste de decisión ni cuantización FP4 |
| Alternativas de ~9B en FP4 | no disponible | no disponible | NVFP4 | no disponible | No se dispone de datos comparables verificables en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con modelos de la misma categoría más allá del propio modelo base.

## Limitaciones y advertencias

- Las métricas del model card (78,70 % de precisión, 45,05 ms/req, 310,9× de concurrencia) proceden del autor y no han sido verificadas de forma independiente; el "Jev Decision Index" no es un benchmark público conocido.
- No se documenta el proceso de ajuste ni los datos empleados, por lo que no es posible evaluar sesgos, contaminación del conjunto de evaluación ni generalización fuera del dominio objetivo.
- Riesgo de alucinación inherente a un modelo de ~9B sin documentación de alineación; en tareas de decisión crítica conviene validación humana o reglas externas.
- Idiomas soportados no declarados: el comportamiento multilingüe es incierto y debe probarse antes de desplegar en producción.
- La cuantización NVFP4 puede degradar la calidad frente al modelo base en BF16; no se aportan comparativas de calidad entre ambos.
- El despliegue óptimo depende de hardware con soporte FP4 (Blackwell/GB10); en otras GPUs el rendimiento y la compatibilidad no están garantizados.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe cumplir las condiciones de la licencia del modelo base Qwen3.5-9B y de las dependencias de ModelOpt y vLLM.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/TheWhyAI/prod_jev
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- NVIDIA ModelOpt: no disponible en la información proporcionada
- vLLM: no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
