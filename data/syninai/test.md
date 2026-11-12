# SyninAI/Test

## Resumen

SyninAI/Test es un modelo de lenguaje publicado por SyninAI en Hugging Face el 11 de noviembre de 2026, derivado del modelo base deepseek-ai/DeepSeek-V4-Pro-Base. Se trata de un ajuste fino (fine-tuning) sobre dicho modelo base, con un total de 1.600.790.440.862 parámetros según los pesos en safetensors, lo que lo sitúa en la categoría de modelos de escala muy grande (del orden de 1,6 billones de parámetros). El repositorio ocupa 1606,1 GB y los pesos se distribuyen en formato fp8.

El modelo está etiquetado con la arquitectura deepseek_v4 y declara soporte para cuatro idiomas: inglés, árabe, chino e igbo. El ajuste se ha realizado presumiblemente sobre los conjuntos de datos allenai/Dolci-Instruct-SFT, allenai/Dolci-Instruct-DPO y allenai/Dolci-Instruct-RL, lo que sugiere un pipeline de alineación en tres fases (supervised fine-tuning, optimización directa de preferencias y aprendizaje por refuerzo). La licencia es Apache 2.0.

La relevancia de esta ficha es doble: por un lado, documenta un modelo de gran escala con licencia permisiva; por otro, la información publicada por el autor es extremadamente escasa (la model card no contiene más que metadatos YAML), por lo que muchas especificaciones técnicas y de rendimiento deben marcarse como no disponibles. Esta ficha refleja fielmente esa limitación sin inventar datos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | deepseek_v4 (según tag del repositorio; detalles internos no disponibles) |
| Parámetros totales | 1.600.790.440.862 (1,6 billones) |
| Parámetros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | pesos publicados en fp8; no se documentan otras variantes |
| Idiomas soportados | en, ar, zh, ig |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (fp8) |

## Arquitectura y entrenamiento

La única información disponible sobre la arquitectura es la etiqueta `deepseek_v4` del repositorio y el modelo base declarado, `deepseek-ai/DeepSeek-V4-Pro-Base`. No se detalla en la información proporcionada si se trata de un transformer denso, un mixture-of-experts (MoE), un modelo híbrido o cualquier otra variante, ni se especifica la longitud de contexto nativa, el número de capas, la dimensión oculta o el mecanismo de atención. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

En cuanto al entrenamiento, los metadatos indican el uso de tres datasets de AllenAI: `allenai/Dolci-Instruct-SFT`, `allenai/Dolci-Instruct-DPO` y `allenai/Dolci-Instruct-RL`. Esto apunta a un proceso de alineación en tres etapas: ajuste supervisado sobre instrucciones, optimización de preferencias (DPO) y aprendizaje por refuerzo (RL). No se especifica el número de tokens de entrenamiento, la composición exacta del dataset, la mezcla de idiomas ni si hubo etapas adicionales de preentrenamiento o continuación. El modelo base es una versión cuantizada a fp8 según el tag `base_model:quantized:deepseek-ai/DeepSeek-V4-Pro-Base`.

## Capacidades

- Generación de texto en inglés, árabe, chino e igbo.
- Ajuste por instrucciones (SFT) y alineación por preferencias (DPO/RL), según los datasets declarados.
- Capacidad de razonamiento y respuesta a instrucciones: inferida del pipeline de SFT/DPO/RL, aunque no se documentan evaluaciones que lo confirmen.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas a los cuatro idiomas declarados (en, ar, zh, ig); no se documenta cobertura adicional.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Generación de texto multilingüe en inglés, árabe, chino e igbo: el modelo declara soporte para estos cuatro idiomas, por lo que podría emplearse en tareas de redacción, traducción y resumen en esos mercados lingüísticos, siempre que se valide empíricamente la calidad en cada uno.
- Asistencia conversacional ajustada por instrucciones: al haber sido entrenado con SFT y DPO sobre Dolci-Instruct, es adecuado para construir asistentes que sigan instrucciones y respeten preferencias, aunque la ausencia de benchmarks obliga a evaluar antes de producción.
- Investigación en alineación y RLHF: al documentar el uso de datasets SFT, DPO y RL, sirve como referencia para estudiar pipelines de alineación a gran escala con licencia Apache 2.0.
- Experimentación académica con modelos de gran escala: su licencia permisiva y formato safetensors fp8 facilitan la reproducción de experimentos en entornos con infraestructura de cómputo adecuada.
- Fine-tuning posterior en dominios específicos: al ser un modelo derivado de un base y con licencia Apache 2.0, puede servir como punto de partida para ajustes adicionales en nichos como atención al cliente o documentación técnica, sujeto a la disponibilidad de recursos.
- Evaluación comparativa de modelos DeepSeek: útil para investigadores que quieran contrastar el comportamiento de variantes ajustadas frente al modelo base original en las mismas tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,6 billones de parámetros en fp8, el peso de los parámetros ronda los 1,6 TB, por lo que la inferencia requiere agregados de GPU de varios nodos; no cabe en una sola GPU convencional.
- GPU recomendadas: se requiere un clúster con GPUs de centro de datos (por ejemplo, H100 o A100 de 80 GB) en número suficiente para alojar más de 1,6 TB de pesos, además de memoria para KV cache y activaciones. El número exacto de GPUs no está documentado.
- ¿Cabe en consumer GPU? No, en ningún caso con los datos disponibles.
- Opciones de despliegue: no se documentan en la información proporcionada; por el tamaño, requeriría frameworks de inferencia distribuida (tipo vLLM o TGI con paralelismo de tensor y pipeline), pero no hay confirmación del autor.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SyninAI/Test | 1,6 billones | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| deepseek-ai/DeepSeek-V4-Pro-Base | no disponible en la información | no disponible | no disponible | Hugging Face (modelo base declarado) |
| Alternativas de escala similar | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar rendimiento con modelos de la misma categoría; los datos de benchmarks y de contexto del propio modelo y de su base no están publicados en la información proporcionada.

## Limitaciones y advertencias

- La model card no contiene más que metadatos YAML: no hay documentación de arquitectura, contexto, entrenamiento ni evaluación, lo que dificulta su uso responsable en producción.
- Riesgo de alucinación: inherente a los modelos de lenguaje de gran escala; no se documentan mitigaciones específicas.
- Sesgos conocidos: no documentados; los datasets Dolci-Instruct pueden introducir sesgos propios de su composición, no detallada aquí.
- Cobertura lingüística limitada a en, ar, zh, ig; no se garantiza calidad en otros idiomas.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar el cumplimiento de las licencias de los datasets de entrenamiento y del modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validación comunitaria.
- El tamaño de 1,6 TB en fp8 implica requisitos de hardware muy elevados; no es desplegable en infraestructura convencional.
- No se especifica si el modelo es MoE ni el número de parámetros activos, dato crítico para estimar costes de inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/SyninAI/Test
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro-Base
- Dataset SFT: https://huggingface.co/datasets/allenai/Dolci-Instruct-SFT
- Dataset DPO: https://huggingface.co/datasets/allenai/Dolci-Instruct-DPO
- Dataset RL: https://huggingface.co/datasets/allenai/Dolci-Instruct-RL
