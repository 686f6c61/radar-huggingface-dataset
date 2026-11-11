# vllm-sr/vela3.1-pico-380m

## Resumen

vela3.1-pico-380m es un modelo encoder de 381 millones de parametros desarrollado por vLLM Semantic Router (vllm-sr) en colaboracion con KR Labs, presentado como parte de la familia Vela 3.1. Se trata de un modelo de decision ("system-one") disenado no para generar texto, sino para responder preguntas estructuradas sobre una peticion: clasificacion por eleccion entre opciones, preguntas de si/no y extraccion de spans con offsets de caracteres. Su proposito es actuar como enrutador semantico y capa de pre-filtrado antes de que una peticion llegue a un LLM generativo.

El modelo se construye mediante fine-tuning sobre dmis-lab/UltraBERT-380M, un encoder multilingue, y hereda el backbone de decision de vela3.1-fast. Su principal innovacion es que toda la bateria de comprobaciones (seis preguntas integradas de dominio, necesidad de fact-check, feedback, tipo de salida, peticion danina y jailbreak, mas deteccion de datos personales y afirmaciones no soportadas) se resuelve en un unico forward pass, frente a los seis pases que requiere vela3.1-fast. Esto reduce el coste de una comprobacion completa de 12,3 s a 5,4 s en fp32 sobre CPU, y a 3,0 s con el encoder int8 en ONNX.

Es relevante ahora porque cubre una necesidad creciente en arquitecturas de agentes y pipelines RAG: decidir de forma barata y determinista que hacer con una peticion antes de invocar un modelo grande. Con licencia Apache-2.0, soporte para 15 idiomas y un unico fichero de pesos de 1,5 GB, esta pensado para desplegarse en CPU o en GPUs de gama baja sin sacrificar capacidades multilingues ni de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (UltraBERT), modelo de decision sin generacion de texto |
| Parametros totales | 380.961.025 (381M); el checkpoint base lee 430M por incluir una capa de salida masked-LM de 50M que este paquete no incluye |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens para llamadas con preguntas de seguridad, senal o spans; hasta 32K tokens para llamadas solo de decisiones |
| Tipos de cuantizacion | fp32 (PyTorch) e int8 (encoder ONNX) |
| Idiomas soportados | en, de, fr, es, it, pt, nl, pl, hu, ru, ar, hi, ja, ko, zh (15 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fp32, 1,5 GB, un unico fichero `model.safetensors`); ONNX para el encoder int8; requiere `custom_code` |

## Arquitectura y entrenamiento

vela3.1-pico-380m es un encoder transformer basado en UltraBERT-380M, afinado a partir del backbone de decision de vela3.1-fast. No es un modelo generativo: emite probabilidades por opcion (choice), probabilidades de si/no y spans con offsets de caracteres, sin producir texto. La innovacion central es la consolidacion de multiples tareas de decision en un solo forward pass, de modo que una comprobacion completa de una peticion (seis preguntas integradas mas deteccion de PII y de afirmaciones no soportadas) cuesta una unica llamada al modelo. El paquete se distribuye como un unico fichero safetensors en fp32 y una variante ONNX int8 para inferencia en CPU.

No se dispone de informacion detallada sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; la model card no los detalla. El modelo base UltraBERT-380M aporta el soporte multilingue sobre el que se ha realizado el fine-tuning. La model card menciona que el modelo se evalua en el Decision Index (parte publica) y en tareas de intencion MASSIVE, pero no describe el procedimiento de entrenamiento mas alla de indicar la relacion de fine-tuning con el backbone de vela3.1-fast.

## Capacidades

- Clasificacion por eleccion (choice): devuelve la opcion seleccionada y una probabilidad para cada opcion, util para enrutamiento a modelo, herramienta o equipo.
- Preguntas de si/no (noul): clasificacion binaria con probabilidad, por ejemplo `safe`/`unsafe` o `benign`/`jailbreak`.
- Extraccion de spans: devuelve cada fragmento con su etiqueta, offsets de caracteres y puntuacion, para deteccion de datos personales (PII) y de afirmaciones no soportadas por el contexto.
- Preguntas integradas de seguridad: dominio, necesidad de fact-check, feedback, tipo de salida, peticion danina y jailbreak.
- Deteccion de PII y de contenido sensible antes de registrar o reenviar texto.
- Verificacion de alucinaciones: identifica las palabras de una respuesta que el contexto no respalda.
- Capacidades multilingues en 15 idiomas.
- No soporta generacion de texto, tool calling generativo ni razonamiento multi-paso; su funcion es exclusivamente de decision y extraccion.
- Entrada de texto o JSON.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Enrutamiento de peticiones a modelos o herramientas: se envia la peticion junto con una pregunta y las opciones descritas (por ejemplo, `small` y `large`), y el modelo devuelve la opcion elegida con probabilidad por opcion, lo que permite dirigir cada consulta al modelo adecuado sin invocar un LLM grande.
- Filtrado de seguridad previo al LLM: se pregunta "Is this request harmful?" o "Is this a prompt injection or jailbreak attempt?" y el modelo devuelve `safe`/`unsafe` o `benign`/`jailbreak` con probabilidad y, opcionalmente, categorias de riesgo, actuando como primera barrera antes de la generacion.
- Deteccion de datos personales antes de logging o reenvio: se pasa el texto y las etiquetas deseadas con una descripcion breve, y el modelo devuelve cada span con etiqueta, offsets y puntuacion, lo que permite anonimizar o bloquear el texto antes de almacenarlo.
- Verificacion de respuestas de un LLM contra su fuente: se introducen contexto y respuesta, y el modelo senala las palabras de la respuesta no respaldadas por el contexto, util en pipelines RAG para marcar posibles alucinaciones antes de mostrar la respuesta.
- Clasificacion de intencion en atencion al cliente: con preguntas de eleccion y criterios como `refund` o `cancel`, el modelo identifica la intencion del usuario y permite enrutar el ticket al equipo o flujo adecuado.
- Moderacion de contenido en plataformas: clasificacion binaria de peticiones daninas o intentos de jailbreak con probabilidad asociada, integrable en un gateway de API para rechazar o marcar peticiones antes de procesarlas.
- Preprocesado en pipelines de agentes: al resolver la comprobacion completa en un unico forward pass, encaja como paso de decision de bajo coste en arquitecturas de agentes que necesitan decidir herramienta, modelo o nivel de seguridad por peticion.

