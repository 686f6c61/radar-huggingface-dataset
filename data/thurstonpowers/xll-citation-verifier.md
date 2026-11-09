# thurstonpowers/xll-citation-verifier

## Resumen

XLL Citation Verifier es un modelo de clasificación de texto desarrollado por thurstonpowers, concebido como un verificador experimental de citas legales. Se trata de un fine-tuning del encoder ModernBERT-large `convaiinnovations/laya` que, en lugar de generar texto, evalúa una ocurrencia de cita ya seleccionada y responde a tres preguntas fijas: si el fragmento constituye una referencia a una fuente, si el span seleccionado es utilizable (preserva el destino y los calificadores explícitos) y qué tipo de fuente es (estatuto, reglamento, ley, referencia interna, manual, etc.).

El modelo resuelve un problema acotado pero crítico en pipelines de extracción de citas legales: la verificación posterior de candidatos ya detectados. Con 421.293.830 parámetros, una ventana de secuencia nativa de 8.192 tokens y una licencia Apache 2.0, está pensado para integrarse como etapa de control de calidad tras un extractor generativo, aportando etiquetas de reconocimiento, completitud y tipo de fuente junto con medidas de confianza calibrada.

Es relevante ahora porque los sistemas de recuperación y análisis jurídico necesitan distinguir citas completas de referencias truncadas o ambiguas antes de usarlas en producción. El modelo está entrenado y evaluado sobre material de Connecticut y federal de EE. UU., con un contrato de entrada estricto y un SDK específico (`laya==0.4.2`), lo que lo convierte en una pieza de infraestructura más que en un asistente de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-large) con cabezas de decisión Laya |
| Parametros totales | 421.293.830 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens de secuencia completa; 2.048 tokens de cabeza; límite nativo de 48 tokens para el texto de opción |
| Tipos de cuantizacion | no disponible (pesos exportados en FP16) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, PyTorch |

## Arquitectura y entrenamiento

El modelo parte del encoder ModernBERT-large `convaiinnovations/laya` (revisión `7b928d828b7b0e022f929d9bd2e44165aa270148`) y aplica un fine-tuning completo del encoder y de las cabezas de decisión. La arquitectura no es generativa: recibe un estado estructurado que incluye la jurisdicción y tipo contenedor, la identidad de sección, la cita seleccionada con sus offsets originales, 48 caracteres de frontera a cada lado y un pasaje de evidencia parcialmente explícito (220 caracteres antes y 260 después, con marcadores del span seleccionado). Sobre esa entrada produce etiquetas discretas para reconocimiento, usabilidad del span y tipo de fuente, más un vector de probabilidad.

El entrenamiento se realizó durante dos épocas, con 3.217 actualizaciones reales del optimizador sobre 38.390 ejemplos admitidos: 28.390 ocurrencias candidatas de regulaciones de Connecticut y 10.000 ejemplos federales, equilibrados a 2.000 por categoría de fuente contenedora. La supervisión son etiquetas duras derivadas de etiquetas provisionales CLEF aceptadas por el usuario y de reparaciones separadas por procedencia (asistente/regla). Los splits están separados por familia de fuente, grupo de capítulo y hash exacto: optimización 34.307 ejemplos, calibración 1.511 y evaluación 2.572. Se usó LR de 2.5e-5 para el encoder y 1e-4 para las cabezas, batch efectivo de 64 ítems-pregunta y semilla 102301. Los pesos exportados en FP16 se verificaron contra los parámetros nativos redondeados y se recargaron para la evaluación.

## Capacidades

- Clasificación de reconocimiento de cita: determina si un fragmento seleccionado es una referencia a una fuente, aunque esté incompleto (etiquetas `a`, `b`, `u` para sí, no, incierto).
- Evaluación de usabilidad del span: comprueba si el span seleccionado preserva el destino y los calificadores explícitos; una referencia puede ser reconocida pero no utilizable.
- Clasificación del tipo de fuente: estatuto, reglamento, ley (Act), referencia interna, manual y otras categorías definidas en `questions.json`.
- Detección de incompletitud: marca cortes numéricos, calificadores rectores omitidos y extremos de rango como incompletos; acepta miembros de listas coordinadas completas como utilizables.
- Salida con confianza calibrada (`answer_confidence`) y una segunda medida derivada de la entropía (`confidence`).
- Procesamiento de contexto jurídico acotado: lee el span seleccionado y un pasaje de evidencia delimitado, sin generación de texto libre.
- No soporta tool calling, agentes, visión, audio ni razonamiento multi-paso; es un clasificador de decisión con preguntas fijas.

## Casos de uso

