# yasserrmd/enterprise-reflux-laya-v3

## Resumen

Enterprise Reflux Laya V3 es un modelo de decisión compacto de 421.293.827 parámetros desarrollado por Mohamed Yasser (usuario `yasserrmd`) dentro de la serie de investigación Enterprise Reflux Decision Intelligence. No es un modelo generativo de propósito general: está diseñado como capa System-1 para arquitecturas agénticas y empresariales, donde recibe un estado estructurado y un conjunto de acciones candidatas, y devuelve una clasificación y un ranking de esas candidatas en lugar de texto libre. La propuesta arquitectónica separa explícitamente la selección de acciones del control de autorización: el modelo propone, pero no ejecuta.

El modelo es un fine-tune del checkpoint `yasserrmd/enterprise-reflux-laya-v21` (revisión fijada `75c4407d03c04aa83be690e57f36d62466fb4589`), con arquitectura propietaria denominada "Laya native decision architecture", que combina un encoder nativo con una cabeza de decisión. Se entrenó sobre 91.636 ejemplos del corpus Decision-100K+ durante 2 épocas con semilla 42. Su relevancia actual radica en la exploración de modelos pequeños, ejecutables en CPU, para tareas de enrutamiento y clasificación de decisiones en pipelines agénticos, donde un LLM grande resulta caro o excesivo.

La release es experimental y de investigación, con licencia Apache 2.0 y pesos en safetensors. El autor reporta una accuracy Top-1 del 96,75 % en el test estándar retenido, aunque el conjunto de benchmarks es propio y controlado, no verificado por terceros. La latencia medida en CPU nativa es de 777,90 ms de mediana (P95 de 1.069,32 ms) con cuatro hilos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Laya native decision architecture (encoder nativo + cabeza de decisión) |
| Parametros totales | 421.293.827 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (release solo en safetensors nativo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint nativo; export ONNX no incluido en esta release) |

## Arquitectura y entrenamiento

La arquitectura es propietaria y específica del proyecto: un encoder nativo acoplado a una cabeza de decisión, entrenados de forma conjunta mediante fine-tuning. No se trata de un transformer decoder estándar de generación de texto, y el autor advierte explícitamente que un pipeline genérico `AutoModel` de text-generation no es la interfaz prevista para este checkpoint. El modelo consume un estado estructurado (por ejemplo, un diccionario con campos como `request`, `approval` o `policy`) y un conjunto de acciones candidatas, y produce un ranking con confianzas y una clasificación de ejecución.

El entrenamiento se realizó sobre 91.636 ejemplos durante 2 épocas, con learning rate de 8e-6 para el encoder y 4e-5 para la cabeza de decisión, micro-batch de 4 y acumulación de gradientes de 8. Los objetivos combinan ranking estructurado de candidatas y clasificación de ejecución cuando existen etiquetas; las etiquetas de ejecución desconocidas se excluyen de la pérdida de clasificación. El corpus Decision-100K+ (104.680 registros totales, repartidos en train, validación, calibración y varios conjuntos de test) mezcla escenarios empresariales estructurados, ejemplos condicionados por políticas, pares contrafactuales y ejemplos derivados de intenciones públicas. La selección del checkpoint se hizo por rendimiento en validación, no por resultados de test.

## Capacidades

- Ranking de acciones candidatas: ordena un conjunto cerrado de acciones propuestas según su adecuación al estado y la política dados.
- Clasificación de ejecución: distingue entre acción concreta, NO_ACTION y escalado (ACT/ESCALATE), con métricas de F1 reportadas por el autor.
- Abstención explícita: soporta la etiqueta NO_ACTION con una accuracy del 99,29 % y F1 de 98,82 % en el test estándar.
- Razonamiento contrafactual: evaluado mediante pares contrafactuales, con una accuracy del 94,26 %.
- Calibración de confianza: error de calibración esperado (ECE) de elección del 0,49 %, útil para umbrales de escalado.
- Ejecución en CPU: pensado como capa ligera en arquitecturas agénticas sin dependencia de GPU.
- No soporta generación de texto libre, tool calling genérico, visión, audio ni razonamiento multi-paso autónomo en el sentido de un LLM conversacional.

## Casos de uso

- Enrutamiento de decisiones en pipelines agénticos: el modelo recibe el estado de la tarea y las acciones candidatas generadas por un LLM planificador, y devuelve el ranking para que un orquestador seleccione la siguiente acción. Su latencia subsegundo en CPU permite intercalarlo en bucles de agente sin GPU dedicada.
- Puerta de abstención en automatizaciones empresariales: con la etiqueta NO_ACTION y su alta accuracy (99,29 %), sirve para decidir cuándo un sistema no debe actuar y debe derivar a revisión humana, reduciendo ejecuciones no deseadas.
- Clasificación de solicitudes condicionadas por política: dado un estado con campos de política y aprobación (por ejemplo, borrado de documentos sin aprobación), clasifica si la acción es ejecutable, requiere escalado o debe rechazarse.
- Validación previa a transacciones en sistemas de back-office: como capa System-1 que filtra y ordena acciones antes de que un componente determinista autorice la ejecución, añadiendo una señal calibrada (ECE 0,49 %) para fijar umbrales.
- Evaluación de contrafactuales en sistemas de compliance: los pares contrafactuales del corpus permiten usar el modelo para comprobar que pequeñas variaciones de política o aprobación cambian la decisión de forma coherente.
- Investigación en arquitecturas de decisión compactas: como checkpoint de referencia para comparar ranking de candidatas y clasificación de ejecución frente a otros experimentos de la familia Enterprise Reflux bajo un protocolo común.
- Filtrado de candidatas en asistentes empresariales: reducir el espacio de acciones que un LLM grande debe evaluar, enviando solo las Top-K del ranking a un modelo mayor para confirmación.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre conjuntos de benchmark propios y controlados (no verificados por terceros):

