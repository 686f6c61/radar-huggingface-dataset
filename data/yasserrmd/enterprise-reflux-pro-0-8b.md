# yasserrmd/enterprise-reflux-pro-0.8b

## Resumen

Enterprise Reflux Pro 0.8B es un modelo de decisión estructurada de tipo System-1, desarrollado por Mohamed Yasser (yasserrmd) como parte de la serie de investigación Enterprise Reflux Decision Intelligence. Se trata de un fine-tuning del checkpoint internlm/Intern-Decision-0.8B, que a su vez se apoya en una arquitectura Qwen3.5. Con 852.985.920 parámetros (aproximadamente 0,85 mil millones), el modelo no está diseñado para generar texto libre, sino para evaluar un estado estructurado y un conjunto de acciones candidatas, y seleccionar la más adecuada o abstenerse (NO_ACTION).

La propuesta central es separar la selección de acciones de la autorización de ejecución: el modelo propone decisiones, pero no tiene autoridad para ejecutar transacciones ni modificar sistemas externos. Esta separación arquitectónica lo hace relevante para arquitecturas agénticas empresariales donde se necesita una capa rápida y determinista de clasificación y ranking de candidatos, seguida de validación externa y revisión humana.

El modelo se publica como experimento de investigación (Research experiment 02) con licencia Apache 2.0, formato safetensors y un tamaño de repositorio de 3,4 GB. No incluye los datos de entrenamiento originales ni los checkpoints de recuperación, y su interfaz de inferencia prevista es un runtime nativo específico, no un pipeline genérico de generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-based Intern-Decision (transformer, backbone de texto con componentes de visión congelados) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (release en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint nativo validado; sin export ONNX verificado) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint internlm/Intern-Decision-0.8B (revisión fijada `42457fafd13d10d0b0d9be46cb30a23caa409994`), con arquitectura Qwen3.5-based Intern-Decision. El fine-tuning se realizó sobre el backbone de texto manteniendo congelados los componentes de visión. El entrenamiento empleó AdamW8bit, autocast BF16, una tasa de aprendizaje de 8e-6 y un tamaño de lote efectivo de 64, con 2 épocas sobre 91.636 ejemplos y semilla 42. Los objetivos de entrenamiento incluyen ranking estructurado de candidatos y clasificación de ejecución cuando existen etiquetas de ejecución; las etiquetas desconocidas se excluyen de la pérdida de clasificación de ejecución. El mejor checkpoint se seleccionó por rendimiento en validación, no por resultados finales de test.

El corpus de investigación Enterprise Reflux Decision-100K+ combina escenarios de decisión empresarial estructurados, ejemplos condicionados por políticas, pares contrafactuales y ejemplos derivados de intenciones públicas. Los splits son: 91.636 de entrenamiento, 6.086 de validación, 2.841 de calibración, 3.017 de test estándar reservado, 200 en Extreme-200, 400 en Hard-400 y 500 en Mixed-500, para un total de 104.680 registros. Los conjuntos de benchmark congelados son desafíos controlados históricos, no benchmarks independientes de terceros ni resultados reales verificados. No se incluyen en la release los registros de entrenamiento originales, ejemplos crudos de evaluación, predicciones por registro, checkpoints de recuperación ni cachés de tokenización.

## Capacidades

- Selección y ranking de acciones candidatas a partir de un estado estructurado y un conjunto de opciones suministradas.
- Clasificación de ejecución (execution classification) cuando hay etiquetas disponibles.
- Abstención explícita mediante la etiqueta NO_ACTION.
- Distinción entre acciones concretas, escalado (ESCALATE) y no acción.
- Evaluación de consistencia contrafactual: el modelo se evalúa con pares contrafactuales donde ambos miembros deben acertar.
- Calibración de confianza sobre candidatos (choice ECE reportado).
- No genera respuestas libres: su interfaz es de decisión estructurada, no de generación de texto.
- Soporte de tool calling / function calling: no disponible como capacidad documentada.
- Soporte de agentes multi-paso: no disponible como capacidad documentada; el modelo se plantea como capa System-1 dentro de una arquitectura agéntica, no como planificador.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): los componentes de visión existen en el backbone pero se congelaron durante el fine-tuning; no se documenta uso de visión en la interfaz de decisión.