- Control de calidad en pipelines de extracción de citas: tras un extractor generativo, el verificador recibe cada ocurrencia candidata y filtra las que no son referencias válidas o cuyo span está truncado, evitando que citas defectuosas lleguen al índice de búsqueda.
- Enriquecimiento de bases de datos jurídicas: clasificar automáticamente cada cita por tipo de fuente (estatuto, reglamento, ley, referencia interna) para construir metadatos estructurados y navegables en un corpus normativo.
- Detección de referencias incompletas en documentos regulatorios: marcar cortes numéricos y rangos con extremos omitidos para que un revisor humano complete la cita antes de su publicación.
- Verificación previa a la citación en asistentes legales: antes de que un sistema muestre una cita al usuario, el modelo confirma que el span seleccionado preserva el destino y los calificadores, reduciendo citas erróneas.
- Auditoría de corpus de Connecticut y federal: con evaluación específica sobre material de Connecticut y federal de EE. UU., permite revisar lotes de documentos y priorizar por incertidumbre usando `answer_confidence` como umbral.
- Etiquetado asistido para anotadores: el modelo propone reconocimiento, completitud y tipo de fuente con confianza calibrada, y los revisores humanos aceptan o corrigen, generando nuevos datos de entrenamiento con procedencia separada.
- Monitorización de deriva en extracción documental: al conservar incertidumbres y fallos de extracción aguas arriba de forma independiente, sirve como señal de alarma cuando la tasa de spans no utilizables aumenta en un lote de documentos.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluación interna de concordancia con referencias provisionales y separación por fuente ("Internal source-disjoint provisional-reference agreement"), pero el contenido proporcionado se interrumpe antes de mostrar las cifras. No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 421 millones de parámetros en FP16, los pesos ocupan aproximadamente 0,85 GB, a lo que se suma el estado de activación del encoder para secuencias de hasta 8.192 tokens.
- GPU recomendadas: no disponible; la evaluación del autor se realizó en un runtime Spark con NVIDIA PyTorch/CUDA, y el SDK admite `device="cuda"` y `device="cpu"`.
- Cabe en GPU de consumo: previsiblemente sí por tamaño de pesos, aunque no hay cifras oficiales de memoria pico con contexto completo; el autor incluye una comprobación de humo en CPU para carga e inferencia.
- Opciones de despliegue: SDK `laya==0.4.2` con `transformers==4.57.1`, PyTorch y safetensors; backend `eager`, con `compile` y `fast` desactivados en el ejemplo. El helper `inference.py` incluido ofrece CLI, verificación de checksums y comprobación de entradas completas. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor advierte que las predicciones pueden variar entre dispositivos y precisiones (FP16 autocast en entrenamiento nativo frente a BF16 CUDA eager en el SDK público).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| XLL Citation Verifier | 421.293.830 | 8.192 tokens de secuencia | Clasificación de citas legales (3 preguntas fijas) | apache-2.0 | Hugging Face, SDK Laya |
| convaiinnovations/laya (base) | no disponible | no disponible | Modelo base ModernBERT-large | no disponible | Hugging Face |
| ModernBERT-large (referencia de familia) | no disponible | no disponible | Encoder de propósito general | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo etiqueta como experimental y con `inference: false` en la model card; no debe asumirse estabilidad de API ni de comportamiento entre versiones.
- Cobertura geográfica limitada: la evaluación cubre Connecticut y material federal de EE. UU.; la evaluación sobre otros estados queda abierta.
- Dependencia estricta del contrato de entrada: requiere offsets en índices de puntos de código Unicode de Python, texto original sin modificar, jurisdicción y tipo contenedor correctos, y el `questions.json` sin cambios. Un uso incorrecto invalida las predicciones.
- Límites nativos: 8.192 tokens de secuencia, 2.048 de cabeza y 48 tokens de texto de opción; el desbordamiento debe gestionarse explícitamente y no se trunca en silencio.
- Variabilidad por dispositivo y precisión: las predicciones pueden diferir entre FP16 y BF16 o entre CPU y CUDA, lo que exige fijar el entorno en producción.
- Dos medidas de confianza distintas: `answer_confidence` es la calibrada y la adecuada para umbrales; `confidence` deriva de la entropía y no debe usarse para decisiones.
- Las incertidumbres, los fallos de extracción aguas arriba y las retenciones de revisión conocidas deben conservarse de forma independiente; el modelo no los resuelve.
- Riesgo de sesgo y alucinación: al ser un clasificador con etiquetas duras y datos de un dominio jurídico concreto, puede heredar sesgos de las anotaciones provisionales y de las reparaciones asistidas; no genera texto, pero sus etiquetas pueden ser erróneas en fuentes no vistas.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre la exactitud de las citas verificadas recae en el integrador.
- Sin descargas ni likes en el momento de la consulta y con fecha de creación posterior a la actual, lo que sugiere un lanzamiento muy reciente y sin validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thurstonpowers/xll-citation-verifier
- Dataset de entrenamiento: https://huggingface.co/datasets/thurstonpowers/xll-citation-verifier
- Modelo base: https://huggingface.co/convaiinnovations/laya
