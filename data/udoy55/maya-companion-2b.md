# udoy55/Maya-Companion-2B

## Resumen

Maya-Companion-2B es un adaptador LoRA de caracter experimental publicado por el usuario udoy55 en Hugging Face, disenado para convertir el modelo base Qwen/Qwen3.5-2B en un personaje conversacional de mensajeria de texto con tono calido y jugueton, orientado a un publico adulto y de ficcion. No se trata de un modelo completo, sino de un conjunto de pesos PEFT que debe cargarse sobre el checkpoint Qwen3.5-2B (revision `15852e8c16360a2fea060d615a32b45270f8a8fc`) para funcionar.

El modelo resuelve un problema muy acotado: dotar a una aplicacion local de chat de una personalidad consistente y reconocible, con respuestas breves (una a tres frases) y mencion explicita de su naturaleza ficticia cuando se le pregunta. Su relevancia es limitada y de nicho: se trata de un experimento de ajuste fino con un conjunto de datos muy pequeno (12 demostraciones originales con cuatro variaciones de prompt, dos epocas), entrenado en una unica GPU de consumo (RTX 4070 SUPER) con un pico de asignacion CUDA de 4,77 GiB.

El adaptador tiene 1.881.825.088 parametros segun los safetensors del repositorio (coincidiendo practicamente con el tamano del modelo base, ya que PEFT puede almacenar pesos completos o fusionados en funcion del formato), un tamano de repositorio de 1,3 GB y licencia Apache 2.0. No se declaran idiomas soportados ni resultados de benchmarks. Es, por tanto, una pieza de demostracion tecnica mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5-2B; arquitectura del adaptador no detallada |
| Parametros totales | 1.881.825.088 (safetensors del repositorio) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-2B, no declarada) |
| Tipos de cuantizacion | GGUF incluido en el repositorio; niveles concretos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) y GGUF |

## Arquitectura y entrenamiento

El adaptador se apoya en Qwen3.5-2B, un transformer de aproximadamente 2.000 millones de parametros del que no se detallan en la informacion disponible ni la arquitectura interna (atencion, capas, cabezas) ni la composicion del corpus de preentrenamiento. Sobre esa base se aplica un ajuste LoRA mediante la libreria PEFT, con un entrenamiento descrito por el autor como experimental: 12 demostraciones originales, cuatro variaciones de prompt por demostracion, dos epocas, ejecutado en una RTX 4070 SUPER con un pico de memoria CUDA de 4,77 GiB.

No se documenta el rango del adaptador, el alpha, las capas objetivo ni la tasa de aprendizaje. Tampoco hay indicios de RLHF, DPO ni de una fase de alineacion adicional; el comportamiento se define principalmente mediante un system prompt sugerido por el autor. La innovacion tecnica es practicamente nula: se trata de un ajuste de estilo conversacional de bajo coste computacional, con validacion mediante cuatro prompts de humo ("smoke tests") que se mantuvieron aparte del entrenamiento.

## Capacidades

- Generacion de texto conversacional breve: respuestas de una a tres frases con tono calido y jugueton.
- Interpretacion de personaje: mantiene la identidad de "Maya", companera ficticia de mensajeria para adultos, y declara su naturaleza ficticia cuando se le pregunta.
- Respuestas a mensajes cotidianos y de pequena charla (retrasos de tren, peticiones de saludo, solicitudes de espacio personal).
- Soporte de system prompt para fijar el rol y el estilo.
- Compatibilidad con endpoints (tag `endpoints_compatible`) para su despliegue mediante infraestructura de inferencia estandar.
- Capacidades de razonamiento, codigo, matematicas, vision, audio, tool calling, function calling y agentes multi-paso: no disponibles de forma especifica en este adaptador; dependen del modelo base y no estan documentadas.
- Capacidades multilingues: no declaradas.

## Casos de uso