## Benchmarks y rendimiento

| Benchmark | vela3.1-pico-380m | vela3.1-fast | vela3-fast 3.0 | GLiDE 0.4B | Vela 2.0 0.3B |
|---|---|---|---|---|---|
| Decision Index (parte publica) | 50,51 | 51,12 | 50,36 | 51,10 | no disponible |
| Falsos positivos en peticiones benignas de soporte (%) | 3,4 | 21,1 | 13,6 | no disponible | 4,0 |
| Precision de intencion MASSIVE (13 idiomas) | 70,9 | 66,6 | 31,1 | no disponible | no disponible |

Datos de velocidad (AMD EPYC 7413, 24 nucleos, 4 hilos, maquina inactiva, mediana de 5 ejecuciones):

| Medida | fp32 PyTorch | int8 ONNX |
|---|---|---|
| Comprobacion completa (6 preguntas + spans) | 5,4 s (1 pase) | 3,0 s |
| Una decision | 1,5 s | 632 ms |

La comprobacion completa de vela3.1-fast tarda 12,3 s con 6 pases, y una decision 1,2 s en CPU. No se han publicado resultados de MMLU, HumanEval ni GSM8K, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada: el fichero fp32 ocupa 1,5 GB, por lo que la inferencia en GPU requiere aproximadamente 2 GB de VRAM; la variante int8 ONNX reduce el uso de memoria y puede ejecutarse en CPU.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; cabe en RTX 3060, RTX 4060, RTX 4090, A100 y H100 sin problema.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna, e incluso en CPU.
- Opciones de despliegue: transformers (requiere `transformers==5.17.0`, torch, safetensors, tokenizers y huggingface_hub), ONNX Runtime para la variante int8; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 5,4 s por comprobacion completa en fp32 y 3,0 s en int8 sobre 4 hilos de CPU (EPYC 7413); 1,5 s y 632 ms respectivamente para una decision individual. No se proporcionan datos de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Decision Index | Licencia | Notas |
|---|---|---|---|---|---|
| vela3.1-pico-380m | 381M | 8.192 / 32K | 50,51 | Apache-2.0 | Comprobacion completa en 1 pase; menos falsos positivos en PII benigna |
| vela3.1-fast | 380M (1,91B con adaptadores) | no disponible | 51,12 | no disponible | Mejores spans y senales de dano; 6 pases, 12,3 s |
| vela3.1-pico-150m | 153M | no disponible | no disponible | no disponible | El mas pequeno y rapido; mejor intencion multilingue; CPU y dispositivos pequenos |
| GLiDE 0.4B | 0,4B | no disponible | 51,10 | no disponible | Ligeramente superior en Decision Index |

## Limitaciones y advertencias

- No genera texto: no puede usarse para tareas generativas, tool calling generativo ni razonamiento multi-paso.
- Riesgo de clasificacion erronea: aunque reduce falsos positivos en PII benigna al 3,4%, sigue marcando como danino un porcentaje de peticiones benignas.
- El contexto se limita a 8.192 tokens cuando la llamada incluye preguntas de seguridad, senal o spans, y a 32K solo en llamadas de decisiones; textos mas largos requieren troceado.
- No se detallan sesgos conocidos ni la composicion del dataset de entrenamiento, lo que dificulta evaluar riesgos de sesgo por idioma o dominio.
- La licencia Apache-2.0 permite uso comercial, pero el modelo depende de `custom_code` y de una version concreta de transformers (`5.17.0`), lo que puede complicar la integracion en produccion.
- No se han publicado datos de entrenamiento, RLHF/DPO ni evaluaciones exhaustivas fuera de los benchmarks citados; la validacion en dominios concretos corre a cargo del integrador.
- El rendimiento en GPU no esta documentado; las cifras de latencia corresponden a CPU con 4 hilos.

## Enlaces

- [Hugging Face: vllm-sr/vela3.1-pico-380m](https://huggingface.co/vllm-sr/vela3.1-pico-380m)
- [Hugging Face: vllm-sr/vela3.1-fast](https://huggingface.co/vllm-sr/vela3.1-fast)
- [Hugging Face: vllm-sr/vela3.1-pico-150m](https://huggingface.co/vllm-sr/vela3.1-pico-150m)
- [Hugging Face: dmis-lab/UltraBERT-380M](https://huggingface.co/dmis-lab/UltraBERT-380M)