## Casos de uso

- Clasificación de solicitudes empresariales con políticas: dado un estado (por ejemplo, una petición de borrado de documento con aprobación ausente y una política que exige aprobación explícita), el modelo selecciona la acción adecuada entre las candidatas o devuelve NO_ACTION. Encaja por su entrenamiento en ejemplos condicionados por políticas.
- Ranking de candidatos en flujos de aprobación: el modelo ordena acciones candidatas (Top-1, Top-2, Top-3) para que un sistema determinista posterior aplique la autorización y el registro de auditoría.
- Puerta de abstención en asistentes internos: usar NO_ACTION como mecanismo de seguridad cuando la confianza o la política no permiten actuar; el modelo reporta una precisión de NO_ACTION del 100 % en el test estándar de su protocolo.
- Enrutado de tickets y solicitudes de soporte: evaluar el estado del ticket y elegir entre escalar a un humano (ESCALATE), responder con una acción concreta o no actuar, reduciendo latencia frente a un LLM generativo grande.
- Capa System-1 en arquitecturas agénticas: colocar el modelo delante de un agente mayor para filtrar y preseleccionar acciones rápidamente; su latencia medida en GPU nativa es de 60,68 ms de mediana (P50) y 62,49 ms en P95 sobre 100 casos, excluyendo tokenización.
- Evaluación de consistencia de políticas: emplear pares contrafactuales para comprobar que pequeñas variaciones del estado no alteran indebidamente la decisión; el modelo reporta 97,61 % de precisión en pares contrafactuales en su test estándar.
- Investigación en modelos de decisión compactos: servir como referencia reproducible (semilla 42, hiperparámetros documentados) para estudiar la separación entre propuesta de decisión y autorización de ejecución.

## Benchmarks y rendimiento

Resultados reportados por el autor en su protocolo interno (no son benchmarks independientes de terceros).

| Suite de evaluacion | Muestras | Base Top-1 | Fine-tuned Top-1 | Delta |
|---|---:|---:|---:|---:|
| Standard held-out test | 3.017 | 54,56 % | 98,28 % | +43,72 pp |
| Extreme-200 | 200 | 56,00 % | 59,00 % | +3,00 pp |
| Hard-400 | 400 | 62,50 % | 75,50 % | +13,00 pp |
| Mixed-500 | 500 | 57,80 % | 79,60 % | +21,80 pp |
| Combined frozen | 1.100 | 59,18 % | 74,36 % | +15,18 pp |

| Metrica (test estandar) | Resultado fine-tuned |
|---|---:|
| Top-1 accuracy | 98,28 % |
| Top-2 accuracy | 99,54 % |
| Top-3 accuracy | 99,70 % |
| Concrete-action accuracy | 98,00 % |
| NO_ACTION accuracy | 100,00 % |
| NO_ACTION F1 | 100,00 % |
| ACT/ESCALATE macro F1 | 100,00 % |
| Counterfactual pair accuracy | 97,61 % |
| Choice calibration error (ECE) | 0,86 % |
| Execution gate coverage | 0,00 % |

| Backend | Mediana (P50) | P95 | Estado |
|---|---:|---:|---|
| CPU / Native | 2.704,46 ms | 3.251,58 ms | Medido |
| GPU / Native | 60,68 ms | 62,49 ms | Medido |

