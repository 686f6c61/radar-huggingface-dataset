# timesmith/Inkling-2-Mini-oQ2.7e

## Resumen

Inkling-2-Mini-oQ2.7e es una versión cuantizada del modelo Inkling-2-Mini, publicada por el usuario timesmith en Hugging Face. Se trata de un checkpoint de aproximadamente 26.400 millones de parámetros (26.388B en el modelo de lenguaje, más 0.318B en un componente de visión) que ha sido comprimido mediante cuantización de precisión mixta con la herramienta oQ (oMLX v0.8.3), alcanzando un promedio efectivo de 3.596 bits por peso. El resultado es un artefacto de 12 GB que, sin cuantizar en BF16, ocuparía aproximadamente 53 GB.

El modelo está empaquetado en formato MLX, la librería de Apple para ejecutar modelos en silicio de la compañía (chips M-series), lo que lo hace relevante para desarrolladores que quieran desplegar un modelo de ~26B con capacidades multimodales en hardware de Apple con memoria unificada de gama alta. La cuantización mixta es la innovación principal: en lugar de aplicar una precisión uniforme, distribuye los pesos entre 2, 3, 8 bits y BF16/FP32 según su sensibilidad, preservando en alta precisión una fracción pequeña del modelo (los tensores más críticos) mientras comprime agresivamente el grueso.

No se dispone de información publicada sobre la arquitectura interna, los datos de entrenamiento, los idiomas soportados ni la licencia del modelo original. La model card únicamente documenta el proceso de cuantización y el desglose de almacenamiento. Cualquier evaluación de capacidades debe por tanto tratarse como no verificada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el tag `inkling2_loop` sugiere una arquitectura propietaria denominada "loop"; no se detalla) |
| Parámetros totales | 26.388.641.280 (modelo de lenguaje) + 0.318B (visión) ≈ 26.707B lógicos |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Mixta: affine 2-bit (grupo 64), affine 3-bit (grupo 64), affine 8-bit (grupo 64), BF16 y FP32; promedio efectivo 3.596 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), cuantización oQ |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo base Inkling-2-Mini: se desconoce si es un transformer denso, un MoE, un modelo híbrido o una arquitectura propietaria. El tag `inkling2_loop` presente en el repositorio apunta a una familia o variante denominada "loop", pero no hay documentación que aclare su funcionamiento. Tampoco se detallan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO.

Lo que sí está documentado es el proceso de cuantización. La herramienta oQ (oMLX v0.8.3) aplica precisión mixta asignando distintos esquemas según el tensor: el 53.4% de los pesos lógicos (14.269B) se almacenan en affine 2-bit con grupo de 64, el 38.2% (10.192B) en affine 3-bit, el 5.9% (1.572B) en affine 8-bit, el 2.4% (0.637B) en BF16 y un residual del 0.13% (0.036B) en FP32. Esta distribución busca minimizar la pérdida de calidad concentrando la precisión en las capas o tensores más sensibles, mientras comprime el resto de forma agresiva. El checkpoint resultante ocupa 12.006 GB en disco (11.182 GiB), de los cuales 11.370 GB corresponden al modelo de lenguaje y 0.637 GB al componente de visión.

## Capacidades

- Generación de texto: capacidad esperada por tratarse de un modelo de lenguaje de ~26B, aunque no verificada en la información disponible.
- Procesamiento de visión: el checkpoint incluye un componente de visión de 0.318B parámetros, lo que indica soporte multimodal de entrada de imágenes, aunque no se detalla su alcance.
- Razonamiento y código: no disponible; no hay documentación que confirme ni descarte estas capacidades.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se especifican idiomas.
- Modo "thinking" u otras capacidades especiales: no disponible.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el formato MLX y los 12 GB del checkpoint permiten cargar el modelo en un Mac con 32 GB o más de memoria unificada (M2 Pro/Max, M3 Pro/Max, M4 Pro/Max), algo inviable con el modelo en BF16 (~53 GB).
- Prototipado de aplicaciones multimodales en Apple Silicon: el componente de visión integrado permite experimentar con tareas imagen-texto sin depender de servicios en la nube, siempre que se valide empíricamente la calidad del componente cuantizado.
- Investigación sobre cuantización mixta: el desglose detallado de bits por componente lo convierte en un artefacto útil para estudiar el impacto de distintas asignaciones de precisión en la calidad final del modelo.
- Despliegue de bajo consumo en estaciones de trabajo Apple: para equipos que ya trabajan en el ecosistema MLX y necesitan un modelo de ~26B con huella de memoria reducida.
- Evaluación comparativa de checkpoints cuantizados: permite contrastar el rendimiento de esta cuantización oQ frente a otras alternativas (GGUF, AWQ, etc.) del mismo modelo base, si estuvieran disponibles.
- Experimentación con pipelines de visión-lenguaje en local: adecuado para pruebas de concepto donde la privacidad de los datos impide enviarlos a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: ~12 GB solo para los pesos; con overhead de contexto y caché KV, se recomienda un mínimo de 16-24 GB de memoria unificada.
- GPU recomendadas: el formato MLX está diseñado para Apple Silicon (M1/M2/M3/M4 en variantes Pro, Max y Ultra). No es directamente compatible con CUDA sin conversión.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí: un Mac con 32 GB de memoria unificada puede alojarlo con margen. En GPUs NVIDIA de consumo (RTX 4090 con 24 GB) requeriría conversión de formato y verificación de compatibilidad, no documentada.
- Opciones de despliegue: MLX (librería nativa), mlx-lm para el modelo de lenguaje. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-oQ2.7e | ~26.7B | no disponible | MLX safetensors (oQ mixta) | no disponible | Hugging Face (0 descargas) |
| Modelo base Inkling-2-Mini (BF16) | ~26.7B | no disponible | no disponible | no disponible | no confirmada en la información |
| Alternativas de ~27B en MLX | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos de la misma categoría.

## Limitaciones y advertencias

- La cuantización a un promedio de 3.596 bits/peso, con más del 53% de los pesos en 2 bits, implica una degradación de calidad no cuantificada; no hay evaluaciones publicadas que midan la pérdida respecto al modelo original.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado con 12 segundos de diferencia, lo que sugiere un artefacto recién subido y sin validación por parte de la comunidad.
- No se especifica la licencia, por lo que no puede asumirse permiso para uso comercial; es imprescindible contactar con el autor o consultar la licencia del modelo base antes de cualquier despliegue en producción.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas del modelo base.
- El formato MLX limita el uso a hardware Apple; no es portable a CUDA sin conversión.
- El autor del repositorio (timesmith) es un usuario independiente, no necesariamente el desarrollador del modelo original; la trazabilidad y el soporte no están garantizados.
- El componente de visión representa solo el 1.2% de los parámetros lógicos y está cuantizado parcialmente, por lo que su calidad es incierta.

## Enlaces

- Hugging Face: https://huggingface.co/timesmith/Inkling-2-Mini-oQ2.7e
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Modelo base Inkling-2-Mini: no disponible en la información proporcionada
- Paper, blog o demo del modelo: no disponible
