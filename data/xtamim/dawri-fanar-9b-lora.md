# xTamim/dawri-fanar-9b-lora

## Resumen

`dawri-fanar-9b-lora` es un adaptador LoRA desarrollado por el usuario xTamim sobre el modelo base `QCRI/Fanar-1-9B-Instruct`, un modelo de 9 mil millones de parámetros de QCRI (Qatar Computing Research Institute). El adaptador se ha entrenado para imitar el comportamiento de un recepcionista conversacional de una aplicación sanitaria llamada Dawri, cuyo objetivo es recoger datos de admisión (intake) mediante preguntas cortas y devolver JSON estructurado al alcanzar un límite de seis preguntas. Se publicó en el contexto del hackathon QAI HF Hackathon 2026.

El adaptador no modifica la arquitectura del modelo base: es un ajuste PEFT de bajo rango (LoRA r=16, alpha=32) aplicado sobre las proyecciones q/k/v/o del transformer, con un tamaño de repositorio de 2,0 GB en formato safetensors. El modelo base Fanar-1-9B-Instruct está orientado a inglés y árabe, y el adaptador conserva ese perfil bilingüe.

La relevancia de esta ficha es doble: por un lado, documenta un caso de ajuste fino muy específico sobre datos sintéticos para una tarea de diálogo estructurado; por otro, recoge una advertencia explícita del autor sobre la pérdida de capacidad de escalado de emergencias, lo que lo convierte en un ejemplo útil de por qué los adaptadores de dominio deben evaluarse contra el modelo base antes de desplegarse.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer `QCRI/Fanar-1-9B-Instruct` |
| Parámetros totales | no disponible (el adaptador LoRA no declara recuento; el modelo base es de 9B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el adaptador se distribuye en safetensors; no se documentan cuantizaciones del adaptador ni del base) |
| Idiomas soportados | inglés (en), árabe (ar) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32 aplicado sobre las proyecciones de query, key, value y output del modelo base Fanar-1-9B-Instruct. El entrenamiento se realizó durante 1,5 épocas, 324 pasos y 1726 líneas de datos, en una GPU NVIDIA A10G. Los prompts utilizan la plantilla de chat propia del modelo base aplicada sobre los mensajes exactos de la aplicación Dawri. Un detalle técnico relevante es que la plantilla del modelo base incluye una rama de sistema pero no un marcador de turno de sistema, y que la generación debe detenerse en el token `<end_of_turn>` (id 107), que no aparece listado en el `generation_config.json` del modelo base.

Los datos de entrenamiento son exclusivamente sintéticos y provienen de un generador propio; el conjunto de datos y las salidas crudas se encuentran en el repositorio privado `xTamim/dawri-intake-synth`. No se documenta el volumen total de tokens ni la composición detallada del dataset, ni si hubo fases de RLHF o DPO. La innovación principal no es arquitectónica sino de dominio: el adaptador aprende a imitar el guion de un recepcionista sanitario, produciendo preguntas cortas que pasan el filtro de la aplicación y JSON de admisión válido, con un estilo muy repetitivo (100 turnos de pregunta evaluados generaron solo 14 preguntas distintas).

## Capacidades

- Generación de texto conversacional bilingüe (inglés y árabe) orientada a diálogos de admisión sanitaria.
- Formulación de preguntas cortas de seguimiento que pasan el filtro (gate) de la aplicación Dawri.
- Producción de JSON de admisión estructurado (`intake`) al alcanzar el límite de seis preguntas.
- Imitación del guion de recepcionista de la aplicación, con alta consistencia en el formato de respuesta.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada a inglés y árabe; el dialecto del Golfo se etiqueta con frecuencia como árabe estándar moderno (MSA).

## Casos de uso

