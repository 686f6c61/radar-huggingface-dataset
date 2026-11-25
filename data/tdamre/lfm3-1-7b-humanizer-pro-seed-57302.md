# Tdamre/LFM3-1.7B-Humanizer-Pro-Seed-57302

## Resumen

LFM3-1.7B-Humanizer-Pro-Seed-57302 es un adaptador PEFT de tipo LoRA sobre el modelo base LiquidAI/LFM3-1.7B, desarrollado por el usuario Tdamre. Su proposito es la edicion de prosa procedimental en ingles: reescribir pasajes para mejorar su claridad manteniendo intactos todos los hechos, cifras, condiciones, incertidumbres y responsables mencionados en el texto original. No es un modelo independiente, sino un ajuste fino ligero (rango 8, alpha 16) que modifica el comportamiento generativo del base con un objetivo muy acotado.

El adaptador se presenta como una replicacion de semilla ("seed replication") de una receta supervisada de edicion factual con 48 pares de ejemplo, un unico epoch y 48 actualizaciones. El modelo base es un transformer de 1.700 millones de parametros de Liquid AI, con licencia LFM Open License v1.0 y soporte exclusivo de ingles. El adaptador ocupa un repo de 0.0 GB (solo pesos LoRA en safetensors) y esta pensado para cargarse sobre el base fijado a una revision concreta.

Su relevancia es acotada pero concreta: demuestra un flujo reproducible de ajuste fino para una tarea de edicion controlada, con protocolo de evaluacion publico y pesos verificables por hash SHA-256. No obstante, la ausencia de descargas y likes, junto con un conjunto de evaluacion de solo ocho pasajes revisados por modelos y sin evaluador humano independiente, lo sitúan como un artefacto experimental antes que como una herramienta lista para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer LiquidAI/LFM3-1.7B |
| Parametros totales | 1.7B (modelo base); parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se carga en bfloat16 segun la model card) |
| Idiomas soportados | en (ingles) |
| Licencia | lfm-open-license-1.0 (LFM Open License v1.0) |
| Formato de pesos | safetensors (adaptador LoRA); base en safetensors |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 8 y alpha 16 aplicado sobre el modelo base LiquidAI/LFM3-1.7B congelado en la revision `0dc4268b561499c648c7ba7c9466bf3d8d01517a`. El entrenamiento consistio en un unico epoch con 48 actualizaciones sobre una receta supervisada de edicion factual de 48 pares, con tasa de aprendizaje 0.00005 y semilla 57302. Los pesos del adaptador se copiaron sin cambios desde la primera ejecucion de entrenamiento completada, y su integridad se verifica mediante el hash SHA-256 `24014976a313deb7fed35265b37c0eba7926d8f2970e5a7b3ce35d81f42341cf`.

No se detalla en la informacion disponible la composicion exacta del dataset de entrenamiento, el numero de tokens procesados ni si hubo etapas de RLHF o DPO. La innovacion tecnica destacable es la reproducibilidad: la receta de entrenamiento es publica (repositorio Humanizer-pro en GitHub) y el adaptador se distribuye como replicacion de semilla con protocolo de evaluacion documentado. El entorno probado es Python 3.12, PyTorch 2.13.0, Transformers 5.22.2, PEFT 0.21.2, Accelerate 1.15.0 y Safetensors 0.8.0, con carga en CPU verificada.

## Capacidades

- Edicion de prosa procedimental en ingles para mejorar claridad preservando hechos, cifras, condiciones, incertidumbres y responsables.
- Generacion de texto condicionada por un system prompt especifico de edicion ("Edit the text for clarity...").
- Modo de generacion determinista recomendado (`do_sample=False`) con `max_new_tokens=384`.
- Soporte de chat template del modelo base con `enable_thinking=False`.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles.
- No se documenta un modo "thinking" activo; la model card usa explicitamente `enable_thinking=False`.

## Casos de uso

