# whcl412/LycheeAI-coder-2b-II-pro

## Resumen

LycheeAI-coder-2b-II-pro es un ajuste fino de tipo LoRA sobre el modelo base MiniCPM5-2B de OpenBMB, publicado por el desarrollador individual whcl412. Se trata de un asistente de programacion ligero, de aproximadamente 2.500 millones de parametros, orientado especificamente a la llamada a herramientas (tool calling) en local, sin necesidad de conexion a internet. El repositorio se distribuye en formato MLX cuantizado a 4 bits, pensado para su ejecucion nativa en Apple Silicon, con una version GGUF separada para Ollama.

La motivacion declarada del autor es corregir la principal carencia de la version anterior (1b-II): la ausencia total de capacidad de llamada a herramientas. Esta revision incorpora datos de entrenamiento especificos para tool calling, con salida en JSON plano estilo OpenAI function calling, soporte de llamadas simples y multiples, capacidad de rechazo de peticiones fuera de alcance y lectura de resultados devueltos por el host. El modelo base MiniCPM5-2B aporta una ventana de contexto teorica de 512K tokens.

Es relevante ahora como ejemplo de ajuste fino de bajo coste (2.574 muestras, 1,5 epocas) sobre un modelo pequeno, para tareas de agente local con latencia baja. Conviene enmarcarlo en su escala real: el propio autor advierte que es un "asistente local pequeno" y que no debe evaluarse con los estandares de modelos frontera. El repositorio no tiene descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder derivado de MiniCPM5-2B (tag de libreria "llama"; detalle interno no disponible) |
| Parametros totales | 2.516.756.480 (~2,5 B) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 512K tokens en el modelo base; el autor indica que el rendimiento real en contextos largos no se ha probado |
| Tipos de cuantizacion | 4 bits en formato MLX (4,501 bits por peso); existe una version GGUF en repo aparte |
| Idiomas soportados | Chino, ingles y cantonés (segun el autor) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors cuantizados a 4 bits; GGUF en repositorio separado |

## Arquitectura y entrenamiento

El modelo es un ajuste fino mediante LoRA (rank 8, aplicado a 16 capas) sobre el modelo base openbmb/MiniCPM5-2B, desarrollado por OpenBMB y liberado bajo licencia Apache 2.0 con una ventana de contexto declarada de 512K tokens. El entrenamiento se realizo con el framework MLX-LM y el resultado se publica cuantizado a 4 bits. No se detalla en la model card la arquitectura interna exacta del base (tipo de atencion, uso de RoPE, etc.), por lo que este dato queda como no disponible.

El conjunto de datos de ajuste consta de 2.574 muestras: 1.739 de caracter general y 835 especificas de llamada a herramientas. El entrenamiento cubrio 1,5 epocas, equivalentes a 1.930 pasos. Los datos de herramientas se construyeron en cinco lotes con objetivos correctivos concretos: el lote v2 (268 muestras) introduce la capacidad desde cero (llamada simple, seleccion multiple, rechazo e interpretacion de resultados); el v3 (222) corrige derivas hacia XML en llamadas multi-paso, traduccion indebida de parametros en chino y respuestas sin conclusion; el v4 (164) corrige autodenominaciones erroneas y el habito de calcular mentalmente cuando hay una herramienta disponible; y el v5 (181) refuerza la capacidad de rechazo y la preservacion del nombre completo en respuestas de identidad. La innovacion destacable no es arquitectonica sino de diseno de datos: la separacion estricta entre tres conductas (llamar a herramienta, rechazar por limite de capacidad o etica, y responder directamente sin herramienta), que el autor senala como el principal punto de confusion durante el desarrollo.

## Capacidades

- Generacion de codigo, depuracion y explicacion de conceptos tecnicos.
- Llamada a herramientas en JSON plano, sin envoltorios de codigo, etiquetas `<tool_call>` ni texto introductorio.
- Llamadas de un solo paso con argumentos correctamente tipados.
- Llamadas multiples: emite varias lineas JSON en paralelo cuando las invocaciones son independientes y solo la primera cuando existe dependencia entre ellas.
- Interpretacion de los resultados devueltos por el host tras la ejecucion de la herramienta.
- Rechazo explicito de peticiones fuera de su alcance o no permitidas (por ejemplo, reserva de billetes o pago), acompanado de alternativas.
- Modo de razonamiento ligero mediante bloques `<think>` antes de la llamada a herramienta.
- Soporte multilingue declarado: chino, ingles y cantonés.

## Casos de uso

