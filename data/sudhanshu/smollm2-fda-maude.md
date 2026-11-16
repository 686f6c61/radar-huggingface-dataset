# sudhanshu/smollm2-fda-maude

## Resumen

Smollm2-fda-maude es un modelo de generacion de texto derivado de la familia SmolLM2, publicado por el usuario sudhanshu en Hugging Face. Se presenta como un fine-tuning orientado a un dominio concreto (la nomenclatura "fda-maude" sugiere un ajuste sobre documentacion o datos relacionados con la FDA y el sistema MAUDE de notificaciones de eventos adversos de dispositivos medicos, aunque el autor no lo explicita en la model card). El modelo esta empaquetado especificamente para ejecucion en el navegador mediante Transformers.js y WebGPU, con pesos en formato ONNX cuantizados a 4 bits.

La propuesta principal es la inferencia local en el cliente, sin servidor y potencialmente sin conexion, gracias a una grafica ONNX de aproximadamente 369 MB en cuantizacion q4f16 para WebGPU y una variante q4 para CPU/WASM. El repositorio ocupa unos 0,4 GB, lo que confirma que se trata de un modelo de pequeno tamano, coherente con la familia SmolLM2 (que incluye variantes de 135M, 360M y 1.7B parametros, aunque el autor no especifica cual es la base exacta).

La relevancia actual del modelo reside en su enfoque edge-first: demuestra el patron de publicar un ajuste de dominio ya cuantizado y listo para Transformers.js v3, lo que reduce la friccion para integrar un asistente conversacional especializado en una aplicacion web. No obstante, la informacion publicada es minima: no hay datos de entrenamiento, benchmarks, licencia ni idiomas declarados, por lo que su evaluacion rigurosa queda limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama/SmolLM2, segun el tag `llama`); detalles exactos no disponibles |
| Parametros totales | no disponible (base SmolLM2 sin especificar; el repo pesa 0,4 GB) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits: `q4f16` (WebGPU) y `q4` (CPU/WASM) en formato ONNX |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX (Transformers.js v3); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la familia SmolLM2, una arquitectura transformer decoder-only de tipo Llama, segun los tags del repositorio. El autor lo describe como un "fine-tuned edge language model" especializado en el dominio FDA/MAUDE y posteriormente cuantizado para ejecucion en cliente. No se especifica el tamano concreto de la base (135M, 360M o 1.7B), el numero de tokens de entrenamiento, la composicion del dataset de ajuste fino ni si se emplearon tecnicas de alineacion como RLHF o DPO.

La innovacion tecnica destacable no esta en la arquitectura sino en el pipeline de despliegue: se publican directamente graficas ONNX cuantizadas a 4 bits, con una variante `q4f16` pensada para WebGPU (pesos de 4 bits con activaciones en float16) y una variante `q4` como fallback para CPU/WASM. Se incluyen el tokenizer y las configuraciones de generacion para Transformers.js v3, lo que permite cargar el modelo en el navegador sin conversion adicional. No hay informacion sobre decodificacion especulativa, atencion lineal ni otras optimizaciones de inferencia.

## Capacidades

