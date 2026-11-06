# zikabyte/kenari-demo-lr

## Resumen

Kenari demo es un clasificador de audio de caracter demostrativo, publicado por el usuario zikabyte en Hugging Face, que aplica una regresion logistica sobre embeddings congelados de VGGish para priorizar la exploracion clinica de posibles casos de tuberculosis a partir de grabaciones de tos. No es un modelo generativo ni un transformer de gran tamano: es un pipeline ligero de dos etapas (extractor de caracteristicas de audio preentrenado mas clasificador lineal) entrenado sobre el conjunto de datos publico TBscreen (Sharma et al., Science Advances 2024; Zenodo 10431329), recogido con el dispositivo Pixel en Nairobi.

El modelo se presenta explicitamente como una prueba de viabilidad (proof of feasibility) y no como una herramienta clinica. Su unico proposito declarado es elevar la prioridad de examen de un paciente, sin emitir nunca juicios de seguridad ni diagnosticos de positividad o negatividad frente a la tuberculosis. El autor reporta un AUROC de aproximadamente 0,67 con configuraciones simples, obtenido mediante validacion cruzada a nivel de sujeto sobre un unico conjunto de datos publico.

Su relevancia actual es metodologica y de investigacion: sirve como linea base reproducible para quienes exploren cribado acustico de enfermedades respiratorias con recursos minimos, y como ejemplo de las limitaciones de generalizacion cuando un modelo se entrena y evalua en una sola poblacion y un solo tipo de dispositivo. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0,0 GB, coherente con un artefacto de pesos lineales que no incluye el extractor VGGish.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica sobre embeddings congelados de VGGish (clasificador lineal sobre caracteristicas de audio) |
| Parametros totales | no disponible (clasificador lineal; el numero exacto depende de la dimensionalidad de los embeddings VGGish, no declarada en la model card) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones; el clasificador lineal no las requiere) |
| Idiomas soportados | no disponible (el input es audio de tos, no texto; no se declara cobertura linguistica) |
| Licencia | CC BY 4.0 |
| Formato de pesos | no disponible (el repositorio no especifica el formato; no incluye los pesos de VGGish) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline en cascada de dos componentes. El primero es VGGish, un extractor de embeddings de audio derivado de VGG y entrenado originalmente sobre AudioSet, que se usa en modo congelado (frozen): sus pesos no se actualizan ni se distribuyen en este repositorio, sino que deben obtenerse por separado desde el zip de codigo de TBscreen en Zenodo 10431329. El segundo componente es una regresion logistica que opera sobre esos embeddings y produce una puntuacion de prioridad. No hay transformer, ni atencion, ni mecanismo generativo; el coste computacional en inferencia es minimo una vez calculado el embedding.

El entrenamiento se realizo sobre el conjunto de datos publico TBscreen (Sharma et al., Science Advances 2024; Zenodo 10431329, licencia CC BY 4.0), con grabaciones de tos capturadas con un dispositivo Pixel en Nairobi. La evaluacion reportada por el autor emplea validacion cruzada a nivel de sujeto (subject-level cross-validation), lo que evita la fuga de informacion entre grabaciones del mismo participante. No se documentan en la model card el numero de tokens, la composicion exacta del dataset, ni el uso de RLHF o DPO; tampoco se describe ninguna innovacion tecnica adicional como decodificacion especulativa o atencion lineal, que no aplican a este tipo de modelo.

## Capacidades

- Clasificacion binaria o puntuacion de prioridad sobre grabaciones de tos, orientada a elevar la prioridad de examen clinico.
- Extraccion de caracteristicas de audio mediante VGGish en modo congelado, reutilizable para otros clasificadores sobre el mismo espacio de embeddings.
- Inferencia de bajo coste: al ser un clasificador lineal sobre embeddings precalculados, el despliegue es viable en CPU.
- No emite diagnosticos: por diseno, no declara que una persona este sana, libre de tuberculosis ni positiva.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingues declaradas.
- No dispone de modo thinking, vision ni procesamiento de audio distinto de la tos como entrada.

