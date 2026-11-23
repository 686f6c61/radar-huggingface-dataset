# trymirai/Qwen3.6-27B-L

## Resumen

Mirai's Qwen3.6-27B Large es una cuantizacion de 8 bits del modelo Qwen3.6-27B de Alibaba, publicada por trymirai (Mirai Labs) bajo licencia Apache 2.0. No se trata de un modelo entrenado desde cero, sino de un checkpoint cuantizado en formato propietario `uzu`, disenado especificamente para inferencia eficiente en Apple silicon. El modelo base cuenta con 27.322.284.032 parametros (27,3 mil millones) en precision original.

El objetivo del checkpoint es ofrecer un equilibrio entre tamano y fidelidad respecto al modelo original: el autor lo situa en la frontera de Pareto tamano-divergencia KL, afirmando que no encontro un checkpoint menor con menor divergencia KL. La evaluacion se realizo sobre una mezcla de datos compuesta por un 45% de datos publicos agentivos, un 30% de datos publicos de SFT y contexto largo, y un 25% de datos privados de chat.

La relevancia actual del modelo radica en su enfoque de despliegue local en hardware Apple: requiere la herramienta `mirai` (instalable via Homebrew) y la libreria `uzu`, y actualmente solo soporta inferencia en Apple silicon. Para el resto de detalles arquitectonicos, de entrenamiento y evaluaciones, el autor remite a la model card del modelo original de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del modelo base Qwen/Qwen3.6-27B) |
| Parametros totales | 27.322.284.032 (27,3 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit entero simetrico con escalas bfloat16 y group size 64; transformadas de Hadamard aleatorias bloque-diagonales con tamano de bloque 32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `uzu`, formato propietario de Mirai) |

## Arquitectura y entrenamiento

El checkpoint es el resultado de una cuantizacion post-entrenamiento (PTQ) sobre el modelo Qwen3.6-27B. La tecnica empleada es cuantizacion entera simetrica de 8 bits con escalas en bfloat16 y tamano de grupo 64. Para mitigar los valores atipicos (outliers) tanto en activaciones como en pesos, se aplican transformadas de Hadamard aleatorias bloque-diagonales con bloques de tamano 32. El autor indica que este checkpoint es comparable, en nivel de cuantizacion y tamano, al `UD-Q8_K_XL` de Unsloth para el mismo modelo base en formato GGUF.

No se proporcionan datos sobre la arquitectura interna del modelo base (tipo de transformer, atencion, etc.), el volumen de tokens de entrenamiento, la composicion del dataset original ni si hubo fases de RLHF o DPO. Toda esa informacion se delega a la model card de Qwen/Qwen3.6-27B. La innovacion tecnica destacable de este checkpoint es el uso de las transformadas de Hadamard para reducir outliers, junto con el formato `uzu` optimizado para Apple silicon.

## Capacidades

- Generacion de texto: pipeline declarado como `text-generation`.
- Capacidades heredadas del modelo base Qwen3.6-27B: no se detallan en la informacion disponible (razonamiento, codigo, matematicas, vision, tool calling, agentes, multilingueismo, etc. no se confirman en esta ficha).
- Evaluacion orientada a uso agentivo: el autor menciona que la mezcla de evaluacion incluye un 45% de datos publicos agentivos, lo que sugiere que el modelo base esta pensado para tareas de agente, aunque no se aportan resultados concretos.
- Soporte de contexto largo: la mezcla de evaluacion incluye un 30% de datos de SFT y contexto largo, lo que indica interes en escenarios de ventana extendida, sin cifras confirmadas.
- Inferencia local en Apple silicon: capacidad de ejecucion en hardware Apple mediante la CLI `mirai` y la libreria `uzu`.

## Casos de uso

