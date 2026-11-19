# SZLHOLDINGS/salad-axiom-invariants-r2

## Resumen

salad-axiom-invariants-r2 es un artefacto de entrenamiento candidato publicado por SZLHOLDINGS bajo su programa de formación de IA gobernada. Según la model card, no se trata de un modelo de producción publicado, sino de un checkpoint intermedio con fines de trazabilidad y auditoría. El repositorio contiene una escalera de checkpoints (50, 100, 150 y 200 pasos) junto con un directorio final, sumando 51 archivos y un tamaño total de 0,7 GB.

El modelo se distribuye con licencia Apache 2.0, etiqueta de pipeline text-generation y solo declara inglés como idioma soportado. La model card no proporciona detalles sobre arquitectura, número de parámetros, longitud de contexto ni composición del dataset de entrenamiento; se limita a describir la procedencia y la doctrina de "recibos medidos" (fail-closed measured-receipts) bajo la que se generó el artefacto.

Su relevancia es limitada para uso práctico: al ser un artefacto candidato sin benchmarks publicados ni especificaciones técnicas declaradas, su interés principal es documental y de auditoría dentro del ecosistema del autor, no como modelo desplegable en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura del modelo. La model card únicamente indica que se trata de un artefacto de entrenamiento candidato producido bajo la doctrina "fail-closed measured-receipts", que enfatiza la honestidad en los recibos (sin recuentos ni marcas de tiempo fabricados). El repositorio incluye una escalera de checkpoints en los pasos 50, 100, 150 y 200, más un directorio final, lo que sugiere un proceso de entrenamiento por etapas con puntos de control intermedios conservados para auditoría.

No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO u otras técnicas de alineación. Tampoco se describen innovaciones técnicas destacables. La procedencia completa se remite a los recibos de la organización SZLHOLDINGS en Hugging Face y al libro de registro (estate ledger) del autor.

## Capacidades

- Generación de texto: el pipeline declarado es text-generation, por lo que el artefacto está orientado a la generación de texto en inglés.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma declarada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Al ser un artefacto candidato de entrenamiento, no se garantiza que las capacidades estén consolidadas ni evaluadas.

## Casos de uso

- Auditoría de procedencia y trazabilidad: el repositorio permite inspeccionar la escalera de checkpoints (50/100/150/200) y verificar la cadena de custodia documentada en el estate ledger del autor, útil para equipos de compliance que necesiten validar el proceso de entrenamiento.
- Investigación sobre doctrinas de entrenamiento gobernado: sirve como material de estudio para quienes analicen prácticas de "measured receipts" y registro honesto de artefactos en pipelines de IA.
- Reproducción de experimentos internos: los checkpoints intermedios permiten comparar la evolución del modelo a lo largo de los pasos de entrenamiento en entornos controlados del propio autor.
- Evaluación de licencias y distribución: al estar publicado con Apache 2.0, puede usarse como referencia para estudiar cómo se documentan y distribuyen artefactos candidatos en Hugging Face.
- Pruebas de integración con transformers: al declarar library_name transformers y formato safetensors, puede cargarse en pipelines de prueba para validar compatibilidad de infraestructura, sin expectativas de calidad de producción.
- Docencia sobre ciclo de vida de modelos: útil como ejemplo de artefacto intermedio frente a modelo final, para ilustrar la diferencia entre checkpoint candidato y release de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,7 GB, lo que sugiere que el modelo podría caber en GPUs de consumo, pero no se confirma el número de parámetros ni la precisión de los pesos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probablemente sí dado el tamaño del repositorio, pero no confirmado por el autor.
- Opciones de despliegue: al usar transformers y safetensors, es compatible con el ecosistema Hugging Face (transformers, TGI, vLLM), aunque no se documentan configuraciones validadas.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica modelos comparables de la misma categoría ni ofrece datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Artefacto candidato, no modelo de producción: la propia model card lo califica como "candidate training artifact", por lo que no debe usarse en entornos productivos sin validación adicional.
- Ausencia de especificaciones técnicas: no se declaran arquitectura, parámetros, contexto ni datos de entrenamiento, lo que impide evaluar su idoneidad técnica.
- Sin benchmarks publicados: no hay evidencia de rendimiento en tareas estándar (MMLU, HumanEval, GSM8K, etc.).
- Idioma limitado al inglés: no se declara soporte multilingüe.
- Riesgo de alucinación y sesgos: no evaluado ni documentado por el autor.
- Licencia Apache 2.0: permite uso comercial, pero al no haber validación técnica ni benchmarks, el riesgo de uso en producción recae íntegramente en el adoptante.
- Procedencia remitida a sistemas externos: la cadena de custodia completa vive en el estate ledger del autor, no en el repositorio, lo que limita la verificación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-axiom-invariants-r2
- DOI Zenodo (registro de tesis del estate): https://doi.org/10.5281/zenodo.19944926
- Organización SZLHOLDINGS en Hugging Face: https://huggingface.co/SZLHOLDINGS
