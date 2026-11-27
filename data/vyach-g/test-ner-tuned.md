# vyach-g/test-ner-tuned

## Resumen

`vyach-g/test-ner-tuned` es un modelo de reconocimiento de entidades nombradas (NER) para alemán, obtenido mediante ajuste fino de `deepset/gbert-base` sobre el corpus GermEval 2014 y sobre un corpus médico (GPTNERMED) para la detección de diagnósticos. El autor lo distribuye empaquetado en ONNX cuantizado a 8 bits para su ejecución en el navegador mediante Transformers.js, lo que lo convierte en una pieza pensada para aplicaciones web ligeras de etiquetado de texto en tiempo real, sin backend de inferencia dedicado.

El modelo resuelve la tarea de etiquetado a nivel de token con cinco clases: persona (PER), organización (ORG), localización (LOC) y diagnóstico (DIS), además de la etiqueta `O`. La inclusión de la clase DIS es la aportación diferencial frente a un NER alemán convencional: permite localizar menciones de patologías en textos clínicos, si bien el propio autor advierte que se trata de detección de menciones y no de un sistema de diagnóstico clínico.

Es relevante ahora por su formato de despliegue (ONNX q8, aproximadamente 105 MB) y por su integración directa con Transformers.js, lo que facilita prototipos de privacidad por diseño: el texto no sale del navegador del usuario. No obstante, se trata de un repositorio con 12 descargas y 0 likes, sin benchmarks publicados, por lo que debe evaluarse como artefacto experimental y no como componente listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer), base `deepset/gbert-base` |
| Parametros totales | no disponible (el modelo base GBERT-base es de tamaño base; el autor no publica el recuento exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no declarada en la model card; el límite vendría impuesto por el tokenizador y la configuración del modelo base) |
| Tipos de cuantizacion | ONNX q8 (`onnx/model_quantized.onnx`, ~105 MB) |
| Idiomas soportados | alemán (`de`) |
| Licencia | `other` (ver sección de limitaciones: MIT del base, CC BY 4.0 de GermEval 2014, corpus GPTNERMED sin SPDX y artículo CC BY-NC-ND) |
| Formato de pesos | ONNX (`model_quantized.onnx`), configuración y tokenizador en JSON; repositorio de 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es la de `deepset/gbert-base`, un encoder transformer tipo BERT preentrenado en alemán, sobre el que se añade una cabeza de clasificación de tokens (`token-classification`). El ajuste fino se realiza en dos frentes: el corpus GermEval 2014, que aporta las anotaciones de PER, ORG y LOC, y el corpus GPTNERMED, del que procede la clase DIS. El conjunto de etiquetas resultante es `O`, `B-/I-PER`, `B-/I-ORG`, `B-/I-LOC` y `B-/I-DIS`, con esquema BIO.

La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset, la proporción entre corpus ni si se aplicaron técnicas de regularización o búsqueda de hiperparámetros. Tampoco se documenta ninguna innovación arquitectónica: el valor del repositorio es el pipeline de exportación a ONNX y su empaquetado para Transformers.js, cuyos fuentes de entrenamiento y exportación se incluyen en el directorio `training/` del repositorio.

## Capacidades

- Etiquetado de entidades nombradas en alemán a nivel de token con esquema BIO.
- Detección de personas (PER), organizaciones (ORG) y localizaciones (LOC) según la anotación de GermEval 2014.
- Detección de menciones de diagnósticos médicos (DIS) en textos clínicos, procedente de GPTNERMED.
- Inferencia en navegador mediante Transformers.js con pesos ONNX cuantizados a 8 bits.
- Ejecución sobre frases individuales o documentos cortos; el ejemplo de la model card procesa una única oración clínica.
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- No dispone de modo de razonamiento explícito (thinking mode), visión ni audio.
- Capacidad multilingüe limitada al alemán; no se declaran otros idiomas.

## Casos de uso

