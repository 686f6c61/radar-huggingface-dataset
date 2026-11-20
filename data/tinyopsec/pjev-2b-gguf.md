# tinyopsec/pjev-2b-GGUF

## Resumen

pjev-2b-GGUF es la distribucion en formato GGUF del modelo Kailune-AI/pjev-2b, un modelo de decision tipada de aproximadamente 2.500 millones de parametros construido sobre la arquitectura Llama de openbmb/MiniCPM5-2B. A diferencia de un modelo conversacional al uso, pjev-2b no genera texto libre: recibe un conjunto fijo de opciones y devuelve probabilidades calibradas sobre cada una de ellas, lo que lo convierte en una pieza especializada para clasificacion y enrutamiento dentro de pipelines automatizados.

El modelo lo publica tinyopsec, que se limita a producir las cuantizaciones GGUF con llama.cpp a partir de los pesos originales de Kailune-AI. El repositorio ofrece trece variantes de cuantizacion, desde F16 (5,0 GB) hasta Q2_K, lo que permite desplegarlo en hardware muy modesto, incluso en CPU, sin depender de GPU dedicada.

Su relevancia actual radica en el nicho que ocupa: con 2,5B parametros y licencia Apache 2.0, es una alternativa ligera y permisiva para tareas de decision estructurada (clasificacion de intenciones, enrutamiento de consultas, seleccion entre alternativas) donde un LLM generativo grande seria sobredimensionado y costoso. No obstante, su model card advierte explicitamente de que no es un modelo de chat de proposito general y debe evaluarse antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (base openbmb/MiniCPM5-2B) |
| Parametros totales | 2.516.756.480 (~2,5B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (generado con llama.cpp) |

## Arquitectura y entrenamiento

pjev-2b se apoya en la arquitectura Llama de MiniCPM5-2B, un transformer denso de aproximadamente 2,5B parametros. El autor lo describe como un modelo de decision tipada: en lugar de producir texto autoregresivo libre, devuelve probabilidades calibradas sobre un conjunto fijo de opciones que el usuario proporciona en la entrada. Esta especializacion sugiere un ajuste fino orientado a la clasificacion y seleccion entre alternativas, aunque la informacion disponible no detalla la composicion del dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas de RLHF o DPO.

No se dispone de informacion sobre innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, modos de pensamiento) ni sobre la longitud de contexto nativa del modelo base. La unica informacion tecnica concreta del repositorio es que las cuantizaciones se generaron con llama.cpp a partir de los pesos originales de Kailune-AI/pjev-2b.

## Capacidades

