# yasserrmd/enterprise-reflux-d3-edge

## Resumen

Enterprise Reflux D3-Edge es un modelo de decisión compacto de 594 millones de parámetros desarrollado por Mohamed Yasser como parte de la serie de investigación Enterprise Reflux Decision Intelligence. No es un modelo generativo de propósito general: su función es evaluar un estado estructurado junto con un conjunto de acciones candidatas y seleccionar, clasificar o abstenerse (NO_ACTION) entre ellas. Está concebido como una capa «System-1» dentro de arquitecturas agénticas y de empresa, donde la generación libre de texto resulta menos fiable que una selección acotada y verificable.

El modelo parte del checkpoint base vllm-sr/d3-edge (revisión fijada `3c0a64d8c4f716581b6c6b70a326f962bb123140`) y se ha afinado sobre un corpus de decisión de más de 100.000 registros estructurados. La arquitectura es un encoder de decisión no causal nativo con un cabezal de lectura de códigos de respuesta, no un transformer decoder convencional para generación de texto. La licencia es Apache 2.0 y el formato de publicación es safetensors.

Es relevante ahora porque propone un patrón arquitectónico distinto al de los LLM generativos: separar la propuesta de decisión (el modelo) de la autorización de ejecución (sistemas deterministas externos y revisión humana). El propio autor advierte que el modelo propone decisiones pero no concede autoridad para ejecutar transacciones ni modificar sistemas externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | D3 native non-causal decision encoder con cabezal dedicado de lectura de códigos de respuesta |
| Parametros totales | 594.321.600 (594,58 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,2 GB); sin export ONNX verificado |
| Modelo base | vllm-sr/d3-edge (finetune) |
| Ejemplos de entrenamiento | 91.636 |
| Epocas | 2 |
| Semilla | 42 |
| Estado | Experimental (investigación) |

## Arquitectura y entrenamiento

La arquitectura es un encoder de decisión no causal nativo («D3») con un cabezal específico de lectura de códigos de respuesta, en lugar de un decoder autorregresivo. Esto implica que el modelo no genera texto libre: recibe un estado estructurado y una lista de acciones candidatas, y produce una clasificación ordenada de candidatos junto con etiquetas de ejecución cuando están disponibles. El backbone textual y el cabezal de decisión se afinan conjuntamente; la parte de visión permanece congelada.

El entrenamiento usó AdamW8bit con autocast BF16, learning rate 8e-6, batch efectivo de 64, semilla 42 y dos épocas sobre 91.636 ejemplos, con backend FLA verificado. Los objetivos combinan ranking estructurado de candidatos y clasificación de ejecución; las etiquetas de ejecución desconocidas se excluyen de la pérdida de clasificación. La selección del mejor checkpoint se hizo por rendimiento en validación, no por resultados de test. El corpus «Decision-100K+» combina escenarios empresariales estructurados, ejemplos condicionados por políticas, pares contrafactuales y ejemplos derivados de intenciones públicas. Los splits son: 91.636 de entrenamiento, 6.086 de validación, 2.841 de calibración, 3.017 de test estándar retenido, 200 (Extreme-200), 400 (Hard-400) y 500 (Mixed-500), con 104.680 registros totales.

## Capacidades

- Selección y ranking de acciones candidatas a partir de un estado estructurado y un conjunto acotado de opciones.
- Abstención explícita mediante la etiqueta NO_ACTION, con métricas de precisión y F1 reportadas del 100 % en el test estándar.
- Clasificación de ejecución (ACT/ESCALATE) cuando existen etiquetas de verdad de referencia.
- Razonamiento contrafactual: evaluación de pares de escenarios que difieren en un factor para comprobar consistencia de la decisión (97,61 % de precisión en pares).
- Calibración de confianza por candidato (error de calibración de elección del 0,40 %).
- Interfaz de decisión nativa: no está pensado para usarse con un pipeline genérico `AutoModel` de generación de texto.
- Capacidades multilingües: no disponibles.
- Tool calling, agentes multi-paso, visión, audio o modo «thinking»: no disponibles como capacidades documentadas.

## Casos de uso

- Enrutado de tickets empresariales: dado un estado del ticket (tipo de petición, aprobaciones presentes, política aplicable) y un conjunto de colas o equipos candidatos, el modelo selecciona el destino más probable; su ventana de decisión es acotada y el resultado es verificable contra la política.
- Aprobación de acciones sensibles: ante una solicitud como borrar un documento archivado sin aprobación, el modelo devuelve NO_ACTION o ESCALATE, y un sistema determinista externo decide si se ejecuta; encaja en flujos donde la generación libre sería un riesgo.
- Clasificación de ejecución en pipelines agénticos: el modelo actúa como compuerta previa que etiqueta si una acción propuesta por otro componente debe ejecutarse, escalarse o bloquearse, reduciendo llamadas a modelos mayores.
- Evaluación de contrafactuales en políticas: comparar dos estados casi idénticos (por ejemplo, con y sin aprobación) para detectar inconsistencias en reglas de negocio antes de desplegarlas.
- Moderación de acciones en asistentes corporativos: ranking de respuestas o acciones candidatas generadas por un LLM mayor, con abstención cuando ninguna supera el umbral de confianza calibrada.
- Investigación en arquitecturas System-1/System-2: usar el checkpoint como capa rápida de decisión (latencia medida de 61,66 ms P50 en GPU nativa) delante de un modelo de razonamiento lento, para filtrar candidatos antes de invocar el System-2.
- Calibración y auditoría de decisiones: el error de calibración de elección del 0,40 % permite usar las confidencias por candidato en umbrales operativos y revisiones humanas selectivas.

