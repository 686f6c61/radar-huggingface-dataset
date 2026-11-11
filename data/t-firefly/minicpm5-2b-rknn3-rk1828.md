# t-firefly/minicpm5-2b-rknn3-rk1828

## Resumen

MiniCPM5-2B RKNN3 RK1828 es una conversión del modelo denso MiniCPM5-2B de OpenBMB, publicada por el equipo de Firefly AI (t-firefly) para ejecutarse sobre el SoC Rockchip RK1828 mediante el runtime LlamaPi y el formato RKNN3. No se trata de un modelo nuevo: es un artefacto de despliegue que empaqueta los pesos del modelo original en un formato optimizado para NPU de borde, con una licencia Apache 2.0 heredada del modelo base.

El modelo original es un transformer denso tipo LlamaForCausalLM de 2.500 millones de parámetros, 42 capas y una ventana de contexto nativa de 131.072 tokens. OpenBMB lo posiciona como el segundo miembro de la familia MiniCPM5, orientado a despliegue local y a escenarios con recursos limitados, con un rendimiento que según el autor alcanza el estado del arte en la categoría de 2B y compite con modelos de 4B en código, matemáticas, contexto largo, uso de herramientas y tareas agénticas.

La relevancia de esta ficha concreta es de infraestructura: permite ejecutar un modelo conversacional de 2B con contexto largo en hardware de borde Rockchip, algo poco habitual en el ecosistema de NPU de bajo consumo. El repositorio ocupa 2,1 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, LlamaForCausalLM |
| Parametros totales | 2.500 millones (2,5B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 131.072 tokens (nativo) |
| Tipos de cuantizacion | no disponible (formato RKNN3 para RK1828; el nivel de cuantizacion no se detalla en la informacion proporcionada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | RKNN3 (runtime LlamaPi); pesos originales del modelo base en formato estandar de Hugging Face, no detallado |
| Capas | 42 |
| Plataforma objetivo | Rockchip RK1828 |
| Herramienta de despliegue | LlamaPi (`llamapi run minicpm5:2b`) |
| Tamano del repositorio | 2,1 GB |
| Modelo base | openbmb/MiniCPM5-2B |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso decoder-only con estructura LlamaForCausalLM: 42 capas, 2,5B parametros y atencion causal estandar, sin mezcla de expertos ni mecanismos hibridos. El contexto nativo es de 131.072 tokens. Esta ficha no modifica la arquitectura: Firefly AI convierte los pesos al formato RKNN3 y los empaqueta para el runtime LlamaPi sobre el SoC RK1828.

Segun la model card del autor, el modelo original se post-entreno con aprendizaje por refuerzo (RL) y destilacion on-policy (OPD) sobre el corpus abierto UltraData. No se detalla el numero de tokens de preentrenamiento, la composicion exacta del dataset ni los detalles del pipeline de RL/OPD en la informacion disponible. Tampoco se especifican innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y otros idiomas (los idiomas concretos no estan documentados en esta ficha).
- Razonamiento y comprension de contexto largo gracias a la ventana nativa de 131.072 tokens.
- Generacion de codigo, con ventajas declaradas por el autor en tareas de programacion frente a modelos de su categoria.
- Razonamiento matematico, tambien destacado por el autor como punto fuerte del modelo base.
- Uso de herramientas (tool calling / function calling) y flujos agente multi-paso, segun la model card del modelo original.
- Despliegue en hardware de borde Rockchip RK1828 mediante NPU, con runtime LlamaPi.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode) en la informacion disponible.

## Casos de uso

- Asistente local en dispositivos de borde: el modelo puede ejecutarse integramente en un SoC RK1828 sin conexion a la nube, lo que permite asistentes conversacionales con privacidad de datos y latencia baja en equipos industriales o electrodomesticos conectados.
- Procesamiento de documentos largos en el dispositivo: con 131.072 tokens de contexto, puede resumir manuales, contratos o registros tecnicos extensos sin truncar el contenido, algo util en terminales de campo sin conectividad.
- Agente de automatizacion con tool calling: integrado en LlamaPi, puede invocar funciones locales (lectura de sensores, control de actuadores, consultas a bases de datos embebidas) en flujos multi-paso.
- Asistencia a la programacion en entornos aislados: generacion y explicacion de codigo en estaciones de trabajo sin acceso a internet, apropiado para entornos con requisitos de confidencialidad.
- Atencion al cliente en kioscos o terminales fisicas: conversaciones multi-turno con contexto largo para resolver consultas frecuentes sin depender de un backend remoto.
- Educacion y tutoria offline: explicaciones paso a paso de matematicas y conceptos tecnicos en dispositivos de bajo consumo, con el modelo residente en la NPU.
- Prototipado de producto en hardware Rockchip: validacion de experiencias conversacionales antes de escalar a infraestructura mayor, usando el mismo modelo base que en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del modelo original afirma de forma cualitativa que alcanza el estado del arte en la categoria de 2B y compite con modelos de 4B en codigo, matematicas, contexto largo, uso de herramientas y tareas agenticas, pero no se proporcionan cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion en los datos facilitados.

## Requisitos de hardware

- Plataforma objetivo: SoC Rockchip RK1828 con aceleracion NPU y runtime LlamaPi.
- VRAM estimada: no disponible. El repositorio ocupa 2,1 GB, lo que da una cota superior del espacio de almacenamiento necesario; el consumo de memoria en ejecucion depende del nivel de cuantizacion RKNN3, que no se detalla.
- GPU recomendadas: no aplica para el artefacto RKNN3; esta pensado para la NPU del RK1828. Para ejecutar el modelo base en GPU convencional se requeriria el checkpoint original de openbmb/MiniCPM5-2B, no incluido aqui.
- Compatibilidad con GPU de consumo: el artefacto de este repositorio no esta pensado para GPU de consumo; para RTX 4090 o similares habria que usar el modelo base en formato estandar (safetensors o GGUF) con vLLM, llama.cpp u Ollama.
- Opciones de despliegue: LlamaPi (`llamapi run minicpm5:2b`), que gestiona descarga, carga y ejecucion. No se documentan otras opciones para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM5-2B (openbmb) | 2,5B | 131.072 | Apache 2.0 | Modelo base denso para despliegue local | Hugging Face y ModelScope |
| MiniCPM5-2B RKNN3 RK1828 (esta ficha) | 2,5B | 131.072 | Apache 2.0 | Conversion para NPU Rockchip RK1828 con LlamaPi | Hugging Face (t-firefly) |
| Alternativas de 2B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la informacion proporcionada que permitan una comparativa cuantitativa fiable. La unica comparacion posible es estructural: esta ficha es funcionalmente identica al modelo base en capacidad, y se diferencia en el formato de pesos y la plataforma de ejecucion.

## Limitaciones y advertencias

- Al ser una conversion del modelo base, hereda sus sesgos y riesgos de alucinacion; no se documentan evaluaciones de sesgo ni de seguridad en la informacion disponible.
- El modelo es de 2,5B parametros: su capacidad de razonamiento complejo y conocimiento factual es inferior a la de modelos de mayor tamano, y puede producir respuestas plausibles pero incorrectas en dominios especializados.
- La ventana de 131.072 tokens es nativa, pero el rendimiento real en contextos muy largos sobre NPU de borde no esta documentado.
- No se especifican los idiomas soportados; no debe asumirse un multilingue amplio sin verificacion previa.
- El nivel de cuantizacion RKNN3 no se detalla, por lo que la perdida de precision respecto al modelo original es desconocida.
- La licencia Apache 2.0 permite uso comercial, pero los derechos de propiedad intelectual del modelo original siguen siendo de OpenBMB; la model card exige mantener la atribucion correspondiente.
- El artefacto esta atado al SoC RK1828 y al runtime LlamaPi; no es portable a otras plataformas sin reconversion.
- El repositorio no registra descargas ni interacciones, por lo que no hay evidencia de comunidad ni de validacion independiente del artefacto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/t-firefly/minicpm5-2b-rknn3-rk1828
- Modelo base en Hugging Face: https://huggingface.co/openbmb/MiniCPM5-2B
- Modelo base en ModelScope: https://modelscope.cn/models/OpenBMB/MiniCPM5-2B
- Firefly AI Team: https://www.t-firefly.com/
- Documentacion de LlamaPi: https://community.t-firefly.com/en/docs/ai/applications/LlamaPi/llamapi/introduction
- Licencia Apache 2.0: https://huggingface.co/licenses/apache-2.0
