# trymirai/Qwen3.5-9B-M

## Resumen

Mirai's Qwen3.5-9B Medium Quantization es una cuantizacion de 4 bits del modelo base Qwen/Qwen3.5-9B, desarrollada por Mirai Labs (cuenta trymirai) y publicada bajo licencia Apache 2.0. Su objetivo es reducir el coste de memoria y el ancho de banda necesario para la inferencia local del modelo original sin degradar de forma significativa la calidad, empleando una combinacion de cuantizacion post-entrenamiento y destilacion consciente de cuantizacion.

El checkpoint almacena 4.899.313.664 parametros en formato safetensors y ocupa 29,0 GB en el repositorio, lo que refleja que se distribuyen varias precisiones (4-bit y 8-bit) junto con escalas en bfloat16. La libreria de referencia es `uzu`, un runtime propio de Mirai orientado especificamente a inferencia en Apple silicon, con un CLI distribuido via Homebrew.

La relevancia del modelo radica en su enfoque de despliegue local en hardware de consumo Apple (chips M-series), un nicho donde las alternativas de cuantizacion convencionales (GGUF, AWQ) no siempre explotan las caracteristicas del hardware. No obstante, la informacion publica disponible es limitada: no se detallan la longitud de contexto, los idiomas soportados ni resultados de benchmarks numericos, y el soporte de inferencia esta restringido a macOS sobre Apple silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-9B; detalles no disponibles en la informacion proporcionada) |
| Parametros totales | 4.899.313.664 (segun safetensors); el modelo base se denomina 9B |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit asimetrica con zero points de 4 bits, escalas bfloat16 y group size 32; el repositorio incluye tambien pesos de 8-bit |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `uzu`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer Qwen3.5-9B de Alibaba; la model card no reproduce los detalles del modelo original (numero de capas, dimension oculta, mecanismo de atencion ni contexto maximo), remitiendo a la model card de Qwen para esa informacion. La innovacion propia de esta publicacion esta en el proceso de cuantizacion: se aplica cuantizacion entera asimetrica de 4 bits con zero points de 4 bits, escalas en bfloat16 y tamano de grupo 32, complementada con Block-diagonal Random Hadamard Transforms para reducir los valores atipicos en activaciones y pesos, un problema clasico que degrada la calidad en cuantizaciones agresivas.

El pipeline de preparacion combina cuantizacion post-entrenamiento (PTQ) con destilacion consciente de cuantizacion (QAD), de modo que el checkpoint cuantizado se ajusta para aproximar la distribucion del modelo original en lugar de limitarse a redondear pesos. La evaluacion de la divergencia KL se realizo sobre una mezcla de datos compuesta por un 45% de datos agenticos publicos, un 30% de datos publicos de SFT y contexto largo, y un 25% de datos privados de chat. No se especifican el volumen de tokens de entrenamiento original ni si el modelo base incorpora RLHF o DPO.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base Qwen3.5-9B.
- Razonamiento y matematicas: capacidades propias del modelo base, no verificadas de forma independiente en esta cuantizacion.
- Generacion de codigo: no se documentan evaluaciones especificas en la model card.
- Tool calling y function calling: no se documenta explicitamente, aunque la mezcla de evaluacion incluye un 45% de datos agenticos, lo que sugiere preservacion de capacidades de agente.
- Razonamiento multi-paso y flujos agenticos: la composicion del conjunto de evaluacion (datos agenticos y de contexto largo) apunta a que estas capacidades se han tenido en cuenta durante la cuantizacion.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada.
- Inferencia local optimizada para Apple silicon mediante el runtime `uzu`.

## Casos de uso

- Asistentes de desarrollo en local sobre Mac: el modelo puede ejecutarse en un portatil o sobremesa con chip Apple M-series mediante el CLI `mirai`, lo que permite autocompletado y generacion de codigo sin enviar datos a la nube.
- Prototipado de agentes con tool calling: gracias a la preservacion de capacidades agenticas durante la cuantizacion, es adecuado para construir pipelines de agentes que invocan herramientas locales en un entorno de desarrollo controlado.
- Procesamiento de documentos largos en local: el componente de contexto largo presente en la mezcla de evaluacion sugiere utilidad para resumir y consultar documentos extensos, siempre que se confirme la ventana de contexto efectiva del modelo base.
- Chat de asistencia sin conexion: despliegue de un asistente conversacional en equipos macOS de una organizacion con requisitos de privacidad estrictos, aprovechando que los pesos residen y se ejecutan en el dispositivo.
- Investigacion sobre cuantizacion: el checkpoint sirve como referencia para estudiar el impacto de Hadamard Transforms y QAD en la calidad de modelos de ~9B, con la metrica de divergencia KL publicada frente al tamano del checkpoint.
- Evaluacion comparativa de runtimes: util para medir throughput y latencia de `uzu` frente a otras soluciones de inferencia local en Apple silicon con un modelo de tamano medio.
- Educacion y experimentacion: al ser Apache 2.0, permite su uso en cursos y proyectos academicos sin restricciones de licencia adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye una grafica de divergencia KL frente al tamano del checkpoint (assets/kl-vs-size.svg), sin valores numericos en el texto, y no se proporcionan resultados de MMLU, HumanEval, GSM8K ni de evaluaciones comparables.

