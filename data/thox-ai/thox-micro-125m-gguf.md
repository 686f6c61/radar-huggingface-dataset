# Thox-ai/thox-micro-125m-GGUF

## Resumen

thox-micro-125m-GGUF es la distribucion en formato GGUF del modelo base thox-micro-125m, un modelo de lenguaje de 123 millones de parametros entrenado desde cero por THOX.ai LLC como parte de su linea de investigacion de modelos pequenos. El repositorio contiene cuatro builds cuantizados (F16, Q8_0, Q4_K_M y Q4_0) pensados para llama.cpp y para inferencia en dispositivos locales y entornos edge, dentro de lo que el autor denomina el stack THOX (thoxos, meshstack, local-first).

Se trata de un modelo base, no instruct, por lo que su uso previsto es la completacion de texto con prompts planos y no el dialogo conversacional. Con 123.587.328 parametros reales y un tamano de repositorio de 0,5 GB, el interes principal reside en su huella minima: el build Q4_0 ocupa 81,3 MB, lo que permite ejecutarlo en hardware muy limitado. La licencia Apache-2.0 facilita su integracion en productos comerciales.

La relevancia de esta ficha es acotada: no hay resultados de benchmarks publicados, el modelo solo declara soporte de ingles y su calidad factua es debil por su escala. Resulta util como componente de completado ligero y embebido, no como asistente general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer de lenguaje; detalles no publicados en la model card) |
| Parametros totales | 123.587.328 (123M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M, Q4_0 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo se entrena desde cero ("from-scratch"), sin modelo base externo de partida, segun declara el autor. La model card no detalla la arquitectura interna (numero de capas, dimensiones de atencion, tipo de normalizacion ni funcion de activacion), aunque si se indica un dato estructural: la dimension de la capa feed-forward es 2048, divisible por 32, lo que habilita la cuantizacion Q4_0. No se especifica la longitud de contexto ni el esquema de atencion.

Tampoco se publican el numero de tokens de entrenamiento, la composicion del corpus ni si hubo fases de alineacion como RLHF o DPO; la model card indica unicamente que el corpus y el procedimiento son los descritos en la tarjeta en el momento del lanzamiento, y que el modelo es de tipo base (no instruct). No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion y completado de texto en ingles mediante prompts planos (modelo base, no conversacional).
- Inferencia local en llama.cpp y Ollama, con builds cuantizados de 81 MB a 249 MB.
- Ejecucion en dispositivos edge y hardware de recursos limitados gracias a su huella minima.
- Integracion dentro del stack THOX (thoxos, meshstack) como componente de completado.
- Compatibilidad con endpoints (tag endpoints_compatible) para despliegue como servicio.
- No dispone de modo thinking, vision, audio, tool calling ni capacidades de agente documentadas.
- Soporte multilingue limitado al ingles; el autor advierte de menor calidad en otros idiomas.

## Casos de uso

- Autocompletado embebido en aplicaciones de escritorio o moviles: el build Q4_0 de 81 MB cabe en memoria de dispositivos modestos y permite sugerencias de texto sin conexion, con latencia baja al no requerir red.
- Prototipado rapido de pipelines de generacion de texto: sirve como sustituto ligero en fases de desarrollo antes de migrar a modelos mayores, gracias a la simplicidad de carga con llama-cli y Ollama.
- Completado de plantillas y campos estructurados: para tareas de relleno de formularios o generacion de cadenas cortas en ingles donde no se requiere razonamiento profundo.
- Filtrado y preprocesado de texto en el edge: clasificacion o continuacion de fragmentos en dispositivos con recursos restringidos dentro de una arquitectura local-first.
- Pruebas de integracion del stack THOX: validacion de thoxos y meshstack con un modelo de referencia de la misma familia antes de desplegar variantes mayores.
- Educacion e investigacion sobre modelos pequenos: analisis del comportamiento de un modelo base de 123M entrenado desde cero, con pesos abiertos y licencia permisiva para experimentacion.
- Generacion de texto auxiliar en entornos sin GPU: al ejecutarse en CPU mediante llama.cpp, puede actuar como generador de borradores o resumenes breves en servidores sin aceleracion hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay ningun resultado THOX GATE49 publicado para este modelo.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todos los builds; el Q4_0 requiere aproximadamente 100 MB de memoria en tiempo de ejecucion y el F16 en torno a 300 MB contando overhead.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; tambien funciona en CPU pura mediante llama.cpp.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, GTX 1650 e incluso iGPU con memoria compartida.
- Opciones de despliegue: llama.cpp (llama-cli), Ollama (ollama run hf.co/Thox-ai/thox-micro-125m-GGUF:Q4_K_M), descarga via huggingface-cli/hf. No se documenta soporte de vLLM ni TGI.
- Latencia y throughput: no disponibles; por el tamano del modelo se espera generacion en tiempo real en CPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| thox-micro-125m-GGUF | 123M | no disponible | en | Apache-2.0 | GGUF | Base, from-scratch, sin benchmarks publicados |
| SmolLM-135M | 135M | 2.048 tokens (segun documentacion publica del modelo) | en (principalmente) | Apache-2.0 | safetensors, GGUF | Base e instruct, con evaluaciones publicadas |
| Qwen2.5-0.5B | 494M | 32.768 tokens (segun documentacion publica) | multilingue | Apache-2.0 | safetensors, GGUF | Mayor escala y contexto, instruct disponible |

La comparacion con SmolLM-135M y Qwen2.5-0.5B se ofrece como referencia de categoria por tamano y licencia; no se dispone de datos de rendimiento de thox-micro-125m que permitan una comparacion cuantitativa directa.

## Limitaciones y advertencias

- Modelo base de 123M: fiabilidad factua debil y alta probabilidad de alucinacion; requiere verificacion de respuestas importantes.
- Solo entrenado y evaluado en ingles; la calidad en otros idiomas es inferior segun el propio autor.
- No es un asistente alineado en seguridad; el autor indica que no debe desplegarse como asistente publico sin las barreras de proteccion de THOX.
- Uso fuera de alcance: decisiones medicas, legales, financieras o de seguridad critica sin revision humana, y control no supervisado de dispositivos fisicos.
- La cuantizacion degrada la precision; los builds de menor numero de bits (Q4_0, Q4_K_M) pierden mas calidad que Q8_0 o F16.
- No se publican benchmarks ni longitud de contexto, lo que dificulta estimar su idoneidad en produccion.
- Ausencia de capacidades de tool calling, agentes o instrucciones, al ser un modelo base.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/Thox-ai/thox-micro-125m-GGUF
- Modelo base: https://huggingface.co/Thox-ai/thox-micro-125m
