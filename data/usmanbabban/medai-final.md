# Usmanbabban/MedAI-Final

## Resumen

MedAI-Final es un modelo de lenguaje de instrucciones desarrollado por Usmanbabban (Ali) mediante fine-tuning de Qwen/Qwen2.5-7B-Instruct. El entrenamiento se realizó con la librería TRL utilizando Supervised Fine-Tuning (SFT), según se indica en la model card. A pesar de su nombre, no se ha publicado información sobre el conjunto de datos de entrenamiento, el dominio específico ni los resultados de evaluación. El modelo se publica en Hugging Face con formato safetensors, pero el repositorio muestra un tamaño de 0.0 GB, lo que sugiere que los pesos podrían no estar disponibles o que existe un error en los metadatos. Su relevancia radica en ser un modelo de instrucciones presumiblemente orientado al ámbito médico, aunque sin datos que respalden su rendimiento o fiabilidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Qwen2.5-7B-Instruct) |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de Qwen/Qwen2.5-7B-Instruct, que es un transformer decoder-only. El entrenamiento se llevó a cabo con SFT utilizando TRL 1.12.0, Transformers 5.0.0 y PyTorch 2.10.0+cu128, según las versiones indicadas en la model card. No se especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación adicionales como RLHF o DPO. El repositorio de GitHub Akash-Thakur44/MedAI_final podría contener detalles del proceso, pero no se ha podido verificar su contenido a partir de la información disponible.

## Capacidades

- Generación de texto en formato instruct, tal como se muestra en el ejemplo de uso con `pipeline` en la model card.
- No se han documentado capacidades específicas como tool calling, agentes, visión, audio o razonamiento multi-step en la información proporcionada.
- El modelo base Qwen2.5-7B-Instruct soporta múltiples idiomas y razonamiento, pero no se puede confirmar si el fine-tuning conserva estas capacidades.
- No se ha publicado información sobre la calidad de las respuestas, su coherencia o su capacidad para seguir instrucciones complejas.

## Casos de uso

No hay casos de uso documentados en la información disponible. A continuación se enumeran posibles usos hipotéticos, que requieren validación experimental antes de considerar su despliegue:

- Asistencia en consulta médica: el modelo podría generar respuestas a preguntas de pacientes basándose en conocimiento general, pero sin garantía de precisión clínica.
- Resumen de historiales clínicos: podría utilizarse para resumir documentación médica, aunque no hay datos de evaluación que avalen su rendimiento en este dominio.
- Generación de informes de laboratorio: podría producir plantillas de texto a partir de datos estructurados, requiriendo integración con sistemas de gestión hospitalaria y supervisión humana.
- Educación médica: podría explicar conceptos a estudiantes, con riesgo de alucinaciones y falta de referencias verificables.
- Búsqueda de información biomédica: podría extraer respuestas de documentos, pero no se ha evaluado su precisión ni su capacidad para manejar fuentes largas.
- Chatbot de triaje: podría mantener conversaciones de apoyo, aunque no debe usarse sin supervisión profesional debido a la ausencia de validación clínica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

No se han publicado requisitos específicos para MedAI-Final. Al ser un fine-tuning de un modelo de 7B, se esperan requisitos similares al modelo base Qwen2.5-7B-Instruct:

- VRAM estimada para inferencia: aproximadamente 14-16 GB en FP16 y 4-6 GB en cuantización de 4 bits (estimación orientativa basada en el modelo base).
- GPU recomendadas: RTX 4090, A100 40GB, H100.
- Es posible ejecutarlo en GPUs de consumo si se aplica cuantización, aunque no se ha verificado.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa detallada. El único modelo de referencia conocido es Qwen/Qwen2.5-7B-Instruct, del que deriva. No hay datos de benchmarks, licencia ni idiomas que permitan comparar con alternativas como BioMistral-7B o Meditron-7B.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MedAI-Final | no disponible | no disponible | no disponible | Hugging Face (pesos no verificados) |
| Qwen2.5-7B-Instruct | no disponible | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- No se han publicado datos de evaluación ni benchmarks, por lo que se desconoce la calidad y los posibles sesgos del modelo.
- Riesgo de alucinación: sin evaluación, no se puede garantizar la fiabilidad en contextos médicos o de alto riesgo.
- Licencia no especificada: el uso comercial es incierto y requiere verificación con el autor.
- El repositorio muestra un tamaño de 0.0 GB, lo que podría indicar que los pesos no están subidos o que hay un error en la publicación.
- La fecha de creación en los metadatos (2026-09-05) es futura, lo que sugiere un posible error en la configuración del repositorio.
- El modelo está basado en Qwen2.5-7B-Instruct, que tiene sus propias limitaciones, pero no se puede confirmar si el fine-tuning las hereda o las modifica.
- No se recomienda su uso en producción sin una evaluación exhaustiva y una revisión de la licencia.

## Enlaces

- Hugging Face: https://huggingface.co/Usmanbabban/MedAI-Final
- GitHub: https://github.com/Akash-Thakur44/MedAI_final
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- TRL: https://github.com/huggingface/trl
