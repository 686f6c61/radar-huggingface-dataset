# syedasumayya1/forgegpt-12m

## Resumen

ForgeGPT-12M es un modelo de lenguaje tipo GPT de 12,2 millones de parametros entrenado desde cero en PyTorch por el usuario syedasumayya1. No se trata de un modelo de proposito general ni de un derivado de una familia conocida: es una implementacion propia que incluye tokenizador BPE entrenado especificamente para el corpus, embeddings posicionales rotatorios (RoPE), normalizacion RMSNorm, capas MLP con activacion SwiGLU y cache KV para la generacion autoregresiva. El entrenamiento se realizo sobre TinyStories durante 5000 pasos en una GPU T4 gratuita de Google Colab.

El checkpoint publicado corresponde al paso 4500, con una perdida de validacion de 1,615 (perplejidad 5,03). El propio autor advierte en la model card de que el modelo solo redacta cuentos infantiles sencillos y no puede responder preguntas, lo que lo situa en la categoria de modelos de investigacion educativa y experimentacion con arquitecturas, no en la de asistentes utilizables en produccion.

Su relevancia actual es acotada pero clara: sirve como referencia reproducible de un pipeline completo de entrenamiento from-scratch (tokenizador, arquitectura, bucle de entrenamiento y generacion con KV-cache) a un coste de computo minimo, y como linea base de juguete frente a los modelos de la familia TinyStories publicados por otros autores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT (RoPE, RMSNorm, SwiGLU, KV-cache) |
| Parametros totales | 12,2 millones (12.2M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; el ejemplo de uso limita la generacion a 150 tokens nuevos |
| Tipos de cuantizacion | No disponible (no se publican versiones cuantizadas) |
| Idiomas soportados | No disponible en la model card; el corpus TinyStories es en ingles, por lo que el uso real se limita a ese idioma |
| Licencia | MIT |
| Formato de pesos | Checkpoint de PyTorch (`pytorch_model.pt`, `state_dict`), acompanado de `config.json` y `tokenizer.json` |
| Tokenizador | BPE propio, entrenado por el autor (`tokenizer.json`) |
| Tamano del repositorio | 0,0 GB (segun HuggingFace) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-10 |
| Ultima actualizacion | 2026-10-10 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de estilo GPT con varias decisiones de diseno modernas. Emplea embeddings posicionales rotatorios (RoPE) en lugar de embeddings posicionales aprendidos, normalizacion RMSNorm en lugar de LayerNorm, y una MLP con activacion SwiGLU en lugar de GELU. La inferencia utiliza cache KV, tal como se refleja en la funcion `generate` incluida en el repositorio. No hay indicios de atencion lineal, decodificacion especulativa ni componentes de tipo SSM o hibridos: es un transformer denso convencional.

No hay informacion publicada sobre el numero exacto de capas, dimension de modelo, numero de cabezas de atencion, dimension de la ventana de contexto ni tamano del vocabulario; esos datos estarian presumiblemente en el `config.json` del repositorio, que no se detalla en la model card. El entrenamiento se realizo sobre el corpus TinyStories (cuentos infantiles en ingles) durante 5000 pasos en una T4 de Colab, con checkpoint final publicado en el paso 4500 y perdida de validacion de 1,615. No se menciona ningun tipo de ajuste posterior: no hay RLHF, DPO, SFT ni alineacion de instrucciones. El modelo es, por tanto, un modelo base de lenguaje sin post-entrenamiento.

## Capacidades

- Generacion de texto narrativo simple en ingles: cuentos infantiles cortos con vocabulario y estructuras gramaticales sencillas, el dominio exacto de TinyStories.
- Continuacion de prefijos: acepta una frase inicial (por ejemplo, "Once upon a time, there was a little dog named Max.") y la continua hasta el limite de tokens nuevos indicado.
- Generacion autoregresiva con cache KV, lo que reduce el coste de computo por token en secuencias largas dentro de su ventana de contexto.
- Muestreo configurable por temperatura en la funcion de generacion incluida.
- No soporta tool calling ni function calling.
- No soporta uso como agente ni razonamiento multi-paso.
- No es multilingue de forma demostrada; el corpus de entrenamiento es en ingles.
- No dispone de modo "thinking", vision, audio ni ninguna modalidad adicional.
- No puede responder preguntas: el propio autor lo indica explicitamente en la model card.

## Casos de uso

- Docencia y aprendizaje de arquitecturas transformer: el repositorio incluye codigo de configuracion, modelo y generacion, lo que permite estudiar de forma completa como se implementan RoPE, RMSNorm, SwiGLU y la cache KV en un modelo funcional de 12,2 M de parametros.
- Pruebas de humo (smoke tests) de pipelines de inferencia: al ser un checkpoint de ~49 MB en fp32, se puede cargar y ejecutar en segundos para verificar que un entorno de ejecucion, un servidor o un script de despliegue funcionan antes de pasar a modelos grandes.
- Generacion de datos sinteticos para experimentos de aumento de datos: se pueden producir grandes volumenes de cuentos infantiles sencillos para tareas auxiliares como entrenar un tokenizador, ajustar heuristicas de filtrado o probar clasificadores de texto.
- Ablaciones y estudios controlados de tecnicas de arquitectura: con este modelo se puede entrenar en una T4 gratuita una variante sin RoPE, sin SwiGLU o sin RMSNorm y comparar la perdida de validacion contra el checkpoint de referencia (1,615 en el paso 4500).
- Prototipado de inferencia en CPU o dispositivos sin GPU: el tamano del modelo permite ejecucion en CPU con latencias de milisegundos por token, util para demostraciones offline o entornos embebidos de bajo consumo.
- Educacion en generacion de texto para publico no tecnico: la restriccion del dominio a cuentos infantiles facilita demostraciones donde el fallo del modelo es evidente y predecible, sin riesgo de respuestas plausibles pero incorrectas en dominios sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de evaluacion aportado por el autor es la perdida de validacion del checkpoint publicado:

| Metrica | Valor |
|---|---|
| Paso del checkpoint | 4500 |
| Pasos totales de entrenamiento | 5000 |
| Perdida de validacion | 1,615 |
| Perplejidad | 5,03 |
| Hardware de entrenamiento | GPU T4 gratuita de Google Colab |
| Dataset | TinyStories |

No hay datos de comparacion con otros modelos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 49 MB en fp32 (12,2 M de parametros x 4 bytes), alrededor de 25 MB en fp16 o bf16 y unos 12 MB en int8 si se cuantiza manualmente. A ello hay que sumar el estado de la cache KV y las activaciones, marginales a esta escala.
- GPU recomendadas: cualquier GPU es suficiente; el modelo se entreno en una T4, y una RTX 4090, A100 o H100 lo ejecutarian con un uso de memoria despreciable. No tiene sentido reservar GPU dedicada para el.
- Compatibilidad con GPU de consumo: cabe sobradamente en cualquier GPU de consumo, incluidos modelos antiguos con 4 GB de VRAM, y tambien en CPU sin dificultad.
- Opciones de despliegue: unicamente carga nativa en PyTorch con el codigo del repositorio (`forgegpt.model`, `forgegpt.generate`). No hay versiones GGUF para llama.cpp ni Ollama, ni integracion con vLLM o TGI, y para estos tamanos esos servidores no aportarian ventaja practica.
- Latencia y throughput estimados: no disponible (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ForgeGPT-12M | 12,2 M | No disponible | TinyStories, 5000 pasos, propio | MIT | Pesos PyTorch en HuggingFace |
| roneneldan/TinyStories-33M | 33 M | No disponible | TinyStories (familia de referencia del dataset) | No disponible en la informacion proporcionada | Pesos en HuggingFace |
| roneneldan/TinyStories-1M | 1 M | No disponible | TinyStories | No disponible en la informacion proporcionada | Pesos en HuggingFace |
| openai-community/gpt2 (small) | 124 M | 1024 tokens | WebText, corpus web general | No disponible en la informacion proporcionada | Pesos en HuggingFace |

No se dispone de resultados de benchmarks comparativos verificados en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto, corpus de entrenamiento y licencia. Cualquier afirmacion sobre calidad relativa entre estos modelos requeriria una evaluacion propia sobre el mismo conjunto de validacion de TinyStories.

## Limitaciones y advertencias

- Capacidad muy restringida: con 12,2 M de parametros y solo 5000 pasos de entrenamiento, el modelo no adquiere conocimiento factual ni capacidad de razonamiento; el propio autor indica que solo escribe cuentos infantiles simples.
- No responde preguntas ni sigue instrucciones: es un modelo base sin SFT ni alineacion, por lo que no debe integrarse en interfaces conversacionales esperando comportamiento de asistente.
- Sesgos conocidos: no hay documentacion al respecto en la model card. Al derivar de un corpus de cuentos infantiles en ingles, es probable que reproduzca los estereotipos presentes en ese tipo de texto, pero no se han realizado evaluaciones de sesgo.
- Riesgo de alucinacion: no aplica en el sentido habitual (el modelo no afirma hechos), pero si genera texto incoherente o sin sentido cuando se aleja del dominio de TinyStories.
- Limitacion de idioma: no hay evidencia de competencia multilingue; el entrenamiento es en ingles y la model card no declara idiomas soportados.
- Longitud de contexto: no documentada. Ejecutar el modelo con secuencias mas largas de las usadas en entrenamiento puede degradar la coherencia de forma abrupta.
- Ausencia de filtros de seguridad: al no tener post-entrenamiento ni moderacion, puede generar contenido inapropiado si se le da un prefijo que lo induzca.
- Licencia: MIT, lo que permite uso comercial, modificacion y redistribucion con atribucion. La licencia permisiva no implica que el modelo sea apto para produccion; la limitacion es de capacidad, no legal.
- Ausencia de mantenimiento: el repositorio no tiene descargas ni likes, y no hay garantia de soporte, actualizaciones o correccion de errores.
- Advertencia de integracion: el codigo de ejemplo importa modulos desde la ruta de descarga (`sys.path.insert`), lo que exige revisar y adaptar el codigo antes de usarlo en un entorno productivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/syedasumayya1/forgegpt-12m
- Repositorio de codigo y resultados completos: https://github.com/syedasumayya/forgegpt
- Paper del dataset TinyStories (Eldan y Li, 2023): https://arxiv.org/abs/2305.07759
- No se han encontrado otros enlaces relevantes en la busqueda web; los resultados devueltos correspondian a contenido sin relacion con el modelo.
