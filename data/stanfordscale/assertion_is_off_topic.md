# StanfordSCALE/assertion_is_off_topic

## Resumen
`StanfordSCALE/assertion_is_off_topic` es un clasificador de texto binario desarrollado por la Stanford SCALE Initiative dentro del proyecto *EduBehaviors: Assertion-based schemas for auditable dialogue coding*. Su funcion es determinar si una intervencion docente (utterance de profesor) esta fuera de tema respecto al hilo de la conversacion en el aula. No es un modelo generativo, sino un clasificador SetFit construido sobre el sentence encoder `sentence-transformers/paraphrase-mpnet-base-v2`.

El modelo resuelve una tarea muy concreta de analitica del discurso educativo: etiquetar automaticamente fragmentos de habla docente con la asercion `bu5__is_off_topic`. Se distribuye como parte del ecosistema `EduBehaviors-kit` y se entrena sobre un subconjunto anotado por LLM del dataset TalkMoves. Su relevancia es metodologica: ejemplifica un flujo de anotacion auditable y reproducible para investigacion educativa, con todos los artefactos publicados (dataset, hiperparametros, semilla y metricas por split).

Cuenta con 109.486.464 parametros (unos 0,4 GB en repositorio) y esta entrenado unicamente en ingles. El propio autor advierte que su F1 en test es 0,266 y que no es util de forma autonoma, por lo que debe entenderse como un componente de un pipeline mayor o como herramienta de pre-anotacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit: sentence encoder MPNet (`paraphrase-mpnet-base-v2`) + cabeza de clasificacion `LogisticRegression` |
| Parametros totales | 109.486.464 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card; el encoder base MPNet trabaja con entradas cortas (el config de sentence-transformers suele fijar 384 tokens) |
| Tipos de cuantizacion | no disponible; el modelo se distribuye en safetensors y no se documentan cuantizaciones |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria de inferencia | setfit |
| Tarea (pipeline) | text-classification (clasificacion binaria) |
| Tamano del repositorio | 0,4 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-12 |

## Arquitectura y entrenamiento
El modelo sigue el paradigma SetFit (Sentence Transformer Fine-tuning): en una primera fase se ajusta el encoder `paraphrase-mpnet-base-v2` mediante aprendizaje contrastivo sobre pares de frases, con learning rate de 2e-05, batch size 16 y un maximo de 5000 pasos; en una segunda fase se entrena una cabeza `LogisticRegression` con learning rate 0,01 y batch size 32. El entrenamiento total es de 10 epocas, con semilla 20260904 y precision mixta activada en GPU. La entrada es la utterance en crudo, sin plantilla ni prefijos adicionales.

Los datos proceden de `StanfordSCALE/assertions_llm_annotated_talkmoves`, un subconjunto anotado por anotadores LLM de las intervenciones de profesor del TalkMoves Dataset. El reparto es de 13.182 filas de entrenamiento (53,3 %), 3.294 de desarrollo (13,3 %) y 8.239 de test (33,3 %), con una tasa base de la clase positiva del 1,5 % global (1,5 % en train, 1,7 % en dev, 1,4 % en test). El acuerdo entre anotadores medido con alfa de Krippendorff es 0,606. No se documenta uso de RLHF ni DPO, al tratarse de un clasificador supervisado y no de un modelo generativo.

## Capacidades
- Clasificacion binaria de utterances docentes segun la asercion `bu5__is_off_topic` (fuera de tema / no fuera de tema).
- Salida de probabilidad calibrada mediante `predict_proba`, lo que permite fijar umbrales distintos segun el coste relativo de falsos positivos y falsos negativos.
- Codificacion semantica de frases en ingles mediante el encoder MPNet subyacente, reutilizable para similitud semantica si se extraen los embeddings.
- Integracion en el paquete Python `EduBehaviors-kit` para pipelines de codificacion de dialogo educativo.
- Procesamiento de entradas cortas de texto en crudo, sin necesidad de preprocesado especial.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento (thinking mode).
- No es un modelo multilingue: solo se ha entrenado y evaluado en ingles.