- Prototipo de companero conversacional en aplicacion local: el adaptador se carga sobre Qwen3.5-2B en la app del autor, que aporta retratos generados por IA y mensajes programados ("check-ins") mientras la pestana de chat esta abierta; el modelo aporta el estilo de respuesta.
- Prueba de concepto de ajuste de personalidad con LoRA: util para desarrolladores que quieran evaluar como un conjunto minimo de 12 demostraciones modifica el tono de un modelo de 2B, con un coste de entrenamiento de menos de 5 GiB de VRAM.
- Chat de acompanamiento de bajo coste en hardware de consumo: al partir de un modelo de 2B y ofrecer pesos GGUF, puede ejecutarse en equipos con GPU modesta o incluso en CPU, sin depender de APIs externas.
- Evaluacion de tecnicas de prompting de personaje: el system prompt sugerido sirve como referencia para comparar variantes de instrucciones de rol en modelos pequenos.
- Demostracion educativa de PEFT y de validacion con smoke tests: el repositorio documenta el proceso de entrenamiento y los prompts de prueba, lo que lo hace util como ejemplo didactico de ajuste fino experimental.
- Base para experimentos de estilo conversacional en espanol u otros idiomas: aunque no se declaran idiomas, el modelo base puede adaptarse con nuevos datos; el adaptador actual no esta validado para ello.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta cuatro pruebas de humo cualitativas con prompts retenidos del entrenamiento, sin metricas cuantitativas ni comparacion con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo base de aproximadamente 2.000 millones de parametros en precision de 16 bits requiere del orden de 4-6 GiB de VRAM, y en cuantizaciones de 4 bits puede situarse en torno a 1,5-2,5 GiB; estas cifras no las proporciona el autor.
- Entrenamiento reportado: RTX 4070 SUPER con pico de asignacion CUDA de 4,77 GiB.
- GPU recomendadas: no disponibles. Por tamano, el modelo base es apto para GPUs de consumo como RTX 3060, RTX 4060, RTX 4070 o superiores; no se confirma compatibilidad con A100, H100 ni otras GPU de centro de datos.
- Cabe en GPU de consumo: si, segun el tamano del modelo base, aunque no hay validacion oficial del adaptador en esos entornos.
- Opciones de despliegue: la libreria declarada es PEFT; el repositorio incluye GGUF, lo que permite su uso con llama.cpp u Ollama. El tag `endpoints_compatible` sugiere despliegue mediante endpoints gestionados. No se documenta compatibilidad con vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Maya-Companion-2B | 1,88 mil millones (adaptador sobre Qwen3.5-2B) | no disponible | Apache 2.0 | Hugging Face, 145 descargas, 0 likes | Adaptador LoRA experimental de personaje; sin benchmarks |
| Qwen3.5-2B (modelo base) | ~2 mil millones | no disponible | no disponible en la informacion | Hugging Face | Base generalista sobre la que se aplica el adaptador |
| Alternativas de personaje de 2B | no disponible | no disponible | no disponible | no disponible | No se dispone de informacion sobre adaptadores comparables en la busqueda realizada |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con otros adaptadores de personaje o modelos conversacionales de tamano similar.

## Limitaciones y advertencias

- Entrenamiento extremadamente limitado: 12 demostraciones y dos epocas; el comportamiento puede degradarse fuera de los patrones vistos y no hay validacion sistematica.
- Riesgo alto de alucinacion y de inconsistencia de personaje, especialmente en conversaciones largas o temas no cubiertos por las demostraciones.
- No se declaran idiomas soportados; el rendimiento en castellano no esta garantizado ni evaluado.
- Longitud de contexto no documentada; no debe asumirse la del modelo base sin verificacion.
- Contenido orientado a adultos y a ficcion: requiere control de edad y moderacion si se despliega en productos reales.
- El adaptador depende de una revision concreta del modelo base (`15852e8c16360a2fea060d615a32b45270f8a8fc`); cambios en el checkpoint upstream pueden romper la compatibilidad.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el estado "experimental" del modelo desaconseja su uso en produccion sin evaluacion propia.
- El repositorio tiene 145 descargas y 0 likes, lo que indica una validacion comunitaria practicamente nula.
- La aplicacion del autor es necesaria para funciones como retratos y mensajes programados; el adaptador por si solo no las proporciona.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/udoy55/Maya-Companion-2B
- Modelo base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Libreria PEFT: https://github.com/huggingface/peft
- No se han encontrado en la busqueda web papers, blogs, repositorios o demos adicionales asociados a este modelo.
