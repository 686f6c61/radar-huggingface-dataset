# sriq-ai/sriq-spark-v1.4

## Resumen

SRIQ-Spark-V1.4 es un modelo de lenguaje de 4.112.079.360 parametros desarrollado por SRIQ (sriq.org) mediante ajuste fino supervisado (SFT) sobre el checkpoint base XHToken/Spark-X2.5-4B. Su proposito declarado es generar trazas de razonamiento que verifican su propia respuesta antes de comprometerse con ella: cada traza se cierra con un bloque de verificacion introducido por el token `验：`, donde el modelo sustituye el resultado, rederiva el invariante o recorre los casos limite enunciados, y emite a menudo un juicio explicito como `答对。`. El modelo no es un lanzamiento generalista: es un experimento de investigacion sobre auto-verificacion en modelos pequenos.

Tecnicamente es un transformer decoder-only de 4,1B parametros con arquitectura propia denominada `spark2_5`, que emplea proyeccion QKV fusionada (`q_k_v_proj`), salida de atencion renombrada como `out_proj` y un MLP con `gate_proj`, `up_proj` y `down_proj`. El entrenamiento se hizo con Unsloth mediante un adaptador LoRA (r=64, alpha=128) posteriormente fusionado en los pesos publicados, en una unica NVIDIA RTX 5090, con `bfloat16` y una longitud de secuencia maxima configurada de 262.144 tokens.

