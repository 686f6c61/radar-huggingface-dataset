# Tamarillo/ai-text-forensics-guard-small-en

## Resumen

Tamarillo/ai-text-forensics-guard-small-en es un clasificador binario de texto en ingles disenado para detectar si un fragmento ha sido generado por un modelo de lenguaje o por un humano. Lo desarrolla Tamarillo como parte de una suite de seguridad y forensica de modelos abiertos, y se construye sobre answerdotai/ModernBERT-base mediante ajuste fino para la tarea de clasificacion de secuencias (0 = humano, 1 = ai_generated). Con 149.606.402 parametros y licencia Apache-2.0, se posiciona como una alternativa ligera y desplegable en produccion frente a detectores de mayor tamano.

El modelo aborda cuatro problemas concretos que el autor identifica en los detectores abiertos mas descargados: carga no estandar en transformers (requiere codigo personalizado), truncamiento de contexto a 512-768 tokens, elevados falsos positivos sobre texto humano escrito por no nativos en ingles (ESL) por atajos de formato como los saltos de parrafo, y ausencia de artefactos ONNX verificados. Este modelo entrena con 2.048 tokens de contexto y soporta 8.192 tokens nativos via RoPE, no requiere trust_remote_code y exporta pesos FP32 y FP16 a ONNX con paridad verificada.

Su relevancia actual radica en el uso como guardrail en pipelines de observabilidad y seguridad: permite marcar salidas de agentes y modelos en produccion, auditar contenido sintetico en entornos RAG y filtrar texto generado en aplicaciones web o edge mediante Transformers.js. La model card reporta un ROC-AUC de 0,9986 sobre un conjunto OOD de LLMs de 4B y 8B de 2025-2026, aunque el propio autor advierte de un FPR del 18,83% sobre ensayos humanos ESL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT), `ModernBertForSequenceClassification` |
| Parametros totales | 149.606.402 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens entrenados; 8.192 nativos via RoPE |
| Tipos de cuantizacion | FP32 y FP16 (exportaciones ONNX con paridad verificada); cuantizacion adicional no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (model.onnx y model_fp16.onnx) |

## Arquitectura y entrenamiento

El modelo parte de ModernBERT-base, un encoder transformer con atencion de contexto largo y sin necesidad de codigo remoto, y se ajusta como clasificador de dos clases (humano / generado por IA) mediante `ModernBertForSequenceClassification`. La cabecera de clasificacion produce logits que se convierten en probabilidades mediante softmax; la model card incluye un factor de calibracion de temperatura T = 0,9446 en `calibration.json`, asi como umbrales operativos precalculados (thr_5fpr_val = 0,56506 y thr_1fpr_val = 0,93046) para fijar la tasa de falsos positivos en el 5% y el 1% respectivamente.

El entrenamiento utiliza los datasets liamdugan/raid y yaful/MAGE. La model card no detalla el numero de tokens de entrenamiento ni la composicion exacta del dataset, aunque si menciona que se aborda explicitamente el sesgo de formato (los saltos de parrafo `\n\n` aparecen en el 0,0% de los textos humanos de RAID y en el 58-78% de los generados por IA) para evitar que el modelo memorice ese atajo. No se documenta el uso de RLHF ni DPO, algo esperable en un clasificador. La innovacion tecnica principal es la exportacion ONNX con paridad FP32/FP16 y el soporte nativo en Transformers.js para inferencia en navegador.

## Capacidades

