# varuns2002/notebooks

## Resumen

El repositorio `varuns2002/notebooks` no es un modelo de inteligencia artificial, sino una coleccion de cuadernos Jupyter (notebooks) asociados al curso de agentes de Hugging Face. Segun la propia model card, estos cuadernos forman parte del material practico del Hugging Face Agents Course, un programa formativo centrado en la construccion de agentes basados en modelos de lenguaje. El autor del repositorio en Hugging Face es el usuario `varuns2002`, que actua como anfitrion de estos cuadernos con licencia Apache 2.0.

El contenido se organiza por unidades didacticas que cubren distintas librerias y frameworks de agentes: una libreria de agente basica ("Dummy Agent Library") en la unidad 1, `smolagents` en la unidad 2.1 (agentes de codigo, multiagente, recuperacion, tool calling, herramientas y agentes de vision), `LlamaIndex` en la unidad 2.2 (agentes, componentes, herramientas y flujos de trabajo) y `LangGraph` en la unidad 2.3 (agente y clasificacion de correo). Ademas incluye una unidad bonus sobre ajuste supervisado (SFT) y llamada a funciones con Gemma, y otra sobre monitorizacion y evaluacion de agentes.

Es relevante ahora porque la formacion practica en torno a agentes de IA es uno de los focos principales del ecosistema open source, y estos cuadernos ofrecen ejemplos reproducibles con frameworks de referencia. Sin embargo, conviene subrayar que no contiene pesos, tokenizador ni arquitectura propia: es material didactico, no un artefacto de modelo. Cualquier ficha tecnica de modelo aplicada a este repositorio carece de sentido en la mayoria de sus apartados, por lo que los campos correspondientes se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo; es un repositorio de cuadernos Jupyter) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los cuadernos estan redactados en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (el repositorio contiene ficheros `.ipynb` y `.py`) |

## Arquitectura y entrenamiento

No existe arquitectura neuronal ni proceso de entrenamiento asociado a este repositorio. El contenido son cuadernos Jupyter y algun script en Python (por ejemplo, `vision_web_browser.py`) que ilustran el uso de frameworks de agentes como `smolagents`, `LlamaIndex` y `LangGraph`. La model card original incluye un indice de cuadernos organizado por unidades, con enlaces de redireccion al repositorio `huggingface.co/agents-course/notebooks`.

No se documentan en la informacion proporcionada datos sobre volumen de entrenamiento, composicion del dataset, tecnicas de alineacion (RLHF, DPO) ni innovaciones de arquitectura como decodificacion especulativa o atencion lineal. La mencion a Gemma y a "Thinking Function Call" en la unidad bonus se refiere a ejemplos de ajuste supervisado y llamada a funciones sobre ese modelo, no a que este repositorio contenga un modelo entrenado.

## Capacidades

- No aplica como modelo: el repositorio no genera texto, no razona y no ejecuta inferencia.
- Funciona como material didactico para construir agentes de IA con distintas librerias.
- Incluye ejemplos de agentes basados en codigo (`smolagents`, unidad 2.1).
- Incluye ejemplos de sistemas multiagente (cuaderno "Multi-agent Notebook").
- Incluye ejemplos de agentes de recuperacion (retrieval agents) y de tool calling.
- Incluye ejemplos de agentes de vision y navegacion web guiada por vision.
- Incluye ejemplos con `LlamaIndex` (agentes, componentes, herramientas y flujos de trabajo).
- Incluye ejemplos con `LangGraph` (agente y clasificacion de correo).
- Incluye una unidad bonus sobre SFT y llamada a funciones con Gemma.
- Incluye una unidad bonus sobre monitorizacion y evaluacion de agentes.

## Casos de uso

- Formacion de desarrolladores en construccion de agentes: el repositorio sirve como material practico para seguir el Hugging Face Agents Course paso a paso, con cuadernos ejecutables por unidad.
- Prototipado rapido de agentes con `smolagents`: los cuadernos de la unidad 2.1 permiten arrancar agentes de codigo, tool calling y recuperacion con ejemplos ya escritos.
- Implementacion de sistemas multiagente: el cuaderno "Multi-agent Notebook" sirve como plantilla para coordinar varios agentes en una misma tarea.
- Construccion de agentes de vision y automatizacion web: los cuadernos de vision y el script `vision_web_browser.py` permiten experimentar con navegacion basada en capturas de pantalla.
- Orquestacion de flujos con `LlamaIndex` y `LangGraph`: los cuadernos de las unidades 2.2 y 2.3 muestran patrones de componentes, herramientas, workflows y clasificacion de tareas.
- Ajuste fino y llamada a funciones sobre Gemma: la unidad bonus 1 ofrece un ejemplo de SFT y "thinking function call" reutilizable como punto de partida.
- Monitorizacion y evaluacion de agentes en produccion: la unidad bonus 2 aporta ejemplos de observabilidad y evaluacion que se pueden adaptar a pipelines propios.
- Docencia universitaria o bootcamps: el indice estructurado por unidades facilita reutilizar los cuadernos como ejercicios guiados en cursos de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio no es un modelo evaluable con metricas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- No aplica VRAM para inferencia: no hay pesos ni modelo que cargar.
- Para ejecutar los cuadernos se necesita un entorno con Python y Jupyter (local o en la nube, por ejemplo Google Colab o Hugging Face Spaces).
- Algunos cuadernos invocan modelos remotos o APIs de terceros; en esos casos el coste y la latencia dependen del proveedor, no de hardware local.
- Para ejemplos con modelos ejecutados en local (por ejemplo variantes de Gemma en la unidad bonus 1), los requisitos dependerian del modelo concreto elegido; no se especifican en la informacion proporcionada.
- Opciones de despliegue de los cuadernos: JupyterLab, Jupyter Notebook, VS Code con extension Jupyter o entornos alojados en la nube.
- No se dispone de datos de latencia ni throughput, ya que no se trata de un artefacto de inferencia.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo y, por tanto, no admite comparacion con alternativas de la misma categoria en terminos de parametros, contexto, rendimiento o disponibilidad. Como material didactico podria compararse con otros repositorios de cursos, pero la informacion proporcionada no incluye elementos de comparacion.