- Inferencia local en Mac: ejecutar el modelo en un equipo Apple silicon mediante `brew install mirai` y `mirai --model trymirai/Qwen3.6-27B-L`, aprovechando la cuantizacion de 8 bits para reducir el uso de memoria frente al modelo en bfloat16.
- Desarrollo y prototipado offline: usar el checkpoint para experimentar con generacion de texto sin depender de APIs en la nube, manteniendo la fidelidad respecto al modelo original gracias a la baja divergencia KL declarada.
- Evaluacion de cuantizaciones: servir como referencia para comparar la calidad de un checkpoint de 8 bits frente al modelo base y frente a alternativas GGUF como `UD-Q8_K_XL` de Unsloth.
- Tareas agentivas en local: dado que la evaluacion del autor incluye un 45% de datos agentivos, el modelo es candidato para flujos de agente ejecutados en el propio dispositivo, aunque sin garantias documentadas de tool calling.
- Escenarios de contexto largo: la inclusion de un 30% de datos de contexto largo en la evaluacion sugiere su uso en resumen y analisis de documentos extensos, sujeto a la ventana real del modelo base (no confirmada aqui).
- Investigacion sobre tecnicas de cuantizacion: el uso de transformadas de Hadamard bloque-diagonales lo convierte en un caso de estudio para quienes investigan reduccion de outliers en pesos y activaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor solo aporta una grafica cualitativa de divergencia KL frente al tamano del checkpoint, afirmando que el modelo esta en la frontera de Pareto, y describe la mezcla de evaluacion (45% agentivo, 30% SFT/contexto largo, 25% chat privado) sin cifras asociadas.

## Requisitos de hardware

- VRAM/memoria estimada: el repo ocupa 143,9 GB, aunque el checkpoint de 8 bits para 27,3 mil millones de parametros deberia rondar los 27-30 GB en memoria; la cifra exacta no esta disponible.
- Plataforma soportada: exclusivamente Apple silicon (M1, M2, M3, M4 y sucesores) segun la model card.
- GPU CUDA (A100, H100, RTX 4090): no soportadas actualmente por la libreria `uzu`.
- Cabe en consumer hardware: si, en equipos Apple silicon con memoria unificada suficiente (la cantidad exacta no se especifica).
- Opciones de despliegue: CLI `mirai` (Homebrew) y compilacion desde fuente via el repositorio `trymirai/uzu`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Plataforma |
|---|---|---|---|---|---|
| trymirai/Qwen3.6-27B-L | 27,3 mil millones | 8-bit (uzu) | no disponible | Apache 2.0 | Apple silicon |
| unsloth/Qwen3.6-27B-GGUF (UD-Q8_K_XL) | 27,3 mil millones | 8-bit (GGUF) | no disponible | Apache 2.0 (heredada) | Multiples (llama.cpp y derivados) |
| Qwen/Qwen3.6-27B (base) | 27,3 mil millones | bfloat16 | no disponible | Apache 2.0 | Multiples |

El autor situa explicitamente su checkpoint como comparable al `UD-Q8_K_XL` de Unsloth en nivel de cuantizacion y tamano. La diferencia principal es el ecosistema: `uzu` solo funciona en Apple silicon, mientras que GGUF es portable.

## Limitaciones y advertencias

- Plataforma restringida: solo Apple silicon; no hay soporte para CUDA ni ROCm en la informacion disponible.
- Formato propietario: la libreria `uzu` no es un estandar abierto como GGUF o safetensors convencional, lo que limita la portabilidad.
- Dependencia del modelo base: cualquier sesgo, riesgo de alucinacion o limitacion de contexto o idioma del Qwen3.6-27B original se hereda y no se documenta en esta ficha.
- Perdida de calidad por cuantizacion: aunque el autor declara baja divergencia KL, la cuantizacion de 8 bits introduce degradacion respecto al modelo en bfloat16.
- Falta de benchmarks: no hay resultados numericos publicados que permitan validar las afirmaciones de calidad.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base enlazada por el autor.
- Madurez: 459 descargas y 0 likes en el momento de la consulta; ecosistema joven y con poca validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/trymirai/Qwen3.6-27B-L
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Model card del modelo base: https://huggingface.co/Qwen/Qwen3.6-27B/blob/main/README.md
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-27B/blob/main/LICENSE
- Pagina del modelo en Mirai: https://trymirai.com/local-models/alibaba-qwen3-6-27b-mirai-mirai-l-8
- Blog de cuantizacion de Mirai: https://trymirai.com/blog/quantization
- Repositorio uzu: https://github.com/trymirai/uzu
- Guia de ejecucion de uzu: https://github.com/trymirai/uzu/blob/how-to/docs/how-to-run-uzu.md
- GGUF comparable de Unsloth: https://huggingface.co/unsloth/Qwen3.6-27B-GGUF/blob/main/Qwen3.6-27B-UD-Q8_K_XL.gguf
