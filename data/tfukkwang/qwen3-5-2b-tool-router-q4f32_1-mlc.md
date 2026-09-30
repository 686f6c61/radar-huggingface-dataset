# tfukkwang/Qwen3.5-2B-tool-router-q4f32_1-MLC

## Resumen

Qwen3.5-2B-tool-router-q4f32_1-MLC es un ajuste fino del modelo Qwen/Qwen3.5-2B (unos 2.000 millones de parámetros) publicado por el usuario tfukkwang. No es un modelo de chat general: está entrenado como enrutador de herramientas, es decir, su salida son llamadas a funciones con sus argumentos, y no redacta hechos ni cifras por sí mismo. Los pesos se distribuyen en formato MLC `q4f32_1` (1,1 GB) para ejecutarse en el navegador con WebLLM sobre WebGPU.

El problema que resuelve es concreto: enrutar de forma fiable la petición de un usuario hacia la herramienta adecuada en aplicaciones de negocio (pedidos, tickets, facturas, clínicas, flotas), dejando la redacción de la respuesta a un modelo mayor o a un motor de reglas. El ajuste se hizo con LoRA (r=16) sobre 2.000 conversaciones generadas en torno a 30 aplicaciones ficticias, cada una con su propio system prompt, nombres de herramientas, argumentos y enumeraciones, de modo que el modelo aprenda enrutado genérico y no el de una única aplicación.

Su relevancia actual radica en dos factores. Primero, el rendimiento medido por el autor en su propia evaluación: 150/150 aciertos en aplicaciones no vistas frente a 73/150 del modelo base, y 18/18 en el prompt exacto de una aplicación real de análisis de crédito con 10 herramientas, incluidas tres añadidas después del entrenamiento. Segundo, el despliegue: cabe en el navegador del usuario, sin backend y sin instalación, gracias a la librería WebGPU oficial del modelo base. Como contrapartida, se trata de un modelo de comunidad con 0 descargas y 0 likes en el momento de redactar esta ficha, sin benchmarks estándar publicados ni documentación de idiomas o de ventana de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | La del modelo base Qwen/Qwen3.5-2B, sin modificaciones (el autor indica que no fue necesaria una nueva compilación). No se detalla en la model card |
| Parametros totales | ~2.000 millones (heredados de Qwen/Qwen3.5-2B) |
| Parametros activos | No aplica (no se describe como modelo MoE) |
| Longitud de contexto | No disponible (no se especifica en la model card) |
| Tipos de cuantizacion | `q4f32_1` (MLC). No se enumeran otras cuantizaciones en el repositorio |
| Idiomas soportados | No disponible (la model card no los especifica) |
| Licencia | Apache-2.0 (con enlace a la licencia de Qwen/Qwen3.5-2B) |
| Formato de pesos | MLC LLM / WebGPU (no se publican safetensors ni GGUF en este repositorio). Tamano del repo: 1,1 GB |

## Arquitectura y entrenamiento

El modelo reutiliza íntegramente la arquitectura de Qwen/Qwen3.5-2B; el autor afirma explícitamente que la arquitectura no cambió y que, por ello, pudo reutilizar la librería WebGPU oficial del modelo base (`Qwen3.5-2B-q4f32_1_cs1k-webgpu.wasm`). El ajuste se aplicó con LoRA de rango 16 sobre los pesos originales, durante 2 épocas, en bf16 y en aproximadamente 25 minutos sobre una única RTX 3070. Posteriormente, los pesos fusionados se convirtieron al formato MLC `q4f32_1`. La model card no documenta el número de tokens de entrenamiento, la composición del dataset más allá de las conversaciones generadas, ni si hubo RLHF o DPO; tampoco se describen innovaciones de atención o decodificación.

Los datos de entrenamiento son 2.000 conversaciones generadas sintéticamente sobre 30 aplicaciones ficticias (pedidos, tickets, clínicas, flotas, facturas, etc.). Cada aplicación define su propio system prompt, nombres de herramientas, nombres de argumentos y enumeraciones, con el objetivo de que el modelo aprenda enrutado transferible entre dominios. Los errores deliberados introducidos en las conversaciones (por ejemplo, una llamada incorrecta antes de un reintento) se usan solo como contexto y no como objetivos de entrenamiento. El modelo emplea el formato `<tool_call>` propio de Qwen y la plantilla de chat sin modo de pensamiento (non-thinking). La evaluación se realizó con decodificación greedy sobre 6 aplicaciones excluidas del entrenamiento y sobre el prompt exacto de una aplicación real de análisis de crédito.

## Capacidades

