# ydh0822/english-ai-detector

## Resumen

English AI Detector v2 (ID de model card `english-ai-detector-v2-practical`; repositorio `ydh0822/english-ai-detector`) es un clasificador binario humano/IA para prosa inglesa desarrollado por ydh0822. No es un modelo generativo: emite probabilidades calibradas, aplica abstención explícita y ofrece rankings de fuente exploratorios. Se apoya en `sentence-transformers/all-MiniLM-L6-v2` y `answerdotai/ModernBERT-base`, y se distribuye como un bundle de inferencia personalizado de cuatro componentes, no como un único checkpoint `AutoModelForSequenceClassification`.

El modelo resultó relevante por su enfoque conservador: umbrales fijos, abstención y evaluación en cuatro cohortes finales con AUROC entre 0,9958 y 0,9994. Su alcance está acotado a inglés natural con al menos 128 unidades tipo palabra; las entradas cortas o en otros idiomas reciben probabilidades exploratorias e `inconclusive`. El repositorio ocupa 0,8 GB y la licencia es de uso para investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Bundle de inferencia personalizado con cuatro componentes: `minilm4_epoch1` (0,25 del margen binario estandarizado), `modern3_epoch2` (0,75 del margen binario estandarizado), `minilm_v3_epoch2` (probabilidades heredadas familia/25 hojas) y `statistical_v2` (refinamiento heredado de versión nominal). No es un único checkpoint `AutoModelForSequenceClassification`. |
| Parámetros totales | No disponible (repo de 0,8 GB; bundle de dos encoders base y componentes estadísticos). |
| Parámetros activos | No aplica (no es un modelo MoE). |
| Longitud de contexto | No disponible como ventana única. Procesa flujos completos con ventanas solapadas y agregación ponderada por tokens nuevos; la interfaz HTTP local admite 200.000 caracteres por defecto. |
| Tipos de cuantización | No disponible. |
| Idiomas soportados | Inglés (`en`). Entradas cortas o en otros idiomas reciben probabilidades exploratorias e `inconclusive`; el guard de inglés no cubre todos los spans mixtos. |
| Licencia | `research-use-model-notice` (`other`): aviso de uso para investigación. |
| Formato de pesos | No disponible. Es un bundle de inferencia personalizado; no se documenta en la información proporcionada si usa safetensors, GGUF u otro formato. |

## Arquitectura y entrenamiento

El sistema combina dos encoders binarios: `minilm4_epoch1` aporta 0,25 del margen binario estandarizado y `modern3_epoch2` aporta 0,75. A ellos se suman `minilm_v3_epoch2`, que conserva probabilidades heredadas de familia/25 hojas, y `statistical_v2`, que conserva el refinamiento heredado de versión nominal dentro de familia. La mezcla opera sobre márgenes crudos estandarizados, no mediante un promedio de probabilidades. Los encoders binarios no sustituyen al antiguo encoder de fuente calibrado de forma independiente. El bundle contiene siete familias y 25 hojas, incluidas categorías de complemento de catálogo; los 18 nombres concretos son alias nominales de editor/API, no identidades de pesos verificadas de forma independiente.

La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF/DPO; no aplica como modelo generativo. La evaluación final usa cohortes MAGE no utilizado, pipeline de fuentes NQ reservado, MAGA/MGB modernos con controles y RAID/DIPPER con controles. Los umbrales están congelados y los criterios eran preregistrados; según la model card, ningún resultado final seleccionó la mezcla o los cortes.

## Capacidades

- Clasificación binaria humano/IA en prosa inglesa con al menos 128 unidades tipo palabra según la regex Unicode `\b\w+\b`, no subwords del encoder.
- Probabilidades calibradas con abstención explícita: decisión de IA si `P(AI) >= 0,7233173320180257`; decisión de humano si `P(human) >= 0,9049688379295407`, con `P(human)=1-P(AI)`; el resto abstiene. Exactamente `P(AI)=0,5` es inconcluso.
- Detección de generación directa por IA y de reescritura sustantiva por IA, incluido un original humano reescrito por DIPPER.
- Rankings de fuente exploratorios: siete familias y 25 hojas, condicionados a IA incluso cuando el resultado binario es humano o inconcluso; el primer puesto no establece la fuente.
- Procesamiento de flujos completos con ventanas solapadas y agregación ponderada por tokens nuevos; las colas no se descartan silenciosamente.
- Interfaz HTTP local con límites por defecto de 200.000 caracteres, 8 MiB por subida, seis peticiones por minuto y una detección concurrente; CLI/Python según memoria y tiempo.
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, visión ni audio; es un clasificador.