| Suite de evaluacion | Muestras | Base Top-1 | Fine-tuned Top-1 | Delta |
|---|---:|---:|---:|---:|
| Standard held-out test | 3.017 | 45,34 % | 96,75 % | +51,41 pp |
| Extreme-200 | 200 | 71,50 % | 72,00 % | +0,50 pp |
| Hard-400 | 400 | 80,75 % | 81,50 % | +0,75 pp |
| Mixed-500 | 500 | 78,60 % | 83,60 % | +5,00 pp |
| Combined frozen | 1.100 | 78,09 % | 80,73 % | +2,64 pp |

| Metrica (test estandar) | Resultado |
|---|---:|
| Top-1 accuracy | 96,75 % |
| Top-2 accuracy | 99,67 % |
| Top-3 accuracy | 99,90 % |
| Concrete-action accuracy | 96,34 % |
| NO_ACTION accuracy | 99,29 % |
| NO_ACTION F1 | 98,82 % |
| ACT/ESCALATE macro F1 | 98,84 % |
| Counterfactual pair accuracy | 94,26 % |
| Choice calibration error (ECE) | 0,49 % |
| Execution gate coverage | 0,00 % |

Latencia de inferencia medida por el autor (entorno de investigación, cuatro hilos de CPU, 100 casos, excluyendo tokenización y procesamiento externo):

| Backend | Mediana (P50) | P95 | Estado |
|---|---:|---:|---|
| CPU / nativo | 777,90 ms | 1.069,32 ms | Medido |
| GPU / nativo | N/A | N/A | No verificado |

## Requisitos de hardware

- VRAM estimada: no disponible para GPU; el modelo está pensado para CPU. Con 421 millones de parámetros en safetensors, el checkpoint ocupa aproximadamente 1,7 GB en el repositorio, lo que sugiere pesos en fp32 o similar.
- GPU recomendadas: no verificadas por el autor; no se han publicado mediciones en GPU.
- Cabe en CPU sin GPU dedicada; el autor reporta P50 de 777,90 ms y P95 de 1.069,32 ms con cuatro hilos.
- Despliegue: runtime nativo específico del modelo, con dependencias `laya==0.3.20`, `transformers==4.57.6`, `huggingface_hub`, `safetensors` y `torch`. No se contempla vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de generación de texto.
- Export ONNX: se realizó históricamente una exportación de forma fija que pasó validación de paridad, pero el artefacto no se recuperó; esta release incluye solo el checkpoint nativo y la regeneración de ONNX queda pendiente.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Enterprise Reflux Laya V3 | 421,3 M | no disponible | Ranking de candidatas y clasificación de ejecución | Apache 2.0 | Hugging Face, solo checkpoint nativo |
| Enterprise Reflux Laya V21 (base) | no disponible | no disponible | Igual familia | Apache 2.0 | Hugging Face |
| LLM generativo de 0,4-0,5 B (p. ej., clase Qwen2.5-0.5B) | ~500 M | 32 K típico | Generación de texto, tool calling | Apache 2.0 en variantes | Hugging Face |

No se dispone de datos de benchmarks comparables con modelos de terceros en la información proporcionada; los resultados del autor solo son comparables dentro de la familia Enterprise Reflux bajo su protocolo común. La comparación con LLM generativos pequeños es solo orientativa por tamaño, ya que la tarea y la interfaz son distintas.

## Limitaciones y advertencias

- Modelo experimental de investigación: el autor lo etiqueta explícitamente como "Research status: Experimental", sin validación independiente.
- Los benchmarks son conjuntos propios y controlados, no benchmarks de terceros ni resultados reales verificados; el propio autor lo advierte.
- No es un modelo de generación de texto: requiere el runtime nativo `laya` y una interfaz de decisión específica; usarlo con pipelines genéricos produce resultados incorrectos.
- El conjunto de datos de entrenamiento, ejemplos crudos, predicciones por registro y checkpoints de recuperación no se incluyen en la release, lo que limita la reproducibilidad.
- Idiomas soportados no documentados; el corpus parece centrado en escenarios empresariales en inglés.
- Riesgo de alucinación no caracterizado para esta tarea; al ser un clasificador/ranker sobre candidatas cerradas, el riesgo principal es una selección errónea, no texto inventado.
- Cobertura de la puerta de ejecución del 0,00 %: la clasificación de ejecución solo se evalúa donde existen etiquetas de verdad, lo que limita la evidencia sobre ese componente.
- El modelo propone decisiones pero no otorga autoridad de ejecución; cualquier despliegue en producción requiere autorización determinista externa y revisión humana.
- Sin mediciones en GPU ni throughput publicado; el rendimiento en producción puede diferir de las latencias de laboratorio.
- Licencia Apache 2.0 permite uso comercial, pero la naturaleza experimental y la falta de validación externa desaconsejan su uso directo en producción sin evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yasserrmd/enterprise-reflux-laya-v3
- Modelo base: https://huggingface.co/yasserrmd/enterprise-reflux-laya-v21
- Perfil del autor: https://huggingface.co/yasserrmd
