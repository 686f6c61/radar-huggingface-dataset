# zbbwww23/uav-agent-glm4-32b

## Resumen

UAV Agent GLM-4-32B es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base zai-org/GLM-4-32B-0414, desarrollado por el usuario zbbwww23. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador de aproximadamente 122 MB que se carga sobre el modelo base de 32 000 millones de parámetros. Su propósito es especializar el GLM-4-32B en tareas de control de vuelo y validación de agentes multiagente para vehículos aéreos no tripulados (UAV), incluyendo function calling y razonamiento de varios pasos en un bucle cerrado de validación.

El adaptador fue seleccionado mediante validación formal en línea sobre una cohorte de 116 casos, frente a otros dos candidatos LoRA de la misma familia. En esa cohorte alcanza una tasa de éxito estricta en bucle cerrado de 0,9483, una precisión detallada de agente de 0,9895, una puntuación compuesta de 0,9771 y un F1 macro de diagnóstico de 0,9477. Estos datos proceden exclusivamente de la model card del autor y no han sido replicados de forma independiente.

La relevancia del proyecto radica en su enfoque vertical: aplicar un modelo de lenguaje grande de 32B a un dominio de ingeniería específico (control de UAV) mediante ajuste fino supervisado y evaluación cerrada, en lugar de un ajuste genérico de instrucciones. El repositorio incluye además un dataset público de entrenamiento y un benchmark de evaluación (Mixed120) que permiten reproducir parte del flujo de validación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (GLM-4-32B-0414); arquitectura del adaptador no detallada |
| Parametros totales | Modelo base: 32 000 millones (32B); adaptador: aproximadamente 122 MB de pesos |
| Parametros activos | No aplica (no es MoE; el modelo base es denso) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | QLoRA durante el entrenamiento (cuantizacion del base); opciones de inferencia no detalladas |
| Idiomas soportados | No disponible |
| Licencia | other (se mantienen la licencia y restricciones del modelo base GLM-4-32B-0414) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre zai-org/GLM-4-32B-0414, un transformer decoder-only denso de 32B parámetros. El ajuste se realiza mediante LoRA con cuantizacion QLoRA, lo que permite entrenar sobre el modelo base sin actualizar todos sus pesos. El checkpoint seleccionado es GLM-4-32B/checkpoint-5500, elegido entre tres candidatos LoRA de la misma familia evaluados sobre la misma cohorte de validación en línea.

El entrenamiento se apoya en un dataset SFT específico del dominio UAV (uav-agent-sft-public), con particiones públicas de entrenamiento, validación y prueba, y un benchmark separado (Mixed120) para tareas de evaluación tipo online. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron fases de RLHF o DPO. La innovación principal no es arquitectónica sino metodológica: la selección del checkpoint se basa en una validación formal en bucle cerrado con métricas de éxito estricto, precisión de agente, F1 de diagnóstico y soporte de explicación.

## Capacidades

- Generación de texto y razonamiento conversacional heredados del modelo base GLM-4-32B.
- Function calling y tool calling, orientados a la invocación de acciones de control de vuelo y diagnóstico.
- Razonamiento multiagente y multi-step en bucles cerrados de validación.
- Diagnóstico de fallos con explicaciones: la métrica de soporte de explicación alcanza 1,0000 en la cohorte de validación.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan capacidades de visión, audio ni modo thinking específico en el adaptador.

## Casos de uso

- Validación de agentes de control de vuelo: el adaptador permite probar en bucle cerrado decisiones de un agente UAV, comparando la acción elegida con la esperada y midiendo la tasa de éxito estricta (0,9483 en la cohorte del autor).
- Diagnóstico automatizado de fallos en misión: el modelo genera diagnósticos con F1 macro de 0,9477, útil para clasificar causas de fallo en pruebas de vuelo.
- Generación de explicaciones operativas: con soporte de explicación de 1,0000 en validación, puede justificar la decisión tomada ante un operador o en un registro de auditoría.
- Integración en pipelines de function calling: el adaptador está etiquetado para function-calling, por lo que puede conectarse a APIs de telemetría o de control para emitir llamadas estructuradas.
- Evaluación comparativa de políticas de agente: al existir tres candidatos LoRA y una cohorte fija, sirve para comparar variantes de ajuste sobre el mismo modelo base.
- Reproducción de experimentos de SFT: con el dataset público y el benchmark Mixed120, un equipo puede replicar el flujo de entrenamiento y evaluación en su propia infraestructura.
- Pruebas de regresión en CI para agentes UAV: el adaptador puede actuar como referencia de comportamiento esperado en pruebas automatizadas de nuevos prompts o versiones del sistema.

