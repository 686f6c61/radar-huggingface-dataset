# sujitvasanth/DeepSeek-R1-Llama-3B-MNN-Q2-HQQ-B64

## Resumen

DeepSeek-R1-Llama-3B-MNN-Q2-HQQ-B64 es una conversión cuantizada del modelo suayptalha/DeepSeek-R1-Distill-Llama-3B, un fine-tune comunitario de la familia DeepSeek-R1 destilada sobre una base Llama de 3B. El autor de esta conversión es sujitvasanth, que exporta los pesos originales en Safetensors a formato MNN con cuantización de 2 bits mediante HQQ (Half-Quadratic Quantization) y tamaño de bloque 64. El resultado es un paquete de aproximadamente 1 GB pensado para inferencia en el runtime MNN, orientado a entornos con recursos muy limitados como dispositivos móviles o CPU.

El modelo hereda el comportamiento de razonamiento de la destilación de DeepSeek-R1: genera cadenas de pensamiento antes de responder. Sin embargo, la cuantización agresiva a 2 bits puede degradar esa capacidad, algo que el propio autor reconoce en la model card. No se han publicado mediciones de velocidad, RAM residente, perplejidad ni calidad de respuesta, por lo que las cifras de rendimiento real no están disponibles.

La relevancia de esta ficha es doble: por un lado documenta una opción de despliegue extremo para hardware restringido; por otro, sirve de advertencia sobre los límites de las conversiones comunitarias a muy baja precisión, donde la validación se limita a comprobaciones estáticas de los operadores cuantizados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Llama 3.2, destilación de DeepSeek-R1) |
| Parámetros totales | Aproximadamente 3B (modelo base) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | 2 bits HQQ, bloque 64, asimétrica, escalas FP16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Llama 3.2 |
| Formato de pesos | MNN (llm.mnn, llm.mnn.weight, tokenizer.mtok, config.json, llm_config.json) |

## Arquitectura y entrenamiento

El modelo subyacente es una destilación de DeepSeek-R1 sobre una arquitectura Llama de 3B, es decir, un transformer decoder-only estándar con atención causal. El fine-tune comunitario suayptalha/DeepSeek-R1-Distill-Llama-3B aplica el comportamiento de razonamiento de DeepSeek-R1 al modelo base Llama 3.2 de 3B. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO en esta conversión concreta.

La innovación técnica de esta ficha reside en la cuantización: todos los pesos lineales, incluida la cabeza de salida y los embeddings atados, se cuantizan a 2 bits con HQQ y tamaño de bloque 64. El autor indica que la exportación se realizó directamente desde los Safetensors originales, no por recuantización de un modelo Q4. La validación estática confirma 197 operadores Q2, incluido el operador de la cabeza de salida, y los límites de offset de los pesos externos. No se ha realizado ninguna prueba de inferencia en teléfono, velocidad, RAM residente, perplejidad ni calidad de respuesta.

## Capacidades

- Generación de texto en inglés con comportamiento de razonamiento tipo cadena de pensamiento heredado de DeepSeek-R1.
- Razonamiento multi-paso y resolución de problemas, sujeto a degradación por la cuantización a 2 bits.
- Generación de código y matemáticas, aunque sin validación publicada tras la cuantización.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso estructurado más allá del thinking mode heredado.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documentan capacidades de visión ni audio.

## Casos de uso

- Inferencia en dispositivos móviles o embebidos: el paquete MNN de aproximadamente 1 GB y la cuantización a 2 bits permiten desplegar el modelo en teléfonos o placas con poca RAM, usando el runtime MNN con soporte de pesos de baja precisión.
- Prototipado rápido de razonamiento en CPU: para experimentar con cadenas de pensamiento en entornos sin GPU, el formato MNN y el tamaño reducido facilitan la carga en portátiles convencionales.
- Aplicaciones de asistente personal offline: integrable mediante FULLassistant, que permite descargar el repositorio desde su gestor de LLM personalizado o colocarlo en la biblioteca de modelos y reescanear.
- Evaluación comparativa de cuantizaciones: útil como referencia para medir la degradación de calidad entre el modelo original en Safetensors y esta versión Q2 HQQ en tareas de razonamiento.
- Generación de texto de bajo coste en inglés: para tareas de completado o resumen donde la latencia y el consumo de memoria priman sobre la precisión máxima.
- Investigación sobre límites de cuantización extrema: permite estudiar hasta qué punto un modelo de 3B con razonamiento destilado mantiene coherencia a 2 bits y bloque 64.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se han realizado pruebas de velocidad, RAM residente, perplejidad ni calidad de respuesta, y que la eficiencia depende del runtime, el backend y la CPU empleados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el autor no ha medido el ahorro de RAM en tiempo de ejecución.
- Tamaño del repositorio: aproximadamente 1 GB, lo que da una cota superior del espacio en disco necesario.
- GPU recomendadas: no disponibles; el formato MNN está orientado a CPU y dispositivos móviles, no a GPU de datacenter.
- Compatibilidad con GPU de consumo: no confirmada; el runtime MNN con soporte de pesos de baja precisión es el requisito principal.
- Opciones de despliegue: runtime MNN con soporte de pesos de baja precisión, o FULLassistant mediante su descargador de LLM personalizado.
- Latencia y throughput: no disponibles; no se han medido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-R1-Llama-3B-MNN-Q2-HQQ-B64 | ~3B | No disponible | 2 bits HQQ, bloque 64 | Llama 3.2 | Hugging Face, formato MNN |
| suayptalha/DeepSeek-R1-Distill-Llama-3B | ~3B | No disponible | Safetensors originales | Llama 3.2 | Hugging Face |
| Llama 3.2 3B (base) | ~3B | No disponible | Múltiples | Llama 3.2 | Hugging Face |

La comparación directa con el modelo base suayptalha/DeepSeek-R1-Distill-Llama-3B es la más relevante: esta conversión sacrifica precisión (2 bits frente a los pesos originales) a cambio de un tamaño de aproximadamente 1 GB y compatibilidad con MNN. No se dispone de datos de rendimiento comparativo entre ambas versiones.

## Limitaciones y advertencias

- La cuantización a 2 bits puede degradar el comportamiento de razonamiento del modelo original, tal como advierte el autor.
- No se han realizado pruebas de calidad, perplejidad ni velocidad; el rendimiento real es desconocido.
- El soporte y la eficiencia dependen del runtime MNN, el backend y la CPU empleados.
- Solo se declara soporte de inglés; no hay evidencia de capacidades multilingües.
- Es un fine-tune y conversión comunitarios, no un lanzamiento oficial de DeepSeek.
- La licencia Llama 3.2 impone condiciones de uso que deben respetarse, incluida la atribución y las restricciones de la licencia upstream.
- Riesgo de alucinación inherente a los modelos de 3B, potencialmente agravado por la baja precisión de los pesos.
- No se documenta soporte de tool calling, agentes ni otras capacidades avanzadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sujitvasanth/DeepSeek-R1-Llama-3B-MNN-Q2-HQQ-B64
- Modelo base: https://huggingface.co/suayptalha/DeepSeek-R1-Distill-Llama-3B
- Runtime MNN: no disponible en la información proporcionada
- FULLassistant: no disponible en la información proporcionada
