# SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v3-laptop-lora

## Resumen

El repositorio `SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v3-laptop-lora` es un artefacto de investigación publicado por SZLHOLDINGS bajo una licencia Apache 2.0. Por su nombre, se trata de un adaptador LoRA orientado a tareas de agente sobre un modelo base de la familia Qwen de aproximadamente 0,8 mil millones de parámetros (la etiqueta "qwen35" sugiere Qwen 3.5), aparentemente entrenado en un entorno de tipo "laptop" y destinado a un agente de recibos (*receipt agent*). El repositorio se describe a sí mismo como un artefacto de registro privado del "estate" de SZLHOLDINGS, con etiquetas `research-artifact`, `experimental` y `private-estate`.

La model card actual, fechada el 14 de noviembre de 2026, es explícitamente una reescritura que retira las afirmaciones de la versión anterior (una "wave-4 uniform stamp" con tabla de entrenamiento QLoRA, model-index de batería de honestidad y badges de recibos) porque, según el autor, la doctrina *fail-closed* del estate no puede verificarlas por modelo. La card declara de forma literal que no se mide ni se reclama ningún resultado de evaluación, benchmark o batería, ni contrato de entrenamiento, hiperparámetros, dataset, preparación para producción, runtime o equivalencia de pesos.

En consecuencia, esta ficha solo puede describir lo que el repositorio declara de forma explícita: autoría, licencia, etiquetas y el hecho de ser un adaptador LoRA experimental sobre un supuesto Qwen de 0,8B. Cualquier dato técnico adicional (contexto, cuantizaciones, idiomas, benchmarks) no está disponible en la información proporcionada y se marca como tal. El tamaño del repositorio es de 0,0 GB, lo que es coherente con un adaptador LoRA de pequeño tamaño más que con pesos completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA; el nombre sugiere modelo base transformer de la familia Qwen 3.5) |
| Parametros totales | no disponible (el nombre indica ~0,8B en el modelo base; el adaptador LoRA añade un número no especificado de parámetros) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato de pesos safetensors; el adaptador se infiere como QLoRA/LoRA, sin tabla publicada) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,0 GB |
| Etiquetas | research-artifact, experimental, private-estate, region:us |
| Descargas / likes | 30 / 0 |
| Fecha de creacion / actualizacion | 2026-10-25 / 2026-11-15 |
| Revision observada en la card | 70f23e2f706c05ca08598a59d770f5f740ee1522 |

## Arquitectura y entrenamiento

No hay información verificable sobre la arquitectura interna del modelo base ni sobre la configuración del adaptador. El nombre del repositorio indica un adaptador LoRA (`-lora`) sobre un modelo Qwen de ~0,8B, y la card anterior (retirada) mencionaba una tabla de entrenamiento QLoRA, pero la card vigente elimina explícitamente cualquier contrato de entrenamiento, tabla de hiperparámetros o composición de dataset. No se declara número de tokens de entrenamiento, uso de RLHF/DPO, ni innovaciones técnicas como decodificación especulativa o atención lineal.

La única información técnica fiable es la relativa a la trazabilidad: la card documenta que la revisión observada antes de la reescritura fue `70f23e2f706c05ca08598a59d770f5f740ee1522`, que la visibilidad privada no cambió con la edición y que no se realizó ninguna medición nueva. El autor firma como Stephen Lutar. No se dispone de más detalles sobre el pipeline de entrenamiento.

## Capacidades

- No se declaran capacidades verificadas en la card vigente.
- Por el nombre del repositorio, se infiere un uso previsto como agente especializado en recibos (*receipt agent*), pero no se documenta su comportamiento.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el nombre sugiere orientación a agentes, sin evidencia publicada).
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- La card anterior mencionaba un "receipt visualization" con valores encadenados, pero la versión actual no reclama ninguna funcionalidad asociada.

## Casos de uso

Dado que la card no declara capacidades ni evaluación, los siguientes casos son escenarios hipotéticos derivados únicamente del nombre y las etiquetas del repositorio, no de evidencia publicada:

- Extracción de datos de recibos en un pipeline de agentes: el adaptador se integraría sobre el modelo base Qwen de ~0,8B para estructurar campos (comercio, fecha, importe, impuestos) a partir de texto OCR; adecuado por su tamaño reducido para ejecución en portátil, aunque sin métricas publicadas que lo respalden.
- Procesamiento local en estaciones de trabajo: al ser un LoRA de ~0,0 GB, podría cargarse junto al modelo base en hardware de consumo, útil para prototipos de agentes de contabilidad sin conexión.
- Experimentación académica sobre adaptadores de bajo rango: sirve como artefacto de investigación reproducible para estudiar el efecto de LoRA en tareas de extracción documental, dado su etiquetado `research-artifact`.
- Integración en flujos de validación contable: un agente podría clasificar recibos y marcar anomalías antes de su registro, siempre que se realice una evaluación propia previa, ya que no hay benchmarks.
- Base para fine-tuning adicional: el adaptador podría servir como punto de partida para ajustes específicos de dominio, con la advertencia de que no se documentan hiperparámetros ni dataset original.
- Despliegue en entornos de demostración interna: por su licencia Apache 2.0 y tamaño, es apto para pruebas de concepto en herramientas de gestión de gastos, sin garantías de calidad declaradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La card vigente declara explícitamente que no se reclama ningún resultado de evaluación, benchmark o batería para este artefacto, y que la versión anterior con un model-index de batería de honestidad fue retirada por no poder verificarse.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Como referencia orientativa no verificada, un modelo base de ~0,8B en cuantización de 4 bits requeriría del orden de 0,5-1 GB, más el adaptador LoRA y el contexto; sin embargo, no hay datos publicados para este artefacto.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; por el tamaño del modelo base se infiere que podría caber en GPUs de consumo, pero no está verificado.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparación rigurosa. El artefacto es un adaptador LoRA experimental, no un modelo base completo, y no se especifican sus dimensiones ni su modelo base exacto.

## Limitaciones y advertencias

- La card vigente retira todas las afirmaciones de evaluación, entrenamiento y preparación para producción; no hay evidencia verificable de calidad.
- Riesgo de alucinación: no evaluado ni documentado.
- Sesgos conocidos: no documentados.
- Limitaciones de contexto o idioma: no disponibles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni cualificación de release.
- El repositorio se describe como artefacto de registro privado del "estate" de SZLHOLDINGS; su visibilidad privada no cambió con la reescritura, lo que puede afectar a la reproducibilidad externa.
- El tamaño del repositorio (0,0 GB) y las 30 descargas sugieren un artefacto de nicho sin adopción significativa; no debe usarse en producción sin una evaluación independiente.
- La card anterior contenía afirmaciones (tabla QLoRA, badges de recibos) que el propio autor considera no verificables, lo que exige cautela ante cualquier dato histórico.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v3-laptop-lora
- Revisión citada en la card: `70f23e2f706c05ca08598a59d770f5f740ee1522`
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos.
