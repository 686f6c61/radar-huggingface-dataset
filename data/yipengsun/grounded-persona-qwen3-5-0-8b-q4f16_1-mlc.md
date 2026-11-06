# yipengsun/grounded-persona-Qwen3.5-0.8B-q4f16_1-MLC

## Resumen

grounded-persona-Qwen3.5-0.8B-q4f16_1-MLC es una compilación cuantizada del modelo base Qwen/Qwen3.5-0.8B, publicada por el desarrollador yipengsun, orientada a la generación de respuestas "ancladas" (grounded generation) sobre una ficha de hechos que se inyecta en el system prompt. El modelo adopta la personalidad de la persona descrita en dicha ficha y responde en primera persona utilizando exclusivamente la información contenida en ella, con rechazos explícitos cuando la pregunta queda fuera del alcance del documento. No almacena hechos sobre ninguna persona concreta: la misma compilación sirve para cualquier individuo cambiando la ficha.

La relevancia técnica del artefacto reside en su formato de despliegue: está empaquetado para MLC-LLM y WebLLM, de modo que se ejecuta íntegramente en el navegador del visitante mediante WebGPU, sin enviar consultas a un servidor. La cuantización q4f16_1 reduce la descarga a unos 310 MB, y el autor ha recortado el vocabulario de 248.320 a 51.200 tokens para ahorrar aproximadamente 120 MB adicionales manteniendo la cobertura de ocho idiomas.

El modelo resuelve un problema acotado pero frecuente: ofrecer un asistente conversacional sobre una persona (investigador, profesional, creador) sin infraestructura de servidor ni riesgo de fuga de datos personales, ya que toda la inferencia ocurre en el dispositivo del usuario. Está pensado para incrustarse en páginas web personales como caja de preguntas y respuestas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5); no se detalla la variante exacta en la informacion disponible |
| Parametros totales | 0,8 mil millones (modelo base Qwen/Qwen3.5-0.8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4.096 tokens (context_window_size configurado en WebLLM) |
| Tipos de cuantizacion | q4f16_1 (pesos de 4 bits, activaciones en float16) |
| Idiomas soportados | en, de, zh, ja, fr, es, it, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | MLC (artefacto compilado para MLC-LLM/WebLLM, con biblioteca WebGPU `qwen3_5-0.8b-q4f16_1-vocab51200-webgpu.wasm`) |
| Tamano del repositorio | 0,8 GB |
| Tamano de descarga en navegador | aproximadamente 310 MB |
| Vocabulario | 51.200 tokens (reducido desde 248.320) |
| Libreria | mlc-llm / web-llm |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo es una compilación cuantizada del modelo base Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parametros. La model card no documenta detalles sobre el proceso de entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF o DPO, ni innovaciones de atencion), por lo que esa informacion debe consultarse en la ficha del modelo original de Qwen. Tampoco se especifica si el autor realizo ajuste fino adicional sobre el modelo base o si las capacidades de "grounding" provienen unicamente del prompt de sistema y del ajuste del modelo original.

La innovacion tecnica destacable de esta compilacion es doble. Por un lado, la cuantizacion q4f16_1 para MLC-LLM permite ejecutar el modelo en WebGPU dentro del navegador con un peso de descarga de unos 310 MB. Por otro, el autor ha recortado el vocabulario de 248.320 a 51.200 tokens conservando todos los tokens especiales, los 256 tokens de byte y los tokens mas frecuentes de los ocho idiomas soportados; esto mantiene la codificacion y decodificacion exacta de cualquier texto UTF-8 y reduce el tamano de descarga en unos 120 MB. El repositorio incluye la biblioteca WebGPU compilada especificamente porque WebLLM 0.2.86 no dispone de una precompilada para este vocabulario reducido.

## Capacidades

- Generacion de texto conversacional en primera persona, adoptando la identidad descrita en la ficha de hechos del system prompt.
- Generacion anclada (grounded generation): responde exclusivamente con la informacion de la ficha y rechaza preguntas no cubiertas con una negativa breve y el correo electronico publico de la ficha.
- Rechazo de detalles privados, opiniones, premisas falsas, tareas de proposito general y peticiones de ignorar sus reglas.
- Multilingue en ocho idiomas (en, de, zh, ja, fr, es, it, ko), respondiendo en el idioma solicitado por el visitante.
- Persistencia de instrucciones de idioma del tipo "a partir de ahora": la instruccion se mantiene hasta que el usuario la cambia.
- Preservacion literal de nombres, titulos de articulos, correos electronicos e identificadores.
- Seguimiento de instrucciones de formato simples: una frase, una lista, solo el valor, registro formal o informal.
- Manejo de referencias a turnos anteriores en conversaciones multiturno.
- Control de modo pensamiento mediante `enable_thinking: false`, recomendado por el autor junto con decodificacion greedy y temperatura 0.
- No se documentan capacidades de tool calling, function calling, vision, audio ni razonamiento multi-paso con agentes.

## Casos de uso