## Benchmarks y rendimiento

Resultados reportados por el autor (suite propia, no benchmarks de terceros):

| Suite de evaluacion | Muestras | Base Top-1 | Fine-tuned Top-1 | Delta |
|---|---:|---:|---:|---:|
| Standard held-out test | 3.017 | 68,64 % | 98,67 % | +30,03 pp |
| Extreme-200 | 200 | 50,00 % | 60,50 % | +10,50 pp |
| Hard-400 | 400 | 37,00 % | 81,75 % | +44,75 pp |
| Mixed-500 | 500 | 55,00 % | 77,80 % | +22,80 pp |
| Combined frozen | 1.100 | 47,55 % | 76,09 % | +28,55 pp |

Detalle del test estándar: Top-1 98,67 %, Top-2 99,57 %, Top-3 99,77 %, precisión en acciones concretas 98,46 %, precisión NO_ACTION 100,00 %, F1 NO_ACTION 100,00 %, F1 macro ACT/ESCALATE 100,00 %, precisión en pares contrafactuales 97,61 %, error de calibración de elección 0,40 %, cobertura de la compuerta de ejecución 0,00 %.

Latencia de inferencia nativa en GPU: P50 61,66 ms, P95 68,37 ms (100 casos, entorno de investigación, excluye tokenización y procesamiento externo). En CPU/nativo: no verificado. No hay resultados en MMLU, HumanEval, GSM8K ni benchmarks públicos equivalentes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 594,58 M de parámetros, en BF16 serían aproximadamente 1,2 GB de pesos; en FP32, unos 2,4 GB. Estas cifras son estimaciones por tamaño, no medidas publicadas.
- GPU recomendadas: no especificadas por el autor; la única medición de latencia es en GPU con el runtime nativo del modelo.
- GPU de consumo: por tamaño (menos de 1,5 GB de pesos en BF16) cabría en cualquier GPU de consumo moderna con al menos 4-6 GB de VRAM, aunque no hay validación publicada en esas GPU.
- Despliegue: requiere el runtime nativo específico del modelo; no se debe usar un pipeline genérico de generación de texto. Dependencias de partida: `transformers==5.17.0`, `huggingface_hub`, `safetensors`, `torch`. No hay export ONNX verificado y no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia: P50 61,66 ms y P95 68,37 ms en GPU nativa; el rendimiento en CPU no está verificado.

## Comparativa con modelos similares

No se dispone de datos de benchmarks públicos ni de modelos comparables documentados en la información proporcionada. Como referencia estructural, se compara con su propio checkpoint base:

| Modelo | Parametros | Contexto | Top-1 test estandar | Licencia | Estado |
|---|---|---|---|---|---|
| Enterprise Reflux D3-Edge | 594,58 M | No disponible | 98,67 % (suite propia) | Apache 2.0 | Experimental |
| vllm-sr/d3-edge (base) | No disponible | No disponible | 68,64 % (suite propia) | Apache 2.0 | Checkpoint base |

No hay comparación disponible frente a modelos de decisión o clasificación de terceros con protocolo común.

## Limitaciones y advertencias

- Modelo experimental de investigación: el autor lo etiqueta explícitamente como tal; no está validado para producción.
- Las suites de evaluación son conjuntos de desafío históricos y controlados del propio autor, no benchmarks independientes de terceros ni resultados del mundo real verificados.
- El modelo propone decisiones pero no concede autoridad: cualquier ejecución debe pasar por autorización determinista externa y revisión humana cuando corresponda.
- La cobertura de la compuerta de ejecución es del 0,00 %, lo que limita la utilidad práctica de la clasificación de ejecución en este checkpoint.
- El rendimiento cae notablemente fuera del test estándar: 60,50 % en Extreme-200 y 77,80 % en Mixed-500, frente al 98,67 % del test estándar; la generalización a escenarios atípicos es limitada.
- No se publican datos de sesgos, idiomas soportados ni robustez multilingüe.
- No se incluyen en la release los registros de entrenamiento, ejemplos crudos de evaluación, predicciones por registro, checkpoints de recuperación ni cachés de tokenización, lo que dificulta la reproducibilidad y la auditoría.
- La interfaz es nativa y no estándar: usar `AutoModel` de generación de texto no es el uso previsto y puede producir resultados incorrectos.
- No hay export ONNX verificado ni soporte documentado de runtimes de inferencia habituales (vLLM, llama.cpp, Ollama, TGI).
- Licencia Apache 2.0 permite uso comercial, pero las condiciones de los datasets de origen deben conservarse si se redistribuyen por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yasserrmd/enterprise-reflux-d3-edge
- Perfil del autor: https://huggingface.co/yasserrmd
- Checkpoint base: https://huggingface.co/vllm-sr/d3-edge
- Revisión fijada del base: `3c0a64d8c4f716581b6c6b70a326f962bb123140`
- Paper, blog, repositorio o demo: no disponibles en la información proporcionada.