- Clasificacion binaria de texto en ingles: distingue texto humano de texto generado por IA (etiquetas 0 = human, 1 = ai_generated).
- Deteccion de salidas de agentes y modelos: orientado a forensica de outputs de LLMs y sistemas agenticos.
- Contexto largo: entrenado a 2.048 tokens y con 8.192 tokens nativos via RoPE, lo que permite analizar informes, transcripciones de agentes y respuestas RAG completas sin truncar.
- Calibracion de probabilidades: factor de temperatura y umbrales operativos para controlar la tasa de falsos positivos.
- Despliegue multiplataforma: pesos safetensors para transformers, ONNX para CPU/edge y Transformers.js para navegador y Node.js.
- Sin `trust_remote_code`: carga directa con `transformers>=4.48`.
- No soporta tool calling, function calling, generacion de texto, vision ni audio; es exclusivamente un clasificador.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Guardrail en produccion para agentes LLM: clasificar cada respuesta generada por un agente antes de mostrarla o persistirla, usando el umbral thr_5fpr_val para mantener la tasa de falsos positivos controlada en el 5%.
- Auditoria de contenido sintetico en entornos RAG: analizar respuestas completas de hasta 2.048 tokens (8.192 con RoPE) para detectar continuaciones sinteticas en informes largos, algo que los detectores limitados a 512-768 tokens no cubren.
- Observabilidad de pipelines de IA: registrar la probabilidad de generacion por IA junto a cada salida del modelo para trazabilidad y monitorizacion de deriva en sistemas desplegados.
- Moderacion y filtrado en aplicaciones web: ejecutar el modelo en el navegador con Transformers.js (FP16) para marcar texto sospechoso sin enviar datos a un servidor, util en plataformas de contenido generado por usuarios.
- Deteccion de plagio academico asistido por IA: integrar el clasificador en herramientas de revision de ensayos, teniendo en cuenta el FPR elevado sobre texto ESL y aplicando umbrales conservadores.
- Forensica digital y peritaje: analisis de documentos o transcripciones para determinar procedencia sintetica en investigaciones internas o auditorias de seguridad.
- Inferencia en edge y CPU: desplegar el ONNX en dispositivos sin GPU para clasificacion de bajo coste en tiempo real.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Tarea / dataset | Metrica | Valor |
|---|---|---|
| AI-Generated Text & Agent Output Forensics (OOD, Qwen3-4B + DeepSeek-R1-Distill-Llama-8B) | ROC-AUC | 0,9986 |
| AI-Generated Text & Agent Output Forensics (OOD) | TPR@5%FPR | 0,9933 |
| AI-Generated Text & Agent Output Forensics (OOD) | Macro-F1 | 0,9693 |
| Non-Native English (ESL) Human False-Positive Audit (chillies/ielts-writing-task2-essays, OOD) | FPR @ 0,50 | 0,1883 |

No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU, HumanEval o GSM8K, que no aplican a un clasificador.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en FP32 (149,6M parametros) y unos 0,3 GB en FP16; el repo completo ocupa 1,5 GB por incluir multiples exportaciones.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100. Funciona en RTX 4090, RTX 3090, RTX 4060 y GPUs integradas.
- Cabe en GPU consumer: si, con amplio margen; tambien en CPU y en navegador.
- Opciones de despliegue: transformers (>=4.48), ONNX Runtime (CPU/edge), Transformers.js (>=3.5.1, navegador y Node.js), Text Embeddings Inference (tag text-embeddings-inference) y endpoints compatibles. No se documenta soporte especifico de vLLM, llama.cpp u Ollama para clasificacion.
- Latencia y throughput: no disponibles en la informacion proporcionada; al ser un encoder de 150M, se espera inferencia en decenas de milisegundos en GPU y en el orden de centenas de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Carga estandar | ONNX / navegador |
|---|---|---|---|---|---|
| Tamarillo/ai-text-forensics-guard-small-en | 149,6M | 2.048 (8.192 RoPE) | Apache-2.0 | Si, sin trust_remote_code | Si (FP32/FP16) |
| desklib/ai-text-detector-v1.01 | no disponible | 512-768 (truncamiento) | no disponible | No, requiere subclase personalizada | No |
| Detectores basados en RoBERTa/DeBERTa (familia generica) | 100-400M aprox. | 512-768 | variable | Si | variable |

La model card cita explicitamente a desklib/ai-text-detector-v1.01 como referencia de los problemas de carga no estandar y truncamiento. No se dispone de datos de rendimiento comparativos verificados entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo ingles: no soporta otros idiomas, lo que limita su uso en entornos multilingues.
- Falsos positivos sobre texto ESL: el FPR del 18,83% sobre ensayos humanos de no nativos en ingles es elevado y desaconseja su uso como unico criterio en evaluaciones academicas o disciplinarias.
- Riesgo de alucinacion del clasificador: como todo detector, puede producir falsos positivos y falsos negativos; los resultados OOD declarados no han sido verificados de forma independiente.
- Sesgo de dominio: entrenado con RAID y MAGE; el rendimiento puede degradarse en dominios, estilos o modelos generadores no representados en el entrenamiento.
- Contexto limitado a 2.048 tokens en entrenamiento; el uso de 8.192 tokens via RoPE es nativo pero no necesariamente validado en entrenamiento.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion.
- Uso etico: la deteccion de texto generado por IA tiene implicaciones legales y de privacidad; conviene combinarla con revision humana y no usarla como prueba definitiva.
- Los enlaces de busqueda web proporcionados no son relevantes para el modelo (corresponden al fruto tamarillo) y no se han utilizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tamarillo/ai-text-forensics-guard-small-en
- Perfil del autor: https://huggingface.co/Tamarillo
- Demo en navegador (Space): https://huggingface.co/spaces/Tamarillo/ai-text-forensics-guard-demo
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Dataset RAID: https://huggingface.co/datasets/liamdugan/raid
- Dataset MAGE: https://huggingface.co/datasets/yaful/MAGE
- Dataset de ensayos ESL: https://huggingface.co/datasets/chillies/ielts-writing-task2-essays
