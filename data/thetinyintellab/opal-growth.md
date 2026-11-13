# TheTinyIntelLab/opal-growth

## Resumen

Opal Growth es un conjunto de seis checkpoints de investigación desarrollados por The Tiny Intelligence Lab (TheTinyIntelLab) para la predicción de respuestas de crecimiento en experimentos de doble CRISPRi (double-CRISPRi) a escala local de ensayo. El modelo predice la media de dos mediciones gamma específicas de infección para pares de genes soportados dentro de un contexto de ensayo registrado, combinando una referencia calibrada de efectos principales con un residual de par aprendido de forma simétrica.

No se trata de un modelo de lenguaje ni de un transformer generativo: es un modelo biológico de respuesta a perturbaciones con arquitectura de factores de ancho 8 (rango algebraico máximo 16), cargadores personalizados y un runtime propio empaquetado en un wheel de Python. El repositorio no contiene pesos en formato estándar (safetensors, GGUF) sino checkpoints con loaders propios de Opal, y el tamaño del repo es de 0.0 GB según los metadatos de Hugging Face.

Su relevancia es estrictamente de investigación: la propia model card reconoce que el criterio de promoción global no se cumple (Jurkat falla con 4.11% de mejora frente al 5% exigido) y que la transferencia externa congelada también falló. Es un artefacto de estudio de procedimiento de entrenamiento, no una herramienta lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de factores con referencia calibrada de efectos principales y residual de par simétrico; ancho de factor 8, rango algebraico máximo 16 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; el contexto es el ensayo registrado: K562, Jurkat, K562_environment1, K562_environment2, K562_parp2022, K562_parp2023) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones; los checkpoints usan loaders propios) |
| Idiomas soportados | no disponible (no es un modelo lingüístico; opera sobre nombres de genes y contextos de ensayo) |
| Licencia | opal-mixed-source-terms (contribuciones originales de Opal bajo MIT; referencias medidas empaquetadas conservan términos upstream con incertidumbre de licencia divulgada) |
| Formato de pesos | Checkpoints propios de Opal con loaders personalizados (no `transformers.AutoModel`); no safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura combina una referencia calibrada de efectos principales (single/main-effect) con un residual de par aprendido de forma simétrica. El "rank 8" histórico corresponde al ancho de factor, con rango algebraico máximo de 16. Cada checkpoint se asocia a un contexto de ensayo concreto y a un conjunto de genes soportados (427 para horlbeck_K562 y horlbeck_Jurkat, 313 para environment1 y environment2, 539 para parp2022 y 537 para parp2023). Los singles medidos y los arrays de soporte se almacenan junto a cada checkpoint y no pueden ser sustituidos por consultas del usuario.

El procedimiento de entrenamiento utiliza 16.000 etiquetas de par para entrenamiento y 4.000 para validación por cada tarea, con validación cruzada de cinco bloques. Los checkpoints exportados son seleccionados por validación en el fold 0. Las fuentes de datos son Horlbeck 2018 (GSE116198), cohortes ambientales (GSE312636) y cohortes PARPi (GSE284018). El manifiesto original vincula nombres de ensayo, contextos, hashes de fuente, hashes de checkpoint y la elección fija de despliegue fold-0. No se documenta RLHF, DPO ni entrenamiento por preferencias, al no ser un modelo generativo.

## Capacidades

- Predicción de la media de dos mediciones gamma de infección para pares de genes soportados dentro de un contexto de ensayo registrado.
- Predicción de respuesta a perturbación (perturbation-response) en experimentos de doble CRISPRi a escala local de ensayo.
- Manejo explícito de abstención ante genes desconocidos o no soportados, auto-pares, nombres malformados y desajustes de contexto.
- Simetría garantizada en la predicción de pares (el residual de par es simétrico).
- Verificación de integridad mediante hash del manifiesto original.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Investigación metodológica en predicción de respuestas de perturbación: el modelo sirve para estudiar procedimientos de entrenamiento y criterios de promoción en tareas de doble CRISPRi, comparando la ganancia relativa frente a referencias simples por tarea.
- Análisis de efectos de interacción génica en contextos de ensayo controlados: para pares de genes soportados en K562, Jurkat o cohortes PARPi, el modelo estima la media de las dos lecturas gamma de infección y permite priorizar pares candidatos dentro del ensayo.
- Evaluación de transferencia externa: dado que la transferencia congelada falló con un MSE de finalización entre 1.08% y 2.15% peor que los efectos principales congelados en cuatro cohortes externas, el modelo es útil como caso de estudio negativo para diseñar protocolos de validación.
- Reproducibilidad de experimentos: el manifiesto original, los hashes de checkpoint y el script `verify_files.py` permiten reproducir la verificación de integridad y el smoke test de inferencia (`example.py`) sin reentrenamiento.
- Estudio de cobertura y abstención: con cobertura del 100% en las poblaciones registradas entre genes soportados por entrenamiento, el modelo permite analizar el comportamiento de abstención ante consultas fuera de soporte.
- Docencia y formación en biología computacional: como ejemplo de modelo biológico con licencia mixta, procedencia documentada y limitaciones explícitas, adecuado para enseñar buenas prácticas de trazabilidad de datos y checkpoints.

