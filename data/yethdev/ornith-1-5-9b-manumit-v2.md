# yethdev/ornith-1.5-9b-manumit-v2

## Resumen

Ornith-1.5-9B-manumit-v2 es una variante del modelo Ornith-1.5-9B, desarrollada por yethdev, que aplica la técnica de "manumit" para eliminar los comportamientos de rechazo del modelo original. El modelo base, Ornith-1.5-9B, es un modelo denso de aproximadamente 9.400 millones de parámetros, creado por DeepReinforce, especializado en tareas de codificación y agentes, entrenado con un bucle de refuerzo de auto-mejora. Esta versión "abliterada" mantiene la capacidad del modelo original pero responde a peticiones que el modelo base rechazaría, eliminando la capa de seguridad. Es relevante para desarrolladores que necesitan un modelo sin restricciones de rechazo, aunque con las advertencias legales y éticas correspondientes.

El modelo tiene una licencia MIT, está disponible en Hugging Face y se puede cargar con transformers. Su tamaño es de 9.409.813.744 parámetros, con un peso de 18.8 GB en safetensors. La arquitectura subyacente parece basarse en Qwen 3.5 según las etiquetas, aunque no se confirma en la documentación. El contexto máximo no se especifica, pero el modelo base probablemente soporta una ventana de contexto amplia, aunque no hay datos concretos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen 3.5 segun tags, sin confirmar) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No especificados (se puede cuantizar con herramientas estandar) |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-9B es un transformer denso de ~9.4B parametros, entrenado por DeepReinforce con un bucle de auto-mejora que combina propuesta de tareas, generacion de scaffolds y rollouts para refuerzo. La variante manumit v2 aplica una tecnica de abliteracion que identifica las direcciones en el residual stream responsables del rechazo y las proyecta fuera de los pesos, seguido de un proceso de "curado" con datos ordinarios para minimizar la perdida de capacidad. Segun la model card, el MMLU-Pro se mantiene en 43.0% (igual que el base) y la tasa de rechazo en AdvBench es 0.0% y en JailbreakBench 4.2%.

## Capacidades

- Generacion de texto conversacional: puede mantener dialogos multi-turno.
- Codificacion: el modelo base esta especializado en tareas de programacion, por lo que esta variante conserva esa capacidad.
- Razonamiento: mantiene el rendimiento en MMLU-Pro (43.0%).
- Sin capa de rechazo: responde a peticiones que el modelo base rechazaria, lo que puede ser util para investigacion en seguridad o para casos donde se necesita una respuesta sin filtros.
- Soporte de image-text-to-text segun las etiquetas, aunque no se detalla en la documentacion.
- Compatible con el chat template de transformers.

## Casos de uso

- Investigacion en seguridad de IA: estudiar el comportamiento de modelos sin capa de rechazo para entender los riesgos y desarrollar mejores alineaciones.
- Generacion de codigo sin restricciones: para tareas de programacion donde el modelo base podria rechazar ciertas peticiones (por ejemplo, codigo ofensivo), esta variante puede proporcionar respuestas.
- Desarrollo de agentes autonomos: al no tener rechazos, puede explorar acciones que otros modelos evitarian, util en entornos de simulacion.
- Analisis de contenido sensible: para tareas de moderacion o analisis de texto donde se necesita una respuesta directa sin filtros.
- Pruebas de estres de sistemas de seguridad: evaluar como responde un modelo sin guardas ante prompts maliciosos.
- Fine-tuning posterior: al ser un modelo abliterado, puede servir como base para entrenar modelos con comportamientos especificos sin la interferencia de la capa de rechazo.

## Benchmarks y rendimiento

La model card proporciona los siguientes datos comparativos con el modelo base:

| Metrica | Este modelo | Base |
|---|---|---|
| AdvBench refusal | 0.0% | alta |
| JailbreakBench refusal | 4.2% | alta |
| MMLU-Pro (n=500) | 43.0% | 43.0% |

No se han publicado otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: en bf16, el modelo ocupa ~18.8 GB, por lo que se necesita al menos 20 GB de VRAM para inferencia sin cuantizacion. Con cuantizacion INT8 (~9.4 GB) o INT4 (~4.7 GB) podria caber en GPUs consumer.
- GPU recomendadas: para bf16, una GPU con 24 GB (RTX 3090/4090) o superior. Para cuantizacion, una RTX 3060 de 12 GB podria ser suficiente.
- El modelo base se sirve en una sola GPU de 80 GB (A100/H100) segun la documentacion de MLX, pero con cuantizacion se reduce.
- Opciones de despliegue: transformers, vLLM, llama.cpp, Ollama (si se convierte a GGUF), TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU-Pro | Licencia | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-9B (base) | ~9.4B | No disponible | 43.0% | MIT | Modelo original con capa de rechazo |
| Ornith-1.5-9B-manumit-v2 | ~9.4B | No disponible | 43.0% | MIT | Variante abliterada, sin rechazos |
| Otros modelos de 9B | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparables |

## Limitaciones y advertencias

- El modelo no tiene capa de seguridad ni guard model: puede generar contenido danino, ilegal o no etico. El autor advierte que el usuario es responsable de lo que genere.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar informacion.
- No se especifican los idiomas soportados; probablemente el modelo base esta entrenado principalmente en ingles.
- La licencia MIT permite uso comercial, pero el modelo base tiene sus propios terminos (tambien MIT segun la busqueda).
- No hay garantia de que la abliteracion no haya degradado otras capacidades no medidas.
- El modelo tiene 0 descargas y 0 likes, lo que sugiere que es muy reciente o poco probado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yethdev/ornith-1.5-9b-manumit-v2
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Version MLX del base: https://huggingface.co/ornith-ai/Ornith-1.5-9B-MLX
- Articulo sobre Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Entrada en LLM Explorer: https://llm-explorer.com/model/yethdev%2Fornith-9b-manumit-v1,6Deq8olcVvRhrwVd5hBh5N (nota: es la version v1, no v2)
