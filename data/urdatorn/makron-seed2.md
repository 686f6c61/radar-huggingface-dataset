# Urdatorn/Makron-seed2

## Resumen

Makron-seed2 es un modelo de clasificación de tokens a nivel de carácter desarrollado por Urdatorn (Albin Thörn Cleland y Eric Cullhed) que anota la longitud fonémica de las vocales griegas antiguas ditronas α, ι y υ, insertando un acento circunflejo (`^`) tras vocal breve y un guion bajo (`_`) tras vocal larga. Con 866.563 parámetros, es una revisión del modelo previo Ericu950/oga-macronizer-char, del que conserva la arquitectura pero cambia los datos de entrenamiento y los hiperparámetros.

El modelo resuelve un problema filológico concreto: la macronización automática de textos griegos antiguos, una tarea que tradicionalmente requiere revisión manual experta. Se entrena sobre etiquetas plateadas (silver labels) generadas por el sistema basado en reglas grc-macronizer a partir de Opera Graeca Adnotata, con un conjunto de datos decontaminado para eliminar solapamientos con el benchmark Norma.

Es relevante para investigadores en filología clásica y humanidades digitales que necesitan procesar corpus griegos a escala. Su tamaño reducido (menos de un millón de parámetros) permite ejecutarlo en CPU, y su licencia GPL v3 lo hace adecuado para proyectos de código abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder a nivel de carácter (4 capas, hidden size 128, 4 cabezas, intermediate size 512) |
| Parametros totales | 866.563 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Griego antiguo (grc) |
| Licencia | GNU GPL v3 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de 4 capas con tamaño oculto de 128, 4 cabezas de atención y tamaño intermedio de 512, operando a nivel de carácter sobre texto griego antiguo. La tarea es de clasificación de tokens: para cada posición correspondiente a una vocal ditrona (α, ι, υ) en sílaba abierta, el modelo predice si es breve o larga e inserta el marcador correspondiente.

El entrenamiento utilizó el dataset Urdatorn/oga-macronized-no-norma, compuesto por etiquetas plateadas generadas por el sistema basado en reglas grc-macronizer sobre Opera Graeca Adnotata. Se eliminaron las oraciones solapadas con el benchmark Norma y las líneas sin texto griego. Los hiperparámetros se ajustaron mediante una búsqueda Optuna de 24 pruebas sobre la validación de Norma: learning rate 2,23e-3, weight decay 0,17, batch size 2048, dropout 0,0, scheduler one-cycle con 5% de warmup y 30 épocas. El checkpoint final corresponde al mejor paso según la precisión de validación en Norma (paso 11.000). Este modelo es la semilla 2 de tres modelos finales idénticos salvo por la semilla, y es el que obtiene la mejor puntuación de validación en Norma.

## Capacidades

- Macronización de vocales ditronas α, ι y υ en griego antiguo, marcando longitud breve (`^`) o larga (`_`).
- Clasificación de tokens a nivel de carácter, sin dependencia de tokenizadores subword.
- Procesamiento de texto griego antiguo con politonía (acentos y espíritus).
- Inferencia en CPU por su reducido tamaño (menos de 1M de parámetros).
- No soporta tool calling, function calling, agentes, visión, audio ni modo thinking.
- Capacidad monolingüe: únicamente griego antiguo (grc).
- No dispone de generación de texto libre; es un modelo discriminativo de etiquetado.

## Casos de uso

- Anotación automática de corpus griegos: el modelo permite macronizar grandes volúmenes de texto de forma automática, reduciendo el trabajo manual de filólogos que necesitan marcar la cantidad vocálica en ediciones digitales.
- Preparación de textos para métrica y prosodia: la longitud vocálica es esencial para el análisis métrico de poesía griega; el modelo puede preprocesar corpus antes de un análisis métrico automatizado.
- Enriquecimiento de ediciones digitales: integración en pipelines de humanidades digitales para añadir información fonológica a textos TEI-XML o corpus anotados.
- Herramienta auxiliar de investigación filológica: como asistente de macronización con revisión humana posterior, dado que la precisión en vocales largas es del 60,4% y requiere validación experta.
- Creación de datasets de entrenamiento: el modelo puede generar etiquetas preliminares que, tras corrección manual, sirvan para entrenar modelos mayores o para ampliar datasets existentes.
- Docencia y aprendizaje del griego antiguo: generación de materiales didácticos con cantidad vocálica marcada para estudiantes que necesitan visualizar la longitud de las vocales.
- Procesamiento por lotes en entornos sin GPU: al requerir menos de 1M de parámetros, puede ejecutarse en servidores modestos o portátiles para macronizar corpus completos sin infraestructura especializada.

