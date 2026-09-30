# TheAaravSikriwal/gemma-2-2b-it-mindcontrol

## Resumen

gemma-2-2b-it-mindcontrol es un artefacto derivado de google/gemma-2-2b-it publicado por el usuario TheAaravSikriwal. No se trata de un modelo entrenado desde cero, sino de los pesos del Gemma 2 2B instruction-tuned de Google DeepMind reempaquetados en 4 bits para mindcontrol, un motor de inferencia escrito desde cero en Rust y WGSL que ejecuta el modelo en el navegador sobre la GPU del propio visitante mediante WebGPU. El repositorio incluye además un fichero steering.json con vectores de dirección obtenidos por adición de activaciones contrastivas (contrastive activation addition), que alimentan los diales de control de comportamiento de la interfaz.

El valor de esta publicación es de ingeniería de despliegue más que de modelado: define un formato de pesos empaquetados propio (cada matriz 2D como `<name>.qweight` en u32, con ocho códigos de 4 bits por palabra, y `<name>.scales` en u32 que combinan una escala f16 y un offset f16 por grupo de 32, mientras que las normas permanecen en bf16) y demuestra una técnica de steering de activaciones aplicable en el cliente.

En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 likes, no declara pipeline ni idiomas soportados, y queda sujeto a la licencia Gemma. La ficha incluye únicamente los pesos cuantizados, el fichero de steering y las copias sin modificar de config.json y tokenizer.json del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia gemma2) heredada del modelo base google/gemma-2-2b-it; pesos reempaquetados para el motor mindcontrol |
| Parámetros totales | 408.695.040 tensores almacenados en safetensors (representación empaquetada en 4 bits; el modelo base Gemma 2 2B ronda los 2.000 millones de parámetros) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la model card del derivado; el modelo base google/gemma-2-2b-it es un modelo de 2B con arquitectura transformer de uso conversacional |
| Tipos de cuantización | 4 bits (Q4) con grupos de 32 y escala y offset en f16; normas en bf16 |
| Idiomas soportados | No disponible |
| Licencia | Gemma (Gemma Terms of Use y Gemma Prohibited Use Policy) |
| Formato de pesos | safetensors con tensores `qweight` (u32) y `scales` (u32); incluye steering.json, config.json y tokenizer.json |

## Arquitectura y entrenamiento

El repositorio no documenta ningún proceso de entrenamiento propio: es una derivación de pesos sobre google/gemma-2-2b-it, un transformer decoder-only instruction-tuned. La model card no aporta información sobre el número de tokens, la composición del dataset ni si hubo RLHF o DPO en el modelo base, por lo que esos datos figuran como no disponibles. config.json y tokenizer.json se mantienen sin cambios respecto al modelo original.

La innovación concreta está en el formato de almacenamiento y en el motor de ejecución. Las matrices 2D se guardan cuantizadas a 4 bits agrupados de 32 en 32, empaquetando ocho códigos por palabra de 32 bits, con una escala f16 y un offset f16 por grupo almacenados en una única palabra u32; las capas de normalización conservan bf16. El motor mindcontrol, escrito en Rust y WGSL, interpreta ese formato y ejecuta la inferencia en el navegador usando WebGPU sobre la GPU del usuario. Sobre ese mismo motor se aplican los vectores de steering.json, direcciones de adición de activaciones contrastivas que funcionan como diales de control del comportamiento del modelo en tiempo de inferencia.

## Capacidades

- Generación de texto y seguimiento de instrucciones conversacionales, heredadas del modelo base instruction-tuned google/gemma-2-2b-it.
- Respuesta a preguntas y diálogo multi-turno en formato chat, siempre que se aplique la plantilla de prompt del modelo base (tokenizer.json sin modificar).
- Inferencia local en el navegador mediante WebGPU, sin enviar datos a un servidor: el cómputo se realiza en la GPU del visitante.
- Control de comportamiento en tiempo de inferencia mediante vectores de steering (contrastive activation addition), expuestos como diales en la interfaz de mindcontrol.
- Carga de pesos en 4 bits empaquetados, lo que reduce el espacio en memoria frente a una distribución bf16.
- No hay evidencia en la información disponible de soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.
- No se documentan capacidades multilingües específicas para este derivado.

## Casos de uso

