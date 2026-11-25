# yuhuanstudio/Yunmo-Next-1B-Base-MLX-4bit

## Resumen

Yunmo-Next-1B-Base-MLX-4bit es una cuantizacion en 4 bits del checkpoint base Yunmo-Next-1B-Base, publicada por yuhuanstudio para su ejecucion en Apple Silicon mediante el framework MLX. El modelo original es un transformer de aproximadamente 1.013 millones de parametros (1B) orientado a generacion de texto en chino (con soporte declarado de chino tradicional) e ingles, con una arquitectura que incorpora Kimi Delta Attention (KDA), grouped-query attention y un mecanismo de enrutamiento por profundidad (depth routing).

La relevancia de esta publicacion es doble. Por un lado, demuestra un flujo de cuantizacion MLX sobre una arquitectura que no forma parte de `mlx-lm`, obligando al autor a incluir una implementacion MLX autocontenida en el propio repositorio (`yunmo_next_mlx/`). Por otro, el autor documenta de forma explicita y cuantitativa la degradacion de fidelidad frente al modelo PyTorch en FP32, lo que la convierte en una referencia util para quien necesite medir el coste real de cuantizar a 4 bits arquitecturas con atencion lineal.

Se trata, sin embargo, de un checkpoint de investigacion, no de un modelo listo para produccion: el propio autor advierte de que el modelo esta a nivel de azar en preguntas de conocimiento de opcion multiple, falla a menudo en datos factuales, puede repetirse hasta agotar el limite de tokens y no tiene ajuste de seguridad. La licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Kimi Delta Attention (KDA), grouped-query attention y depth routing |
| Parametros totales | 1.013.956.456 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine, group size 64 (esta publicacion); el repositorio base ofrece FP32, BF16 y 8-bit en MLX |
| Idiomas soportados | zh (incluye chino tradicional), en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), 0.67 GB en 4-bit; repo de 0.7 GB |

## Arquitectura y entrenamiento

La arquitectura combina tres elementos: Kimi Delta Attention (KDA), un mecanismo de atencion de tipo lineal con parametros de decaimiento (`A_log`, `dt_bias`) que se mantienen sin cuantizar; grouped-query attention; y depth routing, un esquema de enrutamiento por profundidad cuyos parametros tampoco se cuantizan. Las capas SwiGLU se rellenan con ceros hasta un multiplo de 64 para permitir la cuantizacion de todas las lineales, sin alterar la funcion del modelo. La capa de embedding/output atada, las normas y las convoluciones cortas quedan igualmente en precision completa.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el checkpoint base; la model card remite al repositorio de precision completa para esos detalles. La innovacion tecnica documentada en esta publicacion es la propia cuantizacion MLX: 4-bit affine con group size 64, con un impacto medido de +0.0080 bits por byte sobre el modelo PyTorch en FP32 (0.9254 frente a 0.9174) en los primeros 50 articulos de un conjunto de Wikipedia en chino posterior a 2026-10-01.

## Capacidades

- Generacion de texto autoregresiva en chino (incluido tradicional) e ingles.
- Conversacion multi-turno mediante plantilla de chat (`encode_chat` reproduce exactamente los token IDs de la plantilla de `transformers` con el razonamiento desactivado).
- Soporte de modo razonamiento en la plantilla de chat (desactivable), aunque no se documenta su calidad.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Vision, audio u otras modalidades: no disponible.
- Inferencia en Apple Silicon mediante MLX, con backend CUDA y CPU validados en Linux.

## Casos de uso

- Investigacion sobre cuantizacion de atencion lineal: el repositorio permite reproducir la comparativa bits-por-byte entre FP32, BF16, 8-bit y 4-bit para medir la degradacion de KDA y depth routing bajo cuantizacion agresiva.
- Prototipado de inferencia local en Apple Silicon: con 0.67 GB de pesos en 4 bits, el modelo se puede cargar en un Mac para experimentar con la implementacion MLX autocontenida sin depender de `mlx-lm`.
- Evaluacion de fidelidad de decodificacion greedy: la tabla de tokens iniciales identicos a PyTorch FP32 (64/64 en chino, 27/64 en ingles y 19/64 en chat para 4-bit) sirve como banco de pruebas de tecnicas de cuantizacion.
- Generacion de texto en chino tradicional para tareas de baja exigencia factual, aceptando la advertencia del autor sobre errores factuales y repeticiones.
- Desarrollo de plantillas de chat y tokenizadores para arquitecturas no soportadas por librerias estandar, usando `encode_chat` como referencia de conformidad con `transformers`.
- Base para fine-tuning posterior en entornos con recursos limitados, dado el tamano reducido (1B) y la licencia permisiva Apache-2.0, siempre que se asuma su naturaleza de checkpoint de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica publicada es la fidelidad de cuantizacion frente a PyTorch FP32:

