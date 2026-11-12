# tartuNLP/Llama-3.1-EstLLM-70B-TehisaruBaromeeter-Reward

## Resumen

Llama-3.1-EstLLM-70B-TehisaruBaromeeter-Reward es un modelo de clasificación de texto derivado de tartuNLP/Llama-3.1-EstLLM-70B-Instruct-0826, un ajuste fino del Llama 3.1 70B de Meta orientado al estonio. Lo desarrolla el grupo de procesamiento del lenguaje natural de la Universidad de Tartu (tartuNLP), y su nombre sugiere un uso como modelo de recompensa ("Reward") para evaluar la calidad de respuestas generadas, probablemente entrenado sobre el dataset nvidia/HelpSteer3.

El modelo conserva la arquitectura transformer densa de Llama 3.1 con 69.503.041.536 parámetros (aproximadamente 70B) y se distribuye en formato safetensors con la librería transformers. A diferencia de un modelo generativo de propósito general, la cabecera de clasificación (text-classification) lo convierte en una herramienta para puntuar o etiquetar textos, lo que resulta relevante para pipelines de RLHF, filtrado de datos y evaluación automática de calidad en entornos de habla estonia.

La información pública disponible es muy limitada: la model card es una plantilla autogenerada sin detalles de entrenamiento, evaluación ni uso previsto, y el repositorio no registra descargas ni interacciones. Por tanto, esta ficha refleja únicamente los metadatos verificables del Hub y las características heredadas del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.1), con cabecera de clasificación de texto |
| Parámetros totales | 69.503.041.536 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Llama 3.1 soporta 128.000 tokens, pero no se confirma para este ajuste) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Estonio (et), inglés (en) |
| Licencia | Llama 3.1 (licencia comunitaria de Meta) |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de tartuNLP/Llama-3.1-EstLLM-70B-Instruct-0826, un ajuste del Llama 3.1 70B de Meta para estonio, y añade una cabeza de clasificación para producir puntuaciones o etiquetas sobre pares o textos de entrada. El pipeline declarado es text-classification, lo que indica que la salida no es texto generado sino una distribución de clases o un valor de recompensa. Los parámetros totales (69.503.041.536) coinciden con la variante de 70B de Llama 3.1, por lo que la arquitectura subyacente es un transformer decoder-only denso con atención multi-cabeza estándar.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. El único dato de datos de entrenamiento es la referencia al dataset nvidia/HelpSteer3, un corpus de preferencias humanas utilizado habitualmente para entrenar modelos de recompensa. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, mezcla de expertos) más allá de las propias del modelo base.

## Capacidades

- Clasificación y puntuación de texto: el pipeline text-classification permite asignar etiquetas o valores de calidad a respuestas o documentos.
- Evaluación de preferencias: por su nombre ("Reward") y el dataset HelpSteer3, está orientado a puntuar la calidad de respuestas generadas por otros modelos.
- Soporte multilingüe limitado a estonio e inglés.
- Herencia del modelo base instruct: capacidad potencial de razonamiento y comprensión de instrucciones, aunque la cabecera de clasificación sustituye la generación libre.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de pensamiento explícito.
- No se documentan capacidades de generación de código o matemáticas verificadas para este ajuste concreto.

## Casos de uso

- Evaluación automática de respuestas en estonio: el modelo puede puntuar la calidad de salidas de asistentes conversacionales en estonio, sirviendo como juez en pipelines de evaluación continua.
- Filtrado de datos para ajuste fino: usar la puntuación de recompensa para seleccionar las mejores respuestas de un corpus antes de entrenar modelos generativos.
- RLHF y optimización de preferencias: integrar el modelo como función de recompensa en bucles de entrenamiento con PPO o DPO para alinear modelos estonios.
- Control de calidad en atención al cliente: clasificar transcripciones o respuestas de agentes automáticos y detectar las de baja calidad para revisión humana.
- Ranking de candidatos en sistemas de recuperación: puntuar y ordenar fragmentos de texto recuperados según su relevancia o calidad percibida.
- Investigación lingüística en estonio: analizar la calidad de corpus y comparar estilos o registros mediante puntuaciones consistentes.
- Moderación asistida: como señal adicional (no única) para priorizar contenido dudoso en colas de revisión, dado su carácter de clasificador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (bf16/fp16): aproximadamente 140 GB, lo que exige múltiples GPU.
- Cuantización a 8 bits: en torno a 70 GB de VRAM; a 4 bits: en torno a 35-40 GB (estimaciones teóricas a partir del número de parámetros, no verificadas para este checkpoint).
- GPU recomendadas: 2x A100 80GB o 2x H100 80GB para bf16; una sola A100 80GB o H100 80GB podría bastar con cuantización a 8 bits.
- No cabe en GPU de consumo convencionales (RTX 4090 de 24 GB) salvo con cuantizaciones agresivas a 4 bits y posible descarga parcial a CPU, con latencia elevada.
- Opciones de despliegue: transformers (librería declarada), text-embeddings-inference y endpoints compatibles según los tags del Hub; vLLM, llama.cpp u Ollama no están confirmados para esta cabecera de clasificación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tartuNLP/Llama-3.1-EstLLM-70B-TehisaruBaromeeter-Reward | 69,5B | No disponible | Clasificación / recompensa | Llama 3.1 | Hugging Face |
| tartuNLP/Llama-3.1-EstLLM-70B-Instruct-0826 | ~70B | No disponible | Generación instructiva (estonio) | Llama 3.1 | Hugging Face |
| Meta Llama-3.1-70B-Instruct | ~70B | 128.000 tokens | Generación instructiva | Llama 3.1 | Hugging Face |
| Modelos de recompensa especializados (p. ej., variantes de HelpSteer) | Variable | No disponible | Puntuación de preferencias | Variable | Hugging Face |

No se dispone de datos de rendimiento comparativo para este modelo concreto.

## Limitaciones y advertencias

- La model card está autogenerada y vacía: no hay documentación de sesgos, riesgos, datos de entrenamiento ni evaluación.
- Riesgo de alucinación y de puntuaciones poco calibradas al no existir validación publicada.
- Cobertura lingüística limitada a estonio e inglés; el comportamiento en castellano no está documentado ni garantizado.
- Licencia Llama 3.1: impone restricciones de uso comercial, obligaciones de atribución y cláusulas específicas que deben revisarse antes de producción.
- Al ser un clasificador de recompensa, no debe usarse como generador de texto ni como sustituto de un modelo instructivo.
- El repositorio no registra descargas ni interacciones (0 descargas, 0 likes), lo que indica ausencia de validación por la comunidad.
- No se confirma la longitud de contexto efectiva del ajuste; asumir 128.000 tokens sin verificación puede provocar fallos en entradas largas.
- Uso en producción requiere evaluación propia con datos representativos antes de confiar en sus puntuaciones.

## Enlaces

- Hugging Face: https://huggingface.co/tartuNLP/Llama-3.1-EstLLM-70B-TehisaruBaromeeter-Reward
- Modelo base: https://huggingface.co/tartuNLP/Llama-3.1-EstLLM-70B-Instruct-0826
- Dataset de entrenamiento referenciado: https://huggingface.co/datasets/nvidia/HelpSteer3
- Paper citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Organización tartuNLP: https://huggingface.co/tartuNLP
