# Tutanka01/CodeLALA-v1-7A1B-GGUF

## Resumen

CodeLALA-v1-7A1B-GGUF es la distribucion en formato GGUF del modelo CodeLALA-v1-7A1B, un ajuste fino orientado a generacion de codigo desarrollado por el usuario Tutanka01 sobre el modelo base OVHcloud/Olala-v1.0-mini-7A1B. El modelo hereda la arquitectura hibrida Mamba-3 con atencion diferencial TPA en configuracion MoE, con aproximadamente 6,8 mil millones de parametros totales y alrededor de 1000 millones de parametros activos por token. Esta publicacion concreta ofrece los pesos cuantizados listos para ejecutar con llama.cpp, lo que permite desplegar el modelo en hardware de consumo.

La propuesta de valor del modelo es la eficiencia en tokens durante bucles de agente y tareas de generacion de codigo. Segun la model card, mantiene la precision estricta en MBPP+ del modelo base (68,7 %) reduciendo el numero de tokens generados por turno en un 50,7 % en mediana y un 40,0 % en media, con un 39 % menos de truncamientos y cero bucles infinitos en las pruebas realizadas. Esto se traduce en una velocidad efectiva mayor para el mismo resultado funcional, con cifras declaradas de mas de 100 tokens por segundo en Apple Silicon.

El modelo esta pensado para asistentes de codigo locales, integracion en IDE y pipelines de agentes que necesitan baja latencia y bajo consumo de tokens. Soporta ingles y frances, se distribuye bajo licencia Apache-2.0 y requiere una build de llama.cpp con soporte para la arquitectura Mamba-3 de Olala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba-3 + atencion diferencial TPA, Mixture of Experts (MoE) |
| Parametros totales | ~6,8 mil millones (7A1B) |
| Parametros activos | ~1000 millones por token |
| Longitud de contexto | 32768 tokens (segun ejemplo de servidor con `-c 32768`) |
| Tipos de cuantizacion | Q4_K_M (~4,2 GB), Q6_K (~5,9 GB), Q8_0 (~7,2 GB) |
| Idiomas soportados | Ingles (en), frances (fr) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (pesos completos en safetensors en el repo base) |

## Arquitectura y entrenamiento

El modelo se basa en Olala-v1.0-mini-7A1B de OVHcloud, que emplea una arquitectura hibrida que combina capas Mamba-3 (modelo de espacio de estados) con atencion diferencial TPA, organizada como Mixture of Experts con aproximadamente 6,8 mil millones de parametros totales y alrededor de 1000 millones activos. Esta combinacion busca reducir el coste computacional por token frente a un transformer denso de tamano equivalente, manteniendo capacidad de modelado de secuencias largas.

CodeLALA-v1 es un post-entrenamiento especifico para codigo sobre ese modelo base, orientado a reducir la verbosidad de las respuestas y a mejorar la estabilidad en bucles de agente. La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; esa informacion no esta disponible. La innovacion destacada es el control del esfuerzo de razonamiento mediante el parametro `reasoning_effort` (valores `medium` y `disabled`), que permite alternar entre respuestas con razonamiento completo y completados cortos y directos.

## Capacidades

- Generacion de codigo, con enfasis declarado en Python y tareas de programacion general.
- Modo de razonamiento configurable mediante `reasoning_effort`: `medium` para precision completa en tareas de codigo y agentes, `disabled` para completados cortos e inmediatos.
- Orientado a asistentes de codigo y bucles de agente, con reduccion de tokens por turno y sin bucles infinitos en las pruebas publicadas.
- Soporte bilingue ingles-frances.
- Compatible con llama.cpp y con servidor local compatible con la API de OpenAI, lo que facilita su integracion en IDE y herramientas de agente.
- No se documenta soporte explicito de tool calling, vision, audio ni otras modalidades en la informacion disponible.

## Casos de uso

- Asistente de codigo en IDE: el modelo puede servirse localmente con `llama-server` en modo compatible con OpenAI y conectarse a extensiones de editor, ofreciendo completados y explicaciones con baja latencia gracias a sus ~1000 millones de parametros activos.
- Bucles de agente de programacion: con `reasoning_effort="medium"` mantiene la precision estricta en tareas tipo MBPP+ reduciendo a la mitad los tokens por turno, lo que abarata y acelera ciclos iterativos de generacion, ejecucion y correccion.
- Autocompletado rapido en linea: con `reasoning_effort="disabled"` genera respuestas de unos 37 tokens de mediana, adecuadas para sugerencias cortas sin truncamientos.
- Generacion de funciones y utilidades Python: tareas como parseo y fusion de intervalos solapados, segun el ejemplo de la model card, encajan en el perfil de codigo entrenado.
- Despliegue en portatiles y equipos de consumo: las cuantizaciones Q4_K_M (~4,2 GB) y Q6_K (~5,9 GB) permiten ejecucion en maquinas con 8-16 GB de RAM.
- Procesamiento de contextos largos en revision de codigo: con ventana de hasta 32768 tokens puede analizar ficheros o fragmentos extensos en una sola pasada.
- Entornos con requisitos de privacidad: al ejecutarse localmente con pesos Apache-2.0, el codigo no sale del equipo del usuario.