## Casos de uso

- Triaje de integridad académica en ensayos largos: clasificar trabajos de al menos 128 palabras, aplicar los umbrales publicados y enviar a revisión humana los casos con abstención. Es adecuado porque exige longitud mínima y no presenta el resultado como prueba de autoría.
- Moderación editorial en foros y medios: preclasificar artículos y publicaciones largas para detectar generación o reescritura por IA, usando la abstención para no actuar automáticamente sobre casos dudosos. La interfaz HTTP admite flujos de hasta 200.000 caracteres.
- Auditoría de reescritura por IA en medios: detectar originales humanos reescritos por herramientas como DIPPER, un caso incluido explícitamente en el alcance del modelo. Los rankings de fuente deben tratarse como exploratorios.
- Curación de corpus de entrenamiento: filtrar texto inglés generado o reescrito por IA en pipelines de datos, conservando los casos `inconclusive` para revisión. Es útil para reducir contaminación sin borrar muestras dudosas de forma indiscriminada.
- Verificación de originalidad en plataformas freelance: marcar entregas largas potencialmente reescritas por IA y requerir evidencia adicional antes de tomar medidas. El modelo no debe usarse como prueba única ni como porcentaje de palabras escritas por IA.
- Investigación reproducible sobre detectores: usar los umbrales fijos y las cuatro cohortes documentadas como base de comparación metodológica. La model card reporta AUROC, recuperación y tasas de error con intervalos bootstrap.
- Confianza y seguridad en comunidades: analizar publicaciones largas en inglés con despliegue local y revisión humana de las decisiones de IA. Los límites de peticiones y concurrencia deben dimensionarse para el tráfico previsto.

## Benchmarks y rendimiento

No se han publicado resultados de MMLU, HumanEval o GSM8K en la información disponible; no son benchmarks aplicables a un clasificador de este tipo. La evaluación disponible corresponde a detección humano/IA:

| Cohorte final | Humano / IA | AUROC [IC95%] | Recuperación correcta de IA [IC95%] | Humano → IA [IC95%] | Inconclusivo |
|---|---:|---|---|---|---:|
| Principal: MAGE no utilizado | 1.500 / 1.500 | 0,997829 [0,996428, 0,998788] | 97,60% [96,88%, 98,24%] | 1,40% [0,88%, 2,02%] | 2,23% |
| Pipeline de fuentes NQ reservado | 400 / 400 | 0,999388 [0,998429, 0,999960] | 99,50% [98,75%, 100,00%] | 3,50% [1,75%, 5,38%] | 4,63% |
| MAGA/MGB modernos + controles | 1.000 / 1.000 | 0,997897 [0,995859, 0,999439] | 97,80% [96,90%, 98,75%] | 0,70% [0,20%, 1,30%] | 2,55% |
| RAID/DIPPER + controles | 600 / 1.200 | 0,995828 [0,993346, 0,997562] | 95,17% [93,87%, 96,25%] | 0,17% [0,00%, 0,50%] | 3,78% |

La recuperación correcta de humano es 95,73%, 87,75%, 95,50% y 95,00%, respectivamente; los errores IA→humano son 0,80%, 0,00%, 0,90% y 1,58%. NQ muestra un intercambio materialmente peor: 3,50% humano→IA, 87,75% de recuperación correcta de humano y un IC del FPR hasta 5,38%; el IC del FPR principal llega a 2,02%. Pasar objetivos puntuales no establece esas cifras como cotas poblacionales. La recuperación forzada de Modern en el corte de IA es 98,00%, mientras que la recuperación desplegada real es 97,80% porque incluye el rechazo del guard. Las exactitudes equilibradas forzadas al umbral 0,5 son 98,13%, 97,38%, 98,75% y 97,83%; no son estimaciones de exactitud de tres vías ni se agrupan en una exactitud universal.

