# trymirai/Qwen3.5-9B-L

## Resumen

Mirai Qwen3.5-9B-L es una cuantizacion de 8 bits del modelo base Qwen/Qwen3.5-9B, publicada por trymirai (Mirai Labs) bajo licencia Apache 2.0. No se trata de un modelo entrenado desde cero, sino de un checkpoint cuantizado mediante quantizacion post-entrenamiento (PTQ) disenado especificamente para inferencia local eficiente en Apple silicon. El modelo conserva los 9.095.911.424 parametros del original, empaquetados en 8 bits con escalas bfloat16.

El problema que aborda es el coste de memoria y la latencia de ejecutar un modelo de ~9B parametros en hardware de consumo, en particular en equipos Mac con memoria unificada. El autor situa este checkpoint en la frontera de Pareto tamano-divergencia KL, afirmando que no encontro ningun checkpoint mas pequeno con menor divergencia KL respecto al modelo original.

La relevancia actual del modelo es acotada y muy especifica: su libreria de ejecucion (`uzu`) solo soporta inferencia en Apple silicon, lo que lo excluye de facto de despliegues en GPU NVIDIA o en servidores Linux convencionales. Para el resto de plataformas, el modelo base Qwen3.5-9B o cuantizaciones GGUF estandar resultan opciones mas practicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del modelo base Qwen/Qwen3.5-9B; transformer segun la familia Qwen, sin confirmar en la informacion proporcionada) |
| Parametros totales | 9.095.911.424 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit entero simetrico, escalas bfloat16, group size 64 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `uzu`); no se ofrece GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen/Qwen3.5-9B, cuyos detalles no se reproducen en la informacion disponible; la model card remite explicitamente al repositorio original para arquitectura, datos de entrenamiento y evaluaciones. Lo unico documentado en esta ficha es el proceso de cuantizacion: 8 bits enteros simetricos con escalas bfloat16 y tamano de grupo 64, aplicado como quantizacion post-entrenamiento, sin fine-tuning posterior.

La innovacion tecnica declarada es el uso de Block-diagonal Random Hadamard Transforms con tamano de bloque 32 para reducir los valores atipicos (outliers) tanto en activaciones como en pesos, lo que mitiga la perdida de calidad tipica de la cuantizacion a 8 bits. El autor reporta que el checkpoint se situa en la frontera de Pareto tamano-KL, evaluado sobre una mezcla de datos compuesta por un 45% de datos publicos agenticos, un 30% de datos publicos de SFT y contexto largo, y un 25% de datos privados de chat. No se proporcionan cifras absolutas de divergencia KL ni curvas numericas.

## Capacidades

- Generacion de texto: es la unica tarea declarada en el pipeline (`text-generation`).
- Razonamiento y codigo: no confirmado en la informacion disponible; depende de las capacidades heredadas del modelo base Qwen3.5-9B, no documentadas aqui.
- Tool calling / function calling: no confirmado. El conjunto de evaluacion incluye un 45% de datos agenticos, lo que sugiere que el modelo se evaluo en escenarios con herramientas, pero no se documenta soporte explicito.
- Agentes y razonamiento multi-paso: no confirmado; la mezcla de evaluacion agentica es el unico indicio.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.
- Inferencia local en Apple silicon: capacidad operativa confirmada mediante el CLI `mirai`.

## Casos de uso

- Prototipado local en Mac: desarrolladores que quieran probar un modelo de ~9B en un MacBook con memoria unificada sin depender de la nube, instalando `mirai` via Homebrew y ejecutando el checkpoint directamente.
- Asistentes de chat privados: al ejecutarse en local, el modelo permite conversaciones sin enviar datos a terceros, adecuado para entornos con requisitos de privacidad estrictos.
- Evaluacion de cuantizaciones: investigadores que comparen la perdida de calidad de distintas cuantizaciones 8-bit pueden usar este checkpoint como referencia en la frontera tamano-KL declarada por el autor.
- Desarrollo de aplicaciones sobre `uzu`: equipos que construyan sobre la libreria `uzu` y necesiten un checkpoint de referencia de ~9B con licencia permisiva.
- Experimentacion con contexto largo: si se confirma la ventana de contexto del modelo base, el checkpoint serviria para pruebas de resumen y QA sobre documentos largos en local.
- Educacion y demos offline: talleres o demostraciones sin conectividad, donde un modelo Apache 2.0 ejecutable en portatil Apple simplifica la logistica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye una grafica cualitativa de divergencia KL frente a tamano del checkpoint y la afirmacion de que el modelo se encuentra en la frontera de Pareto, sin cifras numericas de MMLU, HumanEval, GSM8K ni metricas equivalentes.

