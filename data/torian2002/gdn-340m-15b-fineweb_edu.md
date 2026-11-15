# Torian2002/GDN-340M-15B-Fineweb_Edu

## Resumen

GDN-340M-15B-Fineweb_Edu es un modelo de lenguaje publicado por el usuario Torian2002 en Hugging Face bajo licencia Apache 2.0. Por la nomenclatura del identificador, se trata de un modelo de aproximadamente 340 millones de parámetros entrenado sobre aproximadamente 15.000 millones de tokens del subconjunto Fineweb-Edu, un corpus educativo filtrado por calidad. El prefijo "GDN" sugiere el uso de Gated DeltaNet, una arquitectura de atención lineal con estado recurrente, aunque esta información no está confirmada en la documentación disponible.

La relevancia del modelo radica en su escala: un modelo pequeño (~340M) entrenado con un presupuesto de tokens muy superior al óptimo de Chinchilla, lo que lo sitúa en la línea de los modelos "over-trained" orientados a eficiencia en inferencia. Esto lo hace potencialmente interesante para despliegue en hardware modesto, experimentación académica y ajuste fino sobre dominio específico.

No obstante, la model card publicada está prácticamente vacía (solo contiene la declaración de licencia), no hay pipeline declarado, cero descargas y cero likes en el momento de la consulta, y no se han publicado benchmarks, detalles de arquitectura ni instrucciones de uso. La ficha siguiente refleja esta situación y marca como "no disponible" todo dato no confirmado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el prefijo "GDN" sugiere Gated DeltaNet, no confirmado) |
| Parámetros totales | ~340M (inferido del identificador, no confirmado) |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La información pública no detalla la arquitectura interna. El identificador "GDN" es compatible con Gated DeltaNet, una familia de modelos de atención lineal con decaimiento selectivo que combina un estado recurrente con compuertas de actualización, pero no hay confirmación en la model card ni documentación técnica asociada. Tampoco se especifican el número de capas, la dimensión oculta, el número de cabezas de atención ni el tokenizador empleado.

Respecto al entrenamiento, el sufijo "15B-Fineweb_Edu" indica que el modelo se habría entrenado sobre aproximadamente 15.000 millones de tokens del dataset Fineweb-Edu, una selección de documentos web filtrados por su valor educativo mediante un clasificador. No se documentan la composición exacta del corpus, la mezcla de datos, la existencia de fases de ajuste supervisado, RLHF o DPO, ni hiperparámetros de entrenamiento (learning rate, batch size, warmup, schedule). Tampoco se indica si el modelo es base o ha recibido ajuste instructivo.

## Capacidades

- Generación de texto autoregresiva: capacidad esperable en un modelo de lenguaje causal, aunque no verificada empíricamente por falta de documentación y benchmarks.
- Razonamiento y conocimiento general: el entrenamiento sobre Fineweb-Edu apunta a un sesgo hacia contenido educativo, sin datos que cuantifiquen el rendimiento.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declara el conjunto de idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Experimentación académica con arquitecturas de atención lineal: el tamaño de ~340M permite entrenar y evaluar variantes en una sola GPU consumer, útil para reproducir estudios sobre Gated DeltaNet u otras arquitecturas recurrentes.
- Ajuste fino sobre dominio específico (LoRA/QLoRA): con 340M de parámetros, el fine-tuning completo o con adaptadores es viable en GPUs de 24 GB, por ejemplo para clasificación de textos educativos o generación de resúmenes de material didáctico.
- Destilación de modelos mayores: un modelo base de este tamaño entrenado sobre un corpus educativo puede servir como estudiante en pipelines de destilación de conocimiento desde modelos de 7B-70B.
- Prototipado de asistentes de estudio: dado el sesgo hacia Fineweb-Edu, podría emplearse como base para un tutor conversacional tras un ajuste instructivo, aunque requiere validación previa.
- Investigación sobre leyes de escalado: el ratio de ~44 tokens por parámetro (15B/340M) lo convierte en un punto de datos útil para estudiar el efecto del sobreentrenamiento en modelos pequeños.
- Despliegue en entornos con recursos limitados: si la arquitectura es de atención lineal, el coste de inferencia en contextos largos sería menor que el de un transformer denso equivalente, lo que abriría la puerta a aplicaciones de streaming en CPU o GPUs de gama baja.
- Generación de datos sintéticos: como modelo base pequeño, puede utilizarse para producir grandes volúmenes de texto de bajo coste en pipelines de aumento de datos, con supervisión humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~340M de parámetros, en FP16 se requieren aproximadamente 0,7 GB de pesos; en cuantización de 8 bits, ~0,35 GB; en 4 bits, ~0,2 GB. Estas cifras son estimaciones basadas en el tamaño inferido y no en mediciones publicadas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM efectiva para FP16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes.
- Compatibilidad con GPU consumer: sí, cabe en cualquier GPU consumer moderna e incluso en iGPUs con memoria unificada.
- Opciones de despliegue: no se documentan; en función del formato de pesos (no disponible) podría requerir llama.cpp, vLLM, TGI u Ollama, pero no hay confirmación de compatibilidad.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| GDN-340M-15B-Fineweb_Edu | ~340M (inferido) | no disponible | Apache 2.0 | Hugging Face, sin documentación |
| SmolLM2-360M (HuggingFaceTB) | 362M | 8.192 tokens | Apache 2.0 | Hugging Face, model card completa y benchmarks |
| Qwen2.5-0.5B | 494M | 32.768 tokens | Apache 2.0 | Hugging Face, benchmarks publicados |
| Pythia-410M (EleutherAI) | 410M | 2.048 tokens | Apache 2.0 | Hugging Face, suite de checkpoints y paper |

La comparativa se limita a parámetros, contexto y licencia porque no existen datos de rendimiento del modelo analizado. Frente a SmolLM2-360M, Qwen2.5-0.5B y Pythia-410M, el modelo de Torian2002 carece de model card detallada, benchmarks y comunidad, lo que dificulta una evaluación objetiva.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card solo contiene la licencia, sin instrucciones de uso, tokenizador, plantilla de chat ni ejemplos.
- Sin benchmarks publicados: no es posible verificar calidad, sesgos ni capacidades reales.
- Riesgo de alucinación: inherente a cualquier modelo de lenguaje; en un modelo de 340M entrenado sobre web, el riesgo es elevado y no está cuantificado.
- Sesgos conocidos: no documentados; el corpus Fineweb-Edu puede heredar sesgos de la web angloparlante y de los criterios del clasificador educativo.
- Limitaciones de contexto e idioma: no disponibles; se desconoce la ventana de contexto y los idiomas cubiertos.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Madurez del repositorio: cero descargas y cero likes en el momento de la consulta, sin historial de actualizaciones ni issues, lo que desaconseja su uso en producción sin una evaluación independiente.
- Arquitectura no confirmada: si se trata de Gated DeltaNet, el ecosistema de herramientas (vLLM, llama.cpp) podría no soportarla de forma nativa, complicando el despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/Torian2002/GDN-340M-15B-Fineweb_Edu
- Dataset Fineweb-Edu (referencia del corpus de entrenamiento): https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Paper de Gated DeltaNet (arquitectura posiblemente asociada, no confirmada): https://arxiv.org/abs/2412.06464
- Repositorio de referencia de Gated DeltaNet (no confirmado como base del modelo): https://github.com/lucidrains/gated-deltanet-pytorch
- Paper de Chinchilla, contexto para el ratio tokens/parámetros: https://arxiv.org/abs/2203.15556