- Edicion de avisos legales y textos normativos: el adaptador reescribe avisos en ingles para mejorar su legibilidad manteniendo intactas las obligaciones, plazos y responsables, que es precisamente el escenario evaluado en la comparacion de ocho avisos.
- Limpieza de documentacion tecnica procedimental: reescribir manuales, runbooks o procedimientos internos para eliminar ambiguedades sin alterar pasos, cifras ni condiciones.
- Preprocesado de textos para revision humana: pasar borradores por el adaptador antes de la revision de un editor, reduciendo el trabajo de claridad sin introducir hechos nuevos.
- Normalizacion de avisos de privacidad o condiciones de servicio: adaptar redacciones en ingles a un estilo mas claro conservando la literalidad de las clausulas.
- Generacion de variantes de un mismo texto con control de fidelidad factual: util para comparar redacciones alternativas de un mismo aviso manteniendo el contenido verificado.
- Prototipado e investigacion de tecnicas de edicion controlada: el adaptador sirve como referencia reproducible (receta publica, hash verificable) para experimentar con LoRA de bajo rango en tareas de reescritura con restricciones factuales.

## Benchmarks y rendimiento

La model card publica una comparacion fija de ocho avisos en ingles con revision asistida por modelos (sin evaluador humano independiente), sobre 64 afirmaciones factuales, incluyendo seis pasajes que requerían edicion y dos controles ya claros.

| Medida | Resultado |
|---|---|
| Pasajes totalmente aceptables | 4 / 8 |
| Afirmaciones del original preservadas | 58 / 64 |
| Objetivos de edicion requeridos cumplidos | 5 / 6 |
| Entradas copiadas tras normalizar espacios | 0 / 8 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA es de tamano minimo (repo de 0.0 GB); el coste real es el del modelo base de 1.7B parametros.
- VRAM estimada para el base en bfloat16: aproximadamente 3,4 GB solo para pesos, mas overhead de activaciones y cache KV.
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB y superiores, con margen amplio.
- GPU profesionales recomendadas para mayor throughput: A100, H100, L40S.
- Carga en CPU verificada segun la model card; el rendimiento de generacion depende del dispositivo disponible.
- Despliegue: PEFT + Transformers (probado), potencialmente vLLM, TGI o llama.cpp si se fusiona el adaptador con el base, aunque no se documenta en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-Humanizer-Pro-Seed-57302 | 1.7B (base) + LoRA | no disponible | Adaptador de edicion | lfm-open-license-1.0 | Hugging Face, 0 descargas |
| LiquidAI/LFM3-1.7B (base) | 1.7B | no disponible | LLM generativo | lfm-open-license-1.0 | Hugging Face |
| Alternativas de edicion de texto con LoRA de 1-2B | no disponible | no disponible | Adaptadores especializados | variable | no disponible |

No se dispone de datos de rendimiento comparables entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- Conjunto de evaluacion muy pequeno (8 pasajes) y revision asistida por modelos, sin evaluador humano independiente; los resultados no son concluyentes.
- Solo cubre ingles; no hay soporte multilingue documentado.
- Riesgo de alucinacion: aunque el objetivo es preservar hechos, el modelo base puede introducir afirmaciones no soportadas; la comparacion registra 6 de 64 afirmaciones no preservadas.
- Al ser un adaptador LoRA de rango 8 entrenado con 48 actualizaciones, la capacidad de generalizacion a dominios o estilos distintos del corpus de entrenamiento es incierta.
- Sin descargas ni likes en Hugging Face; sin validacion comunitaria.
- La licencia LFM Open License v1.0 impone condiciones especificas para uso comercial; es necesario revisar el texto completo de la licencia y la atribucion (NOTICE) antes de desplegarlo en produccion.
- Requiere fijar la revision exacta del base (`0dc4268b...`) para reproducir el comportamiento; otras revisiones pueden alterar los resultados.
- No se documentan capacidades de tool calling, agentes ni modos de razonamiento extendido.

## Enlaces

- Hugging Face: https://huggingface.co/Tdamre/LFM3-1.7B-Humanizer-Pro-Seed-57302
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Codigo de entrenamiento: https://github.com/adybag14-cyber/Humanizer-pro/tree/main/lfm3/replicates
- Protocolo y resultados de la comparacion: https://github.com/adybag14-cyber/Humanizer-pro/blob/main/lfm3/comparison/RESULTS.md
- Licencia: https://huggingface.co/Tdamre/LFM3-1.7B-Humanizer-Pro-Seed-57302/blob/main/LICENSE
- Atribucion: https://huggingface.co/Tdamre/LFM3-1.7B-Humanizer-Pro-Seed-57302/blob/main/NOTICE
