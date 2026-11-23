# Thox-ai/thox-micro-125m-GGUF

## Resumen

thox-micro-125m-GGUF es la distribucion en formato GGUF del modelo base thox-micro-125m, un transformer de 123,5 millones de parametros entrenado desde cero por THOX.ai LLC (THOX-ai en Hugging Face). No se trata de una cuantizacion de un modelo upstream ajeno, sino de builds del propio modelo de investigacion de la linea de modelos pequenos de THOX, empaquetados para su uso con llama.cpp y Ollama en dispositivos locales y de borde.

El repositorio incluye cuatro variantes de cuantizacion (F16, Q8_0, Q4_K_M y Q4_0), con tamanos que van desde los 81,3 MB del Q4_0 hasta los 249 MB del F16. La disponibilidad de Q4_0 se justifica porque la dimension de la capa FFN (2048) es divisible por 32, lo que permite ese tipo de bloque en llama.cpp. El modelo es de tipo base (no instruct), por lo que debe usarse con prompts de completado de texto y no con plantillas de chat.

Su relevancia actual reside en el nicho de inferencia local-first: un modelo de 123M en Q4_0 ocupa unos 81 MB en disco, lo que lo hace viable en hardware de muy baja potencia (dispositivos de borde, sistemas embebidos, moviles) dentro del ecosistema THOX (thoxos, meshstack). La licencia Apache-2.0 facilita su integracion comercial, aunque el autor advierte explicitamente de que no es un asistente alineado en seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base entrenado desde cero; detalles de capas y atencion no disponibles) |
| Parametros totales | 123.587.328 (123M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M, Q4_0 |
| Idiomas soportados | Ingles (en); calidad inferior en otros idiomas segun el autor |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); modelo base original en safetensors |

## Arquitectura y entrenamiento

El modelo base thox-micro-125m es un transformer de 123M de parametros entrenado desde cero por THOX.ai como parte de su linea de investigacion de modelos pequenos. La model card indica explicitamente que no se utilizo ningun modelo base externo. La dimension de la capa FFN es 2048, dato que el autor menciona para justificar la viabilidad de la cuantizacion Q4_0 (bloques de 32). No se detallan en la informacion disponible el numero de capas, cabezas de atencion, tokens de entrenamiento ni la composicion del corpus.

El procedimiento de entrenamiento se describe de forma generica: "el corpus y el procedimiento son los descritos en esta tarjeta en el momento del lanzamiento". No se menciona uso de RLHF, DPO ni ninguna fase de alineacion; de hecho, el autor califica el modelo como base y advierte de que no esta alineado en seguridad. No se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto por completado (modelo base, no instruct): continuacion de prompts sin formato conversacional.
- Inferencia en dispositivo local y borde: disenado para ejecutarse con llama.cpp y Ollama en hardware de baja potencia.
- Multilingue limitado: entrenado principalmente en ingles; el autor reconoce menor calidad en otros idiomas.
- Compatibilidad con endpoints: la etiqueta endpoints_compatible sugiere integracion con infraestructura de inferencia estandar.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.

## Casos de uso

- Completado de texto en dispositivos de borde: con el build Q4_0 (81,3 MB) el modelo cabe en dispositivos con RAM muy limitada y permite autocompletado local sin conexion, manteniendo los datos en el dispositivo.
- Prototipado rapido en llama.cpp: util para validar pipelines de inferencia GGUF y comparar el comportamiento entre cuantizaciones (F16 frente a Q4_0) antes de escalar a modelos mayores.
- Pruebas de integracion en Ollama: el repositorio incluye un Modelfile y el comando `ollama run hf.co/Thox-ai/thox-micro-125m-GGUF:Q4_K_M`, lo que facilita desplegar el modelo en entornos de desarrollo locales con una sola orden.
- Educacion e investigacion de modelos pequenos: un transformer de 123M entrenado desde cero sirve como caso de estudio reproducible para analizar el efecto de la cuantizacion en un modelo base de muy bajo parametraje.
- Generacion de texto auxiliar dentro del ecosistema THOX: el autor lo situa como pieza de completado dentro de su stack (thoxos, meshstack) en escenarios donde la privacidad prima sobre la calidad factual.
- Verificacion de integridad en pipelines: el repositorio incluye SHA256SUMS.txt, lo que permite validar los artefactos descargados en flujos automatizados de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica: "No THOX GATE49 result is published for this model". No se dispone de datos de MMLU, HumanEval, GSM8K ni de latencia o throughput medidos.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 81 MB para Q4_0, 85 MB para Q4_K_M, 133 MB para Q8_0 y 249 MB para F16 (tamanos de fichero; el consumo en ejecucion anade overhead de contexto y del runtime).
- GPU recomendadas: no se especifican; por su tamano, cualquier GPU consumer moderna (por ejemplo, RTX 4090, RTX 3060 o inferiores) puede ejecutarlo con holgura, y tambien es viable en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer y en muchas iGPU; el Q4_0 esta pensado para el hardware mas pequeno de la familia THOX.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (`ollama run hf.co/Thox-ai/thox-micro-125m-GGUF:Q4_K_M`), descarga via `hf download`. No se documenta soporte de vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| thox-micro-125m-GGUF | 123M | no disponible | Apache-2.0 | GGUF | Base, entrenado desde cero, orientado a borde |
| Alternativas de ~125M (p. ej. GPT-2 small, distilgpt2) | ~117-124M | 1024 tokens (GPT-2) | MIT / otras | safetensors, GGUF | Modelos base genericos; comparativa no disponible en la informacion proporcionada |
| Modelos instruct pequenos (~135M-500M) | variable | variable | variable | GGUF, safetensors | Suelen incluir alineacion; este modelo no |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- Modelo base sin alineacion de seguridad: el autor indica que no debe desplegarse como asistente publico sin las salvaguardas de THOX.
- Fiabilidad factual baja: al ser un modelo de 123M, las respuestas pueden ser incorrectas; hay que verificar cualquier dato importante. Riesgo alto de alucinacion.
- Sesgos derivados del corpus de entrenamiento, mayoritariamente en ingles; la calidad en otros idiomas es inferior.
- La cuantizacion degrada la precision; los ficheros de menor numero de bits (Q4_0) pierden mas calidad que Q8_0 o F16.
- Uso fuera de alcance segun el autor: decisiones medicas, legales, financieras o de seguridad critica sin revision humana, y control no supervisado de dispositivos fisicos sin paso de confirmacion.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantias; el modelo se distribuye "tal cual".
- No es un modelo conversacional: usar prompts de completado, no plantillas de chat.
- No se documentan la longitud de contexto ni los datos exactos de entrenamiento, lo que dificulta evaluar su idoneidad en tareas de contexto largo.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/Thox-ai/thox-micro-125m-GGUF
- Modelo base: https://huggingface.co/Thox-ai/thox-micro-125m
- Demo de dispositivos virtuales THOX: https://thox.ai/#demo-callout-home_lineup
- Campana de Kickstarter de THOX: https://www.kickstarter.com/projects/thox/four-devices-one-private-ai-ecosystem-thoxai