- Demostración interactiva en el navegador: cualquier visitante con un navegador compatible con WebGPU puede ejecutar el modelo sin instalación ni backend, ya que los pesos de 1,7 GB se descargan y se procesan en su propia GPU.
- Prototipado de interfaces conversacionales sin infraestructura de servidor: útil para validar UX de chat, latencia percibida y calidad de respuestas antes de invertir en despliegue en GPU.
- Investigación en steering e interpretabilidad: steering.json permite experimentar con direcciones de activación contrastivas y medir cómo cambian el tono y el estilo de las respuestas con cada dial.
- Aplicaciones con requisitos de privacidad: al ejecutarse en el cliente, el texto del usuario no sale del dispositivo, un escenario adecuado para demos de asistentes sobre datos sensibles.
- Docencia y divulgación técnica: sirve como ejemplo práctico de cuantización a 4 bits, empaquetado de matrices y ejecución de un transformer en WGSL.
- Inferencia en entornos sin GPU dedicada de servidor: puede desplegarse en portátiles o equipos de escritorio con GPU integrada moderna, siempre dentro del motor mindcontrol.
- Pruebas de degradación por cuantización: comparar las respuestas de esta distribución Q4 frente al modelo base en bf16 para cuantificar la pérdida de calidad en tareas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del repositorio: 1,7 GB, lo que da una estimación del orden de magnitud de los pesos a cargar en memoria (los pesos cuantizados a 4 bits ocupan bastante menos que una distribución bf16 equivalente).
- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del repositorio, los pesos deberían caber en GPUs con 4 GB de memoria libre o más, más el espacio adicional para caché KV y activaciones.
- GPU recomendadas: no especificadas por el autor. El requisito real es que la GPU exponga WebGPU con soporte de f16 en WGSL, lo que incluye buena parte de las GPU integradas y dedicadas recientes de escritorio.
- ¿Cabe en GPU de consumo? Sí, es precisamente el objetivo del proyecto: ejecución en la GPU del visitante desde el navegador, no en un servidor.
- Opciones de despliegue: motor mindcontrol (Rust + WGSL + WebGPU). El formato qweight/scales es propietario, por lo que no es cargable directamente en vLLM, llama.cpp, Ollama o TGI sin una conversión previa a un formato estándar.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TheAaravSikriwal/gemma-2-2b-it-mindcontrol | 408.695.040 tensores empaquetados (base de ~2B) | No disponible | safetensors qweight/scales 4 bits + steering.json | Gemma | 0 descargas, 0 likes |
| google/gemma-2-2b-it (modelo base) | ~2B | No disponible en la información proporcionada | safetensors (bf16) | Gemma | Modelo oficial de Google DeepMind |
| google/gemma-2b-it | 2B | No disponible | safetensors | Gemma | Generación anterior, orientada a instrucciones |

Frente a las cuantizaciones estándar de la comunidad (por ejemplo, GGUF en 4 bits para llama.cpp), la diferencia principal de este derivado es el empaquetado específico para mindcontrol y la inclusión de vectores de steering, que no forman parte de las distribuciones habituales. No se dispone de datos de rendimiento comparativos.

## Limitaciones y advertencias

- Modelo sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin evaluaciones publicadas de calidad, seguridad o sesgos.
- No es autónomo: depende del motor mindcontrol. Los tensores `qweight`/`scales` no son compatibles con los cargadores estándar de transformers, vLLM, llama.cpp, Ollama o TGI sin conversión.
- La cuantización a 4 bits introduce degradación de calidad frente al modelo base en bf16, especialmente en tareas de razonamiento o matemáticas.
- Un modelo de 2B de parámetros tiene una capacidad limitada de razonamiento complejo y una propensión alta a la alucinación en dominios especializados.
- Los vectores de steering pueden alterar el comportamiento del modelo de formas no documentadas; no hay evaluación de su efecto sobre la veracidad o la seguridad de las respuestas.
- No se declaran idiomas soportados ni longitud de contexto para este derivado.
- Licencia Gemma: el uso está sujeto a los Gemma Terms of Use y a la Gemma Prohibited Use Policy, e incluye obligaciones de atribución y restricciones de uso. Es imprescindible revisarlas antes de cualquier uso comercial o en producción.
- El repositorio se publicó con el modelo base como `base_model:finetune:google/gemma-2-2b-it`, aunque la model card describe un reempaquetado de pesos y no un fine-tuning supervisado; conviene tratarlo como derivado de pesos, no como un modelo ajustado.
- No se especifican requisitos de navegador, versiones mínimas de WebGPU ni comportamiento en GPU sin soporte de f16.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/TheAaravSikriwal/gemma-2-2b-it-mindcontrol
- Modelo base: https://huggingface.co/google/gemma-2-2b-it
- Repositorio del motor mindcontrol: https://github.com/TheAaravSikriwal/mindcontrol
- Demo del motor: https://wearechintu.com/mindcontrol
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
- google/gemma-2b-it: https://huggingface.co/google/gemma-2b-it
- Gemma 2b it en aimodels.fyi: https://www.aimodels.fyi/models/replicate/gemma-2b-it-google-deepmind
- Gemma 2 2b it en aimodels.fyi: https://www.aimodels.fyi/models/replicate/gemma-2-2b-it-google-deepmind
- Inferless Gemma-2B-it: https://github.com/inferless/Gemma-2B-it
