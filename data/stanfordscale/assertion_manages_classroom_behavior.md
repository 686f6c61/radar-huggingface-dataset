# StanfordSCALE/assertion_manages_classroom_behavior

## Resumen

`StanfordSCALE/assertion_manages_classroom_behavior` es un clasificador binario de texto desarrollado por la Stanford SCALE Initiative dentro del proyecto EduBehaviors, un conjunto de esquemas basados en aserciones para la codificacion auditable de dialogo educativo. El modelo determina si una intervencion docente concreta puede etiquetarse como "maneja el comportamiento del aula" (`manages_classroom_behavior`), una asercion perteneciente al conjunto `bu5` (bottom-up). Se apoya en SetFit, una tecnica de ajuste eficiente en pocos ejemplos que combina un encoder de frases con una cabeza de clasificacion ligera.

Arquitectonicamente no es un LLM generativo, sino un clasificador de frases: emplea como cuerpo el encoder `sentence-transformers/paraphrase-mpnet-base-v2` (MPNet, aproximadamente 109,5 millones de parametros) y una cabeza de regresion logistica. El modelo fue entrenado sobre un subconjunto anotado por LLM de intervenciones de profesores del TalkMoves Dataset, con 13.182 ejemplos de entrenamiento, 3.295 de desarrollo y 8.238 de prueba.

Su relevancia actual reside en el ambito de la investigacion educativa: ofrece una herramienta reproducible y auditable para etiquetar discurso de aula, con un ROC-AUC de 0,920 en test. Es un modelo muy especializado, en ingles, entrenado exclusivamente sobre habla docente, y pensado para integrarse en el paquete Python `EduBehaviors-kit`. El repositorio no registra descargas ni likes y la licencia no esta declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit: encoder de frases MPNet (transformer) + cabeza de regresion logistica |
| Parametros totales | 109.486.464 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; al ser un encoder pequeno admite cuantizacion pero no se documenta) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue el paradigma SetFit. En una primera fase contrastiva se ajusta el encoder `sentence-transformers/paraphrase-mpnet-base-v2` (basado en MPNet) con un learning rate de 2e-05, batch size 16, 10 epocas y un maximo de 5.000 pasos, con precision mixta activada en GPU. En una segunda fase se entrena una cabeza de regresion logistica (`LogisticRegression`) sobre las representaciones generadas, con learning rate 0.01, batch size 32 y un maximo de 100 pasos de evaluacion. La semilla empleada es 20260904 y se generan embeddings contrastivos a partir de pares de frases.

Los datos proceden del dataset `StanfordSCALE/assertions_llm_annotated_talkmoves` (13.182 ejemplos de train, 3.295 de dev, 8.238 de test), derivado del TalkMoves Dataset y compuesto por intervenciones de profesores. Las etiquetas fueron generadas por anotadores LLM, con una fiabilidad interanotador medida mediante alfa de Krippendorff de 0,611. La tasa base de la clase positiva es del 11,0 % (10,8 % en train, 11,3 % en dev y en test), lo que indica un claro desbalance de clases. La entrada del modelo es la intervencion (`utterance`) tal cual, sin plantilla adicional.

## Capacidades

- Clasificacion binaria de texto: predice si una intervencion docente puede etiquetarse como "maneja el comportamiento del aula".
- Devuelve etiqueta (`predict`) y probabilidad (`predict_proba`), lo que permite umbralizar segun la aplicacion.
- Funciona sobre habla de profesor en ingles; procesa la intervencion como texto plano sin contexto adicional.
- Disenado para integrarse en pipelines de codificacion de dialogo educativo a traves del paquete `EduBehaviors-kit`.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- No esta planteado como modelo multilingue: solo se ha entrenado y evaluado en ingles.

## Casos de uso

