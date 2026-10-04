# udaykamath/OpenSystemOne-ModernBERT-base-v0.1

## Resumen

OpenSystemOne-ModernBERT-base-v0.1 es un clasificador de tipo "System One" publicado por el usuario udaykamath en HuggingFace. Se trata de un modelo de 156.692.741 parametros construido como cross-encoder sobre el backbone tasksource/ModernBERT-base-nli, cuyo objetivo es responder preguntas tipadas sobre un contexto y devolver probabilidades calibradas, no texto generado. Admite tres tipos de pregunta: Noul (si/no), Choice (elegir una opcion entre varias) y Score (escala ordinal), y varias preguntas por llamada.

El modelo resuelve un problema concreto: la clasificacion zero-shot con calibracion fiable. En lugar de generar etiquetas, produce probabilidades directamente interpretables como confianza, con una temperatura de 1.402 ajustada sobre una mezcla de tareas de entrenamiento reservadas. Esto lo hace util en pipelines donde el umbral de decision importa tanto como la etiqueta.

Es relevante ahora por dos motivos: primero, porque se inspira en la descripcion publica del producto Jev de TypeSafe AI (sin afiliacion ni copia, segun el autor), lo que lo situa en la linea de los clasificadores de "system one" como capa previa a razonamiento mas costoso; segundo, porque parte de ModernBERT, un encoder moderno que sustituye a BERT clasico. Su limitacion principal es que es monolingue en ingles y que el coste de computo crece linealmente con el numero de preguntas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-base) en configuracion cross-encoder: estado y pregunta se leen juntos |
| Parametros totales | 156.692.741 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens para el estado (state) y 128 tokens para la pregunta (question) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | ingles |
| Licencia | apache-2.0 (con salvedad: algunas fuentes de entrenamiento tienen terminos no comerciales, ver DATA_LICENSES.md) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un cross-encoder: el estado (contexto) y la pregunta se procesan conjuntamente, en lugar de codificarse por separado y compararse despues. El backbone es tasksource/ModernBERT-base-nli, ya ajustado para inferencia de lenguaje natural, sobre el que se anade una cabeza de clasificacion con preguntas tipadas (Noul, Choice, Score). La temperatura de calibracion se fija en 1.402, ajustada sobre tareas reservadas de la mezcla de entrenamiento.

No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; la model card remite al repositorio de codigo. Tampoco se especifica el numero de parametros de la cabeza frente al backbone. La innovacion tecnica destacable es el enfoque de preguntas tipadas multiples por llamada con calibracion explicita, junto con el uso de ModernBERT en lugar de encoders clasicos.

## Capacidades

- Clasificacion zero-shot con preguntas de tipo Noul (respuesta si/no), Choice (seleccion de una opcion entre varias) y Score (escala ordinal).
- Salida de probabilidades calibradas, no solo etiquetas, lo que permite fijar umbrales de decision.
- Multiples preguntas sobre el mismo estado en una sola llamada.
- Robustez medida frente a negacion (correlacion -0.929 entre "liked" y "disliked"), parafrasis (desviacion tipica media de P(si) de 0.030), orden de opciones (0.963 de coincidencia bajo 4 rotaciones) y trampa de "none" (0.853 de acierto al elegir "none" cuando la respuesta falta).
- Manejo de etiquetas desnudas o con descripcion (0.873 y 0.860 de acierto respectivamente).
- No es un modelo generativo: no produce texto libre, no soporta tool calling ni function calling, y no implementa agentes ni razonamiento multi-paso.
- Sin capacidades de vision, audio ni multimodalidad.
- Soporte multilingue: no disponible, el modelo es solo en ingles.

## Casos de uso

