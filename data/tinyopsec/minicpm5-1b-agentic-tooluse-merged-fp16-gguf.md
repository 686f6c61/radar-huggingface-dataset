# tinyopsec/MiniCPM5-1B-Agentic-Tooluse-Merged-FP16-GGUF

## Resumen

`tinyopsec/MiniCPM5-1B-Agentic-Tooluse-Merged-FP16-GGUF` es una distribución de cuantizaciones GGUF generada con llama.cpp a partir de `ewin-reg/MiniCPM5-1B-Agentic-Tooluse-Merged-FP16`, un checkpoint "merged" (fusión de pesos) afinado específicamente para uso de herramientas y flujos agénticos sobre el modelo base `openbmb/MiniCPM5-1B`. El autor de la conversión es el usuario `tinyopsec`, y el modelo se publica bajo licencia Apache 2.0.

El interés práctico del artefacto es doble. Por un lado, empaqueta un modelo de 1.080.632.832 parámetros en trece ficheros GGUF que van desde F16 (2,0 GB según la model card) hasta Q2_K, lo que permite ejecutarlo en CPU, en GPU de gama de entrada o en dispositivos con pocos recursos mediante llama.cpp, Ollama, LM Studio o koboldcpp. Por otro, el ajuste declarado está orientado a *tool calling* y uso agéntico, un nicho donde los modelos grandes son la referencia habitual y los modelos pequeños suelen fallar por formato.