| Pesos MLX | Bits por byte (Wikipedia zh) | Delta vs PyTorch FP32 |
|---|---:|---:|
| MLX FP32 | 0.9174 | +0.0000 |
| MLX BF16 | 0.9175 | +0.0001 |
| MLX 8-bit | 0.9175 | +0.0001 |
| MLX 4-bit | 0.9254 | +0.0080 |

Tokens iniciales identicos a PyTorch FP32 con decodificacion greedy y 64 tokens nuevos:

| Pesos MLX | Chino (Base) | Ingles (Base) | Chat (Instruct) |
|---|---:|---:|---:|
| FP32 | 64 / 64 | 64 / 64 | 64 / 64 |
| BF16 | 64 / 64 | 64 / 64 | 42 / 64 |
| 8-bit | 64 / 64 | 64 / 64 | 42 / 64 |
| 4-bit | 64 / 64 | 27 / 64 | 19 / 64 |

## Requisitos de hardware

- VRAM estimada: 0.67 GB de pesos en 4-bit; el consumo real de memoria depende del runtime MLX y de la longitud de contexto, no documentada.
- GPU recomendadas: no disponible; la validacion se realizo con los backends CUDA y CPU de MLX en Linux, sin especificar modelos de GPU.
- Apple Silicon: el destino declarado del repositorio, aunque el autor indica que no se ha verificado ni la correccion ni la velocidad en Apple Silicon.
- Cabe en GPU de consumo: si, por tamano (menos de 1 GB de pesos), aunque no hay validacion publicada en GPUs consumer concretas.
- Opciones de despliegue: MLX (`mlx`, `tokenizers`, `huggingface_hub`) con el paquete incluido `yunmo_next_mlx`; no es compatible con `mlx-lm`, vLLM, llama.cpp, Ollama ni TGI segun la informacion disponible.
- Latencia y throughput: no disponibles; el autor senala que el bucle de decodificacion no esta optimizado para velocidad.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria ni datos de rendimiento en tareas que permitan una comparacion rigurosa. Como referencia interna, el propio repositorio base (Yunmo-Next-1B-Base) en FP32, BF16 y 8-bit MLX constituye la alternativa directa en cuanto a fidelidad y tamano.

## Limitaciones y advertencias

- Checkpoint de investigacion: el autor indica que el modelo esta a nivel de azar en preguntas de conocimiento de opcion multiple y falla a menudo en datos factuales.
- Riesgo de repeticion: puede repetirse hasta alcanzar el limite de tokens.
- Sin ajuste de seguridad: no hay alineamiento ni filtros de seguridad documentados.
- Degradacion en 4-bit: solo 27/64 tokens iniciales identicos a PyTorch FP32 en ingles y 19/64 en chat, frente a 64/64 en chino; el uso en ingles y en modo conversacional es especialmente sensible a la cuantizacion.
- Longitud de contexto no documentada, lo que impide planificar cargas de trabajo con ventanas largas.
- Validacion incompleta: no se ha comprobado correccion ni velocidad en Apple Silicon, el objetivo declarado del repositorio.
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia Apache-2.0 permite uso comercial, pero la calidad del checkpoint hace desaconsejable su uso en produccion sin evaluacion previa.
- Ecosistema limitado: al no integrarse en `mlx-lm`, requiere el codigo incluido en el repositorio y no se beneficia de optimizaciones de terceros.

## Enlaces

- Hugging Face: https://huggingface.co/yuhuanstudio/Yunmo-Next-1B-Base-MLX-4bit
- Modelo base: https://huggingface.co/yuhuanstudio/Yunmo-Next-1B-Base
- Paper, blog, repositorio o demo adicionales: no disponible en la informacion proporcionada.