## Benchmarks y rendimiento

Resultados de validación en línea sobre 116 casos, según la model card del autor:

| Metrica | Valor |
|---|---:|
| Tasa de éxito estricta en bucle cerrado | 0,9483 |
| Precisión detallada de agente | 0,9895 |
| Puntuación compuesta detallada | 0,9771 |
| F1 macro de diagnóstico | 0,9477 |
| Precisión de soporte de explicación | 1,0000 |
| Casos evaluados | 116 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las cifras anteriores son específicas del dominio UAV y de la cohorte del autor; no son comparables directamente con benchmarks generales.

## Requisitos de hardware

- El adaptador en sí ocupa aproximadamente 122 MB (122 042 976 bytes), pero requiere cargar el modelo base GLM-4-32B-0414 completo.
- VRAM estimada para el base en precisión completa: no disponible con exactitud; un modelo denso de 32B requiere habitualmente varias GPU de 80 GB en FP16/BF16.
- VRAM estimada con cuantizacion de 4 bits: no disponible en la información proporcionada; dependerá de la implementación de cuantizacion elegida.
- GPU recomendadas: no especificadas por el autor; por tamaño del base, se orienta a A100/H100 de 80 GB o configuraciones multi-GPU.
- Compatibilidad con GPU de consumo: no confirmada; no se documenta en la model card.
- Opciones de despliegue: carga mediante transformers y peft (PeftModel.from_pretrained) según el ejemplo del autor; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UAV Agent GLM-4-32B (este) | 32B base + adaptador LoRA | No disponible | Agente UAV, function calling | other (base GLM-4-32B-0414) | Hugging Face, 0 descargas |
| GLM-4-32B-0414 (base) | 32B | No disponible | Modelo generalista | Licencia del base | Hugging Face |
| Otros adaptadores LoRA de la misma familia | 32B base + LoRA | No disponible | Variantes de ajuste UAV | Según base | No disponibles |

No se dispone de datos de rendimiento de modelos alternativos comparables en la información proporcionada, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Los resultados de validación (116 casos) proceden únicamente del autor y no han sido verificados de forma independiente; el tamaño de la cohorte es reducido.
- El repositorio registra 0 descargas y 0 likes, lo que indica ausencia de validación por parte de la comunidad.
- Es un adaptador, no un modelo autónomo: sin el base zai-org/GLM-4-32B-0414 no es funcional.
- La licencia es "other" y se mantienen las restricciones del modelo base; es necesario revisar la licencia de GLM-4-32B-0414 antes de cualquier uso comercial.
- No se documentan idiomas soportados ni sesgos conocidos del adaptador.
- Riesgo de alucinación inherente al modelo base, especialmente en explicaciones y diagnósticos fuera de la distribución del dataset UAV.
- No se especifican la longitud de contexto efectiva ni el comportamiento con prompts largos.
- El dataset público excluye rutas internas, respuestas privadas y campos de auditoría, por lo que la reproducibilidad completa del entrenamiento no está garantizada.
- Uso en producción de control de vuelo: no se documentan pruebas de seguridad funcional ni certificaciones; no debe emplearse en sistemas críticos sin validación adicional.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/zbbwww23/uav-agent-glm4-32b
- Modelo base: https://huggingface.co/zai-org/GLM-4-32B-0414
- Dataset SFT público: https://huggingface.co/datasets/zbbwww23/uav-agent-sft-public
- Benchmark Mixed120: https://huggingface.co/datasets/zbbwww23/uav-agent-mixed120-benchmark
- Registro de validación en línea: online-validation.json (incluido en el repositorio)
