# zmra/ZMRA-CyberSecPolicy-0.5B

## Resumen

ZMRA CyberSecPolicy 0.5B es un modelo de lenguaje pequeno (SLM) especializado en la sintesis de politicas de acceso de red de confianza cero (ZTNA) y contratos de microsegmentacion, presentado como una version beta experimental (v0.1-beta) por el autor zmra. Se construye mediante ajuste fino sobre Qwen/Qwen2.5-0.5B-Instruct, un transformer decoder-only de 494 millones de parametros con licencia Apache-2.0, y se distribuye unicamente en formato GGUF Q4_K_M (aproximadamente 379 MB) para inferencia en CPU sin GPU.

El modelo esta orientado a la generacion de policy-as-code validable mediante JSON Schema, dirigido a perfiles como CIOs, CTOs, DPOs, arquitectos de seguridad y analistas de negocio. Su propuesta de valor se centra en la inferencia offline en el edge, evitando el envio de topologias internas de red a servicios en la nube de terceros, y en la produccion de candidatos de reglas que requieren validacion determinista y aprobacion humana antes de aplicarse.

Es relevante ahora por la creciente demanda de modelos ligeros y desplegables localmente para tareas de cumplimiento normativo y seguridad, aunque su estado es claramente experimental: el propio autor advierte que no esta recomendado para despliegue directo en produccion. No se han publicado resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen2.5-0.5B-Instruct) |
| Parametros totales | 494.032.768 (0,5B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (unico formato distribuido) |
| Idiomas soportados | Ingles, chino, japones |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q4_K_M), archivo unico de ~379,38 MB |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de 494 millones de parametros. Sobre esa base se ha realizado un ajuste fino orientado a tareas de sintesis de politicas de seguridad, microsegmentacion y cumplimiento, segun describe el autor en la model card. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO, aunque las etiquetas del repositorio incluyen "dpo-governance", lo que sugiere un posible uso de optimizacion por preferencias directas sin confirmacion explicita.

La innovacion principal no reside en la arquitectura, sino en el enfoque de producto: generacion de JSON estructurado validable mediante esquema, disenado como asesor fuera de la ruta critica (off-hotpath) donde las reglas generadas pasan por un validador determinista y revision humana. La distribucion exclusiva en GGUF Q4_K_M y la ejecucion en CPU con menos de 500 MB de RAM apuntan a despliegues en el edge sin dependencia de GPU.

## Capacidades

- Generacion de texto especializada en politicas de seguridad, microsegmentacion y cumplimiento normativo.
- Sintesis de policy-as-code con salida estructurada compatible con JSON Schema.
- Generacion de candidatos de reglas ZTNA a partir de narrativas de logistica internacional y flujos comerciales.
- Produccion de tablas de auditoria estructuradas que vinculan transacciones transfronterizas con limites de red.
- Identificacion de PII y recomendaciones de enmascaramiento dinamico (segun la model card).
- Soporte multilingue limitado a ingles, chino y japones.
- Inferencia offline en CPU mediante llama.cpp y Ollama.
- No se documenta soporte explicito de tool calling ni de razonamiento multi-paso en la informacion disponible.

## Casos de uso

- Sintesis de politicas ZTNA en entornos de borde: el modelo traduce descripciones de flujos de acceso en candidatos de reglas estructuradas que un validador de esquema y un administrador revisan antes de su aplicacion, manteniendo la topologia interna fuera de la nube.
- Auditoria de cumplimiento transfronterizo: genera tablas estructuradas que relacionan transacciones comerciales con limites de red y restricciones regulatorias, utiles para equipos de DPO y gobernanza.
- Generacion de policy-as-code en pipelines de infraestructura: produce JSON validable que puede integrarse en flujos de GitOps, siempre con validacion determinista previa a la fusion.
- Asistencia a arquitectos de seguridad: propone contratos de microsegmentacion a partir de narrativas de alto nivel, acelerando la redaccion inicial de reglas que luego se revisan manualmente.
- Enmascaramiento y clasificacion de PII: sugiere reglas de identificacion y enmascaramiento de datos personales en flujos de datos, como borrador sujeto a revision.
- Despliegue en entornos air-gapped: al ejecutarse en CPU con menos de 500 MB de RAM, puede operar en estaciones de trabajo o dispositivos sin GPU ni conectividad, en escenarios de evaluacion interna.
- Prototipado rapido de asistentes de cumplimiento: permite a equipos de analisis de negocio experimentar con la generacion de informes estructurados de gobernanza sin costes de API en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona un script `verify_benchmark.py` para verificacion automatizada, pero no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el formato distribuido; la ejecucion es en CPU.
- RAM estimada: menos de 500 MB en CPU con el archivo GGUF Q4_K_M de ~379 MB.
- GPU recomendadas: no requeridas; el modelo esta disenado para CPU. No se documentan requisitos de GPU.
- Compatibilidad con GPU de consumo: no documentada; el foco es la inferencia en CPU.
- Opciones de despliegue: llama.cpp (llama-cli) y Ollama, ambas documentadas en la model card.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ZMRA CyberSecPolicy 0.5B | 494M | No disponible | GGUF Q4_K_M | Apache-2.0 | Especializado en ZTNA y policy-as-code, beta experimental |
| Qwen2.5-0.5B-Instruct | 494M | No disponible en esta ficha | Safetensors, GGUF | Apache-2.0 | Modelo base generalista de instrucciones |
| Qwen2.5-1.5B-Instruct | 1,5B | No disponible en esta ficha | Safetensors, GGUF | Apache-2.0 | Alternativa de mayor tamano de la misma familia |
| Modelos SLM especializados en seguridad | No disponible | No disponible | No disponible | No disponible | No se dispone de comparativas publicadas en la informacion |

La comparativa se limita a la familia Qwen2.5 por ser el origen directo del modelo; no se dispone de datos de rendimiento comparativo entre ellos en la informacion proporcionada.

## Limitaciones y advertencias

- Estado beta experimental: el autor indica explicitamente que no se recomienda su despliegue directo en produccion, sin garantia comercial ni SLA.
- Riesgo de alucinacion en la generacion de reglas: las politicas generadas deben pasar por validacion determinista de esquema y revision humana.
- Cobertura linguistica limitada a ingles, chino y japones; no se documenta soporte de castellano.
- Longitud de contexto no especificada, lo que impide evaluar su comportamiento en documentos largos.
- Modelo de 0,5B: capacidad de razonamiento y conocimiento factual acotada frente a modelos mayores.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible.
- Licencia Apache-2.0 permite uso comercial, pero el estado beta y la ausencia de garantias desaconsejan su uso en produccion sin evaluacion adicional.
- No se documenta soporte de tool calling ni de agentes multi-paso, lo que limita su integracion en flujos automatizados complejos.

## Enlaces

- HuggingFace: https://huggingface.co/zmra/ZMRA-CyberSecPolicy-0.5B
- Portal oficial: https://zmra.com
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