Los intervalos son bootstrap percentil del 95% por grupo conectado completo, con 500 réplicas y semilla 42. Condicionan a predicciones y calibración fijadas y a los grupos muestreados, y excluyen incertidumbre de reentrenamiento, selección y calibración. La información suministrada se interrumpe en la tabla de vistas de reescritura y slices más débiles; no se añaden cifras no disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,8 GB, pero no se publican requisitos de VRAM ni se detallan parámetros y cuantización del bundle completo.
- GPU recomendadas: no disponible. No se especifican A100, H100, RTX 4090 ni otras GPU en la información proporcionada.
- Compatibilidad con GPU consumer: no confirmada. No hay datos oficiales que permitan afirmar que cabe en una GPU consumer concreta.
- CPU: no disponible. La capacidad de CLI/Python depende de memoria y tiempo según la model card.
- Opciones de despliegue: interfaz HTTP local y uso mediante CLI/Python. No se mencionan vLLM, llama.cpp, Ollama ni TGI; al ser un clasificador, los servidores de generación no son la vía documentada.
- Límites por defecto de la interfaz HTTP: 200.000 caracteres, 8 MiB por subida, seis peticiones por minuto y una detección concurrente. Colas, cuotas y límites adicionales alojados son separados.
- Latencia y throughput: no disponible. Solo se documentan los límites de peticiones y concurrencia, no medidas de rendimiento.
- Espacio en disco: 0,8 GB para el repositorio.

## Comparativa con modelos similares

No se dispone de datos de modelos alternativos comparables en la información proporcionada; no es posible comparar parámetros, contexto, rendimiento, licencia y disponibilidad sin inventar cifras.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| English AI Detector v2 | No disponible | No disponible como ventana única; procesa ventanas solapadas y admite 200.000 caracteres por HTTP | AUROC 0,9958-0,9994 en cuatro cohortes | `research-use-model-notice` | HuggingFace |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El resultado no es un porcentaje de palabras escritas por IA, no es prueba de autoría y no autentica la identidad del modelo generador.
- Alcance limitado a prosa inglesa con al menos 128 unidades tipo palabra. No se establece precisión para textos cortos ni para otros idiomas; el guard de inglés no detecta todos los spans mixtos.
- La política de decisión exige usar los umbrales publicados y la abstención; no debe sustituirse por la clase binaria de mayor puntuación. Las probabilidades de fuente están condicionadas a IA incluso si el resultado binario es humano o inconcluso.
- `accepted_family` y `accepted_model` permanecen `null`; las afirmaciones de familia y versión nominal están desactivadas. Los 18 nombres concretos son alias de editor/API, no identidades de pesos verificadas.
- Los intervalos de evaluación condicionan a predicciones y calibración fijadas y excluyen incertidumbre de reentrenamiento, selección y calibración. Los criterios puntuales, no los extremos de confianza, determinaron la aceptación.
- No hay garantía de tasa de falsos positivos del 1% a nivel poblacional o por dominio. NQ muestra un intercambio más débil: 3,50% humano→IA, 87,75% de recuperación correcta de humano y un IC del FPR hasta 5,38%.
- Cero errores observados en una cohorte no prueba riesgo cero; un intervalo bootstrap puede ser degenerado.
- No se declara una exactitud universal agrupada. Las exactitudes equilibradas al umbral 0,5 son diagnósticos separados y no estimaciones de exactitud de tres vías.
- No se detallan sesgos demográficos o de dominio conocidos; la evaluación se limita a cohortes MAGE, NQ, MAGA/MGB y RAID/DIPPER.
- El riesgo de alucinación no aplica como modelo generativo; el riesgo principal es falsos positivos, falsos negativos y rankings de fuente mal interpretados.
- Licencia de uso para investigación: debe revisarse el aviso antes de cualquier uso comercial o despliegue en producción.
- No usar para sanciones automáticas, decisiones disciplinarias o verificación de autoría sin revisión humana y evidencia adicional.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/ydh0822/english-ai-detector)
- [Repositorio y interfaz local](https://github.com/ydhhhh/english-ai-detector)
- [Model card completa](https://github.com/ydhhhh/english-ai-detector/blob/main/docs/model_card.md)
- [Fuentes de datos](https://github.com/ydhhhh/english-ai-detector/blob/main/docs/data_sources.md)
- [Entrenamiento](https://github.com/ydhhhh/english-ai-detector/blob/main/docs/training.md)
- [Aviso de licencia del modelo](https://huggingface.co/ydh0822/english-ai-detector/blob/main/LICENSE-MODEL.md)
- [answerdotai/ModernBERT-base](https://huggingface.co/answerdotai/ModernBERT-base)
- [sentence-transformers/all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2)