## Benchmarks y rendimiento

La model card reporta resultados de procedimiento de entrenamiento agrupados en cinco folds (no de los checkpoints exportados individuales de fold 0). La métrica es la reducción relativa de MSE frente a la referencia simple seleccionada.

| Tarea de crecimiento | Pares retenidos en cinco bloques | Reducción relativa de MSE |
|---|---:|---:|
| K562 | 16.210 | 5,80% |
| Jurkat | 16.210 | 4,11% |
| Environmental 1 | 9.833 | 25,14% |
| Environmental 2 | 9.833 | 28,75% |
| PARPi 2022 | 29.016 | 17,56% |
| PARPi 2023 | 28.651 | 13,95% |

El criterio sin cambios exige al menos un 5% de ganancia en cada tarea; Jurkat falla con 4,11%, por lo que el criterio de promoción para todas las tareas permanece incumplido. La transferencia externa congelada también falló, con un MSE de finalización entre 1,08% y 2,15% peor que los efectos principales congelados en cuatro cohortes externas. El archivo `benchmark.json` conserva la comparación agregada completa y no constituye una nueva puntuación. La verificación de entrega local reprodujo exactamente 17.176 predicciones almacenadas sin nuevos ajustes ni puntuaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repo es de 0.0 GB y los checkpoints usan loaders propios, por lo que no se publican requisitos de memoria.
- GPU recomendadas: no disponible. La verificación local documentada se realizó con Torch 2.9.1 en CPU (índice `download.pytorch.org/whl/cpu`) y Python 3.14.0, lo que sugiere que la inferencia es viable en CPU.
- Compatibilidad con GPU de consumo: no disponible; no se documenta.
- Opciones de despliegue: runtime propio de Opal instalado mediante el wheel empaquetado en `requirements.txt`; no compatible con vLLM, llama.cpp, Ollama ni TGI al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de predicción de respuesta a perturbaciones en la documentación proporcionada. La model card únicamente compara el modelo con su propia referencia simple de efectos principales (single/main-effect), frente a la cual reporta las reducciones de MSE de la tabla anterior. No se identifican alternativas de la misma categoría, tamaño o tarea con datos verificables en la información disponible.

## Limitaciones y advertencias

- La predicción local de ensayo no establece descubrimiento biológico, comprensión causal ni transferencia fiable a estudios independientes.
- Los checkpoints no pueden predecir genes arbitrarios en frío ni intercambiar contextos de ensayo.
- Las dos mediciones de infección son lecturas dependientes del ensayo, no réplicas independientes.
- No hay intervalos de predicción calibrados por consulta.
- La sensibilidad condicional de genes es solo evidencia agregada.
- Las predicciones no tienen validación para uso clínico.
- El criterio de promoción global no se cumple: Jurkat falla con 4,11% frente al 5% exigido.
- La transferencia externa congelada falló en cuatro cohortes externas y el reentrenamiento local sobre esas fuentes no rescata el resultado.
- Licencia mixta: las contribuciones originales de Opal son MIT, pero las referencias medidas empaquetadas conservan términos upstream con incertidumbre de licencia divulgada; es necesario revisar `LICENSE.md` y `SOURCE_NOTICES.md` antes de cualquier uso.
- La autorización de publicación (`RELEASE_AUTHORIZATION.json`) sustituye una política interna histórica de solo uso local, sin reclamar nuevos permisos de terceros.
- El repositorio no contiene datos de benchmarks oficiales en el model-index (lista vacía).
- Riesgo de alucinación y sesgos: no aplica en el sentido habitual de modelos generativos, pero la abstención explícita ante entradas fuera de soporte es el único mecanismo de control documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TheTinyIntelLab/opal-growth
- Código fuente (v1.0.0): https://github.com/TheTinyIntelLab/opal/tree/v1.0.0
- Preprint de investigación: https://github.com/TheTinyIntelLab/opal/blob/v1.0.0/paper/main.pdf
- The Tiny Intelligence Lab: https://thetinyintelligencelab.vercel.app/
- Términos de distribución: https://huggingface.co/TheTinyIntelLab/opal-growth/blob/main/LICENSE.md
- Avisos de fuente: https://huggingface.co/TheTinyIntelLab/opal-growth/blob/main/SOURCE_NOTICES.md
- Autorización de publicación: https://huggingface.co/TheTinyIntelLab/opal-growth/blob/main/RELEASE_AUTHORIZATION.json