Las latencias se midieron en el entorno de investigación registrado, con cuatro hilos de CPU cuando aplica y 100 casos; excluyen tokenización y procesamiento externo de la aplicación, por lo que no deben interpretarse como latencia de servicio de extremo a extremo en producción. No se han publicado resultados en benchmarks estándar de terceros (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 852.985.920 parámetros, en BF16 el peso ocupa aproximadamente 1,7 GB; en FP32, unos 3,4 GB (coincide con el tamaño del repo). No se documentan cuantizaciones oficiales.
- GPU recomendadas: no disponible. El autor solo reporta latencia medida en "GPU / Native" sin especificar modelo de GPU.
- ¿Cabe en GPU de consumo? No confirmado por el autor. Por tamaño de pesos, en BF16 cabría en GPUs de consumo con 4 GB o más de VRAM, pero esto es una estimación basada en el número de parámetros, no un dato publicado.
- Opciones de despliegue: el autor indica que se use el runtime nativo específico del modelo; un pipeline genérico `AutoModel` de generación de texto no es la interfaz prevista. Dependencias de partida: `transformers==5.14.1`, `huggingface_hub`, `safetensors`, `torch`, `pillow`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI. No hay export ONNX verificado.
- Latencia y throughput: CPU nativa con 4 hilos, P50 2.704,46 ms y P95 3.251,58 ms; GPU nativa, P50 60,68 ms y P95 62,49 ms (100 casos, excluyendo tokenización). Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Enterprise Reflux Pro 0.8B | 852.985.920 | no disponible | Decisión estructurada / ranking de candidatos | Apache 2.0 | Hugging Face (safetensors) |
| internlm/Intern-Decision-0.8B (base) | ~0,8B (no confirmado en la informacion) | no disponible | Decisión estructurada (modelo base) | no disponible | Hugging Face |
| LLM generativos de ~1B (p. ej. familia Qwen) | ~1B | no disponible | Generación de texto libre | no disponible | Hugging Face |

La comparación cuantitativa con alternativas no está disponible: el autor no publica comparaciones con modelos de terceros y los benchmarks presentados son de protocolo interno. La diferencia principal frente a un LLM generativo de tamaño similar es la interfaz: este modelo no produce texto libre, sino una selección entre candidatos con abstención y clasificación de ejecución.

## Limitaciones y advertencias

- Modelo experimental de investigación (Research experiment 02); no está validado para producción.
- Los benchmarks son conjuntos de desafío controlados internos, no benchmarks independientes de terceros ni resultados reales verificados.
- El modelo propone decisiones pero no concede autoridad para ejecutar transacciones ni modificar sistemas externos; requiere autorización determinista externa y revisión humana.
- Execution gate coverage reportado del 0,00 %: la cobertura de la puerta de ejecución es nula en el test estándar, lo que limita la validación de la clasificación de ejecución en ese conjunto.
- El rendimiento cae de forma notable fuera del test estándar: 59,00 % Top-1 en Extreme-200 y 75,50 % en Hard-400, frente al 98,28 % del test estándar. La generalización a casos adversos es limitada.
- No se incluyen datos de entrenamiento, ejemplos crudos de evaluación, predicciones por registro ni checkpoints de recuperación, lo que dificulta la reproducibilidad completa.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingüe.
- Longitud de contexto no documentada.
- No hay export ONNX verificado; el despliegue requiere el runtime nativo y revisar el código fuente incluido antes de ejecutarlo.
- Las latencias reportadas excluyen tokenización y procesamiento externo; no son latencia de servicio de extremo a extremo.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un modelo de selección entre candidatos, el riesgo se traslada a elecciones incorrectas dentro del conjunto suministrado.
- Sesgos conocidos: no documentados.
- Licencia Apache 2.0 permite uso comercial, pero el estado experimental y la falta de validación externa desaconsejan su uso en producción sin evaluación propia. Cualquier redistribución de datasets derivados debe conservar la atribución de fuentes y los términos aplicables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yasserrmd/enterprise-reflux-pro-0.8b
- Modelo base: https://huggingface.co/internlm/Intern-Decision-0.8B
- Perfil del autor: https://huggingface.co/yasserrmd