- Triaje de tickets de soporte: el modelo responde preguntas como "¿el mensaje comunica presion temporal?" o "¿que quiere el cliente?" (devolucion, ayuda tecnica) con probabilidad asociada, lo que permite enrutar por umbral y priorizar por urgencia sin entrenar un clasificador propio.
- Deteccion de intencion bancaria: con 8 opciones obtiene 0.844 de accuracy en Banking77, suficiente para enrutado de consultas en un sistema de atencion al cliente multicanal antes de pasar a un modelo generativo.
- Moderacion de contenido: util como primera capa para clasificar texto ofensivo, con la advertencia de que en TweetEval-hate rinde mal (0.503 de accuracy) y sobreestima respuestas afirmativas; conviene combinarlo con un segundo modelo.
- Analisis de sentimiento y score ordinal: la modalidad Score permite salidas en escala (por ejemplo, resenas en 5 niveles, SST-5 con 0.487 de accuracy), adecuada para paneles de opinion con umbrales calibrados.
- Filtrado de spam en SMS o mensajes: con cuatro formulaciones distintas mantiene 0.818 de accuracy y 0.030 de ECE, lo que lo hace estable frente a variaciones de redaccion.
- Etiquetado debil y anotacion asistida: dado su caracter zero-shot, se puede usar para pre-etiquetar grandes volumenes de datos antes de revision humana, aprovechando la calibracion para descartar automaticamente los casos de baja confianza.
- Clasificacion de temas en foros y preguntas: 0.674 de accuracy en Yahoo Answers topics con seleccion entre opciones, aplicable a taxonomias editoriales.
- Analisis de resenas de producto: 0.925 de accuracy en IMDb en formato Noul y 0.940 en formato Choice, con ECE de 0.028 y 0.025 respectivamente, lo que permite automatizar la lectura de resenas manteniendo la fiabilidad de la probabilidad.

## Benchmarks y rendimiento

Resultados zero-shot en tareas reservadas, segun la model card:

| Tarea | Accuracy | Macro F1 | ECE |
|---|---|---|---|
| IMDb (Noul) | 0.925 | 0.925 | 0.028 |
| IMDb invertido (Noul) | 0.921 | 0.921 | 0.019 |
| IMDb (Choice) | 0.940 | 0.940 | 0.025 |
| AG News (Choice) | 0.870 | 0.869 | 0.076 |
| TweetEval-hate (Noul) | 0.503 | 0.457 | 0.250 |
| SST-5 (Score) | 0.487 | 0.492 | 0.159 |
| SMS spam, 4 formulaciones (Noul) | 0.818 | 0.763 | 0.030 |
| Banking77, 8 opciones (Choice) | 0.844 | 0.843 | 0.162 |
| Yahoo Answers topics (Choice) | 0.674 | 0.667 | 0.114 |

Metricas de robustez adicionales:

| Prueba | Valor |
|---|---|
| Negacion, media de abs(P(liked)+P(disliked)-1) | 0.088 |
| Negacion, correlacion | -0.929 |
| Parafrasis, desviacion tipica media de P(si) | 0.030 |
| Parafrasis, peor formulacion (accuracy) | 0.880 |
| Parafrasis, mejor formulacion (accuracy) | 0.920 |
| Orden de opciones, misma respuesta en 4 rotaciones | 0.963 |
| Trampa de "none", elige "none" cuando falta la respuesta | 0.853 |
| Señuelo de "none", accuracy con "none" anadido | 0.777 |
| Etiquetas con nombres desnudos | 0.873 |
| Etiquetas con descripciones | 0.860 |
| Contexto, accuracy en IMDb a 128 tokens | 0.860 |
| Contexto, accuracy en IMDb a 256 tokens | 0.897 |
| Contexto, accuracy en IMDb a 512 tokens | 0.913 |

