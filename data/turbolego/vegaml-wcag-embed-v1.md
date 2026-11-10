# Turbolego/vegaml-wcag-embed-v1

## Resumen

vegaml-wcag-embed-v1 es un modelo derivado de Qwen/Qwen3.5-0.8B publicado por Turbolego que aplica una edicion de pesos en forma cerrada (closed-form weight editing) para inyectar la habilidad de responder preguntas sobre los 63 criterios de exito de WCAG 2.2, el estandar de accesibilidad web del W3C. El modelo forma parte de la linea de investigacion vegaml, centrada en modelos de decision no autorregresivos construidos mediante edicion de pesos, y sirve como demostracion tecnica de inyeccion de habilidades ("skill embedding") sobre un modelo base ya existente.

La intervencion se limita a la matriz `down_proj` de la capa 23 del transformer del modelo base, sin reentrenamiento completo. El autor reporta una precision del 95% en el conjunto de test sobre el dataset `wcag-63-questions`, aunque advierte explicitamente de que el modelo base ya alcanza esa precision por si mismo y que la edicion no mejora el rendimiento en validacion, pudiendo incluso degradarlo (la accuracy de validacion del profesor vegaml es del 90%).

Por tanto, se trata de un artefacto de investigacion y demostracion mas que de un modelo de produccion: su interes esta en el metodo de edicion de pesos y en la evaluacion de si una habilidad de dominio puede codificarse en un numero reducido de parametros, no en una mejora medible sobre el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5 (tag `qwen3_5_text`); edicion en `down_proj` de la capa 23 |
| Parametros totales | no disponible (heredados de Qwen/Qwen3.5-0.8B, aprox. 0.8B por el nombre del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (el repo contiene `config.json`, `tokenizer.json`, `tokenizer_config.json`, `chat_template.jinja`, `generation_config.json`, `edit_metadata.json`; no se listan ficheros de pesos en la informacion proporcionada) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer de tipo texto (tag `qwen3_5_text`) de aproximadamente 0,8 mil millones de parametros. Sobre esa base, Turbolego aplica una edicion de pesos en forma cerrada sobre la matriz `down_proj` de la capa 23, una tecnica que modifica directamente un subconjunto de pesos para codificar una habilidad concreta (en este caso, responder a las 63 preguntas de criterios de exito de WCAG 2.2) sin pasar por un ciclo de fine-tuning clasico con descenso de gradiente sobre todo el modelo.

El autor describe el resultado como un "skill embedding" de pregunta-decision cerrada: la habilidad se representa como una modificacion de pesos determinista. No se especifican en la informacion disponible el volumen de datos de entrenamiento, la composicion del dataset, ni si hubo RLHF, DPO u otras etapas de alineacion. La model card indica que el profesor vegaml obtiene un 90% de precision en validacion y que el modelo base sin editar ya alcanza el 95% en test, por lo que la edicion no aporta mejora y puede degradar el rendimiento en validacion.

## Capacidades

- Respuesta a preguntas sobre los 63 criterios de exito de WCAG 2.2 (nivel de conformidad, requisitos, interpretacion).
- Generacion de texto y razonamiento heredados del modelo base Qwen3.5-0.8B.
- Soporte de plantilla de chat (`chat_template.jinja` incluido en el repositorio).
- Capacidad de "skill embedding" mediante edicion de pesos: el modelo demuestra que una habilidad de dominio puede codificarse en un subconjunto de parametros.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponibles (el tag indica modelo de texto).

## Casos de uso

- Auditoria de accesibilidad asistida: el modelo puede clasificar y responder preguntas sobre criterios concretos de WCAG 2.2 (por ejemplo, si un componente cumple el criterio 1.4.3 de contraste), útil como primer filtro en revisiones de accesibilidad antes de la validacion manual.
- Formacion de equipos de desarrollo: servir como base para un asistente interno que explique los 63 criterios de exito a desarrolladores y disenadores, con respuestas acotadas al dominio.
- Investigacion sobre edicion de pesos: utilizar el modelo como caso de estudio reproducible para evaluar tecnicas de closed-form weight editing y su impacto real frente al modelo base.
- Evaluacion de "skill injection": emplear el repositorio y el dataset `wcag-63-questions` como banco de pruebas para comparar metodos de inyeccion de habilidades en modelos pequenos.
- Prototipado de herramientas de conformidad: integrar el modelo en un pipeline que, dado un fragmento de interfaz descrito en texto, devuelva el criterio WCAG 2.2 potencialmente incumplido, con validacion humana posterior.
- Demostracion en navegador: el demo publicado usa backend WASM, lo que permite ejecutar el modelo en el cliente sin infraestructura GPU, adecuado para talleres y demostraciones de accesibilidad.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Question answering (criterios de exito WCAG 2.2) | `turbolego/wcag-63-questions` | accuracy | 0.95 |

El autor indica ademas que el modelo base Qwen/Qwen3.5-0.8B ya alcanza el 95% en test y que la edicion no mejora el rendimiento en validacion (el profesor vegaml obtiene un 90% en validacion). No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Por el tamano del modelo base (~0,8B parametros), en fp16 requeriria aproximadamente 1,6 GB de VRAM, y en cuantizaciones de 8 o 4 bits alrededor de 0,8 GB y 0,4 GB respectivamente; estas cifras son estimaciones a partir del tamano del modelo base, no datos publicados.
- GPU recomendadas: no disponibles. Por tamano, cabria en GPUs consumer como RTX 3060, RTX 4060 o superiores, asi como en Apple Silicon.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del modelo base; no confirmado por el autor.
- Opciones de despliegue: no disponibles en la informacion proporcionada. El demo oficial usa backend WASM en navegador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vegaml-wcag-embed-v1 | ~0,8B (base) | no disponible | Edicion de pesos sobre Qwen3.5-0.8B para WCAG 2.2 | apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (modelo base) | ~0,8B | no disponible | Transformer de texto generalista | no disponible en la informacion | Hugging Face |
| Alternativas especificas de accesibilidad | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria (inyeccion de habilidades WCAG mediante edicion de pesos) en la informacion proporcionada.

## Limitaciones y advertencias

- La edicion de pesos no mejora al modelo base: el autor reconoce que el modelo base ya alcanza el 95% en test y que la edicion puede degradar el rendimiento en validacion (90% del profesor vegaml). No debe presentarse como una mejora de rendimiento.
- El resultado del benchmark (0.95 de accuracy) no esta verificado de forma independiente (`verified: false`).
- Riesgo de alucinacion: como modelo generativo de ~0,8B, puede producir respuestas plausibles pero incorrectas sobre criterios WCAG, especialmente en casos limite o interpretaciones normativas.
- Ambito muy restringido: la habilidad inyectada se limita a los 63 criterios de exito de WCAG 2.2; no cubre otras normativas de accesibilidad ni evaluaciones sobre interfaces reales.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento adecuado en castellano u otros idiomas distintos del usado en el dataset de evaluacion.
- Contexto maximo no documentado: limita la planificacion de despliegues con documentos largos.
- Ficheros de pesos no listados en la informacion disponible: conviene verificar el repositorio antes de asumir un formato de carga concreto.
- Uso comercial: la licencia apache-2.0 lo permite, pero al derivar de Qwen/Qwen3.5-0.8B deben respetarse tambien las condiciones del modelo base.
- No apto como sustituto de una auditoria de accesibilidad profesional: cualquier salida debe validarse por expertos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Turbolego/vegaml-wcag-embed-v1
- Organizacion Turbolego: https://huggingface.co/Turbolego
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio GitHub: https://github.com/turbolego/vegaml-wcag
- Demo: https://turbolego.github.io/vegaml-wcag/wcag-demo/?backend=wasm
- Dataset de evaluacion: `turbolego/wcag-63-questions` (referenciado en el model-index)
