# Thox-ai/ThoxOpen-14B

## Resumen

ThoxOpen-14B es un paquete de configuración publicado por Thox-ai sobre los pesos sin modificar de Qwen/Qwen3-14B. No se trata de un fine-tune: el repositorio contiene únicamente un `Modelfile` de Ollama (914 B), un `manifest.json` (340 B) y un fichero de conocimiento en JSONL (`thox-knowledge-v0.1.jsonl`, 4.652 B con 8 entradas públicas verificadas). El autor declara explícitamente que no ha entrenado los pesos y que la personalización se limita a un perfil de sistema («THOX Open system profile») más un pack de conocimiento versionado para recuperación local.

El modelo se posiciona como el escalón alto de la familia ThoxOpen para portátiles, por encima de ThoxOpen-8B, y está pensado para inferencia local offline mediante Ollama, con un endpoint local compatible con la API de OpenAI que consumen ThoxChat y MeshStack Desktop. La propuesta de valor es la distribución reproducible: la etiqueta de Ollama queda fijada a `qwen3:14b` y el manifiesto registra el digest del peso base, de modo que el artefacto es auditable.

La relevancia es limitada desde el punto de vista de investigación: al no haber entrenamiento ni evaluación comparativa frente a otros modelos, su interés reside en el patrón de empaquetado (perfil de sistema + knowledge pack + pin de procedencia) y en las mediciones de rendimiento en CPU que el autor publica, que documentan con cifras concretas el coste de ejecutar un modelo de 14B en un host sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-14B; no se detalla en la información disponible) |
| Parametros totales | 14B (heredados de Qwen3-14B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (configurado en el Modelfile empaquetado) |
| Tipos de cuantizacion | Q4_K_M (etiqueta por defecto de Ollama, 9,28 GB); otras cuantizaciones de Qwen3-14B no verificadas en este paquete |
| Idiomas soportados | Inglés (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | No se distribuyen pesos en el repositorio; se referencian mediante etiqueta de Ollama (`qwen3:14b`). El paquete incluye `Modelfile`, `manifest.json` y `thox-knowledge-v0.1.jsonl` |

## Arquitectura y entrenamiento

No hay entrenamiento. El modelo base es Qwen/Qwen3-14B, obtenido a través de la etiqueta de Ollama `qwen3:14b`, con el digest fijado en el manifiesto de procedencia (`sha256:bdbd181c33f2…`). La única capa de personalización es el perfil de sistema definido en `profiles/SYSTEM-open.txt`, que orienta al modelo hacia respuestas directas y control por parte del usuario, junto con el THOX Knowledge Pack v0.1, un conjunto de 8 entradas JSONL pensado para recuperación local (no se especifica el mecanismo de recuperación empleado).

El autor insiste en dos puntos técnicos: el release no es un fine-tune de «refusal mínimo» ni un modelo sin censura, y la franqueza observada en las pruebas proviene exclusivamente del perfil de sistema, no de una modificación de pesos. Cualquier innovación arquitectónica de Qwen3-14B (mecanismos de atención, decodificación, etc.) no se describe en la información disponible y debe consultarse en la model card del modelo base.

## Capacidades

- Generación de texto en inglés con el perfil de sistema THOX aplicado (respuestas directas, control del usuario).
- Respuesta fundamentada sobre el THOX Knowledge Pack v0.1: en la evaluación del autor, 8 de 8 ítems puntuados coincidieron exactamente con los pasajes suministrados.
- Declinación de verificación de estado en tiempo real: ante una pregunta trampa sobre topología fabricada, el modelo rechazó confirmar el número de nodos sin acceso a métricas reales y sin autorización de runtime.
- Distinción conceptual correcta entre enrutamiento de peticiones y paralelismo tensorial, aunque la respuesta agotó el límite de 768 tokens y truncó la tabla comparativa final.
- Recomendación con orden de preferencia: procesamiento local primero, nodo de malla de confianza con autorización explícita después, nube solo con consentimiento explícito del usuario.
- Capacidades adicionales del base (código, matemáticas, tool calling, agentes, multilingüismo) no están documentadas ni verificadas en este paquete; la model card solo declara inglés y no menciona function calling.

## Casos de uso

- Inferencia local offline en portátiles bien equipados: el paquete se construye con `ollama create` y se ejecuta sin conexión, con un consumo medido de 10,3 GiB de memoria de proceso en contexto de 8.192 tokens, lo que encaja en equipos de 16 GB o más.
- Asistente documental de escritorio: con 8.192 tokens de contexto y el knowledge pack cargado, el modelo responde sobre un corpus acotado y verificado, adecuado para consultas internas donde la trazabilidad de la fuente importa.
- Despliegue reproducible y auditable: el pin de la etiqueta base y el digest en `manifest.json` permiten reconstruir el artefacto exacto en otra máquina, útil en entornos con requisitos de procedencia.
- Integración vía API compatible con OpenAI: Ollama expone un endpoint local que ThoxChat y MeshStack Desktop consumen, de modo que el modelo puede sustituir a un endpoint remoto en herramientas ya existentes sin cambiar el cliente.
- Escenarios de privacidad y residencia de datos: el perfil de sistema instruye a preferir procesamiento local y a requerir autorización explícita para enviar datos a la nube o a nodos de malla, lo que sirve como capa de política en flujos con datos sensibles.
- Evaluación de patrones de empaquetado: para equipos que diseñan distribuciones de modelos (perfil de sistema + knowledge pack + manifiesto), este repositorio es un ejemplo pequeño y legible de la estructura, con solo tres ficheros.
- No recomendado para servicio interactivo en CPU: con 0,55–1,50 tokens/s medidos en un host de 8 vCPU, la latencia hace inviable la conversación fluida sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K u otros). El autor solo reporta una suite de humo cualitativa y mediciones de throughput y memoria:

| Metrica | Valor medido |
|---|---|
| Suite de humo (protocolo Knowledge Pack v0.1) | 3 de 3 ítems de fábrica superados; trampa de topología fabricada superada |
| Fundamentación en knowledge pack | 8 de 8 ítems puntuados con coincidencia exacta |
| Throughput (CPU, 8 vCPU / 32 GB, solo CPU) | 0,55–1,50 tokens/s en ítems cortos con tope de 768 tokens |
| Generación larga (1.024 tokens) | 1,04 tokens/s; 998 s de tiempo de pared |
| Memoria pico de proceso (contexto 8.192) | 10,3 GiB (~11,1 GB); servidor de inferencia reporta 10,76 GB |
| Carga en host de 4 vCPU / 8 GB RAM | Fallo: la conexión del servidor se cerró durante la carga |

## Requisitos de hardware

- RAM del sistema: mínimo 16 GB. Con 8 GB o menos el modelo no carga (los pesos Q4_K_M son 9,28 GB y hay que sumar la caché KV).
- VRAM estimada para GPU: no medida en la información disponible; como referencia de orden de magnitud, los pesos Q4_K_M ocupan 9,28 GB, por lo que una GPU de 12 GB o más es el umbral razonable para Q4_K_M con contexto moderado, y 24 GB para cuantizaciones mayores o contexto completo.
- GPU recomendadas: no especificadas por el autor. Para 14B en Q4_K_M, opciones habituales de la categoría son RTX 4090 (24 GB), A100 (40/80 GB) y H100; ninguna validada en este paquete.
- GPU de consumo: cabe en tarjetas de 16–24 GB con Q4_K_M; en 8–12 GB habría que reducir contexto o usar cuantizaciones más agresivas, no verificadas aquí.
- Despliegue: Ollama es la vía soportada y documentada (`ollama create` + `ollama run`). vLLM, llama.cpp directo, TGI u otros no se mencionan ni se han probado.
- Latencia y throughput: en CPU de 8 vCPU, 0,55–1,50 tokens/s; el propio autor desaconseja el uso interactivo en ese tipo de host y recomienda GPU o una máquina más rápida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento propio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThoxOpen-14B | 14B (Qwen3-14B) | 8.192 configurado | No (solo perfil y knowledge pack) | Apache 2.0 | Público en HuggingFace; pesos vía Ollama |
| Qwen/Qwen3-14B | 14B | No disponible en la información proporcionada | Sí (modelo base) | Apache 2.0 | Público en HuggingFace |
| ThoxOpen-8B | 8B (base no confirmada) | No disponible | No (mismo patrón de empaquetado) | No disponible en la información | Público, escalón inferior de la familia |
| ThoxOpen-4B | 4B (base no confirmada) | No disponible | No (mismo patrón de empaquetado) | No disponible en la información | Público, escalón inferior de la familia |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada; la única comparación posible es estructural (tamaño, contexto configurado y naturaleza del artefacto).

## Limitaciones y advertencias

- No es un modelo sin censura: el comportamiento de rechazo es el del base Qwen3-14B, moderado solo por el perfil de sistema. El autor prohíbe explícitamente comercializarlo como «uncensored».
- No hay entrenamiento ni ajuste fino: cualquier mejora de comportamiento atribuible al paquete depende del prompt de sistema y del knowledge pack, no de los pesos.
- Cobertura lingüística declarada únicamente en inglés; el rendimiento en castellano no está verificado.
- Contexto configurado en 8.192 tokens, inferior al máximo del base si este fuese mayor; documentos largos requerirán troceado.
- Riesgo de alucinación no evaluado de forma sistemática: la suite de humo es cualitativa y consta de tres ítems más ocho preguntas de fundamentación, sin métricas agregadas.
- El knowledge pack v0.1 contiene solo 8 entradas; fuera de ese corpus el modelo responde con el conocimiento del base y sin garantía de actualidad.
- Requisito duro de memoria: no carga en hosts de 8 GB de RAM o menos; el intento en 4 vCPU / 8 GB falló durante la carga.
- Throughput muy bajo en CPU (0,55–1,50 tokens/s), incompatible con uso conversacional interactivo sin GPU.
- La respuesta a la pregunta de enrutamiento frente a paralelismo tensorial se truncó en el tope de 768 tokens; el propio autor lo señala como defecto de la prueba, no del modelo, pero indica que las respuestas largas pueden cortarse con los límites configurados.
- Licencia Apache 2.0 permite uso comercial de los pesos base; el perfil de sistema y el knowledge pack son aportaciones del autor y su régimen de reutilización más allá del repositorio no se detalla.
- Cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/Thox-ai/ThoxOpen-14B
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
- Etiqueta de Ollama referenciada: `qwen3:14b` (no se proporciona URL en la información disponible)
- Paper, blog o repositorio adicionales: no disponibles en la información proporcionada