## Benchmarks y rendimiento

Resultados declarados en la model card sobre 150 tareas reservadas de MBPP+ con temperatura 0,0:

| Modo | Modelo | MBPP+ (estricto) | Tokens mediana | Tokens media | Truncamientos (4096) | Bucles de inestabilidad |
|---|---|---|---|---|---|---|
| medium | Olala-v1.0-mini-7A1B (base) | 68,7 % (103/150) | 975 | 1722 | 33/150 | 1/8 |
| medium | CodeLALA-v1-7A1B | 68,7 % (103/150) | 481 (-50,7 %) | 1041 (-40,0 %) | 20/150 (-39 %) | 0/8 (0 %) |
| disabled | Olala-v1.0-mini-7A1B (base) | 62,7 % (94/150) | 795 | 1835 | 58/150 | no disponible |
| disabled | CodeLALA-v1-7A1B | 56,0 % (84/150) | 37 (-95,3 %) | 52 (-97,2 %) | 0/150 (0 %) | no disponible |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: Q4_K_M ~4,2 GB, Q6_K ~5,9 GB, Q8_0 ~7,2 GB. Con offload completo a GPU (`-ngl 99`) la VRAM necesaria es del orden del tamano del fichero mas overhead de contexto.
- GPU recomendadas: no se especifican en la model card; por tamano, tarjetas consumer con 8 GB o mas pueden alojar las cuantizaciones Q4_K_M y Q6_K. GPUs de datacenter (A100, H100) no se mencionan.
- Cabe en GPU de consumo: si, en tarjetas con 8-16 GB de VRAM segun cuantizacion; la model card cita equipos con 8-16 GB de RAM para Q4_K_M y 16-24 GB para Q8_0.
- Opciones de despliegue: llama.cpp, preferiblemente el fork de OVHcloud (github.com/ovh/llama.cpp) u otra build con soporte de Mamba-3 de Olala; `llama-server` para servidor compatible con OpenAI y `llama-cli` para uso interactivo. vLLM, TGI u Ollama no se mencionan como soportados.
- Rendimiento declarado: mas de 100 tokens por segundo en Apple Silicon con Q6_K.
- Parametros de ejecucion de referencia: `-ngl 99 -fa 1 -c 32768`, temperatura 0,6, top-p 0,9, top-k 40.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MBPP+ (estricto) | Licencia | Notas |
|---|---|---|---|---|---|
| CodeLALA-v1-7A1B | ~6,8 B totales / ~1 B activos | 32768 | 68,7 % (modo medium) | Apache-2.0 | Post-entrenamiento de codigo con reduccion de tokens |
| Olala-v1.0-mini-7A1B | ~6,8 B totales / ~1 B activos | no disponible | 68,7 % (modo medium) | no disponible | Modelo base; misma precision con el doble de tokens de mediana |
| Otros modelos de codigo de ~7 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- En modo `disabled` la precision estricta cae 6,7 puntos respecto al modelo base (56,0 % frente a 62,7 %), por lo que no es adecuado para tareas de codigo con casos limite exigentes.
- Solo se documentan ingles y frances; el rendimiento en castellano no esta evaluado.
- Los benchmarks publicados se limitan a MBPP+ sobre 150 tareas; no hay evaluacion en HumanEval, MMLU ni tareas de agente reales.
- Requiere una build de llama.cpp con soporte de Mamba-3 de Olala; las builds estandar pueden no cargar el modelo.
- Riesgo de alucinacion y sesgos: no se documentan evaluaciones de sesgo ni tasas de alucinacion en la informacion disponible.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Olala-v1.0-mini-7A1B, cuya licencia no se detalla en la informacion proporcionada.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; madurez y soporte de la comunidad no verificables.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Tutanka01/CodeLALA-v1-7A1B-GGUF
- Pesos completos (safetensors): https://huggingface.co/Tutanka01/CodeLALA-v1-7A1B
- Modelo base: https://huggingface.co/OVHcloud/Olala-v1.0-mini-7A1B
- Fork de llama.cpp con soporte Olala Mamba-3: https://github.com/ovh/llama.cpp