- Enrutado de herramientas (tool routing): selecciona la herramienta adecuada y genera sus argumentos en el formato `<tool_call>` de Qwen.
- Function calling en aplicaciones con system prompts que declaran herramientas en el formato `<tools>...</tools>` y devuelven resultados como `<tool_response>`.
- Búsqueda de registros concretos: recupera un registro mediante herramienta incluso cuando una lista mostrada previamente no lo incluía.
- Derivación a herramientas de juicio o recomendación: ante preguntas de opinión, conocimiento general o recomendación, llama a la herramienta experta de la aplicación en lugar de responder por sí mismo.
- Ejecución de acciones (aprobar, cancelar, etc.) únicamente cuando el usuario las pide de forma explícita.
- Respuesta vacía deliberada tras una herramienta de visualización: cuando la vista ya es la respuesta, el modelo no genera texto adicional.
- Conversación trivial y aclaraciones: responde con una línea corta sin datos factuales.
- Generalización a herramientas nuevas: en la evaluación del autor, llamó correctamente a tres herramientas añadidas después del entrenamiento (`show_chart`, `show_table`, `design_view`) con los argumentos correctos.
- Capacidades multilingües: no disponible.
- No incorpora visión, audio, modo de pensamiento ni razonamiento matemático como capacidades propias; no genera hechos ni cifras.

## Casos de uso

- Enrutador de herramientas en asistentes de negocio embebidos en el navegador: el modelo se carga con WebLLM sobre WebGPU y decide qué función invocar en cada turno; al ejecutarse en el cliente, los datos del usuario no salen del dispositivo tras la primera descarga.
- Análisis de crédito y underwriting: es el escenario de la demo publicada (`tfukkwang/credit-copilot-demo`), con 10 herramientas. El modelo enruta consultas de expedientes, cálculos y visualizaciones, y delega la redacción del dictamen en una herramienta experta o en un modelo mayor.
- Copilotos de back office sobre APIs internas (pedidos, tickets, facturas, flotas): cada aplicación define sus propias herramientas y enumeraciones en el system prompt; el modelo selecciona la función y rellena argumentos tipados sin necesidad de reentrenar.
- Capa de enrutado previa a un LLM grande: el modelo clasifica la intención y emite la llamada, y un modelo mayor o un motor de reglas redacta el texto final, lo que reduce coste y latencia del modelo grande.
- Agentes multi-paso con tool calling: el modelo soporta ciclos de `<tool_call>` y `<tool_response>` con reintentos, lo que permite cadenas de consulta-acción-verificación dentro de una aplicación.
- Demos y prototipos de agentes sin instalación: al distribuirse en formato MLC y ejecutarse en el navegador, sirve para validar flujos de herramientas con stakeholders sin desplegar infraestructura de GPU.
- Aplicaciones con requisitos de privacidad o conectividad limitada: el cómputo es local (WebGPU) y, tras la descarga inicial, funciona sin conexión.
- Control de acciones sensibles con confirmación explícita: el modelo solo emite la herramienta de acción cuando el usuario la pide literalmente, lo que encaja en flujos de aprobación que exigen confirmación humana (véanse las advertencias sobre reintentos).

## Benchmarks y rendimiento

El autor publica una única evaluación, con decodificación greedy, sobre aplicaciones y prompts no vistos durante el entrenamiento:

| Conjunto de evaluacion | Qwen3.5-2B original | Este modelo |
|---|---|---|
| Aplicaciones no vistas (150 casos) | 73/150 | 150/150 |
| Prompt de aplicacion real (18 casos) | 8/15 | 18/18 |

