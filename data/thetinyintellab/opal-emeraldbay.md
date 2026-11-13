# TheTinyIntelLab/opal-emeraldbay

## Resumen

Opal EmeraldBay es un checkpoint de referencia de expresión génica contextual publicado por The Tiny Intelligence Lab. No es un modelo de lenguaje: es un artefacto de inferencia especializado en respuesta a perturbaciones químicas, que combina efectos de referencia locales a la fuente (singles medidos) con un kernel contextual ajustado para devolver un vector de efecto de expresión poblacional-medio en el orden de genes almacenado. Está entrenado sobre los seis primeros shards del dataset EmeraldBay de Tahoe Bio y un piloto retenido de ocho contextos celulares registrados.

El modelo resuelve un problema acotado: dada una combinación química exacta (identificador, dosis y tiempo) y un contexto celular registrado, produce una estimación agregada del efecto transcripcional. Exige que existan singles medidos para cada intervención; rechaza intervenciones desconocidas, contextos no soportados u órdenes de genes que no coincidan con la referencia. El ejemplo de la model card usa `Adagrasib@0.005uM:5d` y `Capecitabine@0.5uM:5d` en el contexto `CVCL_0320`.

Su relevancia es metodológica y de reproducibilidad: distribuye un checkpoint histórico con verificación de hashes, orden de genes y simetría de pares, y documenta explícitamente resultados negativos (comparaciones de composición de expresión desfavorables frente a referencias simples, transferencia externa congelada fallida y criterios de promoción no alcanzados). No se ha publicado información sobre arquitectura de red, número de parámetros ni longitud de contexto en el sentido de los LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (kernel contextual ajustado sobre efectos de referencia locales; loaders propios de Opal, no `transformers.AutoModel`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica como ventana de tokens; opera sobre contextos celulares registrados) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | CC BY 4.0 para modelo y contenido de referencia; el software original de Opal y el ejemplo de inferencia usan MIT (`CODE_LICENSE.txt`) |
| Formato de pesos | no disponible (checkpoints cargados con loaders propios; se preservan bytes y hashes del manifiesto original) |

## Arquitectura y entrenamiento

La model card no describe una arquitectura de red neuronal convencional (transformer, MoE, SSM o híbrida). El artefacto combina efectos de referencia locales a la fuente derivados de singles medidos con un kernel contextual ajustado. El ajuste se realiza sobre efectos agregados emparejados construidos a partir de los seis primeros shards de la release del dataset EmeraldBay, con un piloto retenido de ocho contextos registrados. No se especifican hiperparámetros, número de tokens de entrenamiento ni composición detallada del dataset más allá de la procedencia.

El empaquetado no ejecuta entrenamiento ni ajuste nuevo: verifica hashes de los ficheros originales, inferencia correcta, salidas finitas, orden de genes de salida y simetría respecto al orden de los pares. El manifiesto original tiene SHA-256 `c3a1287c438f698acc3521c5a3c0495c040e426eb07e443d3b315cce087b3f81`. La fuente es el dataset EmeraldBay de Tahoe Bio, revisión fijada `f2a0be6b02f731553657f0115c345b20bb020ede`. No se incluye el dataset de célula única en bruto.

## Capacidades

- Predicción de efecto de expresión poblacional-medio para combinaciones químicas con singles medidos y contexto celular registrado.
- Aceptación de identificadores exactos de compuesto, dosis y tiempo (por ejemplo, `Adagrasib@0.005uM:5d`).
- Rechazo explícito de singles no disponibles, intervenciones desconocidas, contextos no soportados y órdenes de genes inconsistentes.
- Devolución del vector de efecto en el orden de genes almacenado, con escala derivada de los metadatos de referencia.
- Verificación de simetría respecto al orden de los pares en la consulta.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: no es un modelo de lenguaje.
- No es un predictor general de intervenciones en frío ni de contextos arbitrarios.

## Casos de uso