- Prototipado de recepción conversacional sanitaria: el adaptador sirve para demostrar un flujo de admisión guiado por preguntas en una demo de hackathon, siempre que se marque claramente como no clínico y se mantenga el modelo base como referencia de seguridad.
- Evaluación de pipelines de diálogo estructurado: permite probar el código de turnos de una aplicación (gate, límite de preguntas, validación de JSON) contra un modelo ajustado, midiendo tasas de paso y validez de intake.
- Generación de datos sintéticos de admisión: puede usarse para producir conversaciones de ejemplo con formato de intake, útiles para pruebas de integración y para entrenar clasificadores auxiliares.
- Investigación sobre pérdida de capacidades de seguridad tras ajuste fino: el caso documenta cómo un LoRA de dominio puede eliminar el escalado de emergencias del modelo base, lo que lo convierte en un banco de pruebas para técnicas de mitigación (por ejemplo, reglas previas, clasificadores de riesgo o mezcla de datos de seguridad).
- Demostraciones bilingües inglés-árabe: útil para mostrar flujos de admisión en ambos idiomas en entornos de investigación, con la salvedad de que las cifras provienen de datos sintéticos del mismo generador que el entrenamiento.
- Pruebas de robustez de plantillas de chat: el adaptador depende de la plantilla del modelo base y del token de parada `<end_of_turn>` (id 107), por lo que sirve para validar la configuración de generación en pipelines propios.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre conversaciones sintéticas reservadas (held-out), evaluadas reproduciendo las salidas crudas a través del código real de turnos de la aplicación, con temperatura 0,2 y 700 tokens máximos. Modelo base y adaptador se ejecutaron en un mismo trabajo de GPU.

| Métrica | Base | Adaptado |
|---|---|---|
| Paso del gate, inglés | 1/50 | 50/50 |
| Paso del gate, árabe | 0/50 | 50/50 |
| Intake válido, inglés | 4/27 | 25/27 |
| Intake válido, árabe | 2/36 | 31/36 |
| Siguiente tema correcto (de 100 preguntas) | 0 | 89 |
| Escalado de emergencia (13 sondas) | 9/13 | 0/13 |

## Requisitos de hardware

- El adaptador LoRA ocupa 2,0 GB en el repositorio; la VRAM real depende del modelo base Fanar-1-9B-Instruct, que no se documenta en la información disponible.
- El entrenamiento se realizó en una GPU NVIDIA A10G, lo que indica que el ajuste fino cabe en GPUs de 24 GB.
- Para inferencia con el modelo base en precisión completa se necesitaría hardware de clase A100/H100; con cuantización de 8 o 4 bits podría caber en GPUs de consumo como RTX 4090 o RTX 3090, aunque no se aportan cifras concretas en la información disponible.
- Opciones de despliegue: al ser un adaptador PEFT, se carga junto al modelo base mediante la librería `peft`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| `xTamim/dawri-fanar-9b-lora` | LoRA sobre base de 9B | no disponible | Apache-2.0 | Adaptador de dominio para admisión sanitaria bilingüe |
| `QCRI/Fanar-1-9B-Instruct` (base) | 9B | no disponible | Apache-2.0 | Modelo instructivo bilingüe en/ar |
| Otros adaptadores LoRA de dominio sobre modelos de 7-9B | variable | variable | variable | Ajuste específico de tarea; no se dispone de comparaciones publicadas en la información proporcionada |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El adaptador elimina el escalado de emergencias: en 13 formulaciones de emergencia no listadas que superan las reglas de la aplicación, el modelo base escaló 9 de 13 y el adaptador 0 de 13. Llegó a responder "¿Desde cuándo?" a un paciente que describía una sobredosis.
- No debe usarse para conversación en vivo con pacientes ni para uso clínico; el propio autor lo etiqueta como `not-for-clinical-use`.
- Entrenado solo con datos sintéticos y sin revisión clínica.
- En el límite de seis preguntas, formuló otra pregunta en 6 de 45 casos en lugar de devolver JSON.
- Aproximadamente 5 de 56 intakes aceptados tenían un `chief_complaint` claramente erróneo según lectura manual (por ejemplo, diarrea donde el paciente dijo estreñimiento).
- El dialecto del Golfo se etiqueta con frecuencia como árabe estándar moderno (MSA).
- Los datos de test provienen del mismo generador que los de entrenamiento, por lo que las métricas no predicen el comportamiento con pacientes reales; las conversaciones se puntuaron turno a turno sobre historial guionizado, nunca en ejecución libre.
- Riesgo de alucinación en la extracción de datos de admisión, especialmente en el campo `chief_complaint`.
- Licencia Apache-2.0 permite uso comercial, pero las advertencias del autor y la ausencia de validación clínica desaconsejan cualquier despliegue en producción sanitaria.
- Dependencia de la plantilla de chat del modelo base y del token de parada `<end_of_turn>` (id 107), ausente en el `generation_config.json` del base, lo que puede provocar generaciones mal truncadas si no se configura explícitamente.

## Enlaces

- Hugging Face: https://huggingface.co/xTamim/dawri-fanar-9b-lora
- Modelo base: https://huggingface.co/QCRI/Fanar-1-9B-Instruct
- Dataset de entrenamiento (privado): `xTamim/dawri-intake-synth`
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