- Generacion de texto conversacional en el navegador, con pipeline `text-generation`.
- Ejecucion offline en el cliente mediante Transformers.js y WebGPU, con fallback a CPU/WASM.
- Ajuste fino orientado al dominio FDA/MAUDE (por el nombre del modelo), aunque el autor no detalla el alcance ni la calidad de dicho ajuste.
- Capacidades multilingues: no disponibles.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Asistente de consulta regulatoria en navegador: el modelo puede integrarse en una aplicacion web para responder preguntas sobre terminologia FDA/MAUDE sin enviar datos a un servidor, lo que resulta adecuado para entornos con requisitos de privacidad.
- Demo educativa de IA en el edge: sirve para mostrar en un curso o articulo como desplegar un LLM cuantizado a 4 bits con Transformers.js y WebGPU, con una huella de ~369 MB.
- Clasificacion y resumen de texto regulatorio en cliente: dado su ajuste de dominio, puede emplearse para resumir o etiquetar fragmentos de informes de eventos adversos dentro de una herramienta interna.
- Prototipado rapido de chatbots de dominio: al estar ya cuantizado y con configuraciones de generacion incluidas, permite montar un prototipo conversacional en horas sin infraestructura de GPU.
- Aplicaciones de campo con conectividad limitada: al ejecutarse offline en el navegador, encaja en escenarios donde no hay acceso estable a red (inspecciones, auditorias in situ).
- Filtro o preprocesado local antes de enviar datos a un modelo mayor: puede actuar como primera capa de triaje en un pipeline hibrido edge-cloud, reduciendo coste y latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el caso WebGPU (memoria compartida con el navegador); la grafica `q4f16` ocupa ~369 MB en disco y requiere memoria de GPU del orden de esa cifra mas overhead de activaciones.
- GPU recomendadas: cualquier GPU con soporte WebGPU en navegador (integradas modernas, Apple Silicon, GPUs de escritorio recientes); para la variante `q4` basta CPU con WASM.
- Cabe en GPU consumer: si, siempre que el navegador exponga WebGPU; en caso contrario, la variante `q4` funciona en CPU.
- Opciones de despliegue: Transformers.js v3 (WebGPU o WASM). No se publican pesos GGUF, safetensors ni configuraciones para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato edge | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smollm2-fda-maude | no disponible (base SmolLM2) | no disponible | ONNX q4f16 / q4 | no disponible | Hugging Face (0 descargas, 0 likes) |
| SmolLM2 (HuggingFaceTB) | 135M / 360M / 1.7B | hasta 8K en variantes publicadas | safetensors, GGUF, ONNX | Apache 2.0 en las variantes publicadas | Hugging Face, ampliamente adoptado |
| Qwen2.5-0.5B-Instruct | 0.5B | 32K | safetensors, GGUF, ONNX | Apache 2.0 | Hugging Face, muy adoptado |
| Gemma 2 2B | 2B | 8K | safetensors, GGUF | Gemma Terms of Use | Hugging Face |

La comparativa se limita a datos publicos de los modelos alternativos; para smollm2-fda-maude no se dispone de parametros, contexto ni licencia declarados, por lo que la comparacion cuantitativa no es posible.

## Limitaciones y advertencias

- La model card no declara licencia, lo que impide determinar si el uso comercial esta permitido; debe contactarse con el autor antes de cualquier despliegue en produccion.
- No se especifican los idiomas soportados ni el tamano exacto de la base SmolLM2, lo que dificulta estimar calidad y cobertura linguistica.
- Ausencia total de benchmarks: no hay evidencia publicada sobre MMLU, HumanEval, GSM8K ni evaluaciones de dominio FDA/MAUDE.
- Riesgo de alucinacion elevado en un modelo pequeno ajustado a un dominio regulatorio sensible; no debe usarse como fuente de verdad en decisiones clinicas o regulatorias.
- El ajuste de dominio no esta documentado: se desconoce la procedencia de los datos, su calidad y posibles sesgos inhererentes al corpus FDA/MAUDE.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.
- La cuantizacion a 4 bits puede degradar la coherencia en generaciones largas; no se han publicado evaluaciones de calidad tras la cuantizacion.
- Dependencia de WebGPU para el mejor rendimiento; en navegadores sin soporte se recurre a WASM con mayor latencia.
- No se publican pesos en safetensors ni GGUF, lo que limita su uso fuera del ecosistema Transformers.js.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sudhanshu/smollm2-fda-maude
- Familia SmolLM2 (referencia de la base): https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B
- Transformers.js: https://github.com/huggingface/transformers.js
- Documentacion de Transformers.js v3: https://huggingface.co/docs/transformers.js
- Sistema MAUDE de la FDA: https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfmaude/search.cfm