La información publicada es escasa: la model card del repositorio se limita a listar los ficheros, un ejemplo de invocación y una advertencia de evaluación previa. No se documentan arquitectura, longitud de contexto, idiomas, composición del dataset de ajuste ni resultados de benchmarks, por lo que esta ficha marca explícitamente esos campos como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (no se documenta en la model card; el modelo base es `openbmb/MiniCPM5-1B`) |
| Parámetros totales | 1.080.632.832 (dato real de safetensors, aproximadamente 1,08 B) |
| Parámetros activos | No aplica / no disponible (no se documenta una variante MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M (recomendada por el autor), Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el checkpoint de origen se distribuye en FP16 |
| Modelo base | `openbmb/MiniCPM5-1B` |
| Checkpoint de origen | `ewin-reg/MiniCPM5-1B-Agentic-Tooluse-Merged-FP16` |
| Autor de la conversión | `tinyopsec` |
| Tamaño del repositorio | 10,8 GB (incluye las trece cuantizaciones) |
| Tamaño de los pesos F16 | 2,0 GB (según la model card) |
| Pipeline | text-generation |
| Runtime soportado | llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF |
| Compatibilidad con endpoints | Etiquetado como `endpoints_compatible` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna en la documentación proporcionada. La model card no describe el tipo de red (transformer denso, MoE o híbrida), ni la estrategia de atención, ni la longitud de contexto nativa. Tampoco se detalla el proceso de entrenamiento del modelo base `openbmb/MiniCPM5-1B`: no hay datos sobre número de tokens, composición del corpus, fases de preentrenamiento, SFT, RLHF o DPO.

Respecto al ajuste específico, el nombre del checkpoint de origen indica una fusión de pesos (*merge*) orientada a *tool use* y comportamiento agéntico, pero no se publica la receta: ni la composición del dataset de herramientas, ni el método de fusión (por ejemplo, linear o SLERP), ni los hiperparámetros empleados. Tampoco se documenta si se aplicó una plantilla de chat concreta ni el formato exacto de las llamadas a funciones, un dato crítico para reproducir el comportamiento esperado en producción. La conversión a GGUF se realizó con llama.cpp, que aplica las transformaciones estándar de tensor y las tablas de cuantización K-quants e I-quants habituales.

## Capacidades

- Generación de texto conversacional en formato de instrucciones, según la etiqueta `conversational` del repositorio.
- Llamada a herramientas y funciones (*tool calling*): es la capacidad declarada de forma explícita en el nombre y en las etiquetas del modelo.
- Comportamiento agéntico: el ajuste está orientado a flujos de varios pasos con selección de herramientas, aunque no se documenta el soporte concreto de *multi-step reasoning* ni de planificación.
- Integración en runtimes locales: al estar en GGUF, funciona con llama.cpp, Ollama, LM Studio y koboldcpp sin dependencias de Python.
- Compatibilidad con infraestructura de endpoints: etiqueta `endpoints_compatible`, que indica que puede servirse mediante los endpoints de Hugging Face.
- Capacidades multimodales, de audio o de visión: no disponibles (el pipeline es `text-generation`).
- Idiomas: no disponibles. No se puede confirmar cobertura multilingüe ni el grado de competencia en castellano.
- Modo de razonamiento explícito (*thinking mode*): no documentado.

## Casos de uso

- **Agente local de escritorio para automatizar tareas del sistema**: con Q4_K_M (unos 0,7 GB de pesos) el modelo cabe en RAM y puede ejecutarse en CPU, de modo que un asistente personal podría interpretar instrucciones en lenguaje natural y traducirlas a llamadas de herramientas locales (leer ficheros, lanzar comandos) sin enviar datos a la nube.
- **Enrutador de intenciones en pipelines de agentes**: usar un modelo de 1 B como clasificador que decida qué herramienta o subagente invoca un modelo mayor; el coste por llamada es mínimo y la latencia baja, lo que permite colocarlo delante de un LLM grande para filtrar peticiones triviales.
- **Extracción de datos estructurados desde texto libre**: generación de JSON con un esquema fijo a partir de correos, tickets o notas, apoyándose en el ajuste de *tool calling* para forzar la estructura; adecuado cuando el volumen es alto y el presupuesto de inferencia es reducido.
- **Prototipado y pruebas de marcos agénticos en CI**: al ser un GGUF pequeño y determinista en la carga, sirve para ejecutar tests automatizados de integración de herramientas (smolagents, LangChain, LlamaIndex) en runners sin GPU, validando el parseo de llamadas y el manejo de errores.
- **Despliegue en dispositivos con recursos limitados**: Raspberry Pi, mini-PC o portátiles sin GPU dedicada pueden ejecutar la cuantización Q4_K_M o Q3_K_M con llama.cpp, habilitando asistentes de consulta offline en entornos sin conectividad.
- **Automatización de atención al cliente de primer nivel**: respuestas a consultas frecuentes y derivación al operador adecuado mediante llamadas a funciones internas (consulta de pedido, estado de ticket), con la salvedad de que la ventana de contexto no está documentada y condiciona las conversaciones multi-turno largas.
- **Asistente para operaciones y DevOps**: interpretar peticiones como "consulta el estado del despliegue" y emitir la llamada a la API correspondiente, integrado en un bot de chat interno; el tamaño reducido permite ejecutarlo junto al resto de servicios en el mismo nodo.
- **Generación de llamadas a funciones en asistentes de voz o IoT**: al tener una huella de memoria de unos pocos cientos de MB en cuantización de 4 bits, puede incrustarse en pasarelas domésticas para traducir órdenes a comandos MQTT o HTTP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card del repositorio no incluye métricas de MMLU, HumanEval, GSM8K, BFCL (*Berkeley Function Calling Leaderboard*) ni de ninguna otra evaluación. Tampoco se aportan comparaciones con el modelo base ni con el checkpoint fusionado del que deriva la cuantización. Cualquier cifra de rendimiento para este artefacto debería obtenerse mediante evaluación propia antes de tomar decisiones de despliegue.

## Requisitos de hardware

- **VRAM/RAM estimada para los pesos** (cálculo a partir de 1,08 B de parámetros; los tamaños de Q4_K_M e inferiores son estimaciones, no datos publicados):

| Cuantización | Tamaño aproximado de pesos | Memoria mínima recomendada con contexto y overhead |
|---|---|---|
| F16 | 2,0 GB (dato de la model card) | ~3 GB |
| Q8_0 | ~1,15 GB | ~2 GB |
| Q6_K | ~0,9 GB | ~1,8 GB |
| Q5_K_M | ~0,8 GB | ~1,6 GB |
| Q4_K_M | ~0,7 GB | ~1,5 GB |
| Q3_K_M | ~0,55 GB | ~1,3 GB |
| Q2_K | ~0,4 GB | ~1,1 GB |

- **GPU recomendadas**: cualquier GPU con 4 GB o más de VRAM puede alojar el modelo completo en Q4_K_M o Q5_K_M. Se puede emplear desde una GTX 1650 o RTX 3050 de portátil hasta una RTX 4090, A10, L4, A100 o H100; en estas últimas el modelo ocupa una fracción mínima de memoria y el límite real será el throughput de peticiones concurrentes.
- **¿Cabe en GPU de consumo?**: sí, en todas las GPU de consumo actuales con 4 GB o más de VRAM, incluso en F16 (2,0 GB). También cabe en iGPU y en CPU exclusivamente.
- **Opciones de despliegue**: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, koboldcpp y, para servir en producción, `llama.cpp` con el servidor HTTP o vLLM si se convierte el checkpoint FP16 a safetensors (vLLM no consume GGUF K-quants de forma nativa). El soporte en TGI no está documentado.
- **Latencia y throughput**: no se han publicado mediciones. Como referencia orientativa no medida, un modelo denso de ~1 B en cuantización de 4 bits suele generar decenas de tokens por segundo en CPU moderna y varios cientos por segundo por secuencia en GPU, pero estas cifras deben validarse en el hardware objetivo.
- **Nota sobre almacenamiento**: el repositorio completo ocupa 10,8 GB por incluir las trece cuantizaciones; conviene descargar únicamente el fichero necesario.

## Comparativa con modelos similares

Los datos de las filas de comparación provienen de la documentación pública de cada familia y no de la información proporcionada en esta ficha; conviene verificarlos en la fuente original antes de citarlos.

| Modelo | Parámetros | Contexto | Licencia | Formato | Orientación |
|---|---|---|---|---|---|
| Este modelo (MiniCPM5-1B agentic, GGUF) | ~1,08 B | No disponible | Apache 2.0 | GGUF (13 cuantizaciones) | Tool calling y agentes |
| Qwen2.5-1.5B-Instruct | ~1,54 B | 32 768 tokens nativos (ampliable con YaRN) | Apache 2.0 | safetensors, GGUF | Instrucciones generales, multilingüe |
| Llama-3.2-1B-Instruct | ~1,23 B | 128 000 tokens | Llama 3.2 Community License | safetensors, GGUF | Instrucciones generales, contexto largo |
| Gemma-3-1B-it | ~1 B | 32 768 tokens | Gemma Terms of Use | safetensors, GGUF | Instrucciones generales, multilingüe |

Frente a estas alternativas, la ventaja declarada del modelo es su especialización en *tool calling* y la disponibilidad inmediata en trece cuantizaciones GGUF. Las desventajas son la ausencia de documentación sobre contexto, idiomas y benchmarks, y una licencia Apache 2.0 que, a diferencia de Llama 3.2 y Gemma 3, no impone restricciones adicionales de uso comercial.

## Limitaciones y advertencias

- **Ausencia total de benchmarks**: no hay ninguna métrica publicada que permita estimar la calidad del ajuste ni compararlo con el modelo base. Es imprescindible evaluar la tasa de llamadas a herramientas correctamente formadas y la precisión en la selección de función antes de usarlo en producción.
- **Checkpoint fusionado sin receta**: al tratarse de un *merge*, existe riesgo de degradación de capacidades generales (lenguaje, matemáticas, sentido común) respecto al modelo base. No se documenta qué se preservó ni con qué proporción de pesos.
- **Formato de tool calling no documentado**: no se especifica la plantilla de chat ni el esquema exacto de llamadas a funciones (estilo JSON, XML o etiquetas propias). Sin esa información, el parseo en producción puede fallar de forma silenciosa.
- **Ventana de contexto desconocida**: no se puede garantizar el comportamiento en conversaciones largas ni el tamaño de KV cache a reservar. Cualquier despliegue debe fijar un límite conservador y probarlo.
- **Idiomas no declarados**: no hay confirmación de soporte de castellano ni de otras lenguas. Un modelo de 1 B ajustado para agentes puede degradar notablemente la calidad fuera del inglés si el dataset de ajuste no fue multilingüe.
- **Riesgo de alucinación en argumentos de herramientas**: los modelos pequeños tienden a inventar nombres de función o parámetros inexistentes. Se recomienda validación estricta contra un esquema (por ejemplo, JSON Schema) y rechazo de llamadas no conformes.
- **Capacidad limitada por tamaño**: con ~1 B de parámetros, el razonamiento multi-paso complejo, la aritmética y el código de cierta extensión estarán por debajo de modelos de 7 B o superiores. No es adecuado como único modelo en tareas analíticas exigentes.
- **Sesgos no evaluados**: no se ha publicado ninguna evaluación de sesgo, toxicidad o seguridad. Al desconocerse la composición del dataset de ajuste, el riesgo de sesgos heredados es real.
- **Licencia**: Apache 2.0 permite uso comercial y modificación, pero conviene revisar los términos del modelo base `openbmb/MiniCPM5-1B` y del checkpoint intermedio por si añaden condiciones adicionales.
- **Repositorio sin tracción**: cero descargas y cero *likes* en el momento de la consulta, sin mantenimiento demostrado ni issues resueltos. La reproducibilidad depende de un único autor.
- **Advertencia del propio autor**: la model card incluye un descargo explícito ("Agentic tool-use model. Evaluate before use"), que subraya la necesidad de validación previa.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/tinyopsec/MiniCPM5-1B-Agentic-Tooluse-Merged-FP16-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-1B
- Checkpoint FP16 de origen (referenciado en la model card): https://huggingface.co/ewin-reg/MiniCPM5-1B-Agentic-Tooluse-Merged-FP16
- llama.cpp, herramienta empleada para la conversión: https://github.com/ggerganov/llama.cpp
- Ollama, runtime compatible con GGUF: https://ollama.com
- LM Studio, runtime compatible con GGUF: https://lmstudio.ai
- Papers, blogs o demos adicionales: no disponibles en la información proporcionada.