## Casos de uso
- Pre-anotacion de corpus educativos: dado su ROC-AUC de 0,797, sirve para priorizar que utterances revisar manualmente en un estudio sobre discurso de aula, reduciendo el volumen de codificacion humana sobre clases con tasa base del 1,4 %.
- Investigacion sobre TalkMoves: el modelo permite reproducir y extender analisis sobre el dataset TalkMoves con anotaciones automaticas de la asercion de fuera de tema, manteniendo trazabilidad de hiperparametros y semilla.
- Auditoria de esquemas de anotacion: al formar parte de un conjunto de aserciones (`bu5`), permite comparar el comportamiento de distintas aserciones sobre el mismo corpus y detectar incoherencias en el esquema.
- Filtrado previo en pipelines de analitica docente: descartar utterances potencialmente fuera de tema antes de aplicar modelos mas costosos de analisis de discurso, siempre con revision humana posterior.
- Formacion de profesorado asistida por datos: generar informes agregados sobre la proporcion de intervenciones fuera de tema en una sesion, utiles para reflexion post-clase.
- Analisis de senales de baja calidad instruccional: combinado con otras aserciones del mismo proyecto, permite estudiar patrones de desviacion del hilo tematico en secuencias largas de dialogo.
- Prototipado rapido en investigacion: al ser un modelo de 109 millones de parametros, se puede ejecutar en CPU dentro de notebooks sin infraestructura GPU dedicada.
- Etiquetado debil para destilacion o entrenamiento posterior: sus predicciones probabilisticas pueden usarse como pseudoetiquetas para modelos mas grandes, asumiendo la baja precision del clasificador.

## Benchmarks y rendimiento
Resultados declarados por el autor en el model-index (no verificados por terceros):

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 3.294 | 1,7 % | 0,333 | 0,182 | 0,235 | 0,792 | 0,175 |
| test | 8.239 | 1,4 % | 0,500 | 0,181 | 0,266 | 0,797 | 0,176 |

No se han publicado resultados de benchmarks en la informacion disponible mas alla de estas metricas sobre el dataset de anotacion del propio proyecto.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explicita; con 109,5 millones de parametros en fp32 el peso ocupa aproximadamente 0,44 GB, por lo que el uso real esta en el rango de 1-2 GB contando activaciones y runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria es suficiente; no requiere A100 ni H100. Una RTX 4090 o incluso GPUs integradas modernas son mas que suficientes.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo e incluso en CPU. La inferencia en CPU es viable para lotes pequenos.
- Opciones de despliegue: `setfit` (libreria oficial), `sentence-transformers` para extraer embeddings, `transformers` para cargar el encoder, y exportacion a ONNX no documentada pero tecnicamente posible. No se documenta soporte de vLLM, TGI ni llama.cpp, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares
No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada. Como referencias conceptuales de la misma categoria (clasificacion de texto corto en ingles con encoder tipo transformer), podrian considerarse variantes de la familia `sentence-transformers` con cabeza de clasificacion, o clasificadores basados en DeBERTa/RoBERTa, pero no se han facilitado metricas comparables:

| Modelo | Parametros | Contexto | Metricas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| StanfordSCALE/assertion_is_off_topic | 109.486.464 | no disponible | F1 0,266 / ROC-AUC 0,797 (test, clase positiva) | no disponible | HuggingFace (0 descargas) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- Las etiquetas de entrenamiento provienen de anotadores LLM, no de codificadores humanos, con un alfa de Krippendorff de 0,606, lo que introduce ruido irreducible en la supervision.
- El F1 de 0,266 en test es bajo y el propio autor indica que el modelo no funciona lo suficiente bien como para usarse de forma autonoma. No debe desplegarse sin revision humana.
- El recall de la clase positiva es de 0,181: el modelo se pierde aproximadamente el 82 % de los casos que deberia detectar.
- La clase positiva es extremadamente rara (1,4 % en test), por lo que la precision de 0,5 en test implica que la mitad de las detecciones son falsos positivos.
- Entrenado solo con intervenciones de profesor; el comportamiento sobre habla de estudiantes no ha sido probado.
- Solo soporta ingles y no se ha evaluado su transferencia a otros idiomas.
- La licencia no esta disponible en la informacion proporcionada, por lo que no se puede confirmar si se permite uso comercial. Se recomienda contactar con el autor antes de cualquier uso en produccion.
- Al ser un clasificador de una unica asercion, no debe interpretarse como un sistema de evaluacion docente completo ni como un indicador global de calidad instruccional.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de falsos positivos sistematicos sobre expresiones ambiguas o cambios de tema legitimos.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_is_off_topic
- Dataset de anotacion: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset: https://github.com/SumnerLab/TalkMoves
- Busqueda web: no se han encontrado enlaces relevantes al modelo en los resultados de busqueda proporcionados (los resultados devueltos corresponden a guias de viaje de San Francisco y no guardan relacion con el modelo)