- Priorización de combinaciones farmacológicas in silico: dado un par de compuestos con singles medidos en un contexto registrado, obtener un vector de efecto agregado para decidir qué combinaciones merecen validación experimental posterior.
- Análisis secundario de estudios de perturbación: recalcular efectos contextuales agregados sobre los shards de EmeraldBay para comparar con resultados publicados, manteniendo la trazabilidad de hashes y revisión de la fuente.
- Reproducibilidad de pipelines bioinformáticos: integrar el checkpoint en un flujo con verificación de manifiesto (`verify_files.py`) y comprobación de orden de genes antes de cualquier análisis aguas abajo.
- Docencia y formación en métodos de perturbación: usar el ejemplo incluido (`example.py`) como smoke test de inferencia y como caso de estudio de resultados negativos documentados.
- Auditoría de metodología: examinar `verification.json`, `provenance.json` y `SHA256SUMS.txt` para evaluar prácticas de empaquetado y atribución de datos derivados.
- Control negativo en comparativas de modelos: emplear las comparaciones de composición de expresión retenidas (incluidas las desfavorables frente a referencias simples) como línea base honesta en evaluaciones de nuevos métodos.
- Exploración de incertidumbre: usar los diagnósticos exploratorios de fiabilidad incluidos, sabiendo que no ofrecen garantía de cobertura biológica calibrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El `model-index` está vacío y la model card indica que el benchmark de crecimiento de seis tareas pertenece a otro endpoint y no debe atribuirse a este checkpoint de expresión.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repo es 0.0 GB y no se documentan parámetros ni pesos cuantizados.
- GPU recomendadas: no disponible; el ejemplo de la model card se ejecuta con Torch CPU (`torch==2.9.1` con índice CPU).
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: instalación local vía `pip` con la revisión fijada de Opal (`v1.0.0`), `requirements.txt` y loaders propios; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Entorno verificado: Python 3.11–3.14 (verificación local con Python 3.14.0).

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (referencias de respuesta a perturbaciones con singles observados y kernel contextual) ni datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Los efectos son medias poblacionales: no reproducen distribuciones a nivel de célula ni identifican mecanismos moleculares causales.
- Requiere singles medidos locales a la fuente; no es un predictor general de intervenciones en frío ni de contextos arbitrarios.
- Los diagnósticos de fiabilidad e incertidumbre son exploratorios y no ofrecen garantía de cobertura biológica calibrada.
- No hay validación para uso clínico, ni afirmación de descubrimiento biológico, ni superioridad frente a modelos de frontera.
- Las comprobaciones de empaquetado (hashes, inferencia, salidas finitas, orden de genes, simetría) no establecen precisión en un estudio nuevo.
- El benchmark de crecimiento de seis tareas pertenece a otro endpoint y no debe atribuirse a este checkpoint.
- Se documentan resultados negativos: comparaciones de composición de expresión desfavorables frente a referencias simples seleccionadas, transferencia externa congelada fallida y criterios de promoción no alcanzados.
- Licencia CC BY 4.0 con requisitos de atribución a Tahoe Bio y a los creadores de EmeraldBay; el contenido derivado del dataset conserva dicha atribución. La licencia MIT del software no sustituye la licencia del modelo/referencia.
- No se incluye el dataset de célula única en bruto, lo que limita la reauditoría completa de los datos de origen.
- Sin descargas ni likes registrados en el momento de la consulta; adopción y soporte comunitario no verificables.

## Enlaces

- Hugging Face: https://huggingface.co/TheTinyIntelLab/opal-emeraldbay
- Código fuente (release v1.0.0): https://github.com/TheTinyIntelLab/opal/tree/v1.0.0
- Preprint: https://github.com/TheTinyIntelLab/opal/blob/v1.0.0/paper/main.pdf
- Hallazgos científicos: https://github.com/TheTinyIntelLab/opal/blob/v1.0.0/docs/research.md
- Laboratorio: https://thetinyintelligencelab.vercel.app/
- Dataset fuente EmeraldBay: https://huggingface.co/datasets/tahoebio/EmeraldBay
- Revisión fijada del dataset: https://huggingface.co/datasets/tahoebio/EmeraldBay/blob/f2a0be6b02f731553657f0115c345b20bb020ede/README.md