## Casos de uso

- Linea base de investigacion en cribado acustico: sirve para comparar nuevas arquitecturas (CNN sobre espectrogramas, modelos auto-supervisados de audio) contra un clasificador lineal simple sobre VGGish, con un AUROC de referencia de aproximadamente 0,67.
- Priorizacion de triaje en estudios de campo controlados: dentro de un protocolo de investigacion, la puntuacion del modelo puede ordenar a los participantes para revision clinica, siempre con confirmacion microbiologica o radiologica posterior.
- Reproducibilidad de resultados: al depender de un dataset publico (Zenodo 10431329) y de un extractor estandar, permite replicar el experimento y auditar la metodologia de validacion a nivel de sujeto.
- Prototipado de pipelines de audio en entornos con recursos limitados: el flujo VGGish mas regresion logistica puede ejecutarse en CPU, lo que facilita pruebas de concepto en portatiles o dispositivos de bajo consumo.
- Docencia y divulgacion sobre limites de generalizacion: un caso documentado de modelo entrenado en una sola poblacion y un solo dispositivo, util para ilustrar riesgos de sesgo de dominio en audio clinico.
- Evaluacion de sesgos de dispositivo y poblacion: permite medir la caida de rendimiento al aplicar el clasificador a grabaciones de otros telefonos o de otras regiones, como paso previo a cualquier validacion externa.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| AUROC | aproximadamente 0,67 | Validacion cruzada a nivel de sujeto, configuraciones simples, dataset TBscreen |

No se han publicado en la informacion disponible resultados adicionales de benchmarks (sensibilidad, especificidad, F1, comparacion con otros modelos) ni comparaciones cuantitativas con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de un clasificador lineal sobre embeddings, la inferencia puede ejecutarse en CPU sin GPU dedicada.
- GPU recomendadas: no se especifican; VGGish es ligero y puede correr en GPU de gama baja, pero no se documentan requisitos.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el bajo coste del extractor y del clasificador, aunque no hay datos publicados que lo confirmen.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; estas herramientas no aplican a un modelo de audio de este tipo. El despliegue requeriria cargar VGGish desde el zip de TBscreen y aplicar el clasificador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de modelos comparables con datos verificables de parametros, contexto, rendimiento o licencia. La model card no cita alternativas ni resultados de comparacion.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kenari demo (zikabyte/kenari-demo-lr) | no disponible | no aplica | AUROC aprox. 0,67 en TBscreen | CC BY 4.0 | Hugging Face, 0 descargas |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es una herramienta clinica: el propio autor indica que no debe usarse para diagnostico.
- No valida sobre poblacion indonesia, otros telefonos ni grabaciones de campo; el rendimiento fuera del dominio de entrenamiento es desconocido.
- El umbral de prioridad es provisional y no ha sido calibrado clinicamente.
- AUROC de aproximadamente 0,67 con configuraciones simples: rendimiento modesto que no permite descartar casos.
- Entrenado sobre un unico dataset publico (TBscreen, dispositivo Pixel, Nairobi), lo que introduce sesgo de dominio de dispositivo y de poblacion.
- No incluye los pesos de VGGish; requiere descargar el zip de codigo de TBscreen (Zenodo 10431329) para poder ejecutarse.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si existe riesgo de falsos negativos y falsos positivos con consecuencias clinicas si se usa fuera de investigacion.
- Licencia CC BY 4.0: permite uso comercial con atribucion, pero la licencia no sustituye la validacion regulatoria necesaria para cualquier uso sanitario.
- Sin descargas ni likes registrados; sin evidencia de uso independiente ni de replicacion externa.
- No se documentan sesgos demograficos especificos, composicion del dataset ni analisis de subgrupos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zikabyte/kenari-demo-lr
- Dataset y codigo TBscreen (Zenodo): https://zenodo.org/records/10431329
- Referencia cientifica citada: Sharma et al., Science Advances 2024 (sobre el dataset TBscreen)
