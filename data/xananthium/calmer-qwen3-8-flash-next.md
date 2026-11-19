# Xananthium/Calmer-Qwen3.8-Flash-Next

## Resumen

Calmer-Qwen3.8-Flash-Next es un derivado experimental del modelo Qwen3.8-Flash-Next, publicado por el usuario Xananthium en Hugging Face. No se trata de un modelo entrenado desde cero ni de un fine-tuning convencional, sino de una edición directa de pesos (weight editing) sobre la cuantización Gyro-M de AgentionAI. Concretamente, se modifican dos matrices de proyección descendente de expertos compartidos (`ffn_down_shexp`) en las capas 44 y 45, aplicando una resta de rango uno basada en el vector singular dominante de la capa 45.

El objetivo declarado del autor es reducir la verbosidad y las repeticiones en la cadena de razonamiento del modelo, manteniendo la corrección de las respuestas finales. En una comparación de cuatro preguntas ejecutada en dos RTX 3090, el modelo editado generó un 35,3 % menos de tokens que el original, con las cuatro respuestas finales correctas. Se trata de resultados exploratorios sobre preguntas reutilizadas, no de puntuaciones de benchmark completas.

El modelo tiene 176.943.899.520 parámetros totales según los safetensors del repo, un tamaño de repositorio de 92 GB y se distribuye como un GGUF de precisión mixta personalizado. Está etiquetado como experimental, solo soporta inglés y requiere un motor de inferencia que implemente los tipos de tensor Gyro personalizados y la arquitectura `qwen4exp`; el soporte GGUF estándar no garantiza compatibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen3.8-Flash-Next (arquitectura `qwen4exp`), con expertos compartidos (`ffn_down_shexp`) |
| Parametros totales | 176.943.899.520 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens en la configuración de producción medida (contexto del modelo base: no disponible) |
| Tipos de cuantizacion | GGUF de precisión mixta personalizado (etiqueta `TQ2_0` de la clase Gyro-M); las dos matrices editadas permanecen en Q8_0; KV cache en Q4_0 en la configuración medida |
| Idiomas soportados | en (inglés) |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | GGUF (`Calmer-Qwen3.8-Flash-Next-Gyro-M-TQ2_0.gguf`, 91.965.774.272 bytes) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.8-Flash-Next de Qwen, un transformer con mecanismo de expertos (MoE) y expertos compartidos, según se deduce de los tensores editados (`blk.44.ffn_down_shexp.weight` y `blk.45.ffn_down_shexp.weight`, de forma 2560 × 640 y codificados en Q8_0). No se ha realizado entrenamiento adicional: la modificación consiste en dos ediciones fijas de pesos aplicadas sobre la cuantización Gyro-M de AgentionAI.

La edición se define matemáticamente a partir de `d45`, el vector singular izquierdo dominante de la matriz original decodificada de proyección descendente del experto compartido de la capa 45. Se aplican las siguientes transformaciones con fuerza 1.0 en ambas:

```text
W45_new = W45 - outer(d45, d45.T @ W45)
W44_new = W44 - outer(d45, d45.T @ W44)
```

La capa 44 utiliza la dirección de la capa 45, no su propio vector singular dominante. Las matrices se decodifican, editan y vuelven a codificar en su representación Q8_0 original; el resto del modelo no se convierte a ocho bits. El redondeo de cuantización deja un residuo pequeño en la dirección eliminada. No hay edición dependiente del prompt, búsqueda de respuestas ni controlador de parada aprendido. La dirección proviene de una SVD estática de los pesos, no de un detector de hesitación ajustado, y los resultados de desarrollo influyeron en la selección de candidatos.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de razonamiento configurable (la evaluación usó razonamiento medio).
- Razonamiento matemático y aritmético: la comparación incluyó dos preguntas HLE difíciles y dos controles aritméticos de GSM8K.
- Corrección de herramientas y continuaciones en entornos simulados: ocho sondas cortas de continuación/corrección de herramientas pasaron de 7/8 a 8/8 con el grader automático guardado (por ejemplo, emisión de `git -C /app/project diff` tras retroalimentación explícita de directorio incorrecto).
- Especulación MTP (multi-token prediction) con cuatro tokens en la configuración de producción medida.
- Soporte de múltiples ranuras paralelas (cuatro slots en la configuración medida).
- Idiomas: únicamente inglés según la model card.
- No se documentan capacidades de visión, audio ni tool calling nativo más allá de las sondas de corrección de herramientas descritas.