- Anonimización de historiales clínicos en el navegador: el modelo permite localizar nombres de pacientes (PER), organizaciones sanitarias (ORG) y localizaciones (LOC) antes de enviar el texto a un servidor, de modo que la pseudonimización ocurre en el cliente y el dato sensible no abandona el dispositivo.
- Preetiquetado asistido para anotadores humanos: en un flujo de anotación de corpus GermEval, el modelo genera etiquetas iniciales que el revisor corrige, reduciendo el coste por documento en comparación con el etiquetado desde cero.
- Extracción de menciones de patologías en informes: la clase DIS permite construir índices de diagnósticos citados en notas clínicas para tareas de recuperación de información, siempre con revisión humana y sin uso como sistema de decisión clínica.
- Enriquecimiento de contenidos periodísticos o legales en alemán: detección de personas y organizaciones en artículos para construir grafos de entidades o resaltar menciones en una interfaz de lectura.
- Demo web interactiva de NER: al ejecutarse con Transformers.js y un fichero de ~105 MB, permite publicar una demostración estática en un CDN sin infraestructura de GPU ni servidor de inferencia.
- Procesamiento por lotes de textos cortos en pipelines ligeros: al ser un modelo de tamaño base cuantizado, puede procesar grandes volúmenes de titulares o párrafos en CPU, con un coste por token bajo comparado con modelos generativos.
- Enmascaramiento de datos en formularios: integración en una aplicación de captura de texto libre para señalar automáticamente posibles datos personales antes del envío.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el artefacto distribuido es ONNX q8 de aproximadamente 105 MB, por lo que el peso en memoria es del orden de cientos de megabytes incluyendo tokenizador y buffers; no se publican cifras de consumo medido.
- GPU recomendadas: no disponibles; al ser un modelo de tamaño base cuantizado, la inferencia en CPU es viable y no requiere GPU dedicada.
- Compatibilidad con GPU de consumo: previsiblemente sí en cualquier GPU de consumo moderna, e incluso en CPU, dado el tamaño del artefacto; no hay mediciones publicadas que lo confirmen.
- Opciones de despliegue: Transformers.js (vía `@huggingface/transformers` con `dtype: "q8"`) es el camino documentado por el autor; al estar en formato ONNX, es desplegable con runtimes ONNX (ONNX Runtime Web, ONNX Runtime) y potencialmente con otros motores compatibles con ONNX, aunque no se documentan en la model card.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `vyach-g/test-ner-tuned` | no disponible (base GBERT-base) | no disponible | de | `other` (MIT + CC BY 4.0 + corpus sin SPDX) | ONNX q8 | Añade clase DIS; orientado a Transformers.js |
| `deepset/gbert-base` | tamaño base (no confirmado en la información) | no disponible | de | MIT | safetensors/PyTorch | Modelo base sin cabeza NER; requiere ajuste fino |
| `flair/ner-german-large` | no disponible | no disponible | de | no disponible | PyTorch | Alternativa NER alemana de referencia; sin datos de benchmark en esta ficha |
| `dslim/bert-base-NER` | no disponible | no disponible | en (mayoritariamente) | no disponible | PyTorch/ONNX | NER en inglés; no cubre alemán ni la clase DIS |

La comparación cuantitativa no es posible con la información disponible: no se han publicado métricas de F1 para este modelo ni se dispone de cifras verificadas de los alternativas en el material proporcionado.

## Limitaciones y advertencias

- Licencia `other` con obligaciones acumuladas: el modelo base `deepset/gbert-base` es MIT, el corpus GermEval 2014 es CC BY 4.0 y exige atribución, y el corpus GPTNERMED no tiene identificador SPDX mientras que su artículo asociado es CC BY-NC-ND. El propio autor califica el uso comercial de la clase DIS como "zona gris".
- La clase DIS detecta menciones textuales de diagnósticos; no constituye una herramienta de diagnóstico ni debe presentarse como tal.
- Riesgo de alucinación de entidades: como todo modelo discriminativo de etiquetado, puede marcar como entidad fragmentos que no lo son, especialmente en dominios distintos del entrenamiento (texto coloquial, jerga, abreviaturas médicas).
- Sesgos no evaluados: no se documentan análisis de sesgo por género, origen o tipo de texto; el comportamiento en variedades del alemán distintas de la estándar es desconocido.
- Cobertura limitada a un solo idioma (alemán); no se declara soporte multilingüe.
- Longitud de contexto no declarada; el uso previsto en el ejemplo es de una sola oración, y no hay evidencia de rendimiento en documentos largos.
- Sin benchmarks publicados ni métricas de F1, precisión o recall: no es posible estimar su calidad frente al estado del arte sin una evaluación propia.
- Repositorio con muy baja adopción (12 descargas, 0 likes) y nombre con prefijo `test-`, lo que sugiere un artefacto experimental sin garantías de mantenimiento.
- Para producción, conviene validar el modelo con un conjunto etiquetado propio antes de integrarlo en cualquier flujo que afecte a decisiones sobre personas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vyach-g/test-ner-tuned
- Modelo base: https://huggingface.co/deepset/gbert-base
- Dataset GermEval 2014 (NER): https://huggingface.co/datasets/lschoen/germeval14_ner
- Fuentes de entrenamiento y exportación: https://huggingface.co/vyach-g/test-ner-tuned/tree/main/training
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
- Paquete `@huggingface/transformers`: https://www.npmjs.com/package/@huggingface/transformers
