# ukisai/Swift-Qwen3.8-27b

## Resumen

Swift-Qwen3.8-27B es un ajuste fino (derivado) del modelo Qwen3.8-27B desarrollado por UkisAI. Su objetivo no es ampliar capacidades del modelo base, sino reducir el coste de razonamiento: según el autor, genera un 58,3 % menos de tokens de pensamiento manteniendo una pérdida de rendimiento inferior al 1 %, lo que se traduce en una aceleración de hasta x1,95 en varias tareas. El modelo conserva la modalidad image-text-to-text del original y está publicado con licencia propietaria swift-open-license-1.0 bajo acceso restringido (gated).

Técnicamente es un fine-tuning con adaptadores LoRA sobre el modelo base, orientado a penalizar durante el razonamiento aquellos tokens marcadores que, según el análisis del autor, inducen "sobrepensamiento" (overthinking). Incorpora además un componente de transferencia derivado de ThinkingCap-Qwen3.6-27B de BottleCap AI. El resultado es un modelo de 27.781 millones de parámetros (27,78 B) en formato safetensors, con repositorio de 55,6 GB, pensado para despliegues donde la latencia y el coste por token de razonamiento son críticos.

La relevancia actual del modelo reside en la economía del razonamiento: los modelos con cadenas de pensamiento largas consumen muchos tokens de salida, lo que encarece la inferencia y aumenta la latencia. Un derivado que reduce drásticamente esos tokens sin degradar la precisión es atractivo para pipelines de producción con restricciones de coste y tiempo de respuesta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.8-27B; familia qwen3_5 / qwen3_8 según tags), ajuste con LoRA |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; existe una variante GGUF publicada en repo separado |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (licencia "other", acceso restringido/gated) |
| Formato de pesos | safetensors (librería transformers); GGUF disponible en repo aparte |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer multimodal image-text-to-text, y se obtiene mediante un ajuste fino con LoRA. La innovación declarada por el autor es metodológica: identificaron tokens marcadores de razonamiento que, en su análisis de los rollouts de razonamiento de Qwen, desencadenan sobrepensamiento, y entrenaron penalizando el uso de esos tokens durante la fase de razonamiento. El efecto buscado es producir trazas de razonamiento más cortas y, según el autor, reducir también los errores de sobrepensamiento.

Además del ajuste principal, Swift incorpora un componente de transferencia derivado de ThinkingCap-Qwen3.6-27B de BottleCap AI. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO; esa información no está disponible. Tampoco se especifican innovaciones de inferencia como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento general, con trazas de pensamiento más cortas que el modelo base.
- Razonamiento eficiente en tokens ("efficient-thinking", "token-efficient"): reduce el número de tokens de razonamiento necesarios para llegar a la respuesta.
- Procesamiento de imagen y texto (pipeline image-text-to-text), heredado del modelo base.
- Capacidades de instrucción y seguimiento de formato evaluadas mediante IFBench.
- Razonamiento en dominios científicos y de conocimiento general (GPQA-Diamond, MMLU-Pro).
- Soporte multilingüe parcial evidenciado por la evaluación en C-Eval (chino); el conjunto completo de idiomas no está documentado.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita en la información proporcionada.

## Casos de uso

- Asistentes de razonamiento en producción con coste por token controlado: al reducir los tokens de pensamiento entre un 41 % y un 58 % en las evaluaciones publicadas, el modelo abarata cada consulta de razonamiento y permite servir más peticiones por GPU.
- Atención al cliente con razonamiento interno: el modelo puede razonar antes de responder sin generar cadenas de pensamiento excesivamente largas, lo que reduce la latencia percibida en conversaciones multi-turno.
- Generación y revisión de código asistida: la model card muestra una demo sobre una muestra de LiveCodeBench v6, por lo que es adecuado para tareas de programación donde la velocidad de respuesta importa.
- Evaluación automática de preguntas científicas y de conocimiento (tipo GPQA/MMLU-Pro): útil en pipelines de generación de exámenes, verificación de respuestas o anotación asistida donde se requiere precisión con bajo coste.
- Procesamiento de documentos con imagen y texto: al ser un modelo image-text-to-text, puede extraer y razonar sobre información de capturas, diagramas o documentos escaneados combinados con instrucciones textuales.
- Seguimiento estricto de instrucciones y formatos (IFBench): adecuado para tareas de extracción estructurada, normalización de datos o generación de salidas con formato fijo donde el cumplimiento del formato es crítico.
- Despliegue en entornos con presupuesto de latencia ajustado: la aceleración declarada de x1,95 en varias tareas lo hace apto para aplicaciones interactivas que no toleran cadenas de razonamiento largas.

