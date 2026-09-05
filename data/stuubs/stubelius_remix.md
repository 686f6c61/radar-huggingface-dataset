# Stuubs/Stubelius_Remix

## Resumen

Stubelius Remix es un checkpoint personalizado de LTX 2.5, desarrollado por Stuubs, que recupera la linea estilizada y 2D de la era LTX 2.3 sobre la base tecnica del motor LTX 2.5 de Lightricks. El problema que resuelve es la perdida del "alma" 2D/anime en las versiones 2.5 existentes, que se orientan principalmente a personajes fotorrealistas. El modelo no es un merge ingenuo, sino que emplea aritmetica de vectores de tareas: extrae deltas de los modelos donantes Sulphur 2 y 10Eros contra su base LTX 2.3 y los inyecta en el transformer de LTX 2.5 con una ponderacion por profundidad de bloque y por componente. Incluye 4.349 tensores en 48 bloques, y esta pensado para generar video con personajes 2D/2.5D/anime y capacidades NSFW, aprovechando las caracteristicas de movimiento, audio y dialogo de LTX 2.5. La arquitectura concreta, el numero de parametros y el contexto no se especifican en la documentacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para video basado en transformer (LTX 2.5), con inyeccion de deltas de tareas de modelos donantes |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | ltx-2-community-license-agreement |
| Formato de pesos | no disponible (checkpoint de difusion; no se especifica safetensors, GGUF, etc.) |
| Tecnica de fusion | Aritmetica de vectores de tareas (task-vector delta arithmetic), con 4.349 tensores y 48 bloques |
| Estado | beta 1 |

## Arquitectura y entrenamiento

Stubelius Remix no es un modelo entrenado desde cero, sino un checkpoint derivado mediante aritmetica de vectores de tareas. El proceso extrae los deltas de Sulphur 2 y 10Eros respecto a su base LTX 2.3, y luego los inyecta en el transformer de LTX 2.5. La inyeccion se realiza con una ponderacion que depende de la profundidad del bloque y del componente: los bloques tempranos preservan el conocimiento de composicion, mientras que los tardios favorecen el prior estilizado 2D. Ademas, las contribuciones fotorrealistas de los MLP se suprimen deliberadamente. Esta configuracion produce un balance de estilos que el autor describe como una primera pasada, sujeta a evolucion en una futura beta 2. No se proporcionan datos sobre el proceso de entrenamiento tradicional (tokens, dataset, RLHF/DPO), porque no aplica a este tipo de modelo.

## Capacidades

- Generacion de video de personajes en estilo 2D, 2.5D y anime, usando el conjunto de caracteristicas completo de LTX 2.5 (movimiento, audio y dialogo).
- Capacidades NSFW a traves del linaje Sulphur/Eros, orientado a trabajo creativo para adultos que consienten.
- Compatibilidad con el paquete Stubelius LTX Director: incluye funciones de busqueda de semillas (seed hunt), refinamiento, referencias Licon MSR, IC-LoRA e ingredientes.
- Uso con el LoRA destilado de LTX a una fuerza de 0.6 a 1.0, con 10 a 12 pasos de inferencia; sin el LoRA, la salida es borrosa e insuficiente.
- Soporte de CFG 1 con el LoRA destilado y samplers habituales (euler y linear_quadratic) segun las pruebas del autor.
- Carga como modelo de difusion mediante UNETLoader / Load Diffusion Model, usando los VAEs y text encoder normales de LTX 2.5.
- No se mencionan capacidades de tool calling, agentes, razonamiento multi-paso ni entrada de vision.

## Casos de uso

- Creacion de cortos animados para redes sociales: el modelo puede generar personajes 2D con movimiento y dialogo, reduciendo el tiempo de produccion mediante el LoRA destilado.
- Prototipado de personajes para animacion: permite explorar rapidamente disenos 2D/2.5D con expresividad de audio y dialogo, coherentes con las caracteristicas de LTX 2.5.
- Narrativa visual episodica: gracias al enfasis en composicion en los bloques tempranos, es adecuado para mantener la coherencia entre escenas de una serie corta.
- Contenido creativo para adultos con verificacion de edad: el modelo ofrece capacidades NSFW controladas por licencia y destinadas exclusivamente a trabajo con adultos que consienten.
- Experimentacion con tecnicas de fusion de modelos: sirve como referencia para investigar como la aritmetica de vectores de tareas puede transferir estilos entre generaciones de modelos de video.
- Flujos de produccion con el ecosistema Stubelius Director: puede integrarse en pipelines de direccion de video que requieren busqueda de semillas, refinamiento y referencias de estilo especificas.
- Generacion de imagenes animadas a partir de textos: al cargarse con los VAEs y text encoder de LTX 2.5, se puede usar para convertir prompts en secuencias animadas de personajes estilizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de metricas como MMLU, HumanEval o GSM8K, ni comparaciones de rendimiento con otros modelos de generacion de video.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; al tratarse de un modelo de difusion de video se esperan requisitos altos, pero no hay datos concretos.
- Opciones de despliegue: no disponible. Se menciona el uso con cargadores de modelos de difusion (UNETLoader / Load Diffusion Model) y samplers euler y linear_quadratic, pero no se listan plataformas como vLLM, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

El modelo se basa en LTX 2.5 y utiliza Sulphur 2 y 10Eros como donantes, pero no se dispone de especificaciones de parametros, contexto ni rendimiento para estos modelos. Por tanto, no es posible realizar una comparacion tecnica numerica rigurosa. En una comparacion cualitativa, Stubelius Remix se diferencia de los checkpoints 2.5 centrados en fotorrealismo por su enfoque deliberado en estilos 2D/2.5D/anime, logrado mediante la inyeccion selectiva de deltas y la supresion de contribuciones fotorrealistas. Los detalles de licencia y disponibilidad de los modelos citados no se especifican en la documentacion proporcionada.

## Limitaciones y advertencias

- Es una beta 1: el balance de estilos es un primer borrador y puede evolucionar significativamente en versiones posteriores.
- Depende del LoRA destilado de LTX entre 0.6 y 1.0 de fuerza; sin el LoRA, la salida es borrosa e insuficiente, lo que impide un uso directo con la configuracion por defecto.
- Es un modelo con capacidades NSFW; debe utilizarse exclusivamente para trabajo creativo con adultos que consienten. El autor advierte de revisar las licencias del modelo base y de los donantes antes de cualquier uso comercial.
- La licencia ltx-2-community-license-agreement puede imponer restricciones de uso comercial que no estan detalladas en la informacion disponible; es necesario consultar el texto completo.
- No se proporcionan datos sobre sesgos, alucinacion o limitaciones de idioma. La ausencia de esta informacion no implica que el modelo carezca de riesgos.
- No hay informacion sobre el numero de parametros, el formato de pesos ni los requisitos de hardware, lo que limita la evaluacion tecnica y el despliegue en entornos de produccion.

## Enlaces

- HuggingFace: https://huggingface.co/Stuubs/Stubelius_Remix
- Licencia LTX-2: https://github.com/Lightricks/LTX-2/blob/main/LICENSE-2_x