## Casos de uso

- Razonamiento matemático con presupuesto de tokens ajustado: el modelo editado redujo un 47,7 % los tokens generados en la pregunta de matemáticas manteniendo la respuesta correcta, lo que lo hace adecuado para pipelines donde el coste por respuesta es crítico.
- Agentes de línea de comandos y corrección de herramientas: las sondas de continuación mostraron mejoras al corregir comandos tras retroalimentación explícita, útil en asistentes de terminal que deben reaccionar a errores del entorno simulado.
- Investigación en edición de pesos: el repositorio incluye manifiesto de release, parches con los tensores originales y editados, y resumen de evaluación, lo que permite reproducir y auditar la intervención sobre los pesos.
- Despliegue en dos GPU de 24 GB: la configuración medida dividió el modelo en la capa 24 sobre dos RTX 3090 con contexto de 262.144 tokens y KV en Q4_0, un escenario realista para laboratorios con hardware de consumo alto.
- Comparación controlada de variantes de edición: el archivo incluye variantes 45-only, 45+46, 44+45, 44+45+46, capa-2 + 44+45 y capa-2/capa-46 parciales, útiles para estudiar el efecto de cada edición de forma aislada.
- Servicio de inferencia con múltiples ranuras: los cuatro slots paralelos de la configuración medida permiten atender varias conversaciones simultáneas en un solo despliegue.
- Estudio de repetición y verbosidad en cadenas de razonamiento: la caída de ocurrencias de «wait» de 115 a 54 en las cuatro salidas sirve como material descriptivo para investigar patrones de hesitación, aunque el autor advierte que no es una medida independiente de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K) en la información disponible. El autor presenta una comparación de panel emparejado con dos preguntas HLE difíciles y dos controles aritméticos de GSM8K, semilla `20261118`, razonamiento medio, temperatura 1.3 y vector de control de runtime separado activado en ambos brazos:

| Caso | Pesos sin editar (tokens) | Calmer 44+45 (tokens) |
|---|---:|---:|
| Economía | 21.315 | 19.756 |
| Matemáticas | 53.084 | 27.789 |
| Aritmética hotel | 581 | 657 |
| Aritmética bolígrafos | 555 | 639 |
| **Total** | **75.535** | **48.841 (−35,3 %)** |
| Respuestas finales correctas | 4/4 | 4/4 |
| Finalizaciones naturales | 4/4 | 4/4 |