- Agente local de automatizacion en escritorio: el modelo puede encadenarse con herramientas propietarias (consulta de ficheros, ejecucion de scripts, APIs internas) y ejecutarse integramente en la maquina del usuario, sin enviar datos a servicios externos.
- Asistente de programacion integrado en el IDE: generacion de fragmentos, explicacion de funciones y sugerencias de depuracion, con la ventaja de una huella de memoria reducida que permite mantenerlo cargado en segundo plano.
- Operacion de herramientas de calculo: dado que el modelo falla en aritmetica mental de varios digitos, esta disenado para delegar en una herramienta `calculate`, lo que lo hace adecuado como capa de orquestacion en flujos con calculo verificable.
- Enrutador de intenciones en pipelines de agentes: al distinguir entre "requiere herramienta", "no requiere herramienta" y "debe rechazarse", puede usarse como primer clasificador de bajo coste antes de invocar un modelo mayor.
- Atencion al cliente con herramientas de consulta: consulta de estado de pedidos, disponibilidad o datos de catalogo mediante llamadas JSON contra APIs internas, con rechazo explicito de acciones para las que no tiene permisos.
- Procesamiento de lenguaje natural en chino o cantonés en entornos locales: transcripcion de intenciones, resumen de consultas y generacion de respuestas en estos idiomas sin depender de servicios en la nube.
- Prototipado rapido de agentes en Apple Silicon: gracias al soporte nativo de MLX y a un servidor compatible con la API de OpenAI, permite levantar un endpoint de pruebas en minutos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de evaluaciones de tool calling (por ejemplo, BFCL), y la busqueda web realizada no devolvio resultados relevantes sobre este modelo. La unica comparacion cuantitativa aportada por el autor es una tabla cualitativa frente a la version anterior (1b-II), que indica mejora en formato de llamada, llamadas simples y multiples, capacidad de rechazo e interpretacion de resultados, sin valores numericos.

## Requisitos de hardware

- VRAM estimada en 4 bits: aproximadamente 1,3 GB solo de pesos, con un consumo total de inferencia en torno a 1,5-2,5 GB contando cache y overhead.
- VRAM estimada en precision completa (fp16): en torno a 5 GB, calculado a partir de los 2.516.756.480 parametros; el autor no publica esta variante.
- GPU consumer: cabe holgadamente en tarjetas con 6 GB o mas (RTX 3060, RTX 4060, RTX 2060). No requiere GPU de datacenter.
- Apple Silicon: es la plataforma objetivo, con soporte nativo de MLX y cuantizacion a 4 bits; cualquier equipo con 8 GB de memoria unificada o mas deberia poder ejecutarlo.
- Opciones de despliegue: `mlx_lm.generate` y `mlx_lm.server` (endpoint compatible con la API de OpenAI) para Apple Silicon; Ollama mediante la version GGUF publicada en repositorio separado.
- vLLM y TGI no son aplicables directamente, ya que el repositorio principal esta en formato MLX y requeriria conversion a safetensors de HuggingFace.
- Latencia y throughput: no disponibles. El autor afirma que la respuesta es "muy rapida" en local, pero no aporta mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Datos verificados en esta ficha |
|---|---|---|---|---|---|
| LycheeAI-coder-2b-II-pro | ~2,5 B | 512K declarados en el base (sin verificar en la practica) | Apache 2.0 | Codigo + tool calling en JSON plano | Si |
| MiniCPM5-2B (modelo base) | ~2 B | 512K | Apache 2.0 | Modelo generalista multilingue | Si, como base declarada |
| Modelos de codigo de ~1,5-3 B de otras familias (por ejemplo, la serie Qwen2.5-Coder o Gemma 2 2B) | 1,5-3 B | 8K-32K segun familia | Apache 2.0 o licencias propias | Codigo, sin ajuste especifico de tool calling | No disponible: cifras de terceros no verificadas en esta ficha |

No se dispone de datos de rendimiento comparativo. La diferenciacion de LycheeAI-coder-2b-II-pro no reside en los parametros ni en el contexto, sino en el ajuste especifico de tool calling con salida JSON plana y en la separacion entrenada entre llamada, rechazo y respuesta directa.

## Limitaciones y advertencias

- Identidad fuera de distribucion: si el system prompt sigue el patron generico de muchos frameworks de agentes ("Eres un asistente de IA que puede usar herramientas..."), el modelo puede responder incorrectamente al preguntarle su nombre; el autor documenta un caso real en el que respondio "me llamo Qwen". La mitigacion es incluir el nombre del modelo en el system prompt.
- Razonamiento multi-paso limitado por la capacidad de un modelo de 2B.
- Contexto largo sin verificar: aunque el base declara 512K tokens, el autor no ha medido el rendimiento real en entradas extensas.
- Aritmetica mental poco fiable con numeros de varios digitos; se debe proporcionar una herramienta de calculo.
- Riesgo de alucinacion inherente a la escala del modelo, especialmente en conocimiento factual y en la invencion de parametros o nombres de herramientas fuera del conjunto entrenado.
- Formato de llamada no universal: emite JSON plano, por lo que los hosts que esperan XML tipo Anthropic o etiquetas `<tool_call>` necesitan instrucciones explicitas en el system prompt.
- El repositorio principal esta en formato MLX de 4 bits y no puede cargarse directamente con transformers; la conversion desde safetensors de HuggingFace queda a cargo del usuario.
- Ausencia total de validacion externa: cero descargas y cero valoraciones en el momento de redactar la ficha, y ningun benchmark publicado.
- No se documentan sesgos especificos ni evaluaciones de seguridad; el entrenamiento con 2.574 muestras es demasiado reducido para garantizar un comportamiento robusto en produccion.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, con la obligacion habitual de conservar el aviso de licencia. Al derivar de MiniCPM5-2B, se heredan las condiciones de la licencia del base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/whcl412/LycheeAI-coder-2b-II-pro
- Repositorio GGUF para Ollama: https://huggingface.co/whcl412/LycheeAI-coder-2b-II-pro-GGUF
- Modelo base MiniCPM5-2B: https://huggingface.co/openbmb/MiniCPM5-2B
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los enlaces obtenidos correspondian a documentacion de hojas de calculo y no guardan relacion con la ficha. No se han localizado papers, blogs tecnicos ni demos adicionales.