La relevancia de esta ficha es mas metodologica que competitiva: el autor declara explicitamente que el modelo se publica sin medir, con una cobertura de entrenamiento de solo 240 secuencias sobre un dataset de 825 filas (aproximadamente 0,29 de una epoca). Es, por tanto, un artefacto de investigacion reproducible sobre auto-verificacion, no un modelo listo para produccion.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `spark2_5` (transformer decoder-only con codigo de modelado propio; QKV fusionada, `out_proj`, RoPE) |
| Parametros totales | 4.112.079.360 (4,11B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens como techo configurado en entrenamiento; el maximo efectivo del modelo base no se especifica |
| Tipos de cuantizacion | bfloat16 nativo; carga en 4 bits mediante bitsandbytes (habilitada por el parche incluido en el repo); GGUF/GGML no disponible |
| Idiomas soportados | no disponible oficialmente; las trazas de razonamiento se emiten en chino simplificado |
| Licencia | Apache-2.0 (la licencia del modelo base XHToken/Spark-X2.5-4B no se detalla) |
| Formato de pesos | safetensors (repositorio de 8,6 GB); adaptador LoRA sin fusionar en `adapter/` |

## Arquitectura y entrenamiento

El modelo base es `XHToken/Spark-X2.5-4B`, una arquitectura personalizada que envia su propio codigo de modelado (`modeling_spark.py`) y exige `trust_remote_code=True`. El decoder usa proyecciones QKV fusionadas en un unico tensor (`q_k_v_proj`) y llama `out_proj` a la salida de atencion, con nombres de modulo distintos a los habituales estilo Llama; de ahi que el adaptador LoRA se aplicase explicitamente sobre `q_k_v_proj`, `out_proj`, `gate_proj`, `up_proj` y `down_proj`. El repo incluye una copia parcheada del codigo remoto: se corrige `_tied_weights_keys` (de lista a diccionario, porque Transformers 5.x invoca `.keys()` en `post_init()` y la version upstream falla con `AttributeError`) y se deja de castear las activaciones al dtype crudo del peso, lo que bajo bitsandbytes 4-bit provocaba un `NotImplementedError: "baddbmm_cuda" not implemented for 'Byte'`. Ninguno de los dos cambios altera la matematica del forward en bfloat16.

El ajuste fino se realizo con Unsloth sobre un LoRA de rango 64 y alpha 128, con learning rate 2e-4, 30 pasos, batch efectivo de 8 (2 x 4 de acumulacion de gradientes), longitud maxima de 262.144 tokens, perdida final de entrenamiento 0,554, y fusion posterior del adaptador en los pesos. El dataset `sriq-ai/sriq-sft-v1.4` esta en formato ShareGPT y sus objetivos de asistente emparejan razonamiento comprimido en chino simplificado con la respuesta final original; la compresion nunca reescribe la respuesta final. La innovacion declarada de la v1.4 frente a la v1.3 es el paso de verificacion final, que alarga las trazas aproximadamente un 22 %. La cobertura real es de unas 0,29 epocas (240 secuencias sobre 825 filas), por lo que el autor lo describe como una primera pasada, no como un modelo convergido.

## Capacidades

- Generacion de texto conversacional multi-turno mediante plantilla de chat (`apply_chat_template`).
- Razonamiento paso a paso con auto-verificacion: la traza se emite dentro de etiquetas `<think>` y cierra con un bloque `验：` de comprobacion.
- Aritmetica y problemas verbales sencillos: el ejemplo de la model card resuelve `17 * 23` mostrando el calculo y la verificacion inversa (`23*17=391`).
- Salida de razonamiento en chino simplificado, con la respuesta final fuera de la traza.
- Generacion determinista reproducible con `do_sample=False`.
- Carga en 4 bits mediante bitsandbytes, gracias al parche del codigo de modelado.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte explicito de agentes ni de razonamiento multi-paso orquestado.
- No se declaran capacidades de vision, audio ni multimodalidad.
- No se declara thinking mode configurable por parametro; la traza parece ser el comportamiento por defecto del ajuste.

## Casos de uso

- Investigacion en auto-verificacion de razonamiento: el modelo sirve como banco de pruebas para estudiar si un paso explicito de comprobacion (`验：`) correlaciona con respuestas mas correctas, comparando sus trazas contra la v1.3 sin verificacion.
- Generacion de datos sinteticos de razonamiento: se pueden producir trazas largas con comprobacion final para destilarlas en modelos mas pequenos o para ampliar un dataset de SFT, a coste de inferencia bajo (4,1B en una sola GPU).
- Resolucion asistida de problemas aritmeticos y de algebra elemental en entornos educativos en chino: la verificacion inversa de la respuesta aporta una traza auditable para el estudiante.
- Prototipado rapido en una unica GPU de consumo: al no poder repartirse entre GPUs con `device_map="auto"`, se fija a un solo dispositivo; encaja en tarjetas de 24-32 GB en bfloat16 y en tarjetas mas modestas con cuantizacion de 4 bits.
- Estudio de arquitecturas personalizadas: es un caso practico de integracion de codigo remoto con `trust_remote_code=True`, util para evaluar los problemas de compatibilidad entre Transformers 4.x y 5.x en modelos con modelado propio.
- Base para ajustes adicionales con LoRA: el repo conserva el adaptador sin fusionar en `adapter/`, lo que facilita continuar el entrenamiento o reorientarlo a otro dominio o idioma.
- Evaluacion de robustez y sesgos de modelos pequenos con trazas en un idioma distinto al del usuario, util para equipos que investigan transferencia cross-lingue.
- No es adecuado como backend de atencion al cliente en produccion con el codigo actual: vLLM no reconoce la arquitectura `spark2_5` y no servira el repositorio sin un plugin de modelo personalizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que esta version se publica sin medir y que las afirmaciones describen la configuracion de entrenamiento, no mejoras verificadas de precision, tasa de verificacion o calidad de respuesta.

| Metrica | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Tasa de verificacion de las trazas | no disponible (no medida) |
| Perdida final de entrenamiento | 0,554 (sobre 240 secuencias, 30 pasos) |

## Requisitos de hardware

- Pesos en bfloat16: aproximadamente 8,2 GB (4,11B parametros x 2 bytes), mas activaciones y cache KV.
- Pesos en 4 bits con bitsandbytes: aproximadamente 2,5-3 GB, mas cache KV y overhead de cuantizacion.
- El autor indica que en bfloat16 cabe comodamente en una tarjeta unica de 32 GB; la RTX 5090 de 32 GB fue la GPU usada para el entrenamiento.
- GPU recomendadas: cualquier GPU con 24 GB o mas para bfloat16 con contexto moderado (RTX 4090, RTX 5090, A100 40/80 GB, H100). En tarjetas de 12-16 GB conviene la carga en 4 bits o reducir el contexto.
- No cabe repartir el modelo entre varias GPU con `device_map="auto"`: el codigo remoto construye la cache cos/sin de RoPE en el dispositivo de la primera capa y la reutiliza en todas, lo que produce `Expected all tensors to be on the same device`. Hay que fijarlo con `device_map={"": 0}`. Este aviso no esta parcheado.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la via soportada. vLLM no reconoce `spark2_5` y requiere un plugin personalizado. No hay pesos GGUF, por lo que llama.cpp y Ollama no estan disponibles. TGI: no disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Los datos de SRIQ-Spark-V1.4 proceden de la informacion proporcionada. Los de los modelos alternativos proceden de sus model cards publicas y deben verificarse antes de tomar decisiones; no hay benchmarks comparables de SRIQ-Spark-V1.4, de modo que la comparacion es estructural, no de rendimiento.

| Modelo | Parametros | Contexto | Licencia | Ecosistema de despliegue | Benchmarks publicados |
|---|---|---|---|---|---|
| SRIQ-Spark-V1.4 | 4,11B | 262.144 tokens configurados en entrenamiento | Apache-2.0 | Solo `transformers` con codigo remoto; vLLM requiere plugin; sin GGUF | No |
| Qwen2.5-3B-Instruct | 3,09B | 32.768 tokens, extensible a 131.072 con YaRN | Apache-2.0 | transformers, vLLM, llama.cpp, Ollama | Si |
| Llama-3.2-3B-Instruct | 3,21B | 128.000 tokens | Llama 3.2 Community License | transformers, vLLM, llama.cpp, Ollama | Si |
| Phi-3.5-mini-instruct | 3,8B | 128.000 tokens | MIT | transformers, vLLM, llama.cpp, Ollama | Si |

Diferencias clave: SRIQ-Spark-V1.4 es el unico con arquitectura propietaria y codigo remoto obligatorio, lo que limita su portabilidad frente a los tres alternativos, todos ellos con soporte nativo en los principales runners de inferencia. Su contexto configurado es el mayor de la tabla, pero no esta respaldado por ninguna evaluacion de recuperacion a esa distancia. Su licencia Apache-2.0 es tan permisiva como la de Qwen2.5 y mas que la de Llama 3.2, aunque la licencia del modelo base Spark-X2.5-4B no se especifica en la informacion disponible y conviene comprobarla antes de un uso comercial.

## Limitaciones y advertencias

- Entrenamiento muy corto: 30 pasos y 240 secuencias sobre un dataset de 825 filas, aproximadamente 0,29 epocas. El propio autor lo describe como una primera pasada, no como un modelo convergido.
- Ausencia total de evaluacion: no se ejecuto ningun benchmark, por lo que no hay evidencia de mejora en precision, tasa de verificacion ni calidad de respuesta.
- Riesgo de alucinacion no cuantificado. La presencia de un bloque de verificacion no garantiza que el resultado sea correcto; la verificacion es generada por el propio modelo y puede ser erronea o tautologica.
- Idiomas: la model card no declara idiomas soportados, pero las trazas de razonamiento y los tokens de control (`验：`, `答对。`, `故对。`) estan en chino simplificado. El comportamiento en castellano u otros idiomas no esta documentado ni medido.
- Sesgos: no hay ninguna informacion sobre composicion del dataset, filtrado ni evaluacion de sesgos. La unica referencia es `sriq-ai/sriq-sft-v1.4`, sin documentacion publica en la informacion disponible.
- Codigo remoto obligatorio: requiere `trust_remote_code=True`, lo que implica ejecutar codigo de terceros. El repo incluye una version parcheada y apunta a Transformers 5.x; el autor advierte que la version upstream no funciona con Transformers actuales.
- No se puede repartir entre varias GPU con `device_map="auto"` por el diseno de la cache RoPE; hay que fijarlo a un unico dispositivo.
- vLLM no soporta la arquitectura `spark2_5` sin un plugin personalizado, lo que complica el despliegue con throughput alto.
- Sin pesos GGUF, no hay ruta de despliegue en llama.cpp, Ollama ni entornos similares.
- Licencia: el modelo se distribuye como Apache-2.0, pero la licencia del modelo base XHToken/Spark-X2.5-4B no se detalla en la informacion disponible; verificarla es un paso previo imprescindible para uso comercial.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sriq-ai/sriq-spark-v1.4
- Modelo base: https://huggingface.co/XHToken/Spark-X2.5-4B
- Dataset de SFT: https://huggingface.co/datasets/sriq-ai/sriq-sft-v1.4
- Sitio del desarrollador: https://sriq.org
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- Papers, blogs y demos adicionales: no disponible. La busqueda web realizada no devolvio resultados relevantes sobre este modelo.
