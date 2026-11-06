# sumera09/evidencebridge-model5-claim-anomaly

## Resumen

EvidenceBridge Model 5 (identificado en el repositorio como `sumera09/evidencebridge-model5-claim-anomaly`) es un prototipo de investigación para la detección de anomalías a nivel de reclamación (claim) en el ámbito sanitario. Lo desarrolla el usuario `sumera09` y se distribuye como un paquete de scikit-learn con artefactos serializados en joblib, no como un modelo de lenguaje. Su propósito es servir de base para experimentos de cribado de anomalías y para el desarrollo de flujos de trabajo de revisión humana, no para la toma de decisiones automatizadas.

El modelo se entrena sobre una muestra sintética de reclamaciones hospitalarias (CMS DE-SynPUF, muestra 1 de pacientes ingresados). Incluye dos variantes: V3 Strict Temporal, congelada como referencia principal, y V4-A, una alternativa experimental que no sustituye a V3. El paquete incorpora tanto los artefactos ajustados como el código fuente para preparación de características, inferencia y flujo de auditoría.

Su relevancia es acotada y de carácter metodológico: ilustra un pipeline reproducible de detección de anomalías con trazabilidad cronológica y énfasis en explicabilidad. No es un modelo generativo, no procesa lenguaje natural y no dispone de validación externa con datos reales ni de etiquetas verificadas de fraude.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (artefactos de scikit-learn serializados con joblib; el tipo concreto de estimador no se especifica en la información) |
| Parámetros totales | no disponible (no es una red neuronal; el número de parámetros no aplica como métrica estándar) |
| Parámetros activos | no aplica |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible (no aplica; modelos clásicos de scikit-learn no se cuantizan) |
| Idiomas soportados | no disponible (no procesa texto libre) |
| Licencia | MIT |
| Formato de pesos | joblib (artefactos `.joblib` dentro de `models/`) |

## Arquitectura y entrenamiento

No se detalla en la información disponible la familia concreta de estimador de scikit-learn empleada (por ejemplo, Isolation Forest, One-Class SVM, Local Outlier Factor o un ensemble). El paquete se organiza en cuatro componentes: `models/` con los artefactos ajustados de V3 y V4-A, `src/` con la preparación de características, la inferencia y el flujo de auditoría, `metadata/` con metadatos del modelo y del flujo de trabajo, y `requirements.txt` con las dependencias de Python.

El entrenamiento se realizó sobre la muestra 1 de reclamaciones hospitalarias sintéticas del CMS DE-SynPUF. La variante V3 incorpora una restricción temporal estricta ("Strict Temporal"), lo que sugiere una partición cronológica entre entrenamiento y prueba para evitar fuga de información. El flujo independiente reproduce las predicciones y puntuaciones del lote de prueba cronológico validado para ambos modelos. No se especifican hiperparámetros, número de muestras, composición exacta de características ni si hubo ajuste fino o selección de umbrales.

## Capacidades

- Cribado de anomalías a nivel de reclamación individual sobre datos tabulares de reclamaciones sanitarias.
- Generación de puntuaciones de anomalía (no probabilidades de fraude) para priorizar revisiones.
- Indicadores descriptivos de volumen de proveedor relativos al lote, útiles como señal auxiliar.
- Flujo de auditoría integrado para revisión humana documentada.
- Reproducibilidad del pipeline: el flujo independiente replica las predicciones y puntuaciones del lote de prueba cronológico.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no aplica.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación académica en detección de anomalías: el modelo sirve como línea base reproducible sobre un dataset público sintético (CMS DE-SynPUF) para comparar métodos de cribado con partición temporal estricta.
- Desarrollo de flujos de revisión humana: el componente `src/` incluye el flujo de auditoría, de modo que un equipo puede integrar las puntuaciones en una cola de revisión donde un auditor valide cada caso con documentación de soporte.
- Prototipado de pipelines de características para reclamaciones: el código de preparación de características sirve de plantilla para construir y evaluar transformaciones sobre datos tabulares de claims antes de migrar a datos reales.
- Evaluación de explicabilidad en modelos tabulares: los tags incluyen `explainable-ai`, y el diseño orientado a auditoría permite estudiar cómo presentar señales de anomalía a revisores no técnicos.
- Pruebas de integración y CI en proyectos de salud: al ser un paquete Python con `requirements.txt` y artefactos joblib, se puede incorporar en tests de regresión que verifiquen que las puntuaciones del lote de prueba se mantienen estables.
- Formación y docencia: el caso ilustra de forma compacta las trampas de usar datos sintéticos y la diferencia entre puntuación de anomalía y probabilidad de fraude, con limitaciones documentadas de forma explícita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo indica que el flujo independiente reprodujo las predicciones y puntuaciones del lote de prueba cronológico validado, sin cifras de precisión, recall, AUC ni F1.

## Requisitos de hardware

- VRAM: no aplica; la inferencia se ejecuta en CPU con scikit-learn.
- GPU recomendadas: no aplica; no se requiere GPU.
- Cabe en cualquier equipo de consumo: el tamaño del repositorio es de 0,0 GB, por lo que los artefactos son ligeros.
- Despliegue: ejecución directa en Python con las dependencias de `requirements.txt`; no se contemplan vLLM, llama.cpp, Ollama ni TGI, que son para modelos de lenguaje.
- Latencia y throughput: no disponibles; dependen del estimador concreto y del volumen de reclamaciones por lote.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (cribado de anomalías en reclamaciones sanitarias sobre DE-SynPUF) con los que establecer una comparación de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- El dataset es sintético (CMS DE-SynPUF); los patrones aprendidos no reflejan necesariamente la distribución de reclamaciones reales.
- No había etiquetas verificadas de fraude, por lo que el modelo no puede validarse como detector de fraude.
- No se ha completado validación externa con datos del mundo real.
- Las puntuaciones de anomalía no son probabilidades de fraude y no deben interpretarse como tales.
- Se requiere revisión humana y documentación de soporte en cualquier uso derivado.
- El modelo experimental V4-A no sustituye a V3, que es la referencia congelada.
- Los indicadores de volumen de proveedor relativos al lote son solo descriptivos.
- Uso previsto limitado a investigación y experimentación; no validado para decisiones de pago ni determinaciones de fraude.
- Licencia MIT: permite uso comercial y modificación, pero la licencia no subsana las limitaciones metodológicas ni la falta de validación clínica.
- No se documentan sesgos específicos, pero al tratarse de datos sintéticos de reclamaciones estadounidenses cualquier sesgo del generador podría propagarse.
- Riesgo de alucinación: no aplica en el sentido de modelos generativos; el riesgo equivalente es la sobreinterpretación de puntuaciones por parte de revisores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sumera09/evidencebridge-model5-claim-anomaly
- Dataset CMS DE-SynPUF (referencia del autor, sin enlace directo en la información): no disponible
- Paper, blog o repositorio adicional: no disponible