## Requisitos de hardware

- VRAM o memoria unificada estimada: el repositorio ocupa 29,0 GB, pero la inferencia en 4 bits con group size 32 sobre 4.899.313.664 parametros requiere del orden de 2,5-3 GB solo para pesos, mas escalas, zero points y cache KV; el consumo real depende de la ventana de contexto y del runtime. Cifra exacta no disponible.
- GPU recomendadas: el unico backend soportado oficialmente es Apple silicon (chips M-series con memoria unificada); no se documenta soporte para A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: si, en equipos Apple con memoria unificada suficiente; no se confirma compatibilidad con GPUs NVIDIA de consumo.
- Opciones de despliegue: CLI `mirai` instalado via Homebrew, o compilacion desde el repositorio `trymirai/uzu` en GitHub. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Despliegue |
|---|---|---|---|---|---|
| trymirai/Qwen3.5-9B-M | 4.899.313.664 almacenados (base 9B) | no disponible | 4-bit y 8-bit, runtime `uzu` | Apache 2.0 | Solo Apple silicon |
| Qwen/Qwen3.5-9B (modelo base) | 9B (nominal) | no disponible | Full precision / estandar | Apache 2.0 | Multiples runtimes |
| Cuantizaciones GGUF de Qwen3.5-9B | 9B (nominal) | no disponible | Q4_K_M, Q5_K_M, Q8_0, etc. | Apache 2.0 | llama.cpp, Ollama, LM Studio |
| Cuantizaciones AWQ/GPTQ de Qwen3.5-9B | 9B (nominal) | no disponible | 4-bit AWQ/GPTQ | Apache 2.0 | vLLM, TGI, ExLlama |

La comparativa se limita a caracteristicas estructurales: no hay datos publicos de rendimiento en la informacion disponible que permitan contrastar calidad frente a las alternativas GGUF o AWQ del mismo modelo base.

## Limitaciones y advertencias

- La cuantizacion a 4 bits introduce perdida de calidad respecto al modelo original; la unica metrica publicada es la divergencia KL, sin resultados de tareas downstream.
- El soporte de inferencia esta restringido a Apple silicon mediante el runtime `uzu`; no hay backend oficial para CUDA, ROCm ni CPU generica, lo que limita su uso en servidores.
- No se documentan los idiomas soportados; el comportamiento multilingue puede diferir del modelo base y no ha sido verificado.
- No se especifica la longitud de contexto efectiva tras la cuantizacion, un factor critico para casos de uso con documentos largos.
- Riesgo de alucinacion inherente al modelo base, no cuantificado en esta publicacion.
- Sesgos conocidos: no documentados en la model card; se heredan los del modelo base Qwen3.5-9B, no evaluados aqui.
- La licencia Apache 2.0 permite uso comercial, pero el autor remite a la licencia del modelo base para cualquier condicion adicional.
- El repositorio incluye pesos en 4-bit y 8-bit (tag `8-bit`), lo que explica un tamano de 29,0 GB muy superior al de una unica cuantizacion de 4 bits; conviene verificar que variante se descarga.
- La model card incluye una grafica de evaluacion sin ejes numericos en el texto, lo que impide reproducir las cifras de divergencia KL.
- El modelo se publico en agosto de 2026 y se actualizo en noviembre de 2026; no hay historial de versiones documentado en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trymirai/Qwen3.5-9B-M
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Model card del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/README.md
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Pagina del producto en Mirai: https://trymirai.com/local-models/alibaba-qwen3-5-9b-mirai-mirai-m-4
- Blog de cuantizacion de Mirai: https://trymirai.com/blog/quantization
- Repositorio del runtime uzu: https://github.com/trymirai/uzu
- Guia de compilacion de uzu: https://github.com/trymirai/uzu/blob/how-to/docs/how-to-run-uzu.md
