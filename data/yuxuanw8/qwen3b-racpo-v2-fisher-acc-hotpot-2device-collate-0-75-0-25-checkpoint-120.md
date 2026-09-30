# yuxuanw8/qwen3b-racpo-v2-fisher-acc-hotpot-2device-collate-0.75-0.25-checkpoint-120

## Resumen

Se trata de un checkpoint de investigación publicado en Hugging Face por el usuario yuxuanw8 bajo el identificador `qwen3b-racpo-v2-fisher-acc-hotpot-2device-collate-0.75-0.25-checkpoint-120`. Los metadatos del repositorio lo etiquetan como `qwen2`, `text-generation`, `conversational` y `endpoints_compatible`, e indican que se carga con la librería `transformers`. El recuento real de parámetros en los ficheros safetensors es de 3.085.938.688, es decir, un modelo denso de aproximadamente 3.100 millones de parámetros, con un tamaño de repositorio de 12,4 GB.

El nombre del repositorio describe el proceso de ajuste: un entrenamiento de refuerzo (la cadena «racpo-v2» apunta a una variante de optimización de política con restricciones, junto con «fisher», probablemente información de Fisher para regularización) sobre el conjunto de datos HotpotQA, con recompensa de exactitud («acc»), reparto entre dos dispositivos («2device»), proporciones de collate 0,75/0,25 y el checkpoint número 120. Toda esta interpretación procede de la nomenclatura del identificador, no de documentación del autor: la model card es la plantilla automática de Hugging Face y no contiene ni una sola sección rellena, ni licencia, ni idiomas, ni detalles de entrenamiento.

Su relevancia es, por tanto, acotada y de carácter experimental: sirve como artefacto reproducible para estudiar el ajuste por refuerzo sobre tareas de razonamiento multi-salto (multi-hop) con modelos pequeños, y como punto de partida para comparar variantes de la misma serie. No es un modelo listo para producción: no hay benchmarks publicados, no hay licencia declarada y el propio nombre indica que es un checkpoint intermedio de un entrenamiento en curso, no una versión final.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only, familia Qwen2 (etiqueta `qwen2` en el Hub); detalles concretos no disponibles |
| Parámetros totales | 3.085.938.688 (según safetensors) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; solo se publican pesos en safetensors, sin versiones GGUF, AWQ, GPTQ ni bitsandbytes documentadas |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`library_name: transformers`) |
| Tamaño del repositorio | 12,4 GB |
| Pipeline declarado | text-generation |
| Autor | yuxuanw8 |
| Fecha de creación | 29 de septiembre de 2026 (según metadatos del Hub) |
| Última actualización | 29 de septiembre de 2026 (según metadatos del Hub) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La etiqueta `qwen2` del repositorio sitúa el modelo en la familia de arquitecturas Qwen2: un transformer decoder-only con normalización RMSNorm, activación SwiGLU, atención con RoPE y sesgo en las proyecciones de query, key y value, además de grouped-query attention (GQA). El número de capas, cabezas, dimensión oculta, vocabulario y ventana de contexto no se detallan en la información proporcionada, por lo que no se pueden confirmar. El recuento de 3,086 mil millones de parámetros lo sitúa en la gama de 3B, y el tamaño del repositorio (12,4 GB) es coherente con pesos almacenados en precisión de 32 bits, o bien en 16 bits junto con ficheros auxiliares u optimizador.

Respecto al entrenamiento, lo único disponible es lo que sugiere el identificador del repositorio. «RACPO v2» apunta a una segunda iteración de un algoritmo de optimización de política con restricciones orientado a recompensas; «fisher» sugiere el uso de la matriz de información de Fisher, típica en métodos de regularización tipo K-FAC o EWC, o en estimadores de ventaja/divergencia; «acc» indica que la señal de recompensa principal es la exactitud; «hotpot» referencia HotpotQA, un conjunto de preguntas y respuestas multi-salto en inglés; «2device» indica un entrenamiento repartido en dos dispositivos; «collate-0.75-0.25» podría describir proporciones de mezcla de datos o de familias de recompensa; y «checkpoint-120» indica que se trata del punto de guardado número 120, presumiblemente no final. No hay confirmación del número de tokens de entrenamiento, de la composición del dataset, ni de si se aplicaron fases previas de SFT, DPO o RLHF. No se documenta ninguna innovación arquitectónica propia: el interés está en el procedimiento de ajuste por refuerzo, no en cambios de arquitectura.

## Capacidades