- Caja de preguntas y respuestas en una web personal o profesional: el modelo se incrusta con WebLLM y responde sobre la trayectoria, publicaciones y rol actual de la persona a partir de una ficha de hechos, sin que las preguntas del visitante salgan de su dispositivo.
- Asistente de perfil para investigadores: permite a lectores de una pagina academica consultar titulos de articulos, lineas de investigacion y datos de contacto, manteniendo los identificadores verbatim gracias a las instrucciones del prompt.
- Atencion de privacidad por diseno: al ejecutarse en el navegador con WebGPU, es adecuado para entornos donde no se permite enviar consultas a servidores externos (por ejemplo, cumplimiento de RGPD en sitios que recogen datos de visitantes).
- Demostraciones educativas de grounded generation: sirve como ejemplo reproducible de como un modelo pequeno con una ficha de hechos y reglas estrictas puede reducir alucinaciones sobre datos personales, con rechazo explicito ante informacion no cubierta.
- Prototipado rapido de asistentes de identidad para multiples personas: la misma compilacion responde sobre cualquier individuo cambiando la ficha del system prompt, lo que facilita desplegar varias instancias sin reentrenar.
- Integracion en sitios estaticos sin backend: al no requerir servidor de inferencia, encaja en paginas alojadas en CDN o GitHub Pages donde solo se dispone de HTML y JavaScript.
- Soporte multilingue para audiencias internacionales: responde en el idioma del visitante entre ocho idiomas y mantiene instrucciones de idioma persistentes durante la conversacion.

## Benchmarks y rendimiento

El autor publica una evaluacion propia en la que Claude Haiku califico cada respuesta de forma individual junto con el historial de chat generado por el modelo. No son benchmarks estandar (MMLU, HumanEval, GSM8K) sino pruebas de comportamiento especificas del caso de uso.

| Prueba | Correctas |
|---|---:|
| Preguntas de detalle sobre personas que el modelo nunca vio | 288 / 320 |
| Turnos de chat multiturno | 196 / 219 |
| Instrucciones de idioma explicitas o persistentes | 49 / 64 |
| Instrucciones de formato | 23 / 32 |
| Preguntas sobre el propietario del sitio | 65 / 80 |
| Verificacion en navegador con el modelo de 4 bits (63 turnos) | 60 / 63 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo de 0,8B en q4f16_1 ocupa aproximadamente 310 MB de descarga; la memoria necesaria en el dispositivo es del orden de varios cientos de MB, aunque la cifra exacta de VRAM no esta disponible en la informacion proporcionada.
- GPU recomendadas: cualquier GPU integrada o dedicada con soporte de WebGPU en el navegador; no se especifican modelos concretos (A100, H100, RTX 4090) en la documentacion.
- Compatibilidad con GPU de consumo: si, el modelo esta disenado para ejecutarse en el navegador del visitante mediante WebGPU, lo que incluye equipos de consumo con GPU compatibles.
- Opciones de despliegue: WebLLM (version 0.2.86 o superior) sobre WebGPU; el artefacto es de MLC-LLM, por lo que tambien puede ejecutarse con el runtime de MLC-LLM fuera del navegador si se dispone de la compilacion adecuada.
- Latencia y throughput: no disponibles en la informacion proporcionada; el autor solo indica que el modelo se cachea en el navegador tras la primera carga y que el vocabulario reducido acelera la carga.
- Almacenamiento: aproximadamente 310 MB de descarga inicial, almacenados en la cache del navegador.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada. A continuacion se comparan caracteristicas estructurales con alternativas plausibles de la misma categoria (modelos pequenos para despliegue en navegador o en dispositivo), indicando "no disponible" cuando no hay datos.

| Modelo | Parametros | Contexto | Licencia | Despliegue en navegador | Rendimiento comparado |
|---|---|---|---|---|---|
| grounded-persona-Qwen3.5-0.8B-q4f16_1-MLC | 0,8B | 4.096 | Apache 2.0 | Si (WebLLM/WebGPU) | 288/320 en preguntas de detalle (evaluacion propia) |
| Qwen/Qwen3.5-0.8B (modelo base) | 0,8B | no disponible | Apache 2.0 | Requiere compilacion MLC propia | no disponible |
| Otros modelos MLC-LLM de ~1B para WebLLM | ~1B | variable | variable | Si | no disponible |

La comparativa con alternativas concretas (por ejemplo, otros modelos de menos de 1.000 millones de parametros compilados para WebLLM) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Un modelo de 0,8B sigue cometiendo errores; el autor recomienda pedir a los visitantes que confirmen por correo electronico los detalles importantes.
- La calidad depende enteramente de la ficha de hechos: los datos ausentes producen rechazos, y una ficha incompleta o ambigua degrada las respuestas.
- Las fichas largas consumen el contexto de 4.096 tokens; el autor recomienda mantenerla por debajo de unos 2.000 tokens.
- Riesgo de alucinacion no eliminado: aunque el prompt exige usar solo la ficha, el modelo puede generar afirmaciones no respaldadas, especialmente en formatos o idiomas menos representados.
- Limitaciones de idioma: solo se garantiza cobertura de vocabulario para en, de, zh, ja, fr, es, it y ko; otros idiomas pueden codificarse en bytes pero sin garantia de calidad.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion proporcionada; al heredar el modelo base Qwen3.5-0.8B, puede arrastrar los sesgos de sus datos de entrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.5-0.8B y de la libreria MLC-LLM/WebLLM.
- Requiere un navegador con soporte de WebGPU; los navegadores o dispositivos sin WebGPU no pueden ejecutar el modelo.
- El artefacto esta compilado para una version concreta de WebLLM (0.2.86) y para un vocabulario reducido; actualizar la libreria puede requerir recompilar la biblioteca WebGPU.
- La evaluacion publicada la realizo Claude Haiku como juez automatico, no evaluadores humanos, lo que introduce posibles sesgos del evaluador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yipengsun/grounded-persona-Qwen3.5-0.8B-q4f16_1-MLC
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- WebLLM (repositorio): https://github.com/mlc-ai/web-llm
- Sitio del autor con la caja "Ask": https://yipengsun.com/
- CDN de WebLLM usado en el ejemplo: https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.86/lib/index.js
