# WhiteUniversal/smart-request-router-setfit

## Resumen

Smart Request Router - SetFit System 1 (B1) es un sistema de clasificación de texto desarrollado por WhiteUniversal para el enrutamiento de peticiones de soporte bancario. Se compone de dos modelos SetFit entrenados sobre el encoder multilingüe `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`: uno de intención (12 rutas) y otro de urgencia (etiquetas 0-3). Actúa como "System 1" de un pipeline de enrutamiento con escalado: responde cuando tiene confianza suficiente y deriva al sistema superior cuando no la tiene, según una política definida en el repositorio del proyecto.

El modelo no es un LLM generativo, sino un clasificador de frases basado en embeddings con cabezas de clasificación SetFit. Su relevancia práctica reside en que ofrece una primera capa de triaje rápida y barata para tickets de soporte, con métricas publicadas de accuracy (0,778 en test sin escalado; 0,920 de accuracy selectiva al 50% de cobertura con la política de escalado) y un recall de urgencia de 0,879 sin escalado y 0,956 con escalado.

El repositorio ocupa 1,0 GB, soporta inglés y español, y se distribuye bajo licencia Apache 2.0. Está pensado para integrarse en pipelines de atención al cliente donde la latencia y el coste por inferencia importan más que la generación libre de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit (encoder de frases + cabeza de clasificación) sobre sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 |
| Parametros totales | no disponible (el modelo base MiniLM-L12 tiene 12 capas; el número exacto de parámetros no se indica en la información) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base es un encoder de frases con límite típico de 128-512 tokens; el valor exacto no se especifica) |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | en, es |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El sistema combina dos clasificadores SetFit independientes: uno para intención (12 rutas de soporte bancario) y otro para urgencia (niveles 0 a 3). Ambos se construyen sobre el encoder `paraphrase-multilingual-MiniLM-L12-v2`, un transformer de 12 capas orientado a embeddings de frases multilingües. SetFit entrena la cabeza de clasificación con pares de frases contrastivos, lo que permite obtener clasificadores eficientes con pocos datos etiquetados.

El entrenamiento se realizó sobre el dataset `WhiteUniversal/smart-request-router-dataset`, con 3.080 filas en el split de test. El autor advierte de que los datos de entrenamiento en español son traducciones automáticas y que las etiquetas de urgencia se derivan de reglas a partir de la intención, no de anotación humana. La política de escalado se define en `config/policy.setfit.yaml` del repositorio `Leito2/smart-request-router` y no forma parte de los pesos del modelo.

## Capacidades

- Clasificación de intención en 12 rutas de soporte bancario.
- Clasificación de urgencia en 4 niveles (0-3).
- Soporte de escalado selectivo: el sistema puede abstenerse y derivar a un sistema superior cuando la confianza es baja.
- Multilingüe limitado a inglés y español.
- Inferencia ligera basada en embeddings, adecuada para entornos de bajo coste.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso; es exclusivamente un clasificador.

## Casos de uso

- Triaje de tickets de soporte bancario: el clasificador de intención asigna cada petición a una de las 12 rutas, permitiendo enrutar automáticamente al equipo adecuado sin intervención humana en los casos de alta confianza.
- Priorización por urgencia: el clasificador de urgencia (0-3) permite ordenar la cola de atención y garantizar que los casos urgentes se atiendan primero, con un recall de urgencia de 0,879 sin escalado.
- Primera capa de un pipeline híbrido: el modelo actúa como System 1 y solo escala a un LLM o a un agente humano cuando la confianza cae por debajo del umbral definido en la política, reduciendo coste y latencia.
- Filtrado previo en atención al cliente automatizada: al clasificar la intención antes de invocar un modelo generativo, se evita enviar consultas triviales a sistemas más caros.
- Enrutamiento en centros de contacto con volumen alto: la inferencia basada en embeddings permite procesar lotes grandes de tickets con requisitos de hardware modestos.
- Análisis de tendencias de soporte: las etiquetas de intención y urgencia generadas a escala permiten agregar métricas de demanda por tipo de consulta y prioridad.
- Despliegue en entornos con recursos limitados: al ser un clasificador SetFit sobre MiniLM, puede ejecutarse en CPU o en GPUs consumer, a diferencia de un LLM generativo.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Accuracy (test, 3.080 filas, sin escalado) | 0,778 |
| Macro-F1 (test, sin escalado) | 0,704 |
| Recall de urgencia (test, sin escalado) | 0,879 |
| Accuracy selectiva (muestra de 600 filas, con política de escalado) | 0,920 |
| Cobertura con política de escalado | 50% |
| Recall de urgencia (con política de escalado) | 0,956 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un encoder MiniLM-L12 con cabezas SetFit, el uso de memoria es bajo (del orden de cientos de MB en FP32, menos en FP16), aunque el autor no publica cifras.
- GPU recomendadas: no especificadas; cualquier GPU con suficiente memoria para un encoder MiniLM es adecuada.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU consumer moderna, aunque no se documenta oficialmente.
- Opciones de despliegue: la model card indica el uso mediante `snapshot_download` de `huggingface_hub` y la clase `SetFitRouter` del repositorio `training/baselines/setfit_model.py`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|---|
| WhiteUniversal/smart-request-router-setfit | SetFit sobre MiniLM-L12 | no disponible | no disponible | en, es | Apache 2.0 | Accuracy 0,778; accuracy selectiva 0,920 al 50% de cobertura |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | Encoder de frases | no disponible | no disponible | multilingüe | Apache 2.0 | No comparable directamente (modelo base, sin cabeza de clasificación) |
| Clasificadores SetFit genéricos | SetFit | depende del encoder | depende del encoder | depende del encoder | depende del encoder | No disponible |

No se dispone de datos de benchmarks de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés y español; no cubre otros idiomas.
- Limitado a 12 rutas de soporte bancario; no es un clasificador general.
- Los datos de entrenamiento en español son traducciones automáticas, lo que puede introducir sesgos y errores de traducción.
- Las etiquetas de urgencia son generadas por reglas a partir de la intención, no anotadas por humanos, lo que puede limitar su fiabilidad.
- El accuracy sin escalado es 0,778, por lo que el uso sin política de escalado puede producir errores de enrutamiento en una fracción significativa de casos.
- No es un modelo generativo: no puede responder preguntas ni mantener conversaciones; solo clasifica.
- No se documentan sesgos específicos ni evaluaciones de robustez más allá de las métricas del split de test.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios distintos del bancario.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WhiteUniversal/smart-request-router-setfit
- Repositorio del proyecto: https://github.com/Leito2/smart-request-router
- Dataset: https://huggingface.co/datasets/WhiteUniversal/smart-request-router-dataset
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