- Codificacion automatizada de discurso de aula en investigacion educativa: permite anotar grandes volumenes de transcripciones docentes aplicando la asercion `manages_classroom_behavior` de forma consistente y auditable, reduciendo el coste de la anotacion manual.
- Preetiquetado asistido para codificadores humanos: el modelo puede generar etiquetas iniciales con su probabilidad asociada (ROC-AUC 0,920) para que los investigadores prioricen la revision de casos dudosos.
- Analisis de gestion del comportamiento en programas de formacion docente: agregando las predicciones por sesion o docente se pueden obtener metricas de frecuencia de conductas de gestion del aula.
- Investigacion sobre practicas instruccionales: correlacionar la presencia de aserciones de gestion del comportamiento con resultados de aprendizaje u otras metricas del discurso.
- Construccion de dashboards de observacion de aula: alimentar indicadores en tiempo casi real a partir de transcripciones automaticas (nota: el modelo esta entrenado sobre texto ya transcrito, no sobre audio).
- Reproduccion y extension de estudios: al ser parte de un conjunto de aserciones (`bu5`) y usar una semilla y hiperparametros documentados, facilita la replicacion y la comparacion entre variantes del esquema EduBehaviors.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre `StanfordSCALE/assertions_llm_annotated_talkmoves`:

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 3.295 | 11,3 % | 0,727 | 0,520 | 0,606 | 0,880 | 0,691 |
| test | 8.238 | 11,3 % | 0,752 | 0,575 | 0,652 | 0,920 | 0,747 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 109,5 millones de parametros, por lo que en fp32 ocupa aproximadamente 0,44 GB de pesos y en fp16 alrededor de 0,22 GB; con overhead de activaciones, cabe holgadamente en menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; se beneficia de GPU modernas (RTX 3090, RTX 4090, A100, H100) para throughput alto en lotes grandes, aunque no las necesita.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo (por ejemplo GTX 1650, RTX 3060, RTX 4090) e incluso en CPU para volumenes moderados.
- Opciones de despliegue: la libreria oficial es `setfit` (que internamente usa `sentence-transformers`/Transformers); tambien puede servirse a traves de frameworks de inferencia de encoders como Hugging Face Text Embeddings Inference (TEI) exportando el encoder, o integrado en aplicaciones Python personalizadas.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La informacion proporcionada no incluye comparaciones con otros modelos. Como referencia de categoria, el modelo se apoya en `sentence-transformers/paraphrase-mpnet-base-v2` (MPNet, encoder de frases), pero no se dispone de datos de rendimiento de ese u otros clasificadores sobre la misma tarea para establecer una comparativa rigurosa. Se indica por tanto: no disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `StanfordSCALE/assertion_manages_classroom_behavior` | 109.486.464 | no disponible | no disponible | HuggingFace (0 descargas) |
| Modelos comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Las etiquetas proceden de anotadores LLM, no de codificadores humanos; el acuerdo interanotador (alfa de Krippendorff) es de 0,611, un valor moderado que limita la fiabilidad del ground truth.
- El modelo se entreno unicamente sobre intervenciones de profesores; su comportamiento sobre habla de estudiantes no ha sido probado.
- Claro desbalance de clase (tasa base del 11,0 %): el recall en la clase positiva es relativamente bajo (0,575 en test), por lo que tiende a producir falsos negativos.
- Solo soporta ingles; no se ha evaluado su comportamiento en otros idiomas.
- No hay licencia declarada, lo que impide determinar con certeza si se permite el uso comercial; conviene contactar con los autores antes de usarlo en produccion.
- Modelo meramente auxiliar de investigacion: no es un LLM generativo, no razona ni admite instrucciones, y su uso fuera del contexto de codificacion de discurso educativo no esta respaldado por evaluaciones.
- Su rendimiento se ha medido sobre el propio dataset del autor; la generalizacion a otros corpus de aula es desconocida.
- El repositorio no registra descargas ni likes, lo que sugiere una adopcion muy limitada por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_manages_classroom_behavior
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset (repositorio): https://github.com/SumnerLab/TalkMoves