## Limitaciones y advertencias

- No es un modelo: no debe confundirse ni citarse como tal en evaluaciones tecnicas.
- La model card esta en ingles; no se declaran idiomas soportados para ningun componente del repositorio.
- El numero de descargas y likes es cero, y la fecha de creacion y actualizacion indicada (2026) resulta poco habitual; conviene verificar la vigencia del repositorio.
- Los cuadernos dependen de librerias externas (`smolagents`, `LlamaIndex`, `LangGraph`) que evolucionan rapidamente; pueden aparecer incompatibilidades con versiones nuevas.
- Algunos ejemplos requieren claves de API o acceso a servicios externos, lo que introduce dependencias ajenas al repositorio.
- La licencia Apache 2.0 permite uso comercial y modificacion del material, siempre que se respeten las condiciones de atribucion; no obstante, los cuadernos pueden incorporar contenido de terceros con licencias propias.
- Riesgo de resultados desactualizados: los ejemplos de agentes pueden no reflejar las practicas recomendadas en el momento de su consulta.
- El repositorio es material educativo; no incluye garantias de soporte, mantenimiento ni correccion de errores.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/varuns2002/notebooks
- Curso de agentes de Hugging Face: https://huggingface.co/learn/agents-course/unit0/introduction
- Repositorio de cuadernos del curso: https://huggingface.co/agents-course/notebooks
- Unidad 1, Dummy Agent Library: https://huggingface.co/agents-course/notebooks/blob/main/unit1/dummy_agent_library.ipynb
- Unidad 2.1, Code Agents: https://huggingface.co/agents-course/notebooks/blob/main/unit2/smolagents/code_agents.ipynb
- Unidad 2.1, Multi-agent Notebook: https://huggingface.co/agents-course/notebooks/blob/main/unit2/smolagents/multiagent_notebook.ipynb
- Unidad 2.1, Retrieval Agents: https://huggingface.co/agents-course/notebooks/blob/main/unit2/smolagents/retrieval_agents.ipynb
- Unidad 2.1, Tool Calling Agents: https://huggingface.co/agents-course/notebooks/blob/main/unit2/smolagents/tool_calling_agents.ipynb
- Unidad 2.1, Tools: https://huggingface.co/agents-course/notebooks/blob/main/unit2/smolagents/tools.ipynb
- Unidad 2.1, Vision Agents: https://huggingface.co/agents-course/notebooks/blob/main/unit2/smolagents/vision_agents.ipynb
- Unidad 2.1, Vision Web Browser: https://huggingface.co/agents-course/notebooks/blob/main/unit2/smolagents/vision_web_browser.py
- Unidad 2.2, Agents (LlamaIndex): https://huggingface.co/agents-course/notebooks/blob/main/unit2/llama-index/agents.ipynb
- Unidad 2.2, Components: https://huggingface.co/agents-course/notebooks/blob/main/unit2/llama-index/components.ipynb
- Unidad 2.2, Tools: https://huggingface.co/agents-course/notebooks/blob/main/unit2/llama-index/tools.ipynb
- Unidad 2.2, Workflows: https://huggingface.co/agents-course/notebooks/blob/main/unit2/llama-index/workflows.ipynb
- Unidad 2.3, Agent (LangGraph): https://huggingface.co/agents-course/notebooks/blob/main/unit2/langgraph/agent.ipynb
- Unidad 2.3, Mail Sorting: https://huggingface.co/agents-course/notebooks/blob/main/unit2/langgraph/mail_sorting.ipynb
- Bonus Unit 1, Gemma SFT & Thinking Function Call: https://huggingface.co/agents-course/notebooks/blob/main/bonus-unit1/bonus-unit1.ipynb
- Bonus Unit 2, Monitoring & Evaluating Agents: https://huggingface.co/agents-course/notebooks/blob/main/bonus-unit2/monitoring-and-evaluating-agents.ipynb
