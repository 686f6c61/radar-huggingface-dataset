# swetLAB/manuelafolda-bigngold

## Resumen

ManuelaFolda bigNgold es un agente conversacional definido mediante un prompt de sistema, no un modelo de lenguaje independiente. Fue creado por el laboratorio swetLAB mediante un proceso de "génesis colaborativa" en la herramienta Agent Swarm Studio, donde la personalidad se define primero y las capacidades emergen durante la extracción de la persona. El agente se presenta como "Clarity that serves (Singularity)" y está diseñado para ofrecer orientación ética, comunicación de incertidumbre, análisis de patrones e incentivos, y apoyo en responsabilidad y reparación.

El repositorio no contiene pesos de red neuronal ni arquitectura de modelo; en su lugar, proporciona un archivo `agent.json` y un prompt de sistema listo para inyectar en cualquier modelo que acepte instrucciones de sistema (GPT, Claude, modelos open source). Su relevancia radica en que ejemplifica un enfoque de diseño de agentes basado en valores y disposición, más que en capacidades técnicas predefinidas. La licencia es CC BY-SA 4.0, lo que permite compartir y modificar libremente con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de lenguaje; es una definicion de agente) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (depende del modelo base al que se inyecte) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | no disponible (el repositorio contiene `agent.json` y un prompt de sistema) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre arquitectura, datos de entrenamiento o proceso de optimizacion. El repositorio describe un agente formado mediante "extraccion de persona" en Agent Swarm Studio, donde las capacidades emergen durante la formacion inicial. No hay pesos, tokenizador ni configuracion de modelo. El unico artefacto tecnico es un archivo `agent.json` con una definicion legible por maquina y un prompt de sistema que debe ser utilizado como instruccion inicial en un modelo base externo.

## Capacidades

- Orientacion ajustada a la capacidad del interlocutor (capacidad fluida, en evolucion).
- Apoyo en responsabilidad y reparacion de danos (capacidad anclada).
- Comunicacion de incertidumbre sin afirmar certezas no respaldadas (capacidad anclada).
- Analisis de patrones e incentivos en situaciones complejas (capacidad anclada).
- Establecimiento de limites consciente del dano (capacidad anclada).
- Discernimiento etico, separando personas de patrones daninos (capacidad anclada).
- No puede actuar fuera de la conversacion; sus capacidades son cognitivas y conversacionales, no ejecutivas.

## Casos de uso

- Acompanamiento en dilemas eticos personales: el agente ayuda a separar emociones de patrones de comportamiento, ofreciendo distinciones practicas y limites proporcionados.
- Mediacion en conflictos interpersonales: su disposicion umbral y su valor de no coercion permiten facilitar conversaciones dificiles sin tomar partido.
- Apoyo en procesos de responsabilidad y reparacion: guia a personas o equipos para reconocer danos, asumir consecuencias y disenar pasos de reparacion.
- Analisis de incentivos en entornos organizativos: identifica patrones ocultos que impulsan comportamientos problematicos y sugiere intervenciones proporcionadas.
- Comunicacion de incertidumbre en contextos cientificos o tecnicos: traduce lenguaje simbolico o emocional a distinciones claras y pasos accionables sin sobreafirmar.
- Practica de establecimiento de limites saludables: entrena a usuarios en decir "no" de forma consciente y no danina, especialmente en relaciones de poder asimetricas.
- Reflexion personal guiada: ofrece un espacio conversacional para explorar valores, miedos y decisiones sin juicio ni grandiosidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no ser un modelo autonomo, su rendimiento depende enteramente del modelo base al que se inyecte el prompt de sistema.

## Requisitos de hardware

- No aplica directamente: el agente no requiere hardware propio, ya que se ejecuta sobre un modelo base externo.
- Para usarlo, se necesita un modelo que acepte prompts de sistema (GPT, Claude, Llama, Mistral, etc.) y la infraestructura correspondiente a ese modelo.
- Si se despliega con un modelo open source local, los requisitos de VRAM y GPU dependen del tamano del modelo base elegido (por ejemplo, 7B en una RTX 3090, 70B en A100, etc.).
- Opciones de despliegue: cualquier servidor de inferencia que soporte system prompts (vLLM, llama.cpp, Ollama, TGI, etc.).

## Comparativa con modelos similares

No disponible. Este repositorio no contiene un modelo de lenguaje comparable; es una definicion de agente de persona. No existen alternativas directas en el mismo formato dentro de la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo independiente: requiere un modelo base externo para funcionar; sin el, no hay inferencia posible.
- Sus capacidades declaradas son emergentes y no verificadas mediante evaluaciones objetivas; dependen de la interpretacion del modelo base.
- No puede actuar en el mundo real: no tiene acceso a herramientas, APIs ni ejecucion de codigo, salvo que el modelo base las soporte.
- La licencia CC BY-SA 4.0 permite uso comercial y modificacion, pero exige compartir derivados bajo la misma licencia y atribuir al autor.
- No se especifican sesgos ni riesgos de alucinacion, pero al ser un prompt de sistema, hereda los sesgos y limitaciones del modelo base.
- La fecha de creacion (2026-08-24) es futura respecto a la fecha actual, lo que sugiere que el repositorio puede ser experimental o tener metadatos incorrectos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/swetLAB/manuelafolda-bigngold
- Organizacion swetLAB: https://huggingface.co/swetLAB/SWETLAB