## Requisitos de hardware

- VRAM/memoria estimada: con 9.095.911.424 parametros a 8 bits, los pesos ocupan aproximadamente 9,1 GB, mas escalas bfloat16 (group size 64) y overhead de ejecucion; el repositorio completo ocupa 49,3 GB, lo que sugiere que incluye multiples artefactos ademas de los pesos principales.
- GPU recomendadas: no disponible. La unica plataforma soportada es Apple silicon; no se documenta soporte para A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: no confirmada para NVIDIA ni AMD. En Apple silicon, el requisito es disponer de memoria unificada suficiente para los pesos mas el contexto.
- Opciones de despliegue: CLI `mirai` (Homebrew) y la libreria `uzu`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y el formato safetensors con libreria propia complica su uso en esos motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataformas |
|---|---|---|---|---|---|
| trymirai/Qwen3.5-9B-L | 9.095.911.424 | no disponible | 8-bit (uzu) | Apache 2.0 | Apple silicon (uzu) |
| Qwen/Qwen3.5-9B (base) | ~9B | no disponible | bfloat16 original | Apache 2.0 | Multiples (segun model card original) |
| Cuantizaciones GGUF de la familia Qwen3.5-9B | ~9B | no disponible | 4-8 bit (GGUF) | Apache 2.0 (heredada) | llama.cpp, Ollama, LM Studio |

La comparativa se limita a alternativas de la misma familia porque no se dispone de datos de rendimiento que permitan contrastar con modelos de otros autores. La diferencia practica clave frente al base es el tamano en memoria y la plataforma de ejecucion; frente a GGUF, la diferencia es el ecosistema de herramientas.

## Limitaciones y advertencias

- Plataforma unica: solo se soporta inferencia en Apple silicon mediante `uzu`; no hay soporte documentado para CUDA, ROCm ni CPU generica.
- Perdida de calidad por cuantizacion: aunque el autor la describe como minima, toda cuantizacion 8-bit introduce degradacion respecto al modelo en bfloat16; no se aportan cifras absolutas de KL para cuantificarla.
- Sesgos: no documentados en la informacion disponible; se heredan los del modelo base Qwen3.5-9B, no descritos aqui.
- Alucinacion: no se aportan evaluaciones de factualidad ni tasas de alucinacion.
- Idiomas: no se especifica la cobertura linguistica del modelo base en esta ficha.
- Contexto: se desconoce la longitud de contexto soportada, lo que impide planificar cargas de trabajo con documentos largos.
- Licencia: Apache 2.0 permite uso comercial, pero el enlace de licencia apunta al fichero del modelo base; conviene verificar condiciones adicionales del autor original.
- Madurez: el repositorio tiene 732 descargas y 0 likes, con actualizacion en noviembre de 2026; el ecosistema `uzu`/`mirai` es de nicho y con soporte limitado fuera de macOS.
- Formato propietario: los pesos en safetensors para `uzu` no son directamente cargables en motores estandar, lo que limita la portabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trymirai/Qwen3.5-9B-L
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Model card del base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/README.md
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Pagina del modelo en Mirai: https://trymirai.com/local-models/alibaba-qwen3-5-9b-mirai-mirai-l-8
- Blog de cuantizacion de Mirai: https://trymirai.com/blog/quantization
- Guia de ejecucion de uzu: https://github.com/trymirai/uzu/blob/how-to/docs/how-to-run-uzu.md