No se han publicado en la informacion disponible comparaciones directas contra otros modelos en las mismas condiciones.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,63 GB en fp32, 0,31 GB en fp16 y 0,16 GB en int8 para los 156,7 millones de parametros (estimacion propia a partir del recuento de parametros; no publicada por el autor).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4070 o RTX 4090 lo ejecutan con holgura. En A100 o H100 el cuello de botella sera la latencia por peticion, no la memoria.
- Cabe en GPU de consumo e incluso en CPU: por tamano, la inferencia en CPU es viable para volumenes moderados.
- Opciones de despliegue: la libreria opensystemone (usada en el ejemplo de la model card), asi como transformers al ser un backbone ModernBERT. El soporte en servidores de inferencia como vLLM o TGI para esta cabeza concreta es no disponible.
- Latencia y throughput: no publicados. El autor advierte que cada pregunta es una pasada separada sobre el estado, de modo que 16 preguntas cuestan aproximadamente 16 veces una.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenSystemOne-ModernBERT-base-v0.1 | 156.692.741 | 512 tokens de estado + 128 de pregunta | Cross-encoder con preguntas tipadas (Noul, Choice, Score) | apache-2.0 con salvedades en datos de entrenamiento | HuggingFace, 0 descargas |
| tasksource/ModernBERT-base-nli (modelo base) | aprox. 149 M (no confirmado en la informacion disponible) | no disponible | Encoder NLI | no disponible en la informacion proporcionada | HuggingFace |
| BART-large-MNLI | no disponible en la informacion proporcionada | no disponible | Clasificacion zero-shot clasica (NLI) | no disponible en la informacion proporcionada | HuggingFace |
| DeBERTa-v3-base zero-shot | no disponible en la informacion proporcionada | no disponible | Clasificacion zero-shot | no disponible en la informacion proporcionada | HuggingFace |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada. Cualquier comparacion de accuracy exigiria reproducir las mismas tareas y condiciones.

## Limitaciones y advertencias

- Coste lineal por pregunta: cada pregunta implica una pasada completa sobre el estado, por lo que 16 preguntas cuestan aproximadamente 16 veces una sola.
- Mal rendimiento en texto ofensivo y de odio: en TweetEval-hate obtiene 0.503 de accuracy y 0.250 de ECE. El modelo ordena razonablemente (AUC aproximada de 0.7) pero responde "si" con mucha mas frecuencia de la que reflejan las etiquetas.
- Se pierden señales literales: el autor advierte que las claves explicitas (urgencia, fechas, numeros) pueden pasarse por alto.
- Deriva de calibracion: la temperatura se ajusto sobre la mezcla de entrenamiento y puede desviarse en un dominio nuevo; se recomienda reajustarla con una muestra propia.
- Idioma: unicamente ingles. No hay soporte multilingue.
- Restricciones de licencia: aunque el modelo se publica bajo apache-2.0, algunas fuentes de entrenamiento tienen terminos no comerciales. Antes de un uso comercial hay que revisar DATA_LICENSES.md en el repositorio de codigo.
- Ventana de contexto limitada: 512 tokens de estado, lo que descarta documentos largos sin troceado previo. La accuracy en IMDb cae de 0.913 a 512 tokens hasta 0.860 a 128 tokens.
- Riesgo de alucinacion: no aplica en el sentido generativo, porque el modelo no produce texto libre, pero si existe riesgo de falsos positivos en las respuestas si/no, especialmente en dominios alejados del entrenamiento.
- Modelo sin validacion externa: 0 descargas y 0 likes en el momento de redactar la ficha, por lo que no hay evidencia de uso en produccion por terceros.
- No soporta generacion, tool calling, agentes ni multimodalidad, por lo que no puede sustituir a un LLM en tareas de razonamiento abierto.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/udaykamath/OpenSystemOne-ModernBERT-base-v0.1
- Modelo base: https://huggingface.co/tasksource/ModernBERT-base-nli
- Repositorio de codigo con DATA_LICENSES.md: mencionado en la model card, URL no disponible en la informacion proporcionada
- Paper, blog o demo adicionales: no disponible. La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los resultados obtenidos eran contenido no relacionado y sin valor tecnico.