La respuesta de matemáticas usó un 47,7 % menos de tokens y la de economía un 7,3 % menos; los dos controles aritméticos juntos usaron un 14,1 % más, por lo que el acortamiento no es universal. Las ocurrencias brutas de «wait» cayeron de 115 a 54 en las cuatro salidas. Ocho sondas cortas de continuación/corrección de herramientas pasaron de 7/8 a 8/8. Dos ejecuciones largas de matemáticas se interrumpieron manualmente por encima de 70.000 tokens observados y quedan marcadas como incompletas. Los estudios previos de 8.192 y 32.768 tokens usaron ajustes de finalización forzada distintos y se reportan por separado.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF completo ocupa 91.965.774.272 bytes (unos 92 GB); la configuración medida lo reparte entre dos GPU.
- GPU recomendadas: dos RTX 3090 (24 GB cada una) con reparto en la capa 24, según la configuración de producción registrada.
- ¿Cabe en GPU de consumo? Sí, en el escenario medido de dos RTX 3090; no se documenta un despliegue en una sola GPU de consumo.
- Motor de inferencia: se requiere un motor que soporte los tipos de tensor Gyro personalizados y la arquitectura `qwen4exp`. El motor medido se identificó como Strata 0.1.59.1 (versión del motor, no de la aplicación de escritorio). El soporte GGUF estándar no garantiza compatibilidad.
- Configuración medida: contexto de 262.144 tokens, KV en Q4_0, dos GPU con reparto en la capa 24, cuatro ranuras paralelas, especulación MTP de cuatro tokens y el paquete de expertos existente. El vector de control Huihui se proyectó por capa sobre las capas 4–44 a escala 1.0.
- Latencia y throughput: no disponibles; no se publican medidas de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Calmer-Qwen3.8-Flash-Next | 176.943.899.520 | 262.144 (config. medida) | Edición de pesos sobre Gyro-M | qwen-community-1.0 | GGUF en HF |
| Qwen3.8-Flash-Next (Qwen) | no disponible | no disponible | Modelo base original | qwen-community-1.0 (según derivado) | HF |
| Qwen3.8-Flash-Next-Gyro-GGUF (AgentionAI) | no disponible | no disponible | Cuantización Gyro-M del base | no disponible | HF |
| Calmer-V2-Qwen3.8-27B-4bit (Xananthium) | no disponible | no disponible | Derivado Calmer anterior, 4 bits | no disponible | HF |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Resultados exploratorios: la comparación usa preguntas reutilizadas y no constituye una evaluación de benchmark completa ni una evaluación sin direccionamiento de runtime.
- El vector de control de runtime no está incorporado en los pesos publicados; los resultados dependen de un activo separado (Huihui) y de su proyección por capa.
- El acortamiento no es universal: los controles aritméticos usaron un 14,1 % más de tokens.
- No se establece que una dirección singular grande sea una característica general de repetición; los resultados de desarrollo influyeron en la selección de candidatos.
- Las sondas de herramientas fueron historias simuladas: no se ejecutaron comandos de shell generados.
- Dos ejecuciones largas de matemáticas quedaron incompletas tras superar los 70.000 tokens observados.
- Solo inglés; sin soporte multilingüe documentado.
- Licencia Qwen Community License 1.0: revisar las restricciones de uso comercial antes de desplegar en producción.
- Compatibilidad limitada: requiere motores con soporte de tipos Gyro y arquitectura `qwen4exp`; el soporte GGUF estándar no es suficiente.
- Riesgo de alucinación y sesgos: no documentados específicamente en la información disponible; aplican los del modelo base.
- El redondeo de cuantización deja un residuo pequeño en la dirección eliminada, por lo que la edición no es exacta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xananthium/Calmer-Qwen3.8-Flash-Next
- Archivo de investigación y experimentos: https://github.com/Xananthium/Calmer-Qwen3.8-Flash-Next
- Investigación previa Calmer Qwen: https://github.com/Xananthium/Qwen3.8-Weight-Space-Programming
- Calmer V2 27B: https://huggingface.co/Xananthium/Calmer-V2-Qwen3.8-27B-4bit
- Cuantización de origen Gyro-M (AgentionAI): https://huggingface.co/agentionai/Qwen3.8-Flash-Next-Gyro-GGUF
- Instrucciones de runtime del modelo base: https://huggingface.co/agentionai/Qwen3.8-Flash-Next-Gyro-GGUF#usage
- Modelo base original Qwen3.8-Flash-Next: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Vector de control Huihui (alesha-pro): https://huggingface.co/alesha-pro/Qwen3.8-Flash-Next-abliterated-GSQ-RCO-Strata-GGUF/blob/main/Huihui-Qwen3.8-Flash-Next-refusal-direction-r.gguf
