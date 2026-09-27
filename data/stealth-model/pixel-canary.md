# stealth-model/pixel-canary

## Resumen

Pixel Canary es un modelo de generacion de texto orientado a codigo, publicado bajo el identificador stealth-model/pixel-canary por el colectivo anonimo Stealth Models. Se distribuye en fase stealth (preview), sin pesos publicos: la model card indica explicitamente que los ficheros GGUF se publicaran "una vez los pesos del modelo esten disponibles", de modo que su uso actual se realiza a traves de APIs hospedadas y no mediante descarga local. La propia ficha se autodefine como "un modelo de codigo anonimo para construir aplicaciones, con una vena creativa".

El modelo se presenta en su web como un "modelo grande anonimo" con capacidades de codigo destacadas y esfuerzo de razonamiento ajustable, orientado al desarrollo de aplicaciones web y moviles. Su relevancia actual radica en que esta disponible de forma gratuita durante la fase de preview en Vercel AI Gateway y en la herramienta de agente Cline, y en que su resultado en el benchmark de Next.js de Vercel (28 de 31 tareas superadas) lo situa, segun esa fuente, a la altura de GPT-6 Astra en esa misma prueba.

No se han hecho publicos datos de arquitectura, numero de parametros, longitud de contexto, licencia ni idiomas soportados, por lo que buena parte de las especificaciones tecnicas figuran como no disponibles. Las etiquetas declaradas (reasoning, coding, svg, text-generation) son el unico indicio funcional explicito de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se ha confirmado si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; no hay pesos publicos |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible; se anuncia publicacion futura en GGUF |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo. La ficha de HuggingFace no incluye detalles de tipo de red (transformer, MoE, hibrida o SSM), dimension del modelo, numero de capas, cabezas de atencion ni mecanismo de atencion. Tampoco hay cifras de contexto maximo. Las unicas etiquetas funcionales declaradas son reasoning, coding y svg, ademas de text-generation, lo que sugiere un modelo con modo de razonamiento explicito y generacion de graficos vectoriales, pero se trata de una inferencia a partir de etiquetas, no de un dato tecnico confirmado.

Tampoco hay informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de tecnicas de post-entrenamiento (RLHF, DPO, RLVR) ni innovaciones de decodificacion. La fuente de Vercel menciona "esfuerzo de razonamiento ajustable" (adjustable reasoning effort), lo que implica la existencia de un parametro de control del nivel de razonamiento, pero no se detalla su implementacion. Por tanto, todos los datos de arquitectura y entrenamiento deben considerarse no disponibles.

## Capacidades

- Generacion de codigo: el modelo esta etiquetado como coding y su presentacion lo enfoca a construir y refinar aplicaciones, con enfasis declarado en resultados de Next.js.
- Desarrollo web y movil: la descripcion de Vercel lo situa como adecuado para "desarrollo de aplicaciones web y moviles".
- Razonamiento con esfuerzo ajustable: dispone de un parametro de esfuerzo de razonamiento segun la documentacion de Vercel AI Gateway.
- Generacion de SVG: la etiqueta svg aparece en la model card y la web del modelo menciona exhibicion de "SVG artwork".
- Uso en flujos de agente: se integra como modelo seleccionable en Cline (herramienta de codificacion con agente) y en Vercel AI Gateway, lo que implica uso en tareas multi-paso dentro de esas herramientas.
- Idiomas: no disponible. No se declara soporte multilingue ni lista de idiomas.
- Tool calling / function calling: no se detalla de forma explicita en la informacion disponible. Su integracion en herramientas de agente es compatible con ese uso, pero no hay confirmacion documental.
- Vision, audio u otras modalidades: no disponible. Solo se declara text-generation.

## Casos de uso

- Desarrollo de aplicaciones Next.js: el modelo esta optimizado segun su proveedor para tareas de Next.js y supera 28 de 31 tareas del benchmark interno de Vercel, por lo que encaja en la generacion y refactorizacion de rutas, componentes de servidor y logica de aplicaciones Next.js.
- Asistencia de codigo dentro del editor: al integrarse en Cline, puede usarse para completar, explicar y modificar codigo de forma interactiva dentro del flujo de trabajo del desarrollador, aprovechando su modo de razonamiento ajustable.
- Migracion y modernizacion de bases de codigo web: la combinacion de etiquetas coding y reasoning permite abordar tareas de refactorizacion de varios pasos, como actualizar dependencias o reescribir componentes.
- Generacion de graficos vectoriales en producto: la etiqueta svg y la mencion de "SVG artwork" lo hacen util para generar iconos, ilustraciones y assets vectoriales directamente desde texto, integrables en pipelines de diseno.
- Prototipado rapido de interfaces web y moviles: su enfasis en desarrollo de apps lo hace adecuado para generar esqueletos de aplicacion, pantallas y componentes iniciales antes de un refinamiento manual.
- Automatizacion de tareas de codigo en CI/CD: a traves de Vercel AI Gateway, que ofrece una API unificada con seguimiento de uso y coste, presupuestos por clave de API y reglas de enrutado, puede insertarse en flujos automatizados de revision o generacion de codigo.
- Evaluacion comparativa de modelos de codigo: durante su fase gratuita en preview, sirve para medir su comportamiento frente a otras alternativas en tareas de generacion de aplicaciones, sin coste de API.