- Generación de texto autoregresiva y diálogo multi-turno: la etiqueta `conversational` y el pipeline `text-generation` indican que el modelo está pensado para completar texto y mantener conversaciones, aunque no se especifica si conserva la plantilla de chat original del modelo base.
- Razonamiento multi-salto sobre documentos: el ajuste se realizó sobre HotpotQA, una tarea que exige combinar evidencia de varios pasajes para responder, por lo que cabe esperar cierta especialización en pregunta-respuesta con contexto recuperado.
- Manejo de contexto largo: no confirmado; depende de la configuración heredada del modelo base, que no se detalla en la información disponible.
- Capacidades multilingües: no disponibles; no se declara ninguna lista de idiomas, y HotpotQA es un conjunto en inglés, lo que probablemente sesga el comportamiento hacia ese idioma.
- Tool calling / function calling: no disponible; no hay ninguna referencia a plantillas de herramientas ni a esquemas de funciones en los metadatos.
- Comportamiento agéntico y razonamiento multi-paso explícito: no disponible; no se documenta modo de pensamiento, decodificación especulativa ni bucles de agente.
- Capacidades de visión o audio: no disponibles; es un modelo exclusivamente de texto.
- Capacidades de código o matemáticas: no disponibles como capacidades verificadas; no hay benchmarks ni documentación al respecto.

## Casos de uso

- Reproducción de experimentos de ajuste por refuerzo: el repositorio sirve para replicar y auditar la variante RACPO v2 sobre un modelo de 3B, comparando checkpoints intermedios (como el 120) con los de las series `qwen3b-rlvr-hotpot-checkpoint-60` y `qwen3b-rlcr-hotpot-racpo-v1-checkpoint-120` del mismo autor.
- Investigación en razonamiento multi-salto: evaluar hasta qué punto el ajuste con recompensa de exactitud sobre HotpotQA mejora la composición de evidencia frente al modelo base sin ajustar.
- Pregunta-respuesta sobre documentación corporativa con recuperación previa: integrarlo en un pipeline RAG donde se recuperen varios fragmentos y el modelo sintetice la respuesta; es adecuado por su especialización en multi-salto, pero exige validar antes la calidad real, no publicada.
- Generación de datos sintéticos para destilación: usar el modelo para producir borradores de preguntas y cadenas de razonamiento sobre documentos, que después se filtran y se emplean para entrenar modelos menores.
- Base para ajuste específico de dominio: al ser un checkpoint de 3B con pesos abiertos en safetensors, puede continuarse el entrenamiento con SFT o DPO sobre un corpus propio usando transformers, PEFT o TRL.
- Estudio de olvido catastrófico: comparar el rendimiento del modelo en tareas generales antes y después del ajuste por refuerzo sobre un único conjunto de datos, un análisis metodológico habitual en publicaciones de RL para LLM.
- Prototipado local en hardware de consumo: por su tamaño, permite experimentar con inferencia en una GPU de 8-12 GB en cuantización de 8 o 4 bits, útil para validar ideas antes de escalar a modelos mayores.
- Evaluación de robustez y alucinación: analizar si la optimización agresiva de una recompensa de exactitud degrada la fidelidad factual fuera del dominio de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor es la plantilla automática de Hugging Face y todas las secciones de evaluación aparecen como «[More Information Needed]». El identificador del repositorio menciona «acc» y «hotpot», lo que sugiere que el criterio de recompensa durante el entrenamiento fue la exactitud en HotpotQA, pero no se proporciona ninguna cifra de exactitud, F1 ni comparación con líneas base.

## Requisitos de hardware