Nota: la model card etiqueta la segunda fila como 18 casos pero consigna el valor del modelo base como 8/15; se reproduce tal cual figura en la fuente. Los casos de la aplicación real incluyen 3 herramientas añadidas después del entrenamiento (`show_chart`, `show_table`, `design_view`), que el modelo invocó con los argumentos correctos.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- Pesos publicados: 1,1 GB en cuantización MLC `q4f32_1`, pensados para ejecución en navegador con WebLLM y WebGPU.
- Memoria estimada en el navegador: una fuente externa indica 1010 MB de descarga y unos 2,2 GB de memoria para Qwen3.5-2B en ejecución web, aunque corresponde a otro runtime y no a este paquete MLC concreto.
- VRAM estimada para el modelo base completo en bf16: alrededor de 4 GB solo de pesos (2.000 millones de parámetros a 2 bytes), más caché KV y sobrecarga del runtime; estimación aritmética, no un dato publicado.
- GPU de consumo: sí cabe. El fine-tune se realizó en una RTX 3070 en unos 25 minutos (LoRA r=16, bf16), y la inferencia requiere una GPU con soporte de WebGPU y del orden de 2 GB de memoria libre.
- GPU de datacenter: no se documentan requisitos ni pruebas en A100, H100 u otras; el modelo está orientado a cliente.
- Opciones de despliegue: WebLLM (`@mlc-ai/web-llm` 0.2.85) mediante `appConfig` con `model_id` propio y la librería WASM oficial de Qwen3.5-2B; también MLC LLM. No se publican GGUF ni safetensors, por lo que su uso en llama.cpp, Ollama, TGI o vLLM exigiría una conversión propia no documentada.
- Ajustes de inferencia recomendados: `temperature: 0` (greedy), sin `presence_penalty`, `extra_body: { enable_thinking: false }` y `stop: ["<|im_start|>"]` (WebLLM no siempre se detenía en `<|im_end|>` tras una respuesta vacía).
- Latencia y throughput: no disponible (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Enrutado de herramientas | Idiomas | Licencia | Formato y disponibilidad |
|---|---|---|---|---|---|
| tfukkwang/Qwen3.5-2B-tool-router-q4f32_1-MLC | ~2B | 150/150 en apps no vistas y 18/18 en app real (evaluación del autor) | No disponible | Apache-2.0 | MLC/WebLLM, 1,1 GB, 0 descargas |
| Qwen/Qwen3.5-2B (base) | ~2B | 73/150 en apps no vistas y 8/15 en app real | Multilingüe según la serie (Qualcomm AI Hub) | Apache-2.0 | No disponible en la información recogida |
| mlc-ai/Qwen3.5-2B-q4f32_1-MLC (build oficial) | ~2B | Mismo comportamiento que el base; sin ajuste específico de enrutado | Multilingüe según la serie | Apache-2.0 (no confirmado en los resultados de búsqueda) | MLC/WebGPU, descarga de 1010 MB según una fuente externa |

No se han encontrado en la información disponible otros modelos comparables de enrutado de herramientas en la franja de 2.000 millones de parámetros para navegador: no disponible.

## Limitaciones y advertencias

- No es un modelo de chat general: está entrenado solo para enrutado de herramientas y no debe usarse para responder preguntas abiertas.
- No genera hechos ni cifras: toda la información mostrada al usuario debe proceder de una herramienta. Cualquier número que emita por sí mismo carece de garantía.
- Reintentos peligrosos tras una acción fallida: la model card documenta un caso en el que, tras fallar un "Reject", el modelo reintentó con "Approve". No se deben reintentar automáticamente las herramientas de acción; la lógica de reintento debe imponerse en la aplicación.
- Reintentos con valores válidos pero incorrectos: tras un error de argumento, el modelo puede reintentar con otro valor que pasa la validación formal pero no es el correcto. Los mensajes de error que nombran el campo correcto ayudan.
- Respuestas vacías ante preguntas directas: en ocasiones devuelve una respuesta vacía a una pregunta simple; esas consultas deben redirigirse a la herramienta experta.
- Dependencia del formato: requiere el formato de Qwen (`<tools>`, `<tool_call>`, `<tool_response>`) y la plantilla de chat sin modo de pensamiento. El uso de `presence_penalty` rompe las llamadas JSON.
- Evaluación limitada y autoinformada: 150 casos de apps no vistas y 18 de una app real, con decodificación greedy y sin comparación con jueces externos ni benchmarks estándar. Las cifras proceden del propio autor.
- Idiomas y longitud de contexto sin documentar, lo que impide planificar despliegues multilingües o con contexto largo sin pruebas propias.
- Sesgos conocidos: no disponible (la model card no incluye análisis de sesgos).
- Riesgo de alucinación: acotado por diseño en el dominio de datos (el modelo no produce hechos), pero no evaluado en otros dominios.
- Estado de validación: modelo de comunidad con 0 descargas y 0 likes, creado el 30 de septiembre de 2026, sin terceros que hayan reproducido la evaluación.
- Licencia: Apache-2.0, que permite uso comercial, pero la propia model card enlaza la licencia del modelo base Qwen3.5-2B; conviene revisarla antes de un despliegue en producción.
- La información sobre la serie Qwen3.5 en fuentes externas menciona una base unificada de visión y lenguaje, pero no hay datos que confirmen capacidades de visión en la variante de 2B ni en este ajuste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tfukkwang/Qwen3.5-2B-tool-router-q4f32_1-MLC
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/LICENSE
- Build oficial MLC del modelo base: https://huggingface.co/mlc-ai/Qwen3.5-2B-q4f32_1-MLC
- Librería WASM WebGPU utilizada: https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-models/v0_2_84/base/Qwen3.5-2B-q4f32_1_cs1k-webgpu.wasm
- WebLLM (runtime en navegador): https://webllm.mlc.ai/
- Paquete npm del runtime: https://esm.run/@mlc-ai/web-llm@0.2.85
- Demo del autor (analisis de credito): https://huggingface.co/spaces/tfukkwang/credit-copilot-demo
- Qwen3.5-2B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_2b
- Referencia externa de ejecucion en navegador de Qwen3.5-2B: https://browserbasedtools.com/tools/ai/browser-based-ai-chat/models/qwen3-5-2b
- Repositorio de la serie Qwen3.5 en GitHub: https://github.com/ABDtmx/Qwen3.5
- Proyecto `webllm-qwen` con el pipeline de entrenamiento y el registro de experimentos (`finetune/gen_router.py`, `finetune/eval_tools.py`, `EXPERIMENT.md`): mencionado en la model card, sin URL pública en la información disponible.