## Benchmarks y rendimiento

| Benchmark | Pixel Canary | Referencia comparable |
|---|---|---|
| Benchmark de Next.js de Vercel (31 tareas) | 28 de 31 tareas superadas | GPT-6 Astra: mismo resultado (28 de 31) segun la fuente |
| MMLU | no disponible | no disponible |
| HumanEval | no disponible | no disponible |
| GSM8K | no disponible | no disponible |
| Otros benchmarks estandar | no disponible | no disponible |

No se han publicado resultados de benchmarks adicionales en la informacion disponible. El unico dato cuantitativo es el del benchmark de Next.js de Vercel, aportado por fuentes de prensa tecnologica y no por una evaluacion independiente.

## Requisitos de hardware

- Inferencia local: no aplicable en la actualidad, ya que no hay pesos publicos. No es posible estimar VRAM sin conocer el numero de parametros.
- Pesos cuantizados: la model card anuncia que se proporcionaran modelos GGUF "una vez los pesos del modelo esten disponibles", pero no hay fecha ni tipos de cuantizacion confirmados. Hasta entonces, no se puede determinar si cabria en una GPU de consumo.
- GPU recomendadas: no disponible, al no existir pesos descargables ni especificaciones de tamano.
- Despliegue: el acceso actual es via API, a traves de Vercel AI Gateway (identificador stealth/pixel-canary) y de la herramienta Cline durante el periodo de preview. No se ofrece despliegue con vLLM, llama.cpp, Ollama ni TGI porque no hay pesos.
- Latencia y throughput: no disponible. No se han publicado cifras de tokens por segundo ni de latencia para el endpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (Next.js Vercel, 31 tareas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pixel Canary | no disponible | no disponible | 28 de 31 | no disponible | API en preview (Vercel AI Gateway, Cline); pesos no publicos |
| GPT-6 Astra | no disponible | no disponible | 28 de 31 | no disponible | no disponible |

La informacion proporcionada solo permite comparar Pixel Canary con GPT-6 Astra en el benchmark de Next.js de Vercel, donde ambos superan 28 de 31 tareas. No hay datos publicos de parametros, contexto, licencia ni disponibilidad para GPT-6 Astra en las fuentes consultadas, ni se identifican otros modelos comparables con datos verificables. La comparativa con modelos open source equivalentes no esta disponible.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse licencia, se desconoce si el uso comercial esta permitido. Cualquier integracion en produccion deberia aclarar antes las condiciones legales.
- Ausencia de pesos: no se puede auditar, ejecutar en local ni desplegar en infraestructura propia. El uso queda atado al proveedor de la API.
- Modelo anonimo: el autor es un colectivo stealth y la propia web menciona "pistas de identidad", por lo que no hay informacion verificable sobre el origen de los datos de entrenamiento.
- Riesgo de alucinacion: no hay evaluaciones publicadas de fiabilidad, sesgos o tasas de error, un riesgo inherente a los modelos generativos de codigo.
- Estado de preview: la disponibilidad gratuita y la continuidad del endpoint pueden cambiar sin previo aviso; no es una base estable para dependencias criticas.
- Idiomas y contexto: se desconoce la ventana de contexto y el soporte de idiomas, por lo que no se puede garantizar el comportamiento en conversaciones largas ni en castellano.
- Falta de datos de rendimiento: no hay cifras de MMLU, HumanEval, GSM8K ni de latencia y throughput, lo que impide estimar coste y calidad en produccion.
- Trazabilidad de la evaluacion: el unico resultado disponible (28 de 31 en el benchmark de Next.js) proviene del ecosistema de Vercel, no de una evaluacion independiente.
- Politica de datos y privacidad: no disponible. Se desconoce si el proveedor retiene las peticiones enviadas a traves de la API.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/stealth-model/pixel-canary
- Pagina oficial del modelo: https://stealthmodels.com/pixel-canary/
- Portal de Stealth Models: https://stealthmodels.com/
- Pixel Canary en Vercel AI Gateway: https://vercel.com/ai-gateway/models/pixel-canary
- Anuncio de disponibilidad en Vercel AI Gateway: https://vercel.com/changelog/pixel-canary-is-now-available-in-stealth-for-free-on-ai-gateway
- Cobertura en AICrier: https://aicrier.com/post/savbxnpuffrs6dqwpgu2
- Cobertura en Tech and Business: https://techandbusiness.org/newswire/LJOSZbdLxaC55bzZa5dxpU
- Imagen de portada del modelo: https://stealthmodels.com/_shared/artwork/pixel-canary.webp