- Pesos en fp32: aproximadamente 12,3 GB, coherente con el tamaño de repositorio de 12,4 GB. Requiere alrededor de 14-16 GB de VRAM si se carga completo en GPU, o puede ejecutarse en CPU con memoria RAM suficiente.
- Pesos en bf16/fp16: aproximadamente 6,2 GB. Cabe con holgura en GPUs de 12 GB (RTX 3060 12 GB, RTX 4070, RTX 4080) y en GPUs de 16 GB (RTX 4060 Ti 16 GB, RTX 4090, A10G, L4) dejando margen para la caché KV.
- Cuantización de 8 bits: aproximadamente 3,1 GB de pesos; viable en GPUs de 6-8 GB.
- Cuantización de 4 bits: aproximadamente 1,6-1,8 GB de pesos; viable en GPUs de 4-6 GB, con pérdida de calidad no medida en este caso.
- GPUs recomendadas para servicio con lotes: A100 40/80 GB, H100, L40S o A10G; para uso individual, RTX 4090 o RTX 3090 son suficientes.
- Cabe en GPU de consumo: sí, en la mayoría de modelos recientes de 8 GB o más si se usa fp16, y en GPUs de 6 GB o menos con cuantización de 4 bits.
- Opciones de despliegue: `transformers` (librería declarada), Text Generation Inference (etiqueta `text-generation-inference` presente), vLLM (soporta arquitecturas Qwen2), Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`), y conversión manual a GGUF para llama.cpp u Ollama, ya que no se publican pesos GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones. Cualquier cifra que se cite debe obtenerse midiendo sobre el hardware concreto, teniendo en cuenta que el formato de los pesos influye directamente en el tiempo de carga.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este checkpoint, por lo que la comparación se limita a características estructurales y de licencia de modelos densos de la misma franja de tamaño, tomadas de sus especificaciones públicas.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| yuxuanw8/qwen3b-racpo-v2-...-checkpoint-120 | 3,086 mil millones | no disponible | no disponible | safetensors en Hugging Face, 0 descargas |
| Qwen2.5-3B (base de referencia de la familia) | 3,09 mil millones | 32 768 tokens nativos, ampliable con YaRN | Apache 2.0 | safetensors, GGUF y múltiples cuantizaciones en el Hub |
| Llama 3.2 3B Instruct | 3,21 mil millones | 128 000 tokens | Licencia comunitaria de Llama 3.2 | safetensors y GGUF, amplio ecosistema |
| Phi-3.5-mini-instruct | 3,8 mil millones | 128 000 tokens | MIT | safetensors y GGUF, amplio ecosistema |

La diferencia clave frente a esas alternativas no es de arquitectura ni de tamaño, sino de propósito: este repositorio es un checkpoint intermedio de un experimento de ajuste por refuerzo, sin licencia declarada, sin benchmarks y sin garantías de calidad, mientras que las alternativas son版本 finales con documentación completa, cuantizaciones publicadas y licencias explícitas.

## Limitaciones y advertencias

- La model card es la plantilla automática de Hugging Face: todas las secciones relevantes (uso previsto, datos de entrenamiento, sesgos, evaluación) aparecen sin rellenar, lo que impide auditar el modelo.
- No se declara licencia. Sin una licencia explícita, no hay autorización clara para uso comercial ni para redistribución; conviene contactar con el autor antes de cualquier uso en producción.
- El identificador indica «checkpoint-120», es decir, un punto de guardado intermedio dentro de un entrenamiento, no una versión final publicada. Puede presentar inestabilidad de comportamiento.
- El ajuste se realizó sobre HotpotQA, un conjunto en inglés de pregunta-respuesta multi-salto. Es esperable un sesgo hacia ese idioma y ese formato de tarea, y un posible deterioro de capacidades generales (olvido catastrófico) no cuantificado.
- No hay ninguna evidencia publicada de alineación, ajuste de seguridad ni filtrado de contenido; el riesgo de generar contenido inapropiado, dañino o factualmente incorrecto es el del modelo base, sin mitigaciones documentadas.
- Riesgo de alucinación: en tareas multi-salto, el modelo puede inventar hechos o combinar evidencia incorrectamente. La optimización de una recompensa de exactitud no elimina este problema, y en algunos estudios de RL sobre recompensas verificables se ha observado un aumento de la confianza en respuestas erróneas.
- No se documenta la plantilla de chat ni los tokens especiales. Usar una plantilla incorrecta degrada notablemente la calidad de la generación.
- Alucinaciones y sesgos heredados del corpus de preentrenamiento del modelo base, que no se especifica.
- Sin cuantizaciones publicadas: cualquier uso en GGUF, AWQ o GPTQ exige conversión propia y validación posterior.
- El repositorio apenas tiene tracción (0 descargas, 0 likes) y no hay paper, blog ni demo asociados, lo que reduce la probabilidad de que los fallos hayan sido detectados por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yuxuanw8/qwen3b-racpo-v2-fisher-acc-hotpot-2device-collate-0.75-0.25-checkpoint-120
- Repositorio relacionado del mismo autor (RLVR sobre HotpotQA): https://huggingface.co/yuxuanw8/qwen3b-rlvr-hotpot-checkpoint-60
- Repositorio relacionado del mismo autor (RLCR con RACPO v1): https://huggingface.co/yuxuanw8/qwen3b-rlcr-hotpot-racpo-v1-checkpoint-120
- Repositorio oficial de la familia Qwen3: https://github.com/QwenLM/Qwen3
- Qwen3 Technical Report (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- Qwen3 Technical Report (PDF): https://arxiv.org/pdf/2505.09388
- Referencia citada en la plantilla de la model card, Lacoste et al. (2019), arXiv:1910.09700: https://arxiv.org/abs/1910.09700
- Calculadora de impacto de Machine Learning: https://mlco2.github.io/impact