## Benchmarks y rendimiento

Resultados publicados por el autor comparando Qwen3.8-27B BF16 base frente al mismo base con el adaptador Swift. La tabla de la model card está truncada en la información disponible; se recogen las filas visibles.

| Benchmark | Score base | Score Swift | Tokens medios base | Tokens medios Swift | Reducción media | Reducción mediana |
|---|---|---|---|---|---|---|
| GPQA-Diamond | 88,38 % | 88,28 % | 15.014 | 8.855 | -41,0 % | -58,3 % |
| MMLU-Pro | 85,47 % | 84,95 % | 2.980 | 1.603 | -46,2 % | -28,3 % |
| C-Eval | 90,00 % | 90,62 % | 1.492 | 804 | -46,1 % | -19,3 % |
| IFBench | 73,53 % | 71,80 % | 8.052 | 4.657 | -42,2 % | -50,5 % |

El resto de secciones de la tabla (razonamiento general adicional, matemáticas, código y otras) no están disponibles en la información proporcionada. No se han publicado comparaciones con modelos de terceros en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 55,6 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica requiere GPUs de 80 GB (A100 80 GB, H100 80 GB) o múltiples GPUs.
- Cuantización a 8 bits: en torno a 28-30 GB de pesos, viable en una RTX 4090 (24 GB) solo con cuantizaciones más agresivas o con offloading parcial.
- Cuantización a 4 bits (GGUF): aproximadamente 14-16 GB de pesos, cabe en una RTX 4090 (24 GB) y en GPUs consumer de 16 GB con contexto reducido.
- GPU recomendadas: A100 80 GB o H100 80 GB para BF16; RTX 4090 / RTX 3090 para cuantizaciones de 4-8 bits; configuraciones multi-GPU para contexto largo.
- Opciones de despliegue: transformers (librería declarada), llama.cpp/Ollama mediante la variante GGUF publicada por el autor, y servidores compatibles con endpoints (tag endpoints_compatible). vLLM y TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles de forma numérica; el autor declara una aceleración de x1,95 en varias tareas respecto al base, atribuible a la reducción de tokens generados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift-Qwen3.8-27B | 27,78 B | no disponible | Razonamiento eficiente en tokens (LoRA sobre Qwen3.8-27B) | swift-open-license-1.0 (gated) | Hugging Face, acceso restringido; GGUF disponible |
| Qwen3.8-27B (base) | 27 B (según denominación) | no disponible | Modelo multimodal image-text-to-text de referencia | licencia de Qwen (no detallada aquí) | Hugging Face |
| ThinkingCap-Qwen3.6-27B (BottleCap AI) | 27 B (según denominación) | no disponible | Razonamiento con control de tokens de pensamiento; fuente del componente de transferencia | no disponible | Hugging Face |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, enfoque y disponibilidad.

## Limitaciones y advertencias

- Licencia propietaria swift-open-license-1.0: es necesario revisar el texto completo de la licencia antes de cualquier uso comercial; el acceso es restringido (gated) y puede requerir aprobación o licencia enterprise.
- Pérdida de rendimiento no nula: el autor declara menos del 1 % de pérdida, pero en IFBench la caída observada es de 73,53 % a 71,80 % (1,73 puntos), superior a esa cifra declarada.
- Riesgo de alucinación: no se documenta ninguna evaluación específica de veracidad o tasa de alucinación; al ser un derivado de un modelo generativo, el riesgo persiste.
- Sesgos: no se proporciona información sobre sesgos demográficos, culturales o lingüísticos del modelo base ni del ajuste.
- Idiomas: el conjunto de idiomas soportados no está documentado; la única evidencia es la evaluación en C-Eval (chino), lo que no garantiza cobertura multilingüe amplia.
- Contexto: la longitud máxima de contexto no está especificada, lo que impide planificar despliegues con ventanas largas sin verificación empírica.
- Razonamiento acortado: la reducción de tokens de pensamiento puede degradar tareas que requieren cadenas de razonamiento muy largas; conviene validar en el dominio propio antes de producción.
- Dependencia del modelo base: hereda las limitaciones, sesgos y restricciones del Qwen3.8-27B original.
- Información incompleta: la model card no detalla datos de entrenamiento, composición del dataset ni proceso de alineación, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Variante GGUF: https://huggingface.co/ukisai/Swift-Qwen3.8-27B-GGUF
- Licencia: https://huggingface.co/ukisai/Swift-Qwen3.8-27b/blob/main/LICENSE
- Web del autor: https://ukisai.com
- Página de producto: https://ukisai.com/products/swift
- Modelo fuente del componente de transferencia: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.6-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