## Benchmarks y rendimiento

Resultados sobre el test de Norma Syllabarum Graecarum (1.916 ditronas doradas en sílabas abiertas). La precisión cuenta como incorrecta una posición sin marcar.

| Etiqueta | Acc | P | R | F1 | Cov |
|---|---|---|---|---|---|
| long | 60,4 | 84,1 | 60,4 | 70,3 | 98,8 |
| short | 97,6 | 92,6 | 97,6 | 95,0 | 99,9 |
| mixed | 91,3 | 91,6 | 91,3 | 91,4 | 99,7 |

- Validación (Norma, 2.498 posiciones): 93,96% de precisión mixta.
- Variación entre las tres semillas: 91,3 ± 0,5 de precisión mixta en test.
- Métricas mixtas: P, R y F1 promediadas de forma micro.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo tiene 866.563 parámetros (aproximadamente 3,5 MB en fp32).
- GPU recomendadas: no requiere GPU; cualquier GPU consumer es suficiente e incluso innecesaria.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) y en CPU convencional.
- Opciones de despliegue: la model card indica el uso mediante los scripts `model.py`, `tokenizer.py` y `predict.py` del repositorio Urdatorn/Makron-code, con la clase `MacronPredictor`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Makron-seed2 | 866.563 | no disponible | Macronización de griego antiguo (char-level) | GPL v3 | Hugging Face |
| Ericu950/oga-macronizer-char | no disponible | no disponible | Macronización de griego antiguo (char-level) | no disponible | Hugging Face |
| Makron-seed1 | 866.563 | no disponible | Macronización de griego antiguo (char-level) | GPL v3 | Hugging Face |
| Makron-seed3 | 866.563 | no disponible | Macronización de griego antiguo (char-level) | GPL v3 | Hugging Face |

El modelo predecesor, oga-macronizer-char, comparte arquitectura pero difiere en datos de entrenamiento (sin decontaminar) y ajuste de hiperparámetros. Las semillas 1 y 3 son idénticas salvo por la semilla de entrenamiento; la semilla 2 obtiene la mejor validación en Norma.

## Limitaciones y advertencias

- Normaliza siempre a longitudes áticas: es sistemáticamente incorrecto para formas homéricas, dóricas y otras variantes no áticas.
- Hereda los errores del sistema basado en reglas grc-macronizer, ya que se entrena con etiquetas plateadas generadas por él.
- Las vocales largas son su punto débil: solo alcanza un 60,4% de recall en la etiqueta `long`.
- Una posición sin marcar cuenta como error en la evaluación, lo que penaliza los casos de omisión.
- Licencia GPL v3: impone restricciones de copyleft para uso comercial y redistribución; cualquier obra derivada debe distribuirse bajo la misma licencia.
- Modelo monolingüe (grc) y especializado exclusivamente en macronización; no es un modelo de propósito general.
- No se documentan sesgos sociales ni de otro tipo, pero al ser un modelo filológico especializado, su ámbito de aplicación es muy restringido.
- Riesgo de alucinación en el sentido de asignación incorrecta de longitud vocálica, especialmente en formas no áticas y en vocales largas.
- La model card no especifica la longitud de contexto máxima soportada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Urdatorn/Makron-seed2
- Modelo predecesor: https://huggingface.co/Ericu950/oga-macronizer-char
- Semilla 1: https://huggingface.co/Urdatorn/Makron-seed1
- Semilla 3: https://huggingface.co/Urdatorn/Makron-seed3
- Código, logs y semillas: https://huggingface.co/Urdatorn/Makron-code
- Dataset de entrenamiento: https://huggingface.co/datasets/Urdatorn/oga-macronized-no-norma
- Benchmark Norma: https://huggingface.co/datasets/Urdatorn/norma
- Cita: Thörn Cleland, Albin y Eric Cullhed (en prensa). Automatic Annotation of Ancient Greek Vowel Length.