- Decision tipada: devuelve probabilidades calibradas sobre un conjunto fijo de opciones suministradas por el usuario, en lugar de texto libre.
- Clasificacion y enrutamiento: adecuado para seleccionar entre alternativas predefinidas (intenciones, categorias, rutas de pipeline).
- Inferencia en CPU y hardware modesto gracias al formato GGUF y al reducido tamano del modelo.
- Compatibilidad con runtimes GGUF: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF.
- Integracion via API: la etiqueta endpoints_compatible indica compatibilidad con endpoints de inferencia.
- Generacion de texto: el pipeline declarado es text-generation, aunque la model card insiste en que no es un modelo conversacional de proposito general.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas soportados).
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Clasificacion de intenciones en atencion al cliente: el modelo recibe la consulta del usuario junto con un conjunto fijo de intenciones predefinidas y devuelve la probabilidad de cada una, permitiendo enrutar el ticket al departamento adecuado con un umbral de confianza configurable.
- Enrutamiento de consultas en pipelines RAG: antes de recuperar documentos, pjev-2b puede decidir entre categorias de consulta (tecnica, comercial, soporte) usando sus probabilidades calibradas, lo que permite dirigir la busqueda al indice correcto.
- Moderacion y filtrado de contenido: dado un texto y un conjunto de etiquetas de politica (permitido, spam, ofensivo, etc.), el modelo devuelve la distribucion de probabilidad sobre cada etiqueta, sirviendo como primera capa de triaje automatizado.
- Seleccion entre alternativas generadas: en un pipeline donde varios modelos o prompts producen respuestas candidatas, pjev-2b puede puntuar cual es la mas adecuada segun criterios definidos como opciones, actuando como juez ligero.
- Despliegue en edge y entornos sin GPU: gracias a las cuantizaciones Q4_K_M y Q2_K, el modelo puede ejecutarse en CPU en servidores modestos o dispositivos con recursos limitados, cubriendo tareas de decision donde un LLM grande no cabe.
- Automatizacion de triaje en CI/CD o sistemas de tickets: clasificar automaticamente la severidad o el tipo de incidencia (bug, feature, pregunta) con probabilidades calibradas que permiten priorizar colas de trabajo.
- Experimentacion e investigacion: al ser Apache 2.0 y de pequeno tamano, sirve como banco de pruebas para estudiar calibracion de probabilidades y decisiones tipadas sin coste de infraestructura elevado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: F16 requiere aproximadamente 5,0 GB (dato de la model card); Q8_0 y Q6_K en torno a 2,7-2,0 GB; Q4_K_M (recomendado) aproximadamente 1,5-1,7 GB; Q2_K aproximadamente 1,0 GB. Estas cifras son estimaciones a partir del tamano de los pesos y no incluyen el overhead del contexto KV cache.
- GPU recomendadas: cualquier GPU consumer con 2 GB o mas de VRAM puede ejecutar las cuantizaciones Q4 o superiores; RTX 3060, RTX 4060, RTX 4090 o A100/H100 son sobradamente suficientes. El modelo esta pensado para funcionar incluso sin GPU.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer modernas, e incluso en CPU gracias a las cuantizaciones de 2 a 5 bits.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. La etiqueta endpoints_compatible sugiere integracion con endpoints de inferencia.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| pjev-2b-GGUF (este) | ~2,5B | No disponible | GGUF | Apache 2.0 | Decision tipada con probabilidades calibradas |
| openbmb/MiniCPM5-2B (base) | ~2,5B | No disponible | Safetensors (original) | No disponible | LLM generativo de proposito general |
| Kailune-AI/pjev-2b (original) | ~2,5B | No disponible | Safetensors | Apache 2.0 | Decision tipada (pesos sin cuantizar) |
| LLM generativos de ~2-3B (familia generica) | ~2-3B | Variable | Variable | Variable | Chat y generacion de texto general |

La comparativa con alternativas de la misma categoria es limitada: pjev-2b no compite con modelos conversacionales de proposito general, sino con clasificadores especializados y modelos de enrutamiento. No se dispone de datos de rendimiento de terceros para establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- No es un modelo de chat de proposito general: la model card lo advierte explicitamente; usarlo para conversacion libre produce resultados fuera de su diseno.
- Depende de las opciones suministradas: la calidad de la decision esta acotada por el conjunto de opciones que el usuario define; opciones mal formuladas o ambiguas degradan la salida.
- Riesgo de calibracion insuficiente: aunque se declara calibrado, no hay benchmarks publicados que verifiquen la calibracion en dominios concretos; es imprescindible evaluarlo con datos propios antes de produccion.
- Riesgo de alucinacion: no disponible como dato explicito, pero al ser un modelo pequeno y especializado, no debe asumirse robustez fuera de su dominio de entrenamiento.
- Sesgos conocidos: no disponible; no se documentan sesgos ni composicion del dataset de entrenamiento.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan documentados, lo que impide garantizar comportamiento multilingue o entradas largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion; conviene conservar los avisos de licencia y verificar la licencia del modelo base MiniCPM5-2B.
- Caveat de produccion: la model card recomienda evaluar antes de usar; al no haber benchmarks ni documentacion de entrenamiento, la validacion empirica en el caso de uso concreto es obligatoria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tinyopsec/pjev-2b-GGUF
- Modelo base (pesos originales): https://huggingface.co/Kailune-AI/pjev-2b
- Modelo base de arquitectura: https://huggingface.co/openbmb/MiniCPM5-2B
- llama.cpp (runtime de cuantizacion e inferencia): https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- No se han encontrado papers, blogs o demos adicionales en la informacion disponible.
